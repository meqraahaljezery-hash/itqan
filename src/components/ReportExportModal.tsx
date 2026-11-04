import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Printer,
  Download,
  X,
  FileSpreadsheet,
  BookOpen,
  Calendar,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { ACADEMY_NAME, ACADEMY_ENGLISH_NAME, SUPERVISOR_NAME } from '../constants';
import { triggerHaptic } from '../utils/telegram';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({ isOpen, onClose }) => {
  const { auditLedger, students, platformSettings, currentUser } = useApp();
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Compute metrics
  const totalDeductions = auditLedger
    .filter((e) => e.minutesDelta < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.minutesDelta), 0);

  const totalCredits = auditLedger
    .filter((e) => e.minutesDelta > 0)
    .reduce((acc, curr) => acc + curr.minutesDelta, 0);

  // Trigger browser print for PDF export
  const handlePrint = () => {
    triggerHaptic('success');
    window.print();
  };

  // Export as CSV
  const handleExportCSV = () => {
    triggerHaptic('light');
    const headers = ['التاريخ والوقت', 'كود الطالب', 'اسم الطالب', 'نوع الحركة', 'الدقائق', 'الرصيد السابق', 'الرصيد بعد', 'المنفذ', 'الملاحظات'];
    const rows = auditLedger.map((e) => [
      `"${e.timestamp}"`,
      `"${e.studentCode}"`,
      `"${e.studentName.replace(/"/g, '""')}"`,
      `"${e.type}"`,
      e.minutesDelta,
      e.balanceBefore,
      e.balanceAfter,
      `"${e.performerName}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_مقرأة_الجزري_دفتر_الأستاذ_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const todayStr = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Controls Bar */}
        <div className="bg-[#022c22] p-4 text-white flex items-center justify-between border-b border-emerald-900/60 shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-sm sm:text-base text-amber-200">
                تصدير تقرير دفتر الأستاذ وحركات الدقائق (PDF)
              </h3>
              <p className="text-[11px] text-emerald-200/80">
                جاهز للطباعة المباشرة، الحفظ كـ PDF، أو التصدير لملف إكسل
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-white text-xs font-bold border border-emerald-700/60 transition"
              title="تصدير كملف CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">تصدير CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black shadow-md transition active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة / حفظ PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-emerald-900 text-stone-300 hover:text-white transition"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Preview */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-stone-100/60 font-sans">
          <div
            ref={printAreaRef}
            className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-stone-200 mx-auto max-w-3xl space-y-6 text-stone-900"
          >
            {/* Report Header */}
            <div className="border-b-2 border-emerald-900 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
              <div>
                <span className="text-[11px] text-stone-500 font-serif">بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ</span>
                <h1 className="text-xl sm:text-2xl font-black text-emerald-950 font-serif mt-0.5">
                  {ACADEMY_NAME}
                </h1>
                <p className="text-[10px] text-stone-500 font-mono tracking-wider">
                  {ACADEMY_ENGLISH_NAME}
                </p>
                <div className="text-xs text-amber-900 font-bold mt-1">
                  سجل دفتر الأستاذ المالي والتعليمي المعتمد (Official Audit Ledger)
                </div>
              </div>

              <div className="text-center sm:text-left text-xs text-stone-600 space-y-1">
                <div>تاريخ التقرير: <strong className="font-mono">{todayStr}</strong></div>
                <div>المصدر: <span className="font-semibold">{currentUser.fullName}</span></div>
                <div className="font-mono text-[10px] text-stone-400">REF: JEZERY-REP-{Date.now().toString().slice(-6)}</div>
              </div>
            </div>

            {/* Metrics summary */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-500 text-[10px] block">إجمالي حركات السجل</span>
                <span className="text-lg font-black text-emerald-950 font-mono">{auditLedger.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900">
                <span className="text-stone-500 text-[10px] block">إجمالي الدقائق المخصومة (التسميع)</span>
                <span className="text-lg font-black font-mono">{totalDeductions} دقيقة</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <span className="text-stone-500 text-[10px] block">إجمالي الدقائق المشحونة</span>
                <span className="text-lg font-black font-mono">{totalCredits} دقيقة</span>
              </div>
            </div>

            {/* Main Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border border-stone-200">
                <thead>
                  <tr className="bg-emerald-950 text-white font-bold text-[11px]">
                    <th className="py-2.5 px-2.5 border">التاريخ</th>
                    <th className="py-2.5 px-2.5 border">كود الطالب</th>
                    <th className="py-2.5 px-2.5 border">اسم الطالب</th>
                    <th className="py-2.5 px-2.5 border">نوع الحركة</th>
                    <th className="py-2.5 px-2.5 border">المقدار</th>
                    <th className="py-2.5 px-2.5 border">الرصيد المتبقي</th>
                    <th className="py-2.5 px-2.5 border">الملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-[11px]">
                  {auditLedger.map((entry) => (
                    <tr key={entry.id} className="hover:bg-stone-50">
                      <td className="py-2 px-2.5 font-mono text-[10px] whitespace-nowrap border">
                        {entry.timestamp}
                      </td>
                      <td className="py-2 px-2.5 font-mono font-bold text-amber-900 border">
                        {entry.studentCode}
                      </td>
                      <td className="py-2 px-2.5 font-bold text-stone-900 border">
                        {entry.studentName}
                      </td>
                      <td className="py-2 px-2.5 border">
                        {entry.type === 'session_deduction' && 'خصم تسميع'}
                        {entry.type === 'package_credit' && 'شحن باقة'}
                        {entry.type === 'emergency_loan' && 'سلفة طوارئ'}
                        {entry.type === 'bonus' && 'مكافأة'}
                        {entry.type === 'loan_repayment' && 'سداد سلفة'}
                      </td>
                      <td className="py-2 px-2.5 font-mono font-bold border text-center">
                        <span className={entry.minutesDelta < 0 ? 'text-red-700' : 'text-emerald-700'}>
                          {entry.minutesDelta > 0 ? `+${entry.minutesDelta}` : entry.minutesDelta} د
                        </span>
                      </td>
                      <td className="py-2 px-2.5 font-mono font-bold text-emerald-950 border text-center">
                        {entry.balanceAfter} د
                      </td>
                      <td className="py-2 px-2.5 text-stone-600 border max-w-xs truncate">
                        {entry.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Official Stamp & Signatures */}
            <div className="pt-6 border-t-2 border-stone-200 flex items-center justify-between text-xs text-stone-600">
              <div className="text-center">
                <span className="block font-bold text-stone-900 mb-6">المشرف والمقرئ العام</span>
                <span className="font-serif text-sm font-bold text-emerald-950">{SUPERVISOR_NAME}</span>
                <span className="block text-[10px] text-stone-400">التوقيع والاعتماد الأكاديمي</span>
              </div>

              <div className="w-24 h-24 rounded-full border-2 border-dashed border-amber-600/70 flex flex-col items-center justify-center text-center p-2 text-amber-900">
                <ShieldCheck className="w-6 h-6 text-emerald-800" />
                <span className="text-[9px] font-bold mt-1">خاتم المقرأة الرسمي المعتمد</span>
              </div>

              <div className="text-center">
                <span className="block font-bold text-stone-900 mb-6">إدارة التدقيق المالي</span>
                <span className="font-mono text-xs">سجل الحركات الإلكتروني</span>
                <span className="block text-[10px] text-emerald-700 font-bold">موثق ومعتمد ✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
