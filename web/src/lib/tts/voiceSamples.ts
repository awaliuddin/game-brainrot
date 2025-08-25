// Voice samples utility for XTTS speaker references
import fs from 'fs';
import path from 'path';

export interface VoiceSample {
  id: string;
  name: string;
  path: string;
}

// This function runs on the server side only
export async function getVoiceSamples(): Promise<VoiceSample[]> {
  try {
    const samplesDir = path.join(process.cwd(), '..', 'audio', 'voice-samples');
    
    // Check if directory exists
    if (!fs.existsSync(samplesDir)) {
      console.warn(`Voice samples directory not found: ${samplesDir}`);
      return [];
    }
    
    const files = fs.readdirSync(samplesDir);
    
    return files
      .filter(file => file.endsWith('.mp3') || file.endsWith('.wav'))
      .map(file => ({
        id: file.replace(/\.[^/.]+$/, ''), // Remove extension
        name: file.replace(/^Voicy_/, '').replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        path: `/voice-samples/${file}`
      }));
  } catch (error) {
    console.error('Error loading voice samples:', error);
    return [];
  }
}
