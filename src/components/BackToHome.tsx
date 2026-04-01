"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

export default function BackToHome() {
  const router = useRouter();
  return (
    <button
      onPointerDown={() => router.push("/home")}
      className="flex items-center gap-1 text-muted hover:text-white transition-colors text-sm font-medium"
      aria-label="الرجوع للبيت"
    >
      <ChevronRight size={18} strokeWidth={2} />
      <span>الألعاب</span>
    </button>
  );
}
