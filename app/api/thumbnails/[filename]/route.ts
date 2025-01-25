import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { headers } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'thumbnails', filename);
    
    // Basic security check
    if (filename.includes('..')) {
      return new NextResponse('Invalid filename', { status: 400 });
    }

    const file = await readFile(filepath);
    const headersList = headers();

    return new NextResponse(file, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error serving thumbnail:', error);
    return new NextResponse('Thumbnail not found', { status: 404 });
  }
} 