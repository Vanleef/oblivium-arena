import assert from 'node:assert/strict';
import {resolveResourcePayment,resolveEssenceExchange} from '../src/resource-costs.js';
import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';
import {characters, elos} from '../src/data.js';
import {seededRandom, shuffled, normalizeCampaign, globalChoices, aggregateGlobal} from '../src/progression.js';
import {createBattle, createEnemyTeam, getCombatPlan, chooseAction, commitTurn, resolveNextAction, getAbilityResourceCosts, exchangeEssence} from '../src/combat.js';

export function assertBattleState(b) {
  assert.ok(['player','resolving','victory','defeat'].includes(b.phase));
  for (const p of [b.resources,b.enemyResources]) for (const value of Object.values(p)) assert.ok(Number.isInteger(value) && value >= 0, 'Essência inválida');
  for (const u of [...b.allies,...b.enemies]) {
    assert.ok(Number.isInteger(u.hp) && u.hp >= 0 && u.hp <= u.maxHp, `${u.name}: Vida inválida`);
    assert.ok(Number.isInteger(u.shield) && u.shield >= 0 && u.shield <= Math.round(u.maxHp * .5), `${u.name}: Defesa inválida`);
    assert.ok(u.abilities.length === 4 && u.abilities[3].defense && u.abilities[3].cooldown === 4, `${u.name}: defesa alterada`);
    for (const n of Object.values(u.cooldowns)) assert.ok(Number.isInteger(n) && n >= 0, `${u.name}: recarga inválida`);
  }
}

function assertEnemyPlan(b) {
  const reserved={...b.enemyResources},actors=new Set();
  for(const action of b.intents){
    if(action.type==='essence-exchange'){
      const exchanged=resolveEssenceExchange(reserved,action.target,action.payment);
      assert.ok(exchanged.ok,`IA planejou uma troca inválida: ${JSON.stringify(action)}`);
      Object.assign(reserved,exchanged.pool);continue;
    }
    const actor=b.enemies.find(u=>u.id===action.actorId),ability=actor.abilities.find(a=>a.id===action.abilityId);
    assert.ok(!actors.has(actor.id),'IA planejou duas ações para a mesma alma');actors.add(actor.id);
    const costs=getAbilityResourceCosts(actor,ability),payment=resolveResourcePayment(costs,reserved,action.randomPayment);
    assert.ok(payment.ok,`IA excedeu Essência compartilhada: ${actor.name}/${ability.name} ${JSON.stringify({reserved,costs,selected:action.randomPayment,plan:b.intents.map(x=>[x.actorId,x.abilityId,x.abilityName])})}`);
    for(const [id,n]of Object.entries(payment.costs))reserved[id]-=n;
    if(ability.convertEssence){
      const amount=Math.max(0,Math.floor(ability.convertEssence.amount||1));
      const source=ability.convertEssence.from==='any'?Object.keys(reserved).filter(id=>id!==ability.convertEssence.to&&reserved[id]>0).sort((x,y)=>reserved[y]-reserved[x])[0]:ability.convertEssence.from;
      if(source&&source!==ability.convertEssence.to&&reserved[source]>=amount){reserved[source]-=amount;reserved[ability.convertEssence.to]=(reserved[ability.convertEssence.to]||0)+amount;}
    }
    if(ability.generateEssence?.resource)reserved[ability.generateEssence.resource]=(reserved[ability.generateEssence.resource]||0)+Math.max(0,Math.floor(ability.generateEssence.amount||1));
  }
  assert.ok(Object.values(reserved).every(n=>n>=0),'IA excedeu Essência compartilhada');
}

export function simulateMatch(index, pass=0, maxRounds=100, options={}) {
  const seed=options.seed??21000+index*101+pass*10007, rng=seededRandom(seed), anchor=characters[index%characters.length];
  const ids=options.playerIds||[anchor.id,...shuffled(characters.filter(c=>c.id!==anchor.id),rng).slice(0,2).map(c=>c.id)];
  const elo=options.eloId?elos.find(e=>e.id===options.eloId):elos[(index+pass)%elos.length];
  if(!elo)throw new Error(`Elo desconhecido: ${options.eloId}`);
  const encounter=options.encounter||['normal','elite','boss'][pass%3],difficulty=options.difficulty??[0,3,6][pass%3],sequence=options.sequence??index;
  const b=createBattle(ids,createEnemyTeam(elo,ids,encounter,sequence,{difficulty}),{rng,difficulty,globalEffects:options.globalEffects});
  const used=new Set(),alternatives=new Set();let steps=0,skipped=0,exchanges=0;
  while(b.phase==='player'&&b.round<=maxRounds) {
    const playerPlan=getCombatPlan(b,'player');
    exchanges+=playerPlan.filter(item=>item.type==='essence-exchange').length;
    for(const action of playerPlan.filter(item=>item.type==='essence-exchange'))exchangeEssence(b,action.target,action.payment);
    for(const action of playerPlan.filter(item=>item.actorId)) chooseAction(b,action.actorId,action.abilityId,action.targetId);
    assert.ok(commitTurn(b).ok);let turnSteps=0;
    while(b.phase==='resolving'){
      assert.ok(++turnSteps<=16,`Resolução não terminou: semente ${seed}`);
      const previousSide=b.resolutionSide,{event}=resolveNextAction(b);steps++;
      if(event?.mode==='exchange')exchanges++;
      if(previousSide!=='enemy'&&b.resolutionSide==='enemy'&&b.phase==='resolving')assertEnemyPlan(b);
      if(event?.skipped)skipped++;
      else if(event?.abilityId){used.add(event.title);if(event.formKey!=='base')alternatives.add(event.title);}
      assertBattleState(b);
    }
  }
  return {seed,anchor:anchor.id,encounter,difficulty,result:b.phase==='player'?'limit':b.phase,rounds:Math.min(b.round,maxRounds),steps,skipped,exchanges,used:[...used],alternatives:[...alternatives]};
}

export function simulateRoster(passes=3,maxRounds=100) {
  const matches=[];
  for(let pass=0;pass<passes;pass++)for(let i=0;i<characters.length;i++){
    try{matches.push(simulateMatch(i,pass,maxRounds));}catch(error){error.message=`Personagem ${characters[i].name}, lote ${pass}: ${error.message}`;throw error;}
  }
  const categories=[...new Set(matches.map(m=>m.encounter))].map(encounter=>{
    const group=matches.filter(m=>m.encounter===encounter);
    return {encounter,difficulty:group[0].difficulty,matches:group.length,victories:group.filter(m=>m.result==='victory').length,defeats:group.filter(m=>m.result==='defeat').length,limit:group.filter(m=>m.result==='limit').length,averageRounds:Number((group.reduce((n,m)=>n+m.rounds,0)/group.length).toFixed(1))};
  });
  return {matches:matches.length,characters:characters.length,maxRounds,steps:matches.reduce((n,m)=>n+m.steps,0),techniques:new Set(matches.flatMap(m=>m.used)).size,alternatives:new Set(matches.flatMap(m=>m.alternatives)).size,exchanges:matches.reduce((n,m)=>n+m.exchanges,0),categories,limits:matches.filter(m=>m.result==='limit').map(({seed,anchor,encounter})=>({seed,anchor,encounter}))};
}

// Controlled comparison: same encounter type, Elo, seeds, teams and enemy roster
// across difficulty levels. It is diagnostic, not a human win-rate prediction.
function progressionLegacyEffects(eloId,difficulty,seed){
  const profile=normalizeCampaign({}),rng=seededRandom(seed);
  for(let tier=0;tier<difficulty;tier++){
    const choices=globalChoices(profile,eloId,tier,seed+tier*1009),choice=choices[Math.floor(rng()*choices.length)];
    profile.globalUpgrades.push({...choice,id:`${eloId}:${tier}:${choice.kind}`});
  }
  return aggregateGlobal(profile);
}

export function simulateDifficultyLadder(levels=[0,1,2,3,4,5,6],matches=200,eloId='sangria',encounter='elite'){
  const progressionMatches=Math.min(matches,100);
  const plain=levels.map(difficulty=>{
    const group=Array.from({length:matches},(_,index)=>simulateMatch(index,0,100,{difficulty,eloId,encounter,sequence:index}));
    return {difficulty,matches:group.length,victories:group.filter(m=>m.result==='victory').length,defeats:group.filter(m=>m.result==='defeat').length,limits:group.filter(m=>m.result==='limit').length,averageRounds:Number((group.reduce((n,m)=>n+m.rounds,0)/group.length).toFixed(1)),averageExchanges:Number((group.reduce((n,m)=>n+m.exchanges,0)/group.length).toFixed(2))};
  });
  const progression=levels.map(difficulty=>{
    const group=Array.from({length:progressionMatches},(_,index)=>{
      const globalEffects=progressionLegacyEffects(eloId,difficulty,78000+difficulty*977+index*104729);
      return simulateMatch(index,0,100,{difficulty,eloId,encounter,sequence:index,globalEffects});
    });
    const sampleLegacyEffects=progressionLegacyEffects(eloId,difficulty,78000+difficulty*977);
    return {difficulty,matches:group.length,victories:group.filter(m=>m.result==='victory').length,defeats:group.filter(m=>m.result==='defeat').length,limits:group.filter(m=>m.result==='limit').length,averageRounds:Number((group.reduce((n,m)=>n+m.rounds,0)/group.length).toFixed(1)),averageExchanges:Number((group.reduce((n,m)=>n+m.exchanges,0)/group.length).toFixed(2)),legacyCount:difficulty,sampleLegacyEffects};
  });
  return {eloId,encounter,scenarios:[{name:'Sem Legados',levels:plain},{name:'Com Legados ganhos nas Rupturas anteriores',levels:progression}]};
}

export function simulateDifficultyProfileSample(eloIds=['sangria','cura','vazio','correntes-quebradas'],matches=25){
  return eloIds.map(eloId=>{
    const report=simulateDifficultyLadder([4,5,6],matches,eloId,'elite');
    return {eloId,scenarios:report.scenarios.map(scenario=>({name:scenario.name,levels:scenario.levels.map(({difficulty,matches,victories,defeats,limits,averageRounds})=>({difficulty,matches,victories,defeats,limits,averageRounds}))}))};
  });
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const report=process.argv.includes('--difficulty-sample')?simulateDifficultyProfileSample():process.argv.includes('--difficulty-ladder')?simulateDifficultyLadder():simulateRoster();
  console.log(JSON.stringify(report,null,2));
  if(process.argv.includes('--write-report')&&!process.argv.includes('--difficulty-ladder')){
    const table=report.categories.map(c=>`| ${c.encounter} | ${c.difficulty} | ${c.matches} | ${c.victories} | ${c.defeats} | ${c.limit} | ${c.averageRounds} |`).join('\n');
    await writeFile(new URL('../docs/COMBAT_QA.md',import.meta.url),`# Avaliação automática de combates\n\nReprodução: \`node scripts/simulate-combat.mjs\`. São ${report.matches} partidas com sementes fixas, envolvendo os ${report.characters} personagens como integrantes do trio do jogador. As composições e os tipos de Essência variam por semente; a distribuição segue as regras normais, sem reservas artificiais ou Legados.\n\nAs ações do jogador de teste usam a mesma heurística da IA. Isso verifica a resolução completa e encontra interações problemáticas; não representa desempenho humano ou uma prova de equilíbrio entre personagens. Os três lotes combinam encontros e Rupturas diferentes. Para isolar a curva, o modo --difficulty-ladder repete 200 elites do Elo Sangria por nível, com as mesmas sementes, equipes e composição inimiga.\n\n| Encontro | Ruptura | Partidas | Vitórias | Derrotas | Limite de turnos | Média de turnos |\n| --- | --- | --- | --- | --- | --- | --- |\n${table}\n\nForam resolvidas ${report.steps} etapas, com ${report.techniques} técnicas distintas, ${report.alternatives} alternativas e ${report.exchanges} trocas de Essência usadas pelo simulador. Cada etapa valida Vida e Defesa inteiras e dentro dos limites, saldo de Essência não negativo, quatro espaços de técnica, defesa pessoal com recarga 4 e resolução limitada. O plano da IA reserva apenas Essência disponível e uma ação por alma. Partidas que atingem ${report.maxRounds} turnos são registradas como limite, sem declarar um vencedor.\n\n## Planejamento e apresentação\n\n- A oposição decide no início da própria vez, depois da resolução do trio do jogador. A IA compara utilidade e custo entre as almas antes de reservar Essência, e pode trocar 5 unidades por 1 tipo específico se isso habilitar uma ação que não pode pagar com o saldo direto. Prevê dano com as mesmas funções de cálculo do motor, considera proteção e contra-ataques visíveis, distribui alvos após eliminações previstas e evita cura ou defesa pessoal sem utilidade. Em Ruptura II+, concentra fogo na ameaça mais perigosa; em Ruptura III+, também pesa mitigação para aliados e pressão de dano ao decidir usar defesa pessoal.\n- A previsão é conservadora e usa apenas o estado atual: não consulta a fila do jogador nem sorteios futuros. Não é uma busca exaustiva por todas as sequências possíveis.\n- A inspeção de personagem mostra os efeitos ativos com origem, gatilho e valores. O campo continua com quatro ícones por personagem.\n- Reações de cura e proteção informam origem e beneficiários; a regeneração tem uma etapa de apresentação no início do turno.\n`);
  }
}
