import test from 'node:test';
import assert from 'node:assert/strict';
import {characters, elos, characterById} from '../src/data.js';
import {createEnemyTeam} from '../src/combat.js';

const inRealm=(character,realm)=>character.kingdomId===realm.id||character.legacyEloId===realm.id||character.eloId===realm.id;

test('all campaign encounters keep NPC creatures outside their three named rivalry slots',()=>{
 let realmsChecked=0;
 for(const elo of elos){
  const roster=characters.filter(character=>!character.npcOnly&&inRealm(character,elo));
  if(roster.length<3)continue;
  realmsChecked++;
  const playerIds=roster.slice(0,3).map(character=>character.id);
  for(const [encounter,count,creatures] of [['normal',3,0],['elite',4,1],['mini',4,1],['boss',5,2]]){
   const enemies=createEnemyTeam(elo,playerIds,encounter,0,{campaign:true});
   assert.equal(enemies.length,count,elo.id+'/'+encounter);
   assert.ok(enemies.slice(0,3).every(unit=>unit.npcOnly!==true),elo.id+'/'+encounter+' leaked a creature into the rival trio');
   assert.equal(enemies.filter(unit=>unit.npcOnly===true).length,creatures,elo.id+'/'+encounter);
   assert.ok(enemies.slice(3).every(unit=>unit.npcOnly===true),elo.id+'/'+encounter+' has a noncreature reinforcement');
   assert.equal(new Set(enemies.map(unit=>unit.id)).size,count,'every opponent has a unique battle instance ID');
  }
 }
 assert.ok(realmsChecked>=10,'test must cover the actual named realm catalog');
});

test('boss overrides cannot bring NPC-only creatures into an authored rival trio',()=>{
 const elo=elos.find(elo=>characters.filter(character=>!character.npcOnly&&inRealm(character,elo)).length>=4);
 assert.ok(elo);
 const roster=characters.filter(character=>!character.npcOnly&&inRealm(character,elo));
 const npc=Object.values(characterById).find(character=>character.npcOnly);
 assert.ok(npc);
 const enemies=createEnemyTeam(elo,roster.slice(0,3).map(unit=>unit.id),'boss',1,{
  campaign:true,bossIds:[npc.id,roster[1].id,roster[2].id]
 });
 assert.ok(enemies.slice(0,3).every(unit=>unit.npcOnly!==true));
 assert.equal(enemies.filter(unit=>unit.npcOnly===true).length,2);
});

test('noncampaign arena encounters still use exactly three named opponents',()=>{
 const elo=elos.find(elo=>characters.filter(character=>!character.npcOnly&&inRealm(character,elo)).length>=3);
 const party=characters.filter(character=>!character.npcOnly&&inRealm(character,elo)).slice(0,3).map(c=>c.id);
 const enemies=createEnemyTeam(elo,party);
 assert.equal(enemies.length,3);
 assert.ok(enemies.every(unit=>!unit.npcOnly));
});
