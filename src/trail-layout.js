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
const icons={
  normal:'<path d="m8 5 13 13m-3-1 4 5m-7-2 5-5M24 5 11 18m3-1-4 5m7-2-5-5M6 3l4 1-5 5-1-4Zm20 0-4 1 5 5 1-4Z"/>',
  elite:'<path d="m8 8 3 3 5-6 5 6 3-3-2 9H10ZM10 17v5l6 5 6-5v-5M12 21h1m6 0h1m-5 3h2"/>',
  mini:'<path d="M8 27h16M10 27V13h12v14M8 7h4v4h3V7h3v4h3V7h3v6H8Zm6 20v-7h4v7"/>',
  boss:'<path d="M7 27V13q9-17 18 0v14M12 27V14q4-8 8 0v13M4 27h24M3 8l4 2m22-2-4 2M16 1v4"/><path d="m16 18 2 3-2 3-2-3Z"/>',
  repair:'<path d="M6 27h20M10 27v-9h12v9M12 18v-5h8v5M16 12c-6-4-2-9 1-12-1 5 7 8-1 12Z"/>',
  treasure:'<path d="m4 11 6-7h12l6 7-12 17Zm0 0h24M10 4l-2 7 8 17 8-17-2-7M8 11h16M16 4l-4 7 4 17 4-17Z"/>',
  event:'<path d="M7 6q9 6 18 0v11q-1 7-9 11-8-4-9-11ZM10 13l4 1m4 0 4-1m-10 7q4-3 8 0"/>',
  shop:'<path d="M5 13h22l-3-8H8ZM7 13v14h18V13M4 27h24M13 27v-9h6v9M5 13q3 5 6 0 3 5 6 0 3 5 6 0 3 5 4 0"/>',
  upgrade:'<path d="m16 3 4 9 9 4-9 4-4 9-4-9-9-4 9-4Z"/><path d="M16 10v12m-6-6h12"/>'
};
export function trailIcon(type) {
  return `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icons[type]||icons.event}</svg>`;
}
