"use client";

import { useEffect, useState } from "react";
import { evaluateGuess, LetterState } from "@/lib/gameState";

interface GameBoardProps {
  guesses: string[];
  currentGuess: string;
  answer: string;
  gameOver: boolean;
  won: boolean;
  shake: boolean;
}

function getCellStyle(state: LetterState): string {
  switch (state) {
    case "correct":
      return "bg-correct border-correct text-white";
    case "present":
      return "bg-present border-present text-white";
    case "absent":
      return "bg-absent border-absent text-white";
    case "tbd":
      return "bg-tile border-border-filled text-white";
    default:
      return "bg-tile border-border text-white";
  }
}

interface TileProps {
  letter: string;
  state: LetterState;
  animate?: boolean;
  delay?: number;
  waveBounce?: boolean;
  waveDelay?: number;
}

function Tile({ letter, state, animate, delay = 0, waveBounce, waveDelay = 0 }: TileProps) {
  const base =
    "w-full aspect-square flex items-center justify-center text-xl sm:text-2xl font-bold border-2 select-none";
  // When animating, start without color and reveal it at the midpoint (250ms into 500ms animation)
  const [revealed, setRevealed] = useState(!animate);
  useEffect(() => {
    if (!animate || state === "empty") return;
    const t = setTimeout(() => setRevealed(true), delay * 300 + 250);
    return () => clearTimeout(t);
  }, [animate, delay, state]);

  const colorStyle = revealed ? getCellStyle(state) : "bg-tile border-border text-white";
  const flipClass = animate && state !== "empty" ? "animate-flip" : "";

  return (
    <div
      className={`${base} ${colorStyle} ${flipClass} ${waveBounce ? "animate-wave-bounce" : ""}`}
      style={{
        ...(animate ? { animationDelay: `${delay * 300}ms` } : undefined),
        ...(waveBounce ? { animationDelay: `${waveDelay}ms` } : undefined),
      }}
    >
      <span
        style={{
          display: "inline-block",
          fontVariantLigatures: "none",
          unicodeBidi: "isolate",
          letterSpacing: 0,
        }}
      >
        {letter}
      </span>
    </div>
  );
}

export default function GameBoard({
  guesses,
  currentGuess,
  answer,
  gameOver,
  won,
  shake,
}: GameBoardProps) {
  const rows: Array<{ letters: string[]; states: LetterState[]; animate: boolean }> = [];

  // Completed guesses
  for (let i = 0; i < guesses.length; i++) {
    const guessChars = Array.from(guesses[i]);
    const states = evaluateGuess(guesses[i], answer);
    rows.push({ letters: guessChars, states, animate: true });
  }

  // Current guess row
  if (guesses.length < 6 && !gameOver) {
    const currentChars = Array.from(currentGuess);
    const letters: string[] = [];
    const states: LetterState[] = [];
    for (let i = 0; i < 5; i++) {
      letters.push(currentChars[i] ?? "");
      states.push(currentChars[i] ? "tbd" : "empty");
    }
    rows.push({ letters, states, animate: false });
  }

  // Empty rows
  while (rows.length < 6) {
    rows.push({
      letters: ["", "", "", "", ""],
      states: ["empty", "empty", "empty", "empty", "empty"],
      animate: false,
    });
  }

  const winningRowIdx = won ? guesses.length - 1 : -1;

  return (
    <div className="flex flex-col gap-1 my-1 mx-auto w-full px-2" style={{ maxWidth: "min(300px, calc((100dvh - 340px) * 5/6))" }}>
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className={`grid grid-cols-5 gap-1 animate-tile-enter ${rowIdx === guesses.length && shake ? "animate-shake" : ""}`}
          style={{ animationDelay: `${rowIdx * 50}ms` }}
        >
          {row.letters.map((letter, colIdx) => (
            <Tile
              key={colIdx}
              letter={letter}
              state={row.states[colIdx]}
              animate={row.animate}
              delay={colIdx}
              waveBounce={rowIdx === winningRowIdx}
              waveDelay={600 + colIdx * 100}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
