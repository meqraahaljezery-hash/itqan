import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AuditLedgerEntry,
  Gender,
  PaymentTransaction,
  ProgramId,
  ShiftId,
  Student,
} from '../types';
import {
  BANK_ACCOUNTS,
  generateDeductionMessage,
  getTelegramGroupLink,
  SUPERVISOR_EMAIL,
  SUPERVISOR_NAME,
} from '../constants';
import { triggerHaptic } from '../utils/telegram';

interface RegisterStudentData {
  fullName: string;
  telegramHandle: string;
  phone: string;
  country: string;
  program: ProgramId;
  gender: Gender;
  shift: ShiftId;
}

interface AppContextType {
  students: Student[];
  payments: PaymentTransaction[];
  ledger: AuditLedgerEntry[];
  currentStudent: Student | null;
  setCurrentStudent: (student: Student | null) => void;
  isSupervisor: boolean;
  supervisorEmail: string | null;
  loginSupervisor: (email: string, pass: string) => boolean;
  logoutSupervisor: () => void;
  registerStudent: (data: RegisterStudentData) => Student;
  deductMinutes: (studentId: string, minutes: number, teacherName?: string, notes?: string) => { success: boolean; message: string; balanceBefore: number; balanceAfter: number };
  approvePayment: (paymentId: string) => boolean;
  rejectPayment: (paymentId: string, reason: string) => boolean;
  submitPayment: (data: {
    studentId: string;
    packageMinutes: number;
    amountEtb: number;
    bankId: string;
    transactionRef: string;
    receiptImage: string;
  }) => { success: boolean; message: string };
  requestEmergencyLoan: (studentId: string) => { success: boolean; message: string };
  getStudentByCode: (code: string) => Student | undefined;
  activeTab: 'student_portal' | 'register' | 'supervisor';
  setActiveTab: (tab: 'student_portal' | 'register' | 'supervisor') => void;
  resetDataToDemo: () => void;
}

const STORAGE_KEYS = {
  STUDENTS: 'moqraa_students_v1',
  PAYMENTS: 'moqraa_payments_v1',
  LEDGER: 'moqraa_ledger_v1',
  SUPERVISOR: 'moqraa_supervisor_v1',
  CURRENT_STUDENT: 'moqraa_current_student_v1',
};

// Initial Realistic Demo Data
const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    code: 'IM-1001',
    fullName: 'عبد الرحمن بن خالد الأثيوبي',
    telegramHandle: '@abdurahman_kh',
    phone: '+251 91 123 4567',
    country: 'إثيوبيا (أديس أبابا)',
    program: 'ijazah',
    gender: 'male',
    shift: 'morning',
    balanceMinutes: 85,
    emergencyLoanUsed: false,
    emergencyLoanDue: 0,
    registeredAt: '2026-10-25T08:30:00.000Z',
    telegramGroupLink: 'https://t.me/+Moqraa_ikwan_morning',
  },
  {
    id: 'std-2',
    code: 'IM-1002',
    fullName: 'يوسف عمر إبراهيم',
    telegramHandle: '@youssef_quran',
    phone: '+251 92 888 7766',
    country: 'إثيوبيا (ديرة داوا)',
    program: 'hifz',
    gender: 'male',
    shift: 'night',
    balanceMinutes: 12, // Low balance to trigger alert
    emergencyLoanUsed: false,
    emergencyLoanDue: 0,
    registeredAt: '2026-10-28T14:15:00.000Z',
    telegramGroupLink: 'https://t.me/+Moqraa_ikwan_night',
  },
  {
    id: 'std-3',
    code: 'IF-1001',
    fullName: 'فاطمة محمد نور',
    telegramHandle: '@fatima_noor',
    phone: '+251 93 456 7890',
    country: 'المملكة العربية السعودية',
    program: 'talqeen',
    gender: 'female',
    shift: 'evening',
    balanceMinutes: 0, // Exhausted balance, can test emergency loan
    emergencyLoanUsed: false,
    emergencyLoanDue: 0,
    registeredAt: '2026-10-29T19:00:00.000Z',
    telegramGroupLink: 'https://t.me/+Moqraa_akhwat_evening',
  },
  {
    id: 'std-4',
    code: 'IF-1002',
    fullName: 'مريم آدم حسن',
    telegramHandle: '@maryam_adam',
    phone: '+251 94 333 2211',
    country: 'الإمارات العربية المتحدة',
    program: 'ijazah',
    gender: 'female',
    shift: 'morning',
    balanceMinutes: 160,
    emergencyLoanUsed: false,
    emergencyLoanDue: 0,
    registeredAt: '2026-10-30T10:20:00.000Z',
    telegramGroupLink: 'https://t.me/+Moqraa_akhwat_morning',
  },
];

const INITIAL_PAYMENTS: PaymentTransaction[] = [
  {
    id: 'pay-sample-1',
    studentId: 'std-2',
    studentCode: 'IM-1002',
    studentName: 'يوسف عمر إبراهيم',
    packageMinutes: 200,
    amountEtb: 1000,
    bankId: 'cbe',
    bankName: 'البنك التجاري الإثيوبي (CBE)',
    transactionRef: 'CBE-FT2630588912',
    receiptImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    status: 'pending',
    submittedAt: '2026-11-02T05:40:00.000Z',
    idempotencyKey: 'cbe-tx-1002-200m',
  },
  {
    id: 'pay-sample-2',
    studentId: 'std-3',
    studentCode: 'IF-1001',
    studentName: 'فاطمة محمد نور',
    packageMinutes: 100,
    amountEtb: 500,
    bankId: 'telebirr',
    bankName: 'تيليبير (Telebirr)',
    transactionRef: 'TB-9918237190',
    receiptImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    status: 'pending',
    submittedAt: '2026-11-02T06:05:00.000Z',
    idempotencyKey: 'tb-tx-1001-100m',
  },
];

const INITIAL_LEDGER: AuditLedgerEntry[] = [
  {
    id: 'led-1',
    timestamp: '2026-11-01 21:45',
    studentId: 'std-1',
    studentCode: 'IM-1001',
    studentName: 'عبد الرحمن بن خالد الأثيوبي',
    teacherEmail: SUPERVISOR_EMAIL,
    teacherName: SUPERVISOR_NAME,
    minutesDelta: -25,
    balanceBefore: 110,
    balanceAfter: 85,
    type: 'session_deduction',
    notes: 'تسميع ربع الحزب الثالث من سورة البقرة مع بيان أحكام المد المتصل',
    messageText: generateDeductionMessage('عبد الرحمن بن خالد الأثيوبي', 25, 110, 85),
  },
  {
    id: 'led-2',
    timestamp: '2026-11-01 15:10',
    studentId: 'std-4',
    studentCode: 'IF-1002',
    studentName: 'مريم آدم حسن',
    teacherEmail: SUPERVISOR_EMAIL,
    teacherName: SUPERVISOR_NAME,
    minutesDelta: -20,
    balanceBefore: 180,
    balanceAfter: 160,
    type: 'session_deduction',
    notes: 'عرض سورة الكهف وضبط مخارج الضاد والظاء',
    messageText: generateDeductionMessage('مريم آدم حسن', 20, 180, 160),
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return stored ? JSON.parse(stored) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [payments, setPayments] = useState<PaymentTransaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      return stored ? JSON.parse(stored) : INITIAL_PAYMENTS;
    } catch {
      return INITIAL_PAYMENTS;
    }
  });

  const [ledger, setLedger] = useState<AuditLedgerEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEDGER);
      return stored ? JSON.parse(stored) : INITIAL_LEDGER;
    } catch {
      return INITIAL_LEDGER;
    }
  });

  const [currentStudent, setCurrentStudent] = useState<Student | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isSupervisor, setIsSupervisor] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SUPERVISOR) === 'true';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<'student_portal' | 'register' | 'supervisor'>('student_portal');

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    if (currentStudent) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT, JSON.stringify(currentStudent));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT);
    }
  }, [currentStudent]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPERVISOR, isSupervisor ? 'true' : 'false');
  }, [isSupervisor]);

  // Keep currentStudent synced if updated in students array
  useEffect(() => {
    if (currentStudent) {
      const updated = students.find((s) => s.id === currentStudent.id);
      if (updated && (updated.balanceMinutes !== currentStudent.balanceMinutes || updated.emergencyLoanUsed !== currentStudent.emergencyLoanUsed)) {
        setCurrentStudent(updated);
      }
    }
  }, [students]);

  // Generate next sequential code: IM-1001, IM-1002 ... or IF-1001, IF-1002 ...
  const generateNextCode = (gender: Gender): string => {
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

    const nextNum = maxNumber + 1;
    return `${prefix}-${nextNum}`;
  };

  const registerStudent = (data: RegisterStudentData): Student => {
    const code = generateNextCode(data.gender);
    const { url } = getTelegramGroupLink(data.gender, data.shift);

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      code,
      fullName: data.fullName.trim(),
      telegramHandle: data.telegramHandle.trim(),
      phone: data.phone.trim(),
      country: data.country.trim(),
      program: data.program,
      gender: data.gender,
      shift: data.shift,
      balanceMinutes: 0, // Starts at 0, ready to recharge or take emergency loan
      emergencyLoanUsed: false,
      emergencyLoanDue: 0,
      registeredAt: new Date().toISOString(),
      telegramGroupLink: url,
    };

    setStudents((prev) => [newStudent, ...prev]);
    setCurrentStudent(newStudent);
    triggerHaptic('success');
    return newStudent;
  };

  const deductMinutes = (
    studentId: string,
    minutes: number,
    teacherName = SUPERVISOR_NAME,
    notes = 'جلسة تسميع وتصحيح القرآن الكريم'
  ) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) {
      return { success: false, message: 'الطالب غير موجود', balanceBefore: 0, balanceAfter: 0 };
    }

    const balanceBefore = student.balanceMinutes;
    const balanceAfter = Math.max(0, balanceBefore - minutes);
    const actualDeducted = balanceBefore - balanceAfter;

    // Generate formatted message text
    const messageText = generateDeductionMessage(
      student.fullName,
      minutes,
      balanceBefore,
      balanceAfter
    );

    // Update student balance
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, balanceMinutes: balanceAfter } : s))
    );

    // Add immutable ledger entry
    const now = new Date();
    const formattedTimestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newLedgerEntry: AuditLedgerEntry = {
      id: `led-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: formattedTimestamp,
      studentId: student.id,
      studentCode: student.code,
      studentName: student.fullName,
      teacherEmail: SUPERVISOR_EMAIL,
      teacherName,
      minutesDelta: -minutes,
      balanceBefore,
      balanceAfter,
      type: 'session_deduction',
      notes,
      messageText,
    };

    setLedger((prev) => [newLedgerEntry, ...prev]);
    triggerHaptic('success');

    return {
      success: true,
      message: messageText,
      balanceBefore,
      balanceAfter,
    };
  };

  const approvePayment = (paymentId: string): boolean => {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment || payment.status !== 'pending') {
      return false; // Idempotency: cannot approve already approved/rejected
    }

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
      prev.map((s) => {
        if (s.id === student.id) {
          return {
            ...s,
            balanceMinutes: balanceAfter,
            emergencyLoanDue: 0,
            emergencyLoanUsed: false, // Reset so they can borrow again in future emergency
          };
        }
        return s;
      })
    );

    // Mark payment approved
    const now = new Date();
    const formattedTimestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: 'approved',
              reviewedAt: now.toISOString(),
              reviewedBy: SUPERVISOR_EMAIL,
            }
          : p
      )
    );

    // Add ledger credit entry
    const creditEntry: AuditLedgerEntry = {
      id: `led-pay-${Date.now()}`,
      timestamp: formattedTimestamp,
      studentId: student.id,
      studentCode: student.code,
      studentName: student.fullName,
      teacherEmail: SUPERVISOR_EMAIL,
      teacherName: 'إدارة المالية والتحصيل',
      minutesDelta: payment.packageMinutes,
      balanceBefore,
      balanceAfter,
      type: 'package_credit',
      notes: `اعتماد شحن باقة (${payment.packageMinutes} دقيقة) عبر ${payment.bankName} - مرجع: ${payment.transactionRef}${
        loanSettled > 0 ? ` (تم استقطاع سلفة طوارئ سابقة: ${loanSettled} دقيقة)` : ''
      }`,
    };

    setLedger((prev) => [creditEntry, ...prev]);
    triggerHaptic('success');
    return true;
  };

  const rejectPayment = (paymentId: string, reason: string): boolean => {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment || payment.status !== 'pending') {
      return false;
    }

    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: 'rejected',
              rejectionReason: reason || 'الإيصال أو الرقم المرجعي غير مطابق للتحويل البنكي',
              reviewedAt: new Date().toISOString(),
              reviewedBy: SUPERVISOR_EMAIL,
            }
          : p
      )
    );

    triggerHaptic('warning');
    return true;
  };

  const submitPayment = (data: {
    studentId: string;
    packageMinutes: number;
    amountEtb: number;
    bankId: string;
    transactionRef: string;
    receiptImage: string;
  }) => {
    const student = students.find((s) => s.id === data.studentId);
    if (!student) {
      return { success: false, message: 'الطالب غير مسجل' };
    }

    // Check duplicate transactionRef
    const isDuplicate = payments.some(
      (p) => p.transactionRef.trim().toLowerCase() === data.transactionRef.trim().toLowerCase()
    );
    if (isDuplicate) {
      return { success: false, message: 'هذا الرقم المرجعي للعملية مسجل مسبقاً في النظام!' };
    }

    const bank = BANK_ACCOUNTS.find((b) => b.id === data.bankId);
    const newPayment: PaymentTransaction = {
      id: `pay-${Date.now()}`,
      studentId: student.id,
      studentCode: student.code,
      studentName: student.fullName,
      packageMinutes: data.packageMinutes,
      amountEtb: data.amountEtb,
      bankId: data.bankId,
      bankName: bank ? bank.name : data.bankId,
      transactionRef: data.transactionRef.trim(),
      receiptImage: data.receiptImage,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      idempotencyKey: `tx-${data.transactionRef.trim()}-${Date.now()}`,
    };

    setPayments((prev) => [newPayment, ...prev]);
    triggerHaptic('success');
    return { success: true, message: 'تم رفع إشعار التحويل بنجاح، سيتم تدقيق العملية وإضافة الدقائق فوراً.' };
  };

  const requestEmergencyLoan = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) {
      return { success: false, message: 'الطالب غير موجود' };
    }

    if (student.emergencyLoanUsed) {
      return { success: false, message: 'لقد استفدت مسبقاً من سلفة الطوارئ، يُرجى شحن باقة للاستمرار' };
    }

    const loanMinutes = 15;
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
    const formattedTimestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const loanEntry: AuditLedgerEntry = {
      id: `led-loan-${Date.now()}`,
      timestamp: formattedTimestamp,
      studentId: student.id,
      studentCode: student.code,
      studentName: student.fullName,
      teacherEmail: SUPERVISOR_EMAIL,
      teacherName: 'النظام الآلي - سلفة طوارئ',
      minutesDelta: loanMinutes,
      balanceBefore,
      balanceAfter,
      type: 'emergency_loan',
      notes: 'منح سلفة طوارئ (15 دقيقة) لمرة واحدة لإكمال الورد القرآني لحين تأكيد شحن الباقة',
    };

    setLedger((prev) => [loanEntry, ...prev]);
    triggerHaptic('success');

    return {
      success: true,
      message: 'تم تفعيل سلفة الطوارئ (15 دقيقة) بنجاح! نسأل الله لك التوفيق في تلاوتك.',
    };
  };

  const loginSupervisor = (email: string, pass: string): boolean => {
    // Check email
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail === SUPERVISOR_EMAIL.toLowerCase()) {
      setIsSupervisor(true);
      triggerHaptic('success');
      return true;
    }
    return false;
  };

  const logoutSupervisor = () => {
    setIsSupervisor(false);
    triggerHaptic('light');
  };

  const getStudentByCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    return students.find((s) => s.code.toUpperCase() === clean);
  };

  const resetDataToDemo = () => {
    setStudents(INITIAL_STUDENTS);
    setPayments(INITIAL_PAYMENTS);
    setLedger(INITIAL_LEDGER);
    setCurrentStudent(INITIAL_STUDENTS[0]);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.LEDGER);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT);
  };

  return (
    <AppContext.Provider
      value={{
        students,
        payments,
        ledger,
        currentStudent,
        setCurrentStudent,
        isSupervisor,
        supervisorEmail: isSupervisor ? SUPERVISOR_EMAIL : null,
        loginSupervisor,
        logoutSupervisor,
        registerStudent,
        deductMinutes,
        approvePayment,
        rejectPayment,
        submitPayment,
        requestEmergencyLoan,
        getStudentByCode,
        activeTab,
        setActiveTab,
        resetDataToDemo,
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
