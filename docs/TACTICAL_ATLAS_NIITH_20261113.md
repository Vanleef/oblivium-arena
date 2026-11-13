# Atlas tático de Niith — 13/11/2026

O atlas de Niith foi conectado ao renderer como oposição de campanha. Ele continua não selecionável no piloto.

| Personagem | ID | Arquivo | Grade |
| --- | --- | --- | --- |
| Niith, O Fim | `o-lugar-de-ninguem` | `art/animations/tactical-compact-20261113/niith.webp` | 6×6, células de 209×209 px |

## Linhas

1. Repouso.
2. Caminhada.
3. `impulso` — Apagar o Terreno.
4. `tecnica` — Coordenada Nula.
5. `voto` — Eliminar o Vestígio.
6. `despertar` — Contorno Inexistente.

As quatro técnicas usam seis quadros cada e não há forma alternativa registrada. A animação de `despertar` preserva a ideia de uma manifestação incompleta: o contorno e a armadura persistem enquanto o golpe atravessa o vazio.

## Integração e cobertura

`src/tactical-sprites.js` registra o atlas como phased e mapeia as técnicas aos slots existentes. As artes estáticas de passiva, retrato e habilidades permanecem nos diretórios canônicos. A passiva não ganhou animação autônoma de sprite.

O atlas mantém a silhueta do Lorde — armadura negra angular, tecido vermelho e olhos claros —, com ruína e cinza física nos ataques, sem feixes tecnológicos. Cobertura após esta leva: 62/150 atlas base, 275/689 técnicas/formas com quadros de ação e 28 recortes específicos de habilidade. Consulte [TACTICAL_ANIMATION_COVERAGE.md](TACTICAL_ANIMATION_COVERAGE.md).
