> **Mecânica substituída (07/11/2026):** os desafios de reflexo por golpe descritos aqui são históricos. A mecânica ativa de acerto/erro dos especiais é o [Confronto de Vontades — três intenções](TACTICAL_WILL_DUEL_RPS_20261107.md). O sistema continua usando as animações cinematográficas de golpes deste desenvolvimento, mas a interação atual consiste em uma única escolha estratégica, sem barra de timing.

> **Atualização de interação (07/11/2026):** as janelas de ritmo uniformes descritas abaixo foram substituídas por sequências reativas baseadas na leitura de cada golpe, com **esquiva, aparo, salto e contra-ataque**. As regras e controles atuais estão em [Combate reativo inspirado em Expedition 33](TACTICAL_REACTIONS_EXPEDITION33_20261107.md). Esta página registra a primeira iteração de combos estilo KOF e continua válida quanto à arquitetura de resolução em etapas, não quanto aos comandos de defesa.

# Combos interativos — apresentação de luta e disputa ofensiva/defensiva
Data: 07/11/2026 · Oblivium Arena · grade compacta 6×6

## Experiência entregue

Uma técnica **ofensiva**, com dano direto de pelo menos 5 e um alvo realmente alcançável, inicia uma curta disputa de ritmo, antes de ser resolvida. O planejamento simultâneo permanece selado até os dois lados confirmarem.

Quando o personagem do jogador ataca, a entrada é **INTENSIFICAR**. Quando o inimigo controlado pela IA ataca um personagem aliado, a entrada é **APARAR**. O adversário controlado por IA recebe uma resposta previsível de 1–2 acertos conforme o ator, a habilidade e a rodada; a IA não conhece os toques do usuário.

Cada disputa tem **três batidas** de 1050ms. No instante em que o marcador atravessa a zona central (janela generosa), o jogador pode tocar no botão ou pressionar Espaço/Enter. Cada acerto soma uma intervenção bem-sucedida. Escape ou **Sem interação** permite avançar sem modificadores para ninguém. A preferência do dispositivo por movimento reduzido ignora automaticamente a disputa, mantendo o dano original.

**Cálculo:** dano direto modificado = arredondar(dano direto original × [1 + 0,1 × (acertos ofensivos − acertos defensivos)]). Cada lado tem 0–3 acertos: impacto final varia de 70% a 130% do dano base **antes da resolução canônica**, nunca abaixo de 1 quando o dano original é positivo. A interface apresenta contagem de acertos, não porcentagens. O ajuste não afeta diretamente dano periódico, cura ou custos.

O efeito é aplicado pelo próprio `resolveBoardTechnique` antes do cálculo de blindagem, resistências, efeitos de morte e ações seguintes. Não existe dano artificial calculado apenas no navegador após a rodada.

## Sequência animada

Após a disputa, a técnica é executada **uma única vez** pelo motor tático. A reapresentação visual subdivide o dano **já resolvido** em golpes sucessivos:

- **Técnica ofensiva padrão:** 3 contatos.
- **Voto / Despertar:** 4 contatos e apresentação especial somente no início.
- **Ataques básicos Impulso / Ataque Básico:** execução normal, sem desafio de ritmo (evita tornar cada rodada excessivamente longa).
- **Cura, escudos, buffs e ações canceladas:** não acionam a disputa ofensiva.
- Os golpes internos usam curta preparação, release/contato e recoil final; cada contato reutiliza a animação do ator real, assinatura de partículas e paleta próprias. O fundo não é substituído por uma ilustração gigante.

O replay cria snapshots intermediários de PV/Escudo apenas para alvos atingidos. Colaterais, retaliações, deslocamentos, estados e mortes permanecem no quadro final. O som e o feedback de dano acompanham cada contato; somam o **dano original ajustado e efetivamente sofrido**, sem duplicar o efeito no motor.

## Modo compacto: arquitetura em etapas

`startCompactRoundResolution(s)` entrega o anúncio de ordens simultâneas e avança ondas de movimentos/técnicas, expondo o próximo confronto em `peek()`. A interface coleta os acertos e chama `next({attackHits, defenseHits})` **antes** de `execute`. A rota clássica `resolveTacticalRound` permanece para compatibilidade com testes, simulações e outros modos. Um erro no player faz a sessão concluir as etapas restantes com resultados neutros, sem prender a partida eternamente em “resolvendo”.

As respostas nunca são aceitas no payload de planos selados: `normalizePlan` só conserva a escolha de ação/formas, posição, orientação e gastos autorizados. A entrada interativa acontece após a revelação.

## Controles e acessibilidade

- **Desktop:** tecla Espaço ou Enter na zona de timing, Escape para seguir sem intervenção.
- **Mobile:** botão grande “INTENSIFICAR” ou “APARAR”, zona de timing com cursor de alto contraste, botão “Sem interação”.
- O painel é fixado na parte inferior com espaço seguro de iOS/Android; não é contido ou cortado pelo cenário.
- Movimento reduzido recebe o resultado neutro, sem depender de reflexos.
- A pressão ofensiva/defensiva aparece no contador de combo abaixo da arena.

## Arquivos alterados

`src/tactical-combo.js`, `src/combat.js`, `src/tactical-combat.js`,
`src/compact-demo.js`, `src/tactical-cinematic.js`,
`compact-combo.css`, `tactical.html`,
`tests/tactical-combo.test.js`, `tests/tactical-combo-round.test.js`,
`tests/tactical-combo-ui.test.js`, `tests/tactical-cinematic.test.js`.

## Limites conhecidos

- A interface atual é **jogador local contra IA**. A estrutura de resolver as duas respostas está pronta para dois lados, mas **não existe sincronização multijogador em rede**; isso exige protocolo de commit/reveal e validação de timestamps/scores no servidor.
- O dano base é ajustado uma vez; os contatos seguintes não executam os efeitos de habilidade novamente. É a alternativa que preserva coerência de cooldowns, recursos, procs, estados e mortes.
- Nem todos os personagens possuem atlases artesanais com quadros exclusivos para cada golpe. Os ciclos de animação usam o atlas registrado disponível e os VFX físicos já associados ao personagem.

## Testes

Verificações isoladas executaram as regras puras, estrutura de controles/estilos e sequência cinematográfica, além de um resolvedor em etapas com serviços de combate simulados. Uma checagem adicional simulou três acertos completos tanto em ataque quanto em defesa, incluindo emissão de partículas protetoras. A suíte Node completa e inspeção em browser/múltiplos telefones **ainda precisam ser executadas**.

```sh
node --test tests/tactical-combo.test.js tests/tactical-combo-round.test.js tests/tactical-combo-ui.test.js tests/tactical-cinematic.test.js
npm run test:compact
npm run smoke:compact
npm run build
npm test
```
