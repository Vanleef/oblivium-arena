import test from "node:test";
import assert from "node:assert/strict";

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
  assert.match(app.innerHTML, /Veynar, o Elo Final/);
  assert.equal((app.innerHTML.match(/class="elo-card /g) || []).length, 9);

  const click = (dataset) => handlers.click({ target: { dataset, closest() { return this; } } });
  click({ startRun: "sangria" });
  assert.match(app.innerHTML, /TRILHA ATIVA/);
  assert.match(app.innerHTML, /Combate/);

  click({ node: "0:0" });
  assert.match(app.innerHTML, /COMBATE TÁTICO 3v3/);
  assert.match(app.innerHTML, /SEU TRIO/);

  click({ useSkill: "o-escudo-vivo:impulso" });
  assert.match(app.innerHTML, /O Escudo Vivo usa/);
  assert.match(app.innerHTML, /ESSÊNCIA/);
});
