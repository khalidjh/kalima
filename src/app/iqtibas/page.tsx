"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  getDailyIqtibasPuzzle,
  getIqtibasPuzzleNumber,
  getIqtibasPuzzleByNumber,
  generateCipher,
  encryptText,
  isArabicLetter,
  getUniqueLetters,
  ARABIC_LETTERS,
} from "@/data/iqtibas";
import {
  loadIqtibasGameState,
  saveIqtibasGameState,
  loadArchiveIqtibasGameState,
  saveArchiveIqtibasGameState,
  updateIqtibasStatsOnWin,
  loadIqtibasStats,
  IqtibasGameState,
  IqtibasStats,
} from "@/lib/iqtibasState";
import { useAuth } from "@/lib/auth";
import { useIsPro } from "@/lib/subscription";
import { playTap, playCorrect } from "@/lib/sounds";
import BackToHome from "@/components/BackToHome";
import GameHeader from "@/components/GameHeader";
import HowToPlayIqtibas from "@/components/HowToPlayIqtibas";
import CountdownTimer from "@/components/CountdownTimer";
import Toast from "@/components/Toast";
import { HelpCircle, Lightbulb, RotateCcw } from "lucide-react";

const MAX_HINTS = 3;

interface ToastItem {
  id: number;
  message: string;
}

let toastCounter = 0;

function IqtibasPageInner() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { isPro } = useIsPro(user);
  const archivePuzzleParam = searchParams.get("puzzle");
  const isArchiveMode = archivePuzzleParam !== null && isPro;
  const archivePuzzleNum = archivePuzzleParam
    ? parseInt(archivePuzzleParam, 10)
    : null;

  const puzzle =
    isArchiveMode && archivePuzzleNum
      ? getIqtibasPuzzleByNumber(archivePuzzleNum)
      : getDailyIqtibasPuzzle();
  const puzzleNumber =
    isArchiveMode && archivePuzzleNum
      ? archivePuzzleNum
      : getIqtibasPuzzleNumber();

  const cipher = generateCipher(puzzleNumber);
  const reverseCipher: Record<string, string> = {};
  for (const [orig, enc] of Object.entries(cipher)) {
    reverseCipher[enc] = orig;
  }

  const fullText = puzzle.quote + " " + puzzle.author;
  const encryptedQuote = encryptText(puzzle.quote, cipher);
  const encryptedAuthor = encryptText(puzzle.author, cipher);
  const encryptedLetters = getUniqueLetters(encryptText(fullText, cipher));

  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [gameStatus, setGameStatus] = useState<"playing" | "won">("playing");
  const [startTime, setStartTime] = useState(Date.now());
  const [endTime, setEndTime] = useState<number | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [stats, setStats] = useState<IqtibasStats>(loadIqtibasStats());
  const [copied, setCopied] = useState(false);

  const saveFn = isArchiveMode
    ? saveArchiveIqtibasGameState
    : saveIqtibasGameState;

  function showToast(message: string) {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message }]);
  }

  // Load saved state
  useEffect(() => {
    const saved =
      isArchiveMode && archivePuzzleNum
        ? loadArchiveIqtibasGameState(archivePuzzleNum)
        : loadIqtibasGameState();
    if (saved) {
      setMappings(saved.mappings);
      setHintsUsed(saved.hintsUsed);
      setGameStatus(saved.gameStatus);
      setStartTime(saved.startTime);
      setEndTime(saved.endTime);
      if (saved.gameStatus === "won") {
        setTimeout(() => setShowResult(true), 800);
      }
    }
    setStats(loadIqtibasStats());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check win condition
  const checkWin = useCallback(
    (currentMappings: Record<string, string>) => {
      if (gameStatus !== "playing") return;

      // Check all encrypted letters in quote + author are correctly mapped
      for (const encLetter of encryptedLetters) {
        const correctOriginal = reverseCipher[encLetter];
        if (!correctOriginal) continue;
        if (currentMappings[encLetter] !== correctOriginal) return;
      }

      // All correct
      const now = Date.now();
      setGameStatus("won");
      setEndTime(now);
      playCorrect();

      const newStats = isArchiveMode ? stats : updateIqtibasStatsOnWin();
      setStats(newStats);

      saveFn({
        puzzleNumber,
        mappings: currentMappings,
        hintsUsed,
        gameStatus: "won",
        startTime,
        endTime: now,
      });

      setTimeout(() => setShowResult(true), 600);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gameStatus, encryptedLetters, reverseCipher, puzzleNumber, hintsUsed, startTime, isArchiveMode]
  );

  function handleLetterSelect(encLetter: string) {
    if (gameStatus !== "playing") return;
    playTap();
    setSelectedLetter(encLetter);
  }

  function handleGuess(guessLetter: string) {
    if (!selectedLetter || gameStatus !== "playing") return;
    playTap();

    const newMappings = { ...mappings };

    // Remove any existing mapping that maps to this guessLetter (prevent duplicates)
    for (const [enc, guess] of Object.entries(newMappings)) {
      if (guess === guessLetter && enc !== selectedLetter) {
        delete newMappings[enc];
      }
    }

    newMappings[selectedLetter] = guessLetter;
    setMappings(newMappings);
    setSelectedLetter(null);

    saveFn({
      puzzleNumber,
      mappings: newMappings,
      hintsUsed,
      gameStatus: "playing",
      startTime,
      endTime: null,
    });

    checkWin(newMappings);
  }

  function handleClearLetter() {
    if (!selectedLetter || gameStatus !== "playing") return;
    playTap();

    const newMappings = { ...mappings };
    delete newMappings[selectedLetter];
    setMappings(newMappings);
    setSelectedLetter(null);

    saveFn({
      puzzleNumber,
      mappings: newMappings,
      hintsUsed,
      gameStatus: "playing",
      startTime,
      endTime: null,
    });
  }

  function handleHint() {
    if (gameStatus !== "playing" || hintsUsed >= MAX_HINTS) return;

    // Find unsolved encrypted letters
    const unsolved = encryptedLetters.filter((enc) => {
      const correct = reverseCipher[enc];
      return correct && mappings[enc] !== correct;
    });

    if (unsolved.length === 0) return;

    const hintLetter = unsolved[Math.floor(Math.random() * unsolved.length)];
    const correctOriginal = reverseCipher[hintLetter];

    const newMappings = { ...mappings };
    // Remove conflicting mapping
    for (const [enc, guess] of Object.entries(newMappings)) {
      if (guess === correctOriginal && enc !== hintLetter) {
        delete newMappings[enc];
      }
    }
    newMappings[hintLetter] = correctOriginal;

    const newHints = hintsUsed + 1;
    setMappings(newMappings);
    setHintsUsed(newHints);
    setSelectedLetter(null);
    playTap();

    saveFn({
      puzzleNumber,
      mappings: newMappings,
      hintsUsed: newHints,
      gameStatus: "playing",
      startTime,
      endTime: null,
    });

    checkWin(newMappings);
  }

  function handleReset() {
    if (gameStatus !== "playing") return;
    setMappings({});
    setSelectedLetter(null);
    showToast("تم مسح كل الحروف");

    saveFn({
      puzzleNumber,
      mappings: {},
      hintsUsed,
      gameStatus: "playing",
      startTime,
      endTime: null,
    });
  }

  function formatTime(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${String(sec).padStart(2, "0")}`;
  }

  function buildShareText(): string {
    const elapsed = endTime ? endTime - startTime : 0;
    const lines: string[] = [];
    lines.push(`اقتباس #${puzzleNumber}`);
    lines.push(`الوقت: ${formatTime(elapsed)}`);
    lines.push(`التلميحات: ${hintsUsed}/${MAX_HINTS}`);
    lines.push("kalima.fun/iqtibas");
    return lines.join("\n");
  }

  async function handleShare() {
    const text = buildShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  // Get status of an encrypted letter cell
  function getCellStatus(encLetter: string): "correct" | "filled" | "empty" | "selected" {
    if (selectedLetter === encLetter) return "selected";
    const guess = mappings[encLetter];
    if (!guess) return "empty";
    const correct = reverseCipher[encLetter];
    if (guess === correct) return "correct";
    return "filled";
  }

  // Check if a guess letter is already used (for keyboard highlighting)
  function getKeyboardStatus(letter: string): "used-correct" | "used" | "available" {
    for (const [enc, guess] of Object.entries(mappings)) {
      if (guess === letter) {
        const correct = reverseCipher[enc];
        if (guess === correct) return "used-correct";
        return "used";
      }
    }
    return "available";
  }

  // Render text as letter cells
  function renderEncryptedText(encrypted: string, original: string) {
    const words = encrypted.split(" ");
    const origWords = original.split(" ");

    return (
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-3" dir="rtl">
        {words.map((word, wi) => (
          <div key={wi} className="flex gap-0.5" dir="rtl">
            {word.split("").map((ch, ci) => {
              const origCh = origWords[wi]?.[ci] || "";
              if (!isArabicLetter(ch)) {
                // Punctuation / non-letter
                return (
                  <div key={ci} className="flex flex-col items-center justify-end w-5">
                    <span className="text-muted text-sm">{ch}</span>
                  </div>
                );
              }

              const status = getCellStatus(ch);
              const guess = mappings[ch];
              const isSelected = selectedLetter === ch;
              const allSelectedSame = selectedLetter !== null && ch === selectedLetter;

              let bgClass = "bg-surface";
              if (status === "correct") bgClass = "bg-correct";
              else if (status === "selected" || allSelectedSame) bgClass = "bg-primary/30 border-primary";
              else if (status === "filled") bgClass = "bg-surface";

              return (
                <button
                  key={ci}
                  onClick={() => handleLetterSelect(ch)}
                  disabled={gameStatus !== "playing"}
                  className={`flex flex-col items-center justify-center w-8 h-12 sm:w-10 sm:h-14 rounded-md border transition-all ${bgClass} ${
                    isSelected || allSelectedSame
                      ? "border-primary ring-1 ring-primary"
                      : status === "correct"
                      ? "border-correct"
                      : "border-border"
                  }`}
                >
                  <span className="text-[10px] text-muted leading-none">{ch}</span>
                  <span
                    className={`text-base sm:text-lg font-bold leading-none mt-0.5 ${
                      status === "correct"
                        ? "text-white"
                        : guess
                        ? "text-white"
                        : "text-muted/30"
                    }`}
                  >
                    {guess || "_"}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // Conflict detection: two encrypted letters mapped to same guess
  const conflicts = new Set<string>();
  const guessCount: Record<string, string[]> = {};
  for (const [enc, guess] of Object.entries(mappings)) {
    if (!guessCount[guess]) guessCount[guess] = [];
    guessCount[guess].push(enc);
  }
  for (const [, encs] of Object.entries(guessCount)) {
    if (encs.length > 1) {
      encs.forEach((e) => conflicts.add(e));
    }
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col" dir="rtl">
      <GameHeader
        left={<BackToHome />}
        center={
          <span className="text-sm font-bold text-muted">
            اقتباس #{puzzleNumber}
          </span>
        }
        right={
          <button
            onClick={() => setShowHowToPlay(true)}
            className="text-muted hover:text-white transition-colors"
          >
            <HelpCircle size={20} strokeWidth={1.5} />
          </button>
        }
      />

      {/* Toasts */}
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          onDismiss={() =>
            setToasts((prev) => prev.filter((x) => x.id !== t.id))
          }
        />
      ))}

      <div className="flex-1 flex flex-col items-center px-3 py-4 max-w-2xl mx-auto w-full overflow-y-auto">
        {/* Encrypted Quote */}
        <div className="w-full mb-4">
          <div className="mb-2 text-center">
            <span className="text-xs text-muted">الاقتباس المشفر</span>
          </div>
          {renderEncryptedText(encryptedQuote, puzzle.quote)}
        </div>

        {/* Author (encrypted) */}
        <div className="w-full mb-6">
          <div className="flex items-center justify-center gap-2 my-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">القائل</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          {renderEncryptedText(encryptedAuthor, puzzle.author)}
        </div>

        {/* Conflict warning */}
        {conflicts.size > 0 && gameStatus === "playing" && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-3 text-center">
            <span className="text-red-400 text-xs">
              تنبيه: بعض الحروف مكررة في التخمين
            </span>
          </div>
        )}

        {/* Action buttons */}
        {gameStatus === "playing" && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleHint}
              disabled={hintsUsed >= MAX_HINTS}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-border text-sm font-bold text-white disabled:opacity-30 transition-colors hover:bg-surface/80"
            >
              <Lightbulb size={16} />
              <span>تلميح ({MAX_HINTS - hintsUsed})</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-border text-sm font-bold text-white transition-colors hover:bg-surface/80"
            >
              <RotateCcw size={16} />
              <span>مسح</span>
            </button>
            {selectedLetter && mappings[selectedLetter] && (
              <button
                onClick={handleClearLetter}
                className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-sm font-bold text-red-400 transition-colors"
              >
                حذف
              </button>
            )}
          </div>
        )}

        {/* Arabic Keyboard */}
        {gameStatus === "playing" && selectedLetter && (
          <div className="w-full bg-surface rounded-2xl border border-border p-3 mb-4">
            <p className="text-xs text-muted text-center mb-2">
              اختر الحرف الأصلي لـ &quot;{selectedLetter}&quot;
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {ARABIC_LETTERS.map((letter) => {
                const kbStatus = getKeyboardStatus(letter);
                let btnClass =
                  "bg-background text-white hover:bg-primary/20";
                if (kbStatus === "used-correct")
                  btnClass = "bg-correct/30 text-correct";
                else if (kbStatus === "used")
                  btnClass = "bg-surface text-muted";

                return (
                  <button
                    key={letter}
                    onClick={() => handleGuess(letter)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-sm font-bold transition-colors ${btnClass}`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Win result */}
        {showResult && gameStatus === "won" && (
          <div className="w-full bg-surface rounded-2xl border border-border p-5 mb-4">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🎉</div>
              <h2 className="text-xl font-bold text-white mb-1">أحسنت!</h2>
              <p className="text-sm text-muted">اقتباس #{puzzleNumber}</p>
            </div>

            {/* Original quote beautifully displayed */}
            <div className="bg-background rounded-xl p-4 mb-4 text-center">
              <p className="text-lg font-bold text-white leading-relaxed mb-2">
                &quot;{puzzle.quote}&quot;
              </p>
              <p className="text-sm text-primary font-bold">
                - {puzzle.author}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="flex flex-col items-center bg-background rounded-xl p-2">
                <span className="text-lg font-bold text-white">
                  {formatTime(endTime ? endTime - startTime : 0)}
                </span>
                <span className="text-[10px] text-muted">الوقت</span>
              </div>
              <div className="flex flex-col items-center bg-background rounded-xl p-2">
                <span className="text-lg font-bold text-white">
                  {hintsUsed}
                </span>
                <span className="text-[10px] text-muted">تلميحات</span>
              </div>
              <div className="flex flex-col items-center bg-background rounded-xl p-2">
                <span className="text-lg font-bold text-white">
                  {stats.currentStreak}
                </span>
                <span className="text-[10px] text-muted">سلسلة</span>
              </div>
            </div>

            {/* Countdown */}
            <CountdownTimer className="mb-4" />

            {/* Share */}
            <button
              onClick={handleShare}
              className="w-full bg-primary hover:bg-primary-dark text-[#0A0A0A] font-bold py-3 rounded-xl transition-colors text-sm"
            >
              {copied ? "تم النسخ!" : "مشاركة النتيجة"}
            </button>
          </div>
        )}
      </div>

      {showHowToPlay && (
        <HowToPlayIqtibas onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  );
}

export default function IqtibasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-background flex items-center justify-center">
          <div className="text-muted">جاري التحميل...</div>
        </div>
      }
    >
      <IqtibasPageInner />
    </Suspense>
  );
}
