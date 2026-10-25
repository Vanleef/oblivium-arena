import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {characters} from '../src/data.js';
import {createFinalBoss} from '../src/final-boss.js';

test('as 30 artes das transformações têm conteúdo íntegro e cobrem os retratos e técnicas referenciados',()=>{
 const root=new URL('../',import.meta.url),manifest=JSON.parse(readFileSync(new URL('docs/BODY_FORMS_20261023.json',root),'utf8'));
 assert.equal(manifest.assets.length,30);const paths=new Set();
 for(const a of manifest.assets){const data=readFileSync(new URL(a.path,root));assert.ok(data.length>1000,a.path);assert.equal(data.length,a.bytes,a.path);assert.equal(data.toString('ascii',0,4),'RIFF',a.path);assert.equal(data.toString('ascii',8,12),'WEBP',a.path);assert.equal(createHash('sha256').update(data).digest('hex'),a.sha256,a.path);paths.add('/'+a.path);}
 for(const c of characters.filter(c=>c.bodyForms)){
  for(const body of c.bodyForms)assert.ok(paths.has(body.portrait),body.portrait);
  for(const skill of c.abilities.flatMap(a=>[a,...(a.forms||[])]))if(skill.art?.includes('/body-forms-20261023/'))assert.ok(paths.has(skill.art),skill.art);
 }
});

test('as artes das formas de O Fim mantêm hashes íntegros e cobrem os kits ativos',()=>{
 const root=new URL('../',import.meta.url),previous=JSON.parse(readFileSync(new URL('docs/ART_O_FIM_DISTINCT_20261024.json',root),'utf8')),current=JSON.parse(readFileSync(new URL('docs/ART_O_FIM_COHESIVE_20261024.json',root),'utf8')),transformed=JSON.parse(readFileSync(new URL('docs/ART_O_FIM_TRANSFORMED_20261025.json',root),'utf8')),ivory=JSON.parse(readFileSync(new URL('docs/ART_O_FIM_IVORY_DETAILS_20261025.json',root),'utf8')),original=JSON.parse(readFileSync(new URL('docs/ART_O_FIM_CROWNLESS_ORIGINAL_20261025.json',root),'utf8'));
 assert.equal(previous.assets.length,12);assert.equal(current.assets.length,8);assert.equal(transformed.assets.length,8);assert.equal(ivory.assets.length,8);assert.equal(original.assets.length,2);const paths=new Set();
 for(const asset of [...previous.assets,...current.assets,...transformed.assets,...ivory.assets,...original.assets]){
  const data=readFileSync(new URL(`../${asset.path}`,import.meta.url));
  assert.ok(data.length>1000,asset.path);assert.equal(data.length,asset.bytes,asset.path);
  assert.equal(data.toString('ascii',0,4),'RIFF',asset.path);assert.equal(data.toString('ascii',8,12),'WEBP',asset.path);
  assert.equal(createHash('sha256').update(data).digest('hex'),asset.sha256,asset.path);paths.add('/'+asset.path);
 }
 const boss=createFinalBoss();
 assert.ok(paths.has(boss.portrait),boss.portrait);
 for(const form of boss.bodyForms)assert.ok(paths.has(form.portrait),form.portrait);
 assert.ok(paths.has(boss.abilities.find(ability=>ability.id==='despertar').art));
 for(const ability of boss.abilities.flatMap(ability=>[ability,...(ability.forms||[])]))if(ability.art?.includes('/body-forms-distinct-20261024/')||ability.art?.includes('/body-forms-cohesive-20261024/')||ability.art?.includes('/body-forms-transformed-20261025/')||ability.art?.includes('/body-forms-ivory-20261025/'))assert.ok(paths.has(ability.art),ability.art);
});
