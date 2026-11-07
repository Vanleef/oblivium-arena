# Oblivium Arena — Combate de três baralhos (07/11/2026)

## Como funciona agora

- Cada equipe tem **três decks independentes** de 8–10 cartas, um por personagem, e três mãos separadas. Compra 2 cartas por alma a cada rodada.
- O **Ataque Básico** é uma ação permanente sem custo, sem recarga e fora do deck; causa 5 de dano físico a um alvo adjacente.
- **Movimento Padrão** é uma carta temporária garantida a cada rodada (fora do deck). Permite andar **uma casa** e pode ser combinado com uma técnica no mesmo turno.
- O campo tático é **5×5**, com formação inicial nas três linhas centrais das extremidades. Casas ocupadas são bloqueadas; colisões simultâneas na mesma casa impedem ambos os deslocamentos. Técnicas e ataques têm alcance validado; o campo destaca destinos, alcance e alvos.
- A IA do PvE se move para se aproximar dos alvos e só depois escolhe técnicas que alcancem inimigos.
- O jogador pode equipar 8–10 cartas por personagem no editor do trio. Duplicatas são instâncias separadas. No ranqueado, o servidor valida os baralhos e não admite aprimoramentos permanentes da campanha.

## Planejamento simultâneo no PvP

Cada equipe prepara até uma técnica por personagem e até um movimento por personagem. Os planos são secretos e podem ser confirmados independentemente. Depois da segunda confirmação, o servidor:

1. Resolve os movimentos das duas equipes **simultaneamente**, com colisões e ocupação.
2. Alterna ações das duas equipes, com prioridade da iniciativa invertida a cada rodada.
3. Abre uma janela de Confronto de Vontades quando uma técnica ofensiva válida pode ser respondida.
4. Processa os efeitos, compra a próxima mão e gera novas cartas de movimento.

O servidor valida card IDs, propriedade do personagem, pagamento de Essências, posição e alvo. O estado público oculta cartas inimigas, ordem do deck, planos, movimentos secretos e escolha de Vontade até a resposta. O cliente da segunda equipe vê o grid espelhado, enquanto o servidor mantém coordenadas canônicas.

## Confronto de Vontades

- **Miragem distorce e engana a Luz.**
- **Luz revela, dissipa e atravessa a Sombra.**
- **Sombra oculta e engole a Miragem.**

Resultado da defesa: anula o impacto e os efeitos no alvo protegido. Empate: efeito normal. Resultado do atacante: crítico de **×1,4** no dano de impacto antes da mitigação. Cada equipe tem **uma resposta por rodada**; cada habilidade admite uma única resposta. O jogador pode aceitar o golpe para conservar a resposta. Respostas são secretas antes de serem reveladas. A janela tem timeout no servidor.

## Compatibilidade

O modo legado sem `cardMode` permanece sequencial. As partidas ranqueadas usam o novo sistema de decks, campo 5×5 e planejamento simultâneo. O PvE de campanha utiliza decks, o grid, validação autoritativa dos movimentos e movimentação automática da IA, mas ainda não utiliza planejamento simultâneo contra IA.

## Implementação

- `src/card-combat.js`: compra, descarte, exaustão, movimentos temporários, básico permanente e Miragem/Luz/Sombra.
- `src/tactical-grid.js`: campo, posições, movimento, colisão, alcance, previsão e IA de movimento.
- `src/tactical-grid-view.js`, `src/card-hand-view.js`, `card-combat.css`: tokens na grade, destaque de casas/áreas, cartas e interação responsiva.
- `src/combat.js`, `src/combat-ai.js`: planejamento, custos, resolução, movimento + técnica e confrontos.
- `server/arena-service.js`: sigilo dos planos, espelhamento, validação e resposta do duelo.
- `server/campaign-service.js`: validação de movimento nos turnos de campanha.
- `src/deck-builder-view.js`, `src/ranked-loadouts.js`: edição e validação dos baralhos.
- `tests/card-combat.test.js`, `tests/tactical-grid.test.js`, `tests/duel-simultaneous.test.js`, `tests/ranked-loadouts.test.js`.
- `.github/workflows/ci.yml`: testes dirigidos, build e regressão completa.

## Validação e pendências

**Confirmado no GitHub Actions:** testes direcionados do combate novo e build estático passaram. A suíte completa ainda falha em testes legados (primeira execução: 98 falhas em 328 testes), incluindo testes de artes, nomenclatura, regras antigas e turnos alternados. Ainda não houve QA visual real em navegador/mobile. A checagem Vercel indicou bloqueio por quota de builds.

Prioridades antes de integrar à `main`:
1. Corrigir ou atualizar as regressões, separando testes antigos incompatíveis com a nova regra de bugs reais.
2. Ajustar o grid compacto à versão visual e aos atlas/animações mais recentes não presentes na `main` acessível.
3. Completar cartas reativas, variações de mobilidade, padrões de área, terreno e efeitos de status físicos.
4. Implementar recompensas e desbloqueios por conclusão de Reinos, com tiers Prata/Ouro/Prismático, separados do balanceamento ranqueado.
5. Validar partidas PvP concorrentes, sincronização, timeouts, toque em mobile e legibilidade dos impactos.

**Manter o PR #6 como draft; não realizar merge nem deploy estável até completar os bloqueadores.**
