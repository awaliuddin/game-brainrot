import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// API route to list available voice samples
export async function GET() {
  try {
    const samplesDir = path.join(process.cwd(), '..', 'audio', 'voice-samples');
    
    // Check if directory exists
    if (!fs.existsSync(samplesDir)) {
      return NextResponse.json({ samples: [] }, { status: 200 });
    }
    
    const files = fs.readdirSync(samplesDir);
    
    const samples = files
      .filter(file => file.endsWith('.mp3') || file.endsWith('.wav'))
      .map(file => ({
        id: file.replace(/\.[^/.]+$/, ''), // Remove extension
        name: file.replace(/^Voicy_/, '').replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        filename: file
      }));
    
    return NextResponse.json({ samples }, { status: 200 });
  } catch (error) {
    console.error('Error loading voice samples:', error);
    return NextResponse.json({ error: 'Failed to load voice samples' }, { status: 500 });
  }
}
