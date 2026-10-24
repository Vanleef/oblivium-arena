const orderedTypes = ["essence", "cinza", "ruptura", "graca", "coringa"];

export const archetypeCatalog = {
  status: { name: "Especialista em Aflições", icon: "☣", context: "Aplica e prolonga condições para que a equipe converta desgaste em pressão." },
  sustain: { name: "Sustentador", icon: "♥", context: "Mantém o trio de pé com cura, limpeza e recuperação ligada ao próprio dano." },
  transformation: { name: "Metamorfo", icon: "◈", context: "Muda o papel de combate com uma forma, postura ou limiar que altera técnicas." },
  setup: { name: "Preparador de Marcas", icon: "◎", context: "Marca uma abertura e decide quando consumir, explorar ou espalhar a preparação." },
  berserker: { name: "Berserker", icon: "▼", context: "Troca segurança por força e ganha opções quando a Vida cai ou é sacrificada." },
  bulwark: { name: "Baluarte", icon: "⬡", context: "Cria Defesa e transforma a guarda em tempo para uma resposta própria ou do trio." },
  resourceControl: { name: "Manipulador de Essência", icon: "⇥", context: "Drena ou rouba Essência e transforma a reserva roubada numa decisão tática." },
  counter: { name: "Retaliador", icon: "↶", context: "Atrai, evita ou devolve uma resposta com bloqueio, reação ou contra-ataque." },
  control: { name: "Interditor", icon: "⊠", context: "Atordoa, sela ou enfraquece para abrir uma janela de ação segura." },
  burst: { name: "Executor", icon: "ϟ", context: "Concentra dano em uma janela preparada, em um alvo ferido ou numa reserva gasta." },
  area: { name: "Pressionador de Área", icon: "▦", context: "Altera o ritmo de toda a linha inimiga ou fortalece o trio em conjunto." },
  essenceGenerator: { name: "Gerador de Essência", icon: "⊕", context: "Cria Essência por ação, condição ou evento para alimentar as próximas técnicas do trio." },
  essenceConverter: { name: "Transmutador de Essência", icon: "⇄", context: "Troca um tipo de Essência por outro para adaptar a reserva à necessidade imediata." },
  essenceSpender: { name: "Gastador de Essência", icon: "◉", context: "Transforma o pagamento ou sacrifício de Essência em dano, proteção, controle ou preparação." },
  defenseBreak: { name: "Quebra-Guarda", icon: "⌖", context: "Remove Defesa ou converte as camadas do alvo em vantagem ofensiva." }
};

const variants = (ability) => [ability, ...(ability.forms || [])];
const list = (character) => character.abilities.slice(0, 3).flatMap(variants);
const count = (abilities, predicate) => abilities.filter(predicate).length;
const bodyArchetypeProfiles = {
  "the-end": { base: "transformation", forms: { tyrant: "berserker", predator: "burst", ruin: "control" } },
  "o-devorador": { base: "sustain", forms: { starved: "resourceControl" } },
  "a-mascara-dupla": { base: "setup", forms: { betrayal: "counter" } },
  "o-odio-encarnado": { base: "berserker", forms: { rage: "burst" } },
  "o-soberano-quebrado": { base: "setup", forms: { edict: "area" } },
  "a-brasa-eterna": { base: "status", forms: { smother: "burst" } },
  "o-eco-sem-dono": { base: "counter", forms: { stolen: "resourceControl" } },
  "a-sombra-inconstante": { base: "counter", forms: { shelter: "sustain" } },
  "a-pele-alheia": { base: "setup", forms: { skin: "burst", shell: "bulwark" } }
};

function rank(character) {
  const abilities = list(character), roots = character.abilities.slice(0, 3);
  const passiveEffect = character.passive?.effect || {};
  const has = (key) => count(abilities, (a) => Boolean(a[key]));
  const allEnemies = count(abilities, (a) => a.target === "all-enemies");
  const teamSupport = count(abilities, (a) => a.target === "team");
  const allyCare = count(abilities, (a) => ["ally", "team"].includes(a.target) && (a.heal || a.cleanse || a.regen));
  const marks = has("mark"), combos = has("combo");
  const formShifts = roots.filter((a) => a.formRule || a.shift?.some((x) => x.form !== "base")).length;
  const scores = {
    status: has("dot") * 4 + has("healingBlock") * 2 + Number(character.passive?.condition && ["bleed", "burn", "poison", "decay", "afflicted"].includes(character.passive.condition)) * 2,
    sustain: has("lifesteal") * 2 + (character.passive?.type === "leech" ? 3 : 0) + count(abilities, (a) => a.target === "self" && (a.heal || a.regen)),
    transformation: (character.bodyForms?.length || 0) * 5 + formShifts * 2 + Number(/forma|postura|transform|metamorf/i.test(character.mechanic || "")) * 2,
    setup: marks * 2 + combos * 2 + has("requiredMark") * 3,
    berserker: Number(character.passive?.type === "comeback") * 5 + has("missingHpDamage") * 3 + has("selfDamage") * 2,
    bulwark: has("shield") * 2.5 + has("reduce") * 3 + has("shieldToDamage") * 3 + has("shieldFromStripped") * 4,
    drain: has("drain") * 6 + has("sealAttack") * 2 + has("sealSupport") * 2 + Number(Boolean(passiveEffect.drainEssence)) * 5,
    counter: has("counter") * 3 + has("reactive") * 2 + Number(character.passive?.type === "retaliate") * 3,
    healer: has("heal") + has("cleanse") * 1.5 + has("regen") + allyCare + Number(character.passive?.type === "support"),
    control: has("stun") * 4 + has("sealAttack") * 3 + has("sealSupport") * 3 + has("weaken") * 2 + has("expose"),
    burst: count(abilities, (a) => a.damage >= 25) * 3.5 + has("perChargeDamage") * 2 + has("missingHpDamage") * 2 + has("executeBonus") * 2,
    stealth: has("ignoreCounters") * 3 + count(abilities, (a) => a.evasion || a.hidden) * 4 + Number(/evas|sombra|ausência|infiltr/i.test(character.role || "")) * 2,
    area: allEnemies * 5 + teamSupport * 3,
    generator: has("generateEssence") * 5 + Number(Boolean(passiveEffect.generateEssence)) * 5,
    theft: has("steal") * 5 + Number(Boolean(passiveEffect.stealEssence)) * 5,
    spender: Number(character.passive?.trigger === "essenceSpent") * 4 + Number(Boolean(passiveEffect.spendEssence)) * 4 + has("spendEssence") * 4,
    converter: has("convertEssence") * 6 + Number(Boolean(passiveEffect.convertEssence)) * 6,
    defenseBreak: has("stripShield") * 4 + has("purge") * 3 + has("shieldToDamage") * 3
  };
  return { abilities, scores, marks, combos, allEnemies, teamSupport, allyCare, formShifts };
}

function affinityFor(character, info) {
  const a = info.abilities, scores = { essence: 0, cinza: 0, ruptura: 0, graca: 0, coringa: 0 };
  const effects = character.passive?.effect || {};
  scores.essence += info.marks * 2 + info.combos + count(a, (x) => x.stun || x.weaken || x.sealAttack || x.sealSupport) * 1.2;
  scores.cinza += hasDot(a) * 3 + count(a, (x) => x.drain) * 6 + count(a, (x) => x.healingBlock || x.dot?.tag === "decadencia") * 2;
  scores.ruptura += count(a, (x) => x.damage >= 20 || x.damageType === "piercing") * 2 + count(a, (x) => x.selfDamage || x.missingHpDamage) * 2;
  scores.graca += count(a, (x) => x.heal || x.cleanse || x.regen || x.shield || x.reduce) * 2 + info.allyCare * 2;
  scores.coringa += info.formShifts * 2 + (character.bodyForms?.length || 0) * 3 + count(a, (x) => x.gainCharge || x.spendCharge || x.steal || x.convertEssence || x.generateEssence);
  const generated = effects.generateEssence?.resource;
  const converted = effects.convertEssence?.to;
  const spent = effects.spendEssence?.resource;
  if (scores[generated] !== undefined) scores[generated] += 4;
  if (scores[converted] !== undefined) scores[converted] += 3;
  if (scores[spent] !== undefined) scores[spent] += 2;
  const max = Math.max(...Object.values(scores));
  const tied = orderedTypes.filter((id) => scores[id] === max);
  if (tied.length === 1) return tied[0];
  // Kit features decide the affinity; this stable Elo/name rotation only resolves exact ties.
  const seed = `${character.eloId}:${character.id}`;
  const hash = [...seed].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7);
  return tied[hash % tied.length];
}

function hasDot(abilities) { return count(abilities, (a) => Boolean(a.dot)); }

export function assignCharacterArchetypes(character) {
  const info = rank(character);
  const alias={healer:'sustain',drain:'resourceControl',theft:'resourceControl',stealth:'counter',generator:'essenceGenerator',converter:'essenceConverter',spender:'essenceSpender'};
  const grouped={};
  for(const [id,score] of Object.entries(info.scores)){
    const key=alias[id]||id;
    if(archetypeCatalog[key])grouped[key]=(grouped[key]||0)+score;
  }
  const ranked = Object.entries(grouped).filter(([, score]) => score > 0).sort((a, b) => b[1] - a[1]);
  const basePrimary = ranked.find(([id])=>id!=="transformation")?.[0] || (character.bodyForms?.length ? "transformation" : "setup");
  const profile = bodyArchetypeProfiles[character.id];
  const primary = archetypeCatalog[profile?.base] ? profile.base : basePrimary;
  const tagThreshold = { burst: 6 };
  const selected = ranked.filter(([id,score])=>id!==primary&&score>=(tagThreshold[id]||3)).map(([id])=>id).slice(0,4);
  if(grouped.counter>=3&&!selected.includes('counter')){
    if(selected.length>=4)selected[3]='counter';
    else selected.push('counter');
  }
  const archetypes = [...new Set([primary,...selected])];
  const affinity = affinityFor(character, info);
  const bodyForms = (character.bodyForms || []).map((form) => ({
    ...form,
    archetype: profile?.forms?.[form.key] || primary,
    resource: form.key === "starved" ? "cinza"
      : form.key === "betrayal" ? "coringa"
      : form.key === "rage" ? "ruptura"
      : form.key === "shelter" ? "graca"
      : form.key === "skin" ? "ruptura"
      : form.key === "shell" ? "graca"
      : form.key === "edict" ? "essence"
      : form.key === "smother" ? "ruptura"
      : form.key === "stolen" ? "coringa"
      : form.resource || affinity
  }));
  return {
    ...character,
    affinity,
    archetype: primary,
    archetypes,
    archetypeDetails: archetypes.map(id=>({id,...archetypeCatalog[id]})),
    baseArchetype: primary,
    baseArchetypes: archetypes,
    baseArchetypeDetails: archetypes.map(id=>({id,...archetypeCatalog[id]})),
    archetypeName: archetypeCatalog[primary].name,
    archetypeIcon: archetypeCatalog[primary].icon,
    archetypeContext: archetypeCatalog[primary].context,
    archetypeVariant: character.mechanic || character.role,
    bodyForms
  };
}

export function applyArchetypeForm(character, archetypeId) {
  const id = archetypeCatalog[archetypeId] ? archetypeId : character.baseArchetype || character.archetype || "setup";
  const rest = (character.baseArchetypes || character.archetypes || []).filter(tag => tag !== id);
  const archetypes = [...new Set([id, ...rest])].slice(0, 5);
  const archetypeDetails = archetypes.map(tag => ({ id: tag, ...archetypeCatalog[tag] }));
  return {
    ...character,
    archetype: id,
    archetypes,
    archetypeDetails,
    archetypeName: archetypeCatalog[id].name,
    archetypeIcon: archetypeCatalog[id].icon,
    archetypeContext: archetypeCatalog[id].context
  };
}

export function affinityForTeam(ids, roster) {
  const characters = ids.map((id) => roster[id]).filter(Boolean);
  const counts = new Map();
  for (const character of characters) counts.set(character.affinity, (counts.get(character.affinity) || 0) + 1);
  return characters.map((character) => character.affinity).sort((a, b) => counts.get(b) - counts.get(a))[0] || "essence";
}
