"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CharacterState = {
  animal?: string;
  object?: string;
  food?: string;
};
export type PhraseState = {
  template?: string;
  X?: string;
  place?: string;
  adjective?: string;
};
export type BackstoryState = {
  trait?: string;
  power?: string;
  origin?: string; // resolved with animal when shown
};

export type StudioState = {
  character: CharacterState;
  name?: string;
  phrase: PhraseState;
  backstory: BackstoryState;
};

const defaultState: StudioState = {
  character: {},
  phrase: {},
  backstory: {},
};

type CtxType = {
  state: StudioState;
  setCharacter: (patch: CharacterState) => void;
  setName: (name?: string) => void;
  setPhrase: (patch: PhraseState) => void;
  setBackstory: (patch: BackstoryState) => void;
  reset: () => void;
};

const Ctx = createContext<CtxType | null>(null);

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StudioState>(defaultState);

  // Load from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("studio_state_v1") : null;
      if (raw) {
        const parsed = JSON.parse(raw) as StudioState;
        // Basic shape guard
        if (parsed && typeof parsed === "object") {
          setState({
            character: parsed.character || {},
            name: parsed.name,
            phrase: parsed.phrase || {},
            backstory: parsed.backstory || {},
          });
        }
      }
    } catch {}
    // no deps: run once
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("studio_state_v1", JSON.stringify(state));
      }
    } catch {}
  }, [state]);

  // shallow equality helper
  function shallowEqual(a?: Record<string, any>, b?: Record<string, any>) {
    const ak = Object.keys(a || {});
    const bk = Object.keys(b || {});
    if (ak.length !== bk.length) return false;
    for (const k of ak) {
      if ((a as any)[k] !== (b as any)[k]) return false;
    }
    return true;
  }

  // remove keys with undefined values to stabilize comparisons and avoid loops
  function cleanUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
    const out: Record<string, any> = {};
    for (const k of Object.keys(obj || {})) {
      const v = (obj as any)[k];
      if (v !== undefined) out[k] = v;
    }
    return out as Partial<T>;
  }

  const value = useMemo<CtxType>(() => ({
    state,
    setCharacter: (patch) => setState((s) => {
      const next = cleanUndefined({ ...s.character, ...patch });
      if (shallowEqual(next, s.character)) return s; // no-op
      return { ...s, character: next };
    }),
    setName: (name) => setState((s) => {
      const norm = name || undefined;
      if (s.name === norm) return s;
      return { ...s, name: norm };
    }),
    setPhrase: (patch) => setState((s) => {
      const next = cleanUndefined({ ...s.phrase, ...patch });
      if (shallowEqual(next, s.phrase)) return s;
      return { ...s, phrase: next };
    }),
    setBackstory: (patch) => setState((s) => {
      const next = cleanUndefined({ ...s.backstory, ...patch });
      if (shallowEqual(next, s.backstory)) return s;
      return { ...s, backstory: next };
    }),
    reset: () => {
      setState(defaultState);
      try {
        if (typeof window !== "undefined") localStorage.removeItem("studio_state_v1");
      } catch {}
    },
  }), [state]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStudio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStudio must be used within <StudioProvider>");
  return ctx;
}
