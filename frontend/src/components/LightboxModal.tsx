import React, { useEffect, useState, useRef } from 'react';
import {
  Download,
  Heart,
  ExternalLink,
  Copy,
  Share2,
  Monitor
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
  }, [wallpaper, allWallpapers]);

  if (!wallpaper) return null;

  const currentIndex = allWallpapers.findIndex((w) => w.id === wallpaper.id);
  const handlePrev = () => {
    if (currentIndex > 0) onSelectWallpaper(allWallpapers[currentIndex - 1]);
    else onSelectWallpaper(allWallpapers[allWallpapers.length - 1]);
  };

  const handleNext = () => {
    if (currentIndex < allWallpapers.length - 1) onSelectWallpaper(allWallpapers[currentIndex + 1]);
    else onSelectWallpaper(allWallpapers[0]);
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4">
      {/* Dark Brutalist Window Frame */}
      <div className="relative flex h-full max-h-[94vh] w-full max-w-7xl flex-col border-2 border-[#ff5722] bg-[#07090e] shadow-[8px_8px_0_#000] overflow-hidden">
        {/* Top Window Bar */}
        <div className="flex items-center justify-between border-b-2 border-[#232c3f] bg-[#0c0f17] px-3 py-2 text-white">
          <div className="flex items-center gap-2">
            <span className="font-[var(--font-mono)] text-xs font-black uppercase tracking-wider text-[#ff5722]">
              ● ASSET_INSPECT:
            </span>
            <span className="font-[var(--font-mono)] text-xs truncate max-w-[200px] sm:max-w-md text-[#cbd5e1]">
              {wallpaper.filename}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-[var(--font-mono)] text-xs">
            <button
              onClick={handlePrev}
              className="border border-[#232c3f] bg-[#121622] px-2 py-0.5 hover:border-[#ff5722] hover:text-[#ff5722] transition-colors"
              title="Previous (Left Arrow)"
            >
              ← PREV
            </button>
            <button
              onClick={handleNext}
              className="border border-[#232c3f] bg-[#121622] px-2 py-0.5 hover:border-[#ff5722] hover:text-[#ff5722] transition-colors"
              title="Next (Right Arrow)"
            >
              NEXT →
            </button>
            <button
              onClick={onClose}
              className="border border-[#ff5722] bg-[#ff5722] px-2.5 py-0.5 font-bold text-black hover:bg-white transition-colors"
              title="Close (Esc)"
            >
              ESC ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          {/* Main Stage Media Preview */}
          <div className="relative flex-1 bg-black p-4 sm:p-6 flex items-center justify-center overflow-hidden border-b-2 lg:border-b-0 lg:border-r-2 border-[#232c3f]">
            {wallpaper.isVideo ? (
              <video
                ref={videoRef}
                src={wallpaper.rawUrl}
                controls
                autoPlay
                loop
                playsInline
                className="max-h-[75vh] max-w-full object-contain border-2 border-[#232c3f] shadow-[4px_4px_0_#ff5722]"
              />
            ) : (
              <img
                src={wallpaper.rawUrl}
                alt={wallpaper.title}
                className="max-h-[75vh] max-w-full object-contain border-2 border-[#232c3f] shadow-[4px_4px_0_#000]"
              />
            )}

            {/* Keyboard hints */}
            <div className="absolute bottom-2 left-3 hidden lg:flex items-center gap-2 font-[var(--font-mono)] text-[10px] text-[#586888] uppercase">
              <span>[←/→] Navigate</span>
              <span>·</span>
              <span>[D] Download</span>
              <span>·</span>
              <span>[F] Save</span>
              <span>·</span>
              <span>[ESC] Close</span>
            </div>
          </div>

          {/* Right Inspector Drawer */}
          <div className="w-full lg:w-[410px] flex-shrink-0 flex flex-col justify-between bg-[#0b0e15] p-5 overflow-y-auto">
            <div>
              {/* Type and Format Tags */}
              <div className="flex items-center justify-between gap-2 border-b-2 border-[#232c3f] pb-3">
                <span className="border border-[#ff5722] bg-[#ff5722]/10 px-2 py-0.5 font-[var(--font-mono)] text-[11px] font-bold uppercase text-[#ff5722]">
                  {wallpaper.categoryLabel}
                </span>
                <div className="flex items-center gap-1 font-[var(--font-mono)] text-xs font-bold">
                  {wallpaper.type === 'animated' && (
                    <span className="border border-[#ff5722] bg-[#ff5722] px-1.5 py-0.5 text-black">
                      LIVE
                    </span>
                  )}
                  {wallpaper.resolutionBadge && (
                    <span className="border border-cyan-400 bg-cyan-400 px-1.5 py-0.5 text-black">
                      {wallpaper.resolutionBadge}
                    </span>
                  )}
                  <span className="border border-[#232c3f] bg-[#121622] px-2 py-0.5 text-white">
                    {wallpaper.format}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h2 className="mt-3 font-[var(--font-display)] text-xl font-black leading-tight tracking-tight text-white uppercase">
                {wallpaper.title}
              </h2>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {wallpaper.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-[#232c3f] bg-[#10141f] px-1.5 py-0.5 font-[var(--font-mono)] text-[10px] uppercase text-[#cbd5e1]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex flex-col gap-2">
                <button
                  onClick={() => onDownload(wallpaper)}
                  className="flex items-center justify-center gap-2 border-2 border-[#ff5722] bg-[#ff5722] py-3 font-[var(--font-mono)] text-xs font-black uppercase tracking-wider text-black shadow-[4px_4px_0_#000] hover:bg-[#ff6e3d] active:translate-x-[2px] active:translate-y-[2px] transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>DOWNLOAD ({wallpaper.sizeFormatted})</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onToggleFavorite(wallpaper)}
                    className={`flex items-center justify-center gap-1.5 border-2 border-[#232c3f] py-2 font-[var(--font-mono)] text-xs font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0_#000] hover:border-[#ff5722] ${
                      isFavorite ? 'bg-[#ff5722] text-black border-[#ff5722]' : 'bg-[#10141f] text-white'
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-black' : 'text-[#ff5722]'}`} />
                    <span>{isFavorite ? 'SAVED' : 'SAVE'}</span>
                  </button>

                  <button
                    onClick={onOpenGuide}
                    className="flex items-center justify-center gap-1.5 border-2 border-[#232c3f] bg-[#10141f] py-2 font-[var(--font-mono)] text-xs font-bold uppercase tracking-wider text-cyan-400 hover:border-cyan-400 shadow-[2px_2px_0_#000] transition-colors"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    <span>SETUP</span>
                  </button>
                </div>
              </div>

              {/* Technical Specifications Spec Sheet */}
              <div className="mt-5 border-2 border-[#232c3f] bg-[#0c0f17] text-xs font-[var(--font-mono)]">
                <div className="border-b-2 border-[#232c3f] bg-[#121622] px-3 py-1.5 font-bold text-[#ff5722] text-[10px] uppercase tracking-wider flex items-center justify-between">
                  <span>// TECHNICAL SPECIFICATIONS</span>
                  <span className="text-[#8391ac]">{wallpaper.sourceRepo || 'vrsn001/wallsbyme'}</span>
                </div>
                <div className="flex justify-between border-b border-[#1b2234] px-3 py-1.5">
                  <span className="text-[#8391ac]">FILENAME</span>
                  <span className="font-bold text-white truncate max-w-[200px]" title={wallpaper.filename}>
                    {wallpaper.filename}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#1b2234] px-3 py-1.5">
                  <span className="text-[#8391ac]">RESOLUTION</span>
                  <span className="font-bold text-white">
                    {wallpaper.resolution || (wallpaper.width && wallpaper.height ? `${wallpaper.width} × ${wallpaper.height}` : '1920 × 1080')}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#1b2234] px-3 py-1.5">
                  <span className="text-[#8391ac]">FILE SIZE</span>
                  <span className="font-bold text-[#ff5722]">{wallpaper.sizeFormatted}</span>
                </div>
                <div className="flex justify-between border-b border-[#1b2234] px-3 py-1.5">
                  <span className="text-[#8391ac]">FORMAT</span>
                  <span className="font-bold text-white uppercase">{wallpaper.type} ({wallpaper.format})</span>
                </div>
                <div className="flex justify-between px-3 py-1.5">
                  <span className="text-[#8391ac]">PATH</span>
                  <span className="font-bold text-white truncate max-w-[200px]" title={wallpaper.path}>
                    {wallpaper.path}
                  </span>
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-4 flex flex-col gap-1.5 font-[var(--font-mono)] text-xs">
                <button
                  onClick={handleCopyRaw}
                  className="flex items-center justify-between border-2 border-[#232c3f] bg-[#0c0f17] px-3 py-2 font-bold uppercase text-white hover:border-[#ff5722] transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Copy className="h-3.5 w-3.5 text-[#ff5722]" />
                    <span>COPY RAW CDN LINK</span>
                  </span>
                  {copiedRaw ? (
                    <span className="text-[#00f0ff] font-bold text-[10px]">COPIED!</span>
                  ) : (
                    <span className="text-[#586888] text-[10px]">DIRECT</span>
                  )}
                </button>

                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center justify-between border-2 border-[#232c3f] bg-[#0c0f17] px-3 py-2 font-bold uppercase text-white hover:border-[#ff5722] transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Share2 className="h-3.5 w-3.5 text-cyan-400" />
                    <span>COPY MARKDOWN EMBED</span>
                  </span>
                  {copiedMd ? (
                    <span className="text-[#00f0ff] font-bold text-[10px]">COPIED!</span>
                  ) : (
                    <span className="text-[#586888] text-[10px]">MD</span>
                  )}
                </button>

                <a
                  href={wallpaper.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between border-2 border-[#232c3f] bg-[#0c0f17] px-3 py-2 font-bold uppercase text-white hover:border-white transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5 text-[#8391ac]" />
                    <span>VIEW ON GITHUB</span>
                  </span>
                  <span className="text-[#586888] text-[10px]">REPO</span>
                </a>
              </div>

              {/* Related Wallpapers */}
              {related.length > 0 && (
                <div className="mt-5 border-t-2 border-[#232c3f] pt-3">
                  <span className="block font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-widest text-[#8391ac] mb-2">
                    MORE IN {wallpaper.categoryLabel}
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {related.map((rel) => (
                      <button
                        key={rel.id}
                        onClick={() => onSelectWallpaper(rel)}
                        className="group relative aspect-video overflow-hidden border-2 border-[#232c3f] bg-black hover:border-[#ff5722] transition-colors"
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
