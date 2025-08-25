# Brainrot Studio (web/)

Next.js 14 App Router app for the Brainrot Character Construction Studio.

- Tech: Next.js + React 18, TypeScript, Tailwind CSS
- Path aliases: `@/*` → `web/src/*`
- Legacy POC is preserved under `public/legacy-poc/`
 
## Custom TTS (XTTS‑v2, Coqui)
 
We support optional local custom TTS model via a tiny FastAPI bridge to Coqui XTTS‑v2. Use this when you select "Custom-Model → XTTS-v2 (Coqui)" in Studio tabs. Otherwise, "Local-TTS" uses the browser Web Speech API.

### Voice Samples

The app includes pre-loaded voice samples in `audio/voice-samples/` that can be selected in the UI for voice cloning. These samples are available in both the Phrase and Preview tabs when using the Custom-Model (XTTS-v2) option. You can:

- Select from the pre-loaded samples in the dropdown
- Preview the sample voice before using it
- Upload your own WAV or MP3 file for custom voice cloning

To add more voice samples, simply place WAV or MP3 files in the `audio/voice-samples/` directory. Files with the prefix `Voicy_` will have this prefix removed in the UI display.
 
### Backend setup (Windows)
 
Run these from the repo root `brainrot-app/` with the Python venv active (`.venv`):
 
```powershell
python -m venv .venv
./.venv/Scripts/Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
 
# Optional one-time model test & download (~GBs)
python -m TTS --text "Hello BrainRot" --model_name tts_models/multilingual/multi-dataset/xtts_v2 --out_path test.wav
```
 
Start the backend (serves on http://127.0.0.1:8000):
 
```powershell
uvicorn api.tts_server:app --port 8000 --host 127.0.0.1
# Or from web/: npm run tts:dev (same command)
# Or from api/: npm run tts:dev:api (module path changes to tts_server:app)
```
 
Notes:
- First run downloads model weights to your user cache.
- We pin `torch<2.6` to avoid a PyTorch weights_only error with XTTS checkpoints.
- FastAPI requires `python-multipart` for file uploads (already in `requirements.txt`).
- Audio WAVs are written to `web/public/audio` and served at `/audio/<file>.wav`.

## Run locally

### Quick Start (Recommended Order)

#### Option 1: Single Terminal (Recommended)

Use our new colorful dev script that starts both the TTS backend and Next.js frontend in a single terminal:

```bash
# From the repo root

# PowerShell (Windows)
npm run dev

# Git Bash
npm run dev:bash
```

This script will:
- Kill any processes running on the TTS and Next.js ports
- Activate the Python virtual environment
- Start the TTS backend in the background
- Start the Next.js frontend
- Display colorful status messages

#### Option 2: Separate Terminals

1. **Start the XTTS backend first** (from repo root):

   ```bash
   # PowerShell (Windows)
   npm run tts:restart
   
   # Git Bash
   npm run tts:restart:bash
   ```

   This will:
   - Activate the Python virtual environment
   - Kill any existing process on port 8000
   - Start the XTTS backend server

2. **Then start the Next.js frontend** (from repo root):

   ```bash
   cd web
   npm install
   npm run dev
   ```

3. **Open the app**:
   - Studio: http://localhost:3000/studio
   - Legacy POC: http://localhost:3000/legacy-poc/index.html

### Important Notes

- Always run the restart scripts from the repo root directory (`brainrot-app/`)
- After changing `.env.local`, restart the Next.js dev server to pick up environment changes
- The XTTS backend must be running for the "Custom-Model" TTS option to work
- If you see CORS errors, ensure the backend is running and accessible

### Manual Backend Start

If you prefer to start the backend manually:

```bash
# Activate virtual environment first
# Windows PowerShell
./.venv/Scripts/Activate.ps1

# Then start the server
uvicorn api.tts_server:app --port 8000 --host 127.0.0.1

# Or from web/ directory
npm run tts:dev
```

## Feature overview

- Tabbed builder: Character, Name, Phrase, Sounds, Backstory, Preview
- Shared state via `StudioProvider` with `localStorage` persistence
- Web Audio engine with effect toggles via `AudioProvider`
- Preview computes a simple meme score from selections and active effects

## Key files

- `src/app/layout.tsx` – wraps app with `AudioProvider`
- `src/app/studio/page.tsx` – tabs wiring inside `StudioProvider`
- `src/app/studio/StudioProvider.tsx` – shared state + persistence
- `src/app/studio/*Tab.tsx` – each feature tab UI
- `src/lib/data/brainrot.ts` – typed data + `buildPhrase()`
- `src/lib/audio/useAudioEngine.ts` – Web Audio hook
- `src/lib/audio/AudioProvider.tsx` – audio context + `useAudio()`
- `src/components/Tabs.tsx` – tab UI component (if present)

## Dev scripts

- `npm run dev` – dev server
- `npm run build` – prod build
- `npm run start` – serve prod
- `npm run lint` – lint (rules pending)

## Notes

- State schema lives in `StudioProvider.tsx` and is versioned in storage under `studio_state_v1`.
- Reset button in Preview clears both in-memory and persisted state and stops audio.
-
- See `ARCHITECTURE.md` in this folder for deeper design/flow details.
