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
import { SHIFTS, getTelegramGroupLink, ACADEMY_NAME, ACADEMY_SHORT_NAME } from '../constants';
import { Gender, ShiftId, RegistrationRequest } from '../types';
import { triggerHaptic } from '../utils/telegram';

interface RegistrationFormProps {
  onGoToPortal: () => void;
}

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

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onGoToPortal }) => {
  const { submitRegistrationRequest, students, programs } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [telegramHandle, setTelegramHandle] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('إثيوبيا (Ethiopia)');
  const [customCountry, setCustomCountry] = useState('');
  const [city, setCity] = useState('');
  const [age, setAge] = useState<number>(24);
  const [gender, setGender] = useState<Gender>('male');
  const [programId, setProgramId] = useState<string>(programs[0]?.id || 'prog-talqeen');
  const [shift, setShift] = useState<ShiftId>('morning');
  const [studentNotes, setStudentNotes] = useState('');

  const [registeredResult, setRegisteredResult] = useState<RegistrationRequest | null>(null);
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

    const finalCountry =
      country === 'دولة أخرى...' && customCountry.trim() ? customCountry.trim() : country;
    const selectedProgram = programs.find((p) => p.id === programId) || programs[0];

    const result = submitRegistrationRequest({
      fullName: fullName.trim(),
      email: email.trim() || `${Date.now()}@jezery.quran`,
      phone: phone.trim(),
      country: finalCountry,
      city: city.trim() || 'العاصمة',
      age: Number(age) || 20,
      gender,
      previousHifzLevel: 'less_than_10',
      tilawaLevel: 'intermediate',
      requestedProgramId: selectedProgram.id,
      requestedProgramTitle: selectedProgram.title,
      preferredShift: shift,
      studentNotes,
    });

    setRegisteredResult(result);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#064e3b', '#10b981', '#f59e0b', '#d97706', '#fef08a'],
      });
    } catch {}
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

  if (registeredResult) {
    const groupInfo = getTelegramGroupLink(registeredResult.gender, registeredResult.preferredShift);

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        <div className="bg-[#fdfbf7] rounded-3xl shadow-xl border-2 border-emerald-800/20 overflow-hidden relative">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#064e3b] via-[#043e2f] to-[#022c22] p-6 text-white text-center relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400 text-stone-900 shadow-lg mb-3">
              <Clock className="w-8 h-8 text-emerald-950" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-200">
              بَارَكَ اللَّـهُ فِيكَ وَنَفَعَ بِكَ
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-md mx-auto">
              تم استلام طلب تسجيلك بنجاح في {ACADEMY_NAME}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Elegant Pending Notice */}
            <div className="bg-amber-50 rounded-2xl p-5 border-2 border-amber-300/80 text-amber-950 text-right space-y-3">
              <div className="flex items-center gap-2.5 font-bold text-sm text-amber-900">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                <span>طلبك الآن قيد المراجعة والتدقيق وبانتظار اعتماد فضيلة الشيخ المشرف العام</span>
              </div>
              <p className="text-xs text-amber-900/90 leading-relaxed font-serif">
                «حِرْصاً على ضَبْطِ الحَلَقَاتِ القُرْآنِيَّةِ وَجَوْدَةِ الإِقْرَاءِ بِالسَّنَدِ المُتَّصِلِ، تُعْرَضُ جَمِيعُ طَلَبَاتِ الانْضِمَامِ عَلَى فَضِيلَةِ الشَّيْخِ المُشْرِفِ العَامِّ للاعْتِمَادِ. سَيَصِلُكَ إِشْعَارٌ فَوْرَ المُوافَقَةِ عَلَى طَلَبِكَ وَتَفْعِيلِ مَحْفَظَتِكَ وَإِتَاحَةِ رَابِطِ حَلْقَتِكَ الخَاصَّةِ».
              </p>
            </div>

            {/* Application Summary Card */}
            <div className="bg-white rounded-2xl p-5 text-stone-800 shadow-sm border border-stone-200 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <span className="text-[10px] text-stone-500 block">اسم الطالب المسجل:</span>
                  <span className="font-bold text-sm text-emerald-950">{registeredResult.fullName}</span>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-stone-500 block">الكود الأكاديمي المقترح:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-base font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      {registeredResult.generatedCode}
                    </span>
                    <button
                      onClick={() => handleCopyCode(registeredResult.generatedCode!)}
                      className="p-1 rounded-md hover:bg-stone-100 text-stone-500 transition"
                      title="نسخ الكود"
                    >
                      {copiedCode ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <span className="text-stone-500 block text-[11px]">البرنامج المختار:</span>
                  <span className="font-semibold text-emerald-950">
                    {registeredResult.requestedProgramTitle}
                  </span>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <span className="text-stone-500 block text-[11px]">الفترة والموعد:</span>
                  <span className="font-semibold text-emerald-950">
                    {SHIFTS.find((s) => s.id === registeredResult.preferredShift)?.title}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 text-stone-500">
                <span>حالة الطلب:</span>
                <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3 animate-pulse" />
                  <span>بانتظار موافقة المشرف</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onGoToPortal}
                className="grow flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-98"
              >
                <span>الذهاب لبوابة الطالب ومتابعة الحساب</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRegisteredResult(null)}
                className="py-3 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs transition"
              >
                تسجيل طلب آخر
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      {/* Heading */}
      <div className="text-center mb-6 space-y-2">
        <div className="flex items-center justify-center gap-2">
          <img
            src="/assets/branding/app-icon.png"
            alt="شعار المقرأة"
            className="w-12 h-12 rounded-2xl object-cover shadow-md border border-emerald-900/30"
          />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300/80 text-amber-900 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>استمارة التسجيل الذكية والترميز الآلي</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-emerald-950 font-serif">
          تسجيل طالب جديد في {ACADEMY_NAME}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
          اختر مسارك القرآني وفترتك التعليمية المناسبة لحجز مقعدك وتوليد كودك الأكاديمي فوراً.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-stone-200/80 p-5 sm:p-8 space-y-6">
        
        {/* Section 1: Basic Personal Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-emerald-900 border-b border-emerald-100 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-700" />
            <span>١. البيانات الشخصية وبيانات التواصل</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                الاسم الكامل ثلاثياً <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثال: عبد الله بن محمد الأحمد"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-700 text-sm bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                معرف التيليجرام أو رقم الحساب <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={telegramHandle}
                onChange={(e) => setTelegramHandle(e.target.value)}
                placeholder="مثال: @username أو رقم الهاتف"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-700 text-sm bg-stone-50/50 text-left font-mono"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                رقم الهاتف (واتساب / اتصال) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثال: +251 91 234 5678"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-700 text-sm bg-stone-50/50 text-left font-mono"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                بلد الإقامة <span className="text-red-500">*</span>
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-700 text-sm bg-stone-50/50 text-stone-800"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Gender & Auto Code Preview */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
            <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-700" />
              <span>٢. الجنس ونظام الترميز الآلي</span>
            </h3>
            <div className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-mono font-bold border border-amber-300">
              الكود المتوقع: {previewCode}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                gender === 'male'
                  ? 'border-emerald-700 bg-emerald-50/80 shadow-xs'
                  : 'border-stone-200 bg-stone-50/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === 'male'}
                  onChange={() => setGender('male')}
                  className="w-4 h-4 text-emerald-700"
                />
                <div>
                  <span className="block text-sm font-bold text-stone-900">ذكر (طالب)</span>
                  <span className="text-[11px] text-stone-500">كود يبدأ بـ <strong className="text-emerald-800 font-mono">IM-</strong></span>
                </div>
              </div>
            </label>

            <label
              className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                gender === 'female'
                  ? 'border-emerald-700 bg-emerald-50/80 shadow-xs'
                  : 'border-stone-200 bg-stone-50/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === 'female'}
                  onChange={() => setGender('female')}
                  className="w-4 h-4 text-emerald-700"
                />
                <div>
                  <span className="block text-sm font-bold text-stone-900">أنثى (طالبة)</span>
                  <span className="text-[11px] text-stone-500">كود يبدأ بـ <strong className="text-purple-800 font-mono">IF-</strong></span>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Section 3: Educational Program */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-emerald-900 border-b border-emerald-100 pb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>٣. اختيار البرنامج القرآني</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {programs.map((prog) => {
              const isSelected = programId === prog.id;
              return (
                <div
                  key={prog.id}
                  onClick={() => setProgramId(prog.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50/80 shadow-xs'
                      : 'border-stone-200 bg-stone-50/20 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-stone-900">{prog.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200 text-stone-700">
                      {prog.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                    {prog.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Shifts */}
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
                      ? 'border-emerald-700 bg-amber-50/60 shadow-xs'
                      : 'border-stone-200 bg-stone-50/20 hover:border-stone-300'
                  }`}
                >
                  <div className="font-bold text-xs text-stone-900">{s.title}</div>
                  <div className="text-[11px] font-mono font-bold text-emerald-800 my-0.5">{s.time}</div>
                  <p className="text-[10px] text-stone-500">{s.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-sm sm:text-base shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <span>إتمام التسجيل وتوليد الكود الآلي</span>
            <ArrowRight className="w-5 h-5 -scale-x-100" />
          </button>
        </div>
      </form>
    </div>
  );
};
