"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

// ── Data ──

const ARABIC_LETTERS = [
  "ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر",
  "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف",
  "ق", "ك", "ل", "م", "ن", "ه", "و", "ي",
];

const LETTER_NAMES: Record<string, string> = {
  "ا": "الألف", "ب": "الباء", "ت": "التاء", "ث": "الثاء",
  "ج": "الجيم", "ح": "الحاء", "خ": "الخاء", "د": "الدال",
  "ذ": "الذال", "ر": "الراء", "ز": "الزاي", "س": "السين",
  "ش": "الشين", "ص": "الصاد", "ض": "الضاد", "ط": "الطاء",
  "ظ": "الظاء", "ع": "العين", "غ": "الغين", "ف": "الفاء",
  "ق": "القاف", "ك": "الكاف", "ل": "اللام", "م": "الميم",
  "ن": "النون", "ه": "الهاء", "و": "الواو", "ي": "الياء",
};

const LETTER_FUN_FACTS: Record<string, string> = {
  "ا": "أول حرف في الأبجدية العربية",
  "ب": "أول حرف في كلمة بسم الله",
  "ت": "حرف التاء له نقطتان فوقه",
  "ث": "حرف الثاء له ثلاث نقاط",
  "ج": "حرف الجيم نقطته في الوسط",
  "ح": "حرف الحاء بدون نقاط",
  "خ": "حرف الخاء نقطته فوقه",
  "د": "حرف الدال بدون نقاط",
  "ذ": "حرف الذال له نقطة واحدة",
  "ر": "حرف الراء بدون نقاط",
  "ز": "حرف الزاي له نقطة واحدة",
  "س": "حرف السين له ثلاث أسنان",
  "ش": "حرف الشين له ثلاث نقاط",
  "ص": "حرف الصاد بدون نقاط",
  "ض": "حرف الضاد خاص باللغة العربية",
  "ط": "حرف الطاء بدون نقاط",
  "ظ": "حرف الظاء له نقطة واحدة",
  "ع": "حرف العين بدون نقاط",
  "غ": "حرف الغين نقطته فوقه",
  "ف": "حرف الفاء نقطته فوقه",
  "ق": "حرف القاف له نقطتان فوقه",
  "ك": "حرف الكاف فيه همزة صغيرة",
  "ل": "حرف اللام بدون نقاط",
  "م": "حرف الميم بدون نقاط",
  "ن": "حرف النون نقطته فوقه",
  "ه": "حرف الهاء بدون نقاط",
  "و": "حرف الواو بدون نقاط",
  "ي": "حرف الياء نقطتاه تحته",
};

// Letter forms: [isolated, beginning, middle, end]
const LETTER_FORMS: Record<string, [string, string, string, string]> = {
  "ب": ["ب", "بـ", "ـبـ", "ـب"],
  "ت": ["ت", "تـ", "ـتـ", "ـت"],
  "ث": ["ث", "ثـ", "ـثـ", "ـث"],
  "ن": ["ن", "نـ", "ـنـ", "ـن"],
  "ي": ["ي", "يـ", "ـيـ", "ـي"],
  "ج": ["ج", "جـ", "ـجـ", "ـج"],
  "ح": ["ح", "حـ", "ـحـ", "ـح"],
  "خ": ["خ", "خـ", "ـخـ", "ـخ"],
  "س": ["س", "سـ", "ـسـ", "ـس"],
  "ش": ["ش", "شـ", "ـشـ", "ـش"],
  "ص": ["ص", "صـ", "ـصـ", "ـص"],
  "ض": ["ض", "ضـ", "ـضـ", "ـض"],
  "ع": ["ع", "عـ", "ـعـ", "ـع"],
  "غ": ["غ", "غـ", "ـغـ", "ـغ"],
  "ف": ["ف", "فـ", "ـفـ", "ـف"],
  "ق": ["ق", "قـ", "ـقـ", "ـق"],
  "ك": ["ك", "كـ", "ـكـ", "ـك"],
  "ل": ["ل", "لـ", "ـلـ", "ـل"],
  "م": ["م", "مـ", "ـمـ", "ـم"],
  "ه": ["ه", "هـ", "ـهـ", "ـه"],
};

const FORM_LABELS = ["منفصل", "أول الكلمة", "وسط الكلمة", "آخر الكلمة"];

interface WordItem {
  emoji: string;
  word: string;
  firstLetter: string;
}

const WORD_DATA: WordItem[] = [
  { emoji: "🍎", word: "تفاح", firstLetter: "ت" },
  { emoji: "🐱", word: "قطة", firstLetter: "ق" },
  { emoji: "🌙", word: "قمر", firstLetter: "ق" },
  { emoji: "🏠", word: "بيت", firstLetter: "ب" },
  { emoji: "☀️", word: "شمس", firstLetter: "ش" },
  { emoji: "🐟", word: "سمك", firstLetter: "س" },
  { emoji: "🌹", word: "ورد", firstLetter: "و" },
  { emoji: "🐕", word: "كلب", firstLetter: "ك" },
  { emoji: "🔥", word: "نار", firstLetter: "ن" },
  { emoji: "🦁", word: "أسد", firstLetter: "أ" },
  { emoji: "📖", word: "كتاب", firstLetter: "ك" },
  { emoji: "🍌", word: "موز", firstLetter: "م" },
  { emoji: "🐄", word: "بقرة", firstLetter: "ب" },
  { emoji: "✏️", word: "قلم", firstLetter: "ق" },
  { emoji: "🚗", word: "سيارة", firstLetter: "س" },
];

const OPTION_COLORS = [
  { bg: "#FFE8E8", border: "#FF6B6B" },
  { bg: "#E8F4FD", border: "#4A90D9" },
  { bg: "#E8FFE8", border: "#51CF66" },
  { bg: "#F0E8FF", border: "#CC5DE8" },
];

const PRAISE_WORDS = ["!ممتاز", "!أحسنت", "!رائع", "!بطل", "!عبقري"];
const ROUNDS_PER_LEVEL = 8;
const STORAGE_KEY = "kalima_kids_horouf_progress";

// ── Helpers ──

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomPraise(): string {
  return PRAISE_WORDS[Math.floor(Math.random() * PRAISE_WORDS.length)];
}

// ── Puzzle generators ──

interface Level1Puzzle {
  type: 1;
  target: string;
  options: string[];
}

function pickLevel1Puzzle(): Level1Puzzle {
  const target = ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)];
  const wrong = shuffle(ARABIC_LETTERS.filter((l) => l !== target)).slice(0, 3);
  const options = shuffle([target, ...wrong]);
  return { type: 1, target, options };
}

interface Level2Puzzle {
  type: 2;
  letterKey: string;
  shownForm: string;
  shownFormLabel: string;
  correctForm: string;
  correctFormLabel: string;
  options: string[];
}

function pickLevel2Puzzle(): Level2Puzzle {
  const keys = Object.keys(LETTER_FORMS);
  const letterKey = keys[Math.floor(Math.random() * keys.length)];
  const forms = LETTER_FORMS[letterKey];

  // Pick two different form indices
  const indices = [0, 1, 2, 3];
  const shuffledIndices = shuffle(indices);
  const shownIdx = shuffledIndices[0];
  const correctIdx = shuffledIndices[1];

  const shownForm = forms[shownIdx];
  const correctForm = forms[correctIdx];

  // Wrong options: pick forms from other letters at the same position
  const otherKeys = shuffle(keys.filter((k) => k !== letterKey));
  const wrongForms = otherKeys.slice(0, 3).map((k) => LETTER_FORMS[k][correctIdx]);
  const options = shuffle([correctForm, ...wrongForms]);

  return {
    type: 2,
    letterKey,
    shownForm,
    shownFormLabel: FORM_LABELS[shownIdx],
    correctForm,
    correctFormLabel: FORM_LABELS[correctIdx],
    options,
  };
}

interface Level3Puzzle {
  type: 3;
  wordItem: WordItem;
  options: string[];
}

function pickLevel3Puzzle(usedIndices: Set<number>): Level3Puzzle {
  // Try to pick an unused word
  const available = WORD_DATA.map((_, i) => i).filter((i) => !usedIndices.has(i));
  const pool = available.length > 0 ? available : WORD_DATA.map((_, i) => i);
  const idx = pool[Math.floor(Math.random() * pool.length)];
  const wordItem = WORD_DATA[idx];

  // Wrong letters (not the correct first letter, and also not "أ" duplicated with "ا" confusion)
  const allFirstLetters = [...new Set(WORD_DATA.map((w) => w.firstLetter))];
  const wrongLetters = shuffle(
    allFirstLetters.filter((l) => l !== wordItem.firstLetter)
  ).slice(0, 3);

  // If not enough from word data, fill from alphabet
  while (wrongLetters.length < 3) {
    const random = ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)];
    if (random !== wordItem.firstLetter && !wrongLetters.includes(random)) {
      wrongLetters.push(random);
    }
  }

  const options = shuffle([wordItem.firstLetter, ...wrongLetters.slice(0, 3)]);
  return { type: 3, wordItem, options };
}

type Puzzle = Level1Puzzle | Level2Puzzle | Level3Puzzle;

// ── Progress ──

interface Progress {
  level1Stars: number;
  level2Stars: number;
  level3Stars: number;
  level1Done: boolean;
  level2Done: boolean;
  level3Done: boolean;
}

function loadProgress(): Progress {
  if (typeof window === "undefined") {
    return { level1Stars: 0, level2Stars: 0, level3Stars: 0, level1Done: false, level2Done: false, level3Done: false };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { level1Stars: 0, level2Stars: 0, level3Stars: 0, level1Done: false, level2Done: false, level3Done: false };
}

function saveProgress(p: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

// ── Component ──

type Screen = "levelSelect" | "playing" | "levelComplete" | "allComplete";

export default function HoroufPage() {
  const [screen, setScreen] = useState<Screen>("levelSelect");
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState<boolean[]>([]);
  const [answerState, setAnswerState] = useState<"idle" | "correct" | "wrong">("idle");
  const [roundPerfect, setRoundPerfect] = useState(true);
  const [puzzle, setPuzzle] = useState<Puzzle>(() => pickLevel1Puzzle());
  const [showEntry, setShowEntry] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showFact, setShowFact] = useState(false);
  const [praiseText, setPraiseText] = useState("!ممتاز");
  const usedWordIndices = useRef<Set<number>>(new Set());

  // Entry animation
  useEffect(() => {
    if (showEntry) {
      const t = setTimeout(() => setShowEntry(false), 400);
      return () => clearTimeout(t);
    }
  }, [showEntry, round]);

  const generatePuzzle = useCallback((level: number): Puzzle => {
    if (level === 1) return pickLevel1Puzzle();
    if (level === 2) return pickLevel2Puzzle();
    return pickLevel3Puzzle(usedWordIndices.current);
  }, []);

  const startLevel = useCallback((level: number) => {
    setCurrentLevel(level);
    setRound(0);
    setScore(0);
    setStars([]);
    setAnswerState("idle");
    setRoundPerfect(true);
    setSelectedIdx(null);
    setShowEntry(true);
    setShowFact(false);
    usedWordIndices.current = new Set();
    const p = level === 1 ? pickLevel1Puzzle() : level === 2 ? pickLevel2Puzzle() : pickLevel3Puzzle(new Set());
    setPuzzle(p);
    setScreen("playing");
  }, []);

  const nextRound = useCallback(() => {
    const next = round + 1;
    if (next >= ROUNDS_PER_LEVEL) {
      // Level done
      const newProgress = { ...progress };
      if (currentLevel === 1) {
        newProgress.level1Done = true;
        newProgress.level1Stars = Math.max(newProgress.level1Stars, score + (roundPerfect ? 1 : 0));
      } else if (currentLevel === 2) {
        newProgress.level2Done = true;
        newProgress.level2Stars = Math.max(newProgress.level2Stars, score + (roundPerfect ? 1 : 0));
      } else {
        newProgress.level3Done = true;
        newProgress.level3Stars = Math.max(newProgress.level3Stars, score + (roundPerfect ? 1 : 0));
      }
      setProgress(newProgress);
      saveProgress(newProgress);

      if (currentLevel === 3 && newProgress.level1Done && newProgress.level2Done && newProgress.level3Done) {
        setScreen("allComplete");
      } else {
        setScreen("levelComplete");
      }
      return;
    }
    setRound(next);
    setPuzzle(generatePuzzle(currentLevel));
    setAnswerState("idle");
    setRoundPerfect(true);
    setSelectedIdx(null);
    setShowEntry(true);
    setShowFact(false);
  }, [round, currentLevel, progress, score, roundPerfect, generatePuzzle]);

  const handleTap = useCallback(
    (option: string, idx: number) => {
      if (answerState === "correct" || showFact) return;
      setSelectedIdx(idx);

      let isCorrect = false;
      if (puzzle.type === 1) isCorrect = option === puzzle.target;
      else if (puzzle.type === 2) isCorrect = option === puzzle.correctForm;
      else if (puzzle.type === 3) isCorrect = option === puzzle.wordItem.firstLetter;

      if (isCorrect) {
        setAnswerState("correct");
        setPraiseText(randomPraise());
        const earned = roundPerfect;
        setScore((s) => s + (earned ? 1 : 0));
        setStars((prev) => [...prev, earned]);

        if (puzzle.type === 3) {
          const wordIdx = WORD_DATA.findIndex((w) => w === puzzle.wordItem);
          if (wordIdx >= 0) usedWordIndices.current.add(wordIdx);
        }

        // For level 1, show fact before moving on
        if (puzzle.type === 1) {
          setTimeout(() => setShowFact(true), 600);
          // nextRound will be triggered by a tap on the fact card
        } else {
          setTimeout(() => nextRound(), 1200);
        }
      } else {
        setAnswerState("wrong");
        setRoundPerfect(false);
        setTimeout(() => {
          setAnswerState("idle");
          setSelectedIdx(null);
        }, 600);
      }
    },
    [answerState, puzzle, roundPerfect, nextRound, showFact]
  );

  const handleFactTap = useCallback(() => {
    if (showFact) {
      nextRound();
    }
  }, [showFact, nextRound]);

  // ── Level Select Screen ──
  if (screen === "levelSelect") {
    const levels = [
      {
        num: 1,
        name: "تعرف على الحروف",
        desc: "اختر الحرف الصحيح",
        unlocked: true,
        done: progress.level1Done,
        bestStars: progress.level1Stars,
        icon: "🔤",
      },
      {
        num: 2,
        name: "أشكال الحروف",
        desc: "تعرف على الحرف بأشكاله المختلفة",
        unlocked: progress.level1Done,
        done: progress.level2Done,
        bestStars: progress.level2Stars,
        icon: "✨",
      },
      {
        num: 3,
        name: "أول حرف",
        desc: "ما هو أول حرف في الكلمة؟",
        unlocked: progress.level2Done,
        done: progress.level3Done,
        bestStars: progress.level3Stars,
        icon: "🖼️",
      },
    ];

    return (
      <div
        className="flex flex-col items-center px-4 py-6 gap-6 overflow-y-auto"
        style={{ background: "#FFF8F0" }}
      >
        <div className="w-full max-w-lg flex items-center justify-between">
          <Link
            href="/kids"
            className="flex items-center gap-1 text-lg font-bold px-4 py-2 rounded-2xl"
            style={{ background: "#FF6B6B", color: "#fff" }}
          >
            <span>→</span>
            <span>رجوع</span>
          </Link>
          <h1 className="text-3xl font-black" style={{ color: "#FF6B6B" }}>
            الحروف
          </h1>
        </div>

        <div className="w-full max-w-lg flex flex-col gap-4">
          {levels.map((level) => (
            <button
              key={level.num}
              disabled={!level.unlocked}
              onClick={() => level.unlocked && startLevel(level.num)}
              className="w-full rounded-3xl p-5 border-3 transition-all duration-200 active:scale-[0.97] text-right"
              style={{
                background: level.unlocked ? "#fff" : "#F0F0F0",
                borderWidth: 3,
                borderColor: level.unlocked ? "#FF6B6B" : "#D0D0D0",
                opacity: level.unlocked ? 1 : 0.6,
                cursor: level.unlocked ? "pointer" : "not-allowed",
              }}
            >
              <div className="flex items-center gap-4" dir="rtl">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{
                    background: level.unlocked ? "#FFE8E8" : "#E8E8E8",
                  }}
                >
                  {level.unlocked ? level.icon : "🔒"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-bold px-2 py-0.5 rounded-lg"
                      style={{
                        background: level.unlocked ? "#FF6B6B" : "#B0B0B0",
                        color: "#fff",
                      }}
                    >
                      المستوى {level.num}
                    </span>
                    {level.done && (
                      <span className="text-sm font-bold text-green-600">✓</span>
                    )}
                  </div>
                  <p className="text-xl font-black mt-1" style={{ color: "#2D3436" }}>
                    {level.name}
                  </p>
                  <p className="text-base mt-0.5" style={{ color: "#636E72" }}>
                    {level.desc}
                  </p>
                  {level.done && (
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: ROUNDS_PER_LEVEL }).map((_, i) => (
                        <span
                          key={i}
                          className="text-lg"
                          style={{
                            opacity: i < level.bestStars ? 1 : 0.2,
                            filter: i < level.bestStars ? "none" : "grayscale(1)",
                          }}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── All Complete Screen ──
  if (screen === "allComplete") {
    return (
      <div
        className="flex flex-col items-center justify-center px-4 gap-6 overflow-y-auto"
        style={{ background: "#FFF8F0" }}
      >
        <div className="text-8xl animate-bounce">🏆</div>
        <h1 className="text-4xl font-black text-center" style={{ color: "#FF6B6B" }}>
          !أنت بطل الحروف
        </h1>
        <p className="text-2xl text-center" style={{ color: "#636E72" }}>
          أكملت كل المستويات
        </p>
        <div className="flex gap-2">
          {[progress.level1Stars, progress.level2Stars, progress.level3Stars].map(
            (s, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl"
                style={{ background: "#fff", border: "2px solid #FF6B6B" }}
              >
                <span className="text-sm font-bold" style={{ color: "#FF6B6B" }}>
                  المستوى {i + 1}
                </span>
                <span className="text-xl font-black">{s}/{ROUNDS_PER_LEVEL} ⭐</span>
              </div>
            )
          )}
        </div>
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => setScreen("levelSelect")}
            className="px-8 py-4 rounded-3xl text-white text-xl font-bold shadow-lg active:scale-95 transition-transform"
            style={{ background: "#FF6B6B" }}
          >
            المستويات
          </button>
          <Link
            href="/kids"
            className="px-8 py-4 rounded-3xl text-white text-xl font-bold shadow-lg active:scale-95 transition-transform"
            style={{ background: "#4A90D9" }}
          >
            الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  // ── Level Complete Screen ──
  if (screen === "levelComplete") {
    const finalScore = score;
    const nextLevel = currentLevel < 3 ? currentLevel + 1 : null;
    const canNext = nextLevel !== null;

    return (
      <div
        className="flex flex-col items-center justify-center px-4 gap-6 overflow-y-auto"
        style={{ background: "#FFF8F0" }}
      >
        <div className="text-7xl animate-bounce">🎉</div>
        <h1 className="text-4xl font-black" style={{ color: "#FF6B6B" }}>
          !أحسنت
        </h1>
        <p className="text-xl font-bold" style={{ color: "#636E72" }}>
          أكملت المستوى {currentLevel}
        </p>
        <div className="flex gap-1 flex-wrap justify-center">
          {stars.map((earned, i) => (
            <span
              key={i}
              className="text-4xl"
              style={{
                opacity: earned ? 1 : 0.25,
                filter: earned ? "none" : "grayscale(1)",
              }}
            >
              ⭐
            </span>
          ))}
        </div>
        <p className="text-2xl font-bold" style={{ color: "#2D3436" }}>
          {finalScore} من {ROUNDS_PER_LEVEL} نجوم
        </p>
        <div className="flex gap-4 mt-4 flex-wrap justify-center">
          <button
            onClick={() => startLevel(currentLevel)}
            className="px-6 py-4 rounded-3xl text-white text-lg font-bold shadow-lg active:scale-95 transition-transform"
            style={{ background: "#51CF66" }}
          >
            أعد المستوى
          </button>
          {canNext && (
            <button
              onClick={() => startLevel(nextLevel)}
              className="px-6 py-4 rounded-3xl text-white text-lg font-bold shadow-lg active:scale-95 transition-transform"
              style={{ background: "#FF6B6B" }}
            >
              المستوى التالي
            </button>
          )}
          <button
            onClick={() => setScreen("levelSelect")}
            className="px-6 py-4 rounded-3xl text-white text-lg font-bold shadow-lg active:scale-95 transition-transform"
            style={{ background: "#4A90D9" }}
          >
            المستويات
          </button>
        </div>
      </div>
    );
  }

  // ── Playing Screen ──

  const levelTitle =
    currentLevel === 1
      ? "تعرف على الحروف"
      : currentLevel === 2
      ? "أشكال الحروف"
      : "أول حرف";

  return (
    <div
      className="flex flex-col items-center px-4 pt-4 pb-8 gap-3 max-w-lg mx-auto overflow-y-auto"
      style={{ background: "#FFF8F0" }}
    >
      {/* Top bar */}
      <div className="w-full flex items-center justify-between">
        <button
          onClick={() => setScreen("levelSelect")}
          className="flex items-center gap-1 text-lg font-bold px-4 py-2 rounded-2xl"
          style={{ background: "#FF6B6B", color: "#fff" }}
        >
          <span>→</span>
          <span>رجوع</span>
        </button>
        <span className="text-base font-bold px-3 py-1 rounded-xl" style={{ background: "#FFE8E8", color: "#FF6B6B" }}>
          المستوى {currentLevel}
        </span>
        <div
          className="flex items-center gap-1 px-4 py-2 rounded-2xl text-lg font-bold"
          style={{ background: "#FFD43B", color: "#2D3436" }}
        >
          <span>⭐</span>
          <span>{score}</span>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 justify-center">
        {Array.from({ length: ROUNDS_PER_LEVEL }).map((_, i) => (
          <div
            key={i}
            className="w-5 h-5 rounded-full transition-all duration-300"
            style={{
              background:
                i < round
                  ? stars[i]
                    ? "#51CF66"
                    : "#FF6B6B"
                  : i === round
                  ? "#FF6B6B"
                  : "#DFE6E9",
              transform: i === round ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>

      {/* Question area - varies by level */}
      <div className="text-center w-full max-h-[30vh] flex flex-col items-center justify-center">
        {puzzle.type === 1 && (
          <>
            <p className="text-2xl font-bold mb-2" style={{ color: "#636E72" }}>
              أين حرف
            </p>
            <div
              className={`text-8xl font-black leading-none transition-transform duration-300 ${
                showEntry ? "scale-0" : "scale-100"
              }`}
              style={{ color: "#FF6B6B" }}
            >
              {puzzle.target}
            </div>
            <p className="text-2xl font-bold mt-2" style={{ color: "#636E72" }}>
              ؟
            </p>
          </>
        )}

        {puzzle.type === 2 && (
          <>
            <p className="text-xl font-bold mb-1" style={{ color: "#636E72" }}>
              هذا الحرف في {puzzle.shownFormLabel}
            </p>
            <div
              className={`text-8xl font-black leading-none transition-transform duration-300 ${
                showEntry ? "scale-0" : "scale-100"
              }`}
              style={{ color: "#FF6B6B" }}
            >
              {puzzle.shownForm}
            </div>
            <p className="text-xl font-bold mt-2" style={{ color: "#636E72" }}>
              أين نفس الحرف في {puzzle.correctFormLabel}؟
            </p>
          </>
        )}

        {puzzle.type === 3 && (
          <>
            <div
              className={`text-8xl leading-none transition-transform duration-300 ${
                showEntry ? "scale-0" : "scale-100"
              }`}
            >
              {puzzle.wordItem.emoji}
            </div>
            <p
              className={`text-4xl font-black mt-2 transition-transform duration-300 ${
                showEntry ? "scale-0" : "scale-100"
              }`}
              style={{ color: "#FF6B6B" }}
            >
              {puzzle.wordItem.word}
            </p>
            <p className="text-xl font-bold mt-2" style={{ color: "#636E72" }}>
              ما هو أول حرف؟
            </p>
          </>
        )}
      </div>

      {/* Fact card (Level 1 only, after correct answer) */}
      {showFact && puzzle.type === 1 && (
        <button
          onClick={handleFactTap}
          className="w-full rounded-3xl p-5 text-center animate-fadeIn"
          style={{
            background: "#E8FFE8",
            border: "3px solid #51CF66",
          }}
        >
          <p className="text-2xl font-black" style={{ color: "#2D3436" }}>
            هذا حرف {LETTER_NAMES[puzzle.target] || puzzle.target}
          </p>
          <p className="text-lg mt-2" style={{ color: "#636E72" }}>
            {LETTER_FUN_FACTS[puzzle.target] || ""}
          </p>
          <p className="text-base mt-3 font-bold" style={{ color: "#51CF66" }}>
            اضغط للمتابعة ←
          </p>
        </button>
      )}

      {/* Options 2x2 grid */}
      {!showFact && (
        <div className="grid grid-cols-2 gap-4 w-full mt-2">
          {puzzle.options.map((option, idx) => {
            const color = OPTION_COLORS[idx];
            const isSelected = selectedIdx === idx;

            let isCorrectAnswer = false;
            if (puzzle.type === 1) isCorrectAnswer = option === puzzle.target;
            else if (puzzle.type === 2) isCorrectAnswer = option === puzzle.correctForm;
            else if (puzzle.type === 3) isCorrectAnswer = option === puzzle.wordItem.firstLetter;

            let cardStyle: React.CSSProperties = {
              background: color.bg,
              borderColor: color.border,
              borderWidth: 3,
            };
            let extraClass = "";

            if (answerState === "correct" && isSelected && isCorrectAnswer) {
              cardStyle.background = "#C3FAE8";
              cardStyle.borderColor = "#51CF66";
              extraClass = "animate-pulse";
            } else if (answerState === "wrong" && isSelected) {
              cardStyle.background = "#FFE0E0";
              cardStyle.borderColor = "#FF6B6B";
              extraClass = "animate-wiggle";
            }

            return (
              <button
                key={idx}
                onClick={() => handleTap(option, idx)}
                disabled={answerState === "correct"}
                className={`
                  h-24 rounded-3xl flex items-center justify-center
                  shadow-md active:scale-95 transition-all duration-200
                  ${showEntry ? "scale-0" : "scale-100"}
                  ${extraClass}
                `}
                style={{
                  ...cardStyle,
                  transitionDelay: showEntry ? "0ms" : `${idx * 80}ms`,
                  minHeight: "5rem",
                }}
              >
                <span className="text-5xl font-black" style={{ color: "#2D3436" }}>
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Feedback message */}
      <div className="h-12 flex items-center justify-center">
        {answerState === "correct" && !showFact && (
          <p
            className="text-3xl font-black animate-bounce"
            style={{ color: "#51CF66" }}
          >
            {praiseText} 🌟
          </p>
        )}
        {answerState === "wrong" && (
          <p className="text-xl font-bold" style={{ color: "#FF6B6B" }}>
            حاول مرة ثانية
          </p>
        )}
      </div>

      {/* Inline keyframes */}
      <style jsx global>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-6deg); }
          30% { transform: rotate(6deg); }
          45% { transform: rotate(-4deg); }
          60% { transform: rotate(4deg); }
          75% { transform: rotate(-2deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
