"use client";

import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function HowToPlayIqtibas({ onClose }: Props) {
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

        <h2 className="text-xl font-extrabold text-center mb-6">كيف تلعب اقتباس؟</h2>

        <p className="text-sm text-muted text-center mb-6">
          فك شفرة الاقتباس المشفر بتخمين الحروف الصحيحة
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">١</span>
            <p className="text-sm text-white">كل حرف في الاقتباس تم استبداله بحرف آخر</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">٢</span>
            <p className="text-sm text-white">اضغط على حرف مشفر ثم اختر الحرف الذي تعتقد أنه الأصلي</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">٣</span>
            <p className="text-sm text-white">كل الحروف المتشابهة تتحل تلقائيا عند اختيارك</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">٤</span>
            <p className="text-sm text-white">الحروف الصحيحة تتلون <span className="text-green-400 font-bold">بالأخضر</span></p>
          </div>
        </div>

        <div className="bg-background rounded-xl p-4 mb-6">
          <p className="text-xs text-muted font-bold mb-3 text-center uppercase tracking-wider">نصائح</p>
          <div className="space-y-2">
            <p className="text-sm text-white">ابدأ بالحروف الشائعة مثل ا، ل، م، ن</p>
            <p className="text-sm text-white">لديك 3 تلميحات تكشف حرفا عشوائيا</p>
          </div>
        </div>

        <p className="text-xs text-muted text-center mb-4">
          اقتباس جديد كل يوم في منتصف الليل
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
