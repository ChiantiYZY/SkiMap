import { useState } from 'react';

interface ResortSelectorProps {
  onResortChange: (resort: string) => void;
}

const AVAILABLE_RESORTS = [
  'Palisades Tahoe',
  'Alpine Meadows',
  'Northstar',
  'Heavenly',
  // Add more resorts as needed
];

export default function ResortSelector({ onResortChange }: ResortSelectorProps) {
  return (
    <select 
      onChange={(e) => onResortChange(e.target.value)}
      className="fixed top-4 left-4 z-10 bg-white bg-opacity-90 px-4 py-2 rounded-md shadow-lg"
    >
      {AVAILABLE_RESORTS.map(resort => (
        <option key={resort} value={resort}>
          {resort}
        </option>
      ))}
    </select>
  );
} 