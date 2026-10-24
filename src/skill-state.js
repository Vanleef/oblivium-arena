// Runtime forms belong to one combatant. Slot ids and cooldowns remain stable.
export function initializeSkillForms(unit){
 unit.baseArt=unit.art?{...unit.art}:null;
 unit.skillBook=unit.abilities.map(a=>({...a}));unit.skillForms={};unit.skillUses={};
 unit.abilities=unit.skillBook.map(a=>({...a,_formRoot:a,formKey:'base'}));
}
function restoreSlot(u,slot){
 const previous=u.skillForms[slot];delete u.skillForms[slot];
 if(previous?.returnCooldown){u.cooldowns[slot]=Math.max(u.cooldowns[slot]||0,previous.returnCooldown);u.cooldownFresh.push(slot);}
}
export function refreshSkillForms(s){
 const units=[...s.allies,...s.enemies],livingIds=new Set(units.filter(u=>u.hp>0).map(u=>u.id));
 for(const u of units){
  u.formRound=s.round;
  if(!u.skillBook)continue;
  u.abilities=u.abilities.map(current=>{
   const root=current._formRoot;if(!root?.forms?.length)return current;
   let state=u.skillForms[root.id];
   if(state&&((state.expiresAt!=null&&s.round>state.expiresAt)||(state.targetId&&!livingIds.has(state.targetId)))){restoreSlot(u,root.id);state=null;}
   if(state){const form=root.forms.find(a=>a.formKey===state.form);if(form?.requiresLink){const target=units.find(v=>v.id===state.targetId);if(u.stunned||target?.invulnerable||!target?.marks[form.requiredMark]||target.marks[form.requiredMark].sourceId!==u.id){restoreSlot(u,root.id);state=null;}}}
   const rule=root.formRule,automatic=rule&&(rule.type==='charge'?u.charge>=rule.at:rule.type==='health'?u.hp<=rule.at:false);
   const key=root.maxUses&&(u.skillUses[root.id]||0)>=root.maxUses?root.depletedForm:state?.form||(automatic?rule.form:'base');
   const form=key==='base'?root:root.forms.find(a=>a.formKey===key)||root;
   return {...form,id:root.id,forms:root.forms,_formRoot:root,formKey:key,originName:root.name,formTargetId:state?.targetId,formExpiresAt:state?.expiresAt,usesLeft:root.maxUses?Math.max(0,root.maxUses-(u.skillUses[root.id]||0)):null};
  });
  const body=u.bodyForms?.find(f=>Object.entries(f.when).every(([slot,key])=>u.abilities.some(a=>a.id===slot&&a.formKey===key)));
  u.bodyForm=body?.key||'base';u.bodyFormName=body?.name||u.baseFormName||'Forma original';
  if(u.bodyForms?.length)u.art={...u.baseArt,portrait:body?.portrait||u.baseArt?.portrait};
 }
}
export function applySkillShifts(s,actor,changes,targetId,condition){
 for(const change of changes||[]){
  if(change.slot==='despertar')continue;
  const target=[...s.allies,...s.enemies].find(u=>u.id===targetId);
  if(change.condition&&!condition(target,change.condition,actor))continue;
  if(change.form==='base')restoreSlot(actor,change.slot);
  else actor.skillForms[change.slot]={form:change.form,expiresAt:change.turns?s.round+change.turns:null,...(change.bindTarget?{targetId}: {})};
 }
}
export function formSummary(u){return u.abilities.map(a=>`${a.id}:${a.formKey||'base'}`);}
export function scaleSkillForms(ability,scale){return {...scale(ability),...(ability.forms?{forms:ability.forms.map(a=>scaleSkillForms(a,scale))}:{})};}

