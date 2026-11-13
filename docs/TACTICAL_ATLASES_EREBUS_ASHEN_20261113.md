# Atlas táticos de Erebus e Ashen — 13/11/2026

Dois atlas compactos de animação foram conectados ao renderer na branch `fix/compact-card-readability-20261110`. Cada folha WebP tem fundo transparente, 1254 × 1463 pixels e uma grade de 6 colunas por 7 linhas, com células de 209 × 209 pixels: repouso, caminhada, quatro ações do kit base e uma linha dedicada à forma alternativa.

| Personagem | ID | Atlas | Forma com linha dedicada |
| --- | --- | --- | --- |
| Erebus, O Arauto | `o-fim-silencioso` | `art/animations/tactical-compact-20261113/erebus.webp` | `voto:residual`, linha 7 |
| Ashen, O Desolador | `o-menino-sem-sombra` | `art/animations/tactical-compact-20261113/ashen.webp` | `tecnica:hide`, linha 7 |

## Organização das linhas

### Erebus

1. Repouso.
2. Caminhada para a direita.
3. Presságio de Extinção.
4. Cessar da Vontade.
5. Sem Últimas Palavras.
6. Instante sem Tempo.
7. Silêncio Residual, continuação de `voto` após esgotar os usos base.

### Ashen

1. Repouso.
2. Caminhada para a direita.
3. Toque da Desolação.
4. Recompor o Vazio.
5. Extinguir a Presença.
6. Presença Nula.
7. Recolher a Presença, continuação de `tecnica` com Vida baixa.

## Integração

`src/tactical-sprites.js` registra os dois atlas base e encaminha cada forma alternativa para sua linha dedicada. As artes existentes de passiva, retrato e habilidade permanecem nos diretórios de personagem; os atlas fornecem os quadros de combate. A passiva não ganhou uma animação autônoma de sprite.

As duas folhas foram inspecionadas após a geração: silhuetas e personagens ficam contidos nas células, as ações têm sequência de seis quadros e os efeitos permanecem compactos. As interações ofensivas usam contato físico e uma criatura infernal genérica. Os poderes defensivos ficam presos ao corpo e ao tecido dos personagens.

Cobertura após esta leva: 60/150 atlas base, 267/689 técnicas/formas com quadros de ação e 28 recortes específicos. O próximo kit pendente é Soren (`a-ultima-pagina`). O detalhe por personagem está em [TACTICAL_ANIMATION_COVERAGE.md](TACTICAL_ANIMATION_COVERAGE.md).
