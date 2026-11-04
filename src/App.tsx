import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/ToastContainer';
import { Header } from './components/Header';
import { RegistrationForm } from './components/RegistrationForm';
import { StudentPortal } from './components/StudentPortal';
import { SupervisorDashboard } from './components/SupervisorDashboard';
import { OnboardingSlider } from './components/OnboardingSlider';
import { OfflineIndicator } from './components/OfflineIndicator';
import { initTelegramWebApp } from './utils/telegram';
import { BookOpen, Heart } from 'lucide-react';
import { ACADEMY_NAME, SUPERVISOR_NAME } from './constants';

import { Wifi, BatteryMedium, Signal } from 'lucide-react';

const AndroidStatusBar: React.FC = () => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#022c22] text-amber-200/90 text-[10px] font-mono px-4 py-1 flex items-center justify-between select-none border-b border-emerald-950/60 shrink-0">
      <span className="font-bold">{timeStr || '12:00'}</span>
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-emerald-300 font-bold">5G</span>
        <Signal className="w-3 h-3 text-emerald-300" />
        <Wifi className="w-3 h-3 text-emerald-300" />
        <BatteryMedium className="w-3.5 h-3.5 text-amber-300" />
      </div>
    </div>
  );
};

const MainAppContent: React.FC = () => {
  const { showOnboarding, setShowOnboarding, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'student_portal' | 'register' | 'supervisor'>('student_portal');

  useEffect(() => {
    initTelegramWebApp();
  }, []);

  return (
    <div className="min-h-screen bg-[#ede8da] flex flex-col items-center justify-start overflow-x-hidden selection:bg-emerald-200">
      {/* Android Device Shell Container */}
      <div className="w-full max-w-md sm:max-w-xl min-h-screen bg-[#fbf8f1] flex flex-col relative shadow-2xl border-x border-emerald-950/15 overflow-x-hidden pb-12 sm:pb-0">
        {/* Android Native Status Bar */}
        <AndroidStatusBar />

        {/* Toast Notifications */}
        <ToastContainer />

        {/* 6 Onboarding Definition Pages */}
        {showOnboarding && (
          <OnboardingSlider onComplete={() => setShowOnboarding(false)} />
        )}

        {/* Header */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Pages */}
        <main className="grow flex flex-col overflow-x-hidden">
          {activeTab === 'student_portal' && (
            <StudentPortal onGoToRegister={() => setActiveTab('register')} />
          )}
          {activeTab === 'register' && (
            <RegistrationForm onGoToPortal={() => setActiveTab('student_portal')} />
          )}
          {activeTab === 'supervisor' && <SupervisorDashboard />}
        </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-amber-900/10 bg-[#f4efe3] py-6 text-xs text-stone-600">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 font-bold text-emerald-950 text-sm">
              <BookOpen className="w-4 h-4 text-emerald-800" />
              <span>{ACADEMY_NAME}</span>
            </div>
            <p className="text-[11px] text-stone-500 font-serif">
              «خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ» — بإشراف فضيلة الشيخ المقرئ {SUPERVISOR_NAME}
            </p>
          </div>

          <div className="flex items-center gap-3 text-stone-500 text-[11px]">
            <button
              onClick={() => setActiveTab('student_portal')}
              className="hover:text-emerald-900 transition font-medium"
            >
              بوابة الطالب
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('register')}
              className="hover:text-emerald-900 transition font-medium"
            >
              تسجيل طالب
            </button>
            {(currentUser.role === 'admin' || currentUser.role === 'supervisor') && (
              <>
                <span>•</span>
                <button
                  onClick={() => setActiveTab('supervisor')}
                  className="hover:text-emerald-900 transition font-bold text-emerald-800"
                >
                  لوحة الإدارة والمقرئ
                </button>
              </>
            )}
            <span>•</span>
            <button
              onClick={() => setShowOnboarding(true)}
              className="hover:text-emerald-900 transition font-medium text-amber-900"
            >
              عن المقرأة
            </button>
          </div>
        </div>
      </footer>

      {/* Offline Indicator for PWA */}
      <OfflineIndicator />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </ToastProvider>
  );
}
