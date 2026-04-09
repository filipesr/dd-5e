/**
 * Fetch all data from Open5e API and save as local JSON files.
 * Run: npm run fetch-data
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const BASE_URL = "https://api.open5e.com/v1";
const OUT_DIR = join(process.cwd(), "data", "open5e");

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  results: T[];
}

async function fetchAll<T>(endpoint: string, label: string): Promise<T[]> {
  const results: T[] = [];
  let url: string | null = `${BASE_URL}${endpoint}?format=json&limit=50`;
  let page = 1;

  while (url) {
    process.stdout.write(`  ${label} page ${page}...`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(` ERROR ${res.status}`);
      break;
    }
    const data: PaginatedResponse<T> = await res.json();
    results.push(...data.results);
    process.stdout.write(` ${results.length}/${data.count}\n`);
    url = data.next;
    page++;
  }

  return results;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  console.log("\n=== Open5e Data Fetcher ===\n");

  // Spells
  console.log("Fetching spells...");
  const spells = await fetchAll("/spells/", "Spells");
  writeFileSync(join(OUT_DIR, "spells.json"), JSON.stringify(spells, null, 2));
  console.log(`  ✓ ${spells.length} spells saved\n`);

  // Monsters
  console.log("Fetching monsters...");
  const monsters = await fetchAll("/monsters/", "Monsters");
  writeFileSync(join(OUT_DIR, "monsters.json"), JSON.stringify(monsters, null, 2));
  console.log(`  ✓ ${monsters.length} monsters saved\n`);

  // Magic Items
  console.log("Fetching magic items...");
  const items = await fetchAll("/magicitems/", "Items");
  writeFileSync(join(OUT_DIR, "items.json"), JSON.stringify(items, null, 2));
  console.log(`  ✓ ${items.length} items saved\n`);

  // Weapons
  console.log("Fetching weapons...");
  const weapons = await fetchAll("/weapons/", "Weapons");
  writeFileSync(join(OUT_DIR, "weapons.json"), JSON.stringify(weapons, null, 2));
  console.log(`  ✓ ${weapons.length} weapons saved\n`);

  // Armor
  console.log("Fetching armor...");
  const armor = await fetchAll("/armor/", "Armor");
  writeFileSync(join(OUT_DIR, "armor.json"), JSON.stringify(armor, null, 2));
  console.log(`  ✓ ${armor.length} armor saved\n`);

  console.log("=== Done! ===\n");
}

main().catch(console.error);
