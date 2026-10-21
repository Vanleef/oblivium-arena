const tones={impact:'#f39b78',restore:'#9ce0b0',shield:'#a3daf4',control:'#c6abed'};
export function effectTone(change,kind='control') {
  if(change.hp<0)return tones.impact;
  if(change.hp>0)return tones.restore;
  if(change.shield>0||change.statuses?.includes('INVULNERÁVEL'))return tones.shield;
  return tones[kind]||tones.control;
}
export function portraitAnchor(board,portrait) {
  return {x:Math.max(0,Math.min(board.width,portrait.left-board.left+portrait.width/2)),y:Math.max(0,Math.min(board.height,portrait.top-board.top+portrait.height/2))};
}
export function traceGeometry(from,to) {
  const distance=Math.hypot(to.x-from.x,to.y-from.y);
  if(distance<3)return null;
  return `M${from.x.toFixed(1)} ${from.y.toFixed(1)} Q${((from.x+to.x)/2).toFixed(1)} ${(Math.min(from.y,to.y)-Math.min(42,distance*.1)).toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
}
// Measure the rendered portraits so effects follow the actual responsive layout.
// The overlay is decorative; the combat controller owns timing and input locks.
export function renderBattleMotion(app,fx) {
  if(!fx||fx.skipped||fx.mode==='turn')return;
  if(typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
  const board=app.querySelector('.arena-match');if(!board)return;
  const rect=board.getBoundingClientRect();if(!rect.width||!rect.height)return;
  const anchors=new Map([...board.querySelectorAll('[data-target]')].map(node=>{
    const portrait=node.querySelector('.fighter-backdrop');return [node.dataset.target,portrait?portraitAnchor(rect,portrait.getBoundingClientRect()):null];
  }));
  const origin=anchors.get(fx.actorId),parts=(fx.changes||[]).flatMap((change,index)=>{
    const target=anchors.get(change.id);if(!target)return [];
    const reaction=fx.reactions?.find(r=>r.targetId===change.id),source=reaction?anchors.get(reaction.actorId):origin;
    const color=effectTone(change,fx.kind),path=source?traceGeometry(source,target):null;
    return [`<g class="ability-hit" style="--effect-color:${color};--motion-delay:${Math.min(index*60,180)}ms">${path?`<path class="ability-trace-soft" d="${path}" pathLength="100"/><path class="ability-trace-core" d="${path}" pathLength="100"/>`:''}<circle class="ability-impact-ring" cx="${target.x}" cy="${target.y}" r="37"/><circle class="ability-impact-core" cx="${target.x}" cy="${target.y}" r="21"/></g>`];
  });
  if(parts.length)board.insertAdjacentHTML('beforeend',`<svg class="ability-traces" viewBox="0 0 ${rect.width} ${rect.height}" aria-hidden="true" focusable="false">${parts.join('')}</svg>`);
}
