import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  CreditCard,
  Trash2,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { playChimeAlert } from '../utils/notifications';
import { triggerHaptic } from '../utils/telegram';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRecharge?: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onOpenRecharge,
}) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    currentStudent,
    currentUser,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  // Filter notifications relevant to current student or general
  const studentId = currentStudent?.id;
  const filteredNotifications = notifications.filter((n) => {
    // If student logged in, show their notifications or broadcast 'all'
    if (studentId) {
      if (n.recipientId !== studentId && n.recipientId !== 'all') return false;
    }
    // Filter unread
    if (activeFilter === 'unread' && n.isRead) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => {
    if (studentId && n.recipientId !== studentId && n.recipientId !== 'all') return false;
    return !n.isRead;
  }).length;

  const handleTestChime = () => {
    playChimeAlert();
    triggerHaptic('light');
  };

  const handleNotificationClick = (id: string, isTenMinWarning: boolean) => {
    markNotificationAsRead(id);
    if (isTenMinWarning && onOpenRecharge) {
      onClose();
      onOpenRecharge();
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-[#fdfbf7] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#064e3b] via-[#043e2f] to-[#022c22] text-white p-4 sm:p-5 flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-md">
              <Bell className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-amber-200 font-serif">
                  مركز الإشعارات داخل التطبيق
                </h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.2 rounded-full shadow-xs">
                    {unreadCount} جديد
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-200/80 font-light">
                تنبيهات رصيد الدقائق، وجلسات التسميع، والمدفوعات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleTestChime}
              className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-amber-300 transition"
              title="تجربة صوت نغمة التنبيه"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-emerald-800 text-stone-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Action Toolbar */}
        <div className="bg-stone-100/90 px-4 py-2.5 flex items-center justify-between border-b border-stone-200 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition text-xs ${
                activeFilter === 'all'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              الكل ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-3 py-1 rounded-lg font-bold transition text-xs ${
                activeFilter === 'unread'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              غير المقروء ({unreadCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllNotificationsAsRead(studentId)}
                className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold hover:underline"
              >
                تحديد كمقروء ✓
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => clearNotifications(studentId)}
                className="text-[11px] text-stone-400 hover:text-red-600 transition flex items-center gap-0.5"
                title="مسح الإشعارات"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-stone-400 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-300">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-stone-500">
                لا توجد إشعارات {activeFilter === 'unread' ? 'غير مقروءة' : 'حالياً'}
              </p>
              <p className="text-[10px] text-stone-400 font-serif">
                ستصلك التنبيهات الفورية قبل 10 دقائق من انتهاء رصيدك أثناء التلاوة.
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const isTenMinWarning =
                n.title.includes('10 دقائق') || n.message.includes('10 دقائق');

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n.id, isTenMinWarning)}
                  className={`p-3.5 rounded-2xl border transition text-right cursor-pointer relative ${
                    isTenMinWarning
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50/80 border-amber-300 shadow-xs'
                      : !n.isRead
                      ? 'bg-white border-emerald-300 shadow-xs ring-1 ring-emerald-200'
                      : 'bg-stone-50/60 border-stone-200 opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                        isTenMinWarning
                          ? 'bg-amber-500 text-stone-950 animate-pulse'
                          : n.type === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : n.type === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {isTenMinWarning ? (
                        <AlertTriangle className="w-5 h-5 text-stone-950" />
                      ) : n.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : n.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-xs font-bold ${
                            isTenMinWarning
                              ? 'text-amber-950 font-black'
                              : 'text-stone-900'
                          }`}
                        >
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                        )}
                      </div>

                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        {n.message}
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[10px] text-stone-400">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(n.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>

                        {isTenMinWarning && onOpenRecharge && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markNotificationAsRead(n.id);
                              onClose();
                              onOpenRecharge();
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-[10px] shadow-xs transition active:scale-95"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>شحن باقة دقائق الآن</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 p-3 text-center border-t border-stone-200">
          <p className="text-[10px] text-stone-500 font-serif">
            مقرأة الإمام الجزري — نظام إشعار الدقائق الذكي والتنبيه الفوري
          </p>
        </div>
      </div>
    </div>
  );
};
