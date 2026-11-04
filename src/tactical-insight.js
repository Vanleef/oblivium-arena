import {previewTacticalPlan,tacticalArea,tacticalTargets,tacticalUnits} from './tactical-combat.js';
import {orderTacticalActions} from './tactical-order.js';
import {meetsCondition} from './combat.js';
import {cellLabel,sameCell} from './tactical-board.js';

export function tacticalPlanningContext(battle,side,actions,index=actions.length){
 const unitIds=new Set((side==='player'?battle.allies:battle.enemies).map(u=>u.id));
 const refs=actions.map((a,order)=>({...a,order,side})).filter(a=>unitIds.has(a.actorId));
 const ordered=orderTacticalActions(battle,refs),at=ordered.findIndex(a=>a.order===index);
 // Insertion also respects the actor's passage and public initiative.
 const prior=at<0?ordered:ordered.slice(0,at);
 const result=previewTacticalPlan(battle,side,prior);
 return {projection:result.ok?result.projection:battle,prior,ok:result.ok,reason:result.reason};
}
export function explainTacticalPlan(battle,side,actions){
 const own=side==='player'?battle.allies:battle.enemies,ownIds=new Set(own.map(u=>u.id));
 const ordered=orderTacticalActions(battle,actions.map((a,order)=>({...a,side,order})).filter(a=>ownIds.has(a.actorId)));
 const details=[],prefix=[];
 for(const ref of ordered){
  const before=previewTacticalPlan(battle,side,prefix),view=before.ok?before.projection:battle;
  const actor=(side==='player'?view.allies:view.enemies).find(u=>u.id===ref.actorId),origin=view.tactical.positions[ref.actorId];
  if(!actor||!origin)continue;
  const previous=details.filter(d=>d.actorId===ref.actorId).at(-1),base=own.find(u=>u.id===ref.actorId);
  const ability=ref.type==='skill'?actor.abilities.find(a=>a.id===ref.abilityId):null;
  const destination=ref.type==='move'?ref.path.at(-1):ref.anchor;
  const cells=ability?tacticalArea(view,actor,ability,ref.anchor,ref.orientation):ref.path;
  const targetIds=ability?tacticalTargets(view,actor,ability,ref.anchor,ref.orientation):[];
  const targets=tacticalUnits(view).filter(u=>targetIds.includes(u.id));
  const combos=[];
  if(previous?.type==='move'&&ability)combos.push('Reposicionamento: usa a habilidade a partir de '+cellLabel(origin)+'.');
  if(ref.type==='move'&&previous?.type==='skill')combos.push('Retirada: o movimento ocorre depois da primeira habilidade.');
  if(ability&&(ability.formKey||'base')!==(base.abilities.find(a=>a.id===ability.id)?.formKey||'base'))combos.push('Preparação: a ação anterior liberou '+ability.name+'.');
  if(ability?.damage&&actor.boost>(base.boost||0))combos.push('Ataque fortalecido: +'+actor.boost+' de dano preparado.');
  if(ability?.combo&&targets.some(target=>meetsCondition(target,ability.combo.condition,actor)))combos.push('Condição de combo ativa: '+conditionName(ability.combo.condition)+'.');
  if(ability?.damage&&ability.damageType!=='affliction'&&targets.some(target=>target.exposed)){const producer=[...details].reverse().find(d=>d.appliesExpose&&d.targets.some(t=>targets.some(target=>target.exposed&&target.id===t.id)));combos.push('Alvo Exposto'+(producer?' por '+producer.actorName:'')+': pode receber +10 de dano se continuar atingível.');}
  for(const target of targets){const producer=[...details].reverse().find(d=>d.displacements?.some(m=>m.actorId===target.id&&m.moved));if(producer)combos.push('Alvo reposicionado por '+producer.actorName+': '+target.name+' na área planejada.');}
  prefix.push(ref);const result=previewTacticalPlan(battle,side,prefix);
  const displacements=result.ok?result.actions.find(a=>a.order===prefix.length-1)?.previewDisplacements||[]:[];
  details.push({displacements,draftIndex:ref.order,actorId:actor.id,actorName:actor.name,type:ref.type,slot:ref.slot+1,turnRank:ref.turnRank+1,origin:{...origin},destination:{...destination},name:ref.type==='move'?'Mover para '+cellLabel(destination):ability?.name||'Habilidade',cells:cells.map(p=>({...p})),targets:targets.map(u=>({id:u.id,name:u.name,side:u.side})),combos,appliesExpose:Boolean(ability?.expose),ok:before.ok&&result.ok,reason:!before.ok?before.reason:result.reason||'',conditional:Boolean(ability&&!['self','ally','friendly','team'].includes(ability.target)),positionChanged:!sameCell(origin,battle.tactical.positions[actor.id])});
 }
 return details;
}
function conditionName(condition){return {bleed:'Sangramento',burn:'Queimadura',poison:'Veneno',decay:'Decadência',afflicted:'Aflição',marked:'Marca',wounded:'Vida baixa',selfWounded:'Vida baixa do usuário',selfShielded:'Escudo no usuário',shielded:'Escudo no alvo',anyStatus:'Efeito no alvo',exposed:'Exposto'}[condition]||(condition?.startsWith('mark:')?'Marca da habilidade':condition);}
export function tacticalResolutionFeedback(event){
 if(event.skipped)return [event.reason||'Ação interrompida: o personagem ou o alvo ficou indisponível.'];
 if(event.type==='move')return [event.reason||('Chegou a '+cellLabel(event.to)+'.'),...(event.augmentNotes||[])];
 if(event.type!=='skill')return event.augmentNotes||[];
 const notes=[],before=new Map(tacticalUnits(event.before||{allies:[],enemies:[]}).map(u=>[u.id,u]));
 for(const id of event.previewTargetIds||[]){
  if(event.targets?.includes(id))continue;
  const unit=before.get(id),position=event.before?.positions?.[id];if(!unit)continue;
  if(unit.hp<=0)notes.push(unit.name+': já estava fora de combate.');
  else if(position&&!event.cells?.some(p=>sameCell(p,position)))notes.push(unit.name+': saiu da área antes do impacto.');
  else if(unit.invulnerable)notes.push(unit.name+': protegido por Invulnerável no impacto.');
 }

 for(const move of event.displacements||[])notes.push(move.name+': '+(move.moved?(move.kind==='pull'?'puxado':'empurrado')+' de '+cellLabel(move.from)+' para '+cellLabel(move.to):'deslocamento impedido por ocupante, borda ou obstáculo')+'.');
 for(const unit of tacticalUnits(event.after||{allies:[],enemies:[]})){
  const old=before.get(unit.id);if(!old)continue;
  const hp=unit.hp-old.hp,shield=(unit.shield||0)-(old.shield||0);
  if(hp)notes.push(unit.name+': '+(hp>0?'recuperou '+hp:'perdeu '+(-hp))+' de Vida.');
  if(shield)notes.push(unit.name+': '+(shield>0?'recebeu '+shield:'absorveu '+(-shield))+' de Escudo.');
 }
 if(event.reactions?.length)notes.push('A técnica provocou uma reação ou contra-ataque.');
 if(!notes.length&&!event.targets?.length&&!event.chestsOpened?.length){const actor=before.get(event.actorId),protectedTarget=tacticalUnits(event.before||{allies:[],enemies:[]}).some(u=>u.hp>0&&u.side!==actor?.side&&u.invulnerable&&event.cells?.some(p=>sameCell(p,event.before.positions?.[u.id])));notes.push(protectedTarget?'O alvo estava protegido por Invulnerável no impacto.':'Nenhum alvo válido na área no momento da execução.');}
 else if(!notes.length)notes.push('Efeitos aplicados aos alvos disponíveis.');
 return [...notes,...(event.augmentNotes||[])];
}

// Describes existing kits without adding hidden team bonuses.
export function tacticalTrioIdentity(units){
 const living=units.filter(u=>u.hp>0),notes=[];
 const skills=u=>u.abilities||[];
 const expose=living.find(u=>skills(u).some(a=>a.expose));
 const striker=living.find(u=>u.id!==expose?.id&&skills(u).some(a=>a.damage&&a.damageType!=='affliction'));
 if(expose&&striker)notes.push({title:'Abrir e punir',text:expose.name+' pode aplicar Exposto; '+striker.name+' aproveita a brecha com dano direto.'});
 const guard=living.find(u=>skills(u).some(a=>a.shield&&['ally','team','friendly'].includes(a.target)));
 if(guard)notes.push({title:'Sustentar a linha',text:guard.name+' protege aliados dentro da área de suas habilidades.'});
 const combo=living.find(u=>skills(u).some(a=>a.combo));
 if(combo)notes.push({title:'Preparar e concluir',text:combo.name+' tem golpes condicionais. Confira a condição na carta antes de encadear.'});
 if(!notes.length)notes.push({title:'Controle de posição',text:'Use a primeira ação para ajustar a origem do golpe e a segunda para atacar ou recuar.'});
 return notes.slice(0,3);
}
