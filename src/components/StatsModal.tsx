"use client";

import { X } from "lucide-react";
import { Stats } from "@/lib/gameState";
import { generateShareText, copyToClipboard } from "@/lib/shareText";
import { generateShareImage } from "@/lib/shareImage";
import { getPuzzleNumber } from "@/data/words";
import { track } from "@/lib/analytics";
import { useState, useEffect } from "react";

function getTimeUntilNextPuzzle(): string {
  const now = new Date();
  const riyadhOffset = 3 * 60 * 60 * 1000;
  const riyadhNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + riyadhOffset);
  const tomorrow = new Date(riyadhNow);
  tomorrow.setHours(24, 0, 0, 0);
  const diff = tomorrow.getTime() - riyadhNow.getTime();
  const h = Math.floor(diff / 3600000).toString().padStart(2, "0");
  const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
  const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

interface StatsModalProps {
  stats: Stats;
  onClose: () => void;
  gameStatus: "playing" | "won" | "lost";
  guesses: string[];
  answer: string;
}

export default function StatsModal({
  stats,
  onClose,
  gameStatus,
  guesses,
  answer,
}: StatsModalProps) {
  const [copied, setCopied] = useState(false);
  const [imageSharing, setImageSharing] = useState(false);
  const [countdown, setCountdown] = useState(getTimeUntilNextPuzzle());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getTimeUntilNextPuzzle());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const winPercent =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  const maxDist = Math.max(...Object.values(stats.guessDistribution), 1);

  const handleImageShare = async () => {
    const puzzleNum = getPuzzleNumber();
    setImageSharing(true);
    try {
      const blob = await generateShareImage(guesses, answer, gameStatus === "won", stats.currentStreak);
      const filename = `kalima-puzzle-${puzzleNum}.png`;
      const file = new File([blob], filename, { type: "image/png" });

      track("share_image", { puzzle: puzzleNum });

      // Try native share with file on mobile
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `كلمة #${puzzleNum}` });
      } else {
        // Fallback: auto-download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // User cancelled share or error — silently ignore
    } finally {
      setImageSharing(false);
    }
  };

  const handleShare = async () => {
    const puzzleNum = getPuzzleNumber();
    const text = generateShareText(
      guesses,
      answer,
      gameStatus === "won"
    );
    const success = await copyToClipboard(text);
    if (success) {
      track("share_text", { puzzle: puzzleNum });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center overflow-hidden"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 text-white relative overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors"
          aria-label="إغلاق"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-center mb-4 uppercase tracking-widest">
          الإحصائيات
        </h2>

        {gameStatus === "won" && (
          <p className="text-center text-correct font-bold text-lg mb-4">
            أحسنت! 🎉
          </p>
        )}
        {gameStatus === "lost" && (
          <p className="text-center text-present font-bold text-lg mb-2">
            الإجابة كانت:{" "}
            <span className="text-white text-xl">{answer}</span>
          </p>
        )}

        {/* Stats numbers */}
        <div className="grid grid-cols-4 gap-2 mb-6 text-center">
          <div>
            <div className="text-3xl font-bold">{stats.gamesPlayed}</div>
            <div className="text-xs text-gray-400">لُعبت</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{winPercent}</div>
            <div className="text-xs text-gray-400">% فوز</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats.currentStreak}</div>
            <div className="text-xs text-gray-400">التتابع</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats.maxStreak}</div>
            <div className="text-xs text-gray-400">أفضل تتابع</div>
          </div>
        </div>

        {/* Guess distribution */}
        <p className="font-bold text-center mb-3 text-sm uppercase tracking-widest">
          توزيع التخمينات
        </p>
        {stats.gamesPlayed === 0 ? (
          <p className="text-center text-gray-500 text-sm mb-6">لا توجد بيانات بعد</p>
        ) : (
        <div className="space-y-1 mb-6">
          {[1, 2, 3, 4, 5, 6].map((num) => {
            const count = stats.guessDistribution[num] ?? 0;
            const pct = Math.round((count / maxDist) * 100);
            const isCurrentGuess =
              gameStatus === "won" && guesses.length === num;
            return (
              <div key={num} className="flex items-center gap-2">
                <span className="text-sm w-4 text-center">{num}</span>
                <div className="flex-1 h-5 bg-absent rounded-sm overflow-hidden">
                  <div
                    className={`h-full flex items-center justify-end px-2 text-xs font-bold transition-all duration-500 ${
                      isCurrentGuess ? "bg-correct" : "bg-border-filled"
                    }`}
                    style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                  >
                    {count > 0 ? count : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Countdown to next puzzle */}
        <div className="text-center mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">الكلمة القادمة في</p>
          <p className="text-2xl font-bold tabular-nums" dir="ltr">{countdown}</p>
        </div>

        {/* Share buttons */}
        {(gameStatus === "won" || gameStatus === "lost") && (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleShare}
              className="w-full py-3 rounded-lg bg-correct text-white font-bold text-lg hover:bg-green-600 transition-colors"
            >
              {copied ? "تم النسخ! ✓" : "مشاركة 📤"}
            </button>
            <button
              onClick={handleImageShare}
              disabled={imageSharing}
              className="w-full py-3 rounded-lg bg-[#C9A84C] text-[#0F0F1A] font-bold text-lg hover:bg-yellow-500 transition-colors disabled:opacity-60"
            >
              {imageSharing ? "جارٍ التحضير..." : "تحميل الصورة 📸"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
