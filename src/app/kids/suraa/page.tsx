"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Helpers ────────────────────────────────────────────────────────────────

function toArabic(n: number): string {
  const digits = "٠١٢٣٤٥٦٧٨٩";
  return String(n)
    .split("")
    .map((d) => digits[parseInt(d)])
    .join("");
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeDistractors(correct: number, min: number, max: number, count: number): number[] {
  const set = new Set<number>();
  let attempts = 0;
  while (set.size < count && attempts < 200) {
    const n = randInt(min, max);
    if (n !== correct) set.add(n);
    attempts++;
  }
  return Array.from(set);
}

// ─── Question generators ────────────────────────────────────────────────────

interface Question {
  text: string;
  options: string[];
  correctIndex: number;
}

type QuestionGenerator = () => Question;

function mathAddEasy(): Question {
  const a = randInt(1, 9);
  const b = randInt(1, 9);
  const correct = a + b;
  const distractors = makeDistractors(correct, 2, 18, 3);
  const options = shuffle([correct, ...distractors]);
  return {
    text: `${toArabic(a)} + ${toArabic(b)} = ؟`,
    options: options.map(toArabic),
    correctIndex: options.indexOf(correct),
  };
}

function mathSubEasy(): Question {
  const b = randInt(1, 8);
  const a = randInt(b + 1, 15);
  const correct = a - b;
  const distractors = makeDistractors(correct, 0, 14, 3);
  const options = shuffle([correct, ...distractors]);
  return {
    text: `${toArabic(a)} - ${toArabic(b)} = ؟`,
    options: options.map(toArabic),
    correctIndex: options.indexOf(correct),
  };
}

const LETTER_WORDS: [string, string][] = [
  ["ت", "تفاح"],
  ["ب", "بطة"],
  ["س", "سمكة"],
  ["ق", "قمر"],
  ["ش", "شمس"],
  ["ن", "نجمة"],
  ["و", "وردة"],
  ["ك", "كتاب"],
  ["م", "موز"],
  ["ج", "جمل"],
  ["د", "دب"],
  ["ع", "عنب"],
  ["ف", "فراشة"],
  ["ح", "حصان"],
  ["ز", "زرافة"],
  ["ل", "ليمون"],
];

const ALL_LETTERS = "أبتثجحخدذرزسشصضطظعغفقكلمنهوي".split("");

function letterQuestion(): Question {
  const [letter, word] = LETTER_WORDS[randInt(0, LETTER_WORDS.length - 1)];
  const distractorLetters: string[] = [];
  let attempts = 0;
  while (distractorLetters.length < 3 && attempts < 50) {
    const l = ALL_LETTERS[randInt(0, ALL_LETTERS.length - 1)];
    if (l !== letter && !distractorLetters.includes(l)) distractorLetters.push(l);
    attempts++;
  }
  const options = shuffle([letter, ...distractorLetters]);
  return {
    text: `ما أول حرف في كلمة ${word}؟`,
    options,
    correctIndex: options.indexOf(letter),
  };
}

function countingQuestion(): Question {
  const items: [number, string][] = [
    [3, "المثلث"],
    [4, "المربع"],
    [5, "الخماسي"],
    [6, "السداسي"],
    [8, "المثمن"],
  ];
  const [correct, shape] = items[randInt(0, items.length - 1)];
  const distractors = makeDistractors(correct, 2, 10, 3);
  const options = shuffle([correct, ...distractors]);
  return {
    text: `كم عدد أضلاع ${shape}؟`,
    options: options.map(toArabic),
    correctIndex: options.indexOf(correct),
  };
}

function comparisonQuestion(): Question {
  const a = randInt(1, 50);
  let b = randInt(1, 50);
  while (b === a) b = randInt(1, 50);
  const correct = Math.max(a, b);
  const other = Math.min(a, b);
  const options = shuffle([correct, other]);
  return {
    text: "أيهما أكبر؟",
    options: options.map(toArabic),
    correctIndex: options.indexOf(correct),
  };
}

function mathAddMedium(): Question {
  const a = randInt(10, 50);
  const b = randInt(5, 30);
  const correct = a + b;
  const distractors = makeDistractors(correct, 15, 80, 3);
  const options = shuffle([correct, ...distractors]);
  return {
    text: `${toArabic(a)} + ${toArabic(b)} = ؟`,
    options: options.map(toArabic),
    correctIndex: options.indexOf(correct),
  };
}

function mathSubMedium(): Question {
  const b = randInt(5, 25);
  const a = randInt(b + 5, 60);
  const correct = a - b;
  const distractors = makeDistractors(correct, 0, 55, 3);
  const options = shuffle([correct, ...distractors]);
  return {
    text: `${toArabic(a)} - ${toArabic(b)} = ؟`,
    options: options.map(toArabic),
    correctIndex: options.indexOf(correct),
  };
}

const WORD_STARTS: [string, string[]][] = [
  ["حرف الباء", ["بقرة", "بطيخ", "بيت"]],
  ["حرف السين", ["سيارة", "سمك", "ساعة"]],
  ["حرف الميم", ["مدرسة", "مفتاح", "ملعقة"]],
  ["حرف الكاف", ["كرسي", "كتاب", "كرة"]],
];

function wordStartQuestion(): Question {
  const [label, words] = WORD_STARTS[randInt(0, WORD_STARTS.length - 1)];
  const correctWord = words[randInt(0, words.length - 1)];
  // Pick distractors from other groups
  const otherWords = WORD_STARTS.filter(([l]) => l !== label).flatMap(([, w]) => w);
  const distractors = shuffle(otherWords).slice(0, 3);
  const options = shuffle([correctWord, ...distractors]);
  return {
    text: `أي كلمة تبدأ بـ${label}؟`,
    options,
    correctIndex: options.indexOf(correctWord),
  };
}

function multiplicationQuestion(): Question {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const correct = a * b;
  const distractors = makeDistractors(correct, 4, 81, 3);
  const options = shuffle([correct, ...distractors]);
  return {
    text: `${toArabic(a)} × ${toArabic(b)} = ؟`,
    options: options.map(toArabic),
    correctIndex: options.indexOf(correct),
  };
}

function patternQuestion(): Question {
  const start = randInt(1, 5);
  const step = randInt(2, 4);
  const seq = [start, start + step, start + 2 * step];
  const correct = start + 3 * step;
  const distractors = makeDistractors(correct, correct - 5, correct + 5, 3);
  const options = shuffle([correct, ...distractors]);
  return {
    text: `ما العدد التالي: ${seq.map(toArabic).join(" ، ")} ، ؟`,
    options: options.map(toArabic),
    correctIndex: options.indexOf(correct),
  };
}

// ─── Level config ───────────────────────────────────────────────────────────

interface LevelConfig {
  label: string;
  timePerQuestion: number;
  totalQuestions: number;
  generators: QuestionGenerator[];
}

const LEVELS: LevelConfig[] = [
  {
    label: "سهل",
    timePerQuestion: 10,
    totalQuestions: 15,
    generators: [mathAddEasy, mathSubEasy, letterQuestion, countingQuestion, comparisonQuestion],
  },
  {
    label: "متوسط",
    timePerQuestion: 7,
    totalQuestions: 20,
    generators: [mathAddMedium, mathSubMedium, letterQuestion, wordStartQuestion, comparisonQuestion],
  },
  {
    label: "صعب",
    timePerQuestion: 5,
    totalQuestions: 25,
    generators: [multiplicationQuestion, patternQuestion, mathAddMedium, mathSubMedium, wordStartQuestion],
  },
];

// ─── Storage ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "kids-suraa-progress";

interface SavedProgress {
  bestScores: [number, number, number];
}

function loadProgress(): SavedProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { bestScores: [0, 0, 0] };
}

function saveProgress(p: SavedProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

// ─── Components ─────────────────────────────────────────────────────────────

const OPTION_COLORS = ["#FFE8CC", "#D4F4DD", "#E0E8FF", "#FFE0E0"];
const OPTION_BORDERS = ["#FCC419", "#51CF66", "#4A90D9", "#FF6B6B"];

type GamePhase = "menu" | "playing" | "result";

export default function SuraaPage() {
  const [phase, setPhase] = useState<GamePhase>("menu");
  const [levelIndex, setLevelIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [progress, setProgress] = useState<SavedProgress>({ bestScores: [0, 0, 0] });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const level = LEVELS[levelIndex];

  const generateQuestions = useCallback(
    (lvl: LevelConfig) => {
      const qs: Question[] = [];
      for (let i = 0; i < lvl.totalQuestions; i++) {
        const gen = lvl.generators[i % lvl.generators.length];
        qs.push(gen());
      }
      return shuffle(qs);
    },
    []
  );

  const startGame = useCallback(
    (lvlIdx: number) => {
      const lvl = LEVELS[lvlIdx];
      setLevelIndex(lvlIdx);
      const qs = generateQuestions(lvl);
      setQuestions(qs);
      setCurrentQ(0);
      setScore(0);
      setCombo(0);
      setMultiplier(1);
      setTimeLeft(lvl.timePerQuestion * 1000);
      setFeedback(null);
      setSelectedOption(null);
      startTimeRef.current = Date.now();
      setPhase("playing");
    },
    [generateQuestions]
  );

  // Timer
  useEffect(() => {
    if (phase !== "playing" || feedback !== null) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = level.timePerQuestion * 1000 - elapsed;
      if (remaining <= 0) {
        setTimeLeft(0);
        // Time out - advance
        handleTimeout();
      } else {
        setTimeLeft(remaining);
      }
    }, 50);

    timerRef.current = interval;
    return () => clearInterval(interval);
  }, [phase, currentQ, feedback, level]);

  const handleTimeout = useCallback(() => {
    setFeedback("wrong");
    setCombo(0);
    setMultiplier(1);
    setTimeout(() => advanceQuestion(), 600);
  }, [currentQ, questions.length]);

  const advanceQuestion = useCallback(() => {
    const next = currentQ + 1;
    if (next >= questions.length) {
      setPhase("result");
      // Save best
      const p = loadProgress();
      if (score > p.bestScores[levelIndex]) {
        p.bestScores[levelIndex] = score;
        saveProgress(p);
        setProgress(p);
      }
      // Save stars for homepage
      const totalStars = Math.min(3, Math.floor(score / (questions.length * 50)));
      localStorage.setItem("kids-speed-stars", String(totalStars));
    } else {
      setCurrentQ(next);
      setFeedback(null);
      setSelectedOption(null);
      startTimeRef.current = Date.now();
      setTimeLeft(level.timePerQuestion * 1000);
    }
  }, [currentQ, questions.length, score, levelIndex, level]);

  const handleAnswer = useCallback(
    (optIdx: number) => {
      if (feedback !== null) return;
      setSelectedOption(optIdx);

      const q = questions[currentQ];
      const isCorrect = optIdx === q.correctIndex;

      if (isCorrect) {
        const elapsed = Date.now() - startTimeRef.current;
        const maxTime = level.timePerQuestion * 1000;
        const speedBonus = Math.max(0, Math.floor(((maxTime - elapsed) / maxTime) * 50));
        const basePoints = 100;
        const points = (basePoints + speedBonus) * multiplier;

        setScore((s) => s + points);
        setCombo((c) => c + 1);
        setMultiplier((m) => Math.min(m + 1, 3));
        setFeedback("correct");
      } else {
        setCombo(0);
        setMultiplier(1);
        setFeedback("wrong");
      }

      setTimeout(() => advanceQuestion(), 600);
    },
    [feedback, questions, currentQ, level, multiplier, advanceQuestion]
  );

  // ─── Render: Menu ───────────────────────────────────────────────────────────

  if (phase === "menu") {
    return (
      <div className="h-[calc(100dvh-96px)] flex flex-col px-4" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between pt-4 pb-2">
          <Link
            href="/kids"
            className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full"
            style={{ background: "#FFF3D4", color: "#E67700", border: "2px solid #FCC419" }}
          >
            <span>←</span>
            <span>رجوع</span>
          </Link>
          <h1 className="text-2xl font-black" style={{ color: "#2D3436" }}>
            ⚡ سرعة
          </h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-center text-sm" style={{ color: "#636E72" }}>
            أجب بأسرع ما يمكن قبل انتهاء الوقت!
          </p>

          <div className="w-full max-w-sm flex flex-col gap-3">
            {LEVELS.map((lvl, i) => (
              <button
                key={i}
                onClick={() => startGame(i)}
                className="w-full py-4 rounded-2xl text-lg font-bold transition-all active:scale-95"
                style={{
                  background: i === 0 ? "#D4F4DD" : i === 1 ? "#FFF3D4" : "#FFE0E0",
                  border: `3px solid ${i === 0 ? "#51CF66" : i === 1 ? "#FCC419" : "#FF6B6B"}`,
                  color: "#2D3436",
                }}
              >
                <div>{lvl.label}</div>
                <div className="text-xs mt-1" style={{ color: "#636E72" }}>
                  {toArabic(lvl.totalQuestions)} سؤال - {toArabic(lvl.timePerQuestion)} ثواني
                </div>
                {progress.bestScores[i] > 0 && (
                  <div className="text-xs mt-1" style={{ color: "#E67700" }}>
                    أفضل نتيجة: {toArabic(progress.bestScores[i])}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Playing ────────────────────────────────────────────────────────

  if (phase === "playing") {
    const q = questions[currentQ];
    const maxTime = level.timePerQuestion * 1000;
    const timerPercent = Math.max(0, (timeLeft / maxTime) * 100);
    const timerColor = timerPercent > 60 ? "#51CF66" : timerPercent > 30 ? "#FCC419" : "#FF6B6B";

    return (
      <div className="h-[calc(100dvh-96px)] flex flex-col px-4" dir="rtl">
        {/* Top bar: score + combo + progress */}
        <div className="flex items-center justify-between pt-3 pb-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold" style={{ color: "#2D3436" }}>
              {toArabic(score)} نقطة
            </span>
            {multiplier > 1 && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "#FFF3D4", color: "#E67700", border: "1px solid #FCC419" }}
              >
                x{toArabic(multiplier)}
              </span>
            )}
          </div>
          <span className="text-xs" style={{ color: "#636E72" }}>
            {toArabic(currentQ + 1)} / {toArabic(questions.length)}
          </span>
        </div>

        {/* Timer bar */}
        <div
          className="w-full h-3 rounded-full overflow-hidden mb-4"
          style={{ background: "#EDE0D4" }}
        >
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${timerPercent}%`,
              background: timerColor,
              boxShadow: `0 0 8px ${timerColor}80`,
            }}
          />
        </div>

        {/* Combo streak */}
        {combo >= 2 && (
          <div className="text-center mb-2">
            <span
              className="text-sm font-bold px-3 py-1 rounded-full inline-block"
              style={{
                background: "linear-gradient(135deg, #FCC419, #FF922B)",
                color: "white",
                animation: "bounce-in 0.3s ease-out",
              }}
            >
              🔥 {toArabic(combo)} متتالية!
            </span>
          </div>
        )}

        {/* Question */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div
            className="text-center px-4 py-6 rounded-2xl w-full max-w-sm"
            style={{
              background: "white",
              border: "3px solid #FCC419",
              boxShadow: "0 4px 20px rgba(252,196,25,0.15)",
            }}
          >
            <p className="text-xl font-bold leading-relaxed" style={{ color: "#2D3436" }}>
              {q.text}
            </p>
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {q.options.map((opt, i) => {
              let bg = OPTION_COLORS[i];
              let border = OPTION_BORDERS[i];
              let scale = "";

              if (feedback !== null && selectedOption === i) {
                if (i === q.correctIndex) {
                  bg = "#51CF66";
                  border = "#2B8A3E";
                  scale = "scale(1.05)";
                } else {
                  bg = "#FF6B6B";
                  border = "#C92A2A";
                  scale = "scale(0.95)";
                }
              } else if (feedback !== null && i === q.correctIndex) {
                bg = "#51CF66";
                border = "#2B8A3E";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={feedback !== null}
                  className="py-5 rounded-2xl text-lg font-bold transition-all duration-150 active:scale-95"
                  style={{
                    background: bg,
                    border: `3px solid ${border}`,
                    color: "#2D3436",
                    transform: scale,
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Result ─────────────────────────────────────────────────────────

  const maxPossible = questions.length * 150 * 3;
  const percent = Math.round((score / maxPossible) * 100);
  const stars = percent >= 80 ? 3 : percent >= 50 ? 2 : percent >= 20 ? 1 : 0;

  return (
    <div className="h-[calc(100dvh-96px)] flex flex-col items-center justify-center px-4 gap-6" dir="rtl">
      <div
        className="text-center px-6 py-8 rounded-3xl w-full max-w-sm"
        style={{
          background: "white",
          border: "3px solid #FCC419",
          boxShadow: "0 8px 32px rgba(252,196,25,0.2)",
        }}
      >
        <div className="text-4xl mb-3">
          {stars >= 3 ? "🏆" : stars >= 2 ? "⭐" : stars >= 1 ? "👍" : "💪"}
        </div>
        <h2 className="text-2xl font-black mb-2" style={{ color: "#2D3436" }}>
          {stars >= 3 ? "ممتاز!" : stars >= 2 ? "أحسنت!" : stars >= 1 ? "جيد!" : "حاول مرة أخرى"}
        </h2>
        <div className="text-3xl mb-2">
          {"⭐".repeat(stars)}{"☆".repeat(3 - stars)}
        </div>
        <p className="text-lg font-bold" style={{ color: "#E67700" }}>
          {toArabic(score)} نقطة
        </p>
        {progress.bestScores[levelIndex] === score && score > 0 && (
          <p className="text-sm mt-1" style={{ color: "#51CF66" }}>
            رقم قياسي جديد! 🎉
          </p>
        )}
      </div>

      <div className="flex gap-3 w-full max-w-sm">
        <button
          onClick={() => startGame(levelIndex)}
          className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
          style={{ background: "#FCC419", color: "#2D3436", border: "3px solid #E67700" }}
        >
          أعد المحاولة
        </button>
        <button
          onClick={() => setPhase("menu")}
          className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
          style={{ background: "#E0E8FF", color: "#2D3436", border: "3px solid #4A90D9" }}
        >
          المستويات
        </button>
      </div>

      <Link
        href="/kids"
        className="text-sm font-bold px-4 py-2 rounded-full"
        style={{ background: "#FFF3D4", color: "#E67700", border: "2px solid #FCC419" }}
      >
        الرئيسية ←
      </Link>
    </div>
  );
}
