// Builds a WebP poster and a lightweight 640px preview clip for each video wallpaper,
// written next to the image thumbnails: thumbnails/<path>.webp and <path>.preview.mp4.
// Needs ffmpeg on PATH, or FFMPEG=/path/to/ffmpeg.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const THUMBNAILS_DIR = path.join(REPO_ROOT, 'thumbnails');
const MANIFEST = process.argv[2] || path.join(REPO_ROOT, 'app/src/data/wallpapers.json');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';

async function loadSharp() {
  try {
    return (await import('sharp')).default;
  } catch {
    return createRequire(path.join(REPO_ROOT, 'app/package.json'))('sharp');
  }
}

const sharp = await loadSharp();
const videos = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')).filter((w) => w.isVideo);
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'voidwalls-video-'));

for (const w of videos) {
  const base = path.join(THUMBNAILS_DIR, w.path.replace(/\.[^.]+$/, ''));
  const poster = `${base}.webp`;
  const preview = `${base}.preview.mp4`;
  if (fs.existsSync(poster) && fs.existsSync(preview)) continue;

  fs.mkdirSync(path.dirname(base), { recursive: true });
  const src = path.join(tmpDir, path.basename(w.path));
  try {
    const repo = w.sourceRepo || 'vrsn001/void-walls';
    const branch = repo === 'vyrx-dev/Wallpapers' ? 'master' : 'main';
    const rawUrl = w.rawUrl || `https://raw.githubusercontent.com/${repo}/${branch}/${w.path}`;
    const res = await fetch(rawUrl || w.cdnUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    fs.writeFileSync(src, Buffer.from(await res.arrayBuffer()));

    const frame = execFileSync(FFMPEG, ['-v', 'error', '-i', src, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], {
      maxBuffer: 64 * 1024 * 1024,
    });
    await sharp(frame).resize(600, null, { withoutEnlargement: true }).webp({ quality: 80 }).toFile(poster);

    execFileSync(FFMPEG, [
      '-v', 'error', '-y', '-i', src,
      '-an',
      '-vf', "scale='min(640,iw)':-2,fps=30",
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '30',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      preview,
    ]);

    const kb = (fs.statSync(preview).size / 1024).toFixed(0);
    console.log(`${w.path}: ${w.sizeFormatted} -> preview ${kb} KB`);
  } catch (err) {
    console.warn(`[SKIP] ${w.path}: ${err.message}`);
  } finally {
    fs.rmSync(src, { force: true });
  }
}

fs.rmSync(tmpDir, { recursive: true, force: true });
