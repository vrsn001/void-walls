<p align="center">
  <img src="assets/void-banner.svg" alt="VOID//WALLS (虚無) Banner" width="100%" />
</p>

<p align="center">
  <a href="https://void-walls.vercel.app"><img src="https://img.shields.io/badge/LIVE_VAULT-void--walls.vercel.app-00f0ff?style=for-the-badge&logo=vercel&logoColor=black" alt="Live Deployment"></a>
  <img src="https://img.shields.io/badge/CURATED_ASSETS-2%2C479%2B-ff5722?style=for-the-badge&logo=github&logoColor=white" alt="Curated Assets">
  <img src="https://img.shields.io/badge/STYLE-RAZOR_SHARP_BRUTALIST-000000?style=for-the-badge&logoColor=white" alt="Pure Dark Brutalist">
  <img src="https://img.shields.io/badge/VIDEO_LOOPS-60FPS_MP4-00f0ff?style=for-the-badge" alt="Video Loops">
  <img src="https://img.shields.io/badge/RESOLVER-MULTI_FORMAT_&_RES-ff5722?style=for-the-badge" alt="Multi Format & Res">
</p>

---

```
  ██    ██  ██████  ██ ██████  ██    ██    ██     ██  █████  ██      ██      ███████ 
  ██    ██ ██    ██ ██ ██   ██ ██    ██    ██     ██ ██   ██ ██      ██      ██      
  ██    ██ ██    ██ ██ ██   ██ ██    ██    ██  █  ██ ███████ ██      ██      ███████ 
   ██  ██  ██    ██ ██ ██   ██  ██  ██     ██ ███ ██ ██   ██ ██      ██           ██ 
    ████    ██████  ██ ██████    ████       ███ ███  ██   ██ ███████ ███████ ███████ 
                              [ 虚無 // SCORCHED EARTH ]
```

# VOID//WALLS (虚無)

> *"Oi, cunt. Tired of corporate wankers shoving bloated wallpaper apps full of ads, tracking cookies, and melted AI slop down your gullet? Yeah, so were we. So we scorched the fucking earth."* — **Billy Butcher**

**VOID//WALLS** is an underground, non-AI-slop, hyper-optimized, razor-sharp cyber-brutalist wallpaper vault and interactive frontend. Built for ricing enthusiasts, terminal dwellers, power users, and anyone who despises corporate bloat.

🌐 **Live Production Web App:** [https://void-walls.vercel.app](https://void-walls.vercel.app)

---

## 🔪 THE GIST (NO WANKERS ALLOWED)

Most wallpaper sites on the internet are absolute bollocks:
- 50 pop-ups asking for your email before you can download a 720p jpeg.
- Bubbly rounded bubble-gum corners designed like a bloody kindergarten toy.
- 44 MB uncompressed master files that choke your browser until your laptop fan sounds like a Harrier jump jet.
- Stolen AI "art" with six fingers and seven eyeballs.

**VOID//WALLS fixes the lot:**
1. **2,479+ Verified Assets**: Desktop 4K/2K/FHD, 60 FPS live video loops, and 9:16 AMOLED phone backdrops.
2. **Pointy, Brutalist Geometry**: No soft rounded corners. Everything is sharp right angles, blueprint crosshairs, and pure `#000000` AMOLED void.
3. **Dual Edge Engine (Option A + Option B)**:
   - **Option A (Edge Resizer)**: Cloudflare Edge proxy transforms 44 MB raw PNGs into ~10 KB WebP thumbnails on the fly. 36 cards consume **~400 KB total instead of 150 MB**.
   - **Option B (GitHub Actions CI)**: Automated `sharp` workflow pre-generates 600px WebP thumbnails directly on git push.
4. **Multi-Resolution & Multi-Format Resolver**: Export any static wallpaper into **PNG**, **JPG**, or **WEBP** at **Master 4K**, **4K UHD (3840×2160)**, **2K QHD (2560×1440)**, **1080p FHD**, or **Mobile AMOLED (1080×1920)** with one click.
5. **Zero Tracking. Zero Ads. Zero Telemetry.** Straight Fastly edge and Cloudflare CDN piping direct to your machine.

---

## ⚡ THE WEAPONS LOCKER (SPECIFICATIONS)

| Metric | Specification | Butcher's Take |
| :--- | :--- | :--- |
| **Total Vault Assets** | **2,479+ Curated Files** | Every single file hand-picked and indexed. No bloody duplicates. |
| **High-Res Static** | **2,463 Wallpapers** | 4K UHD, 2K QHD, 1080p FHD, and 9:16 vertical. Crisp as a butcher’s blade. |
| **Live Motion Loops** | **16 60FPS Video Loops** | High-bitrate MP4s that loop seamlessly without dropping a single frame. |
| **Export Resolver** | **PNG / JPG / WEBP** | Download in whatever resolution or format your rig needs. Sorted. |
| **Edge Performance** | **<200ms Card Render** | 99.6% payload reduction via Cloudflare edge WebP transcoding. |
| **Aesthetic System** | **Matrix Cyber Brutalist** | `#000000` void, `#00f0ff` electric cyan, `#f59e0b` hazard amber, point corners. |

---

## 🎛️ EXPORT RESOLVER MATRIX

Inside the **[INSPECT_NODE]** Lightbox, you're in the driver's seat. Select your target format and resolution preset:

```
+-------------------------------------------------------------+
|  EXPORT_RESOLVER                                            |
|                                                             |
|  TARGET RESOLUTION:                                         |
|  [ MASTER 4K ]  [ 3840x2160 ]  [ 2560x1440 ]  [ 1920x1080 ] |
|                                                             |
|  TARGET FORMAT:                                             |
|  [ ORIGINAL ]   [ PNG ]        [ JPG ]        [ WEBP ]      |
|                                                             |
|  [ DOWNLOAD [4K_UHD // WEBP] ]                              |
+-------------------------------------------------------------+
```

Dual fallback pipeline:
- **Primary**: Cloudflare Edge transformation worker streams pre-converted WebP/PNG/JPG directly.
- **Client Fallback**: High-precision 2D Canvas engine redraws and converts the bitmap client-side if offline.

---

## 🖥️ CLIENT SETUP (GET IT RUNNING ON YOUR RIG)

### Windows
- **Live Video (60FPS)**: Grab [Lively Wallpaper](https://rocksdanister.github.io/lively/) (Free & Open Source, proper kit) or *Wallpaper Engine* on Steam. Drag and drop the downloaded `.mp4` into Lively, hit *Set as Wallpaper*, done.
- **Static 4K**: Right-click downloaded `.png` or `.webp` -> *Set as desktop background*.

### Linux (Hyprland / Sway / Waybar / Wayland)
Hardware-accelerated 60FPS video playback using `mpvpaper`:
```bash
mpvpaper -o "no-audio --loop" '*' ~/Downloads/wallpaper.mp4
```
For static wallpapers:
```bash
swww img ~/Downloads/wallpaper.png
# or feh for X11 wankers:
feh --bg-fill ~/Downloads/wallpaper.png
```

### macOS
Grab [Plash](https://github.com/sindresorhus/Plash) or Aerial Screensaver to render live video backdrops directly onto your macOS desktop.

---

## 🛰️ UPSTREAM LEGENDS (CREDIT WHERE IT'S DUE)

We don't steal work like corporate supes. VOID//WALLS unifies three legendary open-source vaults:

1. **`vrsn001/wallsbyme` (dharmx/walls fork)**: 1,653 verified desktop wallpapers and 60fps live anime loops.
2. **`DenverCoder1/minimalistic-wallpaper-collection`**: 336 clean, distraction-free minimalist vector illustrations and landscapes curated by Jonah Lawrence.
3. **`vyrx-dev/Wallpapers`**: 490 high-density aesthetic themes: Nord dark, Catppuccin, and dedicated 9:16 vertical AMOLED backdrops.

All wallpaper assets remain the property of their respective creators.

---

## 🛠️ LOCAL SETUP (RUN THE BASTARD YOURSELF)

Want to run the frontend locally? Dead simple:

```bash
# Clone the repository
git clone https://github.com/vrsn001/wallsbyme.git
cd wallsbyme/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Run lint and production build:
```bash
# Zero warnings, zero errors (oxlint)
npx oxlint

# Production build
npm run build
```

---

## 📜 LICENSE & ETHICS

- **Frontend Code**: MIT License. Free as in speech.
- **Wallpaper Assets**: Retain their original licenses and attribution to their upstream authors.
- **Telemetry**: Absolute zero. No analytics, no Google trackers, no fingerprinting.

*Now bugger off and enjoy your wallpapers.*
