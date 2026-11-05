import test from 'node:test';
import assert from 'node:assert/strict';
import {characters} from '../src/data.js';
import {conquestTechnique} from '../src/conquest-techniques.js';
import {objectiveAugmentPool,conquestAugmentedAbility} from '../src/conquest-augments.js';
import {createTacticalBattle} from '../src/tactical-combat.js';
import {addTacticalAugment,triggerTacticalAugments} from '../src/tactical-chests.js';
import {resolveBoardTechnique} from '../src/combat.js';

const make=()=>createTacticalBattle(['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'],{fortress:true});

test('every objective modifier grants its entire advertised increment after repeated collections, across the roster and forms',()=>{
 let checked=0;
 for(const source of characters){
  const variants=[null,...source.abilities.flatMap(a=>(a.forms||[]).map(form=>({abilityId:a.id,form})))];
  for(const variant of variants){
   const actor={...source,side:'player',hp:100,abilities:[...source.abilities.map(a=>variant?.abilityId===a.id?{...a,...variant.form}:a),{id:'fortress-basic',name:'Ataque Básico',damage:12}]};
   for(const tier of ['silver','gold','prismatic']){
    const s={tactical:{augments:{player:[],enemy:[]}}};
    for(const option of objectiveAugmentPool(s,'player',actor,tier).filter(o=>['basic','modify'].includes(o.effect.trigger))){
     const base=conquestTechnique(actor.abilities.find(a=>a.id===option.effect.abilityId)),original=JSON.stringify(base);
     s.tactical.augments.player=[];
     for(let stack=1;stack<=5;stack++){
      addTacticalAugment(s,'player',{...option.effect,id:option.id+':'+stack});
      const result=conquestAugmentedAbility(s,actor,base),{stat,amount}=option.effect;
      const context=option.id+' stack '+stack;
      if(stat==='dot'){
       const before=[base.dot,...base.dots||[]].filter(Boolean),after=[result.dot,...result.dots||[]].filter(Boolean);
       before.forEach((dot,index)=>{
        assert.equal(after[index].damage,dot.damage+amount*stack,context);
        assert.ok(result.description.includes((dot.tag||'Aflição')+': '+after[index].damage+' de dano'),context);
       });
      }else if(stat==='regen'){
       assert.equal(result.regen.heal,base.regen.heal+amount*stack,context);
       assert.equal(result.regen.turns,base.regen.turns,context);
       assert.ok(result.description.includes('Regenera '+result.regen.heal+' de Vida'),context);
      }else{
       assert.equal(result[stat],base[stat]+amount*stack,context);
       if(stat==='boost')assert.ok(result.description.includes('Concede +'+result.boost+' de dano temporário'),context);
       if(stat==='reduce')assert.ok(result.description.includes('Reduz o dano recebido em '+result.reduce),context);
      }
      assert.equal(JSON.stringify(base),original,'source ability mutated');
      assert.deepEqual(conquestAugmentedAbility(s,{...actor,id:'other'},base),base,'another owner received the upgrade');
      assert.deepEqual(conquestAugmentedAbility(s,{...actor,side:'enemy'},base),base,'another side received the upgrade');
      checked++;
     }
    }
   }
  }
 }
 assert.ok(checked>10000);
});

test('affliction descriptions update simultaneously without replacing a newly written value twice',()=>{
 const actor={id:'owner',side:'player'},base={id:'poison',dot:{tag:'Veneno (ritual)',damage:4,turns:2},dots:[{tag:'Veneno (ritual)',damage:9,turns:2}],description:'Veneno (ritual): 4 de dano por 2 rodada(s). Veneno (ritual): 9 de dano por 2 rodada(s).'};
 const s={tactical:{augments:{player:[{type:'conquest-augment',actorId:'owner',abilityId:'poison',trigger:'modify',stat:'dot',amount:5}]}}};
 assert.equal(conquestAugmentedAbility(s,actor,base).description,'Veneno (ritual): 9 de dano por 2 rodada(s). Veneno (ritual): 14 de dano por 2 rodada(s).');
});

test('stacked collection procs pay every instance once per round, with ordinary health and shield limits',()=>{
 for(const side of ['player','enemy']){
  const s=make(),actor=(side==='player'?s.allies:s.enemies)[0],basic=actor.abilities.find(a=>a.id==='fortress-basic');
  actor.hp=20;actor.shield=0;
  for(const stat of ['heal','shield'])for(let stack=0;stack<3;stack++){
   const option=objectiveAugmentPool(s,side,actor,'prismatic').find(o=>o.effect.trigger==='basic-hit'&&o.effect.stat===stat);
   addTacticalAugment(s,side,{...option.effect,id:option.effect.augmentId});
  }
  triggerTacticalAugments(s,side,actor,'skill',{ability:basic,affected:false});
  assert.equal(actor.hp,20);assert.equal(actor.shield,0);
  const notes=triggerTacticalAugments(s,side,actor,'skill',{ability:basic,affected:true});
  assert.equal(actor.hp,44);assert.equal(actor.shield,36);assert.equal(notes.length,6);
  const tooltip=conquestAugmentedAbility(s,actor,basic).description;
  assert.ok(tooltip.includes('recupera 24 de Vida do portador e concede 36 de Escudo ao portador'));
  assert.ok(tooltip.includes('Uma vez por rodada'));
  assert.deepEqual(triggerTacticalAugments(s,side,actor,'skill',{ability:basic,affected:true}),[]);
  assert.equal(actor.hp,44);assert.equal(actor.shield,36);
  s.round++;actor.hp=95;actor.shield=48;
  triggerTacticalAugments(s,side,actor,'skill',{ability:basic,affected:true});
  assert.equal(actor.hp,actor.maxHp);assert.equal(actor.shield,Math.round(actor.maxHp*.5));
  s.round++;actor.hp=50;actor.healingBlock=1;
  triggerTacticalAugments(s,side,actor,'skill',{ability:basic,affected:true});
  assert.equal(actor.hp,50);
 }
});

test('real basic attack resolution uses stacked damage above the former ceiling',()=>{
 const s=make(),actor=s.allies[0],target=s.enemies[0],basic=actor.abilities.find(a=>a.id==='fortress-basic');
 s.resonance.bonus=0;s.buffs.damage=0;
 target.shield=0;target.reduction=0;target.armor=0;target.exposed=0;
 const unaugmented=JSON.parse(JSON.stringify(s));
 resolveBoardTechnique(unaugmented,{side:'player',actorId:actor.id,abilityId:basic.id,formKey:'base'},[target.id]);
 const baseDamage=target.hp-unaugmented.enemies[0].hp;
 for(let stack=0;stack<3;stack++){
  const option=objectiveAugmentPool(s,'player',actor,'prismatic').find(o=>o.effect.trigger==='basic'&&o.effect.stat==='damage');
  addTacticalAugment(s,'player',{...option.effect,id:option.effect.augmentId});
 }
 const technique=conquestAugmentedAbility(s,actor,basic);
 assert.equal(technique.damage,48);assert.ok(technique.description.includes('Causa 48'));
 const before=target.hp;
 const result=resolveBoardTechnique(s,{side:'player',actorId:actor.id,abilityId:basic.id,formKey:'base'},[target.id]);
 assert.ok(!result.skipped);assert.equal(before-target.hp,baseDamage+36);
});

test('new support upgrades reach real buff, mitigation and regeneration effects without extending their duration',()=>{
 const s=make(),actor=s.allies[0];
 const base={id:'ritual-test',name:'Ritual',target:'self',boost:6,reduce:5,regen:{heal:4,turns:2},cooldown:2,formKey:'base'};
 actor.abilities=[base];
 const pool=objectiveAugmentPool(s,'player',actor,'gold');
 for(const stat of ['boost','reduce','regen']){
  const option=pool.find(o=>o.effect.stat===stat);
  assert.ok(option,stat);addTacticalAugment(s,'player',{...option.effect,id:option.effect.augmentId});
 }
 const expected=conquestAugmentedAbility(s,actor,conquestTechnique(base));
 const result=resolveBoardTechnique(s,{side:'player',actorId:actor.id,abilityId:base.id,formKey:'base'},[actor.id]);
 assert.ok(!result.skipped);
 assert.equal(actor.boost,expected.boost);assert.equal(actor.reduction,expected.reduce);
 assert.equal(actor.regens[0].heal,expected.regen.heal);assert.equal(actor.regens[0].turns,2);
 assert.ok(expected.boost>=13&&expected.reduce>=13&&expected.regen.heal>=12);
});
