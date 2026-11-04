import { eloVisual } from './crests.js';
const tones={impact:'#f39b78',restore:'#9ce0b0',shield:'#a3daf4',control:'#c6abed'};
export function impactMarkup(change,kind,eloId,radius=28) {
  const visual=eloVisual(eloId),size=Math.max(18,Math.min(36,radius));
  const mode=change.hp<0?'strike':change.hp>0?'restore':change.shield>0||change.statuses?.includes('INVULNERÁVEL')?'shield':'control';
  const shapes={
    strike:'<path class="impact-slash" d="M-29 23 22-28M-12 27 29-14"/><path class="impact-paper" d="M-30-7-6-3-2-29 5-7 29-15 9 2 31 12 8 11 2 31-5 12-27 20-13 4Z"/>',
    restore:'<path class="impact-restore" d="M-27 7Q0-24 27 7M-21 19Q0-7 21 19"/><path class="impact-edge" d="M0-30V-20M-5-25H5M-24-10V0M-29-5H-19M24-5V5M19 0H29"/>',
    shield:'<path class="impact-shield" d="M0-31 28-17 23 15 0 32-23 15-28-17ZM0-22 18-12 15 10 0 22-15 10-18-12Z" fill-rule="evenodd"/><path class="impact-edge" d="M-18-12 0-22 18-12M0-22V22"/>',
    control:'<path d="M-30 0-17-18 0-29 19-17 30 0 17 19 0 30-19 17ZM-30 0H-20M20 0H30M0-29V-19M0 20V30"/><path class="impact-echo" d="M-22-22 22 22M-22 22 22-22"/>'
  };
  const sigil=visual?`<g transform="translate(-17 -18) scale(.17)"><path class="elo-impact-mark" fill-rule="evenodd" d="${visual.path}"/></g>`:'';
  return `<g class="anime-impact impact-${mode}" style="--elo-color:${visual?.accent||effectTone(change,kind)}"><g transform="scale(${(size/32).toFixed(2)})">${shapes[mode]}${sigil}</g></g>`;
}
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
  const nodes=[...board.querySelectorAll('[data-target]')];
  const units=new Map(nodes.map(node=>[node.dataset.target,node]));
  const anchors=new Map(nodes.map(node=>{
    const portrait=node.querySelector('.fighter-backdrop');return [node.dataset.target,portrait?portraitAnchor(rect,portrait.getBoundingClientRect()):null];
  }));
  const origin=anchors.get(fx.actorId),parts=(fx.changes||[]).flatMap((change,index)=>{
    const target=anchors.get(change.id);if(!target)return [];
    const reaction=fx.reactions?.find(r=>r.targetId===change.id),source=reaction?anchors.get(reaction.actorId):origin;
    const color=effectTone(change,fx.kind),path=source?traceGeometry(source,target):null;
    const caster=units.get(reaction?.actorId||fx.actorId),portrait=units.get(change.id)?.querySelector('.fighter-backdrop')?.getBoundingClientRect();
    const radius=portrait?Math.min(portrait.width,portrait.height)*.48:28;
    return [`<g class="ability-hit" style="--effect-color:${color};--motion-delay:${Math.min(index*60,180)}ms">${path?`<path class="ability-trace-soft" d="${path}" pathLength="100"/><path class="ability-trace-core" d="${path}" pathLength="100"/>`:''}<g transform="translate(${target.x.toFixed(1)} ${target.y.toFixed(1)})">${impactMarkup(change,fx.kind,caster?.dataset.elo,radius)}</g></g>`];
  });
  if(parts.length)board.insertAdjacentHTML('beforeend',`<svg class="ability-traces" viewBox="0 0 ${rect.width} ${rect.height}" aria-hidden="true" focusable="false">${parts.join('')}</svg>`);
}


