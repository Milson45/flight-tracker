# Project: SkyMap Real-Time Flight Tracker - Architecture & Workflow

## 1. Project Overview
Build a real-time web-based flight tracking application. The core objective is to plot live aircraft data on an interactive map with smooth updates, minimal latency, and high performance, even when rendering thousands of data points.

## 2. Tech Stack Requirements
* **Frontend Framework:** React (using functional components and hooks).
* **Map Engine:** Mapbox GL JS (via `react-map-gl`) or Leaflet (via `react-leaflet`). *Preference: Mapbox GL JS for superior WebGL rendering performance with high numbers of moving markers.*
* **State Management:** Context API or Zustand for lightweight, fast state updates without unnecessary re-renders.
* **Build Tool:** Vite (for fast module bundling).

## 3. Data Flow & API Integration
* **Primary Data Source:** OpenSky Network REST API (`https://opensky-network.org/api/states/all`).
* **Optimization (Crucial):** Do NOT fetch the entire global dataset. The map component must calculate its current bounding box (lat/lon coordinates for the visible corners) on every pan/zoom event. Pass this bounding box to the OpenSky API to only fetch aircraft currently visible on the screen (`lamin`, `lomin`, `lamax`, `lomax` parameters).
* **Polling Logic:** Implement a custom `useInterval` hook to poll the API every 10 seconds. 
* **Interpolation:** To prevent aircraft from "jumping" every 10 seconds, implement a simple linear interpolation function. Calculate the aircraft's next position based on its current velocity and true track (heading), moving the marker smoothly via CSS/JS animation between polling intervals.

## 4. Core Features & Component Architecture
1.  **MapViewport:** The central map component. Handles zoom, pan, and bounding box calculations.
2.  **AircraftLayer:** Renders the aircraft icons. Must use WebGL layers or highly optimized canvas markers, NOT standard DOM elements, to prevent performance bottlenecks.
3.  **FlightSidebar:** A conditionally rendered panel. When an aircraft is clicked, display its callsign, origin country, altitude (convert meters to feet), velocity (convert m/s to knots), and heading.
4.  **ControlPanel:** A small UI overlay to toggle map layers (e.g., weather overlays, day/night terminator line) and filter flights (e.g., filter by minimum altitude).

## 5. Development Constraints
* Ensure strict separation of concerns. API calls should live in separate utility files, not inside the UI components.
* Lead Developer: Milson Travasso. 
* Ensure code is heavily commented, focusing on *why* logic is implemented, particularly around the map rendering and bounding box math.