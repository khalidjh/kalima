# Kalima — Brutalist UI Redesign Brief

## Goal
Replace the AI-generated look (neon glows, gradient cards, inconsistent accents) with bold **Neo-Brutalism**: thick borders, offset shadows, heavy typography, vibrant but unified colors.

## Core Design Tokens (from Brutalist UI)

| Token | CSS | Purpose |
|-------|-----|---------|
| **border** | 3px solid black/brand | All component borders |
| **shadow** | 4px 4px 0 #000 (offset) | All depth/elevation |
| **typography** | font-weight: 900 | Headers, CTA text |
| **colors** | vibrant, high-contrast | Keep #CCFF00 (accent), add dark bg, white text |
| **corners** | 0 or 8px max | Sharp or very subtle, never 50px |

## Current Issues to Fix

### ❌ Remove:
- Neon glows (box-shadow with multiple color layers)
- Smooth gradients on cards
- Multiple inconsistent accent colors (green + gold + gray)
- Rounded corners >20px
- Blurred/translucent backgrounds
- Generic icons (emoji, material design)
- Emoji badges (#465, daily challenge)

### ✅ Add:
- 3px solid borders on all interactive elements
- 4-8px hard offset shadows (pure black, no blur)
- Single accent color: #CCFF00 for borders only, not glows
- Heavy font-weight (900) on all headers/buttons
- Sharp rectangular shapes
- Clear visual hierarchy via borders + weight, not color
- Custom SVG icons (or bold text labels)

## Installation Steps

### 1. Install Brutalist UI CLI
```bash
cd /home/khalid/.openclaw/workspace/kalima/repo
npx brutx@latest init
npx brutx@latest add button card badge dialog input
```

### 2. Key Screens to Redesign (in order)

#### A. Home Page (src/app/home/page.tsx)
Replace the 3 game cards with **Brutalist cards**:
- **Card 1: حروف (Letters)**
  - 3px #000 border
  - 4px 4px 0 black shadow
  - Title in font-weight-900
  - Green border accent (not glow): `border-l-4 border-[#CCFF00]`
  - Button: 3px border, 4px shadow, no gradient
  
- **Card 2: روابط (Connections)**
  - Same treatment, different internal layout
  
- **Card 3: Coming Soon**
  - Muted border (gray), disabled state styling

#### B. Game Board (src/components/GameBoard.tsx)
- Remove gradient backgrounds
- Add 3px borders to tiles
- 4px offset shadow on active tile
- Heavy typography on letters
- Keep the game logic, replace CSS only

#### C. Header (src/components/GameHeader.tsx)
- Remove glow from title
- Heavy font-weight (900)
- 3px bottom border for underline instead of glow
- Accent line: #CCFF00

#### D. Keyboard (src/components/Keyboard.tsx)
- 3px border on each key
- 4px shadow offset
- No rounded pill shape → sharp rectangles (border-radius: 2-4px max)
- Bold font

#### E. Bottom Nav (src/components/BottomNav.tsx)
- 3px top border (accent color #CCFF00)
- No glow on active icon
- Heavy text labels
- Clear pressed state via border + shadow change

### 3. Global CSS (src/app/globals.css)
Add Brutalist CSS utilities:
```css
/* Brutalist shadow */
.shadow-brutal {
  box-shadow: 4px 4px 0 #000;
}

/* Brutalist border */
.border-brutal {
  border: 3px solid #000;
}

/* Heavy type */
.font-brutal {
  font-weight: 900;
  letter-spacing: -0.02em;
}

/* Accent border (only, no glow) */
.border-accent {
  border-left: 4px solid #CCFF00;
}

/* Pressed state */
.pressed {
  box-shadow: 2px 2px 0 #000;
  transform: translate(2px, 2px);
}
```

### 4. Tailwind Config (tailwind.config.ts)
Extend with Brutalist tokens:
```ts
theme: {
  extend: {
    boxShadow: {
      brutal: '4px 4px 0 rgba(0, 0, 0, 1)',
      'brutal-lg': '8px 8px 0 rgba(0, 0, 0, 1)',
    },
    borderWidth: {
      brutal: '3px',
    },
    colors: {
      accent: '#CCFF00',
    },
  },
}
```

## Design Philosophy

**FROM (Current):**
- Soft, glowing, procedurally-generated feel
- Multiple colors competing for attention
- Smooth transitions, emoji badges

**TO (Brutalist):**
- Bold, intentional, handcrafted feel
- One accent color (#CCFF00) used sparingly
- Hard shadows, no blur, clear interaction states
- Heavy typography as primary visual signal

## Screens by Priority

| Priority | Screen | Component File |
|----------|--------|-----------------|
| 1 | Home (game selection) | src/app/home/page.tsx |
| 2 | Game Board (play screen) | src/components/GameBoard.tsx |
| 3 | Header | src/components/GameHeader.tsx |
| 4 | Keyboard | src/components/Keyboard.tsx |
| 5 | Bottom Nav | src/components/BottomNav.tsx |
| 6 | Modals (stats, how-to-play) | src/components/StatsModal.tsx, HowToPlayModal.tsx |
| 7 | Admin/Settings pages | src/app/admin/ |

## Implementation Notes

- **No breaking changes:** Keep all game logic, state management, Firebase integration
- **CSS-only in most cases:** Update className strings, no component logic changes
- **Test on mobile first:** Brutal shadows scale differently at 375px vs 1440px
- **Color:** Keep #CCFF00, but ONLY as a border stroke, never as a glow/shadow
- **Fonts:** Bold all headers (font-weight: 900), keep body at 400-500

## Success Criteria

✅ Zero neon glows in entire app
✅ All interactive elements have 3px borders
✅ All depth via 4px offset shadow (not blur)
✅ Heavy typography (900) on CTAs and headers
✅ One accent color (#CCFF00) used consistently
✅ No gradient backgrounds
✅ Sharp corners (border-radius: 0-4px)
✅ Mobile fully responsive
✅ Game logic 100% intact, only CSS changed
