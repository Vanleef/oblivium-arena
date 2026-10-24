import test from 'node:test';
import assert from 'node:assert/strict';
import { characters, characterById } from '../src/data.js';
import { createBattle, chooseAction, commitTurn, resolveNextAction, getAbilityResourceCosts } from '../src/combat.js';

const essenceIds = ['essence', 'cinza', 'graca', 'ruptura', 'coringa'];
const emptyPool = () => Object.fromEntries(essenceIds.map(id => [id, 0]));
const dummy = (id='alvo') => ({ id, name: 'Alvo', realm: 'Inferno', maxHp: 1000, abilities: [] });
const rich = battle => { for (const id of essenceIds) battle.resources[id] = 30; };
function strike(battle, ability, targetId) {
  const actor = battle.allies[0];
  actor.abilities[0] = { id: 'impulso', name: 'Teste', target: 'enemy', damage: 1, costs: {}, ...ability };
  assert.equal(chooseAction(battle, actor.id, 'impulso', targetId).ok, true);
  assert.equal(commitTurn(battle).ok, true);
  resolveNextAction(battle);
  return actor;
}

test('49 passivas já usam gatilhos distintos ou recuperação ligada ao tipo de dano', () => {
  const revised = characters.filter(c => c.passive.type === 'triggered' || c.passive.healByDamageType);
  assert.equal(revised.length, 49);
  for (const character of revised) assert.ok(character.passive.description.length > 35, character.name);
});

test('consumir Sangramento gera Ruptura uma vez por rodada, mesmo em área', () => {
  const battle = createBattle(['o-acougueiro'], [dummy('a'), dummy('b'), dummy('c')], { rng: () => 0 });
  battle.resources = emptyPool();
  for (const enemy of battle.enemies) enemy.dots.push({ tag: 'sangramento', damage: 1, turns: 2, sourceId: battle.allies[0].id });
  const actor = battle.allies[0];
  actor.abilities[0] = { id: 'impulso', name: 'Execução em Área', target: 'all-enemies', damage: 1, costs: {}, combo: { condition: 'bleed', bonusDamage: 1, consume: true } };
  assert.equal(chooseAction(battle, actor.id, 'impulso', 'a').ok, true);
  assert.equal(commitTurn(battle).ok, true);
  resolveNextAction(battle);
  assert.equal(battle.resources.ruptura, 1);
  assert.ok(battle.enemies.every(enemy => !enemy.dots.some(dot => dot.tag === 'sangramento')));
});

test('a Viúva recebe Vida e Coringa ao eliminar a própria vítima marcada', () => {
  const battle = createBattle(['a-viuva-escarlate'], [dummy()], { rng: () => 0 });
  battle.resources = emptyPool();
  const actor = battle.allies[0], target = battle.enemies[0];
  actor.hp = 50;
  target.hp = 1;
  target.marks.fio = { sourceId: actor.id, turns: 2, label: 'Fio Escarlate' };
  strike(battle, {}, target.id);
  assert.equal(actor.hp, 58);
  assert.equal(battle.resources.coringa, 1);
});

test('a recuperação de três devoradores muda conforme o tipo de dano', () => {
  const cases = [['physical', 4], ['piercing', 6], ['energy', 2], ['affliction', 0]];
  for (const [damageType, restored] of cases) {
    const battle = createBattle(['o-devorador'], [dummy()], { rng: () => 0 });
    battle.resources = emptyPool();
    battle.allies[0].hp = 50;
    strike(battle, { damage: 10, damageType }, battle.enemies[0].id);
    assert.equal(battle.allies[0].hp, 50 + restored, damageType);
  }
});

test('formas transformadas têm custos próprios e mudam a passiva de turno', () => {
  const furor = characterById['o-odio-encarnado'];
  const eruption = furor.abilities.find(a => a.id === 'voto').forms.find(a => a.formKey === 'eruption');
  const baseCost = getAbilityResourceCosts({ ...furor, bodyForm: 'base' }, eruption);
  const rageCost = getAbilityResourceCosts({ ...furor, bodyForm: 'rage' }, eruption);
  assert.equal(baseCost.essence, rageCost.essence + 1);

  const suserano = createBattle(['o-trono-vazio'], [dummy()], { rng: () => 0 });
  assert.equal(suserano.allies[0].shield, 4);
  const herdeiro = createBattle(['o-herdeiro-cativo'], [dummy()], { rng: () => 0, teamHealth: { 'o-herdeiro-cativo': 40 } });
  assert.equal(herdeiro.allies[0].hp, 37);
  assert.equal(herdeiro.allies[0].charge, 1);
});

test('as quatro respostas de contra-ataque têm condições e efeitos diferentes', () => {
  const find = id => characterById[id].abilities.find(a => a.counter);
  const accomplice = find('a-testemunha-cega');
  const deserter = find('o-vigia-ausente');
  const guardian = find('o-ultimo-guardiao');
  const sovereign = find('o-trono-vazio');
  assert.deepEqual(accomplice.counterFilter, ['energy', 'affliction']);
  assert.equal(accomplice.counterEffect.stealEssence.amount, 1);
  assert.deepEqual(deserter.counterFilter, ['physical', 'piercing']);
  assert.equal(deserter.counterEffect.expose, 1);
  assert.equal(guardian.counterRequiresShield, true);
  assert.equal(guardian.counterEffect.generateEssence.resource, 'graca');
  assert.equal(sovereign.counterEffect.drainEssence.resource, 'essence');
  assert.equal(sovereign.counterEffect.expose, 1);
  for (const ability of [accomplice, deserter, guardian, sovereign]) assert.ok(ability.description.length > 50);
});

test('sinergias de Mundo escalam suavemente com aliados vivos', () => {
  const inferno = createBattle(['o-acougueiro', 'o-soberano-quebrado', 'o-sussurro'], [dummy()], { rng: () => 0 });
  rich(inferno);
  strike(inferno, { damage: 1, dot: { tag: 'sangramento', damage: 4, turns: 2 } }, inferno.enemies[0].id);
  assert.equal(inferno.enemies[0].dots[0].damage, 6);

  const paradiseIds = characters.filter(c => c.realm === 'Paraíso').slice(0, 3).map(c => c.id);
  const paradise = createBattle(paradiseIds, [dummy()], { rng: () => 0 });
  rich(paradise);
  const healer = paradise.allies[0], receiver = paradise.allies[1];
  receiver.hp = 50;
  healer.abilities[0] = { id: 'impulso', name: 'Cuidado', target: 'ally', heal: 10, costs: {} };
  assert.equal(chooseAction(paradise, healer.id, 'impulso', receiver.id).ok, true);
  commitTurn(paradise); resolveNextAction(paradise);
  assert.equal(receiver.hp, 62);

  const limboIds = characters.filter(c => c.realm === 'Limbo').slice(0, 3).map(c => c.id);
  const limbo = createBattle(limboIds, [dummy()], { rng: () => 0 });
  assert.ok(limbo.allies.every(ally => ally.shield >= 2));
});

test('a sinergia da Sangria reforça a aflição em +1 por aliado do Elo, até +2', () => {
  const resolve = ids => {
    const battle = createBattle(ids, [dummy()], { rng: () => 0 });
    battle.resources = emptyPool();
    battle.resonance.bonus = 0;
    for (const ally of battle.allies.slice(1)) ally.realm = 'Limbo';
    strike(battle, { damage: 1, dot: { tag: 'sangramento', damage: 4, turns: 2 } }, battle.enemies[0].id);
    return battle.enemies[0].dots[0].damage;
  };
  assert.equal(resolve(['o-acougueiro']), 4);
  assert.equal(resolve(['o-acougueiro', 'a-viuva-escarlate']), 5);
  assert.equal(resolve(['o-acougueiro', 'a-viuva-escarlate', 'o-colecionador-de-cabecas']), 6);
});

const setupRevision = (id, team = [id]) => {
  const battle = createBattle(team, [dummy('a'), dummy('b'), dummy('c')], {rngSeed:123, enemyPlanner:()=>[]});
  battle.resources = emptyPool();
  battle.enemyResources = emptyPool();
  battle.resonance.bonus = 0;
  return battle;
};
function castRevision(battle, ability, targetId='a') {
  const actor=battle.allies[0];
  actor.abilities[0]={id:'impulso',name:'Teste de passiva',target:'enemy',damage:1,costs:{},...ability};
  assert.equal(chooseAction(battle,actor.id,'impulso',targetId).ok,true);
  assert.equal(commitTurn(battle).ok,true);
  return resolveNextAction(battle);
}

test('Sangria, Coroa e Mentira têm 18 passivas com gatilhos e assinatura mecânica própria', () => {
  const batch=characters.filter(c=>['sangria','coroa','mentira'].includes(c.eloId));
  assert.equal(batch.length,18);
  const signatures=batch.map(c=>{const {name,description,art,...rules}=c.passive;return JSON.stringify(rules)});
  assert.equal(new Set(signatures).size,18);
  assert.ok(batch.every(c=>c.passive.type==='triggered'));
});

test('o Príncipe protege-se apenas ao ferir vítima já marcada por ele, uma vez em área', () => {
  for(const ownership of ['none','other','own']) {
    const b=setupRevision('o-principe-das-correntes');
    for(const target of b.enemies)if(ownership!=='none')target.marks.grilhao={sourceId:ownership==='own'?b.allies[0].id:'another',turns:3};
    castRevision(b,{target:'all-enemies',mark:'grilhao'});
    assert.equal(b.allies[0].shield,ownership==='own'?4:0,ownership);
  }
});

test('o Colecionador ganha carga e Defesa pelo abate e o Carrasco exige Atordoamento anterior', () => {
  const collector=setupRevision('o-colecionador-de-cabecas');collector.enemies[0].hp=1;
  castRevision(collector,{});
  assert.equal(collector.allies[0].charge,1);assert.equal(collector.allies[0].shield,4);
  for(const stunned of [0,1]){
    const b=setupRevision('o-carrasco-sem-rosto');b.allies[0].hp=50;b.enemies[0].stunned=stunned;b.enemyResources.coringa=1;
    castRevision(b,{stun:1});
    assert.equal(b.allies[0].hp,stunned?53:50);
    assert.equal(b.enemyResources.coringa,stunned?0:1);
  }
});

test('os Gêmeos exigem Sangramento próprio e Exposto, sem multiplicar a recompensa em área', () => {
  for(const owner of ['other','own']){
    const b=setupRevision('gemeos-do-cutelo');b.allies[0].hp=50;
    for(const target of b.enemies){target.exposed=1;target.dots=[{tag:'sangramento',sourceId:owner==='own'?b.allies[0].id:'another',turns:2,damage:1}]}
    castRevision(b,{target:'all-enemies'});
    assert.equal(b.resources.ruptura,owner==='own'?1:0);assert.equal(b.allies[0].hp,owner==='own'?53:50);
  }
});

test('a Mãe Rubra recompensa cura real de outro aliado, excluindo autocura e defesa pessoal', () => {
  for(const mode of ['ally','self','defense','overheal']){
    const b=setupRevision('a-mae-rubra',['a-mae-rubra','o-acougueiro']);b.allies[0].hp=50;b.allies[1].hp=mode==='overheal'?99:50;
    const target=mode==='self'?b.allies[0]:b.allies[1];
    castRevision(b,{target:'ally',damage:0,heal:10,defense:mode==='defense'},target.id);
    assert.equal(target.shield,mode==='ally'?4:0,mode);
    assert.equal(b.allies[0].hp,mode==='ally'?53:mode==='self'?60:50,mode);
  }
});

test('Domínio do Soberano recebe Defesa extra; Magistrada e Déspota têm economias diferentes', () => {
  const sovereign=setupRevision('o-soberano-quebrado');rich(sovereign);
  assert.equal(chooseAction(sovereign,sovereign.allies[0].id,'voto',sovereign.allies[0].id).ok,true);
  assert.equal(commitTurn(sovereign).ok,true);resolveNextAction(sovereign);
  assert.equal(sovereign.allies[0].bodyForm,'edict');assert.equal(sovereign.allies[0].shield,31);
  const magistrate=setupRevision('a-juiza-de-ferro');magistrate.enemies[0].exposed=1;magistrate.enemyResources.graca=1;
  castRevision(magistrate,{});assert.equal(magistrate.allies[0].shield,2);assert.equal(magistrate.enemyResources.graca,0);
  for(const defense of [false,true]){
    const b=setupRevision('a-regente-de-cinzas',['a-regente-de-cinzas','o-principe-das-correntes']);
    castRevision(b,{damage:0,target:'team',shield:5,defense},b.allies[0].id);
    assert.equal(b.resources.cinza,defense?0:1);
  }
});

test('Mentira distingue conversão, Enfraquecido, cura perfurante e bênção pessoal', () => {
  const whisper=setupRevision('o-sussurro');whisper.resources.essence=2;whisper.enemies[0].dots=[{tag:'veneno',sourceId:whisper.allies[0].id,damage:1,turns:2}];
  castRevision(whisper,{costs:{essence:1}});assert.equal(whisper.resources.essence,0);assert.equal(whisper.resources.coringa,1);
  const schemer=setupRevision('o-tecelao-de-mentiras');schemer.enemies[0].marks.trama={sourceId:schemer.allies[0].id,turns:3};
  castRevision(schemer,{});assert.equal(schemer.enemies[0].weakened,1);
  for(const type of ['physical','piercing']){
    const b=setupRevision('a-boca-de-vidro');b.allies[0].hp=50;b.enemies[0].exposed=1;
    castRevision(b,{damageType:type});assert.equal(b.allies[0].hp,type==='piercing'?54:50);
  }
  const impostor=setupRevision('o-falso-profeta');impostor.allies[0].hp=50;
  castRevision(impostor,{damage:0,target:'self',heal:10},impostor.allies[0].id);
  assert.equal(impostor.allies[0].shield,3);assert.equal(impostor.resources.graca,1);
});

test('golpe inteiramente absorvido não dispara passiva de causar dano nem roubo do primeiro acerto', () => {
  for(const id of ['a-mao-que-toma','a-boca-de-vidro']){
    const b=setupRevision(id);b.allies[0].hp=50;b.enemyResources.coringa=1;b.enemies[0].shield=50;b.enemies[0].exposed=1;
    castRevision(b,{damageType:'piercing'});
    assert.equal(b.allies[0].hp,50);assert.equal(b.enemyResources.coringa,1);assert.equal(b.allies[0].passiveUsed,false);
  }
});

test('a Viúva reage ao abate de sua vítima por um aliado e não exige executar o último golpe', () => {
  const b=setupRevision('o-colecionador-de-cabecas',['o-colecionador-de-cabecas','a-viuva-escarlate']);
  const widow=b.allies[1];widow.hp=50;b.enemies[0].hp=1;b.enemies[0].marks.fio={sourceId:widow.id,turns:3};
  castRevision(b,{});
  assert.equal(widow.hp,58);assert.equal(b.resources.coringa,1);
});

test('Queimadura letal ativa a Brasa uma vez, preserva origem e não processa dano posterior à queda', () => {
  const b=setupRevision('a-brasa-eterna');const actor=b.allies[0];actor.hp=50;
  b.enemies[0].hp=1;b.enemies[0].dots=[{tag:'queimadura',damage:2,turns:2,sourceId:actor.id},{tag:'veneno',damage:20,turns:2,sourceId:actor.id}];
  assert.equal(commitTurn(b).ok,true);
  for(let i=0;i<20&&b.enemies[0].hp>0;i++)resolveNextAction(b);
  assert.equal(actor.hp,54);assert.equal(b.resources.ruptura,1);
  assert.equal(b.log.filter(line=>line.includes('Alvo: veneno')).length,0);
});

test('passivas novas mantêm lado, autoria e limite por rodada após serialização autoritativa', () => {
  const prince={...characterById['o-principe-das-correntes'],id:'enemy-prince'};
  const b=createBattle(['o-sussurro'],[prince],{rngSeed:9,enemyPlanner:()=>[]});
  const enemy=b.enemies[0],target=b.allies[0];
  enemy.abilities[0]={id:'impulso',name:'Golpe',target:'enemy',damage:1,costs:{}};
  target.marks.grilhao={sourceId:enemy.id,turns:3};
  b.intents=[{actorId:enemy.id,abilityId:'impulso',targetId:target.id,side:'enemy'},{actorId:enemy.id,abilityId:'impulso',targetId:target.id,side:'enemy'}];
  b.enemyPlanner=s=>s.intents;
  assert.equal(commitTurn(b).ok,true);resolveNextAction(b);resolveNextAction(b);
  assert.equal(enemy.shield,4);
  const restored=JSON.parse(JSON.stringify(b));resolveNextAction(restored);
  assert.equal(restored.enemies[0].shield,4);assert.equal(restored.allies[0].shield,0);
});

test('uma passiva de consumo não confunde a condição exigida com outra preparação', () => {
  for(const condition of ['bleed','mark:rune']){
    const b=setupRevision('o-acougueiro');b.enemies[0].dots=[{tag:'sangramento',damage:1,turns:2,sourceId:b.allies[0].id}];b.enemies[0].marks.rune={sourceId:b.allies[0].id,turns:3};
    castRevision(b,{combo:{condition,bonusDamage:0,consume:true}});
    assert.equal(b.resources.ruptura,condition==='bleed'?1:0);
  }
});

test('armadilha de inatividade letal notifica a Viúva e recompensa a origem da reação', () => {
  const b=setupRevision('o-colecionador-de-cabecas',['o-colecionador-de-cabecas','a-viuva-escarlate']);
  const owner=b.allies[0],widow=b.allies[1],target=b.enemies[0];widow.hp=50;target.hp=1;
  target.marks.fio={sourceId:widow.id,turns:3};
  target.reactives=[{trigger:'idle',damage:2,damageType:'affliction',sourceId:owner.id,skillId:'trap',label:'Armadilha',turns:1,harmful:true}];
  assert.equal(commitTurn(b).ok,true);
  for(let i=0;i<20&&target.hp>0;i++)resolveNextAction(b);
  assert.equal(widow.hp,58);assert.equal(b.resources.coringa,1);assert.equal(owner.charge,1);assert.equal(owner.shield,4);
});
