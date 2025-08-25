# Architecture: Brainrot Studio (web/)

This document explains the code organization, data flow, and key design decisions for the Next.js migration.

## High-level overview

- Next.js 14 App Router under `src/app/`
- Feature: Brainrot Studio under `src/app/studio/`
- Shared state via `StudioProvider` (React Context)
- Audio system via `AudioProvider` wrapping `useAudioEngine` hook
- Typed content data and helpers in `src/lib/data/brainrot.ts`
- Legacy static POC preserved in `public/legacy-poc/`

## Directory structure

- `src/app/layout.tsx` – root layout; wraps with `AudioProvider`
- `src/app/studio/page.tsx` – renders Tabs; wraps with `StudioProvider`
- `src/app/studio/StudioProvider.tsx` – context with schema + persistence
- `src/app/studio/CharacterTab.tsx` – animal/object/food pickers
- `src/app/studio/NameTab.tsx` – generator + custom name
- `src/app/studio/PhraseTab.tsx` – phrase template with tokens
- `src/app/studio/SoundsTab.tsx` – audio engine demo + effect toggles
- `src/app/studio/BackstoryTab.tsx` – trait/power/origin
- `src/app/studio/PreviewTab.tsx` – summary + meme score + reset
- `src/lib/data/brainrot.ts` – typed arrays, `buildPhrase()`, helpers
- `src/lib/audio/useAudioEngine.ts` – Web Audio logic
- `src/lib/audio/AudioProvider.tsx` – audio context + `useAudio()` hook

## State model: StudioProvider

Type (simplified):

```ts
export type StudioState = {
  character: { animal?: string; object?: string; food?: string };
  name?: string;
  phrase: { template?: string; X?: string; place?: string; adjective?: string };
  backstory: { trait?: string; power?: string; origin?: string };
};
```

- Context API: `setCharacter(patch)`, `setName(name)`, `setPhrase(patch)`, `setBackstory(patch)`, `reset()`
- Persistence: `localStorage` key `studio_state_v1`
- Hydration: Each tab seeds its local UI state from context if empty so controls reflect persisted values upon reload

## Audio system

- `useAudioEngine()` creates an `AudioContext`, exposes `playSynthetic(id, opts)`, `stopAll()`, and `activeEffects`
- Simple effect toggles: `frog_filter`, `chaotic_distortion`, `elegant_reverb`
- `AudioProvider` puts the engine in context; components consume via `useAudio()`

## Preview and scoring

- Builds phrase via `buildPhrase(template, { X, place, adjective })`
- Meme score (0–100) heuristic:
  - Completeness: +10 (character filled)
  - Name length > 8: +8
  - Trendy adjectives (e.g., cursed/based/sus/slaps/bussin): +10
  - Trendy places (Ohio/Backrooms/TikTok): +6
  - Backstory trait/power: +10
  - Active audio effects: up to +10
  - Clamped to [0, 100]
- Reset button: clears context and `localStorage`, stops all audio

## Routing and legacy parity

- Studio route: `/studio`
- Legacy POC: `/legacy-poc/index.html` served statically from `public/legacy-poc/`

## Styling

- Tailwind CSS; light/dark friendly neutrals used for borders/backgrounds
- Keep UI accessible, responsive with simple grid/flex layouts

## Future improvements

- Shadcn UI components + Framer Motion transitions
- ESLint AirBnB + Prettier + CI workflows
- Export/Import JSON of `StudioState`, and shareable URL encoding
- Enhanced audio pipeline and samples parity with legacy POC
