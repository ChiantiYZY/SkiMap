import Map, { Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiY2hpYW50aXl6eSIsImEiOiJjbTY1dWQ4YTcxenNuMnBvZDV0dzUxeWRrIn0.r_3omZ6pLIuCzapjpvVHdQ'; // You'll need to get this from mapbox.com
const PALISADES_COORDINATES = {
  latitude: 39.1969,
  longitude: -120.2358,
  zoom: 13,
  pitch: 60,
  bearing: 0
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
    </Map>
  );
} 