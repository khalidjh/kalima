"use client";

import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function HowToPlayRawabet({ onClose }: Props) {
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

        <h2 className="text-xl font-extrabold text-center mb-6">كيف تلعب روابط؟</h2>

        {/* Goal */}
        <p className="text-sm text-muted text-center mb-6">
          جد الكلمات الـ 16 التي تنتمي لـ 4 مجموعات مختلفة
        </p>

        {/* Steps */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">١</span>
            <p className="text-sm text-white">اضغط على 4 كلمات تعتقد أنها من نفس المجموعة</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">٢</span>
            <p className="text-sm text-white">اضغط <span className="font-bold text-primary">تحقق</span> — إذا كانت صحيحة ستظهر المجموعة ملوّنة</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">٣</span>
            <p className="text-sm text-white">لديك <span className="font-bold text-present">4 أخطاء</span> فقط قبل انتهاء اللعبة</p>
          </div>
        </div>

        {/* Category difficulty */}
        <div className="bg-background rounded-xl p-4 mb-6">
          <p className="text-xs text-muted font-bold mb-3 text-center uppercase tracking-wider">درجات الصعوبة</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { color: "bg-[#F5C842]", label: "سهل", text: "text-[#0A0A0A]" },
              { color: "bg-[#4ADE80]", label: "متوسط", text: "text-[#0A0A0A]" },
              { color: "bg-[#60A5FA]", label: "صعب", text: "text-[#0A0A0A]" },
              { color: "bg-[#F5820A]", label: "صعب جداً", text: "text-[#0A0A0A]" },
            ].map(({ color, label, text }) => (
              <div key={label} className={`${color} rounded-lg px-3 py-2 text-center`}>
                <span className={`text-sm font-bold ${text}`}>{label}</span>
              </div>
            ))}
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
