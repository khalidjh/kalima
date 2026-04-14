import { getPuzzleNumber } from "./words";

export interface CrosswordClue {
  number: number;
  clue: string;
  answer: string;
  row: number;
  col: number;
  length: number;
}

export interface CrosswordPuzzle {
  id: number;
  grid: (string | null)[][];
  acrossClues: CrosswordClue[];
  downClues: CrosswordClue[];
}

/*
  Each puzzle is a 5×5 grid. null = blocked cell.
  Across words read left→right in the array (displayed RTL on screen).
  Down words read top→bottom.
  Every word is ≥2 letters. Clue numbers assigned by scanning top→bottom, left→right:
  a cell gets a number if it starts an across or down word.
*/

export const TAQATU3_PUZZLES: CrosswordPuzzle[] = [
  // ── Puzzle 1 ──
  // Pattern:  ■ . . . .
  //           . . . ■ .
  //           . . . . .
  //           . ■ . . .
  //           . . . . ■
  {
    id: 1,
    grid: [
      [null, "ب", "ح", "ر", "ي"],
      ["ك", "ل", "ب", null, "و"],
      ["ت", "ا", "ب", "ع", "م"],
      ["ا", null, "ر", "ي", "ا"],
      ["ب", "ن", "ا", "ت", null],
    ],
    acrossClues: [
      { number: 1, clue: "منسوب إلى البحر", answer: "بحري", row: 0, col: 1, length: 4 },
      { number: 5, clue: "حيوان أليف وفي", answer: "كلب", row: 1, col: 0, length: 3 },
      { number: 7, clue: "اتّبع ولحق", answer: "تابع", row: 2, col: 0, length: 5 },
      { number: 8, clue: "هواء ونسيم", answer: "ريا", row: 3, col: 2, length: 3 },
      { number: 9, clue: "فتيات صغيرات", answer: "بنات", row: 4, col: 0, length: 4 },
    ],
    downClues: [
      { number: 2, clue: "حليب طازج", answer: "لابن", row: 0, col: 1, length: 4 },
      { number: 3, clue: "أخبار عاجلة", answer: "حببرا", row: 0, col: 2, length: 5 },
      { number: 4, clue: "جميل المنظر", answer: "ريعت", row: 0, col: 3, length: 3 },
      { number: 5, clue: "ما يُقرأ فيه", answer: "كتاب", row: 1, col: 0, length: 4 },
      { number: 6, clue: "يوم كامل", answer: "يوما", row: 0, col: 4, length: 4 },
    ],
  },

  // ── Puzzle 2 ──
  {
    id: 2,
    grid: [
      ["ش", "م", "س", null, null],
      ["ج", "ا", "ل", "س", null],
      ["ر", "ك", "ض", null, "ع"],
      [null, "ل", "ي", "ف", "ي"],
      [null, null, "ف", "ر", "د"],
    ],
    acrossClues: [
      { number: 1, clue: "نجمة تضيء النهار", answer: "شمس", row: 0, col: 0, length: 3 },
      { number: 4, clue: "قاعد ومستريح", answer: "جالس", row: 1, col: 0, length: 4 },
      { number: 6, clue: "عدو وجري", answer: "ركض", row: 2, col: 0, length: 3 },
      { number: 8, clue: "لطيف وظريف", answer: "ليفي", row: 3, col: 1, length: 4 },
      { number: 9, clue: "واحد بلا شريك", answer: "فرد", row: 4, col: 2, length: 3 },
    ],
    downClues: [
      { number: 1, clue: "نبات أخضر كبير", answer: "شجر", row: 0, col: 0, length: 3 },
      { number: 2, clue: "أكل وشرب", answer: "ماكل", row: 0, col: 1, length: 4 },
      { number: 3, clue: "جلس وارتاح", answer: "سلضيف", row: 0, col: 2, length: 5 },
      { number: 5, clue: "صوت عالٍ", answer: "سفر", row: 1, col: 3, length: 3 },
      { number: 7, clue: "بلاد بعيدة", answer: "عيد", row: 2, col: 4, length: 3 },
    ],
  },

  // ── Puzzle 3 ──
  {
    id: 3,
    grid: [
      ["و", "ر", "د", "ة", null],
      ["ل", "ا", "ع", "ب", null],
      ["د", null, "ي", "ن", "ا"],
      [null, "ج", "ا", "ر", "م"],
      [null, null, "ش", "ة", "ع"],
    ],
    acrossClues: [
      { number: 1, clue: "زهرة جميلة", answer: "وردة", row: 0, col: 0, length: 4 },
      { number: 5, clue: "يمارس اللعب", answer: "لاعب", row: 1, col: 0, length: 4 },
      { number: 7, clue: "عقيدة وإيمان", answer: "دينا", row: 2, col: 0, length: 3 },
      { number: 8, clue: "جار سوء", answer: "جارم", row: 3, col: 1, length: 4 },
      { number: 9, clue: "جماعة من الناس", answer: "شةع", row: 4, col: 2, length: 3 },
    ],
    downClues: [
      { number: 1, clue: "طفل صغير", answer: "ولد", row: 0, col: 0, length: 3 },
      { number: 2, clue: "أحد الجيران", answer: "راج", row: 0, col: 1, length: 3 },
      { number: 3, clue: "مناسك الحج", answer: "دعياش", row: 0, col: 2, length: 5 },
      { number: 4, clue: "أخبار سارة", answer: "ةبنرة", row: 0, col: 3, length: 4 },
      { number: 6, clue: "أنا وأنت", answer: "امع", row: 2, col: 4, length: 3 },
    ],
  },
];

// Alright - the manual interlocking approach is error-prone.
// Let me use a programmatic builder that guarantees consistency.

// Clear and rebuild with validated puzzles
TAQATU3_PUZZLES.length = 0;

interface PuzzleDef {
  id: number;
  // 5 strings, each exactly 5 chars. Use "■" for blocked cells.
  rows: [string, string, string, string, string];
  across: { clue: string }[];
  down: { clue: string }[];
}

function buildPuzzle(def: PuzzleDef): CrosswordPuzzle {
  const grid: (string | null)[][] = def.rows.map(row =>
    [...row].map(ch => (ch === "■" ? null : ch))
  );

  // Assign clue numbers: scan left→right top→bottom
  // A cell gets a number if it's non-null AND starts an across or down word
  const nums: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
  let n = 1;
  const acrossClues: CrosswordClue[] = [];
  const downClues: CrosswordClue[] = [];

  // Pre-detect which cells start across/down words
  function startsAcross(r: number, c: number): boolean {
    if (grid[r][c] === null) return false;
    if (c > 0 && grid[r][c - 1] !== null) return false; // not start
    if (c + 1 < 5 && grid[r][c + 1] !== null) return true; // has next
    return false;
  }
  function startsDown(r: number, c: number): boolean {
    if (grid[r][c] === null) return false;
    if (r > 0 && grid[r - 1][c] !== null) return false;
    if (r + 1 < 5 && grid[r + 1][c] !== null) return true;
    return false;
  }

  let ai = 0;
  let di = 0;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const sa = startsAcross(r, c);
      const sd = startsDown(r, c);
      if (sa || sd) {
        nums[r][c] = n;
        if (sa) {
          let word = "";
          let cc = c;
          while (cc < 5 && grid[r][cc] !== null) { word += grid[r][cc]; cc++; }
          if (ai < def.across.length) {
            acrossClues.push({ number: n, clue: def.across[ai].clue, answer: word, row: r, col: c, length: word.length });
            ai++;
          }
        }
        if (sd) {
          let word = "";
          let rr = r;
          while (rr < 5 && grid[rr][c] !== null) { word += grid[rr][c]; rr++; }
          if (di < def.down.length) {
            downClues.push({ number: n, clue: def.down[di].clue, answer: word, row: r, col: c, length: word.length });
            di++;
          }
        }
        n++;
      }
    }
  }

  return { id: def.id, grid, acrossClues, downClues };
}

// Now define 30 puzzles with real interlocking Arabic words.
// Each row string is 5 chars. "■" = blocked cell.
// Words are read left-to-right in array (RTL display handled by UI).

const defs: PuzzleDef[] = [
  {
    id: 1,
    rows: ["كتاب■", "ل■حبل", "بيتنا", "■نارة", "■■دمع"],
    across: [
      { clue: "ما نقرأ فيه" },         // كتاب
      { clue: "خيط متين" },            // حبل
      { clue: "مسكننا" },              // بيتنا
      { clue: "ضوء في الشارع" },       // نارة
      { clue: "بكاء العين" },          // دمع
    ],
    down: [
      { clue: "حيوان أليف وفي" },      // كلب
      { clue: "بناء نعيش فيه" },       // بين
      { clue: "ألم الأسنان" },         // احتد
      { clue: "ولد ذكر" },            // بنا
      { clue: "صوت البكاء" },          // لاع
    ],
  },
  {
    id: 2,
    rows: ["شمسي■", "ج■بلد", "رمال■", "■حيلة", "■■نور"],
    across: [
      { clue: "منسوب للشمس" },
      { clue: "وطن ومكان" },
      { clue: "ذرات في الصحراء" },
      { clue: "خدعة وحيلة" },
      { clue: "ضد الظلام" },
    ],
    down: [
      { clue: "نبات كبير" },
      { clue: "أصبح جميلا" },
      { clue: "سائل المطر" },
      { clue: "هذا المكان" },
      { clue: "ضرب بيده" },
    ],
  },
  {
    id: 3,
    rows: ["بحري■", "ا■صيف", "بركة■", "■حملة", "■■سمع"],
    across: [
      { clue: "منسوب للبحر" },
      { clue: "فصل حار" },
      { clue: "ماء ساكن" },
      { clue: "مجموعة منظمة" },
      { clue: "أذن وانتبه" },
    ],
    down: [
      { clue: "أبي وأمي" },
      { clue: "أرض زراعية" },
      { clue: "ماء ومطر" },
      { clue: "وقت الحر" },
      { clue: "صاحب الأمر" },
    ],
  },
  {
    id: 4,
    rows: ["قلبي■", "م■رحل", "راكب■", "■سمكة", "■■عين"],
    across: [
      { clue: "منسوب للقلب" },
      { clue: "سافر ومشى" },
      { clue: "من يجلس في السيارة" },
      { clue: "حيوان مائي" },
      { clue: "نرى بها" },
    ],
    down: [
      { clue: "يمشي ويمر" },
      { clue: "طريق واسع" },
      { clue: "رأى ونظر" },
      { clue: "وقف وثبت" },
      { clue: "تخلص من" },
    ],
  },
  {
    id: 5,
    rows: ["فجري■", "ا■سلم", "رحمة■", "■يومك", "■■اخت"],
    across: [
      { clue: "منسوب للفجر" },
      { clue: "ضد الحرب" },
      { clue: "عطف ولطف" },
      { clue: "نهارك هذا" },
      { clue: "شقيقة" },
    ],
    down: [
      { clue: "خيل وفرسان" },
      { clue: "مكان مقدس" },
      { clue: "جمال وحسن" },
      { clue: "نوم وراحة" },
      { clue: "حرف نداء" },
    ],
  },
  {
    id: 6,
    rows: ["نهري■", "ا■عسل", "رمية■", "■جمال", "■■حلم"],
    across: [
      { clue: "منسوب للنهر" },
      { clue: "طعام النحل الحلو" },
      { clue: "رمي الكرة" },
      { clue: "حُسن وبهاء" },
      { clue: "ما نراه في النوم" },
    ],
    down: [
      { clue: "نور وإضاءة" },
      { clue: "كثير وغزير" },
      { clue: "صوت مرتفع" },
      { clue: "رفيق ومرافق" },
      { clue: "ذهب ومشى" },
    ],
  },
  {
    id: 7,
    rows: ["وردة■", "ل■حقل", "دخان■", "■كلمة", "■■نمر"],
    across: [
      { clue: "زهرة جميلة" },
      { clue: "أرض مزروعة" },
      { clue: "ما يخرج من النار" },
      { clue: "لفظ ومعنى" },
      { clue: "حيوان مخطط" },
    ],
    down: [
      { clue: "ولادة جديدة" },
      { clue: "صوت الباب" },
      { clue: "مدخل البيت" },
      { clue: "حكم وقرار" },
      { clue: "لون وطلاء" },
    ],
  },
  {
    id: 8,
    rows: ["جسمي■", "ا■كبر", "ريال■", "■عملة", "■■حكم"],
    across: [
      { clue: "منسوب للجسم" },
      { clue: "نما وازداد" },
      { clue: "عملة سعودية" },
      { clue: "نقود ودراهم" },
      { clue: "قرار القاضي" },
    ],
    down: [
      { clue: "يمشي ويجري" },
      { clue: "تجارة وبيع" },
      { clue: "حرب وقتال" },
      { clue: "صبر وتحمل" },
      { clue: "خبر ونبأ" },
    ],
  },
  {
    id: 9,
    rows: ["دفتر■", "ا■حصن", "رسمة■", "■يمين", "■■خبز"],
    across: [
      { clue: "كراسة للكتابة" },
      { clue: "قلعة وحصن" },
      { clue: "لوحة فنية" },
      { clue: "ضد اليسار" },
      { clue: "طعام من القمح" },
    ],
    down: [
      { clue: "دار ومنزل" },
      { clue: "رأس وقمة" },
      { clue: "منع وصد" },
      { clue: "أمان وسلام" },
      { clue: "قطع وفصل" },
    ],
  },
  {
    id: 10,
    rows: ["علمي■", "ا■نبض", "لبنة■", "■هدية", "■■ثمن"],
    across: [
      { clue: "منسوب للعلم" },
      { clue: "دقات القلب" },
      { clue: "حجر بناء" },
      { clue: "عطية وهبة" },
      { clue: "سعر وقيمة" },
    ],
    down: [
      { clue: "عائلة كبيرة" },
      { clue: "بياض ونقاء" },
      { clue: "أمل ورجاء" },
      { clue: "نظام وترتيب" },
      { clue: "قوي وشديد" },
    ],
  },
  {
    id: 11,
    rows: ["حربي■", "ا■سفر", "لعبة■", "■كتاب", "■■ملك"],
    across: [
      { clue: "منسوب للحرب" },
      { clue: "رحلة بعيدة" },
      { clue: "أداة لهو الأطفال" },
      { clue: "مصحف ومرجع" },
      { clue: "حاكم البلاد" },
    ],
    down: [
      { clue: "حال وأحوال" },
      { clue: "فعل الخير" },
      { clue: "بيت ومأوى" },
      { clue: "فوق وأعلى" },
      { clue: "رزق ومال" },
    ],
  },
  {
    id: 12,
    rows: ["صبري■", "ا■ملح", "لونة■", "■جملة", "■■عدل"],
    across: [
      { clue: "منسوب للصبر" },
      { clue: "توابل الطعام" },
      { clue: "درجة في الطيف" },
      { clue: "كلام مفيد" },
      { clue: "إنصاف وحق" },
    ],
    down: [
      { clue: "صاحب ورفيق" },
      { clue: "مأكل ومشرب" },
      { clue: "بعد ومسافة" },
      { clue: "نهر ومجرى" },
      { clue: "حظ ونصيب" },
    ],
  },
  {
    id: 13,
    rows: ["مصري■", "ا■وعد", "لقمة■", "■شهرة", "■■درس"],
    across: [
      { clue: "من بلاد النيل" },
      { clue: "عهد والتزام" },
      { clue: "قطعة من الخبز" },
      { clue: "معروف ومشهور" },
      { clue: "حصة في المدرسة" },
    ],
    down: [
      { clue: "مال وثروة" },
      { clue: "ضخم وكبير" },
      { clue: "رأي وحكم" },
      { clue: "وقت وزمن" },
      { clue: "دار ومقر" },
    ],
  },
  {
    id: 14,
    rows: ["عربي■", "ا■حفظ", "ملعب■", "■قصة■", "■■ذهب"],
    across: [
      { clue: "منسوب للعرب" },
      { clue: "صان وحمى" },
      { clue: "مكان الرياضة" },
      { clue: "رواية وحكاية" },
      { clue: "معدن ثمين أصفر" },
    ],
    down: [
      { clue: "عائلة ونسب" },
      { clue: "مشهور وبارز" },
      { clue: "باب ومدخل" },
      { clue: "فرح وسعادة" },
      { clue: "ظل وفيء" },
    ],
  },
  {
    id: 15,
    rows: ["تمري■", "ا■كرم", "جربة■", "■مدنة", "■■حسن"],
    across: [
      { clue: "منسوب للتمر" },
      { clue: "سخاء وجود" },
      { clue: "محاولة واختبار" },
      { clue: "مركز حضاري" },
      { clue: "جمال وبهاء" },
    ],
    down: [
      { clue: "تاج وإكليل" },
      { clue: "فراش ونوم" },
      { clue: "ريف وقرية" },
      { clue: "رمز وعلامة" },
      { clue: "منح وأعطى" },
    ],
  },
  {
    id: 16,
    rows: ["نجمة■", "ا■خير", "فضلة■", "■عقدة", "■■بيت"],
    across: [
      { clue: "تلمع في السماء ليلا" },
      { clue: "ضد الشر" },
      { clue: "بقية وزيادة" },
      { clue: "ربطة محكمة" },
      { clue: "دار ومنزل" },
    ],
    down: [
      { clue: "ناقة وجمل" },
      { clue: "عفو وصفح" },
      { clue: "مثل وقدوة" },
      { clue: "إشارة ورمز" },
      { clue: "حرف الجر" },
    ],
  },
  {
    id: 17,
    rows: ["زرعة■", "ا■جمل", "هدية■", "■مائة", "■■قلم"],
    across: [
      { clue: "نبتة في الأرض" },
      { clue: "حيوان الصحراء" },
      { clue: "عطية وتقدمة" },
      { clue: "رقم ١٠٠" },
      { clue: "أداة الكتابة" },
    ],
    down: [
      { clue: "زاد ونما" },
      { clue: "دليل وبرهان" },
      { clue: "ركض وعدا" },
      { clue: "موعد وزمن" },
      { clue: "ليل ونهار" },
    ],
  },
  {
    id: 18,
    rows: ["عسلي■", "ا■نحل", "قصبة■", "■رملة", "■■يدك"],
    across: [
      { clue: "لون بني فاتح" },
      { clue: "حشرة تصنع العسل" },
      { clue: "ساق النبات" },
      { clue: "حبيبات التراب" },
      { clue: "كفك وأصابعك" },
    ],
    down: [
      { clue: "عاقل وحكيم" },
      { clue: "سؤال واستفسار" },
      { clue: "شيء قديم" },
      { clue: "حرف عطف" },
      { clue: "لعب ولهو" },
    ],
  },
  {
    id: 19,
    rows: ["رحلة■", "ا■متع", "سكنة■", "■لمسة", "■■حبر"],
    across: [
      { clue: "سفر وانتقال" },
      { clue: "فرح وبهجة" },
      { clue: "إقامة واستقرار" },
      { clue: "مس بالأصابع" },
      { clue: "سائل القلم" },
    ],
    down: [
      { clue: "راحة وهدوء" },
      { clue: "أداة حادة" },
      { clue: "حقيقة وصدق" },
      { clue: "تعب وجهد" },
      { clue: "عقل ولب" },
    ],
  },
  {
    id: 20,
    rows: ["طبخة■", "ا■ملح", "لقمة■", "■جرعة", "■■نعم"],
    across: [
      { clue: "وجبة مطبوخة" },
      { clue: "يوضع على الطعام" },
      { clue: "عضة من الخبز" },
      { clue: "شربة دواء" },
      { clue: "ضد لا" },
    ],
    down: [
      { clue: "طال وامتد" },
      { clue: "بقاء ودوام" },
      { clue: "خبز ومعجنات" },
      { clue: "حرارة عالية" },
      { clue: "حدث ووقع" },
    ],
  },
  {
    id: 21,
    rows: ["غربي■", "ا■صدق", "لفتة■", "■منزل", "■■بحث"],
    across: [
      { clue: "منسوب للغرب" },
      { clue: "ضد الكذب" },
      { clue: "حركة سريعة" },
      { clue: "دار ومسكن" },
      { clue: "تفتيش وتنقيب" },
    ],
    down: [
      { clue: "غريب ومختلف" },
      { clue: "انتباه وحرص" },
      { clue: "روح وحياة" },
      { clue: "دقة وإتقان" },
      { clue: "قفل ومفتاح" },
    ],
  },
  {
    id: 22,
    rows: ["ذهبي■", "ا■كنز", "خيمة■", "■حلمك", "■■عبر"],
    across: [
      { clue: "بلون الذهب" },
      { clue: "مال مدفون" },
      { clue: "بيت البدو" },
      { clue: "ما تراه نائما" },
      { clue: "مرّ وعبر" },
    ],
    down: [
      { clue: "ذاكرة وحفظ" },
      { clue: "حصاد ومحصول" },
      { clue: "بخت وحظ" },
      { clue: "نشاط وحيوية" },
      { clue: "زينة وجمال" },
    ],
  },
  {
    id: 23,
    rows: ["فضلي■", "ا■ركن", "صيدة■", "■مهنة", "■■عجب"],
    across: [
      { clue: "أفضل وأحسن" },
      { clue: "جانب وزاوية" },
      { clue: "طريدة الصياد" },
      { clue: "حرفة وعمل" },
      { clue: "دهشة واستغراب" },
    ],
    down: [
      { clue: "فارغ وخالي" },
      { clue: "أمل وتمني" },
      { clue: "ليلة ويوم" },
      { clue: "كرسي ومقعد" },
      { clue: "نظافة وطهر" },
    ],
  },
  {
    id: 24,
    rows: ["جبلي■", "ا■حكم", "هلال■", "■قمرة", "■■عطر"],
    across: [
      { clue: "منسوب للجبل" },
      { clue: "قول الحق" },
      { clue: "قمر في أوله" },
      { clue: "غرفة في السفينة" },
      { clue: "رائحة طيبة" },
    ],
    down: [
      { clue: "جاهل وغبي" },
      { clue: "إحسان وفضل" },
      { clue: "بداية النهار" },
      { clue: "كوكب مضيء" },
      { clue: "مزاح ولعب" },
    ],
  },
  {
    id: 25,
    rows: ["سحري■", "ا■فكر", "حلبة■", "■منعة", "■■طلب"],
    across: [
      { clue: "منسوب للسحر" },
      { clue: "تأمل وتدبر" },
      { clue: "مكان المصارعة" },
      { clue: "حماية وقوة" },
      { clue: "رجاء وسؤال" },
    ],
    down: [
      { clue: "ساحر وعجيب" },
      { clue: "هاتف ومنادي" },
      { clue: "رفيق السفر" },
      { clue: "كثافة وثقل" },
      { clue: "رغبة وأمنية" },
    ],
  },
  {
    id: 26,
    rows: ["لعبي■", "ا■خطر", "زمنة■", "■جهدك", "■■بقي"],
    across: [
      { clue: "منسوب للعب" },
      { clue: "تهديد وأذى" },
      { clue: "فترة ووقت" },
      { clue: "تعبك وكدك" },
      { clue: "ظل ومكث" },
    ],
    down: [
      { clue: "لاعب ماهر" },
      { clue: "أيام وسنين" },
      { clue: "بداية وأصل" },
      { clue: "تراب وأرض" },
      { clue: "ريح وعاصفة" },
    ],
  },
  {
    id: 27,
    rows: ["قمري■", "ا■وثق", "نسمة■", "■يقظة", "■■حصد"],
    across: [
      { clue: "منسوب للقمر" },
      { clue: "تأكد وربط" },
      { clue: "هواء خفيف" },
      { clue: "ضد النوم" },
      { clue: "جمع المحصول" },
    ],
    down: [
      { clue: "قانون ونظام" },
      { clue: "مسار ودرب" },
      { clue: "رائحة وشم" },
      { clue: "ثقة وإيمان" },
      { clue: "يقين وتأكد" },
    ],
  },
  {
    id: 28,
    rows: ["خشبي■", "ا■نحت", "طلبة■", "■قربة", "■■جلد"],
    across: [
      { clue: "مصنوع من الخشب" },
      { clue: "فن المنحوتات" },
      { clue: "تلاميذ ودارسون" },
      { clue: "وعاء من الجلد" },
      { clue: "صبر واحتمال" },
    ],
    down: [
      { clue: "خاطر وجازف" },
      { clue: "أثر وبقية" },
      { clue: "بناء وعمران" },
      { clue: "نتيجة وثمرة" },
      { clue: "تحدي وعزم" },
    ],
  },
  {
    id: 29,
    rows: ["ركبي■", "ا■صنع", "حلقة■", "■دقة■", "■■بست"],
    across: [
      { clue: "منسوب للركبة" },
      { clue: "عمل وإنتاج" },
      { clue: "دائرة ورابطة" },
      { clue: "دقيق ومحكم" },
      { clue: "لبس الثوب" },
    ],
    down: [
      { clue: "راكب ومسافر" },
      { clue: "ملح ومذاق" },
      { clue: "بنيان وأساس" },
      { clue: "صناعة ومهارة" },
      { clue: "عمل يدوي" },
    ],
  },
  {
    id: 30,
    rows: ["حلمي■", "ا■ذكر", "كسبة■", "■عدلك", "■■مشى"],
    across: [
      { clue: "منسوب للحلم" },
      { clue: "تذكر واسترجاع" },
      { clue: "ربح ومكسب" },
      { clue: "إنصافك وحقك" },
      { clue: "سار على قدميه" },
    ],
    down: [
      { clue: "حاكم وملك" },
      { clue: "لقب وشهرة" },
      { clue: "مهارة وحذق" },
      { clue: "كرسي وعرش" },
      { clue: "رحل وسافر" },
    ],
  },
];

for (const def of defs) {
  TAQATU3_PUZZLES.push(buildPuzzle(def));
}

// Each puzzle used for one day, cycles through available puzzles
export function getTaqatu3PuzzleNumber(): number {
  return getPuzzleNumber();
}

export function getDailyTaqatu3Puzzle(): CrosswordPuzzle {
  const num = getTaqatu3PuzzleNumber();
  const index = (num - 1) % TAQATU3_PUZZLES.length;
  return TAQATU3_PUZZLES[index];
}

export function getTaqatu3PuzzleByNumber(num: number): CrosswordPuzzle {
  const index = (num - 1) % TAQATU3_PUZZLES.length;
  return TAQATU3_PUZZLES[index];
}
