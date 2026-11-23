"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  X,
  Download,
  Heart,
  ChevronLeft,
  ChevronRight,
  Film,
  Loader2,
  Check,
  Smartphone,
  Monitor,
  Maximize2,
  Sparkles,
  Radio,
  Palette,
  Sliders,
} from "lucide-react";
import type { Wallpaper } from "@/lib/types";
import { getFullUrl, getThumbnailUrl } from "@/lib/cdn";
import { canConvert, sizeOptions, type OutputFormat, type SizeOption } from "@/lib/download";
import { sound } from "@/lib/sound";
import { radio } from "@/lib/radio";
import { triggerHaptic } from "@/lib/haptics";
import { PaletteModal } from "./palette-modal";
import { StudioModal } from "./studio-modal";

interface LightboxProps {
  wallpaper: Wallpaper;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (w: Wallpaper) => void;
  onDownload: (w: Wallpaper, format?: OutputFormat, size?: SizeOption | null) => Promise<void>;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

const FORMATS: { id: OutputFormat; label: string }[] = [
  { id: "original", label: "ORIGINAL" },
  { id: "jpeg", label: "JPEG" },
  { id: "webp", label: "WEBP" },
  { id: "png", label: "PNG" },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={() => {
        sound.playSwitch();
        triggerHaptic("light");
        onClick();
      }}
      className={`px-3 py-2 sm:px-3 sm:py-1 text-[11px] sm:text-[10px] font-bold uppercase tracking-wider border transition-colors cursor-pointer whitespace-nowrap min-h-[44px] sm:min-h-0 flex items-center justify-center ${
        active ? "border-cyan/50 bg-cyan/15 text-cyan" : "border-white/10 text-zinc-300 hover:text-white hover:border-white/25"
      }`}
    >
      {children}
    </button>
  );
}

function FocusOscilloscope() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const buffer = new Uint8Array(64);

    const render = () => {
      radio.getByteTimeDomainData(buffer);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "var(--accent, #00f0ff)";
      ctx.beginPath();

      const sliceWidth = width / buffer.length;
      let x = 0;

      for (let i = 0; i < buffer.length; i++) {
        const v = buffer[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={48}
      className="w-full max-w-md h-10 opacity-75"
    />
  );
}

export function Lightbox({
  wallpaper,
  isFavorite,
  onClose,
  onToggleFavorite,
  onDownload,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: LightboxProps) {
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [format, setFormat] = useState<OutputFormat>("original");
  const [sizeId, setSizeId] = useState("original");
  const [busy, setBusy] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // New features: Device Mockup Frame & Focus HUD Mode
  const [deviceFrame, setDeviceFrame] = useState<"none" | "phone" | "laptop">("none");
  const [focusMode, setFocusMode] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [clockTime, setClockTime] = useState("");
  const [clockDate, setClockDate] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClockTime(now.toLocaleTimeString("en-GB", { hour12: false }));
      setClockDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }).toUpperCase()
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const sizes = useMemo(() => sizeOptions(wallpaper), [wallpaper]);
  const size = sizes.find((s) => s.id === sizeId) ?? sizes[0];
  const convertible = canConvert(wallpaper);
  const loaded = loadedId === wallpaper.id;
  const sourceLabel = wallpaper.format === "JPG" ? "JPEG" : wallpaper.format;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const diffX = touchStartX - e.changedTouches[0].clientX;
    const diffY = touchStartY - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0 && hasNext) {
        sound.playSlide();
        triggerHaptic("light");
        onNext();
      } else if (diffX < 0 && hasPrev) {
        sound.playSlide();
        triggerHaptic("light");
        onPrev();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  const startDownload = async () => {
    if (busy) return;
    setBusy(true);
    setDownloadSuccess(false);
    try {
      await onDownload(wallpaper, convertible ? format : "original", convertible ? size : null);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (focusMode) {
          sound.playSwitch();
          setFocusMode(false);
          e.stopPropagation();
        }
      } else if (e.key === "f" || e.key === "F") {
        sound.playSwitch();
        triggerHaptic("medium");
        setFocusMode((v) => !v);
      } else if (e.key === "p" || e.key === "P") {
        sound.playSwitch();
        triggerHaptic("light");
        setPaletteOpen((v) => !v);
      } else if (e.key === "c" || e.key === "C") {
        sound.playSwitch();
        triggerHaptic("light");
        setStudioOpen((v) => !v);
      } else if (e.key === "m" || e.key === "M") {
        sound.playSwitch();
        triggerHaptic("light");
        setDeviceFrame((prev) =>
          prev === "none" ? "phone" : prev === "phone" ? "laptop" : "none"
        );
      } else if (e.key === "ArrowLeft" && hasPrev) {
        sound.playSlide();
        triggerHaptic("light");
        onPrev();
      } else if (e.key === "ArrowRight" && hasNext) {
        sound.playSlide();
        triggerHaptic("light");
        onNext();
      } else if (e.key === "Enter") {
        startDownload();
      } else if (e.key === "s") {
        onToggleFavorite(wallpaper);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [focusMode, hasPrev, hasNext, wallpaper]);

  // ══════════════════════════════════════════════════════════
  // FOCUS MODE (Cyber Ambient Desk Display)
  // ══════════════════════════════════════════════════════════
  if (focusMode) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-4 sm:p-8 md:p-12 overflow-hidden select-none cursor-pointer animate-in fade-in duration-200"
        onClick={() => {
          sound.playSwitch();
          setFocusMode(false);
        }}
      >
        {/* Dynamic Background Wallpaper with Ambient Cyber Dimming */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <img
            src={getFullUrl(wallpaper)}
            alt=""
            className="w-full h-full object-cover opacity-60 filter brightness-90 contrast-105 scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/80" />
        </div>

        {/* Top Focus HUD Bar */}
        <div className="relative z-10 w-full flex items-center justify-between text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
            <span className="text-white font-bold tracking-wider">CYBER_FOCUS // AMBIENT DESK HUD</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-zinc-400 font-mono">ASSET: {wallpaper.title}</span>
            <span className="border border-cyan/40 bg-cyan/10 px-2 py-1 text-cyan text-[11px] font-bold">
              ESC / TAP TO EXIT
            </span>
          </div>
        </div>

        {/* Giant Digital Center Clock */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-8">
          <div className="text-6xl sm:text-8xl md:text-9xl font-mono font-black tracking-widest text-white drop-shadow-[0_0_40px_rgba(0,240,255,0.45)]">
            {clockTime}
          </div>
          <div className="text-xs sm:text-base font-mono tracking-[0.25em] text-cyan uppercase mt-3">
            {clockDate} {"//"} SYSTEM NORMAL
          </div>
          {radio.isActive() && (
            <div className="mt-4 flex items-center gap-2 border border-cyan/40 bg-black/70 px-3.5 py-1.5 font-mono text-xs text-cyan animate-pulse">
              <Radio className="h-3.5 w-3.5" />
              <span>ON AIR: {radio.getCurrentTrack() || "PROCEDURAL CYBER BROADCAST"}</span>
            </div>
          )}
        </div>

        {/* Bottom Audio Oscilloscope Wave */}
        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-2">
          <FocusOscilloscope />
          <div className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">
            [CLICK OR TAP ANYWHERE TO RETURN TO VAULT]
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // STANDARD LIGHTBOX MODE
  // ══════════════════════════════════════════════════════════
  return (
    <div
      className="lightbox-overlay fixed inset-0 z-50 bg-[#030306] flex flex-col w-full max-w-full overflow-y-auto overflow-x-hidden"
      onClick={onClose}
    >
      {/* Dynamic Ambient Background Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
        <img
          src={getThumbnailUrl(wallpaper)}
          alt=""
          className="h-full w-full object-cover scale-150 blur-3xl opacity-30 filter transition-all duration-700"
        />
        <div className="absolute inset-0 bg-[#030306]/75 backdrop-blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030306] via-transparent to-[#030306]/90" />
      </div>

      {/* Top Header Controls Bar */}
      <div
        className="sticky top-0 z-20 shrink-0 flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 py-2.5 sm:py-3 w-full max-w-full border-b border-white/[0.08] bg-[#030306]/95 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 flex-1 mr-2">
          <h2 className="text-xs sm:text-sm font-semibold text-white font-sans truncate">{wallpaper.title}</h2>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-zinc-300 mt-0.5 truncate font-mono">
            <span>{wallpaper.categoryLabel}</span>
            <span className="text-white/20">·</span>
            <span>{wallpaper.resolution || "—"}</span>
            <span className="text-white/20">·</span>
            <span className="uppercase">{wallpaper.format}</span>
            <span className="text-white/20">·</span>
            <span>{wallpaper.sizeFormatted}</span>
            {wallpaper.type === "animated" && (
              <>
                <span className="text-white/20">·</span>
                <span className="text-amber flex items-center gap-0.5">
                  <Film className="h-2.5 w-2.5" /> LIVE
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Controls in Header (Device Frames, Focus HUD, Stash, Close) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Device Mockup Toggle Button */}
          <div className="flex items-center border border-white/20 bg-black/40">
            <button
              onClick={() => {
                sound.playSwitch();
                triggerHaptic("light");
                setDeviceFrame("none");
              }}
              title="Raw View"
              className={`min-w-[36px] sm:min-w-[32px] min-h-[44px] sm:min-h-[32px] px-2 flex items-center justify-center text-[10px] font-mono cursor-pointer transition-colors ${
                deviceFrame === "none"
                  ? "bg-cyan/20 text-cyan font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              RAW
            </button>
            <button
              onClick={() => {
                sound.playSwitch();
                triggerHaptic("light");
                setDeviceFrame("phone");
              }}
              title="Phone Mockup Frame"
              className={`min-w-[36px] sm:min-w-[32px] min-h-[44px] sm:min-h-[32px] px-2 flex items-center justify-center text-[10px] font-mono cursor-pointer transition-colors ${
                deviceFrame === "phone"
                  ? "bg-cyan/20 text-cyan font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                sound.playSwitch();
                triggerHaptic("light");
                setDeviceFrame("laptop");
              }}
              title="Laptop Mockup Frame"
              className={`min-w-[36px] sm:min-w-[32px] min-h-[44px] sm:min-h-[32px] px-2 flex items-center justify-center text-[10px] font-mono cursor-pointer transition-colors ${
                deviceFrame === "laptop"
                  ? "bg-cyan/20 text-cyan font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Focus HUD Trigger */}
          <button
            onClick={() => {
              sound.playSwitch();
              triggerHaptic("medium");
              setFocusMode(true);
            }}
            title="Cyber Focus Mode Desk Display [F]"
            aria-label="Focus Mode"
            className="flex min-w-[44px] sm:min-w-0 h-11 w-11 sm:h-9 sm:w-auto sm:px-2.5 items-center justify-center gap-1 border border-cyan/40 bg-cyan/10 text-cyan hover:bg-cyan/20 transition-colors cursor-pointer text-xs font-mono font-bold"
          >
            <Maximize2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">FOCUS</span>
          </button>

          {/* Unix Rice Forge & ASCII Matrix Trigger */}
          <button
            onClick={() => {
              sound.playSwitch();
              triggerHaptic("medium");
              setPaletteOpen(true);
            }}
            title="Unix Rice Forge & ANSI ASCII Terminal Converter [P]"
            aria-label="Unix Rice Forge"
            className="flex min-w-[44px] sm:min-w-0 h-11 w-11 sm:h-9 sm:w-auto sm:px-2.5 items-center justify-center gap-1 border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors cursor-pointer text-xs font-mono font-bold"
          >
            <Palette className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">RICE</span>
          </button>

          {/* Cyber Studio & AMOLED Black Crusher Trigger */}
          <button
            onClick={() => {
              sound.playSwitch();
              triggerHaptic("medium");
              setStudioOpen(true);
            }}
            title="Cyber Studio & AMOLED Black Crusher [C]"
            aria-label="Cyber Studio"
            className="flex min-w-[44px] sm:min-w-0 h-11 w-11 sm:h-9 sm:w-auto sm:px-2.5 items-center justify-center gap-1 border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer text-xs font-mono font-bold"
          >
            <Sliders className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">STUDIO</span>
          </button>

          <button
            onClick={() => onToggleFavorite(wallpaper)}
            aria-label={isFavorite ? "Remove from stash" : "Save to stash"}
            className={`flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center border transition-colors cursor-pointer ${
              isFavorite ? "border-rose-500/50 bg-rose-500/10 text-rose-400" : "border-white/20 text-white/70 hover:text-white"
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={() => {
              sound.playSwitch();
              triggerHaptic("light");
              onClose();
            }}
            aria-label="Close"
            className="flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center border border-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative z-10 flex-1 flex items-center justify-center min-h-[220px] sm:min-h-0 px-2 sm:px-8 md:px-16 py-3 sm:py-2 touch-pan-y w-full max-w-full"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {hasPrev && (
          <button
            onClick={() => {
              sound.playSlide();
              triggerHaptic("light");
              onPrev();
            }}
            aria-label="Previous"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 sm:h-10 sm:w-10 items-center justify-center bg-black/70 border border-white/15 text-white/70 hover:text-white hover:border-cyan/40 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* ─── PHONE MOCKUP VIEW ─── */}
        {deviceFrame === "phone" ? (
          <div className="relative mx-auto my-auto max-h-[66vh] sm:max-h-[72vh] aspect-[9/19] rounded-[36px] sm:rounded-[40px] p-2 bg-[#121218] border-[4px] sm:border-[6px] border-zinc-700 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Dynamic Island Notch */}
            <div className="absolute top-2.5 sm:top-3 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-4 sm:h-5 bg-black rounded-full z-30 flex items-center justify-end pr-2 pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1e2a40] border border-blue-400/40" />
            </div>

            {/* Lockscreen Clock Overlay */}
            <div className="absolute top-9 sm:top-12 inset-x-0 z-20 text-center select-none pointer-events-none">
              <div className="text-[10px] sm:text-xs font-sans font-medium text-white/80 tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {clockDate}
              </div>
              <div className="text-4xl sm:text-5xl font-sans font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                {clockTime.slice(0, 5)}
              </div>
            </div>

            {/* Wallpaper Inner Screen */}
            <div className="relative w-full h-full rounded-[28px] sm:rounded-[32px] overflow-hidden bg-black flex items-center justify-center">
              {wallpaper.isVideo ? (
                <video
                  src={wallpaper.rawUrl}
                  poster={getThumbnailUrl(wallpaper)}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={getFullUrl(wallpaper)}
                  alt={wallpaper.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Home Indicator bar */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/70 rounded-full z-30 pointer-events-none" />
          </div>
        ) : deviceFrame === "laptop" ? (
          /* ─── LAPTOP MOCKUP VIEW ─── */
          <div className="relative mx-auto my-auto max-w-[92vw] sm:max-w-[75vw] lg:max-w-[60vw] w-full flex flex-col items-center animate-in zoom-in-95 duration-200">
            {/* Screen Lid */}
            <div className="w-full aspect-[16/10] bg-[#121218] border-[6px] sm:border-[8px] border-zinc-700 rounded-t-xl overflow-hidden relative shadow-2xl flex flex-col">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-2.5 bg-black rounded-b-md z-30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
              </div>
              {/* Inner Screen */}
              <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
                {wallpaper.isVideo ? (
                  <video
                    src={wallpaper.rawUrl}
                    poster={getThumbnailUrl(wallpaper)}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={getFullUrl(wallpaper)}
                    alt={wallpaper.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            {/* Base */}
            <div className="w-[104%] h-3 sm:h-4 bg-zinc-800 border-t border-zinc-600 rounded-b-lg flex items-center justify-center shadow-lg">
              <div className="w-16 h-1 bg-zinc-950 rounded-full" />
            </div>
          </div>
        ) : (
          /* ─── RAW VIEW (DEFAULT) ─── */
          wallpaper.isVideo ? (
            <video
              key={wallpaper.id}
              src={wallpaper.rawUrl}
              poster={getThumbnailUrl(wallpaper)}
              autoPlay
              loop
              muted
              playsInline
              className="lightbox-image max-h-[42vh] sm:max-h-full max-w-full object-contain"
            />
          ) : (
            <div key={wallpaper.id} className="lightbox-image relative grid max-h-full max-w-full place-items-center">
              {wallpaper.type !== "animated" && (
                <img
                  src={getThumbnailUrl(wallpaper)}
                  alt=""
                  aria-hidden
                  className="col-start-1 row-start-1 max-h-[42vh] sm:max-h-[calc(100vh-210px)] max-w-full object-contain"
                  style={{
                    width: wallpaper.width || undefined,
                    aspectRatio:
                      wallpaper.width && wallpaper.height
                        ? `${wallpaper.width}/${wallpaper.height}`
                        : undefined,
                  }}
                />
              )}
              <img
                src={getFullUrl(wallpaper)}
                alt={wallpaper.title}
                decoding="async"
                className={`col-start-1 row-start-1 max-h-[42vh] sm:max-h-[calc(100vh-210px)] max-w-full object-contain transition-opacity duration-500 ${
                  loaded || wallpaper.type === "animated" ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setLoadedId(wallpaper.id)}
              />
              {!loaded && wallpaper.type !== "animated" && (
                <span className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/70 border border-white/10 px-2 py-1 text-[9px] text-muted tracking-widest font-mono">
                  <Loader2 className="h-3 w-3 animate-spin" /> LOADING FULL RES
                </span>
              )}
            </div>
          )
        )}

        {hasNext && (
          <button
            onClick={() => {
              sound.playSlide();
              triggerHaptic("light");
              onNext();
            }}
            aria-label="Next"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 sm:h-10 sm:w-10 items-center justify-center bg-black/70 border border-white/15 text-white/70 hover:text-white hover:border-cyan/40 transition-colors cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Bottom Download Bar */}
      <div
        className="relative z-10 shrink-0 border-t border-white/[0.08] bg-[#060609]/95 backdrop-blur-md px-3 sm:px-5 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] w-full max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {convertible ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 min-w-0">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[10px] sm:text-[9px] text-zinc-400 font-bold tracking-widest shrink-0 font-mono">SIZE</span>
              <div className="flex items-center gap-1.5 shrink-0">
                {sizes.map((s) => (
                  <Chip key={s.id} active={size.id === s.id} onClick={() => setSizeId(s.id)}>
                    {s.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[10px] sm:text-[9px] text-zinc-400 font-bold tracking-widest shrink-0 font-mono">FORMAT</span>
              <div className="flex items-center gap-1.5 shrink-0">
                {FORMATS.filter((f) => f.id === "original" || f.label !== sourceLabel).map((f) => (
                  <Chip key={f.id} active={format === f.id} onClick={() => setFormat(f.id)}>
                    {f.id === "original" ? `ORIGINAL ${wallpaper.format}` : f.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-xs text-zinc-300 font-mono">
            {wallpaper.format} downloads as the original file.
          </span>
        )}

        <button
          onClick={startDownload}
          disabled={busy}
          className={`w-full md:w-auto shrink-0 flex items-center justify-center gap-2 px-5 min-h-[44px] text-xs font-bold transition-all cursor-pointer disabled:cursor-wait font-mono ${
            downloadSuccess
              ? "bg-emerald-400 text-black shadow-[0_0_15px_rgba(52,211,153,0.3)]"
              : "bg-cyan text-black hover:bg-cyan/80 disabled:opacity-60"
          }`}
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>FETCHING ASSET...</span>
            </>
          ) : downloadSuccess ? (
            <>
              <Check className="h-4 w-4 stroke-[3]" />
              <span>DOWNLOAD COMPLETE // READY</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>DOWNLOAD WALLPAPER</span>
            </>
          )}
        </button>
      </div>

      <div className="hidden md:block relative z-10 shrink-0 text-center py-2 text-[10px] text-muted/40 bg-[#060609]/90 backdrop-blur-md border-t border-white/[0.04]">
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] mr-1">←</kbd>
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] mr-2">→</kbd>navigate
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] ml-3 mr-1">↵</kbd>download
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] ml-3 mr-1">s</kbd>stash
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] ml-3 mr-1">p</kbd>palette
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] ml-3 mr-1">c</kbd>studio
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] ml-3 mr-1">f</kbd>focus hud
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] ml-3 mr-1">m</kbd>mockup
        <kbd className="border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[9px] ml-3 mr-1">esc</kbd>close
      </div>

      {paletteOpen && (
        <PaletteModal
          imageSrc={getFullUrl(wallpaper)}
          title={wallpaper.title}
          onClose={() => setPaletteOpen(false)}
        />
      )}
      {studioOpen && (
        <StudioModal
          imageSrc={getFullUrl(wallpaper)}
          title={wallpaper.title}
          onClose={() => setStudioOpen(false)}
        />
      )}
    </div>
  );
}

