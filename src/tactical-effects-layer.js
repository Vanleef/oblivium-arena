import {boardTracks} from './tactical-board.js';
import {tacticalDamagedTargets} from './tactical-animation.js';

const palettes={
 inferno:['#fff2b2','#ff6840','#751f36'],
 paraiso:['#fff9da','#ffd37e','#9a6e61'],
 limbo:['#f4eaff','#bf8dff','#5731a0'],
 support:['#efffdb','#72e8a5','#28746b'],
 guard:['#f0faff','#8dd9ff','#3552a4']
};
const material={
 'o-acougueiro':'inferno','a-viuva-escarlate':'inferno','o-escudo-vivo':'guard',
 'o-passo-interrompido':'limbo','o-odio-encarnado':'inferno','a-arquiteta-verde':'support'
};
const shields=new Set(['guard','counter','support']);
const control=new Set(['bind','affliction']);
const TAU=Math.PI*2;
export const tacticalParticleBudget=36;

export function tacticalImpactContacts(event){
 const damaged=new Set(tacticalDamagedTargets(event));
 const affected=new Set([...(event.affectedTargetIds||[]),...(event.type==='guard'?[event.actorId]:[])]);
 const pointKeys=new Set((event.cells||[]).map(p=>p.x+','+p.y));
 return [...(event.before?.allies||[]),...(event.before?.enemies||[])].flatMap(unit=>{
  if(!damaged.has(unit.id)&&!affected.has(unit.id))return [];
  const point=event.before?.positions?.[unit.id];
  return point&&pointKeys.has(point.x+','+point.y)?[{point,heavy:damaged.has(unit.id)}]:[];
 }).sort((a,b)=>Number(b.heavy)-Number(a.heavy)).slice(0,6);
}

export function tacticalEffectResolution(width,height,dpr=1){
 const ratio=Math.min(dpr,1.5,Math.sqrt(900000/(width*height)));
 return {width:Math.max(1,Math.floor(width*ratio)),height:Math.max(1,Math.floor(height*ratio))};
}

function palette(actor,family){
 const world=actor?.realm==='Inferno'?'inferno':actor?.realm==='Paraíso'?'paraiso':'limbo';
 return palettes[family==='support'?'support':shields.has(family)?'guard':material[actor?.sourceId||actor?.id]||world];
}

export class TacticalEffectsLayer {
 constructor(canvas){
  this.canvas=canvas;
  this.ctx=canvas.getContext('2d');
  this.effects=[];
  this.frame=0;
  this.tick=this.tick.bind(this);
 }

 attach(board){
  if(!board||!this.ctx)return false;
  if(this.canvas.parentElement!==board){
   board.append(this.canvas);
   this.width=board.clientWidth;
   this.height=board.clientHeight;
   const pixels=tacticalEffectResolution(this.width,this.height,globalThis.devicePixelRatio||1);
   this.canvas.width=pixels.width;
   this.canvas.height=pixels.height;
   this.ctx.setTransform(pixels.width/(this.width||1),0,0,pixels.height/(this.height||1),0,0);
  }
  return this.width>0&&this.height>0;
 }

 emit(board,event,actor,phase,duration,{reduced=false,projectile=false}={}){
  if(!this.attach(board)||event.skipped)return;
  const tracks=boardTracks({tactical:event.before});
  const worldPoint=(point,fraction=.67)=>{
   if(!point)return null;
   const col=tracks.columns.indexOf(point.x),row=tracks.rows.indexOf(point.y);
   if(col<0||row<0)return null;
   return {x:(col+.5)*this.width/tracks.columns.length,y:(row+fraction)*this.height/tracks.rows.length};
  };
  const from=worldPoint(event.before.positions[event.actorId]),to=worldPoint(event.anchor);
  const now=performance.now(),color=palette(actor,event.family),radius=Math.max(9,Math.min(34,this.height/tracks.rows.length*.44));
  const push=(kind,point,extra={})=>{
   if(point)this.effects.push({kind,point,from,to,color,radius,family:event.family,now,duration,reduced,...extra});
  };
  if(phase==='prepare')push('charge',from);
  if(phase==='release'&&!projectile&&!reduced)push('swing',from);
  if(phase==='travel'&&from&&to)push('travel',from,{projectile});
  if(phase==='impact'){
   const contacts=tacticalImpactContacts(event);
   const particles=reduced||!contacts.length?0:Math.min(10,Math.floor(tacticalParticleBudget/contacts.length));
   for(const contact of contacts)push('impact',worldPoint(contact.point,.54),{heavy:contact.heavy,particles});
   if(!contacts.length)push('miss',to||from);
  }
  if(this.effects.length&&!this.frame){
   this.canvas.dataset.active='true';
   this.frame=requestAnimationFrame(this.tick);
  }
 }

 tick(time){
  const ctx=this.ctx;
  ctx.clearRect(0,0,this.width,this.height);
  this.effects=this.effects.filter(f=>time-f.now<f.duration);
  for(const fx of this.effects)drawEffect(ctx,fx,Math.max(0,(time-fx.now)/fx.duration));
  this.frame=this.effects.length?requestAnimationFrame(this.tick):0;
  if(!this.frame)this.canvas.dataset.active='false';
 }

 clear(){
  if(this.frame)cancelAnimationFrame(this.frame);
  this.frame=0;
  this.effects.length=0;
  this.ctx?.clearRect(0,0,this.width||0,this.height||0);
  this.canvas.dataset.active='false';
 }
}

function ring(ctx,x,y,r,color,alpha,width=1){
 ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;
 ctx.beginPath();ctx.ellipse(x,y,r,r*.43,0,0,TAU);ctx.stroke();
}
function drawEffect(ctx,fx,t){
 const {point:{x,y},radius:r,color:[light,mid,dark],kind,reduced,family}=fx;
 const p=reduced ? .38 : t,fade=1-p;
 const angle=fx.from&&fx.to?Math.atan2(fx.to.y-fx.from.y,fx.to.x-fx.from.x):0;
 ctx.save();
 if(kind==='charge'){
  ring(ctx,x,y,r*(1-p*.44),mid,Math.sin(p*Math.PI)*.7,2);
  ring(ctx,x,y,r*.65,light,p*.56);
 }else if(kind==='travel'){
  const {from,to}=fx,dx=to.x-from.x,dy=to.y-from.y;
  const head=1-(1-p)**1.45,tail=Math.max(0,head-(fx.projectile==='thread'?.36:.22));
  ctx.lineCap='round';
  for(const [width,color] of [[r*.30,dark],[r*.15,mid],[2,light]]){
   ctx.lineWidth=width;ctx.strokeStyle=color;ctx.globalAlpha=.9;
   ctx.beginPath();ctx.moveTo(from.x+dx*tail,from.y+dy*tail);
   ctx.lineTo(from.x+dx*head,from.y+dy*head);ctx.stroke();
  }
  ctx.translate(from.x+dx*head,from.y+dy*head);ctx.rotate(angle);
  ctx.fillStyle=light;ctx.beginPath();
  if(fx.projectile==='glass'||fx.projectile==='shard'){
   ctx.moveTo(r*.32,0);ctx.lineTo(-r*.18,-r*.12);ctx.lineTo(-r*.09,r*.11);ctx.closePath();
  }else ctx.ellipse(0,0,Math.max(2,r*.21),Math.max(1,r*.09),0,0,TAU);
  ctx.fill();
 }else if(kind==='miss'){
  ring(ctx,x,y,r*(.45+p*.53),mid,fade*.55,1.5);
 }else if(kind==='swing'){
  if(!shields.has(family)){
   ctx.translate(x,y-r*.6);ctx.rotate(angle+(p-.5)*1.3);
   ctx.globalAlpha=Math.sin(p*Math.PI)*.86;
   ctx.strokeStyle=mid;ctx.lineWidth=r*.19;ctx.lineCap='round';
   ctx.beginPath();ctx.ellipse(0,0,r*1.15,r*.72,0,-1.02,1.02);ctx.stroke();
   ctx.strokeStyle=light;ctx.lineWidth=2;ctx.stroke();
  }
 }else{
  ring(ctx,x,y,r*(.49+p*1.22),mid,fade*.84,fx.heavy?2.5:1.5);
  ctx.translate(x,y-r*.40);
  if(!shields.has(family)&&!control.has(family))ctx.rotate(angle);
  ctx.globalAlpha=fade*.87;
  ctx.fillStyle=mid;
  ctx.beginPath();
  if(shields.has(family)){
   for(let i=0;i<6;i++){const a=i*TAU/6;ctx.lineTo(Math.sin(a)*r*.63,Math.cos(a)*r*.84);}
   ctx.closePath();ctx.strokeStyle=light;ctx.lineWidth=2;ctx.stroke();
  }else if(control.has(family)){
   for(let i=0;i<4;i++){
    const left=(i-1.5)*r*.37;
    ctx.moveTo(left-r*.20,r*.33);ctx.lineTo(left+r*.10,-r*(.55+(i%2)*.3)*fade);ctx.lineTo(left+r*.22,r*.33);
   }
   ctx.fill();
  }else{
   ctx.moveTo(-r*.92,0);ctx.lineTo(r*.28,-r*.30*fade);ctx.lineTo(r*1.34,0);ctx.lineTo(r*.28,r*.30*fade);ctx.closePath();ctx.fill();
   ctx.fillStyle=light;ctx.beginPath();ctx.moveTo(-r*.6,0);ctx.lineTo(r*.38,-r*.085*fade);ctx.lineTo(r*1.1,0);ctx.lineTo(r*.38,r*.085*fade);ctx.fill();
  }
  ctx.strokeStyle=light;ctx.lineWidth=1.5;ctx.globalAlpha=fade*.8;
  ctx.beginPath();
  for(let i=0;i<fx.particles;i++){
   const a=i*2.39996,reach=r*(.48+(i%3)*.20)*p;
   const dx=Math.cos(a),dy=Math.sin(a);
   ctx.moveTo(dx*reach,dy*reach);
   ctx.lineTo(dx*(reach+r*.18*fade),dy*(reach+r*.18*fade));
  }
  ctx.stroke();
 }
 ctx.restore();
}
