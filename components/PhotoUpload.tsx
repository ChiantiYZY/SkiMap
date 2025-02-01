import { useState, useEffect } from 'react';
import Image from 'next/image';
import heic2any from 'heic2any';
import exifr from 'exifr';  // Using exifr for better EXIF parsing

interface PhotoLocation {
  latitude: number;
  longitude: number;
  timestamp?: string;
  thumbnail: string;
  url: string;  // Add this for the full-size image URL
  file: File;  // Store the actual file
}

interface PhotoUploadProps {
  onPhotoAdd: (photo: PhotoLocation) => void;
}

const uploadPhoto = async (photoData: PhotoLocation): Promise<PhotoLocation> => {
  const formData = new FormData();
  formData.append('file', photoData.file);
  formData.append('latitude', photoData.latitude.toString());
  formData.append('longitude', photoData.longitude.toString());
  formData.append('timestamp', photoData.timestamp || new Date().toISOString());

  const response = await fetch('/api/uploadImage', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Upload failed');
  }

  const data = await response.json();
  
  return {
    ...photoData,
    thumbnail: data.thumbnail,
    url: data.url  // Include the full-size image URL
  };
};

export default function PhotoUpload({ onPhotoAdd }: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any existing object URLs
    };
  }, []);

  const convertHeicToJpeg = async (file: File): Promise<File> => {
    if (file.type === 'image/heic' || file.type === 'image/heif') {
      setIsConverting(true);
      try {
        const jpegBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        });
        
        // Convert Blob to File
        return new File([jpegBlob as Blob], file.name.replace(/\.heic$/i, '.jpg'), {
          type: 'image/jpeg'
        });
      } catch (error) {
        console.error('Error converting HEIC:', error);
        throw error;
      } finally {
        setIsConverting(false);
      }
    }
    return file;
  };

  const extractExifData = async (file: File): Promise<PhotoLocation | null> => {
    try {
      // Parse EXIF data using exifr
      const exif = await exifr.parse(file, true);
      
      if (exif?.latitude && exif?.longitude) {
        return {
          latitude: exif.latitude,
          longitude: exif.longitude,
          timestamp: exif.DateTimeOriginal?.toISOString() || new Date().toISOString(),
          thumbnail: URL.createObjectURL(file),
          url: URL.createObjectURL(file),  // Use the same URL for both thumbnail and full-size image
          file: file  // Store the original file
        };
      }
      return null;
    } catch (error) {
      console.error('Error parsing EXIF:', error);
      return null;
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.heic')) {
      alert('Please upload an image file');
      return;
    }

    try {
      const processedFile = await convertHeicToJpeg(file);
      const photoData = await extractExifData(processedFile);
      
      if (photoData) {
        const uploadedPhoto = await uploadPhoto(photoData);
        onPhotoAdd(uploadedPhoto);
      } else {
        alert('No GPS data found in image');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try another file.');
    }
  };

  return (
    <div className="inline-block">
      <div
        className={`bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-lg backdrop-blur-sm transition-colors whitespace-nowrap cursor-pointer`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        <input
          type="file"
          accept="image/*,.heic,.heif"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className="text-white text-sm cursor-pointer"
        >
          Upload Photo
        </label>
      </div>
    </div>
  );
} 