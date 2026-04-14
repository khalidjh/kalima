"use client";

import { X } from "lucide-react";

interface HowToPlayModalProps {
  onClose: () => void;
}

function ExampleTile({
  letter,
  color,
}: {
  letter: string;
  color: "correct" | "present" | "absent" | "empty";
}) {
  const colorClass =
    color === "correct"
      ? "bg-correct border-correct"
      : color === "present"
        ? "bg-present border-present"
        : color === "absent"
          ? "bg-absent border-absent"
          : "bg-tile border-border";

  return (
    <div
      className={`w-10 h-10 flex items-center justify-center text-lg font-bold text-white border-2 ${colorClass}`}
    >
      {letter}
    </div>
  );
}

export default function HowToPlayModal({ onClose }: HowToPlayModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center overflow-hidden"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 text-white relative overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors"
          aria-label="إغلاق"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-center mb-4 text-white">
          كيف تلعب
        </h2>

        <div className="border-b border-border mb-4" />

        <p className="text-sm text-gray-300 mb-3">
          خمّن الكلمة في <strong className="text-white">6 محاولات</strong>.
        </p>
        <ul className="text-sm text-gray-300 space-y-2 mb-4 list-disc list-inside">
          <li>كل تخمين يجب أن يكون كلمة عربية صحيحة مكونة من 4 أحرف.</li>
          <li>تتغير ألوان المربعات لتُشير إلى مدى قرب تخمينك من الكلمة.</li>
        </ul>

        <div className="border-b border-border mb-4" />

        <p className="font-bold mb-2">أمثلة</p>

        {/* Example 1 - correct */}
        <div className="flex gap-1 mb-1" dir="rtl">
          <ExampleTile letter="م" color="correct" />
          <ExampleTile letter="د" color="empty" />
          <ExampleTile letter="ر" color="empty" />
          <ExampleTile letter="س" color="empty" />
          <ExampleTile letter="ة" color="empty" />
        </div>
        <p className="text-sm text-gray-300 mb-4">
          حرف <strong className="text-white">م</strong> في المكان الصحيح.
        </p>

        {/* Example 2 - present */}
        <div className="flex gap-1 mb-1" dir="rtl">
          <ExampleTile letter="ح" color="empty" />
          <ExampleTile letter="د" color="present" />
          <ExampleTile letter="ي" color="empty" />
          <ExampleTile letter="ق" color="empty" />
          <ExampleTile letter="ة" color="empty" />
        </div>
        <p className="text-sm text-gray-300 mb-4">
          حرف <strong className="text-white">د</strong> موجود في الكلمة لكن في
          مكان خاطئ.
        </p>

        {/* Example 3 - absent */}
        <div className="flex gap-1 mb-1" dir="rtl">
          <ExampleTile letter="س" color="empty" />
          <ExampleTile letter="ي" color="empty" />
          <ExampleTile letter="ا" color="empty" />
          <ExampleTile letter="ر" color="empty" />
          <ExampleTile letter="ة" color="absent" />
        </div>
        <p className="text-sm text-gray-300 mb-4">
          حرف <strong className="text-white">ة</strong> غير موجود في الكلمة.
        </p>

        <div className="border-b border-border mb-4" />

        <p className="text-sm text-gray-300 text-center">
          تظهر كلمة جديدة كل يوم! عد غداً لتحدٍّ جديد.
        </p>
      </div>
    </div>
  );
}
