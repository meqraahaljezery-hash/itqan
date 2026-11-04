import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CreditCard,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  BellRing,
} from 'lucide-react';
import { playChimeAlert } from '../utils/notifications';
import { triggerHaptic } from '../utils/telegram';

interface LiveRecitationTrackerProps {
  onOpenRecharge: () => void;
}

export const LiveRecitationTracker: React.FC<LiveRecitationTrackerProps> = ({
  onOpenRecharge,
}) => {
  const { currentStudent, triggerTenMinuteSessionWarning } = useApp();

  const [isActive, setIsActive] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hasWarned10Min, setHasWarned10Min] = useState<boolean>(false);

  const balanceMinutes = currentStudent?.balanceMinutes ?? 0;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const remainingMinutes = Math.max(0, balanceMinutes - elapsedMinutes);

  // Timer tick
  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Check 10-minute warning threshold
  useEffect(() => {
    if (isActive && remainingMinutes <= 10 && !hasWarned10Min && currentStudent) {
      setHasWarned10Min(true);
      if (soundEnabled) {
        playChimeAlert();
      }
      triggerTenMinuteSessionWarning(currentStudent.id, remainingMinutes);
    }
  }, [isActive, remainingMinutes, hasWarned10Min, soundEnabled, currentStudent, triggerTenMinuteSessionWarning]);

  const handleToggleTimer = () => {
    triggerHaptic('light');
    setIsActive((prev) => !prev);
  };

  const handleResetTimer = () => {
    triggerHaptic('light');
    setIsActive(false);
    setElapsedSeconds(0);
    setHasWarned10Min(false);
  };

  const handleManualTestWarning = () => {
    if (!currentStudent) return;
    triggerHaptic('warning');
    if (soundEnabled) {
      playChimeAlert();
    }
    triggerTenMinuteSessionWarning(currentStudent.id, 10);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isCritical = remainingMinutes <= 10;

  if (!currentStudent) return null;

  return (
    <div
      className={`rounded-3xl p-4 sm:p-5 border-2 transition-all relative overflow-hidden ${
        isCritical
          ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/90 border-amber-400 shadow-lg ring-2 ring-amber-300 animate-pulse'
          : 'bg-white border-emerald-900/15 shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/80">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-2xs ${
              isCritical
                ? 'bg-amber-500 text-stone-950'
                : 'bg-emerald-900 text-amber-300'
            }`}
          >
            {isCritical ? (
              <BellRing className="w-5 h-5 animate-bounce" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-emerald-950 font-serif">
                متابعة جلسة التلاوة المباشرة ومؤقت الرصيد
              </h3>
              {isActive && (
                <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                  <span>جلسة نشطة</span>
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] text-stone-500">
              نظام إشعار صوتي ومرئي يُنبهك تلقائياً قبل 10 دقائق من انتهاء رصيدك
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`p-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1 ${
              soundEnabled
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-stone-100 border-stone-300 text-stone-400'
            }`}
            title={soundEnabled ? 'صوت التنبيه مفعل' : 'صوت التنبيه مكتوم'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-stone-400" />
            )}
            <span className="text-[10px] hidden sm:inline">
              {soundEnabled ? 'الصوت مفعل' : 'مكتوم'}
            </span>
          </button>

          <button
            onClick={handleManualTestWarning}
            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 text-[10px] font-bold transition flex items-center gap-1"
            title="تجربة كيف يظهر ويرن تنبيه الـ 10 دقائق"
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>تجربة تنبيه 10 د</span>
          </button>
        </div>
      </div>

      {/* Main Stats in Tracker */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3.5 pb-2 text-center">
        {/* Elapsed Time */}
        <div className="bg-stone-50/90 rounded-2xl p-2.5 border border-stone-200/90">
          <span className="text-[10px] text-stone-500 font-bold block mb-0.5">
            وقت التلاوة المنقضي
          </span>
          <span className="text-xl sm:text-2xl font-mono font-black text-stone-900 tracking-wider">
            {formatTimer(elapsedSeconds)}
          </span>
        </div>

        {/* Estimated Remaining Minutes */}
        <div
          className={`rounded-2xl p-2.5 border transition ${
            isCritical
              ? 'bg-amber-100/80 border-amber-400 text-amber-950 font-black'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}
        >
          <span className="text-[10px] font-bold block mb-0.5 opacity-80">
            الرصيد المتبقي أثناء الجلسة
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span
              className={`text-xl sm:text-2xl font-mono font-black ${
                isCritical ? 'text-amber-800' : 'text-emerald-900'
              }`}
            >
              {remainingMinutes}
            </span>
            <span className="text-xs font-bold">دقيقة</span>
          </div>
        </div>

        {/* Actions Controls */}
        <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 bg-stone-50/90 rounded-2xl p-2 border border-stone-200/90">
          <button
            onClick={handleToggleTimer}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95 ${
              isActive
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-800 hover:bg-emerald-900 text-white'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>بدء الجلسة</span>
              </>
            )}
          </button>

          {elapsedSeconds > 0 && (
            <button
              onClick={handleResetTimer}
              className="p-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 transition"
              title="إعادة ضبط المؤقت"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Critical 10-Minute Alert Notification Bar */}
      {isCritical && (
        <div className="mt-2.5 p-3 sm:p-3.5 rounded-2xl bg-amber-500/20 border-2 border-amber-500 text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
            <div>
              <h4 className="text-xs font-black text-amber-950">
                ⚠️ تنبيه انتهاء الرصيد: متبقي 10 دقائق فقط على انتهاء رصيدك أثناء جلسة التلاوة!
              </h4>
              <p className="text-[11px] text-amber-900/90 mt-0.5">
                سارع بشحن باقة إضافية لتفادي انقطاع حلقة التسميع مع فضيلة الشيخ.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenRecharge}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>شحن باقة دقائق الآن</span>
          </button>
        </div>
      )}
    </div>
  );
};
