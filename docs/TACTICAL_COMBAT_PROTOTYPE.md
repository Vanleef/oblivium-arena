# Oblivium Arena — primeiro protótipo tático

Implementado em 01/11/2026 na branch de revisão do PR #3. A [proposta completa](TACTICAL_COMBAT_PROPOSAL.md) continua sendo a referência de evolução.

## Jogar e testar

1. Na branch de revisão, execute `npm run dev`.
2. Abra `http://localhost:4173/tactical.html`.
3. Selecione uma alma, escolha movimento ou técnica, marque uma região e adicione à fila.
4. Confira os pagamentos e revele os planos. A IA confirma sem ler a fila do jogador.
5. Use “Nova formação” para trocar trios, mapa e semente.

`npm run test:tactical` executa os testes do tabuleiro, do combate e do fluxo da interface. A build inclui o HTML, o CSS e os módulos do protótipo.

## Escopo implementado

- Tabuleiro compartilhado 5×5, uma unidade viva por célula.
- Três personagens por lado e até duas ações por personagem vivo.
- Movimento ortogonal ou diagonal de até dois passos, sem atravessar ocupação.
- Bloqueio de cantos fechados, linha de visão e movimento parcial em conflitos.
- Duas formações iniciais opostas e um mapa opcional com dois obstáculos.
- Planejamento oculto, confirmação independente e revelação conjunta.
- Ordem: movimento; preparações e defesas; ofensivas.
- Dentro de cada categoria, ordem relativa da fila e iniciativa alternada entre lados.
- Efeitos, passivas, marcas, cargas, custos e formas executados pelo motor atual.
- Reserva compartilhada dos quatro tipos de Essência, pagamento Coringa manual ou automático e troca 5→1.
- Preparação seguida de continuação ou transformação no mesmo planejamento.
- Prévia das posições próprias e das regiões, edição, remoção e reordenação.
- IA determinística limitada à visão pública.
- Log de movimentos, cancelamentos, dano, reações e encerramento.

## Kits piloto

| Identidade | Papel do teste espacial |
| --- | --- |
| Riven — O Ceifador de Tolos | Frente de duas células, limitada a uma vítima; continuação no mesmo espaço |
| Lira — A Noiva da Lua | Marca e consumo, alcance e contra-ataque pessoal |
| Aegis — O Escudo Vivo | Apoio individual, defesa e preparação |
| Chronos — O Descontínuo | Sequência de três formas no mesmo espaço de técnica |
| Corvin — O Furor | Transformação seguida de ataque na segunda ação |
| Verdant — A Arquiteta | Defesa em cruz e colapso em área 3×3 |

O mapeamento espacial não adiciona dano ou alvos a uma técnica individual: a frente de Riven seleciona no máximo uma vítima. Técnicas que já eram de trio ou de todos os inimigos passam a atingir os destinatários elegíveis dentro da região. Isso é uma regra experimental da conversão e precisa de balanceamento.

Nenhum arquivo de arte foi trocado. O campo usa peças com nome, Vida e Defesa para testar posicionamento sem depender da revisão das ilustrações.

## Regras experimentais adotadas

- Defesas e preparações entram antes dos ataques; Invulnerável protege a ofensiva daquela rodada e termina no encerramento.
- Recargas não avançam a cada ação, nem no encerramento da rodada em que foram ativadas.
- A mesma técnica de recarga zero pode ocupar as duas ações, respeitando suas mudanças de forma.
- Preparações e formas são projetadas na prévia; a execução cancela uma continuação quando a condição real deixa de existir.
- Uma técnica lançada numa região vazia paga seu custo. Cancelamento anterior ao lançamento preserva o pagamento.
- Geração futura e roubo previsto não financiam o orçamento inicial do plano.
- Ações de personagens derrotados são canceladas.
- Aflições têm um tick por encerramento; regeneração e geração natural ocorrem uma vez na abertura.
- Atordoamento e outros controles recém-aplicados mantêm sua duração para a próxima janela de planejamento.
- Movimentos disputados usam a ordem de iniciativa; um caminho interrompido para na última célula livre.
- O protótipo é local contra IA. Seu estado em memória pode ser inspecionado no navegador; os filtros de visão fornecem a fronteira necessária para uma futura API, sem constituir proteção de um cliente online.

## Verificação

22 testes específicos passaram: formação, orçamento, validação de entrada, caminhos, cantos, áreas, cobertura, sigilo, colisões, mira fixa, Invulnerável, recarga, preparações, formas, Coringa, troca, contra-ataque, área de Verdant, morte, aflições, controles, determinismo, serialização e fluxo da interface.

Uma simulação entre duas IAs chegou ao resultado de combate. A suíte completa ficou em 335 testes: 194 passaram e 141 falharam. As mesmas 141 falhas estavam presentes no checkout anterior; nenhuma falha nova apareceu com o protótipo. Essa suíte ainda não representa uma validação completa do jogo em produção.

## Próximas etapas

- Revisar os padrões e o balanceamento dos seis kits em partidas humanas.
- Adicionar deslocamentos especiais e empurrão/puxão com contratos próprios.
- Implementar as Técnicas Misteriosas e seu equipamento entre encontros.
- Adaptar a campanha e a persistência.
- Implementar confirmação simultânea e resolução sob autoridade do servidor na Arena online.
- Expandir o mapeamento para o restante das 150 entradas e suas variações.

O combate da campanha e da Arena online não foi substituído por este protótipo.
