# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this directory.

## What this is

A Node.js/TypeScript project for building AI agents for Antheon (antheonph.com), using the Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) / Anthropic SDK. This is a separate codebase from the static marketing/client sites at the repo root (see `../CLAUDE.md`) — it does not share build tooling, conventions, or dependencies with those.

## Stack

- Node.js + TypeScript, run directly via `tsx` (no build step needed for local dev; `npm run build` compiles with `tsc` if a build is ever needed)
- Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) for agent logic, custom tools (`createSdkMcpServer` / `tool`), and the interactive session loop
- `zod` (v4 — required as a peer dependency by the Agent SDK) for tool input schemas
- Standalone CLI script, no framework (no Express/Next.js) — each agent is just a persona + tools wired into one `query()` session

## Conventions

- Keep agent definitions, tool implementations, and prompts organized by responsibility (e.g. one file per agent/tool) rather than one large script.
- **Each agent gets one top-level folder** (e.g. `brando/`), not nested under `src/`. Inside that folder: a single HTML file (browser chat UI, if it has one) at the top level, and one `app/` subfolder holding everything else for that agent — persona, tools, lib, mcp servers, data, output. The only files that can't live inside an agent's folder are the ones Claude Code requires at fixed project-root locations: `.claude/agents/<name>.md` (subagent definitions) and `.mcp.json` (MCP server registration) — those are Claude Code conventions, not something we control.
- Store secrets (Anthropic API keys, etc.) in environment variables / `.env` (git-ignored), never committed or hardcoded.
- Prefer the official Claude Agent SDK primitives (tools, MCP servers, hooks) over hand-rolled agentic loops where the SDK already covers the need.
- This directory is unrelated to the static-site conventions in the repo root `CLAUDE.md` (Antheon web standards, JSON-LD, etc.) — those don't apply here.

---

## Current state (snapshot — 2026-07-25)

Built so far: one agent, **Brando**, Antheon's Head of Marketing, living entirely under [`brando/`](brando/) (see README "Project layout" for the full file tree). Runnable three ways:

- **Option A — Claude Code / Team Plan, terminal (no separate API billing).**
  `.claude/agents/brando.md` is a Claude Code subagent carrying Brando's full
  persona (duplicated from `brando/app/persona.ts` — the two must be edited
  together, see the note atop that file). `.mcp.json` registers two
  standalone stdio MCP servers, `brando/app/mcp/crm-server.ts` and
  `brando/app/mcp/documents-server.ts` (built on `@modelcontextprotocol/sdk`,
  `McpServer` + `StdioServerTransport`), spawned via `npx tsx`. Use this by
  running `claude` in this directory and invoking the `brando` subagent —
  usage is billed under the existing Claude Code subscription, not the API
  console.
- **Option A-web — Browser chat UI on the Team Plan (`npm run brando:web`, no
  API key).** `brando/app/server.ts` is a tiny local Node HTTP server (Node
  built-in `http` + `child_process`, no Express) that serves the single-page
  chat UI (`brando/index.html`, one level up from `app/`) and, on
  POST /api/chat, shells out to the `claude` CLI in headless mode
  (`claude -p --agent brando --output-format json --permission-mode
  bypassPermissions`, `--resume <session_id>` for continuity), passing the
  user message on stdin. Same Team Plan auth as Option A — it literally
  drives the same CLI, with `PROJECT_DIR` derived from `server.ts`'s own file
  location (two levels up) rather than `process.cwd()`, so `claude` always
  gets spawned with the actual project root as its cwd regardless of where
  the script was invoked from. Binds `127.0.0.1` only; single conversation at
  a time; `POST /api/reset` clears the session. Only ever serves
  `index.html` itself (never a generic static-file/directory listing) since
  `brando/app/` — the source tree — sits alongside it inside the same
  `brando/` folder that's nominally "public". The browser UI does its own
  minimal XSS-safe markdown rendering (escape-then-whitelist).
- **Option B — Agent SDK standalone CLI (`npm run brando`, requires
  `ANTHROPIC_API_KEY`).** `brando/app/cli.ts` — one long-lived streaming
  `query()` session, `permissionMode: "bypassPermissions"`, `allowedTools`
  includes `WebSearch`/`WebFetch` plus in-process MCP tools from
  `brando/app/tools/crm.ts` / `brando/app/tools/documents.ts`
  (`createSdkMcpServer`/`tool`).

All options share the same business logic, factored out to avoid drift:
`brando/app/lib/crm-store.ts` (CRM read/write, file-based at
`brando/app/data/crm/prospects.json`, git-ignored since it fills with real
company/contact data) and `brando/app/lib/documents-store.ts` (saves
proposals/outreach/research as markdown under
`brando/app/output/{proposals,outreach,research}/`, each folder has a
tracked `.gitkeep`; generated files inside are git-ignored). Both lib files
resolve their paths relative to their own file location (`import.meta.url`),
not `process.cwd()`, so they work no matter what directory a caller was
launched from.

**Gmail drafting (Option A / A-web only).** `.claude/agents/brando.md` also
lists the account's existing Gmail connector tool (`create_draft` — a
`claude.ai` connector, not reachable from the raw Agent SDK, so Option B has
no equivalent). Mandatory two-step flow baked into the persona: (1) Brando
writes the outreach email, shows the full text in chat, saves it via
save_document, and explicitly asks Anthony to approve/edit it — no Gmail
draft is created yet; (2) only after explicit approval does he call
`create_draft` to stage the approved subject/body in Anthony's real Gmail
account, addressed using the contact email already on file in the CRM
record (never invented). There is no send tool wired up anywhere, on
purpose — Brando cannot send email himself under any circumstance; Anthony
always fires the actual send from Gmail. This was a deliberate choice over
driving Chrome to click Send: simpler, and the "final send" gate falls out
naturally from the human needing to open Gmail, rather than needing extra
browser-automation tool wiring.

**Headless/web-chat MCP trust — resolved via `.claude/settings.json`.**
Project-scoped `.mcp.json` servers normally need a one-time interactive trust
approval before Claude Code will use them in a session; `claude mcp list`
shows them as "✓ Connected" regardless (the health check spawns them
regardless of trust state) which is misleading — a fresh headless
`claude -p --agent brando` call only had Brando's always-on connector tools
(WebSearch, Gmail) until this was fixed. Fix: `.claude/settings.json`
(project-scoped, committed) with:
```json
{ "enabledMcpServers": ["brando-crm", "brando-documents"] }
```
This pre-trusts exactly those two servers for headless use — confirmed by
testing (see Verified below). If a new agent adds more MCP servers to
`.mcp.json`, add their names to this array too or they'll silently be
missing from headless/web-chat sessions despite `.mcp.json` looking correct.

Verified: clean `npm install` + `tsc --noEmit` (including after the
`src/` → `brando/app/` reorg); both standalone MCP servers smoke-tested
directly over stdio (initialize + tools/list) from their new location and
return their expected tool schemas; the Gmail connector's `create_draft`
schema was inspected (to/cc/bcc/subject/body/htmlBody/replyToMessageId) and
confirmed to have no send capability. The web bridge (Option A-web) was
tested end-to-end after the reorg: `GET /` serves the relocated
`brando/index.html` (200), a request for `/app/server.ts` correctly 404s
(source tree not exposed), headless `claude -p --agent brando` returns
Brando in-character over the Team Plan, and a real chat round-trip (message
in → CLI → reply rendered) worked with session continuity across turns and
correct markdown rendering (`**bold**`/`` `code` `` → real
`<strong>`/`<code>`). After adding `.claude/settings.json`, a headless
`crm_add_prospect` call and a real end-to-end web-bridge CRM add (through
`POST /api/chat`, not a direct CLI call) both landed a record in
`brando/app/data/crm/prospects.json` correctly, then the test records were
removed.

Not built yet / natural next steps: no automated tests; no proposal/outreach
copy templates beyond what's in the persona prompt; no second agent yet
(README documents the pattern for adding one — new top-level
`<name>/app/persona.ts` + its own tools, mirroring `brando/`); the Gmail
drafting flow specifically hasn't been exercised end-to-end (only the tool
schema was inspected, not a live `create_draft` call) — worth confirming it
actually lands a draft in Gmail the first time it's used for real.
