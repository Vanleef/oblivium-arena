import test from 'node:test';
import assert from 'node:assert/strict';
import {characters,elos} from '../src/data.js';
import {allSkillForms} from '../src/kits.js';
import {createBattle,chooseAction,passTurn,commitTurn,resolveNextAction,getValidTargets,getAvailableResources,createEnemyTeam,moveQueuedAction} from '../src/combat.js';
import {refreshSkillForms} from '../src/skill-state.js';
import {renderBattleDetail,renderBattle} from '../src/battle-view.js';
const char=name=>characters.find(c=>c.name===name);
const dummy=(id='alvo')=>({id,name:id,realm:'Inferno',affinity:'cinza',maxHp:10000,abilities:[]});
function battle(name,enemies=[dummy()]){const c=char(name),b=createBattle([c.id],enemies,{rng:()=>0});b.resources={essence:100,cinza:100,graca:100,ruptura:100};return b;}
const skill=(b,i)=>b.allies[0].abilities[i];
function cast(b,i,targetId){const a=skill(b,i);assert.equal(chooseAction(b,b.allies[0].id,a.id,targetId||getValidTargets(b,b.allies[0],a)[0]?.id).ok,true,a.name);assert.equal(passTurn(b),true);return a;}
function finish(b){let n=0;while(b.phase==='resolving'&&n++<20)resolveNextAction(b);assert.ok(n<20);}

test('100 kits têm estruturas e 56 técnicas alternativas e preservam as quatro posições e a defesa',()=>{
 assert.equal(characters.filter(c=>c.mechanic).length,100);assert.equal(characters.flatMap(c=>c.abilities.flatMap(a=>a.forms||[])).length,56);
 for(const c of characters){assert.equal(c.abilities.length,4);assert.ok(!c.abilities[3].forms);for(const a of allSkillForms(c)){assert.ok(a.description&&a.cost>0);assert.ok(a.classes?.length);if(a.formKey)assert.notEqual(a.id,'despertar');}}
 assert.equal(new Set(characters.flatMap(c=>allSkillForms(c).map(a=>a.name))).size,456);
});

test('usar uma preparação troca a técnica e mantém custo, fila e ação únicos por alma',()=>{
 const b=battle('O Escudo Vivo');cast(b,0);assert.equal(skill(b,0).name,'Avanço da Égide');assert.equal(skill(b,0).id,'impulso');
 assert.equal(chooseAction(b,b.allies[0].id,'impulso','alvo').ok,true);assert.equal(getAvailableResources(b).graca,b.resources.graca-1);assert.equal(getAvailableResources(b).essence,b.resources.essence-1);
 assert.equal(chooseAction(b,b.allies[0].id,'despertar',b.allies[0].id).ok,true);assert.equal(b.queue.length,1);
 b.queue=[];cast(b,0);assert.equal(skill(b,0).name,'Golpe do Bastião');
});

test('janelas de 2 turnos sobrevivem aos dois planejamentos e expiram no terceiro',()=>{
 const b=battle('O Escudo Vivo');cast(b,0);assert.equal(b.round,2);assert.equal(skill(b,0).formKey,'advance');passTurn(b);assert.equal(b.round,3);assert.equal(skill(b,0).formKey,'advance');passTurn(b);assert.equal(b.round,4);assert.equal(skill(b,0).formKey,'base');
});

test('uma sequência pode trocar o mesmo espaço três vezes e ficar presa à mesma vítima',()=>{
 const b=battle('O Passo Interrompido',[dummy('um'),dummy('dois')]);cast(b,0,'um');assert.equal(skill(b,0).name,'Passo Seguinte');assert.deepEqual(getValidTargets(b,b.allies[0],skill(b,0)).map(u=>u.id),['um']);
 cast(b,0,'um');assert.equal(skill(b,0).name,'Passo Anterior');cast(b,0,'um');assert.equal(skill(b,0).name,'Fissura do Passo');
});

test('a queda da vítima devolve a técnica base em vez de deixar um espaço sem alvo',()=>{
 const b=battle('O Açougueiro',[dummy('um'),dummy('dois')]);cast(b,0,'um');b.enemies[0].hp=0;refreshSkillForms(b);assert.equal(skill(b,0).formKey,'base');assert.deepEqual(getValidTargets(b,b.allies[0],skill(b,0)).map(u=>u.id),['dois']);
});

test('transformações alteram vários espaços e o desfecho encerra a forma inteira',()=>{
 const b=battle('O Ódio Encarnado');cast(b,1);assert.equal(skill(b,0).name,'Punho do Ódio Solto');assert.equal(skill(b,2).name,'Ressentimento sem Freio');assert.equal(skill(b,3).cooldown,4);
 cast(b,2);assert.equal(skill(b,0).formKey,'base');assert.equal(skill(b,2).formKey,'base');assert.equal(b.allies[0].cooldowns.voto,2);
});

test('postura permanece até a reversão voluntária e não muda a quarta defesa',()=>{
 const b=battle('A Pele Alheia');cast(b,1);for(let i=0;i<5;i++)passTurn(b);assert.equal(skill(b,0).name,'Lâmina da Pele Nova');assert.equal(skill(b,1).name,'Descartar a Forma');cast(b,1);assert.equal(skill(b,0).formKey,'base');assert.equal(skill(b,1).formKey,'base');
});

test('forma por Vida muda alvo, custo e tipo e reverte após recuperar Vida',()=>{
 const b=battle('O Devorador');b.allies[0].hp=45;refreshSkillForms(b);assert.equal(skill(b,0).name,'Fome sem Corpo');assert.equal(skill(b,0).damageType,'affliction');assert.equal(skill(b,0).cost,2);
 cast(b,0);assert.ok(b.allies[0].hp>50);assert.equal(skill(b,0).name,'Mordida da Alma');
});

test('limiar de cargas oferece uma técnica com outro alvo e seu gasto restaura a base',()=>{
 const b=battle('A Semente');b.allies[0].charge=3;refreshSkillForms(b);assert.equal(skill(b,0).name,'Fruto do Porvir');assert.equal(skill(b,0).target,'self');cast(b,0);assert.equal(b.allies[0].charge,0);assert.equal(skill(b,0).name,'Semente da Ruptura');
});

test('a colheita tem dois desfechos exclusivos: usar um fecha ambos',()=>{
 for(const choice of [1,2]){const b=battle('A Rainha dos Fungos');cast(b,0);assert.equal(skill(b,1).name,'Florescer para os Vivos');assert.equal(skill(b,2).name,'Esporos da Última Colheita');cast(b,choice);assert.equal(skill(b,1).formKey,'base');assert.equal(skill(b,2).formKey,'base');assert.equal(b.allies[0].charge,0);}
});

test('a continuação de controle abre antes da recarga e depois bloqueia os três turnos',()=>{
 const b=battle('A Marionetista de Nervos');cast(b,0);cast(b,1);assert.equal(skill(b,1).name,'Manter o Comando');assert.equal(b.allies[0].cooldowns.tecnica,undefined);cast(b,1);assert.equal(skill(b,1).name,'Puxar a Vontade');
 for(let n=3;n>=1;n--){assert.equal(b.allies[0].cooldowns.tecnica,n);assert.equal(chooseAction(b,b.allies[0].id,'tecnica','alvo').ok,false);passTurn(b);}assert.equal(b.allies[0].cooldowns.tecnica,undefined);
});

test('recusar a continuação inicia a recarga na expiração, sem um turno extra escondido',()=>{
 const b=battle('A Marionetista de Nervos');cast(b,0);cast(b,1);passTurn(b);assert.equal(skill(b,1).formKey,'base');assert.equal(b.allies[0].cooldowns.tecnica,2);passTurn(b);assert.equal(b.allies[0].cooldowns.tecnica,1);passTurn(b);assert.equal(b.allies[0].cooldowns.tecnica,undefined);
});

test('controle ligado termina se a ligação for quebrada por Invulnerável ou Atordoado',()=>{
 for(const effect of ['invulnerable','stunned']){const b=battle('A Marionetista de Nervos');cast(b,0);cast(b,1);if(effect==='stunned')b.allies[0].stunned=1;else b.enemies[0].invulnerable=1;refreshSkillForms(b);assert.equal(skill(b,1).formKey,'base');assert.equal(b.allies[0].cooldowns.tecnica,2);}
});

test('contra-ataque só abre a resposta quando é ativado, contra o agressor correto',()=>{
 const b=battle('A Viúva Escarlate');cast(b,1);assert.equal(skill(b,0).formKey,'base');
 const e=b.enemies[0];e.abilities=[{id:'hit',name:'Golpe',target:'enemy',costs:{},damage:10}];b.intents=[{actorId:e.id,abilityId:'hit',targetId:b.allies[0].id,side:'enemy'}];cast(b,1);assert.equal(skill(b,0).name,'Fio Reverso');assert.equal(skill(b,0).formTargetId,e.id);
});

test('contra-ataque concedido a um aliado evolui o kit de quem o criou',()=>{
 const owner=char('O Espelho'),ally=char('O Escudo Vivo'),b=createBattle([owner.id,ally.id],[dummy()],{rng:()=>0});b.resources={essence:100,cinza:100,graca:100,ruptura:100};const e=b.enemies[0];e.abilities=[{id:'hit',name:'Golpe',costs:{},target:'enemy',damage:10}];b.intents=[{actorId:e.id,abilityId:'hit',targetId:ally.id,side:'enemy'}];
 chooseAction(b,owner.id,'tecnica',ally.id);passTurn(b);assert.equal(b.allies[0].abilities[0].name,'Estilhaço Devolvido');assert.equal(b.allies[1].abilities[0].name,'Golpe do Bastião');
});

test('preparações anuladas não mudam técnicas nem consomem munição',()=>{
 const b=battle('O Açougueiro');b.enemies[0].counter=1;cast(b,0);assert.equal(skill(b,0).formKey,'base');
 const limited=battle('O Colecionador de Cabeças');limited.enemies[0].counter=1;cast(limited,2);assert.equal(limited.allies[0].skillUses.voto,undefined);
});

test('munição esgotada muda o golpe e a recarga continua pertencendo ao espaço',()=>{
 const b=battle('O Colecionador de Cabeças');cast(b,2);passTurn(b);passTurn(b);cast(b,2);assert.equal(skill(b,2).name,'Caça sem Troféus');assert.equal(b.allies[0].cooldowns.voto,2);assert.equal(skill(b,2).usesLeft,0);
});

test('forma que muda após confirmação cancela a ação e preserva seus recursos',()=>{
 const d=char('O Devorador'),h=char('O Escudo Vivo'),b=createBattle([d.id,h.id],[dummy()],{rng:()=>0});b.resources={essence:10,cinza:10,graca:10,ruptura:10};b.allies[0].hp=45;
 b.allies[1].abilities[0]={id:'heal',name:'Cura',target:'ally',costs:{},heal:30};chooseAction(b,d.id,'impulso','alvo');chooseAction(b,h.id,'heal',d.id);moveQueuedAction(b,h.id,-1);commitTurn(b);resolveNextAction(b);const energy={...b.resources},event=resolveNextAction(b).event;assert.equal(event.skipped,true);assert.match(event.summary,/forma mudou/);assert.deepEqual(b.resources,energy);finish(b);
});

test('todas as 56 formas podem resolver sem NaN, custos gratuitos ou alteração de definições',()=>{
 for(const c of characters)for(const root of c.abilities)for(const form of root.forms||[]){const b=battle(c.name),u=b.allies[0];u.hp=60;u.charge=3;if(form.requiredMark)b.enemies[0].marks[form.requiredMark]={sourceId:u.id,turns:5};u.skillForms[root.id]={form:form.formKey,expiresAt:10,...(form.requiresLink?{targetId:'alvo'}:{})};refreshSkillForms(b);cast(b,c.abilities.indexOf(root));for(const v of [...b.allies,...b.enemies]){assert.ok(Number.isFinite(v.hp));assert.ok(v.hp>=0&&v.hp<=v.maxHp);}assert.equal(c.abilities[3].cooldown,4);}
});

test('formas inimigas recebem a escala de elite e Ruptura e podem entrar no plano da IA',()=>{
 const elo=elos.find(e=>e.id==='protecao'),normal=createEnemyTeam(elo,[],'normal',0),elite=createEnemyTeam(elo,[],'elite',0,{difficulty:3});assert.ok(elite[0].abilities[0].forms[0].damage>normal[0].abilities[0].forms[0].damage);
 const guard=char('O Escudo Vivo'),enemy={...guard,id:'guarda',abilities:[guard.abilities[0],guard.abilities[3]]},b=createBattle([char('A Brasa Eterna').id],[enemy],{rng:()=>.6});b.enemyResources.essence=10;b.enemyResources.graca=10;passTurn(b);assert.equal(b.enemies[0].abilities[0].name,'Avanço da Égide');passTurn(b);assert.ok(b.log.some(l=>l.includes('Avanço da Égide')));
});

test('a interface mantém 12 ícones e distingue técnica ativa, descrição, custo e alternativas',()=>{
 const b=battle('O Escudo Vivo');cast(b,0);const state={battle:b,battleNode:{label:'Treino'},focusSkill:{actorId:b.allies[0].id,abilityId:'impulso'}};
 const detail=renderBattleDetail(state);assert.match(detail,/Golpe do Bastião → Avanço da Égide/);assert.match(detail,/VARIAÇÕES/);assert.match(detail,/Custo: 1 Graça \+ 1 Essência/);assert.match(renderBattle(state,elos[0]),/skill-evolved/);
});
