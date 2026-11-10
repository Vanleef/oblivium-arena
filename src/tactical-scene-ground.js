import {combatScene} from './combat-scenes.js';
const ground={limbo:[4/3,.44,.30],inferno:[1.5,.30,.48],paraiso:[1.5,.29,.49],
 'inferno-ossuary':[1672/941,.40,.39],'paraiso-gardens':[1672/941,.44,.36],'limbo-aqueronte':[1672/941,.42,.36]};
// Reconstructed visual continuity from the earlier chat; no old engine is copied.
export class TacticalSceneGround {
 constructor(){this.observers=[];}
 clear(){for(const observer of this.observers)observer.disconnect();this.observers=[];}
 sync(root){
  this.clear();
  for(const container of root.querySelectorAll?.('.compact-stage,.online-combat,.online-replay')||[]){
   const board=container.querySelector('.compact-board,.online-board');
   const node=container.matches('.compact-stage')?container:container.querySelector('.online-battle-scene');
   if(!board||!node)continue;
   const scene=combatScene(node.dataset.scene),[aspect,top,span]=ground[scene.id];
   const update=()=>{
    const outer=container.getBoundingClientRect(),field=board.getBoundingClientRect();
    if(!outer.width||!field.width||!field.height)return;
    const center=field.left-outer.left+field.width/2;
    const height=Math.max(field.height/span,2*Math.max(center,outer.width-center)/aspect),width=height*aspect;
    container.style.setProperty('--arena-ground-image',`url("${scene.art}")`);
    container.style.setProperty('--arena-ground-size',`${width}px ${height}px`);
    container.style.setProperty('--arena-ground-position',`${center-width/2}px ${field.top-outer.top-top*height}px`);
    container.dataset.groundScene=scene.id;
   };
   update();
   if(globalThis.ResizeObserver){const observer=new ResizeObserver(update);observer.observe(container);observer.observe(board);this.observers.push(observer);}
  }
 }
}
