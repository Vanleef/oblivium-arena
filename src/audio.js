const KEY='pma-audio-enabled-v1';
let context=null,master=null,ambience=null;
export function audioEnabled(){try{return localStorage.getItem(KEY)!=='off';}catch{return true;}}
export function setAudioEnabled(enabled){try{localStorage.setItem(KEY,enabled?'on':'off');}catch{}if(enabled)startAmbience();else stopAmbience();}
function setup(){if(typeof window==='undefined'||!window.AudioContext)return null;context||=new AudioContext();if(!master){master=context.createGain();master.gain.value=.14;master.connect(context.destination);}if(context.state==='suspended')context.resume().catch(()=>{});return context;}
function tone(freq,duration,{wave='sine',gain=.12,detune=0,delay=0}={}){const c=setup();if(!c||!audioEnabled())return;const osc=c.createOscillator(),amp=c.createGain(),filter=c.createBiquadFilter();osc.type=wave;osc.frequency.setValueAtTime(freq,c.currentTime+delay);osc.detune.value=detune;filter.type='lowpass';filter.frequency.value=1800;amp.gain.setValueAtTime(.0001,c.currentTime+delay);amp.gain.exponentialRampToValueAtTime(gain,c.currentTime+delay+.04);amp.gain.exponentialRampToValueAtTime(.0001,c.currentTime+delay+duration);osc.connect(filter);filter.connect(amp);amp.connect(master);osc.start(c.currentTime+delay);osc.stop(c.currentTime+delay+duration+.03);}
export function playSfx(kind='click'){if(!audioEnabled())return;const notes={click:[[420,.08]],cast:[[180,.12],[360,.18]],impact:[[100,.16],[145,.12]],heal:[[520,.18],[780,.24]],reactive:[[260,.13],[610,.2]],form:[[125,.22],[250,.3],[500,.34]],unlock:[[392,.18],[523,.2],[784,.3]],step:[[220,.12],[330,.16]]};for(const [i,[freq,duration]]of(notes[kind]||notes.click).entries())tone(freq,duration,{wave:kind==='impact'?'triangle':'sine',gain:kind==='impact'?.18:.09,delay:i*.085});}
export function startAmbience(){if(!audioEnabled()||ambience)return;const c=setup();if(!c)return;const freqs=[55,82.41,110],nodes=freqs.map((f,i)=>{const osc=c.createOscillator(),gain=c.createGain(),filter=c.createBiquadFilter();osc.type='sine';osc.frequency.value=f;filter.type='lowpass';filter.frequency.value=260;gain.gain.value=i===0?.12:.045;osc.connect(filter);filter.connect(gain);gain.connect(master);osc.start();return{osc,gain};});ambience=nodes;}
export function stopAmbience(){if(!ambience)return;for(const node of ambience){node.gain.gain.setTargetAtTime(.0001,context.currentTime,.3);node.osc.stop(context.currentTime+1);}ambience=null;}

// Short, layered cues for the tactical replay. The existing game-wide mute controls them.
export function playCombatCue(kind,family='strike'){
 if(!audioEnabled())return;
 if(kind==='prepare'){
  tone(wardTone(family)?284:112,.19,{gain:.05,wave:'triangle'});
  return;
 }
 if(kind==='super'){
  // A compact two-layer fighting-game activation sting; the sprite remains on stage.
  tone(88,.18,{gain:.12,wave:'triangle'});
  tone(176,.22,{gain:.065,wave:'sawtooth',delay:.035});
  return;
 }
 if(kind==='contact'&&wardTone(family)){
  tone(family==='support'?520:248,.24,{gain:.11,wave:'triangle'});
  tone(family==='support'?780:383,.28,{gain:.07,delay:.035});
  return;
 }
 const c=setup();if(!c)return;
 const step=kind==='step',cast=kind==='release';
 const duration=step?.11:cast?.16:.25;
 const source=c.createBufferSource(),filter=c.createBiquadFilter(),amp=c.createGain();
 const buffer=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),samples=buffer.getChannelData(0);
 for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*Math.pow(1-i/samples.length,1.7);
 source.buffer=buffer;filter.type='lowpass';filter.frequency.value=step?420:cast?2600:family==='slash'?1850:1000;
 amp.gain.value=step?.1:cast?.09:.22;
 source.connect(filter);filter.connect(amp);amp.connect(master);
 source.addEventListener('ended',()=>{source.disconnect();filter.disconnect();amp.disconnect();},{once:true});
 source.start();
 if(!cast)tone(step?74:54,step?.12:.21,{gain:step?.05:.14,wave:'triangle'});
}
const wardTone=family=>['guard','support','counter'].includes(family);
