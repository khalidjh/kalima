import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

import FirebaseInit from "@/components/FirebaseInit";
import { AuthProvider } from "@/lib/auth";
import HeaderAuth from "@/components/HeaderAuth";

export const metadata: Metadata = {
  title: "كلمة - لعبة الكلمات العربية اليومية",
  description: "العب كلمة — لعبة تخمين الكلمات العربية اليومية. خمّن الكلمة في 6 محاولات وشارك نتيجتك. لغز جديد كل يوم!",
  keywords: ["لعبة كلمات عربية", "كلمة اليوم", "wordle عربي", "لعبة تخمين", "ألعاب عربية", "كلمة", "kalima"],
  metadataBase: new URL("https://kalima.fun"),
  alternates: { canonical: "https://kalima.fun" },
  openGraph: {
    title: "كلمة - لعبة الكلمات العربية اليومية",
    description: "خمّن الكلمة العربية في 6 محاولات. لغز جديد كل يوم!",
    url: "https://kalima.fun",
    siteName: "كلمة",
    locale: "ar_SA",
    type: "website",
    images: [{ url: "/kalima-logo.png", width: 500, height: 500, alt: "كلمة" }],
  },
  twitter: {
    card: "summary",
    title: "كلمة - لعبة الكلمات العربية اليومية",
    description: "خمّن الكلمة العربية في 6 محاولات. لغز جديد كل يوم!",
    images: ["/kalima-logo.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Cairo+Play:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#0A0A0A" />
        <script
          defer
          data-domain="kalima.fun"
          src="https://plausible.io/js/script.js"
        ></script>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="كلمة" />
      </head>
      <body
        className="bg-background text-white font-arabic antialiased overflow-hidden flex flex-col h-dvh"
      >
        <AuthProvider>
          {/* Kalima brand header */}
          <header
            className="flex-shrink-0 h-12 bg-[#0A0A0A] flex items-center justify-between px-4 border-b border-[#2A2A2A]"
            dir="rtl"
          >
            <Link href="/home" className="flex items-center gap-2.5">
              {/* ك tile mark */}
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <span
                  className="text-[#0A0A0A] font-bold text-lg leading-none"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  ك
                </span>
              </div>
              {/* كلمة wordmark */}
              <span className="text-white font-bold text-xl tracking-wide animate-shimmer">
                كلمة
              </span>
            </Link>

            {/* Pro link + Login */}
            <div className="flex items-center gap-2">
              <Link
                href="/pro"
                className="text-xs font-bold text-primary border border-primary/40 rounded-lg px-2.5 py-1 hover:bg-primary/10 transition-colors"
              >
                ✦ Pro
              </Link>
              <HeaderAuth />
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {children}
          </div>
          <FirebaseInit />
        </AuthProvider>
      </body>
    </html>
  );
}
