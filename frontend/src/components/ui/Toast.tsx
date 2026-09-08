import { useState, useCallback } from 'react';
import type { FC, ReactNode } from 'react';
import { AlertOctagon, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { ToastContext, type ToastType, type ToastItem } from './ToastContext';

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({
      type = 'info',
      title,
      message,
      duration = 4000,
    }: {
      type?: ToastType;
      title: string;
      message?: string;
      duration?: number;
    }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => addToast({ type: 'success', title, message }), [addToast]);
  const error = useCallback((title: string, message?: string) => addToast({ type: 'error', title, message }), [addToast]);
  const warning = useCallback((title: string, message?: string) => addToast({ type: 'warning', title, message }), [addToast]);
  const info = useCallback((title: string, message?: string) => addToast({ type: 'info', title, message }), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, warning, info }}>
      {children}
      {/* Toast Render Portal / Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          let borderCol = 'border-blue-500/40 bg-slate-900/95 text-blue-300';
          let Icon = Info;
          if (t.type === 'success') {
            borderCol = 'border-emerald-500/40 bg-[#09151c]/95 text-emerald-300';
            Icon = CheckCircle2;
          } else if (t.type === 'error') {
            borderCol = 'border-rose-500/40 bg-[#190d14]/95 text-rose-300';
            Icon = AlertOctagon;
          } else if (t.type === 'warning') {
            borderCol = 'border-amber-500/40 bg-[#19140a]/95 text-amber-300';
            Icon = AlertTriangle;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-3.5 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform translate-y-0 flex items-start justify-between gap-3 ${borderCol}`}
            >
              <div className="flex items-start gap-2.5">
                <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold font-mono text-slate-100">{t.title}</h4>
                  {t.message && <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{t.message}</p>}
                </div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-200 p-0.5 rounded cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
