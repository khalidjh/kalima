import { evaluateGuess, LetterState } from "@/lib/gameState";
import { getPuzzleNumber } from "@/data/words";

function stateToEmoji(state: LetterState): string {
  switch (state) {
    case "correct":
      return "🟩";
    case "present":
      return "🟨";
    default:
      return "⬜";
  }
}

export function generateShareText(
  guesses: string[],
  answer: string,
  won: boolean,
  hardMode: boolean = false
): string {
  const puzzleNum = getPuzzleNumber();
  const totalGuesses = guesses.length;
  const result = won ? `${totalGuesses}/6` : "X/6";
  const hardModeTag = hardMode ? "*" : "";

  const rows = guesses.map((guess) => {
    const states = evaluateGuess(guess, answer);
    return states.map(stateToEmoji).join("");
  });

  return `كلمة #${puzzleNum} ${result}${hardModeTag}\n${rows.join("\n")}\n\nkalima.fun`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}
