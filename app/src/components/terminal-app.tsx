"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Wallpaper } from "@/lib/types";
import { downloadWallpaper, type OutputFormat, type SizeOption } from "@/lib/download";
import { WallpaperGrid } from "./wallpaper-grid";
import { Lightbox } from "./lightbox";
import { CommandPalette } from "./command-palette";
import { CreditsPanel } from "./credits-panel";
import { useFavorites, toggleFavoriteId } from "@/lib/favorites";
import {
  Search,
  Shuffle,
  Heart,
  Award,
  Terminal,
  Zap,
  Smartphone,
  Archive,
  LayoutGrid,
  Image,
} from "lucide-react";

const MAIN_TABS = [
  { id: "all", label: "STATIC_4K", sublabel: "DESKTOP & UHD", icon: Image },
  { id: "live", label: "LIVE_60FPS", sublabel: "MOTION LOOPS", icon: Zap },
  { id: "mobile", label: "MOBILE_9:16", sublabel: "AMOLED VERTICAL", icon: Smartphone },
  { id: "vaults", label: "THE_VAULTS", sublabel: "ARCHIVES", icon: Archive },
  { id: "saved", label: "THE_STASH", sublabel: "SAVED ASSETS", icon: Heart },
];

const COLLECTION_ORDER = [
  "Awesome Curated Web Gallery",
  "Minimalist Collection",
  "Others",
  "Anime",
  "Linux Desktop Workstations",
  "Nord",
  "Flowers",
  "Unsorted",
  "Gruvbox",
];

export function TerminalApp({ wallpapers }: { wallpapers: Wallpaper[] }) {
  const [query, setQuery] = useState("");
  const [mainTab, setMainTab] = useState("all");
  const [collection, setCollection] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const favorites = useFavorites();
  const [statusMsg, setStatusMsg] = useState("SYS.ONLINE // READY");
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);

  const mainFiltered = useMemo(() => {
    if (mainTab === "live") return wallpapers.filter((w) => w.type === "animated");
    if (mainTab === "mobile")
      return wallpapers.filter(
        (w) => w.category === "phone-vertical" || (w.tags && w.tags.includes("vertical"))
      );
    if (mainTab === "saved") return wallpapers.filter((w) => favorites.has(w.id));
    return wallpapers.filter((w) => w.type === "static");
  }, [wallpapers, mainTab, favorites]);

  const collections = useMemo(() => {
    const counts: Record<string, number> = {};
    mainFiltered.forEach((w) => {
      counts[w.categoryLabel] = (counts[w.categoryLabel] || 0) + 1;
    });
    const ordered = COLLECTION_ORDER.filter((c) => counts[c]);
    const rest = Object.keys(counts)
      .filter((c) => !COLLECTION_ORDER.includes(c))
      .sort((a, b) => counts[b] - counts[a]);
    return [...ordered, ...rest].map((name) => ({ name, count: counts[name] }));
  }, [mainFiltered]);

  const filtered = useMemo(() => {
    let result = mainFiltered;

    if (collection) {
      result = result.filter((w) => w.categoryLabel === collection);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.category.toLowerCase().includes(q) ||
          w.categoryLabel.toLowerCase().includes(q) ||
          w.tags.some((t) => t.toLowerCase().includes(q)) ||
          w.format.toLowerCase().includes(q)
      );
    }

    return result;
  }, [mainFiltered, collection, query]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [mainTab, collection]);

  const toggleFavorite = useCallback((w: Wallpaper) => {
    const saved = toggleFavoriteId(w.id);
    setStatusMsg(`${saved ? "SAVED" : "REMOVED"}: "${w.title}"`);
  }, []);

  const handleDownload = useCallback(
    async (w: Wallpaper, format: OutputFormat = "original", size: SizeOption | null = null) => {
      const variant =
        format === "original" && (!size || size.id === "original")
          ? `ORIGINAL ${w.format} · ${w.sizeFormatted}`
          : `${size && size.id !== "original" ? size.label : "FULL RES"} ${format === "original" ? w.format : format.toUpperCase()}`;
      setStatusMsg(`FETCHING: "${w.title}" [${variant}]`);
      try {
        await downloadWallpaper(w, format, size);
        setStatusMsg(`DOWNLOADED: "${w.title}" [${variant}]`);
      } catch (err) {
        setStatusMsg(`ERROR: "${w.title}" — ${err instanceof Error ? err.message : "download failed"}`);
      }
    },
    []
  );

  const handlePreview = useCallback(
    (w: Wallpaper) => {
      const idx = filtered.indexOf(w);
      setLightboxIndex(idx >= 0 ? idx : 0);
    },
    [filtered]
  );

  const handleRandom = useCallback(() => {
    const idx = Math.floor(Math.random() * filtered.length);
    setLightboxIndex(idx);
    setStatusMsg(`SHUFFLE: "${filtered[idx]?.title || "???"}"`);
  }, [filtered]);

  const handlePaletteNavigate = useCallback(
    (action: { type: string; value?: string }) => {
      if (action.type === "tab") {
        setMainTab(action.value!);
        setCollection(null);
        setQuery("");
        setStatusMsg(`FILTER: ${action.value!.toUpperCase()}`);
      } else if (action.type === "collection") {
        setMainTab("all");
        setCollection(action.value!);
        setQuery("");
        setStatusMsg(`COLLECTION: ${action.value!.toUpperCase()}`);
      } else if (action.type === "random") {
        handleRandom();
      } else if (action.type === "reset") {
        setMainTab("all");
        setCollection(null);
        setQuery("");
        setStatusMsg("FILTER: ALL ASSETS");
      } else if (action.type === "preview") {
        const idx = filtered.findIndex((w) => w.id === action.value);
        if (idx >= 0) setLightboxIndex(idx);
      }
    },
    [filtered, handleRandom]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdPaletteOpen((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        if (cmdPaletteOpen) setCmdPaletteOpen(false);
        else if (lightboxIndex !== null) setLightboxIndex(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, cmdPaletteOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* ═══════ HEADER ═══════ */}
      <header className="shrink-0 border-b border-border bg-[#060609]">
        <div className="flex items-center justify-between px-5 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 text-cyan" />
            <div>
              <h1 className="text-base font-bold font-sans tracking-tight text-white">
                VOID<span className="text-cyan mx-0.5">{"//"}</span>WALLS
                <span className="ml-2 text-[9px] font-mono bg-cyan/10 border border-cyan/30 text-cyan px-1.5 py-0.5 align-middle uppercase tracking-widest">
                  VAULT
                </span>
              </h1>
              <p className="text-[10px] text-muted mt-0.5">
                {wallpapers.length.toLocaleString()} CURATED ASSETS {"//"} FASTLY CDN
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH ARCHIVE // anime, amoled, cyberpunk, 4k..."
                className="w-full bg-black/50 border border-border py-2 pl-9 pr-4 text-xs text-white placeholder-muted/50 focus:outline-none focus:border-cyan/40 caret-cyan font-mono"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRandom}
              className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-[11px] font-bold text-white hover:border-cyan/40 hover:text-cyan transition-colors cursor-pointer"
            >
              <Shuffle className="h-3.5 w-3.5" /> RANDOM
            </button>
            <button
              onClick={() => { setMainTab("saved"); setCollection(null); }}
              className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-[11px] font-bold text-white hover:border-cyan/40 hover:text-cyan transition-colors cursor-pointer"
            >
              <Heart className="h-3.5 w-3.5" /> STASH
            </button>
            <button
              onClick={() => setCreditsOpen(true)}
              className="flex items-center gap-1.5 border border-cyan/30 bg-cyan/10 px-3 py-1.5 text-[11px] font-bold text-cyan hover:bg-cyan/20 transition-colors cursor-pointer"
            >
              <Award className="h-3.5 w-3.5" /> CREDITS
            </button>
            <a
              href="https://github.com/vrsn001/void-walls"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-[11px] font-bold text-muted hover:text-white hover:border-white/20 transition-colors cursor-pointer font-mono"
            >
              <Terminal className="h-3.5 w-3.5" /> SRC
            </a>
            <button
              onClick={() => setCmdPaletteOpen(true)}
              className="flex items-center gap-1.5 border border-border px-2 py-1.5 text-[10px] text-muted hover:text-cyan hover:border-cyan/30 transition-colors cursor-pointer"
            >
              <kbd className="border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[9px]">⌘K</kbd>
            </button>
          </div>
        </div>

        {/* ═══════ MAIN TABS ═══════ */}
        <div className="flex items-stretch border-t border-border">
          {MAIN_TABS.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = mainTab === tab.id;
            const count =
              tab.id === "all"
                ? wallpapers.filter((w) => w.type === "static").length
                : tab.id === "live"
                ? wallpapers.filter((w) => w.type === "animated").length
                : tab.id === "mobile"
                ? wallpapers.filter(
                    (w) => w.category === "phone-vertical" || w.tags.includes("vertical")
                  ).length
                : tab.id === "vaults"
                ? collections.length
                : favorites.size;

            return (
              <button
                key={tab.id}
                onClick={() => { setMainTab(tab.id); setCollection(null); }}
                className={`flex-1 flex items-start gap-2 px-4 py-2.5 text-left transition-colors cursor-pointer border-r border-border last:border-r-0 ${
                  isActive
                    ? "bg-cyan/[0.06] border-t-2 border-t-cyan"
                    : "hover:bg-white/[0.02] border-t-2 border-t-transparent"
                }`}
              >
                <span className="text-[10px] text-muted/50 tabular-nums mt-0.5">
                  {String(i + 1).padStart(2, "0")} {"//"}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-3 w-3 shrink-0 ${isActive ? "text-cyan" : "text-muted"}`} />
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isActive ? "text-white" : "text-muted"
                      }`}
                    >
                      {tab.label}
                    </span>
                    <span
                      className={`text-[10px] tabular-nums px-1.5 py-0.5 ${
                        isActive
                          ? "bg-cyan text-black font-bold"
                          : "text-muted/60"
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                  <p className="text-[9px] text-muted/40 uppercase tracking-wider mt-0.5">
                    {tab.sublabel}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </header>

      {/* ═══════ COLLECTION SUB-TABS ═══════ */}
      {mainTab !== "saved" && (
        <div className="shrink-0 border-b border-border bg-[#040407] overflow-x-auto">
          <div className="flex items-center gap-0.5 px-4 py-2 min-w-max">
            <button
              onClick={() => setCollection(null)}
              className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                !collection
                  ? "text-cyan bg-cyan/[0.08] border border-cyan/30"
                  : "text-muted hover:text-white border border-transparent"
              }`}
            >
              <LayoutGrid className="h-2.5 w-2.5" />
              ALL_COLLECTIONS ({mainFiltered.length.toLocaleString()})
            </button>
            {collections.map((c) => (
              <button
                key={c.name}
                onClick={() => setCollection(c.name)}
                className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                  collection === c.name
                    ? "text-cyan bg-cyan/[0.08] border border-cyan/30"
                    : "text-muted/70 hover:text-white border border-transparent"
                }`}
              >
                {c.name.toUpperCase()}{" "}
                <span className={collection === c.name ? "text-cyan" : "text-muted/40"}>
                  {c.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══════ RESULTS COUNT ═══════ */}
      <div className="shrink-0 px-5 py-2 text-[10px] text-muted/60 font-mono">
        QUERY_RESULTS:{" "}
        <span className="text-white font-bold">{filtered.length.toLocaleString()}</span> {"//"}{" "}
        {wallpapers.length.toLocaleString()} ASSETS
      </div>

      {/* ═══════ GRID ═══════ */}
      <main className="flex-1">
        <WallpaperGrid
          wallpapers={filtered}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onDownload={handleDownload}
          onPreview={handlePreview}
        />
      </main>

      {/* ═══════ FOOTER STATUS ═══════ */}
      <footer className="sticky bottom-0 z-40 shrink-0 flex items-center justify-between border-t border-border bg-[#060609]/95 px-5 py-2">
        <div className="flex items-center gap-2 text-[10px] text-muted">
          <span className="status-cursor h-3 w-[2px] bg-cyan shrink-0" />
          <span>{statusMsg}</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-muted/50 tabular-nums">
          <span>
            FILTER: <span className="text-cyan uppercase">{collection || mainTab}</span>
          </span>
          <span>♥ {favorites.size}</span>
          <span>
            <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px]">⌘K</kbd>{" "}
            Search
          </span>
        </div>
      </footer>

      {creditsOpen && <CreditsPanel wallpapers={wallpapers} onClose={() => setCreditsOpen(false)} />}

      {/* ═══════ COMMAND PALETTE ═══════ */}
      {cmdPaletteOpen && (
        <CommandPalette
          wallpapers={wallpapers}
          collections={collections}
          onClose={() => setCmdPaletteOpen(false)}
          onNavigate={handlePaletteNavigate}
        />
      )}

      {/* ═══════ LIGHTBOX ═══════ */}
      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <Lightbox
          wallpaper={filtered[lightboxIndex]}
          isFavorite={favorites.has(filtered[lightboxIndex].id)}
          onClose={() => setLightboxIndex(null)}
          onToggleFavorite={toggleFavorite}
          onDownload={handleDownload}
          onPrev={() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setLightboxIndex((i) => Math.min(filtered.length - 1, (i ?? 0) + 1))}
          hasPrev={(lightboxIndex ?? 0) > 0}
          hasNext={(lightboxIndex ?? 0) < filtered.length - 1}
        />
      )}
    </div>
  );
}
