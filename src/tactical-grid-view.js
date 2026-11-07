import {GRID_WIDTH,GRID_HEIGHT,movementChoices,plannedPosition,gridDistance} from "./tactical-grid.js";
import {portraitMarkup,esc} from "./view-utils.js";

export function renderTacticalGrid(state,getValidTargets){
 const b=state.battle;if(!b?.grid)return "";
 const units=[...b.allies,...b.enemies],planning=b.phase==="player";
 const moving=b.allies.find(u=>u.id===state.moveActorId&&u.hp>0);
 const moveCells=new Set(moving&&planning?movementChoices(b,moving).map(p=>p.x+":"+p.y):[]);
 const actor=b.allies.find(u=>u.id===state.selectedSkill?.actorId);
 const ability=actor?.abilities.find(a=>a.id===state.selectedSkill?.abilityId);
 const targets=new Set(actor&&ability?getValidTargets(b,actor,ability).map(u=>u.id):[]);
 const showArea=Boolean(actor&&ability&&!["self","team"].includes(ability.target));
 const abilityRange=ability?.id==="__basic_attack__"?1:Math.max(1,Math.min(4,Number(ability?.range)||3));
 const draftMoves=b.movementPlans?.player||[];
 const fx=state.battleFx,fxAbility=units.find(u=>u.id===fx?.actorId)?.abilities.find(a=>a.id===fx?.abilityId);
 const hitAll=fxAbility?.target==="all-enemies";
 const objectiveNames={silver:"Prata",gold:"Ouro",prismatic:"Prismático"};
 const tiles=[];
 for(let y=0;y<GRID_HEIGHT;y++)for(let x=0;x<GRID_WIDTH;x++){
  const pos=x+":"+y,unit=units.find(u=>u.position?.x===x&&u.position?.y===y&&u.hp>0);
  const objective=(b.gridObjectives||[]).find(o=>o.side==="player"&&o.x===x&&o.y===y);
  const pending=draftMoves.find(m=>m.to.x===x&&m.to.y===y),isMove=moveCells.has(pos);
  const activeTarget=unit&&targets.has(unit.id);
  const inArea=showArea&&gridDistance(plannedPosition(b,actor),{x,y})<=abilityRange;
  const occupied=Boolean(unit);
  const arrived=Boolean(unit&&fx?.moves?.some(move=>move.actorId===unit.id));
  const hit=Boolean(unit&&fx?.mode!=="movement"&&(fx?.targetId===unit.id||hitAll&&unit.side!==(units.find(u=>u.id===fx.actorId)?.side)));
  const damage=Boolean(hit&&(fx?.changes?.find(change=>change.id===unit.id)?.hp<0||fx?.totalDamage>0));
  const healing=Boolean(hit&&fx?.changes?.find(change=>change.id===unit.id)?.hp>0);
  const blocked=Boolean(hit&&fx?.clashResult?.cancel);
  const art=unit?portraitMarkup(unit,"tactical-unit-portrait"):"";
  const realm=unit?.realm||"";
  tiles.push('<div class="tactical-tile'+(isMove?" move-choice":"")+(activeTarget?" target-choice":"")+
   (occupied?" occupied":"")+(inArea?" ability-area":"")+(hit?" impact-area":"")+(damage?" impact-damage":"")+(healing?" impact-heal":"")+(blocked?" impact-blocked":"")+(objective?" objective-tile objective-"+esc(objective.tier):"")+(pending?" planned-destination":"")+
   '" role="gridcell" data-cell="'+pos+'" aria-label="Casa '+(x+1)+", "+(y+1)+'">'+
   '<button type="button" class="tactical-tile-pad" data-grid-cell="'+pos+'" '+(!planning||!moving||!isMove?"disabled":"")+
   ' aria-label="Mover '+esc(moving?.name||"alma")+' para coluna '+(x+1)+", linha "+(y+1)+'"></button>'+
   (unit?'<button type="button" class="tactical-occupant '+(unit.side==="player"?"friendly-unit":"opponent-unit")+(arrived?" recently-moved":"")+(hit?" recently-hit":"")+
   '" data-target="'+esc(unit.id)+'" data-origin-realm="'+esc(realm)+'" aria-label="'+esc(unit.name)+' · '+unit.hp+' de vida'+(activeTarget?" · alvo válido":"")+'">'+
   '<span class="tactical-token-art">'+art+'</span><span class="tactical-token-name">'+esc(unit.name)+'</span>'+
   (state.battleFx?.changes.some(change=>change.id===unit.id)?'<span class="tactical-token-impact">✹</span>':"")+
   '</button>':"")+
   (objective?'<span class="tactical-objective-emblem" role="img" aria-label="Casa Objetivo · '+esc(objectiveNames[objective.tier]||"Prata")+'"><span class="objective-ring"></span><span class="objective-core">✧</span></span>':"")+
   (pending?'<span class="tactical-move-marker" title="Movimento planejado" aria-hidden="true">↳</span>':"")+
   '</div>');
 }
 const movesCount=draftMoves.length;
 return '<section class="tactical-arena" data-origin-realm="'+esc(state.battleNode?.realm||state.battle?.campaignRealm||"Limbo")+'" aria-label="Tabuleiro tático compacto">'+
  '<header class="tactical-arena-header"><div><small>ARENA · 5×5</small><h2>Campo de Confronto</h2></div>'+
  '<div class="tactical-arena-legend"><span>● Seu trio</span><span>◆ Adversários</span><span>✦ Alcance</span>'+(b.gridObjectives?.some(o=>o.side==="player")?'<span>✧ Casa Objetivo</span>':"")+"</div></header>"+
  '<div class="tactical-grid-wrap"><div class="tactical-grid" role="grid" aria-label="Grade de cinco por cinco">'+tiles.join("")+'</div></div>'+
  '<footer class="tactical-arena-hint" role="status">'+
  (moving?'Selecione uma das casas destacadas para mover '+esc(moving.name)+".":actor&&ability?"Selecione o alvo destacado para "+esc(ability.name)+".":"Selecione uma carta de Movimento ou uma técnica na mão.")+
  ' <span>'+movesCount+'/3 movimentos planejados</span></footer>'+(b.gridObjectives?.some(o=>o.side==="player")?'<p class="tactical-objective-hint">✧ Alcance o emblema para aprimorar uma carta deste personagem.</p>':"")+"</section>";
}
