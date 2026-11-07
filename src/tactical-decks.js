// Individual tactical card decks. All random draws use a local deterministic seed;
// neither previews nor the opponent's hidden plan may alter the draw order.
export const TACTICAL_CARD_RULES=Object.freeze({minimum:8,maximum:10,openingDraw:3,roundDraw:2,handLimit:6});
const clone=value=>JSON.parse(JSON.stringify(value));
const other=side=>side==='player'?'enemy':'player';
const validUpgrade=raw=>{
 const x=raw&&typeof raw==='object'?raw:{};
 return {
  opening:Boolean(x.opening),retain:Boolean(x.retain),exhaust:Boolean(x.exhaust),
  damageBonus:Number.isInteger(x.damageBonus)?Math.max(0,Math.min(15,x.damageBonus)):0,
  damageType:['physical','fire','water','air','light','shadow','piercing'].includes(x.damageType)?x.damageType:null,
  weaken:x.weaken===1?1:0,expose:x.expose===1?1:0
 };
};
function shuffle(list,seed){
 let state=(seed>>>0)||1,out=[...list];
 for(let i=out.length-1;i>0;i--){
  state=(Math.imul(1664525,state)+1013904223)>>>0;
  const j=state%(i+1);[out[i],out[j]]=[out[j],out[i]];
 }
 return out;
}
export function defaultTacticalCardBuild(unit){
 const techniques=unit.abilities.filter(a=>a.id!=='fortress-basic').slice(0,4);
 const pool=techniques.map(a=>({kind:'skill',abilityId:a.id}));
 const copies=Array.from({length:Math.max(0,6-pool.length)},(_,i)=>pool[i%Math.max(1,pool.length)]).filter(Boolean);
 return [...pool,...copies,{kind:'mobility',name:'Passo Longo'},{kind:'reaction',name:'Último Suspiro'}];
}
function validateBuild(unit,raw){
 if(!Array.isArray(raw)||raw.length<TACTICAL_CARD_RULES.minimum||raw.length>TACTICAL_CARD_RULES.maximum)throw Error('Cada baralho deve ter 8 a 10 cartas.');
 const abilities=new Set(unit.abilities.filter(a=>a.id!=='fortress-basic').map(a=>a.id));
 return raw.map((entry,index)=>{
  if(!entry||!['skill','mobility','reaction'].includes(entry.kind))throw Error('Tipo de carta inválido.');
  if(entry.kind==='skill'&&!abilities.has(entry.abilityId))throw Error('Carta de técnica não pertence ao personagem.');
  const id=unit.id+':card-'+index;
  return {id,kind:entry.kind,abilityId:entry.kind==='skill'?entry.abilityId:null,
   name:entry.kind==='skill'?unit.abilities.find(a=>a.id===entry.abilityId).name:entry.kind==='mobility'?'Passo Longo':'Último Suspiro',
   upgrade:validUpgrade(entry.upgrade)};
 });
}
function draw(deck,count){
 for(let i=0;i<count&&deck.hand.length<TACTICAL_CARD_RULES.handLimit;i++){
  if(!deck.draw.length){
   if(!deck.discard.length)break;
   deck.draw=shuffle(deck.discard,deck.seed++);deck.discard=[];
  }
  deck.hand.push(deck.draw.shift());
 }
}
export function createTacticalDecks(s,{decks={},seed=1}={}){
 const result={sides:{player:{},enemy:{}},responses:{player:1,enemy:1},round:s.round};
 for(const [side,team] of [['player',s.allies],['enemy',s.enemies]]){
  for(const [i,unit] of team.entries()){
   const build=decks[unit.sourceId||unit.id]||decks[unit.id]||defaultTacticalCardBuild(unit);
   const cards=validateBuild(unit,build),byId=Object.fromEntries(cards.map(card=>[card.id,card]));
   const initial=cards.filter(card=>card.upgrade.opening).map(card=>card.id);
   if(initial.length>TACTICAL_CARD_RULES.handLimit)throw Error('Há cartas iniciais demais.');
   const serial=seed+(side==='enemy'?1009:0)+i*131;
   const deck={cards:byId,draw:shuffle(cards.map(card=>card.id).filter(id=>!initial.includes(id)),serial),
    hand:[...initial],discard:[],exhausted:[],movementReady:true,seed:serial+1};
   draw(deck,TACTICAL_CARD_RULES.openingDraw);result.sides[side][unit.id]=deck;
  }
 }
 return result;
}
export const tacticalCardDeck=(s,side,actorId)=>s.tactical?.decks?.sides?.[side]?.[actorId]||null;
export function tacticalHand(s,side,actorId){
 const deck=tacticalCardDeck(s,side,actorId);
 return deck?deck.hand.map(id=>deck.cards[id]).filter(Boolean):[];
}
export function tacticalCard(s,side,actorId,cardId){
 return tacticalCardDeck(s,side,actorId)?.cards?.[cardId]||null;
}
export function validateTacticalCardPlan(s,side,actions){
 if(!s.tactical?.decks)return {ok:true};
 const used=new Set(),moves=new Set();
 for(const ref of actions){
  const deck=tacticalCardDeck(s,side,ref.actorId);
  if(!deck)return {ok:false,reason:'Baralho indisponível.'};
  if(ref.type==='move'&&!ref.cardId){
   if(!deck.movementReady||moves.has(ref.actorId))return {ok:false,reason:'A carta Movimento só pode ser usada uma vez por rodada.'};
   moves.add(ref.actorId);continue;
  }
  if(ref.type==='skill'&&ref.abilityId==='fortress-basic'&&!ref.cardId)continue;
  const card=tacticalCard(s,side,ref.actorId,ref.cardId);
  if(!card||!deck.hand.includes(ref.cardId)||used.has(ref.cardId))return {ok:false,reason:'Essa carta não está disponível na mão.'};
  if(ref.type==='skill'&&(card.kind!=='skill'||card.abilityId!==ref.abilityId))return {ok:false,reason:'A carta não corresponde à técnica.'};
  if(ref.type==='move'&&card.kind!=='mobility')return {ok:false,reason:'A carta não permite movimentação.'};
  if(!['move','skill'].includes(ref.type))return {ok:false,reason:'Carta de ação inválida.'};
  used.add(ref.cardId);
 }
 return {ok:true};
}
export function spendTacticalCards(s,side,actions){
 const decks=s.tactical?.decks;if(!decks)return;
 for(const ref of actions){
  const deck=tacticalCardDeck(s,side,ref.actorId);
  if(ref.type==='move'&&!ref.cardId){deck.movementReady=false;continue;}
  if(!ref.cardId)continue;
  const index=deck.hand.indexOf(ref.cardId);if(index<0)throw Error('Carta já gasta.');
  deck.hand.splice(index,1);
  (deck.cards[ref.cardId].upgrade.exhaust?deck.exhausted:deck.discard).push(ref.cardId);
 }
}
export function nextTacticalCardRound(s){
 if(!s.tactical?.decks)return;
 s.tactical.decks.responses={player:1,enemy:1};
 for(const side of ['player','enemy'])for(const deck of Object.values(s.tactical.decks.sides[side])){
  for(const id of deck.hand)if(!deck.cards[id].upgrade.retain)deck.discard.push(id);
  deck.hand=deck.hand.filter(id=>deck.cards[id].upgrade.retain);
  deck.movementReady=true;
  draw(deck,TACTICAL_CARD_RULES.roundDraw);
 }
 s.tactical.decks.round=s.round;
}
export function tacticalResponseOptions(s,side,targetId){
 const decks=s.tactical?.decks;if(!decks)return {available:true,basic:true,reactions:[]};
 const hand=Object.keys(decks.sides[side]).flatMap(id=>tacticalHand(s,side,id));
 return {available:Boolean(decks.responses[side]>0||hand.some(card=>card.kind==='reaction')),
  basic:decks.responses[side]>0,
  reactions:hand.filter(card=>card.kind==='reaction')};
}
export function spendTacticalResponse(s,side,cardId=null){
 const decks=s.tactical?.decks;if(!decks)return true;
 if(cardId){
  const entry=Object.entries(decks.sides[side]).find(([,deck])=>deck.hand.includes(cardId)&&deck.cards[cardId]?.kind==='reaction');
  if(!entry)return false;
  const deck=entry[1];deck.hand.splice(deck.hand.indexOf(cardId),1);
  (deck.cards[cardId].upgrade.exhaust?deck.exhausted:deck.discard).push(cardId);
  return true;
 }
 if(decks.responses[side]<=0)return false;
 decks.responses[side]--;return true;
}
export function upgradeTacticalCard(s,side,actorId,cardId,upgrade){
 const card=tacticalCard(s,side,actorId,cardId);
 if(!card||!upgrade||typeof upgrade!=='object')return {ok:false,reason:'Carta ou melhoria inválida.'};
 card.upgrade=validUpgrade({...card.upgrade,...upgrade});
 return {ok:true,card:clone(card)};
}
