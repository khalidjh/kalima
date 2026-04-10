"use client";

import { LetterState } from "@/lib/gameState";
import { playTap, playDelete } from "@/lib/sounds";

interface KeyboardProps {
  letterStates: Record<string, LetterState>;
  onKey: (key: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  disabled: boolean;
}

// Arabic keyboard rows — Enter on row 3 start (right), Delete on row 3 end (left)
const ROW1 = ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج"];
const ROW2 = ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك"];
const ROW3 = ["ذ", "د", "ز", "ر", "و", "ط", "ظ"];
const ROW4 = ["ة", "ى", "إ", "أ", "آ", "ء", "ئ", "ؤ"];

function getKeyStyle(state: LetterState | undefined): string {
  switch (state) {
    case "correct":
      return "bg-black text-[#CCFF00] border-[#CCFF00]";
    case "present":
      return "bg-gray-400 text-black border-gray-400";
    case "absent":
      return "bg-gray-300 text-gray-500 border-gray-300 opacity-50";
    default:
      return "bg-white text-black border-black";
  }
}

interface LetterKeyProps {
  letter: string;
  state?: LetterState;
  onKey: (k: string) => void;
  disabled: boolean;
}

function LetterKey({ letter, state, onKey, disabled }: LetterKeyProps) {
  return (
    <button
      onPointerDown={(e) => {
        e.preventDefault();
        if (!disabled) { playTap(); onKey(letter); }
      }}
      disabled={disabled}
      className={`h-10 sm:h-12 w-full rounded-none text-sm font-brutal select-none touch-manipulation transition-all border-2 shadow-brutal-sm active:shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 ${getKeyStyle(state)}`}
    >
      {letter}
    </button>
  );
}

export default function Keyboard({
  letterStates,
  onKey,
  onDelete,
  onEnter,
  disabled,
}: KeyboardProps) {
  return (
    <div className="w-full max-w-[480px] mx-auto px-1 pb-safe overflow-hidden" dir="rtl">
      {/* Row 1 — 11 keys, smaller */}
      <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `repeat(${ROW1.length}, 1fr)` }}>
        {ROW1.map((l) => (
          <LetterKey key={l} letter={l} state={letterStates[l]} onKey={onKey} disabled={disabled} />
        ))}
      </div>

      {/* Row 2 — 10 keys */}
      <div className="grid gap-1 mb-1 px-[4%]" style={{ gridTemplateColumns: `repeat(${ROW2.length}, 1fr)` }}>
        {ROW2.map((l) => (
          <LetterKey key={l} letter={l} state={letterStates[l]} onKey={onKey} disabled={disabled} />
        ))}
      </div>

      {/* Row 3 — Enter + 7 keys + Delete */}
      <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: "1.6fr repeat(7, 1fr) 1.6fr" }}>
        {/* Enter — rightmost in RTL */}
        <button
          onPointerDown={(e) => { e.preventDefault(); if (!disabled) onEnter(); }}
          disabled={disabled}
          className="h-10 sm:h-12 rounded bg-primary text-[#0A0A0A] text-xs font-bold select-none touch-manipulation disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          إدخال
        </button>

        {ROW3.map((l) => (
          <LetterKey key={l} letter={l} state={letterStates[l]} onKey={onKey} disabled={disabled} />
        ))}

        {/* Delete — leftmost in RTL */}
        <button
          onPointerDown={(e) => { e.preventDefault(); if (!disabled) { playDelete(); onDelete(); } }}
          disabled={disabled}
          className="h-10 sm:h-12 rounded bg-surface border border-border text-muted text-xs font-bold select-none touch-manipulation disabled:opacity-40 hover:text-white hover:border-white/30 transition-colors"
        >
          حذف
        </button>
      </div>

      {/* Row 4 — 8 special chars */}
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${ROW4.length}, 1fr)` }}>
        {ROW4.map((l) => (
          <LetterKey key={l} letter={l} state={letterStates[l]} onKey={onKey} disabled={disabled} />
        ))}
      </div>
    </div>
  );
}
