import type { Wallpaper } from './types';

export function getThumbnailUrl(wallpaper: Wallpaper, width = 640): string {
  if (wallpaper.isVideo) return wallpaper.rawUrl;
  const sourceUrl = wallpaper.cdnUrl || wallpaper.rawUrl;
  if (!sourceUrl) return '';
  return getTransformedUrl(sourceUrl, { width, format: 'webp', quality: 75, fit: 'cover' });
}

export function getBlurPlaceholderUrl(wallpaper: Wallpaper): string {
  if (wallpaper.isVideo) return '';
  const sourceUrl = wallpaper.cdnUrl || wallpaper.rawUrl;
  if (!sourceUrl) return '';
  return getTransformedUrl(sourceUrl, { width: 20, format: 'webp', quality: 20, fit: 'cover' });
}

function getTransformedUrl(
  sourceUrl: string,
  options: { width?: number; height?: number; format?: string; quality?: number; fit?: string }
): string {
  const params = new URLSearchParams();
  params.set('url', sourceUrl);
  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.format) params.set('output', options.format);
  if (options.quality) params.set('q', options.quality.toString());
  if (options.fit) params.set('fit', options.fit);
  return `https://wsrv.nl/?${params.toString()}`;
}
