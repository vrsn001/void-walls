import confetti from 'canvas-confetti';
import type { Wallpaper } from '../types';
import { getTransformedUrl } from './cdn';

export type DownloadFormat = 'png' | 'jpg' | 'webp' | 'original';
export type DownloadResolution = 'original' | '4k' | '2k' | '1080p' | 'mobile';

export interface CustomDownloadOptions {
  wallpaper: Wallpaper;
  format?: DownloadFormat;
  resolution?: DownloadResolution;
  onProgress?: (msg: string) => void;
}

const RESOLUTION_PRESETS: Record<DownloadResolution, { width?: number; height?: number; label: string }> = {
  original: { label: 'ORIGINAL_MASTER' },
  '4k': { width: 3840, height: 2160, label: '4K_UHD' },
  '2k': { width: 2560, height: 1440, label: '2K_QHD' },
  '1080p': { width: 1920, height: 1080, label: '1080P_FHD' },
  mobile: { width: 1080, height: 1920, label: '9X16_AMOLED' },
};

function triggerConfetti() {
  try {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#00f0ff', '#ff5722', '#ffffff', '#38bdf8'],
    });
  } catch {
    // Confetti is optional visual flair
  }
}

/**
 * Downloads a blob with the specified filename
 */
function downloadBlob(blob: Blob, filename: string): void {
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

/**
 * Canvas-based image transformation fallback for multi-format and multi-resolution
 */
async function transformWithCanvas(
  sourceUrl: string,
  targetWidth: number,
  targetHeight: number,
  mimeType: string,
  quality = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get 2D canvas context'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw and scale
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas export to blob failed'));
          }
        },
        mimeType,
        quality
      );
    };
    img.onerror = (e) => reject(new Error(`Failed to load source image into canvas: ${e}`));
    img.src = sourceUrl;
  });
}

/**
 * Multi-format and multi-resolution download engine
 */
export async function triggerCustomDownload({
  wallpaper,
  format = 'original',
  resolution = 'original',
  onProgress,
}: CustomDownloadOptions): Promise<boolean> {
  try {
    const isOriginal = format === 'original' && resolution === 'original';
    const isVideo = wallpaper.isVideo;

    // For videos, always stream the master video directly
    if (isVideo) {
      if (onProgress) onProgress('Initiating 60FPS video stream...');
      const targetUrl = wallpaper.rawUrl || wallpaper.cdnUrl;
      const link = document.createElement('a');
      link.href = targetUrl;
      link.download = wallpaper.filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerConfetti();
      if (onProgress) onProgress('Download initiated!');
      return true;
    }

    const preset = RESOLUTION_PRESETS[resolution];
    const baseName = wallpaper.filename.replace(/\.[^/.]+$/, '');
    const outExt = format === 'original' ? (wallpaper.format.toLowerCase() === 'jpeg' ? 'jpg' : wallpaper.format.toLowerCase()) : format;
    const outputFilename = isOriginal
      ? wallpaper.filename
      : `${baseName}_[${preset.label}].${outExt}`;

    const sourceUrl = wallpaper.rawUrl || wallpaper.cdnUrl;

    // Fast-path: Original download directly from Fastly edge
    if (isOriginal) {
      if (onProgress) onProgress('Fetching master file (raw edge)...');
      try {
        const res = await fetch(sourceUrl, { mode: 'cors' });
        if (res.ok) {
          const blob = await res.blob();
          downloadBlob(blob, outputFilename);
          triggerConfetti();
          if (onProgress) onProgress('Complete!');
          return true;
        }
      } catch (err) {
        console.warn('Direct fetch failed, falling back to link download:', err);
      }

      // Link fallback
      const link = document.createElement('a');
      link.href = sourceUrl;
      link.download = outputFilename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerConfetti();
      return true;
    }

    // Custom Resolution / Format conversion
    if (onProgress) onProgress(`Transforming to ${preset.label} [${outExt.toUpperCase()}]...`);

    const targetWidth = preset.width || wallpaper.width || 1920;
    const targetHeight = preset.height || wallpaper.height || 1080;
    const mimeType = outExt === 'png' ? 'image/png' : outExt === 'webp' ? 'image/webp' : 'image/jpeg';

    // Strategy 1: Edge Resizer API
    try {
      const edgeUrl = getTransformedUrl(sourceUrl, {
        width: targetWidth,
        height: targetHeight,
        format: outExt as 'png' | 'jpg' | 'webp',
        quality: 95,
        fit: resolution === 'mobile' ? 'cover' : 'inside',
      });

      const res = await fetch(edgeUrl, { mode: 'cors' });
      if (res.ok) {
        const blob = await res.blob();
        downloadBlob(blob, outputFilename);
        triggerConfetti();
        if (onProgress) onProgress('Download complete!');
        return true;
      }
    } catch (edgeErr) {
      console.warn('Edge transform download fallback:', edgeErr);
    }

    // Strategy 2: Client Canvas Transformation
    if (onProgress) onProgress('Rendering high-precision canvas...');
    try {
      const blob = await transformWithCanvas(sourceUrl, targetWidth, targetHeight, mimeType, 0.95);
      downloadBlob(blob, outputFilename);
      triggerConfetti();
      if (onProgress) onProgress('Download complete!');
      return true;
    } catch (canvasErr) {
      console.error('Canvas transformation failed:', canvasErr);
    }

    // Final Fallback: Direct master download
    window.open(sourceUrl, '_blank');
    return false;
  } catch (err) {
    console.error('Download pipeline error:', err);
    window.open(wallpaper.rawUrl || wallpaper.cdnUrl, '_blank');
    return false;
  }
}

/**
 * Backward compatible quick download trigger
 */
export async function triggerDownload(wallpaper: Wallpaper, onProgress?: (msg: string) => void): Promise<boolean> {
  return triggerCustomDownload({
    wallpaper,
    format: 'original',
    resolution: 'original',
    onProgress,
  });
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve(successful);
    } catch {
      document.body.removeChild(textArea);
      return Promise.resolve(false);
    }
  }
}
