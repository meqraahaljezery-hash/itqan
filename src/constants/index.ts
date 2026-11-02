import { BankAccount, MinutePackage, ProgramInfo, ShiftInfo, ShiftId, Gender } from '../types';

export const SUPERVISOR_EMAIL = 'khdahd241@gmail.com';
export const SUPERVISOR_NAME = 'المقرئ الشيخ خالد أحمد مصطفى';

export const MINUTE_PACKAGES: MinutePackage[] = [
  {
    id: 'pkg-100',
    minutes: 100,
    priceEtb: 500,
    tag: 'باقة التجربة والبداية',
  },
  {
    id: 'pkg-200',
    minutes: 200,
    priceEtb: 1000,
    tag: 'الباقة المعتادة',
    popular: true,
  },
  {
    id: 'pkg-300',
    minutes: 300,
    priceEtb: 1470,
    tag: 'خصم توفيري (وفر 30 بر)',
  },
  {
    id: 'pkg-600',
    minutes: 600,
    priceEtb: 2760,
    tag: 'أفضل قيمة وأعلى توفير (وفر 240 بر)',
  },
];

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'cbe',
    name: 'البنك التجاري الإثيوبي (CBE)',
    accountNumber: '1000285374425',
    accountHolder: 'Kalid Ahmed Mustefa',
    badgeColor: 'bg-purple-800 text-white',
    logoText: 'CBE',
    transferGuide: 'Commercial Bank of Ethiopia - متوفر عبر CBE Birr أو التحويل المباشر',
  },
  {
    id: 'boa',
    name: 'بنك الحبشة (Bank of Abyssinia)',
    accountNumber: '226626646',
    accountHolder: 'Kalid Ahmed Mustefa',
    badgeColor: 'bg-amber-700 text-white',
    logoText: 'BOA',
    transferGuide: 'Bank of Abyssinia - التحويل عبر تطبيق بنك الحبشة أو الفروع',
  },
  {
    id: 'telebirr',
    name: 'تيليبير (Telebirr)',
    accountNumber: '099161372',
    accountHolder: 'Kalid Ahmed Mustefa',
    badgeColor: 'bg-blue-600 text-white',
    logoText: 'Telebirr',
    transferGuide: 'محفظة تيليبير السريعة - التحويل المباشر برقم الهاتف',
  },
  {
    id: 'mpesa',
    name: 'إم-بيسا (M-Pesa Safaricom)',
    accountNumber: '0721009122',
    accountHolder: 'Kalid Ahmed Mustefa',
    badgeColor: 'bg-emerald-600 text-white',
    logoText: 'M-PESA',
    transferGuide: 'محفظة سفاريكوم إم-بيسا السريعة في إثيوبيا',
  },
];

export const PROGRAMS: ProgramInfo[] = [
  {
    id: 'talqeen',
    title: 'التلقين وتصحيح الأداء',
    badge: 'تأسيس وإتقان مخارج الحروف',
    description: 'جلسات فردية مع المقرئ لتصحيح التلاوة وتلقين أحكام التجويد ومخارج الحروف غضاً طرياً.',
  },
  {
    id: 'hifz',
    title: 'الحفظ المكثف وتثبيت المتشابهات',
    badge: 'خطة حفظ واستظهار يومي',
    description: 'تسميع يومي منتظم مع المتابعة الدقيقة لضبط الحفظ وتثبيت القرآن الكريم كاملاً.',
  },
  {
    id: 'ijazah',
    title: 'الإجازة بالسند المتصل برواية حفص عن عاصم',
    badge: 'سند متصل إلى النبي ﷺ',
    description: 'ختمة كاملة متقنة عن ظهر قلب أو نظراً مع التحقيق والتدقيق لنيل الإجازة بالسند المتصل.',
  },
];

export const SHIFTS: ShiftInfo[] = [
  {
    id: 'morning',
    title: 'الفترة الصباحية',
    time: '09:00 ص - 12:00 م',
    description: 'فترة باكرة لصفاء الذهن واستفتاح اليوم بتلاوة كتاب الله.',
  },
  {
    id: 'evening',
    title: 'الفترة المسائية',
    time: '02:00 م - 03:30 م (14:00 - 15:30)',
    description: 'فترة ما بعد الظهر مناسبة لمن لديهم التزامات صباحية.',
  },
  {
    id: 'night',
    title: 'الفترة الليلية',
    time: '09:00 م - 11:00 م (21:00 - 23:00)',
    description: 'فترة المساء الهادئة لختام اليوم بورد قرآني مبارك.',
  },
];

export function getTelegramGroupLink(gender: Gender, shift: ShiftId): { url: string; groupName: string } {
  const genderTitle = gender === 'male' ? 'الطلاب (رجال)' : 'الطالبات (نساء)';
  let shiftTitle = '';
  let shiftSlug = '';

  if (shift === 'morning') {
    shiftTitle = 'الفترة الصباحية (09:00 - 12:00)';
    shiftSlug = 'morning';
  } else if (shift === 'evening') {
    shiftTitle = 'الفترة المسائية (14:00 - 15:30)';
    shiftSlug = 'evening';
  } else {
    shiftTitle = 'الفترة الليلية (21:00 - 23:00)';
    shiftSlug = 'night';
  }

  const groupName = `مقرأة الإتقان - ${genderTitle} - ${shiftTitle}`;
  const genderPrefix = gender === 'male' ? 'ikwan' : 'akhwat';
  const url = `https://t.me/+Moqraa_${genderPrefix}_${shiftSlug}`;

  return { url, groupName };
}

/**
 * Generate official deduction notification message text
 */
export function generateDeductionMessage(
  studentName: string,
  minutesDeducted: number,
  balanceBefore: number,
  balanceAfter: number
): string {
  return `🌿 هنيئاً لك يا أهل القرآن وخاصته 📖✨

قَرَأْتَ الْيَوْمَ مَعَ شَيْخِكَ مُدَّةَ: ${minutesDeducted} دَقِيقَةً.
رَصِيدُكَ السَّابِقُ: ${balanceBefore} دَقِيقَةً.
الرَّصِيدُ الْمُتَبَقِّي لَدَيْكَ الآنَ: ${balanceAfter} دَقِيقَةً.

نسأل الله أن يتقبل تلاوتك وأن يجعلك من المهرة بالقرآن الكريم مع السفرة الكرام البررة. دعاؤنا لك بالبركة والتوفيق.`;
}
