import { esc } from "./view-utils.js";
import { getAbilityResourceCosts } from "./resource-costs.js";
import { resourceById } from "./data.js";
import { getLanguage } from "./i18n.js";

const damageTypeNames = { physical: "físico", energy: "espiritual", piercing: "perfurante", affliction: "de aflição" };
const statusNames = { sangramento: "Sangramento", queimadura: "Queimadura", veneno: "Veneno", decadencia: "Decadência" };
const conditionNames = {
  bleed: "alvo com Sangramento", burn: "alvo com Queimadura", poison: "alvo com Veneno", decay: "alvo com Decadência",
  afflicted: "alvo com uma aflição", exposed: "alvo Exposto", stunned: "alvo Atordoado", weakened: "alvo Enfraquecido",
  marked: "alvo com sua Marca", wounded: "alvo com até 50% de Vida", selfWounded: "usuário com até 50% de Vida",
  shielded: "alvo com Defesa", selfShielded: "usuário com Defesa"
};
const keywords = ["Invulnerável", "Sangramento", "Queimadura", "Decadência", "Atordoado", "Enfraquecido", "Exposto", "Essência", "Coringa", "Ruptura", "Marca", "Veneno", "Defesa", "Éter", "Cinza", "Graça"];
const keywordsEn = ["Invulnerable", "Bleed", "Burn", "Decay", "Stunned", "Weakened", "Exposed", "Essence", "Wildcard", "Rupture", "Mark", "Poison", "Defense", "Aether", "Ash", "Grace", "Health", "Counterattack", "Affliction"];

export function highlightKeywords(value = "") {
  const activeKeywords = [...(getLanguage() === "en" ? keywordsEn : keywords)].sort((a, b) => b.length - a.length);
  const keywordPattern = new RegExp(`(${activeKeywords.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return esc(value).replace(keywordPattern, match => `<mark class="combat-keyword">${match}</mark>`);
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
    const additions = [ability.dot && `${statusNames[ability.dot.tag] || "Aflição"} ${ability.dot.damage}/T`, ability.stun && `Atordoa ${ability.stun}T`, ability.expose && "Expõe", ability.mark && "Marca"].filter(Boolean);
    return `${ability.damage} ${target}${additions.length ? ` · ${additions[0]}` : " de dano"}`;
  }
  if (ability.counter) return `Anula e devolve ${ability.counter}`;
  if (ability.generateEssence) return `Gera ${ability.generateEssence.amount || 1} Essência`;
  if (ability.convertEssence) return "Converte Essência";
  if (ability.steal || ability.drain) return `${ability.steal ? "Rouba" : "Drena"} ${ability.steal || ability.drain} Essência`;
  if (ability.heal && ability.shield) return `Cura ${ability.heal} Vida · +${ability.shield} Defesa`;
  if (ability.heal) return `Cura ${ability.heal} Vida`;
  if (ability.shield) return `+${ability.shield} Defesa`;
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
    const additions = [
      ability.dot && `${statusNamesEn[ability.dot.tag] || "Affliction"} ${ability.dot.damage} affliction damage/turn`,
      ability.stun && `Stun · ${ability.stun} ${ability.stun === 1 ? "turn" : "turns"}`,
      ability.expose && "Expose",
      ability.mark && "Mark"
    ].filter(Boolean);
    return `${ability.damage} ${type} damage ${target}${additions.length ? ` · ${additions.join(" · ")}` : ""}`;
  }
  if (ability.counter) return `Negate and return ${ability.counter} damage`;
  if (ability.generateEssence) return `Generate ${ability.generateEssence.amount || 1} ${resourceById[ability.generateEssence.type || ability.generateEssence.id]?.name || "Essence"}`;
  if (ability.convertEssence) return "Convert Essence";
  if (ability.steal || ability.drain) return `${ability.steal ? "Steal" : "Drain"} ${ability.steal || ability.drain} Essence`;
  if (ability.heal && ability.shield) return `Restore ${ability.heal} Health · +${ability.shield} Defense`;
  if (ability.heal) return `Restore ${ability.heal} Health`;
  if (ability.shield) return `+${ability.shield} Defense`;
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
  const parts = Object.entries(costs).flatMap(([id, amount]) => amount ? [`${amount} ${resourceById[id]?.shortName || "Essência"}`] : []);
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

export function abilityDetailMarkup(actor, ability) {
  const description = ability.description || abilityQuickEffect(ability);
  return `<div class="ability-detail-grid">
    <div><small>CUSTO</small><b>${esc(abilityCostLabel(actor, ability))}</b></div>
    <div><small>EFEITO PRINCIPAL</small><p>${highlightKeywords(abilityQuickEffect(ability))}</p></div>
    <div><small>CONDIÇÕES</small><p>${highlightKeywords(abilityConditions(ability))}</p></div>
    <div><small>INTERAÇÕES E EFEITOS SECUNDÁRIOS</small><p>${highlightKeywords(description)}</p></div>
    <div><small>DURAÇÃO · RECARGA</small><p>${highlightKeywords(abilityDuration(ability))} · ${ability.cooldown || 0} ${getLanguage() === "en" ? (ability.cooldown === 1 ? "turn" : "turns") + " cooldown" : "turno(s) de recarga"}</p></div>
  </div>`;
}

export function abilityQuickMarkup(actor, ability) {
  return `<span class="skill-quick-info"><b>${highlightKeywords(abilityQuickEffect(ability))}</b><small>${esc(abilityCostLabel(actor, ability))} · CD ${ability.cooldown || 0}</small></span>`;
}
