# 壁 WALLSBYME — Pixiv-Style Wallpaper & Live Animation Archive

> A fast, dark-aesthetic curation portal and download engine for **1,650+ handpicked Ultra-HD & animated wallpapers** from [`vrsn001/wallsbyme`](https://github.com/vrsn001/wallsbyme).

🚀 **Live Production Deployment**: [https://wallsbyme-frontend.vercel.app](https://wallsbyme-frontend.vercel.app)

---

## ✨ Features

- **🎬 Live Video & Animated Wallpaper Support**:
  - Direct loop playback for MP4 live backgrounds (Bocchi the Rock, Totoro, Berserk, Yor Forger, etc.).
  - Autoplay on hover with audio mute control and full-screen player.
- **🖼️ Pixiv-Inspired Deep Inspection Stage**:
  - Full-resolution preview modal with keyboard navigation (`←` / `→` arrow keys, `D` to download, `F` to favorite, `Esc` to close).
  - Technical metadata drawer: direct GitHub file link, exact size, file type, format badges.
  - "More from this collection" related wallpapers strip.
- **⚡ Instant 1-Click Downloads**:
  - Direct file download with celebratory particle effects.
  - Raw CDN and Markdown embed code copy buttons.
- **🏷️ 52 Categorized Collections**:
  - Anime & Manga, Nord, Gruvbox, Cyberpunk / Outrun, Minimal, Nature, Architecture, Flowers, Monochrome, Mountains, and more.
- **🔍 Instant Zero-Lag Search & Sorting**:
  - Filter by media type: *All*, *Live / Animated Only*, *Static HQ*, or *Saved Favorites*.
  - Sort by *Featured*, *Largest File / 4K*, *Lightweight*, or *Title A-Z*.
  - Instant client-side search across 1,650+ titles, tags, and categories.
- **❤️ Local Storage Collection**:
  - Bookmark your favorite wallpapers directly in your browser without requiring an account.
- **💻 Multi-Platform Desktop Wallpaper Setup Guide**:
  - Built-in instructions for **Windows** (Lively Wallpaper & Wallpaper Engine), **macOS** (Plash / Aerial), and **Linux** (mpvpaper / swww / feh).

---

## 🛠️ Local Development

### 1. Run Dev Server
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Build for Production
```bash
npm run build
npm run preview
```

---

## 🌐 Custom Domain on Vercel

The website is already linked to your Vercel project `wallsbyme-frontend`. To attach your own custom domain (e.g. `walls.yourdomain.com` or `wallpapers.me`):

1. Go to your [Vercel Project Dashboard](https://vercel.com/laksh-rohillas-projects/wallsbyme-frontend/settings/domains).
2. Enter your custom domain name and click **Add**.
3. Add the recommended DNS record to your domain registrar (Cloudflare, Namecheap, GoDaddy, etc.):
   - For apex domain (`yourdomain.com`): `A` record pointing to `76.76.21.21`
   - For subdomain (`walls.yourdomain.com`): `CNAME` record pointing to `cname.vercel-dns.com`
4. Vercel will automatically provision a free SSL certificate.

---

## 📂 Source Wallpaper Repository

All raw wallpaper assets are streamed directly from:  
[https://github.com/vrsn001/wallsbyme](https://github.com/vrsn001/wallsbyme)
