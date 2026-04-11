// خربشة (Kharbasha) — Arabic Word Scramble daily puzzles

export interface KharbashaPuzzle {
  word: string;
  hint: string;
  scrambled: string;
}

function scrambleSeeded(word: string, seed: number): string {
  const letters = word.split("");
  const rng = seededRandom(seed);
  let result = [...letters];
  let attempts = 0;
  do {
    result = [...letters];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    attempts++;
  } while (result.join("") === word && attempts < 50);
  return result.join("");
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const WORDS_WITH_HINTS: { word: string; hint: string }[] = [
  { word: "قهوة", hint: "مشروب ساخن ☕" },
  { word: "مدرسة", hint: "مكان للتعليم 🏫" },
  { word: "طائرة", hint: "وسيلة سفر ✈️" },
  { word: "هاتف", hint: "جهاز اتصال 📱" },
  { word: "كتاب", hint: "مصدر معرفة 📖" },
  { word: "مسجد", hint: "مكان عبادة 🕌" },
  { word: "بحر", hint: "ماء مالح 🌊" },
  { word: "شمس", hint: "نجم ساطع ☀️" },
  { word: "قمر", hint: "يضيء الليل 🌙" },
  { word: "وردة", hint: "زهرة جميلة 🌹" },
  { word: "جبل", hint: "مرتفع طبيعي ⛰️" },
  { word: "سيارة", hint: "وسيلة تنقل 🚗" },
  { word: "حديقة", hint: "مكان أخضر 🌳" },
  { word: "ساعة", hint: "تقيس الوقت ⌚" },
  { word: "فراشة", hint: "حشرة ملونة 🦋" },
  { word: "نافذة", hint: "فتحة في الجدار 🪟" },
  { word: "مطبخ", hint: "مكان الطبخ 🍳" },
  { word: "سلم", hint: "درجات 🪜" },
  { word: "قطة", hint: "حيوان أليف 🐱" },
  { word: "حصان", hint: "حيوان يركض 🐴" },
  { word: "عصفور", hint: "يطير في السماء 🐦" },
  { word: "سمكة", hint: "تعيش في الماء 🐟" },
  { word: "مفتاح", hint: "يفتح الباب 🔑" },
  { word: "مظلة", hint: "تحمي من المطر ☂️" },
  { word: "صاروخ", hint: "يصل للفضاء 🚀" },
  { word: "كرة", hint: "تُلعب بها ⚽" },
  { word: "نجمة", hint: "تلمع في السماء ⭐" },
  { word: "دجاجة", hint: "طائر مزرعة 🐔" },
  { word: "قلم", hint: "يكتب به ✏️" },
  { word: "برتقال", hint: "فاكهة حمضية 🍊" },
  { word: "مزرعة", hint: "أرض زراعية 🌾" },
  { word: "طبيب", hint: "يعالج المرضى 👨‍⚕️" },
  { word: "رئيس", hint: "القائد 👔" },
  { word: "فيلم", hint: "تشاهده في السينما 🎬" },
  { word: "مطار", hint: "مكان إقلاع الطائرات 🛫" },
  { word: "كنز", hint: "ذهب مخفي 💎" },
  { word: "سرير", hint: "تنام عليه 🛏️" },
  { word: "ثلاجة", hint: "تحفظ الطعام 🧊" },
  { word: "عصفورة", hint: "طائر صغير 🐦" },
  { word: "خيمة", hint: "بيت من قماش ⛺" },
  { word: "مصباح", hint: "يضيء الغرفة 💡" },
  { word: "سحابة", hint: "بيضاء في السماء ☁️" },
  { word: "دراجة", hint: "تركبها وتدور 🚲" },
  { word: "طاولة", hint: "تضع عليها الأشياء" },
  { word: "بوصلة", hint: "تشير للاتجاه 🧭" },
  { word: "زجاجة", hint: "وعاء زجاجي" },
  { word: "موسيقى", hint: "أصوات جميلة 🎵" },
  { word: "حقيبة", hint: "تحمل فيها أشياءك 👜" },
  { word: "سلحفاة", hint: "تمشي ببطء 🐢" },
];

export function getDailyKharbashaPuzzle(): KharbashaPuzzle {
  const now = new Date();
  const start = new Date(2026, 0, 1);
  const days = Math.floor((now.getTime() - start.getTime()) / 86400000);
  const idx = days % WORDS_WITH_HINTS.length;
  const entry = WORDS_WITH_HINTS[idx];
  return {
    word: entry.word,
    hint: entry.hint,
    scrambled: scrambleSeeded(entry.word, days),
  };
}

export function getKharbashaPuzzleNumber(): number {
  const now = new Date();
  const start = new Date(2026, 0, 1);
  return Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
}
