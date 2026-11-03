import {tacticalSpriteAtlases} from './tactical-sprites.js';
import {tacticalIdleCrops} from './tactical-idle-crops.js';
import {IDLE_FRAME_COUNT,IDLE_COLUMNS,IDLE_ROWS,IDLE_CELL,idleMesh,idleRigProfile,idleFrameCell} from './tactical-idle-rig.js';

const cache=new Map();let bakeQueue=Promise.resolve();
const pause=()=>new Promise(resolve=>globalThis.requestAnimationFrame?globalThis.requestAnimationFrame(resolve):setTimeout(resolve,0));
function imageFrom(src){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Atlas indisponível: '+src));image.src=src;});}
function triangle(ctx,image,src,dst,ox,oy){
 const [s0,s1,s2]=src,[d0,d1,d2]=dst;
 const det=(s1.x-s0.x)*(s2.y-s0.y)-(s2.x-s0.x)*(s1.y-s0.y);
 const a=((d1.x-d0.x)*(s2.y-s0.y)-(d2.x-d0.x)*(s1.y-s0.y))/det;
 const c=((d2.x-d0.x)*(s1.x-s0.x)-(d1.x-d0.x)*(s2.x-s0.x))/det;
 const b=((d1.y-d0.y)*(s2.y-s0.y)-(d2.y-d0.y)*(s1.y-s0.y))/det;
 const d=((d2.y-d0.y)*(s1.x-s0.x)-(d1.y-d0.y)*(s2.x-s0.x))/det;
 const e=d0.x-a*s0.x-c*s0.y,f=d0.y-b*s0.x-d*s0.y;
 const cx=(d0.x+d1.x+d2.x)/3,cy=(d0.y+d1.y+d2.y)/3;
 ctx.save();ctx.beginPath();
 for(const [i,p]of dst.entries()){const length=Math.hypot(p.x-cx,p.y-cy)||1,x=ox+p.x+(p.x-cx)/length*.18,y=oy+p.y+(p.y-cy)/length*.18;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
 ctx.closePath();ctx.clip();ctx.transform(a,b,c,d,e+ox,f+oy);ctx.drawImage(image,0,0);ctx.restore();
}
async function bake(id,image){
 const crop=tacticalIdleCrops[id]?.[0];if(!crop)return null;
 const pose=document.createElement('canvas');pose.width=pose.height=IDLE_CELL;
 const context=pose.getContext('2d');const w=image.naturalWidth,h=image.naturalHeight,cw=w/6,ch=h/6,pad=4,usable=IDLE_CELL-pad*2;
 const [t,r,b,l]=crop.clip,sx=l*w/100,sy=t*h/100,sw=w*(100-l-r)/100,sh=h*(100-t-b)/100;
 const bounds={x:pad+(sx/cw+crop.left/100)*usable,y:pad+(sy/ch+crop.top/100)*usable,width:sw/cw*usable,height:sh/ch*usable};
 context.drawImage(image,sx,sy,sw,sh,bounds.x,bounds.y,bounds.width,bounds.height);
 const sheet=document.createElement('canvas');sheet.width=IDLE_CELL*IDLE_COLUMNS;sheet.height=IDLE_CELL*IDLE_ROWS;const ctx=sheet.getContext('2d'),profile=idleRigProfile(id);
 for(let i=0;i<IDLE_FRAME_COUNT;i++){
  const mesh=idleMesh(bounds,i/IDLE_FRAME_COUNT*Math.PI*2,profile),cell=idleFrameCell(i);
  ctx.save();ctx.beginPath();ctx.rect(cell.column*IDLE_CELL,cell.row*IDLE_CELL,IDLE_CELL,IDLE_CELL);ctx.clip();
  for(const indices of mesh.triangles)triangle(ctx,pose,indices.map(j=>mesh.source[j]),indices.map(j=>mesh.target[j]),cell.column*IDLE_CELL,cell.row*IDLE_CELL);
  ctx.restore();if(i%4===3)await pause();
 }
 const blob=await new Promise(resolve=>sheet.toBlob(resolve,'image/webp',.97));if(!blob)throw Error('Falha ao compor quadros de idle.');
 const url=URL.createObjectURL(blob);await imageFrom(url);return {url,frames:IDLE_FRAME_COUNT};
}
function requestSheet(id){
 if(cache.has(id))return cache.get(id);
 const source=imageFrom(tacticalSpriteAtlases[id].src);
 source.catch(()=>{});
 const result=bakeQueue.then(async()=>bake(id,await source));
 bakeQueue=result.catch(()=>{});cache.set(id,result);
 return result;
}
// Cache is shared by successive renders. Only visible idle tokens receive the new sheet.
export function installContinuousIdle(root,units){
 if(!root.querySelectorAll||!globalThis.document?.createElement||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
 const byId=new Map(units.map(unit=>[unit.id,unit]));
 for(const token of root.querySelectorAll('.token[data-family="idle"][data-sprite="true"]')){
  const unit=byId.get(token.dataset.unitId),id=unit?.sourceId||unit?.id;
  if(!tacticalSpriteAtlases[id]||!tacticalIdleCrops[id])continue;
  requestSheet(id).then(result=>{
   if(!result||!token.isConnected||token.dataset.family!=='idle')return;
   const image=token.querySelector('.sprite-sheet');if(!image)return;
   image.src=result.url;image.style.width=IDLE_COLUMNS*100+'%';image.style.height=IDLE_ROWS*100+'%';image.style.setProperty('clip-path','none','important');
   image.dataset.rigAtlas='true';token.dataset.idleRig='true';token.dataset.idleFrames=String(result.frames);
  }).catch(error=>{token.dataset.idleRig='unavailable';console.warn(error.message);});
 }
}
