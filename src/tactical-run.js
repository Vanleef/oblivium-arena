import {characterById} from './data.js';
import {encounterScene} from './combat-scenes.js';
import {conquestProgress} from './conquest-augments.js';
import {campaignCreature} from './campaign-creatures.js';
import {tacticalRoster} from './tactical-kits.js';
import {getRelevantBuffChoices} from './rules.js';

export const tacticalRoutes=Object.freeze([
 {id:'recovery',title:'Jardim de Cinzas',kind:'Recuperação',text:'Recupere 18 de Vida de cada sobrevivente antes do próximo confronto.',story:'Entre as ruínas, raízes pálidas guardam o calor das almas.'},
 {id:'risk',title:'Portão do Julgamento',kind:'Risco',text:'Rivais começam com 18 de Escudo extra. Em Conquista, criaturas podem elevar a formação a 5 oponentes.',story:'Uma sentinela oferece passagem a quem aceitar seu julgamento.'},
 {id:'discovery',title:'Véu Errante',kind:'Descoberta',text:'Enfrente outro trio, determinado pela trilha e pela semente. A Vida é mantida.',story:'O caminho se dobra e revela presenças além da névoa.'}
]);
const conquestRewards=[
 {id:'shield',tier:'silver',kingdoms:0,title:'Muralha da Travessia',text:'Comece cada confronto seguinte com 8 de Escudo em cada sobrevivente.'},
 {id:'heal',tier:'silver',kingdoms:0,title:'Fonte das Almas',text:'Restaure até 8 de Vida de cada sobrevivente ao entrar em um confronto.'},
 {id:'purify',tier:'silver',kingdoms:0,title:'Pele de Mármore',text:'Comece os próximos confrontos com 5 de Armadura adicional.'},
 {id:'march',tier:'silver',kingdoms:1,title:'Rito da Marcha',text:'Cada sobrevivente ganha 5 de Escudo ao mover, uma vez por rodada nos próximos combates.'},
 {id:'edge',tier:'silver',kingdoms:1,title:'Fio da Travessia',text:'Técnicas ofensivas dos sobreviventes causam +5 de dano nos próximos combates.'},
 {id:'mender',tier:'silver',kingdoms:1,title:'Mãos da Travessia',text:'Técnicas de cura recuperam +5 de Vida nos próximos combates.'},
 {id:'leap',tier:'gold',kingdoms:3,title:'Passagem dos Vultos',text:'No campo compacto, cada sobrevivente ganha até 8 de Escudo ao mover-se uma casa na diagonal, uma vez por rodada.'},
 {id:'gold-ward',tier:'gold',kingdoms:3,title:'Pacto do Bastião',text:'Cada sobrevivente recebe mais 16 de Escudo no início dos próximos combates.'},
 {id:'gold-recovery',tier:'gold',kingdoms:3,title:'Passos da Fonte',text:'Mover recupera 8 de Vida, uma vez por rodada por portador nos próximos combates.'},
 {id:'gold-support',tier:'gold',kingdoms:3,title:'Trama da Vigília',text:'Técnicas de Escudo concedem +8 de Escudo nos próximos combates.'},
 {id:'prism-edge',tier:'prismatic',kingdoms:8,title:'Limiar Cortante',text:'Técnicas ofensivas dos sobreviventes causam +12 de dano nos próximos combates.'},
 {id:'prism-march',tier:'prismatic',kingdoms:8,title:'Peregrinação Eterna',text:'Mover concede 12 de Escudo, uma vez por rodada por portador nos próximos combates.'},
 {id:'prism-mender',tier:'prismatic',kingdoms:8,title:'Jardim Interior',text:'Técnicas de cura recuperam +12 de Vida nos próximos combates.'}
];
export function createTacticalRun(progress={}){return {augmentProgress:conquestProgress(progress),encounter:1,buffs:[],memories:[],teamHealth:{},globalEffects:{},history:[],route:null,rewardCount:3,fortressRewards:[]};}

export function offerTacticalRewards(run,battle,seed=1){
 if(battle.phase!=='victory'||battle.tactical.stage!=='finished')return [];
 run.teamHealth=Object.fromEntries(battle.allies.map(unit=>[unit.id,unit.hp]));
 if(battle.tactical.fortress)run.augmentProgress=conquestProgress(battle.tactical.fortress.progress||run.augmentProgress);
 if(battle.tactical.fortress)return conquestRewards.filter(choice=>choice.kingdoms<=run.augmentProgress.completedKingdoms.length&&!(run.fortressRewards||[]).includes(choice.id)&&
  (!['mender','prism-mender'].includes(choice.id)||battle.allies.some(u=>u.hp>0&&u.abilities.some(a=>a.heal)))&&
  (choice.id!=='gold-support'||battle.allies.some(u=>u.hp>0&&u.abilities.some(a=>a.shield)))).slice(0,run.rewardCount||3).map(choice=>({...choice,fortress:true}));
 return getRelevantBuffChoices(battle.allies.map(unit=>unit.sourceId||unit.id),run.buffs,seed,run.rewardCount||3);
}

export function chooseTacticalReward(run,choices,id){
 const choice=choices.find(choice=>choice.id===id);
 if(!choice)return false;
 const rewards=choice.fortress?(run.fortressRewards??=[]):run.buffs;
 if(rewards.includes(id))return false;
 rewards.push(id);return true;
}

export function advanceTacticalRun(run,battle,routeId=null){
 if(battle.phase!=='victory'||battle.tactical.stage!=='finished')return null;
 if(routeId&&!tacticalRoutes.some(r=>r.id===routeId))return null;
 if(battle.tactical.fortress?.nextEncounter)return JSON.parse(JSON.stringify(battle.tactical.fortress.nextEncounter));
 const route=tacticalRoutes.find(r=>r.id===routeId);
 run.teamHealth=Object.fromEntries(battle.allies.map(u=>[u.id,u.hp>0&&routeId==='recovery'?Math.min(u.maxHp,u.hp+18):u.hp]));
 if(battle.tactical.fortress)run.augmentProgress=conquestProgress(battle.tactical.fortress.progress||run.augmentProgress);
 run.encounter++;run.route=route?.id||null;run.rewardCount=routeId==='risk'?4:3;
 if(route)(run.history??=[]).push({encounter:run.encounter,route:route.id,title:route.title});
 const ids=side=>battle[side==='player'?'allies':'enemies'].filter(unit=>!unit.npcOnly).map(unit=>unit.sourceId||unit.id);
 const offset=((battle.rngState||battle.round)>>>0)+run.encounter*3;
 let opponents=routeId==='discovery'?Array.from({length:3},(_,i)=>tacticalRoster[(offset+i)%tacticalRoster.length]):ids('enemy');
 if(routeId==='discovery'&&opponents.every((id,i)=>id===ids('enemy')[i]))opponents=Array.from({length:3},(_,i)=>tacticalRoster[(offset+i+1)%tacticalRoster.length]);
 const creatures=battle.tactical.fortress&&routeId==='risk'
  ?Array.from({length:run.encounter>=4?2:1},(_,i)=>campaignCreature(battle.enemies[0].realm,i)):[];
 const next={compact:Boolean(battle.tactical.compact),scene:encounterScene(characterById[opponents[0]]?.realm,run.encounter,battle.tactical.scene),campaign:Boolean(battle.tactical.fortress),augmentProgress:{...run.augmentProgress},creatures,fortressRewards:[...(run.fortressRewards||[])],environment:battle.tactical.environment?.id||null,player:ids('player'),enemy:opponents,routeEnemyShield:routeId==='risk'?18:0,seed:(battle.rngState||battle.round)+run.encounter,buffs:[...run.buffs],memories:[...run.memories],globalEffects:{...run.globalEffects},teamHealth:{...run.teamHealth}};
 if(battle.tactical.fortress)battle.tactical.fortress.nextEncounter=JSON.parse(JSON.stringify(next));
 return next;
}

export function conquestProgressText(progress){
 const {completedKingdoms,spins}=conquestProgress(progress),count=completedKingdoms.length;
 const next=count<3?'Ouro em '+(3-count)+' reino(s)':count<5?'Exclusivos em '+(5-count)+' reino(s)':count<8?'Prismático em '+(8-count)+' reino(s)':'Todos os tiers liberados';
 return count+' reino(s) concluído(s) · '+spins+' Giro(s) · '+next;
}
