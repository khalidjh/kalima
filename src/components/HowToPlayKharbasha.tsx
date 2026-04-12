"use client";

import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function HowToPlayKharbasha({ onClose }: Props) {
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

        <h2 className="text-xl font-extrabold text-center mb-6">كيف تلعب خربشة؟</h2>

        <p className="text-sm text-muted text-center mb-6">
          الحروف مبعثرة! رتّبها لتكتشف الكلمة المخفية
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">١</span>
            <p className="text-sm text-white">اضغط على الحروف بالترتيب الصحيح لتكوين الكلمة</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">٢</span>
            <p className="text-sm text-white">التلميح والإيموجي يساعدانك على تضييق الاحتمالات</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">٣</span>
            <p className="text-sm text-white">اضغط على حرف في منطقة الإجابة لإرجاعه</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">٤</span>
            <p className="text-sm text-white">
              لديك <span className="font-bold text-present">5 محاولات</span> فقط للوصول للإجابة
            </p>
          </div>
        </div>

        <div className="bg-background rounded-xl p-4 mb-6">
          <p className="text-xs text-muted font-bold mb-3 text-center">مثال</p>
          <div className="flex justify-center gap-2 mb-2">
            {["ق", "و", "ه", "ة"].map((l, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-lg bg-primary/20 border border-primary flex items-center justify-center font-bold text-primary"
              >
                {l}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted text-center">مشروب ساخن ☕</p>
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
