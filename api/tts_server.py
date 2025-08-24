from fastapi import FastAPI, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pathlib import Path
import uuid, os
from api.default_speaker import create_default_speaker_file

from fastapi import Request
from TTS.api import TTS
import soundfile as sf
import numpy as np

# BrainRot XTTS-v2 bridge
# Writes audio files into web/public/audio so Next.js can serve them at /audio/<file>.wav

app = FastAPI(title="BrainRot TTS Bridge")

# Allow local Next.js app to access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Explicitly allow Next.js origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Requested-With"],
)

# Resolve output dir relative to repo
ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "web" / "public" / "audio"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Configuration via environment
MODEL_NAME = os.environ.get("BRAINROT_TTS_MODEL", "tts_models/multilingual/multi-dataset/xtts_v2")
VOICES_DIR = os.environ.get("VOICES_DIR", str((ROOT / "audio" / "voices").resolve()))
MODEL_DIR = os.environ.get("MODEL_DIR", "")  # optional vendor dir

# Ensure voices directory exists
Path(VOICES_DIR).mkdir(parents=True, exist_ok=True)

# Default speaker reference file
DEFAULT_SPEAKER_PATH = Path(__file__).parent / "assets" / "default_speaker.wav"
if not DEFAULT_SPEAKER_PATH.exists():
    create_default_speaker_file(str(DEFAULT_SPEAKER_PATH))

# Initialize XTTS once on startup
@app.on_event("startup")
async def startup_load_model():
    try:
        print(f"[startup] Initializing XTTS model: {MODEL_NAME}")
        # Prefer model_name usage; MODEL_DIR support can be added if you provide config paths
        tts = TTS(model_name=MODEL_NAME, progress_bar=False, gpu=False)
        app.state.tts = tts
        print("[startup] XTTS model ready")
    except Exception as e:
        app.state.tts = None
        print(f"[startup] Failed to initialize XTTS: {e}")

@app.get("/health")
async def health():
    ready = getattr(app.state, "tts", None) is not None
    return {"ready": ready, "model": MODEL_NAME}

@app.post("/synthesize")
async def synthesize(
    request: Request,
    text: str = Form(...),
    lang: str = Form("en"),
    speaker: UploadFile | None = None,
):
    uid = uuid.uuid4().hex
    if speaker:
        # Save uploaded speaker reference to a proper temp directory
        import tempfile
        temp_dir = Path(tempfile.gettempdir())
        speaker_path = temp_dir / f"speaker_{uid}.wav"
        with open(speaker_path, "wb") as f:
            f.write(await speaker.read())
    else:
        # Use default speaker reference
        speaker_path = DEFAULT_SPEAKER_PATH

    out_path = OUT_DIR / f"{uid}.wav"
    # Debug print to verify speaker path exists
    print(f"Using speaker reference: {speaker_path} (exists: {speaker_path.exists()})")
    try:
        # Ensure speaker reference is mono, normalized float to avoid artifacts
        try:
            spk_audio, spk_sr = sf.read(str(speaker_path), always_2d=False)
            if spk_audio.ndim > 1:
                # Average channels to mono
                spk_audio = np.mean(spk_audio, axis=1)
            # Normalize to float32 in [-1, 1]
            if spk_audio.dtype != np.float32:
                spk_audio = spk_audio.astype(np.float32)
            max_abs = np.max(np.abs(spk_audio)) if spk_audio.size else 0
            if max_abs > 1.0:
                spk_audio = spk_audio / max_abs
            # Write a temp mono file for conditioning
            import tempfile
            tmp_spk = Path(tempfile.gettempdir()) / f"speaker_mono_{uid}.wav"
            sf.write(str(tmp_spk), spk_audio, spk_sr, subtype="PCM_16")
            speaker_wav_path = str(tmp_spk)
        except Exception as pe:
            print(f"[warn] Speaker preprocess failed ({pe}), using original file")
            speaker_wav_path = str(speaker_path)

        # Use the already-initialized model
        tts = getattr(request.app.state, "tts", None)
        if tts is None:
            return JSONResponse(status_code=503, content={"error": "TTS service not ready"})

        print(f"Generating speech for text: '{text}'")
        print(f"Using speaker reference: {speaker_wav_path}")
        
        # Generate speech directly using the TTS API
        wav = tts.tts(text=text,
                      speaker_wav=speaker_wav_path,
                      language=lang)

        # Determine output sample rate from model if available
        synth = getattr(tts, "synthesizer", None)
        out_sr = getattr(synth, "output_sample_rate", 24000)

        # Clip to [-1,1] and ensure float32 to avoid clipping distortion
        import numpy as _np
        wav = _np.asarray(wav, dtype=_np.float32)
        wav = _np.clip(wav, -1.0, 1.0)

        # Save the generated audio
        sf.write(str(out_path), wav, samplerate=int(out_sr))
        
        if not out_path.exists():
            print(f"TTS synthesis completed but output file not found at {out_path}")
            return JSONResponse(
                status_code=500,
                content={"error": "TTS synthesis completed but output file not found"}
            )
            
        print(f"TTS synthesis successful, file saved to {out_path}")
        return {"file": f"/audio/{out_path.name}"}
    except Exception as e:
        print(f"Exception during TTS synthesis: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"TTS synthesis error: {str(e)}"}
        )
    finally:
        # Clean up temp speaker file if we created one
        if speaker and speaker_path and speaker_path.exists():
            speaker_path.unlink()

# Run with: uvicorn api.tts_server:app --port 8000 --host 127.0.0.1

