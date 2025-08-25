import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

type Params = { filename: string };

// API route to serve individual voice sample files
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    // Access params safely in Next.js App Router
    const filename = params.filename;
    const samplesDir = path.join(process.cwd(), '..', 'audio', 'voice-samples');
    const filePath = path.join(samplesDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }
    
    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Determine content type
    let contentType = 'audio/mpeg';
    if (filename.endsWith('.wav')) {
      contentType = 'audio/wav';
    }
    
    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error serving voice sample:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
