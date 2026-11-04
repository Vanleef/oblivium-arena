import {tacticalIdleStyle,tacticalIdleLayerMarkup} from './tactical-motion.js';
import {tacticalTurnIncome} from './tactical-hand.js';
import {skillSealReason} from './combat-effects.js';
import {tacticalRequirementReason} from './tactical-requirements.js';
import {tacticalEnvironments} from './tactical-environment.js';
import {tacticalResolutionFeedback} from './tactical-insight.js';
import {tacticalCutinMarkup,tacticalCutinActive,tacticalProjectileMarkup,tacticalReplayFrames} from './tactical-cinematic.js';
import {characterById} from './data.js';
import {tacticalRoutes,createTacticalRun,offerTacticalRewards,chooseTacticalReward,advanceTacticalRun} from './tactical-run.js';
import {createTacticalBattle,previewTacticalActivation,submitTacticalActivation,tacticalActivationUnits,tacticalView,chooseTacticalChestReward,exchangeTacticalEssence,chooseTacticalShadow,tacticalArea,tacticalTargets,tacticalUnits} from './tactical-combat.js';
import {planTacticalAIActivation} from './tactical-ai.js';
import {boardCells,cellLabel,sameCell,findPath,movementRange,cellKey,occupied,obstacle} from './tactical-board.js';
import {tacticalRoster,tacticalOpponentRoster,tacticalSpec,tacticalRuleText} from './tactical-kits.js';
import {tacticalFrameArt,tacticalImpactActive,tacticalFrameDuration,tacticalDamagedTargets} from './tactical-animation.js';
import {tacticalSpriteFrame,paintTacticalToken} from './tactical-sprites.js';
import {tacticalExchangeVfxMarkup} from './tactical-vfx.js';
import {getAbilityResourceCosts,resourceIds,resolveResourcePayment} from './resource-costs.js';
const root=document.getElementById('tactical-app');
let aiWorker,aiJob,aiSequence=0;
const projectilePreload=new Image();projectilePreload.src='/art/animations/tactical-vfx-20261102/projectile-materials-v1.webp';
const names={essence:'Éter',cinza:'Cinza',graca:'Graça',ruptura:'Ruptura',random:'Coringa'};
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const state={compactReplay:true,playbackSpeed:1,battle:null,run:createTacticalRun(),rewardChoices:[],chestOffer:null,selected:null,mode:null,path:null,spendChoice:{},terrainEffects:{},message:'',busy:false,lastEvents:[],seed:1,revision:0};
const costText=(u,a)=>Object.entries(getAbilityResourceCosts(u,a)).map(([k,n])=>`${n} ${names[k]||k}`).join(' + ')||'Sem custo';
const shown=()=>state.playback?{...state.battle,...state.playback,tactical:{...state.battle.tactical,positions:state.playback.positions,chests:state.playback.chests||[],nextChest:state.playback.nextChest||null}}:state.battle;
const available=()=>tacticalActivationUnits(state.battle,'player');
const playerTurn=()=>!state.busy&&state.battle.tactical.stage==='planning'&&!state.battle.tactical.plans.player&&available().length>0;
const moveRefs=()=>state.path?[{type:'move',actorId:state.selected,path:state.path}]:[];
const preview=actions=>previewTacticalActivation(state.battle,'player',state.selected,actions);
const selectedUnit=s=>s.allies.find(u=>u.id===state.selected&&u.hp>0);
const planningView=()=>state.path?(preview(moveRefs()).projection||state.battle):state.battle;

function specialChoicesMarkup(unit){
 if(!unit||state.busy)return '';
 const ability=unit.abilities.find(a=>a.id===state.mode),controls=[];
 for(const [key,max,label]of [['residue',Math.min(ability?.spendResidueMax||0,unit.residue||0),'Resíduo disponível'],['fracture',ability?.spendFracturesMax||0,'Fraturas · limite por alvo no impacto']]){
  if(key==='residue'&&!ability?.spendResidueMax||key==='fracture'&&!ability?.spendFracturesMax)continue;
  controls.push('<div class="tactical-spend"><strong>'+label+'</strong>'+Array.from({length:max+1},(_,n)=>'<button data-spend-kind="'+key+'" data-spend-value="'+n+'" aria-pressed="'+((state.spendChoice?.[key]||0)===n)+'">'+n+'</button>').join('')+'</div>');
 }
 const pending=unit.shadowChoicePending?[unit]:[];
 return controls.join('')+pending.map(u=>'<div class="tactical-spend"><strong>'+esc(u.name)+' · Sombra Preparada</strong><button data-shadow-actor="'+esc(u.id)+'" data-shadow-choice="damage">+5 na próxima técnica de dano</button><button data-shadow-actor="'+esc(u.id)+'" data-shadow-choice="response">Próxima resposta contra qualquer tipo</button></div>').join('');
}
function passiveMarkup(unit){
 if(!unit?.passive)return '';
 return '<details class="tactical-passive"><summary>Passiva · '+esc(unit.passive.name)+' <small>Automática · não ocupa ações</small></summary><p>'+esc(unit.passive.description||'')+'</p></details>';
}
function environmentMarkup(s){
 const rule=s.tactical.environment;if(!rule)return '';
 return '<div class="environment-rule '+esc(rule.id)+'" role="note"><strong>'+esc(rule.world)+' · '+esc(rule.title)+'</strong><span>'+esc(rule.text)+'</span><small>Mesma regra para os dois lados · ao fim da rodada</small></div>';
}
function environmentSelect(){return '<label>Regra ambiental<select id="environment-choice"><option value="none">Sem regra ambiental</option>'+tacticalEnvironments.map(r=>'<option value="'+r.id+'" '+(state.battle.tactical.environment?.id===r.id?'selected':'')+'>'+esc(r.world+' · '+r.title)+'</option>').join('')+'</select></label>';}
function chestObjectiveMarkup(s){
 const incoming=s.tactical.nextChest,chests=s.tactical.chests||[];
 if(!incoming&&!chests.length)return '';
 return '<div class="chest-objective" role="status"><b>◇ '+(incoming?'Baú na rodada '+incoming.round+' · '+cellLabel(incoming.position):'Baú disponível · '+chests.map(c=>cellLabel(c.position)).join(', '))+'</b><span>'+(incoming?'Prepare sua aproximação. Se a casa estiver ocupada, o baú surge na casa livre mais próxima.':'Passe pela casa do baú ou acerte-a com uma técnica ofensiva. Escolha 1 de 3 recompensas.')+'</span></div>';
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
 const augments=(state.battle.tactical.augments?.player||[]).filter(a=>!a.expiresAt||a.expiresAt>=state.battle.round);
 return augments.length?'<div class="active-augments combat-augment-strip" aria-label="Aprimoramentos deste combate">'+augments.map(a=>'<span title="'+esc(a.type==='step-ward'?'Mover gera '+a.amount+' de Escudo, uma vez por alma por rodada.':a.type==='round-essence'?'Gera 1 Essência ao fim de cada rodada, até a rodada '+a.expiresAt+'.':'Dano em Exposto gera 1 Essência, uma vez por rodada.')+'">◆ '+esc(a.title)+'</span>').join('')+'</div>':'';
}
function movementTrailMarkup(move){
 if(!move||!move.path.length)return '';
 const points=[move.origin,...move.path].map(p=>(p.x*100+50)+','+(p.y*100+86)).join(' '),color=move.valid?'#94edf5':'#ff6666';
 return '<svg class="preview-path '+(move.valid?'':'invalid')+'" viewBox="0 0 500 500" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="movement-arrow" markerWidth="10" markerHeight="10" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="'+color+'"/></marker></defs><polyline class="path-glow" points="'+points+'" stroke="'+color+'"/><polyline class="path-trail" points="'+points+'" stroke="'+color+'" marker-end="url(#movement-arrow)"/></svg>';
}
function orientation(s,u,anchor){const origin=s.tactical.positions[u.id],dx=Math.sign(anchor.x-origin.x),dy=Math.sign(anchor.y-origin.y);return [dx||(!dy?1:0),dy];}
function automaticSkillAim(s,unit,ability){
 const origin=s.tactical.positions[unit.id],spec=tacticalSpec(unit,ability);
 if(ability.target==='self'||spec.range===0)return {anchor:{...origin},orientation:[1,0]};
 const allies=new Set((s.allies||[]).map(u=>u.id)),units=new Map(tacticalUnits(s).map(u=>[u.id,u]));
 const helpsAllies=Boolean(ability.heal||ability.regen||ability.shield||ability.defense||['ally','friendly','team'].includes(ability.target));
 const hurtsEnemies=Boolean(ability.damage||ability.dot||ability.dots?.length||ability.stun||ability.mark||ability.sealAttack||ability.weaken||ability.damageType);
 let best=null;
 for(const anchor of boardCells()){
  if(Math.max(Math.abs(anchor.x-origin.x),Math.abs(anchor.y-origin.y))>spec.range)continue;
  const facing=orientation(s,unit,anchor),cells=tacticalArea(s,unit,ability,anchor,facing);if(!cells.length)continue;
  const ids=tacticalTargets(s,unit,ability,anchor,facing);
  let score=(ability.damage>0||ability.dot||ability.dots?.length)&&s.tactical.chests.some(chest=>cells.some(cell=>sameCell(cell,chest.position)))?35:0;
  for(const id of ids){
   const target=units.get(id);if(!target)continue;
   const ally=allies.has(id),missing=Math.max(0,(target.maxHp||target.hp)-target.hp)/(target.maxHp||1);
   if(ability.heal||ability.regen)score+=ally?80+Math.round(missing*90):0;
   if(ability.shield||ability.defense||['ally','friendly','team','self'].includes(ability.target))score+=ally?55+Math.round(missing*25):0;
   if(hurtsEnemies)score+=!ally?100+Math.round(missing*20):0;
   if(!ability.heal&&!ability.regen&&!ability.shield&&!ability.defense&&!hurtsEnemies)score+=ally===helpsAllies?45:0;
  }
  score-=Math.max(Math.abs(anchor.x-origin.x),Math.abs(anchor.y-origin.y))*.05;
  if(!best||score>best.score)best={anchor:{...anchor},orientation:facing,score};
 }
 if(best)return best;
 const opponents=(s.enemies||[]).filter(u=>u.hp>0).map(u=>s.tactical.positions[u.id]).filter(Boolean);
 let nearest=opponents[0]||{x:unit.side==='enemy'?0:4,y:origin.y};
 for(const point of opponents)if(Math.max(Math.abs(point.x-origin.x),Math.abs(point.y-origin.y))<Math.max(Math.abs(nearest.x-origin.x),Math.abs(nearest.y-origin.y)))nearest=point;
 const facing=orientation(s,unit,nearest),anchor=boardCells().filter(p=>Math.max(Math.abs(p.x-origin.x),Math.abs(p.y-origin.y))<=spec.range&&tacticalArea(s,unit,ability,p,facing).length).sort((a,b)=>Math.max(Math.abs(a.x-nearest.x),Math.abs(a.y-nearest.y))-Math.max(Math.abs(b.x-nearest.x),Math.abs(b.y-nearest.y)))[0]||{...origin};
 return {anchor,orientation:facing,score:0};
}
function selectionPreview(s=planningView()){
 const unit=selectedUnit(s);if(!unit)return null;
 if(state.path?.length===2){const refs=moveRefs();return {unit,cells:[],targets:[],refs,result:preview(refs),sprint:true};}
 if(!state.mode)return null;
 if(state.mode==='guard'){
  const refs=[...moveRefs(),{type:'guard',actorId:unit.id}];
  return {unit,cells:[s.tactical.positions[unit.id]],targets:[unit.id],refs,result:preview(refs)};
 }
 const ability=unit.abilities.find(a=>a.id===state.mode);if(!ability)return null;
 const {anchor,orientation}=automaticSkillAim(s,unit,ability);
 const ref={type:'skill',actorId:unit.id,abilityId:ability.id,formKey:ability.formKey||'base',anchor,orientation,
  residueSpend:ability.spendResidueMax?state.spendChoice.residue||0:0,fractureSpend:ability.spendFracturesMax?state.spendChoice.fracture||0:0};
 const refs=[...moveRefs(),ref];
 return {unit,ability,cells:tacticalArea(s,unit,ability,anchor,orientation),targets:tacticalTargets(s,unit,ability,anchor,orientation),refs,result:preview(refs)};
}
function clearSelection(){
 Object.assign(state,{selected:null,sealedActor:null,path:null,mode:null,spendChoice:{},message:''});
}
function selectActor(id){
 if(!playerTurn()||!available().some(u=>u.id===id))return;
 if(state.selected!==id){clearSelection();state.selected=id;render();}
}
function selectDestination(cell){
 if(!playerTurn())return;
 const unit=occupied(state.battle,cell);
 if(unit?.side==='player'&&unit.id!==state.selected){selectActor(unit.id);return;}
 if(!state.selected)return;
 const origin=state.battle.tactical.positions[state.selected];
 const stay=sameCell(origin,cell)||sameCell(state.path?.at(-1),cell);
 const path=stay?null:findPath(state.battle,state.selected,cell);
 if(!stay&&!path)return;
 state.path=path;if(path?.length===2)state.mode=null;state.spendChoice={};state.message='';render();
}
function portraitSrc(unit){return unit?.art?.portrait||'';}
function animationAbility(unit,event){const base=event?.abilityId?unit?.abilities.find(k=>k.id===event.abilityId):null;if(!base)return null;const key=event.formKey;if(!key||key===(base.formKey||'base'))return base;return base._formRoot?.forms?.find(form=>form.formKey===key)||base.forms?.find(form=>form.formKey===key)||base;}
function activationCommands(actor,selection,projected){
 if(!playerTurn()||!actor)return '';
 const sprint=selection?.sprint;
 const buttons=actor.abilities.map(ability=>{
  const cost=costText(actor,ability),payment=resolveResourcePayment(getAbilityResourceCosts(actor,ability),state.battle.resources);
  const reason=sprint?'Corrida usa toda a ativação':actor.cooldowns[ability.id]?'Recarga · '+actor.cooldowns[ability.id]+' rodada(s)':skillSealReason(actor,ability)||tacticalRequirementReason(projected,actor,ability)||(!payment.ok?'Essência insuficiente':'');
  const art=ability.art||portraitSrc(actor);
  return '<button data-mode="'+esc(ability.id)+'" aria-pressed="'+(state.mode===ability.id)+'" title="'+esc(reason||ability.name+' · '+cost)+'" '+(reason?'disabled':'')+'>'+
   (art?'<img src="'+esc(art)+'" alt="" loading="lazy">':'')+'<span><b>'+esc(ability.name)+'</b><small>'+esc(reason||cost)+'</small></span></button>';
 }).join('');
 const description=selection?.ability?(selection.ability.description||tacticalRuleText(actor,selection.ability)):'Guarda concede até 6 de Escudo.';
 const hint=state.message||(sprint?'Duas casas · apenas movimento':selection?(selection.result.ok?description:selection.result.reason):'Uma casa + técnica ou Guarda · duas casas para correr.');
 return '<section class="activation-dock" aria-label="Técnicas de '+esc(actor.name)+'"><div class="activation-options">'+buttons+
  '<button data-mode="guard" '+(sprint?'disabled':'')+' aria-pressed="'+(state.mode==='guard')+'"><span><b>◇ Guarda</b><small>Sem custo</small></span></button></div>'+
  '<div class="activation-controls"><span><b>'+esc(actor.name)+(state.path?' → '+cellLabel(state.path.at(-1)):'')+'</b><small role="status">'+esc(hint)+'</small></span>'+
  '<button class="activation-execute" data-command="commit" '+(!selection?.result.ok?'disabled':'')+' aria-label="Executar ativação (Espaço)" title="Executar ativação (Espaço)">▶</button></div>'+
  (sprint?'':specialChoicesMarkup(actor))+passiveMarkup(actor)+'</section>';
}
function essenceArrivalMarkup(announcement){
 const items=resourceIds.filter(id=>(announcement.counts[id]||0)>0);
 return '<div class="arena-income" role="status" aria-label="Essências recebidas neste turno"><span class="arena-income-title">ESSÊNCIAS DESTE TURNO</span><div class="arena-income-items">'+items.map((id,index)=>'<span class="arena-income-item '+esc(id)+'" style="--arrival-delay:'+(index*90)+'ms"><i aria-hidden="true"></i><b>+'+announcement.counts[id]+'</b><small>'+esc(names[id])+' · total '+announcement.total[id]+'</small></span>').join('')+'</div></div>';
}
function announceTurnIncome(){
 if(!playerTurn()||state.incomeRound===state.battle.round)return;
 state.incomeRound=state.battle.round;const round=state.incomeRound,counts=tacticalTurnIncome(state.battle),total={...state.battle.resources};
 if(!Object.values(counts).some(Boolean))return;
 const announcement=state.incomeAnnouncement={round,counts,total,until:Date.now()+3000};
 const host=root.querySelector('.activation-income');if(host)host.innerHTML=essenceArrivalMarkup(announcement);
 setTimeout(()=>{
  if(state.incomeAnnouncement!==announcement)return;
  state.incomeAnnouncement=null;
  const target=root.querySelector('.activation-income');
  if(target)target.innerHTML='';
 },3000);
}

function activationMark(unit,spent){
 if(state.animation?.actorId===unit.id||state.animation?.actors?.some(actor=>actor.id===unit.id)||state.animation?.moves?.some(move=>move.actorId===unit.id)||state.animation?.stopped?.some(move=>move.actorId===unit.id))return 'acting';
 if(spent.includes(unit.id))return 'spent';
 if(unit.side==='player'&&state.sealedActor===unit.id)return 'sealed';
 if(unit.side==='player'&&state.selected===unit.id)return 'selected';
 if(unit.hp<=0||unit.stunned)return 'inactive';
 return unit.side==='player'?'ready':'';
}
function activationSignal(unit,spent){
 const mark=activationMark(unit,spent);
 const interrupted=mark==='acting'&&state.animation?.actorId===unit.id&&state.animation.skipped;
 const icon=interrupted?'×':mark==='spent'?'✓':mark==='sealed'?'◆':mark==='selected'?'⌄':mark==='acting'?'✦':'';
 return mark&&mark!=='inactive'?'<span class="activation-signal '+mark+(interrupted?' interrupted':'')+'" aria-hidden="true"><i></i><b>'+icon+'</b></span>':'';
}
function arenaHudMarkup(s){
 const spent=state.playback?.activationSpent||state.battle.tactical.activation.spent;
 const team=(units,side,label)=>'<div class="hud-team hud-team-'+side+'"><span class="hud-team-label">'+label+'</span>'+units.map(unit=>{
  const used=spent.includes(unit.id),inactive=unit.hp<=0||used||unit.stunned;
  const mark=activationMark(unit,spent),status=unit.hp<=0?'Fora de combate':mark==='spent'?'Já agiu':unit.stunned?'Atordoado':mark==='sealed'?'Ordem privada selada':mark==='selected'?'Selecionado em segredo':mark==='acting'?'Em ação':'Pode agir';
  const classes='hud-unit '+(state.selected===unit.id?'selected ':'')+(state.animation?.actorId===unit.id?'acting ':'')+(unit.hp<=0?'fallen ':'')+(used?'activation-spent ':'')+'mark-'+mark;
  const content='<img src="'+esc(portraitSrc(unit))+'" alt=""><span class="hud-unit-copy"><b>'+esc(unit.name)+'</b><small>'+Math.max(0,unit.hp)+' PV <span class="activation-marker" aria-hidden="true">'+(mark==='spent'?'✓':mark==='sealed'?'▣':mark==='selected'?'◈':mark==='acting'?'✦':inactive?'–':'◆')+'</span></small><i><em style="width:'+Math.max(0,unit.hp/unit.maxHp*100)+'%"></em></i></span>';
  const title=esc(unit.name+' · '+status);
  return side==='player'?'<button class="'+classes+'" data-actor="'+esc(unit.id)+'" '+(inactive||!playerTurn()?'disabled':'')+' aria-pressed="'+(state.selected===unit.id)+'" title="'+title+'">'+content+'</button>':'<div class="'+classes+'" title="'+title+'">'+content+'</div>';
 }).join('')+'</div>';
 return '<div class="arena-hud">'+team(s.allies,'player','SEU TRIO')+'<div class="hud-round"><small>RODADA</small><b>'+s.round+'</b></div>'+team(s.enemies,'enemy','OPONENTE')+'</div>';
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
function displaySnapshot(){const s=state.battle;return JSON.parse(JSON.stringify({allies:s.allies,enemies:s.enemies,resources:s.resources,enemyResources:s.enemyResources,round:s.round,activationSpent:[...s.tactical.activation.spent],positions:s.tactical.positions,chests:s.tactical.chests,nextChest:s.tactical.nextChest||null}));}
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
function recordTerrainImpact(event){
 if(event?.skipped||!event?.cells?.length)return;
 if(event.type!=='environment'&&!changedUnits(event).length)return;
 const actor=[...(event.before?.allies||[]),...(event.before?.enemies||[])].find(unit=>unit.id===event.actorId);
 const world=event.type==='environment'?event.world||state.battle.tactical.environment?.world:actor?.realm;
 state.terrainEffects??={};
 for(const cell of event.cells)state.terrainEffects[cellKey(cell)]={world:world||'Limbo',family:event.family||'support'};
}
function compactResources(s,selection){
 const p=selection?.result||{ok:false},pool=s.resources||{},income=state.busy?Object.fromEntries(resourceIds.map(id=>[id,0])):tacticalTurnIncome(state.battle);
 return '<div class="essence-strip" aria-label="Essências disponíveis"><span class="income-heading">Essências recebidas</span>'+resourceIds.map(id=>'<button class="essence-square '+id+'" data-resource-menu="'+id+'" title="'+names[id]+' · '+(pool[id]||0)+' no total · +'+income[id]+' recebida(s)" aria-label="'+names[id]+' '+(pool[id]||0)+' no total · '+income[id]+' recebida(s) nesta rodada · abrir conversão"><i></i><b>'+(pool[id]||0)+'</b>'+(income[id]?'<em class="essence-received">+'+income[id]+'</em>':'')+(p.ok&&p.remaining[id]!==pool[id]?'<small>→'+p.remaining[id]+'</small>':'')+'</button>').join('')+'</div>';
}
function boardMarkup(s,selection){
 const mover=playerTurn()?selectedUnit(s):null,origin=mover?s.tactical.positions[mover.id]:null;
 const ghost=state.path?.at(-1),movement=ghost&&origin?{origin,destination:ghost,path:state.path,valid:true}:null;
 const options=Boolean(mover),ready=playerTurn()?new Set(available().map(u=>u.id)):new Set(),affected=new Set(selection?.targets||[]),aim=new Set((selection?.cells||[]).map(cellKey));
 const anim=state.animation,spent=state.playback?.activationSpent||state.battle.tactical.activation.spent,impact=tacticalImpactActive(anim),wave=new Set((impact?anim?.cells||[]:[]).map(cellKey)),hits=new Set(tacticalDamagedTargets(anim));
 const source=impact?anim.before?.positions?.[anim.actorId]:null;
 const caster=impact?tacticalUnits(s).find(actor=>actor.id===anim.actorId):null;
 return '<div class="board '+(options?'movement-mode ':'')+(selection?'technique-preview':'')+'" role="group" aria-label="Arena tática em grade de cinco por cinco">'+movementTrailMarkup(movement)+tacticalProjectileMarkup(anim?tacticalUnits(s).find(u=>u.id===anim.actorId):null,anim?animationAbility(tacticalUnits(s).find(u=>u.id===anim.actorId),anim):null,anim)+boardCells().map(p=>{
  const environment=s.tactical.environment,environmentCell=environment&&sameCell(environment.position,p);
  const unit=occupied(s,p),chest=s.tactical.chests.find(item=>sameCell(item.position,p)),blocked=obstacle(s,p),reachable=options?findPath(s,mover.id,p):null,atOrigin=origin&&sameCell(origin,p);
  const chestEvent=anim?.type==='chest-spawn'&&anim.pose==='impact'?anim.chest:
   (anim?.type==='exchange-move'&&anim.pose==='landing'||impact)?anim.chestsOpened?.find(item=>sameCell(item.position,p)):null;
  const chestFlash=chestEvent&&sameCell(chestEvent.position,p);
  const warning=anim?.type==='skill'&&!anim.skipped&&!impact&&anim.cells?.some(cell=>sameCell(cell,p));
  const clash=anim?.type==='exchange-move'&&anim.stopped.some(step=>sameCell(step.to,p));
  const landing=anim?.type==='exchange-move'&&anim.pose==='landing'&&anim.moves.some(step=>sameCell(step.to,p));
  const terrain=state.terrainEffects?.[cellKey(p)],classes=['cell',environmentCell?'environment-cell environment-'+environment.id:'',environmentCell&&anim?.type==='environment'&&anim.pose==='impact'?'environment-contact':'',blocked?'blocked':'',chest?'treasure-cell':'',aim.has(cellKey(p))?'aim':'',wave.has(cellKey(p))&&anim?.family?'wave-'+anim.family:'',reachable?'reachable move-steps-'+reachable.length:'',atOrigin?'move-origin':'',options&&!reachable&&!atOrigin?'move-unavailable':'',unit&&ready.has(unit.id)?'activation-ready':'',unit?.id===state.selected?'active':'',wave.has(cellKey(p))?'wave':'',unit&&hits.has(unit.id)?'hit':'',unit&&affected.has(unit.id)?'preview-target':'',unit&&activationMark(unit,spent)==='acting'?'acting-cell':''].filter(Boolean).join(' ');
  const forced=unit&&impact?anim?.displacements?.find(d=>d.actorId===unit.id&&d.moved):null;
  const animClass=unit&&anim?.actorId===unit.id?(anim.type==='move'?'animate-move':anim.type==='skill'?(anim.category===1?'animate-defense':'animate-skill'):'animate-prepare'):'';
  const animAbility=unit&&anim?.actorId===unit.id?animationAbility(unit,anim):null;
  const effect=animAbility?(Object.keys(getAbilityResourceCosts(unit,animAbility)).find(k=>k!=='random')||'essence'):'essence';
  const sprite=unit?tacticalSpriteFrame(unit,anim?.actorId===unit.id?anim:null):null;
  const hopRows=unit&&anim?.actorId===unit.id&&anim.type==='move'&&anim.pose==='airborne'?((anim.after?.positions?.[unit.id]?.y??anim.to?.y??0)-(anim.before?.positions?.[unit.id]?.y??anim.from?.y??0)):0,hop=hopRows!==0;
  const side=unit?.side||'',portrait=portraitSrc(unit),art=anim&&unit&&anim.actorId===unit.id?tacticalFrameArt(animAbility,anim.pose,portrait):portrait;
  return '<button class="'+classes+'" data-cell="'+p.x+','+p.y+'" data-terrain-state="'+(terrain?'changed':environmentCell?'environment':blocked?'blocked':'base')+'" data-terrain-world="'+esc(terrain?.world||environment?.world||'')+'" data-terrain-effect="'+esc(terrain?.family||'')+'" style="--depth-scale:1;z-index:'+(p.y*10+1)+'" aria-label="'+cellLabel(p)+(blocked?', obstáculo':unit?', '+esc(unit.name)+', '+(side==='player'?'aliado':'inimigo')+', Vida '+unit.hp+', '+esc(unit.identityTitle||''):', vazia')+(environmentCell?', '+esc(environment.title)+', efeito ao fim das ações':'')+(chest?', baú disponível':'')+(options?(atOrigin?', partida do movimento':reachable?', movimento disponível, '+reachable.length+(reachable.length===1?' casa':' casas'):', movimento indisponível'):'')+'" '+(!playerTurn()?'disabled':'')+'><span class="terrain-tile" data-tile-state="'+(terrain?'changed':environmentCell?'environment':blocked?'blocked':'base')+'" aria-hidden="true"></span><span class="coord">'+cellLabel(p)+'</span>'+(environmentCell?'<span class="environment-mark" aria-hidden="true">'+esc(environment.symbol)+'</span>':'')+(warning?'<span class="exchange-warning" aria-hidden="true"></span>':'')+(wave.has(cellKey(p))?tacticalExchangeVfxMarkup(anim.family,caster?.realm,source,p):'')+
   (unit?activationSignal(unit,spent):'')+(chestFlash?'<span class="chest-flash" aria-hidden="true"><i></i></span>':'')+(clash?'<span class="exchange-clash" aria-hidden="true"><i></i><i></i></span>':landing?'<span class="exchange-dust" aria-hidden="true"></span>':'')+fallenAt(p,anim)+(ghost&&mover&&sameCell(ghost,p)?ghostMarkup(mover):'')+(s.tactical.nextChest&&sameCell(s.tactical.nextChest.position,p)?'<span class="chest-telegraph" aria-label="Baú na rodada '+s.tactical.nextChest.round+'">◇<small>R'+s.tactical.nextChest.round+'</small></span>':'')+(chest?'<span class="treasure-chest" aria-hidden="true"><i></i></span>':'')+(unit?'<span class="token '+esc(side)+' '+animClass+(forced?' forced-move':'')+(unit.stunned?' stunned':'')+'" data-health-visible="'+((state.recentEffects?.[unit.id]||0)>Date.now())+'" data-unit-id="'+esc(unit.id)+'" data-portrait="'+esc(portrait)+'" data-skill-art="'+esc(animAbility?.art||'')+'" data-idle-atlas="'+Boolean(sprite?.idleAnimated)+'" data-sprite="'+(sprite?'true':'false')+'" data-effect="'+esc(effect)+'" data-realm="'+esc(unit.realm||'')+'" data-family="'+esc(anim?.actorId===unit.id?anim.family||'strike':'idle')+'" data-pose="'+esc(anim?.actorId===unit.id?anim.pose||'ready':'ready')+'" data-hop="'+(hop?'true':'false')+'" style="'+tacticalIdleStyle(unit)+'--pose-duration:'+(anim?.actorId===unit.id?tacticalFrameDuration(anim):190)+'ms;--forced-x:'+((forced?.from.x||0)-(forced?.to.x||0))*100+'%;--forced-y:'+((forced?.from.y||0)-(forced?.to.y||0))*100+'%;--step-x:'+((anim?.to?.x??0)-(anim?.from?.x??0))*100+'%;--step-y:'+((anim?.to?.y??0)-(anim?.from?.y??0))*100+'%;--hop-y:'+Math.round(hopRows*90)+'%;--hop-mid-y:'+Math.round(hopRows*45)+'%">'+(sprite?'<span class="token-sprite" aria-hidden="true"><span class="sprite-viewport"><img class="sprite-sheet" src="'+esc(sprite.src)+'" alt="" style="width:'+sprite.sheetColumns*100+'%;height:'+sprite.sheetRows*100+'%;left:'+(-sprite.column*100)+'%;top:'+(-sprite.row*100)+'%">'+tacticalIdleLayerMarkup(sprite)+'</span></span>':art?'<img class="token-art" src="'+esc(art)+'" alt="" loading="lazy">':'')+(unit?effectsMarkup(unit)+combatDelta(unit,anim):'')+'<span class="token-copy"><b>'+esc(unit.name)+'</b><small>'+esc(unit.identityTitle||unit.realm||'')+'</small></span><span class="hp"><i style="width:'+Math.max(0,unit.hp/unit.maxHp*100)+'%"></i></span>'+(unit.shield?'<em>◇ '+unit.shield+'</em>':unit.invulnerable?'<em>◇</em>':unit.stunned?'<em>!</em>':'')+'</span>':blocked?'<span aria-hidden="true">◆</span>':'')+'</button>';
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
function playActivation(result){
 if(result.finished&&state.battle.phase==='victory')state.rewardChoices=offerTacticalRewards(state.run,state.battle,state.seed+state.run.encounter);
 if(state.logRound!==result.events[0]?.round){state.lastEvents=[];state.logRound=result.events[0]?.round;}
 state.lastEvents.push(...result.events);
 state.chestOffer=result.chestRewards[0]||null;
 clearSelection();state.resourceMenu=null;
 state.playback=result.events[0]?.before||null;
 animateRound(result.events);
}
function commitActivation(){
 if(!playerTurn())return;
 const selection=selectionPreview();if(!selection?.result.ok)return;
 const result=submitTacticalActivation(state.battle,'player',state.selected,selection.refs);
 if(result.ok&&!result.waiting)playActivation(result);
 else if(result.ok){const actorId=state.selected;clearSelection();state.sealedActor=actorId;state.resourceMenu=null;render();}
 else{state.message=result.reason;render();}
}
function render(){
 const focused=document.activeElement?.dataset;
 const focusKey=['actor','mode','cell','spendValue'].find(key=>focused?.[key]!==undefined);
 const s=shown(),projected=playerTurn()?planningView():s,selection=playerTurn()?selectionPreview(projected):null;
 const actorPlan=playerTurn()?selectedUnit(projected):null;
 const locked=!playerTurn();
 const anim=state.animation,actor=anim?tacticalUnits(s).find(u=>u.id===anim.actorId):null;

 const callout=anim?'<div class="exchange-accessible-status" role="status">'+esc((actor?.name?actor.name+' · ':'')+(anim.title||'')+(anim.reason?' · '+anim.reason:''))+'</div>':'';
 const commands=activationCommands(actorPlan,selection,projected);
 const offer=state.chestOffer&&!state.busy?'<section class="chest-reward panel"><h2>Baú · '+esc(state.chestOffer.tierName)+'</h2><p>Escolha 1 de 3 opções para o seu trio. '+state.battle.allies.filter(u=>u.hp>0).length+' alma(s) viva(s).</p><div class="chest-options">'+state.chestOffer.options.map(o=>'<button data-chest-choice="'+esc(o.id)+'" data-chest-offer="'+esc(state.chestOffer.id)+'"><span class="reward-category">'+esc(o.category||'Aprimoramento')+'</span><strong>'+esc(o.title)+'</strong><small>'+esc(o.text)+'</small><em>'+esc(o.reason||'')+'</em></button>').join('')+'</div></section>':'';
 const exchange=state.resourceMenu&&!state.busy?'<div class="essence-popover"><strong>Converter Essências · 5 → 1</strong><p>Receber '+names[state.resourceMenu]+'. O pagamento usa cinco Essências da reserva.</p><button data-command="exchange" '+(locked?'disabled':'')+'>Converter para '+names[state.resourceMenu]+'</button><button data-command="close-resources">Fechar</button></div>':'';
 const finished=!state.busy&&state.battle.tactical.stage==='finished'?'<section class="result">'+(state.battle.phase==='victory'?'Vitória':state.battle.phase==='draw'?'Empate':'Derrota')+(state.battle.phase==='victory'?(state.rewardChoices.length?'<div class="reward-choices">'+state.rewardChoices.map(b=>'<button data-reward="'+esc(b.id)+'"><strong>'+esc(b.title)+'</strong><small>'+esc(b.text)+'</small></button>').join('')+'</div>':routeMarkup()):'')+'</section>':'';
 root.innerHTML='<div class="shell combat-shell card-battle alternating-battle"><header class="combat-header"><a href="/">OBLIVIUM ARENA</a><span>Encontro '+state.run.encounter+(state.run.route?' · '+esc(tacticalRoutes.find(r=>r.id===state.run.route)?.title):'')+'</span><a href="#formation">Formação</a></header>'+finished+
 '<section class="battle-surface"><div class="arena-toolbar '+(state.animation?.type==='effects'&&state.animation?.pose==='impact'?'essence-pulse':'')+'">'+compactResources(s,selection)+playbackControls()+'<span class="battle-phase" role="status">'+('Rodada '+s.round+' · '+(state.busy?'Em ação':playerTurn()?(state.selected?'Planejando':'Escolha um aliado'):state.chestOffer?'Aprimoramento':state.battle.tactical.stage==='finished'?'Confronto encerrado':'Aguardando a troca'))+'</span></div>'+activeAugmentsMarkup()+(!state.selected&&state.message?'<p class="activation-notice" role="status">'+esc(state.message)+'</p>':'')+exchange+'<div class="activation-income">'+(state.incomeAnnouncement?.until>Date.now()?essenceArrivalMarkup(state.incomeAnnouncement):'')+'</div>'+
 environmentMarkup(s)+chestObjectiveMarkup(s)+'<div class="arena-stage"><img class="arena-backdrop" src="/art/arenas/limbo-ruins.webp" alt="" aria-hidden="true">'+tacticalCutinMarkup(actor,actor?animationAbility(actor,anim):null,anim)+arenaHudMarkup(s)+(!state.busy&&state.battle.tactical.plans.player?'<span class="exchange-seal" role="status" aria-label="Ordem selada, aguardando o oponente">◆</span>':'')+callout+boardMarkup(s,selection)+'</div>'+offer+commands+'</section>'+
 

 '<details class="combat-log"><summary>Resolução da rodada</summary><ol>'+(state.busy?(state.completedEvents||[]):state.lastEvents).map(e=>'<li>'+esc(e.title)+(e.actorId?' · '+esc(tacticalUnits(state.battle).find(u=>u.id===e.actorId)?.name):'')+(tacticalResolutionFeedback(e).length?'<span class="resolution-feedback">'+tacticalResolutionFeedback(e).map(esc).join(' ')+'</span>':'')+'</li>').join('')+'</ol></details>'+
 '<details id="formation" class="panel setup"><summary>Nova formação</summary><div class="setup-fields"><div class="team-selects"><label>Seu trio</label>'+[0,1,2].map(i=>teamSelect('player',i)).join('')+'</div><div class="team-selects"><label>Oposição</label>'+[0,1,2].map(i=>teamSelect('enemy',i)).join('')+'</div><label>Mapa<select id="map-choice"><option value="open">Arena aberta</option><option value="ruins">Ruínas</option></select></label>'+environmentSelect()+'<label>Semente<input id="seed-choice" type="number" value="'+state.seed+'"></label></div><button data-command="restart">Iniciar confronto</button></details></div>';
 if(focusKey&&!state.busy){
  const attribute=focusKey.replace(/[A-Z]/g,letter=>'-'+letter.toLowerCase());
  [...root.querySelectorAll('[data-'+attribute+']')].find(button=>!button.disabled&&button.dataset[focusKey]===focused[focusKey]&&button.dataset.spendKind===focused.spendKind)?.focus({preventScroll:true});
 }
 announceTurnIncome();paintArenaAssetsWhenDecoded();syncPlaybackRate();
}
function teamSelect(side,index){const units=side==='player'?state.battle.allies:state.battle.enemies,chosen=units[index].sourceId||units[index].id;return `<select id="${side}-choice-${index}" aria-label="${side==='player'?'Aliado':'Adversário'} ${index+1}">${(side==='player'?tacticalRoster:tacticalOpponentRoster).map(id=>`<option value="${id}" ${id===chosen?'selected':''}>${esc(characterById[id].name)} — ${esc(characterById[id].identityTitle)}</option>`).join('')}</select>`;}
function paintAnimationPose(event,frame){
 state.animation={...event,...frame};
 if(!root.querySelectorAll){render();return;}
 const snapshot=event.before||shown(),unit=[...(snapshot.allies||[]),...(snapshot.enemies||[])].find(c=>c.id===event.actorId),ability=animationAbility(unit,event);
 const stage=root.querySelector('.arena-stage'),cutin=stage?.querySelector('.skill-cutin');
 if(cutin){if(tacticalCutinActive(state.animation))cutin.dataset.pose=frame.pose;else cutin.remove();}
 stage?.querySelectorAll('.skill-projectile').forEach(node=>node.remove());
 const projectile=tacticalProjectileMarkup(unit,ability,state.animation);if(projectile)stage?.querySelector('.board')?.insertAdjacentHTML('beforeend',projectile);
 if(!tacticalImpactActive(state.animation))for(const effect of root.querySelectorAll('.cell-vfx,.exchange-impact'))effect.remove();
 if(!tacticalImpactActive(state.animation))for(const cell of root.querySelectorAll('.cell.wave, .cell.hit'))cell.classList.remove('wave','hit',...Array.from(cell.classList).filter(name=>name.startsWith('wave-')));
 for(const token of root.querySelectorAll('.token'))paintTacticalToken(token,unit,event,frame);
 const callout=root.querySelector('.arena-callout');if(callout){callout.dataset.family=frame.family;callout.dataset.pose=frame.pose;}
 syncPlaybackRate();
}
async function paintExchangeMovement(event,pause,reduced){
 const duration=reduced?40:(event.moves.length?320:185)/state.playbackSpeed;
 state.animation=event;
 render();
 for(const step of event.moves){
  const token=root.querySelector('.cell[data-cell="'+cellKey(step.from)+'"] .token');
  const landing=root.querySelector('.cell[data-cell="'+cellKey(step.to)+'"]');
  if(!token?.animate||!landing||reduced)continue;
  const a=token.closest('.cell').getBoundingClientRect(),b=landing.getBoundingClientRect();
  const dx=b.left-a.left,dy=b.top-a.top,lift=Math.min(20,a.height*.35);
  token.animate([{translate:'0 0'},{translate:(dx*.48)+'px '+(dy*.48-lift)+'px',offset:.48},{translate:dx+'px '+dy+'px'}],
   {duration,easing:'cubic-bezier(.28,.06,.32,1)',fill:'forwards'});
 }
 await pause(duration);
 state.playback=event.after;
 state.animation={...event,pose:'landing'};
 render();
 await pause(reduced?25:85/state.playbackSpeed);
}
function animateRound(events){
 const sequence=events.filter(e=>e.before&&e.after);
 const revision=++state.revision;state.busy=true;state.completedEvents=[];state.recentEffects={};const seenSkills=state.replaySeenSkills??=new Set();
 const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 (async()=>{
  for(const sourceEvent of sequence){
   if(revision!==state.revision)return;
   if(sourceEvent.type==='exchange-reveal'||sourceEvent.type==='exchange-move'){
    state.playback=sourceEvent.before;
    if(sourceEvent.type==='exchange-move')await paintExchangeMovement(sourceEvent,pause,reduced);
    else{state.animation=sourceEvent;render();await pause(reduced?35:260/state.playbackSpeed);}
    state.completedEvents.push(sourceEvent);
    continue;
   }
   const key=sourceEvent.type==='skill'?[sourceEvent.actorId,sourceEvent.abilityId,sourceEvent.formKey||'base'].join(':'):null;
   const event={...sourceEvent,presentation:'exchange',compactReplay:state.compactReplay,repeated:Boolean(key&&seenSkills.has(key))};
   if(key&&!event.skipped)seenSkills.add(key);
   if(revision!==state.revision)return;
   state.playback=event.before;
   const unit=[...(event.before.allies||[]),...(event.before.enemies||[])].find(u=>u.id===event.actorId),ability=animationAbility(unit,event);
   const frames=event.actorId&&!event.skipped&&event.type!=='guard'?tacticalReplayFrames(unit,ability,event):[{family:event.type==='guard'?'guard':'support',pose:'ready',index:0},{family:event.type==='guard'?'guard':'support',pose:'impact',index:1}];
   let applied=false;
   for(const [index,frame]of frames.entries()){
    if(revision!==state.revision)return;
    state.animation={...event,...frame};
    const impact=event.type==='move'?frame.pose==='landing':['impact','counter'].includes(frame.pose);
    if(impact&&!applied){applied=true;state.playback=event.after;for(const id of changedUnits(event))state.recentEffects[id]=Date.now()+2400;recordTerrainImpact({...event,...frame});}
    if(index===0||impact||!event.actorId)render();else paintAnimationPose(event,frame);
    await pause(reduced?40:(event.actorId?tacticalFrameDuration({...event,...frame}):impact?850:180)/state.playbackSpeed);
   }
   state.playback=event.after;state.completedEvents.push(event);
  }
  if(revision!==state.revision)return;
  state.animation=null;state.playback=null;state.busy=false;
  resumeActivation();
 })();
}
function acceptEnemyOrder(job,plan){
 if(aiJob!==job)return;
 aiJob=null;
 const {battle,round,exchange}=job;
 if(battle!==state.battle||battle.round!==round||battle.tactical.activation.exchange!==exchange||battle.tactical.stage!=='planning'||battle.tactical.plans.enemy)return;
 const result=plan&&submitTacticalActivation(battle,'enemy',plan.actorId,plan.actions);
 if(result?.ok&&!result.waiting)playActivation(result);
 else if(!result?.ok){state.message=result?.reason||'O oponente ficou sem uma ação válida.';render();}
}
function planEnemyOrder(battle){
 const exchange=battle.tactical.activation.exchange,round=battle.round;
 if(aiJob?.battle===battle&&aiJob.exchange===exchange&&aiJob.round===round)return;
 for(const unit of tacticalActivationUnits(battle,'enemy'))if(unit.shadowChoicePending)chooseTacticalShadow(battle,'enemy',unit.id,'damage');
 const job=aiJob={id:++aiSequence,battle,round,exchange,view:tacticalView(battle,'enemy')};
 const fallback=()=>setTimeout(()=>{if(aiJob===job)acceptEnemyOrder(job,planTacticalAIActivation(job.view));},0);
 if(typeof Worker!=='function'){fallback();return;}
 try{
  if(!aiWorker){
   aiWorker=new Worker(new URL('./tactical-ai-worker.js',import.meta.url),{type:'module'});
   aiWorker.addEventListener('message',({data})=>{
    if(aiJob?.id!==data.id)return;
    const current=aiJob;
    acceptEnemyOrder(current,data.failed?planTacticalAIActivation(current.view):data.plan);
   });
   aiWorker.addEventListener('error',()=>{
    aiWorker.terminate();aiWorker=null;
    if(aiJob){const current=aiJob;acceptEnemyOrder(current,planTacticalAIActivation(current.view));}
   });
  }
  aiWorker.postMessage({id:job.id,view:job.view});
 }catch{fallback();}
}
function resumeActivation(){
 if(state.battle.tactical.stage==='planning'&&!state.battle.tactical.plans.enemy&&tacticalActivationUnits(state.battle,'enemy').length)planEnemyOrder(state.battle);
 render();
 if(state.chestOffer)root.querySelector('.chest-reward')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function resetEncounter(seed){
 aiJob=null;clearSelection();
 Object.assign(state,{incomeRound:0,incomeAnnouncement:null,replaySeenSkills:new Set(),recentEffects:{},terrainEffects:{},resourceMenu:null,lastEvents:[],logRound:0,animation:null,playback:null,seed,rewardChoices:[],chestOffer:null});
 resumeActivation();
}
function start(player=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],enemy=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'],seed=1,ruins=false,environment=null){
 try{state.battle=createTacticalBattle(player,enemy,{seed,alternating:true,environment,obstacles:ruins?[{x:2,y:1},{x:2,y:3}]:[],buffs:state.run.buffs,memories:state.run.memories,globalEffects:state.run.globalEffects,teamHealth:state.run.teamHealth});}catch(e){state.message=e.message;render();return;}
 resetEncounter(seed);
}
root.addEventListener('click',event=>{
 const el=event.target.closest('button');if(!el||el.disabled)return;
 if(el.dataset.speed){const speed=Number(el.dataset.speed);if([1,2,3].includes(speed)){state.playbackSpeed=speed;for(const b of root.querySelectorAll('[data-speed]'))b.setAttribute('aria-pressed',String(Number(b.dataset.speed)===speed));syncPlaybackRate();}return;}
 if(el.dataset.command==='compact-replay'){state.compactReplay=!state.compactReplay;el.setAttribute?.('aria-pressed',String(state.compactReplay));return;}
 if(state.busy)return;if(state.chestOffer&&!el.dataset.chestChoice)return;
 if(el.dataset.spendKind){const n=Number(el.dataset.spendValue);if(['residue','fracture'].includes(el.dataset.spendKind)&&Number.isInteger(n)&&n>=0){state.spendChoice??={residue:0,fracture:0};state.spendChoice[el.dataset.spendKind]=n;render();}return;}
 if(el.dataset.shadowActor){const result=chooseTacticalShadow(state.battle,'player',el.dataset.shadowActor,el.dataset.shadowChoice);state.message=result.ok?'Resposta da Sombra escolhida.':result.reason;render();return;}
 if(el.dataset.resourceMenu){state.resourceMenu=el.dataset.resourceMenu;render();return;}
 if(el.dataset.command==='commit'){commitActivation();return;}
 if(el.dataset.actor){selectActor(el.dataset.actor);return;}
 if(el.dataset.mode&&playerTurn()&&state.selected&&state.path?.length!==2){
  if(state.mode===el.dataset.mode){commitActivation();return;}
  state.mode=el.dataset.mode;state.spendChoice={};state.message='';render();return;
 }
 if(el.dataset.cell){const [x,y]=el.dataset.cell.split(',').map(Number);selectDestination({x,y});return;}

 if(el.dataset.chestChoice){const before=displaySnapshot();const r=chooseTacticalChestReward(state.battle,el.dataset.chestOffer,el.dataset.chestChoice);if(!r.ok){state.message=r.reason;render();return;}state.chestOffer=r.next;state.message='';animateRound([{type:'effects',title:'Aprimoramento · '+r.option.title,before,after:displaySnapshot()}]);return;}
 if(el.dataset.reward){if(!chooseTacticalReward(state.run,state.rewardChoices,el.dataset.reward))return;state.rewardChoices=[];render();return;}
 const command=el.dataset.command;
 if(command==='close-resources'){state.resourceMenu=null;render();return;}
 if(command==='exchange'){const before=displaySnapshot();const r=exchangeTacticalEssence(state.battle,'player',state.resourceMenu||'essence');state.message=r.ok?'Cinco Essências convertidas em uma.':r.reason;if(r.ok){state.resourceMenu=null;animateRound([{type:'effects',title:'Conversão de Essências · 5 → 1',before,after:displaySnapshot()}]);}else render();}
 if(command==='next-encounter'||el.dataset.route){if(state.chestOffer)return;const next=advanceTacticalRun(state.run,state.battle,el.dataset.route||null);if(!next)return;state.seed=next.seed;try{state.battle=createTacticalBattle(next.player,next.enemy,{seed:next.seed,alternating:true,buffs:next.buffs,memories:next.memories,globalEffects:next.globalEffects,teamHealth:next.teamHealth,routeEnemyShield:next.routeEnemyShield,environment:next.environment});}catch(e){state.message=e.message;render();return;}resetEncounter(next.seed);return;}
 if(command==='restart'){state.run=createTacticalRun();const ids=side=>[0,1,2].map(i=>document.getElementById(`${side}-choice-${i}`).value),seed=Number(document.getElementById('seed-choice').value);start(ids('player'),ids('enemy'),Number.isSafeInteger(seed)?seed:1,document.getElementById('map-choice').value==='ruins',document.getElementById('environment-choice').value);}
});

document.addEventListener('keydown',event=>{
 if(event.target.matches('input,select,textarea,[contenteditable="true"]')||!playerTurn())return;
 if((event.code==='Space'||event.key===' ')&&!event.repeat&&!event.target.closest?.('[data-command="commit"],a,summary')){
  if(root.querySelector('[data-command="commit"]:not(:disabled)')){event.preventDefault();commitActivation();}
 }else if(event.key==='Escape'){clearSelection();render();}
 else if(['1','2','3'].includes(event.key)){
  const unit=state.battle.allies[Number(event.key)-1];if(unit){event.preventDefault();selectActor(unit.id);}
 }
});
start();

