// Replay-only visual readout: every number comes from resolved before/after snapshots.
// Never predicts or discloses sealed opponent actions during planning.
const actors=state=>[...(state?.allies||[]),...(state?.enemies||[])];
const pointKey=p=>p&&Number.isInteger(p.x)&&Number.isInteger(p.y)?p.x+','+p.y:null;
const statuses=Object.freeze([
 ['stunned','ATORDOADO'],['frozen','CONGELADO'],['weakened','ENFRAQUECIDO'],
 ['exposed','EXPOSTO'],['sealSupport','SUPORTE SELADO'],['sealAttack','ATAQUE SELADO'],
 ['healingBlock','CURA BLOQUEADA']
]);
const boons=Object.freeze([
 ['invulnerable','INVULNERÁVEL'],['counter','CONTRA-ATAQUE'],
 ['reduction','REDUÇÃO DE DANO'],['boost','DANO AUMENTADO'],
 ['regeneration','REGENERAÇÃO']
]);
const dotKey=dot=>[dot.skillId||'',dot.sourceId||'',dot.tag||'',dot.name||''].join('|');
// Only resolved replay events reach this helper. Never use it on hidden planning data.
// Technique targets and the clicked anchor provide a fallback when the motor has no area cells.
export function tacticalVisualCells(event){
 if(!event||event.skipped)return [];
 const cells=(event.cells||[]).filter(pointKey);
 if(cells.length||event.type!=='skill')return cells;
 const positions=event.before?.positions||event.after?.positions||{};
 const ids=[...(event.affectedTargetIds||[]),...(event.targets||[])];
 const points=ids.map(id=>positions[id]||event.after?.positions?.[id]).filter(pointKey);
 if(!points.length&&pointKey(event.anchor))points.push(event.anchor);
 return [...new Map(points.map(point=>[pointKey(point),point])).values()];
}
export function tacticalFeedback(event){
 if(!['skill','field-event','effects'].includes(event?.type)||event.skipped||!event.before||!event.after)return [];
 const previous=new Map(actors(event.before).map(u=>[u.id,u]));
 const area=new Set((event.cells||[]).map(pointKey));
 const targetIds=new Set([...(event.affectedTargetIds||[]),...(event.targets||[])]);
 return actors(event.after).flatMap(unit=>{
  const old=previous.get(unit.id),point=event.after.positions?.[unit.id]||event.before.positions?.[unit.id];
  if(!old||!point||(area.size&&!area.has(pointKey(point))&&!targetIds.has(unit.id)))return [];
  const out=[],hp=(unit.hp||0)-(old.hp||0),shield=(unit.shield||0)-(old.shield||0);
  if(hp<0)out.push({actorId:unit.id,point,kind:'damage',amount:-hp,label:'−'+(-hp)});
  if(hp>0)out.push({actorId:unit.id,point,kind:'heal',amount:hp,label:'+'+hp});
  if(shield<0)out.push({actorId:unit.id,point,kind:'shield-loss',amount:-shield,label:'−'+(-shield)+' Escudo'});
  if(shield>0)out.push({actorId:unit.id,point,kind:'shield',amount:shield,label:'+'+shield+' Escudo'});
  for(const [key,label] of statuses)if((unit[key]||0)>(old[key]||0))out.push({actorId:unit.id,point,kind:'status',amount:0,label});
  for(const [key,label] of boons)if((unit[key]||0)>(old[key]||0))out.push({actorId:unit.id,point,kind:'buff',amount:0,label});
  for(const [id,mark] of Object.entries(unit.marks||{}))if((mark?.turns||0)>(old.marks?.[id]?.turns||0))out.push({actorId:unit.id,point,kind:'status',amount:0,label:'MARCADO'});
  const oldDots=(old.dots||[]).filter(dot=>dot.turns>0),seen=new Map();
  for(const dot of unit.dots||[]){
   if(!(dot.turns>0))continue;
   const id=dotKey(dot),nth=(seen.get(id)||0)+1;seen.set(id,nth);
   const matching=oldDots.filter(previous=>dotKey(previous)===id);
   if(nth>matching.length||dot.turns>Math.max(0,...matching.map(previous=>previous.turns)))
    out.push({actorId:unit.id,point,kind:'status',amount:0,label:'AFLIÇÃO'});
  }
  return out;
 });
}
const effects=[
 // Materials take priority over generic realm/energy words in a technique title.
 ['rot',/podrid|vermes?|decompos|corros|necros|fungo|praga|toxina/i],
 ['stone',/pedra|rocha|m[aá]rmore|l[aá]pide|escombro|muralha|estilha[cç]o de pedra/i],
 ['thread',/fios?\b|tecel|trama|costur|la[cç]o|amarra|correntes?|grilh[aã]o/i],
 ['fire',/chama|brasa|fogo|inc[eê]ndio|queima|cinza|lava|flame|burn/i],
 ['storm',/raio|rel[aâ]mpago|el[eé]tric|tempestade|trov[aã]o|shock|lightning/i],
 ['frost',/gelo|congela|frio|geada|ice|frost/i],
 ['nature',/ra[ií]z|vinha|planta|seiva|espinho|folha|verde|natural/i],
 ['blood',/sangue|l[aâ]mina|corte|talho|carn|hemorr|blood|slash/i],
 ['void',/sombra|vazio|ruptura|abismo|mem[oó]ria|ilusi|treva|espectr/i],
 ['grace',/gra[cç]a|luz|sagrad|purific|divin|b[eê]n[cç][aã]o/i]
];
export function tacticalTechniqueTone(actor,ability,event){
 if(event?.type==='field-event')return ({storm:'storm',wind:'nature',rain:'frost'})[event.id]||'void';
 if(event?.type!=='skill')return 'neutral';
 if(ability?.defense||ability?.invulnerable||ability?.shield)return 'shield';
 if(ability?.heal||ability?.regen||ability?.regeneration)return 'heal';
 const text=[ability?.name,ability?.description,ability?.damageType,event?.element].filter(Boolean).join(' ');
 for(const [tone,pattern] of effects)if(pattern.test(text))return tone;
 if(ability?.dot||ability?.stun||ability?.sealAttack||ability?.weaken)return 'void';
 if(ability?.damageType==='piercing'||ability?.damageType==='physical')return 'blood';
 return actor?.realm==='Inferno'?'fire':actor?.realm==='Paraíso'?'grace':'void';
}
export function tacticalAreaPhase(event){
 if(event?.skipped)return null;
 if(event?.type==='effects')return event.pose==='impact'?'impact':null;
 if(event?.type==='field-event')return event.cells?.length&&event.pose==='impact'?'impact':null;
 if(event?.type!=='skill'||!tacticalVisualCells(event).length)return null;
 if(['impact','counter'].includes(event.pose))return 'impact';
 if(['anticipate','windup','gather','inhale','compress','brace','release','thrust','travel','spread'].includes(event.pose))return 'preview';
 return null;
}
