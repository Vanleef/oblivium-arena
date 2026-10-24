import { characters, characterById, elos, realms, routeStages, buffs, difficulties, starters, resources, resourceById, realmResource } from "./data.js";
import { getResonance, getEloRoster, getBuffChoices } from "./rules.js";
import { canAffordAbility, chooseAction, createBattle, createEnemyTeam, getAbilityResourceCosts, getEloById, passTurn, skipStunnedAction } from "./engine.js";

const app = document.querySelector("#app");
const SAVE_KEY = "pma-post-mortem-arena-v1";
const FINAL_BOSS = Object.freeze({ id: "the-end", name: "O Fim", nameEn: "The End", title: "Rei do Inferno", portrait: "/art/characters/o-fim/portrait.webp" });
const LEGACY_SAVE_KEYS = ["animavelle-arena-v1", "numether-arena-v1", "aevum-arena-v1", "numenveil-arena-v1", "oathrift-arena-v1", "trivel-arena-v1", "eidoveyl-arena-v1", "selyvar-arena-v1", "three-realms-soul-arena-v1", "post-mortem-arena-v1"];
const starterTeam = ["o-escudo-vivo", "a-brasa-eterna", "o-passo-interrompido"];
const defaults = {
  ownedIds: starters.map((character) => character.id),
  team: starterTeam,
  completedElos: [],
  xp: 0,
  fragments: 0,
  difficulty: "veteran",
  run: null
};

function readProfile() {
  try {
    const stored = localStorage.getItem(SAVE_KEY) || LEGACY_SAVE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean) || "null";
    const saved = JSON.parse(stored);
    if (!saved || saved.version !== 1) return { ...defaults, version: 1 };
    return {
      ...defaults,
      ...saved,
      ownedIds: [...new Set([...defaults.ownedIds, ...(saved.ownedIds || [])])],
      team: saved.team || starterTeam,
      completedElos: saved.completedElos || [],
      difficulty: difficulties.some((item) => item.id === saved.difficulty) ? saved.difficulty : "veteran"
    };
  } catch {
    return { ...defaults, version: 1 };
  }
}

const profile = readProfile();
let state = {
  tab: "rota",
  realmId: "inferno",
  eloId: "sangria",
  crewRealm: "Todos",
  crewSearch: "",
  targetId: null,
  battle: null,
  battleNode: null,
  pending: null,
  toast: "",
  toastTimer: null
};

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ ...profile, version: 1 }));
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function portraitMarkup(character, className) {
  return character.art?.portrait
    ? `<img class="${className}" src="${esc(character.art.portrait)}" alt="" loading="lazy">`
    : `<span class="${className} portrait-fallback color-${esc(character.color)}" aria-hidden="true">${esc(character.symbol)}</span>`;
}

function costMarkup(actor, ability) {
  const costs = getAbilityResourceCosts(actor, ability);
  const entries = Object.entries(costs);
  if (!entries.length) return `<span class="cost-label">BASE</span>`;
  const title = entries.map(([id, amount]) => `${amount} ${resourceById[id]?.name || id}`).join(" + ");
  return `<span class="skill-cost" title="${esc(title)}">${entries.flatMap(([id, amount]) => Array.from({ length: amount }, () => `<i class="cost-pip pip-${esc(id)}" aria-hidden="true"></i>`)).join("")}</span>`;
}

function teamResourceLegend(teamIds) {
  const affinities = new Set(teamIds.map((id) => characterById[id]?.affinity).filter(Boolean));
  const active = resources.filter((resource) => resource.id === "essence" || affinities.has(resource.id));
  return `<div class="team-resource-legend"><small>RECURSOS DA FORMAÇÃO</small><div>${active.map((resource) => `<span class="resource-${resource.color}"><i>${resource.icon}</i>${esc(resource.shortName)}</span>`).join("")}</div></div>`;
}

function team() {
  return profile.team.map((id) => characterById[id]).filter(Boolean);
}

function activeElo() {
  return elos.find((elo) => elo.id === (profile.run?.eloId || state.eloId)) || elos[0];
}

function eloTitle(elo) {
  const article = ["silencio", "vazio"].includes(elo.id) ? "do" : "da";
  return `Elo ${article} ${elo.name}`;
}

function activeAffinityResource() {
  return resourceById[realmResource[activeElo().realm]];
}

function activeAffinityBuff() {
  return activeAffinityResource().id === "cinza" ? "cinzas" : activeAffinityResource().id;
}

function toast(message) {
  state.toast = message;
  render();
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => { state.toast = ""; render(); }, 2400);
}

function startRun(eloId) {
  if (profile.team.length !== 3) {
    toast("Monte um Trio completo antes de entrar na trilha.");
    state.tab = "trio";
    return;
  }
  const elo = elos.find((item) => item.id === eloId);
  if (!elo) return;
  state.realmId = realms.find((realm) => realm.elos.some((item) => item.id === eloId))?.id || state.realmId;
  profile.run = { eloId, difficulty: profile.difficulty, stage: 0, stability: 3, maxStability: 3, buffs: [], encounter: 0, tried: 0 };
  state.eloId = eloId;
  state.pending = null;
  state.tab = "rota";
  save();
  render();
}

function continueRun() {
  if (!profile.run) return;
  profile.run.stage += 1;
  profile.run.encounter += 1;
  profile.run.tried = 0;
  state.pending = null;
  if (profile.run.stage >= routeStages.length) completeRun();
  save();
  render();
}

function completeRun() {
  const run = profile.run;
  if (!run) return;
  const elo = getEloById(run.eloId);
  const newIds = getEloRoster(elo.id).map((character) => character.id);
  profile.ownedIds = [...new Set([...profile.ownedIds, ...newIds])];
  profile.completedElos = [...new Set([...profile.completedElos, elo.id])];
  const reward = difficulties.find((item) => item.id === run.difficulty)?.rewardMultiplier || 1;
  profile.xp += Math.round(250 * reward);
  profile.fragments += Math.round(24 * reward);
  profile.run = null;
  state.pending = { type: "complete", elo };
  state.tab = "rota";
}

function startEncounter(node) {
  if (!profile.run && node.id !== "finale") return;
  const elo = activeElo();
  const specialFinale = node.id === "finale";
  const encounterType = specialFinale ? "boss" : node.id;
  const enemies = createEnemyTeam(elo, profile.team, encounterType, profile.run?.encounter || 0);
  if (specialFinale) {
    enemies[0].id = FINAL_BOSS.id;
    enemies[0].name = FINAL_BOSS.name;
    enemies[0].nameEn = FINAL_BOSS.nameEn;
    enemies[0].title = FINAL_BOSS.title;
    enemies[0].art = { portrait: FINAL_BOSS.portrait };
    enemies[0].abilities = [
      { id: "fenda", name: "Fenda do Véu", kind: "strike", cost: 0, damage: 29, target: "enemy" },
      { id: "decreto", name: "Decreto do Fim", kind: "control", cost: 1, damage: 32, target: "enemy" },
      { id: "coroa", name: "Coroa que Não Cai", kind: "guard", cost: 1, damage: 0, shield: 24, target: "team" }
    ];
    enemies[1].name = "Arauto do Véu Partido";
    enemies[1].art = null;
    enemies[1].symbol = "◇";
    enemies[2].name = "Sentinela das Barreiras";
    enemies[2].art = null;
    enemies[2].symbol = "⬡";
  }
  state.battleNode = node;
  state.battle = createBattle(profile.team, enemies, {
    buffs: profile.run?.buffs || [],
    difficulty: profile.run?.difficulty || profile.difficulty,
    encounter: specialFinale ? "finale" : encounterType
  });
  state.targetId = null;
  state.tab = "battle";
  render();
}

function resolveNode(node) {
  if (!profile.run) return;
  if (["normal", "elite", "mini", "boss", "finale"].includes(node.id)) {
    startEncounter(node);
    return;
  }
  if (node.id === "repair") {
    profile.run.stability = Math.min(profile.run.maxStability, profile.run.stability + 1);
    toast("Correntes reparadas: " + profile.run.stability + "/" + profile.run.maxStability + ".");
    continueRun();
    return;
  }
  if (node.id === "treasure") {
    profile.fragments += 12;
    profile.run.buffs.push(activeAffinityBuff());
    toast(`Você encontrou 12 fragmentos e um Eco de ${activeAffinityResource().shortName}.`);
    continueRun();
    return;
  }
  if (node.id === "event") state.pending = { type: "event" };
  if (node.id === "upgrade") {
    const choices = getBuffChoices(profile.team, profile.run.buffs, 3);
    state.pending = { type: "upgrade", choices };
  }
  render();
}

function chooseEvent(choice) {
  if (choice === "repair") {
    profile.run.stability = Math.min(profile.run.maxStability, profile.run.stability + 1);
    toast("Uma alma gentil reforça uma Corrente.");
  } else {
    profile.fragments += 8;
    profile.run.buffs.push(activeAffinityBuff());
    toast(`Você guarda 8 fragmentos e um Eco de ${activeAffinityResource().shortName}.`);
  }
  continueRun();
}

function chooseBuff(id) {
  if (!profile.run || profile.run.buffs.includes(id)) return;
  profile.run.buffs.push(id);
  continueRun();
}

function returnFromBattle() {
  if (!state.battle) return;
  if (state.battle.phase === "victory") {
    if (state.battleNode.id === "finale") {
      state.pending = { type: "finale-complete" };
      const reward = difficulties.find((item) => item.id === (state.battle.difficulty?.id || profile.difficulty))?.rewardMultiplier || 1;
      profile.run = null;
      profile.xp += Math.round(500 * reward);
      profile.fragments += Math.round(80 * reward);
      save();
      state.battle = null;
      state.tab = "rota";
      render();
      return;
    }
    state.battle = null;
    continueRun();
    return;
  }
  if (state.battle.phase === "defeat") {
    if (state.battleNode.id === "finale") {
      state.battle = null;
      state.pending = { type: "finale-defeat" };
      state.tab = "rota";
      render();
      return;
    }
    profile.run.stability -= 1;
    state.battle = null;
    if (profile.run.stability <= 0) {
      profile.run = null;
      state.pending = { type: "reset" };
      save();
      render();
      return;
    }
    profile.run.tried += 1;
    toast("Uma Corrente se rompeu. Restam " + profile.run.stability + ".");
    save();
    state.tab = "rota";
    render();
  }
}

function difficultyPicker(currentRun) {
  const selectedId = currentRun?.difficulty || profile.difficulty || "veteran";
  const selected = difficulties.find((item) => item.id === selectedId) || difficulties[1];
  if (currentRun) {
    return `<div class="difficulty-current"><span class="difficulty-mark">${selected.mark}</span><span><small>DIFICULDADE DA TRILHA</small><b>${esc(selected.name)}</b></span><p>${esc(selected.description)}</p></div>`;
  }
  return `<section class="difficulty-picker" aria-label="Escolher dificuldade"><div class="difficulty-heading"><div><div class="eyebrow">AJUSTE O DESAFIO</div><b>Como deseja atravessar?</b></div><small>Maior risco rende mais XP e fragmentos.</small></div><div class="difficulty-options">${difficulties.map((item) => `<button class="difficulty-option ${item.id === selectedId ? "selected" : ""}" data-difficulty="${item.id}" aria-pressed="${item.id === selectedId}"><span class="difficulty-mark">${item.mark}</span><span class="difficulty-copy"><b>${esc(item.name)}</b><small>${esc(item.description)}</small></span><i>${Math.round((item.rewardMultiplier || 1) * 100)}%<small>RECOMPENSA</small></i></button>`).join("")}</div></section>`;
}

function updateBattle(actorId, abilityId) {
  const targetId = state.targetId || state.battle.enemies.find((enemy) => enemy.hp > 0)?.id;
  const result = chooseAction(state.battle, actorId, abilityId, targetId);
  if (!result.ok) {
    toast(result.reason);
    return;
  }
  state.targetId = null;
  render();
}

function header() {
  const tabList = [
    ["rota", "Grande Rota"],
    ["trio", "Formar Trio"],
    ["codex", "Codex"]
  ];
  return `
    <header class="topbar">
      <button class="brand" data-tab="rota" aria-label="PMA: Post Mortem Arena, início">
        <span class="brand-mark">PMA</span>
        <span class="brand-name"><b>POST MORTEM</b><small>ARENA</small></span>
      </button>
      <nav class="main-nav" aria-label="Navegação principal">${tabList.map(([id, label]) => `<button class="nav-link ${state.tab === id ? "active" : ""}" data-tab="${id}">${label}</button>`).join("")}</nav>
      <div class="player-chip"><span class="player-orb">✦</span><span><b>Alma desperta</b><small>Rank ${Math.max(1, Math.floor(profile.xp / 250) + 1)} · ${profile.xp} XP</small></span></div>
      <button class="mobile-menu" data-tab="trio" aria-label="Abrir equipe">☰</button>
    </header>`;
}

function statusStrip() {
  const run = profile.run;
  return `
    <section class="status-strip" aria-label="Progresso">
      <div class="status-item"><span class="status-icon">⟲</span><span><small>CORRENTES DA ALMA</small><b>${run ? run.stability + " / " + run.maxStability : "FIRMES"}</b></span><span class="chain-pips">${[0, 1, 2].map((i) => `<i class="${run && i >= run.stability ? "broken" : ""}"></i>`).join("")}</span></div>
      <div class="status-item"><span class="status-icon gold">◈</span><span><small>FRAGMENTOS</small><b>${profile.fragments}</b></span></div>
      <div class="status-item"><span class="status-icon white">✧</span><span><small>TRILHAS CONCLUÍDAS</small><b>${profile.completedElos.length} / ${elos.length}</b></span></div>
      <div class="status-quote">"As barreiras cedem. O trio escolhe o que atravessa."</div>
    </section>`;
}

function hero() {
  return `
    <section class="hero-panel">
      <div class="hero-copy">
        <div class="eyebrow"><span></span> O VÉU ESTÁ SE ROMPENDO</div>
        <h1>Três reinos.<br><em>Uma fronteira.</em></h1>
        <p>Bondade e maldade moldam os Elos do além. Agora, a violência dos vivos estreita as barreiras. No Limbo, cada trio decide o peso da balança.</p>
        <div class="hero-actions"><button class="button button-gold" data-tab="trio">FORMAR MEU TRIO <span>↗</span></button><span class="hero-caption">3v3 tático · trilhas roguelite</span></div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="orbit orbit-outer"></div><div class="orbit orbit-inner"></div>
        <div class="realm-mark mark-heaven">✧</div><div class="realm-mark mark-hell">✹</div>
        <div class="realm-mark mark-limbo">⟲</div><div class="hero-core">P</div>
        <div class="hero-label label-heaven">PARAÍSO</div><div class="hero-label label-hell">INFERNO</div><div class="hero-label label-limbo">LIMBO</div>
      </div>
      <div class="hero-bottom"><span>CONFLITO CENTRAL</span><p>O Fim (The End), Rei do Inferno e Elo Final, quer rasgar o véu e estender o Inferno ao mundo dos vivos. Os Protetores do Paraíso tentam restaurar as barreiras.</p><span class="hero-index">01 <i>/</i> 03</span></div>
    </section>`;
}

function resonanceCard() {
  const resonance = getResonance(profile.team);
  return `<div class="resonance-card resonance-${resonance.tier}">
    <div class="resonance-icon">${resonance.tier === "complete" ? "✦" : resonance.tier === "chaotic" ? "⟲" : resonance.tier === "partial" ? "◈" : "◇"}</div>
    <div><small>SINERGIA DO TRIO</small><b>${resonance.title}</b><p>${resonance.detail}</p></div>
  </div>`;
}

function routeView() {
  const realm = realms.find((item) => item.id === state.realmId) || realms[0];
  const currentRun = profile.run;
  const completedAll = profile.completedElos.length >= elos.length;
  return `
    ${hero()}
    <section class="route-section">
      <div class="section-heading"><div><div class="eyebrow">ESCOLHA SUA TRAVESSIA</div><h2>A Grande Rota</h2><p>Explore trilhas nos três reinos. Cada rota testa o trio com escolhas, encontros e Guardiões.</p></div><span class="section-count">${elos.length} ELOS <i>·</i> 3 REINOS</span></div>
      ${difficultyPicker(currentRun)}
      <div class="realm-tabs">${realms.map((item) => `<button class="realm-tab ${state.realmId === item.id ? "selected" : ""} realm-${item.id}" data-realm="${item.id}"><span>${item.name === "Inferno" ? "✹" : item.name === "Paraíso" ? "✧" : "⟲"}</span><b>${item.name}</b><small>${item.elos.length} ${item.elos.length === 1 ? "Elo" : "Elos"}</small></button>`).join("")}</div>
      <div class="realm-intro"><div><span class="eyebrow">DOMÍNIO · ${esc(realm.title.toUpperCase())}</span><p>${esc(realm.description)}</p></div><span class="realm-sigil">${realm.color === "inferno" ? "✹" : realm.color === "paraiso" ? "✧" : "⟲"}</span></div>
      <div class="elo-grid">${realm.elos.map((elo) => `
        <article class="elo-card elo-${elo.color} ${currentRun?.eloId === elo.id ? "is-current" : ""}">
          <div class="elo-card-top"><span class="elo-symbol">${elo.symbol}</span><span class="elo-status ${profile.completedElos.includes(elo.id) ? "complete" : ""}">${profile.completedElos.includes(elo.id) ? "CONCLUÍDO" : "TRILHA"}</span></div>
          <h3>${esc(eloTitle(elo))}</h3><p class="elo-theme">${esc(elo.theme)}</p>
          <div class="elo-card-foot"><span>${esc(elo.strength)} <i>·</i> ${getEloRoster(elo.id).length} almas</span><button data-start-run="${elo.id}">${currentRun?.eloId === elo.id ? "RETOMAR" : "ENTRAR"} <b>↗</b></button></div>
        </article>`).join("")}</div>
      ${currentRun ? runMap() : ""}
      ${completedAll ? `<section class="finale-card"><div class="finale-sigil">♜</div><div><div class="eyebrow">A ÚLTIMA BARREIRA</div><h3>${FINAL_BOSS.name}</h3><p>${FINAL_BOSS.nameEn}, o nome em inglês. Os dezessete Elos foram atravessados; reúna o trio para impedir a ruptura completa.</p></div><button class="button button-gold" data-final-battle>ENFRENTAR O FIM <span>↗</span></button></section>` : ""}
      ${state.pending ? pendingPanel() : ""}
    </section>`;
}

function runMap() {
  const run = profile.run;
  const elo = activeElo();
  const completed = run.stage >= routeStages.length;
  return `
    <section class="run-panel">
      <div class="run-heading"><div><div class="eyebrow">TRILHA ATIVA · ${esc(elo.realm.toUpperCase())} · ${esc(difficulties.find((item) => item.id === run.difficulty)?.name || "Veterano")}</div><h3>${esc(eloTitle(elo))}</h3></div><div class="run-strength"><span class="run-elo-symbol">${elo.symbol}</span><span><small>ESTABILIDADE DAS CORRENTES</small><b>${run.stability}/${run.maxStability}</b></span></div></div>
      <div class="path-grid">${routeStages.map((stage, stageIndex) => {
        const done = stageIndex < run.stage;
        const active = stageIndex === run.stage;
        const nodes = stage.map((node, nodeIndex) => {
          const canSelect = active && !completed;
          return `<button class="path-node ${done ? "done" : ""} ${active ? "active" : "locked"}" ${canSelect ? `data-node="${stageIndex}:${nodeIndex}"` : "disabled"} ${canSelect ? "" : "aria-disabled=\"true\""}>
            <span class="node-icon">${done ? "✓" : node.icon}</span><b>${node.label}</b><small>${node.desc}</small>
          </button>`;
        }).join("");
        return `<div class="path-stage"><span class="stage-number">${String(stageIndex + 1).padStart(2, "0")}</span><div class="stage-nodes">${nodes}</div></div>`;
      }).join("")}</div>
      <div class="run-footer"><span><b>${run.stage}</b> / ${routeStages.length} etapas</span><span class="buff-list">${run.buffs.length ? run.buffs.map((id) => { const buff = buffs.find((item) => item.id === id); return `<i title="${esc(buff?.title || id)}">${esc(buff?.icon || "✧")}</i>`; }).join("") : "Nenhum eco coletado"}</span><button class="text-button" data-abandon-run>ABANDONAR TRILHA</button></div>
    </section>`;
}

function pendingPanel() {
  const pending = state.pending;
  if (!pending) return "";
  if (pending.type === "event") return `
    <section class="choice-panel"><div class="eyebrow">EVENTO · UMA ALMA À BEIRA DA TRILHA</div><h3>Uma corrente pede cuidado.</h3><p>Um viajante oferece fragmentos para continuar ou ajuda o trio a remendar uma fissura.</p><div class="choice-actions"><button data-event-choice="repair"><b>⟲ Reparar uma corrente</b><small>Recupere 1 de estabilidade</small></button><button data-event-choice="echo"><b>◈ Guardar um eco</b><small>Receba 8 fragmentos e 1 ${esc(activeAffinityResource().name)} extra por combate</small></button></div></section>`;
  if (pending.type === "upgrade") return `
    <section class="choice-panel"><div class="eyebrow">APRIMORAMENTO · ESCOLHA UM ECO</div><h3>O trio se adapta à trilha.</h3><div class="buff-choices">${pending.choices.map((buff) => `<button class="buff-card" data-choose-buff="${buff.id}"><span class="buff-icon">${esc(buff.icon)}</span><span class="buff-category">${esc(buff.category)}</span><b>${esc(buff.title)}</b><small>${esc(buff.text)}</small><em>${esc(buff.context)}</em></button>`).join("")}</div></section>`;
  if (pending.type === "complete") return `
    <section class="notice-panel"><span class="notice-icon">✧</span><div><div class="eyebrow">TRILHA CONCLUÍDA</div><h3>${esc(eloTitle(pending.elo))} atravessado.</h3><p>${getEloRoster(pending.elo.id).length} almas do Elo agora podem ser recrutadas. +250 XP e 24 fragmentos.</p></div><button class="button button-outline" data-clear-notice>CONTINUAR</button></section>`;
  if (pending.type === "finale-complete") return `
    <section class="notice-panel"><span class="notice-icon">☼</span><div><div class="eyebrow">O VÉU RESISTIU</div><h3>O Fim foi detido.</h3><p>O equilíbrio ainda exige cuidado, mas os três reinos podem respirar. +500 XP e 80 fragmentos.</p></div><button class="button button-outline" data-clear-notice>CONTINUAR</button></section>`;
  if (pending.type === "finale-defeat") return `
    <section class="notice-panel notice-fracture"><span class="notice-icon">♜</span><div><div class="eyebrow">A BARREIRA AINDA RESISTE</div><h3>O Fim continua avançando.</h3><p>Reúna o trio e tente o confronto final novamente.</p></div><button class="button button-outline" data-final-battle>TENTAR DE NOVO</button></section>`;
  if (pending.type === "reset") return `
    <section class="notice-panel notice-fracture"><span class="notice-icon">⟲</span><div><div class="eyebrow">CORRENTES ROMPIDAS</div><h3>A trilha se recompõe.</h3><p>As três correntes cederam. O trio conserva os fragmentos, mas precisa escolher uma nova travessia.</p></div><button class="button button-outline" data-clear-notice>ENTENDI</button></section>`;
  return "";
}

function teamView() {
  const resonance = getResonance(profile.team);
  const filtered = characters.filter((character) => {
    const owned = profile.ownedIds.includes(character.id);
    const matchesRealm = state.crewRealm === "Todos" || character.realm === state.crewRealm;
    const matchesSearch = !state.crewSearch || (character.name + " " + character.elo + " " + character.realm).toLowerCase().includes(state.crewSearch.toLowerCase());
    return matchesRealm && matchesSearch && (owned || state.crewRealm === "Todos");
  });
  return `
    <section class="page-heading"><div><div class="eyebrow">ALIANÇA 3v3</div><h1>Formar Trio</h1><p>Escolha até três almas. Ressonâncias mudam a potência do grupo.</p></div><div class="roster-total"><b>${profile.ownedIds.length}</b><span>/ 100<br>RECRUTADAS</span></div></section>
    <div class="team-layout">
      <section class="team-builder">
        <div class="team-builder-heading"><div><div class="eyebrow">SUA FORMAÇÃO</div><h2>Trio de combate</h2></div><span>${profile.team.length} / 3</span></div>
        <div class="active-team">${[0, 1, 2].map((index) => {
          const member = characterById[profile.team[index]];
          return member ? `<article class="team-slot slot-${member.color}"><span class="slot-index">0${index + 1}</span>${portraitMarkup(member, "slot-avatar")}<div><small>${esc(member.realm)} · ${esc(member.elo)}</small><b>${esc(member.name)}</b><span>${esc(member.role)}</span></div><button data-remove-member="${member.id}" aria-label="Remover ${esc(member.name)}">×</button></article>` : `<article class="team-slot empty-slot"><span class="slot-index">0${index + 1}</span><span class="empty-plus">+</span><div><b>Escolha uma alma</b><small>Selecione abaixo</small></div></article>`;
        }).join("")}</div>
        ${resonanceCard()}
        ${teamResourceLegend(profile.team)}
        <div class="team-note"><b>Correntes Quebradas</b><span>Uma alma do Limbo pode criar uma Ressonância Caótica com qualquer Elo.</span></div>
        <button class="button button-gold full-button" data-tab="rota">IR PARA A GRANDE ROTA <span>↗</span></button>
      </section>
      <section class="roster-browser">
        <div class="roster-header"><div><div class="eyebrow">ALMAS CONHECIDAS</div><h2>Codex de Elos</h2></div><span class="owned-count">${profile.ownedIds.length} disponíveis</span></div>
        <label class="search-box"><span>⌕</span><input type="search" data-search value="${esc(state.crewSearch)}" placeholder="Buscar nome, reino ou Elo"></label>
        <div class="filter-row">${["Todos", "Inferno", "Paraíso", "Limbo"].map((realm) => `<button class="${state.crewRealm === realm ? "active" : ""}" data-crew-realm="${realm}">${realm}</button>`).join("")}</div>
        <div class="roster-grid">${filtered.map((character) => {
          const owned = profile.ownedIds.includes(character.id);
          const selected = profile.team.includes(character.id);
          const disabled = !owned || (!selected && profile.team.length >= 3);
          return `<button class="roster-card ${selected ? "chosen" : ""} ${!owned ? "unowned" : ""}" data-add-member="${character.id}" ${disabled ? "disabled" : ""}>
            ${portraitMarkup(character, "roster-card-symbol")}<span class="roster-card-copy"><b>${esc(character.name)}</b><small>${esc(character.elo)} · ${esc(character.role)}</small></span><span class="roster-card-state">${selected ? "✓" : owned ? "+" : "·"}</span>
          </button>`;
        }).join("")}</div>
      </section>
    </div>`;
}

function codexView() {
  const filtered = characters.filter((character) => {
    const owned = profile.ownedIds.includes(character.id);
    const realm = state.crewRealm === "Todos" || character.realm === state.crewRealm;
    const query = !state.crewSearch || (character.name + " " + character.elo).toLowerCase().includes(state.crewSearch.toLowerCase());
    return realm && query && (owned || state.crewRealm === "Todos");
  });
  return `
    <section class="page-heading"><div><div class="eyebrow">100 ALMAS · 17 ELOS · 3 REINOS</div><h1>Codex</h1><p>Conheça as forças que atravessam o véu. Concluir a trilha de um Elo libera suas almas.</p></div><div class="codex-total"><b>100</b><span>PERSONAGENS<br>PLANEJADOS</span></div></section>
    <div class="codex-summary">${realms.map((realm) => `<article class="codex-stat stat-${realm.color}"><span>${realm.name}</span><b>${realm.elos.reduce((sum, elo) => sum + getEloRoster(elo.id).length, 0)}</b><small>${realm.elos.length} ${realm.elos.length === 1 ? "Elo" : "Elos"}</small></article>`).join("")}</div>
    <div class="codex-controls"><label class="search-box"><span>⌕</span><input type="search" data-search value="${esc(state.crewSearch)}" placeholder="Buscar personagem ou Elo"></label><div class="filter-row">${["Todos", "Inferno", "Paraíso", "Limbo"].map((realm) => `<button class="${state.crewRealm === realm ? "active" : ""}" data-crew-realm="${realm}">${realm}</button>`).join("")}</div></div>
    <div class="codex-grid">${filtered.map((character) => {
      const owned = profile.ownedIds.includes(character.id);
      return `<article class="codex-card ${!owned ? "unowned" : ""}">
        <div class="codex-card-head color-${character.color}">${character.art?.portrait ? portraitMarkup(character, "codex-portrait") : ""}<span class="codex-card-sigil">${esc(character.symbol)}</span><small>${owned ? "RECRUTADA" : "TRILHA NÃO CONCLUÍDA"}</small></div>
        <div class="codex-card-body"><div class="eyebrow">${esc(character.realm)} · ELO DA ${esc(character.elo).toUpperCase()}</div><h3>${esc(character.name)}</h3><p>${esc(character.role)} · ${esc(character.roleHint)}</p><div class="codex-passive">${character.passive.art ? `<img src="${esc(character.passive.art)}" alt="" loading="lazy">` : `<span class="passive-fallback color-${esc(character.color)}">${esc(character.symbol)}</span>`}<div><b>${esc(character.passive.name)}</b><span>${esc(character.passive.description)}</span></div></div></div>
        <div class="codex-moves">${character.abilities.map((ability, index) => `<span title="${esc(ability.description)}">${ability.art ? `<img src="${esc(ability.art)}" alt="" loading="lazy">` : `<i class="move-fallback color-${esc(character.color)}">${String(index + 1).padStart(2, "0")}</i>`}<b>${esc(ability.name)}</b></span>`).join("")}</div>
      </article>`;
    }).join("")}</div>`;
}

function unitCard(unit, side, index) {
  const isEnemy = side === "enemy";
  const selected = isEnemy && state.targetId === unit.id;
  const hpPercent = Math.max(0, (unit.hp / unit.maxHp) * 100);
  const barClass = unit.realm === "Inferno" ? "hp-hell" : unit.realm === "Paraíso" ? "hp-heaven" : "hp-limbo";
  return `<article class="combat-unit ${isEnemy ? "enemy-unit" : "ally-unit"} ${unit.hp <= 0 ? "fallen" : ""} ${selected ? "targeted" : ""}" ${isEnemy && unit.hp > 0 ? `data-target="${unit.id}" role="button" tabindex="0"` : ""}>
    <div class="unit-top"><span class="unit-index">0${index + 1}</span>${portraitMarkup(unit, "unit-symbol")}<span class="unit-state">${unit.hp <= 0 ? "CAÍDO" : unit.stunned ? "ATORDOADO" : unit.shield ? "ESCUDO " + unit.shield : unit.role}</span></div>
    <b class="unit-name">${esc(unit.name)}</b><small class="unit-title">${unit.nameEn ? `${esc(unit.nameEn)} · ${esc(unit.title)}` : `${esc(unit.elo)} · ${esc(unit.realm)}`}</small>
    <div class="health-row"><div class="health-track"><i class="${barClass}" style="width:${hpPercent}%"></i></div><b>${Math.max(0, unit.hp)}</b></div>
    ${!isEnemy && unit.stunned && !state.battle.acted.includes(unit.id) ? `<button class="stun-skip" data-skip-stunned="${unit.id}">ATORDOADO · PERDER A AÇÃO</button>` : !isEnemy ? `<div class="unit-skills">${unit.abilities.map((ability) => {
      const acted = state.battle.acted.includes(unit.id);
      const disabled = state.battle.phase !== "player" || acted || unit.hp <= 0 || unit.stunned || !canAffordAbility(state.battle, unit, ability);
      return `<button class="skill-button ${ability.cost === 0 ? "skill-basic" : ""}" data-use-skill="${unit.id}:${ability.id}" title="${esc(ability.description || ability.name)}" ${disabled ? "disabled" : ""}>${ability.art ? `<img class="skill-art" src="${esc(ability.art)}" alt="" loading="lazy">` : `<span class="skill-art-fallback color-${esc(unit.color)}">${esc(unit.symbol)}</span>`}<span><b>${esc(ability.name)}</b><small>${esc(ability.description || ability.kind)}</small></span>${costMarkup(unit, ability)}</button>`;
    }).join("")}</div>` : `<div class="enemy-hint">${selected ? "ALVO SELECIONADO" : "SELECIONAR ALVO"}</div>`}
  </article>`;
}

function battleView() {
  const battle = state.battle;
  if (!battle) return "";
  const result = battle.phase === "victory" || battle.phase === "defeat";
  const node = state.battleNode;
  const visibleResources = resources.filter((resource) => resource.id === "essence" || battle.allies.some((ally) => ally.affinity === resource.id));
  return `
    <section class="battle-header"><button class="back-link" data-action="leave-battle">← VOLTAR À TRILHA</button><div><div class="eyebrow">COMBATE TÁTICO 3v3 · ${esc(battle.difficulty.name.toUpperCase())} · RODADA ${battle.round}</div><h1>${esc(node.label)}</h1><p>${esc(activeElo().realm)} · ${esc(eloTitle(activeElo()))} · ${battle.resonance.title}</p></div><div class="combat-resource" aria-label="Recursos do trio">${visibleResources.map((resource) => `<span class="resource-meter resource-${resource.color}" title="${esc(resource.name)}"><span class="resource-symbol">${resource.icon}</span><span><small>${esc(resource.shortName.toUpperCase())}</small><b>${battle.resources[resource.id]}<i> / 5</i></b></span><span class="resource-track"><i style="width:${Math.min(100, battle.resources[resource.id] * 20)}%"></i></span></span>`).join("")}</div></section>
    <div class="battle-layout">
      <section class="battle-side"><div class="battle-side-heading"><span>SEU TRIO</span><small>${battle.allies.filter((unit) => unit.hp > 0).length} EM PÉ</small></div><div class="combat-grid">${battle.allies.map((unit, index) => unitCard(unit, "ally", index)).join("")}</div></section>
      <div class="battle-center"><span class="vs-mark">VS</span><div class="resonance-mini"><b>${battle.resonance.tier === "chaotic" ? "⟲" : "✧"}</b><small>${esc(battle.resonance.detail)}</small></div><button class="pass-turn" data-action="pass-turn" ${battle.phase !== "player" || result ? "disabled" : ""}>ENCERRAR TURNO <span>↗</span></button></div>
      <section class="battle-side enemy-side"><div class="battle-side-heading"><span>OPOSIÇÃO</span><small>${battle.enemies.filter((unit) => unit.hp > 0).length} RESTANTES</small></div><div class="combat-grid">${battle.enemies.map((unit, index) => unitCard(unit, "enemy", index)).join("")}</div></section>
    </div>
    <section class="battle-log"><div><div class="eyebrow">REGISTRO DO COMBATE</div><b>${battle.phase === "player" ? "Sua vez — escolha uma técnica por aliado." : battle.phase === "enemy" ? "O trio adversário está agindo." : battle.phase === "victory" ? "Vitória na trilha." : "As correntes cederam."}</b></div><ol>${battle.log.map((line) => `<li>${esc(line)}</li>`).join("")}</ol></section>
    ${result ? `<div class="battle-result ${battle.phase}"><span>${battle.phase === "victory" ? "✧" : "⟲"}</span><div><b>${battle.phase === "victory" ? "Vitória" : "Derrota"}</b><small>${battle.phase === "victory" ? "A trilha se abre diante do trio." : "Uma Corrente da Alma enfraqueceu."}</small></div><button class="button button-gold" data-action="return-battle">CONTINUAR <span>↗</span></button></div>` : ""}
  `;
}

function render() {
  const tab = state.tab;
  document.body.dataset.tab = tab;
  app.innerHTML = `
    <div class="app-shell">
      ${header()}
      ${statusStrip()}
      <main class="main-content">
        ${tab === "rota" ? routeView() : tab === "trio" ? teamView() : tab === "codex" ? codexView() : battleView()}
      </main>
      <footer class="site-footer"><span>PMA: POST MORTEM ARENA <i>·</i> PROTÓTIPO ORIGINAL</span><span>TRÊS REINOS, DEZESSETE ELOS, UMA ESCOLHA</span><span>BUILD 0.1</span></footer>
      ${state.toast ? `<div class="toast" role="status">${esc(state.toast)}</div>` : ""}
    </div>`;
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("[data-tab], [data-realm], [data-difficulty], [data-start-run], [data-node], [data-crew-realm], [data-add-member], [data-remove-member], [data-search], [data-use-skill], [data-skip-stunned], [data-action], [data-event-choice], [data-choose-buff], [data-abandon-run], [data-clear-notice], [data-final-battle], [data-target]");
  if (!target) return;
  if (target.dataset.tab) {
    state.tab = target.dataset.tab;
    state.pending = null;
    render();
    return;
  }
  if (target.dataset.realm) {
    state.realmId = target.dataset.realm;
    state.eloId = realms.find((realm) => realm.id === state.realmId).elos[0].id;
    render();
    return;
  }
  if (target.dataset.difficulty) {
    if (profile.run || !difficulties.some((item) => item.id === target.dataset.difficulty)) return;
    profile.difficulty = target.dataset.difficulty;
    save();
    render();
    return;
  }
  if (target.dataset.startRun) { startRun(target.dataset.startRun); return; }
  if (target.dataset.node) {
    const [stageIndex, nodeIndex] = target.dataset.node.split(":").map(Number);
    const node = routeStages[stageIndex]?.[nodeIndex];
    if (node && profile.run?.stage === stageIndex) resolveNode(node);
    return;
  }
  if (target.dataset.crewRealm) { state.crewRealm = target.dataset.crewRealm; render(); return; }
  if (target.dataset.addMember) {
    const id = target.dataset.addMember;
    if (!profile.ownedIds.includes(id)) return;
    if (profile.team.includes(id)) profile.team = profile.team.filter((member) => member !== id);
    else if (profile.team.length < 3) profile.team.push(id);
    else { toast("O trio já está completo."); return; }
    save();
    render();
    return;
  }
  if (target.dataset.removeMember) {
    profile.team = profile.team.filter((id) => id !== target.dataset.removeMember);
    save(); render(); return;
  }
  if (target.dataset.useSkill) {
    const [actorId, abilityId] = target.dataset.useSkill.split(":");
    updateBattle(actorId, abilityId);
    return;
  }
  if (target.dataset.skipStunned) { skipStunnedAction(state.battle, target.dataset.skipStunned); render(); return; }
  if (target.dataset.target) {
    state.targetId = target.dataset.target;
    render();
    return;
  }
  if (target.dataset.action === "pass-turn") {
    passTurn(state.battle);
    render();
    return;
  }
  if (target.dataset.action === "return-battle") { returnFromBattle(); return; }
  if (target.dataset.action === "leave-battle") { state.tab = "rota"; render(); return; }
  if (target.dataset.eventChoice) { chooseEvent(target.dataset.eventChoice); return; }
  if (target.dataset.chooseBuff) { chooseBuff(target.dataset.chooseBuff); return; }
  if (target.dataset.abandonRun) {
    if (profile.run && confirm("Abandonar a trilha atual? A estabilidade será perdida.")) {
      profile.run = null; save(); render();
    }
    return;
  }
  if (target.dataset.clearNotice !== undefined) { state.pending = null; render(); return; }
  if (target.dataset.finalBattle !== undefined) {
    const elo = getEloById("vazio");
    state.eloId = elo.id;
    startEncounter({ id: "finale", label: "A Última Barreira", eloId: elo.id });
  }
});

app.addEventListener("input", (event) => {
  if (event.target.matches("[data-search]")) {
    state.crewSearch = event.target.value;
    const cursor = event.target.selectionStart;
    render();
    const input = app.querySelector("[data-search]");
    input?.focus();
    input?.setSelectionRange(cursor, cursor);
  }
});

app.addEventListener("keydown", (event) => {
  if (event.target.matches("[data-target]") && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    state.targetId = event.target.dataset.target;
    render();
  }
});

render();
