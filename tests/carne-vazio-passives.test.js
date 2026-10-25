import test from 'node:test';
import assert from 'node:assert/strict';
import {characters} from '../src/data.js';
import {createBattle,chooseAction,commitTurn,resolveNextAction} from '../src/combat.js';
import {localizeText} from '../src/i18n.js';

const essenceIds=['essence','cinza','graca','ruptura'];
const empty=()=>Object.fromEntries(essenceIds.map(id=>[id,0]));
const dummy=(id='a')=>({id,name:id,realm:'Inferno',maxHp:1000,abilities:[]});
function setup(id,team=[id]){
 const battle=createBattle(team,[dummy('a'),dummy('b')],{rngSeed:123,enemyPlanner:()=>[]});
 battle.resources=empty();battle.enemyResources=empty();battle.resonance.bonus=0;
 for(const unit of [...battle.allies,...battle.enemies]){unit.shield=0;unit.charge=0;}
 return battle;
}
function cast(battle,ability,targetId='a'){
 const actor=battle.allies[0];
 actor.abilities[0]={id:'impulso',name:'Teste da passiva',target:'enemy',damage:1,costs:{},...ability};
 assert.equal(chooseAction(battle,actor.id,'impulso',targetId).ok,true);
 assert.equal(commitTurn(battle).ok,true);
 resolveNextAction(battle);
 return actor;
}

test('Carne e Vazio completam doze passivas com assinatura própria e texto em inglês',()=>{
 const batch=characters.filter(c=>['carne','vazio'].includes(c.eloId));
 assert.equal(batch.length,12);
 assert.ok(batch.every(c=>c.passive.type==='triggered'),batch.map(c=>c.name).join(', '));
 const signatures=batch.map(c=>{const {name,description,art,...rules}=c.passive;return JSON.stringify(rules);});
 assert.equal(new Set(signatures).size,12);
 const reviewed=['o-que-possui','o-desejo-quebrado','a-marionetista-de-nervos','a-costureira','o-que-apaga','o-fim-silencioso','o-menino-sem-sombra','a-ultima-pagina'];
 for(const id of reviewed){
  const character=characters.find(c=>c.id===id);
  assert.ok(character.passive.description.length>40,id);
  assert.notEqual(localizeText(character.passive.name,'en'),character.passive.name,id+' name');
  assert.notEqual(localizeText(character.passive.description,'en'),character.passive.description,id+' description');
 }
});

test('O Usurpador cobra a própria Marca, não marca alheia nem a primeira inscrição',()=>{
 for(const owner of ['none','other','own']){
  const battle=setup('o-que-possui');const actor=battle.allies[0],target=battle.enemies[0];actor.hp=50;
  battle.enemyResources.essence=2;
  if(owner!=='none')target.marks.posse={sourceId:owner==='own'?actor.id:'another',turns:3};
  cast(battle,{},target.id);
  assert.equal(actor.hp,owner==='own'?54:50,owner);
  assert.equal(battle.enemyResources.essence,owner==='own'?1:2,owner);
  assert.equal(battle.resources.essence,owner==='own'?1:0,owner);
 }
});

test('O Profanador precisa estar ferido, atingir com perfuração e encontrar alvo Exposto',()=>{
 for(const mode of ['valid','healthy','not-exposed','not-piercing']){
  const battle=setup('o-desejo-quebrado'),actor=battle.allies[0];actor.hp=mode==='healthy'?51:50;
  if(mode!=='not-exposed')battle.enemies[0].exposed=1;
  cast(battle,{damageType:mode==='not-piercing'?'physical':'piercing'});
  const active=mode==='valid';
  assert.equal(actor.charge,active?1:0,mode);assert.equal(actor.shield,active?3:0,mode);
 }
});

test('A Marionetista só enfraquece a vítima que já carrega sua Marca Nervosa',()=>{
 for(const owner of ['other','own']){
  const battle=setup('a-marionetista-de-nervos'),actor=battle.allies[0],target=battle.enemies[0];
  target.marks.nervo={sourceId:owner==='own'?actor.id:'another',turns:3};
  cast(battle,{},target.id);
  assert.equal(target.weakened,owner==='own'?1:0,owner);
 }
});

test('A Suturadora precisa limpar e curar de verdade outro aliado para ancorá-lo',()=>{
 for(const mode of ['valid','self','no-cleanse','overheal']){
  const battle=setup('a-costureira',['a-costureira','o-que-possui']);
  const actor=battle.allies[0],ally=battle.allies[1];ally.hp=mode==='overheal'?99:50;
  if(mode!=='no-cleanse')ally.dots=[{tag:'sangramento',damage:2,turns:2,sourceId:'enemy'}];
  const target=mode==='self'?actor:ally;
  cast(battle,{target:'ally',damage:0,heal:20,cleanse:true},target.id);
  assert.equal(ally.shield,mode==='valid'?5:0,mode);
  assert.equal(battle.resources.graca,mode==='valid'?1:0,mode);
 }
});

test('O Anulador só recebe carga e drena Graça quando remove uma vantagem real',()=>{
 for(const active of [false,true]){
  const battle=setup('o-que-apaga');const target=battle.enemies[0];battle.enemyResources.graca=2;
  if(active)target.boost=5;
  cast(battle,{damage:0,purge:true});
  assert.equal(battle.allies[0].charge,active?1:0);
  assert.equal(battle.enemyResources.graca,active?1:2);
 }
});

test('O Arauto lucra com a execução apenas se o alvo já estiver Atordoado',()=>{
 for(const stunned of [false,true]){
  const battle=setup('o-fim-silencioso');if(stunned)battle.enemies[0].stunned=1;
  cast(battle,{});
  assert.equal(battle.allies[0].charge,stunned?1:0);
  assert.equal(battle.resources.ruptura,stunned?1:0);
 }
});

test('O Desolador converte carga em fôlego e Coringa no limiar de Vida',()=>{
 for(const mode of ['valid','healthy','no-charge']){
  const battle=setup('o-menino-sem-sombra'),actor=battle.allies[0];actor.hp=mode==='healthy'?51:50;actor.charge=mode==='no-charge'?0:1;
  cast(battle,{spendCharge:true});
  const active=mode==='valid';
  assert.equal(actor.hp,active?55:mode==='healthy'?51:50,mode);
  assert.equal(battle.resources.essence,active?1:0,mode);
 }
});

test('A Escriba recolhe carga e Cinza ao consumir a própria Marca da Página',()=>{
 for(const owner of ['other','own']){
  const battle=setup('a-ultima-pagina'),actor=battle.allies[0],target=battle.enemies[0];
  target.marks.pagina={sourceId:owner==='own'?actor.id:'another',turns:3};
  cast(battle,{combo:{condition:'mark:pagina',bonusDamage:0,consume:true}},target.id);
  assert.equal(actor.charge,owner==='own'?1:0,owner);
  assert.equal(battle.resources.cinza,owner==='own'?1:0,owner);
 }
});
