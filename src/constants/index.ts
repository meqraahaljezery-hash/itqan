import { MinutePackage, PaymentMethod, ProgramItem, ShiftInfo, ShiftId, Gender, TelegramLinksSettings } from '../types';

export const ACADEMY_NAME = 'مقرأة الإمام الجزري للإقراء والإجازة بالسند';
export const ACADEMY_ENGLISH_NAME = 'Meqraah Imam Al Jezery – For Quran Recitations & Ijazah';
export const ACADEMY_SHORT_NAME = 'مقرأة الجزري';
export const SUPERVISOR_EMAIL = 'khdahd241@gmail.com';
export const SUPERVISOR_NAME = 'فضيلة الشيخ خالد أحمد مصطفى';

export const INITIAL_PROGRAMS: ProgramItem[] = [
  {
    id: 'prog-talqeen',
    title: 'التلقين وتصحيح التلاوة',
    badge: 'تأسيس وإتقان مخارج الحروف',
    description: 'جلسات فردية مع المقرئ لتصحيح التلاوة وتلقين أحكام التجويد ومخارج الحروف غضاً طرياً كما أُنزلت.',
    duration: 'مفتوح حسب رغبة الطالب',
    requirements: 'الرغبة الجادة في تصحيح اللحن وضبط مخارج الحروف العربية',
    status: 'active',
  },
  {
    id: 'prog-hifz',
    title: 'الحفظ المكثف وتثبيت المتشابهات',
    badge: 'خطة حفظ واستظهار يومي',
    description: 'تسميع يومي منتظم مع المتابعة الدقيقة لضبط الحفظ وتثبيت القرآن الكريم كاملاً مع المتشابهات اللفظية.',
    duration: 'من 6 أشهر إلى سنتين',
    requirements: 'إتقان القراءة النظرية والالتزام بالورد اليومي',
    status: 'active',
  },
  {
    id: 'prog-ijazah',
    title: 'الإجازة بالسند المتصل برواية حفص عن عاصم',
    badge: 'سند متصل إلى النبي ﷺ',
    description: 'ختمة كاملة متقنة عن ظهر قلب أو نظراً مع التحقيق والتدقيق وأداء الفرش والأصول لنيل الإجازة المعتمدة بالسند المتصل.',
    duration: 'ختمة كاملة (من الفاتحة إلى الناس)',
    requirements: 'حفظ القرآن الكريم كاملاً مع دراسة منظومة الجزرية أو تحفة الأطفال',
    status: 'active',
  },
  {
    id: 'prog-qiraat',
    title: 'القراءات السبع المتواترة',
    badge: 'علم القراءات والأصول',
    description: 'إقراء وإجازة في القراءات السبع من طريق الشاطبية إفراداً أو جمعاً لطلاب العلم المؤهلين.',
    duration: 'وفق خطة الختم والجمع',
    requirements: 'الحصول على إجازة سابقة برواية حفص عن عاصم مع حفظ متن الشاطبية',
    status: 'active',
  },
];

export const INITIAL_PACKAGES: MinutePackage[] = [
  {
    id: 'pkg-100',
    name: 'باقة التجربة والبداية',
    minutes: 100,
    priceEtb: 500,
    tag: 'بداية مباركة',
    description: 'مناسبة لجلسات التلقين الأولية واختبار المستوى مع الشيخ',
    status: 'active',
  },
  {
    id: 'pkg-200',
    name: 'الباقة المعتادة',
    minutes: 200,
    priceEtb: 1000,
    tag: 'الأكثر طلباً',
    description: 'الباقة المثالية للطلاب المنتظمين في التسميع الأسبوعي',
    status: 'active',
    popular: true,
  },
  {
    id: 'pkg-300',
    name: 'الباقة التوفيرية',
    minutes: 300,
    priceEtb: 1470,
    tag: 'وفر 30 بر',
    description: 'خصم خاص لحفظة كتاب الله وطلاب الختمات',
    status: 'active',
  },
  {
    id: 'pkg-600',
    name: 'باقة الإجازة والختمة الكبرى',
    minutes: 600,
    priceEtb: 2760,
    tag: 'أفضل قيمة (وفر 240 بر)',
    description: 'أعلى توفير مالي لطلاب الإجازة بالسند والمقرئين المكثفين',
    status: 'active',
  },
];

export const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'cbe',
    name: 'البنك التجاري الإثيوبي (CBE)',
    accountNumber: '1000285374425',
    accountHolder: 'Kalid Ahmed Mustefa',
    badgeColor: 'bg-purple-800 text-white',
    logoText: 'CBE',
    instructions: 'Commercial Bank of Ethiopia - متوفر عبر CBE Birr أو التحويل المباشر من الحساب',
    currency: 'ETB',
    status: 'active',
  },
  {
    id: 'boa',
    name: 'بنك الحبشة (Bank of Abyssinia)',
    accountNumber: '226626646',
    accountHolder: 'Kalid Ahmed Mustefa',
    badgeColor: 'bg-amber-700 text-white',
    logoText: 'BOA',
    instructions: 'Bank of Abyssinia - التحويل عبر تطبيق بنك الحبشة أو الفروع',
    currency: 'ETB',
    status: 'active',
  },
  {
    id: 'telebirr',
    name: 'تيليبير (Telebirr)',
    accountNumber: '099161372',
    accountHolder: 'Kalid Ahmed Mustefa',
    badgeColor: 'bg-blue-600 text-white',
    logoText: 'Telebirr',
    instructions: 'محفظة تيليبير السريعة - التحويل المباشر برقم الهاتف',
    currency: 'ETB',
    status: 'active',
  },
  {
    id: 'mpesa',
    name: 'إم-بيسا (M-Pesa Safaricom)',
    accountNumber: '0721009122',
    accountHolder: 'Kalid Ahmed Mustefa',
    badgeColor: 'bg-emerald-600 text-white',
    logoText: 'M-PESA',
    instructions: 'محفظة سفاريكوم إم-بيسا السريعة في إثيوبيا',
    currency: 'ETB',
    status: 'active',
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
    description: 'فترة ما بعد الظهر مناسبة للموظفين والطلاب بعد الانتهاء من العمل.',
  },
  {
    id: 'night',
    title: 'الفترة الليلية',
    time: '09:00 م - 11:00 م (21:00 - 23:00)',
    description: 'فترة المساء الهادئة لختام اليوم بورد قرآني مبارك مع الشيخ.',
  },
];

export const DEFAULT_TELEGRAM_LINKS: TelegramLinksSettings = {
  maleMorningUrl: 'https://t.me/Meqraah_Aljezery_Men_Morning',
  maleEveningUrl: 'https://t.me/Meqraah_Aljezery_Men_Evening',
  maleNightUrl: 'https://t.me/Meqraah_Aljezery_Men_Night',
  femaleMorningUrl: 'https://t.me/Meqraah_Aljezery_Women_Morning',
  femaleEveningUrl: 'https://t.me/Meqraah_Aljezery_Women_Evening',
  femaleNightUrl: 'https://t.me/Meqraah_Aljezery_Women_Night',
  announcementsChannelUrl: 'https://t.me/Meqraah_Aljezery_Official',
  supervisorDirectContact: 'https://t.me/khdahd241',
};

export function getTelegramGroupLink(
  gender: Gender,
  shift: ShiftId,
  customLinks?: TelegramLinksSettings
): { url: string; groupName: string } {
  const links = customLinks || DEFAULT_TELEGRAM_LINKS;
  const genderTitle = gender === 'male' ? 'الطلاب (رجال)' : 'الطالبات (نساء)';
  let shiftTitle = '';
  let url = '';

  if (shift === 'morning') {
    shiftTitle = 'الفترة الصباحية (09:00 - 12:00)';
    url = gender === 'male' ? links.maleMorningUrl : links.femaleMorningUrl;
  } else if (shift === 'evening') {
    shiftTitle = 'الفترة المسائية (14:00 - 15:30)';
    url = gender === 'male' ? links.maleEveningUrl : links.femaleEveningUrl;
  } else {
    shiftTitle = 'الفترة الليلية (21:00 - 23:00)';
    url = gender === 'male' ? links.maleNightUrl : links.femaleNightUrl;
  }

  const groupName = `مقرأة الإمام الجزري - ${genderTitle} - ${shiftTitle}`;
  return { url: url || 'https://t.me/Meqraah_Aljezery_Official', groupName };
}

export function generateDeductionMessage(
  studentName: string,
  minutesDeducted: number,
  balanceBefore: number,
  balanceAfter: number,
  surahName?: string,
  fromAyah?: number,
  toAyah?: number
): string {
  const surahDetail = surahName && fromAyah && toAyah 
    ? `\nمَوْضِعُ الْقِرَاءَةِ: سُورَةُ ${surahName} (الآيات ${fromAyah} - ${toAyah}).\n` 
    : '';

  return `🌿 هنيئاً لك يا أهل القرآن وخاصته 📖✨

قَرَأْتَ الْيَوْمَ مَعَ شَيْخِكَ مُدَّةَ: ${minutesDeducted} دَقِيقَةً.${surahDetail}
رَصِيدُكَ السَّابِقُ: ${balanceBefore} دَقِيقَةً.
الرَّصِيدُ الْمُتَبَقِّي لَدَيْكَ الآنَ: ${balanceAfter} دَقِيقَةً.

نسأل الله أن يتقبل تلاوتك وأن يجعلك من المهرة بالقرآن الكريم مع السفرة الكرام البررة. دعاؤنا لك بالبركة والتوفيق.`;
}
