# Linha de base exploratória do campo compacto — 06/11/2026

Referência: [GitHub Actions, execução 42232655647](https://github.com/Vanleef/oblivium-arena/actions/runs/42232655647), commit `df5ef729`. Amostra de 12 confrontos IA × IA gerados por `npm run smoke:balance`, com sementes 1–12, três formações rotativas e progresso alternando 0, 3 e 8 Reinos concluídos.

| Indicador | Medido |
| --- | ---: |
| Confrontos finalizados e invariantes de ocupação válidos | 12/12 |
| Vitórias aliadas / derrotas / empates | 4 / 8 / 0 |
| Rodadas totais | 58 |
| Rodadas por confronto (média; mínimo–máximo) | 4,83; 4–7 |
| Eventos registrados | 614 |
| Coletas de objetivos | 31 |
| Técnicas executadas | 351 |
| Guardas executadas | 0 |
| Movimentos bloqueados | 34 |
| Ações interrompidas por atordoamento | 10 |
| Eventos de campo | 12 |

**Validação da execução:** 11 testes específicos do compacto, 198 testes táticos e de Conquista, smoke de 3 confrontos e build de 4.362 arquivos: todas as etapas aprovadas. O smoke rápido produziu 16 rodadas e 11 coletas.

## Interpretação e limites

As partidas terminaram antes da oitava rodada; portanto, no calendário atual de eventos a cada quatro rodadas, a amostra observou Tempestade, mas não Vendaval ou Chuva. Isso sinaliza a necessidade de avaliar duração, dano, cura, defesa e recargas juntos, **sem mudar silenciosamente a regra de eventos**.

A Guarda passou a ser considerada pelo planejador da IA, e a regressão dedicada passou. Nenhuma Guarda foi usada nas partidas desta amostra. Verificar a heurística em situações de ameaça próxima, Vida baixa, técnicas em recarga e Escudo limitado antes de ajustar pesos.

Como as três formações se repetem ciclicamente, as quatro vitórias vieram do mesmo emparelhamento. **Não utilizar 4/12 como taxa global de vitória ou diagnóstico definitivo do equilíbrio.** Diversificar pares de equipes, trocar os lados, testar kits de suporte e formas alternativas e medir impacto dos aprimoramentos.

As simulações verificam regras e invariantes de estado, não diversão, aprovação visual, funcionamento em celular físico ou integração autoritativa com Arena online. Consulte [as regras do compacto](COMPACT_SIMULTANEOUS_20261105.md) e [a cobertura artística](TACTICAL_ANIMATION_COVERAGE.md).
