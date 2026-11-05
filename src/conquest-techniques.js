// Convert resource-manipulation on direct casts into effects usable on the grid.
export function conquestTechnique(ability){
 const disruption=ability.steal||ability.drain||0;
 const generation=ability.generateEssence?.resource?ability.generateEssence.amount??1:0;
 const conversion=ability.convertEssence?.amount??0;
 if(!disruption&&!generation&&!conversion)return ability;
 const strip=3*disruption,ward=3*(ability.steal||0)+4*generation+3*conversion;
 const support=['self','team','ally','friendly'].includes(ability.target);
 const description=[
  ability.damage?('Dano base: '+ability.damage+'.'):'',
  ability.heal?('Recupera '+ability.heal+' de Vida.'):'',
  ability.stun?('Atordoa por '+ability.stun+' rodada(s).'):'',
  ability.counter?('Prepara contra-ataque de '+ability.counter+' de dano.'):'',
  strip?('Remove até '+strip+' de Escudo de cada alvo.'):'',
  ward?('Concede '+ward+' de Escudo '+(support?'a cada aliado atingido.':'ao usuário.') ):'',
  ability.mark?'Aplica a marca da técnica.':'',
  ability.expose?'Aplica Exposto.':''
 ].filter(Boolean).join(' ');
 return {...ability,description,steal:0,drain:0,generateEssence:null,convertEssence:null,
  stripShield:(ability.stripShield||0)+strip,shield:(ability.shield||0)+(support?ward:0),conquestWard:support?0:ward};
}

// Resource-dependent passives retain their trigger and useful effects where possible.
export function conquestPassive(passive){
 if(!passive)return passive;
 const {effect={},trigger}=passive;
 const {spendEssence,generateEssence,convertEssence,drainEssence,stealEssence,trackFourEssences,...effects}=effect;
 const resourceTrigger=['essenceSpent','enemyEssenceSpent'].includes(trigger);
 if(!resourceTrigger&&!passive.spendResource&&!passive.ifResource&&!passive.enemyResource&&
    !spendEssence&&!generateEssence&&!convertEssence&&!drainEssence&&!stealEssence&&!trackFourEssences)return passive;
 const nextTrigger=trigger==='enemyEssenceSpent'?'turnStart':trigger==='essenceSpent'?'techniqueHit':trigger;
 if(generateEssence||convertEssence||stealEssence||drainEssence)effects.shield=(effects.shield||0)+4;
 if(trackFourEssences)effects.gainCharge=(effects.gainCharge||0)+1;
 if(!Object.keys(effects).length)effects.shield=4;
 const timing={turnStart:'No início da rodada',techniqueHit:'Ao acertar com uma técnica equipada',attack:'Ao atacar',kill:'Ao eliminar',counter:'Ao contra-atacar',formChange:'Ao mudar de forma',statusApplied:'Ao aplicar um efeito negativo'}[nextTrigger]||'Ao ativar a passiva';
 const benefits=[effects.shield&&('ganha '+effects.shield+' de Escudo'),effects.heal&&('recupera '+effects.heal+' de Vida'),effects.gainCharge&&('ganha '+effects.gainCharge+' de Carga')].filter(Boolean);
 return {...passive,trigger:nextTrigger,spendResource:null,ifResource:null,enemyResource:null,minSpent:null,effect:effects,
  description:timing+(passive.hpAtMost!=null?' com até '+passive.hpAtMost+' de Vida':'')+', '+(benefits.join(' e ')||'ativa seu efeito de combate')+'. '+(passive.oncePerBattle?'Uma vez por combate.':passive.repeatPerRound?'':'Uma vez por rodada.')};
}
