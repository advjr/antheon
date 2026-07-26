/**
 * Shared document-saving logic — used by both the in-process SDK tool
 * (brando/app/tools/documents.ts, for the API-key `npm run brando` path) and
 * the standalone MCP server (brando/app/mcp/documents-server.ts, for the
 * Claude Code / Team Plan path).
 *
 * Files land at brando/app/output/{proposals,outreach,research}/, resolved
 * relative to this file (not process.cwd()) so it works no matter what
 * directory a caller was launched from.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_ROOT = path.join(__dirname, "..", "output");

export const DOC_TYPES = ["proposal", "outreach", "research"] as const;

export type DocType = (typeof DOC_TYPES)[number];

const FOLDER_BY_TYPE: Record<DocType, string> = {
  proposal: "proposals",
  outreach: "outreach",
  research: "research",
};

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80) || "untitled"
  );
}

export async function saveDocument(
  type: DocType,
  title: string,
  content: string
): Promise<string> {
  const dir = path.join(OUTPUT_ROOT, FOLDER_BY_TYPE[type]);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${slugify(title)}-${Date.now()}.md`;
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, content, "utf-8");
  return path.relative(process.cwd(), filePath);
}
