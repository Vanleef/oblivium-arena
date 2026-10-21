const sigils={
  sangria:'<path d="M100 49C90 68 73 84 73 103a27 27 0 0 0 54 0c0-19-17-35-27-54Z"/><path d="m62 132 76-76m-76 0 76 76"/>',
  coroa:'<path d="m49 76 20 17 31-34 31 34 20-17-13 58H62Z"/><path d="M65 144h70M78 111h44"/>',
  mentira:'<path d="m100 48 48 48-48 54-48-54Z"/><path d="M68 98q32-28 64 0-32 28-64 0ZM100 48v102"/>',
  chama:'<path d="M104 45c16 25-5 27 17 48 5-12 12-15 12-15 24 38 5 69-31 69-37 0-56-31-33-64 0 19 15 14 14 4-3-19 9-27 21-42Z"/><path d="M104 102c-28 25-18 39-3 39 17 0 22-17 3-39Z"/>',
  fome:'<path d="M59 70q41-28 82 0l-9 61q-32 29-64 0Z"/><path d="M70 83q30 24 60 0M78 105v19m22-12v20m22-27v19"/>',
  podridao:'<path d="M100 143V85M63 100q0-36 37-45 37 9 37 45Z"/><path d="M76 100v29m48-29v29m-45-3-10 16m52-16 10 16M100 116l-17 15m17-15 17 15"/>',
  silencio:'<circle cx="100" cy="98" r="45"/><path d="m67 65 66 66M76 98h48M100 53v-9m0 99v9"/>',
  carne:'<path d="M100 53c-33 9-42 34-31 54l31 42 31-42c11-20 2-45-31-54Z"/><path d="M100 53v96M73 77l54 44M127 77l-54 44M65 100h70"/>',
  vazio:'<circle cx="100" cy="98" r="46"/><circle cx="100" cy="98" r="25"/><path d="m64 62 12 12m48 48 12 12m0-72-12 12m-48 48-12 12"/>',
  protecao:'<path d="m100 48 44 18-5 49q-9 23-39 39-30-16-39-39l-5-49Z"/><path d="M100 65v70m-24-38h48"/>',
  cura:'<path d="M86 55h28v28h28v28h-28v28H86v-28H58V83h28Z"/><path d="M100 143v11m-48-57H40m108 0h12"/>',
  justica:'<path d="M100 49v95M65 145h70M58 74h84M66 74l-22 38h44Zm68 0-22 38h44Z"/><circle cx="100" cy="61" r="9"/>',
  esperanca:'<circle cx="100" cy="96" r="24"/><path d="M100 48v16m0 64v16M52 96h16m64 0h16M66 62l12 12m44 44 12 12m0-68-12 12m-44 44-12 12M67 148h66"/>',
  verdade:'<path d="M48 99q52-62 104 0-52 62-104 0Z"/><circle cx="100" cy="99" r="23"/><path d="M100 43v21m0 70v21M73 51l8 14m46-14-8 14"/>',
  uniao:'<path d="M100 97c-38-59-76 13-34 27 16 6 25-10 34-27 38-59 76 13 34 27-16 6-25-10-34-27Z"/><path d="M75 56q25-17 50 0M75 144q25 17 50 0"/>',
  criacao:'<path d="M100 149V91m0 26q-43 1-43-40 43-2 43 40Zm0-17q43 1 43-40-43-2-43 40Z"/><path d="M100 94Q74 63 100 43q26 20 0 51ZM76 149h48"/>',
  'correntes-quebradas':'<path d="m92 60-13-9c-28-19-53 24-26 42l20 14m35 27 13 9c28 19 53-24 26-42l-20-14M70 91l18 12m24-10 18 12M106 54l-12 30 19 15-20 42"/>'
};
export function eloCrest(elo,extraClass="") {
  return `<svg class="elo-crest ${extraClass}" viewBox="0 0 200 230" role="img" aria-label="Brasão do Elo ${elo.name}"><path class="crest-aura" d="M100 11 180 39v73c0 48-35 77-80 106-45-29-80-58-80-106V39Z"/><path class="crest-shield" d="m100 23 68 25v64c0 40-29 65-68 92-39-27-68-52-68-92V48Z"/><path class="crest-border" d="m100 34 57 21v57c0 33-25 57-57 80-32-23-57-47-57-80V55Z"/><g class="crest-sigil">${sigils[elo.id]||sigils.vazio}</g><path class="crest-ribbon" d="M51 170h98l-9 16H60Z"/><text x="100" y="181" text-anchor="middle">${elo.name.toUpperCase()}</text></svg>`;
}
