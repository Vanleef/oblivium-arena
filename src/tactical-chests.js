import {getAbilityResourceCosts,resourceIds} from './resource-costs.js';
import {boardCells,occupied,obstacle} from './tactical-board.js';
const resourceNames={essence:'Éter',cinza:'Cinza',graca:'Graça',ruptura:'Ruptura'};
const teams=(s,side)=>side==='player'?s.allies:s.enemies;
export function tacticalChestResource(s,side){
 const pool=side==='player'?s.resources:s.enemyResources,demand=Object.fromEntries(resourceIds.map(id=>[id,0]));
 for(const unit of teams(s,side).filter(u=>u.hp>0))for(const ability of unit.abilities)for(const [id,n]of Object.entries(getAbilityResourceCosts(unit,ability)))if(id in demand)demand[id]+=n;
 const used=resourceIds.filter(id=>demand[id]>0);
 return (used.length?used:[...resourceIds]).sort((a,b)=>(demand[b]-(pool[b]||0))-(demand[a]-(pool[a]||0))||demand[b]-demand[a]||resourceIds.indexOf(a)-resourceIds.indexOf(b))[0];
}
const harmful=u=>u.dots?.length||Object.keys(u.marks||{}).length||u.reactives?.some(r=>r.harmful)||['stunned','weakened','exposed','sealSupport','sealAttack','healingBlock'].some(k=>u[k]>0);
export function tacticalChestOptions(s,side,tier){
 const units=teams(s,side),living=units.filter(u=>u.hp>0),hurt=[...living].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0],downed=units.filter(u=>u.hp<=0).sort((a,b)=>a.id.localeCompare(b.id));
 const resource=tacticalChestResource(s,side),label=resourceNames[resource],rank={silver:0,gold:1,prismatic:2}[tier]??0;
 const ward=[12,20,32][rank],boost=[6,12,20][rank],stepWard=[8,12,18][rank],mana=[2,4,6][rank],fraction=[.22,.4,1][rank];
 const augments=s.tactical.augments?.[side]||[],candidates=[];
 const add=(id,title,text,effect,reason,category,score)=>candidates.push({id,title,text,effect,reason,category,score});
 const hasSpace=boardCells().some(p=>!occupied(s,p)&&!obstacle(s,p)&&!s.tactical.chests.some(c=>c.position.x===p.x&&c.position.y===p.y));
 if(rank>0&&downed.length&&hasSpace)add('revive',rank===2?'Renascimento Prismático':'Retorno Dourado','Reviva uma alma caída com '+Math.round((rank===2?.65:.35)*downed[0].maxHp)+' de Vida.',{type:'revive',fraction:rank===2?.65:.35},downed.length+' alma(s) caída(s) podem voltar ao combate.','recuperação',110);
 if(hurt&&hurt.hp<hurt.maxHp)add(rank===2?'renewal':'heal',rank===2?'Restauração Prismática':'Sopro Restaurador',rank===2?'Restaure toda a Vida e remova aflições das almas vivas.':'Cure até '+Math.round(hurt.maxHp*fraction)+' de Vida da alma mais ferida.',rank===2?{type:'full-recover'}:{type:'heal-lowest',fraction},hurt.name+' está com '+hurt.hp+'/'+hurt.maxHp+' de Vida.','recuperação',80+(1-hurt.hp/hurt.maxHp)*20);
 if(living.some(harmful))add('cleanse','Desatar os Males','Remova aflições, marcas e condições prejudiciais do seu trio.',{type:'cleanse-team'},'Há condições prejudiciais nas suas almas.','recuperação',90);
 if(living.some(u=>(u.shield||0)<Math.round(u.maxHp*.5)))add('ward','Manto de Proteção','Conceda '+ward+' de Escudo a cada alma viva.',{type:'shield-team',amount:ward},'Protege '+living.length+' alma(s) contra os próximos golpes.','proteção',65);
 if(!s.tactical.activation&&!augments.some(a=>a.type==='movement-range'&&a.amount>=Math.min(2,rank+1)))add('movement-range','Passo Ampliado','Movimento alcança até '+(1+Math.min(2,rank+1))+' casas neste combate.',{type:'augment',augment:{type:'movement-range',amount:Math.min(2,rank+1),title:'Passo Ampliado'}},'Amplia os destinos de cada ação de movimento.','movimento',72);
 const offensive=living.some(u=>u.abilities.some(a=>a.damage||a.dot||a.dots));
 if(offensive&&living.some(u=>(u.boost||0)<boost))add('valor','Ímpeto Ritual','Conceda +'+boost+' de dano temporário às almas vivas.',{type:'boost-team',amount:boost},'Seu trio possui habilidades ofensivas.','ofensiva',60);
 if(!augments.some(a=>a.type==='step-ward'&&a.amount>=stepWard))add('step-ward','Passo Residual','Após se mover, receba '+stepWard+' de Escudo. Uma vez por alma por rodada, neste combate.',{type:'augment',augment:{type:'step-ward',amount:stepWard,title:'Passo Residual'}},'Transforma movimentação em proteção.','movimento',75);
 if(offensive&&living.some(u=>u.abilities.some(a=>a.expose))&&!augments.some(a=>a.type==='exposed-essence'))add('exposed-essence','Colher a Brecha','Ao causar dano a um alvo Exposto, gere 1 de '+label+'. Uma vez por rodada, neste combate.',{type:'augment',augment:{type:'exposed-essence',resource,title:'Colher a Brecha'}},'Seu trio consegue aplicar Exposto.','sinergia',78);
 add('essence','Reserva de '+label,'Receba '+mana+' de '+label+'.',{type:'essence',resource,amount:mana},'Essência escolhida conforme os custos e a reserva do trio.','essência',55);
 if(living.some(u=>u.hp>12))add('blood-essence','Voto Arriscado','A alma mais saudável perde 12 de Vida; receba '+(mana+2)+' de '+label+'.',{type:'blood-essence',resource,amount:mana+2},'Troca Vida por uma reserva maior de Essência.','sacrifício',50);
 add('round-essence','Fonte Ritual','Ao fim das próximas '+(rank+2)+' rodadas, gere 1 de '+label+' por rodada.',{type:'augment',augment:{type:'round-essence',resource,amount:1,rounds:rank+2,title:'Fonte Ritual'}},'Investe em Essência para as próximas rodadas.','reserva',55);
 const recovery=candidates.filter(o=>o.category==='recuperação').sort((a,b)=>b.score-a.score)[0];
 const pool=candidates.filter(o=>o!==recovery&&o.id!=='essence');
 // Deterministic variation between chests; no extra RNG consumption or hidden enemy plan.
 const offset=(s.round+(s.tactical.chestSequence||0)+(side==='enemy'?1:0))%Math.max(1,pool.length);
 const lasting=pool.filter(o=>o.effect.type==='augment');
 const build=s.tactical.activation?lasting[offset%lasting.length]:pool[offset]||candidates.find(o=>o.id!=='essence');
 const first=recovery||candidates.find(o=>o.id==='ward')||build;
 const second=build!==first?build:pool.find(o=>o!==first);
 const selected=[first,second,candidates.find(o=>o.id==='essence')].filter(Boolean);
 for(const option of candidates)if(selected.length<3&&!selected.includes(option))selected.splice(selected.length-1,0,option);
 return selected.slice(0,3).map(({score,...option})=>option);
}
export function addTacticalAugment(s,side,augment){
 s.tactical.augments??={player:[],enemy:[]};const list=s.tactical.augments[side]??=[];
 const existing=list.find(a=>a.type===augment.type);
 const update={...augment};if(augment.rounds)update.expiresAt=Math.max(s.round-1,existing?.expiresAt||0)+augment.rounds;
 if(existing)Object.assign(existing,update,{amount:Math.max(existing.amount||0,augment.amount||0)});else list.push(update);
}
export function triggerTacticalAugments(s,side,actor,kind,{exposedHit=false}={}){
 const notes=[];s.tactical.augmentTriggers??={};
 for(const augment of s.tactical.augments?.[side]||[]){
  const key=side+':'+augment.type+(augment.type==='step-ward'?':'+actor.id:'');
  if(s.tactical.augmentTriggers[key]===s.round)continue;
  if(augment.type==='step-ward'&&kind==='move'&&actor.hp>0){const old=actor.shield||0;actor.shield=Math.min(Math.round(actor.maxHp*.5),old+augment.amount);if(actor.shield>old){s.tactical.augmentTriggers[key]=s.round;notes.push('Passo Residual: +'+(actor.shield-old)+' de Escudo para '+actor.name+'.');}}
  if(augment.type==='exposed-essence'&&kind==='skill'&&exposedHit){const pool=side==='player'?s.resources:s.enemyResources;pool[augment.resource]=(pool[augment.resource]||0)+1;s.tactical.augmentTriggers[key]=s.round;notes.push('Colher a Brecha: +1 de '+resourceNames[augment.resource]+'.');}
  if(augment.type==='round-essence'&&kind==='round-end'&&s.round<=augment.expiresAt){const pool=side==='player'?s.resources:s.enemyResources;pool[augment.resource]=(pool[augment.resource]||0)+1;s.tactical.augmentTriggers[key]=s.round;notes.push('Fonte Ritual: +1 de '+resourceNames[augment.resource]+'.');}
 }
 return notes;
}
