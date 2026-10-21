import { characterById, buffs } from "./data.js";

export function resolveTeam(teamIds) {
  return teamIds.map((id) => typeof id === "string" ? characterById[id] : id).filter(Boolean).slice(0, 3);
}

export function getResonance(teamIds) {
  const team = resolveTeam(teamIds);
  const counts = new Map();
  for (const member of team) {
    if (member.realm === "Limbo") continue;
    counts.set(member.eloId, (counts.get(member.eloId) || 0) + 1);
  }
  const [eloId, count] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] || [null, 0];
  const limboCount = team.filter((member) => member.realm === "Limbo").length;
  const chaotic = limboCount > 0;

  if (count >= 3) {
    return { tier: "complete", count: 3, eloId, chaotic, bonus: 0.2, title: "Ressonância Completa", detail: "Trio do mesmo Elo: +20% de potência." };
  }
  if (count === 2) {
    return { tier: "partial", count: 2, eloId, chaotic, bonus: 0.1 + (chaotic ? 0.05 : 0), title: chaotic ? "Ressonância Quebrada" : "Ressonância Parcial", detail: chaotic ? "Dois aliados do mesmo Elo e uma Corrente Quebrada: +15% de potência caótica." : "Dupla do mesmo Elo: +10% de potência." };
  }
  if (chaotic) {
    return { tier: "chaotic", count: limboCount, eloId: null, chaotic: true, bonus: 0.08, title: "Ressonância Caótica", detail: "Uma Corrente Quebrada dobra as regras: +8% de potência." };
  }
  return { tier: "none", count: 0, eloId: null, chaotic: false, bonus: 0, title: "Sem Ressonância", detail: "Elos diferentes: sem bônus, com combinações livres." };
}

export function getOwnedCharacters(ownedIds) {
  const owned = new Set(ownedIds);
  return Object.values(characterById).filter((character) => owned.has(character.id));
}

export function getEloRoster(eloId) {
  return Object.values(characterById).filter((character) => character.eloId === eloId);
}

export function getRosterCounts(characters) {
  return {
    Inferno: characters.filter((character) => character.realm === "Inferno").length,
    Paraíso: characters.filter((character) => character.realm === "Paraíso").length,
    Limbo: characters.filter((character) => character.realm === "Limbo").length
  };
}

export function getRelevantBuffs(teamIds, collectedIds = []) {
  const team = resolveTeam(teamIds);
  const resonance = getResonance(team);
  const hasLimbo = team.some((member) => member.realm === "Limbo");
  const hasInferno = team.some((member) => member.realm === "Inferno");
  const hasParadise = team.some((member) => member.realm === "Paraíso");
  return buffs.filter((buff) => {
    if (collectedIds.includes(buff.id)) return false;
    if (buff.id === "fracture" && !hasLimbo) return false;
    if (buff.id === "cinzas" && !hasInferno) return false;
    if (buff.id === "graca" && !hasParadise) return false;
    if (buff.id === "ruptura" && !hasLimbo) return false;
    if (buff.id === "echo" && resonance.tier === "none") return false;
    return true;
  });
}
