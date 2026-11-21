import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import type { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
}

export const Toast: React.FC<ToastProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-2.5 border-2 border-[#ff5722] bg-[#0c0f17] px-4 py-3 text-xs font-[var(--font-mono)] font-bold text-white shadow-[4px_4px_0_#000]"
        >
          {toast.type === 'info' ? (
            <Info className="h-4 w-4 text-cyan-400 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-[#ff5722] shrink-0" />
          )}
          <span className="uppercase tracking-wide">{toast.text}</span>
        </div>
      ))}
    </div>
  );
};
