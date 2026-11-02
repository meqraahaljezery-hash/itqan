import React, { useState } from 'react';
import {
  Clock,
  CreditCard,
  AlertTriangle,
  Zap,
  BookOpen,
  Send,
  History,
  CheckCircle2,
  Copy,
  ExternalLink,
  Search,
  User,
  ShieldAlert,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentModal } from './PaymentModal';
import { PROGRAMS, SHIFTS, getTelegramGroupLink } from '../constants';
import { triggerHaptic } from '../utils/telegram';

export const StudentPortal: React.FC = () => {
  const {
    currentStudent,
    setCurrentStudent,
    getStudentByCode,
    students,
    payments,
    ledger,
    requestEmergencyLoan,
    setActiveTab,
  } = useApp();

  const [searchCode, setSearchCode] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [loanSuccessMessage, setLoanSuccessMessage] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // If no student is currently active, pick the first one or allow quick search
  const student = currentStudent || students[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    const found = getStudentByCode(searchCode.trim());
    if (found) {
      setCurrentStudent(found);
      setSearchError('');
      triggerHaptic('success');
    } else {
      setSearchError(`لم يتم العثور على طالب بالكود "${searchCode.toUpperCase()}". تأكد من كتابة الكود بشكل صحيح (مثل: IM-1001 أو IF-1001)`);
      triggerHaptic('error');
    }
  };

  const handleEmergencyLoan = () => {
    if (!student) return;
    const res = requestEmergencyLoan(student.id);
    if (res.success) {
      setLoanSuccessMessage(res.message);
      setTimeout(() => setLoanSuccessMessage(null), 4000);
    } else {
      alert(res.message);
    }
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    triggerHaptic('light');
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  if (!student) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <h3 className="text-lg font-bold text-emerald-950">لا يوجد طلاب مسجلون حالياً</h3>
        <p className="text-xs text-stone-600 mt-1 mb-4">قم بتسجيل طالب جديد للبدء في نظام الإقراء بالدقائق</p>
        <button
          onClick={() => setActiveTab('register')}
          className="px-5 py-2.5 bg-emerald-800 text-white font-bold rounded-xl text-xs"
        >
          تسجيل طالب جديد
        </button>
      </div>
    );
  }

  // Student specific data
  const studentPayments = payments.filter((p) => p.studentId === student.id);
  const studentLedger = ledger.filter((l) => l.studentId === student.id);
  const groupInfo = getTelegramGroupLink(student.gender, student.shift);
  const isLowBalance = student.balanceMinutes < 15;
  const isExhausted = student.balanceMinutes <= 5;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Code Search & Quick Switcher Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="text-[10px] text-stone-500 block">الطالب المعروض حالياً:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-emerald-950 truncate">{student.fullName}</span>
              <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                {student.code}
              </span>
            </div>
          </div>
        </div>

        {/* Search by code form */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative grow sm:w-56">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="ابحث بكودك (IM-1001)"
              className="w-full pl-3 pr-8 py-1.5 rounded-xl border border-stone-300 text-xs font-mono uppercase bg-stone-50 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              dir="ltr"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5" />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shrink-0"
          >
            بحث
          </button>
        </form>
      </div>

      {searchError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Smart Alert: Low Balance Notice */}
      {isLowBalance && (
        <div className="bg-amber-50 rounded-2xl p-4 sm:p-5 border-2 border-amber-400/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-900 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <AlertTriangle className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-amber-950">
                ⚠️ تنبيه: رصيد الدقائق منخفض ({student.balanceMinutes} دقيقة متبقية)
              </h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                رصيدك الحالي أقل من 15 دقيقة. يُرجى شحن باقة جديدة لتفادي انقطاعك عن حصص التسميع اليومية مع شيخك في حلقة البث.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isExhausted && !student.emergencyLoanUsed && (
              <button
                onClick={handleEmergencyLoan}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition active:scale-95"
              >
                <Zap className="w-4 h-4 text-amber-200" />
                <span>سلفة طوارئ (15 دقيقة)</span>
              </button>
            )}

            <button
              onClick={() => setIsPaymentOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              <span>شحن الباقة الآن</span>
            </button>
          </div>
        </div>
      )}

      {loanSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{loanSuccessMessage}</span>
        </div>
      )}

      {/* Main Student Profile & Live Balance Card */}
      <div className="bg-gradient-to-br from-[#064e3b] via-[#04382a] to-[#022c22] rounded-3xl p-5 sm:p-8 text-white shadow-xl border-2 border-amber-400/40 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 rounded-full bg-emerald-400/10 blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Info Side */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                {student.gender === 'male' ? 'طالب مقرأة' : 'طالبة مقرأة'}
              </span>
              <span className="font-mono text-xs text-emerald-200 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700/50">
                كود: {student.code}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100">
              {student.fullName}
            </h2>

            <div className="flex flex-wrap gap-2 text-xs text-emerald-200/90 pt-1">
              <span className="bg-emerald-900/50 px-3 py-1 rounded-lg border border-emerald-700/40">
                📖 {PROGRAMS.find((p) => p.id === student.program)?.title}
              </span>
              <span className="bg-emerald-900/50 px-3 py-1 rounded-lg border border-emerald-700/40">
                ⏰ {SHIFTS.find((s) => s.id === student.shift)?.title}
              </span>
              <span className="bg-emerald-900/50 px-3 py-1 rounded-lg border border-emerald-700/40">
                📍 {student.country}
              </span>
            </div>
          </div>

          {/* Balance Side */}
          <div className="bg-emerald-950/60 p-4 sm:p-5 rounded-2xl border border-amber-400/30 text-center shrink-0 md:min-w-64 flex flex-col items-center justify-center">
            <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>الرصيد الحي المتبقي</span>
            </span>

            <div className="flex items-baseline justify-center gap-1.5 my-1">
              <span className="text-4xl sm:text-5xl font-black text-amber-300 font-mono tracking-tight">
                {student.balanceMinutes}
              </span>
              <span className="text-sm font-bold text-emerald-200">دقيقة</span>
            </div>

            {student.emergencyLoanDue > 0 ? (
              <span className="text-[10px] text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-600/40 mt-1">
                سلفة طوارئ مستحقة: {student.emergencyLoanDue} دقيقة
              </span>
            ) : (
              <span className="text-[10px] text-emerald-300/80">
                رصيد دقيق متصل يُخصم بنهاية كل جلسة
              </span>
            )}

            <div className="mt-4 flex flex-wrap gap-2 w-full justify-center">
              <button
                onClick={() => setIsPaymentOpen(true)}
                className="w-full sm:w-auto grow flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-900 font-bold text-xs shadow-md transition active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>شحن باقة دقائق</span>
              </button>

              {/* Emergency Loan button if low/zero balance and not used yet */}
              {!student.emergencyLoanUsed && student.balanceMinutes <= 5 && (
                <button
                  onClick={handleEmergencyLoan}
                  className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-amber-700/60 hover:bg-amber-600 text-amber-100 font-medium text-xs border border-amber-500/40 transition active:scale-95"
                  title="سلفة 15 دقيقة لمرة واحدة لحين إتمام شحن الباقة"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>سلفة طوارئ (15 دقيقة)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Telegram Direct Group Banner Inside Card */}
        <div className="mt-6 pt-4 border-t border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-200">
            <Send className="w-4 h-4 text-sky-400 shrink-0" />
            <span>حلقة البث والتسميع المباشر: <strong>{groupInfo.groupName}</strong></span>
          </div>

          <a
            href={student.telegramGroupLink || groupInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 text-xs font-bold transition self-start sm:self-auto"
          >
            <span>دخول مجموعة البث</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Two Columns: Recent Payment Invoices & Quranic Reading History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Column 1: Payment Transfers & Status */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span>طلبات الشحن والتحويلات البنكية</span>
            </h3>
            <button
              onClick={() => setIsPaymentOpen(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
            >
              + شحن جديد
            </button>
          </div>

          {studentPayments.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-xs">
              <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-400" />
              <p>لم تقم برفع أي تحويلات بنكية بعد</p>
              <button
                onClick={() => setIsPaymentOpen(true)}
                className="mt-2 text-emerald-700 font-bold underline"
              >
                شحن باقتك الأولى الآن
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {studentPayments.map((pay) => (
                <div
                  key={pay.id}
                  className="p-3.5 rounded-2xl border border-stone-200/80 bg-stone-50/50 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-emerald-900 font-mono text-sm">
                        {pay.packageMinutes} دقيقة
                      </span>
                      <span className="text-stone-500">({pay.amountEtb} بر)</span>
                    </div>

                    <div className="text-[11px] text-stone-600 mt-1">
                      <span>البنك: {pay.bankName}</span>
                    </div>

                    <div className="text-[10px] font-mono text-stone-500 mt-0.5">
                      مرجع: {pay.transactionRef}
                    </div>

                    {pay.rejectionReason && (
                      <div className="mt-1.5 p-2 bg-red-50 text-red-700 rounded-lg text-[10px] border border-red-200">
                        سبب الرفض: {pay.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div className="text-left shrink-0">
                    {pay.status === 'pending' && (
                      <span className="inline-block px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                        قيد التدقيق والفحص
                      </span>
                    )}
                    {pay.status === 'approved' && (
                      <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                        تم الاعتماد والشحن ✓
                      </span>
                    )}
                    {pay.status === 'rejected' && (
                      <span className="inline-block px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-bold border border-red-300">
                        مرفوض ✕
                      </span>
                    )}
                    <span className="block text-[9px] text-stone-400 mt-1">
                      {new Date(pay.submittedAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Quranic Reading Sessions & Ledger */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-700" />
              <span>سجل جلسات التسميع والخصم الدقيق</span>
            </h3>
            <span className="text-[11px] text-stone-500">{studentLedger.length} عملية مسجلة</span>
          </div>

          {studentLedger.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-xs">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-400" />
              <p>لم تُسجل أي جلسات تسميع حتى الآن</p>
              <p className="text-[11px] text-stone-500 mt-1">ادخل إلى حلقة التيليجرام في موعد فترتك لبدء التسميع مع شيخك</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {studentLedger.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-2xl border border-stone-200/80 bg-stone-50/50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-stone-500">{entry.timestamp}</span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded-md text-xs ${
                        entry.minutesDelta < 0
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {entry.minutesDelta < 0 ? `خصم ${Math.abs(entry.minutesDelta)} دقيقة` : `+${entry.minutesDelta} دقيقة`}
                    </span>
                  </div>

                  {entry.notes && (
                    <div className="text-[11px] text-stone-700 font-medium">
                      📝 {entry.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-200/60">
                    <span>الرصيد السابق: {entry.balanceBefore} د</span>
                    <span>الرصيد المتبقي: <strong className="text-emerald-900">{entry.balanceAfter} د</strong></span>
                  </div>

                  {entry.messageText && (
                    <div className="pt-1">
                      <button
                        onClick={() => handleCopyMessage(entry.messageText!, entry.id)}
                        className="w-full text-right flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-[10px] text-emerald-900 font-medium hover:bg-emerald-100 transition"
                      >
                        <span className="truncate">🌿 إشعار التسميع والبركة من الشيخ...</span>
                        <span className="flex items-center gap-1 text-emerald-700 shrink-0 font-bold">
                          {copiedMsgId === entry.id ? 'تم النسخ!' : 'نسخ الرسالة'}
                          <Copy className="w-3 h-3" />
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        student={student}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />
    </div>
  );
};
