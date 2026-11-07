import {boardMetricPoint,boardTracks} from './tactical-board.js';
import {tacticalAnimationFrames} from './tactical-animation.js';
import {tacticalActorPalette} from './tactical-visual-palette.js';
const escapeHtml=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const superSlots=new Set(['voto','despertar']);
// A super is a brief arena treatment, not a portrait-sized interruption.
// Regular techniques and repeated common attacks keep the board unobscured.
export function tacticalCutinActive(event){
 if(event?.type!=='skill'||event.skipped||event.comboBeat>1)return false;
 if(event.compactReplay&&event.repeated&&!tacticalHighlightEvent(event))return false;
 if(!superSlots.has(String(event.abilityId||'').split('/')[0])&&!tacticalHighlightEvent(event))return false;
 return ['anticipate','gather','inhale','compress','windup','brace','release','thrust'].includes(event.pose);
}
export function tacticalCutinMarkup(actor,ability,event){
 if(!actor||!tacticalCutinActive(event))return '';
 const world=actor.realm==='Inferno'?'inferno':actor.realm==='Paraíso'?'paraiso':'limbo';
 const side=actor.side==='enemy'?'enemy':'player';
 const phase=['release','thrust'].includes(event.pose)?'release':'charge';
 const colors=tacticalActorPalette(actor);
 const tint=colors?' style="--super-bright:'+colors[0]+';--super-accent:'+colors[1]+';--super-deep:'+colors[2]+'"':'';
 // Speed streaks, darkened arena and an anchored character glow: no oversized artwork.
 return '<div class="fighter-super '+world+' '+side+'" data-pose="'+escapeHtml(event.pose)+'" data-phase="'+phase+'"'+tint+' aria-hidden="true"><span class="fighter-super-veil"></span><span class="fighter-super-speedlines"></span><span class="fighter-super-rupture"></span></div>';
}
// Keep the readable name BELOW the grid, including the attack contact.
export function tacticalSuperCaptionActive(event){
 if(event?.type!=='skill'||event.skipped)return false;
 if(event.compactReplay&&event.repeated&&!tacticalHighlightEvent(event))return false;
 if(!superSlots.has(String(event.abilityId||'').split('/')[0])&&!tacticalHighlightEvent(event))return false;
 return ['anticipate','gather','inhale','compress','windup','brace','release','thrust',
  'travel','spread','impact','counter','followthrough','recover','hold'].includes(event.pose);
}
export function tacticalSuperCaptionMarkup(actor,ability,event){
 if(!actor||!tacticalSuperCaptionActive(event))return '';
 const world=actor.realm==='Inferno'?'inferno':actor.realm==='Paraíso'?'paraiso':'limbo';
 const colors=tacticalActorPalette(actor),tint=colors?' style="--caption-accent:'+colors[1]+'"':'';
 return '<div class="fighter-super-nameplate '+world+'"'+tint+' role="status" aria-live="off">'
  +'<b>'+escapeHtml(actor.name)+'</b><strong>'+escapeHtml(ability?.name||event.title||'Especial')+'</strong></div>';
}
export function tacticalProjectileKind(actor,ability,event){
 if(event?.type!=='skill'||event.skipped||!ability||['self','ally','friendly','team'].includes(ability.target))return null;
 const id=actor?.sourceId||actor?.id||'';
 const origin=event.before?.positions?.[actor?.id],destination=event.anchor;
 if(!origin||!destination||origin.x===destination.x&&origin.y===destination.y)return null;
 if(id==='nilo'&&event.abilityId==='tecnica'&&(!event.formKey||event.formKey==='base'))return 'thread';
 if(['o-tecelao-de-mentiras','a-viuva-escarlate'].includes(id))return 'thread';
 if(id==='a-boca-de-vidro')return 'glass';
 if(!['projectile','affliction','bind'].includes(event.family))return null;
 return actor?.realm==='Inferno'?'ember':'shard';
}
const projectileRows={thread:0,glass:1,ember:2,shard:3};
export function tacticalProjectileMarkup(actor,ability,event){
 const kind=tacticalProjectileKind(actor,ability,event);
 if(!kind||!['travel','spread'].includes(event.pose))return '';
 const grid={tactical:event.before},tracks=boardTracks(grid);
 const origin=boardMetricPoint(grid,event.before.positions[actor.id]),destination=boardMetricPoint(grid,event.anchor);
 const w=100/tracks.columns.length,h=100/tracks.rows.length;
 const fromX=(origin.x+.5)*w,fromY=(origin.y+.7)*h,toX=(destination.x+.5)*w,toY=(destination.y+.7)*h;
 const angle=Math.atan2((toY-fromY)*.42,toX-fromX)*180/Math.PI;
 return '<span class="skill-projectile '+kind+'" aria-hidden="true" style="--projectile-from-x:'+fromX+'%;--projectile-from-y:'+fromY+'%;--projectile-to-x:'+toX+'%;--projectile-to-y:'+toY+'%;--projectile-angle:'+angle+'deg;--projectile-row:'+projectileRows[kind]*100/3+'%"><span class="projectile-material"></span></span>';
}

export function tacticalPlaybackFrames(actor,ability,event){
 const frames=tacticalAnimationFrames(ability,event.type),kind=tacticalProjectileKind(actor,ability,{...event,family:frames[0]?.family});
 if(!kind||frames.some(frame=>['travel','spread'].includes(frame.pose)))return frames;
 const contact=frames.findIndex(frame=>['impact','counter'].includes(frame.pose));if(contact<0)return frames;
 frames.splice(contact,0,{family:frames[0].family,pose:'travel'});
 return frames.map((frame,index)=>({...frame,index,count:frames.length}));
}


// Preserve full presentation for defeats and actual body transformations, including a defeated actor.
export function tacticalHighlightEvent(event){
 if(event?.type!=='skill'||event.skipped||!event.before||!event.after)return false;
 const before=new Map([...(event.before.allies||[]),...(event.before.enemies||[])].map(u=>[u.id,u]));
 return [...(event.after.allies||[]),...(event.after.enemies||[])].some(u=>{
  const old=before.get(u.id);return old&&(old.hp>0&&u.hp<=0||(old.bodyForm||'base')!==(u.bodyForm||'base'));
 });
}
export function tacticalReplayFrames(actor,ability,event){
 if(event.reactionCounter){
  const poses=['brace','deflect','counter','impact','recover'];
  return poses.map((pose,index)=>({family:'counter',pose,index,count:poses.length}));
 }
 const frames=tacticalPlaybackFrames(actor,ability,event);
 if(event.comboReplay){
  // Character-specific material VFX still run on EVERY true contact.
  const first=event.comboBeat===1,last=event.comboBeat===event.comboTotal;
  const poses=first?['anticipate','windup','release','impact']:
   last?['release','impact','followthrough','recover']:['release','impact'];
  return poses.map((pose,index)=>({family:frames[0]?.family||event.family||'strike',
   pose,index,count:poses.length,comboBeat:event.comboBeat,comboTotal:event.comboTotal}));
 }
 if(!event.compactReplay||!event.repeated||event.type!=='skill'||event.skipped||tacticalHighlightEvent(event))return frames;
 // Keep travel before contact and one full impact; only shorten repeated preparation/recovery.
 const compact=frames.filter((frame,i)=>i===0||i===frames.length-1||['release','thrust','travel','spread','impact','counter'].includes(frame.pose));
 return compact.map((frame,index)=>({...frame,index,count:compact.length}));
}
