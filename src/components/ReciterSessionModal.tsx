import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QURAN_SURAHS, QuranSurah } from '../data/quranSurahs';
import {
  X,
  BookOpen,
  Clock,
  Star,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Sparkles,
} from 'lucide-react';
import { SessionRating, StudentRecord } from '../types';
import { triggerHaptic } from '../utils/telegram';

interface ReciterSessionModalProps {
  student: StudentRecord;
  isOpen: boolean;
  onClose: () => void;
  onSessionRecorded?: (messageText: string) => void;
}

export const ReciterSessionModal: React.FC<ReciterSessionModalProps> = ({
  student,
  isOpen,
  onClose,
  onSessionRecorded,
}) => {
  const { recordReadingSession } = useApp();

  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1); // Al-Fatihah default
  const [fromAyah, setFromAyah] = useState<string>('1');
  const [toAyah, setToAyah] = useState<string>('7');
  const [minutesConsumed, setMinutesConsumed] = useState<number>(25);
  const [rating, setRating] = useState<SessionRating>('excellent');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const currentSurah: QuranSurah =
    QURAN_SURAHS.find((s) => s.number === selectedSurahNumber) || QURAN_SURAHS[0];

  const handleSurahChange = (surahNum: number) => {
    setSelectedSurahNumber(surahNum);
    const surah = QURAN_SURAHS.find((s) => s.number === surahNum);
    if (surah) {
      setFromAyah('1');
      setToAyah(String(Math.min(20, surah.totalAyahs)));
    }
  };

  const handleSetFullSurah = () => {
    setFromAyah('1');
    setToAyah(String(currentSurah.totalAyahs));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const fromNum = parseInt(fromAyah.trim(), 10);
    const toNum = parseInt(toAyah.trim(), 10);

    // Open & flexible validation only on submit
    if (isNaN(fromNum) || fromNum < 1 || fromNum > currentSurah.totalAyahs) {
      setErrorMsg(`الآية الأولى يجب أن تكون رقماً بين 1 و ${currentSurah.totalAyahs}`);
      return;
    }

    if (isNaN(toNum) || toNum < fromNum || toNum > currentSurah.totalAyahs) {
      setErrorMsg(`الآية الأخيرة يجب أن تكون بين الآية (${fromNum}) والآية (${currentSurah.totalAyahs})`);
      return;
    }

    if (minutesConsumed <= 0) {
      setErrorMsg('يُرجى إدخال عدد دقائق صحيح أكبر من صفر');
      return;
    }

    const res = recordReadingSession({
      studentId: student.id,
      surahNumber: currentSurah.number,
      surahName: currentSurah.name,
      fromAyah: fromNum,
      toAyah: toNum,
      minutesConsumed,
      rating,
      notes,
    });

    if (res.success) {
      triggerHaptic('success');
      onSessionRecorded?.(res.message);
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-[#fdfbf7] rounded-3xl shadow-2xl border-2 border-emerald-800/20 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-[#064e3b] p-5 text-white flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-900 flex items-center justify-center font-bold shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-amber-200">
                تسجيل جلسة تسميع وقراءة قرآنية
              </h3>
              <p className="text-xs text-emerald-100">
                الطالب: <strong className="text-white">{student.fullName}</strong> ({student.code})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Student Balance Banner */}
          <div className="bg-white p-3 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-stone-400" />
              <span className="font-bold text-stone-800">{student.fullName}</span>
              <span className="font-mono text-[11px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                {student.code}
              </span>
            </div>
            <div className="text-left font-mono">
              <span className="text-stone-500 text-[10px] block">رصيد الطالب الحي:</span>
              <span className="text-sm font-black text-emerald-900">
                {student.balanceMinutes} دقيقة
              </span>
            </div>
          </div>

          {/* Surah Selection with 114 Quran Surahs */}
          <div>
            <label className="block font-bold text-stone-800 mb-1">
              اختر السورة القرآنية <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedSurahNumber}
              onChange={(e) => handleSurahChange(parseInt(e.target.value, 10))}
              className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-semibold bg-white focus:ring-2 focus:ring-emerald-700"
            >
              {QURAN_SURAHS.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. سورة {s.name} ({s.totalAyahs} آية - {s.revelationType})
                </option>
              ))}
            </select>
          </div>

          {/* Ayah Range with Free Manual Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-stone-800">
                موضع القراءة (من الآية إلى الآية) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleSetFullSurah}
                className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
              >
                كامل السورة (١ - {currentSurah.totalAyahs})
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute right-3 top-2.5 text-stone-400 text-xs font-semibold pointer-events-none">
                  مِن:
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={fromAyah}
                  onChange={(e) => setFromAyah(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="١"
                  className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-stone-300 font-mono text-center font-bold text-base bg-white focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="relative">
                <span className="absolute right-3 top-2.5 text-stone-400 text-xs font-semibold pointer-events-none">
                  إِلَى:
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={toAyah}
                  onChange={(e) => setToAyah(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder={String(currentSurah.totalAyahs)}
                  className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-stone-300 font-mono text-center font-bold text-base bg-white focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
            <p className="text-[10px] text-stone-500 mt-1">
              * كتابة يدوية حرة دون تعليق. إجمالي آيات سورة {currentSurah.name}: ({currentSurah.totalAyahs} آية).
            </p>
          </div>

          {/* Minutes Consumed with preset buttons */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-stone-800">
                عدد الدقائق المستهلكة في الجلسة <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-stone-500 font-mono">
                المتبقي بعد الخصم: {Math.max(0, student.balanceMinutes - minutesConsumed)} د
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {[10, 15, 20, 25, 30].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMinutesConsumed(m)}
                  className={`py-1.5 rounded-xl font-bold font-mono transition text-xs ${
                    minutesConsumed === m
                      ? 'bg-emerald-900 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {m} د
                </button>
              ))}
            </div>

            <input
              type="number"
              min="1"
              value={minutesConsumed}
              onChange={(e) => setMinutesConsumed(parseInt(e.target.value, 10) || 1)}
              className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-center font-black text-emerald-950 text-base bg-white"
            />

            {student.balanceMinutes - minutesConsumed <= 10 && (
              <div className="mt-2 p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  تنبيه: سيتبقى للطالب ({Math.max(0, student.balanceMinutes - minutesConsumed)} دقيقة)، وسيتلقى إشعاراً صوتياً وتطبيعياً داخل المنصة لتجديد الباقة قبل النفاد.
                </span>
              </div>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="block font-bold text-stone-800 mb-1.5">
              تقييم أداء الطالب في الجلسة
            </label>
            <div className="grid grid-cols-5 gap-1 text-[11px]">
              {(
                [
                  { id: 'excellent', title: 'ممتاز' },
                  { id: 'very_good', title: 'جيد جداً' },
                  { id: 'good', title: 'جيد' },
                  { id: 'acceptable', title: 'مقبول' },
                  { id: 'weak', title: 'ضعيف' },
                ] as const
              ).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRating(r.id)}
                  className={`py-1.5 rounded-xl font-bold border transition ${
                    rating === r.id
                      ? 'border-emerald-800 bg-emerald-900 text-white shadow-xs'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {r.title}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-stone-800 mb-1">
              ملاحظات الشيخ والمقرئ التعليمية (اختياري)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: إتقان لأحكام المد وتنبيه على مخرج القاف والكاف"
              className="w-full p-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-100 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>اعتماد الجلسة وخصم الدقائق</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
