"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Download, Heart, Film, Smartphone, Maximize2 } from "lucide-react";
import type { Wallpaper } from "@/lib/types";
import { getThumbnailUrl, getFullUrl, getVideoPreviewUrl } from "@/lib/cdn";

const BATCH = 48;

interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  favorites: Set<string>;
  mobileCols?: number;
  onToggleFavorite: (w: Wallpaper) => void;
  onDownload: (w: Wallpaper) => void;
  onPreview: (w: Wallpaper) => void;
}

interface CardProps {
  wallpaper: Wallpaper;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (w: Wallpaper) => void;
  onDownload: (w: Wallpaper) => void;
  onPreview: (w: Wallpaper) => void;
}

function InViewVideo({ src, poster, onReady }: { src: string; poster: string; onReady: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {});
      else el.pause();
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      loop
      muted
      playsInline
      preload="auto"
      className="card-media h-full w-full object-cover"
      onLoadedData={onReady}
    />
  );
}

const WallpaperCard = memo(function WallpaperCard({
  wallpaper,
  index,
  isFavorite,
  onToggleFavorite,
  onDownload,
  onPreview,
}: CardProps) {
  const isAnimated = wallpaper.type === "animated";
  const [loaded, setLoaded] = useState(false);
  const [src, setSrc] = useState(() => getThumbnailUrl(wallpaper));
  const imgRef = useRef<HTMLImageElement>(null);

  // Cached images can finish loading before hydration attaches onLoad.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setLoaded(true);
  }, []);

  // GIFs show their static WebP frame first, then swap in the animation once fetched.
  useEffect(() => {
    if (!isAnimated || wallpaper.isVideo || !loaded) return;
    const full = getFullUrl(wallpaper);
    const preload = new Image();
    preload.onload = () => setSrc(full);
    preload.src = full;
    return () => {
      preload.onload = null;
    };
  }, [isAnimated, loaded, wallpaper]);

  const handleError = () => {
    const full = getFullUrl(wallpaper);
    if (src !== full) setSrc(full);
    else setLoaded(true);
  };

  const isVertical =
    wallpaper.category === "phone-vertical" ||
    (!!wallpaper.width && !!wallpaper.height && wallpaper.height > wallpaper.width * 1.3);

  return (
    <div
      className="wall-card group relative flex flex-col bg-surface border border-border overflow-hidden cursor-pointer"
      style={{ animationDelay: `${(index % BATCH) * 18}ms` }}
      onClick={() => onPreview(wallpaper)}
    >
      <div className={`relative overflow-hidden bg-black ${isVertical ? "aspect-[9/16] max-h-[360px]" : "aspect-video"}`}>
        <div className={`card-skeleton absolute inset-0 ${loaded ? "is-done" : ""}`} />

        {wallpaper.isVideo ? (
          <InViewVideo
            src={getVideoPreviewUrl(wallpaper)}
            poster={getThumbnailUrl(wallpaper)}
            onReady={() => setLoaded(true)}
          />
        ) : (
          <img
            ref={imgRef}
            src={src}
            alt={wallpaper.title}
            loading={index < 8 ? "eager" : "lazy"}
            fetchPriority={index < 4 ? "high" : "auto"}
            decoding="async"
            className={`card-media h-full w-full object-cover ${loaded ? "is-loaded" : ""}`}
            onLoad={() => setLoaded(true)}
            onError={handleError}
          />
        )}

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

        <div className="card-overlay absolute inset-0 bg-black/60 flex items-center justify-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(wallpaper); }}
            className="flex items-center gap-1.5 bg-cyan px-3 py-2 text-[11px] font-bold text-black hover:bg-cyan/80 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> DOWNLOAD
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(wallpaper); }}
            aria-label="Preview"
            className="flex h-9 w-9 items-center justify-center bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(wallpaper); }}
          aria-label={isFavorite ? "Remove from stash" : "Save to stash"}
          className={`fav-btn absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex h-11 w-11 sm:h-8 sm:w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 items-center justify-center cursor-pointer ${
            isFavorite
              ? "is-fav bg-rose-500/20 border border-rose-500/50 text-rose-400"
              : "bg-black/60 border border-white/15 text-white/60"
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="px-2.5 sm:px-3 py-2 sm:py-2.5 border-t border-border">
        <h3 className="text-xs sm:text-[13px] font-semibold text-white font-sans truncate leading-tight">
          {wallpaper.title}
        </h3>
        <div className="flex items-center justify-between mt-1 sm:mt-1.5 gap-1 font-mono">
          <span className="text-[10px] sm:text-[11px] text-zinc-300 truncate font-sans font-medium">{wallpaper.categoryLabel}</span>
          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-[11px] text-zinc-400 tabular-nums shrink-0">
            <span>{wallpaper.resolution || wallpaper.resolutionBadge || "—"}</span>
            <span className="text-white/20 hidden sm:inline">·</span>
            <span className="hidden sm:inline">{wallpaper.sizeFormatted}</span>
            <span className="text-white/20">·</span>
            <span className="uppercase">{wallpaper.format}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export function WallpaperGrid({
  wallpapers,
  favorites,
  mobileCols = 2,
  onToggleFavorite,
  onDownload,
  onPreview,
}: WallpaperGridProps) {
  const [count, setCount] = useState(BATCH);
  const [prevList, setPrevList] = useState(wallpapers);
  const sentinelRef = useRef<HTMLDivElement>(null);

  if (prevList !== wallpapers) {
    setPrevList(wallpapers);
    setCount(BATCH);
  }

  const hasMore = count < wallpapers.length;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setCount((c) => c + BATCH);
      },
      { rootMargin: "1200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, count]);

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
    <>
      <div
        className={`grid ${
          mobileCols === 1
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-3 sm:p-4"
            : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 p-2 sm:p-4"
        }`}
      >
        {wallpapers.slice(0, count).map((w, i) => (
          <WallpaperCard
            key={w.id}
            wallpaper={w}
            index={i}
            isFavorite={favorites.has(w.id)}
            onToggleFavorite={onToggleFavorite}
            onDownload={onDownload}
            onPreview={onPreview}
          />
        ))}
      </div>
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-8 text-[10px] text-muted/40 tracking-widest">
          LOADING_MORE // {count} / {wallpapers.length}
        </div>
      )}
    </>
  );
}
