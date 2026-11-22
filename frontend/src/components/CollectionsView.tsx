import React, { useState, useMemo } from 'react';
import { FolderTree, Search, ArrowRight } from 'lucide-react';
import type { Wallpaper } from '../types';
import { getThumbnailUrl } from '../utils/cdn';

interface CollectionsViewProps {
  wallpapers: Wallpaper[];
  onSelectCategory: (category: string) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  wallpapers,
  onSelectCategory,
}) => {
  const [catSearch, setCatSearch] = useState('');

  // Group wallpapers into category metadata
  const categories = useMemo(() => {
    const map = new Map<string, { id: string; label: string; count: number; cover: Wallpaper; formats: Set<string> }>();

    for (const w of wallpapers) {
      const existing = map.get(w.category);
      if (!existing) {
        map.set(w.category, {
          id: w.category,
          label: w.categoryLabel,
          count: 1,
          cover: w,
          formats: new Set([w.format]),
        });
      } else {
        existing.count++;
        existing.formats.add(w.format);
      }
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [wallpapers]);

  const filteredCategories = useMemo(() => {
    if (!catSearch.trim()) return categories;
    const query = catSearch.toLowerCase();
    return categories.filter(
      (c) => c.label.toLowerCase().includes(query) || c.id.toLowerCase().includes(query)
    );
  }, [categories, catSearch]);

  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-4 pb-8 sm:px-6 font-mono">
      {/* Category Directory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase">
            <FolderTree className="h-4 w-4" />
            <span>CURATED DIRECTORY // {categories.length}_ARCHIVES</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight mt-1 font-sans">
            {categories.length} THEMATIC COLLECTION VAULTS
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            High-resolution curated archives organized by aesthetic, theme, and colorway.
          </p>
        </div>

        {/* Category Search */}
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
          <input
            type="text"
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
            placeholder="FILTER_VAULTS // anime, nord..."
            className="w-full rounded-none border border-white/15 bg-black py-1.5 pl-8 pr-3 text-xs text-neutral-200 placeholder-neutral-500 font-mono focus:border-sky-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="group relative flex flex-col justify-between overflow-hidden rounded-none border border-white/15 bg-[#050508] hover:border-sky-400 transition-all cursor-pointer hover:shadow-xl"
          >
            {/* Cover Image */}
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <img
                src={getThumbnailUrl(cat.cover, 480) || cat.cover.cdnUrl}
                alt={cat.label}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              {/* Asset Count Badge */}
              <div className="absolute top-2 right-2 rounded-none border border-sky-400/50 bg-black/80 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                {cat.count} ASSETS
              </div>
            </div>

            {/* Content */}
            <div className="p-3 bg-black flex items-center justify-between border-t border-white/10">
              <div>
                <h3 className="text-xs font-bold text-white uppercase group-hover:text-sky-300 transition-colors">
                  {cat.label}
                </h3>
                <span className="text-[10px] text-neutral-500 font-mono">
                  VAULT: {cat.id}
                </span>
              </div>

              <div className="flex h-6 w-6 items-center justify-center rounded-none border border-white/20 bg-black text-neutral-400 group-hover:border-sky-400 group-hover:text-sky-300 group-hover:bg-sky-400/10 transition-all">
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
