import { characters, characterById, elos, realms, generateTrail, buffs, starters, resources, resourceById, realmResource } from "./data.js";
import { getResonance, getEloRoster, getRelevantBuffs } from "./rules.js";
import { canAffordAbility, chooseAction, createBattle, createEnemyTeam, getAbilityResourceCosts, getEloById, passTurn } from "./engine.js";

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
      completedElos: saved.completedElos || []
    };
  } catch {
    return { ...defaults, version: 1 };
  }
}

const profile = readProfile();
function ensureRunMap() {
  if (!profile.run) return;
  const run = profile.run;
  if (!Array.isArray(run.map) || !run.map.length) run.map = generateTrail(run.eloId, run.seed || 0);
  run.stage = Math.min(Math.max(0, run.stage || 0), run.map.length);
  run.clearedNodeIds ||= [];
  run.availableNodeIds ||= run.map[run.stage]?.map((node) => node.id) || [];
  run.teamHealth ||= Object.fromEntries((run.team || profile.team).map((id) => [id, 100]));
  run.buffs ||= [];
}
ensureRunMap();
let state = {
  tab: "rota",
  realmId: "inferno",
  eloId: "sangria",
  crewRealm: "Todos",
  crewSearch: "",
  targetId: null,
  battle: null,
  battleFx: null,
  battleNode: null,
  pending: null,
  toast: "",
  toastTimer: null
};
let battleFxTimer = null;
let battleFxSequence = 0;

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

function eloSeed(eloId) {
  return [...eloId].reduce((value, char) => ((value * 31) + char.charCodeAt(0)) >>> 0, 17);
}

function islandShape(seed, cx, cy, rx, ry, scale = 1, points = 28) {
  const vertices = Array.from({ length: points }, (_, index) => {
    const angle = (index / points) * Math.PI * 2;
    const noise = .82 + ((Math.sin(seed * .017 + index * 2.31) + Math.cos(seed * .009 + index * .83) + 2) / 4) * .28;
    return { x: cx + Math.cos(angle) * rx * noise * scale, y: cy + Math.sin(angle) * ry * noise * scale };
  });
  const middle = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  let path = `M ${middle(vertices.at(-1), vertices[0]).x.toFixed(1)} ${middle(vertices.at(-1), vertices[0]).y.toFixed(1)}`;
  vertices.forEach((point, index) => {
    const next = middle(point, vertices[(index + 1) % vertices.length]);
    path += ` Q ${point.x.toFixed(1)} ${point.y.toFixed(1)} ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
  });
  return `${path} Z`;
}

function atlasIllustration(elo, height) {
  const seed = eloSeed(elo.id);
  const centerY = height / 2;
  const waterColor = elo.realm === "Inferno" ? "#181015" : elo.realm === "Paraíso" ? "#102024" : "#15121e";
  const landColor = elo.realm === "Inferno" ? "#472629" : elo.realm === "Paraíso" ? "#263d3c" : "#30283d";
  const highlandColor = elo.realm === "Inferno" ? "#815044" : elo.realm === "Paraíso" ? "#628476" : "#67577f";
  const shoreColor = elo.realm === "Inferno" ? "#df877b" : elo.realm === "Paraíso" ? "#afd2bd" : "#b6a1d0";
  const land = islandShape(seed, 450, centerY, 344, Math.min(330, height * .43), 1);
  const contours = [.89, .77, .64].map((scale) => `<path class="atlas-contour" d="${islandShape(seed + 83, 450, centerY, 344, Math.min(330, height * .43), scale)}"/>`).join("");
  const waves = Array.from({ length: 16 }, (_, index) => {
    const y = 34 + index * ((height - 68) / 15);
    const curve = ((seed + index * 19) % 31) - 15;
    return `<path d="M 0 ${y.toFixed(1)} Q 220 ${(y + curve).toFixed(1)} 450 ${y.toFixed(1)} T 900 ${y.toFixed(1)}"/>`;
  }).join("");
  const satelliteIslands = Array.from({ length: 5 }, (_, index) => {
    const angle = ((seed % 360) + index * 72) * Math.PI / 180;
    const x = 450 + Math.cos(angle) * (350 + (index % 2) * 28);
    const y = centerY + Math.sin(angle) * (Math.min(330, height * .43) + 18);
    const shape = islandShape(seed + index * 67, x, y, 45 + (index % 3) * 8, 25 + (index % 2) * 8, 1, 12);
    return `<path class="atlas-islet" d="${shape}"/>`;
  }).join("");
  const ridges = Array.from({ length: 7 }, (_, index) => {
    const x = 155 + ((seed * (index + 5)) % 590);
    const y = 95 + ((seed + index * 113) % Math.max(1, Math.floor(height - 190)));
    const size = 13 + ((seed + index * 29) % 15);
    return `<path class="atlas-ridge" d="M ${x - size} ${y + size * .56} L ${x} ${y - size} L ${x + size} ${y + size * .56} Z"/>`;
  }).join("");
  const realmFeature = elo.realm === "Inferno"
    ? `<path class="atlas-feature" d="M 260 ${centerY - 98} Q 352 ${centerY - 20} 420 ${centerY + 6} T 600 ${centerY + 122}"/><path class="atlas-feature thin" d="M 590 ${centerY - 150} Q 520 ${centerY - 42} 547 ${centerY + 10} T 470 ${centerY + 180}"/>`
    : elo.realm === "Paraíso"
      ? `<path class="atlas-feature" d="M 178 ${centerY + 160} Q 280 ${centerY + 12} 420 ${centerY + 40} T 700 ${centerY - 120}"/><path class="atlas-feature thin" d="M 250 ${centerY - 160} Q 360 ${centerY - 40} 440 ${centerY - 82} T 640 ${centerY + 110}"/>`
      : `<path class="atlas-feature" d="M 245 ${centerY - 210} L 415 ${centerY - 28} L 335 ${centerY + 88} L 516 ${centerY + 236}"/><path class="atlas-feature thin" d="M 640 ${centerY - 194} L 500 ${centerY - 35} L 585 ${centerY + 92} L 424 ${centerY + 210}"/>`;
  const uid = `atlas-${elo.id}`;
  return `<svg class="map-illustration" viewBox="0 0 900 ${height}" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="${uid}-land" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="${highlandColor}" stop-opacity=".66"/><stop offset=".52" stop-color="${landColor}" stop-opacity=".91"/><stop offset="1" stop-color="${waterColor}" stop-opacity=".92"/></linearGradient><radialGradient id="${uid}-sea"><stop stop-color="${shoreColor}" stop-opacity=".12"/><stop offset="1" stop-color="${waterColor}" stop-opacity=".72"/></radialGradient></defs>
    <rect width="900" height="${height}" fill="${waterColor}"/><rect width="900" height="${height}" fill="url(#${uid}-sea)"/>
    <g class="atlas-waves">${waves}</g>
    <path class="atlas-shoreline" d="${land}"/><path class="atlas-land" d="${land}" fill="url(#${uid}-land)"/>
    <g class="atlas-contours">${contours}</g><g class="atlas-ridges">${ridges}</g><g class="atlas-islets">${satelliteIslands}</g>
    ${realmFeature}
    <circle class="atlas-sigil-ring" cx="450" cy="${centerY}" r="118"/><text class="atlas-sigil" x="450" y="${centerY + 28}" text-anchor="middle">${esc(elo.symbol)}</text>
    <rect class="atlas-frame" x="8" y="8" width="884" height="${height - 16}" rx="8"/>
  </svg>`;
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
  const seed = Date.now();
  const map = generateTrail(eloId, seed);
  profile.run = {
    eloId, seed, map, stage: 0, stability: 3, maxStability: 3, buffs: [], encounter: 0,
    tried: 0, teamHealth: Object.fromEntries(profile.team.map((id) => [id, 100])),
    availableNodeIds: map[0].map((node) => node.id), clearedNodeIds: [], currentNodeId: null
  };
  state.eloId = eloId;
  state.pending = null;
  state.tab = "rota";
  save();
  render();
}

function continueRun() {
  if (!profile.run) return;
  const run = profile.run;
  const current = run.map.flat().find((node) => node.id === run.currentNodeId);
  if (current) {
    run.clearedNodeIds = [...new Set([...run.clearedNodeIds, current.id])];
    run.availableNodeIds = current.nextIds || [];
  }
  run.stage += 1;
  run.encounter += 1;
  run.tried = 0;
  run.currentNodeId = null;
  state.pending = null;
  if (run.stage >= run.map.length) completeRun();
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
  profile.xp += 250;
  profile.fragments += 24;
  profile.run = null;
  state.pending = { type: "complete", elo };
  state.tab = "rota";
}

function startEncounter(node) {
  if (battleFxTimer) clearTimeout(battleFxTimer);
  const nodeType = node.type || node.id;
  if (!profile.run && nodeType !== "finale") return;
  const elo = activeElo();
  const specialFinale = nodeType === "finale";
  const encounterType = specialFinale ? "boss" : nodeType;
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
  if (profile.run && nodeType !== "finale") profile.run.currentNodeId = node.id;
  state.battle = createBattle(profile.team, enemies, { buffs: profile.run?.buffs || [], teamHealth: profile.run?.teamHealth || {} });
  state.targetId = null;
  state.battleFx = null;
  state.tab = "battle";
  render();
}

function resolveNode(node) {
  if (!profile.run) return;
  const nodeType = node.type || node.id;
  profile.run.currentNodeId = node.id;
  if (["normal", "elite", "mini", "boss", "finale"].includes(nodeType)) {
    startEncounter(node);
    return;
  }
  if (nodeType === "repair") {
    healRunTeam(0.4);
    profile.run.stability = Math.min(profile.run.maxStability, profile.run.stability + 1);
    toast("Trio recuperado e Correntes reparadas: " + profile.run.stability + "/" + profile.run.maxStability + ".");
    continueRun();
    return;
  }
  if (nodeType === "treasure") {
    profile.fragments += 12;
    grantRunBuff(activeAffinityBuff());
    toast(`Você encontrou 12 fragmentos e um Eco de ${activeAffinityResource().shortName}.`);
    continueRun();
    return;
  }
  if (nodeType === "event") state.pending = { type: "event" };
  if (nodeType === "shop") state.pending = { type: "shop", choices: getRelevantBuffs(profile.team, profile.run.buffs).slice(0, 3) };
  if (nodeType === "upgrade") {
    const choices = getRelevantBuffs(profile.team, profile.run.buffs);
    state.pending = { type: "upgrade", choices: choices.sort(() => Math.random() - 0.5).slice(0, 3) };
  }
  render();
}

function chooseEvent(choice) {
  if (choice === "repair") {
    healRunTeam(0.25);
    profile.run.stability = Math.min(profile.run.maxStability, profile.run.stability + 1);
    toast("Uma alma gentil reforça uma Corrente.");
  } else {
    profile.fragments += 8;
    grantRunBuff(activeAffinityBuff());
    toast(`Você guarda 8 fragmentos e um Eco de ${activeAffinityResource().shortName}.`);
  }
  continueRun();
}

function chooseBuff(id) {
  if (!profile.run || profile.run.buffs.includes(id)) return;
  profile.run.buffs.push(id);
  continueRun();
}

function grantRunBuff(id) {
  if (!profile.run || !id || profile.run.buffs.includes(id)) return false;
  profile.run.buffs.push(id);
  return true;
}

function healRunTeam(ratio) {
  if (!profile.run) return;
  for (const id of profile.team) {
    const maxHp = characterById[id]?.maxHp || 100;
    const hp = profile.run.teamHealth[id] ?? maxHp;
    profile.run.teamHealth[id] = Math.min(maxHp, hp + Math.ceil(maxHp * ratio));
  }
}

function chooseShop(action, buffId) {
  if (!profile.run) return;
  if (action === "heal" && profile.fragments >= 12) {
    profile.fragments -= 12;
    healRunTeam(0.35);
    toast("O trio recuperou 35% de Vida por 12 fragmentos.");
  } else if (action === "buff" && profile.fragments >= 22 && grantRunBuff(buffId)) {
    profile.fragments -= 22;
    toast("Eco comprado por 22 fragmentos.");
  } else if (action !== "leave") {
    toast("Fragmentos insuficientes ou Eco já coletado.");
    return;
  }
  continueRun();
}

function returnFromBattle() {
  if (!state.battle) return;
  if (state.battle.phase === "victory") {
    if ((state.battleNode.type || state.battleNode.id) === "finale") {
      state.pending = { type: "finale-complete" };
      profile.run = null;
      profile.xp += 500;
      profile.fragments += 80;
      save();
      state.battle = null;
      state.tab = "rota";
      render();
      return;
    }
    if (profile.run) {
      profile.run.teamHealth = Object.fromEntries(state.battle.allies.map((ally) => [ally.id, ally.hp]));
      const rewardNode = ["elite", "mini"].includes(state.battleNode.type || state.battleNode.id);
      profile.fragments += rewardNode ? 18 : 6;
      if (rewardNode) {
        const choices = getRelevantBuffs(profile.team, profile.run.buffs).sort(() => Math.random() - 0.5).slice(0, 3);
        if (choices.length) {
          state.battle = null;
          state.pending = { type: "reward", choices };
          state.tab = "rota";
          save();
          render();
          return;
        }
      }
    }
    state.battle = null;
    continueRun();
    return;
  }
  if (state.battle.phase === "defeat") {
    if ((state.battleNode.type || state.battleNode.id) === "finale") {
      state.battle = null;
      state.pending = { type: "finale-defeat" };
      state.tab = "rota";
      render();
      return;
    }
    profile.run.teamHealth = Object.fromEntries(state.battle.allies.map((ally) => [ally.id, Math.max(35, ally.hp || Math.round(ally.maxHp * 0.35))]));
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

function battleSnapshot(battle) {
  return [...battle.allies.map((unit) => ({ ...unit, side: "ally" })), ...battle.enemies.map((unit) => ({ ...unit, side: "enemy" }))]
    .map((unit) => ({ id: unit.id, name: unit.name, side: unit.side, hp: unit.hp, shield: unit.shield, stunned: unit.stunned, weakened: unit.weakened, exposed: unit.exposed, burning: unit.burning, abilities: unit.abilities }));
}

function battleChanges(before, battle) {
  const previous = new Map(before.map((unit) => [unit.id, unit]));
  const statuses = [["stunned", "ATORDOADO"], ["weakened", "ENFRAQUECIDO"], ["exposed", "EXPOSTO"], ["burning", "EM CHAMAS"]];
  return [...battle.allies.map((unit) => ({ ...unit, side: "ally" })), ...battle.enemies.map((unit) => ({ ...unit, side: "enemy" }))]
    .map((unit) => {
      const old = previous.get(unit.id);
      if (!old) return null;
      const change = {
        id: unit.id, name: unit.name, side: unit.side,
        hp: unit.hp - old.hp,
        shield: (unit.shield || 0) - (old.shield || 0),
        statuses: statuses.flatMap(([key, label]) => {
          const delta = (unit[key] || 0) - (old[key] || 0);
          if (delta > 0) return [`${label} +${delta}`];
          if (delta < 0) return [`${label} ${unit[key] > 0 ? `−${Math.abs(delta)}` : "REMOVIDO"}`];
          return [];
        })
      };
      return change.hp || change.shield || change.statuses.length ? change : null;
    }).filter(Boolean);
}

function presentBattleEffect(before, { actorId = null, abilityId = null, targetId = null, roundBefore, mode = "ability" }) {
  const battle = state.battle;
  if (!battle) return;
  const actor = before.find((unit) => unit.id === actorId);
  const ability = actor?.abilities.find((item) => item.id === abilityId);
  const changes = battleChanges(before, battle);
  const summary = changes.flatMap((change) => [
    change.hp < 0 ? `${change.name}: −${Math.abs(change.hp)} Vida` : "",
    change.hp > 0 ? `${change.name}: +${change.hp} Vida` : "",
    change.shield < 0 ? `${change.name}: −${Math.abs(change.shield)} Escudo` : "",
    change.shield > 0 ? `${change.name}: +${change.shield} Escudo` : "",
    change.statuses.length ? `${change.name}: ${change.statuses.join(", ")}` : ""
  ]).filter(Boolean).slice(0, 3).join(" · ");
  const kind = mode === "turn" ? "turn" : changes.some((change) => change.hp < 0) ? "impact" : changes.some((change) => change.hp > 0) ? "restore" : changes.some((change) => change.shield) ? "shield" : changes.some((change) => change.statuses.length) ? "control" : "cast";
  const id = ++battleFxSequence;
  state.battleFx = {
    id, mode, kind, actorId, abilityId, targetId, changes,
    title: mode === "turn" ? "Turno adversário resolvido" : ability?.name || "Técnica",
    actorName: actor?.name || null,
    summary: summary || (battle.phase === "victory" ? "A última unidade adversária caiu." : battle.phase === "defeat" ? "O trio foi derrotado. Confira o registro para ver as intenções." : battle.round !== roundBefore ? `Rodada ${battle.round} iniciada · recursos renovados.` : mode === "turn" ? "O turno foi resolvido sem alterar Vida ou Escudo." : "A técnica foi ativada sem mudar Vida, Escudo ou condições."),
    roundAdvanced: battle.round !== roundBefore,
    completed: battle.phase === "victory" || battle.phase === "defeat"
  };
  if (battleFxTimer) clearTimeout(battleFxTimer);
  render();
  battleFxTimer = setTimeout(() => {
    if (state.battleFx?.id !== id) return;
    state.battleFx = null;
    render();
  }, 2350);
}

function updateBattle(actorId, abilityId) {
  if (state.battleFx || !state.battle) return;
  const before = battleSnapshot(state.battle);
  const roundBefore = state.battle.round;
  const targetId = state.targetId || state.battle.enemies.find((enemy) => enemy.hp > 0)?.id;
  const result = chooseAction(state.battle, actorId, abilityId, targetId);
  if (!result.ok) {
    toast(result.reason);
    return;
  }
  state.targetId = null;
  presentBattleEffect(before, { actorId, abilityId, targetId, roundBefore });
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
      <div class="realm-tabs">${realms.map((item) => `<button class="realm-tab ${state.realmId === item.id ? "selected" : ""} realm-${item.id}" data-realm="${item.id}"><span>${item.name === "Inferno" ? "✹" : item.name === "Paraíso" ? "✧" : "⟲"}</span><b>${item.name}</b><small>${item.elos.length} ${item.elos.length === 1 ? "Elo" : "Elos"}</small></button>`).join("")}</div>
      <div class="realm-intro"><div><span class="eyebrow">DOMÍNIO · ${esc(realm.title.toUpperCase())}</span><p>${esc(realm.description)}</p></div><span class="realm-sigil">${realm.color === "inferno" ? "✹" : realm.color === "paraiso" ? "✧" : "⟲"}</span></div>
      <div class="elo-grid">${realm.elos.map((elo) => `
        <article class="elo-card elo-${elo.color} ${currentRun?.eloId === elo.id ? "is-current" : ""}">
          <div class="elo-card-top"><span class="elo-symbol">${elo.symbol}</span><span class="elo-status ${profile.completedElos.includes(elo.id) ? "complete" : ""}">${profile.completedElos.includes(elo.id) ? "CONCLUÍDO" : "TRILHA"}</span></div>
          <h3>Elo da ${esc(elo.name)}</h3><p class="elo-theme">${esc(elo.theme)}</p>
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
  const completed = run.stage >= run.map.length;
  const cleared = new Set(run.clearedNodeIds || []);
  const available = new Set(run.availableNodeIds || []);
  const rowStep = 114;
  const stageHeight = 94;
  const height = run.map.length * rowStep - (rowStep - stageHeight);
  const xFor = (col) => 150 + col * 300;
  const edges = run.map.flat().flatMap((node) => node.nextIds.map((nextId) => {
    const next = run.map.flat().find((candidate) => candidate.id === nextId);
    if (!next) return "";
    const activeEdge = cleared.has(node.id) && available.has(next.id);
    const startY = node.row * rowStep + stageHeight - 20;
    const endY = next.row * rowStep + 4;
    const bend = Math.max(13, (endY - startY) * .42);
    return `<path class="path-edge ${activeEdge ? "available" : ""}" d="M ${xFor(node.col)} ${startY} C ${xFor(node.col)} ${startY + bend}, ${xFor(next.col)} ${endY - bend}, ${xFor(next.col)} ${endY}"/>`;
  })).join("");
  return `
    <section class="run-panel">
      <div class="run-heading"><div><div class="eyebrow">TRILHA ATIVA · ${esc(elo.realm.toUpperCase())}</div><h3>Elo da ${esc(elo.name)}</h3></div><div class="run-strength"><span class="run-elo-symbol">${elo.symbol}</span><span><small>ESTABILIDADE DAS CORRENTES</small><b>${run.stability}/${run.maxStability}</b></span></div></div>
      <div class="path-guide"><span>MAPA DA TRAVESSIA <i>·</i> ESCOLHA UM NÓ CONECTADO</span><div><small><i class="legend-combat">⚔</i> Combate</small><small><i class="legend-reward">✦</i> Recompensa</small><small><i class="legend-rest">⟲</i> Descanso</small><small><i class="legend-event">◇</i> Evento</small></div></div>
      <div class="path-map map-elo-${esc(elo.id)} color-${esc(elo.color)}"><div class="path-canvas">
        <div class="atlas-caption" aria-hidden="true"><span>${elo.symbol}</span><div><small>MAPA DO ELO</small><b>${esc(elo.name.toUpperCase())}</b><i>${esc(elo.theme)}</i></div></div>
        ${atlasIllustration(elo, height)}
        <svg class="path-lines" viewBox="0 0 900 ${height}" preserveAspectRatio="none" aria-hidden="true">${edges}</svg>
        <div class="path-grid">${run.map.map((stage, stageIndex) => {
          const nodes = stage.map((node) => {
            const done = cleared.has(node.id);
            const canSelect = available.has(node.id) && !completed;
            const nodeType = node.type || node.id;
            const nodeKind = nodeType === "normal" ? "COMBATE" : nodeType === "boss" ? "CHEFE" : nodeType === "mini" ? "ELITE" : nodeType.toUpperCase();
            const access = done ? "Concluído" : canSelect ? "Disponível para escolher" : "Bloqueado";
            return `<button class="path-node type-${esc(nodeType)} ${done ? "done" : ""} ${canSelect ? "active" : "locked"}" style="grid-column:${node.col + 1}" ${canSelect ? `data-node="${esc(node.id)}"` : "disabled aria-disabled=\"true\""} title="${esc(node.desc)}" aria-label="${esc(`${node.label}, ${nodeKind.toLowerCase()}. ${node.desc}. ${access}.`)}">
              <span class="node-icon" aria-hidden="true">${done ? "✓" : node.icon}</span><b>${esc(node.label)}</b><i class="node-type">${esc(nodeKind)}</i>
            </button>`;
          }).join("");
          return `<div class="path-stage ${stageIndex === run.stage ? "current-floor" : ""}"><span class="stage-number">${String(stageIndex + 1).padStart(2, "0")}</span><div class="stage-nodes">${nodes}</div></div>`;
        }).join("")}</div>
      </div></div>
      <div class="run-footer"><span>ANDAR <b>${Math.min(run.stage + 1, run.map.length)}</b> / ${run.map.length}</span><span class="buff-list">${run.buffs.length ? run.buffs.map((id) => `<i title="${esc(buffs.find((buff) => buff.id === id)?.title || id)}">✧</i>`).join("") : "Nenhum Eco coletado"}</span><button class="text-button" data-abandon-run>ABANDONAR TRILHA</button></div>
    </section>`;
}

function pendingPanel() {
  const pending = state.pending;
  if (!pending) return "";
  if (pending.type === "event") return `
    <section class="choice-panel"><div class="eyebrow">EVENTO · UMA ALMA À BEIRA DA TRILHA</div><h3>Uma corrente pede cuidado.</h3><p>Um viajante oferece fragmentos para continuar ou ajuda o trio a remendar uma fissura.</p><div class="choice-actions"><button data-event-choice="repair"><b>⟲ Reparar uma corrente</b><small>Recupere 1 de estabilidade e 25% de Vida</small></button><button data-event-choice="echo"><b>◈ Guardar um eco</b><small>Receba 8 fragmentos e 1 ${esc(activeAffinityResource().name)} extra por combate</small></button></div></section>`;
  if (["upgrade", "reward"].includes(pending.type)) return `
    <section class="choice-panel"><div class="eyebrow">${pending.type === "reward" ? "RECOMPENSA DE ELITE · ESCOLHA UM PODER" : "APRIMORAMENTO · ESCOLHA UM ECO"}</div><h3>${pending.type === "reward" ? "A vitória deixa uma marca no trio." : "O trio se adapta à trilha."}</h3><div class="buff-choices">${pending.choices.map((buff) => `<button class="buff-card" data-choose-buff="${buff.id}"><span>${buff.icon}</span><b>${esc(buff.title)}</b><small>${esc(buff.text)}</small></button>`).join("")}</div></section>`;
  if (pending.type === "shop") return `
    <section class="choice-panel"><div class="eyebrow">MERCADOR · ${profile.fragments} FRAGMENTOS</div><h3>Prepare o trio para o próximo andar.</h3><div class="shop-choices"><button class="shop-item" data-shop-action="heal" ${profile.fragments < 12 ? "disabled" : ""}><span>⟲</span><b>Remendar o trio</b><small>Recupere 35% da Vida · 12 fragmentos</small></button>${pending.choices.map((buff) => `<button class="shop-item" data-shop-buff="${buff.id}" ${profile.fragments < 22 ? "disabled" : ""}><span>${buff.icon}</span><b>${esc(buff.title)}</b><small>${esc(buff.text)} · 22 fragmentos</small></button>`).join("")}<button class="shop-item shop-leave" data-shop-action="leave"><span>↗</span><b>Seguir viagem</b><small>Guarde seus fragmentos</small></button></div></section>`;
  if (pending.type === "complete") return `
    <section class="notice-panel"><span class="notice-icon">✧</span><div><div class="eyebrow">TRILHA CONCLUÍDA</div><h3>Elo da ${esc(pending.elo.name)} atravessado.</h3><p>${getEloRoster(pending.elo.id).length} almas do Elo agora podem ser recrutadas. +250 XP e 24 fragmentos.</p></div><button class="button button-outline" data-clear-notice>CONTINUAR</button></section>`;
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
  const intent = isEnemy ? state.battle.intents.find((item) => item.actorId === unit.id) : null;
  const fx = state.battleFx;
  const change = fx?.changes.find((item) => item.id === unit.id);
  const fxClasses = [
    fx?.actorId === unit.id && "fx-caster",
    change?.hp < 0 && "fx-damage",
    change?.hp > 0 && "fx-heal",
    change?.shield > 0 && "fx-shield",
    change?.statuses.length && "fx-control"
  ].filter(Boolean).join(" ");
  const hpPercent = Math.max(0, (unit.hp / unit.maxHp) * 100);
  const barClass = unit.realm === "Inferno" ? "hp-hell" : unit.realm === "Paraíso" ? "hp-heaven" : "hp-limbo";
  const statusLabels = [
    unit.shield > 0 && `Escudo ${unit.shield}`,
    unit.stunned > 0 && "Atordoado",
    unit.weakened > 0 && "Enfraquecido",
    unit.exposed > 0 && "Exposto",
    unit.burning > 0 && "Em chamas"
  ].filter(Boolean);
  const floaters = change ? [
    change.hp < 0 && `<span class="floater-damage">−${Math.abs(change.hp)} VIDA</span>`,
    change.hp > 0 && `<span class="floater-heal">+${change.hp} VIDA</span>`,
    change.shield > 0 && `<span class="floater-shield">+${change.shield} ESCUDO</span>`,
    change.shield < 0 && `<span class="floater-damage">−${Math.abs(change.shield)} ESCUDO</span>`,
    change.statuses.length > 0 && `<span class="floater-control">${change.statuses.map(esc).join(" · ")}</span>`
  ].filter(Boolean).join("") : "";
  return `<article class="combat-unit fighter-card ${isEnemy ? "enemy-unit" : "ally-unit"} color-${esc(unit.color)} ${unit.hp <= 0 ? "fallen" : ""} ${selected ? "targeted" : ""} ${fxClasses}" ${isEnemy && unit.hp > 0 ? `data-target="${unit.id}" role="button" tabindex="0" aria-label="Selecionar ${esc(unit.name)} como alvo"` : ""}>
    <div class="fighter-backdrop">${portraitMarkup(unit, "fighter-portrait")}</div><div class="fighter-shade"></div>
    ${floaters ? `<div class="combat-floaters" aria-hidden="true">${floaters}</div>` : ""}
    <div class="fighter-content">
      <div class="fighter-meta"><span class="unit-index">0${index + 1} · ${isEnemy ? "OPOSIÇÃO" : "TRIO"}</span><span class="unit-state">${unit.hp <= 0 ? "CAÍDO" : selected ? "ALVO MARCADO" : esc(unit.role)}</span></div>
      <div class="fighter-nameplate"><b class="unit-name">${esc(unit.name)}</b><small class="unit-title">${unit.nameEn ? `${esc(unit.nameEn)} · ${esc(unit.title)}` : `${esc(unit.elo)} · ${esc(unit.realm)}`}</small></div>
      <div class="health-row"><div class="health-track"><i class="${barClass}" style="width:${hpPercent}%"></i></div><b>${Math.max(0, unit.hp)}</b></div>
      ${statusLabels.length ? `<div class="unit-statuses">${statusLabels.map((label) => `<span>${esc(label)}</span>`).join("")}</div>` : ""}
      ${isEnemy && unit.hp > 0 ? (intent ? `<div class="enemy-intent"><span>INTENÇÃO · ${esc(intent.targetName)}</span><b>${esc(intent.abilityName)}</b><small>${esc(intent.damage ? `até ${intent.damage} de dano` : intent.effect || intent.targetName)}</small></div>` : `<div class="enemy-hint">${selected ? "ALVO SELECIONADO" : "MARCAR COMO ALVO"}</div>`) : ""}
    </div>
  </article>`;
}

function techniqueCard(unit, index) {
  const acted = state.battle.acted.includes(unit.id);
  const castAbility = state.battleFx?.actorId === unit.id ? state.battleFx.abilityId : null;
  return `<article class="technique-card color-${esc(unit.color)} ${unit.hp <= 0 ? "fallen" : ""} ${acted ? "acted" : ""}">
    <div class="technique-card-heading">${portraitMarkup(unit, "technique-avatar")}<span><small>0${index + 1} · ${esc(unit.role)}</small><b>${esc(unit.name)}</b></span><i>${acted ? "AÇÃO USADA" : unit.hp <= 0 ? "CAÍDO" : unit.stunned > 0 ? "ATORDOADO" : "PRONTO"}</i></div>
    <div class="unit-skills">${unit.abilities.map((ability) => {
      const cooldown = unit.cooldowns[ability.id] || 0;
      const disabled = state.battle.phase !== "player" || Boolean(state.battleFx) || acted || state.battle.acted.length >= state.battle.actionLimit || unit.hp <= 0 || unit.stunned > 0 || cooldown > 0 || !canAffordAbility(state.battle, unit, ability);
      const isCasting = castAbility === ability.id;
      return `<button class="skill-button ${ability.cost === 0 ? "skill-basic" : ""} ${isCasting ? "skill-cast" : ""}" data-use-skill="${unit.id}:${ability.id}" title="${esc(ability.description || ability.name)}" ${disabled ? "disabled" : ""}>${ability.art ? `<img class="skill-art" src="${esc(ability.art)}" alt="" loading="lazy">` : `<span class="skill-art-fallback color-${esc(unit.color)}">${esc(unit.symbol)}</span>`}<span><b>${esc(ability.name)}</b><small>${cooldown ? `Recarga: ${cooldown}T` : esc(ability.description || ability.kind)}</small></span>${cooldown ? `<span class="cooldown-badge">${cooldown}T</span>` : costMarkup(unit, ability)}</button>`;
    }).join("")}</div>
  </article>`;
}

function battleView() {
  const battle = state.battle;
  if (!battle) return "";
  const result = battle.phase === "victory" || battle.phase === "defeat";
  const node = state.battleNode;
  const visibleResources = resources.filter((resource) => resource.id === "essence" || battle.allies.some((ally) => ally.affinity === resource.id));
  const actionsLeft = Math.max(0, battle.actionLimit - battle.acted.length);
  const defaultTarget = battle.enemies.find((enemy) => enemy.hp > 0);
  const selectedTarget = battle.enemies.find((enemy) => enemy.id === state.targetId && enemy.hp > 0);
  const target = selectedTarget || defaultTarget;
  const flowStep = state.battleFx ? 3 : battle.phase === "player" ? 2 : 3;
  return `
    <section class="battle-header"><button class="back-link" data-action="leave-battle">← VOLTAR À TRILHA</button><div><div class="eyebrow">COMBATE TÁTICO 3v3 · RODADA ${battle.round}</div><h1>${esc(node.label)}</h1><p>${esc(activeElo().realm)} · Elo da ${esc(activeElo().name)} · ${battle.resonance.title}</p><div class="action-economy"><b>${actionsLeft} / ${battle.actionLimit}</b> ações restantes neste turno · habilidades compartilham recursos</div></div><div class="combat-resource" aria-label="Recursos do trio">${visibleResources.map((resource) => `<span class="resource-meter resource-${resource.color}" title="${esc(resource.name)}"><span class="resource-symbol">${resource.icon}</span><span><small>${esc(resource.shortName.toUpperCase())}</small><b>${battle.resources[resource.id]}<i> / 5</i></b></span><span class="resource-track"><i style="width:${Math.min(100, battle.resources[resource.id] * 20)}%"></i></span></span>`).join("")}</div></section>
    <section class="combat-flow-panel" aria-label="Fluxo do combate">
      <div class="combat-flow-steps"><div class="combat-flow-step ${flowStep === 1 ? "current" : "done"}"><i>1</i><span><b>Marque um alvo</b><small>${target ? `Alvo: ${esc(target.name)}${selectedTarget ? " · marcado" : " · automático"}` : "Sem adversários em pé"}</small></span></div><div class="combat-flow-step ${flowStep === 2 ? "current" : flowStep > 2 ? "done" : ""}"><i>2</i><span><b>Use até ${battle.actionLimit} ações</b><small>${actionsLeft} disponíveis · uma por aliado</small></span></div><div class="combat-flow-step ${flowStep === 3 ? "current" : ""}"><i>3</i><span><b>Resolva o turno</b><small>${battle.phase === "player" ? "Passe para executar as intenções inimigas" : battle.phase === "enemy" ? "Intenções inimigas em execução" : result ? "Confronto encerrado" : "Novo turno"}</small></span></div></div>
      <div class="combat-target-control">${selectedTarget ? `<button data-clear-target>ALVO AUTOMÁTICO</button>` : `<span>Alvo automático · clique em um inimigo para redirecionar</span>`}</div>
    </section>
    ${state.battleFx ? `<section class="battle-action-banner effect-${state.battleFx.kind}" role="status" aria-live="polite"><span class="action-banner-icon">${state.battleFx.kind === "impact" ? "✹" : state.battleFx.kind === "restore" ? "✚" : state.battleFx.kind === "shield" ? "⬡" : state.battleFx.kind === "control" ? "✧" : state.battleFx.mode === "turn" ? "↻" : "✦"}</span><div><small>${state.battleFx.mode === "turn" ? "RESOLUÇÃO DA RODADA" : `TÉCNICA EXECUTADA · ${esc(state.battleFx.actorName || "ALIADO")}`}</small><b>${esc(state.battleFx.title)}</b><span>${esc(state.battleFx.summary)}</span></div></section>` : ""}
    <div class="battle-layout">
      <section class="battle-side ally-side"><div class="battle-side-heading"><span>SEU TRIO</span><small>${battle.allies.filter((unit) => unit.hp > 0).length} EM PÉ</small></div><div class="combat-grid">${battle.allies.map((unit, index) => unitCard(unit, "ally", index)).join("")}</div></section>
      <div class="battle-center"><span class="vs-mark">VS</span><div class="resonance-mini"><b>${battle.resonance.tier === "chaotic" ? "⟲" : "✧"}</b><small>${esc(battle.resonance.detail)}</small></div></div>
      <section class="battle-side enemy-side"><div class="battle-side-heading"><span>OPOSIÇÃO</span><small>${battle.enemies.filter((unit) => unit.hp > 0).length} RESTANTES</small></div><div class="combat-grid">${battle.enemies.map((unit, index) => unitCard(unit, "enemy", index)).join("")}</div></section>
    </div>
    <section class="technique-tray"><header class="technique-tray-heading"><div><div class="eyebrow">TÉCNICAS DO TRIO</div><b>Escolha as ações desta rodada</b><small>Selecione a técnica no cartão do aliado · uma ação por personagem</small></div><div class="tray-controls"><span class="action-economy"><b>${actionsLeft} / ${battle.actionLimit}</b> ações restantes</span><button class="pass-turn" data-action="pass-turn" ${battle.phase !== "player" || result || Boolean(state.battleFx) ? "disabled" : ""}>PASSAR TURNO <span>↗</span></button></div></header><div class="technique-grid">${battle.allies.map((unit, index) => techniqueCard(unit, index)).join("")}</div></section>
    <section class="battle-log"><div><div class="eyebrow">REGISTRO DO COMBATE</div><b>${battle.phase === "player" ? `Sua vez — ${actionsLeft} ação(ões) disponíveis.` : battle.phase === "enemy" ? "O trio adversário está agindo." : battle.phase === "victory" ? "Vitória na trilha." : "As correntes cederam."}</b><small class="intent-summary">${battle.phase === "player" ? "Leia as intenções e escolha quem interromper, proteger ou finalizar." : ""}</small></div><ol>${battle.log.map((line) => `<li>${esc(line)}</li>`).join("")}</ol></section>
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
  const target = event.target.closest("[data-tab], [data-realm], [data-start-run], [data-node], [data-crew-realm], [data-add-member], [data-remove-member], [data-search], [data-use-skill], [data-action], [data-event-choice], [data-choose-buff], [data-shop-action], [data-shop-buff], [data-abandon-run], [data-clear-notice], [data-final-battle], [data-target], [data-clear-target]");
  if (!target) return;
  if (target.dataset.tab) {
    state.tab = target.dataset.tab;
    render();
    return;
  }
  if (target.dataset.realm) {
    state.realmId = target.dataset.realm;
    state.eloId = realms.find((realm) => realm.id === state.realmId).elos[0].id;
    render();
    return;
  }
  if (target.dataset.startRun) { startRun(target.dataset.startRun); return; }
  if (target.dataset.node) {
    if (!profile.run || state.pending) return;
    const legacy = target.dataset.node.match(/^(\d+):(\d+)$/);
    const node = legacy
      ? profile.run.map[Number(legacy[1])]?.[Number(legacy[2])]
      : profile.run.map.flat().find((candidate) => candidate.id === target.dataset.node);
    if (node && profile.run.availableNodeIds.includes(node.id)) resolveNode(node);
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
  if (target.dataset.target) {
    if (state.battleFx) return;
    state.targetId = target.dataset.target;
    render();
    return;
  }
  if (target.dataset.clearTarget !== undefined) { state.targetId = null; render(); return; }
  if (target.dataset.action === "pass-turn") {
    if (state.battleFx || !state.battle) return;
    const before = battleSnapshot(state.battle);
    const roundBefore = state.battle.round;
    if (!passTurn(state.battle)) return;
    state.targetId = null;
    presentBattleEffect(before, { roundBefore, mode: "turn" });
    return;
  }
  if (target.dataset.action === "return-battle") { returnFromBattle(); return; }
  if (target.dataset.action === "leave-battle") { state.tab = "rota"; render(); return; }
  if (target.dataset.eventChoice) { chooseEvent(target.dataset.eventChoice); return; }
  if (target.dataset.chooseBuff) { chooseBuff(target.dataset.chooseBuff); return; }
  if (target.dataset.shopAction) { chooseShop(target.dataset.shopAction); return; }
  if (target.dataset.shopBuff) { chooseShop("buff", target.dataset.shopBuff); return; }
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
    startEncounter({ id: "finale", type: "finale", label: "A Última Barreira", eloId: elo.id });
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
