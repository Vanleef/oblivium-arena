// Identity-specific, procedural choreography for the illustrated compact arena.
// These are physical contact motifs, not additional buffs, damage or combat rules.
// Every result depends only on an executed technique and the visible actor identity.
export const tacticalCharacterMotifs=Object.freeze({
 'o-acougueiro':'cleaver',       // Heavy blade, tearing contact
 'a-viuva-escarlate':'crimson',  // Blood cloth/cords closing over the victim
 'o-escudo-vivo':'bastion',      // Interlocking shield slabs
 'o-passo-interrompido':'stutter',// Misaligned successive positions
 'o-odio-encarnado':'rage',      // Crushing fist and cinders
 'a-arquiteta-verde':'architect',// Load-bearing roots and living arch
 'nilo':'memory'                // Memory knots on taut ritual thread
});
const slotWeight=Object.freeze({impulso:.85,tecnica:1,voto:1.15,despertar:1.3});
export function tacticalCharacterChoreography(actor,event){
 if(!actor||event?.type!=='skill'||event.skipped)return null;
 const kind=tacticalCharacterMotifs[actor.sourceId||actor.id];
 const id=String(event.abilityId||'');
 // Form-specific technique IDs keep the material language of their source slot.
 const key=id.split('/')[0],slot=key.startsWith('tecnica-')?'tecnica':key;
 if(!kind||!Object.hasOwn(slotWeight,slot))return null;
 // Upgraded forms alter the silhouette's weight, not game outcomes.
 const altered=[event.formKey,event.bodyForm,actor.bodyForm].some(key=>key&&key!=='base');
 const form=altered ? 0.1 : 0;
 return {kind,slot,weight:slotWeight[slot]+form,form:form>0?'alternate':'base'};
}

/**
 * Draw one authored silhouette per combatant, using the actual executed
 * technique slot to modulate scale. Canvas coordinates are already centered
 * on the struck target by TacticalEffectsLayer. Returns false for generic
 * healing/protection that should retain the familiar visual language.
 */
export function drawTacticalCharacterImpact(ctx,fx,progress){
 const motion=fx.choreography;
 if(!motion)return false;
 const {kind,weight}=motion,reaction=fx.reaction;
 if(reaction==='heal'||((reaction==='shield'||reaction==='block')&&kind!=='bastion'&&kind!=='architect'))return false;
 const p=Math.max(0,Math.min(1,progress)),fade=1-p;
 const r=fx.radius*Math.min(1.5,weight),[light,mid,dark]=fx.color;
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 if(kind==='cleaver'){
  // The cleaver has mass: a broad edge cuts through, followed by torn fragments.
  ctx.strokeStyle=dark;ctx.lineWidth=r*.32;ctx.beginPath();
  ctx.moveTo(-r*1.1,-r*.84);ctx.quadraticCurveTo(-r*.3,-r*.25,r*1.05,r*.32);ctx.stroke();
  ctx.strokeStyle=light;ctx.lineWidth=r*.07;ctx.beginPath();
  ctx.moveTo(-r*1.08,-r*.95);ctx.quadraticCurveTo(-r*.3,-r*.35,r*1.08,r*.22);ctx.stroke();
  ctx.fillStyle=mid;ctx.beginPath();
  for(let i=0;i<4;i++){
   const x=r*(i*.37-.65),y=r*(.12+.11*(i%2));
   ctx.moveTo(x,y);ctx.lineTo(x-r*.08,y+r*(.19+.16*fade));
   ctx.lineTo(x+r*.14,y+r*.11);ctx.closePath();
  }
  ctx.fill();
 }else if(kind==='crimson'){
  // Weighted blood ribbons encircle the target instead of emitting light beams.
  for(let i=0;i<3;i++){
   const y=r*(i-1)*.34,width=r*(.83-.12*i);
   ctx.beginPath();ctx.moveTo(-width,y+r*.2);
   ctx.bezierCurveTo(-r*.26,y-r*.73*fade,r*.56,y+r*.5,width,y-r*.13);
   ctx.strokeStyle=i===1?light:mid;ctx.lineWidth=r*(i===1?.09:.16);ctx.stroke();
  }
  ctx.fillStyle=dark;ctx.beginPath();
  ctx.moveTo(-r*.33,r*.45);ctx.lineTo(-r*.12,r*.76*fade);ctx.lineTo(r*.02,r*.43);
  ctx.moveTo(r*.36,r*.25);ctx.lineTo(r*.18,r*.65*fade);ctx.lineTo(r*.49,r*.3);ctx.fill();
 }else if(kind==='bastion'){
  // Three overlapping shield plates slam into a protecting/intercepted target.
  for(let i=-1;i<=1;i++){
   const x=i*r*.43* (1+.24*fade),y=Math.abs(i)*r*.14-r*.18*fade;
   ctx.beginPath();ctx.moveTo(x-r*.22,y-r*.60);ctx.lineTo(x+r*.22,y-r*.60);
   ctx.lineTo(x+r*.24,y+r*.19);ctx.lineTo(x,y+r*.49);ctx.lineTo(x-r*.24,y+r*.19);ctx.closePath();
   ctx.fillStyle=i===0?mid:dark;ctx.fill();
   ctx.strokeStyle=light;ctx.lineWidth=r*.055;ctx.stroke();
  }
 }else if(kind==='stutter'){
  // Discontinuous silhouettes: successive, offset fragments of one physical hit.
  for(let i=-1;i<=1;i++){
   const x=i*r*.35+(i%2)*r*.08*fade;
   ctx.globalAlpha=.22+.23*(2-Math.abs(i))*fade;
   ctx.beginPath();ctx.moveTo(x-r*.18,-r*.62);
   ctx.lineTo(x+r*.15,-r*.74);ctx.lineTo(x+r*.27,-r*.18);
   ctx.lineTo(x+r*.11,r*.57);ctx.lineTo(x-r*.19,r*.42);ctx.closePath();
   ctx.fillStyle=i===0?light:mid;ctx.fill();
  }
  ctx.globalAlpha=fade;ctx.strokeStyle=dark;ctx.lineWidth=r*.12;ctx.beginPath();
  ctx.moveTo(-r*.88,-r*.29);ctx.lineTo(-r*.35,-r*.29);
  ctx.moveTo(r*.35,r*.31);ctx.lineTo(r*.91,r*.31);ctx.stroke();
 }else if(kind==='rage'){
  // A clenched fist crushes the floor at contact; broken stone radiates outward.
  ctx.fillStyle=mid;ctx.beginPath();ctx.moveTo(-r*.48,r*.25);
  ctx.lineTo(-r*.53,-r*.23);ctx.lineTo(-r*.31,-r*.44);
  ctx.lineTo(r*.43,-r*.46);ctx.lineTo(r*.56,-r*.16);
  ctx.lineTo(r*.43,r*.25);ctx.lineTo(r*.20,r*.46);ctx.closePath();ctx.fill();
  ctx.strokeStyle=dark;ctx.lineWidth=r*.075;ctx.beginPath();
  for(let i=-1;i<=2;i++){const x=i*r*.22;ctx.moveTo(x,-r*.41);ctx.lineTo(x+r*.04,-r*.07);}
  ctx.stroke();ctx.strokeStyle=light;ctx.lineWidth=r*.075;ctx.beginPath();
  for(let i=-2;i<=2;i++){
   const x=i*r*.36;
   ctx.moveTo(x,r*.44);ctx.lineTo(x+r*.16,r*(.81+.15*fade));
  }
  ctx.stroke();
 }else if(kind==='architect'){
  // Living supports rise from the ground and meet in a load-bearing arch.
  ctx.strokeStyle=dark;ctx.lineWidth=r*.19;ctx.beginPath();
  ctx.moveTo(-r*.93,r*.80);ctx.bezierCurveTo(-r*.65,-r*.50*fade,r*.14,-r*1.06*fade,r*.79,r*.26);
  ctx.moveTo(r*.91,r*.80);ctx.bezierCurveTo(r*.47,-r*.48*fade,-r*.26,-r*.64*fade,-r*.72,r*.19);
  ctx.stroke();ctx.strokeStyle=mid;ctx.lineWidth=r*.09;ctx.beginPath();
  for(let i=-1;i<=1;i++){
   const x=i*r*.50;
   ctx.moveTo(x,r*.78);ctx.quadraticCurveTo(x+r*.21,r*.02,x+r*.11,-r*.68*fade);
   ctx.moveTo(x+r*.09,r*.1);ctx.lineTo(x+r*.26,-r*.1*fade);
  }
  ctx.stroke();ctx.fillStyle=light;ctx.beginPath();
  ctx.ellipse(-r*.45,-r*.25*fade,r*.14,r*.07,-.5,0,Math.PI*2);
  ctx.ellipse(r*.38,-r*.14*fade,r*.16,r*.08,.5,0,Math.PI*2);ctx.fill();
 }else if(kind==='memory'){
  // One knotted physical thread winds around the contact point.
  ctx.strokeStyle=mid;ctx.lineWidth=r*.13;ctx.beginPath();
  ctx.moveTo(-r*.9,r*.6);ctx.bezierCurveTo(-r*.8,-r*.6*fade,r*.8,-r*.6*fade,r*.9,r*.52);
  ctx.bezierCurveTo(r*.18,r*.9*fade,-r*.2,-r*.8*fade,-r*.45,r*.01);ctx.stroke();
  ctx.strokeStyle=light;ctx.lineWidth=r*.065;ctx.beginPath();
  ctx.ellipse(0,0,r*.22,r*.18,.35,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle=dark;ctx.beginPath();ctx.ellipse(0,0,r*.09,r*.08,0,0,Math.PI*2);ctx.fill();
 }else{ctx.restore();return false;}
 // Distinct material choreography for all four slots, not merely larger sparks.
 // The seven base motifs combine with these four silhouettes for 28 readings.
 ctx.globalAlpha=fade*.82;
 ctx.strokeStyle=light;ctx.fillStyle=mid;
 if(motion.slot==='impulso'){
  // A short leading thrust/advance, with debris physically flung forward.
  ctx.beginPath();ctx.lineWidth=r*.085;
  for(let i=-1;i<=1;i++){
   const yy=i*r*.24;ctx.moveTo(-r*.66,yy+r*.14);
   ctx.lineTo(r*(.52+.27*fade),yy-r*.20);
  }
  ctx.stroke();
 }else if(motion.slot==='tecnica'){
  // A grounded hooking path communicates a controlled single technique.
  ctx.beginPath();ctx.lineWidth=r*.14;
  ctx.moveTo(-r*.55,-r*.24);
  ctx.quadraticCurveTo(-r*.19,-r*.83*fade,r*.53,-r*.32);
  ctx.quadraticCurveTo(r*.82,r*.05,r*.41,r*.42);
  ctx.stroke();
 }else if(motion.slot==='voto'){
  // Two converging physical strokes close in on the target.
  ctx.beginPath();ctx.lineWidth=r*.13;
  ctx.moveTo(-r*.77,-r*.72*fade);ctx.lineTo(r*.72,r*.58*fade);
  ctx.moveTo(r*.71,-r*.68*fade);ctx.lineTo(-r*.68,r*.62*fade);
  ctx.stroke();
 }else if(motion.slot==='despertar'){
  // Six discrete cracking plates, not an expanding light laser.
  for(let i=0;i<6;i++){
   const angle=i*Math.PI/3;
   ctx.save();ctx.rotate(angle);
   ctx.beginPath();ctx.moveTo(r*.48,-r*.12);
   ctx.lineTo(r*(.95+.24*fade),-r*.21);
   ctx.lineTo(r*(.84+.2*fade),r*.14);
   ctx.lineTo(r*.48,r*.12);ctx.closePath();ctx.fill();
   ctx.restore();
  }
 }
 ctx.restore();return true;
}
