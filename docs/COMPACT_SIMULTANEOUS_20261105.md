# Retorno ao campo compacto e planejamento simultâneo — 05/11/2026

O acesso padrão a `tactical.html` volta ao campo 5×5 com planejamento da rodada inteira. Cada personagem pode receber até duas ações; o trio tem até seis. O plano pode ser desfeito ou limpo antes de uma confirmação única. A prévia mostra a posição planejada com a indicação “plano”; não executa ações no combate.

## Resolução

As equipes selam seus planos a partir do mesmo estado inicial. A visão passada à IA não contém o plano do jogador, seu objetivo privado ou o estado aleatório futuro. Quando ambas confirmam, os planos são revelados e todas as primeiras ações acontecem antes das segundas.

Em cada etapa, movimentos usam a mesma ocupação inicial. Se os dois lados disputarem a mesma casa, ambos param. Preparações/defesas da etapa precedem técnicas ofensivas, com iniciativa alternada entre rodadas nos empates. Uma unidade derrotada ou atordoada antes da sua ação não a executa. Uma colisão não remove automaticamente a segunda ação.

Movimento usa uma ação e alcança até duas casas por caminho livre, incluindo diagonais. A outra ação pode ser outra movimentação, uma técnica ou Guarda. Guarda concede até 6 de Escudo respeitando o limite normal. As técnicas mantêm o balanceamento e as recargas do modo recente, incluindo o ataque básico; este retorno não reintroduz custos de Essência. Repetir uma técnica em recarga na mesma rodada é rejeitado pela prévia.

## Aprimoramentos e eventos preservados

- Casa objetivo privada por equipe, com emblema e o mesmo tier para os dois lados. Distância mínima adaptada: três casas no primeiro surgimento, duas nas coletas seguintes. A casa nunca nasce ocupada.
- A coleta pertence ao personagem que chega. Ao terminar a rodada, o jogador escolhe uma de três melhorias permanentes **neste combate**, vinculadas à habilidade do coletor. O crescimento visual segue os incrementos decrescentes existentes.
- Prata, Ouro e Prismático mantêm os desbloqueios por conclusão de reinos, os valores mínimos de 5 e o acúmulo integral das melhorias.
- Superfícies e interações elementais continuam no campo. Tempestade, Vendaval e Chuva aparecem a cada quatro rodadas; no campo compacto, Vendaval amplia cada movimento para até três casas.
- Regras ambientais opcionais, trilhas, recompensas entre encontros, Vida restante e encontros de campanha com criaturas continuam disponíveis.

As invasões e o fechamento do tabuleiro 9×6 ficam fora do fluxo compacto. Os laboratórios anteriores permanecem acessíveis explicitamente por `?fortress` e `?classic`. Os 43 atlas base e os recortes já integrados são reutilizados.

## Interface

O trio mostra contadores de ações e um resumo privado das sequências. Técnicas continuam visíveis e desativadas durante reprodução e escolhas de recompensa. Formas, recargas, selos, requisitos, Resíduo, Fraturas e Sombra Preparada são considerados no planejamento. O campo tem geometria fixa independente das animações e da altura dos textos; no mobile, aparece acima das técnicas.

## Verificação

Fluxo verificado: seleção na interface → plano local → confirmação → Worker da IA com visão filtrada → motor da rodada → reprodução → recompensa individual → planejamento seguinte. Este laboratório usa estado local e IA; não constitui implementação de PvP com servidor autoritativo.

- **197 testes aprovados**, incluindo dez novos testes de campo compacto e interface. Cobrem sigilo, confirmação, duas ações por personagem, colisões nos dois sentidos de confirmação, coleta, isolamento do aprimoramento, recargas, eventos, estabilidade do campo e continuação da campanha.
- **Build: 4.362 arquivos**. `git diff --check` aprovado.
- **Três combates completos**, 16 rodadas, 171 eventos e 11 coletas, sem erros de resolução, sobreviventes sobrepostos ou fora do tabuleiro. Não é uma avaliação estatística de balanceamento.
- No navegador, seis ações foram planejadas e confirmadas juntas. O painel manteve cinco técnicas visíveis e bloqueadas durante a reprodução. Uma coleta ofereceu três opções Prata para Riven; escolher Impacto em Incisão de Abate alterou o texto de 15 para 20 de dano e apenas o coletor cresceu.
- Em largura de **390 px**, campo de **356×356 px**, sem transbordamento horizontal, com dimensões idênticas antes/durante a animação. Em largura de **980 px**, campo de **450,8×450,8 px**, também sem transbordamento. No desktop principal, o campo ficou em **540×540 px**. Estas medições são de navegador, não de aparelho físico.

Comandos: `npm run test:compact`, `npm run smoke:compact`, e a suíte ampliada `node --test tests/tactical-*.test.js tests/tactical-*.test.mjs tests/conquest-*.test.js tests/combat-scenes.test.js`.
