import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Copy,
  CheckCircle2,
  Upload,
  Sparkles,
  AlertCircle,
  Building2,
  Wallet,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BANK_ACCOUNTS, MINUTE_PACKAGES } from '../constants';
import { MinutePackage, Student } from '../types';
import { triggerHaptic } from '../utils/telegram';

interface PaymentModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ student, isOpen, onClose }) => {
  const { submitPayment } = useApp();

  const [selectedPackage, setSelectedPackage] = useState<MinutePackage>(MINUTE_PACKAGES[1]); // 200 min default
  const [selectedBankId, setSelectedBankId] = useState<string>('cbe');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);
  const [copiedBeneficiary, setCopiedBeneficiary] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; error: boolean } | null>(null);

  if (!isOpen) return null;

  const currentBank = BANK_ACCOUNTS.find((b) => b.id === selectedBankId) || BANK_ACCOUNTS[0];

  const handleCopy = (text: string, bankId?: string) => {
    navigator.clipboard.writeText(text);
    triggerHaptic('light');
    if (bankId) {
      setCopiedBankId(bankId);
      setTimeout(() => setCopiedBankId(null), 2000);
    } else {
      setCopiedBeneficiary(true);
      setTimeout(() => setCopiedBeneficiary(false), 2000);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStatusMessage({ text: 'حجم الصورة كبير جداً، يُرجى رفع صورة أقل من 5 ميجابايت', error: true });
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
      setStatusMessage({ text: 'يرجى إدخال الرقم المرجعي للعملية (Transaction Ref)', error: true });
      return;
    }

    if (!receiptImage) {
      setStatusMessage({ text: 'يرجى إرفاق صورة إشعار أو إيصال التحويل البنكي', error: true });
      return;
    }

    setIsSubmitting(true);
    const result = submitPayment({
      studentId: student.id,
      packageMinutes: selectedPackage.minutes,
      amountEtb: selectedPackage.priceEtb,
      bankId: selectedBankId,
      transactionRef: transactionRef.trim(),
      receiptImage,
    });

    setIsSubmitting(false);

    if (result.success) {
      setStatusMessage({ text: result.message, error: false });
      setTimeout(() => {
        onClose();
        setStatusMessage(null);
        setTransactionRef('');
        setReceiptImage('');
      }, 2500);
    } else {
      setStatusMessage({ text: result.message, error: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#fdfbf7] rounded-3xl shadow-2xl border border-amber-300/80 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#064e3b] via-[#043e2f] to-[#022c22] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-900 flex items-center justify-center font-bold shadow-md">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-amber-200">
                شحن باقات الدقائق القرآنية
              </h3>
              <p className="text-xs text-emerald-100">
                الطالب: <strong className="text-white">{student.fullName}</strong> ({student.code})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-800 text-emerald-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Step 1: Package Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>١. اختر باقة الدقائق المناسبة</span>
              </span>
              <span className="text-[11px] text-amber-800 font-medium">العملة: بر إثيوبي (ETB)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {MINUTE_PACKAGES.map((pkg) => {
                const isSelected = selectedPackage.id === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all text-center relative ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50/80 ring-2 ring-emerald-600/30 shadow-sm'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-900 text-[9px] font-black px-2 py-0.2 rounded-full shadow-xs">
                        الأكثر طلباً
                      </span>
                    )}
                    <div className="text-xl font-black text-emerald-950 font-mono mt-1">
                      {pkg.minutes} <span className="text-xs font-sans font-bold text-emerald-800">دقيقة</span>
                    </div>
                    <div className="text-sm font-bold text-amber-700 mt-0.5 font-mono">
                      {pkg.priceEtb} <span className="text-[10px] font-sans">بر</span>
                    </div>
                    {pkg.tag && (
                      <div className="text-[9px] text-stone-500 mt-1 line-clamp-1">
                        {pkg.tag}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Bank Account Details */}
          <div className="space-y-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>٢. حسابات التحويل المعتمدة (اسم المستفيد الموحد)</span>
              </span>
            </div>

            {/* Beneficiary Card */}
            <div className="bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
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

            {/* Bank Select Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BANK_ACCOUNTS.map((bank) => {
                const isSelected = selectedBankId === bank.id;
                return (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => setSelectedBankId(bank.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-emerald-700 bg-white ring-2 ring-emerald-600/40 shadow-xs'
                        : 'border-stone-200 bg-white/70 hover:bg-white text-stone-600'
                    }`}
                  >
                    <span className="text-xs font-bold block text-stone-900 truncate">{bank.name.split('(')[0]}</span>
                    <span className="text-[10px] text-stone-500 font-mono">{bank.logoText}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Bank Details Card */}
            <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${currentBank.badgeColor}`}>
                    {currentBank.logoText}
                  </span>
                  <span className="text-xs font-bold text-stone-800">{currentBank.name}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] text-stone-500">رقم الحساب / المحفظة:</span>
                  <span className="font-mono text-base font-black text-emerald-950 tracking-wider">
                    {currentBank.accountNumber}
                  </span>
                </div>
                {currentBank.transferGuide && (
                  <div className="text-[10px] text-stone-500 mt-0.5">{currentBank.transferGuide}</div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleCopy(currentBank.accountNumber, currentBank.id)}
                className="self-end sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs active:scale-95 transition"
              >
                {copiedBankId === currentBank.id ? (
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
          </div>

          {/* Step 3: Transaction Ref & Receipt Upload */}
          <div className="space-y-4 pt-1">
            <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>٣. تأكيد التحويل وإرفاق الإشعار</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Transaction Ref Input */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  الرقم المرجعي للعملية (Transaction Ref) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="مثال: FT2630588912 أو رقم إشعار تيليبير"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-sm font-mono bg-white"
                  dir="ltr"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">
                  الرقم الفريد الظاهر في رسالة أو إشعار البنك للتأكد الفوري
                </span>
              </div>

              {/* Receipt File Upload */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  صورة إشعار التحويل (Screenshot) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-xs text-stone-500 file:mr-0 file:ml-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer border border-stone-300 rounded-xl p-1 bg-white"
                  />
                </div>
                {receiptImage && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">تم تحميل صورة الإشعار بنجاح</span>
                    <img src={receiptImage} alt="Receipt preview" className="w-8 h-8 rounded object-cover ml-auto border" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status / Error feedback */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
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

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-200">
            <div className="text-xs">
              <span className="text-stone-500 block">المبلغ المطلوب تحويله:</span>
              <span className="text-lg font-black text-emerald-900 font-mono">
                {selectedPackage.priceEtb} بر <span className="text-xs font-sans text-stone-600">({selectedPackage.minutes} دقيقة)</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition"
              >
                إلغاء
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold shadow-md transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                <span>إرسال إشعار الدفع للاعتماد</span>
                <ArrowRight className="w-4 h-4 -scale-x-100" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
