import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {characters} from '../src/data.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const option=(key,fallback)=>{const i=process.argv.indexOf(key);return i>=0?process.argv[i+1]:fallback;};
const inventoryPath=option('--inventory',null);
const inventory=inventoryPath?new Set(JSON.parse(fs.readFileSync(path.resolve(root,inventoryPath),'utf8')).map(row=>typeof row==='string'?row:row.path)):null;
const exists=value=>Boolean(value&&(fs.existsSync(path.join(root,value.replace(/^\//,'')))||inventory?.has(value.replace(/^\//,''))));
const ledgerPath=path.join(root,'docs/ART_REVIEW_LEDGER.json');
const reviewed=new Set(fs.existsSync(ledgerPath)?JSON.parse(fs.readFileSync(ledgerPath,'utf8')).reviewedAssetKeys:[]);
const jobs=[];const entries=[];
for(const c of characters){
 const idCounts=new Map();for(const a of c.abilities)idCounts.set(a.id,(idCounts.get(a.id)||0)+1);
 const slotKey=(a,index)=>idCounts.get(a.id)>1?a.id+'-'+(index+1):a.id;
 const slots=[{slot:'portrait',name:'Retrato',art:c.art?.portrait},{slot:'passive',name:c.passive.name,description:c.passive.description,art:c.passive.art},...c.abilities.map((a,index)=>({slot:slotKey(a,index),abilityId:a.id,abilityIndex:index,name:a.name,description:a.description,target:a.target,art:a.art}))];
 const list=[];
 const add=(kind,key,details)=>{
  const found=exists(details.art),approved=reviewed.has(key);
  const status=approved&&found?'reviewed':!found?'pending_generation':details.sharedWithBase?'pending_dedicated_art':'pending_visual_review';
  const row={key,characterId:c.id,kind,...details,exists:found,status};
  list.push(row);jobs.push(row);
 };
 for(const s of slots)add('base',c.id+':base:'+s.slot,s);
 for(const [index,a] of c.abilities.entries())for(const f of a.forms||[])add('form',c.id+':form:'+slotKey(a,index)+':'+f.formKey,{slot:slotKey(a,index),abilityId:a.id,abilityIndex:index,formKey:f.formKey,name:f.name,description:f.description,target:f.target,art:f.art,sharedWithBase:f.art===a.art});
 for(const f of c.bodyForms||[])add('body',c.id+':body:'+f.key,{formKey:f.key,name:f.name,description:f.description,art:f.portrait});
 entries.push({id:c.id,name:c.name,title:c.identityTitle||c.title,realm:c.realm,kingdom:c.kingdom,cohort:c.storyCharacter?'story':'original',family:c.storyFamily||null,slots:list,complete:list.every(j=>j.status==='reviewed')});
}
const counts=(kind)=>jobs.filter(j=>j.kind===kind);
const base=counts('base'),forms=counts('form'),body=counts('body');
const report={
 scope:{rosterEntries:characters.length,originalEntries:characters.filter(c=>!c.storyCharacter).length,storyEntries:characters.filter(c=>c.storyCharacter).length,baseSlots:base.length,abilityFormSlots:forms.length,bodyPortraitSlots:body.length,totalLogicalSlots:jobs.length},
 coverage:{basePresent:base.filter(j=>j.exists).length,baseMissing:base.filter(j=>!j.exists).length,entriesWithAnyBaseMissing:entries.filter(e=>e.slots.some(j=>j.kind==='base'&&!j.exists)).length,entriesWithoutAnyBaseArt:entries.filter(e=>e.slots.filter(j=>j.kind==='base').every(j=>!j.exists)).length,brokenExplicitReferences:jobs.filter(j=>j.art&&!j.exists).length,formsSharedWithBase:forms.filter(j=>j.sharedWithBase).length,formsMissing:forms.filter(j=>!j.exists).length,bodyPortraitsMissing:body.filter(j=>!j.exists).length},
 visualReview:{definition:'Manual ledger; existence does not imply style approval.',reviewedSlots:jobs.filter(j=>j.status==='reviewed').length,fullyReviewedEntries:entries.filter(e=>e.complete).length,pendingSlots:jobs.filter(j=>j.status!=='reviewed').length},
 entries:entries.map(e=>({id:e.id,name:e.name,title:e.title,realm:e.realm,kingdom:e.kingdom,cohort:e.cohort,baseSlots:e.slots.filter(j=>j.kind==='base').length,missingSlots:e.slots.filter(j=>!j.exists).map(j=>j.key),pendingDedicatedForms:e.slots.filter(j=>j.sharedWithBase).map(j=>j.key),fullyReviewed:e.complete}))
};
for(const [dest,value] of [[option('--report','docs/ART_CATALOG_COVERAGE.json'),report],[option('--plan','docs/ART_COMPLETION_PLAN.json'),{goal:'Complete all runtime characters, every ability including additional skills, ability variants and body-form portraits.',status:'in_progress',scope:report.scope,entries,jobs}]]){const p=path.resolve(root,dest);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(value,null,2)+'\n');}
console.log(JSON.stringify({scope:report.scope,coverage:report.coverage,visualReview:report.visualReview}));

