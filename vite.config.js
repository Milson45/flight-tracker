import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* ============================================================
   Custom Vite Plugin: OpenSky Caching Proxy
   
   WHY: The OpenSky free API aggressively rate-limits (~100 req/day
   unauthenticated). A simple pass-through proxy hits 429 errors
   within minutes. This caching proxy solves it by:
   
   1. Caching successful responses for 10 seconds (matches poll interval)
   2. Serving STALE cached data when rate-limited (429) or on errors
   3. Deduplicating concurrent requests (only 1 in-flight at a time)
   
   Result: The user ALWAYS sees aircraft data — either fresh or
   slightly stale — and the API is hit at most once per 10 seconds.
   ============================================================ */
function openskyProxyPlugin() {
  // In-memory cache: stores the last successful API response
  let cache = {
    data: null,
    timestamp: 0,
  };

  // Prevent multiple simultaneous requests to OpenSky
  let inFlightRequest = null;

  const CACHE_TTL_MS = 10000; // 10 seconds — matches the polling interval

  return {
    name: 'opensky-caching-proxy',
    configureServer(server) {
      // This middleware intercepts all /api/opensky/* requests
      // BEFORE they reach the default Vite proxy
      server.middlewares.use('/api/opensky', async (req, res) => {
        const incomingUrl = new URL(req.url, 'http://localhost');
        const queryString = incomingUrl.search;

        // 1. Check if cache is fresh enough
        const cacheAge = Date.now() - cache.timestamp;
        if (cache.data && cacheAge < CACHE_TTL_MS) {
          console.log(`[OpenSky Proxy] Cache HIT (age: ${Math.round(cacheAge / 1000)}s)`);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-Cache', 'HIT');
          res.end(JSON.stringify(cache.data));
          return;
        }

        // 2. If another request is already in-flight, wait for it
        //    then serve whatever we have (fresh or stale)
        if (inFlightRequest) {
          console.log('[OpenSky Proxy] Waiting for in-flight request...');
          try {
            await inFlightRequest;
          } catch (e) {
            // In-flight failed, but we might still have stale cache
          }
          if (cache.data) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('X-Cache', 'DEDUP');
            res.end(JSON.stringify(cache.data));
            return;
          }
        }

        // 3. Make a fresh request to OpenSky
        const apiUrl = `https://opensky-network.org/api/states/all${queryString}`;
        console.log(`[OpenSky Proxy] Fetching from API: ${apiUrl}`);

        inFlightRequest = (async () => {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

            const response = await fetch(apiUrl, {
              signal: controller.signal,
              headers: {
                'User-Agent': 'SkyMap-FlightTracker/1.0',
              },
            });
            clearTimeout(timeout);

            if (response.ok) {
              const data = await response.json();
              cache = { data, timestamp: Date.now() };
              console.log(`[OpenSky Proxy] Cache MISS — fetched ${data.states?.length || 0} aircraft`);
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('X-Cache', 'MISS');
              res.end(JSON.stringify(data));
              return;
            }

            // Rate limited (429) — serve stale cache if available
            if (response.status === 429) {
              console.warn('[OpenSky Proxy] Rate limited (429) — serving stale cache');
              if (cache.data) {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('X-Cache', 'STALE');
                res.end(JSON.stringify(cache.data));
                return;
              }
            }

            // Other API errors — still try stale cache
            console.warn(`[OpenSky Proxy] API error ${response.status} — serving stale cache`);
            if (cache.data) {
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('X-Cache', 'STALE');
              res.end(JSON.stringify(cache.data));
              return;
            }

            res.statusCode = response.status;
            res.end(`OpenSky API error: ${response.status}`);

          } catch (err) {
            console.error('[OpenSky Proxy] Network error:', err.message);
            // Network failure — serve stale cache
            if (cache.data) {
              console.log('[OpenSky Proxy] Serving stale cache after network error');
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('X-Cache', 'STALE');
              res.end(JSON.stringify(cache.data));
              return;
            }
            res.statusCode = 502;
            res.end(`Proxy error: ${err.message}`);
          }
        })();

        try {
          await inFlightRequest;
        } finally {
          inFlightRequest = null;
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    openskyProxyPlugin(), // Must be before react() so middleware registers first
    react(),
  ],
  server: {
    port: 5173,
    open: false,
    // NOTE: The proxy config below is now a fallback — the custom plugin
    // middleware intercepts /api/opensky requests first with caching.
  },
});
