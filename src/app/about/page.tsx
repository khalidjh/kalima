import type { Metadata } from "next";
import Link from "next/link";
import BackToHome from "@/components/BackToHome";

export const metadata: Metadata = {
  title: "عن كلمة | kalima.fun",
  description:
    "كلمة هي لعبة تخمين كلمات عربية يومية مستوحاة من Wordle. خمّن الكلمة في 6 محاولات!",
  openGraph: {
    title: "عن كلمة",
    description:
      "كلمة هي لعبة تخمين كلمات عربية يومية مستوحاة من Wordle. خمّن الكلمة في 6 محاولات!",
    url: "https://kalima.fun/about",
  },
};

export default function AboutPage() {
  return (
    <div className="h-full overflow-y-auto" dir="rtl">
      <div className="max-w-lg mx-auto px-4 py-6">
        <BackToHome />

        {/* Header */}
        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-white">عن كلمة</h1>
          <p className="text-muted text-sm mt-2">kalima.fun</p>
        </div>

        <div className="space-y-4">
          {/* What is Kalima */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">ما هي كلمة؟</h2>
            <p className="text-muted text-sm leading-relaxed">
              كلمة هي لعبة يومية لتخمين الكلمات العربية، مستوحاة من لعبة Wordle
              الشهيرة. كل يوم تنتظرك كلمة عربية جديدة، وعندك 6 محاولات
              لتخمينها. بعد كل محاولة، تتغيّر ألوان الحروف لتدلّك على مدى
              قربك من الكلمة الصحيحة.
            </p>
          </div>

          {/* How to play */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">كيف تلعب؟</h2>
            <ul className="space-y-2 text-sm text-muted leading-relaxed">
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">1.</span>
                <span>اكتب كلمة عربية من 5 حروف واضغط إدخال.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">2.</span>
                <span>
                  الحرف <span className="text-primary font-semibold">الأخضر</span> في
                  مكانه الصحيح، و<span className="text-yellow-400 font-semibold">الأصفر</span> موجود
                  لكن في مكان آخر.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">3.</span>
                <span>عندك 6 محاولات لتكتشف الكلمة. لغز جديد كل يوم!</span>
              </li>
            </ul>
          </div>

          {/* Creator */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">صنعها خالد</h2>
            <p className="text-muted text-sm leading-relaxed mb-4">
              كلمة من تصميم وتطوير خالد. إذا عندك اقتراح أو ملاحظة، تواصل معي
              عبر أي من المنصات التالية:
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.instagram.com/khalidjh"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm bg-[#2A2A2A] hover:bg-[#333] text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://x.com/khalidjsah"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm bg-[#2A2A2A] hover:bg-[#333] text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                X / Twitter
              </a>
              <a
                href="https://www.linkedin.com/in/khalid-hammad-85612611b"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm bg-[#2A2A2A] hover:bg-[#333] text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Back to game */}
          <div className="pt-2 pb-8 text-center">
            <Link
              href="/"
              className="inline-block text-primary font-semibold text-sm hover:underline"
            >
              ارجع للعبة
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
