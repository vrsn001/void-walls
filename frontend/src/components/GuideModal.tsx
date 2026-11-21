import React from 'react';
import { X, Monitor, Terminal, Apple, Flame } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
      <div className="relative w-full max-w-2xl border-2 border-[#ff5722] bg-[#0c0f17] p-6 shadow-[8px_8px_0_#000] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 border border-[#232c3f] bg-[#121622] p-1.5 text-white hover:border-[#ff5722] hover:text-[#ff5722] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Title */}
        <div className="border-b-2 border-[#232c3f] pb-4">
          <div className="flex items-center gap-1.5 font-[var(--font-mono)] text-xs font-bold uppercase tracking-wider text-[#ff5722]">
            <Flame className="h-4 w-4" />
            <span>// HARDWARE & DESKTOP SETUP</span>
          </div>
          <h2 className="font-[var(--font-display)] text-2xl font-black uppercase tracking-tight text-white mt-1">
            How to Set Live Animated Wallpapers
          </h2>
          <p className="font-[var(--font-mono)] text-xs text-[#8391ac] uppercase">
            Step-by-step instructions for Windows, macOS, and Linux
          </p>
        </div>

        {/* Platform Guides */}
        <div className="mt-5 space-y-4">
          {/* Windows */}
          <div className="border-2 border-[#232c3f] bg-[#10141f] p-4 shadow-[2px_2px_0_#000]">
            <div className="flex items-center gap-2 font-[var(--font-display)] font-bold text-sm uppercase text-white">
              <Monitor className="h-4 w-4 text-[#ff5722]" />
              <span>Windows (Lively Wallpaper or Wallpaper Engine)</span>
            </div>
            <div className="mt-2 text-xs text-[#cbd5e1] space-y-1.5 leading-relaxed font-sans">
              <p>
                <strong>Option A (Free & Open Source):</strong> Install{' '}
                <a
                  href="https://rocksdanister.github.io/lively/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-[#ff5722] hover:text-white"
                >
                  Lively Wallpaper
                </a>{' '}
                from Microsoft Store. Open Lively, drag and drop the downloaded <code className="border border-[#232c3f] bg-black px-1.5 py-0.5 font-mono text-[#ff5722] font-bold">.mp4</code> file into the window, and click <em>Set as Wallpaper</em>.
              </p>
              <p>
                <strong>Option B:</strong> If using <em>Wallpaper Engine</em> on Steam, click <em>Open Wallpaper from File</em> and select your downloaded MP4.
              </p>
            </div>
          </div>

          {/* Linux */}
          <div className="border-2 border-[#232c3f] bg-[#10141f] p-4 shadow-[2px_2px_0_#000]">
            <div className="flex items-center gap-2 font-[var(--font-display)] font-bold text-sm uppercase text-white">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span>Linux (Hyprland / Sway / X11)</span>
            </div>
            <div className="mt-2 text-xs text-[#cbd5e1] space-y-1.5 leading-relaxed font-sans">
              <p>Hardware-accelerated 60FPS video loop via <strong>mpvpaper</strong>:</p>
              <pre className="border border-[#232c3f] bg-black p-2 font-mono text-[11px] font-bold text-white overflow-x-auto">
                mpvpaper -o "no-audio --loop" '*' ~/Downloads/wallpaper.mp4
              </pre>
              <p>
                For static images: <code className="border border-[#232c3f] bg-black px-1.5 py-0.5 font-mono font-bold text-cyan-400">swww img wallpaper.png</code> or <code className="border border-[#232c3f] bg-black px-1.5 py-0.5 font-mono font-bold text-cyan-400">feh --bg-fill wallpaper.png</code>.
              </p>
            </div>
          </div>

          {/* macOS */}
          <div className="border-2 border-[#232c3f] bg-[#10141f] p-4 shadow-[2px_2px_0_#000]">
            <div className="flex items-center gap-2 font-[var(--font-display)] font-bold text-sm uppercase text-white">
              <Apple className="h-4 w-4 text-[#cbd5e1]" />
              <span>macOS</span>
            </div>
            <div className="mt-2 text-xs text-[#cbd5e1] space-y-1.5 leading-relaxed font-sans">
              <p>
                Install the open-source utility{' '}
                <a
                  href="https://github.com/sindresorhus/Plash"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-[#ff5722] hover:text-white"
                >
                  Plash
                </a>{' '}
                or Aerial Screensaver to render video backgrounds seamlessly on your desktop.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="border-2 border-[#ff5722] bg-[#ff5722] px-6 py-2.5 font-[var(--font-mono)] text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0_#000] hover:bg-white active:translate-x-[2px] active:translate-y-[2px] transition-all"
          >
            DISMISS [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
