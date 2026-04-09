#!/usr/bin/env npx tsx
/**
 * Translate Open5e data using Claude API.
 *
 * Usage:
 *   npx tsx scripts/translate-via-claude.ts --locale pt-BR --type spells --srd
 *   npx tsx scripts/translate-via-claude.ts --locale es --type monsters --srd
 *   npx tsx scripts/translate-via-claude.ts --locale pt-BR --type all --srd
 *   npx tsx scripts/translate-via-claude.ts --locale pt-BR --type spells --all
 *   npx tsx scripts/translate-via-claude.ts --locale pt-BR --type spells --srd --dry-run
 *   npx tsx scripts/translate-via-claude.ts --locale pt-BR --type spells --srd --force
 *
 * Automatically skips entries already translated (_translated: true).
 * Use --force to re-translate everything.
 *
 * Requires ANTHROPIC_API_KEY in .env.local or environment.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

// Load .env.local
config({ path: join(process.cwd(), ".env.local") });

const DATA_DIR = join(process.cwd(), "data", "open5e");
const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";
const BATCH_SIZE = 5;
const RATE_LIMIT_MS = 1500;

// ── CLI args ──

const args = process.argv.slice(2);
const getArg = (name: string, def?: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : def;
};
const hasFlag = (name: string) => args.includes(`--${name}`);

const locale = getArg("locale", "pt-BR")!;
const dataType = getArg("type", "spells")!;
const srdOnly = hasFlag("srd");
const dryRun = hasFlag("dry-run");
const force = hasFlag("force");

const LOCALE_NAMES: Record<string, string> = {
  "pt-BR": "Brazilian Portuguese",
  es: "Spanish",
};
const LOCALE_SUFFIX: Record<string, string> = { "pt-BR": "pt", es: "es" };

// ── Helpers ──

function loadJSON(filename: string): Record<string, unknown>[] {
  const p = join(DATA_DIR, filename);
  if (!existsSync(p)) { console.error(`Not found: ${p}`); process.exit(1); }
  return JSON.parse(readFileSync(p, "utf-8"));
}

function saveJSON(filename: string, data: unknown) {
  writeFileSync(join(DATA_DIR, filename), JSON.stringify(data, null, 2), "utf-8");
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ── API Call ──

async function callClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("\nERROR: ANTHROPIC_API_KEY not found.");
    console.error("Add it to .env.local:");
    console.error("  ANTHROPIC_API_KEY=sk-ant-...\n");
    process.exit(1);
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 16384,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json() as { content: { text: string }[] };
  return data.content[0].text;
}

function extractJSON(text: string): Record<string, Record<string, unknown>> {
  // Try to extract JSON from response (may have markdown fences)
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in response");
  return JSON.parse(match[0]);
}

// ── Translation ──

interface TranslateEntry {
  slug: string;
  fields: Record<string, string | object>;
}

function buildPrompt(entries: TranslateEntry[], targetLocale: string, context: string): string {
  return `You are a professional D&D 5e game translator. Translate these D&D 5e ${context} from English to ${LOCALE_NAMES[targetLocale]}.

RULES:
- Use official D&D ${LOCALE_NAMES[targetLocale]} terminology
- Keep dice notation unchanged (1d6, 2d8+3, etc.)
- Keep proper nouns (spell/monster/item names) in English
- Convert feet to meters: 5ft=1.5m, 10ft=3m, 15ft=4.5m, 20ft=6m, 30ft=9m, 60ft=18m, 120ft=36m, 300ft=90m
- Keep the exact same text structure (paragraphs, line breaks)
- For arrays of {name, desc} objects, translate both name and desc
- Translate ALL text naturally and fluently — not word-by-word

Return ONLY valid JSON. Format:
{
  "slug-1": { "field1": "translated...", "field2": "translated..." },
  "slug-2": { ... }
}

For array fields like actions, return them as arrays of {name, desc} objects.

INPUT (${entries.length} entries):
${JSON.stringify(entries.map(e => ({ slug: e.slug, ...e.fields })), null, 2)}`;
}

async function translateBatch(
  entries: TranslateEntry[],
  targetLocale: string,
  context: string
): Promise<Record<string, Record<string, unknown>>> {
  const prompt = buildPrompt(entries, targetLocale, context);
  const response = await callClaude(prompt);
  return extractJSON(response);
}

// ── Process file ──

async function processFile(
  targetFile: string,
  fieldExtractor: (entry: Record<string, unknown>) => Record<string, string | object>,
  context: string,
) {
  const target = loadJSON(targetFile);

  // Work from TARGET — it's our source of truth for what needs translating
  let entries = target.filter(e => {
    // Scope filter: SRD only?
    if (srdOnly && e.document__slug !== "wotc-srd") return false;
    // Already translated? Skip (unless --force)
    if (!force && e._translated) return false;
    return true;
  });

  const total = entries.length;
  const batches = Math.ceil(total / BATCH_SIZE);

  // Stats
  const totalInScope = srdOnly
    ? target.filter(e => e.document__slug === "wotc-srd").length
    : target.length;
  const translatedInScope = srdOnly
    ? target.filter(e => e.document__slug === "wotc-srd" && e._translated).length
    : target.filter(e => e._translated).length;

  console.log(`\n${"=".repeat(60)}`);
  console.log(`File: ${targetFile}${srdOnly ? " (SRD only)" : ""}`);
  console.log(`Scope: ${totalInScope} entries | ${translatedInScope} done | ${total} pending`);
  console.log(`Batches: ${batches} (${BATCH_SIZE} per batch)`);
  console.log(`${"=".repeat(60)}\n`);

  if (total === 0) {
    console.log("  Nothing to translate. All entries already done.");
    console.log("  Use --force to re-translate.\n");
    return;
  }

  let translated = 0;
  let errors = 0;

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    const requests: TranslateEntry[] = batch.map(entry => ({
      slug: entry.slug as string,
      fields: fieldExtractor(entry),
    })).filter(r => Object.keys(r.fields).length > 0);

    if (requests.length === 0) continue;

    process.stdout.write(`  [${batchNum}/${batches}] ${requests.map(r => r.slug).join(", ").slice(0, 60)}...`);

    if (dryRun) {
      console.log(" [dry-run]");
      continue;
    }

    try {
      const results = await translateBatch(requests, locale, context);

      const targetIdx = new Map(target.map((t, i) => [t.slug as string, i]));
      for (const [slug, fields] of Object.entries(results)) {
        const idx = targetIdx.get(slug);
        if (idx === undefined) continue;

        const targetEntry = target[idx] as Record<string, unknown>;
        for (const [field, value] of Object.entries(fields)) {
          targetEntry[field] = value;
        }
        targetEntry._translated = true;
      }

      translated += requests.length;
      console.log(` ✓ (${translated}/${total})`);

      // Save incrementally every batch
      saveJSON(targetFile, target);
    } catch (err) {
      errors++;
      console.log(` ✗ ${err}`);
    }

    await sleep(RATE_LIMIT_MS);
  }

  // Final save
  saveJSON(targetFile, target);
  console.log(`\nDone: ${translated} translated, ${errors} errors.\n`);
}

// ── Field extractors ──

function spellFields(entry: Record<string, unknown>): Record<string, string | object> {
  const fields: Record<string, string | object> = {};
  if (entry.desc && typeof entry.desc === "string" && entry.desc.length > 0)
    fields.desc = entry.desc;
  if (entry.higher_level && typeof entry.higher_level === "string" && entry.higher_level.length > 0)
    fields.higher_level = entry.higher_level;
  if (entry.material && typeof entry.material === "string" && entry.material.length > 0)
    fields.material = entry.material;
  return fields;
}

function monsterFields(entry: Record<string, unknown>): Record<string, string | object> {
  const fields: Record<string, string | object> = {};
  if (entry.desc && typeof entry.desc === "string" && entry.desc.length > 0)
    fields.desc = entry.desc;
  if (entry.legendary_desc && typeof entry.legendary_desc === "string" && entry.legendary_desc.length > 0)
    fields.legendary_desc = entry.legendary_desc;
  if (Array.isArray(entry.actions) && entry.actions.length > 0)
    fields.actions = entry.actions;
  if (Array.isArray(entry.special_abilities) && entry.special_abilities.length > 0)
    fields.special_abilities = entry.special_abilities;
  if (Array.isArray(entry.reactions) && entry.reactions.length > 0)
    fields.reactions = entry.reactions;
  if (Array.isArray(entry.legendary_actions) && entry.legendary_actions.length > 0)
    fields.legendary_actions = entry.legendary_actions;
  return fields;
}

function itemFields(entry: Record<string, unknown>): Record<string, string | object> {
  const fields: Record<string, string | object> = {};
  if (entry.desc && typeof entry.desc === "string" && entry.desc.length > 0)
    fields.desc = entry.desc;
  return fields;
}

function weaponFields(entry: Record<string, unknown>): Record<string, string | object> {
  const fields: Record<string, string | object> = {};
  if (entry.damage_type && typeof entry.damage_type === "string" && entry.damage_type.length > 0)
    fields.damage_type = entry.damage_type;
  if (entry.category && typeof entry.category === "string" && entry.category.length > 0)
    fields.category = entry.category;
  if (Array.isArray(entry.properties) && entry.properties.length > 0)
    fields.properties = entry.properties;
  return fields;
}

function armorFields(entry: Record<string, unknown>): Record<string, string | object> {
  const fields: Record<string, string | object> = {};
  if (entry.category && typeof entry.category === "string" && entry.category.length > 0)
    fields.category = entry.category;
  if (entry.ac_string && typeof entry.ac_string === "string" && entry.ac_string.length > 0)
    fields.ac_string = entry.ac_string;
  return fields;
}

// ── Main ──

async function main() {
  const sfx = LOCALE_SUFFIX[locale];
  if (!sfx) { console.error(`Unknown locale: ${locale}`); process.exit(1); }

  console.log("\n╔══════════════════════════════════════╗");
  console.log("║   D&D 5e Open5e Translator (Claude)  ║");
  console.log("╚══════════════════════════════════════╝");
  console.log(`  Locale:   ${locale} (${LOCALE_NAMES[locale]})`);
  console.log(`  Type:     ${dataType}`);
  console.log(`  SRD only: ${srdOnly}`);
  console.log(`  Force:    ${force}`);
  console.log(`  Dry run:  ${dryRun}`);
  console.log(`  Model:    ${MODEL}`);
  console.log(`  Batch:    ${BATCH_SIZE}`);

  if (dataType === "spells" || dataType === "all") {
    await processFile(`spells-${sfx}.json`, spellFields, "spell descriptions");
  }
  if (dataType === "monsters" || dataType === "all") {
    await processFile(`monsters-${sfx}.json`, monsterFields, "monster descriptions, legendary actions, special abilities, and reactions");
  }
  if (dataType === "items" || dataType === "all") {
    await processFile(`items-${sfx}.json`, itemFields, "magic item descriptions");
  }
  if (dataType === "weapons" || dataType === "all") {
    await processFile(`weapons-${sfx}.json`, weaponFields, "weapon properties (damage type, category, properties)");
  }
  if (dataType === "armor" || dataType === "all") {
    await processFile(`armor-${sfx}.json`, armorFields, "armor properties (category, AC description)");
  }

  console.log("All done!\n");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
