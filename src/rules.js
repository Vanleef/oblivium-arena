import { characterById, buffs } from "./data.js";

export function resolveTeam(teamIds) {
  return teamIds.map((id) => typeof id === "string" ? characterById[id] : id).filter(Boolean).slice(0, 3);
}

export function getResonance(teamIds) {
  const team = resolveTeam(teamIds);
  const counts = new Map();
  for (const member of team) {
    if (member.realm === "Limbo") continue;
    const kingdomId = member.kingdomId || member.eloId;
    counts.set(kingdomId, (counts.get(kingdomId) || 0) + 1);
  }
  const [eloId, count] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] || [null, 0];
  const limboCount = team.filter((member) => member.realm === "Limbo").length;
  const chaotic = limboCount > 0;

  if (count >= 3) {
    return { tier: "complete", count: 3, eloId, chaotic, bonus: 0.15, title: "Ressonância Completa", detail: "Trio do mesmo Reino: +15% de potência." };
  }
  if (count === 2) {
    return { tier: "partial", count: 2, eloId, chaotic, bonus: 0.08 + (chaotic ? 0.03 : 0), title: chaotic ? "Ressonância Instável" : "Ressonância Parcial", detail: chaotic ? "Dois aliados do mesmo Reino e uma alma do Limbo: +11% de potência." : "Dupla do mesmo Reino: +8% de potência." };
  }
  if (chaotic) {
    return { tier: "chaotic", count: limboCount, eloId: null, chaotic: true, bonus: 0.06, title: "Ressonância Caótica", detail: "A presença de uma alma do Limbo concede +6% de potência." };
  }
  return { tier: "none", count: 0, eloId: null, chaotic: false, bonus: 0, title: "Sem Ressonância", detail: "Reinos diferentes: sem bônus, com combinações livres." };
}

export function getOwnedCharacters(ownedIds) {
  const owned = new Set(ownedIds);
  return Object.values(characterById).filter((character) => owned.has(character.id));
}

export function getEloRoster(eloId) {
  return Object.values(characterById).filter((character) => character.kingdomId === eloId || character.legacyEloId === eloId || character.eloId === eloId);
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
  const hasForms=team.some(member=>member.bodyForms?.length||member.abilities.slice(0,3).some(ability=>ability.forms?.length||ability.shift?.some(shift=>shift.form!=="base")));
  const hasMarks=team.some(member=>member.abilities.slice(0,3).some(ability=>ability.mark||ability.combo));
  const hasControls=team.some(member=>member.abilities.slice(0,3).some(ability=>ability.stun||ability.weaken||ability.sealAttack||ability.sealSupport));
  return buffs.filter((buff) => {
    if (collectedIds.includes(buff.id)) return false;
    if (buff.effect?.risk && !hasLimbo) return false;
    if (buff.id === "cinzas" && !hasInferno) return false;
    if (buff.id === "graca" && !hasParadise) return false;
    if (buff.id === "ruptura" && !hasLimbo) return false;
    if (buff.id === "echo" && resonance.tier === "none") return false;
    if (["cinderchoir"].includes(buff.id) && !hasInferno) return false;
    if (["formmantle","formseed","soulstep"].includes(buff.id) && !hasForms) return false;
    if (buff.id === "markedchoir" && !hasMarks) return false;
    if (buff.id === "quietedict" && !hasControls) return false;
    return true;
  });
}

export function getRelevantBuffChoices(teamIds,collectedIds=[],seed=1,limit=3){
  const pool=getRelevantBuffs(teamIds,collectedIds),rng=()=>{seed=(Math.imul((Number(seed)||1)>>>0,1664525)+1013904223)>>>0;return seed/4294967296;};
  const shuffle=items=>{const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
  const groups=new Map();for(const buff of pool){const category=buff.category||'utility';if(!groups.has(category))groups.set(category,[]);groups.get(category).push(buff);}
  const choices=[],used=new Set();
  for(const category of shuffle([...groups.keys()])){if(choices.length>=limit)break;const buff=shuffle(groups.get(category))[0];choices.push(buff);used.add(buff.id);}
  for(const buff of shuffle(pool))if(choices.length<limit&&!used.has(buff.id)){choices.push(buff);used.add(buff.id);}
  return shuffle(choices).slice(0,limit);
}


export function getBuffChoices(teamIds, collectedIds = [], count = 3, random = Math.random) {
  const candidates = [...getRelevantBuffs(teamIds, collectedIds)];
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
  }

  const picked = [];
  const categories = new Set();
  for (const buff of candidates) {
    if (picked.length >= count) break;
    if (categories.has(buff.category)) continue;
    picked.push(buff);
    categories.add(buff.category);
  }
  for (const buff of candidates) {
    if (picked.length >= count) break;
    if (!picked.some((item) => item.id === buff.id)) picked.push(buff);
  }
  return picked;
}
