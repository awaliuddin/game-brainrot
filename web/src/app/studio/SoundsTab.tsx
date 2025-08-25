"use client";
import React from "react";
import { useAudio } from "@/lib/audio/AudioProvider";

const demoSounds = [
  { name: "Tralalero Tralala", duration: 2.8 },
  { name: "Tung Tung Sahur", duration: 2.6 },
  { name: "Frog Croak Deep", duration: 1.2 },
  { name: "Computer Startup", duration: 2.1 },
  { name: "Elegant Piano", duration: 3.0 },
];

const effectList = [
  { id: "frog_filter", label: "Frog Filter" },
  { id: "chaotic_distortion", label: "Chaotic Distortion" },
  { id: "elegant_reverb", label: "Elegant Reverb" },
] as const;

export default function SoundsTab() {
  const audio = useAudio();

  return (
    <div className="grid gap-6">
      <div className="rounded-lg border border-black/10 dark:border-white/15 p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="text-sm opacity-70">Audio Engine</div>
            <div className="text-base">{audio.ready ? "Ready" : "Tap Play to initialize"}</div>
          </div>
          <button
            type="button"
            onClick={() => audio.stopAll()}
            className="px-3 py-2 rounded-md border border-black/10 dark:border-white/15 text-sm hover:bg-black/5 dark:hover:bg-white/10"
          >
            Stop All
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {effectList.map((e) => (
            <label key={e.id} className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={audio.isEffectActive(e.id)}
                onChange={() => audio.toggleEffect(e.id)}
              />
              {e.label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoSounds.map((s) => (
          <div key={s.name} className="rounded-lg border border-black/10 dark:border-white/15 p-4 grid gap-3">
            <div className="font-medium">{s.name}</div>
            <button
              type="button"
              onClick={() => audio.playSynthetic(s.name, s.duration)}
              className="px-3 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:opacity-90"
            >
              Play
            </button>
          </div>
        ))}
      </div>

      <div className="text-xs opacity-70">
        Playing IDs: {audio.playingIds.length ? audio.playingIds.join(", ") : "(none)"}
      </div>
    </div>
  );
}
