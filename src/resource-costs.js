// Coringa is a flexible cost selected from the four actual Essência pools.
export const resourceIds=['essence','cinza','graca','ruptura'];
export function getAbilityResourceCosts(actor,ability){
 const out=Object.entries(ability.costs||(ability.cost?{essence:ability.cost}:{})).reduce((result,[id,n])=>{
  const raw=id==='affinity'?(actor.bodyForms?.find(f=>ability.formKey&&f.when[ability.id]===ability.formKey)?.resource||actor.bodyResource||actor.affinity):id;const key=raw==='coringa'?'random':raw;
  if(key&&n>0)result[key]=(result[key]||0)+n;return result;
 },{});
 const discount=actor.passive?.costDiscount;
 if(discount&&actor.bodyForm===discount.form&&ability.formKey&&ability.formKey!=='base'){
  const key=discount.resource==='affinity'?(actor.bodyResource||actor.affinity):discount.resource==='coringa'?'random':discount.resource;
  if(key==='random'||resourceIds.includes(key))out[key]=Math.max(0,(out[key]||0)-Math.max(0,Math.floor(discount.amount||1)));
 }
 return out;
}
const total=p=>resourceIds.reduce((n,id)=>n+(p[id]||0),0);
export function suggestRandomPayment(available,required){
 const left={...available},selected=Object.fromEntries(resourceIds.map(id=>[id,0]));
 for(let i=0;i<required;i++){
  const id=[...resourceIds].sort((a,b)=>(left[b]||0)-(left[a]||0))[0];
  if(!(left[id]>0))return null;left[id]--;selected[id]++;
 }
 return selected;
}
export function suggestEssenceExchangePayment(pool){return suggestRandomPayment(pool,5);}
export function resolveEssenceExchange(pool,target,selected){
 if(!resourceIds.includes(target))return {ok:false,reason:'Tipo de Essência inválido.'};
 const payment=resolveResourcePayment({random:5},pool,selected);
 if(!payment.ok)return {...payment,reason:payment.reason||'São necessárias 5 Essências para a troca.'};
 const next=Object.fromEntries(resourceIds.map(id=>[id,(pool[id]||0)-(payment.selected[id]||0)]));
 next[target]++;
 return {ok:true,target,selected:payment.selected,pool:next,totalBefore:total(pool),totalAfter:total(next)};
}
export function resolveResourcePayment(costs,pool,selected){
 costs={...costs,random:(costs.random??0)+(costs.coringa??0)};delete costs.coringa;
 const fixed=Object.fromEntries(resourceIds.map(id=>[id,costs[id]||0]));
 const available=Object.fromEntries(resourceIds.map(id=>[id,(pool[id]||0)-fixed[id]]));
 const required=costs.random||0;
 if(Object.values(costs).some(n=>!Number.isSafeInteger(n)||n<0)||Object.keys(costs).some(id=>!resourceIds.includes(id)&&id!=='random')||Object.values(available).some(n=>n<0)||total(available)<required)return {ok:false,reason:'Essência insuficiente.',fixed,available,required};
 let normalizedSelected=selected;
 if(selected&&typeof selected==='object'&&!Array.isArray(selected)&&Object.prototype.hasOwnProperty.call(selected,'coringa')){
  normalizedSelected={...selected};const legacy=normalizedSelected.coringa;delete normalizedSelected.coringa;
  if(!Number.isSafeInteger(legacy)||legacy<0)normalizedSelected.coringa=legacy;
  else if(legacy>0){
   const remaining=Object.fromEntries(resourceIds.map(id=>[id,Math.max(0,available[id]-(Number(normalizedSelected[id])||0))]));
   const migrated=suggestRandomPayment(remaining,legacy);
   if(migrated)for(const id of resourceIds)normalizedSelected[id]=(normalizedSelected[id]||0)+migrated[id];
   else normalizedSelected.coringa=legacy;
  }
 }
 const suggestion=suggestRandomPayment(available,required),payment=normalizedSelected===undefined||normalizedSelected===null?suggestion:normalizedSelected;
 const invalid=!payment||typeof payment!=='object'||Array.isArray(payment)||Object.keys(payment).some(id=>!resourceIds.includes(id))||resourceIds.some(id=>!Number.isSafeInteger(payment[id]??0)||(payment[id]||0)<0||(payment[id]||0)>available[id]);
 const chosen=invalid?{}:Object.fromEntries(resourceIds.map(id=>[id,payment[id]||0]));
 const missing=required-total(chosen);
 return {ok:!invalid&&missing===0,reason:invalid?'Seleção de tipos de Essência inválida.':missing?'Complete o custo Coringa.':'',fixed,available,required,selected:chosen,suggestion,missing,costs:Object.fromEntries(resourceIds.map(id=>[id,fixed[id]+(chosen[id]||0)]))};
}
export function allocateQueuePayment(actions,units,pool,selected){
 const specs=actions.map(action=>{
  const actor=units.find(u=>u.id===action.actorId),ability=actor?.abilities.find(a=>a.id===action.abilityId);
  return actor&&ability?getAbilityResourceCosts(actor,ability):null;
 });
 if(specs.some(s=>!s))return {ok:false,reason:'Técnica indisponível.'};
 const sum=specs.reduce((out,c)=>{for(const [id,n]of Object.entries(c))out[id]=(out[id]||0)+n;return out;},{});
 const result=resolveResourcePayment(sum,pool,selected);if(!result.ok)return result;
 const left={...result.selected};
 const paidActions=actions.map((action,i)=>{
  const randomPayment={};let count=specs[i].random||0;
  for(const id of resourceIds){const n=Math.min(count,left[id]);if(n){randomPayment[id]=n;left[id]-=n;count-=n;}}
  return {...action,randomPayment};
 });
 return {...result,actions:paidActions};
}
