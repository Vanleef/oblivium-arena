export const IDLE_FRAME_COUNT=48;
export const IDLE_COLUMNS=8;
export const IDLE_ROWS=6;
export const IDLE_CELL=160;
const clamp=n=>Math.max(0,Math.min(1,n));
const smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
export function idleRigProfile(id){
 const heavy=['o-acougueiro','o-odio-encarnado','o-soberano-quebrado','o-colecionador-de-cabecas'].includes(id);
 const cloth=['a-viuva-escarlate','a-mae-rubra','naomi','o-tecelao-de-mentiras','o-sussurro','a-regente-de-cinzas','vaas'].includes(id);
 const rigid=['o-escudo-vivo','a-juiza-de-ferro','o-carrasco-sem-rosto'].includes(id);
 return {breath:heavy?1.5:1.05,cloth:cloth?2.15:rigid?.55:1.1,hair:cloth?1.3:.55};
}
// One stable drawing is skinned to this mesh. Feet and the lowest leg vertices are fixed.
export function deformIdlePoint(point,phase,profile,bounds){
 const u=(point.x-bounds.x)/bounds.width,v=(point.y-bounds.y)/bounds.height;
 const planted=1-smooth((v-.76)/.14);
 if(planted===0)return {...point};
 const inhale=(1-Math.cos(phase))*.5,breath=profile.breath*inhale;
 const chest=Math.exp(-Math.pow((v-.34)/.24,2));
 const head=1-smooth((v-.18)/.12);
 const edge=Math.pow(Math.min(1,Math.abs(u-.5)*2),2);
 const cloth=smooth((v-.30)/.20)*(1-smooth((v-.77)/.13))*edge;
 const hair=(1-smooth((v-.55)/.20))*smooth((.5-u)/.35);
 const ripple=Math.sin(phase-v*1.3)-Math.sin(-v*1.3);
 const hairWave=Math.sin(phase-.65)-Math.sin(-.65);
 return {x:point.x+planted*((u-.5)*breath*chest*.75+cloth*profile.cloth*ripple*.5+hair*profile.hair*hairWave*.35),
  y:point.y-planted*(breath*(chest*.65+head*.35))};
}
export function idleMesh(bounds,phase,profile,columns=8,rows=12){
 const source=[],target=[];
 for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++){
  const point={x:x*IDLE_CELL/columns,y:y*IDLE_CELL/rows};source.push(point);target.push(deformIdlePoint(point,phase,profile,bounds));
 }
 const triangles=[];
 for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){const a=y*(columns+1)+x,b=a+1,c=a+columns+1,d=c+1;triangles.push([a,b,c],[b,d,c]);}
 return {source,target,triangles};
}
export function idleFrameCell(index){const frame=((index%IDLE_FRAME_COUNT)+IDLE_FRAME_COUNT)%IDLE_FRAME_COUNT;return {column:frame%IDLE_COLUMNS,row:Math.floor(frame/IDLE_COLUMNS)};}
