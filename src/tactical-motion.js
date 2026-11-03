import {tacticalIdleCrops} from './tactical-idle-crops.js';
// Stable absolute phases keep idle continuous across planning and replay DOM refreshes.
export function tacticalIdleTiming(unit,now=Date.now()){
 const key=[unit?.id||unit?.sourceId||'idle',unit?.bodyForm||'base'].join(':');
 let hash=0;for(const char of key)hash=(hash*31+char.charCodeAt(0))>>>0;
 const cycle=1520+(hash%4)*70,phase=((now+hash%cycle)%cycle+cycle)%cycle;
 return {cycle,phase,framePeriod:cycle/10};
}
export function tacticalIdleStyle(unit,now=Date.now()){
 const {cycle,phase}=tacticalIdleTiming(unit,now),frames=tacticalIdleCrops[unit?.sourceId||unit?.id]||[];
 const crops=frames.map((frame,index)=>`--idle-left-${index}:${frame.left}%;--idle-top-${index}:${frame.top}%;--idle-clip-${index}:inset(${frame.clip.map(n=>n+'%').join(' ')});`).join('');
 return `--idle-cycle:${cycle}ms;--idle-delay:-${phase}ms;`+crops;
}
// Idle has one opaque, clipped drawing at a time; no doubled silhouettes or neighbor fragments.
export function tacticalIdleLayerMarkup(){return '';}
// Briefly dissolve the previous drawing; the source atlas is never interpolated sideways.
export function blendTacticalSpriteFrame(sprite,next,duration){
 const parent=sprite?.parentElement;
 if(!parent||typeof sprite.cloneNode!=='function'||typeof sprite.animate!=='function'||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return false;
 const same=(sprite.getAttribute('src')===next.src&&sprite.style.left===`${-next.column*100}%`&&sprite.style.top===`${-next.row*100}%`);
 if(same)return false;
 for(const old of parent.querySelectorAll('.sprite-previous-frame'))old.remove();
 const rendered=getComputedStyle(sprite),previous=sprite.cloneNode(false);previous.className='sprite-sheet sprite-previous-frame';previous.setAttribute('aria-hidden','true');
 for(const property of ['width','height','left','top','clip-path','object-fit','object-position'])previous.style.setProperty(property,rendered.getPropertyValue(property));
 parent.append(previous);
 const fade=previous.animate([{opacity:1},{opacity:0}],{duration:Math.min(90,Math.max(55,duration*.28)),easing:'cubic-bezier(.22,.7,.3,1)',fill:'forwards'});
 fade.finished.catch(()=>{}).finally(()=>previous.remove());
 return true;
}

