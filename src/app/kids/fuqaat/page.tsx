"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Constants ───────────────────────────────────────────────────────────────

function toArabicNum(n: number): string {
  const digits = "٠١٢٣٤٥٦٧٨٩";
  return String(n)
    .split("")
    .map((d) => digits[parseInt(d)])
    .join("");
}

const BUBBLE_COLORS = ["#20C997", "#22B8CF", "#5C7CFA", "#CC5DE8", "#FF922B", "#FF6B6B"];
const TOTAL_QUESTIONS = 20;
const MAX_LIVES = 3;
const STORAGE_KEY = "sparks_fuqaat_progress";

type LevelId = 1 | 2 | 3;

interface LevelConfig {
  id: LevelId;
  name: string;
  emoji: string;
  op: "+" | "-" | "×";
  generate: () => { a: number; b: number; answer: number; display: string };
  minSpeed: number;
  maxSpeed: number;
}

const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "جمع",
    emoji: "➕",
    op: "+",
    minSpeed: 6000,
    maxSpeed: 8000,
    generate() {
      const a = randInt(1, 10);
      const b = randInt(1, 10);
      return { a, b, answer: a + b, display: `${toArabicNum(a)} + ${toArabicNum(b)} = ؟` };
    },
  },
  {
    id: 2,
    name: "طرح",
    emoji: "➖",
    op: "-",
    minSpeed: 5000,
    maxSpeed: 7000,
    generate() {
      const a = randInt(5, 20);
      const b = randInt(1, a);
      return { a, b, answer: a - b, display: `${toArabicNum(a)} - ${toArabicNum(b)} = ؟` };
    },
  },
  {
    id: 3,
    name: "ضرب",
    emoji: "✖️",
    op: "×",
    minSpeed: 4000,
    maxSpeed: 6000,
    generate() {
      const a = randInt(1, 10);
      const b = randInt(1, 10);
      return { a, b, answer: a * b, display: `${toArabicNum(a)} × ${toArabicNum(b)} = ؟` };
    },
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface LevelProgress {
  unlocked: boolean;
  stars: number;
}

interface Progress {
  levels: Record<LevelId, LevelProgress>;
}

interface Bubble {
  id: number;
  value: number;
  x: number; // percentage from left (0-85)
  color: string;
  duration: number; // animation duration in ms
  spawnTime: number;
  popped: boolean;
  wrong: boolean;
}

interface Question {
  display: string;
  answer: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeDistractors(correct: number, min: number, max: number, count: number): number[] {
  const set = new Set<number>();
  let attempts = 0;
  while (set.size < count && attempts < 200) {
    const n = randInt(Math.max(0, min), max);
    if (n !== correct) set.add(n);
    attempts++;
  }
  return Array.from(set);
}

function starsFromScore(score: number): number {
  if (score >= 15) return 3;
  if (score >= 10) return 2;
  if (score >= 5) return 1;
  return 0;
}

function defaultProgress(): Progress {
  return {
    levels: {
      1: { unlocked: true, stars: 0 },
      2: { unlocked: false, stars: 0 },
      3: { unlocked: false, stars: 0 },
    },
  };
}

function loadProgress(): Progress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Progress;
  } catch {
    /* ignore */
  }
  return defaultProgress();
}

function saveProgress(p: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

// ─── Confetti ────────────────────────────────────────────────────────────────

function ConfettiBurst() {
  const pieces = useRef(
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: 45 + Math.random() * 10,
      color: pickRandom(["#FF6B6B", "#51CF66", "#FFD43B", "#4A90D9", "#CC5DE8", "#FF922B"]),
      angle: (i / 24) * 360 + Math.random() * 15,
      distance: 60 + Math.random() * 100,
      size: 6 + Math.random() * 6,
    }))
  ).current;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.distance;
        const ty = Math.sin(rad) * p.distance;
        return (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              left: `${p.x}%`,
              top: "50%",
              animation: "confetti-burst 0.8s ease-out forwards",
              // @ts-expect-error CSS custom properties
              "--tx": `${tx}px`,
              "--ty": `${ty}px`,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Pop Particles ───────────────────────────────────────────────────────────

function PopParticles({ x, y, color }: { x: number; y: number; color: string }) {
  const particles = useRef(
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: (i / 8) * 360,
      distance: 30 + Math.random() * 40,
      size: 4 + Math.random() * 4,
    }))
  ).current;

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.distance;
        const ty = Math.sin(rad) * p.distance;
        return (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              background: color,
              left: `${x}%`,
              top: y,
              animation: "pop-particle 0.5s ease-out forwards",
              // @ts-expect-error CSS custom properties
              "--tx": `${tx}px`,
              "--ty": `${ty}px`,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Level Select ────────────────────────────────────────────────────────────

function LevelSelect({
  progress,
  onSelect,
}: {
  progress: Progress;
  onSelect: (level: LevelId) => void;
}) {
  return (
    <div className="px-4 py-6 max-w-md mx-auto w-full">
      <div className="text-center mb-8">
        <div
          className="text-6xl mb-3 inline-block"
          style={{ animation: "float 3s ease-in-out infinite" }}
        >
          🫧
        </div>
        <h1 className="text-3xl font-black mb-1" style={{ color: "#2D3436" }}>
          فقاعات
        </h1>
        <p className="text-sm" style={{ color: "#636E72" }}>
          فرقع الفقاعة الصحيحة!
        </p>
      </div>

      <div className="space-y-3">
        {LEVELS.map((level) => {
          const lp = progress.levels[level.id];
          const locked = !lp.unlocked;
          return (
            <button
              key={level.id}
              onClick={() => !locked && onSelect(level.id)}
              disabled={locked}
              className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all active:scale-[0.97]"
              style={{
                background: locked ? "#F1F0EE" : "#FFFFFF",
                border: `2px solid ${locked ? "#DDD" : BUBBLE_COLORS[level.id - 1]}`,
                opacity: locked ? 0.6 : 1,
                boxShadow: locked ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{
                  background: locked
                    ? "#E0E0E0"
                    : `linear-gradient(135deg, ${BUBBLE_COLORS[level.id - 1]}, ${BUBBLE_COLORS[level.id]})`,
                }}
              >
                {locked ? "🔒" : level.emoji}
              </div>
              <div className="flex-1 text-right">
                <div className="font-bold text-lg" style={{ color: locked ? "#AAA" : "#2D3436" }}>
                  المستوى {toArabicNum(level.id)} - {level.name}
                </div>
                <div className="flex items-center gap-0.5 justify-end mt-1">
                  {[1, 2, 3].map((s) => (
                    <span
                      key={s}
                      className="text-lg"
                      style={{ opacity: s <= lp.stars ? 1 : 0.2 }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Link
        href="/kids"
        className="block text-center mt-8 text-sm font-semibold py-3 rounded-xl transition-all active:scale-95"
        style={{ color: "#636E72", background: "#F1F0EE" }}
      >
        ← العودة للألعاب
      </Link>
    </div>
  );
}

// ─── Game Over Screen ────────────────────────────────────────────────────────

function GameOver({
  score,
  total,
  stars,
  onReplay,
  onBack,
}: {
  score: number;
  total: number;
  stars: number;
  onReplay: () => void;
  onBack: () => void;
}) {
  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="px-4 py-8 max-w-md mx-auto w-full text-center">
      {showConfetti && stars >= 2 && <ConfettiBurst />}

      <div
        className="text-7xl mb-4 inline-block"
        style={{ animation: "bounce-in 0.6s ease-out" }}
      >
        {stars >= 3 ? "🏆" : stars >= 2 ? "🎉" : stars >= 1 ? "👍" : "😅"}
      </div>

      <h2 className="text-2xl font-black mb-2" style={{ color: "#2D3436" }}>
        {stars >= 3 ? "ممتاز!" : stars >= 2 ? "أحسنت!" : stars >= 1 ? "جيد!" : "حاول مرة أخرى"}
      </h2>

      <div className="flex justify-center gap-1 mb-4">
        {[1, 2, 3].map((s) => (
          <span
            key={s}
            className="text-4xl"
            style={{
              opacity: s <= stars ? 1 : 0.2,
              animation: s <= stars ? `bounce-in 0.4s ease-out ${s * 0.15}s both` : "none",
            }}
          >
            ⭐
          </span>
        ))}
      </div>

      <div
        className="rounded-2xl p-4 mb-6 inline-block"
        style={{ background: "#F1F0EE" }}
      >
        <span className="text-xl font-bold" style={{ color: "#2D3436" }}>
          {toArabicNum(score)} / {toArabicNum(total)}
        </span>
      </div>

      <div className="space-y-3">
        <button
          onClick={onReplay}
          className="w-full py-3 rounded-xl font-bold text-white text-lg transition-all active:scale-95"
          style={{
            background: "linear-gradient(135deg, #20C997, #22B8CF)",
            boxShadow: "0 4px 12px rgba(32,201,151,0.3)",
          }}
        >
          إعادة اللعب 🔄
        </button>
        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl font-bold text-lg transition-all active:scale-95"
          style={{ background: "#F1F0EE", color: "#636E72" }}
        >
          المستويات ←
        </button>
      </div>
    </div>
  );
}

// ─── Bubble Component ────────────────────────────────────────────────────────

function BubbleElement({
  bubble,
  onTap,
  containerHeight,
}: {
  bubble: Bubble;
  onTap: (b: Bubble) => void;
  containerHeight: number;
}) {
  const [animState, setAnimState] = useState<"floating" | "popping" | "wrong" | "gone">("floating");

  useEffect(() => {
    if (bubble.popped) {
      setAnimState("popping");
      const t = setTimeout(() => setAnimState("gone"), 400);
      return () => clearTimeout(t);
    }
    if (bubble.wrong) {
      setAnimState("wrong");
      const t = setTimeout(() => setAnimState("floating"), 500);
      return () => clearTimeout(t);
    }
  }, [bubble.popped, bubble.wrong]);

  if (animState === "gone") return null;

  const bubbleSize = 64; // w-16 h-16
  const colorIdx = BUBBLE_COLORS.indexOf(bubble.color);
  const lighterColor = bubble.color + "66";

  return (
    <div
      className="absolute cursor-pointer select-none"
      style={{
        width: bubbleSize,
        height: bubbleSize,
        left: `${bubble.x}%`,
        bottom: -bubbleSize,
        animation:
          animState === "popping"
            ? "bubble-pop 0.4s ease-out forwards"
            : animState === "wrong"
              ? "bubble-shake 0.5s ease-out"
              : `bubble-float ${bubble.duration}ms linear forwards, bubble-wobble 2s ease-in-out infinite`,
        zIndex: animState === "popping" ? 20 : 10,
      }}
      onClick={() => {
        if (animState === "floating") onTap(bubble);
      }}
    >
      <div
        className="w-full h-full rounded-full flex items-center justify-center relative"
        style={{
          background: `radial-gradient(circle at 35% 35%, ${lighterColor}, ${bubble.color})`,
          boxShadow: `0 4px 20px ${bubble.color}44, inset 0 -4px 8px ${bubble.color}33`,
          border: animState === "wrong" ? "3px solid #FF6B6B" : "2px solid rgba(255,255,255,0.3)",
          transform: animState === "wrong" ? "scale(0.9)" : undefined,
          transition: "border 0.2s, transform 0.2s",
        }}
      >
        {/* Shine highlight */}
        <div
          className="absolute rounded-full"
          style={{
            width: "30%",
            height: "20%",
            top: "18%",
            left: "22%",
            background: "rgba(255,255,255,0.5)",
            borderRadius: "50%",
            filter: "blur(2px)",
          }}
        />
        <span className="text-2xl font-bold text-white relative z-10" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
          {toArabicNum(bubble.value)}
        </span>
      </div>
    </div>
  );
}

// ─── Game Play ───────────────────────────────────────────────────────────────

function GamePlay({
  levelConfig,
  onEnd,
}: {
  levelConfig: LevelConfig;
  onEnd: (score: number) => void;
}) {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [questionNum, setQuestionNum] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [popEffects, setPopEffects] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [shakeQuestion, setShakeQuestion] = useState(false);
  const [flashCorrect, setFlashCorrect] = useState(false);

  const bubbleIdRef = useRef(0);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cleanupTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameActiveRef = useRef(true);
  const livesRef = useRef(lives);
  const questionRef = useRef(question);
  const scoreRef = useRef(score);
  const questionNumRef = useRef(questionNum);

  // Keep refs in sync
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { questionRef.current = question; }, [question]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { questionNumRef.current = questionNum; }, [questionNum]);

  const generateQuestion = useCallback((): Question => {
    const q = levelConfig.generate();
    return { display: q.display, answer: q.answer };
  }, [levelConfig]);

  const spawnBubbles = useCallback(
    (q: Question) => {
      const count = randInt(4, 6);
      const distractorCount = count - 1;

      // Determine distractor range based on level
      let min = 0;
      let max = 20;
      if (levelConfig.id === 1) { min = 2; max = 20; }
      if (levelConfig.id === 2) { min = 0; max = 19; }
      if (levelConfig.id === 3) { min = 1; max = 100; }

      const distractors = makeDistractors(q.answer, min, max, distractorCount);
      const values = [q.answer, ...distractors];

      // Shuffle values
      for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
      }

      // Space out X positions to avoid overlap
      const xPositions: number[] = [];
      const step = 80 / count;
      for (let i = 0; i < count; i++) {
        xPositions.push(5 + i * step + Math.random() * (step * 0.5));
      }

      const newBubbles: Bubble[] = values.map((val, i) => ({
        id: ++bubbleIdRef.current,
        value: val,
        x: xPositions[i],
        color: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
        duration: randInt(levelConfig.minSpeed, levelConfig.maxSpeed),
        spawnTime: Date.now() + i * randInt(400, 800),
        popped: false,
        wrong: false,
      }));

      setBubbles(newBubbles);
    },
    [levelConfig]
  );

  const advanceQuestion = useCallback(() => {
    if (!gameActiveRef.current) return;

    const nextNum = questionNumRef.current + 1;
    if (nextNum >= TOTAL_QUESTIONS || livesRef.current <= 0) {
      gameActiveRef.current = false;
      onEnd(scoreRef.current);
      return;
    }

    setQuestionNum(nextNum);
    const newQ = generateQuestion();
    setQuestion(newQ);
    spawnBubbles(newQ);
  }, [generateQuestion, spawnBubbles, onEnd]);

  const handleBubbleTap = useCallback(
    (bubble: Bubble) => {
      if (!question || !gameActiveRef.current) return;

      if (bubble.value === question.answer) {
        // Correct
        setBubbles((prev) =>
          prev.map((b) => (b.id === bubble.id ? { ...b, popped: true } : b))
        );
        setScore((s) => s + 1);
        setFlashCorrect(true);
        setTimeout(() => setFlashCorrect(false), 400);

        // Show pop particles
        setPopEffects((prev) => [
          ...prev,
          { id: bubble.id, x: bubble.x, y: 0, color: bubble.color },
        ]);
        setTimeout(() => {
          setPopEffects((prev) => prev.filter((p) => p.id !== bubble.id));
        }, 600);

        // Next question after short delay
        setTimeout(() => advanceQuestion(), 800);
      } else {
        // Wrong
        setBubbles((prev) =>
          prev.map((b) => (b.id === bubble.id ? { ...b, wrong: true } : b))
        );
        setShakeQuestion(true);
        setTimeout(() => setShakeQuestion(false), 500);
        setLives((l) => {
          const newL = l - 1;
          if (newL <= 0) {
            gameActiveRef.current = false;
            setTimeout(() => onEnd(scoreRef.current), 600);
          }
          return newL;
        });
        // Reset wrong state after animation
        setTimeout(() => {
          setBubbles((prev) =>
            prev.map((b) => (b.id === bubble.id ? { ...b, wrong: false } : b))
          );
        }, 500);
      }
    },
    [question, advanceQuestion, onEnd]
  );

  // Check for bubbles that floated away
  useEffect(() => {
    cleanupTimerRef.current = setInterval(() => {
      if (!gameActiveRef.current) return;

      setBubbles((prev) => {
        const now = Date.now();
        const stillActive = prev.filter((b) => {
          if (b.popped) return true; // keep popped ones for animation
          const elapsed = now - b.spawnTime;
          if (elapsed > b.duration) {
            // Bubble floated away -- only penalize if it was the correct answer
            if (questionRef.current && b.value === questionRef.current.answer) {
              setLives((l) => {
                const newL = l - 1;
                if (newL <= 0) {
                  gameActiveRef.current = false;
                  setTimeout(() => onEnd(scoreRef.current), 300);
                }
                return newL;
              });
              // Advance to next question since the correct bubble escaped
              setTimeout(() => advanceQuestion(), 500);
            }
            return false;
          }
          return true;
        });
        return stillActive;
      });
    }, 500);

    return () => {
      if (cleanupTimerRef.current) clearInterval(cleanupTimerRef.current);
    };
  }, [advanceQuestion, onEnd]);

  // Initialize first question
  useEffect(() => {
    gameActiveRef.current = true;
    const q = generateQuestion();
    setQuestion(q);
    spawnBubbles(q);

    return () => {
      gameActiveRef.current = false;
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (cleanupTimerRef.current) clearInterval(cleanupTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerHeight = containerRef.current?.clientHeight ?? 500;

  return (
    <div className="flex flex-col h-[calc(100dvh-96px)] max-w-lg mx-auto w-full select-none">
      {/* Top bar: score + question + lives */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between relative z-20">
        <div
          className="font-bold text-lg px-3 py-1 rounded-xl"
          style={{ background: "#E8F5E9", color: "#2D3436" }}
        >
          {toArabicNum(score)}
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <span
              key={i}
              className="text-xl transition-all"
              style={{
                opacity: i < lives ? 1 : 0.2,
                transform: i < lives ? "scale(1)" : "scale(0.8)",
                filter: i < lives ? "none" : "grayscale(1)",
              }}
            >
              ❤️
            </span>
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="px-4 pb-3 relative z-20">
        <div
          className="rounded-2xl py-3 px-6 text-center transition-all"
          style={{
            background: flashCorrect
              ? "linear-gradient(135deg, #D4F4DD, #B2DFDB)"
              : "#FFFFFF",
            border: "2px solid #E0E0E0",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            animation: shakeQuestion ? "bubble-shake 0.5s ease-out" : "none",
          }}
        >
          <span
            className="text-3xl font-black"
            style={{ color: "#2D3436", direction: "ltr", unicodeBidi: "bidi-override" }}
          >
            {question?.display ?? "..."}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-2 relative z-20">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "#E8E8E8" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(questionNum / TOTAL_QUESTIONS) * 100}%`,
              background: "linear-gradient(90deg, #20C997, #22B8CF)",
            }}
          />
        </div>
        <div className="text-xs text-center mt-1" style={{ color: "#636E72" }}>
          {toArabicNum(questionNum + 1)} / {toArabicNum(TOTAL_QUESTIONS)}
        </div>
      </div>

      {/* Bubble area */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
      >
        {bubbles.map((b) => {
          const now = Date.now();
          if (now < b.spawnTime) return null; // Not yet spawned
          return (
            <BubbleElement
              key={b.id}
              bubble={b}
              onTap={handleBubbleTap}
              containerHeight={containerHeight}
            />
          );
        })}

        {popEffects.map((p) => (
          <PopParticles key={p.id} x={p.x} y={p.y ?? 50} color={p.color} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function FuqaatPage() {
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [screen, setScreen] = useState<"levels" | "playing" | "gameover">("levels");
  const [currentLevel, setCurrentLevel] = useState<LevelId>(1);
  const [lastScore, setLastScore] = useState(0);

  // Load progress on mount
  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const handleSelectLevel = useCallback((id: LevelId) => {
    setCurrentLevel(id);
    setScreen("playing");
  }, []);

  const handleGameEnd = useCallback(
    (score: number) => {
      setLastScore(score);
      const stars = starsFromScore(score);

      setProgress((prev) => {
        const updated = { ...prev, levels: { ...prev.levels } };
        const current = updated.levels[currentLevel];
        updated.levels[currentLevel] = {
          ...current,
          stars: Math.max(current.stars, stars),
        };

        // Unlock next level
        const nextId = (currentLevel + 1) as LevelId;
        if (nextId <= 3 && stars >= 1 && updated.levels[nextId]) {
          updated.levels[nextId] = { ...updated.levels[nextId], unlocked: true };
        }

        saveProgress(updated);
        return updated;
      });

      setScreen("gameover");
    },
    [currentLevel]
  );

  const handleReplay = useCallback(() => {
    setScreen("playing");
  }, []);

  const handleBack = useCallback(() => {
    setScreen("levels");
  }, []);

  const levelConfig = LEVELS.find((l) => l.id === currentLevel)!;

  return (
    <>
      <style>{`
        @keyframes bubble-float {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(calc(-100vh - 80px));
          }
        }
        @keyframes bubble-wobble {
          0%, 100% { margin-left: 0; }
          25% { margin-left: 12px; }
          75% { margin-left: -12px; }
        }
        @keyframes bubble-pop {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.5; }
          100% { transform: scale(0); opacity: 0; }
        }
        @keyframes bubble-shake {
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
        @keyframes pop-particle {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        @keyframes confetti-burst {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0.5); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3) translateY(20px); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1) translateY(0); }
        }
      `}</style>

      {screen === "levels" && (
        <LevelSelect progress={progress} onSelect={handleSelectLevel} />
      )}
      {screen === "playing" && (
        <GamePlay
          key={`${currentLevel}-${Date.now()}`}
          levelConfig={levelConfig}
          onEnd={handleGameEnd}
        />
      )}
      {screen === "gameover" && (
        <GameOver
          score={lastScore}
          total={TOTAL_QUESTIONS}
          stars={starsFromScore(lastScore)}
          onReplay={handleReplay}
          onBack={handleBack}
        />
      )}
    </>
  );
}
