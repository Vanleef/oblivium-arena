import {characterById} from './data.js';
import {combatScenes,combatScene} from './combat-scenes.js';
import {createTacticalBattle,previewTacticalPlan,submitTacticalPlan,resolveTacticalRound,tacticalView,tacticalArea,chooseTacticalChestReward,rerollTacticalChestReward,chooseTacticalShadow} from './tactical-combat.js';
import {skillSealReason} from './combat-effects.js';
import {tacticalRequirementReason} from './tactical-requirements.js';
import {planTacticalAI} from './tactical-ai.js';
import {conquestAugmentedAbility,augmentTiers} from './conquest-augments.js';
import {conquestProgress,syncConquestCampaign} from './conquest-progress.js';
import {conquestTechnique,conquestPassive} from './conquest-techniques.js';
import {objectiveGrowth} from './conquest-objectives.js';
import {boardCells,cellKey,cellLabel,findPath,occupied,sameCell,unitFacing} from './tactical-board.js';
import {tacticalRoster,tacticalOpponentRoster} from './tactical-kits.js';
import {tacticalSpriteFrame,tacticalSpriteInline,paintTacticalToken} from './tactical-sprites.js';
import {tacticalFigureStyle} from './tactical-figure-framing.js';
import {tacticalIdleStyle} from './tactical-motion.js';
import {tacticalAnimationFrames,tacticalFrameDuration} from './tactical-animation.js';
import {TacticalEffectsLayer} from './tactical-effects-layer.js';
import {tacticalProjectileKind,tacticalCutinMarkup} from './tactical-cinematic.js';
import {tacticalStatuses} from './tactical-statuses.js';
import {surfaceAt,elements,tacticalFieldForecast} from './tactical-elements.js';
import {tacticalEnvironments} from './tactical-environment.js';
import {createTacticalRun,offerTacticalRewards,chooseTacticalReward,advanceTacticalRun,tacticalRoutes,conquestProgressText} from './tactical-run.js';
import {audioEnabled,setAudioEnabled,playCombatCue} from './audio.js';
import {orderTacticalActions} from './tactical-order.js';
const root=document.getElementById('tactical-app');
const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const key='oblivium-conquest-augment-progress-v2',profileKey='pma-post-mortem-arena-v1';
function progress(){try{const stored=conquestProgress(JSON.parse(localStorage.getItem(key)||'{}')),profile=JSON.parse(localStorage.getItem(profileKey)||'null');return profile?syncConquestCampaign(profile,stored):stored;}catch{return conquestProgress();}}
const state={battle:null,run:createTacticalRun(progress()),actions:[],spends:{},selected:null,mode:'move',busy:false,snapshot:null,event:null,message:'',speed:1,seed:1,revision:0,rewards:[]};
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
 const current=state.event?.actorId===unit.id?state.event:null,facing=current?.orientation||unitFacing(s,unit),frame=tacticalSpriteFrame(unit,current,facing);
 const sign=frame?.directional?1:facing[0]<0?-1:1;
 const statuses=tacticalStatuses(unit,s),layers=[...new Set(statuses.map(e=>e.id.startsWith('dot:')?'affliction':e.id.startsWith('mark:')?'marked':e.id.startsWith('surface:')?'terrain-'+e.id.slice(8):e.id))],orders=!state.busy&&unit.side==='player'?state.actions.filter(a=>a.actorId===unit.id):[];
 const sprite=frame?'<span class="token-sprite"><span class="sprite-viewport"><img class="sprite-sheet" src="'+esc(frame.src)+'" alt="" style="'+tacticalSpriteInline(frame)+'"></span></span>':unit.art?.portrait?'<img class="token-art" src="'+esc(unit.art.portrait)+'" alt="">':'<i class="arena-creature-mark">'+esc(unit.symbol||'◆')+'</i>';
 const indicators=orders.map((action,i)=>{
  const kind=action.type,mark=kind==='move'?'→'+cellLabel(action.path.at(-1)):kind==='guard'?'⬡':'✦';
  return '<b data-action-kind="'+kind+'" title="'+esc((i+1)+'ª ação · '+actionName(unit,action))+'">'+(i+1)+' '+esc(mark)+'</b>';
 }).join('');
 return '<span class="token '+unit.side+'" data-unit-id="'+esc(unit.id)+'" data-family="'+esc(current?.family||'idle')+'" data-pose="'+esc(current?.pose||'ready')+'" data-sprite="'+Boolean(frame)+'" data-idle-atlas="false" style="'+tacticalFigureStyle(unit)+tacticalIdleStyle(unit)+'--facing-sign:'+sign+';--upgrade-growth:'+objectiveGrowth(unit.objectiveAugments||0)+';--pose-duration:'+tacticalFrameDuration(current||{})+'ms"><span class="compact-ground-shadow" aria-hidden="true"></span><span class="conquest-model">'+sprite+'</span>'+(unit.id===state.selected&&!state.busy?'<i class="selected-unit-arrow" aria-hidden="true"></i>':'')+'<span class="tactical-status-vfx" aria-hidden="true">'+layers.map(layer=>'<i data-status-vfx="'+esc(layer)+'"></i>').join('')+'</span><span class="compact-token-label">'+esc(unit.name)+'</span>'+(orders.length?'<span class="compact-token-orders" aria-hidden="true">'+indicators+'</span>':'')+'</span>';
}
const emblem=tier=>'<span class="objective-pulse" data-tier="'+tier+'" aria-hidden="true"><i></i><b class="objective-emblem"><svg viewBox="0 0 64 64"><path class="objective-gem" d="M32 6 48 21 44 43 32 54 20 43 16 21Z"/><path class="objective-facets" d="m32 6-8 18 8 30 8-30Zm-16 15 16 9 16-9M20 43l12-13 12 13"/></svg></b></span>';
function board(s,future=planned()){
 const owner=actor(s),canMove=!locked()&&state.mode==='move'&&count(owner.id)<2,goal=s.tactical.objectives?.player;
 const activeCells=new Set((state.event?.cells||[]).map(cellKey)),destinations=new Map();
 if(!state.busy)for(const u of s.allies){const to=future.tactical.positions[u.id];if(to&&!sameCell(to,s.tactical.positions[u.id]))destinations.set(cellKey(to),u);}
 return '<div class="board compact-board" role="group" aria-label="Arena tática em grade 6 por 6" style="--fort-cols:6;--fort-rows:6">'+boardCells(s).map(p=>{
  const unit=occupied(s,p),path=canMove?findPath(future,owner.id,p):null,objective=goal&&sameCell(goal.position,p),surface=surfaceAt(s,p),blocked=s.tactical.obstacles.some(q=>sameCell(q,p)),destination=destinations.get(cellKey(p));
  return '<button class="cell '+(path?'reachable ':'')+(blocked?'blocked ':'')+(objective?'objective-cell objective-'+goal.tier+' ':'')+(activeCells.has(cellKey(p))?'compact-impact ':'')+'" data-cell="'+cellKey(p)+'" style="z-index:'+(p.y*10+(unit?10:0))+'" aria-label="'+cellLabel(p)+(unit?', '+esc(unit.name)+', '+(unit.side==='player'?'aliado':'inimigo')+', Vida '+unit.hp:', vazia')+(objective?', objetivo '+augmentTiers[goal.tier].label:'')+(path?', movimento disponível, 1 casa':'')+(surface?', '+esc(elements[surface.element]?.surface||surface.element):'')+'" '+(locked()?'disabled':'')+'><span class="coord">'+cellLabel(p)+'</span>'+(objective?emblem(goal.tier):'')+(surface?'<span class="element-floor" data-element="'+surface.element+'" aria-hidden="true"></span>':'')+(destination?'<span class="compact-planned-destination" aria-hidden="true">↳ '+esc(destination.name)+'</span>':'')+(unit?figure(unit,s):'')+'</button>';
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
 const command=(kind,glyph,label,selected)=>'<button class="compact-icon-btn compact-primary-action" '+(kind==='move'?'data-mode="move"':'data-guard')+' title="'+esc(label)+'" aria-label="'+esc(label)+'" aria-pressed="'+Boolean(selected)+'" '+(unavailable?'disabled':'')+'>'+glyph+'<span>'+esc(kind==='move'?'Mover':'Guarda')+'</span></button>';
 const primary='<section class="compact-panel-section" data-panel-section="actions"><h3>Ações</h3><div class="compact-primary-buttons">'+command('move',moveGlyph,'Mover uma casa',state.mode==='move')+command('guard',guardGlyph,'Guarda: +6 de Escudo',false)+'</div></section>';
 const abilityButtons=u.abilities.map(base=>{
  const a=conquestAugmentedAbility(future,u,conquestTechnique(base)),cooldown=u.cooldowns[a.id]||0,reason=skillSealReason(u,a)||tacticalRequirementReason(future,u,a);
  const tooltip=a.name+' — '+(reason||(cooldown?'Em recarga · '+cooldown:a.description));
  return '<button class="compact-icon-btn" data-technique="'+esc(a.id)+'" aria-pressed="'+(state.mode===a.id)+'" aria-label="'+esc(tooltip)+'" title="'+esc(tooltip)+'" '+(unavailable||cooldown||reason?'disabled':'')+'>'+actionGlyph(u,{type:'skill',abilityId:a.id})+'</button>';
 }).join('');
 const advance=specialChoices(u,picked,unavailable);
 const advanced=advance?'<details class="compact-panel-advanced"><summary aria-label="Opções avançadas da técnica" title="Opções avançadas da técnica">✧</summary>'+advance+'</details>':'';
 const abilities='<section class="compact-panel-section" data-panel-section="abilities"><h3>Habilidades</h3><div class="compact-quick-buttons" role="group" aria-label="Técnicas do personagem selecionado">'+abilityButtons+'</div>'+advanced+'</section>';
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
function render(){
 const s=displayed(),future=planned(),finished=state.battle.tactical.stage==='finished',rule=s.tactical.environment;
 const actorEvent=units(s).find(u=>u.id===state.event?.actorId),ability=actorEvent?.abilities.find(a=>a.id===state.event?.abilityId);
 const result=finished&&!state.busy?'<section class="compact-result"><h2>'+({victory:'Vitória',defeat:'Derrota',draw:'Empate'}[state.battle.phase]||'Confronto encerrado')+'</h2>'+(state.battle.phase==='victory'?state.rewards.length?'<p>Escolha uma melhoria para a próxima travessia.</p>'+state.rewards.map(r=>'<button data-trail-reward="'+r.id+'" title="'+esc(r.text)+'">'+esc(r.title)+'</button>').join(''):tacticalRoutes.map(r=>'<button data-route="'+r.id+'" title="'+esc(r.text)+'">'+esc(r.title)+'</button>').join(''):'<button data-restart>Nova tentativa</button>')+'</section>':'';
 const scene=combatScene(s.tactical.scene),sceneUrl=scene.art;
 root.innerHTML='<div class="combat-shell fortress-battle compact-battle"><header class="combat-header"><a href="/">OBLIVIUM ARENA</a><span>Campo compacto · 6 × 6</span><a href="#compact-formation">Formação</a></header><section class="arena-stage compact-stage" data-scene="'+s.tactical.scene+'" style="--compact-scene-image:url(\''+esc(sceneUrl)+'\');--compact-floor-zoom:'+scene.floorZoom+'%;--compact-floor-focus:'+scene.floorFocus+'%"><img class="arena-backdrop" src="'+combatScene(s.tactical.scene).art+'" alt="">'+hud(s)+tacticalCutinMarkup(actorEvent,ability,state.event)+'<div class="arena-field">'+actionDock(s,future)+'<div class="compact-board-stack">'+board(s,future)+'</div></div><div class="compact-playback-tools"><div class="compact-speed" aria-label="Velocidade das animações">'+[1,2,3].map(n=>'<button data-speed="'+n+'" aria-pressed="'+(state.speed===n)+'">'+n+'×</button>').join('')+'<button data-sound aria-label="Som de combate" aria-pressed="'+audioEnabled()+'">♪</button></div></div><p class="compact-explainer">Primeiro as ações ① de todos, depois as ações ②. O personagem permanece na casa atual até a execução.</p>'+eventForecast(s)+reward()+result+'<p class="augment-progression">'+esc(conquestProgressText(s.tactical.fortress.progress))+'</p>'+(rule?'<p class="compact-rule">'+esc(rule.title+' · '+rule.text)+'</p>':'')+'<details class="compact-log"><summary>Resolução da rodada</summary><ol>'+[...state.battle.tactical.events].map(e=>'<li>'+esc(e.title)+(e.skipped?' · '+esc(e.reason):'')+'</li>').join('')+'</ol></details></section><div id="compact-formation">'+setup()+'</div></div>';
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
async function playback(events){
 const revision=++state.revision;state.busy=true;render();
 const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const pause=ms=>new Promise(resolve=>setTimeout(resolve,(reduced?35:ms)/state.speed));
 for(const event of events){
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
   await pause(360);state.snapshot=event.after;state.event=null;render();playCombatCue('step');continue;
  }
  const unit=units(event.before).find(u=>u.id===event.actorId),ability=unit?.abilities.find(a=>a.id===event.abilityId);
  const frames=unit&&!event.skipped?(event.type==='guard'?[{family:'guard',pose:'ready',index:0},{family:'guard',pose:'impact',index:1}]:tacticalAnimationFrames(ability)):[{family:'support',pose:'impact',index:0}];
  for(const frame of frames){
   if(revision!==state.revision)return;
   state.event={...event,...frame};const impact=frame.pose==='impact'||frame.pose==='counter';
   if(impact)state.snapshot=event.after;
   if(impact||frame.index===0||!unit)render();
   else{const token=root.querySelector('[data-unit-id="'+event.actorId+'"]');if(token)paintTacticalToken(token,unit,event,frame);}
   const duration=Math.min(330,tacticalFrameDuration(state.event));
   if(!event.skipped&&(impact||['release','travel'].includes(frame.pose)))emit(state.event,unit,ability,impact?'impact':frame.pose,duration/state.speed);
   if(impact&&!event.skipped)playCombatCue('contact',frame.family);
   await pause(duration);
  }
  state.snapshot=event.after;
 }
 if(revision!==state.revision)return;
 state.snapshot=null;state.event=null;state.busy=false;state.actions=[];state.mode='move';state.message='';
 state.selected=state.battle.allies.find(u=>u.hp>0&&!u.stunned)?.id||state.battle.allies[0].id;
 if(state.battle.phase==='victory')state.rewards=offerTacticalRewards(state.run,state.battle);
 render();
}
function finishPlan(id,round,plan){
 if(id!==job||round!==state.battle.round||!state.busy)return;
 const result=submitTacticalPlan(state.battle,'enemy',plan||[]);
 if(!result.ok){if(state.battle.tactical.stage==='planning')delete state.battle.tactical.plans.player;state.message=result.reason;state.busy=false;render();return;}
 const resolution=resolveTacticalRound(state.battle);if(resolution.ok)playback(resolution.events);else{state.busy=false;state.message=resolution.reason;render();}
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
 job++;state.revision++;effects?.clear();
 try{state.battle=createTacticalBattle(player,enemy,{...config,seed:config.seed||state.seed,fortress:true,compact:true,augmentProgress:state.run.augmentProgress});}catch(error){state.message=error.message;if(state.battle)render();return;}
 Object.assign(state,{actions:[],busy:false,snapshot:null,event:null,message:'',mode:'move',rewards:[],selected:state.battle.allies.find(u=>u.hp>0&&!u.stunned)?.id||state.battle.allies[0].id});render();
}
root.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button||button.disabled)return;const d=button.dataset;
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
 if('guard'in d){append({type:'guard',actorId:state.selected});return;}
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
 if(event.target.matches('input,select,textarea,[contenteditable="true"]')||locked())return;
 if(event.code==='Space'&&!event.repeat){event.preventDefault();confirm();}
 else if(['1','2','3'].includes(event.key)){state.selected=state.battle.allies[Number(event.key)-1].id;state.mode='move';render();}
 else if(event.key==='Escape'){state.mode='move';state.message='';render();}
});
start();
