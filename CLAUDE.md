# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Static HTML/CSS/JS site(s) for Antheon (antheonph.com) — a systems/CRM/automation agency — plus a portfolio of client project rebuilds and a personal resume/CV site. There is no build system, package manager, or framework: every page is hand-authored HTML with inline `<style>`/`<script>` or plain JS/CSS files loaded directly by the browser.

## Running locally

No build/install step. Serve any folder as static files and open the relevant `index.html`/`index.htm`:

```bash
python3 -m http.server 8000
```

There is no lint or test suite in this repo — verify changes by opening the page in a browser.

## Structure

- `index.htm` — Antheon marketing homepage (root site, antheonph.com).
- `system-playbook.html` — "Systems Playbook" page for Antheon.
- `dashboard/` — dashboard demo/sample pages (`index.html`, `preview.html`, `sample.html`, `project/`).
- `resume/` — Anthony De Vera Jr.'s personal resume/portfolio site, with its own copies of project case studies under `resume/projects/` and shared media in `resume/asset/`.
- `projects/` — client project rebuilds, each a self-contained static site in its own folder:
  - `indielanephotography/`
  - `lakeviewdental/`
  - `magna-constructions/` (see its own `README.md` for build notes, photo-fetch script, and pre-go-live checklist)
  - `optimumep/` (largest — many multi-page subsections: team bios, services, blog, timetable, etc.)
- `asset/` — shared root-level media (banners, screenshots, OG images) for the Antheon site.

`resume/projects/*` mirrors `projects/*` — these are duplicated per-site copies, not symlinks, so a change intended for both needs to be applied twice.

## Conventions across these builds

- Pages follow "Antheon web standards": typography floors, balanced headings, scroll reveals with `prefers-reduced-motion` support, JSON-LD schema (LocalBusiness + FAQ + Breadcrumb + Service where relevant), OpenGraph/Twitter card meta, and a favicon.
- Client rebuilds are built as pitch/proposal demos: forms are front-end only (no real backend), analytics IDs (GTM/GA4/Meta Pixel) are placeholders to be swapped before go-live, and any "portal"/tracking UI is an in-browser mock, not a real system.
- `.mov` files under `projects/assets/`, `resume/asset/*.mov`, and `resume/asset/testimonial/originals/` are git-ignored (raw source recordings) — don't expect them to be present after a fresh clone.
- Avoid em dashes (—) in written content (copy, headings, alt text, meta descriptions). Use commas, periods, or a colon instead.
- When building a new page or sub-page, include the same "Shared scroll controller" behavior used in `index.htm`: eased anchor-jump scrolling for in-page `#` links, plus a slow, trailing momentum effect on desktop mouse-wheel scroll (skipped on touch devices, since native touch scrolling shouldn't be hijacked). Copy the pattern from `index.htm`'s scroll controller script rather than reinventing it.
- On a sub-page's own header/nav, the Antheon logo should NOT link out to the main Antheon site by default. Instead, give the page's top content an `id="top"` and point the logo's link at `href="#top"`, so clicking it scrolls back up to that sub-page's own hero/intro section (using the same eased scroll controller above), not away to `index.htm`. Only link the logo out to the main site if explicitly asked to.
