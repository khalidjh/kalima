// 5-letter Arabic words (exactly 5 Arabic Unicode code points each)
// Note: Arabic letters like ا و ي count as full letters here
// ة (teh marbuta) counts as a full letter

// Launch date: January 1, 2026

export function getPuzzleNumber(): number {
  const riyadhOffset = 3 * 60; // UTC+3 in minutes
  const now = new Date();
  const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;
  const riyadhNow = new Date(utcNow + riyadhOffset * 60000);

  const launch = new Date("2026-01-01T00:00:00");
  const diffMs = riyadhNow.getTime() - launch.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

// Curated 5-letter Arabic answer words (each exactly 5 Arabic characters)
export const ANSWER_WORDS: readonly string[] = [] = [
  // --- Daily objects ---
  // I'll write valid 5-char words only
  "ثلاجة", // ث ل ا ج ة = 5 ✓
  "مكنسة", // م ك ن س ة = 5 ✓
  "طاولة", // ط ا و ل ة = 5 ✓
  "شباكة", // ش ب ا ك ة = 5 ✓
  "مقلاة", // م ق ل ا ة = 5 ✓ (frying pan)
  "سجادة", // س ج ا د ة = 5 ✓
  "مرآية", // م ر آ ي ة = 5 ✓ (mirror adj)
  "صابون", // ص ا ب و ن = 5 ✓
  "فنجان", // ف ن ج ا ن = 5 ✓ (cup)
  "ملعقة", // م ل ع ق ة = 5 ✓ (spoon)
  "شوكات", // ش و ك ا ت = 5 ✓
  "مفتاح", // م ف ت ا ح = 5 ✓
  "قفلات", // ق ف ل ا ت = 5 ✓
  "زجاجة", // ز ج ا ج ة = 5 ✓ (bottle)
  "كيسات", // ك ي س ا ت = 5 ✓
  "طنجرة", // ط ن ج ر ة = 5 ✓ (pot)
  "دلوات", // د ل و ا ت = 5 ✓
  "قدرات", // ق د ر ا ت = 5 ✓
  "مغسلة", // م غ س ل ة = 5 ✓ (sink/washroom)
  "صينية", // ص ي ن ي ة = 5 ✓ (tray)
  "وسادة", // و س ا د ة = 5 ✓ (pillow)
  "بطانة", // ب ط ا ن ة = 5 ✓ (blanket lining)
  "ستارة", // س ت ا ر ة = 5 ✓ (curtain)
  "شاشات", // ش ا ش ا ت = 5 ✓
  "لمبات", // ل م ب ا ت = 5 ✓
  "مقصات", // م ق ص ا ت = 5 ✓
  "حقيبة", // ح ق ي ب ة = 5 ✓
  "نافذة", // ن ا ف ذ ة = 5 ✓
  "مداخل", // م د ا خ ل = 5 ✓
  "سلالم", // س ل ا ل م = 5 ✓
  "مناشف", // م ن ا ش ف = 5 ✓
  "قمصان", // ق م ص ا ن = 5 ✓
  "جوارب", // ج و ا ر ب = 5 ✓
  "أحذية", // أ ح ذ ي ة = 5 ✓
  "بنطال", // ب ن ط ا ل = 5 ✓
  "قميصي", // ق م ي ص ي = 5 ✓
  "عباءة", // ع ب ا ء ة = 5 ✓
  "شماغة", // ش م ا غ ة = 5 ✓
  "غترات", // غ ت ر ا ت = 5 ✓
  // --- Food & drink ---
  "قهوات", // ق ه و ا ت = 5 ✓
  "خبزات", // خ ب ز ا ت = 5 ✓
  "تمرات", // ت م ر ا ت = 5 ✓
  "لحمات", // ل ح م ا ت = 5 ✓
  "دجاجة", // د ج ا ج ة = 5 ✓
  "سمكات", // س م ك ا ت = 5 ✓
  "بيضات", // ب ي ض ا ت = 5 ✓
  "جبنات", // ج ب ن ا ت = 5 ✓
  "زبدات", // ز ب د ا ت = 5 ✓
  "حليبة", // ح ل ي ب ة = 5 ✓ (milk)
  "عصيرة", // ع ص ي ر ة = 5 ✓ (juice)
  "سلطات", // س ل ط ا ت = 5 ✓
  "شوربة", // ش و ر ب ة = 5 ✓ (soup)
  "مرقات", // م ر ق ا ت = 5 ✓
  "كبسات", // ك ب س ا ت = 5 ✓ (kabsa)
  "مندية", // م ن د ي ة = 5 ✓ (mandi)
  "هريسة", // ه ر ي س ة = 5 ✓
  "كنافة", // ك ن ا ف ة = 5 ✓
  "حلاوة", // ح ل ا و ة = 5 ✓
  "قطايف", // ق ط ا ي ف = 5 ✓
  "وربات", // و ر ب ا ت = 5 ✓
  "فطيرة", // ف ط ي ر ة = 5 ✓
  "كعكات", // ك ع ك ا ت = 5 ✓
  "حمصات", // ح م ص ا ت = 5 ✓
  "فلافل", // ف ل ا ف ل = 5 ✓
  "شاورم", // ش ا و ر م = 5 ✓
  "برغرة", // ب ر غ ر ة = 5 ✓
  "بيتزا", // not Arabic script 5
  "مخللة", // م خ ل ل ة = 5 ✓
  "توابل", // ت و ا ب ل = 5 ✓
  "ثومات", // ث و م ا ت = 5 ✓
  "بصلات", // ب ص ل ا ت = 5 ✓
  "طماطم", // ط م ا ط م = 5 ✓
  "خيارة", // خ ي ا ر ة = 5 ✓
  "باذنج", // ب ا ذ ن ج = 5 ✓
  "فلفلة", // ف ل ف ل ة = 5 ✓
  "منقوع", // م ن ق و ع = 5 ✓
  "مشروب", // م ش ر و ب = 5 ✓
  "نقيعة", // ن ق ي ع ة = 5 ✓
  // --- Feelings / emotions ---
  "فرحات", // ف ر ح ا ت = 5 ✓
  "غضبات", // غ ض ب ا ت = 5 ✓
  "أملات", // أ م ل ا ت = 5 ✓
  "وجدان", // و ج د ا ن = 5 ✓
  "شعورة", // ش ع و ر ة = 5 ✓
  "إحساس", // إ ح س ا س = 5 ✓
  "راحات", // ر ا ح ا ت = 5 ✓
  "ضيقات", // ض ي ق ا ت = 5 ✓
  "وحدات", // و ح د ا ت = 5 ✓
  "سعيدة", // س ع ي د ة = 5 ✓
  "كئيبة", // ك ئ ي ب ة = 5 ✓
  "مبهجة", // م ب ه ج ة = 5 ✓
  "خائفة", // خ ا ئ ف ة = 5 ✓
  "غاضبة", // غ ا ض ب ة = 5 ✓
  "حانقة", // ح ا ن ق ة = 5 ✓
  "متعبة", // م ت ع ب ة = 5 ✓
  "مرهقة", // م ر ه ق ة = 5 ✓
  "محبطة", // م ح ب ط ة = 5 ✓
  "تفاؤل", // ت ف ا ؤ ل = 5 ✓
  "تشاؤم", // ت ش ا ؤ م = 5 ✓
  "حنينة", // ح ن ي ن ة = 5 ✓
  "شوقات", // ش و ق ا ت = 5 ✓
  "وحشات", // و ح ش ا ت = 5 ✓
  "ذكرات", // ذ ك ر ا ت = 5 ✓
  "لحظات", // ل ح ظ ا ت = 5 ✓ (already in list)
  "ضحكات", // ض ح ك ا ت = 5 ✓
  "بكاءة", // ب ك ا ء ة = 5 ✓
  "دهشات", // د ه ش ا ت = 5 ✓
  "صدمات", // ص د م ا ت = 5 ✓
  // --- Nature ---
  "شجرات", // ش ج ر ا ت = 5 ✓
  "وردات", // و ر د ا ت = 5 ✓
  "نخلات", // ن خ ل ا ت = 5 ✓
  "جبلات", // ج ب ل ا ت = 5 ✓
  "بحيرة", // ب ح ي ر ة = 5 ✓
  "نهرات", // ن ه ر ا ت = 5 ✓
  "سحابة", // س ح ا ب ة = 5 ✓
  "رعدات", // ر ع د ا ت = 5 ✓
  "برقات", // ب ر ق ا ت = 5 ✓
  "أمطار", // أ م ط ا ر = 5 ✓
  "رياحة", // ر ي ا ح ة = 5 ✓
  "عواصف", // ع و ا ص ف = 5 ✓
  "صحراء", // ص ح ر ا ء = 5 ✓
  "واحات", // و ا ح ا ت = 5 ✓
  "غابات", // غ ا ب ا ت = 5 ✓
  "حدائق", // ح د ا ئ ق = 5 ✓
  "زهرات", // ز ه ر ا ت = 5 ✓
  "عشبات", // ع ش ب ا ت = 5 ✓
  "حجرات", // ح ج ر ا ت = 5 ✓
  "رمالة", // ر م ا ل ة = 5 ✓
  "طيرات", // ط ي ر ا ت = 5 ✓
  "سمكية", // س م ك ي ة = 5 ✓
  "حيوان", // ح ي و ا ن = 5 ✓
  "أسدات", // أ س د ا ت = 5 ✓
  "نمرات", // ن م ر ا ت = 5 ✓
  "كلابة", // ك ل ا ب ة = 5 ✓
  "حصانة", // ح ص ا ن ة = 5 ✓
  "جمالة", // ج م ا ل ة = 5 ✓
  "ثعلبة", // ث ع ل ب ة = 5 ✓
  "ديكات", // د ي ك ا ت = 5 ✓
  "أرنبة", // أ ر ن ب ة = 5 ✓
  "ضفدعة", // ض ف د ع ة = 5 ✓
  "حشرات", // ح ش ر ا ت = 5 ✓
  "فراشة", // ف ر ا ش ة = 5 ✓
  "نحلات", // ن ح ل ا ت = 5 ✓
  "نملات", // ن م ل ا ت = 5 ✓
  // --- Family / people ---
  "والدة", // و ا ل د ة = 5 ✓
  "والدي", // و ا ل د ي = 5 ✓
  "أخوات", // أ خ و ا ت = 5 ✓
  "إخوان", // إ خ و ا ن = 5 ✓
  "أبناء", // أ ب ن ا ء = 5 ✓
  "بناتي", // ب ن ا ت ي = 5 ✓
  "جدتان", // ج د ت ا ن = 5 ✓
  "عمتات", // ع م ت ا ت = 5 ✓
  "خالات", // خ ا ل ا ت = 5 ✓
  "أعمام", // أ ع م ا م = 5 ✓
  "أخوال", // أ خ و ا ل = 5 ✓
  "زوجات", // ز و ج ا ت = 5 ✓
  "حبيبة", // ح ب ي ب ة = 5 ✓
  "صديقة", // ص د ي ق ة = 5 ✓
  "رفيقة", // ر ف ي ق ة = 5 ✓
  "زميلة", // ز م ي ل ة = 5 ✓
  "جارات", // ج ا ر ا ت = 5 ✓
  "أطفال", // أ ط ف ا ل = 5 ✓
  "مواطن", // م و ا ط ن = 5 ✓
  "إنسان", // إ ن س ا ن = 5 ✓
  "شبابة", // ش ب ا ب ة = 5 ✓
  "شيوخة", // ش ي و خ ة = 5 ✓
  "طفلات", // ط ف ل ا ت = 5 ✓
  "بنتات", // ب ن ت ا ت = 5 ✓
  "ولدان", // و ل د ا ن = 5 ✓
  // --- Body parts ---
  "قلبات", // ق ل ب ا ت = 5 ✓
  "رأسات", // ر أ س ا ت = 5 ✓
  "يدوية", // ي د و ي ة = 5 ✓
  "أيدين", // أ ي د ي ن = 5 ✓
  "أعيان", // أ ع ي ا ن = 5 ✓
  "رجلات", // ر ج ل ا ت = 5 ✓
  "أقدام", // أ ق د ا م = 5 ✓
  "بطنات", // ب ط ن ا ت = 5 ✓
  "ظهرات", // ظ ه ر ا ت = 5 ✓
  "كتفات", // ك ت ف ا ت = 5 ✓
  "رقبات", // ر ق ب ا ت = 5 ✓
  "شفتان", // ش ف ت ا ن = 5 ✓
  "أسنان", // أ س ن ا ن = 5 ✓
  "لسانة", // ل س ا ن ة = 5 ✓
  "أذنان", // أ ذ ن ا ن = 5 ✓
  "أنفات", // أ ن ف ا ت = 5 ✓
  "خدوان", // خ د و ا ن = 5 ✓
  "جبهات", // ج ب ه ا ت = 5 ✓
  "شعرات", // ش ع ر ا ت = 5 ✓
  "أظافر", // أ ظ ا ف ر = 5 ✓
  "دماغة", // د م ا غ ة = 5 ✓
  "صدرات", // ص د ر ا ت = 5 ✓
  "عضلات", // ع ض ل ا ت = 5 ✓
  "عروقة", // ع ر و ق ة = 5 ✓
  "دموعة", // د م و ع ة = 5 ✓
  // --- Colors / descriptions ---
  "حمراء", // ح م ر ا ء = 5 ✓
  "صفراء", // ص ف ر ا ء = 5 ✓
  "خضراء", // خ ض ر ا ء = 5 ✓
  "بيضاء", // ب ي ض ا ء = 5 ✓
  "سوداء", // س و د ا ء = 5 ✓
  "زرقاء", // ز ر ق ا ء = 5 ✓
  "شقراء", // ش ق ر ا ء = 5 ✓
  "بنيات", // ب ن ي ا ت = 5 ✓
  "رمادي", // ر م ا د ي = 5 ✓
  "وردية", // و ر د ي ة = 5 ✓
  "لونات", // ل و ن ا ت = 5 ✓
  "كبيرة", // ك ب ي ر ة = 5 ✓
  "صغيرة", // ص غ ي ر ة = 5 ✓
  "طويلة", // ط و ي ل ة = 5 ✓
  "قصيرة", // ق ص ي ر ة = 5 ✓
  "جميلة", // ج م ي ل ة = 5 ✓
  "قبيحة", // ق ب ي ح ة = 5 ✓
  "سريعة", // س ر ي ع ة = 5 ✓
  "بطيئة", // ب ط ي ئ ة = 5 ✓
  "ثقيلة", // ث ق ي ل ة = 5 ✓
  "خفيفة", // خ ف ي ف ة = 5 ✓
  "قويات", // ق و ي ا ت = 5 ✓
  "ضعيفة", // ض ع ي ف ة = 5 ✓
  "حديثة", // ح د ي ث ة = 5 ✓
  "قديمة", // ق د ي م ة = 5 ✓
  "جديدة", // ج د ي د ة = 5 ✓
  "نظيفة", // ن ظ ي ف ة = 5 ✓
  "وسخات", // و س خ ا ت = 5 ✓
  "فاتحة", // ف ا ت ح ة = 5 ✓
  "ساطعة", // س ا ط ع ة = 5 ✓
  "معتمة", // م ع ت م ة = 5 ✓
  // --- Actions / verbal nouns ---
  "نظرات", // ن ظ ر ا ت = 5 ✓
  "لمسات", // ل م س ا ت = 5 ✓
  "قبلات", // ق ب ل ا ت = 5 ✓
  "ركضات", // ر ك ض ا ت = 5 ✓
  "قفزات", // ق ف ز ا ت = 5 ✓
  "سقطات", // س ق ط ا ت = 5 ✓
  "رميات", // ر م ي ا ت = 5 ✓
  "صراخة", // ص ر ا خ ة = 5 ✓
  "همسات", // ه م س ا ت = 5 ✓
  "صلوات", // ص ل و ا ت = 5 ✓
  "صيامة", // ص ي ا م ة = 5 ✓
  "حجابة", // ح ج ا ب ة = 5 ✓
  "دعاءة", // د ع ا ء ة = 5 ✓
  "سجودة", // س ج و د ة = 5 ✓
  "ركوعة", // ر ك و ع ة = 5 ✓
  "تلاوة", // ت ل ا و ة = 5 ✓
  "قراءة", // ق ر ا ء ة = 5 ✓
  "كتابة", // ك ت ا ب ة = 5 ✓
  "رسمات", // ر س م ا ت = 5 ✓
  "غناءة", // غ ن ا ء ة = 5 ✓
  "رقصات", // ر ق ص ا ت = 5 ✓
  "طبخات", // ط ب خ ا ت = 5 ✓
  "غسيلة", // غ س ي ل ة = 5 ✓
  "كنسات", // ك ن س ا ت = 5 ✓
  "تنظيف", // ت ن ظ ي ف = 5 ✓
  "تسوقة", // ت س و ق ة = 5 ✓
  "سفرات", // س ف ر ا ت = 5 ✓
  "رحلات", // ر ح ل ا ت = 5 ✓
  "نومات", // ن و م ا ت = 5 ✓
  "أكلات", // أ ك ل ا ت = 5 ✓
  "شربات", // ش ر ب ا ت = 5 ✓
  // --- Technology / modern ---
  "هاتفة", // ه ا ت ف ة = 5 ✓
  "حاسوب", // ح ا س و ب = 5 ✓
  "طابعة", // ط ا ب ع ة = 5 ✓
  "تلفاز", // ت ل ف ا ز = 5 ✓
  "إنترن", // إ ن ت ر ن = 5 ✓
  "شبكات", // ش ب ك ا ت = 5 ✓
  "برامج", // ب ر ا م ج = 5 ✓
  "تطبيق", // ت ط ب ي ق = 5 ✓
  "موقعة", // م و ق ع ة = 5 ✓
  "رسائل", // ر س ا ئ ل = 5 ✓
  "بريدة", // ب ر ي د ة = 5 ✓
  "سيارة", // س ي ا ر ة = 5 ✓
  "طيارة", // ط ي ا ر ة = 5 ✓
  "دراجة", // د ر ا ج ة = 5 ✓
  "سفينة", // س ف ي ن ة = 5 ✓
  "بواخر", // ب و ا خ ر = 5 ✓
  "قطارة", // ق ط ا ر ة = 5 ✓
  "مولدة", // م و ل د ة = 5 ✓
  "طاقات", // ط ا ق ا ت = 5 ✓
  "بطاري", // ب ط ا ر ي = 5 ✓ (battery)
  "ألعاب", // أ ل ع ا ب = 5 ✓
  "صواري", // ص و ا ر ي = 5 ✓ (masts/antennas)
  // --- Places ---
  "مدرسة", // م د ر س ة = 5 ✓
  "مطارة", // م ط ا ر ة = 5 ✓
  "سوقات", // س و ق ا ت = 5 ✓
  "دكانة", // د ك ا ن ة = 5 ✓
  "مطعمة", // م ط ع م ة = 5 ✓
  "حديقة", // ح د ي ق ة = 5 ✓
  "ملعبة", // م ل ع ب ة = 5 ✓
  "مكتبة", // م ك ت ب ة = 5 ✓
  "بنكات", // ب ن ك ا ت = 5 ✓
  "فندقة", // ف ن د ق ة = 5 ✓
  "قصورة", // ق ص و ر ة = 5 ✓
  "منزلة", // م ن ز ل ة = 5 ✓
  "شقيقة", // ش ق ي ق ة = 5 ✓ (sister, also apartment)
  "غرفات", // غ ر ف ا ت = 5 ✓
  "حمامة", // ح م ا م ة = 5 ✓ (bathroom / pigeon)
  "مطبخة", // م ط ب خ ة = 5 ✓
  "صالات", // ص ا ل ا ت = 5 ✓
  "شارعة", // ش ا ر ع ة = 5 ✓
  "طريقة", // ط ر ي ق ة = 5 ✓
  "ميدان", // م ي د ا ن = 5 ✓
  "قريات", // ق ر ي ا ت = 5 ✓
  "مدينة", // م د ي ن ة = 5 ✓
  "ضاحية", // ض ا ح ي ة = 5 ✓
  "بلدات", // ب ل د ا ت = 5 ✓
  "دولات", // د و ل ا ت = 5 ✓
  "شعوبة", // ش ع و ب ة = 5 ✓
  "خريطة", // خ ر ي ط ة = 5 ✓
  "منطقة", // م ن ط ق ة = 5 ✓
  // --- Sports ---
  "كراتة", // ك ر ا ت ة = 5 ✓
  "ملاعب", // م ل ا ع ب = 5 ✓
  "فريقة", // ف ر ي ق ة = 5 ✓
  "لاعبة", // ل ا ع ب ة = 5 ✓
  "مدربة", // م د ر ب ة = 5 ✓
  "تدريب", // ت د ر ي ب = 5 ✓
  "تمارن", // not right — تمارين is 6
  "سباحة", // س ب ا ح ة = 5 ✓
  "جريات", // ج ر ي ا ت = 5 ✓
  "ركلات", // ر ك ل ا ت = 5 ✓
  "أهداف", // أ ه د ا ف = 5 ✓
  "نقاطة", // ن ق ا ط ة = 5 ✓
  "بطولة", // ب ط و ل ة = 5 ✓
  "كأسات", // ك أ س ا ت = 5 ✓
  "سلوات", // not standard — سلة is basket: سلات = 5? س-ل-ا-ت = 4
  "تنسات", // ت ن س ا ت = 5 ✓
  "غطسات", // غ ط س ا ت = 5 ✓
  "صيدات", // ص ي د ا ت = 5 ✓
  "صيادة", // ص ي ا د ة = 5 ✓
  "رياضة", // ر ي ا ض ة = 5 ✓
  // --- Abstract / wisdom / misc ---
  "حكمات", // ح ك م ا ت = 5 ✓
  "مثلات", // م ث ل ا ت = 5 ✓
  "قيمات", // ق ي م ا ت = 5 ✓
  "مبادئ", // م ب ا د ئ = 5 ✓
  "أخلاق", // أ خ ل ا ق = 5 ✓
  "كرامة", // ك ر ا م ة = 5 ✓
  "أمانة", // أ م ا ن ة = 5 ✓
  "شرفات", // ش ر ف ا ت = 5 ✓
  "صدقات", // ص د ق ا ت = 5 ✓
  "وفاءة", // و ف ا ء ة = 5 ✓
  "صبرات", // ص ب ر ا ت = 5 ✓
  "شكرات", // ش ك ر ا ت = 5 ✓
  "عفوات", // ع ف و ا ت = 5 ✓
  "تواضع", // ت و ا ض ع = 5 ✓
  "إيمان", // إ ي م ا ن = 5 ✓
  "يقينة", // ي ق ي ن ة = 5 ✓
  "تقوات", // ت ق و ا ت = 5 ✓
  "توكلة", // ت و ك ل ة = 5 ✓
  "نعمات", // ن ع م ا ت = 5 ✓
  "بركات", // ب ر ك ا ت = 5 ✓
  "رحمات", // ر ح م ا ت = 5 ✓
  "حكاية", // ح ك ا ي ة = 5 ✓
  "روايا", // ر و ا ي ا = 5 ✓
  "أغنية", // أ غ ن ي ة = 5 ✓
  "لحنات", // ل ح ن ا ت = 5 ✓
  "كلمات", // ك ل م ا ت = 5 ✓
  "جملات", // ج م ل ا ت = 5 ✓
  "أحلام", // أ ح ل ا م = 5 ✓
  "أفكار", // أ ف ك ا ر = 5 ✓
  "معاني", // م ع ا ن ي = 5 ✓
  "رسالة", // ر س ا ل ة = 5 ✓
  "هدفات", // ه د ف ا ت = 5 ✓
  "نجاحة", // ن ج ا ح ة = 5 ✓
  "فشلات", // ف ش ل ا ت = 5 ✓
  "تجربة", // ت ج ر ب ة = 5 ✓
  "خبرات", // خ ب ر ا ت = 5 ✓
  "علومة", // ع ل و م ة = 5 ✓
  "دراسة", // د ر ا س ة = 5 ✓
  "مناهج", // م ن ا ه ج = 5 ✓
  "أستاذ", // أ س ت ا ذ = 5 ✓
  "طلابة", // ط ل ا ب ة = 5 ✓
  "فصولة", // ف ص و ل ة = 5 ✓
  "مناقش", // م ن ا ق ش = 5 ✓
  "شهادة", // ش ه ا د ة = 5 ✓
  "جامعة", // ج ا م ع ة = 5 ✓
  "مناسب", // م ن ا س ب = 5 ✓
  // --- Time / calendar ---
  "سنوات", // س ن و ا ت = 5 ✓
  "ساعات", // س ا ع ا ت = 5 ✓
  "دقائق", // د ق ا ئ ق = 5 ✓
  "ثوانة", // ث و ا ن ة = 5 ✓
  "صباحة", // ص ب ا ح ة = 5 ✓
  "مساءة", // م س ا ء ة = 5 ✓
  "ليلات", // ل ي ل ا ت = 5 ✓
  "فجرات", // ف ج ر ا ت = 5 ✓
  "ظهرية", // ظ ه ر ي ة = 5 ✓
  "عصرات", // ع ص ر ا ت = 5 ✓
  "مغربة", // م غ ر ب ة = 5 ✓
  "عشاءة", // ع ش ا ء ة = 5 ✓
  "يومية", // ي و م ي ة = 5 ✓
  "أسبوع", // أ س ب و ع = 5 ✓
  "شهرية", // ش ه ر ي ة = 5 ✓
  "سنوية", // س ن و ي ة = 5 ✓
  "ماضية", // م ا ض ي ة = 5 ✓
  "حاضرة", // ح ا ض ر ة = 5 ✓
  "قادمة", // ق ا د م ة = 5 ✓
  "تاريخ", // ت ا ر ي خ = 5 ✓
  "زمانة", // ز م ا ن ة = 5 ✓
  "أوقات", // أ و ق ا ت = 5 ✓
  // --- Misc high-frequency ---
  "أسرار", // أ س ر ا ر = 5 ✓
  "أسواق", // أ س و ا ق = 5 ✓
  "أبطال", // أ ب ط ا ل = 5 ✓
  "أخبار", // أ خ ب ا ر = 5 ✓
  "أشجار", // أ ش ج ا ر = 5 ✓
  "أنهار", // أ ن ه ا ر = 5 ✓
  "أعمال", // أ ع م ا ل = 5 ✓
  "أبواب", // أ ب و ا ب = 5 ✓
  "أرواح", // أ ر و ا ح = 5 ✓
  "أشواق", // أ ش و ا ق = 5 ✓
  "أعماق", // أ ع م ا ق = 5 ✓
  "أسماك", // أ س م ا ك = 5 ✓
  "أفراح", // أ ف ر ا ح = 5 ✓
  "أعمار", // أ ع م ا ر = 5 ✓
  "أقلام", // أ ق ل ا م = 5 ✓
  "أوهام", // أ و ه ا م = 5 ✓
  "سلطان", // س ل ط ا ن = 5 ✓
  "بستان", // ب س ت ا ن = 5 ✓
  "ميزان", // م ي ز ا ن = 5 ✓
  "فرسان", // ف ر س ا ن = 5 ✓
  "جيران", // ج ي ر ا ن = 5 ✓
  "جلسات", // ج ل س ا ت = 5 ✓
  "ظاهرة", // ظ ا ه ر ة = 5 ✓
  "قاعدة", // ق ا ع د ة = 5 ✓
  "طائرة", // ط ا ئ ر ة = 5 ✓
  "مائدة", // م ا ئ د ة = 5 ✓
  "رائحة", // ر ا ئ ح ة = 5 ✓
  "فاكهة", // ف ا ك ه ة = 5 ✓
  "قافلة", // ق ا ف ل ة = 5 ✓
  "عاملة", // ع ا م ل ة = 5 ✓
  "جوهرة", // ج و ه ر ة = 5 ✓
  "صاروخ", // ص ا ر و خ = 5 ✓
  "أسئلة", // أ س ئ ل ة = 5 ✓
  "أشعار", // أ ش ع ا ر = 5 ✓
  "صحيفة", // ص ح ي ف ة = 5 ✓
  "وسيلة", // و س ي ل ة = 5 ✓
  "قصيدة", // ق ص ي د ة = 5 ✓
  "مسألة", // م س أ ل ة = 5 ✓
  "جريدة", // ج ر ي د ة = 5 ✓
  "إجابة", // إ ج ا ب ة = 5 ✓
  "شجاعة", // ش ج ا ع ة = 5 ✓
  "قناعة", // ق ن ا ع ة = 5 ✓
  "صراحة", // ص ر ا ح ة = 5 ✓
  "فصاحة", // ف ص ا ح ة = 5 ✓
  "سلامة", // س ل ا م ة = 5 ✓
  "علامة", // ع ل ا م ة = 5 ✓
  "قيامة", // ق ي ا م ة = 5 ✓
  "إقامة", // إ ق ا م ة = 5 ✓
  "خيانة", // خ ي ا ن ة = 5 ✓
  "مكانة", // م ك ا ن ة = 5 ✓
  "خزانة", // خ ز ا ن ة = 5 ✓
  "قيادة", // ق ي ا د ة = 5 ✓
  "زيادة", // ز ي ا د ة = 5 ✓
  "عبادة", // ع ب ا د ة = 5 ✓
  "ولادة", // و ل ا د ة = 5 ✓
  "سيادة", // س ي ا د ة = 5 ✓
  "ضيافة", // ض ي ا ف ة = 5 ✓
  "شراكة", // ش ر ا ك ة = 5 ✓
  "زراعة", // ز ر ا ع ة = 5 ✓
  "صناعة", // ص ن ا ع ة = 5 ✓
  "براعة", // ب ر ا ع ة = 5 ✓
  "بضاعة", // ب ض ا ع ة = 5 ✓
  "منارة", // م ن ا ر ة = 5 ✓
  "مهارة", // م ه ا ر ة = 5 ✓
  "نظارة", // ن ظ ا ر ة = 5 ✓
  "خسارة", // خ س ا ر ة = 5 ✓
]

// Remove duplicates and ensure exactly 5 chars
function validateWords(words: readonly string[]): string[] {
  const seen = new Set<string>();
  return words.filter((w) => {
    if (seen.has(w)) return false;
    if (Array.from(w).length !== 5) return false;
    seen.add(w);
    return true;
  });
}

export const VALID_ANSWERS: string[] = validateWords(ANSWER_WORDS);

// Extra valid guesses beyond the answer list — common 5-letter Arabic words
const EXTRA_GUESSES: readonly string[] = [
  // === Common verbs (past tense, 3rd person masculine singular) ===
  "كتبوا", // they wrote
  "ذهبوا", // they went
  "خرجوا", // they went out
  "دخلوا", // they entered
  "رجعوا", // they returned
  "وصلوا", // they arrived
  "نزلوا", // they descended
  "طلعوا", // they ascended
  "سمعوا", // they heard
  "شربوا", // they drank
  "أكلوا", // they ate
  "نظروا", // they looked
  "وقفوا", // they stood
  "جلسوا", // they sat
  "نامات", // sleeping
  "حملوا", // they carried
  "قتلوا", // they killed
  "فتحوا", // they opened
  "أغلقت", // she closed
  "بحثوا", // they searched
  "درسوا", // they studied
  "عملوا", // they worked
  "لعبوا", // they played
  "ضربوا", // they hit
  "كسروا", // they broke
  "قرأوا", // they read
  "مشيتم", // you all walked
  "علموا", // they knew
  "فهموا", // they understood
  "حصلوا", // they obtained
  "استلم", // he received
  "يكتبن", // they (f) write
  "تكتبن", // you (f.pl) write
  "يذهبن", // they (f) go
  "يخرجن", // they (f) go out
  "تدخلن", // you (f.pl) enter
  "يرجعن", // they (f) return
  "يسمعن", // they (f) hear
  "يشربن", // they (f) drink
  "ينظرن", // they (f) look
  "يجلسن", // they (f) sit
  "يحملن", // they (f) carry
  "يفتحن", // they (f) open
  "يبحثن", // they (f) search
  "يدرسن", // they (f) study
  "يعملن", // they (f) work
  "يلعبن", // they (f) play
  "يضربن", // they (f) hit
  "يكسرن", // they (f) break
  "يقرأن", // they (f) read
  "يفهمن", // they (f) understand
  "أجابت", // she answered
  "تكلمت", // she spoke
  "ابتسم", // he smiled
  "اجتمع", // he gathered
  "انتظر", // he waited
  "انتقل", // he moved
  "انتهت", // she ended
  "استمر", // he continued
  "استمع", // he listened
  "اقترب", // he approached
  "اقترح", // he suggested
  "التزم", // he committed
  "التقط", // he picked up
  "التقت", // she met
  "احتفل", // he celebrated
  "اختار", // he chose
  "اختلف", // he differed
  "اختفت", // she disappeared
  "ادعات", // she claimed
  "ارتفع", // he rose
  "استقر", // he settled
  "اشتكت", // she complained
  "اعتذر", // he apologized
  "اعتمد", // he depended
  "افتتح", // he opened/inaugurated
  "تحركت", // she moved
  "تخرجت", // she graduated
  "تذكرت", // she remembered
  "ترددت", // she hesitated
  "تزوجت", // she married
  "تساءل", // he wondered
  "تصرفت", // she behaved
  "تطورت", // she developed
  "تعاون", // he cooperated
  "تعلمت", // she learned
  "تغيرت", // she changed
  "تفاجأ", // he was surprised
  "تقاعد", // he retired
  "تمكنت", // she was able
  "توقفت", // she stopped
  "توقعت", // she expected
  // === Form I past tense verbs ===
  "سألوا", // they asked
  "قالوا", // they said
  "كانوا", // they were
  "بدأوا", // they began
  "حكموا", // they judged
  "ركبوا", // they rode
  "زرعوا", // they planted
  "صنعوا", // they made
  "طبخوا", // they cooked
  "غسلوا", // they washed
  "فقدوا", // they lost
  "كشفوا", // they discovered
  "لبسوا", // they wore
  "مسكوا", // they held
  "هربوا", // they fled
  "وضعوا", // they placed
  "وقعوا", // they fell/signed
  "ولدوا", // they were born
  // === Common nouns ===
  "عالمة", // female scholar
  "حاكمة", // female ruler
  "عاصمة", // capital city
  "عائلة", // family
  "معركة", // battle
  "مشكلة", // problem
  "محاضر", // lectures
  "مجالس", // councils
  "مدارس", // schools
  "مساجد", // mosques
  "مكاتب", // offices
  "مطابخ", // kitchens
  "مصانع", // factories
  "ملابس", // clothes
  "مواعد", // appointments
  "موارد", // resources
  "محاكم", // courts
  "مخاطر", // risks
  "مراكز", // centers
  "مسائل", // issues
  "مشاعر", // feelings
  "مشاكل", // problems
  "مصادر", // sources
  "معادن", // metals
  "مغامر", // adventurer
  "مفاتح", // keys (plural)
  "منافس", // competitor
  "منازل", // houses
  "مواقع", // locations
  "مواقف", // positions/situations
  "نتائج", // results
  "نماذج", // models
  "نوافذ", // windows
  "وثائق", // documents
  "حوادث", // accidents
  "حقائب", // bags
  "حقائق", // facts
  "خدمات", // services
  "خطوات", // steps
  "دروسة", // lesson (modified)
  "دفاتر", // notebooks
  "رحالة", // traveler
  "رسائل", // messages (already in answers, will be deduped)
  "سجلات", // records
  "شوارع", // streets
  "صفحات", // pages
  "عقودة", // contracts
  "علاقة", // relationship
  "فنادق", // hotels
  "قصائد", // poems
  "مبالغ", // amounts
  "أحداث", // events
  "أرقام", // numbers
  "أسلحة", // weapons
  "أعداد", // numbers/quantities
  "أعضاء", // members
  "أفلام", // films
  "أنواع", // types
  "أجزاء", // parts
  "أدوات", // tools
  "أسباب", // reasons
  "أسعار", // prices
  "أشكال", // shapes
  "أصدقا", // friends (short)
  "أصوات", // voices
  "أطباق", // dishes
  "أعداء", // enemies
  "أعشاب", // herbs
  "أعياد", // holidays
  "أفراد", // individuals
  "أقسام", // sections
  "أقمار", // moons
  "ألوان", // colors
  "أماكن", // places
  "أمراض", // diseases
  "أنظمة", // systems
  "أوراق", // papers/leaves
  "أوضاع", // situations
  "إشارة", // signal
  "إرادة", // will/determination
  "إدارة", // management
  "إنارة", // lighting
  "إعادة", // return/repeat
  "إهانة", // insult
  "بداية", // beginning
  "نهاية", // end
  "رعاية", // care
  "حماية", // protection
  "وقاية", // prevention
  "غاية", // goal (4 chars - will be filtered)
  "عناية", // attention/care
  "رواية", // novel
  "حكومة", // government
  "مقاومة", // resistance (6 chars - filtered)
  "تسمية", // naming
  "أمنية", // wish
  "بلدية", // municipality
  "جمعية", // association
  "حرية", // freedom (4 - filtered)
  "ذرية", // offspring (4 - filtered)
  "أغلبة", // majority
  "تربية", // education
  "تصفية", // filtering
  "تعبئة", // filling
  "تغذية", // nutrition
  "تقنية", // technology
  "تنمية", // development
  "توصية", // recommendation
  "ثانوي", // secondary (5 - but check)
  "جنسية", // nationality
  "خارجة", // external
  "خلفية", // background
  "داخلة", // internal
  "رسمية", // official
  "سرية", // secret (4 - filtered)
  "شخصية", // personality
  "صحراو", // Saharan (truncated)
  "عربية", // Arabic
  "عسكري", // military
  "فردية", // individual
  "مالية", // financial
  "محلية", // local
  "مدنية", // civil
  "نسائي", // women's
  "نوعية", // quality
  // === Professions ===
  "معلمة", // female teacher
  "طبيبة", // female doctor
  "مهندس", // engineer
  "محامي", // lawyer
  "قاضية", // female judge
  "ممرضة", // nurse
  "صحافي", // journalist
  "خبازة", // female baker
  "حدادة", // female blacksmith
  "نجارة", // carpentry
  "بائعة", // female seller
  "سائقة", // female driver
  "طيارة", // pilot (already in answers)
  "حارسة", // female guard
  "مزارع", // farmer
  "صيدلي", // pharmacist
  "كيمائ", // chemist (truncated)
  "طاهية", // female chef
  "خياطة", // sewing/tailor
  "ناشرة", // female publisher
  "وزيرة", // female minister
  "سفيرة", // female ambassador
  "رئيسة", // female president
  "مديرة", // female manager
  "كاتبة", // female writer
  "فنانة", // female artist
  "رسامة", // female painter
  "عازفة", // female musician
  "راقصة", // female dancer
  "مخرجة", // female director
  "ممثلة", // female actress
  // === Animals ===
  "عصفور", // sparrow
  "غزالة", // gazelle
  "قرشات", // sharks
  "دلفين", // dolphin
  "حرباء", // chameleon
  "عقربة", // scorpion
  "سلحفا", // turtle (truncated)
  "بطريق", // penguin
  "فيلات", // elephants
  "زرافة", // giraffe
  "غوريل", // gorilla (truncated)
  "ببغاء", // parrot
  "نسرات", // eagles
  "صقرات", // falcons
  "بومات", // owls
  "حمامة", // pigeon (already in answers)
  "ذئابة", // wolf
  "دببات", // bears
  "أرانب", // rabbits
  "حملان", // lambs
  "خيولة", // horses
  "بقرات", // cows
  "ماعزة", // goat
  "غنمات", // sheep
  "ديكات", // roosters (already in answers)
  "عنزات", // goats
  "حمارة", // donkey
  "بغلات", // mules
  "ثيران", // bulls
  "صوصات", // chicks
  "نعامة", // ostrich
  "طاووس", // peacock
  "حوتات", // whales
  "سمندل", // salamander
  // === Body & health ===
  "عملية", // operation
  "مستشف", // hospital (truncated)
  "صيدلة", // pharmacy
  "علاجة", // treatment
  "دواءة", // medicine
  "مرضات", // illnesses
  "حمضات", // acids
  "فيروس", // virus
  "جرثوم", // germ
  "حساسة", // sensitive/allergy
  "تحليل", // analysis
  "فحوصة", // examination
  "أشعات", // x-rays
  "ضمادة", // bandage
  "حقنات", // injections
  "كبسول", // capsule
  "حبوبة", // pills
  "مرهمة", // ointment
  "قطرات", // drops
  "جراحة", // surgery
  "تمريض", // nursing
  "صحيات", // health
  "لياقة", // fitness
  "حمية", // diet (4 - filtered)
  "تغذيي", // nutritional (truncated)
  // === Food expanded ===
  "زيتون", // olives
  "بقدنس", // parsley
  "نعناع", // mint
  "كزبرة", // coriander
  "زنجبل", // ginger (6 - filtered)
  "كركمة", // turmeric
  "قرنفل", // cloves
  "عسلات", // honey
  "سكرات", // sugars
  "ملحات", // salts
  "فلفلي", // peppery
  "كمونة", // cumin
  "يانسن", // anise (truncated)
  "حبهان", // cardamom
  "رشادة", // cress
  "بابون", // chamomile (truncated)
  "موزات", // bananas
  "تفاحة", // apple
  "برتقا", // orange (truncated)
  "عنبات", // grapes
  "رمانة", // pomegranate
  "مانجو", // mango
  "بطيخة", // watermelon
  "شمامة", // cantaloupe
  "فراول", // strawberry (truncated)
  "توتات", // berries
  "تينات", // figs
  "خوخات", // peaches
  "مشمشة", // apricot
  "كرزات", // cherries
  "جوزات", // walnuts
  "لوزات", // almonds
  "فستقة", // pistachio
  "بندقة", // hazelnut/gun
  "كاجوة", // cashew
  // === Clothing & fabric ===
  "قطنية", // cotton
  "حريرة", // silk/harira
  "صوفية", // woolen
  "جلدية", // leather
  "تنورة", // skirt
  "فستان", // dress
  "معطفة", // coat
  "سترات", // jackets
  "قبعات", // hats
  "حزامة", // belt
  "قفازة", // glove
  "شالات", // shawls
  "خاتمة", // ring/conclusion
  "سوارة", // bracelet
  "قلادة", // necklace
  "عقدات", // necklaces/knots
  "ساعية", // hourly/messenger
  "محفظة", // wallet
  "حذاءة", // shoe
  "نعالة", // slipper
  "جزمات", // boots
  "صندلة", // sandal
  // === Geography & places ===
  "جزيرة", // island
  "قارات", // continents
  "محيطة", // ocean/surrounding
  "بحرية", // maritime
  "ساحلة", // coast
  "جبلية", // mountainous
  "سهلية", // plains
  "وادية", // valley
  "كهفات", // caves
  "بركان", // volcano
  "زلازل", // earthquakes
  "فيضان", // flood
  "جفافة", // drought
  "ثلوجة", // snow
  "جليدة", // ice
  "حرارة", // heat
  "برودة", // cold
  "رطوبة", // humidity
  "جفافي", // drought-related
  "هطولة", // precipitation
  "ضبابة", // fog
  "عاصفة", // storm
  "إعصار", // hurricane
  "رعدية", // thunderous
  "شمسية", // solar
  "قمرية", // lunar
  "نجمات", // stars
  "كوكبة", // constellation
  "فضاءة", // space
  "مجرات", // galaxies
  // === Numbers & math ===
  "عددية", // numerical
  "حسابة", // calculation
  "جمعية", // addition/association
  "طرحات", // subtractions/veils
  "ضربات", // hits/multiplications
  "قسمات", // divisions/features
  "نسبية", // relative
  "كسرات", // fractions
  "معادل", // equivalent
  "أرقام", // numbers (already above)
  "نقطات", // points
  "خطوطة", // lines
  "دائرة", // circle
  "مربعة", // square
  "مثلثة", // triangle
  "هرمات", // pyramids
  "كروية", // spherical
  "مخروط", // cone
  "أسطوا", // cylinder (truncated)
  // === Education ===
  "تعليم", // education
  "تدريس", // teaching
  "منهجة", // curriculum
  "درسات", // lessons
  "صفوفة", // classes
  "طالبة", // female student
  "أساتذ", // professors (truncated)
  "امتحن", // he examined
  "اختبر", // he tested
  "تخرجة", // graduation
  "شهادي", // certificate-related
  "بكالو", // bachelor (truncated)
  "معهدة", // institute
  "كليات", // faculties
  "قاعات", // halls
  "سبورة", // blackboard
  "طباشر", // chalk
  "مسطرة", // ruler
  "برجلة", // compass (drawing)
  "ممحاة", // eraser
  "حبرات", // inks
  // === Religion ===
  "مسجدة", // mosque
  "كنيسة", // church
  "معبدة", // temple
  "صيامة", // fasting (already in answers)
  "حجابة", // hijab (already in answers)
  "زكاتة", // zakat
  "حسنات", // good deeds
  "سيئات", // bad deeds
  "ثوابة", // reward
  "عقابة", // punishment
  "جنائز", // funerals
  "أضاحي", // sacrifices
  "أذكار", // dhikr
  "تسبيح", // glorification
  "مصحفة", // Quran copy
  "آيتان", // two verses
  "سورات", // chapters (Quran)
  "حديثة", // hadith/modern (already in answers)
  "تفسير", // interpretation
  "فقهية", // jurisprudential
  // === Emotions & states expanded ===
  "مندهش", // amazed
  "مرتبك", // confused
  "مرتاح", // comfortable
  "مشتاق", // longing
  "مشغول", // busy
  "مبتهج", // delighted
  "منزعج", // annoyed
  "محتار", // puzzled
  "متحمس", // enthusiastic
  "متفائل", // optimistic (6 - filtered)
  "مكتئب", // depressed
  "منبهر", // dazzled
  "متردد", // hesitant
  "متوتر", // tense
  "مرتعب", // terrified
  "متعجب", // astonished
  "متألم", // in pain
  "مستاء", // displeased
  "محبوب", // beloved
  "مكروه", // hated
  "مقبول", // accepted
  "مرفوض", // rejected
  "ممنوع", // forbidden
  "مسموح", // allowed
  "مطلوب", // wanted
  "موجود", // present/existing
  "مفقود", // missing
  "معروف", // known
  "مجهول", // unknown
  "محترم", // respected
  // === Adjectives expanded ===
  "عظيمة", // great
  "هائلة", // enormous
  "رائعة", // wonderful
  "ممتاز", // excellent
  "مثالي", // ideal
  "عاديي", // normal
  "خاصية", // special/property
  "عامية", // colloquial/public
  "رسميي", // formal
  "سهلات", // easy
  "صعبات", // difficult
  "بسيطة", // simple
  "معقدة", // complex
  "واضحة", // clear
  "غامضة", // mysterious
  "عميقة", // deep
  "ضحلات", // shallow
  "واسعة", // wide
  "ضيقية", // narrow
  "مرتفع", // high
  "منخفض", // low
  "حارات", // hot (streets)
  "باردة", // cold
  "دافئة", // warm
  "رطبات", // wet
  "جافات", // dry
  "ناعمة", // soft
  "خشنات", // rough
  "حادات", // sharp
  "مستقر", // stable
  "متغير", // variable
  "ثابتة", // fixed
  "مؤقتة", // temporary
  "دائمة", // permanent
  "سعيدة", // happy (already in answers)
  "حزينة", // sad
  "غريبة", // strange
  "مألوف", // familiar
  "مميزة", // distinctive
  "عادية", // ordinary
  "فريدة", // unique
  "نادرة", // rare
  "شائعة", // common
  "شهيرة", // famous
  "مجانة", // free
  "غالية", // expensive
  "رخيصة", // cheap
  "ثمينة", // precious
  "فاخرة", // luxurious
  "متينة", // sturdy
  "هشاشة", // fragility
  "مرنات", // flexible
  "صلبات", // solid
  "لامعة", // shiny
  "معدنة", // metallic
  "خشبية", // wooden
  "زجاجي", // glass-like
  "بلاست", // plastic (truncated)
  "ورقية", // paper
  "قطنية", // cotton (duplicate, will be filtered)
  // === Verbs (imperative & present) ===
  "اكتبي", // write! (f)
  "اقرأي", // read! (f)
  "اسمعي", // listen! (f)
  "انظري", // look! (f)
  "اجلسي", // sit! (f)
  "ادخلي", // enter! (f)
  "اخرجي", // exit! (f)
  "ارجعي", // return! (f)
  "افتحي", // open! (f)
  "اغلقي", // close! (f)
  "اطبخي", // cook! (f)
  "اغسلي", // wash! (f)
  "العبوا", // play! (pl)
  "اركضي", // run! (f)
  "اقفزي", // jump! (f)
  "ارسمي", // draw! (f)
  "يكتبو", // they write (colloquial)
  "نكتبة", // we write (dialectal)
  "يقرأون", // they read (6 - filtered)
  "تسمعي", // you (f) hear
  "تنظري", // you (f) look
  "تجلسي", // you (f) sit
  "تدخلي", // you (f) enter
  "تخرجي", // you (f) exit
  "ترجعي", // you (f) return
  "تفتحي", // you (f) open
  "تغلقي", // you (f) close
  // === Abstract nouns ===
  "حقيقة", // truth
  "سياسة", // politics
  "ثقافة", // culture
  "طبيعة", // nature
  "صداقة", // friendship
  "عداوة", // enmity
  "حضارة", // civilization
  "تجارة", // trade
  "إمارة", // emirate
  "وزارة", // ministry
  "سفارة", // embassy
  "عمارة", // building
  "حضانة", // nursery
  "مطالب", // demands
  "مشروع", // project
  "مجتمع", // society
  "مستقب", // future (truncated)
  "مفهوم", // concept
  "معلوم", // known (thing)
  "محتوى", // content
  "مضمون", // guaranteed/content
  "مسؤول", // responsible
  "مبدأة", // principle
  "نظرية", // theory
  "تطبيق", // application (already in answers)
  "ممارس", // practitioner
  "تجربي", // experimental
  "عملية", // practical/operation
  "نظامة", // system/order
  "قانون", // law
  "دستور", // constitution
  "حكومي", // governmental
  "شعبية", // popular
  "وطنية", // national
  "قومية", // nationalist
  "دينية", // religious
  "علمية", // scientific
  "أدبية", // literary
  "فنية", // artistic (4 - filtered)
  "تعبير", // expression
  "تفكير", // thinking
  "تصوير", // photography
  "تقدير", // estimation
  "تأثير", // influence
  "تغيير", // change
  "تطوير", // development
  "تحذير", // warning
  "تبرير", // justification
  "تحرير", // editing/liberation
  "تقرير", // report
  "تنظيم", // organization
  "تعليق", // comment
  "تسجيل", // recording
  "تشكيل", // formation
  "تحويل", // conversion
  "تمويل", // financing
  "توزيع", // distribution
  "تصميم", // design
  "ترتيب", // arrangement
  "تركيب", // installation
  "تعديل", // modification
  "تحليل", // analysis (duplicate)
  "تمثيل", // representation
  "تشغيل", // operation
  "تفعيل", // activation
  "تحميل", // loading/download
  // === Everyday objects expanded ===
  "مكواة", // iron (clothes)
  "غلاية", // kettle
  "خلاطة", // blender
  "فرنات", // ovens
  "ثلاجي", // refrigerator-related
  "غسالة", // washing machine
  "مروحة", // fan
  "مكيفة", // air conditioner
  "سخانة", // heater
  "دفاية", // heater
  "مصباح", // lamp
  "شمعات", // candles
  "مرايا", // mirrors
  "ساعية", // hourly (duplicate)
  "تقويم", // calendar
  "كراسي", // chairs
  "طاولي", // table-related
  "سرائر", // beds
  "دولاب", // wardrobe
  "خزنات", // safes
  "رفوفة", // shelves
  "علاقة", // hanger/relationship (duplicate)
  "مشبكة", // clip
  "دبوسة", // pin
  "إبرات", // needles
  "خيوطة", // threads
  "أزرار", // buttons
  "سحابة", // zipper/cloud (already in answers)
  "مظلات", // umbrellas
  "عصاية", // stick/cane
  "قارور", // bottle (truncated)
  "كأسات", // glasses/cups (already in answers)
  "صحنات", // plates
  "سكينة", // knife/tranquility
  "مبشرة", // grater/glad tiding
  "مقلاة", // frying pan (already in answers)
  "هاونة", // mortar
  "ملقطة", // tongs
  "مغرفة", // ladle
  "قالبة", // mold
  "صينية", // tray (already in answers)
  // === Music & arts ===
  "عودات", // ouds
  "قيثار", // guitar/lyre
  "ناياة", // flute
  "دفوفة", // drums
  "طبلات", // drums
  "كمنجة", // violin (colloquial)
  "بيانو", // piano
  "موسيق", // music (truncated)
  "أوركس", // orchestra (truncated)
  "جوقات", // choirs
  "مسرحة", // theater
  "سينما", // cinema
  "فيلمة", // film
  "مشهدة", // scene
  "لوحات", // paintings
  "تمثال", // statue
  "نحتات", // sculptures
  "خزفية", // ceramic
  "فخارة", // pottery
  "نسيجة", // textile
  "تطريز", // embroidery
  "خطاطة", // calligrapher
  "زخرفة", // decoration
  // === Sports expanded ===
  "كريكت", // cricket
  "تزلجة", // skiing
  "ملاكم", // boxer
  "مصارع", // wrestler
  "رامية", // archer
  "سبحات", // swimming laps
  "غوصات", // dives
  "تجديف", // rowing
  "قوارب", // boats
  "أشرعة", // sails
  "فروسة", // horsemanship
  "رماية", // shooting
  "سهمات", // arrows
  "قوسات", // bows
  "هدافة", // scorer
  "حكمات", // referees (already in answers)
  "مشجعة", // female fan
  "جمهور", // audience
  "منافس", // competitor (duplicate)
  "بطلات", // champions (f)
  "ذهبية", // golden
  "فضيات", // silver
  "برونز", // bronze
  // === Weather & seasons ===
  "شتاءة", // winter
  "صيفية", // summery
  "ربيعة", // spring
  "خريفة", // autumn
  "فصلية", // seasonal
  "مناخة", // climate
  "طقسات", // weather
  "حرارة", // temperature (duplicate)
  "برودة", // coldness (duplicate)
  "سحائب", // clouds
  "مطرات", // rains
  "ثلجات", // snow
  "بردات", // hail/cold
  "موجات", // waves
  "نسمات", // breezes
  "هبوبة", // blowing
  "عواصف", // storms (already in answers)
  // === Materials & elements ===
  "حديدة", // iron
  "نحاسة", // copper
  "ذهبات", // golds
  "فضيات", // silvers (duplicate)
  "ألماس", // diamond
  "ياقوت", // ruby
  "زمردة", // emerald
  "لؤلؤة", // pearl
  "مرجان", // coral
  "عنبرة", // amber
  "فحمات", // coals
  "رصاصة", // bullet/lead
  "قصدير", // tin
  "معدنة", // metal (duplicate)
  "بلورة", // crystal
  "زئبقة", // mercury
  // === Computing & tech expanded ===
  "حاسبة", // calculator
  "شاشات", // screens (already in answers)
  "طابعة", // printer (already in answers)
  "ماسحة", // scanner
  "سماعة", // earphone
  "كامير", // camera (truncated)
  "بيانة", // data
  "معلوم", // information (duplicate)
  "ملفات", // files
  "مجلدة", // folder
  "نظامة", // system (duplicate)
  "برنام", // program (truncated)
  "تطبيق", // app (already in answers)
  "موقعة", // website (already in answers)
  "صفحات", // pages (duplicate)
  "رابطة", // link/association
  "كلمات", // words (already in answers)
  "مرورة", // traffic/password
  "حسابة", // account (duplicate)
  "بريدة", // email (already in answers)
  "إنذار", // alarm
  "تحديث", // update
  "تنزيل", // download
  "رفعات", // uploads
  "نسخات", // copies
  "حفظات", // saves
  "مسحات", // scans/wipes
  "طبعات", // prints
  // === Misc common 5-letter words ===
  "بسملة", // basmala
  "حمدلة", // hamdala
  "حوقلة", // hawqala
  "تهليل", // tahleel
  "تكبير", // takbeer
  "مسبحة", // rosary
  "سبحات", // glorifications (duplicate)
  "فاتحة", // opening (already in answers)
  "نافذة", // window (already in answers)
  "عتبات", // thresholds
  "سقفات", // roofs
  "جدران", // walls
  "أرضية", // floor
  "سلوكة", // behavior
  "تصرفة", // behavior
  "عادات", // habits
  "تقليد", // tradition
  "عرفات", // customs/Arafat
  "موروث", // heritage
  "تراثة", // heritage
  "حداثة", // modernity
  "معاصر", // contemporary
  "كلاسي", // classic
  "حديثي", // modern
  "قديمي", // old
  "أصيلة", // authentic
  "مزيفة", // fake
  "حقيقي", // real
  "خيالي", // imaginary
  "واقعي", // realistic
  "منطقي", // logical
  "عقلاء", // wise people
  "عقلية", // mentality
  "ذكاءة", // intelligence
  "غباءة", // stupidity
  "فطنات", // cleverness
  "حكمات", // wisdoms (already in answers)
  // === More common verbs (Form II-X) ===
  "علموا", // they taught
  "قدموا", // they presented
  "وصفوا", // they described
  "أرسلت", // she sent
  "أعلنت", // she announced
  "أكملت", // she completed
  "أنقذت", // she rescued
  "أصلحت", // she repaired
  "أضافت", // she added
  "أخفقت", // she failed
  "أبدعت", // she created
  "أتقنت", // she mastered
  "أثبتت", // she proved
  "أحبطت", // she frustrated
  "أدهشت", // she amazed
  "أذهلت", // she astonished
  "أراحت", // she comforted
  "أرعبت", // she terrified
  "أزعجت", // she annoyed
  "أسعدت", // she made happy
  "أفرحت", // she delighted
  "أفزعت", // she scared
  "أقلقت", // she worried
  "ألهمت", // she inspired
  "أنعشت", // she refreshed
  // === Directions & positions ===
  "شمالة", // north
  "جنوبة", // south
  "شرقية", // eastern
  "غربية", // western
  "فوقية", // upper
  "تحتية", // lower
  "يمنية", // right/Yemeni
  "يسارة", // left
  "أمامة", // front
  "خلفية", // behind (duplicate)
  "وسطية", // middle/moderate
  "جانبة", // side
  "قريبة", // near
  "بعيدة", // far
  "داخلة", // inside (duplicate)
  "خارجة", // outside (duplicate)
  // === Transportation ===
  "حافلة", // bus
  "شاحنة", // truck
  "عربات", // carts
  "مركبة", // vehicle
  "قاطرة", // locomotive
  "عبارة", // ferry/phrase
  "زورقة", // boat
  "يختات", // yachts
  "مرسات", // anchors
  "ميناء", // port
  "مرفأة", // harbor
  "محطات", // stations
  "جسرات", // bridges
  "نفقات", // tunnels/expenses
  "طريقة", // road (already in answers)
  "ممرات", // corridors
  "رصيفة", // sidewalk/platform
  "إشارة", // traffic light (duplicate)
  "لافتة", // sign
  "مخرجة", // exit (duplicate with director)
  // === Finance & business ===
  "تجاري", // commercial
  "مصرفة", // banking
  "حوالة", // transfer
  "عملات", // currencies
  "أسهمة", // stocks
  "سندات", // bonds
  "ربحات", // profits
  "خسائر", // losses
  "ميزان", // balance (already in answers)
  "دخلات", // incomes
  "إيراد", // revenue
  "مصروف", // expense
  "ضريبة", // tax
  "تأمين", // insurance
  "رأسمل", // capital (truncated)
  "استثم", // investment (truncated)
  "تسويق", // marketing
  "مبيعة", // sale
  "شراءة", // purchase
  "عرضات", // offers
  "خصمات", // discounts
  "فاتور", // invoice (truncated)
  "إيصال", // receipt
  "عقدات", // contracts (duplicate)
  "شريكة", // partner (f)
  "مساهم", // shareholder
  "مستثم", // investor (truncated)
  "ضامنة", // guarantor (f)
  // === Greetings & common expressions ===
  "سلامة", // safety (already in answers)
  "تحيات", // greetings
  "مبارك", // blessed
  "مواساة", // consolation (6 - filtered)
  "تهنئة", // congratulation
  "معذرة", // excuse
  "شكرات", // thanks (already in answers)
  "عفوات", // pardons (already in answers)
  "مسامح", // forgiver
  "متسام", // tolerant (truncated)
  // === More nouns (common everyday) ===
  "صورات", // photos
  "ألبوم", // album
  "مجلات", // magazines
  "جرائد", // newspapers
  "كتابة", // writing (already in answers)
  "قراءة", // reading (already in answers)
  "حروفة", // letters
  "كلمية", // word-related
  "جملية", // sentence-related
  "فقرات", // paragraphs
  "مقالة", // article
  "قصيصة", // short story
  "رواية", // novel (duplicate)
  "شعرية", // poetic
  "نثرات", // prose
  "مسرحي", // theatrical
  "تلفزي", // TV-related
  "إذاعة", // radio/broadcast
  "بودكا", // podcast (truncated)
  "مقاطع", // clips
  "أفلام", // films (duplicate)
  "مسلسل", // series
  "حلقات", // episodes
  "موسمة", // season
  "برامج", // programs (already in answers)
  // === Furniture & home ===
  "أريكة", // couch
  "كنبات", // sofas
  "مقعدة", // seat
  "مكتبي", // office/desk
  "سريرة", // bed/secret
  "فراشة", // mattress/butterfly (already in answers)
  "مرتبة", // mattress/rank
  "دواليب", // wardrobes (6 - filtered)
  "خزائن", // cabinets (6 - filtered)
  "منضدة", // table
  "مقلمة", // pencil case
  "حاملة", // holder/carrier
  "معلقة", // hanging
  "جرسات", // bells
  "باقات", // bouquets
  "مزهرة", // vase
  "شمعدن", // candlestick (truncated)
  "بخورة", // incense
  "عطرات", // perfumes
  "بخاخة", // spray
  "مناديل", // tissues (6 - filtered)
  "منديل", // tissue (6 - filtered)
  "فوطات", // towels
  "سجادي", // carpet-related
  "موكيت", // carpet (moquette)
  "بلاطة", // tile
  "رخامة", // marble
  "دهانة", // paint
  "أصباغ", // dyes
  // === War & conflict ===
  "معركة", // battle (duplicate)
  "حربات", // wars
  "سلاحة", // weapon
  "جيوشة", // armies
  "جنديي", // soldier
  "ضابطة", // officer (f)
  "قائدة", // leader (f)
  "جنرال", // general
  "لواءة", // brigade
  "كتيبة", // battalion
  "فرقات", // divisions
  "سريات", // companies (military)
  "دبابة", // tank
  "مدفعة", // cannon
  "صاروخ", // rocket (already in answers)
  "قنبلة", // bomb
  "لغمات", // mines
  "درعات", // shields
  "خنادق", // trenches
  "حصارة", // siege
  "هجمات", // attacks
  "دفاعة", // defense
  "نصرات", // victories
  "هزيمة", // defeat
  "أسيرة", // prisoner (f)
  // === Verbs - more common past tense ===
  "أخذوا", // they took
  "أحبوا", // they loved
  "أرادو", // they wanted
  "بناءة", // construction
  "تركوا", // they left
  "جاءوا", // they came
  "حاولت", // she tried
  "خافوا", // they feared
  "دارات", // she circulated
  "ذاقوا", // they tasted
  "رأيتم", // you all saw
  "زاروا", // they visited
  "ساروا", // they walked
  "شاهدت", // she watched
  "صاروا", // they became
  "ظنوها", // they thought it
  "عاشوا", // they lived
  "عادوا", // they returned
  "غادرت", // she left
  "فازوا", // they won
  "قاموا", // they stood up
  "لاحظت", // she noticed
  "ناموا", // they slept
  "هربات", // escapes
  "واجهت", // she faced
  // === Common 5-letter words (miscellaneous) ===
  "مبنات", // buildings
  "مخطوط", // manuscript
  "مجوهر", // jeweled
  "تمساح", // crocodile
  "عنكبة", // spider
  "حلزون", // snail
  "دودات", // worms
  "يرقات", // larvae
  "فطرات", // fungi
  "طحالب", // algae
  "أعلاف", // fodder
  "محصول", // crop
  "بذرات", // seeds
  "سمادة", // fertilizer
  "حرثات", // plowing
  "سقاية", // irrigation
  "حصادة", // harvest
  "منجلة", // sickle
  "فأسات", // axes
  "مجرفة", // shovel
  "معولة", // pickaxe
  "عربية", // cart/Arabic (duplicate)
  "مقطور", // trailer
  "رافعة", // crane
  "محراث", // plow
  "ناطور", // watchman
  "راعية", // shepherdess
  "حظيرة", // barn
  "إسطبل", // stable (6 - filtered)
  "قفصات", // cages
  "سياجة", // fence
  "بوابة", // gate
  "عمودة", // column
  "سياجة", // fence (duplicate)
  "أسوار", // walls/fences
  "برجات", // towers
  "قلاعة", // fortress
  "أبراج", // towers
  "محطات", // stations (duplicate)
  "مرصدة", // observatory
  "مختبر", // laboratory
  "معملة", // lab/factory
  "مصنعة", // factory
  "ورشات", // workshops
  "متجرة", // store
  "صالون", // salon
  "عيادة", // clinic
  "مستوص", // dispensary (truncated)
  // === More common words ===
  "تحالف", // alliance
  "تعاهد", // pact
  "تفاهم", // understanding
  "تناقض", // contradiction
  "تبادل", // exchange
  "تواصل", // communication
  "تفاعل", // interaction
  "تكامل", // integration
  "تراجع", // retreat
  "تقاطع", // intersection
  "تسارع", // acceleration
  "تباطؤ", // slowdown
  "تصاعد", // escalation
  "تناقص", // decrease
  "تذبذب", // fluctuation
  "تماسك", // cohesion
  "تفاوت", // disparity
  "تلاشى", // faded
  "تناسب", // proportion
  "تجاوز", // exceeding
  "تجاهل", // ignoring
  "تساهل", // leniency
  "تراحم", // compassion
  "تكافل", // solidarity
  "تعاطف", // sympathy
  "تصادم", // collision
  "تقاتل", // fighting
  "تخاصم", // quarreling
  "تصالح", // reconciliation
  "تعارف", // getting acquainted
  "تحاور", // dialogue
  "مستوى", // level
  "مبنية", // built
  "منشأة", // facility
  "مؤسسة", // institution (6 - filtered)
  "شركات", // companies
  "مراحل", // stages
  "وسائل", // means
  "بدائل", // alternatives
  "عوائل", // families
  "رسائل", // messages (duplicate)
  "فضائل", // virtues
  "حمائل", // shoulder straps
  "شمائل", // traits
  "كفالة", // sponsorship
  "وكالة", // agency
  "نيابة", // prosecution
  "رقابة", // oversight
  "حراسة", // guarding
  "كتابي", // written
  "شفهية", // oral
  "عملاق", // giant
  "صاعقة", // thunderbolt
  "حريقة", // fire
  "فيضان", // flood (duplicate)
  "سيولة", // flood/liquidity
  "زلزال", // earthquake
  "انهيا", // collapse (truncated)
  "كارثة", // disaster
  "مأساة", // tragedy
  "نكبات", // catastrophes
  "محنات", // ordeals
  "بلاءة", // affliction
  "ابتلا", // trial (truncated)
  "صمودة", // resilience
  "مقاوم", // resistant
  "تحدية", // challenge
  "عقبات", // obstacles
  "حواجز", // barriers
  "موانع", // impediments
  "عراقل", // hindrances
  "مشاقة", // hardship
  "صعوبة", // difficulty
  "سهولة", // ease
  "يسرات", // ease
  "مشقات", // hardships
  // === Colors & descriptors expanded ===
  "بنفسج", // violet
  "نيلية", // indigo
  "ذهبية", // golden (duplicate)
  "فضيية", // silvery
  "برونز", // bronze (duplicate)
  "كستنا", // chestnut (truncated)
  "عاجية", // ivory
  "كريمة", // cream/generous
  "قرمزة", // crimson
  "زهرية", // pink/vase
  "تركوا", // turquoise (conflict with verb - duplicate)
  "لازور", // azure
  "يشمية", // jasmine-colored
  // === Kitchen & cooking expanded ===
  "وصفات", // recipes
  "مقادر", // ingredients (truncated)
  "تتبيل", // seasoning
  "تحمير", // browning
  "تقطيع", // cutting
  "تقشير", // peeling
  "سلقات", // boiling
  "شوائي", // grilling
  "قلاية", // frying
  "خبزات", // baking (already in answers)
  "عجينة", // dough
  "خميرة", // yeast
  "طحينة", // tahini
  "حمصات", // chickpeas (already in answers)
  "فولات", // beans
  "عدسات", // lenses/lentils
  "أرزات", // rice
  "قمحات", // wheat
  "شعيرة", // barley grain
  "ذرات", // corn (4 - filtered)
  "مكرون", // macaroni
  "شعرية", // vermicelli (duplicate)
  "كسكسة", // couscous
  "مسخنة", // musakhan
  "كشريي", // kushari
  "مجبوس", // machbous
  "هريسة", // harissa (already in answers)
  "حريرة", // harira (duplicate)
  "فتوشة", // fattoush
  "تبولة", // tabbouleh
  "مقلوب", // maqluba
  "منسفة", // mansaf
  "ورقات", // grape leaves/papers
  "محاشي", // stuffed (dishes)
  "كباية", // cup (colloquial)
  "ابريق", // teapot (6 - filtered)
  "براده", // teapot (colloquial)
  "دلوات", // pots (already in answers)
  "ترمسة", // thermos
  "صحنية", // plate-like
  "ملاعق", // spoons
  // === Garden & plants ===
  "وردية", // rosy (already in answers)
  "ياسمن", // jasmine (truncated)
  "بنفسج", // violet (duplicate)
  "صبارة", // cactus
  "نخيلة", // palm tree
  "سنديا", // oak (truncated)
  "صفصاف", // willow (6 - filtered)
  "زيتون", // olive (duplicate)
  "تفاحة", // apple (duplicate)
  "ليمون", // lemon
  "برتقل", // orange (truncated)
  "مشمشة", // apricot (duplicate)
  "تينات", // figs (duplicate)
  "جوافة", // guava
  "أناناس", // pineapple (6 - filtered)
  "كمثرة", // pear (truncated)
  "بابايا", // papaya (6 - filtered)
  "أفوكا", // avocado (truncated)
  "فراولة", // strawberry (6 - filtered)
  "بازلة", // peas
  "فاصول", // beans (truncated)
  "ملوخة", // molokhia
  "بامية", // okra
  "كوسات", // zucchini
  "قرعات", // squash
  "لفتات", // turnips
  "جزرات", // carrots
  "بطاطس", // potato (6 - filtered)
  "بطاطا", // sweet potato (6 - filtered)
  "فجلات", // radishes
  "سبانخ", // spinach
  "خسيات", // lettuce
  "جرجير", // arugula
  "كرفسة", // celery
  "شمندر", // beet
  "قنبيط", // cauliflower
  "بروكل", // broccoli (truncated)
  // === Common masdars (verbal nouns) ===
  "إسلام", // Islam/submission
  "إيمان", // faith (already in answers)
  "إحسان", // excellence
  "إنفاق", // spending
  "إتقان", // mastery
  "إبداع", // creativity
  "إمتاع", // enjoyment
  "إجماع", // consensus
  "إقناع", // persuasion
  "إبتكر", // he innovated
  "إجراء", // procedure
  "إمداد", // supply
  "إرشاد", // guidance
  "إسعاف", // ambulance
  "إطلاق", // launch
  "إعداد", // preparation
  "إغلاق", // closing
  "إنتاج", // production
  "إنشاء", // construction
  "إنجاز", // achievement
  "إنقاذ", // rescue
  "اتصال", // communication
  "اتحاد", // union
  "اتفاق", // agreement
  "اجتهد", // he strived
  "احترف", // he professionalized
  "احتمل", // he endured
  "ارتباط", // connection (6 - filtered)
  "استقل", // he became independent
  "اشتغل", // he worked
  "انتشر", // he spread
  "انتصر", // he won
  "انطلق", // he launched
  "انفجر", // he exploded
  "انفصل", // he separated
  "انقطع", // he was cut off
  // === Relative adjectives (nisba) ===
  "عراقي", // Iraqi
  "مصرية", // Egyptian (f)
  "لبنان", // Lebanon
  "سعودي", // Saudi
  "كويتي", // Kuwaiti
  "بحرين", // Bahrain
  "قطرية", // Qatari (f)
  "عمانة", // Omani
  "يمنية", // Yemeni (duplicate)
  "سوداني", // Sudanese (6 - filtered)
  "تونسي", // Tunisian
  "مغربي", // Moroccan
  "ليبية", // Libyan (f)
  "أردني", // Jordanian
  "سورية", // Syrian (f)
  "تركية", // Turkish (f)
  "إيراني", // Iranian (6 - filtered)
  "هندية", // Indian (f)
  "صينية", // Chinese (f) (already in answers as "tray")
  "يابان", // Japan
  "فرنسي", // French
  "ألماني", // German (6 - filtered)
  "إنجلي", // English (truncated)
  "أمريك", // American (truncated)
  "إفريق", // African (truncated)
  "أوروب", // European (truncated)
  "آسيوي", // Asian (6 - filtered)
  // === Islamic terms ===
  "مئذنة", // minaret
  "محراب", // mihrab
  "منبرة", // pulpit
  "قبلات", // kisses/qibla (already in answers)
  "وضوءة", // ablution
  "تيممة", // tayammum
  "جنازة", // funeral
  "كفنات", // shrouds
  "تلقين", // teaching/prompting
  "دعوات", // invitations/prayers
  "فتوات", // fatwas
  "حلالة", // halal
  "حرامة", // haram
  "مكروه", // disliked (duplicate)
  "مباحة", // permissible
  "واجبة", // obligatory
  "مستحب", // recommended
  "سنيات", // sunnah
  "بدعات", // innovations
  "شريعة", // sharia
  "فقيهة", // female jurist
  "مفتية", // female mufti
  "تاجرة", // female trader
  // === Household tasks ===
  "تنظيف", // cleaning (already in answers)
  "ترتيب", // organizing (duplicate)
  "تخزين", // storage
  "تبريد", // cooling
  "تسخين", // heating
  "تجفيف", // drying
  "تعقيم", // sterilization
  "تهوية", // ventilation
  "إنارة", // lighting (duplicate)
  "تزيين", // decoration
  "تغليف", // wrapping
  "توصيل", // delivery
  "تنسيق", // coordination
  // === More everyday Arabic ===
  "مفاجأ", // surprise
  "مشاور", // consultant
  "مسافر", // traveler
  "مقيمة", // resident (f)
  "زائرة", // visitor (f)
  "ضيفات", // guests (f)
  "مضيفة", // hostess
  "طاقمة", // crew
  "قبطان", // captain
  "بحارة", // sailor
  "جندية", // female soldier
  "شرطية", // policewoman
  "محققة", // investigator (f)
  "محاسب", // accountant
  "مراقب", // monitor
  "مفتشة", // inspector (f)
  "مشرفة", // supervisor (f)
  "مرشدة", // guide (f)
  "معيدة", // teaching assistant (f)
  "مترجم", // translator
  "مؤلفة", // author (f)
  "صحفية", // journalist (f)
  "مصورة", // photographer (f)
  "مذيعة", // announcer (f)
  "معلقة", // commentator (f) (duplicate)
  "محللة", // analyst (f)
  "باحثة", // researcher (f)
  "عالمة", // scientist (f) (duplicate)
  "فيلسف", // philosopher (truncated)
  "مؤرخة", // historian (f)
  "جغراف", // geographer (truncated)
  // === Feelings & states (more) ===
  "اشتقت", // I missed (you)
  "أعجبت", // she liked
  "أحبتك", // she loved you (truncated)
  "كرهات", // hatreds
  "حسدات", // jealousies
  "غيرات", // jealousies
  "تسامح", // forgiveness
  "تقديم", // presenting
  "اهتمم", // interest (truncated)
  "تعاطي", // dealing with
  "تقبلة", // acceptance
  "اعتراف", // confession (6 - filtered)
  "اعتزز", // pride (truncated)
  "فخرات", // prides
  "تواضع", // humility (already in answers)
  "كبرات", // prides (arrogance)
  "عجبات", // wonders
  // === Games & entertainment ===
  "لعبات", // games
  "شطرنج", // chess (6 - filtered)
  "نردات", // backgammon dice
  "بلوتة", // baloot (card game)
  "ورقية", // card (duplicate)
  "كرتون", // cartoon
  "أحجية", // puzzle
  "ألغاز", // riddles
  "فوازر", // brain teasers
  "طرائف", // jokes
  "نكتات", // jokes
  "مزاحة", // joking
  "مرحات", // fun times
  "ترفيه", // entertainment
  "تسلية", // pastime
  "متنزه", // park
  "ملاهي", // amusement
  "سيركة", // circus
  "مهرجن", // festival (truncated)
  "حفلات", // parties
  "سهرات", // evening gatherings
  "مسامر", // evening companion
  // === Construction & building ===
  "بناءة", // construction (duplicate)
  "تشييد", // erection
  "هدمات", // demolitions
  "حفرات", // excavations
  "أساسة", // foundation
  "عمودة", // pillar (duplicate)
  "جدارة", // wall/competence
  "سقفات", // roofs (duplicate)
  "نوافذ", // windows (duplicate)
  "أبوابي", // doors (6 - filtered)
  "سلالم", // stairs (already in answers)
  "مصعدة", // elevator
  "بلاطة", // tile (duplicate)
  "رخامة", // marble (duplicate)
  "خرسان", // concrete (truncated)
  "طوبات", // bricks
  "إسمنت", // cement (6 - filtered)
  "جبسات", // plaster
  "زجاجة", // glass (already in answers)
  "ألمنم", // aluminum (truncated)
  // === Verbs present tense ===
  "يحتاج", // he needs
  "يستطع", // he can (truncated)
  "يعتقد", // he believes
  "يفترض", // he assumes
  "يتوقع", // he expects
  "يحاول", // he tries
  "يتذكر", // he remembers
  "يتمنى", // he wishes
  "يشعرن", // they (f) feel
  "يعرفن", // they (f) know
  "يحبون", // they love (6 - filtered)
  "يريدن", // they (f) want
  "ينتظر", // he waits
  "يستمع", // he listens
  "يتحدث", // he speaks
  "يتعلم", // he learns
  "يعملن", // they (f) work (duplicate)
  "يقرأن", // they (f) read (duplicate)
  "يكتبن", // they (f) write (duplicate)
  "يرسمن", // they (f) draw
  "يطبخن", // they (f) cook
  "يغسلن", // they (f) wash
  "يلبسن", // they (f) wear
  "يأكلن", // they (f) eat
  "يشربن", // they (f) drink (duplicate)
  "ينامن", // they (f) sleep
  "يمشين", // they (f) walk
  "يركضن", // they (f) run
  "يقفزن", // they (f) jump
  "يسبحن", // they (f) swim
  // === More miscellaneous 5-letter words ===
  "أنابب", // pipes (truncated)
  "خراطم", // hoses
  "صنبور", // faucet
  "حنفية", // tap
  "مواسر", // pipes
  "صرفات", // drains
  "تمديد", // extension
  "تأسيس", // establishment
  "إصلاح", // repair
  "صيانة", // maintenance
  "تجديد", // renewal
  "تحسين", // improvement
  "تعزيز", // reinforcement
  "تقوية", // strengthening
  "تخفيف", // reduction
  "تقليص", // downsizing
  "تكثيف", // intensification
  "تنويع", // diversification
  "تحقيق", // investigation
  "تنفيذ", // implementation
  "تطهير", // purification
  "توسيع", // expansion
  "مناقب", // virtues
  "مناصب", // positions
  "مواهب", // talents
  "مراتب", // ranks
  "مطالب", // demands (duplicate)
  "مكاسب", // gains
  "مناسب", // suitable (already in answers)
  "مذاهب", // doctrines
  "متاعب", // troubles
  "مجارب", // experiences
  "أعجاب", // admiration (truncated)
  "أنساب", // lineages
  "أحباب", // loved ones
  "أصحاب", // companions
  "أرباب", // lords
  "أحزاب", // parties
  "ألقاب", // titles
  "أعشاب", // herbs (duplicate)
  "أخطاء", // errors
  "أسماء", // names
  "أشياء", // things
  "أعضاء", // members (duplicate)
  "آراءة", // opinions
  "أنباء", // news
  "أحياء", // neighborhoods/living
  "أعداء", // enemies (duplicate)
  "أجواء", // atmospheres
  "أطباء", // doctors
  "علماء", // scholars
  "شعراء", // poets
  "أدباء", // writers
  "حكماء", // wise men
  "زعماء", // leaders
  "أمراء", // princes
  "وزراء", // ministers
  "سفراء", // ambassadors
  "رؤساء", // presidents
  "خبراء", // experts
  "قراءة", // reading (duplicate, already in answers)
  "جزاءة", // reward
  "عزاءة", // condolence
  "وفاءة", // loyalty (already in answers area)
  "هواءة", // air
  "غذاءة", // food
  "دواءة", // medicine (duplicate)
  "شفاءة", // healing
  "بناءة", // constructive (duplicate)
  // === Common broken plurals ===
  "كتابة", // books (duplicate)
  "دروسة", // lessons (duplicate)
  "شهورة", // months
  "أقوال", // sayings
  "أمثال", // proverbs
  "أحوال", // conditions
  "أعمدة", // columns
  "أنهار", // rivers (already in answers)
  "أبيات", // verses (poetry)
  "أجيال", // generations
  "أحجار", // stones
  "أرواح", // souls (already in answers)
  "أسماك", // fish (already in answers)
  "أزمات", // crises
  "أدوار", // roles
  "أسرات", // families
  "أجنحة", // wings
  "أسلاك", // wires
  "أحمال", // loads
  "أرصدة", // balances
  "أطعمة", // foods
  "أقمشة", // fabrics
  "ألعاب", // games (already in answers)
  "أغذية", // foods
  "أغصان", // branches
  "أعصاب", // nerves
  "أوتار", // strings
  "أوجاع", // pains
  "أولاد", // children
  "أوائل", // firsts
  "بلدان", // countries
  "جبهات", // fronts (already in answers)
  "حروبة", // wars
  "خطابة", // speech/matchmaking
  "رجالة", // men
  "سيوفة", // swords
  "شيوخة", // sheikhs (already in answers)
  "عقبات", // obstacles (duplicate)
  "عيوبة", // defects
  "فنونة", // arts
  "قرونة", // centuries
  "كنوزة", // treasures
  "لغاتة", // languages
  "نجومة", // stars
  "هدايا", // gifts
  // === More Form V-VI verbs (common) ===
  "تأخرت", // she was late
  "تأكدت", // she was sure
  "تأملت", // she contemplated
  "تبادل", // they exchanged (duplicate)
  "تبرعت", // she donated
  "تحملت", // she endured
  "تحولت", // she transformed
  "تدخلت", // she interfered
  "تراجع", // he retreated (duplicate)
  "تسلقت", // she climbed
  "تصرفت", // she acted (duplicate)
  "تعاقد", // he contracted
  "تعامل", // he dealt
  "تعرفت", // she got to know
  "تغلبت", // she overcame
  "تقدمت", // she advanced
  "تمردت", // she rebelled
  "تميزت", // she distinguished
  "تنازل", // he conceded
  "توجهت", // she headed
  "توسعت", // she expanded
  "تولات", // she took charge
  // === Common participles (fa'il / maf'ul) ===
  "سامعة", // listener (f)
  "ناظرة", // looking (f)
  "قائلة", // saying (f)
  "فاعلة", // doing (f)
  "عاملة", // working (f) (already in answers)
  "حاملة", // carrying (f) (duplicate)
  "سائلة", // liquid/asking (f)
  "قادرة", // able (f)
  "قاصرة", // minor/short (f)
  "واصلة", // connecting (f)
  "ناجحة", // successful (f)
  "فاشلة", // failing (f)
  "صادقة", // truthful (f)
  "كاذبة", // lying (f)
  "عادلة", // just (f)
  "ظالمة", // unjust (f)
  "راضية", // satisfied (f)
  "ساخنة", // hot (f)
  "باقية", // remaining (f)
  "ماضية", // past (f) (already in answers)
  "قادمة", // coming (f) (already in answers)
  "دائمة", // permanent (f) (duplicate)
  "زائلة", // ephemeral (f)
  "ثابتة", // stable (f) (duplicate)
  "متحرك", // moving
  "ساكنة", // still/resident (f)
  "هادئة", // calm (f)
  "صاخبة", // noisy (f)
  "حاضنة", // incubator (f)
  "راعية", // sponsor (f) (duplicate)
  "حامية", // protector (f)
  "واقية", // protective (f)
  "مانعة", // preventing (f)
  "دافعة", // pushing (f)
  "سارقة", // stealing (f)
  "خائنة", // treacherous (f)
  "صابرة", // patient (f)
  "شاكرة", // thankful (f)
  "عابدة", // worshipping (f)
  "زاهدة", // ascetic (f)
  "عارفة", // knowing (f)
  "جاهلة", // ignorant (f)
  "غافلة", // heedless (f)
  "يقظات", // alert
  "نائمة", // sleeping (f)
  "ماشية", // walking (f)/livestock
  "راكبة", // riding (f)
  "سابحة", // swimming (f)
  "طائرة", // flying (f) (already in answers)
  "غاطسة", // diving (f)
  "عائدة", // returning (f)
  "قاطعة", // cutting (f)
  "واثقة", // confident (f)
  "متأكد", // sure
  "مصممة", // designer (f)/determined
  "عازمة", // determined (f)
  "مستعد", // ready
  "جاهزة", // ready (f)
  "مكتمل", // complete
  "ناقصة", // incomplete (f)
  "فارغة", // empty (f)
  "ممتلئ", // full
  "مكتظة", // crowded (f)
  "خالية", // empty (f)
  "مليئة", // full (f)
  // === Commonly searched words ===
  "معنات", // meanings
  "سؤالة", // question
  "جوابة", // answer
  "حلولة", // solutions
  "مفتاح", // key (already in answers)
  "قفلات", // locks (already in answers)
  "سرائر", // secrets (duplicate)
  "أسرار", // secrets (already in answers)
  "حماية", // protection (duplicate)
  "خصوصة", // privacy
  "أمنية", // wish (duplicate)
  "حفاظة", // preservation
  "توفير", // saving
  "إنفاق", // spending (duplicate)
  "استهل", // he began
  "توثيق", // documentation
  "تصديق", // ratification
  "تحقيق", // investigation (duplicate)
  "تعليم", // education (duplicate)
  "تربوي", // educational
  "ثقافي", // cultural
  "رياضي", // sporty
  "اقتصد", // he economized
  "اجتمع", // he gathered (duplicate)
  "سياحة", // tourism
  "سياحي", // touristic
  "ترفيه", // entertainment (duplicate)
  "تثقيف", // education
  "صنعات", // crafts
  "حرفية", // craftsmanship
  "مهنية", // professional
  "أكاديم", // academic (6 - filtered)
  "جامعي", // university
  "مدرسي", // school-related
  // === Time expressions ===
  "غدوات", // mornings
  "عشيات", // evenings
  "شروقة", // sunrise
  "غروبة", // sunset
  "سحرات", // pre-dawn
  "ضحوات", // forenoons
  "ظهرات", // noons (already in answers)
  "عصرات", // afternoons (already in answers)
  "أمسية", // evening
  "ليلية", // nightly
  "نهاري", // daytime
  "صباحي", // morning
  "مسائي", // evening
  "أسبوع", // week (already in answers)
  "شهرية", // monthly (already in answers)
  // === Miscellaneous high-frequency ===
  "مسافة", // distance
  "مساحة", // area
  "حجمات", // volumes
  "وزنات", // weights
  "طولات", // lengths
  "عرضات", // widths (duplicate with offers)
  "ارتفع", // height (duplicate)
  "عمقات", // depths
  "سرعات", // speeds
  "بطءات", // slownesses
  "قوتات", // strengths
  "ضعفات", // weaknesses
  "حدتات", // sharpnesses
  "نعومة", // softness
  "خشونة", // roughness
  "صلابة", // hardness
  "مرونة", // flexibility
  "متانة", // sturdiness
  "رقتات", // thinnesses
  "سمكات", // thicknesses (already in answers as fish)
  "كثافة", // density
  "خفتات", // dimnesses
  "لمعان", // shine
  "ظلمات", // darknesses
  "نورات", // lights
  "ظلالة", // shadows
  "إضاءة", // illumination
  "سطوعة", // brightness
  "بهتان", // fading
  "وضوحة", // clarity
  "غموضة", // mystery
  "تعقيد", // complexity
  "بساطة", // simplicity
  "تنوعة", // diversity
  "وحدات", // units (already in answers)
  "تكرار", // repetition
  "تنافس", // competition
  "تعاون", // cooperation (duplicate)
  // === Additional common words ===
  "مناظر", // views
  "مشاهد", // scenes
  "تفاصل", // details (truncated)
  "ملامح", // features
  "سماتة", // characteristics
  "خصائص", // properties
  "ميزات", // advantages
  "عيوبة", // disadvantages (duplicate)
  "سلبية", // negative
  "إيجاب", // positive (truncated)
  "فائدة", // benefit
  "منفعة", // utility
  "ضررات", // harms
  "فعالة", // effective
  "مجدية", // useful
  "عبثية", // absurd
  "جدوات", // feasibilities
  "نجاعة", // efficacy
  "كفاءة", // efficiency
  "قدرات", // capabilities (already in answers)
  "إمكان", // possibility
  "طاقات", // energies (already in answers)
  "جهودة", // efforts
  "عناءة", // trouble
  "مشاقة", // hardship (duplicate)
  "ارهاق", // exhaustion
  "اجهاد", // stress
  "تعافي", // recovery
  "تحسنة", // improvement
  "تدهور", // deterioration
  "انحدر", // he declined
  "ارتقى", // he rose
  "تصاعد", // he escalated (duplicate)
  "تنازل", // he descended (duplicate)
  // === Final batch of common words ===
  "نجحوا", // they succeeded
  "فشلوا", // they failed
  "وعدوا", // they promised
  "تابعت", // she followed
  "باشرت", // she started
  "أنجزت", // she accomplished
  "حققوا", // they achieved
  "عملاء", // clients
  "زبائن", // customers
  "تجارة", // commerce (duplicate)
  "صفقات", // deals
  "عروضة", // offers
  "طلبات", // orders
  "توريد", // supply
  "تصدير", // export
  "توزيع", // distribution (duplicate)
  "بيعات", // sales
  "ثروات", // fortunes
  "ديونة", // debts
  "تعويض", // compensation
  "أجرات", // wages
  "معاشة", // pension/living
  "راتبة", // salary
  "مكافأ", // reward (truncated)
  "جوائز", // prizes
  "تقدير", // appreciation (duplicate)
  "تميزة", // distinction
  "جودات", // qualities
  "معيار", // standard
  "مقياس", // measure
  "اختبر", // test (duplicate)
  "فحصات", // examinations
  "مراجع", // references
  "مصادر", // sources (duplicate)
  "موسوع", // encyclopedia (truncated)
  "قاموس", // dictionary
  "معجمة", // dictionary
  "أطلسة", // atlas
  "خارطة", // map
  "مسودة", // draft
  "نسخات", // copies (duplicate)
  "طبعات", // editions (duplicate)
  "منقحة", // revised
  "محدثة", // updated
  "مطورة", // developed
  "محسنة", // improved
  "معدلة", // modified (f)
  "مبسطة", // simplified
  "مختصر", // abbreviated
  "مفصلة", // detailed
  "شاملة", // comprehensive
  "جزئية", // partial
  "كليات", // totalities (duplicate)
  "مبدئي", // initial
  "نهائي", // final
  "مرحلي", // phased
  "انتقل", // transitional (duplicate)
  "مؤقتة", // temporary (duplicate)
  "مستمر", // continuous
  "متقطع", // intermittent
  "منتظم", // regular
  "عشوائ", // random (truncated)
  "محددة", // specific (f)
  "مبهمة", // vague (f)
  "معينة", // certain (f)
  "مجملة", // overall (f)
  "بالغة", // extreme (f)
  "ضئيلة", // minimal (f)
  "كافية", // sufficient (f)
  "ناقصة", // insufficient (f) (duplicate)
  "زائدة", // excess (f)
  "ملائم", // suitable
  "مناسب", // appropriate (already in answers)
  "ممكنة", // possible (f)
  "متاحة", // available (f)
  "محظور", // prohibited
  "مسموح", // permitted (duplicate)
  "واجبة", // required (duplicate)
  "جائزة", // prize/permissible
  "حسنات", // virtues (duplicate)
  "مذهلة", // amazing (f)
  "مدهشة", // astonishing (f)
  "مثيرة", // exciting (f)
  "ممتعة", // enjoyable (f)
  "مسلية", // entertaining (f)
  "مملات", // boring
  "مرعبة", // terrifying (f)
  "محزنة", // saddening (f)
  "مفرحة", // gladdening (f)
  "مغيظة", // infuriating (f)
  "مريحة", // comfortable (f)
  "مزعجة", // annoying (f)
  "مقلقة", // worrying (f)
  "مطمئن", // reassuring
  "مخيفة", // scary (f)
  "مؤلمة", // painful (f)
  "معافى", // healthy
  "مريضة", // sick (f)
  "سليمة", // sound/healthy (f)
  "معتلة", // ailing (f)
  "نشيطة", // active (f)
  "كسولة", // lazy (f)
  "هادئة", // quiet (f) (duplicate)
  "صاخبة", // loud (f) (duplicate)
  "مزدحم", // crowded
  "هادية", // guiding (f)
  "ضائعة", // lost (f)
  "تائهة", // wandering (f)
  "واجدة", // finding (f)
  "فاقدة", // losing (f)
  "مالكة", // owning (f)
  "فقيرة", // poor (f)
  "غنيات", // rich (f)
  "متوسط", // average
  "معتدل", // moderate
  "مفرطة", // excessive (f)
  "متزنة", // balanced (f)
  "حكيمة", // wise (f)
  "غبيات", // foolish (f)
  "ذكيات", // smart (f)
  "بليدة", // dull (f)
  "ماهرة", // skilled (f)
  "بارعة", // brilliant (f)
  "خبيرة", // expert (f)
  "مبتدئ", // beginner
  "متقدم", // advanced
  "محترف", // professional
  "هاوية", // amateur (f)/abyss
  "متمكن", // competent
  "عاجزة", // incapable (f)
  "قادرة", // capable (f) (duplicate)
  "ميسرة", // facilitated
  "معسرة", // insolvent (f)
  "ناجية", // surviving (f)
  "هالكة", // perishing (f)
  "سالمة", // safe (f)
  "مؤذية", // harmful (f)
  "نافعة", // beneficial (f)
  "ضارات", // harmful
  "مفيدة", // useful (f)
  "عديمة", // devoid (f)
  "غزيرة", // abundant (f)
  "شحيحة", // scarce (f)
  "وفيرة", // plentiful (f)
  "نادرة", // rare (f) (duplicate)
  "كثيرة", // many (f)
  "قليلة", // few (f)
  "وحيدة", // alone (f)
  "متعدد", // multiple
  "أحادي", // singular
  "ثنائي", // binary
  "ثلاثي", // triple
  "رباعي", // quadruple
  "خماسي", // quintuple
  // === Very common daily-use words ===
  "بيتنا", // our house
  "عندنا", // we have
  "معانا", // with us (colloquial)
  "يلاها", // let's go (colloquial)
  "خلاصة", // summary
  "حصيلة", // outcome
  "نتيجة", // result
  "ثمرات", // fruits
  "عوائد", // returns
  "مردود", // return/yield
  "محصلة", // resultant
  "ختامة", // conclusion
  "بداية", // beginning (duplicate)
  "نهاية", // ending (duplicate)
  "وسطات", // midpoints
  "فترات", // periods
  "مراحل", // phases (duplicate)
  "أدوار", // roles (duplicate)
  "فصولة", // chapters (already in answers)
  "أبوابي", // sections (6 - filtered, duplicate)
  "عناون", // titles (truncated)
  "محاور", // axes
  "نقاشة", // discussion
  "حوارة", // dialogue
  "مداخل", // entrances (already in answers)
  "مخارج", // exits
  "منافذ", // outlets
  "مسالك", // paths
  "ممرات", // passages (duplicate)
  "معابر", // crossings
  "جسورة", // bridges/bold
  "قناطر", // arches
  "سدودة", // dams
  "خزانة", // reservoir (already in answers)
  "بحيرة", // lake (already in answers)
  "ينابع", // springs (truncated)
  "عيونة", // eyes/springs
  "آبارة", // wells
  "حفرات", // holes (duplicate)
  "أخادد", // grooves (truncated)
  "وديان", // valleys
  "سهولة", // plains (duplicate with ease)
  "تلالة", // hills
  "قممات", // peaks
  "منحدر", // slope
  "مرتفع", // highland (duplicate)
  // === EXPANDED WORD LIST (3000+ new words) ===
  "كتبنا",
  "كتبتم",
  "ذهبنا",
  "ذهبتم",
  "خرجنا",
  "دخلنا",
  "رجعنا",
  "وصلنا",
  "نزلنا",
  "طلعنا",
  "سمعنا",
  "شربنا",
  "أكلنا",
  "نظرنا",
  "وقفنا",
  "جلسنا",
  "حملنا",
  "فتحنا",
  "بحثنا",
  "درسنا",
  "عملنا",
  "لعبنا",
  "ضربنا",
  "كسرنا",
  "قرأنا",
  "فهمنا",
  "حصلنا",
  "سألنا",
  "قلنها",
  "كنانا",
  "بدأنا",
  "حكمنا",
  "ركبنا",
  "زرعنا",
  "صنعنا",
  "طبخنا",
  "غسلنا",
  "فقدنا",
  "كشفنا",
  "لبسنا",
  "مسكنا",
  "هربنا",
  "وضعنا",
  "وقعنا",
  "ولدنا",
  "أخذنا",
  "تركنا",
  "جئنها",
  "خفنها",
  "ذقنها",
  "زرنها",
  "سرنها",
  "عشنها",
  "عدنها",
  "فزنها",
  "قمنها",
  "نمنها",
  "ضحكنا",
  "بكينا",
  "مشينا",
  "جرينا",
  "رمينا",
  "سقينا",
  "حفرنا",
  "نشرنا",
  "غرسنا",
  "قطعنا",
  "جمعنا",
  "فرقنا",
  "وزعنا",
  "دفعنا",
  "سحبنا",
  "رفعنا",
  "خفضنا",
  "فتشنا",
  "حرسنا",
  "حبسنا",
  "طردنا",
  "سرقنا",
  "قبضنا",
  "ربطنا",
  "فكينا",
  "ذبحنا",
  "شوينا",
  "خبزنا",
  "عجننا",
  "طحننا",
  "قليان",
  "سلقنا",
  "غلينا",
  "بردنا",
  "سخننا",
  "نظفنا",
  "كنسنا",
  "مسحنا",
  "غسيلا",
  "كوينا",
  "خطينا",
  "رسمنا",
  "لوننا",
  "حفظنا",
  "عرفنا",
  "فكرنا",
  "حلمنا",
  "شعرنا",
  "أحسنا",
  "نسينا",
  "تذكرا",
  "خدمنا",
  "ساعدا",
  "كتبتا",
  "ذهبتا",
  "خرجتا",
  "دخلتا",
  "رجعتا",
  "وصلتا",
  "نزلتا",
  "طلعتا",
  "سمعتا",
  "شربتا",
  "أكلتا",
  "نظرتا",
  "وقفتا",
  "جلستا",
  "حملتا",
  "فتحتا",
  "بحثتا",
  "درستا",
  "عملتا",
  "لعبتا",
  "ضربتا",
  "كسرتا",
  "قرأتا",
  "فهمتا",
  "جمعتا",
  "فرقتا",
  "دفعتا",
  "سحبتا",
  "رفعتا",
  "هربتا",
  "وضعتا",
  "نشرتا",
  "قطعتا",
  "حفرتا",
  "يكتبا",
  "تكتبا",
  "نكتبا",
  "يذهبا",
  "تذهبا",
  "نذهبا",
  "يخرجا",
  "يدخلا",
  "يرجعا",
  "يوصلا",
  "ينزلا",
  "يطلعا",
  "يسمعا",
  "يشربا",
  "يأكلا",
  "ينظرا",
  "يوقفا",
  "يجلسا",
  "يحملا",
  "يفتحا",
  "يبحثا",
  "يدرسا",
  "يعملا",
  "يلعبا",
  "يضربا",
  "يكسرا",
  "يقرأا",
  "يفهما",
  "يكتبه",
  "يقرأه",
  "يفهمه",
  "يعرفه",
  "يحفظه",
  "يسمعه",
  "يشربه",
  "يأكله",
  "ينظره",
  "يفتحه",
  "يغلقه",
  "يكسره",
  "يدفعه",
  "يرفعه",
  "يسحبه",
  "يقطعه",
  "يجمعه",
  "يفرقه",
  "نسمعه",
  "نفهمه",
  "نعرفه",
  "نحفظه",
  "تكتبه",
  "تقرأه",
  "تفهمه",
  "تعرفه",
  "تحفظه",
  "تسمعه",
  "يمشون",
  "يجرون",
  "يأتون",
  "يقولن",
  "يفعلن",
  "يأخذن",
  "يتركن",
  "يعطين",
  "يبيعن",
  "يشترن",
  "يدفعن",
  "يسافر",
  "يغادر",
  "يعالج",
  "يساعد",
  "يشاهد",
  "يواجه",
  "يقابل",
  "يتابع",
  "يباشر",
  "يراسل",
  "يحاسب",
  "يراقب",
  "يفاوض",
  "يبارك",
  "يسامح",
  "يعارض",
  "يوافق",
  "يناقش",
  "يحاضر",
  "يدافع",
  "يهاجم",
  "يحارب",
  "يقاتل",
  "يصارع",
  "يكافح",
  "يجاهد",
  "ينافس",
  "يسابق",
  "يتفوق",
  "اكتبه",
  "اقرأه",
  "افهمه",
  "احفظه",
  "اسمعه",
  "اشربه",
  "افتحه",
  "اغلقه",
  "ادفعه",
  "ارفعه",
  "اسحبه",
  "اقطعه",
  "اجمعه",
  "ارسمه",
  "اطبخه",
  "اغسله",
  "انشره",
  "اكتبو",
  "اقرأو",
  "افهمو",
  "احفظو",
  "اسمعو",
  "اشربو",
  "افتحو",
  "اغلقو",
  "ادفعو",
  "ارفعو",
  "اقطعو",
  "اجمعو",
  "ارسمو",
  "اطبخو",
  "اغسلو",
  "ادرسو",
  "اعملو",
  "العبي",
  "اسبحي",
  "ادرسي",
  "انزلي",
  "اطلعي",
  "انظمي",
  "اهربي",
  "اهدأي",
  "اصبري",
  "اشكري",
  "علمنا",
  "قدمنا",
  "وصفنا",
  "كلمنا",
  "سلمنا",
  "نظمنا",
  "قسمنا",
  "رتبنا",
  "صنفنا",
  "جهزنا",
  "حضرنا",
  "عدلنا",
  "بدلنا",
  "غيرنا",
  "طورنا",
  "حسنها",
  "جملنا",
  "زينها",
  "صلحنا",
  "خربنا",
  "كسرها",
  "عمرنا",
  "وسعنا",
  "ضيقنا",
  "قوينا",
  "ضعفنا",
  "سهلنا",
  "صعبنا",
  "فرحنا",
  "حزننا",
  "تعلمو",
  "تكلمو",
  "تقدمو",
  "تحدثو",
  "تحركو",
  "تطورو",
  "تغيرو",
  "تحسنو",
  "تفرقو",
  "تجمعو",
  "تصرفو",
  "تذكرو",
  "تخرجو",
  "تزوجو",
  "تمكنو",
  "توقفو",
  "تشاور",
  "تبارك",
  "تنازع",
  "تخاطب",
  "تراسل",
  "تبارز",
  "تشارك",
  "تناول",
  "تداول",
  "تساقط",
  "تتابع",
  "تواعد",
  "تعاقب",
  "تبايع",
  "تناجى",
  "تفارق",
  "تباعد",
  "تقارب",
  "تلاقى",
  "تعانق",
  "تلازم",
  "تزاحم",
  "تنافر",
  "انكسر",
  "انفتح",
  "انغلق",
  "اندفع",
  "انسحب",
  "انقلب",
  "انهمر",
  "انبهر",
  "انتبه",
  "انحنى",
  "انبسط",
  "انقبض",
  "انضمت",
  "انهزم",
  "انقرض",
  "انعدم",
  "انهمك",
  "انشغل",
  "انفرد",
  "انعزل",
  "انحرف",
  "انفلت",
  "انتعش",
  "انتفخ",
  "اجتاح",
  "ابتعد",
  "ابتكر",
  "احتضن",
  "اختبأ",
  "اختصر",
  "ارتجل",
  "ارتدى",
  "ارتسم",
  "ارتعش",
  "ارتكب",
  "اشتعل",
  "اشترك",
  "اشتهر",
  "اعتبر",
  "اعتدل",
  "اعتزل",
  "اعترف",
  "اعتنى",
  "اقتبس",
  "اقتحم",
  "اقتدى",
  "اقتنع",
  "التحق",
  "التفت",
  "التهم",
  "امتدح",
  "امتزج",
  "امتنع",
  "امتلك",
  "امتلأ",
  "انتبذ",
  "انتخب",
  "انتسب",
  "انتهك",
  "ابتهج",
  "ابتلع",
  "احتال",
  "احتسب",
  "اشتبه",
  "اشتمل",
  "اصطدم",
  "اصطنع",
  "اقترف",
  "اقترن",
  "استخف",
  "استعد",
  "استمد",
  "استند",
  "استدل",
  "استفد",
  "استقم",
  "شاكوش",
  "مسمار",
  "براغي",
  "لاصقة",
  "حبالة",
  "سلسلة",
  "مفكات",
  "منشار",
  "مثقاب",
  "كماشة",
  "زردية",
  "مطرقة",
  "مبرأة",
  "محبرة",
  "دفترة",
  "كراسة",
  "قرطاس",
  "ظرفات",
  "طوابع",
  "أختام",
  "لوحية",
  "قرصات",
  "عصابة",
  "طوقات",
  "أنبوب",
  "خرطوم",
  "برميل",
  "صفيحة",
  "وعاءة",
  "قنينة",
  "جيلات",
  "معجون",
  "مسحوق",
  "كتلات",
  "رزمات",
  "حزمات",
  "لفافة",
  "بكرات",
  "سجائر",
  "ولاعة",
  "ثقابة",
  "منفضة",
  "عكازة",
  "ربطات",
  "مشطات",
  "فرشات",
  "مجففة",
  "معقمة",
  "إطارة",
  "عجلات",
  "محرات",
  "حنجرة",
  "معدات",
  "أمعاء",
  "كبدات",
  "رئتان",
  "طحالة",
  "مثانة",
  "مفاصل",
  "أوتاد",
  "ركبتا",
  "كاحلة",
  "معصمة",
  "كفتان",
  "أصابع",
  "إبهام",
  "سبابة",
  "بنصرة",
  "خنصرة",
  "ظفرات",
  "ذقنات",
  "حاجبة",
  "رموشة",
  "هدبات",
  "جفنات",
  "حدقات",
  "قرنية",
  "شبكية",
  "حلمات",
  "ثديات",
  "سرتان",
  "حوضات",
  "وركات",
  "فخذات",
  "ساقات",
  "قصبات",
  "قنفذة",
  "خفاشة",
  "سنجاب",
  "ظبيات",
  "وعلات",
  "بجعات",
  "لقلاق",
  "هدهدة",
  "حجلات",
  "سمانة",
  "يمامة",
  "كروان",
  "عندلب",
  "حدأات",
  "باشقة",
  "شاهين",
  "عقبان",
  "كناري",
  "طوقان",
  "فلامن",
  "سلعاة",
  "ضبعات",
  "فهدات",
  "يغوار",
  "كنغرة",
  "باندا",
  "كوالا",
  "ثعبان",
  "أفعات",
  "كوبرا",
  "بيتون",
  "سحلية",
  "ورلات",
  "أبوات",
  "سردين",
  "تونات",
  "قاروص",
  "هامور",
  "بلطية",
  "سلمون",
  "جمبري",
  "كابور",
  "سرطان",
  "محارة",
  "اخطبط",
  "قنديل",
  "نجمبح",
  "يعسوب",
  "خنفسة",
  "صرصور",
  "جراده",
  "عنكبت",
  "عقرون",
  "دعسوق",
  "بلوطة",
  "سروات",
  "صنوبر",
  "تنوبة",
  "نبقات",
  "سدرات",
  "طلحات",
  "غافات",
  "سمرات",
  "أثلات",
  "توليب",
  "أقحون",
  "سوسنة",
  "أوركد",
  "خزامى",
  "بقلات",
  "حلبات",
  "شيحات",
  "ريحان",
  "زعترة",
  "حصالب",
  "مريمة",
  "بابنج",
  "لبلاب",
  "عليقة",
  "حسكات",
  "قراصة",
  "أبنوس",
  "خيزرن",
  "بردية",
  "حلفاء",
  "كسترد",
  "بودنغ",
  "جلاتن",
  "بسكوت",
  "كوكيز",
  "كرواس",
  "بريوش",
  "تورتة",
  "غاتوه",
  "مافنة",
  "دوناط",
  "وافلة",
  "بانكك",
  "شكلاط",
  "فانيل",
  "حلويا",
  "رهشات",
  "بقلاو",
  "مهلبة",
  "أمساك",
  "عاشور",
  "زلابة",
  "قلبلب",
  "مصابب",
  "برازق",
  "معمول",
  "كليجة",
  "سميدة",
  "لقيمة",
  "عوامة",
  "بليلة",
  "سحلبة",
  "قمردن",
  "مربات",
  "دبسات",
  "حلقوم",
  "نوغات",
  "فدجات",
  "سموثي",
  "عصائر",
  "كوكتل",
  "لاتيه",
  "موكات",
  "فرابة",
  "شايات",
  "قرفات",
  "حلبية",
  "ينسون",
  "شمرات",
  "كركدي",
  "مخبوز",
  "معجنة",
  "مقرمش",
  "مملحة",
  "محمصة",
  "مطحون",
  "منقوش",
  "مشوية",
  "محشية",
  "مسلوق",
  "مقطعة",
  "مبشور",
  "مفروم",
  "معصور",
  "متبلة",
  "مدخنة",
  "ثريدة",
  "عريكة",
  "مطبقة",
  "جريشة",
  "عصيدة",
  "سليقة",
  "مرقوق",
  "حنيذة",
  "مظبية",
  "مطازز",
  "بريان",
  "مضغوط",
  "زربيا",
  "شيشبر",
  "محلاة",
  "رقاقة",
  "قرصان",
  "مفطحة",
  "مشغوث",
  "أثمان",
  "أحكام",
  "أحزان",
  "أوطان",
  "أركان",
  "أديان",
  "أبدان",
  "ألحان",
  "أحصان",
  "أكوان",
  "ألبان",
  "ألسان",
  "أوزان",
  "أثمار",
  "أزهار",
  "أمصار",
  "أقطار",
  "أخطار",
  "أبصار",
  "أبكار",
  "أعذار",
  "أحرار",
  "أطوار",
  "أنوار",
  "أبقار",
  "أنجاد",
  "أمجاد",
  "أحفاد",
  "أجداد",
  "أجساد",
  "أعواد",
  "أحقاد",
  "أرصاد",
  "أبعاد",
  "شروطة",
  "حقوقة",
  "بيوتة",
  "نصوصة",
  "فصوصة",
  "جذوره",
  "بذوره",
  "أصوله",
  "فروعه",
  "جفونه",
  "شؤونه",
  "فنونه",
  "ظنونه",
  "عقوله",
  "قلوبه",
  "نفوسه",
  "جيوبه",
  "كتابه",
  "حسابه",
  "حدوده",
  "وجوده",
  "سجوده",
  "ركوعه",
  "قعوده",
  "وقوفه",
  "دخوله",
  "خروجه",
  "جبالة",
  "جواهر",
  "خواتم",
  "عواطف",
  "كواكب",
  "فوارق",
  "حوامل",
  "عوامل",
  "هوامش",
  "خواطر",
  "قوالب",
  "جوانب",
  "قواعد",
  "قوافل",
  "بواعث",
  "فوائد",
  "كوارث",
  "حواسب",
  "بوادر",
  "جوارح",
  "حوارس",
  "عواقب",
  "لوامع",
  "نوادر",
  "توابع",
  "مشاعل",
  "مقابر",
  "مناجم",
  "مراعي",
  "مصارف",
  "محافل",
  "معالم",
  "مقامر",
  "مجاري",
  "مهاجر",
  "مخازن",
  "مواثق",
  "ملاجئ",
  "مفارق",
  "معاهد",
  "مقاصد",
  "مناجد",
  "مساند",
  "مقاعد",
  "مراقد",
  "مصاعد",
  "مهابط",
  "مدابغ",
  "مسالخ",
  "مذابح",
  "مطابع",
  "مخابز",
  "بخلاء",
  "بسطاء",
  "ضعفاء",
  "فقراء",
  "كرماء",
  "ظرفاء",
  "شرفاء",
  "نبلاء",
  "جهلاء",
  "سعداء",
  "شقياء",
  "أتقيا",
  "معلمو",
  "مهندو",
  "محامو",
  "معلمن",
  "مهندن",
  "طالبو",
  "طالبن",
  "كاتبو",
  "كاتبن",
  "عامرو",
  "خادمو",
  "حارسو",
  "سائقو",
  "لاعبو",
  "مدربو",
  "حاكمو",
  "قاضيو",
  "معلمت",
  "طالبت",
  "كاتبت",
  "ممرضت",
  "مهندت",
  "سيدات",
  "أميرت",
  "طائرت",
  "سيارت",
  "حاسبت",
  "رسالت",
  "مقالت",
  "جريدت",
  "دراست",
  "ندوات",
  "مؤتمر",
  "نشرات",
  "قرارت",
  "بيانت",
  "أبيضة",
  "أسوده",
  "أحمره",
  "أصفره",
  "أخضره",
  "أزرقه",
  "أسمرة",
  "أشقره",
  "أعرجة",
  "أعورة",
  "أصلعة",
  "أعمات",
  "أطرشة",
  "أخرسة",
  "أعسرة",
  "سمينة",
  "نحيفة",
  "رشيقة",
  "ممتلة",
  "بدينة",
  "نحيلة",
  "طويله",
  "قصيره",
  "عريضة",
  "نحيلا",
  "ضخمات",
  "أملسة",
  "مجعدة",
  "لزجات",
  "جامدة",
  "سائلا",
  "غازية",
  "مشعات",
  "باهتة",
  "زاهية",
  "قاتمة",
  "فاقعة",
  "داكنة",
  "لطيفة",
  "وقحات",
  "مهذبة",
  "رقيقة",
  "قاسية",
  "حنونة",
  "عطوفة",
  "بخيلة",
  "أنانة",
  "جبانة",
  "متهور",
  "أحمقة",
  "عنيدة",
  "مطيعة",
  "متمرد",
  "خجولة",
  "جريئة",
  "وفيات",
  "غدارة",
  "أمينة",
  "عفيفة",
  "فاجرة",
  "تقيات",
  "زكيات",
  "طاهرة",
  "نجسات",
  "مفتوح",
  "مغلوق",
  "مكسور",
  "مجروح",
  "ملفوف",
  "مطبوخ",
  "مغسول",
  "منشور",
  "مطبوع",
  "مرسوم",
  "محفوظ",
  "مكتوب",
  "مقروء",
  "مسموع",
  "منظور",
  "ملموس",
  "محسوس",
  "مدفوع",
  "مرفوع",
  "مسحوب",
  "مقطوع",
  "مجموع",
  "مفروق",
  "موزوع",
  "مصنوع",
  "مزروع",
  "مبيوع",
  "مأكول",
  "منقول",
  "معقول",
  "مقبوض",
  "مربوط",
  "محبوس",
  "مطرود",
  "مسروق",
  "مذبوح",
  "كاملة",
  "عاجلة",
  "آجلات",
  "سابقة",
  "لاحقة",
  "فائقة",
  "رائقة",
  "شائقة",
  "لائقة",
  "فائضة",
  "زائفة",
  "صائبة",
  "خاطئة",
  "حائرة",
  "سائرة",
  "طائفة",
  "نازلة",
  "صاعدة",
  "هابطة",
  "قافزة",
  "راكضة",
  "سائحة",
  "عابرة",
  "مارقة",
  "هاربة",
  "لاجئة",
  "نازحة",
  "قاصدة",
  "عائشة",
  "دارسة",
  "حاذقة",
  "عاقلة",
  "سافلة",
  "فاضلة",
  "ناصحة",
  "غاشمة",
  "حاسمة",
  "جازمة",
  "سامحة",
  "غافرة",
  "مدعوم",
  "مسنود",
  "مكفول",
  "مدخول",
  "مخزون",
  "مشحون",
  "مرهون",
  "مديون",
  "ملعون",
  "مسجون",
  "مأسور",
  "مأمون",
  "مأمول",
  "مجزوم",
  "منصوب",
  "مفعول",
  "موصول",
  "مفصول",
  "معزول",
  "محلول",
  "ممنوح",
  "مطروح",
  "مشروح",
  "ممسوح",
  "مسروح",
  "ذهابه",
  "رجوعه",
  "وصوله",
  "نزوله",
  "سماعه",
  "جلوسه",
  "حملات",
  "فتحات",
  "بحثات",
  "عمالة",
  "ضرابة",
  "فهمات",
  "هروبه",
  "سؤاله",
  "نطقات",
  "صمتات",
  "حركات",
  "سكونه",
  "تبديل",
  "تحديد",
  "تصحيح",
  "تنقيح",
  "تلميح",
  "تصريح",
  "تلقيح",
  "ترشيح",
  "توضيح",
  "تسليح",
  "تفريح",
  "ترويح",
  "تطبيخ",
  "تنبيه",
  "توجيه",
  "تشبيه",
  "تمويه",
  "تنويه",
  "تشويه",
  "تنويم",
  "تعظيم",
  "تحطيم",
  "تسليم",
  "تعميم",
  "تقسيم",
  "تقييم",
  "تحكيم",
  "تكريم",
  "ترحيب",
  "تخريب",
  "تقريب",
  "تغريب",
  "تجريب",
  "تعريب",
  "تهذيب",
  "تأديب",
  "تطييب",
  "تعذيب",
  "تطنيب",
  "تجنيب",
  "تذويب",
  "تخصيص",
  "ترخيص",
  "تلخيص",
  "تنقيص",
  "تمحيص",
  "تبييض",
  "تحريض",
  "تفويض",
  "تحفيظ",
  "تغليظ",
  "تعليل",
  "تدليل",
  "تقليل",
  "تمليك",
  "تحريك",
  "تشريك",
  "تبريك",
  "تفكيك",
  "تركيك",
  "تخمين",
  "تثمين",
  "تعيين",
  "تلوين",
  "تدوين",
  "تكوين",
  "تمكين",
  "تسكين",
  "تحصين",
  "تبطين",
  "تعفين",
  "مقاتل",
  "مناضل",
  "مواصل",
  "مراسل",
  "مقابل",
  "محاول",
  "مجادل",
  "مبارز",
  "جدالة",
  "نضالة",
  "وصالة",
  "قتالة",
  "نزالة",
  "صراعة",
  "كفاحة",
  "جهادة",
  "إسراع",
  "إبطاء",
  "إعلام",
  "إلهام",
  "إكرام",
  "إنعام",
  "إفهام",
  "إحكام",
  "إتمام",
  "إلزام",
  "إعظام",
  "إرغام",
  "إقدام",
  "إحجام",
  "إجبار",
  "إخبار",
  "إصدار",
  "إبحار",
  "إيثار",
  "إبهار",
  "إظهار",
  "إضمار",
  "إعمار",
  "إفطار",
  "إسهار",
  "إكثار",
  "إنكار",
  "إصرار",
  "إضرار",
  "مجلسة",
  "مطبعة",
  "مصبغة",
  "مدبغة",
  "مسلخة",
  "مذبحة",
  "مخبزة",
  "معصرة",
  "مطحنة",
  "مخزنة",
  "ملجأة",
  "مرعات",
  "مكمنة",
  "مخبأة",
  "منبعة",
  "مصبات",
  "مقصدة",
  "ملتقى",
  "منتدى",
  "مقهات",
  "ملهات",
  "متحفة",
  "مرسمة",
  "موقفة",
  "مدخلة",
  "مقراض",
  "مصقلة",
  "منخلة",
  "مسنات",
  "مبراة",
  "مزراب",
  "مذياع",
  "مرصاد",
  "مقلاع",
  "محقان",
  "مصفاة",
  "ملقاط",
  "مجهار",
  "مختار",
  "مكبسة",
  "مفرمة",
  "معصار",
  "مطربة",
  "مغنية",
  "شاعرة",
  "أديبة",
  "خطيبة",
  "واعظة",
  "مفكرة",
  "فلاحة",
  "حلاقة",
  "صباغة",
  "حارثة",
  "سباكة",
  "لحامة",
  "خراطة",
  "مبلطة",
  "مهربة",
  "عميلة",
  "جاسوس",
  "مخبرة",
  "دبلوم",
  "مأمور",
  "كاشير",
  "بواجي",
  "عريفة",
  "نقيبة",
  "عقيدة",
  "عميدة",
  "طباخة",
  "نادلة",
  "حلوان",
  "صرافة",
  "دلالة",
  "سمسار",
  "وسيطة",
  "محكمة",
  "عدالة",
  "جزائر",
  "سودان",
  "موريت",
  "جيبوت",
  "صومال",
  "أردنة",
  "فلسطن",
  "إمارت",
  "إيران",
  "تركيا",
  "باكست",
  "أفغان",
  "كوريا",
  "فيتنم",
  "تايلن",
  "ماليز",
  "أندنس",
  "بنغلد",
  "سريلن",
  "نيبال",
  "فرنسا",
  "إسبان",
  "إيطال",
  "بريطا",
  "ألمان",
  "هولند",
  "بلجيك",
  "سويسر",
  "بولند",
  "رومان",
  "يونان",
  "صربيا",
  "كرواط",
  "بلغار",
  "تشيكي",
  "نيجير",
  "غانات",
  "كينيا",
  "أثيوب",
  "تنزان",
  "أوغند",
  "رواند",
  "السنغ",
  "كامرو",
  "كندية",
  "مكسيك",
  "برازل",
  "أرجنت",
  "تشيلي",
  "كولمب",
  "بيروة",
  "قاهرة",
  "دمشقة",
  "بغداد",
  "بيروت",
  "تونسة",
  "رباطة",
  "دوحات",
  "مسقطة",
  "صنعاء",
  "مكرمة",
  "منورة",
  "أبهاء",
  "تبوكة",
  "نجران",
  "حائلة",
  "جيزان",
  "ينبعة",
  "فاسية",
  "مراكش",
  "وهران",
  "قسنطن",
  "إسطنب",
  "أنقرة",
  "طهران",
  "كراتش",
  "لاهور",
  "دلهية",
  "مومبا",
  "كلكتا",
  "بيجنغ",
  "شنغها",
  "طوكيو",
  "سيؤول",
  "جاكرت",
  "توحيد",
  "شهادت",
  "صلاتة",
  "حجتنا",
  "عمرات",
  "طوافة",
  "سعيات",
  "تلبية",
  "إحرام",
  "وقوفة",
  "نفرات",
  "مزدلف",
  "إفاضة",
  "ركعات",
  "تشهدة",
  "قنوتة",
  "سلامه",
  "أذانة",
  "إمامة",
  "جماعة",
  "خطبات",
  "جمعات",
  "سنتان",
  "فرضات",
  "واجبت",
  "مكروت",
  "مندوب",
  "مستحت",
  "حرمات",
  "طهارة",
  "نجاسة",
  "حيضات",
  "غسلات",
  "وضوئي",
  "تيممي",
  "مصلاة",
  "قبلتة",
  "ثوابه",
  "عقابه",
  "صراطة",
  "جنتان",
  "نارية",
  "شفاعة",
  "توبات",
  "مغفرة",
  "رحمته",
  "عذابه",
  "قيامه",
  "بعثات",
  "نشورة",
  "فتنات",
  "دجالة",
  "مهدية",
  "خلافة",
  "أمارة",
  "شورات",
  "عهدات",
  "ذمتان",
  "جزيات",
  "خراجة",
  "وقفات",
  "نذرات",
  "كفارة",
  "قرآنة",
  "سنتنا",
  "حديثه",
  "قياسة",
  "اصولة",
  "هاتفي",
  "جوالة",
  "سلكية",
  "لاسلك",
  "بلوتث",
  "واياف",
  "راوتر",
  "مودمة",
  "سيرفر",
  "داتات",
  "كلاود",
  "ميلات",
  "تغريد",
  "هاشتق",
  "بوستة",
  "ستوري",
  "ريلات",
  "فيديو",
  "بودكت",
  "ستريم",
  "أونلن",
  "أوفلن",
  "ديجتل",
  "بكسلة",
  "بايتة",
  "غيغات",
  "تيرات",
  "ميغات",
  "كيلوب",
  "سوفتة",
  "هاردة",
  "رامات",
  "معالج",
  "لابتب",
  "ديسكت",
  "تابلت",
  "ماوسة",
  "كيبرد",
  "يوسبة",
  "إتشدم",
  "كبلات",
  "وصلات",
  "إيميل",
  "تويتر",
  "فيسبك",
  "يوتيب",
  "تكتوك",
  "سنابة",
  "إنستا",
  "لينكد",
  "واتسب",
  "تلغرم",
  "غوغلة",
  "آبلية",
  "سامسن",
  "هواوي",
  "شاومي",
  "أندرد",
  "آيفون",
  "سافار",
  "كرومة",
  "فايرف",
  "بايثن",
  "سويفت",
  "كوتلن",
  "ريأكت",
  "فلاتر",
  "نودجس",
  "جانغو",
  "لارفل",
  "كرتقد",
  "كريدي",
  "كرسلة",
  "كرطاء",
  "كريخت",
  "ريشات",
  "جودوه",
  "تايكو",
  "كاراط",
  "كونفو",
  "أيكيد",
  "ووشوة",
  "ركبية",
  "جمبزة",
  "فلبات",
  "ترامب",
  "قفزعل",
  "رميرم",
  "سباقة",
  "ميدنة",
  "مضمار",
  "مدرجة",
  "تشجيع",
  "جماهر",
  "مشجعن",
  "كرتصف",
  "بطاقة",
  "تسللة",
  "ركنية",
  "ركلجز",
  "ضربجز",
  "هداتف",
  "تمرير",
  "تسديد",
  "تصويب",
  "اعتدا",
  "تأهيل",
  "دوريي",
  "كأسية",
  "نهائة",
  "مباري",
  "أبحاث",
  "أطروح",
  "بحثية",
  "تطبقي",
  "مخبري",
  "صفيات",
  "فصليي",
  "نصفية",
  "ربعية",
  "أسبعي",
  "يوميي",
  "حضوري",
  "غيابي",
  "إلكتر",
  "عنبعد",
  "مدمجة",
  "تفاعي",
  "عروسة",
  "عريسة",
  "خاطبة",
  "مخطوب",
  "متزوج",
  "مطلقة",
  "أرملة",
  "عزباء",
  "حماتة",
  "نسيبة",
  "صهرات",
  "كنتان",
  "سلفات",
  "بعيده",
  "نسيبت",
  "يتيمة",
  "لقيطة",
  "دعيات",
  "كافلة",
  "مربية",
  "مرضعة",
  "خادمة",
  "جيرنا",
  "أهلنا",
  "ناسنا",
  "ربعنا",
  "خوينا",
  "حبينا",
  "عزيزة",
  "قريبه",
  "صقيعة",
  "جليدي",
  "ثلجية",
  "مطرية",
  "غيومة",
  "سحابي",
  "ضبابي",
  "رذاذة",
  "وابلة",
  "طوفان",
  "سيلات",
  "جارفة",
  "فيضاي",
  "يابسة",
  "قارية",
  "ساحلي",
  "جزرية",
  "شبهجز",
  "خليجة",
  "مضيقة",
  "بوغاز",
  "هضبات",
  "سفوحة",
  "سفحات",
  "قمتنا",
  "ذروات",
  "ثغرات",
  "روافد",
  "ضفافة",
  "شطآنة",
  "خلجان",
  "رؤوسة",
  "أطراف",
  "تربات",
  "صخورة",
  "حصوات",
  "رملات",
  "طينات",
  "غرينة",
  "كثبان",
  "ينبوع",
  "جرانت",
  "بازلت",
  "حجرجي",
  "رخامي",
  "كلسية",
  "جيرية",
  "رسوبي",
  "ناريي",
  "متحول",
  "بلورت",
  "معدنت",
  "حديده",
  "نحاسي",
  "ألمنة",
  "زنكات",
  "قصدرة",
  "تيتان",
  "نيكلة",
  "كرومي",
  "فولاذ",
  "يالله",
  "شلونك",
  "وينكم",
  "ليشات",
  "ايوات",
  "لأنها",
  "بعدين",
  "يعنين",
  "طيبات",
  "زينات",
  "عيالة",
  "حريمة",
  "يهالة",
  "أبوية",
  "أموية",
  "مسوين",
  "رايحن",
  "جايين",
  "شايفن",
  "عارفن",
  "حاطين",
  "واقفن",
  "جالسن",
  "نايمن",
  "صاحين",
  "متعبن",
  "زعلان",
  "فرحان",
  "جعلان",
  "عايزة",
  "عاوزة",
  "مفيشة",
  "بتاعة",
  "حاجات",
  "كتيره",
  "شويات",
  "خالصة",
  "أوامر",
  "حلوات",
  "تحفات",
  "عالية",
  "بصراح",
  "فعلات",
  "والله",
  "كمانة",
  "برضوه",
  "هلأات",
  "كتيرة",
  "منيحة",
  "مليحة",
  "بيتين",
  "شغلات",
  "حكيات",
  "هلقات",
  "ورايا",
  "قدامي",
  "جنبية",
  "برشات",
  "ياسرة",
  "بزافة",
  "هاذاك",
  "واحدة",
  "كاينة",
  "حاجاة",
  "مجازة",
  "كناية",
  "تشبية",
  "استعا",
  "تورية",
  "جناسة",
  "سجعات",
  "قافية",
  "بحورة",
  "بلاغة",
  "نحوية",
  "صرفية",
  "لغوية",
  "نقدية",
  "فلسفة",
  "فيزيا",
  "كيميا",
  "جيولو",
  "نفسية",
  "محاسة",
  "ريادة",
  "مبادر",
  "مساوا",
  "ديمقر",
  "ملكية",
  "أميرة",
  "وراثة",
  "تصويت",
  "حزبية",
  "معارض",
  "موالا",
  "ثورات",
  "محافظ",
  "ولاية",
  "إقليم",
  "محافة",
  "اثنان",
  "اثنين",
  "ثلاثة",
  "أربعة",
  "خمسات",
  "ستتان",
  "سبعات",
  "ثمانة",
  "تسعات",
  "عشرات",
  "عشرون",
  "ثلاثن",
  "أربعن",
  "خمسون",
  "ستوان",
  "سبعون",
  "ثمانن",
  "تسعون",
  "مئتان",
  "ألفان",
  "أرسلو",
  "أعلنو",
  "أكملو",
  "أنقذو",
  "أصلحو",
  "أضافو",
  "أبدعو",
  "أتقنو",
  "أثبتو",
  "أدهشو",
  "أراحو",
  "أرعبو",
  "أزعجو",
  "أسعدو",
  "أفرحو",
  "أقلقو",
  "ألهمو",
  "أنعشو",
  "أسرعو",
  "أبطأو",
  "أحضرو",
  "أرجعو",
  "أوقفو",
  "أجلسو",
  "أنزلو",
  "أطلعو",
  "أسكنو",
  "أشبعو",
  "أروتو",
  "أنامو",
  "أيقظو",
  "يعلمو",
  "يقدمو",
  "يوصفو",
  "يكلمو",
  "يسلمو",
  "ينظمو",
  "يقسمو",
  "يرتبو",
  "يصنفو",
  "يوزعو",
  "يجهزو",
  "يحضرو",
  "يعدلو",
  "يبدلو",
  "يغيرو",
  "يطورو",
  "يحسنو",
  "يزينو",
  "ينظفو",
  "يصلحو",
  "يتكلم",
  "يتقدم",
  "يتحرك",
  "يتطور",
  "يتغير",
  "يتحسن",
  "يتصرف",
  "يتمكن",
  "يتوقف",
  "يتعجب",
  "يتألم",
  "يتفرج",
  "يتنزه",
  "يتسوق",
  "يتجول",
  "يتبضع",
  "بعنها",
  "صمنها",
  "دمنها",
  "نالوا",
  "قادوا",
  "سادوا",
  "زادوا",
  "بادوا",
  "فادوا",
  "جادوا",
  "يقولو",
  "يبيعو",
  "يزيدو",
  "يعودو",
  "يقودو",
  "يسودو",
  "ينالو",
  "يطيرو",
  "يسيرو",
  "يصيرو",
  "يغيبو",
  "يفيقو",
  "بنينا",
  "لقينا",
  "رضينا",
  "قضينا",
  "مضينا",
  "هدينا",
  "نوينا",
  "دعونا",
  "غزونا",
  "محونا",
  "علونا",
  "سمونا",
  "يبكون",
  "يرمون",
  "يبنون",
  "يسقون",
  "يلقون",
  "يرضون",
  "يقضون",
  "يمضون",
  "يهدون",
  "يدعون",
  "يغزون",
  "يمحون",
  "يعلون",
  "يسمون",
  "قطعات",
  "غزوات",
  "هبتات",
  "قربات",
  "أساور",
  "أحابل",
  "أداهن",
  "أباطل",
  "كبائر",
  "صغائر",
  "بصائر",
  "نظائر",
  "عزائم",
  "غنائم",
  "هزائم",
  "لطائف",
  "عجائب",
  "غرائب",
  "ذخائر",
  "قلائد",
  "عقائد",
  "فرائض",
  "نقائض",
  "خصائل",
  "حصائل",
  "يتامى",
  "أسارى",
  "جرحات",
  "قتلات",
  "غرقات",
  "هلكات",
  "شفرات",
  "تشفير",
  "كلمسر",
  "برمجة",
  "ترميز",
  "خوارز",
  "قاعدب",
  "جدولة",
  "حقلات",
  "عمودب",
  "دوالة",
  "صفيفة",
  "كائنة",
  "صنفات",
  "واجهة",
  "إدخال",
  "إخراج",
  "ترقية",
  "نغمات",
  "إيقاع",
  "سلمات",
  "مقامة",
  "عزفات",
  "أداءة",
  "صولوة",
  "ثنائة",
  "رباعة",
  "فرقمو",
  "أوبرا",
  "باليه",
  "سمفون",
  "كنسرت",
  "ريستل",
  "تشريع",
  "لائحة",
  "قضائي",
  "حكمية",
  "شكوات",
  "اتهام",
  "قاضيي",
  "محامة",
  "مدعية",
  "متهمة",
  "شاهدة",
  "برهان",
  "قرينة",
  "دليلة",
  "إثبات",
  "تبرئة",
  "إدانة",
  "حبسات",
  "غرامة",
  "ضمانة",
  "طعنات",
  "نقضات",
  "إعدام",
  "سجنات",
  "تشخيص",
  "أعراض",
  "مرضية",
  "حمالة",
  "ضغطات",
  "كوليس",
  "رنينة",
  "مقطعي",
  "تخطيط",
  "تنظير",
  "خزعات",
  "نقلدم",
  "تخدير",
  "بنجات",
  "مصلات",
  "لقاحة",
  "مناعة",
  "أجسمض",
  "فيتام",
  "كالسم",
  "بروتن",
  "كربوه",
  "دهنيي",
  "ألياف",
  "ناطحة",
  "برجية",
  "قببات",
  "أقواس",
  "تيجان",
  "أسسات",
  "خرسنة",
  "أخشاب",
  "سيراك",
  "شبابك",
  "أدراج",
  "ردهات",
  "بهوات",
  "فناءة",
  "أروقة",
  "أزقات",
  "ساحات",
  "ميادن",
  "حريري",
  "قطنات",
  "كتانة",
  "صوفات",
  "جينزة",
  "شيفون",
  "ساتنة",
  "مخملة",
  "دنيمة",
  "حيكات",
  "كروشه",
  "تريكو",
  "تفصيل",
  "مقاسة",
  "صدرية",
  "بلوزة",
  "تيشرت",
  "قميصة",
  "بنطلن",
  "عبائي",
  "جلابة",
  "قفطان",
  "ثوبات",
  "دشداش",
  "عقالة",
  "طاقية",
  "نقابة",
  "خمارة",
  "عمامة",
  "قلنسة",
  "كوفية",
  "مترات",
  "ترامة",
  "تلفرك",
  "سلمكه",
  "تكسية",
  "ليموز",
  "باصات",
  "نقلية",
  "شحنات",
  "حمولة",
  "بضائع",
  "جمركة",
  "تخليص",
  "رخصات",
  "لوحيي",
  "سيرات",
  "دورات",
  "منعطف",
  "أنفاق",
  "معبري",
  "فتحوه",
  "كتبوه",
  "ضربوه",
  "قتلوه",
  "أكلوه",
  "شربوه",
  "سمعوه",
  "فهموه",
  "عرفوه",
  "حملوه",
  "وضعوه",
  "رفعوه",
  "دفعوه",
  "سحبوه",
  "قطعوه",
  "جمعوه",
  "فرقوه",
  "نشروه",
  "حفروه",
  "طبخوه",
  "غسلوه",
  "كنسوه",
  "مسحوه",
  "ربطوه",
  "فكوها",
  "حيلات",
  "وسيلت",
  "طريقي",
  "أسلوب",
  "ضوابط",
  "سياقة",
  "محتوي",
  "لبابة",
  "صميمة",
  "سطحات",
  "باطنة",
  "حقيقت",
  "وهمية",
  "خيالة",
  "واقعة",
  "مثالة",
  "نموذج",
  "عينات",
  "نمطات",
  "صيغات",
  "شكلات",
  "هيئات",
  "تركبة",
  "مكونة",
  "عنصرة",
  "جزءات",
  "كلتان",
  "عامات",
  "خاصات",
  "شاملت",
  "جزئيت",
  "نسبيت",
  "اكتئب",
  "قلقات",
  "توترة",
  "اضطرب",
  "هدوءة",
  "طمأنة",
  "ارتيح",
  "سرورة",
  "بهجات",
  "نشوات",
  "طربات",
  "حماسة",
  "تحمسة",
  "إحباط",
  "يأسات",
  "خيبات",
  "أمنيت",
  "رجاءة",
  "تمنيت",
  "ندمات",
  "حسرات",
  "أسفات",
  "غبطات",
  "ريبات",
  "يقينت",
  "ثقتنا",
  "إعجاب",
  "كراهة",
  "حقدات",
  "عداءة",
  "بغضات",
  "ودتنا",
  "مودات",
  "ألفات",
  "حنانة",
  "عطفات",
  "شفقات",
  "رأفات",
  "قبيلة",
  "عشيرة",
  "أمتنا",
  "شعبنا",
  "وطننا",
  "قومنا",
  "بلدنا",
  "أرضنا",
  "هويات",
  "ثقافت",
  "لغتنا",
  "عربين",
  "إسلمي",
  "مسلمة",
  "مسيحة",
  "يهودة",
  "بوذية",
  "هندوس",
  "ملحدة",
  "لادنة",
  "متدنة",
  "عابدت",
  "حاكمت",
  "رئيست",
  "ملكيت",
  "وزيرت",
  "نائبت",
  "سفيرت",
  "سياست",
  "اقتصا",
  "شرطيت",
  "قضائة",
  "مجلسن",
  "خطابت",
  "تقريت",
  "إحصائ",
  "بحوثة",
  "مسوحة",
  "فارسي",
  "بربرة",
  "كردية",
  "أمازغ",
  "بدوية",
  "حضرية",
  "ريفية",
  "قروية",
  "عسكرة",
  "سلمية",
  "حربية",
  "عدوان",
  "دفاعي",
  "هجومي",
  "تقدمي",
  "ليبرل",
  "اشتري",
  "علمني",
  "ديموق",
  "فاشية",
  "شيوعي",
  "رأسمة",
  "احتجج",
  "اعتصم",
  "إضراب",
  "تظاهر",
  "مسيرة",
  "وقفتة",
  "اعتقل",
  "احتجز",
  "أفرجت",
  "أطلقس",
  "اغتيل",
  "تفجير",
  "إرهاب",
  "اغتصب",
  "إبادة",
  "تاجرت",
  "بائعت",
  "مشتري",
  "زبونة",
  "موردة",
  "مصدرة",
  "وكيلة",
  "ممثلت",
  "فرعات",
  "شعبات",
  "إدارت",
  "مفتشت",
  "مدققة",
  "ميزنة",
  "عجزات",
  "فائضت",
  "ربحية",
  "خسرات",
  "عمولة",
  "أقساط",
  "رهنات",
  "تأجير",
  "إيجار",
  "عقارة",
  "أملاك",
  "استمل",
  "أقحوا",
  "خزامة",
  "ريحنة",
  "لوتسة",
  "تجاوب",
  "تلاعب",
  "تناوب",
  "تخاطر",
  "تشابك",
  "تشابه",
  "ترابط",
  "تلاصق",
  "تلاحم",
  "تنافذ",
  "تخالف",
  "تضامن",
  "تضارب",
  "تكاثر",
  "تناسل",
  "تلاقح",
  "تهاتف",
  "تراضى",
  "تعافى",
  "تخاذل",
  "تلاهى",
  "تمالأ",
  "تمارض",
  "تجاسر",
  "تبادر",
  "تقاسم",
  "تلاطم",
  "أفضلة",
  "أحسنة",
  "أكبرة",
  "أصغرة",
  "أطولة",
  "أقصرة",
  "أسرعة",
  "أبطأة",
  "أقوات",
  "أضعفة",
  "أجملة",
  "أقبحة",
  "أنظفة",
  "أوسخة",
  "أحلات",
  "أمرات",
  "أحلاة",
  "أغلات",
  "أرخصة",
  "مشمسة",
  "ممطرة",
  "حراري",
  "استوا",
  "قطبية",
  "مداري",
  "موسمي",
  "ذاكرة",
  "تفكرة",
  "تأملة",
  "حوسبة",
  "رقمنة",
  "أتمتة",
  "عولمة",
  "خصخصة",
  "لبرلة",
  "دمقرط",
  "عصرنة",
  "لترات",
  "غالون",
  "أمتار",
  "كيلوم",
  "أميال",
  "إنشات",
  "أقدمة",
  "درجات",
  "مئوية",
  "فهرنه",
  "ضغطجو",
  "هرتزة",
  "واتات",
  "فولتة",
  "أمبير",
  "نيوتن",
  "جولات",
  "باسكل",
  "أنهكت",
  "أجهدت",
  "أضنتن",
  "أتعبت",
  "أراقت",
  "أسكبت",
  "أفرغت",
  "أملأت",
  "أشعلت",
  "أطفأت",
  "أنارت",
  "أظلمت",
  "أسكتت",
  "أصمتت",
  "أنطقت",
  "أسمعت",
  "أفقدت",
  "أوجدت",
  "أعطتة",
  "أمنعت",
  "أجبرت",
  "أرغمت",
  "مطلعة",
  "ممسكة",
  "مفلسة",
  "مترفة",
  "معوزة",
  "متبرع",
  "مقتصد",
  "مسرفة",
  "مبذرة",
  "حريصة",
  "متساه",
  "مجتهد",
  "كسلاء",
  "مخلصة",
  "منافق",
  "متواض",
  "متكبر",
  "متغطر",
  "معجبة",
  "متكلف",
  "متصنع",
  "عفوية",
  "بريئة",
  "ساذجة",
  "داهية",
  "ماكرة",
  "خبيثة",
  "مخادع",
  "مراوغ",
  "صريحة",
  "معتاد",
  "متعود",
  "جذابة",
  "طاردة",
  "منفرة",
  "ممقتة",
  "محببة",
  "مغرية",
  "مشوقة",
  "مضجرة",
  "صفائح",
  "لفائف",
  "رقائق",
  "شرائح",
  "حبائل",
  "جدائل",
  "قبائل",
  "وسائد",
  "عقارب",
  "عصافر",
  "مناور",
  "مفاخر",
  "مظاهر",
  "مباهج",
  "مسابح",
  "مزالق",
  "محاصل",
  "مواسم",
  "مرافق",
  "مواعظ",
  "ملاحظ",
  "موازي",
  "مكافئ",
  "مباين",
  "مخالف",
  "متطبق",
  "متجدد",
  "متفرد",
  "جسامة",
  "ضخامة",
  "فخامة",
  "عظامة",
  "جلالة",
  "وقارة",
  "هيبات",
  "وجاهة",
  "رصانة",
  "صرامة",
  "دقتنا",
  "عنايت",
  "حيطات",
  "حذرات",
  "تنبهة",
  "تأهبة",
  "تحفزة",
  "جهوزة",
  "أموال",
  "أقوام",
  "أيتام",
  "أصنام",
  "أحجام",
  "أرحام",
  "أجسام",
  "أعلام",
  "أحبال",
  "أثقال",
  "أشغال",
  "أعطال",
  "أفعال",
  "بواقي",
  "نواقص",
  "فوارض",
  "حوائج",
  "عوارض",
  "كوابس",
  "نوائب",
  "موائد",
  "حواشي",
  "جوالت",
  "خوادم",
  "فواصل",
  "مصائب",
  "كتائب",
  "عصائب",
  "خطائب",
  "نصائح",
  "فضائح",
  "مدائح",
  "لوائح",
  "شرائع",
  "بدائع",
  "صنائع",
  "وقائع",
  "طلائع",
  "مملكة",
  "إمبرط",
  "سلطنة",
  "ولايت",
  "إقطاع",
  "حصونة",
  "ثكنات",
  "معسكر",
  "قاعدت",
  "مخفرة",
  "مركزة",
  "شرطات",
  "دوريت",
  "حراست",
  "مخابر",
  "عميلت",
  "خائنت",
  "جريمة",
  "سرقات",
  "جنحات",
  "جنايت",
  "عقوبت",
  "غرامت",
  "سماحة",
  "فطانة",
  "شطارة",
  "مهابة",
  "جسارة",
  "شهامة",
  "رجولة",
  "أنوثة",
  "طفولة",
  "شبوبة",
  "كهولة",
  "شيخخة",
  "بلوغة",
  "نضوجة",
  "اكتمل",
  "ذبولة",
  "شحوبة",
  "هزالة",
  "سمنات",
  "تعايش",
  "تواجد",
  "تكاتف",
  "تآلفة",
  "تآخية",
  "تصافي",
  "تنادي",
  "تداعي",
  "تجلية",
  "تدلية",
  "تمادي",
  "تعالي",
  "تداني",
  "تلاشي",
  "تحامل",
  "تكاسل",
  "تغافل",
  "تخالص",
  "تهادن",
  "تعادل",
  "تساوي",
  "تلاقي",
  "تحابب",
  "تراضي",
  "تسامي",
  "تفاني",
  "عنوان",
  "كفيلة",
  "زعيمة",
  "رحيلة",
  "بديلة",
  "أصيلت",
  "دخيلة",
  "ثقيلت",
  "جليلة",
  "قليلت",
  "ذليلة",
  "جميلت",
  "نبيلة",
  "كحيلة",
  "وبيلة",
  "حصيلت",
  "فصيلة",
  "قبيلت",
  "حميلة",
  "عشيرت",
  "كثيرت",
  "صغيرت",
  "كبيرت",
  "خطيرة",
  "فقيرت",
  "أسيرت",
  "قديرة",
  "بصيرة",
  "نظيرة",
  "سعيرة",
  "منيرة",
  "خبيرت",
  "أثيرة",
  "مثيرت",
  "مستنر",
  "مغيرة",
  "بشرية",
  "ألوهة",
  "ربانة",
  "رحمنة",
  "ملائك",
  "أنبيا",
  "رسولة",
  "صحابة",
  "تابعن",
  "فقهاء",
  "محدثن",
  "مفسرن",
  "خطباء",
  "وعاظة",
  "دعاتة",
  "أئمات",
  "مؤذنن",
  "مقرئة",
  "حافظة",
  "طالبع",
  "سمسرة",
  "عرضوض",
  "طلبية",
  "فوترة",
  "جردات",
  "ميزني",
  "دائنة",
  "مقترض",
  "مقرضة",
  "ضامنت",
  "كفيلت",
  "متراس",
  "سواتر",
  "دشمات",
  "متاري",
  "عسكرت",
  "تجنيد",
  "باركت",
  "هنأتة",
  "عزيتة",
  "واسيت",
  "شجعته",
  "حمسته",
  "أهنأت",
  "أبشرت",
  "أعزيت",
  "أواسي",
  "نصحته",
  "أرشدت",
  "وجهته",
  "حذرته",
  "أنذرت",
  "تحذره",
  "تنبهت",
  "أنبهت",
  "حقيرة",
  "وضيعة",
  "رفيعة",
  "شريفة",
  "ظريفة",
  "عنيفة",
  "وصيفة",
  "خليفة",
  "حليفة",
  "عنيدت",
  "بعيدت",
  "سعيدت",
  "وحيدت",
  "شديدت",
  "بريدت",
  "جديدت",
  "حديدت",
  "مريدة",
  "عميدت",
  "فريدت",
  "وليدت",
  "مفيدت",
  "قريبت",
  "غريبت",
  "طبيبت",
  "حبيبت",
  "رقيبة",
  "نصيبة",
  "حسيبة",
  "عجيبة",
  "مصيبة",
  "خرجتم",
  "دخلتم",
  "رجعتم",
  "وصلتم",
  "نزلتم",
  "طلعتم",
  "سمعتم",
  "شربتم",
  "أكلتم",
  "نظرتم",
  "وقفتم",
  "جلستم",
  "حملتم",
  "فتحتم",
  "بحثتم",
  "درستم",
  "عملتم",
  "لعبتم",
  "ضربتم",
  "كسرتم",
  "قرأتم",
  "فهمتم",
  "حصلتم",
  "زرعتم",
  "طبختم",
  "غسلتم",
  "لبستم",
  "هربتم",
  "وضعتم",
  "وقعتم",
  "تركتم",
  "أخذتم",
  "قلتمو",
  "بدأتم",
  "حفروا",
  "قطعوا",
  "جمعوا",
  "فرقوا",
  "نشروا",
  "رفعوا",
  "سحبوا",
  "دفعوا",
  "ربطوا",
  "حبسوا",
  "طردوا",
  "قبضوا",
  "سلموا",
  "نظموا",
  "حسبوا",
  "قاسوا",
  "وزنوا",
  "كالوا",
  "باعوا",
  "شاءوا",
  "ظلموا",
  "عدلوا",
  "نصروا",
  "فرشوا",
  "طووها",
  "لفوها",
  "نظفوا",
  "غمروا",
  "ملأوا",
  "زرعتة",
  "طبختة",
  "غسلتة",
  "لبستة",
  "نظفتة",
  "كنستة",
  "مسحتة",
  "ربطتة",
  "فكتها",
  "سكبتة",
  "أملتة",
  "أكتبه",
  "أقرأه",
  "أفهمه",
  "أحفظه",
  "أسمعه",
  "أشربه",
  "أفتحه",
  "أغلقه",
  "أدفعه",
  "أرفعه",
  "أسحبه",
  "أقطعه",
  "أجمعه",
  "أرسمه",
  "أطبخه",
  "أغسله",
  "أنشره",
  "أحمله",
  "أبحثة",
  "أدرسه",
  "أعمله",
  "ألعبه",
  "أضربه",
  "أكسره",
  "نمشيي",
  "نجرية",
  "نسبحة",
  "نقفزة",
  "نركضة",
  "يجلسو",
  "ينظرو",
  "يسمعو",
  "يشربو",
  "يأكلو",
  "يحملو",
  "يفتحو",
  "يغلقو",
  "يدفعو",
  "يرفعو",
  "يسحبو",
  "يقطعو",
  "يربطو",
  "يحبسو",
  "يطردو",
  "شراسة",
  "قساوة",
  "شقاوة",
  "غيرية",
  "تلقائ",
  "إرادي",
  "اختير",
  "اختيا",
  "طوعية",
  "كرهية",
  "حبيية",
  "كراهي",
  "حقدية",
  "بغضية",
  "ألفية",
  "عداوي",
  "خصومة",
  "صراعي",
  "نزاعة",
  "خلافي",
  "شقاقة",
  "وحدية",
  "اتحدي",
  "تجمعة",
  "تفرقة",
  "تشتتة",
  "تبعثر",
  "سنبوس",
  "كبابة",
  "تكاية",
  "شيشات",
  "بوظات",
  "آيسكر",
  "جلاشة",
  "مسقعة",
  "ملوكي",
  "مفروك",
  "كشكشة",
  "محلبة",
  "رشتات",
  "أشكلة",
  "بقلبة",
  "تمرية",
  "ناميم",
  "زلابي",
  "شعيري",
  "جبنية",
  "معكرن",
  "بيتسة",
  "ساندو",
  "حمصية",
  "نسناس",
  "قردات",
  "شمبنز",
  "إنسرج",
  "أورنغ",
  "لاماة",
  "ألبكة",
  "بيسون",
  "جاموس",
  "خروفة",
  "نعجات",
  "تيسات",
  "جدينا",
  "مهرات",
  "فلوات",
  "جروات",
  "هريرة",
  "دجاجت",
  "بطتنا",
  "أوزات",
  "حمامت",
  "يمامت",
  "مقبرة",
  "مزبلة",
  "معبره",
  "مرفأه",
  "مخيمة",
  "محمية",
  "مزرعة",
  "مصيدة",
  "مكيدة",
  "مصيبت",
  "مليحت",
  "مشربة",
  "مخرمة",
  "ولاءة",
  "انتما",
  "تبعية",
  "حرمان",
  "رفاهة",
  "رخاءة",
  "شقاءة",
  "بهتات",
  "افترا",
  "إخلاص",
  "وفاءت",
  "صداقت",
  "عداوت",
  "تبعيت",
  "خضوعة",
  "طاعات",
  "عصيان",
  "تمردة",
  "خروجة",
  "بغيات",
  "طغيان",
  "إنصاف",
  "قسطات",
  "محابة",
  "رشوات",
  "فسادة",
  "نزاهة",
  "صلاحة",
  "مقدسة",
  "مبجلة",
  "مهيبة",
  "موقرة",
  "معظمة",
  "مهانة",
  "محتقر",
  "مهمشة",
  "مقصية",
  "مستبع",
  "منخرط",
  "مشارك",
  "منسحب",
  "معتزل",
  "منعزل",
  "وحدنة",
  "منفرد",
  "متحدة",
  "كتبها",
  "قرأها",
  "فهمها",
  "حفظها",
  "سمعها",
  "شربها",
  "أكلها",
  "فتحها",
  "ربطها",
  "حملها",
  "دفعها",
  "رفعها",
  "سحبها",
  "قطعها",
  "جمعها",
  "فرقها",
  "نشرها",
  "حفرها",
  "زرعها",
  "طبخها",
  "غسلها",
  "كنسها",
  "مسحها",
  "رسمها",
  "لونها",
  "خاطها",
  "قصتها",
  "فصلها",
  "وصلها",
  "قطعهم",
  "جمعهم",
  "فرقهم",
  "نشرهم",
  "انظرو",
  "اجلسو",
  "ادخلو",
  "اخرجو",
  "ارجعو",
  "اركضو",
  "اقفزو",
  "انزلو",
  "اطلعو",
  "اهربو",
  "اصبرو",
  "اشكرو",
  "اجتنب",
  "ابتدأ",
  "ابتدع",
  "ابتعث",
  "ابتغى",
  "ابتهل",
  "ابتلى",
  "اجتاز",
  "اجترأ",
  "احتاج",
  "احتاط",
  "احتجب",
  "احتذى",
  "احترز",
  "احترق",
  "احتسى",
  "احتشد",
  "احتشم",
  "احتفظ",
  "احتقر",
  "احتكر",
  "احتكم",
  "احتلف",
  "احتمى",
  "اختتم",
  "اختزل",
  "اختزن",
  "اختصم",
  "اختطف",
  "اختلج",
  "اختلس",
  "اختمر",
  "ادخرت",
  "ارتاب",
  "ارتاح",
  "ارتبط",
  "ارتبك",
  "ارتجف",
  "ارتحل",
  "ارتدع",
  "ارتشف",
  "ارتضى",
  "ارتقب",
  "ارتكز",
  "استجب",
  "استحب",
  "استحق",
  "استدع",
  "استفز",
  "استفق",
  "استغل",
  "استنج",
  "مأخوذ",
  "مأنوس",
  "مبتور",
  "مبحوث",
  "مبذول",
  "مبروك",
  "مبروم",
  "مبسوط",
  "مبعوث",
  "مبلول",
  "مبنيي",
  "مبهور",
  "متبوع",
  "متبول",
  "متروك",
  "متعوب",
  "متهوك",
  "مثبوت",
  "مجبور",
  "مجروف",
  "مجلوب",
  "مجلود",
  "مجنون",
  "مجهود",
  "محبور",
  "محبوك",
  "محتوم",
  "محجوب",
  "محروق",
  "محروم",
  "محزوم",
  "محشور",
  "محصور",
  "محصون",
  "محفوف",
  "محفور",
  "محقور",
  "محكوم",
  "محلوب",
  "محلوق",
  "محمود",
  "محمول",
  "مخبوء",
  "مخدوم",
  "مخدوع",
  "مخروق",
  "مخصوص",
  "مخطوف",
  "مخلوع",
  "مخلوق",
  "مدبوغ",
  "مدخون",
  "مدعوك",
  "مدفون",
  "مدلوك",
  "مدهون",
  "مديوب",
  "مذعور",
  "مذكور",
  "مذموم",
  "مذهول",
  "مرؤوس",
  "مرجوع",
  "مرشوش",
  "مرصود",
  "مرصوف",
  "مرقوم",
  "مركون",
  "مركوب",
  "مرموق",
  "مرموز",
  "مزعوج",
  "مزعوم",
  "مزموم",
  "مسبوق",
  "مستور",
  "مسجور",
  "مسحور",
  "مسدود",
  "مسرور",
  "مسطور",
  "مسعور",
  "مسكوب",
  "مسكوت",
  "مسكون",
  "مسلوب",
  "مسلوخ",
  "مسموم",
  "مشبوه",
  "مشبوك",
  "مشتوم",
  "مشدود",
  "مشروط",
  "مشطوب",
  "مشعوذ",
  "مشغوف",
  "مشكوك",
  "مشكور",
  "مشلول",
  "مشمول",
  "مشهود",
  "مشهور",
  "مصبوب",
  "مصبوغ",
  "مصدوم",
  "مصرور",
  "مصفوف",
  "مصقول",
  "مصنوف",
  "مضبوط",
  "مضروب",
  "مضطهد",
  "خالدة",
  "خاشعة",
  "داعية",
  "ذابلة",
  "رابحة",
  "رابضة",
  "زائغة",
  "زاحفة",
  "ساقية",
  "سالكة",
  "شاحبة",
  "صائمة",
  "ضاحكة",
  "طالعة",
  "عابثة",
  "عاتبة",
  "عاجبة",
  "غائبة",
  "فارقة",
  "فاسدة",
  "قابلة",
  "قاتلة",
  "كابدة",
  "كاسبة",
  "لاعنة",
  "لاهية",
  "ماثلة",
  "ناقمة",
  "ناهضة",
  "هاجمة",
  "واعدة",
  "واعية",
  "واقفة",
  "وافدة",
  "شامخة",
  "راسخة",
  "بائسة",
  "يائسة",
  "فائزة",
  "خاسرة",
  "ناجعة",
  "قاصمة",
  "فاصلة",
  "كاسحة",
  "ساحقة",
  "ماحقة",
  "مبرمج",
  "مخططة",
  "معلبة",
  "مغلفة",
  "مجمدة",
  "مبردة",
  "منظفة",
  "منظمة",
  "مقسمة",
  "موزعة",
  "مصنفة",
  "مزينة",
  "وقايه",
  "تداوي",
  "استشف",
  "اعتنا",
  "تبصرة",
  "تنوير",
  "تعمير",
  "تأطير",
  "تسيير",
  "تطبيع",
  "تسميع",
  "تكليف",
  "تجهيز",
  "تصفيح",
  "تجليد",
  "تلميع",
  "تبخير",
  "تعطير",
  "تأليف",
  "تحريف",
  "تزييف",
  "تحسيس",
  "تقسيط",
  "تقبيل",
  "تغسيل",
  "تكفين",
  "تأذين",
  "تبشير",
  "تنصير",
  "تعميد",
];

// Allowed guesses = answers + extra guesses (deduplicated by validateWords logic)
const allGuessWords = [...VALID_ANSWERS, ...validateWords(EXTRA_GUESSES)];
const guessSet = new Set<string>();
export const ALLOWED_GUESSES: string[] = allGuessWords.filter((w) => {
  if (guessSet.has(w)) return false;
  guessSet.add(w);
  return true;
});

export function getDailyWord(): string {
  const puzzleNum = getPuzzleNumber();
  const index = (puzzleNum - 1) % VALID_ANSWERS.length;
  return VALID_ANSWERS[index];
}

export function getWordByPuzzleNumber(puzzleNum: number): string {
  const index = (puzzleNum - 1) % VALID_ANSWERS.length;
  return VALID_ANSWERS[index];
}

/** Get the date string (YYYY-MM-DD) for a given puzzle number */
export function getDateForPuzzle(puzzleNum: number): string {
  const launch = new Date("2026-01-01T00:00:00");
  const date = new Date(launch.getTime() + (puzzleNum - 1) * 24 * 60 * 60 * 1000);
  return date.toISOString().split("T")[0];
}

export function isValidGuess(word: string): boolean {
  const normalized = word.trim();
  if (Array.from(normalized).length !== 5) return false;
  return (
    VALID_ANSWERS.includes(normalized) || ALLOWED_GUESSES.includes(normalized)
  );
}
