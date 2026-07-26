/**
 * Shared CRM data logic — used by both the in-process SDK tools
 * (brando/app/tools/crm.ts, for the API-key `npm run brando` path) and the
 * standalone MCP server (brando/app/mcp/crm-server.ts, for the Claude Code /
 * Team Plan path). Keep this file free of any SDK/MCP framework imports so
 * both callers can share it.
 *
 * Prospects are stored as JSON at brando/app/data/crm/prospects.json —
 * intentionally simple (no database) so the data stays easy to inspect, back
 * up, or migrate later. Resolved relative to this file (not process.cwd())
 * so it works no matter what directory a caller was launched from.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CRM_PATH = path.join(__dirname, "..", "data", "crm", "prospects.json");

export const STATUS_VALUES = [
  "researched",
  "qualified",
  "contacted",
  "replied",
  "proposal_sent",
  "won",
  "lost",
] as const;

export type Status = (typeof STATUS_VALUES)[number];

export type OutreachEntry = {
  date: string;
  channel: string;
  summary: string;
};

export type Prospect = {
  id: string;
  company: string;
  industry?: string;
  size?: string;
  painPoints: string[];
  contactName?: string;
  contactTitle?: string;
  contactEmail?: string;
  source?: string;
  notes?: string;
  status: Status;
  outreachLog: OutreachEntry[];
  createdAt: string;
  updatedAt: string;
};

export type NewProspectInput = {
  company: string;
  industry?: string;
  size?: string;
  painPoints?: string[];
  contactName?: string;
  contactTitle?: string;
  contactEmail?: string;
  source?: string;
  notes?: string;
};

export type UpdateProspectInput = {
  id: string;
  status?: Status;
  notes?: string;
  contactName?: string;
  contactTitle?: string;
  contactEmail?: string;
};

async function readCrm(): Promise<Prospect[]> {
  try {
    const raw = await fs.readFile(CRM_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeCrm(data: Prospect[]): Promise<void> {
  await fs.mkdir(path.dirname(CRM_PATH), { recursive: true });
  await fs.writeFile(CRM_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function addProspect(input: NewProspectInput): Promise<Prospect> {
  const data = await readCrm();
  const now = new Date().toISOString();
  const prospect: Prospect = {
    id: randomUUID(),
    company: input.company,
    industry: input.industry,
    size: input.size,
    painPoints: input.painPoints ?? [],
    contactName: input.contactName,
    contactTitle: input.contactTitle,
    contactEmail: input.contactEmail,
    source: input.source,
    notes: input.notes,
    status: "researched",
    outreachLog: [],
    createdAt: now,
    updatedAt: now,
  };
  data.push(prospect);
  await writeCrm(data);
  return prospect;
}

export async function listProspects(status?: Status): Promise<Prospect[]> {
  const data = await readCrm();
  return status ? data.filter((p) => p.status === status) : data;
}

export async function updateProspect(
  input: UpdateProspectInput
): Promise<Prospect | null> {
  const data = await readCrm();
  const idx = data.findIndex((p) => p.id === input.id);
  if (idx === -1) return null;

  const p = data[idx];
  data[idx] = {
    ...p,
    status: input.status ?? p.status,
    notes: input.notes ?? p.notes,
    contactName: input.contactName ?? p.contactName,
    contactTitle: input.contactTitle ?? p.contactTitle,
    contactEmail: input.contactEmail ?? p.contactEmail,
    updatedAt: new Date().toISOString(),
  };
  await writeCrm(data);
  return data[idx];
}

export async function logOutreach(
  id: string,
  channel: string,
  summary: string
): Promise<Prospect | null> {
  const data = await readCrm();
  const idx = data.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  data[idx].outreachLog.push({
    date: new Date().toISOString(),
    channel,
    summary,
  });
  data[idx].updatedAt = new Date().toISOString();
  await writeCrm(data);
  return data[idx];
}
