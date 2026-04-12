import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  verifySessionToken,
  ADMIN_COOKIE,
} from "@/lib/adminSession";

export async function POST(req: NextRequest) {
  try {
    const { password } = (await req.json()) as { password?: string };

    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      console.error("ADMIN_PASSWORD env var is not set");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    if (!password || password !== expected) {
      return NextResponse.json({ error: "كلمة مرور خاطئة" }, { status: 401 });
    }

    const token = createSessionToken();

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

/** DELETE = logout */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}

/** GET = check session validity */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token || !verifySessionToken(token)) {
    return NextResponse.json({ authed: false }, { status: 401 });
  }
  return NextResponse.json({ authed: true });
}
