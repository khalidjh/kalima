"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderAuth from "@/components/HeaderAuth";

export default function RootHeader() {
  const pathname = usePathname();

  // Hide root header on kalimat (kids) and launch pages for immersive experience
  if (pathname.startsWith("/kalimat") || pathname.startsWith("/launch")) {
    return null;
  }

  return (
    <header
      className="flex-shrink-0 h-12 bg-[#0A0A0A] flex items-center justify-between px-4 border-b border-[#2A2A2A]"
      dir="rtl"
    >
      <Link href="/home" className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
          <span
            className="text-[#0A0A0A] font-bold text-lg leading-none"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            ك
          </span>
        </div>
        <span className="text-white font-bold text-xl tracking-wide animate-shimmer">
          كلمة
        </span>
      </Link>

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
  );
}
