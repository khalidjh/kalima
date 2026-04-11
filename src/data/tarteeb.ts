export interface TarteebPair {
  itemA: string;
  valueA: number;
  itemB: string;
  valueB: number;
  unit: string;
  category: string;
}

const ALL_PAIRS: TarteebPair[] = [
  // عدد السكان (مليون)
  { itemA: "القاهرة", valueA: 21, itemB: "الرياض", valueB: 7.6, unit: "مليون", category: "عدد سكان المدن" },
  { itemA: "الرياض", valueA: 7.6, itemB: "جدة", valueB: 4.6, unit: "مليون", category: "عدد سكان المدن" },
  { itemA: "جدة", valueA: 4.6, itemB: "دبي", valueB: 3.5, unit: "مليون", category: "عدد سكان المدن" },
  { itemA: "بغداد", valueA: 7.6, itemB: "عمّان", valueB: 4.2, unit: "مليون", category: "عدد سكان المدن" },
  { itemA: "الخرطوم", valueA: 5.3, itemB: "تونس", valueB: 2.6, unit: "مليون", category: "عدد سكان المدن" },
  { itemA: "صنعاء", valueA: 4, itemB: "الكويت", valueB: 3, unit: "مليون", category: "عدد سكان المدن" },
  { itemA: "الدوحة", valueA: 2.4, itemB: "بيروت", valueB: 2.4, unit: "مليون", category: "عدد سكان المدن" },
  { itemA: "مكة", valueA: 2, itemB: "الرباط", valueB: 1.9, unit: "مليون", category: "عدد سكان المدن" },
  { itemA: "أبوظبي", valueA: 1.5, itemB: "المدينة", valueB: 1.4, unit: "مليون", category: "عدد سكان المدن" },
  { itemA: "الجزائر", valueA: 3.4, itemB: "الدمام", valueB: 1.2, unit: "مليون", category: "عدد سكان المدن" },
  { itemA: "نواكشوط", valueA: 1.2, itemB: "مسقط", valueB: 1.4, unit: "مليون", category: "عدد سكان المدن" },
  { itemA: "القاهرة", valueA: 21, itemB: "بغداد", valueB: 7.6, unit: "مليون", category: "عدد سكان المدن" },

  // مساحة الدول (ألف كم²)
  { itemA: "الجزائر", valueA: 2381, itemB: "السعودية", valueB: 2150, unit: "ألف كم²", category: "مساحة الدول" },
  { itemA: "السعودية", valueA: 2150, itemB: "السودان", valueB: 1861, unit: "ألف كم²", category: "مساحة الدول" },
  { itemA: "السودان", valueA: 1861, itemB: "ليبيا", valueB: 1759, unit: "ألف كم²", category: "مساحة الدول" },
  { itemA: "ليبيا", valueA: 1759, itemB: "مصر", valueB: 1002, unit: "ألف كم²", category: "مساحة الدول" },
  { itemA: "مصر", valueA: 1002, itemB: "اليمن", valueB: 527, unit: "ألف كم²", category: "مساحة الدول" },
  { itemA: "اليمن", valueA: 527, itemB: "المغرب", valueB: 446, unit: "ألف كم²", category: "مساحة الدول" },
  { itemA: "المغرب", valueA: 446, itemB: "العراق", valueB: 438, unit: "ألف كم²", category: "مساحة الدول" },
  { itemA: "العراق", valueA: 438, itemB: "عمان", valueB: 309, unit: "ألف كم²", category: "مساحة الدول" },
  { itemA: "عمان", valueA: 309, itemB: "سوريا", valueB: 185, unit: "ألف كم²", category: "مساحة الدول" },
  { itemA: "سوريا", valueA: 185, itemB: "الأردن", valueB: 89, unit: "ألف كم²", category: "مساحة الدول" },
  { itemA: "الأردن", valueA: 89, itemB: "الإمارات", valueB: 83, unit: "ألف كم²", category: "مساحة الدول" },
  { itemA: "فلسطين", valueA: 27, itemB: "الكويت", valueB: 17, unit: "ألف كم²", category: "مساحة الدول" },
  { itemA: "قطر", valueA: 11.6, itemB: "لبنان", valueB: 10.4, unit: "ألف كم²", category: "مساحة الدول" },
  { itemA: "لبنان", valueA: 10.4, itemB: "البحرين", valueB: 0.8, unit: "ألف كم²", category: "مساحة الدول" },

  // ارتفاع الأبراج (متر)
  { itemA: "برج خليفة", valueA: 828, itemB: "برج الساعة", valueB: 601, unit: "متر", category: "ارتفاع الأبراج" },
  { itemA: "برج الساعة", valueA: 601, itemB: "برج المملكة", valueB: 302, unit: "متر", category: "ارتفاع الأبراج" },
  { itemA: "برج المملكة", valueA: 302, itemB: "برج الفيصلية", valueB: 267, unit: "متر", category: "ارتفاع الأبراج" },
  { itemA: "برج الفيصلية", valueA: 267, itemB: "أهرام الجيزة", valueB: 146, unit: "متر", category: "ارتفاع الأبراج" },
  { itemA: "برج خليفة", valueA: 828, itemB: "أهرام الجيزة", valueB: 146, unit: "متر", category: "ارتفاع الأبراج" },

  // مسافات بين المدن (كم)
  { itemA: "الرياض - جدة", valueA: 950, itemB: "مكة - المدينة", valueB: 420, unit: "كم", category: "مسافات بين المدن" },
  { itemA: "مكة - المدينة", valueA: 420, itemB: "الرياض - الدمام", valueB: 400, unit: "كم", category: "مسافات بين المدن" },
  { itemA: "القاهرة - بيروت", valueA: 660, itemB: "دبي - أبوظبي", valueB: 130, unit: "كم", category: "مسافات بين المدن" },
  { itemA: "الرياض - جدة", valueA: 950, itemB: "القاهرة - بيروت", valueB: 660, unit: "كم", category: "مسافات بين المدن" },
];

/** Seeded pseudo-random based on date string */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function getTodaySeed(): number {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${now.getMonth()}${now.getDate()}`;
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = (Math.imul(31, h) + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getDailyTarteebPairs(): TarteebPair[] {
  const seed = getTodaySeed();
  const rng = seededRandom(seed);

  // Shuffle a copy and pick 10 unique pairs
  const shuffled = [...ALL_PAIRS]
    .map((p, i) => ({ p, sort: rng() }))
    .sort((a, b) => a.sort - b.sort)
    .map((x) => x.p);

  return shuffled.slice(0, 10);
}

export function getTarteebPuzzleNumber(): number {
  const epoch = new Date("2025-01-01").getTime();
  const now = new Date().getTime();
  return Math.floor((now - epoch) / (1000 * 60 * 60 * 24)) + 1;
}

/** For a pair, returns whether "higher" is the correct answer for itemB relative to itemA */
export function isHigherCorrect(pair: TarteebPair): boolean {
  return pair.valueB > pair.valueA;
}
