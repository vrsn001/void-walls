import React from 'react';
import { X, Monitor, Terminal, Apple, Sparkles } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 animate-fade-in font-mono">
      <div className="relative w-full max-w-2xl rounded-none border border-white/20 bg-[#050508] p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 flex h-7 w-7 items-center justify-center rounded-none border border-white/20 bg-black text-neutral-400 hover:text-white hover:border-white/40 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Title */}
        <div className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-rose-400" />
            <span>BUTCHER'S RIG SETUP // NO_WANKERS</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1 uppercase font-sans">
            DESKTOP & MOBILE INTEGRATION
          </h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Hardware-accelerated 60FPS setup instructions for Windows, Linux, and macOS. Sorted.
          </p>
        </div>

        {/* Platform Guides */}
        <div className="mt-5 space-y-3">
          {/* Windows */}
          <div className="rounded-none border border-white/10 bg-black p-4">
            <div className="flex items-center gap-2 font-bold text-xs text-white uppercase tracking-wider">
              <Monitor className="h-3.5 w-3.5 text-sky-400" />
              <span>WINDOWS // LIVELY WALLPAPER & WALLPAPER ENGINE</span>
            </div>
            <div className="mt-2 text-xs text-neutral-300 space-y-1.5 leading-relaxed">
              <p>
                <strong>Option A (Free & Open Source):</strong> Install{' '}
                <a
                  href="https://rocksdanister.github.io/lively/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-sky-400 hover:text-white"
                >
                  Lively Wallpaper
                </a>{' '}
                from Microsoft Store. Open Lively, drag and drop the downloaded <code className="rounded-none bg-white/10 px-1 py-0.5 font-mono text-white text-[10px]">.mp4</code> into the window, and select <em>Set as Wallpaper</em>.
              </p>
              <p>
                <strong>Option B:</strong> If using <em>Wallpaper Engine</em> on Steam, click <em>Open Wallpaper from File</em> and choose your downloaded MP4.
              </p>
            </div>
          </div>

          {/* Linux */}
          <div className="rounded-none border border-white/10 bg-black p-4">
            <div className="flex items-center gap-2 font-bold text-xs text-white uppercase tracking-wider">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              <span>LINUX // HYPRLAND / SWAY / WAYLAND</span>
            </div>
            <div className="mt-2 text-xs text-neutral-300 space-y-1.5 leading-relaxed">
              <p>Hardware-accelerated 60FPS video playback with <strong>mpvpaper</strong>:</p>
              <pre className="rounded-none border border-white/10 bg-black p-2.5 font-mono text-[10px] text-emerald-300 overflow-x-auto">
                mpvpaper -o "no-audio --loop" '*' ~/Downloads/wallpaper.mp4
              </pre>
              <p>
                For static images: <code className="rounded-none bg-white/10 px-1 py-0.5 font-mono text-[10px] text-neutral-200">swww img wallpaper.png</code> or <code className="rounded-none bg-white/10 px-1 py-0.5 font-mono text-[10px] text-neutral-200">feh --bg-fill wallpaper.png</code>.
              </p>
            </div>
          </div>

          {/* macOS */}
          <div className="rounded-none border border-white/10 bg-black p-4">
            <div className="flex items-center gap-2 font-bold text-xs text-white uppercase tracking-wider">
              <Apple className="h-3.5 w-3.5 text-neutral-300" />
              <span>MACOS</span>
            </div>
            <div className="mt-2 text-xs text-neutral-300 space-y-1.5 leading-relaxed">
              <p>
                Use the open-source utility{' '}
                <a
                  href="https://github.com/sindresorhus/Plash"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-sky-400 hover:text-white"
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
