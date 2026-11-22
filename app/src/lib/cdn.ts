import type { Wallpaper } from './types';

const THUMB_BASE = 'https://cdn.jsdelivr.net/gh/vrsn001/void-walls@main/thumbnails/';

export function getThumbnailUrl(wallpaper: Wallpaper): string {
  if (wallpaper.isVideo) return wallpaper.rawUrl;
  return THUMB_BASE + wallpaper.path.replace(/\.[^.]+$/, '.webp');
}

export function getFullUrl(wallpaper: Wallpaper): string {
  return wallpaper.cdnUrl || wallpaper.rawUrl;
}
