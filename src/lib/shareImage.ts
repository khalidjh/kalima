import { evaluateGuess, LetterState } from "@/lib/gameState";
import { getPuzzleNumber } from "@/data/words";

const SIZE = 1080;
const ARABIC_FONT = '"Noto Naskh Arabic", "Traditional Arabic", Arial, sans-serif';

// Palette
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8C96A";
const GRAY = "#6B7280";
const CORRECT = "#22863A";
const CORRECT_LIGHT = "#4ADE80";
const PRESENT = "#B59F3B";
const ABSENT = "#2A2A3C";
const WHITE = "#FFFFFF";

function stateToColor(state: LetterState): string {
  switch (state) {
    case "correct": return CORRECT;
    case "present": return PRESENT;
    default: return ABSENT;
  }
}

function getPerformanceMessage(guesses: string[], won: boolean): string {
  if (!won) return "بكره إن شاء الله 🎯";
  switch (guesses.length) {
    case 1: return "أسطورة! 🏆";
    case 2: return "عبقري! 🧠";
    case 3: return "ممتاز ✨";
    case 4: return "أحسنت! 👏";
    case 5: return "تمسكت بها 💪";
    case 6: return "نجحت بصعوبة 😅";
    default: return "أحسنت!";
  }
}

function drawGeometricPattern(ctx: CanvasRenderingContext2D, size: number) {
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;

  const step = 90;
  // Draw star-of-david-style interlocking triangles as a simple repeating pattern
  for (let y = -step; y < size + step; y += step) {
    for (let x = -step; x < size + step; x += step) {
      // Octagon outline
      ctx.beginPath();
      const r = 36;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 + Math.PI / 8;
        const px = x + r * Math.cos(angle);
        const py = y + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Inner cross
      ctx.beginPath();
      ctx.moveTo(x - r * 0.5, y);
      ctx.lineTo(x + r * 0.5, y);
      ctx.moveTo(x, y - r * 0.5);
      ctx.lineTo(x, y + r * 0.5);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawKWatermark(ctx: CanvasRenderingContext2D, size: number) {
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.font = `bold 520px ${ARABIC_FONT}`;
  ctx.fillStyle = GOLD;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ك", size / 2, size / 2 + 40);
  ctx.restore();
}

function drawGlowRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  color: string,
  glowColor: string
) {
  // Outer glow
  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 28;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
  ctx.restore();
}

export async function generateShareImage(
  guesses: string[],
  answer: string,
  won: boolean
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  // ── Background gradient ──
  const bg = ctx.createLinearGradient(0, 0, SIZE * 0.3, SIZE);
  bg.addColorStop(0, "#0A0A18");
  bg.addColorStop(0.5, "#0F0F24");
  bg.addColorStop(1, "#0D0D1E");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // ── Geometric pattern ──
  drawGeometricPattern(ctx, SIZE);

  // ── ك watermark ──
  drawKWatermark(ctx, SIZE);

  const puzzleNum = getPuzzleNumber();
  const result = won ? `${guesses.length}/6` : "X/6";
  const perfMsg = getPerformanceMessage(guesses, won);

  // ── Top: كلمة title ──
  ctx.save();
  const titleGrad = ctx.createLinearGradient(SIZE / 2 - 120, 0, SIZE / 2 + 120, 0);
  titleGrad.addColorStop(0, GOLD);
  titleGrad.addColorStop(0.5, GOLD_LIGHT);
  titleGrad.addColorStop(1, GOLD);
  ctx.font = `bold 108px ${ARABIC_FONT}`;
  ctx.fillStyle = titleGrad;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.shadowColor = GOLD;
  ctx.shadowBlur = 18;
  ctx.fillText("كلمة", SIZE / 2, 64);
  ctx.restore();

  // ── Puzzle # ──
  ctx.font = `38px ${ARABIC_FONT}`;
  ctx.fillStyle = GRAY;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(`#${puzzleNum}`, SIZE / 2, 196);

  // ── Performance message ──
  ctx.font = `bold 52px ${ARABIC_FONT}`;
  ctx.fillStyle = WHITE;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(perfMsg, SIZE / 2, 256);

  // ── Grid ──
  const CELL = 112;
  const GAP = 14;
  const COLS = 5;
  const rowHeight = CELL + GAP;
  const gridW = COLS * CELL + (COLS - 1) * GAP;
  const gridX = (SIZE - gridW) / 2;
  const gridY = 360;
  const RADIUS = 10;

  for (let r = 0; r < guesses.length; r++) {
    const states = evaluateGuess(guesses[r], answer);
    const letters = Array.from(guesses[r]);
    for (let c = 0; c < COLS; c++) {
      const col = COLS - 1 - c; // RTL
      const x = gridX + col * (CELL + GAP);
      const y = gridY + r * rowHeight;
      const color = stateToColor(states[c]);
      const isCorrect = states[c] === "correct";

      if (isCorrect) {
        drawGlowRect(ctx, x, y, CELL, CELL, RADIUS, color, CORRECT_LIGHT);
      } else {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, CELL, CELL, RADIUS);
        ctx.fill();
      }

      // Letter
      ctx.font = `bold 50px ${ARABIC_FONT}`;
      ctx.fillStyle = WHITE;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(letters[c] ?? "", x + CELL / 2, y + CELL / 2 + 2);
    }
  }

  // ── Answer reveal (won only) ──
  const answerY = gridY + guesses.length * rowHeight + 36;
  if (won) {
    // Subtle divider
    ctx.save();
    ctx.strokeStyle = GOLD;
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(SIZE / 2 - 140, answerY);
    ctx.lineTo(SIZE / 2 + 140, answerY);
    ctx.stroke();
    ctx.restore();

    ctx.font = `bold 72px ${ARABIC_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 12;
    ctx.fillStyle = GOLD_LIGHT;
    ctx.fillText(answer, SIZE / 2, answerY + 20);
    ctx.shadowBlur = 0;
  }

  // ── Result badge (e.g. "3/6") ──
  const badgeY = won ? answerY + 110 : gridY + guesses.length * rowHeight + 36;
  ctx.font = `bold 44px ${ARABIC_FONT}`;
  ctx.fillStyle = won ? CORRECT_LIGHT : GRAY;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(result, SIZE / 2, badgeY);

  // ── Challenge line ──
  const challengeY = badgeY + 64;
  ctx.font = `34px ${ARABIC_FONT}`;
  ctx.fillStyle = GRAY;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("وأنت، كم محاولة تحتاج؟", SIZE / 2, challengeY);

  // ── kalima.fun footer ──
  ctx.font = `bold 36px ${ARABIC_FONT}`;
  const footerGrad = ctx.createLinearGradient(SIZE / 2 - 100, 0, SIZE / 2 + 100, 0);
  footerGrad.addColorStop(0, GOLD);
  footerGrad.addColorStop(1, GOLD_LIGHT);
  ctx.fillStyle = footerGrad;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("kalima.fun", SIZE / 2, SIZE - 52);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      "image/png"
    );
  });
}
