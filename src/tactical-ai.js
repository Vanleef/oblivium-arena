import {conquestTechnique} from './conquest-techniques.js';
import {conquestAugmentedAbility} from './conquest-augments.js';
import {tacticalEnvironmentDelta} from './tactical-environment.js';
import {tacticalView,previewTacticalPlan,previewTacticalActivation,tacticalActivationUnits} from './tactical-combat.js';
import {boardCells,findPath,distance} from './tactical-board.js';
import {tacticalSpec} from './tactical-kits.js';

function score(s,side){
 const own=side==='player'?s.allies:s.enemies,opposition=side==='player'?s.enemies:s.allies;
 const alive=opposition.filter(u=>u.hp>0);let value=0;
 for(const u of own){
  value+=u.hp*1.4+u.shield*.28+(u.hp>0?70:0)+u.charge*1.5+(u.counter?5:0);
  if(u.hp>0)value+=(u.ashExpansionTurns?5:0)+(u.collapseLevel||0)*5+(u.graceFormTurns?5:0)+(u.resonanceTargetId&&u.resonanceTurns?4:0);
  if(u.hp>0&&alive.length){const p=s.tactical.positions[u.id],nearest=Math.min(...alive.map(e=>distance(p,s.tactical.positions[e.id])));value-=nearest*5;value+=(2-Math.abs(p.y-2))*.4;if(u.invulnerable&&nearest<=3)value+=8;}
 }
 for(const u of opposition){value-=u.hp*1.6+(u.hp>0?80:0)+u.shield*.25;if(u.stunned)value+=10;if(u.weakened)value+=3;value+=Object.values(u.marks).filter(m=>own.some(a=>a.id===m.sourceId)).length*2;value+=u.dots.reduce((n,d)=>n+d.damage*d.turns*.6,0);}
 for(const u of [...own,...opposition]){const delta=tacticalEnvironmentDelta(s,u);value+=(u.side===side?1:-1)*(delta.hp*1.5+delta.shield*.28);}
 if(s.tactical.compact){
  const goal=s.tactical.objectives?.[side]?.position,living=own.filter(u=>u.hp>0&&!u.stunned);
  if(goal&&living.length)value-=Math.min(...living.map(u=>distance(s.tactical.positions[u.id],goal,s)))*5;
  value+=(s.tactical.objectiveClaims?.[side]||0)*25;
 }
 return value;
}
function candidates(s,side,used,actorId){
 const own=side==='player'?s.allies:s.enemies,other=side==='player'?s.enemies:s.allies,result=[];
 for(const u of own.filter(u=>u.hp>0&&!u.stunned&&(used[u.id]||0)<2&&(!actorId||u.id===actorId))){
  // Compact plans can defend; activation mode already supplies its own Guard candidate.
  if(s.tactical.compact&&!actorId)result.push({type:'guard',actorId:u.id});
  if(!actorId)for(const to of boardCells()){const path=findPath(s,u.id,to);if(path)result.push({type:'move',actorId:u.id,path});}
  for(const a of u.abilities){
   if(u.cooldowns[a.id])continue;const spec=tacticalSpec(u,a),origin=s.tactical.positions[u.id];
   const anchors=spec.range===0?[origin]:['ally','friendly','team'].includes(a.target)?own.filter(t=>t.hp>0).map(t=>s.tactical.positions[t.id]):other.filter(t=>t.hp>0).map(t=>s.tactical.positions[t.id]);
   const spends=[{}];
   if(a.spendResidueMax&&u.residue)spends.push({residueSpend:Math.min(a.spendResidueMax,u.residue)});
   if(a.spendFracturesMax)spends.push({fractureSpend:a.spendFracturesMax});
   for(const anchor of anchors){const orientation=[Math.sign(anchor.x-origin.x)||(anchor.y===origin.y?(side==='player'?1:-1):0),Math.sign(anchor.y-origin.y)];for(const spend of spends)result.push({...spend,type:'skill',actorId:u.id,abilityId:a.id,formKey:a.formKey||'base',anchor:{...anchor},orientation});}
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
   const v=score(p.projection,side)-(p.payment.costs.essence||0)*.12-Object.values(p.payment.costs).reduce((n,x)=>n+x,0)*.15;
   if(v>value+.05&&(!best||v>best.value))best={actions:next,preview:p,value:v};
  }
  if(!best)break;({actions,preview,value}=best);
 }
 return actions;
}


export function planTacticalAIActivation(s,side='enemy'){
 const view=tacticalView(s,side);let best=null;
 for(const unit of tacticalActivationUnits(view,side)){
  if(view.tactical.fortress){
   const edge=side==='player'?8:0,start=view.tactical.positions[unit.id];
   const {entered,rearmed}=view.tactical.fortress;
   const eligible=!entered.includes(unit.id)||rearmed.includes(unit.id);
   const objective=eligible?edge:8-edge,goal=view.tactical.objectives?.[side]?.position;
   for(const to of boardCells(view)){
    const path=findPath(view,unit.id,to);if(!path)continue;
    for(const base of unit.abilities){
     const ability=conquestAugmentedAbility(view,unit,conquestTechnique(base));
     const actions=[{type:'move',actorId:unit.id,path,abilityId:ability.id}],preview=previewTacticalActivation(view,side,unit.id,actions);
     if(!preview.ok)continue;
     const objectiveValue=goal?(distance(start,goal,view)-distance(to,goal,view))*8+(distance(to,goal,view)===0?30:0):0;
     const value=objectiveValue+(Math.abs(start.x-objective)-Math.abs(to.x-objective))*5+(to.x===objective?18:0)
       +(preview.aim?.targets?.length||0)*((ability.damage||0)*.5+(ability.stun?11:0)+(ability.heal?4:0))
       +(!unit.cooldowns[ability.id]?1:0)-Math.abs(to.y-start.y)*.2;
     if(!best||value>best.value)best={actorId:unit.id,actions,value};
    }
   }
   continue;
  }
  const moves=[[],...boardCells().map(to=>findPath(view,unit.id,to)).filter(Boolean).map(path=>[{type:'move',actorId:unit.id,path}])];
  for(const move of moves){
   const projected=move.length?previewTacticalActivation(view,side,unit.id,move).projection:view;
   if(!projected)continue;
   const path=move[0]?.path||[],sprint=path.length===2;
   const orders=sprint?[move]:[{type:'guard',actorId:unit.id},...candidates(projected,side,{},unit.id)].map(action=>[...move,action]);
   for(const refs of orders){
    const preview=previewTacticalActivation(view,side,unit.id,refs);
    if(!preview.ok)continue;
    const collects=view.tactical.chests.some(chest=>path.some(point=>distance(point,chest.position)===0));
    const value=score(preview.projection,side)+(collects?24:0)-Object.values(preview.payment.costs).reduce((sum,n)=>sum+n,0)*.2;
    if(!best||value>best.value)best={actorId:unit.id,actions:refs,value};
   }
  }
 }
 return best;
}
