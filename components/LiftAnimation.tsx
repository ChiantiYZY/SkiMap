import { useEffect, useRef, useState } from 'react';
import { Source, Layer, LayerProps } from 'react-map-gl';

interface LiftAnimationProps {
  lift: any;  // The lift feature to animate along
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
    start[1] + (end[1] - start[1]) * segmentPercentage
  ];
}

export default function LiftAnimation({ lift }: LiftAnimationProps) {
  const [dotPosition, setDotPosition] = useState<any>({
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: lift?.geometry.coordinates[0] || [0, 0]
      }
    }]
  });

  const animationFrame = useRef<number>();
  const startTime = useRef<number>();

  useEffect(() => {
    if (!lift) return;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = (timestamp - startTime.current) % 6000; // 6-second loop
      const percentage = (progress / 6000);

      const coordinates = lift.geometry.coordinates;
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
  }, [lift]);

  if (!lift) return null;

  return (
    <Source id="dot" type="geojson" data={dotPosition}>
      <Layer {...dotLayerStyle} />
    </Source>
  );
} 