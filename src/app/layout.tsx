import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import FirebaseInit from "@/components/FirebaseInit";

export const metadata: Metadata = {
  title: "كلمة - ألعاب الكلمات العربية اليومية",
  description: "خمّن الكلمة العربية اليومية في 6 محاولات",
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
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Arabic:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#6B35C8" />
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
        {/* Kalima brand header */}
        <header
          className="flex-shrink-0 h-12 bg-primary flex items-center px-4"
          dir="rtl"
        >
          <Link href="/home" className="flex items-center gap-2.5">
            {/* ك tile mark: white tile, purple letter */}
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <span
                className="text-primary font-bold text-lg leading-none"
                style={{ fontFamily: "'IBM Plex Arabic', sans-serif" }}
              >
                ك
              </span>
            </div>
            {/* كلمة wordmark */}
            <span className="text-white font-bold text-xl tracking-wide">
              كلمة
            </span>
          </Link>
        </header>

        {/* Page content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
        <FirebaseInit />

        {/* Bottom navigation */}
        <BottomNav />
      </body>
    </html>
  );
}
