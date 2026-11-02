import {orderTacticalActions,tacticalFirstSide} from './tactical-order.js';
import {characterById,buffs} from './data.js';
import {createTacticalRun,offerTacticalRewards,chooseTacticalReward,advanceTacticalRun} from './tactical-run.js';
import {createTacticalBattle,previewTacticalPlan,submitTacticalPlan,resolveTacticalRound,chooseTacticalChestReward,tacticalView,exchangeTacticalEssence,tacticalArea,tacticalTargets,tacticalUnits} from './tactical-combat.js';
import {planTacticalAI} from './tactical-ai.js';
import {boardCells,cellLabel,sameCell,findPath,cellKey,occupied,obstacle} from './tactical-board.js';
import {tacticalRoster,tacticalSpec,patternNames,priorityNames} from './tactical-kits.js';
import {tacticalAnimationFrames,tacticalFrameArt,tacticalImpactActive,tacticalFrameDuration,tacticalDamagedTargets} from './tactical-animation.js';
import {tacticalSpriteFrame,paintTacticalToken} from './tactical-sprites.js';
import {tacticalVfxMarkup} from './tactical-vfx.js';
import {getAbilityResourceCosts,resourceIds} from './resource-costs.js';
const root=document.getElementById('tactical-app');
const names={essence:'Éter',cinza:'Cinza',graca:'Graça',ruptura:'Ruptura',random:'Coringa'};
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const state={battle:null,run:createTacticalRun(),rewardChoices:[],chestOffer:null,draft:[],selected:null,mode:'move',anchor:null,payment:null,message:'',busy:false,lastEvents:[],seed:1,revision:0};
const costText=(u,a)=>Object.entries(getAbilityResourceCosts(u,a)).map(([k,n])=>`${n} ${names[k]||k}`).join(' + ')||'Sem custo';
const actionPreview=()=>previewTacticalPlan(state.battle,'player',state.draft,state.payment);
const shown=()=>state.playback?{...state.battle,...state.playback,tactical:{...state.battle.tactical,positions:state.playback.positions,chests:state.playback.chests||[]}}:state.battle;
const planningView=()=>{const p=actionPreview();return p.ok?p.projection:state.battle;};
const activeAnchor=()=>state.anchor||state.hoverAnchor;
const selectedUnit=s=>s.allies.find(u=>u.id===state.selected&&u.hp>0);
const formFor=(s,a)=>s.allies.find(u=>u.id===a.actorId)?.abilities.find(k=>k.id===a.abilityId);
function aimed(s){s=planningView();const u=selectedUnit(s);if(!u)return [];if(state.mode==='move')return activeAnchor()?(findPath(s,u.id,activeAnchor())||[]):[];const a=u.abilities.find(a=>a.id===state.mode);return a&&activeAnchor()?tacticalArea(s,u,a,activeAnchor(),orientation(s,u,activeAnchor())):[];}
function orientation(s,u,anchor){const origin=s.tactical.positions[u.id],dx=Math.sign(anchor.x-origin.x),dy=Math.sign(anchor.y-origin.y);return [dx||(!dy?1:0),dy];}
function candidate(){
 const s=planningView(),u=selectedUnit(s);if(!u||!activeAnchor())return null;
 if(state.mode==='move'){const path=findPath(s,u.id,activeAnchor());return path?{type:'move',actorId:u.id,path}:null;}
 const a=u.abilities.find(a=>a.id===state.mode);if(!a)return null;
 return {type:'skill',actorId:u.id,abilityId:a.id,formKey:a.formKey||'base',anchor:{...activeAnchor()},orientation:orientation(s,u,activeAnchor())};
}
function addAction(){
 const ref=candidate();if(!ref){state.message='Escolha uma célula válida no tabuleiro.';render();return;}
 const draft=[...state.draft,ref],p=previewTacticalPlan(state.battle,'player',draft);
 if(!p.ok){state.message=p.reason;render();return;}
 state.draft=draft;state.payment=null;state.anchor=null;state.hoverAnchor=null;state.message='Ação reservada. Escolha a próxima alma ou ação.';render();
}
function actionCategory(a){
 if(a.type==='move')return 0;
 const u=state.battle.allies.find(u=>u.id===a.actorId),root=u.skillBook.find(k=>k.id===a.abilityId),variant=root.forms?.find(f=>f.formKey===a.formKey);
 return tacticalSpec(u,variant||root).priority;
}
function queueNeighbor(index,direction){const actor=state.draft[index]?.actorId,indices=state.draft.map((a,i)=>a.actorId===actor?i:-1).filter(i=>i>=0);return indices[indices.indexOf(index)+direction]??null;}
function queueMarkup(){
 if(!state.draft.length)return '<p class="muted">Selecione uma alma, escolha a ação e marque a região no campo.</p>';
 const p=actionPreview(),effective=p.ok?p.actions:state.draft.map((a,order)=>({...a,order}));
 return `<ol class="queue">${effective.map((queued,rank)=>{const i=queued.order,a=state.draft[i],u=state.battle.allies.find(u=>u.id===a.actorId),form=a.type==='skill'?u.skillBook.find(k=>k.id===a.abilityId):null,variant=form?.forms?.find(f=>f.formKey===a.formKey),name=a.type==='move'?`Mover até ${cellLabel(a.path.at(-1))}`:variant?.name||form?.name;return `<li><span class="order">${rank+1}</span><div class="description"><strong>${esc(u.name)}</strong> · ${esc(name)}<small>${a.type==='move'?'Movimento':'Ação '+(queued.slot+1)+' · vez '+(queued.turnRank+1)}</small></div><div class="controls"><button data-order="${i}" data-direction="-1" aria-label="Subir ação de ${esc(u.name)}" ${queueNeighbor(i,-1)===null||state.busy?'disabled':''}>↑</button><button data-order="${i}" data-direction="1" aria-label="Descer ação de ${esc(u.name)}" ${queueNeighbor(i,1)===null||state.busy?'disabled':''}>↓</button><button data-remove="${i}" aria-label="Remover ação de ${esc(u.name)}" ${state.busy?'disabled':''}>×</button></div></li>`;}).join('')}</ol>`;
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
function actionCardMarkup(actor,ability,isMove=false){
 const spec=isMove?{pattern:'line',range:2,priority:0}:tacticalSpec(actor,ability);
 const mode=isMove?'move':ability.id,selected=state.mode===mode,art=isMove?portraitSrc(actor):(ability.art||portraitSrc(actor));
 const label=isMove?'MOVIMENTO':priorityNames[spec.priority].toUpperCase(),name=isMove?'Movimento':ability.name;
 const power=ability&&(ability.damage?'DANO '+ability.damage:ability.dots?'DANO '+ability.dots[0]:ability.dot?'AFIÇÃO '+ability.dot:ability.heal?'CURA '+ability.heal:ability.shield?'DEFESA '+ability.shield:'');
 const description=isMove?'Até duas células · ortogonal ou diagonal':(spec.range?patternNames[spec.pattern]+' · alcance '+spec.range:'Próprio usuário')+(power?' · '+power:'');
 const cost=isMove?'<span class="cost-free">LIVRE</span>':cardCostMarkup(actor,ability),blocked=state.busy||Boolean(state.chestOffer)||(!isMove&&(actor.cooldowns[ability.id]||actor.stunned));
 const heat=patternGrid(isMove?'square':spec.pattern);
 return '<button class="skill action-card" data-mode="'+esc(mode)+'" aria-pressed="'+selected+'" aria-label="'+esc(name+'; '+description+'; '+(isMove?'1 ação, sem custo':costText(actor,ability)))+'" '+(blocked?'disabled':'')+'>'+
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
 for(const dot of u?.dots||[])effects.push({icon:'♨',label:(dot.name||dot.type||'Dano contínuo')+' · '+(dot.turns??dot.duration??'')});
 return effects;
}
function effectsMarkup(u){return '<span class="unit-effects">'+unitEffects(u).map(e=>'<i title="'+esc(e.label)+'" aria-label="'+esc(e.label)+'">'+e.icon+'</i>').join('')+'</span>';}
function ghostMarkup(unit){
 const f=tacticalSpriteFrame(unit);
 return f?'<span class="move-hologram" aria-hidden="true"><span class="token-sprite"><span class="sprite-viewport"><img class="sprite-sheet" alt="" src="'+esc(f.src)+'" style="width:'+f.sheetColumns*100+'%;height:'+f.sheetRows*100+'%;left:'+(-f.column*100)+'%;top:'+(-f.row*100)+'%"></span></span></span>':'';
}
function displaySnapshot(){const s=state.battle;return JSON.parse(JSON.stringify({allies:s.allies,enemies:s.enemies,resources:s.resources,enemyResources:s.enemyResources,round:s.round,positions:s.tactical.positions,chests:s.tactical.chests}));}
function changedUnits(event){
 const before=new Map([...(event?.before?.allies||[]),...(event?.before?.enemies||[])].map(u=>[u.id,u]));
 return [...(event?.after?.allies||[]),...(event?.after?.enemies||[])].filter(u=>{const b=before.get(u.id);return b&&(b.hp!==u.hp||JSON.stringify(unitEffects(b))!==JSON.stringify(unitEffects(u)));}).map(u=>u.id);
}
function compactResources(s){
 const p=actionPreview(),pool=s.resources||{};
 return '<div class="essence-strip" aria-label="Essências disponíveis">'+resourceIds.map(id=>'<button class="essence-square '+id+'" data-resource-menu="'+id+'" title="'+names[id]+' · '+(pool[id]||0)+' disponível" aria-label="'+names[id]+' '+(pool[id]||0)+' · abrir conversão"><i></i><b>'+(pool[id]||0)+'</b>'+(p.ok&&p.remaining[id]!==pool[id]?'<small>→'+p.remaining[id]+'</small>':'')+'</button>').join('')+'</div>';
}
function turnOrderMarkup(s){
 const first=tacticalFirstSide(s),units=s.allies.flatMap((u,i)=>first==='player'?[u,s.enemies[i]]:[s.enemies[i],u]).filter(Boolean);
 return '<div class="turn-order" aria-label="Ordem da rodada"><span>'+(state.busy?'EXECUTANDO':'ORDEM')+'</span>'+units.map((u,i)=>'<span class="turn-face '+(state.animation?.actorId===u.id?'acting':'')+'" title="'+(i+1)+' · '+esc(u.name)+'"><img src="'+esc(portraitSrc(u))+'" alt="'+esc(u.name)+'"><b>'+(i+1)+'</b></span>').join('')+'<small>1ª ação → 2ª ação</small></div>';
}

function boardMarkup(s){
 const plan=planningView(),proposed=candidate(),ability=selectedUnit(plan)?.abilities.find(a=>a.id===state.mode),affected=new Set(ability&&activeAnchor()?tacticalTargets(plan,selectedUnit(plan),ability,activeAnchor(),orientation(plan,selectedUnit(plan),activeAnchor())):[]),ghost=state.mode==='move'&&proposed?.type==='move'?proposed.path.at(-1):null;
 const aim=new Set(aimed(s).map(cellKey)),u=selectedUnit(s),anim=state.animation,impact=tacticalImpactActive(anim),wave=new Set((impact?anim?.cells||[]:[]).map(cellKey)),hits=new Set(tacticalDamagedTargets(anim));
 return '<div class="board" role="group" aria-label="Arena tática em grade de cinco por cinco">'+boardCells().map(p=>{
  const unit=occupied(s,p),chest=s.tactical.chests.find(item=>sameCell(item.position,p)),blocked=obstacle(s,p),reachable=state.mode==='move'&&u&&findPath(s,u.id,p);
  const classes=['cell',blocked?'blocked':'',chest?'treasure-cell':'',aim.has(cellKey(p))?'aim':'',wave.has(cellKey(p))&&anim?.family?'wave-'+anim.family:'',reachable?'reachable':'',unit?.id===state.selected?'active':'',wave.has(cellKey(p))?'wave':'',unit&&hits.has(unit.id)?'hit':'',unit&&affected.has(unit.id)?'preview-target':'',unit?.id===anim?.actorId?'acting-cell':''].filter(Boolean).join(' ');
  const animClass=unit&&anim?.actorId===unit.id?(anim.type==='move'?'animate-move':anim.type==='skill'?(anim.category===1?'animate-defense':'animate-skill'):'animate-prepare'):'';
  const animAbility=unit&&anim?.actorId===unit.id?animationAbility(unit,anim):null;
  const effect=animAbility?(Object.keys(getAbilityResourceCosts(unit,animAbility)).find(k=>k!=='random')||'essence'):'essence';
  const sprite=unit?tacticalSpriteFrame(unit,anim?.actorId===unit.id?anim:null):null;
  const hopRows=unit&&anim?.actorId===unit.id&&anim.type==='move'&&anim.pose==='airborne'?((anim.after?.positions?.[unit.id]?.y??anim.to?.y??0)-(anim.before?.positions?.[unit.id]?.y??anim.from?.y??0)):0,hop=hopRows!==0;
  const side=unit?.side||'',portrait=portraitSrc(unit),art=anim&&unit&&anim.actorId===unit.id?tacticalFrameArt(animAbility,anim.pose,portrait):portrait,depthScale=(.89+p.y*.035).toFixed(3),motionId=animAbility?.id||anim?.type||'',motionVariant=motionId?[...motionId].reduce((n,ch)=>n+ch.charCodeAt(0),0)%3:0;
  return '<button class="'+classes+'" data-cell="'+p.x+','+p.y+'" style="--depth-scale:1;z-index:'+(p.y*10+1)+'" aria-label="'+cellLabel(p)+(blocked?', obstáculo':unit?', '+esc(unit.name)+', '+(side==='player'?'aliado':'inimigo')+', Vida '+unit.hp+', '+esc(unit.identityTitle||''):', vazia')+(chest?', baú disponível':'')+'" '+(state.busy||state.battle.tactical.stage!=='planning'||Boolean(state.chestOffer)?'disabled':'')+'><span class="coord">'+cellLabel(p)+'</span>'+(wave.has(cellKey(p))?tacticalVfxMarkup(anim.family):'')+
   (ghost&&sameCell(ghost,p)?ghostMarkup(selectedUnit(plan)):'')+(!state.busy?state.draft.filter(a=>a.type==='move'&&sameCell(a.path.at(-1),p)).map(a=>{const actor=state.battle.allies.find(u=>u.id===a.actorId);return '<span class="destination-marker" title="Destino confirmado de '+esc(actor.name)+'"><img src="'+esc(portraitSrc(actor))+'" alt="'+esc(actor.name)+'"></span>';}).join(''):'')+(chest?'<span class="treasure-chest" aria-hidden="true"><i>◇</i><small>BAÚ</small></span>':'')+(unit?'<span class="token '+esc(side)+' '+animClass+(unit.stunned?' stunned':'')+'" data-health-visible="'+((state.recentEffects?.[unit.id]||0)>Date.now())+'" data-unit-id="'+esc(unit.id)+'" data-portrait="'+esc(portrait)+'" data-skill-art="'+esc(animAbility?.art||'')+'" data-sprite="'+(sprite?'true':'false')+'" data-effect="'+esc(effect)+'" data-realm="'+esc(unit.realm||'')+'" data-family="'+esc(anim?.actorId===unit.id?anim.family||'strike':'idle')+'" data-pose="'+esc(anim?.actorId===unit.id?anim.pose||'ready':'ready')+'" data-hop="'+(hop?'true':'false')+'" style="--step-x:'+((anim?.to?.x??0)-(anim?.from?.x??0))*100+'%;--step-y:'+((anim?.to?.y??0)-(anim?.from?.y??0))*100+'%;--hop-y:'+Math.round(hopRows*90)+'%;--hop-mid-y:'+Math.round(hopRows*45)+'%">'+(sprite?'<span class="token-sprite" aria-hidden="true"><span class="sprite-viewport"><img class="sprite-sheet" src="'+esc(sprite.src)+'" alt="" style="width:'+sprite.sheetColumns*100+'%;height:'+sprite.sheetRows*100+'%;left:'+(-sprite.column*100)+'%;top:'+(-sprite.row*100)+'%"></span></span>':art?'<img class="token-art" src="'+esc(art)+'" alt="" loading="lazy">':'')+(unit?effectsMarkup(unit):'')+'<span class="token-copy"><b>'+esc(unit.name)+'</b><small>'+esc(unit.identityTitle||unit.realm||'')+'</small></span><span class="hp"><i style="width:'+Math.max(0,unit.hp/unit.maxHp*100)+'%"></i></span>'+(unit.shield?'<em>◇ '+unit.shield+'</em>':unit.invulnerable?'<em>◇</em>':unit.stunned?'<em>!</em>':'')+'</span>':blocked?'<span aria-hidden="true">◆</span>':'')+'</button>';
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
   const top=window.scrollY,stageTop=stage.getBoundingClientRect().top+top;
   if(top===0)window.scrollTo(0,Math.max(0,Math.round(stageTop-40)));
  }
 });
}
function render(){
 const s=shown(),u=selectedUnit(state.busy?s:planningView()),preview=actionPreview(),locked=state.busy||state.battle.tactical.stage!=='planning'||Boolean(state.chestOffer),proposed=candidate();
 const check=proposed?previewTacticalPlan(state.battle,'player',[...state.draft,proposed]):null,uses=state.draft.filter(a=>a.actorId===u?.id).length,a=u?.abilities.find(a=>a.id===state.mode);
 const anim=state.animation,actor=anim?tacticalUnits(s).find(u=>u.id===anim.actorId):null;
 const cards=u?[actionCardMarkup(u,null,true),...u.abilities.map(a=>actionCardMarkup(u,a))].join(''):'';
 const callout=anim?'<div class="arena-callout active" role="status">'+esc(actor?.name||'Rodada')+' · '+esc(anim.title||'')+'</div>':'';
 const offer=state.chestOffer&&!state.busy?'<section class="chest-reward panel"><h2>Baú · '+esc(state.chestOffer.tierName)+'</h2><p>Escolha um aprimoramento</p><div class="chest-options">'+state.chestOffer.options.map(o=>'<button data-chest-choice="'+esc(o.id)+'" data-chest-offer="'+esc(state.chestOffer.id)+'"><strong>'+esc(o.title)+'</strong><small>'+esc(o.text)+'</small></button>').join('')+'</div></section>':'';
 const exchange=state.resourceMenu&&!state.busy?'<div class="essence-popover"><strong>Converter Essências · 5 → 1</strong><p>Receber '+names[state.resourceMenu]+'. O pagamento usa cinco Essências da reserva.</p><button data-command="exchange" '+(locked||state.draft.length?'disabled':'')+'>Converter para '+names[state.resourceMenu]+'</button><button data-command="close-resources">Fechar</button></div>':'';
 const finished=!state.busy&&state.battle.tactical.stage==='finished'?'<section class="result">'+(state.battle.phase==='victory'?'Vitória':state.battle.phase==='draw'?'Empate':'Derrota')+(state.battle.phase==='victory'?(state.rewardChoices.length?'<div class="reward-choices">'+state.rewardChoices.map(b=>'<button data-reward="'+esc(b.id)+'"><strong>'+esc(b.title)+'</strong><small>'+esc(b.text)+'</small></button>').join('')+'</div>':'<button data-command="next-encounter">Próximo encontro</button>'):'')+'</section>':'';
 root.innerHTML='<div class="shell combat-shell"><header class="combat-header"><a href="/">OBLIVIUM ARENA</a><span>Encontro '+state.run.encounter+'</span><a href="#formation">Formação</a></header>'+offer+finished+
 '<section class="battle-surface"><div class="arena-toolbar '+(state.animation?.type==='effects'&&state.animation?.pose==='impact'?'essence-pulse':'')+'">'+compactResources(s)+'<span class="battle-phase">'+(state.busy?'Resolvendo · '+((anim?.slot??0)+1)+'ª passagem':'Planejamento privado · rodada '+s.round)+'</span></div>'+exchange+turnOrderMarkup(s)+
 '<div class="arena-stage"><img class="arena-backdrop" src="/art/arenas/limbo-ruins.webp" alt="" aria-hidden="true">'+arenaHudMarkup(s)+callout+boardMarkup(s)+'</div>'+
 '<section class="combat-dock"><div class="action-heading"><strong>'+esc(u?.name||'Selecione uma alma')+'</strong><span>'+uses+'/2 ações</span><span>'+(state.mode==='move'?'Movimento':esc(a?.name||''))+'</span></div><div class="skills arena-skills">'+cards+'</div>'+
 '<div class="action-confirm"><p>'+(state.mode==='move'?'Toque numa casa. O holograma mostra o destino; confirme para reservar.':esc(a?.description||'Toque numa carta e escolha a região na grade.'))+'</p><button class="primary" data-command="add" '+(locked||!check?.ok||!state.anchor?'disabled':'')+'>'+(state.mode==='move'?'Confirmar destino':'Reservar técnica')+(state.anchor?' · '+cellLabel(state.anchor):'')+'</button></div>'+
 '<p class="notice" role="status">'+esc(state.message||(check&&!check.ok?check.reason:'')||(!preview.ok?preview.reason:''))+'</p></section>'+
 '<section class="plan-panel"><div class="plan-heading"><strong>Seu plano · '+state.draft.length+'/6</strong><button class="primary" data-command="confirm" '+(locked||!preview.ok?'disabled':'')+'>'+(state.busy?'Executando…':'Revelar e executar')+'</button></div>'+queueMarkup()+'</section></section>'+
 '<details class="combat-log"><summary>Resolução da rodada</summary><ol>'+(state.busy?(state.completedEvents||[]):state.lastEvents).map(e=>'<li>'+esc(e.title)+(e.actorId?' · '+esc(tacticalUnits(state.battle).find(u=>u.id===e.actorId)?.name):'')+'</li>').join('')+'</ol></details>'+
 '<details id="formation" class="panel setup"><summary>Nova formação · '+tacticalRoster.length+' personagens</summary><div class="setup-fields"><div class="team-selects"><label>Seu trio</label>'+[0,1,2].map(i=>teamSelect('player',i)).join('')+'</div><div class="team-selects"><label>Oposição</label>'+[0,1,2].map(i=>teamSelect('enemy',i)).join('')+'</div><label>Mapa<select id="map-choice"><option value="open">Arena aberta</option><option value="ruins">Ruínas</option></select></label><label>Semente<input id="seed-choice" type="number" value="'+state.seed+'"></label></div><button data-command="restart">Iniciar confronto</button></details></div>';
 paintArenaAssetsWhenDecoded();
}
function teamSelect(side,index){const units=side==='player'?state.battle.allies:state.battle.enemies,chosen=units[index].sourceId||units[index].id;return `<select id="${side}-choice-${index}" aria-label="${side==='player'?'Aliado':'Adversário'} ${index+1}">${tacticalRoster.map(id=>`<option value="${id}" ${id===chosen?'selected':''}>${esc(characterById[id].name)} — ${esc(characterById[id].identityTitle)}</option>`).join('')}</select>`;}
function paintAnimationPose(event,frame){
 state.animation={...event,...frame};
 if(!root.querySelectorAll){render();return;}
 const unit=tacticalUnits(state.battle).find(c=>c.id===event.actorId);
 if(!tacticalImpactActive(state.animation))for(const effect of root.querySelectorAll('.cell-vfx'))effect.remove();
 if(!tacticalImpactActive(state.animation))for(const cell of root.querySelectorAll('.cell.wave, .cell.hit'))cell.classList.remove('wave','hit',...Array.from(cell.classList).filter(name=>name.startsWith('wave-')));
 for(const token of root.querySelectorAll('.token'))paintTacticalToken(token,unit,event,frame);
 const callout=root.querySelector('.arena-callout');if(callout){callout.dataset.family=frame.family;callout.dataset.pose=frame.pose;}
}
function movementReplayPoint(snapshot,actorId,point){return snapshot?.positions?{...snapshot,positions:{...snapshot.positions,[actorId]:{...point}}}:snapshot;}
function animationEvents(events){return events.flatMap(event=>event.type==='move'&&event.steps?.length?event.steps.map(step=>({...event,before:movementReplayPoint(event.before,event.actorId,step.from),after:movementReplayPoint(event.before,event.actorId,step.to),from:step.from,to:step.to,moved:1,steps:[step]})):[event]);}
function animateRound(events){
 const sequence=animationEvents(events).filter(e=>e.before&&e.after);
 const revision=++state.revision;state.busy=true;state.completedEvents=[];state.recentEffects={};
 const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 (async()=>{
  for(const event of sequence){
   if(revision!==state.revision)return;
   state.playback=event.before;
   const unit=[...(event.before.allies||[]),...(event.before.enemies||[])].find(u=>u.id===event.actorId),ability=animationAbility(unit,event);
   const frames=event.actorId&&!event.skipped?tacticalAnimationFrames(ability,event.type):[{family:'support',pose:'ready',index:0},{family:'support',pose:'impact',index:1}];
   let applied=false;
   for(const [index,frame]of frames.entries()){
    if(revision!==state.revision)return;
    state.animation={...event,...frame};
    const impact=event.type==='move'?frame.pose==='landing':['impact','counter'].includes(frame.pose);
    if(impact&&!applied){applied=true;state.playback=event.after;for(const id of changedUnits(event))state.recentEffects[id]=Date.now()+2400;}
    if(index===0||impact||!event.actorId)render();else paintAnimationPose(event,frame);
    await pause(reduced?40:event.actorId?tacticalFrameDuration({...event,...frame}):impact?850:180);
   }
   state.playback=event.after;state.completedEvents.push(event);
  }
  if(revision!==state.revision)return;
  state.animation=null;state.playback=null;state.busy=false;
  if(state.battle.tactical.stage==='planning'&&!state.chestOffer&&!state.battle.tactical.plans.enemy)prepareEnemy();else render();
  setTimeout(()=>{if(!state.busy)render();},2500);
 })();
}
function prepareEnemy(playback=[]){
 state.busy=true;const revision=++state.revision;render();
 setTimeout(()=>{if(revision!==state.revision)return;try{const plan=planTacticalAI(tacticalView(state.battle,'enemy'),'enemy');const r=submitTacticalPlan(state.battle,'enemy',plan);if(!r.ok)throw Error(r.reason);state.message='';}catch(e){state.message='Não foi possível planejar: '+e.message;}state.busy=false;render();if(playback.length)animateRound(playback);},0);
}
function start(player=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],enemy=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'],seed=1,ruins=false){
 try{state.battle=createTacticalBattle(player,enemy,{seed,obstacles:ruins?[{x:2,y:1},{x:2,y:3}]:[],buffs:state.run.buffs,memories:state.run.memories,globalEffects:state.run.globalEffects,teamHealth:state.run.teamHealth});}catch(e){state.message=e.message;render();return;}
 Object.assign(state,{hoverAnchor:null,recentEffects:{},resourceMenu:null,draft:[],selected:state.battle.allies[0].id,mode:'move',anchor:null,payment:null,lastEvents:[],animation:null,playback:null,seed,message:'',rewardChoices:[],chestOffer:null});prepareEnemy();
}
root.addEventListener('click',event=>{
 const el=event.target.closest('button');if(!el||el.disabled||state.busy)return;if(state.chestOffer&&!el.dataset.chestChoice)return;
 if(el.dataset.resourceMenu){state.resourceMenu=el.dataset.resourceMenu;render();return;}
 if(el.dataset.actor){state.selected=el.dataset.actor;state.anchor=null;state.hoverAnchor=null;state.mode='move';state.message='';render();return;}
 if(el.dataset.mode){state.hoverAnchor=null;state.anchor=null;state.mode=el.dataset.mode;state.message='';const s=shown(),u=selectedUnit(s),a=u?.abilities.find(a=>a.id===state.mode);state.anchor=a?.target==='self'?{...s.tactical.positions[u.id]}:null;render();return;}
 if(el.dataset.cell){const [x,y]=el.dataset.cell.split(',').map(Number),unit=occupied(shown(),{x,y});if(state.mode==='move'&&unit?.side==='player'&&unit.id!==state.selected){state.selected=unit.id;state.anchor=null;state.hoverAnchor=null;render();return;}state.anchor={x,y};state.hoverAnchor=null;state.message='';render();return;}
 if(el.dataset.remove!==undefined){state.draft.splice(Number(el.dataset.remove),1);state.payment=null;state.message='';render();return;}
 if(el.dataset.order!==undefined){const i=Number(el.dataset.order),j=queueNeighbor(i,Number(el.dataset.direction));if(j!==null)[state.draft[i],state.draft[j]]=[state.draft[j],state.draft[i]];state.payment=null;state.message='';render();return;}
 if(el.dataset.chestChoice){const before=displaySnapshot();const r=chooseTacticalChestReward(state.battle,el.dataset.chestOffer,el.dataset.chestChoice);if(!r.ok){state.message=r.reason;render();return;}state.chestOffer=r.next;state.message='';animateRound([{type:'effects',title:'Aprimoramento · '+r.option.title,before,after:displaySnapshot()}]);return;}
 if(el.dataset.reward){if(!chooseTacticalReward(state.run,state.rewardChoices,el.dataset.reward))return;state.rewardChoices=[];render();return;}
 const command=el.dataset.command;
 if(command==='close-resources'){state.resourceMenu=null;render();return;}
 if(command==='add')return addAction();
 if(command==='payment'){state.payment=state.payment?null:resourceIds.reduce((o,id)=>(o[id]=0,o),{});state.message='';render();}
 if(command==='exchange'){const before=displaySnapshot();const r=exchangeTacticalEssence(state.battle,'player',state.resourceMenu||'essence');state.message=r.ok?'Cinco Essências convertidas em uma.':r.reason;if(r.ok){state.resourceMenu=null;animateRound([{type:'effects',title:'Conversão de Essências · 5 → 1',before,after:displaySnapshot()}]);}else render();}
 if(command==='confirm'){
  const r=submitTacticalPlan(state.battle,'player',state.draft,state.payment);if(!r.ok){state.message=r.reason;render();return;}
  const result=resolveTacticalRound(state.battle);if(!result.ok){state.message=result.reason;render();return;}
  state.lastEvents=result.events;state.chestOffer=result.chestRewards?.[0]||null;if(result.finished&&state.battle.phase==='victory'){state.rewardChoices=offerTacticalRewards(state.run,state.battle,state.seed+state.run.encounter);}state.draft=[];state.payment=null;state.anchor=null;state.hoverAnchor=null;state.mode='move';state.selected=state.battle.allies.find(u=>u.hp>0)?.id;state.message='';
  state.playback=result.events.find(e=>e.before)?.before||null;animateRound(result.events);
 }
 if(command==='next-encounter'){if(state.chestOffer)return;const next=advanceTacticalRun(state.run,state.battle);if(!next)return;state.seed=next.seed;try{state.battle=createTacticalBattle(next.player,next.enemy,{seed:next.seed,buffs:next.buffs,memories:next.memories,globalEffects:next.globalEffects,teamHealth:next.teamHealth});}catch(e){state.message=e.message;render();return;}Object.assign(state,{draft:[],selected:state.battle.allies.find(u=>u.hp>0)?.id,mode:'move',anchor:null,payment:null,lastEvents:[],animation:null,playback:null,message:'',chestOffer:null});prepareEnemy();return;}
 if(command==='restart'){state.run=createTacticalRun();const ids=side=>[0,1,2].map(i=>document.getElementById(`${side}-choice-${i}`).value),seed=Number(document.getElementById('seed-choice').value);start(ids('player'),ids('enemy'),Number.isSafeInteger(seed)?seed:1,document.getElementById('map-choice').value==='ruins');}
});
root.addEventListener('pointerover',event=>{if(state.busy||state.anchor||state.chestOffer)return;const cell=event.target.closest('[data-cell]');if(!cell)return;const [x,y]=cell.dataset.cell.split(',').map(Number);if(sameCell(state.hoverAnchor,{x,y}))return;state.hoverAnchor={x,y};render();});
root.addEventListener('change',event=>{if(event.target.dataset.payment){const value=Number(event.target.value);state.payment[event.target.dataset.payment]=value;state.message='';render();}});
start();
