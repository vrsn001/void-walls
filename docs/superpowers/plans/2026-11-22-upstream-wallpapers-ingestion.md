# Upstream Wallpapers Ingestion & Repo Overhaul Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ingest curated wallpapers from 4 upstream repositories (`mylinuxforwork/wallpaper`, `michaelScopic/Wallpapers`, `vyrx-dev/Wallpapers`, `AlexandrosLiaskos/Awesome_Wallpapers`), purge non-working/junk directories, regenerate manifest and thumbnails, update the in-app "LEGENDS" modal, and rewrite `README.md` with Billy Butcher & Homelander voice.

---

### Task 1: Purge Junk and Duplicate Directories
- [ ] Remove `spam/` directory (10 low-res icons/spam files) from git tracking and disk.
- [ ] Remove `devicons/` directory (software icons, non-wallpaper) from git tracking and disk.
- [ ] Remove obsolete scratch directory `wallsbyme-frontend`.
- [ ] Verify git status shows clean deletions.

### Task 2: Automated Multi-Source Ingestion Engine
- [ ] Write a robust Node.js/Python ingestion script `scripts/ingest-upstream.mjs` that:
  - Clones/downloads `mylinuxforwork/wallpaper` root images into `linux-desktop/`.
  - Downloads `michaelScopic/Wallpapers` categories (`cars/`, `cyberpunk/`, `catppuccin/`, `japanese/`, `one-dark/`, `decay/`) and appends non-duplicate images into existing folders.
  - Downloads `vyrx-dev/Wallpapers` `Vertical-wallpapers/` into `vertical/` (for the AMOLED mobile vault).
  - Downloads `AlexandrosLiaskos/Awesome_Wallpapers` into `awesome/`.
  - Skips exact duplicates (checks SHA256 / existing file hashes).
- [ ] Run the ingestion script and verify downloaded files and folder structures.

### Task 3: Manifest Generation & Bundle Optimization
- [ ] Update `scripts/generate-manifest.mjs` to include the new folders in category mappings and exclude deleted folders.
- [ ] Run `node scripts/generate-manifest.mjs` to update `frontend/src/data/wallpapers.json`.
- [ ] Run `npx oxlint` and `npm run build` inside `frontend/` to ensure 0 errors and verified chunking.

### Task 4: In-App "LEGENDS" Modal Update
- [ ] Update `frontend/src/components/RepoCreditsModal.tsx` to list:
  - `dharmx/walls` (Original architecture)
  - `mylinuxforwork/wallpaper` (Linux workstation backdrops)
  - `michaelScopic/Wallpapers` (Cars, Cyberpunk, Catppuccin, Japanese)
  - `vyrx-dev/Wallpapers` (AMOLED 9:16 Vertical phone vaults)
  - `AlexandrosLiaskos/Awesome_Wallpapers` (Curated web gallery)
- [ ] Ensure Butcher & Homelander style copy ("PROPER RESPECT TO THE CREATORS").

### Task 5: Root README.md Comprehensive Rewrite
- [ ] Completely rewrite root `README.md` with:
  - ASCII HUD branding banner.
  - Billy Butcher & Homelander intro ("WE CAN DO WHATEVER THE FUCK WE WANT").
  - Live deployment badge: `https://void-walls.vercel.app`.
  - Comprehensive category vault breakdown table (including all new vaults).
  - Technical resolution matrix (4K UHD, 2K QHD, FHD, 9:16 Mobile AMOLED, 60FPS Live Loops).
  - Upstream legends acknowledgement table with direct links.
  - Visual screenshots embedded.

### Task 6: Commit, Push & Vercel Verification
- [ ] Stage and commit changes to `vrsn001/wallsbyme` on branch `main`.
- [ ] Push to `origin/main`.
- [ ] Verify Vercel deployment status transitions to `READY`.
- [ ] Browser QA inspection on `https://void-walls.vercel.app`.
