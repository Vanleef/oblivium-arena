const query=new URLSearchParams(globalThis.location?.search||'');
// The compact round planner is the default. Previous laboratories stay explicit.
if(query.has('fortress')||query.has('classic'))await import('./tactical-demo.js');
else await import('./compact-demo.js');
