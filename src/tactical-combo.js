// Interactive fighting-game rhythm clashes for the compact 3v3 arena.
// No random damage, no percentage UI, and no gameplay changes in previews.
const clampHits=value=>Number.isInteger(value)?Math.max(0,Math.min(3,value)):0;
export const tacticalComboBeats=3;
export function tacticalComboEligible(actor,ability,targets=[]){
 return Boolean(actor?.hp>0&&ability&&(ability.damage||0)>=5
  &&!['impulso','fortress-basic'].includes(String(ability.id||'').split('/')[0])
  &&!['self','ally','friendly','team'].includes(ability.target)
  &&Array.isArray(targets)&&targets.length>0);
}
export function tacticalComboResult(input={}){
 const attackHits=clampHits(input.attackHits),defenseHits=clampHits(input.defenseHits);
 const tempo=attackHits-defenseHits;
 // Each accurate offensive beat adds 10%, each defensive beat removes 10%.
 // These are capped to +/-30% and affect ONLY the direct skill damage.
 const rate=1+tempo/10;
 return Object.freeze({attackHits,defenseHits,tempo,rate});
}
export function tacticalComboDamage(base,input={}){
 if(!Number.isFinite(base)||base<=0)return base;
 const {rate}=tacticalComboResult(input);
 return Math.max(1,Math.round(base*rate));
}
export function tacticalComboAIOpposition({round=1,actorId='',abilityId=''}={}){
 // Predictable fallback; deliberately never uses hidden opposing plans or Math.random.
 const text=String(actorId)+'/'+String(abilityId);
 const checksum=[...text].reduce((sum,c)=>sum+c.charCodeAt(0),0);
 return 1+((checksum+round)%2);
}
const units=s=>[...(s?.allies||[]),...(s?.enemies||[])];
const clone=value=>JSON.parse(JSON.stringify(value));
function inBetween(before,after,fraction){
 const snapshot=clone(before),end=new Map(units(after).map(unit=>[unit.id,unit]));
 for(const actor of units(snapshot)){
  const target=end.get(actor.id);
  if(!target)continue;
  for(const key of ['hp','shield']){
   const old=actor[key]||0,newValue=target[key]||0;
   if(newValue<old)actor[key]=Math.max(0,old-Math.round((old-newValue)*fraction));
  }
 }
 return snapshot;
}
// A replay visualizes one already-resolved, authoritative damage value as several
// true numerical contacts. Only the last frame carries buffs, deaths or displacement.
// The engine never executes a damaging skill twice.
export function tacticalComboReplayEvents(event){
 if(event?.type!=='skill'||event.skipped||!event.before||!event.after||!event.combo)return [event];
 const start=new Map(units(event.before).map(unit=>[unit.id,unit]));
 const losses=units(event.after).reduce((sum,unit)=>{
  const old=start.get(unit.id);if(!old)return sum;
  return sum+Math.max(0,(old.hp||0)-(unit.hp||0))+Math.max(0,(old.shield||0)-(unit.shield||0));
 },0);
 if(losses<2)return [event];
 const slot=String(event.abilityId||'').split('/')[0];
 const count=['voto','despertar'].includes(slot)?4:slot==='impulso'?2:3;
 const frames=[];
 for(let index=0;index<count;index++){
  const first=index?inBetween(event.before,event.after,index/count):clone(event.before);
  const last=index===count-1?clone(event.after):inBetween(event.before,event.after,(index+1)/count);
  const from=new Map(units(first).map(unit=>[unit.id,unit]));
  const value=units(last).reduce((sum,unit)=>{
   const old=from.get(unit.id);
   return old?sum+Math.max(0,(old.hp||0)-(unit.hp||0))+Math.max(0,(old.shield||0)-(unit.shield||0)):sum;
  },0);
  frames.push({...event,before:first,after:last,totalDamage:value,
   comboBeat:index+1,comboTotal:count,comboReplay:true,
   title:event.title+' · '+(index+1)+'/'+count});
 }
 return frames;
}
