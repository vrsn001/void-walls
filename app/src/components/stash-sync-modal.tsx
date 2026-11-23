"use client";

import { useEffect, useRef, useState } from "react";
import { X, Download, Upload, Copy, Check, Share2, Heart, Shield, RefreshCw, Trash2, ArrowRight } from "lucide-react";
import {
  exportStashJson,
  exportCompactSyncString,
  importStashJson,
  clearAllFavorites,
  useFavorites,
} from "@/lib/favorites";
import { sound } from "@/lib/sound";
import { triggerHaptic } from "@/lib/haptics";

interface StashSyncModalProps {
  onClose: () => void;
  onStatusChange?: (msg: string) => void;
}

export function StashSyncModal({ onClose, onStatusChange }: StashSyncModalProps) {
  const favorites = useFavorites();
  const [tab, setTab] = useState<"export" | "import">("export");
  const [copied, setCopied] = useState<"json" | "compact" | null>(null);
  const [importInput, setImportInput] = useState("");
  const [importResult, setImportResult] = useState<{ success: boolean; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        sound.playSwitch();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleDownloadJson = () => {
    sound.playDownload();
    triggerHaptic("medium");
    const jsonStr = exportStashJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `voidwalls-stash-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onStatusChange?.("STASH BACKUP DOWNLOADED // PORTABLE JSON");
  };

  const handleCopyCompact = () => {
    sound.playSwitch();
    triggerHaptic("light");
    const compact = exportCompactSyncString();
    navigator.clipboard?.writeText(compact).then(() => {
      setCopied("compact");
      setTimeout(() => setCopied(null), 2000);
      onStatusChange?.("SYNC STRING COPIED TO CLIPBOARD");
    });
  };

  const handleNativeShare = async () => {
    sound.playSwitch();
    triggerHaptic("medium");
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Void Walls Stash",
          text: `Here is my Void Walls wallpaper stash sync string:\n\n${exportCompactSyncString()}`,
        });
      } catch {}
    } else {
      handleCopyCompact();
    }
  };

  const handleImportSubmit = () => {
    if (!importInput.trim()) return;
    sound.playCommand();
    triggerHaptic("success");
    const res = importStashJson(importInput);
    if (res.success) {
      setImportResult({
        success: true,
        msg: `SUCCESS: +${res.importedCount} NEW ASSETS IMPORTED (TOTAL: ${res.totalCount})`,
      });
      setImportInput("");
      onStatusChange?.(`STASH MERGED: +${res.importedCount} ASSETS ADDED`);
    } else {
      setImportResult({
        success: false,
        msg: `ERROR: ${res.error || "Failed to parse import string"}`,
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportInput(content);
        const res = importStashJson(content);
        if (res.success) {
          sound.playCommand();
          triggerHaptic("success");
          setImportResult({
            success: true,
            msg: `BACKUP RESTORED: +${res.importedCount} NEW ASSETS IMPORTED`,
          });
          onStatusChange?.(`BACKUP RESTORED: +${res.importedCount} ASSETS`);
        } else {
          setImportResult({ success: false, msg: `IMPORT FAILED: ${res.error}` });
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="lightbox-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-sm"
      onClick={() => {
        sound.playSwitch();
        onClose();
      }}
    >
      <div
        className="w-full max-w-lg border border-border bg-[#0a0a0f] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Portable Stash Sync & Backup"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-border px-3.5 sm:px-4 py-2.5 shrink-0 bg-black/50">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-400 fill-rose-400" />
            <h2 className="text-xs font-bold tracking-widest text-white uppercase font-mono">
              STASH_SYNC <span className="text-cyan">{"//"}</span> PORTABLE_VAULT
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playSwitch();
              triggerHaptic("light");
              onClose();
            }}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center border border-border text-muted hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-border bg-black/70 shrink-0 font-mono text-xs">
          <button
            onClick={() => {
              sound.playSwitch();
              triggerHaptic("light");
              setTab("export");
            }}
            className={`min-h-[44px] py-2 px-3 font-bold flex items-center justify-center gap-2 border-r border-border transition-colors cursor-pointer ${
              tab === "export"
                ? "bg-cyan/15 text-cyan border-b-2 border-b-cyan"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>EXPORT / SHARE</span>
          </button>
          <button
            onClick={() => {
              sound.playSwitch();
              triggerHaptic("light");
              setTab("import");
            }}
            className={`min-h-[44px] py-2 px-3 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              tab === "import"
                ? "bg-cyan/15 text-cyan border-b-2 border-b-cyan"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>IMPORT / MERGE</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-5 flex-1 overflow-y-auto space-y-4 font-mono">
          {/* Privacy & Storage Badge */}
          <div className="p-2.5 bg-[#0f0f18] border border-border/80 flex items-center justify-between text-[11px] text-zinc-300">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                VAULT: <strong className="text-white">{favorites.size} ASSETS SAVED</strong>
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5">
              100% PRIVATE // 0 COOKIES
            </span>
          </div>

          {tab === "export" ? (
            <div className="space-y-3">
              <div className="text-[11px] text-zinc-400">
                Export your saved wallpaper stash to keep as a backup or instantly transfer to another phone, tablet, or PC without creating any account.
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleDownloadJson}
                  className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center justify-between border border-cyan/50 bg-cyan/10 hover:bg-cyan/20 text-cyan text-xs font-bold transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    DOWNLOAD .JSON BACKUP FILE
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">.JSON</span>
                </button>

                <button
                  onClick={handleCopyCompact}
                  className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center justify-between border border-border bg-[#101018] hover:border-cyan/50 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {copied === "compact" ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-cyan" />
                    )}
                    {copied === "compact" ? "SYNC CODE COPIED!" : "COPY COMPACT SYNC CODE"}
                  </span>
                  <span className="text-[10px] text-zinc-500">BASE64</span>
                </button>

                <button
                  onClick={handleNativeShare}
                  className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center justify-between border border-border bg-[#101018] hover:border-cyan/50 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-cyan" />
                    SHARE TO PHONE / MESSAGING
                  </span>
                  <span className="text-[10px] text-zinc-500">AIRDROP / TEXT</span>
                </button>
              </div>

              {/* Code Preview */}
              <div className="p-2.5 bg-black/60 border border-border/70 text-[10px] text-zinc-400 space-y-1">
                <div className="text-zinc-500 text-[9px] uppercase tracking-wider">
                  SYNC PAYLOAD PREVIEW
                </div>
                <div className="truncate text-zinc-300 font-mono">{exportCompactSyncString()}</div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-[11px] text-zinc-400">
                Paste a sync code from another device or upload a previously exported <code className="text-cyan">.json</code> backup file. New assets will be merged automatically without duplicates.
              </div>

              {/* Textarea for pasting */}
              <div className="space-y-1.5">
                <textarea
                  value={importInput}
                  onChange={(e) => setImportInput(e.target.value)}
                  placeholder="Paste sync code or JSON payload here..."
                  rows={4}
                  className="w-full p-2.5 bg-black/70 border border-border text-xs text-white placeholder-zinc-600 font-mono focus:border-cyan focus:outline-none resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleImportSubmit}
                  disabled={!importInput.trim()}
                  className="flex-1 min-h-[44px] px-4 flex items-center justify-center gap-2 border border-cyan bg-cyan/20 text-cyan hover:bg-cyan/30 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>MERGE INTO STASH</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[44px] px-4 flex items-center justify-center gap-2 border border-border bg-[#101018] text-zinc-300 hover:text-white hover:border-zinc-500 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>UPLOAD FILE</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Import Result Notification */}
              {importResult && (
                <div
                  className={`p-2.5 border text-[11px] ${
                    importResult.success
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-rose-500/40 bg-rose-500/10 text-rose-300"
                  }`}
                >
                  {importResult.msg}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
