import {characterById} from "./data.js";
import {defaultLoadout,CARD_RULES} from "./card-combat.js";
import {RANKED_MAX_COPIES} from "./ranked-loadouts.js";
import {esc} from "./view-utils.js";

export function deckEntries(profile,state,unit){
 return state.deckDrafts?.[unit.id]||profile.cardLoadouts?.[unit.id]||defaultLoadout(unit);
}
export function renderDeckBuilder(profile,state){
 const roster=(profile.team||[]).map(id=>characterById[id]).filter(Boolean);
 if(!roster.length)return "";
 const selected=roster.find(u=>u.id===state.deckActorId)||roster[0],entries=deckEntries(profile,state,selected);
 const counts=new Map();for(const entry of entries)counts.set(entry.abilityId,(counts.get(entry.abilityId)||0)+1);
 const valid=entries.length>=CARD_RULES.minDeck&&entries.length<=CARD_RULES.maxDeck&&
  (selected.abilities.length<3||Math.max(0,...counts.values())<=RANKED_MAX_COPIES);
 const units=roster.map(u=>'<button type="button" data-deck-unit="'+esc(u.id)+'" aria-pressed="'+(u.id===selected.id)+'">'+esc(u.name)+'</button>').join("");
 const cards=entries.map((entry,i)=>{
  const ability=selected.abilities.find(a=>a.id===entry.abilityId);
  return '<div class="deck-list-card"><span class="deck-card-index">'+(i+1)+'</span><div><strong>'+esc(ability?.name||entry.abilityId)+'</strong><small>'+esc(ability?.damage?"Ataque":ability?.heal?"Cura":ability?.shield?"Proteção":"Técnica")+'</small></div><button type="button" data-deck-remove="'+esc(selected.id)+'|'+i+'" aria-label="Remover carta '+(i+1)+'">×</button></div>';
 }).join("");
 const abilities=selected.abilities.map(a=>{
  const count=counts.get(a.id)||0,maxed=entries.length>=CARD_RULES.maxDeck||selected.abilities.length>=3&&count>=RANKED_MAX_COPIES;
  return '<div class="deck-skill-option"><div><strong>'+esc(a.name)+'</strong><small>'+count+' no baralho'+(selected.abilities.length>=3?' · máximo '+RANKED_MAX_COPIES:'')+'</small></div><button type="button" data-deck-add="'+esc(selected.id)+'|'+esc(a.id)+'" '+(maxed?'disabled':'')+' aria-label="Adicionar '+esc(a.name)+'">+ CARTA</button></div>';
 }).join("");
 return '<section class="deck-builder" aria-label="Montagem de baralhos">'+
  '<div class="deck-builder-heading"><div><small>ANTES DO CONFRONTO</small><h2>Baralhos do trio</h2><p>Equipe 8 a 10 cartas para cada alma. As três mãos permanecem separadas durante a partida.</p></div><span class="deck-builder-count">'+entries.length+' / '+CARD_RULES.maxDeck+'</span></div>'+
  '<nav class="deck-builder-units" aria-label="Escolha o personagem para editar">'+units+'</nav>'+
  '<div class="deck-builder-layout"><div><h3>Cartas equipadas</h3><div class="deck-card-list">'+cards+'</div></div>'+
  '<div><h3>Adicionar técnicas</h3><div class="deck-skill-list">'+abilities+'</div><p class="deck-builder-note">O PvP usa cartas sem os aprimoramentos permanentes da campanha. Duplicatas contam como cartas independentes na compra.</p></div></div>'+
  '<footer class="deck-builder-actions"><span role="status">'+(valid?'Baralho dentro das regras ranqueadas.':'O baralho precisa de 8 a 10 cartas e respeitar o limite de cópias.')+'</span>'+
  '<div><button class="button button-outline" type="button" data-deck-reset="'+esc(selected.id)+'">RESTAURAR</button>'+
  '<button class="button button-gold" type="button" data-deck-save="'+esc(selected.id)+'" '+(valid?'':'disabled')+'>SALVAR BARALHO</button></div></footer></section>';
}
