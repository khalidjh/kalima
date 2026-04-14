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

// Arabic keyboard — matches iPhone Arabic layout
const ROW1 = ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "د"];
const ROW2 = ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط"];
const ROW3 = ["ذ", "ئ", "ء", "ؤ", "ر", "ى", "ة", "و", "ز", "ظ"];
const ROW4 = ["إ", "أ", "آ"];

function getKeyStyle(state: LetterState | undefined): string {
  switch (state) {
    case "correct":
      return "bg-correct text-white";
    case "present":
      return "bg-present text-white";
    case "absent":
      return "bg-[#1A1500] text-[#4A3F00] border border-[#2A2200]";
    default:
      return "bg-surface text-[#FFF8DC]";
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
      className={`h-10 sm:h-12 w-full rounded text-sm font-bold select-none touch-manipulation transition-colors ${getKeyStyle(state)}`}
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
      {/* Row 1 — 12 keys */}
      <div className="grid gap-[3px] mb-[3px]" style={{ gridTemplateColumns: `repeat(${ROW1.length}, 1fr)` }}>
        {ROW1.map((l) => (
          <LetterKey key={l} letter={l} state={letterStates[l]} onKey={onKey} disabled={disabled} />
        ))}
      </div>

      {/* Row 2 — 11 keys */}
      <div className="grid gap-[3px] mb-[3px] px-[2%]" style={{ gridTemplateColumns: `repeat(${ROW2.length}, 1fr)` }}>
        {ROW2.map((l) => (
          <LetterKey key={l} letter={l} state={letterStates[l]} onKey={onKey} disabled={disabled} />
        ))}
      </div>

      {/* Row 3 — Enter + 10 keys + Delete */}
      <div className="grid gap-[3px] mb-[3px]" style={{ gridTemplateColumns: `1.4fr repeat(${ROW3.length}, 1fr) 1.4fr` }}>
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
          ⌫
        </button>
      </div>

      {/* Row 4 — 3 hamza variants */}
      <div className="grid gap-[3px] px-[30%]" style={{ gridTemplateColumns: `repeat(${ROW4.length}, 1fr)` }}>
        {ROW4.map((l) => (
          <LetterKey key={l} letter={l} state={letterStates[l]} onKey={onKey} disabled={disabled} />
        ))}
      </div>
    </div>
  );
}
