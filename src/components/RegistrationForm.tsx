import React, { useState } from 'react';
import {
  User,
  Send,
  Phone,
  Globe,
  BookOpen,
  Clock,
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronLeft,
  ArrowRight,
  Shield,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { PROGRAMS, SHIFTS, getTelegramGroupLink } from '../constants';
import { Gender, ProgramId, ShiftId, Student } from '../types';
import { triggerHaptic } from '../utils/telegram';

const COUNTRIES = [
  'إثيوبيا (Ethiopia)',
  'المملكة العربية السعودية',
  'جمهورية مصر العربية',
  'الإمارات العربية المتحدة',
  'قطر',
  'الكويت',
  'عمان',
  'اليمن',
  'السودان',
  'الصومال',
  'جيبوتي',
  'كينيا',
  'المملكة المتحدة',
  'الولايات المتحدة الأمريكية',
  'كندا',
  'دولة أخرى...',
];

export const RegistrationForm: React.FC = () => {
  const { registerStudent, students, setActiveTab } = useApp();

  const [fullName, setFullName] = useState('');
  const [telegramHandle, setTelegramHandle] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('إثيوبيا (Ethiopia)');
  const [customCountry, setCustomCountry] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [program, setProgram] = useState<ProgramId>('talqeen');
  const [shift, setShift] = useState<ShiftId>('morning');

  const [registeredResult, setRegisteredResult] = useState<Student | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Compute live expected preview code
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
  const previewCode = `${prefix}-${maxNumber + 1}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) return;

    const finalCountry = country === 'دولة أخرى...' && customCountry.trim() ? customCountry.trim() : country;

    const newStudent = registerStudent({
      fullName,
      telegramHandle: telegramHandle.startsWith('@') ? telegramHandle : `@${telegramHandle.replace(/\s+/g, '')}`,
      phone,
      country: finalCountry,
      program,
      gender,
      shift,
    });

    setRegisteredResult(newStudent);

    // Festive confetti for joining the Quran Academy
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#064e3b', '#10b981', '#f59e0b', '#d97706', '#fef08a'],
      });
    } catch {
      // ignore
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    triggerHaptic('light');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    triggerHaptic('light');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // If newly registered, display the successful registration & digital card
  if (registeredResult) {
    const groupInfo = getTelegramGroupLink(registeredResult.gender, registeredResult.shift);

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        <div className="bg-[#fdfbf7] rounded-3xl shadow-xl border-2 border-emerald-800/20 overflow-hidden relative">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#064e3b] via-[#043e2f] to-[#022c22] p-6 text-white text-center relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400 text-stone-900 shadow-lg mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-200">
              مرحباً بك في رحاب أهل القرآن
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-md mx-auto">
              تم تسجيلك بنجاح وتوليد كودك التعريفي الفريد. يُرجى حفظ الكود والانضمام لمجموعة التيليجرام الخاصة بك.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Student ID Card Visual */}
            <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-[#022c22] rounded-2xl p-5 text-white shadow-lg border border-amber-400/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 rounded-full bg-amber-400/10 blur-xl"></div>
              <div className="flex items-center justify-between border-b border-emerald-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-sm">
                    {registeredResult.gender === 'male' ? 'ذكر' : 'أنثى'}
                  </div>
                  <div>
                    <div className="text-[11px] text-emerald-200">بطاقة الطالب الرقمية</div>
                    <div className="font-bold text-sm sm:text-base text-white">{registeredResult.fullName}</div>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-[10px] text-amber-300 uppercase tracking-wider block">الكود الفريد</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 tracking-wider">
                      {registeredResult.code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(registeredResult.code)}
                      className="p-1 rounded-md bg-emerald-700/80 hover:bg-emerald-600 text-white transition active:scale-90"
                      title="نسخ الكود"
                    >
                      {copiedCode ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-700/30">
                  <span className="text-emerald-300/80 block text-[11px]">البرنامج التعليمي:</span>
                  <span className="font-semibold text-white">
                    {PROGRAMS.find((p) => p.id === registeredResult.program)?.title}
                  </span>
                </div>
                <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-700/30">
                  <span className="text-emerald-300/80 block text-[11px]">الفترة والموعد:</span>
                  <span className="font-semibold text-white">
                    {SHIFTS.find((s) => s.id === registeredResult.shift)?.title}
                  </span>
                </div>
              </div>
            </div>

            {/* Telegram Group Direct Invitation */}
            <div className="bg-sky-50 rounded-2xl p-5 border border-sky-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Send className="w-5 h-5 -rotate-12" />
                </div>
                <div className="space-y-1 grow">
                  <h3 className="font-bold text-sky-950 text-sm sm:text-base">
                    رابط مجموعة التيليجرام الخاصة بحلقتك
                  </h3>
                  <p className="text-xs text-sky-800 leading-relaxed">
                    هنا يُقام بث التسميع المباشر اليومي مع الشيخ في موعد فترتك التعليمية. انضم الآن وعرّف بنفسك بكودك:
                    <strong className="text-emerald-800 font-mono mx-1 font-bold">({registeredResult.code})</strong>
                  </p>

                  <div className="pt-3 flex flex-wrap gap-2">
                    <a
                      href={groupInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95"
                    >
                      <span>الانضمام للمجموعة المباشرة</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => handleCopyLink(groupInfo.url)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-sky-300 bg-white hover:bg-sky-100 text-sky-800 text-xs font-semibold transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedLink ? 'تم نسخ الرابط!' : 'نسخ الرابط'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setActiveTab('student_portal')}
                className="grow flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold text-sm shadow-md transition active:scale-98"
              >
                <span>الانتقال لبوابة الطالب وشحن الرصيد</span>
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setRegisteredResult(null)}
                className="py-3 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium text-xs transition"
              >
                تسجيل طالب آخر
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      {/* Intro Heading */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300/80 text-amber-900 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>استمارة التسجيل الذكية والترميز الآلي</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-black text-emerald-950 font-serif">
          تسجيل طالب جديد في المقرأة
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto mt-1">
          اختر برنامجك التعليمي وفترتك المناسبة لتوليد كودك الأكاديمي والحصول على رابط حلقة التسميع فوراً.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-stone-200/80 p-5 sm:p-8 space-y-6">
        
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-emerald-900 border-b border-emerald-100 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-700" />
            <span>١. البيانات الشخصية وبيانات التواصل</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                الاسم الكامل ثلاثياً <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: عبد الله بن محمد الأحمد"
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-sm bg-stone-50/50"
                />
                <User className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
              </div>
            </div>

            {/* Telegram Handle */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                معرف التيليجرام أو رقم الحساب <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={telegramHandle}
                  onChange={(e) => setTelegramHandle(e.target.value)}
                  placeholder="مثال: @username أو رقم الهاتف"
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-sm bg-stone-50/50 text-left font-mono"
                  dir="ltr"
                />
                <Send className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
              </div>
              <span className="text-[10px] text-stone-500 mt-1 block">ضروري جداً للمتابعة وإرسال إشعار الدقائق اليومي</span>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                رقم الهاتف (واتساب / اتصال) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثال: +251 91 234 5678"
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-sm bg-stone-50/50 text-left font-mono"
                  dir="ltr"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                بلد الإقامة <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-sm bg-stone-50/50 text-stone-800"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <Globe className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
              </div>
              {country === 'دولة أخرى...' && (
                <input
                  type="text"
                  required
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                  placeholder="اكتب اسم دولتك هنا..."
                  className="w-full mt-2 px-3 py-2 rounded-xl border border-stone-300 text-sm"
                />
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Gender & Automatic Code Generation */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
            <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-700" />
              <span>٢. الجنس ونظام الترميز الآلي</span>
            </h3>
            <div className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-mono font-bold border border-amber-300">
              الكود التلقائي: {previewCode}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Male */}
            <label
              className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                gender === 'male'
                  ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                  : 'border-stone-200 hover:border-emerald-300 bg-stone-50/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === 'male'}
                  onChange={() => setGender('male')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="block text-sm font-bold text-stone-900">ذكر (طالب)</span>
                  <span className="text-[11px] text-stone-500">كود يبدأ بـ <strong className="text-emerald-700 font-mono">IM-</strong></span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 bg-white rounded-lg border border-stone-200 text-emerald-800">
                IM-xxxx
              </span>
            </label>

            {/* Female */}
            <label
              className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                gender === 'female'
                  ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                  : 'border-stone-200 hover:border-emerald-300 bg-stone-50/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === 'female'}
                  onChange={() => setGender('female')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="block text-sm font-bold text-stone-900">أنثى (طالبة)</span>
                  <span className="text-[11px] text-stone-500">كود يبدأ بـ <strong className="text-purple-700 font-mono">IF-</strong></span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 bg-white rounded-lg border border-stone-200 text-purple-800">
                IF-xxxx
              </span>
            </label>
          </div>
        </div>

        {/* Section 3: Educational Program Selection */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-emerald-900 border-b border-emerald-100 pb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>٣. اختيار البرنامج التعليمي</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PROGRAMS.map((prog) => {
              const isSelected = program === prog.id;
              return (
                <div
                  key={prog.id}
                  onClick={() => setProgram(prog.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50/70 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isSelected ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-700'}`}>
                        {prog.badge}
                      </span>
                      <input
                        type="radio"
                        name="program"
                        checked={isSelected}
                        onChange={() => setProgram(prog.id)}
                        className="w-4 h-4 text-emerald-700"
                      />
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 leading-snug">{prog.title}</h4>
                    <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                      {prog.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Shifts Selection */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-emerald-900 border-b border-emerald-100 pb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>٤. اختيار الفترة التعليمية (الحلقة المباشرة)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SHIFTS.map((s) => {
              const isSelected = shift === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setShift(s.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-700 bg-amber-50/60 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-stone-900">{s.title}</span>
                    <input
                      type="radio"
                      name="shift"
                      checked={isSelected}
                      onChange={() => setShift(s.id)}
                      className="w-4 h-4 text-emerald-700"
                    />
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-800 bg-white/80 px-2 py-0.5 rounded-md inline-block border border-stone-200 my-1">
                    {s.time}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">{s.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-base shadow-lg shadow-emerald-900/20 transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <span>إتمام التسجيل وتوليد الكود الآلي</span>
            <ArrowRight className="w-5 h-5 -scale-x-100" />
          </button>
          <p className="text-center text-[11px] text-stone-500 mt-2">
            سيتم منحك الكود الرسمي ورابط البث المباشر فور الضغط على الزر أعلاه.
          </p>
        </div>
      </form>
    </div>
  );
};
