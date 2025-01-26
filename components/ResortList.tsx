import { useState } from 'react';
import { ResortName, RESORT_COORDINATES } from '@/app/json/resortCoordinates';

interface ResortListProps {
  onResortChange: (resort: ResortName) => void;
  selectedResort: ResortName;
}

export default function ResortList({ onResortChange, selectedResort }: ResortListProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get array of resort names from RESORT_COORDINATES
  const filteredResorts = Object.keys(RESORT_COORDINATES) as ResortName[];

  return (
    <div className="fixed top-4 left-4 z-10 bg-white bg-opacity-95 rounded-lg shadow-lg w-64">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="font-bold text-lg">Ski Resorts</h2>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Resort List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredResorts.map((resort) => (
              <button
                key={resort}
                onClick={() => onResortChange(resort)}
                className={`w-full text-left p-4 hover:bg-gray-100 transition-colors
                  ${selectedResort === resort ? 'bg-blue-50' : ''}
                  border-b last:border-b-0`}
              >
                <div className="font-medium">{resort}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 