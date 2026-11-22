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
  X
} from 'lucide-react';
import type { Wallpaper } from '../types';
import { copyToClipboard } from '../utils/download';

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
  onDownload,
  onOpenGuide,
}) => {
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
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

  useEffect(() => {
    if (!wallpaper) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key.toLowerCase() === 'd') onDownload(wallpaper);
      else if (e.key.toLowerCase() === 'f') onToggleFavorite(wallpaper);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wallpaper, handlePrev, handleNext, onClose, onDownload, onToggleFavorite]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-2 sm:p-6 animate-fade-in">
      {/* Pure AMOLED Void Modal Window */}
      <div className="relative flex h-full max-h-[92vh] w-full max-w-7xl flex-col rounded-3xl border border-white/10 bg-[#050507] shadow-2xl overflow-hidden">
        {/* Top Window Bar */}
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-black/60 px-5 py-3 text-white">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-neutral-400">
              Viewing
            </span>
            <span className="text-xs font-semibold truncate max-w-[200px] sm:max-w-md text-white">
              {wallpaper.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Previous (Left Arrow)"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Next (Right Arrow)"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-neutral-300 hover:text-white hover:bg-white/15 transition-colors ml-1"
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          {/* Main Stage Media Preview */}
          <div className="relative flex-1 bg-black p-4 sm:p-8 flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-white/[0.06]">
            {wallpaper.isVideo ? (
              <video
                ref={videoRef}
                src={wallpaper.rawUrl}
                controls
                autoPlay
                loop
                playsInline
                className="max-h-[72vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />
            ) : (
              <img
                src={wallpaper.rawUrl}
                alt={wallpaper.title}
                className="max-h-[72vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />
            )}

            {/* Keyboard shortcuts pill */}
            <div className="absolute bottom-3 left-4 hidden lg:flex items-center gap-2 text-[11px] text-neutral-500 rounded-full border border-white/[0.06] bg-black/60 px-3 py-1 backdrop-blur-md">
              <span>←/→ Navigate</span>
              <span>·</span>
              <span>D Download</span>
              <span>·</span>
              <span>F Save</span>
              <span>·</span>
              <span>ESC Close</span>
            </div>
          </div>

          {/* Right Inspector Drawer */}
          <div className="w-full lg:w-[380px] flex-shrink-0 flex flex-col justify-between bg-gradient-to-b from-[#070709] to-[#040405] p-6 overflow-y-auto">
            <div>
              {/* Type and Format Tags */}
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/[0.06]">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-neutral-300">
                  {wallpaper.categoryLabel}
                </span>
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  {wallpaper.type === 'animated' && (
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-amber-300 text-[11px]">
                      Live 60FPS
                    </span>
                  )}
                  {wallpaper.resolutionBadge && (
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-neutral-300 font-mono text-[11px]">
                      {wallpaper.resolutionBadge}
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h2 className="mt-4 text-xl font-semibold leading-snug tracking-tight text-white">
                {wallpaper.title}
              </h2>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {wallpaper.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] text-neutral-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  onClick={() => onDownload(wallpaper)}
                  className="flex items-center justify-center gap-2 rounded-full bg-white py-3 text-xs font-semibold text-black hover:bg-neutral-200 active:scale-[0.98] transition-all shadow-md shadow-white/5"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Full Resolution ({wallpaper.sizeFormatted})</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onToggleFavorite(wallpaper)}
                    className={`flex items-center justify-center gap-2 rounded-full border py-2.5 text-xs font-medium transition-all ${
                      isFavorite
                        ? 'border-white bg-white/15 text-white'
                        : 'border-white/10 bg-white/[0.03] text-neutral-300 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current text-rose-400' : 'text-neutral-400'}`} />
                    <span>{isFavorite ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    onClick={onOpenGuide}
                    className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-2.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                  >
                    <Monitor className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Setup Guide</span>
                  </button>
                </div>
              </div>

              {/* Technical Specifications Spec Sheet */}
              <div className="mt-6 rounded-2xl border border-white/[0.06] bg-black/40 p-4 text-xs">
                <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-3 flex items-center justify-between">
                  <span>Specifications</span>
                  <span className="text-neutral-500 font-mono text-[10px]">{wallpaper.sourceRepo || 'vrsn001/wallsbyme'}</span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span>Resolution</span>
                    <span className="font-medium text-white font-mono">
                      {wallpaper.resolution || (wallpaper.width && wallpaper.height ? `${wallpaper.width} × ${wallpaper.height}` : '1920 × 1080')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-400">
                    <span>File Size</span>
                    <span className="font-medium text-white font-mono">{wallpaper.sizeFormatted}</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-400">
                    <span>Format</span>
                    <span className="font-medium text-white uppercase font-mono">{wallpaper.format}</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-4 flex flex-col gap-2 text-xs">
                <button
                  onClick={handleCopyRaw}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-neutral-300 hover:text-white hover:border-white/20 hover:bg-white/[0.05] transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Copy className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Copy Raw CDN Link</span>
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {copiedRaw ? 'Copied!' : 'Direct'}
                  </span>
                </button>

                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-neutral-300 hover:text-white hover:border-white/20 hover:bg-white/[0.05] transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Share2 className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Copy Markdown Embed</span>
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {copiedMd ? 'Copied!' : 'Markdown'}
                  </span>
                </button>

                <a
                  href={wallpaper.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-neutral-300 hover:text-white hover:border-white/20 hover:bg-white/[0.05] transition-all"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
                    <span>View on GitHub</span>
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">Repo</span>
                </a>
              </div>

              {/* Related Wallpapers */}
              {related.length > 0 && (
                <div className="mt-6 pt-5 border-t border-white/[0.06]">
                  <span className="block text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-3">
                    More in {wallpaper.categoryLabel}
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {related.map((rel) => (
                      <button
                        key={rel.id}
                        onClick={() => onSelectWallpaper(rel)}
                        className="group relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-black hover:border-white/30 transition-all hover:scale-105"
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
