import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import type { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
}

export const Toast: React.FC<ToastProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none font-mono">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-2.5 rounded-none border border-sky-400/50 bg-black/95 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-200 backdrop-blur-2xl shadow-2xl animate-fade-in"
        >
          {toast.type === 'info' ? (
            <Info className="h-3.5 w-3.5 text-sky-400 shrink-0" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      ))}
    </div>
  );
};
