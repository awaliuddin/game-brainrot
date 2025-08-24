# Brainrot Character Construction Studio

Modern Next.js 14 + TypeScript + Tailwind migration of the original static Brainrot POC.

- New app: `web/` (Next.js App Router, TS, Tailwind)
- Legacy POC preserved: `web/public/legacy-poc/` (index.html, app.js, audio/)

## Quick start

Prereqs: Node 18+

```bash
# Start the Next.js app
cd web
npm install
npm run dev
# Open http://localhost:3000/studio
# Legacy POC: http://localhost:3000/legacy-poc/index.html
```

## Project layout

- `web/` – Next.js app
  - `src/app/` – App Router pages
    - `page.tsx` – Home page with link to legacy POC
    - `studio/` – Studio feature (tabbed builder)
  - `src/components/` – Shared UI components (e.g., `Tabs.tsx`)
  - `src/lib/` – Data, audio, utilities
    - `data/brainrot.ts` – Typed arrays for content + helpers
    - `audio/` – Web Audio hook and provider
  - `public/legacy-poc/` – Static POC assets
- `.windsurf/workflows/` – CI placeholders (to be refined)

## Current status

- Tabs implemented: Character, Name, Phrase, Sounds, Backstory, Preview
- Shared state via `StudioProvider` with `localStorage` persistence
- Web Audio engine with simple effects (frog_filter, chaotic_distortion, elegant_reverb)
- Preview tab shows a meme score based on selections and active effects

## Coding standards

- TypeScript everywhere; typed data via `as const` and derived union types
- React function components + hooks; no classes
- Path alias: `@/*` → `web/src/*`
- Styling: Tailwind CSS

## Development scripts (from `web/`)

- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run start` – start production server
- `npm run lint` – lint (configure rules as needed)

## Migration notes

- Legacy POC remains accessible under `/legacy-poc/` for reference and parity testing.
- Audio system refactored into `useAudioEngine` and `AudioProvider`.
- New Studio state kept in `StudioProvider`; tabs write into shared state; Preview reads it.

## Roadmap

- Shadcn UI + motion polish
- ESLint AirBnB + Prettier config and CI setup
- Export/Import and shareable URL state
- Deeper audio engine parity with the POC
