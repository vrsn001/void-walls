"use client";

interface StatusBarProps {
  message: string;
  totalCount: number;
  filteredCount: number;
  selectedIndex: number;
  activeFilter: string;
  favoritesCount: number;
}

export function StatusBar({
  message,
  totalCount,
  filteredCount,
  selectedIndex,
  activeFilter,
  favoritesCount,
}: StatusBarProps) {
  return (
    <div className="shrink-0 flex items-center justify-between gap-4 border-t border-white/[0.06] bg-[#060609] px-3 py-1 text-[10px] select-none">
      {/* Left: status message */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="status-cursor h-3 w-[2px] bg-cyan shrink-0" />
        <span className="text-muted truncate">{message}</span>
      </div>

      {/* Right: metadata */}
      <div className="flex items-center gap-3 shrink-0 text-muted/60 tabular-nums">
        <span>
          FILTER: <span className="text-cyan uppercase">{activeFilter}</span>
        </span>
        <span className="text-white/10">│</span>
        <span>
          {filteredCount === totalCount
            ? `${totalCount} assets`
            : `${filteredCount} / ${totalCount}`}
        </span>
        <span className="text-white/10">│</span>
        <span>
          IDX: <span className="text-white/80">{selectedIndex + 1}</span>
        </span>
        <span className="text-white/10">│</span>
        <span>
          ♥ <span className="text-white/80">{favoritesCount}</span>
        </span>
      </div>
    </div>
  );
}
