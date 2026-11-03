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
const columns=Object.freeze([0,1,2,2,3,4,5,5]);
const poseColumns=Object.freeze({anticipate:1,gather:1,compress:1,inhale:1,windup:2,brace:2,guard:2,launch:2,airborne:2,thrust:2,release:2,spread:2,travel:2,impact:3,landing:3,deflect:3,counter:4,followthrough:4,hold:4,transfer:4,settle:4,withdraw:4,recover:5});
export function tacticalSpriteFrame(unit,event=null){
 const atlas=tacticalSpriteAtlases[unit?.sourceId||unit?.id];
 if(!atlas)return null;
 const clip=event?.type==='move'?'move':event?.type==='skill'?skillRowFor(unit,event):'idle';
 if(!clip||rows[clip]===undefined)return null;
 const index=Number.isInteger(event?.index)?Math.max(0,Math.min(7,event.index)):0;
 const column=['projectile','affliction','burst'].includes(event?.family)&&event.pose==='recover'?4:event?.pose==='ready'?(index===0?0:5):(poseColumns[event?.pose]??columns[index]);
 const skill=event?.type==='skill'?tacticalSkillAtlases[`${unit.sourceId||unit.id}/${clip}/${event.formKey||'base'}`]:null;
 if(event?.formKey&&event.formKey!=='base'&&!skill)return null;
 if(skill){const row=Math.floor(column/skill.columns),col=column%skill.columns;return {src:skill.src,clip,row,column:col,x:col*100/(skill.columns-1),y:row*100/(skill.rows-1),sheetColumns:skill.columns,sheetRows:skill.rows};}
 return {src:atlas.src,idleAnimated:clip==='idle',clip,row:rows[clip],column,x:column*20,y:rows[clip]*20,sheetColumns:6,sheetRows:6};
}
export function tacticalSpriteStyle(frame){
 return `background-image:url('${frame.src}');background-size:${frame.sheetColumns*100}% ${frame.sheetRows*100}%;background-position:${frame.x}% ${frame.y}%`;
}
export function paintTacticalToken(token,unit,event,frame){
 if(!unit||token.dataset.unitId!==event.actorId)return false;
 token.dataset.idleAtlas='false';token.dataset.family=frame.family;token.dataset.pose=frame.pose;
 const duration=tacticalFrameDuration({...event,...frame});token.style.setProperty('--pose-duration',`${duration}ms`);
 const fromY=event.before?.positions?.[unit.id]?.y??event.from?.y??0,toY=event.after?.positions?.[unit.id]?.y??event.to?.y??fromY,hopRows=event.type==='move'?toY-fromY:0;
 const laneHop=event.type==='move'&&frame.pose==='airborne'&&hopRows!==0;token.dataset.hop=String(laneHop);token.closest('.cell')?.classList.toggle('hop',laneHop);token.style.setProperty('--hop-y',`${Math.round(hopRows*90)}%`);token.style.setProperty('--hop-mid-y',`${Math.round(hopRows*45)}%`);
 const sprite=token.querySelector('.sprite-sheet'),atlasFrame=tacticalSpriteFrame(unit,{...event,...frame});
 if(sprite&&atlasFrame){blendTacticalSpriteFrame(sprite,atlasFrame,duration);sprite.src=atlasFrame.src;sprite.style.width=`${atlasFrame.sheetColumns*100}%`;sprite.style.height=`${atlasFrame.sheetRows*100}%`;sprite.style.left=`${-atlasFrame.column*100}%`;sprite.style.top=`${-atlasFrame.row*100}%`;return true;}
 const image=token.querySelector('.token-art');
 if(image){
  const action=['release','impact','followthrough','transfer','counter'].includes(frame.pose);
  image.src=action&&token.dataset.skillArt?token.dataset.skillArt:token.dataset.portrait;
 }
 return true;
}

