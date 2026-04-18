'use strict';

// ─── Basemap catalogue ─────────────────────────────────────────────────────
// Thumbnail tile: zoom=5, x=16, y=11 (Western Europe — shows land + water contrast)
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services';
const ESRI_ATTR = '© Esri & contributors';

const BASEMAPS = [
  {
    id: 'osm', name: 'Standard',
    layers: [{ url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
               opts: { subdomains: 'abc', maxZoom: 19,
                       attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' } }],
    thumb: 'https://tile.openstreetmap.org/5/16/11.png',
  },
  {
    id: 'carto-light', name: 'Light',
    layers: [{ url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
               opts: { subdomains: 'abcd', maxZoom: 20, attribution: '© <a href="https://carto.com/">CartoDB</a>' } }],
    thumb: 'https://a.basemaps.cartocdn.com/light_all/5/16/11.png',
  },
  {
    id: 'carto-dark', name: 'Dark',
    layers: [{ url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
               opts: { subdomains: 'abcd', maxZoom: 20, attribution: '© <a href="https://carto.com/">CartoDB</a>' } }],
    thumb: 'https://a.basemaps.cartocdn.com/dark_all/5/16/11.png',
  },
  {
    id: 'esri-sat', name: 'Satellite',
    layers: [{ url: `${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
               opts: { maxZoom: 19, attribution: ESRI_ATTR } }],
    thumb: `${ESRI}/World_Imagery/MapServer/tile/5/11/16`,
  },
  {
    id: 'esri-sat-roads', name: 'Sat + Roads',
    layers: [
      { url: `${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
        opts: { maxZoom: 19, attribution: ESRI_ATTR } },
      { url: `${ESRI}/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}`,
        opts: { maxZoom: 19, attribution: ESRI_ATTR, opacity: 0.85 } },
    ],
    thumb: `${ESRI}/World_Imagery/MapServer/tile/5/11/16`,
  },
  {
    id: 'esri-street', name: 'Streets',
    layers: [{ url: `${ESRI}/World_Street_Map/MapServer/tile/{z}/{y}/{x}`,
               opts: { maxZoom: 19, attribution: ESRI_ATTR } }],
    thumb: `${ESRI}/World_Street_Map/MapServer/tile/5/11/16`,
  },
  {
    id: 'esri-topo', name: 'Topographic',
    layers: [{ url: `${ESRI}/World_Topo_Map/MapServer/tile/{z}/{y}/{x}`,
               opts: { maxZoom: 19, attribution: ESRI_ATTR } }],
    thumb: `${ESRI}/World_Topo_Map/MapServer/tile/5/11/16`,
  },
  {
    id: 'esri-natgeo', name: 'Nat. Geo.',
    layers: [{ url: `${ESRI}/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}`,
               opts: { maxZoom: 16, attribution: ESRI_ATTR } }],
    thumb: `${ESRI}/NatGeo_World_Map/MapServer/tile/5/11/16`,
  },
  {
    id: 'esri-relief', name: 'Shaded Relief',
    layers: [{ url: `${ESRI}/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}`,
               opts: { maxZoom: 13, attribution: ESRI_ATTR } }],
    thumb: `${ESRI}/World_Shaded_Relief/MapServer/tile/5/11/16`,
  },
  {
    id: 'esri-gray', name: 'Gray',
    layers: [{ url: `${ESRI}/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
               opts: { maxZoom: 16, attribution: ESRI_ATTR } }],
    thumb: `${ESRI}/Canvas/World_Light_Gray_Base/MapServer/tile/5/11/16`,
  },
  {
    id: 'carto-voyager', name: 'Voyager',
    layers: [{ url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
               opts: { subdomains: 'abcd', maxZoom: 20, attribution: '© <a href="https://carto.com/">CartoDB</a>' } }],
    thumb: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/5/16/11.png',
  },
  {
    id: 'otm', name: 'Outdoor',
    layers: [{ url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
               opts: { subdomains: 'abc', maxZoom: 17,
                       attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a>' } }],
    thumb: 'https://a.tile.opentopomap.org/5/16/11.png',
  },
  {
    id: 'osm-hot', name: 'Humanitarian',
    layers: [{ url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
               opts: { subdomains: 'abc', maxZoom: 19,
                       attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles by <a href="https://hot.openstreetmap.org">HOT</a>' } }],
    thumb: 'https://a.tile.openstreetmap.fr/hot/5/16/11.png',
  },
];

// ─── Map init ──────────────────────────────────────────────────────────────
const map = L.map('map', { zoomControl: true, tap: false }).setView([20, 0], 2);

// Active basemap state
let activeBasemapId = 'esri-sat';
let activeTileLayers = [];

function setBasemap(id) {
  const bm = BASEMAPS.find(b => b.id === id);
  if (!bm) return;
  activeTileLayers.forEach(l => map.removeLayer(l));
  activeTileLayers = bm.layers.map(({ url, opts }) => L.tileLayer(url, opts).addTo(map));
  layerGroup.bringToFront();
  activeBasemapId = id;
  document.querySelectorAll('.layer-card').forEach(el =>
    el.classList.toggle('active', el.dataset.id === id)
  );
}

// ─── Store & layer index ───────────────────────────────────────────────────
const store = { type: 'FeatureCollection', features: [] };
const layerGroup = L.featureGroup().addTo(map);
const layerIndex = new Map(); // id → Leaflet layer

// Load default basemap (after layerGroup exists so bringToFront works)
setBasemap('esri-sat');

// ─── Style helpers ─────────────────────────────────────────────────────────
const DEFAULT_COLOR = '#ef4444';

function makeStyle(type, color) {
  if (type === 'point') {
    return { color, fillColor: color, fillOpacity: 0.9, weight: 2, radius: 8 };
  }
  if (type === 'path') {
    return { color, weight: 3, opacity: 0.9 };
  }
  // region, circle
  return { color, weight: 2, opacity: 0.9, fillColor: color, fillOpacity: 0.2 };
}

// ─── Drawing state ─────────────────────────────────────────────────────────
let activeHandler = null;
let activeType = null;      // 'point' | 'path' | 'region' | 'circle'
let pendingLayer = null;    // layer awaiting annotation before being committed

// ─── DOM refs ─────────────────────────────────────────────────────────────
const panel       = document.getElementById('panel');
const panelBadge  = document.getElementById('panel-type-badge');
const inputName   = document.getElementById('input-name');
const inputDesc   = document.getElementById('input-desc');
const btnSave     = document.getElementById('btn-save');
const btnDelete   = document.getElementById('btn-delete');
const btnCancel   = document.getElementById('btn-cancel');
const btnClose    = document.getElementById('panel-close');
const btnPoint    = document.getElementById('btn-point');
const btnPath     = document.getElementById('btn-path');
const btnRegion   = document.getElementById('btn-region');
const btnCircle   = document.getElementById('btn-circle');
const inputColor  = document.getElementById('input-color');
const colorSwatch = document.getElementById('color-swatch');
const colorHex    = document.getElementById('color-hex');
const btnImport   = document.getElementById('btn-import');
const btnExport   = document.getElementById('btn-export');
const fileInput   = document.getElementById('file-input');
const searchInput   = document.getElementById('search-input');
const searchSpinner = document.getElementById('search-spinner');
const toastCont     = document.getElementById('toast-container');
const btnLayers     = document.getElementById('btn-layers');
const layerPicker   = document.getElementById('layer-picker');
const layerGrid     = document.getElementById('layer-grid');

// Editing state
let editingId = null;  // id of feature currently in panel, or null for new

// ─── Drawing handlers ──────────────────────────────────────────────────────
const handlers = {
  point:  new L.Draw.CircleMarker(map, { shapeOptions: makeStyle('point', DEFAULT_COLOR), repeatMode: false }),
  path:   new L.Draw.Polyline(map,  { shapeOptions: makeStyle('path', DEFAULT_COLOR), repeatMode: false }),
  region: new L.Draw.Polygon(map,   { shapeOptions: makeStyle('region', DEFAULT_COLOR), repeatMode: false }),
  circle: new L.Draw.Circle(map,    { shapeOptions: makeStyle('circle', DEFAULT_COLOR), showRadius: true, metric: true, repeatMode: false }),
};

const allToolBtns = [btnPoint, btnPath, btnRegion, btnCircle];
const btnByType   = { point: btnPoint, path: btnPath, region: btnRegion, circle: btnCircle };

function activateTool(type) {
  if (activeHandler) {
    activeHandler.disable();
    activeHandler = null;
  }

  // Toggle off if same button clicked again
  if (activeType === type) {
    activeType = null;
    allToolBtns.forEach(b => b.classList.remove('active'));
    document.getElementById('map').classList.remove('drawing-active');
    return;
  }

  activeType = type;
  activeHandler = handlers[type];
  activeHandler.enable();
  document.getElementById('map').classList.add('drawing-active');

  allToolBtns.forEach(b => b.classList.remove('active'));
  btnByType[type].classList.add('active');
}

btnPoint.addEventListener('click',  () => activateTool('point'));
btnPath.addEventListener('click',   () => activateTool('path'));
btnRegion.addEventListener('click', () => activateTool('region'));
btnCircle.addEventListener('click', () => activateTool('circle'));

// ─── Handle completed draw ─────────────────────────────────────────────────
map.on('draw:created', (e) => {
  const layer = e.layer;
  const type = activeType;

  // Reset tool state
  activeHandler = null;
  activeType = null;
  allToolBtns.forEach(b => b.classList.remove('active'));
  document.getElementById('map').classList.remove('drawing-active');

  // Temporarily add the layer so the user can see it while filling the form
  pendingLayer = layer;
  applyStyle(layer, type, DEFAULT_COLOR);
  layerGroup.addLayer(layer);

  openPanel(null, type);
});

// ─── Panel open/close ──────────────────────────────────────────────────────
function openPanel(id, type) {
  editingId = id;

  const resolvedType = id
    ? store.features.find(f => f.properties.id === id)?.properties.annotationType
    : type;

  // Badge
  const labels = { point: 'Point', path: 'Path', region: 'Region', circle: 'Circle' };
  panelBadge.textContent = labels[resolvedType] ?? 'Annotation';
  panelBadge.className = `type-${resolvedType}`;

  if (id) {
    // Edit mode — pre-fill fields
    const feat = store.features.find(f => f.properties.id === id);
    inputName.value = feat.properties.name ?? '';
    inputDesc.value = feat.properties.description ?? '';
    setColor(feat.properties.color ?? DEFAULT_COLOR);
    btnDelete.style.display = 'inline-flex';
  } else {
    // New mode
    inputName.value = '';
    inputDesc.value = '';
    setColor(DEFAULT_COLOR);
    btnDelete.style.display = 'none';
  }

  panel.classList.add('open');
  inputName.focus();
}

function closePanel(discard = false) {
  panel.classList.remove('open');

  if (discard && pendingLayer) {
    layerGroup.removeLayer(pendingLayer);
    pendingLayer = null;
  } else if (!discard && pendingLayer) {
    // If panel closed without saving (e.g. ESC), treat as cancel
    layerGroup.removeLayer(pendingLayer);
    pendingLayer = null;
  }

  editingId = null;
}

btnClose.addEventListener('click',  () => closePanel(true));
btnCancel.addEventListener('click', () => closePanel(true));

// ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && panel.classList.contains('open')) closePanel(true);
});

// ─── Save annotation ───────────────────────────────────────────────────────
btnSave.addEventListener('click', () => {
  const name = inputName.value.trim();
  const desc = inputDesc.value.trim();
  const color = inputColor.value;

  if (!name) {
    inputName.focus();
    inputName.style.borderBottomColor = '#dc2626';
    setTimeout(() => { inputName.style.borderBottomColor = ''; }, 1500);
    return;
  }

  if (editingId) {
    // Update existing feature
    const feat = store.features.find(f => f.properties.id === editingId);
    feat.properties.name = name;
    feat.properties.description = desc;
    feat.properties.color = color;

    const layer = layerIndex.get(editingId);
    if (layer) {
      layer.setStyle(makeStyle(feat.properties.annotationType, color));
      updateLayerTooltip(layer, feat.properties);
    }

    toast('Annotation updated');
  } else {
    // Commit new feature from pendingLayer
    const id = crypto.randomUUID();
    const type = panelBadge.className.replace('type-', '');
    const geometry = layerToGeoJSON(pendingLayer, type);

    const properties = {
      id, name, description: desc, color,
      annotationType: type,
      createdAt: new Date().toISOString(),
    };
    if (type === 'circle') properties.radius = pendingLayer.getRadius();

    const feature = { type: 'Feature', id, geometry, properties };
    store.features.push(feature);

    // Apply chosen color, move into managed index
    applyStyle(pendingLayer, type, color);
    attachLayerBehaviour(pendingLayer, id);
    layerIndex.set(id, pendingLayer);
    updateLayerTooltip(pendingLayer, feature.properties);
    pendingLayer = null;

    toast('Annotation saved');
  }

  closePanel(false);
});

// ─── Delete annotation ─────────────────────────────────────────────────────
btnDelete.addEventListener('click', () => {
  if (!editingId) return;
  const layer = layerIndex.get(editingId);
  if (layer) layerGroup.removeLayer(layer);
  layerIndex.delete(editingId);
  store.features = store.features.filter(f => f.properties.id !== editingId);
  closePanel(false);
  toast('Annotation deleted');
});

// ─── Helpers ───────────────────────────────────────────────────────────────
function applyStyle(layer, type, color) {
  layer.setStyle(makeStyle(type, color));
}

function setColor(hex) {
  inputColor.value = hex;
  colorSwatch.style.background = hex;
  colorHex.textContent = hex;
}

function attachLayerBehaviour(layer, id) {
  layer.off('click');
  layer.on('click', (e) => {
    L.DomEvent.stopPropagation(e);
    openPanel(id, null);
  });
  // Hover effect for path/region
  if (layer.setStyle) {
    layer.on('mouseover', () => layer.setStyle({ opacity: 1, fillOpacity: 0.35 }));
    layer.on('mouseout',  () => {
      const feat = store.features.find(f => f.properties.id === id);
      if (feat) layer.setStyle(makeStyle(feat.properties.annotationType, feat.properties.color ?? DEFAULT_COLOR));
    });
  }
}

function updateLayerTooltip(layer, props) {
  layer.unbindTooltip();
  layer.bindTooltip(`<strong>${escapeHtml(props.name)}</strong>`, {
    permanent: false,
    sticky: true,
    direction: 'top',
    className: 'annotation-tooltip',
  });
}

function layerToGeoJSON(layer, type) {
  if (type === 'point' || type === 'circle') {
    const ll = layer.getLatLng();
    return { type: 'Point', coordinates: [ll.lng, ll.lat] };
    // radius for circle is stored in properties.radius, not in geometry
  }
  if (type === 'path') {
    const coords = layer.getLatLngs().map(ll => [ll.lng, ll.lat]);
    return { type: 'LineString', coordinates: coords };
  }
  if (type === 'region') {
    const ring = layer.getLatLngs()[0].map(ll => [ll.lng, ll.lat]);
    ring.push(ring[0]);
    return { type: 'Polygon', coordinates: [ring] };
  }
}

function renderFeature(feature) {
  const { geometry, properties } = feature;
  const type = properties.annotationType;
  const color = properties.color ?? DEFAULT_COLOR;
  let layer;

  if (type === 'circle' && properties.radius != null) {
    const [lng, lat] = geometry.coordinates;
    layer = L.circle([lat, lng], { radius: properties.radius, ...makeStyle('circle', color) });
  } else if (geometry.type === 'Point') {
    const [lng, lat] = geometry.coordinates;
    layer = L.circleMarker([lat, lng], makeStyle('point', color));
  } else if (geometry.type === 'LineString') {
    const latlngs = geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    layer = L.polyline(latlngs, makeStyle('path', color));
  } else if (geometry.type === 'Polygon') {
    const ring = geometry.coordinates[0];
    const latlngs = ring.slice(0, -1).map(([lng, lat]) => [lat, lng]);
    layer = L.polygon(latlngs, makeStyle('region', color));
  } else {
    return;
  }

  layerGroup.addLayer(layer);
  layerIndex.set(properties.id, layer);
  attachLayerBehaviour(layer, properties.id);
  updateLayerTooltip(layer, properties);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Import ────────────────────────────────────────────────────────────────
btnImport.addEventListener('click', () => {
  fileInput.value = '';
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    let geojson;
    try {
      geojson = JSON.parse(ev.target.result);
    } catch {
      toast('Invalid JSON file');
      return;
    }

    if (geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
      toast('File must be a GeoJSON FeatureCollection');
      return;
    }

    let count = 0;
    geojson.features.forEach((feature) => {
      // Ensure the feature has required properties
      if (!feature.properties) feature.properties = {};
      if (!feature.properties.id) feature.properties.id = crypto.randomUUID();

      // Infer annotationType from geometry if missing
      if (!feature.properties.annotationType) {
        const gmap = { Point: 'point', LineString: 'path', Polygon: 'region' };
        feature.properties.annotationType = gmap[feature.geometry?.type] ?? 'point';
      }

      // Skip duplicates
      if (layerIndex.has(feature.properties.id)) return;

      store.features.push(feature);
      renderFeature(feature);
      count++;
    });

    // Fit map to annotations if any were loaded
    if (count > 0 && layerGroup.getLayers().length > 0) {
      try { map.fitBounds(layerGroup.getBounds().pad(0.2)); } catch {}
    }

    toast(`Imported ${count} annotation${count !== 1 ? 's' : ''}`);
  };

  reader.readAsText(file);
});

// ─── Export ────────────────────────────────────────────────────────────────
btnExport.addEventListener('click', () => {
  if (store.features.length === 0) {
    toast('No annotations to export');
    return;
  }

  const json = JSON.stringify(store, null, 2);
  const blob = new Blob([json], { type: 'application/geo+json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `annotations-${new Date().toISOString().slice(0, 10)}.geojson`;
  a.click();
  URL.revokeObjectURL(url);

  toast(`Exported ${store.features.length} annotation${store.features.length !== 1 ? 's' : ''}`);
});

// ─── Color picker live preview ─────────────────────────────────────────────
inputColor.addEventListener('input', () => {
  setColor(inputColor.value);
  const type = panelBadge.className.replace('type-', '');
  if (pendingLayer) {
    applyStyle(pendingLayer, type, inputColor.value);
  } else if (editingId) {
    const layer = layerIndex.get(editingId);
    if (layer) layer.setStyle(makeStyle(type, inputColor.value));
  }
});

// ─── Layer picker ─────────────────────────────────────────────────────────
(function buildLayerPicker() {
  BASEMAPS.forEach((bm) => {
    const card = document.createElement('div');
    card.className = 'layer-card' + (bm.id === activeBasemapId ? ' active' : '');
    card.dataset.id = bm.id;
    card.innerHTML = `
      <img src="${bm.thumb}" alt="${bm.name}" loading="lazy" />
      <span>${bm.name}</span>`;
    card.addEventListener('click', () => {
      setBasemap(bm.id);
      closePicker();
      toast(bm.name);
    });
    layerGrid.appendChild(card);
  });
})();

function closePicker() { layerPicker.hidden = true; }

btnLayers.addEventListener('click', (e) => {
  e.stopPropagation();
  layerPicker.hidden = !layerPicker.hidden;
});

document.getElementById('layer-picker-close').addEventListener('click', closePicker);

// Close picker on outside click
document.addEventListener('click', (e) => {
  if (!layerPicker.hidden && !layerPicker.contains(e.target) && e.target !== btnLayers) {
    closePicker();
  }
});

// ─── City search (Nominatim) ───────────────────────────────────────────────
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') geocodeCity(searchInput.value.trim());
});

async function geocodeCity(query) {
  if (!query) return;

  searchSpinner.hidden = false;
  searchInput.disabled = true;

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();

    if (!data.length) {
      toast(`No results for "${query}"`);
      return;
    }

    const { lat, lon, display_name, boundingbox } = data[0];

    if (boundingbox) {
      // [minLat, maxLat, minLng, maxLng]
      const [s, n, w, e] = boundingbox.map(Number);
      map.fitBounds([[s, w], [n, e]], { maxZoom: 14, animate: true });
    } else {
      map.setView([parseFloat(lat), parseFloat(lon)], 12, { animate: true });
    }

    // Show the place name as a brief toast
    const label = display_name.split(',').slice(0, 2).join(',');
    toast(label);
    searchInput.value = '';
    searchInput.blur();
  } catch {
    toast('Search failed — check your connection');
  } finally {
    searchSpinner.hidden = true;
    searchInput.disabled = false;
  }
}

// ─── Toast ─────────────────────────────────────────────────────────────────
function toast(message) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  toastCont.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}
