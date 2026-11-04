// Convert resource-manipulation on direct casts into effects usable on the grid.
export function conquestTechnique(ability){
 const disruption=ability.steal||ability.drain||0;
 const generation=ability.generateEssence?.resource?ability.generateEssence.amount??1:0;
 const conversion=ability.convertEssence?.amount??0;
 if(!disruption&&!generation&&!conversion)return ability;
 const strip=3*disruption,ward=3*(ability.steal||0)+4*generation+3*conversion;
 const description=[
  ability.damage?('Dano base: '+ability.damage+'.'):'',
  strip?('Remove até '+strip+' de Escudo de cada alvo.'):'',
  ward?('Concede '+ward+' de Escudo '+(['self','team','ally','friendly'].includes(ability.target)?'a cada aliado atingido.':'ao usuário.') ):'',
  ability.mark?'Aplica a marca da técnica.':'',
  ability.expose?'Aplica Exposto.':''
 ].filter(Boolean).join(' ');
 return {...ability,description,steal:0,drain:0,generateEssence:null,convertEssence:null,
  stripShield:(ability.stripShield||0)+strip,shield:(ability.shield||0)+ward};
}
