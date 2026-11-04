import assert from 'node:assert/strict';
import {tacticalOpponentRoster} from '../src/tactical-kits.js';
import {createTacticalBattle,submitTacticalPlan,resolveTacticalRound,tacticalView} from '../src/tactical-combat.js';
import {planTacticalAI} from '../src/tactical-ai.js';
const args=process.argv.slice(2),part=Number(args[0]||0),parts=Number(args[1]||1);
assert.ok(Number.isInteger(part)&&Number.isInteger(parts)&&parts>0&&part>=0&&part<parts);
const ids=tacticalOpponentRoster.filter((_,i)=>i%parts===part);let plannedActions=0,executedEvents=0;
for(const [localIndex,id]of ids.entries()){
 const index=tacticalOpponentRoster.indexOf(id),enemy=[id,...['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'].filter(other=>other!==id)].slice(0,3);
 const s=createTacticalBattle(['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],enemy,{seed:1000+index,environment:['inferno','paraiso','limbo'][index%3]});
 for(const key of ['resources','enemyResources'])s[key]={essence:6,cinza:6,graca:6,ruptura:6};
 for(const side of ['player','enemy']){
  const before=JSON.stringify(s),plan=planTacticalAI(tacticalView(s,side),side);assert.equal(JSON.stringify(s),before,id+': IA alterou a entrada');
  const result=submitTacticalPlan(s,side,plan);assert.equal(result.ok,true,id+': '+result.reason);plannedActions+=plan.length;
 }
 const result=resolveTacticalRound(s);assert.equal(result.ok,true,id+': resolução falhou');executedEvents+=result.events.length;
 assert.ok([...s.allies,...s.enemies].every(u=>Number.isFinite(u.hp)&&u.hp>=0&&u.hp<=u.maxHp),id+': Vida inválida');
 const positions=[...s.allies,...s.enemies].filter(u=>u.hp>0).map(u=>s.tactical.positions[u.id]).map(p=>p.x+','+p.y);assert.equal(new Set(positions).size,positions.length,id+': ocupantes sobrepostos');
 if((localIndex+1)%10===0)process.stdout.write(JSON.stringify({part,completed:localIndex+1,total:ids.length})+'\n');
}
console.log(JSON.stringify({part,parts,battles:ids.length,plannedActions,executedEvents,errors:0}));
