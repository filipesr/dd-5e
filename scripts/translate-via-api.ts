/**
 * Translate Open5e data using Claude API for full narrative translation.
 * Requires: ANTHROPIC_API_KEY in .env.local
 *
 * Usage:
 *   npm run translate-api -- --locale pt-BR --type spells
 *   npm run translate-api -- --locale es --type monsters
 *   npm run translate-api -- --locale pt-BR --type items
 *   npm run translate-api -- --locale pt-BR --type all
 *
 * Flags:
 *   --locale  Target locale (pt-BR or es)
 *   --type    Data type (spells, monsters, items, all)
 *   --srd     Only translate SRD entries (document__slug === "wotc-srd")
 *   --batch   Batch size (default: 5)
 *   --dry-run Show what would be translated without calling API
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data", "open5e");

// Parse CLI args
const args = process.argv.slice(2);
function getArg(name: string, defaultVal?: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : defaultVal;
}
const hasFlag = (name: string) => args.includes(`--${name}`);

const locale = getArg("locale", "pt-BR")!;
const dataType = getArg("type", "spells")!;
const srdOnly = hasFlag("srd");
const batchSize = parseInt(getArg("batch", "5")!);
const dryRun = hasFlag("dry-run");

const LOCALE_NAMES: Record<string, string> = {
  "pt-BR": "Portuguese (Brazilian)",
  es: "Spanish",
};

const SUFFIX: Record<string, string> = { "pt-BR": "pt", es: "es" };

interface TranslateRequest {
  slug: string;
  fields: Record<string, string>;
}

async function translateBatch(
  entries: TranslateRequest[],
  targetLocale: string,
  context: string
): Promise<Record<string, Record<string, string>>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY not set. Add it to .env.local or export it."
    );
  }

  const prompt = `You are a professional D&D 5e translator. Translate the following D&D game text from English to ${LOCALE_NAMES[targetLocale]}.

Context: These are ${context} from the D&D 5e SRD.

Rules:
- Use official D&D ${LOCALE_NAMES[targetLocale]} terminology
- Keep dice notation (1d6, 2d8+3) unchanged
- Keep proper nouns (spell names, monster names) in English
- Keep numbers unchanged
- Convert feet to meters (5 ft = 1.5m) where appropriate
- Translate ALL narrative text naturally, not word-by-word
- Return valid JSON

Input entries (JSON):
${JSON.stringify(entries, null, 2)}

Return a JSON object where keys are slugs and values are objects with the same field names but translated values. Example:
{"fireball": {"desc": "translated desc...", "higher_level": "translated..."}}

Return ONLY the JSON, no markdown or explanation.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.content[0].text;

  // Parse JSON from response (may have markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in API response");
  return JSON.parse(jsonMatch[0]);
}

function loadJSON(filename: string): Record<string, unknown>[] {
  const path = join(DATA_DIR, filename);
  if (!existsSync(path)) {
    console.error(`File not found: ${path}`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(path, "utf-8"));
}

function saveJSON(filename: string, data: unknown): void {
  writeFileSync(join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

async function translateFile(
  sourceFile: string,
  targetFile: string,
  fieldsToTranslate: string[],
  context: string
): Promise<void> {
  const source = loadJSON(sourceFile);
  const target = existsSync(join(DATA_DIR, targetFile))
    ? loadJSON(targetFile)
    : source.map((s) => ({ ...s }));

  // Build index
  const targetIndex = new Map(target.map((t, i) => [t.slug as string, i]));

  // Filter entries
  let entries = source;
  if (srdOnly) {
    entries = entries.filter((e) => e.document__slug === "wotc-srd");
  }

  console.log(`\nTranslating ${entries.length} entries from ${sourceFile} → ${targetFile}`);
  console.log(`Fields: ${fieldsToTranslate.join(", ")}`);
  console.log(`Batch size: ${batchSize}\n`);

  // Process in batches
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const requests: TranslateRequest[] = batch.map((entry) => {
      const fields: Record<string, string> = {};
      for (const field of fieldsToTranslate) {
        const val = entry[field];
        if (typeof val === "string" && val.length > 0) {
          fields[field] = val;
        } else if (Array.isArray(val)) {
          // For arrays of {name, desc} objects
          fields[field] = JSON.stringify(val);
        }
      }
      return { slug: entry.slug as string, fields };
    });

    // Skip entries with no translatable content
    const nonEmpty = requests.filter((r) => Object.keys(r.fields).length > 0);
    if (nonEmpty.length === 0) continue;

    process.stdout.write(
      `  Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(entries.length / batchSize)} (${nonEmpty.length} entries)...`
    );

    if (dryRun) {
      console.log(" [dry-run] skipped");
      continue;
    }

    try {
      const translations = await translateBatch(nonEmpty, locale, context);

      // Apply translations
      for (const [slug, translated] of Object.entries(translations)) {
        const idx = targetIndex.get(slug);
        if (idx === undefined) continue;

        for (const [field, value] of Object.entries(translated)) {
          if (typeof value === "string") {
            (target[idx] as Record<string, unknown>)[field] = value;
          }
        }
      }

      console.log(" done");
    } catch (err) {
      console.error(` ERROR: ${err}`);
    }

    // Rate limit: 1 second between batches
    await new Promise((r) => setTimeout(r, 1000));
  }

  // Save
  saveJSON(targetFile, target);
  console.log(`\nSaved ${targetFile}`);
}

// ── Main ──

async function main() {
  console.log(`=== Open5e API Translation ===`);
  console.log(`Locale: ${locale}`);
  console.log(`Type: ${dataType}`);
  console.log(`SRD only: ${srdOnly}`);
  console.log(`Batch size: ${batchSize}`);
  console.log(`Dry run: ${dryRun}`);

  const sfx = SUFFIX[locale];
  if (!sfx) {
    console.error(`Unknown locale: ${locale}`);
    process.exit(1);
  }

  const tasks: [string, string, string[], string][] = [];

  if (dataType === "spells" || dataType === "all") {
    tasks.push(["spells.json", `spells-${sfx}.json`, ["desc", "higher_level", "material"], "spell descriptions"]);
  }
  if (dataType === "monsters" || dataType === "all") {
    tasks.push(["monsters.json", `monsters-${sfx}.json`, ["desc"], "monster descriptions"]);
  }
  if (dataType === "items" || dataType === "all") {
    tasks.push(["items.json", `items-${sfx}.json`, ["desc"], "magic item descriptions"]);
  }

  for (const [src, tgt, fields, ctx] of tasks) {
    await translateFile(src, tgt, fields, ctx);
  }

  console.log("\n=== Done! ===");
}

main().catch(console.error);
