import { useMemo, useSyncExternalStore } from 'react';

const KEY = 'voidwalls_favorites';
const listeners = new Set<() => void>();

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? '[]';
  } catch {
    return '[]';
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === KEY && listener();
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

export function useFavorites(): Set<string> {
  const raw = useSyncExternalStore(subscribe, read, () => '[]');
  return useMemo(() => {
    try {
      return new Set<string>(JSON.parse(raw));
    } catch {
      return new Set<string>();
    }
  }, [raw]);
}

/** Toggles an id and returns true if it is now saved. */
export function toggleFavoriteId(id: string): boolean {
  const next = new Set<string>(JSON.parse(read()));
  const saved = !next.has(id);
  if (saved) next.add(id);
  else next.delete(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...next]));
  } catch {}
  listeners.forEach((l) => l());
  return saved;
}

export interface StashBackupSchema {
  version: number;
  app: string;
  exportedAt: string;
  count: number;
  stash: string[];
}

/** Exports full Stash as a formatted JSON string */
export function exportStashJson(): string {
  const ids: string[] = JSON.parse(read());
  const backup: StashBackupSchema = {
    version: 1,
    app: "void-walls",
    exportedAt: new Date().toISOString(),
    count: ids.length,
    stash: ids,
  };
  return JSON.stringify(backup, null, 2);
}

/** Exports compact Base64 sync string for easy mobile messaging */
export function exportCompactSyncString(): string {
  const ids: string[] = JSON.parse(read());
  try {
    return btoa(JSON.stringify(ids));
  } catch {
    return ids.join(',');
  }
}

/** Imports and merges stash items with deduplication */
export function importStashJson(rawInput: string): {
  success: boolean;
  importedCount: number;
  totalCount: number;
  error?: string;
} {
  try {
    const trimmed = rawInput.trim();
    let incomingIds: string[] = [];

    // Case 1: Base64 compact string
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      try {
        const decoded = atob(trimmed);
        const parsed = JSON.parse(decoded);
        if (Array.isArray(parsed)) incomingIds = parsed;
      } catch {
        // Fallback comma-delimited
        incomingIds = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
      }
    } else {
      // Case 2: JSON (either { stash: [] } or raw array [])
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        incomingIds = parsed;
      } else if (parsed && Array.isArray(parsed.stash)) {
        incomingIds = parsed.stash;
      } else {
        return { success: false, importedCount: 0, totalCount: 0, error: "Invalid stash JSON format" };
      }
    }

    // Filter to valid string IDs
    const validIncoming = incomingIds.filter((id) => typeof id === 'string' && id.length > 0);
    if (validIncoming.length === 0) {
      return { success: false, importedCount: 0, totalCount: 0, error: "No valid wallpaper IDs found" };
    }

    const currentSet = new Set<string>(JSON.parse(read()));
    let newItemsCount = 0;

    validIncoming.forEach((id) => {
      if (!currentSet.has(id)) {
        currentSet.add(id);
        newItemsCount++;
      }
    });

    const mergedList = [...currentSet];
    localStorage.setItem(KEY, JSON.stringify(mergedList));
    listeners.forEach((l) => l());

    return {
      success: true,
      importedCount: newItemsCount,
      totalCount: mergedList.length,
    };
  } catch (err: unknown) {
    return {
      success: false,
      importedCount: 0,
      totalCount: 0,
      error: err instanceof Error ? err.message : "Failed to parse stash payload",
    };
  }
}

/** Clears all stash items */
export function clearAllFavorites(): void {
  try {
    localStorage.setItem(KEY, '[]');
  } catch {}
  listeners.forEach((l) => l());
}
