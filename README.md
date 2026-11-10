# Oblivium Arena

**Três mundos, um trio de almas e o destino do além em jogo.**

Oblivium Arena é um jogo de combate tático por turnos 3v3 com progressão roguelite, ambientado no conflito entre **Inferno, Paraíso e Limbo**. Forme seu trio, combine técnicas e ressonâncias e escolha caminhos que transformam cada travessia.

A história acompanha Nilo, uma alma sem veredito que absorve involuntariamente fragmentos de outras almas. Entre vínculos, confrontos e transformações, sua pergunta permanece: **quanto de mim ainda sou eu?**

## O jogo

- **Combate tático 3v3 (laboratório compacto):** campo **6×6**, duas ações por personagem, planejamento simultâneo e privado, três baralhos/mãos independentes por equipe, movimento garantido de uma casa (ou cartas de mobilidade maior) e execução automática após completar as escolhas. Técnicas afetam as casas de sua área.
- **Essências e modos:** Éter, Cinza, Graça e Ruptura seguem na cosmologia, na campanha e em sistemas legados; Coringa é um custo flexível. O combate compacto padrão não cobra Essência por técnica.
- **Formações e ressonâncias:** combine personagens, afinidades, passivas e técnicas para construir a estratégia do trio.
- **Kits e transformações:** quatro espaços de técnicas por personagem, com recargas, aflições, marcas, cargas, Defesa e contra-ataques. Personagens específicos possuem formas alternativas.
- **Travessias roguelite:** mapas com rotas conectadas, combates, elites, eventos, descanso, tesouro, mercador e guardiões. A Vida do trio persiste entre encontros.
- **Progressão:** recrutamento, Legados permanentes e dificuldades de Ruptura ampliam as possibilidades das próximas tentativas.
- **Codex:** consulte identidades, afinidades, arquétipos, formas e descrições das técnicas.

Inferno, Paraíso e Limbo são os três **Mundos**, organizados em **Reinos** com identidades próprias.

## Direção de arte

A linha vigente é **anime 2.5D**: desenho expressivo, contornos firmes, sombras em planos angulares e profundidade pictórica nos materiais e cenários. Rostos, corpos, roupas e silhuetas preservam a identidade de cada personagem.

Retratos, passivas e habilidades devem variar cenas, expressões, poses, câmera e ação, mantendo a anatomia e a continuidade visual. As cenas precisam corresponder ao efeito e à quantidade de alvos da técnica.

A revisão visual do acervo está em andamento. Consulte a [direção de arte](docs/ART_DIRECTION.md) para as referências e regras de produção.

## Arena compacta PvP (beta em desenvolvimento)

Na branch de integração do PR #7, /tactical.html?online abre o combate 3v3 compactado 6×6 contra outro jogador, com três mãos, planejamento simultâneo e Confronto Miragem/Luz/Sombra. Exige conta autenticada e três almas recrutadas. O modo local em /tactical.html permanece disponível. Ainda não publicado na main; veja docs/COMPACT_PVP_ONLINE_20261107.md.

## Laboratório de combate compacto

Na branch de desenvolvimento do PR #3, `/tactical.html` abre por padrão o combate 3v3 em campo **6×6**, com **até duas ações por personagem** (seis por trio) e planejamento simultâneo. Cada lado sela seu plano sem acessar a ordem adversária; todas as primeiras ações são resolvidas antes das segundas. **O Movimento padrão percorre uma casa, incluindo diagonais, e volta à mão a cada rodada; cartas de mobilidade podem alcançar até duas ou três casas.** O Vendaval não altera essa distância; em vez disso, concede +5 de Escudo a quem se mover durante seu efeito. No modo de baralhos, técnicas não têm recarga individual: a carta usada vai ao descarte e só retorna pelo ciclo de compra e reembaralhamento; o Ataque Básico fica sempre disponível, **sem custo de Essência nesta modalidade**.

**Fluxo rápido:** toque em um personagem no campo ou em sua miniatura junto à grade para revelar sua mão individual; escolha Movimento, uma carta comprada ou Ataque Básico e toque no destino/alvo quando necessário. As duas ações de cada personagem aparecem imediatamente junto ao campo e podem ser retiradas. **Com as ações de todos os personagens disponíveis preenchidas, a rodada começa automaticamente**; o comando `▶ Agora` fica junto ao campo apenas para executar planos incompletos. Durante o planejamento, a posição real não muda: um marcador pontilhado indica o destino de movimento, e os personagens só animam ao resolver a rodada.

Casas objetivo privadas oferecem três aprimoramentos **individuais e vinculados a habilidades**; no modo de cartas, há também inscrições de cartas persistidas localmente para combates futuros. Tiers Prata, Ouro e Prismático dependem de Reinos distintos concluídos. Eventos de campo e superfícies seguem presentes. Cartas especiais e novas formas de mobilidade/resposta são liberadas conforme Reinos são concluídos; baralhos de oito cartas podem ser editados em **Nova formação**. Os laboratórios anteriores estão disponíveis em `/tactical.html?fortress` e `/tactical.html?classic`.

Este é um **laboratório local contra IA**: não comprova integração integral à campanha, aos serviços da aplicação principal ou PvP com servidor autoritativo. A arte animada do elenco continua parcialmente coberta. Consulte [o novo sistema de baralhos](docs/COMPACT_CARD_DECKS_20261107.md), [a cobertura de animações](docs/TACTICAL_ANIMATION_COVERAGE.md), [a interação 6×6 atual](docs/COMPACT_6X6_ACTIONS_20261106.md) e [o registro histórico da versão 5×5](docs/COMPACT_SIMULTANEOUS_20261105.md). A [documentação do protótipo anterior](docs/TACTICAL_COMBAT_PROTOTYPE.md) é histórica.

## Executar localmente

Requer **Node.js 20 ou superior** e Git. O protótipo não usa dependências externas.

```bash
git clone https://github.com/Vanleef/oblivium-arena.git
cd oblivium-arena
npm run dev
```

Abra [http://localhost:4173](http://localhost:4173). O servidor local atende o jogo e a API de contas. Usuários e progresso de campanha locais ficam no arquivo ignorado pelo Git `.pma-dev-data.json`; a formação e o progresso local também usam armazenamento do navegador conforme o modo.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run docs:generate` | Regenerar a documentação na branch de revisão, que contém o gerador. |
| `npm run dev` | Iniciar o jogo e a API local na porta 4173. |
| `npm test` | Executar a suíte de testes com o runner nativo do Node.js. |
| `npm run build` | Validar JavaScript e imports e gerar o site em `dist/`. |
| `npm run audit:art` | Contar arquivos de arte referenciados que faltam no checkout. |
| `npm run audit:art -- --list-missing` | Listar os caminhos de arte ausentes. |
| `npm run test:compact` | Testar planejamento, objetivos e interface compacta. |
| `npm run smoke:compact` | Simular rodadas e invariantes do combate compacto. |
| `npm run smoke:balance` | Simular 12 confrontos em pares espelhados (seis sementes), três formações e tiers diferentes, com métricas de combate. |
| `npm run audit:animation` | Auditar atlas e quadros de ação mapeados. |

A auditoria de arquivos não substitui a revisão visual das artes.

### Kits, combate e interface

```bash
npm run docs:generate
node scripts/simulate-combat.mjs
node scripts/simulate-combat.mjs --difficulty-ladder
node scripts/simulate-combat.mjs --difficulty-sample
```

O primeiro comando atualiza o catálogo a partir dos dados dos kits. Os demais executam simulações de combate, comparações entre dificuldades e amostras nas Rupturas IV–VI. Os resultados e limites da avaliação estão em [COMBAT_QA.md](docs/COMBAT_QA.md).

Para inspecionar início, bifurcações e conselho da trilha em larguras de 320 a 1200 px, abra `/tests/fixtures/trail.html` no servidor local. O cenário é isolado do progresso salvo do jogo.

## Estrutura do projeto

| Diretório | Conteúdo |
| --- | --- |
| `src/` | Regras, combate, IA, progressão, dados e interface do jogo. |
| `api/` | Endpoints de contas, campanha e Arena. |
| `server/` | Serviços e persistência no servidor. |
| `art/` | Artes do jogo e fontes de produção. |
| `docs/` | Direção visual, cosmologia e documentação de sistemas. |
| `scripts/` | Servidor local, build, auditorias e simulações. |
| `tests/` | Testes automatizados e cenários de interface. |

## Publicação e recursos online

`npm run build` gera os arquivos públicos em `dist/`. A configuração em `vercel.json` usa esse diretório e publica as APIs de `api/` como funções, incluindo os módulos necessários de `src/` e `server/`.

Para persistência em uma hospedagem, conecte uma integração Upstash Redis ou configure no ambiente do servidor:

```text
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

O servidor também aceita `PMA_DB_KV_REST_API_URL` e `PMA_DB_KV_REST_API_TOKEN`. O token de escrita deve permanecer no servidor. O armazenamento local de desenvolvimento não substitui o banco da hospedagem; não há fallback hospedado em arquivo ou memória para gravações de contas.

A Arena online depende de Redis configurado. Sua disponibilidade e validação em ambiente real devem ser conferidas antes de uma liberação. Veja [Arena online](docs/online-arena.md) para regras, requisitos e roteiro de verificação.

## Documentação

O [índice canônico do projeto](docs/PROJECT_CANON.md) reúne as referências vigentes e distingue o cânone da revisão do conteúdo integrado à versão principal.

- [Catálogo de nomes, títulos e lore](docs/CHARACTER_CATALOG.md)
- [História e capítulos da campanha](docs/STORY.md)
- [Mundos, Reinos e desbloqueios](docs/WORLD_CATALOG.md)
- [Campanha e progressão](docs/CAMPAIGN.md)
- [Cosmologia e história de Nilo](docs/COSMOLOGY_AND_NILO.md)
- [Direção de arte](docs/ART_DIRECTION.md)
- [Catálogo de kits](docs/COMBAT_KITS.md)
- [Formas e técnicas](docs/SKILL_FORMS.md)
- [Avaliação do combate](docs/COMBAT_QA.md)
- [Arena online](docs/online-arena.md)

## Histórico e validação dos sistemas de combate

A [proposta tática original](docs/TACTICAL_COMBAT_PROPOSAL.md) e [o protótipo inicial](docs/TACTICAL_COMBAT_PROTOTYPE.md) documentam etapas anteriores. A decisão atual da **branch do PR #3** é o [campo 6×6 com comandos diretos e planejamento simultâneo](docs/COMPACT_6X6_ACTIONS_20261106.md), com aprimoramentos individuais e eventos. O [campo 5×5 anterior](docs/COMPACT_SIMULTANEOUS_20261105.md) permanece documentado apenas para histórico. O campo de fortalezas 9×6 continua disponível apenas como laboratório legado.

Para verificar essa branch, execute `npm run test:compact`, `npm run smoke:compact`, `npm run audit:animation` e `npm run build`. Essas verificações não substituem testes em aparelho físico, aprovação visual do elenco inteiro ou uma auditoria de integração de campanha e Arena online. A branch `main` pode conter outra versão; o PR ainda não foi mesclado.

## Estado do projeto

Protótipo jogável em desenvolvimento. A expansão do elenco, a revisão visual, o balanceamento e a validação dos recursos online continuam em andamento. A branch `main` representa o conteúdo integrado; trabalhos em pull requests podem conter artes e recursos ainda em revisão.

