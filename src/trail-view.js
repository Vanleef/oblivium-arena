import { difficultyName } from "./progression.js";
import { visibleTrail } from "./trail.js";
import { eloCrest } from "./crests.js";
import { esc } from "./view-utils.js";
const labels={normal:"Combate",elite:"Elite",mini:"Guardião menor",boss:"Guardião",repair:"Descanso",treasure:"Tesouro",event:"Evento",shop:"Mercador",upgrade:"Eco"};
export function renderTrail(run,elo,fx,buffs){
  const {nodes,edges,cleared,available,lastRow}=visibleTrail(run),height=Math.max(330,(lastRow+1)*124+104),x=n=>150+n.col*300,y=n=>92+n.row*124;
  const completed=run.stage>=run.map.length;
  return `<section class="run-panel color-${esc(elo.color)} ${fx?`trail-fx-${fx.kind}`:""}">
    <div class="run-heading"><div><div class="eyebrow">TRAVESSIA · ${esc(elo.realm.toUpperCase())}</div><h3>${esc(run.variantTitle||elo.name)}</h3><span class="run-difficulty">${difficultyName(run.difficulty||0)}</span></div><div class="run-strength">${eloCrest(elo,"run-crest")}<span><small>CORRENTES DA ALMA</small><b>${run.stability}/${run.maxStability}</b></span></div></div>
    ${fx ? `<div class="trail-feedback" role="status" aria-live="polite"><span>${fx.kind==="travel"?"↝":fx.kind==="reward"?"✦":"✧"}</span><div><b>${esc(fx.title)}</b><small>${esc(fx.summary)}</small></div></div>` : ""}
    <div class="path-guide"><span>CAMINHO REVELADO</span><span>${available.size} ${available.size===1?"encontro disponível":"escolhas disponíveis"} · passo ${Math.min(run.stage+1,run.map.length)} / ${run.map.length}</span></div>
    <div class="path-map crest-trail"><div class="path-canvas" style="height:${height}px">
      ${eloCrest(elo,"elo-crest-watermark")}
      <svg class="path-lines" viewBox="0 0 900 ${height}" preserveAspectRatio="none" aria-hidden="true">${edges.map(e=>`<path class="path-edge ${e.active?"available":""} ${e.traveled?"traveled":""} ${fx?.newIds?.includes(e.to.id)?"edge-reveal":""}" d="M${x(e.from)} ${y(e.from)} C${x(e.from)} ${y(e.from)+64},${x(e.to)} ${y(e.to)-64},${x(e.to)} ${y(e.to)}"/>`).join("")}</svg>
      <div class="path-grid">${nodes.map((node,index)=>{
        const done=cleared.has(node.id),active=available.has(node.id)&&!completed,selected=run.currentNodeId===node.id,newNode=fx?.newIds?.includes(node.id),kind=labels[node.type]||node.label;
        return `<button class="path-node type-${esc(node.type)} ${done?"done":active?"active":"skipped"} ${selected?"selected":""} ${newNode?"node-reveal":""}" style="left:${(x(node)/9).toFixed(4)}%;top:${y(node)-28}px;--reveal-delay:${index%3*110}ms" ${active?`data-node="${esc(node.id)}"`:"disabled"} aria-label="${esc(`${node.label}, ${kind}. ${done?"Concluído":active?"Disponível":"Desvio não escolhido"}. ${node.desc}`)}" title="${esc(node.desc)}"><span class="node-icon">${done?"✓":node.icon}</span><b>${esc(node.label)}</b><small>${done?"CONCLUÍDO":selected?"EM CURSO":active?kind.toUpperCase():"DESVIO"}</small></button>`;
      }).join("")}</div>
      <div class="trail-horizon" style="top:${y({row:lastRow})+86}px"><span>◇</span><small>${completed?"TRAVESSIA CONCLUÍDA":"Véu não explorado"}</small></div>
    </div></div>
    <div class="run-footer"><span>ECOS <b>${run.buffs.length}</b></span><span class="buff-list">${run.buffs.map(id=>`<i title="${esc(buffs.find(b=>b.id===id)?.title||id)}">✧</i>`).join("")||"Nenhum Eco coletado"}</span><button class="text-button" data-abandon-run>ABANDONAR TRILHA</button></div>
  </section>`;
}
