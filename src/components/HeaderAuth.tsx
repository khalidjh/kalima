"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";

export default function HeaderAuth() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Reserve space to prevent layout shift
  if (loading) return <div className="w-8 h-8" />;

  if (!user) {
    return (
      <button
        onClick={signInWithGoogle}
        className="text-sm text-white border border-[#6B35C8] rounded-lg px-3 py-1 hover:bg-[#6B35C8]/20 transition-colors"
        style={{ fontFamily: "'IBM Plex Arabic', sans-serif" }}
      >
        دخول
      </button>
    );
  }

  const initials = user.displayName
    ? Array.from(user.displayName)[0] ?? "؟"
    : (user.email?.[0] ?? "؟").toUpperCase();

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
        aria-label="قائمة المستخدم"
      >
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt={user.displayName ?? "المستخدم"}
            className="w-8 h-8 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#6B35C8] flex items-center justify-center text-white text-sm font-bold">
            {initials}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-10 bg-[#1a1827] border border-[#6B35C8]/40 rounded-lg shadow-lg overflow-hidden z-50 min-w-[130px]">
          <button
            onClick={() => {
              signOut();
              setOpen(false);
            }}
            className="w-full text-right px-4 py-2.5 text-sm text-white hover:bg-[#6B35C8]/20 transition-colors"
            style={{ fontFamily: "'IBM Plex Arabic', sans-serif" }}
          >
            تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}
