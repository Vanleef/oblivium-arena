import { characters, characterById, elos, realms, generateTrail, buffs, starters, resources, resourceById, realmResource } from "./data.js";
import { getResonance, getEloRoster, getRelevantBuffs } from "./rules.js";
import { canAffordAbility, chooseAction, createBattle, createEnemyTeam, getEloById, commitTurn, resolveNextAction, removeQueuedAction, moveQueuedAction } from "./engine.js";
import { esc, portraitMarkup, costMarkup } from "./view-utils.js";
import { normalizeTrail, advanceTrail } from "./trail.js";
import { renderTrail } from "./trail-view.js";
import { renderBattle } from "./battle-view.js";

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
  normalizeTrail(run);
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
  selectedSkill: null,
  focusSkill: null,
  inspectUnitId: null,
  confirmTurn: false,
  trailFx: null,
  trailBusy: false,
  battleNode: null,
  pending: null,
  toast: "",
  toastTimer: null
};
let battleFxTimer = null;
let battleFxSequence = 0;
let trailFxTimer = null;

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ ...profile, version: 1 }));
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
  if (profile.run?.eloId === eloId) { state.tab = "rota"; render(); return; }
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
    availableNodeIds: map[0].map((node) => node.id), revealedNodeIds: map[0].map((node) => node.id), clearedNodeIds: [], currentNodeId: null
  };
  state.eloId = eloId;
  state.pending = null;
  state.trailFx = null;
  state.battle = null;
  state.tab = "rota";
  save();
  render();
}

function setTrailFeedback(kind,title,summary,extra={}) {
  clearTimeout(trailFxTimer); state.trailFx={kind,title,summary,...extra}; render();
  trailFxTimer=setTimeout(()=>{state.trailFx=null;render();},3200);
}
function selectTrailNode(node) {
  if(state.trailBusy||!profile.run||state.pending)return;
  if(state.battle&&state.battleNode?.id===node.id){state.tab="battle";render();return;}
  state.trailBusy=true;profile.run.currentNodeId=node.id;
  setTrailFeedback("travel",node.label,"O trio segue pelo caminho escolhido…",{selectedId:node.id});
  setTimeout(()=>{state.trailBusy=false;if(profile.run?.availableNodeIds.includes(node.id))resolveNode(node);},480);
}
function continueRun(resultText) {
  if(!profile.run)return;const run=profile.run,progress=advanceTrail(run,run.currentNodeId);if(!progress.ok)return;
  run.encounter++;run.tried=0;state.pending=null;state.tab="rota";
  if(run.stage>=run.map.length)completeRun();save();
  if(profile.run)setTrailFeedback("reveal",`${progress.current.label} concluído`,`${resultText||state.toast||"Encontro resolvido."} ${progress.newIds.length} nova(s) escolha(s) revelada(s).`,{newIds:progress.newIds,completedId:progress.current.id});else render();
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
  clearTimeout(trailFxTimer);
  state.trailFx = null;
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
      { id: "fenda", name: "Fenda do Véu", kind: "strike", costs: { affinity: 1 }, damage: 25, damageType: "piercing", mark: "fim", target: "enemy", description: "Causa 25 de dano perfurante e marca o alvo por 3 turnos." },
      { id: "decreto", name: "Decreto do Fim", kind: "control", costs: { affinity: 1, essence: 1 }, damage: 25, combo: { condition: "mark:fim", bonusDamage: 15, stun: 1 }, cooldown: 2, target: "enemy", description: "Causa 25 de dano; contra a marca do Fim, +15 de dano e Atordoa por 1 turno." },
      { id: "coroa", name: "Coroa que Não Cai", kind: "guard", costs: { essence: 1, affinity: 1 }, shield: 20, target: "team", cooldown: 1, description: "Concede 20 de Defesa ao trio." },
      { id: "despertar", name: "Fim Inalcançável", kind: "defense", costs: { essence: 1 }, invulnerable: 1, defense: true, target: "self", cooldown: 4, description: "Fica Invulnerável por 1 turno. Recarga de 4 turnos." }
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
  state.selectedSkill = null;
  state.focusSkill = null;
  state.inspectUnitId = null;
  state.confirmTurn = false;
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
  continueRun(`Eco ${buffs.find(buff => buff.id === id)?.title || id} incorporado ao trio.`);
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
    continueRun("Vitória: fragmentos recebidos e Vida do trio preservada para o próximo encontro.");
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
    profile.run.currentNodeId = null;
    state.battle = null;
    state.tab = "rota";
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
    setTrailFeedback("failure", "Uma Corrente se rompeu", `Restam ${profile.run.stability} Correntes. O nó permanece disponível para tentar novamente.`);
  }
}

function battleSnapshot(battle) {
  return [...battle.allies,...battle.enemies].map(u=>({id:u.id,name:u.name,hp:u.hp,shield:u.shield,invulnerable:u.invulnerable,stunned:u.stunned,weakened:u.weakened,exposed:u.exposed,charge:u.charge,counter:u.counter,dots:u.dots.map(d=>`${d.tag}:${d.turns}`),marks:Object.keys(u.marks)}));
}
function battleChanges(before,battle) {
  const old=new Map(before.map(u=>[u.id,u]));
  return [...battle.allies,...battle.enemies].map(u=>{const p=old.get(u.id),statuses=[["invulnerable","INVULNERÁVEL"],["stunned","ATORDOADO"],["weakened","ENFRAQUECIDO"],["exposed","EXPOSTO"],["counter","CONTRA-ATAQUE"],["charge","CARGA"]].filter(([key])=>u[key]>p[key]).map(([,label])=>label);if(u.dots.some(d=>!p.dots.includes(`${d.tag}:${d.turns}`)))statuses.push("AFLIÇÃO");if(Object.keys(u.marks).some(key=>!p.marks.includes(key)))statuses.push("MARCADO");const c={id:u.id,name:u.name,hp:u.hp-p.hp,shield:u.shield-p.shield,statuses};return c.hp||c.shield||statuses.length?c:null;}).filter(Boolean);
}
function presentBattleEffect(before,event) {
  const changes=battleChanges(before,state.battle);
  const summary=changes.flatMap(c=>[c.hp<0?`${c.name}: −${Math.abs(c.hp)} Vida`:c.hp>0?`${c.name}: +${c.hp} Vida`:"",c.shield>0?`${c.name}: +${c.shield} Defesa`:"",c.statuses.length?`${c.name}: ${c.statuses.join(", ")}`:""]).filter(Boolean).slice(0,3).join(" · ");
  const kind=event.mode==="turn"?"turn":changes.some(c=>c.hp<0)?"impact":changes.some(c=>c.hp>0)?"restore":changes.some(c=>c.shield>0)?"shield":"control";
  state.battleFx={...event,id:++battleFxSequence,changes,kind,summary:summary||event.summary||"Habilidade resolvida. Confira as condições e o registro."};render();
}
function resolveCombatStep() {
  const battle=state.battle;if(!battle)return;const before=battleSnapshot(battle),result=resolveNextAction(battle);
  if(!result.event){state.battleFx=null;render();return;}presentBattleEffect(before,result.event);
  battleFxTimer=setTimeout(()=>{if(state.battle!==battle)return;state.battleFx=null;if(result.done)render();else resolveCombatStep();},result.event.mode==="turn"?750:1250);
}
function executePlannedTurn() {
  if(!state.battle||!commitTurn(state.battle).ok)return;state.confirmTurn=false;state.selectedSkill=null;state.focusSkill=null;resolveCombatStep();
}
function updateBattle(actorId,abilityId) {
  const b=state.battle;if(!b||b.phase!=="player"||state.battleFx)return;const actor=b.allies.find(u=>u.id===actorId),ability=actor?.abilities.find(a=>a.id===abilityId);
  if(!actor||!ability||actor.hp<=0||actor.stunned||actor.cooldowns[abilityId]||!canAffordAbility(b,actor,ability))return;
  state.selectedSkill={actorId,abilityId};state.focusSkill={actorId,abilityId};state.inspectUnitId=null;render();
}
function selectBattleTarget(targetId) {
  if(!state.battle||state.battle.phase!=="player")return;
  if(!state.selectedSkill){state.inspectUnitId=targetId;state.focusSkill=null;render();return;}
  const {actorId,abilityId}=state.selectedSkill,result=chooseAction(state.battle,actorId,abilityId,targetId);
  if(!result.ok){toast(result.reason);return;}state.selectedSkill=null;render();
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

function runMap() { return renderTrail(profile.run, activeElo(), state.trailFx, buffs); }

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
    return realm && query;
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
        <div class="codex-moves">${character.abilities.map((ability, index) => `<details class="codex-skill"><summary>${ability.art ? `<img src="${esc(ability.art)}" alt="" loading="lazy">` : `<i class="move-fallback color-${esc(character.color)}">${index + 1}</i>`}<b>${esc(ability.name)}</b>${costMarkup(character,ability)}</summary><p>${esc(ability.description)}</p><small>${esc(ability.classes.join(" · "))} · Recarga ${ability.cooldown}T</small></details>`).join("")}</div>
      </article>`;
    }).join("")}</div>`;
}

function battleView() { return renderBattle(state, activeElo()); }

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
  const target = event.target.closest("[data-tab], [data-realm], [data-start-run], [data-node], [data-crew-realm], [data-add-member], [data-remove-member], [data-search], [data-use-skill], [data-action], [data-event-choice], [data-choose-buff], [data-shop-action], [data-shop-buff], [data-abandon-run], [data-clear-notice], [data-final-battle], [data-target], [data-remove-action], [data-move-action], [data-inspect-skill]");
  if (!target) return;
  if (state.tab === "battle" && (state.battle?.phase === "resolving" || state.battleFx)) return;
  if (state.trailBusy) return;
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
    if (node && profile.run.availableNodeIds.includes(node.id)) selectTrailNode(node);
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
  if (target.dataset.target) { if (!state.battleFx) selectBattleTarget(target.dataset.target); return; }
  if (target.dataset.removeAction) { removeQueuedAction(state.battle,target.dataset.removeAction); render(); return; }
  if (target.dataset.moveAction) { const [id,direction]=target.dataset.moveAction.split(":"); moveQueuedAction(state.battle,id,Number(direction)); render(); return; }
  if (target.dataset.inspectSkill) { const [actorId,abilityId]=target.dataset.inspectSkill.split(":"); state.focusSkill={actorId,abilityId}; state.selectedSkill=null; render(); return; }
  if (target.dataset.action === "review-turn" || target.dataset.action === "pass-turn") { state.confirmTurn=true; state.selectedSkill=null; render(); return; }
  if (target.dataset.action === "cancel-review") { state.confirmTurn=false; render(); return; }
  if (target.dataset.action === "cancel-skill") { state.selectedSkill=null; render(); return; }
  if (target.dataset.action === "commit-turn") { executePlannedTurn(); return; }
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
    if (!state.battleFx) selectBattleTarget(event.target.dataset.target);
  }
});

render();
