"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Search, Zap, Smartphone, Heart, Shuffle, LayoutGrid, Image, Archive, ArrowRight } from "lucide-react";
import type { Wallpaper } from "@/lib/types";

interface CommandPaletteProps {
  wallpapers: Wallpaper[];
  collections: { name: string; count: number }[];
  onClose: () => void;
  onNavigate: (action: { type: string; value?: string }) => void;
}

interface CommandItem {
  id: string;
  label: string;
  sublabel: string;
  icon: typeof Search;
  action: { type: string; value?: string };
  color?: string;
}

export function CommandPalette({ wallpapers, collections, onClose, onNavigate }: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const commands: CommandItem[] = useMemo(() => [
    { id: "all", label: "/all", sublabel: "Show all static wallpapers", icon: Image, action: { type: "tab", value: "all" } },
    { id: "live", label: "/live", sublabel: "Show 60FPS motion loops", icon: Zap, action: { type: "tab", value: "live" }, color: "text-amber" },
    { id: "mobile", label: "/mobile", sublabel: "Show 9:16 vertical wallpapers", icon: Smartphone, action: { type: "tab", value: "mobile" }, color: "text-cyan" },
    { id: "saved", label: "/saved", sublabel: "Show your saved stash", icon: Heart, action: { type: "tab", value: "saved" }, color: "text-rose-400" },
    { id: "vaults", label: "/vaults", sublabel: "Browse the archives", icon: Archive, action: { type: "tab", value: "vaults" } },
    { id: "random", label: "/random", sublabel: "Open a random wallpaper", icon: Shuffle, action: { type: "random" } },
    { id: "reset", label: "/reset", sublabel: "Clear filters and search", icon: LayoutGrid, action: { type: "reset" } },
    ...collections.map((c) => ({
      id: `col-${c.name}`,
      label: c.name,
      sublabel: `${c.count} wallpapers`,
      icon: ArrowRight,
      action: { type: "collection", value: c.name },
    })),
  ], [collections]);

  const results = useMemo(() => {
    if (!input.trim()) return commands.slice(0, 12);
    const q = input.toLowerCase();

    if (q.startsWith("/")) {
      const cmdQ = q.slice(1);
      return commands.filter((c) => c.label.toLowerCase().includes(cmdQ));
    }

    const wallpaperMatches: CommandItem[] = wallpapers
      .filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.categoryLabel.toLowerCase().includes(q) ||
          w.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 8)
      .map((w) => ({
        id: `w-${w.id}`,
        label: w.title,
        sublabel: `${w.categoryLabel} · ${w.resolution || "—"} · ${w.format}`,
        icon: Image,
        action: { type: "preview", value: w.id },
      }));

    const cmdMatches = commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.sublabel.toLowerCase().includes(q)
    );

    return [...cmdMatches, ...wallpaperMatches].slice(0, 12);
  }, [input, commands, wallpapers]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[selectedIdx]) {
        e.preventDefault();
        onNavigate(results[selectedIdx].action);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [results, selectedIdx, onNavigate, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-[#0a0a0f] border border-border shadow-2xl shadow-cyan/5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="text-cyan text-sm font-bold select-none">❯</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setSelectedIdx(0);
            }}
            placeholder="Type a command or search wallpapers..."
            className="flex-1 bg-transparent text-sm text-white placeholder-muted/50 focus:outline-none caret-cyan font-mono"
          />
          <kbd className="border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[9px] text-muted">ESC</kbd>
        </div>

        {/* Hints */}
        {!input && (
          <div className="px-4 py-2 border-b border-border text-[10px] text-muted/50 flex items-center gap-3">
            <span>Try:</span>
            <span className="text-cyan/60">/live</span>
            <span className="text-cyan/60">/mobile</span>
            <span className="text-cyan/60">/random</span>
            <span className="text-cyan/60">/saved</span>
            <span className="text-muted/30">or search by name, tag, collection</span>
          </div>
        )}

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto">
          {results.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-muted/40">
              NO_RESULTS — try a different query
            </div>
          )}
          {results.map((item, i) => {
            const Icon = item.icon;
            const isSelected = i === selectedIdx;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.action);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIdx(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                  isSelected ? "bg-cyan/[0.08] border-l-2 border-l-cyan" : "border-l-2 border-l-transparent hover:bg-white/[0.02]"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${item.color || (isSelected ? "text-cyan" : "text-muted/60")}`} />
                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-mono ${isSelected ? "text-white" : "text-white/70"}`}>
                    {item.label}
                  </span>
                  <span className="text-[10px] text-muted/50 ml-2">{item.sublabel}</span>
                </div>
                {isSelected && (
                  <kbd className="border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[9px] text-muted shrink-0">↵</kbd>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 flex items-center justify-between text-[9px] text-muted/40">
          <div className="flex items-center gap-3">
            <span><kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 mr-0.5">↑↓</kbd> navigate</span>
            <span><kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 mr-0.5">↵</kbd> select</span>
            <span><kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 mr-0.5">esc</kbd> close</span>
          </div>
          <span className="text-muted/30">VOID//WALLS TERMINAL v1.0</span>
        </div>
      </div>
    </div>
  );
}
