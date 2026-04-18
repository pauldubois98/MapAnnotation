'use strict';

// ─── Map init ──────────────────────────────────────────────────────────────
const map = L.map('map', { zoomControl: true }).setView([20, 0], 2);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// ─── Store & layer index ───────────────────────────────────────────────────
const store = { type: 'FeatureCollection', features: [] };
const layerGroup = L.featureGroup().addTo(map);
const layerIndex = new Map(); // id → Leaflet layer

// ─── Style constants ───────────────────────────────────────────────────────
const STYLES = {
  point:  { color: '#4f46e5', fillColor: '#4f46e5', fillOpacity: 0.9, weight: 2, radius: 8 },
  path:   { color: '#059669', weight: 3, opacity: 0.9 },
  region: { color: '#d97706', weight: 2, opacity: 0.9, fillColor: '#d97706', fillOpacity: 0.15 },
};

// ─── Drawing state ─────────────────────────────────────────────────────────
let activeHandler = null;
let activeType = null;      // 'point' | 'path' | 'region'
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
const btnImport   = document.getElementById('btn-import');
const btnExport   = document.getElementById('btn-export');
const fileInput   = document.getElementById('file-input');
const searchInput   = document.getElementById('search-input');
const searchSpinner = document.getElementById('search-spinner');
const toastCont   = document.getElementById('toast-container');

// Editing state
let editingId = null;  // id of feature currently in panel, or null for new

// ─── Drawing handlers ──────────────────────────────────────────────────────
const handlers = {
  point:  new L.Draw.CircleMarker(map, { shapeOptions: STYLES.point, repeatMode: false }),
  path:   new L.Draw.Polyline(map,  { shapeOptions: STYLES.path, repeatMode: false }),
  region: new L.Draw.Polygon(map,   { shapeOptions: STYLES.region, repeatMode: false }),
};

function activateTool(type) {
  // Deactivate current handler
  if (activeHandler) {
    activeHandler.disable();
    activeHandler = null;
  }

  // Toggle off if same button clicked again
  if (activeType === type) {
    activeType = null;
    [btnPoint, btnPath, btnRegion].forEach(b => b.classList.remove('active'));
    document.getElementById('map').classList.remove('drawing-active');
    return;
  }

  activeType = type;
  activeHandler = handlers[type];
  activeHandler.enable();
  document.getElementById('map').classList.add('drawing-active');

  // Highlight active button
  const btnMap = { point: btnPoint, path: btnPath, region: btnRegion };
  [btnPoint, btnPath, btnRegion].forEach(b => b.classList.remove('active'));
  btnMap[type].classList.add('active');
}

btnPoint.addEventListener('click',  () => activateTool('point'));
btnPath.addEventListener('click',   () => activateTool('path'));
btnRegion.addEventListener('click', () => activateTool('region'));

// ─── Handle completed draw ─────────────────────────────────────────────────
map.on('draw:created', (e) => {
  const layer = e.layer;
  const type = activeType;

  // Reset tool state
  activeHandler = null;
  activeType = null;
  [btnPoint, btnPath, btnRegion].forEach(b => b.classList.remove('active'));
  document.getElementById('map').classList.remove('drawing-active');

  // Temporarily add the layer so the user can see it while filling the form
  pendingLayer = layer;
  applyStyle(layer, type);
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
  const labels = { point: 'Point', path: 'Path', region: 'Region' };
  panelBadge.textContent = labels[resolvedType] ?? 'Annotation';
  panelBadge.className = `type-${resolvedType}`;

  if (id) {
    // Edit mode — pre-fill fields
    const feat = store.features.find(f => f.properties.id === id);
    inputName.value = feat.properties.name ?? '';
    inputDesc.value = feat.properties.description ?? '';
    btnDelete.style.display = 'inline-flex';
  } else {
    // New mode
    inputName.value = '';
    inputDesc.value = '';
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

    // Update layer tooltip
    const layer = layerIndex.get(editingId);
    if (layer) updateLayerTooltip(layer, feat.properties);

    toast('Annotation updated');
  } else {
    // Commit new feature from pendingLayer
    const id = crypto.randomUUID();
    const type = panelBadge.className.replace('type-', '');
    const geometry = layerToGeoJSON(pendingLayer, type);

    const feature = {
      type: 'Feature',
      id,
      geometry,
      properties: {
        id,
        name,
        description: desc,
        annotationType: type,
        createdAt: new Date().toISOString(),
      },
    };

    store.features.push(feature);

    // Move pendingLayer into managed index, attach click
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
function applyStyle(layer, type) {
  if (type === 'point') {
    // Leaflet.draw creates a CircleMarker — apply style options
    layer.setStyle(STYLES.point);
  } else if (type === 'path') {
    layer.setStyle(STYLES.path);
  } else if (type === 'region') {
    layer.setStyle(STYLES.region);
  }
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
      if (feat) {
        const baseStyle = STYLES[feat.properties.annotationType];
        layer.setStyle(baseStyle);
      }
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
  if (type === 'point') {
    const ll = layer.getLatLng();
    return { type: 'Point', coordinates: [ll.lng, ll.lat] };
  }
  if (type === 'path') {
    const coords = layer.getLatLngs().map(ll => [ll.lng, ll.lat]);
    return { type: 'LineString', coordinates: coords };
  }
  if (type === 'region') {
    // Outer ring only; close the ring
    const ring = layer.getLatLngs()[0].map(ll => [ll.lng, ll.lat]);
    ring.push(ring[0]);
    return { type: 'Polygon', coordinates: [ring] };
  }
}

function renderFeature(feature) {
  const { geometry, properties } = feature;
  const type = properties.annotationType;
  let layer;

  if (geometry.type === 'Point') {
    const [lng, lat] = geometry.coordinates;
    layer = L.circleMarker([lat, lng], STYLES.point);
  } else if (geometry.type === 'LineString') {
    const latlngs = geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    layer = L.polyline(latlngs, STYLES.path);
  } else if (geometry.type === 'Polygon') {
    // Take outer ring, drop the closing duplicate
    const ring = geometry.coordinates[0];
    const latlngs = ring.slice(0, -1).map(([lng, lat]) => [lat, lng]);
    layer = L.polygon(latlngs, STYLES.region);
  } else {
    return; // unsupported geometry type
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
