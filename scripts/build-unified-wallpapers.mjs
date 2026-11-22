import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getImageDimensions } from './image-dimensions.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const WALLPAPERS_JSON_PATH = path.join(REPO_ROOT, 'frontend', 'src', 'data', 'wallpapers.json');
const MANIFEST_PATH = path.join(REPO_ROOT, 'docs', 'manifest.json');

const MEDIA_EXTS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4', 'webm']);
const VIDEO_EXTS = new Set(['mp4', 'webm']);

const CATEGORY_NAMES = {
  'animated': 'Live 60FPS Video Loops',
  'anime': 'Anime & Manga',
  'nord': 'Nord Palette',
  'flowers': 'Botanical & Flowers',
  'architecture': 'Architecture & City',
  'nature': 'Nature & Landscapes',
  'manga': 'Manga Monochrome',
  'digital': 'Digital Art & Sci-Fi',
  'monochrome': 'Monochrome Minimal',
  'minimal': 'Minimalist',
  'mountain': 'Mountains & Peaks',
  'abstract': 'Abstract & Surreal',
  'gruvbox': 'Gruvbox Palette',
  'm-26.jp': 'Japanese Aesthetic',
  'retro': 'Retro & Synthwave',
  'outrun': 'Outrun & Cyberpunk',
  'evangelion': 'Neon Genesis Evangelion',
  'dreamcore': 'Dreamcore & Liminal',
  'calm': 'Calm & Cozy',
  'solarized': 'Solarized Palette',
  'pixel': 'Pixel Art',
  'stalenhag': 'Simon Stålenhag Style',
  'weirdcore': 'Weirdcore & Glitch',
  'unsorted': 'Curated Unsorted',
  'chillop': 'Chill Hop & Lofi',
  'apocalypse': 'Post-Apocalyptic',
  'centered': 'Centered Focus',
  'interior': 'Interior & Cozy Rooms',
  'fogsmoke': 'Misty & Atmospheric',
  'aerial': 'Aerial & Earth View',
  'apeiros': 'Apeiros Cosmos',
  'basalt': 'Basalt Minimal',
  'boccha': 'Boccha Art',
  'cherry': 'Cherry Blossom',
  'cold': 'Cold Winter & Ice',
  'decay': 'Urban Decay & Ruins',
  'fauna': 'Wildlife & Fauna',
  'geometry': 'Geometric Patterns',
  'girl': 'Character Portraits',
  'halloween': 'Halloween & Dark Fantasy',
  'industrial': 'Industrial Heavy',
  'jackb': 'Jack B Curations',
  'lightbulb': 'Lightbulb Glow',
  'logo': 'Minimal Logos & Icons',
  'painting': 'Classic Fine Paintings',
  'paper': 'Origami & Papercraft',
  'poly': 'Low Poly Geometry',
  'radium': 'Radium Glow',
  'tile': 'Seamless Textures & Tiles',
  'wave': 'Vapor Wave & Oceans',
  // New Upstream Categories:
  'awesome': 'Awesome Curated Web Gallery',
  'cars': 'Hypercars & Automotive',
  'catppuccin': 'Catppuccin Palette',
  'cyberpunk': 'Cyberpunk Neon City',
  'japanese': 'Japanese Ukiyo-e & Tokyo',
  'linux-desktop': 'Linux Desktop Workstations',
  'misc': 'Curated Miscellaneous',
  'one-dark': 'One Dark Palette',
  'pastel': 'Pastel Aesthetics',
  'purple': 'Violet & Purple AMOLED',
  'space': 'Cosmic & Deep Space',
  'tokyo-night': 'Tokyo Night Palette',
  'vertical': 'AMOLED 9:16 Mobile',
  'windows': 'Windows Minimalist'
};

function cleanTitle(filename) {
  let name = filename.replace(/\.[^/.]+$/, '');
  name = name.replace(/-moewalls-com|_moewalls_com/gi, '');
  name = name.replace(/wallpaperflare\.com_wallpaper/gi, 'Vertical Phone');
  name = name.replace(/[_-]+/g, ' ').trim();
  const words = name.split(/\s+/);
  return words
    .map(w => {
      const lower = w.toLowerCase();
      if (['in', 'at', 'on', 'of', 'to', 'by', 'a', 'an', 'the'].includes(lower)) {
        return lower;
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

function getResolutionBadge(width, height, isVideo, category) {
  if (isVideo) return '60FPS VIDEO';
  if (category === 'vertical' || (height > width && height >= 1400)) return '9:16 MOBILE';
  if (width >= 3800 || height >= 2100) return '4K UHD';
  if (width >= 2500 || height >= 1400) return '2K QHD';
  if (width >= 1900 || height >= 1000) return '1080p FHD';
  return 'HD';
}

function formatBytes(bytes) {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function run() {
  console.log('Loading existing wallpapers...');
  let existing = [];
  if (fs.existsSync(WALLPAPERS_JSON_PATH)) {
    existing = JSON.parse(fs.readFileSync(WALLPAPERS_JSON_PATH, 'utf-8'));
  }

  // Remove deleted categories
  const purged = existing.filter(w => w.category !== 'spam' && w.category !== 'devicons');
  console.log(`Retained ${purged.length} wallpapers after purging spam & devicons.`);

  const existingPaths = new Set(purged.map(w => w.path));

  // Scan local vaults
  const newVaults = [
    'awesome', 'cars', 'catppuccin', 'cyberpunk', 'japanese',
    'linux-desktop', 'misc', 'one-dark', 'pastel', 'purple',
    'space', 'tokyo-night', 'vertical', 'windows'
  ];

  let addedCount = 0;
  let nextId = purged.length + 1;

  for (const vault of newVaults) {
    const vaultDir = path.join(REPO_ROOT, vault);
    if (!fs.existsSync(vaultDir)) continue;

    const files = fs.readdirSync(vaultDir);
    for (const f of files) {
      if (f.startsWith('.')) continue;
      const ext = path.extname(f).slice(1).toLowerCase();
      if (!MEDIA_EXTS.has(ext)) continue;

      const relPath = `${vault}/${f}`;
      if (existingPaths.has(relPath)) continue;

      const fullPath = path.join(vaultDir, f);
      let sizeBytes = 0;
      try {
        sizeBytes = fs.statSync(fullPath).size;
      } catch {}

      const dims = getImageDimensions(fullPath);
      let width = dims?.width || (vault === 'vertical' ? 1080 : 1920);
      let height = dims?.height || (vault === 'vertical' ? 1920 : 1080);

      const isVideo = VIDEO_EXTS.has(ext);
      const isAnimated = isVideo || ext === 'gif';
      const badge = getResolutionBadge(width, height, isVideo, vault);
      const title = cleanTitle(f);

      const rawUrl = `https://raw.githubusercontent.com/vrsn001/wallsbyme/main/${relPath}`;
      const cdnUrl = isVideo ? rawUrl : `https://cdn.jsdelivr.net/gh/vrsn001/wallsbyme@main/${relPath}`;
      const githubUrl = `https://github.com/vrsn001/wallsbyme/blob/main/${relPath}`;

      const tags = [vault];
      if (vault === 'vertical' || badge === '9:16 MOBILE') {
        tags.push('mobile', 'amoled', 'phone', 'vertical');
      } else if (isAnimated) {
        tags.push('animated', isVideo ? 'live video' : 'gif loop');
      } else {
        tags.push('static');
      }
      tags.push(ext);

      purged.push({
        id: `wall-${nextId++}`,
        path: relPath,
        filename: f,
        title,
        category: vault,
        categoryLabel: CATEGORY_NAMES[vault] || vault.replace('-', ' ').toUpperCase(),
        type: isAnimated ? 'animated' : 'static',
        format: ext.toUpperCase(),
        isVideo,
        sizeBytes,
        sizeFormatted: formatBytes(sizeBytes),
        width,
        height,
        resolution: `${width} × ${height}`,
        resolutionBadge: badge,
        rawUrl,
        cdnUrl,
        githubUrl,
        tags,
        source: 'vrsn001/wallsbyme',
        sourceRepo: 'vrsn001/wallsbyme'
      });

      existingPaths.add(relPath);
      addedCount++;
    }
  }

  console.log(`Added ${addedCount} new wallpapers across the 14 new vaults.`);
  console.log(`Total active wallpapers in unified catalog: ${purged.length}`);

  // Re-write wallpapers.json
  fs.writeFileSync(WALLPAPERS_JSON_PATH, JSON.stringify(purged, null, 2), 'utf-8');
  console.log(`Updated ${WALLPAPERS_JSON_PATH}`);

  // Also update manifest.json
  const categoriesMap = {};
  for (const w of purged) {
    if (!categoriesMap[w.category]) {
      categoriesMap[w.category] = {
        slug: w.category,
        label: w.categoryLabel,
        count: 0,
        cover: w.path
      };
    }
    categoriesMap[w.category].count++;
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    totalAssets: purged.length,
    totalCategories: Object.keys(categoriesMap).length,
    categories: Object.values(categoriesMap).sort((a, b) => a.slug.localeCompare(b.slug)),
    files: purged.map(w => ({
      category: w.category,
      name: w.filename,
      path: w.path,
      ext: w.format.toLowerCase(),
      type: w.isVideo ? 'video' : 'image',
      bytes: w.sizeBytes,
      width: w.width,
      height: w.height,
      alt: w.title
    }))
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`Updated ${MANIFEST_PATH} with ${manifest.totalCategories} categories.`);
}

run();
