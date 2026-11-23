"use client";

import { useEffect, useState } from "react";
import { X, Check, Copy, Palette, Terminal, Download, Monitor, Zap, Code2, Sparkles, FileText } from "lucide-react";
import {
  extractPaletteFromImage,
  formatAsCssVars,
  formatAsHexList,
  formatAsJson,
  formatAsPolybar,
  formatAsHyprland,
  formatAsKitty,
  formatAsAlacritty,
  formatAsPywal,
  formatAsWaybar,
  type ExtractedPalette,
  type PaletteColor,
} from "@/lib/palette";
import { generateAsciiArt, type AsciiResult } from "@/lib/ascii";
import { sound } from "@/lib/sound";
import { triggerHaptic } from "@/lib/haptics";

interface PaletteModalProps {
  imageSrc: string;
  title: string;
  onClose: () => void;
}

type MainTab = "ascii" | "dotfiles";
type DotfileFormat = "hyprland" | "kitty" | "alacritty" | "pywal" | "waybar" | "css" | "hex" | "json";
type PhosphorColor = "rgb" | "cyan" | "green" | "amber";

export function PaletteModal({ imageSrc, title, onClose }: PaletteModalProps) {
  const [mainTab, setMainTab] = useState<MainTab>("ascii");
  
  // Palette state
  const [paletteData, setPaletteData] = useState<ExtractedPalette | null>(null);
  const [paletteLoading, setPaletteLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [format, setFormat] = useState<DotfileFormat>("hyprland");
  const [copiedDotfile, setCopiedDotfile] = useState(false);

  // ASCII state
  const [asciiData, setAsciiData] = useState<AsciiResult | null>(null);
  const [asciiLoading, setAsciiLoading] = useState(true);
  const [asciiCols, setAsciiCols] = useState<40 | 60 | 80>(60);
  const [phosphor, setPhosphor] = useState<PhosphorColor>("rgb");
  const [copiedAscii, setCopiedAscii] = useState<"plain" | "ansi" | null>(null);

  // Load palette data
  useEffect(() => {
    let active = true;
    setPaletteLoading(true);
    extractPaletteFromImage(imageSrc).then((res) => {
      if (active) {
        setPaletteData(res);
        setPaletteLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [imageSrc]);

  // Load ASCII art on column changes
  useEffect(() => {
    let active = true;
    setAsciiLoading(true);
    generateAsciiArt(imageSrc, asciiCols, false).then((res) => {
      if (active) {
        setAsciiData(res);
        setAsciiLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [imageSrc, asciiCols]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        sound.playSwitch();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copyToClipboard = (text: string, cb?: () => void) => {
    sound.playSwitch();
    triggerHaptic("light");
    navigator.clipboard?.writeText(text).then(() => {
      cb?.();
    });
  };

  const handleCopySingle = (color: PaletteColor, index: number) => {
    copyToClipboard(color.hex, () => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    });
  };

  const getDotfileContent = (): string => {
    if (!paletteData) return "";
    switch (format) {
      case "hyprland":
        return formatAsHyprland(paletteData.colors);
      case "kitty":
        return formatAsKitty(paletteData.colors);
      case "alacritty":
        return formatAsAlacritty(paletteData.colors);
      case "pywal":
        return formatAsPywal(paletteData.colors);
      case "waybar":
        return formatAsWaybar(paletteData.colors);
      case "css":
        return formatAsCssVars(paletteData.colors);
      case "hex":
        return formatAsHexList(paletteData.colors);
      case "json":
        return formatAsJson(paletteData.colors);
    }
  };

  const handleCopyDotfile = () => {
    const text = getDotfileContent();
    copyToClipboard(text, () => {
      setCopiedDotfile(true);
      setTimeout(() => setCopiedDotfile(false), 2000);
    });
  };

  const handleDownloadAscii = () => {
    if (!asciiData) return;
    sound.playDownload();
    triggerHaptic("medium");
    const blob = new Blob([asciiData.ansiText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.download = `void-${safeTitle}-ascii.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPhosphorTextColor = () => {
    switch (phosphor) {
      case "cyan":
        return "text-[#00f0ff]";
      case "green":
        return "text-[#39ff14]";
      case "amber":
        return "text-[#ffb000]";
      default:
        return "text-white";
    }
  };

  return (
    <div
      className="lightbox-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-sm"
      onClick={() => {
        sound.playSwitch();
        onClose();
      }}
    >
      <div
        className="w-full max-w-2xl border border-border bg-[#0a0a0f] max-h-[94vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Unix Rice Forge & ASCII Matrix"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-border px-3.5 sm:px-4 py-2.5 shrink-0 bg-black/50">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-cyan animate-pulse" />
            <h2 className="text-xs font-bold tracking-widest text-white uppercase font-mono">
              UNIX_RICE_FORGE <span className="text-cyan">{"//"}</span> {mainTab === "ascii" ? "ANSI_ASCII_RENDER" : "DOTFILE_MATRIX"}
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playSwitch();
              triggerHaptic("light");
              onClose();
            }}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center border border-border text-muted hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Primary Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-border bg-black/70 shrink-0 font-mono text-[11px] sm:text-xs">
          <button
            onClick={() => {
              sound.playSwitch();
              triggerHaptic("light");
              setMainTab("ascii");
            }}
            className={`min-h-[44px] py-2 px-2 sm:px-3 font-bold flex items-center justify-center gap-1.5 sm:gap-2 border-r border-border transition-colors cursor-pointer text-center ${
              mainTab === "ascii"
                ? "bg-cyan/15 text-cyan border-b-2 border-b-cyan"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Terminal className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">ASCII_RENDERER</span>
          </button>
          <button
            onClick={() => {
              sound.playSwitch();
              triggerHaptic("light");
              setMainTab("dotfiles");
            }}
            className={`min-h-[44px] py-2 px-2 sm:px-3 font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer text-center ${
              mainTab === "dotfiles"
                ? "bg-cyan/15 text-cyan border-b-2 border-b-cyan"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Code2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">DOTFILES (HYPR/KITTY)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-4 flex-1 overflow-y-auto space-y-3 font-mono">
          {mainTab === "ascii" ? (
            /* ═══════ ASCII TAB ═══════ */
            <div className="space-y-3">
              {/* ASCII Sub-Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-[#0d0d14] border border-border/80 text-[10px]">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                  <span className="text-zinc-400 shrink-0">PHOSPHOR:</span>
                  {(["rgb", "cyan", "green", "amber"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        sound.playSwitch();
                        triggerHaptic("light");
                        setPhosphor(p);
                      }}
                      className={`min-h-[36px] sm:min-h-0 px-2 py-1 uppercase font-bold border transition-colors cursor-pointer shrink-0 ${
                        phosphor === p
                          ? "border-cyan bg-cyan/20 text-cyan"
                          : "border-border text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {p === "rgb" ? "TRUECOLOR" : p}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                  <span className="text-zinc-400 shrink-0">WIDTH:</span>
                  {([40, 60, 80] as const).map((cols) => (
                    <button
                      key={cols}
                      onClick={() => {
                        sound.playSwitch();
                        triggerHaptic("light");
                        setAsciiCols(cols);
                      }}
                      className={`min-h-[36px] sm:min-h-0 px-2.5 py-1 font-bold border transition-colors cursor-pointer shrink-0 ${
                        asciiCols === cols
                          ? "border-cyan bg-cyan/20 text-cyan"
                          : "border-border text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {cols}c
                    </button>
                  ))}
                </div>
              </div>

              {/* Terminal Screen Stage */}
              <div className="relative bg-[#050508] border border-border/90 p-2 sm:p-3 overflow-auto max-h-[46vh] scrollbar-thin select-all font-mono leading-none tracking-normal">
                {asciiLoading ? (
                  <div className="py-20 text-center text-xs text-cyan animate-pulse">
                    [COMPUTING MONOSPACE LUMINANCE MATRIX...]
                  </div>
                ) : asciiData ? (
                  <pre
                    className={`text-[7px] sm:text-[8px] leading-[1.0] font-mono whitespace-pre ${getPhosphorTextColor()}`}
                    style={{
                      fontFamily: '"JetBrains Mono", "Courier New", monospace',
                      textShadow:
                        phosphor === "green"
                          ? "0 0 4px #39ff14"
                          : phosphor === "cyan"
                          ? "0 0 4px #00f0ff"
                          : phosphor === "amber"
                          ? "0 0 4px #ffb000"
                          : "none",
                    }}
                  >
                    {phosphor === "rgb"
                      ? asciiData.coloredSpans.map((row, rIdx) => (
                          <div key={rIdx}>
                            {row.map((span, cIdx) => (
                              <span key={cIdx} style={{ color: span.color }}>
                                {span.char}
                              </span>
                            ))}
                          </div>
                        ))
                      : asciiData.text}
                  </pre>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => {
                    if (!asciiData) return;
                    copyToClipboard(asciiData.ansiText, () => {
                      setCopiedAscii("ansi");
                      setTimeout(() => setCopiedAscii(null), 2000);
                    });
                  }}
                  className={`min-h-[44px] px-2 sm:px-3 py-2 flex items-center justify-center gap-1.5 border text-[11px] sm:text-xs font-bold transition-colors cursor-pointer text-center ${
                    copiedAscii === "ansi"
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                      : "border-cyan bg-cyan/15 text-cyan hover:bg-cyan/25"
                  }`}
                >
                  {copiedAscii === "ansi" ? <Check className="h-4 w-4 shrink-0" /> : <Copy className="h-4 w-4 shrink-0" />}
                  <span>COPY ANSI (FOR FASTFETCH)</span>
                </button>

                <button
                  onClick={() => {
                    if (!asciiData) return;
                    copyToClipboard(asciiData.text, () => {
                      setCopiedAscii("plain");
                      setTimeout(() => setCopiedAscii(null), 2000);
                    });
                  }}
                  className={`min-h-[44px] px-2 sm:px-3 py-2 flex items-center justify-center gap-1.5 border text-[11px] sm:text-xs font-bold transition-colors cursor-pointer text-center ${
                    copiedAscii === "plain"
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                      : "border-border bg-[#101018] text-zinc-300 hover:text-white hover:border-zinc-500"
                  }`}
                >
                  {copiedAscii === "plain" ? <Check className="h-4 w-4 shrink-0" /> : <FileText className="h-4 w-4 shrink-0" />}
                  <span>COPY PLAIN TEXT</span>
                </button>

                <button
                  onClick={handleDownloadAscii}
                  className="min-h-[44px] px-2 sm:px-3 py-2 flex items-center justify-center gap-1.5 border border-border bg-[#101018] text-zinc-300 hover:text-white hover:border-zinc-500 text-[11px] sm:text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  <Download className="h-4 w-4 shrink-0" />
                  <span>DOWNLOAD .TXT FILE</span>
                </button>
              </div>
            </div>
          ) : (
            /* ═══════ DOTFILES TAB ═══════ */
            <div className="space-y-3">
              {/* 5 Swatches Grid */}
              {paletteLoading ? (
                <div className="py-8 text-center text-xs text-cyan animate-pulse">
                  [CALIBRATING 16-COLOR MATRIX...]
                </div>
              ) : paletteData ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5">
                    {paletteData.colors.map((color, idx) => (
                      <button
                        key={color.hex + idx}
                        onClick={() => handleCopySingle(color, idx)}
                        className="flex sm:flex-col items-center justify-between sm:justify-start gap-1.5 p-1.5 border border-border/80 hover:border-cyan/50 bg-[#101018] transition-all cursor-pointer group text-left min-h-[44px] sm:min-h-[85px]"
                      >
                        <div
                          className="w-6 h-6 sm:w-full sm:h-9 rounded-sm border border-white/20 shrink-0 relative flex items-center justify-center shadow-inner"
                          style={{ backgroundColor: color.hex }}
                        >
                          {copiedIndex === idx && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[9px] font-mono font-bold">
                              COPIED
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] text-zinc-400 truncate">
                            {color.label.split(" // ")[0]}
                          </div>
                          <div className="text-[10px] font-bold text-white group-hover:text-cyan transition-colors">
                            {color.hex}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Dotfile Format Selector Pills */}
                  <div className="pt-2 border-t border-border/70 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span>SELECT TARGET CONFIG FORMAT:</span>
                      <span className="text-cyan font-bold uppercase">{format}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                      {(
                        [
                          { id: "hyprland", label: "HYPRLAND (.conf)" },
                          { id: "kitty", label: "KITTY (.conf)" },
                          { id: "alacritty", label: "ALACRITTY (.toml)" },
                          { id: "pywal", label: "PYWAL (.json)" },
                          { id: "waybar", label: "WAYBAR (.css)" },
                          { id: "css", label: "CSS_VARS (:root)" },
                          { id: "hex", label: "HEX_LIST" },
                          { id: "json", label: "JSON_SPEC" },
                        ] as const
                      ).map((f) => (
                        <button
                          key={f.id}
                          onClick={() => {
                            sound.playSwitch();
                            triggerHaptic("light");
                            setFormat(f.id);
                          }}
                          className={`min-h-[44px] sm:min-h-0 py-1.5 px-2 font-bold border transition-colors cursor-pointer flex items-center justify-center text-center ${
                            format === f.id
                              ? "border-cyan bg-cyan/15 text-cyan"
                              : "border-border text-zinc-400 hover:text-white hover:border-zinc-500"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {/* Syntax Code Preview Box */}
                    <div className="p-2.5 bg-black/75 border border-border/70 font-mono text-[10px] text-zinc-300 overflow-x-auto max-h-40 scrollbar-thin">
                      <pre className="whitespace-pre">{getDotfileContent()}</pre>
                    </div>

                    {/* 1-Tap Copy Button */}
                    <button
                      onClick={handleCopyDotfile}
                      className={`w-full min-h-[44px] flex items-center justify-center gap-2 border text-xs font-bold tracking-wider transition-colors cursor-pointer ${
                        copiedDotfile
                          ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                          : "border-cyan bg-cyan/15 text-cyan hover:bg-cyan/25"
                      }`}
                    >
                      {copiedDotfile ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>CONFIG COPIED TO CLIPBOARD // SUCCESS</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>COPY {format.toUpperCase()} CONFIG</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
