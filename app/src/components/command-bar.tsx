"use client";

import { useRef, useEffect } from "react";
import { Search, Zap, Smartphone, Heart, LayoutGrid } from "lucide-react";

interface CommandBarProps {
  query: string;
  onCommand: (cmd: string) => void;
  onQueryChange: (q: string) => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  resultCount: number;
  totalCount: number;
  activeFilter: string;
  onFilterChange: (f: string) => void;
}

const filters = [
  { id: "all", label: "ALL", icon: LayoutGrid },
  { id: "live", label: "LIVE", icon: Zap },
  { id: "mobile", label: "9:16", icon: Smartphone },
  { id: "saved", label: "SAVED", icon: Heart },
];

export function CommandBar({
  query,
  onCommand,
  onQueryChange,
  focused,
  onFocus,
  onBlur,
  resultCount,
  totalCount,
  activeFilter,
  onFilterChange,
}: CommandBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focused && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [focused]);

  return (
    <div className="shrink-0 bg-[#060609] border-b border-white/[0.06]">
      <div className="flex items-center gap-0 px-3 py-1.5">
        {/* Prompt symbol */}
        <span className="text-cyan text-sm font-bold mr-2 select-none">❯</span>

        {/* Input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={onFocus}
            onBlur={() => setTimeout(onBlur, 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onCommand(query);
              }
              if (e.key === "Escape") {
                onBlur();
                inputRef.current?.blur();
              }
            }}
            placeholder="Search assets or type /command..."
            className="w-full bg-transparent py-1.5 pl-5 pr-2 text-xs text-white placeholder-muted/60 focus:outline-none caret-cyan"
          />
        </div>

        {/* Result count */}
        <span className="text-[10px] text-muted tabular-nums ml-2 shrink-0">
          {resultCount === totalCount
            ? `${totalCount.toLocaleString()}`
            : `${resultCount.toLocaleString()} / ${totalCount.toLocaleString()}`}
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-0.5 px-3 pb-1.5">
        {filters.map((f) => {
          const Icon = f.icon;
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                isActive
                  ? "text-cyan bg-cyan/[0.08] border border-cyan/20"
                  : "text-muted hover:text-white border border-transparent"
              }`}
            >
              <Icon className="h-2.5 w-2.5" />
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
