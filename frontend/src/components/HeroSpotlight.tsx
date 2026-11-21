import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Maximize2, ChevronRight, Volume2, VolumeX, Eye, Flame } from 'lucide-react';
import type { Wallpaper } from '../types';

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
          className="flex items-center gap-2 border-2 border-[#232c3f] bg-[#0c0f17] px-4 py-2 font-[var(--font-mono)] text-xs font-bold uppercase tracking-wider text-[#8391ac] hover:border-[#ff5722] hover:text-white transition-all shadow-[2px_2px_0_#000]"
        >
          <Flame className="h-3.5 w-3.5 text-[#ff5722]" />
          <span>Show Featured Live Wallpaper Spotlight</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-6">
      <div className="border-2 border-[#232c3f] bg-[#0b0e15] shadow-[6px_6px_0_#000]">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Main Media Preview Canvas */}
          <div className="relative lg:col-span-8 bg-black min-h-[300px] lg:min-h-[440px] flex items-center justify-center overflow-hidden border-b-2 lg:border-b-0 lg:border-r-2 border-[#232c3f]">
            {current.isVideo ? (
              <video
                ref={videoRef}
                key={current.id}
                src={current.rawUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <img src={current.cdnUrl} alt={current.title} className="h-full w-full object-cover" />
            )}

            {/* Video Controls Bar */}
            {current.isVideo && (
              <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 border-t-2 border-[#232c3f] bg-[#080a0f]/95 px-3 py-1.5 backdrop-blur-sm">
                <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-[#ff5722] transition-colors">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <div className="h-3.5 w-px bg-[#232c3f]" />
                <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-[#ff5722] transition-colors">
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-[#8391ac]">
                  LIVE STREAM · 60FPS
                </span>
                <span className="ml-auto font-[var(--font-mono)] text-[10px] text-[#ff5722] font-bold">
                  {current.format} · {current.sizeFormatted}
                </span>
              </div>
            )}

            {/* Inspect fullscreen icon */}
            <button
              onClick={() => onOpenLightbox(current)}
              className="absolute top-3 right-3 border-2 border-[#232c3f] bg-black/80 p-2 text-white hover:border-[#ff5722] transition-colors shadow-[2px_2px_0_#000]"
              title="Inspect Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Right Info & Actions Panel */}
          <div className="flex flex-col justify-between lg:col-span-4 p-5 lg:p-6 bg-[#0c0f17]">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-[var(--font-mono)] text-[11px] font-bold uppercase tracking-widest text-[#ff5722] flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 fill-[#ff5722]" />
                  <span>SPOTLIGHT #{selectedIndex + 1}</span>
                </span>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="font-[var(--font-mono)] text-[10px] text-[#8391ac] hover:text-white uppercase"
                >
                  HIDE [X]
                </button>
              </div>

              <h2 className="mt-3 font-[var(--font-display)] text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
                {current.title}
              </h2>

              <p className="mt-2 font-[var(--font-mono)] text-xs text-[#8391ac] leading-relaxed">
                Collection: <span className="text-white font-bold">{current.categoryLabel}</span> · Loopable high-bitrate video wallpaper for desktop.
              </p>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {current.tags.map((t) => (
                  <span
                    key={t}
                    className="border border-[#232c3f] bg-[#10141f] px-2 py-0.5 font-[var(--font-mono)] text-[10px] uppercase text-[#cbd5e1]"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  onClick={() => onDownload(current)}
                  className="flex items-center justify-center gap-2 border-2 border-[#ff5722] bg-[#ff5722] px-5 py-3 font-[var(--font-mono)] text-xs font-black text-black uppercase tracking-wider shadow-[4px_4px_0_#000] hover:bg-[#ff6e3d] active:translate-x-[2px] active:translate-y-[2px] transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>DOWNLOAD ({current.sizeFormatted})</span>
                </button>

                <button
                  onClick={() => onOpenLightbox(current)}
                  className="flex items-center justify-center gap-2 border-2 border-[#232c3f] bg-[#121622] px-5 py-2.5 font-[var(--font-mono)] text-xs font-bold text-white uppercase tracking-wider shadow-[2px_2px_0_#000] hover:border-[#ff5722] transition-colors"
                >
                  <Eye className="h-4 w-4 text-[#ff5722]" />
                  <span>INSPECT FULL RES</span>
                </button>
              </div>
            </div>

            {/* Quick Switcher Carousel */}
            <div className="mt-6 border-t-2 border-[#232c3f] pt-4">
              <span className="block font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-[#8391ac] mb-2 font-bold">
                MORE ANIMATED WALLPAPERS
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {animatedWallpapers.slice(0, 7).map((wall, idx) => (
                  <button
                    key={wall.id}
                    onClick={() => setSelectedIndex(idx)}
                    className={`relative h-12 w-20 flex-shrink-0 overflow-hidden border-2 transition-all ${
                      selectedIndex === idx
                        ? 'border-[#ff5722] shadow-[2px_2px_0_#ff5722]'
                        : 'border-[#232c3f] opacity-50 hover:opacity-100'
                    }`}
                  >
                    {wall.isVideo ? (
                      <div className="h-full w-full bg-[#161c28] flex items-center justify-center">
                        <Play className="h-3 w-3 text-white fill-white" />
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
