import {tacticalPlanningContext} from './tactical-insight.js';

export function tacticalSlotAction(actions,actorId,slot){
 return actions.map((action,index)=>({action,index})).filter(item=>item.action.actorId===actorId)[slot]||null;
}
// Hand order follows formation. Project preparations only up to the next slot of each actor.
export function tacticalHandGroups(battle,actions,{actorId=null,editIndex=null}={}){
 return battle.allies.map(unit=>{
  const index=unit.id===actorId&&Number.isInteger(editIndex)?editIndex:actions.length;
  const refs=Number.isInteger(editIndex)&&unit.id===actorId?actions:[...actions,{type:'move',actorId:unit.id,path:[]}];
  const view=tacticalPlanningContext(battle,'player',refs,index).projection;
  const projected=view.allies.find(u=>u.id===unit.id)||unit;
  return {unit:projected,abilities:projected.hp>0?projected.abilities.filter(a=>!projected.cooldowns[a.id]):[]};
 });
}
// Two slots belong to each character. Their first actions still precede all second actions.
export function reorderTacticalSlots(actions,actorId,from,to){
 const a=tacticalSlotAction(actions,actorId,from),b=tacticalSlotAction(actions,actorId,to);
 if(!a||!b||from===to)return [...actions];
 return actions.map((ref,i)=>i===a.index?b.action:i===b.index?a.action:ref);
}
export function tacticalTurnIncome(battle){
 const draws=battle.essenceDraws?.player||[];
 return Object.fromEntries(['essence','cinza','graca','ruptura'].map(id=>[id,draws.filter(value=>value===id).length]));
}
