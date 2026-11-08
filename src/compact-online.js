import {currentAccount} from './account-client.js';
import {compactArenaRequest} from './compact-online-client.js';
import {fortressTechniqueSpec} from './tactical-combat.js';
import {tacticalRoster} from './tactical-kits.js';
import {tacticalHand,tacticalResponseOptions,tacticalCardDeck,tacticalMovementSteps,defaultTacticalCardBuild} from './tactical-decks.js';
import {tacticalArea,previewTacticalPlan} from './tactical-combat.js';
import {tacticalAreaDiagramMarkup} from './tactical-area-diagram.js';
import {tacticalSpriteFrame,tacticalSpriteStyle} from './tactical-sprites.js';
import {tacticalDuelOptions,tacticalDuelSummary} from './tactical-duel.js';
import {combatScene} from './combat-scenes.js';
import {findPath,boardCells,unitFacing} from './tactical-board.js';
import {characterById} from './data.js';
import {surfaceAt} from './tactical-elements.js';
const root=document.getElementById('tactical-app');
const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const state={account:null,server:null,loading:true,busy:false,message:'',pollError:false,team:[],actorId:null,selection:null,actions:[],responseCard:null,rewardCard:null,willSign:'miragem',lastRound:null,lastMatchId:null,queuing:false,deckBuilds:{},surrenderConfirm:false};
const match=()=>state.server?.match||null;
const battle=()=>match()?.battle||null;
const owner=s=>s?Object.keys(s.tactical.decks?.sides?.player||{}).length?'player':'enemy':null;
const allUnits=s=>[...s.allies,...s.enemies];
const teammates=(s,side)=>side==='player'?s.allies:s.enemies;
const opponent=(s,side)=>side==='player'?s.enemies:s.allies;
const ownUnit=(s,side)=>teammates(s,side).find(u=>u.id===state.actorId&&u.hp>0)||teammates(s,side).find(u=>u.hp>0)||teammates(s,side)[0];
const coord=p=>p?.x+','+p?.y;
const escapedId=id=>esc(id);
const busy=()=>state.busy;
const phaseEditable=s=>s.tactical.stage==='planning'&&s.phase!=='waiting'&&!busy();
function projection(s,side){
 try{
  const result=previewTacticalPlan(s,side,state.actions);
  return result.ok?result.projection:s;
 }catch{return s;}
}
const deckSaveKey='oblivium-online-card-builds-v1';
function loadDeckBuilds(){
 try{
  const local=JSON.parse(globalThis.localStorage?.getItem(deckSaveKey)||'null');
  if(local&&typeof local==='object'&&!Array.isArray(local))return local;
  const legacy=JSON.parse(globalThis.localStorage?.getItem('oblivium-campaign-card-builds-v1')||'null');
  return legacy&&typeof legacy==='object'&&!Array.isArray(legacy)?legacy:{};
 }catch{return {};}
}
function saveDeckBuilds(){try{globalThis.localStorage?.setItem(deckSaveKey,JSON.stringify(state.deckBuilds));}catch{}}
function deckFor(id){
 const hero=characterById[id];
 if(!hero)return [];
 const allowed=new Set(hero.abilities.map(a=>a.id));
 const preset=defaultTacticalCardBuild(hero);
 const stored=state.deckBuilds[id];
 if(!Array.isArray(stored)||stored.length<8||stored.length>10)return preset;
 return stored.map((card,i)=>{
  if(card?.kind==='skill'&&allowed.has(card.abilityId))return {kind:'skill',abilityId:card.abilityId};
  if(card?.kind==='mobility')return {kind:'mobility'};
  if(card?.kind==='reaction')return {kind:'reaction'};
  return preset[i]||{kind:'mobility'};
 });
}
function deckEditorMarkup(){
 const renderOne=id=>{
  const hero=characterById[id],build=deckFor(id),choices=[
   ...hero.abilities.filter(a=>a.id!=='fortress-basic').map(a=>({key:'skill:'+a.id,name:a.name})),
   {key:'mobility',name:'Passo Longo · mobilidade'},
   {key:'reaction',name:'Último Suspiro · reação'}
  ];
  return '<section class="online-deck-hero"><h3>'+esc(hero.name)+' · '+build.length+' cartas</h3>'
   +'<div class="online-deck-slots">'+build.map((card,i)=>{
    const chosen=card.kind==='skill'?'skill:'+card.abilityId:card.kind;
    return '<label>Carta '+(i+1)+'<select data-deck-slot="'+esc(id)+'|'+i+'">'
     +choices.map(option=>'<option value="'+esc(option.key)+'" '+(option.key===chosen?'selected':'')+'>'+esc(option.name)+'</option>').join('')
     +'</select></label>';
   }).join('')+'</div><div class="online-deck-actions">'
   +'<button data-deck-add="'+esc(id)+'" '+(build.length>=10?'disabled':'')+'>Adicionar carta</button>'
   +'<button data-deck-remove="'+esc(id)+'" '+(build.length<=8?'disabled':'')+'>Remover última</button>'
   +'<button data-deck-default="'+esc(id)+'">Restaurar padrão</button></div></section>';
 };
 return '<details class="online-deck-editor"><summary>Equipar os três baralhos · 8 a 10 cartas por personagem</summary>'
  +'<p>Monte cada mão com técnicas do próprio personagem, mobilidade e reação. Modificadores de dano de campanhas não são importados para o ranqueado.</p>'
  +state.team.filter(id=>characterById[id]).map(renderOne).join('')+'</details>';
}
function legalFormation(){
 const team=state.team;
 return team.length===3&&new Set(team).size===3&&team.every(id=>state.account?.profile?.ownedIds?.includes(id)&&tacticalRoster.includes(id));
}
function contextReset(next){
 const m=next?.match,b=m?.battle;
 if(!m){state.actions=[];state.selection=null;state.lastRound=null;state.lastMatchId=null;return;}
 if(state.lastMatchId!==m.id||state.lastRound!==b.round){
  state.actions=[];state.selection=null;state.rewardCard=null;state.surrenderConfirm=false;
 }
 state.lastMatchId=m.id;state.lastRound=b.round;
 const side=owner(b),live=teammates(b,side).filter(u=>u.hp>0);
 if(!live.some(u=>u.id===state.actorId))state.actorId=live[0]?.id||null;
}
async function request(payload,{silent=false}={}){
 if(state.busy)return;
 let shouldRender=true;
 state.busy=true;if(!silent){state.message='';state.pollError=false;}
 try{
  const response=await compactArenaRequest(payload);
  if(silent&&state.pollError){state.message='';state.pollError=false;}
  else if(silent&&JSON.stringify(response)===JSON.stringify(state.server))shouldRender=false;
  state.server=response;contextReset(response);
  state.queuing=Boolean(response.queued);
 }catch(e){state.message=e.message;state.pollError=silent;if(e.status===409){try{const response=await compactArenaRequest({op:'profile'});state.server=response;contextReset(response);}catch{}}}
 finally{state.busy=false;if(shouldRender)render();}
}
function rosterMarkup(s,side){
 const allies=teammates(s,side),enemies=opponent(s,side);
 const chip=(unit,enemy)=>{
  const hp=Math.max(0,Math.round(100*unit.hp/Math.max(1,unit.maxHp)));
  return '<span class="online-roster-chip '+(enemy?'enemy':'ally')+'" title="'+esc(unit.name)+'" data-dead="'+(unit.hp<=0)+'">'
   +(unit.art?.portrait?'<img src="'+esc(unit.art.portrait)+'" alt="">':'<span>◆</span>')
   +'<span class="online-roster-health" style="--hp:'+hp+'%"></span></span>';
 };
 return '<div class="online-rosters"><div aria-label="Sua equipe">'+allies.map(u=>chip(u,false)).join('')+'</div>'
  +'<span class="online-versus">RODADA '+s.round+' · VS</span><div aria-label="Equipe adversária">'+enemies.map(u=>chip(u,true)).join('')+'</div></div>';
}
function spriteMarkup(s,unit,side){
 const own=unit.side===side,frame=tacticalSpriteFrame(unit,null,s.tactical.facings?.[unit.id]);
 const art=unit.art?.portrait||characterById[unit.sourceId||unit.id]?.art?.portrait;
 const sprite=frame?'<span class="online-sprite" style="'+esc(tacticalSpriteStyle(frame))+'"></span>'
  :art?'<img class="online-sprite-fallback" src="'+esc(art)+'" alt="">':'<span class="online-sprite-fallback">◆</span>';
 return '<span class="online-unit" data-own="'+own+'" data-selected="'+(unit.id===state.actorId)+'" data-unit-id="'+esc(unit.id)+'">'
  +'<span class="online-unit-name">'+esc(unit.name)+'</span>'+sprite+'</span>';
}
function boardMarkup(s,side){
 const scene=combatScene(s.tactical.scene);
 const positions=s.tactical.positions||{};
 const units=allUnits(s).filter(u=>u.hp>0);
 const myObjective=s.tactical.objectives?.[side]?.position;
 const focus=state.selection?.mode==='skill'?projection(s,side):s;
 const origin=focus.tactical.positions[state.actorId];
 const cells=boardCells(s).map(p=>{
  const unit=units.find(u=>coord(positions[u.id])===coord(p));
  const surface=surfaceAt(s,p),objective=coord(myObjective)===coord(p);
  const preview=state.selection?.mode==='skill'&&origin?(()=>{
   const actor=ownUnit(focus,side),a=actor.abilities.find(x=>x.id===state.selection.abilityId);
   if(!a)return false;
   const direction=[Math.sign(p.x-origin.x),Math.sign(p.y-origin.y)];
   if(!direction[0]&&!direction[1])direction.splice(0,2,...unitFacing(focus,actor));
   return tacticalArea(focus,actor,a,p,direction).length>0;
  })():false;
  return '<button type="button" role="gridcell" class="online-cell" data-cell="'+coord(p)+'"'
   +' data-surface="'+esc(surface?.element||'none')+'" data-objective="'+objective+'"'
   +' data-possible="'+preview+'" aria-label="Casa '+String.fromCharCode(65+p.x)+(p.y+1)+(unit?' · '+esc(unit.name):'')+'">'
   +(surface?'<span class="online-surface" title="'+esc(surface.element)+'"></span>':'')
   +(objective?'<span class="online-objective" title="Seu emblema objetivo">✧</span>':'')
   +(unit?spriteMarkup(s,unit,side):'')+'</button>';
 }).join('');
 return '<div class="online-battle-scene" style="--scene-image:url(\''+esc(scene.art)+'\')">'
  +rosterMarkup(s,side)+'<div class="online-board" role="grid" aria-label="Arena 6 por 6">'+cells+'</div></div>';
}
function queued(s,side){
 return '<div class="online-queue-list">'+state.actions.map((action,i)=>{
  const unit=teammates(s,side).find(u=>u.id===action.actorId);
  const ability=unit?.abilities.find(a=>a.id===action.abilityId);
  const title=action.type==='move'?'Mover para '+coord(action.path?.at(-1)):ability?.name||'Técnica';
  return '<button type="button" class="online-queued" data-remove="'+i+'" title="Remover esta ação"><b>'+(i+1)+'</b>'+esc(unit?.name||'')+' · '+esc(title)+' <span>×</span></button>';
 }).join('')+'</div>';
}
function handMarkup(s,side,actor){
 const cards=tacticalHand(s,side,actor.id),used=new Set(state.actions.map(x=>x.cardId).filter(Boolean));
 const pending=state.selection,locked=!phaseEditable(s);
 const cardMarkup=card=>{
  if(card.kind==='reaction')return '<div class="online-card reaction" title="Gasta durante um Confronto de Vontades"><b>↶ '+esc(card.name)+'</b><small>Reação</small></div>';
  const playing=pending?.cardId===card.id;
  const ability=actor.abilities.find(a=>a.id===card.abilityId);
  const enabled=card.kind==='mobility'||Boolean(ability);
  const diagram=card.kind==='skill'&&ability?tacticalAreaDiagramMarkup(fortressTechniqueSpec(s,actor,ability),{facing:unitFacing(s,actor)}):'';
  return '<button type="button" class="online-card" data-use-card="'+esc(card.id)+'" aria-pressed="'+playing+'" '+(locked||used.has(card.id)||!enabled?'disabled':'')+'>'
   +'<b>'+esc(card.name)+'</b><small>'+esc(card.kind==='mobility'?'Mobilidade · '+tacticalMovementSteps(card)+' casas':ability?.description?.slice(0,90)||'Técnica')+'</small>'+diagram+'</button>';
 };
 return cards.map(cardMarkup).join('');
}
function controlsMarkup(s,side){
 const actor=ownUnit(s,side),readOnly=!phaseEditable(s),count=state.actions.filter(a=>a.actorId===actor.id).length,hand=tacticalHand(s,side,actor.id);
 const basic=actor.abilities.find(a=>a.id==='fortress-basic');
 const active=state.selection;
 const signs=tacticalDuelOptions.map(sign=>'<button type="button" data-sign="'+sign.id+'" aria-pressed="'+(sign.id===state.willSign)+'">'+esc(sign.name)+'</button>').join('');
 return '<aside class="online-action-panel" aria-label="Painel de ações"><section><h3>Personagens</h3><div class="online-actor-row">'
  +teammates(s,side).map(u=>'<button data-select-actor="'+esc(u.id)+'" aria-pressed="'+(actor.id===u.id)+'" '+(u.hp<=0?'disabled':'')+'>'+esc(u.name)+'</button>').join('')
  +'</div><small>'+esc(actor.name)+' · '+count+'/2 ações selecionadas</small></section>'
  +'<section><h3>Ações</h3><button class="online-move" data-move '+(readOnly?'disabled':'')+' aria-pressed="'+(active?.mode==='move')+'">Mover 1 casa</button>'
  +(basic?'<button data-basic '+(readOnly?'disabled':'')+' aria-pressed="'+(active?.mode==='skill'&&!active.cardId&&active.abilityId==='fortress-basic')+'">Ataque básico</button>':'')+'</section>'
  +'<section><h3>Habilidades · mão individual</h3><p class="online-deck-count">'+hand.length+' cartas na mão · '+(tacticalCardDeck(s,side,actor.id)?.draw?.length||0)+' no monte</p>'
  +'<div class="online-cards">'+handMarkup(s,side,actor)+'</div>'
  +'<div class="online-signs"><small>Intenção dos especiais ofensivos</small><div>'+signs+'</div></div></section>'
  +'<section><h3>Itens</h3><p>Sem itens neste confronto.</p></section>'
  +'<section><h3>Planejamento</h3><small>Primeiras ações de todos, depois as segundas.</small>'+queued(s,side)
  +'<div class="online-buttons"><button data-undo '+(readOnly||!state.actions.length?'disabled':'')+'>Desfazer</button>'
  +'<button class="online-primary" data-confirm '+(readOnly?'disabled':'')+'>Confirmar rodada · '+state.actions.length+'/6</button></div></section></aside>';
}
function clashMarkup(s,side){
 const response=s.tactical.clash;
 if(!response||!response.defender)return '';
 const available=tacticalResponseOptions(s,side,response.targetId);
 const options=(available.basic?'<option value="">Resposta padrão</option>':'')
  +available.reactions.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>').join('');
 return '<section class="online-clash" role="dialog" aria-label="Confronto de Vontades"><h2>CONFRONTO DE VONTADES</h2>'
  +'<p>Uma técnica especial está prestes a atingir '+esc(teammates(s,side).find(u=>u.id===response.targetId)?.name||'sua equipe')+'. A intenção ofensiva foi escolhida em segredo.</p>'
  +'<div class="online-clash-signs">'+tacticalDuelOptions.map(option=>'<button data-response="'+option.id+'" '+(busy()?'disabled':'')+'><b>'+option.symbol+' '+esc(option.name)+'</b><small>'+esc(option.hint)+'</small></button>').join('')+'</div>'
  +(options?'<label>Custo da resposta <select data-response-card>'+options+'</select></label>':'')
  +'<p class="online-sign-hint">Miragem distorce Luz · Luz revela Sombra · Sombra engole Miragem</p>'
  +'<button data-response="pass" class="online-decline" '+(busy()?'disabled':'')+'>Aceitar o golpe e guardar resposta</button></section>';
}
function rewardMarkup(s,side){
 const offers=s.tactical.pendingChestRewards||[];
 if(!offers.length)return '';
 const offer=offers[0],unit=teammates(s,side).find(u=>u.id===offer.actorId);
 const cards=unit?Object.values(tacticalCardDeck(s,side,unit.id)?.cards||{}).filter(c=>c.kind==='skill'):[];
 return '<section class="online-reward"><h2>Emblema '+esc(offer.tierName)+' · '+esc(unit?.name||'Equipe')+'</h2><p>Escolha uma melhoria para continuar.</p>'
  +'<label>Carta para inscrição<select data-reward-card>'+cards.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>').join('')+'</select></label>'
  +'<div class="online-reward-options">'+offer.options.map(o=>'<button data-reward="'+esc(o.id)+'" '+(busy()?'disabled':'')+'>'
  +'<b>'+esc(o.title)+'</b><small>'+esc(o.text)+'</small></button>').join('')+'</div></section>';
}
function activityMarkup(s){
 const events=(s.tactical.events||[]).filter(e=>e&&typeof e==='object').slice(-6).reverse();
 if(!events.length)return '';
 return '<details class="online-activity" open><summary>Últimos acontecimentos</summary><ol>'
 +events.map(event=>{
  const duel=tacticalDuelSummary(event.duel);
  const before=[...(event.before?.allies||[]),...(event.before?.enemies||[])];
  const after=[...(event.after?.allies||[]),...(event.after?.enemies||[])];
  const indexed=new Map(before.map(u=>[u.id,u]));
  const changes=after.map(u=>{
   const old=indexed.get(u.id);if(!old)return null;
   const hp=(u.hp||0)-(old.hp||0),shield=(u.shield||0)-(old.shield||0);
   if(!hp&&!shield)return null;
   return {name:u.name||old.name,hp,shield};
  }).filter(Boolean).slice(0,6);
  return '<li class="online-activity-event" data-event-type="'+esc(event.type||'unknown')+'"><b>'+esc(event.title||'Efeito resolvido')+'</b>'
   +(duel?'<p class="online-activity-duel">Ataque: '+esc(duel.attack)+' · Defesa: '+esc(duel.defense)+' · '+esc(duel.label)+'</p>':'')
   +(changes.length?'<div class="online-activity-changes">'+changes.map(change=>
    '<span><strong>'+esc(change.name)+'</strong> '
    +(change.hp?'<em data-stat="hp" data-negative="'+(change.hp<0)+'">'+(change.hp>0?'+':'')+change.hp+' Vida</em> ':'')
    +(change.shield?'<em data-stat="shield" data-negative="'+(change.shield<0)+'">'+(change.shield>0?'+':'')+change.shield+' Defesa</em>':'')+'</span>').join('')+'</div>'
   :'<small>Sem alteração imediata de Vida ou Defesa</small>')+'</li>';
 }).join('')+'</ol></details>';
}
function setupMarkup(){
 const owned=state.account?.profile?.ownedIds||[],available=tacticalRoster.filter(id=>owned.includes(id));
 const options=(index)=>available.map(id=>'<option value="'+esc(id)+'" '+(state.team[index]===id?'selected':'')+'>'+esc(characterById[id].name)+'</option>').join('');
 return '<section class="online-matchmaking"><h2>Arena ranqueada · 3v3</h2><p>Selecione três personagens recrutados. Cada um terá seu próprio baralho e sua própria mão. O planejamento fica oculto até a confirmação dos dois lados.</p>'
  +(available.length>=3?'<div class="online-formation">'+[0,1,2].map(i=>'<label>Personagem '+(i+1)+'<select data-team-slot="'+i+'">'+options(i)+'</select></label>').join('')+'</div>'
   +deckEditorMarkup()
   +'<button class="online-primary" data-queue '+(legalFormation()||false?'':'disabled')+'>'+(state.queuing?'Atualizar busca':'Buscar partida')+'</button>'
   +(state.queuing?'<button data-cancel>Cancelar busca</button>':'')
   :'<p>Você precisa recrutar pelo menos três personagens disponíveis para o combate compacto antes de buscar uma partida.</p>')
  +'</section>';
}
function statusMarkup(s){
 const id=s.tactical.clash?.defender?'Um especial exige sua resposta':s.phase==='waiting'?'Aguardando o adversário':
  s.tactical.stage==='reward'?'Aprimoramento pendente':
  s.tactical.stage==='planning'?'Monte as ações secretas da rodada':s.tactical.stage==='finished'?'Confronto encerrado':'Resolvendo rodada';
 const last=s.tactical.events?.at(-1);
 return '<p class="online-state" role="status">'+esc(id)+(last?' · '+esc(last.title||last.type):'')+'</p>';
}
function render(){
 if(state.loading){root.innerHTML='<div class="online-loading">Conectando à Arena compacta…</div>';return;}
 const account=state.account;
 const header='<header class="online-header"><a href="/">OBLIVIUM ARENA</a><b>ARENA COMPACTA · PvP 6×6</b><a href="/tactical.html">Treino contra IA</a></header>';
 if(!account?.user){root.innerHTML='<div class="online-shell">'+header+'<section class="online-matchmaking"><h2>Entre na sua conta</h2><p>Partidas ranqueadas exigem uma sessão autenticada. O treino contra IA continua livre.</p><a href="/">Voltar ao jogo e entrar</a></section></div>';return;}
 const s=battle(),side=owner(s);
 let body;
 if(!s){body=setupMarkup();}
 else if(s.tactical.stage==='finished'){
  const result=s.phase==='victory'?'Vitória':s.phase==='defeat'?'Derrota':s.phase==='draw'?'Empate':'Confronto encerrado';
  body='<div class="online-result"><h2>'+result+'</h2><p>Resultado validado pelo servidor.</p><button data-ack class="online-primary">Retornar à formação</button></div>'+activityMarkup(s);
 }else{
  body='<div class="online-combat">'+boardMarkup(s,side)+controlsMarkup(s,side)+'</div>'
   +statusMarkup(s)+clashMarkup(s,side)+rewardMarkup(s,side)+activityMarkup(s)
   +'<div class="online-surrender-controls">'
   +(state.surrenderConfirm?'<p>Tem certeza de que deseja encerrar esta partida? A derrota será registrada.</p>'
      +'<button data-surrender-cancel>Voltar</button> <button data-surrender-confirm>Confirmar rendição</button>'
      :'<button data-surrender>Render-se</button>')
   +'</div>';
 }
 root.innerHTML='<div class="online-shell">'+header
  +'<p class="online-account">Alma: '+esc(state.server?.profile?.name||account.user?.handle||'Andarilho')
  +' · Classificação: '+esc(state.server?.profile?.rank||'—')+' · '+esc(state.server?.profile?.rating||1000)+' pontos'
  +'<button data-refresh '+(busy()?'disabled':'')+'>Atualizar</button></p>'
  +(state.message?'<p class="online-error" role="alert">'+esc(state.message)+'</p>':'')
  +body+'</div>';
 const resource=root.querySelector('[data-response-card]');
 if(resource&&state.responseCard&&[...resource.options].some(o=>o.value===state.responseCard))resource.value=state.responseCard;
 const reward=root.querySelector('[data-reward-card]');
 if(reward&&state.rewardCard&&[...reward.options].some(o=>o.value===state.rewardCard))reward.value=state.rewardCard;
}
function addAction(ref){
 const s=battle(),side=owner(s);
 const preview=previewTacticalPlan(s,side,[...state.actions,ref]);
 if(!preview.ok){state.message=preview.reason;state.pollError=false;render();return;}
 state.actions.push(ref);state.selection=null;state.message='';state.pollError=false;render();
}
function chooseCell(point){
 const s=battle(),side=owner(s);
 if(!phaseEditable(s)||!state.selection)return;
 const view=projection(s,side),unit=ownUnit(view,side),from=view.tactical.positions[unit.id],selected=state.selection;
 if(selected.mode==='move'||selected.mode==='mobility'){
  const card=selected.cardId?tacticalHand(s,side,unit.id).find(c=>c.id===selected.cardId):null;
  const max=card?tacticalMovementSteps(card):1;
  const path=findPath(view,unit.id,point,max);
  if(!path){state.message='Destino inválido ou caminho bloqueado.';state.pollError=false;render();return;}
  addAction({type:'move',actorId:unit.id,path,...(card?{cardId:card.id}:{})});return;
 }
 const dir=[Math.sign(point.x-from.x),Math.sign(point.y-from.y)];
 if(!dir[0]&&!dir[1])dir.splice(0,2,...unitFacing(view,unit));
 addAction({type:'skill',actorId:unit.id,abilityId:selected.abilityId,cardId:selected.cardId||null,
  anchor:point,orientation:dir,willSign:state.willSign});
}
async function initialize(){
 try{
  state.account=await currentAccount();
  if(state.account.user){
   const owned=state.account.profile?.ownedIds||[];
   state.team=tacticalRoster.filter(id=>owned.includes(id)).slice(0,3);
   state.deckBuilds=loadDeckBuilds();
   state.server=await compactArenaRequest({op:'profile'});
   contextReset(state.server);
   state.queuing=Boolean(state.server.queued);
  }
 }catch(error){state.message=error.message;}
 finally{state.loading=false;render();}
}
root.addEventListener('click',async event=>{
 const button=event.target.closest('button');if(!button||button.disabled||state.busy)return;
 const d=button.dataset,s=battle(),side=owner(s);
 if(d.selectActor){state.actorId=d.selectActor;state.selection=null;render();return;}
 if(d.sign){state.willSign=d.sign;render();return;}
 if('move'in d){state.selection={mode:'move'};render();return;}
 if('basic'in d){state.selection={mode:'skill',abilityId:'fortress-basic',cardId:null};render();return;}
 if(d.useCard){
  const card=tacticalHand(s,side,state.actorId).find(c=>c.id===d.useCard);
  if(!card)return;
  state.selection={mode:card.kind==='mobility'?'mobility':'skill',cardId:card.id,abilityId:card.abilityId};render();return;
 }
 if(d.cell){const [x,y]=d.cell.split(',').map(Number);chooseCell({x,y});return;}
 if(d.remove!==undefined){state.actions.splice(Number(d.remove),1);state.selection=null;render();return;}
 if('undo'in d){state.actions.pop();state.selection=null;render();return;}
 if('confirm'in d){await request({op:'turn',version:match().version,round:s.round,actions:state.actions});return;}
 if(d.response){
  const cardId=d.response==='pass'?null:root.querySelector('[data-response-card]')?.value||null;
  await request({op:'response',version:match().version,sign:d.response,cardId});return;
 }
 if(d.reward){
  const offer=s.tactical.pendingChestRewards[0],option=offer?.options.find(x=>x.id===d.reward);
  const cardId=option?.effect?.type==='tactical-card-upgrade'
   ?root.querySelector('[data-reward-card]')?.value||null:null;
  await request({op:'reward',version:match().version,offerId:offer.id,optionId:d.reward,cardId});return;
 }
 if(d.deckAdd){const build=deckFor(d.deckAdd);if(build.length<10){state.deckBuilds[d.deckAdd]=[...build,{kind:'mobility'}];saveDeckBuilds();render();}return;}
 if(d.deckRemove){const build=deckFor(d.deckRemove);if(build.length>8){state.deckBuilds[d.deckRemove]=build.slice(0,-1);saveDeckBuilds();render();}return;}
 if(d.deckDefault){delete state.deckBuilds[d.deckDefault];saveDeckBuilds();render();return;}
 if('surrender'in d){state.surrenderConfirm=true;render();return;}
 if('surrenderCancel'in d){state.surrenderConfirm=false;render();return;}
 if('surrenderConfirm'in d){state.surrenderConfirm=false;await request({op:'surrender'});return;}
 if('queue'in d){if(legalFormation()){const decks=Object.fromEntries(state.team.map(id=>[id,deckFor(id)]));await request({op:'queue',team:state.team,decks});}return;}
 if('cancel'in d){await request({op:'cancel'});return;}
 if('ack'in d){await request({op:'ack'});state.queuing=false;return;}
 if('refresh'in d){await request({op:'profile'});return;}
});
root.addEventListener('change',event=>{
 if(event.target.matches('[data-deck-slot]')){
  const [id,index]=event.target.dataset.deckSlot.split('|'),value=event.target.value;
  const build=deckFor(id),position=Number(index);
  if(!Number.isInteger(position)||position<0||position>=build.length)return;
  build[position]=value.startsWith('skill:')?{kind:'skill',abilityId:value.slice(6)}:{kind:value==='reaction'?'reaction':'mobility'};
  state.deckBuilds[id]=build;saveDeckBuilds();render();return;
 }
 if(event.target.matches('[data-team-slot]')){
  state.team[Number(event.target.dataset.teamSlot)]=event.target.value;render();
 }else if(event.target.matches('[data-response-card]'))state.responseCard=event.target.value||null;
 else if(event.target.matches('[data-reward-card]'))state.rewardCard=event.target.value||null;
});
document.addEventListener('keydown',event=>{
 if(event.target.matches('input,select,textarea,[contenteditable]'))return;
 if(event.code==='Space'&&battle()?.tactical.stage==='planning'&&battle().phase!=='waiting'){
  event.preventDefault();const button=root.querySelector('[data-confirm]:not(:disabled)');button?.click();
 }
});
initialize();
setInterval(async()=>{
 if(state.loading||state.busy||!state.account?.user||(!state.queuing&&!match())||match()?.settled)return;
 await request({op:'profile'},{silent:true});
},2300);
