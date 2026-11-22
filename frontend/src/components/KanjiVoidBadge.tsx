import React from 'react';

interface KanjiVoidBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSublabel?: boolean;
}

export const KanjiVoidBadge: React.FC<KanjiVoidBadgeProps> = ({
  size = 'md',
  className = '',
  showSublabel = true,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  const isLg = size === 'lg';

  return (
    <div
      className={`relative flex flex-col items-center justify-center bg-[#050508] border border-white/15 overflow-hidden select-none group-hover:border-cyan-500/50 transition-all duration-300 ${sizeClasses[size]} ${className}`}
      style={{
        boxShadow: isLg ? '0 0 30px rgba(0, 240, 255, 0.08), inset 0 0 15px rgba(0, 0, 0, 0.8)' : undefined,
      }}
    >
      {/* Blueprint Grid Crosshairs */}
      <div className="pointer-events-none absolute inset-0">
        {/* Horizontal center crosshair */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/[0.06] -translate-y-1/2" />
        {/* Vertical center crosshair */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/[0.06] -translate-x-1/2" />
        {/* Dashed outer border line */}
        <div className="absolute inset-1 border border-dashed border-white/[0.08]" />
      </div>

      {/* Top-Left Corner Tick */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-white/40" />
      {/* Top-Right Corner Tick */}
      <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t-2 border-r-2 border-white/40" />
      {/* Bottom-Left Corner Tick */}
      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b-2 border-l-2 border-white/40" />
      {/* Bottom-Right Electric Cyan Accent Tick (from reference Image 1) */}
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400 shadow-[0_0_8px_#00f0ff]" />

      {/* Main Kanji Character: 虚 */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <span
          className={`font-black tracking-tight text-white transition-transform duration-300 group-hover:scale-105 ${
            isLg ? 'text-4xl sm:text-5xl leading-none' : size === 'md' ? 'text-lg leading-none' : 'text-sm leading-none'
          }`}
          style={{
            fontFamily: "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif",
            textShadow: isLg ? '0 0 15px rgba(255, 255, 255, 0.4)' : undefined,
          }}
        >
          虚
        </span>

        {/* Monospace Sub-label: VOID_00 */}
        {isLg && showSublabel && (
          <span className="mt-1 text-[9px] font-mono tracking-widest text-cyan-400/90 uppercase font-semibold">
            VOID_00
          </span>
        )}
      </div>
    </div>
  );
};
