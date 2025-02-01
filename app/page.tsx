"use client"

import TerrainMap from '@/components/TerrainMap';
import ResortList from '@/components/ResortList';
import { useState } from 'react';
import { ResortName } from './json/resortCoordinates';
import PhotoUpload from '@/components/PhotoUpload';
import GPSUpload from '@/components/GPSUpload';
import { PhotoLocation, GPSLocation } from '@/types';

export default function Home() {
  const [selectedResort, setSelectedResort] = useState<ResortName>('Palisades Tahoe Olympic Valley');
  const [photos, setPhotos] = useState<PhotoLocation[]>([]);
  const [gpsFiles, setGPSFiles] = useState<GPSLocation[]>([]);

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
        />
      </div>
      <div className="w-1/3 h-full bg-gray-50 p-4 relative">
        <div className="absolute bottom-4 left-4 space-x-2.5">
          <PhotoUpload onPhotoAdd={(photo) => setPhotos(prev => [...prev, photo])} />
          <GPSUpload onGPSAdd={(gps) => setGPSFiles(prev => [...prev, gps])} />
        </div>
      </div>
    </main>
  );
}

