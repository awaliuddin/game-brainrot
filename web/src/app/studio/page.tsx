"use client";
import React from "react";
import Tabs, { Tab } from "@/components/Tabs";
import CharacterTab from "./CharacterTab";
import NameTab from "./NameTab";
import PhraseTab from "./PhraseTab";
import SoundsTab from "./SoundsTab";
import BackstoryTab from "./BackstoryTab";
import PreviewTab from "./PreviewTab";
import { StudioProvider } from "./StudioProvider";

export default function StudioPage() {
  const tabs: Tab[] = [
    { id: "character", label: "Character", content: <CharacterTab /> },
    { id: "name", label: "Name", content: <NameTab /> },
    { id: "phrase", label: "Phrase", content: <PhraseTab /> },
    { id: "sounds", label: "Sounds", content: <SoundsTab /> },
    { id: "backstory", label: "Backstory", content: <BackstoryTab /> },
    { id: "preview", label: "Preview", content: <PreviewTab /> },
  ];

  return (
    <div className="min-h-[100svh] p-6 sm:p-10" suppressHydrationWarning>
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">Brainrot Character Construction Studio</h1>
      <p className="text-sm opacity-70 mb-6">Next.js + Tailwind scaffold. Porting legacy POC features into React components.</p>
      <StudioProvider>
        <Tabs tabs={tabs} className="max-w-5xl" />
      </StudioProvider>
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-black/10 dark:border-white/15 p-6">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-sm opacity-70">Content coming soon. This will be ported from the legacy POC.</p>
    </div>
  );
}
