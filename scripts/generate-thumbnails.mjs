import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const THUMBNAILS_DIR = path.join(REPO_ROOT, 'thumbnails');

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);
const IGNORED_NAMES = new Set(['.git', '.github', 'docs', 'scripts', 'node_modules', 'frontend', 'thumbnails', '.agents', 'assets']);

async function generateThumbnails() {
  console.log('--- VOID//WALLS THUMBNAIL GENERATOR (OPTION B) ---');
  
  let sharp = null;
  try {
    const sharpModule = await import('sharp');
    sharp = sharpModule.default;
    console.log('[INFO] sharp loaded successfully for high-speed hardware-accelerated WebP generation.');
  } catch {
    console.log('[WARN] sharp not found in environment. In GitHub Actions CI, sharp is installed automatically via workflow.');
  }

  if (!fs.existsSync(THUMBNAILS_DIR)) {
    fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
  }

  const entries = fs.readdirSync(REPO_ROOT, { withFileTypes: true });
  const categoryDirs = entries
    .filter(entry => entry.isDirectory() && !IGNORED_NAMES.has(entry.name) && !entry.name.startsWith('.'))
    .map(entry => entry.name);

  let totalImages = 0;
  let alreadyExist = 0;
  let newlyGenerated = 0;

  for (const cat of categoryDirs) {
    const catPath = path.join(REPO_ROOT, cat);
    const catThumbPath = path.join(THUMBNAILS_DIR, cat);

    const files = fs.readdirSync(catPath, { withFileTypes: true });
    for (const f of files) {
      if (!f.isFile() || f.name.startsWith('.')) continue;
      const ext = path.extname(f.name).slice(1).toLowerCase();
      if (!IMAGE_EXTENSIONS.has(ext)) continue;

      totalImages++;
      const baseName = path.basename(f.name, path.extname(f.name));
      const thumbFile = path.join(catThumbPath, `${baseName}.webp`);

      if (fs.existsSync(thumbFile)) {
        alreadyExist++;
        continue;
      }

      if (sharp) {
        try {
          if (!fs.existsSync(catThumbPath)) {
            fs.mkdirSync(catThumbPath, { recursive: true });
          }
          const srcFile = path.join(catPath, f.name);
          await sharp(srcFile)
            .resize(600, null, { withoutEnlargement: true })
            .webp({ quality: 80, effort: 4 })
            .toFile(thumbFile);
          newlyGenerated++;
          if (newlyGenerated % 20 === 0) {
            console.log(`[PROCESSED] Generated ${newlyGenerated} thumbnails...`);
          }
        } catch (err) {
          console.warn(`[SKIP] Could not process ${cat}/${f.name}:`, err.message);
        }
      }
    }
  }

  console.log(`\n--- SUMMARY ---`);
  console.log(`Total images scanned: ${totalImages}`);
  console.log(`Already present: ${alreadyExist}`);
  console.log(`Newly generated: ${newlyGenerated}`);
  console.log(`Thumbnail directory: ${THUMBNAILS_DIR}`);
}

generateThumbnails().catch((err) => {
  console.error('[ERROR] Thumbnail generation failed:', err);
  process.exit(1);
});
