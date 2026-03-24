"use client";

import { Stats } from "@/lib/gameState";
import { generateShareText, copyToClipboard } from "@/lib/shareText";
import { useState } from "react";

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
  const winPercent =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  const maxDist = Math.max(...Object.values(stats.guessDistribution), 1);

  const handleShare = async () => {
    const text = generateShareText(
      guesses,
      answer,
      gameStatus === "won"
    );
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-lg w-full max-w-md p-6 text-white relative"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors"
          aria-label="إغلاق"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 0 24 24"
            width="24"
            fill="currentColor"
          >
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
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

        {/* Share button */}
        {(gameStatus === "won" || gameStatus === "lost") && (
          <button
            onClick={handleShare}
            className="w-full py-3 rounded-lg bg-correct text-white font-bold text-lg hover:bg-green-600 transition-colors"
          >
            {copied ? "تم النسخ! ✓" : "مشاركة 📤"}
          </button>
        )}
      </div>
    </div>
  );
}
