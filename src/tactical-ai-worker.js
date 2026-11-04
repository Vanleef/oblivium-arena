import {planTacticalAIActivation} from './tactical-ai.js';

self.addEventListener('message',event=>{
 const {id,view}=event.data;
 try{self.postMessage({id,plan:planTacticalAIActivation(view)});}
 catch{self.postMessage({id,failed:true});}
});
