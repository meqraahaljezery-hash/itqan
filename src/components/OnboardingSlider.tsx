import React, { useState } from 'react';
import {
  BookOpen,
  Award,
  Sparkles,
  Users,
  Compass,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { ACADEMY_NAME, ACADEMY_SHORT_NAME } from '../constants';
import { triggerHaptic } from '../utils/telegram';

interface OnboardingSliderProps {
  onComplete: () => void;
}

interface SlideItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: React.ReactNode;
  highlights: string[];
  quote?: string;
}

export const OnboardingSlider: React.FC<OnboardingSliderProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: SlideItem[] = [
    {
      id: 1,
      badge: 'التعريف بالصرح القرآني',
      title: 'مقرأة الإمام الجزري للإقراء والإجازة بالسند',
      subtitle: 'صرح إلكتروني عالمي للإقراء والإجازة بالسند المتصل',
      description:
        'منصة تعليمية قرآنية رائدة مستوحاة من منهج إمام المقرئين «محمد بن الجزري الشافعي» رحمه الله، تُعنى بتعليم القرآن الكريم، وضبط أحكام التلاوة والتجويد، وتلقين الأداء غضاً طرياً كما أُنزل.',
      icon: <BookOpen className="w-12 h-12 text-amber-300" />,
      highlights: [
        'إقراء مباشر فردي بنظام الدقائق المعتمدة',
        'نخبة من كبار المشايخ والمقرئين المسندين',
        'متابعة حية ودقيقة لكل طالب عبر بث مباشر',
      ],
      quote: '«خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ» — حديث شريف',
    },
    {
      id: 2,
      badge: 'الرؤية والرسالة',
      title: 'رسالة المقرأة وأهدافها',
      subtitle: 'تخريج جيل متقن ماهر بكتاب الله تعالى',
      description:
        'نسعى لنشر التلاوة الصحيحة المتقنة في أرجاء العالم الإسلامي، وتيسير الإقراء على الراغبين بأساليب عصرية مرنة تحافظ على أصالة السند النبوي الشريف ودقة الرواية.',
      icon: <Compass className="w-12 h-12 text-amber-300" />,
      highlights: [
        'تصحيح مخارج الحروف وصفاتها بدقة متناهية',
        'تأهيل حفظة كتاب الله لحمل أمانة الإقراء',
        'إتاحة التعليم القرآني للجميع أينما كانوا',
      ],
      quote: '«الْمَاهِرُ بِالْقُرْآنِ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ»',
    },
    {
      id: 3,
      badge: 'المسار الأول',
      title: 'برامج التلقين وتصحيح الأداء',
      subtitle: 'تأسيس متين على أيدي شيوخ متقنين',
      description:
        'جلسات فردية مباشرة لتصحيح التلاوة وتلقين أحكام التجويد من المبتدئ إلى المتقدم، مع التطبيق العملي الدقيق لأحكام النون والميم والمدود ومخارج الحروف العربية الفصيحة.',
      icon: <Sparkles className="w-12 h-12 text-amber-300" />,
      highlights: [
        'معالجة اللحن الجلي والخفي بدقة',
        'تلقين مرن يناسب جدول ووقت الطالب',
        'تقييم فوري لكل جلسة تلاوة',
      ],
    },
    {
      id: 4,
      badge: 'المسار الثاني',
      title: 'برامج الحفظ المكثف',
      subtitle: 'تثبيت الأصول واستظهار المتشابهات',
      description:
        'مسار مخصص للراغبين في حفظ كتاب الله تعالى كاملاً أو أجزاء منه، مع المتابعة اليومية المنتظمة وتثبيت المتشابهات اللفظية وفق خطط زمنية مدروسة مع المقرئ.',
      icon: <Clock className="w-12 h-12 text-amber-300" />,
      highlights: [
        'خطط حفظ يومية وأسبوعية محكمة',
        'مراجعة دورية للأرباع والأحزاب السابقة',
        'امتحانات مرحلية للتأكد من قوة الحفظ',
      ],
    },
    {
      id: 5,
      badge: 'المسار العالي',
      title: 'الإجازة بالسند المتصل',
      subtitle: 'سند عالٍ متصل إلى رسول الله ﷺ',
      description:
        'ختمة كاملة متقنة من سورة الفاتحة إلى سورة الناس عن ظهر قلب برواية حفص عن عاصم، أو القراءات السبع، لمنح إجازة مسندة إلى النبي ﷺ بشروطها المعتبرة لدى أهل الأداء.',
      icon: <Award className="w-12 h-12 text-amber-300" />,
      highlights: [
        'سند متصل بالسماع والعرض والتحقيق',
        'دراسة متون التجويد المعتمدة (الجزرية والتحفة)',
        'شهادة رسمية موثقة بإجازة الإقراء',
      ],
    },
    {
      id: 6,
      badge: 'خطوات البدء',
      title: 'كيف تبدأ رحلتك القرآنية؟',
      subtitle: 'خطوات بسيطة وسريعة للانضمام للمقرأة',
      description:
        'اختر برنامجك المناسب، وسجل بياناتك ليتم توليد كودك الأكاديمي، ثم اشحن باقة الدقائق المناسبة وادخل إلى حلقة التسميع المباشرة مع شيخك على الفور.',
      icon: <ShieldCheck className="w-12 h-12 text-amber-300" />,
      highlights: [
        '١. ملء طلب التسجيل واختيار الفترة المناسبة',
        '٢. شحن رصيد الدقائق عبر الحسابات البنكية المعتمدة',
        '٣. الدخول للبث المباشر وبدء التلاوة واحتساب الدقائق',
      ],
      quote: 'وفقك الله لتكون من أهل القرآن وخاصته',
    },
  ];

  const current = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      triggerHaptic('success');
      onComplete();
    } else {
      triggerHaptic('light');
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      triggerHaptic('light');
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    triggerHaptic('light');
    onComplete();
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-[#fdfbf7] rounded-3xl shadow-2xl border-2 border-amber-300/80 overflow-hidden my-auto flex flex-col">
        {/* Top bar with Skip button and Indicator */}
        <div className="bg-[#022c22] px-6 py-4 flex items-center justify-between text-white border-b border-emerald-900/60">
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-bold text-amber-300">
              {ACADEMY_SHORT_NAME}
            </span>
            <span className="text-[11px] text-emerald-300/80">
              (الصفحة {currentSlide + 1} من {slides.length})
            </span>
          </div>

          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-emerald-200 hover:text-white bg-emerald-900/60 hover:bg-emerald-800 px-3 py-1.5 rounded-xl transition"
          >
            تخطي والبدء مباشرة ✕
          </button>
        </div>

        {/* Slide Content */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
          {/* Visual header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 inline-block">
                {current.badge}
              </span>

              {/* Progress Dots */}
              <div className="flex items-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentSlide
                        ? 'w-7 bg-emerald-800'
                        : 'w-2 bg-stone-300 hover:bg-stone-400'
                    }`}
                    aria-label={`الانتقال إلى الصفحة ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#064e3b] to-[#022c22] flex items-center justify-center shrink-0 shadow-lg border border-amber-400/40">
                {current.icon}
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-emerald-950 font-serif">
                  {current.title}
                </h3>
                <p className="text-xs sm:text-sm text-amber-800 font-bold mt-0.5">
                  {current.subtitle}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-stone-700 font-normal pt-1">
              {current.description}
            </p>
          </div>

          {/* Highlights points */}
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 space-y-2">
            <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>أبرز مميزات هذا المسار:</span>
            </h4>
            <div className="space-y-1.5 text-xs text-stone-800">
              {current.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {current.quote && (
            <div className="text-center font-serif text-xs text-emerald-900/90 italic bg-amber-50/60 p-2.5 rounded-xl border border-amber-200">
              {current.quote}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-200">
            {currentSlide > 0 ? (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 ${
                isLast
                  ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-stone-950 font-black ring-2 ring-amber-300'
                  : 'bg-emerald-900 hover:bg-emerald-800 text-white'
              }`}
            >
              <span>{isLast ? 'ابدأ رحلتك القرآنية الآن' : 'التالي'}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
