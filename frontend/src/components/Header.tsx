import React from 'react';
import { Search, Shuffle, Heart, X, Terminal, ExternalLink, GitBranch } from 'lucide-react';
import type { MediaFilterType } from '../types';
import { KanjiVoidBadge } from './KanjiVoidBadge';

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  favoritesCount: number;
  activeFilter: MediaFilterType;
  onFilterChange: (filter: MediaFilterType) => void;
  onRandomClick: () => void;
  onOpenGuide: () => void;
  onOpenCredits?: () => void;
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
  onOpenCredits,
  totalCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/90 backdrop-blur-2xl transition-colors font-mono">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        {/* Brand */}
        <a href="#" className="group flex items-center gap-3 focus:outline-none shrink-0">
          <KanjiVoidBadge size="sm" className="rounded-none border border-white/20" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base tracking-tight text-white group-hover:text-sky-300 transition-colors uppercase font-sans">
                VOID <span className="text-sky-400 font-mono text-xs">//</span> WALLS
              </span>
              <span className="rounded-none border border-sky-400/40 bg-sky-400/10 px-1.5 py-0.2 text-[9px] font-mono font-bold text-sky-300 hidden md:inline tracking-wider">
                VAULT
              </span>
            </div>
            <p className="hidden text-[10px] text-neutral-500 sm:block leading-none tracking-tight mt-0.5 font-mono">
              {totalCount.toLocaleString()} CURATED ASSETS // FASTLY CDN
            </p>
          </div>
        </a>

        {/* Center Search Input */}
        <div className="relative flex-1 max-w-md mx-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="SEARCH ARCHIVE // anime, amoled, cyberpunk, 4k..."
            className="w-full rounded-none border border-white/15 bg-black/60 py-2 pl-9 pr-9 text-xs text-neutral-200 placeholder-neutral-500 transition-all font-mono hover:border-white/30 focus:border-sky-400 focus:bg-black focus:outline-none"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Random Shuffle */}
          <button
            onClick={onRandomClick}
            className="flex items-center gap-1.5 rounded-none border border-white/20 bg-black px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white hover:border-sky-400 hover:bg-sky-400/10 transition-all cursor-pointer"
            title="Random discovery"
          >
            <Shuffle className="h-3.5 w-3.5 text-neutral-400" />
            <span className="hidden sm:inline text-xs">RANDOM</span>
          </button>

          {/* Saved Collection */}
          <button
            onClick={() => onFilterChange(activeFilter === 'favorites' ? 'all' : 'favorites')}
            className={`flex items-center gap-1.5 rounded-none border px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === 'favorites'
                ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                : 'border-white/20 bg-black text-neutral-300 hover:text-white hover:border-white/40'
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${activeFilter === 'favorites' ? 'fill-current text-rose-400' : 'text-neutral-400'}`} />
            <span className="hidden sm:inline text-xs">STASH</span>
            {favoritesCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 font-mono font-bold ${activeFilter === 'favorites' ? 'bg-rose-500 text-black' : 'bg-white/10 text-white'}`}>
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Upstream Repos / Credits */}
          {onOpenCredits && (
            <button
              onClick={onOpenCredits}
              className="flex items-center gap-1.5 rounded-none border border-sky-400/40 bg-sky-400/10 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-mono font-bold text-sky-300 hover:border-sky-300 hover:bg-sky-400/20 transition-all cursor-pointer uppercase"
              title="Upstream Repository Acknowledgements"
            >
              <GitBranch className="h-3.5 w-3.5 text-sky-400" />
              <span className="hidden md:inline text-xs">CREDITS</span>
            </button>
          )}

          {/* Setup Guide */}
          <button
            onClick={onOpenGuide}
            className="flex items-center justify-center h-7.5 w-7.5 sm:h-8 sm:w-8 rounded-none border border-white/20 bg-black text-neutral-400 hover:text-white hover:border-sky-400 hover:bg-white/10 transition-all cursor-pointer"
            title="Desktop & Mobile Setup Guide"
          >
            <Terminal className="h-3.5 w-3.5" />
          </button>

          {/* GitHub Source Link */}
          <a
            href="https://github.com/vrsn001/void-walls"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 rounded-none border border-white/20 bg-black px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-bold text-neutral-300 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all"
            title="Inspect source repository on GitHub"
          >
            <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
            <span className="hidden lg:inline text-xs">SRC</span>
          </a>
        </div>
      </div>
    </header>
  );
};
