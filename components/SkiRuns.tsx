import { Line, Text } from "@react-three/drei"
import { useState } from "react"
import { Vector3 } from "three"

export const skiRunsData = [
  {
    name: "Easy Run",
    color: "green",
    points: [
      [-5, 5, 0],
      [-3, 3, 2],
      [-1, 1, 0],
      [0, -2, 0],
    ],
  },
  {
    name: "Intermediate Run",
    color: "blue",
    points: [
      [0, 5, 0],
      [2, 3, -2],
      [4, 1, 0],
      [5, -2, 0],
    ],
  },
  {
    name: "Expert Run",
    color: "black",
    points: [
      [5, 5, 0],
      [3, 3, 2],
      [1, 1, -2],
      [0, -2, 0],
    ],
  },
]

export interface RunData {
  name: string;
  color: string;
  points: [number, number, number][];
}

// Move fetchRunsData outside the component
export const fetchRunsData = async () => {
  try {
    const response = await fetch('/api/FetchRunsData');
    const data = await response.json();
    console.log("Request sent, data: ", data);
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching runs data:', error);
    return [];
  }
};

// Create a custom hook for managing runs data
export const useRunsData = () => {
  const [dynamicRuns, setDynamicRuns] = useState<RunData[]>([]);

  const handleFetchRuns = async () => {
    const data = await fetchRunsData();
    setDynamicRuns(data);
  };

  return { dynamicRuns, handleFetchRuns };
};

interface SkiRunsProps {
  dynamicRuns: RunData[];
}

export default function SkiRuns({ dynamicRuns }: SkiRunsProps) {
  // Helper function to get the position and rotation for the text label
  const getTextProperties = (points: [number, number, number][]) => {
    if (points.length < 2) return { position: new Vector3(0, 0, 0), rotation: [0, 0, 0] };

    // Get first two points to calculate direction
    const [x1, y1, z1] = points[0];
    const [x2, y2, z2] = points[1];

    // Calculate direction vector
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dz = z2 - z1;

    // Calculate angle in radians
    const angle = Math.atan2(dy, dx);

    // Position text above and slightly ahead of the first point
    const position = new Vector3(
      x1 + dx * 0.1, // Move 10% along the direction
      y1 + dy * 0.1 + 0.5, // Move up by 0.5 units
      z1 + dz * 0.1
    );

    // Return both position and rotation
    return {
      position,
      rotation: [0, 0, angle] // Rotate around Z axis to match slope
    };
  };

  return (
    <>
      {/* Static runs */}
      {skiRunsData.map((run, index) => {
        const { position, rotation } = getTextProperties(run.points);
        return (
          <group key={`static-${index}`}>
            <Line 
              points={run.points} 
              color={run.color} 
              lineWidth={5} 
            />
            <Text
              position={position}
              rotation={rotation}
              color={run.color}
              fontSize={0.5}
              anchorX="center"
              anchorY="bottom"
            >
              {run.name}
            </Text>
          </group>
        );
      })}
      
      {/* Dynamic runs */}
      {dynamicRuns.map((run, index) => {
        const { position, rotation } = getTextProperties(run.points);
        return (
          <group key={`dynamic-${index}`}>
            <Line 
              points={run.points} 
              color={run.color} 
              lineWidth={5} 
            />
            <Text
              position={position}
              rotation={rotation}
              color={run.color}
              fontSize={0.5}
              anchorX="center"
              anchorY="bottom"
            >
              {run.name}
            </Text>
          </group>
        );
      })}
    </>
  )
}

