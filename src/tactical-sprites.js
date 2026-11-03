import {tacticalFrameDuration} from './tactical-animation.js';
// Candidate hand-drawn atlas coverage is intentionally separate from the generic
// pose fallback. A mapped form is required: unknown forms never borrow base art.
const root='/art/animations/tactical-pilot-20261101';
const pilotAtlasEntries=[
 ['o-acougueiro','riven'],['a-viuva-escarlate','lira'],['o-escudo-vivo','aegis'],
 ['o-passo-interrompido','chronos'],['o-odio-encarnado','corvin'],['a-arquiteta-verde','verdant'],
 ['nilo','nilo'],['naomi','naomi'],['kael','kael'],['diana','diana'],['a-mae-rubra','selene'],['o-soberano-quebrado','darius'],['o-colecionador-de-cabecas','thorne'],['vaas','vaas']
];
const pilotAtlases=Object.fromEntries(pilotAtlasEntries.map(([id,name])=>[id,Object.freeze({src:`${root}/${name}.webp`,columns:6,rows:6,cellSize:209})]));
export const tacticalSpriteAtlases=Object.freeze({
 ...pilotAtlases,
 'a-regente-de-cinzas':Object.freeze({src:'/art/animations/tactical-pilot-20261102/ashara.webp',columns:6,rows:6,cellSize:209}),
 'a-juiza-de-ferro':Object.freeze({src:'/art/animations/tactical-pilot-20261102/judith.webp',columns:6,rows:6,cellSize:209}),
 'o-carrasco-sem-rosto':Object.freeze({src:'/art/animations/tactical-pilot-20261102/sanson.webp',columns:6,rows:6,cellSize:209}),
 'a-mascara-dupla':Object.freeze({src:'/art/animations/tactical-pilot-20261102/nyx.webp',columns:6,rows:6,cellSize:209}),
 'o-herdeiro-cativo':Object.freeze({src:'/art/animations/tactical-pilot-20261102/malrik.webp',columns:6,rows:6,cellSize:209}),
 'gemeos-do-cutelo':Object.freeze({src:'/art/animations/tactical-pilot-20261102/gemeos-do-cutelo.webp',columns:6,rows:6,cellSize:209}),
 'o-trono-vazio':Object.freeze({src:'/art/animations/tactical-pilot-20261102/lucien.webp',columns:6,rows:6,cellSize:209}),
 'o-principe-das-correntes':Object.freeze({src:'/art/animations/tactical-pilot-20261102/demetrius.webp',columns:6,rows:6,cellSize:209}),
 'o-tecelao-de-mentiras':Object.freeze({src:'/art/animations/tactical-pilot-20261102/orin-v1.webp',columns:6,rows:6,cellSize:209,idleAnimated:true}),
 'a-boca-de-vidro':Object.freeze({src:'/art/animations/tactical-pilot-20261102/sylvara-v1.webp',columns:6,rows:6,cellSize:209,idleAnimated:true}),
 'o-sussurro':Object.freeze({src:'/art/animations/tactical-pilot-20261102/vesper.webp',columns:6,rows:6,cellSize:209})
});
const rows=Object.freeze({idle:0,move:1,impulso:2,tecnica:3,voto:4,despertar:5});
const skillRows=Object.freeze(['impulso','tecnica','voto','despertar']);
function skillRowFor(unit,event){
 const direct=[event?.animationSlot,event?.slot,event?.clip,event?.abilityId].find(key=>typeof key==='string'&&Object.prototype.hasOwnProperty.call(rows,key));
 if(direct)return direct;
 const index=unit?.abilities?.findIndex(ability=>ability.id===event?.abilityId)??-1;
 return skillRows[index]??null;
}
export const tacticalSkillAtlases=Object.freeze({
 'o-tecelao-de-mentiras/tecnica/unweave':Object.freeze({src:'/art/animations/orin-skills-20261102/desatar-a-trama-v1.webp',columns:3,rows:2}),
 'nilo/tecnica/base':Object.freeze({src:'/art/animations/nilo-skills-20261102/fio-de-memoria.webp',columns:3,rows:2})
});
const frameColumns=Object.freeze({
 move:Object.freeze({ready:0,anticipate:1,compress:1,launch:2,airborne:3,landing:4,settle:5}),
 strike:Object.freeze({ready:0,anticipate:1,windup:2,release:3,impact:4,followthrough:5,recover:5}),
 slash:Object.freeze({ready:0,anticipate:1,windup:2,release:3,impact:4,followthrough:5,recover:5}),
 pierce:Object.freeze({ready:0,anticipate:1,compress:2,thrust:3,impact:4,withdraw:5,recover:5}),
 projectile:Object.freeze({ready:0,gather:1,windup:2,release:3,travel:4,impact:5,recover:5}),
 burst:Object.freeze({ready:0,anticipate:1,gather:2,windup:2,release:3,impact:4,recover:5}),
 bind:Object.freeze({ready:0,anticipate:1,gather:2,release:3,spread:4,impact:5,hold:5}),
 affliction:Object.freeze({ready:0,gather:1,inhale:2,release:3,spread:4,impact:5,recover:5}),
 guard:Object.freeze({ready:0,anticipate:1,brace:2,guard:3,impact:4,hold:5,recover:5}),
 counter:Object.freeze({ready:0,anticipate:1,brace:2,guard:3,deflect:4,counter:5,recover:5}),
 support:Object.freeze({ready:0,anticipate:1,gather:2,release:3,impact:4,transfer:5,settle:5})
});
export function tacticalSpriteFrame(unit,event=null){
 const atlas=tacticalSpriteAtlases[unit?.sourceId||unit?.id];
 if(!atlas)return null;
 // Hold one registered drawing for the full move. Atlas cells were generated
 // as separate poses and their framing is not stable enough for frame swaps.
 return {src:atlas.src,idleAnimated:false,clip:'idle',row:0,column:0,x:0,y:0,sheetColumns:atlas.columns,sheetRows:atlas.rows};
}
export function tacticalSpriteStyle(frame){
 return `background-image:url('${frame.src}');background-size:${frame.sheetColumns*100}% ${frame.sheetRows*100}%;background-position:${frame.x}% ${frame.y}%`;
}
export function paintTacticalToken(token,unit,event,frame){
 if(!unit||token.dataset.unitId!==event.actorId)return false;
 const sprite=token.querySelector('.sprite-sheet'),atlasFrame=tacticalSpriteFrame(unit,{...event,...frame});
 const duration=tacticalFrameDuration({...event,...frame});
 token.dataset.idleAtlas='false';token.dataset.family=frame.family;token.dataset.pose=frame.pose;
 token.style.setProperty('--pose-duration',`${duration}ms`);
 const fromY=event.before?.positions?.[unit.id]?.y??event.from?.y??0,toY=event.after?.positions?.[unit.id]?.y??event.to?.y??fromY,hopRows=event.type==='move'?toY-fromY:0;
 const start=event.before?.positions?.[unit.id]||event.from||{x:0,y:0},aim=event.anchor||event.to||start;
 if(event.type==='move'){
  const board=token.closest('.board'),fromCell=token.closest('.cell'),toCell=board?.querySelector(`[data-cell="${event.to?.x},${event.to?.y}"]`);
  if(fromCell&&toCell){const a=fromCell.getBoundingClientRect(),b=toCell.getBoundingClientRect(),x=b.left+b.width/2-a.left-a.width/2,y=b.top+b.height/2-a.top-a.height/2;token.style.setProperty('--travel-x',`${x}px`);token.style.setProperty('--travel-y',`${y}px`);token.style.setProperty('--travel-mid-x',`${x*.52}px`);token.style.setProperty('--travel-mid-y',`${y*.52}px`);}
 }
 let dx=Math.sign(aim.x-start.x),dy=Math.sign(aim.y-start.y);if(!dx&&!dy){dx=event.orientation?.[0]||1;dy=event.orientation?.[1]||0;}
 token.style.setProperty('--windup-x',`${-dx*2}%`);token.style.setProperty('--windup-y',`${-dy*2}%`);token.style.setProperty('--lunge-x',`${dx*5}%`);token.style.setProperty('--lunge-y',`${dy*4}%`);token.style.setProperty('--follow-x',`${dx*2}%`);token.style.setProperty('--follow-y',`${dy*1}%`);
 const laneHop=event.type==='move'&&frame.pose==='airborne'&&hopRows!==0;token.dataset.hop=String(laneHop);token.closest('.cell')?.classList.toggle('hop',laneHop);token.style.setProperty('--hop-y',`${Math.round(hopRows*90)}%`);token.style.setProperty('--hop-mid-y',`${Math.round(hopRows*45)}%`);
 if(sprite&&atlasFrame&&sprite.getAttribute('src')!==atlasFrame.src)sprite.src=atlasFrame.src;
 return true;
}


