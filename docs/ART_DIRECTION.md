# Direção de arte de PMA

## Linguagem visual

- Anime japonês 2D de ação sobrenatural, com line art expressiva, silhuetas claras, cel shading e efeitos desenhados à mão.
- Fantasia sombria legível e vibrante; evitar pintura realista, acabamento fotográfico ou 3D.
- As cores indicam os reinos, mas identidade vem também de rosto, idade, porte, cabelo, roupa, postura e formas dos efeitos.
- Retratos mostram a identidade específica do personagem. Passivas e habilidades podem mostrar o efeito ou símbolo sem repetir o retrato.
- Cada imagem deve continuar reconhecível em miniaturas de 25 a 64 px.
- Sem letras, logotipos, personagens de franquias conhecidas, gore ou texto embutido.

## Conjuntos já produzidos

Cada personagem jogável inicial tem seis imagens quadradas: retrato, passiva e quatro técnicas. As imagens estão em WebP individuais; as folhas 3×2 originais ficam em `art/source/`.

| Personagem | Identidade | Motivos de habilidade | Arquivos |
| --- | --- | --- | --- |
| O Escudo Vivo | Mulher de 38 anos, pele escura, cabelo prateado curto, porte largo e armadura assimétrica de vidro azul | Chama protegida, muralha de vitral, amparo individual, três escudos conectados e domo dourado | `art/characters/o-escudo-vivo/` |
| A Brasa Eterna | Homem de 24 anos, corpo esguio, cabelo cacheado preto raspado nas laterais e trança vermelha | Carvão aceso, faísca de impacto, coluna vertical de fogo, marca no chão e manto de cinzas | `art/characters/a-brasa-eterna/` |
| O Passo Interrompido | Pessoa andrógina de 21 anos, olhos de cores diferentes, corte assimétrico e casaco longo marfim e violeta | Prisma em órbita, chão aberto, pegadas fora de fase, espelho estilhaçado e desvio espacial | `art/characters/o-passo-interrompido/` |

O chefe O Fim (The End) tem retrato próprio em `art/characters/o-fim/portrait.webp`: uma figura mascarada e não humana, com coroa de ferro queimado. A linguagem de anime conecta os quatro designs; as silhuetas, paletas e elementos de cada um continuam distintas.

Os recortes seguem os nomes `portrait.webp`, `passive.webp`, `skill-impulso.webp`, `skill-tecnica.webp`, `skill-voto.webp` e `skill-despertar.webp`. `skill-despertar.webp` é sempre a técnica defensiva e deve comunicar proteção, evasão, restauração ou redirecionamento.

## Regras para novas artes

1. Defina antes a idade, o corpo, o rosto, o cabelo, a roupa e a silhueta do personagem. Compare esses itens com os designs existentes para evitar que pareçam variações do mesmo modelo.
2. Faça um retrato só para a identidade do personagem. Não repita o rosto em todos os ícones de habilidade.
3. Crie uma imagem por técnica, orientada pelo efeito mecânico e pelo nome. Varie enquadramento, geometria, escala e ponto de vista entre os quadros.
4. Mantenha line art e cel shading consistentes entre a coleção; varie as cores e formas internas para refletir o reino e a habilidade.
5. Confira o recorte quadrado em tamanho pequeno antes de integrar a folha. Evite repetir círculos, chamas, escudos ou explosões quando não forem a mecânica específica daquela habilidade.
