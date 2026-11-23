// Terminal Colorway Matrix — Instant Theme Switcher
// Zero cookies, zero network overhead, CSS variable composited

export type ThemeId =
  | "cyan_2077"
  | "matrix_green"
  | "amber_84"
  | "outrun_magenta"
  | "blood_rekt";

export interface ColorwayTheme {
  id: ThemeId;
  name: string;
  code: string;
  accent: string;
  dim: string;
  glow: string;
  tag: string;
  desc: string;
}

export const THEMES: Record<ThemeId, ColorwayTheme> = {
  cyan_2077: {
    id: "cyan_2077",
    name: "CYAN_2077",
    code: "#00f0ff",
    accent: "#00f0ff",
    dim: "rgba(0, 240, 255, 0.15)",
    glow: "rgba(0, 240, 255, 0.45)",
    tag: "NEON_CYBER",
    desc: "Default Night City neon cyan",
  },
  matrix_green: {
    id: "matrix_green",
    name: "MATRIX_GREEN",
    code: "#00ff66",
    accent: "#00ff66",
    dim: "rgba(0, 255, 102, 0.15)",
    glow: "rgba(0, 255, 102, 0.45)",
    tag: "HACKER_VT",
    desc: "Phosphor terminal operator green",
  },
  amber_84: {
    id: "amber_84",
    name: "AMBER_1984",
    code: "#ffb000",
    accent: "#ffb000",
    dim: "rgba(255, 176, 0, 0.15)",
    glow: "rgba(255, 176, 0, 0.45)",
    tag: "RETRO_CRT",
    desc: "DEC VT220 mainframe amber",
  },
  outrun_magenta: {
    id: "outrun_magenta",
    name: "OUTRUN_PINK",
    code: "#ff007f",
    accent: "#ff007f",
    dim: "rgba(255, 0, 127, 0.15)",
    glow: "rgba(255, 0, 127, 0.45)",
    tag: "SYNTHWAVE",
    desc: "Radical 80s arcade hot magenta",
  },
  blood_rekt: {
    id: "blood_rekt",
    name: "BLOOD_REKT",
    code: "#ff2a40",
    accent: "#ff2a40",
    dim: "rgba(255, 42, 64, 0.15)",
    glow: "rgba(255, 42, 64, 0.45)",
    tag: "RED_ALERT",
    desc: "Hostile combat protocol red",
  },
};

export const THEME_LIST = Object.values(THEMES);

type ThemeListener = (themeId: ThemeId) => void;
const listeners = new Set<ThemeListener>();

export function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "cyan_2077";
  try {
    const saved = localStorage.getItem("void_theme") as ThemeId;
    if (saved && THEMES[saved]) return saved;
  } catch {}
  return "cyan_2077";
}

export function applyTheme(id: ThemeId): void {
  const theme = THEMES[id] || THEMES.cyan_2077;
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--accent-dim", theme.dim);
    root.style.setProperty("--accent-glow", theme.glow);
    root.setAttribute("data-theme", theme.id);
  }
  try {
    localStorage.setItem("void_theme", theme.id);
  } catch {}
  listeners.forEach((fn) => fn(theme.id));
}

export function subscribeTheme(fn: ThemeListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
