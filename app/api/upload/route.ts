import { writeFile, mkdir } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import sharp from 'sharp';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const THUMBNAIL_DIR = path.join(process.cwd(), 'public', 'uploads', 'thumbnails');

// Ensure directories exist
await mkdir(UPLOAD_DIR, { recursive: true });
await mkdir(THUMBNAIL_DIR, { recursive: true });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const latitude = formData.get('latitude');
    const longitude = formData.get('longitude');
    const timestamp = formData.get('timestamp');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Create unique filename
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniquePrefix + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g, '').replace('.heic', '.jpg');
    const thumbnailFilename = `thumb-${filename}`;
    
    const filepath = path.join(UPLOAD_DIR, filename);
    const thumbnailPath = path.join(THUMBNAIL_DIR, thumbnailFilename);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert to JPEG first if it's HEIC
    const jpegBuffer = await sharp(buffer)
      .toFormat('jpeg')
      .toBuffer();

    // Save original file as JPEG
    await writeFile(filepath, jpegBuffer);

    // Generate and save thumbnail
    await sharp(jpegBuffer)
      .resize(80, 80, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    // Return the public URLs
    const publicUrl = `/api/images/${filename}`;
    const thumbnailUrl = `/api/thumbnails/${thumbnailFilename}`;

    return NextResponse.json({
      url: publicUrl,
      thumbnail: thumbnailUrl,
      latitude,
      longitude,
      timestamp
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
} 