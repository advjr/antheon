/**
 * Brando CLI — interactive terminal chat with Antheon's Head of Marketing agent.
 *
 * Run with: npm run brando
 *
 * This keeps one long-lived `query()` session alive for the whole terminal
 * session (streaming-input mode), so Brando remembers context turn to turn
 * until you exit.
 */

import "dotenv/config";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { query, type SDKUserMessage } from "@anthropic-ai/claude-agent-sdk";
import { BRANDO_SYSTEM_PROMPT } from "./persona.js";
import { crmServer } from "./tools/crm.js";
import { documentsServer } from "./tools/documents.js";

const rl = readline.createInterface({ input: stdin, output: stdout });

function printBanner() {
  console.log("");
  console.log("Brando — Head of Marketing, Antheon");
  console.log("Client/market research, prospect CRM, proposals, and outreach.");
  console.log("Type your message and press enter. Type /exit to quit.\n");
}

/**
 * Async generator that turns terminal input into the SDKUserMessage stream
 * the Agent SDK expects for interactive, multi-turn sessions.
 */
async function* userInputStream(): AsyncGenerator<SDKUserMessage> {
  while (true) {
    const line = await rl.question("You: ");
    const trimmed = line.trim();

    if (trimmed === "/exit" || trimmed === "/quit") {
      rl.close();
      return;
    }

    if (trimmed.length === 0) {
      continue;
    }

    yield {
      type: "user",
      message: {
        role: "user",
        content: trimmed,
      },
      parent_tool_use_id: null,
    };
  }
}

function extractText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((block: any) => block?.type === "text")
    .map((block: any) => block.text as string)
    .join("");
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "Missing ANTHROPIC_API_KEY. Copy .env.example to .env and add your key first."
    );
    process.exit(1);
  }

  printBanner();

  const session = query({
    prompt: userInputStream(),
    options: {
      systemPrompt: BRANDO_SYSTEM_PROMPT,
      allowedTools: [
        "WebSearch",
        "WebFetch",
        "mcp__brando-crm__crm_add_prospect",
        "mcp__brando-crm__crm_list_prospects",
        "mcp__brando-crm__crm_update_prospect",
        "mcp__brando-crm__crm_log_outreach",
        "mcp__brando-documents__save_document",
      ],
      mcpServers: {
        "brando-crm": crmServer,
        "brando-documents": documentsServer,
      },
      permissionMode: "bypassPermissions",
      cwd: process.cwd(),
    },
  });

  try {
    for await (const message of session) {
      if (message.type === "assistant") {
        const text = extractText((message as any).message?.content);
        if (text) {
          console.log(`\nBrando: ${text}\n`);
        }
        const toolUses = ((message as any).message?.content ?? []).filter(
          (b: any) => b?.type === "tool_use"
        );
        for (const toolUse of toolUses) {
          console.log(`  [using tool: ${toolUse.name}]`);
        }
      }

      if (message.type === "result") {
        if ((message as any).subtype !== "success") {
          console.log(`\n[Brando hit an issue: ${(message as any).subtype}]\n`);
        }
      }
    }
  } catch (error) {
    console.error("Session ended with an error:", error);
  }

  console.log("\nBrando session ended.");
  process.exit(0);
}

main();
