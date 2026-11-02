export type Gender = 'male' | 'female';

export type ShiftId = 'morning' | 'evening' | 'night';

export type ProgramId = 'talqeen' | 'hifz' | 'ijazah';

export interface ShiftInfo {
  id: ShiftId;
  title: string;
  time: string;
  description: string;
}

export interface ProgramInfo {
  id: ProgramId;
  title: string;
  badge: string;
  description: string;
}

export interface Student {
  id: string;
  code: string; // e.g., IM-1001 or IF-1001
  fullName: string;
  telegramHandle: string; // e.g., @username or phone
  phone: string;
  country: string;
  program: ProgramId;
  gender: Gender;
  shift: ShiftId;
  balanceMinutes: number;
  emergencyLoanUsed: boolean;
  emergencyLoanDue: number; // 15 when borrowed
  registeredAt: string;
  telegramGroupLink: string;
}

export interface MinutePackage {
  id: string;
  minutes: number;
  priceEtb: number;
  tag?: string;
  popular?: boolean;
}

export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  accountHolder: string;
  badgeColor: string;
  logoText: string;
  transferGuide?: string;
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentTransaction {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  packageMinutes: number;
  amountEtb: number;
  bankId: string;
  bankName: string;
  transactionRef: string;
  receiptImage: string; // Base64 or placeholder URL
  status: PaymentStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  idempotencyKey: string;
}

export type LedgerEntryType = 'session_deduction' | 'package_credit' | 'emergency_loan' | 'loan_repayment';

export interface AuditLedgerEntry {
  id: string;
  timestamp: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  teacherEmail: string;
  teacherName: string;
  minutesDelta: number; // negative for deduction, positive for credit
  balanceBefore: number;
  balanceAfter: number;
  type: LedgerEntryType;
  notes?: string;
  messageText?: string;
}
