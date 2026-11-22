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
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
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
