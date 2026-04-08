import type {
  Open5eSpell,
  Open5eMonster,
  Open5eMagicItem,
  Open5ePaginatedResponse,
} from "@/types/dnd5e";

const BASE_URL = "https://api.open5e.com/v1";
const REVALIDATE = 86400; // 24 hours

async function fetchPaginated<T>(endpoint: string): Promise<T[]> {
  const results: T[] = [];
  let url: string | null = `${BASE_URL}${endpoint}?format=json&limit=50`;

  while (url) {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) {
      console.error(`Open5e API error: ${res.status} for ${url}`);
      break;
    }
    const data: Open5ePaginatedResponse<T> = await res.json();
    results.push(...data.results);
    url = data.next;
  }

  return results;
}

export async function fetchSpells(): Promise<Open5eSpell[]> {
  return fetchPaginated<Open5eSpell>("/spells/");
}

export async function fetchSpellBySlug(slug: string): Promise<Open5eSpell | null> {
  const res = await fetch(`${BASE_URL}/spells/${slug}/?format=json`, {
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchMonsters(): Promise<Open5eMonster[]> {
  return fetchPaginated<Open5eMonster>("/monsters/");
}

export async function fetchMonsterBySlug(slug: string): Promise<Open5eMonster | null> {
  const res = await fetch(`${BASE_URL}/monsters/${slug}/?format=json`, {
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchMagicItems(): Promise<Open5eMagicItem[]> {
  return fetchPaginated<Open5eMagicItem>("/magicitems/");
}

export async function fetchMagicItemBySlug(slug: string): Promise<Open5eMagicItem | null> {
  const res = await fetch(`${BASE_URL}/magicitems/${slug}/?format=json`, {
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) return null;
  return res.json();
}
