# Kalima — Brand Identity Guide
**كلمة** · Arabic-First Daily Word Games

---

## 1. Brand Positioning

Kalima is the daily ritual for Arabic speakers who love language — a place where Arabic's richness becomes a game, not a homework assignment. It is modern, confident, and unapologetically Arabic-first; not a translation of Wordle, but a platform that could only have been built for Arabic.

Kalima is **NOT** an educational app, a language-learning tool, or a children's game. It is not trying to look Western with Arabic text bolted on. The feeling: that quiet satisfaction of a crossword at breakfast — smart, calm, a little competitive, proudly yours.

**Emotional promise:** "This was made for me."

---

## 2. Logo Direction

### Concept
The mark is built from the Arabic letter **ك** (Kaf) — the first letter of كلمة. Kaf is structurally elegant: a clean open bowl with a distinctive inner stroke. It works as a geometric glyph at any size, and carries immediate cultural recognition without being a cliché calligraphic swirl.

The wordmark uses **كلمة** set in a refined, slightly wide Arabic sans-serif — no decorative diacritics, no traditional khat style. Modern Arabic typography, full stop.

### Why it works at 16px
The Kaf mark reduces to a single recognizable silhouette — the distinctive inner tooth of Kaf survives at small sizes because the concept is built on that contrast. No detail, no noise. At 16px it reads as a shape; at 512px it reads as a letter.

---

### Option A — The Tile Mark *(Recommended)*
A single **ك** centered inside a slightly rounded square tile — the same proportions as a game tile. Solid hero color fill, white letter. At large sizes the tile shows a subtle inner shadow suggesting depth. At small sizes it's a colored square with a white mark inside. The form language directly connects to the game.

### Option B — The Open Kaf
The **ك** stands alone, no enclosure — slightly geometric, drawn on a baseline grid, with the inner stroke thickened for weight at small sizes. Used as a logomark alongside the full wordmark كلمة. Feels more editorial, like a magazine masthead.

### Option C — The Word Grid
The wordmark **كلمة** set letter-by-letter with each letter in its own faint tile outline, like tiles laid side by side. Five letters, five tiles. The letters are fully connected (as Arabic requires) but the tile borders create a subtle grid. Instantly communicates the game mechanic without showing a single square of color.

---

## 3. Color Palette

### Hero Color — Kalima Purple
The single color that owns Kalima. Deep, rich, confident — not the blue of Twitter, not the green of WhatsApp, not NYT Games gray. Purple has no dominant Arabic digital brand owner yet. It reads as premium without being cold.

| Role | Name | Hex | Notes |
|---|---|---|---|
| **Primary / Hero** | Kalima Purple | `#6B35C8` | The brand color. App icon bg, CTA buttons, correct tiles |
| **Primary Dark** | Deep Purple | `#4A1F9C` | Pressed states, dark mode primary |
| **Primary Light** | Soft Purple | `#9B6FE8` | Highlights, focus rings |
| **Background Light** | Warm White | `#FAF9F7` | Main bg in light mode — not pure white, slightly warm |
| **Background Dark** | Near Black | `#141218` | Main bg in dark mode — warm dark, not pure black |
| **Surface Light** | Pale Stone | `#F0EEE9` | Cards, tile backgrounds in light mode |
| **Surface Dark** | Dark Surface | `#1E1B24` | Cards, tile backgrounds in dark mode |
| **Text Primary Light** | Charcoal | `#1A1A2E` | Body text in light mode |
| **Text Primary Dark** | Off White | `#F0EDE8` | Body text in dark mode |
| **Text Secondary** | Muted | `#7A7589` | Labels, metadata |
| **Correct / Green** | Minted | `#3DAA7A` | Correct letter, correct position |
| **Present / Yellow** | Saffron | `#D4A017` | Right letter, wrong position |
| **Absent / Gray** | Slate | `#6B6475` | Letter not in word |
| **Accent / Interactive** | Coral | `#E8604C` | Streaks, notifications, urgency |
| **Border** | Stone | `#D4CFC8` | Tile borders (unplayed), dividers |

### Usage Rules
- Purple on white: always. Never purple on yellow, never purple on green.
- Game tiles use Minted/Saffron/Slate — never the purple hero in game tiles (keeps game feedback distinct from brand chrome).
- Dark mode is first-class, not an afterthought. Most users will play at night.

---

## 4. Typography

### Arabic Primary — IBM Plex Arabic
**Source:** Google Fonts (`IBM Plex Arabic`) — free, open source.

IBM Plex Arabic is the correct choice because:
- Designed for screens, not print — optical compensation at small sizes
- Variable weight from Light to Bold — one font file for everything
- Geometric skeleton matches a modern grid-based product
- Supports all Arabic forms including isolated letters (critical for tile display)
- Not overused in the Arabic web space yet

**Import:** `@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Arabic:wght@300;400;500;600;700&display=swap');`

### English Fallback — Inter
**Source:** Google Fonts (`Inter`) — free, variable font.
Used for: English UI labels, numbers, share card metadata, URLs.
Do NOT use Inter for any Arabic text.

---

### Type Scale

| Level | Use | Arabic | English | Weight | Size (mobile) |
|---|---|---|---|---|---|
| **Display** | Game win/loss headline | IBM Plex Arabic | Inter | 700 | 32px |
| **Heading 1** | Page titles, game names | IBM Plex Arabic | Inter | 600 | 24px |
| **Heading 2** | Section headers, streak count | IBM Plex Arabic | Inter | 600 | 20px |
| **Body** | Instructions, results text | IBM Plex Arabic | Inter | 400 | 16px |
| **Body Small** | Hints, metadata, dates | IBM Plex Arabic | Inter | 400 | 14px |
| **Game Tile** | Individual letter in tile | IBM Plex Arabic | Inter | 700 | 28px (tile: 56px sq) |
| **UI Label** | Buttons, nav, tags | IBM Plex Arabic | Inter | 500 | 13px |
| **Caption** | Share card stats, fine print | IBM Plex Arabic | Inter | 300 | 12px |

### Typography Rules
- Line height: 1.6 for body Arabic, 1.4 for headings
- Letter-spacing: 0 for Arabic (never add tracking to Arabic text)
- Text direction: `dir="rtl"` at the document level. All flex/grid reverses accordingly.
- Numbers in game context: Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩) for day counts, streak counts. Western numerals (0–9) only for technical/share contexts.

---

## 5. The Share Card

### The Visual
A dark `#141218` background. Five rows of six tiles (or the game's actual grid). Each tile is a filled rounded square:
- **Correct:** `#3DAA7A` Minted — solid fill
- **Present:** `#D4A017` Saffron — solid fill
- **Absent:** `#6B6475` Slate — solid fill
- **Unplayed:** `#2A2630` — darker than surface, not played

Grid flows **right-to-left**. Row 1 starts at the right edge. This is not a visual quirk — it IS the brand mark. No Western Wordle share card looks like this.

### Layout (share card, 800×600px or 1:1 400×400)
```
┌─────────────────────────────────────┐
│  كلمة                    ك  [tile]  │  ← Header: wordmark left (RTL = right), icon right
│                                     │
│  [■][■][■][■][■][■]                 │  ← Row 1 (RTL grid)
│  [■][■][■][■][■][■]                 │
│  [■][■][■][■][■][■]                 │
│  [■][■][■][■][■][■]                 │
│  [■][■][■][■][■][■]                 │
│                                     │
│  اليوم ٣٤٧  •  ٣/٦  🔥 ١٢         │  ← Day number • guesses • streak
│  kalima.app                         │
└─────────────────────────────────────┘
```

### What Makes It Instantly Recognizable
1. **RTL tile grid** — the grid reads right-to-left. When shared on Twitter/Instagram among Arabic speakers, it's visually distinct from any Western Wordle share at a glance.
2. **Purple header bar** — thin `#6B35C8` top border or header strip, 6px tall. Every share card has it.
3. **The ك tile** — bottom-right corner always has the small Kalima tile mark watermark.
4. **Eastern Arabic numerals** — ٣/٦ not 3/6. This is identity, not localization.
5. **Dark background** — the default share is dark mode. Stands out in a feed of light-background Wordle screenshots.

### Emoji Row Alternative (no tiles, pure emoji)
For text-only share:
```
🟩🟩⬛🟨🟩🟩
🟩🟩🟩🟩🟩🟩
```
Still RTL-ordered visually (right-to-left sequence matches the grid). The Unicode emoji look identical but the share text begins from the right word.

---

## 6. Game Card Design (Home Hub)

### Home Hub Layout
A dark `#141218` background grid of game cards. Two columns on mobile, or full-width cards stacked. Each card is `#1E1B24` surface with `6px` border-radius.

### Card Anatomy
```
┌─────────────────────────────────┐
│  [ICON/THUMBNAIL - 56px sq]     │
│                                 │
│  اسم اللعبة          [STREAK]  │
│  وصف قصير                       │
│                              ↗  │
│  [STATUS CHIP]   [CTA BUTTON]  │
└─────────────────────────────────┘
```

### Game Icons (per game)

**حروف (Wordle clone)**
Icon: 6 tiles in a 2×3 mini-grid, colored Minted/Slate/Saffron in a pattern. Square, directly communicates the mechanic. Purple tile for the "today's solved" state.

**روابط (Connections clone)**
Icon: 4×4 grid of 16 small squares in 4 color groups — each group a distinct color (Purple, Minted, Saffron, Coral). Visually communicates category grouping instantly.

**Future games**
Reserved icon grid: each new game gets its own geometric icon built from the same tile/grid language. No illustrations, no characters — always abstract geometric marks made from game-relevant shapes.

### Streak & Status Indicators
- **🔥 Streak counter:** Coral `#E8604C` flame icon + Eastern Arabic numeral. Right-aligned in the card header (RTL: appears on the left visually).
- **✓ Completed today:** Full `#6B35C8` purple CTA button becomes `#3DAA7A` Minted with checkmark. Text: "أنهيت اللعبة اليوم"
- **New / Unseen:** Small pulsing `#6B35C8` dot on the icon corner.
- **Locked / Coming soon:** Card opacity 60%, icon has a lock overlay. Text: "قريباً"
- **Daily timer:** Shows time until next puzzle as a thin progress bar at the card bottom — depletes through the day.

---

## 7. Voice & Tone

### 5 Brand Personality Words
1. **ذكي** (Smart) — It respects your intelligence
2. **دافئ** (Warm) — Feels like a friend, not a machine
3. **مرح** (Playful) — Light, not heavy; fun without being childish
4. **فخور** (Proud) — Unabashedly Arabic, not apologetic about it
5. **موجز** (Concise) — Says exactly what needs to be said. Never over-explains.

### Register
**Informal Modern Standard Arabic** — not dialect, not formal فصحى. Think: how a 28-year-old from Riyadh writes in a thoughtful Instagram caption. Not Twitter slang, not classical literature. The kind of Arabic that feels natural across Saudi, UAE, Egypt, and Jordan without sounding foreign to any of them.

Use **أنت** (not **حضرتك**, not dialect **انت**). Use contractions where natural. No emoji in UI copy — emoji is for share cards only.

### Voice Examples

| Moment | What NOT to say | Kalima Says |
|---|---|---|
| Win on first guess | "Amazing! You're a genius! 🎉🎉🎉" | **كلمة واحدة. كافية.** |
| Win on 6th guess | "You made it! Congrats!" | **في الدقيقة الأخيرة — لكنك وصلت.** |
| Loss | "Oops! Better luck tomorrow!" | **الكلمة كانت: [كلمة]. الغد فرصة جديدة.** |
| Streak milestone (7 days) | "7-day streak! You're on fire!! 🔥🔥" | **أسبوع كامل. أصبحت عادة.** |
| First open / onboarding | "Welcome to Kalima!" | **مرحباً. كلمة واحدة. كل يوم.** |
| Push notification | "Come play today's puzzle! 🎮" | **كلمة اليوم تنتظرك.** |

### Tone Calibration
- Win: calm satisfaction, not explosion of praise
- Loss: honest, brief, never patronizing
- Streaks: acknowledge without over-celebrating
- Instructions: as short as possible; assume the user is not an idiot
- Error states: direct, never cute ("عذراً، حدث خطأ" — not "Oops! Something went wrong 😅")

---

## 8. What Kalima Is NOT

### Design Anti-Patterns to Avoid

**Avoid: Calligraphic / Traditional Arabic Aesthetics**
No arabesque patterns, no geometric Islamic tile motifs as decoration, no thuluth-style khat in the UI. These read as "Arabic app made for tourists" or "Quran app." Kalima is contemporary.

**Avoid: Green as the hero color**
Green is Islam, WhatsApp, and Saudi branding. It's the most overused color in Arabic-market apps. We own Purple.

**Avoid: Busy gradients**
No rainbow gradients, no mesh gradients, no glassmorphism blur stacks. Flat, dark, clean surfaces only. Depth comes from the game tiles, not from decorative gradients.

**Avoid: Mixed text directions in the same line**
Don't write "العب Kalima الآن!" mixing scripts in one label. Either Arabic or English per element, never interleaved in one string.

**Avoid: Over-animation**
No bouncing, no particle effects on win, no confetti explosions. A subtle tile flip is the maximum animation budget. This is a game about calm intelligence, not a slot machine.

**Avoid: Notification/gamification spam design**
No fake urgency banners ("Your friend is playing RIGHT NOW!"), no daily login reward chests, no XP bars, no badge collections. NYT Games doesn't do this. Neither does Kalima.

---

### Competitor Aesthetics to Stay Far From

| Competitor | What They Do | Why We Don't |
|---|---|---|
| **Wordle (NYT)** | Minimal gray/white/green, very flat | Too plain, no personality, no cultural identity |
| **Duolingo** | Green, cartoon owl, gamification badges, guilt notifications | Edu-app energy, patronizing, infantilizing |
| **Arabic learning apps (general)** | Arabesque borders, gold/green, formal font | Tourist trap aesthetic; not for native speakers |
| **Arab News / BBC Arabic** | Blue + white news aesthetic | Too institutional, zero fun |
| **Candy Crush / mobile games** | Shiny, bubbly, reward explosions | Skews young/casual; undermines intelligence positioning |

---

## Design System Summary (Quick Reference)

```
Brand Color:    #6B35C8  (Kalima Purple)
Background:     #FAF9F7  /  #141218
Surface:        #F0EEE9  /  #1E1B24
Correct:        #3DAA7A  (Minted)
Present:        #D4A017  (Saffron)
Absent:         #6B6475  (Slate)
Accent:         #E8604C  (Coral)

Arabic Font:    IBM Plex Arabic (Google Fonts)
English Font:   Inter (Google Fonts)

Logo Mark:      ك inside a rounded tile, Kalima Purple fill
Direction:      RTL first. Always.
Voice:          Informal MSA. Concise. Proud.
```

---

*Kalima Brand Guide v1.0 — March 2026*
