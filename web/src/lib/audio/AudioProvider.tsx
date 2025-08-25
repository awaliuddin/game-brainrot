"use client";
import React, { createContext, useContext } from "react";
import { useAudioEngine } from "./useAudioEngine";

type AudioContextValue = ReturnType<typeof useAudioEngine>;

const Ctx = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const engine = useAudioEngine();
  return <Ctx.Provider value={engine}>{children}</Ctx.Provider>;
}

export function useAudio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAudio must be used within <AudioProvider>");
  return ctx;
}
