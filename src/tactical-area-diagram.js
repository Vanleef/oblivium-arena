import {patternCells} from './tactical-board.js';

// A tiny tactical-grid legend, not an independent combat-area implementation.
// Reuse patternCells so diagonals, cones and area shapes mirror the actual rules.
const size=7,center={x:3,y:3};
const sandbox={tactical:{width:size,height:size,obstacles:[]}};
const key=point=>point.x+','+point.y;

export function tacticalAreaDiagram(spec,{movement=false,facing=[1,0],steps=1}={}){
 const direction=Array.isArray(facing)&&facing.length===2&&facing.every(Number.isInteger)
  &&(facing[0]||facing[1])?facing:[1,0];
 const cells=movement
  ?Array.from({length:49},(_,i)=>({x:i%size,y:Math.floor(i/size)})).filter(p=>{const distance=Math.max(Math.abs(p.x-center.x),Math.abs(p.y-center.y));return distance>0&&distance<=Math.min(3,Math.max(1,steps));})
  :(spec?patternCells(
    spec.pattern,center,
    spec.pattern==='self'||spec.pattern==='ring'?center:{
     x:Math.max(0,Math.min(size-1,center.x+direction[0]*Math.max(1,Math.min(3,spec.range||1)))),
     y:Math.max(0,Math.min(size-1,center.y+direction[1]*Math.max(1,Math.min(3,spec.range||1))))
    },
    direction,Math.max(1,spec.length||1),sandbox
   ):[]);
 const active=new Set(cells.map(key));
 return {size,pattern:movement?'move':spec?.pattern||'cell',
  cells:Array.from({length:size*size},(_,index)=>{
   const x=index%size,y=Math.floor(index/size);
   return x===center.x&&y===center.y?'origin':active.has(key({x,y}))?'hit':'empty';
  }),
  count:active.size
 };
}

export function tacticalAreaDiagramMarkup(spec,{movement=false,facing=[1,0],steps=1}={}){
 const diagram=tacticalAreaDiagram(spec,{movement,facing,steps});
 return '<span class="compact-area-mini" data-mini-pattern="'+diagram.pattern+'" aria-hidden="true">'
   +diagram.cells.map(state=>'<i data-mini-cell="'+state+'"></i>').join('')+'</span>';
}
