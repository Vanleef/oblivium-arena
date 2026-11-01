import {characterById,buffs} from './data.js';
import {createTacticalRun,offerTacticalRewards,chooseTacticalReward,advanceTacticalRun} from './tactical-run.js';
import {createTacticalBattle,previewTacticalPlan,submitTacticalPlan,resolveTacticalRound,tacticalView,exchangeTacticalEssence,tacticalArea,tacticalUnits} from './tactical-combat.js';
import {planTacticalAI} from './tactical-ai.js';
import {boardCells,cellLabel,sameCell,findPath,cellKey,occupied,obstacle} from './tactical-board.js';
import {tacticalRoster,tacticalSpec,patternNames,priorityNames} from './tactical-kits.js';
import {tacticalAnimationFrames} from './tactical-animation.js';
import {getAbilityResourceCosts,resourceIds} from './resource-costs.js';
const root=document.getElementById('tactical-app');
const names={essence:'Éter',cinza:'Cinza',graca:'Graça',ruptura:'Ruptura',random:'Coringa'};
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const state={battle:null,run:createTacticalRun(),rewardChoices:[],draft:[],selected:null,mode:'move',anchor:null,payment:null,message:'',busy:false,lastEvents:[],seed:1,revision:0};
const costText=(u,a)=>Object.entries(getAbilityResourceCosts(u,a)).map(([k,n])=>`${n} ${names[k]||k}`).join(' + ')||'Sem custo';
const actionPreview=()=>previewTacticalPlan(state.battle,'player',state.draft,state.payment);
const shown=()=>{const p=previewTacticalPlan(state.battle,'player',state.draft);return p.ok?p.projection:state.battle;};
const selectedUnit=s=>s.allies.find(u=>u.id===state.selected&&u.hp>0);
const formFor=(s,a)=>s.allies.find(u=>u.id===a.actorId)?.abilities.find(k=>k.id===a.abilityId);
function aimed(s){const u=selectedUnit(s);if(!u)return [];if(state.mode==='move')return state.anchor?(findPath(s,u.id,state.anchor)||[]):[];const a=u.abilities.find(a=>a.id===state.mode);return a&&state.anchor?tacticalArea(s,u,a,state.anchor,orientation(s,u,state.anchor)):[];}
function orientation(s,u,anchor){const origin=s.tactical.positions[u.id],dx=Math.sign(anchor.x-origin.x),dy=Math.sign(anchor.y-origin.y);return [dx||(!dy?1:0),dy];}
function candidate(){
 const s=shown(),u=selectedUnit(s);if(!u||!state.anchor)return null;
 if(state.mode==='move'){const path=findPath(s,u.id,state.anchor);return path?{type:'move',actorId:u.id,path}:null;}
 const a=u.abilities.find(a=>a.id===state.mode);if(!a)return null;
 return {type:'skill',actorId:u.id,abilityId:a.id,formKey:a.formKey||'base',anchor:{...state.anchor},orientation:orientation(s,u,state.anchor)};
}
function addAction(){
 const ref=candidate();if(!ref){state.message='Escolha uma célula válida no tabuleiro.';render();return;}
 const draft=[...state.draft,ref],p=previewTacticalPlan(state.battle,'player',draft);
 if(!p.ok){state.message=p.reason;render();return;}
 state.draft=draft;state.payment=null;state.anchor=null;state.message='';render();
}
function actionCategory(a){
 if(a.type==='move')return 0;
 const u=state.battle.allies.find(u=>u.id===a.actorId),root=u.skillBook.find(k=>k.id===a.abilityId),variant=root.forms?.find(f=>f.formKey===a.formKey);
 return tacticalSpec(u,variant||root).priority;
}
function queueNeighbor(index,direction){
 const category=actionCategory(state.draft[index]),indices=state.draft.map((a,i)=>({a,i})).filter(({a})=>actionCategory(a)===category).map(({i})=>i);
 return indices[indices.indexOf(index)+direction]??null;
}
function queueMarkup(){
 if(!state.draft.length)return '<p class="muted">Selecione uma alma, escolha a ação e marque a região no campo.</p>';
 const p=actionPreview(),effective=p.ok?p.actions:state.draft.map((a,order)=>({...a,order}));
 return `<ol class="queue">${effective.map((queued,rank)=>{const i=queued.order,a=state.draft[i],u=state.battle.allies.find(u=>u.id===a.actorId),form=a.type==='skill'?u.skillBook.find(k=>k.id===a.abilityId):null,variant=form?.forms?.find(f=>f.formKey===a.formKey),name=a.type==='move'?`Mover até ${cellLabel(a.path.at(-1))}`:variant?.name||form?.name;return `<li><span class="order">${rank+1}</span><div class="description"><strong>${esc(u.name)}</strong> · ${esc(name)}<small>${a.type==='move'?'Movimento':priorityNames[tacticalSpec(u,variant||form).priority]}</small></div><div class="controls"><button data-order="${i}" data-direction="-1" aria-label="Subir ação de ${esc(u.name)}" ${queueNeighbor(i,-1)===null||state.busy?'disabled':''}>↑</button><button data-order="${i}" data-direction="1" aria-label="Descer ação de ${esc(u.name)}" ${queueNeighbor(i,1)===null||state.busy?'disabled':''}>↓</button><button data-remove="${i}" aria-label="Remover ação de ${esc(u.name)}" ${state.busy?'disabled':''}>×</button></div></li>`;}).join('')}</ol>`;
}
function portraitSrc(unit){return unit?.art?.portrait||'';}
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
 const cost=isMove?'<span class="cost-free">LIVRE</span>':cardCostMarkup(actor,ability),blocked=!isMove&&(actor.cooldowns[ability.id]||actor.stunned);
 const heat=patternGrid(isMove?'square':spec.pattern);
 return '<button class="skill action-card" data-mode="'+esc(mode)+'" aria-pressed="'+selected+'" aria-label="'+esc(name+'; '+description+'; '+(isMove?'1 ação, sem custo':costText(actor,ability)))+'" '+(blocked?'disabled':'')+'>'+
 '<span class="card-head"><span class="card-art">'+(art?'<img src="'+esc(art)+'" alt="" loading="lazy">':'')+'<span class="card-type">'+esc(label)+'</span></span><span class="card-title"><strong>'+esc(name)+'</strong><small>'+esc(description)+'</small></span></span>'+
 '<span class="card-pattern">'+heat+'<span class="area-label">'+(isMove?'2 casas':esc(patternNames[spec.pattern]))+'</span></span>'+
 '<span class="card-footer"><span class="card-cost">'+cost+'</span><span class="action-point">1 AÇÃO</span></span></button>';
}
function boardMarkup(s){
 const aim=new Set(aimed(s).map(cellKey)),u=selectedUnit(s),anim=state.animation,wave=new Set((anim?.cells||[]).map(cellKey)),hits=new Set(anim?.targets||[]);
 return '<div class="board" role="group" aria-label="Arena tática em grade de cinco por cinco">'+boardCells().map(p=>{
  const unit=occupied(s,p),blocked=obstacle(s,p),reachable=state.mode==='move'&&u&&findPath(s,u.id,p);
  const classes=['cell',blocked?'blocked':'',aim.has(cellKey(p))?'aim':'',wave.has(cellKey(p))&&anim?.family?'wave-'+anim.family:'',reachable?'reachable':'',unit?.id===state.selected?'active':'',wave.has(cellKey(p))?'wave':'',unit&&hits.has(unit.id)?'hit':''].filter(Boolean).join(' ');
  const animClass=unit&&anim?.actorId===unit.id?(anim.type==='move'?'animate-move':anim.type==='skill'?(anim.category===1?'animate-defense':'animate-skill'):'animate-prepare'):'';
  const animAbility=unit&&anim?.actorId===unit.id&&anim.abilityId?unit.abilities.find(k=>k.id===anim.abilityId):null;
  const effect=animAbility?(Object.keys(getAbilityResourceCosts(unit,animAbility)).find(k=>k!=='random')||'essence'):'essence';
  const side=unit?.side||'',art=portraitSrc(unit),depthScale=(.89+p.y*.035).toFixed(3),motionId=animAbility?.id||anim?.type||'',motionVariant=motionId?[...motionId].reduce((n,ch)=>n+ch.charCodeAt(0),0)%3:0;
  return '<button class="'+classes+'" data-cell="'+p.x+','+p.y+'" style="--depth-scale:'+depthScale+'" aria-label="'+cellLabel(p)+(blocked?', obstáculo':unit?', '+esc(unit.name)+', '+(side==='player'?'aliado':'inimigo')+', Vida '+unit.hp+', '+esc(unit.identityTitle||''):', vazia')+'" '+(state.busy?'disabled':'')+'><span class="coord">'+cellLabel(p)+'</span>'+
   (unit?'<span class="token '+esc(side)+' '+animClass+(unit.stunned?' stunned':'')+'" data-effect="'+esc(effect)+'" data-realm="'+esc(unit.realm||'')+'" data-family="'+esc(anim?.actorId===unit.id?anim.family||'strike':'idle')+'" data-pose="'+esc(anim?.actorId===unit.id?anim.pose||'ready':'ready')+'">'+(art?'<img class="token-art" src="'+esc(art)+'" alt="" loading="lazy">':'')+'<span class="token-copy"><b>'+esc(unit.name)+'</b><small>'+esc(unit.identityTitle||unit.realm||'')+'</small></span><span class="hp"><i style="width:'+Math.max(0,unit.hp/unit.maxHp*100)+'%"></i></span>'+(unit.shield?'<em>◇ '+unit.shield+'</em>':unit.invulnerable?'<em>◇</em>':unit.stunned?'<em>!</em>':'')+'</span>':blocked?'<span aria-hidden="true">◆</span>':'')+'</button>';
 }).join('')+'</div>';
}
function render(){
 const s=shown(),u=selectedUnit(s),preview=actionPreview(),locked=state.busy||state.battle.tactical.stage==='finished';
 const uses=state.draft.reduce((n,a)=>n+(a.actorId===u?.id),0),a=u?.abilities.find(a=>a.id===state.mode),proposed=candidate(),check=proposed?previewTacticalPlan(state.battle,'player',[...state.draft,proposed]):null;
 const anim=state.animation,animUnit=anim?tacticalUnits(state.battle).find(c=>c.id===anim.actorId):null;
 const animAbility=anim?.abilityId?animUnit?.abilities.find(k=>k.id===anim.abilityId):null,animArt=animAbility?.art||portraitSrc(animUnit);
 const callout=anim?'<div class="arena-callout active" data-family="'+esc(anim.family||'strike')+'" data-pose="'+esc(anim.pose||'ready')+'" aria-live="polite">'+(animArt?'<img class="callout-art" src="'+esc(animArt)+'" alt="">':'')+'<span><strong>'+esc(animUnit?.name||'Arena')+'</strong> · '+esc(anim.title||(anim.type==='move'?'Reposicionamento':'Técnica revelada'))+'</span></div>':'<div class="arena-callout">POSICIONE O TRIO · LEIA A ÁREA · REVELE AS AÇÕES</div>';
 const cards=u?[actionCardMarkup(u,null,true),...u.abilities.map(k=>actionCardMarkup(u,k))].join(''):'<p class="muted">Selecione uma alma para abrir seu baralho de técnicas.</p>';
 root.innerHTML='<div class="shell"><header class="topbar"><a class="brand" href="/">OBLIVIUM ARENA</a><span class="eyebrow">TRÊS ALMAS · UM PLANO</span><a href="/" class="muted">Voltar ao jogo ↗</a></header>'+
 '<section class="intro"><div><span class="eyebrow">COMBATE TÁTICO · 3V3</span><h1>Arena tática</h1><p>Planeje o movimento, leia o padrão das cartas e combine duas ações por alma.</p></div><div class="round"><small>RODADA</small><b>'+state.battle.round+'</b></div></section>'+
 (state.battle.tactical.stage==='finished'?'<div class="result" role="status">'+(state.battle.phase==='victory'?'Vitória do seu trio':state.battle.phase==='draw'?'Empate':'Seu trio caiu')+(state.battle.phase==='victory'?(state.rewardChoices.length?'<p>Escolha um aprimoramento para levar ao próximo encontro:</p><div class="reward-choices">'+state.rewardChoices.map(b=>'<button data-reward="'+esc(b.id)+'"><strong>'+esc(b.title)+'</strong><small>'+esc(b.text)+'</small></button>').join('')+'</div>':'<p>Aprimoramento escolhido: '+esc(buffs.find(b=>b.id===state.run.buffs.at(-1))?.title||'—')+'</p><button data-command="next-encounter">Próximo encontro · '+(state.run.encounter+1)+'</button>'):' · Abra “Nova formação” para jogar novamente.')+'</div>':'')+
 '<div class="layout"><div><section class="panel board-panel"><div class="board-bar"><h2>Arena de confronto</h2><span class="pill">5 × 5 · 2 AÇÕES POR ALMA</span></div><div class="arena-stage">'+callout+boardMarkup(s)+'</div>'+
 '<div class="legend"><span>◆ Seu trio</span><span>◆ Oposição</span><span>◇ Defesa ativa</span></div><div class="crew">'+s.allies.map(c=>'<button data-actor="'+esc(c.id)+'" aria-pressed="'+(c.id===state.selected)+'" '+(locked||c.hp<=0?'disabled':'')+'><strong>'+esc(c.name)+'</strong><small>'+c.hp+' / '+c.maxHp+' Vida</small><small>'+state.draft.filter(a=>a.actorId===c.id).length+' / 2 ações'+(c.stunned?' · Atordoado':'')+'</small></button>').join('')+'</div>'+
 '<details class="instructions"><summary>Como planejar</summary><ol><li>Selecione uma alma e uma carta de movimento ou técnica.</li><li>Toque numa célula; o padrão dourado mostra a área afetada.</li><li>Adicione até duas ações por alma e confira a ordem.</li><li>Revele os planos. A oposição decidiu sem ver sua fila.</li></ol><p>A posição projetada considera seu plano. O rival pode sair da área ou interromper uma preparação.</p></details></section>'+
 '<section class="panel log"><div class="board-bar"><h2>Última resolução</h2><span class="muted">'+state.lastEvents.filter(e=>e.type!=='reveal'&&e.type!=='effects').length+' ações</span></div><ol class="log-list">'+(state.lastEvents.filter(e=>e.type!=='reveal').map(e=>'<li><strong>'+esc(e.actorId?tacticalUnits(state.battle).find(u=>u.id===e.actorId)?.name:'Rodada')+'</strong> · '+esc(e.title)+'<small>'+(e.type==='effects'?'Efeitos, durações e Essência atualizados.':e.skipped?'Cancelada: '+esc(e.reason):e.type==='move'?e.moved+' passo(s) até '+cellLabel(e.to)+(e.reason?' · '+esc(e.reason):''):(e.totalDamage||0)+' dano'+(e.targets?.length?' · '+e.targets.length+' alvo(s)':' · região vazia')+(e.reactions?.length?' · '+e.reactions.length+' reação(ões)':''))+'</small></li>').join('')||'<li class="muted">As ações aparecem aqui depois que ambos os planos forem revelados.</li>')+'</ol></section></div>'+
 '<div><section class="panel resource-panel"><div class="resource-label"><span>RESERVA COMPARTILHADA</span><span>'+(preview.ok?preview.payment.required:0)+' Coringa na fila</span></div><div class="resources">'+resourceIds.map(id=>'<div class="resource" data-resource="'+id+'"><small>'+names[id]+'</small><b>'+state.battle.resources[id]+'<small> → '+(preview.ok?preview.remaining[id]:'—')+'</small></b>'+(state.payment?'<input type="number" min="0" max="'+state.battle.resources[id]+'" value="'+(state.payment[id]||0)+'" data-payment="'+id+'" aria-label="'+names[id]+' para Coringa" '+(locked?'disabled':'')+'>':'')+'</div>').join('')+'</div>'+
 '<div class="secondary-row"><small class="muted">Atual → após reservar a fila</small><button class="small-button" data-command="payment" '+(locked?'disabled':'')+'>'+(state.payment?'Pagamento automático':'Escolher Coringa')+'</button></div><div class="exchange"><small>Troca 5 → 1</small><select id="exchange-target" aria-label="Essência recebida na troca">'+resourceIds.map(id=>'<option value="'+id+'">'+names[id]+'</option>').join('')+'</select><button class="small-button" data-command="exchange" '+(locked||state.draft.length?'disabled':'')+'>Converter</button></div></section>'+
 '<section class="panel"><div class="board-bar"><div><span class="eyebrow">'+esc(u?.realm||'SEU TRIO')+'</span><h2>'+esc(u?.name||'Selecione uma alma')+'</h2></div><span class="pill">'+uses+' / 2 AÇÕES</span></div><div class="skills">'+cards+'</div><p class="skill-description">'+(state.mode==='move'?'Escolha uma casa livre. O caminho pode ser interrompido se o adversário ocupar a passagem.':esc(a?.description||''))+'</p><div class="action-bar"><button class="primary" data-command="add" '+(locked||!check?.ok?'disabled':'')+'>'+(state.mode==='move'?'Adicionar movimento':'Adicionar técnica')+(state.anchor?' · '+cellLabel(state.anchor):'')+'</button></div><p class="notice" role="status" aria-live="polite">'+esc(state.message||(check&&!check.ok?check.reason:'')||(!preview.ok?preview.reason:''))+'</p></section>'+
 '<section class="panel" style="margin-top:13px"><div class="board-bar"><h2>Plano do trio</h2><span class="pill">'+state.draft.length+' / 6</span></div>'+queueMarkup()+'<button class="primary confirm" data-command="confirm" '+(locked||!preview.ok?'disabled':'')+'>'+(state.busy?'A oposição está planejando…':'Revelar e resolver rodada')+'</button><p class="muted">Espaços vazios contam como espera. Defesas entram antes dos ataques.</p></section></div></div>'+
 '<section class="panel active-upgrades"><strong>Aprendizados da expedição · encontro '+state.run.encounter+'</strong><div>'+state.run.buffs.map(id=>{const b=buffs.find(x=>x.id===id);return b?'<span>'+esc(b.title)+'</span>':''}).join('')+(state.run.memories.length?'<span>'+state.run.memories.length+' memória(s)</span>':'')+'</div></section><details class="panel setup"><summary>Nova formação · seis kits piloto</summary><div class="setup-fields"><div class="team-selects"><label>Seu trio</label>'+[0,1,2].map(i=>teamSelect('player',i)).join('')+'</div><div class="team-selects"><label>Trio adversário</label>'+[0,1,2].map(i=>teamSelect('enemy',i)).join('')+'</div><label>Mapa<select id="map-choice"><option value="open">Arena aberta</option><option value="ruins">Ruínas · duas colunas de pedra</option></select></label><label>Semente<input id="seed-choice" type="number" min="1" max="999999" value="'+state.seed+'"></label></div><button data-command="restart">Iniciar novo confronto</button></details><footer class="footer"><span>PROTÓTIPO LOCAL · IA SEM ACESSO À FILA OCULTA</span><span>As campanhas e a Arena online mantêm o combate atual.</span></footer></div>';
}
function teamSelect(side,index){const units=side==='player'?state.battle.allies:state.battle.enemies,chosen=units[index].sourceId||units[index].id;return `<select id="${side}-choice-${index}" aria-label="${side==='player'?'Aliado':'Adversário'} ${index+1}">${tacticalRoster.map(id=>`<option value="${id}" ${id===chosen?'selected':''}>${esc(characterById[id].name)} — ${esc(characterById[id].identityTitle)}</option>`).join('')}</select>`;}
function paintAnimationPose(event,frame){
 state.animation={...event,...frame};
 if(!root.querySelectorAll){render();return;}
 for(const token of root.querySelectorAll('.token'))if(token.dataset.unitId===event.actorId){token.dataset.family=frame.family;token.dataset.pose=frame.pose;}
 const callout=root.querySelector('.arena-callout');if(callout){callout.dataset.family=frame.family;callout.dataset.pose=frame.pose;}
}
function animateRound(events){
 const sequence=events.filter(e=>(e.type==='move'||e.type==='skill')&&e.actorId);
 if(!sequence.length)return;
 const revision=++state.revision;state.busy=true;
 (async()=>{for(const event of sequence){const unit=tacticalUnits(state.battle).find(c=>c.id===event.actorId),ability=event.abilityId?unit?.abilities.find(k=>k.id===event.abilityId):null;const frames=tacticalAnimationFrames(ability,event.type);for(const [index,frame]of frames.entries()){if(revision!==state.revision)return;if(index===0){state.animation={...event,...frame};render();}else paintAnimationPose(event,frame);await new Promise(resolve=>setTimeout(resolve,68));}}
  if(revision!==state.revision)return;state.animation=null;state.busy=false;render();
 })();
}
function prepareEnemy(playback=[]){
 state.busy=true;const revision=++state.revision;render();
 setTimeout(()=>{if(revision!==state.revision)return;try{const plan=planTacticalAI(tacticalView(state.battle,'enemy'),'enemy');const r=submitTacticalPlan(state.battle,'enemy',plan);if(!r.ok)throw Error(r.reason);state.message='';}catch(e){state.message='Não foi possível planejar: '+e.message;}state.busy=false;render();if(playback.length)animateRound(playback);},0);
}
function start(player=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],enemy=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'],seed=1,ruins=false){
 try{state.battle=createTacticalBattle(player,enemy,{seed,obstacles:ruins?[{x:2,y:1},{x:2,y:3}]:[],buffs:state.run.buffs,memories:state.run.memories,globalEffects:state.run.globalEffects,teamHealth:state.run.teamHealth});}catch(e){state.message=e.message;render();return;}
 Object.assign(state,{draft:[],selected:state.battle.allies[0].id,mode:'move',anchor:null,payment:null,lastEvents:[],animation:null,seed,message:'',rewardChoices:[]});prepareEnemy();
}
root.addEventListener('click',event=>{
 const el=event.target.closest('button');if(!el||el.disabled||state.busy)return;
 if(el.dataset.actor){state.selected=el.dataset.actor;state.anchor=null;state.mode='move';state.message='';render();return;}
 if(el.dataset.mode){state.mode=el.dataset.mode;state.message='';const s=shown(),u=selectedUnit(s),a=u?.abilities.find(a=>a.id===state.mode);state.anchor=a?.target==='self'?{...s.tactical.positions[u.id]}:null;render();return;}
 if(el.dataset.cell){const [x,y]=el.dataset.cell.split(',').map(Number);state.anchor={x,y};state.message='';render();return;}
 if(el.dataset.remove!==undefined){state.draft.splice(Number(el.dataset.remove),1);state.payment=null;state.message='';render();return;}
 if(el.dataset.order!==undefined){const i=Number(el.dataset.order),j=queueNeighbor(i,Number(el.dataset.direction));if(j!==null)[state.draft[i],state.draft[j]]=[state.draft[j],state.draft[i]];state.payment=null;state.message='';render();return;}
 if(el.dataset.reward){if(!chooseTacticalReward(state.run,state.rewardChoices,el.dataset.reward))return;state.rewardChoices=[];render();return;}
 const command=el.dataset.command;
 if(command==='add')return addAction();
 if(command==='payment'){state.payment=state.payment?null:resourceIds.reduce((o,id)=>(o[id]=0,o),{});state.message='';render();}
 if(command==='exchange'){const r=exchangeTacticalEssence(state.battle,'player',document.getElementById('exchange-target').value);state.message=r.ok?'Cinco Essências convertidas em uma.':r.reason;render();}
 if(command==='confirm'){
  const r=submitTacticalPlan(state.battle,'player',state.draft,state.payment);if(!r.ok){state.message=r.reason;render();return;}
  const result=resolveTacticalRound(state.battle);if(!result.ok){state.message=result.reason;render();return;}
  state.lastEvents=result.events;if(result.finished&&state.battle.phase==='victory'){state.rewardChoices=offerTacticalRewards(state.run,state.battle,seed+state.run.encounter);}state.draft=[];state.payment=null;state.anchor=null;state.mode='move';state.selected=state.battle.allies.find(u=>u.hp>0)?.id;state.message='';
  if(result.finished){render();animateRound(result.events);}else prepareEnemy(result.events);
 }
 if(command==='next-encounter'){const next=advanceTacticalRun(state.run,state.battle);if(!next)return;state.seed=next.seed;try{state.battle=createTacticalBattle(next.player,next.enemy,{seed:next.seed,buffs:next.buffs,memories:next.memories,globalEffects:next.globalEffects,teamHealth:next.teamHealth});}catch(e){state.message=e.message;render();return;}Object.assign(state,{draft:[],selected:state.battle.allies.find(u=>u.hp>0)?.id,mode:'move',anchor:null,payment:null,lastEvents:[],animation:null,message:''});prepareEnemy();return;}
 if(command==='restart'){state.run=createTacticalRun();const ids=side=>[0,1,2].map(i=>document.getElementById(`${side}-choice-${i}`).value),seed=Number(document.getElementById('seed-choice').value);start(ids('player'),ids('enemy'),Number.isSafeInteger(seed)?seed:1,document.getElementById('map-choice').value==='ruins');}
});
root.addEventListener('change',event=>{if(event.target.dataset.payment){const value=Number(event.target.value);state.payment[event.target.dataset.payment]=value;state.message='';render();}});
start();
