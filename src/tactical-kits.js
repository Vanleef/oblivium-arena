// Deliberately reviewed pilot kits. The full roster is not automatically remapped.
export const tacticalRoster=Object.freeze(['o-acougueiro','a-viuva-escarlate','o-escudo-vivo','o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde','nilo','naomi','kael','diana','a-mae-rubra','o-soberano-quebrado','o-colecionador-de-cabecas','vaas','a-regente-de-cinzas','a-juiza-de-ferro','o-carrasco-sem-rosto']);
export const patternNames=Object.freeze({self:'Pessoal',cell:'Uma célula',line:'Frente · 2 células',cross:'Cruz',square:'Área 3×3',x:'Diagonal em X'});
export function tacticalSpec(actor,ability){
 if(ability.target==='self')return {pattern:'self',range:0,priority:1,limit:1,vision:false};
 const support=['ally','friendly','team'].includes(ability.target);
 if(ability.target==='team')return {pattern:'cross',range:2,priority:1,limit:3,vision:true};
 if(ability.target==='all-enemies')return {pattern:'square',range:3,priority:2,limit:3,vision:true};
 if(support)return {pattern:'cell',range:3,priority:1,limit:1,vision:true};
 if((actor.sourceId||actor.id)==='o-acougueiro')return {pattern:'line',range:2,length:2,priority:2,limit:1,vision:true};
 return {pattern:'cell',range:(actor.sourceId||actor.id)==='o-odio-encarnado'?2:3,priority:ability.damage||ability.dot||ability.dots?2:1,limit:1,vision:true};
}
export const priorityNames=Object.freeze(['Movimento','Preparação / Defesa','Ofensiva']);
