# Continuação da revisão de personagens — 23/10/2026

A rodada iniciada no chat “Prosseguir opções PMA” foi retomada a partir de Serpe, Semente e Cindida. Esta entrega integra os três conjuntos, com vinte imagens finais em anime 2D, incluindo duas formas alternativas.

| Identidade anterior | Nome atual | Mundo / Elo | Forma |
| --- | --- | --- | --- |
| A Boca de Vidro | A Serpe | Inferno / Mentira | Serpente de vidro espiritual; sibilos e reflexos enganosos. |
| A Semente | A Semente | Paraíso / Criação | Vida vegetal de núcleo germinal, folhas e raízes; crescimento e preservação. |
| A Linha Partida | A Cindida | Limbo / Correntes Quebradas | Alma fragmentada, unida por fios instáveis, sem corpo humano. |
| O Primeiro Canto | O Cantor | Paraíso / Criação | Nome e lore individual revistos. |
| O Coração em Fúria | O Colérico | Inferno / Chama | Nome e lore individual revistos. |
| O Vínculo | O Companheiro | Paraíso / União | Nome e lore individual revistos. |

## Coerência das cenas

Serpe distingue o alvo já Exposto da ofensiva perfurante, da remoção de recurso, do ataque a três inimigos e da própria evasão. O recurso removido cai e se desfaz: a imagem não comunica uma transferência à usuária.

Semente distingue regeneração passiva, marcação ofensiva, amparo de um aliado, ativação da marca e defesa pessoal. “Semente da Ruptura” passa a “Marca Germinal”, e “Germinar por Dentro” passa a “Florescer da Marca”, mantendo os efeitos e afastando a leitura de parasitismo ou de poder exclusivo de Limbo. A marca age sobre a aura do alvo, sem crescimento físico dentro do corpo.

Cindida diferencia ruptura da guarda, tensão de uma marca, amparo com custo próprio, puxão de aflição e evasão pessoal. As conexões instáveis não representam controle da vontade alheia.

“Fruto do Porvir” tem cena exclusiva de autocura e Defesa. “Reatar a Linha” tem cena exclusiva de proteção e purificação de um aliado. A compilação seleciona a arte de cada forma e recupera a imagem ofensiva quando retorna à base. Os testes percorrem ambas as transições.

A passiva e o Fruto da Semente foram refeitos após inspeção: uma aproxima a câmera da seiva e do broto sob luz noturna; a outra mostra a roseta vista de cima em uma nascente subterrânea. Isso evita repetir o retrato frontal ao amanhecer.

## Integração e validação

- Vinte imagens RGB WebP de 512 × 512, em diretórios próprios `continuation-revision-20261023`. Imagens anteriores preservadas.
- Prompts completos, identidade de referência, tamanho e hash de cada arquivo: `CONTINUATION_REVISION_20261023.json`.
- Geração pela ferramenta integrada, uma chamada por imagem. A exportação somente converte formato e reduz a resolução; não redesenha as artes.
- Cem personagens e IDs permanentes preservados. A busca continua aceitando nomes anteriores.
- Comparação estrutural dos cem kits com o commit de partida: danos, custos, alvos, cargas, condições, recargas, formas e progressão idênticos.
- 140 testes funcionais aprovados, incluindo os retornos de imagem das duas técnicas alternativas.
- Os dois testes que exigem arquivos históricos locais foram excluídos desta execução: este checkout de trabalho trouxe os arquivos de código e as novas imagens. As 584 referências históricas de arte foram conferidas no inventário do commit de partida; as vinte referências novas apontam para arquivos exportados e validados.
- A versão de O Fim no commit de partida não foi alterada nesta rodada.

