"use client";

import { useState, useEffect } from "react";

interface RecentUser {
  uid: string;
  displayName: string;
  email: string;
  gamesPlayed: number;
  currentStreak: number;
  isPro: boolean;
  updatedAt: string;
}

interface Stats {
  totalUsers: number;
  proUsers: number;
  totalGamesPlayed: number;
  notifEnabled: number;
  recentUsers: RecentUser[];
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <div className="text-primary text-4xl font-extrabold mb-1 tabular-nums">
        {value.toLocaleString("ar-EG")}
      </div>
      <div className="text-muted text-sm">{label}</div>
    </div>
  );
}

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const cookie = getCookie("kalima_admin");
    if (cookie === "1") setIsAuthed(true);
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!isAuthed) return;
    setLoading(true);
    setFetchError("");
    fetch("/api/admin/stats", {
      headers: {
        "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "",
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Stats) => setStats(data))
      .catch((e) => setFetchError(e.message ?? "خطأ في التحميل"))
      .finally(() => setLoading(false));
  }, [isAuthed]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      document.cookie = "kalima_admin=1; path=/; max-age=86400";
      setIsAuthed(true);
      setError("");
    } else {
      setError("كلمة مرور خاطئة");
    }
  }

  function handleLogout() {
    document.cookie = "kalima_admin=; path=/; max-age=0";
    setIsAuthed(false);
    setStats(null);
  }

  if (!checked) return null;

  if (!isAuthed) {
    return (
      <div className="h-full overflow-y-auto flex items-center justify-center bg-background py-12">
        <div className="bg-surface border border-border rounded-2xl p-8 w-full max-w-sm mx-4">
          <h1 className="text-white text-2xl font-bold text-center mb-6">
            🔐 لوحة التحكم
          </h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4" dir="rtl">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              className="bg-background border border-border rounded-xl px-4 py-3 text-white text-right w-full focus:outline-none focus:border-primary transition-colors"
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              className="bg-primary text-primary-text font-bold py-3 rounded-xl hover:bg-primary-dark transition-colors"
            >
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background text-white" dir="rtl">
      {/* Dashboard header */}
      <div className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold">لوحة التحكم 📊</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-muted hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-border-filled"
        >
          خروج
        </button>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {loading && (
          <div className="text-muted text-center py-16 text-lg">
            جاري التحميل...
          </div>
        )}

        {fetchError && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-5 text-red-400 text-center">
            {fetchError}
          </div>
        )}

        {stats && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="إجمالي المستخدمين" value={stats.totalUsers} />
              <StatCard label="مشتركو Pro" value={stats.proUsers} />
              <StatCard label="مجموع الألعاب" value={stats.totalGamesPlayed} />
              <StatCard label="الإشعارات مفعّلة" value={stats.notifEnabled} />
            </div>

            {/* Recent users table */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-bold text-lg">آخر المستخدمين</h2>
                <p className="text-muted text-sm mt-0.5">
                  أحدث {stats.recentUsers.length} مستخدم
                </p>
              </div>

              {stats.recentUsers.length === 0 ? (
                <div className="text-muted text-center py-12">
                  لا يوجد مستخدمون بعد
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-background text-muted">
                      <tr>
                        <th className="px-4 py-3 text-right font-medium">
                          المستخدم
                        </th>
                        <th className="px-4 py-3 text-center font-medium">
                          الألعاب
                        </th>
                        <th className="px-4 py-3 text-center font-medium">
                          السلسلة
                        </th>
                        <th className="px-4 py-3 text-center font-medium">
                          Pro
                        </th>
                        <th className="px-4 py-3 text-right font-medium">
                          التاريخ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentUsers.map((u, i) => (
                        <tr
                          key={u.uid}
                          className={
                            i % 2 === 0
                              ? "bg-surface hover:bg-border/30"
                              : "bg-background hover:bg-border/30"
                          }
                        >
                          <td className="px-4 py-3 text-right">
                            <div className="font-medium text-white">
                              {u.displayName || (
                                <span className="text-muted">بدون اسم</span>
                              )}
                            </div>
                            <div className="text-muted text-xs mt-0.5">
                              {u.email || u.uid.slice(0, 12) + "…"}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center tabular-nums">
                            {u.gamesPlayed}
                          </td>
                          <td className="px-4 py-3 text-center tabular-nums">
                            {u.currentStreak > 0 ? (
                              <span className="text-primary font-bold">
                                {u.currentStreak} 🔥
                              </span>
                            ) : (
                              u.currentStreak
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {u.isPro ? (
                              <span className="text-primary font-bold text-base">
                                ✦
                              </span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-muted text-xs">
                            {u.updatedAt
                              ? new Date(u.updatedAt).toLocaleDateString(
                                  "ar-SA",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
