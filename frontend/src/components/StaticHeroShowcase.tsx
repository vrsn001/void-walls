import React, { useState, useEffect, useCallback, useRef, useMemo, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Download, Eye, Sparkles, ChevronRight, ChevronLeft, Layers, Play, Pause } from 'lucide-react';
import type { Wallpaper } from '../types';
import { getThumbnailUrl } from '../utils/cdn';

interface StaticHeroShowcaseProps {
  wallpapers: Wallpaper[];
  onOpenLightbox: (wallpaper: Wallpaper) => void;
  onDownload: (wallpaper: Wallpaper) => void;
}

const CYCLE_DURATION_MS = 7000; // 7 seconds per featured loop

export const StaticHeroShowcase: React.FC<StaticHeroShowcaseProps> = ({
  wallpapers,
  onOpenLightbox,
  onDownload,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const progressIntervalRef = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // GSAP ScrollTrigger parallax on the hero image
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const img = imgRef.current;
    if (!section || !img) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        img,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  // Pick top 10 high-res static wallpapers for the showcase loop
  const showcaseItems = useMemo(() => wallpapers.slice(0, 10), [wallpapers]);
  const total = showcaseItems.length;
  const current = showcaseItems[selectedIndex] || showcaseItems[0];

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % (showcaseItems.length || 1));
    setProgress(0);
  }, [showcaseItems.length]);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + (showcaseItems.length || 1)) % (showcaseItems.length || 1));
    setProgress(0);
  }, [showcaseItems.length]);

  // Preload upcoming images in the loop for instant 60 FPS transitions
  useEffect(() => {
    if (total === 0) return;
    const nextIdx = (selectedIndex + 1) % total;
    const nextItem = showcaseItems[nextIdx];
    if (nextItem) {
      const img = new Image();
      img.src = getThumbnailUrl(nextItem, 1440) || nextItem.rawUrl || nextItem.cdnUrl;
    }
  }, [selectedIndex, total, showcaseItems]);

  // 60FPS Smooth Auto-Cycle Timer
  useEffect(() => {
    if (!isPlaying || total <= 1) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const stepMs = 50;
    const stepPct = (stepMs / CYCLE_DURATION_MS) * 100;

    progressIntervalRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + stepPct;
      });
    }, stepMs);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, total, handleNext]);

  if (!current) return null;

  if (isCollapsed) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 pt-2 sm:px-6 font-mono">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-1.5 rounded-none border border-white/10 bg-black px-3 py-1.5 text-xs text-neutral-400 hover:text-white hover:border-sky-400 transition-all cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-sky-400" />
          <span>SHOW FEATURED SHOWCASE</span>
          <ChevronRight className="h-3.5 w-3.5 text-neutral-500" />
        </button>
      </div>
    );
  }

  return (
    <section ref={sectionRef} className="relative mx-auto max-w-[1440px] px-4 pt-3 pb-2 sm:px-6 font-mono">
      {/* Fixed-Height Container: Zero CLS (Shape NEVER changes regardless of wallpaper aspect ratio) */}
      <div className="relative overflow-hidden rounded-none border border-white/15 bg-[#030305] shadow-2xl h-[380px] sm:h-[420px] lg:h-[460px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-full">
          {/* Main Visual Stage (Locked Height) */}
          <div className="relative lg:col-span-8 bg-black h-[220px] sm:h-[260px] lg:h-full flex items-center justify-center overflow-hidden group select-none">
            {/* The Wallpaper Image (strictly object-cover, never stretches parent) */}
            <img
              ref={imgRef}
              key={current.id}
              src={getThumbnailUrl(current, 1440) || current.rawUrl || current.cdnUrl}
              alt={current.title}
              onClick={() => onOpenLightbox(current)}
              className="hero-crossfade h-[120%] w-full object-cover cursor-pointer will-change-transform"
            />

            {/* Edge Vignette */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

            {/* Top Badge Strip */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 pointer-events-none text-[10px]">
              <span className="rounded-none border border-sky-400/50 bg-black/85 px-2 py-0.5 font-bold text-sky-300 uppercase tracking-wider">
                FEATURED // 4K UHD
              </span>
              <span className="rounded-none border border-white/20 bg-black/85 px-2 py-0.5 font-bold text-neutral-300 uppercase font-mono">
                {current.resolutionBadge || '4K UHD'}
              </span>
              <span className="hidden sm:inline-flex rounded-none border border-white/15 bg-black/85 px-1.5 py-0.5 font-mono text-neutral-400">
                {selectedIndex + 1} / {total}
              </span>
            </div>

            {/* Top Right Inspect Button */}
            <button
              onClick={() => onOpenLightbox(current)}
              className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-none border border-white/20 bg-black/80 px-2 py-1 text-[11px] font-bold text-neutral-200 hover:border-sky-400 hover:text-sky-300 transition-all cursor-pointer z-10"
              title="Inspect Fullscreen"
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">INSPECT</span>
            </button>

            {/* Medium-Padded Back (Previous) Navigation Arrow Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-none border border-white/20 bg-black/80 text-white hover:bg-sky-400 hover:text-black hover:border-sky-300 transition-all cursor-pointer z-20 shadow-lg"
              title="Previous Wallpaper"
              aria-label="Previous Wallpaper"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Medium-Padded Next Navigation Arrow Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-none border border-white/20 bg-black/80 text-white hover:bg-sky-400 hover:text-black hover:border-sky-300 transition-all cursor-pointer z-20 shadow-lg"
              title="Next Wallpaper"
              aria-label="Next Wallpaper"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Compact Loop Controller Floating Pill */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-none border border-white/20 bg-black/85 px-2.5 py-1 backdrop-blur-md z-20 shadow-lg text-[10px]">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1 font-bold uppercase tracking-wider text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                title={isPlaying ? 'Pause auto-cycle loop' : 'Resume auto-cycle loop'}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-sky-400" />}
                <span className="font-mono">{isPlaying ? 'PAUSE LOOP' : 'RESUME LOOP'}</span>
              </button>
              <div className="h-2.5 w-px bg-white/20" />
              <span className="text-neutral-400 font-mono">
                {Math.ceil(((100 - progress) / 100) * (CYCLE_DURATION_MS / 1000))}s
              </span>
            </div>

            {/* Visual Loop Progress Bar */}
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/10 z-10">
              <div
                className="h-full bg-sky-400 transition-all duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Details & Curated Switcher Sidebar (Fixed Height matching Stage) */}
          <div className="flex flex-col justify-between lg:col-span-4 p-4 sm:p-5 bg-[#050508] border-t lg:border-t-0 lg:border-l border-white/10 h-[160px] sm:h-[160px] lg:h-full overflow-hidden">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-400">
                  <Layers className="h-3.5 w-3.5" />
                  SPOTLIGHT // {current.categoryLabel}
                </span>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="text-[10px] text-neutral-500 hover:text-neutral-300 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  [MINIMIZE]
                </button>
              </div>

              {/* Title locked to fixed 2-line height: Prevents ANY layout expansion */}
              <h2 className="mt-2 text-sm sm:text-base font-bold leading-snug text-white uppercase font-sans line-clamp-2 h-10 flex items-center">
                {current.title}
              </h2>

              <div className="mt-2 space-y-1 text-[11px] text-neutral-400">
                <div className="flex justify-between">
                  <span>RES:</span>
                  <span className="text-white font-bold font-mono">{current.resolution || '3840 × 2160'}</span>
                </div>
                <div className="flex justify-between">
                  <span>FORMAT:</span>
                  <span className="text-white font-bold font-mono">{current.format} ({current.sizeFormatted})</span>
                </div>
                <div className="flex justify-between">
                  <span>LOOP:</span>
                  <span className={`font-bold font-mono ${isPlaying ? 'text-sky-400' : 'text-neutral-500'}`}>
                    {isPlaying ? 'ACTIVE (7s)' : 'PAUSED'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Sleek, Medium-Padded */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => onDownload(current)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-none bg-sky-400 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-sky-300 transition-all border border-sky-300 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>DOWNLOAD 4K</span>
                </button>

                <button
                  onClick={() => onOpenLightbox(current)}
                  className="flex items-center justify-center gap-1.5 rounded-none border border-white/20 bg-black px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-200 hover:text-white hover:border-sky-400 transition-all cursor-pointer"
                  title="Inspect Fullscreen"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>INSPECT</span>
                </button>
              </div>
            </div>

            {/* Quick Thumbnail Strip with Active Indicator */}
            <div className="mt-3 pt-2.5 border-t border-white/10 hidden sm:block">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                <span>CURATED SELECTIONS ({total})</span>
                <span>TAP TO SWITCH</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {showcaseItems.map((wall, idx) => (
                  <button
                    key={wall.id}
                    onClick={() => {
                      setSelectedIndex(idx);
                      setProgress(0);
                    }}
                    className={`relative aspect-video overflow-hidden rounded-none border transition-all cursor-pointer ${
                      selectedIndex === idx
                        ? 'border-sky-400 ring-1 ring-sky-400 scale-[1.02]'
                        : 'border-white/10 opacity-55 hover:opacity-100 hover:border-white/30'
                    }`}
                    title={wall.title}
                  >
                    <img
                      src={getThumbnailUrl(wall, 240) || wall.cdnUrl}
                      alt={wall.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
