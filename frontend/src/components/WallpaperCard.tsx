import React, { useState } from 'react';
import { Download, Heart, Maximize2, Play, Film, Smartphone } from 'lucide-react';
import type { Wallpaper } from '../types';
import { getThumbnailUrl } from '../utils/cdn';

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  isFavorite: boolean;
  onToggleFavorite: (wallpaper: Wallpaper) => void;
  onOpenLightbox: (wallpaper: Wallpaper) => void;
  onDownload: (wallpaper: Wallpaper) => void;
  priority?: boolean;
}

export const WallpaperCard: React.FC<WallpaperCardProps> = ({
  wallpaper,
  isFavorite,
  onToggleFavorite,
  onOpenLightbox,
  onDownload,
  priority = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isAnimated = wallpaper.type === 'animated';
  const isVertical = wallpaper.category === 'phone-vertical' || (wallpaper.width && wallpaper.height && wallpaper.height > wallpaper.width * 1.3);

  // Triple-stage CDN pipeline:
  // 1. Cloudflare WebP edge thumbnail (~10 KB) for instant 60FPS grid rendering
  // 2. Fastly raw.githubusercontent.com fallback
  // 3. jsDelivr CDN fallback
  const initialThumb = getThumbnailUrl(wallpaper, isVertical ? 480 : 640);
  const [imgSrc, setImgSrc] = useState(initialThumb);
  const [retryStage, setRetryStage] = useState(0);
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (retryStage === 0 && wallpaper.rawUrl) {
      setRetryStage(1);
      setImgSrc(wallpaper.rawUrl);
    } else if (retryStage <= 1 && wallpaper.cdnUrl) {
      setRetryStage(2);
      setImgSrc(wallpaper.cdnUrl);
    } else {
      setHasError(true);
      setIsLoaded(true);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#060608] border border-white/[0.06] hover:border-white/25 transition-all duration-300 hover:shadow-2xl hover:shadow-black/80 hover:-translate-y-1"
    >
      {/* Media Canvas */}
      <div
        onClick={() => onOpenLightbox(wallpaper)}
        className={`relative w-full cursor-pointer overflow-hidden bg-[#030304] ${
          isVertical ? 'aspect-[9/16]' : 'aspect-[16/10]'
        }`}
      >
        {/* Placeholder skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-white/[0.02] animate-pulse flex items-center justify-center text-[10px] text-neutral-600 font-mono">
            Loading...
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
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                onLoadedData={() => setIsLoaded(true)}
              />
            ) : (
              <div
                className="h-full w-full bg-[#08080c] flex flex-col items-center justify-center p-4 text-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                ref={() => { if (!isLoaded) setIsLoaded(true); }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white shadow-lg transition-transform group-hover:scale-110">
                  <Play className="h-4 w-4 fill-white ml-0.5" />
                </div>
                <span className="mt-2.5 text-[10px] font-medium tracking-wider uppercase text-neutral-400">
                  Hover to play 60FPS
                </span>
              </div>
            )}
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={wallpaper.title}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={handleImageError}
            className={`h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.03] ${
              isLoaded && !hasError ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Error Fallback */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-[#0a0a0f] text-neutral-500 font-mono text-[10px] text-center">
            <span className="text-amber-500/80 mb-1">IMAGE OFFLINE</span>
            <span className="text-neutral-600 truncate max-w-[150px]">{wallpaper.title}</span>
          </div>
        )}

        {/* Ambient Top Shadow Overlay for badges */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 pointer-events-none">
          {isAnimated && (
            <span className="flex items-center gap-1 rounded-full border border-amber-400/30 bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-amber-300">
              <Film className="h-2.5 w-2.5 text-amber-400" />
              Live
            </span>
          )}
          {isVertical && (
            <span className="flex items-center gap-1 rounded-full border border-sky-400/30 bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-sky-300">
              <Smartphone className="h-2.5 w-2.5 text-sky-400" />
              9:16
            </span>
          )}
          <span className="rounded-full border border-white/10 bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-neutral-300 font-mono">
            {wallpaper.format}
          </span>
        </div>

        {/* Top Right Quick Action Buttons */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(wallpaper);
            }}
            className={`flex h-7 w-7 items-center justify-center rounded-full border backdrop-blur-md transition-all ${
              isFavorite
                ? 'border-white bg-white text-black'
                : 'border-white/15 bg-black/60 text-white hover:bg-white hover:text-black hover:border-white'
            }`}
            title={isFavorite ? 'Remove from saved' : 'Save wallpaper'}
          >
            <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-black' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenLightbox(wallpaper);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md hover:bg-white hover:text-black hover:border-white transition-all"
            title="Inspect"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Card Footer Bar */}
      <div className="flex items-center justify-between p-3.5 bg-gradient-to-b from-[#060608] to-[#040405] border-t border-white/[0.04]">
        <div className="min-w-0 pr-2">
          <h3
            onClick={() => onOpenLightbox(wallpaper)}
            className="truncate text-xs font-medium text-neutral-200 group-hover:text-white transition-colors cursor-pointer"
            title={wallpaper.title}
          >
            {wallpaper.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-neutral-500">
            <span className="truncate">{wallpaper.categoryLabel}</span>
            <span className="text-neutral-700">·</span>
            <span className="font-mono text-neutral-400">{wallpaper.resolutionBadge || wallpaper.sizeFormatted}</span>
          </div>
        </div>

        {/* Direct Download Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload(wallpaper);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/15 hover:border-white/20 transition-all shrink-0"
          title="Download full resolution"
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
