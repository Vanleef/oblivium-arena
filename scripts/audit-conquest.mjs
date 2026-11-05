import {mkdir,writeFile} from 'node:fs/promises';
import {characters} from '../src/data.js';
import {conquestTechnique,conquestPassive} from '../src/conquest-techniques.js';
import {fortressCooldown} from '../src/tactical-combat.js';
import {tacticalClipCoverage} from '../src/tactical-animation-coverage.js';
import {tacticalSpec} from '../src/tactical-kits.js';
import {tacticalSpriteAtlases,tacticalSkillAtlases} from '../src/tactical-sprites.js';
const entries=characters.map(actor=>({id:actor.id,name:actor.name,baseAtlas:Boolean(tacticalSpriteAtlases[actor.id]),passive:conquestPassive(actor.passive),techniques:actor.abilities.flatMap(base=>[base,...base.forms||[]].map(form=>{
 const raw={...base,...form},ability=conquestTechnique(raw);
 const {forms,_formRoot,...effective}=ability;
 return {id:base.id,form:form.formKey||'base',name:ability.name,area:tacticalSpec(actor,raw),cooldown:fortressCooldown(ability),...tacticalClipCoverage(actor,base,form),effective};
}))}));
const summary={characters:entries.length,techniquesAndForms:entries.reduce((n,c)=>n+c.techniques.length,0),baseAtlases:entries.filter(c=>c.baseAtlas).length,missingBaseAtlases:entries.filter(c=>!c.baseAtlas).map(c=>c.id)};
await mkdir(new URL('../docs/',import.meta.url),{recursive:true});
await writeFile(new URL('../docs/CONQUEST_BALANCE.json',import.meta.url),JSON.stringify({summary,characters:entries},null,2)+'\n');
await writeFile(new URL('../docs/CONQUEST_BALANCE.md',import.meta.url),`# Conquista — balanceamento e cobertura\n\n${summary.characters} personagens e ${summary.techniquesAndForms} técnicas/formas passam pelo adaptador sem custo de Essência. Valores são uma base de balanceamento, não validação competitiva com jogadores. O ataque básico tem 12 de dano e recarga zero. Técnicas de controle têm no mínimo 3 rodadas de recarga; invulnerabilidade, 4. Efeitos secundários, regeneração, respostas, escalonamento e roubo de vida têm orçamentos próprios.\n\nA postura base é horizontal e aponta para longe da última fortaleza alcançada. A animação pode virar durante uma técnica e restaura a postura na recuperação.\n\n${summary.baseAtlases}/${summary.characters} personagens têm atlas base. Atlas base por slot e VFX compartilhados não equivalem a animações exclusivas para todas as formas, passivas e habilidades. O trabalho visual está em andamento.\n\n| Personagem | Atlas base | Técnicas/formas |\n| --- | --- | --- |\n`+entries.map(c=>`| ${c.name} | ${c.baseAtlas?'Conectado':'Pendente'} | ${c.techniques.length} |`).join('\n')+'\n');
console.log({characters:summary.characters,techniquesAndForms:summary.techniquesAndForms,baseAtlases:summary.baseAtlases});
