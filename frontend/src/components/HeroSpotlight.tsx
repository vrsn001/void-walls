import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Download, Maximize2, ChevronRight, ChevronLeft, Volume2, VolumeX, Eye, Sparkles } from 'lucide-react';
import type { Wallpaper } from '../types';
import Dither from './react-bits/Dither';
import { getThumbnailUrl } from '../utils/cdn';

interface HeroSpotlightProps {
  animatedWallpapers: Wallpaper[];
  onOpenLightbox: (wallpaper: Wallpaper) => void;
  onDownload: (wallpaper: Wallpaper) => void;
}

export const HeroSpotlight: React.FC<HeroSpotlightProps> = ({
  animatedWallpapers,
  onOpenLightbox,
  onDownload,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const total = animatedWallpapers.length;
  const current = animatedWallpapers[selectedIndex] || animatedWallpapers[0];

  const handleNext = useCallback(() => {
    if (total === 0) return;
    setSelectedIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total === 0) return;
    setSelectedIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, selectedIndex]);

  if (!current) return null;

  if (isCollapsed) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 pt-3 sm:px-6">
        <button
          onClick={() => setIsCollapsed(false)}
          className="group flex items-center gap-2 rounded-none border border-white/10 bg-black/60 px-4 py-2 text-xs text-neutral-400 hover:text-white hover:border-sky-400/50 transition-all font-mono cursor-pointer"
        >
          <Sparkles className="h-4 w-4 text-sky-400 group-hover:rotate-12 transition-transform" />
          <span>SHOW FEATURED CINEMA STAGE</span>
          <ChevronRight className="h-4 w-4 text-neutral-500" />
        </button>
      </div>
    );
  }

  return (
    <section className="relative mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 font-mono">
      {/* Ambient Dither Dust Background */}
      <div className="pointer-events-none absolute inset-x-4 top-4 bottom-0 z-0 overflow-hidden rounded-none opacity-10">
        <Dither
          waveSpeed={0.015}
          waveFrequency={2}
          waveAmplitude={0.15}
          waveColor="#ffffff"
          backgroundColor="#000000"
          ditherMode="bayer"
          pixelSize={3}
          enableMouseInteraction={false}
          className="h-full w-full"
        />
      </div>

      {/* Main Cinema Card */}
      <div className="relative z-10 overflow-hidden rounded-none border border-white/15 bg-black transition-all shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Cinema Theater Stage */}
          <div className="relative lg:col-span-8 bg-black min-h-[340px] lg:min-h-[460px] flex items-center justify-center overflow-hidden group select-none">
            {current.isVideo ? (
              <video
                ref={videoRef}
                key={current.id}
                src={current.rawUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
              />
            ) : (
              <img
                src={getThumbnailUrl(current, 1440) || current.rawUrl || current.cdnUrl}
                alt={current.title}
                className="h-full w-full object-cover"
              />
            )}

            {/* Edge Vignette overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />

            {/* Back (Previous) Navigation Button */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-none border border-white/20 bg-black/80 text-white hover:bg-sky-400 hover:text-black hover:border-sky-300 transition-all cursor-pointer z-20 shadow-xl"
              title="Previous Video Loop (Back)"
              aria-label="Previous Video Loop"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Next Navigation Button */}
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-none border border-white/20 bg-black/80 text-white hover:bg-sky-400 hover:text-black hover:border-sky-300 transition-all cursor-pointer z-20 shadow-xl"
              title="Next Video Loop"
              aria-label="Next Video Loop"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Floating Playback Pill */}
            {current.isVideo && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-none border border-white/20 bg-black/85 px-4 py-2 backdrop-blur-xl shadow-2xl z-20">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white hover:text-sky-300 transition-colors cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                </button>
                <div className="h-3.5 w-px bg-white/20" />
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white hover:text-sky-300 transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <div className="h-3.5 w-px bg-white/20" />
                <span className="text-[11px] font-bold text-neutral-300 tracking-wider font-mono">
                  60FPS · {current.sizeFormatted}
                </span>
                <button
                  onClick={() => onOpenLightbox(current)}
                  className="text-white/70 hover:text-white transition-colors ml-1 cursor-pointer"
                  title="Fullscreen Cinema"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Editorial Info & Controls */}
          <div className="flex flex-col justify-between lg:col-span-4 p-5 lg:p-6 bg-[#040406] border-t lg:border-t-0 lg:border-l border-white/10">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="inline-flex items-center gap-2 rounded-none border border-sky-500/40 bg-sky-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-300">
                  <span className="h-2 w-2 rounded-none bg-sky-400 animate-pulse" />
                  CINEMA THEATER // 60FPS LOOPS
                </span>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="text-[10px] text-neutral-500 hover:text-neutral-300 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  [MINIMIZE]
                </button>
              </div>

              <h2 className="mt-3 text-xl lg:text-2xl font-bold leading-snug tracking-tight text-white uppercase font-sans">
                {current.title}
              </h2>

              <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                Featured in <span className="text-white font-bold">{current.categoryLabel}</span>. Curated high frame-rate motion wallpaper.
              </p>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {current.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-none border border-white/10 bg-black px-2 py-0.5 text-[10px] text-neutral-400 font-mono"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center gap-2.5">
                <button
                  onClick={() => onDownload(current)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-none bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-neutral-200 transition-all border border-white cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>DOWNLOAD LOOP</span>
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

            {/* Quick Switcher Carousel */}
            <div className="mt-5 pt-4 border-t border-white/10">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                MORE ANIMATED LOOPS ({total})
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {animatedWallpapers.slice(0, 10).map((wall, idx) => (
                  <button
                    key={wall.id}
                    onClick={() => setSelectedIndex(idx)}
                    className={`relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-none border transition-all cursor-pointer ${
                      selectedIndex === idx
                        ? 'border-sky-400 ring-1 ring-sky-400 scale-[1.03]'
                        : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                    }`}
                  >
                    {wall.isVideo ? (
                      <div className="h-full w-full bg-[#101014] flex items-center justify-center">
                        <Play className="h-3.5 w-3.5 text-sky-400 fill-sky-400" />
                      </div>
                    ) : (
                      <img src={wall.cdnUrl} alt={wall.title} className="h-full w-full object-cover" />
                    )}
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
