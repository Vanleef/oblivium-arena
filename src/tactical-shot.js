// Presentation coordinates are cell-relative. They never move a combatant in the rules engine.
const melee=new Set(['slash','pierce','strike']);
const windup=new Set(['anticipate','compress','inhale','windup','gather','brace']);
const strike=new Set(['release','thrust','travel','spread','impact','counter']);
const follow=new Set(['followthrough','withdraw','hold','transfer']);
const ward=new Set(['guard','counter','support']);
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));

export function tacticalShot(event){
 if(event?.type!=='skill'||event.skipped)return null;
 const from=event.before?.positions?.[event.actorId];
 if(!from)return null;
 const targetId=(event.affectedTargetIds||[])[0];
 const to=(targetId&&event.before.positions[targetId])||event.anchor||from;
 const dx=to.x-from.x,dy=to.y-from.y;
 const length=Math.hypot(dx,dy),vx=length?dx/length:0,vy=length?dy/length:0;
 const close=melee.has(event.family),defense=ward.has(event.family);
 const pose=event.pose,pre=windup.has(pose),contact=strike.has(pose),tail=follow.has(pose);
 const travel=close?Math.min(length*.26,.64):defense?0:.1;
 const shift=pre?(close?-.17:-.06):contact?travel:tail?travel*.33:0;
 const lift=pre?(close?2:5):contact?(close?4:8):0;
 const tilt=(event.family==='pierce'?4:8)*Math.sign(vx);
 const scale=pre?(defense?1.055:.97):contact?(close?1.065:1.035):1;
 const width=event.before.width||5,height=event.before.height||5;
 const nearLeft=Math.min(from.x,to.x)===0,nearRight=Math.max(from.x,to.x)===width-1;
 // The stage clips its scenery. Reduce zoom when a silhouette is already at an outer edge.
 const zoom=contact?1.075:pre?1.04:tail?1.035:1;
 const focus=Math.min(zoom,nearLeft&&nearRight?1.02:nearLeft||nearRight?1.035:1.075);
 const center=(from.x+to.x+1)*50/width;
 const focusX=nearLeft&&!nearRight?Math.min(center,23):nearRight&&!nearLeft?Math.max(center,77):clamp(center,14,86);
 return {from,to,focus,focusX,focusY:clamp((from.y+to.y+1)*50/height,15,85),
  x:vx*shift,y:vy*shift,lift,tilt:pre?-tilt*.6:contact?tilt:tail?tilt*.25:0,scale};
}

export function applyTacticalShot(stage,event,duration){
 if(!stage)return;
 const shot=tacticalShot(event);
 const board=stage.querySelector('.board');
 if(!shot||!board)return;
 stage.classList.add('choreographed');
 board.style.setProperty('--shot-duration',duration+'ms');
 board.style.setProperty('--shot-zoom',shot.focus);
 board.style.setProperty('--shot-x',shot.focusX+'%');
 board.style.setProperty('--shot-y',shot.focusY+'%');
 const token=[...board.querySelectorAll('.token')].find(node=>node.dataset.unitId===event.actorId);
 const cell=token?.closest('.cell');
 const model=token?.querySelector('.sprite-viewport,.token-art');
 if(!cell||!model)return;
 const drawn=token.dataset.bodyClip==='true',weight=drawn?.38:1;
 model.classList.add('shot-model');
 model.style.setProperty('--shot-duration',duration+'ms');
 model.style.setProperty('--model-x',shot.x*cell.clientWidth*weight+'px');
 model.style.setProperty('--model-y',(shot.y*cell.clientHeight-shot.lift)*weight+'px');
 model.style.setProperty('--model-tilt',(drawn?0:shot.tilt)+'deg');
 model.style.setProperty('--model-scale',drawn?1:shot.scale);
}
