// Server-owned PvP normalization: ranked builds never inherit campaign-only power.
import {validateLoadout,defaultLoadout,CARD_RULES} from "./card-combat.js";
export const RANKED_MAX_COPIES = 3;
export function normalizeRankedLoadouts(teamIds,byId={},catalog={}){
 if(!Array.isArray(teamIds)||teamIds.length!==3||new Set(teamIds).size!==3)throw new Error("Trio inválido.");
 if(!byId||typeof byId!=="object"||Array.isArray(byId))throw new Error("Baralhos inválidos.");
 if(Object.keys(byId).some(id=>!teamIds.includes(id)))throw new Error("Baralho de personagem fora do trio.");
 const result={};
 for(const id of teamIds){
  const actor=catalog[id];
  if(!actor)throw new Error("Personagem desconhecido.");
  const supplied=byId[id];
  const entries=supplied??defaultLoadout(actor);
  const validated=validateLoadout(actor,entries);
  const copies=new Map();
  for(const card of validated){
   if(card.upgrades.length)throw new Error("Aprimoramentos de campanha não podem ser usados no PvP ranqueado.");
   copies.set(card.abilityId,(copies.get(card.abilityId)||0)+1);
   if((actor.abilities||[]).length>=3&&copies.get(card.abilityId)>RANKED_MAX_COPIES)throw new Error("Máximo de 3 cópias da mesma carta no PvP.");
  }
  if(validated.length<CARD_RULES.minDeck||validated.length>CARD_RULES.maxDeck)throw new Error("Tamanho inválido.");
  result[id]=validated.map(card=>({abilityId:card.abilityId}));
 }
 return result;
}
