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
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-black/80 backdrop-blur-2xl transition-colors">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Brand */}
        <a href="#" className="group flex items-center gap-3 focus:outline-none shrink-0">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] group-hover:border-white/25 group-hover:bg-white/[0.06] transition-all duration-300">
            <span className="font-semibold text-sm text-neutral-200 group-hover:text-white transition-colors">虚</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm sm:text-base tracking-tight text-white group-hover:text-white/90 transition-colors">
                VOID <span className="text-neutral-500 font-mono text-xs">//</span> WALLS
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-medium text-neutral-400 hidden md:inline tracking-wider">
                VAULT
              </span>
            </div>
            <p className="hidden text-[11px] text-neutral-500 sm:block leading-none tracking-normal mt-0.5 font-normal">
              {totalCount.toLocaleString()} curated wallpapers
            </p>
          </div>
        </a>

        {/* Center Search Input */}
        <div className="relative flex-1 max-w-md mx-2">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search anime, dark, amoled, 4k, minimal..."
            className="w-full rounded-full border border-white/[0.08] bg-white/[0.03] py-1.5 pl-9 pr-8 text-xs text-neutral-200 placeholder-neutral-500 transition-all duration-200 hover:border-white/20 focus:border-white/30 focus:bg-white/[0.06] focus:outline-none"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Random Shuffle */}
          <button
            onClick={onRandomClick}
            className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.98] transition-all"
            title="Random discovery"
          >
            <Shuffle className="h-3.5 w-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Random</span>
          </button>

          {/* Saved Collection */}
          <button
            onClick={() => onFilterChange(activeFilter === 'favorites' ? 'all' : 'favorites')}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              activeFilter === 'favorites'
                ? 'border-white bg-white text-black font-semibold shadow-sm'
                : 'border-white/[0.08] bg-white/[0.03] text-neutral-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20'
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${activeFilter === 'favorites' ? 'fill-black text-black' : 'text-neutral-400'}`} />
            <span className="hidden sm:inline">Saved</span>
            {favoritesCount > 0 && (
              <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${activeFilter === 'favorites' ? 'bg-black/10 text-black font-bold' : 'bg-white/10 text-white'}`}>
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Setup Guide */}
          <button
            onClick={onOpenGuide}
            className="flex items-center justify-center h-8 w-8 rounded-full border border-white/[0.08] bg-white/[0.03] text-neutral-400 hover:text-white hover:border-white/20 hover:bg-white/[0.08] transition-all"
            title="Desktop & Mobile Setup Guide"
          >
            <Terminal className="h-3.5 w-3.5" />
          </button>

          {/* GitHub Source Link */}
          <a
            href="https://github.com/vrsn001/wallsbyme"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:border-white/20 hover:bg-white/[0.08] transition-all"
            title="Inspect source repository on GitHub"
          >
            <ExternalLink className="h-3 w-3 text-neutral-400" />
            <span className="hidden lg:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};
