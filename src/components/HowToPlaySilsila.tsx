"use client";

import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function HowToPlaySilsila({ onClose }: Props) {
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

        <h2 className="text-xl font-extrabold text-center mb-6">كيف تلعب سلسلة؟</h2>

        <p className="text-sm text-muted text-center mb-6">
          غيّر حرفاً واحداً في كل خطوة للوصول من الكلمة الأولى إلى الأخيرة
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">١</span>
            <p className="text-sm text-white">الكلمة الأولى والأخيرة ثابتتان ومعطاتان لك</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">٢</span>
            <p className="text-sm text-white">اكتب كلمة تختلف بحرف واحد فقط عن الكلمة السابقة</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">٣</span>
            <p className="text-sm text-white">كل كلمة يجب أن تكون كلمة عربية صحيحة</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">٤</span>
            <p className="text-sm text-white">أكمل السلسلة من البداية إلى النهاية للفوز!</p>
          </div>
        </div>

        <div className="bg-background rounded-xl p-4 mb-6">
          <p className="text-xs text-muted font-bold mb-3 text-center">مثال</p>
          <div className="flex flex-col gap-2 items-center">
            <div className="flex gap-1 justify-center">
              <span className="w-8 h-8 flex items-center justify-center bg-correct rounded text-sm font-bold text-white">ك</span>
              <span className="w-8 h-8 flex items-center justify-center bg-correct rounded text-sm font-bold text-white">ل</span>
              <span className="w-8 h-8 flex items-center justify-center bg-correct rounded text-sm font-bold text-white">م</span>
              <span className="w-8 h-8 flex items-center justify-center bg-correct rounded text-sm font-bold text-white">ا</span>
              <span className="w-8 h-8 flex items-center justify-center bg-correct rounded text-sm font-bold text-white">ت</span>
            </div>
            <span className="text-muted text-lg">↓</span>
            <div className="flex gap-1 justify-center">
              <span className="w-8 h-8 flex items-center justify-center bg-present rounded text-sm font-bold text-white">ج</span>
              <span className="w-8 h-8 flex items-center justify-center bg-surface border border-border rounded text-sm font-bold text-white">ل</span>
              <span className="w-8 h-8 flex items-center justify-center bg-surface border border-border rounded text-sm font-bold text-white">م</span>
              <span className="w-8 h-8 flex items-center justify-center bg-surface border border-border rounded text-sm font-bold text-white">ا</span>
              <span className="w-8 h-8 flex items-center justify-center bg-surface border border-border rounded text-sm font-bold text-white">ت</span>
            </div>
            <span className="text-muted text-lg">↓</span>
            <div className="flex gap-1 justify-center">
              <span className="w-8 h-8 flex items-center justify-center bg-correct rounded text-sm font-bold text-white">ج</span>
              <span className="w-8 h-8 flex items-center justify-center bg-present rounded text-sm font-bold text-white">م</span>
              <span className="w-8 h-8 flex items-center justify-center bg-correct rounded text-sm font-bold text-white">ل</span>
              <span className="w-8 h-8 flex items-center justify-center bg-correct rounded text-sm font-bold text-white">ا</span>
              <span className="w-8 h-8 flex items-center justify-center bg-correct rounded text-sm font-bold text-white">ت</span>
            </div>
          </div>
          <p className="text-xs text-muted text-center mt-2">الحرف المتغير يظهر بلون مميز</p>
        </div>

        <p className="text-xs text-muted text-center mb-4">
          لغز جديد كل يوم في منتصف الليل
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
