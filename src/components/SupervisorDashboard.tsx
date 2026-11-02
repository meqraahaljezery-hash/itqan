import React, { useState } from 'react';
import {
  ShieldCheck,
  LogOut,
  Users,
  CreditCard,
  History,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Copy,
  Send,
  ExternalLink,
  Eye,
  AlertTriangle,
  Lock,
  Sparkles,
  ArrowRight,
  MinusCircle,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPERVISOR_EMAIL, SUPERVISOR_NAME, PROGRAMS, SHIFTS } from '../constants';
import { Gender, PaymentTransaction, ShiftId, Student } from '../types';
import { openTelegramShare, triggerHaptic } from '../utils/telegram';

export const SupervisorDashboard: React.FC = () => {
  const {
    isSupervisor,
    loginSupervisor,
    logoutSupervisor,
    students,
    payments,
    ledger,
    deductMinutes,
    approvePayment,
    rejectPayment,
    resetDataToDemo,
  } = useApp();

  // Login form state
  const [emailInput, setEmailInput] = useState(SUPERVISOR_EMAIL);
  const [passwordInput, setPasswordInput] = useState('Admin@2026');
  const [loginError, setLoginError] = useState('');

  // Dashboard navigation
  const [activeTab, setActiveTab] = useState<'deduct' | 'payments' | 'ledger' | 'students'>('deduct');

  // Deduction state
  const [selectedStudentForDeduct, setSelectedStudentForDeduct] = useState<Student | null>(null);
  const [deductMinutesInput, setDeductMinutesInput] = useState<number>(25);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [lastDeductionResult, setLastDeductionResult] = useState<{
    message: string;
    student: Student;
    minutes: number;
    before: number;
    after: number;
  } | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Student filter & search
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | Gender>('all');
  const [shiftFilter, setShiftFilter] = useState<'all' | ShiftId>('all');

  // Receipt modal state
  const [viewingReceipt, setViewingReceipt] = useState<PaymentTransaction | null>(null);
  const [rejectionModalPayment, setRejectionModalPayment] = useState<PaymentTransaction | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('الرقم المرجعي غير متطابق مع كشف حساب البنك');

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = loginSupervisor(emailInput, passwordInput);
    if (!ok) {
      setLoginError(`يُرجى إدخال البريد الإلكتروني المعتمد للمشرف (${SUPERVISOR_EMAIL})`);
    } else {
      setLoginError('');
    }
  };

  // Quick fill demo login
  const handleDemoFill = () => {
    setEmailInput(SUPERVISOR_EMAIL);
    setPasswordInput('Admin@2026');
    loginSupervisor(SUPERVISOR_EMAIL, 'Admin@2026');
  };

  // Handle minute deduction
  const handleConfirmDeduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForDeduct || deductMinutesInput <= 0) return;

    const res = deductMinutes(
      selectedStudentForDeduct.id,
      deductMinutesInput,
      SUPERVISOR_NAME,
      sessionNotes || 'تسميع ومراجعة في حلقة البث المباشر'
    );

    if (res.success) {
      setLastDeductionResult({
        message: res.message,
        student: selectedStudentForDeduct,
        minutes: deductMinutesInput,
        before: res.balanceBefore,
        after: res.balanceAfter,
      });
      setSelectedStudentForDeduct(null);
      setSessionNotes('');
      setDeductMinutesInput(25);
    }
  };

  // Handle Telegram Share
  const handleShareToTelegram = (messageText: string, telegramHandle: string) => {
    // Open Telegram with pre-filled formatted text
    openTelegramShare(messageText);
    triggerHaptic('success');
  };

  const handleCopyNotification = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    triggerHaptic('light');
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.telegramHandle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = genderFilter === 'all' || s.gender === genderFilter;
    const matchesShift = shiftFilter === 'all' || s.shift === shiftFilter;
    return matchesSearch && matchesGender && matchesShift;
  });

  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const processedPayments = payments.filter((p) => p.status !== 'pending');

  // If not logged in as supervisor, show login screen
  if (!isSupervisor) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 sm:py-16">
        <div className="bg-white rounded-3xl shadow-xl border border-stone-200/80 p-6 sm:p-8 space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-900 text-amber-300 shadow-md mb-1">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-emerald-950 font-serif">
              لوحة تحكم المشرف والمقرئ
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              خصم دقائق الحصص فورياً ومراقبة الإيصالات والتحويلات البنكية
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-right">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                بريد المشرف المعتمد
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono text-left focus:ring-2 focus:ring-emerald-700 bg-stone-50"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                كلمة المرور
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-left focus:ring-2 focus:ring-emerald-700 bg-stone-50"
                dir="ltr"
              />
            </div>

            {loginError && (
              <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 text-right">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition active:scale-98"
            >
              تسجيل الدخول للوحة التحكم
            </button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="pt-3 border-t border-stone-100">
            <button
              onClick={handleDemoFill}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300/80 transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>دخول سريع فوري كـ مشرف ({SUPERVISOR_EMAIL})</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Supervisor Top Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-900 text-amber-300 flex items-center justify-center font-bold shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-emerald-950">{SUPERVISOR_NAME}</h2>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                صلاحية كاملة
              </span>
            </div>
            <p className="text-[11px] font-mono text-stone-500">{SUPERVISOR_EMAIL}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={resetDataToDemo}
            className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-600 text-xs font-medium transition"
            title="إعادة تعيين البيانات النموذجية"
          >
            إعادة تعيين للوضع التجريبي
          </button>

          <button
            onClick={logoutSupervisor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 text-xs font-bold transition border border-stone-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher for Supervisor */}
      <div className="flex items-center gap-1.5 sm:gap-3 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('deduct')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'deduct'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-300" />
          <span>الخصم السريع للمقرئ (Live Deduct)</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'payments'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <CreditCard className="w-4 h-4 text-amber-300" />
          <span>مراقبة التحويلات البنكية والإيصالات</span>
          {pendingPayments.length > 0 && (
            <span className="bg-amber-400 text-stone-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {pendingPayments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'ledger'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <History className="w-4 h-4 text-amber-300" />
          <span>دفتر الأستاذ (Audit Ledger)</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'students'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Users className="w-4 h-4 text-amber-300" />
          <span>دليل الطلاب ({students.length})</span>
        </button>
      </div>

      {/* Success Notification Modal / Card when a deduction was just made */}
      {lastDeductionResult && (
        <div className="bg-[#fdfbf7] rounded-3xl p-5 sm:p-6 border-2 border-emerald-700 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm sm:text-base text-emerald-950">
                تم خصم {lastDeductionResult.minutes} دقيقة بنجاح من رصيد {lastDeductionResult.student.fullName}
              </h3>
            </div>
            <button
              onClick={() => setLastDeductionResult(null)}
              className="text-stone-400 hover:text-stone-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Generated Official Message Preview */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                <span>نص رسالة الإشعار التلقائية المولدة:</span>
                <button
                  onClick={() => handleCopyNotification(lastDeductionResult.message)}
                  className="flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 hover:bg-emerald-100"
                >
                  {copiedMessage ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMessage ? 'تم النسخ' : 'نسخ الرسالة'}</span>
                </button>
              </div>

              <pre className="text-xs font-serif leading-relaxed text-stone-800 whitespace-pre-wrap bg-stone-50 p-3 rounded-xl border border-stone-100">
                {lastDeductionResult.message}
              </pre>
            </div>

            {/* Quick Actions to Send to Telegram */}
            <div className="flex flex-col justify-between space-y-3 bg-sky-50/70 p-4 rounded-2xl border border-sky-200">
              <div>
                <span className="text-xs font-bold text-sky-950 block">إرسال الإشعار للطالب مباشرة:</span>
                <p className="text-xs text-sky-800 mt-1">
                  معرف الطالب: <strong className="font-mono text-sky-950">{lastDeductionResult.student.telegramHandle}</strong>
                </p>
                <div className="text-[11px] text-stone-600 mt-2">
                  • الرصيد السابق: {lastDeductionResult.before} دقيقة<br />
                  • دقائق اليوم: {lastDeductionResult.minutes} دقيقة<br />
                  • الرصيد المتبقي: <strong>{lastDeductionResult.after} دقيقة</strong>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    handleShareToTelegram(lastDeductionResult.message, lastDeductionResult.student.telegramHandle)
                  }
                  className="grow flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition active:scale-95"
                >
                  <Send className="w-4 h-4 -rotate-12" />
                  <span>إرسال عبر التيليجرام فوراً</span>
                </button>

                <button
                  onClick={() => setLastDeductionResult(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-white text-xs font-bold transition"
                >
                  تم، إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: TEACHER QUICK DEDUCTION */}
      {activeTab === 'deduct' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200/80 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث باسم الطالب أو كوده (IM-1001)..."
                className="w-full pl-3 pr-9 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Gender selector */}
              <div className="flex items-center rounded-xl bg-stone-100 p-1 text-xs">
                <button
                  onClick={() => setGenderFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${genderFilter === 'all' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500'}`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setGenderFilter('male')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${genderFilter === 'male' ? 'bg-white shadow-xs text-emerald-800' : 'text-stone-500'}`}
                >
                  رجال (IM)
                </button>
                <button
                  onClick={() => setGenderFilter('female')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${genderFilter === 'female' ? 'bg-white shadow-xs text-purple-800' : 'text-stone-500'}`}
                >
                  نساء (IF)
                </button>
              </div>

              {/* Shift selector */}
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white text-stone-700"
              >
                <option value="all">جميع الفترات</option>
                <option value="morning">الصباحية (09:00 - 12:00)</option>
                <option value="evening">المسائية (14:00 - 15:30)</option>
                <option value="night">الليلية (21:00 - 23:00)</option>
              </select>
            </div>
          </div>

          {/* Quick Deduction Student Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredStudents.map((std) => {
              const isLow = std.balanceMinutes < 15;
              const isZero = std.balanceMinutes === 0;

              return (
                <div
                  key={std.id}
                  className={`bg-white rounded-2xl p-4 border transition-all hover:shadow-md flex flex-col justify-between ${
                    isZero
                      ? 'border-red-300 bg-red-50/20'
                      : isLow
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-stone-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-stone-100 text-emerald-950 border border-stone-200">
                          {std.code}
                        </span>
                        <h4 className="font-bold text-sm text-stone-900 mt-1 truncate max-w-[190px]">
                          {std.fullName}
                        </h4>
                      </div>

                      {/* Live Balance badge */}
                      <div className="text-left shrink-0">
                        <div
                          className={`text-lg font-black font-mono leading-none ${
                            isZero
                              ? 'text-red-600'
                              : isLow
                              ? 'text-amber-600'
                              : 'text-emerald-800'
                          }`}
                        >
                          {std.balanceMinutes}
                          <span className="text-[10px] font-sans font-normal text-stone-500 mr-1">د</span>
                        </div>
                        {isLow && (
                          <span className="text-[9px] font-bold text-amber-700 block">
                            {isZero ? 'رصيد نافد' : 'رصيد منخفض'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-500 mt-2 space-y-0.5">
                      <div className="truncate">
                        <span>البرنامج: </span>
                        <strong className="text-stone-700">
                          {PROGRAMS.find((p) => p.id === std.program)?.title}
                        </strong>
                      </div>
                      <div className="truncate">
                        <span>الفترة: </span>
                        <span className="text-stone-700 font-medium">
                          {SHIFTS.find((s) => s.id === std.shift)?.title}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action: Click to Deduct */}
                  <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-sky-700 truncate">
                      {std.telegramHandle}
                    </span>

                    <button
                      onClick={() => {
                        setSelectedStudentForDeduct(std);
                        setDeductMinutesInput(25);
                        triggerHaptic('light');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition active:scale-95 flex items-center gap-1 shrink-0"
                    >
                      <MinusCircle className="w-3.5 h-3.5 text-amber-300" />
                      <span>خصم تسميع</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: INPUT DEDUCTION MINUTES */}
      {selectedStudentForDeduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#fdfbf7] rounded-3xl shadow-2xl border border-amber-300 p-6 space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-900 text-amber-300 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-emerald-950">خصم دقائق التسميع اليوم</h3>
                  <p className="text-xs text-stone-500">حلقة التسميع المباشرة مع الطالب</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForDeduct(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Preview Card */}
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono text-amber-800 font-bold block">{selectedStudentForDeduct.code}</span>
                <span className="font-bold text-stone-900 text-sm">{selectedStudentForDeduct.fullName}</span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-stone-500 block">الرصيد الحي:</span>
                <span className="font-mono text-base font-black text-emerald-900">
                  {selectedStudentForDeduct.balanceMinutes} دقيقة
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmDeduction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-2">
                  أدخل عدد دقائق التسميع اليوم <span className="text-red-500">*</span>
                </label>

                {/* Quick preset minute pills */}
                <div className="grid grid-cols-5 gap-1.5 mb-2.5">
                  {[10, 15, 20, 25, 30].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDeductMinutesInput(m)}
                      className={`py-1.5 rounded-xl text-xs font-bold font-mono transition ${
                        deductMinutesInput === m
                          ? 'bg-emerald-900 text-white shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {m} د
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={selectedStudentForDeduct.balanceMinutes > 0 ? selectedStudentForDeduct.balanceMinutes : 600}
                    required
                    value={deductMinutesInput}
                    onChange={(e) => setDeductMinutesInput(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-lg font-mono font-black text-center text-emerald-950 focus:ring-2 focus:ring-emerald-700 bg-white"
                  />
                  <span className="absolute left-3.5 top-3.5 text-xs text-stone-400 font-bold">دقيقة</span>
                </div>
              </div>

              {/* Session notes */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  ملاحظات الحصة وورد التسميع (اختياري)
                </label>
                <input
                  type="text"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="مثال: تسميع الحزب الأول وتنبيه على أحكام الميم الساكنة"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              {/* Deduction Summary */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-stone-700 flex justify-between">
                <span>الرصيد بعد الخصم:</span>
                <span className="font-mono font-black text-emerald-900 text-xs">
                  {Math.max(0, selectedStudentForDeduct.balanceMinutes - deductMinutesInput)} دقيقة
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForDeduct(null)}
                  className="w-1/3 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 text-white text-xs font-bold shadow-md transition active:scale-95"
                >
                  تأكيد الخصم وتوليد الإشعار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENTS MONITORING & LEDGER AUDIT */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Pending Queue */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm sm:text-base text-emerald-950">
                  طلبات الشحن المعلقة (تحتاج تدقيق واعتماد فوري)
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                {pendingPayments.length} معلقة
              </span>
            </div>

            {pendingPayments.length === 0 ? (
              <div className="text-center py-10 text-stone-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                <p className="font-bold text-stone-600">جميع التحويلات البنكية مدققة ومكتملة!</p>
                <p className="text-[11px] mt-0.5">لا توجد إيصالات معلقة بانتظار المراجعة حالياً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingPayments.map((pay) => (
                  <div
                    key={pay.id}
                    className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/30 space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                          {pay.studentCode}
                        </span>
                        <h4 className="font-bold text-sm text-stone-900 mt-1">{pay.studentName}</h4>
                      </div>

                      <div className="text-left">
                        <span className="text-base font-black font-mono text-emerald-900 block">
                          {pay.packageMinutes} دقيقة
                        </span>
                        <span className="text-[11px] font-bold text-amber-800">{pay.amountEtb} بر إثيوبي</span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1 text-[11px]">
                      <div>
                        <span className="text-stone-500">البنك / المحفظة: </span>
                        <strong className="text-stone-800">{pay.bankName}</strong>
                      </div>
                      <div>
                        <span className="text-stone-500">الرقم المرجعي (Ref): </span>
                        <strong className="font-mono text-emerald-900 select-all">{pay.transactionRef}</strong>
                      </div>
                      <div>
                        <span className="text-stone-500">وقت الإرسال: </span>
                        <span className="font-mono text-stone-600">
                          {new Date(pay.submittedAt).toLocaleString('ar-EG')}
                        </span>
                      </div>
                    </div>

                    {/* Receipt Preview Thumbnail */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setViewingReceipt(pay)}
                        className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>فحص صورة الإيصال</span>
                      </button>

                      {/* Action Buttons: Approve / Reject */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRejectionModalPayment(pay);
                            setRejectionReasonText('الرقم المرجعي غير متطابق مع كشف حساب البنك');
                          }}
                          className="px-3 py-1.5 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold transition"
                        >
                          رفض
                        </button>

                        <button
                          type="button"
                          onClick={() => approvePayment(pay.id)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition active:scale-95 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>اعتماد وإضافة الدقائق</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Processed Archive */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-3">
            <h3 className="font-bold text-sm text-stone-800">سجل التحويلات السابقة المعتمدة والمرفوضة</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-medium">
                    <th className="py-2.5 px-3">الطالب</th>
                    <th className="py-2.5 px-3">الباقة</th>
                    <th className="py-2.5 px-3">المبلغ</th>
                    <th className="py-2.5 px-3">البنك</th>
                    <th className="py-2.5 px-3">الرقم المرجعي</th>
                    <th className="py-2.5 px-3">الحالة</th>
                    <th className="py-2.5 px-3">الإيصال</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {processedPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50">
                      <td className="py-2.5 px-3 font-bold text-stone-900">
                        {p.studentName} <span className="font-mono text-stone-400">({p.studentCode})</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-900">{p.packageMinutes} دقيقة</td>
                      <td className="py-2.5 px-3 font-mono">{p.amountEtb} بر</td>
                      <td className="py-2.5 px-3">{p.bankName}</td>
                      <td className="py-2.5 px-3 font-mono text-stone-600 select-all">{p.transactionRef}</td>
                      <td className="py-2.5 px-3">
                        {p.status === 'approved' ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold border border-emerald-200">
                            معتمد ✓
                          </span>
                        ) : (
                          <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-md font-bold border border-red-200" title={p.rejectionReason}>
                            مرفوض ✕
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => setViewingReceipt(p)}
                          className="text-stone-500 hover:text-emerald-800 p-1"
                          title="عرض الإيصال"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-emerald-950 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-700" />
                <span>دفتر الأستاذ الرقمي غير القابل للتعديل (Audit Ledger)</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                سجل زمني دقيق لكل دقيقة تم خصمها أو شحنها في المقرأة لضمان النزاهة والشفافية التامة
              </p>
            </div>

            <div className="text-xs text-stone-500 font-mono bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200">
              إجمالي العمليات: <strong>{ledger.length}</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-semibold bg-stone-50/60">
                  <th className="py-3 px-3">التاريخ والوقت</th>
                  <th className="py-3 px-3">الطالب والكود</th>
                  <th className="py-3 px-3">نوع الحركة</th>
                  <th className="py-3 px-3">المقدار</th>
                  <th className="py-3 px-3">الرصيد السابق</th>
                  <th className="py-3 px-3">الرصيد الجديد</th>
                  <th className="py-3 px-3">الملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-stone-50">
                    <td className="py-3 px-3 font-mono text-stone-500 text-[11px] whitespace-nowrap">
                      {entry.timestamp}
                    </td>
                    <td className="py-3 px-3 font-bold text-stone-900 whitespace-nowrap">
                      {entry.studentName} <span className="font-mono text-amber-800">({entry.studentCode})</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {entry.type === 'session_deduction' && (
                        <span className="text-stone-700 bg-stone-100 px-2 py-0.5 rounded text-[10px] font-bold">
                          خصم تسميع
                        </span>
                      )}
                      {entry.type === 'package_credit' && (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                          شحن باقة
                        </span>
                      )}
                      {entry.type === 'emergency_loan' && (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-300">
                          سلفة طوارئ
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold whitespace-nowrap">
                      <span className={entry.minutesDelta < 0 ? 'text-red-700' : 'text-emerald-700'}>
                        {entry.minutesDelta > 0 ? `+${entry.minutesDelta}` : entry.minutesDelta} د
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-500 whitespace-nowrap">{entry.balanceBefore} د</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-950 whitespace-nowrap">
                      {entry.balanceAfter} د
                    </td>
                    <td className="py-3 px-3 text-stone-600 max-w-xs truncate" title={entry.notes}>
                      {entry.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: STUDENTS DIRECTORY */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-bold text-sm sm:text-base text-emerald-950">
              دليل طلاب المقرأة ({students.length} طالب وطالبة)
            </h3>
            <span className="text-xs text-stone-500">تحديث فوري</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.map((s) => (
              <div key={s.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/40 space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                      {s.code}
                    </span>
                    <h4 className="font-bold text-sm text-stone-900 mt-1">{s.fullName}</h4>
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-sm font-black text-emerald-900">{s.balanceMinutes}</span>
                    <span className="text-[10px] text-stone-500"> دقيقة</span>
                  </div>
                </div>

                <div className="text-[11px] text-stone-600 space-y-0.5 pt-1">
                  <div>📞 {s.phone}</div>
                  <div>✈️ تيليجرام: <span className="font-mono text-sky-700">{s.telegramHandle}</span></div>
                  <div>🌍 {s.country}</div>
                  <div>⏰ {SHIFTS.find((sh) => sh.id === s.shift)?.title}</div>
                </div>

                {s.emergencyLoanDue > 0 && (
                  <div className="text-[10px] bg-amber-100 text-amber-900 p-1.5 rounded-lg border border-amber-300 font-bold">
                    سلفة طوارئ مستحقة: {s.emergencyLoanDue} دقيقة
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: VIEW RECEIPT IMAGE */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-emerald-950 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-amber-200">إشعار تحويل: {viewingReceipt.transactionRef}</h4>
                <p className="text-xs text-emerald-200">
                  {viewingReceipt.studentName} ({viewingReceipt.studentCode}) - {viewingReceipt.amountEtb} بر
                </p>
              </div>
              <button
                onClick={() => setViewingReceipt(null)}
                className="p-1 rounded-full text-stone-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto flex items-center justify-center bg-stone-100">
              <img
                src={viewingReceipt.receiptImage}
                alt="إشعار التحويل البنكي"
                className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-md"
              />
            </div>
            <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-end gap-2">
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT PAYMENT WITH REASON */}
      {rejectionModalPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-red-700">رفض إشعار التحويل البنكي</h3>
              <button onClick={() => setRejectionModalPayment(null)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              سيتم رفض طلب الشحن للطالب <strong>{rejectionModalPayment.studentName}</strong> وإرسال سبب الرفض إليه لتصحيح العملية.
            </p>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">سبب الرفض:</label>
              <textarea
                rows={3}
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectionModalPayment(null)}
                className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  rejectPayment(rejectionModalPayment.id, rejectionReasonText);
                  setRejectionModalPayment(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
