import { esc } from "./view-utils.js";
import { getAbilityResourceCosts } from "./resource-costs.js";
import { resourceById } from "./data.js";
import { getLanguage, localizeText } from "./i18n.js";

const damageTypeNames = { physical: "físico", energy: "espiritual", piercing: "perfurante", affliction: "de aflição" };
const statusNames = { sangramento: "Sangramento", queimadura: "Queimadura", veneno: "Veneno", decadencia: "Decadência" };
const resourceNamesEn = { essence: "Aether", cinza: "Ash", ruptura: "Rupture", graca: "Grace", random: "Wildcard" };
const resourceNamesPt = { essence: "Éter", cinza: "Cinza", ruptura: "Ruptura", graca: "Graça", random: "Coringa" };
const conditionNames = {
  bleed: "alvo com Sangramento", burn: "alvo com Queimadura", poison: "alvo com Veneno", decay: "alvo com Decadência",
  afflicted: "alvo com uma aflição", exposed: "alvo Exposto", stunned: "alvo Atordoado", weakened: "alvo Enfraquecido",
  marked: "alvo com sua Marca", wounded: "alvo com até 50% de Vida", selfWounded: "usuário com até 50% de Vida",
  shielded: "alvo com Defesa", selfShielded: "usuário com Defesa"
};
const glossaryTerms = [
  { pt: ["Invulnerável", "Invulnerabilidade"], en: ["Invulnerable", "Invulnerability"], ptTip: "Novas habilidades inimigas não podem escolher este personagem enquanto durar. Efeitos já aplicados, incluindo aflições, continuam.", enTip: "New enemy abilities cannot choose this character while this lasts. Effects already applied, including afflictions, continue." },
  { pt: ["Aflição", "Aflições"], en: ["Affliction", "Afflictions"], ptTip: "Dano persistente que ignora Defesa. Cada aflição também pode aplicar uma condição própria.", enTip: "Persistent damage that ignores Defense. Each affliction can also apply its own condition." },
  { pt: ["Sangramento"], en: ["Bleed"], ptTip: "Aflição que causa o dano indicado a cada turno; ignora Defesa.", enTip: "Affliction that deals the listed damage each turn; it ignores Defense." },
  { pt: ["Queimadura"], en: ["Burn"], ptTip: "Aflição que causa o dano indicado a cada turno; ignora Defesa.", enTip: "Affliction that deals the listed damage each turn; it ignores Defense." },
  { pt: ["Veneno"], en: ["Poison"], ptTip: "Aflição que causa o dano indicado a cada turno; ignora Defesa.", enTip: "Affliction that deals the listed damage each turn; it ignores Defense." },
  { pt: ["Decadência"], en: ["Decay"], ptTip: "Aflição que causa o dano indicado a cada turno; ignora Defesa.", enTip: "Affliction that deals the listed damage each turn; it ignores Defense." },
  { pt: ["Atordoado", "Atordoamento", "Atordoa"], en: ["Stunned", "Stun"], ptTip: "Impede o personagem de usar uma habilidade pelo turno indicado.", enTip: "Prevents the character from using an ability for the listed turn." },
  { pt: ["Enfraquecido", "Enfraquecimento", "Enfraquece"], en: ["Weakened", "Weaken"], ptTip: "O personagem causa 10 de dano a menos enquanto o efeito durar.", enTip: "The character deals 10 less damage while this effect lasts." },
  { pt: ["Exposto", "Exposta", "Expõe"], en: ["Exposed", "Expose"], ptTip: "Recebe 10 de dano físico, espiritual ou perfurante a mais. Dano de aflição não recebe esse bônus.", enTip: "Takes 10 more physical, spiritual, or piercing damage. Affliction damage does not get this bonus." },
  { pt: ["dano de aflição", "dano de aflições"], en: ["affliction damage"], ptTip: "Dano persistente que ignora Defesa.", enTip: "Persistent damage that ignores Defense." },
  { pt: ["dano perfurante"], en: ["piercing damage"], ptTip: "Ignora reduções de dano, mas é absorvido por Defesa.", enTip: "Ignores damage reduction, but is absorbed by Defense." },
  { pt: ["dano espiritual"], en: ["spiritual damage"], ptTip: "Dano absorvido por Defesa; pode interagir com efeitos que distinguem tipos de dano.", enTip: "Damage absorbed by Defense; it can interact with effects that distinguish damage types." },
  { pt: ["dano físico"], en: ["physical damage"], ptTip: "Dano absorvido por Defesa e afetado por reduções físicas.", enTip: "Damage absorbed by Defense and affected by physical damage reduction." },
  { pt: ["físico", "física"], en: ["physical"], ptTip: "Tipo de dano absorvido por Defesa e afetado por reduções físicas.", enTip: "Damage type absorbed by Defense and affected by physical damage reduction." },
  { pt: ["espiritual"], en: ["spiritual"], ptTip: "Tipo de dano absorvido por Defesa e reconhecido por efeitos espirituais.", enTip: "Damage type absorbed by Defense and recognized by spiritual effects." },
  { pt: ["perfurante"], en: ["piercing"], ptTip: "Tipo de dano que ignora reduções, mas é absorvido por Defesa.", enTip: "Damage type that ignores reduction, but is absorbed by Defense." },
  { pt: ["Afinidade"], en: ["Affinity"], ptTip: "Tipo principal de Essência do personagem. Custos de afinidade usam esse tipo ou o recurso da Forma ativa.", enTip: "The character's primary Essence type. Affinity costs use this type or the resource of the active Form." },
  { pt: ["Coringa"], en: ["Wildcard"], ptTip: "Unidade de custo flexível: pode ser paga com qualquer tipo de Essência.", enTip: "Flexible cost: it can be paid with any type of Essence." },
  { pt: ["Defesa"], en: ["Defense"], ptTip: "Camada destrutível que absorve dano antes da Vida. Dano de aflição a ignora.", enTip: "A destructible layer that absorbs damage before Health. Affliction damage ignores it." },
  { pt: ["Marca Infernal"], en: ["Infernal Mark"], ptTip: "Marca própria de Nilo. Habilidades indicadas podem consumir ou explorar esse efeito.", enTip: "Nilo's personal Mark. Abilities marked for it can consume or exploit this effect." },
  { pt: ["Marca de Caça"], en: ["Hunt Mark"], ptTip: "Marca que prepara as habilidades indicadas contra o alvo marcado.", enTip: "A Mark that sets up the listed abilities against its target." },
  { pt: ["Marca", "marcado", "marcada"], en: ["Mark", "Marked"], ptTip: "Efeito aplicado a um alvo. Habilidades podem exigir, consumir ou reagir à Marca.", enTip: "An effect applied to a target. Abilities can require, consume, or react to the Mark." },
  { pt: ["Contra-ataque", "contra-atacar"], en: ["Counterattack"], ptTip: "Resposta preparada que anula a próxima habilidade válida e causa o dano indicado.", enTip: "A prepared response that negates the next valid ability and deals the listed damage." },
  { pt: ["Furtividade"], en: ["Stealth"], ptTip: "O personagem não pode ser escolhido como alvo de habilidades inimigas pela duração indicada.", enTip: "The character cannot be chosen as the target of enemy abilities for the listed duration." },
  { pt: ["Carga de Intervenção", "Cargas de Intervenção"], en: ["Intervention Charge", "Intervention Charges"], ptTip: "Recurso de Nilo gasto para anular a próxima habilidade inimiga dirigida a um Pilar.", enTip: "Nilo's resource, spent to negate the next enemy ability aimed at a Pillar." },
  { pt: ["Intervenção"], en: ["Intervention"], ptTip: "Resposta de Nilo que protege um Pilar de uma habilidade inimiga.", enTip: "Nilo's response that protects a Pillar from an enemy ability." },
  { pt: ["Pilar", "Pilares"], en: ["Pillar", "Pillars"], ptTip: "Aliado escolhido por Nilo para receber proteção e habilitar suas respostas de Intervenção.", enTip: "An ally chosen by Nilo to receive protection and enable his Intervention responses." },
  { pt: ["Resíduo", "Resíduos"], en: ["Residue"], ptTip: "Recurso de Nilo que certas habilidades podem gastar para fortalecer um efeito.", enTip: "Nilo's resource that specific abilities can spend to strengthen an effect." },
  { pt: ["Fratura", "Fraturas"], en: ["Fracture", "Fractures"], ptTip: "Contagem de status distintos no alvo, usada por técnicas específicas de Nilo.", enTip: "A count of distinct statuses on a target, used by specific Nilo abilities." },
  { pt: ["Ressonância"], en: ["Resonance"], ptTip: "Vínculo que permite a habilidades específicas compartilhar perda de Vida ou converter efeitos.", enTip: "A link that lets specific abilities share Health loss or convert effects." },
  { pt: ["Vínculo de Ressonância"], en: ["Resonance Link"], ptTip: "Vínculo de Nilo com um alvo: a perda de Vida de Nilo repercute nele como dano de aflição.", enTip: "Nilo's link to a target: his Health loss reverberates onto it as affliction damage." },
  { pt: ["Expansão de Cinza"], en: ["Ash Expansion"], ptTip: "Estado de Nilo que aumenta o dano e cobra Vida a cada habilidade ofensiva durante a duração.", enTip: "Nilo's state that increases damage and costs Health for each offensive ability during its duration." },
  { pt: ["Colapso"], en: ["Collapse"], ptTip: "Estado de Nilo que aumenta o dano e cobra Vida por habilidade de dano. O nível define os valores.", enTip: "Nilo's state that increases damage and costs Health per damage ability. The level sets the amounts." },
  { pt: ["Forma de Graça"], en: ["Grace Form"], ptTip: "Forma de Nilo que habilita técnicas de controle e resposta em torno dos Pilares.", enTip: "Nilo's Form that enables control and response abilities around his Pillars." },
  { pt: ["Forma"], en: ["Form"], ptTip: "Estado alternativo que pode trocar técnicas, retrato, custo ou efeitos do personagem.", enTip: "An alternate state that can change a character's abilities, portrait, cost, or effects." },
  { pt: ["Regeneração"], en: ["Regeneration"], ptTip: "Recupera a quantidade indicada de Vida no início de cada turno pela duração definida.", enTip: "Restores the listed amount of Health at the start of each turn for the stated duration." },
  { pt: ["Apoio", "técnicas de apoio", "técnica de apoio"], en: ["Support", "support abilities", "support ability"], ptTip: "Habilidade de cura, proteção ou preparação. Selar apoio ainda permite usar a defesa pessoal.", enTip: "Healing, protection, or setup ability. Sealing support still allows the personal defense." },
  { pt: ["Execução", "Executa", "Executar"], en: ["Execution", "Executes", "Execute"], ptTip: "Efeito que derrota o alvo ao cumprir a condição de Vida descrita pela habilidade.", enTip: "Effect that defeats the target when it meets the Health condition listed by the ability." }
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^$(){}|[\]\\]/g, "\\$&");
}

export function highlightKeywords(value = "") {
  const source = String(value ?? "");
  const english = getLanguage() === "en";
  const terms = [];
  for (const entry of glossaryTerms) {
    const words = english ? entry.en : entry.pt;
    const description = english ? entry.enTip : entry.ptTip;
    for (const word of words) terms.push({ word, description });
  }
  terms.sort((a, b) => b.word.length - a.word.length);
  const definitions = new Map(terms.map(({ word, description }) => [word.toLocaleLowerCase(), description]));
  const pattern = new RegExp("(^|[^\\p{L}\\p{N}_])(" + terms.map(term => escapeRegExp(term.word)).join("|") + ")(?=$|[^\\p{L}\\p{N}_])", "giu");
  let html = "";
  let cursor = 0;
  for (const match of source.matchAll(pattern)) {
    const [whole, prefix, term] = match;
    const start = match.index;
    const termStart = start + prefix.length;
    html += esc(source.slice(cursor, termStart));
    const description = definitions.get(term.toLocaleLowerCase()) || "";
    html += '<span class="combat-keyword" tabindex="0" title="' + esc(description) + '" aria-label="' + esc(term + ": " + description) + '">' + esc(term) + "</span>";
    cursor = termStart + term.length;
  }
  return html + esc(source.slice(cursor));
}
export function abilityQuickEffect(ability = {}) {
  if (getLanguage() === "en") return abilityQuickEffectEnglish(ability);
  if (ability.invulnerable) {
    const duration = `${ability.invulnerable} ${ability.invulnerable === 1 ? "turno" : "turnos"}`;
    const effects = [`Invulnerável · ${duration}`];
    if (ability.heal) effects.push(`cura ${ability.heal} Vida`);
    if (ability.shield) effects.push(`+${ability.shield} Defesa`);
    return effects.join(" · ");
  }
  if (ability.damage) {
    const type = damageTypeNames[ability.damageType] || "físico";
    const target = ability.target === "all-enemies" ? "em área" : type;
    const comboQualifier = ability.combo?.condition?.startsWith("mark:") ? "se marcado" : "quando a condição é atendida";
    const additions = [
      ability.dot && `${statusNames[ability.dot.tag] || "Aflição"} ${ability.dot.damage}/T`,
      ...(ability.dots||[]).map(dot=>`${statusNames[dot.tag]||"Aflição"} ${dot.damage}/T`),
      ability.stun && `Atordoa ${ability.stun}T`,
      ability.expose && "Expõe",
      ability.mark && "Marca",
      ability.gainCharge && `+${ability.gainCharge} carga`,
      ability.stripShield && `−${ability.stripShield} Defesa`,
      ability.spendCharge && ability.perChargeDamage && `+${ability.perChargeDamage}/carga consumida`,
      ability.missingHpDamage && `+${ability.missingHpDamage.amount} a cada ${ability.missingHpDamage.step} Vida perdida (máx. +${ability.missingHpDamage.cap})`,
      ability.combo?.bonusDamage && `+${ability.combo.bonusDamage} dano ${comboQualifier}`,
      ability.combo?.stun && `Atordoa ${ability.combo.stun}T ${comboQualifier}`,
      ability.weaken && `Enfraquece ${ability.weaken}T`,
      ability.sealSupport && `Sela apoio ${ability.sealSupport}T`
    ].filter(Boolean);
    return `${ability.damage} ${target}${additions.length ? ` · ${additions.join(" · ")}` : " de dano"}`;
  }
  if (ability.counter) return `Anula e devolve ${ability.counter}`;
  if (ability.generateEssence) {
    const resource = ability.generateEssence.resource || ability.generateEssence.type || ability.generateEssence.id;
    return `Gera ${ability.generateEssence.amount || 1} ${resourceById[resource]?.name || "Essência"}`;
  }
  if (ability.convertEssence) return "Converte Essência";
  if (ability.steal || ability.drain) return `${ability.steal ? "Rouba" : "Drena"} ${ability.steal || ability.drain} Essência`;
  if (ability.heal && ability.shield) return `Cura ${ability.heal} Vida · +${ability.shield} Defesa`;
  if (ability.heal) return `Cura ${ability.heal} Vida`;
  if (ability.shield) return `+${ability.shield} Defesa`;
  if (ability.boost) return `Prepara +${ability.boost} de dano para o próximo golpe`;
  if (ability.mark&&ability.reactive) return `Marca; reage com ${ability.reactive.damage||0} de aflição se o alvo agir`;
  if (ability.mark) return `Marca por ${ability.markTurns||3} turnos`;
  if (ability.activateAshExpansion) return `Ativa Expansão de Cinza · ${ability.activateAshExpansion} turnos`;
  if (ability.activateCollapse) return `Abre Colapso ${ability.activateCollapse}`;
  if (ability.closeCollapse) return "Encerra Colapso";
  if (ability.activateGraceForm) return `Ativa Forma de Graça · ${ability.activateGraceForm} turnos`;
  if (ability.setPillar) return `Cura ${ability.heal} · ergue Pilar`;
  if (ability.reduce) return `Reduz ${ability.reduce} dano`;
  if (ability.regen) return `Regenera ${ability.regen.heal} Vida`;
  if (ability.shift?.length || ability.forms?.length) return "Muda a técnica";
  if (ability.cleanse) return "Remove condições";
  if (ability.stun) return `Atordoa ${ability.stun}T`;
  if (ability.expose) return "Deixa Exposto";
  return "Prepara uma resposta";
}

const damageTypeNamesEn = { physical: "physical", energy: "spiritual", piercing: "piercing", affliction: "affliction" };
const statusNamesEn = { sangramento: "Bleed", queimadura: "Burn", veneno: "Poison", decadencia: "Decay" };

function abilityQuickEffectEnglish(ability = {}) {
  if (ability.invulnerable) {
    const duration = `${ability.invulnerable} ${ability.invulnerable === 1 ? "turn" : "turns"}`;
    const effects = [`Invulnerable · ${duration}`];
    if (ability.heal) effects.push(`restore ${ability.heal} Health`);
    if (ability.shield) effects.push(`+${ability.shield} Defense`);
    return effects.join(" · ");
  }
  if (ability.damage) {
    const type = damageTypeNamesEn[ability.damageType] || "physical";
    const target = ability.target === "all-enemies" ? "to all enemies" : "to an enemy";
    const comboQualifier = ability.combo?.condition?.startsWith("mark:") ? "if marked" : "when the condition is met";
    const additions = [
      ability.dot && `${statusNamesEn[ability.dot.tag] || "Affliction"} ${ability.dot.damage} affliction damage/turn`,
      ...(ability.dots||[]).map(dot=>`${statusNamesEn[dot.tag]||"Affliction"} ${dot.damage} affliction damage/turn`),
      ability.stun && `Stun · ${ability.stun} ${ability.stun === 1 ? "turn" : "turns"}`,
      ability.expose && "Expose",
      ability.mark && "Mark",
      ability.gainCharge && `Gain ${ability.gainCharge} charge${ability.gainCharge === 1 ? "" : "s"}`,
      ability.stripShield && `Remove ${ability.stripShield} Defense`,
      ability.spendCharge && ability.perChargeDamage && `+${ability.perChargeDamage} damage per charge spent`,
      ability.missingHpDamage && `+${ability.missingHpDamage.amount} per ${ability.missingHpDamage.step} Health lost (max +${ability.missingHpDamage.cap})`,
      ability.combo?.bonusDamage && `+${ability.combo.bonusDamage} damage ${comboQualifier}`,
      ability.combo?.stun && `Stun · ${ability.combo.stun} ${ability.combo.stun === 1 ? "turn" : "turns"} ${comboQualifier}`,
      ability.weaken && `Weaken · ${ability.weaken} ${ability.weaken === 1 ? "turn" : "turns"}`,
      ability.sealSupport && `Seal support · ${ability.sealSupport} ${ability.sealSupport === 1 ? "turn" : "turns"}`
    ].filter(Boolean);
    return `${ability.damage} ${type} damage ${target}${additions.length ? ` · ${additions.join(" · ")}` : ""}`;
  }
  if (ability.counter) return `Negate and return ${ability.counter} damage`;
  if (ability.generateEssence) {
    const resource = ability.generateEssence.resource || ability.generateEssence.type || ability.generateEssence.id;
    return `Generate ${ability.generateEssence.amount || 1} ${resourceNamesEn[resource] || "Essence"}`;
  }
  if (ability.convertEssence) return "Convert Essence";
  if (ability.steal || ability.drain) return `${ability.steal ? "Steal" : "Drain"} ${ability.steal || ability.drain} Essence`;
  if (ability.heal && ability.shield) return `Restore ${ability.heal} Health · +${ability.shield} Defense`;
  if (ability.heal) return `Restore ${ability.heal} Health`;
  if (ability.shield) return `+${ability.shield} Defense`;
  if (ability.boost) return `Prepare +${ability.boost} damage for your next strike`;
  if (ability.mark&&ability.reactive) return `Mark; triggers ${ability.reactive.damage||0} affliction damage if the target acts`;
  if (ability.mark) return `Mark for ${ability.markTurns||3} turns`;
  if (ability.activateAshExpansion) return `Activate Ash Expansion · ${ability.activateAshExpansion} turns`;
  if (ability.activateCollapse) return `Open Collapse ${ability.activateCollapse}`;
  if (ability.closeCollapse) return "End Collapse";
  if (ability.activateGraceForm) return `Activate Grace Form · ${ability.activateGraceForm} turns`;
  if (ability.setPillar) return `Restore ${ability.heal} · raise Pillar`;
  if (ability.reduce) return `Reduce damage by ${ability.reduce}`;
  if (ability.regen) return `Regenerate ${ability.regen.heal} Health`;
  if (ability.shift?.length || ability.forms?.length) return "Change technique";
  if (ability.cleanse) return "Remove harmful conditions";
  if (ability.stun) return `Stun · ${ability.stun} ${ability.stun === 1 ? "turn" : "turns"}`;
  if (ability.expose) return "Expose the target";
  return "Prepare a response";
}

export function abilityCostLabel(actor, ability) {
  const costs = getAbilityResourceCosts(actor, ability);
  const english = getLanguage() === "en";
  const names = english ? resourceNamesEn : resourceNamesPt;
  const parts = Object.entries(costs).flatMap(([id, amount]) => amount ? [`${amount} ${names[id] || (english ? resourceById[id]?.shortName : resourceById[id]?.name) || (english ? "Essence" : "Essência")}${!english && id === "random" && amount > 1 ? "s" : ""}`] : []);
  return parts.length ? parts.join(" + ") : "Livre";
}

export function abilityConditions(ability = {}) {
  if (getLanguage() === "en") return abilityConditionsEnglish(ability);
  const conditions = [];
  if (ability.requiredMark) conditions.push("Exige a Marca criada por esta preparação.");
  if (ability.combo?.condition) {
    const condition = ability.combo.condition;
    const label = condition.startsWith("mark:") ? "alvo com a Marca desta preparação" : conditionNames[condition] || condition;
    conditions.push(`Bônus se ${label}${ability.combo.consume ? "; consome a preparação" : ""}.`);
  }
  if (ability.selfDamage) conditions.push(`O usuário perde ${ability.selfDamage} de Vida (não pode ser derrotado por este custo).`);
  if (ability.counterRequiresShield) conditions.push("Só ativa enquanto o beneficiado tiver Defesa destrutível.");
  return conditions.length ? conditions.join(" ") : "Sem condição adicional.";
}

const conditionNamesEn = {
  bleed: "a Bleeding target", burn: "a Burning target", poison: "a Poisoned target", decay: "a Decaying target",
  afflicted: "an afflicted target", exposed: "an Exposed target", stunned: "a Stunned target", weakened: "a Weakened target",
  marked: "a target bearing your Mark", wounded: "a target at 50% Health or less", selfWounded: "yourself at 50% Health or less",
  shielded: "a target with Defense", selfShielded: "yourself with Defense"
};

function abilityConditionsEnglish(ability = {}) {
  const conditions = [];
  if (ability.requiredMark) conditions.push("Requires the Mark created by this setup.");
  if (ability.combo?.condition) {
    const key = ability.combo.condition;
    const label = key.startsWith("mark:") ? "a target bearing this setup's Mark" : conditionNamesEn[key] || key;
    conditions.push(`Bonus against ${label}${ability.combo.consume ? "; consumes the setup" : ""}.`);
  }
  if (ability.selfDamage) conditions.push(`You lose ${ability.selfDamage} Health (this cost cannot defeat you).`);
  if (ability.counterRequiresShield) conditions.push("Only triggers while the recipient has destructible Defense.");
  return conditions.length ? conditions.join(" ") : "No additional condition.";
}

export function abilityDuration(ability = {}) {
  if (getLanguage() === "en") return abilityDurationEnglish(ability);
  const parts = [];
  if (ability.dot?.turns) parts.push(`${statusNames[ability.dot.tag] || "Aflição"}: ${ability.dot.turns} turnos`);
  if (ability.mark) parts.push(`Marca: ${ability.markTurns || 3} turnos`);
  if (ability.stun) parts.push(`Atordoamento: ${ability.stun} turno(s)`);
  if (ability.invulnerable) parts.push(`Invulnerável: ${ability.invulnerable} turno(s)`);
  if (ability.counter) parts.push("Contra-ataque: até a próxima resposta válida");
  return parts.length ? parts.join(" · ") : "Efeito instantâneo";
}

function abilityDurationEnglish(ability = {}) {
  const parts = [];
  if (ability.dot?.turns) parts.push(`${statusNamesEn[ability.dot.tag] || "Affliction"}: ${ability.dot.damage} affliction damage per turn for ${ability.dot.turns} turns`);
  if (ability.mark) parts.push(`Mark: ${ability.markTurns || 3} turns`);
  if (ability.stun) parts.push(`Stun: ${ability.stun} ${ability.stun === 1 ? "turn" : "turns"}`);
  if (ability.invulnerable) parts.push(`Invulnerable: ${ability.invulnerable} ${ability.invulnerable === 1 ? "turn" : "turns"}`);
  if (ability.counter) parts.push("Counterattack: until the next valid response");
  return parts.length ? parts.join(" · ") : "Instant effect";
}

export function abilityCostMarkup(actor, ability) {
  const costs = getAbilityResourceCosts(actor, ability);
  const entries = Object.entries(costs).filter(([, amount]) => amount > 0);
  const label = abilityCostLabel(actor, ability);
  if (!entries.length) return `<span class="codex-skill-cost is-free"><small>${getLanguage() === "en" ? "COST" : "CUSTO"}</small><strong>${highlightKeywords(label)}</strong></span>`;
  const pips = entries.flatMap(([id, amount]) => Array.from({ length: amount }, () => `<i class="cost-pip pip-${esc(id)}" aria-hidden="true"></i>`)).join("");
  const costLabel = getLanguage() === "en" ? "COST" : "CUSTO";
  return `<span class="codex-skill-cost" aria-label="${esc(costLabel)}: ${esc(label)}"><small>${costLabel}</small><span class="codex-cost-pips" aria-hidden="true">${pips}</span><strong>${highlightKeywords(label)}</strong></span>`;
}

export function abilityDetailMarkup(actor, ability) {
  const source = ability.description || abilityQuickEffect(ability);
  const description = getLanguage() === "en" ? localizeText(source, "en") : source;
  return `<div class="ability-detail-grid"><p class="codex-skill-description">${highlightKeywords(description)}</p></div>`;
}
export function abilityQuickMarkup(actor, ability) {
  const english = getLanguage() === "en";
  const cooldown = english ? `CD ${ability.cooldown || 0}` : `Recarga ${ability.cooldown || 0}`;
  return `<span class="skill-quick-info"><b>${highlightKeywords(abilityQuickEffect(ability))}</b><small>${highlightKeywords(abilityCostLabel(actor, ability) + " · " + cooldown)}</small></span>`;
}
