import test from "node:test";
import assert from "node:assert/strict";
import { buffs, difficulties, elos } from "../src/data.js";
import { getBuffChoices, getRelevantBuffs } from "../src/rules.js";
import { chooseAction, createBattle, passTurn, skipStunnedAction } from "../src/engine.js";

const team = ["o-escudo-vivo", "a-brasa-eterna", "o-passo-interrompido"];
const simpleEnemy = (overrides = {}) => ({
  id: "simulacro",
  name: "Simulacro",
  realm: "Inferno",
  elo: "Sangria",
  eloId: "sangria",
  affinity: "cinza",
  role: "Executor",
  abilities: [{ id: "basic", name: "Golpe", kind: "strike", cost: 0, damage: 30, target: "enemy" }],
  ...overrides
});

test("dificuldades escalam Vida, dano e recompensa em ordem", () => {
  const byId = Object.fromEntries(difficulties.map((difficulty) => [difficulty.id, difficulty]));
  assert.deepEqual(difficulties.map((difficulty) => difficulty.aiLevel), [0, 1, 2, 3]);
  assert.ok(byId.story.enemyHealth < byId.veteran.enemyHealth);
  assert.ok(byId.veteran.enemyHealth < byId.doomed.enemyHealth);
  assert.ok(byId.doomed.enemyHealth < byId.agony.enemyHealth);
  assert.ok(byId.story.rewardMultiplier < byId.veteran.rewardMultiplier);
  assert.ok(byId.veteran.rewardMultiplier < byId.doomed.rewardMultiplier);
  assert.ok(byId.doomed.rewardMultiplier < byId.agony.rewardMultiplier);
});

test("Agonia cria inimigos mais resistentes e perigosos do que Travessia", () => {
  const elo = elos.find((item) => item.id === "protecao");
  const easy = createBattle(team, [simpleEnemy()], { difficulty: "story" });
  const hard = createBattle(team, [simpleEnemy()], { difficulty: "agony" });
  assert.equal(easy.enemies[0].maxHp, 90);
  assert.equal(hard.enemies[0].maxHp, 116);
  passTurn(easy);
  passTurn(hard);
  const easyLoss = easy.allies.reduce((sum, ally) => sum + 100 - ally.hp, 0);
  const hardLoss = hard.allies.reduce((sum, ally) => sum + 100 - ally.hp, 0);
  assert.ok(hardLoss > easyLoss);
  assert.ok(hard.enemyDamageMultiplier > easy.enemyDamageMultiplier);
});

test("IA avançada cura um aliado crítico em vez de atacar sem necessidade", () => {
  const supportEnemy = simpleEnemy({
    abilities: [
      { id: "basic", name: "Golpe", kind: "strike", cost: 0, damage: 10, target: "enemy" },
      { id: "mend", name: "Sutura", kind: "support", costs: { essence: 1 }, shield: 0, target: "team" }
    ]
  });
  const battle = createBattle(team, [supportEnemy], { difficulty: "agony" });
  battle.enemies[0].hp = 40;
  battle.enemyResources.essence = 1;
  passTurn(battle);
  assert.equal(battle.enemies[0].hp, 60);
  assert.ok(battle.log.some((line) => line.includes("Sutura") && line.includes("recupera 20")));
});

test("escudos não ultrapassam metade da Vida máxima e a IA para de reforçar unidades protegidas", () => {
  const supportEnemy = simpleEnemy({
    abilities: [
      { id: "basic", name: "Golpe", kind: "strike", cost: 0, damage: 10, target: "enemy" },
      { id: "mend", name: "Sutura", kind: "support", costs: { essence: 1 }, shield: 16, target: "team" }
    ]
  });
  const battle = createBattle(team, [supportEnemy], { difficulty: "agony" });
  battle.enemies[0].hp = 40;
  battle.enemies[0].shield = 45;
  battle.enemyResources.essence = 1;
  passTurn(battle);
  assert.equal(battle.enemies[0].hp, 60);
  assert.equal(battle.enemies[0].shield, Math.round(battle.enemies[0].maxHp * 0.5));
});

test("IA não usa uma técnica se o recurso inimigo não cobre o custo", () => {
  const costlyEnemy = simpleEnemy({
    abilities: [
      { id: "basic", name: "Golpe", kind: "strike", cost: 0, damage: 10, target: "enemy" },
      { id: "burst", name: "Ruptura", kind: "burst", costs: { essence: 1 }, damage: 50, target: "enemy" }
    ]
  });
  const battle = createBattle(team, [costlyEnemy], { difficulty: "agony" });
  battle.enemyResources.essence = 0;
  passTurn(battle);
  assert.ok(battle.log.some((line) => line.includes("Simulacro usa Golpe")));
  assert.ok(battle.enemyResources.essence >= 0);
  assert.ok(battle.enemyResources.cinza >= 0);
});

test("aprimoramentos têm ícone, contexto e identidade próprios", () => {
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
  const limboIds = getRelevantBuffs(mixedTeam, []).map((buff) => buff.id);
  assert.ok(!limboIds.includes("fracture"));
  assert.ok(!limboIds.includes("chainbreaker"));
});

test("Primeiro Fôlego e Selo de Abertura alteram o combate", () => {
  const elo = elos.find((item) => item.id === "protecao");
  const enemies = [simpleEnemy()];
  const plain = createBattle(team, enemies, { difficulty: "veteran" });
  const enhanced = createBattle(team, enemies, { difficulty: "veteran", buffs: ["first-breath", "opening-weakness"] });
  assert.equal(enhanced.enemies[0].weakened, 1);
  const plainBefore = plain.enemies[0].hp;
  const enhancedBefore = enhanced.enemies[0].hp;
  chooseAction(plain, team[0], "impulso", plain.enemies[0].id);
  chooseAction(enhanced, team[0], "impulso", enhanced.enemies[0].id);
  assert.ok(enhancedBefore - enhanced.enemies[0].hp > plainBefore - plain.enemies[0].hp);
});

test("controle enfraquece o próximo ataque do inimigo", () => {
  const plain = createBattle(team, [simpleEnemy()], { difficulty: "story" });
  const controlled = createBattle(team, [simpleEnemy()], { difficulty: "story" });
  controlled.allies[0].abilities = [...controlled.allies[0].abilities, {
    id: "test-control", name: "Marca", kind: "control", cost: 0, damage: 1, target: "enemy"
  }];
  chooseAction(controlled, team[0], "test-control", controlled.enemies[0].id);
  assert.equal(controlled.enemies[0].weakened, 1);
  passTurn(plain);
  passTurn(controlled);
  const targetId = team[1];
  const plainTarget = plain.allies.find((ally) => ally.id === targetId);
  const weakenedTarget = controlled.allies.find((ally) => ally.id === targetId);
  assert.ok(weakenedTarget.hp > plainTarget.hp);
  assert.equal(controlled.enemies[0].weakened, 0);
});

test("atordoamento consome a ação do aliado e não bloqueia o restante do trio", () => {
  const battle = createBattle(team, [simpleEnemy()], { difficulty: "story" });
  battle.allies[0].stunned = 1;
  assert.equal(chooseAction(battle, team[0], "impulso", battle.enemies[0].id).ok, false);
  assert.equal(skipStunnedAction(battle, team[0]), true);
  assert.equal(battle.acted.includes(team[0]), true);
  assert.equal(battle.allies[0].stunned, 0);
});
