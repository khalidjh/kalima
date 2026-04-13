"use client";

import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function HowToPlayWaffle({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" dir="rtl">
      <div className="bg-surface border border-border rounded-2xl max-w-sm w-full p-6 relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-muted hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-4">كيف تلعب وافل؟</h2>

        <div className="space-y-4 text-sm text-muted leading-relaxed">
          <p>
            رتّب الحروف في شبكة ٥×٥ لتكوين <span className="text-white font-semibold">٦ كلمات</span> متقاطعة (٣ أفقية و٣ عمودية).
          </p>

          <div className="space-y-2">
            <h3 className="text-white font-semibold">طريقة اللعب:</h3>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>اضغط على حرف ثم اضغط على حرف آخر لتبديلهما</li>
              <li>لديك <span className="text-primary font-bold">١٥ تبديلة</span> كحد أقصى</li>
              <li>رتّب كل الحروف في أماكنها الصحيحة للفوز</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-semibold">الألوان:</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-correct flex items-center justify-center text-white font-bold text-sm">م</div>
                <span>الحرف في مكانه الصحيح</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-present flex items-center justify-center text-white font-bold text-sm">ك</div>
                <span>الحرف في الكلمة لكن بمكان خاطئ</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-absent flex items-center justify-center text-white font-bold text-sm">ن</div>
                <span>الحرف ليس في هذه الكلمة</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-semibold">النجوم:</h3>
            <p>كلما قلّت التبديلات، زادت نجومك (حتى ٥ نجوم).</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-xl bg-primary text-primary-text font-bold text-base hover:opacity-90 transition-opacity"
        >
          فهمت!
        </button>
      </div>
    </div>
  );
}
