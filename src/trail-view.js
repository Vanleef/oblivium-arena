import { characterById } from "./data.js";
import { difficultyName, runMaxHp } from "./progression.js";
import { visibleTrail } from "./trail.js";
import { eloCrest } from "./crests.js";
import { esc, portraitMarkup } from "./view-utils.js";
import { trailLayout, trailCurve, trailIcon } from "./trail-layout.js";

const labels={normal:"Combate",elite:"Elite",mini:"Guardião menor",boss:"Guardião",repair:"Descanso",treasure:"Tesouro",event:"Encontro",shop:"Mercador",upgrade:"Eco"};
const rewards={normal:"Fragmentos",elite:"Eco + fragmentos",mini:"Eco + fragmentos",boss:"Recrute uma alma",repair:"Vida + Correntes",treasure:"Eco + fragmentos",event:"Uma decisão",shop:"Cura e Ecos",upgrade:"Escolha um Eco"};
const number=n=>String(n).padStart(2,"0");

function partyMarkup(run,profile,teamHealth){
  return `<section class="journey-party" aria-label="Trio da travessia"><div class="journey-section-label">SEU TRIO</div><div>${(run.team||[]).map(id=>{
    const c=characterById[id];if(!c)return "";
    const max=runMaxHp(profile,run,id),hp=Math.max(0,Math.min(max,teamHealth?.[id]??run.teamHealth?.[id]??max));
    return `<article class="journey-soul" title="${esc(c.name)} · ${hp}/${max} Vida">${portraitMarkup(c,"journey-portrait")}<div><b>${esc(c.name)}</b><span class="journey-health"><i style="width:${hp/max*100}%"></i></span><small>${hp}<span> / ${max}</span></small></div></article>`;
  }).join("")}</div></section>`;
}

function councilMarkup(nodes,available,run,ownedIds){
  if(!nodes.some(n=>n.type==="boss"&&available.has(n.id)))return "";
  const council=(run.bossIds||[]).map(id=>characterById[id]).filter(Boolean);
  return `<section class="council-reveal journey-council" aria-label="Conselho final revelado"><div class="journey-section-label">CONSELHO REVELADO</div><div class="council-members">${council.map(c=>`<article class="color-${esc(c.color)} ${ownedIds.includes(c.id)?"council-owned":""}">${portraitMarkup(c,"council-portrait")}<div><b>${esc(c.name)}</b><small>${ownedIds.includes(c.id)?"JÁ RECRUTADA":"PODE SER RECRUTADA"}</small></div></article>`).join("")}</div><p>Uma dessas almas se une ao seu trio após a vitória.</p></section>`;
}

export function renderTrail(run,elo,fx,buffs,ownedIds=[],options={}){
  const {nodes,edges,cleared,available}=visibleTrail(run),{height,points}=trailLayout(nodes,run.seed);
  const completed=run.stage>=run.map.length,choices=nodes.filter(n=>available.has(n.id)&&!completed),locked=Boolean(options.busy||options.pending);
  const step=Math.min(run.stage+1,run.map.length),profile=options.profile||{};
  return `<section class="run-panel journey-shell color-${esc(elo.color)} ${fx?`trail-fx-${esc(fx.kind)}`:""}" aria-label="Trilha de ${esc(elo.name)}">
    <header class="journey-heading"><div><div class="eyebrow">${esc(elo.realm.toUpperCase())} <span>/</span> ${difficultyName(run.difficulty||0).toUpperCase()}</div><h3>${esc(run.variantTitle||elo.name)}</h3></div><div class="journey-progress"><span>TRAVESSIA <b>${number(step)} <i>/ ${number(run.map.length)}</i></b></span><div aria-label="${run.stage} de ${run.map.length} etapas concluídas">${run.map.map((_,i)=>`<i class="${i<run.stage?"done":i===run.stage?"current":""}"></i>`).join("")}</div></div></header>
    <div class="journey-layout">
      <div class="journey-atlas">
        <div class="journey-atmosphere" aria-hidden="true"><i class="journey-orbit orbit-one"></i><i class="journey-orbit orbit-two"></i>${eloCrest(elo,"journey-crest")}<span class="journey-elo-name">${esc(elo.name)}</span><div class="journey-motes"><i></i><i></i><i></i><i></i><i></i></div></div>
        <div class="journey-map" tabindex="0" role="region" aria-label="Percurso revelado de ${esc(elo.name)}"><div class="journey-canvas" style="height:${height}px">
          <div class="journey-veil" aria-hidden="true"><span>ALÉM DO VÉU</span><i></i></div>
          <svg class="journey-paths" viewBox="0 0 900 ${height}" preserveAspectRatio="none" aria-hidden="true">${edges.map(e=>`<path class="journey-thread ${e.active?"available":""} ${e.traveled?"traveled":""} ${fx?.newIds?.includes(e.to.id)?"edge-reveal":""}" d="${trailCurve(points.get(e.from.id),points.get(e.to.id))}"/>`).join("")}</svg>
          ${nodes.map(node=>{
            const point=points.get(node.id),done=cleared.has(node.id),active=available.has(node.id)&&!completed,selected=run.currentNodeId===node.id,index=choices.findIndex(n=>n.id===node.id),kind=labels[node.type]||node.label;
            return `<button class="journey-node type-${esc(node.type)} ${done?"done":active?"active":"skipped"} ${selected?"selected":""} ${fx?.newIds?.includes(node.id)?"node-reveal":""}" style="left:${point.x/9}%;top:${point.y}px;--reveal-delay:${Math.max(0,index)*100}ms" ${active&&!locked?`data-node="${esc(node.id)}"`:"disabled"} data-waypoint="${esc(node.id)}" aria-label="${esc(`${node.label}, ${kind}. ${done?"Concluído":active?"Disponível":"Desvio não escolhido"}. ${node.desc}`)}"><span class="waypoint-disc">${trailIcon(node.type)}</span>${done?'<span class="waypoint-done" aria-hidden="true">✓</span>':active?`<span class="waypoint-number" aria-hidden="true">${number(index+1)}</span>`:""}<b>${esc(node.label)}</b>${selected?'<small>EM CURSO</small>':active?'<small>DISPONÍVEL</small>':""}</button>`;
          }).join("")}
          <span class="journey-origin" style="top:${height-44}px" aria-hidden="true">${cleared.size?"CAMINHO PERCORRIDO":"INÍCIO DA TRAVESSIA"}</span>
        </div></div>
        <div class="journey-map-caption"><span><i></i> ${choices.length} ${choices.length===1?"passagem aberta":"passagens abertas"}</span><span>${esc(elo.name)} <b>✦</b></span></div>
      </div>
      <aside class="journey-sidebar" aria-label="Escolhas da trilha"><div class="journey-choice-heading"><div class="journey-section-label">${completed?"TRAVESSIA CONCLUÍDA":choices.length===1?"PRÓXIMO ENCONTRO":"ESCOLHA SUA PASSAGEM"}</div><h4>${completed?"O Elo cedeu.":choices.length===1?"O caminho se abre.":"Cada escolha, um destino."}</h4></div>
        <div class="journey-choices">${choices.map((node,index)=>`<button class="journey-choice type-${esc(node.type)} ${run.currentNodeId===node.id?"in-progress":""}" ${!locked?`data-node="${esc(node.id)}"`:"disabled"} aria-label="${run.currentNodeId===node.id?"Continuar":"Entrar em"} ${esc(node.label)}"><span class="choice-emblem">${trailIcon(node.type)}<i>${number(index+1)}</i></span><span class="choice-copy"><small>${esc(labels[node.type]||node.type)}</small><b>${esc(node.label)}</b><span>${esc(node.desc)}</span><em>${esc(rewards[node.type]||"Descubra o encontro")}</em></span><span class="choice-arrow" aria-hidden="true">↗</span></button>`).join("")}</div>
        ${councilMarkup(nodes,available,run,ownedIds)}
        ${partyMarkup(run,profile,options.teamHealth)}
      </aside>
    </div>
    <div class="journey-notice-slot">${fx?`<div class="trail-feedback journey-feedback" role="status" aria-live="polite"><span>${fx.kind==="travel"?"↝":fx.kind==="failure"?"⨯":"✦"}</span><div><b>${esc(fx.title)}</b><small>${esc(fx.summary)}</small></div></div>`:""}</div>
    <footer class="run-footer journey-footer"><details class="run-echoes"><summary>ECOS <b>${run.buffs.length}</b><span>⌄</span></summary><div class="echo-popover">${run.buffs.length?run.buffs.map(id=>{const buff=buffs.find(b=>b.id===id);return buff?`<article><span>${buff.icon}</span><div><b>${esc(buff.title)}</b><p>${esc(buff.text)}</p></div></article>`:"";}).join(""):'<p>Nenhum Eco coletado.</p>'}</div></details><button class="text-button" data-abandon-run>ABANDONAR TRILHA</button></footer>
  </section>`;
}
