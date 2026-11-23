"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Wallpaper } from "@/lib/types";
import { downloadWallpaper, type OutputFormat, type SizeOption } from "@/lib/download";
import { WallpaperGrid } from "./wallpaper-grid";
import { Lightbox } from "./lightbox";
import { CommandPalette } from "./command-palette";
import { CreditsPanel } from "./credits-panel";
import { RadioPanel } from "./radio-panel";
import { CrtOverlay } from "./crt-overlay";
import { ColorwayModal } from "./colorway-modal";
import { useFavorites, toggleFavoriteId } from "@/lib/favorites";
import { applyTheme, type ThemeId } from "@/lib/theme";
import { sound } from "@/lib/sound";
import { radio } from "@/lib/radio";
import { triggerHaptic } from "@/lib/haptics";
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
  Volume2,
  VolumeX,
  MoreHorizontal,
  Radio,
  Tv,
  Palette,
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
  const [mobileCols, setMobileCols] = useState<1 | 2>(2);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [radioLive, setRadioLive] = useState(false);
  const [radioPanelOpen, setRadioPanelOpen] = useState(false);
  const [crtEnabled, setCrtEnabled] = useState(false);
  const [colorwayOpen, setColorwayOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setSfxEnabled(sound.isEnabled());
    setRadioLive(radio.isActive());
    const unsub = radio.subscribe(() => {
      setRadioLive(radio.isActive());
      const track = radio.getCurrentTrack();
      if (radio.isActive() && track) {
        setStatusMsg(`ON AIR: "${track}" [104.7 MHZ]`);
      }
    });
    return () => unsub();
  }, []);

  const toggleSfx = useCallback(() => {
    const next = sound.toggle();
    setSfxEnabled(next);
    triggerHaptic("medium");
    setStatusMsg(`SFX: ${next ? "ENABLED // TACTILE HARDWARE" : "MUTED // SILENT"}`);
  }, []);

  const toggleCrt = useCallback(() => {
    sound.playSwitch();
    triggerHaptic("medium");
    setCrtEnabled((prev) => {
      const next = !prev;
      setStatusMsg(`CRT SCREEN: ${next ? "SCANLINES // PHOSPHOR FX ACTIVE" : "CLEAN DIGITAL"}`);
      return next;
    });
  }, []);

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
    sound.playStash(saved);
    triggerHaptic("medium");
    setStatusMsg(`${saved ? "SAVED" : "REMOVED"}: "${w.title}"`);
  }, []);

  const handleDownload = useCallback(
    async (w: Wallpaper, format: OutputFormat = "original", size: SizeOption | null = null) => {
      sound.playDownload();
      triggerHaptic("success");
      const variant =
        format === "original" && (!size || size.id === "original")
          ? `ORIGINAL ${w.format} · ${w.sizeFormatted}`
          : `${size && size.id !== "original" ? size.label : "FULL RES"} ${format === "original" ? w.format : format.toUpperCase()}`;
      setStatusMsg(`FETCHING: "${w.title}" [${variant}]`);
      try {
        await downloadWallpaper(w, format, size);
        sound.playDownloadComplete();
        triggerHaptic("success");
        setStatusMsg(`DOWNLOADED: "${w.title}" [${variant}]`);
      } catch (err) {
        setStatusMsg(`ERROR: "${w.title}" — ${err instanceof Error ? err.message : "download failed"}`);
      }
    },
    []
  );

  const handlePreview = useCallback(
    (w: Wallpaper) => {
      sound.playSlide();
      triggerHaptic("light");
      const idx = filtered.indexOf(w);
      setLightboxIndex(idx >= 0 ? idx : 0);
    },
    [filtered]
  );

  const handleRandom = useCallback(() => {
    sound.playShuffle();
    triggerHaptic("medium");
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
      } else if (action.type === "theme") {
        if (action.value) {
          applyTheme(action.value as ThemeId);
          setStatusMsg(`THEME: ${action.value.toUpperCase()} // COLORWAY ENGAGED`);
        } else {
          setColorwayOpen(true);
        }
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
        if (mobileMenuOpen) setMobileMenuOpen(false);
        else if (cmdPaletteOpen) setCmdPaletteOpen(false);
        else if (lightboxIndex !== null) setLightboxIndex(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, cmdPaletteOpen, mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleOutsideClick = () => setMobileMenuOpen(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [mobileMenuOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-black w-full max-w-full overflow-x-hidden">
      {/* ═══════ HEADER ═══════ */}
      <header className="shrink-0 border-b border-border bg-[#060609] w-full max-w-full">
        <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 gap-2 w-full max-w-full">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
            <Terminal className="h-5 w-5 text-cyan shrink-0" />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold font-sans tracking-tight text-white leading-tight truncate">
                VOID<span className="text-cyan mx-0.5">{"//"}</span>WALLS
                <span className="ml-1.5 sm:ml-2 text-[9px] font-mono bg-cyan/10 border border-cyan/30 text-cyan px-1.5 py-0.5 align-middle uppercase tracking-widest">
                  VAULT
                </span>
              </h1>
              <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 font-mono truncate">
                {wallpapers.length.toLocaleString()} CURATED ASSETS {"//"} FASTLY CDN
              </p>
            </div>
          </div>

          {/* Search on Desktop / Tablet (hidden on mobile) */}
          <div className="hidden md:block flex-1 max-w-md lg:max-w-lg mx-4 lg:mx-8">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  sound.playKeypress();
                  setQuery(e.target.value);
                }}
                placeholder="SEARCH ARCHIVE // anime, amoled, cyberpunk, 4k..."
                className="w-full bg-black/50 border border-border py-2 pl-9 pr-4 text-xs text-white placeholder-muted/50 focus:outline-none focus:border-cyan/40 caret-cyan font-mono"
              />
            </div>
          </div>

          {/* Desktop Action buttons (sm and up) */}
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleRandom}
              title="Random Wallpaper"
              className="flex items-center gap-1.5 border border-border px-2.5 sm:px-3 py-1.5 text-[11px] font-bold text-white hover:border-cyan/40 hover:text-cyan transition-colors cursor-pointer"
            >
              <Shuffle className="h-3.5 w-3.5" /> <span>RANDOM</span>
            </button>
            <button
              onClick={() => {
                sound.playSwitch();
                triggerHaptic("light");
                setMainTab("saved");
                setCollection(null);
              }}
              title="Saved Stash"
              className="flex items-center gap-1.5 border border-border px-2.5 sm:px-3 py-1.5 text-[11px] font-bold text-white hover:border-cyan/40 hover:text-cyan transition-colors cursor-pointer"
            >
              <Heart className={`h-3.5 w-3.5 ${favorites.size > 0 ? "fill-rose-400 text-rose-400" : ""}`} />
              <span>STASH</span>
              {favorites.size > 0 && (
                <span className="text-[10px] font-mono bg-rose-500/20 text-rose-400 px-1 py-0.5 leading-none">
                  {favorites.size}
                </span>
              )}
            </button>
            <button
              onClick={toggleSfx}
              title={sfxEnabled ? "Mute Tactile SFX" : "Enable Tactile SFX"}
              className={`flex items-center gap-1.5 border px-2.5 sm:px-3 py-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                sfxEnabled
                  ? "border-cyan/40 bg-cyan/[0.08] text-cyan hover:bg-cyan/20"
                  : "border-border text-muted hover:text-white"
              }`}
            >
              {sfxEnabled ? <Volume2 className="h-3.5 w-3.5 text-cyan" /> : <VolumeX className="h-3.5 w-3.5 text-muted" />}
              <span>SFX</span>
            </button>
            <button
              onClick={() => {
                sound.playCommand();
                triggerHaptic("light");
                setRadioPanelOpen(true);
              }}
              title="Cyberpunk Radio Station Tuner (Procedural Ambient Synth)"
              className={`flex items-center gap-1.5 border px-2.5 sm:px-3 py-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                radioLive
                  ? "border-cyan/50 bg-cyan/[0.12] text-cyan hover:bg-cyan/20"
                  : "border-border text-muted hover:text-white"
              }`}
            >
              <Radio className={`h-3.5 w-3.5 ${radioLive ? "text-cyan animate-pulse" : "text-muted"}`} />
              <span>RADIO</span>
              <span className={`text-[9px] font-mono px-1 py-0.2 ${radioLive ? "bg-cyan text-black font-bold" : "text-zinc-500"}`}>
                {radioLive ? "LIVE" : "TUNER"}
              </span>
            </button>
            <button
              onClick={toggleCrt}
              title="Toggle Retro CRT Scanlines & Terminal Phosphor FX"
              className={`flex items-center gap-1.5 border px-2.5 sm:px-3 py-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                crtEnabled
                  ? "border-cyan/50 bg-cyan/[0.12] text-cyan hover:bg-cyan/20"
                  : "border-border text-muted hover:text-white"
              }`}
            >
              <Tv className={`h-3.5 w-3.5 ${crtEnabled ? "text-cyan" : "text-muted"}`} />
              <span>CRT</span>
              <span className={`text-[9px] font-mono px-1 py-0.2 ${crtEnabled ? "bg-cyan text-black font-bold" : "text-zinc-500"}`}>
                {crtEnabled ? "ON" : "OFF"}
              </span>
            </button>
            <button
              onClick={() => {
                sound.playSwitch();
                triggerHaptic("light");
                setColorwayOpen(true);
              }}
              title="Terminal Colorway Matrix (5 Color Profiles)"
              className="flex items-center gap-1.5 border border-border px-2.5 sm:px-3 py-1.5 text-[11px] font-bold text-white hover:border-cyan/40 hover:text-cyan transition-colors cursor-pointer"
            >
              <Palette className="h-3.5 w-3.5 text-cyan" />
              <span>THEME</span>
            </button>
            <button
              onClick={() => {
                sound.playSwitch();
                triggerHaptic("light");
                setCreditsOpen(true);
              }}
              title="Credits & Sources"
              className="flex items-center gap-1.5 border border-cyan/30 bg-cyan/10 px-2.5 sm:px-3 py-1.5 text-[11px] font-bold text-cyan hover:bg-cyan/20 transition-colors cursor-pointer"
            >
              <Award className="h-3.5 w-3.5" /> <span>CREDITS</span>
            </button>
            <a
              href="https://github.com/vrsn001/void-walls"
              target="_blank"
              rel="noopener noreferrer"
              title="Source Repository"
              className="hidden sm:flex items-center gap-1.5 border border-border px-3 py-1.5 text-[11px] font-bold text-muted hover:text-white hover:border-white/20 transition-colors cursor-pointer font-mono"
            >
              <Terminal className="h-3.5 w-3.5" /> SRC
            </a>
            <button
              onClick={() => {
                sound.playCommand();
                triggerHaptic("light");
                setCmdPaletteOpen(true);
              }}
              title="Command Palette"
              className="flex items-center gap-1.5 border border-border px-2 py-1.5 text-[10px] text-muted hover:text-cyan hover:border-cyan/30 transition-colors cursor-pointer"
            >
              <kbd className="border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[9px]">⌘K</kbd>
            </button>
          </div>

          {/* Mobile Action buttons (< sm) — All touch targets >= 44px */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleRandom}
              title="Random Wallpaper"
              aria-label="Random Wallpaper"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center border border-border text-white hover:border-cyan/40 hover:text-cyan transition-colors cursor-pointer"
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                sound.playSwitch();
                triggerHaptic("light");
                setMainTab("saved");
                setCollection(null);
              }}
              title="Saved Stash"
              aria-label="Saved Stash"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center relative border border-border text-white hover:border-cyan/40 hover:text-cyan transition-colors cursor-pointer"
            >
              <Heart className={`h-4 w-4 ${favorites.size > 0 ? "fill-rose-400 text-rose-400" : ""}`} />
              {favorites.size > 0 && (
                <span className="absolute top-1 right-1 text-[9px] font-mono font-bold bg-rose-500 text-white px-1 py-0.2 leading-none">
                  {favorites.size}
                </span>
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => {
                  sound.playSwitch();
                  triggerHaptic("light");
                  setMobileMenuOpen((v) => !v);
                }}
                title="More Options"
                aria-label="More Options"
                aria-expanded={mobileMenuOpen}
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center border transition-colors cursor-pointer ${
                  mobileMenuOpen
                    ? "border-cyan bg-cyan/15 text-cyan"
                    : "border-border text-white hover:border-cyan/40 hover:text-cyan"
                }`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {mobileMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 z-50 w-52 bg-[#09090f] border border-border shadow-2xl shadow-black font-mono"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      toggleSfx();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-semibold text-white hover:bg-white/[0.04] border-b border-border cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {sfxEnabled ? <Volume2 className="h-4 w-4 text-cyan" /> : <VolumeX className="h-4 w-4 text-muted" />}
                      <span>TACTILE SFX</span>
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 border ${sfxEnabled ? "border-cyan/40 text-cyan bg-cyan/10" : "border-border text-muted"}`}>
                      {sfxEnabled ? "ON" : "MUTED"}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      sound.playCommand();
                      triggerHaptic("light");
                      setRadioPanelOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-semibold text-white hover:bg-white/[0.04] border-b border-border cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Radio className={`h-4 w-4 ${radioLive ? "text-cyan animate-pulse" : "text-muted"}`} />
                      <span>CYBER RADIO TUNER</span>
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 border ${radioLive ? "border-cyan/50 text-cyan bg-cyan/15" : "border-border text-muted"}`}>
                      {radioLive ? "LIVE" : "TUNER"}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      toggleCrt();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-semibold text-white hover:bg-white/[0.04] border-b border-border cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Tv className={`h-4 w-4 ${crtEnabled ? "text-cyan" : "text-muted"}`} />
                      <span>CRT SCANLINES FX</span>
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 border ${crtEnabled ? "border-cyan/50 text-cyan bg-cyan/15" : "border-border text-muted"}`}>
                      {crtEnabled ? "ON" : "OFF"}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      sound.playSwitch();
                      triggerHaptic("light");
                      setColorwayOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-semibold text-white hover:bg-white/[0.04] border-b border-border cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-cyan" />
                      <span>COLORWAY MATRIX</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 border border-cyan/40 text-cyan bg-cyan/10">
                      THEMES
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      sound.playSwitch();
                      triggerHaptic("light");
                      setCreditsOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center gap-2 text-left text-xs font-semibold text-cyan hover:bg-cyan/[0.06] border-b border-border cursor-pointer"
                  >
                    <Award className="h-4 w-4 text-cyan shrink-0" />
                    <span>CREDITS & SOURCES</span>
                  </button>
                  <a
                    href="https://github.com/vrsn001/void-walls"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center gap-2 text-left text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.04] cursor-pointer"
                  >
                    <Terminal className="h-4 w-4 shrink-0" />
                    <span>SOURCE REPO</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search on Mobile (< md) */}
        <div className="md:hidden px-3 pb-2.5 pt-0.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                sound.playKeypress();
                setQuery(e.target.value);
              }}
              placeholder="SEARCH ARCHIVE // anime, amoled, 4k..."
              className="w-full bg-black/60 border border-border py-2 pl-9 pr-8 text-xs text-white placeholder-muted/50 focus:outline-none focus:border-cyan/40 caret-cyan font-mono"
            />
            {query && (
              <button
                onClick={() => {
                  sound.playSwitch();
                  triggerHaptic("light");
                  setQuery("");
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-muted hover:text-white font-mono px-1 py-0.5 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ═══════ MAIN TABS (Horizontally scrollable with smooth touch on mobile) ═══════ */}
        <div className="flex items-stretch border-t border-border overflow-x-auto scrollbar-none scroll-smooth w-full max-w-full">
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
                onClick={() => {
                  sound.playSwitch();
                  triggerHaptic("light");
                  setMainTab(tab.id);
                  setCollection(null);
                }}
                className={`shrink-0 md:flex-1 flex items-start gap-2 px-3 sm:px-4 py-2.5 text-left transition-colors cursor-pointer border-r border-border last:border-r-0 min-w-[130px] sm:min-w-[150px] md:min-w-0 min-h-[44px] ${
                  isActive
                    ? "bg-cyan/[0.08] border-t-2 border-t-cyan"
                    : "hover:bg-white/[0.02] border-t-2 border-t-transparent"
                }`}
              >
                <span className="hidden sm:inline text-[10px] text-zinc-500 tabular-nums mt-0.5">
                  {String(i + 1).padStart(2, "0")} {"//"}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-cyan" : "text-zinc-400"}`} />
                    <span
                      className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider truncate ${
                        isActive ? "text-white" : "text-zinc-300"
                      }`}
                    >
                      {tab.label}
                    </span>
                    <span
                      className={`text-[10px] sm:text-[11px] tabular-nums px-1.5 py-0.5 ${
                        isActive
                          ? "bg-cyan text-black font-bold"
                          : "text-zinc-400 bg-white/[0.04]"
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5 truncate">
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
        <div className="shrink-0 border-b border-border bg-[#040407] overflow-x-auto scrollbar-none w-full max-w-full">
          <div className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 min-w-max">
            <button
              onClick={() => {
                sound.playSwitch();
                triggerHaptic("light");
                setCollection(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                !collection
                  ? "text-cyan bg-cyan/[0.12] border border-cyan/40"
                  : "text-zinc-300 hover:text-white border border-transparent"
              }`}
            >
              <LayoutGrid className="h-3 w-3" />
              ALL_COLLECTIONS ({mainFiltered.length.toLocaleString()})
            </button>
            {collections.map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  sound.playSwitch();
                  triggerHaptic("light");
                  setCollection(c.name);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-[11px] sm:text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                  collection === c.name
                    ? "text-cyan bg-cyan/[0.12] border border-cyan/40"
                    : "text-zinc-300 hover:text-white border border-transparent"
                }`}
              >
                {c.name.toUpperCase()}{" "}
                <span className={collection === c.name ? "text-cyan" : "text-zinc-400"}>
                  {c.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══════ RESULTS COUNT & MOBILE GRID TOGGLE ═══════ */}
      <div className="shrink-0 px-3 sm:px-5 py-2 text-xs text-zinc-400 font-mono flex items-center justify-between w-full max-w-full">
        <div>
          QUERY_RESULTS:{" "}
          <span className="text-white font-bold">{filtered.length.toLocaleString()}</span> {"//"}{" "}
          {wallpapers.length.toLocaleString()} ASSETS
        </div>
        <div className="flex items-center gap-1 sm:hidden">
          <button
            onClick={() => {
              sound.playSwitch();
              triggerHaptic("light");
              setMobileCols(1);
            }}
            aria-label="1-Column layout"
            className={`min-h-[44px] min-w-[44px] px-2.5 py-1 text-[10px] font-bold border transition-colors cursor-pointer flex items-center justify-center ${
              mobileCols === 1
                ? "border-cyan text-cyan bg-cyan/15"
                : "border-border text-zinc-400"
            }`}
          >
            1-COL
          </button>
          <button
            onClick={() => {
              sound.playSwitch();
              triggerHaptic("light");
              setMobileCols(2);
            }}
            aria-label="2-Column layout"
            className={`min-h-[44px] min-w-[44px] px-2.5 py-1 text-[10px] font-bold border transition-colors cursor-pointer flex items-center justify-center ${
              mobileCols === 2
                ? "border-cyan text-cyan bg-cyan/15"
                : "border-border text-zinc-400"
            }`}
          >
            2-COL
          </button>
        </div>
      </div>

      {/* ═══════ GRID ═══════ */}
      <main className="flex-1 w-full max-w-full min-w-0 pb-14 sm:pb-12">
        <WallpaperGrid
          wallpapers={filtered}
          favorites={favorites}
          mobileCols={mobileCols}
          onToggleFavorite={toggleFavorite}
          onDownload={handleDownload}
          onPreview={handlePreview}
        />
      </main>

      {/* ═══════ FOOTER STATUS ═══════ */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between border-t border-border bg-[#060609]/95 backdrop-blur-md px-3 sm:px-5 py-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] w-full">
        <div className="flex items-center gap-2 text-xs text-zinc-300 truncate mr-2 min-w-0">
          <span className="status-cursor h-3 w-[2px] bg-cyan shrink-0" />
          <span className="truncate">{statusMsg}</span>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-4 text-xs text-zinc-400 tabular-nums shrink-0">
          <button
            onClick={() => {
              sound.playCommand();
              triggerHaptic("light");
              setRadioPanelOpen(true);
            }}
            title={radioLive ? "Cyber Radio On Air (Click for Tuner HUD)" : "Cyber Radio Off (Click to Tune In)"}
            className={`flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-mono font-bold tracking-wider transition-colors cursor-pointer ${
              radioLive
                ? "border-cyan/50 bg-cyan/[0.12] text-cyan hover:bg-cyan/20"
                : "border-border/70 bg-black/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500"
            }`}
          >
            <Radio className={`h-3 w-3 ${radioLive ? "animate-pulse text-cyan" : "text-zinc-500"}`} />
            <span>{radioLive ? "RADIO: LIVE ∿" : "RADIO: OFF"}</span>
          </button>
          <span className="hidden sm:inline">
            FILTER: <span className="text-cyan uppercase">{collection || mainTab}</span>
          </span>
          <span>♥ {favorites.size}</span>
          <span className="hidden sm:inline">
            <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px]">⌘K</kbd>{" "}
            Search
          </span>
        </div>
      </footer>

      <CrtOverlay enabled={crtEnabled} />
      {creditsOpen && <CreditsPanel wallpapers={wallpapers} onClose={() => setCreditsOpen(false)} />}
      {radioPanelOpen && (
        <RadioPanel
          onClose={() => setRadioPanelOpen(false)}
          onStatusChange={setStatusMsg}
        />
      )}
      {colorwayOpen && (
        <ColorwayModal
          open={colorwayOpen}
          onClose={() => setColorwayOpen(false)}
          onThemeChanged={(name) => setStatusMsg(`THEME: ${name} // COLORWAY ENGAGED`)}
        />
      )}

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
