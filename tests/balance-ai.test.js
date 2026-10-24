import test from "node:test";
import assert from "node:assert/strict";
import { buffs, elos } from "../src/data.js";
import { getBuffChoices, getRelevantBuffs } from "../src/rules.js";
import { createBattle, createEnemyTeam, chooseAction, passTurn } from "../src/engine.js";
import { difficultyModifiers } from "../src/progression.js";

const team = ["o-escudo-vivo", "a-brasa-eterna", "o-passo-interrompido"];

test("Rupturas altas aumentam Vida, dano e defesas da oposição", () => {
  const normal = difficultyModifiers(0);
  const rupture = difficultyModifiers(6);
  assert.ok(rupture.hp > normal.hp);
  assert.ok(rupture.damage > normal.damage);
  assert.ok(rupture.shield > normal.shield);
  assert.ok(rupture.armor > normal.armor);
  assert.ok(rupture.regen > normal.regen);

  const elo = elos.find((item) => item.id === "protecao");
  const easy = createEnemyTeam(elo, team, "normal", 0, { difficulty: 0 });
  const hard = createEnemyTeam(elo, team, "normal", 0, { difficulty: 6 });
  assert.ok(hard[0].maxHp > easy[0].maxHp);
});

test("aprimoramentos têm ícone e contexto próprios", () => {
  assert.ok(buffs.length >= 30);
  assert.equal(new Set(buffs.map((buff) => buff.id)).size, buffs.length);
  assert.equal(new Set(buffs.map((buff) => buff.icon)).size, buffs.length);
  assert.equal(new Set(buffs.map((buff) => buff.context)).size, buffs.length);
  for (const buff of buffs) {
    assert.ok(buff.category, buff.id + " precisa de categoria");
    assert.ok(buff.context?.length > 20, buff.id + " precisa de contexto");
    assert.ok(buff.text?.length > 8, buff.id + " precisa explicar o efeito");
  }
});

test("ofertas de aprimoramento priorizam categorias diferentes", () => {
  const mixedTeam = ["o-escudo-vivo", "a-brasa-eterna", "a-mao-que-cura"];
  const offers = getBuffChoices(mixedTeam, [], 3, () => 0.27);
  assert.equal(offers.length, 3);
  assert.equal(new Set(offers.map((buff) => buff.id)).size, 3);
  assert.equal(new Set(offers.map((buff) => buff.category)).size, 3);
  const relevant = getRelevantBuffs(mixedTeam, []).map((buff) => buff.id);
  assert.ok(!relevant.includes("fracture"));
  assert.ok(!relevant.includes("chainbreaker"));
});

test("escudos param em metade da Vida máxima", () => {
  const elo = elos.find((item) => item.id === "protecao");
  const enemies = createEnemyTeam(elo, team, "normal", 0, { difficulty: 0 }).slice(0, 1);
  const battle = createBattle(team, enemies, { enemyPlanner: () => [] });
  const actor = battle.allies[0];
  actor.abilities = [{
    id: "test-shield",
    name: "Barreira",
    kind: "support",
    target: "self",
    cost: 0,
    costs: {},
    shield: 200
  }];
  assert.equal(chooseAction(battle, actor.id, "test-shield", actor.id).ok, true);
  assert.equal(passTurn(battle), true);
  assert.equal(actor.shield, Math.round(actor.maxHp * 0.5));
});


test("a integração preserva 49 aprimoramentos com glifos e contextos ingleses distintos", async () => {
  const { augmentGlyph } = await import('../src/augment-cards.js');
  const { localizeText } = await import('../src/i18n.js');
  assert.equal(buffs.length, 49);
  assert.equal(new Set(buffs.map(buff => augmentGlyph(buff.glyph))).size, buffs.length);
  for (const buff of buffs) {
    assert.equal(buff.lore, buff.context);
    for (const text of [buff.title, buff.text, buff.lore]) {
      assert.notEqual(localizeText(text, 'en'), text, buff.id + ': cópia em inglês ausente');
    }
  }
});

test("Defesa inicial respeita metade da Vida, incluindo bônus de campanha e elites", () => {
  const battle = createBattle(team, [{ id:'elite',name:'Elite',maxHp:300,startingShield:500,abilities:[] }], {
    buffs:['ward','deep-root'],globalEffects:{shield:200,maxHp:10},enemyPlanner:()=>[]
  });
  for (const unit of [...battle.allies,...battle.enemies]) {
    assert.ok(unit.shield <= Math.round(unit.maxHp * .5), unit.name);
  }
  assert.equal(battle.enemies[0].shield, 150);
});
