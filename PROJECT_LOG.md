# Project Log

## Session 1 — 2026-07-16

### What we finished
- Scaffolded the full Astro project from scratch, matching the Restrayn stack
- Built the single-page landing: nav, hero with animated radar dot field,
  stat strip, cost comparison grid, pillars section, footer
- Implemented dark/light theme toggle (CSS custom properties, session-only)
- Built `WaitlistForm` component wired to `/api/subscribe`
- Implemented `src/pages/api/subscribe.ts` — D1 insert, duplicate handling,
  Resend confirmation email (both user confirm + team notify)
- Created and provisioned Cloudflare infrastructure:
  - D1 database `runbeacon-db` (schema applied remote)
  - Pages project `runbeacon` deployed
  - `runbeacon.net` custom domain added (cert was provisioning at session end)
- Pushed to https://github.com/synertek-cloud-services/runbeacon

### Key technical decisions
- **CSS custom properties over Tailwind for colors** — the dark/light theme
  toggle swaps `:root` vs `[data-theme="light"]` variable sets; using Tailwind
  color classes would require `dark:` variants everywhere and complicate the
  toggle. CSS vars are cleaner for this pattern.
- **Fonts via `@fontsource`** — avoids Google Fonts network dependency, keeps
  everything self-hosted via Cloudflare Pages CDN.
- **Simpler schema than Restrayn** — no `wants_to_contribute` field. Just
  `email` + `created_at` in `subscribers`. `engagement_log` kept for
  duplicate tracking.
- **Resend via raw `fetch`** — not the Resend SDK. Matches Restrayn pattern,
  avoids an extra dependency.

### What's blocked / deferred
- **Resend API key** — not set. User needs to sort out Resend domain pricing
  before `hello@runbeacon.net` can be a verified sender. The form still saves
  emails to D1; no subscriber data is lost.
- **`runbeacon.net` cert** — was provisioning at session end. Should be active
  now; check Cloudflare Pages dashboard if the domain isn't resolving.

### Next steps
1. **Wire up Resend** — once domain is verified, run:
   `npx wrangler pages secret put RESEND_API_KEY --project-name runbeacon`
2. **Verify the live site** — open runbeacon.net and confirm the page loads,
   theme toggle works, form submits (check D1 for the row)
3. **Consider `www` redirect** — check if `www.runbeacon.net` needs a separate
   Pages custom domain entry or a DNS redirect rule
