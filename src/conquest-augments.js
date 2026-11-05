import {conquestProgress} from './conquest-progress.js';
export {conquestProgress} from './conquest-progress.js';
import {techniqueElement} from './tactical-elements.js';

export const augmentTiers=Object.freeze({
 silver:{label:'Prata',kingdoms:0},
 gold:{label:'Ouro',kingdoms:3},
 prismatic:{label:'Prismático',kingdoms:8}
});
const friendly=a=>['self','ally','friendly','team'].includes(a.target);
const skills=u=>u.abilities.filter(a=>a.id!=='fortress-basic');
const has=(u,key)=>skills(u).some(a=>a[key]);
const attack=u=>skills(u).some(a=>a.damage);
const support=u=>skills(u).some(a=>friendly(a));
const catalog=[];
const add=(id,title,tier,text,effect,eligible=()=>true,kingdoms=0)=>{
 text=text.replace(/\b[1-4](?= de (?:dano|Vida|Escudo))/g,'5');
 catalog.push({id,title,tier,text,effect,eligible,kingdoms:Math.max(kingdoms,augmentTiers[tier].kingdoms)});
};
const magnitudeStats=new Set(['damage','heal','shield','counter','dot','reduction','reduce','boost','regen']);
const instant=(type,amount)=>({type,amount:['heal','shield','reduction','boost'].includes(type)?Math.max(5,amount):amount});
const lasting=(trigger,stat,amount)=>({type:'conquest-augment',trigger,stat,amount:magnitudeStats.has(stat)?Math.max(5,amount):amount});
add('recover','Fôlego do Invasor','silver','Recupera 20 de Vida do portador.',instant('heal',20),u=>u.hp<u.maxHp);
add('brace','Pele de Pedra','silver','O portador reduz o dano direto recebido em 5 até o fim da rodada.',instant('reduction',4));
add('ward','Égide Solitária','silver','Concede 12 de Escudo ao portador.',instant('shield',12));
add('resolve','Fio Afiado','silver','Técnicas de dano do portador causam +2 de dano.',lasting('modify','damage',2),attack);
add('mender','Mãos Firmes','silver','Técnicas de cura do portador recuperam +3 de Vida.',lasting('modify','heal',3),u=>has(u,'heal'));
add('rivet','Trama Protetora','silver','Técnicas de Escudo do portador concedem +3 de Escudo.',lasting('modify','shield',3),u=>has(u,'shield'));
add('step-ward','Passo Residual','silver','Após mover, recebe 3 de Escudo. Uma vez por rodada.',lasting('move','shield',3));
add('reserve-guard','Reserva de Pedra','silver','Concede 5 de Escudo a cada aliado vivo.',instant('shield-team',5));
add('second-breath','Segundo Fôlego','silver','Após usar o ataque básico, recupera 2 de Vida. Uma vez por rodada.',lasting('basic-hit','heal',2),attack);
add('basic-ward','Guarda Simples','silver','Após usar o ataque básico, ganha 3 de Escudo. Uma vez por rodada.',lasting('basic-hit','shield',3),attack);
add('step-heal','Fôlego de Marcha','silver','Após mover, recupera 2 de Vida. Uma vez por rodada.',lasting('move','heal',2));
add('basic-edge','Lâmina Cotidiana','silver','O ataque básico do portador causa +2 de dano.',lasting('basic','damage',2),u=>u.abilities.some(a=>a.id==='fortress-basic'));
add('first-aid','Costura Rápida','silver','Após acertar uma técnica equipada, recupera 3 de Vida. Uma vez por rodada.',lasting('skill','heal',3),attack,1);
add('cast-ward','Pele Ritual','silver','Após acertar uma técnica equipada, ganha 4 de Escudo. Uma vez por rodada.',lasting('skill','shield',4),attack,1);
add('aid-ward','Abrigo Recíproco','silver','Após apoiar um aliado com uma técnica, ganha 4 de Escudo. Uma vez por rodada.',lasting('support','shield',4),support,1);
add('aid-heal','Vínculo Sereno','silver','Após apoiar um aliado com uma técnica, recupera 3 de Vida. Uma vez por rodada.',lasting('support','heal',3),support,1);
add('expose-ward','Colher a Brecha','silver','Ao causar dano a um alvo Exposto, ganha 5 de Escudo. Uma vez por rodada.',lasting('exposed','shield',5),u=>has(u,'expose'),1);
add('rally','Bastião Partilhado','silver','Concede 8 de Escudo a cada aliado vivo.',instant('shield-team',8),()=>true,1);
add('team-heal','Pacto dos Sobreviventes','silver','Recupera 6 de Vida de cada aliado vivo.',instant('heal-team',6),(u,s,side)=>(side==='player'?s.allies:s.enemies).some(a=>a.hp>0&&a.hp<a.maxHp),1);
add('dot-edge','Ferida Persistente','silver','Aflições das técnicas do portador causam +1 de dano por rodada.',lasting('modify','dot',1),u=>has(u,'dot')||has(u,'dots'),1);
add('refresh','Pulso de Vigília','gold','Reduz as recargas do portador em 1 rodada.',instant('refresh',1),u=>Object.values(u.cooldowns).some(n=>n>0));
add('cleanse','Rito de Purificação','gold','Remove controles, aflições e marcas do portador.',instant('cleanse',1),u=>u.stunned||u.frozen||u.weakened||u.exposed||u.dots?.length||Object.keys(u.marks||{}).length);
add('leap','Salto do Cavalo','gold','Libera movimento em L para o portador. Mantém uma única movimentação por ativação.',instant('leap',1));
add('rampart','Muralha de Cinzas','gold','Ergue uma barreira em uma casa livre próxima à fortaleza rival.',instant('terrain',1));
add('breach','Ruptura do Bastião','gold','Libera técnica em cruz com 18 de dano perfurante e Exposto. Recarga 3.',instant('breach',1),u=>!u.abilities.some(a=>a.id==='fortress-breach'));
add('tide','Círculo da Maré','gold','Cria Água na casa do portador e nas adjacentes por 2 rodadas.',{type:'surface',element:'water'},u=>skills(u).some(a=>['water','air','electric'].includes(techniqueElement(u,a))));
add('pitch','Selo de Piche','gold','Cria Óleo na casa do portador e nas adjacentes por 2 rodadas.',{type:'surface',element:'oil'},u=>skills(u).some(a=>['oil','fire'].includes(techniqueElement(u,a))));
add('static','Coroa de Estática','gold','Eletrifica a casa do portador e as adjacentes por 2 rodadas.',{type:'surface',element:'electric'},u=>skills(u).some(a=>['electric','water'].includes(techniqueElement(u,a))));
add('tempered','Têmpera Ritual','gold','Técnicas de dano do portador causam +4 de dano.',lasting('modify','damage',4),attack);
add('deep-heal','Sutura Luminosa','gold','Técnicas de cura do portador recuperam +5 de Vida.',lasting('modify','heal',5),u=>has(u,'heal'));
add('deep-ward','Bastião Vivo','gold','Técnicas de Escudo do portador concedem +5 de Escudo.',lasting('modify','shield',5),u=>has(u,'shield'));
add('march-ward','Marcha Guardada','gold','Após mover, ganha 6 de Escudo. Uma vez por rodada.',lasting('move','shield',6));
add('march-heal','Marcha Restauradora','gold','Após mover, recupera 4 de Vida. Uma vez por rodada.',lasting('move','heal',4));
add('charge-cast','Cadência Ascendente','gold','Após acertar uma técnica equipada, ganha 1 Carga. Uma vez por rodada.',lasting('skill','charge',1),u=>has(u,'spendCharge')||has(u,'perChargeDamage')||has(u,'perChargeHeal'));
add('expose-heal','Respirar na Brecha','gold','Ao causar dano a um alvo Exposto, recupera 6 de Vida. Uma vez por rodada.',lasting('exposed','heal',6),u=>has(u,'expose'));
add('cruel-dot','Aflição Profunda','gold','Aflições das técnicas do portador causam +2 de dano por rodada.',lasting('modify','dot',2),u=>has(u,'dot')||has(u,'dots'));
add('counter-edge','Resposta Lapidada','gold','Contra-ataques preparados pelas técnicas causam +4 de dano.',lasting('modify','counter',4),u=>has(u,'counter'));
add('aid-charge','Guarda Compartilhada','gold','Após apoiar com uma técnica, ganha 7 de Escudo. Uma vez por rodada.',lasting('support','shield',7),support);
add('prism-edge','Fio Prismático','prismatic','Técnicas de dano do portador causam +6 de dano.',lasting('modify','damage',6),attack);
add('prism-mender','Fonte Interior','prismatic','Técnicas de cura do portador recuperam +8 de Vida.',lasting('modify','heal',8),u=>has(u,'heal'));
add('prism-ward','Catedral Interior','prismatic','Técnicas de Escudo do portador concedem +8 de Escudo.',lasting('modify','shield',8),u=>has(u,'shield'));
add('prism-march','Travessia Inquebrável','prismatic','Após mover, ganha 9 de Escudo. Uma vez por rodada.',lasting('move','shield',9));
add('prism-recover','Sangue Renovado','prismatic','Após mover, recupera 6 de Vida. Uma vez por rodada.',lasting('move','heal',6));
add('prism-cast','Carapaça da Alma','prismatic','Após acertar uma técnica equipada, ganha 10 de Escudo. Uma vez por rodada.',lasting('skill','shield',10),attack);
add('prism-aid','Pacto Luminoso','prismatic','Após apoiar com uma técnica, recupera 7 de Vida. Uma vez por rodada.',lasting('support','heal',7),support);
add('prism-dot','Marca Irreversível','prismatic','Aflições das técnicas causam +3 de dano por rodada.',lasting('modify','dot',3),u=>has(u,'dot')||has(u,'dots'));
add('prism-counter','Juízo Reflexo','prismatic','Contra-ataques preparados pelas técnicas causam +7 de dano.',lasting('modify','counter',7),u=>has(u,'counter'));
add('prism-relief','Alívio Total','prismatic','Recupera 35 de Vida e remove controles, marcas e aflições do portador.',instant('restore',35),u=>u.hp<u.maxHp||u.stunned||u.frozen||u.weakened||u.exposed||u.dots?.length||Object.keys(u.marks||{}).length);
add('prism-rally','Baluarte dos Últimos','prismatic','Cada aliado vivo recebe 16 de Escudo.',instant('shield-team',16));
add('prism-renew','Aurora dos Sobreviventes','prismatic','Cada aliado vivo recupera 16 de Vida.',instant('heal-team',16),(u,s,side)=>(side==='player'?s.allies:s.enemies).some(a=>a.hp>0&&a.hp<a.maxHp));
add('prism-refresh','Roda do Destino','prismatic','Reduz em 1 rodada as recargas de todos os aliados vivos.',instant('refresh-team',1));
add('prism-basic','Domínio do Gesto','prismatic','Ataque básico do portador causa +5 de dano.',lasting('basic','damage',5),u=>u.abilities.some(a=>a.id==='fortress-basic'));
export const conquestAugmentCatalog=Object.freeze(catalog);
export function characterAugments(actor){
 const id=actor.sourceId||actor.id;
 const definitions=[
  ['damage','Golpe',a=>a.damage,'damage',5],
  ['heal','Cuidado',a=>a.heal,'heal',5],
  ['shield','Guarda',a=>a.shield,'shield',5],
  ['counter','Resposta',a=>a.counter,'counter',5],
  ['dot','Aflição',a=>a.dot||a.dots,'dot',5],
  ['boost','Ímpeto',a=>a.boost,'boost',5],
  ['reduce','Resiliência',a=>a.reduce,'reduce',5],
  ['regen','Renovação',a=>a.regen?.heal,'regen',5]
 ];
 return definitions.flatMap(([key,label,match,stat,amount])=>{
  const ability=skills(actor).find(match);
  if(!ability)return [];
  return [{id:'signature:'+id+':'+key,title:label+' de '+actor.name,tier:'gold',kingdoms:5,characterId:id,
   text:ability.name+' recebe +'+amount+' '+modifierLabel(stat)+'.',
   effect:{...lasting('modify',stat,amount),abilityId:ability.id},eligible:()=>true}];
 });
}
const hash=text=>[...String(text)].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,2166136261);
function modifierLabel(stat){
 return {dot:'de dano de aflição por rodada',heal:'de cura',shield:'de Escudo',boost:'de bônus de dano concedido',reduce:'de redução de dano concedida',regen:'de regeneração de Vida por rodada'}[stat]||'de dano';
}
export function conquestAugmentPool(s,side,actor,tier){
 if(!actor||actor.hp<=0)return [];
 const progress=conquestProgress(s.tactical.fortress.progress);
 const owned=s.tactical.augments?.[side]||[];
 return [...catalog,...characterAugments(actor)].filter(o=>o.tier===tier&&o.kingdoms<=progress.completedKingdoms.length&&o.eligible(actor,s,side)&&
  !(o.id==='leap'&&s.tactical.fortress.leaps.includes(actor.id))&&
  !owned.some(a=>a.actorId===actor.id&&a.id===o.id)).map(({eligible,kingdoms,...o})=>({...o,category:o.characterId?'Exclusivo de '+actor.name:'Aprimoramento',reason:'Portador · '+actor.name,effect:{...o.effect,actorId:actor.id,augmentId:o.id,title:o.title,tier:o.tier}}));
}
// Every objective reward belongs to its collector and one named ability.
export function objectiveAugmentPool(s,side,actor,tier){
 if(!actor||actor.hp<=0)return [];
 const rank={silver:0,gold:1,prismatic:2}[tier]??0,owned=s.tactical.augments?.[side]||[],result=[];
 for(const ability of actor.abilities){
  const definitions=[['damage','Impacto','damage',[5,8,12][rank],ability.damage],['heal','Sutura','heal',[5,8,12][rank],ability.heal],['shield','Égide','shield',[5,8,12][rank],ability.shield],['counter','Resposta','counter',[5,8,12][rank],ability.counter],['dot','Aflição','dot',[5,6,8][rank],ability.dot||ability.dots?.length],['boost','Ímpeto','boost',[5,8,12][rank],ability.boost],['reduce','Resiliência','reduce',[5,8,12][rank],ability.reduce],['regen','Renovação','regen',[5,8,12][rank],ability.regen?.heal]];
  if(ability.id==='fortress-basic')definitions.push(['ward','Guarda no Impacto','shield',[5,8,12][rank],true],['mend','Fôlego no Impacto','heal',[5,6,8][rank],true]);
  for(const [key,label,stat,amount,eligible] of definitions){
   if(!eligible)continue;
   const id=['objective',actor.sourceId||actor.id,ability.id,key,tier].join(':'),stacks=owned.filter(a=>a.actorId===actor.id&&a.id?.startsWith(id+':')).length,proc=key==='ward'||key==='mend';
   result.push({id,title:label+' · '+ability.name,tier,characterId:actor.sourceId||actor.id,category:'Exclusivo de '+actor.name,reason:actor.name+' · '+ability.name,
    text:proc?ability.name+' passa a '+(stat==='heal'?'recuperar '+amount+' de Vida do portador':'conceder '+amount+' de Escudo ao portador')+' ao acertar. Uma vez por rodada.':ability.name+' recebe +'+amount+' '+modifierLabel(stat)+' neste combate.',
    effect:{type:'conquest-augment',id:id+':'+stacks,augmentId:id+':'+stacks,actorId:actor.id,abilityId:ability.id,trigger:proc?'basic-hit':ability.id==='fortress-basic'?'basic':'modify',stat,amount,title:label+' · '+ability.name,tier}});
  }
 }return result;
}
export function conquestOfferOptions(s,offer,exclude=[]){
 const units=offer.side==='player'?s.allies:s.enemies;
 const actor=units.find(u=>u.id===offer.actorId&&u.hp>0);
 const pool=offer.objective?objectiveAugmentPool(s,offer.side,actor,offer.tier):conquestAugmentPool(s,offer.side,actor,offer.tier);
 const excluded=new Set(exclude);
 const available=pool.filter(o=>!excluded.has(o.id));
 const seed=[s.rngState||1,s.round,offer.id,offer.rerolls||0].join(':');
 const ordered=available.sort((a,b)=>hash(seed+a.id)-hash(seed+b.id)||a.id.localeCompare(b.id));
 return ordered.slice(0,3);
}
export function conquestOfferTier(s,side,actor,sequence){
 const progress=conquestProgress(s.tactical.fortress.progress);
 const unlocked=Object.keys(augmentTiers).filter(t=>augmentTiers[t].kingdoms<=progress.completedKingdoms.length&&conquestAugmentPool(s,side,actor,t).length>=3);
 const roll=hash([s.rngState||1,s.round,sequence,side].join(':'))%100;
 if(unlocked.includes('prismatic')&&roll<18)return 'prismatic';
 if(unlocked.includes('gold')&&roll<55)return 'gold';
 return 'silver';
}
export function conquestAugmentedAbility(s,actor,ability){
 const result={...ability},onHit={heal:0,shield:0};
 for(const a of s.tactical.augments?.[actor.side]||[]){
  if(a.actorId!==actor.id||a.type!=='conquest-augment'||a.abilityId&&a.abilityId!==ability.id)continue;
  if(a.trigger==='basic'&&ability.id!=='fortress-basic'||a.trigger==='modify'&&ability.id==='fortress-basic')continue;
  if(a.trigger==='basic-hit'&&ability.id==='fortress-basic'&&Object.hasOwn(onHit,a.stat))onHit[a.stat]+=a.amount;
  if(!['modify','basic'].includes(a.trigger))continue;
  if(a.stat==='dot'){
   if(result.dot)result.dot={...result.dot,damage:result.dot.damage+a.amount};
   if(result.dots)result.dots=result.dots.map(dot=>({...dot,damage:dot.damage+a.amount}));
  }else if(a.stat==='regen'&&result.regen?.heal)result.regen={...result.regen,heal:result.regen.heal+a.amount};
  else if(result[a.stat]>0)result[a.stat]+=a.amount;
 }
 if(result.description){
  for(const [stat,label] of [['damage','Causa '],['heal','Recupera '],['shield','Concede '],['counter','Prepara contra-ataque de '],['reduce','Reduz o dano recebido em '],['boost','Concede +']]){
   if(result[stat]!==ability[stat])result.description=result.description.replace(label+ability[stat],label+result[stat]);
  }
  if(result.regen?.heal!==ability.regen?.heal)result.description=result.description.replace('Regenera '+ability.regen.heal+' de Vida','Regenera '+result.regen.heal+' de Vida');
  const beforeDots=[ability.dot,...ability.dots||[]].filter(Boolean),afterDots=[result.dot,...result.dots||[]].filter(Boolean);
  const dotTexts=new Map();
  beforeDots.forEach((dot,index)=>{
   if(dot.damage!==afterDots[index].damage){
    const prefix=(dot.tag||'Aflição')+': ';
    dotTexts.set(prefix+dot.damage+' de dano por '+dot.turns+' rodada(s).',prefix+afterDots[index].damage+' de dano por '+dot.turns+' rodada(s).');
   }
  });
  if(dotTexts.size){
   const pattern=[...dotTexts.keys()].map(text=>text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
   result.description=result.description.replace(new RegExp(pattern,'g'),text=>dotTexts.get(text));
  }
 }
 const benefits=[onHit.heal&&('recupera '+onHit.heal+' de Vida do portador'),onHit.shield&&('concede '+onHit.shield+' de Escudo ao portador')].filter(Boolean);
 if(benefits.length)result.description=[result.description,'Ao acertar, '+benefits.join(' e ')+'. Uma vez por rodada. Cura e Escudo respeitam os limites do portador.'].filter(Boolean).join(' ');
 return result;
}
