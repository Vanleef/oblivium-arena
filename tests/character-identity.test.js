import test from 'node:test';
import assert from 'node:assert/strict';
import {characters,characterById,elos} from '../src/data.js';
import {characterRevisions} from '../src/character-identity.js';
import {normalizeCampaign} from '../src/progression.js';
import {createBattle,createEnemyTeam} from '../src/combat.js';

test('nomes revistos preservam a posse e o trio de um progresso salvo com IDs anteriores',()=>{
  const ids=Object.keys(characterRevisions),team=['a-senhora-do-ultimo-pao','o-surdo','o-quarto-vazio'];
  const saved={version:1,ownedIds:ids,team,completedElos:[],xp:1200,fragments:73,run:null};
  const profile=normalizeCampaign(JSON.parse(JSON.stringify(saved)));
  assert.deepEqual(profile.team,team);
  for(const id of ids)assert.ok(profile.ownedIds.includes(id),id);
  const reloaded=normalizeCampaign(JSON.parse(JSON.stringify(profile)));
  assert.deepEqual(reloaded.team,team);assert.equal(reloaded.fragments,73);
  const battle=createBattle(team,[{id:'alvo',name:'Alvo',realm:'Inferno',abilities:[]}],{rng:()=>0});
  assert.deepEqual(battle.allies.map(c=>c.name),team.map(id=>characterById[id].name));
});

test('formas alternativas e suas instruções usam o mesmo vocabulário da técnica renomeada',()=>{
  const witness=characterById['o-que-observou'];
  assert.equal(witness.abilities[2].name,'Peso da Indiferença');
  assert.equal(witness.abilities[2].forms[0].name,'Retaliação do Espectador');
  assert.match(witness.abilities[1].description,/Peso da Indiferença vira Retaliação do Espectador/);
  assert.doesNotMatch(witness.abilities[1].description,/Peso do Testemunho|Resposta da Testemunha/);
  assert.match(characterById['o-surdo'].abilities[1].description,/Clamor sem Retorno/);
  assert.match(characterById['a-costureira'].abilities[1].description,/Reforçar os Pontos/);
  const deserter=characterById['o-vigia-ausente'];
  assert.match(deserter.abilities[1].description,/Cobrar o Abandono vira Golpe da Retaguarda/);
  assert.match(deserter.abilities[2].forms[0].description,/restaura Cobrar o Abandono/);
  const arbiter=characterById['o-equilibrio'];
  assert.match(arbiter.abilities[1].description,/vira Resposta Equânime/);
  assert.match(arbiter.abilities[1].forms[0].description,/restaura Amparo Equânime/);
  assert.match(characterById['o-menino-sem-sombra'].abilities[1].description,/vira Recolher a Presença/);
  const resentful=characterById['o-filho-da-cinza'];
  assert.match(resentful.abilities[0].description,/vira Rancor Reaceso/);
  assert.doesNotMatch(resentful.abilities[0].description,/Ressurgir do Carvão/);
  const oath=characterById['a-guardia-das-promessas'];
  assert.equal(oath.abilities[1].forms[0].name,'Renovar o Pacto');
  assert.match(oath.abilities[1].forms[0].description,/restaura Honrar o Pacto/);
  const avenger=characterById['a-pira-errante'];
  assert.equal(avenger.abilities[0].forms[0].name,'Revanche Ardente');
  assert.match(avenger.abilities[0].forms[0].description,/restaura Brasa Punitiva/);
  const morph=characterById['a-pele-alheia'];
  assert.match(morph.abilities[1].description,/até usar Descartar o Molde/);
  assert.match(morph.abilities[1].forms[0].description,/restaura Gume Mutável/);
  assert.match(morph.abilities[1].forms[0].description,/restaura Pele Usurpada/);
  const nullifier=characterById['o-que-apaga'];
  assert.match(nullifier.abilities[0].description,/Vira Anulação Definitiva/);
  assert.match(nullifier.abilities[0].forms[0].description,/restaura Marca da Anulação/);



});

test('elenco exposto e trios inimigos mostram os nomes atuais com referências estáveis',()=>{
  assert.equal(characters.length,100);assert.equal(new Set(characters.map(c=>c.id)).size,100);
  for(const elo of elos){
    assert.deepEqual(elo.forms,characters.filter(c=>c.eloId===elo.id).map(c=>c.name));
    for(const enemy of createEnemyTeam(elo,[],'elite',0))
      assert.equal(enemy.name,`Elite · ${characterById[enemy.sourceId].name}`);
  }
  for(const c of characters){assert.equal(c.abilities.length,4);assert.equal(c.abilities[3].cooldown,4);}
});

