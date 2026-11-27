"use client";

import { useEffect, useState } from "react";
import { THEME_LIST, applyTheme, getStoredTheme, type ThemeId } from "@/lib/theme";
import { sound } from "@/lib/sound";
import { triggerHaptic } from "@/lib/haptics";
import { X, Palette, Check } from "lucide-react";

interface ColorwayModalProps {
  open: boolean;
  onClose: () => void;
  onThemeChanged?: (name: string) => void;
}

export function ColorwayModal({ open, onClose, onThemeChanged }: ColorwayModalProps) {
  const [activeTheme, setActiveTheme] = useState<ThemeId>(() => getStoredTheme());

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSelect = (id: ThemeId, name: string) => {
    sound.playSwitch();
    triggerHaptic("medium");
    setActiveTheme(id);
    applyTheme(id);
    onThemeChanged?.(name);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#07070b] border border-cyan/40 p-4 sm:p-5 shadow-2xl shadow-cyan/10 font-mono text-white relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-cyan" />
            <h2 className="text-xs sm:text-sm font-bold tracking-wider text-white">
              COLORWAY MATRIX <span className="text-cyan">{"// HARDWARE PROFILE"}</span>
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playSwitch();
              onClose();
            }}
            className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center text-zinc-400 hover:text-cyan transition-colors cursor-pointer"
            aria-label="Close colorway selector"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Theme List */}
        <div className="space-y-2 mb-4">
          {THEME_LIST.map((th, idx) => {
            const isSelected = activeTheme === th.id;
            return (
              <button
                key={th.id}
                onClick={() => handleSelect(th.id, th.name)}
                className={`w-full min-h-[50px] p-2.5 sm:p-3 flex items-center justify-between border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-cyan bg-cyan/[0.12] shadow-sm shadow-cyan/20"
                    : "border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Color Swatch Dot */}
                  <div
                    className="w-4 h-4 rounded-none border border-white/20 shrink-0"
                    style={{
                      backgroundColor: th.accent,
                      boxShadow: isSelected ? `0 0 10px ${th.accent}` : "none",
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 font-mono">0{idx + 1}</span>
                      <span className="text-xs font-bold tracking-wide text-white">{th.name}</span>
                      <span
                        className="text-[9px] font-mono px-1 py-0.2 border"
                        style={{
                          borderColor: th.accent,
                          color: th.accent,
                          backgroundColor: th.dim,
                        }}
                      >
                        {th.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{th.desc}</p>
                  </div>
                </div>

                {isSelected ? (
                  <div className="flex items-center gap-1 text-cyan text-[10px] font-bold shrink-0">
                    <Check className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">ENGAGED</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-zinc-600 font-mono shrink-0">LOAD</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer status notice */}
        <div className="border-t border-white/10 pt-2.5 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <span>0 COOKIES // PURE CSS COMPOSITED</span>
          <span className="text-cyan">ESC // CLOSE</span>
        </div>
      </div>
    </div>
  );
}
