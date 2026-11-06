import {characterById} from './data.js';
import {combatScenes,combatScene} from './combat-scenes.js';
import {createTacticalBattle,previewTacticalPlan,submitTacticalPlan,resolveTacticalRound,tacticalView,tacticalArea,fortressTechniqueSpec,fortressCooldown,chooseTacticalChestReward,rerollTacticalChestReward,chooseTacticalShadow} from './tactical-combat.js';
import {skillSealReason} from './combat-effects.js';
import {tacticalRequirementReason} from './tactical-requirements.js';
import {planTacticalAI} from './tactical-ai.js';
import {conquestAugmentedAbility,augmentTiers} from './conquest-augments.js';
import {conquestProgress,syncConquestCampaign} from './conquest-progress.js';
import {conquestTechnique,conquestPassive} from './conquest-techniques.js';
import {objectiveGrowth} from './conquest-objectives.js';
import {boardCells,cellKey,cellLabel,findPath,occupied,sameCell,unitFacing,patternCells} from './tactical-board.js';
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
const root=document.getElementById('tactical-app');
const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const key='oblivium-conquest-augment-progress-v2',profileKey='pma-post-mortem-arena-v1';
function progress(){try{const stored=conquestProgress(JSON.parse(localStorage.getItem(key)||'{}')),profile=JSON.parse(localStorage.getItem(profileKey)||'null');return profile?syncConquestCampaign(profile,stored):stored;}catch{return conquestProgress();}}
const state={battle:null,run:createTacticalRun(progress()),actions:[],spends:{},selected:null,mode:'move',busy:false,snapshot:null,event:null,message:'',speed:1,seed:1,revision:0,rewards:[]};
let effects,worker,aiTask,job=0;
const units=s=>[...s.allies,...s.enemies];
const count=id=>state.actions.filter(a=>a.actorId===id).length;
const locked=()=>state.busy||state.battle.tactical.stage!=='planning'||Boolean(state.battle.tactical.plans.player);
const project=()=>previewTacticalPlan(tacticalView(state.battle,'player'),'player',state.actions);
// Previews indicate targets only; actors remain at the real tile until playback.
const displayed=()=>state.snapshot?{...state.battle,...state.snapshot,tactical:{...state.battle.tactical,...state.snapshot}}:state.battle;
const planned=()=>!state.snapshot&&state.battle.tactical.stage==='planning'?(project().projection||state.battle):state.battle;
const actor=s=>s.allies.find(u=>u.id===state.selected)||s.allies.find(u=>u.hp>0)||s.allies[0];
function saveProgress(){state.run.augmentProgress=conquestProgress(state.battle.tactical.fortress.progress);try{localStorage.setItem(key,JSON.stringify(state.battle.tactical.fortress.progress));}catch{}}
function areaIcon(unit,ability){
 const spec=fortressTechniqueSpec(state.battle,unit,ability),width=state.battle.tactical.width,height=state.battle.tactical.height,origin={x:Math.floor(width/2),y:Math.floor(height/2)},grid={tactical:{width,height}};
 const hit=new Set(patternCells(spec.pattern,origin,origin,[1,0],spec.length,grid).map(cellKey));
 return '<svg class="technique-area" viewBox="0 0 '+width*8+' '+height*8+'" role="img" aria-label="Área de ação">'+boardCells(grid).map(p=>'<rect x="'+(p.x*8+1)+'" y="'+(p.y*8+1)+'" width="6" height="6" rx="1" class="'+(hit.has(cellKey(p))?'area-hit':'area-empty')+'"/>').join('')+'</svg>';
}
function figure(unit,s){
 const current=state.event?.actorId===unit.id?state.event:null,facing=current?.orientation||unitFacing(s,unit),frame=tacticalSpriteFrame(unit,current,facing);
 const sign=frame?.directional?1:facing[0]<0?-1:1;
 const statuses=tacticalStatuses(unit,s),layers=[...new Set(statuses.map(e=>e.id.startsWith('dot:')?'affliction':e.id.startsWith('mark:')?'marked':e.id.startsWith('surface:')?'terrain-'+e.id.slice(8):e.id))],orders=!state.busy&&unit.side==='player'?state.actions.filter(a=>a.actorId===unit.id):[];
 const sprite=frame?'<span class="token-sprite"><span class="sprite-viewport"><img class="sprite-sheet" src="'+esc(frame.src)+'" alt="" style="'+tacticalSpriteInline(frame)+'"></span></span>':unit.art?.portrait?'<img class="token-art" src="'+esc(unit.art.portrait)+'" alt="">':'<i class="arena-creature-mark">'+esc(unit.symbol||'◆')+'</i>';
 return '<span class="token '+unit.side+'" data-unit-id="'+esc(unit.id)+'" data-family="'+esc(current?.family||'idle')+'" data-pose="'+esc(current?.pose||'ready')+'" data-sprite="'+Boolean(frame)+'" data-idle-atlas="false" style="'+tacticalFigureStyle(unit)+tacticalIdleStyle(unit)+'--facing-sign:'+sign+';--upgrade-growth:'+objectiveGrowth(unit.objectiveAugments||0)+';--pose-duration:'+tacticalFrameDuration(current||{})+'ms"><span class="conquest-model">'+sprite+'</span>'+(unit.id===state.selected&&!state.busy?'<i class="selected-unit-arrow" aria-hidden="true"></i>':'')+'<span class="tactical-status-vfx" aria-hidden="true">'+layers.map(layer=>'<i data-status-vfx="'+esc(layer)+'"></i>').join('')+'</span><span class="compact-token-label">'+esc(unit.name)+'</span>'+(orders.length?'<span class="compact-token-orders" aria-hidden="true">'+orders.map((a,i)=>'<b>'+(i+1)+' '+esc(actionName(unit,a))+'</b>').join('')+'</span>':'')+'</span>';
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
function techniques(s){
 const u=actor(s),readOnly=locked()||count(u.id)>=2||u.stunned||u.hp<=0;
 const chosen=u.abilities.find(a=>a.id===state.mode),passive=conquestPassive(u.passive);
 const cards=u.abilities.map(base=>{
  const a=conquestAugmentedAbility(s,u,conquestTechnique(base)),cooldown=u.cooldowns[a.id]||0,reason=skillSealReason(u,a)||tacticalRequirementReason(s,u,a);
  return '<button data-technique="'+esc(a.id)+'" aria-pressed="'+(state.mode===a.id)+'" '+(readOnly||cooldown||reason?'disabled':'')+' title="'+esc(reason||a.description)+'">'+(a.art?'<img src="'+esc(a.art)+'" alt="" decoding="async">':'')+'<span><b>'+esc(a.name)+'</b><small>'+esc(reason||(cooldown?'Em recarga · '+cooldown:fortressCooldown(a)?'Recarga '+fortressCooldown(a):'Sem recarga'))+'</small></span>'+areaIcon(u,a)+'</button>';
 }).join('');
 const hint=state.busy?'Planos em resolução. As técnicas continuam visíveis.':state.battle.tactical.stage==='reward'?'Escolha uma das melhorias para continuar.':state.message||chosen&&conquestAugmentedAbility(s,u,conquestTechnique(chosen)).description||(count(u.id)>=2?'Duas ações planejadas. Escolha outro aliado ou confirme a rodada.':'Escolha movimento ou técnica e toque na casa.');
 return '<aside class="arena-techniques"><h2>Técnicas · '+esc(u.name)+'</h2><section class="activation-dock" data-panel-locked="'+Boolean(readOnly)+'" aria-busy="'+state.busy+'" aria-label="Técnicas de '+esc(u.name)+'"><div class="compact-mode-controls"><button data-mode="move" aria-pressed="'+(state.mode==='move')+'" '+(readOnly?'disabled':'')+'>Mover <small>1 casa · 1 ação</small></button><button data-guard '+(readOnly?'disabled':'')+'>Guarda <small>+6 de Escudo · 1 ação</small></button></div><div class="activation-options">'+cards+'</div>'+specialChoices(u,chosen,readOnly)+'<p class="compact-hint" role="status">'+esc(hint)+'</p>'+(passive?'<details class="tactical-passive"><summary>Passiva · '+esc(passive.name)+'</summary><p>'+esc(passive.description)+'</p></details>':'')+'</section></aside>';
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
// Inline control directly over the board: all three actors, their two slots and six quick actions.
function actionDock(s,future){
 const u=actor(future),unavailable=locked()||count(u.id)>=2||u.hp<=0||u.stunned;
 const heroes='<div class="compact-roster-rail" aria-label="Plano de cada personagem">'+s.allies.map(hero=>{
  const orders=state.actions.filter(a=>a.actorId===hero.id);
  return '<div class="compact-roster-card '+(state.selected===hero.id?'is-active ':'')+(orders.length===2?'is-ready':'')+'"><button data-actor="'+esc(hero.id)+'" '+(locked()||hero.hp<=0||hero.stunned?'disabled':'')+' aria-pressed="'+(state.selected===hero.id)+'" title="Selecionar '+esc(hero.name)+'">'+(hero.art?.portrait?'<img src="'+esc(hero.art.portrait)+'" alt="">':'')+'<b>'+esc(hero.name)+'</b><small>'+(hero.hp<=0||hero.stunned?'Inativo':orders.length===2?'✓ 2/2':orders.length+'/2')+'</small></button><div class="compact-roster-slots">'+[0,1].map(i=>orders[i]?'<button data-drop="'+esc(hero.id)+'" data-slot="'+i+'" title="Retirar ação '+(i+1)+' de '+esc(hero.name)+'">'+(i+1)+' '+esc(actionName(hero,orders[i]))+'</button>':'<span>'+(i+1)+' · +</span>').join('')+'</div></div>';
 }).join('')+'</div>';
 const buttons='<div class="compact-quick-buttons" role="group" aria-label="Escolha rápida de ação"><button data-mode="move" aria-pressed="'+(state.mode==='move')+'" '+(unavailable?'disabled':'')+' title="Mover uma casa">↗<small>Mover</small></button><button data-guard '+(unavailable?'disabled':'')+' title="Guarda: +6 de Escudo">⬡<small>Guarda</small></button>'+u.abilities.map(base=>{
  const a=conquestAugmentedAbility(future,u,conquestTechnique(base)),cooldown=u.cooldowns[a.id]||0,reason=skillSealReason(u,a)||tacticalRequirementReason(future,u,a);
  return '<button data-technique="'+esc(a.id)+'" aria-pressed="'+(state.mode===a.id)+'" '+(unavailable||cooldown||reason?'disabled':'')+' title="'+esc(a.name+' — '+(reason||(cooldown?'Recarga '+cooldown:a.description)))+'">'+(a.art?'<img src="'+esc(a.art)+'" alt="">':'✦')+'<small>'+esc(a.name)+'</small></button>';
 }).join('')+'</div>';
 const hint=state.message||(state.mode==='move'?'Toque em uma casa vizinha':'Toque na casa-alvo da técnica');
 const footer='<div class="compact-quick-footer"><span role="status">'+state.actions.length+'/6 ações · '+esc(hint)+'</span><button data-undo '+(locked()||!state.actions.length?'disabled':'')+' title="Desfazer última ação" aria-label="Desfazer última ação">↶</button><button data-clear '+(locked()||!state.actions.length?'disabled':'')+' title="Limpar plano" aria-label="Limpar plano">×</button><button data-confirm '+(locked()?'disabled':'')+' title="Executar mesmo com menos de seis ações">▶ Agora</button></div>';
 return '<div class="compact-action-hub">'+heroes+buttons+footer+'</div>';
}
function planSummary(){
 return '<nav class="compact-plan" aria-label="Seu plano privado">'+state.battle.allies.map(u=>'<div><button data-actor="'+esc(u.id)+'" '+(locked()?'disabled':'')+'>'+esc(u.name)+' <small>'+count(u.id)+'/2</small></button><ol>'+state.actions.filter(a=>a.actorId===u.id).map(a=>'<li>'+esc(a.type==='move'?'Mover → '+cellLabel(a.path.at(-1)):a.type==='guard'?'Guarda':u.abilities.find(b=>b.id===a.abilityId)?.name)+'</li>').join('')+'</ol></div>').join('')+'</nav>';
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
 root.innerHTML='<div class="combat-shell fortress-battle compact-battle"><header class="combat-header"><a href="/">OBLIVIUM ARENA</a><span>Campo compacto · 6 × 6</span><a href="#compact-formation">Formação</a></header><section class="arena-stage compact-stage" data-scene="'+s.tactical.scene+'"><img class="arena-backdrop" src="'+combatScene(s.tactical.scene).art+'" alt="">'+hud(s)+tacticalCutinMarkup(actorEvent,ability,state.event)+'<div class="arena-field">'+techniques(future)+'<div class="compact-board-stack">'+actionDock(s,future)+board(s,future)+'</div></div><div class="compact-playback-tools"><div class="compact-speed" aria-label="Velocidade das animações">'+[1,2,3].map(n=>'<button data-speed="'+n+'" aria-pressed="'+(state.speed===n)+'">'+n+'×</button>').join('')+'<button data-sound aria-label="Som de combate" aria-pressed="'+audioEnabled()+'">♪</button></div></div><p class="compact-explainer">Primeiro as ações ① de todos, depois as ações ②. O personagem permanece na casa atual até a execução.</p>'+eventForecast(s)+reward()+result+'<p class="augment-progression">'+esc(conquestProgressText(s.tactical.fortress.progress))+'</p>'+(rule?'<p class="compact-rule">'+esc(rule.title+' · '+rule.text)+'</p>':'')+'<details class="compact-log"><summary>Resolução da rodada</summary><ol>'+[...state.battle.tactical.events].map(e=>'<li>'+esc(e.title)+(e.skipped?' · '+esc(e.reason):'')+'</li>').join('')+'</ol></details></section><div id="compact-formation">'+setup()+'</div></div>';
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
 if(hit?.side==='player'&&hit.id!==u.id){state.selected=hit.id;state.mode='move';state.message='';render();return;}
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
 if('drop'in d){
  let index=0;state.actions=state.actions.filter(a=>a.actorId!==d.drop||index++<Number(d.slot));
  const valid=[],view=tacticalView(state.battle,'player');
  for(const action of state.actions)if(previewTacticalPlan(view,'player',[...valid,action]).ok)valid.push(action);
  state.actions=valid;state.selected=d.drop;state.mode='move';state.message='';render();return;
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
