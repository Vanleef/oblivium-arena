// One unframed symbol per Elo; the same silhouette is used at every scale.
const designs = {
  sangria: {
    solid: 'M104 20 91 58 72 78 80 84C62 101 55 121 64 143 73 168 102 180 124 166 149 151 145 125 132 107L126 120 117 94 124 86 109 61ZM39 70 50 61 77 115 67 130ZM161 70 150 61 132 96 139 110Z',
    etch: 'M94 95Q77 117 86 137M96 151 106 157M110 39 102 61'
  },
  coroa: {
    solid: 'M28 62 64 91 82 52 97 78 112 22 132 88 172 55 157 133 136 145 101 136 67 146 43 130ZM52 150 83 157 99 148 121 156 148 147 144 166 117 177 97 166 72 178 55 168Z',
    etch: 'M50 102 71 119 90 110M111 105 132 121 151 100M112 43 115 70'
  },
  mentira: {
    solid: 'M30 44Q65 24 104 56L96 140 75 163Q33 139 31 93ZM49 72 78 78 53 88ZM61 118Q72 134 84 125L81 139Q65 142 61 118ZM126 57 171 38 174 88Q170 134 130 163L115 142 121 105 111 96 124 86ZM136 78 158 66 153 84ZM135 128Q147 115 157 119L153 132Q145 127 135 140Z',
    etch: 'M99 47 89 84 102 101 91 123M128 102 137 93M49 51 72 47'
  },
  chama: {
    solid: 'M115 18Q128 48 115 72L140 53Q140 83 152 101 174 140 139 164L146 145Q128 181 91 177 49 173 42 139 32 108 65 75L58 108Q84 105 77 85 73 54 115 18ZM99 101Q82 124 90 145L105 161Q127 138 115 116L107 130Z',
    etch: 'M106 43 94 71M58 127 64 148M137 112 141 128'
  },
  fome: {
    solid: 'M27 52 60 64 76 48 98 65 123 47 143 64 174 51 161 103 145 119 138 91 121 120 108 92 91 123 79 92 59 116 48 92ZM37 124 56 139 68 126 86 146 102 129 119 149 135 129 163 118Q153 158 104 180 61 166 37 124Z',
    etch: 'M42 65 49 81M153 69 149 84M64 152 101 167 137 148'
  },
  podridao: {
    solid: 'M91 108Q45 119 30 88 21 65 46 43 62 30 78 47L72 61 91 64ZM107 108 119 63 135 62 128 43Q158 37 174 67 192 107 140 117L125 108 120 157 106 180 91 164ZM61 122 74 133 60 147 45 136ZM151 127 165 140 151 154 138 140ZM37 157 44 166 36 174 28 165Z',
    etch: 'M46 65 64 85M147 64 138 87M106 123 102 155'
  },
  silencio: {
    solid: 'M34 62 54 53 54 143 34 134ZM68 78 87 72 87 127 68 122ZM99 32 112 26 108 83 120 92 105 106 111 169 98 177 93 112 101 95 92 83ZM130 75 148 68 148 128 130 122ZM163 55 181 66 181 133 163 143Z',
    etch: 'M42 75V119M139 85V112M172 77V119'
  },
  carne: {
    solid: 'M64 29Q28 55 42 90L81 132Q92 147 79 172L97 177Q116 145 99 123L63 82Q48 63 74 46ZM126 28 108 40Q133 61 116 80L78 124Q62 148 79 171L96 161Q85 147 96 132L139 89Q168 53 126 28ZM35 96 55 96 82 123 69 139ZM148 96 169 92 143 136 124 125Z',
    etch: 'M57 48Q44 67 61 86M133 47Q146 65 126 87M83 142 85 156'
  },
  vazio: {
    solid: 'M91 22Q44 29 28 72L48 82Q62 51 86 45ZM113 23 111 45Q145 50 157 80L178 72Q163 31 113 23ZM24 94 46 95Q44 131 78 152L66 173Q23 152 24 113ZM181 93 158 98Q159 130 128 150L137 174Q178 156 182 121ZM89 151 86 176 111 182 117 157ZM102 58 89 95 102 112 91 144 116 108 104 94 118 60Z',
    etch: 'M42 60 55 42M150 44 164 61M41 128 50 144M151 144 165 126'
  },
  protecao: {
    solid: 'M100 30 133 48 130 108Q125 140 100 161 75 140 70 108L67 48ZM84 62V106Q88 123 100 136 112 123 116 106V62L100 53ZM59 58 32 45Q25 88 57 121L66 103Q47 84 59 58ZM141 58 168 45Q175 88 143 121L134 103Q153 84 141 58ZM81 163 100 179 119 163 100 169Z',
    etch: 'M77 57 80 104Q84 125 100 146 116 125 120 104L123 57M40 64 43 83M160 64 157 83'
  },
  cura: {
    solid: 'M100 26Q128 59 112 81 100 96 87 81 71 59 100 26ZM55 77Q29 83 39 118 47 143 78 154L99 175 100 148Q74 140 65 120L54 101Q49 97 46 102L53 121 40 105Q36 90 55 77ZM145 77Q171 83 161 118 153 143 122 154L101 175 100 148Q126 140 135 120L146 101Q151 97 154 102L147 121 160 105Q164 90 145 77ZM94 101H106V114H119V126H106V139H94V126H81V114H94Z',
    etch: 'M97 46Q84 63 96 73M60 132 82 146M140 132 118 146'
  },
  justica: {
    solid: 'M100 23 110 40 105 51V147L131 159Q100 177 69 159L95 147V51L90 40ZM38 58Q70 69 100 55 130 69 162 58L160 73Q130 83 100 69 70 83 40 73ZM54 78 34 117H73ZM145 78 126 117H165ZM27 124H80Q74 145 54 145 34 145 27 124ZM120 124H173Q166 145 146 145 126 145 120 124Z',
    etch: 'M100 41V142M45 130Q54 136 64 130M136 130Q146 136 155 130'
  },
  esperanca: {
    solid: 'M95 21H105V47H95ZM52 35 61 29 75 53 66 59ZM148 35 139 29 125 53 134 59ZM25 68 30 57 56 72 51 82ZM175 68 170 57 144 72 149 82ZM100 61A44 44 0 0 1 144 105H56A44 44 0 0 1 100 61ZM30 117Q66 127 100 115 134 127 170 117L163 132Q133 142 100 129 67 142 37 132ZM56 147Q100 159 144 147L137 160Q100 172 63 160Z',
    etch: 'M100 74V98M75 94Q100 79 125 94'
  },
  verdade: {
    solid: 'M22 91Q57 45 100 43 143 45 178 91L163 94Q129 61 100 62 71 61 37 94ZM22 108 37 105Q71 138 100 137 129 138 163 105L178 108Q143 154 100 156 57 154 22 108ZM100 74 125 100 100 126 75 100ZM100 88 89 100 100 112 111 100Z',
    etch: 'M45 79Q72 54 100 54 128 54 155 79M55 129Q100 161 145 129'
  },
  uniao: {
    solid: 'M100 24C80 24 68 39 69 56L82 78 96 70 86 52Q82 40 100 40 118 40 114 52L102 75 116 85 131 59C137 39 121 24 100 24ZM45 111C25 114 20 138 31 154 44 176 69 174 80 158L91 136 78 126 65 150Q57 162 44 149 33 138 45 130L69 120 64 104ZM154 111 133 103 126 119 152 131Q165 139 153 151 141 162 133 150L119 125 104 133 117 159C129 177 154 175 167 154 179 135 173 115 154 111ZM80 82 98 94 119 80 130 96 111 109 113 132 95 136 91 113 70 102Z',
    etch: 'M84 45Q100 28 116 45M41 139 51 155M152 139 143 155M94 99 105 106'
  },
  criacao: {
    solid: 'M95 174V120C57 124 29 99 29 62 61 60 88 74 100 104 108 72 134 45 172 45 176 87 147 120 107 120V174ZM45 77Q52 102 82 106ZM153 64Q125 70 116 100ZM100 23 113 40 100 61 87 40Z',
    etch: 'M44 75 83 106M154 63 116 101M82 175H121'
  },
  'correntes-quebradas': {
    solid: 'M86 51 101 66 87 80 75 69Q60 58 49 72 39 86 54 96L68 108 54 123 35 108Q7 83 33 55 58 28 86 51ZM114 149 99 134 113 120 125 131Q140 142 151 128 161 114 146 104L132 92 146 77 165 92Q193 117 167 145 142 172 114 149ZM105 76 91 101 110 113 95 137 120 109 102 97 115 75ZM128 43 139 48 133 62 123 57ZM67 143 77 148 72 162 61 157Z',
    etch: 'M39 65Q23 87 43 102M161 135Q177 113 157 98M100 91 106 97'
  }
};
const palettes = {
  sangria:'#ee817f',coroa:'#dfad71',mentira:'#ba9de3',chama:'#f49a62',
  fome:'#c6b077',podridao:'#a9bd76',silencio:'#a8b5c7',carne:'#dc98ac',vazio:'#b09fcf',
  protecao:'#a6dcef',cura:'#a9dec3',justica:'#f0da9b',esperanca:'#f6d88f',
  verdade:'#afe3e7',uniao:'#d4c8f1',criacao:'#b7d79c','correntes-quebradas':'#c8b5f0'
};
const sanctuary = new Set(['protecao','cura','justica','esperanca','verdade','uniao','criacao']);
function familyFor(id) {
  return id === 'correntes-quebradas' ? 'fracture' : sanctuary.has(id) ? 'sanctuary' : 'infernal';
}
const materials = {
  infernal: {ink:'#251019',shade:'#754953',light:'#ffd4b3',join:'miter'},
  sanctuary: {ink:'#19333e',shade:'#719ba8',light:'#fff9df',join:'round'},
  fracture: {ink:'#241d3b',shade:'#7165a2',light:'#bdf0f5',join:'bevel'}
};
let serial = 0;
export function eloVisual(id) {
  const design = designs[id];
  return design ? {path:design.solid,accent:palettes[id]} : null;
}
export function eloSigil(id,extraClass='') {
  const visual = eloVisual(id);
  if (!visual) return '';
  return `<svg class="elo-sigil sigil-${familyFor(id)} ${extraClass}" viewBox="0 0 200 200" style="color:${visual.accent}" fill="currentColor" aria-hidden="true" focusable="false"><path fill-rule="evenodd" d="${visual.path}"/></svg>`;
}
export function eloCrest(elo,extraClass='') {
  const key = designs[elo.id] ? elo.id : 'vazio';
  const design = designs[key],accent = palettes[key],family = familyFor(key),material = materials[family];
  const id = `elo-symbol-${key}-${++serial}`;
  return `<svg class="elo-crest crest-${family} ${extraClass}" viewBox="0 0 200 200" role="img" aria-label="Brasão do Elo ${elo.name}" focusable="false"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0.7" y2="1"><stop stop-color="${material.light}"/><stop offset=".32" stop-color="${accent}"/><stop offset=".62" stop-color="${accent}"/><stop offset=".63" stop-color="${material.shade}"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs><path class="elo-symbol" fill-rule="evenodd" d="${design.solid}" fill="url(#${id})" stroke="${material.ink}" stroke-width="3" stroke-linejoin="${material.join}"/><path class="elo-symbol-etch" d="${design.etch}" fill="none" stroke="${material.light}" stroke-width="2.6" stroke-linecap="round" opacity=".8"/></svg>`;
}


