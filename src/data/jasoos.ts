// Decoy words for the Jasoos (Word Spy) game.
// Each decoy is paired with the daily word at the same puzzle index.
// The decoy should be in a similar category but clearly different from the real word.
// Loops via modulo if puzzle number exceeds array length.

export const JASOOS_DECOYS: readonly string[] = [
  // Puzzle 1–30: paired with daily objects / misc
  "قصة",   // vs كتاب (book → story)
  "حصان",  // vs قلعة (castle → horse)
  "نهار",  // vs بحار (seas → daytime)
  "كراس",  // vs دفتر (notebook → booklet)
  "سجاد",  // vs مفرش (tablecloth → carpet)
  "كؤوس",  // vs صحون (plates → cups)
  "إبرق",  // vs كوبة (cup → teapot)
  "حديق",  // vs ملعب (playground → garden)
  "غرفة",  // vs مكتب (office → room)
  "كنبة",  // vs سرير (bed → sofa)
  "طاول",  // vs كرسي (chair → table)
  "صحيح",  // vs باطل (false → true)
  "سلاس",  // vs حبال (ropes → chains)
  "حرير",  // vs قماش (fabric → silk)
  "براغ",  // vs مسمر (nail → screws)
  "كرسي",  // vs مقعد (seat → chair)
  "مخدة",  // vs فراش (mattress → pillow)
  "معمل",  // vs مصنع (factory → lab)
  "درعة",  // vs سلاح (weapon → shield)
  "نحات",  // vs رسام (painter → sculptor)
  "عيون",  // vs قلوب (hearts → eyes)
  "نفوس",  // vs عقول (minds → souls)
  "دينر",  // vs درهم (dirham → dinar)
  "رمحة",  // vs سيفة (sword → spear)
  "حصاة",  // vs رمال (sands → pebble)
  "تلال",  // vs جبال (mountains → hills)
  "صالة",  // vs مطبخ (kitchen → hall)
  "مطبخ",  // vs صالة (hall → kitchen)
  "شرفة",  // vs غرفة (room → balcony)
  "ضارة",  // vs نافع (useful → harmful)
  // Puzzle 31–60: paired with food & drink / animals
  "زبيب",  // vs تمور (dates → raisins)
  "مسكة",  // vs عنبر (amber → musk)
  "أسماك",  // vs لحوم (meats → fish) — note: 4-letter decoy preferred
  "كعكة",  // vs خبزة (bread → cake)
  "لبنة",  // vs جبنة (cheese → labneh)
  "سمنة",  // vs زبدة (butter → ghee)
  "حليب",  // vs قشدة (cream → milk)
  "كمون",  // vs فلفل (pepper → cumin)
  "جزرة",  // vs بصلة (onion → carrot)
  "بهار",  // vs ثومة (garlic → spice)
  "مشمش",  // vs تفاح (apples → apricot)
  "تينة",  // vs عنبة (grape → fig)
  "تفاح",  // vs موزة (banana → apple)
  "ليمن",  // vs برتق (orange → lemon)
  "برتق",  // vs ليمن (lemon → orange)
  "تينة",  // vs رمان (pomegranate → fig)
  "عنبة",  // vs تينة (fig → grape)
  "رمان",  // vs زيتن (olives → pomegranate)
  "سكرة",  // vs ملحة (salt → sugar)
  "ملحة",  // vs سكرة (sugar → salt)
  "مرار",  // vs حلوى (sweets → bitter)
  "دبسة",  // vs عسلة (honey → molasses)
  "عصير",  // vs شربة (drink → juice)
  "سميد",  // vs دقيق (flour → semolina)
  "خلة",   // vs زيتة (oil → vinegar)
  "جبنة",  // vs لبنة (labneh → cheese)
  "حمصة",  // vs فولة (fava → chickpea)
  "فولة",  // vs عدسة (lentil → fava)
  "فولة",  // vs حمصة (chickpea → fava)
  "قمحة",  // vs أرزة (rice → wheat)
  // Puzzle 61–80: animals
  "نمور",  // vs أسود (lions → tigers)
  "أسود",  // vs نمور (tigers → lions)
  "ثعلب",  // vs ذئاب (wolves → fox)
  "سربة",  // vs قطيع (herd → flock)
  "جمال",  // vs حصان (horse → camel)
  "بقرة",  // vs جمال (camels → cow)
  "غنمة",  // vs بقرة (cow → sheep)
  "حصان",  // vs غنمة (sheep → horse)
  "بطاط",  // vs دجاج (chicken → duck)
  "عصفر",  // vs حمام (pigeons → sparrow)
  "صقور",  // vs نسور (eagles → falcons)
  "نسور",  // vs صقور (falcons → eagles)
  "ذئاب",  // vs ثعلب (fox → wolves)
  "قطة",   // vs أرنب (rabbit → cat)
  "قطيع",  // vs فأرة (mouse → herd)
];

export function getJasoosPuzzle(puzzleNumber: number) {
  const index = (puzzleNumber - 1) % JASOOS_DECOYS.length;
  return {
    puzzleNumber,
    decoyWord: JASOOS_DECOYS[index],
  };
}
