"use client";

import { useEffect, useRef, useState } from "react";
import { X, Sliders, Download, Check, RefreshCw, Zap, Tv, Eye, Sparkles } from "lucide-react";
import { sound } from "@/lib/sound";
import { triggerHaptic } from "@/lib/haptics";

interface StudioModalProps {
  imageSrc: string;
  title: string;
  onClose: () => void;
}

export function StudioModal({ imageSrc, title, onClose }: StudioModalProps) {
  const [blackCrush, setBlackCrush] = useState<number>(30); // 0 = off, 1-60 = crush threshold
  const [contrast, setContrast] = useState<number>(120); // 100 = normal
  const [brightness, setBrightness] = useState<number>(100);
  const [scanlines, setScanlines] = useState<boolean>(false);
  const [vignette, setVignette] = useState<number>(40);
  const [processing, setProcessing] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

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

  const handleReset = () => {
    sound.playSwitch();
    triggerHaptic("light");
    setBlackCrush(0);
    setContrast(100);
    setBrightness(100);
    setScanlines(false);
    setVignette(0);
  };

  const handleDownload = async () => {
    sound.playDownload();
    triggerHaptic("medium");
    setProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Image load failed"));
        img.src = imageSrc;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Canvas context unavailable");

      // Draw base image with brightness/contrast filters
      ctx.filter = `contrast(${contrast}%) brightness(${brightness}%)`;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";

      // AMOLED Black Crusher pixel pass
      if (blackCrush > 0) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const threshold = (blackCrush / 100) * 255;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Standard perception-weighted luminance
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum < threshold) {
            // Crush directly to pure #000000 OLED zero-power state
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // Vignette pass
      if (vignette > 0) {
        const radius = Math.max(canvas.width, canvas.height) * 0.75;
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          radius * 0.3,
          canvas.width / 2,
          canvas.height / 2,
          radius
        );
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(1, `rgba(0,0,0,${(vignette / 100) * 0.85})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // CRT Scanline pass
      if (scanlines) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        for (let y = 0; y < canvas.height; y += 4) {
          ctx.fillRect(0, y, canvas.width, 2);
        }
      }

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) throw new Error("Blob conversion failed");
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        a.download = `void-${safeTitle}-amoled.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setProcessing(false);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }, "image/png");
    } catch {
      setProcessing(false);
      // Fallback direct link
      window.open(imageSrc, "_blank");
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
        className="w-full max-w-2xl border border-border bg-[#0a0a0f] max-h-[95vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Cyber Studio & AMOLED Black Crusher"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-3.5 sm:px-4 py-2.5 shrink-0 bg-black/50">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan" />
            <h2 className="text-xs font-bold tracking-widest text-white uppercase font-mono">
              CYBER_STUDIO <span className="text-cyan">{"//"}</span> AMOLED_CRUSHER
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              title="Reset Filters"
              className="flex h-9 px-2 items-center gap-1 border border-border text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="hidden sm:inline">RESET</span>
            </button>
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
        </div>

        {/* Studio Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {/* Live CSS-Accelerated Preview Stage */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[40vh] bg-black border border-border/80 overflow-hidden flex items-center justify-center select-none">
            {/* The Wallpaper Image with Hardware CSS Filters */}
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-full object-contain transition-all duration-75"
              style={{
                filter: `contrast(${contrast}%) brightness(${brightness}%)`,
              }}
            />

            {/* AMOLED Black Threshold Overlay Simulation */}
            {blackCrush > 0 && (
              <div
                className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-60 transition-opacity"
                style={{
                  backgroundColor: `rgba(0,0,0, ${blackCrush / 100})`,
                }}
              />
            )}

            {/* Vignette Overlay */}
            {vignette > 0 && (
              <div
                className="absolute inset-0 pointer-events-none transition-opacity"
                style={{
                  background: `radial-gradient(circle at center, transparent 30%, rgba(0,0,0,${
                    (vignette / 100) * 0.9
                  }) 100%)`,
                }}
              />
            )}

            {/* CRT Scanline Overlay */}
            {scanlines && (
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-75" />
            )}

            {/* Stage Indicator Badges */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none">
              <span className="text-[9px] font-mono bg-black/80 border border-cyan/40 text-cyan px-1.5 py-0.5">
                GPU_ACCELERATED // 120HZ
              </span>
              {blackCrush > 0 && (
                <span className="text-[9px] font-mono bg-black/80 border border-emerald-500/50 text-emerald-400 px-1.5 py-0.5">
                  AMOLED PURE #000000
                </span>
              )}
            </div>
          </div>

          {/* Interactive Tactical Controls */}
          <div className="space-y-3 font-mono text-xs">
            {/* 1. AMOLED Black Crusher */}
            <div className="p-2.5 bg-[#0f0f18] border border-border/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-emerald-400" />
                  AMOLED_BLACK_CRUSHER (BATTERY_SAVER)
                </span>
                <span className="text-emerald-400 font-bold">{blackCrush}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={blackCrush}
                onChange={(e) => setBlackCrush(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-2 bg-zinc-800 rounded-none"
              />
              <div className="text-[10px] text-zinc-500">
                Forces near-black pixels to pure #000000. Completely shuts off OLED display pixels.
              </div>
            </div>

            {/* 2. Cyber Contrast & Brightness */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-[#0f0f18] border border-border/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">CYBER_CONTRAST</span>
                  <span className="text-cyan font-bold">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="180"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-cyan cursor-pointer h-2 bg-zinc-800 rounded-none"
                />
              </div>

              <div className="p-2.5 bg-[#0f0f18] border border-border/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">NEON_BRIGHTNESS</span>
                  <span className="text-cyan font-bold">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="140"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-cyan cursor-pointer h-2 bg-zinc-800 rounded-none"
                />
              </div>
            </div>

            {/* 3. Toggles: CRT Scanlines & Vignette */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-[#0f0f18] border border-border/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">VIGNETTE_SHADOW</span>
                  <span className="text-cyan font-bold">{vignette}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={vignette}
                  onChange={(e) => setVignette(Number(e.target.value))}
                  className="w-full accent-cyan cursor-pointer h-2 bg-zinc-800 rounded-none"
                />
              </div>

              <div className="p-2.5 bg-[#0f0f18] border border-border/70 flex items-center justify-between">
                <div>
                  <div className="text-white font-bold flex items-center gap-1.5">
                    <Tv className="h-3.5 w-3.5 text-cyan" />
                    CRT_SCANLINES
                  </div>
                  <div className="text-[10px] text-zinc-500">Arcade CRT phosphor grid</div>
                </div>
                <button
                  onClick={() => {
                    sound.playSwitch();
                    triggerHaptic("light");
                    setScanlines(!scanlines);
                  }}
                  className={`min-h-[44px] min-w-[60px] px-3 py-1 font-bold border transition-colors cursor-pointer ${
                    scanlines
                      ? "border-cyan bg-cyan/20 text-cyan"
                      : "border-border text-zinc-500 hover:text-white"
                  }`}
                >
                  {scanlines ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-3 sm:p-4 border-t border-border bg-black/60 shrink-0">
          <button
            onClick={handleDownload}
            disabled={processing}
            className={`w-full min-h-[48px] flex items-center justify-center gap-2 border text-xs font-mono font-bold tracking-wider transition-colors cursor-pointer ${
              downloadSuccess
                ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                : "border-cyan bg-cyan/20 text-cyan hover:bg-cyan/30 disabled:opacity-50"
            }`}
          >
            {processing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>RENDERING FULL-RES AMOLED BUFFER...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="h-4 w-4" />
                <span>EXPORT COMPLETE // DOWNLOADED</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>APPLY FILTERS & DOWNLOAD CUSTOM WALLPAPER</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
