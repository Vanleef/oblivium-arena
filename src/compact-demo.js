import {TacticalSceneGround} from './tactical-scene-ground.js';
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
import {tacticalDuelOptions,tacticalDuelResolve,tacticalDuelAI,tacticalDuelTendency} from './tactical-duel.js';
import {tacticalHand,tacticalCardDeck,tacticalResponseOptions,tacticalCard,tacticalCardVariants,tacticalMovementSteps,defaultTacticalCardBuild} from './tactical-decks.js';
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
import {tacticalHandFanStyle,tacticalCardArtMarkup,restoreTacticalHand,tacticalCardPresentation,tacticalCardTraitsMarkup,tacticalUtilityArtMarkup,handleTacticalCardArtError} from './tactical-card-presentation.js';
const root=document.getElementById('tactical-app');
root.addEventListener('error',handleTacticalCardArtError,true);
const sceneGround=new TacticalSceneGround();
const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const key='oblivium-conquest-augment-progress-v2',profileKey='pma-post-mortem-arena-v1';
function progress(){try{const stored=conquestProgress(JSON.parse(localStorage.getItem(key)||'{}')),profile=JSON.parse(localStorage.getItem(profileKey)||'null');return profile?syncConquestCampaign(profile,stored):stored;}catch{return conquestProgress();}}
const cardBuildKey='oblivium-campaign-card-builds-v1';
const readCardBuilds=()=>{try{return JSON.parse(localStorage.getItem(cardBuildKey)||'{}')}catch{return {}}};
const state={battle:null,run:createTacticalRun(progress()),actions:[],spends:{},selected:null,mode:'move',selectedCard:null,pendingAction:null,dragCardId:null,busy:false,snapshot:null,event:null,message:'',speed:1,seed:1,revision:0,rewards:[],hitstop:false,clash:null,handCollapsed:false};
state.run.cardDecks=readCardBuilds();
function saveCardBuilds(){try{localStorage.setItem(cardBuildKey,JSON.stringify(state.run.cardDecks||{}))}catch{}}
function preserveCardBuilds(){
 state.run.cardDecks??={};
 for(const unit of state.battle.allies){
  const deck=tacticalCardDeck(state.battle,'player',unit.id);
  if(deck)state.run.cardDecks[unit.sourceId||unit.id]=Object.values(deck.cards).map(card=>({kind:card.kind,abilityId:card.abilityId,variantId:card.variantId,upgrade:card.upgrade}));
 }
 saveCardBuilds();
}
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
const actionArea=(s,ref)=>{const unit=units(s).find(u=>u.id===ref?.actorId),ability=unit?.abilities.find(a=>a.id===ref?.abilityId);return ref?.type==='skill'&&unit&&ability?tacticalArea(s,unit,ability,ref.anchor,ref.orientation):ref?.type==='move'?ref.path||[]:[];};
function facingTo(s,unit,point){const origin=s.tactical.positions[unit.id],orientation=[Math.sign(point.x-origin.x),Math.sign(point.y-origin.y)];if(!orientation[0]&&!orientation[1])orientation.splice(0,2,...unitFacing(s,unit));return orientation;}
function defaultAim(s,unit,ability){
 const origin=s.tactical.positions[unit.id],support=['ally','friendly','team'].includes(ability.target);
 if(['self','team'].includes(ability.target))return {...origin};
 const targets=(support?s.allies:s.enemies).filter(target=>target.hp>0).sort((a,b)=>support?(a.hp/a.maxHp-b.hp/b.maxHp):(Math.max(Math.abs(s.tactical.positions[a.id].x-origin.x),Math.abs(s.tactical.positions[a.id].y-origin.y))-Math.max(Math.abs(s.tactical.positions[b.id].x-origin.x),Math.abs(s.tactical.positions[b.id].y-origin.y))));
 const desired=targets.length?s.tactical.positions[targets[0].id]:origin;
 const candidates=[desired,...boardCells(s).filter(p=>!sameCell(p,desired)).sort((a,b)=>Math.max(Math.abs(a.x-desired.x),Math.abs(a.y-desired.y))-Math.max(Math.abs(b.x-desired.x),Math.abs(b.y-desired.y)))];
 return candidates.find(point=>tacticalArea(s,unit,ability,point,facingTo(s,unit,point)).length)||{...origin};
}
function skillActionAt(unit,ability,anchor,cardId=state.selectedCard){return {...state.spends,type:'skill',actorId:unit.id,abilityId:ability.id,formKey:ability.formKey||'base',anchor:{...anchor},orientation:facingTo(planned(),unit,anchor),...(cardId?{cardId}:{})};}
function activateCard(card,anchor=null){
 if(!card||card.kind==='reaction')return;
 const s=planned(),unit=actor(s),ability=card.kind==='skill'?unit.abilities.find(item=>item.id===card.abilityId):null;
 if(card.kind==='skill'&&!ability)return;
 state.mode=card.kind==='mobility'?'mobility':card.abilityId;state.selectedCard=card.id||null;state.spends={};state.pendingAction=null;
 if(card.kind==='skill')state.pendingAction=skillActionAt(unit,ability,anchor||defaultAim(s,unit,ability),card.id||null);
 else if(anchor){const path=findPath(s,unit.id,anchor,tacticalMovementSteps(card));if(path?.length)state.pendingAction={type:'move',actorId:unit.id,path,cardId:card.id||null};}
 state.message=card.kind==='mobility'?'Escolha um destino destacado; depois toque no caminho ou pressione Espaço para confirmar.':'Área marcada: toque em uma casa contornada ou pressione Espaço para confirmar.';render();
}
function confirmPendingAction(){if(!state.pendingAction)return;const action=state.pendingAction,result=previewTacticalPlan(tacticalView(state.battle,'player'),'player',[...state.actions,action]);if(!result.ok){state.message=result.reason;render();return;}state.pendingAction=null;append(action);}
function cancelTargeting({renderNow=true}={}){state.pendingAction=null;state.selectedCard=null;state.mode='move';state.spends={};state.message='Ação cancelada.';if(renderNow)render();}
function saveProgress(){state.run.augmentProgress=conquestProgress(state.battle.tactical.fortress.progress);try{localStorage.setItem(key,JSON.stringify(state.battle.tactical.fortress.progress));}catch{}}
function figure(unit,s){
 const current=state.event?.actorId===unit.id?state.event:null,facing=current?.orientation||unitFacing(s,unit),frame=tacticalSpriteFrame(unit,current,facing),superFocus=tacticalCutinActive(current);
 const sign=frame?.directional?1:facing[0]<0?-1:1;
 const statuses=tacticalStatuses(unit,s),layers=[...new Set(statuses.map(e=>e.id.startsWith('dot:')?'affliction':e.id.startsWith('mark:')?'marked':e.id.startsWith('surface:')?'terrain-'+e.id.slice(8):e.id))],orders=!state.busy&&unit.side==='player'?state.actions.filter(a=>a.actorId===unit.id):[];
 const sprite=frame?'<span class="token-sprite"><span class="sprite-viewport"><img class="sprite-sheet" src="'+esc(frame.src)+'" alt="" style="'+tacticalSpriteInline(frame)+'"></span></span>':unit.art?.portrait?'<img class="token-art" src="'+esc(unit.art.portrait)+'" alt="">':'<i class="arena-creature-mark">'+esc(unit.symbol||'◆')+'</i>';
 const indicators=orders.map((action,i)=>'<b data-action-kind="'+action.type+'" title="'+esc((i+1)+'ª ação · '+actionName(unit,action))+'" aria-label="'+esc(actionName(unit,action))+'"><span class="compact-order-symbol">'+actionGlyph(unit,action)+'</span><span class="compact-order-step">'+(i+1)+'</span></b>').join('');
 return '<span class="token '+unit.side+'" data-unit-id="'+esc(unit.id)+'" data-family="'+esc(current?.family||'idle')+'" data-pose="'+esc(current?.pose||'ready')+'" data-super-active="'+superFocus+'" data-sprite="'+Boolean(frame)+'" data-idle-atlas="false" style="'+tacticalFigureStyle(unit)+tacticalIdleStyle(unit)+'--facing-sign:'+sign+';--upgrade-growth:'+objectiveGrowth(unit.objectiveAugments||0)+';--pose-duration:'+tacticalFrameDuration(current||{})+'ms"><span class="compact-ground-shadow" aria-hidden="true"></span><span class="conquest-model">'+sprite+'</span>'+(unit.id===state.selected&&!state.busy?'<i class="selected-unit-arrow" aria-hidden="true"></i>':'')+'<span class="tactical-status-vfx" aria-hidden="true">'+layers.map(layer=>'<i data-status-vfx="'+esc(layer)+'"></i>').join('')+'</span>'+(orders.length?'<span class="compact-token-orders" aria-hidden="true">'+indicators+'</span>':'')+'</span>';
}
const emblem=tier=>'<span class="objective-pulse" data-tier="'+tier+'" aria-hidden="true"><i></i><b class="objective-emblem"><svg viewBox="0 0 64 64"><path class="objective-gem" d="M32 6 48 21 44 43 32 54 20 43 16 21Z"/><path class="objective-facets" d="m32 6-8 18 8 30 8-30Zm-16 15 16 9 16-9M20 43l12-13 12 13"/></svg></b></span>';
function board(s,future=planned()){
 const owner=actor(s),canMove=!locked()&&(state.mode==='move'||state.mode==='mobility')&&count(owner.id)<2,goal=s.tactical.objectives?.player;
 const event=state.event,phase=tacticalAreaPhase(event),pending=state.pendingAction,pendingActor=pending?.type==='skill'?units(s).find(u=>u.id===pending.actorId):null,pendingAbility=pendingActor?.abilities.find(a=>a.id===pending.abilityId),pendingCells=new Set(pendingActor&&pendingAbility?tacticalArea(s,pendingActor,pendingAbility,pending.anchor,pending.orientation).map(cellKey):[]),activeCells=new Set([...(phase?tacticalVisualCells(event).map(cellKey):[]),...pendingCells]),destinations=new Map();
 if(pending?.anchor){pendingCells.add(cellKey(pending.anchor));activeCells.add(cellKey(pending.anchor));}
 const beforeActor=event?.before&&units(event.before).find(u=>u.id===event.actorId),ability=beforeActor?.abilities?.find(a=>a.id===event.abilityId);
 const areaActor=phase?beforeActor:pendingActor,areaAbility=phase?ability:pendingAbility,visualPhase=phase||(pendingCells.size?'preview':null);
 const tone=tacticalTechniqueTone(areaActor,areaAbility,event),feedback=phase==='impact'?tacticalFeedback(event):[];
 const castColors=tacticalActorPalette(areaActor),castStyle=tacticalPaletteVariables(castColors);
 const castOrigin=phase?event?.before?.positions?.[event.actorId]:pendingActor?s.tactical.positions[pendingActor.id]:null;
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
  const living=occupied(s,p),fallen=!living?fallenByCell.get(cellKey(p)):null,unit=living||fallen,path=canMove?findPath(future,owner.id,p,state.mode==='mobility'?tacticalMovementSteps(tacticalCard(state.battle,'player',owner.id,state.selectedCard)):undefined):null,objective=goal&&sameCell(goal.position,p),surface=surfaceAt(s,p),blocked=s.tactical.obstacles.some(q=>sameCell(q,p)),destination=destinations.get(cellKey(p));
  const inArea=activeCells.has(cellKey(p)),isOrigin=Boolean(visualPhase&&castOrigin&&sameCell(p,castOrigin)),isAnchor=Boolean((event?.anchor&&sameCell(p,event.anchor))||(pending?.anchor&&sameCell(p,pending.anchor))),reactions=feedbackByCell.get(cellKey(p))||[],heavy=reactions.some(r=>r.kind==='damage'||r.kind==='shield-loss'),restored=reactions.some(r=>r.kind==='heal'||r.kind==='shield');
  const contact=contactsByCell.get(cellKey(p)),recoil=tacticalContactRecoil(contact,profile,{mobile:globalThis.innerWidth<=760});
  return '<button class="cell '+(path?'reachable ':'')+(blocked?'blocked ':'')+(objective?'objective-cell objective-'+goal.tier+' ':'')+(inArea?'compact-ability-area compact-'+(visualPhase||'')+' ':'')+(isOrigin?'compact-cast-origin-cell ':'')+(isAnchor?'compact-cast-anchor-cell ':'')+(pending?.type==='move'&&pending.path?.some(step=>sameCell(step,p))?'compact-pending-path ':'')+(pending?.type==='move'&&sameCell(pending.path?.at(-1),p)?'compact-pending-destination ':'')+(heavy?'compact-hit-damage ':'')+(restored?'compact-hit-heal ':'')+(fallen?'compact-defeated ':'')+(contact?'compact-hit-body ':'')+'" data-cell="'+cellKey(p)+'" data-impact-family="'+esc(contact?profile.family:'none')+'" data-impact-reaction="'+esc(contact?.reaction||'none')+'" style="z-index:'+(p.y*10+(unit?10:0))+';--hit-recoil-x:'+(recoil?.x||0)+'px;--hit-recoil-y:'+(recoil?.y||0)+'px" aria-label="'+cellLabel(p)+(unit?', '+esc(unit.name)+(fallen?', derrotado':', '+(unit.side==='player'?'aliado':'inimigo')+', Vida '+unit.hp):', vazia')+(objective?', objetivo '+augmentTiers[goal.tier].label:'')+(path?', movimento disponível, 1 casa':'')+(inArea?', na área '+(visualPhase==='impact'?'atingida':'indicada')+' da técnica':'')+(isAnchor?', centro da ação':'')+(isOrigin?', origem do golpe':'')+(surface?', '+esc(elements[surface.element]?.surface||surface.element):'')+'" '+(locked()?'disabled':'')+'><span class="coord">'+cellLabel(p)+'</span>'+(objective?emblem(goal.tier):'')+(surface?'<span class="element-floor" data-element="'+surface.element+'" aria-hidden="true"></span>':'')+(destination?'<span class="compact-planned-destination" aria-hidden="true">↳</span>':'')+(inArea?'<span class="compact-area-sigil" data-effect-tone="'+tone+'" data-attack-family="'+esc(event?.family||'none')+'" data-phase="'+(visualPhase||'')+'" data-area-role="'+(isAnchor?'anchor':'affected')+'" data-actor-palette="'+Boolean(castColors)+'" style="'+castStyle+'" aria-hidden="true"></span>':'')+(isOrigin?'<span class="compact-cast-origin" aria-hidden="true"></span>':'')+(unit?figure(unit,s):'')+(reactions.length?'<span class="compact-impact-feedback" aria-live="off">'+reactions.map((r,i)=>'<b data-feedback-kind="'+r.kind+'" style="--feedback-index:'+i+'" title="'+esc(r.label)+'">'+esc(r.label)+'</b>').join('')+'</span>':'')+'</button>';
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
 const queuedCards=new Set(state.actions.map(ref=>ref.cardId).filter(Boolean));
 const cards=tacticalHand(state.battle,'player',u.id),deck=tacticalCardDeck(state.battle,'player',u.id);
 const basic=u.abilities.find(a=>a.id==='fortress-basic'),handSize=cards.length+1+(basic?1:0);
 const abilityButtons=cards.map((card,index)=>{
  const chosen=state.selectedCard===card.id,spent=queuedCards.has(card.id),fan=tacticalHandFanStyle(index+1,handSize);
  const details=tacticalCardPresentation(future,u,card),traits=tacticalCardTraitsMarkup(details.traits,esc);
  if(card.kind==='reaction')return '<div class="compact-hand-card compact-hand-reaction" data-card-kind="reaction" style="'+fan+'" title="'+esc(details.description)+'"><strong>'+esc(details.name)+'</strong>'+tacticalUtilityArtMarkup(u,'reaction',esc)+'<small>'+esc(details.description)+'</small>'+traits+tacticalAreaDiagramMarkup({pattern:'self',range:0,length:1})+'</div>';
  if(card.kind==='mobility')return '<button class="compact-hand-card compact-hand-mobility" draggable="true" data-card-kind="mobility" data-planned="'+spent+'" data-card="'+esc(card.id)+'" aria-pressed="'+chosen+'" title="'+esc(details.description)+'" style="'+fan+'" '+(unavailable||spent?'disabled':'')+'><strong>'+esc(details.name)+'</strong>'+tacticalUtilityArtMarkup(u,'mobility',esc)+'<small>'+esc(details.description)+'</small>'+traits+tacticalAreaDiagramMarkup(null,{movement:true,steps:tacticalMovementSteps(card)})+'</button>';
  const a=details.ability;if(!a)return '';
  const reason=skillSealReason(u,a)||tacticalRequirementReason(future,u,a);
  const spec=fortressTechniqueSpec(future,u,a),area=tacticalAreaDiagramMarkup(spec,{facing:unitFacing(future,u)});
  const label=reason||details.description;
  return '<button class="compact-hand-card compact-hand-skill" draggable="true" data-card-kind="skill" data-card="'+esc(card.id)+'" data-technique="'+esc(a.id)+'" data-planned="'+spent+'" aria-pressed="'+chosen+'" title="'+esc(a.name+' — '+tacticalPatternLabel(spec)+' · '+label)+'" style="'+fan+tacticalPaletteVariables(tacticalActorPalette(u,{realmFallback:true}))+'" '+(unavailable||spent||reason?'disabled':'')+'><strong>'+esc(details.name)+'</strong>'+tacticalCardArtMarkup(a,esc)+'<small>'+esc(details.description)+'</small>'+tacticalCardTraitsMarkup(details.traits,esc)+area+'<span class="hand-card-area-label">Área: '+esc(tacticalPatternLabel(spec))+'</span></button>';
 }).join('');
 const moveButton='<button class="compact-hand-card compact-hand-mobility" draggable="true" data-card-kind="mobility" data-mode="move" aria-pressed="'+(state.mode==='move'&&!state.selectedCard)+'" style="'+tacticalHandFanStyle(0,handSize)+'" '+(unavailable||state.actions.some(ref=>ref.actorId===u.id&&ref.type==='move'&&!ref.cardId)?'disabled':'')+'><strong>Mover</strong>'+tacticalUtilityArtMarkup(u,'mobility',esc)+'<small>Ação permanente · 1 casa</small>'+tacticalAreaDiagramMarkup(null,{movement:true})+'</button>';
 const basicDescription=basic?tacticalCardPresentation(future,u,{kind:'skill',abilityId:basic.id}).description:'';
 const basicButton=basic?'<button class="compact-hand-card compact-hand-basic" draggable="true" data-card-kind="basic" data-technique="fortress-basic" aria-pressed="'+(state.mode==='fortress-basic'&&!state.selectedCard)+'" style="'+tacticalHandFanStyle(handSize-1,handSize)+'" '+(unavailable?'disabled':'')+'><strong>Ataque básico</strong>'+tacticalUtilityArtMarkup(u,'basic',esc)+'<small>'+esc(basicDescription)+' · ação permanente sem custo de Essência.</small>'+tacticalAreaDiagramMarkup(fortressTechniqueSpec(future,u,basic),{facing:unitFacing(future,u)})+'</button>':'';
 const handCounter='<div class="compact-hand-counter"><strong>Mão de '+esc(u.name)+'</strong><span><b>'+cards.length+'</b> na mão <i>·</i> <b>'+(deck?.draw.length||0)+'</b> para comprar <i>·</i> <b>'+(deck?.discard.length||0)+'</b> no descarte</span><small class="card-cycle-hint">Usadas voltam ao ciclo quando a compra se esgota</small></div>';
 const advance=specialChoices(u,picked,unavailable);
 const advanced=advance?'<details class="compact-panel-advanced"><summary aria-label="Opções avançadas da técnica" title="Opções avançadas da técnica">✧</summary>'+advance+'</details>':'';
 const selected=cards.find(card=>card.id===state.selectedCard)||(state.mode==='fortress-basic'?{kind:'skill',abilityId:'fortress-basic'}:null);
 const detail=selected?tacticalCardPresentation(future,u,selected):null;
 const selectedDescription=detail?'<p class="hand-card-detail"><b>'+esc(detail.name)+'</b> · '+esc(detail.description)+(detail.traits.length?' · '+esc(detail.traits.join(' · ')):'')+'</p>':'';
 const hand='<section class="tactical-hand-dock" aria-label="Mão de cartas" '+(state.busy||state.clash||state.battle.tactical.stage!=='planning'?'hidden':'')+'><div class="tactical-hand-header">'+handCounter+'<button type="button" data-hand-toggle aria-expanded="'+!state.handCollapsed+'">'+(state.handCollapsed?'Mostrar mão':'Recolher mão')+'</button></div><div class="tactical-hand-content" '+(state.handCollapsed?'hidden':'')+'><div class="compact-area-legend" aria-label="No desenho das áreas, centro claro é a origem e casas coloridas são atingidas"><span><i data-legend="origin"></i>Origem</span><span><i data-legend="hit"></i>Área</span></div><div class="compact-quick-buttons tactical-hand-cards" role="group" aria-label="Cartas do personagem selecionado">'+moveButton+abilityButtons+basicButton+'</div>'+selectedDescription+advanced+'</div></section>';
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
 const response=state.battle.tactical.decks?.responses.player??1;
 return '<aside class="compact-action-hub compact-command-panel" data-response-left="'+response+'" data-panel-locked="'+Boolean(unavailable)+'" aria-busy="'+state.busy+'" aria-label="Comandos de '+esc(u.name)+'">'+portraits+'<div class="compact-response-count">Respostas disponíveis: '+response+'</div>'+plan+'</aside>'+hand;
}
function reward(){
 const offer=state.battle.tactical.pendingChestRewards[0];
 if(!offer||state.busy)return '';
 const owner=units(state.battle).find(u=>u.id===offer.actorId);
 const entries=offer.options.map(o=>{
  const isCard=o.effect?.type==='tactical-card-upgrade';
  const deck=isCard?tacticalCardDeck(state.battle,'player',offer.actorId):null;
  const candidates=deck?Object.values(deck.cards).filter(card=>card.kind==='skill'):[];
  const picker=isCard?'<label class="compact-card-reward-picker">Aprimorar carta<select data-card-target aria-label="Escolha uma carta para aprimorar">'+candidates.map(card=>'<option value="'+esc(card.id)+'">'+esc(card.name)+'</option>').join('')+'</select></label>':'';
  return '<div class="compact-card-reward">'+picker+'<button data-reward="'+esc(o.id)+'" title="'+esc(o.text)+'"><strong>'+esc(o.title)+'</strong><span>'+esc(o.text)+'</span></button></div>';
 }).join('');
 return '<section class="chest-reward panel" data-tier="'+offer.tier+'"><h2>'+esc(owner?.name)+' · '+augmentTiers[offer.tier].label+'</h2><p>Escolha uma melhoria individual para este combate.</p><div class="chest-options">'+entries+'</div>'+((state.battle.tactical.fortress.progress.spins||0)>0?'<button data-reroll>Trocar opções · 1 Giro</button>':'')+'</section>';
}
function deckDraftFor(unit){
 const id=unit.sourceId||unit.id,deck=tacticalCardDeck(state.battle,'player',unit.id);
 return state.run.cardDecks?.[id]||Object.values(deck?.cards||{}).map(card=>({kind:card.kind,abilityId:card.abilityId,variantId:card.variantId,upgrade:card.upgrade}));
}
function deckKindLabel(card){
 return card.variantId?'Campanha':card.kind==='skill'?'Técnica':card.kind==='mobility'?'Mobilidade':'Reação';
}
function deckCardDescription(unit,card){
 return tacticalCardPresentation(state.battle,unit,card).description||'Efeito da carta.';
}
function refreshDeckEditor({id=null,index=null}={}){
 const setupOpen=Boolean(root.querySelector('.compact-setup')?.open),editorOpen=Boolean(root.querySelector('.compact-deck-editor')?.open);
 render();
 if(setupOpen)root.querySelector('.compact-setup').open=true;
 if(editorOpen){
  const editor=root.querySelector('.compact-deck-editor');editor.open=true;
  if(id&&Number.isInteger(index))root.querySelector('[data-card-config="'+id+'"][data-card-slot="'+index+'"]')?.focus({preventScroll:true});
 }
}
function setup(){
 const deckEditor=state.battle.allies.map(unit=>{
  const id=unit.sourceId||unit.id,draft=deckDraftFor(unit);
  const unlocked=state.run.augmentProgress?.completedKingdoms?.length||0;
  const options=[...unit.abilities.filter(a=>a.id!=='fortress-basic').map(a=>({value:'skill:'+a.id,name:a.name})),
   {value:'mobility',name:'Passo Longo · mobilidade'},{value:'reaction',name:'Último Suspiro · reação'},
   ...tacticalCardVariants.filter(v=>v.kingdoms<=unlocked).map(v=>({value:'variant:'+v.id,name:v.name+' · '+v.description}))];
  const counts=draft.reduce((result,card)=>{result[card.kind]=(result[card.kind]||0)+1;return result},{skill:0,mobility:0,reaction:0});
  const completion=Math.min(100,draft.length/10*100);
  return '<section class="compact-deck-edit-hero" data-deck-owner="'+esc(id)+'"><header class="deck-edit-heading"><div><h4>'+esc(unit.name)+'</h4><p>'+counts.skill+' técnicas <i>·</i> '+counts.mobility+' mobilidade <i>·</i> '+counts.reaction+' reação</p></div><strong class="deck-size-badge" data-deck-size="'+esc(id)+'">'+draft.length+'<small>/10</small></strong></header><div class="deck-size-meter" role="progressbar" aria-label="Tamanho do baralho de '+esc(unit.name)+'" aria-valuemin="8" aria-valuemax="10" aria-valuenow="'+draft.length+'"><i style="width:'+completion+'%"></i></div><div class="compact-deck-edit-slots">'+draft.map((card,i)=>{
   const current=card.kind==='skill'?'skill:'+card.abilityId:card.variantId?'variant:'+card.variantId:card.kind;
   const kind=deckKindLabel(card),description=deckCardDescription(unit,card);
   const visual=card.kind==='skill'?unit.abilities.find(ability=>ability.id===card.abilityId)?.art:null;
   return '<article class="compact-deck-slot" data-card-kind="'+esc(card.kind)+'"><span class="deck-slot-number">'+String(i+1).padStart(2,'0')+'</span><span class="deck-slot-art" aria-hidden="true">'+(visual?'<img src="'+esc(visual)+'" alt="" loading="lazy">':card.kind==='mobility'?'↗':card.kind==='reaction'?'◈':'✦')+'</span><div class="deck-slot-control"><small>'+esc(kind)+' · Carta '+(i+1)+'</small><label class="compact-visually-hidden" for="deck-'+esc(id)+'-'+i+'">Carta '+(i+1)+' de '+esc(unit.name)+'</label><select id="deck-'+esc(id)+'-'+i+'" data-card-config="'+esc(id)+'" data-card-slot="'+i+'">'+options.map(option=>'<option value="'+esc(option.value)+'" '+(option.value===current?'selected':'')+'>'+esc(option.name)+'</option>').join('')+'</select><p>'+esc(description)+'</p></div></article>';
  }).join('')+'</div><footer class="deck-edit-actions"><span>8–10 cartas · repetição permitida</span><div><button type="button" data-deck-add="'+esc(id)+'" '+(draft.length>=10?'disabled':'')+'>+ Adicionar</button><button type="button" data-deck-remove="'+esc(id)+'" '+(draft.length<=8?'disabled':'')+'>− Remover</button><button type="button" data-deck-default="'+esc(id)+'">Padrão</button></div></footer></section>';
 }).join('');
 const select=(side,i)=>'<label>'+ (side==='player'?'Aliado ':'Adversário ')+(i+1)+'<select data-team="'+side+'" data-index="'+i+'">'+(side==='player'?tacticalRoster:tacticalOpponentRoster).map(id=>'<option value="'+id+'" '+((side==='player'?state.battle.allies:state.battle.enemies)[i]?.sourceId===id||(side==='player'?state.battle.allies:state.battle.enemies)[i]?.id===id?'selected':'')+'>'+esc(characterById[id].name+' — '+characterById[id].identityTitle)+'</option>').join('')+'</select></label>';
 return '<details class="panel compact-setup"><summary>Nova formação</summary><div class="setup-fields">'+['player','enemy'].flatMap(side=>[0,1,2].map(i=>select(side,i))).join('')+'<label>Cenário<select data-scene>'+combatScenes.map(c=>'<option value="'+c.id+'" '+(c.id===state.battle.tactical.scene?'selected':'')+'>'+esc(c.name)+'</option>').join('')+'</select></label><label>Regra ambiental<select data-environment><option value="none">Sem regra ambiental</option>'+tacticalEnvironments.map(e=>'<option value="'+e.id+'">'+esc(e.world+' · '+e.title)+'</option>').join('')+'</select></label><details class="compact-deck-editor"><summary>Montar baralhos · 8 a 10 cartas por personagem</summary><p>Escolha quais técnicas entram no ciclo de cada personagem. A carta usada vai para o descarte; quando a compra termina, o descarte é embaralhado e volta ao ciclo. Movimento e Ataque Básico continuam disponíveis.</p>'+deckEditor+'</details><button data-restart>Iniciar confronto</button></div></details>';
}
function campaignJourney(){
 const history=state.run.history||[],routeById=Object.fromEntries(tacticalRoutes.map(route=>[route.id,route]));
 const visible=history.slice(-4),firstIndex=history.length-visible.length+1;
 const recent=visible.map((step,index)=>'<span class="campaign-route-stamp" data-route="'+esc(step.route||'')+'"><i>'+String(firstIndex+index).padStart(2,'0')+'</i>'+esc(routeById[step.route]?.title||step.title||'Travessia')+'</span>').join('');
 const encounter=Math.max(1,state.run.encounter||1),completed=state.run.augmentProgress?.completedKingdoms?.length||0;
 return '<section class="compact-campaign-journey" aria-label="Progresso da campanha"><div class="campaign-journey-top"><span><small>TRAVESSIA ROGUELITE</small><strong>ENCONTRO '+String(encounter).padStart(2,'0')+'</strong></span><span class="campaign-journey-stats"><b>'+completed+'</b> reinos <i>·</i> <b>'+state.run.buffs.length+'</b> legados <i>·</i> <b>'+state.run.fortressRewards.length+'</b> marcos</span></div>'+(recent?'<div class="campaign-route-history" aria-label="Rotas recentes">'+recent+'</div>':'<p>Escolha a rota depois da primeira vitória. Vida dos sobreviventes e baralhos equipados seguem para a próxima batalha.</p>')+'</section>';
}
function campaignRouteChoices(){
 const symbols={recovery:'✧',risk:'⌑',discovery:'◌'};
 return '<div class="compact-route-grid">'+tacticalRoutes.map((route,index)=>'<button class="compact-route-card route-'+route.id+'" data-route="'+route.id+'"><span class="route-number">0'+(index+1)+'</span><span class="route-symbol" aria-hidden="true">'+symbols[route.id]+'</span><small>'+esc(route.kind.toUpperCase())+'</small><strong>'+esc(route.title)+'</strong><span class="route-effect">'+esc(route.text)+'</span><i>'+esc(route.story)+'</i><b>SEGUIR ROTA ↗</b></button>').join('')+'</div>';
}
function eventForecast(s){
 if(state.battle.tactical.stage==='finished')return '';
 const {nextRound,roundsRemaining,active}=tacticalFieldForecast(s);
 return '<p class="compact-field-forecast"><strong>Eventos de campo</strong> · Próximo evento: rodada '+nextRound+' (em '+roundsRemaining+' rodada(s))'+(active?'<span>Ativo: '+esc(active.title)+' · '+esc(active.description)+'</span>':'')+'</p>';
}
function clashMarkup(){
 const duel=state.clash;if(!duel)return '';
 const attacking=duel.role==='attack',reveal=duel.result;
 const heading=attacking?'ESCOLHA SUA INVESTIDA':'ESCOLHA SUA RESPOSTA';
 const options=tacticalDuelOptions.map(option=>
  '<button type="button" class="compact-duel-option" data-duel-choice="'+option.id+'" aria-label="'+esc(option.name+' — '+option.hint)+'"'
   +(duel.locked?' disabled':'')+' data-duel-selected="'+Boolean(duel.choice===option.id)+'">'
   +'<span class="compact-duel-symbol" aria-hidden="true">'+option.symbol+'</span>'
   +'<strong>'+esc(option.name)+'</strong><small>'+esc(option.hint)+'</small></button>'
 ).join('');
 const opponentLabel=reveal?tacticalDuelOptions.find(o=>o.id===duel.opponentChoice)?.name||'—':null;
 const playerLabel=reveal?tacticalDuelOptions.find(o=>o.id===duel.choice)?.name||'—':null;
 const spendResponse=duel.role==='defense'&&state.battle.tactical.cardMode
  ?'<div class="compact-duel-resources" aria-label="Escolha o recurso da resposta">'
   +(duel.basicAvailable?'<button type="button" data-duel-resource="basic" aria-pressed="'+(!duel.reactionCardId)+'">Resposta padrão</button>':'')
   +(duel.reactions||[]).map(card=>'<button type="button" data-duel-resource="'+esc(card.id)+'" aria-pressed="'+(duel.reactionCardId===card.id)+'">'+esc(card.name)+'</button>').join('')
   +'</div>':'';

 return '<section class="compact-rhythm-clash compact-duel-clash" role="dialog" aria-modal="false" aria-label="Confronto de Vontades"'
  +' data-duel-result="'+(reveal?reveal.outcome:'pending')+'" data-combo-role="'+duel.role+'"'
  +' style="'+duel.palette+'">'
  +'<div class="compact-rhythm-heading"><strong>CONFRONTO DE VONTADES</strong><span>ESPECIAL</span></div>'
  +'<p><b>'+esc(duel.actorName)+'</b> · '+esc(duel.abilityName)+'</p>'
  +'<p class="compact-duel-instruction">'+heading+' · Estilo adversário: tende a '+esc(tacticalDuelOptions.find(o=>o.id===duel.tendency)?.name||'variar')+'. A escolha real é secreta.</p>'
  +spendResponse+'<div class="compact-duel-options" role="group" aria-label="Três intenções para o especial">'+options+'</div>'
  +(reveal?'<div class="compact-duel-reveal" role="status" aria-live="polite"><strong>'+esc(reveal.label)+'</strong>'
   +'<span>Você: '+esc(playerLabel)+' · Oponente: '+esc(opponentLabel)+'</span></div>'
   :'<div class="compact-duel-help"><span>Miragem distorce a Luz</span><span>Luz dissipa a Sombra</span><span>Sombra engole a Miragem</span></div>')
  +'<div class="compact-duel-footer"><span>Vitória atacante: crítico · Empate: dano normal · Vitória defensor: bloqueio</span>'
   +'<button type="button" data-duel-auto '+(duel.locked?'disabled':'')+'>'+(duel.role==='defense'?'Aceitar golpe':'Escolher por mim')+' <small>Esc</small></button></div>'
  +'</section>';
}
function render(){
 const s=displayed(),future=planned(),finished=state.battle.tactical.stage==='finished',rule=s.tactical.environment;
 const actorEvent=units(s).find(u=>u.id===state.event?.actorId),ability=actorEvent?.abilities.find(a=>a.id===state.event?.abilityId);
 const campaignDeckAction=state.battle.phase==='victory'&&!state.rewards.length
  ?'<button type="button" class="compact-campaign-deck-link" data-campaign-decks>Preparar baralhos para a próxima batalha</button>':'';
 const result=finished&&!state.busy?'<section class="compact-result"><header><small>TRAVESSIA · ENCONTRO '+String(Math.max(1,state.run.encounter||1)).padStart(2,'0')+'</small><h2>'+({victory:'Vitória',defeat:'Derrota',draw:'Empate'}[state.battle.phase]||'Confronto encerrado')+'</h2></header>'+(state.battle.phase==='victory'?state.rewards.length?'<p>Escolha um legado para levar na próxima etapa.</p><div class="compact-route-rewards">'+state.rewards.map(r=>'<button class="compact-run-reward" data-trail-reward="'+r.id+'"><small>'+(r.tier||'LEGADO').toUpperCase()+'</small><strong>'+esc(r.title)+'</strong><span>'+esc(r.text)+'</span><i>ESCOLHER ↗</i></button>').join('')+'</div>':campaignRouteChoices()+campaignDeckAction:'<p>A travessia foi interrompida. Reorganize a equipe e tente outra vez.</p><button data-restart>Nova tentativa</button>')+'</section>':'';
 const scene=combatScene(s.tactical.scene),sceneUrl=scene.art;
 const cinematicImpact=tacticalImpactProfile(state.event,{speed:state.speed,reduced:Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)});
 const activeSpecial=state.event?.type==='skill'&&!state.event.skipped&&['voto','despertar'].includes(String(state.event.abilityId||'').split('/')[0]);
 const comboCounter=state.event?.duel
  ?'<span class="compact-combo-counter" role="status"><strong>'+esc(state.event.duel.label)
   +'</strong><small>'+esc((tacticalDuelOptions.find(o=>o.id===state.event.duel.attackChoice)?.name||'')+' × '
   +(tacticalDuelOptions.find(o=>o.id===state.event.duel.defenseChoice)?.name||''))+'</small></span>'
  :state.event?.comboBeat
   ?'<span class="compact-combo-counter" role="status"><strong>COMBO '+state.event.comboBeat+' / '+state.event.comboTotal+'</strong></span>':'';
 const placementHint=state.pendingAction?'<p class="card-play-hint" role="status" aria-live="polite">'+(state.pendingAction.type==='move'?'Trajeto marcado. Toque em uma casa do caminho ou pressione Espaço para jogar.':'Área da técnica marcada. Toque em uma casa contornada ou pressione Espaço para jogar.')+' Botão direito ou toque fora do tabuleiro cancela.</p>':state.selectedCard||state.mode!=='move'?'<p class="card-play-hint" role="status" aria-live="polite">Carta selecionada. Escolha uma casa destacada no tabuleiro para definir o alvo; depois confirme com Espaço.</p>':'';
 root.innerHTML='<div class="combat-shell fortress-battle compact-battle"><header class="combat-header"><a href="/">OBLIVIUM ARENA</a><span>Campo compacto · 6 × 6</span><a href="/tactical.html?online">PvP online</a><a href="#compact-formation">Formação</a></header><section class="arena-stage compact-stage" data-scene="'+s.tactical.scene+'" data-hitstop="'+state.hitstop+'" data-impact-shake="'+(cinematicImpact?.shake||'none')+'" style="--compact-scene-image:url(\''+esc(sceneUrl)+'\');--compact-floor-zoom:'+scene.floorZoom+'%;--compact-floor-focus:'+scene.floorFocus+'%;--compact-hit-duration:'+Math.round((activeSpecial?560:420)/state.speed)+'ms;--compact-heal-duration:'+Math.round(460/state.speed)+'ms;--compact-feedback-delay:'+Math.round(36/state.speed)+'ms;--super-duration:'+Math.round(320/state.speed)+'ms"><img class="arena-backdrop" src="'+combatScene(s.tactical.scene).art+'" alt="">'+hud(s)+tacticalCutinMarkup(actorEvent,ability,state.event)+'<div class="arena-field">'+actionDock(s,future)+'<div class="compact-board-stack">'+board(s,future)+placementHint+tacticalSuperCaptionMarkup(actorEvent,ability,state.event)+comboCounter+'</div></div><div class="compact-playback-tools"><div class="compact-speed" aria-label="Velocidade das animações">'+[1,2,3].map(n=>'<button data-speed="'+n+'" aria-pressed="'+(state.speed===n)+'">'+n+'×</button>').join('')+'<button data-sound aria-label="Som de combate" aria-pressed="'+audioEnabled()+'">♪</button></div></div><p class="compact-explainer">Primeiro as ações ① de todos, depois as ações ②. O personagem permanece na casa atual até a execução.</p>'+eventForecast(s)+campaignJourney()+reward()+result+'<p class="augment-progression">'+esc(conquestProgressText(s.tactical.fortress.progress))+'</p>'+(rule?'<p class="compact-rule">'+esc(rule.title+' · '+rule.text)+'</p>':'')+'<details class="compact-log"><summary>Resolução da rodada</summary><ol>'+[...state.battle.tactical.events].map(e=>'<li>'+esc(e.title)+(e.skipped?' · '+esc(e.reason):'')+'</li>').join('')+'</ol></details></section>'+clashMarkup()+'<div id="compact-formation">'+setup()+'</div></div>';
 const hand=root.querySelector('.tactical-hand-dock'),field=root.querySelector('.arena-field');
 if(hand&&field)field.after(hand);
 sceneGround.sync(root);
 if(effects?.frame)effects.attach(root.querySelector('.board'));
}
function append(ref){
 const result=previewTacticalPlan(tacticalView(state.battle,'player'),'player',[...state.actions,ref]);
 if(!result.ok){state.message=result.reason;render();return;}
 state.actions.push(ref);state.spends={};state.selectedCard=null;state.pendingAction=null;state.mode='move';state.message='';
 if(count(state.selected)>=2){const next=state.battle.allies.find(u=>u.hp>0&&!u.stunned&&count(u.id)<2);if(next)state.selected=next.id;state.mode='move';}
 const available=state.battle.allies.filter(u=>u.hp>0&&!u.stunned);
 // No separate confirmation is needed to execute a complete trio of choices.
 if(available.length&&available.every(u=>count(u.id)===2)){confirm();return;}
 render();
}
function selectCell(point){
 if(locked())return;
 const s=displayed(),future=planned(),u=actor(future),hit=occupied(s,point);
 const current=state.pendingAction;
 if(current){
  const currentArea=actionArea(s,current),sameAnchor=current.anchor&&sameCell(current.anchor,point),inside=currentArea.some(cell=>sameCell(cell,point));
  if(sameAnchor||inside||current.type==='move'&&current.path.some(cell=>sameCell(cell,point))){confirmPendingAction();return;}
 }
 // Tap an ally to select them, except when deliberately targeting ally-support techniques.
 if(!current&&state.mode==='move'&&!state.selectedCard&&hit?.side==='player'&&hit.id!==u.id){state.selected=hit.id;state.mode='move';state.spends={};state.message='';render();return;}
 if(count(u.id)>=2||u.stunned||u.hp<=0)return;
 if(state.mode==='move'||state.mode==='mobility'){
  const card=state.selectedCard?tacticalCard(state.battle,'player',u.id,state.selectedCard):null,path=findPath(future,u.id,point,state.mode==='mobility'?tacticalMovementSteps(card):undefined);if(!path?.length){state.message='Escolha uma casa destacada para o movimento.';render();return;}
  state.pendingAction={type:'move',actorId:u.id,path,...(state.selectedCard?{cardId:state.selectedCard}:{})};state.message='Trajeto marcado. Toque no caminho ou pressione Espaço para jogar.';render();return;
 }
 const ability=u.abilities.find(a=>a.id===state.mode);if(!ability)return;
 state.pendingAction=skillActionAt(u,ability,point,state.selectedCard);state.message='Alvo reposicionado. Toque em uma casa contornada ou pressione Espaço para jogar.';render();
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
 state.snapshot=null;state.event=null;state.hitstop=false;state.busy=false;state.actions=[];state.mode='move';state.selectedCard=null;state.message='';
 state.selected=state.battle.allies.find(u=>u.hp>0&&!u.stunned)?.id||state.battle.allies[0].id;
 if(state.battle.phase==='victory')state.rewards=offerTacticalRewards(state.run,state.battle);
 render();
}
// The opponent's score is a bounded deterministic AI response.
 // The human acts for the attacking or defending team, even in solo play.
// The animation communicates the contact; the player decides whether
// to time an offensive input or defend with a forgiving dodge / risky parry.
// The rival's stance is sealed deterministically before the player selects.
// There is no reaction timer: this is a short, understandable strategy contest.
function interactiveDuel(ref){
 const attacking=ref.side==='player',role=attacking?'attack':'defense';
 const cardMode=Boolean(state.battle.tactical.cardMode),respondingSide=attacking?'enemy':'player';
 const available=tacticalResponseOptions(state.battle,respondingSide,ref.targets[0]);
 if(cardMode&&!available.available)return Promise.resolve({decline:true});
 if(cardMode&&attacking&&(ref.ability.damage||0)<18&&!available.reactions.length)return Promise.resolve({decline:true});
 const current=state.battle,origin=current.tactical.positions[ref.actorId];
 const before={allies:current.allies,enemies:current.enemies,
  positions:current.tactical.positions,width:current.tactical.width,height:current.tactical.height};
 const anchor=ref.anchor||origin,area=tacticalArea(current,ref.actor,ref.ability,anchor,ref.orientation);
 const rival=attacking?current.enemies.find(u=>u.id===ref.targets[0])||ref.actor:ref.actor;
 const tendency=tacticalDuelTendency(rival);
 const foeChoice=tacticalDuelAI({round:current.round,actorId:ref.actorId,
  targetId:ref.targets[0]||'',abilityId:ref.abilityId,
  side:attacking?'defense':'attack',tendency});
 state.snapshot=before;
 state.event={type:'skill',actorId:ref.actorId,abilityId:ref.abilityId,
  family:tacticalAnimationFamily(ref.ability),anchor,orientation:ref.orientation,
  cells:area,before,after:before,pose:'windup',
  title:'Confronto de Vontades · '+ref.ability.name};
 return new Promise(resolve=>{
  const duel={role,actorName:ref.actor.name,abilityName:ref.ability.name,
   opponentChoice:foeChoice,tendency,palette:tacticalPaletteVariables(tacticalActorPalette(ref.actor,{realmFallback:true})),
   locked:false,choice:null,result:null,transitionTimer:null,press:null,skip:null,completed:false,
   basicAvailable:available.basic,reactions:available.reactions,reactionCardId:attacking?(available.basic?null:available.reactions[0]?.id):available.basic?null:available.reactions[0]?.id||null};
  const finish=choice=>{
   if(duel.completed||duel.locked)return;
   if(!tacticalDuelOptions.some(option=>option.id===choice))return;
   duel.locked=true;duel.choice=choice;
   const attackChoice=attacking?choice:foeChoice,defenseChoice=attacking?foeChoice:choice;
   const answer=tacticalDuelResolve(attackChoice,defenseChoice,{mode:cardMode?'cards':'legacy'});
   duel.result=answer;state.clash=duel;render();
   playCombatCue(answer.outcome==='miss'?'guard':answer.outcome==='hit'?'release':'impact',
    state.event?.family||'strike');
   duel.transitionTimer=setTimeout(()=>{
    if(duel.completed)return;
    duel.completed=true;state.clash=null;state.event=null;render();resolve({attackChoice,defenseChoice,...(duel.reactionCardId?{reactionCardId:duel.reactionCardId}:{})});
   },600);
  };
  duel.press=finish;
  duel.cancel=()=>{if(duel.completed)return;duel.completed=true;clearTimeout(duel.transitionTimer);resolve({});};
  // A skipped response still makes an ordinary, visibly explained choice.
  // There is no free immunity or advantage from skipping the contest.
  duel.skip=()=>{
    if(cardMode&&!attacking&&!duel.locked){
     duel.completed=true;state.clash=null;state.event=null;render();resolve({decline:true});
    }else finish(attacking?'miragem':'sombra');
   };
  state.clash=duel;render();
 });
}
async function playCompactSession(session){
 const id=job;
 await playback(session.events,{partial:true});
 while(id===job){
  const pending=session.peek();
  const contest=pending?.comboEligible?await interactiveDuel(pending):{};
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
  // Never strand tactical.stage='resolving' after an unexpected UI failure.
  // Unanswered special duels collide for half damage instead of silently
  // granting the attacker a full-strength unopposed special.
  for(let attempts=0;attempts<26;attempts++){
   const pending=session.peek();
   const step=session.next(pending?.comboEligible
    ?{attackChoice:'sombra',defenseChoice:'sombra'}:{});
   if(!step.ok||step.done)break;
  }
  state.busy=false;state.clash=null;state.event=null;state.snapshot=null;state.actions=[];
  state.message='Apresentação interrompida; especiais sem resposta foram resolvidos como choque. '+(error?.message||'');
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
 job++;state.revision++;state.clash?.cancel?.();state.clash=null;effects?.clear();
 try{state.battle=createTacticalBattle(player,enemy,{...config,seed:config.seed||state.seed,fortress:true,compact:true,cardMode:true,decks:config.decks||{player:state.run.cardDecks||{}},augmentProgress:state.run.augmentProgress});}catch(error){state.message=error.message;if(state.battle)render();return;}
 Object.assign(state,{actions:[],spends:{},busy:false,snapshot:null,event:null,message:'',mode:'move',selectedCard:null,pendingAction:null,dragCardId:null,rewards:[],selected:state.battle.allies.find(u=>u.hp>0&&!u.stunned)?.id||state.battle.allies[0].id});render();
}
root.addEventListener('click',event=>{
 if((state.pendingAction||state.selectedCard||state.mode!=='move')&&!event.target.closest('.compact-board')&&!event.target.closest('.tactical-hand-dock .compact-hand-card')){cancelTargeting();return;}
 const button=event.target.closest('button');if(!button||button.disabled)return;const d=button.dataset;
 if(state.clash){
  if(d.duelResource&&!state.clash.locked){
   if(d.duelResource==='basic'&&state.clash.basicAvailable)state.clash.reactionCardId=null;
   else if(state.clash.reactions?.some(card=>card.id===d.duelResource))state.clash.reactionCardId=d.duelResource;
   render();return;
  }
  if(d.duelChoice)state.clash.press?.(d.duelChoice);
  else if('duelAuto'in d)state.clash.skip?.();
  return;
 }
 if(d.speed){state.speed=Number(d.speed);render();return;}
 if('sound'in d){setAudioEnabled(!audioEnabled());render();return;}
 if('handToggle'in d){state.handCollapsed=!state.handCollapsed;render();root.querySelector('[data-hand-toggle]')?.focus({preventScroll:true});return;}
 if('campaignDecks'in d){
  const setup=root.querySelector('.compact-setup'),editor=root.querySelector('.compact-deck-editor');
  if(setup&&editor){setup.open=true;editor.open=true;const first=editor.querySelector('select[data-card-config]');first?.focus({preventScroll:true});editor.scrollIntoView({behavior:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});}
  return;
 }
 if(d.deckAdd||d.deckRemove||d.deckDefault){
  const id=d.deckAdd||d.deckRemove||d.deckDefault,unit=state.battle.allies.find(item=>(item.sourceId||item.id)===id);
  if(!unit)return;
  const build=deckDraftFor(unit);
  if(d.deckAdd&&build.length<10)build.push({kind:'mobility'});
  else if(d.deckRemove&&build.length>8)build.pop();
  else if(d.deckDefault){state.run.cardDecks??={};state.run.cardDecks[id]=defaultTacticalCardBuild(unit);saveCardBuilds();refreshDeckEditor();return;}
  state.run.cardDecks??={};state.run.cardDecks[id]=build;saveCardBuilds();refreshDeckEditor();return;
 }
 if(state.busy)return;
 const pending=state.battle.tactical.pendingChestRewards[0];
 if('reward'in d){if(!pending)return;const option=pending.options.find(o=>o.id===d.reward),target=option?.effect?.type==='tactical-card-upgrade'?root.querySelector('[data-card-target]')?.value:undefined;
   const result=chooseTacticalChestReward(state.battle,pending.id,d.reward,target);state.message=result.ok?'':result.reason;if(result.ok){saveProgress();if(option?.effect?.type==='tactical-card-upgrade')preserveCardBuilds();}render();return;}
 if('reroll'in d){if(pending){const result=rerollTacticalChestReward(state.battle,pending.id);state.message=result.ok?'':result.reason;if(result.ok)saveProgress();render();}return;}
 if(pending)return;
 if('restart'in d){
  const select=side=>[0,1,2].map(i=>root.querySelector('[data-team="'+side+'"][data-index="'+i+'"]')?.value||(side==='player'?state.battle.allies:state.battle.enemies)[i].sourceId||(side==='player'?state.battle.allies:state.battle.enemies)[i].id);
  state.run=createTacticalRun(progress());state.run.cardDecks=readCardBuilds();start(select('player'),select('enemy'),{scene:root.querySelector('select[data-scene]')?.value,environment:root.querySelector('[data-environment]')?.value});return;
 }
 if('trailReward'in d){if(chooseTacticalReward(state.run,state.rewards,d.trailReward)){state.rewards=[];render();}return;}
 if('route'in d){const next=advanceTacticalRun(state.run,state.battle,d.route);if(next)start(next.player,next.enemy,next);return;}
 if(locked())return;
 if(d.spend){state.spends[d.spend]=Number(d.amount);render();return;}
 if(d.shadow){const result=chooseTacticalShadow(state.battle,'player',state.selected,d.shadow);state.message=result.ok?'':result.reason;render();return;}
 if(d.actor){state.selected=d.actor;state.spends={};state.selectedCard=null;state.pendingAction=null;state.mode='move';state.message='';render();return;}
 if('mode'in d){const scrollLeft=root.querySelector('.compact-quick-buttons')?.scrollLeft||0;state.mode=d.mode;state.selectedCard=null;state.pendingAction=null;state.spends={};state.message='';render();restoreTacticalHand(root,'.compact-quick-buttons','mode',d.mode,scrollLeft,event.detail===0);return;}
 if('card'in d){
  const card=tacticalHand(state.battle,'player',state.selected).find(item=>item.id===d.card);
  if(!card||card.kind==='reaction')return;
  const scrollLeft=root.querySelector('.compact-quick-buttons')?.scrollLeft||0;
  activateCard(card);
  restoreTacticalHand(root,'.compact-quick-buttons','card',card.id,scrollLeft,event.detail===0);return;
 }
 if('technique'in d){const scrollLeft=root.querySelector('.compact-quick-buttons')?.scrollLeft||0,unit=actor(planned()),ability=unit.abilities.find(item=>item.id===d.technique);state.mode=d.technique;state.selectedCard=null;state.spends={};state.pendingAction=ability?skillActionAt(unit,ability,defaultAim(planned(),unit,ability),null):null;state.message='Área marcada: toque em uma casa contornada ou pressione Espaço para confirmar.';render();restoreTacticalHand(root,'.compact-quick-buttons','technique',d.technique,scrollLeft,event.detail===0);return;}
 if(d.cell){const [x,y]=d.cell.split(',').map(Number);selectCell({x,y});return;}
 if('removeIndex'in d){
  const index=Number(d.removeIndex);
  if(!Number.isInteger(index)||index<0||index>=state.actions.length)return;
  const [removed]=state.actions.splice(index,1);
  const valid=[],view=tacticalView(state.battle,'player');
  for(const action of state.actions)if(previewTacticalPlan(view,'player',[...valid,action]).ok)valid.push(action);
  state.actions=valid;state.selected=removed.actorId;state.mode='move';state.selectedCard=null;state.pendingAction=null;state.spends={};state.message='';render();return;
 }
 if('undo'in d){state.actions.pop();state.selectedCard=null;state.pendingAction=null;state.mode='move';state.message='';render();return;}
 if('clear'in d){state.actions=[];state.selectedCard=null;state.pendingAction=null;state.mode='move';state.message='';render();return;}
 if('confirm'in d)confirm();
});
root.addEventListener('contextmenu',event=>{if(state.pendingAction||state.selectedCard||state.mode!=='move'){event.preventDefault();cancelTargeting();}});
function cardFromHandElement(element){
 const d=element.dataset;
 if(d.card){const card=tacticalHand(state.battle,'player',state.selected).find(item=>item.id===d.card);if(card)return card;}
 if(d.mode==='move')return {id:null,kind:'mobility'};
 if(d.technique)return {id:null,kind:'skill',abilityId:d.technique};
 if(d.cardKind==='basic')return {id:null,kind:'skill',abilityId:'fortress-basic'};
 return null;
}
root.addEventListener('dragstart',event=>{
 const cardElement=event.target.closest?.('.compact-hand-card[draggable="true"]');if(!cardElement||cardElement.disabled)return;
 const card=cardFromHandElement(cardElement);if(!card)return;
 state.dragCardId=card.id||card.abilityId||'move';event.dataTransfer?.setData('text/plain',state.dragCardId);if(event.dataTransfer)event.dataTransfer.effectAllowed='copy';cardElement.classList.add('is-dragging');
});
root.addEventListener('dragend',event=>{event.target.closest?.('.compact-hand-card')?.classList.remove('is-dragging');state.dragCardId=null;root.querySelectorAll('.card-drop-target').forEach(cell=>cell.classList.remove('card-drop-target'));});
root.addEventListener('dragover',event=>{const cell=event.target.closest?.('.compact-board [data-cell]');if(!cell||!state.dragCardId)return;event.preventDefault();cell.classList.add('card-drop-target');});
root.addEventListener('dragleave',event=>{const cell=event.target.closest?.('.compact-board [data-cell]');if(cell)cell.classList.remove('card-drop-target');});
root.addEventListener('drop',event=>{
 const cell=event.target.closest?.('.compact-board [data-cell]');if(!cell||!state.dragCardId)return;
 event.preventDefault();const element=root.querySelector('.compact-hand-card.is-dragging'),card=element&&cardFromHandElement(element),[x,y]=cell.dataset.cell.split(',').map(Number);
 if(card)activateCard(card,{x,y});state.dragCardId=null;root.querySelectorAll('.card-drop-target').forEach(item=>item.classList.remove('card-drop-target'));
});
root.addEventListener('change',event=>{
 const selector=event.target.closest?.('select[data-card-config]');if(!selector)return;
 const id=selector.dataset.cardConfig,index=Number(selector.dataset.cardSlot);
 const unit=state.battle.allies.find(u=>(u.sourceId||u.id)===id);
 if(!unit||!Number.isInteger(index)||index<0||index>9)return;
 state.run.cardDecks??={};
 const deck=tacticalCardDeck(state.battle,'player',unit.id);
 const build=state.run.cardDecks[id]||Object.values(deck?.cards||{}).map(card=>({kind:card.kind,abilityId:card.abilityId,variantId:card.variantId,upgrade:card.upgrade}));
 if(!build[index])return;
 const value=selector.value;
 const variant=value.startsWith('variant:')?tacticalCardVariants.find(v=>v.id===value.slice(8)):null;
 build[index]=value.startsWith('skill:')?{kind:'skill',abilityId:value.slice(6)}
  :variant?{kind:variant.kind,variantId:variant.id}
  :value==='mobility'?{kind:'mobility'}:{kind:'reaction'};
 state.run.cardDecks[id]=build;saveCardBuilds();
 refreshDeckEditor({id,index});
});
root.addEventListener('pointerover',event=>{
 const cell=event.target.closest('[data-cell]');if(!cell||locked()||state.mode==='move'||state.mode==='mobility')return;
 for(const e of root.querySelectorAll('.cell.aim'))e.classList.remove('aim');
 const s=planned(),u=actor(s),a=u.abilities.find(a=>a.id===state.mode);if(!a)return;
 const [x,y]=cell.dataset.cell.split(',').map(Number),origin=s.tactical.positions[u.id],orientation=[Math.sign(x-origin.x),Math.sign(y-origin.y)];
 if(!orientation[0]&&!orientation[1])orientation.splice(0,2,...unitFacing(s,u));
 for(const p of tacticalArea(s,u,a,{x,y},orientation))root.querySelector('[data-cell="'+cellKey(p)+'"]')?.classList.add('aim');
});
document.addEventListener('keydown',event=>{
 if(state.clash){
  if(event.repeat)return;
  if(event.key==='Escape'){event.preventDefault();state.clash.skip?.();return;}
  const choice=event.code==='Digit1'||event.code==='Numpad1'?'miragem'
   :event.code==='Digit2'||event.code==='Numpad2'?'luz'
   :event.code==='Digit3'||event.code==='Numpad3'?'sombra':null;
  if(choice){event.preventDefault();state.clash.press?.(choice);}return;
 }
 if(event.key==='Escape'&&(state.pendingAction||state.selectedCard||state.mode!=='move')&&!event.target.matches('input,select,textarea,[contenteditable="true"]')){event.preventDefault();cancelTargeting();return;}
 if(locked())return;
 if(event.code==='Space'&&!event.repeat&&!event.target.matches('input,select,textarea,[contenteditable="true"]')){if(state.pendingAction){event.preventDefault();confirmPendingAction();return;}if(state.selectedCard||state.mode!=='move'){event.preventDefault();return;}if(event.target.matches('button'))return;event.preventDefault();confirm();return;}
 if(event.target.matches('button,input,select,textarea,[contenteditable="true"]'))return;
 else if(['1','2','3'].includes(event.key)){state.selected=state.battle.allies[Number(event.key)-1].id;state.selectedCard=null;state.pendingAction=null;state.mode='move';render();}
});
start();
