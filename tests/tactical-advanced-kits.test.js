import {planTacticalAI} from '../src/tactical-ai.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {characters,worldLeaders} from '../src/data.js';
import {tacticalRoster,tacticalOpponentRoster,tacticalSpec} from '../src/tactical-kits.js';
import {tacticalRequirementReason} from '../src/tactical-requirements.js';
import {createTacticalBattle,previewTacticalPlan,submitTacticalPlan,resolveTacticalRound,chooseTacticalShadow} from '../src/tactical-combat.js';
const base=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],foes=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
function setup(id='nilo',side='player'){
 const s=createTacticalBattle(side==='player'?[id,...base.slice(1)]:base,side==='enemy'?[id,...foes.slice(1)]:foes);
 for(const u of [...s.allies,...s.enemies])u.passive=null;
 s.resources=s.enemyResources={essence:20,cinza:20,graca:20,ruptura:20};s.enemyResources={...s.resources};
 const u=(side==='player'?s.allies:s.enemies)[0],target=(side==='player'?s.enemies:s.allies)[0];
 s.tactical.positions[u.id]={x:0,y:1};s.tactical.positions[target.id]={x:2,y:1};return {s,u,target};
}
const skill=(u,id,anchor={x:0,y:1},extra={})=>({type:'skill',actorId:u.id,abilityId:id,anchor,orientation:[1,0],...extra});
function round(s,own=[],enemy=[]){assert.equal(submitTacticalPlan(s,'player',own).ok,true);assert.equal(submitTacticalPlan(s,'enemy',enemy).ok,true);return resolveTacticalRound(s);}
test('catálogo completo adapta 150 entradas e protege a seleção dos três lordes e NPCs',()=>{
 assert.equal(tacticalOpponentRoster.length,characters.length);assert.equal(tacticalRoster.length,136);
 for(const leader of Object.values(worldLeaders)){assert.ok(tacticalOpponentRoster.includes(leader.rosterId));assert.ok(!tacticalRoster.includes(leader.rosterId));assert.throws(()=>createTacticalBattle([leader.rosterId,...base.slice(1)],foes));assert.doesNotThrow(()=>createTacticalBattle(base,[leader.rosterId,...foes.slice(1)]));}
 assert.ok(characters.filter(c=>c.npcOnly).every(c=>!tacticalRoster.includes(c.id)));
});
test('Colapso II exige preparação real da primeira passagem e ativação não se repete',()=>{
 const {s,u}=setup('nilo-cinza-final'),before=JSON.stringify(s);
 assert.equal(previewTacticalPlan(s,'player',[skill(u,'tecnica-4')]).ok,false);assert.equal(previewTacticalPlan(s,'player',[skill(u,'tecnica-5')]).ok,false);assert.equal(JSON.stringify(s),before);
 assert.equal(previewTacticalPlan(s,'player',[skill(u,'voto'),skill(u,'voto')]).ok,false);
 const plan=[skill(u,'voto'),skill(u,'tecnica-4')],p=previewTacticalPlan(s,'player',plan);assert.equal(p.ok,true);assert.equal(p.projection.allies[0].collapseLevel,2);
 const out=round(s,plan);assert.equal(out.events.filter(e=>e.actorId===u.id&&e.type==='skill'&&!e.skipped).length,2);assert.equal(u.collapseLevel,2);assert.equal(u.collapse2Used,true);
});
test('modo perdido antes da execução interrompe a técnica sem pagar seu custo',()=>{
 const {s,u}=setup('nilo-graca-final');u.graceFormTurns=3;
 assert.equal(submitTacticalPlan(s,'player',[skill(u,'tecnica-5',{x:2,y:1})]).ok,true);u.graceFormTurns=0;assert.equal(submitTacticalPlan(s,'enemy',[]).ok,true);
 const event=resolveTacticalRound(s).events.find(e=>e.type==='skill');assert.equal(event.skipped,true);assert.match(event.reason,/Forma de Graça/);assert.deepEqual(event.after.resources,event.before.resources);
});
test('Pilar e Carga de Intervenção são requisitos separados',()=>{
 const {s,u}=setup('nilo-graca-final'),a=u.abilities.find(a=>a.id==='tecnica-6');
 assert.match(tacticalRequirementReason(s,u,a),/Forma de Graça/);u.graceFormTurns=3;assert.match(tacticalRequirementReason(s,u,a),/Pilar/);
 s.allies[1].pillarOwnerId=u.id;assert.match(tacticalRequirementReason(s,u,a),/Carga/);u.interventionCharge=1;assert.equal(tacticalRequirementReason(s,u,a),'');
});
test('Resíduo escolhido é validado e consumido nos dois lados, sem bônus gratuito',()=>{
 for(const side of ['player','enemy']){
  const {s,u,target}=setup('nilo',side);u.residue=2;const ref=skill(u,'voto',{x:2,y:1},{residueSpend:2}),before=JSON.stringify(s);
  for(const n of [-1,1.5,3])assert.equal(previewTacticalPlan(s,side,[{...ref,residueSpend:n}]).ok,false);
  assert.equal(JSON.stringify(s),before);const p=previewTacticalPlan(s,side,[ref]);assert.equal(p.ok,true);assert.equal((side==='player'?p.projection.allies:p.projection.enemies)[0].residue,0);
  const out=round(s,side==='player'?[ref]:[],side==='enemy'?[ref]:[]),event=out.events.find(e=>e.actorId===u.id&&e.type==='skill');
  assert.equal((side==='player'?event.after.allies:event.after.enemies)[0].residue,0);assert.equal(event.residueSpend,2);assert.ok(target.hp<100);
 }
});
test('Resíduo insuficiente não é inventado pela projeção nem pela resolução',()=>{
 const {s,u}=setup();u.residue=1;const ref=skill(u,'voto',{x:2,y:1},{residueSpend:2});assert.equal(previewTacticalPlan(s,'player',[ref]).ok,false);
 u.residue=2;assert.equal(submitTacticalPlan(s,'player',[ref]).ok,true);u.residue=0;assert.equal(submitTacticalPlan(s,'enemy',[]).ok,true);
 const event=resolveTacticalRound(s).events.find(e=>e.type==='skill');assert.equal(event.skipped,true);assert.match(event.reason,/Resíduo insuficiente/);assert.deepEqual(event.before.resources,event.after.resources);
});
test('Fraturas usam o limite canônico por alvo e os efeitos existentes no impacto',()=>{
 const {s,u,target}=setup('nilo-ruptura-final');target.weakened=1;
 const ref=skill(u,'tecnica-6',{x:2,y:1},{fractureSpend:1});assert.equal(previewTacticalPlan(s,'player',[{...ref,fractureSpend:2}]).ok,false);
 const p=previewTacticalPlan(s,'player',[ref]);assert.equal(p.ok,true);assert.equal(p.actions[0].fractureSpend,1);
 const hit=round(s,[ref]).events.find(e=>e.type==='skill');assert.equal(hit.skipped,false);assert.equal(hit.after.enemies[0].weakened,0);
});
test('Sombra Preparada exige escolha pendente, respeita o lado e bloqueia após confirmação',()=>{
 const {s,u}=setup('nilo-ruptura-epilogo');assert.equal(chooseTacticalShadow(s,'player',u.id,'damage').ok,false);u.shadowChoicePending=true;
 assert.equal(chooseTacticalShadow(s,'enemy',u.id,'damage').ok,false);assert.equal(chooseTacticalShadow(s,'player',u.id,'invalid').ok,false);
 assert.equal(chooseTacticalShadow(s,'player',u.id,'response').ok,true);assert.equal(u.shadowBroadCounter,true);assert.equal(chooseTacticalShadow(s,'player',u.id,'damage').ok,false);
 u.shadowChoicePending=true;submitTacticalPlan(s,'player',[]);assert.equal(chooseTacticalShadow(s,'player',u.id,'damage').ok,false);
});
test('metamorfa terrestre e alada usam alcances diferentes na segunda passagem',()=>{
 for(const [activation,formKey,anchor,pattern]of [['tecnica','skin',{x:1,y:1},'cell'],['voto','shell',{x:2,y:1},'line']]){
  const {s,u,target}=setup('a-pele-alheia');s.tactical.positions[target.id]={...anchor};
  const ref=skill(u,'impulso',anchor,{formKey}),p=previewTacticalPlan(s,'player',[skill(u,activation),ref]);assert.equal(p.ok,true,formKey);
  const form=p.projection.allies[0].abilities.find(a=>a.id==='impulso');assert.equal(tacticalSpec(u,form).pattern,pattern);
 }
});

test('IA aproveita Resíduo disponível e o plano debita o gasto escolhido',()=>{
 const {s,u}=setup('nilo','enemy');u.residue=2;for(const other of s.enemies)if(other!==u)other.stunned=1;
 const plan=planTacticalAI(s,'enemy');assert.ok(plan.some(ref=>ref.actorId===u.id&&ref.residueSpend===2));assert.equal(u.residue,2);
 const p=previewTacticalPlan(s,'enemy',plan);assert.equal(p.ok,true);assert.equal(p.projection.enemies[0].residue,0);
});
