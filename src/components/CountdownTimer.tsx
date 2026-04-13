"use client";

import { useState, useEffect } from "react";

function getTimeUntilNextPuzzle(): string {
  const now = new Date();
  const riyadhOffset = 3 * 60 * 60 * 1000;
  const riyadhNow = new Date(
    now.getTime() + now.getTimezoneOffset() * 60000 + riyadhOffset
  );
  const tomorrow = new Date(riyadhNow);
  tomorrow.setHours(24, 0, 0, 0);
  const diff = tomorrow.getTime() - riyadhNow.getTime();
  const h = Math.floor(diff / 3600000)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((diff % 3600000) / 60000)
    .toString()
    .padStart(2, "0");
  const s = Math.floor((diff % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
}

interface CountdownTimerProps {
  className?: string;
}

export default function CountdownTimer({ className = "" }: CountdownTimerProps) {
  const [countdown, setCountdown] = useState(getTimeUntilNextPuzzle());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getTimeUntilNextPuzzle());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`text-center ${className}`} dir="rtl">
      <p className="text-muted text-sm mb-1">اللغز القادم بعد</p>
      <p
        className="text-2xl font-bold text-white tabular-nums tracking-widest"
        dir="ltr"
      >
        {countdown}
      </p>
    </div>
  );
}
