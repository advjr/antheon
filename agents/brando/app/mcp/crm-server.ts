/**
 * Standalone MCP server exposing the CRM tools over stdio, for use by the
 * `claude` CLI (Claude Code / Team Plan auth — no ANTHROPIC_API_KEY needed).
 * Registered in .mcp.json. Business logic lives in
 * brando/app/lib/crm-store.ts, shared with the Agent SDK in-process version
 * (brando/app/tools/crm.ts).
 *
 * Run directly for a smoke test: npx tsx brando/app/mcp/crm-server.ts
 * (it will sit waiting for stdio input — Ctrl+C to exit).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  STATUS_VALUES,
  addProspect,
  listProspects,
  updateProspect,
  logOutreach,
} from "../lib/crm-store.js";

const server = new McpServer({ name: "brando-crm", version: "0.1.0" });

server.registerTool(
  "crm_add_prospect",
  {
    description:
      "Add a new prospect (a real company Antheon could pitch) to the CRM after " +
      "researching them. Only add companies that genuinely fit Antheon's ICP: " +
      "medium-to-large businesses with disconnected tools, manual SOPs, no real " +
      "CRM, or inconsistent lead follow-up. Do not invent companies.",
    inputSchema: {
      company: z.string().describe("Company name"),
      industry: z.string().optional().describe("Industry / vertical"),
      size: z.string().optional().describe("Rough company size, e.g. '50-200 employees'"),
      painPoints: z
        .array(z.string())
        .describe(
          "Specific operational pain points identified for this company, " +
            "e.g. 'manual lead follow-up via spreadsheet', 'no CRM, uses email + Excel'"
        ),
      contactName: z.string().optional(),
      contactTitle: z.string().optional(),
      contactEmail: z.string().optional(),
      source: z.string().optional().describe("Where this lead was found, e.g. a URL or search description"),
      notes: z.string().optional(),
    },
  },
  async (args) => {
    const prospect = await addProspect(args);
    return {
      content: [
        {
          type: "text",
          text: `Added prospect "${prospect.company}" (id: ${prospect.id}, status: researched)`,
        },
      ],
    };
  }
);

server.registerTool(
  "crm_list_prospects",
  {
    description: "List prospects currently in the CRM, optionally filtered by status.",
    inputSchema: {
      status: z.enum(STATUS_VALUES).optional(),
    },
  },
  async (args) => {
    const filtered = await listProspects(args.status);
    return { content: [{ type: "text", text: JSON.stringify(filtered, null, 2) }] };
  }
);

server.registerTool(
  "crm_update_prospect",
  {
    description: "Update a prospect's status, notes, or contact info by id.",
    inputSchema: {
      id: z.string().describe("Prospect id (from crm_add_prospect or crm_list_prospects)"),
      status: z.enum(STATUS_VALUES).optional(),
      notes: z.string().optional(),
      contactName: z.string().optional(),
      contactTitle: z.string().optional(),
      contactEmail: z.string().optional(),
    },
  },
  async (args) => {
    const updated = await updateProspect(args);
    if (!updated) {
      return {
        content: [{ type: "text", text: `No prospect found with id ${args.id}` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: `Updated "${updated.company}" -> status: ${updated.status}` }],
    };
  }
);

server.registerTool(
  "crm_log_outreach",
  {
    description: "Log an outreach touchpoint (email drafted/sent, call made, reply received) against a prospect.",
    inputSchema: {
      id: z.string(),
      channel: z.string().describe("e.g. 'email', 'linkedin', 'call'"),
      summary: z.string().describe("What happened / what was sent"),
    },
  },
  async (args) => {
    const updated = await logOutreach(args.id, args.channel, args.summary);
    if (!updated) {
      return {
        content: [{ type: "text", text: `No prospect found with id ${args.id}` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: `Logged outreach (${args.channel}) for "${updated.company}"` }],
    };
  }
);

await server.connect(new StdioServerTransport());
