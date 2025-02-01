import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface GPSLocation {
  latitude: number;
  longitude: number;
  timestamp?: string;
  url: string;
  file: File;
}

interface GPSUploadProps {
  onGPSAdd: (gps: GPSLocation) => void;
}

export default function GPSUpload({ onGPSAdd }: GPSUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file || !file.name.endsWith('.gpx')) return;

    try {
      const text = await file.text();
      const parser = new DOMParser();
      const gpxDoc = parser.parseFromString(text, "text/xml");
      const trkpts = gpxDoc.getElementsByTagName("trkpt");
      
      if (trkpts.length > 0) {
        const firstPoint = trkpts[0];
        const lat = parseFloat(firstPoint.getAttribute("lat") || "0");
        const lon = parseFloat(firstPoint.getAttribute("lon") || "0");
        const time = firstPoint.getElementsByTagName("time")[0]?.textContent;

        onGPSAdd({
          latitude: lat,
          longitude: lon,
          timestamp: time,
          url: URL.createObjectURL(file),
          file: file
        });
      }
    } catch (error) {
      console.error('Error processing GPX file:', error);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.gpx')) {
      handleFile(file);
    }
  };

  return (
    <div className="inline-block">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".gpx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      
      <button
        className={`bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-lg backdrop-blur-sm transition-colors whitespace-nowrap`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <span className="text-white text-sm">Upload GPS</span>
      </button>
    </div>
  );
} 