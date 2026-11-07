// Replay-only cinematic physics; does not change turn resolution or hidden plans.
// The motor has already resolved the hit before these values are calculated.
const melee=new Set(['strike','slash','pierce','counter']);
const superAbilities=new Set(['voto','despertar']);
const bounded=(n,min,max)=>Math.min(max,Math.max(min,Number.isFinite(n)?n:min));
const living=state=>[...(state?.allies||[]),...(state?.enemies||[])];

export function tacticalImpactProfile(event,{speed=1,reduced=false}={}){
 if(!event||event.skipped||!['impact','counter'].includes(event.pose))return null;
 if(!['skill','guard'].includes(event.type))return null;
 const family=event.family||'strike',attack=melee.has(family);
 const before=new Map(living(event.before).map(u=>[u.id,u]));
 const affected=new Set([...(event.affectedTargetIds||[]),...(event.targets||[])]);
 const victims=living(event.after).filter(u=>affected.has(u.id));
 const loss=victims.map(unit=>{
  const old=before.get(unit.id);
  if(!old)return 0;
  return Math.max(0,(old.hp||0)-(unit.hp||0))
   +Math.max(0,(old.shield||0)-(unit.shield||0));
 });
 const damage=Math.max(0,...loss);
 const finishing=victims.some(unit=>before.get(unit.id)?.hp>0&&unit.hp<=0);
 const transformed=living(event.after).some(unit=>{
  const old=before.get(unit.id);
  return old&&(old.bodyForm||'base')!==(unit.bodyForm||'base');
 });
 const special=superAbilities.has(event.abilityId)||finishing||transformed;
 const base={strike:46,slash:40,pierce:33,counter:48}[family]||26;
 const severity=Math.min(24,Math.floor(damage/6));
 const hold=base+severity+(special?32:0);
 const rate=bounded(speed,1,3);
 return Object.freeze({
  family,melee:attack,special,finishing,damage,
  // 1–2 frames on routine attacks, slightly more for consequential super hits.
  hitstopMs:reduced?0:Math.round(hold/rate),
  recoilPx:attack?bounded(5+damage/9,5,13):bounded(damage/12,0,5),
  shake:reduced?'none':finishing?'heavy':special?'special':attack?'physical':'soft'
 });
}
export function tacticalMobileParticleBudget(width,{reduced=false}={}){
 if(reduced)return 0;
 const size=Number.isFinite(width)?Math.max(0,width):0;
 if(size<250)return 10;
 if(size<400)return 14;
 if(size<620)return 22;
 return 36;
}
export function tacticalContactRecoil(contact,profile,{mobile=false}={}){
 if(!contact||!profile)return null;
 const magnitude=profile.recoilPx*(mobile?.65:1);
 const x=bounded((contact.x||0)*magnitude,-13,13);
 const y=bounded((contact.y||0)*magnitude*.7,-10,10);
 return {
  x:Math.round(x*10)/10,
  y:Math.round(y*10)/10,
  family:profile.family,
  reaction:contact.reaction
 };
}
