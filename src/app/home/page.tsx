"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Archive, ChevronLeft } from "lucide-react";
import { loadStats, loadGameState } from "@/lib/gameState";
import { loadRawabetGameState } from "@/lib/rawabetState";
import { loadWaffleGameState } from "@/lib/waffleState";
import { loadRubaeiGameState } from "@/lib/rubaeiState";
import { loadTaqatu3GameState } from "@/lib/taqatu3State";
import { loadSilsilaGameState } from "@/lib/silsilaState";
import { loadIqtibasGameState } from "@/lib/iqtibasState";
import { useAuth } from "@/lib/auth";
import { useIsPro } from "@/lib/subscription";
import StreakFire from "@/components/StreakFire";

// ── Icon Components ──

function WaffleIcon({ size = "sm" }: { size?: "sm" | "lg" }) {
  const s = size === "lg" ? "w-14 h-14" : "w-10 h-10";
  const gap = size === "lg" ? "gap-[3px]" : "gap-[2px]";
  return (
    <div className={`grid grid-cols-5 ${gap} ${s} flex-shrink-0`}>
      {[1,1,1,1,1, 1,0,1,0,1, 1,1,1,1,1, 1,0,1,0,1, 1,1,1,1,1].map((v, i) =>
        v ? (
          <div key={i} className={`rounded-[2px] ${i % 3 === 0 ? "bg-correct" : i % 5 === 0 ? "bg-present" : "bg-primary"} opacity-90`} />
        ) : <div key={i} />
      )}
    </div>
  );
}

function RubaeiIcon({ size = "sm" }: { size?: "sm" | "lg" }) {
  const s = size === "lg" ? "w-14 h-14" : "w-10 h-10";
  const cellSize = size === "lg" ? "w-[6px] h-[6px]" : "w-[4px] h-[4px]";
  const mini = (colors: string[]) => (
    <div className="grid grid-cols-3 gap-[1px]">
      {colors.map((c, i) => (
        <div key={i} className={`${cellSize} rounded-[1px] ${c} opacity-90`} />
      ))}
    </div>
  );
  return (
    <div className={`grid grid-cols-2 gap-1 ${s} flex-shrink-0 p-0.5`}>
      {mini(["bg-correct","bg-absent","bg-present","bg-absent","bg-correct","bg-correct","bg-present","bg-absent","bg-correct"])}
      {mini(["bg-absent","bg-present","bg-correct","bg-correct","bg-absent","bg-present","bg-correct","bg-correct","bg-absent"])}
      {mini(["bg-present","bg-correct","bg-absent","bg-correct","bg-present","bg-absent","bg-absent","bg-correct","bg-present"])}
      {mini(["bg-correct","bg-absent","bg-correct","bg-absent","bg-correct","bg-absent","bg-present","bg-absent","bg-correct"])}
    </div>
  );
}

function HoroufIcon() {
  return (
    <div className="grid grid-cols-3 gap-0.5 w-10 h-7 flex-shrink-0">
      <div className="rounded-sm bg-correct opacity-90" />
      <div className="rounded-sm bg-absent opacity-80" />
      <div className="rounded-sm bg-present opacity-90" />
      <div className="rounded-sm bg-correct opacity-90" />
      <div className="rounded-sm bg-correct opacity-90" />
      <div className="rounded-sm bg-absent opacity-80" />
    </div>
  );
}

function RawabetIcon() {
  const colors = ["bg-primary","bg-primary","bg-correct","bg-correct","bg-primary","bg-primary","bg-correct","bg-correct","bg-present","bg-present","bg-accent","bg-accent","bg-present","bg-present","bg-accent","bg-accent"];
  return (
    <div className="grid grid-cols-4 gap-0.5 w-10 h-10 flex-shrink-0">
      {colors.map((c, i) => <div key={i} className={`rounded-[2px] ${c} opacity-90`} />)}
    </div>
  );
}

function NahlaIcon() {
  return (
    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
      <span className="text-2xl">🐝</span>
    </div>
  );
}

function KharbashaIcon() {
  return (
    <div className="relative w-10 h-10 flex-shrink-0">
      <div className="absolute top-0 right-0 w-4 h-4 rounded bg-primary opacity-90 rotate-12" />
      <div className="absolute top-1 left-0 w-4 h-4 rounded bg-present opacity-90 -rotate-6" />
      <div className="absolute bottom-0 right-0.5 w-4 h-4 rounded bg-correct opacity-90 -rotate-12" />
      <div className="absolute bottom-0 left-0 w-4 h-4 rounded bg-primary opacity-70 rotate-6" />
    </div>
  );
}

function TarteebIcon() {
  return (
    <div className="flex items-end gap-0.5 w-10 h-10 flex-shrink-0 pb-0.5">
      <div className="flex-1 rounded-sm bg-correct opacity-90" style={{ height: "55%" }} />
      <div className="flex-1 rounded-sm bg-primary opacity-90" style={{ height: "90%" }} />
      <div className="flex-1 rounded-sm bg-present opacity-90" style={{ height: "70%" }} />
    </div>
  );
}

function Taqatu3Icon() {
  return (
    <div className="grid grid-cols-5 gap-[1px] w-10 h-10 flex-shrink-0">
      {[1,1,1,1,1, 1,0,0,1,0, 1,1,1,1,1, 0,1,0,0,1, 1,1,1,1,1].map((v, i) =>
        v ? (
          <div key={i} className={`rounded-[1px] ${i < 5 ? "bg-correct" : i < 15 ? "bg-primary" : "bg-present"} opacity-90`} />
        ) : <div key={i} className="bg-background/30 rounded-[1px]" />
      )}
    </div>
  );
}

function SilsilaIcon() {
  return (
    <div className="flex flex-col items-center gap-[3px] w-10 h-10 flex-shrink-0 justify-center">
      <div className="w-7 h-2 rounded-sm bg-correct opacity-90" />
      <div className="w-1 h-1 rounded-full bg-muted opacity-60" />
      <div className="w-7 h-2 rounded-sm bg-primary opacity-90" />
      <div className="w-1 h-1 rounded-full bg-muted opacity-60" />
      <div className="w-7 h-2 rounded-sm bg-present opacity-90" />
    </div>
  );
}

function IqtibasIcon() {
  return (
    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
      <span className="text-2xl font-bold text-primary opacity-90">&ldquo;</span>
    </div>
  );
}

// ── Completion Badge ──

function CompletedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-correct bg-correct/10 px-2 py-0.5 rounded-full border border-correct/20">
      ✓ أنهيت
    </span>
  );
}

function PlayBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary-light bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
      العب
    </span>
  );
}

function NewBadge() {
  return (
    <span className="text-[9px] font-bold text-primary-text bg-primary px-1.5 py-0.5 rounded-full tracking-wider">
      جديد
    </span>
  );
}

// ── Game Card Components ──

function HeroCard({
  href, icon, title, description, completed, isNew,
}: {
  href: string; icon: React.ReactNode; title: string; description: string; completed: boolean; isNew?: boolean;
}) {
  return (
    <Link href={href} className="block group">
      <div className="bg-gradient-to-br from-surface to-surface/80 rounded-2xl p-5 border border-primary/30 group-hover:border-primary transition-all duration-200 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-correct/5 rounded-full blur-2xl" />

        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-xl bg-background/50 border border-border/50">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              {isNew && <NewBadge />}
            </div>
            <p className="text-sm text-muted leading-relaxed">{description}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {completed ? <CompletedBadge /> : <PlayBadge />}
            <ChevronLeft size={18} className="text-muted group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function GridCard({
  href, icon, title, completed,
}: {
  href: string; icon: React.ReactNode; title: string; completed: boolean;
}) {
  return (
    <Link href={href} className="block group">
      <div className={`bg-surface rounded-xl p-3 border ${completed ? "border-correct/20" : "border-border"} group-hover:border-primary/40 transition-all duration-200 flex flex-col items-center gap-2 aspect-square justify-center relative`}>
        {completed && (
          <div className="absolute top-2 left-2">
            <span className="text-correct text-xs">✓</span>
          </div>
        )}
        {icon}
        <span className="text-xs font-semibold text-white">{title}</span>
      </div>
    </Link>
  );
}

// ── Main Page ──

export default function HomePage() {
  const { user } = useAuth();
  const { isPro } = useIsPro(user);
  const [streak, setStreak] = useState(0);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost" | null>(null);
  const [rawabetStatus, setRawabetStatus] = useState<"playing" | "won" | "lost" | null>(null);
  const [waffleStatus, setWaffleStatus] = useState<"playing" | "won" | "lost" | null>(null);
  const [rubaeiStatus, setRubaeiStatus] = useState<"playing" | "won" | "lost" | null>(null);
  const [taqatu3Status, setTaqatu3Status] = useState<"playing" | "won" | null>(null);
  const [silsilaStatus, setSilsilaStatus] = useState<"playing" | "won" | null>(null);
  const [iqtibasStatus, setIqtibasStatus] = useState<"playing" | "won" | null>(null);

  useEffect(() => {
    const stats = loadStats();
    setStreak(stats.currentStreak);

    const saved = loadGameState();
    if (saved) setGameStatus(saved.gameStatus);

    const rawabetSaved = loadRawabetGameState();
    if (rawabetSaved) setRawabetStatus(rawabetSaved.gameStatus);

    const waffleSaved = loadWaffleGameState();
    if (waffleSaved) setWaffleStatus(waffleSaved.gameStatus);

    const rubaeiSaved = loadRubaeiGameState();
    if (rubaeiSaved) setRubaeiStatus(rubaeiSaved.gameStatus);

    const taqatu3Saved = loadTaqatu3GameState();
    if (taqatu3Saved) setTaqatu3Status(taqatu3Saved.gameStatus);

    const silsilaSaved = loadSilsilaGameState();
    if (silsilaSaved) setSilsilaStatus(silsilaSaved.gameStatus);

    const iqtibasSaved = loadIqtibasGameState();
    if (iqtibasSaved) setIqtibasStatus(iqtibasSaved.gameStatus);
  }, []);

  const gameCompleted = gameStatus === "won" || gameStatus === "lost";
  const rawabetCompleted = rawabetStatus === "won" || rawabetStatus === "lost";
  const waffleCompleted = waffleStatus === "won" || waffleStatus === "lost";
  const rubaeiCompleted = rubaeiStatus === "won" || rubaeiStatus === "lost";
  const taqatu3Completed = taqatu3Status === "won";
  const silsilaCompleted = silsilaStatus === "won";
  const iqtibasCompleted = iqtibasStatus === "won";

  // Count completed games
  const completedCount = [gameCompleted, rawabetCompleted, waffleCompleted, rubaeiCompleted, taqatu3Completed, silsilaCompleted, iqtibasCompleted].filter(Boolean).length;
  const totalDailyGames = 10;

  return (
    <div className="h-full overflow-y-auto bg-background" dir="rtl">
      <div className="max-w-lg mx-auto px-4 pt-5 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-white">كلمة</h1>
            <p className="text-xs text-muted mt-0.5">
              {completedCount > 0
                ? `أنهيت ${completedCount} من ${totalDailyGames} ألعاب`
                : "ألعاب اليوم"
              }
            </p>
          </div>
          {streak > 0 && <StreakFire streak={streak} size="sm" />}
        </div>

        {/* Featured / Hero Card */}
        <div className="mb-4">
          <HeroCard
            href="/"
            icon={<HoroufIcon />}
            title="حروف"
            description="خمّن الكلمة اليومية في ٦ محاولات"
            completed={gameCompleted}
          />
        </div>

        {/* Games Grid */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-muted mb-3">جميع الألعاب</h2>
          <div className="grid grid-cols-3 gap-2.5">
            <GridCard href="/rubaei" icon={<RubaeiIcon />} title="رباعي" completed={rubaeiCompleted} />
            <GridCard href="/waffle" icon={<WaffleIcon />} title="وافل" completed={waffleCompleted} />
            <GridCard href="/rawabet" icon={<RawabetIcon />} title="روابط" completed={rawabetCompleted} />
            <GridCard href="/taqatu3" icon={<Taqatu3Icon />} title="متقاطعة" completed={taqatu3Completed} />
            <GridCard href="/silsila" icon={<SilsilaIcon />} title="سلسلة" completed={silsilaCompleted} />
            <GridCard href="/iqtibas" icon={<IqtibasIcon />} title="اقتباس" completed={iqtibasCompleted} />
            <GridCard href="/nahla" icon={<NahlaIcon />} title="نحلة" completed={false} />
            <GridCard href="/kharbasha" icon={<KharbashaIcon />} title="خربشة" completed={false} />
            <GridCard href="/tarteeb" icon={<TarteebIcon />} title="ترتيب" completed={false} />
          </div>
        </div>

        {/* Archive */}
        <Link href="/archive" className="block group">
          <div className="bg-surface rounded-xl p-3.5 border border-border group-hover:border-primary/40 transition-colors flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Archive size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">الأرشيف</h3>
              <p className="text-xs text-muted">العب ألغاز الأيام السابقة</p>
            </div>
            {isPro ? (
              <span className="text-[10px] font-bold text-primary-text bg-primary px-2 py-0.5 rounded-full">Pro</span>
            ) : (
              <span className="text-[10px] font-semibold text-muted bg-surface px-2 py-0.5 rounded-full border border-border">Pro</span>
            )}
          </div>
        </Link>

        {/* Kids Section */}
        <Link href="/kids" className="block group mt-3">
          <div className="bg-gradient-to-l from-[#FFE8CC]/10 to-[#FF922B]/10 rounded-xl p-3.5 border border-[#FF922B]/20 group-hover:border-[#FF922B]/40 transition-colors flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-[#FF922B]/10 border border-[#FF922B]/20">
              <span className="text-lg">⚡</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">Sparks</h3>
              <p className="text-xs text-muted">العب وتعلّم</p>
            </div>
            <span className="text-[10px] font-bold text-[#2D3436] bg-[#FF922B] px-2 py-0.5 rounded-full">Sparks</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
