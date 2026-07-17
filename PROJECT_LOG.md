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

---

## Session 2 — 2026-07-16

### What we finished
- Added `.envrc` with synertek-cloud-services Cloudflare credentials
  (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`). Token sourced from
  `beacon-docs` project. `direnv allow` applied.
- Switched email provider from Resend to Amazon SES:
  - Installed `aws4fetch` for SigV4 request signing
  - Rewrote `subscribe.ts` to use SES v2 API directly (inline, no adapter layer)
  - Renamed `RESEND_FROM_EMAIL` → `FROM_EMAIL` in `wrangler.toml`
  - Added `AWS_REGION = "us-west-2"` to `wrangler.toml`
  - Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` as Pages secrets
  - IAM user `runbeacon-ses` created with `AmazonSESFullAccess`
  - `runbeacon.net` already verified in SES (us-west-2), DKIM enabled
  - SES production access request submitted — awaiting AWS approval
- Rewrote landing page copy to reflect correct positioning:
  - Headline: "RMM that doesn't make you commit before you're ready."
  - Problem framing: no startup commitment / no minimums, not "no per-endpoint fees"
  - Compare grid updated: "no minimums or annual contracts" instead of "flat rate"
- Standardised product naming: **Beacon** (capital B) in all body copy and
  email templates; **RunBeacon** reserved for nav logo and brand references only
- Switched email template from dark theme to light theme colors (inline styles,
  safe across all email clients)

### Key technical decisions
- **SES over Resend** — user's preference; domain already verified in SES
- **aws4fetch not AWS SDK** — lightweight, edge-compatible, matches raw-fetch
  pattern already used for Resend. No adapter abstraction — single deployer SaaS,
  not worth the complexity.
- **us-west-2** — region SES identity was created in; matches `wrangler.toml`
- **Light theme for emails** — email clients don't support CSS vars or
  `data-theme`; hardcoded light palette is safe everywhere

### What's blocked / pending
- **SES production access** — AWS requested more info, response submitted.
  Approval typically same day. Until approved, emails are silently skipped
  (D1 still saves signups — no data lost).
- **SNS bounce/complaint notifications** — set up after production access
  is granted. Routes SES bounce/complaint events to an email alert.

### Next steps
1. **Confirm SES production access** — once approved, test end-to-end by
   submitting the live form and checking inbox + D1
2. **Set up SNS bounce/complaint notifications** — SES → SNS topic →
   email subscription. Protects sender reputation.
3. **Pre-launch email compliance** — before sending the launch email, add:
   - `/api/unsubscribe?token=xxx` endpoint + D1 delete
   - Unsubscribe link in launch email template
   - Physical mailing address in launch email (CAN-SPAM)
