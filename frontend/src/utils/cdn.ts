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

/**
 * Returns a dynamically transformed URL for target resolution and format via Edge CDN.
 */
export function getTransformedUrl(
  sourceUrl: string,
  options: {
    width?: number;
    height?: number;
    format?: 'png' | 'jpg' | 'webp';
    quality?: number;
    fit?: 'cover' | 'contain' | 'inside';
  }
): string {
  const params = new URLSearchParams();
  params.set('url', sourceUrl);
  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.format) params.set('output', options.format === 'jpg' ? 'jpg' : options.format);
  if (options.quality) params.set('q', options.quality.toString());
  if (options.fit) params.set('fit', options.fit);
  return `https://wsrv.nl/?${params.toString()}`;
}
