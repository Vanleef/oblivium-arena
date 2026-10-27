import { characterById, elos, resourceById } from "./data.js";

export const kingdomSynergyCatalog = Object.freeze(Object.fromEntries(elos.map(kingdom => [kingdom.id, kingdom.synergy])));
export const eloSynergyCatalog = kingdomSynergyCatalog;

const membersOf = value => (Array.isArray(value) ? value : []).map(item => typeof item === "string" ? characterById[item] : item).filter(Boolean);
const countAlive = units => units.filter(unit => (unit.hp ?? 1) > 0);
const matchingPeers = (units, actor, field) => Math.min(2, countAlive(units).filter(unit => unit.id !== actor?.id && unit[field] === actor?.[field]).length);
const linkedKingdomIds = unit => [...new Set([unit?.kingdomId, ...(unit?.synergyKingdomIds || [])].filter(Boolean))];

export function eloSynergyPeers(units, actor, kind) {
  const actorKingdoms = linkedKingdomIds(actor);
  const sharedPeerCount = countAlive(units).filter(unit => unit.id !== actor?.id
    && actorKingdoms.some(kingdomId => kingdomSynergyCatalog[kingdomId]?.kind === kind && linkedKingdomIds(unit).includes(kingdomId))).length;
  return Math.min(2, sharedPeerCount);
}

export function realmSynergyPeers(units, actor, kind) {
  const realm = actor?.realm;
  if (realm === "Inferno" && kind === "affliction" || realm === "Paraíso" && kind === "heal" || realm === "Limbo" && kind === "control") {
    return matchingPeers(units, actor, "realm");
  }
  return 0;
}

export function activeTeamSynergies(team) {
  const living = countAlive(membersOf(team));
  const active = [];
  const realms = ["Inferno", "Paraíso", "Limbo"];
  for (const realm of realms) {
    const count = living.filter(unit => unit.realm === realm).length;
    if (count < 2) continue;
    const detail = realm === "Inferno" ? "Aflições aplicadas recebem +1 de dano por aliado adicional; máximo +2."
      : realm === "Paraíso" ? "Curas concedidas recebem +1 de Vida por aliado adicional; máximo +2."
        : "Limbo concede +1 Defesa ao trio por aliado adicional (máx. +2); controle recebe +1 dano por parceiro e 2+ aliados geram 1 Ruptura a cada dois turnos.";
    active.push({ id: `realm-${realm}`, name: realm, icon: realm === "Inferno" ? "♨" : realm === "Paraíso" ? "✧" : "⟲", detail, count });
  }
  const byKingdom = new Map();
  for (const unit of living) {
    for (const kingdomId of linkedKingdomIds(unit)) {
      if (!kingdomSynergyCatalog[kingdomId]) continue;
      const members = byKingdom.get(kingdomId) || new Set();
      members.add(unit.id);
      byKingdom.set(kingdomId, members);
    }
  }
  for (const [kingdomId, members] of byKingdom) {
    const count = members.size;
    if (count < 2) continue;
    const kingdom = elos.find(item => item.id === kingdomId);
    const rule = kingdomSynergyCatalog[kingdomId];
    active.push({ id: `kingdom-${kingdomId}`, name: kingdom?.name || kingdomId, icon: rule.icon, detail: `${rule.detail} Máximo +2.`, count });
  }
  const byAffinity=new Map();
  for(const unit of living){const affinity=unit.affinity||unit.bodyResource;if(affinity)byAffinity.set(affinity,(byAffinity.get(affinity)||0)+1);}
  for(const [affinity,count] of byAffinity){if(count<2)continue;const resource=resourceById[affinity];active.push({id:`affinity-${affinity}`,name:`Afinidade · ${resource?.name||"Essência"}`,icon:resource?.icon||"◈",detail:`Comece cada combate com +1 ${resource?.name||"Essência"} quando duas ou mais almas partilham esta afinidade.`,count});}
  return active;
}

export function compositionEchoes(team) {
  return activeTeamSynergies(team).map(({ id, name, icon, detail, count }) => ({ id, name, icon, detail, count }));
}
