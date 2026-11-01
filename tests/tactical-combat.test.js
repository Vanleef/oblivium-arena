import test from 'node:test';
import assert from 'node:assert/strict';
import {createTacticalBattle,previewTacticalPlan,submitTacticalPlan,resolveTacticalRound,tacticalView,tacticalArea,exchangeTacticalEssence} from '../src/tactical-combat.js';
import {findPath,patternCells,onBoard,cellKey,lineOfSight} from '../src/tactical-board.js';
import {planTacticalAI} from '../src/tactical-ai.js';
const first=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],second=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
const create=(seed=1)=>{const s=createTacticalBattle(first,second,{seed});for(const u of [...s.allies,...s.enemies])u.passive=null;for(const k of ['resources','enemyResources'])Object.assign(s[k],{essence:10,cinza:10,graca:10,ruptura:10});return s;};
const skill=(u,id,anchor,formKey='base')=>({type:'skill',actorId:u.id,abilityId:id,anchor,formKey,orientation:[1,0]});
const round=(s,p=[],e=[])=>{assert.equal(submitTacticalPlan(s,'player',p).ok,true);assert.equal(submitTacticalPlan(s,'enemy',e).ok,true);const r=resolveTacticalRound(s);assert.equal(r.ok,true);return r;};
const close=s=>{s.tactical.positions[s.allies[0].id]={x:1,y:1};s.tactical.positions[s.enemies[0].id]={x:2,y:1};return s;};

test('5×5 começa sem empilhamento e rejeita formações inválidas',()=>{
 const s=create();assert.equal(s.allies.length,3);assert.equal(s.enemies.length,3);assert.ok(Object.values(s.tactical.positions).every(onBoard));assert.equal(new Set(Object.values(s.tactical.positions).map(cellKey)).size,6);
 assert.throws(()=>createTacticalBattle([first[0],first[0],first[1]],second));
 assert.throws(()=>createTacticalBattle(first,second,{obstacles:[{x:0,y:1}]}));
});
test('buffs, memórias e efeitos de Legado entram no estado tático',()=>{
 const base=createTacticalBattle(first,second,{seed:7}),upgraded=createTacticalBattle(first,second,{seed:7,buffs:['ward','essence','edge'],memories:[{id:'test',stacks:1,effect:{armor:2}}],globalEffects:{startingCharge:1}});
 assert.equal(upgraded.allies[0].shield,12);assert.equal(upgraded.resources.essence,base.resources.essence+1);assert.equal(upgraded.buffs.damage,.12);assert.equal(upgraded.allies[0].armor,2);assert.equal(upgraded.allies[0].charge,1);
});

test('duas ações por alma, até seis, com payload validado sem mutar o combate',()=>{
 const s=create(),u=s.allies[0],before=JSON.stringify(s),p=findPath(s,u.id,{x:1,y:1});
 assert.equal(previewTacticalPlan(s,'player',[{type:'move',actorId:u.id,path:p},{type:'move',actorId:u.id,path:[{x:2,y:1}]},{type:'move',actorId:u.id,path:[{x:3,y:1}]}]).ok,false);
 for(const bad of [null,[{type:'move',actorId:u.id,path:[{x:99,y:0}]}],[{type:'move',actorId:s.enemies[0].id,path:p}],[{type:'fake',actorId:u.id}]])assert.equal(submitTacticalPlan(s,'player',bad).ok,false);
 assert.equal(JSON.stringify(s),before);
});
test('movimento aceita diagonais e bloqueia ocupação, saltos e cantos fechados',()=>{
 const s=create(),u=s.allies[0];assert.equal(findPath(s,u.id,{x:2,y:0}).length,2);
 assert.equal(findPath(s,u.id,s.tactical.positions[s.allies[1].id]),null);
 assert.equal(previewTacticalPlan(s,'player',[{type:'move',actorId:u.id,path:[{x:3,y:1}]}]).ok,false);
 s.tactical.obstacles=[{x:1,y:1},{x:0,y:0}];assert.equal(previewTacticalPlan(s,'player',[{type:'move',actorId:u.id,path:[{x:1,y:0}]}]).ok,false);
});
test('cruz, X e 3×3 cortam nas bordas e linha de visão respeita cobertura',()=>{
 assert.equal(patternCells('square',{x:2,y:2},{x:0,y:0}).length,4);
 assert.equal(patternCells('cross',{x:2,y:2},{x:2,y:2}).length,5);
 assert.equal(patternCells('x',{x:2,y:2},{x:2,y:2}).length,5);
 const s=create();s.tactical.obstacles=[{x:2,y:2}];assert.equal(lineOfSight(s,{x:0,y:2},{x:4,y:2}),false);
});
test('planos ficam ocultos até ambos confirmarem; resolver antes é rejeitado',()=>{
 const s=create();assert.equal(submitTacticalPlan(s,'player',[]).ready,false);
 const view=tacticalView(s,'enemy');assert.deepEqual(view.tactical.plans,{});assert.equal(view.rngState,undefined);assert.equal(view.tactical.confirmed.player,true);
 assert.equal(resolveTacticalRound(s).ok,false);assert.equal(submitTacticalPlan(s,'player',[]).ok,false);
 assert.equal(submitTacticalPlan(s,'enemy',[]).ready,true);assert.equal(resolveTacticalRound(s).ok,true);assert.equal(s.round,2);
});
test('conflito de destino usa iniciativa alternada sem empilhar',()=>{
 const s=create();s.tactical.positions[s.allies[0].id]={x:1,y:0};s.tactical.positions[s.enemies[0].id]={x:3,y:0};const point={x:2,y:0};
 const result=round(s,[{type:'move',actorId:s.allies[0].id,path:[point]}],[{type:'move',actorId:s.enemies[0].id,path:[point]}]);
 assert.deepEqual(s.tactical.positions[s.allies[0].id],point);assert.deepEqual(s.tactical.positions[s.enemies[0].id],{x:3,y:0});assert.equal(result.events.filter(e=>e.type==='move'&&e.skipped).length,1);
 assert.equal(new Set(Object.values(s.tactical.positions).map(cellKey)).size,6);
});
test('movimento parcial para antes de passagem disputada',()=>{
 const s=create(2);s.tactical.positions[s.allies[0].id]={x:0,y:0};s.tactical.positions[s.enemies[0].id]={x:3,y:0};
 round(s,[{type:'move',actorId:s.allies[0].id,path:[{x:1,y:0},{x:2,y:0}]}],[{type:'move',actorId:s.enemies[0].id,path:[{x:2,y:0}]}]);
 assert.deepEqual(s.tactical.positions[s.enemies[0].id],{x:2,y:0});assert.deepEqual(s.tactical.positions[s.allies[0].id],{x:1,y:0});
});
test('mira fixa permite escapar da área e uma técnica lançada paga mesmo se errar',()=>{
 const s=close(create()),u=s.allies[0],e=s.enemies[0],before={...s.resources};
 const result=round(s,[skill(u,'impulso',{x:2,y:1})],[{type:'move',actorId:e.id,path:[{x:2,y:0}]}]);
 assert.equal(e.hp,100);assert.ok(Object.values(before).reduce((a,b)=>a+b)-Object.values(s.resources).reduce((a,b)=>a+b)>=-3);
 const cast=result.events.find(e=>e.type==='skill');assert.equal(cast.skipped,false);assert.equal(cast.totalDamage,0);
});
test('Invulnerável ativa antes da ofensiva e recarga não avança por ação',()=>{
 const s=close(create()),u=s.allies[0],e=s.enemies[0];
 round(s,[skill(u,'impulso',{x:2,y:1})],[skill(e,'despertar',{x:2,y:1})]);
 assert.equal(e.hp,100);assert.equal(e.cooldowns.despertar,4);assert.equal(e.invulnerable,0);
 for(let i=0;i<3;i++)round(s);assert.equal(e.cooldowns.despertar,1);round(s);assert.equal(e.cooldowns.despertar,undefined);
});
test('preparação e continuação no mesmo espaço usam custos e formas reais',()=>{
 const s=close(create()),u=s.allies[0],e=s.enemies[0];
 const plan=[skill(u,'impulso',{x:2,y:1}),skill(u,'impulso',{x:2,y:1},'reopen')];
 const p=previewTacticalPlan(s,'player',plan);assert.equal(p.ok,true,p.reason);assert.equal(p.payment.costs.essence,1);
 const result=round(s,plan);assert.equal(result.events.filter(e=>e.type==='skill'&&!e.skipped).length,2);assert.ok(e.hp<80);assert.equal(u.abilities[0].formKey,'base');
});
test('forma sem preparação é rejeitada e dados de dano do cliente são ignorados',()=>{
 const s=close(create()),u=s.allies[0],before=JSON.stringify(s);
 assert.equal(submitTacticalPlan(s,'player',[skill(u,'impulso',{x:2,y:1},'reopen')]).ok,false);assert.equal(JSON.stringify(s),before);
 const p=previewTacticalPlan(s,'player',[{...skill(u,'impulso',{x:2,y:1}),damage:999999,costs:{},side:'enemy'}]);assert.equal(p.ok,true);assert.ok(p.projection.enemies[0].hp>0);assert.equal(p.actions[0].damage,undefined);assert.equal(p.actions[0].side,'player');
});
test('Coringa reserva tipos sem gastar duas vezes nem financiar por geração futura',()=>{
 const s=create(),u=s.allies[0];Object.assign(s.resources,{essence:1,cinza:0,graca:0,ruptura:0});
 assert.equal(previewTacticalPlan(s,'player',[skill(u,'despertar',{x:0,y:1}),skill(u,'despertar',{x:0,y:1})]).ok,false);
 assert.equal(previewTacticalPlan(s,'player',[skill(u,'despertar',{x:0,y:1})],{essence:1}).ok,true);
 assert.equal(previewTacticalPlan(s,'player',[skill(u,'despertar',{x:0,y:1})],{essence:2}).ok,false);
 const before={...s.resources};assert.equal(submitTacticalPlan(s,'player',[skill(u,'despertar',{x:0,y:1})],{essence:-1}).ok,false);assert.deepEqual(s.resources,before);
});
test('conversão 5→1 mantém o custo líquido e bloqueia depois de confirmar',()=>{
 const s=create(),total=Object.values(s.resources).reduce((a,b)=>a+b);assert.equal(exchangeTacticalEssence(s,'player','graca').ok,true);assert.equal(Object.values(s.resources).reduce((a,b)=>a+b),total-4);submitTacticalPlan(s,'player',[]);assert.equal(exchangeTacticalEssence(s,'player','graca').ok,false);
});
test('forma de Corvin prepara o ataque seguinte, sem ação ou custo extras',()=>{
 const s=createTacticalBattle(['o-odio-encarnado',first[1],first[2]],second);for(const key of ['resources','enemyResources'])Object.assign(s[key],{essence:10,cinza:10,graca:10,ruptura:10});close(s);
 const u=s.allies[0],p=previewTacticalPlan(s,'player',[skill(u,'tecnica',{x:1,y:1}),skill(u,'impulso',{x:2,y:1},'rage')]);assert.equal(p.ok,true,p.reason);
 const r=round(s,[skill(u,'tecnica',{x:1,y:1}),skill(u,'impulso',{x:2,y:1},'rage')]);assert.equal(r.events.filter(e=>e.type==='skill'&&!e.skipped).length,2);assert.equal(u.bodyForm,'rage');
});
test('IA produz o mesmo plano sem acesso à fila oculta e respeita orçamento',()=>{
 const s=create(),before=JSON.stringify(s),view=tacticalView(s,'enemy');const a=planTacticalAI(view);submitTacticalPlan(s,'player',[]);const b=planTacticalAI(tacticalView(s,'enemy'));
 assert.deepEqual(a,b);assert.ok(a.length<=6);assert.equal(previewTacticalPlan(s,'enemy',a).ok,true);assert.equal(JSON.stringify(view),JSON.stringify(tacticalView(JSON.parse(before),'enemy')));
});
test('serialização preserva resolução, pagamentos, formas e posições',()=>{
 const a=close(create()),b=JSON.parse(JSON.stringify(a));const p=[skill(a.allies[0],'impulso',{x:2,y:1})];round(a,p);round(b,p);
 assert.deepEqual(a.tactical.positions,b.tactical.positions);assert.deepEqual(a.resources,b.resources);assert.deepEqual(a.allies.map(u=>[u.hp,u.skillForms]),b.allies.map(u=>[u.hp,u.skillForms]));
});

test('contra-ataque preparado reage à ofensiva da mesma rodada',()=>{
 const s=create(),u=s.allies[1],e=s.enemies[0];s.tactical.positions[u.id]={x:1,y:2};s.tactical.positions[e.id]={x:2,y:2};
 const before=e.hp;const r=round(s,[skill(u,'tecnica',{x:1,y:2})],[skill(e,'impulso',{x:1,y:2})]);
 assert.ok(r.events.some(e=>e.reactions?.length));assert.ok(e.hp<before);assert.equal(u.hp,100);
});
test('Verdant protege apenas a cruz e colapsa a região 3×3 sem atingir fora da área',()=>{
 const s=createTacticalBattle(['a-arquiteta-verde',first[1],first[2]],second),u=s.allies[0];
 for(const k of ['resources','enemyResources'])Object.assign(s[k],{essence:10,cinza:10,graca:10,ruptura:10});
 s.tactical.positions[u.id]={x:2,y:2};
 const p=[skill(u,'tecnica',{x:2,y:2}),skill(u,'voto',{x:3,y:2},'collapse')];
 assert.ok(previewTacticalPlan(s,'player',p.slice(0,1)).projection.allies[0].shield>0);const result=round(s,p),cast=result.events.find(e=>e.type==='skill'&&e.formKey==='collapse');assert.equal(cast.targets.length,3);assert.equal(u.shield,0);assert.equal(s.allies[1].shield,0);assert.equal(s.allies[2].shield,0);
});
test('a queda cancela as duas ações restantes da vítima',()=>{
 const s=close(create()),u=s.allies[0],e=s.enemies[0];e.hp=1;
 const r=round(s,[skill(u,'impulso',{x:2,y:1})],[skill(e,'impulso',{x:1,y:1}),skill(e,'impulso',{x:1,y:1},'next')]);
 assert.equal(e.hp,0);assert.equal(r.events.filter(a=>a.actorId===e.id&&a.skipped).length,2);assert.equal(u.hp,100);
});
test('aflições executam um tick e Essência cresce uma vez por rodada, não por ação',()=>{
 const s=create(),u=s.allies[0];u.dots=[{tag:'veneno',damage:7,turns:2,sourceId:s.enemies[0].id}];
 const result=round(s,[{type:'move',actorId:u.id,path:[{x:1,y:1}]},{type:'move',actorId:u.id,path:[{x:2,y:1}]}]);
 assert.equal(u.hp,93);assert.equal(u.dots[0].turns,1);assert.equal(s.essenceDraws.player.length,3);assert.equal(Object.values(s.resources).reduce((a,b)=>a+b),43);
 assert.equal(result.events.at(-1).round,1);
});
test('stun recém-aplicado continua válido na próxima janela de planejamento',()=>{
 const s=close(create());const e=s.enemies[0];
 round(s,[skill(s.allies[0],'tecnica',{x:2,y:1})]);assert.equal(e.stunned,1);assert.equal(submitTacticalPlan(s,'enemy',[{type:'move',actorId:e.id,path:[{x:2,y:0}]}]).ok,false);
 round(s);assert.equal(e.stunned,0);
});
