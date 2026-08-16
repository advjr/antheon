# CLAUDE.md — agents/

This file gives Claude Code context for everything happening inside `agents/`, and keeps a dated
running log of work so each session can pick up where the last one left off.

## What this folder is for

Building out Antheon's social media presence from scratch — strategy, content creation, and
performance analysis for the company's accounts (LinkedIn, Twitter/X, Threads, Bluesky as
text-first platforms; Facebook, Instagram, TikTok, Pinterest as caption-only visual platforms).

The work is powered by Claude Agent Skills installed under `.agents/skills/`, sourced from the
[`blacktwist/social-media-skills`](https://github.com/blacktwist/social-media-skills) repo (cloned
locally into `social-media-skills/` as a reference copy — not itself part of the deployed skillset).

### Skills installed (`.agents/skills/`)

- **Foundation**: `social-media-context-sms` — captures platform/audience/tone context all other skills read from. Fill this in first.
- **Strategy**: `content-strategy-sms`, `content-calendar-sms`, `platform-strategy-sms`
- **Creation**: `post-writer-sms`, `thread-writer-sms`, `carousel-writer-sms`, `caption-writer-sms`, `content-repurposer-sms`, `hook-writer-sms`
- **Analysis**: `performance-analyzer-sms`, `audience-growth-tracker-sms`, `content-pattern-analyzer-sms`, `optimization-advisor-sms`

Optional integration: [BlackTwist](https://blacktwist.app/mcp) MCP server for actually publishing/scheduling
and pulling live analytics. Without it, skills run in advisory mode (they draft content/instructions
for manual posting).

### Image/video generation — Higgsfield

The [Higgsfield CLI](https://higgsfield.ai) (`@higgsfield/cli`, installed globally) generates the
actual images/videos that go with posts — the social-media-skills only write copy, they don't
produce visuals. Authenticated as `deverajranthony@gmail.com`, workspace `Private` (free plan).
Companion skills installed via `npx skills add higgsfield-ai/skills` into `.agents/skills/`:
`higgsfield-generate` (general image/video/3D/audio), `higgsfield-product-photoshoot` (brand/product
visuals — the one to use for case-study and "real results" post images), `higgsfield-brandkit`,
`higgsfield-marketplace-cards`, `higgsfield-soul-id`, `higgsfield-video-explainer`,
`higgsfield-websites`, `higgsfield-youtube-thumbnail`, `higgsfield-game-generation`.

Free-plan credits are limited (10 at signup) — check `higgsfield account status` before generating in
bulk.

### Known repo state (as of 2026-08-05)

The old `brando/` CRM/agent project (and its supporting files: `.mcp.json`, `.env.example`, old
`CLAUDE.md`/`README.md`, `package.json`, etc.) has been fully removed per the user's decision —
not restored, deletion committed. `agents/` now only contains the social media skills work.

## Room for improvement (living list — update as work progresses)

- No BlackTwist MCP connection configured yet — everything currently runs advisory-only (draft +
  manual post).
- No content calendar defined yet.
- Real LinkedIn/Instagram handles and current/target posting frequency still needed in
  `social-media-context-sms.md` (marked TBD).
- No LinkedIn example posts captured yet (only Instagram examples exist so far, pulled from
  `marketing/antheon-ig-playbook.md`).
- Higgsfield free-plan credits (10) will run out fast — revisit plan/paid tier once real production
  starts.
- Three Higgsfield companion skills (`higgsfield-marketplace-cards`, `higgsfield-product-photoshoot`,
  `higgsfield-youtube-thumbnail`) were flagged "High Risk" by the `skills` CLI's built-in scanner at
  install time. Spot-checked `higgsfield-product-photoshoot`'s SKILL.md — content looks like a normal
  CLI-wrapper instruction file, no injection/exfiltration found, but the other flagged skills' full
  `references/*.md` files haven't been read yet.

## Session Log

Each session should append a dated entry below (newest at the bottom is fine, or newest on top —
pick one and stay consistent within a day). Include: what was done, why, and what's next.

### 2026-08-05

- Cloned `blacktwist/social-media-skills` into `agents/social-media-skills/`.
- Installed the 14 social media skills into `agents/.agents/skills/` (foundation, strategy,
  creation, analysis categories — see list above).
- Fix note: `cp -r` in PowerShell (aliased to `Copy-Item -Recurse`) fails merging directory trees
  when the destination already has a file with the same name as a source item ("Container cannot
  be copied onto existing leaf item"). Used `robocopy <src> <dst> /E` instead — it merges cleanly.
- Flagged uncommitted deletions of the old `brando/` project under `agents/`; user confirmed full
  removal — committed the deletion (see below).
- Committed removal of the `brando/` project entirely (CRM/agent app, `.mcp.json`, `.env.example`,
  old `CLAUDE.md`/`README.md`, `package.json`, `tsconfig.json`, `asset/brando-*.png`, `.claude/agents/brando.md`).
  `agents/` is now scoped solely to the social media skills build.
- Filled out `.agents/social-media-context-sms.md` using Antheon's homepage copy/positioning
  (d:\antheon\index.htm) plus the existing `marketing/antheon-ig-playbook.md` for ready-made
  Instagram example posts. Voice set to professional/convincing; LinkedIn goal = visibility +
  authenticity; Instagram goal = visibility via case studies, systems/automation education, website
  advice, AI news, and light industry humor (calibrated against user-given references: web_pros for
  format/confidence, catmemes.hub as a humor *ceiling*, not a target).
- Installed and configured Higgsfield for image/video generation (see section above). Installer's
  `npm i -g @higgsfield/cli` postinstall script is broken on this Windows/Git-Bash setup — Node's
  `https` module fails to download the release tarball, and even when downloaded manually, `tar`
  chokes on the absolute Windows path with a drive-letter colon. Workaround: `npm i -g @higgsfield/cli
  --ignore-scripts`, then manually `curl`-download the tarball into the package's `vendor/` dir and
  extract with a **relative** path (`cd vendor && tar -xzf file.tar.gz hf.exe`) to dodge the path bug.
  Re-apply this workaround on any future reinstall/upgrade of `@higgsfield/cli` on this machine.
- **Next**: get real LinkedIn/Instagram handles and posting frequency from the user; decide on
  BlackTwist vs. continued manual posting; try a first Higgsfield-generated visual for one of the
  playbook's carousel ideas.
