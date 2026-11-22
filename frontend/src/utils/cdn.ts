import type { Wallpaper } from '../types';

/**
 * Global Edge CDN URL Resolver
 * Delivers assets directly from jsDelivr Multi-CDN edge cache (Cloudflare + Fastly)
 * with sub-50ms latency worldwide.
 */
export function getThumbnailUrl(wallpaper: Wallpaper, _width = 640): string {
  if (wallpaper.isVideo) {
    return wallpaper.rawUrl;
  }
  if (wallpaper.cdnUrl) {
    return wallpaper.cdnUrl;
  }
  if (wallpaper.rawUrl) {
    return wallpaper.rawUrl;
  }
  return '';
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
