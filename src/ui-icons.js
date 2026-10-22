const paths={
 rota:'M5 26 10 7 21 4 27 21 20 28 13 24ZM10 7 13 24M21 4 20 28M14 11 18 15 14 20',
 trio:'M16 3 22 9 16 15 10 9ZM6 16 12 22 6 28 0 22ZM26 16 32 22 26 28 20 22ZM16 15V24M12 24H20',
 codex:'M16 8Q8 2 3 6V27Q9 23 16 29 23 23 29 27V6Q24 2 16 8ZM16 8V29M7 11 12 13M20 13 25 11M7 17 12 19M20 19 25 17',
 arena:'M5 5 26 26M24 28 28 24M3 3 8 4 4 8ZM27 5 6 26M4 24 8 28M29 3 24 4 28 8Z',
 essence:'M16 2 25 9V23L16 30 7 23V9ZM16 8 20 14 16 24 12 14ZM16 2V6M16 26V30',
 cinza:'M18 2C27 12 17 13 22 19 25 16 26 16 26 16 31 27 20 32 12 29 3 25 3 17 9 11 7 21 14 23 13 16 12 11 18 7 18 2ZM16 18 20 25 15 28 12 25Z',
 graca:'M16 2 21 11 30 16 21 21 16 30 11 21 2 16 11 11ZM16 9V23M9 16H23',
 ruptura:'M18 1 10 12 16 17 9 31 24 17 18 12 24 2M4 7 8 11M25 23 29 27',
 fragments:'M16 2 27 10 23 24 16 30 8 21 5 8ZM16 2 13 13 23 24M5 8 13 13 16 30M13 13 27 10',
 chains:'M13 4 18 8 13 13 9 10Q5 8 3 12 0 16 5 18L9 21 5 25 1 22Q-5 15 1 7 7-1 13 4ZM19 28 14 24 19 19 23 22Q27 24 29 20 32 16 27 14L23 11 27 7 31 10Q37 17 31 25 25 33 19 28ZM18 11 13 17 19 20 14 25',
 seal:'M16 2 20 8 27 7 26 14 31 19 24 23 23 30 16 27 9 30 8 23 1 19 6 14 5 7 12 8ZM12 16 15 19 22 11',
 search:'M22 13A9 9 0 1 1 4 13 9 9 0 1 1 22 13ZM20 20 29 29',
 shield:'M16 2 29 8 26 22 16 30 6 22 3 8ZM16 7V24M9 12H23',
 heart:'M16 9C7-1-3 10 5 18L16 29 27 18C35 10 25-1 16 9ZM8 16H12L15 11 18 22 21 16H25',
 mark:'M16 1 28 8V22L16 31 4 22V8ZM16 9V19M16 24V25',
 counter:'M9 16A10 10 0 1 1 16 26M9 16 3 11M9 16 12 9M18 6 14 15H21L16 24',
 charge:'M19 1 7 18H15L12 31 27 12H19Z',
 lock:'M8 14H24V29H8ZM11 14V9A5 5 0 0 1 21 9V14M16 19V24',
 eye:'M2 16Q16 1 30 16 16 31 2 16ZM21 16A5 5 0 1 1 11 16 5 5 0 1 1 21 16',
 spore:'M16 10A6 6 0 1 0 16 22 6 6 0 1 0 16 10M16 2V7M16 25V30M2 16H7M25 16H30M5 5 9 9M23 23 27 27M5 27 9 23M23 9 27 5',
 chevron:'M10 5 22 16 10 27'
};
export function uiIcon(name,extraClass=''){return `<svg class="ui-icon ${extraClass}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${paths[name]||paths.seal}"/></svg>`;}
export function realmEmblem(id,className='realm-emblem'){return `<img class="${className}" src="/art/interface/realm-${id}.webp" alt="" width="128" height="128" loading="lazy">`;}
export function statusIcon(label){const name=/carga/i.test(label)?'charge':/afli|sangramento|queimadura|veneno|decad/i.test(label)?'spore':/marca/i.test(label)?'mark':/cura|regenera/i.test(label)?'heart':/contra/i.test(label)?'counter':/selad|atordo/i.test(label)?'lock':/exposto/i.test(label)?'eye':/defesa|armadura|redução|invulner/i.test(label)?'shield':'seal';return uiIcon(name);}
