// Shared by AI forecasts, PvE and authoritative duels. World effects never change costs or personal-defense cooldowns.
const fields={damage:'worldDamage',heal:'worldHeal',shieldPower:'worldShieldPower',affliction:'worldAffliction',woundedPower:'worldWoundedPower',markedPower:'worldMarkedPower',afflictedPower:'worldAfflictedPower',executePower:'worldExecutePower',shieldedPower:'worldShieldedPower',controlPower:'worldControlPower',chargePower:'worldChargePower',evolvedPower:'worldEvolvedPower',lastStandPower:'worldLastStandPower',counterPower:'worldCounterPower',firstStrike:'worldFirstStrike',lifesteal:'worldLifesteal',supportShield:'worldSupportShield',supportCharge:'worldSupportCharge',killShield:'worldKillShield',defenseHeal:'worldDefenseHeal',shiftShield:'worldShiftShield'};
export function initializeWorldUnit(u,effect={}){
 for(const [key,field]of Object.entries(fields))if(effect[key])u[field]=(u[field]||0)+effect[key];
 if(effect.armor)u.armor=(u.armor||0)+effect.armor;
 if(effect.regeneration)u.regeneration=(u.regeneration||0)+effect.regeneration;
 if(effect.charge)u.charge=Math.min(3,(u.charge||0)+effect.charge);
}
export function worldDamageBonus(s,actor,a,target,charges=actor.charge||0){
 const own=actor.side==='player'?s.allies:s.enemies;
 const control=a.stun||a.weaken||a.expose||a.sealAttack||a.sealSupport||a.combo?.stun;
 const marked=Object.values(target.marks||{}).some(m=>m.sourceId===actor.id);
 return (actor.worldDamage||0)+(actor.worldFirstStrike||0)
  +(actor.hp<=actor.maxHp*.5?actor.worldWoundedPower||0:0)
  +(target.hp<=target.maxHp*.4?actor.worldExecutePower||0:0)
  +(marked?actor.worldMarkedPower||0:0)
  +(target.dots?.length?actor.worldAfflictedPower||0:0)
  +(actor.shield>0?actor.worldShieldedPower||0:0)
  +(control?actor.worldControlPower||0:0)
  +(a.formKey&&a.formKey!=='base'?actor.worldEvolvedPower||0:0)
  +(own.filter(u=>u.hp>0).length===1?actor.worldLastStandPower||0:0)
  +(actor.worldChargePower||0)*charges;
}
export function worldAfterAction(s,actor,a,{affected,totalDamage,killed,shifted,helpful},ctx){
 if(!affected||actor.hp<=0)return;
 const effects={};
 const gainShield=n=>{if(n){const gained=ctx.shield(actor,n);if(gained)effects.shield=(effects.shield||0)+gained;}};
 if(a.damage){actor.worldFirstStrike=0;if(totalDamage&&actor.worldLifesteal){const restored=ctx.heal(actor,Math.floor(totalDamage*Math.min(.3,actor.worldLifesteal)));if(restored)effects.heal=restored;}}
 if(helpful&&!a.defense){gainShield(actor.worldSupportShield);if(actor.worldSupportCharge){const before=actor.charge;actor.charge=Math.min(3,actor.charge+actor.worldSupportCharge);if(actor.charge>before)effects.charge=actor.charge-before;}}
 if(a.defense&&actor.worldDefenseHeal){const restored=ctx.heal(actor,actor.worldDefenseHeal);if(restored)effects.heal=(effects.heal||0)+restored;}
 if(killed&&!helpful)gainShield(actor.worldKillShield);
 if(shifted)gainShield(actor.worldShiftShield);
 if(Object.keys(effects).length){const label='Eco do mundo dos vivos';ctx.reactions.push({kind:'world',actorId:actor.id,targetId:actor.id,actorName:actor.name,label,...effects});ctx.log(s,`${actor.name} · ${label}: ${[effects.shield&&`+${effects.shield} Defesa`,effects.heal&&`+${effects.heal} Vida`,effects.charge&&`+${effects.charge} carga(s)`].filter(Boolean).join(' · ')}.`);}
}

