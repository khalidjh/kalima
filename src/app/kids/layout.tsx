import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "كلمة أطفال - ألعاب تعليمية للأطفال",
  description:
    "ألعاب تعليمية ممتعة للأطفال باللغة العربية. تعلم الحروف والأرقام والأشكال والألوان!",
};

export default function KidsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="h-full overflow-y-auto"
      dir="rtl"
      style={
        {
          background: "#FFF8F0",
          color: "#2D3436",
          "--kids-bg": "#FFF8F0",
          "--kids-surface": "#FFFFFF",
          "--kids-primary": "#4A90D9",
          "--kids-red": "#FF6B6B",
          "--kids-green": "#51CF66",
          "--kids-yellow": "#FFD43B",
          "--kids-purple": "#CC5DE8",
          "--kids-orange": "#FF922B",
          "--kids-pink": "#F06595",
          "--kids-text": "#2D3436",
          "--kids-muted": "#636E72",
        } as React.CSSProperties
      }
    >
      {/* Kids Header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-5 py-3"
        style={{
          background: "linear-gradient(135deg, #4A90D9 0%, #CC5DE8 100%)",
        }}
      >
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: "rgba(255,255,255,0.25)" }}
          >
            🌟
          </div>
          <span className="text-white font-bold text-2xl">كلمة أطفال</span>
        </div>

        {/* Back to main */}
        <Link
          href="/home"
          className="flex items-center gap-1.5 text-white/90 hover:text-white font-semibold text-sm px-4 py-2 rounded-2xl transition-colors"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <span>كلمة</span>
          <span>←</span>
        </Link>
      </header>

      {/* Page content */}
      {children}
    </div>
  );
}
