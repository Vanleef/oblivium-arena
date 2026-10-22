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

A verificação publicada será registrada após o deploy. Renderização em navegador não equivale a aparelho físico.
