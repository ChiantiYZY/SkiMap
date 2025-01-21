import { useState } from 'react';

interface ResortListProps {
  onResortChange: (resort: string) => void;
  selectedResort: string;
}

interface Resort {
  name: string;
  region: string;
  state: string;
}

const AVAILABLE_RESORTS: Resort[] = [
  { name: 'Palisades Tahoe', region: 'Lake Tahoe', state: 'California' },
  { name: 'Alpine Meadows', region: 'Lake Tahoe', state: 'California' },
  { name: 'Northstar', region: 'Lake Tahoe', state: 'California' },
  { name: 'Heavenly', region: 'Lake Tahoe', state: 'California' },
  { name: 'Mammoth Mountain', region: 'Eastern Sierra', state: 'California' },
  { name: 'Kirkwood', region: 'Lake Tahoe', state: 'California' },
];

export default function ResortList({ onResortChange, selectedResort }: ResortListProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResorts = AVAILABLE_RESORTS.filter(resort =>
    resort.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resort.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          {/* Search Box */}
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Search resorts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Resort List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredResorts.map((resort) => (
              <button
                key={resort.name}
                onClick={() => onResortChange(resort.name)}
                className={`w-full text-left p-4 hover:bg-gray-100 transition-colors
                  ${selectedResort === resort.name ? 'bg-blue-50' : ''}
                  border-b last:border-b-0`}
              >
                <div className="font-medium">{resort.name}</div>
                <div className="text-sm text-gray-500">
                  {resort.region}, {resort.state}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 