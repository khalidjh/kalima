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
      className="min-h-screen overflow-y-auto relative"
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
          ☁️
        </span>
        <span
          className="absolute text-lg"
          style={{ top: "45%", right: "4%", animation: "twinkle 4s ease-in-out infinite", animationDelay: "2s" }}
        >
          ⭐
        </span>
        <span
          className="absolute text-2xl"
          style={{ top: "60%", left: "7%", animation: "float-slow 6s ease-in-out infinite", animationDelay: "0.5s" }}
        >
          ☁️
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
          🌙
        </span>
      </div>

      {/* Playful wavy header */}
      <header className="relative z-10">
        <div
          className="relative px-5 pt-4 pb-10"
          style={{
            background: "linear-gradient(135deg, #4A90D9 0%, #9B59D9 40%, #CC5DE8 70%, #F06595 100%)",
          }}
        >
          <div className="flex items-center justify-between">
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{
                  background: "rgba(255,255,255,0.25)",
                  backdropFilter: "blur(8px)",
                  animation: "wave-bob 3s ease-in-out infinite",
                }}
              >
                🌟
              </div>
              <div>
                <span
                  className="text-white font-black text-2xl block"
                  style={{
                    textShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    letterSpacing: "0.5px",
                  }}
                >
                  كلمة أطفال
                </span>
                <span className="text-white/70 text-xs font-medium">نتعلّم ونلعب</span>
              </div>
            </div>

            {/* Back button */}
            <Link
              href="/home"
              className="flex items-center gap-1.5 text-white/80 hover:text-white font-semibold text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
            >
              <span>الرئيسية</span>
              <span>←</span>
            </Link>
          </div>
        </div>

        {/* Wavy bottom edge */}
        <svg
          viewBox="0 0 1440 60"
          className="w-full block -mt-px"
          style={{ color: "#FFF8F0" }}
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C360,60 720,60 1080,30 C1260,15 1380,40 1440,20 L1440,60 L0,60 Z"
            fill="currentColor"
          />
        </svg>
      </header>

      {/* Page content */}
      <main className="relative z-10 pb-16">
        {children}
      </main>
    </div>
  );
}
