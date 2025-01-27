import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const resort = searchParams.get('resort');

    if (!resort) {
      return NextResponse.json({ error: 'Resort parameter is required' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'JSON', 'ski_areas_viewstate.json');
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const viewStates = JSON.parse(fileContent);
      
      if (viewStates[resort]) {
        return NextResponse.json({ viewState: viewStates[resort] });
      } else {
        return NextResponse.json({ error: 'No saved viewstate found' }, { status: 404 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'No saved viewstates found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching viewstate:', error);
    return NextResponse.json({ error: 'Failed to fetch viewstate' }, { status: 500 });
  }
} 