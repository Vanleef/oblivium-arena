import test from "node:test";
import assert from "node:assert/strict";
import { elos, starters } from "../src/data.js";

test("aplicação inicializa, abre uma trilha e resolve ações do combate", async () => {
  const handlers = {};
  const app = {
    innerHTML: "",
    addEventListener(type, handler) { handlers[type] = handler; },
    querySelector() { return null; }
  };
  globalThis.document = { querySelector: () => app, body: { dataset: {} } };
  globalThis.localStorage = { getItem: () => null, setItem() {} };

  await import("../src/main.js?smoke=1");
  assert.match(app.innerHTML, /Três reinos/);
  assert.match(app.innerHTML, /O Fim \(The End\)/);
  assert.equal((app.innerHTML.match(/class="elo-card /g) || []).length, 9);
  assert.match(app.innerHTML, /data-difficulty="agony"/);
  assert.match(app.innerHTML, /Elo do Silêncio/);
  assert.match(app.innerHTML, /Elo do Vazio/);
  assert.doesNotMatch(app.innerHTML, /Elo da (?:Silêncio|Vazio)/);

  const click = (dataset) => handlers.click({ target: { dataset, closest() { return this; } } });
  click({ difficulty: "agony" });
  click({ startRun: "sangria" });
  assert.match(app.innerHTML, /TRILHA ATIVA/);
  assert.match(app.innerHTML, /Agonia/);
  assert.match(app.innerHTML, /Combate/);

  click({ node: "0:0" });
  assert.match(app.innerHTML, /COMBATE TÁTICO 3v3/);
  assert.match(app.innerHTML, /SEU TRIO/);

  click({ useSkill: "o-escudo-vivo:impulso" });
  assert.match(app.innerHTML, /O Escudo Vivo usa/);
  assert.match(app.innerHTML, /ESSÊNCIA/);

  click({ tab: "codex" });
  assert.match(app.innerHTML, /o-escudo-vivo\/portrait\.webp/);
  assert.match(app.innerHTML, /Manto de Cinzas/);
  assert.match(app.innerHTML, /passive\.webp/);
});

test("o confronto final usa o retrato e as técnicas próprias de O Fim", async () => {
  const handlers = {};
  const app = {
    innerHTML: "",
    addEventListener(type, handler) { handlers[type] = handler; },
    querySelector() { return null; }
  };
  const save = JSON.stringify({
    version: 1,
    ownedIds: starters.map((character) => character.id),
    team: starters.map((character) => character.id),
    completedElos: elos.map((elo) => elo.id),
    xp: 0,
    fragments: 0,
    run: null
  });
  globalThis.document = { querySelector: () => app, body: { dataset: {} } };
  globalThis.localStorage = { getItem: () => save, setItem() {} };

  await import("../src/main.js?final-smoke=1");
  assert.match(app.innerHTML, /ENFRENTAR O FIM/);
  handlers.click({ target: { dataset: { finalBattle: "" }, closest() { return this; } } });
  assert.match(app.innerHTML, /The End/);
  assert.match(app.innerHTML, /o-fim\/portrait\.webp/);
  handlers.click({ target: { dataset: { action: "pass-turn" }, closest() { return this; } } });
  assert.match(app.innerHTML, /O Fim usa (Fenda do Véu|Decreto do Fim)/);
});
