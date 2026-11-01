# Oblivium Arena

**Três mundos, um trio de almas e o destino do além em jogo.**

Oblivium Arena é um jogo de combate tático por turnos 3v3 com progressão roguelite, ambientado no conflito entre **Inferno, Paraíso e Limbo**. Forme seu trio, combine técnicas e ressonâncias e escolha caminhos que transformam cada travessia.

A história acompanha Nilo, uma alma sem veredito que absorve involuntariamente fragmentos de outras almas. Entre vínculos, confrontos e transformações, sua pergunta permanece: **quanto de mim ainda sou eu?**

## O jogo

- **Combate tático 3v3:** planeje uma ação por personagem, selecione alvos, reorganize a fila e confirme as escolhas antes da resposta adversária.
- **Gestão de Essência:** Éter, Cinza, Graça e Ruptura alimentam as técnicas. Coringa representa um custo flexível pago com esses quatro tipos.
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

## Estado do projeto

Protótipo jogável em desenvolvimento. A expansão do elenco, a revisão visual, o balanceamento e a validação dos recursos online continuam em andamento. A branch `main` representa o conteúdo integrado; trabalhos em pull requests podem conter artes e recursos ainda em revisão.

