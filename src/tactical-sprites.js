// Candidate hand-drawn atlas coverage is intentionally separate from the generic
// pose fallback. A mapped form is required: unknown forms never borrow base art.
const root='/art/animations/tactical-pilot-20261101';
export const tacticalSpriteAtlases=Object.freeze(Object.fromEntries([
 ['o-acougueiro','riven'],['a-viuva-escarlate','lira'],['o-escudo-vivo','aegis'],
 ['o-passo-interrompido','chronos'],['o-odio-encarnado','corvin'],['a-arquiteta-verde','verdant'],
 ['nilo','nilo'],['naomi','naomi'],['kael','kael'],['diana','diana'],['a-mae-rubra','selene'],['o-soberano-quebrado','darius'],['o-colecionador-de-cabecas','thorne']
].map(([id,name])=>[id,Object.freeze({src:`${root}/${name}.webp`,columns:6,rows:6,cellSize:209})])));
const rows=Object.freeze({idle:0,move:1,impulso:2,tecnica:3,voto:4,despertar:5});
export const tacticalSkillAtlases=Object.freeze({
 'nilo/tecnica/base':Object.freeze({src:'/art/animations/nilo-skills-20261102/fio-de-memoria.webp',columns:3,rows:2})
});
const columns=Object.freeze([0,1,2,2,3,4,5,5]);
const poseColumns=Object.freeze({anticipate:1,gather:1,compress:1,inhale:1,windup:2,brace:2,guard:2,launch:2,airborne:2,thrust:2,release:2,spread:2,travel:2,impact:3,landing:3,deflect:3,counter:4,followthrough:4,hold:4,transfer:4,settle:4,withdraw:4,recover:5});
export function tacticalSpriteFrame(unit,event=null){
 const atlas=tacticalSpriteAtlases[unit?.sourceId||unit?.id];
 if(!atlas)return null;
 if(event?.formKey&&event.formKey!=='base')return null;
 const clip=event?.type==='move'?'move':event?.type==='skill'?event.abilityId:'idle';
 if(rows[clip]===undefined)return null;
 const index=Number.isInteger(event?.index)?Math.max(0,Math.min(7,event.index)):0;
 const column=event?.family==='projectile'&&event.pose==='recover'?4:event?.pose==='ready'?(index===0?0:5):(poseColumns[event?.pose]??columns[index]);
 const skill=event?.type==='skill'?tacticalSkillAtlases[`${unit.sourceId||unit.id}/${clip}/${event.formKey||'base'}`]:null;
 if(skill){const row=Math.floor(column/skill.columns),col=column%skill.columns;return {src:skill.src,clip,row,column:col,x:col*100/(skill.columns-1),y:row*100/(skill.rows-1),sheetColumns:skill.columns,sheetRows:skill.rows};}
 return {src:atlas.src,clip,row:rows[clip],column,x:column*20,y:rows[clip]*20,sheetColumns:6,sheetRows:6};
}
export function tacticalSpriteStyle(frame){
 return `background-image:url('${frame.src}');background-size:${frame.sheetColumns*100}% ${frame.sheetRows*100}%;background-position:${frame.x}% ${frame.y}%`;
}
export function paintTacticalToken(token,unit,event,frame){
 if(!unit||token.dataset.unitId!==event.actorId)return false;
 token.dataset.family=frame.family;token.dataset.pose=frame.pose;
 const sprite=token.querySelector('.sprite-sheet'),atlasFrame=tacticalSpriteFrame(unit,{...event,...frame});
 if(sprite&&atlasFrame){sprite.style.backgroundImage=`url('${atlasFrame.src}')`;sprite.style.backgroundSize=`${atlasFrame.sheetColumns*100}% ${atlasFrame.sheetRows*100}%`;sprite.style.backgroundPosition=`${atlasFrame.x}% ${atlasFrame.y}%`;return true;}
 const image=token.querySelector('.token-art');
 if(image){
  const action=['release','impact','followthrough','transfer','counter'].includes(frame.pose);
  image.src=action&&token.dataset.skillArt?token.dataset.skillArt:token.dataset.portrait;
 }
 return true;
}
