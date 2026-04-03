import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* ============================================================
   Custom Vite Plugin: adsb.lol Caching Proxy
   
   WHY proxy: adsb.lol blocks browser requests with CORS.
   This proxy routes /api/adsb/* through the Vite dev server,
   making requests server-side (no CORS restrictions).
   
   Also caches responses for 5 seconds to prevent excessive
   requests during rapid map panning.
   ============================================================ */
function adsbProxyPlugin() {
  const cacheMap = new Map();
  const inFlightRequests = new Map();
  const CACHE_TTL_MS = 5000; // 5 seconds — adsb.lol updates frequently

  return {
    name: 'adsb-caching-proxy',
    configureServer(server) {
      server.middlewares.use('/api/adsb', async (req, res) => {
        // req.url will be like /v2/lat/47.37/lon/8.54/dist/250
        const path = req.url;

        // Check cache for this specific path
        const cache = cacheMap.get(path) || { data: null, timestamp: 0 };
        const cacheAge = Date.now() - cache.timestamp;
        
        if (cache.data && cacheAge < CACHE_TTL_MS) {
          console.log(`[adsb.lol Proxy] Cache HIT (age: ${Math.round(cacheAge / 1000)}s) for ${path}`);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-Cache', 'HIT');
          res.end(JSON.stringify(cache.data));
          return;
        }

        // Deduplicate concurrent requests for the exact same path
        let inFlightRequest = inFlightRequests.get(path);
        if (inFlightRequest) {
          try { await inFlightRequest; } catch (e) { /* ignore */ }
          const dedupCache = cacheMap.get(path);
          if (dedupCache && dedupCache.data) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('X-Cache', 'DEDUP');
            res.end(JSON.stringify(dedupCache.data));
            return;
          }
        }

        const apiUrl = `https://api.adsb.lol${path}`;
        console.log(`[adsb.lol Proxy] Fetching: ${apiUrl}`);

        inFlightRequest = (async () => {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(apiUrl, {
              signal: controller.signal,
              headers: { 'User-Agent': 'SkyMap-FlightTracker/1.0' },
            });
            clearTimeout(timeout);

            if (response.ok) {
              const data = await response.json();
              cacheMap.set(path, { data, timestamp: Date.now() });
              const count = data.ac?.length || 0;
              console.log(`[adsb.lol Proxy] Fetched ${count} aircraft`);
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('X-Cache', 'MISS');
              res.end(JSON.stringify(data));
              return;
            }

            // Rate limited or error — serve stale cache if available
            console.warn(`[adsb.lol Proxy] API error ${response.status}`);
            if (cache.data) {
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('X-Cache', 'STALE');
              res.end(JSON.stringify(cache.data));
              return;
            }

            res.statusCode = response.status;
            res.end(`adsb.lol API error: ${response.status}`);
          } catch (err) {
            console.error('[adsb.lol Proxy] Network error:', err.message);
            if (cache.data) {
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('X-Cache', 'STALE');
              res.end(JSON.stringify(cache.data));
              return;
            }
            res.statusCode = 502;
            res.end(`Proxy error: ${err.message}`);
          }
        })();

        inFlightRequests.set(path, inFlightRequest);

        try {
          await inFlightRequest;
        } finally {
          inFlightRequests.delete(path);
        }
      });
    },
  };
}

// Force Vite restart to load .env variables
export default defineConfig({
  plugins: [
    adsbProxyPlugin(),
    react(),
  ],
  server: {
    port: 5173,
    open: false,
  },
});
