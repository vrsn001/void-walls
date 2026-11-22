import React from 'react';
import { ExternalLink, Film, Smartphone, Layers, ShieldAlert } from 'lucide-react';
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
  onNavigateTab,
}) => {
  return (
    <section className="relative mx-auto max-w-[1440px] px-4 pt-5 pb-2 sm:px-6 font-mono">
      {/* Outer Cyberpunk HUD Container with Razor-Sharp Point Edges */}
      <div className="relative overflow-hidden rounded-none border border-sky-400/30 bg-[#040407] p-4 sm:p-5 shadow-2xl transition-all">
        {/* Subtle Matrix Blueprint Grid Texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(0, 240, 255, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Sci-Fi Status Bar: Butcher vs. Homelander Tension */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5 mb-3.5 text-[11px] font-mono">
          <div className="flex items-center gap-2 text-sky-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-none h-2 w-2 bg-sky-400" />
            </span>
            <span className="font-bold tracking-wider uppercase text-rose-400">BUTCHER // SCORCHED_EARTH: ACTIVE</span>
            <span className="text-neutral-600">//</span>
            <span className="text-neutral-400 tracking-wider uppercase">ZERO_CORPORATE_SLOP</span>
          </div>

          <div className="flex items-center gap-3 text-neutral-400 text-[10px]">
            <span className="hidden sm:inline text-sky-300 font-bold">HOMELANDER // PERFECTION_DEMANDED: 100%</span>
            <span className="hidden sm:inline text-neutral-600">·</span>
            <a
              href="https://github.com/vrsn001/wallsbyme"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-neutral-300 hover:text-sky-300 transition-colors uppercase"
            >
              <GithubIcon className="h-3 w-3" />
              <span>VAULT: vrsn001/wallsbyme</span>
            </a>
            {/* Sci-Fi Diagonal Hazard Stripes */}
            <span className="text-amber-500 font-black tracking-tighter select-none">// // // //</span>
          </div>
        </div>

        {/* Main Banner Row */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Left Column: Stylized Japanese Kanji Box [ 虚 ] */}
          <div className="md:col-span-3 lg:col-span-2 flex justify-center md:justify-start">
            <KanjiVoidBadge size="lg" className="rounded-none border border-white/20" />
          </div>

          {/* Center Column: Typography & Punchy Butcher/Homelander Attitude */}
          <div className="md:col-span-9 lg:col-span-10 flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white font-mono uppercase">
                VOID<span className="text-neutral-600">//</span>WALLS
              </h1>
              <div className="flex items-center gap-1 rounded-none border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-xs font-mono font-bold text-rose-400 tracking-wider">
                <span>[ 虚無 // FUCKING DIABOLICAL ]</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-mono tracking-wider text-neutral-300 uppercase leading-relaxed">
              <span className="text-sky-400 font-bold">"WE CAN DO WHATEVER THE FUCK WE WANT"</span> — PURE 4K/2K/60FPS UNCOMPRESSED ART.{' '}
              <span className="text-neutral-500">NO ADS. NO TRACKERS. NO CORPORATE WANKERS.</span>
            </p>

            {/* Monospace Highlight Strip */}
            <div className="flex flex-wrap items-center gap-2 rounded-none border border-sky-400/30 bg-sky-950/20 px-2.5 py-1 text-[10px] font-mono text-sky-300">
              <span className="font-bold text-sky-400">&gt;</span>
              <span>SCORCHED EARTH</span>
              <span className="text-sky-800">·</span>
              <span>ZERO AI SLOP</span>
              <span className="text-sky-800">·</span>
              <span>GOD-TIER 4K UHD</span>
              <span className="text-sky-800">·</span>
              <span>2K QHD</span>
              <span className="text-sky-800">·</span>
              <span className="text-amber-400 font-bold">16 60FPS LIVE LOOPS</span>
              <span className="text-sky-800">·</span>
              <span>9:16 MOBILE AMOLED</span>
            </div>
          </div>
        </div>

        {/* Interactive Clickable Stat Cards -> Direct Sub-Page Navigation */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-4 mt-4 border-t border-white/10">
          {/* Card 1: Static 4K Vault -> Leads to #static */}
          <button
            type="button"
            onClick={() => onNavigateTab ? onNavigateTab('static') : (window.location.hash = 'static')}
            className="flex flex-col text-left rounded-none border border-white/15 bg-black p-2.5 transition-all hover:border-sky-400 hover:bg-sky-950/20 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider text-neutral-500 group-hover:text-sky-300">
              <span>BUTCHER'S VAULT</span>
              <Layers className="h-3 w-3 text-neutral-600 group-hover:text-sky-400" />
            </div>
            <span className="text-xs sm:text-sm font-mono font-bold text-sky-400 mt-1">
              {totalCount.toLocaleString()}+ ASSETS
            </span>
            <span className="text-[9px] text-neutral-500 font-mono mt-0.5 group-hover:text-neutral-300">
              [ OPEN STATIC 4K → ]
            </span>
          </button>

          {/* Card 2: Live 60FPS Loops -> Leads to #live */}
          <button
            type="button"
            onClick={() => onNavigateTab ? onNavigateTab('live') : (window.location.hash = 'live')}
            className="flex flex-col text-left rounded-none border border-white/15 bg-black p-2.5 transition-all hover:border-amber-400 hover:bg-amber-950/20 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider text-neutral-500 group-hover:text-amber-300">
              <span>LIVE 60FPS LOOPS</span>
              <Film className="h-3 w-3 text-neutral-600 group-hover:text-amber-400" />
            </div>
            <span className="text-xs sm:text-sm font-mono font-bold text-amber-400 mt-1">
              {liveCount} VIDEO LOOPS
            </span>
            <span className="text-[9px] text-neutral-500 font-mono mt-0.5 group-hover:text-neutral-300">
              [ OPEN THEATER → ]
            </span>
          </button>

          {/* Card 3: Mobile 9:16 Vertical -> Leads to #mobile */}
          <button
            type="button"
            onClick={() => onNavigateTab ? onNavigateTab('mobile') : (window.location.hash = 'mobile')}
            className="flex flex-col text-left rounded-none border border-white/15 bg-black p-2.5 transition-all hover:border-sky-400 hover:bg-sky-950/20 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider text-neutral-500 group-hover:text-sky-300">
              <span>MOBILE VERTICAL</span>
              <Smartphone className="h-3 w-3 text-neutral-600 group-hover:text-sky-400" />
            </div>
            <span className="text-xs sm:text-sm font-mono font-bold text-sky-300 mt-1">
              AMOLED 9:16
            </span>
            <span className="text-[9px] text-neutral-500 font-mono mt-0.5 group-hover:text-neutral-300">
              [ OPEN PHONE VAULT → ]
            </span>
          </button>

          {/* Card 4: 54 Collection Vaults -> Leads to #collections */}
          <button
            type="button"
            onClick={() => onNavigateTab ? onNavigateTab('collections') : (window.location.hash = 'collections')}
            className="flex flex-col text-left rounded-none border border-white/15 bg-black p-2.5 transition-all hover:border-rose-400 hover:bg-rose-950/20 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider text-neutral-500 group-hover:text-rose-300">
              <span>THE ARCHIVES</span>
              <ShieldAlert className="h-3 w-3 text-neutral-600 group-hover:text-rose-400" />
            </div>
            <span className="text-xs sm:text-sm font-mono font-bold text-rose-400 mt-1">
              54 VAULT ARCHIVES
            </span>
            <span className="text-[9px] text-neutral-500 font-mono mt-0.5 group-hover:text-neutral-300">
              [ BROWSE ALL → ]
            </span>
          </button>

          {/* Card 5: Live Production Link */}
          <a
            href="https://void-walls.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 sm:col-span-1 flex flex-col justify-between rounded-none border border-sky-400/40 bg-sky-400/10 hover:bg-sky-400/20 p-2.5 text-xs font-mono font-bold text-sky-300 transition-all group"
          >
            <div className="flex items-center justify-between text-[9px] text-sky-400">
              <span>PRODUCTION_NODE</span>
              <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <span className="mt-1 font-bold text-white text-[11px] truncate">
              VOID-WALLS.VERCEL.APP
            </span>
            <span className="text-[9px] text-sky-400 mt-0.5">
              [ SUPREME PERFECTION ]
            </span>
          </a>
        </div>

        {/* Bottom Sci-Fi Metadata Strip (Brutal iteration REMOVED) */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-2.5 border-t border-white/5 text-[9px] font-mono text-neutral-500 uppercase">
          <div>
            CDN: CLOUDFLARE_EDGE / FASTLY / JSDELIVR · RES: 3840×2160 (4K), 2560×1440 (2K), 1920×1080 (FHD), 1080×1920 (PHONE)
          </div>
          <div className="flex items-center gap-2">
            {onOpenCredits && (
              <button
                type="button"
                onClick={onOpenCredits}
                className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors cursor-pointer uppercase font-bold"
              >
                // REPO_CREDITS
              </button>
            )}
            <span className="text-rose-400/90 font-bold">// SCORCHED_EARTH_EDITION</span>
          </div>
        </div>
      </div>
    </section>
  );
};
