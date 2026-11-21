import confetti from 'canvas-confetti';
import type { Wallpaper } from '../types';

export async function triggerDownload(wallpaper: Wallpaper, onProgress?: (msg: string) => void): Promise<boolean> {
  try {
    if (onProgress) onProgress('Preparing download...');
    
    // Fire confetti for instant feedback
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b']
      });
    } catch {
      // Ignore confetti errors if unsupported
    }

    // Target URL
    const targetUrl = wallpaper.isVideo ? wallpaper.rawUrl : (wallpaper.cdnUrl || wallpaper.rawUrl);
    
    // For smaller files or standard images, blob download works best
    if (!wallpaper.isVideo && wallpaper.sizeBytes < 15 * 1024 * 1024) {
      try {
        const response = await fetch(targetUrl, { mode: 'cors' });
        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = wallpaper.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
          return true;
        }
      } catch (err) {
        console.warn('Direct blob fetch fallback:', err);
      }
    }

    // Direct anchor download fallback
    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = wallpaper.filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Download error:', error);
    window.open(wallpaper.rawUrl, '_blank');
    return false;
  }
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
