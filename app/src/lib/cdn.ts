import type { Wallpaper } from './types';

// Copied from ../thumbnails at build time (see "sync-thumbs"); jsDelivr's @main
// branch endpoint refuses this repo for exceeding its 50 MB package limit.
const THUMB_BASE = '/thumbnails/';

function thumbBase(wallpaper: Wallpaper): string {
  return THUMB_BASE + wallpaper.path.replace(/\.[^.]+$/, '');
}

/** WebP thumbnail; for videos this is the poster frame. */
export function getThumbnailUrl(wallpaper: Wallpaper): string {
  return thumbBase(wallpaper) + '.webp';
}

/** Small 640px silent loop for grid cards. */
export function getVideoPreviewUrl(wallpaper: Wallpaper): string {
  return thumbBase(wallpaper) + '.preview.mp4';
}

/** Direct GitHub raw URL derived from repo metadata (or explicit rawUrl). */
export function getRawUrl(wallpaper: Wallpaper): string {
  if (wallpaper.rawUrl) return wallpaper.rawUrl;
  const repo = wallpaper.sourceRepo || 'vrsn001/void-walls';
  const branch = repo === 'vyrx-dev/Wallpapers' ? 'master' : 'main';
  return `https://raw.githubusercontent.com/${repo}/${branch}/${wallpaper.path}`;
}

export function getFullUrl(wallpaper: Wallpaper): string {
  if (wallpaper.cdnUrl && !wallpaper.cdnUrl.includes('cdn.jsdelivr.net/gh/vrsn001/void-walls')) {
    return wallpaper.cdnUrl;
  }
  return getRawUrl(wallpaper);
}
