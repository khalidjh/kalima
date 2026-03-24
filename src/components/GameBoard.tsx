"use client";

import { evaluateGuess, LetterState } from "@/lib/gameState";

interface GameBoardProps {
  guesses: string[];
  currentGuess: string;
  answer: string;
  gameOver: boolean;
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
}

function Tile({ letter, state, animate, delay = 0 }: TileProps) {
  const base =
    "w-full aspect-square flex items-center justify-center text-2xl sm:text-3xl font-bold border-2 uppercase select-none transition-colors duration-100";
  const style = getCellStyle(state);
  const flipClass = animate && state !== "empty" ? "animate-flip" : "";

  return (
    <div
      className={`${base} ${style} ${flipClass}`}
      style={animate ? { animationDelay: `${delay * 300}ms` } : undefined}
    >
      {letter}
    </div>
  );
}

export default function GameBoard({
  guesses,
  currentGuess,
  answer,
  gameOver,
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

  return (
    <div className="flex flex-col gap-1.5 my-4 mx-auto w-full max-w-[350px] px-2">
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className={`grid grid-cols-5 gap-1.5 ${rowIdx === guesses.length && shake ? "animate-shake" : ""}`}
        >
          {row.letters.map((letter, colIdx) => (
            <Tile
              key={colIdx}
              letter={letter}
              state={row.states[colIdx]}
              animate={row.animate}
              delay={colIdx}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
