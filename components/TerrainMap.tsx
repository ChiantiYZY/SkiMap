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
import { Compass } from 'lucide-react';
import VideoUpload from './VideoUpload';
import GPSUpload from './GPSUpload';
import { GPXPoint } from '@/utils/gpxParser';

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
  photos: PhotoLocation[];
  gpsFiles: GPSLocation[];
  gpxPoints?: GPXPoint[];
}

interface PhotoLocation {
  latitude: number;
  longitude: number;
  timestamp?: string;
  thumbnail: string;
  url: string;
  file: File;
}

interface GPSLocation {
  latitude: number;
  longitude: number;
  timestamp?: string;
  url: string;
  file: File;
}

async function fetchSavedViewState(resortName: string) {
  try {
    const response = await fetch(`/api/GetViewState?resort=${encodeURIComponent(resortName)}`);
    if (response.ok) {
      const data = await response.json();
      return data.viewState;
    }
  } catch (error) {
    console.error('Error fetching viewstate:', error);
  }
  return null;
}

export default function TerrainMap({ 
  resortName, 
  photos, 
  gpsFiles,
  gpxPoints 
}: TerrainMapProps) {
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
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoLocation | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showRuns, setShowRuns] = useState(true);
  const [hoveredRunId, setHoveredRunId] = useState<string | null>(null);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const animationRef = useRef<number | null>(null);
  const [orbitSpeed, setOrbitSpeed] = useState(0.5);
  const [selectedRun, setSelectedRun] = useState<any>(null);

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
    const loadResort = async () => {
      setIsTransitioning(true);
      const map = mapRef.current?.getMap();
      
      if (map) {
        // Try to get saved viewstate first
        const savedViewState = await fetchSavedViewState(resortName);
        
        if (savedViewState) {
          console.log('Using saved viewstate for', resortName);
          map.jumpTo(savedViewState);
          setViewState(savedViewState);
        } else {
          console.log('Using default viewstate for', resortName);
          map.jumpTo(RESORT_COORDINATES[resortName]);
          setViewState(RESORT_COORDINATES[resortName]);
        }
      }

      setTimeout(() => {
        setIsTransitioning(false);
      }, 1000);
    };

    loadResort();
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

  // Update the orbit animation effect
  useEffect(() => {
    if (!isOrbiting || !mapRef.current) return;

    let bearing = viewState.bearing || 0;
    const animate = () => {
      if (!isOrbiting || !mapRef.current) return;
      
      bearing = (bearing + orbitSpeed) % 360;
      const center = RESORT_COORDINATES[resortName];
      
      mapRef.current.getMap().easeTo({
        bearing,
        center: [center.longitude, center.latitude],
        pitch: 60,
        duration: 0
      });

      setViewState(prev => ({
        ...prev,
        bearing,
        pitch: 60,
        longitude: center.longitude,
        latitude: center.latitude,
        zoom: prev.zoom
      }));
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOrbiting, resortName, orbitSpeed]);

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
        ['==', ['get', 'id'], hoveredRunId], 4,
        ['==', ['get', 'id'], selectedRun ? selectedRun.id : ''], 4,
        2  // Default width
      ],
      'line-opacity': [
        'case',
        ['==', ['get', 'id'], hoveredRunId], 1,
        ['==', ['get', 'id'], selectedRun ? selectedRun.id : ''], 1,
        0.8  // Default opacity
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
        interactiveLayerIds={['runs']}
        onMouseEnter={(e) => {
          if (e.features?.[0]) {
            setHoveredRunId(e.features[0].properties.id);
            e.target.getCanvas().style.cursor = 'pointer';
          }
        }}
        onMouseLeave={() => {
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
        onClick={(e) => {
          if (e.features?.[0]) {
            setSelectedRun(e.features[0].properties);
          }
        }}
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
        <LiftAnimation lift={tramFeature} gpxPoints={gpxPoints} />

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
        <div className="flex items-center gap-2">
          <LayerToggle 
            label="Orbit View"
            checked={isOrbiting}
            onChange={setIsOrbiting}
          />
          {isOrbiting && (
            <div className="flex items-center gap-2 ml-2">
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={orbitSpeed}
                onChange={(e) => setOrbitSpeed(parseFloat(e.target.value))}
                className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-white text-xs">{orbitSpeed.toFixed(1)}x</span>
            </div>
          )}
        </div>
      </div>

      {/* Compass */}
      <div 
        className="absolute top-36 right-4 bg-black/30 p-2 rounded-full backdrop-blur-sm z-10 cursor-pointer"
        style={{ 
          transform: `rotate(${-viewState.bearing || 0}deg)`,
          transition: 'transform 0.3s ease-out'
        }}
        onClick={async () => {
          const savedViewState = await fetchSavedViewState(resortName);
          if (savedViewState && mapRef.current) {
            console.log("saved view state", savedViewState);
            
            mapRef.current.getMap().easeTo({
              center: [savedViewState.longitude, savedViewState.latitude],
              zoom: savedViewState.zoom,
              bearing: savedViewState.bearing || 0,
              pitch: savedViewState.pitch || 0,
              duration: 1000
            });

            // await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }}
      >
        <div className="relative w-8 h-8">
          {/* Outer circle */}
          <div className="absolute inset-0 border-2 border-gray-300 rounded-full" />
          
          {/* North pointer */}
          <div className="absolute w-4 h-4 left-[55%] top-1/2 -translate-x-1/2 -translate-y-full">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[16px] border-b-blue-600" />
          </div>
          
          {/* South pointer */}
          <div className="absolute w-4 h-4 left-[57%] top-1/2 -translate-x-1/2">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[16px] border-t-red-600" />
          </div>
          
          {/* N label */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 text-gray-300 text-xs font-medium">
            N
          </div>
        </div>
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

      {/* Add run info panel */}
      {selectedRun && (
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg w-80">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">{selectedRun.name}</h3>
            <button 
              onClick={() => setSelectedRun(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <div className="space-y-2">
            <p><span className="font-medium">Difficulty:</span> {selectedRun.difficulty}</p>
            <p><span className="font-medium">Length:</span> {selectedRun.lengthInKm * 1000} m</p>
            <p><span className="font-medium">Vertical Drop:</span> {selectedRun.verticalDrop}m</p>
            <p><span className="font-medium">Max Slope:</span> {selectedRun.maxSlope}°</p>
          </div>
        </div>
      )}

      {/* Save Spot button */}
      <div className="absolute bottom-4 right-4 z-10">
        <button
          onClick={async () => {
            const currentViewState = {
              bearing: viewState.bearing || 0,
              zoom: viewState.zoom || 0,
              latitude: viewState.latitude,
              longitude: viewState.longitude,
              pitch: viewState.pitch || 0
            };

            try {
              const response = await fetch('/api/SaveViewState', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  resortName,
                  viewState: currentViewState
                })
              });

              if (response.ok) {
                console.log('ViewState saved successfully');
              } else {
                console.error('Failed to save viewState');
              }
            } catch (error) {
              console.error('Error saving viewState:', error);
            }
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm transition-colors"
        >
          Save Spot
        </button>
      </div>
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