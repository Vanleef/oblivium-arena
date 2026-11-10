import test from 'node:test';
import assert from 'node:assert/strict';
import {CompactArenaService} from '../server/compact-arena-service.js';
import {tacticalHand} from '../src/tactical-decks.js';
import {tacticalTargets,previewTacticalPlan} from '../src/tactical-combat.js';
import {tacticalComboEligible} from '../src/tactical-combo.js';
import {boardCells,directions} from '../src/tactical-board.js';
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
test('switching authenticated accounts on the same browser cannot inherit another account’s match',async()=>{
 const service=new CompactArenaService(new Store());
 const alice={id:'account-alice',handle:'Alice'},bob={id:'account-bob',handle:'Bob'},charlie={id:'account-charlie',handle:'Charlie'};
 const a=await service.request(null,{},alice);
 const b=await service.request(null,{},bob);
 await service.request(a.token,{op:'queue',team:ids},alice);
 const matched=await service.request(b.token,{op:'queue',team:ids},bob);
 assert.ok(matched.match);
 const switched=await service.request(a.token,{},charlie);
 assert.notEqual(switched.profile.id,a.profile.id);
 assert.equal(switched.match,null);
 await assert.rejects(()=>service.request(a.token,{op:'surrender'},charlie),{status:409});
 const reconnected=await service.request(a.token,{},alice);
 assert.equal(reconnected.profile.id,a.profile.id);
 assert.equal(reconnected.match.id,matched.match.id);
 assert.equal(reconnected.match.settled,false);
 const freshBrowser=await service.request(null,{},charlie);
 assert.equal(freshBrowser.profile.id,switched.profile.id);
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
test('an invalid persisted clash cannot silently settle or corrupt a match',async()=>{
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

test('a real defender timeout accepts the special and resumes the same match',async()=>{
 let now=50000;const store=new Store(),service=new CompactArenaService(store,{now:()=>now});
 const a=await service.request(),b=await service.request();
 await service.request(a.token,{op:'queue',team:ids});
 const joined=await service.request(b.token,{op:'queue',team:ids});
 const raw=JSON.parse(store.data.get('compact-match:'+joined.match.id));
 const battle=raw.battle,actor=battle.allies[0],victim=battle.enemies[0];
 battle.tactical.positions[actor.id]={x:2,y:2};
 battle.tactical.positions[victim.id]={x:3,y:2};
 const deck=battle.tactical.decks.sides.player[actor.id];
 let action=null;
 for(const card of Object.values(deck.cards)){
  const ability=actor.abilities.find(item=>item.id===card.abilityId);
  if(!ability||!tacticalComboEligible(actor,ability,[victim.id]))continue;
  for(const anchor of boardCells(battle)){
   for(const orientation of directions){
    if(!tacticalTargets(battle,actor,ability,anchor,orientation).includes(victim.id))continue;
    const candidate={type:'skill',actorId:actor.id,abilityId:ability.id,cardId:card.id,anchor,orientation,willSign:'miragem'};
    const hand=[...deck.hand];deck.hand=[card.id];
    if(previewTacticalPlan(battle,'player',[candidate]).ok){action=candidate;break;}
    deck.hand=hand;
   }
   if(action)break;
  }
  if(action)break;
 }
 assert.ok(action,'a real contestable special must be available');
 store.data.set('compact-match:'+raw.id,JSON.stringify(raw));
 const players=new Map([[a.profile.id,a],[b.profile.id,b]]);
 const attacker=players.get(raw.players[0]),defender=players.get(raw.players[1]);
 const version=raw.version;
 await service.request(attacker.token,{op:'turn',version,round:1,actions:[action]});
 const pending=await service.request(defender.token,{op:'turn',version,round:1,actions:[]});
 assert.equal(pending.match.battle.phase,'tactical-clash');
 const beforeHp=pending.match.battle.enemies[0].hp;
 now=pending.match.deadline+1;
 const resumed=await service.request(attacker.token,{op:'profile'});
 assert.equal(resumed.match.id,raw.id);
 assert.equal(resumed.match.settled,false);
 assert.equal(resumed.match.battle.round,2);
 assert.equal(resumed.match.battle.tactical.stage,'planning');
 assert.ok(resumed.match.battle.enemies[0].hp<beforeHp);
 const reconnected=await service.request(defender.token,{op:'profile'});
 assert.equal(reconnected.match.version,resumed.match.version);
 assert.equal(reconnected.match.battle.enemies[0].hp,resumed.match.battle.enemies[0].hp);
 assert.equal(reconnected.profile.losses,0);
});

test('profile polling preserves an active queue without changing since, and reload restores search state',async()=>{
 let now=1_000_000;
 const store=new Store(),service=new CompactArenaService(store,{now:()=>now});
 const first=await service.request();
 const queued=await service.request(first.token,{op:'queue',team:ids});
 assert.equal(queued.queued,true);
 const before=JSON.parse(store.data.get('compact-queue'))[0];
 for(let i=0;i<8;i++){
  now+=10_000;
  const response=await service.request(first.token,{op:'profile'});
  assert.equal(response.queued,true,'heartbeat must keep queued player visible');
  assert.equal(response.match,null);
 }
 const after=JSON.parse(store.data.get('compact-queue'))[0];
 assert.equal(after.since,before.since,'search age must not reset');
 assert.equal(after.touched,now);
 const other=await service.request();
 const matched=await service.request(other.token,{op:'queue',team:ids});
 assert.ok(matched.match,'a waiting player is matchable after more than 20 seconds');
 assert.equal(matched.queued,false);
 assert.equal((await service.request(first.token,{op:'profile'})).queued,false);
});
test('cancelled and expired searches are never revived by profile polling',async()=>{
 let now=200_000;
 const service=new CompactArenaService(new Store(),{now:()=>now});
 const first=await service.request();
 await service.request(first.token,{op:'queue',team:ids});
 assert.equal((await service.request(first.token,{op:'cancel'})).queued,false);
 assert.equal((await service.request(first.token,{op:'profile'})).queued,false);
 await service.request(first.token,{op:'queue',team:ids});
 now+=20_001;
 assert.equal((await service.request(first.token,{op:'profile'})).queued,false);
});
