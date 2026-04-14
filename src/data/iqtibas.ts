import { getPuzzleNumber } from "./words";

export interface IqtibasPuzzle {
  quote: string;
  author: string;
  category: "proverb" | "poetry" | "wisdom" | "saying";
}

export const IQTIBAS_PUZZLES: IqtibasPuzzle[] = [
  // --- أمثال عربية ---
  { quote: "من جد وجد ومن زرع حصد", author: "مثل عربي", category: "proverb" },
  { quote: "العلم في الصغر كالنقش على الحجر", author: "مثل عربي", category: "proverb" },
  { quote: "اطلبوا العلم من المهد الى اللحد", author: "حكمة عربية", category: "wisdom" },
  { quote: "الصبر مفتاح الفرج", author: "مثل عربي", category: "proverb" },
  { quote: "رب اخ لك لم تلده امك", author: "مثل عربي", category: "proverb" },
  { quote: "اذا هبت رياحك فاغتنمها", author: "مثل عربي", category: "proverb" },
  { quote: "الوقت كالسيف ان لم تقطعه قطعك", author: "مثل عربي", category: "proverb" },
  { quote: "خير الكلام ما قل ودل", author: "مثل عربي", category: "proverb" },

  // --- شعر ---
  { quote: "على قدر اهل العزم تاتي العزائم", author: "المتنبي", category: "poetry" },
  { quote: "انا الذي نظر الاعمى الى ادبي", author: "المتنبي", category: "poetry" },
  { quote: "الراي قبل شجاعة الشجعان", author: "المتنبي", category: "poetry" },
  { quote: "قف دون رايك في الحياة مجاهدا", author: "احمد شوقي", category: "poetry" },
  { quote: "وما نيل المطالب بالتمني ولكن تؤخذ الدنيا غلابا", author: "احمد شوقي", category: "poetry" },
  { quote: "علمت فلم ارهب من الموت لانني وجدت حياة المرء كالموت في الذل", author: "المتنبي", category: "poetry" },
  { quote: "اذا المرء لم يدنس من اللؤم عرضه فكل رداء يرتديه جميل", author: "المتنبي", category: "poetry" },
  { quote: "ابتسم فان الحياة جميلة وليس هناك ما يدعو للعبوس", author: "ايليا ابو ماضي", category: "poetry" },

  // --- حكم ---
  { quote: "العقول الكبيرة تناقش الافكار والعقول الصغيرة تناقش الاشخاص", author: "حكمة عربية", category: "wisdom" },
  { quote: "من لم يتعلم من التاريخ فسيكرر اخطاءه", author: "حكمة عربية", category: "wisdom" },
  { quote: "لا تؤجل عمل اليوم الى الغد", author: "حكمة عربية", category: "wisdom" },
  { quote: "اعقلها وتوكل", author: "حكمة عربية", category: "wisdom" },
  { quote: "كن في الدنيا كانك غريب او عابر سبيل", author: "حكمة نبوية", category: "wisdom" },
  { quote: "انما الاعمال بالنيات وانما لكل امرئ ما نوى", author: "حكمة نبوية", category: "wisdom" },
  { quote: "خيركم من تعلم القران وعلمه", author: "حكمة نبوية", category: "wisdom" },

  // --- أقوال ---
  { quote: "لكل مجتهد نصيب", author: "قول عربي", category: "saying" },
  { quote: "التكرار يعلم الشطار", author: "قول عربي", category: "saying" },
  { quote: "في الاتحاد قوة وفي التفرق ضعف", author: "قول عربي", category: "saying" },
  { quote: "كل اناء ينضح بما فيه", author: "مثل عربي", category: "proverb" },
  { quote: "ما لا يدرك كله لا يترك كله", author: "حكمة عربية", category: "wisdom" },
  { quote: "اللهم لا سهل الا ما جعلته سهلا", author: "دعاء", category: "wisdom" },
  { quote: "من سلك طريقا يلتمس فيه علما سهل الله له طريقا الى الجنة", author: "حكمة نبوية", category: "wisdom" },
];

// Arabic letters used for cipher (no hamza variants, no diacritics)
export const ARABIC_LETTERS = [
  "ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر",
  "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف",
  "ق", "ك", "ل", "م", "ن", "ه", "و", "ي",
];

// Seeded PRNG (mulberry32)
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle with seeded PRNG
function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Check if a letter is an Arabic letter (used in cipher)
export function isArabicLetter(ch: string): boolean {
  // Arabic Unicode range: \u0620-\u064A (basic Arabic letters)
  const code = ch.charCodeAt(0);
  return code >= 0x0620 && code <= 0x064a;
}

// Generate a cipher mapping for a given puzzle number
// Each letter maps to a different letter, no letter maps to itself
export function generateCipher(puzzleNumber: number): Record<string, string> {
  const rng = mulberry32(puzzleNumber * 7919); // prime seed
  const letters = [...ARABIC_LETTERS];

  // Keep shuffling until no letter maps to itself (derangement)
  let shuffled: string[];
  let attempts = 0;
  do {
    shuffled = seededShuffle(letters, rng);
    attempts++;
  } while (
    shuffled.some((ch, i) => ch === letters[i]) &&
    attempts < 100
  );

  // If we still have fixed points after 100 attempts, manually fix them
  for (let i = 0; i < letters.length; i++) {
    if (shuffled[i] === letters[i]) {
      // Swap with next different element
      const swapIdx = (i + 1) % letters.length;
      [shuffled[i], shuffled[swapIdx]] = [shuffled[swapIdx], shuffled[i]];
    }
  }

  const cipher: Record<string, string> = {};
  for (let i = 0; i < letters.length; i++) {
    cipher[letters[i]] = shuffled[i];
  }
  return cipher;
}

// Encrypt text using cipher
export function encryptText(text: string, cipher: Record<string, string>): string {
  return text
    .split("")
    .map((ch) => {
      if (isArabicLetter(ch) && cipher[ch]) return cipher[ch];
      return ch; // spaces, punctuation, diacritics pass through
    })
    .join("");
}

// Get unique Arabic letters from text
export function getUniqueLetters(text: string): string[] {
  const seen = new Set<string>();
  for (const ch of text) {
    if (isArabicLetter(ch)) seen.add(ch);
  }
  return Array.from(seen);
}

export function getIqtibasPuzzleNumber(): number {
  return getPuzzleNumber();
}

export function getDailyIqtibasPuzzle(): IqtibasPuzzle {
  const puzzleNum = getIqtibasPuzzleNumber();
  const index = (puzzleNum - 1) % IQTIBAS_PUZZLES.length;
  return IQTIBAS_PUZZLES[index];
}

export function getIqtibasPuzzleByNumber(puzzleNum: number): IqtibasPuzzle {
  const index = (puzzleNum - 1) % IQTIBAS_PUZZLES.length;
  return IQTIBAS_PUZZLES[index];
}
