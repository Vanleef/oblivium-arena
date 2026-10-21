import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { characters, elos, realms, rosterCounts, routeStages, buffs, realmResource } from "../src/data.js";
import { getResonance, getRosterCounts, getRelevantBuffs } from "../src/rules.js";
import { canAffordAbility, chooseAction, createBattle, createEnemyTeam, getAbilityResourceCosts } from "../src/engine.js";

const byName = (name) => characters.find((character) => character.name === name);

test("elenco tem 100 almas nos três reinos, divididas conforme a bíblia", () => {
  assert.equal(characters.length, 100);
  assert.deepEqual(rosterCounts, { Inferno: 54, Paraíso: 35, Limbo: 11 });
  assert.deepEqual(getRosterCounts(characters), { Inferno: 54, Paraíso: 35, Limbo: 11 });
  assert.equal(elos.length, 17);
  assert.equal(realms[0].elos.length, 9);
  assert.equal(realms[1].elos.length, 7);
  assert.equal(realms[2].elos.length, 1);
  assert.equal(new Set(characters.map((character) => character.id)).size, 100);
});

test("cada personagem tem quatro técnicas e uma passiva de Elo", () => {
  for (const character of characters) {
    assert.equal(character.abilities.length, 4, character.name);
    assert.ok(character.passive.name);
    assert.ok(character.abilities.every((ability) => ability.name && ability.kind && Number.isInteger(ability.cost)));
    assert.equal(character.abilities[3].kind, "guard", `${character.name}: a quarta técnica é defensiva`);
    assert.equal(character.affinity, realmResource[character.realm]);
  }
});

test("os custos combinam Essência com o recurso próprio de cada reino", () => {
  assert.deepEqual(getAbilityResourceCosts(byName("A Brasa Eterna"), byName("A Brasa Eterna").abilities[1]), { cinza: 1 });
  assert.deepEqual(getAbilityResourceCosts(byName("O Escudo Vivo"), byName("O Escudo Vivo").abilities[2]), { essence: 1, graca: 1 });
  assert.deepEqual(getAbilityResourceCosts(byName("O Passo Interrompido"), byName("O Passo Interrompido").abilities[3]), { ruptura: 2 });
});

test("o trio inicial tem retrato, passiva e quatro artes de habilidade em arquivos próprios", () => {
  const starters = [byName("O Escudo Vivo"), byName("A Brasa Eterna"), byName("O Passo Interrompido")];
  for (const character of starters) {
    const paths = [character.art.portrait, character.passive.art, ...character.abilities.map((ability) => ability.art)];
    assert.equal(paths.length, 6);
    for (const path of paths) assert.ok(existsSync(new URL(".." + path, import.meta.url)), `${character.name}: ${path}`);
  }
  assert.ok(existsSync(new URL("../art/characters/o-fim/portrait.webp", import.meta.url)));
});

test("os quarenta e sete personagens seguintes têm artes únicas completas", () => {
  const names = [
    "O Açougueiro", "A Viúva Escarlate", "O Colecionador de Cabeças", "Gêmeos do Cutelo",
    "O Carrasco sem Rosto", "A Mãe Rubra", "O Soberano Quebrado", "A Juíza de Ferro",
    "O Trono Vazio", "O Príncipe das Correntes", "A Regente de Cinzas", "O Herdeiro Cativo",
    "O Sussurro", "A Máscara Dupla", "O Tecelão de Mentiras", "A Boca de Vidro",
    "O Falso Profeta", "O Corretor de Memórias", "O Incendiário", "O Ódio Encarnado",
    "O Filho da Cinza", "A Pira Errante", "O Coração em Fúria", "O Devorador", "A Mão que Toma",
    "O Estômago sem Fundo", "A Senhora do Último Pão", "O Credor", "A Balança Vazia",
    "O Apodrecido", "A Praga Andante", "O Corrupto", "A Rainha dos Fungos", "O Médico de Vermes",
    "O Jardim Morto", "O que Observou", "A Porta Fechada", "O Surdo", "A Testemunha Cega",
    "O Quarto Vazio", "O Vigia Ausente", "O que Possui", "A Pele Alheia", "O Desejo Quebrado",
    "A Marionetista de Nervos", "O Espelho Carnal", "A Costureira"
  ];
  for (const name of names) {
    const character = byName(name);
    assert.ok(character?.art, `${name}: retrato e passiva ligados ao personagem`);
    const paths = [character.art.portrait, character.passive.art, ...character.abilities.map((ability) => ability.art)];
    assert.equal(paths.length, 6, `${name}: 6 imagens`);
    for (const path of paths) assert.ok(existsSync(new URL(".." + path, import.meta.url)), `${name}: ${path}`);
    assert.equal(new Set(paths).size, 6, `${name}: cada imagem usa um arquivo próprio`);
  }
});

test("Ressonância diferencia trios do mesmo Elo, duplas e equipes mistas", () => {
  const inferno = characters.filter((character) => character.eloId === "sangria");
  const paradise = characters.filter((character) => character.eloId === "protecao");
  assert.equal(getResonance(inferno.slice(0, 3).map((character) => character.id)).tier, "complete");
  assert.equal(getResonance([inferno[0].id, inferno[1].id, paradise[0].id]).tier, "partial");
  assert.equal(getResonance([inferno[0].id, paradise[0].id, byName("A Mão que Cura").id]).tier, "none");
});

test("Limbo cria ressonância caótica em equipes mistas e modifica a ressonância parcial", () => {
  const limbo = byName("O Passo Interrompido");
  const sangria = characters.filter((character) => character.eloId === "sangria");
  assert.equal(getResonance([limbo.id, sangria[0].id, byName("O Escudo Vivo").id]).tier, "chaotic");
  const broken = getResonance([limbo.id, sangria[0].id, sangria[1].id]);
  assert.equal(broken.tier, "partial");
  assert.equal(broken.chaotic, true);
  assert.ok(Math.abs(broken.bonus - 0.15) < 1e-9);
});

test("trilha inclui os oito tipos de nó pedidos e termina em Guardião", () => {
  const types = new Set(routeStages.flatMap((stage) => stage.map((node) => node.id)));
  for (const type of ["normal", "elite", "event", "upgrade", "repair", "treasure", "mini", "boss"]) assert.ok(types.has(type), type);
  assert.equal(routeStages.at(-1)[0].id, "boss");
  assert.equal(routeStages.at(-1)[0].label, "Guardião do Elo");
});

test("aliados vivos geram Essência e Graça, com custo tático por técnica", () => {
  const allies = ["o-escudo-vivo", "a-muralha", "o-que-ficou"];
  const elo = elos.find((item) => item.id === "protecao");
  const enemies = createEnemyTeam(elo, allies, "normal", 0);
  const battle = createBattle(allies, enemies, { buffs: [] });
  assert.equal(battle.resonance.tier, "complete");
  const target = battle.enemies[0];
  const before = target.hp;
  assert.equal(battle.resources.essence, 0);
  assert.equal(battle.resources.graca, 0);
  assert.equal(canAffordAbility(battle, battle.allies[0], battle.allies[0].abilities[1]), false);
  assert.equal(chooseAction(battle, allies[0], "impulso", target.id).ok, true);
  assert.equal(battle.resources.essence, 1);
  assert.ok(target.hp < before);
  assert.equal(chooseAction(battle, allies[1], "impulso", target.id).ok, true);
  assert.equal(chooseAction(battle, allies[2], "impulso", target.id).ok, true);
  assert.equal(battle.round, 2);
  assert.equal(battle.phase, "player");
  assert.equal(battle.resources.essence, 5);
  assert.equal(battle.resources.graca, 3);
  assert.equal(canAffordAbility(battle, battle.allies[0], battle.allies[0].abilities[1]), true);
  assert.equal(chooseAction(battle, allies[0], "tecnica", target.id).ok, true);
  assert.equal(battle.resources.graca, 2);
});

test("a quarta técnica consome afinidade e protege o trio", () => {
  const allies = ["o-escudo-vivo", "a-brasa-eterna", "o-passo-interrompido"];
  const elo = elos.find((item) => item.id === "protecao");
  const battle = createBattle(allies, createEnemyTeam(elo, allies), { buffs: [] });
  battle.resources.graca = 2;
  const shieldBefore = battle.allies.map((ally) => ally.shield);
  assert.equal(chooseAction(battle, "o-escudo-vivo", "despertar").ok, true);
  assert.equal(battle.resources.graca, 0);
  assert.deepEqual(battle.allies.map((ally) => ally.shield), shieldBefore.map((shield) => shield + 20));
});

test("aprimoramentos disponíveis têm IDs exclusivos", () => {
  assert.equal(new Set(buffs.map((buff) => buff.id)).size, buffs.length);
});

test("aprimoramentos oferecem efeitos que fazem sentido para o Trio atual", () => {
  const mixed = ["o-escudo-vivo", "a-brasa-eterna", "a-mao-que-cura"];
  const mixedBuffs = getRelevantBuffs(mixed).map((buff) => buff.id);
  assert.ok(!mixedBuffs.includes("fracture"));
  assert.ok(!mixedBuffs.includes("echo"));
  const limboTeam = ["o-passo-interrompido", "o-escudo-vivo", "a-brasa-eterna"];
  assert.ok(getRelevantBuffs(limboTeam).some((buff) => buff.id === "fracture"));
  assert.ok(getRelevantBuffs(limboTeam).some((buff) => buff.id === "ruptura"));
  assert.ok(getRelevantBuffs(limboTeam).some((buff) => buff.id === "cinzas"));
  const resonantTeam = ["o-escudo-vivo", "a-muralha", "o-que-ficou"];
  assert.ok(getRelevantBuffs(resonantTeam).some((buff) => buff.id === "echo"));
});
