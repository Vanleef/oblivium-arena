// Compact spatial layer: shared by PvE, ranked duels, bot planning and the browser.
// All coordinates are canonical (player on the left). PvP projections mirror for enemy owners.
export const GRID_WIDTH=5;
export const GRID_HEIGHT=5;
export const gridDistance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
export const insideGrid=({x,y})=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<GRID_WIDTH&&y<GRID_HEIGHT;
export const mirrorCell=cell=>({x:GRID_WIDTH-1-cell.x,y:cell.y});
export function setupGrid(battle){
 battle.grid={width:GRID_WIDTH,height:GRID_HEIGHT};
 battle.movementPlans={player:[],enemy:[]};
 for(const [side,units,x] of [["player",battle.allies,0],["enemy",battle.enemies,GRID_WIDTH-1]]){
  units.forEach((u,index)=>{u.position={x,y:Math.max(0,Math.min(GRID_HEIGHT-1,index+1))};});
 }
 return battle.grid;
}
export function plannedPosition(battle,unit){
 if(!unit?.position)return null;
 return battle.movementPlans?.[unit.side]?.find(m=>m.actorId===unit.id)?.to||unit.position;
}
export function movementChoices(battle,actor){
 if(!battle.grid||!actor?.position||actor.hp<=0||actor.stunned)return [];
 const planned=battle.movementPlans?.[actor.side]||[];
 const cells=[{x:actor.position.x+1,y:actor.position.y},{x:actor.position.x-1,y:actor.position.y},{x:actor.position.x,y:actor.position.y+1},{x:actor.position.x,y:actor.position.y-1}];
 const occupied=new Set([...battle.allies,...battle.enemies].filter(u=>u.hp>0&&u.id!==actor.id&&u.position).map(u=>u.position.x+":"+u.position.y));
 const reserved=new Set(planned.filter(move=>move.actorId!==actor.id).map(move=>move.to.x+":"+move.to.y));
 return cells.filter(cell=>insideGrid(cell)&&!occupied.has(cell.x+":"+cell.y)&&!reserved.has(cell.x+":"+cell.y));
}
export function validateMovementPlans(battle,side,moves=[]){
 if(!battle.grid)return [];
 if(!Array.isArray(moves)||moves.length>3)throw new Error("Movimentos inválidos.");
 const used=new Set(),normalized=[];
 const original=battle.movementPlans?.[side]||[];
 // Do not let previously drafted moves make submission order change validation.
 const copy={...battle,movementPlans:{...battle.movementPlans,[side]:[]}};
 for(const m of moves){
  const actor=(side==="player"?battle.allies:battle.enemies).find(u=>u.id===m?.actorId);
  const destination={x:m?.to?.x,y:m?.to?.y};
  if(!actor||used.has(actor.id)||!movementChoices(copy,actor).some(c=>c.x===destination.x&&c.y===destination.y))throw new Error("Destino de movimento inválido.");
  used.add(actor.id);
  normalized.push({actorId:actor.id,side,to:destination});
  copy.movementPlans[side]=normalized;
 }
 return normalized;
}
export function setMovementPlan(battle,side,actorId,to){
 if(!battle.grid)return {ok:false,reason:"Tabuleiro indisponível."};
 const existing=battle.movementPlans?.[side]||[];
 const next=existing.filter(m=>m.actorId!==actorId);
 try{
  const result=validateMovementPlans(battle,side,[...next,{actorId,to}]);
  battle.movementPlans[side]=result;return {ok:true,moves:result};
 }catch(e){return {ok:false,reason:e.message};}
}
export function removeMovementPlan(battle,side,actorId){
 if(!battle.movementPlans)return;
 battle.movementPlans[side]=battle.movementPlans[side].filter(m=>m.actorId!==actorId);
}
export function isTargetInRange(battle,actor,target,ability,{preview=true}={}){
 if(!battle.grid||!actor?.position||!target?.position)return true;
 if(ability?.target==="team"||ability?.target==="self")return true;
 // Preview the acting soul only. The defender’s unrevealed move is never used for targeting validation.
 const source=preview?plannedPosition(battle,actor):actor.position,aim=target.position;
 const range=ability?.id==="__basic_attack__"?1:Math.max(1,Math.min(4,Number(ability?.range)||3));
 return gridDistance(source,aim)<=range;
}
export function resolveGridMoves(battle,moves=[]){
 if(!battle.grid)return [];
 const proposals=moves.filter(m=>insideGrid(m.to)).filter(m=>{
  const actor=[...battle.allies,...battle.enemies].find(u=>u.id===m.actorId);
  return actor?.hp>0&&!actor.stunned&&gridDistance(actor.position,m.to)===1;
 });
 const counts=new Map();
 for(const m of proposals){const k=m.to.x+":"+m.to.y;counts.set(k,(counts.get(k)||0)+1);}
 const occupied=new Set([...battle.allies,...battle.enemies].filter(u=>u.hp>0).map(u=>u.position.x+":"+u.position.y));
 const accepted=proposals.filter(m=>counts.get(m.to.x+":"+m.to.y)===1&&!occupied.has(m.to.x+":"+m.to.y));
 // Resolve atomically: two teams trying the same tile both remain in place.
 const changes=[];
 for(const m of accepted){
  const actor=[...battle.allies,...battle.enemies].find(u=>u.id===m.actorId);
  const from={...actor.position};actor.position={...m.to};
  changes.push({actorId:actor.id,actorName:actor.name,side:actor.side,from,to:{...m.to}});
 }
 if(battle.movementPlans)battle.movementPlans={player:[],enemy:[]};
 return changes;
}
export function greedyMovement(battle,side){
 if(!battle.grid)return [];
 const ours=(side==="player"?battle.allies:battle.enemies).filter(u=>u.hp>0);
 const theirs=(side==="player"?battle.enemies:battle.allies).filter(u=>u.hp>0);
 const moves=[],objective=battle.gridObjectives?.find(objective=>objective.side===side);
 const preview={...battle,movementPlans:{...battle.movementPlans,[side]:[]}};
 for(const actor of ours){
  const score=p=>objective?gridDistance(p,objective):Math.min(...theirs.map(target=>gridDistance(p,target.position)));
  const candidate=movementChoices(preview,actor).sort((a,b)=>score(a)-score(b)||a.y-b.y||a.x-b.x)[0];
  if(!candidate||score(candidate)>=score(actor.position))continue;
  moves.push({actorId:actor.id,side,to:candidate});
  preview.movementPlans[side]=moves;
 }
 return moves;
}
