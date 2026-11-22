"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Heart, Film, Smartphone, Maximize2 } from "lucide-react";
import type { Wallpaper } from "@/lib/types";
import { getThumbnailUrl, getBlurPlaceholderUrl } from "@/lib/cdn";

interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  favorites: Set<string>;
  onToggleFavorite: (w: Wallpaper) => void;
  onDownload: (w: Wallpaper) => void;
  onPreview: (w: Wallpaper) => void;
}

function WallpaperCard({
  wallpaper,
  index,
  isFavorite,
  onToggleFavorite,
  onDownload,
  onPreview,
}: {
  wallpaper: Wallpaper;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onDownload: () => void;
  onPreview: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const thumbUrl = getThumbnailUrl(wallpaper, 480);
  const blurUrl = getBlurPlaceholderUrl(wallpaper);

  const isVertical =
    wallpaper.category === "phone-vertical" ||
    (wallpaper.width && wallpaper.height && wallpaper.height > wallpaper.width * 1.3);
  const isAnimated = wallpaper.type === "animated";

  return (
    <div
      className={`wall-card scroll-reveal group relative flex flex-col bg-surface border border-border overflow-hidden cursor-pointer ${
        index < 12 ? "revealed" : ""
      }`}
      onClick={onPreview}
    >
      {/* Thumbnail */}
      <div className={`relative overflow-hidden bg-black ${isVertical ? "aspect-[9/16] max-h-[360px]" : "aspect-video"}`}>
        {blurUrl && !loaded && (
          <img
            src={blurUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover blur-xl scale-110 opacity-40"
          />
        )}
        {wallpaper.isVideo ? (
          <video
            src={wallpaper.rawUrl}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
            onLoadedData={() => setLoaded(true)}
          />
        ) : (
          <img
            src={thumbUrl}
            alt={wallpaper.title}
            loading={index < 12 ? "eager" : "lazy"}
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setLoaded(true)}
          />
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {isAnimated && (
            <span className="flex items-center gap-1 bg-black/70 border border-amber/30 px-1.5 py-0.5 text-[9px] font-bold text-amber uppercase tracking-wider">
              <Film className="h-2.5 w-2.5" /> LIVE
            </span>
          )}
          {isVertical && (
            <span className="flex items-center gap-1 bg-black/70 border border-cyan/30 px-1.5 py-0.5 text-[9px] font-bold text-cyan uppercase tracking-wider">
              <Smartphone className="h-2.5 w-2.5" /> 9:16
            </span>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(); }}
            className="flex items-center gap-1.5 bg-cyan px-3 py-2 text-[11px] font-bold text-black hover:bg-cyan/80 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> DOWNLOAD
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(); }}
            className="flex h-9 w-9 items-center justify-center bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className={`absolute top-2 right-2 flex h-7 w-7 items-center justify-center transition-all cursor-pointer ${
            isFavorite
              ? "bg-rose-500/20 border border-rose-500/50 text-rose-400"
              : "bg-black/50 border border-white/10 text-white/40 opacity-0 group-hover:opacity-100"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Info */}
      <div className="px-3 py-2.5 border-t border-border">
        <h3 className="text-[12px] font-semibold text-white font-sans truncate leading-tight">
          {wallpaper.title}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-muted">{wallpaper.categoryLabel}</span>
          <div className="flex items-center gap-2 text-[10px] text-muted/60 tabular-nums">
            <span>{wallpaper.resolution || wallpaper.resolutionBadge || "—"}</span>
            <span className="text-white/10">·</span>
            <span>{wallpaper.sizeFormatted}</span>
            <span className="text-white/10">·</span>
            <span className="uppercase">{wallpaper.format}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WallpaperGrid({
  wallpapers,
  favorites,
  onToggleFavorite,
  onDownload,
  onPreview,
}: WallpaperGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const cards = gridRef.current.querySelectorAll(".scroll-reveal:not(.revealed)");
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [wallpapers]);

  if (wallpapers.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-32">
        <div className="text-center">
          <p className="text-white/20 text-2xl font-sans font-bold mb-2">NO_RESULTS</p>
          <p className="text-muted/40 text-xs">Try a different search or type /reset</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
      {wallpapers.map((w, i) => (
        <WallpaperCard
          key={w.id}
          wallpaper={w}
          index={i}
          isFavorite={favorites.has(w.id)}
          onToggleFavorite={() => onToggleFavorite(w)}
          onDownload={() => onDownload(w)}
          onPreview={() => onPreview(w)}
        />
      ))}
    </div>
  );
}
