"use client";

import { forwardRef } from "react";
import { Film, Smartphone, Heart } from "lucide-react";
import type { Wallpaper } from "@/lib/types";

interface FeedPaneProps {
  wallpapers: Wallpaper[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  favorites: Set<string>;
}

export const FeedPane = forwardRef<HTMLDivElement, FeedPaneProps>(
  function FeedPane({ wallpapers, selectedIndex, onSelect, favorites }, ref) {
    if (wallpapers.length === 0) {
      return (
        <div ref={ref} className="w-[420px] shrink-0 flex items-center justify-center text-muted text-xs">
          <div className="text-center">
            <p className="text-white/40 mb-1">NO_RESULTS</p>
            <p className="text-[10px]">Try a different search or /reset</p>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className="w-[420px] shrink-0 overflow-y-auto overflow-x-hidden">
        {/* Column header */}
        <div className="sticky top-0 z-10 flex items-center gap-0 bg-[#060609]/95 backdrop-blur-sm px-3 py-1.5 text-[9px] text-muted uppercase tracking-widest border-b border-white/[0.04]">
          <span className="w-6 shrink-0 text-center">#</span>
          <span className="flex-1 pl-2">Title</span>
          <span className="w-16 text-right">Res</span>
          <span className="w-12 text-right">Size</span>
          <span className="w-10 text-right">Fmt</span>
        </div>

        {/* Rows */}
        {wallpapers.map((w, i) => {
          const isSelected = i === selectedIndex;
          const isFav = favorites.has(w.id);
          const isAnimated = w.type === "animated";
          const isVertical =
            w.category === "phone-vertical" ||
            (w.width && w.height && w.height > w.width * 1.3);

          return (
            <div
              key={w.id}
              data-index={i}
              onClick={() => onSelect(i)}
              className={`feed-row flex items-center gap-0 px-3 py-1.5 cursor-pointer hover:bg-white/[0.03] ${
                isSelected ? "selected" : ""
              }`}
            >
              {/* Row number */}
              <span className="w-6 shrink-0 text-center text-[10px] tabular-nums text-muted/50">
                {i + 1}
              </span>

              {/* Title + badges */}
              <div className="flex-1 min-w-0 pl-2">
                <div className="flex items-center gap-1.5">
                  {isAnimated && <Film className="h-2.5 w-2.5 text-amber shrink-0" />}
                  {isVertical && <Smartphone className="h-2.5 w-2.5 text-cyan shrink-0" />}
                  {isFav && <Heart className="h-2.5 w-2.5 text-rose-400 fill-rose-400 shrink-0" />}
                  <span
                    className={`truncate text-[11px] font-sans ${
                      isSelected ? "text-white font-semibold" : "text-white/70"
                    }`}
                  >
                    {w.title}
                  </span>
                </div>
                <span className="text-[9px] text-muted/50 truncate block">
                  {w.categoryLabel}
                </span>
              </div>

              {/* Resolution */}
              <span className="w-16 text-right text-[10px] tabular-nums text-muted/70 shrink-0">
                {w.resolutionBadge || "—"}
              </span>

              {/* Size */}
              <span className="w-12 text-right text-[10px] tabular-nums text-muted/50 shrink-0">
                {w.sizeFormatted}
              </span>

              {/* Format */}
              <span className="w-10 text-right text-[10px] text-muted/40 uppercase shrink-0">
                {w.format}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
);
