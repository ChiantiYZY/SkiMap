"use client"

import TerrainMap from '@/components/TerrainMap';
import ResortList from '@/components/ResortList';
import { useState, useEffect } from 'react';
import { ResortName } from './json/resortCoordinates';
import PhotoUpload from '@/components/PhotoUpload';
import GPSUpload from '@/components/GPSUpload';
import { PhotoLocation, GPSLocation } from '@/types';
import { parseGPX } from '@/utils/gpxParser';
import { GPXPoint } from '@/types';

export default function Home() {
  const [selectedResort, setSelectedResort] = useState<ResortName>('Palisades Tahoe Olympic Valley');
  const [photos, setPhotos] = useState<PhotoLocation[]>([]);
  const [gpsFiles, setGPSFiles] = useState<GPSLocation[]>([]);
  const [selectedGPXIndex, setSelectedGPXIndex] = useState<number | null>(null);
  const [gpxPoints, setGPXPoints] = useState<GPXPoint[]>([]);

  const handleGPXSelect = async (index: number) => {
    setSelectedGPXIndex(index);
    const file = gpsFiles[index].file;
    const content = await file.text();
    const points = parseGPX(content);
    setGPXPoints(points);

    console.log("Selected GPX file", file.name);
  };

  useEffect(() => {
    const loadStoredGPXFiles = async () => {
      try {
        const response = await fetch('/api/gpx');
        if (!response.ok) throw new Error('Failed to fetch GPX files');
        
        const { files } = await response.json();
        
        // Clear existing files before loading
        setGPSFiles([]);
        
        // Load each file
        for (const fileName of files) {
          const fileResponse = await fetch(`/api/gpx?file=${encodeURIComponent(fileName)}`);
          const blob = await fileResponse.blob();
          const file = new File([blob], fileName, { type: 'application/gpx+xml' });
          
          // Create GPSLocation object
          const text = await file.text();
          const parser = new DOMParser();
          const gpxDoc = parser.parseFromString(text, "text/xml");
          const trkpts = gpxDoc.getElementsByTagName("trkpt");
          
          if (trkpts.length > 0) {
            const firstPoint = trkpts[0];
            const lat = parseFloat(firstPoint.getAttribute("lat") || "0");
            const lon = parseFloat(firstPoint.getAttribute("lon") || "0");
            const time = firstPoint.getElementsByTagName("time")[0]?.textContent;

            setGPSFiles(prev => {
              // Check if file already exists in state
              if (prev.some(f => f.file.name === fileName)) {
                return prev;
              }
              return [...prev, {
                latitude: lat,
                longitude: lon,
                timestamp: time,
                url: URL.createObjectURL(file),
                file: file
              }];
            });
          }
        }
      } catch (error) {
        console.error('Error loading stored GPX files:', error);
      }
    };

    loadStoredGPXFiles();
  }, []);

  return (
    <main className="flex h-screen">
      <div className="w-2/3 h-full relative">
        <ResortList 
          onResortChange={setSelectedResort}
          selectedResort={selectedResort}
        />
        <TerrainMap 
          resortName={selectedResort}
          photos={photos}
          gpsFiles={gpsFiles}
          gpxPoints={gpxPoints}
        />
      </div>
      <div className="w-1/3 h-full bg-gray-50 p-4 relative">
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">GPS Tracks</h3>
          <div className="space-y-2">
            {gpsFiles.map((gps, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-2 bg-white rounded-lg shadow-sm cursor-pointer
                  ${selectedGPXIndex === index ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleGPXSelect(index)}
              >
                <span className="text-sm truncate">
                  {gps.file.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedGPXIndex === index) {
                      setSelectedGPXIndex(null);
                      setGPXPoints([]);
                    }
                    setGPSFiles(prev => prev.filter((_, i) => i !== index));
                  }}
                  className="text-red-500 hover:text-red-700 text-sm px-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Buttons */}
        <div className="absolute bottom-4 left-4 space-x-2.5">
          <PhotoUpload onPhotoAdd={(photo) => setPhotos(prev => [...prev, photo])} />
          <GPSUpload onGPSAdd={(gps) => setGPSFiles(prev => [...prev, gps])} />
        </div>
      </div>
    </main>
  );
}

