"use client";

import { LetterState } from "@/lib/gameState";

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
      return "bg-correct text-white";
    case "present":
      return "bg-present text-white";
    case "absent":
      return "bg-absent text-white opacity-60";
    default:
      return "bg-surface text-white";
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
        if (!disabled) onKey(letter);
      }}
      disabled={disabled}
      className={`h-12 w-full rounded text-sm font-bold select-none touch-manipulation transition-colors ${getKeyStyle(state)}`}
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
    <div className="w-full max-w-[480px] mx-auto px-1 pb-1 overflow-hidden" dir="rtl">
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
          className="h-12 rounded bg-surface text-white text-xs font-bold select-none touch-manipulation disabled:opacity-50"
        >
          إدخال
        </button>

        {ROW3.map((l) => (
          <LetterKey key={l} letter={l} state={letterStates[l]} onKey={onKey} disabled={disabled} />
        ))}

        {/* Delete — leftmost in RTL */}
        <button
          onPointerDown={(e) => { e.preventDefault(); if (!disabled) onDelete(); }}
          disabled={disabled}
          className="h-12 rounded bg-surface text-white text-xs font-bold select-none touch-manipulation disabled:opacity-50"
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
