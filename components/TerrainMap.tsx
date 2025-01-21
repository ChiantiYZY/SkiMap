import { useEffect, useState } from 'react';
import Map, { Source, Layer, LayerProps } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import LiftAnimation from './LiftAnimation';
import { MAPBOX_TOKEN } from '../config/mapbox-config';

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
  id: 'lifts',
  type: 'line',
  paint: {
    'line-color': [
      'match',
      ['get', 'liftType'],
      'cable_car', '#FF0000',    // Red for cable cars
      'gondola', '#0000FF',      // Blue for gondolas
      'chair_lift', '#00FF00',   // Green for chair lifts
      'platter', '#FFA500',      // Orange for platter lifts
      'j-bar', '#800080',        // Purple for j-bars
      'magic_carpet', '#FFFF00', // Yellow for magic carpets
      't-bar', '#FFC0CB',        // Pink for t-bars
      '#FFFFFF'                  // White for any other types
    ],
    'line-width': 4,
    'line-dasharray': [2, 1]
  }
};

const liftLabelStyle: LayerProps = {
  id: 'lift-labels',
  type: 'symbol',
  layout: {
    'text-field': ['get', 'name'],
    'text-size': 10,
    'text-offset': [0, 1],
    'text-anchor': 'center',
    'symbol-placement': 'line',
    'text-justify': 'center',
    'text-allow-overlap': false,
    'text-ignore-placement': false,
    'text-rotation-alignment': 'map',
    'text-letter-spacing': 0.1,
    'text-transform': 'uppercase',
    'symbol-z-order': 'source',
    'symbol-sort-key': 1,
    'text-padding': 5,
    'symbol-spacing': 250,
    'text-max-angle': 45,
    'text-optional': true
  },
  paint: {
    'text-color': '#FFFFFF',
    'text-halo-color': 'rgba(0, 0, 0, 0.75)',
    'text-halo-width': 3,
    'text-halo-blur': 1,
    'text-translate': [0, 0],
    'text-translate-anchor': 'viewport',
    'text-opacity': 0.9
  }
};

interface LiftFeatureCollection {
  type: 'FeatureCollection';
  features: any[];
}

export default function TerrainMap() {
  const [liftsData, setLiftsData] = useState<LiftFeatureCollection>({
    type: 'FeatureCollection',
    features: []
  });
  const [tramFeature, setTramFeature] = useState<any>(null);

  useEffect(() => {
    const fetchLifts = async () => {
      try {
        const response = await fetch('/api/GetLifts?resort=Palisades Tahoe');
        const data = await response.json();
        if (data.features) {
          setLiftsData(data);
          // Find the aerial tram feature
          const tram = data.features.find((f: any) => 
            f.properties.liftType === 'cable_car' && 
            f.properties.name.toLowerCase().includes('aerial tram')
          );
          if (tram) {
            setTramFeature(tram);
          }
        }
      } catch (error) {
        console.error('Error fetching lifts:', error);
      }
    };

    fetchLifts();
  }, []);

  return (
    <Map
      initialViewState={PALISADES_COORDINATES}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/satellite-v9"
      mapboxAccessToken={MAPBOX_TOKEN}
      terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
      minZoom={13}
      maxZoom={20}
    >
      <Source
        id="mapbox-dem"
        type="raster-dem"
        url="mapbox://mapbox.mapbox-terrain-dem-v1"
        tileSize={512}
        maxzoom={14}
      />

      {/* All lifts source and layers */}
      <Source id="lifts" type="geojson" data={liftsData}>
        <Layer {...liftLayerStyle} />
        <Layer {...liftLabelStyle} />
      </Source>

      {/* Animated dot */}
      <LiftAnimation lift={tramFeature} />
    </Map>
  );
} 