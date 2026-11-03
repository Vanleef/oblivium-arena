import {createTacticalEnvironment} from '../src/tactical-environment.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {characters,characterById} from '../src/data.js';
import {tacticalRoster,tacticalSpec,tacticalRuleText} from '../src/tactical-kits.js';
import {createTacticalBattle,previewTacticalPlan,submitTacticalPlan,resolveTacticalRound,tacticalArea} from '../src/tactical-combat.js';
import {patternCells,mirrorCell,mirrorDirection,cellKey} from '../src/tactical-board.js';
import {explainTacticalPlan,tacticalResolutionFeedback} from '../src/tactical-insight.js';
import {planTacticalAI} from '../src/tactical-ai.js';
const support=['a-viuva-escarlate','o-escudo-vivo'],foes=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
function setup(id){const s=createTacticalBattle([id,...support],foes);for(const u of [...s.allies,...s.enemies])u.passive=null;for(const key of ['resources','enemyResources'])s[key]={essence:20,cinza:20,graca:20,ruptura:20};s.tactical.positions[s.allies[0].id]={x:0,y:1};s.tactical.positions[s.enemies[0].id]={x:2,y:1};return s;}
const skill=(actorId,abilityId,anchor,formKey='base')=>({type:'skill',actorId,abilityId,anchor,formKey,orientation:[1,0]});
function round(s,own,enemy=[]){assert.equal(submitTacticalPlan(s,'player',own).ok,true);assert.equal(submitTacticalPlan(s,'enemy',enemy).ok,true);return resolveTacticalRound(s);}
test('40 kits e suas formas têm áreas explícitas sem alterar custos, recargas ou passivas canônicas',()=>{
 assert.equal(tacticalRoster.length,40);const before=JSON.stringify(characters);let count=0;
 for(const id of tacticalRoster){const c=characterById[id];assert.ok(c,id);for(const a of c.abilities)for(const f of [a,...(a.forms||[])]){
  const spec=tacticalSpec(c,f);assert.ok(Number.isInteger(spec.range)&&spec.range>=0&&spec.range<=4,id+'/'+f.name);
  assert.ok([1,3].includes(spec.limit));assert.match(tacticalRuleText(c,f),/Pessoal|alcance/);
  if(f.target==='self'){assert.equal(spec.range,0);assert.equal(spec.pattern,'self');}
  const enemy={...c,sourceId:id,id:'rival-'+id};assert.deepEqual(tacticalSpec(enemy,f),spec);count++;
 }}
 assert.ok(count>180);assert.equal(JSON.stringify(characters),before);
});
test('variantes que mudam de alvo recebem a geometria da forma ativa',()=>{
 const c=characterById['o-tecelao-de-mentiras'],base=c.abilities.find(a=>a.id==='tecnica'),form=base.forms.find(a=>a.formKey==='unweave');
 assert.equal(tacticalSpec(c,base).pattern,'x');assert.equal(tacticalSpec(c,form).pattern,'cross');
 const d=characterById['o-soberano-quebrado'],v=d.abilities.find(a=>a.id==='voto');assert.equal(tacticalSpec(d,v).pattern,'self');assert.equal(tacticalSpec(d,v.forms[0]).pattern,'cross');
});
test('cone e varredura mantêm espelhamento e alcance inclusive na diagonal',()=>{
 const origin={x:2,y:2};for(const direction of [[1,0],[1,1],[-1,0],[0,-1]]){
  const points=patternCells('cone',origin,origin,direction,2);assert.equal(new Set(points.map(cellKey)).size,points.length);
  assert.ok(points.every(p=>Math.max(Math.abs(p.x-origin.x),Math.abs(p.y-origin.y))<=2));
  const reversed=patternCells('cone',mirrorCell(origin),mirrorCell(origin),mirrorDirection(direction),2).map(cellKey).sort();
  assert.deepEqual(points.map(p=>cellKey(mirrorCell(p))).sort(),reversed);
 }
 assert.equal(patternCells('ring',origin,origin).length,8);assert.ok(!patternCells('ring',origin,origin).some(p=>p.x===2&&p.y===2));
});
test('puxão prepara a segunda ação sem consultar a fila rival e paga as duas técnicas',()=>{
 const s=setup('o-principe-das-correntes'),u=s.allies[0],e=s.enemies[0];
 const plan=[skill(u.id,'tecnica',{x:2,y:1}),skill(u.id,'voto',{x:1,y:1})],before=JSON.stringify(s),p=previewTacticalPlan(s,'player',plan);
 assert.equal(p.ok,true);assert.deepEqual(p.projection.tactical.positions[e.id],{x:1,y:1});assert.equal(JSON.stringify(s),before);
 assert.ok(p.actions[0].previewDisplacements[0].moved);assert.ok(explainTacticalPlan(s,'player',plan)[1].combos.some(n=>n.includes('reposicionado por')));const result=round(s,plan),drag=result.events.find(e=>e.type==='skill');
 assert.deepEqual(s.tactical.positions[e.id],{x:1,y:1});assert.ok(tacticalResolutionFeedback(drag).some(n=>n.includes('puxado de C2 para B2')));
 assert.equal(result.events.filter(e=>e.type==='skill'&&e.side==='player').length,2);
});
test('puxão não atravessa ocupantes, obstáculos, Invulnerável nem contra-ataque',()=>{
 for(const mode of ['occupied','obstacle','invulnerable','counter']){
  const s=setup('o-principe-das-correntes'),u=s.allies[0],e=s.enemies[0];
  if(mode==='occupied')s.tactical.positions[s.allies[1].id]={x:1,y:1};
  // Put the wall behind the target for a push; a wall between actor and target blocks the attack itself.
  if(mode==='obstacle'){s.tactical.positions[u.id]={x:2,y:2};s.tactical.positions[e.id]={x:1,y:1};s.tactical.obstacles=[{x:2,y:1},{x:1,y:2}];const spec=tacticalSpec(u,u.abilities.find(a=>a.id==='tecnica'));assert.deepEqual(tacticalArea(s,u,u.abilities.find(a=>a.id==='tecnica'),{x:1,y:1},[-1,-1]),[]);continue;}
  if(mode==='invulnerable')e.invulnerable=1;if(mode==='counter'){e.counter=10;e.counterFilter=['physical'];}
  const result=round(s,[skill(u.id,'tecnica',{x:2,y:1})]);assert.deepEqual(s.tactical.positions[e.id],{x:2,y:1},mode);
  if(mode==='counter')assert.ok(result.events.find(e=>e.type==='skill').reactions.length);
 }
});
test('varredura dos Gêmeos atinge apenas vizinhos e a IA consegue selecionar a área pessoal',()=>{
 const s=setup('gemeos-do-cutelo'),u=s.allies[0];s.tactical.positions[u.id]={x:2,y:2};
 s.tactical.positions[s.enemies[0].id]={x:2,y:1};s.tactical.positions[s.enemies[1].id]={x:3,y:2};s.tactical.positions[s.enemies[2].id]={x:4,y:4};
 const result=round(s,[skill(u.id,'voto',{x:2,y:2})]);const hit=result.events.find(e=>e.type==='skill');
 assert.equal(hit.targets.length,2);assert.equal(hit.after.enemies[2].hp,100);assert.ok(hit.after.enemies[0].hp<100);
 const ai=setup('a-boca-de-vidro');assert.equal(previewTacticalPlan(ai,'player',planTacticalAI(ai,'player')).ok,true);
});
test('todo o catálogo tem IDs únicos e despertar permanece reservado à defesa',()=>{
 for(const c of characters){assert.equal(new Set(c.abilities.map(a=>a.id)).size,c.abilities.length,c.id);const defense=c.abilities.find(a=>a.id==='despertar');assert.equal(defense.target,'self',c.id);assert.ok(defense.defense,c.id);}
 const advanced=characterById['nilo-cinza-final'];assert.ok(advanced.abilities.some(a=>a.id==='tecnica-4'));assert.ok(advanced.abilities.find(a=>a.id==='despertar').invulnerable);
});

test('empurrão para no obstáculo atrás da vítima sem cancelar o dano',()=>{
 const s=setup('o-herdeiro-cativo'),u=s.allies[0],e=s.enemies[0];s.tactical.positions[u.id]={x:2,y:1};s.tactical.positions[e.id]={x:3,y:1};s.tactical.positions[s.enemies[2].id]={x:4,y:4};s.tactical.obstacles=[{x:4,y:1}];
 const out=round(s,[skill(u.id,'voto',{x:3,y:1})]),hit=out.events.find(e=>e.type==='skill');
 assert.ok(hit.after.enemies[0].hp<100);assert.deepEqual(s.tactical.positions[e.id],{x:3,y:1});assert.equal(hit.displacements[0].moved,false);
});

test('empurrar para C3 altera o efeito ambiental apenas no fim da rodada',()=>{
 const s=setup('o-herdeiro-cativo'),u=s.allies[0],e=s.enemies[0];s.tactical.environment=createTacticalEnvironment('inferno');s.tactical.positions[u.id]={x:2,y:0};
 const result=round(s,[skill(u.id,'voto',{x:2,y:1})]),hit=result.events.find(e=>e.type==='skill'),environment=result.events.find(e=>e.type==='environment');
 assert.deepEqual(hit.after.positions[e.id],{x:2,y:2});assert.equal(environment.after.enemies[0].hp,hit.after.enemies[0].hp-6);
});
