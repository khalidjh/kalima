"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Word {
  word: string;
  letters: string[];
  emoji: string;
}

interface LevelData {
  name: string;
  words: Word[];
}

interface LevelProgress {
  completed: boolean;
  stars: number;
}

type GameScreen = "levels" | "playing" | "level-complete" | "all-complete";

// ─── Word Data ───────────────────────────────────────────────────────────────

const LEVELS: LevelData[] = [
  {
    name: "المستوى ١",
    words: [
      { word: "بيت", letters: ["ب", "ي", "ت"], emoji: "🏠" },
      { word: "قطة", letters: ["ق", "ط", "ة"], emoji: "🐱" },
      { word: "كلب", letters: ["ك", "ل", "ب"], emoji: "🐕" },
      { word: "سمك", letters: ["س", "م", "ك"], emoji: "🐟" },
      { word: "شمس", letters: ["ش", "م", "س"], emoji: "☀️" },
      { word: "قمر", letters: ["ق", "م", "ر"], emoji: "🌙" },
      { word: "ورد", letters: ["و", "ر", "د"], emoji: "🌹" },
      { word: "نار", letters: ["ن", "ا", "ر"], emoji: "🔥" },
      { word: "ماء", letters: ["م", "ا", "ء"], emoji: "💧" },
      { word: "أسد", letters: ["أ", "س", "د"], emoji: "🦁" },
    ],
  },
  {
    name: "المستوى ٢",
    words: [
      { word: "تفاح", letters: ["ت", "ف", "ا", "ح"], emoji: "🍎" },
      { word: "موزة", letters: ["م", "و", "ز", "ة"], emoji: "🍌" },
      { word: "بقرة", letters: ["ب", "ق", "ر", "ة"], emoji: "🐄" },
      { word: "حصان", letters: ["ح", "ص", "ا", "ن"], emoji: "🐴" },
      { word: "كتاب", letters: ["ك", "ت", "ا", "ب"], emoji: "📖" },
      { word: "قلم", letters: ["ق", "ل", "م"], emoji: "✏️" },
      { word: "باب", letters: ["ب", "ا", "ب"], emoji: "🚪" },
      { word: "شجرة", letters: ["ش", "ج", "ر", "ة"], emoji: "🌳" },
      { word: "نجمة", letters: ["ن", "ج", "م", "ة"], emoji: "⭐" },
      { word: "طائر", letters: ["ط", "ا", "ئ", "ر"], emoji: "🐦" },
    ],
  },
  {
    name: "المستوى ٣",
    words: [
      { word: "فراشة", letters: ["ف", "ر", "ا", "ش", "ة"], emoji: "🦋" },
      { word: "سيارة", letters: ["س", "ي", "ا", "ر", "ة"], emoji: "🚗" },
      { word: "طائرة", letters: ["ط", "ا", "ئ", "ر", "ة"], emoji: "✈️" },
      { word: "مدرسة", letters: ["م", "د", "ر", "س", "ة"], emoji: "🏫" },
      { word: "حديقة", letters: ["ح", "د", "ي", "ق", "ة"], emoji: "🏡" },
      { word: "دراجة", letters: ["د", "ر", "ا", "ج", "ة"], emoji: "🚲" },
      { word: "ساعة", letters: ["س", "ا", "ع", "ة"], emoji: "⏰" },
      { word: "زرافة", letters: ["ز", "ر", "ا", "ف", "ة"], emoji: "🦒" },
      { word: "سلحفاة", letters: ["س", "ل", "ح", "ف", "ا", "ة"], emoji: "🐢" },
      { word: "فيل", letters: ["ف", "ي", "ل"], emoji: "🐘" },
    ],
  },
];

const STORAGE_KEY = "kalima_kids_hijaai_progress";

const PASTEL_COLORS = [
  "#FFD6E0", "#FFE4CC", "#FFF3CC", "#D4F4DD",
  "#CCE8FF", "#E8CCFF", "#FFE0F7", "#D4EEFF",
  "#E8FFD4", "#FFE8D4", "#D4FFE8", "#FFD4D4",
];

const ARABIC_NUMS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "١٠"];

function toArabicNum(n: number): string {
  if (n === 10) return "١٠";
  if (n >= 0 && n <= 9) return ARABIC_NUMS[n];
  return String(n)
    .split("")
    .map((d) => ARABIC_NUMS[parseInt(d)] || d)
    .join("");
}

// ─── Shuffle ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Confetti Component ──────────────────────────────────────────────────────

function Confetti() {
  const pieces = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1,
    color: ["#FF6B6B", "#51CF66", "#4A90D9", "#FFD43B", "#CC5DE8", "#FF922B"][
      i % 6
    ],
    size: 6 + Math.random() * 6,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-10px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.size > 9 ? "50%" : "2px",
            animation: `confetti-fall ${p.duration}s ease-out forwards`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Star Rain Component ─────────────────────────────────────────────────────

function StarRain() {
  const stars = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 1.5,
    size: 20 + Math.random() * 20,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <style>{`
        @keyframes star-rain {
          0% { transform: translateY(-40px) scale(0) rotate(0deg); opacity: 0; }
          20% { opacity: 1; transform: translateY(10vh) scale(1) rotate(72deg); }
          100% { transform: translateY(100vh) scale(0.5) rotate(360deg); opacity: 0; }
        }
      `}</style>
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            top: "-40px",
            fontSize: s.size,
            animation: `star-rain ${s.duration}s ease-out forwards`,
            animationDelay: `${s.delay}s`,
          }}
        >
          ⭐
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function HijaaiPage() {
  const [screen, setScreen] = useState<GameScreen>("levels");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [filledSlots, setFilledSlots] = useState<(string | null)[]>([]);
  const [scrambled, setScrambled] = useState<{ letter: string; id: number; used: boolean }[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStarRain, setShowStarRain] = useState(false);
  const [levelStars, setLevelStars] = useState(0);
  const [wordPerfect, setWordPerfect] = useState(true);
  const [progress, setProgress] = useState<LevelProgress[]>([
    { completed: false, stars: 0 },
    { completed: false, stars: 0 },
    { completed: false, stars: 0 },
  ]);
  const [mounted, setMounted] = useState(false);
  const [bubbleAnimReady, setBubbleAnimReady] = useState(false);

  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load progress from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 3) {
          setProgress(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback((newProgress: LevelProgress[]) => {
    setProgress(newProgress);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    } catch {
      // ignore
    }
  }, []);

  // Setup word
  const setupWord = useCallback((levelIdx: number, wordIdx: number) => {
    const word = LEVELS[levelIdx].words[wordIdx];
    const letters = word.letters;
    setFilledSlots(new Array(letters.length).fill(null));
    setScrambled(
      shuffle(letters.map((l, i) => ({ letter: l, id: i, used: false })))
    );
    setIsCorrect(false);
    setIsWrong(false);
    setWordPerfect(true);
    setBubbleAnimReady(false);
    setTimeout(() => setBubbleAnimReady(true), 50);
  }, []);

  // Start a level
  const startLevel = useCallback(
    (levelIdx: number) => {
      setCurrentLevel(levelIdx);
      setCurrentWordIdx(0);
      setLevelStars(0);
      setScreen("playing");
      setupWord(levelIdx, 0);
    },
    [setupWord]
  );

  // Handle letter bubble tap
  const handleBubbleTap = useCallback(
    (bubbleIdx: number) => {
      if (isCorrect || isWrong) return;

      const bubble = scrambled[bubbleIdx];
      if (bubble.used) return;

      // Find first empty slot
      const emptySlotIdx = filledSlots.indexOf(null);
      if (emptySlotIdx === -1) return;

      const newSlots = [...filledSlots];
      newSlots[emptySlotIdx] = `${bubble.id}`;
      setFilledSlots(newSlots);

      const newScrambled = [...scrambled];
      newScrambled[bubbleIdx] = { ...bubble, used: true };
      setScrambled(newScrambled);

      // Check if all slots are filled
      if (newSlots.every((s) => s !== null)) {
        // Build the spelled word from slots
        const spelled = newSlots.map((s) => {
          const id = parseInt(s!);
          const orig = LEVELS[currentLevel].words[currentWordIdx].letters;
          return orig[id];
        });
        const target = LEVELS[currentLevel].words[currentWordIdx].letters;

        if (spelled.every((l, i) => l === target[i])) {
          // Correct
          setIsCorrect(true);
          setShowConfetti(true);
          const earned = wordPerfect;
          const newStars = levelStars + (earned ? 1 : 0);
          setLevelStars(newStars);

          checkTimeoutRef.current = setTimeout(() => {
            setShowConfetti(false);
            const nextWordIdx = currentWordIdx + 1;
            if (nextWordIdx >= LEVELS[currentLevel].words.length) {
              // Level complete
              const newProgress = [...progress];
              newProgress[currentLevel] = {
                completed: true,
                stars: Math.max(newProgress[currentLevel].stars, newStars),
              };
              saveProgress(newProgress);

              if (currentLevel === 2) {
                setScreen("all-complete");
              } else {
                setScreen("level-complete");
              }
            } else {
              setCurrentWordIdx(nextWordIdx);
              setupWord(currentLevel, nextWordIdx);
            }
          }, 1500);
        } else {
          // Wrong
          setIsWrong(true);
          setWordPerfect(false);
          checkTimeoutRef.current = setTimeout(() => {
            // Reset slots and bubbles
            setFilledSlots(new Array(LEVELS[currentLevel].words[currentWordIdx].letters.length).fill(null));
            setScrambled((prev) => prev.map((b) => ({ ...b, used: false })));
            setIsWrong(false);
          }, 800);
        }
      }
    },
    [
      scrambled,
      filledSlots,
      isCorrect,
      isWrong,
      currentLevel,
      currentWordIdx,
      wordPerfect,
      levelStars,
      progress,
      saveProgress,
      setupWord,
    ]
  );

  // Handle slot tap (remove letter)
  const handleSlotTap = useCallback(
    (slotIdx: number) => {
      if (isCorrect || isWrong) return;

      const slotValue = filledSlots[slotIdx];
      if (slotValue === null) return;

      const bubbleId = parseInt(slotValue);

      // Remove from slot
      const newSlots = [...filledSlots];
      newSlots[slotIdx] = null;

      // Shift remaining letters left to fill the gap
      const compacted: (string | null)[] = newSlots.filter((s) => s !== null);
      while (compacted.length < newSlots.length) compacted.push(null);
      setFilledSlots(compacted);

      // Mark bubble as unused
      setScrambled((prev) =>
        prev.map((b) => (b.id === bubbleId ? { ...b, used: false } : b))
      );
    },
    [filledSlots, isCorrect, isWrong]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, []);

  // SSR guard
  if (!mounted) {
    return (
      <div className="max-w-lg mx-auto px-5 pt-8 pb-12 text-center">
        <div className="text-6xl mb-4" style={{ animation: "float 2s ease-in-out infinite" }}>
          ✏️
        </div>
      </div>
    );
  }

  // ── Level Select Screen ──────────────────────────────────────────────────

  if (screen === "levels") {
    const hasAnyComplete = progress.some((p) => p.completed);

    return (
      <div className="max-w-lg mx-auto px-5 pt-8 pb-12">
        <style>{`
          @keyframes pop-in {
            0% { opacity: 0; transform: scale(0.5) translateY(20px); }
            60% { transform: scale(1.05) translateY(-5px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3" style={{ animation: "float 3s ease-in-out infinite" }}>
            ✏️
          </div>
          <h1 className="text-3xl font-black mb-2" style={{ color: "#FF922B" }}>
            هجّائي
          </h1>
          <p className="text-lg font-semibold" style={{ color: "#636E72" }}>
            تعلّم تهجئة الكلمات
          </p>
        </div>

        {/* Level Cards */}
        <div className="space-y-4">
          {LEVELS.map((level, idx) => {
            const isUnlocked = idx === 0 || progress[idx - 1].completed;
            const levelProgress = progress[idx];

            return (
              <button
                key={idx}
                disabled={!isUnlocked}
                onClick={() => isUnlocked && startLevel(idx)}
                className="w-full text-right"
                style={{
                  animation: `pop-in 0.5s ease-out forwards`,
                  animationDelay: `${idx * 0.15}s`,
                  opacity: 0,
                }}
              >
                <div
                  className="rounded-3xl p-5 border-[3px] transition-all duration-200"
                  style={{
                    background: isUnlocked ? "#FFFFFF" : "#F5F5F5",
                    borderColor: isUnlocked ? "#FF922B" : "#DDD",
                    opacity: isUnlocked ? 1 : 0.6,
                    transform: isUnlocked ? "scale(1)" : "scale(0.98)",
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Level number */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0"
                      style={{
                        background: isUnlocked ? "#FFF0E0" : "#EEE",
                        color: isUnlocked ? "#FF922B" : "#AAA",
                      }}
                    >
                      {isUnlocked ? toArabicNum(idx + 1) : "🔒"}
                    </div>

                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-1" style={{ color: isUnlocked ? "#2D3436" : "#AAA" }}>
                        {level.name}
                      </h2>
                      <p className="text-sm font-medium" style={{ color: "#636E72" }}>
                        {idx === 0
                          ? "كلمات من ٣ حروف"
                          : idx === 1
                          ? "كلمات من ٣-٤ حروف"
                          : "كلمات من ٤-٥ حروف"}
                      </p>
                      {/* Stars */}
                      {isUnlocked && (
                        <div className="flex gap-1 mt-2" dir="ltr">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <span
                              key={i}
                              className="text-sm"
                              style={{ opacity: i < levelProgress.stars ? 1 : 0.2 }}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Back */}
        <div className="text-center mt-8">
          <Link
            href="/kids"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold transition-transform active:scale-95"
            style={{ background: "#FFF0E0", color: "#FF922B" }}
          >
            <span>→</span>
            <span>رجوع</span>
          </Link>
        </div>
      </div>
    );
  }

  // ── Level Complete Screen ────────────────────────────────────────────────

  if (screen === "level-complete") {
    return (
      <div className="max-w-lg mx-auto px-5 pt-8 pb-12 text-center">
        <StarRain />
        <style>{`
          @keyframes scale-bounce {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); }
          }
        `}</style>

        <div
          style={{
            animation: "scale-bounce 0.6s ease-out forwards",
          }}
        >
          <div className="text-8xl mb-4">🎉</div>
          <h1 className="text-3xl font-black mb-2" style={{ color: "#FF922B" }}>
            أحسنت!
          </h1>
          <p className="text-xl font-bold mb-6" style={{ color: "#636E72" }}>
            أكملت {LEVELS[currentLevel].name}
          </p>

          {/* Stars earned */}
          <div
            className="inline-flex items-center gap-1 px-6 py-3 rounded-2xl mb-8"
            style={{ background: "#FFF8E0" }}
          >
            <span className="text-lg font-bold ml-2" style={{ color: "#FF922B" }}>
              {toArabicNum(levelStars)} / {toArabicNum(10)}
            </span>
            <span className="text-2xl">⭐</span>
          </div>
        </div>

        <div className="space-y-3">
          {currentLevel < 2 && (
            <button
              onClick={() => startLevel(currentLevel + 1)}
              className="w-full py-4 rounded-2xl text-xl font-black text-white transition-transform active:scale-95"
              style={{ background: "#FF922B" }}
            >
              المستوى التالي ←
            </button>
          )}
          <button
            onClick={() => startLevel(currentLevel)}
            className="w-full py-4 rounded-2xl text-xl font-bold transition-transform active:scale-95"
            style={{ background: "#FFF0E0", color: "#FF922B" }}
          >
            إعادة المستوى
          </button>
          <button
            onClick={() => setScreen("levels")}
            className="w-full py-3 rounded-2xl text-lg font-bold transition-transform active:scale-95"
            style={{ background: "#F5F5F5", color: "#636E72" }}
          >
            اختيار المستوى
          </button>
        </div>
      </div>
    );
  }

  // ── All Complete Screen ──────────────────────────────────────────────────

  if (screen === "all-complete") {
    return (
      <div className="max-w-lg mx-auto px-5 pt-8 pb-12 text-center">
        <StarRain />
        <style>{`
          @keyframes mega-bounce {
            0% { transform: scale(0) rotate(-10deg); }
            40% { transform: scale(1.3) rotate(5deg); }
            60% { transform: scale(0.9) rotate(-3deg); }
            80% { transform: scale(1.05) rotate(1deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
        `}</style>

        <div style={{ animation: "mega-bounce 0.8s ease-out forwards" }}>
          <div className="text-8xl mb-2">🏆</div>
          <div className="text-6xl mb-4">🎊</div>
          <h1 className="text-4xl font-black mb-2" style={{ color: "#FF922B" }}>
            ممتاز!
          </h1>
          <p className="text-xl font-bold mb-2" style={{ color: "#636E72" }}>
            أكملت جميع المستويات!
          </p>
          <p className="text-lg mb-8" style={{ color: "#636E72" }}>
            أنت بطل الهجاء! 🌟
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setScreen("levels")}
            className="w-full py-4 rounded-2xl text-xl font-black text-white transition-transform active:scale-95"
            style={{ background: "#FF922B" }}
          >
            العودة للمستويات
          </button>
          <Link
            href="/kids"
            className="block w-full py-4 rounded-2xl text-xl font-bold transition-transform active:scale-95 text-center"
            style={{ background: "#FFF0E0", color: "#FF922B" }}
          >
            ألعاب أخرى
          </Link>
        </div>
      </div>
    );
  }

  // ── Playing Screen ───────────────────────────────────────────────────────

  const currentWord = LEVELS[currentLevel].words[currentWordIdx];

  return (
    <div className="max-w-lg mx-auto px-5 pt-4 pb-12">
      <style>{`
        @keyframes bubble-in {
          0% { opacity: 0; transform: scale(0.3) translateY(20px); }
          50% { opacity: 1; transform: scale(1.1); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes slot-pop {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-8px); }
          20% { transform: translateX(8px); }
          30% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          50% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
          70% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
        }
        @keyframes green-pulse {
          0% { box-shadow: 0 0 0 0 rgba(81, 207, 102, 0.6); }
          70% { box-shadow: 0 0 0 12px rgba(81, 207, 102, 0); }
          100% { box-shadow: 0 0 0 0 rgba(81, 207, 102, 0); }
        }
        @keyframes emoji-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
        }
      `}</style>

      {showConfetti && <Confetti />}

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        {/* Back */}
        <button
          onClick={() => {
            if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
            setScreen("levels");
          }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-transform active:scale-90"
          style={{ background: "#FFF0E0", color: "#FF922B" }}
        >
          →
        </button>

        {/* Level badge */}
        <div
          className="px-4 py-1.5 rounded-full text-sm font-bold"
          style={{ background: "#FFF0E0", color: "#FF922B" }}
        >
          {LEVELS[currentLevel].name}
        </div>

        {/* Word progress */}
        <div
          className="px-4 py-1.5 rounded-full text-sm font-bold"
          style={{ background: "#FFF0E0", color: "#FF922B" }}
        >
          {toArabicNum(currentWordIdx + 1)}/{toArabicNum(10)}
        </div>
      </div>

      {/* Stars counter */}
      <div className="flex items-center justify-center gap-1 mb-6">
        <span className="text-lg font-bold" style={{ color: "#FF922B" }}>
          {toArabicNum(levelStars)}
        </span>
        <span className="text-lg">⭐</span>
      </div>

      {/* Emoji Display */}
      <div className="text-center mb-8">
        <div
          className="text-8xl mb-2 inline-block"
          style={{ animation: "emoji-float 3s ease-in-out infinite" }}
        >
          {currentWord.emoji}
        </div>
      </div>

      {/* Letter Slots */}
      <div
        className="flex justify-center gap-2 mb-10 flex-row-reverse"
        style={{
          animation: isWrong ? "shake 0.5s ease-in-out" : undefined,
        }}
      >
        {currentWord.letters.map((_, slotIdx) => {
          const slotValue = filledSlots[slotIdx];
          const isFilled = slotValue !== null;

          let displayLetter = "";
          if (isFilled) {
            const bubbleId = parseInt(slotValue!);
            displayLetter =
              LEVELS[currentLevel].words[currentWordIdx].letters[bubbleId];
          }

          return (
            <button
              key={slotIdx}
              onClick={() => handleSlotTap(slotIdx)}
              className="flex items-center justify-center rounded-2xl transition-all duration-200"
              style={{
                width: currentWord.letters.length > 5 ? 48 : 56,
                height: currentWord.letters.length > 5 ? 48 : 56,
                background: isCorrect
                  ? "#D4F4DD"
                  : isFilled
                  ? "#FFF0E0"
                  : "#FFFFFF",
                border: isCorrect
                  ? "3px solid #51CF66"
                  : isFilled
                  ? "3px solid #FF922B"
                  : "3px dashed #DDD",
                animation: isCorrect
                  ? "green-pulse 0.6s ease-out"
                  : isFilled
                  ? "slot-pop 0.2s ease-out"
                  : undefined,
                boxShadow: isFilled
                  ? "0 2px 8px rgba(0,0,0,0.08)"
                  : "none",
              }}
            >
              {isFilled && (
                <span className="text-2xl font-black" style={{ color: "#2D3436" }}>
                  {displayLetter}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Scrambled Letter Bubbles */}
      <div className="flex flex-wrap justify-center gap-3">
        {scrambled.map((bubble, idx) => {
          if (bubble.used) {
            return (
              <div
                key={bubble.id}
                className="rounded-2xl"
                style={{
                  width: 64,
                  height: 64,
                  background: "transparent",
                  border: "3px dashed #EEE",
                }}
              />
            );
          }

          const colorIdx = bubble.id % PASTEL_COLORS.length;
          const bgColor = PASTEL_COLORS[colorIdx];

          return (
            <button
              key={bubble.id}
              onClick={() => handleBubbleTap(idx)}
              className="rounded-2xl flex items-center justify-center transition-transform active:scale-90"
              style={{
                width: 64,
                height: 64,
                background: bgColor,
                border: "3px solid rgba(0,0,0,0.06)",
                boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                animation: bubbleAnimReady
                  ? `bubble-in 0.4s ease-out backwards`
                  : undefined,
                animationDelay: bubbleAnimReady ? `${idx * 0.08}s` : undefined,
              }}
            >
              <span className="text-3xl font-black" style={{ color: "#2D3436" }}>
                {bubble.letter}
              </span>
            </button>
          );
        })}
      </div>

      {/* Correct feedback */}
      {isCorrect && (
        <div
          className="text-center mt-8"
          style={{ animation: "scale-bounce 0.4s ease-out forwards" }}
        >
          <style>{`
            @keyframes scale-bounce {
              0% { transform: scale(0); }
              50% { transform: scale(1.2); }
              70% { transform: scale(0.9); }
              100% { transform: scale(1); }
            }
          `}</style>
          <span className="text-3xl font-black" style={{ color: "#51CF66" }}>
            أحسنت! 🎉
          </span>
        </div>
      )}
    </div>
  );
}
