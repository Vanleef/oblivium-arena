import test from "node:test";
import assert from "node:assert/strict";
import { characters, elos, generateTrail } from "../src/data.js";
import { createBattle, createEnemyTeam, chooseAction, getAvailableResources, getTurnPayment, removeQueuedAction, moveQueuedAction, commitTurn, resolveNextAction, passTurn, getValidTargets } from "../src/engine.js";
import { normalizeTrail, visibleTrail, advanceTrail } from "../src/trail.js";
const ids=["o-escudo-vivo","a-brasa-eterna","o-passo-interrompido"];
const dummy=(damage=1)=>({id:"treino",name:"Alvo de treino",realm:"Inferno",affinity:"cinza",color:"blood",symbol:"◇",maxHp:10000,abilities:[{id:"golpe",name:"Golpe de treino",costs:{},damage,target:"enemy"}]});
function finish(b){let n=0;while(b.phase==="resolving"&&n++<20)resolveNextAction(b);assert.ok(n<20);}
function rich(b){for(const key of Object.keys(b.resources))b.resources[key]=5;}

test("a trilha revela apenas o início, depois os sucessores do nó concluído",()=>{
 const map=generateTrail("sangria",42),run=normalizeTrail({map,stage:0,clearedNodeIds:[],availableNodeIds:[map[0][0].id]});
 assert.equal(visibleTrail(run).nodes.length,1);assert.equal(visibleTrail(run).edges.length,0);
 const first=advanceTrail(run,map[0][0].id);assert.equal(first.newIds.length,3);assert.equal(visibleTrail(run).nodes.length,4);assert.equal(visibleTrail(run).edges.length,3);
 assert.ok(visibleTrail(run).nodes.every(n=>n.row<=1));
 const choice=map[1][0];assert.equal(advanceTrail(run,choice.id).ok,true);
 const v=visibleTrail(run);assert.ok(v.nodes.every(n=>n.row<=2));assert.deepEqual(run.availableNodeIds,choice.nextIds);
 assert.ok(v.edges.every(e=>run.clearedNodeIds.includes(e.from.id)));assert.ok(v.edges.every(e=>e.from.nextIds.includes(e.to.id)));
 assert.equal(advanceTrail(run,choice.id).ok,false);assert.equal(advanceTrail(run,map[3][0].id).ok,false);
});
test("todos os caminhos gerados chegam ao Guardião sem conexões inválidas",()=>{
 for(const elo of elos){const map=generateTrail(elo.id,17),byId=new Map(map.flat().map(n=>[n.id,n])),reached=new Set();const visit=id=>{if(reached.has(id))return;reached.add(id);for(const next of byId.get(id).nextIds){assert.equal(byId.get(next).row,byId.get(id).row+1);visit(next);}};visit(map[0][0].id);assert.equal(reached.size,map.flat().length);assert.equal(map.at(-1)[0].type,"boss");}
});
test("selecionar reserva recursos sem executar; remover e substituir devolve a reserva",()=>{
 const b=createBattle(ids,[dummy()]);b.resources={essence:1,cinza:1,graca:1,ruptura:1};const hp=b.enemies[0].hp,pool={...b.resources};
 assert.equal(chooseAction(b,ids[0],"impulso","treino").ok,true);assert.equal(b.enemies[0].hp,hp);assert.deepEqual(b.resources,pool);assert.equal(getAvailableResources(b).graca,0);
 assert.equal(chooseAction(b,ids[0],"despertar",ids[0]).ok,true);assert.equal(b.queue.length,1);assert.equal(getAvailableResources(b).graca,1);assert.equal(getAvailableResources(b).essence,1);assert.equal(getTurnPayment(b).required,1);assert.equal(getTurnPayment(b).ok,true);
 removeQueuedAction(b,ids[0]);assert.deepEqual(getAvailableResources(b),pool);
});
test("a fila executa na ordem confirmada e permite combos entre aliados",()=>{
 const b=createBattle(ids,[dummy()]);rich(b);
 b.allies[0].abilities[0]={id:"impulso",name:"Preparação",costs:{graca:1},damage:10,expose:1,target:"enemy"};
 b.allies[1].abilities[0]={id:"impulso",name:"Conclusão",costs:{cinza:1},damage:10,combo:{condition:"exposed",bonusDamage:15},target:"enemy"};
 chooseAction(b,ids[0],"impulso","treino");chooseAction(b,ids[1],"impulso","treino");
 moveQueuedAction(b,ids[1],-1);assert.equal(b.queue[0].actorId,ids[1]);moveQueuedAction(b,ids[1],1);
 commitTurn(b);assert.equal(b.phase,"resolving");assert.equal(chooseAction(b,ids[2],"impulso","treino").ok,false);
 const first=resolveNextAction(b);assert.equal(first.event.actorId,ids[0]);const before=b.enemies[0].hp;
 resolveNextAction(b);assert.ok(before-b.enemies[0].hp>=35);assert.ok(b.log.some(l=>l.includes("COMBO")));finish(b);assert.equal(b.round,2);
});
test("todas as 100 defesas protegem a resposta adversária e bloqueiam os próximos quatro turnos",()=>{
 for(const c of characters){const b=createBattle([c.id],[dummy(20)],{rng:()=>0}),defense=b.allies[0].abilities[3];
  assert.equal(defense.invulnerable,1,c.name);assert.equal(defense.cooldown,4,c.name);assert.equal(defense.target,"self");
  const before=b.allies[0].hp;assert.equal(chooseAction(b,c.id,defense.id,c.id).ok,true);commitTurn(b);resolveNextAction(b);assert.equal(b.allies[0].invulnerable,1);finish(b);
  assert.equal(b.allies[0].hp,before,c.name);assert.equal(b.allies[0].invulnerable,0);assert.equal(b.allies[0].cooldowns[defense.id],4);
  b.enemies[0].abilities[0].damage=0;
  for(let remaining=4;remaining>=1;remaining--){assert.equal(b.allies[0].cooldowns[defense.id],remaining);assert.equal(chooseAction(b,c.id,defense.id,c.id).ok,false);passTurn(b);}
  assert.equal(chooseAction(b,c.id,defense.id,c.id).ok,true,c.name);
 }
});
test("Invulnerável impede alvos novos, mas não remove aflições anteriores",()=>{
 const b=createBattle(ids,[dummy()],{rng:()=>0});b.enemies[0].invulnerable=1;
 assert.equal(getValidTargets(b,b.allies[1],b.allies[1].abilities[0]).length,0);assert.equal(chooseAction(b,ids[1],"impulso","treino").ok,false);
 b.allies[0].dots=[{tag:"veneno",damage:7,turns:2,sourceId:"treino",skillId:"veneno"}];
 const before=b.allies[0].hp;chooseAction(b,ids[0],"despertar",ids[0]);passTurn(b);assert.equal(b.allies[0].hp,before-7);
});
test("contra-ataque anula a próxima habilidade e não cria recursão",()=>{
 const b=createBattle([ids[0]],[dummy(30)]);b.allies[0].passive=null;b.allies[0].abilities[0]={id:"armadilha",name:"Armadilha",target:"self",costs:{},counter:20};
 b.enemyPlanner=()=>[{actorId:"treino",abilityId:"golpe",targetId:ids[0],side:"enemy"}];chooseAction(b,ids[0],"armadilha",ids[0]);passTurn(b);assert.equal(b.allies[0].hp,100);assert.equal(b.enemies[0].hp,9980);assert.ok(b.log.some(l=>l.includes("anula")));
});
test("a invulnerabilidade da oposição cobre o próximo turno do jogador",()=>{
 const enemy=dummy(0);enemy.abilities=[{id:"defesa",name:"Defesa",target:"self",costs:{},invulnerable:1,defense:true,cooldown:4}];
 const b=createBattle(ids,[enemy]);b.enemyPlanner=s=>s.intents;b.intents=[{actorId:'treino',abilityId:'defesa',targetId:'treino',side:'enemy'}];passTurn(b);assert.equal(b.enemies[0].invulnerable,1);assert.equal(getValidTargets(b,b.allies[0],b.allies[0].abilities[0]).length,0);
 passTurn(b);assert.equal(b.enemies[0].invulnerable,0);assert.equal(getValidTargets(b,b.allies[0],b.allies[0].abilities[0]).length,1);
});
test("o custo de Vida de uma técnica não revive quem caiu num contra-ataque",()=>{
 const b=createBattle([ids[1]],[dummy(0)]);b.allies[0].hp=10;b.allies[0].abilities[0]={id:"risco",name:"Risco",target:"enemy",costs:{},damage:20,selfDamage:5};b.enemies[0].counter=20;
 chooseAction(b,ids[1],"risco","treino");commitTurn(b);resolveNextAction(b);assert.equal(b.allies[0].hp,0);assert.equal(b.phase,"defeat");
});
test("Atordoado cancela a ação adversária e não é limpo antes da vez correta",()=>{
 const b=createBattle([ids[0]],[dummy(30)]);b.allies[0].abilities[0]={id:"parar",name:"Parar",target:"enemy",costs:{},damage:5,stun:1};
 b.enemyPlanner=()=>[{actorId:"treino",abilityId:"golpe",targetId:ids[0],side:"enemy"}];chooseAction(b,ids[0],"parar","treino");passTurn(b);assert.equal(b.allies[0].hp,100);assert.ok(b.log.some(l=>l.includes("Atordoado")));
});
test("os 400 efeitos e todas as passivas podem ser resolvidos sem kits ausentes",()=>{
 assert.equal(new Set(characters.flatMap(c=>c.abilities.map(a=>a.name))).size,400);
 for(const c of characters)for(const original of c.abilities){const b=createBattle([c.id],[dummy(0)]);rich(b);b.allies[0].hp=60;b.allies[0].charge=1;const a=b.allies[0].abilities.find(a=>a.id===original.id),target=["self","ally","team"].includes(a.target)?c.id:"treino";assert.equal(chooseAction(b,c.id,a.id,target).ok,true,`${c.name}/${a.name}`);assert.equal(passTurn(b),true);for(const u of [...b.allies,...b.enemies]){assert.ok(Number.isFinite(u.hp));assert.ok(u.hp>=0&&u.hp<=u.maxHp);assert.ok(u.shield>=0&&u.shield<=80);}}
});
test("a Vida restante atravessa encontros e elites recebem escala de encontro",()=>{
 const b=createBattle(ids,[dummy()],{teamHealth:{[ids[0]]:61}});assert.equal(b.allies[0].hp,61);
 const normal=createEnemyTeam(elos[0],ids),elite=createEnemyTeam(elos[0],ids,"elite"),mini=createEnemyTeam(elos[0],ids,"mini");assert.equal(normal[0].maxHp,100);assert.ok(elite[0].maxHp>100);assert.ok(mini[0].abilities[0].damage>normal[0].abilities[0].damage);
});

