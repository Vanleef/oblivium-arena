import {writeFile,stat} from 'node:fs/promises';
import {characters} from '../src/data.js';
import {tacticalRoster} from '../src/tactical-kits.js';
import {tacticalSpriteFrame,tacticalSkillAtlases} from '../src/tactical-sprites.js';
import {tacticalAnimationFamily} from '../src/tactical-animation.js';
import {tacticalEffectSignatures} from '../src/tactical-effects-layer.js';
import {tacticalVfxRow} from '../src/tactical-vfx.js';

const rows=characters.map(c=>({id:c.id,name:c.name,selectable:tacticalRoster.includes(c.id),baseAtlas:Boolean(tacticalSpriteFrame(c)),
 skills:c.abilities.flatMap(a=>[a,...(a.forms||[]).filter(f=>(f.formKey||'base')!=='base')].map(f=>({id:a.id,name:f.name,form:f.formKey||'base',
  dedicatedAtlas:Boolean(tacticalSkillAtlases[`${c.id}/${a.id}/${f.formKey||'base'}`]),mappedAtlas:Boolean(tacticalSpriteFrame(c,{type:'skill',abilityId:a.id,formKey:f.formKey||'base'})),
  sharedVfx:tacticalVfxRow(tacticalAnimationFamily(f))!==null,customVfx:Boolean(tacticalEffectSignatures[c.id])})))}));
for(const c of characters){const frame=tacticalSpriteFrame(c);if(frame)await stat(new URL('..'+frame.src,import.meta.url));}
await writeFile(new URL('../docs/TACTICAL_ANIMATION_COVERAGE.json',import.meta.url),JSON.stringify(rows,null,2)+'\n');
const summary={characters:rows.length,baseAtlases:rows.filter(r=>r.baseAtlas).length,skillsAndForms:rows.flatMap(r=>r.skills).length,mappedClips:rows.flatMap(r=>r.skills).filter(s=>s.mappedAtlas).length};
await writeFile(new URL('../docs/TACTICAL_ANIMATION_COVERAGE.md',import.meta.url),`# Cobertura de animações táticas\n\n${summary.baseAtlases}/${summary.characters} entradas com atlas base conectado. ${summary.mappedClips}/${summary.skillsAndForms} técnicas e formas com recorte mapeado.\n\nAtlas específicos de habilidade conectados: ${Object.keys(tacticalSkillAtlases).length}. Os demais recortes mapeados usam sequências compartilhadas por slot; não representam validação de animações exclusivas por habilidade. Os VFX são compartilhados por família.\n\n| Personagem | Atlas base | Selecionável no piloto | Recortes mapeados |\n| --- | --- | --- | --- |\n`+rows.map(r=>`| ${r.name} (${r.id}) | ${r.baseAtlas?'Sim':'Pendente'} | ${r.selectable?'Sim':'Não'} | ${r.skills.filter(s=>s.mappedAtlas).length}/${r.skills.length} |`).join('\n')+'\n');
console.log(summary);
