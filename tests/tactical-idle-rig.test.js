import test from 'node:test';
import assert from 'node:assert/strict';
import {tacticalSpriteAtlases} from '../src/tactical-sprites.js';
import {IDLE_FRAME_COUNT,IDLE_COLUMNS,IDLE_ROWS,IDLE_CELL,idleRigProfile,deformIdlePoint,idleMesh,idleFrameCell} from '../src/tactical-idle-rig.js';
const bounds={x:15,y:10,width:130,height:146};
const area=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
test('os 48 quadros ocupam células distintas e retornam ao começo sem quadro duplicado',()=>{
 assert.equal(IDLE_FRAME_COUNT,48);assert.equal(IDLE_COLUMNS*IDLE_ROWS,48);
 assert.equal(new Set(Array.from({length:48},(_,i)=>JSON.stringify(idleFrameCell(i)))).size,48);
 assert.deepEqual(idleFrameCell(48),idleFrameCell(0));assert.deepEqual(idleFrameCell(-1),idleFrameCell(47));
});
test('apoio dos pés é imóvel e o ciclo fecha para todos os 25 modelos existentes',()=>{
 for(const id of Object.keys(tacticalSpriteAtlases)){
  const profile=idleRigProfile(id);
  for(let frame=0;frame<48;frame++)for(const x of [20,80,140]){
   const p={x,y:bounds.y+bounds.height*.94};assert.deepEqual(deformIdlePoint(p,frame/48*Math.PI*2,profile,bounds),p);
  }
  for(const point of [{x:30,y:30},{x:100,y:55},{x:20,y:110}]){
   const a=deformIdlePoint(point,0,profile,bounds),b=deformIdlePoint(point,Math.PI*2,profile,bounds);
   assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<1e-10,id);
  }
 }
});
test('quadros vizinhos mantêm deslocamento subpixel e triângulos não invertem o corpo',()=>{
 for(const id of Object.keys(tacticalSpriteAtlases)){
  const profile=idleRigProfile(id);let previous=idleMesh(bounds,0,profile);
  for(let frame=1;frame<=48;frame++){
   const mesh=idleMesh(bounds,frame/48*Math.PI*2,profile);
   for(let i=0;i<mesh.target.length;i++)assert.ok(Math.hypot(mesh.target[i].x-previous.target[i].x,mesh.target[i].y-previous.target[i].y)<.5,id+' salta entre quadros');
   for(const tri of mesh.triangles){const src=tri.map(i=>mesh.source[i]),dst=tri.map(i=>mesh.target[i]);assert.ok(area(...src)*area(...dst)>0,id+' inverte articulação');}
   previous=mesh;
  }
 }
 assert.equal(IDLE_CELL,160);
});
