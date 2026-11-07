// Confronto de Vontades — a lightweight, deterministic three-way tactical
// mind game. Sealed plans resolve before either side learns the other intent.
// This deliberately replaces real-time reaction input for special techniques.
export const tacticalDuelOptions=Object.freeze([
 Object.freeze({id:'impeto',name:'Ímpeto',symbol:'✦',beats:'finta',hint:'Interrompe a Finta'}),
 Object.freeze({id:'finta',name:'Finta',symbol:'◇',beats:'contencao',hint:'Contorna a Contenção'}),
 Object.freeze({id:'contencao',name:'Contenção',symbol:'⬡',beats:'impeto',hint:'Segura o Ímpeto'})
]);
const beats=Object.freeze(Object.fromEntries(tacticalDuelOptions.map(o=>[o.id,o.beats])));
const valid=x=>Object.hasOwn(beats,x);
export function tacticalDuelResolve(attackChoice,defenseChoice){
 if(!valid(attackChoice)||!valid(defenseChoice))return null;
 const outcome=attackChoice===defenseChoice?'clash':
  beats[attackChoice]===defenseChoice?'hit':'miss';
 return Object.freeze({
  duel:true,attackChoice,defenseChoice,outcome,
  damageRate:outcome==='hit'?1:outcome==='clash'?0.5:0,
  hit:outcome!=='miss',
  label:outcome==='hit'?'ACERTO DECISIVO':outcome==='clash'?'CHOQUE DE VONTADES':'ESPECIAL EVITADO'
 });
}
export function tacticalDuelDamage(base,duel){
 if(!Number.isFinite(base)||base<=0)return base;
 if(!duel?.duel)return base;
 return duel.outcome==='miss'?0:Math.max(1,Math.round(base*(duel.outcome==='clash'?.5:1)));
}
export function tacticalDuelAI({round=1,actorId='',targetId='',abilityId='',side='defense'}={}){
 // Chosen once, BEFORE the human picks. No random online timing/hidden
 // opposing plan or player input influences this local AI response.
 const seed=[round,actorId,targetId,abilityId,side].join('|');
 let checksum=0;
 for(const c of seed)checksum=(checksum*31+c.charCodeAt(0))%2147483647;
 return tacticalDuelOptions[checksum%tacticalDuelOptions.length].id;
}
