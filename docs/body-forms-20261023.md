# Transformações e retratos — PMA

O Fim passa a escolher uma manifestação nas três primeiras posições da forma original. Cada manifestação substitui essas três técnicas e o retrato. A quarta posição continua compartilhada: **Fim Inalcançável** custa 1 Essência, concede Invulnerável por uma resposta adversária, recupera 10 de Vida e restaura a forma original, com recarga de 4 turnos. A cura respeita Vida máxima e bloqueio de cura; aflições existentes continuam.

“Forma original” significa a manifestação inicial aprovada para este encontro. Não estabelece um corpo verdadeiro nem um rosto canônico para O Fim.

| Manifestação | Função | Técnicas |
| --- | --- | --- |
| Tirano | Marcas, interrupção e guarda | Fenda do Véu; Decreto do Fim; Coroa que Não Cai |
| Predador | Perseguição, roubo de Vida e drenagem | Rastro Faminto; Ceifar o Vínculo; Fome dos Reinos |
| Ruína | Aflições, interdição e pressão coletiva | Cinza de Ninguém; Nome Extinto; Última Fronteira |

Cada transformação custa 1 Cinza, concede 8 de Defesa e consome a ação daquela alma. A forma permanece até a defensiva. Não há ação adicional ao assumir um corpo. As recargas continuam ligadas às posições ao retornar ou trocar de manifestação.

A Metamorfa possui três corpos: original, Pele Usurpada e Carapaça Usurpada. As duas transformações trocam as três técnicas e o retrato. Descartar o Molde, Descamar a Armadura e Corpo Substituto restauram o corpo original sem limpar recargas. Pele Usurpada favorece lâmina perfurante e revide; Carapaça favorece guarda e contra-ataque.

O Furor usa um retrato de Ódio Solto durante sua transformação existente, restaurado pelo desfecho ou pela expiração. A Oscilante usa o retrato Contorno de Abrigo até Retomar a Sombra. Suas mecânicas anteriores permanecem.

O Codex tem seletores de formas que mostram o retrato e o conjunto completo de quatro posições de cada estado. Esses seletores não alteram o combate, o catálogo ou o progresso. No combate, a forma é indicada no nome do personagem e muda somente na resolução da habilidade ou expiração.

A IA calcula o valor do conjunto seguinte a partir do estado público: guarda, inimigos vivos, dano, aflições, controle e recuperação por roubo de Vida. Não consulta a fila do jogador nem os sorteios futuros.

## Verificação

Os testes específicos cobrem as três escolhas, as nove técnicas, custos, uma ação por alma, retorno com cura e invulnerabilidade, duração, recargas compartilhadas, limite e bloqueio de cura, estados interrompidos, preservação das definições, expiração de Furor, reversão de Oscilante, ambas as formas de Metamorfa, escolhas contextuais da IA, serialização e os dois clientes do duelo autoritativo.

O cenário `tests/fixtures/forms.html` renderiza o motor e a interface reais em larguras de 320, 360, 390, 768 e 1200 px, com recursos iniciais ampliados. Permite conferir transformações e retornos sem ler ou alterar o progresso salvo. Não é uma rota de campanha nem desbloqueia personagens.

As artes novas estão nas pastas versionadas `art/characters/{id}/body-forms-20261023/`. Fontes, prompts de geração e hashes estão em `docs/BODY_FORMS_20261023.json`. Foram criadas pela ferramenta integrada `image_gen.imagegen`, preservando as manifestações e identidades aprovadas.

A verificação no navegador confirmou: as transformações de Tirano, Carapaça Usurpada e Ódio Solto; o retorno dos retratos de O Fim e Metamorfa; Contorno de Abrigo, Pele Usurpada e a escolha de Ruína pela IA. As imagens correspondentes carregaram, sem rolagem horizontal nas larguras de quadro de 1200, 390 e 320 px. Os testes funcionais somam 156 aprovações. Duas verificações antigas de presença de todos os binários históricos foram excluídas porque o checkout local foi reconstruído sem esse acervo; os 19 novos arquivos foram validados por dimensão e hash e conferidos na árvore remota.
