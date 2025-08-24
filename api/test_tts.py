#!/usr/bin/env python
# Test script for XTTS v2 model compatibility

import requests
import json
import os
from pathlib import Path

# Test TTS synthesis with direct API call
def test_tts_api():
    print("Testing TTS API with XTTS v2 model...")
    
    # API endpoint
    url = "http://127.0.0.1:8000/synthesize"
    
    # Test text
    text = "This is a test of the XTTS v2 model compatibility."
    
    # Form data
    data = {
        "text": text,
        "lang": "en"
    }
    
    try:
        # Make the API call
        response = requests.post(url, data=data)
        
        # Check if the request was successful
        if response.status_code == 200:
            result = response.json()
            print(f"Success! Audio file generated: {result.get('file')}")
            return True
        else:
            try:
                error_data = response.json()
                print(f"Error: {error_data.get('error')}")
            except:
                print(f"Error: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"Exception: {str(e)}")
        return False

if __name__ == "__main__":
    test_tts_api()
