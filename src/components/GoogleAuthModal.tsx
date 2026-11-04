import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUPERVISOR_EMAIL, SUPERVISOR_NAME } from '../constants';
import { Gender } from '../types';
import { X, ShieldCheck, User, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, switchRole, students, setCurrentStudent } = useApp();

  const [mode, setMode] = useState<'select' | 'custom'>('select');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Sign in as Supervisor (khdahd241@gmail.com)
  const handleSignInSupervisor = () => {
    triggerHaptic('success');
    setCurrentUser({
      id: 'usr-admin-1',
      email: SUPERVISOR_EMAIL,
      fullName: SUPERVISOR_NAME,
      role: 'admin',
      gender: 'male',
      phone: '+251 91 123 4567',
      country: 'إثيوبيا',
      isGoogleAccount: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      createdAt: '2026-10-01T00:00:00.000Z',
    });
    switchRole('admin');
    onClose();
  };

  // Sign in with custom Google Account (Student)
  const handleCustomGoogleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const emailTrim = customEmail.trim().toLowerCase();
    const nameTrim = customName.trim();

    if (!emailTrim || !emailTrim.includes('@')) {
      setErrorMsg('يُرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    if (!nameTrim) {
      setErrorMsg('يُرجى كتابة اسمك الكريم');
      return;
    }

    triggerHaptic('success');

    // Check if email matches supervisor
    if (emailTrim === SUPERVISOR_EMAIL.toLowerCase()) {
      handleSignInSupervisor();
      return;
    }

    // Match existing student by email
    const existingStudent = students.find(
      (s) => s.email.toLowerCase() === emailTrim
    );

    const newProfile = {
      id: `usr-std-${Date.now()}`,
      email: emailTrim,
      fullName: nameTrim,
      role: 'student' as const,
      gender: (existingStudent?.gender || 'male') as Gender,
      phone: existingStudent?.phone || '',
      country: existingStudent?.country || 'إثيوبيا',
      studentCode: existingStudent?.code,
      isGoogleAccount: true,
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(newProfile);
    switchRole('student');

    if (existingStudent) {
      setCurrentStudent(existingStudent);
    }

    onClose();
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-xs">
        {/* Google Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white p-5 text-center relative">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 p-1.5 rounded-full hover:bg-emerald-800 text-stone-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-md mb-2 p-2.5">
            <svg className="w-full h-full" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <h3 className="font-bold text-base text-amber-200">
            تسجيل الدخول بحساب Google
          </h3>
          <p className="text-[11px] text-emerald-200/90 mt-0.5">
            تأكيد هويتك لحفظ وتزامن بياناتك القرآنية ورصيد الدقائق
          </p>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'select' ? (
            <div className="space-y-3">
              <span className="text-stone-500 font-bold block text-[11px]">
                اختر الحساب المسجل للمتابعة:
              </span>

              {/* 1. Supervisor Dedicated Account */}
              <button
                type="button"
                onClick={handleSignInSupervisor}
                className="w-full p-3 rounded-2xl border-2 border-emerald-800/40 bg-emerald-50/70 hover:bg-emerald-100 flex items-center justify-between text-right transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-900 text-amber-300 flex items-center justify-center font-bold shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                      <span>{SUPERVISOR_NAME}</span>
                      <span className="bg-amber-200 text-amber-900 text-[9px] px-1.5 py-0.2 rounded font-black">
                        المدير والمشرف
                      </span>
                    </div>
                    <div className="text-[10px] text-emerald-800/80 font-mono">
                      {SUPERVISOR_EMAIL}
                    </div>
                  </div>
                </div>
                <div className="text-emerald-800 text-[10px] font-bold">
                  دخول كمدير
                </div>
              </button>

              {/* 2. Custom Student Google Account */}
              <button
                type="button"
                onClick={() => setMode('custom')}
                className="w-full p-3 rounded-2xl border border-stone-200 hover:border-stone-400 bg-white flex items-center justify-between text-right transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-900 text-xs">
                      تسجيل الدخول كطالب (بحساب Google)
                    </div>
                    <div className="text-[10px] text-stone-500">
                      إدخال بريدك في Google للتعرف على كودك ورصيدك
                    </div>
                  </div>
                </div>
                <div className="text-stone-400 text-xs group-hover:text-stone-800">
                  ←
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomGoogleSignIn} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-800 mb-1">
                  الاسم الكامل (كما في Google)
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="مثال: عبد الرحمن بن صالح"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50/50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-800 mb-1">
                  البريد الإلكتروني في Google
                </label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono text-xs bg-stone-50/50 focus:bg-white text-left"
                  dir="ltr"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('select')}
                  className="w-1/3 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs"
                >
                  رجوع
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#064e3b] text-white font-bold text-xs shadow-md transition"
                >
                  تأكيد الدخول
                </button>
              </div>
            </form>
          )}

          {/* Current user indicator */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>الحساب الحالي:</span>
            <span className="font-bold text-emerald-900">
              {currentUser.fullName} ({currentUser.role === 'admin' ? 'مشرف عام' : 'طالب'})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
