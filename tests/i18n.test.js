import test from "node:test";
import assert from "node:assert/strict";
import { buffs, characters, elos, realms, resources, routeStages } from "../src/data.js";
import { createFinalBossAbilities, FINAL_BOSS } from "../src/final-boss.js";
import { abilityConditions, abilityDuration, abilityQuickEffect } from "../src/ability-presentation.js";
import { globalChoices, globalUpgradeCatalog, runMemoryCatalog } from "../src/progression.js";
import { worldInfluences } from "../src/world-event-catalog.js";
import { storyMarkup } from "../src/story-content.js";
import { tutorialView } from "../src/tutorial.js";
import { getLanguage, localizeMarkup, localizeText, setLanguage } from "../src/i18n.js";

test("English is a persistent locale and Post Mortem Arena keeps its name", () => {
  let saved = null;
  globalThis.localStorage = {
    getItem(key) { return key === "pma-language" ? saved : null; },
    setItem(key, value) { if (key === "pma-language") saved = value; }
  };

  assert.equal(getLanguage(), "pt-BR");
  assert.equal(setLanguage("en"), "en");
  assert.equal(saved, "en");
  assert.equal(getLanguage(), "en");
  assert.equal(localizeText("Post Mortem Arena"), "Post Mortem Arena");
  assert.equal(localizeText("O Açougueiro"), "The Butcher");
  assert.equal(localizeText("Éter"), "Aether");
  assert.equal(localizeText("Coringa", "en"), "Wildcard");
  assert.equal(localizeText("Coringas", "en"), "Wildcards");
  assert.equal(localizeText("1 Coringa", "en"), "1 Wildcard");
  assert.equal(localizeText("5 Coringas", "en"), "5 Wildcards");
  assert.equal(localizeText("Brasão do Elo Sangria", "en"), "Bond crest: Bloodshed");
  assert.equal(localizeText("Brasão do Elo Correntes Quebradas", "en"), "Bond crest: Broken Chains");
  assert.equal(localizeText("Navegação principal", "en"), "Primary navigation");
  assert.equal(localizeText("Experiência do nível", "en"), "Level experience");
  assert.equal(localizeText("Essências compartilhadas", "en"), "Shared Essence");
  assert.equal(localizeText("JOGADOR", "en"), "PLAYER");
  assert.equal(localizeText("Tutorial do jogo", "en"), "Game tutorial");
  assert.equal(localizeText("GUIA INTERATIVO · 2 / 6", "en"), "INTERACTIVE GUIDE · 2 / 6");
  assert.equal(localizeText("PMA: Post Mortem Arena, início", "en"), "PMA: Post Mortem Arena, home");
  assert.equal(localizeText("Defesa destrutível: absorve dano antes da Vida.", "en"), "Destructible Defense: absorbs damage before Health.");
  assert.equal(localizeText("Total de Essência. Desde a abertura, cada lado recebe uma unidade aleatória por alma viva. Os cinco tipos têm a mesma chance.", "en"), "Total Essence. From the start, each side gains one random Essence for every living character. All five types have an equal chance.");
  assert.equal(localizeText("Post Mortem Arena", "pt-BR"), "Post Mortem Arena");
  assert.equal(localizeText("Escolha três almas."), "Choose three souls.");
  assert.equal(localizeText("Suas habilidades causam +5 de dano se o alvo está Atordoado."), "Your abilities deal +5 damage to Stunned targets.");
  assert.equal(localizeText("Vira Anulação Definitiva por 2 turnos, apenas contra o alvo da marca.", "en"), "Changes to Final Nullification for 2 turns, only against the target of the Mark.");
  assert.equal(localizeText("Concede 15 de Defesa e anula a próxima habilidade inimiga recebida, contra-atacando com 20 de dano. Dura 1 turno.", "en"), "Gain 15 Defense and negate the next incoming enemy ability, then counterattack for 20 damage. Lasts 1 turn.");
  assert.equal(localizeText("Assume uma postura de abrigo: troca o primeiro golpe por Fingir Presença até usar Retomar a Sombra.", "en"), "Adopt a sheltering stance: your first strike becomes Feign Presence until you use Resume the Shadow.");

  setLanguage("pt-BR");
  assert.equal(saved, "pt-BR");
  assert.equal(localizeText("O Açougueiro"), "O Açougueiro");
});

test("Wildcard terminology stays consistent across resource and character text", () => {
  globalThis.localStorage = { getItem: () => "en", setItem() {} };
  const wildcard = resources.find(resource => resource.id === "coringa");
  assert.equal(wildcard.name, "Coringa");
  assert.equal(localizeText(wildcard.name, "en"), "Wildcard");
  const copy = [];
  for (const character of characters) {
    copy.push(character.name, character.lore, character.combo, character.passive?.name, character.passive?.description);
    for (const ability of character.abilities) {
      copy.push(ability.name, ability.description, ability.evolutionNote);
      for (const form of ability.forms || []) copy.push(form.name, form.description);
    }
    for (const form of character.bodyForms || []) copy.push(form.name, form.description);
  }
  for (const item of [...buffs, ...worldInfluences, ...globalUpgradeCatalog, ...Object.values(runMemoryCatalog)]) {
    copy.push(item.title, item.text, item.lore, item.description);
  }
  for (const stage of routeStages.flat()) copy.push(stage.label, stage.desc);
  const tutorialMarkup = localizeMarkup(tutorialView(1, { publicPage: true }), "en");
  copy.push(tutorialMarkup.replace(/<[^>]*>/g, " "), ...[...tutorialMarkup.matchAll(/\b(?:aria-label|aria-description|placeholder|alt|title)="([^"]*)"/gi)].map(match => match[1]));
  for (const text of copy.filter(value => typeof value === "string" && /\bcoringas?\b/i.test(value))) {
    const english = localizeText(text, "en");
    assert.match(english, /\bwildcards?\b/i, "Coringa should be translated as Wildcard");
    assert.doesNotMatch(english, /\b(?:coringas?|jokers?)\b/i, "Do not use Coringa or Joker in English");
  }
});

test("all character names and passive rules have English copy", () => {
  globalThis.localStorage = { getItem: () => "en", setItem() {} };
  assert.equal(characters.length, 100);
  const untranslated = /[áéíóúãõâêôç]|\b\w+(?:ando|endo|indo)\b|\b(?:vida|dano|defesa|essência|turno|rodada|habilidade|técnica|aflição|inimigo|inimiga|aliado|aliada|sangramento|queimadura|veneno|decadência|concede|restaura|atordoado|enfraquecido|exposto|formas|troca|cura|físico|física|espiritual|perfurante|qualquer|você|seu|sua|não|até|alvo|carga|combate|início|oposição|trio|recurso|progresso|nível|experiência)\b/i;
  const malformedEnglish = /\b(?:the each|the the|dthe|form original|of the not|increases in \d+|transforme|nullification final|the shield alive|the ember eternal)\b/i;
  for (const character of characters) {
    const name = localizeText(character.name, "en");
    assert.notEqual(name, character.name, `missing English name for ${character.name}`);
    const lore = localizeText(character.lore, "en");
    assert.notEqual(lore, character.lore, `missing English lore for ${character.name}`);
    if (character.id === "a-regente-de-cinzas") assert.match(lore, /colossal matriarch/i);
    assert.doesNotMatch(lore, untranslated, `untranslated lore for ${character.name}: ${lore}`);
    const combo = localizeText(character.combo, "en");
    assert.notEqual(combo, character.combo, `missing English play advice for ${character.name}`);
    assert.doesNotMatch(combo, untranslated, `untranslated play advice for ${character.name}: ${combo}`);
    assert.notEqual(localizeText(character.mechanic, "en"), character.mechanic, `missing English mechanic for ${character.name}`);
    if (character.roleHint) assert.doesNotMatch(localizeText(character.roleHint, "en"), untranslated, `untranslated role advice for ${character.name}`);
    assert.doesNotMatch(localizeText(character.archetypeName, "en"), untranslated, `untranslated archetype for ${character.name}`);
    assert.doesNotMatch(localizeText(character.archetypeVariant, "en"), untranslated, `untranslated archetype variant for ${character.name}`);
    assert.doesNotMatch(localizeText(character.archetypeContext, "en"), untranslated, `untranslated archetype context for ${character.name}`);
    for (const detail of character.archetypeDetails || []) {
      assert.doesNotMatch(localizeText(detail.name, "en"), untranslated, `untranslated secondary archetype for ${character.name}`);
      assert.doesNotMatch(localizeText(detail.context, "en"), untranslated, `untranslated secondary archetype context for ${character.name}`);
    }
    assert.notEqual(localizeText(character.passive.name, "en"), character.passive.name, `missing English passive name for ${character.name}`);
    assert.doesNotMatch(localizeText(character.passive.name, "en"), malformedEnglish);
    const passive = localizeText(character.passive.description, "en");
    assert.doesNotMatch(passive, untranslated, `untranslated passive for ${character.name}: ${passive}`);
    for (const ability of character.abilities) {
      assert.doesNotMatch(localizeText(ability.name, "en"), malformedEnglish, `awkward English technique name for ${character.name}`);
      assert.doesNotMatch(localizeText(ability.name, "en"), untranslated, `untranslated technique name for ${character.name}`);
      assert.doesNotMatch(localizeText(ability.description, "en"), untranslated, `untranslated technique for ${character.name}: ${ability.name}`);
      assert.doesNotMatch(localizeText(ability.description, "en"), malformedEnglish, `awkward English technique for ${character.name}: ${ability.name}`);
      if (ability.evolutionNote) {
        assert.doesNotMatch(localizeText(ability.evolutionNote, "en"), untranslated, `untranslated technique evolution for ${character.name}: ${ability.name}`);
        assert.doesNotMatch(localizeText(ability.evolutionNote, "en"), malformedEnglish, `awkward English technique evolution for ${character.name}: ${ability.name}`);
      }
      for (const form of ability.forms || []) {
        assert.doesNotMatch(localizeText(form.name, "en"), malformedEnglish, `awkward English technique variation for ${character.name}`);
        assert.doesNotMatch(localizeText(form.name, "en"), untranslated, `untranslated technique variation for ${character.name}`);
        assert.doesNotMatch(localizeText(form.description, "en"), untranslated, `untranslated technique variation for ${character.name}`);
        assert.doesNotMatch(localizeText(form.description, "en"), malformedEnglish, `awkward English technique variation for ${character.name}`);
      }
    }
    for (const form of character.bodyForms || []) {
      assert.notEqual(localizeText(form.name, "en"), form.name, `missing English Form name for ${character.name}`);
      assert.doesNotMatch(localizeText(form.description, "en"), untranslated, `untranslated Form description for ${character.name}`);
    }
  }
  const butcher = characters.find(character => character.name === "O Açougueiro");
  assert.equal(localizeText(butcher.abilities[0].description, "en"), "Deal 15 physical damage to an enemy. Bleed: 5 affliction damage per turn for 2 turns. Changes to Reopen the Wound for 2 turns, against the same target only.");
  assert.match(localizeText(FINAL_BOSS.lore, "en"), /greatest fear/);
  assert.doesNotMatch(localizeText(FINAL_BOSS.artNote, "en"), untranslated);
  assert.doesNotMatch(localizeText(FINAL_BOSS.combo, "en"), untranslated);
  assert.equal(localizeText(FINAL_BOSS.bodyForms[0].name, "en"), "Tyrant");
  const formLabels = { berserker: "Berserker", burst: "Executor", control: "Interditor" };
  const resourceLabels = { cinza: "Cinza", ruptura: "Ruptura", graca: "Graça" };
  const expectedForms = [
    ["Tyrant", "BERSERKER", "Ash", "Berserker · Ash affinity. Heavy strikes break Defense and grow stronger as Health falls. Fear of subjugation."],
    ["Predator", "EXECUTOR", "Rupture", "Executor · Rupture affinity. Hunts one prey, restores Health, and chooses between draining it or consuming its Mark. Fear of being hunted."],
    ["Ruin", "DISRUPTOR", "Grace", "Disruptor · Grace affinity. Binds one target with spectral magic, Stuns and seals support; a circle spreads the restraint. Fear of losing continuity."]
  ];
  assert.deepEqual(FINAL_BOSS.bodyForms.map(form => [
    localizeText(form.name, "en"),
    localizeText(formLabels[form.archetype], "en"),
    localizeText(resourceLabels[form.resource], "en"),
    localizeText(form.description, "en")
  ]), expectedForms);
  assert.deepEqual(FINAL_BOSS.bodyForms.map(form => localizeText(`${form.name} de O Fim, sem rosto fixo`, "en")), [
    "The End in its Tyrant Form, faceless",
    "The End in its Predator Form, faceless",
    "The End in its Ruin Form, faceless"
  ]);
  const bossAbilities = createFinalBossAbilities();
  assert.deepEqual(bossAbilities.slice(0, 3).map(ability => localizeText(ability.description, "en")), [
    "Assume the Tyrant, replace your first three techniques and portrait. Gain 10 Defense when entering this Form. Berserker · Ash affinity. Heavy strikes break Defense and grow stronger as Health falls. Fear of subjugation. This Form remains until you use Unreachable End.",
    "Assume the Predator, replace your first three techniques and portrait. Gain +8 damage for your next strike on entry. Executor · Rupture affinity. Hunts one prey, restores Health, and chooses between draining it or consuming its Mark. Fear of being hunted. This Form remains until you use Unreachable End.",
    "Assume the Ruin, replace your first three techniques and portrait. Generate 1 Grace when entering this Form. Disruptor · Grace affinity. Binds one target with spectral magic, Stuns and seals support; a circle spreads the restraint. Fear of losing continuity. This Form remains until you use Unreachable End."
  ]);
  for (const ability of bossAbilities) {
    assert.notEqual(localizeText(ability.name, "en"), ability.name, `missing English boss technique name: ${ability.name}`);
    assert.notEqual(localizeText(ability.description, "en"), ability.description, `missing English boss technique: ${ability.name}`);
    assert.doesNotMatch(localizeText(ability.description, "en"), untranslated, `untranslated boss technique: ${ability.name}`);
    for (const form of ability.forms || []) {
      assert.notEqual(localizeText(form.name, "en"), form.name, `missing English boss form technique: ${form.name}`);
      assert.notEqual(localizeText(form.description, "en"), form.description, `missing English boss form effect: ${form.name}`);
      assert.doesNotMatch(localizeText(form.description, "en"), untranslated, `untranslated boss form effect: ${form.name}`);
    }
  }
});

test("campaign, story, upgrades, and living-world events have English copy", () => {
  const untranslated = /[áéíóúãõâêôç]|\b(?:vida|dano|defesa|essência|turno|rodada|habilidade|técnica|aflição|inimigo|inimiga|aliado|aliada|sangramento|queimadura|decadência|veneno|concede|restaura|atordoado|enfraquecido|exposto|forma|formas|troca|cura|físico|física|espiritual|perfurante|qualquer|você|seu|sua|não|até|alvo|carga|combate|início|oposição|trio|recurso|progresso|nível|experiência|derrotar|recupere|fragmentos|correntes|patrulha|enquanto|recebem|aplicadas|aflitivo|recrute|relíquias|usá-lo|caótica|posição|compartilhada|próximo|próxima|jogo)\b/i;
  const check = (label, value) => assert.doesNotMatch(localizeText(value, "en"), untranslated, `untranslated ${label}: ${localizeText(value, "en")}`);

  for (const elo of elos) for (const key of ["name", "theme", "flavor", "strength"]) check(`Bond ${elo.id}.${key}`, elo[key]);
  for (const realm of realms) for (const key of ["name", "title", "description"]) check(`Realm ${realm.id}.${key}`, realm[key]);
  for (const influence of worldInfluences) for (const key of ["title", "lore", "description"]) check(`world event ${influence.id}.${key}`, influence[key]);
  for (const stage of routeStages.flat()) {
    check(`trail node ${stage.label}`, stage.label);
    check(`trail node description ${stage.label}`, stage.desc);
  }
  for (const buff of buffs) for (const key of ["title", "text", "lore"]) check(`Augment ${buff.id}.${key}`, buff[key]);
  for (const [id, memory] of Object.entries(runMemoryCatalog)) for (const key of ["title", "text", "lore"]) check(`Echo ${id}.${key}`, memory[key]);

  const upgrades = new Map();
  for (let seed = 1; seed <= 300; seed++) {
    for (const upgrade of globalChoices({ globalUpgrades: [] }, "sangria", 0, seed)) upgrades.set(upgrade.kind, upgrade);
  }
  assert.equal(upgrades.size, globalUpgradeCatalog.length, "sampled every Legacy upgrade");
  for (const upgrade of upgrades.values()) for (const key of ["title", "text", "lore"]) check(`Legacy ${upgrade.kind}.${key}`, upgrade[key]);

  const story = localizeMarkup(storyMarkup({ eloId: "sangria", team: ["o-escudo-vivo"], stage: 0 }), "en");
  assert.match(story, /PROLOGUE · NARRATOR/);
  assert.match(story, /If the trail chose us/);
  assert.doesNotMatch(story.replace(/<[^>]*>/g, " "), untranslated);
  for (let step = 0; step < 6; step++) {
    const markup = localizeMarkup(tutorialView(step, { publicPage: true }), "en");
    const tutorial = `${markup.replace(/<[^>]*>/g, " ")} ${[...markup.matchAll(/\b(?:aria-label|aria-description|placeholder|alt|title)="([^"]*)"/gi)].map(match => match[1]).join(" ")}`;
    assert.doesNotMatch(tutorial, untranslated, `untranslated tutorial step ${step + 1}`);
  }
  assert.equal(localizeText("Caçada de Sangria", "en"), "Bloodshed Hunt");
});

test("combat tooltips build their rules text directly in English", () => {
  const ruinBind = { damage: 15, damageType: "energy", combo: { condition: "mark:fio-ruina", bonusDamage: 10, stun: 1, consume: true } };
  globalThis.localStorage = { getItem: () => "pt-BR", setItem() {} };
  assert.equal(abilityQuickEffect(ruinBind), "15 espiritual · +10 dano se marcado · Atordoa 1T se marcado");
  globalThis.localStorage = { getItem: () => "en", setItem() {} };
  assert.equal(abilityQuickEffect({ damage: 20, damageType: "physical", target: "enemy", dot: { tag: "sangramento", damage: 5 } }), "20 physical damage to an enemy · Bleed 5 affliction damage/turn");
  assert.equal(abilityQuickEffect({ damage: 20, damageType: "physical", target: "enemy", gainCharge: 1 }), "20 physical damage to an enemy · Gain 1 charge");
  assert.equal(abilityQuickEffect({ damage: 10, damageType: "energy", target: "all-enemies", weaken: 1, sealSupport: 1 }), "10 spiritual damage to all enemies · Weaken · 1 turn · Seal support · 1 turn");
  assert.equal(abilityQuickEffect(ruinBind), "15 spiritual damage to an enemy · +10 damage if marked · Stun · 1 turn if marked");
  assert.equal(abilityQuickEffect({ target: "self", boost: 8, shift: [{ slot: "fenda", form: "predator" }] }), "Prepare +8 damage for your next strike");
  assert.equal(abilityQuickEffect({ generateEssence: { resource: "graca", amount: 1 } }), "Generate 1 Grace");
  assert.equal(abilityConditions({ combo: { condition: "wounded", bonusDamage: 10, consume: true } }), "Bonus against a target at 50% Health or less; consumes the setup.");
  assert.equal(abilityDuration({ dot: { tag: "queimadura", damage: 4, turns: 2 } }), "Burn: 4 affliction damage per turn for 2 turns");
});

test("markup translates visible text and accessibility labels without changing user data", () => {
  const markup = '<section><h2>Grande Rota</h2><button title="Entrar" aria-label="Idioma">Formar Trio</button><input placeholder="Buscar personagem, Elo ou Essência" value="Meu nick"><b data-no-translate>O Açougueiro</b><i data-state="O Açougueiro">Essência</i></section>';
  const english = localizeMarkup(markup, "en");
  assert.match(english, /Grand Route/);
  assert.match(english, /title="Sign in"/);
  assert.match(english, /aria-label="Language"/);
  assert.match(english, /Build Team/);
  assert.match(english, /placeholder="Search character, Bond, or Essence"/);
  assert.match(english, /value="Meu nick"/);
  assert.match(english, /data-no-translate>O Açougueiro/);
  assert.match(english, /data-state="O Açougueiro"/);
  assert.match(english, /<i data-state="O Açougueiro">Essence<\/i>/);
});

test("language toggle rerenders the Codex in either language and filters by English names", async () => {
  const handlers = {};
  const app = {
    innerHTML: "",
    addEventListener(type, handler) { handlers[type] = handler; },
    querySelector() { return null; }
  };
  let savedLanguage = "pt-BR";
  globalThis.localStorage = {
    getItem(key) { return key === "pma-language" ? savedLanguage : null; },
    setItem(key, value) { if (key === "pma-language") savedLanguage = value; }
  };
  globalThis.document = {
    querySelector: selector => selector === "#app" ? app : null,
    body: { dataset: {} },
    documentElement: { lang: "pt-BR" },
    activeElement: null
  };
  delete globalThis.window;

  await import(`../src/main.js?english-locale-test=${Date.now()}`);
  const click = dataset => {
    const selectors = Object.keys(dataset).map(key => key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`));
    const target = {
      dataset,
      closest(selector) { return selectors.some(name => selector.includes(`[data-${name}]`)) ? this : null; }
    };
    handlers.click({ target });
  };

  assert.equal(document.documentElement.lang, "pt-BR");
  click({ language: "en" });
  assert.equal(savedLanguage, "en");
  assert.equal(document.documentElement.lang, "en");
  click({ tab: "codex" });
  assert.match(app.innerHTML, /The Butcher/);
  assert.match(app.innerHTML, /AFFLICTION SPECIALIST/);
  assert.doesNotMatch(app.innerHTML, /O Açougueiro/);

  handlers.input({ target: { matches: selector => selector === "[data-search]", value: "The Butcher", selectionStart: 10 } });
  await new Promise(resolve => setTimeout(resolve, 140));
  assert.match(app.innerHTML, /The Butcher/);
  assert.doesNotMatch(app.innerHTML, /The Widow/);

  click({ language: "pt-BR" });
  assert.equal(savedLanguage, "pt-BR");
  assert.equal(document.documentElement.lang, "pt-BR");
  assert.match(app.innerHTML, /O Açougueiro/);
});


test("Codex labels and split text nodes use natural English", () => {
  assert.equal(localizeText("Sinergias discretas de Elo, Mundo e afinidade", "en"), "Subtle Bond, Realm, and affinity synergies");
  assert.equal(localizeText("O Fim · Rei do Inferno", "en"), "The End · King of Hell");
  assert.equal(localizeText("ALMA DO PMA", "en"), "PMA SOUL");
  assert.equal(localizeText("DO PMA", "en"), "IN PMA");
  assert.equal(localizeMarkup('<small>ARQUÉTIPO PRINCIPAL · <span>Execução encadeada</span></small>', 'en'), '<small>PRIMARY ARCHETYPE · <span>Chained Execution</span></small>');
});
