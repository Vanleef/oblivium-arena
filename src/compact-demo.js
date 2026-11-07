import {characterById} from './data.js';
import {combatScenes,combatScene} from './combat-scenes.js';
import {createTacticalBattle,previewTacticalPlan,submitTacticalPlan,resolveTacticalRound,startCompactRoundResolution,tacticalView,tacticalArea,fortressTechniqueSpec,chooseTacticalChestReward,rerollTacticalChestReward,chooseTacticalShadow} from './tactical-combat.js';
import {skillSealReason} from './combat-effects.js';
import {tacticalRequirementReason} from './tactical-requirements.js';
import {planTacticalAI} from './tactical-ai.js';
import {conquestAugmentedAbility,augmentTiers} from './conquest-augments.js';
import {conquestProgress,syncConquestCampaign} from './conquest-progress.js';
import {conquestTechnique,conquestPassive} from './conquest-techniques.js';
import {objectiveGrowth} from './conquest-objectives.js';
import {boardCells,cellKey,cellLabel,findPath,occupied,sameCell,unitFacing} from './tactical-board.js';
import {tacticalRoster,tacticalOpponentRoster,tacticalPatternLabel} from './tactical-kits.js';
import {tacticalSpriteFrame,tacticalSpriteInline,paintTacticalToken} from './tactical-sprites.js';
import {tacticalFigureStyle} from './tactical-figure-framing.js';
import {tacticalAreaDiagramMarkup} from './tactical-area-diagram.js';
import {tacticalIdleStyle} from './tactical-motion.js';
import {tacticalFrameDuration,tacticalCompactFrameDuration,tacticalAnimationFamily} from './tactical-animation.js';
import {tacticalComboReplayEvents} from './tactical-combo.js';
import {tacticalReactiveBeats,tacticalReactiveJudge,tacticalReactiveAI} from './tactical-reactions.js';
import {TacticalEffectsLayer,tacticalImpactContacts} from './tactical-effects-layer.js';
import {tacticalImpactProfile,tacticalContactRecoil} from './tactical-impact-presentation.js';
import {tacticalProjectileKind,tacticalCutinMarkup,tacticalCutinActive,tacticalSuperCaptionMarkup,tacticalReplayFrames} from './tactical-cinematic.js';
import {tacticalStatuses} from './tactical-statuses.js';
import {surfaceAt,elements,tacticalFieldForecast} from './tactical-elements.js';
import {tacticalEnvironments} from './tactical-environment.js';
import {createTacticalRun,offerTacticalRewards,chooseTacticalReward,advanceTacticalRun,tacticalRoutes,conquestProgressText} from './tactical-run.js';
import {audioEnabled,setAudioEnabled,playCombatCue} from './audio.js';
import {orderTacticalActions} from './tactical-order.js';
import {tacticalFeedback,tacticalTechniqueTone,tacticalAreaPhase,tacticalVisualCells,tacticalDefeatedUnits} from './tactical-feedback.js';
import {tacticalActorPalette,tacticalPaletteVariables} from './tactical-visual-palette.js';
const root=document.getElementById('tactical-app');
const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const key='oblivium-conquest-augment-progress-v2',profileKey='pma-post-mortem-arena-v1';
function progress(){try{const stored=conquestProgress(JSON.parse(localStorage.getItem(key)||'{}')),profile=JSON.parse(localStorage.getItem(profileKey)||'null');return profile?syncConquestCampaign(profile,stored):stored;}catch{return conquestProgress();}}
const state={battle:null,run:createTacticalRun(progress()),actions:[],spends:{},selected:null,mode:'move',busy:false,snapshot:null,event:null,message:'',speed:1,seed:1,revision:0,rewards:[],hitstop:false,clash:null};
let effects,worker,aiTask,job=0;
const units=s=>[...s.allies,...s.enemies];
const heroColors=Object.freeze(['#f0ae56','#e94a86','#6ca8f5']);
const colorFor=(s,id)=>heroColors[Math.max(0,s.allies.findIndex(u=>u.id===id))%heroColors.length];
const count=id=>state.actions.filter(a=>a.actorId===id).length;
const locked=()=>state.busy||state.battle.tactical.stage!=='planning'||Boolean(state.battle.tactical.plans.player);
const project=()=>previewTacticalPlan(tacticalView(state.battle,'player'),'player',state.actions);
// Previews indicate targets only; actors remain at the real tile until playback.
const displayed=()=>state.snapshot?{...state.battle,...state.snapshot,tactical:{...state.battle.tactical,...state.snapshot}}:state.battle;
const planned=()=>!state.snapshot&&state.battle.tactical.stage==='planning'?(project().projection||state.battle):state.battle;
const actor=s=>s.allies.find(u=>u.id===state.selected)||s.allies.find(u=>u.hp>0)||s.allies[0];
function saveProgress(){state.run.augmentProgress=conquestProgress(state.battle.tactical.fortress.progress);try{localStorage.setItem(key,JSON.stringify(state.battle.tactical.fortress.progress));}catch{}}
function figure(unit,s){
 const current=state.event?.actorId===unit.id?state.event:null,facing=current?.orientation||unitFacing(s,unit),frame=tacticalSpriteFrame(unit,current,facing),superFocus=tacticalCutinActive(current);
 const sign=frame?.directional?1:facing[0]<0?-1:1;
 const statuses=tacticalStatuses(unit,s),layers=[...new Set(statuses.map(e=>e.id.startsWith('dot:')?'affliction':e.id.startsWith('mark:')?'marked':e.id.startsWith('surface:')?'terrain-'+e.id.slice(8):e.id))],orders=!state.busy&&unit.side==='player'?state.actions.filter(a=>a.actorId===unit.id):[];
 const sprite=frame?'<span class="token-sprite"><span class="sprite-viewport"><img class="sprite-sheet" src="'+esc(frame.src)+'" alt="" style="'+tacticalSpriteInline(frame)+'"></span></span>':unit.art?.portrait?'<img class="token-art" src="'+esc(unit.art.portrait)+'" alt="">':'<i class="arena-creature-mark">'+esc(unit.symbol||'◆')+'</i>';
 const indicators=orders.map((action,i)=>'<b data-action-kind="'+action.type+'" title="'+esc((i+1)+'ª ação · '+actionName(unit,action))+'" aria-label="'+esc(actionName(unit,action))+'"><span class="compact-order-symbol">'+actionGlyph(unit,action)+'</span><span class="compact-order-step">'+(i+1)+'</span></b>').join('');
 return '<span class="token '+unit.side+'" data-unit-id="'+esc(unit.id)+'" data-family="'+esc(current?.family||'idle')+'" data-pose="'+esc(current?.pose||'ready')+'" data-super-active="'+superFocus+'" data-sprite="'+Boolean(frame)+'" data-idle-atlas="false" style="'+tacticalFigureStyle(unit)+tacticalIdleStyle(unit)+'--facing-sign:'+sign+';--upgrade-growth:'+objectiveGrowth(unit.objectiveAugments||0)+';--pose-duration:'+tacticalFrameDuration(current||{})+'ms"><span class="compact-ground-shadow" aria-hidden="true"></span><span class="conquest-model">'+sprite+'</span>'+(unit.id===state.selected&&!state.busy?'<i class="selected-unit-arrow" aria-hidden="true"></i>':'')+'<span class="tactical-status-vfx" aria-hidden="true">'+layers.map(layer=>'<i data-status-vfx="'+esc(layer)+'"></i>').join('')+'</span><span class="compact-token-label">'+esc(unit.name)+'</span>'+(orders.length?'<span class="compact-token-orders" aria-hidden="true">'+indicators+'</span>':'')+'</span>';
}
const emblem=tier=>'<span class="objective-pulse" data-tier="'+tier+'" aria-hidden="true"><i></i><b class="objective-emblem"><svg viewBox="0 0 64 64"><path class="objective-gem" d="M32 6 48 21 44 43 32 54 20 43 16 21Z"/><path class="objective-facets" d="m32 6-8 18 8 30 8-30Zm-16 15 16 9 16-9M20 43l12-13 12 13"/></svg></b></span>';
function board(s,future=planned()){
 const owner=actor(s),canMove=!locked()&&state.mode==='move'&&count(owner.id)<2,goal=s.tactical.objectives?.player;
 const event=state.event,phase=tacticalAreaPhase(event),activeCells=new Set(phase?tacticalVisualCells(event).map(cellKey):[]),destinations=new Map();
 const beforeActor=event?.before&&units(event.before).find(u=>u.id===event.actorId),ability=beforeActor?.abilities?.find(a=>a.id===event.abilityId);
 const tone=tacticalTechniqueTone(beforeActor,ability,event),feedback=phase==='impact'?tacticalFeedback(event):[];
 const castColors=tacticalActorPalette(beforeActor),castStyle=tacticalPaletteVariables(castColors);
 const castOrigin=phase?event?.before?.positions?.[event.actorId]:null;
 const profile=phase==='impact'?tacticalImpactProfile(event,{reduced:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches}):null;
 const contacts=profile?tacticalImpactContacts(event):[];
 const contactsByCell=new Map(contacts.map(contact=>[cellKey(contact.point),contact]));
 const fallenByCell=new Map();
 if(phase==='impact')for(const fallen of tacticalDefeatedUnits(event))
  fallenByCell.set(cellKey(fallen.point),fallen.unit);
 const feedbackByCell=new Map();
 for(const item of feedback){const key=cellKey(item.point);if(!feedbackByCell.has(key))feedbackByCell.set(key,[]);feedbackByCell.get(key).push(item);}
 if(!state.busy)for(const u of s.allies){const to=future.tactical.positions[u.id];if(to&&!sameCell(to,s.tactical.positions[u.id]))destinations.set(cellKey(to),u);}
 return '<div class="board compact-board" data-super-impact="'+Boolean(phase==='impact'&&['voto','despertar'].includes(String(event?.abilityId||'').split('/')[0]))+'" role="group" aria-label="Arena tática em grade 6 por 6" style="--fort-cols:6;--fort-rows:6">'+boardCells(s).map(p=>{
  const living=occupied(s,p),fallen=!living?fallenByCell.get(cellKey(p)):null,unit=living||fallen,path=canMove?findPath(future,owner.id,p):null,objective=goal&&sameCell(goal.position,p),surface=surfaceAt(s,p),blocked=s.tactical.obstacles.some(q=>sameCell(q,p)),destination=destinations.get(cellKey(p));
  const inArea=activeCells.has(cellKey(p)),isOrigin=Boolean(phase&&castOrigin&&sameCell(p,castOrigin)),isAnchor=Boolean(inArea&&event?.anchor&&sameCell(p,event.anchor)),reactions=feedbackByCell.get(cellKey(p))||[],heavy=reactions.some(r=>r.kind==='damage'||r.kind==='shield-loss'),restored=reactions.some(r=>r.kind==='heal'||r.kind==='shield');
  const contact=contactsByCell.get(cellKey(p)),recoil=tacticalContactRecoil(contact,profile,{mobile:globalThis.innerWidth<=760});
  return '<button class="cell '+(path?'reachable ':'')+(blocked?'blocked ':'')+(objective?'objective-cell objective-'+goal.tier+' ':'')+(inArea?'compact-ability-area compact-'+phase+' ':'')+(isOrigin?'compact-cast-origin-cell ':'')+(isAnchor?'compact-cast-anchor-cell ':'')+(heavy?'compact-hit-damage ':'')+(restored?'compact-hit-heal ':'')+(fallen?'compact-defeated ':'')+(contact?'compact-hit-body ':'')+'" data-cell="'+cellKey(p)+'" data-impact-family="'+esc(contact?profile.family:'none')+'" data-impact-reaction="'+esc(contact?.reaction||'none')+'" style="z-index:'+(p.y*10+(unit?10:0))+';--hit-recoil-x:'+(recoil?.x||0)+'px;--hit-recoil-y:'+(recoil?.y||0)+'px" aria-label="'+cellLabel(p)+(unit?', '+esc(unit.name)+(fallen?', derrotado':', '+(unit.side==='player'?'aliado':'inimigo')+', Vida '+unit.hp):', vazia')+(objective?', objetivo '+augmentTiers[goal.tier].label:'')+(path?', movimento disponível, 1 casa':'')+(inArea?', na área '+(phase==='impact'?'atingida':'indicada')+' da técnica':'')+(isAnchor?', centro da ação':'')+(isOrigin?', origem do golpe':'')+(surface?', '+esc(elements[surface.element]?.surface||surface.element):'')+'" '+(locked()?'disabled':'')+'><span class="coord">'+cellLabel(p)+'</span>'+(objective?emblem(goal.tier):'')+(surface?'<span class="element-floor" data-element="'+surface.element+'" aria-hidden="true"></span>':'')+(destination?'<span class="compact-planned-destination" aria-hidden="true">↳ '+esc(destination.name)+'</span>':'')+(inArea?'<span class="compact-area-sigil" data-effect-tone="'+tone+'" data-attack-family="'+esc(event?.family||'none')+'" data-phase="'+phase+'" data-area-role="'+(isAnchor?'anchor':'affected')+'" data-actor-palette="'+Boolean(castColors)+'" style="'+castStyle+'" aria-hidden="true"></span>':'')+(isOrigin?'<span class="compact-cast-origin" aria-hidden="true"></span>':'')+(unit?figure(unit,s):'')+(reactions.length?'<span class="compact-impact-feedback" aria-live="off">'+reactions.map((r,i)=>'<b data-feedback-kind="'+r.kind+'" style="--feedback-index:'+i+'" title="'+esc(r.label)+'">'+esc(r.label)+'</b>').join('')+'</span>':'')+'</button>';
 }).join('')+'</div>';
}
function hud(s){
 const team=(list,side)=>'<div class="compact-team compact-team-'+side+'"><small>'+(side==='player'?'SEU TRIO':'OPONENTE')+'</small>'+list.map(u=>'<button data-actor="'+esc(u.id)+'" class="compact-unit '+(u.id===state.selected?'selected':'')+'" '+(side==='enemy'||locked()||u.hp<=0?'disabled':'')+' aria-pressed="'+(u.id===state.selected)+'" title="'+esc(u.name)+'">'+(u.art?.portrait?'<img src="'+esc(u.art.portrait)+'" alt="">':'<i class="arena-creature-mark">'+esc(u.symbol||'◆')+'</i>')+'<span><b>'+esc(u.name)+'</b><small>'+Math.max(0,u.hp)+' PV'+(side==='player'?' · '+count(u.id)+'/2 ações':'')+'</small><i><em style="width:'+Math.max(0,u.hp/u.maxHp*100)+'%"></em></i></span></button>').join('')+'</div>';
 return '<div class="compact-hud">'+team(s.allies,'player')+'<div class="compact-round"><small>RODADA</small><b>'+s.round+'</b><strong role="status">'+esc(state.event?.title||(state.busy?'Revelando planos':state.battle.tactical.stage==='reward'?'Escolha seu aprimoramento':state.battle.tactical.stage==='finished'?'Combate encerrado':'Planejamento simultâneo'))+'</strong></div>'+team(s.enemies,'enemy')+'</div>';
}
function specialChoices(unit,ability,readOnly){
 const disabled=readOnly?' disabled':'',controls=[];
 for(const [key,max,label]of [['residueSpend',Math.min(ability?.spendResidueMax||0,unit.residue||0),'Resíduo'],['fractureSpend',ability?.spendFracturesMax||0,'Fraturas por alvo']]){
  if(!max)continue;
  controls.push('<div class="tactical-spend"><strong>'+label+'</strong>'+Array.from({length:max+1},(_,n)=>'<button data-spend="'+key+'" data-amount="'+n+'" aria-pressed="'+((state.spends[key]||0)===n)+'"'+disabled+'>'+n+'</button>').join('')+'</div>');
 }
 if(state.battle.allies.find(u=>u.id===unit.id)?.shadowChoicePending)controls.push('<div class="tactical-spend"><strong>Sombra Preparada</strong><button data-shadow="damage"'+disabled+'>Próxima técnica: +5</button><button data-shadow="response"'+disabled+'>Resposta ampla</button></div>');
 return controls.join('');
}
function actionName(unit,ref){
 if(ref.type==='move')return 'Mover → '+cellLabel(ref.path.at(-1));
 if(ref.type==='guard')return 'Guarda';
 return unit.abilities.find(a=>a.id===ref.abilityId)?.name||'Técnica';
}
const moveGlyph='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 24l7-7m0 0V7m0 10h10M18 24l7-7M22 24h3v-3" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const guardGlyph='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 27 7v8c0 7-5 11-11 14C10 26 5 22 5 15V7L16 3Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M16 8v15M9 13h14" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>';
function actionGlyph(unit,action){
 if(action.type==='move')return moveGlyph;
 if(action.type==='guard')return guardGlyph;
 const ability=unit.abilities.find(a=>a.id===action.abilityId);
 return ability?.art?'<img src="'+esc(ability.art)+'" alt="" loading="lazy" decoding="async">':'<span aria-hidden="true">✦</span>';
}
function actionDock(s,future){
 const u=actor(future),unavailable=locked()||count(u.id)>=2||u.hp<=0||u.stunned;
 const picked=u.abilities.find(a=>a.id===state.mode);
 const portraits='<div class="compact-roster-rail" role="group" aria-label="Selecionar personagem">'+s.allies.map((hero,i)=>{
  const passive=conquestPassive(hero.passive);
  const description=hero.name+(passive?' · Passiva: '+passive.name+' — '+passive.description:'');
  return '<button class="compact-portrait" data-actor="'+esc(hero.id)+'" data-hero-index="'+i+'" style="--hero-accent:'+heroColors[i%heroColors.length]+'" title="'+esc(description)+'" aria-label="Selecionar '+esc(hero.name)+'" aria-pressed="'+(hero.id===state.selected)+'" '+(locked()||hero.hp<=0||hero.stunned?'disabled':'')+'>'+(hero.art?.portrait?'<img src="'+esc(hero.art.portrait)+'" alt="" loading="lazy" decoding="async">':'<span aria-hidden="true">'+esc(hero.symbol||'◆')+'</span>')+'</button>';
 }).join('')+'</div>';
 const command=(kind,glyph,label,selected)=>'<button class="compact-icon-btn compact-primary-action" '+(kind==='move'?'data-mode="move"':'data-guard')+' title="'+esc(label)+'" aria-label="'+esc(label)+'" aria-pressed="'+Boolean(selected)+'" '+(unavailable?'disabled':'')+'>'+glyph+'<span>'+esc(kind==='move'?'Mover':'Guarda')+'</span>'+tacticalAreaDiagramMarkup(null,{movement:kind==='move'})+'</button>';
 const primary='<section class="compact-panel-section" data-panel-section="actions"><h3>Ações</h3><div class="compact-primary-buttons">'+command('move',moveGlyph,'Mover uma casa',state.mode==='move')+'</div></section>';
 const abilityButtons=u.abilities.map(base=>{
  const a=conquestAugmentedAbility(future,u,conquestTechnique(base)),cooldown=u.cooldowns[a.id]||0,reason=skillSealReason(u,a)||tacticalRequirementReason(future,u,a);
  const areaSpec=fortressTechniqueSpec(future,u,a);
  const tooltip=a.name+' — Área: '+tacticalPatternLabel(areaSpec)+'; alcance '+areaSpec.range+' — '+(reason||(cooldown?'Em recarga · '+cooldown:a.description));
  const areaBadge=tacticalAreaDiagramMarkup(areaSpec,{facing:unitFacing(future,u)});
  return '<button class="compact-icon-btn" data-technique="'+esc(a.id)+'" aria-pressed="'+(state.mode===a.id)+'" aria-label="'+esc(tooltip)+'" title="'+esc(tooltip)+'" style="'+tacticalPaletteVariables(tacticalActorPalette(u,{realmFallback:true}))+'" '+(unavailable||cooldown||reason?'disabled':'')+'>'+actionGlyph(u,{type:'skill',abilityId:a.id})+'<span class="compact-tech-name">'+esc(a.name)+'</span>'+areaBadge+'</button>';
 }).join('');
 const advance=specialChoices(u,picked,unavailable);
 const advanced=advance?'<details class="compact-panel-advanced"><summary aria-label="Opções avançadas da técnica" title="Opções avançadas da técnica">✧</summary>'+advance+'</details>':'';
 const abilities='<section class="compact-panel-section" data-panel-section="abilities"><h3>Habilidades</h3><div class="compact-area-legend" aria-label="No desenho das áreas, centro claro é a origem e casas coloridas são atingidas"><span><i data-legend="origin"></i>Origem</span><span><i data-legend="hit"></i>Área</span></div><div class="compact-quick-buttons" role="group" aria-label="Técnicas do personagem selecionado">'+abilityButtons+'</div>'+advanced+'</section>';
 // Items have no combat mechanic in this mode yet: do not invent clickable item commands.
 const items='<section class="compact-panel-section" data-panel-section="items"><h3>Itens</h3><div class="compact-items-empty" aria-label="Nenhum item disponível neste combate"><span aria-hidden="true">◇</span><small>Sem itens</small></div></section>';
 const ordered=orderTacticalActions(state.battle,state.actions.map((ref,order)=>({...ref,order,side:'player'})));
 const sequence=Array.from({length:2},(_,wave)=>{
  const slots=Array.from({length:3},(_,i)=>{
   const hero=s.allies[i],ref=ordered.find(item=>item.slot===wave&&item.actorId===hero.id),index=wave*3+i+1;
   if(!ref)return '<span class="compact-sequence-empty" data-action-step="'+index+'" title="Ação '+index+' · '+esc(hero.name)+' ainda não escolhida" aria-label="Posição '+index+' vazia"></span>';
   const label=index+'ª ação do seu trio · '+hero.name+' · '+actionName(hero,ref);
   return '<button class="compact-sequence-icon" data-remove-index="'+ref.order+'" data-action-step="'+index+'" data-wave="'+(wave+1)+'" data-actor-color="'+colorFor(s,hero.id)+'" style="--hero-accent:'+colorFor(s,hero.id)+'" title="'+esc(label)+' — tocar para remover" aria-label="Remover '+esc(label)+'" '+(locked()?'disabled':'')+'>'+actionGlyph(hero,ref)+'</button>';
  });
  return '<div class="compact-sequence-wave" data-plan-wave="'+(wave+1)+'"><h4>'+(wave===0?'1ª ação':'2ª ação')+'</h4><div class="compact-sequence-steps">'+slots.map((slot,i)=>slot+(i<2?'<span class="compact-sequence-arrow" aria-hidden="true">→</span>':'')).join('')+'</div></div>';
 }).join('<span class="compact-wave-arrow" aria-hidden="true">↓</span>');
 const footer='<div class="compact-quick-footer"><span class="compact-visually-hidden" role="status">'+esc(state.message||'Selecione um personagem e uma ação. '+state.actions.length+' de 6 ações planejadas.')+'</span><button data-undo title="Desfazer última ação" aria-label="Desfazer última ação" '+(locked()||!state.actions.length?'disabled':'')+'>↶</button><button data-clear title="Limpar o plano" aria-label="Limpar plano" '+(locked()||!state.actions.length?'disabled':'')+'>×</button><button data-confirm title="Executar rodada agora" aria-label="Executar rodada agora" '+(locked()?'disabled':'')+'>▶</button></div>';
 const plan='<section class="compact-panel-section compact-panel-planning" data-panel-section="planning"><h3>Planejamento</h3><div class="compact-action-sequence" role="group" aria-label="Ordem de execução: primeiras ações e segundas ações">'+sequence+'</div>'+footer+'</section>';
 return '<aside class="compact-action-hub compact-command-panel" data-panel-locked="'+Boolean(unavailable)+'" aria-busy="'+state.busy+'" aria-label="Comandos de '+esc(u.name)+'">'+portraits+primary+abilities+items+plan+'</aside>';
}
function reward(){
 const offer=state.battle.tactical.pendingChestRewards[0];
 if(!offer||state.busy)return '';
 const owner=units(state.battle).find(u=>u.id===offer.actorId);
 return '<section class="chest-reward panel" data-tier="'+offer.tier+'"><h2>'+esc(owner?.name)+' · '+augmentTiers[offer.tier].label+'</h2><p>Escolha uma melhoria individual para este combate.</p><div class="chest-options">'+offer.options.map(o=>'<button data-reward="'+esc(o.id)+'" title="'+esc(o.text)+'"><strong>'+esc(o.title)+'</strong><span>'+esc(o.text)+'</span></button>').join('')+'</div>'+((state.battle.tactical.fortress.progress.spins||0)>0?'<button data-reroll>Trocar opções · 1 Giro</button>':'')+'</section>';
}
function setup(){
 const select=(side,i)=>'<label>'+ (side==='player'?'Aliado ':'Adversário ')+(i+1)+'<select data-team="'+side+'" data-index="'+i+'">'+(side==='player'?tacticalRoster:tacticalOpponentRoster).map(id=>'<option value="'+id+'" '+((side==='player'?state.battle.allies:state.battle.enemies)[i]?.sourceId===id||(side==='player'?state.battle.allies:state.battle.enemies)[i]?.id===id?'selected':'')+'>'+esc(characterById[id].name+' — '+characterById[id].identityTitle)+'</option>').join('')+'</select></label>';
 return '<details class="panel compact-setup"><summary>Nova formação</summary><div class="setup-fields">'+['player','enemy'].flatMap(side=>[0,1,2].map(i=>select(side,i))).join('')+'<label>Cenário<select data-scene>'+combatScenes.map(c=>'<option value="'+c.id+'" '+(c.id===state.battle.tactical.scene?'selected':'')+'>'+esc(c.name)+'</option>').join('')+'</select></label><label>Regra ambiental<select data-environment><option value="none">Sem regra ambiental</option>'+tacticalEnvironments.map(e=>'<option value="'+e.id+'">'+esc(e.world+' · '+e.title)+'</option>').join('')+'</select></label><button data-restart>Iniciar confronto</button></div></details>';
}
function eventForecast(s){
 if(state.battle.tactical.stage==='finished')return '';
 const {nextRound,roundsRemaining,active}=tacticalFieldForecast(s);
 return '<p class="compact-field-forecast"><strong>Eventos de campo</strong> · Próximo evento: rodada '+nextRound+' (em '+roundsRemaining+' rodada(s))'+(active?'<span>Ativo: '+esc(active.title)+' · '+esc(active.description)+'</span>':'')+'</p>';
}
function clashMarkup(){
 const value=state.clash;if(!value)return '';
 const beat=value.beats[value.beat-1],offense=value.role==='attack';
 const cue=beat?.cue||'GOLPE';
 const keys=offense?'<button data-combo-strike '+(value.locked?'disabled':'')+'>ATACAR<small>Espaço / Enter</small></button>'
  :beat?.kind==='sweep'?'<button data-combo-jump '+(value.locked?'disabled':'')+'>SALTAR<small>W / Espaço</small></button>'
  :'<button data-combo-dodge '+(value.locked?'disabled':'')+'>ESQUIVAR<small>Espaço / D</small></button><button data-combo-parry '+(value.locked?'disabled':'')+'>APARAR<small>E / Enter</small></button>';
 const tip=offense?'Acompanhe o movimento do personagem e ataque quando o golpe conectar.'
  :beat?.kind==='sweep'?'Varredura no chão: salte na hora do contato.'
  :'Esquiva: janela maior. Aparo: janela curta e chance de contra-atacar.';
 return '<section class="compact-rhythm-clash" role="dialog" aria-modal="false" aria-label="Resposta durante sequência de golpes" data-combo-role="'+value.role+'" data-combo-kind="'+beat.kind+'" data-combo-cue="'+(value.locked?'resolved':'windup')+'" data-combo-feedback="'+Boolean(value.locked)+'" style="--rhythm-ms:'+beat.duration+'ms;--rhythm-stop:'+value.progress+'">'
  +'<div class="compact-rhythm-heading"><strong>'+esc(offense?'EXECUÇÃO DO COMBO':'REAGIR AO ATAQUE')+'</strong><span>GOLPE '+value.beat+' / '+value.beats.length+'</span></div>'
  +'<p><b>'+esc(value.actorName)+'</b> · '+esc(value.abilityName)+'</p>'
  +'<div class="compact-rhythm-contact" aria-hidden="true"><span class="compact-rhythm-contact-core"></span><span class="compact-rhythm-contact-ring"></span><span class="compact-rhythm-attack-glyph">'+esc(cue)+'</span></div>'
  +'<p class="compact-rhythm-help">'+esc(value.feedback||tip)+'</p>'
  +'<div class="compact-rhythm-actions">'+keys+'<button data-combo-skip>Sem interação<small>Esc</small></button></div>'
  +'<span class="compact-rhythm-score" role="status">Ações precisas: '+value.hits+' / '+value.beats.length+(offense?' · Intensifica a técnica.':' · Aparo total gera contra-ataque.')+'</span>'
  +'</section>';
}
function render(){
 const s=displayed(),future=planned(),finished=state.battle.tactical.stage==='finished',rule=s.tactical.environment;
 const actorEvent=units(s).find(u=>u.id===state.event?.actorId),ability=actorEvent?.abilities.find(a=>a.id===state.event?.abilityId);
 const result=finished&&!state.busy?'<section class="compact-result"><h2>'+({victory:'Vitória',defeat:'Derrota',draw:'Empate'}[state.battle.phase]||'Confronto encerrado')+'</h2>'+(state.battle.phase==='victory'?state.rewards.length?'<p>Escolha uma melhoria para a próxima travessia.</p>'+state.rewards.map(r=>'<button data-trail-reward="'+r.id+'" title="'+esc(r.text)+'">'+esc(r.title)+'</button>').join(''):tacticalRoutes.map(r=>'<button data-route="'+r.id+'" title="'+esc(r.text)+'">'+esc(r.title)+'</button>').join(''):'<button data-restart>Nova tentativa</button>')+'</section>':'';
 const scene=combatScene(s.tactical.scene),sceneUrl=scene.art;
 const cinematicImpact=tacticalImpactProfile(state.event,{speed:state.speed,reduced:Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)});
 const activeSpecial=state.event?.type==='skill'&&!state.event.skipped&&['voto','despertar'].includes(String(state.event.abilityId||'').split('/')[0]);
 const comboCounter=state.event?.comboBeat?
  '<span class="compact-combo-counter" role="status" aria-live="off"><strong>COMBO '+state.event.comboBeat+' / '+state.event.comboTotal+'</strong><small>ATAQUE '+state.event.combo.attackHits+' · DEFESA '+state.event.combo.defenseHits+'</small></span>':'';
 root.innerHTML='<div class="combat-shell fortress-battle compact-battle"><header class="combat-header"><a href="/">OBLIVIUM ARENA</a><span>Campo compacto · 6 × 6</span><a href="#compact-formation">Formação</a></header><section class="arena-stage compact-stage" data-scene="'+s.tactical.scene+'" data-hitstop="'+state.hitstop+'" data-impact-shake="'+(cinematicImpact?.shake||'none')+'" style="--compact-scene-image:url(\''+esc(sceneUrl)+'\');--compact-floor-zoom:'+scene.floorZoom+'%;--compact-floor-focus:'+scene.floorFocus+'%;--compact-hit-duration:'+Math.round((activeSpecial?560:420)/state.speed)+'ms;--compact-heal-duration:'+Math.round(460/state.speed)+'ms;--compact-feedback-delay:'+Math.round(36/state.speed)+'ms;--super-duration:'+Math.round(320/state.speed)+'ms"><img class="arena-backdrop" src="'+combatScene(s.tactical.scene).art+'" alt="">'+hud(s)+tacticalCutinMarkup(actorEvent,ability,state.event)+'<div class="arena-field">'+actionDock(s,future)+'<div class="compact-board-stack">'+board(s,future)+tacticalSuperCaptionMarkup(actorEvent,ability,state.event)+comboCounter+'</div></div><div class="compact-playback-tools"><div class="compact-speed" aria-label="Velocidade das animações">'+[1,2,3].map(n=>'<button data-speed="'+n+'" aria-pressed="'+(state.speed===n)+'">'+n+'×</button>').join('')+'<button data-sound aria-label="Som de combate" aria-pressed="'+audioEnabled()+'">♪</button></div></div><p class="compact-explainer">Primeiro as ações ① de todos, depois as ações ②. O personagem permanece na casa atual até a execução.</p>'+eventForecast(s)+reward()+result+'<p class="augment-progression">'+esc(conquestProgressText(s.tactical.fortress.progress))+'</p>'+(rule?'<p class="compact-rule">'+esc(rule.title+' · '+rule.text)+'</p>':'')+'<details class="compact-log"><summary>Resolução da rodada</summary><ol>'+[...state.battle.tactical.events].map(e=>'<li>'+esc(e.title)+(e.skipped?' · '+esc(e.reason):'')+'</li>').join('')+'</ol></details></section>'+clashMarkup()+'<div id="compact-formation">'+setup()+'</div></div>';
 if(effects?.frame)effects.attach(root.querySelector('.board'));
}
function append(ref){
 const result=previewTacticalPlan(tacticalView(state.battle,'player'),'player',[...state.actions,ref]);
 if(!result.ok){state.message=result.reason;render();return;}
 state.actions.push(ref);state.spends={};state.message='';
 if(count(state.selected)>=2){const next=state.battle.allies.find(u=>u.hp>0&&!u.stunned&&count(u.id)<2);if(next)state.selected=next.id;state.mode='move';}
 const available=state.battle.allies.filter(u=>u.hp>0&&!u.stunned);
 // No separate confirmation is needed to execute a complete trio of choices.
 if(available.length&&available.every(u=>count(u.id)===2)){confirm();return;}
 render();
}
function selectCell(point){
 if(locked())return;
 const s=displayed(),future=planned(),u=actor(future),at=future.tactical.positions[u.id],hit=occupied(s,point);
 const selectedAbility=u.abilities.find(a=>a.id===state.mode),allyTarget=['ally','friendly','team'].includes(selectedAbility?.target);
 // Tap an ally to select them, except when deliberately targeting ally-support techniques.
 if(hit?.side==='player'&&hit.id!==u.id&&!allyTarget){state.selected=hit.id;state.mode='move';state.message='';render();return;}
 if(count(u.id)>=2||u.stunned||u.hp<=0)return;
 if(state.mode==='move'){
  const path=findPath(future,u.id,point);if(!path){state.message='Escolha uma casa adjacente destacada.';render();return;}
  append({type:'move',actorId:u.id,path});return;
 }
 const ability=u.abilities.find(a=>a.id===state.mode);if(!ability)return;
 const orientation=[Math.sign(point.x-at.x),Math.sign(point.y-at.y)];
 if(sameCell(point,at))orientation.splice(0,2,...unitFacing(future,u));
 append({...state.spends,type:'skill',actorId:u.id,abilityId:ability.id,formKey:ability.formKey||'base',anchor:point,orientation});
}
function emit(event,unit,ability,phase,duration){
 if(!globalThis.requestAnimationFrame)return;
 if(!effects){const canvas=document.createElement('canvas');canvas.className='tactical-effects-canvas';canvas.setAttribute('aria-hidden','true');effects=new TacticalEffectsLayer(canvas);}
 effects.emit(root.querySelector('.board'),event,unit,phase,duration,{reduced:Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches),projectile:tacticalProjectileKind(unit,ability,event)});
}
async function playback(events,{partial=false}={}){
 const revision=++state.revision;state.busy=true;state.hitstop=false;render();
 const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 // Reduced motion removes travel, not the player's time to read damage or healing.
 const pause=(ms,{holdFeedback=false}={})=>new Promise(resolve=>{
  const delay=holdFeedback&&reduced?Math.max(180,220/state.speed):(reduced?35:ms)/state.speed;
  setTimeout(resolve,delay);
 });
 const pauseExact=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 for(const event of events.flatMap(tacticalComboReplayEvents)){
  if(revision!==state.revision)return;
  if(!event.before||!event.after)continue;
  state.snapshot=event.before;state.event={...event,pose:'announce'};render();
  if(event.type==='reveal'){await pause(550);continue;}
  if(event.type==='exchange-move'){
   for(const step of event.moves){
    const token=root.querySelector('[data-unit-id="'+step.actorId+'"]'),from=root.querySelector('[data-cell="'+cellKey(step.from)+'"]'),to=root.querySelector('[data-cell="'+cellKey(step.to)+'"]');
    const unit=units(state.battle).find(u=>u.id===step.actorId);
    if(token&&unit){paintTacticalToken(token,unit,{...event,type:'move',actorId:unit.id,orientation:event.after.facings[unit.id]}, {family:'move',pose:'airborne',index:3});}
    if(token?.animate&&from&&to&&!reduced){const x=to.offsetLeft-from.offsetLeft,y=to.offsetTop-from.offsetTop;token.animate([{translate:'0 0'},{translate:x*.5+'px '+(y*.5-14)+'px',offset:.5},{translate:x+'px '+y+'px'}],{duration:360/state.speed,fill:'forwards',easing:'ease-in-out'});}
   }
   await pause(360);state.snapshot=event.after;state.event=null;render();
   for(const step of event.moves){
    const mover=units(event.before).find(u=>u.id===step.actorId);
    if(mover)emit({type:'move',actorId:mover.id,before:event.before,after:event.after,anchor:step.to},mover,null,'step',180/state.speed);
   }
   playCombatCue('step');continue;
  }
  const unit=units(event.before).find(u=>u.id===event.actorId),ability=unit?.abilities.find(a=>a.id===event.abilityId);
  const frames=unit&&!event.skipped?(event.type==='guard'?[{family:'guard',pose:'ready',index:0},{family:'guard',pose:'impact',index:1}]:tacticalReplayFrames(unit,ability,{...event,compactReplay:true})):[{family:'support',pose:'impact',index:0}];
  let superCuePlayed=false;
  for(const frame of frames){
   if(revision!==state.revision)return;
   state.event={...event,...frame};const impact=frame.pose==='impact'||frame.pose==='counter';
   if(impact)state.snapshot=event.after;
   // Update the actual board at the telegraph and projectile boundaries.
   // Sprite-only repaints kept the cut-in and target-area overlay invisible until impact.
   const visualBoundary=impact||frame.index===0||!unit||['anticipate','compress','brace','inhale','gather','windup','release','thrust','travel','spread'].includes(frame.pose);
   if(visualBoundary)render();
   else{const token=root.querySelector('[data-unit-id="'+event.actorId+'"]');if(token)paintTacticalToken(token,unit,event,frame);}
   const reactions=impact?tacticalFeedback(event):[];
   const counts=new Map();
   for(const hit of reactions)counts.set(hit.actorId,(counts.get(hit.actorId)||0)+1);
   const feedbackStack=Math.max(1,...counts.values());
   const duration=tacticalCompactFrameDuration(state.event,feedbackStack);
   if(!superCuePlayed&&tacticalCutinActive(state.event)){
    playCombatCue('super',frame.family);superCuePlayed=true;
   }
   if(!event.skipped&&['release','thrust'].includes(frame.pose))playCombatCue('release',frame.family);
   if(!event.skipped&&(impact||['release','thrust','travel'].includes(frame.pose)))
    emit(state.event,unit,ability,impact?'impact':frame.pose==='thrust'?'release':frame.pose,(reduced?35:duration)/state.speed);
   if(impact&&!event.skipped){
    playCombatCue('contact',frame.family);
    const hit=tacticalImpactProfile(state.event,{speed:state.speed,reduced});
    if(hit?.hitstopMs){
     // Freeze actual canvas VFX, feedback CSS and actor recoil at the same frame.
     // Does not pause the motor: the simultaneous round was already resolved.
     state.hitstop=true;
     root.querySelector('.compact-stage')?.setAttribute('data-hitstop','true');
     effects?.freeze(hit.hitstopMs);
     await pauseExact(hit.hitstopMs);
     state.hitstop=false;
     if(revision!==state.revision)return;
     root.querySelector('.compact-stage')?.setAttribute('data-hitstop','false');
    }
   }
   await pause(duration,{holdFeedback:impact});
  }
  state.snapshot=event.after;
 }
 if(revision!==state.revision)return;
 if(partial){state.event=null;state.hitstop=false;render();return;}
 state.snapshot=null;state.event=null;state.hitstop=false;state.busy=false;state.actions=[];state.mode='move';state.message='';
 state.selected=state.battle.allies.find(u=>u.hp>0&&!u.stunned)?.id||state.battle.allies[0].id;
 if(state.battle.phase==='victory')state.rewards=offerTacticalRewards(state.run,state.battle);
 render();
}
// The opponent's score is a bounded deterministic AI response.
 // The human acts for the attacking or defending team, even in solo play.
// The animation communicates the contact; the player decides whether
// to time an offensive input or defend with a forgiving dodge / risky parry.
function interactiveCombo(ref){
 const reduced=Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
 if(reduced)return Promise.resolve({attacks:[],defenses:[]});
 const role=ref.side==='player'?'attack':'defense',current=state.battle;
 const beats=ref.beats||tacticalReactiveBeats(ref.actor,ref.ability,tacticalAnimationFamily(ref.ability));
 const human=[],attacksAI=tacticalReactiveAI(beats,{side:'attack',round:current.round,
  actorId:ref.actorId,abilityId:ref.abilityId});
 const defensesAI=tacticalReactiveAI(beats,{side:'defense',round:current.round,
  actorId:ref.actorId,abilityId:ref.abilityId});
 const position=current.tactical.positions[ref.actorId],before={
  allies:current.allies,enemies:current.enemies,positions:current.tactical.positions,
  width:current.tactical.width,height:current.tactical.height
 };
 const anchor=ref.anchor||position,area=tacticalArea(current,ref.actor,ref.ability,anchor,ref.orientation);
 const target=ref.targets.find(id=>current.allies.some(unit=>unit.id===id))||ref.targets[0];
 state.snapshot=before;
 state.event={type:'skill',actorId:ref.actorId,abilityId:ref.abilityId,
  family:tacticalAnimationFamily(ref.ability),anchor,orientation:ref.orientation,
  cells:area,before,after:before,pose:'anticipate',
  title:role==='attack'?'Execução ativa · '+ref.ability.name:'Reação ao ataque · '+ref.ability.name};
 return new Promise(resolve=>{
  const value={role,beats,beat:1,hits:0,locked:false,feedback:'',actorName:ref.actor.name,
   abilityName:ref.ability.name,startedAt:0,progress:0,completed:false,timer:null,
   cueTimer:null,transitionTimer:null,press:null,skip:null};
  const clear=()=>{clearTimeout(value.timer);clearTimeout(value.cueTimer);clearTimeout(value.transitionTimer);};
  const complete=neutral=>{
   if(value.completed)return;
   value.completed=true;clear();state.clash=null;state.event=null;
   const answer=neutral?{attacks:[],defenses:[]}:role==='attack'
    ?{attacks:human,defenses:defensesAI}:{attacks:attacksAI,defenses:human};
   state.snapshot=before;render();resolve(answer);
  };
  const begin=()=>{
   if(value.completed)return;
   clear();value.locked=false;value.feedback='';value.progress=0;state.clash=value;
   state.event={...state.event,pose:value.beats[value.beat-1].pose};
   render();value.startedAt=performance.now();
   const beat=value.beats[value.beat-1];
   value.cueTimer=setTimeout(()=>{
    if(value.completed||value.locked)return;
    root.querySelector('.compact-rhythm-clash')?.setAttribute('data-combo-cue','incoming');
    root.querySelector('.compact-stage')?.setAttribute('data-reactive-telegraph',beat.kind);
    const marker=root.querySelector('[data-unit-id="'+(role==='defense'?target:ref.actorId)+'"]');
    marker?.setAttribute('data-reactive-target',role);
    playCombatCue('release',state.event?.family||'strike');
    emit({...state.event,pose:'release'},ref.actor,ref.ability,'release',210);
   },Math.max(100,beat.impactMs-240));
   value.timer=setTimeout(()=>finish('none'),beat.duration);
  };
  const finish=action=>{
   if(value.completed||value.locked)return;
   const beat=value.beats[value.beat-1];
   value.locked=true;clearTimeout(value.timer);clearTimeout(value.cueTimer);
   const elapsed=performance.now()-value.startedAt;
   const outcome=tacticalReactiveJudge(beat,action,elapsed);
   human.push(outcome);
   value.progress=Math.max(0,Math.min(1,elapsed/beat.duration));
   if(outcome.success)value.hits++;
   value.feedback=outcome.success
    ?action==='parry'?'APARO PERFEITO!':action==='dodge'?'ESQUIVA!':action==='jump'?'SALTO CERTO!':'GOLPE PRECISO!'
    :action==='none'?'GOLPE RECEBIDO':action==='parry'?'APARO FORA DO TEMPO':'TEMPO INCORRETO';
   state.event={...state.event,pose:outcome.success&&action==='parry'?'counter':'impact'};
   render();
   root.querySelector('.compact-rhythm-clash')?.setAttribute('data-combo-cue',outcome.success?'success':'miss');
   if(outcome.success){
    playCombatCue('contact',outcome.action==='parry'?'counter':state.event?.family||'strike');
    if(role==='defense'){
     const guarded=current.allies.find(u=>u.id===target);
     const location=before.positions[guarded?.id];
     if(guarded&&location){
      if(action==='dodge'||action==='jump')
       root.querySelector('[data-unit-id="'+guarded.id+'"]')?.setAttribute('data-reactive-evade',action);
      if(action==='parry')
       emit({type:'guard',actorId:guarded.id,before,after:before,anchor:location,
        family:'counter',cells:[location]},guarded,null,'prepare',260);
     }
    }
   }
   value.transitionTimer=setTimeout(()=>{
    if(value.completed)return;
    if(value.beat>=beats.length)complete(false);
    else{value.beat++;begin();}
   },outcome.success?260:185);
  };
  value.press=action=>finish(action);
  value.skip=()=>complete(true);
  begin();
 });
}
async function playCompactSession(session){
 const id=job;
 await playback(session.events,{partial:true});
 while(id===job){
  const pending=session.peek();
  const contest=pending?.comboEligible?await interactiveCombo(pending):{};
  if(id!==job)return;
  const next=session.next(contest);
  if(!next.ok)throw Error(next.reason||'Etapa tática inválida');
  if(next.events.length||next.done)await playback(next.events,{partial:!next.done});
  if(next.done)return;
 }
}
function finishPlan(id,round,plan){
 if(id!==job||round!==state.battle.round||!state.busy)return;
 const result=submitTacticalPlan(state.battle,'enemy',plan||[]);
 if(!result.ok){if(state.battle.tactical.stage==='planning')delete state.battle.tactical.plans.player;state.message=result.reason;state.busy=false;render();return;}
 const session=startCompactRoundResolution(state.battle);
 if(session.ok)playCompactSession(session).catch(error=>{
  // Never strand the duel in tactical.stage='resolving' after a UI failure.
  // Complete only the remaining canonical steps, with neutral rhythm scores.
  for(let attempts=0;attempts<26;attempts++){
   const step=session.next();
   if(!step.ok||step.done)break;
  }
  state.busy=false;state.clash=null;state.event=null;state.snapshot=null;state.actions=[];
  state.message='Apresentação interrompida; rodada concluída sem bônus adicional. '+(error?.message||'');
  render();
 });
 else{state.busy=false;state.message=session.reason;render();}
}
function confirm(){
 if(locked())return;
 const view=tacticalView(state.battle,'enemy'),result=submitTacticalPlan(state.battle,'player',state.actions);
 if(!result.ok){state.message=result.reason;render();return;}
 const id=++job,round=state.battle.round;state.busy=true;render();
 aiTask={id,round,view};
 const fallback=()=>setTimeout(()=>{if(aiTask?.id===job)finishPlan(aiTask.id,aiTask.round,planTacticalAI(aiTask.view));},0);
 if(typeof Worker!=='function'){fallback();return;}
 try{
  if(!worker){worker=new Worker(new URL('./tactical-ai-worker.js',import.meta.url),{type:'module'});worker.addEventListener('message',({data})=>{if(data.id===job&&aiTask)finishPlan(data.id,aiTask.round,data.failed?planTacticalAI(aiTask.view):data.plan);});worker.addEventListener('error',()=>{worker.terminate();worker=null;fallback();});}
  worker.postMessage({id,view});
 }catch{fallback();}
}
function start(player=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],enemy=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'],config={}){
 job++;state.revision++;state.clash?.skip?.();state.clash=null;effects?.clear();
 try{state.battle=createTacticalBattle(player,enemy,{...config,seed:config.seed||state.seed,fortress:true,compact:true,augmentProgress:state.run.augmentProgress});}catch(error){state.message=error.message;if(state.battle)render();return;}
 Object.assign(state,{actions:[],busy:false,snapshot:null,event:null,message:'',mode:'move',rewards:[],selected:state.battle.allies.find(u=>u.hp>0&&!u.stunned)?.id||state.battle.allies[0].id});render();
}
root.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button||button.disabled)return;const d=button.dataset;
 if(state.clash){if('comboStrike'in d)state.clash.press?.('strike');else if('comboDodge'in d)state.clash.press?.('dodge');else if('comboParry'in d)state.clash.press?.('parry');else if('comboJump'in d)state.clash.press?.('jump');else if('comboSkip'in d)state.clash.skip?.();return;}
 if(d.speed){state.speed=Number(d.speed);render();return;}
 if('sound'in d){setAudioEnabled(!audioEnabled());render();return;}
 if(state.busy)return;
 const pending=state.battle.tactical.pendingChestRewards[0];
 if('reward'in d){if(!pending)return;const result=chooseTacticalChestReward(state.battle,pending.id,d.reward);state.message=result.ok?'':result.reason;if(result.ok)saveProgress();render();return;}
 if('reroll'in d){if(pending){const result=rerollTacticalChestReward(state.battle,pending.id);state.message=result.ok?'':result.reason;if(result.ok)saveProgress();render();}return;}
 if(pending)return;
 if('restart'in d){
  const select=side=>[0,1,2].map(i=>root.querySelector('[data-team="'+side+'"][data-index="'+i+'"]')?.value||(side==='player'?state.battle.allies:state.battle.enemies)[i].sourceId||(side==='player'?state.battle.allies:state.battle.enemies)[i].id);
  state.run=createTacticalRun(progress());start(select('player'),select('enemy'),{scene:root.querySelector('select[data-scene]')?.value,environment:root.querySelector('[data-environment]')?.value});return;
 }
 if('trailReward'in d){if(chooseTacticalReward(state.run,state.rewards,d.trailReward)){state.rewards=[];render();}return;}
 if('route'in d){const next=advanceTacticalRun(state.run,state.battle,d.route);if(next)start(next.player,next.enemy,next);return;}
 if(locked())return;
 if(d.spend){state.spends[d.spend]=Number(d.amount);render();return;}
 if(d.shadow){const result=chooseTacticalShadow(state.battle,'player',state.selected,d.shadow);state.message=result.ok?'':result.reason;render();return;}
 if(d.actor){state.selected=d.actor;state.spends={};state.mode='move';state.message='';render();return;}
 if('mode'in d){state.mode=d.mode;state.spends={};state.message='';render();return;}
 if('technique'in d){state.mode=d.technique;state.spends={};state.message='Toque na casa onde a técnica será aplicada.';render();return;}
 if(d.cell){const [x,y]=d.cell.split(',').map(Number);selectCell({x,y});return;}
 if('removeIndex'in d){
  const index=Number(d.removeIndex);
  if(!Number.isInteger(index)||index<0||index>=state.actions.length)return;
  const [removed]=state.actions.splice(index,1);
  const valid=[],view=tacticalView(state.battle,'player');
  for(const action of state.actions)if(previewTacticalPlan(view,'player',[...valid,action]).ok)valid.push(action);
  state.actions=valid;state.selected=removed.actorId;state.mode='move';state.spends={};state.message='';render();return;
 }
 if('undo'in d){state.actions.pop();state.message='';render();return;}
 if('clear'in d){state.actions=[];state.message='';render();return;}
 if('confirm'in d)confirm();
});
root.addEventListener('pointerover',event=>{
 const cell=event.target.closest('[data-cell]');if(!cell||locked()||state.mode==='move')return;
 for(const e of root.querySelectorAll('.cell.aim'))e.classList.remove('aim');
 const s=planned(),u=actor(s),a=u.abilities.find(a=>a.id===state.mode);if(!a)return;
 const [x,y]=cell.dataset.cell.split(',').map(Number),origin=s.tactical.positions[u.id],orientation=[Math.sign(x-origin.x),Math.sign(y-origin.y)];
 if(!orientation[0]&&!orientation[1])orientation.splice(0,2,...unitFacing(s,u));
 for(const p of tacticalArea(s,u,a,{x,y},orientation))root.querySelector('[data-cell="'+cellKey(p)+'"]')?.classList.add('aim');
});
document.addEventListener('keydown',event=>{
 if(state.clash){
  if(event.key==='Escape'){event.preventDefault();state.clash.skip?.();return;}
  if(event.repeat)return;
  const active=state.clash,kind=active.beats[active.beat-1]?.kind;
  const key=event.code==='Space'?active.role==='attack'?'strike':kind==='sweep'?'jump':'dodge':
   event.code==='Enter'?active.role==='attack'?'strike':'parry':
   event.code==='KeyD'?'dodge':event.code==='KeyE'?'parry':event.code==='KeyW'?'jump':null;
  if(key){event.preventDefault();active.press?.(key);}return;
 }
 if(event.target.matches('input,select,textarea,[contenteditable="true"]')||locked())return;
 if(event.code==='Space'&&!event.repeat){event.preventDefault();confirm();}
 else if(['1','2','3'].includes(event.key)){state.selected=state.battle.allies[Number(event.key)-1].id;state.mode='move';render();}
 else if(event.key==='Escape'){state.mode='move';state.message='';render();}
});
start();
