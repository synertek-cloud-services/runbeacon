# RunBeacon Style Guide

## Color system

All colors are CSS custom properties. Never hardcode hex values in components —
always reference the variable.

Palette matches the Beacon RMM product's shipped default dashboard theme
(`beacon/dashboard/src/style.css` + `theme.ts`) for dark mode, 1:1. Light mode
is independently derived (the product is dark-only) using the same hues,
darkened for contrast on a light background.

### Dark theme (default — `:root`)
| Variable | Value | Usage |
|---|---|---|
| `--bg` | `#0c0e16` | Page background |
| `--surface` | `#141720` | Cards, inputs, nav |
| `--surface-2` | `#1c1f2e` | Highlighted card (RunBeacon compare col) |
| `--surface-brand` | `#1d1235` | Hosted/SaaS section background |
| `--border` | `#282d40` | All borders and dividers |
| `--text` | `#e6e9f5` | Primary text |
| `--text-dim` | `#a2a8c1` | Body copy, secondary text |
| `--text-faint` | `#7f86a3` | Labels, notes, placeholders |
| `--primary` | `#4169e1` | Primary accent — CTAs, logo mark, stats, OSS "available now" badge |
| `--primary-hover` | `#4871e0` | Primary button hover state |
| `--primary-dim` | `rgba(65,105,225,0.12)` | Primary tint backgrounds |
| `--success` | `#2dcfa0` | Secondary accent — section tags, checkmarks |
| `--success-bg` | `rgba(45,207,160,0.10)` | Form success message background |
| `--warning` | `#f0a840` | Hosted/SaaS "beta, not yet launched" badge |
| `--warning-dim` | `rgba(240,168,64,0.12)` | Warning tint backgrounds |
| `--dot` | `#2a3350` | Radar field inactive dots |
| `--dot-lit` | `var(--primary)` | Radar field active dots |

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
color: var(--primary);  /* or var(--success) for section tags */
```
- Hero eyebrow (OSS, "available now"): primary-blue pill badge with border
- Hosted/SaaS section badge ("beta, not yet launched"): `--warning`/`--warning-dim`
  instead of `--primary`/`--primary-dim` — the color distinction is intentional,
  signaling the two offerings are at different availability stages
- Section tags (`// THE PROBLEM`): success green, no background, `display: block`
  (hosted section's tag uses `--warning` instead, same reasoning as above)

### Cards / compare grid
- `background: var(--border)` on the grid container (creates 1px gap effect)
- `background: var(--surface)` on each cell
- Highlighted cell: `background: var(--surface-2)`
- `border-radius: 12px` on container, `overflow: hidden`

### Logo mark / beacon dot
```css
border-radius: 50%;
background: var(--primary);
box-shadow: 0 0 0 4px var(--primary-dim), 0 0 16px 2px var(--primary);
animation: pulse-mark 2.4s ease-in-out infinite;
```

### Buttons (primary)
```css
background: var(--primary);
color: #ffffff;
font-weight: 600;
border: none;
border-radius: 8px;
padding: 13px 22px;
```
Hover: `background: var(--primary-hover)` (button text is white since
`--primary` is a mid-tone blue, not a light hue like the old amber — dark
text would fail contrast)

### Form inputs
```css
border: 1px solid var(--border);
background: var(--surface);
color: var(--text);
border-radius: 8px;
padding: 13px 16px;
```
Focus: `outline: 2px solid var(--primary); outline-offset: 1px`

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
