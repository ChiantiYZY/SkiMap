import { useEffect, useState, useRef } from 'react';
import Map, { Source, Layer, LayerProps, ViewState, MapRef, Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import LiftAnimation from './LiftAnimation';
import { MAPBOX_TOKEN } from '../config/mapbox-config';
import { RESORT_COORDINATES, ResortName } from '@/app/json/resortCoordinates';
import LayerToggle from './LayerToggle';
import Image from 'next/image';
import PhotoUpload from './PhotoUpload';
import ImagePreview from './ImagePreview';

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

interface TerrainMapProps {
  resortName: ResortName;
}

interface PhotoLocation {
  latitude: number;
  longitude: number;
  timestamp?: string;
  thumbnail: string;
  url: string;
  file: File;
}

export default function TerrainMap({ resortName }: TerrainMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState<Partial<ViewState>>(RESORT_COORDINATES[resortName]);
  const [liftsData, setLiftsData] = useState<LiftFeatureCollection>({
    type: 'FeatureCollection',
    features: []
  });
  const [tramFeature, setTramFeature] = useState<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showLifts, setShowLifts] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [runsData, setRunsData] = useState<LiftFeatureCollection>({
    type: 'FeatureCollection',
    features: []
  });
  const [photos, setPhotos] = useState<PhotoLocation[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoLocation | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showRuns, setShowRuns] = useState(true);
  const [hoveredRunId, setHoveredRunId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLifts = async () => {
      try {
        const response = await fetch(`/api/GetLifts?resort=${encodeURIComponent(resortName)}`);
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
  }, [resortName]);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        const response = await fetch(`/api/GetRuns?resort=${encodeURIComponent(resortName)}`);
        const data = await response.json();

        if (data.features) {
          console.log(data)
          setRunsData(data);
        }
      } catch (error) {
        console.error('Error fetching runs:', error);
      }
    };

    fetchRuns();
  }, [resortName]);

  // Update view when resort changes
  useEffect(() => {
    setIsTransitioning(true);
    const map = mapRef.current?.getMap();
    
    if (map) {
      console.log(resortName)
      map.jumpTo(RESORT_COORDINATES[resortName]);
      setViewState(RESORT_COORDINATES[resortName]);
    }

    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  }, [resortName]);

  // Clean up object URLs when photos change
  useEffect(() => {
    return () => {
      // Clean up object URLs when component unmounts
      photos.forEach(photo => {
        URL.revokeObjectURL(photo.thumbnail);
      });
    };
  }, [photos]);

  const runsLayer: LayerProps = {
    id: 'runs',
    type: 'line',
    paint: {
      'line-color': [
        'match',
        ['get', 'colorName'],
        'green', '#008000',
        'blue', '#0000FF',
        'black', '#000000',
        '#CCCCCC'
      ],
      'line-width': [
        'case',
        ['==', ['get', 'id'], hoveredRunId], 4,  // Increase width when hovered
        2  // Default width
      ],
      'line-opacity': [
        'case',
        ['==', ['get', 'id'], hoveredRunId], 1,  // Full opacity when hovered
        0.8  // Slightly transparent by default
      ]
    }
  };

  const runLabelLayer: LayerProps = {
    id: 'run-labels',
    type: 'symbol',
    layout: {
      'text-field': ['get', 'name'],
      'text-size': 12,
      'text-offset': [0, 1],
      'text-anchor': 'center',
      'symbol-placement': 'line',
      'text-justify': 'center',
      'text-allow-overlap': false,
      'text-ignore-placement': false,
      'text-rotation-alignment': 'map',
      'symbol-spacing': 250,  // Space between repeated labels
      'text-max-angle': 30   // Max angle between characters
    },
    paint: {
      'text-color': '#FFFFFF',
      'text-halo-color': 'rgba(0, 0, 0, 0.75)',
      'text-halo-width': 2
    }
  };

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onMouseEnter="runs"
        onMouseMove={(e) => {
          if (e.features?.[0]) {
            setHoveredRunId(e.features[0].properties.id);
            e.target.getCanvas().style.cursor = 'pointer';
          }
        }}
        onMouseLeave="runs"
        onMouseOut={() => {
          setHoveredRunId(null);
          if (mapRef.current) {
            mapRef.current.getCanvas().style.cursor = '';
          }
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
        terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
        minZoom={13}
        maxZoom={20}
        onLoad={() => setIsMapLoaded(true)}
      >
        <Source
          id="mapbox-dem"
          type="raster-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={512}
          maxzoom={14}
        />

        {showRuns && (
          <Source id="runs" type="geojson" data={runsData}>
            <Layer {...runsLayer} />
            <Layer {...runLabelLayer} />
          </Source>
        )}

        {/* Only render lift layers if showLifts is true */}
        {showLifts && (
          <Source id="lifts" type="geojson" data={liftsData}>
            <Layer {...liftLayerStyle} />
            <Layer {...liftLabelStyle} />
          </Source>
        )}

        {/* Animated dot */}
        <LiftAnimation lift={tramFeature} />

        {photos.map((photo, index) => (
          <Marker
            key={index}
            latitude={photo.latitude}
            longitude={photo.longitude}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedPhoto(photo);
            }}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-lg">
              <Image
                src={photo.thumbnail}
                alt="Photo location"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
          </Marker>
        ))}

        {selectedPhoto && (
          <Popup
            latitude={selectedPhoto.latitude}
            longitude={selectedPhoto.longitude}
            anchor="bottom"
            onClose={() => setSelectedPhoto(null)}
            closeButton={true}
          >
            <div className="p-2">
              <div 
                className="cursor-pointer"
                onClick={() => setPreviewImage(selectedPhoto.url)}
              >
                <Image
                  src={selectedPhoto.thumbnail}
                  alt="Selected photo"
                  width={200}
                  height={150}
                  className="rounded-lg hover:opacity-90 transition-opacity"
                />
              </div>
              <p className="text-sm mt-2 text-gray-600">
                {new Date(selectedPhoto.timestamp).toLocaleString()}
              </p>
            </div>
          </Popup>
        )}
      </Map>

      {/* Add layer controls */}
      <div className="absolute top-4 right-4 bg-black/30 p-4 rounded-lg backdrop-blur-sm z-10 space-y-2">
        <div className="text-white mb-2">{resortName}</div>
        <LayerToggle 
          label="Show Lifts"
          checked={showLifts}
          onChange={setShowLifts}
        />
        <LayerToggle 
          label="Show Runs"
          checked={showRuns}
          onChange={setShowRuns}
        />
      </div>

      {/* Loading overlay */}
      {(!isMapLoaded || isTransitioning) && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      {previewImage && (
        <ImagePreview 
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}

      <PhotoUpload onPhotoAdd={(photo) => setPhotos(prev => [...prev, photo])} />
    </div>
  );
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
} 