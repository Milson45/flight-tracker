# Project: SkyMap Real-Time Flight Tracker - UI/UX & Design System

## 1. Design Philosophy
The goal is to avoid the "typical AI-generated website" look (no default Bootstrap, no generic Tailwind utility soup). The UI should feel like a premium, specialized aviation tool. It should lean into a "Tactical Glassmorphism" or "Modern Avionics" aesthetic—dark, sleek, and highly functional. 

## 2. Visual Identity & Map Styling
* **Map Theme:** Do not use standard Google Maps or default OpenStreetMap tiles. Use a custom dark-mode base map (e.g., Mapbox Dark or CartoDB Dark Matter). The map background should be deep navy or charcoal (#0f172a), with subtle, low-opacity country borders and no street-level clutter unless zoomed in closely.
* **Color Palette:**
    * Background/Panels: Translucent dark grey with heavy background blur (backdrop-filter).
    * Primary Accent: Neon Cyan (#06b6d4) or Radar Green (#4ade80) for active selections and UI highlights.
    * Text: Off-white (#f8fafc) for primary data, muted grey (#94a3b8) for labels.

## 3. Aircraft Markers (Crucial for UX)
* **Custom SVG Icons:** Do not use standard map pins. Use clean, minimalist top-down SVG silhouettes of airplanes. 
* **Dynamic Rotation:** The SVG icon must be dynamically rotated using CSS `transform: rotate()` bound to the aircraft's `true_track` (heading) data from the API. The nose of the plane must point in the direction of travel.
* **Visual Hierarchy:** Differentiate aircraft by altitude or speed using subtle color gradients on the icons (e.g., yellow for low altitude, transitioning to blue for high cruising altitude).

## 4. UI Layout & Elements
* **Floating UI:** Avoid rigid headers and sidebars attached to the edges of the screen. UI elements (search bar, flight details, layer toggles) should be floating cards layered *over* the full-screen map.
* **Flight Details Card (The "Data Panel"):** When an aircraft is clicked, a sleek panel slides in. 
    * *Typography:* Use a monospace font (like JetBrains Mono or Roboto Mono) for numbers, altitudes, and callsigns to mimic aviation instruments. Use a clean sans-serif (like Inter) for standard text.
    * *Example Data Display:* Design the panel to clearly separate identification (Callsign: EXMPL1, Country: Switzerland) from telemetry (Alt: 35,000 ft, Spd: 450 kts).
* **Micro-interactions:** Add smooth, creative transitions. When an aircraft is selected, the map should perform a slow, eased "fly-to" animation to center the plane, and the plane's icon should pulse gently.

## 5. User Persona Reference
Keep the end-user in mind: An aviation enthusiast like "Julian Vance" who wants a clean, immersive experience without digging through cluttered menus to find flight data. The interface must be immediately intuitive.