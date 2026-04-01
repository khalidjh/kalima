import { getPuzzleNumber } from "./words";

export type CategoryColor = "yellow" | "green" | "blue" | "red";

export interface RawabetCategory {
  name: string;
  words: [string, string, string, string];
  color: CategoryColor;
}

export interface RawabetPuzzle {
  id: number;
  categories: [RawabetCategory, RawabetCategory, RawabetCategory, RawabetCategory];
}

export const RAWABET_PUZZLES: RawabetPuzzle[] = [
  {
    id: 1,
    categories: [
      { name: "فواكه", words: ["تفاح", "برتقال", "موز", "عنب"], color: "yellow" },
      { name: "حيوانات البحر", words: ["سمكة", "حوت", "دلفين", "قرش"], color: "green" },
      { name: "ألوان", words: ["أحمر", "أزرق", "أخضر", "أصفر"], color: "blue" },
      { name: "أيام الأسبوع", words: ["الاثنين", "الثلاثاء", "الأربعاء", "الخميس"], color: "red" },
    ],
  },
  {
    id: 2,
    categories: [
      { name: "مشروبات", words: ["قهوة", "شاي", "عصير", "لبن"], color: "yellow" },
      { name: "مدن سعودية", words: ["الرياض", "جدة", "مكة", "المدينة"], color: "green" },
      { name: "أدوات المطبخ", words: ["ملعقة", "شوكة", "سكين", "طنجرة"], color: "blue" },
      { name: "طيور", words: ["عقاب", "حمامة", "بلبل", "غراب"], color: "red" },
    ],
  },
  {
    id: 3,
    categories: [
      { name: "رياضات", words: ["كرة القدم", "تنس", "سباحة", "ملاكمة"], color: "yellow" },
      { name: "أشهر رمضان", words: ["سحور", "إفطار", "تراويح", "زكاة"], color: "green" },
      { name: "مهن", words: ["طبيب", "مهندس", "معلم", "محامي"], color: "blue" },
      { name: "أجزاء الوجه", words: ["عين", "أنف", "فم", "أذن"], color: "red" },
    ],
  },
  {
    id: 4,
    categories: [
      { name: "خضروات", words: ["جزر", "بطاطا", "بصل", "ثوم"], color: "yellow" },
      { name: "أنبياء", words: ["موسى", "عيسى", "إبراهيم", "يوسف"], color: "green" },
      { name: "وسائل النقل", words: ["قطار", "طائرة", "سفينة", "حافلة"], color: "blue" },
      { name: "تحيات عربية", words: ["أهلاً", "مرحباً", "هلاً", "السلام"], color: "red" },
    ],
  },
  {
    id: 5,
    categories: [
      { name: "توابل", words: ["زعفران", "كمون", "فلفل", "قرفة"], color: "yellow" },
      { name: "دول الخليج", words: ["الكويت", "البحرين", "قطر", "عمان"], color: "green" },
      { name: "أدوات دراسية", words: ["قلم", "كتاب", "مسطرة", "ممحاة"], color: "blue" },
      { name: "تعابير الفرح", words: ["ماشاء الله", "يهلا", "بالتوفيق", "مبروك"], color: "red" },
    ],
  },
  {
    id: 6,
    categories: [
      { name: "أكلات شعبية", words: ["كبسة", "مندي", "هريسة", "مطبق"], color: "yellow" },
      { name: "أجزاء الجسم", words: ["قلب", "كبد", "رئة", "كلية"], color: "green" },
      { name: "فصول السنة", words: ["ربيع", "صيف", "خريف", "شتاء"], color: "blue" },
      { name: "ما بعد الموت", words: ["جنة", "نار", "برزخ", "حساب"], color: "red" },
    ],
  },
  {
    id: 7,
    categories: [
      { name: "حيوانات الصحراء", words: ["جمل", "ثعلب", "ضب", "ورل"], color: "yellow" },
      { name: "كواكب", words: ["المريخ", "زحل", "المشتري", "الزهرة"], color: "green" },
      { name: "ملابس", words: ["ثوب", "عباءة", "غترة", "إزار"], color: "blue" },
      { name: "أسماء قرآنية للنساء", words: ["مريم", "هاجر", "آسيا", "بلقيس"], color: "red" },
    ],
  },
  {
    id: 8,
    categories: [
      { name: "أنواع الرز", words: ["بسمتي", "ياباني", "برياني", "مصري"], color: "yellow" },
      { name: "عواصم عربية", words: ["بغداد", "دمشق", "القاهرة", "عمّان"], color: "green" },
      { name: "مشاعر", words: ["فرح", "حزن", "غضب", "خوف"], color: "blue" },
      { name: "أسماء أنهار", words: ["النيل", "الفرات", "دجلة", "الأردن"], color: "red" },
    ],
  },
  {
    id: 9,
    categories: [
      { name: "أنواع الخبز", words: ["رقاق", "تنور", "صامولي", "بغل"], color: "yellow" },
      { name: "أدوات الموسيقى", words: ["عود", "ناي", "طبلة", "ربابة"], color: "green" },
      { name: "أوقات الصلاة", words: ["فجر", "ظهر", "عصر", "مغرب"], color: "blue" },
      { name: "معادن نفيسة", words: ["ذهب", "فضة", "بلاتين", "ماس"], color: "red" },
    ],
  },
  {
    id: 10,
    categories: [
      { name: "نجوم كرة القدم العرب", words: ["سالم الدوسري", "يسف النسيري", "عمر عبد الودود", "عبد الرزاق حمد الله"], color: "yellow" },
      { name: "أنواع الصيام", words: ["رمضان", "شوال", "عاشوراء", "قضاء"], color: "green" },
      { name: "ألعاب شعبية", words: ["الغميضة", "الحجلة", "البليات", "الطاق طاق"], color: "blue" },
      { name: "صفات الله الحسنى", words: ["الرحمن", "الغفور", "الكريم", "العليم"], color: "red" },
    ],
  },
  {
    id: 11,
    categories: [
      { name: "حلويات عربية", words: ["كنافة", "بقلاوة", "لقيمات", "هريسة"], color: "yellow" },
      { name: "أنواع القهوة", words: ["إسبريسو", "كابتشينو", "لاتيه", "أمريكانو"], color: "green" },
      { name: "أرقام عربية", words: ["واحد", "اثنان", "ثلاثة", "أربعة"], color: "blue" },
      { name: "أقمار الكواكب", words: ["القمر", "فوبوس", "تيتان", "يوروبا"], color: "red" },
    ],
  },
  {
    id: 12,
    categories: [
      { name: "أنواع السمك", words: ["سلمون", "تونة", "هامور", "زبيدي"], color: "yellow" },
      { name: "مدن مصرية", words: ["الإسكندرية", "أسوان", "الأقصر", "بورسعيد"], color: "green" },
      { name: "أدوات البناء", words: ["مطرقة", "مسمار", "مبرد", "منشار"], color: "blue" },
      { name: "أنواع العقود", words: ["بيع", "إجارة", "هبة", "رهن"], color: "red" },
    ],
  },
  {
    id: 13,
    categories: [
      { name: "حشرات", words: ["نملة", "نحلة", "فراشة", "جندب"], color: "yellow" },
      { name: "أسماء أدوات الكتابة القديمة", words: ["قلم", "مداد", "لوح", "ريشة"], color: "green" },
      { name: "مواسم دينية", words: ["عيد الفطر", "عيد الأضحى", "رمضان", "الحج"], color: "blue" },
      { name: "أسماء شعراء عرب", words: ["المتنبي", "أبو نواس", "امرؤ القيس", "الجاحظ"], color: "red" },
    ],
  },
  {
    id: 14,
    categories: [
      { name: "محاصيل زراعية", words: ["قمح", "شعير", "ذرة", "أرز"], color: "yellow" },
      { name: "تضاريس جغرافية", words: ["جبل", "وادي", "سهل", "هضبة"], color: "green" },
      { name: "حروف التعليل", words: ["لأن", "بسبب", "إذ", "كيلا"], color: "blue" },
      { name: "أسماء سور قرآنية", words: ["البقرة", "النساء", "الكهف", "يوسف"], color: "red" },
    ],
  },
  {
    id: 15,
    categories: [
      { name: "رواد الفضاء العرب", words: ["هزاع المنصوري", "سلطان النيادي", "علي القرني", "رائد سلام"], color: "yellow" },
      { name: "أنواع الشعر", words: ["عمودي", "حر", "هايكو", "ملحمي"], color: "green" },
      { name: "أسماء بحار", words: ["المتوسط", "الأحمر", "العربي", "الأسود"], color: "blue" },
      { name: "صنوف الجيش", words: ["مشاة", "مدرعات", "بحرية", "جوية"], color: "red" },
    ],
  },
  {
    id: 16,
    categories: [
      { name: "أنواع الجبن", words: ["شيدر", "موزاريلا", "بري", "فيتا"], color: "yellow" },
      { name: "علماء مسلمون", words: ["ابن سينا", "الخوارزمي", "البيروني", "ابن رشد"], color: "green" },
      { name: "أدوات الطبخ", words: ["موقد", "فرن", "مقلاة", "خلاط"], color: "blue" },
      { name: "أنواع الخيمة", words: ["شعر", "قماش", "نايلون", "جلد"], color: "red" },
    ],
  },
  {
    id: 17,
    categories: [
      { name: "أنواع الصلوات", words: ["فريضة", "سنة", "تطوع", "وتر"], color: "yellow" },
      { name: "مدن مغربية", words: ["الرباط", "فاس", "مراكش", "الدار البيضاء"], color: "green" },
      { name: "أوزان الشعر", words: ["طويل", "بسيط", "كامل", "وافر"], color: "blue" },
      { name: "حيوانات مفترسة", words: ["أسد", "نمر", "ضبع", "ذئب"], color: "red" },
    ],
  },
  {
    id: 18,
    categories: [
      { name: "مواد البناء", words: ["إسمنت", "رمل", "حصى", "طابوق"], color: "yellow" },
      { name: "أجزاء الشجرة", words: ["جذر", "ساق", "ورقة", "ثمرة"], color: "green" },
      { name: "أنواع المطر", words: ["رذاذ", "وابل", "طل", "صيب"], color: "blue" },
      { name: "أسماء الملائكة", words: ["جبريل", "ميكائيل", "إسرافيل", "عزرائيل"], color: "red" },
    ],
  },
  {
    id: 19,
    categories: [
      { name: "تقنيات حديثة", words: ["ذكاء اصطناعي", "بلوكتشين", "ميتافيرس", "سحابة"], color: "yellow" },
      { name: "أسماء زهور", words: ["وردة", "ياسمين", "زنبق", "أقحوان"], color: "green" },
      { name: "أنواع الأكل البحري", words: ["جمبري", "كراب", "أخطبوط", "بطلينوس"], color: "blue" },
      { name: "صفات الرجل الكريم", words: ["جود", "سخاء", "كرم", "عطاء"], color: "red" },
    ],
  },
  {
    id: 20,
    categories: [
      { name: "أنواع التمر", words: ["مجدول", "خلاص", "سكري", "أجوة"], color: "yellow" },
      { name: "فنانون عرب", words: ["فيروز", "أم كلثوم", "عبد الحليم", "ووردة"], color: "green" },
      { name: "أسماء صحراوات", words: ["الربع الخالي", "النفود", "الدهناء", "الدبدبة"], color: "blue" },
      { name: "مصطلحات النحو", words: ["مبتدأ", "خبر", "فاعل", "مفعول"], color: "red" },
    ],
  },
  {
    id: 21,
    categories: [
      { name: "مكونات الشاورما", words: ["لحم", "طحينة", "توم", "فلفل"], color: "yellow" },
      { name: "أسماء خلفاء راشدين", words: ["أبوبكر", "عمر", "عثمان", "علي"], color: "green" },
      { name: "ظواهر طبيعية", words: ["زلزال", "بركان", "إعصار", "تسونامي"], color: "blue" },
      { name: "أدوات الاستفهام", words: ["من", "ما", "متى", "كيف"], color: "red" },
    ],
  },
  {
    id: 22,
    categories: [
      { name: "أنواع البيت", words: ["فيلا", "شقة", "قصر", "خيمة"], color: "yellow" },
      { name: "أعضاء الحواس", words: ["عين", "أذن", "أنف", "لسان"], color: "green" },
      { name: "أسماء بحيرات", words: ["تشاد", "فيكتوريا", "بايكال", "تيتيكاكا"], color: "blue" },
      { name: "تصنيف القرآن", words: ["جزء", "حزب", "ربع", "سورة"], color: "red" },
    ],
  },
  {
    id: 23,
    categories: [
      { name: "أنواع العسل", words: ["سدر", "أكاسيا", "مانوكا", "زهور"], color: "yellow" },
      { name: "مدن عراقية", words: ["الموصل", "البصرة", "أربيل", "كربلاء"], color: "green" },
      { name: "أنواع الصيد", words: ["قنص", "شبكة", "سنارة", "مصيدة"], color: "blue" },
      { name: "أسماء مشهورة من التاريخ الإسلامي", words: ["صلاح الدين", "خالد بن الوليد", "طارق بن زياد", "نور الدين"], color: "red" },
    ],
  },
  {
    id: 24,
    categories: [
      { name: "أنواع الخضرة", words: ["نعنع", "بقدونس", "كزبرة", "ريحان"], color: "yellow" },
      { name: "مؤسسو دول عربية", words: ["عبد العزيز", "محمد علي", "قابوس", "زايد"], color: "green" },
      { name: "أنواع المحيطات", words: ["الهادئ", "الأطلسي", "الهندي", "المتجمد"], color: "blue" },
      { name: "مصطلحات صرفية", words: ["مصدر", "فعل", "اسم", "حرف"], color: "red" },
    ],
  },
  {
    id: 25,
    categories: [
      { name: "حيوانات المزرعة", words: ["بقرة", "خروف", "دجاجة", "حمار"], color: "yellow" },
      { name: "مدن تركية", words: ["إسطنبول", "أنقرة", "إزمير", "بورصة"], color: "green" },
      { name: "أنواع الرياح", words: ["شمال", "جنوب", "شرقية", "غربية"], color: "blue" },
      { name: "أمثال عربية مشهورة تبدأ بـ\"من\"", words: ["من جد وجد", "من صبر ظفر", "من سلم سلم", "من طلب العلا"], color: "red" },
    ],
  },
  {
    id: 26,
    categories: [
      { name: "وجبات يومية", words: ["فطور", "غداء", "عشاء", "سحور"], color: "yellow" },
      { name: "أنواع الشاي", words: ["أخضر", "أسود", "مورينغا", "نعنع"], color: "green" },
      { name: "دول أفريقية عربية", words: ["المغرب", "تونس", "الجزائر", "ليبيا"], color: "blue" },
      { name: "أسماء كواكب المجموعة الشمسية بالترتيب", words: ["عطارد", "الزهرة", "الأرض", "المريخ"], color: "red" },
    ],
  },
  {
    id: 27,
    categories: [
      { name: "طيور لا تطير", words: ["نعامة", "بطريق", "كيوي", "إيمو"], color: "yellow" },
      { name: "أنواع التربة", words: ["طينية", "رملية", "صخرية", "طباشيرية"], color: "green" },
      { name: "أسماء تلال مكة", words: ["أبو قبيس", "أبي قبيس", "قعيقعان", "هندي"], color: "blue" },
      { name: "أنواع الصوم المنهي عنه", words: ["الوصال", "الدهر", "الصمت", "يوم الشك"], color: "red" },
    ],
  },
  {
    id: 28,
    categories: [
      { name: "مواد خام للأقمشة", words: ["قطن", "حرير", "صوف", "كتان"], color: "yellow" },
      { name: "أسماء خلجان", words: ["العقبة", "السويس", "عدن", "عمان"], color: "green" },
      { name: "أنواع الرياضة المائية", words: ["تجديف", "غطس", "إبحار", "تزلج مائي"], color: "blue" },
      { name: "شروط الصلاة الصحيحة", words: ["طهارة", "استقبال القبلة", "وقت", "نية"], color: "red" },
    ],
  },
  {
    id: 29,
    categories: [
      { name: "أطباق الفطور السعودي", words: ["فول", "بيض", "جبن", "مرمريتة"], color: "yellow" },
      { name: "أسماء ملوك السعودية", words: ["عبد العزيز", "سعود", "فيصل", "خالد"], color: "green" },
      { name: "أنواع الخط العربي", words: ["نسخ", "ثلث", "ديواني", "رقعة"], color: "blue" },
      { name: "أسماء دول تبدأ بـ\"ال\"", words: ["الأردن", "اليمن", "الكويت", "البحرين"], color: "red" },
    ],
  },
  {
    id: 30,
    categories: [
      { name: "أنواع العقود الرياضية", words: ["إعارة", "انتقال حر", "بيع", "تمديد"], color: "yellow" },
      { name: "أسماء من سورة يوسف", words: ["يعقوب", "يوسف", "بنيامين", "زليخا"], color: "green" },
      { name: "أنواع الأسماك في الخليج", words: ["كنعد", "شعري", "ربيان", "بياح"], color: "blue" },
      { name: "مصطلحات الشطرنج", words: ["رخ", "وزير", "بيدق", "فيل"], color: "red" },
    ],
  },
];

export function getRawabetPuzzleNumber(): number {
  // Use same logic as getPuzzleNumber but rawabet-specific
  return getPuzzleNumber();
}

export function getDailyRawabetPuzzle(): RawabetPuzzle {
  const puzzleNum = getRawabetPuzzleNumber();
  const index = (puzzleNum - 1) % RAWABET_PUZZLES.length;
  return RAWABET_PUZZLES[index];
}
