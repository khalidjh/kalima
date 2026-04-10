# Kalima Brutalist Redesign — Status

## ✅ Already Done
- `tailwind.config.ts` — brutal shadows, border widths configured
- `src/app/globals.css` — `.shadow-brutal`, `.shadow-brutal-sm`, `.shadow-brutal-lg` utilities defined
- `components.json` — Brutalist UI initialized

## ⏳ To Do (Require Manual File Edits)

### Priority 1: Core Screens
1. **src/app/home/page.tsx** — Game selection cards (3 cards)
   - Remove: neon glows, gradients, multiple colors
   - Add: 3px borders, 4px offset shadows, font-weight-900
   - Keep: all state logic

2. **src/components/BottomNav.tsx** — Navigation bar
   - Remove: soft glows, rounded corners
   - Add: 3px top border with #CCFF00, heavy font
   - Keep: routing logic

3. **src/components/GameHeader.tsx** — Title + game info
   - Remove: neon glow on title
   - Add: 3px bottom border, font-weight-900
   - Keep: all content

### Priority 2: Game UI
4. **src/components/GameBoard.tsx** — Tile grid
   - Remove: gradient tiles, glow on active
   - Add: 3px borders on each tile, 4px shadow
   - Keep: game logic

5. **src/components/Keyboard.tsx** — Letter buttons
   - Remove: rounded pill shapes, glows
   - Add: 3px borders, 4px shadow, sharp corners
   - Keep: input handling

### Priority 3: Modals + Overlays
6. **src/components/StatsModal.tsx** — Stats display
7. **src/components/HowToPlayModal.tsx** — Instructions
8. **src/components/RawabetResultModal.tsx** — Game result screen

### Priority 4: Polish
9. **All SVG icons** — Replace generic with custom or bold typography
10. **Remove all `filter: drop-shadow()` and `blur`**
11. **Remove all `.gradient` classes**
12. **Update animations** — ensure no smooth glows, use hard shadows

## Key Changes Pattern

**Before:**
```tsx
<div className="rounded-3xl bg-gradient-to-b from-green-500 to-green-600 shadow-xl shadow-green-500/50">
```

**After:**
```tsx
<div className="border-3 border-[#CCFF00] shadow-brutal bg-black">
```

---

## Next Step
Once these files are manually edited to follow Brutalist principles, run:
```bash
npx tsc --noEmit    # Check for TS errors
npm run build       # Build check
git add -A && git commit -m "redesign: Brutalist UI overhaul"
git push origin main
```

## Estimated Effort
- Each file: 10-20 minutes (read, understand structure, update JSX classNames)
- Total: 2-3 hours for complete redesign
- No game logic changes needed (CSS-only)
