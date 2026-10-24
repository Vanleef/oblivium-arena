import assert from 'node:assert/strict';
import {resolveResourcePayment} from '../src/resource-costs.js';
import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';
import {characters, elos} from '../src/data.js';
import {seededRandom, shuffled} from '../src/progression.js';
import {createBattle, createEnemyTeam, getCombatPlan, chooseAction, commitTurn, resolveNextAction, getAbilityResourceCosts} from '../src/combat.js';

export function assertBattleState(b) {
  assert.ok(['player','resolving','victory','defeat'].includes(b.phase));
  for (const p of [b.resources,b.enemyResources]) for (const value of Object.values(p)) assert.ok(Number.isInteger(value) && value >= 0, 'Energia inválida');
  for (const u of [...b.allies,...b.enemies]) {
    assert.ok(Number.isInteger(u.hp) && u.hp >= 0 && u.hp <= u.maxHp, `${u.name}: Vida inválida`);
    assert.ok(Number.isInteger(u.shield) && u.shield >= 0 && u.shield <= 80, `${u.name}: Defesa inválida`);
    assert.ok(u.abilities.length === 4 && u.abilities[3].defense && u.abilities[3].cooldown === 4, `${u.name}: defesa alterada`);
    for (const n of Object.values(u.cooldowns)) assert.ok(Number.isInteger(n) && n >= 0, `${u.name}: recarga inválida`);
  }
}

function assertEnemyPlan(b) {
  const reserved={...b.enemyResources},actors=new Set();
  for(const action of b.intents){
    const actor=b.enemies.find(u=>u.id===action.actorId),ability=actor.abilities.find(a=>a.id===action.abilityId);
    assert.ok(!actors.has(actor.id),'IA planejou duas ações para a mesma alma');actors.add(actor.id);
    const payment=resolveResourcePayment(getAbilityResourceCosts(actor,ability),reserved,action.randomPayment);
    assert.ok(payment.ok,`IA excedeu energia compartilhada: ${actor.name}/${ability.name}`);
    for(const [id,n]of Object.entries(payment.costs))reserved[id]-=n;
  }
  assert.ok(Object.values(reserved).every(n=>n>=0),'IA excedeu energia compartilhada');
}

export function simulateMatch(index, pass=0, maxRounds=100) {
  const seed=21000+index*101+pass*10007, rng=seededRandom(seed), anchor=characters[index%characters.length];
  const ids=[anchor.id,...shuffled(characters.filter(c=>c.id!==anchor.id),rng).slice(0,2).map(c=>c.id)];
  const elo=elos[(index+pass)%elos.length], encounter=['normal','elite','boss'][pass%3],difficulty=[0,3,6][pass%3];
  const b=createBattle(ids,createEnemyTeam(elo,ids,encounter,index,{difficulty}),{rng,difficulty});
  const used=new Set(),alternatives=new Set();let steps=0,skipped=0;
  while(b.phase==='player'&&b.round<=maxRounds) {
    const playerPlan=getCombatPlan(b,'player');
    for(const action of playerPlan) chooseAction(b,action.actorId,action.abilityId,action.targetId);
    assert.ok(commitTurn(b).ok);let turnSteps=0;
    while(b.phase==='resolving'){
      assert.ok(++turnSteps<=10,`Resolução não terminou: semente ${seed}`);
      const previousSide=b.resolutionSide,{event}=resolveNextAction(b);steps++;
      if(previousSide!=='enemy'&&b.resolutionSide==='enemy'&&b.phase==='resolving')assertEnemyPlan(b);
      if(event?.skipped)skipped++;
      else if(event?.abilityId){used.add(event.title);if(event.formKey!=='base')alternatives.add(event.title);}
      assertBattleState(b);
    }
  }
  return {seed,anchor:anchor.id,encounter,difficulty,result:b.phase==='player'?'limit':b.phase,rounds:Math.min(b.round,maxRounds),steps,skipped,used:[...used],alternatives:[...alternatives]};
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
  return {matches:matches.length,characters:characters.length,maxRounds,steps:matches.reduce((n,m)=>n+m.steps,0),techniques:new Set(matches.flatMap(m=>m.used)).size,alternatives:new Set(matches.flatMap(m=>m.alternatives)).size,categories,limits:matches.filter(m=>m.result==='limit').map(({seed,anchor,encounter})=>({seed,anchor,encounter}))};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const report=simulateRoster();
  console.log(JSON.stringify(report,null,2));
  if(process.argv.includes('--write-report')){
    const table=report.categories.map(c=>`| ${c.encounter} | ${c.difficulty} | ${c.matches} | ${c.victories} | ${c.defeats} | ${c.limit} | ${c.averageRounds} |`).join('\n');
    await writeFile(new URL('../docs/COMBAT_QA.md',import.meta.url),`# Avaliação automática de combates\n\nReprodução: \`node scripts/simulate-combat.mjs\`. São ${report.matches} partidas com sementes fixas, envolvendo os ${report.characters} personagens como integrantes do trio do jogador. As composições e os recursos variam por semente; a energia segue as regras normais, sem reservas artificiais ou Legados.\n\nAs ações do jogador de teste usam a mesma heurística da IA. Isso verifica a resolução completa e encontra interações problemáticas; não representa desempenho humano ou uma prova de equilíbrio entre personagens. Os lotes de dificuldade usam encontros diferentes e não são uma comparação controlada de dificuldade.\n\n| Encontro | Ruptura | Partidas | Vitórias | Derrotas | Limite de turnos | Média de turnos |\n| --- | --- | --- | --- | --- | --- | --- |\n${table}\n\nForam resolvidas ${report.steps} etapas, com ${report.techniques} técnicas distintas e ${report.alternatives} alternativas usadas. Cada etapa valida Vida e Defesa inteiras e dentro dos limites, energia não negativa, quatro espaços de técnica, defesa pessoal com recarga 4 e resolução limitada. O plano da IA reserva apenas recursos existentes e uma ação por alma. Partidas que atingem ${report.maxRounds} turnos são registradas como limite, sem declarar um vencedor.\n\n## Planejamento e apresentação\n\n- A oposição decide no início da própria vez, depois da resolução do trio do jogador. A IA compara utilidade e custo entre as almas antes de reservar energia. Prevê dano com as mesmas funções de cálculo do motor, considera proteção e contra-ataques visíveis, distribui alvos após eliminações previstas e evita cura ou defesa pessoal sem utilidade.\n- A previsão é conservadora e usa apenas o estado atual: não consulta a fila do jogador nem sorteios futuros. Não é uma busca exaustiva por todas as sequências possíveis.\n- A inspeção de personagem mostra os efeitos ativos com origem, gatilho e valores. O campo continua com quatro ícones por personagem.\n- Reações de cura e proteção informam origem e beneficiários; a regeneração tem uma etapa de apresentação no início do turno.\n`);
  }
}

