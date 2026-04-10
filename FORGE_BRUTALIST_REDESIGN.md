# Forge Brief — Kalima Brutalist UI Redesign (Manual)

You are Forge (Developer). The CLI timed out. Execute the redesign manually by editing files directly.

## Environment
- cd /home/khalid/.openclaw/workspace/kalima/repo
- Node 18+, npm installed
- Do NOT run interactive CLI commands (they timeout)

---

## Step 1 — Update tailwind.config.ts

Read the current file, then replace the `theme` section to add Brutalist tokens:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        brutal: "4px 4px 0 rgba(0, 0, 0, 1)",
        "brutal-lg": "8px 8px 0 rgba(0, 0, 0, 1)",
        "brutal-sm": "2px 2px 0 rgba(0, 0, 0, 1)",
      },
      borderWidth: {
        brutal: "3px",
      },
      fontWeight: {
        brutal: "900",
      },
      colors: {
        accent: "#CCFF00",
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Step 2 — Update src/app/globals.css

Add Brutalist utilities at the end:

```css
/* Brutalist Design System */

/* Borders */
.border-brutal {
  border: 3px solid #000;
}

.border-brutal-accent {
  border: 3px solid #CCFF00;
}

.border-brutal-left-accent {
  border-left: 4px solid #CCFF00;
}

/* Shadows */
.shadow-brutal {
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 1);
}

.shadow-brutal-lg {
  box-shadow: 8px 8px 0 rgba(0, 0, 0, 1);
}

.shadow-brutal-sm {
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 1);
}

/* Typography */
.font-brutal {
  font-weight: 900;
  letter-spacing: -0.02em;
}

/* Interaction States */
.pressed {
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 1) !important;
  transform: translate(2px, 2px);
}

.hover-lift:hover {
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 1);
  transform: translate(0, 0);
}

/* Remove all glows */
.no-glow {
  box-shadow: none !important;
  filter: none !important;
}

/* Cards */
.card-brutal {
  border: 3px solid #000;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 1);
  background: #fff;
  padding: 20px;
}

.card-brutal.accent {
  border: 3px solid #CCFF00;
}

/* Buttons */
.btn-brutal {
  border: 3px solid #000;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 1);
  font-weight: 900;
  padding: 12px 24px;
  cursor: pointer;
  background: #fff;
  color: #000;
  transition: all 0.1s ease;
}

.btn-brutal:active,
.btn-brutal.pressed {
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 1);
  transform: translate(2px, 2px);
}

.btn-brutal.accent {
  border-color: #CCFF00;
  background: #000;
  color: #CCFF00;
}

/* Remove neon glows from existing elements */
[class*="glow"],
[class*="neon"],
.gradient {
  box-shadow: none !important;
  background: none !important;
}
```

---

## Step 3 — Redesign Home Page (src/app/home/page.tsx)

Read the current file. Keep all state/logic. Update ONLY the JSX render for the 3 game cards:

**Old structure (remove):**
- gradient cards with glow effects
- multiple accent colors
- rounded corners >20px

**New structure (replace with):**

```tsx
// Card wrapper component
const BrutalCard = ({ children, accent = false, disabled = false }: any) => (
  <div className={`
    border-brutal ${accent ? "border-brutal-accent" : "border-black"} 
    shadow-brutal
    bg-white
    p-6
    rounded-none
    ${disabled ? "opacity-50" : ""}
  `}>
    {children}
  </div>
);

// Inside your render, replace the 3 cards with:
<div className="space-y-4">
  <BrutalCard accent>
    <h3 className="font-brutal text-xl mb-2">حروف</h3>
    <p className="text-sm mb-4 text-gray-700">كلمة في الدقيقة</p>
    <button className="btn-brutal w-full">ابدأ اللعبة</button>
  </BrutalCard>

  <BrutalCard accent>
    <h3 className="font-brutal text-xl mb-2">روابط</h3>
    <p className="text-sm mb-4 text-gray-700">خمس كلمات، اربع فئات</p>
    <button className="btn-brutal w-full">ابدأ اللعبة</button>
  </BrutalCard>

  <BrutalCard disabled>
    <h3 className="font-brutal text-xl mb-2 opacity-50">🔒 قريباً</h3>
    <p className="text-sm text-gray-500">المزيد قريباً جداً</p>
  </BrutalCard>
</div>
```

---

## Step 4 — Redesign GameBoard.tsx (src/components/GameBoard.tsx)

Read the file. Keep game logic intact. Update tile rendering:

**Old:**
- gradient backgrounds
- rounded corners
- glows on active

**New:**
```tsx
// For each tile/cell:
<div className={`
  border-brutal
  shadow-brutal
  aspect-square
  flex items-center justify-center
  font-brutal text-2xl
  cursor-pointer
  rounded-none
  transition-all duration-100
  ${isActive ? "shadow-brutal-sm scale-95" : ""}
  ${isCorrect ? "bg-black text-[#CCFF00]" : "bg-white"}
  ${isWrong ? "bg-red-500" : ""}
`}>
  {letter}
</div>
```

---

## Step 5 — Redesign Header (src/components/GameHeader.tsx)

Remove all glows. Add heavy border + shadow:

```tsx
<div className="border-b-brutal border-b-[3px] border-b-[#CCFF00] pb-4">
  <h1 className="font-brutal text-4xl text-center mb-2">كلمة</h1>
  <p className="text-center text-sm text-gray-600 font-brutal">#465</p>
</div>
```

---

## Step 6 — Redesign Keyboard (src/components/Keyboard.tsx)

Replace each key:

```tsx
<button className={`
  btn-brutal
  h-12 px-3
  rounded-sm
  text-sm
  ${pressedKeys.includes(letter) ? "pressed" : ""}
  ${usedKeys.includes(letter) ? "opacity-50" : ""}
`}>
  {letter}
</button>
```

---

## Step 7 — Redesign BottomNav (src/components/BottomNav.tsx)

Add top border with accent:

```tsx
<nav className="border-t-brutal border-t-[3px] border-t-[#CCFF00] pt-4 mt-auto">
  <div className="flex justify-around">
    {/* Each nav item */}
    <button className={`
      flex flex-col items-center gap-1
      font-brutal text-xs
      ${isActive ? "text-[#CCFF00]" : "text-gray-600"}
    `}>
      {icon}
      {label}
    </button>
  </div>
</nav>
```

---

## Step 8 — Remove All Glows

Search and replace in all files:
- `box-shadow: 0 0 20px` → remove
- `filter: drop-shadow` → remove
- `bg-gradient-to` → remove, use `bg-white` or `bg-black`
- `rounded-full` → change to `rounded-none` or `rounded-sm`
- `blur` → remove

---

## Step 9 — Update Modals (src/components/StatsModal.tsx, HowToPlayModal.tsx)

Wrap content in `card-brutal`:

```tsx
<div className="fixed inset-0 bg-black/80 flex items-center justify-center">
  <div className="card-brutal max-w-md">
    <h2 className="font-brutal text-2xl mb-4">عنوان</h2>
    {/* content */}
  </div>
</div>
```

---

## Step 10 — Quality Gate

```bash
npx tsc --noEmit
npm run build 2>&1 | grep -i error || echo "Build OK"
```

Fix any TS errors (there shouldn't be any — CSS-only changes).

---

## Step 11 — Commit and Push

```bash
git add -A
git commit -m "redesign: Brutalist UI overhaul — bold borders, offset shadows, no glows"
git push origin main
```

---

## Checklist Before Done

- [ ] Zero neon glows in entire codebase
- [ ] All interactive elements have 3px borders
- [ ] All depth via 4px offset shadow (no blur)
- [ ] font-weight: 900 on headers/CTAs
- [ ] #CCFF00 ONLY as border stroke, never as glow/shadow
- [ ] No gradient backgrounds
- [ ] No border-radius >4px (except specific cases)
- [ ] Mobile responsive (375px+)
- [ ] Game logic 100% intact
- [ ] TypeScript check passes
- [ ] Committed and pushed to main
