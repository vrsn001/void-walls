import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Download,
  Heart,
  ExternalLink,
  Copy,
  Share2,
  Monitor,
  ChevronLeft,
  ChevronRight,
  X,
  Sliders,
  Check
} from 'lucide-react';
import type { Wallpaper } from '../types';
import {
  copyToClipboard,
  triggerCustomDownload,
  type DownloadFormat,
  type DownloadResolution
} from '../utils/download';

interface LightboxModalProps {
  wallpaper: Wallpaper | null;
  allWallpapers: Wallpaper[];
  onClose: () => void;
  onSelectWallpaper: (wallpaper: Wallpaper) => void;
  isFavorite: boolean;
  onToggleFavorite: (wallpaper: Wallpaper) => void;
  onDownload: (wallpaper: Wallpaper) => void;
  onOpenGuide: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  wallpaper,
  allWallpapers,
  onClose,
  onSelectWallpaper,
  isFavorite,
  onToggleFavorite,
  onOpenGuide,
}) => {
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat>('original');
  const [selectedResolution, setSelectedResolution] = useState<DownloadResolution>('original');
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePrev = useCallback(() => {
    if (!wallpaper || allWallpapers.length === 0) return;
    const idx = allWallpapers.findIndex((w) => w.id === wallpaper.id);
    if (idx > 0) onSelectWallpaper(allWallpapers[idx - 1]);
    else onSelectWallpaper(allWallpapers[allWallpapers.length - 1]);
  }, [wallpaper, allWallpapers, onSelectWallpaper]);

  const handleNext = useCallback(() => {
    if (!wallpaper || allWallpapers.length === 0) return;
    const idx = allWallpapers.findIndex((w) => w.id === wallpaper.id);
    if (idx < allWallpapers.length - 1) onSelectWallpaper(allWallpapers[idx + 1]);
    else onSelectWallpaper(allWallpapers[0]);
  }, [wallpaper, allWallpapers, onSelectWallpaper]);

  const handleCustomDownload = useCallback(async () => {
    if (!wallpaper || isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress('Starting pipeline...');
    try {
      await triggerCustomDownload({
        wallpaper,
        format: selectedFormat,
        resolution: selectedResolution,
        onProgress: (msg) => setDownloadProgress(msg),
      });
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(null);
      }, 1800);
    }
  }, [wallpaper, isDownloading, selectedFormat, selectedResolution]);

  useEffect(() => {
    if (!wallpaper) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key.toLowerCase() === 'd') handleCustomDownload();
      else if (e.key.toLowerCase() === 'f') onToggleFavorite(wallpaper);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wallpaper, handlePrev, handleNext, onClose, onToggleFavorite, handleCustomDownload]);

  if (!wallpaper) return null;

  const handleCopyRaw = async () => {
    const success = await copyToClipboard(wallpaper.rawUrl);
    if (success) {
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    }
  };

  const handleCopyMarkdown = async () => {
    const md = `![${wallpaper.title}](${wallpaper.cdnUrl || wallpaper.rawUrl})`;
    const success = await copyToClipboard(md);
    if (success) {
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    }
  };

  const related = allWallpapers
    .filter((w) => w.category === wallpaper.category && w.id !== wallpaper.id)
    .slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-2 sm:p-6 animate-fade-in font-mono">
      {/* Pure Brutalist Window with Sharp Point Edges */}
      <div className="relative flex h-full max-h-[94vh] w-full max-w-7xl flex-col rounded-none border border-white/20 bg-[#050507] shadow-2xl overflow-hidden">
        {/* Top Window Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-black px-4 py-2.5 text-white">
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-sky-500/20 text-sky-400 px-1.5 py-0.5 border border-sky-500/40 text-[10px] uppercase font-bold tracking-wider">
              HOMELANDER_INSPECT // PERFECTION
            </span>
            <span className="text-neutral-400 font-mono text-[11px] truncate max-w-[200px] sm:max-w-md">
              {wallpaper.title}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1 rounded-none border border-white/20 bg-black px-2.5 py-1 text-xs text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Previous (Left Arrow)"
            >
              <ChevronLeft className="h-3 w-3" />
              <span className="hidden sm:inline text-[11px]">PREV</span>
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1 rounded-none border border-white/20 bg-black px-2.5 py-1 text-xs text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Next (Right Arrow)"
            >
              <span className="hidden sm:inline text-[11px]">NEXT</span>
              <ChevronRight className="h-3 w-3" />
            </button>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-none border border-white/20 bg-black text-neutral-300 hover:text-white hover:bg-white/10 transition-colors ml-1"
              title="Close (Esc)"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          {/* Main Stage Media Preview */}
          <div className="relative flex-1 bg-black p-4 sm:p-6 flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
            {wallpaper.isVideo ? (
              <video
                ref={videoRef}
                src={wallpaper.rawUrl}
                controls
                autoPlay
                loop
                playsInline
                className="max-h-[72vh] max-w-full rounded-none border border-white/10 object-contain shadow-2xl"
              />
            ) : (
              <img
                src={wallpaper.rawUrl}
                alt={wallpaper.title}
                className="max-h-[72vh] max-w-full rounded-none border border-white/10 object-contain shadow-2xl"
              />
            )}

            {/* Keyboard shortcuts pill */}
            <div className="absolute bottom-3 left-4 hidden lg:flex items-center gap-2 text-[10px] text-neutral-500 rounded-none border border-white/10 bg-black/80 px-2.5 py-1 backdrop-blur-md">
              <span>←/→ NAV</span>
              <span>·</span>
              <span>D DOWNLOAD</span>
              <span>·</span>
              <span>F SAVE</span>
              <span>·</span>
              <span>ESC EXIT</span>
            </div>
          </div>

          {/* Right Inspector Drawer */}
          <div className="w-full lg:w-[420px] flex-shrink-0 flex flex-col justify-between bg-[#040406] p-5 sm:p-6 overflow-y-auto border-l border-white/10">
            <div>
              {/* Type and Format Tags */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                <span className="rounded-none border border-white/20 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-bold text-neutral-200 uppercase tracking-wider">
                  {wallpaper.categoryLabel}
                </span>
                <div className="flex items-center gap-1.5 text-xs">
                  {wallpaper.type === 'animated' && (
                    <span className="rounded-none border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-amber-300 text-[10px] uppercase font-bold tracking-wider">
                      60FPS_LOOP
                    </span>
                  )}
                  {wallpaper.resolutionBadge && (
                    <span className="rounded-none border border-white/20 bg-white/[0.04] px-2 py-0.5 text-neutral-300 font-mono text-[10px]">
                      {wallpaper.resolutionBadge}
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h2 className="mt-3 text-base sm:text-lg font-bold leading-snug tracking-tight text-white uppercase font-sans">
                {wallpaper.title}
              </h2>

              {/* Tags */}
              <div className="mt-2.5 flex flex-wrap gap-1">
                {wallpaper.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-none border border-white/10 bg-black px-1.5 py-0.5 text-[10px] text-neutral-400 font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Multi-Resolution & Format Download Control Matrix */}
              {!wallpaper.isVideo && (
                <div className="mt-5 border border-white/15 bg-black/60 p-3.5 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-neutral-300 uppercase tracking-wider border-b border-white/10 pb-2">
                    <span className="flex items-center gap-1.5 text-sky-400">
                      <Sliders className="h-3 w-3" />
                      BUTCHER_RESOLVER // EXPORT_PRESET
                    </span>
                    <span className="text-neutral-500 text-[10px]">ANY_RESOLUTION</span>
                  </div>

                  {/* Resolution Selector */}
                  <div>
                    <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1.5">
                      Target Resolution
                    </label>
                    <div className="grid grid-cols-3 gap-1 text-[10px]">
                      {(
                        [
                          { id: 'original', label: 'MASTER 4K' },
                          { id: '4k', label: '3840×2160' },
                          { id: '2k', label: '2560×1440' },
                          { id: '1080p', label: '1920×1080' },
                          { id: 'mobile', label: '9:16 VERT' },
                        ] as const
                      ).map((res) => (
                        <button
                          key={res.id}
                          type="button"
                          onClick={() => setSelectedResolution(res.id)}
                          className={`px-2 py-1.5 border text-center font-mono font-bold transition-all rounded-none ${
                            selectedResolution === res.id
                              ? 'border-sky-400 bg-sky-400/20 text-sky-300'
                              : 'border-white/10 bg-black/40 text-neutral-400 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {res.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Format Selector */}
                  <div>
                    <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1.5">
                      Target Format
                    </label>
                    <div className="grid grid-cols-4 gap-1 text-[10px]">
                      {(
                        [
                          { id: 'original', label: 'ORIG' },
                          { id: 'png', label: 'PNG' },
                          { id: 'jpg', label: 'JPG' },
                          { id: 'webp', label: 'WEBP' },
                        ] as const
                      ).map((fmt) => (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setSelectedFormat(fmt.id)}
                          className={`px-2 py-1.5 border text-center font-mono font-bold transition-all rounded-none ${
                            selectedFormat === fmt.id
                              ? 'border-sky-400 bg-sky-400/20 text-sky-300'
                              : 'border-white/10 bg-black/40 text-neutral-400 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={handleCustomDownload}
                  disabled={isDownloading}
                  className="flex items-center justify-center gap-2 rounded-none bg-sky-400 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-sky-300 active:bg-sky-200 transition-all border border-sky-300"
                >
                  <Download className="h-4 w-4" />
                  <span>
                    {isDownloading
                      ? downloadProgress || 'PROCESSING...'
                      : wallpaper.isVideo
                      ? `DOWNLOAD 60FPS LOOP (${wallpaper.sizeFormatted}) // SORTED`
                      : `DOWNLOAD [${selectedResolution.toUpperCase()} // ${selectedFormat.toUpperCase()}] // SORTED`}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onToggleFavorite(wallpaper)}
                    className={`flex items-center justify-center gap-2 rounded-none border py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                      isFavorite
                        ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                        : 'border-white/20 bg-black text-neutral-300 hover:text-white hover:border-white/40'
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current text-rose-400' : 'text-neutral-400'}`} />
                    <span>{isFavorite ? 'SAVED' : 'SAVE'}</span>
                  </button>

                  <button
                    onClick={onOpenGuide}
                    className="flex items-center justify-center gap-2 rounded-none border border-white/20 bg-black py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white hover:border-white/40 transition-colors"
                  >
                    <Monitor className="h-3.5 w-3.5 text-neutral-400" />
                    <span>SETUP_GUIDE</span>
                  </button>
                </div>
              </div>

              {/* Technical Specifications Spec Sheet */}
              <div className="mt-5 rounded-none border border-white/15 bg-black p-3.5 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-neutral-300">SYSTEM_SPECS</span>
                  <span className="text-neutral-500 font-mono text-[9px]">{wallpaper.sourceRepo || 'vrsn001/wallsbyme'}</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span>NATIVE_RES</span>
                    <span className="font-bold text-white font-mono">
                      {wallpaper.resolution || (wallpaper.width && wallpaper.height ? `${wallpaper.width} × ${wallpaper.height}` : '1920 × 1080')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-400">
                    <span>RAW_SIZE</span>
                    <span className="font-bold text-white font-mono">{wallpaper.sizeFormatted}</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-400">
                    <span>CONTAINER</span>
                    <span className="font-bold text-white uppercase font-mono">{wallpaper.format}</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-3 flex flex-col gap-1.5 text-xs">
                <button
                  onClick={handleCopyRaw}
                  className="flex items-center justify-between rounded-none border border-white/10 bg-black px-3 py-2 text-neutral-300 hover:text-white hover:border-white/30 transition-all"
                >
                  <span className="flex items-center gap-2 text-[11px]">
                    <Copy className="h-3 w-3 text-neutral-400" />
                    <span>COPY_DIRECT_URL</span>
                  </span>
                  <span className="text-[9px] text-neutral-500 font-mono">
                    {copiedRaw ? <Check className="h-3 w-3 text-emerald-400" /> : 'FASTLY_EDGE'}
                  </span>
                </button>

                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center justify-between rounded-none border border-white/10 bg-black px-3 py-2 text-neutral-300 hover:text-white hover:border-white/30 transition-all"
                >
                  <span className="flex items-center gap-2 text-[11px]">
                    <Share2 className="h-3 w-3 text-neutral-400" />
                    <span>COPY_MARKDOWN</span>
                  </span>
                  <span className="text-[9px] text-neutral-500 font-mono">
                    {copiedMd ? <Check className="h-3 w-3 text-emerald-400" /> : 'EMBED'}
                  </span>
                </button>

                <a
                  href={wallpaper.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-none border border-white/10 bg-black px-3 py-2 text-neutral-300 hover:text-white hover:border-white/30 transition-all"
                >
                  <span className="flex items-center gap-2 text-[11px]">
                    <ExternalLink className="h-3 w-3 text-neutral-400" />
                    <span>VIEW_ON_GITHUB</span>
                  </span>
                  <span className="text-[9px] text-neutral-500 font-mono">SOURCE</span>
                </a>
              </div>

              {/* Related Wallpapers */}
              {related.length > 0 && (
                <div className="mt-5 pt-4 border-t border-white/10">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    RELATED_NODES // {wallpaper.categoryLabel}
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {related.map((rel) => (
                      <button
                        key={rel.id}
                        onClick={() => onSelectWallpaper(rel)}
                        className="group relative aspect-video overflow-hidden rounded-none border border-white/15 bg-black hover:border-sky-400 transition-all"
                        title={rel.title}
                      >
                        <img
                          src={rel.cdnUrl}
                          alt={rel.title}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
