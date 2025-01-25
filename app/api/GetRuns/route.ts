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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const resortName = searchParams.get('resort');

    if (!resortName) {
      return NextResponse.json(
        { error: 'Resort name is required' },
        { status: 400 }
      );
    }

    const runsData = await readRunsData();
    
    // If no data, return empty collection
    if (!runsData.features) {
      return NextResponse.json({
        type: 'FeatureCollection',
        features: []
      });
    }

    const filteredRuns = runsData.features.filter((feature: any) => {
      const skiAreas = feature.properties?.skiAreas || [];
      const data = skiAreas.some((area: any) => 
        area.properties?.name?.toLowerCase().includes(resortName.toLowerCase())
      );
      return data;
    });

    return NextResponse.json({
      type: 'FeatureCollection',
      features: filteredRuns
    });

  } catch (error) {
    console.error('Error processing runs data:', error);
    // Return empty collection on error
    return NextResponse.json({
      type: 'FeatureCollection',
      features: []
    });
  }
} 