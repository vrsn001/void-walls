import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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

  // Preload the next image for instant 60 FPS transitions
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
          className="flex items-center gap-2 rounded-none border border-white/10 bg-black px-4 py-2 text-xs text-neutral-400 hover:text-white hover:border-sky-400 transition-all cursor-pointer"
        >
          <Sparkles className="h-4 w-4 text-sky-400" />
          <span>SHOW FEATURED SHOWCASE</span>
          <ChevronRight className="h-4 w-4 text-neutral-500" />
        </button>
      </div>
    );
  }

  return (
    <section className="relative mx-auto max-w-[1440px] px-4 pt-3 pb-2 sm:px-6 font-mono">
      <div className="relative overflow-hidden rounded-none border border-white/15 bg-[#030305] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Main Visual Stage */}
          <div className="relative lg:col-span-8 bg-black min-h-[340px] lg:min-h-[460px] flex items-center justify-center overflow-hidden group select-none">
            {/* The Wallpaper Image with Hardware-Accelerated 60FPS scaling */}
            <img
              key={current.id}
              src={getThumbnailUrl(current, 1440) || current.rawUrl || current.cdnUrl}
              alt={current.title}
              onClick={() => onOpenLightbox(current)}
              className="h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.01] cursor-pointer"
              style={{ transform: 'translateZ(0)' }}
            />

            {/* Edge Vignette */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />

            {/* Top Badge Strip */}
            <div className="absolute top-3 left-3 flex items-center gap-2 z-10 pointer-events-none">
              <span className="rounded-none border border-sky-400/50 bg-black/85 px-2.5 py-1 text-[10px] font-bold text-sky-300 uppercase tracking-wider">
                FEATURED // 4K UHD
              </span>
              <span className="rounded-none border border-white/20 bg-black/85 px-2.5 py-1 text-[10px] font-bold text-neutral-300 uppercase font-mono">
                {current.resolutionBadge || '4K UHD'}
              </span>
              <span className="hidden sm:inline-flex rounded-none border border-white/15 bg-black/85 px-2 py-1 text-[10px] font-mono text-neutral-400">
                {selectedIndex + 1} / {total}
              </span>
            </div>

            {/* Top Right Inspect Button */}
            <button
              onClick={() => onOpenLightbox(current)}
              className="absolute top-3 right-3 flex items-center gap-1.5 rounded-none border border-white/20 bg-black/80 px-3 py-1.5 text-xs font-bold text-neutral-200 hover:border-sky-400 hover:text-sky-300 transition-all cursor-pointer z-10"
              title="Inspect Fullscreen"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">INSPECT</span>
            </button>

            {/* Back (Previous) Navigation Arrow Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-none border border-white/20 bg-black/80 text-white hover:bg-sky-400 hover:text-black hover:border-sky-300 transition-all cursor-pointer z-20 shadow-xl"
              title="Previous Wallpaper (Back)"
              aria-label="Previous Wallpaper"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Next Navigation Arrow Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-none border border-white/20 bg-black/80 text-white hover:bg-sky-400 hover:text-black hover:border-sky-300 transition-all cursor-pointer z-20 shadow-xl"
              title="Next Wallpaper"
              aria-label="Next Wallpaper"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Bottom Loop Controller Floating Pill */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2.5 rounded-none border border-white/20 bg-black/85 px-3.5 py-1.5 backdrop-blur-md z-20 shadow-2xl">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                title={isPlaying ? 'Pause auto-cycle loop' : 'Resume auto-cycle loop'}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-sky-400" />}
                <span className="text-[11px] font-mono">{isPlaying ? 'PAUSE LOOP' : 'RESUME LOOP'}</span>
              </button>
              <div className="h-3 w-px bg-white/20" />
              <span className="text-[10px] text-neutral-400 font-mono">
                {Math.ceil(((100 - progress) / 100) * (CYCLE_DURATION_MS / 1000))}s
              </span>
            </div>

            {/* Visual Loop Progress Bar */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10 z-10">
              <div
                className="h-full bg-sky-400 transition-all duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Details & Curated Switcher Sidebar */}
          <div className="flex flex-col justify-between lg:col-span-4 p-5 lg:p-6 bg-[#050508] border-t lg:border-t-0 lg:border-l border-white/10">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
                  <Layers className="h-4 w-4" />
                  SPOTLIGHT // {current.categoryLabel}
                </span>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="text-[10px] text-neutral-500 hover:text-neutral-300 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  [MINIMIZE]
                </button>
              </div>

              <h2 className="mt-3 text-lg sm:text-xl font-bold leading-tight text-white uppercase font-sans">
                {current.title}
              </h2>

              <div className="mt-3 space-y-1.5 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>RESOLUTION:</span>
                  <span className="text-white font-bold font-mono">{current.resolution || '3840 × 2160'}</span>
                </div>
                <div className="flex justify-between">
                  <span>FORMAT:</span>
                  <span className="text-white font-bold font-mono">{current.format} ({current.sizeFormatted})</span>
                </div>
                <div className="flex justify-between">
                  <span>AUTO-CYCLE:</span>
                  <span className={`font-bold font-mono ${isPlaying ? 'text-sky-400' : 'text-neutral-500'}`}>
                    {isPlaying ? 'ACTIVE (7s LOOP)' : 'PAUSED'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center gap-2.5">
                <button
                  onClick={() => onDownload(current)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-none bg-sky-400 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-sky-300 transition-all border border-sky-300 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>DOWNLOAD 4K</span>
                </button>

                <button
                  onClick={() => onOpenLightbox(current)}
                  className="flex items-center justify-center gap-2 rounded-none border border-white/20 bg-black px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-200 hover:text-white hover:border-sky-400 transition-all cursor-pointer"
                  title="Inspect Fullscreen"
                >
                  <Eye className="h-4 w-4" />
                  <span>INSPECT</span>
                </button>
              </div>
            </div>

            {/* Quick Thumbnail Strip with Active Indicator */}
            <div className="mt-5 pt-3.5 border-t border-white/10">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                <span>CURATED SELECTIONS ({total})</span>
                <span>TAP TO SWITCH</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {showcaseItems.map((wall, idx) => (
                  <button
                    key={wall.id}
                    onClick={() => {
                      setSelectedIndex(idx);
                      setProgress(0);
                    }}
                    className={`relative aspect-video overflow-hidden rounded-none border transition-all cursor-pointer ${
                      selectedIndex === idx
                        ? 'border-sky-400 ring-1 ring-sky-400 scale-[1.03] shadow-md'
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
