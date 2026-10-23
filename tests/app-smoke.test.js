import test from "node:test";
import assert from "node:assert/strict";
import { elos, starters } from "../src/data.js";
let draft=()=>{};
test('Codex encontra a identidade atual por seu nome novo ou anterior e mostra a lore individual',async()=>{
 const {app,handlers,click}=setup();await import('../src/main.js?identity-revision=1');click({tab:'codex'});
 for(const [queries,name,folder] of [
  [['O Surdo','O Silenciador'],'O Silenciador','revision-20261023'],
  [['O Estômago sem Fundo','O Abismo','O Insaciável'],'O Insaciável','elo-revision-20261023'],
  [['A Porta que Flutua','A Guardiã do Limiar','A Errante'],'A Errante',null],
  [['O Menino sem Sombra','O Desolador'],'O Desolador','elo-revision-20261023'],
  [['A Balança Vazia','A Usurária da Penúria','A Usurária'],'A Usurária','entity-revision-20261023'],
  [['O Lugar de Ninguém','O Obliterador'],'O Obliterador','entity-revision-20261023'],
  [['A Guardiã das Promessas','A Juramentada'],'A Juramentada',null],
  [['O Trono Vazio','O Suserano'],'O Suserano',null],
  [['A Pira Errante','A Vingadora'],'A Vingadora','spirit-revision-20261023'],
  [['O Jardim Morto','O Definhador'],'O Definhador','spirit-revision-20261023'],
  [['A Luz que Restaura','A Sanadora'],'A Sanadora','spirit-revision-20261023'],
  [['A Alma em Suspenso','O Ancorado'],'O Ancorado',null]


 ])for(const query of queries){
  handlers.input({target:{matches:()=>true,value:query,selectionStart:query.length}});
  assert.ok(app.innerHTML.includes(`<h3>${name}</h3>`),query);
  assert.match(app.innerHTML,/codex-lore/);
  if(folder)assert.ok(app.innerHTML.includes(`${folder}/portrait.webp`),query);
 }

});
function setup(save=null){const handlers={},app={innerHTML:"",addEventListener(type,handler){handlers[type]=handler;},querySelector(){return null;}};globalThis.document={querySelector:()=>app,body:{dataset:{}}};globalThis.localStorage={getItem:()=>save,setItem(){}};draft=()=>{const id=app.innerHTML.match(/data-world-event="([^"]+)"/)?.[1];if(id)handlers.click({target:{dataset:{worldEvent:id},closest(){return this;}}});};return {app,handlers,key:key=>handlers.keydown({key,preventDefault(){},target:{matches:()=>false}}),click:dataset=>handlers.click({target:{dataset,closest(){return this;}}})};}
test("interface esconde o futuro, seleciona habilidade e alvo e confirma a fila",async t=>{
 t.mock.timers.enable({apis:["setTimeout"]});t.mock.method(Math,"random",()=>.6);const {app,click}=setup();await import("../src/main.js?rework-smoke=1");
 click({startRun:"sangria"});assert.match(app.innerHTML,/Brasão do Elo Sangria/);assert.doesNotMatch(app.innerHTML,/map-illustration/);assert.equal(new Set([...app.innerHTML.matchAll(/data-node="([^"]+)"/g)].map(m=>m[1])).size,1);assert.doesNotMatch(app.innerHTML,/Guardião do Elo/);
 click({node:"0:0"});t.mock.timers.tick(500);draft();assert.match(app.innerHTML,/COMBATE TÁTICO 3v3/);assert.match(app.innerHTML,/FILA DO TURNO/);assert.equal((app.innerHTML.match(/data-use-skill=/g)||[]).length,12);
 click({useSkill:"o-escudo-vivo:impulso"});assert.match(app.innerHTML,/ALVO DESTACADO/);assert.match(app.innerHTML,/valid-target/);
 click({target:"oponente-0-0"});assert.match(app.innerHTML,/NA FILA/);assert.doesNotMatch(app.innerHTML,/O Escudo Vivo usa/);
 click({action:"review-turn"});assert.match(app.innerHTML,/Pronto para executar/);click({action:"commit-turn"});assert.match(app.innerHTML,/O Escudo Vivo usa/);
 for(let i=0;i<12;i++)t.mock.timers.tick(1500);
 assert.match(app.innerHTML,/TURNO 2/);assert.match(app.innerHTML,/SUA VEZ/);
 click({tab:"codex"});assert.match(app.innerHTML,/Manto de Cinzas/);assert.match(app.innerHTML,/passive.webp/);
});
test("O Fim mostra sua natureza sem rosto fixo e preserva a defesa de invulnerabilidade",async t=>{
 t.mock.timers.enable({apis:["setTimeout"]});const save=JSON.stringify({version:1,ownedIds:starters.map(c=>c.id),team:starters.map(c=>c.id),completedElos:elos.map(e=>e.id),xp:0,fragments:0,run:null});const {app,click}=setup(save);await import("../src/main.js?rework-final=1");click({finalBattle:""});draft();assert.match(app.innerHTML,/o-fim\/approved-elo-union-20261023\/portrait.webp/);click({target:"the-end"});assert.doesNotMatch(app.innerHTML,/o-fim\/anime-rift-revision/);assert.match(app.innerHTML,/Fim Inalcançável/);assert.match(app.innerHTML,/maior medo de quem o olha/);assert.match(app.innerHTML,/cada observador encara uma manifestação única/);for(const slot of ["fenda","decreto","coroa","despertar"]){click({inspectSkill:`the-end:${slot}`});assert.ok(app.innerHTML.includes(`/o-fim/approved-elo-union-20261023/skill-${slot}.webp`),slot);}assert.match(app.innerHTML,/RECARGA 4T/);assert.match(app.innerHTML,/skill-despertar.webp/);
});

test('Codex permite conhecer O Fim sem desbloquear a luta e respeita a busca e o reino',async()=>{
 const {app,handlers,click}=setup();await import('../src/main.js?fear-codex=1');click({tab:'codex'});
 const search=value=>handlers.input({target:{matches:()=>true,value,selectionStart:value.length}});
 search('O Fim');assert.match(app.innerHTML,/codex-entity/);assert.match(app.innerHTML,/não tem rosto nem forma fixos/);assert.match(app.innerHTML,/Nenhuma aparência é sua forma verdadeira/);assert.doesNotMatch(app.innerHTML,/data-final-battle/);
 const entity=app.innerHTML.match(/<article class="codex-entity"[\s\S]*?<\/article>/)?.[0];
 assert.ok(entity);assert.match(entity,/Habilidades de O Fim/);
 for(const [slot,name] of [['fenda','Fenda do Véu'],['decreto','Decreto do Fim'],['coroa','Coroa que Não Cai'],['despertar','Fim Inalcançável']]){assert.ok(entity.includes(name),name);assert.ok(entity.includes(`/approved-elo-union-20261023/skill-${slot}.webp`),slot);}
 assert.equal((entity.match(/data-codex-skill/g)||[]).length,4);assert.match(entity,/Custo: 1 Cinza \+ 1 Essência/);assert.match(entity,/Recarga 4T/);
 click({crewRealm:'Paraíso'});assert.doesNotMatch(app.innerHTML,/codex-entity/);
 click({crewRealm:'Inferno'});assert.match(app.innerHTML,/codex-entity/);
 search('O Devorador');assert.doesNotMatch(app.innerHTML,/codex-entity/);assert.match(app.innerHTML,/form-revision-20261023\/portrait.webp/);assert.match(app.innerHTML,/fera quadrúpede/);
});
test('escolha global persiste, bloqueia nova trilha até resgate e não duplica após recarregar',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 const {normalizeCampaign,createExpedition,completeExpedition}=await import('../src/progression.js');
 const {advanceTrail}=await import('../src/trail.js');
 const p=normalizeCampaign({version:1,ownedIds:starters.map(c=>c.id),team:starters.map(c=>c.id),completedElos:[],xp:0,fragments:0,run:null});
 const run=createExpedition(p,elos[0],'hunt',0,36);while(run.availableNodeIds.length)advanceTrail(run,run.availableNodeIds[0]);completeExpedition(p,run);
 const {app,click}=setup(JSON.stringify(p));let persisted=null;globalThis.localStorage.setItem=(_,v)=>{persisted=JSON.parse(v);};
 await import('../src/main.js?campaign-reward=1');assert.equal((app.innerHTML.match(/data-global-upgrade=/g)||[]).length,3);
 click({startRun:'sangria'});assert.doesNotMatch(app.innerHTML,/data-node=/);
 click({globalUpgrade:p.pendingGlobalReward.choices[0].id});assert.equal(persisted.pendingGlobalReward,null);assert.equal(persisted.globalUpgrades.length,1);assert.equal(persisted.ownedIds.length,4);
 setup(JSON.stringify(persisted));await import('../src/main.js?campaign-reload=1');
 const fresh=setup(JSON.stringify(persisted));await import('../src/main.js?campaign-reload=2');assert.doesNotMatch(fresh.app.innerHTML,/data-global-upgrade=/);assert.match(fresh.app.innerHTML,/Legados da Alma/);
 fresh.click({startRun:'sangria'});assert.match(fresh.app.innerHTML,/Ruptura 1/);
});

test('inspecionar técnica cinza não reserva uma ação e Escape fecha a revisão',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});t.mock.method(Math,'random',()=>.6);
 const {app,click,key}=setup();await import('../src/main.js?touch-inspect=1');click({startRun:'sangria'});click({node:'0:0'});t.mock.timers.tick(500);draft();
 click({useSkill:'o-escudo-vivo:impulso'});assert.match(app.innerHTML,/ALVO DESTACADO/);
 click({useSkill:'a-brasa-eterna:voto'});assert.match(app.innerHTML,/ENERGIA INSUFICIENTE/);assert.doesNotMatch(app.innerHTML,/class="[^"]*\svalid-target/);assert.doesNotMatch(app.innerHTML,/data-remove-action=/);
 click({action:'review-turn'});assert.match(app.innerHTML,/role="dialog"/);key('Escape');assert.doesNotMatch(app.innerHTML,/role="dialog"/);
});


test('Codex abre e fecha descrições por clique, Enter e Espaço sem perder a busca', async()=>{
 const {app,handlers,click}=setup();await import('../src/main.js?codex-description=1');click({tab:'codex'});
 assert.match(app.innerHTML,/data-codex-skill aria-expanded="false"/);
 const details={open:false},summary={dataset:{codexSkill:''},expanded:null,closest(selector){return selector==='details'?details:this;},setAttribute(key,value){this.expanded=value;},matches(selector){return selector==='[data-codex-skill]';}};
 let prevented=0;const event={target:summary,preventDefault(){prevented++;}};
 handlers.click(event);assert.equal(details.open,true);assert.equal(summary.expanded,'true');
 handlers.keydown({...event,key:'Enter'});assert.equal(details.open,false);assert.equal(summary.expanded,'false');
 handlers.keydown({...event,key:' '});assert.equal(details.open,true);assert.equal(prevented,3);
 assert.match(app.innerHTML,/Codex/);
});


test('metadados visuais do mundo não desviam o clique de alvo para a navegação',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});t.mock.method(Math,'random',()=>.6);
 const {app,click}=setup();await import('../src/main.js?visual-world-routing=1');
 click({startRun:'sangria'});click({node:'0:0'});t.mock.timers.tick(500);draft();
 click({useSkill:'o-escudo-vivo:impulso'});
 const tag=app.innerHTML.match(/<article[^>]*data-target="oponente-0-0"[^>]*>/)?.[0];assert.ok(tag);
 const dataset=Object.fromEntries([...tag.matchAll(/data-([\w-]+)="([^"]*)"/g)].map(([,k,v])=>[k.replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),v]));
 assert.equal(dataset.originRealm,'Inferno');assert.equal(dataset.realm,undefined);
 click(dataset);assert.match(app.innerHTML,/data-remove-action="o-escudo-vivo"/);
 assert.doesNotMatch(app.innerHTML,/<div data-realm="Inferno" class="arena-match/);
});


