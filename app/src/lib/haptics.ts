// Safe mobile micro-haptics wrapper using navigator.vibrate

export function triggerHaptic(type: 'light' | 'medium' | 'success' = 'light') {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
  if (!('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(8);
        break;
      case 'medium':
        navigator.vibrate(16);
        break;
      case 'success':
        navigator.vibrate([12, 35, 20]);
        break;
    }
  } catch {
    // Fails silently on devices where vibrate is disabled by system policy
  }
}
