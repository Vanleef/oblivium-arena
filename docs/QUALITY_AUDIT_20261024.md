# Revisão de qualidade do PMA — 24/10/2026
> Atualização: a main continha os 625 caminhos de arte referenciados; a antiga contagem de 494 ausentes decorria de um checkout parcial. O lote novo passa a 626/626 caminhos presentes. As métricas e achados abaixo registram o levantamento histórico; a continuação está em `PASSIVE_CONTINUATION_20261024.md`.

## Escopo e resultado

A revisão cruzou catálogo, artes efetivamente referenciadas, curva de Ruptura, fluxos de conta/campanha/Arena e a suíte automatizada. O catálogo tem 100 personagens, quatro técnicas por kit e oito personagens com formas jogáveis. As regras de combate, a validação autoritativa de campanha e os custos de Essência têm cobertura extensa de testes.

| Prioridade | Achado | Estado |
| --- | --- | --- |
| Alta | 494 caminhos de arte únicos não existem em disco; 83 personagens são afetados. | Fallback vetorial automático implementado; as ilustrações finais continuam pendentes. |
| Alta | O primeiro lado começava com uma Essência, contra uma por alma viva da oposição; isso contrariava a regra pedida e contaminava a curva de dificuldade. | Corrigido: ambos os lados recebem desde a abertura uma unidade aleatória por personagem vivo. A IA agora também considera a troca 5:1 a partir de cinco unidades. |
| Alta | A heurística venceu 0–4% das elites de Ruptura IV–VI nas amostras controladas, mesmo com Legados aleatórios. | Escalada numérica moderada; o resultado é um sinal de alerta, não uma previsão para jogadores. Builds e partidas humanas ainda precisam ser testadas. |
| Média | A Arena online e o progresso persistente dependem de Redis/Upstash configurado no ambiente hospedado. | Requisito está documentado; sem as credenciais, os endpoints respondem indisponível em vez de simular partidas. |
| Média | A suíte exercita regras e renderização em DOM simulado, mas não substitui validação visual no navegador em diferentes tamanhos e dispositivos. | Pendente de uma passada manual de QA visual. |

## Artes

O levantamento percorreu as artes de retrato, passiva, técnica e forma dos 100 personagens. Há 625 caminhos únicos referenciados; 131 existem e 494 estão ausentes, distribuídos por 83 personagens. Reproduza a contagem com `npm run audit:art`; `npm run audit:art -- --list-missing` mostra os arquivos ausentes. As referências repetidas entre forma base e alternativa não são contadas duas vezes. Quando uma imagem local não carrega, a interface agora substitui o espaço vazio por uma runa SVG autossuficiente, com cor, monograma e símbolo derivados da identidade e do tipo de arte. A substituição só ocorre após falha, portanto preserva as ilustrações existentes. Isso resolve os ícones quebrados, mas não equivale à conclusão da direção de arte do elenco.

## Balanceamento e IA

`node scripts/simulate-combat.mjs --difficulty-ladder` agora compara dois cenários sob as mesmas sementes, equipes e encontros de elite: um sem Legados e outro com um Legado escolhido a cada Ruptura concluída anteriormente. O cenário com progressão usa escolhas aleatórias entre as três categorias oferecidas, então é um controle reproduzível, não uma build otimizada nem uma previsão de taxa de vitória humana.

O crescimento por nível foi moderado para Vida (+12% por Ruptura), dano (+5%) e Defesa (+3); Armadura passa a escalar a partir da Ruptura III, regeneração é limitada a 5 e aflição adicional começa na Ruptura IV. Em Ruptura VI, isso representa Vida +72%, dano +30%, Defesa +18, Armadura 1, regeneração 5 e +1 de aflição.

Após a reformulação de passivas, counters, sinergias, picos de dano e Ressonância, a simulação registrou, sem Legados, 61/200 vitórias em Ruptura 0, 41/200 em I, 15/200 em II, 11/200 em III, 3/200 em IV e nenhuma em V–VI. Com escolhas de Legado variadas por partida, foram 32/100 em 0, 22/100 em I, 5/100 em II, 9/100 em III, 1/100 em IV, 1/100 em V e nenhuma em VI. Uma amostra adicional com 25 partidas por nível em Sangria, Cura, Vazio e Correntes Quebradas não teve vitórias sem Legados em IV–VI; com Legados variados, teve 1/100 em cada nível. Cura prolongou as elites para 24–38 turnos em média. As elites usam as mesmas sementes entre cenários, mas a heurística controla os dois lados e não representa uma build humana. Reproduza as amostras com `node scripts/simulate-combat.mjs --difficulty-ladder` e `--difficulty-sample`; a tabela completa fica em [`COMBAT_QA.md`](COMBAT_QA.md).

34 passivas foram refeitas e outras três ganharam recuperação por tipo de dano. O catálogo agora separa Geradores, Transmutadores, Gastadores e Manipuladores de Essência; 15 arquétipos têm ao menos cinco personagens. Oito formas mostram um papel ativo distinto no Codex e no combate, quatro tipos de resposta de counter têm efeitos próprios e quatro sinergias pequenas de Elo/Mundo acompanham aliados vivos. A Ressonância máxima caiu de 20% para 15% e cinco execuções de pico foram moderadas.

A dificuldade sobe, mas o resultado automatizado em Ruptura IV–VI continua extremo: 1,5% de vitórias em IV sem Legados, 1% em V com Legados e nenhuma em VI na amostra de Sangria. Isso é um alerta de equilíbrio para playtests com composições e escolhas intencionais, não uma previsão de desempenho humano. A proporção de troca de Essência permaneceu 5:1; ela não foi apontada como causa da dificuldade.

## Prontidão de serviços

No desenvolvimento, `npm run dev` prepara armazenamento local em `.pma-dev-data.json`. Em hospedagem, cadastro, campanha e partidas ranqueadas dependem de `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` ou das variáveis compatíveis da integração Vercel KV (`PMA_DB_KV_REST_API_URL`/`PMA_DB_KV_REST_API_TOKEN`). Sem isso, o serviço online é deliberadamente bloqueado; é preciso confirmar a configuração no ambiente alvo antes de anunciar o recurso como disponível.

## Verificações

- `npm test` cobre sistemas, servidor, catálogo, formas, passivas novas, arquétipos, sinergias, counters, unicidade das seis artes-base de cada personagem, integridade das novas artes de O Soberano, A Magistrada e O Suserano e fluxos da interface; execução atual: 222 aprovados, 0 falhas.
- `node scripts/simulate-combat.mjs` verifica partidas completas e invariantes de estado com sementes fixas.
- `node scripts/simulate-combat.mjs --difficulty-ladder` compara a curva sem progresso e com Legados acumulados.
- QA visual no navegador e avaliação de builds humanas continuam necessárias para fechar o balanço e o acabamento artístico.
