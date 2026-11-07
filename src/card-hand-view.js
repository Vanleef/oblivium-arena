import {handFor,BASIC_ATTACK_ID} from "./card-combat.js";
import {abilityIcon} from "./ui-icons.js";
import {esc,costMarkup} from "./view-utils.js";
import {abilityQuickEffect} from "./ability-presentation.js";
import {skillAvailability} from "./battle-view.js";

export function renderCardHand(state){
 const battle=state.battle;if(!battle?.cardCombat)return "";
 const selected=battle.allies.find(u=>u.id===state.handActorId&&u.hp>0)||battle.allies.find(u=>u.hp>0)||battle.allies[0];
 if(!selected)return "";
 const deck=battle.cardCombat.decks[selected.id];
 const hand=handFor(battle.cardCombat,selected.id);
 const canPlay=battle.phase==="player"&&selected.hp>0;
 const controlling=state.selectedSkill?.actorId===selected.id?selected.abilities.find(a=>a.id===state.selectedSkill.abilityId):null;
 const contestable=Boolean(controlling?.damage&&!["self","ally","friendly","team"].includes(controlling.target));
 const controls=battle.allies.map(u=>{
  const count=handFor(battle.cardCombat,u.id).filter(c=>c.kind==="ability").length;
  return '<button type="button" class="card-unit-switch '+(u.id===selected.id?"active":"")+
   '" data-card-unit="'+esc(u.id)+'" aria-pressed="'+(u.id===selected.id)+'" '+(u.hp<=0?"disabled":"")+'>'+
   '<span>'+esc(u.name)+'</span><small>'+count+' cartas</small></button>';
 }).join("");
 const basic=selected.abilities.find(a=>a.id===BASIC_ATTACK_ID);
 const basicReason=basic?skillAvailability(battle,selected,basic):"INATIVO";
 const basicCard=basic?'<button class="combat-hand-card basic-attack-card" type="button" data-card-play="'+esc(selected.id+"|"+BASIC_ATTACK_ID+"|basic")+'" '+(!canPlay||Boolean(basicReason)?"disabled":"")+'>'+
  '<span class="card-type">AÇÃO BÁSICA · SEM RECARGA</span><span class="card-thumb">⚔</span><strong>Ataque Básico</strong><span class="card-effect">Causa 5 de dano físico ao inimigo escolhido. Não consome uma carta.</span>'+
  '<span class="card-marker">'+(basicReason?esc(basicReason):"SEMPRE DISPONÍVEL")+"</span></button>":"";
 const cards=hand.map(card=>{
  if(card.kind==="movement"){
   const moved=battle.movementPlans?.player?.some(move=>move.actorId===selected.id),active=state.moveActorId===selected.id;
   return '<button type="button" class="combat-hand-card movement-card" data-movement-toggle="'+esc(selected.id)+'" aria-pressed="'+active+'" '+(!canPlay?'disabled':'')+'><span class="card-type">MOVIMENTO · GARANTIDO</span><span class="card-thumb">↗</span><strong>Movimento padrão</strong><p>Escolha uma casa adjacente livre. Pode ser usado junto de uma técnica.</p><span class="movement-warning">'+(moved?'DESTINO MARCADO · ALTERAR':active?'ESCOLHA UMA CASA':'ESCOLHER MOVIMENTO')+'</span></button>'+(moved?'<button type="button" class="movement-clear" data-movement-clear="'+esc(selected.id)+'" '+(!canPlay?'disabled':'')+'>CANCELAR MOVIMENTO</button>':'');
  }
  const ability=selected.abilities.find(a=>a.id===card.abilityId);
  if(!ability)return "";
  const reason=skillAvailability(battle,selected,ability);
  const queued=battle.queue.find(action=>action.actorId===selected.id&&action.cardId===card.id);
  const active=state.selectedSkill?.cardId===card.id;
  const tags=(card.upgrades||[]).map(upgrade=>{
   const type=typeof upgrade==="string"?upgrade:upgrade.type;
   return '<span class="card-upgrade-tag">'+esc(({damage:"+5 dano",bleed:"Sangramento",fire:"Fogo",vigor:"+5 cura/defesa",innate:"Predestinada",retain:"Preservar",exhaust:"Exaurir"})[type]||type)+'</span>';
  }).join("");
  return '<button type="button" class="combat-hand-card '+(queued?"queued ":"")+(active?"active ":"")+(reason?"unavailable":"")+
   '" data-card-play="'+esc(selected.id+'|'+ability.id+'|'+card.id)+'" '+(!canPlay||Boolean(reason)?"disabled":"")+
   ' aria-label="'+esc(ability.name)+'"><span class="card-type">TÉCNICA · '+esc(ability.target==="self"?"PRÓPRIA":ability.target==="team"?"EQUIPE":"AÇÃO")+'</span>'+
   '<span class="card-thumb">'+(ability.art?'<img src="'+esc(ability.art)+'" alt="">':abilityIcon(ability))+'</span>'+
   '<strong>'+esc(ability.name)+'</strong><span class="card-cost">'+costMarkup(selected,ability)+'</span>'+
   '<span class="card-effect">'+esc(abilityQuickEffect(ability))+'</span><span class="card-tags">'+tags+'</span>'+
   (queued?'<span class="card-marker">NA FILA</span>':reason?'<span class="card-marker">'+esc(reason)+'</span>':'')+'</button>';
 }).join("");
 return '<section class="combat-card-system" aria-label="Mão de cartas do personagem">'+
  '<header class="combat-card-heading"><div><small>TRÊS BARALHOS · UMA EQUIPE</small><h2>Mão de '+esc(selected.name)+'</h2></div>'+
  '<div class="combat-deck-counts"><span>Compra: '+(deck?.draw.length||0)+'</span><span>Descarte: '+(deck?.discard.length||0)+'</span><span>Exauridas: '+(deck?.exhaust.length||0)+'</span></div></header>'+
  '<div class="combat-hand-units" role="group" aria-label="Trocar de personagem">'+controls+'</div>'+
  '<div class="combat-hand-cards">'+basicCard+cards+'</div>'+
  (contestable?'<div class="will-plan-controls"><div><b>Manifestação secreta</b><small>Escolha sua postura antes de selecionar o alvo. O adversário só verá a manifestação depois de responder.</small></div><div class="will-plan-options">'+
  [["miragem","Miragem"],["luz","Luz"],["sombra","Sombra"]].map(([id,label])=>'<button data-will-sign="'+id+'" type="button" aria-pressed="'+(state.willSign===id)+'">'+label+'</button>').join("")+
  '</div></div>':"")+
  '<footer class="combat-hand-hint">Cada alma compra 2 cartas por rodada. A mão de cada personagem é independente. Respostas de equipe: '+
  (battle.cardCombat.responses?.player??0)+'.</footer></section>';
}
