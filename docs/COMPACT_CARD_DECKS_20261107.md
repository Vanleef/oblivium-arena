# Baralhos individuais e Confronto de Vontades — 07/11/2026

## Estado
Protótipo conectado à arena compacta **6×6, 3v3, planejamento simultâneo contra IA** em `/tactical.html` na branch de desenvolvimento do PR #3. **Não** representa PvP online com servidor autoritativo, sincronização de decks entre contas ou release na `main`.

## Regras das cartas

- **Três baralhos e três mãos independentes por equipe**. Selecionar um aliado troca a mão visível, sem alterar os outros dois baralhos.
- Baralhos configuráveis com **8–10 cartas por personagem**; a formação inicia com oito cartas padrão: técnicas de seu kit, cópias, uma mobilidade e uma reação.
- Compra inicial de **3 cartas** por personagem; compra de **2 cartas** no início das rodadas seguintes, com mão máxima de seis. Cartas jogadas vão ao descarte, que é reembaralhado ao esgotar o monte; cartas com **Exaurir** saem do combate e as com **Preservar** ficam na mão. Técnicas neste modo **não recebem nem verificam recarga individual**: a disponibilidade volta quando a carta retorna pelo ciclo de compra e reembaralhamento.
- **Movimento padrão garantido**, fora do deck, uma vez por personagem por rodada, alcançando uma casa. Essa disponibilidade expira no fim da rodada e é recriada no começo da próxima. O **Ataque Básico** também fica acessível sem carta do monte e sem recarga.
- Cartas de técnica só podem ser usadas se estiverem **na mão do personagem correto**. O planejamento continua limitado a duas ações por personagem, seis ordens por equipe. Uma mesma carta só pode ser usada uma vez em cada rodada.
- A seleção e a validação de planos ocorrem antes da confirmação; cartas são descartadas apenas na confirmação real. Prévia e IA não consomem cartas.
- As cartas podem carregar **dano adicional, mudança de tipo de dano, Exposto, Enfraquecido, Preservar, Exaurir e Inicial**. A propriedade **Inicial** garante presença na mão inicial do próximo combate e não substitui o limite de mão.

## Cartas e desbloqueios por campanha

A montagem dos decks abre em **Nova formação → Equipar os três baralhos** e é salva no armazenamento local. As opções adicionais aparecem quando a campanha registra Reinos concluídos:

Depois de vencer um encontro, a tela de rota também oferece **Ajustar os três baralhos para a próxima batalha**. O atalho abre a mesma configuração individual dos três personagens do jogador; as mudanças são salvas localmente e passam a valer no confronto seguinte. O editor não altera a mão nem o plano do encontro já encerrado. Os builds locais são associados explicitamente ao lado do jogador: a IA continua com três decks próprios mesmo se os dois lados usarem o mesmo personagem. O PvP não mostra nem permite editar decks do rival.

| Reinos concluídos | Carta | Tipo | Efeito |
| --- | --- | --- | --- |
| 0 | Passo Longo | Mobilidade | Desloca até 2 casas |
| 0 | Último Suspiro | Reação | Fornece uma resposta extra quando utilizada |
| 1 | Passo Guardado | Mobilidade | Desloca até 2 casas e concede 5 de Escudo |
| 3 | Reverso Vital | Reação | Resposta extra; recupera 5 de Vida se bloquear a técnica |
| 8 | Salto Umbral | Mobilidade | Desloca até 3 casas |

As habilidades continuam específicas de cada personagem; as cartas compartilhadas acima são opções gerais. O motor valida se uma variante está desbloqueada, impedindo que uma configuração manual injete cartas de tiers ainda não obtidos.

## Aprimoramentos por Casa Objetivo

As recompensas continuam com **três opções**. No modo de cartas, uma delas pode ser **Inscrição de Carta**, aplicada a uma carta de técnica equipada do coletor:

- **Prata:** +5 de dano na carta escolhida.
- **Ouro:** +5 de dano, dano perfurante e **Preservar**.
- **Prismático:** +10 de dano, aplica **Exposto** e vira carta **Inicial**.

Essas inscrições são persistidas no deck local para os próximos combates/campanhas desse navegador. São exemplos iniciais que precisam de balanceamento antes de PvP competitivo.
Inscrições sucessivas na mesma carta somam o dano anunciado, sem um teto intermediário de 15; propriedades já adquiridas, como Preservar, continuam presentes. No PvP, inscrições de origem local continuam bloqueadas e apenas recompensas obtidas na própria partida são aceitas.

## Respostas — Confronto de Vontades

- Cada equipe dispõe de **uma resposta básica por rodada**, reabastecida ao começar a seguinte.
- Uma carta de reação na mão de um aliado vivo pode gerar **uma resposta adicional** e deve ser consumida quando selecionada.
- Diante de uma técnica especial contestável que tenha alvo na área, o defensor pode **responder** ou **aceitar o golpe** e poupar seus recursos.
- Se responder, as duas escolhas são secretas: **Miragem → Luz → Sombra → Miragem**. A IA define sua intenção antes da escolha humana e não lê a entrada posterior.
- **Vitória do ataque:** acerto crítico, **150% do dano base**; **empate:** dano normal; **vitória da defesa:** anula todos os efeitos dessa habilidade **sobre o personagem protegido**. Caso uma habilidade em área atinja outros personagens, eles continuam sujeitos à técnica normalmente.
- A carta é consumida e vai ao descarte mesmo se o efeito da habilidade for bloqueado. Existe, no máximo, um confronto por habilidade, sem cadeia infinita de reações.
- No combate local atual, a IA avalia se vale a pena gastar sua resposta. **Não há comunicação PvP em tempo real** ou autoridade de servidor para escolhas secretas entre humanos.

## Código e validação

`src/tactical-decks.js` — catálogo, compras, descartes, respostas, validação, variantes e upgrades. `src/tactical-combat.js` — integração ao planejador/resolução e Casas Objetivo. `src/combat.js` — efeitos da carta sobre habilidades. `src/tactical-ai.js` — planejamento com mão própria. `src/compact-demo.js` + `compact-cards.css` — mão contextual, respostas e editor. `tests/tactical-decks.test.js` — regressões.

Executar: `npm run test:compact`, `npm run build`. Ainda faltam testes completos de UI real em celular e desktop, testes de partidas PvP com dois clientes e balanceamento extensivo dos novos decks.
