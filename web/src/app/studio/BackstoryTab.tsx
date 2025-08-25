"use client";
import React, { useEffect, useMemo, useState } from "react";
import { traits, powers, backstoryElements, animals, getRandom } from "@/lib/data/brainrot";
import { useStudio } from "./StudioProvider";

export default function BackstoryTab() {
  const { state, setBackstory } = useStudio();
  const [trait, setTrait] = useState<string>("");
  const [power, setPower] = useState<string>("");
  const [origin, setOrigin] = useState<string>("");

  const preview = useMemo(() => {
    const a = getRandom(animals);
    const o = (origin || "").replace("{animal}", a);
    return [
      trait ? `Personality: ${trait}.` : "",
      power ? `Power: ${power}.` : "",
      origin ? `Origin: ${o}.` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }, [trait, power, origin]);

  function randomize() {
    setTrait(getRandom(traits));
    setPower(getRandom(powers));
    setOrigin(getRandom(backstoryElements));
  }

  React.useEffect(() => {
    setBackstory({ trait: trait || undefined, power: power || undefined, origin: origin || undefined });
  }, [trait, power, origin, setBackstory]);

  // Hydrate from context once (only if locals are empty)
  useEffect(() => {
    if (!trait && state.backstory.trait) setTrait(state.backstory.trait!);
    if (!power && state.backstory.power) setPower(state.backstory.power!);
    if (!origin && state.backstory.origin) setOrigin(state.backstory.origin!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.backstory.trait, state.backstory.power, state.backstory.origin]);

  return (
    <div className="grid gap-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <LabeledSelect label="Trait" value={trait} onChange={setTrait} options={traits} />
        <LabeledSelect label="Power" value={power} onChange={setPower} options={powers} />
        <LabeledSelect label="Origin" value={origin} onChange={setOrigin} options={backstoryElements} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={randomize}
          className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:opacity-90"
        >
          Randomize
        </button>
        <span className="text-sm opacity-70">Pick a trait, power, and origin. {"{animal}"} will be auto-filled.</span>
      </div>

      <div className="rounded-lg border border-black/10 dark:border-white/15 p-4">
        <div className="text-sm opacity-70 mb-1">Preview</div>
        <div className="text-base">{preview || "(select items)"}</div>
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
        <option value="">Select {label.toLowerCase()}…</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
