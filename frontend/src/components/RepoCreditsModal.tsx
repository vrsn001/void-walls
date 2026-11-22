import React from 'react';
import { X, ExternalLink, Heart, GitFork, ShieldCheck } from 'lucide-react';
import { GithubIcon } from './GithubIcon';

interface RepoCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RepoCreditsModal: React.FC<RepoCreditsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const repositories = [
    {
      name: 'vrsn001/wallsbyme',
      upstream: 'forked from dharmx/walls',
      desc: 'The core archive engine — 3,245+ curated wallpapers, 60fps live anime loops, and automated manifest generation.',
      url: 'https://github.com/vrsn001/wallsbyme',
      upstreamUrl: 'https://github.com/dharmx/walls',
      badge: 'Primary Vault (3,245 Assets)',
      color: 'border-sky-400/40 text-sky-300 bg-sky-950/20',
      tag: 'ORIGINAL_CORE',
    },
    {
      name: 'mylinuxforwork/wallpaper',
      upstream: 'Curated by mylinuxforwork',
      desc: 'High-resolution Linux workstation landscapes, 3D tech backdrops, deep fantasy, and dual-monitor art.',
      url: 'https://github.com/mylinuxforwork/wallpaper',
      upstreamUrl: 'https://github.com/mylinuxforwork/wallpaper',
      badge: 'Linux Desktop (220 Assets)',
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20',
      tag: 'LINUX_WORKSTATIONS',
    },
    {
      name: 'michaelScopic/Wallpapers',
      upstream: 'Curated by michaelScopic',
      desc: 'Multi-category aesthetic collection: Hypercars, Cyberpunk neon night-city, Catppuccin palettes, and Japanese ukiyo-e.',
      url: 'https://github.com/michaelScopic/Wallpapers',
      upstreamUrl: 'https://github.com/michaelScopic/Wallpapers',
      badge: 'Aesthetic Vaults (500+ Assets)',
      color: 'border-rose-500/40 text-rose-400 bg-rose-950/20',
      tag: 'CARS_CYBERPUNK_JAPANESE',
    },
    {
      name: 'vyrx-dev/Wallpapers',
      upstream: 'Curated by vyrx-dev',
      desc: 'Deep aesthetic palette themes: 9:16 Vertical AMOLED phone backdrops, Nord dark, and retro pixel cities.',
      url: 'https://github.com/vyrx-dev/Wallpapers',
      upstreamUrl: 'https://github.com/vyrx-dev/Wallpapers',
      badge: 'AMOLED 9:16 & Nord (490 Assets)',
      color: 'border-purple-500/40 text-purple-400 bg-purple-950/20',
      tag: 'MOBILE_AMOLED_NORD',
    },
    {
      name: 'AlexandrosLiaskos/Awesome_Wallpapers',
      upstream: 'Curated by Alexandros Liaskos',
      desc: 'Web-optimized wallpaper gallery with aspect ratio profiling, minimal tags, and high-DPI desktop canvases.',
      url: 'https://github.com/AlexandrosLiaskos/Awesome_Wallpapers',
      upstreamUrl: 'https://github.com/AlexandrosLiaskos/Awesome_Wallpapers',
      badge: 'Awesome Web Vault (382 Assets)',
      color: 'border-amber-500/40 text-amber-400 bg-amber-950/20',
      tag: 'CURATED_WEB_CANVAS',
    },
    {
      name: 'DenverCoder1/minimalistic-wallpaper-collection',
      upstream: 'Curated by Jonah Lawrence (DenverCoder1)',
      desc: 'High-density vector art, minimal landscapes, geometric gradients, and clean desktop backdrops.',
      url: 'https://github.com/DenverCoder1/minimalistic-wallpaper-collection',
      upstreamUrl: 'https://github.com/DenverCoder1/minimalistic-wallpaper-collection',
      badge: 'Minimal Collection (336 Assets)',
      color: 'border-neutral-400/40 text-neutral-300 bg-neutral-950/20',
      tag: 'VECTOR_MINIMAL',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl font-mono">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-none border border-white/20 bg-[#050508] p-5 sm:p-6 shadow-2xl">
        {/* Subtle Matrix Blueprint Grid Texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(0, 240, 255, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-none border border-white/20 bg-black text-neutral-400 hover:border-white/40 hover:text-white transition-colors cursor-pointer z-10"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Modal Header */}
        <div className="relative z-10 mb-5 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-sky-400/40 bg-sky-950/30 text-sky-400">
            <Heart className="h-4 w-4 fill-sky-400/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-mono tracking-tight text-white uppercase">
                UPSTREAM LEGENDS // PROPER RESPECT
              </h2>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
              We don't steal work like corporate supes. VOID//WALLS stands on the shoulders of open-source creators across GitHub.
            </p>
          </div>
        </div>

        {/* Repositories List */}
        <div className="relative z-10 space-y-2.5">
          {repositories.map((repo) => (
            <div
              key={repo.name}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-none border border-white/10 bg-black p-3.5 transition-all hover:border-sky-400/40"
            >
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs sm:text-sm font-bold text-white">{repo.name}</span>
                  <span
                    className={`rounded-none border px-1.5 py-0.2 text-[9px] font-mono font-bold tracking-wider ${repo.color}`}
                  >
                    {repo.tag}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">{repo.desc}</p>
                <div className="text-[10px] font-mono text-neutral-500">
                  <GitFork className="inline h-2.5 w-2.5 mr-1" />
                  {repo.upstream}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-none border border-white/20 bg-black px-2.5 py-1 text-[11px] font-mono font-bold text-neutral-300 hover:border-sky-400 hover:bg-sky-400/10 hover:text-sky-300 transition-all uppercase"
                >
                  <GithubIcon className="h-3 w-3" />
                  <span>VISIT_REPO</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-sky-400" />
            <span>RAW_GITHUB_CDN · ZERO_TRACKING · ZERO_ADS</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-none border border-white/20 bg-black px-3 py-1 text-xs text-white hover:bg-white/10 transition-colors cursor-pointer font-bold"
          >
            [CLOSE]
          </button>
        </div>
      </div>
    </div>
  );
};
