# Responsividade integral da tela de combate — 07/11/2026

## Escopo

Consolidação de toda a tela de **arena tática compacta 6×6**. Não altera regras de combate, posicionamento lógico, duração dos turnos, movimentos, habilidades ou arts dos personagens.

## Problema

As regras de layout históricas estavam acumuladas em três estilos de combate com breakpoints parcialmente contraditórios (`420`, `720` e `760px`). Em telefones, o painel de ações ficava estreito, havia rolagem aninhada e comandos ficavam abaixo da altura máxima calculada a partir do campo. Em desktops menores, os diagramas 7×7 das técnicas competiam por espaço com a arena.

## Implementação

Criado `compact-responsive.css`, carregado **por último** em `tactical.html`, para centralizar ajustes sem reescrever efeitos visuais aprovados.

- **Desktop (≥1160px):** arena lado a lado com painel de 238–276px e campo quadrado de até 735px; informações secundárias acompanham a largura.
- **Tablet/laptop (601–1159px):** painel de 208–260px e campo dimensionado pelo espaço restante. Técnicas, diagramas e ações não são ocultados por um contêiner de altura fixa.
- **Celular estreito (≤600px):** HUD no topo, tabuleiro quadrado em largura quase total, painel de ações completo abaixo da arena; seis técnicas em até duas colunas, nomes e mini-diagramas legíveis.
- **Celular muito estreito (≤380px):** habilidades passam a uma coluna, com ícone, nome e área na mesma linha; HUD mantém as três unidades de cada equipe.
- **Paisagem de baixa altura:** a página rola naturalmente; não oculta ações por limites de viewport.
- **Componentes auxiliares:** cabeçalho, anunciador de rodada, trio aliado/inimigo, controle de velocidade, painel de planejamento, formação, recompensas, baús, indicadores de efeitos e logs respeitam larguras e quebra de texto.
- **Acessibilidade:** foco visível em botões/links/seletores, alvos com área de toque maior, animações com preferência de movimento reduzido respeitada.

O CSS novo também anula o `aspect-ratio:1` histórico dos botões de habilidade: o desenho 7×7 de área não expande o comando para um quadrado gigante.

## Verificação

Novo `tests/tactical-responsive-screen.test.js` com seis testes de contrato estático (carregamento correto de CSS, desktop/tablet, telefone, paisagem, seções preservadas e geometria em **320, 360, 375, 390, 430, 600, 601, 680, 720, 760, 820, 1024, 1199, 1280 e 1440px**). Os seis passaram em verificação isolada.

Essa verificação **não substitui** testes de screenshot em navegador nem uma execução integral do runner Node. Reproduzir nos tamanhos citados e validar também rotação de tela, safe area, zoom do navegador e altura de interface do celular.

```sh
node --test tests/tactical-responsive-screen.test.js tests/tactical-compact-ui.test.js
npm run test:compact
npm run smoke:compact
npm run build
npm test
```

## Riscos conhecidos e próximos passos

- Confirmar manualmente em browser real que efeitos e nomes na primeira/última linha da grade não sofrem recortes.
- Confirmar que a transição entre layout lateral e vertical mantém o canvas de partículas sincronizado com o novo tamanho da grade.
- O painel fica abaixo do tabuleiro em telefones estreitos. O jogador poderá precisar rolar para selecionar uma habilidade e depois rolar de volta para apontá-la no tabuleiro; uma melhoria futura possível é uma barra compacta de ações persistente, desde que não obscureça a arena.

A branch de feature continua separada da `main`; PR #3 permanece draft.
