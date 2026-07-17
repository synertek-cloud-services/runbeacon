# RunBeacon — Coming Soon Landing Page

## Project
Marketing/waitlist page for RunBeacon, the SaaS offering built on top of the
open-source Beacon RMM agent. Lives at runbeacon.net. This is pre-launch —
product itself is not built yet, this is just the landing page + waitlist.

## Naming conventions (critical — don't mix these up)
- **Beacon** — the product name. Capital B. Used in body copy, email templates,
  section descriptions. This is the RMM agent people are signing up for.
- **RunBeacon** — the site/domain brand only. Used in the nav logo, page title,
  and when referring to the SaaS service specifically ("RunBeacon flips that").
  Never used in place of Beacon when describing the product.
- **beacon** (lowercase) — the OSS repo name on GitHub
  (`synertek-cloud-services/beacon`). Lowercase in URLs and code references only.
- **rmm.cloud.synertekcs.com** — Synertek's internal Beacon instance. Not
  related to this repo.

## Positioning (established session 2)
The pitch is **no startup commitment**, not "no per-endpoint pricing." RunBeacon
hosted will charge per endpoint but with no minimums, no annual contracts, no
large buy-in. Self-hosting the beacon agent is free forever. The problem with
incumbents is front-loaded cost and licensing tiers that gate basic features
before you've proven the business.

## Stack
- **Framework:** Astro 5 with `@astrojs/cloudflare` adapter (SSR mode for the
  API route, static for the index page)
- **Styles:** Tailwind CSS v4 (CSS-first config) for layout utilities; all
  colors via CSS custom properties (`var(--amber)`, `var(--bg)`, etc.)
- **Fonts:** `@fontsource` packages — Space Grotesk (headings), Inter (body),
  JetBrains Mono (labels/stats/code tags)
- **Email:** Amazon SES v2 API via `aws4fetch` — SigV4 signing, raw HTTP,
  no AWS SDK. Region: `us-west-2`. Identity: `runbeacon.net` (verified).
- **Backend:** Cloudflare Pages Functions via Astro API route
  (`src/pages/api/subscribe.ts`) — D1 for storage, SES for email
- **Deploy:** Cloudflare Pages, `synertek-cloud-services` Cloudflare account
  (account ID: `8fefd04d62780c1624579795cb08f891`)
- **Repo:** https://github.com/synertek-cloud-services/runbeacon
- **Reference design:** `/reference/runbeacon-landing.html` — source of truth
  for visual design and copy

## Infrastructure (fully provisioned)
- **Pages project:** `runbeacon` on Cloudflare Pages
- **Live URL:** https://runbeacon.pages.dev
- **Custom domain:** `runbeacon.net` — active
- **D1 database:** `runbeacon-db` (ID: `509aef3f-58a4-4f8e-b7cb-9fb3b8d221ed`)
  — schema applied (local and remote)
- **Env vars in Pages (plain-text):** `FROM_EMAIL=hello@runbeacon.net`,
  `TEAM_NOTIFY_EMAIL=hello@runbeacon.net`, `AWS_REGION=us-west-2`
- **Secrets in Pages:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- **SES production access:** requested, pending AWS approval (submitted session 2)
- **IAM user:** `runbeacon-ses` with `AmazonSESFullAccess`
- **Cloudflare creds:** `.envrc` at project root sets `CLOUDFLARE_API_TOKEN`
  and `CLOUDFLARE_ACCOUNT_ID` for the synertek account (direnv)

## Architecture
```
src/
  layouts/Layout.astro          HTML shell — data-theme="dark" default,
                                theme toggle script, meta/OG tags
  pages/
    index.astro                 Single page — all sections inline with
                                scoped <style> block
    api/subscribe.ts            POST endpoint — D1 insert + SES emails
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
.envrc                          Local Cloudflare creds (gitignored, direnv)
```

## Coding patterns established
- **Theme system:** CSS custom properties on `:root` (dark) and
  `[data-theme="light"]`. Toggle script lives in `Layout.astro` inline
  `<script>`. No localStorage persistence — session only.
- **Colors:** Never use Tailwind color classes for brand colors. Always
  reference `var(--amber)`, `var(--teal)`, `var(--bg)`, etc. directly in
  `<style>` blocks or inline styles.
- **SES email pattern:** `AwsClient` from `aws4fetch`, instantiated per-request
  in `subscribe.ts`. Endpoint: `https://email.${AWS_REGION}.amazonaws.com/v2/email/outbound-emails`.
  SES v2 JSON body format. Email failures are non-fatal — subscriber already
  saved in D1 before email attempt.
- **Email templates:** Use light theme color values hardcoded as inline styles
  (not CSS vars — email clients don't support them). White background, amber
  (`#d97a1f`) header/accents, `#5b6470` body text. Safe across all email clients.
- **Env access:** `(locals as { runtime?: { env?: Env } }).runtime?.env` —
  Cloudflare adapter pattern.
- **WaitlistForm:** Uses inline styles (not Tailwind classes) to inherit CSS
  custom properties. Plain `<script>` with direct DOM IDs.

## Functional requirements status
- [x] Email waitlist signup — D1 insert works
- [x] SES confirmation email — wired, pending AWS production access approval
- [x] Dark/light theme toggle — session-only
- [x] Responsive to mobile
- [x] Deployed to Cloudflare Pages, runbeacon.net

## Compliance todos (before sending launch email)
- [ ] Unsubscribe endpoint (`/api/unsubscribe`) + link in launch email
- [ ] Physical mailing address in launch email (CAN-SPAM)
- [ ] SNS bounce/complaint notifications → email alert
- Deletion requests: honor by removing row from D1, contact via hello@runbeacon.net

## Explicitly out of scope for this pass
- Actual product functionality (agent, dashboard, monitoring)
- Auth / accounts
- Anything beyond the waitlist capture

## Deployment commands
```bash
pnpm release   # builds + deploys to Cloudflare Pages
```

## Notes
- Keep Synertek's involvement present but secondary — footer credit is fine,
  don't lead with it in the hero or nav.
- Do not add Co-Authored-By lines to git commits.
- Restrayn project at `/home/jeremys/projects/restrayn` is the reference
  pattern for stack/infra decisions.
- Email provider was Resend in session 1, switched to SES in session 2.
  Do not reintroduce Resend.
