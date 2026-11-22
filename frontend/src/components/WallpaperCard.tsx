import React, { useState } from 'react';
import { Download, Heart, Maximize2, Play, Film, Smartphone } from 'lucide-react';
import type { Wallpaper } from '../types';
import PixelCard from './react-bits/PixelCard';

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  isFavorite: boolean;
  onToggleFavorite: (wallpaper: Wallpaper) => void;
  onOpenLightbox: (wallpaper: Wallpaper) => void;
  onDownload: (wallpaper: Wallpaper) => void;
}

export const WallpaperCard: React.FC<WallpaperCardProps> = ({
  wallpaper,
  isFavorite,
  onToggleFavorite,
  onOpenLightbox,
  onDownload,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const isAnimated = wallpaper.type === 'animated';
  const isVertical = wallpaper.category === 'phone-vertical' || (wallpaper.width && wallpaper.height && wallpaper.height > wallpaper.width * 1.3);

  return (
    <PixelCard
      shape="square"
      colors={['#ff5722', '#ff8a50', '#00f0ff', '#1f2738']}
      gap={8}
      speed={22}
      spotlight={0.5}
      glow={0.25}
      glowColor="#ff5722"
      radius={0}
      theme="dark"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col border-2 border-[#232c3f] bg-[#0c0f17] shadow-[3px_3px_0_#000] transition-all duration-100 hover:border-[#ff5722] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_#ff5722]"
    >
      {/* Media Canvas */}
      <div
        onClick={() => onOpenLightbox(wallpaper)}
        className={`relative w-full cursor-pointer overflow-hidden bg-[#06080a] border-b-2 border-[#232c3f] ${
          isVertical ? 'aspect-[9/16]' : 'aspect-[16/10]'
        }`}
      >
        {/* Placeholder skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-[#0e121a] flex items-center justify-center font-[var(--font-mono)] text-[10px] text-[#586888] font-bold uppercase tracking-wider">
            LOADING ASSET...
          </div>
        )}

        {/* Video or Image */}
        {wallpaper.isVideo ? (
          <div className="relative h-full w-full">
            {isHovered ? (
              <video
                src={wallpaper.rawUrl}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
                onLoadedData={() => setIsLoaded(true)}
              />
            ) : (
              <div
                className="h-full w-full bg-[#101420] flex flex-col items-center justify-center p-4 text-center"
                ref={() => { if (!isLoaded) setIsLoaded(true); }}
              >
                <div className="flex h-12 w-12 items-center justify-center border-2 border-[#ff5722] bg-black shadow-[2px_2px_0_#ff5722]">
                  <Play className="h-5 w-5 text-[#ff5722] fill-[#ff5722] ml-0.5" />
                </div>
                <span className="mt-2 font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-wider text-[#cbd5e1]">
                  HOVER TO STREAM 60FPS
                </span>
              </div>
            )}
          </div>
        ) : (
          <img
            src={wallpaper.cdnUrl}
            alt={wallpaper.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            className={`h-full w-full object-cover transition-opacity duration-200 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1 z-10 pointer-events-none">
          {isAnimated && (
            <span className="flex items-center gap-1 border border-[#ff5722] bg-[#ff5722] px-1.5 py-0.2 font-[var(--font-mono)] text-[9px] font-black text-black shadow-[1px_1px_0_#000]">
              <Film className="h-2.5 w-2.5" />
              LIVE
            </span>
          )}
          {isVertical && (
            <span className="flex items-center gap-1 border border-cyan-400 bg-cyan-400 px-1.5 py-0.2 font-[var(--font-mono)] text-[9px] font-black text-black shadow-[1px_1px_0_#000]">
              <Smartphone className="h-2.5 w-2.5" />
              9:16
            </span>
          )}
          <span className="border border-[#232c3f] bg-black/90 px-1.5 py-0.2 font-[var(--font-mono)] text-[9px] font-bold text-white shadow-[1px_1px_0_#000]">
            {wallpaper.format}
          </span>
          {wallpaper.resolutionBadge && (
            <span className="border border-[#232c3f] bg-black/90 px-1.5 py-0.2 font-[var(--font-mono)] text-[9px] font-bold text-[#ff5722] shadow-[1px_1px_0_#000]">
              {wallpaper.resolutionBadge}
            </span>
          )}
        </div>

        {/* Top Right Favorite Button */}
        <div className="absolute top-2 right-2 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(wallpaper);
            }}
            className={`flex h-7 w-7 items-center justify-center border transition-all ${
              isFavorite
                ? 'border-[#ff5722] bg-[#ff5722] text-black shadow-[2px_2px_0_#fff]'
                : 'border-[#232c3f] bg-black/80 text-white hover:border-[#ff5722] hover:text-[#ff5722]'
            }`}
            title={isFavorite ? 'Remove from saved' : 'Save wallpaper'}
          >
            <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-black' : ''}`} />
          </button>
        </div>

        {/* Bottom Quick Action Bar on Hover */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t-2 border-[#232c3f] bg-black/95 px-2.5 py-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 z-10">
          <span className="font-[var(--font-mono)] text-[10px] font-bold text-[#cbd5e1]">
            {wallpaper.sizeFormatted} {wallpaper.width && wallpaper.height ? `· ${wallpaper.width}×${wallpaper.height}` : ''}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload(wallpaper);
              }}
              className="flex h-6 w-6 items-center justify-center border border-[#ff5722] bg-[#ff5722] text-black hover:bg-white transition-colors"
              title="Download file"
            >
              <Download className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenLightbox(wallpaper);
              }}
              className="flex h-6 w-6 items-center justify-center border border-[#232c3f] bg-[#121622] text-white hover:border-white transition-colors"
              title="Inspect"
            >
              <Maximize2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="flex flex-col p-3 bg-[#0c0f17]">
        <h3
          onClick={() => onOpenLightbox(wallpaper)}
          className="cursor-pointer truncate font-[var(--font-display)] text-xs font-bold text-white hover:text-[#ff5722] transition-colors uppercase tracking-wide leading-tight"
          title={wallpaper.title}
        >
          {wallpaper.title}
        </h3>

        <div className="mt-2 flex items-center justify-between gap-1 border-t border-[#1e2536] pt-2 font-[var(--font-mono)] text-[10px]">
          <span className="truncate border border-[#232c3f] bg-[#121622] px-1.5 py-0.2 font-bold uppercase text-[#8391ac]">
            {wallpaper.categoryLabel}
          </span>
          <span className="text-[#ff5722] font-bold shrink-0">
            {wallpaper.resolutionBadge || wallpaper.sizeFormatted}
          </span>
        </div>
      </div>
    </PixelCard>
  );
};
