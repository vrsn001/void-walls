import type { Wallpaper } from '../types';

/**
 * Global Edge Thumbnail Resizer
 * Converts 4K/8K uncompressed master assets (up to 48MB) into ~8-15 KB WebP thumbnails
 * cached globally at Cloudflare Edge.
 */
export function getThumbnailUrl(wallpaper: Wallpaper, width = 640): string {
  if (wallpaper.isVideo) {
    return wallpaper.rawUrl;
  }
  const source = wallpaper.rawUrl || wallpaper.cdnUrl;
  if (!source) return '';
  
  // Cloudflare edge worker image proxy
  return `https://wsrv.nl/?url=${encodeURIComponent(source)}&w=${width}&output=webp&q=80`;
}
