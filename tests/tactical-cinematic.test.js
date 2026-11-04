import test from 'node:test';
import assert from 'node:assert/strict';
import {tacticalCutinActive,tacticalCutinMarkup,tacticalProjectileKind,tacticalProjectileMarkup,tacticalPlaybackFrames,tacticalReplayFrames,tacticalHighlightEvent} from '../src/tactical-cinematic.js';
import {tacticalFrameDuration} from '../src/tactical-animation.js';
const actor={id:'serpe',sourceId:'a-boca-de-vidro',name:'Sylvara',realm:'Inferno',side:'player',art:{portrait:'/portrait.webp'}};
const ability={name:'Sibilo Cortante',target:'enemy',damage:15,damageType:'piercing'};
const event={type:'skill',actorId:actor.id,anchor:{x:3,y:1},before:{positions:{serpe:{x:0,y:1}}}};
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
test('a arte da forma ativa é usada na vinheta',()=>{
 assert.match(tacticalCutinMarkup({...actor,art:{portrait:'/form.webp'}},ability,{...event,pose:'gather'}),/form.webp/);
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
