import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import type { Character, Attribute, Skill } from "@/types/dnd5e";
import { ATTRIBUTES, SKILLS, SKILL_ATTRIBUTE_MAP, CONDITIONS } from "@/types/dnd5e";
import { getModifier, getProficiencyBonus, getSkillValue, getCarryCapacity } from "@/lib/dnd5e";
import { formatModifier } from "@/lib/utils";
import skillsData from "@/data/skills.json";

// ── Font Registration ──
Font.register({
  family: "Serif",
  fonts: [
    { src: "https://cdn.jsdelivr.net/fontsource/fonts/eb-garamond@latest/latin-400-normal.ttf", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/fontsource/fonts/eb-garamond@latest/latin-700-normal.ttf", fontWeight: 700 },
  ],
});

// ── Constants ──
const PARCHMENT = "#f4e4c1";
const INK = "#1a0f02";
const GOLD = "#8b6914";
const BLOOD = "#8b1a1a";

const ATTR_LABELS: Record<Attribute, string> = {
  str: "FOR", dex: "DES", con: "CON", int: "INT", wis: "SAB", cha: "CAR",
};

const ATTR_FULL: Record<Attribute, string> = {
  str: "Forca", dex: "Destreza", con: "Constituicao",
  int: "Inteligencia", wis: "Sabedoria", cha: "Carisma",
};

const SKILL_NAMES: Record<string, string> = Object.fromEntries(
  skillsData.map((s) => [s.slug, s.name])
);

const CONDITION_LABELS: Record<string, string> = {
  blinded: "Cego", charmed: "Enfeiticado", deafened: "Surdo",
  frightened: "Amedrontado", grappled: "Agarrado", incapacitated: "Incapacitado",
  invisible: "Invisivel", paralyzed: "Paralisado", petrified: "Petrificado",
  poisoned: "Envenenado", prone: "Prostrado", stunned: "Atordoado",
};

// ── Styles ──
const s = StyleSheet.create({
  page: {
    backgroundColor: PARCHMENT,
    padding: 20,
    fontFamily: "Serif",
    fontSize: 8,
    color: INK,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: `2px solid ${GOLD}`,
    paddingBottom: 6,
    marginBottom: 8,
  },
  charName: { fontSize: 18, fontWeight: 700, color: INK },
  headerSub: { fontSize: 9, color: "#555" },
  // Two-column layout
  columns: { flexDirection: "row", gap: 12 },
  colLeft: { width: "42%" },
  colRight: { width: "58%" },
  // Section title
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: GOLD,
    borderBottom: `1px solid ${GOLD}`,
    marginBottom: 4,
    marginTop: 8,
    paddingBottom: 2,
  },
  // Attribute box
  attrGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  attrBox: {
    width: 48,
    alignItems: "center",
    border: `1px solid ${GOLD}`,
    borderRadius: 4,
    padding: 3,
  },
  attrLabel: { fontSize: 7, fontWeight: 700, color: GOLD },
  attrMod: { fontSize: 14, fontWeight: 700 },
  attrScore: { fontSize: 7, color: "#666" },
  // Skill/Save row
  skillRow: { flexDirection: "row", alignItems: "center", marginBottom: 1.5 },
  profCircle: { width: 6, height: 6, borderRadius: 3, border: `1px solid ${GOLD}`, marginRight: 3 },
  profFilled: { width: 6, height: 6, borderRadius: 3, backgroundColor: GOLD, marginRight: 3 },
  skillAttr: { fontSize: 6, color: "#888", width: 20 },
  skillName: { flex: 1, fontSize: 7.5 },
  skillVal: { fontSize: 7.5, fontWeight: 700, width: 20, textAlign: "right" },
  // Combat boxes
  combatRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  combatBox: {
    flex: 1,
    alignItems: "center",
    border: `1px solid ${GOLD}`,
    borderRadius: 4,
    padding: 4,
  },
  combatLabel: { fontSize: 6, color: GOLD, fontWeight: 700 },
  combatValue: { fontSize: 16, fontWeight: 700 },
  // HP bar
  hpSection: { marginBottom: 6 },
  hpRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  hpLabel: { fontSize: 7, color: GOLD, fontWeight: 700 },
  hpVal: { fontSize: 12, fontWeight: 700 },
  // Attack table
  attackRow: { flexDirection: "row", borderBottom: `0.5px solid #ccc`, paddingVertical: 2 },
  attackName: { flex: 2, fontSize: 7.5 },
  attackBonus: { flex: 1, fontSize: 7.5, textAlign: "center" },
  attackDamage: { flex: 2, fontSize: 7.5, textAlign: "right" },
  // Death saves
  deathRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  deathLabel: { fontSize: 7, fontWeight: 700 },
  // Spells page
  spellHeader: { flexDirection: "row", gap: 16, marginBottom: 8, padding: 6, border: `1px solid ${GOLD}`, borderRadius: 4 },
  spellHeaderItem: { fontSize: 8 },
  spellHeaderVal: { fontWeight: 700 },
  slotRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  slotLevel: { fontSize: 8, fontWeight: 700, width: 30, color: GOLD },
  slotCircle: { width: 8, height: 8, borderRadius: 4, border: `1px solid ${GOLD}`, marginRight: 3 },
  slotFilled: { width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD + "60", border: `1px solid ${GOLD}`, marginRight: 3 },
  spellList: { marginBottom: 6 },
  spellName: { fontSize: 7.5, marginBottom: 1 },
  // Page 3
  traitsGrid: { flexDirection: "row", gap: 8, marginBottom: 8 },
  traitBox: { flex: 1, border: `1px solid ${GOLD}`, borderRadius: 4, padding: 6 },
  traitLabel: { fontSize: 8, fontWeight: 700, color: GOLD, marginBottom: 2 },
  traitText: { fontSize: 7.5 },
  textBlock: { marginBottom: 8 },
  textBlockTitle: { fontSize: 9, fontWeight: 700, color: GOLD, marginBottom: 3 },
  textBlockContent: { fontSize: 7.5, lineHeight: 1.4 },
  // Inventory
  invHeaderRow: { flexDirection: "row", borderBottom: `1px solid ${GOLD}`, paddingBottom: 2, marginBottom: 2 },
  invRow: { flexDirection: "row", borderBottom: `0.5px solid #ddd`, paddingVertical: 1.5 },
  invName: { flex: 3, fontSize: 7 },
  invQty: { flex: 1, fontSize: 7, textAlign: "center" },
  invWeight: { flex: 1, fontSize: 7, textAlign: "center" },
  invValue: { flex: 1, fontSize: 7, textAlign: "center" },
  coinRow: { flexDirection: "row", gap: 12, marginTop: 4, marginBottom: 4 },
  coinItem: { fontSize: 7.5 },
  coinLabel: { fontWeight: 700, color: GOLD },
  // Conditions
  condRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  condBadge: { fontSize: 6.5, backgroundColor: BLOOD + "20", color: BLOOD, padding: "2 4", borderRadius: 2, border: `0.5px solid ${BLOOD}40` },
  // Footer
  pageNum: { position: "absolute", bottom: 10, right: 20, fontSize: 7, color: "#999" },
});

// ── Helper ──
function Circle({ filled }: { filled: boolean }) {
  return <View style={filled ? s.profFilled : s.profCircle} />;
}

// ── PAGE 1: Combat & Stats ──
function PdfPage1({ character: c }: { character: Character }) {
  const profBonus = getProficiencyBonus(c.level);

  return (
    <Page size="A4" style={s.page}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.charName}>{c.name}</Text>
          <Text style={s.headerSub}>
            {c.race} {c.class} — Nivel {c.level}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={s.headerSub}>Background: {c.background || "—"}</Text>
          <Text style={s.headerSub}>Alinhamento: {c.alignment.replace(/-/g, " ")}</Text>
          <Text style={s.headerSub}>XP: {c.xp} | Proficiencia: {formatModifier(profBonus)}</Text>
        </View>
      </View>

      {/* Attributes */}
      <View style={s.attrGrid}>
        {ATTRIBUTES.map((attr) => {
          const mod = getModifier(c.attributes[attr]);
          return (
            <View key={attr} style={s.attrBox}>
              <Text style={s.attrLabel}>{ATTR_LABELS[attr]}</Text>
              <Text style={s.attrMod}>{formatModifier(mod)}</Text>
              <Text style={s.attrScore}>{c.attributes[attr]}</Text>
            </View>
          );
        })}
      </View>

      <View style={s.columns}>
        {/* Left Column: Saves + Skills */}
        <View style={s.colLeft}>
          <Text style={s.sectionTitle}>Saving Throws</Text>
          {ATTRIBUTES.map((attr) => {
            const prof = c.savingThrowProficiencies.includes(attr);
            const val = getModifier(c.attributes[attr]) + (prof ? profBonus : 0);
            return (
              <View key={attr} style={s.skillRow}>
                <Circle filled={prof} />
                <Text style={s.skillName}>{ATTR_FULL[attr]}</Text>
                <Text style={s.skillVal}>{formatModifier(val)}</Text>
              </View>
            );
          })}

          <Text style={s.sectionTitle}>Pericias</Text>
          {SKILLS.map((skill) => {
            const attr = SKILL_ATTRIBUTE_MAP[skill];
            const profLevel = c.skillProficiencies[skill] || "none";
            const val = getSkillValue(c.attributes[attr], profBonus, profLevel);
            return (
              <View key={skill} style={s.skillRow}>
                <Circle filled={profLevel !== "none"} />
                <Text style={s.skillAttr}>{ATTR_LABELS[attr]}</Text>
                <Text style={s.skillName}>
                  {SKILL_NAMES[skill] || skill}
                  {profLevel === "expertise" ? " *" : ""}
                </Text>
                <Text style={s.skillVal}>{formatModifier(val)}</Text>
              </View>
            );
          })}
        </View>

        {/* Right Column: Combat */}
        <View style={s.colRight}>
          <View style={s.combatRow}>
            <View style={s.combatBox}>
              <Text style={s.combatLabel}>AC</Text>
              <Text style={s.combatValue}>{c.ac}</Text>
            </View>
            <View style={s.combatBox}>
              <Text style={s.combatLabel}>Iniciativa</Text>
              <Text style={s.combatValue}>{formatModifier(c.initiative)}</Text>
            </View>
            <View style={s.combatBox}>
              <Text style={s.combatLabel}>Desloc.</Text>
              <Text style={s.combatValue}>{c.speed}ft</Text>
            </View>
          </View>

          <View style={s.hpSection}>
            <View style={s.hpRow}>
              <Text style={s.hpLabel}>HP: </Text>
              <Text style={s.hpVal}>{c.hp.current} / {c.hp.max}</Text>
              {c.hp.temporary > 0 && <Text style={{ fontSize: 8, color: "#666" }}> (temp: {c.hp.temporary})</Text>}
            </View>
            <Text style={{ fontSize: 7, color: "#666", marginTop: 2 }}>
              Hit Dice: {c.hitDice.total - c.hitDice.used}/{c.hitDice.total} d{c.hitDice.dieType}
            </Text>
          </View>

          {/* Death Saves */}
          <View style={s.deathRow}>
            <Text style={[s.deathLabel, { color: "green" }]}>Sucesso: </Text>
            {[0, 1, 2].map((i) => <Circle key={`s${i}`} filled={i < c.deathSaves.successes} />)}
            <Text style={[s.deathLabel, { color: BLOOD, marginLeft: 8 }]}>Falha: </Text>
            {[0, 1, 2].map((i) => <Circle key={`f${i}`} filled={i < c.deathSaves.failures} />)}
          </View>

          {/* Attacks */}
          <Text style={s.sectionTitle}>Ataques</Text>
          <View style={s.attackRow}>
            <Text style={[s.attackName, { fontWeight: 700 }]}>Nome</Text>
            <Text style={[s.attackBonus, { fontWeight: 700 }]}>+Atq</Text>
            <Text style={[s.attackDamage, { fontWeight: 700 }]}>Dano</Text>
          </View>
          {c.attacks.length === 0 ? (
            <Text style={{ fontSize: 7, color: "#999", marginTop: 2 }}>Nenhum ataque</Text>
          ) : (
            c.attacks.map((a) => (
              <View key={a.id} style={s.attackRow}>
                <Text style={s.attackName}>{a.name}</Text>
                <Text style={s.attackBonus}>{formatModifier(a.attackBonus)}</Text>
                <Text style={s.attackDamage}>{a.damage} {a.damageType}</Text>
              </View>
            ))
          )}

          {/* Conditions */}
          {c.conditions.length > 0 && (
            <>
              <Text style={s.sectionTitle}>Condicoes Ativas</Text>
              <View style={s.condRow}>
                {c.conditions.map((cond) => (
                  <Text key={cond} style={s.condBadge}>{CONDITION_LABELS[cond] || cond}</Text>
                ))}
              </View>
            </>
          )}
        </View>
      </View>

      <Text style={s.pageNum}>1</Text>
    </Page>
  );
}

// ── PAGE 2: Spells ──
function PdfPage2({ character: c }: { character: Character }) {
  const profBonus = getProficiencyBonus(c.level);
  const spellAbility = c.spellcastingAbility;
  const spellMod = spellAbility ? getModifier(c.attributes[spellAbility]) : 0;
  const spellDC = spellAbility ? 8 + profBonus + spellMod : null;
  const spellAttack = spellAbility ? profBonus + spellMod : null;

  const hasSpells = Object.values(c.spells).some((list) => list.length > 0) ||
    Object.values(c.spellSlots).some((slot) => slot.max > 0);

  return (
    <Page size="A4" style={s.page}>
      <Text style={[s.sectionTitle, { marginTop: 0 }]}>Magias</Text>

      {!hasSpells ? (
        <Text style={{ fontSize: 10, color: "#999", textAlign: "center", marginTop: 40 }}>Nenhuma magia</Text>
      ) : (
        <>
          {/* Spellcasting header */}
          {spellAbility && (
            <View style={s.spellHeader}>
              <Text style={s.spellHeaderItem}>
                Habilidade: <Text style={s.spellHeaderVal}>{ATTR_FULL[spellAbility]}</Text>
              </Text>
              <Text style={s.spellHeaderItem}>
                CD Magia: <Text style={s.spellHeaderVal}>{spellDC}</Text>
              </Text>
              <Text style={s.spellHeaderItem}>
                Ataque Magia: <Text style={s.spellHeaderVal}>{formatModifier(spellAttack!)}</Text>
              </Text>
            </View>
          )}

          {/* Spell slots */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
            const slot = c.spellSlots[level];
            if (!slot || slot.max === 0) return null;
            return (
              <View key={level} style={s.slotRow}>
                <Text style={s.slotLevel}>Nv {level}</Text>
                {Array.from({ length: slot.max }, (_, i) => (
                  <View key={i} style={i < slot.used ? s.slotFilled : s.slotCircle} />
                ))}
                <Text style={{ fontSize: 7, color: "#888", marginLeft: 4 }}>
                  {slot.max - slot.used}/{slot.max}
                </Text>
              </View>
            );
          })}

          {/* Spell lists by level */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
            const spells = c.spells[level];
            if (!spells || spells.length === 0) return null;
            return (
              <View key={level} style={s.spellList}>
                <Text style={s.sectionTitle}>{level === 0 ? "Cantrips" : `Nivel ${level}`}</Text>
                {spells.map((spell, i) => (
                  <Text key={i} style={s.spellName}>
                    {spell.name}
                    {spell.school ? ` (${spell.school})` : ""}
                  </Text>
                ))}
              </View>
            );
          })}
        </>
      )}

      <Text style={s.pageNum}>2</Text>
    </Page>
  );
}

// ── PAGE 3: History & Inventory ──
function PdfPage3({ character: c }: { character: Character }) {
  const carryCapacity = getCarryCapacity(c.attributes.str);
  const totalWeight = c.inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0);

  return (
    <Page size="A4" style={s.page}>
      {/* Traits 2x2 grid */}
      <View style={s.traitsGrid}>
        <View style={s.traitBox}>
          <Text style={s.traitLabel}>Personalidade</Text>
          <Text style={s.traitText}>{c.traits.personality || "—"}</Text>
        </View>
        <View style={s.traitBox}>
          <Text style={s.traitLabel}>Ideais</Text>
          <Text style={s.traitText}>{c.traits.ideals || "—"}</Text>
        </View>
      </View>
      <View style={s.traitsGrid}>
        <View style={s.traitBox}>
          <Text style={s.traitLabel}>Vinculos</Text>
          <Text style={s.traitText}>{c.traits.bonds || "—"}</Text>
        </View>
        <View style={s.traitBox}>
          <Text style={s.traitLabel}>Fraquezas</Text>
          <Text style={s.traitText}>{c.traits.flaws || "—"}</Text>
        </View>
      </View>

      {/* Appearance */}
      {c.notes.appearance && (
        <View style={s.textBlock}>
          <Text style={s.textBlockTitle}>Aparencia</Text>
          <Text style={s.textBlockContent}>{c.notes.appearance}</Text>
        </View>
      )}

      {/* Backstory */}
      {c.notes.backstory && (
        <View style={s.textBlock}>
          <Text style={s.textBlockTitle}>Historia Pessoal</Text>
          <Text style={s.textBlockContent}>{c.notes.backstory}</Text>
        </View>
      )}

      {/* Allies */}
      {c.notes.allies && (
        <View style={s.textBlock}>
          <Text style={s.textBlockTitle}>Aliados & Organizacoes</Text>
          <Text style={s.textBlockContent}>{c.notes.allies}</Text>
        </View>
      )}

      {/* Inventory */}
      <Text style={s.sectionTitle}>Inventario</Text>

      {/* Coins */}
      <View style={s.coinRow}>
        {(["cp", "sp", "ep", "gp", "pp"] as const).map((coin) => (
          <Text key={coin} style={s.coinItem}>
            <Text style={s.coinLabel}>{coin.toUpperCase()}: </Text>
            {c.coins[coin]}
          </Text>
        ))}
      </View>

      {/* Items table */}
      <View style={s.invHeaderRow}>
        <Text style={[s.invName, { fontWeight: 700 }]}>Item</Text>
        <Text style={[s.invQty, { fontWeight: 700 }]}>Qtd</Text>
        <Text style={[s.invWeight, { fontWeight: 700 }]}>Peso</Text>
        <Text style={[s.invValue, { fontWeight: 700 }]}>PO</Text>
      </View>
      {c.inventory.length === 0 ? (
        <Text style={{ fontSize: 7, color: "#999", marginTop: 2 }}>Nenhum item</Text>
      ) : (
        c.inventory.map((item) => (
          <View key={item.id} style={s.invRow}>
            <Text style={s.invName}>{item.name}</Text>
            <Text style={s.invQty}>{item.quantity}</Text>
            <Text style={s.invWeight}>{item.weight}kg</Text>
            <Text style={s.invValue}>{item.valuePO}</Text>
          </View>
        ))
      )}
      <Text style={{ fontSize: 7, color: "#666", marginTop: 3 }}>
        Peso total: {totalWeight.toFixed(1)} / {carryCapacity.toFixed(1)} kg
      </Text>

      {/* Free Notes */}
      {c.notes.freeNotes && (
        <View style={s.textBlock}>
          <Text style={s.textBlockTitle}>Notas</Text>
          <Text style={s.textBlockContent}>{c.notes.freeNotes}</Text>
        </View>
      )}

      <Text style={s.pageNum}>3</Text>
    </Page>
  );
}

// ── Document Wrapper ──
export function CharacterSheetDocument({ character }: { character: Character }) {
  return (
    <Document title={`${character.name} — Ficha D&D 5e`} author="D&D 5e Toolkit">
      <PdfPage1 character={character} />
      <PdfPage2 character={character} />
      <PdfPage3 character={character} />
    </Document>
  );
}

// ── Generator Function ──
export async function generateCharacterPdf(character: Character): Promise<Blob> {
  const blob = await pdf(<CharacterSheetDocument character={character} />).toBlob();
  return blob;
}
