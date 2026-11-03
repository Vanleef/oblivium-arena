// Stable absolute phases keep idle continuous across planning and replay DOM refreshes.
export function tacticalIdleTiming(unit,now=Date.now()){
 const key=[unit?.id||unit?.sourceId||'idle',unit?.bodyForm||'base'].join(':');
 let hash=0;for(const char of key)hash=(hash*31+char.charCodeAt(0))>>>0;
 const cycle=4600+(hash%7)*240,phase=((now+hash%cycle)%cycle+cycle)%cycle;
 return {cycle,phase,framePeriod:cycle/10};
}
export function tacticalIdleStyle(unit,now=Date.now()){
 const {cycle,phase,framePeriod}=tacticalIdleTiming(unit,now);
 return `--idle-cycle:${cycle}ms;--idle-delay:-${phase}ms;--idle-blend:${framePeriod}ms;`;
}
export function tacticalIdleLayerMarkup(frame){
 if(!frame?.idleAnimated)return '';
 return `<img class="sprite-sheet idle-next-frame" src="${frame.src}" alt="" aria-hidden="true" style="width:${frame.sheetColumns*100}%;height:${frame.sheetRows*100}%;left:-100%;top:0%">`;
}
// Briefly dissolve the previous drawing; the source atlas is never interpolated sideways.
export function blendTacticalSpriteFrame(sprite,next,duration){
 const parent=sprite?.parentElement;
 if(!parent||typeof sprite.cloneNode!=='function'||typeof sprite.animate!=='function'||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return false;
 const same=(sprite.getAttribute('src')===next.src&&sprite.style.left===`${-next.column*100}%`&&sprite.style.top===`${-next.row*100}%`);
 if(same)return false;
 for(const old of parent.querySelectorAll('.sprite-previous-frame'))old.remove();
 const previous=sprite.cloneNode(false);previous.className='sprite-sheet sprite-previous-frame';previous.setAttribute('aria-hidden','true');parent.append(previous);
 const fade=previous.animate([{opacity:1},{opacity:0}],{duration:Math.min(100,Math.max(45,duration*.35)),easing:'ease-out',fill:'forwards'});
 fade.finished.catch(()=>{}).finally(()=>previous.remove());
 return true;
}
