import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Helper function to read the GeoJSON file
async function readLiftsData() {
  const filePath = path.join(process.cwd(), 'JSON', 'lifts.geojson');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

export async function GET(request: NextRequest) {
  try {
    // Get resort name from query parameter
    const searchParams = request.nextUrl.searchParams;
    const resortName = searchParams.get('resort');

    if (!resortName) {
      return NextResponse.json(
        { error: 'Resort name is required' },
        { status: 400 }
      );
    }

    // Read and parse the GeoJSON file
    const liftsData = await readLiftsData();

    // Filter lifts by resort name
    const filteredLifts = liftsData.features.filter((feature: any) => {
      const skiAreas = feature.properties?.skiAreas || [];
      
      const data = skiAreas.some((area: any) => 
        area.properties?.name?.toLowerCase().includes(resortName.toLowerCase())
      );

      return data;

    });

    // Return filtered lifts as a GeoJSON FeatureCollection
    return NextResponse.json({
      type: 'FeatureCollection',
      features: filteredLifts
    });

  } catch (error) {
    console.error('Error processing lifts data:', error);
    return NextResponse.json(
      { error: 'Failed to process lifts data' },
      { status: 500 }
    );
  }
} 