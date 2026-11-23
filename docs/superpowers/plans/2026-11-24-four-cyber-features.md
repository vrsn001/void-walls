# 4 Cyberpunk Features (Zero-Lag Mobile Architecture) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

This plan details the implementation of 4 high-demand cyberpunk features for Void Walls, engineered specifically with zero-lag mobile constraints (pure CSS hardware compositing, micro-canvas offscreen downsampling, 0 cookies, 0 external npm dependencies, touch targets $\ge 44\text{px}$).

---

## Architecture & Subsystems

1. **Feature 1: Ricing Palette Exporter (`[PALETTE / RICE]`)**
   - File: `app/src/lib/palette.ts` (Micro-canvas $64\times 64$px color sampling & quantization, $<3\text{ms}$)
   - File: `app/src/components/palette-modal.tsx` (Tactile cyberpunk swatches, HEX/RGB/CSS/Polybar/Waybar copy)
   - Integration: `app/src/components/lightbox.tsx` (Trigger button in header & bottom bar)

2. **Feature 2: In-Browser Cyber Studio & AMOLED Crusher (`[CYBER STUDIO]`)**
   - File: `app/src/components/studio-modal.tsx` (Live CSS-composited preview: True #000000 OLED Black Crusher, contrast, CRT phosphor scanlines, vignette, film grain)
   - Canvas pipeline: Offscreen full-res export only on download click with progress indicator
   - Integration: `app/src/components/lightbox.tsx` (Trigger button in header & bottom bar)

3. **Feature 3: Cyber Pomodoro Focus HUD (`[POMO HUD]`)**
   - File: `app/src/lib/pomodoro.ts` (Tactical 25m/5m/15m state engine with localStorage sync)
   - File: `app/src/components/pomodoro-hud.tsx` (Terminal countdown, cycle tracker, audio cues)
   - Integration: `app/src/components/radio-panel.tsx` (Tab in 10-station HUD), `app/src/components/terminal-app.tsx` (Footer status badge)

4. **Feature 4: Portable Stash Export / Sync (`[SYNC / JSON]`)**
   - File: `app/src/lib/favorites.ts` (Export/import/merge functions with schema validation)
   - File: `app/src/components/stash-sync-modal.tsx` (Export JSON, Copy compact sync string, Import/Merge, Native Mobile Share)
   - Integration: `app/src/components/terminal-app.tsx` (Stash view action bar & header)

---

## Tasks

### Task 1: Ricing Palette Exporter
- [ ] Create `app/src/lib/palette.ts`:
  - `extractPaletteFromImage(imageSrc: string): Promise<PaletteColor[]>`
  - Micro-canvas $64\times 64$px downsampling with color clustering.
  - Return 5 cyberpunk tones: Dominant Dark, Surface, Core Accent, Neon Highlight, Secondary Glow.
  - Formatting helpers: `formatAsHexList`, `formatAsCssVars`, `formatAsPolybar`, `formatAsJson`.
- [ ] Create `app/src/components/palette-modal.tsx`:
  - Modal with swatch cards, luminance metrics, 1-tap copy, format selector.
  - Mobile touch targets $\ge 44\text{px}$, audio feedback on copy.
- [ ] Mount Palette button in `app/src/components/lightbox.tsx`.
- [ ] Verify functionality and mobile responsiveness via browser subagent.

### Task 2: Cyber Studio & AMOLED Black Crusher
- [ ] Create `app/src/components/studio-modal.tsx`:
  - Interactive controls: AMOLED Black Crusher (threshold slider), Contrast, Brightness, CRT Scanlines, Vignette, Grain.
  - 100% hardware-composited CSS filter preview for 120 FPS on phones.
  - Offscreen canvas export on `[APPLY & DOWNLOAD]` with terminal download progress.
- [ ] Mount Studio button in `app/src/components/lightbox.tsx`.
- [ ] Verify image processing and download pipeline.

### Task 3: Cyber Pomodoro Focus HUD
- [ ] Create `app/src/lib/pomodoro.ts`:
  - 25m work / 5m break / 15m deep rest intervals.
  - LocalStorage persistence and audio alarm triggers via `SoundEngine`.
- [ ] Create `app/src/components/pomodoro-hud.tsx`:
  - Cyber countdown, progress bar, cycle count, start/pause/skip controls.
- [ ] Integrate into `app/src/components/radio-panel.tsx` (toggle between Radio Tuner and Pomodoro HUD) and `app/src/components/terminal-app.tsx` (footer status indicator).
- [ ] Verify timer behavior and zero background CPU usage when paused.

### Task 4: Portable Stash Export / Sync
- [ ] Update `app/src/lib/favorites.ts`:
  - `exportStashJson(): string`
  - `importStashJson(rawJson: string): { success: boolean; importedCount: number; error?: string }`
  - `exportCompactSyncString(): string`
- [ ] Create `app/src/components/stash-sync-modal.tsx`:
  - Download `.json` backup file.
  - Copy compact string / Mobile `navigator.share` integration.
  - Paste / upload file import with deduplication and validation.
- [ ] Mount Stash Sync action toolbar in `app/src/components/terminal-app.tsx` when in `THE_STASH` view and header.
- [ ] Verify export and import between simulated sessions.

### Task 5: QA Verification, Mobile Check & Production Build
- [ ] Run full Next.js build: `npm run build` in `app/` to ensure zero TypeScript/lint errors.
- [ ] Run browser subagent at 390px (mobile) and desktop to inspect all 4 features, verifying:
  - 0 console errors
  - 0 layout overflow
  - Touch targets $\ge 44\text{px}$
  - Instant snappy transitions
- [ ] Commit all changes with clean git history and push to GitHub.
