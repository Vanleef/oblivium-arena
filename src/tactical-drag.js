// Pointer events support mouse, pen and touch. Horizontal gestures can still scroll the hand.
export function installTacticalDrag(root,{onDrop,onDragEnd}){
 let drag=null,ghost=null,hover=null;
 const clear=()=>{ghost?.remove();hover?.classList.remove('drop-hover');root.classList?.remove('card-dragging');ghost=null;hover=null;drag=null;};
 root.addEventListener('pointerdown',event=>{
  if(event.button!==0||event.target.closest('[data-slot-remove],[data-slot-swap]'))return;
  const node=event.target.closest('[data-hand-actor][data-mode],.card-socket.filled');
  if(!node||node.disabled)return;
  drag={node,x:event.clientX,y:event.clientY,pointer:event.pointerId,source:{...node.dataset},active:false};
  node.setPointerCapture?.(event.pointerId);
 });
 document.addEventListener('pointermove',event=>{
  if(!drag||drag.pointer!==event.pointerId)return;
  if(!drag.active&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<9)return;
  if(!drag.active){drag.active=true;ghost=drag.node.cloneNode(true);ghost.removeAttribute('id');ghost.classList.add('drag-card-ghost');ghost.setAttribute('aria-hidden','true');document.body.append(ghost);root.classList?.add('card-dragging');}
  event.preventDefault();ghost.style.left=event.clientX+'px';ghost.style.top=event.clientY+'px';
  const next=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-card-slot]');
  if(next!==hover){hover?.classList.remove('drop-hover');hover=next;hover?.classList.add('drop-hover');}
 },{passive:false});
 document.addEventListener('pointerup',event=>{
  if(!drag||drag.pointer!==event.pointerId)return;
  const active=drag.active,source=drag.source,target=document.elementFromPoint?.(event.clientX,event.clientY)?.closest('[data-card-slot]');
  clear();if(active){event.preventDefault();onDragEnd();if(target&&!target.disabled)onDrop(source,{...target.dataset});}
 });
 document.addEventListener('pointercancel',clear);
 document.addEventListener('keydown',event=>{if(event.key==='Escape')clear();});
}
