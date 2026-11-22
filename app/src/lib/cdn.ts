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

export function getFullUrl(wallpaper: Wallpaper): string {
  return wallpaper.cdnUrl || wallpaper.rawUrl;
}
