example of a local XTTS POC. Apply to the Brainrot project using best practices.

# 0) Project layout

```
voices/
  models/xtts-v2/        # vendored base model
  voices/                # saved latents .pt
  server/
    server.py            # FastAPI service
    requirements.txt
  .env                   # MODEL_DIR, VOICES_DIR
```

# 1) Local setup (no Docker)

```bash
cd voice
python -m venv .venv && source .venv/bin/activate
pip install "coqui-tts>=0.27" torch torchaudio fastapi uvicorn pydantic "huggingface_hub>=0.23"
python - <<'PY'
from huggingface_hub import snapshot_download
snapshot_download('coqui/XTTS-v2', local_dir='models/xtts-v2', local_dir_use_symlinks=False)
PY
mkdir -p voices server
printf "MODEL_DIR=./models/xtts-v2\nVOICES_DIR=./voices\n" > .env
```

`server/requirements.txt`

```
coqui-tts>=0.27
fastapi
uvicorn[standard]
torch
torchaudio
pydantic
python-dotenv
```

# 2) FastAPI service... one-shot clone + persistent voice

`server/server.py`

```py
import os, uuid, torch
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import Xtts

load_dotenv()
MODEL_DIR = os.getenv("MODEL_DIR", "./models/xtts-v2")
VOICES_DIR = os.getenv("VOICES_DIR", "./voices")
os.makedirs(VOICES_DIR, exist_ok=True)

# load model once
cfg = XttsConfig(); cfg.load_json(f"{MODEL_DIR}/config.json")
xtts = Xtts.init_from_config(cfg)
xtts.load_checkpoint(cfg, checkpoint_dir=MODEL_DIR)
if torch.cuda.is_available(): xtts.cuda()
xtts.eval()

class SpeakReq(BaseModel):
    text: str
    language: str = "en"
    # choose one: saved voice or one-shot sample
    voice_id: str | None = None
    speaker_wav: str | None = None       # local path or URL
    format: str = "wav"                  # wav or pcm16

class CloneReq(BaseModel):
    name: str
    samples: list[str]                   # one or more wav paths

@app.post("/tts")
def tts(req: SpeakReq):
    # persistent voice wins if given
    gpt = spk = None
    if req.voice_id:
        path = f"{VOICES_DIR}/{req.voice_id}.pt"
        if not os.path.exists(path): raise HTTPException(404, "voice not found")
        v = torch.load(path, map_location="cpu")
        gpt, spk = v["gpt"], v["spk"]

    def gen():
        if gpt is not None:
            for chunk in xtts.inference_stream(req.text, req.language, gpt, spk):
                yield chunk
        else:
            for chunk in xtts.inference_stream(req.text, req.language, req.speaker_wav, None):
                yield chunk

    mt = "audio/wav" if req.format == "wav" else "application/octet-stream"
    return StreamingResponse(gen(), media_type=mt)

@app.post("/clone")
def clone(req: CloneReq):
    gpt, spk = xtts.get_conditioning_latents(audio_path=req.samples)
    vid = uuid.uuid4().hex[:12]
    torch.save({"gpt": gpt, "spk": spk, "name": req.name}, f"{VOICES_DIR}/{vid}.pt")
    return JSONResponse({"voice_id": vid, "name": req.name})

@app.get("/voices")
def list_voices():
    out = []
    for f in os.listdir(VOICES_DIR):
        if f.endswith(".pt"):
            d = torch.load(os.path.join(VOICES_DIR, f), map_location="cpu")
            out.append({"voice_id": f[:-3], "name": d.get("name","unknown")})
    return out
```

Run locally:

```bash
source .venv/bin/activate
export HF_HUB_OFFLINE=1
uvicorn server.server:app --host 0.0.0.0 --port 8020 --reload
```

# 3) Test the API

**One-shot clone speak**:

```bash
curl -s -X POST http://localhost:8020/tts \
 -H "Content-Type: application/json" \
 -d '{"text":"Hello one-shot clone","language":"en","speaker_wav":"voices/ref.wav"}' \
 --output out_oneshot.wav
```

**Create persistent voice**:

```bash
curl -s -X POST http://localhost:8020/clone \
 -H "Content-Type: application/json" \
 -d '{"name":"AxW","samples":["voices/ref.wav"]}'
# → {"voice_id":"abcd1234ef56","name":"AxW"}
```

**Speak with saved voice**:

```bash
curl -s -X POST http://localhost:8020/tts \
 -H "Content-Type: application/json" \
 -d '{"text":"Using saved voice","language":"en","voice_id":"abcd1234ef56"}' \
 --output out_saved.wav
```

# 4) Next.js integration (thin proxy)

`app/api/tts/route.ts`

```ts
export const runtime = "nodejs";
export async function POST(req: Request) {
  const body = await req.text();
  const r = await fetch(process.env.TTS_URL ?? "http://localhost:8020/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!r.ok) return new Response(await r.text(), { status: 500 });
  return new Response(r.body, {
    headers: { "Content-Type": "audio/wav", "Cache-Control": "no-store" },
  });
}
```

Client:

```ts
async function speak(text: string, voice_id?: string, speaker_wav?: string) {
  const r = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language: "en", voice_id, speaker_wav }),
  });
  const blob = await r.blob();
  new Audio(URL.createObjectURL(blob)).play();
}
```

# 5) True fine-tune pathway

Use when you need weight-level adaptation. Start small.

Prepare:

```bash
pip install "coqui-tts[all]"
# dataset: metadata.csv or JSONL with path|text|speaker
# copy a finetune config for XTTS; set:
#  - model_dir: ./models/xtts-v2
#  - data paths and language
#  - low LR; small batch
python -m TTS.bin.train_tts --config_path configs/xtts_finetune.json --output_path runs/xtts_ft
```

Deploy weights:

* Replace `models/xtts-v2` with the best checkpoint folder or update `config.json` to point to new weights.
* No API changes. Persistent latents still work.

# 6) Operational basics

* One global model object. Never re-init per request.
* Start MAX 2 concurrent streams per consumer GPU; scale replicas if p95 grows.
* Use WAV first; add Opus later to reduce bandwidth.
* Keep `HF_HUB_OFFLINE=1`. Vendor the model.
* Store voices as `voices/<name>@YYYY-MM-DD.pt`. Version them.

# 7) Troubleshooting quick hits

* Edge runtime in Next.js... set `export const runtime = "nodejs"`.
* “Already downloaded” spam... load once at startup; set `HF_HUB_OFFLINE=1`.
* CUDA mismatch... test CPU first; then match Torch to driver.
* No sample needed... omit `speaker_wav` to use default voice.
* 404 voice... ensure `.pt` exists; correct `voice_id`.

# 8) Optional... Docker deploy later

`docker-compose.yml`

```yaml
services:
  xtts:
    build: .
    environment:
      - MODEL_DIR=/app/models/xtts-v2
      - VOICES_DIR=/app/voices
      - HF_HUB_OFFLINE=1
    volumes:
      - ./models/xtts-v2:/app/models/xtts-v2:ro
      - ./voices:/app/voices
    ports: ["8020:8020"]
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]
```
