import { characterById, elos, resourceById } from "./data.js";

export const eloSynergyCatalog = Object.freeze({
  sangria: { label: "Ferida em coro", icon: "◉", kind: "affliction", detail: "Sangramento aplicado causa +1 de aflição por aliado adicional de Sangria." },
  coroa: { label: "Peso da coroa", icon: "♛", kind: "control", detail: "Técnicas de controle recebem +1 de dano por aliado adicional da Coroa." },
  mentira: { label: "Segredo partilhado", icon: "⌁", kind: "essence", detail: "Roubo e geração de Essência podem render +1 unidade com outro aliado da Mentira." },
  chama: { label: "Brasa herdada", icon: "♨", kind: "affliction", detail: "Queimadura aplicada causa +1 de aflição por aliado adicional da Chama." },
  fome: { label: "Fome repartida", icon: "◉", kind: "lifesteal", detail: "Dano que drena Vida restaura +1 Vida por aliado adicional da Fome." },
  podridao: { label: "Praga comum", icon: "✹", kind: "affliction", detail: "Aflições aplicadas causam +1 de dano por aliado adicional da Podridão." },
  silencio: { label: "Silêncio imposto", icon: "⊘", kind: "control", detail: "Técnicas que interrompem recebem +1 de dano por aliado adicional do Silêncio." },
  carne: { label: "Pele em vigília", icon: "◈", kind: "form", detail: "Trocar de Forma concede +2 de Defesa por aliado adicional da Carne." },
  vazio: { label: "Vazio alimentado", icon: "◍", kind: "essence", detail: "Gastar Essência em técnica do Vazio pode devolver +1 unidade à reserva." },
  protecao: { label: "Guarda partilhada", icon: "⬡", kind: "shield", detail: "Habilidades de proteção concedem +1 de Defesa por aliado adicional da Proteção." },
  cura: { label: "Cuidado em cadeia", icon: "✚", kind: "heal", detail: "Habilidades de cura restauram +1 de Vida por aliado adicional da Cura." },
  justica: { label: "Veredito comum", icon: "⚖", kind: "control", detail: "Técnicas contra alvos Expostos recebem +1 de dano por aliado adicional da Justiça." },
  esperanca: { label: "Última centelha", icon: "☼", kind: "wounded", detail: "Com até metade da Vida, o dano direto recebe +1 por aliado adicional da Esperança." },
  verdade: { label: "Verdade revelada", icon: "✧", kind: "marked", detail: "Atacar alvos com Marca própria recebe +1 de dano por aliado adicional da Verdade." },
  uniao: { label: "Promessa partilhada", icon: "∞", kind: "support", detail: "Usar apoio concede +1 de Defesa ao usuário por aliado adicional da União." },
  criacao: { label: "Forma que floresce", icon: "❋", kind: "cleanse", detail: "Limpar uma condição concede +1 de Defesa por aliado adicional da Criação." },
  "correntes-quebradas": { label: "Ruptura em cadeia", icon: "⟲", kind: "charge", detail: "Técnicas que consomem Cargas recebem +1 de dano por aliado adicional das Correntes Quebradas." }
});

const membersOf = value => (Array.isArray(value) ? value : []).map(item => typeof item === "string" ? characterById[item] : item).filter(Boolean);
const countAlive = units => units.filter(unit => (unit.hp ?? 1) > 0);
const matchingPeers = (units, actor, field) => Math.min(2, countAlive(units).filter(unit => unit.id !== actor?.id && unit[field] === actor?.[field]).length);

export function eloSynergyPeers(units, actor, kind) {
  const mode = eloSynergyCatalog[actor?.eloId]?.kind;
  return mode === kind ? matchingPeers(units, actor, "eloId") : 0;
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
        : "Limbo concede +1 Defesa ao trio por aliado adicional (máx. +2), suas técnicas de controle recebem +1 de dano por parceiro adicional e gera 1 Ruptura a cada dois turnos.";
    active.push({ id: `realm-${realm}`, name: realm, icon: realm === "Inferno" ? "♨" : realm === "Paraíso" ? "✧" : "⟲", detail, count });
  }
  const byElo = new Map();
  for (const unit of living) byElo.set(unit.eloId, (byElo.get(unit.eloId) || 0) + 1);
  for (const [eloId, count] of byElo) {
    if (count < 2) continue;
    const elo = elos.find(item => item.id === eloId);
    const rule = eloSynergyCatalog[eloId];
    if (rule) active.push({ id: `elo-${eloId}`, name: elo?.name || eloId, icon: rule.icon, detail: `${rule.detail} Máximo +2.`, count });
  }
  const byAffinity=new Map();
  for(const unit of living){const affinity=unit.affinity||unit.bodyResource;if(affinity)byAffinity.set(affinity,(byAffinity.get(affinity)||0)+1);}
  for(const [affinity,count] of byAffinity){if(count<2)continue;const resource=resourceById[affinity];active.push({id:`affinity-${affinity}`,name:`Afinidade · ${resource?.name||"Essência"}`,icon:resource?.icon||"◈",detail:`Comece cada combate com +1 ${resource?.name||"Essência"} quando duas ou mais almas partilham esta afinidade.`,count});}
  return active;
}

export function compositionEchoes(team) {
  return activeTeamSynergies(team).map(({ id, name, icon, detail, count }) => ({ id, name, icon, detail, count }));
}
