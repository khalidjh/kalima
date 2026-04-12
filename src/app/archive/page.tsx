"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Lock, Calendar, Grid3X3 } from "lucide-react";
import { getPuzzleNumber, getDateForPuzzle } from "@/data/words";
import { useAuth } from "@/lib/auth";
import { useIsPro } from "@/lib/subscription";
import GameHeader from "@/components/GameHeader";
import BackToHome from "@/components/BackToHome";

type GameType = "horouf" | "rawabet";

function formatArabicDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("ar-SA", {
    day: "numeric",
    month: "long",
  });
}

export default function ArchivePage() {
  const { user } = useAuth();
  const { isPro, proLoading } = useIsPro(user);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<GameType>("horouf");
  const [todayPuzzle, setTodayPuzzle] = useState(1);

  useEffect(() => {
    setTodayPuzzle(getPuzzleNumber());
  }, []);

  // Past puzzles = 1 through (today - 1)
  const pastPuzzles = Array.from({ length: todayPuzzle - 1 }, (_, i) => todayPuzzle - 1 - i);

  function handlePlay(puzzleNum: number) {
    if (!isPro) return;
    if (activeTab === "horouf") {
      router.push(`/?puzzle=${puzzleNum}`);
    } else {
      router.push(`/rawabet?puzzle=${puzzleNum}`);
    }
  }

  // Check localStorage for completed archive puzzles
  function isCompleted(puzzleNum: number): boolean {
    if (typeof window === "undefined") return false;
    const key =
      activeTab === "horouf"
        ? `kalima_archive_game_${puzzleNum}`
        : `kalima_archive_rawabet_${puzzleNum}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed.gameStatus === "won" || parsed.gameStatus === "lost";
    } catch {
      return false;
    }
  }

  return (
    <div className="h-full flex flex-col bg-background" dir="rtl">
      <GameHeader
        center={<span className="text-sm font-bold text-white">الأرشيف</span>}
        right={<div />}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-4">
          {/* Locked state for non-Pro */}
          {!proLoading && !isPro && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center">
                <Lock size={28} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-white">ميزة Pro</h2>
              <p className="text-muted text-sm text-center max-w-[260px] leading-relaxed">
                اشترك في Pro للعب أي لغز من الأيام السابقة
              </p>
              <button
                onClick={() => router.push("/pro")}
                className="mt-2 px-6 py-2.5 rounded-xl bg-primary text-[#0A0A0A] font-bold text-sm hover:opacity-90 transition-opacity"
              >
                ترقية الى Pro
              </button>
            </div>
          )}

          {/* Pro content */}
          {!proLoading && isPro && (
            <>
              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("horouf")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    activeTab === "horouf"
                      ? "bg-primary/20 text-primary border border-primary/40"
                      : "bg-surface text-muted border border-border hover:border-primary/30"
                  }`}
                >
                  <Calendar size={16} />
                  حروف
                </button>
                <button
                  onClick={() => setActiveTab("rawabet")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    activeTab === "rawabet"
                      ? "bg-primary/20 text-primary border border-primary/40"
                      : "bg-surface text-muted border border-border hover:border-primary/30"
                  }`}
                >
                  <Grid3X3 size={16} />
                  روابط
                </button>
              </div>

              {/* Puzzle list */}
              {pastPuzzles.length === 0 ? (
                <div className="text-center text-muted text-sm py-12">
                  لا توجد ألغاز سابقة بعد
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {pastPuzzles.map((num) => {
                    const dateStr = getDateForPuzzle(num);
                    const completed = isCompleted(num);
                    return (
                      <button
                        key={num}
                        onClick={() => handlePlay(num)}
                        className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3 hover:border-primary/40 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-primary font-bold text-sm">#{num}</span>
                          <span className="text-white text-sm">{formatArabicDate(dateStr)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {completed && (
                            <span className="text-xs text-correct font-medium">تم</span>
                          )}
                          <ChevronRight
                            size={16}
                            className="text-muted group-hover:text-primary transition-colors rotate-180"
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Loading state */}
          {proLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-muted text-sm">جارِ التحميل...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
