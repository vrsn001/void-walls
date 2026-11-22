import React, { useEffect } from 'react';
import { X, Monitor, Terminal, Apple, Sparkles } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 font-mono"
    >
      <div className="relative w-full max-w-xl rounded-none border border-white/20 bg-[#060609] p-5 sm:p-6 shadow-2xl max-h-[88vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-none border border-white/20 bg-black text-neutral-400 hover:text-white hover:border-white/40 transition-colors cursor-pointer"
          title="Close guide"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Title */}
        <div className="border-b border-white/10 pb-4 pr-8">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-sky-400" />
            <span>RIG SETUP // DESKTOP & MOBILE</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1 uppercase font-sans">
            DESKTOP & MOBILE INTEGRATION
          </h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Hardware-accelerated 60FPS setup instructions for Windows, Linux, and macOS.
          </p>
        </div>

        {/* Platform Guides */}
        <div className="mt-4 space-y-3">
          {/* Windows */}
          <div className="rounded-none border border-white/10 bg-black p-4">
            <div className="flex items-center gap-2 font-bold text-xs text-white uppercase tracking-wider">
              <Monitor className="h-4 w-4 text-sky-400" />
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
                from Microsoft Store. Open Lively, drag and drop the downloaded <code className="rounded-none bg-white/10 px-1.5 py-0.5 font-mono text-white text-[10px]">.mp4</code> into the window, and select <em>Set as Wallpaper</em>.
              </p>
              <p>
                <strong>Option B:</strong> If using <em>Wallpaper Engine</em> on Steam, click <em>Open Wallpaper from File</em> and choose your downloaded MP4.
              </p>
            </div>
          </div>

          {/* Linux */}
          <div className="rounded-none border border-white/10 bg-black p-4">
            <div className="flex items-center gap-2 font-bold text-xs text-white uppercase tracking-wider">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span>LINUX // HYPRLAND / SWAY / WAYLAND</span>
            </div>
            <div className="mt-2 text-xs text-neutral-300 space-y-1.5 leading-relaxed">
              <p>Hardware-accelerated 60FPS video playback with <strong>mpvpaper</strong>:</p>
              <pre className="rounded-none border border-white/10 bg-black p-2.5 font-mono text-[10px] text-emerald-300 overflow-x-auto">
                mpvpaper -o "no-audio --loop" '*' ~/Downloads/wallpaper.mp4
              </pre>
              <p>
                For static images: <code className="rounded-none bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-neutral-200">swww img wallpaper.png</code> or <code className="rounded-none bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-neutral-200">feh --bg-fill wallpaper.png</code>.
              </p>
            </div>
          </div>

          {/* macOS */}
          <div className="rounded-none border border-white/10 bg-black p-4">
            <div className="flex items-center gap-2 font-bold text-xs text-white uppercase tracking-wider">
              <Apple className="h-4 w-4 text-neutral-300" />
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
