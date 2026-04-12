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
    letters: ["ك","ت","ب","ر","م","ا","ل"],
    requiredLetter: "ك",
    validWords: ["كتب","كتاب","كاتب","كتبة","مكتب","مكتبة","كتلة","مكتل","كلام","ملك","ملكوت","تكلم","كلم","كرة","كرم","كرمة","كبر","كبيرة","بكر","ترب","تكتك","ركب","ركاب","رطب","رطبة","بكت","بلك","بكلمة","تلام","تعك"],
    pangrams: ["مكتبة","ملكوت"],
    maxScore: 0,
  },
  {
    letters: ["ش","ر","ق","ة","م","ا","ل"],
    requiredLetter: "ش",
    validWords: ["شرق","شركة","شمال","شام","شامة","شكل","مشرق","شرعة","شراع","شري","شارع","رشق","شقة","رقم","رقعة","قمر","مربع","رمل","رمال","رمة","قلم","قال","قامة","ملا","ملة","مرق","مرقة","لمعة","شاشة","شاش"],
    pangrams: ["مشرق","شركة"],
    maxScore: 0,
  },
  {
    letters: ["ع","ل","م","د","ر","ة","ي"],
    requiredLetter: "ع",
    validWords: ["علم","علمي","عالم","عالمي","علي","عالية","عرة","عمد","عميد","معلم","معمل","عمل","عاملة","معلومة","دعامة","رعية","عري","عارضة","عمدة","درة","درية","دعى","رمد","ردة","ردية","لمع","لمعة","ليلى","ريادة","مدرسة","عمداني"],
    pangrams: ["مدرسة","عمداني"],
    maxScore: 0,
  },
  {
    letters: ["ن","و","ر","ة","م","ا","ح"],
    requiredLetter: "ن",
    validWords: ["نور","نورة","نوارة","نهر","نمرة","نومة","ناري","نام","ناموس","نمو","منارة","منور","منح","منحة","نحوية","رومن","روماني","مونة","حون","حانة","جوار","روح","روحانية","نيران","نمارق","مناور","نوام","نيمة"],
    pangrams: ["منارة","روماني"],
    maxScore: 0,
  },
  {
    letters: ["ب","ح","ر","ة","م","ل","ي"],
    requiredLetter: "ب",
    validWords: ["بحر","بحرة","بحري","بر","بري","برية","بلة","بلي","بلسم","بلم","بلمة","بمبر","بيمار","ربلة","رمية","رملة","رميلة","حرم","حرمة","حلمة","حيل","حيلة","ميل","ميلة","ليمة","لمية","بيرة","برميل","حبر","حبرية","برمود"],
    pangrams: ["برميل","برمود"],
    maxScore: 0,
  },
  {
    letters: ["ص","ف","ة","ر","م","ن","ا"],
    requiredLetter: "ص",
    validWords: ["صفر","صفرة","صفا","صفي","صنف","صنافة","صار","صارم","صارمة","صرام","صرامة","صفن","صنفور","نصفر","نافذة","صنارة","فرسان","فرسنة","مرصوف","مصفاة","رصف","رصافة","صمان"],
    pangrams: ["صنافة","فرسنة"],
    maxScore: 0,
  },
  {
    letters: ["ط","ب","خ","ة","م","ر","ي"],
    requiredLetter: "ط",
    validWords: ["طبخ","طبخة","طبيخ","طرة","طرية","طرمة","طير","طيرة","بطيخ","بطيخة","مطبخ","مطربة","مطرقة","خبط","خبطة","ربط","ربيطة","خيمة","ختم","خاتم","رطب","رطبة","رطيب","ريط","مطرة","بيطر","خيوط"],
    pangrams: ["مطبخ","مطرقة"],
    maxScore: 0,
  },
  {
    letters: ["ج","ب","ل","ة","م","ا","ن"],
    requiredLetter: "ج",
    validWords: ["جبل","جبلي","جمل","جملة","جملي","جمعة","جامعة","جاعة","جناة","جنة","جني","جان","جال","جبال","نجابة","لجنة","مجتمع","مجنة","مجاني","نجل","نجلة","بنج","بنجل","بنجابي","نبجة","نمجة","لمجة","لبنج"],
    pangrams: ["مجتمع","بنجابي"],
    maxScore: 0,
  },
  {
    letters: ["و","ز","ن","ة","م","ر","ي"],
    requiredLetter: "و",
    validWords: ["وزن","وزنة","وزير","وزارة","رويز","موز","موزة","ميرة","موري","موريس","ورم","ورمة","وريد","ورود","وردة","نورة","نورية","زيتونة","رومي","رومية","نيمورة","يمورة","يوزو","زورية"],
    pangrams: ["وزارة","زيتونة"],
    maxScore: 0,
  },
  {
    letters: ["ض","و","ء","ن","ر","ة","م"],
    requiredLetter: "ض",
    validWords: ["ضوء","ضوءي","ضرب","ضربة","ضمان","ضمانة","ضمن","ضمني","وضن","رضم","رضوم","نضرة","نضاري","مضروب","مضروبة","نضم","نظام","نظامي","رمان","رماني","رمونة","رموز","مرونة","مرون","مروط","مروط","نورة","روضة","روض","وضوء","مضاء","نموض"],
    pangrams: ["مضروبة","نموض"],
    maxScore: 0,
  },
  {
    letters: ["ذ","ه","ب","ة","م","ر","ي"],
    requiredLetter: "ذ",
    validWords: ["ذهب","ذهبي","ذهنية","مذهب","مذهبي","ذهول","ذهاب","ذهابي","ذرة","ذري","ذريع","ذروة","يزهر","يزيد","مذبة","مرذل","هرم","هرمة","هبرية","هبر","برية","برية","ريم","ريمة","بيمر"],
    pangrams: ["ذهنية","مذهبي"],
    maxScore: 0,
  },
  {
    letters: ["ث","ل","ج","ة","م","ر","ي"],
    requiredLetter: "ث",
    validWords: ["ثلج","ثلجي","ثلة","ثلي","ثمرة","ثمار","مثلي","مثلي","مثرية","مثير","مثال","مثالي","لجية","جرثوم","جرثومة","جملية","ثلث","ثلثي","ثرثرة","ثرثار","ثغرة","ثرية","جري","جرية","ريث","ريم","ريمة"],
    pangrams: ["جرثومة","ثلجي"],
    maxScore: 0,
  },
  {
    letters: ["ظ","ل","م","ة","ر","ي","ف"],
    requiredLetter: "ظ",
    validWords: ["ظلم","ظلمة","ظلام","ظلي","ظلال","ظرف","ظريف","ظريفة","مظلم","مظلمة","ظلماني","لظم","مظم","عظيم","غيظ","حفظ","حافظ","حافظة","ملاطف","ملطفة","ظفر","ظافر","لفظ","لفظي","ظاهر","ظهور","فظاظة","مرفية"],
    pangrams: ["ظريفة","مرفية"],
    maxScore: 0,
  },
  {
    letters: ["خ","ي","ر","ة","م","ل","ب"],
    requiredLetter: "خ",
    validWords: ["خير","خيرة","خيري","خيار","خياري","خال","خالة","خيل","خيلة","خليل","خليلة","خبيرة","خبير","خبر","خبري","خبز","خبيث","خبوص","مخيل","مخيلة","مخبر","مخابر","مخبري","مخرمة","خلبة","خلة","مخلوب","خروب","خرمة","خرائب"],
    pangrams: ["مخبري","مخرمة"],
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
