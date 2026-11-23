"use client";

import { useEffect, useState } from "react";
import { X, Check, Copy, Palette, Sparkles, Terminal, Layers } from "lucide-react";
import {
  extractPaletteFromImage,
  formatAsCssVars,
  formatAsHexList,
  formatAsJson,
  formatAsPolybar,
  type ExtractedPalette,
  type PaletteColor,
} from "@/lib/palette";
import { sound } from "@/lib/sound";
import { triggerHaptic } from "@/lib/haptics";

interface PaletteModalProps {
  imageSrc: string;
  title: string;
  onClose: () => void;
}

export function PaletteModal({ imageSrc, title, onClose }: PaletteModalProps) {
  const [data, setData] = useState<ExtractedPalette | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [format, setFormat] = useState<"hex" | "css" | "polybar" | "json">("hex");
  const [copiedFormat, setCopiedFormat] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    extractPaletteFromImage(imageSrc).then((res) => {
      if (active) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [imageSrc]);

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

  const handleCopyFormat = () => {
    if (!data) return;
    let text = "";
    if (format === "hex") text = formatAsHexList(data.colors);
    else if (format === "css") text = formatAsCssVars(data.colors);
    else if (format === "polybar") text = formatAsPolybar(data.colors);
    else if (format === "json") text = formatAsJson(data.colors);

    copyToClipboard(text, () => {
      setCopiedFormat(true);
      setTimeout(() => setCopiedFormat(false), 2000);
    });
  };

  return (
    <div
      className="lightbox-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-sm"
      onClick={() => {
        sound.playSwitch();
        onClose();
      }}
    >
      <div
        className="w-full max-w-lg border border-border bg-[#0a0a0f] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Wallpaper Cyber Ricing Palette"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-border px-3.5 sm:px-4 py-2.5 shrink-0 bg-black/50">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-cyan animate-pulse" />
            <h2 className="text-xs font-bold tracking-widest text-white uppercase font-mono">
              PALETTE_EXTRACTOR <span className="text-cyan">{"//"}</span> RICING_MATRIX
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playSwitch();
              triggerHaptic("light");
              onClose();
            }}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center border border-border text-muted hover:text-white hover:border-white/30 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-5 flex-1 overflow-y-auto space-y-4">
          <div className="text-[11px] font-mono text-zinc-400 border-l-2 border-cyan/60 pl-2.5">
            <span className="text-white font-bold">{title}</span>
            <div className="text-[10px] text-zinc-500">
              5-TONE CYBERPUNK COLORWAY // ZERO-LATENCY SAMPLING
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-cyan animate-pulse">
              [ANALYZING PIXEL FREQUENCY MATRIX...]
            </div>
          ) : data ? (
            <>
              {/* Swatches Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {data.colors.map((color, idx) => (
                  <button
                    key={color.hex + idx}
                    onClick={() => handleCopySingle(color, idx)}
                    className="flex sm:flex-col items-center justify-between sm:justify-start gap-2 p-2 border border-border/80 hover:border-cyan/50 bg-[#101018] transition-all cursor-pointer group text-left min-h-[50px] sm:min-h-[110px]"
                  >
                    <div
                      className="w-8 h-8 sm:w-full sm:h-12 rounded-sm border border-white/20 shrink-0 relative flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: color.hex }}
                    >
                      {copiedIndex === idx && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[9px] font-mono font-bold">
                          COPIED
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono text-zinc-400 truncate">
                        {color.label.split(" // ")[0]}
                      </div>
                      <div className="text-[11px] font-mono font-bold text-white group-hover:text-cyan transition-colors">
                        {color.hex}
                      </div>
                      <div className="text-[9px] font-mono text-zinc-500 hidden sm:block">
                        LUM: {color.luminance}%
                      </div>
                    </div>
                    <div className="sm:hidden text-zinc-400 group-hover:text-cyan">
                      {copiedIndex === idx ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Format Selector */}
              <div className="pt-2 border-t border-border/60">
                <div className="text-[10px] font-mono text-zinc-400 tracking-wider mb-2 uppercase flex items-center gap-1.5">
                  <Terminal className="h-3 w-3 text-cyan" />
                  <span>EXPORT_FORMAT_SPECIFIER</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(
                    [
                      { id: "hex", label: "HEX_LIST" },
                      { id: "css", label: "CSS_ROOT" },
                      { id: "polybar", label: "LINUX_RICE" },
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
                      className={`min-h-[44px] sm:min-h-0 py-1.5 px-2 text-[10px] font-mono font-bold border transition-colors cursor-pointer flex items-center justify-center ${
                        format === f.id
                          ? "border-cyan bg-cyan/15 text-cyan"
                          : "border-border text-zinc-400 hover:text-white hover:border-zinc-500"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Code Preview Box */}
                <div className="mt-2.5 p-2.5 bg-black/70 border border-border/60 font-mono text-[10px] text-zinc-300 overflow-x-auto max-h-24 scrollbar-thin">
                  <pre className="whitespace-pre">
                    {format === "hex" && formatAsHexList(data.colors)}
                    {format === "css" && formatAsCssVars(data.colors)}
                    {format === "polybar" && formatAsPolybar(data.colors)}
                    {format === "json" && formatAsJson(data.colors)}
                  </pre>
                </div>

                {/* 1-Tap Copy Action */}
                <button
                  onClick={handleCopyFormat}
                  className={`mt-3 w-full min-h-[44px] flex items-center justify-center gap-2 border text-xs font-mono font-bold tracking-wider transition-colors cursor-pointer ${
                    copiedFormat
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                      : "border-cyan bg-cyan/15 text-cyan hover:bg-cyan/25"
                  }`}
                >
                  {copiedFormat ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>COPIED TO CLIPBOARD // SUCCESS</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>COPY FORMATTED PALETTE</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
