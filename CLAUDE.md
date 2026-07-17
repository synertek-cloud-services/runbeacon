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
- Reference design: static HTML/CSS/JS mockup (see /reference/runbeacon-landing.html)
  — dark-mode-default with light toggle, hero, cost-comparison section, pillars
  section. Treat as the visual/copy source of truth, not necessarily the final
  code structure.
- Target stack: Astro on Cloudflare Pages, matching the existing Restrayn
  waitlist project pattern (D1 + Workers + Resend for the signup flow).
- Deploy target: Cloudflare Pages under the synertek-cloud-services account.
  Domain runbeacon.net is already registered and the zone should already exist
  in that account.

## Positioning / copy direction
Two angles, roughly equal weight:
1. Cost — commercial RMM platforms charge per-endpoint, forever. RunBeacon is
   free to self-host, or one flat rate hosted.
2. Openness — fully open source, self-hostable, no vendor lock-in.

Tone: built by an MSP that got tired of paying per-endpoint RMM fees
themselves. Practical, not hype-y. No corporate filler.

## Functional requirements
- [ ] Email waitlist signup — needs real backend: Cloudflare Worker + D1
      (waitlist table) + Resend for confirmation email. Reuse the
      Restrayn waitlist schema/pattern if reasonable rather than
      reinventing it.
- [ ] Dark/light theme toggle — session-only, no persistence required
- [ ] Responsive down to mobile
- [ ] Deploy to Cloudflare Pages, runbeacon.net

## Explicitly out of scope for this pass
- Actual product functionality (agent, dashboard, monitoring)
- Auth / accounts
- Anything beyond the waitlist capture

## Notes
- Keep Synertek's involvement present but secondary — footer credit is fine,
  don't lead with it in the hero or nav.