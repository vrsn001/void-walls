import { useState, useMemo, useEffect, useCallback, useDeferredValue } from 'react';
import rawWallpapersData from './data/wallpapers.json';
import type { Wallpaper, MediaFilterType, SortOption, LayoutMode, ToastMessage } from './types';
import { Header } from './components/Header';
import { HeroSpotlight } from './components/HeroSpotlight';
import { CyberHudBanner } from './components/CyberHudBanner';
import { RepoCreditsModal } from './components/RepoCreditsModal';
import { FilterBar } from './components/FilterBar';
import { WallpaperCard } from './components/WallpaperCard';
import { LightboxModal } from './components/LightboxModal';
import { GuideModal } from './components/GuideModal';
import { Toast } from './components/Toast';
import { triggerDownload } from './utils/download';
import { ArrowUp, RefreshCw, AlertCircle, Database } from 'lucide-react';

const wallpapersData = rawWallpapersData as Wallpaper[];
const PAGE_SIZE = 36;

export function App() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [activeType, setActiveType] = useState<MediaFilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [lightboxWallpaper, setLightboxWallpaper] = useState<Wallpaper | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // LocalStorage favorites
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('voidwalls_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('voidwalls_favorites', JSON.stringify(favoriteIds));
    } catch (e) {
      console.warn('Failed to save favorites to localStorage:', e);
    }
  }, [favoriteIds]);

  // Toast dispatch
  const showToast = useCallback((text: string, type: 'success' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  // Toggle favorite
  const handleToggleFavorite = useCallback((wallpaper: Wallpaper) => {
    setFavoriteIds((prev) => {
      const exists = prev.includes(wallpaper.id);
      if (exists) {
        showToast(`REMOVED: "${wallpaper.title}"`, 'info');
        return prev.filter((id) => id !== wallpaper.id);
      } else {
        showToast(`SAVED TO COLLECTION: "${wallpaper.title}"`);
        return [...prev, wallpaper.id];
      }
    });
  }, [showToast]);

  // Download handler
  const handleDownload = useCallback(async (wallpaper: Wallpaper) => {
    showToast(`DOWNLOADING: "${wallpaper.title}" (${wallpaper.sizeFormatted})`);
    await triggerDownload(wallpaper);
  }, [showToast]);

  // Animated wallpapers subset
  const animatedWallpapers = useMemo(() => {
    return wallpapersData.filter((w) => w.type === 'animated');
  }, []);

  // Vertical phone wallpapers subset
  const verticalWallpapersCount = useMemo(() => {
    return wallpapersData.filter((w) => w.category === 'phone-vertical' || (w.tags && w.tags.includes('vertical'))).length;
  }, []);

  // Category counts
  const categoriesWithCounts = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>();
    wallpapersData.forEach((w) => {
      const existing = map.get(w.category);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(w.category, { label: w.categoryLabel, count: 1 });
      }
    });
    return Array.from(map.entries())
      .map(([id, info]) => ({ id, label: info.label, count: info.count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  // Filtered & Sorted Wallpapers (Fast debounced search)
  const filteredWallpapers = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    const result = wallpapersData.filter((w) => {
      if (activeType === 'animated' && w.type !== 'animated') return false;
      if (activeType === 'static' && w.type !== 'static') return false;
      if (activeType === 'vertical' && !(w.category === 'phone-vertical' || (w.tags && w.tags.includes('vertical')))) return false;
      if (activeType === 'favorites' && !favoriteIds.includes(w.id)) return false;

      if (selectedCategory !== 'all' && w.category !== selectedCategory) return false;

      if (query) {
        const matchTitle = w.title.toLowerCase().includes(query);
        const matchCategory = w.category.toLowerCase().includes(query) || w.categoryLabel.toLowerCase().includes(query);
        const matchTags = w.tags.some((t) => t.toLowerCase().includes(query));
        const matchFormat = w.format.toLowerCase().includes(query);
        if (!matchTitle && !matchCategory && !matchTags && !matchFormat) {
          return false;
        }
      }

      return true;
    });

    if (sortOption === 'featured') {
      result.sort((a, b) => {
        if (a.type === 'animated' && b.type !== 'animated') return -1;
        if (b.type === 'animated' && a.type !== 'animated') return 1;
        return b.sizeBytes - a.sizeBytes;
      });
    } else if (sortOption === 'size-desc') {
      result.sort((a, b) => b.sizeBytes - a.sizeBytes);
    } else if (sortOption === 'size-asc') {
      result.sort((a, b) => a.sizeBytes - b.sizeBytes);
    } else if (sortOption === 'title-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [deferredSearch, activeType, selectedCategory, sortOption, favoriteIds]);

  // Reset page count when filters change without cascading render effect
  const filterKey = `${deferredSearch}-${activeType}-${selectedCategory}-${sortOption}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  // Random pick handler
  const handleRandomPick = useCallback(() => {
    if (filteredWallpapers.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredWallpapers.length);
    const chosen = filteredWallpapers[randomIndex];
    setLightboxWallpaper(chosen);
    showToast(`DISCOVERED: "${chosen.title}"`);
  }, [filteredWallpapers, showToast]);

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    setSearch('');
    setActiveType('all');
    setSelectedCategory('all');
    setSortOption('featured');
    showToast('FILTERS RESET TO DEFAULT');
  }, [showToast]);

  const visibleWallpapers = filteredWallpapers.slice(0, visibleCount);
  const hasMore = visibleCount < filteredWallpapers.length;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#f8fafc] flex flex-col font-sans selection:bg-white/20 selection:text-white">
      {/* Header */}
      <Header
        search={search}
        onSearchChange={setSearch}
        favoritesCount={favoriteIds.length}
        activeFilter={activeType}
        onFilterChange={setActiveType}
        onRandomClick={handleRandomPick}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenCredits={() => setIsCreditsOpen(true)}
        totalCount={wallpapersData.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20">
        {/* Cyberpunk Matrix HUD Banner & Cinema Stage */}
        {!search && activeType !== 'favorites' && selectedCategory === 'all' && (
          <>
            <CyberHudBanner
              totalCount={wallpapersData.length}
              liveCount={animatedWallpapers.length}
              onOpenCredits={() => setIsCreditsOpen(true)}
            />
            <HeroSpotlight
              animatedWallpapers={animatedWallpapers}
              onOpenLightbox={setLightboxWallpaper}
              onDownload={handleDownload}
            />
          </>
        )}

        {/* Filter Bar */}
        <FilterBar
          activeType={activeType}
          onTypeChange={setActiveType}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categoriesWithCounts}
          sortOption={sortOption}
          onSortChange={setSortOption}
          layoutMode={layoutMode}
          onLayoutChange={setLayoutMode}
          totalFilteredCount={filteredWallpapers.length}
          totalWallpapersCount={wallpapersData.length}
          animatedCount={animatedWallpapers.length}
          verticalCount={verticalWallpapersCount}
          favoritesCount={favoriteIds.length}
          onResetFilters={handleResetFilters}
        />

        {/* Gallery Grid */}
        <section className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 font-mono">
          {visibleWallpapers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-none border border-white/10 bg-black p-12 text-center">
              <AlertCircle className="h-8 w-8 text-neutral-500 mb-3" />
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                NO_WALLPAPERS_FOUND
              </h3>
              <p className="mt-1 text-[11px] text-neutral-400 max-w-sm">
                No items match your active search terms or collection filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-5 rounded-none bg-sky-400 px-5 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-sky-300 transition-all border border-sky-300"
              >
                RESET_ALL_FILTERS
              </button>
            </div>
          ) : (
            <>
              {/* Responsive Cards Grid */}
              <div
                className={
                  layoutMode === 'masonry'
                    ? 'columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4'
                    : layoutMode === 'spacious'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
                    : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                }
              >
                {visibleWallpapers.map((wallpaper, index) => (
                  <div key={wallpaper.id} className={layoutMode === 'masonry' ? 'break-inside-avoid mb-4' : ''}>
                    <WallpaperCard
                      wallpaper={wallpaper}
                      isFavorite={favoriteIds.includes(wallpaper.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onOpenLightbox={setLightboxWallpaper}
                      onDownload={handleDownload}
                      priority={index < 8}
                    />
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-12 flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    className="flex items-center gap-2 rounded-none border border-sky-400/40 bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-sky-300 hover:bg-sky-400 hover:text-black hover:border-sky-300 transition-all shadow-xl"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>
                      LOAD_MORE_ASSETS ({filteredWallpapers.length - visibleCount}_REMAINING)
                    </span>
                  </button>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    INDEX_WINDOW: {visibleCount} // {filteredWallpapers.length}
                  </span>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* AMOLED Minimalist Footer */}
      <footer className="border-t border-white/[0.06] bg-black py-8 text-neutral-400 text-xs">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-white">
              VOID//WALLS
            </span>
            <span className="text-neutral-500 text-[11px]">
              2,479+ Curated Assets
            </span>
          </div>

          {/* Sources breakdown & Acknowledgements */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500 font-mono">
            <button
              onClick={() => setIsCreditsOpen(true)}
              className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <Database className="h-3 w-3 text-cyan-400" />
              <span>vrsn001/wallsbyme (1,653)</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setIsCreditsOpen(true)}
              className="hover:text-neutral-300 transition-colors cursor-pointer"
            >
              DenverCoder1 (336)
            </button>
            <span>·</span>
            <button
              onClick={() => setIsCreditsOpen(true)}
              className="hover:text-neutral-300 transition-colors cursor-pointer"
            >
              vyrx-dev (490)
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <button
              onClick={() => setIsCreditsOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Repo Credits
            </button>
            <span>·</span>
            <button onClick={() => setIsGuideOpen(true)} className="hover:text-white transition-colors cursor-pointer">
              Setup Guide
            </button>
            <span>·</span>
            <button onClick={scrollToTop} className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <ArrowUp className="h-3.5 w-3.5" />
              <span>Top</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Upstream Repo Credits Modal */}
      <RepoCreditsModal isOpen={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} />

      {/* Lightbox Modal */}
      <LightboxModal
        wallpaper={lightboxWallpaper}
        allWallpapers={filteredWallpapers}
        onClose={() => setLightboxWallpaper(null)}
        onSelectWallpaper={setLightboxWallpaper}
        isFavorite={lightboxWallpaper ? favoriteIds.includes(lightboxWallpaper.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onDownload={handleDownload}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Setup Guide Modal */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Toast Notifications */}
      <Toast toasts={toasts} />
    </div>
  );
}

export default App;
