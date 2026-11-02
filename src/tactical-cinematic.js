import {tacticalAnimationFrames} from './tactical-animation.js';
const escapeHtml=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function tacticalCutinActive(event){
 return event?.type==='skill'&&!event.skipped&&!(event.pose==='ready'&&event.index>0)&&['ready','anticipate','gather','inhale','compress','windup','brace','guard','release','thrust'].includes(event.pose);
}
export function tacticalCutinMarkup(actor,ability,event){
 if(!actor||!tacticalCutinActive(event))return '';
 const art=actor.art?.portrait||ability?.art;if(!art)return '';
 const world=actor.realm==='Inferno'?'inferno':actor.realm==='Paraíso'?'paraiso':'limbo';
 return '<div class="skill-cutin '+world+' '+(actor.side==='enemy'?'enemy':'player')+'" data-pose="'+escapeHtml(event.pose)+'" aria-hidden="true"><div class="cutin-wash"></div><img class="cutin-art" src="'+escapeHtml(art)+'" alt=""><div class="cutin-strokes"></div><span class="cutin-title"><b>'+escapeHtml(actor.name)+'</b><small>'+escapeHtml(ability?.name||event.title)+'</small></span></div>';
}
export function tacticalProjectileKind(actor,ability,event){
 if(event?.type!=='skill'||event.skipped||!ability||['self','ally','friendly','team'].includes(ability.target))return null;
 const id=actor?.sourceId||actor?.id||'';
 const origin=event.before?.positions?.[actor?.id],destination=event.anchor;
 if(!origin||!destination||origin.x===destination.x&&origin.y===destination.y)return null;
 if(['o-tecelao-de-mentiras','a-viuva-escarlate'].includes(id))return 'thread';
 if(id==='a-boca-de-vidro')return 'glass';
 if(!['projectile','affliction','bind'].includes(event.family))return null;
 return actor?.realm==='Inferno'?'ember':'shard';
}
const projectileRows={thread:0,glass:1,ember:2,shard:3};
export function tacticalProjectileMarkup(actor,ability,event){
 const kind=tacticalProjectileKind(actor,ability,event);
 if(!kind||!['travel','spread'].includes(event.pose))return '';
 const origin=event.before.positions[actor.id],destination=event.anchor;
 const fromX=(origin.x+.5)*20,fromY=(origin.y+.7)*20,toX=(destination.x+.5)*20,toY=(destination.y+.7)*20;
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

