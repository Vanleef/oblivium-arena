import { augmentGlyph } from "./augment-cards.js";
// Only revealed nodes receive stable coordinates; there are no hidden placeholders.
export function trailLayout(nodes, seed=0) {
  const lastRow=Math.max(0,...nodes.map(n=>n.row)),height=Math.max(480,320+lastRow*142);
  const points=new Map(nodes.map(node=>{
    const drift=((Math.abs(Number(seed)||0)+node.row*17)%19)-9;
    return [node.id,{x:150+node.col*300+(node.col===1?drift*3:drift*1.5),y:height-118-node.row*142+(node.col===1?0:node.col===0?13:-10)}];
  }));
  return {height,points,lastRow};
}
export function trailCurve(from,to) {
  const bend=Math.max(40,Math.abs(from.y-to.y)*.48);
  return `M${from.x} ${from.y} C${from.x} ${from.y-bend},${to.x} ${to.y+bend},${to.x} ${to.y}`;
}
const nodeGlyphs={normal:'blade',elite:'crown',mini:'shield',boss:'rift',repair:'candle',treasure:'charge',event:'veil',shop:'shelter',upgrade:'metamorph'};
export function trailIcon(type){return augmentGlyph(nodeGlyphs[type]||'veil');}

