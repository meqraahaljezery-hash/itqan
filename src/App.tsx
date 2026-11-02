import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { RegistrationForm } from './components/RegistrationForm';
import { StudentPortal } from './components/StudentPortal';
import { SupervisorDashboard } from './components/SupervisorDashboard';
import { OfflineIndicator } from './components/OfflineIndicator';
import { initTelegramWebApp } from './utils/telegram';
import { BookOpen, Heart, Shield, Clock } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  useEffect(() => {
    initTelegramWebApp();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8f1] text-emerald-950">
      <Header />

      <main className="grow">
        {activeTab === 'student_portal' && <StudentPortal />}
        {activeTab === 'register' && <RegistrationForm />}
        {activeTab === 'supervisor' && <SupervisorDashboard />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-amber-900/10 bg-[#f4efe3] py-6 sm:py-8 text-xs text-stone-600">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 font-bold text-emerald-950 text-sm">
              <BookOpen className="w-4 h-4 text-emerald-800" />
              <span>مقرأة الإتقان القرآنية | نظام الإقراء بالدقائق</span>
            </div>
            <p className="text-[11px] text-stone-500">
              «خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ» — إشراف ومتابعة فضيلة الشيخ المقرئ خالد أحمد مصطفى
            </p>
          </div>

          <div className="flex items-center gap-3 text-stone-500 text-[11px]">
            <button
              onClick={() => setActiveTab('student_portal')}
              className="hover:text-emerald-900 transition"
            >
              بوابة الطالب
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('register')}
              className="hover:text-emerald-900 transition"
            >
              تسجيل جديد
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('supervisor')}
              className="hover:text-emerald-900 transition font-bold text-emerald-800"
            >
              لوحة المقرئ
            </button>
          </div>
        </div>
      </footer>

      {/* Offline Status indicator for PWA */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
