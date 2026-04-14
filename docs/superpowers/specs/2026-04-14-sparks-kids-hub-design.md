# Sparks - Kids Gaming Hub Design

## Brand
- **Name**: Sparks (شرارة)
- **Tagline**: "العب وتعلّم" (Play & Learn)
- **Logo**: ⚡ spark icon with bright gradient
- **Lives at**: kalima.fun/kids

## Game Roster (11 games)

### 🧠 تعلّم (Learn) - 5 existing
1. حروفي - Letter recognition & forms
2. أرقامي - Counting, math, patterns (5 levels)
3. هجّائي - Spell words from scrambled letters
4. أشكالي - Shape recognition
5. ألواني - Color matching

### 🎮 العب (Play) - 6 new
6. ذاكرة (Memory) - Flip cards, find matching pairs. Levels: 3x4, 4x4, 5x4 grids
7. متاهة (Maze) - Swipe to navigate through generated mazes. Levels increase size
8. فقاعات (Bubbles) - Pop floating bubbles with correct math answers before time runs out
9. ترتيب الصور (Jigsaw) - Drag pieces to complete emoji/shape pictures. 2x2, 3x3, 4x4
10. سرعة (Speed) - Rapid-fire quiz, tap correct answer fast. Score = speed + accuracy
11. ٢٠٤٨ عربي (2048) - Classic 2048 with Arabic numerals, swipe controls

## Home Page Design
- Sparks brand header with ⚡ logo
- Two sections: "تعلّم" and "العب"
- Games in 3-column grid (compact, colorful square cards)
- Each card: emoji icon, game name, color-coded background
- Total stars counter at top
- All ages welcome (no age gating)

## Architecture
- Each game: single page.tsx at /kids/[game]/
- No shared state beyond localStorage per-game
- Level progression saved per game
- Stars earned feed into a global counter (localStorage)

## Tech
- Next.js App Router, TypeScript, Tailwind
- Client components ("use client")
- CSS animations, no external animation libs
- Touch-first, large targets, RTL Arabic
