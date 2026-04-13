"use client";

import React, { useId } from "react";

type StreakFireProps = {
  streak: number;
  size?: "sm" | "md" | "lg";
};

const MILESTONES = [7, 14, 30, 50, 100];

function getLevel(streak: number) {
  if (streak >= 100) return 5;
  if (streak >= 30) return 4;
  if (streak >= 14) return 3;
  if (streak >= 7) return 2;
  return 1;
}

const keyframesCSS = `
@keyframes sf-flicker {
  0%, 100% { transform: scaleY(1) scaleX(1); opacity: 1; }
  25% { transform: scaleY(1.06) scaleX(0.96); opacity: 0.95; }
  50% { transform: scaleY(0.94) scaleX(1.04); opacity: 1; }
  75% { transform: scaleY(1.03) scaleX(0.98); opacity: 0.97; }
}
@keyframes sf-pulse-glow {
  0%, 100% { box-shadow: 0 0 8px 2px var(--sf-glow); }
  50% { box-shadow: 0 0 18px 6px var(--sf-glow); }
}
@keyframes sf-intense-glow {
  0%, 100% { box-shadow: 0 0 12px 4px var(--sf-glow), 0 0 24px 8px var(--sf-glow); }
  50% { box-shadow: 0 0 24px 8px var(--sf-glow), 0 0 40px 16px var(--sf-glow); }
}
@keyframes sf-shake {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-2px) rotate(-1deg); }
  20% { transform: translateX(2px) rotate(1deg); }
  30% { transform: translateX(-2px) rotate(-0.5deg); }
  40% { transform: translateX(2px) rotate(0.5deg); }
  50% { transform: translateX(0); }
}
@keyframes sf-rise-1 {
  0% { transform: translateY(0) scale(1); opacity: 0.9; }
  100% { transform: translateY(-28px) scale(0); opacity: 0; }
}
@keyframes sf-rise-2 {
  0% { transform: translateY(0) translateX(2px) scale(1); opacity: 0.8; }
  100% { transform: translateY(-32px) translateX(-4px) scale(0); opacity: 0; }
}
@keyframes sf-rise-3 {
  0% { transform: translateY(0) translateX(-3px) scale(1); opacity: 0.7; }
  100% { transform: translateY(-24px) translateX(5px) scale(0); opacity: 0; }
}
@keyframes sf-flame-dance {
  0%, 100% {
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    transform: scaleY(1) rotate(0deg);
  }
  33% {
    border-radius: 45% 55% 55% 45% / 65% 55% 45% 35%;
    transform: scaleY(1.05) rotate(-2deg);
  }
  66% {
    border-radius: 55% 45% 45% 55% / 55% 65% 35% 45%;
    transform: scaleY(0.97) rotate(2deg);
  }
}
@keyframes sf-inner-flame {
  0%, 100% {
    border-radius: 50% 50% 50% 50% / 55% 55% 45% 45%;
    transform: scaleY(1) scaleX(1);
  }
  50% {
    border-radius: 45% 55% 55% 45% / 60% 50% 50% 40%;
    transform: scaleY(1.08) scaleX(0.94);
  }
}
`;

const GLOW_COLORS: Record<number, string> = {
  1: "rgba(251,146,60,0.3)",
  2: "rgba(239,68,68,0.4)",
  3: "rgba(220,38,38,0.5)",
  4: "rgba(239,68,68,0.6)",
  5: "rgba(139,92,246,0.7)",
};

export default function StreakFire({ streak, size = "md" }: StreakFireProps) {
  const id = useId();
  const level = getLevel(streak);
  const isMilestone = MILESTONES.includes(streak);

  const sizeConfig = {
    sm: { w: 40, h: 40, fontSize: 11, fontWeight: 700 as const },
    md: { w: 56, h: 56, fontSize: 14, fontWeight: 700 as const },
    lg: { w: 80, h: 80, fontSize: 18, fontWeight: 800 as const },
  };

  const sc = sizeConfig[size];

  const outerGradients: Record<number, string> = {
    1: "linear-gradient(to top, #fb923c, #fde047)",
    2: "linear-gradient(to top, #ef4444, #fb923c)",
    3: "linear-gradient(to top, #dc2626, #f97316)",
    4: "linear-gradient(to top, #ef4444, #facc15)",
    5: "linear-gradient(to top, #8b5cf6, #60a5fa)",
  };

  const innerGradients: Record<number, string> = {
    1: "linear-gradient(to top, rgba(253,186,116,0.8), rgba(254,249,195,0.7))",
    2: "linear-gradient(to top, rgba(253,186,116,0.85), rgba(254,249,195,0.75))",
    3: "linear-gradient(to top, rgba(251,146,60,0.9), rgba(254,240,138,0.8))",
    4: "linear-gradient(to top, rgba(251,146,60,0.9), rgba(254,240,138,0.8))",
    5: "linear-gradient(to top, rgba(167,139,250,0.9), rgba(255,255,255,0.7))",
  };

  const tipGradient =
    level === 5
      ? "radial-gradient(ellipse, rgba(255,255,255,0.8), transparent)"
      : "radial-gradient(ellipse, rgba(254,249,195,0.8), transparent)";

  const numberColors: Record<number, string> = {
    1: "#ffedd5",
    2: "#fff7ed",
    3: "#fef2f2",
    4: "#fefce8",
    5: "#ede9fe",
  };

  const glowAnim =
    level >= 4
      ? "sf-intense-glow 1.5s ease-in-out infinite, sf-flame-dance 1.2s ease-in-out infinite"
      : level >= 3
      ? "sf-pulse-glow 2s ease-in-out infinite, sf-flame-dance 1.2s ease-in-out infinite"
      : "sf-flame-dance 1.2s ease-in-out infinite";

  const particleData = [
    { cls: "1", dur: "1.4s", delay: "0s", w: 4, top: "15%", left: "30%", c4: "#fbbf24", c5: "#c4b5fd" },
    { cls: "2", dur: "1.7s", delay: "0.3s", w: 3, top: "20%", left: "55%", c4: "#fb923c", c5: "#a78bfa" },
    { cls: "3", dur: "1.2s", delay: "0.6s", w: 3, top: "10%", left: "45%", c4: "#fde68a", c5: "#e9d5ff" },
    { cls: "1", dur: "1.5s", delay: "0.9s", w: 2, top: "18%", left: "65%", c4: "#fed7aa", c5: "#ddd6fe" },
  ];

  const extraParticles = [
    { cls: "2", dur: "1.3s", delay: "0.2s", w: 3, top: "12%", left: "38%", c5: "#c4b5fd" },
    { cls: "3", dur: "1.6s", delay: "0.5s", w: 2, top: "22%", left: "50%", c5: "#ede9fe" },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keyframesCSS }} />
      <div
        style={{
          width: sc.w,
          height: sc.h,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // @ts-expect-error CSS custom property
          "--sf-glow": GLOW_COLORS[level],
          animation: isMilestone ? "sf-shake 0.6s ease-in-out" : undefined,
        }}
      >
        {/* Outer flame body */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: outerGradients[level],
            opacity: 0.85,
            transformOrigin: "bottom center",
            animation: glowAnim,
            filter: level >= 4 ? "blur(2px)" : level >= 3 ? "blur(1px)" : undefined,
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          }}
        />

        {/* Inner flame core */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "25%",
            right: "25%",
            bottom: "10%",
            background: innerGradients[level],
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
            transformOrigin: "bottom center",
            animation: "sf-inner-flame 0.9s ease-in-out infinite",
          }}
        />

        {/* Flame tip flicker */}
        <div
          style={{
            position: "absolute",
            width: "30%",
            height: "20%",
            top: "5%",
            left: "35%",
            borderRadius: "50%",
            background: tipGradient,
            transformOrigin: "bottom center",
            animation: "sf-flicker 0.8s ease-in-out infinite",
          }}
        />

        {/* Rising particles (level 4+) */}
        {level >= 4 &&
          particleData.map((p, i) => (
            <span
              key={`${id}-p-${i}`}
              style={{
                position: "absolute",
                borderRadius: "50%",
                width: p.w,
                height: p.w,
                top: p.top,
                left: p.left,
                background: level === 5 ? p.c5 : p.c4,
                animation: `sf-rise-${p.cls} ${p.dur} ease-out infinite ${p.delay}`,
              }}
            />
          ))}

        {/* Extra particles for legendary (level 5) */}
        {level === 5 &&
          extraParticles.map((p, i) => (
            <span
              key={`${id}-ep-${i}`}
              style={{
                position: "absolute",
                borderRadius: "50%",
                width: p.w,
                height: p.w,
                top: p.top,
                left: p.left,
                background: p.c5,
                animation: `sf-rise-${p.cls} ${p.dur} ease-out infinite ${p.delay}`,
              }}
            />
          ))}

        {/* Streak number */}
        <span
          style={{
            position: "relative",
            zIndex: 10,
            fontWeight: sc.fontWeight,
            fontSize: sc.fontSize,
            color: numberColors[level],
            textShadow:
              level === 5
                ? "0 0 8px rgba(139,92,246,0.8), 0 1px 2px rgba(0,0,0,0.6)"
                : "0 1px 3px rgba(0,0,0,0.7)",
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
            lineHeight: 1,
          }}
        >
          {streak}
        </span>
      </div>
    </>
  );
}
