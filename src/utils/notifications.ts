/**
 * Android Mobile & Web Native Push Notification System
 * Handles Web Notifications API for Android / Chrome / Mobile PWA
 */

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export function sendNativeNotification(
  title: string,
  options: {
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    vibrate?: number[];
    data?: any;
  }
): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    // Android vibration pattern: [vibrate, pause, vibrate]
    const vibratePattern = options.vibrate || [200, 100, 200];

    const notification = new Notification(title, {
      body: options.body,
      icon: options.icon || '/icon.svg',
      badge: options.badge || '/icon.svg',
      tag: options.tag || 'jezery_notification',
      dir: 'rtl',
      lang: 'ar',
      ...({ vibrate: vibratePattern } as any),
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (error) {
    console.warn('Native notification failed, falling back to in-app toast:', error);
    return false;
  }
}

// 1. Notification: Registration Approved
export function notifyRegistrationApproved(studentName: string, programTitle: string) {
  sendNativeNotification('تهانينا! تم اعتماد طلب تسجيلك 🌿✨', {
    body: `أهلاً بك يا ${studentName} في مقرأة الإمام الجزري. تم اعتماد مقعدك رسمياً في [${programTitle}] وبإمكانك الآن حضور الحلقات.`,
    tag: 'registration_approved',
    vibrate: [300, 100, 300, 100, 400],
  });
}

// 2. Notification: Minute Deduction (Telecom-style notification)
export function notifySessionDeducted(
  studentName: string,
  minutes: number,
  surahName: string,
  remainingBalance: number
) {
  sendNativeNotification('إشعار خصم جلسة تسميع قرآنية 📖', {
    body: `عزيزي الطالب ${studentName}، تم خصم ${minutes} دقيقة لجلسة تلاوة سورة ${surahName}. رصيدك المتبقي الحالي هو: ${remainingBalance} دقيقة. هنيئاً لك.`,
    tag: `session_deduction_${Date.now()}`,
    vibrate: [200, 100, 200],
  });
}

// 3. Notification: Low Balance Alert (<15 mins)
export function notifyLowBalance(remainingMinutes: number) {
  sendNativeNotification('⚠️ تنبيه انخفاض رصيد الدقائق', {
    body: `تنبيه: رصيدك الحالي (${remainingMinutes} دقيقة) أوشك على النفاد. يُرجى شحن باقة الدقائق لضمان استمرار جلسات التسميع مع المشرف.`,
    tag: 'low_balance_alert',
    vibrate: [400, 150, 400],
  });
}

// 4. Notification: Payment/Recharge Approved
export function notifyPaymentApproved(minutesAdded: number, newBalance: number) {
  sendNativeNotification('تم شحن رصيد الباقة بنجاح 💳✨', {
    body: `تم اعتماد إيصال التحويل البنكي وإضافة ${minutesAdded} دقيقة إلى محفظتك القرآنية. رصيدك الكلي الآن: ${newBalance} دقيقة.`,
    tag: 'payment_approved',
    vibrate: [200, 100, 300],
  });
}

// 5. Notification: Shift / Scheduled Session Reminder
export function notifyShiftReminder(shiftTitle: string, shiftTime: string) {
  sendNativeNotification(`تذكير حلقة التسميع القادمة ⏰`, {
    body: `حان موعد فترتك التعليمية (${shiftTitle} - ${shiftTime}). فضيلة الشيخ بانتظارك في حلقة البث المباشر.`,
    tag: 'shift_reminder',
    vibrate: [250, 100, 250],
  });
}

// 6. Notification: 10-Minute Balance Warning During Recitation
export function notifyTenMinuteWarning(studentName: string, remainingMinutes: number) {
  sendNativeNotification('⚠️ تنبيه: متبقي 10 دقائق على انتهاء رصيدك!', {
    body: `تنبيه أثناء جلسة التلاوة: متبقي لديك ${remainingMinutes} دقائق فقط في رصيدك القرآني. يُرجى شحن باقة إضافية للاستمرار في التسميع دون انقطاع.`,
    tag: 'ten_minute_warning',
    vibrate: [300, 100, 300, 100, 500],
  });
}

/**
 * Gentle Web Audio Synthesizer Alert for In-App Session Notifications
 * Plays a soft, dignified two-tone chime without external audio files
 */
export function playChimeAlert() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // First pleasant tone (587.33 Hz - D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);
    gain1.gain.setValueAtTime(0.25, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.85);

    // Second harmonic tone
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(880, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.2);
        gain2.gain.setValueAtTime(0.2, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.75);
      } catch {}
    }, 200);
  } catch (e) {
    console.warn('Audio alert not allowed or user gesture required:', e);
  }
}
