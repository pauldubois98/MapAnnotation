# Map Annotation

A lightweight, browser-only tool to annotate any location on an interactive map. Draw points, paths, and regions, attach names and descriptions, then share your work as a standard GeoJSON file.

No build step. No dependencies to install. Open one HTML file and go.

## Features

- **Three annotation types** — point, path (polyline), and region (polygon)
- **Name + description** per annotation
- **Import** an existing GeoJSON file to view and continue editing
- **Export** all annotations as a `.geojson` file compatible with QGIS, GitHub map preview, and other GIS tools
- Modern frosted-glass UI, fully keyboard-accessible (Escape cancels an in-progress action)

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
| Draw a region | Click **Region**, click to place vertices, double-click to close |
| Edit an annotation | Click any marker or shape on the map |
| Delete an annotation | Open it for editing, then click **Delete** |
| Import annotations | Click **Import** and select a `.json` or `.geojson` file |
| Export annotations | Click **Export** — downloads `annotations-YYYY-MM-DD.geojson` |

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
        "coordinates": [
          0.9043872356414796,
          42.99128484548137
        ]
      },
      "properties": {
        "id": "a71994d8-9d2e-4a0f-baf1-e8e8656160ad",
        "name": "Attero",
        "description": "Attention, ca déclenche!",
        "annotationType": "point",
        "createdAt": "2026-04-18T16:12:51.421Z"
      }
    }
  ]
}
```

`annotationType` is `"point"`, `"path"`, or `"region"`.

## Stack

- [Leaflet.js](https://leafletjs.com/) — interactive map
- [Leaflet.draw](https://github.com/Leaflet/Leaflet.draw) — drawing tools
- [OpenStreetMap](https://www.openstreetmap.org/) — map tiles (no API key needed)
- Pure HTML / CSS / JavaScript — no framework, no bundler
