export type UserRole = 'admin' | 'supervisor' | 'reciter' | 'student';

export type Gender = 'male' | 'female';

export type ShiftId = 'morning' | 'evening' | 'night';

export type SessionRating = 'excellent' | 'very_good' | 'good' | 'acceptable' | 'weak';

export type HifzLevel = 'less_than_5' | 'less_than_10' | 'less_than_20' | 'full_quran';

export type TilawaLevel = 'beginner' | 'intermediate' | 'advanced' | 'needs_correction' | 'fluent';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  gender: Gender;
  phone: string;
  country: string;
  city?: string;
  studentCode?: string; // e.g. IM-1001 or IF-1001
  avatarUrl?: string;
  isGoogleAccount?: boolean;
  notificationsEnabled?: boolean;
  createdAt: string;
}

export interface ProgramItem {
  id: string;
  title: string;
  badge: string;
  description: string;
  duration?: string;
  requirements?: string;
  status: 'active' | 'inactive';
}

export interface ShiftInfo {
  id: ShiftId;
  title: string;
  time: string;
  description: string;
}

export interface RegistrationRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  age: number;
  gender: Gender;
  previousHifzLevel: HifzLevel;
  tilawaLevel: TilawaLevel;
  previousMadrasa?: string;
  previousSheikh?: string;
  requestedProgramId: string;
  requestedProgramTitle: string;
  preferredShift: ShiftId;
  studentNotes?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  assignedReciterId?: string;
  assignedReciterName?: string;
  generatedCode?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface StudentRecord {
  id: string;
  profileId?: string;
  code: string; // IM-xxxx or IF-xxxx
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city?: string;
  gender: Gender;
  programId: string;
  programTitle: string;
  shift: ShiftId;
  balanceMinutes: number;
  emergencyLoanUsed: boolean;
  emergencyLoanDue: number; // 15 when loan active
  status: 'active' | 'frozen' | 'suspended';
  assignedReciterId?: string;
  assignedReciterName?: string;
  registeredAt: string;
  telegramGroupLink?: string;
}

export interface ReadingSession {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  reciterId: string;
  reciterName: string;
  programTitle: string;
  surahNumber: number;
  surahName: string;
  fromAyah: number;
  toAyah: number;
  minutesConsumed: number;
  sessionDate: string; // YYYY-MM-DD
  sessionTime: string; // HH:mm
  rating: SessionRating;
  notes?: string;
  balanceBefore: number;
  balanceAfter: number;
  messageText?: string;
  createdAt: string;
}

export type TransactionType =
  | 'session_deduction'
  | 'package_credit'
  | 'emergency_loan'
  | 'loan_repayment'
  | 'bonus'
  | 'admin_adjustment';

export interface AuditLedgerEntry {
  id: string;
  timestamp: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  performerEmail: string;
  performerName: string;
  minutesDelta: number; // Negative for deductions, positive for credits
  balanceBefore: number;
  balanceAfter: number;
  type: TransactionType;
  referenceId?: string;
  notes?: string;
  messageText?: string;
}

export interface MinutePackage {
  id: string;
  name: string;
  minutes: number;
  priceEtb: number;
  tag?: string;
  description?: string;
  status: 'active' | 'inactive';
  popular?: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  accountNumber: string;
  accountHolder: string;
  badgeColor: string;
  logoText: string;
  instructions: string;
  currency: string;
  status: 'active' | 'inactive';
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentRequest {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  packageId: string;
  packageName: string;
  packageMinutes: number;
  amountEtb: number;
  paymentMethodId: string;
  paymentMethodName: string;
  senderName: string;
  senderPhone: string;
  transactionRef: string;
  receiptImage: string; // Base64 or image URL
  status: PaymentStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  idempotencyKey: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  targetRole: 'all' | 'students' | 'reciters';
  status: 'published' | 'draft' | 'archived';
  publishedBy: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string; // studentId or 'admin' or 'all'
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  recipientName: string;
  content: string;
  createdAt: string;
}

export interface TelegramLinksSettings {
  maleMorningUrl: string;
  maleEveningUrl: string;
  maleNightUrl: string;
  femaleMorningUrl: string;
  femaleEveningUrl: string;
  femaleNightUrl: string;
  announcementsChannelUrl: string;
  supervisorDirectContact: string;
}

export interface PlatformSettings {
  academyName: string;
  platformName: string;
  logoText: string;
  description: string;
  officialEmail: string;
  officialPhone: string;
  defaultCurrency: string;
  defaultCountry: string;
  defaultTimezone: string;
  lowBalanceThreshold: number;
  emergencyLoanMinutes: number;
  telegramLinks?: TelegramLinksSettings;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  duration?: number;
}
