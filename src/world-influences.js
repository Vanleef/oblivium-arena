import { seededRandom, shuffled } from './progression.js';
import { elos } from './data.js';
import { worldInfluences } from './world-event-catalog.js';
export { worldInfluences } from './world-event-catalog.js';
import { initializeWorldUnit } from './world-rules.js';
const units=s=>[...s.allies,...s.enemies];
const techniques=u=>u.abilities.flatMap(a=>[a,...(a.forms||[])]);
const helpful=a=>['self','ally','friendly','team'].includes(a.target)&&!a.defense;
const predicates={
 healer:a=>a.heal||a.perChargeHeal,guardian:a=>a.shield||a.reduce,
 afflicter:a=>a.dot||a.reactive?.damage&&(!a.reactive.damageType||a.reactive.damageType==='affliction'),
 marker:a=>a.mark||a.requiredMark||a.combo?.condition?.startsWith('mark:'),
 support:helpful,controller:a=>a.stun||a.weaken||a.expose||a.sealAttack||a.sealSupport||a.combo?.stun,
 counter:a=>a.counter,charger:a=>a.gainCharge||a.spendCharge||a.perChargeDamage||a.perChargeHeal,
 shifter:a=>a.forms?.length||a.shift?.length||a.formKey&&a.formKey!=='base'
};
const typeLabels={healer:'Cura',guardian:'Barreiras e redução',afflicter:'Aflições',marker:'Marcas',support:'Apoio',controller:'Controle',counter:'Contra-ataques',charger:'Cargas',shifter:'Habilidades mutáveis'};
const matchesType=(e,u)=>!e.type||techniques(u).some(predicates[e.type]||(()=>false));
export const influenceTargets=(e,list)=>list.filter(u=>u.hp>0&&matchesType(e,u)&&(!e.eloIds.length||e.eloIds.includes(u.eloId)));
export const influenceScope=e=>[e.eloIds.length?e.eloIds.map(id=>elos.find(e=>e.id===id)?.name||id).join(' · '):'',typeLabels[e.type]||''].filter(Boolean).join(' / ')||'Todos os Elos';
export function draftTier(seed,stage=0){const n=seededRandom(seed+stage*4099)();return n<Math.max(.2,.7-stage*.18)?'silver':n<Math.max(.65,.95-stage*.1)?'gold':'prismatic';}
export function influenceOffers(s,seed=1,tier=null){
 const eligible=worldInfluences.filter(e=>(!tier||e.tier===tier)&&influenceTargets(e,units(s)).length);
 const fallback=worldInfluences.filter(e=>(!tier||e.tier===tier)&&!e.eloIds.length&&!e.type);
 const relevant=eligible.length>=3?eligible:fallback;
 const fresh=relevant.filter(e=>!s.worldEvents?.some(p=>p.id===e.id));
 const rng=seededRandom(seed),choices=[];
 for(const category of ['offense','defense','utility']){
  const options=shuffled(relevant.filter(e=>e.category===category),rng),newOptions=options.filter(e=>fresh.includes(e));
  const picked=newOptions[0]||options[0];if(picked)choices.push(picked);
 }
 for(const e of shuffled([...fresh,...relevant],rng))if(choices.length<3&&!choices.some(p=>p.id===e.id))choices.push(e);
 return shuffled(choices,rng).slice(0,3);
}
export function applyInfluence(s,id,side){
 const e=worldInfluences.find(e=>e.id===id);if(!e)throw new Error('Evento desconhecido');
 const eligible=influenceTargets(e,units(s));
 for(const u of eligible){
  u.persistentMaxHp??=u.maxHp;
  if(e.effect.maxHp){const ratio=u.hp/u.maxHp;u.maxHp+=e.effect.maxHp;u.hp=Math.max(1,Math.round(u.maxHp*ratio));}
  u.shield=Math.min(80,u.shield+(e.effect.shield||0));initializeWorldUnit(u,e.effect);
 }
 if(e.effect.essence)for(const [side,list]of [['player',s.allies],['enemy',s.enemies]])if(list.some(u=>eligible.includes(u))){const pool=side==='player'?s.resources:s.enemyResources;for(const [id,n]of Object.entries(e.effect.essence))pool[id]=(pool[id]||0)+n;}
 (s.worldEvents||=[]).push({id,side,title:e.title,tier:e.tier});
}
export function persistentCombatHp(u){return u.hp<=0?0:Math.max(1,Math.round(u.hp*(u.persistentMaxHp||u.maxHp)/u.maxHp));}
export function beginInfluences(s,seed=1){s.worldSeed=Number(seed)||1;s.worldEvents=[];s.influenceStages={player:0,enemy:0};s.eventDeaths=units(s).filter(u=>u.hp<=0).map(u=>u.id);s.influenceQueue=[{side:'player',reason:'O mundo dos vivos se agita'},{side:'enemy',reason:'Escolha da oposição'}];s.influenceResume=s.phase;openInfluence(s);}
function openInfluence(s){
 const next=s.influenceQueue.shift();if(!next){s.influenceDraft=null;s.phase=s.influenceResume;return;}
 s.influenceStages||={player:0,enemy:0};const stage=s.influenceStages[next.side]++;
 const tier=draftTier(s.worldSeed,stage),options=influenceOffers(s,s.worldSeed+37*s.worldEvents.length+101*s.eventDeaths.length,tier);
 // The AI scores public recipients and current resources; it never reads a queued action.
 s.influenceDraft={...next,tier,stage,options:options.map(e=>e.id)};s.phase='influence';
 if(next.side==='enemy'&&!s.humanSides){
  const score=e=>influenceValue(e,s.enemies)-influenceValue(e,s.allies)*.65;
  const choice=[...options].sort((a,b)=>score(b)-score(a))[0];applyInfluence(s,choice.id,'enemy');openInfluence(s);
 }
}
export function chooseInfluence(s,id){if(s.phase!=='influence'||!s.influenceDraft?.options.includes(id))return false;applyInfluence(s,id,s.influenceDraft.side);openInfluence(s);return true;}
export function checkDeathInfluences(s){
 s.eventDeaths||=[];
 const fallen=units(s).filter(u=>u.hp<=0&&!s.eventDeaths.includes(u.id));if(!fallen.length)return false;
 s.eventDeaths.push(...fallen.map(u=>u.id));
 for(const unit of fallen){
  const side=unit.side==='enemy'?'enemy':'player',pool=side==='player'?s.resources:s.enemyResources,resource=unit.bodyResource||unit.affinity;
  if(resource&&pool){pool[resource]=(pool[resource]||0)+1;}
  const survivors=(side==='player'?s.allies:s.enemies).filter(ally=>ally.hp>0&&ally.eloId===unit.eloId);
  s.deathEchoStacks||={player:0,enemy:0};
  const echo=survivors.length>0&&s.deathEchoStacks[side]<3;
  if(echo){s.deathEchoStacks[side]++;for(const ally of survivors)ally.worldDamage=(ally.worldDamage||0)+1;}
  const name=({essence:'Éter',cinza:'Cinza',ruptura:'Ruptura',graca:'Graça',coringa:'Coringa'})[resource]||'Essência';
  const fragments=[resource?`+1 ${name} para ${side==='player'?'seu trio':'a oposição'}`:'',echo?`${survivors.length} aliado(s) do Elo recebem +1 dano (limite +3)`:''].filter(Boolean);
  if(fragments.length)s.log?.unshift(`${unit.name} deixa uma herança: ${fragments.join(' · ')}.`);
 }
 if(s.worldSeed===undefined)return false;
 s.influenceResume=s.phase;s.influenceQueue=fallen.map(u=>({side:u.side,reason:`${u.name} caiu`,fallenId:u.id}));openInfluence(s);return s.phase==='influence';
}

export function influenceValue(e,list){
 const eligible=influenceTargets(e,list),v=e.effect;
 return eligible.reduce((score,u)=>score+(v.damage||0)*1.4+(v.maxHp||0)*.25+Math.min(80-u.shield,v.shield||0)*.4+(v.armor||0)*3+(v.regeneration||0)*3+(v.heal||0)*(techniques(u).some(predicates.healer)?.8:0)+(v.shieldPower||0)*(techniques(u).some(predicates.guardian)?.8:0)+(v.affliction||0)*2+(v.lifesteal||0)*30+(v.firstStrike||0)*.65+['woundedPower','markedPower','afflictedPower','executePower','shieldedPower','controlPower','chargePower','evolvedPower','lastStandPower','counterPower'].reduce((n,key)=>n+(v[key]||0)*.75,0)+(v.supportShield||0)*.45+(v.shiftShield||0)*.45+(v.killShield||0)*.35+(v.defenseHeal||0)*.8+(v.charge||0)*1.5+(v.supportCharge||0)*3,0)+(eligible.length&&v.essence?Object.values(v.essence).reduce((a,b)=>a+b,0)*5:0);
}

