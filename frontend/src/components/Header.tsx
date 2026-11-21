import React from 'react';
import { Search, Shuffle, Heart, X, Terminal, ExternalLink } from 'lucide-react';
import type { MediaFilterType } from '../types';

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  favoritesCount: number;
  activeFilter: MediaFilterType;
  onFilterChange: (filter: MediaFilterType) => void;
  onRandomClick: () => void;
  onOpenGuide: () => void;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  search,
  onSearchChange,
  favoritesCount,
  activeFilter,
  onFilterChange,
  onRandomClick,
  onOpenGuide,
  totalCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-[#232c3f] bg-[#06070a]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        {/* Brand / Dank Title */}
        <a href="#" className="group flex items-center gap-2.5 focus:outline-none shrink-0">
          <div className="relative flex h-10 w-10 items-center justify-center border-2 border-[#ff5722] bg-[#0c0f17] shadow-[2px_2px_0_#ff5722] group-hover:shadow-[4px_4px_0_#ff5722] transition-all">
            <span className="font-[var(--font-display)] font-black text-xl text-[#ff5722]">虚</span>
            {/* Tech corner markings */}
            <span className="absolute -top-1 -left-1 h-1.5 w-1.5 bg-white" />
            <span className="absolute -bottom-1 -right-1 h-1.5 w-1.5 bg-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-[var(--font-display)] font-black text-lg tracking-tight text-white uppercase sm:text-xl">
                VOID<span className="text-[#ff5722]">//</span>WALLS
              </span>
              <span className="border border-[#ff5722]/50 bg-[#ff5722]/10 px-1 py-0.2 font-[var(--font-mono)] text-[9px] font-bold text-[#ff5722] uppercase hidden md:inline">
                V2.5 ARCHIVE
              </span>
            </div>
            <p className="hidden text-[10px] font-[var(--font-mono)] text-[#8391ac] sm:block leading-none uppercase tracking-wider">
              {totalCount.toLocaleString()} RAW ASSETS · 4K / LIVE / MOBILE
            </p>
          </div>
        </a>

        {/* Center Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8391ac]" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search anime, cyberpunk, 4k, amoled, lofi..."
            className="w-full border-2 border-[#232c3f] bg-[#0e121a] py-2 pl-9 pr-8 text-xs font-[var(--font-mono)] text-white placeholder-[#505f7c] shadow-[2px_2px_0_#000] transition-colors focus:border-[#ff5722] focus:bg-[#121622] focus:outline-none"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8391ac] hover:text-white"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Random Shuffle */}
          <button
            onClick={onRandomClick}
            className="flex items-center gap-1.5 border-2 border-[#232c3f] bg-[#0e121a] px-3 py-2 text-xs font-[var(--font-mono)] font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_#000] hover:border-[#ff5722] hover:bg-[#141a26] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title="Random discovery"
          >
            <Shuffle className="h-3.5 w-3.5 text-[#ff5722]" />
            <span className="hidden sm:inline">RANDOM</span>
          </button>

          {/* Saved Collection */}
          <button
            onClick={() => onFilterChange(activeFilter === 'favorites' ? 'all' : 'favorites')}
            className={`flex items-center gap-1.5 border-2 px-3 py-2 text-xs font-[var(--font-mono)] font-bold uppercase tracking-wider transition-all ${
              activeFilter === 'favorites'
                ? 'border-[#ff5722] bg-[#ff5722] text-black shadow-[2px_2px_0_#fff]'
                : 'border-[#232c3f] bg-[#0e121a] text-white shadow-[2px_2px_0_#000] hover:border-[#ff5722] hover:bg-[#141a26]'
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${activeFilter === 'favorites' ? 'fill-black' : 'text-[#ff5722]'}`} />
            <span className="hidden sm:inline">SAVED</span>
            {favoritesCount > 0 && (
              <span className="font-[var(--font-mono)] text-[10px] bg-black/40 px-1 text-white">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Setup Guide */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 border-2 border-[#232c3f] bg-[#0e121a] p-2 text-[#8391ac] hover:border-cyan-400 hover:text-cyan-400 transition-colors shadow-[2px_2px_0_#000]"
            title="Live Wallpaper Setup Guide"
          >
            <Terminal className="h-4 w-4" />
          </button>

          {/* GitHub Source Link */}
          <a
            href="https://github.com/vrsn001/wallsbyme"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 border-2 border-[#232c3f] bg-[#0e121a] px-3 py-2 text-xs font-[var(--font-mono)] font-bold text-white uppercase hover:border-white hover:bg-[#161c28] transition-colors shadow-[2px_2px_0_#000]"
            title="Inspect source repository on GitHub"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[#ff5722]" />
            <span className="hidden lg:inline">SOURCES</span>
          </a>
        </div>
      </div>
    </header>
  );
};
