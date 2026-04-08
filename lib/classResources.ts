import type { CharacterClass, Attribute } from "@/types/dnd5e";
import { getModifier } from "@/lib/dnd5e";

export interface ResourceCounter {
  key: string;
  name: string;
  max: number;
  used: number;
  recharge: "short" | "long";
}

function rageUses(level: number): number {
  if (level >= 20) return 999; // unlimited
  if (level >= 17) return 6;
  if (level >= 12) return 5;
  if (level >= 6) return 4;
  if (level >= 3) return 3;
  return 2;
}

function channelDivinityUses(level: number): number {
  if (level >= 18) return 3;
  if (level >= 6) return 2;
  if (level >= 2) return 1;
  return 0;
}

function actionSurgeUses(level: number): number {
  if (level >= 17) return 2;
  if (level >= 2) return 1;
  return 0;
}

function pactSlots(level: number): number {
  if (level >= 17) return 4;
  if (level >= 11) return 3;
  if (level >= 2) return 2;
  return 1;
}

export function getClassResources(
  characterClass: CharacterClass,
  level: number,
  attributes: Record<Attribute, number>
): ResourceCounter[] {
  const chaMod = getModifier(attributes.cha);
  const resources: ResourceCounter[] = [];

  switch (characterClass) {
    case "barbarian":
      resources.push({
        key: "rage",
        name: "Furia",
        max: rageUses(level),
        used: 0,
        recharge: "long",
      });
      break;

    case "bard":
      resources.push({
        key: "bardic-inspiration",
        name: "Inspiracao Bardica",
        max: Math.max(1, chaMod),
        used: 0,
        recharge: "long",
      });
      break;

    case "cleric": {
      const cdUses = channelDivinityUses(level);
      if (cdUses > 0) {
        resources.push({
          key: "channel-divinity",
          name: "Canalizar Divindade",
          max: cdUses,
          used: 0,
          recharge: "short",
        });
      }
      break;
    }

    case "fighter": {
      if (level >= 1) {
        resources.push({
          key: "second-wind",
          name: "Segundo Folego",
          max: 1,
          used: 0,
          recharge: "short",
        });
      }
      const asUses = actionSurgeUses(level);
      if (asUses > 0) {
        resources.push({
          key: "action-surge",
          name: "Surto de Acao",
          max: asUses,
          used: 0,
          recharge: "short",
        });
      }
      break;
    }

    case "monk":
      if (level >= 2) {
        resources.push({
          key: "ki",
          name: "Ki",
          max: level,
          used: 0,
          recharge: "short",
        });
      }
      break;

    case "paladin": {
      if (level >= 1) {
        resources.push({
          key: "divine-sense",
          name: "Sentido Divino",
          max: 1 + chaMod,
          used: 0,
          recharge: "long",
        });
      }
      if (level >= 1) {
        resources.push({
          key: "lay-on-hands",
          name: "Cura pelas Maos",
          max: 5 * level,
          used: 0,
          recharge: "long",
        });
      }
      break;
    }

    case "sorcerer":
      if (level >= 2) {
        resources.push({
          key: "sorcery-points",
          name: "Pontos de Feiticaria",
          max: level,
          used: 0,
          recharge: "long",
        });
      }
      break;

    case "warlock":
      resources.push({
        key: "pact-slots",
        name: "Slots de Pacto",
        max: pactSlots(level),
        used: 0,
        recharge: "short",
      });
      break;

    // druid, ranger, rogue, wizard: no special counters
    default:
      break;
  }

  return resources;
}
