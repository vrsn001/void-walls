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
      className="group relative flex flex-col rounded-none overflow-hidden bg-[#050507] border border-white/10 hover:border-sky-400/60 transition-all duration-200 hover:shadow-2xl hover:shadow-black"
    >
      {/* Media Canvas */}
      <div
        onClick={() => onOpenLightbox(wallpaper)}
        className={`relative w-full cursor-pointer overflow-hidden bg-black ${
          isVertical ? 'aspect-[9/16]' : 'aspect-[16/10]'
        }`}
      >
        {/* Placeholder skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-white/[0.02] animate-pulse flex items-center justify-center text-[10px] text-neutral-600 font-mono">
            FETCHING...
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
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                onLoadedData={() => setIsLoaded(true)}
              />
            ) : (
              <div
                className="h-full w-full bg-[#08080c] flex flex-col items-center justify-center p-4 text-center transition-transform duration-300 group-hover:scale-[1.01]"
                ref={() => { if (!isLoaded) setIsLoaded(true); }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-none border border-amber-400/50 bg-amber-400/10 text-amber-300 shadow-lg">
                  <Play className="h-4 w-4 fill-amber-300 ml-0.5" />
                </div>
                <span className="mt-2.5 text-[9px] font-mono font-bold tracking-wider uppercase text-neutral-400">
                  HOVER // 60FPS
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
            className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-[1.02] ${
              isLoaded && !hasError ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Error Fallback */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-[#0a0a0f] text-neutral-500 font-mono text-[10px] text-center">
            <span className="text-amber-500/80 mb-1 font-bold">ASSET_OFFLINE</span>
            <span className="text-neutral-600 truncate max-w-[150px]">{wallpaper.title}</span>
          </div>
        )}

        {/* Ambient Top Shadow Overlay for badges */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/80 to-transparent" />

        {/* Top Badges (Sharp Brutalist Point Geometry) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 pointer-events-none font-mono">
          {isAnimated && (
            <span className="flex items-center gap-1 rounded-none border border-amber-400/50 bg-black/85 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
              <Film className="h-3 w-3 text-amber-400" />
              60FPS
            </span>
          )}
          {isVertical && (
            <span className="flex items-center gap-1 rounded-none border border-sky-400/50 bg-black/85 px-2 py-0.5 text-[10px] font-bold text-sky-300 uppercase">
              <Smartphone className="h-3 w-3 text-sky-400" />
              9:16
            </span>
          )}
          <span className="rounded-none border border-white/20 bg-black/85 px-2 py-0.5 text-[10px] font-bold text-neutral-300 uppercase">
            {wallpaper.format}
          </span>
        </div>

        {/* Top Right Quick Action Buttons */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(wallpaper);
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-none border transition-all cursor-pointer ${
              isFavorite
                ? 'border-rose-500 bg-rose-500 text-black'
                : 'border-white/20 bg-black/85 text-white hover:bg-white hover:text-black hover:border-white'
            }`}
            title={isFavorite ? 'Remove from saved' : 'Save wallpaper'}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenLightbox(wallpaper);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-none border border-white/20 bg-black/85 text-white hover:bg-white hover:text-black hover:border-white transition-all cursor-pointer"
            title="Inspect"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Card Footer Bar */}
      <div className="flex items-center justify-between p-3 bg-black border-t border-white/10 font-mono">
        <div className="min-w-0 pr-2">
          <h3
            onClick={() => onOpenLightbox(wallpaper)}
            className="truncate text-[11px] font-bold text-neutral-200 group-hover:text-sky-300 transition-colors cursor-pointer uppercase tracking-tight"
            title={wallpaper.title}
          >
            {wallpaper.title}
          </h3>
          <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-neutral-500">
            <span className="truncate">{wallpaper.categoryLabel}</span>
            <span className="text-neutral-700">/</span>
            <span className="text-neutral-400 font-bold">{wallpaper.resolutionBadge || wallpaper.sizeFormatted}</span>
          </div>
        </div>

        {/* Direct Download Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload(wallpaper);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-none border border-white/20 bg-black text-neutral-400 hover:text-white hover:bg-sky-400 hover:text-black hover:border-sky-300 transition-all shrink-0 cursor-pointer"
          title="Download full resolution"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
