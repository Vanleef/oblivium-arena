import test from 'node:test';
import assert from 'node:assert/strict';
import {elos,buffs,starters} from '../src/data.js';
import {normalizeCampaign,createExpedition} from '../src/progression.js';
import {advanceTrail,visibleTrail} from '../src/trail.js';
import {renderTrail} from '../src/trail-view.js';
import {trailLayout,trailCurve,trailIcon} from '../src/trail-layout.js';
import {highlightTrailChoice} from '../src/trail-motion.js';
const profile=()=>normalizeCampaign({ownedIds:starters.map(c=>c.id),team:starters.map(c=>c.id),completedElos:[]});
const nodeIds=html=>new Set([...html.matchAll(/data-node="([^"]+)"/g)].map(m=>m[1]));

test('o atlas e as escolhas laterais só permitem os nós liberados, durante toda a trilha',()=>{
 for(const elo of elos){
  const p=profile();p.eloProgress[elo.id].wins=1;const run=createExpedition(p,elo,'hunt',0,135);
  while(run.availableNodeIds.length){
   const html=renderTrail(run,elo,null,buffs,p.ownedIds),visible=visibleTrail(run);
   assert.deepEqual(nodeIds(html),new Set(run.availableNodeIds));
   const waypoints=[...html.matchAll(/data-waypoint="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(new Set(waypoints),new Set(visible.nodes.map(n=>n.id)));
   for(const n of run.map.flat().filter(n=>!run.revealedNodeIds.includes(n.id)))assert.ok(!html.includes(n.id),'Nó futuro vazou');
   if(run.stage<6)assert.doesNotMatch(html,/council-portrait/);
   advanceTrail(run,run.availableNodeIds[0]);
  }
 }
});

test('as curvas se conectam ao centro correto dos nós e a progressão sobe pelo brasão',()=>{
 const p=profile(),run=createExpedition(p,elos[0],'hunt',0,135);
 for(let step=0;step<7;step++){
  const {nodes,edges}=visibleTrail(run),layout=trailLayout(nodes,run.seed),html=renderTrail(run,elos[0],null,buffs);
  assert.equal(layout.points.size,nodes.length);
  for(const {from,to}of edges){const a=layout.points.get(from.id),b=layout.points.get(to.id);assert.ok(b.y<a.y);assert.ok(html.includes(`d="${trailCurve(a,b)}"`));}
  for(const point of layout.points.values()){assert.ok(point.x>=120&&point.x<=780);assert.ok(point.y>100&&point.y<layout.height-70);}
  if(run.availableNodeIds.length)advanceTrail(run,run.availableNodeIds[0]);
 }
 assert.equal(new Set(['normal','elite','mini','boss','repair','treasure','event','shop','upgrade'].map(trailIcon)).size,9);
});

test('travessia em animação ou decisão pendente desabilita mapa e escolhas laterais',()=>{
 const p=profile(),run=createExpedition(p,elos[0],'hunt',0,135);
 for(const options of [{busy:true},{pending:true}]){const html=renderTrail(run,elos[0],null,buffs,p.ownedIds,options);assert.equal(nodeIds(html).size,0);assert.match(html,/journey-choice[^>]*disabled/);}
});

test('o trio da trilha usa Vida atual, limites dos Legados e texto escapado',()=>{
 const p=profile();p.globalUpgrades=[{effect:{maxHp:10}}];
 const run=createExpedition(p,elos[0],'hunt',0,135),id=run.team[0];run.variantTitle='<Caçada>';
 const html=renderTrail(run,elos[0],null,buffs,p.ownedIds,{profile:p,teamHealth:{[id]:73}});
 assert.match(html,/73\/110 Vida/);assert.match(html,/&lt;Caçada&gt;/);assert.doesNotMatch(html,/<Caçada>/);
});

test('foco de passagem liga somente o nó, a escolha e a conexão correspondente sem alterar a trilha',()=>{
 const p=profile(),run=createExpedition(p,elos[0],'hunt',0,135);advanceTrail(run,run.availableNodeIds[0]);
 const html=renderTrail(run,elos[0],null,buffs),before=JSON.stringify(run),chosen=run.availableNodeIds[1];
 const element=(field,id)=>({dataset:{[field]:id},active:false,classList:{toggle(_,value){this.owner.active=value;}}});
 const nodes=[...html.matchAll(/data-route-preview="([^"]+)"/g)].map(m=>element('routePreview',m[1]));
 const edges=[...html.matchAll(/data-route-edge="([^"]+)"/g)].map(m=>element('routeEdge',m[1]));
 for(const node of [...nodes,...edges])node.classList.owner=node;
 const root={querySelectorAll:selector=>selector==='[data-route-preview]'?nodes:edges};
 highlightTrailChoice(root,chosen);assert.equal(nodes.filter(n=>n.active).length,2);assert.equal(edges.filter(n=>n.active).length,1);
 assert.ok([...nodes,...edges].filter(n=>n.active).every(n=>(n.dataset.routePreview||n.dataset.routeEdge)===chosen));
 highlightTrailChoice(root,null);assert.ok([...nodes,...edges].every(n=>!n.active));assert.equal(JSON.stringify(run),before);
});
