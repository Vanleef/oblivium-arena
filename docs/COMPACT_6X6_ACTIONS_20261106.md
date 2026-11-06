# Campo compacto 6×6: comandos diretos, movimento e sequência — 06/11/2026

**Status:** implementado na branch de desenvolvimento do PR #3, ainda não mesclado à `main`. O escopo é o laboratório local `/tactical.html`, contra IA; não representa PvP autoritativo nem integração concluída com a campanha principal.

## Interação direta

O campo possui 6 colunas × 6 linhas. Acima da grade há um painel **compacto e contextual**, visível também no celular:
- Três personagens aliados com miniatura, seleção por toque e duas posições de ação cada. O jogador vê nome e ordem da técnica ou do movimento sem abrir a lista no rodapé.
- Barra horizontal de seis escolhas: Mover, Guarda e quatro técnicas. A técnica selecionada fica destacada. Recargas e requisitos bloqueiam técnicas indisponíveis.
- Depois de escolher Mover ou uma técnica, tocar na casa-alvo registra imediatamente a ação. Guarda entra na fila com um toque. **Não há confirmação intermediária para cada destino.**
- Toque sobre qualquer ação registrada para retirar essa ação e as ações posteriores do mesmo personagem, revalidando as restantes. Desfazer e Limpar são acessíveis junto à grade.
- O primeiro e o segundo espaços são numerados. Ao preencher os dois espaços dos três personagens **aptos a agir**, o plano é enviado automaticamente, sem botão obrigatório embaixo da arena. O botão discreto `▶ Agora` acima da grade é opção de envio antecipado, para uma rodada com menos ações.
- A troca de personagem pode acontecer pelo retrato contextual ou pelo personagem no campo, sem perder o plano. Para não impedir técnicas de suporte, tocar em um aliado enquanto uma técnica de alvo aliado está selecionada **não** troca de personagem.

## Regras e apresentação

- Duas ações por personagem e até seis por equipe; **cada ação de movimento percorre apenas uma casa adjacente**, podendo ser diagonal. O segundo movimento do mesmo personagem requer sua segunda ação.
- A prévia serve somente para verificar alcance, posição projetada do próximo ataque e destacar um destino pontilhado. O **modelo do personagem permanece em sua posição real**; não se teletransporta ao selecionar a ação.
- As equipes escolhem secretamente. Quando ambas terminam, executam-se todas as ações número 1 e depois as ações número 2. Movimentos da mesma etapa consideram a mesma ocupação inicial; colisões param os concorrentes.
- Em Vendaval, a distância continua sendo uma casa, mas mover concede **+5 Escudo**, respeitando o limite de metade da Vida máxima. Tempestade e Chuva continuam no ciclo de quatro rodadas.
- As casas de objetivo continuam privadas e do mesmo tier entre equipes. No campo novo, a primeira aparece a pelo menos **três casas** dos aliados; as próximas, pelo menos duas. A recompensa permanece exclusiva do coletor e válida pelo combate.
- A IA preserva a visão pública, sem planos do adversário, e atribui valor ao percurso necessário e aos aprimoramentos das casas especiais. Esses pesos ainda exigem testes de diversidade do elenco.

## Validações mensuradas

A primeira versão 6×6, commit `65b99007`, teve [CI com job compacto aprovado](https://github.com/Vanleef/oblivium-arena/actions/runs/42272995203): **15/15 testes compactos e 207/207 testes táticos/Conquista**, 12 simulações espelhadas sem falhas e build de **4.362 arquivos**. A amostra inicial 6×6 terminou em **109 rodadas (média 9,08; máximo 17)**, com 18 Guardas, 11 coletas e 22 eventos. A queda em coletas motivou reequilibrar a posição de objetivos e sua prioridade na IA, mas a nova variante precisa de validação própria antes de relatar melhorias.

**Não validado:** legibilidade ou dimensões no navegador real e em aparelhos móveis; arte individual, animações específicas do restante do elenco; qualidade final do balanceamento; suíte global do projeto (ainda possui falhas de compatibilidade com regras antigas e outras a classificar); conflitos do PR #3 contra `main`. Nenhum dado acima implica cobertura total de animações ou publicação em produção.

## Código envolvido

`src/tactical-board.js` (alcance), `src/tactical-combat.js` (tamanho e sequência), `src/tactical-elements.js` (Vendaval), `src/compact-demo.js` e `compact-planning.css` (interface), `src/conquest-objectives.js` (distância das metas), `src/tactical-ai.js` (escolha da IA), `tests/tactical-compact.test.js` e `tests/tactical-compact-ui.test.js` (regressões), `scripts/smoke-compact.mjs` (simulações).

Ver também: [regras históricas 5×5](COMPACT_SIMULTANEOUS_20261105.md), [auditoria de animações](TACTICAL_ANIMATION_COVERAGE.md) e [linha de base de balanceamento](COMPACT_BALANCE_BASELINE_20261106.md).
