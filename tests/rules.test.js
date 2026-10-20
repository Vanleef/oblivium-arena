import test from "node:test";
import assert from "node:assert/strict";
import { characters, elos, realms, rosterCounts, routeStages, buffs } from "../src/data.js";
import { getResonance, getRosterCounts, getRelevantBuffs } from "../src/rules.js";
import { chooseAction, createBattle, createEnemyTeam } from "../src/engine.js";

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

test("combate usa Essência compartilhada, dano de Ressonância e encerra o turno após o Trio agir", () => {
  const allies = ["o-escudo-vivo", "a-muralha", "o-que-ficou"];
  const elo = elos.find((item) => item.id === "protecao");
  const enemies = createEnemyTeam(elo, allies, "normal", 0);
  const battle = createBattle(allies, enemies, { buffs: [] });
  assert.equal(battle.resonance.tier, "complete");
  const target = battle.enemies[0];
  const before = target.hp;
  assert.equal(chooseAction(battle, allies[0], "impulso", target.id).ok, true);
  assert.equal(battle.essence, 1);
  assert.ok(target.hp < before);
  assert.equal(chooseAction(battle, allies[1], "tecnica", target.id).ok, true);
  assert.equal(battle.essence, 0);
  assert.equal(chooseAction(battle, allies[2], "impulso", target.id).ok, true);
  assert.equal(battle.round, 2);
  assert.equal(battle.phase, "player");
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
  const resonantTeam = ["o-escudo-vivo", "a-muralha", "o-que-ficou"];
  assert.ok(getRelevantBuffs(resonantTeam).some((buff) => buff.id === "echo"));
});
