import test from 'node:test';
import assert from 'node:assert/strict';
import {characters,starters,characterById} from '../src/data.js';
import {createFinalBoss,FINAL_BOSS} from '../src/final-boss.js';
import {previewBodyForm} from '../src/body-forms.js';
import {createBattle,chooseAction,commitTurn,resolveNextAction,passTurn,getCombatPlan,getValidTargets,createDuel,submitDuelTurn} from '../src/combat.js';
import {refreshSkillForms} from '../src/skill-state.js';
import {portraitMarkup} from '../src/view-utils.js';
import {renderBattle} from '../src/battle-view.js';
const dummy=id=>({id,name:id,realm:'Inferno',maxHp:1000,abilities:[]});
const refill=b=>{b.resources={essence:20,cinza:20,graca:20,ruptura:20};b.enemyResources={...b.resources};};
function bossBattle(){const b=createBattle([starters[0].id],[createFinalBoss(),dummy('alvo')],{rng:()=>0,enemyPlanner:()=>[]});const boss=b.enemies.shift();boss.side='player';b.allies=[boss];refill(b);return b;}
function finish(b){let n=0;while(b.phase==='resolving'&&n++<20)resolveNextAction(b);assert.ok(n<20);}
function cast(b,index){refill(b);const u=b.allies[0],a=u.abilities[index],target=getValidTargets(b,u,a)[0];assert.equal(chooseAction(b,u.id,a.id,target?.id).ok,true,a.name);commitTurn(b);const result=resolveNextAction(b);assert.equal(result.event?.skipped,false,a.name);return result;}
function morphBattle(id){const b=createBattle([id],[dummy('alvo')],{rng:()=>0,enemyPlanner:()=>[]});refill(b);return b;}

test('O Fim escolhe três manifestações completas, cada uma com três técnicas e retrato próprios',()=>{
 const original=createFinalBoss(),serialized=JSON.stringify(original);
 const names=new Set();
 for(let i=0;i<3;i++){
  const b=bossBattle(),u=b.allies[0],base=u.art.portrait;cast(b,i);
  assert.equal(u.bodyForm,FINAL_BOSS.bodyForms[i].key);assert.notEqual(u.art.portrait,base);
  assert.equal(u.art.portrait,FINAL_BOSS.bodyForms[i].portrait);assert.equal(u.abilities.length,4);
  for(const a of u.abilities.slice(0,3)){assert.equal(a.formKey,u.bodyForm);names.add(a.name);}
  assert.equal(u.abilities[3].name,'Fim Inalcançável');assert.match(portraitMarkup(u,'portrait'),new RegExp(`portrait-${u.bodyForm}`));
  assert.equal(b.acted.length,1);assert.equal(b.resources.cinza,19);finish(b);
 }
 assert.equal(names.size,9);assert.equal(JSON.stringify(original),serialized);
});

test('Fim Inalcançável cura 10, protege por uma resposta e restaura retrato e seletores sem zerar recargas',()=>{
 const b=bossBattle(),u=b.allies[0];cast(b,1);finish(b);u.hp=80;u.cooldowns.decreto=2;cast(b,3);
 assert.equal(u.hp,90);assert.equal(u.invulnerable,1);assert.equal(u.bodyForm,'base');assert.equal(u.art.portrait,FINAL_BOSS.portrait);
 assert.deepEqual(u.abilities.slice(0,3).map(a=>a.name),['Assumir Tirano','Assumir Predador','Assumir Ruína']);
 assert.equal(u.cooldowns.decreto,2);assert.equal(u.cooldowns.despertar,4);
 finish(b);assert.equal(u.invulnerable,0);assert.equal(u.cooldowns.despertar,4);assert.equal(u.cooldowns.decreto,1);
 // A later transformation still cannot bypass the shared defensive cooldown.
 cast(b,0);assert.equal(u.cooldowns.despertar,4);finish(b);
 assert.equal(chooseAction(b,u.id,'despertar',u.id).ok,false);
});

test('cura do retorno respeita Vida máxima e bloqueio de cura',()=>{
 for(const [hp,block,expected] of [[96,0,100],[80,.5,85],[80,1,80]]){
  const b=bossBattle(),u=b.allies[0];u.hp=hp;u.healingBlock=block;cast(b,3);assert.equal(u.hp,expected);
 }
});

test('as nove técnicas de O Fim resolvem, e nenhuma forma altera a defesa ou as definições',()=>{
 const c=createFinalBoss(),before=JSON.stringify(c);
 for(let form=0;form<3;form++)for(let slot=0;slot<3;slot++){
  const b=bossBattle(),u=b.allies[0];cast(b,form);finish(b);u.hp=60;cast(b,slot);finish(b);
  assert.equal(u.abilities[3].cooldown,4);assert.equal(u.abilities[3].invulnerable,1);assert.equal(u.bodyForm,FINAL_BOSS.bodyForms[form].key);
  for(const v of [...b.allies,...b.enemies])assert.ok(Number.isFinite(v.hp)&&v.hp>=0&&v.hp<=v.maxHp);
 }
 assert.equal(JSON.stringify(c),before);
});

test('Tirano consome sua própria marca para interromper; Predador drena; Ruína acumula aflição',()=>{
 const b=bossBattle(),u=b.allies[0],enemy=b.enemies[0];cast(b,0);finish(b);cast(b,0);finish(b);
 const hp=enemy.hp;cast(b,1);assert.equal(hp-enemy.hp,35);assert.equal(enemy.stunned,1);assert.equal(enemy.marks.fim,undefined);
 const p=bossBattle(),pred=p.allies[0];cast(p,1);finish(p);pred.hp=50;cast(p,0);assert.equal(pred.hp,57);assert.ok(p.enemies[0].marks['caca-fim']);
 const r=bossBattle();cast(r,2);finish(r);cast(r,0);assert.ok(r.enemies[0].dots.some(d=>d.tag==='decadencia'&&d.turns===3));
});

test('IA usa manifestações diferentes conforme a situação pública e o retrato muda na resolução',()=>{
 for(const [hp,count,expected] of [[100,1,'tyrant'],[20,1,'predator'],[100,3,'ruin']]){
  const b=createBattle([starters[0].id],[createFinalBoss()],{rng:()=>0});
  b.allies=Array.from({length:count},(_,i)=>({...b.allies[0],id:`aliado-${i}`}));
  const u=b.enemies[0];u.hp=hp;refill(b);const before=JSON.stringify(b);
  const plan=getCombatPlan(b);assert.equal(JSON.stringify(b),before);assert.ok(plan.length);
  const selected=u.abilities.find(a=>a.id===plan[0].abilityId);assert.equal(selected.assumeForm,expected);
  b.enemyPlanner=()=>plan;passTurn(b);assert.equal(u.bodyForm,expected);assert.match(u.art.portrait,new RegExp(`portrait-${expected}`));
 }
});

test('Metamorfa tem três corpos, mantém quatro posições e restaura o retrato ao descartar ou se defender',()=>{
 const id='a-pele-alheia',definition=characterById[id],before=JSON.stringify(definition);
 for(const [slot,key] of [[1,'skin'],[2,'shell']])for(const exit of [1,3]){
  const b=morphBattle(id),u=b.allies[0],original=u.art.portrait;cast(b,slot);assert.equal(u.bodyForm,key);assert.notEqual(u.art.portrait,original);assert.equal(u.abilities.length,4);
  assert.equal(u.abilities.slice(0,3).filter(a=>a.formKey!=='base').length,3);finish(b);cast(b,exit);assert.equal(u.bodyForm,'base');assert.equal(u.art.portrait,original);
 }
 assert.equal(JSON.stringify(definition),before);
});

test('Furor troca de retrato ao assumir, encerrar e expirar a fúria; Oscilante ao recolher e retomar',()=>{
 for(const exit of ['finisher','expiry']){
  const b=morphBattle('o-odio-encarnado'),u=b.allies[0],base=u.art.portrait;cast(b,1);assert.equal(u.bodyForm,'rage');assert.notEqual(u.art.portrait,base);finish(b);
  if(exit==='finisher'){cast(b,2);}else {for(let i=0;i<3;i++)passTurn(b);}
  assert.equal(u.bodyForm,'base');assert.equal(u.art.portrait,base);
 }
 const b=morphBattle('a-sombra-inconstante'),u=b.allies[0],base=u.art.portrait;cast(b,1);assert.equal(u.bodyForm,'shelter');finish(b);cast(b,1);assert.equal(u.bodyForm,'base');assert.equal(u.art.portrait,base);
});

test('preview de cada forma mostra o kit completo sem alterar o personagem ou o combate',()=>{
 for(const c of [createFinalBoss(),...characters.filter(c=>c.bodyForms)]){
  const before=JSON.stringify(c);
  for(const form of c.bodyForms){const p=previewBodyForm(c,form.key);assert.equal(p.art.portrait,form.portrait);assert.equal(p.abilities.length,4);assert.equal(p.bodyForm,form.key);assert.equal(p.abilities[3].cooldown,4);}
  assert.equal(JSON.stringify(c),before);
 }
 const b=bossBattle();cast(b,2);const html=renderBattle({battle:b,battleNode:{label:'O Fim'},battleFx:null},{id:'vazio',name:'Vazio'});assert.match(html,/data-body-form="ruin"/);assert.match(html,/portrait-ruin.webp/);
});

test('formas funcionam dos dois lados do duelo autoritativo e não permitem ações extras',()=>{
 const id='a-pele-alheia',b=createDuel([id],[id],{rng:()=>0});refill(b);
 const player=b.allies[0],enemy=b.enemies[0];
 assert.throws(()=>submitDuelTurn(b,'player',[{actorId:id,abilityId:'tecnica',targetId:id},{actorId:id,abilityId:'impulso',targetId:enemy.id}]),/Ação indisponível/);
 assert.equal(player.bodyForm,'base');
 submitDuelTurn(b,'player',[{actorId:id,abilityId:'tecnica',targetId:id}]);assert.equal(player.bodyForm,'skin');assert.equal(enemy.bodyForm,'base');
 submitDuelTurn(b,'enemy',[{actorId:enemy.id,abilityId:'voto',targetId:enemy.id}]);assert.equal(enemy.bodyForm,'shell');assert.equal(player.bodyForm,'skin');
 assert.notEqual(player.art.portrait,enemy.art.portrait);refreshSkillForms(b);
});

test('transformações não acontecem com recursos insuficientes ou Atordoamento antes da resolução',()=>{
 const b=bossBattle(),u=b.allies[0];b.resources.cinza=0;assert.equal(chooseAction(b,u.id,'fenda',u.id).ok,false);assert.equal(u.bodyForm,'base');
 refill(b);assert.equal(chooseAction(b,u.id,'fenda',u.id).ok,true);commitTurn(b);u.stunned=1;const before={...b.resources};resolveNextAction(b);assert.equal(u.bodyForm,'base');assert.deepEqual(b.resources,before);
});

test('serialização do servidor preserva a forma, o retrato e o retorno sem compartilhar estado',()=>{
 const b=morphBattle('a-pele-alheia');cast(b,2);finish(b);
 const restored=JSON.parse(JSON.stringify(b));restored.rng=()=>0;restored.enemyPlanner=()=>[];
 assert.equal(restored.allies[0].bodyForm,'shell');cast(restored,3);assert.equal(restored.allies[0].bodyForm,'base');assert.equal(b.allies[0].bodyForm,'shell');
 assert.equal(restored.allies[0].art.portrait,characterById['a-pele-alheia'].art.portrait);
});

test('os dois clientes da Arena recebem o retrato ativo sem alterar os dados autoritativos',async()=>{
 const {publicBattle}=await import('../server/arena-service.js');
 const id='a-pele-alheia',b=createDuel([id],[id],{rng:()=>0});refill(b);submitDuelTurn(b,'player',[{actorId:id,abilityId:'tecnica',targetId:id}]);
 const before=JSON.stringify(b),match={battle:b};const first=publicBattle(match,0),second=publicBattle(match,1);
 assert.equal(first.allies[0].bodyForm,'skin');assert.equal(second.enemies[0].bodyForm,'skin');assert.equal(first.allies[0].art.portrait,second.enemies[0].art.portrait);assert.equal(JSON.stringify(b),before);
});
