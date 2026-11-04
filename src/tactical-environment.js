import {sameCell} from './tactical-board.js';

export const tacticalEnvironments=Object.freeze([
 Object.freeze({id:'inferno',world:'Inferno',title:'Círculo de Brasas',symbol:'♨',text:'Em C3, ao fim das ações: 6 de dano ambiental. Escudo absorve; Invulnerável bloqueia. Armadura não reduz.'}),
 Object.freeze({id:'paraiso',world:'Paraíso',title:'Santuário de Luz',symbol:'✦',text:'Em C3, ao fim das ações: recupera 6 de Vida. Respeita bloqueio de cura e não revive.'}),
 Object.freeze({id:'limbo',world:'Limbo',title:'Manto de Névoa',symbol:'≋',text:'Em C3, ao fim das ações: recebe 6 de Escudo, até metade da Vida máxima.'})
]);
export function createTacticalEnvironment(id){
 if(id==null||id==='none')return null;
 const rule=tacticalEnvironments.find(r=>r.id===id);if(!rule)throw Error('Regra ambiental inválida.');
 return {...rule,position:{x:2,y:2}};
}
// The same public end-of-round projection is used by the AI and actual resolution.
export function tacticalEnvironmentDelta(s,unit){
 const rule=s.tactical.environment;
 if(!rule||unit.hp<=0||!sameCell(s.tactical.positions[unit.id],rule.position))return {hp:0,shield:0};
 if(rule.id==='inferno'){
  if(unit.invulnerable)return {hp:0,shield:0,blocked:'Invulnerável'};
  const absorbed=Math.min(unit.shield||0,6);
  return {hp:-Math.min(unit.hp,6-absorbed),shield:-absorbed};
 }
 if(rule.id==='paraiso')return {hp:unit.healingBlock?0:Math.min(6,unit.maxHp-unit.hp),shield:0,blocked:unit.healingBlock?'bloqueio de cura':null};
 return {hp:0,shield:Math.max(0,Math.min(6,Math.round(unit.maxHp*.5)-(unit.shield||0)))};
}
export function resolveTacticalEnvironment(s){
 const rule=s.tactical.environment;if(!rule)return [];
 const notes=[];
 for(const unit of [...s.allies,...s.enemies]){
  if(unit.hp<=0||!sameCell(s.tactical.positions[unit.id],rule.position))continue;
  const delta=tacticalEnvironmentDelta(s,unit);unit.hp+=delta.hp;unit.shield=(unit.shield||0)+delta.shield;
  if(delta.blocked)notes.push(unit.name+': '+delta.blocked+' impediu o efeito de '+rule.title+'.');
  else if(delta.hp<0||delta.shield<0)notes.push(unit.name+': brasas causaram '+(-delta.hp)+' de dano à Vida'+(delta.shield?' e consumiram '+(-delta.shield)+' de Escudo':'')+'.');
  else if(delta.hp>0)notes.push(unit.name+': recuperou '+delta.hp+' de Vida no santuário.');
  else if(delta.shield>0)notes.push(unit.name+': recebeu '+delta.shield+' de Escudo da névoa.');
  else notes.push(unit.name+': '+(rule.id==='paraiso'?'Vida já completa.':'Escudo já no limite.'));
 }
 return notes;
}
