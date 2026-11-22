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
      className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors cursor-pointer whitespace-nowrap ${
        active ? "border-cyan/50 bg-cyan/10 text-cyan" : "border-white/10 text-muted hover:text-white hover:border-white/25"
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

  const sizes = useMemo(() => sizeOptions(wallpaper), [wallpaper]);
  const size = sizes.find((s) => s.id === sizeId) ?? sizes[0];
  const convertible = canConvert(wallpaper);
  const loaded = loadedId === wallpaper.id;
  const sourceLabel = wallpaper.format === "JPG" ? "JPEG" : wallpaper.format;

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
    <div className="lightbox-overlay fixed inset-0 z-50 bg-[#030306] flex flex-col" onClick={onClose}>
      <div className="shrink-0 flex items-center justify-between gap-4 px-4 py-3" onClick={(e) => e.stopPropagation()}>
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

      <div className="flex-1 flex items-center justify-center min-h-0 px-16 py-2 relative" onClick={(e) => e.stopPropagation()}>
        {hasPrev && (
          <button
            onClick={onPrev}
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center bg-black/60 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
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
          />
        ) : (
          <div key={wallpaper.id} className="lightbox-image relative grid max-h-full max-w-full place-items-center">
            {/* WebP thumbnail paints instantly; the full image fades in over it. */}
            {wallpaper.type !== "animated" && (
              <img
                src={getThumbnailUrl(wallpaper)}
                alt=""
                aria-hidden
                className="col-start-1 row-start-1 max-h-[calc(100vh-210px)] max-w-full object-contain blur-[2px]"
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
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center bg-black/60 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Download bar */}
      <div
        className="shrink-0 border-t border-white/[0.06] bg-[#060609] px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        {convertible ? (
          <>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[9px] text-muted/50 tracking-widest shrink-0">SIZE</span>
              <div className="flex flex-wrap gap-1">
                {sizes.map((s) => (
                  <Chip key={s.id} active={size.id === s.id} onClick={() => setSizeId(s.id)}>
                    {s.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-muted/50 tracking-widest shrink-0">FORMAT</span>
              <div className="flex flex-wrap gap-1">
                {FORMATS.filter((f) => f.id === "original" || f.label !== sourceLabel).map((f) => (
                  <Chip key={f.id} active={format === f.id} onClick={() => setFormat(f.id)}>
                    {f.id === "original" ? `ORIGINAL ${wallpaper.format}` : f.label}
                  </Chip>
                ))}
              </div>
            </div>
          </>
        ) : (
          <span className="text-[10px] text-muted/60">
            {wallpaper.format} downloads as the original file only.
          </span>
        )}

        <button
          onClick={startDownload}
          disabled={busy}
          className="ml-auto flex items-center gap-1.5 bg-cyan px-4 py-2 text-[11px] font-bold text-black hover:bg-cyan/80 disabled:opacity-60 transition-colors cursor-pointer disabled:cursor-wait"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          {busy ? "PROCESSING..." : "DOWNLOAD"}
        </button>
      </div>

      <div className="shrink-0 text-center py-2 text-[10px] text-muted/40 bg-[#060609]">
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] mr-1">←</kbd>
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] mr-2">→</kbd>navigate
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] ml-3 mr-1">↵</kbd>download
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] ml-3 mr-1">s</kbd>save
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] ml-3 mr-1">esc</kbd>close
      </div>
    </div>
  );
}
