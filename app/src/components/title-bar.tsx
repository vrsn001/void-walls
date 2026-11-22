"use client";

export function TitleBar() {
  return (
    <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#060609] px-3 select-none">
      {/* Traffic lights (cosmetic) */}
      <div className="flex items-center gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </div>

      {/* Title */}
      <div className="flex items-center gap-2 text-[11px]">
        <span className="font-bold text-white font-sans tracking-tight">VOID<span className="text-cyan mx-0.5">//</span>WALLS</span>
        <span className="text-muted">—</span>
        <span className="text-muted">Terminal</span>
      </div>

      {/* Keyboard hint */}
      <div className="flex items-center gap-2 text-[10px] text-muted">
        <kbd className="rounded-sm border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px]">⌘K</kbd>
        <span>Search</span>
      </div>
    </div>
  );
}
