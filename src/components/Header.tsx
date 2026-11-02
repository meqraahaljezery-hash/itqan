import React from 'react';
import { BookOpen, UserPlus, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import { isTelegramWebApp } from '../utils/telegram';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, isSupervisor, payments, currentStudent } = useApp();
  const pendingPaymentsCount = payments.filter((p) => p.status === 'pending').length;
  const inTelegram = isTelegramWebApp();

  return (
    <header className="sticky top-0 z-40 bg-[#064e3b] text-white shadow-lg border-b border-amber-500/30">
      {/* Quranic Bismillah / Top bar */}
      <div className="bg-[#022c22] py-1 px-4 text-center text-[11px] text-amber-200/90 font-serif tracking-widest border-b border-emerald-900/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-amber-300">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="hidden sm:inline">نظام الإقراء المباشر بالدقائق المتصلة</span>
          <span className="sm:hidden">نظام الإقراء بالدقائق</span>
        </div>
        <div className="font-serif text-amber-100 text-xs sm:text-sm">
          بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ
        </div>
        <div className="flex items-center gap-2">
          {inTelegram && (
            <span className="bg-sky-500/20 text-sky-300 text-[10px] px-2 py-0.5 rounded-full border border-sky-400/30">
              Telegram TMA
            </span>
          )}
          <PWAInstallButton />
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('student_portal')}>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-md p-0.5 ring-2 ring-amber-300/40 shrink-0">
            <div className="w-full h-full rounded-[10px] bg-[#064e3b] flex items-center justify-center text-amber-300">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>مقرأة الإتقان القرآنية</span>
              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                بنظام الدقائق
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-emerald-200/80 font-light truncate">
              إقراء فردي • تلاوة وتصحيح • إجازة بالسند المتصل
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Student Portal Button */}
          <button
            onClick={() => setActiveTab('student_portal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'student_portal'
                ? 'bg-amber-500 text-stone-900 shadow-md ring-2 ring-amber-300'
                : 'bg-emerald-800/60 text-emerald-100 hover:bg-emerald-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span className="hidden xs:inline">بوابة الطالب</span>
            <span className="xs:hidden">الطالب</span>
            {currentStudent && (
              <span className="hidden md:inline-block bg-emerald-950/70 text-amber-200 text-[10px] px-1.5 py-0.5 rounded font-mono">
                {currentStudent.code}
              </span>
            )}
          </button>

          {/* New Registration Button */}
          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'register'
                ? 'bg-amber-500 text-stone-900 shadow-md ring-2 ring-amber-300'
                : 'bg-emerald-800/60 text-emerald-100 hover:bg-emerald-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>تسجيل جديد</span>
          </button>

          {/* Supervisor / Teacher Portal */}
          <button
            onClick={() => setActiveTab('supervisor')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'supervisor'
                ? 'bg-amber-500 text-stone-900 shadow-md ring-2 ring-amber-300'
                : 'bg-emerald-800/60 text-emerald-100 hover:bg-emerald-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">لوحة المقرئ والمشرف</span>
            <span className="sm:hidden">المقرئ</span>
            {pendingPaymentsCount > 0 && isSupervisor && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow">
                {pendingPaymentsCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
