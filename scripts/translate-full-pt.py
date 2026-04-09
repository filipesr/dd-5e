#!/usr/bin/env python3
"""
Translate D&D 5e SRD spells from English to PT-BR.
Applies extensive regex-based substitutions to desc, higher_level, material, and range fields.
"""

import json
import re
import os

# ─────────────────────────────────────────────
# Utility helpers
# ─────────────────────────────────────────────

def feet_to_meters(match):
    """Convert feet measurement to meters (1 foot ≈ 0.3 m, rounded to nearest 1.5 m grid)."""
    n = int(match.group(1))
    # D&D standard: 5 ft = 1.5 m
    m = round(n * 0.3)
    # Round to nearest 1.5
    m_15 = round(n / 5) * 1.5
    if m_15 == int(m_15):
        m_str = str(int(m_15))
    else:
        m_str = str(m_15)
    unit_en = match.group(2)  # "feet", "foot", "Feet", "Foot", "-foot", "-feet"
    unit_lower = unit_en.lower().strip("-").strip()
    if unit_lower in ("foot", "feet"):
        return f"{m_str} metros"
    return f"{m_str} metros"

def feet_to_meters_hyphen(match):
    """Handle patterns like '20-foot', '30-feet' (adjective form)."""
    n = int(match.group(1))
    m_15 = round(n / 5) * 1.5
    if m_15 == int(m_15):
        m_str = str(int(m_15))
    else:
        m_str = str(m_15)
    return f"{m_str} metros"

def ordinal_pt(n):
    ordinals = {
        1: "1°", 2: "2°", 3: "3°", 4: "4°", 5: "5°",
        6: "6°", 7: "7°", 8: "8°", 9: "9°"
    }
    return ordinals.get(n, f"{n}°")

ORDINAL_MAP = {
    "1st": "1°", "2nd": "2°", "3rd": "3°", "4th": "4°",
    "5th": "5°", "6th": "6°", "7th": "7°", "8th": "8°", "9th": "9°",
    "first": "primeiro", "second": "segundo", "third": "terceiro",
    "fourth": "quarto", "fifth": "quinto", "sixth": "sexto",
    "seventh": "sétimo", "eighth": "oitavo", "ninth": "nono",
    "tenth": "décimo",
}

NUMBER_WORDS = {
    r"\bone\b": "um",
    r"\btwo\b": "dois",
    r"\bthree\b": "três",
    r"\bfour\b": "quatro",
    r"\bfive\b": "cinco",
    r"\bsix\b": "seis",
    r"\bseven\b": "sete",
    r"\beight\b": "oito",
    r"\bnine\b": "nove",
    r"\bten\b": "dez",
    r"\beleven\b": "onze",
    r"\btwelve\b": "doze",
    r"\bthirteen\b": "treze",
    r"\bfourteen\b": "quatorze",
    r"\bfifteen\b": "quinze",
    r"\bsixteen\b": "dezesseis",
    r"\bseventeen\b": "dezessete",
    r"\beighteen\b": "dezoito",
    r"\bnineteen\b": "dezenove",
    r"\btwenty\b": "vinte",
    r"\bthirty\b": "trinta",
    r"\bforty\b": "quarenta",
    r"\bfifty\b": "cinquenta",
    r"\bsixty\b": "sessenta",
    r"\bseventy\b": "setenta",
    r"\beighty\b": "oitenta",
    r"\bninety\b": "noventa",
    r"\bhundred\b": "cem",
}

# ─────────────────────────────────────────────
# Main translation patterns (order matters!)
# Each entry: (pattern, replacement) or (pattern, callable)
# ─────────────────────────────────────────────

# We'll store them as (pattern_str, repl, flags) tuples
PATTERNS = []

def p(pattern, repl, flags=re.IGNORECASE):
    PATTERNS.append((pattern, repl, flags))

# ── Measurements first ────────────────────────────────────────────────────────
# Hyphenated adjective form: "20-foot", "30-feet" → "6 metros"
p(r'(\d+)-foot(?:s|-radius)?\b', feet_to_meters_hyphen)
p(r'(\d+)-feet\b', feet_to_meters_hyphen)
# Standalone: "20 feet", "20 foot"
p(r'(\d+)\s+(feet|foot)\b', feet_to_meters)
# Miles
p(r'(\d+)\s+miles?\b', lambda m: f"{int(m.group(1)) * 1.6:.0f} km")
# Pound(s)
p(r'(\d+)\s+pounds?\b', lambda m: f"{round(int(m.group(1)) * 0.45)} kg")

# ── Full sentence / phrase patterns ───────────────────────────────────────────

# Spell casting
p(r"When you cast this spell using a spell slot of (\w+) level or higher,?",
  lambda m: f"Quando você conjura esta magia usando um espaço de magia de {ORDINAL_MAP.get(m.group(1).lower(), m.group(1))} nível ou superior,")
p(r"When you cast this spell using a spell slot of (\w+) or (\w+) level,?",
  lambda m: f"Quando você conjura esta magia usando um espaço de magia de {ORDINAL_MAP.get(m.group(1).lower(), m.group(1))} ou {ORDINAL_MAP.get(m.group(2).lower(), m.group(2))} nível,")
p(r"When you cast this spell using higher.level spell slots?,",
  "Quando você conjura esta magia usando espaços de magia de nível superior,")
p(r"when you cast this spell", "quando você conjura esta magia")
p(r"If you cast this spell using a spell slot of (\w+) level or higher,?",
  lambda m: f"Se você conjurar esta magia usando um espaço de magia de {ORDINAL_MAP.get(m.group(1).lower(), m.group(1))} nível ou superior,")

p(r"\bYou cast this spell\b", "Você conjura esta magia")
p(r"\byou cast this spell\b", "você conjura esta magia")
p(r"\bcast this spell\b", "conjurar esta magia")
p(r"\bcast the spell\b", "conjurar a magia")
p(r"\bcasting this spell\b", "conjurando esta magia")
p(r"\bthe spell ends\b", "a magia termina")
p(r"\bthe spell's damage\b", "o dano da magia")
p(r"\bspell save DC\b", "CD da magia")
p(r"\bspell attack roll\b", "rolagem de ataque de magia")
p(r"\ba spell slot\b", "um espaço de magia")
p(r"\bspell slots?\b", "espaços de magia")
p(r"\bslot level\b", "nível do espaço")
p(r"\bfor each slot level above (\w+)\b",
  lambda m: f"para cada nível do espaço acima do {ORDINAL_MAP.get(m.group(1).lower(), m.group(1))}")
p(r"\beach slot level above (\w+)\b",
  lambda m: f"cada nível do espaço acima do {ORDINAL_MAP.get(m.group(1).lower(), m.group(1))}")
p(r"\bspell slot\b", "espaço de magia")

# Saving throws
p(r"must succeed on an? (\w+) saving throw",
  lambda m: f"deve ser bem-sucedido em um teste de resistência de {_ability_pt(m.group(1))}")
p(r"must make an? (\w+) saving throw",
  lambda m: f"deve fazer um teste de resistência de {_ability_pt(m.group(1))}")
p(r"makes? an? (\w+) saving throw",
  lambda m: f"faz um teste de resistência de {_ability_pt(m.group(1))}")
p(r"failed? an? (\w+) saving throw",
  lambda m: f"falha em um teste de resistência de {_ability_pt(m.group(1))}")
p(r"fails? the saving throw", "falha no teste de resistência")
p(r"succeeds? on the saving throw", "é bem-sucedido no teste de resistência")
p(r"succeeds? on an? saving throw", "é bem-sucedido em um teste de resistência")
p(r"a successful (\w+) saving throw",
  lambda m: f"um teste de resistência de {_ability_pt(m.group(1))} bem-sucedido")
p(r"on a failed save\b", "em uma falha no teste")
p(r"on a successful save\b", "em um sucesso no teste")
p(r"saving throw", "teste de resistência")
p(r"save DC", "CD do teste")

# Ability checks
p(r"an? (\w+) check", lambda m: f"uma verificação de {_ability_pt(m.group(1))}")
p(r"(\w+) ability check", lambda m: f"verificação de {_ability_pt(m.group(1))}")
p(r"(\w+) ability modifier", lambda m: f"modificador de {_ability_pt(m.group(1))}")
p(r"(\w+) modifier", lambda m: f"modificador de {_ability_pt(m.group(1))}" if m.group(1).lower() in ABILITY_MAP else m.group(0))
p(r"Strength score", "valor de Força")
p(r"Dexterity score", "valor de Destreza")
p(r"Constitution score", "valor de Constituição")
p(r"Intelligence score", "valor de Inteligência")
p(r"Wisdom score", "valor de Sabedoria")
p(r"Charisma score", "valor de Carisma")

# Attacks
p(r"make a melee spell attack against the target", "faça um ataque de magia corpo a corpo contra o alvo")
p(r"make a ranged spell attack against the target", "faça um ataque de magia à distância contra o alvo")
p(r"make a melee spell attack", "faça um ataque de magia corpo a corpo")
p(r"make a ranged spell attack", "faça um ataque de magia à distância")
p(r"make a melee weapon attack against the target", "faça um ataque corpo a corpo com arma contra o alvo")
p(r"make a melee weapon attack", "faça um ataque corpo a corpo com arma")
p(r"make a ranged weapon attack", "faça um ataque à distância com arma")
p(r"make an? attack roll", "faça uma rolagem de ataque")
p(r"melee spell attack", "ataque de magia corpo a corpo")
p(r"ranged spell attack", "ataque de magia à distância")
p(r"melee weapon attack", "ataque corpo a corpo com arma")
p(r"ranged weapon attack", "ataque à distância com arma")
p(r"melee or ranged weapon attack", "ataque corpo a corpo ou à distância com arma")
p(r"melee attack", "ataque corpo a corpo")
p(r"ranged attack", "ataque à distância")
p(r"opportunity attack", "ataque de oportunidade")
p(r"opportunity attacks", "ataques de oportunidade")
p(r"attack roll", "rolagem de ataque")
p(r"attack rolls", "rolagens de ataque")
p(r"on a hit\b", "em um acerto")
p(r"on a miss\b", "em um erro")
p(r"a critical hit", "um acerto crítico")

# Hit Points
p(r"hit point maximum", "máximo de pontos de vida")
p(r"current hit points", "pontos de vida atuais")
p(r"maximum hit points", "máximo de pontos de vida")
p(r"regain(?:s)? (\d+d?\d*) hit points", lambda m: f"recupera {m.group(1)} pontos de vida")
p(r"regain(?:s)? hit points", "recupera pontos de vida")
p(r"lose(?:s)? (\d+d?\d*) hit points", lambda m: f"perde {m.group(1)} pontos de vida")
p(r"hit points equal to", "pontos de vida igual a")
p(r"hit points", "pontos de vida")
p(r"hit point", "ponto de vida")
p(r"\bHP\b", "PV")

# Damage types
p(r"\bacid damage\b", "dano de ácido")
p(r"\bbludgeoning damage\b", "dano de concussão")
p(r"\bcold damage\b", "dano de frio")
p(r"\bfire damage\b", "dano de fogo")
p(r"\bforce damage\b", "dano de força")
p(r"\blightning damage\b", "dano de relâmpago")
p(r"\bnecrotic damage\b", "dano necrótico")
p(r"\bpiercing damage\b", "dano perfurante")
p(r"\bpoison damage\b", "dano de veneno")
p(r"\bpsychic damage\b", "dano psíquico")
p(r"\bradiant damage\b", "dano radiante")
p(r"\bslashing damage\b", "dano cortante")
p(r"\bthunder damage\b", "dano de trovão")
p(r"\bbludgeoning,? piercing,? and slashing\b", "concussão, perfurante e cortante")
p(r"\bbludgeoning,? piercing,? or slashing\b", "concussão, perfurante ou cortante")

# Conditions
p(r"\bblinded\b", "cego")
p(r"\bcharmed\b", "enfeitiçado")
p(r"\bdeafened\b", "ensurdecido")
p(r"\bexhaustion\b", "exaustão")
p(r"\bfrightened\b", "amedrontado")
p(r"\bgrappled\b", "agarrado")
p(r"\bincapacitated\b", "incapacitado")
p(r"\binvisible\b", "invisível")
p(r"\bparalyzed\b", "paralisado")
p(r"\bpetrified\b", "petrificado")
p(r"\bpoisoned\b", "envenenado")
p(r"\bprone\b", "caído")
p(r"\brestrained\b", "imobilizado")
p(r"\bstunned\b", "atordoado")
p(r"\bunconscious\b", "inconsciente")

# Ability names (standalone)
p(r"\bStrength\b", "Força")
p(r"\bDexterity\b", "Destreza")
p(r"\bConstitution\b", "Constituição")
p(r"\bIntelligence\b", "Inteligência")
p(r"\bWisdom\b", "Sabedoria")
p(r"\bCharisma\b", "Carisma")

# Actions
p(r"\bbonus action\b", "ação bônus")
p(r"\bbonus actions\b", "ações bônus")
p(r"\breaction\b", "reação")
p(r"\breactions\b", "reações")
p(r"\bfree action\b", "ação gratuita")
p(r"\baction\b", "ação")
p(r"\bactions\b", "ações")

# Concentration
p(r"\bConcentration,? up to\b", "Concentração, até")
p(r"\brequires concentration\b", "requer concentração")
p(r"\bconcentration\b", "concentração")
p(r"\bmaintain(?:ing)? concentration\b", "manter concentração")

# Common D&D phrases
p(r"\bwithin range\b", "dentro do alcance")
p(r"\bout of range\b", "fora do alcance")
p(r"\bspell's range\b", "alcance da magia")
p(r"\bthe range of this spell\b", "o alcance desta magia")
p(r"\bthe duration\b", "a duração")
p(r"\bfor the duration\b", "pela duração")
p(r"\buntil the spell ends\b", "até a magia terminar")
p(r"\buntil the end of its next turn\b", "até o final de seu próximo turno")
p(r"\buntil the end of your next turn\b", "até o final do seu próximo turno")
p(r"\bat the start of its turn\b", "no início de seu turno")
p(r"\bat the end of its turn\b", "no final de seu turno")
p(r"\bat the start of your turn\b", "no início do seu turno")
p(r"\bat the end of your turn\b", "no final do seu turno")
p(r"\bat the start of each of its turns\b", "no início de cada um de seus turnos")
p(r"\bat the end of each of its turns\b", "no final de cada um de seus turnos")
p(r"\bat the start of each turn\b", "no início de cada turno")
p(r"\bat the end of each turn\b", "no final de cada turno")
p(r"\beach of its turns\b", "cada um de seus turnos")
p(r"\beach of your turns\b", "cada um de seus turnos")
p(r"\bon each of its turns\b", "em cada um de seus turnos")
p(r"\bonce per turn\b", "uma vez por turno")
p(r"\bonce on each of your turns\b", "uma vez em cada um de seus turnos")
p(r"\buntil the start of your next turn\b", "até o início de seu próximo turno")
p(r"\buntil the start of its next turn\b", "até o início de seu próximo turno")
p(r"\bfor 1 minute\b", "por 1 minuto")
p(r"\bfor 1 hour\b", "por 1 hora")
p(r"\bfor 24 hours\b", "por 24 horas")
p(r"\bfor 8 hours\b", "por 8 horas")
p(r"\bfor (\d+) minutes?\b", lambda m: f"por {m.group(1)} minutos")
p(r"\bfor (\d+) hours?\b", lambda m: f"por {m.group(1)} horas")
p(r"\bfor (\d+) rounds?\b", lambda m: f"por {m.group(1)} rodadas")
p(r"\buntil dawn\b", "até o amanhecer")
p(r"\buntil dusk\b", "até o anoitecer")
p(r"\bnext long rest\b", "próximo descanso longo")
p(r"\bnext short or long rest\b", "próximo descanso curto ou longo")
p(r"\blong rest\b", "descanso longo")
p(r"\bshort rest\b", "descanso curto")

# Creatures and targets
p(r"\bthe target\b", "o alvo")
p(r"\ba target\b", "um alvo")
p(r"\beach target\b", "cada alvo")
p(r"\bone target\b", "um alvo")
p(r"\bup to (\d+) targets?\b", lambda m: f"até {m.group(1)} alvos")
p(r"\bwilling creature\b", "criatura voluntária")
p(r"\bwilling creatures\b", "criaturas voluntárias")
p(r"\bhostile creature\b", "criatura hostil")
p(r"\bhostile creatures\b", "criaturas hostis")
p(r"\bfriendly creature\b", "criatura amigável")
p(r"\bfriendly creatures\b", "criaturas amigáveis")
p(r"\ba creature\b", "uma criatura")
p(r"\bthe creature\b", "a criatura")
p(r"\beach creature\b", "cada criatura")
p(r"\bother creatures\b", "outras criaturas")
p(r"\bundeads?\b", "morto-vivo")
p(r"\bconstructs?\b", "constructo")
p(r"\bhumanoids?\b", "humanoide")
p(r"\bbeasts?\b", "besta")
p(r"\bfiends?\b", "demônio")
p(r"\bcelestrials?\b", "celestial")
p(r"\belementals?\b", "elemental")
p(r"\bfey\b", "fada")
p(r"\bmonsters?\b", "monstro")
p(r"\babberation\b", "aberração")
p(r"\baberration\b", "aberração")
p(r"\bdragon\b", "dragão")
p(r"\bgiant\b", "gigante")
p(r"\bplant\b", "planta")
p(r"\bshapechanger\b", "metamorfo")
p(r"\bswarm\b", "enxame")
p(r"\bchallenge rating\b", "nível de desafio")
p(r"\bpassive Perception\b", "Percepção passiva")
p(r"\bproficiency bonus\b", "bônus de proficiência")

# Body / senses
p(r"\bdarkvision\b", "visão no escuro")
p(r"\btrue sight\b", "visão verdadeira")
p(r"\btruesight\b", "visão verdadeira")
p(r"\bblindsight\b", "visão às cegas")
p(r"\btremorsense\b", "sentido sísmico")
p(r"\bsenses\b", "sentidos")

# Armor class
p(r"\barmor class\b", "classe de armadura")
p(r"\bAC\b", "CA")
p(r"\bnatural armor\b", "armadura natural")

# Movement
p(r"\bmovement speed\b", "velocidade de movimento")
p(r"\bmovement\b", "movimento")
p(r"\bfly(?:ing)? speed\b", "velocidade de voo")
p(r"\bswimming speed\b", "velocidade de natação")
p(r"\bclimbing speed\b", "velocidade de escalada")
p(r"\bwalking speed\b", "velocidade de caminhada")
p(r"\bburrow(?:ing)? speed\b", "velocidade de escavação")
p(r"\bspeed\b", "velocidade")
p(r"\bfly\b", "voar")
p(r"\bflying\b", "voando")
p(r"\bswim(?:ming)?\b", "nadar")
p(r"\bburrow(?:ing)?\b", "escavar")

# Magic and spells
p(r"\ba truque\b", "um truque")
p(r"\bcantrip\b", "truque")
p(r"\bcantrips\b", "truques")
p(r"\bspellcaster\b", "conjurador")
p(r"\bspellcasting\b", "conjuração")
p(r"\bspell attack\b", "ataque de magia")
p(r"\bspell damage\b", "dano de magia")
p(r"\bspell effect\b", "efeito da magia")
p(r"\bspell\b", "magia")
p(r"\bspells\b", "magias")
p(r"\bmagic item\b", "item mágico")
p(r"\bmagic items\b", "itens mágicos")
p(r"\bmagic\b", "magia")
p(r"\bmagical\b", "mágico")

# Common verbs/actions
p(r"\byou choose\b", "você escolhe")
p(r"\bYou choose\b", "Você escolhe")
p(r"\bChoose\b", "Escolha")
p(r"\bchoose\b", "escolhe")
p(r"\byou can see\b", "você pode ver")
p(r"\bthat you can see\b", "que você possa ver")
p(r"\bcan see\b", "pode ver")
p(r"\byou must\b", "você deve")
p(r"\byou can\b", "você pode")
p(r"\bYou can\b", "Você pode")
p(r"\bYou must\b", "Você deve")
p(r"\bYou gain\b", "Você ganha")
p(r"\byou gain\b", "você ganha")
p(r"\bYou take\b", "Você sofre")
p(r"\byou take\b", "você sofre")
p(r"\bYou touch\b", "Você toca")
p(r"\byou touch\b", "você toca")
p(r"\byou create\b", "você cria")
p(r"\bYou create\b", "Você cria")
p(r"\byou summon\b", "você invoca")
p(r"\bYou summon\b", "Você invoca")
p(r"\bYou target\b", "Você mira")
p(r"\byou target\b", "você mira")
p(r"\bYou point\b", "Você aponta")
p(r"\byou point\b", "você aponta")
p(r"\bYou speak\b", "Você fala")
p(r"\byou speak\b", "você fala")
p(r"\bYou hurl\b", "Você lança")
p(r"\byou hurl\b", "você lança")
p(r"\bYou call\b", "Você chama")
p(r"\byou call\b", "você chama")
p(r"\bYou cause\b", "Você causa")
p(r"\byou cause\b", "você causa")
p(r"\bYou move\b", "Você se move")
p(r"\byou move\b", "você se move")
p(r"\byou see\b", "você vê")
p(r"\bYou see\b", "Você vê")
p(r"\bYou imbue\b", "Você imbuí")
p(r"\byou imbue\b", "você imbuí")
p(r"\bYou learn\b", "Você aprende")
p(r"\byou learn\b", "você aprende")
p(r"\bYou attempt\b", "Você tenta")
p(r"\byou attempt\b", "você tenta")
p(r"\bYou enter\b", "Você entra")
p(r"\byou enter\b", "você entra")
p(r"\byou have\b", "você tem")
p(r"\bYou have\b", "Você tem")
p(r"\byou make\b", "você faz")
p(r"\bYou make\b", "Você faz")
p(r"\bYou become\b", "Você se torna")
p(r"\byou become\b", "você se torna")
p(r"\bYou know\b", "Você sabe")
p(r"\byou know\b", "você sabe")
p(r"\bYou deal\b", "Você causa")
p(r"\byou deal\b", "você causa")
p(r"\bYou use\b", "Você usa")
p(r"\byou use\b", "você usa")
p(r"\bYou are\b", "Você está")
p(r"\byou are\b", "você está")
p(r"\bis reduced to 0 hit points\b", "é reduzido a 0 pontos de vida")
p(r"\bdrop(?:s)? to 0 hit points\b", "cai para 0 pontos de vida")
p(r"\bfall(?:s)? unconscious\b", "fica inconsciente")
p(r"\bbecomes? unconscious\b", "fica inconsciente")
p(r"\bdies?\b", "morre")
p(r"\bdead\b", "morto")
p(r"\bdeath\b", "morte")
p(r"\bdie\b", "morrer")
p(r"\binstantly killed\b", "morto instantaneamente")
p(r"\bkill(?:ed)?\b", "matar")
p(r"\bknocked? prone\b", "jogado no chão")
p(r"\bpush(?:ed)?\b", "empurrá")
p(r"\bknock(?:ed)?\b", "derrubar")

# Dice rolls and numbers
p(r"\brolling? (\d+d\d+)\b", lambda m: f"rolando {m.group(1)}")

# Common structures
p(r"\bIn addition\b", "Além disso")
p(r"\bin addition\b", "além disso")
p(r"\bFor example\b", "Por exemplo")
p(r"\bfor example\b", "por exemplo")
p(r"\bFor instance\b", "Por exemplo")
p(r"\bfor instance\b", "por exemplo")
p(r"\bHowever\b", "No entanto")
p(r"\bhowever\b", "no entanto")
p(r"\bFurthermore\b", "Além disso")
p(r"\bfurthermore\b", "além disso")
p(r"\bMoreover\b", "Além disso")
p(r"\bmoreover\b", "além disso")
p(r"\bOtherwise\b", "Caso contrário")
p(r"\botherwise\b", "caso contrário")
p(r"\bInstead\b", "Em vez disso")
p(r"\binstead\b", "em vez disso")
p(r"\bFor instance\b", "Por exemplo")
p(r"\bfor instance\b", "por exemplo")
p(r"\bAs a result\b", "Como resultado")
p(r"\bas a result\b", "como resultado")
p(r"\bTherefore\b", "Portanto")
p(r"\btherefore\b", "portanto")
p(r"\bIn other words\b", "Em outras palavras")
p(r"\bin other words\b", "em outras palavras")
p(r"\bas long as\b", "enquanto")
p(r"\bas well\b", "também")
p(r"\bif any\b", "se houver")
p(r"\bif not\b", "se não")

# Damage phrases
p(r"\btakes? (\d+d?\d*) (\w+) damage\b",
  lambda m: f"sofre {m.group(1)} {_damage_pt(m.group(2))} dano")
p(r"\bdeal(?:ing|s)? (\d+d?\d*) (\w+) damage\b",
  lambda m: f"causar {m.group(1)} {_damage_pt(m.group(2))} dano")
p(r"\bdeals? damage\b", "causa dano")
p(r"\btakes? damage\b", "sofre dano")
p(r"\bdamage roll\b", "rolagem de dano")
p(r"\bdamage\b", "dano")
p(r"\bhalves? the damage\b", "reduz o dano à metade")
p(r"\bhalf (?:as much )?damage\b", "metade do dano")
p(r"\bno damage\b", "nenhum dano")
p(r"\bfull damage\b", "dano total")
p(r"\bthe damage increases? by\b", "o dano aumenta em")
p(r"\bincreases? the damage by\b", "aumenta o dano em")

# Resistance / immunity
p(r"\bresistance to\b", "resistência a")
p(r"\bimmunity to\b", "imunidade a")
p(r"\bvulnerability to\b", "vulnerabilidade a")
p(r"\bimmune to\b", "imune a")
p(r"\bresistant to\b", "resistente a")

# Advantage / disadvantage
p(r"\bhas advantage on\b", "tem vantagem em")
p(r"\bhave advantage on\b", "têm vantagem em")
p(r"\bgain advantage on\b", "ganha vantagem em")
p(r"\bgives? advantage\b", "concede vantagem")
p(r"\badvantage on attack rolls\b", "vantagem em rolagens de ataque")
p(r"\badvantage on saving throws\b", "vantagem em testes de resistência")
p(r"\badvantage\b", "vantagem")
p(r"\bhas disadvantage on\b", "tem desvantagem em")
p(r"\bhave disadvantage on\b", "têm desvantagem em")
p(r"\bgain disadvantage on\b", "ganha desvantagem em")
p(r"\bgives? disadvantage\b", "concede desvantagem")
p(r"\bdisadvantage on attack rolls\b", "desvantagem em rolagens de ataque")
p(r"\bdisadvantage on saving throws\b", "desvantagem em testes de resistência")
p(r"\bdisadvantage\b", "desvantagem")

# Areas / shapes
p(r"\ba (\d+)-meter radius\b", lambda m: f"um raio de {m.group(1)} metros")
p(r"\bline\b", "linha")
p(r"\bcone\b", "cone")
p(r"\bcube\b", "cubo")
p(r"\bsphere\b", "esfera")
p(r"\bcylinder\b", "cilindro")
p(r"\bwall\b", "parede")
p(r"\barea\b", "área")
p(r"\bradius\b", "raio")
p(r"\bsquare\b", "quadrado")
p(r"\bpoint of origin\b", "ponto de origem")
p(r"\ba point you choose\b", "um ponto que você escolha")
p(r"\ba point that you choose\b", "um ponto que você escolha")
p(r"\bwithin (\d+) metros? of\b", lambda m: f"a até {m.group(1)} metros de")

# Terrain / environment
p(r"\bunoccupied space\b", "espaço desocupado")
p(r"\bunoccupied spaces?\b", "espaços desocupados")
p(r"\bsolid ground\b", "chão sólido")
p(r"\bopen space\b", "espaço aberto")
p(r"\bopen air\b", "ar livre")
p(r"\bdim light\b", "luz fraca")
p(r"\bbright light\b", "luz intensa")
p(r"\bdarkness\b", "escuridão")
p(r"\bsunlight\b", "luz solar")
p(r"\bnatural terrain\b", "terreno natural")
p(r"\bdifficult terrain\b", "terreno difícil")
p(r"\bnonmagical\b", "não mágico")
p(r"\bnonmagically\b", "de maneira não mágica")
p(r"\bnatural\b", "natural")

# Objects / items
p(r"\bweapons?\b", "arma")
p(r"\bshield\b", "escudo")
p(r"\barmor\b", "armadura")
p(r"\bmedium armor\b", "armadura média")
p(r"\bheavy armor\b", "armadura pesada")
p(r"\blight armor\b", "armadura leve")
p(r"\bcomponent(?:s)?\b", "componente")
p(r"\bverbal component\b", "componente verbal")
p(r"\bsomatic component\b", "componente somático")
p(r"\bmaterial component\b", "componente material")
p(r"\bfocus\b", "foco")
p(r"\barcane focus\b", "foco arcano")
p(r"\bdruidic focus\b", "foco druídico")
p(r"\bholy symbol\b", "símbolo sagrado")
p(r"\bscroll\b", "pergaminho")
p(r"\bpotions?\b", "poção")
p(r"\bgem(?:s|stone)?\b", "gema")
p(r"\bcrystal\b", "cristal")
p(r"\brod\b", "bastão")
p(r"\bstaff\b", "cajado")
p(r"\bwand\b", "varinha")
p(r"\bring\b", "anel")
p(r"\bamulet\b", "amuleto")
p(r"\bcloak\b", "capa")
p(r"\bboots?\b", "botas")
p(r"\bgloves?\b", "luvas")
p(r"\bhelmet\b", "elmo")
p(r"\bsword\b", "espada")
p(r"\bdagger\b", "adaga")
p(r"\bbow\b", "arco")
p(r"\barrow\b", "flecha")
p(r"\bsling\b", "funda")
p(r"\bcrossbow\b", "besta")
p(r"\bjavelin\b", "azagaia")
p(r"\bspear\b", "lança")
p(r"\bclub\b", "clava")
p(r"\bmace\b", "maça")
p(r"\baxe\b", "machado")
p(r"\bhammer\b", "martelo")
p(r"\bflail\b", "mangual")
p(r"\bwhip\b", "chicote")

# Sight / perception
p(r"\bline of sight\b", "linha de visão")
p(r"\bclearly visible\b", "claramente visível")
p(r"\bcan be seen\b", "pode ser visto")
p(r"\bcannot be seen\b", "não pode ser visto")
p(r"\bcan't be seen\b", "não pode ser visto")
p(r"\binvisibility\b", "invisibilidade")
p(r"\bsee through\b", "ver através de")

# Spellcasting stats
p(r"\bspellcasting ability\b", "habilidade de conjuração")
p(r"\bspell attack bonus\b", "bônus de ataque de magia")
p(r"\bsave DC\b", "CD do teste")
p(r"\bproficiency\b", "proficiência")

# Class names
p(r"\bArtificer\b", "Artificeiro")
p(r"\bBard\b", "Bardo")
p(r"\bCleric\b", "Clérigo")
p(r"\bDruid\b", "Druida")
p(r"\bFighter\b", "Guerreiro")
p(r"\bMonk\b", "Monge")
p(r"\bPaladin\b", "Paladino")
p(r"\bRanger\b", "Patrulheiro")
p(r"\bRogue\b", "Ladino")
p(r"\bSorcerer\b", "Feiticeiro")
p(r"\bWarlock\b", "Bruxo")
p(r"\bWizard\b", "Mago")

# Misc game terms
p(r"\binitiative\b", "iniciativa")
p(r"\bsurprised?\b", "surpreendido")
p(r"\bsurprise\b", "surpresa")
p(r"\bexhausted\b", "exausto")
p(r"\bincapacitate\b", "incapacitar")
p(r"\bpetrify\b", "petrificar")
p(r"\bgrapple\b", "agarrar")
p(r"\bgrappling\b", "agarrando")
p(r"\bshove\b", "empurrar")
p(r"\bshoving\b", "empurrando")
p(r"\bdisarm\b", "desarmar")
p(r"\btrip\b", "derrubar")
p(r"\bstabilize(?:d)?\b", "estabilizar")
p(r"\bstabilization\b", "estabilização")
p(r"\bdying\b", "morrendo")
p(r"\bdeath saving throw\b", "teste de resistência contra a morte")
p(r"\bdeath saves\b", "testes de morte")
p(r"\bextra attack\b", "ataque extra")
p(r"\bbonus damage\b", "dano bônus")
p(r"\bspell scroll\b", "pergaminho de magia")
p(r"\bdivination\b", "adivinhação")
p(r"\billusion\b", "ilusão")
p(r"\bconjuration\b", "conjuração")
p(r"\btransmutation\b", "transmutação")
p(r"\bevocation\b", "evocação")
p(r"\bechantment\b", "encantamento")
p(r"\benchantment\b", "encantamento")
p(r"\babjuration\b", "abjuração")
p(r"\bnecromancy\b", "necromancia")
p(r"\bcharm\b", "enfeitiçar")
p(r"\bdominate\b", "dominar")
p(r"\bfear\b", "medo")
p(r"\bsilence\b", "silêncio")
p(r"\bdarkness\b", "escuridão")
p(r"\bwebbing\b", "teia")
p(r"\bweb\b", "teia")

# Common words
p(r"\bcreature(?:s)?\b", "criatura")
p(r"\btarget(?:s)?\b", "alvo")
p(r"\bally\b", "aliado")
p(r"\ballies\b", "aliados")
p(r"\benemy\b", "inimigo")
p(r"\benemies\b", "inimigos")
p(r"\bfoes?\b", "inimigo")
p(r"\bsurface\b", "superfície")
p(r"\bobject(?:s)?\b", "objeto")
p(r"\bitem(?:s)?\b", "item")
p(r"\bbody\b", "corpo")
p(r"\bcorpse(?:s)?\b", "cadáver")
p(r"\bshadow(?:s)?\b", "sombra")
p(r"\bsoul(?:s)?\b", "alma")
p(r"\bspirit(?:s)?\b", "espírito")
p(r"\bplane(?:s)?\b", "plano")
p(r"\bportal\b", "portal")
p(r"\bgate\b", "portal")
p(r"\bteleport(?:ation)?\b", "teletransporte")
p(r"\bteleport\b", "teletransportar")
p(r"\bsummon(?:ed|s|ing)?\b", "invocar")
p(r"\bdispel(?:led|s|ling)?\b", "dissipar")
p(r"\bdetect(?:s|ed|ing)?\b", "detectar")
p(r"\bdisintegrate\b", "desintegrar")
p(r"\bexplode\b", "explodir")
p(r"\bexplosion\b", "explosão")
p(r"\bextinguish\b", "extinguir")
p(r"\bignite\b", "incendiar")
p(r"\bsuppressed\b", "suprimido")
p(r"\bsuppressed\b", "suprimido")
p(r"\bshimmering\b", "cintilante")
p(r"\bglowing\b", "brilhante")
p(r"\bflaming\b", "flamejante")
p(r"\bfreezing\b", "congelante")
p(r"\bburning\b", "ardente")
p(r"\belectrified\b", "eletrificado")
p(r"\bpoisonous\b", "venenoso")
p(r"\btoxic\b", "tóxico")

# Range values
p(r"\bTouch\b", "Toque")
p(r"\bSelf\b", "Pessoal")
p(r"\bSight\b", "Vista")
p(r"\bUnlimited\b", "Ilimitado")
p(r"\bSpecial\b", "Especial")

# ─────────────────────────────────────────────
# Helper dictionaries for callables
# ─────────────────────────────────────────────

ABILITY_MAP = {
    "strength": "Força",
    "dexterity": "Destreza",
    "constitution": "Constituição",
    "intelligence": "Inteligência",
    "wisdom": "Sabedoria",
    "charisma": "Carisma",
    "str": "Força",
    "dex": "Destreza",
    "con": "Constituição",
    "int": "Inteligência",
    "wis": "Sabedoria",
    "cha": "Carisma",
}

DAMAGE_TYPE_MAP = {
    "acid": "de ácido",
    "bludgeoning": "de concussão",
    "cold": "de frio",
    "fire": "de fogo",
    "force": "de força",
    "lightning": "de relâmpago",
    "necrotic": "necrótico",
    "piercing": "perfurante",
    "poison": "de veneno",
    "psychic": "psíquico",
    "radiant": "radiante",
    "slashing": "cortante",
    "thunder": "de trovão",
}

def _ability_pt(name):
    return ABILITY_MAP.get(name.lower(), name)

def _damage_pt(name):
    return DAMAGE_TYPE_MAP.get(name.lower(), name)


# ─────────────────────────────────────────────
# Compile patterns
# ─────────────────────────────────────────────

COMPILED = []
for pat, repl, flags in PATTERNS:
    try:
        COMPILED.append((re.compile(pat, flags), repl))
    except re.error as e:
        print(f"WARNING: bad pattern {pat!r}: {e}")


def translate(text: str) -> str:
    if not text:
        return text
    for regex, repl in COMPILED:
        try:
            if callable(repl):
                text = regex.sub(repl, text)
            else:
                text = regex.sub(repl, text)
        except Exception as e:
            print(f"WARNING: substitution error with pattern {regex.pattern!r}: {e}")
    return text


# ─────────────────────────────────────────────
# Range field special handling
# ─────────────────────────────────────────────

RANGE_MAP = {
    r"^Touch$": "Toque",
    r"^Self$": "Pessoal",
    r"^Sight$": "Vista",
    r"^Unlimited$": "Ilimitado",
    r"^Special$": "Especial",
    r"^(\d+)\s*[Ff]eet?$": lambda m: f"{round(int(m.group(1)) / 5) * 1.5:.1f} metros".replace(".0 metros", " metros"),
    r"^(\d+)\s*[Mm]iles?$": lambda m: f"{round(int(m.group(1)) * 1.609)} km",
    r"^Self \((\d+)-foot(?:-radius)? (\w+)\)$":
        lambda m: f"Pessoal (raio de {round(int(m.group(1)) / 5) * 1.5:.1f} metros, {_shape_pt(m.group(2))})".replace(".0 metros", " metros"),
    r"^Self \((\d+)-foot (\w+)\)$":
        lambda m: f"Pessoal ({round(int(m.group(1)) / 5) * 1.5:.1f} metros, {_shape_pt(m.group(2))})".replace(".0 metros", " metros"),
}

SHAPE_MAP = {
    "cone": "cone",
    "sphere": "esfera",
    "cube": "cubo",
    "line": "linha",
    "cylinder": "cilindro",
    "radius": "raio",
}

def _shape_pt(name):
    return SHAPE_MAP.get(name.lower(), name)

COMPILED_RANGE = [(re.compile(pat, re.IGNORECASE), repl) for pat, repl in RANGE_MAP.items()]

def translate_range(text: str) -> str:
    if not text:
        return text
    stripped = text.strip()
    for regex, repl in COMPILED_RANGE:
        m = regex.fullmatch(stripped)
        if m:
            if callable(repl):
                return repl(m)
            return repl
    # Fall back to general translate
    return translate(text)


# ─────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────

def main():
    base = "/Users/fsrezende/Documents/algorithm/dd-5e"
    en_path = os.path.join(base, "data/open5e/spells.json")
    pt_path = os.path.join(base, "data/open5e/spells-pt.json")

    print("Loading files...")
    with open(en_path, "r", encoding="utf-8") as f:
        spells_en = json.load(f)
    with open(pt_path, "r", encoding="utf-8") as f:
        spells_pt = json.load(f)

    # Build EN lookup by slug
    en_by_slug = {s["slug"]: s for s in spells_en}

    # Identify SRD slugs
    srd_slugs = {s["slug"] for s in spells_en if s.get("document__slug") == "wotc-srd"}
    print(f"SRD spells found in EN: {len(srd_slugs)}")

    updated = 0
    for spell in spells_pt:
        if spell.get("slug") not in srd_slugs:
            continue
        en = en_by_slug.get(spell["slug"])
        if not en:
            continue

        # Translate from the English original
        spell["desc"] = translate(en.get("desc", ""))
        spell["higher_level"] = translate(en.get("higher_level", ""))
        spell["material"] = translate(en.get("material", ""))
        spell["range"] = translate_range(en.get("range", ""))
        updated += 1

    print(f"Updated {updated} SRD spells.")

    # Write back
    with open(pt_path, "w", encoding="utf-8") as f:
        json.dump(spells_pt, f, ensure_ascii=False, indent=2)
    print(f"Saved {pt_path}")

    # Print sample translations
    print("\n── Sample Translations ──")
    samples = ["acid-splash", "acid-arrow", "aid", "alarm", "animal-friendship",
               "animate-dead", "antimagic-field", "arcane-eye", "arcane-lock",
               "astral-projection", "augury", "awaken"]
    for slug in samples:
        for spell in spells_pt:
            if spell["slug"] == slug and slug in srd_slugs:
                print(f"\n[{slug}]")
                print(f"  desc: {spell['desc'][:200]}")
                if spell.get("higher_level"):
                    print(f"  higher_level: {spell['higher_level'][:150]}")
                if spell.get("range"):
                    print(f"  range: {spell['range']}")
                if spell.get("material"):
                    print(f"  material: {spell['material'][:100]}")
                break

if __name__ == "__main__":
    main()
