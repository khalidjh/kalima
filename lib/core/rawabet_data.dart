// Arabic Connections (Rawaabit) puzzle data

enum CategoryColor { yellow, green, blue, red }

class RawabetCategory {
  final String name;
  final List<String> words;
  final CategoryColor color;
  const RawabetCategory({
    required this.name,
    required this.words,
    required this.color,
  });
}

class RawabetPuzzle {
  final int id;
  final List<RawabetCategory> categories;
  const RawabetPuzzle({required this.id, required this.categories});
}

const List<RawabetPuzzle> rawabetPuzzles = [
  RawabetPuzzle(id: 1, categories: [
    RawabetCategory(name: "فواكه", words: ["تفاح", "برتقال", "موز", "عنب"], color: CategoryColor.yellow),
    RawabetCategory(name: "حيوانات البحر", words: ["سمكة", "حوت", "دلفين", "قرش"], color: CategoryColor.green),
    RawabetCategory(name: "ألوان", words: ["أحمر", "أزرق", "أخضر", "أصفر"], color: CategoryColor.blue),
    RawabetCategory(name: "أيام الأسبوع", words: ["الاثنين", "الثلاثاء", "الأربعاء", "الخميس"], color: CategoryColor.red),
  ]),
  RawabetPuzzle(id: 2, categories: [
    RawabetCategory(name: "مشروبات", words: ["قهوة", "شاي", "عصير", "لبن"], color: CategoryColor.yellow),
    RawabetCategory(name: "مدن سعودية", words: ["الرياض", "جدة", "مكة", "المدينة"], color: CategoryColor.green),
    RawabetCategory(name: "أدوات المطبخ", words: ["ملعقة", "شوكة", "سكين", "طنجرة"], color: CategoryColor.blue),
    RawabetCategory(name: "طيور", words: ["عقاب", "حمامة", "بلبل", "غراب"], color: CategoryColor.red),
  ]),
  RawabetPuzzle(id: 3, categories: [
    RawabetCategory(name: "أكلات شعبية", words: ["كبسة", "مندي", "هريسة", "مطبق"], color: CategoryColor.yellow),
    RawabetCategory(name: "أشهر رمضان", words: ["سحور", "إفطار", "تراويح", "زكاة"], color: CategoryColor.green),
    RawabetCategory(name: "مهن", words: ["طبيب", "مهندس", "معلم", "محامي"], color: CategoryColor.blue),
    RawabetCategory(name: "أجزاء الوجه", words: ["عين", "أنف", "فم", "أذن"], color: CategoryColor.red),
  ]),
  RawabetPuzzle(id: 4, categories: [
    RawabetCategory(name: "خضروات", words: ["جزر", "بطاطا", "بصل", "ثوم"], color: CategoryColor.yellow),
    RawabetCategory(name: "أنبياء", words: ["موسى", "عيسى", "إبراهيم", "يوسف"], color: CategoryColor.green),
    RawabetCategory(name: "وسائل النقل", words: ["قطار", "طائرة", "سفينة", "حافلة"], color: CategoryColor.blue),
    RawabetCategory(name: "تحيات عربية", words: ["أهلاً", "مرحباً", "هلاً", "السلام"], color: CategoryColor.red),
  ]),
  RawabetPuzzle(id: 5, categories: [
    RawabetCategory(name: "توابل", words: ["زعفران", "كمون", "فلفل", "قرفة"], color: CategoryColor.yellow),
    RawabetCategory(name: "دول الخليج", words: ["الكويت", "البحرين", "قطر", "عمان"], color: CategoryColor.green),
    RawabetCategory(name: "أدوات دراسية", words: ["قلم", "كتاب", "مسطرة", "ممحاة"], color: CategoryColor.blue),
    RawabetCategory(name: "تعابير الفرح", words: ["ماشاء الله", "يهلا", "بالتوفيق", "مبروك"], color: CategoryColor.red),
  ]),
  RawabetPuzzle(id: 6, categories: [
    RawabetCategory(name: "أنواع العسل", words: ["سدر", "أكاسيا", "مانوكا", "زهور"], color: CategoryColor.yellow),
    RawabetCategory(name: "فصول السنة", words: ["ربيع", "صيف", "خريف", "شتاء"], color: CategoryColor.green),
    RawabetCategory(name: "مشاعر", words: ["فرح", "حزن", "غضب", "خوف"], color: CategoryColor.blue),
    RawabetCategory(name: "أوقات الصلاة", words: ["فجر", "ظهر", "عصر", "مغرب"], color: CategoryColor.red),
  ]),
  RawabetPuzzle(id: 7, categories: [
    RawabetCategory(name: "حيوانات الصحراء", words: ["جمل", "ثعلب", "ضب", "ورل"], color: CategoryColor.yellow),
    RawabetCategory(name: "كواكب", words: ["المريخ", "زحل", "المشتري", "الزهرة"], color: CategoryColor.green),
    RawabetCategory(name: "ملابس", words: ["ثوب", "عباءة", "غترة", "إزار"], color: CategoryColor.blue),
    RawabetCategory(name: "أسماء قرآنية", words: ["مريم", "هاجر", "آسيا", "بلقيس"], color: CategoryColor.red),
  ]),
  RawabetPuzzle(id: 8, categories: [
    RawabetCategory(name: "حلويات عربية", words: ["كنافة", "بقلاوة", "لقيمات", "هريسة"], color: CategoryColor.yellow),
    RawabetCategory(name: "أنواع القهوة", words: ["إسبريسو", "كابتشينو", "لاتيه", "أمريكانو"], color: CategoryColor.green),
    RawabetCategory(name: "أرقام عربية", words: ["واحد", "اثنان", "ثلاثة", "أربعة"], color: CategoryColor.blue),
    RawabetCategory(name: "حشرات", words: ["نملة", "نحلة", "فراشة", "جندب"], color: CategoryColor.red),
  ]),
  RawabetPuzzle(id: 9, categories: [
    RawabetCategory(name: "أنواع الخبز", words: ["رقاق", "تنور", "صامولي", "بغل"], color: CategoryColor.yellow),
    RawabetCategory(name: "أدوات الموسيقى", words: ["عود", "ناي", "طبلة", "ربابة"], color: CategoryColor.green),
    RawabetCategory(name: "معادن نفيسة", words: ["ذهب", "فضة", "بلاتين", "ماس"], color: CategoryColor.blue),
    RawabetCategory(name: "مصطلحات النحو", words: ["مبتدأ", "خبر", "فاعل", "مفعول"], color: CategoryColor.red),
  ]),
  RawabetPuzzle(id: 10, categories: [
    RawabetCategory(name: "مواد خام", words: ["قطن", "حرير", "صوف", "كتان"], color: CategoryColor.yellow),
    RawabetCategory(name: "علماء مسلمون", words: ["ابن سينا", "الخوارزمي", "البيروني", "ابن رشد"], color: CategoryColor.green),
    RawabetCategory(name: "أدوات الطبخ", words: ["موقد", "فرن", "مقلاة", "خلاط"], color: CategoryColor.blue),
    RawabetCategory(name: "حيوانات مفترسة", words: ["أسد", "نمر", "ضبع", "ذئب"], color: CategoryColor.red),
  ]),
];

int getPuzzleNumber() {
  final now = DateTime.now();
  final riyadhNow = now.toUtc().add(const Duration(hours: 3));
  final launch = DateTime(2026, 1, 1);
  final diff = riyadhNow.difference(launch).inDays;
  return (diff + 1).clamp(1, 99999);
}

int getRawabetPuzzleNumber() => getPuzzleNumber();

RawabetPuzzle getDailyRawabetPuzzle() {
  final n = getRawabetPuzzleNumber();
  return rawabetPuzzles[(n - 1) % rawabetPuzzles.length];
}
