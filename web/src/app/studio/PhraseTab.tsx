"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  phraseTemplates,
  adjectives,
  locations,
  animals,
  objects,
  food,
  buildPhrase,
  getRandom,
} from "@/lib/data/brainrot";
import { useStudio } from "./StudioProvider";
import { useAudio } from "@/lib/audio/AudioProvider";
import { synthesizeTTS } from "@/lib/tts/customTts";
import { useVoiceSamples } from "@/lib/tts/useVoiceSamples";

export default function PhraseTab() {
  const { state, setPhrase } = useStudio();
  const audio = useAudio();
  const [template, setTemplate] = useState<string>(phraseTemplates[0]);
  const [xToken, setXToken] = useState<string>("");
  const [place, setPlace] = useState<string>("");
  const [adjective, setAdjective] = useState<string>("");
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [customModel, setCustomModel] = useState<"off" | "xtts">("off");
  const [speakingNet, setSpeakingNet] = useState(false);
  const [speakerFile, setSpeakerFile] = useState<File | null>(null);
  const [speakerFileName, setSpeakerFileName] = useState<string>("");
  const [selectedSampleId, setSelectedSampleId] = useState<string>("");
  const { samples, loading: loadingSamples } = useVoiceSamples();

  const preview = useMemo(
    () => buildPhrase(template, { X: xToken, place, adjective }),
    [template, xToken, place, adjective]
  );

  function randomize() {
    // X token can be a mash of animal/object/food
    const x = [getRandom(animals), getRandom(objects), getRandom(food)][
      Math.floor(Math.random() * 3)
    ];
    setXToken(x);
    setPlace(getRandom(locations));
    setAdjective(getRandom(adjectives));
    setTemplate(getRandom(phraseTemplates));
  }

  React.useEffect(() => {
    setPhrase({ template, X: xToken, place, adjective });
  }, [template, xToken, place, adjective, setPhrase]);

  // Hydrate from context once (only when local is empty or default)
  useEffect(() => {
    const s = (v?: string) => (typeof v === "string" ? v : "");
    if (template === phraseTemplates[0] && s(state.phrase.template)) {
      setTemplate(state.phrase.template!);
    }
    if (!xToken && s(state.phrase.X)) setXToken(state.phrase.X!);
    if (!place && s(state.phrase.place)) setPlace(state.phrase.place!);
    if (!adjective && s(state.phrase.adjective)) setAdjective(state.phrase.adjective!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phrase.template, state.phrase.X, state.phrase.place, state.phrase.adjective]);

  return (
    <div className="grid gap-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <LabeledSelect label="Template" value={template} onChange={setTemplate} options={phraseTemplates} />
        <div className="grid gap-2">
          <span className="text-sm font-medium">Quick Picks</span>
          <div className="flex flex-wrap gap-2">
            <QuickPick label="Animal" onPick={() => setXToken(getRandom(animals))} />
            <QuickPick label="Object" onPick={() => setXToken(getRandom(objects))} />
            <QuickPick label="Food" onPick={() => setXToken(getRandom(food))} />
            <QuickPick label="Adjective" onPick={() => setAdjective(getRandom(adjectives))} />
            <QuickPick label="Place" onPick={() => setPlace(getRandom(locations))} />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <LabeledInput label="{X}" value={xToken} onChange={setXToken} placeholder="e.g., shark, sneakers, risotto" />
        <LabeledInput label="{place}" value={place} onChange={setPlace} placeholder="e.g., Ohio" />
        <LabeledInput label="{adjective}" value={adjective} onChange={setAdjective} placeholder="e.g., cursed" />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={randomize}
          className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:opacity-90"
        >
          Randomize
        </button>
        <span className="text-sm opacity-70">Use quick picks or type tokens to fill the template.</span>
      </div>

      <div className="rounded-lg border border-black/10 dark:border-white/15 p-4">
        <div className="text-sm opacity-70 mb-1">Preview</div>
        <div className="text-base mb-2">{preview || "(fill tokens)"}</div>
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
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.1}
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Pitch: {pitch.toFixed(1)}</span>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
              />
            </label>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              if (!preview) return;
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
                  
                  const url = await synthesizeTTS(preview, { 
                    lang: "en",
                    speakerFile: speakerFileToUse
                  });
                  const a = new Audio(url);
                  void a.play();
                } finally {
                  setSpeakingNet(false);
                }
              } else {
                audio.speak(preview, { rate, pitch, voice: audio.selectedVoice || undefined });
              }
            }}
            disabled={!preview || speakingNet}
            className="px-3 py-1.5 rounded-md border border-black/10 dark:border-white/15 text-sm hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50"
          >
            {speakingNet ? "Generating…" : "Speak"}
          </button>
          <button
            type="button"
            onClick={() => audio.stopSpeech()}
            className="px-3 py-1.5 rounded-md border border-black/10 dark:border-white/15 text-sm hover:bg-black/5 dark:hover:bg-white/10"
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}

function LabeledSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T | "";
  onChange: (v: T | "") => void;
  options: readonly T[];
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium">{label}</span>
      <select
        className="h-10 rounded-md border border-black/10 dark:border-white/15 bg-white dark:bg-black px-3 text-sm"
        value={value}
        onChange={(e) => onChange((e.target.value as T) || "")}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium">{label}</span>
      <input
        className="h-10 rounded-md border border-black/10 dark:border-white/15 bg-white dark:bg-black px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function QuickPick({ label, onPick }: { label: string; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="px-3 py-1.5 rounded-md border border-black/10 dark:border-white/15 text-sm hover:bg-black/5 dark:hover:bg-white/10"
    >
      {label}
    </button>
  );
}
