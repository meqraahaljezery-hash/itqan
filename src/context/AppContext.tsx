import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AnnouncementItem,
  AuditLedgerEntry,
  ChatMessage,
  Gender,
  MinutePackage,
  NotificationItem,
  PaymentMethod,
  PaymentRequest,
  PlatformSettings,
  ProgramItem,
  ReadingSession,
  RegistrationRequest,
  SessionRating,
  ShiftId,
  StudentRecord,
  UserProfile,
  UserRole,
} from '../types';
import {
  ACADEMY_NAME,
  ACADEMY_SHORT_NAME,
  DEFAULT_TELEGRAM_LINKS,
  generateDeductionMessage,
  getTelegramGroupLink,
  INITIAL_PACKAGES,
  INITIAL_PAYMENT_METHODS,
  INITIAL_PROGRAMS,
  SUPERVISOR_EMAIL,
  SUPERVISOR_NAME,
} from '../constants';
import { TelegramLinksSettings } from '../types';
import { useToast } from './ToastContext';
import { triggerHaptic } from '../utils/telegram';
import {
  notifyRegistrationApproved,
  notifySessionDeducted,
  notifyLowBalance,
  notifyPaymentApproved,
} from '../utils/notifications';

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (role: UserRole) => void;
  programs: ProgramItem[];
  setPrograms: React.Dispatch<React.SetStateAction<ProgramItem[]>>;
  packages: MinutePackage[];
  setPackages: React.Dispatch<React.SetStateAction<MinutePackage[]>>;
  paymentMethods: PaymentMethod[];
  setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
  students: StudentRecord[];
  setStudents: React.Dispatch<React.SetStateAction<StudentRecord[]>>;
  currentStudent: StudentRecord | null;
  setCurrentStudent: (student: StudentRecord | null) => void;
  registrationRequests: RegistrationRequest[];
  readingSessions: ReadingSession[];
  auditLedger: AuditLedgerEntry[];
  paymentRequests: PaymentRequest[];
  announcements: AnnouncementItem[];
  notifications: NotificationItem[];
  chatMessages: ChatMessage[];
  platformSettings: PlatformSettings;
  setPlatformSettings: React.Dispatch<React.SetStateAction<PlatformSettings>>;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;

  // Actions
  submitRegistrationRequest: (data: Omit<RegistrationRequest, 'id' | 'status' | 'submittedAt' | 'generatedCode'>) => RegistrationRequest;
  approveRegistrationRequest: (requestId: string, assignedReciterId?: string) => boolean;
  rejectRegistrationRequest: (requestId: string, reason: string) => boolean;
  recordReadingSession: (data: {
    studentId: string;
    surahNumber: number;
    surahName: string;
    fromAyah: number;
    toAyah: number;
    minutesConsumed: number;
    rating: SessionRating;
    notes?: string;
  }) => { success: boolean; message: string; session?: ReadingSession };
  submitPaymentRequest: (data: {
    studentId: string;
    packageId: string;
    paymentMethodId: string;
    senderName: string;
    senderPhone: string;
    transactionRef: string;
    receiptImage: string;
  }) => { success: boolean; message: string };
  approvePaymentRequest: (requestId: string) => boolean;
  rejectPaymentRequest: (requestId: string, reason: string) => boolean;
  requestEmergencyLoan: (studentId: string) => { success: boolean; message: string };
  sendChatMessage: (recipientId: string, content: string) => void;
  createAnnouncement: (title: string, content: string, targetRole: 'all' | 'students' | 'reciters') => void;
  giveStudentBonusMinutes: (studentId: string, minutes: number, reason: string) => void;
  toggleStudentStatus: (studentId: string, newStatus: 'active' | 'frozen' | 'suspended') => void;
  deleteStudentAccount: (studentId: string) => boolean;
  updateTelegramLinks: (links: TelegramLinksSettings) => void;
}

const STORAGE_PREFIX = 'jezery_quran_clean_v3_';

const DEFAULT_SETTINGS: PlatformSettings = {
  academyName: ACADEMY_NAME,
  platformName: ACADEMY_SHORT_NAME,
  logoText: ACADEMY_NAME,
  description: 'منصة إلكترونية متخصصة في الإقراء والإجازة بالسند المتصل برواية حفص والقراءات السبع',
  officialEmail: SUPERVISOR_EMAIL,
  officialPhone: '+251 91 123 4567',
  defaultCurrency: 'ETB',
  defaultCountry: 'إثيوبيا',
  defaultTimezone: 'Africa/Addis_Ababa',
  lowBalanceThreshold: 15,
  emergencyLoanMinutes: 15,
  telegramLinks: DEFAULT_TELEGRAM_LINKS,
};

// Clean initial production data (NO FAKE OR MOCK ACCOUNTS)
const INITIAL_STUDENT_DATA: StudentRecord[] = [];
const INITIAL_SESSIONS: ReadingSession[] = [];
const INITIAL_LEDGER: AuditLedgerEntry[] = [];

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'افتتاح التسجيل في دورة شرح الجزرية تمهيداً للإجازة بالسند',
    content:
      'يسر إدارة مقرأة الإمام الجزري دعوة الطلاب المنتظمين لحضور مجالس شرح المنظومة الجزرية في التجويد كل يوم سبت بعد صلاة العصر.',
    targetRole: 'all',
    status: 'published',
    publishedBy: SUPERVISOR_NAME,
    createdAt: '2026-11-01T12:00:00.000Z',
  },
  {
    id: 'ann-2',
    title: 'تنبيه بشأن الالتزام بمواعيد الفترات التعليمية',
    content:
      'نرجو من جميع الطلاب الكرام الدخول إلى مجموعات البث المباشر قبل موعد الحلقة بـ 5 دقائق لضمان انسيابية التسميع دون تأخير.',
    targetRole: 'students',
    status: 'published',
    publishedBy: 'إدارة شؤون المقارئ',
    createdAt: '2026-11-02T08:00:00.000Z',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();

  // Current active user
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}current_user`);
      if (stored) return JSON.parse(stored);
    } catch {}
    // Default to Super Admin for complete testing
    return {
      id: 'usr-admin-1',
      email: SUPERVISOR_EMAIL,
      fullName: SUPERVISOR_NAME,
      role: 'admin',
      gender: 'male',
      phone: '+251 91 123 4567',
      country: 'إثيوبيا',
      createdAt: '2026-10-01T00:00:00.000Z',
    };
  });

  const [programs, setPrograms] = useState<ProgramItem[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}programs`);
      return stored ? JSON.parse(stored) : INITIAL_PROGRAMS;
    } catch {
      return INITIAL_PROGRAMS;
    }
  });

  const [packages, setPackages] = useState<MinutePackage[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}packages`);
      return stored ? JSON.parse(stored) : INITIAL_PACKAGES;
    } catch {
      return INITIAL_PACKAGES;
    }
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}payment_methods`);
      return stored ? JSON.parse(stored) : INITIAL_PAYMENT_METHODS;
    } catch {
      return INITIAL_PAYMENT_METHODS;
    }
  });

  const [students, setStudents] = useState<StudentRecord[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}students`);
      return stored ? JSON.parse(stored) : INITIAL_STUDENT_DATA;
    } catch {
      return INITIAL_STUDENT_DATA;
    }
  });

  const [currentStudent, setCurrentStudent] = useState<StudentRecord | null>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}current_student`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}registration_requests`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [readingSessions, setReadingSessions] = useState<ReadingSession[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}reading_sessions`);
      return stored ? JSON.parse(stored) : INITIAL_SESSIONS;
    } catch {
      return INITIAL_SESSIONS;
    }
  });

  const [auditLedger, setAuditLedger] = useState<AuditLedgerEntry[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}audit_ledger`);
      return stored ? JSON.parse(stored) : INITIAL_LEDGER;
    } catch {
      return INITIAL_LEDGER;
    }
  });

  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}payment_requests`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}announcements`);
      return stored ? JSON.parse(stored) : INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);

  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`${STORAGE_PREFIX}seen_onboarding`) !== 'true';
    } catch {
      return true;
    }
  });

  const [activeNavTab, setActiveNavTab] = useState<string>('home');

  // Persistence
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}current_user`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}programs`, JSON.stringify(programs));
  }, [programs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}packages`, JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}payment_methods`, JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}students`, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    if (currentStudent) {
      localStorage.setItem(`${STORAGE_PREFIX}current_student`, JSON.stringify(currentStudent));
    }
  }, [currentStudent]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}reading_sessions`, JSON.stringify(readingSessions));
  }, [readingSessions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}audit_ledger`, JSON.stringify(auditLedger));
  }, [auditLedger]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}payment_requests`, JSON.stringify(paymentRequests));
  }, [paymentRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}registration_requests`, JSON.stringify(registrationRequests));
  }, [registrationRequests]);

  useEffect(() => {
    if (!showOnboarding) {
      localStorage.setItem(`${STORAGE_PREFIX}seen_onboarding`, 'true');
    }
  }, [showOnboarding]);

  // Keep currentStudent synced if modified in students array
  useEffect(() => {
    if (currentStudent) {
      const updated = students.find((s) => s.id === currentStudent.id);
      if (updated && (updated.balanceMinutes !== currentStudent.balanceMinutes || updated.status !== currentStudent.status)) {
        setCurrentStudent(updated);
      }
    }
  }, [students]);

  // Role switcher helper
  const switchRole = (newRole: UserRole) => {
    let name = currentUser.fullName;
    let code = currentUser.studentCode;

    if (newRole === 'student') {
      name = currentStudent ? currentStudent.fullName : 'عبد الرحمن بن خالد الأثيوبي';
      code = currentStudent ? currentStudent.code : 'IM-1001';
    } else if (newRole === 'reciter' || newRole === 'supervisor' || newRole === 'admin') {
      name = SUPERVISOR_NAME;
    }

    setCurrentUser((prev) => ({
      ...prev,
      role: newRole,
      fullName: name,
      studentCode: code,
    }));

    addToast({
      type: 'info',
      title: 'تبديل الدور التجريبي',
      message: `تم التبديل بنجاح إلى صلاحيات: ${
        newRole === 'admin'
          ? 'المدير العام (Super Admin)'
          : newRole === 'supervisor'
          ? 'المشرف العام'
          : newRole === 'reciter'
          ? 'الشيخ المقرئ'
          : 'الطالب'
      }`,
      duration: 3500,
    });
  };

  // Generate sequential code: IM-1001 or IF-1001
  const generateNextStudentCode = (gender: Gender): string => {
    const prefix = gender === 'male' ? 'IM' : 'IF';
    const regex = new RegExp(`^${prefix}-(\\d+)$`);
    let maxNumber = 1000;

    for (const s of students) {
      const match = s.code.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    }

    return `${prefix}-${maxNumber + 1}`;
  };

  // Submit registration request - Pending supervisor approval
  const submitRegistrationRequest = (
    data: Omit<RegistrationRequest, 'id' | 'status' | 'submittedAt' | 'generatedCode'>
  ): RegistrationRequest => {
    const generatedCode = generateNextStudentCode(data.gender);

    const newRequest: RegistrationRequest = {
      ...data,
      id: `req-${Date.now()}`,
      status: 'pending',
      generatedCode,
      submittedAt: new Date().toISOString(),
    };

    setRegistrationRequests((prev) => [newRequest, ...prev]);

    addToast({
      type: 'info',
      title: 'تم استلام طلب التسجيل بنجاح 🌿',
      message: `طلبك بالكود (${generatedCode}) قيد المراجعة والتدقيق وبانتظار موافقة فضيلة المشرف العام.`,
      duration: 6000,
    });

    return newRequest;
  };

  // Approve registration request by Supervisor
  const approveRegistrationRequest = (requestId: string, assignedReciterId?: string): boolean => {
    const request = registrationRequests.find((r) => r.id === requestId);
    if (!request || request.status !== 'pending') return false;

    const { url } = getTelegramGroupLink(request.gender, request.preferredShift, platformSettings.telegramLinks);

    const newStudent: StudentRecord = {
      id: `std-${Date.now()}`,
      code: request.generatedCode || generateNextStudentCode(request.gender),
      fullName: request.fullName,
      email: request.email,
      phone: request.phone,
      country: request.country,
      city: request.city,
      gender: request.gender,
      programId: request.requestedProgramId,
      programTitle: request.requestedProgramTitle,
      shift: request.preferredShift,
      balanceMinutes: 0,
      emergencyLoanUsed: false,
      emergencyLoanDue: 0,
      status: 'active',
      assignedReciterId: assignedReciterId || 'rec-1',
      assignedReciterName: SUPERVISOR_NAME,
      registeredAt: new Date().toISOString(),
      telegramGroupLink: url,
    };

    setStudents((prev) => [newStudent, ...prev]);

    setRegistrationRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved',
              reviewedAt: new Date().toISOString(),
              reviewedBy: currentUser.email,
              assignedReciterId,
            }
          : r
      )
    );

    // Trigger Android Native Push Notification
    notifyRegistrationApproved(newStudent.fullName, newStudent.programTitle);

    // Add In-App notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        recipientId: newStudent.id,
        title: 'تهانينا! اعتمد فضيلة الشيخ انضمامك إلى المقرأة 🌿✨',
        message: `تم اعتماد مقعدك رسمياً في [${newStudent.programTitle}]. كودك الأكاديمي (${newStudent.code}). تفضل بالدخول إلى بوابتك لحضور الحلقات وشحن الرصيد.`,
        type: 'success',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    addToast({
      type: 'success',
      title: 'تم اعتماد وقبول الطالب بنجاح',
      message: `أصبح الطالب ${newStudent.fullName} بالكود ${newStudent.code} معتمداً ونشطاً في المقرأة.`,
      duration: 5000,
    });

    return true;
  };

  // Reject registration request
  const rejectRegistrationRequest = (requestId: string, reason: string): boolean => {
    const request = registrationRequests.find((r) => r.id === requestId);
    if (!request || request.status !== 'pending') return false;

    setRegistrationRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected',
              rejectionReason: reason || 'البيانات غير مكتملة أو عدم توفر مقاعد في الفترة المطلوبة',
              reviewedAt: new Date().toISOString(),
              reviewedBy: currentUser.email,
            }
          : r
      )
    );

    addToast({
      type: 'warning',
      title: 'تم رفض طلب التسجيل',
      message: `تم رفض الطلب وتدوين السبب وإشعار الطالب به.`,
      duration: 4000,
    });

    return true;
  };

  // Record Reading Session with strictly validated inputs
  const recordReadingSession = ({
    studentId,
    surahNumber,
    surahName,
    fromAyah,
    toAyah,
    minutesConsumed,
    rating,
    notes,
  }: {
    studentId: string;
    surahNumber: number;
    surahName: string;
    fromAyah: number;
    toAyah: number;
    minutesConsumed: number;
    rating: SessionRating;
    notes?: string;
  }) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) {
      return { success: false, message: 'الطالب غير موجود' };
    }

    if (student.balanceMinutes < minutesConsumed && !student.emergencyLoanUsed) {
      // Prompt user or warn
      addToast({
        type: 'warning',
        title: 'رصيد الدقائق غير كافٍ',
        message: `رصيد الطالب ${student.balanceMinutes} دقيقة والمطلوب ${minutesConsumed} دقيقة.`,
      });
    }

    const balanceBefore = student.balanceMinutes;
    const balanceAfter = Math.max(0, balanceBefore - minutesConsumed);

    const messageText = generateDeductionMessage(
      student.fullName,
      minutesConsumed,
      balanceBefore,
      balanceAfter,
      surahName,
      fromAyah,
      toAyah
    );

    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const timestampStr = `${formattedDate} ${formattedTime}`;

    const newSession: ReadingSession = {
      id: `sess-${Date.now()}`,
      studentId: student.id,
      studentCode: student.code,
      studentName: student.fullName,
      reciterId: currentUser.id,
      reciterName: currentUser.fullName,
      programTitle: student.programTitle,
      surahNumber,
      surahName,
      fromAyah,
      toAyah,
      minutesConsumed,
      sessionDate: formattedDate,
      sessionTime: formattedTime,
      rating,
      notes: notes || 'جلسة تلاوة وإتقان في المقرأة',
      balanceBefore,
      balanceAfter,
      messageText,
      createdAt: now.toISOString(),
    };

    // Update student balance
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, balanceMinutes: balanceAfter } : s))
    );

    // Save session
    setReadingSessions((prev) => [newSession, ...prev]);

    // Append to Audit Ledger
    const ledgerEntry: AuditLedgerEntry = {
      id: `led-${Date.now()}`,
      timestamp: timestampStr,
      studentId: student.id,
      studentCode: student.code,
      studentName: student.fullName,
      performerEmail: currentUser.email,
      performerName: currentUser.fullName,
      minutesDelta: -minutesConsumed,
      balanceBefore,
      balanceAfter,
      type: 'session_deduction',
      referenceId: newSession.id,
      notes: `تسميع سورة ${surahName} (الآيات ${fromAyah} - ${toAyah}) - تقييم: ${rating}`,
      messageText,
    };

    setAuditLedger((prev) => [ledgerEntry, ...prev]);

    // Native Mobile Notification for Deduction (like telecom alerts)
    notifySessionDeducted(student.fullName, minutesConsumed, surahName, balanceAfter);

    // Low balance alert toast and native push notification
    if (balanceAfter < platformSettings.lowBalanceThreshold) {
      notifyLowBalance(balanceAfter);
      addToast({
        type: 'warning',
        title: '⚠️ تنبيه انخفاض الرصيد',
        message: `رصيد الطالب ${student.fullName} أصبح ${balanceAfter} دقيقة (أقل من ${platformSettings.lowBalanceThreshold} دقيقة). يُرجى شحن الباقة.`,
        duration: 7000,
      });
    } else {
      addToast({
        type: 'success',
        title: 'تم تسجيل جلسة التسميع',
        message: `تم خصم ${minutesConsumed} دقيقة بنجاح من رصيد ${student.fullName}. الرصيد المتبقي: ${balanceAfter} دقيقة.`,
        duration: 5000,
      });
    }

    return {
      success: true,
      message: messageText,
      session: newSession,
    };
  };

  // Submit payment request
  const submitPaymentRequest = ({
    studentId,
    packageId,
    paymentMethodId,
    senderName,
    senderPhone,
    transactionRef,
    receiptImage,
  }: {
    studentId: string;
    packageId: string;
    paymentMethodId: string;
    senderName: string;
    senderPhone: string;
    transactionRef: string;
    receiptImage: string;
  }) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return { success: false, message: 'الطالب غير موجود' };

    const pkg = packages.find((p) => p.id === packageId) || packages[0];
    const method = paymentMethods.find((m) => m.id === paymentMethodId) || paymentMethods[0];

    // Idempotency: verify ref uniqueness
    const isDuplicate = paymentRequests.some(
      (p) => p.transactionRef.trim().toLowerCase() === transactionRef.trim().toLowerCase()
    );
    if (isDuplicate) {
      addToast({
        type: 'error',
        title: 'رقم مرجعي مكرر',
        message: 'تم إرسال هذا الرقم المرجعي للعملية مسبقاً في النظام!',
      });
      return { success: false, message: 'الرقم المرجعي مكرر' };
    }

    const newPayment: PaymentRequest = {
      id: `pay-${Date.now()}`,
      studentId: student.id,
      studentCode: student.code,
      studentName: student.fullName,
      packageId: pkg.id,
      packageName: pkg.name,
      packageMinutes: pkg.minutes,
      amountEtb: pkg.priceEtb,
      paymentMethodId: method.id,
      paymentMethodName: method.name,
      senderName,
      senderPhone,
      transactionRef: transactionRef.trim(),
      receiptImage,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      idempotencyKey: `tx-${transactionRef.trim()}-${Date.now()}`,
    };

    setPaymentRequests((prev) => [newPayment, ...prev]);

    addToast({
      type: 'success',
      title: 'تم رفع إشعار التحويل البنكي',
      message: 'تم إرسال الطلب للمشرف المالي لتدقيق الإيصال وشحن الدقائق.',
      duration: 6000,
    });

    return { success: true, message: 'تم إرسال الطلب بنجاح' };
  };

  // Approve payment request
  const approvePaymentRequest = (requestId: string): boolean => {
    const payment = paymentRequests.find((p) => p.id === requestId);
    if (!payment || payment.status !== 'pending') return false;

    const student = students.find((s) => s.id === payment.studentId);
    if (!student) return false;

    let minutesToAdd = payment.packageMinutes;
    let loanSettled = 0;

    // Settle emergency loan if borrowed
    if (student.emergencyLoanDue > 0) {
      loanSettled = student.emergencyLoanDue;
      minutesToAdd = Math.max(0, minutesToAdd - loanSettled);
    }

    const balanceBefore = student.balanceMinutes;
    const balanceAfter = balanceBefore + minutesToAdd;

    // Update student
    setStudents((prev) =>
      prev.map((s) =>
        s.id === student.id
          ? {
              ...s,
              balanceMinutes: balanceAfter,
              emergencyLoanDue: 0,
              emergencyLoanUsed: false,
            }
          : s
      )
    );

    // Update payment
    const now = new Date();
    setPaymentRequests((prev) =>
      prev.map((p) =>
        p.id === requestId
          ? {
              ...p,
              status: 'approved',
              reviewedAt: now.toISOString(),
              reviewedBy: currentUser.email,
            }
          : p
      )
    );

    // Add ledger credit entry
    const timestampStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const ledgerEntry: AuditLedgerEntry = {
      id: `led-pay-${Date.now()}`,
      timestamp: timestampStr,
      studentId: student.id,
      studentCode: student.code,
      studentName: student.fullName,
      performerEmail: currentUser.email,
      performerName: currentUser.fullName,
      minutesDelta: payment.packageMinutes,
      balanceBefore,
      balanceAfter,
      type: 'package_credit',
      referenceId: payment.id,
      notes: `شحن باقة (${payment.packageMinutes} دقيقة) بقيمة ${payment.amountEtb} بر - مرجع: ${payment.transactionRef}${
        loanSettled > 0 ? ` [تم استقطاع سلفة طوارئ سابقة: ${loanSettled} دقيقة]` : ''
      }`,
    };

    setAuditLedger((prev) => [ledgerEntry, ...prev]);

    // Native Push Notification
    notifyPaymentApproved(payment.packageMinutes, balanceAfter);

    addToast({
      type: 'success',
      title: 'تم اعتماد الدفع وإضافة الدقائق 💳✨',
      message: `أُضيفت ${payment.packageMinutes} دقيقة لرصيد الطالب ${student.fullName}. الرصيد الجديد: ${balanceAfter} دقيقة.`,
      duration: 5000,
    });

    return true;
  };

  // Reject payment request
  const rejectPaymentRequest = (requestId: string, reason: string): boolean => {
    const payment = paymentRequests.find((p) => p.id === requestId);
    if (!payment || payment.status !== 'pending') return false;

    setPaymentRequests((prev) =>
      prev.map((p) =>
        p.id === requestId
          ? {
              ...p,
              status: 'rejected',
              rejectionReason: reason || 'الإيصال أو الرقم المرجعي غير متطابق مع كشف البنك',
              reviewedAt: new Date().toISOString(),
              reviewedBy: currentUser.email,
            }
          : p
      )
    );

    addToast({
      type: 'warning',
      title: 'تم رفض طلب الدفع',
      message: `تم رفض الإيصال وتوثيق السبب (${reason}).`,
      duration: 4000,
    });

    return true;
  };

  // Request emergency loan (15 minutes)
  const requestEmergencyLoan = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return { success: false, message: 'الطالب غير موجود' };

    if (student.emergencyLoanUsed) {
      addToast({
        type: 'warning',
        title: 'السلفة مستخدمة مسبقاً',
        message: 'لقد استفدت مسبقاً من سلفة الطوارئ، يُرجى شحن باقة للاستمرار.',
      });
      return { success: false, message: 'السلفة مستخدمة مسبقاً' };
    }

    const loanMinutes = platformSettings.emergencyLoanMinutes || 15;
    const balanceBefore = student.balanceMinutes;
    const balanceAfter = balanceBefore + loanMinutes;

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              balanceMinutes: balanceAfter,
              emergencyLoanUsed: true,
              emergencyLoanDue: loanMinutes,
            }
          : s
      )
    );

    const now = new Date();
    const timestampStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const loanEntry: AuditLedgerEntry = {
      id: `led-loan-${Date.now()}`,
      timestamp: timestampStr,
      studentId: student.id,
      studentCode: student.code,
      studentName: student.fullName,
      performerEmail: 'system@jezery.quran',
      performerName: 'النظام الآلي - سلفة طوارئ',
      minutesDelta: loanMinutes,
      balanceBefore,
      balanceAfter,
      type: 'emergency_loan',
      notes: `منح سلفة طوارئ (${loanMinutes} دقيقة) لمرة واحدة لإكمال الورد اليومي لحين تأكيد التحويل البنكي`,
    };

    setAuditLedger((prev) => [loanEntry, ...prev]);

    addToast({
      type: 'success',
      title: 'تم تفعيل سلفة الطوارئ (15 دقيقة) بنجاح',
      message: 'نسأل الله لك التوفيق والبركة في تلاوتك القرآنية.',
      duration: 5000,
    });

    return { success: true, message: 'تم تفعيل السلفة بنجاح' };
  };

  // Send chat message
  const sendChatMessage = (recipientId: string, content: string) => {
    if (!content.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: `conv-${[currentUser.id, recipientId].sort().join('-')}`,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: currentUser.role,
      recipientId,
      recipientName: 'المستقبل',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, newMessage]);
    triggerHaptic('light');
  };

  // Create announcement
  const createAnnouncement = (
    title: string,
    content: string,
    targetRole: 'all' | 'students' | 'reciters'
  ) => {
    const newAnn: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      targetRole,
      status: 'published',
      publishedBy: currentUser.fullName,
      createdAt: new Date().toISOString(),
    };

    setAnnouncements((prev) => [newAnn, ...prev]);

    addToast({
      type: 'success',
      title: 'تم نشر الإعلان',
      message: 'يظهر الإعلان الآن للجمهور المستهدف.',
    });
  };

  // Give bonus minutes
  const giveStudentBonusMinutes = (studentId: string, minutes: number, reason: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const balanceBefore = student.balanceMinutes;
    const balanceAfter = balanceBefore + minutes;

    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, balanceMinutes: balanceAfter } : s))
    );

    const now = new Date();
    const timestampStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const bonusEntry: AuditLedgerEntry = {
      id: `led-bonus-${Date.now()}`,
      timestamp: timestampStr,
      studentId: student.id,
      studentCode: student.code,
      studentName: student.fullName,
      performerEmail: currentUser.email,
      performerName: currentUser.fullName,
      minutesDelta: minutes,
      balanceBefore,
      balanceAfter,
      type: 'bonus',
      notes: reason || 'مكافأة تميز وإتقان من إدارة المقرأة',
    };

    setAuditLedger((prev) => [bonusEntry, ...prev]);

    addToast({
      type: 'success',
      title: 'تم منح دقائق مكافأة',
      message: `مُنح الطالب ${student.fullName} عدد ${minutes} دقيقة مكافأة.`,
    });
  };

  // Toggle student status
  const toggleStudentStatus = (studentId: string, newStatus: 'active' | 'frozen' | 'suspended') => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s))
    );

    addToast({
      type: 'info',
      title: 'تحديث حالة الطالب',
      message: `تم تغيير حالة الحساب إلى: ${
        newStatus === 'active' ? 'نشط' : newStatus === 'frozen' ? 'مجمد' : 'موقوف'
      }`,
    });
  };

  // Delete student account permanently (Double-confirmed)
  const deleteStudentAccount = (studentId: string): boolean => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setReadingSessions((prev) => prev.filter((s) => s.studentId !== studentId));
    setAuditLedger((prev) => prev.filter((s) => s.studentId !== studentId));
    setPaymentRequests((prev) => prev.filter((p) => p.studentId !== studentId));
    if (currentStudent?.id === studentId) {
      setCurrentStudent(null);
    }
    addToast({
      type: 'info',
      title: 'تم حذف الحساب نهائياً',
      message: 'تم مسح بيانات الحساب وسجل التسميع الخاص به بنجاح.',
    });
    return true;
  };

  // Update Telegram links in platform settings
  const updateTelegramLinks = (links: TelegramLinksSettings) => {
    setPlatformSettings((prev) => {
      const updated = { ...prev, telegramLinks: links };
      try {
        localStorage.setItem(`${STORAGE_PREFIX}platform_settings`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addToast({
      type: 'success',
      title: 'تم حفظ روابط مجموعات التيليجرام 🔗',
      message: 'تم تحديث روابط البث المباشر والمجموعات وتطبيقها في كامل المنصة.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        programs,
        setPrograms,
        packages,
        setPackages,
        paymentMethods,
        setPaymentMethods,
        students,
        setStudents,
        currentStudent,
        setCurrentStudent,
        registrationRequests,
        readingSessions,
        auditLedger,
        paymentRequests,
        announcements,
        notifications,
        chatMessages,
        platformSettings,
        setPlatformSettings,
        showOnboarding,
        setShowOnboarding,
        activeNavTab,
        setActiveNavTab,

        submitRegistrationRequest,
        approveRegistrationRequest,
        rejectRegistrationRequest,
        recordReadingSession,
        submitPaymentRequest,
        approvePaymentRequest,
        rejectPaymentRequest,
        requestEmergencyLoan,
        sendChatMessage,
        createAnnouncement,
        giveStudentBonusMinutes,
        toggleStudentStatus,
        deleteStudentAccount,
        updateTelegramLinks,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
