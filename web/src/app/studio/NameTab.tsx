"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  italianSuffixes,
  nonsenseSyllables,
  onomatopoeia,
  italianWords,
  getRandom,
} from "@/lib/data/brainrot";
import { useStudio } from "./StudioProvider";

function titleCase(s: string) {
  return s.replace(/(^|\s|[-_])([a-z])/g, (_, sep, c) => (sep || "") + c.toUpperCase());
}

function generateName(opts?: {
  seed?: number;
  useOnomatopoeia?: boolean;
  parts?: number;
}): string {
  // Simple deterministic-ish combiner with options
  const useOn = opts?.useOnomatopoeia ?? true;
  const parts = Math.max(2, Math.min(4, opts?.parts ?? 3));

  const core: string[] = [];
  for (let i = 0; i < parts; i++) {
    core.push(getRandom(useOn ? [...nonsenseSyllables, ...onomatopoeia] : nonsenseSyllables));
  }

  const base = core.join(" ");
  const word = Math.random() < 0.5 ? getRandom(italianWords) : base;
  const suf = Math.random() < 0.8 ? getRandom(italianSuffixes) : "";
  return titleCase(`${word}${suf}`.replace(/\s+/g, " ").trim());
}

export default function NameTab() {
  const { state, setName } = useStudio();
  const [custom, setCustom] = useState("");
  const [generated, setGenerated] = useState<string>("");
  const finalName = useMemo(() => (custom.trim() ? custom.trim() : generated), [custom, generated]);

  React.useEffect(() => {
    setName(finalName || undefined);
  }, [finalName, setName]);

  // Hydrate once from context if empty
  useEffect(() => {
    if (!custom && !generated && state.name) {
      setGenerated(state.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.name]);

  function onGenerate() {
    setGenerated(generateName());
  }

  function onClear() {
    setCustom("");
    setGenerated("");
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onGenerate}
          className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:opacity-90"
        >
          Generate Name
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-3 py-2 rounded-md border border-black/10 dark:border-white/15 text-sm hover:bg-black/5 dark:hover:bg-white/10"
        >
          Clear
        </button>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="customName">Custom Name</label>
        <input
          id="customName"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Type your own name or use the generator"
          className="h-10 rounded-md border border-black/10 dark:border-white/15 bg-white dark:bg-black px-3 text-sm"
        />
        <p className="text-xs opacity-70">If custom is non-empty, it overrides the generated name.</p>
      </div>

      <div className="rounded-lg border border-black/10 dark:border-white/15 p-4">
        <div className="text-sm opacity-70 mb-1">Final Name</div>
        <div className="text-lg font-semibold">{finalName || "(none)"}</div>
      </div>
    </div>
  );
}
