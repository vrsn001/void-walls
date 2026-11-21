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

  const typeBtn = (type: MediaFilterType, label: string, count: number, icon?: React.ReactNode) => (
    <button
      onClick={() => onTypeChange(type)}
      className={`flex items-center gap-1.5 border-2 px-3 py-1.5 font-[var(--font-mono)] text-xs font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0_#000] ${
        activeType === type
          ? 'border-[#ff5722] bg-[#ff5722] text-black shadow-[2px_2px_0_#fff]'
          : 'border-[#232c3f] bg-[#0c0f17] text-white hover:border-[#ff5722] hover:bg-[#121622]'
      }`}
    >
      {icon}
      <span>{label}</span>
      <span className="bg-black/30 px-1 py-0.2 text-[10px] text-[#ff5722] font-mono">
        {count}
      </span>
    </button>
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-5 pb-2 sm:px-6">
      {/* Top Type Filter Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b-2 border-[#232c3f] pb-3">
        {/* Type Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {typeBtn('all', 'ALL ASSETS', totalWallpapersCount)}
          {typeBtn('animated', 'LIVE VIDEO', animatedCount, <Film className="h-3.5 w-3.5" />)}
          {typeBtn('vertical', 'PHONE 9:16', verticalCount, <Smartphone className="h-3.5 w-3.5" />)}
          {typeBtn('static', 'STATIC HQ', totalWallpapersCount - animatedCount, <ImageIcon className="h-3.5 w-3.5" />)}
          {typeBtn('favorites', 'SAVED', favoritesCount, <Heart className="h-3.5 w-3.5 fill-current" />)}
        </div>

        {/* Right Sort & Layout Toggles */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5">
            <ArrowDownWideNarrow className="h-3.5 w-3.5 text-[#8391ac]" />
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="border-2 border-[#232c3f] bg-[#0c0f17] px-2.5 py-1.5 font-[var(--font-mono)] text-xs font-bold uppercase text-white shadow-[2px_2px_0_#000] focus:border-[#ff5722] focus:outline-none cursor-pointer"
            >
              <option value="featured">SORT: FEATURED</option>
              <option value="size-desc">SORT: LARGEST FILE</option>
              <option value="size-asc">SORT: LIGHTWEIGHT</option>
              <option value="title-asc">SORT: TITLE A-Z</option>
              <option value="newest">SORT: CATALOG INDEX</option>
            </select>
          </div>

          {/* Layout Mode */}
          <div className="hidden sm:flex items-center border-2 border-[#232c3f] bg-[#0c0f17] shadow-[2px_2px_0_#000]">
            {([['masonry', Columns], ['grid', Grid3X3], ['spacious', LayoutGrid]] as const).map(([mode, Icon]) => (
              <button
                key={mode}
                onClick={() => onLayoutChange(mode)}
                className={`p-1.5 transition-colors border-r last:border-r-0 border-[#232c3f] ${
                  layoutMode === mode ? 'bg-[#ff5722] text-black' : 'text-[#8391ac] hover:text-white hover:bg-[#161c28]'
                }`}
                title={`Layout: ${mode}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="relative mt-3">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none scroll-smooth">
          <button
            onClick={() => onCategoryChange('all')}
            className={`whitespace-nowrap border-2 px-3 py-1 font-[var(--font-mono)] text-[11px] font-bold uppercase tracking-wider transition-all ${
              selectedCategory === 'all'
                ? 'border-[#ff5722] bg-[#ff5722]/15 text-[#ff5722]'
                : 'border-[#232c3f] bg-[#0c0f17] text-[#8391ac] hover:border-[#ff5722]/60 hover:text-white'
            }`}
          >
            ALL COLLECTIONS ({totalWallpapersCount})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap border-2 px-3 py-1 font-[var(--font-mono)] text-[11px] font-bold uppercase tracking-wider transition-all ${
                selectedCategory === cat.id
                  ? 'border-[#ff5722] bg-[#ff5722]/15 text-[#ff5722]'
                  : 'border-[#232c3f] bg-[#0c0f17] text-[#8391ac] hover:border-[#ff5722]/60 hover:text-white'
              }`}
            >
              <span>{cat.label}</span>
              <span className="font-[var(--font-mono)] text-[10px] text-[#586888]">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Status Strip */}
      <div className="mt-2.5 flex items-center justify-between font-[var(--font-mono)] text-[11px] text-[#8391ac] uppercase tracking-wider">
        <div>
          SHOWING <span className="font-bold text-white">{totalFilteredCount}</span> OF{' '}
          <span className="text-[#cbd5e1]">{totalWallpapersCount}</span> ASSETS
          {selectedCategory !== 'all' && (
            <span className="ml-1 text-[#ff5722]">
              → {categories.find((c) => c.id === selectedCategory)?.label || selectedCategory}
            </span>
          )}
        </div>

        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[#ff5722] hover:underline"
          >
            <X className="h-3.5 w-3.5" />
            <span>RESET FILTERS</span>
          </button>
        )}
      </div>
    </div>
  );
};
