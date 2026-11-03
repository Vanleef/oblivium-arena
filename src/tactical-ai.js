import {tacticalEnvironmentDelta} from './tactical-environment.js';
import {tacticalView,previewTacticalPlan,tacticalUnits} from './tactical-combat.js';
import {boardCells,findPath,distance} from './tactical-board.js';
import {tacticalSpec} from './tactical-kits.js';

function score(s,side){
 const own=side==='player'?s.allies:s.enemies,opposition=side==='player'?s.enemies:s.allies;
 const alive=opposition.filter(u=>u.hp>0);let value=0;
 for(const u of own){
  value+=u.hp*1.4+u.shield*.28+(u.hp>0?70:0)+u.charge*1.5+(u.counter?5:0);
  if(u.hp>0&&alive.length){const p=s.tactical.positions[u.id],nearest=Math.min(...alive.map(e=>distance(p,s.tactical.positions[e.id])));value-=nearest*5;value+=(2-Math.abs(p.y-2))*.4;if(u.invulnerable&&nearest<=3)value+=8;}
 }
 for(const u of opposition){value-=u.hp*1.6+(u.hp>0?80:0)+u.shield*.25;if(u.stunned)value+=10;if(u.weakened)value+=3;value+=Object.values(u.marks).filter(m=>own.some(a=>a.id===m.sourceId)).length*2;value+=u.dots.reduce((n,d)=>n+d.damage*d.turns*.6,0);}
 for(const u of [...own,...opposition]){const delta=tacticalEnvironmentDelta(s,u);value+=(u.side===side?1:-1)*(delta.hp*1.5+delta.shield*.28);}
 return value;
}
function candidates(s,side,used){
 const own=side==='player'?s.allies:s.enemies,other=side==='player'?s.enemies:s.allies,result=[];
 for(const u of own.filter(u=>u.hp>0&&!u.stunned&&(used[u.id]||0)<2)){
  for(const to of boardCells()){const path=findPath(s,u.id,to);if(path)result.push({type:'move',actorId:u.id,path});}
  for(const a of u.abilities){
   if(u.cooldowns[a.id])continue;const spec=tacticalSpec(u,a),origin=s.tactical.positions[u.id];
   const anchors=spec.range===0?[origin]:['ally','friendly','team'].includes(a.target)?own.filter(t=>t.hp>0).map(t=>s.tactical.positions[t.id]):other.filter(t=>t.hp>0).map(t=>s.tactical.positions[t.id]);
   for(const anchor of anchors){const orientation=[Math.sign(anchor.x-origin.x)||(anchor.y===origin.y?(side==='player'?1:-1):0),Math.sign(anchor.y-origin.y)];result.push({type:'skill',actorId:u.id,abilityId:a.id,formKey:a.formKey||'base',anchor:{...anchor},orientation});}
  }
 }return result;
}
// The planner receives a public snapshot, never the sealed plans or future RNG state.
export function planTacticalAI(publicState,side='enemy'){
 const view=tacticalView(publicState,side);let actions=[],preview=previewTacticalPlan(view,side,actions),value=score(preview.projection,side);
 for(let depth=0;depth<6;depth++){
  const used=actions.reduce((out,a)=>(out[a.actorId]=(out[a.actorId]||0)+1,out),{});let best=null;
  for(const ref of candidates(preview.projection,side,used)){
   const next=[...actions,ref],p=previewTacticalPlan(view,side,next);if(!p.ok)continue;
   const v=score(p.projection,side)-p.payment.costs.essence*.12-Object.values(p.payment.costs).reduce((n,x)=>n+x,0)*.15;
   if(v>value+.05&&(!best||v>best.value))best={actions:next,preview:p,value:v};
  }
  if(!best)break;({actions,preview,value}=best);
 }
 return actions;
}
