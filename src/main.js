import { uiIcon, realmEmblem, abilityIcon } from "./ui-icons.js";
import { renderAugmentCard, effectGlyph, augmentGlyph } from "./augment-cards.js";
import { arenaRequest } from "./online-client.js";
import { renderArena } from "./arena-view.js";
import { beginInfluences, chooseInfluence, persistentCombatHp } from "./world-influences.js";
import { renderInfluences, renderWorldHistory } from "./influence-view.js";
import { playerLevel } from "./player-level.js";
import { characters, characterById, elos, realms, generateTrail, buffs, starters, resources, resourceById, realmResource } from "./data.js";
import { getResonance, getEloRoster, getRelevantBuffs } from "./rules.js";
import { canAffordAbility, chooseAction, createBattle, createEnemyTeam, getEloById, getTurnPayment, commitTurn, resolveNextAction, removeQueuedAction, moveQueuedAction } from "./engine.js";
import { esc, portraitMarkup, costMarkup } from "./view-utils.js";
import { normalizeTrail, advanceTrail } from "./trail.js";
import { renderTrail } from "./trail-view.js";
import { highlightTrailChoice } from "./trail-motion.js";
import { renderBattleMotion } from "./battle-motion.js";
import { renderBattle, renderBattleDetail, skillAvailability } from "./battle-view.js";
import { eloCrest, eloSigil } from "./crests.js";
import { veilScene } from "./atmosphere.js";
import { normalizeCampaign, createExpedition, completeExpedition, claimGlobalUpgrade, aggregateGlobal, runMaxHp, recordEncounter, seededRandom, shuffled, maxDifficulty } from "./progression.js";
import { renderCampaign, renderCompletion, renderLegacies } from "./campaign-view.js";
import { FINAL_BOSS, createFinalBoss } from "./final-boss.js";
import { previewBodyForm } from "./body-forms.js";
import { accountRequest, campaignRequest, currentAccount } from "./account-client.js";
import { audioEnabled, playSfx, setAudioEnabled, startAmbience } from "./audio.js";
import { tutorialView } from "./tutorial.js";
import { storyMarkup } from "./story-content.js";

const app = document.querySelector("#app");
const SAVE_KEY = "pma-post-mortem-arena-v1";
const LEGACY_SAVE_KEYS = ["animavelle-arena-v1", "numether-arena-v1", "aevum-arena-v1", "numenveil-arena-v1", "oathrift-arena-v1", "trivel-arena-v1", "eidoveyl-arena-v1", "selyvar-arena-v1", "three-realms-soul-arena-v1", "post-mortem-arena-v1"];
const starterTeam = ["o-escudo-vivo", "a-brasa-eterna", "o-passo-interrompido"];
const defaults = {
  ownedIds: starters.map((character) => character.id),
  team: starterTeam,
  completedElos: [],
  xp: 0,
  fragments: 0,
  run: null,
  unlockedAvatars: ["soul", ...starters.map(character => character.id)],
  avatarId: "soul",
  bio: "",
  tutorialComplete: false
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

const profile = normalizeCampaign(readProfile());
function ensureRunMap() {
  if (!profile.run) return;
  const run = profile.run;
  run.difficulty ||= 0; run.variantId ||= "hunt"; run.variantTitle ||= "Caçada"; run.team ||= [...profile.team];
  run.bossIds ||= shuffled(getEloRoster(run.eloId),seededRandom(run.seed)).slice(0,3).map(c=>c.id);
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
  formPreviews: {},
  crewSearch: "",
  targetId: null,
  battle: null,
  battleFx: null,
  selectedSkill: null,
  focusSkill: null,
  inspectUnitId: null,
  confirmTurn: false,
  randomPayment:null,
  trailFx: null,
  trailBusy: false,
  battleNode: null,
  pending: profile.run?.pending || null,
  difficulty: null,
  toast: "",
  toastTimer: null,
  accountReady: typeof window === "undefined",
  account: null,
  accountError: "",
  campaignBusy: false,
  authMode: "login",
  profileError: "",
  publicView: "login",
  publicTutorialStep: 0,
  tutorialOpen: false,
  tutorialStep: 0,
  audioOn: audioEnabled()
};
let battleFxTimer = null;
let battleFxSequence = 0;
let trailFxTimer = null;

function save() {
  if(profile.run) profile.run.pending = ["event","reward","upgrade","shop"].includes(state.pending?.type) ? state.pending : null;
  profile.unlockedAvatars = [...new Set(["soul", ...(profile.ownedIds||[])])];
  localStorage.setItem(SAVE_KEY, JSON.stringify({ ...profile, version: 1 }));
  if(state.account) {
    clearTimeout(accountSaveTimer);
    accountSaveTimer=setTimeout(()=>accountRequest({op:"save",profile:{...profile,version:1}}).catch(error=>{state.profileError=error.message;render();}),350);
  }
}

let accountSaveTimer=null,searchRenderTimer=null;

function accountAvatar(id,size="avatar-small") {
  const c=characterById[id];return c?.art?.portrait?`<img class="${size}" src="${esc(c.art.portrait)}" alt="">`:`<span class="${size} avatar-soul" aria-hidden="true">☽</span>`;
}
function publicHeader(active="login"){return `<header class="auth-topbar"><button class="auth-brand" data-public-view="login" aria-label="Início PMA"><img src="/art/interface/moth-violet-20261023/brand-moth-192.webp" alt=""><span><b>POST MORTEM</b><small>ARENA</small></span></button><nav aria-label="Conteúdo público"><button data-public-view="tutorial" class="${active==="tutorial"?"active":""}">Tutorial</button><button data-public-view="codex" class="${active==="codex"?"active":""}">Codex</button><button data-public-view="login" class="auth-nav-cta">Entrar</button></nav></header>`;}
function authFrame(content,active){return `<div class="auth-screen">${publicHeader(active)}<main class="public-page">${content}</main></div>`;}
function authView(){return `<div class="auth-screen">${publicHeader("login")}<main class="auth-layout"><section class="auth-intro"><div class="auth-moth-halo"><img class="auth-moth" src="/art/interface/moth-violet-20261023/brand-moth-384.webp" alt="Mariposa violeta de Post Mortem Arena"></div><div class="eyebrow"><span></span> TRÊS MUNDOS · UMA FRONTEIRA</div><h1>Escolha o que<br><em>atravessa o véu.</em></h1><p>Monte seu trio, descubra as formas e enfrente as almas que guardam cada Elo.</p><div class="auth-worlds"><span><i class="world-dot dot-inferno"></i>Inferno</span><span><i class="world-dot dot-paraiso"></i>Paraíso</span><span><i class="world-dot dot-limbo"></i>Limbo</span></div></section><section class="auth-card" aria-labelledby="auth-title"><div class="auth-card-heading"><span class="eyebrow">${state.authMode==="register"?"NOVA ALMA":"SUA CONTA"}</span><h2 id="auth-title">${state.authMode==="register"?"Criar conta":"Entrar"}</h2><p>${state.authMode==="register"?"Seu progresso fica salvo na conta.":"Continue de onde sua jornada parou."}</p></div><div class="auth-switch" role="group" aria-label="Acessar conta"><button type="button" data-auth-mode="login" aria-pressed="${state.authMode==="login"}" class="${state.authMode==="login"?"active":""}">Entrar</button><button type="button" data-auth-mode="register" aria-pressed="${state.authMode==="register"}" class="${state.authMode==="register"?"active":""}">Criar conta</button></div><form data-auth-form>${state.authMode==="register"?`<label>Nick único<input name="handle" autocomplete="username" minlength="3" maxlength="20" pattern="[\\p{L}\\p{N}_]{3,20}" required placeholder="Seu nome na Arena"><small>3–20 caracteres · letras, números e _</small></label>`:""}<label>E-mail<input name="email" type="email" autocomplete="email" maxlength="254" required placeholder="voce@exemplo.com"></label><label>Senha<input name="password" type="password" autocomplete="${state.authMode==="register"?"new-password":"current-password"}" minlength="10" maxlength="256" required placeholder="${state.authMode==="register"?"Mínimo 10 caracteres":"Sua senha"}"></label><button class="button button-gold full-button" type="submit">${state.authMode==="register"?"CRIAR CONTA":"ENTRAR NA ARENA"}<span aria-hidden="true">↗</span></button></form><p class="auth-message" role="status">${esc(state.accountError||(!state.accountReady?"Conectando…":""))}</p><div class="auth-footnote">Campanha, roguelike e Arena exigem login.</div></section></main></div>`;}
function profileView(){const unlocked=["soul",...profile.ownedIds],chosen=profile.avatarId||"soul";return `<section class="profile-page"><header class="profile-heading">${accountAvatar(chosen,"avatar-large")}<div><div class="eyebrow">IDENTIDADE DA ALMA</div><h1>Seu perfil</h1><p>Retrato e nick aparecem nas partidas.</p></div><button class="button button-outline" data-action="logout">SAIR</button></header><div class="profile-layout"><form data-profile-form class="profile-form"><label>Nick único<input name="handle" minlength="3" maxlength="20" required value="${esc(state.account?.handle||"")}"></label><label>Sobre você <small>até 160 caracteres</small><textarea name="bio" maxlength="160">${esc(profile.bio||"")}</textarea></label><fieldset><legend>Retrato de perfil</legend><div class="avatar-grid">${unlocked.map(id=>`<button type="button" data-avatar="${esc(id)}" aria-label="Escolher retrato ${esc(characterById[id]?.name||"Alma")}" aria-pressed="${id===chosen}">${accountAvatar(id,"avatar-choice")}<small>${esc(characterById[id]?.name||"Alma desperta")}</small></button>`).join("")}</div></fieldset><button class="button button-gold" type="submit">SALVAR PERFIL</button><p class="profile-message" role="status">${esc(state.profileError)}</p></form><aside class="profile-side"><h2>Progresso guardado</h2><p>${profile.completedElos.length} / ${elos.length} Elos concluídos</p><p>${profile.ownedIds.length} retratos disponíveis · ${profile.xp} XP</p><button class="button button-outline" data-action="open-tutorial">ABRIR TUTORIAL</button><button class="button button-outline" data-action="audio-toggle">${state.audioOn?"DESLIGAR SOM":"LIGAR SOM"}</button><small>Trilha ambiente e efeitos sonoros sintetizados.</small></aside></div></section>`;}

function hydrateAccount(data){state.account=data.user||null;if(data.profile){Object.assign(profile,normalizeCampaign({...defaults,...data.profile,unlockedAvatars:data.profile.unlockedAvatars||["soul",...(data.profile.ownedIds||[])]}));ensureRunMap();state.pending=profile.run?.pending||null;state.battle=data.battle||profile.run?.battle||null;state.battleNode=profile.run?.currentNodeId?profile.run.map.flat().find(node=>node.id===profile.run.currentNodeId)||null:null;}state.accountReady=true;state.accountError="";state.tutorialOpen=Boolean(state.account&&!profile.tutorialComplete);state.tab=state.account?"rota":state.tab;render();}
function syncCampaign(data){state.account=data.user||state.account;if(data.profile)Object.assign(profile,normalizeCampaign({...defaults,...data.profile,unlockedAvatars:data.profile.unlockedAvatars||["soul",...(data.profile.ownedIds||[])]}));ensureRunMap();state.pending=data.pending||profile.run?.pending||null;state.battle=Object.hasOwn(data,"battle")?data.battle:profile.run?.battle||null;state.battleNode=profile.run?.currentNodeId?profile.run.map.flat().find(node=>node.id===profile.run.currentNodeId)||null:null;}
function checkAccount(){if(typeof window==="undefined")return;currentAccount().then(async data=>{if(data.user&&data.profile?.run?.serverOwned!==true){data=await campaignRequest({op:"sync"});}hydrateAccount(data);}).catch(error=>{state.accountReady=true;state.accountError=error.message;render();});}

function playCampaignEvents(events,finalBattle,index=0){
  if(index>=events.length){state.battle=finalBattle;state.battleFx=null;render();return;}
  const event=events[index],before=battleSnapshot(state.battle||finalBattle);state.battle=finalBattle;
  presentBattleEffect(before,event);
  battleFxTimer=setTimeout(()=>{if(state.account){state.battleFx=null;playCampaignEvents(events,finalBattle,index+1);}},event?.mode==="turn"?750:1250);
}
async function requestCampaign(payload,{animate=false}={}){
  if(state.campaignBusy)return null;
  state.campaignBusy=true;const previous=state.battle;
  try{
    const data=await campaignRequest(payload);syncCampaign(data);state.campaignBusy=false;
    if(animate&&previous&&data.events?.length){state.battle=previous;playCampaignEvents(data.events,data.battle||null);}
    else render();
    return data;
  }catch(error){state.campaignBusy=false;toast(error.message);render();return null;}
}


function teamResourceLegend(teamIds) {
  const affinities = new Set(teamIds.flatMap(id=>{const c=characterById[id];return [c?.affinity,...(c?.bodyForms||[]).map(f=>f.resource)];}).filter(Boolean));
  const active = resources.filter((resource) => resource.id === "essence" || affinities.has(resource.id));
  return `<div class="team-resource-legend"><small>RECURSOS DA FORMAÇÃO</small><div>${active.map((resource) => `<span class="resource-${resource.color}"><i>${uiIcon(resource.id)}</i>${esc(resource.shortName)}</span>`).join("")}</div></div>`;
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

async function startRun(eloId,variantId="hunt",difficulty) {
  if (profile.run) {
    if(profile.run.eloId===eloId){state.tab="rota";render();focusTrail();}
    else toast("Conclua ou abandone a trilha atual.");
    return;
  }
  if(profile.team.length!==3){state.tab="trio";toast("Escolha três almas.");return;}
  const elo=elos.find(e=>e.id===eloId);if(!elo)return;
  if(state.account){
    const result=await requestCampaign({op:"start",eloId,variantId,difficulty:difficulty??maxDifficulty(profile,eloId)});
    if(!result)return;
  }else{
    try { profile.run=createExpedition(profile,elo,variantId,difficulty??maxDifficulty(profile,eloId)); }
    catch(error){toast(error.message);return;}
  }
  state.realmId=realms.find(r=>r.elos.some(e=>e.id===eloId)).id;
  state.eloId=eloId;state.pending=null;state.trailFx=null;state.battle=null;state.tab="rota";
  if(!state.account){profile.completionNotice=null;save();}render();focusTrail();
}

function focusTrail() {
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => app.querySelector(".run-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }));
}

function setTrailFeedback(kind,title,summary,extra={}) {
  clearTimeout(trailFxTimer); state.trailFx={kind,title,summary,...extra}; render();
  trailFxTimer=setTimeout(()=>{state.trailFx=null;render();},3200);
}
function selectTrailNode(node) {
  if(state.trailBusy||!profile.run||state.pending)return;
  if(state.battle&&state.battleNode?.id===node.id){state.tab="battle";render();return;}
  state.trailBusy=true;profile.run.currentNodeId=node.id;
  setTrailFeedback("travel",node.label,"Em travessia…",{selectedId:node.id});
  setTimeout(()=>{state.trailBusy=false;if(profile.run?.availableNodeIds.includes(node.id))resolveNode(node);},480);
}
function continueRun(resultText) {
  if(!profile.run)return;const run=profile.run,progress=advanceTrail(run,run.currentNodeId);if(!progress.ok)return;
  run.encounter++;run.tried=0;state.pending=null;state.tab="rota";
  if(run.stage>=run.map.length)completeRun();save();
  if(profile.run){setTrailFeedback("reveal",`Encontro concluído · ${progress.current.label}`,`${progress.newIds.length} ${progress.newIds.length===1?"novo caminho":"novos caminhos"}.`,{newIds:progress.newIds,completedId:progress.current.id});focusTrail();}else render();
}

function completeRun() {
  if(!profile.run)return;
  completeExpedition(profile,profile.run);
  profile.run=null;state.pending=null;state.tab="rota";state.difficulty=null;
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
  const battleTeam=profile.run?.team||profile.team;
  const enemies = createEnemyTeam(elo, battleTeam, encounterType, profile.run?.encounter || 0, {difficulty:profile.run?.difficulty||0,bossIds:profile.run?.bossIds});
  if (specialFinale) {
    // Keep encounter scaling, but no unrelated source character's passive or forms.
    const {maxHp}=enemies[0];
    Object.assign(enemies[0],createFinalBoss(),{maxHp,passive:null,sourceId:FINAL_BOSS.id});
    enemies[1].name = "Arauto do Véu Partido";
    enemies[1].art = null;
    enemies[1].symbol = "◇";
    enemies[2].name = "Sentinela das Barreiras";
    enemies[2].art = null;
    enemies[2].symbol = "⬡";
  }
  state.battleNode = node;
  if (profile.run && nodeType !== "finale") profile.run.currentNodeId = node.id;
  state.battle = createBattle(battleTeam, enemies, { buffs: profile.run?.buffs || [], teamHealth: profile.run?.teamHealth || {},globalEffects:aggregateGlobal(profile),difficulty:profile.run?.difficulty||0 });
  beginInfluences(state.battle,(profile.run?.seed||1)+(profile.run?.encounter||0)*97);
  state.targetId = null;
  state.battleFx = null;
  state.selectedSkill = null;
  state.focusSkill = null;
  state.inspectUnitId = null;
  state.confirmTurn = false;
  state.tab = "battle";
  render();
  if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
}

function resolveNode(node) {
  if (!profile.run) return;
  if(profile.run.serverOwned){requestCampaign({op:"select-node",nodeId:node.id});return;}
  const nodeType = node.type || node.id;
  profile.run.currentNodeId = node.id;
  profile.run.storyBeat=({normal:"O eco anuncia um encontro",elite:"Um guardião de elite rompe o silêncio",mini:"Uma presença antiga se aproxima",boss:"A última barreira deste Elo se ergue",event:"Uma voz pede para ser ouvida",repair:"As correntes são remendadas",shop:"Um mercador oferece um trato",reward:"A vitória deixa um vestígio"})[nodeType]||"A trilha muda sob os pés do trio";
  if (["normal", "elite", "mini", "boss", "finale"].includes(nodeType)) {
    startEncounter(node);
    return;
  }
  if (nodeType === "repair") {
    healRunTeam(0.4+(aggregateGlobal(profile).restBonus||0));
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
  if (nodeType === "shop") state.pending = { type: "shop", choices: getRelevantBuffs(profile.run.team, profile.run.buffs).slice(0, 3) };
  if (nodeType === "upgrade") {
    const choices = getRelevantBuffs(profile.run.team, profile.run.buffs);
    state.pending = { type: "upgrade", choices: choices.sort(() => Math.random() - 0.5).slice(0, 3) };
  }
  save();render();
}

function chooseEvent(choice) {
  if(!profile.run||state.pending?.type!=="event")return;
  if(profile.run.serverOwned){requestCampaign({op:"event",choice});return;}
  profile.eloProgress[profile.run.eloId].events++;
  if (choice === "repair") {
    healRunTeam(0.25+(aggregateGlobal(profile).restBonus||0));
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
  if (!profile.run || profile.run.buffs.includes(id) || !state.pending?.choices?.some(c=>c.id===id)) return;
  if(profile.run.serverOwned){requestCampaign({op:"buff",buffId:id});return;}
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
  for (const id of profile.run.team) {
    const maxHp = runMaxHp(profile,profile.run,id);
    const hp = profile.run.teamHealth[id] ?? maxHp;
    profile.run.teamHealth[id] = Math.min(maxHp, hp + Math.ceil(maxHp * ratio));
  }
}

function chooseShop(action, buffId) {
  if (!profile.run) return;
  if(profile.run.serverOwned){requestCampaign({op:"shop",action,buffId});return;}
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

function rewardEncounterXp(node){return ["boss","mini","elite"].includes(node.type||node.id)?50:25;}
function returnFromBattle() {
  if(state.battle?.online){sendOnline({op:"ack"});state.battle=null;state.tab="arena";render();return;}
  if (!state.battle) return;
  if(profile.run?.serverOwned){
    if(!["victory","defeat"].includes(state.battle.phase))return;
    requestCampaign({op:"settle"}).then(data=>{if(!data)return;state.battle=null;state.tab="rota";state.pending=data.pending||null;render();if(data.reset)toast("As Correntes se romperam. Uma nova trilha pode ser iniciada.");else if(data.completed)toast("O Conselho do Elo foi vencido.");});
    return;
  }
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
      profile.run.teamHealth = Object.fromEntries(state.battle.allies.map((ally) => [ally.id, persistentCombatHp(ally)]));
      const fresh=recordEncounter(profile,profile.run,state.battleNode);
      if(!fresh)return;
      profile.xp+=rewardEncounterXp(state.battleNode);
      const rewardNode = ["elite", "mini"].includes(state.battleNode.type || state.battleNode.id);
      profile.fragments += (rewardNode ? 18 : 6)+(aggregateGlobal(profile).fragments||0);
      if (rewardNode) {
        const choices = getRelevantBuffs(profile.run.team, profile.run.buffs).sort(() => Math.random() - 0.5).slice(0, 3);
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
    continueRun("Vitória.");
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
    profile.run.teamHealth = Object.fromEntries(state.battle.allies.map((ally) => [ally.id, Math.max(35, persistentCombatHp(ally) || Math.round((ally.persistentMaxHp||ally.maxHp) * 0.35))]));
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
  return [...battle.allies,...battle.enemies].map(u=>({id:u.id,name:u.name,bodyForm:u.bodyForm,hp:u.hp,shield:u.shield,invulnerable:u.invulnerable,stunned:u.stunned,weakened:u.weakened,exposed:u.exposed,charge:u.charge,counter:u.counter,sealAttack:u.sealAttack,sealSupport:u.sealSupport,healingBlock:u.healingBlock,reactives:u.reactives.map(r=>r.sourceId+":"+r.skillId),regens:u.regens.map(r=>r.sourceId+":"+r.skillId),forms:u.abilities.map(a=>({id:a.id,key:a.formKey||"base",name:a.name})),dots:u.dots.map(d=>`${d.tag}:${d.turns}`),marks:Object.keys(u.marks)}));
}
function battleChanges(before,battle) {
  const old=new Map(before.map(u=>[u.id,u]));
  return [...battle.allies,...battle.enemies].map(u=>{const p=old.get(u.id),statuses=[["invulnerable","INVULNERÁVEL"],["stunned","ATORDOADO"],["weakened","ENFRAQUECIDO"],["exposed","EXPOSTO"],["counter","CONTRA-ATAQUE"],["charge","CARGA"],["sealAttack","OFENSIVA SELADA"],["sealSupport","APOIO SELADO"],["healingBlock","CURA REDUZIDA"]].filter(([key])=>u[key]>p[key]).map(([,label])=>label);if(u.reactives.some(r=>!p.reactives.includes(r.sourceId+":"+r.skillId)))statuses.push("EFEITO PREPARADO");if(u.regens.some(r=>!p.regens.includes(r.sourceId+":"+r.skillId)))statuses.push("REGENERAÇÃO");if(u.dots.some(d=>!p.dots.includes(`${d.tag}:${d.turns}`)))statuses.push("AFLIÇÃO");if(Object.keys(u.marks).some(key=>!p.marks.includes(key)))statuses.push("MARCADO");const forms=u.abilities.filter(a=>(p.forms.find(f=>f.id===a.id)?.key||"base")!==(a.formKey||"base")).map(a=>a.id);if(u.bodyForm!==p.bodyForm)statuses.push(`FORMA · ${u.bodyFormName}`);else if(forms.length)statuses.push("TÉCNICA ALTERADA");const c={id:u.id,name:u.name,hp:u.hp-p.hp,shield:u.shield-p.shield,statuses,forms};return c.hp||c.shield||statuses.length?c:null;}).filter(Boolean);
}
function presentBattleEffect(before,event) {
  const changes=battleChanges(before,state.battle);
  const summary=changes.flatMap(c=>[c.hp<0?`${c.name}: −${Math.abs(c.hp)} Vida`:c.hp>0?`${c.name}: +${c.hp} Vida`:"",c.shield>0?`${c.name}: +${c.shield} Defesa`:"",c.statuses.length?`${c.name}: ${c.statuses.join(", ")}`:""]).filter(Boolean).slice(0,3).join(" · ");
  const kind=event.mode==="turn"?"turn":changes.some(c=>c.statuses.some(s=>s.startsWith("FORMA ·")))?"form":changes.some(c=>c.hp<0)?"impact":changes.some(c=>c.hp>0)?"restore":changes.some(c=>c.shield>0||c.statuses.includes("INVULNERÁVEL"))?"shield":"control";
  playSfx(event.reactions?.length?"reactive":kind==="form"?"form":kind==="restore"?"heal":kind==="impact"?"impact":"cast");
  state.battleFx={...event,...(event.reactions?.length?{title:event.reactions.some(r=>r.kind==="world")?"Eco ativado":event.reactions.some(r=>r.kind==="reaction")?"Efeito reativo":event.mode==="recovery"?"Regeneração":"Contra-ataque",actorName:[...new Set(event.reactions.map(r=>r.actorName))].join(" · ")}:{}),id:++battleFxSequence,changes,kind,summary:summary||event.summary||"Habilidade resolvida."};render();
}
function resolveCombatStep() {
  const battle=state.battle;if(!battle)return;const before=battleSnapshot(battle),result=resolveNextAction(battle);
  if(!result.event){state.battleFx=null;render();return;}presentBattleEffect(before,result.event);
  battleFxTimer=setTimeout(()=>{if(state.battle!==battle)return;state.battleFx=null;if(result.done)render();else resolveCombatStep();},result.event.mode==="turn"?750:1250);
}
function executePlannedTurn() {
  if(!state.battle)return;const payment=getTurnPayment(state.battle,state.randomPayment);if(!payment.ok){toast(payment.reason);return;}
  if(state.battle.online){state.confirmTurn=false;sendOnline({op:"turn",actions:state.battle.queue,payment:payment.selected});return;}
  if(profile.run?.serverOwned){const actions=state.battle.queue.map(({actorId,abilityId,targetId})=>({actorId,abilityId,targetId}));state.confirmTurn=false;state.selectedSkill=null;state.focusSkill=null;requestCampaign({op:"turn",actions,payment:payment.selected},{animate:true});return;}
  if(!commitTurn(state.battle,payment.selected).ok)return;state.confirmTurn=false;state.selectedSkill=null;state.focusSkill=null;resolveCombatStep();
}
function updateBattle(actorId,abilityId) {
  const b=state.battle;if(!b||b.phase!=="player"||state.battleFx)return;const actor=b.allies.find(u=>u.id===actorId),ability=actor?.abilities.find(a=>a.id===abilityId);
  if(!actor||!ability)return;
  state.focusSkill={actorId,abilityId};state.inspectUnitId=null;
  if(skillAvailability(b,actor,ability)){
    state.selectedSkill=null;render();app.querySelector(`[data-use-skill="${actorId}:${abilityId}"]`)?.focus({preventScroll:true});return;
  }
  state.selectedSkill={actorId,abilityId};render();app.querySelector('.fighter-card.valid-target')?.focus({preventScroll:true});
}
function selectBattleTarget(targetId) {
  if(!state.battle||state.battle.phase!=="player")return;
  if(!state.selectedSkill){state.inspectUnitId=targetId;state.focusSkill=null;render();return;}
  const {actorId,abilityId}=state.selectedSkill,result=chooseAction(state.battle,actorId,abilityId,targetId);
  if(!result.ok){toast(result.reason);return;}state.selectedSkill=null;render();
}

let onlineTimer=null;
async function sendOnline(payload){
 state.online ||= {connected:false,queuing:false};const online=state.online;if(online.busy)return;online.busy=true;
 clearTimeout(onlineTimer);
 try{
  const data=await arenaRequest({...payload,version:online.match?.version});
  const changed=data.match?.id!==online.match?.id||data.match?.version!==online.match?.version;
  Object.assign(online,data,{connected:true,message:data.match?data.match.settled?"Resultado registrado na classificação.":"Partida conectada.":online.queuing?"Buscando uma alma de classificação próxima…":"Arena conectada."});
  if(data.match){online.queuing=false;if(changed){state.battle=data.match.battle;state.battle.deadline=data.match.deadline;state.battleNode={label:"Arena ranqueada"};state.selectedSkill=null;state.focusSkill=null;state.confirmTurn=false;state.tab="battle";}}
  else if(state.battle?.online)state.battle=null;
 }catch(error){online.message=error.message;if(error.status===503){online.connected=false;online.queuing=false;}else if(error.status===409){onlineTimer=setTimeout(()=>sendOnline({op:"profile"}),300);}}
 finally{online.busy=false;render();if(online.connected&&(online.queuing||online.match&&!online.match.settled)){onlineTimer=setTimeout(()=>sendOnline(online.queuing?{op:"queue",team:profile.team}:{op:"profile"}),2000);}}
}
function arenaView(){return renderArena(profile,state.online);}
function header() {
  const tabList = [
    ["rota", "Grande Rota"],
    ["trio", "Formar Trio"],
    ["codex", "Codex"], ["arena", "Arena"], ["profile", "Perfil"]
  ];
  return `
    <header class="topbar">
      <button class="brand" data-tab="rota" aria-label="PMA: Post Mortem Arena, início">
        <img class="brand-mark" src="/art/interface/moth-violet-20261023/brand-moth-192.webp" srcset="/art/interface/moth-violet-20261023/brand-moth-192.webp 192w, /art/interface/moth-violet-20261023/brand-moth-384.webp 384w" sizes="(max-width: 680px) 52px, 64px" width="64" height="64" alt="" decoding="async">
        <span class="brand-name"><b>POST MORTEM</b><small>ARENA</small></span>
      </button>
      <nav class="main-nav" aria-label="Navegação principal">${tabList.map(([id, label]) => `<button class="nav-link ${state.tab === id ? "active" : ""}" data-tab="${id}">${uiIcon(id)}<span>${label}</span></button>`).join("")}</nav>
      <button class="player-chip" data-tab="profile">${accountAvatar(profile.avatarId||"soul","avatar-small")}<span><b>${esc(state.account?.handle||"Alma desperta")}</b><small>Nível ${playerLevel(profile.xp).level} · ${profile.xp} XP</small></span></button>
      <button class="mobile-menu" data-tab="trio" aria-label="Abrir equipe">☰</button>
    </header>`;
}

function statusStrip() {
  const run = profile.run;
  return `
    <section class="status-strip" aria-label="Progresso">
      <div class="status-item"><span class="status-icon">${uiIcon("chains")}</span><span><small>CORRENTES DA ALMA</small><b>${run ? run.stability + " / " + run.maxStability : "FIRMES"}</b></span><span class="chain-pips">${Array.from({length:Math.min(run?.maxStability||3,8)},(_,i)=>i).map((i) => `<i class="${run && i >= run.stability ? "broken" : ""}"></i>`).join("")}</span></div>
      <div class="status-item"><span class="status-icon gold">${uiIcon("fragments")}</span><span><small>FRAGMENTOS</small><b>${profile.fragments}</b></span></div>
      <div class="status-item"><span class="status-icon white">${uiIcon("seal")}</span><span><small>TRILHAS CONCLUÍDAS</small><b>${profile.completedElos.length} / ${elos.length}</b></span></div>
      <div class="status-quote">"As barreiras cedem. O trio escolhe o que atravessa."</div>
    </section>`;
}

function hero() {
  return `
    <section class="hero-panel">
      <div class="hero-copy">
        <div class="eyebrow"><span></span> O VÉU ESTÁ SE ROMPENDO</div>
        <h1>Três reinos.<br><em>Uma fronteira.</em></h1>
        <p>Reúna três almas. Atravesse os Elos. Restaure o véu.</p>

      </div>
      <div class="hero-art" aria-hidden="true">
        ${veilScene()}
        
        <div class="veil-embers"><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="orbit orbit-outer"></div><div class="orbit orbit-inner"></div>
        <div class="realm-mark mark-heaven">✧</div><div class="realm-mark mark-hell">✹</div>
        <div class="realm-mark mark-limbo">⟲</div><div class="hero-core">P</div>
        <div class="hero-label label-heaven">PARAÍSO</div><div class="hero-label label-hell">INFERNO</div><div class="hero-label label-limbo">LIMBO</div>
        <div class="hero-gate-caption"><span>POST MORTEM ARENA</span><b>O outro lado espera.</b></div>
      </div>

    </section>`;
}

function resonanceCard() {
  const resonance = getResonance(profile.team);
  return `<div class="resonance-card resonance-${resonance.tier}">
    <div class="resonance-icon">${uiIcon(resonance.tier === "chaotic"?"chains":"trio")}</div>
    <div><small>SINERGIA DO TRIO</small><b>${resonance.title}</b><p>${resonance.detail}</p></div>
  </div>`;
}

function routeView() {
  const realm=realms.find(r=>r.id===state.realmId)||realms[0],currentRun=profile.run,completedAll=profile.completedElos.length>=elos.length;
  const selection=`<div class="realm-tabs">${realms.map(item=>`<button class="realm-tab ${state.realmId===item.id?"selected":""} realm-${item.id}" data-realm="${item.id}"><span>${realmEmblem(item.id)}</span><b>${item.name}</b><small>${item.elos.length} ${item.elos.length===1?"Elo":"Elos"}</small></button>`).join("")}</div>${renderCampaign(profile,state,realm)}`;
  return `${renderCompletion(profile)}${currentRun?`<section class="active-expedition">${storyMarkup(currentRun)}${state.pending?pendingPanel():""}${runMap()}</section><details class="world-browser"><summary>Explorar os mundos <span>↗</span></summary>${selection}</details>`:`${profile.pendingGlobalReward?"":hero()}<section class="route-section"><div class="section-heading"><div><div class="eyebrow">OS TRÊS MUNDOS</div><h2>A Grande Rota</h2></div><span class="section-count">${profile.completedElos.length}/${elos.length} ELOS VENCIDOS</span></div>${selection}</section>${state.pending?pendingPanel():""}`}
    ${renderLegacies(profile)}
    ${completedAll?`<section class="finale-card"><div class="finale-sigil">${realmEmblem("inferno")}</div><div><div class="eyebrow">A ÚLTIMA BARREIRA</div><h3>O Fim</h3><p>Sem rosto fixo. Cada alma encara o próprio maior medo.</p></div><button class="button button-gold" data-final-battle>ENFRENTAR O FIM ↗</button></section>`:""}`;
}

function runMap() { return renderTrail(profile.run, activeElo(), state.trailFx, buffs, profile.ownedIds,{profile,busy:state.trailBusy,pending:Boolean(state.pending),teamHealth:state.battle?Object.fromEntries(state.battle.allies.map(u=>[u.id,persistentCombatHp(u)])):null}); }

function pendingPanel() {
  const pending = state.pending;
  if (!pending) return "";
  if (pending.type === "event") return `
    <section class="choice-panel"><div class="eyebrow">EVENTO · UMA ALMA À BEIRA DA TRILHA</div><h3>Uma corrente pede cuidado.</h3><p>Um viajante oferece fragmentos para continuar ou ajuda o trio a remendar uma fissura.</p><div class="choice-actions"><button data-event-choice="repair"><b>⟲ Reparar uma corrente</b><small>Recupere 1 de estabilidade e 25% de Vida</small></button><button data-event-choice="echo"><b>◈ Guardar um eco</b><small>Receba 8 fragmentos e ${esc(activeAffinityResource().shortName)} inicial nos próximos combates</small></button></div></section>`;
  if (["upgrade", "reward"].includes(pending.type)) return `
    <section class="choice-panel"><div class="eyebrow">${pending.type === "reward" ? "RECOMPENSA DE ELITE · ESCOLHA UM PODER" : "APRIMORAMENTO · ESCOLHA UM ECO"}</div><h3>${pending.type === "reward" ? "A vitória deixa uma marca no trio." : "O trio se adapta à trilha."}</h3><div class="buff-choices augment-choices">${pending.choices.map((buff,index)=>renderAugmentCard({...buff,tier:pending.type==="reward"?"gold":"silver",glyph:effectGlyph(buff.effect),attribute:"choose-buff",className:"buff-card",cta:"INCORPORAR",duration:"NESTA TRILHA",index})).join("")}</div></section>`;
  if (pending.type === "shop") return `
    <section class="choice-panel"><div class="eyebrow">MERCADOR · ${profile.fragments} FRAGMENTOS</div><h3>Prepare o trio para o próximo andar.</h3><div class="shop-choices"><button class="shop-item" data-shop-action="heal" ${profile.fragments < 12 ? "disabled" : ""}><span>${uiIcon("heart")}</span><b>Remendar o trio</b><small>Recupere 35% da Vida · 12 fragmentos</small></button>${pending.choices.map((buff) => `<button class="shop-item" data-shop-buff="${buff.id}" ${profile.fragments < 22 ? "disabled" : ""}><span>${augmentGlyph(effectGlyph(buff.effect))}</span><b>${esc(buff.title)}</b><small>${esc(buff.text)} · 22 fragmentos</small></button>`).join("")}<button class="shop-item shop-leave" data-shop-action="leave"><span>↗</span><b>Seguir viagem</b><small>Guarde seus fragmentos</small></button></div></section>`;
  if (pending.type === "finale-complete") return `
    <section class="notice-panel"><span class="notice-icon">☼</span><div><div class="eyebrow">O VÉU RESISTIU</div><h3>O Fim foi detido.</h3><p>O equilíbrio ainda exige cuidado, mas os três reinos podem respirar. +500 XP e 80 fragmentos.</p></div><button class="button button-outline" data-clear-notice>CONTINUAR</button></section>`;
  if (pending.type === "finale-defeat") return `
    <section class="notice-panel notice-fracture"><span class="notice-icon">♜</span><div><div class="eyebrow">A BARREIRA AINDA RESISTE</div><h3>O Fim continua avançando.</h3><p>Reúna o trio e tente o confronto final novamente.</p></div><button class="button button-outline" data-final-battle>TENTAR DE NOVO</button></section>`;
  if (pending.type === "reset") return `
    <section class="notice-panel notice-fracture"><span class="notice-icon">⟲</span><div><div class="eyebrow">CORRENTES ROMPIDAS</div><h3>A trilha se recompõe.</h3><p>As Correntes cederam. O trio conserva os fragmentos, mas precisa escolher uma nova travessia.</p></div><button class="button button-outline" data-clear-notice>ENTENDI</button></section>`;
  return "";
}

function teamView() {
  const resonance = getResonance(profile.team);
  const filtered = characters.filter((character) => {
    const owned = profile.ownedIds.includes(character.id);
    const matchesRealm = state.crewRealm === "Todos" || character.realm === state.crewRealm;
    const matchesSearch = !state.crewSearch || (character.name + " " + (character.previousName || "") + " " + character.aliases.join(" ") + " " + character.elo + " " + character.realm).toLowerCase().includes(state.crewSearch.toLowerCase());
    return matchesRealm && matchesSearch && (owned || state.crewRealm === "Todos");
  });
  return `
    <section class="page-heading"><div><div class="eyebrow">ALIANÇA 3v3</div><h1>Formar Trio</h1><p>${profile.run?"Mudanças na formação valem para a próxima trilha.":"Escolha três almas e combine suas forças."}</p></div><div class="roster-total"><b>${profile.ownedIds.length}</b><span>/ 100<br>RECRUTADAS</span></div></section>
    <div class="team-layout">
      <section class="team-builder">
        <div class="team-builder-heading"><div><div class="eyebrow">SUA FORMAÇÃO</div><h2>Trio de combate</h2></div><span>${profile.team.length} / 3</span></div>
        <div class="active-team">${[0, 1, 2].map((index) => {
          const member = characterById[profile.team[index]];
          return member ? `<article class="team-slot slot-${member.color}"><span class="slot-index">0${index + 1}</span>${portraitMarkup(member, "slot-avatar")}<div><small>${esc(member.realm)} · ${esc(member.elo)}</small><b>${esc(member.name)}</b></div><button data-remove-member="${member.id}" aria-label="Remover ${esc(member.name)}">×</button></article>` : `<article class="team-slot empty-slot"><span class="slot-index">0${index + 1}</span><span class="empty-plus">+</span><div><b>Escolha uma alma</b><small>Selecione abaixo</small></div></article>`;
        }).join("")}</div>
        ${resonanceCard()}
        ${teamResourceLegend(profile.team)}
        <div class="team-note"><b>Correntes Quebradas</b><span>Uma alma do Limbo pode criar uma Ressonância Caótica com qualquer Elo.</span></div>
        <button class="button button-gold full-button" data-tab="rota">IR PARA A GRANDE ROTA <span>↗</span></button>
      </section>
      <section class="roster-browser">
        <div class="roster-header"><div><div class="eyebrow">ALMAS CONHECIDAS</div><h2>Codex de Elos</h2></div><span class="owned-count">${profile.ownedIds.length} disponíveis</span></div>
        <label class="search-box"><span>${uiIcon("search")}</span><input type="search" data-search value="${esc(state.crewSearch)}" placeholder="Buscar nome, reino ou Elo"></label>
        <div class="filter-row">${["Todos", "Inferno", "Paraíso", "Limbo"].map((realm) => `<button class="${state.crewRealm === realm ? "active" : ""}" data-crew-realm="${realm}">${realm}</button>`).join("")}</div>
        <div class="roster-grid">${filtered.map((character) => {
          const owned = profile.ownedIds.includes(character.id);
          const selected = profile.team.includes(character.id);
          const disabled = !owned || (!selected && profile.team.length >= 3);
          return `<button class="roster-card ${selected ? "chosen" : ""} ${!owned ? "unowned" : ""}" data-add-member="${character.id}" ${disabled ? "disabled" : ""}>
            ${portraitMarkup(character, "roster-card-symbol")}<span class="roster-card-copy"><b>${esc(character.name)}</b><small>${esc(character.elo)}</small></span><span class="roster-card-state">${selected ? "✓" : owned ? "+" : "·"}</span>
          </button>`;
        }).join("")}</div>
      </section>
    </div>`;
}

function bodyFormSelector(c){
 if(!c.bodyForms?.length)return '';
 const choices=[{key:'base',name:c.baseFormName||'Forma original',resource:c.affinity,portrait:c.bodyForms&& (c.id===FINAL_BOSS.id?FINAL_BOSS.portrait:characterById[c.id]?.art?.portrait)},...c.bodyForms];
 return `<section class="body-form-picker" aria-label="Formas de ${esc(c.name)}"><div class="eyebrow">FORMAS · ${esc(c.bodyFormName)}</div><div class="body-form-options">${choices.map(f=>`<button data-preview-form="${esc(c.id)}:${esc(f.key)}" aria-label="Ver ${esc(c.name)}: ${esc(f.name)}" aria-pressed="${c.bodyForm===f.key}"><img src="${esc(f.portrait)}" width="44" height="44" alt="" loading="lazy"><span>${esc(f.name)}<small class="body-resource"><i class="cost-pip pip-${esc(f.resource)}" aria-hidden="true"></i>${esc(resourceById[f.resource]?.name)}</small></span></button>`).join('')}</div><small>Toque numa forma para ver seu retrato e suas técnicas.</small></section>`;
}

function codexView() {
  const boss=previewBodyForm(createFinalBoss(),state.formPreviews[FINAL_BOSS.id]);
  const filtered = characters.filter((character) => {
    const owned = profile.ownedIds.includes(character.id);
    const realm = state.crewRealm === "Todos" || character.realm === state.crewRealm;
    const query = !state.crewSearch || (character.name + " " + (character.previousName || "") + " " + character.aliases.join(" ") + " " + character.elo).toLowerCase().includes(state.crewSearch.toLowerCase());
    return realm && query;
  });
  const showFinalBoss = (state.crewRealm === "Todos" || state.crewRealm === "Inferno") &&
    (!state.crewSearch || `${FINAL_BOSS.name} ${FINAL_BOSS.title}`.toLowerCase().includes(state.crewSearch.toLowerCase()));
  return `
    <section class="page-heading"><div><div class="eyebrow">100 ALMAS · 17 ELOS · 3 REINOS</div><h1>Codex</h1><p>Conheça as forças que atravessam o véu. Vença trilhas para recrutar novas almas.</p></div><div class="codex-total"><b>100</b><span>PERSONAGENS<br>DO PMA</span></div></section>
    <div class="codex-summary">${realms.map((realm) => `<article class="codex-stat stat-${realm.color}"><span>${realm.name}</span><b>${realm.elos.reduce((sum, elo) => sum + getEloRoster(elo.id).length, 0)}</b><small>${realm.elos.length} ${realm.elos.length === 1 ? "Elo" : "Elos"}</small></article>`).join("")}</div>
    <div class="codex-controls"><label class="search-box"><span>${uiIcon("search")}</span><input type="search" data-search value="${esc(state.crewSearch)}" placeholder="Buscar personagem ou Elo"></label><div class="filter-row">${["Todos", "Inferno", "Paraíso", "Limbo"].map((realm) => `<button class="${state.crewRealm === realm ? "active" : ""}" data-crew-realm="${realm}">${realm}</button>`).join("")}</div></div>
    ${showFinalBoss ? `<article class="codex-entity" aria-label="O Fim · Rei do Inferno"><img src="${esc(boss.art.portrait)}" alt="${esc(boss.bodyFormName)} de O Fim, sem rosto fixo" loading="lazy"><div><div class="eyebrow">ENTIDADE · ${esc(FINAL_BOSS.title).toUpperCase()}</div><h2>${esc(FINAL_BOSS.name)}</h2><p>${esc(FINAL_BOSS.lore)}</p><small>${esc(FINAL_BOSS.artNote)}</small></div><section class="codex-entity-kit" aria-label="Habilidades de O Fim">${bodyFormSelector(boss)}<p class="body-form-help">${esc(boss.combo)}</p><header><h3>${esc(boss.bodyFormName)}</h3><span>Três posições variáveis · uma defesa compartilhada</span></header><div class="codex-moves">${boss.abilities.map(ability=>`<details class="codex-skill"><summary role="button" tabindex="0" data-codex-skill aria-expanded="false"><img src="${esc(ability.art)}" alt="" loading="lazy"><b>${esc(ability.name)}</b>${costMarkup(boss,ability)}</summary><p>${esc(ability.description)}</p><small>Recarga ${ability.cooldown || 0}T</small></details>`).join("")}</div></section></article>` : ""}
    <div class="codex-grid">${filtered.map((character) => {
      const owned = !state.account || profile.ownedIds.includes(character.id);
      character=previewBodyForm(character,state.formPreviews[character.id]);
      return `<article class="codex-card ${state.account&&!owned ? "unowned" : ""}">
        <div class="codex-card-head color-${character.color}">${character.art?.portrait ? portraitMarkup(character, "codex-portrait") : ""}<span class="codex-card-sigil">${eloSigil(character.eloId)}</span><small>${!state.account?"ALMA DO PMA":owned?"RECRUTADA":"A RECRUTAR"}</small></div>
        <div class="codex-card-body"><div class="eyebrow">${esc(character.realm)} · ELO ${esc(character.elo).toUpperCase()}</div><h3>${esc(character.name)}</h3>${character.lore ? `<p class="codex-lore">${esc(character.lore)}</p>` : ""}<div class="codex-passive">${character.passive.art ? `<img src="${esc(character.passive.art)}" alt="" loading="lazy">` : `<span class="passive-fallback color-${esc(character.color)}">${eloSigil(character.eloId)}</span>`}<div><b>${esc(character.passive.name)}</b><span>${esc(character.passive.description)}</span></div></div></div>
        ${bodyFormSelector(character)}<div class="codex-moves">${character.abilities.map((ability, index) => `<details class="codex-skill"><summary role="button" tabindex="0" data-codex-skill aria-expanded="false">${ability.art ? `<img src="${esc(ability.art)}" alt="" loading="lazy">` : `<i class="move-fallback color-${esc(character.color)}">${abilityIcon(ability)}</i>`}<b>${esc(ability.name)}</b>${costMarkup(character,ability)}</summary><p>${esc(ability.description)}</p>${!character.bodyForms?.length&&ability.forms?.length?`<div class="codex-forms">${ability.forms.map(form=>`<section><header class="${form.art && form.art !== ability.art ? "has-form-art" : ""}">${form.art && form.art !== ability.art ? `<img class="codex-form-art" src="${esc(form.art)}" alt="" loading="lazy">` : ""}<b>↻ ${esc(form.name)}</b>${costMarkup(character,form)}</header><p>${esc(form.description)}</p><small>Recarga ${form.cooldown}T</small></section>`).join("")}</div>`:""}<small>Recarga ${ability.cooldown}T</small></details>`).join("")}</div>
      </article>`;
    }).join("")}</div>`;
}

function battleView() { const name=state.battle?.online?state.online?.profile?.name:state.account?.handle;return `${profile.run?storyMarkup(profile.run):""}<aside class="battle-player-identity">${accountAvatar(profile.avatarId||"soul","avatar-small")}<b>${esc(name||"Alma")}</b><small>JOGADOR</small></aside>`+(state.battle?.phase==="influence"&&!state.battleFx ? renderInfluences(state.battle) : renderWorldHistory(state.battle||{})+renderBattle(state, activeElo())); }

function render() {
  const tab = state.tab;
  const focused=document.activeElement,focusAction=focused?.getAttribute?.("data-action"),focusSkill=focused?.getAttribute?.("data-use-skill"),focusForm=focused?.getAttribute?.("data-preview-form"),focusPayment=focused?.getAttribute?.("data-random-payment");
  document.body.dataset.tab = tab;
  if(typeof window!=="undefined"&&(!state.accountReady||!state.account)){
    app.innerHTML=state.publicView==="codex"?authFrame(codexView(),"codex"):state.publicView==="tutorial"?authFrame(tutorialView(state.publicTutorialStep,{publicPage:true}),"tutorial"):authView();return;
  }
  app.innerHTML = `
    <div class="app-shell">
      ${header()}
      ${statusStrip()}
      <main class="main-content">
        ${tab === "rota" ? routeView() : tab === "trio" ? teamView() : tab === "codex" ? codexView() : tab === "arena" ? arenaView() : tab === "profile" ? profileView() : battleView()}
      </main>
      <footer class="site-footer"><span>PMA: POST MORTEM ARENA <i>·</i> PROTÓTIPO ORIGINAL</span><span>TRÊS REINOS, DEZESSETE ELOS, UMA ESCOLHA</span><span>BUILD 0.5</span></footer>
      ${state.toast ? `<div class="toast" role="status">${esc(state.toast)}</div>` : ""}
      ${state.tutorialOpen?`<div class="tutorial-backdrop">${tutorialView(state.tutorialStep)}</div>`:""}
    </div>`;
  renderBattleMotion(app,state.battleFx);
  if(state.confirmTurn&&focusPayment){const button=app.querySelector(`[data-random-payment="${focusPayment}"]`);(button&&!button.disabled?button:app.querySelector(`[data-random-payment="${focusPayment.split(":")[0]}:${focusPayment.endsWith(":1")?"-1":"1"}"]`))?.focus({preventScroll:true});}
  else if(state.confirmTurn&&focusAction==="suggest-payment")app.querySelector('[data-action="suggest-payment"]')?.focus({preventScroll:true});
  else if(state.confirmTurn)app.querySelector('[data-action="cancel-review"]')?.focus({preventScroll:true});
  else if(focusAction)app.querySelector(`[data-action="${focusAction}"]`)?.focus({preventScroll:true});
  else if(focusSkill)app.querySelector(`[data-use-skill="${focusSkill}"]`)?.focus({preventScroll:true});
  else if(focusForm)app.querySelector(`[data-preview-form="${focusForm}"]`)?.focus({preventScroll:true});
}

// Preview a technique without selecting an action or replacing the arena DOM.
function previewTechnique(event) {
  if (state.tab !== "battle" || !state.battle || state.battleFx || state.battle.phase === "resolving") return;
  const button = event.target.closest("[data-use-skill]");
  if (!button || (event.relatedTarget && button.contains(event.relatedTarget))) return;
  const [actorId, abilityId] = button.dataset.useSkill.split(":");
  if (state.focusSkill?.actorId === actorId && state.focusSkill?.abilityId === abilityId) return;
  state.focusSkill = { actorId, abilityId };
  const panel = app.querySelector(".arena-reading");
  if (panel) panel.innerHTML = renderBattleDetail(state);
}
function previewTrailChoice(event){
  if(!app.querySelector('.journey-shell'))return;
  highlightTrailChoice(app,event.target.closest('[data-route-preview]')?.dataset.routePreview);
}
app.addEventListener("pointerover", event=>{previewTechnique(event);previewTrailChoice(event);});
app.addEventListener("focusin", event=>{previewTechnique(event);previewTrailChoice(event);});
app.addEventListener("pointerout", event=>{
  if(event.target.closest('.journey-shell')&&!event.relatedTarget?.closest?.('.journey-shell'))highlightTrailChoice(app,null);
});

function toggleCodexSkill(summary) {
  const details = summary.closest("details");
  if (!details) return;
  details.open = !details.open;
  summary.setAttribute("aria-expanded", String(details.open));
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("[data-random-payment], [data-world-event], [data-codex-skill], [data-preview-form], [data-public-view], [data-tab], [data-realm], [data-start-run], [data-node], [data-crew-realm], [data-add-member], [data-remove-member], [data-search], [data-use-skill], [data-action], [data-event-choice], [data-choose-buff], [data-shop-action], [data-shop-buff], [data-abandon-run], [data-clear-notice], [data-final-battle], [data-target], [data-remove-action], [data-move-action], [data-inspect-skill], [data-select-elo], [data-difficulty], [data-global-upgrade], [data-clear-completion], [data-auth-mode], [data-avatar], [data-tutorial]");
  if (!target) return;
  if(state.account&&state.audioOn)startAmbience();
  playSfx("click");
  if(target.dataset.publicView){state.publicView=target.dataset.publicView;if(target.dataset.publicView==="tutorial")state.publicTutorialStep=0;render();return;}
  if(target.dataset.authMode){state.authMode=target.dataset.authMode;state.accountError="";render();return;}
  if(target.dataset.avatar){profile.avatarId=target.dataset.avatar;state.profileError="";render();return;}
  if(target.dataset.tutorial!==undefined){const next=Number(target.dataset.tutorial);if(!state.account&&state.publicView==="tutorial"){if(next>=6){state.publicView="login";state.publicTutorialStep=0;}else state.publicTutorialStep=Math.max(0,next);}else if(next>=6){state.tutorialOpen=false;profile.tutorialComplete=true;save();}else state.tutorialStep=Math.max(0,next);render();return;}
  if(target.dataset.worldEvent){if(state.battleFx||state.online?.busy)return;if(state.battle?.online){sendOnline({op:"influence",eventId:target.dataset.worldEvent});return;}if(profile.run?.serverOwned){requestCampaign({op:"influence",eventId:target.dataset.worldEvent},{animate:true});return;}if(chooseInfluence(state.battle,target.dataset.worldEvent)){render();if(state.battle.phase==="resolving")resolveCombatStep();}return;}
  if (target.dataset.codexSkill !== undefined) { event.preventDefault(); toggleCodexSkill(target); return; }
  if (state.tab === "battle" && (state.battle?.phase === "resolving" || state.battleFx)) return;
  if (state.trailBusy) return;
  if(target.dataset.action==="connect-arena"){sendOnline({op:"profile"});return;}
  if(target.dataset.action==="open-tutorial"){state.tutorialOpen=true;state.tutorialStep=0;render();return;}
  if(target.dataset.action==="skip-tutorial"){if(!state.account&&state.publicView==="tutorial"){state.publicView="login";state.publicTutorialStep=0;}else{state.tutorialOpen=false;profile.tutorialComplete=true;save();}render();return;}
  if(target.dataset.action==="logout"){clearTimeout(accountSaveTimer);accountRequest({op:"logout"}).finally(()=>{state.account=null;state.accountReady=true;state.authMode="login";state.tab="rota";render();});return;}
  if(target.dataset.action==="queue-online"){if(state.battle&&!state.battle.online){toast("Termine o combate atual antes de buscar uma partida.");return;}state.online.queuing=true;sendOnline({op:"queue",team:profile.team});return;}
  if(target.dataset.action==="cancel-online"){state.online.queuing=false;sendOnline({op:"cancel"});return;}
  if(target.dataset.action==="resume-online"){state.tab="battle";render();return;}
  if(target.dataset.action==="surrender-online"){sendOnline({op:"surrender"});return;}
  if (target.dataset.tab) {
    state.tab = target.dataset.tab;
    render();
    return;
  }
  if (target.dataset.realm) {
    state.realmId = target.dataset.realm;
    state.eloId = realms.find((realm) => realm.id === state.realmId).elos[0].id;state.difficulty=null;
    render();
    return;
  }
  if(target.dataset.selectElo){state.eloId=target.dataset.selectElo;state.difficulty=null;render();if(typeof requestAnimationFrame==="function")requestAnimationFrame(()=>app.querySelector(".expedition-panel")?.scrollIntoView({behavior:"smooth",block:"center"}));return;}
  if(target.dataset.difficulty!==undefined){state.difficulty=Math.max(0,Math.min(maxDifficulty(profile,state.eloId),Number(target.dataset.difficulty)||0));render();return;}
  if(target.dataset.globalUpgrade){if(profile.run?.serverOwned||state.account){requestCampaign({op:"claim",id:target.dataset.globalUpgrade}).then(data=>{if(data?.claimed)toast(`Legado incorporado: ${data.claimed.title}`);});return;}const power=claimGlobalUpgrade(profile,target.dataset.globalUpgrade);if(power){save();toast(`Legado incorporado: ${power.title}`);}return;}
  if(target.dataset.clearCompletion!==undefined){if(!profile.pendingGlobalReward){if(state.account)requestCampaign({op:"clear-notice"});else{profile.completionNotice=null;save();render();}}return;}
  if (target.dataset.startRun) { if(state.online?.match&&!state.online.match.settled){toast("Conclua sua partida online antes de iniciar uma trilha.");return;} startRun(target.dataset.startRun,target.dataset.trail||"hunt",target.dataset.runDifficulty===undefined?undefined:Number(target.dataset.runDifficulty)); return; }
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
  if (target.dataset.previewForm) { const [id,key]=target.dataset.previewForm.split(':');state.formPreviews[id]=key;render();return; }
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
  if (target.dataset.removeAction) { state.randomPayment=null; removeQueuedAction(state.battle,target.dataset.removeAction); render(); return; }
  if (target.dataset.moveAction) { const [id,direction]=target.dataset.moveAction.split(":"); moveQueuedAction(state.battle,id,Number(direction)); render(); return; }
  if (target.dataset.inspectSkill) { const [actorId,abilityId]=target.dataset.inspectSkill.split(":"); state.focusSkill={actorId,abilityId}; state.selectedSkill=null; render(); return; }
  if (target.dataset.action === "review-turn" || target.dataset.action === "pass-turn") { state.confirmTurn=true; state.randomPayment=null; state.selectedSkill=null; render(); return; }
  if(target.dataset.randomPayment){const [id,delta]=target.dataset.randomPayment.split(':');const p=getTurnPayment(state.battle,state.randomPayment);const selected={...p.selected};const next=(selected[id]||0)+Number(delta);if(next>=0&&next<=p.available[id]&&(Number(delta)<0||p.missing>0)){selected[id]=next;state.randomPayment=selected;render();}return;}
  if(target.dataset.action==='suggest-payment'){state.randomPayment=null;render();return;}
  if (target.dataset.action === "cancel-review") { state.confirmTurn=false; render(); return; }
  if (target.dataset.action === "cancel-skill") { state.selectedSkill=null; render(); return; }
  if (target.dataset.action === "commit-turn") { executePlannedTurn(); return; }
  if (target.dataset.action === "return-battle") { returnFromBattle(); return; }
  if (target.dataset.action === "leave-battle") { state.tab = state.battle?.online?"arena":"rota"; render(); return; }
  if (target.dataset.eventChoice) { chooseEvent(target.dataset.eventChoice); return; }
  if (target.dataset.chooseBuff) { chooseBuff(target.dataset.chooseBuff); return; }
  if (target.dataset.shopAction) { chooseShop(target.dataset.shopAction); return; }
  if (target.dataset.shopBuff) { chooseShop("buff", target.dataset.shopBuff); return; }
  if (target.dataset.abandonRun) {
    if (profile.run && confirm("Abandonar a trilha atual? A estabilidade será perdida.")) {
      if(profile.run.serverOwned)requestCampaign({op:"abandon"});else{profile.run = null; save(); render();}
    }
    return;
  }
  if (target.dataset.clearNotice !== undefined) { state.pending = null; render(); return; }
  if (target.dataset.finalBattle !== undefined) {
    if(profile.completedElos.length<elos.length)return;
    const elo = getEloById("vazio");
    state.eloId = elo.id;
    startEncounter({ id: "finale", type: "finale", label: "A Última Barreira", eloId: elo.id });
  }
});

app.addEventListener("submit",async event=>{
 if(event.target.matches("[data-auth-form]")){
  event.preventDefault();const fields=new FormData(event.target),op=state.authMode==="register"?"register":"login";state.accountError="Conectando…";render();
  try{let data=await accountRequest({op,email:fields.get("email"),password:fields.get("password"),...(op==="register"?{handle:fields.get("handle")}:{})});if(data.user)data=await campaignRequest({op:"sync"});hydrateAccount(data);if(state.account){startAmbience();save();}}
  catch(error){state.accountError=error.message;state.accountReady=true;render();}return;
 }
 if(event.target.matches("[data-profile-form]")){
  event.preventDefault();const fields=new FormData(event.target);state.profileError="Salvando…";render();
  try{const data=await accountRequest({op:"save",handle:fields.get("handle"),bio:fields.get("bio"),avatarId:profile.avatarId||"soul",profile:{...profile,version:1}});state.account=data.user;Object.assign(profile,normalizeCampaign(data.profile));state.profileError="Perfil salvo.";render();}
  catch(error){state.profileError=error.message;render();}return;
 }
});

app.addEventListener("input", (event) => {
  if (event.target.matches("[data-search]")) {
    state.crewSearch = event.target.value;
    const cursor = event.target.selectionStart;
    clearTimeout(searchRenderTimer);
    searchRenderTimer=setTimeout(()=>{render();const input=app.querySelector("[data-search]");input?.focus();input?.setSelectionRange(cursor,cursor);},120);
  }
});

app.addEventListener("keydown", (event) => {
  if (event.target.matches("[data-codex-skill]") && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault(); toggleCodexSkill(event.target); return;
  }
  if(state.battleFx||state.battle?.phase==="resolving")return;
  if(state.confirmTurn){
    if(event.key==="Escape"){event.preventDefault();state.confirmTurn=false;render();app.querySelector('[data-action="review-turn"]')?.focus({preventScroll:true});return;}
    if(event.key==="Tab"){
      const dialog=app.querySelector('.turn-review'),buttons=dialog?[...dialog.querySelectorAll('button:not(:disabled)')]:[];
      if(!buttons.length)return;const first=buttons[0],last=buttons.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
    return;
  }
  if(event.key==="Escape"&&state.selectedSkill){event.preventDefault();const ref=state.selectedSkill;state.selectedSkill=null;render();app.querySelector(`[data-use-skill="${ref.actorId}:${ref.abilityId}"]`)?.focus({preventScroll:true});return;}
  if (event.target.matches("[data-target]") && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();selectBattleTarget(event.target.dataset.target);
  }
});

render();
checkAccount();




