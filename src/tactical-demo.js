import {tacticalEnvironments} from './tactical-environment.js';
import {tacticalPlanningContext,explainTacticalPlan,tacticalResolutionFeedback,tacticalTrioIdentity} from './tactical-insight.js';
import {tacticalCutinMarkup,tacticalCutinActive,tacticalProjectileMarkup,tacticalReplayFrames} from './tactical-cinematic.js';
import {orderTacticalActions,tacticalFirstSide} from './tactical-order.js';
import {characterById,buffs} from './data.js';
import {tacticalRoutes,createTacticalRun,offerTacticalRewards,chooseTacticalReward,advanceTacticalRun} from './tactical-run.js';
import {createTacticalBattle,previewTacticalPlan,submitTacticalPlan,resolveTacticalRound,chooseTacticalChestReward,tacticalView,exchangeTacticalEssence,tacticalArea,tacticalTargets,tacticalUnits} from './tactical-combat.js';
import {planTacticalAI} from './tactical-ai.js';
import {boardCells,cellLabel,sameCell,findPath,cellKey,occupied,obstacle} from './tactical-board.js';
import {tacticalRoster,tacticalSpec,patternNames,priorityNames} from './tactical-kits.js';
import {tacticalAnimationFrames,tacticalFrameArt,tacticalImpactActive,tacticalFrameDuration,tacticalDamagedTargets} from './tactical-animation.js';
import {tacticalSpriteFrame,paintTacticalToken} from './tactical-sprites.js';
import {tacticalVfxMarkup} from './tactical-vfx.js';
import {getAbilityResourceCosts,resourceIds,resolveResourcePayment} from './resource-costs.js';
const root=document.getElementById('tactical-app');
const projectilePreload=new Image();projectilePreload.src='/art/animations/tactical-vfx-20261102/projectile-materials-v1.webp';
const names={essence:'Éter',cinza:'Cinza',graca:'Graça',ruptura:'Ruptura',random:'Coringa'};
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const state={compactReplay:false,playbackSpeed:1,planExpanded:!globalThis.matchMedia?.('(max-width: 700px)').matches,battle:null,run:createTacticalRun(),rewardChoices:[],chestOffer:null,draft:[],selected:null,mode:'move',anchor:null,payment:null,message:'',busy:false,lastEvents:[],seed:1,revision:0};
const costText=(u,a)=>Object.entries(getAbilityResourceCosts(u,a)).map(([k,n])=>`${n} ${names[k]||k}`).join(' + ')||'Sem custo';
const actionPreview=()=>previewTacticalPlan(state.battle,'player',state.draft,state.payment);
const shown=()=>state.playback?{...state.battle,...state.playback,tactical:{...state.battle.tactical,positions:state.playback.positions,chests:state.playback.chests||[],nextChest:state.playback.nextChest||null}}:state.battle;
const planningView=()=>{
 const editing=Number.isInteger(state.editIndex),index=editing?state.editIndex:state.draft.length;
 const actions=editing?state.draft:[...state.draft,{type:'move',actorId:state.selected,path:[]}];
 return tacticalPlanningContext(state.battle,'player',actions,index).projection;
};
let planInsightCache=[];
function privateInsightMarkup(){
 if(state.busy||state.chestOffer||state.battle.tactical.stage!=='planning')return '<div class="private-insight" hidden></div>';
 const ref=candidate(),index=Number.isInteger(state.editIndex)?state.editIndex:state.draft.length;
 const draft=ref?draftWithCandidate(ref):state.draft;
 const details=ref?explainTacticalPlan(state.battle,'player',draft):planInsightCache;
 const info=ref?details.find(d=>d.draftIndex===index):null;
 const view=planningView(),unit=selectedUnit(view),position=unit&&view.tactical.positions[unit.id];
 const own=details.filter(d=>d.actorId===state.selected);
 const combos=info?.combos||own.flatMap(d=>d.combos);
 return '<section class="private-insight" aria-label="Prévia privada"><div class="insight-top"><b>Seu plano · privado</b><span>'+esc(info?info.slot+'ª passagem · iniciativa '+info.turnRank:unit?unit.name+' · partida '+cellLabel(position):'Selecione um personagem')+'</span></div>'+(info?'<p><strong>'+esc(info.name)+'</strong> · parte de '+cellLabel(info.origin)+(info.type==='move'?' → '+cellLabel(info.destination):' · casas '+info.cells.map(cellLabel).join(', '))+'</p>'+(info.targets.length?'<p>Alvos nas posições atuais: '+esc(info.targets.map(u=>u.name).join(', '))+'.</p>':'')+(!info.ok?'<p class="insight-warning">'+esc(info.reason)+'</p>':'')+(info.conditional?'<p class="insight-condition">Atinge se o alvo permanecer na área. Posição e proteção podem alterar o resultado.</p>':''): '<p>Primeiro, todas as 1ª ações. Depois, todas as 2ª ações. Rivais intercalados pela iniciativa.</p>')+(combos.length?'<ul class="combo-notes">'+[...new Set(combos)].map(text=>'<li>↳ '+esc(text)+'</li>').join('')+'</ul>':'')+'</section>';
}
function actionDetailMarkup(unit){
 if(!unit||state.busy)return '';
 const ability=unit.abilities.find(a=>a.id===state.mode),count=state.draft.filter(a=>a.actorId===unit.id).length;
 const editing=Number.isInteger(state.editIndex),slot=editing?state.draft.slice(0,state.editIndex+1).filter(a=>a.actorId===unit.id).length:count+1;
 const status=ability?cardResourceStatus(unit,ability):{ok:true};
 return '<section class="action-detail" aria-label="Ação selecionada"><div><b>'+esc(ability?.name||'Movimento')+'</b><span>'+esc(editing?'Editando a '+slot+'ª ação':count>=2?'Duas ações prontas · toque em uma para editar':slot+'ª ação de '+unit.name)+'</span></div><p>'+esc(ability?.description||'Percorra até 2 casas livres, em linha reta ou diagonal. Custa 1 ação e nenhuma Essência.')+'</p><small class="'+(!status.ok?'insight-warning':'')+'">'+esc(ability?costText(unit,ability)+(status.ok?' · custo reservado ao adicionar':' · Essência insuficiente'): 'As casas numeradas mostram os destinos disponíveis.')+'</small></section>';
}
function playbackActionMarkup(){
 const event=state.animation;if(!state.busy||!event)return '';
 const unit=tacticalUnits(shown()).find(u=>u.id===event.actorId);
 const ability=unit?animationAbility(unit,event):null;
 const name=event.type==='move'?'Movimento':ability?.name||event.title;
 const route=event.type==='move'&&event.from&&event.to?cellLabel(event.from)+' → '+cellLabel(event.to):event.cells?.length?'Área: '+event.cells.map(cellLabel).join(', '):'';
 const notes=!event.skipped&&['impact','counter'].includes(event.pose)?tacticalResolutionFeedback(event):[];
 return '<section class="playback-action '+(event.side==='enemy'?'opponent':'')+'" aria-label="Ação em execução"><div><strong>'+esc(unit?(event.side==='enemy'?'Oponente · ':'Seu trio · ')+unit.name:'Arena')+'</strong><span>'+esc(event.slot===undefined?'Evento da rodada':(event.slot+1)+'ª ação')+'</span></div><b>'+esc(name)+'</b>'+(route?'<small>'+esc(route)+'</small>':'')+(event.reason?'<p>'+esc(event.reason)+'</p>':'')+(notes.length?'<ul class="action-result">'+notes.map(note=>'<li>'+esc(note)+'</li>').join('')+'</ul>':'')+'</section>';
}
function environmentMarkup(s){
 const rule=s.tactical.environment;if(!rule)return '';
 return '<div class="environment-rule '+esc(rule.id)+'" role="note"><strong>'+esc(rule.world)+' · '+esc(rule.title)+'</strong><span>'+esc(rule.text)+'</span><small>Mesma regra para os dois lados · depois da 2ª passagem</small></div>';
}
function environmentSelect(){return '<label>Regra ambiental<select id="environment-choice"><option value="none">Sem regra ambiental</option>'+tacticalEnvironments.map(r=>'<option value="'+r.id+'" '+(state.battle.tactical.environment?.id===r.id?'selected':'')+'>'+esc(r.world+' · '+r.title)+'</option>').join('')+'</select></label>';}
function chestObjectiveMarkup(s){
 const incoming=s.tactical.nextChest,chests=s.tactical.chests||[];
 if(!incoming&&!chests.length)return '';
 return '<div class="chest-objective" role="status"><b>◇ '+(incoming?'Baú na rodada '+incoming.round+' · '+cellLabel(incoming.position):'Baú disponível · '+chests.map(c=>cellLabel(c.position)).join(', '))+'</b><span>'+(incoming?'Posição pública para os dois lados. Prepare sua aproximação.':'Cause dano na casa do baú para escolher 1 de 3 aprimoramentos.')+'</span></div>';
}
function trioIdentityMarkup(){return '<details class="trio-identity"><summary>Como seu trio pode combinar</summary><div>'+tacticalTrioIdentity(state.battle.allies).map(n=>'<p><b>'+esc(n.title)+'</b><span>'+esc(n.text)+'</span></p>').join('')+'</div><small>Sinergias do kit. O resultado depende da área, da ordem e das defesas do rival.</small></details>';}
function syncPlaybackRate(){
 if(!state.busy)return;
 for(const animation of root.getAnimations?.({subtree:true})||[]){
  const target=animation.effect?.target;
  if(target?.closest?.('.arena-stage,.arena-toolbar')&&!target.closest('.token[data-family="idle"]'))animation.playbackRate=state.playbackSpeed;
 }
}
function playbackControls(){return '<nav class="playback-controls" aria-label="Velocidade das animações"><span>Ritmo</span>'+[1,2,3].map(n=>'<button data-speed="'+n+'" aria-pressed="'+(state.playbackSpeed===n)+'">'+n+'×</button>').join('')+'<button data-command="compact-replay" class="compact-replay" aria-pressed="'+state.compactReplay+'" title="Encurta ativações repetidas; preserva eliminações e transformações.">Repetições curtas</button></nav>';}
function routeMarkup(){return '<section class="route-choices"><h3>Escolha a próxima trilha</h3><p>A Vida e os aprimoramentos da expedição acompanham o trio.</p><div>'+tacticalRoutes.map(r=>'<button data-route="'+r.id+'"><small>'+esc(r.kind)+'</small><strong>'+esc(r.title)+'</strong><em>'+esc(r.story)+'</em><span>'+esc(r.text)+'</span></button>').join('')+'</div></section>';}
function activeAugmentsMarkup(){
 if(state.busy)return '';
 const augments=(state.battle.tactical.augments?.player||[]).filter(a=>!a.expiresAt||a.expiresAt>=state.battle.round);
 return augments.length?'<div class="active-augments" aria-label="Aprimoramentos deste combate">'+augments.map(a=>'<span title="'+esc(a.type==='step-ward'?'Mover gera '+a.amount+' de Escudo, uma vez por alma por rodada.':a.type==='round-essence'?'Gera 1 Essência ao fim de cada rodada, até a rodada '+a.expiresAt+'.':'Dano em Exposto gera 1 Essência, uma vez por rodada.')+'">◆ '+esc(a.title)+'</span>').join('')+'</div>':'';
}
const activeAnchor=()=>state.anchor||state.hoverAnchor;
const selectedUnit=s=>s.allies.find(u=>u.id===state.selected&&u.hp>0);
const formFor=(s,a)=>s.allies.find(u=>u.id===a.actorId)?.abilities.find(k=>k.id===a.abilityId);
let movementChoiceCache=null;
function movementChoices(s=planningView()){
 if(movementChoiceCache)return movementChoiceCache;
 const unit=selectedUnit(s),paths=new Map(),reasons=new Map();
 const editing=Number.isInteger(state.editIndex),count=state.draft.filter(a=>a.actorId===unit?.id).length;
 const reason=state.busy||state.chestOffer||s.tactical.stage!=='planning'?'Aguarde o planejamento.':!unit?'Selecione um personagem.':unit.stunned?'Personagem atordoado.':!editing&&count>=2?'Duas ações escolhidas. Edite um espaço para mudar o movimento.':'';
 const origin=unit?s.tactical.positions[unit.id]:null;
 if(!reason&&origin)for(const point of boardCells()){
  const path=findPath(s,unit.id,point);if(!path)continue;
  const check=candidateCheck({type:'move',actorId:unit.id,path});
  if(check.ok)paths.set(cellKey(point),path);else reasons.set(cellKey(point),check.reason);
 }
 return movementChoiceCache={unit,origin,paths,reasons,reason};
}
function movementPreview(s=planningView()){
 const destination=activeAnchor(),options=movementChoices(s);if(!options.unit||!destination)return null;
 const {origin,unit}=options,found=options.paths.get(cellKey(destination));
 if(found)return {origin,destination,path:found,valid:true,reason:''};
 const path=findPath(s,unit.id,destination,24)||[],at={...origin};
 if(!path.length)while(!sameCell(at,destination)&&path.length<5){at.x+=Math.sign(destination.x-at.x);at.y+=Math.sign(destination.y-at.y);path.push({...at});}
 const reason=options.reason||options.reasons.get(cellKey(destination))||(sameCell(origin,destination)?'Esta é a casa de partida.':obstacle(s,destination)?'Obstáculo: escolha uma casa livre.':occupied(s,destination,unit.id)?'Casa ocupada: escolha uma casa livre.':findPath(s,unit.id,destination,24)?'Fora do alcance: no máximo 2 passos.':'Caminho bloqueado: não há passagem livre.');
 return {origin,destination,path,valid:false,reason};
}
function movementGuideMarkup(s=planningView()){
 if(state.mode!=='move'||state.busy||state.chestOffer||s.tactical.stage!=='planning')return '';
 const options=movementChoices(s),move=movementPreview(s),actual=options.unit?state.battle.tactical.positions[options.unit.id]:null,projected=options.origin&&actual&&!sameCell(options.origin,actual);
 const route=move?.valid?[move.origin,...move.path].map(cellLabel).join(' → '):'';
 const priorCount=options.unit?(Number.isInteger(state.editIndex)?state.draft.slice(0,state.editIndex):state.draft).filter(a=>a.actorId===options.unit.id).length:0;
 const originText=options.origin?(projected?'Partida planejada: ':'Partida: ')+cellLabel(options.origin)+(projected?' · após '+priorCount+(priorCount===1?' ação planejada':' ações planejadas'):''):'';
 return '<div class="movement-guide" role="status"><strong>'+esc(options.unit?.name||'Movimento')+' · Movimento</strong><span class="movement-origin-copy">'+esc(originText)+'</span><span class="movement-status '+(move&&!move.valid?'invalid':'')+'">'+esc(move?(move.valid?cellLabel(move.destination)+' · '+move.path.length+'/2 passos · 1 ação':move.reason):options.reason||options.paths.size+' destinos disponíveis · escolha uma casa marcada')+'</span>'+(route?'<span class="movement-route">'+esc(route)+'</span>':'')+'<span class="movement-legend"><i class="step-one">1</i> um passo <i class="step-two">2</i> dois passos <small>↗ Diagonais permitidas</small></span>'+(state.anchor?'<span class="movement-input-hint">'+(move?.valid?'Toque novamente no destino para '+(Number.isInteger(state.editIndex)?'salvar':'adicionar')+'.':'Escolha outra casa marcada.')+'</span><button class="movement-cancel" data-command="cancel-target" aria-label="Cancelar prévia do movimento">✕</button>':'')+'</div>';
}
function movementStepMarkup(move,point){
 if(!move?.valid)return '';
 const index=move.path.findIndex(step=>sameCell(step,point));if(index<0)return '';
 const destination=index===move.path.length-1;
 return '<span class="route-step '+(destination?'route-destination':'')+'" aria-hidden="true"><b>'+(index+1)+'</b>'+(destination?'<small>DESTINO</small>':'')+'</span>';
}
function movementTrailMarkup(move){
 if(!move||!move.path.length)return '';
 const points=[move.origin,...move.path].map(p=>(p.x*100+50)+','+(p.y*100+86)).join(' '),color=move.valid?'#94edf5':'#ff6666';
 return '<svg class="preview-path '+(move.valid?'':'invalid')+'" viewBox="0 0 500 500" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="movement-arrow" markerWidth="10" markerHeight="10" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="'+color+'"/></marker></defs><polyline class="path-glow" points="'+points+'" stroke="'+color+'"/><polyline class="path-trail" points="'+points+'" stroke="'+color+'" marker-end="url(#movement-arrow)"/></svg>';
}
function paintPlanningPreview(){
 const board=root.querySelector('.board');if(!board||state.busy)return;
 const plan=planningView(),move=state.mode==='move'?movementPreview(plan):null,cells=new Set(aimed(plan).map(cellKey)),unit=selectedUnit(plan),ability=unit?.abilities.find(a=>a.id===state.mode);
 const targets=new Set(ability&&activeAnchor()?tacticalTargets(plan,unit,ability,activeAnchor(),orientation(plan,unit,activeAnchor())):[]);
 board.querySelectorAll('.move-hologram,.preview-path,.route-step').forEach(e=>e.remove());
 for(const cell of board.querySelectorAll('[data-cell]')){
  const [x,y]=cell.dataset.cell.split(',').map(Number);cell.insertAdjacentHTML('beforeend',movementStepMarkup(move,{x,y}));
  cell.classList.toggle('aim',cells.has(cell.dataset.cell));
  cell.classList.toggle('aim-danger',Boolean(move&&!move.valid&&cells.has(cell.dataset.cell)));
  cell.classList.toggle('preview-target',targets.has(cell.querySelector('.token')?.dataset.unitId));
 }
 const guide=root.querySelector('.movement-guide');if(guide)guide.outerHTML=movementGuideMarkup(plan);
 const insight=root.querySelector('.private-insight');if(insight)insight.outerHTML=privateInsightMarkup();
 if(move){board.insertAdjacentHTML('afterbegin',movementTrailMarkup(move));board.querySelector('[data-cell="'+cellKey(move.destination)+'"]')?.insertAdjacentHTML('beforeend',ghostMarkup(unit,!move.valid));}
}
function aimed(s){s=planningView();const u=selectedUnit(s);if(!u)return [];if(state.mode==='move')return movementPreview(s)?.path||[];const a=u.abilities.find(a=>a.id===state.mode);return a&&activeAnchor()?tacticalArea(s,u,a,activeAnchor(),orientation(s,u,activeAnchor())):[];}
function orientation(s,u,anchor){const origin=s.tactical.positions[u.id],dx=Math.sign(anchor.x-origin.x),dy=Math.sign(anchor.y-origin.y);return [dx||(!dy?1:0),dy];}
function candidate(){
 const s=planningView(),u=selectedUnit(s);if(!u||!activeAnchor())return null;
 if(state.mode==='move'){const path=findPath(s,u.id,activeAnchor());return path?{type:'move',actorId:u.id,path}:null;}
 const a=u.abilities.find(a=>a.id===state.mode);if(!a)return null;
 return {type:'skill',actorId:u.id,abilityId:a.id,formKey:a.formKey||'base',anchor:{...activeAnchor()},orientation:orientation(s,u,activeAnchor())};
}
function draftWithCandidate(ref){const draft=[...state.draft];if(Number.isInteger(state.editIndex))draft[state.editIndex]=ref;else draft.push(ref);return draft;}
function candidateCheck(ref){
 const draft=draftWithCandidate(ref),result=previewTacticalPlan(state.battle,'player',draft);
 if(result.ok||!Number.isInteger(state.editIndex))return result;
 // Editing an earlier action may invalidate a later one; validate only through the edited slot.
 const ordered=orderTacticalActions(state.battle,draft.map((a,order)=>({...a,side:'player',order})));
 const at=ordered.findIndex(a=>a.order===state.editIndex);
 const prefix=previewTacticalPlan(state.battle,'player',ordered.slice(0,at+1));
 return prefix.ok?{...prefix,needsReview:true,reason:result.reason}:result;
}
function rememberPlan(){state.planHistory??=[];state.planHistory.push(JSON.parse(JSON.stringify(state.draft)));if(state.planHistory.length>20)state.planHistory.shift();}
function cancelTarget(){state.anchor=null;state.hoverAnchor=null;state.editIndex=null;state.message='';}
function selectActor(id){cancelTarget();state.selected=id;state.mode='move';render();}
function addAction(){
 const ref=candidate();if(!ref){state.message='Escolha uma casa válida.';render();return;}
 const draft=draftWithCandidate(ref),p=candidateCheck(ref);
 if(!p.ok){state.message=p.reason;render();return;}
 const edited=Number.isInteger(state.editIndex);rememberPlan();state.draft=draft;state.payment=null;cancelTarget();
 state.message=edited?(p.needsReview?'Ação atualizada. Revise os espaços destacados antes de iniciar a rodada.':'Ação atualizada.'):state.draft.filter(a=>a.actorId===state.selected).length===2?'Personagem pronto. Edite os espaços ou escolha o próximo personagem.':'1ª ação escolhida. Selecione agora a 2ª ação.';render();
}
function actionName(ref){
 const unit=state.battle.allies.find(u=>u.id===ref.actorId),base=unit?.skillBook.find(a=>a.id===ref.abilityId),variant=base?.forms?.find(f=>f.formKey===ref.formKey);
 return ref.type==='move'?'Mover · '+cellLabel(ref.path.at(-1)):variant?.name||base?.name||'Técnica';
}
function editAction(index){
 const ref=state.draft[index];if(!ref)return;state.editIndex=index;state.selected=ref.actorId;state.mode=ref.type==='move'?'move':ref.abilityId;state.hoverAnchor=null;
 state.anchor={...(ref.type==='move'?ref.path.at(-1):ref.anchor)};state.message='Altere a carta ou a casa. Toque novamente no alvo para salvar.';render();focusArena();
}
function focusArena(){requestAnimationFrame(()=>root.querySelector('.arena-toolbar')?.scrollIntoView({behavior:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}));}
function visiblePlan(){return state.executionPlan?.actions||state.draft;}
function planSlotStatus(index){
 if(state.executionPlan){
  const ref=state.executionPlan.actions[index],slot=state.executionPlan.details.find(d=>d.draftIndex===index)?.slot-1;
  const matches=e=>e?.side==='player'&&e.actorId===ref.actorId&&e.slot===slot;
  if(matches(state.animation))return {kind:'executing',label:'Em ação',reason:state.animation.reason||''};
  const done=(state.completedEvents||[]).findLast(matches);
  const interrupted=done&&(done.skipped||done.type==='move'&&Boolean(done.reason));
  return done?{kind:interrupted?'interrupted':'completed',label:interrupted?'Interrompida':'Concluída',reason:done.reason||''}:{kind:'waiting',label:'Aguardando',reason:''};
 }
 const info=planInsightCache.find(d=>d.draftIndex===index);
 return info&&!info.ok?{kind:'needs-review',label:'Revisar',reason:info.reason}:{kind:'',label:'Editar',reason:''};
}
function selectedPlanMarkup(){
 if(state.busy&&state.animation?.side!=='player')return '';
 const unit=state.battle.allies.find(u=>u.id===(state.executionPlan&&state.animation?.side==='player'?state.animation.actorId:state.selected));if(!unit)return '';
 const refs=visiblePlan().map((a,i)=>({a,i})).filter(({a})=>a.actorId===unit.id);
 return '<div class="selected-plan" aria-label="Ações de '+esc(unit.name)+'">'+[0,1].map(slot=>{
  const item=refs[slot],editing=item&&state.editIndex===item.i,status=item?planSlotStatus(item.i):null;
  return '<button class="selected-slot '+(item?'filled':'empty')+(editing?' editing':'')+(status?.kind?' '+status.kind:'')+'" '+(item?'data-edit="'+item.i+'"':'data-slot-actor="'+esc(unit.id)+'"')+' '+(state.busy||!item&&slot>refs.length?'disabled':'')+' '+(status?.kind==='executing'?'aria-current="step" ':'')+'title="'+esc(status?.reason||status?.label||'Adicionar ação')+'" aria-label="'+(item?status.label:'Adicionar')+' '+(slot+1)+'ª ação de '+esc(unit.name)+'"><b>'+(slot+1)+'</b><span>'+esc(item?actionName(item.a):'Escolher ação')+'</span>'+(item?'<small class="slot-status">'+esc(status.label)+'</small>':'')+'</button>';
 }).join('<span class="sequence-link" aria-hidden="true">→</span>')+'</div>';
}
function nextPlanner(){
 const units=state.battle.allies.filter(u=>u.hp>0),index=units.findIndex(u=>u.id===state.selected);
 const next=Array.from({length:units.length},(_,i)=>units[(index+i+1)%units.length]).find(u=>state.draft.filter(a=>a.actorId===u.id).length<2);
 if(next){selectActor(next.id);focusArena();}
}
function partyTabs(){
 return '<nav class="party-tabs" aria-label="Selecionar personagem">'+shown().allies.map((u,i)=>{const count=visiblePlan().filter(a=>a.actorId===u.id).length;return '<button class="party-tab '+(u.id===state.selected?'selected':'')+(state.busy&&state.animation?.actorId===u.id?' acting':'')+'" data-actor="'+esc(u.id)+'" aria-pressed="'+(u.id===state.selected)+'" '+(state.busy||u.hp<=0?'disabled':'')+'><img src="'+esc(portraitSrc(u))+'" alt=""><span><strong>'+esc(u.name)+'</strong><small>'+(state.busy?(state.animation?.actorId===u.id?'Em ação':'Aguardando'):count+'/2 · '+(u.hp<=0?'derrotado':count===2?'pronto':'planejar'))+'</small></span><span class="action-pips">'+[0,1].map(n=>'<i class="'+(count>n?'filled':'')+'"></i>').join('')+'</span><kbd>'+(i+1)+'</kbd></button>';}).join('')+'</nav>';
}
function queueMarkup(){
 const p=actionPreview(),locked=state.busy;
 return '<section class="squad-timeline" aria-label="Sequência editável do trio"><div class="timeline-heading"><strong>Plano do trio</strong><span>1ª passagem</span><span>2ª passagem</span></div>'+state.battle.allies.map(u=>{
  const refs=visiblePlan().map((a,i)=>({a,i})).filter(({a})=>a.actorId===u.id);
  return '<div class="timeline-row '+(u.id===state.selected?'selected':'')+(state.executionPlan&&state.animation?.actorId===u.id?' acting':'')+'"><button class="timeline-actor" data-actor="'+esc(u.id)+'" '+(locked||u.hp<=0?'disabled':'')+' title="Selecionar '+esc(u.name)+'"><img src="'+esc(portraitSrc(u))+'" alt=""><b>'+esc(u.name)+'</b></button>'+[0,1].map(slot=>{const item=refs[slot],info=item&&(state.executionPlan?.details||planInsightCache).find(d=>d.draftIndex===item.i),status=item?planSlotStatus(item.i):null;return item?'<button class="plan-slot occupied '+(state.editIndex===item.i?'editing':'')+(status.kind?' '+status.kind:'')+'" '+(status.kind==='executing'?'aria-current="step" ':'')+'title="'+esc(status.reason||status.label)+'" data-edit="'+item.i+'" '+(locked?'disabled':'')+' aria-label="'+status.label+' '+(slot+1)+'ª ação de '+esc(u.name)+': '+esc(actionName(item.a))+'"><span class="slot-icon">'+(item.a.type==='move'?'↗':'◆')+'</span><strong>'+esc(actionName(item.a))+'</strong>'+(info?.combos.length?'<span class="slot-combo" title="'+esc(info.combos.join(' '))+'">↳</span>':'')+'<small class="slot-status">'+esc(status.label)+'</small>'+(status.kind==='needs-review'?'<span class="slot-reason">'+esc(status.reason)+'</span>':'')+'</button>':'<button class="plan-slot empty" data-slot-actor="'+esc(u.id)+'" '+(locked||u.hp<=0||slot>refs.length?'disabled':'')+' aria-label="Adicionar '+(slot+1)+'ª ação de '+esc(u.name)+'"><b>＋</b><span>Adicionar ação</span></button>';}).join('')+'</div>';
 }).join('')+(!locked&&!p.ok?'<p class="plan-error" role="status">'+esc(p.reason)+'</p>':'')+'</section>';
}
function editTools(){
 if(!Number.isInteger(state.editIndex))return '';
 const ref=state.draft[state.editIndex],siblings=state.draft.map((a,i)=>a.actorId===ref.actorId?i:-1).filter(i=>i>=0);
 return '<div class="edit-tools"><strong>Editando '+esc(actionName(ref))+'</strong><button data-command="swap-actions" '+(siblings.length!==2?'disabled':'')+'>Inverter 1 ↔ 2</button><button data-command="remove-edit">Remover</button><button data-command="cancel-target">Cancelar edição</button></div>';
}
function targetHint(){
 if(state.busy)return '<span>Ações em execução. Acompanhe o personagem destacado e ajuste o ritmo acima.</span>';
 if(!Number.isInteger(state.editIndex)&&state.draft.filter(a=>a.actorId===state.selected).length>=2)return '<span>Duas ações prontas. Toque em 1 ou 2 para editar, ou selecione outro personagem.</span>';
 if(!state.anchor)return state.mode==='move'?'<span>Casas marcadas: destinos válidos. Toque para ver o caminho; toque novamente para adicionar.</span>':'<span>Escolha uma carta e toque na grade para ver a prévia.</span>';
 const ref=candidate(),check=ref?candidateCheck(ref):null;
 return '<span class="'+(check?.ok?'valid':'invalid')+'">'+(check?.ok?(Number.isInteger(state.editIndex)?'Toque novamente no alvo para salvar a alteração'+(check.needsReview?' · será necessário revisar as ações seguintes':''):state.mode==='move'?'Toque novamente nesta casa para adicionar o movimento':'Toque novamente no alvo ou na carta pessoal para adicionar a técnica'):'Destino ou ação indisponível')+' <kbd>Enter</kbd></span><button data-command="cancel-target" title="Cancelar seleção">✕</button>';
}
function portraitSrc(unit){return unit?.art?.portrait||'';}
function animationAbility(unit,event){const base=event?.abilityId?unit?.abilities.find(k=>k.id===event.abilityId):null;if(!base)return null;const key=event.formKey;if(!key||key===(base.formKey||'base'))return base;return base._formRoot?.forms?.find(form=>form.formKey===key)||base.forms?.find(form=>form.formKey===key)||base;}
function patternGrid(pattern){
 const hot={self:[4],cell:[4],line:[3,4,5],cross:[1,3,4,5,7],square:[0,1,2,3,4,5,6,7,8],x:[0,2,4,6,8]}[pattern]||[4];
 return '<span class="area-preview" aria-hidden="true">'+Array.from({length:9},(_,i)=>'<i class="'+(i===4?'origin ':'')+(hot.includes(i)?'hot':'')+'"></i>').join('')+'</span>';
}
function cardCostMarkup(actor,ability){
 const entries=Object.entries(getAbilityResourceCosts(actor,ability));
 if(!entries.length)return '<span class="cost-free">SEM CUSTO</span>';
 return entries.map(([id,count])=>'<span class="cost-item" title="'+esc(count+' '+(names[id]||id))+'">'+Array.from({length:count},()=>'<i class="cost-pip '+esc(id)+'" aria-hidden="true"></i>').join('')+' '+esc(names[id]||id)+'</span>').join('');
}
function cardResourceStatus(actor,ability){
 if(state.busy)return {ok:true};
 const preview=actionPreview(),reserved=preview.ok?{...preview.payment.fixed,random:preview.payment.required}:{};
 const costFor=ref=>{
  if(ref.type!=='skill')return {};
  const unit=state.battle.allies.find(u=>u.id===ref.actorId);
  const base=unit?.skillBook.find(a=>a.id===ref.abilityId)||unit?.abilities.find(a=>a.id===ref.abilityId);
  const skill=base?.forms?.find(a=>a.formKey===ref.formKey)||base;
  return unit&&skill?getAbilityResourceCosts(ref.actorId===actor.id?actor:unit,skill):{};
 };
 if(!preview.ok)for(const ref of state.draft)for(const [id,n]of Object.entries(costFor(ref)))reserved[id]=(reserved[id]||0)+n;
 if(Number.isInteger(state.editIndex))for(const [id,n]of Object.entries(costFor(state.draft[state.editIndex])))reserved[id]=Math.max(0,(reserved[id]||0)-n);
 for(const [id,n]of Object.entries(getAbilityResourceCosts(actor,ability)))reserved[id]=(reserved[id]||0)+n;
 return resolveResourcePayment(reserved,state.battle.resources);
}
function actionCardMarkup(actor,ability,isMove=false){
 const spec=isMove?{pattern:'line',range:2,priority:0}:tacticalSpec(actor,ability);
 const mode=isMove?'move':ability.id,selected=state.busy?(isMove?state.animation?.type==='move':state.animation?.abilityId===ability?.id):state.mode===mode,art=isMove?portraitSrc(actor):(ability.art||portraitSrc(actor));
 const label=isMove?'MOVIMENTO':priorityNames[spec.priority].toUpperCase(),name=isMove?'Movimento':ability.name;
 const power=ability&&(ability.damage?'DANO '+ability.damage:ability.dots?'DANO '+ability.dots[0]:ability.dot?'AFIÇÃO '+ability.dot:ability.heal?'CURA '+ability.heal:ability.shield?'DEFESA '+ability.shield:'');
 const description=isMove?'Até duas células · ortogonal ou diagonal':(spec.range?patternNames[spec.pattern]+' · alcance '+spec.range:'Próprio usuário')+(power?' · '+power:'');
 const full=!Number.isInteger(state.editIndex)&&state.draft.filter(a=>a.actorId===actor.id).length>=2;
 const cost=isMove?'<span class="cost-free">LIVRE</span>':cardCostMarkup(actor,ability),blocked=full||state.busy||Boolean(state.chestOffer)||(!isMove&&(actor.cooldowns[ability.id]||actor.stunned));
 const resourceStatus=isMove?{ok:true}:cardResourceStatus(actor,ability),unaffordable=!resourceStatus.ok;
 const heat=patternGrid(isMove?'square':spec.pattern);
 return '<button class="skill action-card '+(unaffordable?'essence-unavailable':'')+'" data-resource-affordable="'+!unaffordable+'" title="'+esc(full?'Duas ações escolhidas. Toque em um espaço para editar.':actor.stunned?'Personagem atordoado.':!isMove&&actor.cooldowns[ability.id]?'Recarga: '+actor.cooldowns[ability.id]+' rodada(s).':unaffordable?'Essência insuficiente para adicionar esta habilidade ao plano.':'')+'" data-mode="'+esc(mode)+'" aria-pressed="'+selected+'" aria-label="'+esc(name+'; '+description+'; '+(isMove?'1 ação, sem custo':costText(actor,ability))+(unaffordable?'; Essência insuficiente':''))+'" '+(blocked?'disabled':'')+'>'+
 '<span class="card-head"><span class="card-art">'+(art?'<img src="'+esc(art)+'" alt="" loading="lazy">':'')+'<span class="card-type">'+esc(label)+'</span></span><span class="card-title"><strong>'+esc(name)+'</strong><small>'+esc(description)+'</small></span></span>'+
 '<span class="card-pattern">'+heat+'<span class="area-label">'+(isMove?'2 casas':esc(patternNames[spec.pattern]))+'</span></span>'+
 '<span class="card-footer"><span class="card-cost">'+cost+'</span><span class="action-point">1 AÇÃO</span></span></button>';
}
function arenaHudMarkup(s){
 const team=(units,side)=>'<div class="hud-team hud-'+side+'">'+units.map(unit=>'<button class="hud-unit '+(state.selected===unit.id?'selected':'')+' '+(state.animation?.actorId===unit.id?'acting':'')+'" '+(side==='player'?'data-actor="'+esc(unit.id)+'"':'')+' '+(unit.hp<=0||state.busy?'disabled':'')+' title="'+esc(unit.name)+'"><img src="'+esc(portraitSrc(unit))+'" alt=""><span class="hud-unit-copy"><b>'+esc(unit.name)+'</b><small>'+Math.max(0,unit.hp)+' PV</small><i><em style="width:'+Math.max(0,unit.hp/unit.maxHp*100)+'%"></em></i></span></button>').join('')+'</div>';
 return '<div class="arena-hud">'+team(s.allies,'player')+'<div class="hud-round"><small>RODADA</small><b>'+s.round+'</b></div>'+team(s.enemies,'enemy')+'</div>';
}
function unitEffects(u){
 const effects=[];
 for(const [key,icon,label]of [['stunned','✦','Atordoado'],['weakened','↓','Enfraquecido'],['exposed','◎','Exposto'],['shield','◇','Escudo'],['invulnerable','⬡','Invulnerável'],['regen','✚','Regeneração'],['marked','⌖','Marcado']])if(u?.[key])effects.push({icon,label:label+' '+(typeof u[key]==='number'?u[key]:'')});
 for(const [key,icon,label]of [['reduce','⬡','Redução de dano'],['counter','↩','Contra-ataque'],['sealAttack','⊘','Ataque selado'],['sealSupport','⊘','Apoio selado'],['damageBoost','↑','Dano aumentado'],['reflect','↪','Reflexão'],['taunt','⌖','Provocação']])if(u?.[key])effects.push({icon,label});
 for(const key of ['effects','statuses','buffs','marks'])if(Array.isArray(u?.[key]))for(const e of u[key])effects.push({icon:'◆',label:typeof e==='string'?e:e.name||e.title||e.label||'Efeito ativo'});
 for(const dot of u?.dots||[])effects.push({icon:'♨',label:(dot.name||dot.type||'Dano contínuo')+' · '+(dot.turns??dot.duration??'')});
 return effects;
}
function effectsMarkup(u){return '<span class="unit-effects">'+unitEffects(u).map(e=>'<i title="'+esc(e.label)+'" aria-label="'+esc(e.label)+'">'+e.icon+'</i>').join('')+'</span>';}
function ghostMarkup(unit,invalid=false){
 const f=tacticalSpriteFrame(unit);
 return f?'<span class="move-hologram '+(invalid?'invalid':'')+'" aria-hidden="true"><span class="token-sprite"><span class="sprite-viewport"><img class="sprite-sheet" alt="" src="'+esc(f.src)+'" style="width:'+f.sheetColumns*100+'%;height:'+f.sheetRows*100+'%;left:'+(-f.column*100)+'%;top:'+(-f.row*100)+'%"></span></span></span>':'';
}
function displaySnapshot(){const s=state.battle;return JSON.parse(JSON.stringify({allies:s.allies,enemies:s.enemies,resources:s.resources,enemyResources:s.enemyResources,round:s.round,positions:s.tactical.positions,chests:s.tactical.chests,nextChest:s.tactical.nextChest||null}));}
function combatDelta(unit,event){
 if(!event?.before||!event?.after||!['impact','counter'].includes(event.pose))return '';
 const before=[...event.before.allies,...event.before.enemies].find(u=>u.id===unit.id),after=[...event.after.allies,...event.after.enemies].find(u=>u.id===unit.id);if(!before||!after)return '';
 const hp=after.hp-before.hp,shield=(after.shield||0)-(before.shield||0);
 return hp?'<span class="combat-number '+(hp>0?'healing':'damage')+'">'+(hp>0?'+':'')+hp+'</span>':shield?'<span class="combat-number shielding">◇ '+(shield>0?'+':'')+shield+'</span>':'';
}
function fallenAt(point,event){
 if(!event?.before||!event?.after||!['impact','counter'].includes(event.pose))return '';
 const after=new Map([...event.after.allies,...event.after.enemies].map(u=>[u.id,u]));
 const unit=[...event.before.allies,...event.before.enemies].find(u=>u.hp>0&&after.get(u.id)?.hp<=0&&sameCell(event.before.positions[u.id],point));
 return unit?ghostMarkup(unit).replace('move-hologram','falling-unit '+(unit.side==='enemy'?'enemy':''))+combatDelta(unit,event):'';
}
function changedUnits(event){
 const before=new Map([...(event?.before?.allies||[]),...(event?.before?.enemies||[])].map(u=>[u.id,u]));
 return [...(event?.after?.allies||[]),...(event?.after?.enemies||[])].filter(u=>{const b=before.get(u.id);return b&&(b.hp!==u.hp||JSON.stringify(unitEffects(b))!==JSON.stringify(unitEffects(u)));}).map(u=>u.id);
}
function compactResources(s){
 const p=state.busy?{ok:false}:actionPreview(),pool=s.resources||{};
 return '<div class="essence-strip" aria-label="Essências disponíveis">'+resourceIds.map(id=>'<button class="essence-square '+id+'" data-resource-menu="'+id+'" title="'+names[id]+' · '+(pool[id]||0)+' disponível" aria-label="'+names[id]+' '+(pool[id]||0)+' · abrir conversão"><i></i><b>'+(pool[id]||0)+'</b>'+(p.ok&&p.remaining[id]!==pool[id]?'<small>→'+p.remaining[id]+'</small>':'')+'</button>').join('')+'</div>';
}
function turnOrderMarkup(s){
 const first=tacticalFirstSide(s),units=s.allies.flatMap((u,i)=>first==='player'?[u,s.enemies[i]]:[s.enemies[i],u]).filter(Boolean);
 return '<div class="turn-order" aria-label="Ordem da rodada"><span>'+(state.busy?'EXECUTANDO':'ORDEM')+'</span>'+units.map((u,i)=>'<span class="turn-face '+(state.animation?.actorId===u.id?'acting':'')+'" title="'+(i+1)+' · '+esc(u.name)+'"><img src="'+esc(portraitSrc(u))+'" alt="'+esc(u.name)+'"><b>'+(i+1)+'</b></span>').join('')+'<small>1ª ação → 2ª ação</small></div>';
}

function boardMarkup(s){
 const plan=planningView(),options=state.mode==='move'&&!state.busy?movementChoices(plan):null,movement=state.mode==='move'?movementPreview(plan):null,ability=selectedUnit(plan)?.abilities.find(a=>a.id===state.mode),affected=new Set(ability&&activeAnchor()?tacticalTargets(plan,selectedUnit(plan),ability,activeAnchor(),orientation(plan,selectedUnit(plan),activeAnchor())):[]),ghost=movement?.destination||null;
 const aim=new Set(aimed(s).map(cellKey)),u=selectedUnit(s),anim=state.animation,impact=tacticalImpactActive(anim),wave=new Set((impact?anim?.cells||[]:[]).map(cellKey)),hits=new Set(tacticalDamagedTargets(anim));
 return '<div class="board '+(options?'movement-mode':'')+'" role="group" aria-label="Arena tática em grade de cinco por cinco">'+movementTrailMarkup(movement)+tacticalProjectileMarkup(anim?tacticalUnits(s).find(u=>u.id===anim.actorId):null,anim?animationAbility(tacticalUnits(s).find(u=>u.id===anim.actorId),anim):null,anim)+boardCells().map(p=>{
  const environment=s.tactical.environment,environmentCell=environment&&sameCell(environment.position,p);
  const unit=occupied(s,p),chest=s.tactical.chests.find(item=>sameCell(item.position,p)),blocked=obstacle(s,p),reachable=options?.paths.get(cellKey(p)),origin=options?.origin&&sameCell(options.origin,p);
  const classes=['cell',environmentCell?'environment-cell environment-'+environment.id:'',environmentCell&&anim?.type==='environment'&&anim.pose==='impact'?'environment-contact':'',blocked?'blocked':'',chest?'treasure-cell':'',aim.has(cellKey(p))?'aim':'',movement&&!movement.valid&&aim.has(cellKey(p))?'aim-danger':'',wave.has(cellKey(p))&&anim?.family?'wave-'+anim.family:'',reachable?'reachable move-steps-'+reachable.length:'',origin?'move-origin':'',options&&!reachable&&!origin?'move-unavailable':'',unit?.id===state.selected?'active':'',wave.has(cellKey(p))?'wave':'',unit&&hits.has(unit.id)?'hit':'',unit&&affected.has(unit.id)?'preview-target':'',unit&&anim?.actorId===unit.id?'acting-cell':''].filter(Boolean).join(' ');
  const animClass=unit&&anim?.actorId===unit.id?(anim.type==='move'?'animate-move':anim.type==='skill'?(anim.category===1?'animate-defense':'animate-skill'):'animate-prepare'):'';
  const animAbility=unit&&anim?.actorId===unit.id?animationAbility(unit,anim):null;
  const effect=animAbility?(Object.keys(getAbilityResourceCosts(unit,animAbility)).find(k=>k!=='random')||'essence'):'essence';
  const sprite=unit?tacticalSpriteFrame(unit,anim?.actorId===unit.id?anim:null):null;
  const hopRows=unit&&anim?.actorId===unit.id&&anim.type==='move'&&anim.pose==='airborne'?((anim.after?.positions?.[unit.id]?.y??anim.to?.y??0)-(anim.before?.positions?.[unit.id]?.y??anim.from?.y??0)):0,hop=hopRows!==0;
  const side=unit?.side||'',portrait=portraitSrc(unit),art=anim&&unit&&anim.actorId===unit.id?tacticalFrameArt(animAbility,anim.pose,portrait):portrait,depthScale=(.89+p.y*.035).toFixed(3),motionId=animAbility?.id||anim?.type||'',motionVariant=motionId?[...motionId].reduce((n,ch)=>n+ch.charCodeAt(0),0)%3:0;
  return '<button class="'+classes+'" data-cell="'+p.x+','+p.y+'" style="--depth-scale:1;z-index:'+(p.y*10+1)+'" aria-label="'+cellLabel(p)+(blocked?', obstáculo':unit?', '+esc(unit.name)+', '+(side==='player'?'aliado':'inimigo')+', Vida '+unit.hp+', '+esc(unit.identityTitle||''):', vazia')+(environmentCell?', '+esc(environment.title)+', efeito ao fim das ações':'')+(chest?', baú disponível':'')+(options?(origin?', partida do movimento':reachable?', movimento disponível, '+reachable.length+' de 2 passos':', movimento indisponível'):'')+'" '+(state.busy||state.battle.tactical.stage!=='planning'||Boolean(state.chestOffer)?'disabled':'')+'><span class="coord">'+cellLabel(p)+'</span>'+(environmentCell?'<span class="environment-mark" aria-hidden="true">'+esc(environment.symbol)+'</span>':'')+(reachable?'<span class="move-cell-label" aria-hidden="true"><span>'+cellLabel(p)+'</span><b>'+reachable.length+'</b></span>':origin?'<span class="move-origin-label" aria-hidden="true">'+(sameCell(options.origin,state.battle.tactical.positions[options.unit.id])?'PARTIDA':'PRÓXIMA PARTIDA')+'</span>':'')+movementStepMarkup(movement,p)+(wave.has(cellKey(p))?tacticalVfxMarkup(anim.family):'')+
   fallenAt(p,anim)+(ghost&&sameCell(ghost,p)?ghostMarkup(selectedUnit(plan),!movement.valid):'')+(!state.busy?state.draft.filter(a=>a.type==='move'&&sameCell(a.path.at(-1),p)).map((a,i)=>{const actor=state.battle.allies.find(u=>u.id===a.actorId),slot=state.draft.filter(ref=>ref.actorId===a.actorId).indexOf(a)+1;return '<span class="destination-marker '+(actor.id===state.selected?'selected':'')+'" style="--marker-offset:'+i*18+'px" title="'+slot+'ª ação · Destino de '+esc(actor.name)+'"><img src="'+esc(portraitSrc(actor))+'" alt="'+esc(actor.name)+'"><b>'+slot+'</b></span>';}).join(''):'')+(s.tactical.nextChest&&sameCell(s.tactical.nextChest.position,p)?'<span class="chest-telegraph" aria-label="Baú na rodada '+s.tactical.nextChest.round+'">◇<small>R'+s.tactical.nextChest.round+'</small></span>':'')+(chest?'<span class="treasure-chest" aria-hidden="true"><i>◇</i><small>BAÚ</small></span>':'')+(unit?'<span class="token '+esc(side)+' '+animClass+(unit.stunned?' stunned':'')+'" data-health-visible="'+((state.recentEffects?.[unit.id]||0)>Date.now())+'" data-unit-id="'+esc(unit.id)+'" data-portrait="'+esc(portrait)+'" data-skill-art="'+esc(animAbility?.art||'')+'" data-idle-atlas="'+Boolean(sprite?.idleAnimated)+'" data-sprite="'+(sprite?'true':'false')+'" data-effect="'+esc(effect)+'" data-realm="'+esc(unit.realm||'')+'" data-family="'+esc(anim?.actorId===unit.id?anim.family||'strike':'idle')+'" data-pose="'+esc(anim?.actorId===unit.id?anim.pose||'ready':'ready')+'" data-hop="'+(hop?'true':'false')+'" style="--step-x:'+((anim?.to?.x??0)-(anim?.from?.x??0))*100+'%;--step-y:'+((anim?.to?.y??0)-(anim?.from?.y??0))*100+'%;--hop-y:'+Math.round(hopRows*90)+'%;--hop-mid-y:'+Math.round(hopRows*45)+'%">'+(sprite?'<span class="token-sprite" aria-hidden="true"><span class="sprite-viewport"><img class="sprite-sheet" src="'+esc(sprite.src)+'" alt="" style="width:'+sprite.sheetColumns*100+'%;height:'+sprite.sheetRows*100+'%;left:'+(-sprite.column*100)+'%;top:'+(-sprite.row*100)+'%"></span></span>':art?'<img class="token-art" src="'+esc(art)+'" alt="" loading="lazy">':'')+(unit?effectsMarkup(unit)+combatDelta(unit,anim):'')+'<span class="token-copy"><b>'+esc(unit.name)+'</b><small>'+esc(unit.identityTitle||unit.realm||'')+'</small></span><span class="hp"><i style="width:'+Math.max(0,unit.hp/unit.maxHp*100)+'%"></i></span>'+(unit.shield?'<em>◇ '+unit.shield+'</em>':unit.invulnerable?'<em>◇</em>':unit.stunned?'<em>!</em>':'')+'</span>':blocked?'<span aria-hidden="true">◆</span>':'')+'</button>';
 }).join('')+'</div>';
}
let arenaAssetRevision=0,arenaFirstPaintComplete=false;
function paintArenaAssetsWhenDecoded(){
 const revision=++arenaAssetRevision,images=[...root.querySelectorAll('.arena-backdrop,.sprite-sheet')];
 Promise.all(images.map(image=>typeof image.decode==='function'?image.decode().catch(()=>undefined):Promise.resolve())).then(()=>{
  if(revision!==arenaAssetRevision)return;
  const stage=root.querySelector('.arena-stage');if(!stage)return;
  root.classList.add('arena-assets-ready');
  const previousVisibility=stage.style.visibility;
  stage.style.visibility='hidden';
  void stage.offsetHeight;
  stage.style.visibility=previousVisibility;
  if(!arenaFirstPaintComplete){
   arenaFirstPaintComplete=true;
   const top=window.scrollY,stageTop=(root.querySelector('.battle-surface')||stage).getBoundingClientRect().top+top;
   if(top===0)window.scrollTo(0,Math.max(0,Math.round(stageTop-8)));
  }
 });
}
function commitPlan(){if(state.busy||state.chestOffer||state.anchor||Number.isInteger(state.editIndex))return;cancelTarget();
const executionPlan={capacity:state.battle.allies.filter(u=>u.hp>0).length*2,actions:structuredClone(state.draft),details:explainTacticalPlan(state.battle,'player',state.draft)};
const r=submitTacticalPlan(state.battle,'player',state.draft,state.payment);if(!r.ok){state.message=r.reason;render();return;}
  const result=resolveTacticalRound(state.battle);if(!result.ok){state.message=result.reason;render();return;}
  state.executionPlan=executionPlan;state.planHistory=[];state.editIndex=null;state.lastEvents=result.events;state.chestOffer=result.chestRewards?.[0]||null;if(result.finished&&state.battle.phase==='victory'){state.rewardChoices=offerTacticalRewards(state.run,state.battle,state.seed+state.run.encounter);}state.draft=[];state.payment=null;state.anchor=null;state.hoverAnchor=null;state.mode='move';state.selected=state.battle.allies.find(u=>u.hp>0)?.id;state.message='';
  state.playback=result.events.find(e=>e.before)?.before||null;root.querySelector('.arena-toolbar')?.scrollIntoView({behavior:'instant',block:'start'});animateRound(result.events);

}
function render(){
 movementChoiceCache=null;
 planInsightCache=state.busy?[]:explainTacticalPlan(state.battle,'player',state.draft);
 cancelCommit();
 const actionCapacity=state.executionPlan?.capacity??state.battle.allies.filter(u=>u.hp>0).length*2;
 const s=shown(),u=state.busy?(tacticalUnits(s).find(u=>u.id===state.animation?.actorId)||selectedUnit(s)):selectedUnit(planningView()),preview=actionPreview(),locked=state.busy||state.battle.tactical.stage!=='planning'||Boolean(state.chestOffer),proposed=candidate();
 const check=proposed?candidateCheck(proposed):null,uses=state.draft.filter(a=>a.actorId===u?.id).length,a=u?.abilities.find(a=>a.id===state.mode);
 const anim=state.animation,actor=anim?tacticalUnits(s).find(u=>u.id===anim.actorId):null;
 const cards=u?[actionCardMarkup(u,null,true),...u.abilities.map(a=>actionCardMarkup(u,a))].join(''):'';
 const callout=anim?'<div class="arena-callout active" role="status">'+(state.playbackStep?state.playbackStep+' · ':'')+esc(actor?.name||'Rodada')+' · '+esc(anim.title||'')+'</div>':'';
 const offer=state.chestOffer&&!state.busy?'<section class="chest-reward panel"><h2>Baú · '+esc(state.chestOffer.tierName)+'</h2><p>Escolha 1 de 3 opções para o seu trio. '+state.battle.allies.filter(u=>u.hp>0).length+' alma(s) viva(s).</p><div class="chest-options">'+state.chestOffer.options.map(o=>'<button data-chest-choice="'+esc(o.id)+'" data-chest-offer="'+esc(state.chestOffer.id)+'"><span class="reward-category">'+esc(o.category||'Aprimoramento')+'</span><strong>'+esc(o.title)+'</strong><small>'+esc(o.text)+'</small><em>'+esc(o.reason||'')+'</em></button>').join('')+'</div></section>':'';
 const exchange=state.resourceMenu&&!state.busy?'<div class="essence-popover"><strong>Converter Essências · 5 → 1</strong><p>Receber '+names[state.resourceMenu]+'. O pagamento usa cinco Essências da reserva.</p><button data-command="exchange" '+(locked||state.draft.length?'disabled':'')+'>Converter para '+names[state.resourceMenu]+'</button><button data-command="close-resources">Fechar</button></div>':'';
 const finished=!state.busy&&state.battle.tactical.stage==='finished'?'<section class="result">'+(state.battle.phase==='victory'?'Vitória':state.battle.phase==='draw'?'Empate':'Derrota')+(state.battle.phase==='victory'?(state.rewardChoices.length?'<div class="reward-choices">'+state.rewardChoices.map(b=>'<button data-reward="'+esc(b.id)+'"><strong>'+esc(b.title)+'</strong><small>'+esc(b.text)+'</small></button>').join('')+'</div>':routeMarkup()):'')+'</section>':'';
 root.innerHTML='<div class="shell combat-shell"><header class="combat-header"><a href="/">OBLIVIUM ARENA</a><span>Encontro '+state.run.encounter+(state.run.route?' · '+esc(tacticalRoutes.find(r=>r.id===state.run.route)?.title):'')+'</span><a href="#formation">Formação</a></header>'+offer+finished+
 '<section class="battle-surface"><div class="arena-toolbar '+(state.animation?.type==='effects'&&state.animation?.pose==='impact'?'essence-pulse':'')+'">'+compactResources(s)+playbackControls()+'<span class="battle-phase">'+(state.busy?'Resolvendo · '+((anim?.slot??0)+1)+'ª passagem':'Planejamento privado · rodada '+s.round)+'</span></div>'+exchange+turnOrderMarkup(s)+
 environmentMarkup(s)+chestObjectiveMarkup(s)+'<div class="arena-stage"><img class="arena-backdrop" src="/art/arenas/limbo-ruins.webp" alt="" aria-hidden="true">'+tacticalCutinMarkup(actor,actor?animationAbility(actor,anim):null,anim)+arenaHudMarkup(s)+callout+boardMarkup(s)+'</div>'+
 '<section class="combat-dock">'+playbackActionMarkup()+partyTabs()+selectedPlanMarkup()+'<div class="action-heading"><strong>'+esc(u?.name||'Selecione uma alma')+'</strong><span>'+(state.busy?'Em execução':uses+'/2 ações')+'</span><span>'+(state.busy?esc(state.animation?.title||'Resolução'):state.mode==='move'?'Movimento':esc(a?.name||''))+'</span></div><div class="skills arena-skills">'+cards+'</div>'+actionDetailMarkup(u)+movementGuideMarkup()+
 '<div class="target-hint" aria-live="polite">'+targetHint()+'</div>'+privateInsightMarkup()+activeAugmentsMarkup()+editTools()+
 '<p class="notice" role="status">'+esc(state.message||(state.mode==='move'&&movementPreview()?.valid===false?movementPreview().reason:'')||(check&&!check.ok?check.reason:'')||(!locked&&!preview.ok?preview.reason:''))+'</p></section>'+
 '<section class="plan-panel"><details class="plan-details" '+(state.planExpanded||state.executionPlan?'open':'')+'><summary><strong>Plano do trio</strong><span>'+visiblePlan().length+' ações '+(state.executionPlan?'em reprodução':'escolhidas')+' · 1ª → 2ª passagem</span><b class="plan-expand-label">Ver / recolher</b></summary>'+'<p class="passage-rule">Todas as 1ª ações → todas as 2ª ações · iniciativa alternada entre os lados</p>'+queueMarkup()+'</details>'+trioIdentityMarkup()+'<div class="command-bar"><div class="plan-tools"><button data-command="undo-plan" '+(!state.planHistory?.length||locked?'disabled':'')+'>↶ Desfazer</button><button data-command="clear-plan" '+(!state.draft.length||locked?'disabled':'')+'>Limpar plano</button><button data-command="next-planner" '+(locked||state.battle.allies.filter(u=>u.hp>0).every(u=>state.draft.filter(a=>a.actorId===u.id).length===2)?'disabled':'')+'>Próximo personagem →</button></div><span class="plan-readiness">'+visiblePlan().length+'/'+actionCapacity+' ações<span>'+(state.executionPlan?'Acompanhe a sequência':(actionCapacity-state.draft.length)?(actionCapacity-state.draft.length)+' espaços em espera':'Trio preparado')+'</span></span><button class="round-commit" data-command="commit-hold" '+(locked||!preview.ok||Boolean(state.anchor)||Number.isInteger(state.editIndex)?'disabled':'')+' aria-label="Segure para iniciar a rodada"><span class="commit-symbol">▶</span><span><strong>'+(state.busy?'Em execução':'Iniciar rodada')+'</strong><small>Segure para confirmar</small></span></button></div></section></section>'+
 '<details class="combat-log"><summary>Resolução da rodada</summary><ol>'+(state.busy?(state.completedEvents||[]):state.lastEvents).map(e=>'<li>'+esc(e.title)+(e.actorId?' · '+esc(tacticalUnits(state.battle).find(u=>u.id===e.actorId)?.name):'')+(tacticalResolutionFeedback(e).length?'<span class="resolution-feedback">'+tacticalResolutionFeedback(e).map(esc).join(' ')+'</span>':'')+'</li>').join('')+'</ol></details>'+
 '<details id="formation" class="panel setup"><summary>Nova formação · '+tacticalRoster.length+' personagens</summary><div class="setup-fields"><div class="team-selects"><label>Seu trio</label>'+[0,1,2].map(i=>teamSelect('player',i)).join('')+'</div><div class="team-selects"><label>Oposição</label>'+[0,1,2].map(i=>teamSelect('enemy',i)).join('')+'</div><label>Mapa<select id="map-choice"><option value="open">Arena aberta</option><option value="ruins">Ruínas</option></select></label>'+environmentSelect()+'<label>Semente<input id="seed-choice" type="number" value="'+state.seed+'"></label></div><button data-command="restart">Iniciar confronto</button></details></div>';
 paintArenaAssetsWhenDecoded();syncPlaybackRate();
}
function teamSelect(side,index){const units=side==='player'?state.battle.allies:state.battle.enemies,chosen=units[index].sourceId||units[index].id;return `<select id="${side}-choice-${index}" aria-label="${side==='player'?'Aliado':'Adversário'} ${index+1}">${tacticalRoster.map(id=>`<option value="${id}" ${id===chosen?'selected':''}>${esc(characterById[id].name)} — ${esc(characterById[id].identityTitle)}</option>`).join('')}</select>`;}
function paintAnimationPose(event,frame){
 state.animation={...event,...frame};
 if(!root.querySelectorAll){render();return;}
 const snapshot=event.before||shown(),unit=[...(snapshot.allies||[]),...(snapshot.enemies||[])].find(c=>c.id===event.actorId),ability=animationAbility(unit,event);
 const stage=root.querySelector('.arena-stage'),cutin=stage?.querySelector('.skill-cutin');
 if(cutin){if(tacticalCutinActive(state.animation))cutin.dataset.pose=frame.pose;else cutin.remove();}
 stage?.querySelectorAll('.skill-projectile').forEach(node=>node.remove());
 const projectile=tacticalProjectileMarkup(unit,ability,state.animation);if(projectile)stage?.querySelector('.board')?.insertAdjacentHTML('beforeend',projectile);
 if(!tacticalImpactActive(state.animation))for(const effect of root.querySelectorAll('.cell-vfx'))effect.remove();
 if(!tacticalImpactActive(state.animation))for(const cell of root.querySelectorAll('.cell.wave, .cell.hit'))cell.classList.remove('wave','hit',...Array.from(cell.classList).filter(name=>name.startsWith('wave-')));
 for(const token of root.querySelectorAll('.token'))paintTacticalToken(token,unit,event,frame);
 const callout=root.querySelector('.arena-callout');if(callout){callout.dataset.family=frame.family;callout.dataset.pose=frame.pose;}
 syncPlaybackRate();
}
function movementReplayPoint(snapshot,actorId,point){return snapshot?.positions?{...snapshot,positions:{...snapshot.positions,[actorId]:{...point}}}:snapshot;}
function animationEvents(events){return events.flatMap(event=>event.type==='move'&&event.steps?.length?event.steps.map(step=>({...event,before:movementReplayPoint(event.before,event.actorId,step.from),after:movementReplayPoint(event.before,event.actorId,step.to),from:step.from,to:step.to,moved:1,steps:[step]})):[event]);}
function animateRound(events){
 const sequence=animationEvents(events).filter(e=>e.before&&e.after);
 const revision=++state.revision;state.busy=true;state.completedEvents=[];state.recentEffects={};const seenSkills=state.replaySeenSkills??=new Set();
 const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 (async()=>{
  for(const [eventIndex,sourceEvent] of sequence.entries()){
   const key=sourceEvent.type==='skill'?[sourceEvent.actorId,sourceEvent.abilityId,sourceEvent.formKey||'base'].join(':'):null;
   const event={...sourceEvent,compactReplay:state.compactReplay,repeated:Boolean(key&&seenSkills.has(key))};
   if(key&&!event.skipped)seenSkills.add(key);
   state.playbackStep=(eventIndex+1)+'/'+sequence.length;
   if(revision!==state.revision)return;
   state.playback=event.before;
   const unit=[...(event.before.allies||[]),...(event.before.enemies||[])].find(u=>u.id===event.actorId),ability=animationAbility(unit,event);
   const frames=event.actorId&&!event.skipped?tacticalReplayFrames(unit,ability,event):[{family:'support',pose:'ready',index:0},{family:'support',pose:'impact',index:1}];
   let applied=false;
   for(const [index,frame]of frames.entries()){
    if(revision!==state.revision)return;
    state.animation={...event,...frame};
    const impact=event.type==='move'?frame.pose==='landing':['impact','counter'].includes(frame.pose);
    if(impact&&!applied){applied=true;state.playback=event.after;for(const id of changedUnits(event))state.recentEffects[id]=Date.now()+2400;}
    if(index===0||impact||!event.actorId)render();else paintAnimationPose(event,frame);
    await pause(reduced?40:(event.actorId?tacticalFrameDuration({...event,...frame}):impact?850:180)/state.playbackSpeed);
   }
   state.playback=event.after;state.completedEvents.push(event);
  }
  if(revision!==state.revision)return;
  state.animation=null;state.playback=null;state.executionPlan=null;state.busy=false;
  if(state.battle.tactical.stage==='planning'&&!state.chestOffer&&!state.battle.tactical.plans.enemy)prepareEnemy();else {render();if(state.chestOffer)root.querySelector('.chest-reward')?.scrollIntoView({behavior:'smooth',block:'start'});}
  setTimeout(()=>{if(!state.busy)render();},2500);
 })();
}
function prepareEnemy(playback=[]){
 state.busy=true;const revision=++state.revision;render();
 setTimeout(()=>{if(revision!==state.revision)return;try{const plan=planTacticalAI(tacticalView(state.battle,'enemy'),'enemy');const r=submitTacticalPlan(state.battle,'enemy',plan);if(!r.ok)throw Error(r.reason);state.message='';}catch(e){state.message='Não foi possível planejar: '+e.message;}state.busy=false;render();if(playback.length)animateRound(playback);},0);
}
function start(player=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],enemy=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'],seed=1,ruins=false,environment=null){
 try{state.battle=createTacticalBattle(player,enemy,{seed,environment,obstacles:ruins?[{x:2,y:1},{x:2,y:3}]:[],buffs:state.run.buffs,memories:state.run.memories,globalEffects:state.run.globalEffects,teamHealth:state.run.teamHealth});}catch(e){state.message=e.message;render();return;}
 Object.assign(state,{replaySeenSkills:new Set(),executionPlan:null,planHistory:[],editIndex:null,hoverAnchor:null,recentEffects:{},resourceMenu:null,draft:[],selected:state.battle.allies[0].id,mode:'move',anchor:null,payment:null,lastEvents:[],animation:null,playback:null,seed,message:'',rewardChoices:[],chestOffer:null});prepareEnemy();
}
root.addEventListener('click',event=>{
 const el=event.target.closest('button');if(!el||el.disabled)return;
 if(el.dataset.speed){const speed=Number(el.dataset.speed);if([1,2,3].includes(speed)){state.playbackSpeed=speed;for(const b of root.querySelectorAll('[data-speed]'))b.setAttribute('aria-pressed',String(Number(b.dataset.speed)===speed));syncPlaybackRate();}return;}
 if(el.dataset.command==='compact-replay'){state.compactReplay=!state.compactReplay;el.setAttribute?.('aria-pressed',String(state.compactReplay));return;}
 if(state.busy)return;if(state.chestOffer&&!el.dataset.chestChoice)return;
 if(el.dataset.resourceMenu){state.resourceMenu=el.dataset.resourceMenu;render();return;}
 if(el.dataset.actor){selectActor(el.dataset.actor);return;}
 if(el.dataset.edit!==undefined){editAction(Number(el.dataset.edit));return;}
 if(el.dataset.slotActor){selectActor(el.dataset.slotActor);focusArena();return;}
 if(el.dataset.mode){if(state.mode===el.dataset.mode&&state.anchor&&selectedUnit(planningView())?.abilities.find(a=>a.id===state.mode)?.target==='self'){addAction();return;}state.hoverAnchor=null;state.anchor=null;state.mode=el.dataset.mode;state.message='';const s=planningView(),u=selectedUnit(s),a=u?.abilities.find(a=>a.id===state.mode);state.anchor=a?.target==='self'?{...s.tactical.positions[u.id]}:null;render();return;}
 if(el.dataset.cell){const [x,y]=el.dataset.cell.split(',').map(Number),unit=occupied(shown(),{x,y});if(state.mode==='move'&&unit?.side==='player'&&unit.id!==state.selected){selectActor(unit.id);return;}if(sameCell(state.anchor,{x,y})){addAction();return;}state.anchor={x,y};state.hoverAnchor=null;state.message='';render();return;}
 if(el.dataset.remove!==undefined){rememberPlan();cancelTarget();state.draft.splice(Number(el.dataset.remove),1);state.payment=null;state.message='';render();return;}

 if(el.dataset.chestChoice){const before=displaySnapshot();const r=chooseTacticalChestReward(state.battle,el.dataset.chestOffer,el.dataset.chestChoice);if(!r.ok){state.message=r.reason;render();return;}state.chestOffer=r.next;state.message='';animateRound([{type:'effects',title:'Aprimoramento · '+r.option.title,before,after:displaySnapshot()}]);return;}
 if(el.dataset.reward){if(!chooseTacticalReward(state.run,state.rewardChoices,el.dataset.reward))return;state.rewardChoices=[];render();return;}
 const command=el.dataset.command;
 if(command==='next-planner'){nextPlanner();return;}
 if(command==='close-resources'){state.resourceMenu=null;render();return;}
 if(command==='add')return addAction();
 if(command==='cancel-target'){cancelTarget();render();return;}
 if(command==='undo-plan'){const previous=state.planHistory?.pop();if(previous){state.draft=previous;state.payment=null;cancelTarget();render();}return;}
 if(command==='clear-plan'){rememberPlan();state.draft=[];state.payment=null;cancelTarget();render();return;}
 if(command==='remove-edit'){if(Number.isInteger(state.editIndex)){rememberPlan();state.draft.splice(state.editIndex,1);state.payment=null;cancelTarget();render();}return;}
 if(command==='swap-actions'){const indices=state.draft.map((a,i)=>a.actorId===state.selected?i:-1).filter(i=>i>=0);if(indices.length===2){rememberPlan();const [a,b]=indices;[state.draft[a],state.draft[b]]=[state.draft[b],state.draft[a]];state.payment=null;cancelTarget();render();}return;}
 if(command==='payment'){state.payment=state.payment?null:resourceIds.reduce((o,id)=>(o[id]=0,o),{});state.message='';render();}
 if(command==='exchange'){const before=displaySnapshot();const r=exchangeTacticalEssence(state.battle,'player',state.resourceMenu||'essence');state.message=r.ok?'Cinco Essências convertidas em uma.':r.reason;if(r.ok){state.resourceMenu=null;animateRound([{type:'effects',title:'Conversão de Essências · 5 → 1',before,after:displaySnapshot()}]);}else render();}
 if(command==='next-encounter'||el.dataset.route){if(state.chestOffer)return;const next=advanceTacticalRun(state.run,state.battle,el.dataset.route||null);if(!next)return;state.seed=next.seed;try{state.battle=createTacticalBattle(next.player,next.enemy,{seed:next.seed,buffs:next.buffs,memories:next.memories,globalEffects:next.globalEffects,teamHealth:next.teamHealth,routeEnemyShield:next.routeEnemyShield,environment:next.environment});}catch(e){state.message=e.message;render();return;}Object.assign(state,{replaySeenSkills:new Set(),executionPlan:null,planHistory:[],editIndex:null,draft:[],selected:state.battle.allies.find(u=>u.hp>0)?.id,mode:'move',anchor:null,payment:null,lastEvents:[],animation:null,playback:null,message:'',chestOffer:null});prepareEnemy();return;}
 if(command==='restart'){state.run=createTacticalRun();const ids=side=>[0,1,2].map(i=>document.getElementById(`${side}-choice-${i}`).value),seed=Number(document.getElementById('seed-choice').value);start(ids('player'),ids('enemy'),Number.isSafeInteger(seed)?seed:1,document.getElementById('map-choice').value==='ruins',document.getElementById('environment-choice').value);}
});
root.addEventListener('toggle',event=>{if(event.target.matches?.('.plan-details'))state.planExpanded=event.target.open;},true);
root.addEventListener('pointerover',event=>{if(event.pointerType==='touch'||state.busy||state.anchor||state.chestOffer)return;const cell=event.target.closest('[data-cell]');if(!cell)return;const [x,y]=cell.dataset.cell.split(',').map(Number);if(sameCell(state.hoverAnchor,{x,y}))return;state.hoverAnchor={x,y};paintPlanningPreview();});
root.addEventListener('pointerout',event=>{if(state.busy||state.anchor||!state.hoverAnchor)return;if(event.target.closest?.('.board')&&!event.relatedTarget?.closest?.('.board')){state.hoverAnchor=null;paintPlanningPreview();}});
let commitTimer=null,commitButton=null,commitPoint=null;
function cancelCommit(){clearTimeout(commitTimer);commitTimer=null;commitButton?.classList.remove('holding');commitButton=null;commitPoint=null;}
function startCommit(button,point=null){
 if(commitTimer||button.disabled||state.busy||!actionPreview().ok)return;
 commitButton=button;commitPoint=point;button.classList.add('holding');
 commitTimer=setTimeout(()=>{cancelCommit();commitPlan();},700);
}
root.addEventListener('pointerdown',e=>{const button=e.target.closest('[data-command="commit-hold"]');if(button&&e.button===0)startCommit(button,{x:e.clientX,y:e.clientY});});
document.addEventListener('pointerup',cancelCommit);document.addEventListener('pointercancel',cancelCommit);
document.addEventListener('pointermove',e=>{if(commitPoint&&Math.hypot(e.clientX-commitPoint.x,e.clientY-commitPoint.y)>12)cancelCommit();});
document.addEventListener('keydown',e=>{
 if(e.target.matches('input,select,textarea')||state.busy)return;
 if(e.target.closest('[data-command="commit-hold"]')&&['Enter',' '].includes(e.key)){e.preventDefault();if(!e.repeat)startCommit(e.target.closest('button'));return;}
 if(e.key==='Escape'){e.preventDefault();cancelCommit();cancelTarget();render();return;}
 if(e.key==='Enter'&&state.anchor&&!e.target.closest('button:not([data-cell])')){e.preventDefault();addAction();return;}
 if(['1','2','3'].includes(e.key)){const unit=state.battle.allies[Number(e.key)-1];if(unit?.hp>0){e.preventDefault();selectActor(unit.id);}}
});
document.addEventListener('keyup',e=>{if(['Enter',' '].includes(e.key))cancelCommit();});
root.addEventListener('change',event=>{if(event.target.dataset.payment){const value=Number(event.target.value);state.payment[event.target.dataset.payment]=value;state.message='';render();}});
start();
