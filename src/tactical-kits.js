import {characters,worldLeaders} from './data.js';
import {tacticalKitWave2} from './tactical-kits-wave2.js';
// Explicit spatial review: only these kits enter the tactical roster.
// Form overrides are keyed by slot/form; combat stats and costs remain canonical.
const shapes={
 personal:{pattern:'self',range:0,limit:1,vision:false},
 touch:{pattern:'cell',range:1},reach:{pattern:'cell',range:2},ranged:{pattern:'cell',range:3},
 blade:{pattern:'line',range:2,length:2},lance:{pattern:'line',range:3,length:3},
 cross:{pattern:'cross',range:2},square:{pattern:'square',range:3},nearSquare:{pattern:'square',range:1},
 diagonal:{pattern:'x',range:2},cone:{pattern:'cone',range:2,length:2},sweep:{pattern:'ring',range:0}
};
const kit=(slots,forms={},displacements={})=>({slots:Object.fromEntries(slots.map((shape,i)=>[['impulso','tecnica','voto'][i]||'tecnica-'+(i+1),shape])),forms,displacements});
const initialKitProfiles={
 'o-acougueiro':kit(['blade','blade','blade'],{'impulso/reopen':'blade'}),
 'a-viuva-escarlate':kit(['ranged','personal','reach'],{'impulso/revenge':'ranged'}),
 'o-escudo-vivo':kit(['reach','reach','reach'],{'impulso/advance':'blade'},{'impulso/advance':'push'}),
 'o-passo-interrompido':kit(['ranged','reach','reach'],{'impulso/next':'reach','impulso/previous':'ranged'}),
 'o-odio-encarnado':kit(['reach','personal','reach'],{'impulso/rage':'touch','voto/eruption':'reach'},{'impulso/rage':'push'}),
 'a-arquiteta-verde':kit(['ranged','cross','ranged'],{'impulso/beam':'ranged','voto/collapse':'square'}),
 nilo:kit(['reach','ranged','reach']),naomi:kit(['ranged','reach','cross']),kael:kit(['blade','blade','reach']),diana:kit(['ranged','ranged','reach']),
 'a-mae-rubra':kit(['ranged','reach','cross']),
 'o-soberano-quebrado':kit(['ranged','reach','personal'],{'impulso/edict':'cross','tecnica/edict':'square','voto/edict':'cross'}),
 'o-colecionador-de-cabecas':kit(['ranged','reach','reach'],{'voto/empty':'touch'}),
 vaas:kit(['ranged','ranged','personal']),
 'a-regente-de-cinzas':kit(['reach','cross','reach']),
 'a-juiza-de-ferro':kit(['ranged','reach','blade']),
 'o-carrasco-sem-rosto':kit(['ranged','touch','reach']),
 'a-mascara-dupla':kit(['reach','personal','reach'],{'impulso/other':'ranged'}),
 'o-herdeiro-cativo':kit(['reach','personal','touch'],{},{voto:'push'}),
 'gemeos-do-cutelo':kit(['blade','blade','sweep'],{'tecnica/cross':'blade'}),
 'o-trono-vazio':kit(['ranged','ranged','cross']),
 'o-principe-das-correntes':kit(['ranged','reach','reach'],{'impulso/drag':'reach'},{tecnica:'pull'}),
 'o-sussurro':kit(['ranged','ranged','ranged']),
 'o-tecelao-de-mentiras':kit(['ranged','diagonal','ranged'],{'tecnica/unweave':'cross'}),
 'a-boca-de-vidro':kit(['lance','ranged','cone']),
 'o-falso-profeta':kit(['ranged','personal','ranged'],{'tecnica/confess':'personal'}),
 'o-corretor-de-memorias':kit(['ranged','reach','ranged']),
 'o-incendiario':kit(['ranged','cross','reach']),
 'a-brasa-eterna':kit(['ranged','reach','reach'],{'impulso/smother':'reach','tecnica/smother':'cone','voto/smother':'reach'}),
 'o-filho-da-cinza':kit(['ranged','personal','reach'],{'impulso/rebirth':'reach'}),
 'a-pira-errante':kit(['ranged','personal','diagonal'],{'impulso/reply':'ranged'}),
 'o-coracao-em-furia':kit(['touch','touch','touch'],{},{voto:'push'}),
 'o-devorador':kit(['touch','reach','touch'],{'impulso/starved':'reach'},{voto:'pull'}),
 'a-mao-que-toma':kit(['reach','personal','reach'],{'tecnica/open':'personal'}),
 'o-estomago-sem-fundo':kit(['touch','personal','touch']),
 'a-senhora-do-ultimo-pao':kit(['ranged','cross','reach']),
 'o-credor':kit(['ranged','ranged','reach']),
 'a-balanca-vazia':kit(['ranged','ranged','cross']),
 'o-apodrecido':kit(['touch','reach','touch']),
 'a-praga-andante':kit(['ranged','cross','reach'],{'tecnica/fever':'reach'})
};
export const tacticalKitProfiles=Object.freeze({...initialKitProfiles,...Object.fromEntries(Object.entries(tacticalKitWave2).map(([id,args])=>[id,kit(...args)]))});
export const tacticalOpponentRoster=Object.freeze(Object.keys(tacticalKitProfiles));
const leaderIds=new Set(Object.values(worldLeaders).map(leader=>leader.rosterId));
export const tacticalRoster=Object.freeze(characters.filter(c=>tacticalKitProfiles[c.id]&&!c.npcOnly&&!leaderIds.has(c.id)).map(c=>c.id));
export const patternNames=Object.freeze({self:'Pessoal',cell:'Uma célula',line:'Frente',cross:'Cruz',square:'Área 3×3',x:'Diagonal em X',cone:'Cone frontal',ring:'Ao redor'});
export const priorityNames=Object.freeze(['Movimento','Preparação / Defesa','Ofensiva']);
export function tacticalSpec(actor,ability){
 if(ability.target==='self')return {...shapes.personal,priority:1};
 const profile=tacticalKitProfiles[actor.sourceId||actor.id];
 if(!profile)throw Error('Kit ainda não adaptado ao tabuleiro: '+(actor.sourceId||actor.id));
 const key=ability.id+'/'+(ability.formKey||'base'),shape=profile.forms[key]||profile.slots[ability.id];
 if(!shapes[shape])throw Error('Área tática ausente: '+(actor.sourceId||actor.id)+'/'+key);
 const friendly=['ally','friendly','team'].includes(ability.target),multiple=['team','all-enemies'].includes(ability.target);
 const displacement=profile.displacements[key]||((ability.formKey||'base')==='base'?profile.displacements[ability.id]:null);
 return {vision:true,limit:multiple?3:1,priority:friendly?1:ability.damage||ability.dot||ability.dots?2:1,...shapes[shape],...(displacement?{displacement:{kind:displacement,distance:1}}:{})};
}
export function tacticalPatternLabel(spec){return spec.pattern==='line'?patternNames.line+' · '+spec.length+' células':patternNames[spec.pattern];}
export function tacticalRuleText(actor,ability){
 const spec=tacticalSpec(actor,ability);
 return (spec.pattern==='self'?'Pessoal':tacticalPatternLabel(spec)+' · alcance '+spec.range+' · até '+spec.limit+' alvo(s) na área')+(spec.displacement?' · '+(spec.displacement.kind==='pull'?'Puxa':'Empurra')+' 1 casa; para diante de obstáculos, bordas e ocupantes.':'');
}
