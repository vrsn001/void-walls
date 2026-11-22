import React from 'react';
import { X, Monitor, Terminal, Apple, Sparkles } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#070709] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Title */}
        <div className="border-b border-white/[0.06] pb-5">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
            <Sparkles className="h-4 w-4" />
            <span>Desktop & Mobile Setup</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white mt-1">
            Setting Up Live Animated Wallpapers
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Quick setup guide for Windows, macOS, and Linux
          </p>
        </div>

        {/* Platform Guides */}
        <div className="mt-6 space-y-4">
          {/* Windows */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center gap-2.5 font-medium text-sm text-white">
              <Monitor className="h-4 w-4 text-sky-400" />
              <span>Windows (Lively Wallpaper or Wallpaper Engine)</span>
            </div>
            <div className="mt-2.5 text-xs text-neutral-300 space-y-2 leading-relaxed">
              <p>
                <strong>Option A (Free & Open Source):</strong> Install{' '}
                <a
                  href="https://rocksdanister.github.io/lively/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline text-sky-400 hover:text-white"
                >
                  Lively Wallpaper
                </a>{' '}
                from Microsoft Store. Open Lively, drag and drop the downloaded <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-white text-[11px]">.mp4</code> file into the window, and select <em>Set as Wallpaper</em>.
              </p>
              <p>
                <strong>Option B:</strong> If using <em>Wallpaper Engine</em> on Steam, click <em>Open Wallpaper from File</em> and choose your downloaded MP4.
              </p>
            </div>
          </div>

          {/* Linux */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center gap-2.5 font-medium text-sm text-white">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span>Linux (Hyprland / Sway / Wayland)</span>
            </div>
            <div className="mt-2.5 text-xs text-neutral-300 space-y-2 leading-relaxed">
              <p>Hardware-accelerated 60FPS video playback with <strong>mpvpaper</strong>:</p>
              <pre className="rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                mpvpaper -o "no-audio --loop" '*' ~/Downloads/wallpaper.mp4
              </pre>
              <p>
                For static images: <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-neutral-200">swww img wallpaper.png</code> or <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-neutral-200">feh --bg-fill wallpaper.png</code>.
              </p>
            </div>
          </div>

          {/* macOS */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center gap-2.5 font-medium text-sm text-white">
              <Apple className="h-4 w-4 text-neutral-300" />
              <span>macOS</span>
            </div>
            <div className="mt-2.5 text-xs text-neutral-300 space-y-2 leading-relaxed">
              <p>
                Use the open-source utility{' '}
                <a
                  href="https://github.com/sindresorhus/Plash"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline text-sky-400 hover:text-white"
                >
                  Plash
                </a>{' '}
                or Aerial Screensaver to render live video wallpapers on macOS desktop smoothly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
