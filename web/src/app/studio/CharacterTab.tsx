"use client";
import React, { useEffect, useMemo, useState } from "react";
import { animals, objects, food, type Animal, type ObjectItem, type FoodItem, getRandom } from "@/lib/data/brainrot";
import { useStudio } from "./StudioProvider";

export default function CharacterTab() {
  const { state, setCharacter } = useStudio();
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | "">("");
  const [selectedObject, setSelectedObject] = useState<ObjectItem | "">("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | "">("");

  const description = useMemo(() => {
    const a = selectedAnimal || "?";
    const o = selectedObject || "?";
    const f = selectedFood || "?";
    return `A ${a} wielding a ${o} powered by ${f}.`;
  }, [selectedAnimal, selectedObject, selectedFood]);

  function randomize() {
    setSelectedAnimal(getRandom(animals));
    setSelectedObject(getRandom(objects));
    setSelectedFood(getRandom(food));
  }

  React.useEffect(() => {
    setCharacter({
      animal: selectedAnimal || undefined,
      object: selectedObject || undefined,
      food: selectedFood || undefined,
    });
  }, [selectedAnimal, selectedObject, selectedFood, setCharacter]);

  // Hydrate from persisted context once (only if locals are empty)
  useEffect(() => {
    if (!selectedAnimal && state.character.animal) setSelectedAnimal(state.character.animal as Animal);
    if (!selectedObject && state.character.object) setSelectedObject(state.character.object as ObjectItem);
    if (!selectedFood && state.character.food) setSelectedFood(state.character.food as FoodItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.character.animal, state.character.object, state.character.food]);

  return (
    <div className="grid gap-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <LabeledSelect label="Animal" value={selectedAnimal} onChange={(v) => setSelectedAnimal(v as Animal)} options={animals} />
        <LabeledSelect label="Object" value={selectedObject} onChange={(v) => setSelectedObject(v as ObjectItem)} options={objects} />
        <LabeledSelect label="Food" value={selectedFood} onChange={(v) => setSelectedFood(v as FoodItem)} options={food} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={randomize}
          className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:opacity-90"
        >
          Randomize
        </button>
        <span className="text-sm opacity-70">Pick items or randomize to build your character base.</span>
      </div>

      <div className="rounded-lg border border-black/10 dark:border-white/15 p-4">
        <div className="text-sm opacity-70 mb-1">Description</div>
        <div className="text-base">{description}</div>
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
