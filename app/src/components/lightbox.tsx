"use client";

import { useEffect, useState } from "react";
import { X, Download, Heart, ChevronLeft, ChevronRight, Film } from "lucide-react";
import type { Wallpaper } from "@/lib/types";
import { getThumbnailUrl } from "@/lib/cdn";

interface LightboxProps {
  wallpaper: Wallpaper;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (w: Wallpaper) => void;
  onDownload: (w: Wallpaper) => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function Lightbox({
  wallpaper,
  isFavorite,
  onClose,
  onToggleFavorite,
  onDownload,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: LightboxProps) {
  const [loaded, setLoaded] = useState(false);
  const previewUrl = getThumbnailUrl(wallpaper, 1400);

  useEffect(() => {
    setLoaded(false);
  }, [wallpaper.id]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && hasPrev) onPrev();
      else if (e.key === "ArrowRight" && hasNext) onNext();
      else if (e.key === "Enter") onDownload(wallpaper);
      else if (e.key === "s") onToggleFavorite(wallpaper);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [wallpaper, onClose, onPrev, onNext, hasPrev, hasNext, onDownload, onToggleFavorite]);

  return (
    <div className="lightbox-overlay fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col" onClick={onClose}>
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-white font-sans truncate">{wallpaper.title}</h2>
          <div className="flex items-center gap-2 text-[10px] text-muted mt-0.5">
            <span>{wallpaper.categoryLabel}</span>
            <span className="text-white/10">·</span>
            <span>{wallpaper.resolution || "—"}</span>
            <span className="text-white/10">·</span>
            <span className="uppercase">{wallpaper.format}</span>
            <span className="text-white/10">·</span>
            <span>{wallpaper.sizeFormatted}</span>
            {wallpaper.type === "animated" && (
              <>
                <span className="text-white/10">·</span>
                <span className="text-amber flex items-center gap-0.5"><Film className="h-2.5 w-2.5" /> LIVE</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onDownload(wallpaper)}
            className="flex items-center gap-1.5 bg-cyan px-3 py-1.5 text-[11px] font-bold text-black hover:bg-cyan/80 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> DOWNLOAD
          </button>
          <button
            onClick={() => onToggleFavorite(wallpaper)}
            className={`flex h-8 w-8 items-center justify-center border transition-colors cursor-pointer ${
              isFavorite
                ? "border-rose-500/50 bg-rose-500/10 text-rose-400"
                : "border-white/20 text-white/60 hover:text-white"
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center border border-white/20 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center min-h-0 px-16 py-4 relative" onClick={(e) => e.stopPropagation()}>
        {hasPrev && (
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center bg-black/60 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {wallpaper.isVideo ? (
          <video
            key={wallpaper.id}
            src={wallpaper.rawUrl}
            autoPlay
            loop
            muted
            playsInline
            className="lightbox-image max-h-full max-w-full object-contain"
            onLoadedData={() => setLoaded(true)}
          />
        ) : (
          <img
            key={wallpaper.id}
            src={previewUrl}
            alt={wallpaper.title}
            className={`lightbox-image max-h-full max-w-full object-contain transition-opacity duration-200 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setLoaded(true)}
          />
        )}

        {hasNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center bg-black/60 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Bottom hint */}
      <div className="shrink-0 text-center pb-3 text-[10px] text-muted/40">
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] mr-1">←</kbd>
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] mr-2">→</kbd>navigate
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] ml-3 mr-1">↵</kbd>download
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] ml-3 mr-1">s</kbd>save
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] ml-3 mr-1">esc</kbd>close
      </div>
    </div>
  );
}
