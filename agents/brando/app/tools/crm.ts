/**
 * In-process CRM tools for the Agent SDK path (brando/app/cli.ts,
 * `npm run brando`, requires ANTHROPIC_API_KEY). Business logic lives in
 * brando/app/lib/crm-store.ts, shared with the standalone MCP server used by
 * the Claude Code / Team Plan path (brando/app/mcp/crm-server.ts) — keep
 * both callers behind that one module so the two paths can't drift.
 */

import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import {
  STATUS_VALUES,
  addProspect,
  listProspects,
  updateProspect,
  logOutreach,
} from "../lib/crm-store.js";

export const crmServer = createSdkMcpServer({
  name: "brando-crm",
  version: "0.1.0",
  tools: [
    tool(
      "crm_add_prospect",
      "Add a new prospect (a real company Antheon could pitch) to the CRM after " +
        "researching them. Only add companies that genuinely fit Antheon's ICP: " +
        "medium-to-large businesses with disconnected tools, manual SOPs, no real " +
        "CRM, or inconsistent lead follow-up. Do not invent companies.",
      {
        company: z.string().describe("Company name"),
        industry: z.string().optional().describe("Industry / vertical"),
        size: z
          .string()
          .optional()
          .describe("Rough company size, e.g. '50-200 employees'"),
        painPoints: z
          .array(z.string())
          .describe(
            "Specific operational pain points identified for this company, " +
              "e.g. 'manual lead follow-up via spreadsheet', 'no CRM, uses email + Excel'"
          ),
        contactName: z.string().optional(),
        contactTitle: z.string().optional(),
        contactEmail: z.string().optional(),
        source: z
          .string()
          .optional()
          .describe("Where this lead was found, e.g. a URL or search description"),
        notes: z.string().optional(),
      },
      async (args) => {
        const prospect = await addProspect(args);
        return {
          content: [
            {
              type: "text" as const,
              text: `Added prospect "${prospect.company}" (id: ${prospect.id}, status: researched)`,
            },
          ],
        };
      }
    ),

    tool(
      "crm_list_prospects",
      "List prospects currently in the CRM, optionally filtered by status.",
      {
        status: z.enum(STATUS_VALUES).optional(),
      },
      async (args) => {
        const filtered = await listProspects(args.status);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(filtered, null, 2) }],
        };
      }
    ),

    tool(
      "crm_update_prospect",
      "Update a prospect's status, notes, or contact info by id.",
      {
        id: z.string().describe("Prospect id (from crm_add_prospect or crm_list_prospects)"),
        status: z.enum(STATUS_VALUES).optional(),
        notes: z.string().optional(),
        contactName: z.string().optional(),
        contactTitle: z.string().optional(),
        contactEmail: z.string().optional(),
      },
      async (args) => {
        const updated = await updateProspect(args);
        if (!updated) {
          return {
            content: [{ type: "text" as const, text: `No prospect found with id ${args.id}` }],
            isError: true,
          };
        }
        return {
          content: [
            { type: "text" as const, text: `Updated "${updated.company}" -> status: ${updated.status}` },
          ],
        };
      }
    ),

    tool(
      "crm_log_outreach",
      "Log an outreach touchpoint (email drafted/sent, call made, reply received) against a prospect.",
      {
        id: z.string(),
        channel: z.string().describe("e.g. 'email', 'linkedin', 'call'"),
        summary: z.string().describe("What happened / what was sent"),
      },
      async (args) => {
        const updated = await logOutreach(args.id, args.channel, args.summary);
        if (!updated) {
          return {
            content: [{ type: "text" as const, text: `No prospect found with id ${args.id}` }],
            isError: true,
          };
        }
        return {
          content: [{ type: "text" as const, text: `Logged outreach (${args.channel}) for "${updated.company}"` }],
        };
      }
    ),
  ],
});
