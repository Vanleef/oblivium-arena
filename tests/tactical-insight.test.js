import test from 'node:test';
import assert from 'node:assert/strict';
import {createTacticalBattle} from '../src/tactical-combat.js';
import {explainTacticalPlan,tacticalPlanningContext,tacticalResolutionFeedback} from '../src/tactical-insight.js';
const ids=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],foes=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
function setup(){const s=createTacticalBattle(ids,foes,{seed:1});s.resources={essence:20,cinza:20,graca:20,ruptura:20};for(const u of [...s.allies,...s.enemies])u.passive=null;s.tactical.positions[s.enemies[0].id]={x:2,y:1};return s;}
const skill=(actorId,abilityId,anchor)=>({type:'skill',actorId,abilityId,anchor,orientation:[1,0],formKey:'base'});
test('a prévia respeita as duas passagens e liga Exposto entre aliados',()=>{
 const s=setup(),r=s.allies[0],l=s.allies[1];
 const refs=[{type:'move',actorId:r.id,path:[{x:1,y:1}]},skill(r.id,'voto',{x:2,y:1}),skill(l.id,'impulso',{x:2,y:1})];
 const before=JSON.stringify(s),details=explainTacticalPlan(s,'player',refs);
 assert.deepEqual(details.map(d=>[d.draftIndex,d.slot]),[[0,1],[2,1],[1,2]]);
 const attack=details.find(d=>d.draftIndex===1);assert.deepEqual(attack.origin,{x:1,y:1});assert.ok(attack.combos.some(t=>t.includes('por Lira')));assert.ok(attack.combos.some(t=>t.includes('Reposicionamento')));assert.equal(attack.conditional,true);
 assert.equal(JSON.stringify(s),before);
});
test('uma primeira ação inserida não usa estados futuros da segunda passagem',()=>{
 const s=setup(),r=s.allies[0],l=s.allies[1];const refs=[{type:'move',actorId:r.id,path:[{x:1,y:1}]},{type:'move',actorId:r.id,path:[{x:1,y:0}]},{type:'move',actorId:l.id,path:[]}];
 const context=tacticalPlanningContext(s,'player',refs,2);assert.equal(context.ok,true);assert.deepEqual(context.projection.tactical.positions[r.id],{x:1,y:1});assert.equal(context.prior.length,1);
});
test('prévia privada independe do plano secreto do adversário',()=>{
 const s=setup(),refs=[skill(s.allies[1].id,'impulso',{x:2,y:1})],a=explainTacticalPlan(s,'player',refs);
 s.tactical.plans.enemy=[{actorId:s.enemies[0].id,type:'move',path:[{x:4,y:4}],private:'secret'}];
 assert.deepEqual(explainTacticalPlan(s,'player',refs),a);assert.ok(!JSON.stringify(a).includes('secret'));
});
test('condições reais de marca são reconhecidas no segundo golpe',()=>{
 const s=setup(),l=s.allies[1],details=explainTacticalPlan(s,'player',[skill(l.id,'impulso',{x:2,y:1}),skill(l.id,'voto',{x:2,y:1})]);
 assert.ok(details[1].combos.some(t=>t.includes('Condição de combo ativa')));
});
test('a resolução explica interrupção, dano e absorção com snapshots reais',()=>{
 assert.deepEqual(tacticalResolutionFeedback({type:'skill',skipped:true,reason:'Caminho bloqueado.'}),['Caminho bloqueado.']);
 const notes=tacticalResolutionFeedback({type:'skill',targets:['a'],before:{allies:[],enemies:[{id:'a',name:'Alvo',hp:100,shield:8}]},after:{allies:[],enemies:[{id:'a',name:'Alvo',hp:92,shield:0}]}});
 assert.ok(notes.some(t=>t.includes('perdeu 8')));assert.ok(notes.some(t=>t.includes('absorveu 8')));
});

test('identidade do trio descreve kits públicos e não concede bônus',async()=>{
 const {tacticalTrioIdentity}=await import('../src/tactical-insight.js');const s=setup(),before=JSON.stringify(s);
 const notes=tacticalTrioIdentity(s.allies);assert.ok(notes.some(n=>n.text.includes('Lira')&&n.text.includes('Riven')));assert.equal(JSON.stringify(s),before);
 assert.ok(tacticalTrioIdentity([{id:'solo',name:'Solo',hp:100,abilities:[]}]).length);
});
