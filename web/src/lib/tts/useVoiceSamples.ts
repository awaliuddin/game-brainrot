"use client";

import { useState, useEffect } from 'react';

export interface VoiceSample {
  id: string;
  name: string;
  filename: string;
}

export function useVoiceSamples() {
  const [samples, setSamples] = useState<VoiceSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSamples() {
      try {
        setLoading(true);
        const response = await fetch('/api/voice-samples');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch voice samples: ${response.status}`);
        }
        
        const data = await response.json();
        setSamples(data.samples || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching voice samples:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setSamples([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSamples();
  }, []);

  return { samples, loading, error };
}
