/**
 * Conversation history for the web chat UI (brando/index.html via server.ts).
 * Each Claude Code session becomes one JSON file at
 * brando/app/data/conversations/<sessionId>.json, keyed by the CLI's own
 * session_id so "resume" and "load this conversation's transcript" use the
 * same id. Resolved relative to this file (not process.cwd()) so it works no
 * matter what directory a caller was launched from.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONVERSATIONS_DIR = path.join(__dirname, "..", "data", "conversations");

const SAFE_ID = /^[A-Za-z0-9_-]+$/;

export type ConversationMessage = {
  role: "user" | "brando";
  text: string;
  ts: string;
};

export type ConversationSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type ConversationRecord = ConversationSummary & {
  messages: ConversationMessage[];
};

function fileFor(id: string): string {
  if (!SAFE_ID.test(id)) throw new Error("Invalid conversation id");
  return path.join(CONVERSATIONS_DIR, `${id}.json`);
}

function makeTitle(text: string): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  return oneLine.length > 60 ? `${oneLine.slice(0, 60)}…` : oneLine || "New conversation";
}

export async function listConversations(): Promise<ConversationSummary[]> {
  let files: string[];
  try {
    files = await fs.readdir(CONVERSATIONS_DIR);
  } catch {
    return [];
  }

  const summaries: ConversationSummary[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    try {
      const raw = await fs.readFile(path.join(CONVERSATIONS_DIR, file), "utf-8");
      const parsed = JSON.parse(raw) as ConversationRecord;
      summaries.push({
        id: parsed.id,
        title: parsed.title,
        createdAt: parsed.createdAt,
        updatedAt: parsed.updatedAt,
      });
    } catch {
      // Skip unreadable/corrupt entries rather than failing the whole list.
    }
  }

  return summaries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getConversation(id: string): Promise<ConversationRecord | null> {
  try {
    const raw = await fs.readFile(fileFor(id), "utf-8");
    return JSON.parse(raw) as ConversationRecord;
  } catch {
    return null;
  }
}

/**
 * Append one user/Brando turn to a conversation, creating it (and deriving a
 * title from the first user message) if this is the first turn for that id.
 */
export async function appendTurn(
  id: string,
  userText: string,
  replyText: string
): Promise<void> {
  const now = new Date().toISOString();
  const existing = await getConversation(id);

  const record: ConversationRecord = existing ?? {
    id,
    title: makeTitle(userText),
    createdAt: now,
    updatedAt: now,
    messages: [],
  };

  record.messages.push({ role: "user", text: userText, ts: now });
  record.messages.push({ role: "brando", text: replyText, ts: now });
  record.updatedAt = now;

  await fs.mkdir(CONVERSATIONS_DIR, { recursive: true });
  await fs.writeFile(fileFor(id), JSON.stringify(record, null, 2), "utf-8");
}
