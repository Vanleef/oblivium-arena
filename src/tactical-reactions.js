// Active, animation-led combat reactions for the 6×6 compact arena.
// Inspired by the risk/reward vocabulary of turn-based action combat, but
// built with Oblivium's own realm, material, animation and damage systems.
const cap=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
const types=new Set(['strike','dodge','parry','jump']);
const safeText=value=>String(value||'').slice(0,160);
const isPerfect=(elapsed,impact,window)=>Number.isFinite(elapsed)
 &&elapsed>=0&&Math.abs(elapsed-impact)<=window;
export const tacticalReactiveChoices=Object.freeze({
 strike:'Intensificar',dodge:'Esquivar',parry:'Aparar',jump:'Saltar'
});
export function tacticalReactiveBeats(actor,ability,family='strike'){
 const id=safeText(actor?.sourceId||actor?.id),skill=safeText(ability?.id);
 const hash=[...id+'/'+skill].reduce((n,c)=>n+c.charCodeAt(0),0);
 const count=['voto','despertar'].includes(skill.split('/')[0])?4:3;
 return Array.from({length:count},(_,index)=>{
  const pace=(hash+index*7)%4;
  const duration=[850,1060,1160,960][pace]; // readable windup, release, contact
  const impactAt=[.62,.72,.78,.66][(pace+index)%4];
  const sweep=(family==='burst'||family==='slash')&&index===count-1&&(hash%3===0);
  return Object.freeze({
   index:index+1,total:count,duration,impactAt,impactMs:Math.round(duration*impactAt),
   kind:sweep?'sweep':family==='pierce'?'thrust':family==='strike'?'crush':'normal',
   cue:sweep?'VARREDURA BAIXA':pace===2?'FINTA — ESPERE':family==='pierce'?'ESTOCADA':'GOLPE',
   pose:pace===2?'feint':pace===1?'windup':'anticipate'
  });
 });
}
export function tacticalReactiveJudge(beat,action,elapsed){
 if(!beat||!types.has(action)||!Number.isFinite(elapsed))return {action:'none',success:false,perfect:false};
 if(beat.kind==='sweep'&&action!=='jump'&&action!=='strike')return {action,success:false,perfect:false,reason:'sweep'};
 if(beat.kind!=='sweep'&&action==='jump')return {action,success:false,perfect:false,reason:'not-sweep'};
 const impact=beat.impactMs||Math.round(beat.duration*beat.impactAt);
 // Deliberately asymmetric risk/reward. Dodges forgive >2× the parry window.
 const window=action==='dodge'?205:action==='parry'?90:action==='jump'?170:135;
 const success=isPerfect(elapsed,impact,window);
 return {action,success,perfect:success&&Math.abs(elapsed-impact)<=50};
}
export function tacticalReactiveOutcome({beats=[],attacks=[],defenses=[]}={}){
 const count=Array.isArray(beats)?cap(beats.length,0,4):0;
 const attackBeats=[],defenseBeats=[],avoided=[],parries=[],dodges=[],jumps=[];
 for(let i=0;i<count;i++){
  const attack=attacks[i],defense=defenses[i],kind=beats[i].kind;
  const attackGood=Boolean(attack?.success&&attack.action==='strike');
  const defensive=Boolean(defense?.success
   &&(kind==='sweep'?defense.action==='jump':['dodge','parry'].includes(defense.action)));
  attackBeats.push(attackGood);
  defenseBeats.push(defensive);
  if(defensive){
   avoided.push(i);
   if(defense.action==='parry')parries.push(i);
   if(defense.action==='dodge')dodges.push(i);
   if(defense.action==='jump')jumps.push(i);
  }
 }
 // Full precision parry earns an immediate, shield-aware reactive counter.
 // A perfect jump can answer a sweeping finisher preceded by clean parries.
 const allParried=count>=3&&parries.length===count;
 const jumpCounter=count>=3&&jumps.includes(count-1)&&parries.length===count-1;
 return Object.freeze({reactive:true,beats:count,
  attackBeats,defenseBeats,avoidedBeats:avoided,parryBeats:parries,
  dodgeBeats:dodges,jumpBeats:jumps,
  attackHits:attackBeats.filter(Boolean).length,
  defenseHits:defenseBeats.filter(Boolean).length,
  avoidedAll:count>0&&avoided.length===count,
  counter:allParried||jumpCounter});
}
export function tacticalReactiveDamage(base,combo){
 if(!Number.isFinite(base)||base<=0)return base;
 if(!combo?.reactive)return base;
 const count=cap(combo.beats||0,0,4);
 if(!count)return base;
 let weighted=0;
 for(let i=0;i<count;i++){
  if(combo.avoidedBeats.includes(i))continue; // dodge/parry/jump actually avoids this contact
  weighted+=(combo.attackBeats[i]?1.3:1);
 }
 return Math.max(0,Math.round(base*weighted/count));
}
export function tacticalReactiveAI(beats,{side='defense',round=1,actorId='',abilityId=''}={}){
 const salt=[...safeText(actorId+'/'+abilityId)].reduce((n,c)=>n+c.charCodeAt(0),0)+round;
 return beats.map((beat,index)=>{
  if(side==='attack')return {action:'strike',success:(salt+index)%3!==0,perfect:false};
  // NPCs dodge a minority of contacts; only a human can earn the mastery counter.
  const canDodge=beat.kind!=='sweep'&&(salt+index)%3===0;
  return {action:canDodge?'dodge':'none',success:canDodge,perfect:false};
 });
}
export function tacticalReactiveCounterDamage(base){
 return cap(Math.round((Number(base)||0)*.24),5,12);
}
