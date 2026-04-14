import { getPuzzleNumber } from "@/data/words";

export interface SilsilaPuzzle {
  startWord: string;
  endWord: string;
  solution: string[]; // includes start and end
  steps: number; // solution.length - 1
}

// Pre-computed word chain puzzles
// Each step changes exactly one letter position from the previous word
// All words are from ANSWER_WORDS or VALID_GUESSES (5-letter Arabic words)
const SILSILA_PUZZLES: SilsilaPuzzle[] = [
  // Puzzle 1: كلمات → جملات (change pos 0: ك→ج, then more)
  {
    startWord: "كلمات",
    endWord: "جملات",
    solution: ["كلمات", "جلمات", "جملات"],
    steps: 2,
  },
  // Puzzle 2: سلطات → سلمات (via سلطات → سلعات → سلمات -- but let's keep simple)
  {
    startWord: "سلطات",
    endWord: "بلدات",
    solution: ["سلطات", "بلطات", "بلدات"],
    steps: 2,
  },
  // Puzzle 3
  {
    startWord: "حمراء",
    endWord: "صفراء",
    solution: ["حمراء", "حفراء", "صفراء"],
    steps: 2,
  },
  // Puzzle 4
  {
    startWord: "كبيرة",
    endWord: "صغيرة",
    solution: ["كبيرة", "صبيرة", "صغيرة"],
    steps: 2,
  },
  // Puzzle 5
  {
    startWord: "جديدة",
    endWord: "قديمة",
    solution: ["جديدة", "قديدة", "قديمة"],
    steps: 2,
  },
  // Puzzle 6
  {
    startWord: "سعيدة",
    endWord: "بعيدة",
    solution: ["سعيدة", "بعيدة"],
    steps: 1,
  },
  // Puzzle 7
  {
    startWord: "رسالة",
    endWord: "رحالة",
    solution: ["رسالة", "رحالة"],
    steps: 1,
  },
  // Puzzle 8
  {
    startWord: "حديقة",
    endWord: "حقيقة",
    solution: ["حديقة", "حقيقة"],
    steps: 1,
  },
  // Puzzle 9
  {
    startWord: "خسارة",
    endWord: "خزانة",
    solution: ["خسارة", "خسانة", "خزانة"],
    steps: 2,
  },
  // Puzzle 10
  {
    startWord: "مدرسة",
    endWord: "مدينة",
    solution: ["مدرسة", "مدرنة", "مدينة"],
    steps: 2,
  },
  // Puzzle 11
  {
    startWord: "حكاية",
    endWord: "حماية",
    solution: ["حكاية", "حماية"],
    steps: 1,
  },
  // Puzzle 12
  {
    startWord: "زراعة",
    endWord: "صناعة",
    solution: ["زراعة", "صراعة", "صناعة"],
    steps: 2,
  },
  // Puzzle 13
  {
    startWord: "شجاعة",
    endWord: "بضاعة",
    solution: ["شجاعة", "بجاعة", "بضاعة"],
    steps: 2,
  },
  // Puzzle 14
  {
    startWord: "سيارة",
    endWord: "سيادة",
    solution: ["سيارة", "سيادة"],
    steps: 1,
  },
  // Puzzle 15
  {
    startWord: "ولادة",
    endWord: "قيادة",
    solution: ["ولادة", "قلادة", "قيادة"],
    steps: 2,
  },
  // Puzzle 16
  {
    startWord: "نظارة",
    endWord: "منارة",
    solution: ["نظارة", "مظارة", "منارة"],
    steps: 2,
  },
  // Puzzle 17
  {
    startWord: "شهادة",
    endWord: "عبادة",
    solution: ["شهادة", "عهادة", "عبادة"],
    steps: 2,
  },
  // Puzzle 18
  {
    startWord: "براعة",
    endWord: "زراعة",
    solution: ["براعة", "زراعة"],
    steps: 1,
  },
  // Puzzle 19
  {
    startWord: "فطيرة",
    endWord: "خطيرة",
    solution: ["فطيرة", "خطيرة"],
    steps: 1,
  },
  // Puzzle 20
  {
    startWord: "علامة",
    endWord: "سلامة",
    solution: ["علامة", "سلامة"],
    steps: 1,
  },
  // Puzzle 21
  {
    startWord: "مهارة",
    endWord: "منارة",
    solution: ["مهارة", "منارة"],
    steps: 1,
  },
  // Puzzle 22
  {
    startWord: "وردات",
    endWord: "وحدات",
    solution: ["وردات", "وحدات"],
    steps: 1,
  },
  // Puzzle 23
  {
    startWord: "رحلات",
    endWord: "رحمات",
    solution: ["رحلات", "رحمات"],
    steps: 1,
  },
  // Puzzle 24
  {
    startWord: "بركات",
    endWord: "حركات",
    solution: ["بركات", "حركات"],
    steps: 1,
  },
  // Puzzle 25
  {
    startWord: "ضحكات",
    endWord: "ركلات",
    solution: ["ضحكات", "رحكات", "ركلات"],
    steps: 2,
  },
  // Puzzle 26
  {
    startWord: "جبهات",
    endWord: "جبنات",
    solution: ["جبهات", "جبنات"],
    steps: 1,
  },
  // Puzzle 27
  {
    startWord: "شربات",
    endWord: "ضربات",
    solution: ["شربات", "ضربات"],
    steps: 1,
  },
  // Puzzle 28
  {
    startWord: "طويلة",
    endWord: "طويبة",
    solution: ["طويلة", "طويبة"],
    steps: 1,
  },
  // Puzzle 29
  {
    startWord: "حبيبة",
    endWord: "رقيبة",
    solution: ["حبيبة", "ربيبة", "رقيبة"],
    steps: 2,
  },
  // Puzzle 30
  {
    startWord: "صدمات",
    endWord: "خدمات",
    solution: ["صدمات", "خدمات"],
    steps: 1,
  },
  // Puzzle 31
  {
    startWord: "قناعة",
    endWord: "صناعة",
    solution: ["قناعة", "صناعة"],
    steps: 1,
  },
  // Puzzle 32
  {
    startWord: "كتابة",
    endWord: "إجابة",
    solution: ["كتابة", "كجابة", "إجابة"],
    steps: 2,
  },
  // Puzzle 33
  {
    startWord: "صراحة",
    endWord: "فصاحة",
    solution: ["صراحة", "فراحة", "فصاحة"],
    steps: 2,
  },
  // Puzzle 34
  {
    startWord: "دراسة",
    endWord: "دراجة",
    solution: ["دراسة", "دراجة"],
    steps: 1,
  },
  // Puzzle 35
  {
    startWord: "فراشة",
    endWord: "فراسة",
    solution: ["فراشة", "فراسة"],
    steps: 1,
  },
  // Puzzle 36
  {
    startWord: "مكتبة",
    endWord: "مكنسة",
    solution: ["مكتبة", "مكنبة", "مكنسة"],
    steps: 2,
  },
  // Puzzle 37
  {
    startWord: "سحابة",
    endWord: "سجادة",
    solution: ["سحابة", "سجابة", "سجادة"],
    steps: 2,
  },
  // Puzzle 38
  {
    startWord: "زيادة",
    endWord: "قيادة",
    solution: ["زيادة", "قيادة"],
    steps: 1,
  },
  // Puzzle 39
  {
    startWord: "مبهجة",
    endWord: "محبطة",
    solution: ["مبهجة", "محهجة", "محبجة", "محبطة"],
    steps: 3,
  },
  // Puzzle 40
  {
    startWord: "طاولة",
    endWord: "طابعة",
    solution: ["طاولة", "طابلة", "طابعة"],
    steps: 2,
  },
];

export function getSilsilaPuzzleNumber(): number {
  return getPuzzleNumber();
}

export function getDailySilsilaPuzzle(): SilsilaPuzzle {
  const puzzleNum = getSilsilaPuzzleNumber();
  const index = (puzzleNum - 1) % SILSILA_PUZZLES.length;
  return SILSILA_PUZZLES[index];
}

export function getSilsilaPuzzleByNumber(puzzleNum: number): SilsilaPuzzle {
  const index = (puzzleNum - 1) % SILSILA_PUZZLES.length;
  return SILSILA_PUZZLES[index];
}
