import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface ViewStateData {
  bearing: number;
  zoom: number;
  latitude: number;
  longitude: number;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { resortName, viewState } = data;

    const filePath = path.join(process.cwd(), 'JSON', 'ski_areas_viewstate.json');
    
    // Read existing data or create new object if file doesn't exist
    let viewStates = {};
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      viewStates = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist yet, use empty object
    }

    // Update viewstate for the resort
    viewStates[resortName] = viewState;

    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(viewStates, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving viewstate:', error);
    return NextResponse.json({ error: 'Failed to save viewstate' }, { status: 500 });
  }
} 