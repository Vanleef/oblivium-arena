import {elements,surfaceAt} from './tactical-elements.js';

const timed=[
 ['frozen','❄','Congelado','O corpo está coberto de gelo.'],
 ['stunned','✦','Atordoado','Impede a ativação.'],
 ['weakened','↓','Enfraquecido','Reduz o dano causado.'],
 ['sealAttack','⊘','Ataque selado','Bloqueia técnicas ofensivas.'],
 ['sealSupport','⊘','Apoio selado','Bloqueia técnicas de apoio.'],
 ['healingBlock','⊖','Cura bloqueada','Impede a recuperação de Vida.']
];
const boons=[
 ['shield','◇','Escudo','Absorve dano.'],
 ['invulnerable','⬡','Invulnerável','Protege contra a maioria dos ataques.'],
 ['counter','↩','Contra-ataque','Reage ao receber um ataque compatível.'],
 ['reduction','⬟','Redução de dano','Reduz o dano direto recebido.'],
 ['boost','↑','Dano aumentado','Aumenta o dano direto causado.'],
 ['regeneration','✚','Regeneração','Recupera Vida no início da rodada.']
];

export function tacticalStatuses(unit,battle){
 if(!unit||unit.hp<=0)return [];
 const effects=[];
 const add=(id,kind,icon,label,detail,value)=>effects.push({id,kind,icon,label,detail,value});
 for(const [id,icon,label,detail] of timed)if(unit[id])add(id,'debuff',icon,label,detail,unit[id]+'T');
 if(unit.exposed)add('exposed','debuff','◎','Exposto','Aumenta o dano direto recebido.');
 for(const [id,icon,label,detail] of boons)if(unit[id])add(id,'buff',icon,label,detail,id==='invulnerable'?null:unit[id]);
 for(const [id,mark] of Object.entries(unit.marks||{}))if(mark.turns>0)add('mark:'+id,'debuff','⌖',mark.label||'Marcado','Pode ativar efeitos adicionais.',mark.turns+'T');
 for(const [index,dot] of (unit.dots||[]).entries())if(dot.turns>0)add('dot:'+(dot.skillId||dot.tag||index)+':'+(dot.sourceId||''),'debuff','♨',dot.name||dot.tag||'Aflição','Dano periódico.',dot.turns+'T');
 const surface=surfaceAt(battle||{},battle?.tactical?.positions?.[unit.id]);
 if(surface){const element=elements[surface.element];add('surface:'+surface.element,'terrain','◈',element.surface,element.hint);}
 return effects;
}
