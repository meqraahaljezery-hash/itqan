import React, { useState } from 'react';
import { BookOpen, UserPlus, ShieldCheck, UserCheck, Sparkles, HelpCircle, User, LogIn, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import { isTelegramWebApp } from '../utils/telegram';
import { ACADEMY_NAME, ACADEMY_SHORT_NAME, SUPERVISOR_EMAIL } from '../constants';
import { GoogleAuthModal } from './GoogleAuthModal';
import { NotificationsModal } from './NotificationsModal';

interface HeaderProps {
  activeTab: 'student_portal' | 'register' | 'supervisor';
  setActiveTab: (tab: 'student_portal' | 'register' | 'supervisor') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentUser,
    currentStudent,
    paymentRequests,
    registrationRequests,
    notifications,
    setShowOnboarding,
  } = useApp();
  const pendingCount =
    paymentRequests.filter((p) => p.status === 'pending').length +
    registrationRequests.filter((r) => r.status === 'pending').length;
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => {
    if (currentStudent && n.recipientId !== currentStudent.id && n.recipientId !== 'all') {
      return false;
    }
    return !n.isRead;
  }).length;

  const isSupervisor =
    currentUser.role === 'admin' ||
    currentUser.role === 'supervisor' ||
    currentUser.email.toLowerCase() === SUPERVISOR_EMAIL.toLowerCase();
  const inTelegram = isTelegramWebApp();

  return (
    <header className="sticky top-0 z-40 bg-[#064e3b] text-white shadow-lg border-b border-amber-500/30">
      {/* Top Quranic Bismillah Bar */}
      <div className="bg-[#022c22] py-1 px-4 text-center text-[11px] text-amber-200/90 font-serif tracking-widest border-b border-emerald-900/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-amber-300">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="hidden sm:inline">منصة الإقراء والإجازة بالسند المتصل</span>
          <span className="sm:hidden">مقرأة الجزري</span>
        </div>

        <div className="font-serif text-amber-100 text-xs sm:text-sm">
          بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ
        </div>

        <div className="flex items-center gap-2">
          {/* In-App Notifications Bell */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 text-white px-2 py-0.5 rounded-lg border border-white/20 transition"
            title="الإشعارات داخل التطبيق"
          >
            <Bell className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">الإشعارات</span>
            {unreadNotifsCount > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Google Account Button */}
          <button
            onClick={() => setIsAuthOpen(true)}
            className="flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 text-white px-2 py-0.5 rounded-lg border border-white/20 transition"
            title="تسجيل الدخول أو تبديل حساب Google"
          >
            <User className="w-3 h-3 text-amber-300" />
            <span className="max-w-[100px] truncate hidden sm:inline">
              {currentUser.email ? currentUser.email.split('@')[0] : 'دخول Google'}
            </span>
            <span className="sm:hidden">Google</span>
          </button>

          {/* Button to reopen the 6 definition onboarding pages */}
          <button
            onClick={() => setShowOnboarding(true)}
            className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-200 hover:text-white bg-emerald-900/60 hover:bg-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-700/50 transition"
            title="عرض صفحات التعريف بالمقرأة"
          >
            <HelpCircle className="w-3 h-3 text-amber-300" />
            <span>عن المقرأة</span>
          </button>

          {inTelegram && (
            <span className="bg-sky-500/20 text-sky-300 text-[10px] px-2 py-0.5 rounded-full border border-sky-400/30">
              Telegram TMA
            </span>
          )}
          <PWAInstallButton />
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => setActiveTab('student_portal')}
        >
          <img
            src="/assets/branding/app-icon.png"
            alt="شعار مقرأة الجزري"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover shadow-md ring-2 ring-amber-300/60 shrink-0 border border-emerald-950/40 bg-[#064e3b]"
          />
          <div>
            <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>{ACADEMY_NAME}</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-emerald-200/80 font-light truncate">
              إقراء فردي • تلاوة وتصحيح • إجازة بالسند المتصل
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Student Portal */}
          <button
            onClick={() => setActiveTab('student_portal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'student_portal'
                ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-300'
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

          {/* New Registration */}
          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'register'
                ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-300'
                : 'bg-emerald-800/60 text-emerald-100 hover:bg-emerald-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>تسجيل طالب</span>
          </button>

          {/* Supervisor / Reciter / Admin Portal - Shown ONLY for authorized supervisor/admin */}
          {isSupervisor && (
            <button
              onClick={() => setActiveTab('supervisor')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'supervisor'
                  ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-emerald-800/60 text-emerald-100 hover:bg-emerald-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">لوحة الإدارة</span>
              <span className="sm:hidden">الإدارة</span>
              {pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          )}
        </nav>
      </div>

      {/* Google Auth Modal */}
      {isAuthOpen && (
        <GoogleAuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      )}

      {/* In-App Notifications Center Modal */}
      {isNotificationsOpen && (
        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          onOpenRecharge={() => {
            setIsNotificationsOpen(false);
            setActiveTab('student_portal');
          }}
        />
      )}
    </header>
  );
};
