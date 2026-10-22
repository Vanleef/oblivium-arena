// Original cel-shaded heraldry: one silhouette per Elo, three architectural families.
const designs={
 sangria:{solid:'M100 45C90 66 73 85 73 104A27 27 0 0 0 127 104C127 85 110 66 100 45ZM42 65 52 61 84 127 76 136ZM158 65 148 61 116 127 124 136Z',etch:'M96 81Q79 105 94 115M67 120 87 110M133 120 113 110'},
 coroa:{solid:'M49 76 76 94 100 48 124 94 151 76 137 136H63ZM73 144H127V153H73Z',etch:'M74 111 100 87 126 111M82 123H118M96 63H104'},
 mentira:{solid:'M48 67Q73 53 99 72L92 137Q58 129 50 102ZM152 67Q127 53 101 72L108 137Q142 129 150 102Z',etch:'M59 86 82 94 62 97M141 86 118 94 138 97M68 113 83 120M132 113 117 120M97 76 103 120'},
 chama:{solid:'M111 43Q135 67 120 89L138 77Q157 133 110 152 57 160 52 119 49 99 66 80 59 107 80 107 68 72 111 43Z',etch:'M101 90Q119 113 102 141 79 133 87 115M109 58 97 82'},
 fome:{solid:'M100 46 148 72 139 125 100 156 61 125 52 72ZM68 80 79 117 91 101 100 130 109 101 121 117 132 80 100 93Z',etch:'M72 64 100 78 128 64M79 136 100 147 121 136'},
 podridao:{solid:'M94 100C57 102 46 76 62 59 80 46 99 67 100 88 101 67 120 46 138 59 154 76 143 102 106 100L112 146 100 159 88 146ZM77 112 60 122 66 143 83 135ZM123 112 140 122 134 143 117 135Z',etch:'M65 73 85 86M135 73 115 86M100 111V146'},
 silencio:{solid:'M70 51H130V145H70ZM82 65V131H118V65ZM49 76 60 82V119L49 125ZM151 76 140 82V119L151 125Z',etch:'M92 88H108M92 104H108M83 153H117M101 80V112'},
 carne:{solid:'M100 45 133 65 138 102 112 145 100 155 88 145 62 102 67 65ZM80 72 76 99 100 138 124 99 120 72 100 58Z',etch:'M79 79 120 119M121 79 80 119M100 64V137M72 102H128'},
 vazio:{solid:'M100 42 139 58 154 97 138 136 100 153 62 136 46 97 61 58ZM100 64 78 73 69 97 78 121 100 131 122 121 131 97 122 73Z',etch:'M99 42 87 62M140 61 127 84M151 105 130 101M128 141 116 122M61 135 76 116M50 88 71 94'},
 protecao:{solid:'M100 45 144 64 138 119 100 156 62 119 56 64ZM80 75V112L100 132 120 112V75L100 65ZM94 77H106V118H94Z',etch:'M66 74 72 115 100 143 128 115 134 74M83 99H117'},
 cura:{solid:'M100 70C62 29 35 80 64 107L100 150 136 107C165 80 138 29 100 70ZM100 85 119 105 100 130 81 105Z',etch:'M100 89V122M87 106H113M58 73Q65 60 78 69M142 73Q135 60 122 69'},
 justica:{solid:'M94 50H106V137L126 147 119 155H81L74 147 94 137ZM54 73H146V83H54ZM62 88 43 121H82ZM138 88 157 121H118Z',etch:'M62 89V120M138 89V120M48 129H78M122 129H152M82 63 100 45 118 63'},
 esperanca:{solid:'M95 42H105V61H95ZM61 55 69 48 82 65 74 71ZM139 55 131 48 118 65 126 71ZM46 90H65V100H46ZM154 90H135V100H154ZM100 70A30 30 0 0 1 130 100H70A30 30 0 0 1 100 70ZM62 113H138V122H62ZM75 133H125V141H75ZM88 150H112V157H88Z',etch:'M100 80V100M85 92H115'},
 verdade:{solid:'M100 47 148 99 100 153 52 99ZM68 99 100 78 132 99 100 122Z',etch:'M100 79V120M90 99H110M100 52V69M100 133V148M57 99H68M132 99H143'},
 uniao:{solid:'M83 57Q100 40 117 57L136 79 119 95 100 74 81 95 64 79ZM48 88 72 95 65 124 93 127 88 151 59 149Q38 142 39 124ZM152 88 128 95 135 124 107 127 112 151 141 149Q162 142 161 124Z',etch:'M90 61 100 52 110 61M51 100 49 128 58 139M149 100 151 128 142 139M80 111 100 92 120 111 100 131Z'},
 criacao:{solid:'M96 155V106C63 111 51 90 54 68 80 65 99 78 100 94 101 71 125 54 148 59 153 86 134 109 106 106V155ZM100 48 114 63 100 80 86 63Z',etch:'M65 79 93 103M135 70 107 101M85 151H115'},
 'correntes-quebradas':{solid:'M86 51 101 66 87 80 75 69Q60 58 49 72 39 86 54 96L68 108 54 123 35 108Q7 83 33 55 58 28 86 51ZM114 149 99 134 113 120 125 131Q140 142 151 128 161 114 146 104L132 92 146 77 165 92Q193 117 167 145 142 172 114 149ZM105 76 91 101 110 113 95 137 120 109 102 97 115 75Z',etch:'M39 65Q23 87 43 102M161 135Q177 113 157 98'}
};
const palettes={sangria:'#df6c78',coroa:'#dcad62',mentira:'#ad91e5',chama:'#f29359',fome:'#c1ad62',podridao:'#9cb56b',silencio:'#a7b3c3',carne:'#d997a8',vazio:'#a591c7',protecao:'#86c4e0',cura:'#83d1b4',justica:'#dbcb8b',esperanca:'#eed28a',verdade:'#9bd5de',uniao:'#c5b7ef',criacao:'#9dcba5','correntes-quebradas':'#bca8f0'};
let serial=0;
// Small marks use the same drawing as the full heraldry, without tiny lettering.
export function eloVisual(id) {
 const design=designs[id];
 return design?{path:design.solid,accent:palettes[id]}:null;
}
export function eloSigil(id,extraClass='') {
 const visual=eloVisual(id);
 if(!visual)return '';
 return `<svg class="elo-sigil ${extraClass}" viewBox="${id==='correntes-quebradas'?'0 25 200 155':'25 30 150 140'}" fill="currentColor" aria-hidden="true" focusable="false"><path fill-rule="evenodd" d="${visual.path}"/></svg>`;
}
export function eloCrest(elo,extraClass=''){
 const id=`crest-${elo.id}-${++serial}`,design=designs[elo.id]||designs.vazio,accent=palettes[elo.id]||'#cbb4e7';
 const heaven=elo.realm==='Paraíso',limbo=elo.realm==='Limbo';
 const frame=heaven?'M100 8 122 34 151 28 154 63 178 88 165 115 167 153 132 167 100 210 68 167 33 153 35 115 22 88 46 63 49 28 78 34Z':limbo?'M100 8 155 35 179 88 164 126 176 161 124 188 100 211 58 187 22 139 39 106 23 63 68 29Z':'M100 8 122 31 155 25 153 58 180 80 164 109 178 146 141 158 126 192 100 210 74 192 59 158 22 146 36 109 20 80 47 58 45 25 78 31Z';
 const interior='M100 29 146 53 158 100 144 144 100 183 56 144 42 100 54 53Z';
 return `<svg class="elo-crest ${extraClass} crest-${heaven?'sanctuary':limbo?'fracture':'infernal'}" viewBox="0 0 200 230" role="img" aria-label="Brasão do Elo ${elo.name}"><defs><linearGradient id="${id}-metal" x2=".6" y2="1"><stop stop-color="#f0dcab"/><stop offset=".35" stop-color="#b69a64"/><stop offset=".36" stop-color="#64533c"/><stop offset=".76" stop-color="#9c835a"/><stop offset=".77" stop-color="#352f2b"/></linearGradient><linearGradient id="${id}-enamel" x2=".8" y2="1"><stop stop-color="${accent}"/><stop offset=".47" stop-color="${accent}"/><stop offset=".48" stop-color="#303242"/><stop offset="1" stop-color="#111723"/></linearGradient></defs><path class="crest-shell" d="${frame}" fill="url(#${id}-metal)" stroke="#070c14" stroke-width="4"/><path d="${interior}" fill="#111823" stroke="${accent}" stroke-opacity=".45" stroke-width="2"/><path d="M100 38 139 59 149 99 137 138 100 173 63 138 51 99 61 59Z" fill="url(#${id}-enamel)" opacity=".2"/><path d="M56 59 48 100 62 140M144 59 152 100 138 140M76 164 100 188 124 164" fill="none" stroke="#e5d0a0" stroke-width="2" opacity=".6"/><g fill="${accent}" stroke="#080d16" stroke-width="3" stroke-linejoin="round"><path fill-rule="evenodd" d="${design.solid}"/></g><path d="${design.etch}" fill="none" stroke="#fff1cb" stroke-width="2.5" stroke-linecap="round" opacity=".85"/><path d="M88 17 100 7 112 17 100 26Z" fill="${accent}" stroke="#f8e9b5" stroke-width="1"/><path class="crest-ribbon" d="M31 185 44 178H156L169 185 156 205H44Z" fill="#101722" stroke="#a99160" stroke-width="1.3"/><text x="100" y="195" text-anchor="middle" fill="#eadab4" font-size="9" font-family="system-ui" letter-spacing="1">${elo.name.toUpperCase()}</text></svg>`;
}

