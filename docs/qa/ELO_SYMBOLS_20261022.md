# Símbolos dos Elos sem moldura — 22/10/2026

Foram removidos do SVG dos 17 Elos o escudo de fundo, os preenchimentos internos de placa, os adornos externos, a pedra superior, a faixa e o nome desenhado. Os nomes continuam nos textos da interface e nos rótulos acessíveis. A marca d’água da trilha usa apenas o símbolo; os dois aros ornamentais que o cercavam foram removidos.

Os símbolos são vetores nativos do projeto. Cada Elo compartilha a mesma silhueta na campanha, no Codex, no combatente e no impacto de habilidade. A versão grande acrescenta somente cores e traços sobre o próprio símbolo, sem placa atrás. O SVG usa área quadrada consistente; o ícone de Proteção mantém seu escudo como significado do próprio Elo.

| Mundo | Linguagem | Símbolos |
| --- | --- | --- |
| Inferno | Recortes angulares, fraturas, materiais escuros e reflexos de cobre | Sangria, Coroa, Mentira, Chama, Fome, Podridão, Silêncio, Carne e Vazio |
| Paraíso | Curvas abertas, equilíbrio e luz marfim com dourado, azul ou verde claros | Proteção, Cura, Justiça, Esperança, Verdade, União e Criação |
| Limbo | Correntes interrompidas, fragmentos deslocados e violeta com reflexo ciano | Correntes Quebradas |

As superfícies dos SVGs não têm fundo, borda ou sombra em caixa. As indicações de seleção, bloqueio e foco dos botões foram preservadas; ícones de Elos bloqueados continuam legíveis. Nenhuma regra, kit, arte de personagem, custo ou alvo foi alterado.

Verificação local: 134 testes de regras/interface aprovados com `node --test --test-skip-pattern='o trio inicial tem retrato|os sessenta e sete personagens seguintes'`. Os dois testes de existência do acervo antigo ficaram fora porque a cópia local não contém todos esses arquivos. A revisão dos 17 desenhos foi feita em 76 e 20 px. Conferiu-se ausência de formas de moldura e texto interno nos SVGs e igualdade das silhuetas pequena e grande. Hash do catálogo excluindo campos `art`: `83a5cca5dbc136e19a4b23da42c002a054853d8597f1bf09682a87b967899e51`, preservado.

Renderização em navegador não equivale a aparelho físico.


## Verificação publicada

Prévia Vercel READY do commit `ca405d08d32f5e01315533e58b47323e937b2a2c`: https://pma-post-mortem-arena-3jxrygb2i-duduroque08-2993s-projects.vercel.app/

A aplicação real foi conferida em `/tests/fixtures/responsive.html`, nos três mundos, em 320, 390, 768 e 1200 px. Inferno exibiu nove símbolos de lista mais um selecionado; Paraíso sete mais um; Limbo um mais um. Os 12 cenários apresentaram zero placas, faixas, texto interno, fundo opaco, borda ou sombra de caixa nos SVGs. Cada mundo usou a família visual correta. Largura útil e scrollWidth foram iguais: 305, 375, 753 e 1185 px, respectivamente.

O Codex completo foi conferido nas mesmas quatro larguras: 100 símbolos, 17 silhuetas diferentes e distribuição correta de 54 Inferno, 35 Paraíso e 11 Limbo. Sem caixa por trás e sem rolagem horizontal. Navegação por teclado e por clique foi observada na aplicação real.

O cenário isolado `/tests/fixtures/combat.html` foi conferido nas quatro larguras nominais: seis símbolos de combatente, quatro de Inferno, um de Paraíso e um de Limbo, cada um contendo apenas sua silhueta. Zero fundo, borda, sombra de caixa ou overflow horizontal. A borda de 1 px do iframe desse cenário resulta em viewports internos de 318, 388, 766 e 1198 px; a largura útil foi 303, 373, 751 e 1183 px.

Na trilha de Sangria aberta pela interface, a marca d’água apresentou somente um símbolo, zero molduras/faixas/textos internos e zero aros orbitais. Os efeitos de impacto e contra-ataque continuam usando as mesmas silhuetas, verificados pelos testes existentes. Campanha e painel de Justiça foram revisados visualmente também na aplicação direta, fora de iframe.
