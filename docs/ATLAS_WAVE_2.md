# Atlas e reações — segunda expansão do Inferno

Novos atlas base: Ragnar, Lyra, Pyros, Gorath, Ravena e Drake. Seis linhas por seis colunas: repouso, caminhada e quatro técnicas base, com seis fases por linha de ação. Gorath mantém anatomia quadrúpede; Pyros mantém o volume e os ataques corporais; Drake mantém sua constituição e técnicas de consumo e restauração.

Atlas exclusivos em três colunas por duas linhas: Rancor Reaceso de Ragnar; Revanche Ardente de Lyra; Fome sem Corpo de Gorath; Abrir o Cofre de Ravena. São desenhos próprios, e não recortes reaproveitados da habilidade base. As demais formas do elenco continuam pendentes quando não há atlas explícito.

Os arquivos WebP estão em `art/animations/tactical-expansion-20261105/`. Os prompts completos e referências estão em `ATLAS_WAVE_2_PROMPTS.json`. A geração utilizou a ferramenta integrada de imagens. O atlas de Gorath passou por uma segunda geração para extração correta do fundo; o empacotador rejeita fontes sem transparência utilizável. O preparo técnico usa `scripts/pack-tactical-atlas.py`, com escala uniforme por atlas e margens transparentes. A pose inicial completa substitui o repouso somente se a primeira linha da fonte tocava a borda superior.

Os VFX materiais agora incluem brasas, placas de relíquia, fragmentos de mandíbula e névoa de fome, compartilhados por personagem dentro do mesmo limite de partículas. Não equivalem a VFX exclusivos de todas as técnicas.

Oito reações e contra-ataques do elenco ainda manipulavam Essência. No modo Conquista, essa parte do efeito agora concede Escudo limitado ao portador do contra-ataque ou ao autor da armadilha. Reservas de Essência permanecem intactas. As descrições exibem gatilho, destinatário, duração e ativação única, além de efeitos de perda de Vida e limites de uso quando presentes.

A auditoria anterior contava algumas respostas de repouso como técnicas mapeadas. A auditoria agora exige pelo menos três quadros distintos de ação e separa atlas dedicados de sequências compartilhadas por slot. Os totais atuais são regenerados por `node scripts/audit-tactical-animation.mjs` e `node scripts/audit-conquest.mjs`. Isso verifica cobertura estrutural; não substitui revisão artística de todo o elenco nem partidas de balanceamento com jogadores.
