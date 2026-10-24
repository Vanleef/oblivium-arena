export function playerLevel(xp=0){let remaining=Math.max(0,Math.floor(Number(xp)||0)),level=1;while(level<100&&remaining>=250+(level-1)*75){remaining-=250+(level-1)*75;level++;}const required=250+(level-1)*75;return {level,current:level===100?required:remaining,required,percent:level===100?100:Math.min(100,remaining/required*100)};}
export const rankTiers=[['Alma errante',0],['Vigia do Véu',1100],['Guardião',1300],['Ascendente',1500],['Soberano',1800],['Além do Véu',2100]];
export const rankForRating=rating=>[...rankTiers].reverse().find(([,n])=>rating>=n)?.[0]||rankTiers[0][0];

