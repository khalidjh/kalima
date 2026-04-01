"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useIsPro } from "@/lib/subscription";

export default function HeaderAuth() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const { isPro } = useIsPro(user);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  if (loading) return <div className="w-8 h-8" />;

  if (!user) {
    return (
      <button
        onClick={() => signInWithGoogle()}
        className="text-sm font-bold text-primary bg-primary/20 border border-primary/50 rounded-lg px-4 py-1.5 hover:bg-primary/30 transition-colors active:scale-95 flex items-center gap-1.5"
      >
        <LogIn size={15} />
        دخول
      </button>
    );
  }

  const initials = user.displayName
    ? Array.from(user.displayName)[0] ?? "؟"
    : (user.email?.[0] ?? "؟").toUpperCase();

  return (
    <div ref={dropdownRef} className="relative flex items-center gap-1.5">
      {isPro && (
        <span className="text-[10px] font-bold text-[#0F0C00] bg-[#0F0C00]/20 rounded px-1.5 py-0.5 leading-none tracking-wider">
          PRO
        </span>
      )}
      <button
        onPointerDown={(e) => { e.preventDefault(); setOpen((prev) => !prev); }}
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
          <div className="w-8 h-8 rounded-full bg-[#0F0C00] flex items-center justify-center text-primary text-sm font-bold">
            {initials}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-10 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50 min-w-[140px]">
          {!isPro && (
            <button
              onPointerDown={() => { router.push("/pro"); setOpen(false); }}
              className="w-full text-right px-4 py-2.5 text-sm text-primary hover:bg-primary/10 transition-colors border-b border-border flex items-center gap-2"
            >
              <Sparkles size={14} />
              ترقية إلى Pro
            </button>
          )}
          <button
            onPointerDown={() => { signOut(); setOpen(false); }}
            className="w-full text-right px-4 py-2.5 text-sm text-text hover:bg-primary/10 transition-colors flex items-center gap-2"
          >
            <LogOut size={14} />
            تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}
