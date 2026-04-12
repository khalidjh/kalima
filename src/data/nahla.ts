// نحلة (Nahla) — Arabic Spelling Bee daily puzzles

export interface NahlaPuzzle {
  letters: string[];
  requiredLetter: string;
  validWords: string[];
  pangrams: string[];
  maxScore: number;
}

// Each puzzle: 7 letters, required letter, pre-computed valid words
const PUZZLES: NahlaPuzzle[] = [
  {
    // Puzzle 1: ك,ت,ب,ر,م,ا,ل (no ة)
    letters: ["ك","ت","ب","ر","م","ا","ل"],
    requiredLetter: "ك",
    validWords: ["كتب","كتاب","كاتب","مكتب","كلام","ملك","تكلم","كلم","كرم","كبر","بكر","ركب","ركاب","بكت","مبارك","بارك","كامل","مالك","مكر","ماكر","كمال","ركام","تملك","كرام","تكبر","تبارك","ترك","ركل","مركب","مكتمل","تكرار","ابتكر","ابتكار","كبار","مبتكر","بركات","متكبر"],
    pangrams: [],
    maxScore: 0,
  },
  {
    // Puzzle 2: ش,ر,ق,ة,م,ا,ل (has ة)
    letters: ["ش","ر","ق","ة","م","ا","ل"],
    requiredLetter: "ش",
    validWords: ["شرق","شمال","شام","شامة","مشرق","رشق","شقة","شاشة","شاش","شمل","شملة","قشر","قشرة","مشقة","شرم","شمة","قماش","قماشة","شارة","شرقة","شرارة","شمر","رشم","قرش","مشرقة","شمام","شقاق","شقر","شرة"],
    pangrams: [],
    maxScore: 0,
  },
  {
    // Puzzle 3: ع,ل,م,د,ر,ة,ي (has ة, no ا)
    letters: ["ع","ل","م","د","ر","ة","ي"],
    requiredLetter: "ع",
    validWords: ["علم","علمي","عرة","عمد","عميد","معلم","معمل","عمل","عملة","عملي","رعي","رعية","عري","عمدة","لمع","لمعة","عدة","عمر","عمرة","معدة","مرعي","ريع","درع","مدعي","معد","عيد","علة","عدل","علمية","ردع","مدرعة","معرة","عدم"],
    pangrams: [],
    maxScore: 0,
  },
  {
    // Puzzle 4: ن,و,ر,ة,م,ا,ح (has ة)
    letters: ["ن","و","ر","ة","م","ا","ح"],
    requiredLetter: "ن",
    validWords: ["نور","نورة","نار","نمرة","نومة","نام","نمو","منارة","منور","منح","منحة","مونة","حانة","نوم","نحو","حنان","نحر","نمر","مرن","نوح","رمان","حنا","حنون","مران","نوار","مناورة","ران","حرن","ناور","محن","مناور","ونة","مرونة","مرنة","حرمان","نحام","امن","مانح"],
    pangrams: [],
    maxScore: 0,
  },
  {
    // Puzzle 5: ب,ح,ر,ة,م,ل,ي (has ة, no ا)
    letters: ["ب","ح","ر","ة","م","ل","ي"],
    requiredLetter: "ب",
    validWords: ["بحر","بحرة","بحري","بري","برية","بلة","بلي","بيرة","برميل","حبر","حبرية","ربح","رحب","بلم","حبل","بريم","بحيرة","بحرية","مبرة","ريبة","حبة","مرحب","بلح","محبة","حرب","حربة","حربي","ربي","مربي"],
    pangrams: [],
    maxScore: 0,
  },
  {
    // Puzzle 6: ص,ف,ة,ر,م,ن,ا (has ة)
    letters: ["ص","ف","ة","ر","م","ن","ا"],
    requiredLetter: "ص",
    validWords: ["صفر","صفرة","صفا","صنف","صار","صارم","صارمة","صرامة","صنارة","مصفاة","رصف","صنم","نصر","نصف","نصرة","مصر","مصنف","ناصر","ناصرة","صرف","منصف","منصة","رصاص","صام","صرة","مصران","صنافة","صفن","صمام","صنفرة","مصنفة"],
    pangrams: [],
    maxScore: 0,
  },
  {
    // Puzzle 7: ط,ب,خ,ة,م,ر,ي (has ة, no ا)
    letters: ["ط","ب","خ","ة","م","ر","ي"],
    requiredLetter: "ط",
    validWords: ["طبخ","طبخة","طبيخ","طرة","طرية","طير","طيرة","بطيخ","بطيخة","مطبخ","خبط","خبطة","ربط","رطب","رطبة","بيطر","مطر","مطرة","خطر","خطة","خطير","خطيرة","مخطط","طبية","طيب","طيبة","خيط","خريطة","مطبخة","ربيطة","مطربة","بطر","خطب","خطبة","مرطب"],
    pangrams: [],
    maxScore: 0,
  },
  {
    // Puzzle 8: ج,ب,ل,ة,م,ا,ن (has ة)
    letters: ["ج","ب","ل","ة","م","ا","ن"],
    requiredLetter: "ج",
    validWords: ["جبل","جمل","جملة","جناة","جنة","جان","جال","جبال","لجنة","نجل","نجلة","بنج","جنب","جانب","جمال","نجم","نجمة","مجال","جبان","جبانة","جلب","جلبة","جلا","مجلة","منجل","جبنة","جمة","جنا","جامل","مجمل","نجاة"],
    pangrams: [],
    maxScore: 0,
  },
  {
    // Puzzle 9: و,ز,ن,ة,م,ر,ي (has ة, no ا)
    letters: ["و","ز","ن","ة","م","ر","ي"],
    requiredLetter: "و",
    validWords: ["وزن","وزنة","وزير","وزيرة","موز","موزة","ورم","ورمة","نورة","نورية","رومي","رومية","وزر","وزرة","مور","نوري","مروية","زور","زورة","نوم","يوم","نور","روم"],
    pangrams: [],
    maxScore: 0,
  },
  {
    // Puzzle 10: ض,و,ء,ن,ر,ة,م (has ة, no ا)
    letters: ["ض","و","ء","ن","ر","ة","م"],
    requiredLetter: "ض",
    validWords: ["ضوء","ضمن","رضم","نضرة","مضر","مضرة","روضة","روض","وضوء","ضرة","نضر","مرض","مضمون","ضمور","ضمة","وضر","ضرر","ضرورة","مروض"],
    pangrams: [],
    maxScore: 0,
  },
  {
    // Puzzle 11: ذ,ه,ب,ة,م,ر,ي (has ة, no ا)
    letters: ["ذ","ه","ب","ة","م","ر","ي"],
    requiredLetter: "ذ",
    validWords: ["ذهب","ذهبي","مذهب","مذهبي","ذرة","ذري","ذمة","ذمي","بذر","بذرة","مهذب","مهذبة","ذهبية","مذهبية"],
    pangrams: [],
    maxScore: 0,
  },
  {
    // Puzzle 12: ث,ل,ج,ة,م,ر,ي (has ة, no ا)
    letters: ["ث","ل","ج","ة","م","ر","ي"],
    requiredLetter: "ث",
    validWords: ["ثلج","ثلجي","ثلة","ثمرة","مثل","مثلي","مثير","مثيرة","ثلث","ثرثرة","ثرية","ريث","ثمر","ثري","ثلم","ثملة","ملثم","ملثمة","ثمة","جثة","جثم","مثلج","مثلجة"],
    pangrams: [],
    maxScore: 0,
  },
  {
    // Puzzle 13: ظ,ل,م,ة,ر,ي,ف (has ة, no ا)
    letters: ["ظ","ل","م","ة","ر","ي","ف"],
    requiredLetter: "ظ",
    validWords: ["ظلم","ظلمة","ظرف","ظريف","ظريفة","مظلم","مظلمة","ظفر","لفظ","لفظي","لفظية","فظة","ظلمي","مظلة"],
    pangrams: [],
    maxScore: 0,
  },
  {
    // Puzzle 14: خ,ي,ر,ة,م,ل,ب (has ة, no ا)
    letters: ["خ","ي","ر","ة","م","ل","ب"],
    requiredLetter: "خ",
    validWords: ["خير","خيرة","خيري","خيل","خبيرة","خبير","خبر","خبري","مخيل","مخيلة","مخبر","مخبري","مخرمة","خلبة","خلة","خرمة","بخل","بخيل","مخلة","خمرة","خمر","خيمة","خيرية","خربة","خرب","خليل","خليلة","مخيم","مخيمة"],
    pangrams: [],
    maxScore: 0,
  },
];

// Calculate max scores
function calcScore(word: string, isPangram: boolean): number {
  const len = word.length;
  let score = len <= 3 ? 1 : len;
  if (isPangram) score += 7;
  return score;
}

PUZZLES.forEach(p => {
  p.maxScore = p.validWords.reduce((sum, w) => {
    const isPan = p.pangrams.includes(w);
    return sum + calcScore(w, isPan);
  }, 0);
});

export function getDailyNahlaPuzzle(): NahlaPuzzle {
  const now = new Date();
  const start = new Date(2026, 0, 1);
  const days = Math.floor((now.getTime() - start.getTime()) / 86400000);
  const idx = days % PUZZLES.length;
  return PUZZLES[idx];
}

export function getNahlaPuzzleNumber(): number {
  const now = new Date();
  const start = new Date(2026, 0, 1);
  return Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
}

export function isPangram(word: string, letters: string[]): boolean {
  return letters.every(l => word.includes(l));
}

export function calculateWordScore(word: string, letters: string[]): number {
  const pan = isPangram(word, letters);
  return calcScore(word, pan);
}

export function getRank(score: number, maxScore: number): { name: string; emoji: string; pct: number } {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  if (pct >= 100) return { name: "نحلة ذهبية 🐝", emoji: "🐝", pct };
  if (pct >= 75) return { name: "عبقري", emoji: "🧠", pct };
  if (pct >= 60) return { name: "مبدع", emoji: "✨", pct };
  if (pct >= 45) return { name: "رائع", emoji: "🌟", pct };
  if (pct >= 30) return { name: "ممتاز", emoji: "👏", pct };
  if (pct >= 15) return { name: "جيد", emoji: "👍", pct };
  return { name: "مبتدئ", emoji: "🌱", pct };
}
