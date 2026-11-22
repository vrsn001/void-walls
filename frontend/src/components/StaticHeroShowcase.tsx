import React, { useState } from 'react';
import { Download, Eye, Sparkles, ChevronRight, Layers } from 'lucide-react';
import type { Wallpaper } from '../types';
import { getThumbnailUrl } from '../utils/cdn';

interface StaticHeroShowcaseProps {
  wallpapers: Wallpaper[];
  onOpenLightbox: (wallpaper: Wallpaper) => void;
  onDownload: (wallpaper: Wallpaper) => void;
}

export const StaticHeroShowcase: React.FC<StaticHeroShowcaseProps> = ({
  wallpapers,
  onOpenLightbox,
  onDownload,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Pick top high-res static wallpapers
  const showcaseItems = wallpapers.slice(0, 6);
  const current = showcaseItems[selectedIndex] || showcaseItems[0];

  if (!current) return null;

  if (isCollapsed) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 pt-2 sm:px-6 font-mono">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 rounded-none border border-white/10 bg-black px-3.5 py-1.5 text-xs text-neutral-400 hover:text-white hover:border-sky-400 transition-all"
        >
          <Sparkles className="h-3 w-3 text-sky-400" />
          <span>SHOW_CURATED_STATIC_SHOWCASE</span>
          <ChevronRight className="h-3 w-3 text-neutral-600" />
        </button>
      </div>
    );
  }

  return (
    <section className="relative mx-auto max-w-[1440px] px-4 pt-3 pb-2 sm:px-6 font-mono">
      <div className="relative overflow-hidden rounded-none border border-white/15 bg-[#030305]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Main Visual Stage */}
          <div
            onClick={() => onOpenLightbox(current)}
            className="relative lg:col-span-8 bg-black min-h-[300px] lg:min-h-[420px] flex items-center justify-center overflow-hidden group cursor-pointer"
          >
            <img
              src={getThumbnailUrl(current, 1440) || current.rawUrl || current.cdnUrl}
              alt={current.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            />

            {/* Edge Vignette */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />

            {/* Top Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="rounded-none border border-sky-400/50 bg-black/80 px-2 py-0.5 text-[10px] font-bold text-sky-300 uppercase">
                FEATURED // 4K UHD
              </span>
              <span className="rounded-none border border-white/20 bg-black/80 px-2 py-0.5 text-[10px] font-bold text-neutral-300 uppercase font-mono">
                {current.resolutionBadge || '4K UHD'}
              </span>
            </div>

            {/* Bottom Inspect Pill */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-none border border-white/20 bg-black/80 px-3 py-1.5 text-[10px] font-bold text-neutral-200 group-hover:border-sky-400 group-hover:text-sky-300 transition-all">
              <Eye className="h-3 w-3" />
              <span>INSPECT 4K</span>
            </div>
          </div>

          {/* Details & Switcher Sidebar */}
          <div className="flex flex-col justify-between lg:col-span-4 p-5 bg-[#050508] border-t lg:border-t-0 lg:border-l border-white/10">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-400">
                  <Layers className="h-3 w-3" />
                  SPOTLIGHT // {current.categoryLabel}
                </span>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="text-[10px] text-neutral-500 hover:text-neutral-300 uppercase tracking-wider transition-colors"
                >
                  [MINIMIZE]
                </button>
              </div>

              <h2 className="mt-3 text-lg sm:text-xl font-bold leading-tight text-white uppercase font-sans">
                {current.title}
              </h2>

              <div className="mt-2 space-y-1 text-[11px] text-neutral-400">
                <div className="flex justify-between">
                  <span>RESOLUTION:</span>
                  <span className="text-white font-bold">{current.resolution || '3840 × 2160'}</span>
                </div>
                <div className="flex justify-between">
                  <span>FORMAT:</span>
                  <span className="text-white font-bold">{current.format} ({current.sizeFormatted})</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => onDownload(current)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-none bg-sky-400 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-sky-300 transition-all border border-sky-300"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>DOWNLOAD 4K</span>
                </button>

                <button
                  onClick={() => onOpenLightbox(current)}
                  className="flex items-center justify-center gap-1.5 rounded-none border border-white/20 bg-black px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral-200 hover:text-white hover:border-sky-400 transition-all"
                  title="Inspect Fullscreen"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>INSPECT</span>
                </button>
              </div>
            </div>

            {/* Quick Switcher Carousel */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                CURATED_SELECTIONS
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {showcaseItems.map((wall, idx) => (
                  <button
                    key={wall.id}
                    onClick={() => setSelectedIndex(idx)}
                    className={`relative aspect-video overflow-hidden rounded-none border transition-all ${
                      selectedIndex === idx
                        ? 'border-sky-400 ring-1 ring-sky-400 scale-[1.02]'
                        : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={getThumbnailUrl(wall, 240) || wall.cdnUrl}
                      alt={wall.title}
                      className="h-full w-full object-cover"
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
