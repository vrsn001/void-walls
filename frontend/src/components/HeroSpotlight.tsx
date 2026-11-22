import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Maximize2, ChevronRight, Volume2, VolumeX, Eye, Sparkles } from 'lucide-react';
import type { Wallpaper } from '../types';
import Dither from './react-bits/Dither';

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

  const current = animatedWallpapers[selectedIndex] || animatedWallpapers[0];

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }
  }, [selectedIndex, isPlaying]);

  if (!current) return null;

  if (isCollapsed) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 pt-3 sm:px-6">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-1.5 text-xs text-neutral-400 hover:text-white hover:border-white/20 transition-all"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Show Featured Cinema Stage</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <section className="relative mx-auto max-w-[1440px] px-4 pt-4 sm:px-6">
      {/* Ambient Dither Dust Background */}
      <div className="pointer-events-none absolute inset-x-4 top-4 bottom-0 z-0 overflow-hidden rounded-3xl opacity-10">
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
      <div className="relative z-10 overflow-hidden rounded-3xl border border-white/[0.07] bg-[#030304] transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Cinema Theater Stage */}
          <div className="relative lg:col-span-8 bg-black min-h-[320px] lg:min-h-[460px] flex items-center justify-center overflow-hidden group">
            {current.isVideo ? (
              <video
                ref={videoRef}
                key={current.id}
                src={current.rawUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
              />
            ) : (
              <img src={current.cdnUrl} alt={current.title} className="h-full w-full object-cover" />
            )}

            {/* Edge Vignette overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

            {/* Floating Glass Playback Pill */}
            {current.isVideo && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-full border border-white/10 bg-black/60 px-4 py-2 backdrop-blur-xl shadow-2xl transition-all">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white/80 hover:text-white transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <div className="h-3.5 w-px bg-white/15" />
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white/80 hover:text-white transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <div className="h-3.5 w-px bg-white/15" />
                <span className="text-[11px] font-medium text-neutral-300 tracking-wide font-mono">
                  60 FPS · {current.sizeFormatted}
                </span>
                <button
                  onClick={() => onOpenLightbox(current)}
                  className="text-white/60 hover:text-white transition-colors ml-1"
                  title="Fullscreen Cinema"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Editorial Info & Controls */}
          <div className="flex flex-col justify-between lg:col-span-4 p-6 lg:p-8 bg-gradient-to-b from-[#070709] to-[#040405] border-t lg:border-t-0 lg:border-l border-white/[0.06]">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-neutral-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cinema Spotlight
                </span>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>

              <h2 className="mt-4 text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl">
                {current.title}
              </h2>

              <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                Featured in <span className="text-white font-medium">{current.categoryLabel}</span>. Ultra-high-bitrate loopable desktop backdrop.
              </p>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {current.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] text-neutral-400"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => onDownload(current)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-neutral-200 active:scale-[0.98] transition-all shadow-md shadow-white/5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => onOpenLightbox(current)}
                  className="flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all"
                  title="Inspect Fullscreen"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Inspect</span>
                </button>
              </div>
            </div>

            {/* Quick Switcher Carousel */}
            <div className="mt-6 pt-5 border-t border-white/[0.06]">
              <span className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-2.5">
                More Animated Loops
              </span>
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {animatedWallpapers.slice(0, 8).map((wall, idx) => (
                  <button
                    key={wall.id}
                    onClick={() => setSelectedIndex(idx)}
                    className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-xl border transition-all duration-200 ${
                      selectedIndex === idx
                        ? 'border-white ring-2 ring-white/20 scale-[1.02]'
                        : 'border-white/10 opacity-50 hover:opacity-100 hover:border-white/30'
                    }`}
                  >
                    {wall.isVideo ? (
                      <div className="h-full w-full bg-[#101014] flex items-center justify-center">
                        <Play className="h-3.5 w-3.5 text-white fill-white" />
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
