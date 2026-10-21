import test from "node:test";
import assert from "node:assert/strict";
import { generateTrail, elos } from "../src/data.js";
import { chooseAction, createBattle, createEnemyTeam } from "../src/engine.js";

test("mapa da trilha tem ramificações conectadas até o Guardião", () => {
  const map = generateTrail("sangria", 42);
  assert.equal(map.length, 7);
  assert.equal(map[0].length, 1);
  assert.equal(map[0][0].nextIds.length, 3);
  assert.equal(map.at(-1)[0].type, "boss");
  assert.deepEqual(map.at(-1)[0].nextIds, []);

  const byId = new Map(map.flat().map((node) => [node.id, node]));
  const reached = new Set();
  const visit = (id) => {
    if (reached.has(id)) return;
    reached.add(id);
    for (const nextId of byId.get(id).nextIds) visit(nextId);
  };
  visit(map[0][0].id);
  assert.equal(reached.size, map.flat().length);
  assert.ok(map.flat().some((node) => node.type === "shop"));
  assert.ok(map.flat().some((node) => node.type === "upgrade"));
});

test("um turno oferece três ações da equipe e mostra as intenções inimigas", () => {
  const ids = ["o-escudo-vivo", "a-brasa-eterna", "o-passo-interrompido"];
  const elo = elos.find((item) => item.id === "sangria");
  const battle = createBattle(ids, createEnemyTeam(elo, ids, "normal", 0));
  assert.equal(battle.actionLimit, 3);
  assert.equal(battle.intents.length, 3);
  assert.ok(battle.intents.every((intent) => intent.abilityName && intent.targetName));

  for (const id of ids) assert.equal(chooseAction(battle, id, "impulso", battle.enemies[0].id).ok, true);
  assert.equal(battle.round, 2);
  assert.equal(battle.phase, "player");
  assert.equal(battle.acted.length, 0);
  assert.ok(battle.intents.length > 0);
});

test("controle aplica Enfraquecido e técnicas especiais respeitam recarga", () => {
  const ids = ["a-brasa-eterna", "o-escudo-vivo", "o-passo-interrompido"];
  const enemy = {
    id: "alvo-teste", name: "Alvo de treino", realm: "Inferno", elo: "Sangria", eloId: "sangria",
    color: "blood", symbol: "◇", role: "Alvo", abilities: [{ id: "basico", name: "Ataque", kind: "strike", cost: 0, damage: 1, target: "enemy" }]
  };
  const battle = createBattle(ids, [enemy]);
  battle.resources.cinza = 1;
  const target = battle.enemies[0];

  assert.equal(chooseAction(battle, ids[0], "tecnica", target.id).ok, true);
  assert.equal(target.weakened, 1);
  assert.equal(battle.allies[0].cooldowns.tecnica, 1);
  assert.equal(chooseAction(battle, ids[1], "impulso", target.id).ok, true);
  assert.equal(chooseAction(battle, ids[2], "impulso", target.id).ok, true);
  assert.equal(battle.round, 2);
  const retry = chooseAction(battle, ids[0], "tecnica", target.id);
  assert.equal(retry.ok, false);
  assert.match(retry.reason, /recarga/i);
});

test("interromper uma intenção com Atordoado cancela o ataque anunciado", () => {
  const ids = ["o-escudo-vivo", "a-brasa-eterna", "o-passo-interrompido"];
  const enemy = {
    id: "atacante-teste", name: "Atacante de treino", realm: "Inferno", elo: "Sangria", eloId: "sangria",
    color: "blood", symbol: "◇", role: "Atacante", abilities: [{ id: "basico", name: "Ataque", kind: "strike", cost: 0, damage: 20, target: "enemy" }]
  };
  const battle = createBattle(ids, [enemy]);
  battle.allies[0].abilities[0] = { id: "impulso", name: "Interrupção", kind: "burst", cost: 0, damage: 10, target: "enemy" };
  const target = battle.enemies[0];
  assert.equal(battle.intents[0].targetId, ids[0]);
  assert.equal(chooseAction(battle, ids[0], "impulso", target.id).ok, true);
  assert.equal(target.stunned, 1);
  assert.equal(chooseAction(battle, ids[1], "impulso", target.id).ok, true);
  assert.equal(chooseAction(battle, ids[2], "impulso", target.id).ok, true);
  assert.equal(battle.phase, "player");
  assert.equal(battle.allies[0].hp, battle.allies[0].maxHp);
  assert.ok(battle.log.some((line) => /perde a ação.*atordoado/i.test(line)));
});

test("a Vida restante atravessa encontros quando o combate é recriado", () => {
  const ids = ["o-escudo-vivo", "a-brasa-eterna", "o-passo-interrompido"];
  const battle = createBattle(ids, [], { teamHealth: { "o-escudo-vivo": 61 } });
  assert.equal(battle.allies[0].hp, 61);
  assert.equal(battle.allies[1].hp, 100);
});

test("elites e mini-bosses escalam Vida e dano em relação à patrulha", () => {
  const ids = ["o-escudo-vivo", "a-brasa-eterna", "o-passo-interrompido"];
  const elo = elos.find((item) => item.id === "sangria");
  const normal = createEnemyTeam(elo, ids, "normal", 0);
  const elite = createEnemyTeam(elo, ids, "elite", 0);
  const mini = createEnemyTeam(elo, ids, "mini", 0);
  assert.equal(normal[0].maxHp, 100);
  assert.ok(elite[0].maxHp > normal[0].maxHp);
  assert.ok(mini[0].abilities[0].damage > normal[0].abilities[0].damage);
  assert.match(elite[0].name, /Elite/);
  assert.match(mini[0].name, /Guardião Menor/);
});
