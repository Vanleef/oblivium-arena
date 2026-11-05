import test from 'node:test';
import assert from 'node:assert/strict';
import {createTacticalBattle,previewTacticalActivation,submitTacticalActivation,fortressAim,tacticalArea} from '../src/tactical-combat.js';
import {unitFacing,faceMovement,findPath} from '../src/tactical-board.js';
import {combatScenes,combatScene} from '../src/combat-scenes.js';
import {paintTacticalToken} from '../src/tactical-sprites.js';

const ids=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
const enemy=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
const make=()=>createTacticalBattle(ids,enemy,{fortress:true});
test('all eight movement directions persist and directional attacks match them after resolution',()=>{
 for(const facing of [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]]){
  const s=make(),actor=s.allies[0];
  s.tactical.positions[actor.id]={x:4,y:2};
  for(const unit of s.enemies)unit.stunned=5;
  const to={x:4+facing[0],y:2+facing[1]};
  const actions=[{type:'move',actorId:actor.id,path:[to],abilityId:'fortress-basic'}];
  const preview=previewTacticalActivation(s,'player',actor.id,actions);
  assert.ok(preview.ok);
  assert.deepEqual(unitFacing(s,actor),[1,0]);
  assert.deepEqual(unitFacing(preview.projection,actor),facing);
  const result=submitTacticalActivation(s,'player',actor.id,actions);
  assert.ok(result.ok);
  assert.deepEqual(unitFacing(s,actor),facing);
  const cast=result.events.find(e=>e.type==='skill'&&e.actorId===actor.id);
  assert.deepEqual(cast.orientation,facing);
  assert.deepEqual(cast.cells,[{x:to.x+facing[0],y:to.y+facing[1]}]);
  assert.deepEqual(result.events.find(e=>e.type==='exchange-move').after.facings[actor.id],facing);
 }
});
test('blocked movement preserves the prior facing and never casts into the planned direction',()=>{
 const s=make(),a=s.allies[0],b=s.enemies[0];
 s.tactical.positions[a.id]={x:3,y:2};s.tactical.positions[b.id]={x:5,y:2};
 faceMovement(s,a.id,{x:3,y:3},{x:3,y:2});
 const action=actor=>[{type:'move',actorId:actor.id,path:[{x:4,y:2}],abilityId:'fortress-basic'}];
 assert.ok(submitTacticalActivation(s,'player',a.id,action(a)).waiting);
 const result=submitTacticalActivation(s,'enemy',b.id,action(b));
 assert.ok(result.ok);
 assert.deepEqual(unitFacing(s,a),[0,-1]);
 assert.ok(!result.events.some(e=>e.type==='skill'));
});
test('old saves fall back to team direction and scene ids are validated',()=>{
 const s=make();delete s.tactical.facings;
 assert.deepEqual(unitFacing(s,s.allies[0]),[1,0]);
 assert.deepEqual(unitFacing(s,s.enemies[0]),[-1,0]);
 assert.equal(combatScenes.length,3);
 assert.equal(combatScene('missing').id,'limbo');
 for(const scene of combatScenes){
  const battle=createTacticalBattle(ids,enemy,{fortress:true,scene:scene.id});
  assert.equal(battle.tactical.scene,scene.id);
  assert.ok(scene.art.endsWith('.webp'));
 }
});
test('skill animation orientation follows the facing even if the anchor is a distant target',()=>{
 const values={};
 const token={dataset:{unitId:'unit'},style:{setProperty:(key,value)=>values[key]=value},querySelector:()=>null,closest:()=>null};
 paintTacticalToken(token,{id:'unit'}, {actorId:'unit',type:'skill',orientation:[-1,0],before:{positions:{unit:{x:3,y:2}}},anchor:{x:5,y:2}}, {family:'strike',pose:'impact'});
 assert.equal(values['--facing-sign'],-1);
 assert.equal(values['--lunge-x'],'-5%');
});
test('support animations preserve the last facing instead of turning back to the team default',()=>{
 const s=make(),actor=s.allies[0],ability=actor.abilities.find(a=>a.target==='self');
 s.tactical.positions[actor.id]={x:3,y:2};
 faceMovement(s,actor.id,{x:3,y:3},{x:3,y:2});
 const aim=fortressAim(s,actor,ability);
 assert.deepEqual(aim.orientation,[0,-1]);
});
