import os
import shutil
import urllib.request
import json
import re

REPO_DIR = r"C:\Users\HP\.gemini\antigravity\scratch\wallsbyme-repo"
UPSTREAM_DIR = r"C:\Users\HP\.gemini\antigravity\scratch\upstream"

MEDIA_EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm'}

def sanitize_name(name):
    # Keep alphanumeric, dashes, underscores, dots
    base, ext = os.path.splitext(name)
    clean_base = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', base).strip('_')
    clean_base = re.sub(r'_+', '_', clean_base)
    return clean_base.lower() + ext.lower()

def copy_images(src_dir, dest_dir, prefix=""):
    os.makedirs(dest_dir, exist_ok=True)
    count = 0
    if not os.path.exists(src_dir):
        print(f"Directory {src_dir} does not exist.")
        return 0

    for item in os.listdir(src_dir):
        src_path = os.path.join(src_dir, item)
        if os.path.isdir(src_path):
            continue
        ext = os.path.splitext(item)[1].lower()
        if ext in MEDIA_EXTS:
            clean = sanitize_name(item)
            if prefix and not clean.startswith(prefix):
                clean = f"{prefix}_{clean}"
            dest_path = os.path.join(dest_dir, clean)
            shutil.copy2(src_path, dest_path)
            count += 1
    return count

print("=== 1. Ingesting mylinuxforwork/wallpaper -> linux-desktop/ ===")
linux_src = os.path.join(UPSTREAM_DIR, "mylinuxforwork")
linux_dest = os.path.join(REPO_DIR, "linux-desktop")
c1 = copy_images(linux_src, linux_dest)
print(f"Copied {c1} wallpapers to linux-desktop/")

print("=== 2. Ingesting michaelScopic/Wallpapers ===")
m_src = os.path.join(UPSTREAM_DIR, "michaelscopic")
categories = ["cars", "cyberpunk", "catppuccin", "japanese", "one-dark"]
for cat in categories:
    s = os.path.join(m_src, cat)
    d = os.path.join(REPO_DIR, cat)
    c = copy_images(s, d)
    print(f"Copied {c} wallpapers to {cat}/")

print("=== 3. Ingesting AlexandrosLiaskos/Awesome_Wallpapers -> awesome/ ===")
a_src = os.path.join(UPSTREAM_DIR, "awesome", "images")
a_dest = os.path.join(REPO_DIR, "awesome")
c3 = copy_images(a_src, a_dest)
print(f"Copied {c3} wallpapers to awesome/")

print("=== 4. Ingesting vyrx-dev/Wallpapers Vertical -> vertical/ ===")
v_dest = os.path.join(REPO_DIR, "vertical")
os.makedirs(v_dest, exist_ok=True)
vyrx_json_path = r"C:\Users\HP\.gemini\antigravity\scratch\vyrx_walls.json"
c4 = 0
if os.path.exists(vyrx_json_path):
    with open(vyrx_json_path, "r", encoding="utf-8") as f:
        v_items = json.load(f)
    for item in v_items:
        p = item.get("path", "")
        if p.startswith("Vertical-wallpapers/"):
            fname = os.path.basename(p)
            ext = os.path.splitext(fname)[1].lower()
            if ext in MEDIA_EXTS:
                clean = sanitize_name(fname)
                dest_file = os.path.join(v_dest, clean)
                raw_url = f"https://raw.githubusercontent.com/vyrx-dev/Wallpapers/master/{p}"
                req = urllib.request.Request(raw_url, headers={'User-Agent': 'Mozilla/5.0'})
                try:
                    with urllib.request.urlopen(req) as res:
                        with open(dest_file, "wb") as out_f:
                            out_f.write(res.read())
                    c4 += 1
                except Exception as e:
                    print(f"Failed to fetch {raw_url}: {e}")
print(f"Downloaded {c4} vertical AMOLED wallpapers to vertical/")

print("\nIngestion complete!")
