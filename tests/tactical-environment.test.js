import test from 'node:test';
import assert from 'node:assert/strict';
import {createTacticalBattle,previewTacticalPlan,submitTacticalPlan,resolveTacticalRound,tacticalView} from '../src/tactical-combat.js';
import {resolveTacticalEnvironment,tacticalEnvironmentDelta} from '../src/tactical-environment.js';
import {createTacticalRun,advanceTacticalRun} from '../src/tactical-run.js';
import {planTacticalAI} from '../src/tactical-ai.js';
import {sameCell} from '../src/tactical-board.js';
const player=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],enemy=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
function setup(environment){const s=createTacticalBattle(player,enemy,{seed:1,environment});for(const u of [...s.allies,...s.enemies])u.passive=null;return s;}
function round(s,own=[],opponent=[]){assert.equal(submitTacticalPlan(s,'player',own).ok,true);assert.equal(submitTacticalPlan(s,'enemy',opponent).ok,true);return resolveTacticalRound(s);}
test('regra opcional é pública, central e não bloqueia a grade',()=>{
 const plain=setup();assert.equal(plain.tactical.environment,null);assert.ok(!round(plain).events.some(e=>e.type==='environment'));
 const s=setup('inferno');assert.deepEqual(s.tactical.environment.position,{x:2,y:2});assert.equal(tacticalView(s).tactical.environment.id,'inferno');
 assert.throws(()=>setup('inventada'),/ambiental inválida/);
 assert.throws(()=>createTacticalBattle(player,enemy,{environment:'limbo',obstacles:[{x:2,y:2}]}),/ambiental.*obstáculo/);
});
test('brasas usam a posição final depois das duas ações e geram snapshots no replay',()=>{
 const s=setup('inferno'),u=s.allies[0];s.tactical.positions[u.id]={x:1,y:2};u.shield=8;
 const refs=[{type:'move',actorId:u.id,path:[{x:2,y:2}]}],before=JSON.stringify(s);
 const preview=previewTacticalPlan(s,'player',refs);assert.equal(preview.ok,true);assert.equal(preview.projection.allies[0].shield,8);assert.equal(JSON.stringify(s),before);
 const result=round(s,refs),event=result.events.find(e=>e.type==='environment');
 assert.equal(event.before.allies[0].shield,8);assert.equal(event.after.allies[0].shield,2);assert.equal(event.after.allies[0].hp,100);
 assert.ok(result.events.indexOf(event)>result.events.findIndex(e=>e.type==='move'));
 assert.ok(result.events.indexOf(event)<result.events.findIndex(e=>e.type==='effects'));
 const escape=setup('inferno'),v=escape.allies[0];escape.tactical.positions[v.id]={x:1,y:1};
 const out=round(escape,[{type:'move',actorId:v.id,path:[{x:2,y:2}]},{type:'move',actorId:v.id,path:[{x:2,y:1}]}]);assert.equal(out.events.find(e=>e.type==='environment').after.allies[0].hp,100);
});
test('brasas respeitam Invulnerável antes da expiração e podem encerrar o combate',()=>{
 const s=setup('inferno'),u=s.allies[0];s.tactical.positions[u.id]={x:2,y:2};u.invulnerable=1;
 const event=round(s).events.find(e=>e.type==='environment');assert.equal(event.after.allies[0].hp,100);assert.match(event.augmentNotes.join(' '),/Invulnerável/);
 const last=setup('inferno');last.allies.forEach((u,i)=>u.hp=i?0:5);last.tactical.positions[last.allies[0].id]={x:2,y:2};
 const result=round(last);assert.equal(result.finished,true);assert.equal(last.phase,'defeat');assert.ok(!result.events.some(e=>e.type==='effects'));
});
test('santuário respeita Vida máxima, bloqueio de cura e não revive',()=>{
 const s=setup('paraiso'),u=s.allies[0];s.tactical.positions[u.id]={x:2,y:2};u.hp=98;
 resolveTacticalEnvironment(s);assert.equal(u.hp,100);u.hp=70;u.healingBlock=1;resolveTacticalEnvironment(s);assert.equal(u.hp,70);
 u.healingBlock=0;u.hp=0;resolveTacticalEnvironment(s);assert.equal(u.hp,0);
});
test('névoa aplica o mesmo Escudo aos dois lados sem reduzir proteção acima do limite',()=>{
 for(const side of ['allies','enemies']){
  const s=setup('limbo'),u=s[side][0];s.tactical.positions[u.id]={x:2,y:2};u.shield=48;
  assert.deepEqual(tacticalEnvironmentDelta(s,u),{hp:0,shield:2});resolveTacticalEnvironment(s);assert.equal(u.shield,50);
  u.shield=60;resolveTacticalEnvironment(s);assert.equal(u.shield,60);
 }
});
test('ambiente persiste nas três trilhas e na serialização determinística',()=>{
 const s=setup('limbo');s.phase='victory';s.tactical.stage='finished';
 for(const route of ['recovery','risk','discovery']){const next=advanceTacticalRun(createTacticalRun(),s,route);assert.equal(next.environment,'limbo');assert.equal(createTacticalBattle(next.player,next.enemy,next).tactical.environment.id,'limbo');}
 const a=setup('paraiso');a.allies[0].hp=70;a.tactical.positions[a.allies[0].id]={x:2,y:2};const b=JSON.parse(JSON.stringify(a));
 assert.deepEqual(round(a).events,round(b).events);
});
test('IA considera o risco ambiental usando apenas o estado público',()=>{
 const s=setup('inferno'),u=s.enemies[0];u.hp=6;s.tactical.positions[u.id]={x:2,y:2};
 for(const v of s.enemies){for(const a of v.abilities)v.cooldowns[a.id]=99;if(v.id!==u.id)v.stunned=1;}
 const before=JSON.stringify(s),plan=planTacticalAI(tacticalView(s,'enemy'),'enemy');
 assert.equal(JSON.stringify(s),before);const p=previewTacticalPlan(s,'enemy',plan);assert.equal(p.ok,true);assert.ok(!sameCell(p.projection.tactical.positions[u.id],{x:2,y:2}));
 s.tactical.plans.player=[{secret:true,type:'move',actorId:s.allies[0].id,path:[{x:4,y:4}]}];assert.deepEqual(planTacticalAI(tacticalView(s,'enemy'),'enemy'),plan);
});
