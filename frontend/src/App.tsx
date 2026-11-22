import { useState, useMemo, useEffect, useCallback, useDeferredValue, lazy, Suspense } from 'react';
import type { Wallpaper, MediaFilterType, SortOption, LayoutMode, ToastMessage } from './types';
import { Header } from './components/Header';
import { CyberHudBanner } from './components/CyberHudBanner';
import { SubNavTabs, type SubPageTab } from './components/SubNavTabs';
import { StaticHeroShowcase } from './components/StaticHeroShowcase';
import { HeroSpotlight } from './components/HeroSpotlight';
import { CollectionsView } from './components/CollectionsView';
import { FilterBar } from './components/FilterBar';
import { WallpaperCard } from './components/WallpaperCard';
import { Toast } from './components/Toast';
import { triggerDownload } from './utils/download';
import { ArrowUp, RefreshCw, AlertCircle, Database } from 'lucide-react';

// Code-split heavy modals with React.lazy
const LightboxModal = lazy(() => import('./components/LightboxModal').then((m) => ({ default: m.LightboxModal })));
const RepoCreditsModal = lazy(() => import('./components/RepoCreditsModal').then((m) => ({ default: m.RepoCreditsModal })));
const GuideModal = lazy(() => import('./components/GuideModal').then((m) => ({ default: m.GuideModal })));

const PAGE_SIZE = 36;

export function App() {
  const [wallpapersData, setWallpapersData] = useState<Wallpaper[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [activeTab, setActiveTab] = useState<SubPageTab>('static');
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

  // Dynamic import of wallpapers dataset for instant initial page mount
  useEffect(() => {
    import('./data/wallpapers.json').then((module) => {
      setWallpapersData(module.default as Wallpaper[]);
      setIsLoadingData(false);
    });
  }, []);

  // Hash-based sub-page URL synchronization
  useEffect(() => {
    const handleHashSync = () => {
      const hash = window.location.hash.toLowerCase().replace('#', '');
      if (hash.startsWith('collection/')) {
        const catSlug = hash.replace('collection/', '');
        setActiveTab('collections');
        setSelectedCategory(catSlug);
      } else if (hash === 'live' || hash === 'videos') {
        setActiveTab('live');
        setSelectedCategory('all');
      } else if (hash === 'mobile' || hash === 'vertical') {
        setActiveTab('mobile');
        setSelectedCategory('all');
      } else if (hash === 'collections') {
        setActiveTab('collections');
        setSelectedCategory('all');
      } else if (hash === 'saved') {
        setActiveTab('saved');
        setSelectedCategory('all');
      } else {
        setActiveTab('static');
        setSelectedCategory('all');
      }
    };

    handleHashSync();
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, []);

  const handleTabChange = useCallback((tab: SubPageTab) => {
    setActiveTab(tab);
    if (tab === 'collections') {
      window.location.hash = selectedCategory !== 'all' ? `collection/${selectedCategory}` : 'collections';
    } else if (tab === 'static') {
      setSelectedCategory('all');
      window.location.hash = 'static';
    } else {
      setSelectedCategory('all');
      window.location.hash = tab;
    }
  }, [selectedCategory]);

  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      window.location.hash = 'collections';
    } else {
      window.location.hash = `collection/${category}`;
    }
  }, []);

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
        showToast(`SAVED TO VAULT: "${wallpaper.title}"`);
        return [...prev, wallpaper.id];
      }
    });
  }, [showToast]);

  // Download handler
  const handleDownload = useCallback(async (wallpaper: Wallpaper) => {
    showToast(`INITIATING: "${wallpaper.title}" (${wallpaper.sizeFormatted})`);
    await triggerDownload(wallpaper);
  }, [showToast]);

  // Subsets
  const staticWallpapers = useMemo(() => {
    return wallpapersData.filter((w) => w.type !== 'animated');
  }, [wallpapersData]);

  const animatedWallpapers = useMemo(() => {
    return wallpapersData.filter((w) => w.type === 'animated');
  }, [wallpapersData]);

  const verticalWallpapers = useMemo(() => {
    return wallpapersData.filter(
      (w) => w.category === 'phone-vertical' || (w.tags && w.tags.includes('vertical'))
    );
  }, [wallpapersData]);

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
  }, [wallpapersData]);

  // Active dataset according to current sub-page tab
  const tabBaseWallpapers = useMemo(() => {
    if (activeTab === 'live') return animatedWallpapers;
    if (activeTab === 'mobile') return verticalWallpapers;
    if (activeTab === 'saved') return wallpapersData.filter((w) => favoriteIds.includes(w.id));
    if (activeTab === 'collections') {
      if (selectedCategory !== 'all') {
        return wallpapersData.filter((w) => w.category === selectedCategory);
      }
      return staticWallpapers;
    }
    // Default: 'static'
    return staticWallpapers;
  }, [activeTab, selectedCategory, staticWallpapers, animatedWallpapers, verticalWallpapers, wallpapersData, favoriteIds]);

  // Filtered & Sorted Wallpapers
  const filteredWallpapers = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    const result = tabBaseWallpapers.filter((w) => {
      if (selectedCategory !== 'all' && activeTab !== 'collections' && w.category !== selectedCategory) {
        return false;
      }

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
        if (a.width && b.width && a.width !== b.width) return b.width - a.width;
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
  }, [tabBaseWallpapers, deferredSearch, selectedCategory, activeTab, sortOption]);

  // Reset page count when filters change without cascading render
  const filterKey = `${deferredSearch}-${activeTab}-${selectedCategory}-${sortOption}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  const visibleWallpapers = filteredWallpapers.slice(0, visibleCount);
  const hasMore = visibleCount < filteredWallpapers.length;

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSortOption('featured');
    setVisibleCount(PAGE_SIZE);
  };

  const handleRandomClick = () => {
    if (filteredWallpapers.length === 0) return;
    const randomItem = filteredWallpapers[Math.floor(Math.random() * filteredWallpapers.length)];
    setLightboxWallpaper(randomItem);
    showToast(`SHUFFLE: "${randomItem.title}"`, 'info');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-sky-400/30 selection:text-white font-mono">
      {/* Top Navigation */}
      <Header
        search={search}
        onSearchChange={setSearch}
        favoritesCount={favoriteIds.length}
        activeFilter={activeTab === 'saved' ? 'favorites' : 'all'}
        onFilterChange={(f: MediaFilterType) => handleTabChange(f === 'favorites' ? 'saved' : 'static')}
        onRandomClick={handleRandomClick}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenCredits={() => setIsCreditsOpen(true)}
        totalCount={wallpapersData.length}
      />

      {/* Main Container */}
      <main className="pb-24">
        {/* Matrix Cyber HUD Banner */}
        <CyberHudBanner
          totalCount={wallpapersData.length}
          liveCount={animatedWallpapers.length}
          onOpenCredits={() => setIsCreditsOpen(true)}
          onNavigateTab={handleTabChange}
        />

        {/* Sub-Pages Navigation Tabs */}
        <SubNavTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          counts={{
            static: staticWallpapers.length,
            live: animatedWallpapers.length,
            mobile: verticalWallpapers.length,
            collections: categoriesWithCounts.length,
            saved: favoriteIds.length,
          }}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* LOADING DATA STATE */}
        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center p-24 text-neutral-500 font-mono text-xs">
            <div className="h-6 w-6 border-2 border-sky-400 border-t-transparent animate-spin mb-3" />
            <span className="uppercase tracking-widest text-sky-400 font-bold">INITIALIZING_VAULT // 2,479_ASSETS...</span>
          </div>
        ) : (
          <>
            {/* SUB-PAGE 1: STATIC WALLPAPERS (STATIC ON TOP!) */}
            {activeTab === 'static' && selectedCategory === 'all' && !search && (
              <StaticHeroShowcase
                wallpapers={staticWallpapers}
                onOpenLightbox={setLightboxWallpaper}
                onDownload={handleDownload}
              />
            )}

            {/* SUB-PAGE 2: LIVE 60FPS LOOPS THEATER */}
            {activeTab === 'live' && (
              <HeroSpotlight
                animatedWallpapers={animatedWallpapers}
                onOpenLightbox={setLightboxWallpaper}
                onDownload={handleDownload}
              />
            )}

            {/* SUB-PAGE 4: COLLECTIONS DIRECTORY VIEW */}
            {activeTab === 'collections' && selectedCategory === 'all' ? (
              <CollectionsView
                wallpapers={wallpapersData}
                onSelectCategory={handleSelectCategory}
              />
            ) : (
              <>
                {/* Filter and Sorting Controls */}
                <FilterBar
                  activeType={activeTab === 'live' ? 'animated' : activeTab === 'mobile' ? 'vertical' : activeTab === 'saved' ? 'favorites' : 'all'}
                  onTypeChange={(t) => {
                    if (t === 'animated') handleTabChange('live');
                    else if (t === 'vertical') handleTabChange('mobile');
                    else if (t === 'favorites') handleTabChange('saved');
                    else handleTabChange('static');
                  }}
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleSelectCategory}
                  categories={categoriesWithCounts}
                  sortOption={sortOption}
                  onSortChange={setSortOption}
                  layoutMode={layoutMode}
                  onLayoutChange={setLayoutMode}
                  totalFilteredCount={filteredWallpapers.length}
                  totalWallpapersCount={tabBaseWallpapers.length}
                  animatedCount={animatedWallpapers.length}
                  verticalCount={verticalWallpapers.length}
                  favoritesCount={favoriteIds.length}
                  onResetFilters={handleResetFilters}
                />

                {/* Wallpapers Gallery Grid */}
                <section className="mx-auto max-w-[1440px] px-4 pt-3 sm:px-6">
                  {visibleWallpapers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-none border border-white/10 bg-black p-12 text-center">
                      <AlertCircle className="h-8 w-8 text-neutral-500 mb-3" />
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                        NO_WALLPAPERS_FOUND
                      </h3>
                      <p className="mt-1 text-[11px] text-neutral-400 max-w-sm">
                        No assets match your query in this sub-page archive.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-5 rounded-none bg-sky-400 px-5 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-sky-300 transition-all border border-sky-300"
                      >
                        RESET_FILTERS
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Responsive Grid */}
                      <div
                        className={
                          layoutMode === 'masonry'
                            ? 'columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4'
                            : layoutMode === 'spacious'
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
                            : activeTab === 'mobile'
                            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5'
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
              </>
            )}
          </>
        )}
      </main>

      {/* AMOLED Minimalist Footer */}
      <footer className="border-t border-white/10 bg-black py-7 text-neutral-400 text-xs font-mono">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white uppercase tracking-tight font-sans">
              VOID//WALLS
            </span>
            <span className="text-neutral-500 text-[10px]">
              [ 2,479+_CURATED_VAULT ]
            </span>
          </div>

          {/* Sources breakdown & Acknowledgements */}
          <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-neutral-500">
            <button
              onClick={() => setIsCreditsOpen(true)}
              className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors cursor-pointer uppercase"
            >
              <Database className="h-2.5 w-2.5" />
              <span>vrsn001/wallsbyme (1,653)</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setIsCreditsOpen(true)}
              className="hover:text-neutral-300 transition-colors cursor-pointer uppercase"
            >
              DenverCoder1 (336)
            </button>
            <span>·</span>
            <button
              onClick={() => setIsCreditsOpen(true)}
              className="hover:text-neutral-300 transition-colors cursor-pointer uppercase"
            >
              vyrx-dev (490)
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setIsCreditsOpen(true)}
              className="text-sky-400 hover:text-sky-300 transition-colors cursor-pointer uppercase font-bold"
            >
              CREDITS
            </button>
            <span>·</span>
            <button onClick={() => setIsGuideOpen(true)} className="hover:text-white transition-colors cursor-pointer uppercase font-bold">
              GUIDE
            </button>
            <span>·</span>
            <button onClick={scrollToTop} className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer uppercase font-bold">
              <ArrowUp className="h-3 w-3" />
              <span>TOP</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Upstream Repo Credits Modal (Lazy Loaded) */}
      <Suspense fallback={null}>
        {isCreditsOpen && (
          <RepoCreditsModal isOpen={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} />
        )}
      </Suspense>

      {/* Lightbox Modal (Lazy Loaded) */}
      <Suspense fallback={null}>
        {lightboxWallpaper && (
          <LightboxModal
            wallpaper={lightboxWallpaper}
            allWallpapers={filteredWallpapers}
            onClose={() => setLightboxWallpaper(null)}
            onSelectWallpaper={setLightboxWallpaper}
            isFavorite={favoriteIds.includes(lightboxWallpaper.id)}
            onToggleFavorite={handleToggleFavorite}
            onDownload={handleDownload}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        )}
      </Suspense>

      {/* Setup Guide Modal (Lazy Loaded) */}
      <Suspense fallback={null}>
        {isGuideOpen && (
          <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
        )}
      </Suspense>

      {/* Toast notifications */}
      <Toast toasts={toasts} />
    </div>
  );
}

export default App;
