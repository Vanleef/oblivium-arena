// Replay-only visual readout: every number comes from resolved before/after snapshots.
// Never predicts or discloses sealed opponent actions during planning.
const actors=state=>[...(state?.allies||[]),...(state?.enemies||[])];
const pointKey=p=>p&&Number.isInteger(p.x)&&Number.isInteger(p.y)?p.x+','+p.y:null;
const statuses=Object.freeze([
 ['stunned','ATORDOADO'],['frozen','CONGELADO'],['weakened','ENFRAQUECIDO'],
 ['exposed','EXPOSTO'],['sealSupport','SUPORTE SELADO'],['sealAttack','ATAQUE SELADO'],
 ['healingBlock','CURA BLOQUEADA']
]);
export function tacticalFeedback(event){
 if(event?.type!=='skill'||event.skipped||!event.before||!event.after)return [];
 const previous=new Map(actors(event.before).map(u=>[u.id,u]));
 const area=new Set((event.cells||[]).map(pointKey));
 const targetIds=new Set(event.affectedTargetIds||event.targets||[]);
 return actors(event.after).flatMap(unit=>{
  const old=previous.get(unit.id),point=event.before.positions?.[unit.id]||event.after.positions?.[unit.id];
  if(!old||!point||(area.size&&!area.has(pointKey(point))&&!targetIds.has(unit.id)))return [];
  const out=[],hp=(unit.hp||0)-(old.hp||0),shield=(unit.shield||0)-(old.shield||0);
  if(hp<0)out.push({actorId:unit.id,point,kind:'damage',amount:-hp,label:'−'+(-hp)});
  if(hp>0)out.push({actorId:unit.id,point,kind:'heal',amount:hp,label:'+'+hp});
  if(shield<0)out.push({actorId:unit.id,point,kind:'shield-loss',amount:-shield,label:'−'+(-shield)+' Escudo'});
  if(shield>0)out.push({actorId:unit.id,point,kind:'shield',amount:shield,label:'+'+shield+' Escudo'});
  for(const [key,label] of statuses)if((unit[key]||0)>(old[key]||0))out.push({actorId:unit.id,point,kind:'status',amount:0,label});
  return out;
 });
}
const effects=[
 ['fire',/chama|brasa|fogo|inc[eê]ndio|queima|cinza|lava|flame|burn/i],
 ['storm',/raio|rel[aâ]mpago|el[eé]tric|tempestade|trov[aã]o|shock|lightning/i],
 ['frost',/gelo|congela|frio|geada|ice|frost/i],
 ['nature',/ra[ií]z|vinha|planta|seiva|espinho|folha|verde|natural/i],
 ['blood',/sangue|l[aâ]mina|corte|talho|carn|hemorr|blood|slash/i],
 ['void',/sombra|vazio|ruptura|abismo|mem[oó]ria|ilusi|treva|espectr/i],
 ['grace',/gra[cç]a|luz|sagrad|purific|divin|b[eê]n[cç][aã]o/i]
];
export function tacticalTechniqueTone(actor,ability,event){
 if(event?.type!=='skill')return 'neutral';
 if(ability?.heal||ability?.regen||ability?.target==='ally'||ability?.target==='team'||ability?.target==='friendly')return 'heal';
 if(ability?.defense||ability?.invulnerable||ability?.shield)return 'shield';
 const text=[ability?.name,ability?.description,ability?.damageType,event?.element].filter(Boolean).join(' ');
 for(const [tone,pattern] of effects)if(pattern.test(text))return tone;
 if(ability?.dot||ability?.stun||ability?.sealAttack||ability?.weaken)return 'void';
 if(ability?.damageType==='piercing'||ability?.damageType==='physical')return 'blood';
 return actor?.realm==='Inferno'?'fire':actor?.realm==='Paraíso'?'grace':'void';
}
export function tacticalAreaPhase(event){
 if(event?.type!=='skill'||event.skipped||!event.cells?.length)return null;
 if(['impact','counter'].includes(event.pose))return 'impact';
 if(['anticipate','windup','gather','inhale','compress','brace','release','thrust','travel','spread'].includes(event.pose))return 'preview';
 return null;
}
