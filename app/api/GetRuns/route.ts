import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Helper function to read the GeoJSON file
async function readRunsData() {
  try {
    const filePath = path.join(process.cwd(), 'JSON', 'test_run.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');

    const data = JSON.parse(fileContent);
    return data;
  } catch (error) {
    console.error('Error reading runs.geojson:', error);
    // Return empty GeoJSON if file doesn't exist
    return {
      type: 'FeatureCollection',
      features: []
    };
  }
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Add helper function to calculate length in km
function calculateLengthInKm(coordinates: number[][]): number {
  let length = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lon1, lat1] = coordinates[i];
    const [lon2, lat2] = coordinates[i + 1];
    length += calculateDistance(lat1, lon1, lat2, lon2);
  }
  return Number(length.toFixed(2));
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Add helper function to calculate vertical drop in meters
function calculateVerticalDrop(coordinates: number[][]): number {
  let maxElevation = -Infinity;
  let minElevation = Infinity;
  
  coordinates.forEach(coord => {
    const elevation = coord[2] || 0;  // Get elevation from z-coordinate
    maxElevation = Math.max(maxElevation, elevation);
    minElevation = Math.min(minElevation, elevation);
  });
  console.log("Max elevation ", maxElevation, " min elevation ", minElevation, " drop ", Math.round(maxElevation - minElevation))
  return Math.round(maxElevation - minElevation);
}

// Add helper function to calculate max slope angle in degrees
function calculateMaxSlope(coordinates: number[][]): number {
  let maxSlope = 0;
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lon1, lat1, elev1] = coordinates[i];
    const [lon2, lat2, elev2] = coordinates[i + 1];
    
    // Calculate horizontal distance in meters
    const horizontalDist = calculateDistance(lat1, lon1, lat2, lon2) * 1000;
    // Calculate vertical distance in meters
    const verticalDist = Math.abs(elev2 - elev1);
    
    // Calculate slope angle in degrees
    const slopeAngle = Math.atan(verticalDist / horizontalDist) * (180 / Math.PI);
    maxSlope = Math.max(maxSlope, slopeAngle);
  }
  
  return Math.round(maxSlope);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const resort = searchParams.get('resort');

    if (!resort) {
      return NextResponse.json({ error: 'Resort parameter is required' }, { status: 400 });
    }

    // Try first filename format
    const filename1 = resort.toLowerCase().replace(/\s+/g, '_') + '_runs.json';
    let filePath = path.join(process.cwd(), 'JSON', 'supported_runs', filename1);

    // Check which file exists and use that path
    if (!await fileExists(filePath)) {
      // Try second filename format
      const filename2 = resort.toLowerCase().replace(/\s+/g, '_') + '_resort_runs.json';
      filePath = path.join(process.cwd(), 'JSON', 'supported_runs', filename2);
      if (!await fileExists(filePath)) {
        console.error(`No run data found for ${resort}. Tried:`, { filename1, filename2 });
        return NextResponse.json({ error: 'Resort data not found' }, { status: 404 });
      }
    }

    try {
      const fileContents = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(fileContents);
      
      const featuresWithCalculations = data.features.map((feature: any) => ({
        ...feature,
        properties: {
          ...feature.properties,
          lengthInKm: calculateLengthInKm(feature.geometry.coordinates),
          verticalDrop: calculateVerticalDrop(feature.geometry.coordinates),
          maxSlope: calculateMaxSlope(feature.geometry.coordinates)
        }
      }));

      return NextResponse.json({
        ...data,
        features: featuresWithCalculations
      });
    } catch (error) {
      console.error(`Error reading runs for ${resort}:`, error);
      return NextResponse.json({ error: 'Resort data not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error in GetRuns API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 