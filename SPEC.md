# كلمة (Kalima) — Arabic-First Daily Word Games Platform

## What is Kalima?

Kalima is the NYT Games for Arabic speakers. Not a translation, not a clone — a platform built from the ground up for Arabic language, culture, and habits.

400 million Arabic speakers. Zero credible daily word game platforms. Kalima fills that gap.

Currently has two live games:
- **حروف (Wordle)** — guess the 5-letter Arabic word in 6 tries
- **روابط (Connections)** — group 16 words into 4 hidden categories

Planned: Spelling Bee, Mini Crossword, Strands

## Tech Stack

### Web (kalima.fun) — LIVE
- **Framework:** Next.js 14 (TypeScript, Tailwind CSS)
- **Hosting:** Vercel (static + serverless)
- **Status:** Live, maintained

### Shared
- **Auth:** Firebase (Google login)
- **Database:** Firestore
- **Payments:** Moyasar (mada, STC Pay — pending approval)
- **Push Notifications:** Firebase Cloud Messaging
- **Analytics:** Google Analytics + Plausible
- **Brand:** Cairo font, dark theme, lime yellow (#CCFF00) accent

## URLs

- **Live Site:** https://kalima.fun
- **GitHub:** https://github.com/khalidjh/kalima (SSH: ~/.ssh/github_kalima)
- **Admin Dashboard:** https://kalima.fun/admin (password: kalima_admin_2026)
- **Firebase Console:** https://console.firebase.google.com/project/kalima-85c92
- **Vercel Dashboard:** https://vercel.com (project: kalima)

## Firebase Config

- **Project:** kalima-85c92
- **Service account:** stored in Vercel env `FIREBASE_SERVICE_ACCOUNT_KEY`

## Vercel Env Vars

- `ADMIN_PASSWORD` / `ADMIN_SECRET`
- `FIREBASE_SERVICE_ACCOUNT_KEY`
- `MOYASAR_SECRET_KEY` (test keys, swap to live when approved)
- `NEXT_PUBLIC_MOYASAR_KEY` (test)

## Monetization

- **Kalima Pro:** 9.99 SAR/month via Moyasar
- Features: ad-free, archive, hard mode, detailed stats
- Currently showing "coming soon" until Moyasar account approved

## Marketing

- **TikTok:** primary channel, daily gameplay videos with suspense hooks
- **Twitter:** scheduled via Buffer (7 weekly posts ready)
- **Product Hunt:** launch planned

## Vision

Build the daily habit for Arabic speakers. 10K DAU → Ramadan 2027 push → 50K DAU → acquisition target.

## Current Games

### حروف (Hurouf — Wordle)
- 5-letter Arabic word, 6 attempts
- Arabic keyboard with RTL support
- Daily puzzle with stats tracking

### روابط (Rawaabit — Connections)
- 16 Arabic words → 4 hidden categories
- Color-coded difficulty (easy → hard)
- Daily puzzle

## Planned Games

- **Spelling Bee** — Arabic letter combinations
- **Mini Crossword** — Arabic clues + grid
- **Strands** — Arabic word search variant

## North Star

**50,000 Weekly Active Puzzlers** — everything we build, ship, and market serves this number.

Kalima is a web-first PWA at **kalima.fun** — discovery via SEO, viral sharing, push notifications via service worker, and installable on any device via Add to Home Screen.

Milestone path:
- **Month 1-2:** Optimize existing games, fix retention, soft launch
- **Month 3-4:** Add Spelling Bee + Mini Crossword → content flywheel
- **Month 5-6:** TikTok viral push, influencer partnerships → 10K WAP
- **Month 7-9:** Ramadan 2027 campaign → 30K WAP
- **Month 10-12:** Scale to 50K WAP, monetize with Kalima Pro

Every feature decision filters through: "Does this help us reach 50K WAP?"
