"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex-shrink-0 h-14 bg-surface border-t border-border"
      dir="rtl"
    >
      <div className="flex items-center justify-around h-full max-w-lg mx-auto px-4">
        {/* الرئيسية — Home hub */}
        <Link
          href="/home"
          className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors min-w-0 ${
            pathname === "/home" ? "text-primary-light" : "text-muted"
          }`}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span>الرئيسية</span>
        </Link>

        {/* حروف — Wordle game */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors min-w-0 ${
            pathname === "/" ? "text-primary-light" : "text-muted"
          }`}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <span>حروف</span>
        </Link>

        {/* روابط — Connections (locked) */}
        <button
          disabled
          className="flex flex-col items-center gap-0.5 text-xs font-medium text-muted opacity-40 cursor-not-allowed min-w-0"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
          <span>روابط</span>
        </button>
      </div>
    </nav>
  );
}
