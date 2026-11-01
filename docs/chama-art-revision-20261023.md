> **Registro histórico.** Nomes, títulos, contagens, regras e direções visuais deste relatório refletem sua etapa de produção. Para o estado vigente, consulte [o índice canônico](PROJECT_CANON.md), [o catálogo atual](CHARACTER_CATALOG.md) e [a direção de arte](ART_DIRECTION.md). IDs e caminhos antigos permanecem por compatibilidade.

# Chama — O Furor e O Colérico

Data: 23/10/2026. Escopo deste lote: **2 conjuntos, 14 imagens**.

| Personagem | Identidade visual | Imagens |
| --- | --- | ---: |
| O Furor | Constructo de placas negras flutuantes, face sem feições, arco fragmentado, núcleo incandescente e cauda de cinzas | 8 |
| O Colérico | Ogro cinzento de chifre único, correntes no ombro direito e armadura de costelas em torno de uma fornalha espiritual | 6 |

Cada conjunto tem retrato, passiva e quatro habilidades. O Furor também recebe imagens exclusivas para **Punho do Ódio Solto** e **Ressentimento sem Freio**. As duas imagens retornam às versões base quando a transformação termina.

## Leitura das cenas

- **Furor:** placas danificadas na passiva, impacto físico no Punho de Rancor, preparação pessoal em Alimentar o Ódio, descarga espiritual contra um inimigo em Explosão do Ressentimento e separação das placas para deixar uma lança atravessar o espaço vazio em Fúria Intocável. As formas de fúria têm composições próprias.
- **Colérico:** resposta ao mesmo agressor na passiva, soco físico em Batida Escaldante, cotovelada e sobreaquecimento pessoal em Sangue em Ebulição, impacto físico concentrado em Coração em Erupção e miragem térmica pessoal em Pulso Intangível.

Estilo anime com contornos fortes, sombras em blocos e cenas individuais. Imagens entregues em WebP de 512 × 512 pixels, com caminhos versionados para preservar os arquivos anteriores. Os prompts completos, os hashes e a revisão de cada cena estão em `CHAMA_ART_REVISION_20261023.json`.

## Validação

Os 140 testes funcionais passaram, incluindo a troca e a restauração das duas artes transformadas do Furor. A comparação dos 100 personagens com o início deste lote confirmou mecânicas idênticas; nomes, lores e IDs também foram preservados.

Dois testes antigos de presença de arquivos de arte foram excluídos desta execução porque os binários históricos não estão materializados neste checkout. Os caminhos de arte do catálogo são conferidos contra a árvore completa do GitHub e os novos arquivos locais, sem criar arquivos substitutos. A verificação visual da prévia é registrada separadamente após a publicação do branch de revisão.

Este relatório registra somente este lote. Os totais de 22/10 em `ART_REVISION_STATUS.md` permanecem como histórico, pois outras revisões de 23/10 têm manifestos próprios.
