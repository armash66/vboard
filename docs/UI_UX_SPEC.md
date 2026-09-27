# vboard UI/UX Specification

Status: Extracted from the original TanStack Start build (commit `861f513`) and carried into the Next.js rebuild unchanged.
Source of truth for tokens: `src/app/globals.css`. Frozen reference copies: `docs/design/`.

## 1. Character

Editorial, not dashboard. vboard borrows the voss-website voice: warm paper background, near-black ink, one burnt-orange brand accent, generous whitespace, large tight display type, and small uppercase mono labels. Surfaces are flat with hairline borders; there are no shadows, gradients, or decorative illustrations. Colour is used for one thing at a time: the brand accent marks what is live, selected, or important.

## 2. Colour tokens

| Token             | Light                 | Dark                  | Use                                          |
| ----------------- | --------------------- | --------------------- | -------------------------------------------- |
| `--bg`            | `#fafaf7`             | `#0a0a0a`             | Page background (warm paper / ink)           |
| `--bg-elevated`   | `#ffffff`             | `#111111`             | Popovers, sticky CTAs, construction panels   |
| `--bg-card`       | `#ffffff`             | `#111111`             | Cards (`.surface`)                           |
| `--bg-card-hover` | `#f5f4ef`             | `#161616`             | Card hover, muted and secondary fills        |
| `--border`        | `#e6e4dd`             | `#262626`             | Hairlines, card borders, inputs              |
| `--border-hover`  | `#c9c5bb`             | `#404040`             | Card border on hover                         |
| `--text`          | `#0a0a0a`             | `#fafafa`             | Primary text, primary button fill            |
| `--text-dim`      | `#525252`             | `#a3a3a3`             | Body copy, secondary text, nav links         |
| `--text-muted`    | `#a8a29e`             | `#525252`             | Meta labels, footers, empty states           |
| `--brand`         | `#c4421d`             | `#fb7a3c`             | Accent: eyebrows, active nav, dots, focus    |
| `--brand-light`   | `#e0541e`             | `#fda774`             | Accent hover                                 |
| `--brand-pure`    | `#fb7a3c`             | `#fb7a3c`             | Logo square (same in both themes)            |
| `--nav-bg`        | `rgba(255,255,255,.78)` | `rgba(10,10,10,.7)` | Translucent nav                              |
| `--hover-bg`      | `rgba(0,0,0,.035)`    | `rgba(255,255,255,.05)` | Subtle row hover                           |

shadcn's variables (`--background`, `--primary`, `--muted`, `--ring`, `--sidebar-*`, ...) are mapped onto these tokens so vendored components inherit the palette. `--ring` is the brand colour. Selection uses a brand background with white text.

Dark mode is class-based (`.dark` on `<html>`, via `next-themes`, default `system`).

## 3. Typography

- Sans: Geist (`--font-sans`), with `ss01` and `cv11` feature settings, 16px root, 1.55 line height.
- Mono: Geist Mono (`--font-mono`) for labels, buttons, meta, and identifiers.
- Display classes:
  - `.display-xl` — page titles. `clamp(1.9rem, 5.5vw, 4rem)`, weight 600, tracking `-0.04em`, leading 1.05.
  - `.display-md` — section titles. `clamp(1.5rem, 3.2vw, 2rem)`, weight 600, tracking `-0.03em`, leading 1.1.
  - `.display-tight` — card titles. Weight 600, tracking `-0.04em`, leading 1.05.
- Labels:
  - `.eyebrow` — mono, `0.72rem`, uppercase, `0.14em` tracking, brand colour, preceded by a 6px brand dot. Sits above every page and section title.
  - `.mono-label` — mono, `0.72rem`, uppercase, `0.08em` tracking, `--text-dim`. Used for `dt` labels and stat headings.
- Body copy is capped at a reading measure: `max-w-[42ch]` under hero titles, `52ch` for descriptions, `60ch` for community blurbs.

## 4. Shape, spacing, motion

- Radius: `--radius-sm` 4px (buttons), `--radius` 6px (cards, avatars), `--radius-lg` 8px, `--radius-xl` 12px.
- Container: `.container`, max width 1320px, 32px gutters (20px under 768px).
- Page rhythm: `pt-28 pb-16` under the fixed nav; `space-y-24` between home sections, `space-y-12` on inner pages.
- Headers end with a hairline (`.hairline-bottom`) and `pb-8`–`pb-10`.
- Easing: `--transition` = `cubic-bezier(0.4, 0, 0.2, 1)`; colour transitions 0.2–0.3s.
- `[data-reveal]` fades and rises 12px on scroll into view.
- `prefers-reduced-motion` collapses all animation and transition durations.
- Focus: 2px brand outline, 2px offset, on `:focus-visible` only.

## 5. Primitives

| Class             | What it is                                                              |
| ----------------- | ----------------------------------------------------------------------- |
| `.surface`        | Card: `--bg-card`, 1px `--border`, `--radius`                           |
| `.surface-hover`  | Adds hover fill `--bg-card-hover` and border `--border-hover`           |
| `.hairline-top` / `.hairline-bottom` | 1px `--border` rule                                  |
| `.brand-dot`      | 6px brand circle                                                        |
| `.text-dim` / `.text-muted` / `.text-brand` | Colour shortcuts                              |

## 6. Components

### Buttons and links

- Primary: `--text` fill, `--bg` text, mono `0.78rem` uppercase, `0.06em` tracking, `px-5 py-3`, `--radius-sm`, trailing `ArrowUpRight` icon.
- Secondary: transparent with a 1px `--border`; border turns `--text` on hover.
- Inline action link: mono uppercase, `--text-dim`, turns brand on hover, trailing arrow that nudges up-right on group hover.

### Navigation (`src/components/nav.tsx`)

- Fixed, 64px tall, bottom hairline. Transparent at the top, `--bg` once scrolled past 8px.
- Wordmark: "vboard" in extrabold with `-0.045em` tracking, followed by a 10px `--brand-pure` square.
- Links: mono uppercase `0.78rem`. Active link is brand-coloured with a 2px brand underline.
- A 1px vertical divider separates site links from Sign in and the primary Join button. On mobile only Join is shown.

### Footer (`src/components/footer.tsx`)

- Top hairline, wordmark with an 8px square and tagline, mono-label links, and a muted bottom bar with the year and licence.

### Post card (`src/components/post-card.tsx`)

- `.surface .surface-hover`, `p-6` (compact `p-5`).
- Meta row: community name with brand dot on the left; "Event" (dim) or "Note" (muted) mono tag on the right.
- Title in `.display-tight`, turns brand on card hover.
- Body preview trimmed on a word boundary (180 chars, compact 110).
- Event strip: a four-column grid of When / Where / Spots / Status, each a tiny uppercase label above a mono value. Location hidden behind a lock icon when `after_approval`.
- Footer row: author in mono, action link Register / Request / Read.
- Pinned posts carry a brand dot in the top-right corner.

### Event calendar (`src/components/event-calendar.tsx`)

- Two columns on desktop: the calendar inside a `.surface`, the selected day on the right.
- Days with events get a semibold number and a 4px brand dot beneath.
- Right column: eyebrow with the long date, `.display-md` count ("Nothing scheduled" / "N events"), then compact post cards or a muted empty state.
- Dates are formatted and grouped in `Asia/Kolkata` so server and client agree.

### Detail pages

- Back link in mono uppercase at the top.
- Community header: 56px ink square with the community initial, eyebrow, `.display-xl` name, blurb, inline mono stats.
- Post header: community link with dot, Event/Note label, VIT-only lock label, `.display-xl` title, mono byline.
- Event meta: a `.surface` split into three cells (When / Where / Capacity) with dividers.
- Registration CTA: sticky to the bottom of the viewport, elevated surface, state text on the left, primary button on the right.

### Under construction

- `UnderConstruction`: elevated surface with eyebrow, `.display-md` title, description, phase tag, and a "What's coming" list with brand bullets.
- `DevelopmentNotice`: brand-bordered strip with an 8% brand tint.
- `ComingSoon`: centred eyebrow, title, one line, and a primary button back to Discover.

## 7. Rules

1. Use tokens, never raw hex values, in components.
2. One accent at a time. Brand orange marks the active, the selected, and the important; it is not decoration.
3. Every page title has an eyebrow above it.
4. Labels and actions are mono uppercase; reading text is sans sentence case.
5. Colour never carries meaning alone: pair it with text or an icon.
6. Keep surfaces flat: borders, not shadows.
