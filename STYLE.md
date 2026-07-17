# RunBeacon Style Guide

## Color system

All colors are CSS custom properties. Never hardcode hex values in components —
always reference the variable.

### Dark theme (default — `:root`)
| Variable | Value | Usage |
|---|---|---|
| `--bg` | `#0a0d12` | Page background |
| `--surface` | `#12161d` | Cards, inputs, nav |
| `--surface-2` | `#171c24` | Highlighted card (RunBeacon compare col) |
| `--border` | `#1e242c` | All borders and dividers |
| `--text` | `#f2f4f7` | Primary text |
| `--text-dim` | `#9aa5b1` | Body copy, secondary text |
| `--text-faint` | `#5b6470` | Labels, notes, placeholders |
| `--amber` | `#ffa23c` | Primary accent — CTAs, logo mark, stats |
| `--amber-dim` | `rgba(255,162,60,0.12)` | Amber tint backgrounds |
| `--teal` | `#3ddbd9` | Secondary accent — section tags, checkmarks |
| `--dot` | `#2a323d` | Radar field inactive dots |
| `--dot-lit` | `#ffa23c` | Radar field active dots |
| `--success-bg` | `rgba(61,219,217,0.10)` | Form success message background |

### Light theme (`[data-theme="light"]`)
Same variables, different values — see `src/styles/global.css`.

## Typography

| Role | Font | Tailwind token | Where used |
|---|---|---|---|
| Body / UI | Inter | `font-sans` | Everything by default |
| Display / headings | Space Grotesk | `font-display` (via CSS var) | h1, h2, h3, logo, pillar titles |
| Mono labels | JetBrains Mono | `font-mono` | `section-tag`, `eyebrow`, `stat-num`, `compare-label`, `compare-price` |

Apply display font with `font-family: var(--font-display)` in scoped styles,
not a Tailwind class (Tailwind only has `font-sans` and `font-mono` defined).

## Layout

- Max content width: `1080px` (`.section-inner`)
- Horizontal padding: `clamp(20px, 5vw, 64px)` — used on nav, sections, footer
- Section vertical padding: `90px` top and bottom
- All sections have `border-top: 1px solid var(--border)`

## Component patterns

### Eyebrow / section tag
```css
font-family: var(--font-mono);
font-size: 12px;
color: var(--amber);  /* or var(--teal) for section tags */
```
- Hero eyebrow: amber pill badge with border
- Section tags (`// THE PROBLEM`): teal, no background, `display: block`

### Cards / compare grid
- `background: var(--border)` on the grid container (creates 1px gap effect)
- `background: var(--surface)` on each cell
- Highlighted cell: `background: var(--surface-2)`
- `border-radius: 12px` on container, `overflow: hidden`

### Logo mark / beacon dot
```css
border-radius: 50%;
background: var(--amber);
box-shadow: 0 0 0 4px var(--amber-dim), 0 0 16px 2px var(--amber);
animation: pulse-mark 2.4s ease-in-out infinite;
```

### Buttons (primary)
```css
background: var(--amber);
color: #14100a;
font-weight: 600;
border: none;
border-radius: 8px;
padding: 13px 22px;
```
Hover: `box-shadow: 0 0 0 4px var(--amber-dim)`

### Form inputs
```css
border: 1px solid var(--border);
background: var(--surface);
color: var(--text);
border-radius: 8px;
padding: 13px 16px;
```
Focus: `outline: 2px solid var(--amber); outline-offset: 1px`

## Theme toggle

- Controlled by `data-theme` attribute on `<html>`
- Toggle script lives in `Layout.astro` as an inline `<script>` tag
- Moon icon shown in dark mode, sun icon in light mode
- No `localStorage` — session only by design

## Responsive breakpoints

- `720px` — cost compare grid collapses to single column
- `860px` — pillars grid collapses to single column
- Mobile padding via `clamp()` throughout — no explicit breakpoints needed
  for padding/font-size
