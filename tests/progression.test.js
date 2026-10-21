import test from 'node:test';
import assert from 'node:assert/strict';
import { elos, realms, starters, characters, characterById } from '../src/data.js';
import { normalizeCampaign, eloAccess, createExpedition, completeExpedition, claimGlobalUpgrade, globalChoices, aggregateGlobal, maxDifficulty, recordEncounter, seededRandom } from '../src/progression.js';
import { advanceTrail } from '../src/trail.js';
import { createBattle, createEnemyTeam, passTurn, chooseAction } from '../src/combat.js';
const ids=['o-escudo-vivo','a-brasa-eterna','o-passo-interrompido'];
const profile=()=>normalizeCampaign({ownedIds:starters.map(c=>c.id),team:[...ids],completedElos:[],xp:0,fragments:0,run:null});
function finish(run){while(run.availableNodeIds.length){const id=run.availableNodeIds[0];assert.equal(advanceTrail(run,id).ok,true);}return run;}
const dummy={id:'dummy',name:'Treino',realm:'Inferno',affinity:'cinza',maxHp:10000,abilities:[{id:'idle',name:'Observar',target:'self',costs:{},shield:1}]};
test('primeiro Elo de cada mundo disponível; demais exigem Elo anterior e missão',()=>{
 const p=profile();for(const realm of realms){assert.equal(eloAccess(p,realm.elos[0]).unlocked,true);for(const elo of realm.elos.slice(1))assert.equal(eloAccess(p,elo).unlocked,false);}
 const first=elos[0],next=realms[0].elos[1];p.eloProgress[first.id].clearedDifficulties=[0];assert.equal(eloAccess(p,next).unlocked,false);p.eloProgress[first.id].elites=1;assert.equal(eloAccess(p,next).unlocked,true);
 assert.throws(()=>createExpedition(profile(),next),/bloqueado/);
});
test('salvamento anterior preserva personagens e dificuldades concluídas',()=>{
 const p=profile(),owned=[...p.ownedIds,characters[0].id];delete p.campaignVersion;p.ownedIds=owned;p.completedElos=['sangria'];delete p.eloProgress;
 normalizeCampaign(p);assert.deepEqual(p.ownedIds,owned);assert.deepEqual(p.eloProgress.sangria.clearedDifficulties,[0]);assert.equal(maxDifficulty(p,'sangria'),1);
});
test('trilhas têm mapas e grupos de recrutamento distintos; chefes são personagens do Elo',()=>{
 const p=profile(),a=createExpedition(p,elos[0],'hunt',0,4),b=createExpedition(p,elos[0],'pilgrimage',0,4);
 assert.notDeepEqual(a.bossIds,b.bossIds);assert.notDeepEqual(a.map.map(r=>r.map(n=>n.type)),b.map.map(r=>r.map(n=>n.type)));
 for(const id of [...a.bossIds,...b.bossIds])assert.equal(characterById[id].eloId,'sangria');assert.equal(new Set(a.bossIds).size,3);
 assert.throws(()=>createExpedition(p,elos[0],'eclipse',0,4),/bloqueada/);
 assert.ok(new Set(Array.from({length:10},(_,seed)=>createExpedition(p,elos[0],'hunt',0,seed+1).bossIds.join(','))).size>1);
});
test('vitória recruta exatamente uma alma do trio derrotado sem repetir e aumenta a dificuldade',()=>{
 const p=profile();for(let i=0;i<6;i++){const before=[...p.ownedIds],run=finish(createExpedition(p,elos[0],'hunt',i,i+100)),result=completeExpedition(p,run);
  assert.equal(p.ownedIds.length,before.length+1);assert.ok(run.bossIds.includes(result.recruitId));assert.ok(!before.includes(result.recruitId));assert.equal(maxDifficulty(p,'sangria'),i+1);
  assert.equal(p.pendingGlobalReward.choices.length,3);assert.equal(completeExpedition(p,run),null);assert.ok(claimGlobalUpgrade(p,p.pendingGlobalReward.choices[0].id));
 }
 assert.equal(characters.filter(c=>c.eloId==='sangria'&&p.ownedIds.includes(c.id)).length,6);
});
test('repetir dificuldade recruta outra alma sem duplicar recompensa global; escolha sobrevive a reload',()=>{
 const p=profile(),first=completeExpedition(p,finish(createExpedition(p,elos[0],'hunt',0,11))),saved=normalizeCampaign(JSON.parse(JSON.stringify(p)));
 assert.equal(saved.pendingGlobalReward.choices.length,3);assert.throws(()=>createExpedition(saved,elos[0]),/Legado/);
 const choice=saved.pendingGlobalReward.choices[0];assert.ok(claimGlobalUpgrade(saved,choice.id));assert.equal(claimGlobalUpgrade(saved,choice.id),false);assert.equal(saved.globalUpgrades.length,1);
 const result=completeExpedition(saved,finish(createExpedition(saved,elos[0],'hunt',0,12)));assert.notEqual(first.recruitId,result.recruitId);assert.equal(saved.pendingGlobalReward,null);assert.equal(saved.globalUpgrades.length,1);
});
test('apenas concluir o chefe concede recompensa; uma vitória de nó não pode ser contada duas vezes',()=>{
 const p=profile(),run=createExpedition(p,elos[0],'hunt',0,1),node=run.map[0][0];assert.throws(()=>completeExpedition(p,run),/não foi concluída/);assert.equal(recordEncounter(p,run,node),true);assert.equal(recordEncounter(p,run,node),false);assert.equal(p.eloProgress.sangria.combats,1);
});
test('Legados oferecem três categorias, variam e escalam com a dificuldade',()=>{
 const p=profile(),kinds=new Set();for(let i=0;i<10;i++){const choices=globalChoices(p,'sangria',2,i+1);assert.equal(new Set(choices.map(c=>c.category)).size,3);for(const choice of choices){kinds.add(choice.kind);p.globalUpgrades.push({...choice,id:choice.id+i});}}
 assert.equal(kinds.size,20);for(let seed=1;seed<25;seed++){const a=globalChoices(profile(),'sangria',0,seed),b=globalChoices(profile(),'sangria',6,seed);for(let i=0;i<3;i++){assert.equal(a[i].kind,b[i].kind);for(const key of Object.keys(a[i].effect))assert.ok(b[i].effect[key]>=a[i].effect[key]);}}
 assert.ok(Object.keys(aggregateGlobal(p)).length>=18);
});
test('Rupturas reforçam todos os tipos de combate e aplicam os modificadores no motor',()=>{
 const p=profile();for(const encounter of ['normal','elite','mini','boss']){const normal=createEnemyTeam(elos[0],ids,encounter,0,{difficulty:0}),hard=createEnemyTeam(elos[0],ids,encounter,0,{difficulty:4});assert.ok(hard[0].maxHp>normal[0].maxHp);assert.ok(hard[0].abilities[0].damage>normal[0].abilities[0].damage);const b=createBattle(ids,hard);assert.equal(b.enemies[0].armor,2);assert.equal(b.enemies[0].shield,20);b.enemies[0].hp-=10;passTurn(b);assert.equal(b.enemies[0].hp,b.enemies[0].maxHp-6);}
});
test('energia: uma na abertura; quatro tipos equiprováveis; acúmulo; menos energia após uma morte',()=>{
 let n=0;const rolls=[.01,.26,.51,.76],b=createBattle(ids,[dummy],{rng:()=>rolls[n++%4]});assert.equal(Object.values(b.resources).reduce((a,b)=>a+b),1);assert.equal(b.resources.essence,1);assert.equal(Object.values(b.enemyResources).reduce((a,b)=>a+b),1);
 passTurn(b);assert.equal(b.energyDraws.player.length,3);assert.equal(Object.values(b.resources).reduce((a,b)=>a+b),4);
 b.allies[0].hp=0;passTurn(b);assert.equal(b.energyDraws.player.length,2);assert.equal(Object.values(b.resources).reduce((a,b)=>a+b),6);
 const totals={essence:0,cinza:0,graca:0,ruptura:0};for(let i=0;i<4;i++){const x=createBattle(ids,[dummy],{rng:()=>rolls[i]});totals[Object.keys(x.resources).find(k=>x.resources[k])]++;}assert.deepEqual(Object.values(totals),[1,1,1,1]);
 const x=createBattle(ids,[dummy],{rng:()=>0});for(let i=0;i<6;i++)passTurn(x);assert.ok(x.resources.essence>5);
 const enemies=createEnemyTeam(elos[0],ids);assert.equal(Object.values(createBattle(ids,enemies).enemyResources).reduce((a,b)=>a+b),3);
});
test('Legados de combate alteram Vida, guarda, dano, aflições, cura e preparação',()=>{
 const g={maxHp:12,shield:9,armor:2,physicalPower:3,firstStrike:5,afflictionPower:2,healPower:4,shieldPower:3,regeneration:2,startingCharge:2,lifesteal:.2,essence:1};
 const b=createBattle(ids,[dummy],{globalEffects:g,rng:()=>0});assert.equal(b.allies[0].maxHp,112);assert.equal(b.allies[0].shield,14);assert.equal(b.allies[0].armor,2);assert.equal(b.allies[0].charge,2);assert.equal(b.resources.essence,2);
 b.allies[0].abilities[0]={id:'hit',name:'Golpe',target:'enemy',costs:{},damage:10,damageType:'physical',dot:{tag:'queimadura',damage:2,turns:2},shield:5};b.allies[0].hp=50;chooseAction(b,ids[0],'hit','dummy');passTurn(b);assert.ok(b.enemies[0].hp<=9977);assert.equal(b.enemies[0].dots[0].damage,4);assert.ok(b.allies[0].hp>52);
});
test('todos os 17 Elos podem ser abertos pela progressão e o elenco inteiro pode ser recrutado',()=>{
 const p=profile();let seed=100;
 for(const realm of realms)for(const elo of realm.elos){
  assert.equal(eloAccess(p,elo).unlocked,true,elo.name);
  let attempt=0;
  while(attempt<2||characters.some(c=>c.eloId===elo.id&&!p.ownedIds.includes(c.id))){
   const run=createExpedition(p,elo,attempt%2?'pilgrimage':'hunt',maxDifficulty(p,elo.id),seed++);
   while(run.availableNodeIds.length){const options=run.map.flat().filter(n=>run.availableNodeIds.includes(n.id)),node=options.find(n=>n.type==='event')||options.find(n=>['elite','mini'].includes(n.type))||options[0];if(['normal','elite','mini','boss'].includes(node.type))recordEncounter(p,run,node);if(node.type==='event')p.eloProgress[elo.id].events++;advanceTrail(run,node.id);}
   completeExpedition(p,run);if(p.pendingGlobalReward)claimGlobalUpgrade(p,p.pendingGlobalReward.choices[0].id);
   attempt++;assert.ok(attempt<14,elo.name);
  }
 }
 assert.equal(p.ownedIds.length,100);assert.equal(p.completedElos.length,17);
});
