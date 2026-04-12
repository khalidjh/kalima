"use client";

import { useState, useEffect, useCallback } from "react";
import { getDailyNahlaPuzzle, getNahlaPuzzleNumber, calculateWordScore, getRank, isPangram } from "@/data/nahla";
import { playTap, playCorrect, playWrong } from "@/lib/sounds";
import { updateNahlaStats } from "@/lib/nahlaState";
import GameHeader from "@/components/GameHeader";
import HowToPlayNahla from "@/components/HowToPlayNahla";
import { HelpCircle } from "lucide-react";

const STORAGE_KEY = "kalima_nahla_state";

interface GameState {
  puzzleNumber: number;
  foundWords: string[];
  score: number;
  statsRecorded: boolean;
}

function loadState(puzzleNumber: number): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { puzzleNumber, foundWords: [], score: 0, statsRecorded: false };
    const state: GameState = JSON.parse(raw);
    if (state.puzzleNumber !== puzzleNumber) return { puzzleNumber, foundWords: [], score: 0, statsRecorded: false };
    return state;
  } catch {
    return { puzzleNumber, foundWords: [], score: 0, statsRecorded: false };
  }
}

function saveState(state: GameState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function toArabicNum(n: number): string {
  const digits = "٠١٢٣٤٥٦٧٨٩";
  return String(n).replace(/\d/g, (d) => digits[parseInt(d)]);
}

/** Fisher-Yates shuffle - unbiased */
function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function NahlaPage() {
  const puzzle = getDailyNahlaPuzzle();
  const puzzleNumber = getNahlaPuzzleNumber();

  const [state, setState] = useState<GameState>({ puzzleNumber, foundWords: [], score: 0, statsRecorded: false });
  const [input, setInput] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    const loaded = loadState(puzzleNumber);
    setState(loaded);
    setShuffledLetters(fisherYatesShuffle(puzzle.letters.filter(l => l !== puzzle.requiredLetter)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1500);
  }, []);

  const handleSubmit = useCallback(() => {
    const word = input.trim();
    if (!word) return;

    if (word.length < 3) {
      playWrong();
      showToast("قصير جداً! الحد الأدنى ٣ أحرف");
      return;
    }

    if (!word.includes(puzzle.requiredLetter)) {
      playWrong();
      showToast(`يجب أن تحتوي على "${puzzle.requiredLetter}"`);
      return;
    }

    if (!word.split("").every(l => puzzle.letters.includes(l))) {
      playWrong();
      showToast("أحرف غير مسموحة");
      return;
    }

    if (state.foundWords.includes(word)) {
      playWrong();
      showToast("وجدتها من قبل!");
      return;
    }

    if (!puzzle.validWords.includes(word)) {
      playWrong();
      showToast("ليست كلمة صحيحة");
      return;
    }

    playCorrect();
    const pts = calculateWordScore(word, puzzle.letters);
    const pan = isPangram(word, puzzle.letters);
    const newState: GameState = {
      ...state,
      foundWords: [...state.foundWords, word],
      score: state.score + pts,
    };
    setState(newState);
    saveState(newState);
    setInput("");
    if (pan) showToast("Pangram! 🐝🎉");
  }, [input, puzzle, state, showToast]);

  // Record stats once when player finds all words
  useEffect(() => {
    if (
      state.foundWords.length === puzzle.validWords.length &&
      state.foundWords.length > 0 &&
      !state.statsRecorded
    ) {
      updateNahlaStats(state.score);
      const updated = { ...state, statsRecorded: true };
      setState(updated);
      saveState(updated);
    }
  }, [state, puzzle.validWords.length]);

  // Keyboard support
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is in another input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      // Ignore if modal open
      if (document.querySelector("[data-nahla-modal]")) return;

      if (e.key === "Enter") {
        e.preventDefault();
        // Trigger submit via a custom event to avoid stale closure
        document.dispatchEvent(new CustomEvent("nahla-submit"));
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        setInput(prev => prev.slice(0, -1));
        playTap();
        return;
      }

      // Check if it's an Arabic letter that's in the puzzle
      const char = e.key;
      if (char.length === 1 && puzzle.letters.includes(char)) {
        e.preventDefault();
        setInput(prev => prev + char);
        playTap();
      }
    }

    function handleSubmitEvent() {
      // We use a ref-like pattern via custom event to get fresh state
      document.dispatchEvent(new CustomEvent("nahla-do-submit"));
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("nahla-submit", handleSubmitEvent);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("nahla-submit", handleSubmitEvent);
    };
  }, [puzzle.letters]);

  // Listen for submit custom event with fresh handleSubmit
  useEffect(() => {
    function doSubmit() {
      handleSubmit();
    }
    document.addEventListener("nahla-do-submit", doSubmit);
    return () => document.removeEventListener("nahla-do-submit", doSubmit);
  }, [handleSubmit]);

  const handleShuffle = () => {
    setShuffledLetters(prev => fisherYatesShuffle(prev));
    playTap();
  };

  const addLetter = (letter: string) => {
    setInput(prev => prev + letter);
    playTap();
  };

  const deleteLetter = () => {
    setInput(prev => prev.slice(0, -1));
    playTap();
  };

  const handleShare = () => {
    const rank = getRank(state.score, puzzle.maxScore);
    const text = `نحلة 🐝 #${toArabicNum(puzzleNumber)}\n${rank.emoji} ${rank.name}\nوجدت ${toArabicNum(state.foundWords.length)}/${toArabicNum(puzzle.validWords.length)} كلمة\nkalima.fun/nahla`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rank = getRank(state.score, puzzle.maxScore);
  const allLetters = [puzzle.requiredLetter, ...shuffledLetters];

  const hexPositions = [
    { x: 50, y: 50 },
    { x: 50, y: 15 },
    { x: 85, y: 32 },
    { x: 85, y: 68 },
    { x: 50, y: 85 },
    { x: 15, y: 68 },
    { x: 15, y: 32 },
  ];

  return (
    <main className="min-h-screen bg-[#0F0C00] text-white flex flex-col items-center" dir="rtl">
      <GameHeader
        center={
          <span className="text-sm font-bold">
            نحلة 🐝 #{toArabicNum(puzzleNumber)}
          </span>
        }
        right={
          <button
            onClick={() => setShowHowToPlay(true)}
            className="text-muted hover:text-white transition-colors"
          >
            <HelpCircle size={22} strokeWidth={1.5} />
          </button>
        }
      />

      {showHowToPlay && (
        <div data-nahla-modal>
          <HowToPlayNahla onClose={() => setShowHowToPlay(false)} />
        </div>
      )}

      <div className="w-full max-w-md px-4 py-4">
        <div className="bg-surface border border-border rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted">{rank.emoji} {rank.name}</span>
            <span className="font-bold text-primary">{toArabicNum(state.score)} نقطة</span>
          </div>
          <div className="w-full h-2 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(rank.pct, 100)}%` }} />
          </div>
          <p className="text-xs text-muted mt-1 text-center">وجدت {toArabicNum(state.foundWords.length)}/{toArabicNum(puzzle.validWords.length)} كلمة</p>
        </div>

        {toast && (
          <div className="text-center mb-3">
            <span className="bg-surface border border-border text-sm font-semibold px-4 py-2 rounded-xl inline-block">{toast}</span>
          </div>
        )}

        <div className="text-center mb-4">
          <div className="inline-block bg-surface border-2 border-primary rounded-xl px-6 py-3 min-w-[200px]">
            <span className="text-xl font-bold tracking-wider">{input || <span className="text-muted">...</span>}</span>
          </div>
        </div>

        <div className="relative w-[240px] h-[240px] mx-auto mb-4">
          {allLetters.map((letter, i) => {
            const pos = hexPositions[i];
            const isCenter = i === 0;
            return (
              <button
                key={`${letter}-${i}`}
                onClick={() => addLetter(letter)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-xl font-extrabold transition-all duration-150 active:scale-90"
                style={{
                  left: `${pos.x}%`, top: `${pos.y}%`,
                  width: isCenter ? 68 : 56, height: isCenter ? 68 : 56,
                  fontSize: isCenter ? 28 : 22,
                  backgroundColor: isCenter ? "#CCFF00" : "#1A1A1A",
                  color: isCenter ? "#0A0A0A" : "#FFFFFF",
                  border: isCenter ? "2px solid #CCFF00" : "2px solid #2A2A2A",
                }}
              >{letter}</button>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-3 mb-6">
          <button onClick={deleteLetter} className="bg-surface border border-border rounded-xl px-5 py-3 font-bold text-sm hover:border-primary/40 transition-colors">حذف</button>
          <button onClick={handleShuffle} className="bg-surface border border-border rounded-xl px-5 py-3 font-bold text-sm hover:border-primary/40 transition-colors">🔀 خلط</button>
          <button onClick={handleSubmit} className="bg-primary text-[#0A0A0A] rounded-xl px-5 py-3 font-bold text-sm hover:opacity-90 transition-opacity">إدخال</button>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm">الكلمات الموجودة</h3>
            <span className="text-xs text-muted">{toArabicNum(state.foundWords.length)}/{toArabicNum(puzzle.validWords.length)}</span>
          </div>
          {state.foundWords.length === 0 ? (
            <p className="text-muted text-sm text-center py-3">ابدأ بتكوين كلمات!</p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
              {state.foundWords.map((w) => (
                <span key={w} className={`text-sm font-bold px-3 py-1 rounded-lg ${isPangram(w, puzzle.letters) ? "bg-primary/20 text-primary border border-primary" : "bg-border/30 text-white"}`}>{w}</span>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleShare} className="w-full bg-surface border border-border hover:border-primary/40 rounded-xl py-3 font-bold text-sm transition-colors mb-4">
          {copied ? "✓ تم النسخ!" : "مشاركة النتيجة"}
        </button>
      </div>
    </main>
  );
}
