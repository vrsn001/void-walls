export interface PaletteColor {
  hex: string;
  rgb: string;
  hsl: string;
  label: string;
  isDark: boolean;
  luminance: number;
}

export interface ExtractedPalette {
  colors: PaletteColor[];
  dominantHex: string;
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number; str: string } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  return {
    h: hDeg,
    s: sPct,
    l: lPct,
    str: `hsl(${hDeg}, ${sPct}%, ${lPct}%)`,
  };
}

function getLuminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * Extracts a 5-tone cyberpunk ricing palette from an image URL.
 * Uses a micro-canvas (64x64px = 16KB RAM) to ensure ZERO mobile lag.
 */
export async function extractPaletteFromImage(imageSrc: string): Promise<ExtractedPalette> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 64; // Micro-canvas downsampling
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (!ctx) {
          resolve(getFallbackPalette());
          return;
        }

        ctx.drawImage(img, 0, 0, size, size);
        const imgData = ctx.getImageData(0, 0, size, size).data;

        // Sample pixels with quantization
        const colorBuckets: { r: number; g: number; b: number; count: number; sat: number; lum: number }[] = [];

        for (let i = 0; i < imgData.length; i += 16) { // Sample every 4th pixel for speed
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue;

          const lum = getLuminance(r, g, b);
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;

          // Find existing bucket within color distance
          let matched = false;
          for (const bucket of colorBuckets) {
            const dist = Math.hypot(r - bucket.r, g - bucket.g, b - bucket.b);
            if (dist < 45) {
              bucket.r = (bucket.r * bucket.count + r) / (bucket.count + 1);
              bucket.g = (bucket.g * bucket.count + g) / (bucket.count + 1);
              bucket.b = (bucket.b * bucket.count + b) / (bucket.count + 1);
              bucket.count++;
              matched = true;
              break;
            }
          }

          if (!matched && colorBuckets.length < 32) {
            colorBuckets.push({ r, g, b, count: 1, sat, lum });
          }
        }

        if (colorBuckets.length === 0) {
          resolve(getFallbackPalette());
          return;
        }

        // Sort buckets
        const byCount = [...colorBuckets].sort((a, b) => b.count - a.count);
        const bySat = [...colorBuckets].sort((a, b) => b.sat - a.sat);
        const byLumAsc = [...colorBuckets].sort((a, b) => a.lum - b.lum);
        const byLumDesc = [...colorBuckets].sort((a, b) => b.lum - a.lum);

        // Select 5 distinct roles:
        // 1. BASE_DARK (darkest tone)
        const darkBase = byLumAsc[0] || byCount[0];
        
        // 2. SURFACE_MUTED (mid-dark background tone)
        const surface = byLumAsc.find((c) => c.lum > 0.15 && c.lum < 0.45) || byCount[1] || darkBase;

        // 3. CORE_ACCENT (highest saturation tone)
        const accent = bySat.find((c) => c.sat > 0.35 && c !== darkBase) || byCount[0];

        // 4. NEON_HIGHLIGHT (brightest vibrant tone)
        const highlight = byLumDesc.find((c) => c.lum > 0.6 && c !== accent) || byLumDesc[0];

        // 5. CYBER_GLOW (secondary vibrant or contrasting tone)
        const glow = bySat.find((c) => c !== accent && c !== highlight && c !== darkBase) || byCount[2] || highlight;

        const roles = [
          { b: darkBase, label: "BASE_DARK // #00" },
          { b: surface, label: "SURFACE // #01" },
          { b: accent, label: "CORE_ACCENT // #02" },
          { b: highlight, label: "NEON_HIGH // #03" },
          { b: glow, label: "CYBER_GLOW // #04" },
        ];

        const colors: PaletteColor[] = roles.map(({ b, label }) => {
          const r = Math.round(b.r);
          const g = Math.round(b.g);
          const blue = Math.round(b.b);
          const hex = rgbToHex(r, g, blue);
          const rgb = `rgb(${r}, ${g}, ${blue})`;
          const hsl = rgbToHsl(r, g, blue).str;
          const lum = getLuminance(r, g, blue);

          return {
            hex,
            rgb,
            hsl,
            label,
            isDark: lum < 0.5,
            luminance: Math.round(lum * 100),
          };
        });

        resolve({
          colors,
          dominantHex: colors[2].hex,
        });
      } catch {
        resolve(getFallbackPalette());
      }
    };

    img.onerror = () => {
      resolve(getFallbackPalette());
    };

    img.src = imageSrc;
  });
}

function getFallbackPalette(): ExtractedPalette {
  const fallback = [
    { hex: "#06060a", rgb: "rgb(6, 6, 10)", hsl: "hsl(240, 25%, 3%)", label: "BASE_DARK // #00", isDark: true, luminance: 3 },
    { hex: "#121420", rgb: "rgb(18, 20, 32)", hsl: "hsl(231, 28%, 10%)", label: "SURFACE // #01", isDark: true, luminance: 8 },
    { hex: "#00f0ff", rgb: "rgb(0, 240, 255)", hsl: "hsl(184, 100%, 50%)", label: "CORE_ACCENT // #02", isDark: false, luminance: 78 },
    { hex: "#ff007f", rgb: "rgb(255, 0, 127)", hsl: "hsl(330, 100%, 50%)", label: "NEON_HIGH // #03", isDark: false, luminance: 42 },
    { hex: "#7000ff", rgb: "rgb(112, 0, 255)", hsl: "hsl(266, 100%, 50%)", label: "CYBER_GLOW // #04", isDark: false, luminance: 28 },
  ];
  return { colors: fallback, dominantHex: "#00f0ff" };
}

export function formatAsHexList(colors: PaletteColor[]): string {
  return colors.map((c) => c.hex).join(", ");
}

export function formatAsCssVars(colors: PaletteColor[]): string {
  return `:root {\n  --cyber-base: ${colors[0]?.hex};\n  --cyber-surface: ${colors[1]?.hex};\n  --cyber-accent: ${colors[2]?.hex};\n  --cyber-neon: ${colors[3]?.hex};\n  --cyber-glow: ${colors[4]?.hex};\n}`;
}

export function formatAsPolybar(colors: PaletteColor[]): string {
  return `;; Cyberpunk Palette Config (Polybar / Waybar / Kitty)\nbackground = ${colors[0]?.hex}\nbackground-alt = ${colors[1]?.hex}\nprimary = ${colors[2]?.hex}\nsecondary = ${colors[3]?.hex}\nalert = ${colors[4]?.hex}`;
}

export function formatAsJson(colors: PaletteColor[]): string {
  const obj: Record<string, string> = {};
  colors.forEach((c) => {
    obj[c.label.split(" // ")[0].toLowerCase()] = c.hex;
  });
  return JSON.stringify(obj, null, 2);
}

export function formatAsHyprland(colors: PaletteColor[]): string {
  const c0 = colors[0]?.hex.replace("#", "") || "06060a";
  const c1 = colors[1]?.hex.replace("#", "") || "121420";
  const c2 = colors[2]?.hex.replace("#", "") || "00f0ff";
  const c3 = colors[3]?.hex.replace("#", "") || "ff007f";
  return `# Hyprland Window Config // Void Walls Unix Rice Forge
general {
    col.active_border = rgba(${c2}ee) rgba(${c3}ee) 45deg
    col.inactive_border = rgba(${c1}aa)
    gaps_in = 4
    gaps_out = 8
    border_size = 2
}

decoration {
    rounding = 6
    shadow:enabled = true
    shadow:range = 14
    shadow:render_power = 3
    shadow:color = rgba(${c0}99)
}`;
}

export function formatAsKitty(colors: PaletteColor[]): string {
  const c0 = colors[0]?.hex || "#06060a";
  const c1 = colors[1]?.hex || "#121420";
  const c2 = colors[2]?.hex || "#00f0ff";
  const c3 = colors[3]?.hex || "#ff007f";
  const c4 = colors[4]?.hex || "#7000ff";
  return `# Kitty Terminal Theme // Void Walls Unix Rice Forge
background ${c0}
foreground #e4e4e7
selection_background ${c2}
selection_foreground ${c0}
cursor ${c2}
cursor_text_color ${c0}
url_color ${c2}

# Normal Colors
color0 ${c0}
color1 #ff0055
color2 ${c2}
color3 #fcee0a
color4 #0070f3
color5 ${c4}
color6 ${c2}
color7 #d4d4d8

# Bright Colors
color8 ${c1}
color9 #ff3377
color10 ${c2}
color11 #fdf24d
color12 #3291ff
color13 #c471ed
color14 #5ce1e6
color15 ${c3}`;
}

export function formatAsAlacritty(colors: PaletteColor[]): string {
  const c0 = colors[0]?.hex || "#06060a";
  const c1 = colors[1]?.hex || "#121420";
  const c2 = colors[2]?.hex || "#00f0ff";
  const c3 = colors[3]?.hex || "#ff007f";
  const c4 = colors[4]?.hex || "#7000ff";
  return `# Alacritty Terminal Theme (TOML) // Void Walls Unix Rice Forge
[colors.primary]
background = "${c0}"
foreground = "#e4e4e7"

[colors.cursor]
text = "${c0}"
cursor = "${c2}"

[colors.normal]
black = "${c0}"
red = "#ff0055"
green = "${c2}"
yellow = "#fcee0a"
blue = "#0070f3"
magenta = "${c4}"
cyan = "${c2}"
white = "#d4d4d8"

[colors.bright]
black = "${c1}"
red = "#ff3377"
green = "${c2}"
yellow = "#fdf24d"
blue = "#3291ff"
magenta = "#c471ed"
cyan = "#5ce1e6"
white = "${c3}"`;
}

export function formatAsPywal(colors: PaletteColor[]): string {
  const c0 = colors[0]?.hex || "#06060a";
  const c1 = colors[1]?.hex || "#121420";
  const c2 = colors[2]?.hex || "#00f0ff";
  const c3 = colors[3]?.hex || "#ff007f";
  const c4 = colors[4]?.hex || "#7000ff";
  return JSON.stringify(
    {
      wallpaper: "void-walls",
      alpha: "100",
      special: {
        background: c0,
        foreground: "#e4e4e7",
        cursor: c2,
      },
      colors: {
        color0: c0,
        color1: "#ff0055",
        color2: c2,
        color3: "#fcee0a",
        color4: "#0070f3",
        color5: c4,
        color6: c2,
        color7: "#d4d4d8",
        color8: c1,
        color9: "#ff3377",
        color10: c2,
        color11: "#fdf24d",
        color12: "#3291ff",
        color13: "#c471ed",
        color14: "#5ce1e6",
        color15: c3,
      },
    },
    null,
    2
  );
}

export function formatAsWaybar(colors: PaletteColor[]): string {
  const c0 = colors[0]?.hex || "#06060a";
  const c1 = colors[1]?.hex || "#121420";
  const c2 = colors[2]?.hex || "#00f0ff";
  const c3 = colors[3]?.hex || "#ff007f";
  const c4 = colors[4]?.hex || "#7000ff";
  return `/* Waybar CSS // Void Walls Unix Rice Forge */
@define-color bg ${c0};
@define-color surface ${c1};
@define-color accent ${c2};
@define-color neon ${c3};
@define-color glow ${c4};

window#waybar {
    background: @bg;
    color: #e4e4e7;
    border-bottom: 2px solid @accent;
}

#workspaces button.active {
    background: @accent;
    color: @bg;
}

#clock, #battery, #cpu, #memory {
    background: @surface;
    border-radius: 4px;
    padding: 2px 8px;
    margin: 2px 4px;
}`;
}
