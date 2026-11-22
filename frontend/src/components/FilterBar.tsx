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
        className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs transition-all duration-200 ${
          isActive
            ? 'bg-white text-black font-semibold shadow-sm'
            : 'border border-white/[0.07] bg-white/[0.02] text-neutral-400 hover:text-white hover:bg-white/[0.06] hover:border-white/15'
        }`}
      >
        {icon}
        <span>{label}</span>
        <span
          className={`rounded-full px-1.5 py-0.2 text-[10px] ${
            isActive ? 'bg-black/15 text-black font-bold' : 'bg-white/[0.08] text-neutral-400'
          }`}
        >
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-6 pb-2 sm:px-6">
      {/* Top Type Filter Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-3.5">
        {/* Type Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {typeBtn('all', 'All Wallpapers', totalWallpapersCount)}
          {typeBtn('animated', 'Live Loops', animatedCount, <Film className="h-3.5 w-3.5" />)}
          {typeBtn('vertical', 'Mobile 9:16', verticalCount, <Smartphone className="h-3.5 w-3.5" />)}
          {typeBtn('static', 'Static HQ', totalWallpapersCount - animatedCount, <ImageIcon className="h-3.5 w-3.5" />)}
          {typeBtn('favorites', 'Saved', favoritesCount, <Heart className="h-3.5 w-3.5" />)}
        </div>

        {/* Right Sort & Layout Toggles */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1 hover:border-white/20 transition-all">
            <ArrowDownWideNarrow className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent py-0.5 text-xs font-medium text-neutral-300 focus:outline-none cursor-pointer"
            >
              <option value="featured" className="bg-[#0c0d12] text-white">Featured</option>
              <option value="size-desc" className="bg-[#0c0d12] text-white">Largest File</option>
              <option value="size-asc" className="bg-[#0c0d12] text-white">Lightweight</option>
              <option value="title-asc" className="bg-[#0c0d12] text-white">Title A-Z</option>
              <option value="newest" className="bg-[#0c0d12] text-white">Index Order</option>
            </select>
          </div>

          {/* Layout Mode */}
          <div className="hidden sm:flex items-center rounded-full border border-white/[0.07] bg-white/[0.02] p-0.5">
            {([['masonry', Columns], ['grid', Grid3X3], ['spacious', LayoutGrid]] as const).map(([mode, Icon]) => (
              <button
                key={mode}
                onClick={() => onLayoutChange(mode)}
                className={`rounded-full p-1.5 transition-colors ${
                  layoutMode === mode
                    ? 'bg-white/15 text-white'
                    : 'text-neutral-500 hover:text-white'
                }`}
                title={`Layout: ${mode}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Horizontal Scrolling Pills */}
      <div className="relative mt-3">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none scroll-smooth">
          <button
            onClick={() => onCategoryChange('all')}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs transition-all ${
              selectedCategory === 'all'
                ? 'bg-white/10 text-white border border-white/20 font-medium'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
            }`}
          >
            All Collections ({totalWallpapersCount})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs transition-all ${
                selectedCategory === cat.id
                  ? 'bg-white/10 text-white border border-white/20 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-[10px] text-neutral-500">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Status Strip */}
      <div className="mt-2.5 flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-white font-medium">{totalFilteredCount.toLocaleString()}</strong> of {totalWallpapersCount.toLocaleString()} wallpapers
          </span>
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
