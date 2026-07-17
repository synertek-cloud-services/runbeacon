# RunBeacon — Coming Soon Landing Page

## Project
Marketing/waitlist page for RunBeacon, the SaaS offering built on top of the
open-source Beacon RMM agent. Lives at runbeacon.net. This is pre-launch —
product itself is not built yet, this is just the landing page + waitlist.

## Naming context (don't confuse these)
- **beacon** — the OSS core repo (Go agent + Cloudflare control plane), under
  synertek-cloud-services org. Self-hosters use this directly.
- **RunBeacon** — this project. The hosted SaaS brand, standalone domain
  (runbeacon.net), Synertek-affiliated but not Synertek-branded up front.
- **rmm.cloud.synertekcs.com** — Synertek's own internal instance of Beacon.
  Not related to this repo.

## Stack
- **Framework:** Astro 5 with `@astrojs/cloudflare` adapter (SSR mode for the
  API route, static for the index page)
- **Styles:** Tailwind CSS v4 (CSS-first config) for layout utilities; all
  colors via CSS custom properties (`var(--amber)`, `var(--bg)`, etc.)
- **Fonts:** `@fontsource` packages — Space Grotesk (headings), Inter (body),
  JetBrains Mono (labels/stats/code tags)
- **Backend:** Cloudflare Pages Functions via Astro API route
  (`src/pages/api/subscribe.ts`) — D1 for storage, Resend for email
- **Deploy:** Cloudflare Pages, `synertek-cloud-services` Cloudflare account
  (account ID: `8fefd04d62780c1624579795cb08f891`)
- **Repo:** https://github.com/synertek-cloud-services/runbeacon
- **Reference design:** `/reference/runbeacon-landing.html` — source of truth
  for visual design and copy

## Infrastructure (already provisioned)
- **Pages project:** `runbeacon` on Cloudflare Pages
- **Live URL:** https://runbeacon.pages.dev (also https://02ce63a0.runbeacon.pages.dev)
- **Custom domain:** `runbeacon.net` — added to Pages project, cert pending
  at end of last session (should be active now)
- **D1 database:** `runbeacon-db` (ID: `509aef3f-58a4-4f8e-b7cb-9fb3b8d221ed`)
  — created and schema applied (both local and remote)
- **Env vars set in Pages:** `RESEND_FROM_EMAIL=hello@runbeacon.net`,
  `TEAM_NOTIFY_EMAIL=jeremys@codenexus.org`
- **Missing:** `RESEND_API_KEY` secret — not yet set, Resend domain verification
  tabled until Resend pricing is sorted

## Architecture
```
src/
  layouts/Layout.astro          HTML shell — data-theme="dark" default,
                                theme toggle script, meta/OG tags
  pages/
    index.astro                 Single page — all sections inline with
                                scoped <style> block
    api/subscribe.ts            POST endpoint — D1 insert + Resend emails
                                export const prerender = false
  components/
    WaitlistForm.astro          Email input + submit, fetch to /api/subscribe,
                                inline success/error states
  styles/global.css             CSS custom properties (dark/light themes),
                                @fontsource imports, Tailwind @theme tokens
public/
  favicon.svg                   Amber beacon dot SVG
schema.sql                      subscribers + engagement_log tables
wrangler.toml                   Pages config, D1 binding, plain-text vars
```

## Coding patterns established
- **Theme system:** CSS custom properties on `:root` (dark) and
  `[data-theme="light"]`. Toggle script lives in `Layout.astro` inline
  `<script>`. No localStorage persistence — session only.
- **Colors:** Never use Tailwind color classes for brand colors. Always
  reference `var(--amber)`, `var(--teal)`, `var(--bg)`, etc. directly in
  `<style>` blocks or inline styles.
- **API route pattern:** Mirrors Restrayn's `subscribe.ts` — validate email,
  D1 insert with UNIQUE constraint duplicate handling, Resend via raw fetch
  (not the Resend SDK), non-fatal email failures, `export const prerender = false`.
- **Env access:** `(locals as { runtime?: { env?: Env } }).runtime?.env` —
  same Cloudflare adapter pattern as Restrayn.
- **WaitlistForm:** Uses inline styles (not Tailwind classes) to inherit CSS
  custom properties. Script uses `define:vars` pattern isn't needed here —
  just plain `<script>` with direct DOM IDs.

## Functional requirements status
- [x] Email waitlist signup — D1 insert works; Resend wired but key not set
- [x] Dark/light theme toggle — session-only
- [x] Responsive to mobile
- [x] Deployed to Cloudflare Pages, runbeacon.net

## Explicitly out of scope for this pass
- Actual product functionality (agent, dashboard, monitoring)
- Auth / accounts
- Anything beyond the waitlist capture

## Deployment commands
```bash
pnpm build && npx wrangler pages deploy dist --project-name runbeacon --branch main
# or just:
pnpm release
```

## Notes
- Keep Synertek's involvement present but secondary — footer credit is fine,
  don't lead with it in the hero or nav.
- Do not add Co-Authored-By lines to git commits.
- Restrayn project at `/home/jeremys/projects/restrayn` is the reference
  pattern for stack/infra decisions.
