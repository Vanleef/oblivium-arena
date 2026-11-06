import {planTacticalAIActivation,planTacticalAI} from './tactical-ai.js';

self.addEventListener('message',event=>{
 const {id,view}=event.data;
 try{self.postMessage({id,plan:view.tactical.compact?planTacticalAI(view):planTacticalAIActivation(view)});}
 catch{self.postMessage({id,failed:true});}
});
