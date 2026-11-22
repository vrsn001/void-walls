import type { Wallpaper } from './types';

// Copied from ../thumbnails at build time (see "sync-thumbs"); jsDelivr's @main
// branch endpoint refuses this repo for exceeding its 50 MB package limit.
const THUMB_BASE = '/thumbnails/';

export function getThumbnailUrl(wallpaper: Wallpaper): string {
  if (wallpaper.isVideo) return wallpaper.rawUrl;
  return THUMB_BASE + wallpaper.path.replace(/\.[^.]+$/, '.webp');
}

export function getFullUrl(wallpaper: Wallpaper): string {
  return wallpaper.cdnUrl || wallpaper.rawUrl;
}
