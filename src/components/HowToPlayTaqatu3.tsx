"use client";

import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function HowToPlayTaqatu3({ onClose }: Props) {
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

        <h2 className="text-xl font-extrabold text-center mb-6">كيف تلعب كلمات متقاطعة؟</h2>

        <p className="text-sm text-muted text-center mb-6">
          املأ الشبكة بالحروف العربية باستخدام الأدلة
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">١</span>
            <p className="text-sm text-white">اضغط على خلية في الشبكة لتحديدها، ثم اكتب الحرف</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">٢</span>
            <p className="text-sm text-white">اضغط على الخلية مرة ثانية للتبديل بين <span className="font-bold text-primary">أفقي</span> و<span className="font-bold text-primary">عمودي</span></p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">٣</span>
            <p className="text-sm text-white">اضغط على أي دليل أسفل الشبكة للانتقال لتلك الكلمة</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-primary font-extrabold text-lg leading-none mt-0.5">٤</span>
            <p className="text-sm text-white">الكلمات الصحيحة تتحول إلى <span className="font-bold text-correct">اللون الأخضر</span></p>
          </div>
        </div>

        <div className="bg-background rounded-xl p-4 mb-6">
          <p className="text-xs text-muted font-bold mb-3 text-center uppercase tracking-wider">ألوان الخلايا</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-primary/20 border-2 border-primary rounded-lg px-3 py-2 text-center">
              <span className="text-sm font-bold text-white">محدد</span>
            </div>
            <div className="bg-primary/10 border border-primary/30 rounded-lg px-3 py-2 text-center">
              <span className="text-sm font-bold text-white">الكلمة</span>
            </div>
            <div className="bg-correct rounded-lg px-3 py-2 text-center">
              <span className="text-sm font-bold text-[#0A0A0A]">صحيح</span>
            </div>
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
