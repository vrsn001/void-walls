"use client";

import { useState } from "react";
import { Download, Heart, Maximize2, Film, Copy, Check } from "lucide-react";
import type { Wallpaper } from "@/lib/types";
import { getThumbnailUrl, getBlurPlaceholderUrl } from "@/lib/cdn";

interface PreviewPaneProps {
  wallpaper: Wallpaper | null;
  isFavorite: boolean;
  onToggleFavorite: (w: Wallpaper) => void;
  onDownload: (w: Wallpaper) => void;
}

export function PreviewPane({ wallpaper, isFavorite, onToggleFavorite, onDownload }: PreviewPaneProps) {
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!wallpaper) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted text-xs">
        <div className="text-center">
          <p className="text-white/20 text-lg font-sans font-bold mb-2">虚無</p>
          <p className="text-muted/40">Select a wallpaper from the feed</p>
          <p className="text-[10px] text-muted/30 mt-2">j/k to navigate · Enter to download · s to save</p>
        </div>
      </div>
    );
  }

  const isVertical =
    wallpaper.category === "phone-vertical" ||
    (wallpaper.width && wallpaper.height && wallpaper.height > wallpaper.width * 1.3);

  const previewUrl = getThumbnailUrl(wallpaper, 1200);
  const blurUrl = getBlurPlaceholderUrl(wallpaper);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(wallpaper.rawUrl || wallpaper.cdnUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#030306]">
      {/* Image area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden min-h-0 p-4">
        {/* Blur placeholder */}
        {blurUrl && !loaded && (
          <img
            src={blurUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover blur-2xl scale-125 opacity-30"
          />
        )}

        {/* Main image */}
        {wallpaper.isVideo ? (
          <video
            key={wallpaper.id}
            src={wallpaper.rawUrl}
            autoPlay
            loop
            muted
            playsInline
            className="preview-enter max-h-full max-w-full object-contain rounded-sm"
            onLoadedData={() => setLoaded(true)}
          />
        ) : (
          <img
            key={wallpaper.id}
            src={previewUrl}
            alt={wallpaper.title}
            className={`preview-enter max-h-full object-contain rounded-sm transition-opacity duration-200 ${
              isVertical ? "max-w-[280px]" : "max-w-full"
            } ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)}
          />
        )}

        {/* Fullscreen button */}
        <button
          onClick={() => window.open(wallpaper.rawUrl || wallpaper.cdnUrl, "_blank")}
          className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center bg-black/60 border border-white/10 text-white/60 hover:text-white hover:border-cyan/40 transition-colors cursor-pointer"
          title="Open full resolution (f)"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Info bar */}
      <div className="shrink-0 border-t border-white/[0.06] bg-[#060609] px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white font-sans truncate">
              {wallpaper.title}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-muted">
              <span>{wallpaper.categoryLabel}</span>
              <span className="text-white/10">·</span>
              <span className="tabular-nums">{wallpaper.resolution || "—"}</span>
              <span className="text-white/10">·</span>
              <span className="uppercase">{wallpaper.format}</span>
              <span className="text-white/10">·</span>
              <span className="tabular-nums">{wallpaper.sizeFormatted}</span>
              {wallpaper.type === "animated" && (
                <>
                  <span className="text-white/10">·</span>
                  <span className="flex items-center gap-0.5 text-amber">
                    <Film className="h-2.5 w-2.5" /> 60FPS
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => onDownload(wallpaper)}
            className="flex items-center gap-1.5 bg-cyan px-3 py-1.5 text-[11px] font-bold text-black hover:bg-cyan/80 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            DOWNLOAD
          </button>

          <button
            onClick={() => onToggleFavorite(wallpaper)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold border transition-colors cursor-pointer ${
              isFavorite
                ? "border-rose-500/50 bg-rose-500/10 text-rose-400"
                : "border-white/10 text-muted hover:text-white hover:border-white/20"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-current" : ""}`} />
            {isFavorite ? "SAVED" : "SAVE"}
          </button>

          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold border border-white/10 text-muted hover:text-white hover:border-white/20 transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "COPIED" : "COPY URL"}
          </button>

          <div className="ml-auto text-[10px] text-muted/40">
            <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] mr-1">↵</kbd>download
            <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] ml-2 mr-1">s</kbd>save
            <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] ml-2 mr-1">f</kbd>full
          </div>
        </div>
      </div>
    </div>
  );
}
