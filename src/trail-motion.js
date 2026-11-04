// Link the two visible representations of a passage without rerendering the map.
export function highlightTrailChoice(root,id){
  for(const node of root.querySelectorAll('[data-route-preview]'))node.classList.toggle('route-preview',Boolean(id&&node.dataset.routePreview===id));
  for(const edge of root.querySelectorAll('[data-route-edge]'))edge.classList.toggle('route-preview',Boolean(id&&edge.dataset.routeEdge===id));
}

