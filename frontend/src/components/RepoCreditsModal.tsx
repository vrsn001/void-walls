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
      desc: 'The core archive engine — 1,653+ curated wallpapers, 60fps live anime loops, and automated manifest generation.',
      url: 'https://github.com/vrsn001/wallsbyme',
      upstreamUrl: 'https://github.com/dharmx/walls',
      badge: 'Primary Vault (1,653 Assets)',
      color: 'border-cyan-500/30 text-cyan-400 bg-cyan-950/20',
      tag: 'ORIGINAL_CORE',
    },
    {
      name: 'DenverCoder1/minimalistic-wallpaper-collection',
      upstream: 'Curated by Jonah Lawrence (DenverCoder1)',
      desc: 'High-density vector art, minimal landscapes, geometric gradients, and clean desktop backdrops.',
      url: 'https://github.com/DenverCoder1/minimalistic-wallpaper-collection',
      upstreamUrl: 'https://github.com/DenverCoder1/minimalistic-wallpaper-collection',
      badge: 'Minimal Collection (336 Assets)',
      color: 'border-amber-500/30 text-amber-400 bg-amber-950/20',
      tag: 'VECTOR_MINIMAL',
    },
    {
      name: 'vyrx-dev/Wallpapers',
      upstream: 'Curated by vyrx-dev',
      desc: 'Deep aesthetic palette themes: Nord dark, Catppuccin mocha, pixel art cities, and cyber cityscapes.',
      url: 'https://github.com/vyrx-dev/Wallpapers',
      upstreamUrl: 'https://github.com/vyrx-dev/Wallpapers',
      badge: 'Aesthetic & Nord (490 Assets)',
      color: 'border-purple-500/30 text-purple-400 bg-purple-950/20',
      tag: 'NORD_PIXEL_AMOLED',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#06060a] p-6 shadow-2xl">
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
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-neutral-400 hover:border-white/20 hover:text-white transition-colors cursor-pointer z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="relative z-10 mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/30 text-cyan-400">
            <Heart className="h-5 w-5 fill-cyan-400/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-mono tracking-tight text-white">
                UPSTREAM ARCHIVE ACKNOWLEDGEMENTS
              </h2>
            </div>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              VOID//WALLS is powered by open source creators across GitHub. All wallpapers remain the
              property of their respective creators.
            </p>
          </div>
        </div>

        {/* Repositories List */}
        <div className="relative z-10 space-y-3">
          {repositories.map((repo) => (
            <div
              key={repo.name}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-black/40 p-4 transition-all hover:border-white/20"
            >
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-white">{repo.name}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider ${repo.color}`}
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
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-mono font-medium text-neutral-300 hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all"
                >
                  <GithubIcon className="h-3.5 w-3.5" />
                  <span>Visit Repo</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>DIRECT RAW GITHUB CDN · ZERO TRACKING · ZERO ADS</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-1 text-xs text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
