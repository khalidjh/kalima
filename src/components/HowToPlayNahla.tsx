"use client";

import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function HowToPlayNahla({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 text-white relative"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-muted hover:text-white transition-colors"
        >
          <X size={22} strokeWidth={1.5} />
        </button>

        <h2 className="text-xl font-extrabold text-center mb-6">كيف تلعب نحلة؟</h2>

        <p className="text-sm text-muted text-center mb-6">
          كوّن أكبر عدد من الكلمات باستخدام الأحرف السبعة
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">١</span>
            <p className="text-sm text-white">كل كلمة يجب أن تحتوي على <span className="font-bold text-primary">الحرف المركزي</span></p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">٢</span>
            <p className="text-sm text-white">الحد الأدنى لطول الكلمة <span className="font-bold text-primary">٣ أحرف</span></p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">٣</span>
            <p className="text-sm text-white">يمكنك تكرار الأحرف في الكلمة الواحدة</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">٤</span>
            <p className="text-sm text-white">الكلمة التي تستخدم <span className="font-bold text-primary">كل الأحرف السبعة</span> تحصل على نقاط إضافية (بانغرام)</p>
          </div>
        </div>

        <div className="bg-background rounded-xl p-4 mb-6">
          <p className="text-xs text-muted font-bold mb-3 text-center uppercase tracking-wider">النقاط</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">٣ أحرف</span>
              <span className="font-bold">١ نقطة</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">٤ أحرف</span>
              <span className="font-bold">٤ نقاط</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">٥+ أحرف</span>
              <span className="font-bold">نقطة لكل حرف</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-primary font-bold">بانغرام</span>
              <span className="text-primary font-bold">+٧ نقاط إضافية</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted text-center mb-4">
          لغز جديد كل يوم في منتصف الليل 🕛
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-primary text-[#0A0A0A] font-extrabold text-base"
        >
          العب الآن!
        </button>
      </div>
    </div>
  );
}
