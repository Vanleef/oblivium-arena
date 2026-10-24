import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {characters} from '../src/data.js';
import {createFinalBoss} from '../src/final-boss.js';

test('as 19 artes das transformações têm conteúdo íntegro e cobrem os retratos e técnicas referenciados',()=>{
 const root=new URL('../',import.meta.url),manifest=JSON.parse(readFileSync(new URL('docs/BODY_FORMS_20261023.json',root),'utf8'));
 assert.equal(manifest.assets.length,19);const paths=new Set();
 for(const a of manifest.assets){const data=readFileSync(new URL(a.path,root));assert.ok(data.length>1000,a.path);assert.equal(data.length,a.bytes,a.path);assert.equal(data.toString('ascii',0,4),'RIFF',a.path);assert.equal(data.toString('ascii',8,12),'WEBP',a.path);assert.equal(createHash('sha256').update(data).digest('hex'),a.sha256,a.path);paths.add('/'+a.path);}
 for(const c of [createFinalBoss(),...characters.filter(c=>c.bodyForms)]){
  for(const body of c.bodyForms)assert.ok(paths.has(body.portrait),body.portrait);
  for(const skill of c.abilities.flatMap(a=>[a,...(a.forms||[])]))if(skill.art?.includes('/body-forms-20261023/'))assert.ok(paths.has(skill.art),skill.art);
 }
});
