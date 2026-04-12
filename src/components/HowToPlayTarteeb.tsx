"use client";

import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function HowToPlayTarteeb({ onClose }: Props) {
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

        <h2 className="text-xl font-extrabold text-center mb-6">كيف تلعب ترتيب؟</h2>

        {/* Goal */}
        <p className="text-sm text-muted text-center mb-6">
          يظهر لك عنصران، خمّن أيهما له القيمة الأعلى
        </p>

        {/* Steps */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">١</span>
            <p className="text-sm text-white">يظهر عنصران مع قيمة العنصر الأول ظاهرة والثاني مخفية</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">٢</span>
            <p className="text-sm text-white">اختر <span className="font-bold text-primary">أعلى</span> أو <span className="font-bold text-primary">أدنى</span> لتخمين قيمة العنصر الثاني</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">٣</span>
            <p className="text-sm text-white">أي خطأ ينهي اللعبة فورا - حاول تحقيق <span className="font-bold text-correct">١٠/١٠</span></p>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-background rounded-xl p-4 mb-6">
          <p className="text-xs text-muted font-bold mb-3 text-center uppercase tracking-wider">الفئات</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "عدد سكان المدن", icon: "🏙️" },
              { label: "مساحة الدول", icon: "🗺️" },
              { label: "ارتفاع الأبراج", icon: "🏗️" },
              { label: "مسافات بين المدن", icon: "📏" },
            ].map(({ label, icon }) => (
              <div key={label} className="bg-surface border border-border rounded-lg px-3 py-2 text-center">
                <span className="text-sm">{icon} {label}</span>
              </div>
            ))}
          </div>
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
