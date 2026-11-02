export function tacticalFirstSide(s){return s.round%2?s.tactical.firstSide:(s.tactical.firstSide==='player'?'enemy':'player');}
export function orderTacticalActions(s,refs,first=tacticalFirstSide(s)){
 const counts=new Map(),ranks=new Map();
 for(const [side,units]of [['player',s.allies],['enemy',s.enemies]])units.forEach((u,i)=>ranks.set(u.id,i*2+(side===first?0:1)));
 return [...refs].sort((a,b)=>a.order-b.order).map(ref=>{const slot=counts.get(ref.actorId)||0;counts.set(ref.actorId,slot+1);return {...ref,slot,turnRank:ranks.get(ref.actorId)??99};})
 .sort((a,b)=>a.slot-b.slot||a.turnRank-b.turnRank||a.order-b.order);
}
