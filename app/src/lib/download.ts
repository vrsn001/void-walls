import type { Wallpaper } from './types';
import { getRawUrl } from './cdn';

export type OutputFormat = 'original' | 'jpeg' | 'webp' | 'png';

export interface SizeOption {
  id: string;
  label: string;
  longEdge: number | null; // null = original size
}

const PRESETS: SizeOption[] = [
  { id: '4k', label: '4K', longEdge: 3840 },
  { id: '1440p', label: '1440p', longEdge: 2560 },
  { id: '1080p', label: '1080p', longEdge: 1920 },
  { id: '720p', label: '720p', longEdge: 1280 },
];

const MIME: Record<Exclude<OutputFormat, 'original'>, string> = {
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  png: 'image/png',
};

const EXT: Record<Exclude<OutputFormat, 'original'>, string> = {
  jpeg: 'jpg',
  webp: 'webp',
  png: 'png',
};

export function canConvert(w: Wallpaper): boolean {
  return !w.isVideo && w.format !== 'GIF';
}

export function sizeOptions(w: Wallpaper): SizeOption[] {
  const longEdge = Math.max(w.width || 0, w.height || 0);
  const original: SizeOption = {
    id: 'original',
    label: w.width && w.height ? `Original · ${w.width}×${w.height}` : 'Original',
    longEdge: null,
  };
  if (!canConvert(w) || !longEdge) return [original];
  return [original, ...PRESETS.filter((p) => p.longEdge! < longEdge)];
}

async function fetchOriginal(w: Wallpaper): Promise<Blob> {
  const validCdn =
    w.cdnUrl && !w.cdnUrl.includes('cdn.jsdelivr.net/gh/vrsn001/void-walls') ? w.cdnUrl : null;
  const raw = getRawUrl(w);
  const urls = [...new Set([validCdn, raw].filter((u): u is string => Boolean(u)))];
  let lastError: unknown;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.blob();
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error('No source URL');
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

async function convert(source: Blob, format: Exclude<OutputFormat, 'original'>, longEdge: number | null): Promise<Blob> {
  const probe = await createImageBitmap(source);
  const scale = longEdge ? Math.min(1, longEdge / Math.max(probe.width, probe.height)) : 1;
  const width = Math.round(probe.width * scale);
  const height = Math.round(probe.height * scale);

  const bitmap =
    scale === 1
      ? probe
      : await createImageBitmap(source, { resizeWidth: width, resizeHeight: height, resizeQuality: 'high' });
  if (bitmap !== probe) probe.close();

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  if (format === 'jpeg') {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Encoding failed'))), MIME[format], 0.92)
  );
}

export async function downloadWallpaper(
  w: Wallpaper,
  format: OutputFormat = 'original',
  size: SizeOption | null = null
): Promise<void> {
  const source = await fetchOriginal(w);
  const longEdge = size?.longEdge ?? null;

  if (format === 'original' && !longEdge) {
    saveBlob(source, w.filename);
    return;
  }

  const target = format === 'original' ? sourceFormat(w) : format;
  const blob = await convert(source, target, longEdge);
  const base = w.filename.replace(/\.[^.]+$/, '');
  const suffix = size && size.id !== 'original' ? `_${size.id}` : '';
  saveBlob(blob, `${base}${suffix}.${EXT[target]}`);
}

function sourceFormat(w: Wallpaper): Exclude<OutputFormat, 'original'> {
  if (w.format === 'PNG') return 'png';
  if (w.format === 'WEBP') return 'webp';
  return 'jpeg';
}
