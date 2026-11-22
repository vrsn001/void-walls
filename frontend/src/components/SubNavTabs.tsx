import React from 'react';
import { Image as ImageIcon, Film, Smartphone, FolderTree, Heart, ChevronRight } from 'lucide-react';

export type SubPageTab = 'static' | 'live' | 'mobile' | 'collections' | 'saved';

interface SubNavTabsProps {
  activeTab: SubPageTab;
  onTabChange: (tab: SubPageTab) => void;
  counts: {
    static: number;
    live: number;
    mobile: number;
    collections: number;
    saved: number;
  };
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export const SubNavTabs: React.FC<SubNavTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
  selectedCategory = 'all',
  onSelectCategory,
}) => {
  const tabs = [
    {
      id: 'static' as const,
      num: '01',
      label: 'STATIC_4K',
      sublabel: 'DESKTOP & UHD',
      count: counts.static,
      icon: ImageIcon,
    },
    {
      id: 'live' as const,
      num: '02',
      label: 'LIVE_60FPS',
      sublabel: 'MOTION LOOPS',
      count: counts.live,
      icon: Film,
      badge: '60FPS',
    },
    {
      id: 'mobile' as const,
      num: '03',
      label: 'MOBILE_9:16',
      sublabel: 'AMOLED VERTICAL',
      count: counts.mobile,
      icon: Smartphone,
    },
    {
      id: 'collections' as const,
      num: '04',
      label: 'THE_VAULTS',
      sublabel: `${counts.collections}_ARCHIVES`,
      count: counts.collections,
      icon: FolderTree,
    },
    {
      id: 'saved' as const,
      num: '05',
      label: 'THE_STASH',
      sublabel: 'SAVED ASSETS',
      count: counts.saved,
      icon: Heart,
    },
  ];

  return (
    <nav className="mx-auto max-w-[1440px] px-4 pt-3 pb-2 sm:px-6 font-mono">
      {/* Sub-page Switcher Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 p-1 bg-black border border-white/15">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-start p-2.5 sm:p-3 text-left transition-all border rounded-none relative ${
                isActive
                  ? 'border-sky-400 bg-sky-950/30 text-white shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                  : 'border-white/10 bg-black/40 text-neutral-400 hover:text-white hover:border-white/30 hover:bg-white/[0.02]'
              }`}
            >
              {/* Corner Active Tick */}
              {isActive && (
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-sky-400" />
              )}

              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] font-bold tracking-wider ${isActive ? 'text-sky-400' : 'text-neutral-500'}`}>
                  {tab.num} //
                </span>
                <span
                  className={`px-1.5 py-0.2 text-[9px] font-bold ${
                    isActive ? 'bg-sky-400 text-black' : 'bg-white/10 text-neutral-300'
                  }`}
                >
                  {tab.count}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-1.5">
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-sky-300' : 'text-neutral-500'}`} />
                <span className="text-xs sm:text-sm font-bold tracking-tight uppercase">
                  {tab.label}
                </span>
              </div>

              <span className="text-[9px] text-neutral-500 uppercase tracking-wider mt-0.5">
                {tab.sublabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Breadcrumb if a specific collection is active */}
      {selectedCategory !== 'all' && (
        <div className="flex items-center gap-2 mt-2 px-3 py-1.5 border border-sky-400/40 bg-sky-950/20 text-xs text-neutral-300">
          <span className="text-sky-400 font-bold uppercase">SUB_PAGE //</span>
          <button
            onClick={() => {
              if (onSelectCategory) onSelectCategory('all');
            }}
            className="text-neutral-400 hover:text-white underline underline-offset-2 transition-colors uppercase font-bold"
          >
            ALL_COLLECTIONS
          </button>
          <ChevronRight className="h-3 w-3 text-neutral-500" />
          <span className="text-white font-bold uppercase">{selectedCategory}</span>
          <button
            onClick={() => {
              if (onSelectCategory) onSelectCategory('all');
            }}
            className="ml-auto text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase"
          >
            [CLOSE_SUB_PAGE]
          </button>
        </div>
      )}
    </nav>
  );
};
