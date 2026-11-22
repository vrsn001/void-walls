"use client";

import { useEffect, useMemo } from "react";
import { X, ExternalLink } from "lucide-react";
import type { Wallpaper } from "@/lib/types";

export function CreditsPanel({ wallpapers, onClose }: { wallpapers: Wallpaper[]; onClose: () => void }) {
  const sources = useMemo(() => {
    const counts = new Map<string, number>();
    wallpapers.forEach((w) => {
      const repo = w.sourceRepo ?? "vrsn001/void-walls";
      counts.set(repo, (counts.get(repo) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [wallpapers]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="lightbox-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={onClose}>
      <div
        className="lightbox-image w-full max-w-lg border border-border bg-[#0a0a0f]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-xs font-bold tracking-widest text-white">
            CREDITS <span className="text-cyan">{"//"}</span> SOURCES
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-white cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="px-4 pt-3 text-[11px] leading-relaxed text-muted">
          VOID//WALLS curates work from these open collections. All rights stay with the original artists and maintainers.
        </p>
        <ul className="p-2">
          {sources.map(([repo, count]) => (
            <li key={repo}>
              <a
                href={`https://github.com/${repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 px-2 py-2.5 hover:bg-white/[0.03]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs text-white group-hover:text-cyan transition-colors">{repo.split("/")[1]}</span>
                  <span className="block text-[10px] text-muted/60">by {repo.split("/")[0]}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-[10px] tabular-nums text-muted">
                  {count.toLocaleString()} assets
                  <ExternalLink className="h-3 w-3" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
