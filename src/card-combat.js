// Oblivium Arena: three independent, serializable decks per team.
// Deliberately pure: the same rules can be used by the browser, campaign server and PvP server.
export const CARD_RULES = Object.freeze({minDeck:8,maxDeck:10,drawPerRound:2,maxHand:6,movementPerRound:1,responsesPerRound:1});
export const BASIC_ATTACK_ID = "__basic_attack__";
export const basicAttack = () => ({id:BASIC_ATTACK_ID,name:"Ataque Básico",target:"enemy",damage:5,damageType:"physical",costs:{},cooldown:0,formKey:"base"});
export const WILL_SIGNS = Object.freeze(["miragem","luz","sombra"]);
const BEATS = Object.freeze({miragem:"luz",luz:"sombra",sombra:"miragem"});
const hasUpgrade=(card,type)=>(card?.upgrades||[]).some(upgrade=>(typeof upgrade==="string"?upgrade:upgrade.type)===type);
const shuffled=(list,rng)=>{const result=[...list];for(let i=result.length-1;i>0;i--){const j=Math.max(0,Math.min(i,Math.floor(rng()*(i+1))));[result[i],result[j]]=[result[j],result[i]];}return result;};
export function defaultLoadout(unit){
 const abilities=unit.abilities||[];
 if(!abilities.length)return [];
 // The first iteration uses eight equipped cards, with every available skill represented.
 return Array.from({length:Math.min(CARD_RULES.maxDeck,Math.max(CARD_RULES.minDeck,abilities.length))},(_,i)=>({abilityId:abilities[i%abilities.length].id}));
}
export function validateLoadout(unit,loadout){
 if(!Array.isArray(loadout)||loadout.length<CARD_RULES.minDeck||loadout.length>CARD_RULES.maxDeck)throw new Error("O baralho deve ter entre 8 e 10 cartas.");
 const allowed=new Set((unit.abilities||[]).map(ability=>ability.id));
 return loadout.map((entry,index)=>{
  const abilityId=typeof entry==="string"?entry:entry?.abilityId;
  if(!allowed.has(abilityId))throw new Error("Carta inválida para o personagem.");
  const upgrades=typeof entry==="string"?[]:entry.upgrades||[];
  if(!Array.isArray(upgrades)||upgrades.length>3)throw new Error("Aprimoramentos de carta inválidos.");
  if(upgrades.some(u=>!["damage","bleed","fire","innate","retain","exhaust"].includes(typeof u==="string"?u:u?.type)))throw new Error("Aprimoramento desconhecido.");
  return {id:unit.id+":card:"+index,kind:"ability",abilityId,upgrades:JSON.parse(JSON.stringify(upgrades))};
 });
}
export function createCardState(units,{loadouts={},rng=Math.random}={}){
 const decks={};
 for(const unit of units){
  const cards=validateLoadout(unit,loadouts[unit.id]||defaultLoadout(unit));
  decks[unit.id]={draw:shuffled(cards,rng),hand:[],discard:[],exhaust:[]};
 }
 return {decks,round:0,responses:{player:CARD_RULES.responsesPerRound,enemy:CARD_RULES.responsesPerRound}};
}
export function drawCards(deck,count,rng=Math.random){
 const drawn=[];
 for(let i=0;i<count&&deck.hand.length<CARD_RULES.maxHand;i++){
  if(!deck.draw.length){if(!deck.discard.length)break;deck.draw=shuffled(deck.discard,rng);deck.discard=[];}
  const card=deck.draw.shift();deck.hand.push(card);drawn.push(card);
 }
 return drawn;
}
export function endCardRound(state){
 if(!state)return;
 for(const deck of Object.values(state.decks)){
  const keep=[];
  for(const card of deck.hand){
   if(card.kind==="movement")continue;
   if(hasUpgrade(card,"retain"))keep.push(card);
   else deck.discard.push(card);
  }
  deck.hand=keep;
 }
}
export function beginCardRound(state,units,round,rng=Math.random){
 if(!state||state.round===round)return;
 state.round=round;state.responses={player:CARD_RULES.responsesPerRound,enemy:CARD_RULES.responsesPerRound};
 for(const unit of units){
  const deck=state.decks[unit.id];if(!deck)continue;
  if(unit.hp<=0){deck.discard.push(...deck.hand.filter(c=>c.kind==="ability"));deck.hand=[];continue;}
  if(round===1){
   // Predestinada starts in hand without generating duplicate cards.
   const innate=deck.draw.filter(card=>hasUpgrade(card,"innate"));
   deck.draw=deck.draw.filter(card=>!hasUpgrade(card,"innate"));
   deck.hand.push(...innate.slice(0,CARD_RULES.maxHand-1));
   deck.draw.unshift(...innate.slice(CARD_RULES.maxHand-1));
  }
  drawCards(deck,CARD_RULES.drawPerRound,rng);
  deck.hand=deck.hand.filter(card=>card.kind!=="movement");
  deck.hand.push({id:unit.id+":movement:"+round,kind:"movement",name:"Movimento padrão",distance:1,temporary:true});
 }
}
export function handFor(state,unitId){return state?.decks?.[unitId]?.hand||[];}
export function findHandCard(state,unitId,abilityId,cardId=null){
 return handFor(state,unitId).find(card=>card.kind==="ability"&&card.abilityId===abilityId&&(!cardId||card.id===cardId))||null;
}
export function consumeHandCard(state,unitId,cardId){
 const deck=state?.decks?.[unitId];if(!deck)return null;
 const index=deck.hand.findIndex(card=>card.kind==="ability"&&card.id===cardId);
 if(index<0)return null;
 const [card]=deck.hand.splice(index,1);
 (hasUpgrade(card,"exhaust")?deck.exhaust:deck.discard).push(card);
 return card;
}
export function applyCardUpgrades(ability,upgrades=[]){
 let modified={...ability};
 for(const raw of upgrades){
  const type=typeof raw==="string"?raw:raw.type;
  if(type==="damage"&&modified.damage)modified.damage+=5;
  if(type==="fire"&&modified.damage){
   modified.damageType="fire";
   if(!modified.dot&&!modified.dots)modified.dot={tag:"queimadura",damage:5,turns:2};
  }
  if(type==="bleed"&&modified.damage&&!modified.dot&&!modified.dots)modified.dot={tag:"sangramento",damage:5,turns:2};
 }
 return modified;
}
export function canUseResponse(state,side){return (state?.responses?.[side]||0)>0;}
export function spendResponse(state,side){
 if(!canUseResponse(state,side))return false;
 state.responses[side]--;return true;
}
export function resolveWillClash({attackerChoice,defenderChoice,baseDamage=0,criticalMultiplier=1.4}){
 if(!WILL_SIGNS.includes(attackerChoice)||!WILL_SIGNS.includes(defenderChoice))throw new Error("Manifestação inválida.");
 if(!Number.isFinite(baseDamage)||baseDamage<0)throw new Error("Dano inválido.");
 if(attackerChoice===defenderChoice)return {outcome:"normal",cancel:false,critical:false,damage:Math.floor(baseDamage)};
 if(BEATS[defenderChoice]===attackerChoice)return {outcome:"blocked",cancel:true,critical:false,damage:0};
 return {outcome:"critical",cancel:false,critical:true,damage:Math.floor(baseDamage*criticalMultiplier)};
}
