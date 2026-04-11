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

        {/* روابط — Connections */}
        <Link
          href="/rawabet"
          className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors min-w-0 ${
            pathname === "/rawabet" ? "text-primary-light" : "text-muted"
          }`}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M4 6h4v4H4zm0 8h4v4H4zm6-8h4v4h-4zm0 8h4v4h-4zm6-8h4v4h-4zm0 8h4v4h-4z" />
          </svg>
          <span>روابط</span>
        </Link>
      </div>
    </nav>
  );
}
