# Expansão de atlas — Conquista

Quatro atlas integrados em `art/animations/tactical-expansion-20261105/`, 960 × 960 pixels RGBA WebP, células de 160 × 160. Cada um tem seis linhas: repouso, caminhada e quatro técnicas base. As seis fases das técnicas são preparação inicial, antecipação, concentração, contato, acompanhamento e recuperação. O repouso usa um desenho completo de prontidão com respiração aplicada pelo jogo. Não são 36 desenhos exclusivos por personagem.

As formas alternativas reutilizam a sequência do slot; não receberam atlas exclusivos nesta etapa. As passivas não receberam novos atlas. As vistas verticais próprias continuam restritas aos seis personagens iniciais e só são usadas durante as técnicas. A postura padrão é horizontal.

## Geração e prompts

Imagens geradas com a ferramenta integrada de geração de imagens. Referências: retratos existentes em `art/characters/<id>/dark-pictorial-rework-20261030/portrait.webp`. Preparação técnica: separação das células, margem transparente e escala uniforme por atlas; não houve redesenho manual por código.

Direção comum: anime 2.5D pictórico com influência de Arcane e Spider-Verse; silhuetas legíveis, anatomia coerente, olhar lateral, mesma escala, fundo transparente, seis colunas por seis linhas. Poderes físicos e rituais, sem tecnologia, feixes finos, texto, grade desenhada ou olhar para a câmera.

| Personagem | Identidade preservada | Ações solicitadas no prompt | Material dos VFX |
| --- | --- | --- | --- |
| Cassian | Cabeça raspada, pele escura, halo ritual partido, vestes vinho e marfim | Carimbar selo pesado, ajoelhar e envolver tecido no peito, golpe de palma com placas do halo, proteção de manto e halo | Fragmentos rituais dourados e vermelho escuro |
| Annius | Topete grisalho preso, barba branca, robe escuro com estolas marfim e punhos dourados | Extrair memória de pergaminho, quebrar tabuleta de proteção, rasgar papéis com gesto amplo, envolver o corpo em tecido e névoa | Papel e cinzas lilases |
| Ignis | Cabelo ruivo curto, casaco marfim queimado, roupa escura e luvas | Arremessar piche ardente com torção do tronco, pisar e lançar brasas, socar o chão, dissolver-se em fuligem | Carvão e brasas densas |
| Emberlyn | Pele escura, cabelo crespo e trança vermelha, roupas carvão, fissuras de brasa no rosto | Golpe de palma, comprimir cinzas, soco baixo e pisão, fechar manto de cinzas em torno do corpo | Cinzas, carvão e fogo vermelho |

Os novos fragmentos substituem partículas genéricas no mesmo orçamento de até 36 partículas por impacto coletivo. Movimento reduzido suprime os fragmentos adicionais.

## Verificação

Os atlas empacotados têm margem transparente de pelo menos seis pixels em cada célula. A validação de margem não substitui a avaliação artística da imagem original. O inventário geral e os valores efetivos podem ser regenerados com `node scripts/audit-conquest.mjs` e `node scripts/audit-tactical-animation.mjs`.
