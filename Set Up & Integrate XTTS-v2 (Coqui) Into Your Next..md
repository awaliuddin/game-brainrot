<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

## Set Up \& Integrate XTTS-v2 (Coqui) Into Your Next.js “BrainRot” App – Step by Step

### 1. System Prerequisites

1. Windows 11 with **Python 3.9+** and **Node 18+**
2. (Optional GPU) NVIDIA driver + CUDA 12 (for realtime).
3. Chocolatey or Scoop →
`choco install git ffmpeg` (ffmpeg needed for audio).

***

### 2. Local XTTS-v2 Installation

```bash
# 1. Create a Python venv
python -m venv venv && venv\Scripts\activate

# 2. Install Coqui-TTS
pip install --upgrade pip
pip install TTS==0.22.0   # XTTS-v2 supported

# 3. Quick smoke-test
tts --text "Ciao, prova" ^
    --model_name coqui/XTTS-v2 ^
    --out_path test.wav
```

If `test.wav` plays, the model is ready.

***

### 3. One-Shot Voice Clone

1. Grab a **6-second** clean WAV of the target voice.
2. Convert (if needed):
`ffmpeg -i clip.mp3 -ar 24000 -ac 1 sample.wav`
3. Generate:
```bash
tts --model_name coqui/XTTS-v2 ^
    --text "Tungmamatorowallarallafifi-etto!" ^
    --speaker_wav sample.wav ^
    --language_idx it ^
    --out_path risottini.wav
```


***

### 4. Create a Tiny Python API (backend)

`/api/tts_server.py`

```python
from fastapi import FastAPI, UploadFile, Form
from pathlib import Path
import subprocess, uuid, os

app = FastAPI()
MODEL = "coqui/XTTS-v2"
OUT_DIR = Path("public/audio")
OUT_DIR.mkdir(parents=True, exist_ok=True)

@app.post("/synthesize")
async def synthesize(text: str = Form(...),
                     lang: str = Form("it"),
                     speaker: UploadFile = None):
    uid = uuid.uuid4().hex
    speaker_path = None
    if speaker:
        speaker_path = OUT_DIR / f"{uid}_spk.wav"
        with open(speaker_path, "wb") as f:
            f.write(await speaker.read())

    out_path = OUT_DIR / f"{uid}.wav"
    cmd = [
        "tts",
        "--model_name", MODEL,
        "--text", text,
        "--out_path", str(out_path),
        "--language_idx", lang
    ]
    if speaker_path:
        cmd += ["--speaker_wav", str(speaker_path)]

    subprocess.check_call(cmd)
    return {"file": f"/audio/{out_path.name}"}
```

Run with:

```bash
uvicorn api.tts_server:app --port 8000 --host 127.0.0.1
```


***

### 5. Wire Up Next.js Frontend

1. Create a React hook to call the API:
```ts
// hooks/useTTS.ts
export async function synthesizeTTS(text: string, file?: File) {
  const form = new FormData();
  form.append("text", text);
  if (file) form.append("speaker", file);
  const res = await fetch("http://127.0.0.1:8000/synthesize", {
    method: "POST",
    body: form,
  });
  const json = await res.json();
  return json.file as string;     // relative URL to WAV
}
```

2. Play the result:
```tsx
const handleSpeak = async () => {
  const url = await synthesizeTTS(catchphrase, sampleFile);
  setAudioSrc(url);          // <audio src={audioSrc} controls />
};
```

3. Place `/public/audio` in `next.config.mjs` static paths so files are served automatically.

***

### 6. Quality “Brain-rot” Tuning (optional)

* Post-FX script (SoX):
`sox risottini.wav final.wav pitch 40 bend 0,4,40 tremolo 4 40`
* Adds ±40 cent pitch wobble @ 4 Hz plus formant lift.

***

### 7. Performance \& Ops

1. GPU mode: `set CUDA_VISIBLE_DEVICES=0` → realtime.
2. CPU mode: expect 2× audio length; queue requests (`bullmq`, `RabbitMQ`, etc.).
3. Cache: hash(text+speaker) → reuse existing WAV.
4. Security: limit text length, sanitize filenames.

***

### 8. Done ✅

You now have:

- Local, free XTTS-v2 cloning
- FastAPI bridge → Next.js
- WAVs playable in your BrainRot studio.

Generate, wobble, and ship the Italian brain-rot chaos—fully offline and zero-cost.

