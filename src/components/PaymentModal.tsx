import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Copy,
  CheckCircle2,
  Upload,
  AlertCircle,
  Building2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MinutePackage, StudentRecord } from '../types';
import { triggerHaptic } from '../utils/telegram';

interface PaymentModalProps {
  student: StudentRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ student, isOpen, onClose }) => {
  const { packages, paymentMethods, submitPaymentRequest } = useApp();

  const [selectedPackage, setSelectedPackage] = useState<MinutePackage>(packages[1] || packages[0]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>(paymentMethods[0]?.id || 'cbe');
  const [senderName, setSenderName] = useState<string>(student.fullName);
  const [senderPhone, setSenderPhone] = useState<string>(student.phone);
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [copiedMethodId, setCopiedMethodId] = useState<string | null>(null);
  const [copiedBeneficiary, setCopiedBeneficiary] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; error: boolean } | null>(null);

  if (!isOpen) return null;

  const currentMethod = paymentMethods.find((m) => m.id === selectedMethodId) || paymentMethods[0];

  const handleCopy = (text: string, methodId?: string) => {
    navigator.clipboard.writeText(text);
    triggerHaptic('light');
    if (methodId) {
      setCopiedMethodId(methodId);
      setTimeout(() => setCopiedMethodId(null), 2000);
    } else {
      setCopiedBeneficiary(true);
      setTimeout(() => setCopiedBeneficiary(false), 2000);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStatusMessage({ text: 'حجم الصورة كبير، يرجى اختيار صورة أقل من 5 ميجابايت', error: true });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
        setStatusMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionRef.trim()) {
      setStatusMessage({ text: 'يُرجى إدخال الرقم المرجعي للعملية (Transaction Ref)', error: true });
      return;
    }

    if (!receiptImage) {
      setStatusMessage({ text: 'يُرجى إرفاق صورة إشعار أو إيصال التحويل البنكي', error: true });
      return;
    }

    setIsSubmitting(true);
    const result = submitPaymentRequest({
      studentId: student.id,
      packageId: selectedPackage.id,
      paymentMethodId: selectedMethodId,
      senderName: senderName.trim() || student.fullName,
      senderPhone: senderPhone.trim() || student.phone,
      transactionRef: transactionRef.trim(),
      receiptImage,
    });

    setIsSubmitting(false);

    if (result.success) {
      setStatusMessage({ text: 'تم إرسال إشعار الدفع بنجاح للمراجعة والاعتماد.', error: false });
      setTimeout(() => {
        onClose();
        setStatusMessage(null);
        setTransactionRef('');
        setReceiptImage('');
      }, 2000);
    } else {
      setStatusMessage({ text: result.message, error: true });
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-[#fdfbf7] rounded-3xl shadow-2xl border border-amber-300/80 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#064e3b] p-5 text-white flex items-center justify-between border-b border-amber-400/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-900 flex items-center justify-center font-bold shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-amber-200">
                شحن باقات الدقائق القرآنية
              </h3>
              <p className="text-xs text-emerald-100">
                الطالب: <strong className="text-white">{student.fullName}</strong> ({student.code})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Step 1: Packages */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>١. اختر باقة الدقائق المناسبة</span>
              </span>
              <span className="text-[11px] text-amber-800 font-medium">العملة: بر إثيوبي (ETB)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {packages.map((pkg) => {
                const isSelected = selectedPackage.id === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all text-center relative ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50/80 ring-2 ring-emerald-600/30 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-900 text-[9px] font-black px-2 py-0.2 rounded-full shadow-2xs">
                        الأكثر طلباً
                      </span>
                    )}
                    <div className="text-lg font-black text-emerald-950 font-mono mt-1">
                      {pkg.minutes} <span className="text-xs font-sans font-bold text-emerald-800">دقيقة</span>
                    </div>
                    <div className="text-xs font-bold text-amber-800 mt-0.5 font-mono">
                      {pkg.priceEtb} بر
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Payment Accounts */}
          <div className="space-y-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>٢. حسابات التحويل المعتمدة (اسم المستفيد الموحد)</span>
              </span>
            </div>

            {/* Beneficiary Card */}
            <div className="bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-stone-500 text-[10px] block">اسم المستفيد (Beneficiary Name):</span>
                <span className="font-bold text-emerald-950 text-sm font-mono tracking-wide">
                  Kalid Ahmed Mustefa
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy('Kalid Ahmed Mustefa')}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100"
              >
                {copiedBeneficiary ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBeneficiary ? 'تم النسخ' : 'نسخ الاسم'}</span>
              </button>
            </div>

            {/* Select Method Tab Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {paymentMethods.map((m) => {
                const isSelected = selectedMethodId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethodId(m.id)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-emerald-700 bg-white ring-2 ring-emerald-600/30 shadow-2xs'
                        : 'border-stone-200 bg-white/70 hover:bg-white text-stone-600'
                    }`}
                  >
                    <span className="text-xs font-bold block truncate">{m.name.split('(')[0]}</span>
                    <span className="text-[10px] text-stone-500 font-mono">{m.logoText}</span>
                  </button>
                );
              })}
            </div>

            {/* Method Details */}
            {currentMethod && (
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${currentMethod.badgeColor}`}>
                      {currentMethod.logoText}
                    </span>
                    <span className="font-bold text-stone-800">{currentMethod.name}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-stone-400 text-[10px]">رقم الحساب / المحفظة:</span>
                    <span className="font-mono text-base font-black text-emerald-950 tracking-wider">
                      {currentMethod.accountNumber}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(currentMethod.accountNumber, currentMethod.id)}
                  className="self-end sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white font-bold transition active:scale-95"
                >
                  {copiedMethodId === currentMethod.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الرقم</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Step 3: Transaction Ref & Receipt Upload */}
          <div className="space-y-3 pt-1">
            <span className="font-bold text-stone-900 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>٣. تأكيد التحويل وإرفاق الإشعار</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  الرقم المرجعي للعملية (Transaction Ref) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="مثال: FT2630588912 أو رقم إشعار تيليبير"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono text-xs bg-white focus:ring-2 focus:ring-emerald-700"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  صورة إشعار التحويل (Screenshot) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-stone-500 file:mr-0 file:ml-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:bg-emerald-100 file:text-emerald-800 border rounded-xl p-1 bg-white cursor-pointer"
                />
                {receiptImage && (
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تم تجهيز الصورة للإرسال</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 ${
                statusMessage.error
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              }`}
            >
              {statusMessage.error ? (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-stone-200">
            <div>
              <span className="text-stone-400 text-[10px] block">المبلغ المطلوب:</span>
              <span className="text-base font-black text-emerald-900 font-mono">
                {selectedPackage.priceEtb} بر <span className="text-[11px] font-sans text-stone-600">({selectedPackage.minutes} دقيقة)</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl border border-stone-300 font-bold hover:bg-stone-100"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <span>إرسال إشعار الدفع</span>
                <ArrowRight className="w-4 h-4 -scale-x-100" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
