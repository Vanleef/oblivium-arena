import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {characters,characterById,elos,realms,worldLeaders} from '../src/data.js';
import {campaignKingdoms,characterUnlockStatus,leaderUnlockStatus,trailVariants,MAX_CAMPAIGN_DIFFICULTY} from '../src/progression.js';
import {campaignArc} from '../src/story-content.js';
import {FINAL_BOSS} from '../src/final-boss.js';
import {localizeText} from '../src/i18n.js';
const empty=()=>({ownedIds:[],eloProgress:{},worldCampaigns:{}});

test('catálogo publicado cobre todo o elenco com os nomes, títulos e localização vigentes',async()=>{
 const catalog=JSON.parse(await readFile(new URL('../docs/CHARACTER_CATALOG.json',import.meta.url)));
 assert.equal(catalog.entries.length,150);assert.equal(characters.length,150);
 assert.equal(new Set(catalog.entries.map(c=>c.id)).size,150);
 for(const entry of catalog.entries){const c=characterById[entry.id];assert.ok(c);assert.equal(entry.name,c.name);assert.equal(entry.title,c.identityTitle);assert.equal(entry.kingdomId,c.kingdomId);assert.equal(entry.lore,c.lore||c.flavor);}
});

test('campanhas cobrem os 22 Reinos uma vez e oferecem entre duas e quatro trilhas',()=>{
 const routes=realms.flatMap(w=>campaignKingdoms(w.id));
 assert.equal(routes.length,22);assert.equal(new Set(routes.map(k=>k.id)).size,elos.length);
 for(const k of routes){const variants=trailVariants({eloProgress:{[k.id]:{wins:1}}},k);assert.ok(variants.length>=2&&variants.length<=4);}
 for(const c of characters){const u=characterUnlockStatus(empty(),c.id);assert.ok(u.leader||u.starter||(u.kingdomId&&Number.isInteger(u.difficulty)&&u.difficulty<=MAX_CAMPAIGN_DIFFICULTY),c.id);}
});

test('três líderes só são liberados com campanha completa e confronto final na maior dificuldade',()=>{
 assert.deepEqual(Object.values(worldLeaders).map(l=>[l.name,l.title]),[['Niith','O Fim'],['Seraph','O Prólogo'],['Zalmoxis','A Abnegação']]);
 for(const l of Object.values(worldLeaders)){
  const p=empty(),route=campaignKingdoms(l.realmId);
  p.worldCampaigns[l.realmId]={bossClearedDifficulties:[MAX_CAMPAIGN_DIFFICULTY]};
  for(const k of route)p.eloProgress[k.id]={clearedDifficulties:[MAX_CAMPAIGN_DIFFICULTY-1]};
  assert.equal(leaderUnlockStatus(p,l.rosterId).unlocked,false);
  for(const k of route)p.eloProgress[k.id].clearedDifficulties.push(MAX_CAMPAIGN_DIFFICULTY);
  assert.equal(leaderUnlockStatus(p,l.rosterId).unlocked,true);
  p.worldCampaigns[l.realmId].bossClearedDifficulties=[];
  assert.equal(leaderUnlockStatus(p,l.rosterId).unlocked,false);
  assert.ok(campaignArc(l.realmId).finale.includes(l.name));
 }
});

test('lore mantém a absorção involuntária de Nilo e traduz as identidades canônicas',()=>{
 assert.match(characterById.nilo.lore,/involuntariamente/);
 for(const id of ['nilo','o-que-pesa',...Object.values(worldLeaders).map(l=>l.rosterId)]){
  const c=characterById[id];assert.notEqual(localizeText(c.lore,'en'),c.lore,id);
  assert.doesNotMatch(c.lore,/Naram-Sin|Elaris|Zoen|Coroa/);
 }
 assert.equal(FINAL_BOSS.name,'A Fenda Final');
 assert.ok(!Object.values(worldLeaders).some(l=>l.rosterId===FINAL_BOSS.id));
});
