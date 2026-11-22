import React from 'react';
import { KanjiVoidBadge } from './KanjiVoidBadge';
import { GithubIcon } from './GithubIcon';
import type { SubPageTab } from './SubNavTabs';

interface CyberHudBannerProps {
  totalCount: number;
  liveCount: number;
  onOpenCredits?: () => void;
  onNavigateTab?: (tab: SubPageTab) => void;
}

export const CyberHudBanner: React.FC<CyberHudBannerProps> = ({
  totalCount,
  liveCount,
  onOpenCredits,
}) => {
  return (
    <section className="relative mx-auto max-w-[1440px] px-4 pt-4 pb-1 sm:px-6 font-mono">
      {/* Outer Minimalist Cyber Container with Razor-Sharp Point Edges */}
      <div className="relative overflow-hidden rounded-none border border-white/15 bg-[#030306] p-4 sm:p-5 transition-all">
        {/* Subtle Matrix Blueprint Grid Texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(0, 240, 255, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Status Bar: Clean Telemetry */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5 mb-3 text-[11px] font-mono">
          <div className="flex items-center gap-2 text-sky-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-none h-2 w-2 bg-sky-400" />
            </span>
            <span className="font-bold tracking-wider uppercase text-neutral-200">SYS.ONLINE // PURE 4K · 2K · 60FPS</span>
            <span className="text-neutral-700">//</span>
            <span className="text-neutral-500 tracking-wider uppercase">ZERO BLOAT · ZERO TRACKING</span>
          </div>

          <div className="flex items-center gap-3 text-neutral-400 text-[10px]">
            <a
              href="https://github.com/vrsn001/void-walls"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-neutral-400 hover:text-sky-300 transition-colors uppercase"
            >
              <GithubIcon className="h-3 w-3" />
              <span>VAULT: vrsn001/void-walls</span>
            </a>
            <span className="text-neutral-600 select-none">// // // //</span>
          </div>
        </div>

        {/* Main Banner Row: Refined, Minimal, High-Impact */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-1">
          <div className="flex items-center gap-4">
            {/* Japanese Kanji Box [ 虚 ] */}
            <KanjiVoidBadge size="md" className="rounded-none border border-white/20 shrink-0" />

            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white font-mono uppercase">
                  VOID<span className="text-neutral-600">//</span>WALLS
                </h1>
                <div className="flex items-center gap-1 rounded-none border border-sky-400/30 bg-sky-950/30 px-2 py-0.5 text-[10px] font-mono font-bold text-sky-300 tracking-wider">
                  <span>[ 虚無 // 4K ARCHIVE ]</span>
                </div>
              </div>

              <p className="text-xs font-mono tracking-wide text-neutral-400 uppercase leading-relaxed max-w-2xl">
                Uncompressed high-resolution wallpapers &amp; 60fps loops. Clean art for desktop and mobile.
              </p>
            </div>
          </div>

          {/* Inline Specs & Telemetry Badges */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono self-stretch md:self-auto justify-start md:justify-end">
            <span className="rounded-none border border-white/10 bg-black/60 px-2.5 py-1 text-white font-bold">
              {totalCount.toLocaleString()}+ ASSETS
            </span>
            <span className="rounded-none border border-white/10 bg-black/60 px-2 py-1 text-sky-300">
              4K UHD &amp; 2K
            </span>
            <span className="rounded-none border border-amber-400/30 bg-amber-950/20 px-2 py-1 text-amber-300 font-bold">
              {liveCount} 60FPS LOOPS
            </span>
            <span className="rounded-none border border-white/10 bg-black/60 px-2 py-1 text-neutral-300">
              9:16 AMOLED
            </span>
            <span className="rounded-none border border-white/10 bg-black/60 px-2 py-1 text-neutral-400 hidden sm:inline">
              FASTLY CDN
            </span>
          </div>
        </div>

        {/* Bottom Metadata & Credits Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-3 border-t border-white/5 text-[9px] font-mono text-neutral-500 uppercase">
          <div className="flex items-center gap-2">
            <span>RES: 3840×2160 (4K UHD) · 2560×1440 (2K QHD) · 1080×1920 (MOBILE 9:16)</span>
          </div>
          <div className="flex items-center gap-3">
            {onOpenCredits && (
              <button
                type="button"
                onClick={onOpenCredits}
                className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors cursor-pointer uppercase font-bold"
              >
                // UPSTREAM_ACKNOWLEDGEMENTS
              </button>
            )}
            <span className="text-neutral-600">// v2.4.0</span>
          </div>
        </div>
      </div>
    </section>
  );
};
