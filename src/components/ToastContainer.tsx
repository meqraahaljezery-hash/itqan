import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      dir="rtl"
      className="fixed top-4 left-4 right-4 sm:right-auto sm:left-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        let borderClass = 'border-emerald-500 bg-white text-emerald-950';
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />;
        let pillClass = 'bg-emerald-100 text-emerald-800';

        if (toast.type === 'warning') {
          borderClass = 'border-amber-500 bg-amber-50/95 text-amber-950';
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />;
          pillClass = 'bg-amber-200 text-amber-900';
        } else if (toast.type === 'error') {
          borderClass = 'border-red-500 bg-red-50/95 text-red-950';
          icon = <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />;
          pillClass = 'bg-red-200 text-red-900';
        } else if (toast.type === 'info') {
          borderClass = 'border-sky-500 bg-sky-50/95 text-sky-950';
          icon = <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />;
          pillClass = 'bg-sky-200 text-sky-900';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl p-4 shadow-xl border-2 transition-all duration-300 animate-in slide-in-from-top-3 flex items-start justify-between gap-3 backdrop-blur-xs ${borderClass}`}
            role="alert"
          >
            <div className="flex items-start gap-2.5">
              {icon}
              <div className="space-y-0.5 text-right">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs sm:text-sm">{toast.title}</h4>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${pillClass}`}>
                    تنبيه حي
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-stone-700 font-medium">
                  {toast.message}
                </p>
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition shrink-0"
              aria-label="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
