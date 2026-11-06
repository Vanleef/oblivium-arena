# IA defensiva e eventos no campo compacto — 06/11/2026

Este registro é complementar a [COMPACT_BALANCE_BASELINE_20261106.md](COMPACT_BALANCE_BASELINE_20261106.md). Nenhum valor de técnica, Vida, Escudo de Guarda, tier ou periodicidade de evento foi alterado nesta etapa.

## Alterações funcionais

- A IA considera Guarda entre as opções do planejamento compacto e agora atribui risco adicional a personagens que, pelas **posições, recargas e danos visíveis**, podem sofrer um ataque letal próximo. O cálculo não acessa ordens sigilosas do adversário nem sorteios futuros; é uma heurística, não uma previsão garantida do turno.
- Um Escudo que evite uma derrota estimada recebe peso superior a Escudo apenas acumulado. Derrotar ou se afastar de um atacante pode igualmente reduzir o risco.
- A interface do 5×5 mostra a próxima rodada com evento de campo e as condições do evento **já ativo**. Não revela alvos futuros.
- As regras permanecem: uma ação para mover, duas ações por personagem, evento a cada quatro rodadas; Vendaval aumenta o alcance da movimentação para três casas, Chuva extingue fogo. Nenhum mecanismo de fortalezas 9×6 foi reativado.

## Comparações reproduzíveis

As duas primeiras colunas usam **as mesmas 12 sementes e formações**, antes/depois da heurística defensiva; a terceira coluna altera deliberadamente o método para pares de confrontos com lados invertidos, utilizando a mesma semente em cada par.

| Indicador | Linha de base | IA com avaliação de risco | IA com lados espelhados |
| --- | ---: | ---: | ---: |
| Batalhas concluídas / amostradas | 12/12 | 12/12 | 12/12 |
| Rodadas totais | 58 | 74 | 78 |
| Rodadas médias | 4,83 | 6,17 | 6,50 |
| Mínimo–máximo de rodadas | 4–7 | 4–11 | 4–11 |
| Guardas executadas | 0 | 17 | 10 |
| Coletas de objetivos | 31 | 64 | 66 |
| Eventos de campo | 12 | 16 | 16 |
| Vitórias aliadas / derrotas / empates | 4 / 8 / 0 | 4 / 8 / 0 | 4 / 8 / 0 |
| Unidades-rodada sob ameaça estimada | Não medido | Não medido | 61 |

**Origens das medições:**
- Linha de base, commit `df5ef729`: [GitHub Actions #42232655647](https://github.com/Vanleef/oblivium-arena/actions/runs/42232655647).
- IA defensiva, commit `210f9627`: [GitHub Actions #42237960900](https://github.com/Vanleef/oblivium-arena/actions/runs/42237960900).
- Pares espelhados, commit `19b47a4a`: [GitHub Actions #42238261417](https://github.com/Vanleef/oblivium-arena/actions/runs/42238261417).

Os resultados são **experimentais**, não uma estimativa estatisticamente significativa de equilíbrio, eficácia de Guarda ou justiça entre equipes. A amostra tem apenas três composições que se repetem. A taxa 4/8 não permite determinar a vantagem de uma equipe em todo o elenco.

## Validação técnica e limites

O commit `19b47a4a` passou com **13/13 testes específicos do compacto**, **200/200 testes da suíte tática e de Conquista**, simulações de três e doze combates e build de **4.362 arquivos**, sem falhas detectadas. Foram acrescentados testes da estimativa de ameaça, de Guarda em planejamentos bloqueados, do Vendaval e da Chuva. A prévia do ambiente deve ser validada visualmente em navegador desktop e celular físico.

O atlas existente continua com **43/150 entradas de personagem** conectadas e **183/689 técnicas/formas** mapeadas com pelo menos três quadros. O mapeamento de quadros compartilhados não constitui animação exclusiva; esta etapa não gerou novos atlas.

## Próximas verificações necessárias

1. Ampliar amostras com **formações distintas, tiers, variáveis de classe, versões alternativas, objetivos e confrontos com criaturas**, alternando lados e sementes.
2. Medir escolhas defensivas que realmente evitam derrota, custo de oportunidade, tempo de combate, uso de cura, excesso de Escudo e tempo até o segundo/terceiro evento.
3. Conferir que telemetria dos eventos e a indicação de rodada sejam legíveis sem sobreposição em 390 px e no desktop.
4. Validar integração da campanha, desbloqueios por Reino, roteamento e Vida persistida entre confrontos, distinguindo laboratório local e aplicação principal.
5. Retomar produção e aprovação visual dos atlas e VFX restantes, com cenas próprias de habilidades. **Não declarar cobertura visual concluída com base em sequências de slot ou fallback.**
