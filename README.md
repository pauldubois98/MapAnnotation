# Map Annotation

Tool link: https://pauldubois98.github.io/MapAnnotation/

A lightweight, browser-only tool to annotate any location on an interactive map. Draw points, paths, regions, and circles; pick a color per annotation; search for any city; switch between 13 basemaps; then share your work as a standard GeoJSON file.

No build step. No dependencies to install. Open one HTML file and go.

## Features

- **Four annotation types** — point, path (polyline), polygon region, and circular region
- **Per-annotation color** — color picker with live preview; default red `#ef4444`
- **Name + description** per annotation
- **13 basemaps** — satellite, satellite + roads, street, topo, dark, light, and more; switched via a thumbnail grid picker; default: ESRI satellite
- **City search** — Nominatim-powered geocoder embedded in the toolbar; jumps to any city worldwide
- **Import / Export** — load or save annotations as GeoJSON, via file or clipboard (copy/paste)
- **Responsive design** — frosted-glass pill toolbar on desktop; adaptive bottom tab bar on mobile
- **Default view** — metropolitan France at a comfortable zoom level
- Fully keyboard-accessible (Escape cancels an in-progress action)

## Running locally

The app works by opening `index.html` directly in a browser. However, browsers block tile requests from `file://` URLs in some configurations, so a simple local server is recommended:

**Python (no install required):**
```bash
cd /path/to/MapAnnotation
python3 -m http.server 8080
```
Then open [http://localhost:8080](http://localhost:8080).

**Node.js (npx, no install required):**
```bash
npx serve .
```

**VS Code:** Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, right-click `index.html` → *Open with Live Server*.

## Usage

| Action | How |
|---|---|
| Add a point | Click **Point** in the toolbar, then click anywhere on the map |
| Draw a path | Click **Path**, click to place vertices, double-click to finish |
| Draw a polygon | Click **Region**, click to place vertices, double-click to close |
| Draw a circle | Click **Circle**, click a center, drag to set radius |
| Edit an annotation | Click any marker or shape on the map |
| Change color | Open an annotation for editing, click the color swatch |
| Delete an annotation | Open it for editing, then click **Delete** |
| Search for a city | Type in the search box in the toolbar, press Enter or click a result |
| Switch basemap | Click **Layers** → choose a thumbnail from the picker |
| Import from file | Click **Import ▾ → From file**, select a `.json` or `.geojson` file |
| Import from clipboard | Click **Import ▾ → From clipboard**, paste GeoJSON into the dialog |
| Export to file | Click **Export ▾ → Download file** — saves `annotations-YYYY-MM-DD.geojson` |
| Export to clipboard | Click **Export ▾ → Copy to clipboard** |

## Basemaps

| # | Name | Source |
|---|---|---|
| 1 | Satellite | ESRI World Imagery (default) |
| 2 | Sat + Roads | ESRI World Imagery + ESRI Transportation overlay |
| 3 | Streets | ESRI World Street Map |
| 4 | Topographic | ESRI World Topo |
| 5 | Standard | OpenStreetMap |
| 6 | Voyager | CartoDB Voyager |
| 7 | Light | CartoDB Positron |
| 8 | Dark | CartoDB Dark Matter |
| 9 | National Geographic | ESRI NatGeo World Map |
| 10 | Outdoor | OpenTopoMap |
| 11 | Shaded Relief | ESRI World Shaded Relief |
| 12 | Gray | ESRI World Gray Canvas |
| 13 | Humanitarian | OSM Humanitarian (HOT) |

All basemaps are free and require no API key.

## File format

Annotations are stored as a standard [GeoJSON](https://geojson.org/) `FeatureCollection`. Each feature includes:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "a71994d8-9d2e-4a0f-baf1-e8e8656160ad",
      "geometry": {
        "type": "Point",
        "coordinates": [0.9043872356414796, 42.99128484548137]
      },
      "properties": {
        "id": "a71994d8-9d2e-4a0f-baf1-e8e8656160ad",
        "name": "Attero",
        "description": "Attention, ca déclenche!",
        "color": "#ef4444",
        "annotationType": "point",
        "createdAt": "2026-04-18T16:12:51.421Z"
      }
    }
  ]
}
```

`annotationType` is `"point"`, `"path"`, `"region"`, or `"circle"`.

Circles have `Point` geometry (the center) and a `radius` property (meters):

```json
{
  "geometry": { "type": "Point", "coordinates": [2.3522, 48.8566] },
  "properties": {
    "annotationType": "circle",
    "radius": 5000,
    "color": "#3b82f6",
    …
  }
}
```

## Stack

- [Leaflet.js](https://leafletjs.com/) — interactive map
- [Leaflet.draw](https://github.com/Leaflet/Leaflet.draw) — drawing tools
- [OpenStreetMap / ESRI / CartoDB](https://www.openstreetmap.org/) — map tiles (no API key needed)
- [Nominatim](https://nominatim.org/) — city geocoding (no API key needed)
- Pure HTML / CSS / JavaScript — no framework, no bundler
