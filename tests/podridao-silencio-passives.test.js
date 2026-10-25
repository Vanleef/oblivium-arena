import test from 'node:test';
import assert from 'node:assert/strict';
import {characters,characterById} from '../src/data.js';
import {createBattle,chooseAction,commitTurn,resolveNextAction,passTurn} from '../src/combat.js';
import {localizeText} from '../src/i18n.js';
const empty=()=>({essence:0,cinza:0,graca:0,ruptura:0});
const dummy=id=>({id,name:id,realm:'Inferno',maxHp:1000,abilities:[]});
function setup(id,team=[id],enemies=[dummy('a'),dummy('b'),dummy('c')]){
 const b=createBattle(team,enemies,{rng:()=>0,enemyPlanner:()=>[]});b.resources=empty();b.enemyResources=empty();b.resonance.bonus=0;
 for(const u of [...b.allies,...b.enemies])u.shield=0;return b;
}
function cast(b,extra={},targetId='a'){
 const u=b.allies[0];u.abilities[0]={id:'impulso',name:'Teste',target:'enemy',damage:1,costs:{},...extra};
 assert.equal(chooseAction(b,u.id,'impulso',targetId).ok,true);assert.equal(commitTurn(b).ok,true);return resolveNextAction(b);
}
function finish(b){let guard=0;while(b.phase==='resolving'&&guard++<30)resolveNextAction(b);assert.ok(guard<30)}
function counterAttack(b,extra={},targetId=b.allies[1]?.id||b.allies[0].id){
 const v=b.enemies[0];v.abilities=[{id:'enemy-hit',name:'Agressão',damage:8,damageType:'energy',target:'enemy',costs:{},...extra}];
 b.enemyPlanner=()=>[{side:'enemy',actorId:v.id,abilityId:'enemy-hit',targetId}];
}

test('Podridão e Silêncio têm 12 assinaturas distintas e oito regras editoriais traduzidas',()=>{
 const batch=characters.filter(c=>['podridao','silencio'].includes(c.eloId));assert.equal(batch.length,12);
 assert.ok(batch.every(c=>c.passive.type==='triggered'));
 const signatures=batch.map(c=>{const {name,description,art,...rules}=c.passive;return JSON.stringify(rules)});assert.equal(new Set(signatures).size,12);
 for(const c of batch)assert.notEqual(localizeText(c.passive.description,'en'),c.passive.description,c.name);
 assert.equal(characterById['a-testemunha-cega'].affinity,'graca');assert.equal(characterById['o-medico-de-vermes'].affinity,'cinza');
});

test('o registro de selo de apoio também fica inteiramente em inglês',()=>{
 assert.equal(localizeText('O Silenciador · Clamor Sufocado: O Sussurro Apoio selado.','en'),'The Silencer · Smothered Cry: The Whisper Support sealed.');
});

test('Pestilência exige dois inimigos vivos com Veneno próprio que ainda não expirou',()=>{
 for(const mode of ['two','one','foreign','dead','expired']){
  const b=setup('a-praga-andante'),u=b.allies[0];u.hp=50;
  b.enemies[0].dots=[{tag:'veneno',damage:1,turns:3,sourceId:u.id}];
  if(mode!=='one')b.enemies[1].dots=[{tag:'veneno',damage:1,turns:mode==='expired'?1:3,sourceId:mode==='foreign'?'another':u.id}];
  if(mode==='dead')b.enemies[1].hp=0;
  assert.equal(passTurn(b),true);assert.equal(u.hp,mode==='two'?53:50,mode);assert.equal(b.resources.cinza,mode==='two'?1:0,mode);
 }
});

test('a população de Veneno conserva autoria e reserva do lado adversário',()=>{
 const pest={...characterById['a-praga-andante'],id:'enemy-pest'};
 const b=setup('o-sussurro',['o-sussurro','o-credor'],[pest,dummy('b')]);for(const u of b.allies)u.passive=null;
 const owner=b.enemies[0];owner.hp=50;for(const u of b.allies)u.dots=[{tag:'veneno',damage:1,turns:3,sourceId:owner.id}];
 assert.equal(passTurn(b),true);assert.equal(owner.hp,53);assert.equal(b.enemyResources.cinza,1);assert.equal(b.resources.cinza,0);
});

test('Corrupto exige remoção real de bônus e concede um roubo por técnica em área',()=>{
 for(const mode of ['buff','none','shield','canceled']){
  const b=setup('o-corrupto');b.enemyResources.essence=3;
  for(const v of b.enemies){v.boost=mode==='buff'||mode==='canceled'?5:0;v.reduction=mode==='buff'?2:0;v.shield=mode==='shield'?20:0;if(mode==='canceled')v.counter=1}
  cast(b,{target:'all-enemies',purge:true});assert.equal(b.resources.essence,mode==='buff'?1:0,mode);assert.equal(b.allies[0].shield,mode==='buff'?4:0,mode);
 }
});

test('Inoculador exige limpeza real e dez de cura em outro aliado, sem contar efeitos benéficos ou expirados',()=>{
 for(const mode of ['valid','none','beneficial','self','overheal','defense','blocked','expired']){
  const b=setup('o-medico-de-vermes',['o-medico-de-vermes','o-sussurro']),u=b.allies[0],v=mode==='self'?u:b.allies[1];u.hp=50;v.hp=mode==='overheal'?99:50;
  if(['valid','self','overheal','defense','blocked','expired'].includes(mode))v.dots=[{tag:'veneno',damage:1,turns:mode==='expired'?0:2,sourceId:'enemy'}];
  if(mode==='beneficial')v.reactives=[{trigger:'damaged',heal:3,turns:2,sourceId:u.id,harmful:false}];
  if(mode==='blocked')v.healingBlock=1;
  cast(b,{damage:0,target:'ally',heal:15,cleanse:true,defense:mode==='defense'},v.id);
  assert.equal(b.resources.cinza,mode==='valid'?1:0,mode);assert.equal(u.hp,mode==='valid'?54:mode==='self'?65:50,mode);
  assert.equal(v.dots.length,0);
 }
});

test('Definhador ampara a menor porcentagem de Vida uma vez em área e ignora Decadência alheia ou expirada',()=>{
 for(const mode of ['own','foreign','expired','new']){
  const b=setup('o-jardim-morto',['o-jardim-morto','o-sussurro','o-credor']),u=b.allies[0],ally=b.allies[1];u.hp=50;ally.maxHp=300;ally.hp=90;b.allies[2].hp=0;
  for(const v of b.enemies)if(mode!=='new')v.dots=[{tag:'decadencia',damage:1,turns:mode==='expired'?0:2,sourceId:mode==='foreign'?'another':u.id}];
  cast(b,{target:'all-enemies',dot:{tag:'decadencia',damage:1,turns:2}});
  assert.equal(ally.hp,mode==='own'?94:90,mode);assert.equal(u.hp,50,mode);
 }
});

test('Espectador só recebe carga quando sua resposta ativa e respeita o limite de três',()=>{
 for(const [charge,ignore,expected] of [[0,false,1],[3,false,3],[0,true,0]]){
  const b=setup('o-que-observou'),u=b.allies[0];u.charge=charge;counterAttack(b,{ignoreCounters:ignore},u.id);
  cast(b,{damage:0,target:'self',counter:20},u.id);assert.equal(u.charge,charge);assert.equal(u.shield,0);
  resolveNextAction(b);resolveNextAction(b);assert.equal(u.charge,expected);assert.equal(u.shield,ignore?0:3);
 }
});

test('Cúmplice recompensa o protegido, com filtro correto, e não a si própria',()=>{
 for(const mode of ['ally','self','wrongType','deadOwner']){
  const b=setup('a-testemunha-cega',['a-testemunha-cega','o-sussurro']),u=b.allies[0],target=mode==='self'?u:b.allies[1];
  counterAttack(b,{damageType:mode==='wrongType'?'physical':'energy'},target.id);
  cast(b,{damage:0,target:'ally',counter:20,counterFilter:['energy','affliction']},target.id);
  assert.equal(b.resources.graca,0);if(mode==='deadOwner')u.hp=0; // A morte deixa 1 Graça de herança; a passiva não deve somar outra.
  resolveNextAction(b);resolveNextAction(b);
  assert.equal(b.resources.graca,['ally','deadOwner'].includes(mode)?1:0,mode);assert.equal(target.shield,mode==='ally'?4:0,mode);
 }
});

test('Cúmplice não multiplica Graça quando dois protegidos anulam a mesma ofensiva em área',()=>{
 const b=setup('a-testemunha-cega',['a-testemunha-cega','o-sussurro','o-herdeiro-cativo']);counterAttack(b,{target:'all-enemies'});
 cast(b,{damage:0,target:'team',counter:20},b.allies[0].id);resolveNextAction(b);resolveNextAction(b);
 assert.equal(b.resources.graca,1);assert.equal(b.allies[1].shield,4);assert.equal(b.allies[2].shield,0);
});

test('a resposta de uma origem morta não é atribuída à passiva do protegido',()=>{
 const b=setup('o-sussurro',['o-sussurro','o-que-observou']),owner=b.allies[0],protectedUnit=b.allies[1];
 counterAttack(b,{},protectedUnit.id);cast(b,{damage:0,target:'ally',counter:20},protectedUnit.id);owner.hp=0;
 resolveNextAction(b);resolveNextAction(b);
 assert.equal(protectedUnit.charge,0);assert.equal(protectedUnit.shield,0);assert.equal(b.enemies[0].hp,980);
});

test('autoria e beneficiário da resposta sobrevivem à serialização entre as ações',()=>{
 const b=setup('a-testemunha-cega',['a-testemunha-cega','o-sussurro']);counterAttack(b);
 cast(b,{damage:0,target:'ally',counter:20},b.allies[1].id);
 const restored=JSON.parse(JSON.stringify(b));restored.enemyPlanner=b.enemyPlanner;
 resolveNextAction(restored);resolveNextAction(restored);
 assert.equal(restored.resources.graca,1);assert.equal(restored.allies[0].shield,0);assert.equal(restored.allies[1].shield,4);
});

test('uma preparação mais fraca conserva valor, filtro e autoria da resposta mais forte',()=>{
 const b=setup('a-testemunha-cega',['a-testemunha-cega','o-sussurro','o-herdeiro-cativo']),target=b.allies[1];
 target.counter=30;target.counterSourceId=b.allies[2].id;target.counterFilter=['energy'];target.counterEffect={drainEssence:{resource:'essence',amount:1}};
 b.enemyResources.essence=2;counterAttack(b,{},target.id);
 cast(b,{damage:0,target:'ally',counter:20,counterFilter:['physical']},target.id);
 assert.equal(target.counter,30);assert.equal(target.counterSourceId,b.allies[2].id);assert.deepEqual(target.counterFilter,['energy']);
 resolveNextAction(b);resolveNextAction(b);assert.equal(b.resources.graca,0);assert.equal(b.enemyResources.essence,1);assert.equal(b.enemies[0].hp,970);
});

test('Silenciador exige dano espiritual efetivo contra Enfraquecido anterior',()=>{
 for(const [type,weakened,shield,expected] of [['energy',1,0,1],['physical',1,0,0],['energy',0,0,0],['energy',1,50,0]]){
  const b=setup('o-surdo'),target=b.enemies[0];target.weakened=weakened;target.shield=shield;
  cast(b,{damageType:type,weaken:1});assert.equal(target.sealSupport,expected);
 }
});

test('selo do Silenciador impede apoio na resolução e preserva o custo da ação cancelada',()=>{
 const b=setup('o-surdo');const v=b.enemies[0];v.hp=500;v.weakened=2;v.abilities=[{id:'heal',name:'Cura',target:'self',heal:10,costs:{essence:1}}];b.enemyResources.essence=1;
 b.enemyPlanner=()=>[{side:'enemy',actorId:v.id,abilityId:'heal',targetId:v.id}];cast(b,{damageType:'energy'});resolveNextAction(b);
 const event=resolveNextAction(b);assert.equal(event.event.skipped,true);assert.equal(v.hp,499);assert.equal(b.enemyResources.essence,1);
});

test('Desertor aguarda uma abertura física real e não consome Oportunismo na primeira Exposição',()=>{
 for(const mode of ['valid','new','energy','absorbed','empty']){
  const b=setup('o-vigia-ausente'),u=b.allies[0],v=b.enemies[0];u.hp=50;v.exposed=mode==='new'?0:1;v.shield=mode==='absorbed'?50:0;b.enemyResources.ruptura=mode==='empty'?0:2;
  cast(b,{damageType:mode==='energy'?'energy':'physical',expose:1});const active=['valid','empty'].includes(mode);
  assert.equal(u.hp,active?56:50,mode);assert.equal(u.passiveUsed,active,mode);assert.equal(b.resources.ruptura,mode==='valid'?1:0,mode);
 }
});

test('Oportunismo acha o alvo elegível em área e continua gasto após serialização',()=>{
 const b=setup('o-vigia-ausente');b.allies[0].hp=50;b.enemies[2].exposed=1;b.enemyResources.ruptura=2;
 cast(b,{target:'all-enemies'});assert.equal(b.allies[0].hp,56);assert.equal(b.resources.ruptura,1);finish(b);
 const restored=JSON.parse(JSON.stringify(b));restored.enemyPlanner=()=>[];restored.allies[0].hp=40;restored.enemies[0].exposed=1;
 cast(restored,{});assert.equal(restored.allies[0].hp,40);assert.equal(restored.resources.ruptura,1);
});

test('a última aplicação letal de Queimadura ainda notifica a Brasa antes da expiração',()=>{
 const b=setup('a-brasa-eterna'),u=b.allies[0];u.hp=50;b.enemies[0].hp=1;b.enemies[0].dots=[{tag:'queimadura',damage:1,turns:1,sourceId:u.id}];
 assert.equal(passTurn(b),true);assert.equal(u.hp,54);assert.equal(b.resources.ruptura,1);
});
