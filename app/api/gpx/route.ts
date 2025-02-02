import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const fileName = request.nextUrl.searchParams.get('file');
    if (fileName) {
      // Get single file
      const filePath = path.join(process.cwd(), 'JSON', 'GPS', fileName);
      const fileContent = await fs.readFile(filePath);
      return new NextResponse(fileContent, {
        headers: { 'Content-Type': 'application/gpx+xml' },
      });
    } else {
      // List all files
      const gpsDir = path.join(process.cwd(), 'JSON', 'GPS');
      try {
        await fs.access(gpsDir);
      } catch {
        await fs.mkdir(gpsDir, { recursive: true });
        return NextResponse.json({ files: [] });
      }

      const files = await fs.readdir(gpsDir);
      // Remove duplicates and ensure unique filenames
      const uniqueFiles = Array.from(new Set(files.filter(file => file.endsWith('.gpx'))));
      return NextResponse.json({ files: uniqueFiles });
    }
  } catch (error) {
    console.error('Error with GPX files:', error);
    return NextResponse.json({ error: 'Failed to process GPX files' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const gpsDir = path.join(process.cwd(), 'JSON', 'GPS');
    try {
      await fs.access(gpsDir);
    } catch {
      await fs.mkdir(gpsDir, { recursive: true });
    }

    // Check if file already exists
    const existingFiles = await fs.readdir(gpsDir);
    if (existingFiles.includes(file.name)) {
      return NextResponse.json({ 
        success: true, 
        fileName: file.name,
        message: 'File already exists'
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(gpsDir, file.name);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ success: true, fileName: file.name });
  } catch (error) {
    console.error('Error saving GPX file:', error);
    return NextResponse.json({ error: 'Failed to save GPX file' }, { status: 500 });
  }
} 