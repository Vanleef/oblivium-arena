export function normalizeTrail(run) {
  const nodes=run.map.flat(), ids=new Set(nodes.map(n=>n.id));
  run.clearedNodeIds=[...new Set(run.clearedNodeIds||[])].filter(id=>ids.has(id));
  run.availableNodeIds=(run.availableNodeIds||run.map[run.stage]?.map(n=>n.id)||[]).filter(id=>ids.has(id));
  run.revealedNodeIds=[...new Set([...(run.revealedNodeIds||[]),...run.clearedNodeIds,...run.availableNodeIds,...run.map[0].map(n=>n.id)])].filter(id=>ids.has(id));
  return run;
}
export function visibleTrail(run) {
  normalizeTrail(run);
  const revealed=new Set(run.revealedNodeIds),cleared=new Set(run.clearedNodeIds),available=new Set(run.availableNodeIds);
  const nodes=run.map.flat().filter(n=>revealed.has(n.id));
  const edges=nodes.flatMap(node=>cleared.has(node.id) ? node.nextIds.filter(id=>revealed.has(id)).map(id=>({from:node,to:nodes.find(n=>n.id===id),active:available.has(id),traveled:cleared.has(id)})) : []);
  return {nodes,edges,cleared,available,lastRow:Math.max(0,...nodes.map(n=>n.row))};
}
export function advanceTrail(run,nodeId) {
  normalizeTrail(run);
  const current=run.map.flat().find(n=>n.id===nodeId);
  if(!current || !run.availableNodeIds.includes(nodeId) || run.clearedNodeIds.includes(nodeId)) return {ok:false,newIds:[]};
  const old=new Set(run.revealedNodeIds);
  run.clearedNodeIds.push(current.id);
  run.availableNodeIds=[...current.nextIds];
  run.revealedNodeIds=[...new Set([...run.revealedNodeIds,...current.nextIds])];
  run.stage=current.row+1;
  run.currentNodeId=null;
  return {ok:true,current,newIds:current.nextIds.filter(id=>!old.has(id))};
}
