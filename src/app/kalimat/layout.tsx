import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "كلمات - ألعاب تعليمية",
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
      className="h-full min-h-0 overflow-y-auto relative flex flex-col"
      dir="rtl"
      style={
        {
          background: "#FFF8F0",
          color: "#2D3436",
          "--kids-bg": "#FFF8F0",
          "--kids-surface": "#FFFFFF",
          "--kids-primary": "#4A90D9",
          "--kids-blue": "#4A90D9",
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
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3) translateY(20px); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-6deg); }
          30% { transform: rotate(6deg); }
          45% { transform: rotate(-4deg); }
          60% { transform: rotate(4deg); }
          75% { transform: rotate(-2deg); }
          90% { transform: rotate(2deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 0px transparent); }
          50% { filter: brightness(1.1) drop-shadow(0 0 8px rgba(255,255,255,0.4)); }
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(6px, -4px) scale(1.02); }
          50% { transform: translate(-4px, -8px) scale(0.98); }
          75% { transform: translate(-6px, 2px) scale(1.01); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes wave-bob {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-4px) rotate(2deg); }
        }
        .kids-dotted-bg {
          background-image: radial-gradient(circle, #f0e6d9 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>

      {/* Dotted pattern overlay */}
      <div className="kids-dotted-bg fixed inset-0 pointer-events-none opacity-40" />

      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <span
          className="absolute text-2xl"
          style={{ top: "12%", right: "8%", animation: "twinkle 3s ease-in-out infinite", animationDelay: "0s" }}
        >
          ✨
        </span>
        <span
          className="absolute text-xl"
          style={{ top: "25%", left: "5%", animation: "float-slow 5s ease-in-out infinite", animationDelay: "1s" }}
        >
          📖
        </span>
        <span
          className="absolute text-lg"
          style={{ top: "45%", right: "4%", animation: "twinkle 4s ease-in-out infinite", animationDelay: "2s" }}
        >
          ✏️
        </span>
        <span
          className="absolute text-2xl"
          style={{ top: "60%", left: "7%", animation: "float-slow 6s ease-in-out infinite", animationDelay: "0.5s" }}
        >
          📖
        </span>
        <span
          className="absolute text-sm"
          style={{ top: "70%", right: "12%", animation: "twinkle 3.5s ease-in-out infinite", animationDelay: "1.5s" }}
        >
          ✨
        </span>
        <span
          className="absolute text-lg"
          style={{ top: "85%", left: "15%", animation: "drift 7s ease-in-out infinite", animationDelay: "3s" }}
        >
          ✏️
        </span>
      </div>

      {/* Compact header */}
      <header
        className="relative z-10 flex items-center justify-between px-4 py-2"
        style={{
          background: "linear-gradient(135deg, #FF922B 0%, #FF6B6B 50%, #E64980 100%)",
        }}
      >
        <Link href="/kalimat" className="flex items-center gap-2 group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95"
            style={{
              background: "linear-gradient(135deg, #FF922B, #FF6B6B)",
              boxShadow: "0 2px 8px rgba(255,146,43,0.3)",
            }}
          >
            <span className="text-[#FFF8F0] font-bold text-lg leading-none" style={{ fontFamily: "'Cairo', sans-serif" }}>ك</span>
          </div>
          <div>
            <span className="text-white font-black text-lg block leading-tight" style={{ letterSpacing: "0.5px" }}>
              Kalimat
            </span>
            <span className="text-white/60 text-[10px] font-medium">كلمات</span>
          </div>
        </Link>
      </header>

      {/* Page content */}
      <main className="relative z-10 flex-1 min-h-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
