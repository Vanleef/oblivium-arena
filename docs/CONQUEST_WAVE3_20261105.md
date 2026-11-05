# Conquista — equilíbrio das penalidades, cenários e formas

## Regras e interface

Penalidades de invasão agora retêm a rodada em que a fortaleza foi alcançada. A escolha humana feita depois de uma troca que encerra a rodada não renova indevidamente a duração: jogador e IA têm a mesma janela de efeito. Um efeito aplicado nesta rodada por outra fonte mantém sua duração mesmo se uma penalidade anterior for escolhida depois.

A IA compara as três opções usando apenas informações públicas: ataques disponíveis, controles, condições já presentes e proximidade dos combatentes. Pode enfraquecer a equipe, expô-la ou selar a ofensiva de um adversário vivo específico. A escolha não consulta ordens seladas. A interface exibe o erro ao tentar aplicar o selo sem um alvo e identifica a animação de recompensa como invasão.

## Cenários

Três novas arenas de 1672 × 941 foram geradas e integradas, somando seis opções no seletor de cenário. A progressão escolhe outra arena do mesmo mundo quando possível, sem consumir o RNG do combate. Cenários claros mantêm fundos escuros nos textos secundários para preservar a leitura. A camada de piso em CSS passa a usar a arte selecionada; ela antes mantinha um fundo legado sobre a imagem do cenário.

| Cenário | Arquivo | Direção |
| --- | --- | --- |
| Inferno · Claustro dos Condenados | `art/arenas/inferno-ossuary-20261105.webp` | Basalto, ossuário gótico e brasas; plataforma livre no centro. |
| Paraíso · Jardins do Veredito | `art/arenas/paraiso-gardens-20261105.webp` | Terraço de mármore elevado, jardins geométricos, ouro e luz filtrada. |
| Limbo · Margem do Aqueronte | `art/arenas/limbo-aqueronte-20261105.webp` | Pedra violeta, rio envolto em névoa, arcos partidos e arquitetura suspensa. |

Prompts dos cenários: fundos panorâmicos 16:9 para combate, câmera ligeiramente elevada; chão central contínuo, plano, livre e de contraste moderado; detalhes nas bordas e no horizonte; anime 2.5D pictórico com iluminação de Arcane e contornos expressivos de Spider-Verse, textura controlada; paleta do respectivo mundo; sem personagens, UI, texto, grade desenhada, tecnologia ou maquinaria. O conteúdo ambiental específico está descrito na tabela. Geração integrada com fundo opaco; apenas conversão de formato WebP, sem repintura por código.

## Formas de Darius e Emberlyn

Dois atlas transparentes gerados com o retrato canônico como referência de identidade. Cada um contém três sequências distintas de seis quadros, uma por técnica alternativa: prontidão, antecipação, preparação, contato, acompanhamento e recuperação. O empacotamento preserva a proporção e adiciona margem transparente por célula. Os atlas finais têm 960 × 480, com células de 160 × 160.

| Personagem / Forma | Sequências e ação física | Arquivo |
| --- | --- | --- |
| Darius / Coroa Soberana (`edict`) | Decreto sobre Todos: palma carimba um selo no chão; Cadeia de Juramento: tração de correntes rituais; Trono Incontestável: manto e placas de pedra formam proteção. | `art/animations/tactical-expansion-20261105/darius-edict.webp` |
| Emberlyn / Sufocamento (`smother`) | Labareda Sufocante: palma e massa densa de brasas; Cinzas de Sufoco: pisão e cinzas baixas; Fornalha Sepulcral: soco descendente e impacto de fornalha. | `art/animations/tactical-expansion-20261105/emberlyn-smother.webp` |

Prompt comum: folha de sprites com seis colunas e três linhas iguais, dezoito figuras completas voltadas à direita, mesma escala e apoio no chão, poses sucessivas fisicamente possíveis, olhar reativo ao confronto e nunca à câmera; anatomia coerente, margem transparente, sem texto, grade, cenário, outros personagens, maquinaria ou feixes genéricos; anime 2.5D pictórico, influência de Arcane e Spider-Verse, acabamento legível sem excesso de rachaduras. Referências de identidade: `art/characters/o-soberano-quebrado/dark-pictorial-rework-20261029/portrait.webp` e `art/characters/a-brasa-eterna/dark-pictorial-rework-20261030/portrait.webp`. Darius preserva a gola vazia sem cabeça humana e a coroa flutuante; Emberlyn preserva pele morena, cabelo crespo, trança vermelha, fissuras de brasa e vestes carvão.

As sete técnicas/formas de cada um dos dois personagens agora têm recortes mapeados, incluindo os quatro slots base anteriores. As artes de passivas existentes foram mantidas; esta revisão não cria animação exclusiva de passiva. A cobertura real do catálogo passa a 151/689 técnicas/formas, com 35/150 atlas base e 12 mapeamentos específicos de habilidade/forma. Os demais continuam registrados como pendentes, sem contabilizar repouso como animação de técnica.

## Verificação

Regressões reproduzem a rodada extra antes da correção e verificam a igualdade de duração depois dela. Testes cobrem escolha das três penalidades pela IA, alvo individual vivo, rejeição de efeito inválido, variantes de cenário por mundo e identificação de linha, fases e retorno ao repouso dos novos atlas. A margem alfa de todas as 36 células foi conferida. O script `npm run smoke:conquest` simula confrontos inteiros dos dois lados, coleta, recompensas, invasões e contração, verificando Vida, ocupação e sigilo dos objetivos.

Resultado desta revisão: 176 testes táticos passaram, build com 4.350 arquivos aprovado. A simulação de seis combates completos resolveu 263 trocas, 46 coletas, 14 invasões e 12 contrações sem erros; três vitórias e três derrotas na perspectiva da equipe principal, sem caracterizar avaliação estatística de balanceamento. No navegador, conferidos os três cenários pelo seletor, a transformação de Darius e o uso do atlas `darius-edict.webp` ao executar Decreto sobre Todos. Validação em aparelho físico permanece pendente.
