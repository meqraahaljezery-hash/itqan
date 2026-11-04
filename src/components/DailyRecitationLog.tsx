import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  BookOpen,
  Calendar,
  User,
  Star,
  Copy,
  CheckCircle2,
  Send,
  Sparkles,
  ArrowDownLeft,
} from 'lucide-react';
import { triggerHaptic, openTelegramShare } from '../utils/telegram';

export const DailyRecitationLog: React.FC = () => {
  const { readingSessions } = useApp();
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);

  // Take the last 10 session deductions
  const last10Sessions = readingSessions.slice(0, 10);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSessionId(id);
    triggerHaptic('light');
    setTimeout(() => setCopiedSessionId(null), 2000);
  };

  const handleTelegramShare = (text: string) => {
    openTelegramShare(text);
    triggerHaptic('success');
  };

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-300">ممتاز ★★★</span>;
      case 'very_good':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-300">جيد جداً ★★</span>;
      case 'good':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-300">جيد ★</span>;
      case 'acceptable':
        return <span className="bg-stone-100 text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-stone-300">مقبول</span>;
      default:
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-md">يحتاج مراجعة</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200/90 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-900 text-amber-300 flex items-center justify-center font-bold shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-emerald-950 flex items-center gap-2">
              <span>سجل التسميع اليومي للمقرئ</span>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                آخر 10 جلسات
              </span>
            </h3>
            <p className="text-[11px] text-stone-500">
              عمليات خصم الدقائق المباشرة مع تفاصيل السورة والآيات والتقييم
            </p>
          </div>
        </div>

        <div className="text-xs text-stone-500 font-mono">
          إجمالي المسجل: <strong className="text-emerald-900">{readingSessions.length}</strong> جلسة
        </div>
      </div>

      {last10Sessions.length === 0 ? (
        <div className="text-center py-10 text-stone-400 text-xs">
          <Clock className="w-8 h-8 mx-auto mb-2 text-stone-300" />
          <p>لم تُسجل أي جلسات تسميع اليوم بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {last10Sessions.map((session, index) => (
            <div
              key={session.id}
              className="p-4 rounded-2xl border border-stone-200 bg-[#fdfbf7] hover:border-emerald-300 transition-all space-y-2.5 text-xs relative"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center text-[10px] font-bold font-mono shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                      <span>{session.studentName}</span>
                      <span className="font-mono text-xs font-semibold text-amber-800 bg-amber-100/70 px-1.5 py-0.2 rounded border border-amber-300/60">
                        {session.studentCode}
                      </span>
                    </h4>
                    <span className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5 font-mono">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      <span>{session.sessionDate}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{session.sessionTime}</span>
                    </span>
                  </div>
                </div>

                {/* Minutes Deducted Pill */}
                <div className="text-left shrink-0">
                  <span className="inline-flex items-center gap-1 font-mono font-black text-sm text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-xl shadow-2xs">
                    <ArrowDownLeft className="w-3 h-3 text-red-500" />
                    <span>-{session.minutesConsumed} د</span>
                  </span>
                </div>
              </div>

              {/* Recitation Content Details */}
              <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 space-y-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-950 font-bold">
                    📖 سورة {session.surahName} (الآيات {session.fromAyah} - {session.toAyah})
                  </span>
                  {getRatingBadge(session.rating)}
                </div>

                {session.notes && (
                  <p className="text-[10px] text-stone-600 italic line-clamp-2">
                    ✍️ {session.notes}
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-100 font-mono">
                  <span>الرصيد السابق: {session.balanceBefore} د</span>
                  <span>
                    الرصيد المتبقي:{' '}
                    <strong className="text-emerald-900">{session.balanceAfter} دقيقة</strong>
                  </span>
                </div>
              </div>

              {/* Actions: Copy Formatted Message / Send to Telegram */}
              {session.messageText && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleCopy(session.messageText!, session.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[10px] font-bold border border-emerald-200 transition"
                  >
                    {copiedSessionId === session.id ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>نسخ رسالة التسميع</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleTelegramShare(session.messageText!)}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold transition shadow-2xs"
                    title="مشاركة الرسالة في تيليجرام"
                  >
                    <Send className="w-3 h-3 -rotate-12" />
                    <span>إرسال</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
