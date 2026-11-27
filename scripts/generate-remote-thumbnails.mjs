// Generates thumbnails for manifest entries the local generator can't see:
// images from external source repos and GIFs. Downloads each original via its CDN URL.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const THUMBNAILS_DIR = path.join(REPO_ROOT, 'thumbnails');
const MANIFEST = process.argv[2] || path.join(REPO_ROOT, 'app/src/data/wallpapers.json');
const CONCURRENCY = 8;

async function loadSharp() {
  try {
    return (await import('sharp')).default;
  } catch {
    return createRequire(path.join(REPO_ROOT, 'app/package.json'))('sharp');
  }
}

const sharp = await loadSharp();
const wallpapers = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

const pending = wallpapers.filter((w) => {
  if (w.isVideo) return false;
  return !fs.existsSync(path.join(THUMBNAILS_DIR, w.path.replace(/\.[^.]+$/, '.webp')));
});

console.log(`Missing thumbnails: ${pending.length}`);

let done = 0;
let failed = 0;

async function worker(queue) {
  for (let w = queue.shift(); w; w = queue.shift()) {
    const out = path.join(THUMBNAILS_DIR, w.path.replace(/\.[^.]+$/, '.webp'));
    try {
      // jsDelivr rejects files over 20 MB (and void-walls > 50 MB); GitHub raw serves them.
      const repo = w.sourceRepo || 'vrsn001/void-walls';
      const branch = repo === 'vyrx-dev/Wallpapers' ? 'master' : 'main';
      const rawUrl = w.rawUrl || `https://raw.githubusercontent.com/${repo}/${branch}/${w.path}`;
      const cdnUrl = w.cdnUrl && !w.cdnUrl.includes('cdn.jsdelivr.net/gh/vrsn001/void-walls') ? w.cdnUrl : null;
      let res = await fetch(cdnUrl || rawUrl);
      if (!res.ok && cdnUrl) res = await fetch(rawUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.mkdirSync(path.dirname(out), { recursive: true });
      await sharp(buf, { animated: false, limitInputPixels: false })
        .resize(600, null, { withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toFile(out);
      done++;
      if (done % 50 === 0) console.log(`  ${done}/${pending.length}`);
    } catch (err) {
      failed++;
      console.warn(`[SKIP] ${w.path}: ${err.message}`);
    }
  }
}

const queue = [...pending];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));
console.log(`Generated: ${done}, failed: ${failed}`);
