"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type EffectId = "frog_filter" | "chaotic_distortion" | "elegant_reverb";

export type PlayingHandle = {
  id: string;
  stop: () => void;
};

export function useAudioEngine() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const [ready, setReady] = useState(false);
  const [activeEffects, setActiveEffects] = useState<Set<EffectId>>(new Set());
  const [playingIds, setPlayingIds] = useState<string[]>([]);
  // TTS
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  useEffect(() => { selectedVoiceRef.current = selectedVoice; }, [selectedVoice]);

  const ensureContext = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!audioCtxRef.current) {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
      if (!Ctx) return;
      const ctx = new Ctx();
      const gain = ctx.createGain();
      gain.gain.value = 0.75;
      gain.connect(ctx.destination);
      audioCtxRef.current = ctx;
      masterGainRef.current = gain;
      setReady(true);
    }
  }, []);

  useEffect(() => {
    // Lazy create context on first user gesture typically via play
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      const loadVoices = () => {
        const v = window.speechSynthesis.getVoices();
        setVoices(v);
        // Only set a default if the user hasn't selected one yet
        if (!selectedVoiceRef.current && v.length) {
          const pref = v.find((x) => /en[-_]US/i.test(x.lang)) || v[0];
          setSelectedVoice(pref);
        }
      };
      try {
        loadVoices();
        // voices can load async in some browsers
        window.speechSynthesis.onvoiceschanged = loadVoices;
      } catch {}
    }
  }, []);

  const toggleEffect = useCallback((id: EffectId) => {
    setActiveEffects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isEffectActive = useCallback((id: EffectId) => activeEffects.has(id), [activeEffects]);

  const buildEffectChain = useCallback((): AudioNode[] => {
    const ctx = audioCtxRef.current!;
    const chain: AudioNode[] = [];
    // frog_filter -> lowpass
    if (activeEffects.has("frog_filter")) {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 300;
      chain.push(lp);
    }
    // chaotic_distortion -> waveshaper
    if (activeEffects.has("chaotic_distortion")) {
      const ws = ctx.createWaveShaper();
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i / 128) - 1;
        curve[i] = Math.tanh(4 * x);
      }
      ws.curve = curve;
      chain.push(ws);
    }
    // elegant_reverb -> simple convolver-like with small delay feedback (fake light reverb)
    if (activeEffects.has("elegant_reverb")) {
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = 0.12;
      const fb = ctx.createGain();
      fb.gain.value = 0.25;
      delay.connect(fb);
      fb.connect(delay);
      chain.push(delay);
    }
    return chain;
  }, [activeEffects]);

  const connectChain = (source: AudioNode, destination: AudioNode, chain: AudioNode[]) => {
    if (chain.length === 0) {
      source.connect(destination);
      return;
    }
    source.connect(chain[0]);
    for (let i = 0; i < chain.length - 1; i++) {
      chain[i].connect(chain[i + 1]);
    }
    chain[chain.length - 1].connect(destination);
  };

  const playSynthetic = useCallback(async (name: string, duration = 2): Promise<PlayingHandle | null> => {
    await ensureContext();
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return null;

    const sampleRate = ctx.sampleRate;
    const length = Math.max(1, Math.floor(sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;
      const n = name.toLowerCase();
      if (n.includes("tra") || n.includes("tung")) {
        sample = Math.sin(2 * Math.PI * 220 * t) * Math.sin(2 * Math.PI * 4 * t) * 0.3;
      } else if (n.includes("frog")) {
        sample = Math.sin(2 * Math.PI * 150 * t) * Math.exp(-t * 2) * 0.5;
      } else if (n.includes("computer")) {
        sample = Math.sin(2 * Math.PI * 800 * t) * (t < 0.1 ? 1 : 0) * 0.4;
      } else if (n.includes("elegant")) {
        sample = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 0.5) * 0.3;
      } else {
        sample = (Math.random() - 0.5) * Math.sin(2 * Math.PI * 200 * t) * 0.2;
      }
      const env = Math.exp(-t * 0.8);
      data[i] = sample * env;
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const chain = buildEffectChain();
    connectChain(src, master, chain);

    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    setPlayingIds((ids) => [...ids, id]);

    src.onended = () => {
      setPlayingIds((ids) => ids.filter((x) => x !== id));
    };

    src.start();

    const handle: PlayingHandle = {
      id,
      stop: () => {
        try { src.stop(); } catch {}
      },
    };
    return handle;
  }, [ensureContext, buildEffectChain]);

  const stopAll = useCallback(() => {
    // With buffer sources, easiest is to close and recreate context
    const ctx = audioCtxRef.current;
    if (ctx) {
      try { ctx.close(); } catch {}
      audioCtxRef.current = null;
      masterGainRef.current = null;
      setReady(false);
      setPlayingIds([]);
    }
  }, []);

  const stopSpeech = useCallback(() => {
    const synth = synthRef.current;
    if (!synth) return;
    try {
      synth.cancel();
    } catch {}
    utteranceRef.current = null;
    setSpeaking(false);
  }, []);

  const speak = useCallback((text: string, opts?: { rate?: number; pitch?: number; lang?: string; voice?: SpeechSynthesisVoice }) => {
    if (!text || typeof window === "undefined") return;
    const synth = synthRef.current;
    if (!synth) return;
    // Cancel any ongoing speech
    try { synth.cancel(); } catch {}
    const u = new SpeechSynthesisUtterance(text);
    u.rate = Math.min(2, Math.max(0.5, opts?.rate ?? 1));
    u.pitch = Math.min(2, Math.max(0, opts?.pitch ?? 1));
    // Resolve the voice against the current voices array to avoid stale object refs
    const desired = opts?.voice || selectedVoiceRef.current || null;
    const resolved = desired ? (voices.find((v) => v.voiceURI === desired.voiceURI) || desired) : null;
    if (resolved) {
      u.voice = resolved;
      u.lang = opts?.lang || resolved.lang || "en-US";
    } else {
      u.lang = opts?.lang || "en-US";
    }
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utteranceRef.current = u;
    try { synth.speak(u); } catch { setSpeaking(false); }
  }, [voices]);

  return useMemo(() => ({
    ready,
    activeEffects,
    playingIds,
    ensureContext,
    toggleEffect,
    isEffectActive,
    playSynthetic,
    stopAll,
    // TTS
    speak,
    stopSpeech,
    speaking,
    voices,
    selectedVoice,
    setSelectedVoice,
  }), [ready, activeEffects, playingIds, ensureContext, toggleEffect, isEffectActive, playSynthetic, stopAll, speak, stopSpeech, speaking, voices, selectedVoice]);
}
