import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

import FirebaseInit from "@/components/FirebaseInit";
import { AuthProvider } from "@/lib/auth";
import RootHeader from "@/components/RootHeader";

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
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#0A0A0A" />
        <script
          defer
          data-domain="kalima.fun"
          src="https://plausible.io/js/script.js"
        ></script>
        {/* Google Analytics */}
        {/* eslint-disable-next-line @next/next/next-script-for-ga */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-9R0XYH9YQG"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-9R0XYH9YQG');
        `}} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="كلمة" />
      </head>
      <body
        className={`${cairo.variable} bg-background text-white font-arabic antialiased overflow-hidden flex flex-col h-dvh`}
      >
        <AuthProvider>
          <RootHeader />
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
