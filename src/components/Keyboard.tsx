"use client";

import { LetterState } from "@/lib/gameState";

interface KeyboardProps {
  letterStates: Record<string, LetterState>;
  onKey: (key: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  disabled: boolean;
}

// Arabic keyboard rows
const ROWS: string[][] = [
  ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج"],
  ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك"],
  ["ذ", "د", "ز", "ر", "و", "ط", "ظ"],
  ["ة", "ى", "إ", "أ", "آ", "ء", "ئ", "ؤ"],
];

function getKeyStyle(state: LetterState | undefined): string {
  switch (state) {
    case "correct":
      return "bg-correct text-white";
    case "present":
      return "bg-present text-white";
    case "absent":
      return "bg-absent text-white opacity-60";
    default:
      return "bg-surface text-white hover:bg-border-filled";
  }
}

export default function Keyboard({
  letterStates,
  onKey,
  onDelete,
  onEnter,
  disabled,
}: KeyboardProps) {
  return (
    <div
      className="flex flex-col gap-1.5 w-full max-w-[500px] mx-auto px-1"
      dir="rtl"
    >
      {ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex justify-center gap-1">
          {row.map((letter) => (
            <button
              key={letter}
              onClick={() => !disabled && onKey(letter)}
              disabled={disabled}
              className={`h-14 min-w-[2.5rem] flex-1 max-w-[2.8rem] rounded text-sm sm:text-base font-bold transition-colors duration-100 select-none cursor-pointer disabled:cursor-default ${getKeyStyle(letterStates[letter])}`}
              aria-label={`حرف ${letter}`}
            >
              {letter}
            </button>
          ))}
        </div>
      ))}

      {/* Action row */}
      <div className="flex justify-center gap-2 mt-1">
        <button
          onClick={() => !disabled && onEnter()}
          disabled={disabled}
          className="h-14 px-4 rounded bg-surface text-white text-sm font-bold hover:bg-border-filled transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-default"
          aria-label="إدخال"
        >
          إدخال
        </button>
        <button
          onClick={() => !disabled && onDelete()}
          disabled={disabled}
          className="h-14 px-4 rounded bg-surface text-white text-sm font-bold hover:bg-border-filled transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-default flex items-center justify-center"
          aria-label="حذف"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20"
            viewBox="0 0 24 24"
            width="20"
            fill="currentColor"
          >
            <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
