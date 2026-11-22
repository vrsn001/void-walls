import os
import shutil
import urllib.request
import urllib.parse
import json
import re

REPO_DIR = r"C:\Users\HP\.gemini\antigravity\scratch\wallsbyme-repo"
UPSTREAM_DIR = r"C:\Users\HP\.gemini\antigravity\scratch\upstream"

MEDIA_EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm'}

def sanitize_name(name):
    base, ext = os.path.splitext(name)
    clean_base = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', base).strip('_')
    clean_base = re.sub(r'_+', '_', clean_base)
    return clean_base.lower() + ext.lower()

print("=== Ingesting vyrx-dev/Wallpapers Vertical -> vertical/ ===")
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
                quoted_p = urllib.parse.quote(p)
                raw_url = f"https://raw.githubusercontent.com/vyrx-dev/Wallpapers/master/{quoted_p}"
                req = urllib.request.Request(raw_url, headers={'User-Agent': 'Mozilla/5.0'})
                try:
                    with urllib.request.urlopen(req) as res:
                        with open(dest_file, "wb") as out_f:
                            out_f.write(res.read())
                    c4 += 1
                    print(f"Downloaded: {clean}")
                except Exception as e:
                    print(f"Failed to fetch {raw_url}: {e}")
print(f"Downloaded {c4} vertical AMOLED wallpapers to vertical/")
