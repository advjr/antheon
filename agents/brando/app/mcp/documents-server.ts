/**
 * Standalone MCP server exposing save_document over stdio, for use by the
 * `claude` CLI (Claude Code / Team Plan auth — no ANTHROPIC_API_KEY needed).
 * Registered in .mcp.json. Logic lives in brando/app/lib/documents-store.ts,
 * shared with the Agent SDK in-process version
 * (brando/app/tools/documents.ts).
 *
 * Run directly for a smoke test: npx tsx brando/app/mcp/documents-server.ts
 * (it will sit waiting for stdio input — Ctrl+C to exit).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { DOC_TYPES, saveDocument } from "../lib/documents-store.js";

const server = new McpServer({ name: "brando-documents", version: "0.1.0" });

server.registerTool(
  "save_document",
  {
    description:
      "Save a finished, client-ready piece of writing (proposal, outreach " +
      "email/sequence, or research brief) to disk as a markdown file. Always " +
      "pass the full, final content — never a placeholder or summary.",
    inputSchema: {
      type: z.enum(DOC_TYPES).describe("What kind of document this is"),
      title: z.string().describe("Short descriptive title, e.g. 'Acme Corp - System Proposal'"),
      content: z.string().describe("Full markdown content of the document"),
    },
  },
  async (args) => {
    const relPath = await saveDocument(args.type, args.title, args.content);
    return { content: [{ type: "text", text: `Saved ${args.type} to ${relPath}` }] };
  }
);

await server.connect(new StdioServerTransport());
