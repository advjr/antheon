# Magna Constructions — Website Rebuild (Proposal Build)

A multi-page, long-form rebuild of **magnaco.com.au**, redesigned in a
"Dark Prestige" style: industrial safety-orange (`#F58220`) on charcoal,
Montserrat throughout, using Magna's real content, services, licences,
testimonials and imagery.

Built to Antheon web standards (typography floors, balanced headings,
sticky emergency CTA bar, scroll reveals, reduced-motion support,
LocalBusiness + FAQ + Breadcrumb + Service schema, OpenGraph, favicon).

---

## Pages

| File | Purpose |
|------|---------|
| `index.htm` | Long-form homepage: hero, stats, about teaser, who-we-help, services grid, "how a claim works" process, insurance repairs, values, coverage + licences, client/insurer portal with live **Track Your Claim** demo, testimonials, FAQ, existing-customer band. |
| `about.htm` | Company story, MD Chris Packham, values, credentials (management systems / licences / insurances), coverage. |
| `services.htm` | Detailed breakdown of all five services + process. |
| `contact.htm` | Contact details, enquiry form (front-end demo), emergency CTA. |

Shared assets: `css/styles.css`, `js/main.js`, `images/`.

---

## The photos (please read)

The four photographs on the pages are Magna's own, currently **hot-linked
from the live site** so the pages render immediately with real imagery for
the pitch. To make the folder fully self-contained (offline / hosted
elsewhere), run:

```bash
bash fetch-real-photos.sh
```

This downloads `hero.jpg`, `intro.jpg`, `large-loss.jpg` and `slide.jpg`
into `images/` and rewrites the HTML to load them locally. (I couldn't
bundle the binaries directly from my build environment — outbound access to
`magnaco.com.au` was blocked — hence the one-command script.)

## Brand assets generated for this build

- `images/magna-logo-white.svg` — reversed (white + orange) wordmark for the
  dark theme. *Note:* it renders with Montserrat, which the pages load from
  Google Fonts. For pixel-perfect fidelity, drop in Magna's official
  white/reversed logo if they have a vector version.
- `images/favicon.ico` + `images/apple-touch-icon.png` — orange "M" mark.
- `images/og-share.jpg` — 1200×1200 branded social-share image.

---

## Running locally

It's static HTML — just open `index.htm`, or serve the folder:

```bash
python3 -m http.server 8000    # then visit http://localhost:8000/index.htm
```

## Before go-live

1. Run `fetch-real-photos.sh` (or drop the real photos into `images/`).
2. Wire the enquiry form (`form.enq` in `contact.htm`) to a real handler /
   email endpoint — it currently shows a front-end success message only.
3. Point the **Pay Excess** / portal buttons at the real portal URL.
4. Replace the Google Tag Manager placeholder in `index.htm` (`GTM-XXXXXXX`)
   and add your GA4 / Meta Pixel IDs (analytics-tracking).
5. Confirm the OG image URL / canonical domain match the production host.

---

## Notes on the "system" angle

The homepage includes a working **Track Your Claim** demo (client/insurer
portal concept) with two sample references — `MGN-2025-0148` and
`MGN-2025-0090` — to show how a claim-status system could sit on top of the
site. It runs entirely in-browser (no backend) purely to demonstrate the UX.
