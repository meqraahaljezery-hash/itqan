import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide or show small badge
  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-800/60 text-emerald-100 border border-emerald-600/40">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        تطبيق مثبت
      </span>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-900 font-bold px-3.5 py-1.5 text-xs shadow-md transition-all active:scale-95"
        title="تثبيت التطبيق على جهازك للوصول السريع بدون متصفح"
      >
        <Download className="w-3.5 h-3.5" />
        <span>تثبيت التطبيق (PWA)</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-emerald-600/50 bg-emerald-900/40 px-3 py-1.5 text-xs font-medium text-emerald-100 hover:bg-emerald-800/60 transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>تثبيت على آيفون</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#fdfbf7] p-6 shadow-2xl border border-amber-200/80 text-right">
              <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full hover:bg-stone-200 text-stone-500"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-base font-bold text-emerald-900">طريقة تثبيت التطبيق على iPhone / iPad</h3>
              </div>
              <div className="mt-4 space-y-3 text-sm text-stone-700 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0 mt-0.5">١</span>
                  <p>اضغط على زر <strong>المشاركة (Share)</strong> في شريط متصفح Safari السفلي (مربع بسهم للأعلى).</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0 mt-0.5">٢</span>
                  <p>مرر القائمة للأسفل واضغط على <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0 mt-0.5">٣</span>
                  <p>اضغط على <strong>إضافة (Add)</strong> بالأعلى ليظهر التطبيق في شاشتك الرئيسية فوراً كأي تطبيق أصلي.</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-emerald-900 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 transition"
              >
                فهمت، حسناً
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
