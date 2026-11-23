"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Download, Heart, ChevronLeft, ChevronRight, Film, Loader2 } from "lucide-react";
import type { Wallpaper } from "@/lib/types";
import { getFullUrl, getThumbnailUrl } from "@/lib/cdn";
import { canConvert, sizeOptions, type OutputFormat, type SizeOption } from "@/lib/download";

interface LightboxProps {
  wallpaper: Wallpaper;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (w: Wallpaper) => void;
  onDownload: (w: Wallpaper, format?: OutputFormat, size?: SizeOption | null) => Promise<void>;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

const FORMATS: { id: OutputFormat; label: string }[] = [
  { id: "original", label: "ORIGINAL" },
  { id: "jpeg", label: "JPEG" },
  { id: "webp", label: "WEBP" },
  { id: "png", label: "PNG" },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 sm:px-3 py-1.5 sm:py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors cursor-pointer whitespace-nowrap min-h-[32px] sm:min-h-0 ${
        active ? "border-cyan/50 bg-cyan/15 text-cyan" : "border-white/10 text-muted hover:text-white hover:border-white/25"
      }`}
    >
      {children}
    </button>
  );
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
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [format, setFormat] = useState<OutputFormat>("original");
  const [sizeId, setSizeId] = useState("original");
  const [busy, setBusy] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const sizes = useMemo(() => sizeOptions(wallpaper), [wallpaper]);
  const size = sizes.find((s) => s.id === sizeId) ?? sizes[0];
  const convertible = canConvert(wallpaper);
  const loaded = loadedId === wallpaper.id;
  const sourceLabel = wallpaper.format === "JPG" ? "JPEG" : wallpaper.format;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const diffX = touchStartX - e.changedTouches[0].clientX;
    const diffY = touchStartY - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0 && hasNext) {
        onNext();
      } else if (diffX < 0 && hasPrev) {
        onPrev();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  const startDownload = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onDownload(wallpaper, convertible ? format : "original", convertible ? size : null);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      else if (e.key === "ArrowRight" && hasNext) onNext();
      else if (e.key === "Enter") startDownload();
      else if (e.key === "s") onToggleFavorite(wallpaper);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  return (
    <div className="lightbox-overlay fixed inset-0 z-50 bg-[#030306] flex flex-col overflow-hidden" onClick={onClose}>
      {/* Dynamic Ambient Background Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
        <img
          src={getThumbnailUrl(wallpaper)}
          alt=""
          className="h-full w-full object-cover scale-150 blur-3xl opacity-30 filter transition-all duration-700"
        />
        {/* Dark vignette & frosted glass overlay for contrast and sleek cyber feel */}
        <div className="absolute inset-0 bg-[#030306]/75 backdrop-blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030306] via-transparent to-[#030306]/90" />
      </div>

      <div className="relative z-10 shrink-0 flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 py-2.5 sm:py-3" onClick={(e) => e.stopPropagation()}>
        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-semibold text-white font-sans truncate">{wallpaper.title}</h2>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-muted mt-0.5 truncate">
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
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => onToggleFavorite(wallpaper)}
            aria-label={isFavorite ? "Remove from stash" : "Save to stash"}
            className={`flex h-8 w-8 items-center justify-center border transition-colors cursor-pointer ${
              isFavorite ? "border-rose-500/50 bg-rose-500/10 text-rose-400" : "border-white/20 text-white/60 hover:text-white"
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center border border-white/20 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className="relative z-10 flex-1 flex items-center justify-center min-h-0 px-2 sm:px-8 md:px-16 py-2 touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {hasPrev && (
          <button
            onClick={onPrev}
            aria-label="Previous"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center bg-black/70 border border-white/15 text-white/70 hover:text-white hover:border-cyan/40 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}

        {wallpaper.isVideo ? (
          <video
            key={wallpaper.id}
            src={wallpaper.rawUrl}
            poster={getThumbnailUrl(wallpaper)}
            autoPlay
            loop
            muted
            playsInline
            className="lightbox-image max-h-full max-w-full object-contain"
          />
        ) : (
          <div key={wallpaper.id} className="lightbox-image relative grid max-h-full max-w-full place-items-center">
            {/* WebP thumbnail paints instantly and crisply; the full master image fades in over it. */}
            {wallpaper.type !== "animated" && (
              <img
                src={getThumbnailUrl(wallpaper)}
                alt=""
                aria-hidden
                className="col-start-1 row-start-1 max-h-[calc(100vh-210px)] max-w-full object-contain"
                style={{ width: wallpaper.width || undefined, aspectRatio: wallpaper.width && wallpaper.height ? `${wallpaper.width}/${wallpaper.height}` : undefined }}
              />
            )}
            <img
              src={getFullUrl(wallpaper)}
              alt={wallpaper.title}
              decoding="async"
              className={`col-start-1 row-start-1 max-h-[calc(100vh-210px)] max-w-full object-contain transition-opacity duration-500 ${
                loaded || wallpaper.type === "animated" ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setLoadedId(wallpaper.id)}
            />
            {!loaded && wallpaper.type !== "animated" && (
              <span className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/70 border border-white/10 px-2 py-1 text-[9px] text-muted tracking-widest">
                <Loader2 className="h-3 w-3 animate-spin" /> LOADING FULL RES
              </span>
            )}
          </div>
        )}

        {hasNext && (
          <button
            onClick={onNext}
            aria-label="Next"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center bg-black/70 border border-white/15 text-white/70 hover:text-white hover:border-cyan/40 transition-colors cursor-pointer"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}
      </div>

      {/* Download bar */}
      <div
        className="relative z-10 shrink-0 border-t border-white/[0.08] bg-[#060609]/95 backdrop-blur-md px-3 sm:px-5 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        {convertible ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 min-w-0">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[9px] text-muted/50 tracking-widest shrink-0 font-mono">SIZE</span>
              <div className="flex items-center gap-1 shrink-0">
                {sizes.map((s) => (
                  <Chip key={s.id} active={size.id === s.id} onClick={() => setSizeId(s.id)}>
                    {s.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[9px] text-muted/50 tracking-widest shrink-0 font-mono">FORMAT</span>
              <div className="flex items-center gap-1 shrink-0">
                {FORMATS.filter((f) => f.id === "original" || f.label !== sourceLabel).map((f) => (
                  <Chip key={f.id} active={format === f.id} onClick={() => setFormat(f.id)}>
                    {f.id === "original" ? `ORIGINAL ${wallpaper.format}` : f.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-[10px] text-muted/60 font-mono">
            {wallpaper.format} downloads as the original file.
          </span>
        )}

        <button
          onClick={startDownload}
          disabled={busy}
          className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 bg-cyan px-5 py-2.5 sm:py-2 text-xs font-bold text-black hover:bg-cyan/80 disabled:opacity-60 transition-colors cursor-pointer disabled:cursor-wait font-mono"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {busy ? "PROCESSING..." : "DOWNLOAD WALLPAPER"}
        </button>
      </div>

      <div className="hidden md:block relative z-10 shrink-0 text-center py-2 text-[10px] text-muted/40 bg-[#060609]/90 backdrop-blur-md border-t border-white/[0.04]">
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] mr-1">←</kbd>
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] mr-2">→</kbd>navigate
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] ml-3 mr-1">↵</kbd>download
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] ml-3 mr-1">s</kbd>save
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] ml-3 mr-1">esc</kbd>close
      </div>
    </div>
  );
}
