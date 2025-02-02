import { useEffect, useRef, useState } from 'react';
import { Source, Layer, LayerProps } from 'react-map-gl';
import { GPXPoint } from '../utils/gpxParser';

interface LiftAnimationProps {
  lift?: any;
  gpxPoints?: GPXPoint[];
}

const dotLayerStyle: LayerProps = {
  id: 'tram-animation-dot',
  type: 'circle',
  paint: {
    'circle-radius': 6,
    'circle-color': '#FF0000',
    'circle-opacity': 0.8,
    'circle-stroke-color': '#FFFFFF',
    'circle-stroke-width': 2
  }
};

// Helper function to get point along a line
function getPointAlongLine(coordinates: number[][], percentage: number) {
  const totalSegments = coordinates.length - 1;
  const segmentIndex = Math.min(
    Math.floor(percentage * totalSegments),
    totalSegments - 1
  );
  
  const start = coordinates[segmentIndex];
  const end = coordinates[segmentIndex + 1];
  const segmentPercentage = (percentage * totalSegments) % 1;

  return [
    start[0] + (end[0] - start[0]) * segmentPercentage,
    start[1] + (end[1] - start[1]) * segmentPercentage,
    start[2] + (end[2] - start[2]) * segmentPercentage
  ];
}

export default function LiftAnimation({ lift, gpxPoints }: LiftAnimationProps) {
  const [dotPosition, setDotPosition] = useState<any>({
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      }
    }]
  });

  const animationFrame = useRef<number>();
  const startTime = useRef<number>();

  useEffect(() => {
    // Reset animation when gpxPoints changes
    startTime.current = undefined;
    
    // Clear previous animation
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    if (!gpxPoints?.length && !lift) return;

    console.log("Starting animation with points:", gpxPoints?.length || 'using lift');
    
    const coordinates = gpxPoints?.length ? 
      gpxPoints.map(p => [p.longitude, p.latitude, p.elevation]) :
      lift?.geometry.coordinates;

    console.log("Coordinates with elevation:", coordinates);

    if (!coordinates?.length) return;

    // Set initial position
    setDotPosition({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coordinates[0]
        }
      }]
    });

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = (timestamp - startTime.current) % 6000;
      const percentage = progress / 6000;

      const position = getPointAlongLine(coordinates, percentage);

      setDotPosition({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: position
          }
        }]
      });

      animationFrame.current = requestAnimationFrame(animate);
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [gpxPoints, lift]); // Dependency on gpxPoints and lift

  return (
    <Source id="dot" type="geojson" data={dotPosition}>
      <Layer {...dotLayerStyle} />
    </Source>
  );
} 