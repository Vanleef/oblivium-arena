// Original scenery: the fracture between the three PMA realms.
export function veilScene() {
  return `<svg class="veil-scene" viewBox="0 0 650 470" aria-hidden="true" focusable="false">
    <defs><linearGradient id="veil-sky" x2="0" y2="1"><stop stop-color="#1d343a"/><stop offset="1" stop-color="#0a1117"/></linearGradient><linearGradient id="veil-rift" x2="0" y2="1"><stop stop-color="#e9cc8c"/><stop offset=".5" stop-color="#cf7457"/><stop offset="1" stop-color="#632a29"/></linearGradient></defs>
    <path fill="url(#veil-sky)" d="M0 0h650v470H0z"/>
    <g fill="none" stroke="#b8c7bf" opacity=".13"><circle cx="340" cy="170" r="143"/><circle cx="340" cy="170" r="126"/><path d="M340 9v322M180 170h320M225 55l230 230m0-230L225 285"/></g>
    <path class="veil-fracture" d="m350 0-25 96 30 30-48 79 36 27-21 92 44-119-30-28 43-60-28-37L377 0Z" fill="url(#veil-rift)"/>
    <g fill="#101a20" stroke="#3d4a49" stroke-width="1"><path d="M2 380V210l31-26 31 26v170m-46-31V238h29v111M74 390V262h20v-47h23v47h20v128M441 400V244l36-51 36 51v156m-48-67v-70h24v70M535 400V155l23-40 23 40v245m-30-87V180h14v133M600 420V252h35v168"/><path d="M145 405V197l32-68 32 68v208m-46-32V221h28v152M224 420V295h31v-49h22v49h31v125"/></g>
    <g fill="#080d12"><path d="M0 470V366l70 10 31 30 65-13 54 31 63-18 50 22 68-29 44 20 83-38 48 24 74-30v95Z"/><path d="m125 470 32-84 13 84m309 0-15-103-19 103"/></g>
    <g stroke="#c1ab76" opacity=".16"><path d="M0 445h650M105 470l171-70m276 70-151-70M0 421h650"/></g>
  </svg>`;
}
