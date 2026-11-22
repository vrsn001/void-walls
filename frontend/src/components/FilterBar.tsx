import React from 'react';
import { LayoutGrid, Grid3X3, Columns, Film, Image as ImageIcon, Heart, ArrowDownWideNarrow, X, Smartphone } from 'lucide-react';
import type { MediaFilterType, SortOption, LayoutMode } from '../types';

interface FilterBarProps {
  activeType: MediaFilterType;
  onTypeChange: (type: MediaFilterType) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: { id: string; label: string; count: number }[];
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  layoutMode: LayoutMode;
  onLayoutChange: (mode: LayoutMode) => void;
  totalFilteredCount: number;
  totalWallpapersCount: number;
  animatedCount: number;
  verticalCount: number;
  favoritesCount: number;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeType,
  onTypeChange,
  selectedCategory,
  onCategoryChange,
  categories,
  sortOption,
  onSortChange,
  layoutMode,
  onLayoutChange,
  totalFilteredCount,
  totalWallpapersCount,
  animatedCount,
  verticalCount,
  favoritesCount,
  onResetFilters,
}) => {
  const isFiltered = activeType !== 'all' || selectedCategory !== 'all' || sortOption !== 'featured';

  const typeBtn = (type: MediaFilterType, label: string, count: number, icon?: React.ReactNode) => {
    const isActive = activeType === type;
    return (
      <button
        onClick={() => onTypeChange(type)}
        className={`flex items-center gap-1.5 rounded-none px-3 py-1.5 text-xs transition-all uppercase tracking-wider font-mono ${
          isActive
            ? 'bg-sky-400 text-black font-bold border border-sky-300'
            : 'border border-white/15 bg-black text-neutral-400 hover:text-white hover:border-white/30'
        }`}
      >
        {icon}
        <span>{label}</span>
        <span
          className={`px-1 py-0.2 text-[9px] font-mono font-bold ${
            isActive ? 'bg-black text-sky-300' : 'bg-white/10 text-neutral-300'
          }`}
        >
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-5 pb-2 sm:px-6 font-mono">
      {/* Top Type Filter Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-3">
        {/* Type Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {typeBtn('all', 'ALL', totalWallpapersCount)}
          {typeBtn('animated', '60FPS_LOOPS', animatedCount, <Film className="h-3 w-3" />)}
          {typeBtn('vertical', '9:16_VERTICAL', verticalCount, <Smartphone className="h-3 w-3" />)}
          {typeBtn('static', 'STATIC_HQ', totalWallpapersCount - animatedCount, <ImageIcon className="h-3 w-3" />)}
          {typeBtn('favorites', 'SAVED', favoritesCount, <Heart className="h-3 w-3" />)}
        </div>

        {/* Right Sort & Layout Toggles */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 rounded-none border border-white/20 bg-black px-2.5 py-1 hover:border-sky-400 transition-all">
            <ArrowDownWideNarrow className="h-3 w-3 text-neutral-400 shrink-0" />
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent py-0.5 text-xs font-mono font-bold uppercase text-neutral-200 focus:outline-none cursor-pointer"
            >
              <option value="featured" className="bg-black text-white">SORT: FEATURED</option>
              <option value="size-desc" className="bg-black text-white">SORT: LARGEST_FILE</option>
              <option value="size-asc" className="bg-black text-white">SORT: LIGHTWEIGHT</option>
              <option value="title-asc" className="bg-black text-white">SORT: TITLE_A_Z</option>
              <option value="newest" className="bg-black text-white">SORT: INDEX_ORDER</option>
            </select>
          </div>

          {/* Layout Mode */}
          <div className="hidden sm:flex items-center rounded-none border border-white/20 bg-black p-0.5">
            {([['masonry', Columns], ['grid', Grid3X3], ['spacious', LayoutGrid]] as const).map(([mode, Icon]) => (
              <button
                key={mode}
                onClick={() => onLayoutChange(mode)}
                className={`rounded-none p-1.5 transition-colors ${
                  layoutMode === mode
                    ? 'bg-sky-400 text-black'
                    : 'text-neutral-500 hover:text-white'
                }`}
                title={`Layout: ${mode}`}
              >
                <Icon className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Horizontal Scrolling Pills */}
      <div className="relative mt-2.5">
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none scroll-smooth">
          <button
            onClick={() => onCategoryChange('all')}
            className={`whitespace-nowrap rounded-none px-2.5 py-1 text-[11px] font-mono transition-all uppercase tracking-wider ${
              selectedCategory === 'all'
                ? 'bg-white/10 text-sky-300 border border-sky-400/60 font-bold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            ALL_COLLECTIONS ({totalWallpapersCount})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-none px-2.5 py-1 text-[11px] font-mono transition-all uppercase tracking-wider ${
                selectedCategory === cat.id
                  ? 'bg-white/10 text-sky-300 border border-sky-400/60 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-[9px] text-neutral-500 font-mono">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Status Strip */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
        <div className="flex items-center gap-2">
          <span>
            QUERY_RESULTS: <strong className="text-white font-bold">{totalFilteredCount.toLocaleString()}</strong> // {totalWallpapersCount.toLocaleString()} ASSETS
          </span>
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 rounded-none border border-rose-500/40 bg-rose-500/10 px-1.5 py-0.2 text-[10px] text-rose-300 hover:bg-rose-500/20 transition-colors uppercase font-bold"
            >
              <X className="h-2.5 w-2.5" />
              <span>RESET</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
