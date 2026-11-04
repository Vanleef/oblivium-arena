// Position and geometry are independent of combat effects and resource costs.
export const BOARD_SIZE=5;
export const boardWidth=s=>s?.tactical?.width??BOARD_SIZE;
export const boardHeight=s=>s?.tactical?.height??BOARD_SIZE;
export function boardTracks(s){
 const layout=s?.tactical?.fortress;
 return {columns:Array.from({length:boardWidth(s)},(_,i)=>i).filter(i=>!layout?.closedColumns?.includes(i)),
  rows:Array.from({length:boardHeight(s)},(_,i)=>i).filter(i=>!layout?.closedRows?.includes(i))};
}
export function boardMetricPoint(s,p){
 const {columns,rows}=boardTracks(s);
 return {x:columns.indexOf(p.x),y:rows.indexOf(p.y)};
}
export const directions=Object.freeze([[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]]);
export const cellKey=p=>`${p.x},${p.y}`;
export const sameCell=(a,b)=>Boolean(a&&b&&a.x===b.x&&a.y===b.y);
export const onBoard=(p,s)=>Boolean(p&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=0&&p.x<boardWidth(s)&&p.y>=0&&p.y<boardHeight(s)&&!s?.tactical?.fortress?.closedColumns?.includes(p.x)&&!s?.tactical?.fortress?.closedRows?.includes(p.y));
// Rotate a cell through the board center so the opponent mirrors the full formation.
export const mirrorCell=(p,s)=>onBoard(p,s)?{x:boardWidth(s)-1-p.x,y:boardHeight(s)-1-p.y}:null;
export const mirrorDirection=d=>Array.isArray(d)&&d.length===2?[-d[0],-d[1]]:null;
export function distance(a,b,s){
 if(s?.tactical?.fortress){a=boardMetricPoint(s,a);b=boardMetricPoint(s,b);}
 return Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
}
export const cellLabel=p=>onBoard(p,{tactical:{width:9,height:6}})?`${'ABCDEFGHI'[p.x]}${p.y+1}`:'—';
export const boardCells=s=>{const {columns,rows}=boardTracks(s);return rows.flatMap(y=>columns.map(x=>({x,y})));};
export function occupied(s,point,except){return [...s.allies,...s.enemies].find(u=>u.hp>0&&u.id!==except&&sameCell(s.tactical.positions[u.id],point));}
export const obstacle=(s,p)=>s.tactical.obstacles.some(b=>sameCell(b,p));
export function canStep(s,actorId,from,to,{through=false,movement=false}={}){
 if(!onBoard(from,s)||!onBoard(to,s)||obstacle(s,to))return false;
 const aMetric=s.tactical.fortress?boardMetricPoint(s,from):from,bMetric=s.tactical.fortress?boardMetricPoint(s,to):to;
 const dx=Math.abs(bMetric.x-aMetric.x),dy=Math.abs(bMetric.y-aMetric.y);
 if(Math.max(dx,dy)!==1)return Boolean(movement&&s.tactical.fortress?.leaps.includes(actorId)&&dx*dy===2&&!occupied(s,to,actorId));
 if(!through&&occupied(s,to,actorId))return false;
 if(from.x!==to.x&&from.y!==to.y){const a={x:to.x,y:from.y},b={x:from.x,y:to.y};if((obstacle(s,a)||(!through&&occupied(s,a,actorId)))&&(obstacle(s,b)||(!through&&occupied(s,b,actorId))))return false;}
 return true;
}
export function movementRange(s,actorId){
 if(s.tactical.fortress)return 1;
 if(s.tactical.activation)return 2;
 const unit=[...s.allies,...s.enemies].find(u=>u.id===actorId);
 const extra=(s.tactical.augments?.[unit?.side]||[]).filter(a=>a.type==='movement-range'&&(!a.expiresAt||a.expiresAt>=s.round)).reduce((n,a)=>Math.max(n,Math.max(0,Math.floor(a.amount||0))),0);
 return 1+Math.min(2,extra);
}
export function findPath(s,actorId,to,maxSteps=movementRange(s,actorId)){
 const start=s.tactical.positions[actorId];if(!onBoard(to,s)||!start||sameCell(start,to))return null;
 if(s.tactical.fortress)return maxSteps>0&&canStep(s,actorId,start,to,{movement:true})?[to]:null;
 const steps=directions;
 const pending=[{at:start,path:[]}],visited=new Set([cellKey(start)]);
 while(pending.length){const current=pending.shift();if(current.path.length>=maxSteps)continue;
  for(const [dx,dy]of steps){const next={x:current.at.x+dx,y:current.at.y+dy};if(visited.has(cellKey(next))||!canStep(s,actorId,current.at,next,{movement:true}))continue;
   const path=[...current.path,next];if(sameCell(next,to))return path;visited.add(cellKey(next));pending.push({at:next,path});
  }
 }return null;
}
export function lineOfSight(s,a,b){
 if(s.tactical.fortress){
  const projected={tactical:{obstacles:s.tactical.obstacles.filter(p=>onBoard(p,s)).map(p=>boardMetricPoint(s,p))}};
  return lineOfSight(projected,boardMetricPoint(s,a),boardMetricPoint(s,b));
 }
 // Supercover: a ray may not squeeze through a blocked diagonal corner.
 let x=a.x,y=a.y;const nx=Math.abs(b.x-a.x),ny=Math.abs(b.y-a.y),sx=Math.sign(b.x-a.x),sy=Math.sign(b.y-a.y);let ix=0,iy=0;
 while(ix<nx||iy<ny){const decision=(1+2*ix)*ny-(1+2*iy)*nx;if(decision===0){if(obstacle(s,{x:x+sx,y})&&obstacle(s,{x,y:y+sy}))return false;x+=sx;y+=sy;ix++;iy++;}else if(decision<0){x+=sx;ix++;}else{y+=sy;iy++;}if(obstacle(s,{x,y}))return false;}
 return true;
}
export function patternCells(kind,origin,anchor,direction=[1,0],length=2,s){
 if(!onBoard(origin,s)||!onBoard(anchor,s))return [];
 if(s?.tactical?.fortress){
  const {columns,rows}=boardTracks(s),grid={tactical:{width:columns.length,height:rows.length}};
  return patternCells(kind,boardMetricPoint(s,origin),boardMetricPoint(s,anchor),direction,length,grid).map(p=>({x:columns[p.x],y:rows[p.y]}));
 }
 let points=[];
 if(kind==='self')points=[origin];
 else if(kind==='cross')points=[[0,0],[1,0],[-1,0],[0,1],[0,-1]].map(([x,y])=>({x:anchor.x+x,y:anchor.y+y}));
 else if(kind==='x')points=[[0,0],[1,1],[-1,1],[1,-1],[-1,-1]].map(([x,y])=>({x:anchor.x+x,y:anchor.y+y}));
 else if(kind==='square')points=Array.from({length:9},(_,i)=>({x:anchor.x+i%3-1,y:anchor.y+Math.floor(i/3)-1}));
 else if(kind==='ring')points=directions.map(([x,y])=>({x:origin.x+x,y:origin.y+y}));
 else if(kind==='cone'){
  const [dx,dy]=direction;
  points=boardCells(s).filter(p=>{const x=p.x-origin.x,y=p.y-origin.y,forward=x*dx+y*dy;return distance(origin,p)>0&&distance(origin,p)<=length&&forward>0&&Math.abs(x*dy-y*dx)<=forward;});
 }
 else if(kind==='line')points=Array.from({length},(_,i)=>({x:origin.x+direction[0]*(i+1),y:origin.y+direction[1]*(i+1)}));
 else points=[anchor];
 return [...new Map(points.filter(point=>onBoard(point,s)).map(p=>[cellKey(p),p])).values()];
}
