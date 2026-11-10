# Confronto de Vontades — especiais com três intenções
Oblivium Arena · 07/11/2026 · Sistema ativo no modo tático compacto

## Objetivo

Trocar o desafio de reflexos inspirado em Expedition 33 por uma escolha **curta, estratégica e simétrica**, semelhante a pedra-papel-tesoura. A técnica cinematográfica continua sendo animada com a identidade física de cada personagem (especiais KOF), mas a disputa só acontece **uma vez por especial ofensivo elegível**, e não em cada quadro de contato.

O planejamento 3v3 segue **simultâneo e oculto** até ambas as equipes confirmarem suas ações. O Confronto ocorre na execução de uma habilidade ofensiva, quando seus alvos reais e a posição já estão definidos após os movimentos da rodada.

## As três intenções

| Intenção | Estilo | Vence | Perde para |
|---|---|---|---|
| **Miragem** | distorce a percepção e confunde intenções | Luz | Sombra |
| **Luz** | revela a verdade e rompe ocultações | Sombra | Miragem |
| **Sombra** | envolve e engole a falsa imagem | Miragem | Luz |

Atacante e defensor escolhem **uma** intenção dentre as mesmas três. A interface só mostra a resposta adversária depois que a escolha do jogador é concluída.

### Resultados

| Comparação | Resultado no motor | Efeitos ao alvo |
|---|---|---|
| Atacante vence | **Acerto decisivo — 150% do dano direto** | Efeitos completos da habilidade |
| Mesma intenção | **Choque de Vontades — 50% do dano direto** | Efeitos da habilidade atingida permanecem; é um acerto parcial |
| Defensor vence | **Especial evitado — 0 de dano direto** | Nenhum efeito de contato é aplicado ao alvo |

O último caso ainda consome **execução e recarga**, evitando o uso de especiais sem risco. Efeitos de autocusto continuam válidos. Os 150% e 50% são fatores de dano direto **antes** das reduções por escudo, resistência, passivas e demais sistemas; não são valores garantidos de PV.

Em habilidades de área, uma única decisão representa a interação do time defendendo a zona; os mesmos fatores são aplicados à técnica, mantendo o combate fluido.

**Atualização do modo com cartas:** ao empatar, a técnica causa 100% do dano normal, não 50%. A taxa de 50% permanece apenas no laboratório legado.

## Estratégia sem loteria cega

A IA local escolhe sua intenção **antes** da resposta humana, usando uma semente determinística de personagem, alvo, habilidade, lado e rodada. Não vê nem lê a opção do usuário.

Cada oponente possui uma **tendência de estilo observável**. Por exemplo, combatentes agressivos podem tender ao Miragem, evasivos à Luz e protetores à Sombra. A interface informa a tendência, **não a escolha real**.

A IA utiliza a tendência em aproximadamente metade dos confrontos; nas demais escolhas varia entre as outras duas possibilidades. Isso permite antecipação, blefe, leitura de oponente e escolha de personagens sem remover o risco.

## UX e controles

- **Desktop:** teclas **1, 2, 3** para Miragem, Luz e Sombra; Escape executa uma escolha automática explícita.
- **Mobile:** três botões grandes em linha com nome e uma frase curta de vantagem, responsivos até 320px e em orientação paisagem.
- Sem barras de timing ou exigência de reflexo. O jogador tem tempo para decidir; preferência por movimento reduzido não bloqueia a participação.
- Resultado: mostra as duas intenções escolhidas e o desfecho (acerto decisivo / choque / especial evitado).
- A animação de especial começa depois da escolha: golpes físicos, partículas características, impacto e números do dano efetivamente resolvido.
- **Erro do especial:** anima apenas preparação, ataque passando pelo alvo e recuperação. Não cria explosão de contato nem números de dano falsos.

## Arquitetura

- `src/tactical-duel.js` define as três intenções, ciclo, resultado, dano, tendência e escolha local da IA.
- `src/tactical-combat.js` coleta a dupla de escolhas no resolvedor de rodada por etapas e rejeita opções inválidas **antes** de retirar a ação da fila. Também evita que um especial perdido altere o terreno por um acerto fictício.
- `src/combat.js` usa `tacticalDuelDamage` e esvazia os alvos espaciais no resultado **miss**, passando pelo pipeline original de pagamento, cooldown e efeitos de contato.
- `src/compact-demo.js` tem o painel de escolha única, a revelação posterior, paleta do ator e teclado/toque; a interrupção de interface aciona choque neutro em vez de acerto gratuito.
- `src/tactical-cinematic.js` oferece uma animação própria sem impacto para o resultado de erro.
- `compact-combo.css` recebe a apresentação responsiva da Tríade.
- `tactical.html` atualiza o identificador de cache de CSS/JS para a implementação nova.

## Testes e critérios de aceite

- `tests/tactical-duel.test.js`: 9 combinações possíveis, relação cíclica, resultados de dano, entrada inválida, IA predeterminada e tendências.
- `tests/tactical-combo-ui.test.js`: elementos da tela, rótulos, confirmação oculta, campos da ação, teclas, responsividade e falha segura.
- `tests/tactical-combo.test.js`: replay real sem multiplicar efeitos e sem dano fictício quando evita o golpe.
- `tests/tactical-cinematic.test.js`: lançamento de especial que erra mantém animação física, mas não tem frame de colisão.
- `tests/tactical-combo-round.test.js`: planejamento selado e resolução em ondas existentes.

Foram executadas **41 verificações isoladas de código, regras, UI, sintaxe e CSS**, todas aprovadas. Uma simulação do resolvedor em etapas com dependências de combate simuladas confirmou: vitória com 30 de dano em base 20, empate com 10 e derrota com 0, além de rejeitar decisões inválidas sem avançar a fila.

**Não equivale** a executar a suíte Node inteira, validação em navegador real, testes de todos os kits nem a balanceamento completo. Antes de fazer merge, revisar esses caminhos em desktops e celulares, particularmente técnicas de área, furtividade, invulnerabilidade, bloqueios e passivas.

```sh
node --test tests/tactical-duel.test.js tests/tactical-combo-ui.test.js tests/tactical-combo.test.js tests/tactical-combo-round.test.js tests/tactical-cinematic.test.js
npm run test:compact
npm run smoke:compact
npm run build
npm test
```

## Limites explícitos

É um primeiro modo **local contra IA**. Ainda não há protocolo de commit/reveal, validação de escolhas no servidor nem sincronização para PVP online. As opções de reação cronometrada anteriores continuam documentadas para histórico, mas **não são o sistema de especiais ativo**.
