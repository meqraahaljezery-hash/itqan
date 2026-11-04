import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DailyRecitationLog } from './DailyRecitationLog';
import { ReciterSessionModal } from './ReciterSessionModal';
import { ReportExportModal } from './ReportExportModal';
import {
  ShieldCheck,
  Clock,
  CreditCard,
  History,
  Users,
  Settings,
  BookOpen,
  Printer,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  Send,
  AlertCircle,
  Award,
  MinusCircle,
  X,
  FileText,
  UserCheck,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { SUPERVISOR_EMAIL, SUPERVISOR_NAME, SHIFTS, DEFAULT_TELEGRAM_LINKS } from '../constants';
import { PaymentRequest, RegistrationRequest, StudentRecord } from '../types';
import { triggerHaptic, openTelegramShare } from '../utils/telegram';
import { GoogleAuthModal } from './GoogleAuthModal';

export const SupervisorDashboard: React.FC = () => {
  const {
    currentUser,
    switchRole,
    students,
    programs,
    setPrograms,
    packages,
    setPackages,
    paymentMethods,
    setPaymentMethods,
    readingSessions,
    auditLedger,
    paymentRequests,
    approvePaymentRequest,
    rejectPaymentRequest,
    registrationRequests,
    approveRegistrationRequest,
    rejectRegistrationRequest,
    createAnnouncement,
    giveStudentBonusMinutes,
    toggleStudentStatus,
    platformSettings,
    setPlatformSettings,
    updateTelegramLinks,
  } = useApp();

  // Navigation tab inside Dashboard
  const [activeTab, setActiveTab] = useState<
    'reciter' | 'registrations' | 'payments' | 'ledger' | 'programs' | 'packages' | 'methods' | 'settings'
  >('reciter');

  // Modals
  const [selectedStudentForSession, setSelectedStudentForSession] = useState<StudentRecord | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [viewingReceipt, setViewingReceipt] = useState<PaymentRequest | null>(null);
  const [rejectingPayment, setRejectingPayment] = useState<PaymentRequest | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('الرقم المرجعي غير متطابق مع كشف البنك');

  // Registration reject modal
  const [rejectingRegistration, setRejectingRegistration] = useState<RegistrationRequest | null>(null);
  const [regRejectReason, setRegRejectReason] = useState('نعتذر لعدم توفر مقاعد في الفترة المطلوبة حالياً');

  // Bonus minutes modal
  const [bonusStudent, setBonusStudent] = useState<StudentRecord | null>(null);
  const [bonusMinutes, setBonusMinutes] = useState<number>(15);
  const [bonusReason, setBonusReason] = useState('مكافأة إتقان وتميز في حفظ المتشابهات');

  // Announcement form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  // Search in students
  const [studentSearch, setStudentSearch] = useState('');

  // Filtering students
  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const pendingPayments = paymentRequests.filter((p) => p.status === 'pending');
  const pendingRegistrations = registrationRequests.filter((r) => r.status === 'pending');

  const handleCreateAnn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    createAnnouncement(annTitle, annContent, 'all');
    setAnnTitle('');
    setAnnContent('');
  };

  const handleBonusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bonusStudent || bonusMinutes <= 0) return;
    giveStudentBonusMinutes(bonusStudent.id, bonusMinutes, bonusReason);
    setBonusStudent(null);
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [tgLinks, setTgLinks] = useState(platformSettings.telegramLinks || DEFAULT_TELEGRAM_LINKS);

  const handleSaveTgLinks = (e: React.FormEvent) => {
    e.preventDefault();
    updateTelegramLinks(tgLinks);
  };

  const isSupervisorOrAdmin =
    currentUser.role === 'admin' ||
    currentUser.role === 'supervisor' ||
    currentUser.email.toLowerCase() === SUPERVISOR_EMAIL.toLowerCase();

  if (!isSupervisorOrAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-red-950 font-serif">
              عذراً، ليس لديك صلاحية الوصول
            </h3>
            <p className="text-stone-600 mt-2 leading-relaxed text-xs">
              لوحة الإدارة والإقراء مخصصة لفضيلة الشيخ المشرف العام والمدير فقط ({SUPERVISOR_EMAIL}).
              حسابك الحالي مسجل كـ [طالب].
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition"
            >
              تسجيل الدخول بحساب المشرف (Google)
            </button>
          </div>
        </div>
        {isAuthModalOpen && (
          <GoogleAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Top Supervisor / Admin Banner */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#064e3b] to-[#022c22] text-amber-300 flex items-center justify-center font-bold shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-emerald-950">
                {currentUser.fullName}
              </h2>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                {currentUser.role === 'admin' ? 'المدير العام (Super Admin)' : 'المقرئ والمشرف'}
              </span>
            </div>
            <p className="text-[11px] font-mono text-stone-500">{SUPERVISOR_EMAIL}</p>
          </div>
        </div>

        {/* Quick Role Switcher for previewing each perspective */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-stone-500 font-bold hidden sm:inline">تبديل الصلاحية:</span>
          <div className="flex items-center rounded-xl bg-stone-100 p-1 text-xs font-bold">
            <button
              onClick={() => switchRole('admin')}
              className={`px-3 py-1 rounded-lg transition ${
                currentUser.role === 'admin' ? 'bg-white shadow-xs text-emerald-900 font-black' : 'text-stone-500'
              }`}
            >
              المدير العام
            </button>
            <button
              onClick={() => switchRole('reciter')}
              className={`px-3 py-1 rounded-lg transition ${
                currentUser.role === 'reciter' ? 'bg-white shadow-xs text-emerald-900 font-black' : 'text-stone-500'
              }`}
            >
              المقرئ
            </button>
            <button
              onClick={() => switchRole('student')}
              className={`px-3 py-1 rounded-lg transition ${
                currentUser.role === 'student' ? 'bg-white shadow-xs text-emerald-900 font-black' : 'text-stone-500'
              }`}
            >
              الطالب
            </button>
          </div>

          {/* Export Report Button */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shadow-md transition active:scale-95"
            title="تصدير جدول سجل العمليات كملف PDF منظم"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>تصدير التقارير (PDF)</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('reciter')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'reciter' ? 'bg-emerald-900 text-white shadow-xs' : 'bg-white text-stone-700 border hover:bg-stone-50'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-300" />
          <span>لوحة المقرئ والخصم الحي</span>
        </button>

        <button
          onClick={() => setActiveTab('registrations')}
          className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'registrations' ? 'bg-emerald-900 text-white shadow-xs' : 'bg-white text-stone-700 border hover:bg-stone-50'
          }`}
        >
          <UserCheck className="w-4 h-4 text-amber-300" />
          <span>طلبات التسجيل</span>
          {pendingRegistrations.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {pendingRegistrations.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'payments' ? 'bg-emerald-900 text-white shadow-xs' : 'bg-white text-stone-700 border hover:bg-stone-50'
          }`}
        >
          <CreditCard className="w-4 h-4 text-amber-300" />
          <span>مراقبة التحويلات البنكية</span>
          {pendingPayments.length > 0 && (
            <span className="bg-amber-400 text-stone-950 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black">
              {pendingPayments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'ledger' ? 'bg-emerald-900 text-white shadow-xs' : 'bg-white text-stone-700 border hover:bg-stone-50'
          }`}
        >
          <History className="w-4 h-4 text-amber-300" />
          <span>دفتر الأستاذ (Audit Ledger)</span>
        </button>

        {currentUser.role === 'admin' && (
          <>
            <button
              onClick={() => setActiveTab('programs')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition ${
                activeTab === 'programs' ? 'bg-emerald-900 text-white shadow-xs' : 'bg-white text-stone-700 border hover:bg-stone-50'
              }`}
            >
              <span>إدارة البرامج ({programs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('packages')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition ${
                activeTab === 'packages' ? 'bg-emerald-900 text-white shadow-xs' : 'bg-white text-stone-700 border hover:bg-stone-50'
              }`}
            >
              <span>إدارة الباقات</span>
            </button>

            <button
              onClick={() => setActiveTab('methods')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition ${
                activeTab === 'methods' ? 'bg-emerald-900 text-white shadow-xs' : 'bg-white text-stone-700 border hover:bg-stone-50'
              }`}
            >
              <span>وسائل الدفع</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition ${
                activeTab === 'settings' ? 'bg-emerald-900 text-white shadow-xs' : 'bg-white text-stone-700 border hover:bg-stone-50'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>إعدادات المقرأة</span>
            </button>
          </>
        )}
      </div>

      {/* ================= TAB 1: RECITER & DAILY LOG ================= */}
      {activeTab === 'reciter' && (
        <div className="space-y-6">
          {/* Daily Recitation Log Component (المطلوب خصيصاً في التوجيهات) */}
          <DailyRecitationLog />

          {/* Quick Deduction Student Cards Grid */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-emerald-950 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-800" />
                  <span>تسجيل جلسة تسميع فورية للطلاب</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  انقر على زر «تسجيل جلسة» لاختيار السورة والآيات وخصم الدقائق المباشرة
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="ابحث بالاسم أو الكود..."
                  className="w-full pl-3 pr-8 py-1.5 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:ring-2 focus:ring-emerald-700"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredStudents.map((std) => (
                <div
                  key={std.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-[#fdfbf7] hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          {std.code}
                        </span>
                        <h4 className="font-bold text-sm text-stone-900 mt-1 truncate max-w-[180px]">
                          {std.fullName}
                        </h4>
                      </div>

                      <div className="text-left font-mono">
                        <span
                          className={`text-base font-black ${
                            std.balanceMinutes < 15 ? 'text-amber-600' : 'text-emerald-900'
                          }`}
                        >
                          {std.balanceMinutes} د
                        </span>
                        {std.balanceMinutes < 15 && (
                          <span className="text-[9px] text-amber-700 font-bold block">
                            رصيد منخفض
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-500 mt-2 space-y-0.5">
                      <div className="truncate">البرنامج: <strong className="text-stone-700">{std.programTitle}</strong></div>
                      <div>الفترة: <span className="text-stone-700">{SHIFTS.find((s) => s.id === std.shift)?.title}</span></div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-stone-200/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setBonusStudent(std)}
                      className="text-[10px] text-stone-500 hover:text-emerald-800 font-bold"
                    >
                      + مكافأة
                    </button>

                    <button
                      onClick={() => setSelectedStudentForSession(std)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs transition active:scale-95 flex items-center gap-1 shadow-2xs"
                    >
                      <MinusCircle className="w-3.5 h-3.5 text-amber-300" />
                      <span>تسجيل جلسة</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: REGISTRATION REQUESTS ================= */}
      {activeTab === 'registrations' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200/90 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-sm sm:text-base text-emerald-950 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-800" />
              <span>طلبات التسجيل الجديدة في المقرأة</span>
            </h3>
            <span className="text-xs font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
              {pendingRegistrations.length} قيد المراجعة
            </span>
          </div>

          {pendingRegistrations.length === 0 ? (
            <p className="text-stone-400 py-10 text-center text-xs">لا توجد طلبات تسجيل معلقة حالياً</p>
          ) : (
            <div className="space-y-3">
              {pendingRegistrations.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-[#fdfbf7] space-y-2 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">{req.fullName}</h4>
                      <span className="text-[11px] text-stone-500">
                        {req.country} • {req.age} سنة • {req.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setRejectingRegistration(req);
                          setRegRejectReason('نعتذر لعدم توفر مقاعد في الفترة المطلوبة حالياً');
                        }}
                        className="px-3 py-1.5 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold"
                      >
                        رفض
                      </button>

                      <button
                        onClick={() => approveRegistrationRequest(req.id)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs"
                      >
                        قبول واعتماد الطالب ✓
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-stone-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>البرنامج المطلوب: <strong className="block text-emerald-950">{req.requestedProgramTitle}</strong></div>
                    <div>مستوى الحفظ: <strong className="block text-stone-800">{req.previousHifzLevel}</strong></div>
                    <div>مستوى التلاوة: <strong className="block text-stone-800">{req.tilawaLevel}</strong></div>
                    <div>الفترة المفضلة: <strong className="block text-amber-900">{SHIFTS.find((s) => s.id === req.preferredShift)?.title}</strong></div>
                  </div>

                  {req.studentNotes && (
                    <p className="text-[11px] text-stone-600 bg-amber-50/50 p-2 rounded-lg">
                      ملاحظة الطالب: {req.studentNotes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: PAYMENTS AUDIT ================= */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200/90 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-sm sm:text-base text-emerald-950 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-600" />
              <span>مراقبة التحويلات البنكية والإيصالات</span>
            </h3>
            <span className="text-xs font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
              {pendingPayments.length} بانتظار الاعتماد
            </span>
          </div>

          {pendingPayments.length === 0 ? (
            <p className="text-stone-400 py-10 text-center text-xs">
              جميع الإيصالات والتحويلات مدققة ومعتمدة!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingPayments.map((pay) => (
                <div
                  key={pay.id}
                  className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/30 space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                        {pay.studentCode}
                      </span>
                      <h4 className="font-bold text-sm text-stone-900 mt-1">{pay.studentName}</h4>
                    </div>

                    <div className="text-left font-mono">
                      <span className="text-base font-black text-emerald-900 block">
                        {pay.packageMinutes} دقيقة
                      </span>
                      <span className="text-[11px] font-bold text-amber-800">{pay.amountEtb} بر</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1 text-[11px]">
                    <div>البنك: <strong>{pay.paymentMethodName}</strong></div>
                    <div>المرجع (Ref): <strong className="font-mono text-emerald-900 select-all">{pay.transactionRef}</strong></div>
                    <div>اسم المحول: <strong>{pay.senderName}</strong> ({pay.senderPhone})</div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => setViewingReceipt(pay)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>فحص الإيصال</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setRejectingPayment(pay);
                          setRejectReasonInput('الرقم المرجعي غير متطابق مع كشف البنك');
                        }}
                        className="px-3 py-1.5 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 font-bold text-xs"
                      >
                        رفض
                      </button>

                      <button
                        onClick={() => approvePaymentRequest(pay.id)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs"
                      >
                        اعتماد وإضافة الدقائق ✓
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: AUDIT LEDGER ================= */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200/90 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-emerald-950 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-800" />
                <span>دفتر الأستاذ الرقمي غير القابل للتعديل</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                سجل زمني دقيق لكل دقيقة تم خصمها أو شحنها لضمان النزاهة والشفافية
              </p>
            </div>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs self-start sm:self-auto"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>تصدير وطباعة PDF</span>
            </button>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b text-stone-500 bg-stone-50">
                  <th className="py-2.5 px-3">التاريخ والوقت</th>
                  <th className="py-2.5 px-3">الطالب والكود</th>
                  <th className="py-2.5 px-3">النوع</th>
                  <th className="py-2.5 px-3">المقدار</th>
                  <th className="py-2.5 px-3">الرصيد بعد</th>
                  <th className="py-2.5 px-3">الملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {auditLedger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-mono text-stone-500 text-[11px] whitespace-nowrap">
                      {entry.timestamp}
                    </td>
                    <td className="py-2 px-3 font-bold text-stone-900 whitespace-nowrap">
                      {entry.studentName} <span className="font-mono text-amber-800 font-normal">({entry.studentCode})</span>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      {entry.type === 'session_deduction' && <span className="bg-stone-100 px-2 py-0.5 rounded text-[10px]">خصم تسميع</span>}
                      {entry.type === 'package_credit' && <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">شحن باقة</span>}
                      {entry.type === 'emergency_loan' && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">سلفة طوارئ</span>}
                      {entry.type === 'bonus' && <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[10px] font-bold">مكافأة</span>}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold whitespace-nowrap">
                      <span className={entry.minutesDelta < 0 ? 'text-red-700' : 'text-emerald-700'}>
                        {entry.minutesDelta > 0 ? `+${entry.minutesDelta}` : entry.minutesDelta} د
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-emerald-950 whitespace-nowrap">
                      {entry.balanceAfter} د
                    </td>
                    <td className="py-2 px-3 text-stone-600 max-w-xs truncate">{entry.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 5: PROGRAMS MANAGEMENT ================= */}
      {activeTab === 'programs' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200/90 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-base text-emerald-950">إدارة البرامج القرآنية</h3>
              <p className="text-stone-500 mt-0.5">تعديل وإضافة مسارات الإقراء والإجازة</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {programs.map((prog) => (
              <div key={prog.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-emerald-950">{prog.title}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    {prog.badge}
                  </span>
                </div>
                <p className="text-stone-600 text-[11px] leading-relaxed">{prog.description}</p>
                <div className="text-[10px] text-stone-500 pt-1 border-t">
                  الشروط: {prog.requirements}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 6: PACKAGES MANAGEMENT ================= */}
      {activeTab === 'packages' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200/90 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-base text-emerald-950">إدارة باقات الدقائق والأسعار</h3>
              <p className="text-stone-500 mt-0.5">الباقات المتاحة للطلاب للشحن الفوري</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {packages.map((pkg) => (
              <div key={pkg.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50 text-center space-y-1">
                <span className="text-xs font-bold text-stone-800 block">{pkg.name}</span>
                <span className="text-2xl font-black text-emerald-950 font-mono block">
                  {pkg.minutes} دقيقة
                </span>
                <span className="text-sm font-bold text-amber-800 font-mono block">
                  {pkg.priceEtb} بر إثيوبي
                </span>
                <span className="text-[10px] text-stone-400 block">{pkg.tag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 7: PAYMENT METHODS ================= */}
      {activeTab === 'methods' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200/90 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-base text-emerald-950">إدارة وسائل وحسابات التحويل المعتمدة</h3>
              <p className="text-stone-500 mt-0.5">اسم المستفيد المعتمد: Kalid Ahmed Mustefa</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paymentMethods.map((m) => (
              <div key={m.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900">{m.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${m.badgeColor}`}>{m.logoText}</span>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] block">رقم الحساب أو المحفظة:</span>
                  <span className="font-mono text-base font-black text-emerald-900">{m.accountNumber}</span>
                </div>
                <div className="text-[10px] text-stone-500">{m.instructions}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 8: SETTINGS & ANNOUNCEMENTS ================= */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200/90 space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-base text-emerald-950">الإعدادات العامة وهوية المقرأة</h3>
            <p className="text-stone-500 mt-0.5">التحكم في بيانات المقرأة ونشر التنبيهات</p>
          </div>

          {/* Create Announcement Form */}
          <form onSubmit={handleCreateAnn} className="bg-[#fdfbf7] p-4 rounded-2xl border border-amber-200/80 space-y-3">
            <h4 className="font-bold text-stone-900">نشر إعلان جديد لجميع الطلاب</h4>
            <input
              type="text"
              required
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="عنوان الإعلان..."
              className="w-full p-2.5 rounded-xl border bg-white"
            />
            <textarea
              rows={2}
              required
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              placeholder="نص الإعلان القرآني..."
              className="w-full p-2.5 rounded-xl border bg-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-900 text-white rounded-xl font-bold"
            >
              نشر الإعلان الآن
            </button>
          </form>

          {/* Telegram Links Manager */}
          <div className="bg-[#fdfbf7] p-4 sm:p-5 rounded-2xl border border-sky-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-sky-100 pb-2">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-600 -rotate-12" />
                <h4 className="font-bold text-sky-950 text-sm">إدارة وتعديل روابط مجموعات التيليجرام</h4>
              </div>
              <span className="text-[10px] text-sky-700 font-semibold bg-sky-100 px-2 py-0.5 rounded-full">
                تعديل وتطبيق فوري
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              تتيح لك هذه الإعدادات إدخال الروابط الحقيقية لمجموعات البث المباشر للطلاب والطالبات. سيتم حفظ الروابط وتحديثها فوراً في استمارات الانضمام وبوابة الطالب.
            </p>

            <form onSubmit={handleSaveTgLinks} className="space-y-4">
              {/* Male Groups */}
              <div className="space-y-2">
                <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>مجموعات الطلاب (رجال):</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                    <label className="text-[10px] font-bold text-stone-700 block mb-1">
                      الفترة الصباحية (09:00 - 12:00)
                    </label>
                    <input
                      type="url"
                      required
                      value={tgLinks.maleMorningUrl}
                      onChange={(e) => setTgLinks({ ...tgLinks, maleMorningUrl: e.target.value })}
                      placeholder="https://t.me/..."
                      className="w-full p-2 rounded-lg border border-stone-300 font-mono text-[11px]"
                      dir="ltr"
                    />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                    <label className="text-[10px] font-bold text-stone-700 block mb-1">
                      الفترة المسائية (14:00 - 15:30)
                    </label>
                    <input
                      type="url"
                      required
                      value={tgLinks.maleEveningUrl}
                      onChange={(e) => setTgLinks({ ...tgLinks, maleEveningUrl: e.target.value })}
                      placeholder="https://t.me/..."
                      className="w-full p-2 rounded-lg border border-stone-300 font-mono text-[11px]"
                      dir="ltr"
                    />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                    <label className="text-[10px] font-bold text-stone-700 block mb-1">
                      الفترة الليلية (21:00 - 23:00)
                    </label>
                    <input
                      type="url"
                      required
                      value={tgLinks.maleNightUrl}
                      onChange={(e) => setTgLinks({ ...tgLinks, maleNightUrl: e.target.value })}
                      placeholder="https://t.me/..."
                      className="w-full p-2 rounded-lg border border-stone-300 font-mono text-[11px]"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Female Groups */}
              <div className="space-y-2 pt-2 border-t border-sky-100">
                <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>مجموعات الطالبات (نساء):</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                    <label className="text-[10px] font-bold text-stone-700 block mb-1">
                      الفترة الصباحية (09:00 - 12:00)
                    </label>
                    <input
                      type="url"
                      required
                      value={tgLinks.femaleMorningUrl}
                      onChange={(e) => setTgLinks({ ...tgLinks, femaleMorningUrl: e.target.value })}
                      placeholder="https://t.me/..."
                      className="w-full p-2 rounded-lg border border-stone-300 font-mono text-[11px]"
                      dir="ltr"
                    />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                    <label className="text-[10px] font-bold text-stone-700 block mb-1">
                      الفترة المسائية (14:00 - 15:30)
                    </label>
                    <input
                      type="url"
                      required
                      value={tgLinks.femaleEveningUrl}
                      onChange={(e) => setTgLinks({ ...tgLinks, femaleEveningUrl: e.target.value })}
                      placeholder="https://t.me/..."
                      className="w-full p-2 rounded-lg border border-stone-300 font-mono text-[11px]"
                      dir="ltr"
                    />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                    <label className="text-[10px] font-bold text-stone-700 block mb-1">
                      الفترة الليلية (21:00 - 23:00)
                    </label>
                    <input
                      type="url"
                      required
                      value={tgLinks.femaleNightUrl}
                      onChange={(e) => setTgLinks({ ...tgLinks, femaleNightUrl: e.target.value })}
                      placeholder="https://t.me/..."
                      className="w-full p-2 rounded-lg border border-stone-300 font-mono text-[11px]"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Channel and Direct Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-sky-100">
                <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                  <label className="text-[10px] font-bold text-stone-700 block mb-1">
                    قناة الإعلانات الرسمية للمقرأة
                  </label>
                  <input
                    type="url"
                    required
                    value={tgLinks.announcementsChannelUrl}
                    onChange={(e) => setTgLinks({ ...tgLinks, announcementsChannelUrl: e.target.value })}
                    placeholder="https://t.me/..."
                    className="w-full p-2 rounded-lg border border-stone-300 font-mono text-[11px]"
                    dir="ltr"
                  />
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                  <label className="text-[10px] font-bold text-stone-700 block mb-1">
                    رابط التواصل المباشر مع فضيلة المشرف
                  </label>
                  <input
                    type="url"
                    required
                    value={tgLinks.supervisorDirectContact}
                    onChange={(e) => setTgLinks({ ...tgLinks, supervisorDirectContact: e.target.value })}
                    placeholder="https://t.me/..."
                    className="w-full p-2 rounded-lg border border-stone-300 font-mono text-[11px]"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ وتحديث روابط التيليجرام</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECITER SESSION RECORDING */}
      {selectedStudentForSession && (
        <ReciterSessionModal
          student={selectedStudentForSession}
          isOpen={!!selectedStudentForSession}
          onClose={() => setSelectedStudentForSession(null)}
        />
      )}

      {/* MODAL: REPORT PDF EXPORT */}
      <ReportExportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* MODAL: VIEW RECEIPT */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-emerald-950 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm text-amber-200">إشعار التحويل: {viewingReceipt.transactionRef}</h4>
              <button onClick={() => setViewingReceipt(null)}>
                <X className="w-5 h-5 text-stone-300" />
              </button>
            </div>
            <div className="p-4 bg-stone-100 flex items-center justify-center max-h-[60vh] overflow-y-auto">
              <img src={viewingReceipt.receiptImage} alt="Receipt" className="max-h-[50vh] rounded-xl object-contain shadow" />
            </div>
            <div className="p-3 bg-stone-50 border-t flex justify-end">
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 rounded-xl bg-stone-200 font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT PAYMENT */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-xs text-right">
            <h3 className="font-bold text-sm text-red-700">رفض إشعار التحويل البنكي</h3>
            <textarea
              rows={3}
              value={rejectReasonInput}
              onChange={(e) => setRejectReasonInput(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRejectingPayment(null)} className="px-3 py-2 border rounded-xl">إلغاء</button>
              <button
                onClick={() => {
                  rejectPaymentRequest(rejectingPayment.id, rejectReasonInput);
                  setRejectingPayment(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BONUS MINUTES */}
      {bonusStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#fdfbf7] rounded-3xl p-6 shadow-2xl space-y-4 text-xs text-right">
            <h3 className="font-bold text-sm text-emerald-950">منح دقائق مكافأة للطالب {bonusStudent.fullName}</h3>
            <form onSubmit={handleBonusSubmit} className="space-y-3">
              <div>
                <label className="block font-bold mb-1">عدد الدقائق الممنوحة</label>
                <input
                  type="number"
                  min="5"
                  value={bonusMinutes}
                  onChange={(e) => setBonusMinutes(parseInt(e.target.value, 10) || 5)}
                  className="w-full p-2.5 rounded-xl border bg-white font-mono font-bold text-center"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">سبب المكافأة</label>
                <input
                  type="text"
                  value={bonusReason}
                  onChange={(e) => setBonusReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setBonusStudent(null)} className="px-3 py-2 border rounded-xl">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-emerald-900 text-white rounded-xl font-bold">منح المكافأة الآن</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
