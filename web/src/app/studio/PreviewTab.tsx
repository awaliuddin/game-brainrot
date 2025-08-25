"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useStudio } from "./StudioProvider";
import { buildPhrase } from "@/lib/data/brainrot";
import { useAudio } from "@/lib/audio/AudioProvider";
import { synthesizeTTS } from "@/lib/tts/customTts";
import { useVoiceSamples } from "@/lib/tts/useVoiceSamples";

export default function PreviewTab() {
  const { state, reset } = useStudio();
  const audio = useAudio();
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [customModel, setCustomModel] = useState<"off" | "xtts">("off");
  const [speakingNet, setSpeakingNet] = useState(false);
  const [speakerFile, setSpeakerFile] = useState<File | null>(null);
  const [speakerFileName, setSpeakerFileName] = useState<string>("");
  const [selectedSampleId, setSelectedSampleId] = useState<string>("");
  const { samples, loading: loadingSamples } = useVoiceSamples();

  const phrase = useMemo(() => {
    const { template, X, place, adjective } = state.phrase || {};
    return template ? buildPhrase(template, { X, place, adjective }) : "";
  }, [state.phrase]);

  const memeScore = useMemo(() => {
    let score = 50;
    const { character, name, phrase: p, backstory } = state;
    // completeness
    if (character.animal && character.object && character.food) score += 10;
    if (name && name.length > 8) score += 8;
    if (p?.adjective && ["cursed", "based", "sus", "slaps", "bussin"].some((k) => p.adjective?.includes(k))) score += 10;
    if (p?.place && ["Ohio", "Backrooms", "TikTok"].some((k) => p.place?.includes(k))) score += 6;
    if (backstory.trait) score += 5;
    if (backstory.power) score += 5;
    if (audio.activeEffects.size) score += Math.min(10, audio.activeEffects.size * 4);
    return Math.max(0, Math.min(100, score));
  }, [state, audio.activeEffects.size]);

  return (
    <div className="grid gap-6">
      <div className="rounded-lg border border-black/10 dark:border-white/15 p-4 grid gap-2">
        <h3 className="text-lg font-semibold">Summary</h3>
        <SummaryItem label="Name" value={state.name || "(none)"} />
        <SummaryItem label="Character" value={formatCharacter(state)} />
        <SummaryItem label="Phrase" value={phrase || "(none)"} />
        <div className="grid gap-2">
          <div className="grid gap-2">
            <span className="text-sm font-medium">TTS Source</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="ttsSource"
                  checked={customModel === "off"}
                  onChange={() => setCustomModel("off")}
                />
                <span>Local-TTS</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="ttsSource"
                  checked={customModel === "xtts"}
                  onChange={() => setCustomModel("xtts")}
                />
                <span>Custom-Model (XTTS-v2)</span>
              </label>
            </div>
          </div>
          
          {customModel === "off" && audio.voices?.length ? (
            <label className="grid gap-1">
              <span className="text-sm font-medium">Voice</span>
              <select
                className="h-9 rounded-md border border-black/10 dark:border-white/15 bg-white dark:bg-black px-3 text-sm"
                value={audio.selectedVoice?.voiceURI || ""}
                onChange={(e) => {
                  const v = audio.voices.find((vo) => vo.voiceURI === e.target.value) || null;
                  audio.setSelectedVoice(v);
                }}
              >
                {audio.voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          
          {customModel === "xtts" && (
            <div className="grid gap-3">
              <div className="grid gap-1">
                <span className="text-sm font-medium">Sample Voices</span>
                <select
                  className="h-9 rounded-md border border-black/10 dark:border-white/15 bg-white dark:bg-black px-3 text-sm"
                  value={selectedSampleId}
                  onChange={(e) => {
                    setSelectedSampleId(e.target.value);
                    // Clear file upload when selecting a sample
                    if (e.target.value) {
                      setSpeakerFile(null);
                      setSpeakerFileName("");
                    }
                  }}
                >
                  <option value="">Select a sample voice...</option>
                  {samples.map((sample) => (
                    <option key={sample.id} value={sample.id}>
                      {sample.name}
                    </option>
                  ))}
                </select>
                {selectedSampleId && (
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const sample = samples.find(s => s.id === selectedSampleId);
                        if (sample) {
                          const audio = new Audio(`/api/voice-samples/${sample.filename}`);
                          audio.play();
                        }
                      }}
                      className="px-2 py-1 text-xs rounded-md border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      Preview Voice
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSampleId("");
                      }}
                      className="px-2 py-1 text-xs rounded-md border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
              
              <div className="grid gap-1">
                <span className="text-sm font-medium">Or Upload Your Own (optional)</span>
                <div className="flex items-center gap-2">
                  <label className="flex-1">
                    <div className="h-9 rounded-md border border-black/10 dark:border-white/15 bg-white dark:bg-black px-3 text-sm flex items-center cursor-pointer">
                      <span className="flex-1 truncate">{speakerFileName || "Upload WAV file..."}</span>
                      <span className="text-xs opacity-70 ml-2">Browse</span>
                    </div>
                    <input 
                      type="file" 
                      accept=".wav,.mp3" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSpeakerFile(file);
                          setSpeakerFileName(file.name);
                          // Clear selected sample when uploading a file
                          setSelectedSampleId("");
                        }
                      }}
                    />
                  </label>
                  {speakerFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setSpeakerFile(null);
                        setSpeakerFileName("");
                      }}
                      className="px-2 py-1 text-xs rounded-md border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="text-xs opacity-70">Upload a WAV or MP3 file to clone a specific voice</div>
              </div>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-sm font-medium">Rate: {rate.toFixed(1)}</span>
              <input type="range" min={0.5} max={2} step={0.1} value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Pitch: {pitch.toFixed(1)}</span>
              <input type="range" min={0} max={2} step={0.1} value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))} />
            </label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              if (!phrase) return;
              if (customModel === "xtts") {
                try {
                  setSpeakingNet(true);
                  // If a sample is selected, fetch it and use as speaker reference
                  let speakerFileToUse = speakerFile;
                  
                  if (selectedSampleId && !speakerFile) {
                    const sample = samples.find(s => s.id === selectedSampleId);
                    if (sample) {
                      try {
                        const response = await fetch(`/api/voice-samples/${sample.filename}`);
                        if (response.ok) {
                          const blob = await response.blob();
                          speakerFileToUse = new File([blob], sample.filename, { 
                            type: sample.filename.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg' 
                          });
                        }
                      } catch (error) {
                        console.error('Error fetching sample file:', error);
                      }
                    }
                  }
                  
                  const url = await synthesizeTTS(phrase, { 
                    lang: "en",
                    speakerFile: speakerFileToUse
                  });
                  const a = new Audio(url);
                  void a.play();
                } finally {
                  setSpeakingNet(false);
                }
              } else {
                audio.speak(phrase, { rate, pitch, voice: audio.selectedVoice || undefined });
              }
            }}
            disabled={!phrase || speakingNet}
            className="px-3 py-1.5 rounded-md border border-black/10 dark:border-white/15 text-sm hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50"
          >
            {speakingNet ? "Generating…" : "Speak Phrase"}
          </button>
          <button
            type="button"
            onClick={() => audio.stopSpeech()}
            className="px-3 py-1.5 rounded-md border border-black/10 dark:border-white/15 text-sm hover:bg-black/5 dark:hover:bg-white/10"
          >
            Stop
          </button>
        </div>
        <SummaryItem label="Backstory" value={formatBackstory(state)} />
      </div>

      <div className="rounded-lg border border-black/10 dark:border-white/15 p-4 grid gap-2">
        <div className="text-sm opacity-70">Meme Score</div>
        <div className="text-3xl font-bold">{memeScore}</div>
        <div className="text-xs opacity-70">Higher is more brainrot. Effects and Ohio/Backrooms references help.</div>
        <div>
          <button
            type="button"
            onClick={() => { reset(); audio.stopAll(); }}
            className="mt-2 px-3 py-2 rounded-md border border-black/10 dark:border-white/15 text-sm hover:bg-black/5 dark:hover:bg-white/10"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <span className="font-medium mr-2">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

function formatCharacter(state: ReturnType<typeof useStudio>["state"]) {
  const a = state.character.animal || "?";
  const o = state.character.object || "?";
  const f = state.character.food || "?";
  return `A ${a} wielding a ${o} powered by ${f}.`;
}

function formatBackstory(state: ReturnType<typeof useStudio>["state"]) {
  const t = state.backstory.trait;
  const p = state.backstory.power;
  let o = state.backstory.origin || "";
  const a = state.character.animal || "(animal)";
  o = o ? o.replace("{animal}", a) : "";
  const parts = [t && `Personality: ${t}.`, p && `Power: ${p}.`, o && `Origin: ${o}.`].filter(Boolean);
  return parts.length ? parts.join(" ") : "(none)";
}
