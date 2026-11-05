// Convert resource-manipulation on direct casts into effects usable on the grid.
function convertTechnique(ability){
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


// Values assume 100 starting Health and one technique after each movement.
export function conquestTechnique(ability){
 const converted=convertTechnique(ability);
 if(ability.id==='fortress-basic')return converted;
 const team=['team','all-enemies'].includes(converted.target);
 const capDamage=converted.stun||converted.sealAttack?18:team?20:26;
 const result={...converted};
 for(const [key,cap] of Object.entries({damage:capDamage,heal:team?14:22,shield:team?12:20,counter:20,boost:6,reduce:8,perChargeDamage:4,perChargeHeal:4,conquestWard:8})){
  if(result[key]>cap)result[key]=cap;
 }
 for(const key of ['stun','sealAttack','sealSupport','invulnerable'])if(result[key]>1)result[key]=1;
 if(result.combo)result.combo={...result.combo,bonusDamage:Math.min(result.combo.bonusDamage||0,8)};
 const balanceDot=dot=>({...dot,damage:Math.min(dot.damage||0,4),turns:Math.min(dot.turns||1,2)});
 if(result.dot)result.dot=balanceDot(result.dot);
 if(result.dots)result.dots=result.dots.map(balanceDot);
 const descriptions=[
  result.damage&&('Causa '+result.damage+' de dano '+({physical:'físico',energy:'de energia',piercing:'perfurante',affliction:'de aflição'}[result.damageType]||'')+'.'),
  result.heal&&('Recupera '+result.heal+' de Vida.'),
  result.shield&&('Concede '+result.shield+' de Escudo.'),
  result.conquestWard&&('O usuário recebe '+result.conquestWard+' de Escudo ao acertar.'),
  result.stripShield&&('Remove até '+result.stripShield+' de Escudo.'),
  result.stun&&'Atordoa por 1 rodada.',
  result.invulnerable&&'Invulnerável por 1 rodada.',
  result.counter&&('Prepara contra-ataque de '+result.counter+' de dano.'),
  result.reduce&&('Reduz o dano recebido em '+result.reduce+'.'),
  result.boost&&('Concede +'+result.boost+' de dano temporário.'),
  result.expose&&'Aplica Exposto.',
  result.mark&&'Aplica a marca desta técnica.',
  result.cleanse&&'Remove efeitos negativos.',
  result.weaken&&'Aplica Enfraquecido.',
  result.sealAttack&&'Sela ataques por 1 rodada.',
  result.sealSupport&&'Sela apoios por 1 rodada.',
  ...[result.dot,...result.dots||[]].filter(Boolean).map(dot=>(dot.tag||'Aflição')+': '+dot.damage+' de dano por '+dot.turns+' rodada(s).'),
  result.combo?.bonusDamage&&('Bônus de preparação: +'+result.combo.bonusDamage+' de dano.'),
  result.shift?.length&&'Pode alterar a forma das técnicas ao cumprir sua preparação.'
 ].filter(Boolean);
 result.description=descriptions.length?descriptions.join(' '):converted.description;
 return result;
}
