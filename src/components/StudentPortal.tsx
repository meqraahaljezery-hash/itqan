import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  CreditCard,
  User,
  Home,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronLeft,
  Search,
  Sparkles,
  Info,
  Calendar,
  Send,
  HelpCircle,
  FileCheck,
  ShieldCheck,
  Building2,
  Upload,
  X,
  Bell,
  LogOut,
  Trash2,
  Lock,
} from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { ChatModal } from './ChatModal';
import { GoogleAuthModal } from './GoogleAuthModal';
import { getTelegramGroupLink, SHIFTS, SUPERVISOR_NAME, ACADEMY_NAME, SUPERVISOR_EMAIL } from '../constants';
import { triggerHaptic } from '../utils/telegram';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from '../utils/notifications';

interface StudentPortalProps {
  onGoToRegister?: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ onGoToRegister }) => {
  const {
    students,
    currentStudent,
    setCurrentStudent,
    packages,
    paymentMethods,
    readingSessions,
    auditLedger,
    announcements,
    paymentRequests,
    requestEmergencyLoan,
    submitRegistrationRequest,
    programs,
    platformSettings,
    currentUser,
    setCurrentUser,
    deleteStudentAccount,
  } = useApp();

  // Bottom Navigation tabs: 'home' | 'packages' | 'profile'
  const [activeTab, setActiveTab] = useState<'home' | 'packages' | 'profile'>('home');

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showProgramEnrollModal, setShowProgramEnrollModal] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [notificationState, setNotificationState] = useState<NotificationPermission>(
    getNotificationPermission()
  );

  const handleToggleNotifications = async () => {
    triggerHaptic('light');
    const granted = await requestNotificationPermission();
    setNotificationState(granted ? 'granted' : 'denied');
  };

  const handleLogout = () => {
    triggerHaptic('light');
    setCurrentStudent(null);
  };

  const handleDeleteAccount = () => {
    if (!student) return;
    if (deleteConfirmText.trim() !== 'حذف' && deleteConfirmText.trim() !== student.code) {
      setDeleteError(`يُرجى كتابة كلمة "حذف" أو كودك الأكاديمي (${student.code}) للتأكيد`);
      return;
    }
    triggerHaptic('warning');
    deleteStudentAccount(student.id);
    setIsDeleteModalOpen(false);
  };

  // Student search
  const [searchCodeInput, setSearchCodeInput] = useState('');
  const [searchError, setSearchError] = useState('');

  // Selected student (fallback to first or null)
  const student = currentStudent || (students.length > 0 ? students[0] : null);

  // Program Enrollment Form state
  const [enrollAge, setEnrollAge] = useState(25);
  const [enrollPrevHifz, setEnrollPrevHifz] = useState<'less_than_5' | 'less_than_10' | 'less_than_20' | 'full_quran'>('less_than_10');
  const [enrollTilawa, setEnrollTilawa] = useState<'beginner' | 'intermediate' | 'advanced' | 'needs_correction' | 'fluent'>('intermediate');
  const [enrollMadrasa, setEnrollMadrasa] = useState('');
  const [enrollSheikh, setEnrollSheikh] = useState('');
  const [enrollProgId, setEnrollProgId] = useState(programs[0]?.id || 'prog-talqeen');
  const [enrollShift, setEnrollShift] = useState<'morning' | 'evening' | 'night'>('morning');
  const [enrollNotes, setEnrollNotes] = useState('');

  const handleSearchCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCodeInput.trim()) return;

    const query = searchCodeInput.trim().toUpperCase();
    const found = students.find((s) => s.code.toUpperCase() === query);
    if (found) {
      setCurrentStudent(found);
      setSearchError('');
      triggerHaptic('success');
    } else {
      setSearchError(`لم يتم العثور على طالب بالكود "${query}". تأكد من كتابة الكود بشكل صحيح.`);
      triggerHaptic('error');
    }
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    const selectedProg = programs.find((p) => p.id === enrollProgId) || programs[0];

    submitRegistrationRequest({
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
      country: student.country,
      city: student.city || 'المدينة',
      age: enrollAge,
      gender: student.gender,
      previousHifzLevel: enrollPrevHifz,
      tilawaLevel: enrollTilawa,
      previousMadrasa: enrollMadrasa,
      previousSheikh: enrollSheikh,
      requestedProgramId: selectedProg.id,
      requestedProgramTitle: selectedProg.title,
      preferredShift: enrollShift,
      studentNotes: enrollNotes,
    });

    setShowProgramEnrollModal(false);
  };

  if (!student) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center text-xs space-y-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/90 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#064e3b] to-[#022c22] text-amber-300 flex items-center justify-center mx-auto shadow-md">
            <BookOpen className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-emerald-950 font-serif">
              مرحباً بك في {ACADEMY_NAME}
            </h3>
            <p className="text-stone-500 mt-1 leading-relaxed text-xs">
              بوابة الطالب الرسمية لحساب الدقائق ومتابعة الحلقات والإجازة بالسند المتصل.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onGoToRegister}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95"
            >
              + تسجيل طالب جديد وتوليد الكود الآن
            </button>
          </div>

          <div className="pt-4 border-t border-stone-100 space-y-2">
            <span className="text-[11px] font-bold text-stone-600 block">
              هل أنت مسجل مسبقاً؟ ابحث بكودك الأكاديمي:
            </span>
            <form onSubmit={handleSearchCode} className="flex gap-2">
              <input
                type="text"
                value={searchCodeInput}
                onChange={(e) => setSearchCodeInput(e.target.value)}
                placeholder="أدخل كودك (مثال: IM-1001)"
                className="flex-1 px-3 py-2 rounded-xl border border-stone-300 font-mono text-xs uppercase bg-stone-50 text-center"
                dir="ltr"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-xl text-xs"
              >
                دخول
              </button>
            </form>
            {searchError && (
              <p className="text-red-600 text-[10px] mt-1">{searchError}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Filter student data
  const studentSessions = readingSessions.filter((s) => s.studentId === student.id);
  const studentLedger = auditLedger.filter((l) => l.studentId === student.id);
  const studentPayments = paymentRequests.filter((p) => p.studentId === student.id);
  const groupInfo = getTelegramGroupLink(student.gender, student.shift);
  const isLowBalance = student.balanceMinutes < (platformSettings.lowBalanceThreshold || 15);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-4 pb-24 space-y-5">
      
      {/* Student Top Header Card (المحدد في القسم الثامن من البرومبت) */}
      <div className="bg-gradient-to-br from-[#064e3b] via-[#04382a] to-[#022c22] rounded-3xl p-5 sm:p-7 text-white shadow-xl border-2 border-amber-400/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Student Info */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-black bg-amber-400 text-stone-950 px-2.5 py-0.5 rounded-lg shadow-2xs">
                {student.code}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-900/80 text-emerald-200 border border-emerald-700/60">
                {student.status === 'active' ? 'حساب نشط ✓' : 'مجمد'}
              </span>
              <span className="text-[11px] text-emerald-200/90 font-mono">
                {SHIFTS.find((s) => s.id === student.shift)?.title}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100">
              {student.fullName}
            </h2>

            <div className="text-xs text-emerald-200/90">
              البرنامج: <strong className="text-white">{student.programTitle}</strong>
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
              <a
                href={student.telegramGroupLink || groupInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 font-bold transition text-xs"
              >
                <Send className="w-3.5 h-3.5 -rotate-12 text-sky-400" />
                <span>دخول حلقة البث المباشر</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => setIsChatOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-600/50 text-xs font-medium transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                <span>مراسلة المشرف</span>
              </button>
            </div>
          </div>

          {/* Prominent Live Minute Balance Card */}
          <div className="bg-emerald-950/70 p-4 sm:p-5 rounded-2xl border border-amber-400/30 text-center shrink-0 md:min-w-60 flex flex-col items-center justify-center">
            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>رصيد الدقائق المتبقي</span>
            </span>

            <div className="flex items-baseline justify-center gap-1.5 my-1">
              <span className="text-4xl sm:text-5xl font-black text-amber-300 font-mono tracking-tight">
                {student.balanceMinutes}
              </span>
              <span className="text-xs font-bold text-emerald-200">دقيقة</span>
            </div>

            {student.emergencyLoanDue > 0 ? (
              <span className="text-[10px] text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-600/40">
                سلفة طوارئ مستحقة: {student.emergencyLoanDue} دقيقة
              </span>
            ) : (
              <span className="text-[10px] text-emerald-300/80">
                رصيد حي يُخصم فورياً عند كل تسميع
              </span>
            )}

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>شحن باقة دقائق</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Switcher Bar */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-stone-200/80 flex items-center justify-between gap-3 text-xs">
        <span className="text-stone-500 hidden sm:inline">تبديل حساب الطالب بواسطة الكود:</span>
        <form onSubmit={handleSearchCode} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchCodeInput}
            onChange={(e) => setSearchCodeInput(e.target.value)}
            placeholder="أدخل كود الطالب (مثال: IM-1002)"
            className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-mono uppercase bg-stone-50 grow sm:w-56"
            dir="ltr"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-800 text-white font-bold text-xs shrink-0 hover:bg-emerald-900"
          >
            عرض
          </button>
        </form>
      </div>

      {searchError && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
          {searchError}
        </div>
      )}

      {/* Smart Alert: Low Balance & Emergency Loan */}
      {isLowBalance && (
        <div className="bg-amber-50 rounded-2xl p-4 sm:p-5 border-2 border-amber-400 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-900 flex items-center justify-center shrink-0 shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-950">
                ⚠️ رصيدك الحالي أقل من 15 دقيقة ({student.balanceMinutes} دقيقة)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                يُرجى شحن باقة لتفادي توقف ورْد التسميع اليومي في حلقة البث المباشر مع شيخك.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {student.balanceMinutes <= 5 && !student.emergencyLoanUsed && (
              <button
                onClick={() => requestEmergencyLoan(student.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-200" />
                <span>سلفة طوارئ (15 دقيقة)</span>
              </button>
            )}

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>شحن الآن</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= SECTION CONTENT BASED ON BOTTOM TAB ================= */}

      {/* TAB 1: HOME (الرئيسية) */}
      {activeTab === 'home' && (
        <div className="space-y-5">
          {/* Announcements & Alerts Section */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200/80 space-y-3">
            <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>إعلانات وتنبيهات المقرأة</span>
            </h3>

            <div className="space-y-2.5">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/70 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950">{ann.title}</span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {new Date(ann.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <p className="text-stone-700 leading-relaxed text-[11px]">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Student Guide (دليل الطالب) */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200/80 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2 border-b border-stone-100 pb-2">
              <HelpCircle className="w-4 h-4 text-emerald-700" />
              <span>دليل الطالب للاستفادة الكاملة من المقرأة</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-700">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="font-bold text-emerald-950 block">١. كيفية التسجيل في البرامج:</span>
                <p className="text-[11px] leading-relaxed">
                  يمكنك التقدم للالتحاق ببرنامج الإجازة أو الحفظ أو التلقين من زر «طلب التحاق ببرنامج» أدناه.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="font-bold text-emerald-950 block">٢. كيفية شحن باقات الدقائق:</span>
                <p className="text-[11px] leading-relaxed">
                  حول المبلغ لحساب الشيخ (CBE، BOA، Telebirr، M-Pesa)، ثم ارفع الإيصال والرقم المرجعي للاعتماد الفوري.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="font-bold text-emerald-950 block">٣. متابعة رصيد الدقائق:</span>
                <p className="text-[11px] leading-relaxed">
                  يُخصم عدد الدقائق الفعلية التي قرأت بها في بث التيليجرام فور انتهاء جلستك ويوثق في سجل دقيق.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="font-bold text-emerald-950 block">٤. التواصل مع المشرف:</span>
                <p className="text-[11px] leading-relaxed">
                  استخدم زر «مراسلة المشرف» لطرح أي استفسار تجويدي أو تنسيق موعد خاص للتسميع.
                </p>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={() => setShowProgramEnrollModal(true)}
                className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 text-xs transition"
              >
                + تقديم طلب التحاق ببرنامج جديد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PACKAGES (الباقات) */}
      {activeTab === 'packages' && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-emerald-950 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-800" />
                <span>باقات الدقائق القرآنية المتاحة للشحن</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                اختر الباقة المناسبة وقم بالتحويل عبر أحد الحسابات المعتمدة لإضافة الدقائق فوراً
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`p-4 rounded-2xl border-2 transition-all relative flex flex-col justify-between ${
                    pkg.popular
                      ? 'border-amber-400 bg-amber-50/40 shadow-sm'
                      : 'border-stone-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2.5 left-4 bg-amber-500 text-stone-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-2xs">
                      الأكثر طلباً
                    </span>
                  )}

                  <div>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="font-black text-xl text-emerald-950 font-mono">
                        {pkg.minutes} دقيقة
                      </span>
                      <span className="font-bold text-amber-800 text-base font-mono">
                        {pkg.priceEtb} بر إثيوبي
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-stone-900">{pkg.name}</h4>
                    {pkg.description && (
                      <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                        {pkg.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800">{pkg.tag || 'باقة معتمدة'}</span>
                    <button
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs transition active:scale-95 shadow-2xs"
                    >
                      شحن الباقة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods quick copy cards */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200/80 space-y-3 text-xs">
            <h4 className="font-bold text-emerald-950 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-800" />
              <span>الحسابات البنكية المعتمدة للتحويل (اسم المستفيد: Kalid Ahmed Mustefa)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paymentMethods.map((m) => (
                <div key={m.id} className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800">{m.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${m.badgeColor}`}>
                      {m.logoText}
                    </span>
                  </div>
                  <div className="font-mono text-sm font-black text-emerald-900 select-all tracking-wider">
                    {m.accountNumber}
                  </div>
                  <div className="text-[10px] text-stone-500">{m.instructions}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Payment History */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200/80 space-y-3 text-xs">
            <h4 className="font-bold text-emerald-950 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-800" />
              <span>طلبات التحويل والشحن الخاصة بك</span>
            </h4>

            {studentPayments.length === 0 ? (
              <p className="text-stone-400 py-4 text-center">لم ترفع أي إشعارات دفع بعد</p>
            ) : (
              <div className="space-y-2">
                {studentPayments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-stone-900">
                        {p.packageName} ({p.packageMinutes} دقيقة) - {p.amountEtb} بر
                      </div>
                      <div className="text-[10px] font-mono text-stone-500 mt-0.5">
                        مرجع: {p.transactionRef} • {p.paymentMethodName}
                      </div>
                      {p.rejectionReason && (
                        <div className="text-[10px] text-red-700 bg-red-50 p-1 rounded mt-1">
                          سبب الرفض: {p.rejectionReason}
                        </div>
                      )}
                    </div>

                    <div className="text-left font-bold text-[10px]">
                      {p.status === 'pending' && <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">قيد الفحص</span>}
                      {p.status === 'approved' && <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">معتمد ✓</span>}
                      {p.status === 'rejected' && <span className="text-red-800 bg-red-100 px-2 py-0.5 rounded-full">مرفوض ✕</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PROFILE (حسابي) */}
      {activeTab === 'profile' && (
        <div className="space-y-5">
          {/* Profile details */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2 border-b border-stone-100 pb-2">
              <User className="w-4 h-4 text-emerald-700" />
              <span>البيانات الأكاديمية والشخصية للطالب</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-700">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-400 text-[10px] block">الاسم الكامل:</span>
                <span className="font-bold text-stone-900 text-sm">{student.fullName}</span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-400 text-[10px] block">الكود الأكاديمي:</span>
                <span className="font-mono font-black text-amber-800 text-sm">{student.code}</span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-400 text-[10px] block">رقم الهاتف / الواتساب:</span>
                <span className="font-mono font-bold text-stone-900" dir="ltr">{student.phone}</span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-400 text-[10px] block">بلد الإقامة:</span>
                <span className="font-bold text-stone-900">{student.country}</span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-400 text-[10px] block">الفترة والموعد:</span>
                <span className="font-bold text-stone-900">{SHIFTS.find((s) => s.id === student.shift)?.title}</span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-400 text-[10px] block">حالة الحساب:</span>
                <span className="font-bold text-emerald-800">{student.status === 'active' ? 'نشط ومسجل' : 'مجمد'}</span>
              </div>
            </div>
          </div>

          {/* Student Complete Minute Ledger History */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200/80 space-y-3 text-xs">
            <h3 className="font-bold text-sm text-emerald-950 flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>سجل الدقائق والعمليات التاريخي</span>
              </span>
              <span className="text-stone-500 font-mono text-[11px]">{studentLedger.length} حركة</span>
            </h3>

            {studentLedger.length === 0 ? (
              <p className="text-stone-400 py-6 text-center">لا توجد حركات رصيد مسجلة حتى الآن</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {studentLedger.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-stone-400">{entry.timestamp}</span>
                        <span className="font-bold text-stone-900">
                          {entry.type === 'session_deduction' && 'جلسة تسميع'}
                          {entry.type === 'package_credit' && 'شحن باقة'}
                          {entry.type === 'emergency_loan' && 'سلفة طوارئ'}
                          {entry.type === 'bonus' && 'مكافأة'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5">{entry.notes}</p>
                      <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                        الرصيد قبل: {entry.balanceBefore} د | بعد: {entry.balanceAfter} د
                      </div>
                    </div>

                    <span
                      className={`font-mono font-black text-xs px-2 py-0.5 rounded-lg shrink-0 ${
                        entry.minutesDelta < 0
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {entry.minutesDelta > 0 ? `+${entry.minutesDelta}` : entry.minutesDelta} د
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Linked Google Account & Permissions */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200/80 space-y-3 text-xs">
            <h3 className="font-bold text-sm text-emerald-950 flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>حساب Google والصلاحيات الأمنية</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                {currentUser.role === 'admin' ? 'مشرف عام' : 'طالب معتمد'}
              </span>
            </h3>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-stone-900 text-xs">
                  {currentUser.email || student.email || 'حساب الطالب'}
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">
                  {currentUser.role === 'admin'
                    ? 'لك صلاحيات الإدارة الكاملة وتعديل المنصة'
                    : 'صلاحية: طالب (لا يُسمح بدخول لوحة الإدارة)'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 font-bold text-[11px] text-stone-700 transition"
              >
                تبديل الحساب
              </button>
            </div>
          </div>

          {/* Android Notification Panel Settings */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200/80 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-sm text-emerald-950">إشعارات الأندرويد في شريط الإشعارات</h3>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  notificationState === 'granted'
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {notificationState === 'granted' ? 'مفعلة' : 'غير مفعلة'}
              </span>
            </div>

            <p className="text-[11px] text-stone-600 leading-relaxed">
              تصلك تنبيهات فورية في شاشة هاتفك الأندرويد تماماً كرسائل شركات الاتصالات: إشعار خصم دقائق الجلسة، تنبيه اقتراب نفاد الرصيد، وتذكير موعد حلقتك.
            </p>

            <button
              type="button"
              onClick={handleToggleNotifications}
              className={`w-full py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-98 ${
                notificationState === 'granted'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-emerald-900 hover:bg-emerald-800 text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>
                {notificationState === 'granted'
                  ? 'إشعارات الأندرويد مفعلة وتعمل بنجاح في هاتفك ✅'
                  : 'تفعيل إشعارات الجوال (Notification Panel) الآن'}
              </span>
            </button>
          </div>

          {/* Account Settings & Danger Zone */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200/80 space-y-3 text-xs">
            <h3 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">
              إعدادات الحساب والجلسة
            </h3>

            <div className="space-y-2 pt-1">
              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 font-bold text-stone-700 flex items-center justify-center gap-2 transition"
              >
                <LogOut className="w-4 h-4 text-stone-500" />
                <span>تسجيل الخروج من الحساب</span>
              </button>

              {/* Delete Account Button */}
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-red-200 bg-red-50/60 hover:bg-red-100/80 font-bold text-red-700 flex items-center justify-center gap-2 transition"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>حذف حسابي نهائياً (مع التأكيد المشدد)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FIXED MOBILE BOTTOM NAVIGATION BAR ================= */}
      {/* 3 Sections: Packages, Home, Profile as strictly mandated in prompt */}
      <nav
        dir="rtl"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg py-2 px-6 flex items-center justify-around max-w-lg mx-auto rounded-t-2xl sm:hidden"
      >
        <button
          onClick={() => setActiveTab('packages')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'packages' ? 'text-emerald-900 font-black' : 'text-stone-400'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px]">الباقات</span>
        </button>

        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'home' ? 'text-emerald-900 font-black' : 'text-stone-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">الرئيسية</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'profile' ? 'text-emerald-900 font-black' : 'text-stone-400'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">حسابي</span>
        </button>
      </nav>

      {/* Desktop Tab Switcher */}
      <div className="hidden sm:flex items-center justify-center gap-3 pt-3">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'home' ? 'bg-emerald-900 text-white shadow-xs' : 'bg-white text-stone-700 border'
          }`}
        >
          الصفحة الرئيسية
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'packages' ? 'bg-emerald-900 text-white shadow-xs' : 'bg-white text-stone-700 border'
          }`}
        >
          باقات الدقائق والشحن
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'profile' ? 'bg-emerald-900 text-white shadow-xs' : 'bg-white text-stone-700 border'
          }`}
        >
          حسابي وسجل الدقائق
        </button>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        student={student as any}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      {/* Chat Modal */}
      <ChatModal
        recipientId="rec-1"
        recipientName={SUPERVISOR_NAME}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Modal: Enroll in New Program */}
      {showProgramEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-[#fdfbf7] rounded-3xl p-6 shadow-2xl border border-stone-200 text-xs text-right space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-emerald-950">طلب تسجيل في برنامج قرآني جديد</h3>
              <button onClick={() => setShowProgramEnrollModal(false)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-3">
              <div>
                <label className="block font-bold mb-1">البرنامج المطلوب</label>
                <select
                  value={enrollProgId}
                  onChange={(e) => setEnrollProgId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-white"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">مستوى الحفظ السابق</label>
                  <select
                    value={enrollPrevHifz}
                    onChange={(e) => setEnrollPrevHifz(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border bg-white"
                  >
                    <option value="less_than_5">أقل من 5 أجزاء</option>
                    <option value="less_than_10">أقل من 10 أجزاء</option>
                    <option value="less_than_20">أقل من 20 جزءاً</option>
                    <option value="full_quran">حفظ القرآن كاملاً</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">مستوى التلاوة</label>
                  <select
                    value={enrollTilawa}
                    onChange={(e) => setEnrollTilawa(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border bg-white"
                  >
                    <option value="beginner">مبتدئ</option>
                    <option value="intermediate">متوسط</option>
                    <option value="advanced">متقدم</option>
                    <option value="needs_correction">يحتاج تصحيح</option>
                    <option value="fluent">متقن</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">المدرسة القرآنية السابقة</label>
                  <input
                    type="text"
                    value={enrollMadrasa}
                    onChange={(e) => setEnrollMadrasa(e.target.value)}
                    placeholder="إن وجدت..."
                    className="w-full p-2.5 rounded-xl border bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">اسم المعلم السابق</label>
                  <input
                    type="text"
                    value={enrollSheikh}
                    onChange={(e) => setEnrollSheikh(e.target.value)}
                    placeholder="إن وجد..."
                    className="w-full p-2.5 rounded-xl border bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">الفترة المناسبة</label>
                <select
                  value={enrollShift}
                  onChange={(e) => setEnrollShift(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border bg-white"
                >
                  <option value="morning">الفترة الصباحية (09:00 - 12:00)</option>
                  <option value="evening">الفترة المسائية (14:00 - 15:30)</option>
                  <option value="night">الفترة الليلية (21:00 - 23:00)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProgramEnrollModal(false)}
                  className="px-3 py-2 border rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-900 text-white rounded-xl font-bold"
                >
                  إرسال الطلب للمشرف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE ACCOUNT CONFIRMATION */}
      {isDeleteModalOpen && student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-red-200 text-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base text-red-950 font-serif">
                تأكيد حذف الحساب نهائياً
              </h3>
              <p className="text-stone-600 mt-1 leading-relaxed text-xs">
                تحذير: سيتم مسح حسابك ({student.fullName}) وكودك ({student.code}) وجميع سجلات التسميع ورصيد الدقائق نهائياً من قاعدة البيانات ولا يمكن استرجاعها أبداً.
              </p>
            </div>

            {deleteError && (
              <p className="p-2.5 rounded-xl bg-red-50 text-red-700 text-[11px] font-bold text-center border border-red-200">
                {deleteError}
              </p>
            )}

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                للتأكيد، اكتب كلمة <strong className="text-red-700">«حذف»</strong> أو كودك الأكاديمي <strong className="font-mono text-red-700">({student.code})</strong>:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => {
                  setDeleteConfirmText(e.target.value);
                  setDeleteError('');
                }}
                placeholder="اكتب هنا..."
                className="w-full p-2.5 rounded-xl border border-stone-300 text-center font-bold text-sm bg-stone-50"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmText('');
                  setDeleteError('');
                }}
                className="w-1/2 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50 transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="w-1/2 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold shadow-md transition active:scale-95"
              >
                تأكيد الحذف النهائي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GOOGLE AUTH */}
      {isAuthModalOpen && (
        <GoogleAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </div>
  );
};
