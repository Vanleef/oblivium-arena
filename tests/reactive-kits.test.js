import test from 'node:test';
import assert from 'node:assert/strict';
import {characters,elos} from '../src/data.js';
import {createBattle,chooseAction,passTurn,commitTurn,resolveNextAction,getAbilityResourceCosts,createEnemyTeam} from '../src/combat.js';
import {allSkillForms} from '../src/kits.js';
import {skillAvailability} from '../src/battle-view.js';
const char=name=>characters.find(c=>c.name===name||c.previousName===name);
const dummy={id:'alvo',name:'Alvo',realm:'Inferno',affinity:'cinza',maxHp:10000,abilities:[]};
function battle(name='O Açougueiro'){const b=createBattle([char(name).id],[dummy],{rng:()=>0});b.resources={essence:100,cinza:100,graca:100,ruptura:100};b.allies[0].passive=null;return b;}
function cast(b,a,target='alvo'){const u=b.allies[0];if(typeof a==='object'){u.abilities[0]=a;a=a.id;}assert.equal(chooseAction(b,u.id,a,target).ok,true);passTurn(b);}
function enemyAction(b,a){const e=b.enemies[0];e.abilities=[a];b.enemyPlanner=s=>s.intents;b.intents=[{actorId:e.id,abilityId:a.id,targetId:a.target==='self'?e.id:b.allies[0].id,side:'enemy'}];}
const attack={id:'golpe',name:'Golpe',target:'enemy',damage:1,costs:{}};
const support={id:'apoio',name:'Apoio',target:'self',heal:1,costs:{}};

test('os 100 kits têm estrutura e descrições dos novos efeitos, sem técnicas gratuitas',()=>{
 for(const c of characters){assert.ok(c.mechanic,c.name);for(const a of allSkillForms(c)){assert.equal(Object.values(getAbilityResourceCosts(c,a)).reduce((n,v)=>n+v,0),a.cost);for(const [field,term]of [['reactive','Ativa uma vez'],['regen','Regeneração'],['sealSupport','Sela técnicas de apoio'],['sealAttack','Sela técnicas ofensivas'],['healingBlock','cura recebida'],['escalating','Atordoamento zera'],['reduceCooldown','recargas não defensivas']])if(a[field])assert.ok(a.description.includes(term),`${c.name}/${a.name}: ${field}`);}}
});

test('oito novos kits reagem a ataques, dano ou inatividade com efeito e custo descritos',()=>{
 const ids=['o-escudo-vivo','a-mao-que-cura','a-pele-alheia','o-primeiro-canto','o-que-ficou','o-que-observou','o-relogio-afogado','a-linha-partida'];
 for(const id of ids){const c=characters.find(unit=>unit.id===id),skill=c.abilities[1];assert.ok(skill.reactive,c.name);assert.ok(['attack','damaged','idle'].includes(skill.reactive.trigger),c.name);assert.match(skill.description,/Efeito reativo/);assert.match(skill.description,/Ativa uma vez/);assert.equal(Object.values(getAbilityResourceCosts(c,skill)).reduce((n,v)=>n+v,0),skill.cost,c.name);}
 assert.ok(characters.filter(c=>c.abilities.slice(0,3).some(a=>a.reactive)).length>=26);
});

test('armadilha de ataque ativa uma vez e não reage a apoio ou inatividade',()=>{
 for(const kind of ['attack','support','idle']){const b=battle();if(kind!=='idle')enemyAction(b,kind==='attack'?attack:support);cast(b,{id:'trap',name:'Armadilha',damage:0,target:'enemy',costs:{},reactive:{trigger:'attack',damage:12,turns:1}});assert.equal(b.enemies[0].hp,kind==='attack'?9988:10000);assert.equal(b.enemies[0].reactives.length,0);passTurn(b);assert.equal(b.enemies[0].hp,kind==='attack'?9988:10000);}
});

test('armadilha de apoio não pune a defesa pessoal; a de qualquer técnica pune',()=>{
 for(const trigger of ['support','skill']){const b=battle();enemyAction(b,{id:'defesa',name:'Defesa',target:'self',invulnerable:1,defense:true,costs:{}});cast(b,{id:'trap',name:'Armadilha',damage:0,target:'enemy',costs:{},reactive:{trigger,damage:9,turns:1}});assert.equal(b.enemies[0].hp,trigger==='skill'?9991:10000);}
});

test('armadilha de inatividade só dispara se nenhuma técnica for usada',()=>{
 for(const idle of [true,false]){const b=battle();if(!idle)enemyAction(b,attack);cast(b,{id:'trap',name:'Pavio',damage:0,target:'enemy',costs:{},reactive:{trigger:'idle',damage:13,turns:1}});assert.equal(b.enemies[0].hp,idle?9987:10000);}
});

test('selo cancela a ação confirmada sem cobrar Essência e expira após a vez correta',()=>{
 const b=battle();b.enemyResources.essence=3;enemyAction(b,{...attack,costs:{essence:1}});cast(b,{id:'selo',name:'Selo',damage:0,target:'enemy',costs:{},sealAttack:1});assert.equal(b.allies[0].hp,100);assert.equal(b.enemyResources.essence,4);assert.equal(b.enemies[0].sealAttack,0);assert.ok(b.log.every(l=>!l.includes('Alvo usa Golpe')));
 b.allies[0].sealSupport=1;assert.equal(skillAvailability(b,b.allies[0],b.allies[0].abilities[3]),'');assert.equal(chooseAction(b,b.allies[0].id,'despertar',b.allies[0].id).ok,true);
});

test('limpeza remove selos, redução de cura e armadilhas hostis e preserva proteção reativa',()=>{
 const b=battle(),u=b.allies[0];u.hp=50;u.sealAttack=1;u.healingBlock=.5;u.reactives=[{harmful:true,sourceId:'alvo',skillId:'armadilha',trigger:'support',damage:20,turns:1},{harmful:false,sourceId:u.id,skillId:'guarda',trigger:'damaged',damage:4,turns:1}];
 cast(b,{id:'limpar',name:'Limpar',damage:0,target:'self',costs:{},cleanse:true},u.id);assert.equal(u.hp,50);assert.equal(u.healingBlock,0);assert.equal(u.sealAttack,0);assert.ok(!u.reactives.some(r=>r.harmful));
});

test('regeneração restaura nos dois próximos inícios e não acumula cópias da mesma técnica',()=>{
 const b=battle(),u=b.allies[0];u.hp=40;const regen={id:'regen',name:'Regenerar',damage:0,target:'self',costs:{},regen:{heal:7,turns:2}};cast(b,regen,u.id);assert.equal(u.hp,47);cast(b,regen,u.id);assert.equal(u.hp,54);assert.equal(u.regens.length,1);passTurn(b);assert.equal(u.hp,61);passTurn(b);assert.equal(u.hp,61);
});

test('a cura reduzida atinge apoio recebido e inclui arredondamento inteiro',()=>{
 const b=battle();b.enemies[0].hp=9000;enemyAction(b,{...support,heal:15});cast(b,{id:'ruina',name:'Ruína',damage:0,target:'enemy',costs:{},healingBlock:.5});assert.equal(b.enemies[0].hp,9007);assert.equal(b.enemies[0].healingBlock,.5);passTurn(b);assert.equal(b.enemies[0].healingBlock,0);
});

test('reação de dano só dispara ao perder Vida por uma habilidade nova',()=>{
 for(const blocked of [true,false]){const b=battle(),u=b.allies[0];u.shield=blocked?20:0;enemyAction(b,{...attack,damage:10});cast(b,{id:'guarda',name:'Guarda',target:'self',costs:{},reactive:{trigger:'damaged',damage:6,turns:1}},u.id);assert.equal(b.enemies[0].hp,blocked?10000:9994);assert.equal(u.reactives.length,0);}
});

test('a reação de cura compartilhada conta uma vez quando usuário e alvo são a mesma alma',()=>{
 const b=battle(),u=b.allies[0];u.hp=50;enemyAction(b,{...attack,damage:10});cast(b,{id:'pacto',name:'Pacto',target:'self',costs:{},reactive:{trigger:'damaged',healBoth:6,turns:1}},u.id);assert.equal(u.hp,46);
});

test('crescimento tem teto e Atordoamento zera o bônus',()=>{
 const b=battle('A Boca de Vidro'),damage=[];for(let i=0;i<5;i++){const hp=b.enemies[0].hp;cast(b,'impulso');damage.push(hp-b.enemies[0].hp);}assert.deepEqual(damage,[15,18,21,24,24]);enemyAction(b,{...attack,damage:0,stun:1});passTurn(b);assert.deepEqual(b.allies[0].skillGrowth,{});
});

test('remoção de Defesa gera apenas a guarda correspondente à quantidade realmente removida',()=>{
 const b=battle('O Estômago sem Fundo');b.enemies[0].shield=12;cast(b,'impulso');assert.equal(b.allies[0].shield,6);assert.equal(b.enemies[0].shield,0);
});

test('conversão em área usa a mesma reserva em cada alvo e a consome uma única vez',()=>{
 const c=char('O Açougueiro'),b=createBattle([c.id],[0,1,2].map(i=>({...dummy,id:'alvo'+i})),{rng:()=>0});b.allies[0].passive=null;b.allies[0].shield=40;
 cast(b,{id:'colapso',name:'Colapso',target:'all-enemies',damage:20,costs:{},shieldToDamage:{ratio:.25,cap:10,consume:true}},'alvo0');assert.ok(b.enemies.every(e=>e.hp===9970));assert.equal(b.allies[0].shield,0);
});

test('purga calcula o bônus antes de remover vantagens e pode atravessar contra-ataque',()=>{
 const b=battle('A Testemunha Íntegra');b.enemies[0].counter=20;b.enemies[0].boost=5;b.enemies[0].reduction=5;cast(b,'tecnica');assert.equal(b.enemies[0].hp,9973);assert.equal(b.enemies[0].counter,0);assert.equal(b.allies[0].hp,100);
});

test('reduzir recargas nunca reduz a quarta defesa',()=>{
 const b=battle(),u=b.allies[0];u.cooldowns={tecnica:3,voto:2,despertar:4};u.abilities[0]={id:'tempo',name:'Tempo',target:'self',costs:{},reduceCooldown:1};chooseAction(b,u.id,'tempo',u.id);commitTurn(b);resolveNextAction(b);assert.equal(u.cooldowns.tecnica,2);assert.equal(u.cooldowns.voto,1);assert.equal(u.cooldowns.despertar,4);
});

test('reações inimigas também recebem a escala de encontro e Ruptura',()=>{
 const elo=elos.find(e=>e.id==='chama'),normal=createEnemyTeam(elo,[],'normal',0),elite=createEnemyTeam(elo,[],'elite',0,{difficulty:3});assert.ok(elite[0].abilities[0].reactive.damage>normal[0].abilities[0].reactive.damage);
});


test('uma armadilha de inatividade encerra o confronto antes de novas ações e informa a origem visual',()=>{
 const b=battle(),u=b.allies[0];u.hp=5;u.reactives=[{sourceId:'alvo',skillId:'fim',label:'Fim',harmful:true,trigger:'idle',damage:10,turns:1}];commitTurn(b);const result=resolveNextAction(b);assert.equal(b.phase,'defeat');assert.equal(result.done,true);assert.equal(result.event.reactions[0].actorId,'alvo');assert.equal(result.event.reactions[0].targetId,u.id);
});

test('Legado de aflição aumenta a armadilha sem multiplicar suas ativações',()=>{
 const b=battle();b.global.afflictionPower=3;cast(b,{id:'trap',name:'Armadilha',target:'enemy',costs:{},reactive:{trigger:'idle',damage:10,turns:1}});assert.equal(b.enemies[0].hp,9987);passTurn(b);assert.equal(b.enemies[0].hp,9987);
});
