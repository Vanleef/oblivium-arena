// Confronto de Vontades — a lightweight, deterministic three-way tactical
// mind game. Sealed plans resolve before either side learns the other intent.
// This deliberately replaces real-time reaction input for special techniques.
export const tacticalDuelOptions=Object.freeze([
 Object.freeze({id:'miragem',name:'Miragem',symbol:'◇',beats:'luz',hint:'Distorce a Luz'}),
 Object.freeze({id:'luz',name:'Luz',symbol:'☼',beats:'sombra',hint:'Revela a Sombra'}),
 Object.freeze({id:'sombra',name:'Sombra',symbol:'◐',beats:'miragem',hint:'Engole a Miragem'})
]);
const beats=Object.freeze(Object.fromEntries(tacticalDuelOptions.map(o=>[o.id,o.beats])));
const valid=x=>Object.hasOwn(beats,x);
export function tacticalDuelResolve(attackChoice,defenseChoice,{mode='legacy'}={}){
 if(!valid(attackChoice)||!valid(defenseChoice))return null;
 const outcome=attackChoice===defenseChoice?'clash':
  beats[attackChoice]===defenseChoice?'hit':'miss';
 return Object.freeze({
  duel:true,attackChoice,defenseChoice,outcome,
  damageRate:outcome==='hit'?1.5:outcome==='clash'?(mode==='cards'?1:0.5):0,
  hit:outcome!=='miss',
  label:outcome==='hit'?'ACERTO DECISIVO':outcome==='clash'?'CHOQUE DE VONTADES':'ESPECIAL EVITADO'
 });
}
export function tacticalDuelDamage(base,duel){
 if(!Number.isFinite(base)||base<=0)return base;
 if(!duel?.duel)return base;
 return duel.outcome==='miss'?0:Math.max(1,Math.round(base*duel.damageRate));
}
const tendencies=Object.freeze({
 'o-acougueiro':'miragem','o-odio-encarnado':'miragem',
 'a-viuva-escarlate':'luz','o-passo-interrompido':'luz',
 'o-escudo-vivo':'sombra','a-arquiteta-verde':'sombra'
});
/** A visible, imperfect read on the rival's preferred style. This makes the
 * mind game informed rather than a blind 33% lottery. It never leaks the roll. */
export function tacticalDuelTendency(actor){
 const id=String(actor?.sourceId||actor?.id||'');
 if(tendencies[id])return tendencies[id];
 const sum=[...id].reduce((value,c)=>value+c.charCodeAt(0),0);
 return tacticalDuelOptions[sum%3].id;
}
export function tacticalDuelAI({round=1,actorId='',targetId='',abilityId='',side='defense',tendency=null}={}){
 // Chosen once, BEFORE the human picks. No random online timing/hidden
 // opposing plan or player input influences this local AI response.
 const seed=[round,actorId,targetId,abilityId,side].join('|');
 let checksum=0;
 for(const c of seed)checksum=(checksum*31+c.charCodeAt(0))%2147483647;
 const favored=valid(tendency)?tendency:null;
 if(!favored)return tacticalDuelOptions[checksum%tacticalDuelOptions.length].id;
 const other=tacticalDuelOptions.filter(o=>o.id!==favored);
 const roll=checksum%4; // two favored, one each alternative
 return roll<2?favored:other[roll-2].id;
}
