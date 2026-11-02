// Position and geometry are independent of combat effects and resource costs.
export const BOARD_SIZE=5;
export const directions=Object.freeze([[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]]);
export const cellKey=p=>`${p.x},${p.y}`;
export const sameCell=(a,b)=>Boolean(a&&b&&a.x===b.x&&a.y===b.y);
export const onBoard=p=>Boolean(p&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=0&&p.x<BOARD_SIZE&&p.y>=0&&p.y<BOARD_SIZE);
// Rotate a cell through the board center so the opponent mirrors the full formation.
export const mirrorCell=p=>onBoard(p)?{x:BOARD_SIZE-1-p.x,y:BOARD_SIZE-1-p.y}:null;
export const mirrorDirection=d=>Array.isArray(d)&&d.length===2?[-d[0],-d[1]]:null;
export const distance=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
export const cellLabel=p=>onBoard(p)?`${'ABCDE'[p.x]}${p.y+1}`:'—';
export const boardCells=()=>Array.from({length:25},(_,i)=>({x:i%5,y:Math.floor(i/5)}));
export function occupied(s,point,except){return [...s.allies,...s.enemies].find(u=>u.hp>0&&u.id!==except&&sameCell(s.tactical.positions[u.id],point));}
export const obstacle=(s,p)=>s.tactical.obstacles.some(b=>sameCell(b,p));
export function canStep(s,actorId,from,to,{through=false}={}){
 if(!onBoard(from)||!onBoard(to)||distance(from,to)!==1||obstacle(s,to))return false;
 if(!through&&occupied(s,to,actorId))return false;
 if(from.x!==to.x&&from.y!==to.y){const a={x:to.x,y:from.y},b={x:from.x,y:to.y};if((obstacle(s,a)||(!through&&occupied(s,a,actorId)))&&(obstacle(s,b)||(!through&&occupied(s,b,actorId))))return false;}
 return true;
}
export function findPath(s,actorId,to,maxSteps=2){
 const start=s.tactical.positions[actorId];if(!onBoard(to)||!start||sameCell(start,to))return null;
 const pending=[{at:start,path:[]}],visited=new Set([cellKey(start)]);
 while(pending.length){const current=pending.shift();if(current.path.length>=maxSteps)continue;
  for(const [dx,dy]of directions){const next={x:current.at.x+dx,y:current.at.y+dy};if(visited.has(cellKey(next))||!canStep(s,actorId,current.at,next))continue;
   const path=[...current.path,next];if(sameCell(next,to))return path;visited.add(cellKey(next));pending.push({at:next,path});
  }
 }return null;
}
export function lineOfSight(s,a,b){
 // Supercover: a ray may not squeeze through a blocked diagonal corner.
 let x=a.x,y=a.y;const nx=Math.abs(b.x-a.x),ny=Math.abs(b.y-a.y),sx=Math.sign(b.x-a.x),sy=Math.sign(b.y-a.y);let ix=0,iy=0;
 while(ix<nx||iy<ny){const decision=(1+2*ix)*ny-(1+2*iy)*nx;if(decision===0){if(obstacle(s,{x:x+sx,y})&&obstacle(s,{x,y:y+sy}))return false;x+=sx;y+=sy;ix++;iy++;}else if(decision<0){x+=sx;ix++;}else{y+=sy;iy++;}if(obstacle(s,{x,y}))return false;}
 return true;
}
export function patternCells(kind,origin,anchor,direction=[1,0],length=2){
 if(!onBoard(origin)||!onBoard(anchor))return [];
 let points=[];
 if(kind==='self')points=[origin];
 else if(kind==='cross')points=[[0,0],[1,0],[-1,0],[0,1],[0,-1]].map(([x,y])=>({x:anchor.x+x,y:anchor.y+y}));
 else if(kind==='x')points=[[0,0],[1,1],[-1,1],[1,-1],[-1,-1]].map(([x,y])=>({x:anchor.x+x,y:anchor.y+y}));
 else if(kind==='square')points=Array.from({length:9},(_,i)=>({x:anchor.x+i%3-1,y:anchor.y+Math.floor(i/3)-1}));
 else if(kind==='line')points=Array.from({length},(_,i)=>({x:origin.x+direction[0]*(i+1),y:origin.y+direction[1]*(i+1)}));
 else points=[anchor];
 return points.filter(onBoard);
}
