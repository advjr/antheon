/**
 * Local web bridge for chatting with Brando in a browser — Team Plan path.
 *
 * This spins up a tiny local HTTP server that:
 *   - serves the single-page HTML chat UI (brando/index.html, one level up
 *     from this file), and
 *   - exposes POST /api/chat, which shells out to the `claude` CLI in headless
 *     mode (`claude -p --agent brando ...`) for each message.
 *
 * Because it drives the `claude` CLI (which is logged into your Claude Code /
 * Team Plan subscription), this uses NO ANTHROPIC_API_KEY and no pay-as-you-go
 * API billing — same auth as running `claude` in the terminal. Brando's tools
 * (CRM, save_document, Gmail create_draft) come from .claude/agents/brando.md
 * and .mcp.json at the project root exactly as in a normal `claude` session —
 * `claude` is spawned with that project root as its cwd regardless of where
 * this server script itself lives.
 *
 * Every turn is persisted (via lib/conversations-store.ts) keyed by the CLI's
 * own session_id, so the browser sidebar can list past conversations and
 * reopen one — POST /api/conversations/:id resumes that session id on the
 * next chat turn, GET /api/conversations/:id replays its transcript.
 *
 * It is a LOCAL, single-user tool: it binds to 127.0.0.1 only, keeps one
 * conversation (one Claude session id) active at a time, and runs the CLI
 * with bypassPermissions so tool calls don't block on a prompt no one can
 * answer in a browser. Don't expose this port to a network.
 *
 * Run:  npm run brando:web   then open http://127.0.0.1:4317
 */

import http from "node:http";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listConversations, getConversation, appendTurn } from "./lib/conversations-store.js";

const HOST = "127.0.0.1";
const PORT = Number(process.env.BRANDO_WEB_PORT ?? 4317);

// This file lives at <project root>/brando/app/server.ts.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BRANDO_DIR = path.join(__dirname, "..");
const PROJECT_DIR = path.join(BRANDO_DIR, "..");
const PUBLIC_DIR = BRANDO_DIR;

// The `claude` binary is a .cmd shim on Windows, so go through the shell there.
const IS_WINDOWS = process.platform === "win32";

/**
 * One conversation at a time. We capture the session_id the CLI returns and
 * resume it on the next message so Brando keeps context turn to turn. Reset to
 * null to start a fresh conversation (see POST /api/reset).
 */
let currentSessionId: string | null = null;

type ClaudeResult = {
  reply: string;
  sessionId: string | null;
  isError: boolean;
  errorDetail?: string;
};

/**
 * Run one Brando turn through the headless CLI. The user's message is passed on
 * stdin (not as a shell arg) so there's nothing to escape or inject.
 */
function runBrandoTurn(message: string): Promise<ClaudeResult> {
  return new Promise((resolve) => {
    const args = [
      "-p",
      "--agent",
      "brando",
      "--output-format",
      "json",
      "--permission-mode",
      "bypassPermissions",
    ];
    if (currentSessionId) {
      args.push("--resume", currentSessionId);
    }

    const child = spawn("claude", args, {
      cwd: PROJECT_DIR,
      shell: IS_WINDOWS,
      // Each headless turn re-spawns Brando's stdio MCP servers (brando-crm,
      // brando-documents) and must wait for them to connect before the tools
      // are available. Under load that handshake can be slow; give it a
      // generous window so tool calls don't intermittently vanish (which shows
      // up as Brando claiming he "only has WebSearch/WebFetch"). Pair this with
      // the fast `node --import tsx` launch in .mcp.json (vs the slower `npx`).
      env: { ...process.env, MCP_TIMEOUT: process.env.MCP_TIMEOUT ?? "20000" },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      resolve({
        reply: "",
        sessionId: currentSessionId,
        isError: true,
        errorDetail:
          `Could not launch the \`claude\` CLI: ${err.message}. ` +
          `Make sure Claude Code is installed and on your PATH, and that you're logged in (\`claude\`).`,
      });
    });

    child.on("close", (code) => {
      if (code !== 0 && !stdout.trim()) {
        resolve({
          reply: "",
          sessionId: currentSessionId,
          isError: true,
          errorDetail:
            `The \`claude\` CLI exited with code ${code}.` +
            (stderr.trim() ? `\n${stderr.trim()}` : ""),
        });
        return;
      }

      try {
        const parsed = JSON.parse(stdout);
        const sessionId: string | null = parsed.session_id ?? currentSessionId;
        if (sessionId) currentSessionId = sessionId;

        const isError = parsed.is_error === true || parsed.subtype !== "success";
        resolve({
          reply: typeof parsed.result === "string" ? parsed.result : "",
          sessionId,
          isError,
          errorDetail: isError ? String(parsed.subtype ?? "unknown error") : undefined,
        });
      } catch (parseErr) {
        resolve({
          reply: "",
          sessionId: currentSessionId,
          isError: true,
          errorDetail:
            `Couldn't parse the CLI response as JSON. Raw output:\n${stdout.slice(0, 2000)}` +
            (stderr.trim() ? `\n--- stderr ---\n${stderr.trim()}` : ""),
        });
      }
    });

    child.stdin.write(message);
    child.stdin.end();
  });
}

function sendJson(res: http.ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

async function readBody(req: http.IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
    // Cap request size (this is a local single-user tool, but stay sane).
    if (Buffer.concat(chunks).length > 1_000_000) break;
  }
  return Buffer.concat(chunks).toString("utf-8");
}

// The chat page is a single self-contained HTML file (inline CSS/JS, no other
// static assets) — and it happens to live alongside brando/app/ (the source
// tree). So this deliberately serves ONLY index.html, never a generic
// directory listing/file server, to avoid exposing the source tree over HTTP.
const INDEX_HTML_PATH = path.join(PUBLIC_DIR, "index.html");

async function serveStatic(res: http.ServerResponse, urlPath: string): Promise<void> {
  if (urlPath !== "/" && urlPath !== "/index.html") {
    sendJson(res, 404, { error: "Not found" });
    return;
  }
  try {
    const data = await fs.readFile(INDEX_HTML_PATH);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(data);
  } catch {
    sendJson(res, 404, { error: "Not found" });
  }
}

const server = http.createServer(async (req, res) => {
  const url = req.url ?? "/";

  if (req.method === "POST" && url === "/api/chat") {
    try {
      const body = await readBody(req);
      const { message } = JSON.parse(body || "{}");
      if (typeof message !== "string" || message.trim().length === 0) {
        sendJson(res, 400, { error: "Empty message." });
        return;
      }
      const result = await runBrandoTurn(message.trim());
      if (result.isError) {
        sendJson(res, 502, {
          error: result.errorDetail ?? "Brando hit an error.",
          sessionId: result.sessionId,
        });
        return;
      }
      if (result.sessionId) {
        await appendTurn(result.sessionId, message.trim(), result.reply);
      }
      sendJson(res, 200, { reply: result.reply, sessionId: result.sessionId });
    } catch (err) {
      sendJson(res, 500, { error: (err as Error).message });
    }
    return;
  }

  if (req.method === "POST" && url === "/api/reset") {
    currentSessionId = null;
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && url.split("?")[0] === "/api/conversations") {
    const conversations = await listConversations();
    sendJson(res, 200, { conversations });
    return;
  }

  if (req.method === "GET" && url.split("?")[0].startsWith("/api/conversations/")) {
    const id = decodeURIComponent(url.split("?")[0].slice("/api/conversations/".length));
    const conversation = await getConversation(id);
    if (!conversation) {
      sendJson(res, 404, { error: "Conversation not found." });
      return;
    }
    sendJson(res, 200, { conversation });
    return;
  }

  if (req.method === "POST" && url.split("?")[0].startsWith("/api/conversations/")) {
    const id = decodeURIComponent(url.split("?")[0].slice("/api/conversations/".length));
    const conversation = await getConversation(id);
    if (!conversation) {
      sendJson(res, 404, { error: "Conversation not found." });
      return;
    }
    currentSessionId = id;
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET") {
    await serveStatic(res, url.split("?")[0]);
    return;
  }

  sendJson(res, 405, { error: "Method not allowed" });
});

server.listen(PORT, HOST, () => {
  console.log("");
  console.log("Brando web chat is running.");
  console.log(`  Open:  http://${HOST}:${PORT}`);
  console.log("");
  console.log("This uses your Claude Code / Team Plan login (no API key).");
  console.log("Keep this terminal open while you chat. Ctrl+C to stop.");
  console.log("");
});
