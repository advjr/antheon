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

### Known repo state (as of 2026-08-05)

The old `brando/` CRM/agent project (and its supporting files: `.mcp.json`, `.env.example`, old
`CLAUDE.md`/`README.md`, `package.json`, etc.) has been fully removed per the user's decision —
not restored, deletion committed. `agents/` now only contains the social media skills work.

## Room for improvement (living list — update as work progresses)

- No `SKILL.md` yet filled out for `social-media-context-sms` — needed before other skills can produce
  on-brand output.
- No BlackTwist MCP connection configured yet — everything currently runs advisory-only (draft +
  manual post).
- No content calendar or content pillars defined yet.

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
- **Next**: fill out `social-media-context-sms` with Antheon's actual platform list, audience, and
  tone/voice so downstream skills (content strategy, post writer, etc.) have something real to work from.
