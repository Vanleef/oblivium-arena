import test from 'node:test';
import assert from 'node:assert/strict';
import {tacticalCutinActive,tacticalCutinMarkup,tacticalProjectileKind,tacticalProjectileMarkup,tacticalPlaybackFrames,tacticalReplayFrames,tacticalHighlightEvent} from '../src/tactical-cinematic.js';
import {tacticalFrameDuration} from '../src/tactical-animation.js';
const actor={id:'serpe',sourceId:'a-boca-de-vidro',name:'Sylvara',realm:'Inferno',side:'player',art:{portrait:'/portrait.webp'}};
const ability={name:'Sibilo Cortante',target:'enemy',damage:15,damageType:'piercing'};
const event={type:'skill',actorId:actor.id,abilityId:'voto',anchor:{x:3,y:1},before:{positions:{serpe:{x:0,y:1}}}};
test('vinheta fica restrita à preparação de habilidade executada',()=>{
 assert.equal(tacticalCutinActive({...event,pose:'windup'}),true);
 assert.equal(tacticalCutinActive({...event,pose:'impact'}),false);
 assert.equal(tacticalCutinActive({...event,pose:'ready',index:8}),false);
 assert.equal(tacticalCutinActive({...event,pose:'windup',skipped:true}),false);
 assert.equal(tacticalCutinActive({type:'move',pose:'ready',index:0}),false);
 assert.match(tacticalCutinMarkup(actor,ability,{...event,pose:'windup'}),/inferno player/);
 assert.match(tacticalCutinMarkup({...actor,side:'enemy'},ability,{...event,pose:'windup'}),/inferno enemy/);
});
test('voo de projétil ocorre antes do contato e não duplica viagens existentes',()=>{
 const frames=tacticalPlaybackFrames(actor,ability,event),travel=frames.findIndex(f=>f.pose==='travel'),impact=frames.findIndex(f=>f.pose==='impact');
 assert.ok(travel>=0&&travel<impact);
 assert.equal(frames.filter(f=>f.pose==='travel').length,1);
 const energy={...ability,damageType:'energy'},second=tacticalPlaybackFrames(actor,energy,event);
 assert.equal(second.filter(f=>f.pose==='travel').length,1);
 assert.equal(tacticalFrameDuration({...event,pose:'travel'}),310);
 assert.equal(tacticalProjectileMarkup(actor,ability,{...event,pose:'impact',family:'pierce'}),'');
 assert.match(tacticalProjectileMarkup(actor,ability,{...event,pose:'travel',family:'pierce'}),/skill-projectile glass/);
});
test('suporte pessoal, movimento e ações canceladas não disparam projéteis',()=>{
 assert.equal(tacticalProjectileKind(actor,{...ability,target:'self'},event),null);
 assert.equal(tacticalProjectileKind(actor,ability,{...event,type:'move'}),null);
 assert.equal(tacticalProjectileKind(actor,ability,{...event,skipped:true}),null);
 assert.equal(tacticalProjectileKind(actor,ability,{...event,anchor:{x:0,y:1}}),null);
 const melee={...actor,sourceId:'o-acougueiro'};
 assert.equal(tacticalProjectileKind(melee,ability,{...event,family:'slash'}),null);
});
test('supers focus the arena instead of injecting an oversized artwork',()=>{
 const markup=tacticalCutinMarkup({...actor,art:{portrait:'/form.webp'}},ability,{...event,pose:'gather'});
 assert.match(markup,/fighter-super inferno player/);
 assert.match(markup,/fighter-super-speedlines/);
 assert.match(markup,/fighter-super-caption/);
 assert.doesNotMatch(markup,/<img|form\.webp|portrait\.webp|cutin-art/);
 assert.equal(tacticalCutinMarkup(actor,ability,{...event,abilityId:'impulso',pose:'windup'}),'');
 assert.equal(tacticalCutinMarkup(actor,ability,{...event,skipped:true,pose:'windup'}),'');
 assert.equal(tacticalCutinActive({...event,abilityId:'despertar',pose:'release'}),true);
});



test('repetições curtas preservam trajeto, contato e a primeira ativação',()=>{
 const full=tacticalReplayFrames(actor,ability,{...event,compactReplay:true});
 const repeated={...event,compactReplay:true,repeated:true};
 const short=tacticalReplayFrames(actor,ability,repeated);
 assert.ok(short.length<full.length);assert.equal(short.filter(f=>f.pose==='impact').length,1);
 assert.ok(short.findIndex(f=>f.pose==='travel')<short.findIndex(f=>f.pose==='impact'));
 assert.equal(tacticalCutinActive({...repeated,pose:'windup'}),false);
 assert.deepEqual(tacticalReplayFrames(actor,ability,{...repeated,compactReplay:false}),full);
 assert.deepEqual(tacticalReplayFrames(actor,ability,{...repeated,type:'move'}),tacticalPlaybackFrames(actor,ability,{...event,type:'move'}));
});
test('eliminações e transformações mantêm a apresentação completa mesmo quando repetidas',()=>{
 const before={...event.before,allies:[{id:actor.id,hp:100,bodyForm:'base'}],enemies:[{id:'foe',hp:12}]};
 for(const after of [
  {allies:[{id:actor.id,hp:100,bodyForm:'base'}],enemies:[{id:'foe',hp:0}]},
  {allies:[{id:actor.id,hp:100,bodyForm:'awakened'}],enemies:[{id:'foe',hp:12}]}
 ]){
  const highlight={...event,before,after,compactReplay:true,repeated:true};
  assert.equal(tacticalHighlightEvent(highlight),true);assert.equal(tacticalCutinActive({...highlight,pose:'windup'}),true);
  assert.deepEqual(tacticalReplayFrames(actor,ability,highlight),tacticalPlaybackFrames(actor,ability,highlight));
 }
 assert.equal(tacticalHighlightEvent({...event,before,after:before}),false);
});

test('Fio de Memória usa um fio durante o trajeto',()=>{
 const nilo={id:'nilo',side:'player'};
 const cast={type:'skill',actorId:'nilo',abilityId:'tecnica',family:'bind',anchor:{x:2,y:0},before:{positions:{nilo:{x:0,y:0}}}};
 assert.equal(tacticalProjectileKind(nilo,{target:'enemy'},cast),'thread');
});

test('fighting-game special shows the skill title without duplicating character artwork',()=>{
 const cast={...ability,name:'Chama da Ruína',art:'/art/skills/chama.webp'};
 const markup=tacticalCutinMarkup(actor,cast,{...event,pose:'release'});
 assert.match(markup,/Chama da Ruína/);
 assert.match(markup,/data-phase="release"/);
 assert.doesNotMatch(markup,/<img|chama\.webp|portrait\.webp/);
 const escape=tacticalCutinMarkup({...actor,name:'<ataque>'},{name:'<especial>'},{...event,pose:'windup'});
 assert.match(escape,/&lt;ataque&gt;/);
 assert.match(escape,/&lt;especial&gt;/);
});

