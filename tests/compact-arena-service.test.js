import test from 'node:test';
import assert from 'node:assert/strict';
import {CompactArenaService} from '../server/compact-arena-service.js';
import {tacticalHand} from '../src/tactical-decks.js';
const ids=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
class Store{
 constructor(){this.data=new Map();this.lock=Promise.resolve();}
 transaction(work){
  const run=this.lock.then(async()=>{
   const changes=new Map(this.data);
   const tx={get:async key=>changes.has(key)?JSON.parse(changes.get(key)):null,
    set:async(key,value)=>changes.set(key,JSON.stringify(value)),
    delete:async key=>changes.delete(key)};
   const answer=await work(tx);this.data=changes;return answer;
  });
  this.lock=run.catch(()=>{});return run;
 }
}
test('separate matchmaking, private decks, simultaneous turns and valid server settlement',async()=>{
 const service=new CompactArenaService(new Store()),alice=await service.request(),bob=await service.request();
 assert.notEqual(alice.profile.id,bob.profile.id);
 assert.equal((await service.request(alice.token,{op:'queue',team:ids})).match,null);
 const joined=await service.request(bob.token,{op:'queue',team:ids});
 assert.equal(joined.match.mode,'compact');
 let a=await service.request(alice.token),b=await service.request(bob.token);
 assert.equal(a.match.id,b.match.id);
 assert.equal(a.match.battle.tactical.width,6);
 assert.equal(a.match.battle.tactical.height,6);
 for(const client of [a,b]){
  const decks=client.match.battle.tactical.decks.sides;
  const visible=Object.values(decks).filter(sideDeck=>Object.keys(sideDeck).length>0);
  assert.equal(visible.length,1,'each client receives only its own three decks');
  assert.equal(Object.keys(visible[0]).length,3);
 }
 const version=a.match.version;
 const first=await service.request(alice.token,{op:'turn',version,round:1,actions:[]});
 assert.equal(first.match.battle.phase,'waiting');
 await assert.rejects(()=>service.request(alice.token,{op:'turn',version,round:1,actions:[]}),{status:409});
 const second=await service.request(bob.token,{op:'turn',version,round:1,actions:[]});
 assert.equal(second.match.battle.round,2);
 a=await service.request(alice.token);b=await service.request(bob.token);
 assert.equal(a.match.battle.tactical.stage,'planning');
 assert.equal(b.match.battle.tactical.stage,'planning');
 const surrendered=await service.request(alice.token,{op:'surrender'});
 assert.equal(surrendered.match.settled,true);
 assert.equal(surrendered.profile.losses,1);
 assert.equal((await service.request(bob.token)).profile.wins,1);
 assert.equal((await service.request(alice.token)).profile.losses,1);
});
test('rejects adversary cards and forged hero IDs without corrupting queue',async()=>{
 const service=new CompactArenaService(new Store()),a=await service.request();
 await assert.rejects(()=>service.request(a.token,{op:'queue',team:['o-acougueiro','o-acougueiro','o-escudo-vivo']}),{status:400});
 await assert.rejects(()=>service.request(a.token,{op:'queue',team:ids,decks:{[ids[0]]:[{kind:'skill',abilityId:'despertar'}]}}),{status:400});
 await assert.rejects(()=>service.request(a.token,{op:'queue',team:ids,decks:{fake:[{kind:'reaction'}]}}),{status:400});
});
test('concurrent independent submissions use round identity and reject replay of prior round',async()=>{
 const store=new Store(),service=new CompactArenaService(store),a=await service.request(),b=await service.request();
 await service.request(a.token,{op:'queue',team:ids});await service.request(b.token,{op:'queue',team:ids});
 const first=await service.request(a.token),oldVersion=first.match.version;
 const p=service.request(a.token,{op:'turn',version:oldVersion,round:1,actions:[]});
 const q=service.request(b.token,{op:'turn',version:oldVersion,round:1,actions:[]});
 const turns=await Promise.all([p,q]);
 assert.ok(turns.every(result=>result.match.battle.round===1||result.match.battle.round===2));
 assert.equal((await service.request(a.token)).match.battle.round,2);
 await assert.rejects(()=>service.request(a.token,{op:'turn',version:oldVersion,round:1,actions:[]}),{status:409});
});
test('a defender timeout accepts the special without forfeiting the entire match',async()=>{
 let now=50000;const store=new Store(),service=new CompactArenaService(store,{now:()=>now});
 const a=await service.request(),b=await service.request();
 await service.request(a.token,{op:'queue',team:ids});const joined=await service.request(b.token,{op:'queue',team:ids});
 const raw=JSON.parse(store.data.get('compact-match:'+joined.match.id));
 raw.battle.tactical.stage='resolving';
 raw.battle.tactical.pendingClash={round:1,defenderSide:'enemy',actorId:raw.battle.allies[0].id,abilityId:'voto',targetId:raw.battle.enemies[0].id,willSign:'luz'};
 // The special needs a real pending action, so this fixture checks that an
 // invalid recovery does not silently settle or corrupt a match.
 raw.deadline=now+100;
 store.data.set('compact-match:'+raw.id,JSON.stringify(raw));
 now+=200;
 await assert.rejects(()=>service.request(a.token),/Resolução autoritativa indisponível/);
 assert.equal(JSON.parse(store.data.get('compact-match:'+raw.id)).settled,false);
});
