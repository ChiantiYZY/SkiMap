import Map, { Source, Layer, LayerProps } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiY2hpYW50aXl6eSIsImEiOiJjbTY1dWQ4YTcxenNuMnBvZDV0dzUxeWRrIn0.r_3omZ6pLIuCzapjpvVHdQ'; // You'll need to get this from mapbox.com
const PALISADES_COORDINATES = {
  latitude: 39.1969,
  longitude: -120.2358,
  zoom: 13,
  pitch: 60,
  bearing: 0
};

// Aerial Tram lift data
const aerialTramData = {
  type: 'Feature',
  properties: {
    name: 'Aerial Tram',
    type: 'lift',
    liftType: 'cable_car'
  },
  geometry: {
    type: 'LineString',
    coordinates: [
      [-120.23595590000002, 39.1968096],
      [-120.2461913, 39.196206900000014],
      [-120.25345109999998, 39.19577680000002],
      [-120.26116240000003, 39.19539000000002]
    ]
  }
};

const liftLayerStyle: LayerProps = {
  id: 'aerial-tram',
  type: 'line',
  paint: {
    'line-color': '#FF0000',
    'line-width': 4,
    'line-dasharray': [2, 1] // Creates a dashed line effect
  }
};

const liftLabelStyle: LayerProps = {
  id: 'aerial-tram-label',
  type: 'symbol',
  layout: {
    'text-field': ['get', 'name'],
    'text-size': 10,
    'text-offset': [0, 0.5],
    'text-anchor': 'center',
    'symbol-placement': 'line',
    'text-justify': 'center',
    'text-allow-overlap': true,
    'text-rotation-alignment': 'map',
    'text-letter-spacing': 0.1,
    'text-transform': 'uppercase',
    'symbol-z-order': 'source',
    'symbol-sort-key': 1
  },
  paint: {
    'text-color': '#FFFFFF',
    'text-halo-color': 'rgba(0, 0, 0, 0.75)',
    'text-halo-width': 3,
    'text-halo-blur': 1,
    'text-translate': [0, 0],
    'text-translate-anchor': 'viewport'
  }
};

export default function TerrainMap() {
  return (
    <Map
      initialViewState={PALISADES_COORDINATES}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/satellite-v9"
      mapboxAccessToken={MAPBOX_TOKEN}
      terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
    >
      <Source
        id="mapbox-dem"
        type="raster-dem"
        url="mapbox://mapbox.mapbox-terrain-dem-v1"
        tileSize={512}
        maxzoom={14}
      />

      {/* Aerial Tram lift source and layers */}
      <Source id="aerial-tram" type="geojson" data={aerialTramData}>
        <Layer {...liftLayerStyle} />
        <Layer {...liftLabelStyle} />
      </Source>
    </Map>
  );
} 