import {GRID_WIDTH,GRID_HEIGHT,movementChoices,plannedPosition} from "./tactical-grid.js";
import {portraitMarkup,esc} from "./view-utils.js";

export function renderTacticalGrid(state,getValidTargets){
 const b=state.battle;if(!b?.grid)return "";
 const units=[...b.allies,...b.enemies],planning=b.phase==="player";
 const moving=b.allies.find(u=>u.id===state.moveActorId&&u.hp>0);
 const moveCells=new Set(moving&&planning?movementChoices(b,moving).map(p=>p.x+":"+p.y):[]);
 const actor=b.allies.find(u=>u.id===state.selectedSkill?.actorId);
 const ability=actor?.abilities.find(a=>a.id===state.selectedSkill?.abilityId);
 const targets=new Set(actor&&ability?getValidTargets(b,actor,ability).map(u=>u.id):[]);
 const draftMoves=b.movementPlans?.player||[];
 const tiles=[];
 for(let y=0;y<GRID_HEIGHT;y++)for(let x=0;x<GRID_WIDTH;x++){
  const pos=x+":"+y,unit=units.find(u=>u.position?.x===x&&u.position?.y===y&&u.hp>0);
  const pending=draftMoves.find(m=>m.to.x===x&&m.to.y===y),isMove=moveCells.has(pos);
  const activeTarget=unit&&targets.has(unit.id);
  const occupied=Boolean(unit);
  const art=unit?portraitMarkup(unit,"tactical-unit-portrait"):"";
  const realm=unit?.realm||"";
  tiles.push('<div class="tactical-tile'+(isMove?" move-choice":"")+(activeTarget?" target-choice":"")+
   (occupied?" occupied":"")+(pending?" planned-destination":"")+
   '" role="gridcell" data-cell="'+pos+'" aria-label="Casa '+(x+1)+", "+(y+1)+'">'+
   '<button type="button" class="tactical-tile-pad" data-grid-cell="'+pos+'" '+(!planning||!moving||!isMove?"disabled":"")+
   ' aria-label="Mover '+esc(moving?.name||"alma")+' para coluna '+(x+1)+", linha "+(y+1)+'"></button>'+
   (unit?'<button type="button" class="tactical-occupant '+(unit.side==="player"?"friendly-unit":"opponent-unit")+
   '" data-target="'+esc(unit.id)+'" data-origin-realm="'+esc(realm)+'" aria-label="'+esc(unit.name)+' · '+unit.hp+' de vida'+(activeTarget?" · alvo válido":"")+'">'+
   '<span class="tactical-token-art">'+art+'</span><span class="tactical-token-name">'+esc(unit.name)+'</span>'+
   (state.battleFx?.changes.some(change=>change.id===unit.id)?'<span class="tactical-token-impact">✹</span>':"")+
   '</button>':"")+
   (pending?'<span class="tactical-move-marker" title="Movimento planejado" aria-hidden="true">↳</span>':"")+
   '</div>');
 }
 const movesCount=draftMoves.length;
 return '<section class="tactical-arena" data-origin-realm="'+esc(state.battleNode?.realm||state.battle?.campaignRealm||"Limbo")+'" aria-label="Tabuleiro tático compacto">'+
  '<header class="tactical-arena-header"><div><small>ARENA · 5×5</small><h2>Campo de Confronto</h2></div>'+
  '<div class="tactical-arena-legend"><span>● Seu trio</span><span>◆ Adversários</span></div></header>'+
  '<div class="tactical-grid-wrap"><div class="tactical-grid" role="grid" aria-label="Grade de cinco por cinco">'+tiles.join("")+'</div></div>'+
  '<footer class="tactical-arena-hint" role="status">'+
  (moving?'Selecione uma das casas destacadas para mover '+esc(moving.name)+".":actor&&ability?"Selecione o alvo destacado para "+esc(ability.name)+".":"Selecione uma carta de Movimento ou uma técnica na mão.")+
  ' <span>'+movesCount+'/3 movimentos planejados</span></footer></section>';
}
