import React from 'react';
import { ExternalLink } from 'lucide-react';
import { KanjiVoidBadge } from './KanjiVoidBadge';
import { GithubIcon } from './GithubIcon';

interface CyberHudBannerProps {
  totalCount: number;
  liveCount: number;
  onOpenCredits?: () => void;
}

export const CyberHudBanner: React.FC<CyberHudBannerProps> = ({
  totalCount,
  liveCount,
  onOpenCredits,
}) => {
  return (
    <section className="relative mx-auto max-w-[1440px] px-4 pt-6 pb-2 sm:px-6">
      {/* Outer Cyberpunk HUD Container */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#05060a] p-4 sm:p-6 shadow-2xl transition-all duration-300">
        {/* Subtle Matrix Blueprint Grid Texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(0, 240, 255, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Sci-Fi HUD Status Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3 mb-4 text-[11px] font-mono">
          <div className="flex items-center gap-2 text-cyan-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="font-semibold tracking-wider">SYSTEM: OPERATIONAL</span>
            <span className="text-neutral-600">//</span>
            <span className="text-neutral-400 tracking-wider">REPO_SYNC: LOCKED</span>
          </div>

          <div className="flex items-center gap-3 text-neutral-400">
            <span className="hidden sm:inline">LATENCY: 0.12ms</span>
            <span className="hidden sm:inline text-neutral-600">·</span>
            <a
              href="https://github.com/vrsn001/wallsbyme"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-neutral-300 hover:text-cyan-400 transition-colors"
            >
              <GithubIcon className="h-3 w-3" />
              <span>REPO: vrsn001/wallsbyme</span>
            </a>
            {/* Sci-Fi Diagonal Hazard Stripes */}
            <span className="text-amber-500/80 font-black tracking-tighter select-none">// // // //</span>
          </div>
        </div>

        {/* Main Banner Row */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Column: Stylized Japanese Kanji Box [ 虚 ] */}
          <div className="md:col-span-3 lg:col-span-2 flex justify-center md:justify-start">
            <KanjiVoidBadge size="lg" className="rounded-xl" />
          </div>

          {/* Center Column: Typography & Tech Chips */}
          <div className="md:col-span-9 lg:col-span-10 flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white font-mono">
                VOID<span className="text-neutral-500">//</span>WALLS
              </h1>
              <div className="flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-mono font-bold text-amber-400 tracking-wider">
                <span>[ 虚無 ]</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-mono tracking-wider text-neutral-400">
              CURATED UNDERGROUND WALLPAPER ARCHIVE <span className="text-neutral-600">//</span>{' '}
              <span className="text-white font-semibold">{totalCount.toLocaleString()}+ ASSETS</span>
            </p>

            {/* Cyan Monospace Highlight Strip */}
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-cyan-500/25 bg-cyan-950/20 px-3 py-1.5 text-[11px] font-mono text-cyan-300">
              <span className="font-bold text-cyan-400">&gt;</span>
              <span>HIGH DENSITY</span>
              <span className="text-cyan-800">·</span>
              <span>ZERO AI-SLOP</span>
              <span className="text-cyan-800">·</span>
              <span>4K UHD</span>
              <span className="text-cyan-800">·</span>
              <span>2K QHD</span>
              <span className="text-cyan-800">·</span>
              <span className="text-amber-400 font-semibold">60FPS LIVE LOOPS</span>
              <span className="text-cyan-800">·</span>
              <span>9:16 MOBILE AMOLED</span>
            </div>
          </div>
        </div>

        {/* Stat Boxes Row */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-5 mt-5 border-t border-white/[0.08]">
          {/* Stat 1: Total Assets */}
          <div className="flex flex-col rounded-xl border border-white/[0.08] bg-black/40 p-2.5 transition-all hover:border-amber-500/40">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              TOTAL ASSETS
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-amber-400 mt-0.5">
              {totalCount.toLocaleString()}+ VAULT
            </span>
          </div>

          {/* Stat 2: Live Frontend */}
          <div className="flex flex-col rounded-xl border border-white/[0.08] bg-black/40 p-2.5 transition-all hover:border-cyan-500/40">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              LIVE FRONTEND
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-cyan-400 mt-0.5">
              VERCEL DEPLOYED
            </span>
          </div>

          {/* Stat 3: Live Loops */}
          <div className="flex flex-col rounded-xl border border-white/[0.08] bg-black/40 p-2.5 transition-all hover:border-amber-500/40">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              LIVE LOOPS
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-neutral-200 mt-0.5">
              {liveCount} 60FPS MP4
            </span>
          </div>

          {/* Stat 4: Mobile Vertical */}
          <div className="flex flex-col rounded-xl border border-white/[0.08] bg-black/40 p-2.5 transition-all hover:border-cyan-500/40">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              MOBILE 9:16
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-cyan-300 mt-0.5">
              AMOLED VERTICAL
            </span>
          </div>

          {/* Action Button: Production Domain */}
          <a
            href="https://void-walls.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-2 text-xs font-mono font-bold text-cyan-300 transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)] group"
          >
            <span>VOID-WALLS.VERCEL.APP</span>
            <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Bottom Sci-Fi Metadata Strip */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-white/[0.05] text-[10px] font-mono text-neutral-500">
          <div>
            CDN: JSDELIVR / GITHUB · RESOLUTIONS: 3840×2160 (4K), 2560×1440 (2K), 1920×1080 (FHD),
            1080×1920 (PHONE)
          </div>
          <div className="flex items-center gap-2">
            {onOpenCredits && (
              <button
                type="button"
                onClick={onOpenCredits}
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors cursor-pointer"
              >
                // REPO_CREDITS
              </button>
            )}
            <span className="text-amber-500/70 font-semibold">// MATRIX_CYBER_EDITION</span>
          </div>
        </div>
      </div>
    </section>
  );
};
