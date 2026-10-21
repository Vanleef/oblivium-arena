# Direção de arte de PMA

## Padrão obrigatório

Anime 2D de televisão, com contornos nítidos, rostos estilizados, mechas de cabelo gráficas, cores chapadas e sombras de borda dura. Pele lisa; tecidos, metal e pedra representados por formas desenhadas. O acabamento semirrealista do primeiro lote desta revisão foi rejeitado e não deve voltar como referência.

Evitar pintura digital realista, hachuras, granulação, poros, anatomia hiperdefinida, ferrugem fotográfica, dobras excessivas, iluminação volumétrica, profundidade de campo fotográfica e render 3D. A referência visual é `art/source/a-chama-que-nao-apaga-sheet.webp`, na versão de anime com casaco amarelo liso e chama azul.

## Identidade e poderes

Cada personagem precisa ter rosto, idade, porte, cabelo, roupa, postura e equipamento próprios. O Elo e o reino orientam o poder, mas não substituem a identidade individual. Os títulos são simbólicos: seres associados a objetos ou lugares podem se manifestar como humanoides, espíritos, constructos ou feras coerentes; não devem virar objetos grotescos com membros aleatórios.

Cada conjunto tem seis cenas independentes: retrato, passiva e quatro habilidades. Variar gesto, ação, distância da câmera, geometria e ponto de vista. As habilidades devem mostrar a assinatura do personagem — seu instrumento, arma, vestimenta ou manifestação de poder — em vez de símbolos genéricos. Não repetir o mesmo rosto em seis poses quase iguais, nem preencher o conjunto com círculos, rajadas ou explosões intercambiáveis.

A última habilidade comunica defesa pessoal por esquiva, aparo, intangibilidade, redirecionamento ou proteção própria. Evitar a fórmula recorrente de proteger um grupo sob uma bolha. Personagens formados por irmãos ou duplas continuam com corpos separados e ações legíveis.

## Revisão visual

Conferir mãos com cinco dedos, articulações, número de membros, empunhaduras e posição das armas. Distinguir intangibilidade intencional de arma atravessando um corpo sólido. Verificar continuidade de roupas, joias, correntes, instrumentos, próteses e lentes. Óculos e monóculos mantêm lentes coerentes; não inserir objetos inexplicáveis dentro delas.

Os recortes precisam ser legíveis como miniaturas. Revisar primeiro a prancha inteira e depois o retrato e os ícones quadrados. A validação automática verifica existência, integridade dos arquivos e duplicação exata; estilo, semântica e anatomia exigem inspeção visual.

## Organização

Cada personagem do catálogo usa `art/characters/<id>/portrait.webp`, `passive.webp`, `skill-impulso.webp`, `skill-tecnica.webp`, `skill-voto.webp` e `skill-despertar.webp`. As pranchas de seis células quadradas ficam em `art/source/<id>-sheet.webp`.

A identidade e as seis cenas planejadas de cada personagem estão registradas em `docs/art-revision-specs.json`. O script `scripts/integrate-art.py` apenas recorta e converte pranchas já produzidas; a criação e a correção das imagens usam geração de imagens.

## Cenários por habilidade

Cada uma das seis imagens de um personagem deve acontecer em um local realmente diferente, com composição, arquitetura ou paisagem, clima e horário próprios. Não repetir o mesmo pátio por causa da imagem de referência. O cenário deve participar da ação e fazer sentido no reino e no poder da personagem; evitar a mera troca de uma imagem de fundo atrás da mesma pose.

O planejamento completo está em `docs/art-scene-plan.json`: 100 personagens, 600 cenas e seis ambientes distintos por conjunto. A amostra em `art/review/anime-cel-style-reference.webp` é referência somente de traço e cores; seus cenários repetidos não são aprovados como padrão.
