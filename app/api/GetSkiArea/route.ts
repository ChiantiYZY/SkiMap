import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Helper function to read the GeoJSON file
async function readSkiAreasData() {
  const filePath = path.join(process.cwd(), 'JSON', 'ski_areas.geojson');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

export async function GET(request: NextRequest) {
  try {
    // Get area name from query parameter
    const searchParams = request.nextUrl.searchParams;
    const areaName = searchParams.get('name');

    if (!areaName) {
      return NextResponse.json(
        { error: 'Ski area name is required' },
        { status: 400 }
      );
    }

    // Read and parse the GeoJSON file
    const skiAreasData = await readSkiAreasData();

    // Find the matching ski area
    const skiArea = skiAreasData.features.find((feature: any) => {
      const name = feature.properties?.name || '';
      return name.toLowerCase().includes(areaName.toLowerCase());
    });

    if (!skiArea) {
      return NextResponse.json(
        { error: 'Ski area not found' },
        { status: 404 }
      );
    }

    // Return the ski area data with its coordinates
    return NextResponse.json({
      name: skiArea.properties.name,
      coordinates: skiArea.geometry.coordinates,
      bounds: calculateBounds(skiArea.geometry.coordinates[0]),
      properties: skiArea.properties
    });

  } catch (error) {
    console.error('Error processing ski areas data:', error);
    return NextResponse.json(
      { error: 'Failed to process ski areas data' },
      { status: 500 }
    );
  }
}

// Helper function to calculate bounds from coordinates
function calculateBounds(coordinates: number[][]) {
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  coordinates.forEach(([lng, lat]) => {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  });

  return {
    north: maxLat,
    south: minLat,
    east: maxLng,
    west: minLng
  };
} 