"""
Generate a default speaker reference WAV for XTTS-v2.

This creates a simple sine wave WAV file that can be used as a reference
for the XTTS-v2 multi-speaker model. The model requires a reference audio
file to clone the voice from.
"""

import os
import numpy as np
from scipy.io import wavfile

def generate_sine_wave(freq=440, duration=3, sample_rate=22050):
    """Generate a simple sine wave."""
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    wave = 0.5 * np.sin(2 * np.pi * freq * t)
    return wave.astype(np.float32)

def create_default_speaker_file(output_path):
    """Create a default speaker reference WAV file."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Generate a simple sine wave
    sample_rate = 22050  # Standard for many TTS models
    audio_data = generate_sine_wave(freq=440, duration=3, sample_rate=sample_rate)
    
    # Save as WAV
    wavfile.write(output_path, sample_rate, audio_data)
    print(f"Created default speaker reference at {output_path}")
    return output_path

if __name__ == "__main__":
    # Path relative to repo root
    output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                              "api", "assets", "default_speaker.wav")
    create_default_speaker_file(output_path)