# Atlas tático de Soren — 13/11/2026

O atlas compacto de Soren foi conectado ao renderer na branch `fix/compact-card-readability-20261110`.

| Personagem | ID | Arquivo | Grade |
| --- | --- | --- | --- |
| Soren, A Escriba | `a-ultima-pagina` | `art/animations/tactical-compact-20261113/soren.webp` | 6×6, células de 209×209 px |

## Linhas

1. Repouso.
2. Caminhada.
3. `impulso` — Inscrever o Fim.
4. `tecnica` — Rasura Terminal.
5. `voto` — Encerrar o Vestígio.
6. `despertar` — Folha Nula.

Cada linha de ação tem seis quadros e usa a sequência de fases do slot. Não há formas alternativas para Soren. A arte de passiva, retrato e técnicas estáticas continua nos diretórios canônicos; a passiva não ganhou animação autônoma de sprite.

## Integração e cobertura

`src/tactical-sprites.js` registra o atlas base como phased. O renderer associa as quatro técnicas aos slots existentes de Soren. A folha mantém a aparência da personagem — pele castanha, tranças com adornos metálicos, gola clara e vestes violeta/carvão — com efeitos de inscrição ritual, contato e impacto físico. Os quadros foram contidos nas células para manter margem transparente.

Cobertura após esta leva: 61/150 atlas base, 271/689 técnicas/formas com quadros de ação e 28 recortes específicos de habilidade. Consulte [TACTICAL_ANIMATION_COVERAGE.md](TACTICAL_ANIMATION_COVERAGE.md).
