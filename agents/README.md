# Antheon Agents

AI agents for Antheon, built on the [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/typescript).
Each agent gets its own top-level folder. First agent: **Brando**, in [`brando/`](brando/).

## Brando — Head of Marketing

Brando runs Antheon's client/market research, prospect pipeline, proposal
drafting, and outreach copy — as a top-tier sales operator who knows Antheon
is a systems/process engineering partner, not a web design shop (see
`brando/app/persona.ts` for the full brief).

What he does:
- **Client / market research** — uses live web search to find real, named
  companies that fit Antheon's ICP (medium-to-large businesses with
  disconnected tools, manual SOPs, no real CRM, inconsistent follow-up).
- **Prospect list / lightweight CRM** — adds qualified prospects to a local
  CRM (`brando/app/data/crm/prospects.json`) with their specific pain points,
  and tracks status through researched → qualified → contacted → replied →
  proposal_sent → won/lost.
- **Proposal drafting** — writes system proposals structured around the
  client's process (Audit → Diagnose → Design → Build → Optimize), saved as
  markdown under `brando/app/output/proposals/`.
- **Outreach drafting** — writes cold email + follow-up sequences per
  prospect, saved under `brando/app/output/outreach/`, logged back to the
  CRM. **Option A only:** after you explicitly approve the email text,
  Brando stages it as a real draft in your Gmail account (via the Gmail
  connector's `create_draft` tool) — he never sends it himself; you open
  Gmail and hit Send yourself. There is no send tool wired up, by design.

## Setup

```bash
npm install
```

There are two ways to run Brando, depending on how you want to authenticate:

### Option A — Claude Code / Team Plan (no API key, no separate billing)

If you're logged into `claude` (the Claude Code CLI) with a Pro/Max/Team plan
that includes Claude Code, you can run Brando as a Claude Code **subagent**
instead of through the Agent SDK — this uses your existing subscription, not
pay-as-you-go API billing.

```bash
claude
```

You can chat with Brando two ways on this path:

1. **In the terminal** — from the interactive `claude` session, in this
   directory (`agents/`), invoke Brando by name (e.g.
   `@brando find me 5 mid-size logistics companies...`; use `/agents` to
   confirm `brando` is loaded).
2. **In a browser chat UI** (Option A-web, below) — a local page that looks
   like a normal chat website but is powered by the same Team Plan login.

Either way, Claude Code auto-loads:

- `.claude/agents/brando.md` — Brando's persona/system prompt as a subagent
  definition (same content as `brando/app/persona.ts` — see the note at the
  top of that file about keeping them in sync). **This file must stay at
  `.claude/agents/` at the project root** — that's a fixed Claude Code
  convention, not a choice we made, so it can't move into `brando/` itself.
- `.mcp.json` — registers the CRM and document-saving tools as standalone
  MCP servers (`brando/app/mcp/crm-server.ts`,
  `brando/app/mcp/documents-server.ts`), which run via `npx tsx` and share
  their data logic with the Agent SDK tools (`brando/app/lib/crm-store.ts`,
  `brando/app/lib/documents-store.ts`). **Also must stay at the project
  root** for Claude Code to auto-discover it.
- The Gmail connector already available to your Claude Code / claude.ai
  account — gives Brando a `create_draft` tool. This connector has no send
  capability at all (by the connector's own design), so the human always
  fires the actual send from Gmail.

**How the email approval flow works:** ask Brando to write outreach copy for
a prospect → he shows you the full email text in chat and saves a copy to
`brando/app/output/outreach/` → you approve it (or ask for edits) → only then
does he call `create_draft` to stage it in your Gmail as a real draft → you
open Gmail and click Send yourself. Brando never sends email — there's no
send tool available to him, and even if there were, sending on your behalf
always requires my explicit per-message confirmation in chat.

**Note on MCP trust:** project-scoped MCP servers (from `.mcp.json`) normally
need a one-time interactive trust approval before Claude Code will use them
in headless/non-interactive sessions (which is how both the terminal
`@brando` path and the web chat UI actually talk to Brando under the hood).
This repo already ships that approval as `.claude/settings.json` —
`{"enabledMcpServers": ["brando-crm", "brando-documents"]}` — so the CRM and
document tools work out of the box; you don't need to do anything extra. If
you add a new agent with its own MCP servers later, add their names to that
same array or they'll silently be missing from headless/web-chat sessions.

### Option A-web — Browser chat UI on your Team Plan (no API key)

Prefer a chat website over the terminal? Run the local web bridge:

```bash
npm run brando:web
```

Then open **http://127.0.0.1:4317** in your browser. It's a simple chat page
(message bubbles, example prompts, "New conversation" button, markdown
formatting) — the single HTML file lives at `brando/index.html`. Behind it, a
tiny local Node server (`brando/app/server.ts`) shells out to the `claude`
CLI in headless mode (`claude -p --agent brando …`) for each message — so it
uses the **same Team Plan login, no API key, no separate billing** as the
terminal path, and Brando's tools (CRM writes, Gmail drafts) work for real
once the one-time MCP trust step above is done.

Notes:
- It binds to `127.0.0.1` only — it's a **local, single-user tool**, not
  something to expose to a network. It runs the CLI with `bypassPermissions`
  (a browser can't answer a terminal permission prompt), so only run it in a
  project you trust.
- Keep the terminal running `npm run brando:web` open while you chat; Ctrl+C
  stops it.
- It keeps one conversation at a time (Brando remembers context turn to turn);
  "New conversation" starts him fresh. CRM/file changes are saved on disk
  regardless.
- Same email approval flow as everywhere else: Brando shows you outreach copy,
  you approve, then he stages a Gmail draft — he never sends.

### Option B — Agent SDK standalone CLI (requires ANTHROPIC_API_KEY)

```bash
cp .env.example .env   # then add your ANTHROPIC_API_KEY from console.anthropic.com
npm run brando
```

This opens a dedicated interactive terminal chat outside of Claude Code,
using the Agent SDK directly (`brando/app/cli.ts`). It requires a separate,
pay-as-you-go API key — use this if you want Brando runnable as its own
script independent of the `claude` CLI.

### Example prompts (either option)

- "Find me 5 mid-size logistics or field-service companies that likely still
  run scheduling off spreadsheets or email, and add the qualified ones to the
  CRM."
- "Draft a system proposal for [company] based on what we researched."
- "Write a 3-email outreach sequence for [company]'s ops manager."
- "List everything in the CRM that's still status: researched."
- (Option A) "Write the first outreach email for [company] and stage it in my
  Gmail once I approve it." — Brando shows you the draft text first; say
  "approved" (or ask for edits) before he creates the Gmail draft.

## Project layout

Everything about Brando lives under one top-level folder, `brando/` — a
single HTML file (the browser chat UI) plus one `app/` folder holding all of
his source, data, and generated output. The only files that can't live inside
`brando/` are the ones Claude Code requires at fixed, project-root locations
(`.claude/agents/brando.md`, `.mcp.json`) and the usual repo-root config
(`package.json`, `tsconfig.json`, `.env.example`).

```
agents/
  CLAUDE.md                    Project conventions (see repo root too)
  package.json / tsconfig.json
  .env.example                 Copy to .env, add ANTHROPIC_API_KEY (Option B only)
  .mcp.json                    Registers CRM/document MCP servers for Claude Code (fixed location)
  .claude/
    agents/brando.md           Brando subagent definition for Claude Code (fixed location)
    settings.json              Pre-trusts brando-crm/brando-documents for headless/web-chat use
  brando/
    index.html                 The single HTML chat page (Option A-web), served by app/server.ts
    app/
      cli.ts                   Terminal chat entrypoint (streaming Agent SDK session, Option B)
      server.ts                Local HTTP bridge: browser chat -> `claude` CLI headless (Option A-web)
      persona.ts               Brando's system prompt: Antheon positioning + his 4 jobs (Option B)
      lib/
        crm-store.ts           Shared CRM data logic (no framework deps)
        documents-store.ts     Shared document-saving logic (no framework deps)
      tools/
        crm.ts                 Agent SDK in-process CRM tools (Option B), wraps lib/crm-store.ts
        documents.ts           Agent SDK in-process save_document tool (Option B), wraps lib/documents-store.ts
      mcp/
        crm-server.ts          Standalone stdio MCP server for CRM tools (Option A), wraps lib/crm-store.ts
        documents-server.ts    Standalone stdio MCP server for save_document (Option A), wraps lib/documents-store.ts
      data/
        crm/prospects.json     Local prospect database (JSON, git-ignored data grows here)
      output/
        proposals/             Generated proposals (markdown)
        outreach/               Generated outreach emails/sequences (markdown)
        research/               Generated research briefs (markdown)
```

## Adding a new agent later

Follow the same pattern: a new top-level `<name>/` folder (mirroring
`brando/`) with its own `app/persona.ts`, dedicated tools, and either a new
CLI entrypoint or a shared one that lets you pick an agent at startup. Keep
each agent's persona file self-contained so personas don't bleed into each
other. Remember: any Claude Code subagent definition still has to live under
the shared `.claude/agents/` at the project root (that's a Claude Code
convention, not something you can nest per-agent), and `.mcp.json` entries
for a new agent's MCP servers go in the one project-root `.mcp.json`.

## Notes

- The CRM is plain JSON on disk — good enough for one marketing head working a
  pipeline by hand. If the prospect list grows large or multiple people need
  to use it concurrently, migrate `brando/app/tools/crm.ts` (and
  `brando/app/mcp/crm-server.ts`) to a real database without changing the
  tool interface Brando calls.
- `permissionMode` is set to `bypassPermissions` in `brando/app/cli.ts` (and
  passed via `--permission-mode bypassPermissions` in the web bridge) since
  this is a local, single-user tool. Tighten this if Brando is ever exposed
  beyond your own machine.
