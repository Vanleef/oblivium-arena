import {tacticalFrameDuration} from './tactical-animation.js';
import {blendTacticalSpriteFrame} from './tactical-motion.js';
// Candidate hand-drawn atlas coverage is intentionally separate from the generic
// pose fallback. A mapped form is required: unknown forms never borrow base art.
const root='/art/animations/tactical-pilot-20261101';
const pilotAtlasEntries=[
 ['o-acougueiro','riven'],['a-viuva-escarlate','lira'],['o-escudo-vivo','aegis'],
 ['o-passo-interrompido','chronos'],['o-odio-encarnado','corvin'],['a-arquiteta-verde','verdant'],
 ['nilo','nilo'],['naomi','naomi'],['kael','kael'],['diana','diana'],['a-mae-rubra','selene'],['o-soberano-quebrado','darius'],['o-colecionador-de-cabecas','thorne'],['vaas','vaas']
];
const expansionAtlases=Object.fromEntries([['o-falso-profeta','cassian'],['o-corretor-de-memorias','annius'],['o-incendiario','ignis'],['a-brasa-eterna','emberlyn'],['o-filho-da-cinza','ragnar'],['a-pira-errante','lyra'],['o-coracao-em-furia','pyros'],['o-devorador','gorath'],['a-mao-que-toma','ravena'],['o-estomago-sem-fundo','drake'],['a-senhora-do-ultimo-pao','helena'],['o-credor','marrow'],['a-balanca-vazia','fortuna'],['o-apodrecido','aldric'],['o-corrupto','pact'],['o-medico-de-vermes','bram'],['o-jardim-morto','thorn'],['a-porta-fechada','mira']].map(([id,name])=>[id,Object.freeze({src:'/art/animations/tactical-expansion-20261105/'+name+'.webp',columns:6,rows:6,cellSize:160,phased:true})]));
const pilotAtlases=Object.fromEntries(pilotAtlasEntries.map(([id,name])=>[id,Object.freeze({src:`${root}/${name}.webp`,columns:6,rows:6,cellSize:209})]));
export const tacticalSpriteAtlases=Object.freeze({
 ...pilotAtlases,...expansionAtlases,
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
 if(event?.abilityId==='fortress-basic')return 'impulso';
 const direct=[event?.animationSlot,event?.slot,event?.clip,event?.abilityId].find(key=>typeof key==='string'&&Object.prototype.hasOwnProperty.call(rows,key));
 if(direct)return direct;
 const index=unit?.abilities?.findIndex(ability=>ability.id===event?.abilityId)??-1;
 return skillRows[index]??null;
}
export const tacticalSkillAtlases=Object.freeze({
 'o-soberano-quebrado/impulso/edict':Object.freeze({src:'/art/animations/tactical-expansion-20261105/darius-edict.webp',columns:6,rows:3,rowOffset:0,phased:true}),
 'o-soberano-quebrado/tecnica/edict':Object.freeze({src:'/art/animations/tactical-expansion-20261105/darius-edict.webp',columns:6,rows:3,rowOffset:1,phased:true}),
 'o-soberano-quebrado/voto/edict':Object.freeze({src:'/art/animations/tactical-expansion-20261105/darius-edict.webp',columns:6,rows:3,rowOffset:2,phased:true}),
 'a-brasa-eterna/impulso/smother':Object.freeze({src:'/art/animations/tactical-expansion-20261105/emberlyn-smother.webp',columns:6,rows:3,rowOffset:0,phased:true}),
 'a-brasa-eterna/tecnica/smother':Object.freeze({src:'/art/animations/tactical-expansion-20261105/emberlyn-smother.webp',columns:6,rows:3,rowOffset:1,phased:true}),
 'a-brasa-eterna/voto/smother':Object.freeze({src:'/art/animations/tactical-expansion-20261105/emberlyn-smother.webp',columns:6,rows:3,rowOffset:2,phased:true}),

 'o-filho-da-cinza/impulso/rebirth':Object.freeze({src:'/art/animations/tactical-expansion-20261105/ragnar-rebirth.webp',columns:3,rows:2}),
 'a-pira-errante/impulso/reply':Object.freeze({src:'/art/animations/tactical-expansion-20261105/lyra-reply.webp',columns:3,rows:2}),
 'o-devorador/impulso/starved':Object.freeze({src:'/art/animations/tactical-expansion-20261105/gorath-starved.webp',columns:3,rows:2}),
 'a-mao-que-toma/tecnica/open':Object.freeze({src:'/art/animations/tactical-expansion-20261105/ravena-open.webp',columns:3,rows:2}),
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
const bodyAtlasNames=Object.freeze({
 'o-acougueiro':'riven','a-viuva-escarlate':'lira','o-escudo-vivo':'aegis',
 'o-passo-interrompido':'chronos','o-odio-encarnado':'corvin','a-arquiteta-verde':'verdant'
});
const phaseColumns=Object.freeze({ready:0,anticipate:1,compress:1,gather:2,inhale:2,brace:2,windup:2,guard:3,release:3,thrust:3,impact:3,travel:4,spread:4,deflect:4,counter:4,followthrough:4,hold:5,withdraw:4,transfer:4,recover:5,settle:5,launch:2,airborne:3,landing:4});
const bodyColumns=Object.freeze({
 ready:0,anticipate:0,compress:1,inhale:1,gather:1,windup:1,brace:1,
 guard:2,release:2,thrust:2,travel:3,spread:3,deflect:3,impact:3,
 counter:4,followthrough:4,hold:4,withdraw:4,transfer:4,recover:5,settle:5
});
export const tacticalDirectionalAtlases=Object.freeze(Object.fromEntries(
 Object.entries(bodyAtlasNames).map(([id,name])=>[id,Object.freeze({
  src:'/art/animations/tactical-directions-20261105/'+name+'.webp',
  columns:name==='riven'?6:4,rows:10
 })])
));
export function tacticalSpriteFrame(unit,event=null,facing=null){
 const id=unit?.sourceId||unit?.id,body=bodyAtlasNames[id],original=tacticalSpriteAtlases[id];
 if(!original)return null;
 const finished=event?.pose==='ready'&&event.index>0;
 const casting=event?.type==='skill'&&!event.skipped&&!finished;
 const form=event?.formKey||'base';
 const dedicated=casting?tacticalSkillAtlases[[id,event.abilityId,form].join('/')]:null;
 const skill=casting&&form==='base'?skillRowFor(unit,event):null;
 const orientation=facing||event?.orientation||event?.after?.facings?.[unit?.id]||event?.before?.facings?.[unit?.id];
 const directional=tacticalDirectionalAtlases[id];
 if(directional&&orientation?.[1]&&!dedicated){
  const walking=event?.type==='move'&&!finished;
  const slot=casting&&event.abilityId==='fortress-basic'?'impulso':skill;
  const actionRow=casting&&skillRows.includes(slot)?skillRows.indexOf(slot)+1:0;
  const row=(orientation[1]<0?0:5)+actionRow;
  const step=walking||actionRow?bodyColumns[event?.pose]??0:0;
  const column=directional.columns===6?step:Math.min(3,Math.round(step*3/5));
  const idle=!walking&&!actionRow;
  return {src:directional.src,idleAnimated:idle,directional:true,view:orientation[1]<0?'north':'south',
   clip:walking?'move':actionRow?slot:'idle',bodyClip:!idle,row,column,
   x:column*100/(directional.columns-1),y:row*100/(directional.rows-1),
   sheetColumns:directional.columns,sheetRows:directional.rows};
 }

 const moving=!body&&event?.type==='move'&&!finished&&Boolean(frameColumns.move[event.pose]);
 const bodyClip=Boolean(dedicated||skillRows.includes(skill)||moving);
 let row=0,column=0;
 if(dedicated){
  const frame=(dedicated.phased?phaseColumns:bodyColumns)[event.pose]??0;
  row=(dedicated.rowOffset||0)+Math.floor(frame/dedicated.columns);
  column=frame%dedicated.columns;
 }else if(body&&bodyClip){
  row=skillRows.indexOf(skill)+1;
  column=bodyColumns[event.pose]??0;
  // Threaded casts continue their follow-through after launch.
  if(event.pose==='impact'&&['bind','affliction','projectile'].includes(event.family))column=4;
 }else if(moving){
  row=rows.move;
  column=frameColumns.move[event.pose];
 }else if(!body&&skillRows.includes(skill)){
  row=rows[skill];
  column=frameColumns[event.family]?.[event.pose]??0;
 }
 if(original.phased&&!dedicated&&bodyClip){
  column=phaseColumns[event.pose]??0;
 }
 const src=dedicated?.src||(body?`/art/animations/tactical-body-20261104/${body}.webp`:original.src);
 const sheetRows=dedicated?.rows||(body?5:original.rows);
 const sheetColumns=dedicated?.columns||original.columns;
 return {src,idleAnimated:false,clip:dedicated?event.abilityId:moving?'move':row?skill:'idle',bodyClip,row,column,
  x:column*100/(sheetColumns-1),y:row*100/(sheetRows-1),sheetColumns,sheetRows};
}
export function tacticalSpriteInline(frame){
 const important=frame.bodyClip?'!important':'';
 return 'width:'+frame.sheetColumns*100+'%;height:'+frame.sheetRows*100+'%;left:'+(-frame.column*100)+'%'+important+';top:'+(-frame.row*100)+'%'+important;
}
export function tacticalSpriteStyle(frame){
 return `background-image:url('${frame.src}');background-size:${frame.sheetColumns*100}% ${frame.sheetRows*100}%;background-position:${frame.x}% ${frame.y}%`;
}
export function paintTacticalToken(token,unit,event,frame){
 if(!unit||token.dataset.unitId!==event.actorId)return false;
 const restoring=frame.pose==='ready'&&frame.index>0;
 const orientation=(restoring?event.after?.facings?.[unit.id]:event.orientation)||event.after?.facings?.[unit.id];
 const sprite=token.querySelector('.sprite-sheet'),atlasFrame=tacticalSpriteFrame(unit,{...event,...frame},orientation);
 const duration=tacticalFrameDuration({...event,...frame});
 if(sprite&&atlasFrame)blendTacticalSpriteFrame(sprite,atlasFrame,duration);
 token.dataset.idleAtlas='false';token.dataset.bodyClip=String(Boolean(atlasFrame?.bodyClip));token.dataset.family=frame.family;token.dataset.pose=frame.pose;
 token.style.setProperty('--pose-duration',`${duration}ms`);
 const fromY=event.before?.positions?.[unit.id]?.y??event.from?.y??0,toY=event.after?.positions?.[unit.id]?.y??event.to?.y??fromY,hopRows=event.type==='move'?toY-fromY:0;
 const start=event.before?.positions?.[unit.id]||event.from||{x:0,y:0},aim=event.anchor||event.to||start;
 if(event.type==='move'){
  const board=token.closest('.board'),fromCell=token.closest('.cell'),toCell=board?.querySelector(`[data-cell="${event.to?.x},${event.to?.y}"]`);
  if(fromCell&&toCell){const a=fromCell.getBoundingClientRect(),b=toCell.getBoundingClientRect(),x=b.left+b.width/2-a.left-a.width/2,y=b.top+b.height/2-a.top-a.height/2;token.style.setProperty('--travel-x',`${x}px`);token.style.setProperty('--travel-y',`${y}px`);token.style.setProperty('--travel-mid-x',`${x*.52}px`);token.style.setProperty('--travel-mid-y',`${y*.52}px`);}
 }
 let dx=orientation?.[0]??Math.sign(aim.x-start.x),dy=orientation?.[1]??Math.sign(aim.y-start.y);if(!dx&&!dy){dx=orientation?.[0]||1;dy=orientation?.[1]||0;}
 token.dataset.directional=String(Boolean(atlasFrame?.directional));
 token.style.setProperty('--facing-sign',atlasFrame?.directional?1:dx<0?-1:1);
 token.style.setProperty('--windup-x',`${-dx*2}%`);token.style.setProperty('--windup-y',`${-dy*2}%`);token.style.setProperty('--lunge-x',`${dx*5}%`);token.style.setProperty('--lunge-y',`${dy*4}%`);token.style.setProperty('--follow-x',`${dx*2}%`);token.style.setProperty('--follow-y',`${dy*1}%`);
 const laneHop=event.type==='move'&&frame.pose==='airborne'&&hopRows!==0;token.dataset.hop=String(laneHop);token.closest('.cell')?.classList.toggle('hop',laneHop);token.style.setProperty('--hop-y',`${Math.round(hopRows*90)}%`);token.style.setProperty('--hop-mid-y',`${Math.round(hopRows*45)}%`);
 if(sprite&&atlasFrame){
  if(sprite.getAttribute('src')!==atlasFrame.src)sprite.src=atlasFrame.src;
  if(sprite.style?.setProperty){
   const priority=atlasFrame.bodyClip?'important':'';
   sprite.style.setProperty('left',(-atlasFrame.column*100)+'%',priority);
   sprite.style.setProperty('top',(-atlasFrame.row*100)+'%',priority);
   sprite.style.setProperty('width',atlasFrame.sheetColumns*100+'%');
   sprite.style.setProperty('height',atlasFrame.sheetRows*100+'%');
  }
 }
 return true;
}
