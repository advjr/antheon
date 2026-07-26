/**
 * In-process document-saving tool for the Agent SDK path (brando/app/cli.ts,
 * `npm run brando`, requires ANTHROPIC_API_KEY). Logic lives in
 * brando/app/lib/documents-store.ts, shared with the standalone MCP server
 * used by the Claude Code / Team Plan path
 * (brando/app/mcp/documents-server.ts).
 */

import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { DOC_TYPES, saveDocument } from "../lib/documents-store.js";

export const documentsServer = createSdkMcpServer({
  name: "brando-documents",
  version: "0.1.0",
  tools: [
    tool(
      "save_document",
      "Save a finished, client-ready piece of writing (proposal, outreach " +
        "email/sequence, or research brief) to disk as a markdown file. Always " +
        "pass the full, final content — never a placeholder or summary.",
      {
        type: z.enum(DOC_TYPES).describe("What kind of document this is"),
        title: z
          .string()
          .describe("Short descriptive title, e.g. 'Acme Corp - System Proposal'"),
        content: z.string().describe("Full markdown content of the document"),
      },
      async (args) => {
        const relPath = await saveDocument(args.type, args.title, args.content);
        return {
          content: [
            {
              type: "text" as const,
              text: `Saved ${args.type} to ${relPath}`,
            },
          ],
        };
      }
    ),
  ],
});
