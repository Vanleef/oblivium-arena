# Oblivium Arena — proposta de combate tático 5×5

**Estado:** design em avaliação, registrado em 01/11/2026. Este documento formaliza a proposta do autor, com inspiração declarada em Inuyasha Demon Tournament. Não descreve uma alteração já implementada nem substitui as regras vigentes de [COMBAT_KITS.md](COMBAT_KITS.md).

As decisões da proposta estão separadas das recomendações para o protótipo e dos pontos que ainda precisam de definição. Os exemplos de novas técnicas não alteram automaticamente os kits existentes.

## Protótipo disponível na revisão

O primeiro protótipo está implementado em `/tactical.html`, com seis kits, duas ações, reserva de Essência, padrões espaciais e IA. A regra experimental adotada ativa defesas antes das ofensivas. Consulte [TACTICAL_COMBAT_PROTOTYPE.md](TACTICAL_COMBAT_PROTOTYPE.md) para o escopo e os testes. A migração do catálogo inteiro, as Técnicas Misteriosas e a integração à campanha/online ainda não fazem parte dessa entrega.

## 1. Objetivo e decisões da proposta

Manter o combate 3v3 e a campanha roguelite, acrescentando planejamento simultâneo, posição e padrões de área. O espaço de decisão passa a combinar onde estar, qual região ameaçar e como ordenar as ações do trio.

| Elemento | Proposta do autor |
| --- | --- |
| Campo | Um tabuleiro compartilhado de 5 colunas por 5 linhas |
| Ocupação | Um personagem por célula; sem empilhamento |
| Formação | Aliados à esquerda e inimigos à direita, com variações por mapa |
| Ações | Duas por personagem vivo por rodada; até seis por lado |
| Planejamento | Os dois lados planejam sem conhecer a fila adversária |
| Ordem própria | Reordenação global das seis ações, sujeita às categorias de prioridade |
| Movimento básico | Uma ação para percorrer até duas células, ortogonalmente ou em diagonal |
| Técnicas | Quatro técnicas-base com padrões espaciais; a quarta defesa ocupa uma ação |
| Recursos | Éter, Cinza, Graça e Ruptura; Coringa paga com qualquer Essência |
| Sistemas mantidos | Formas, preparações, marcas, cargas, contra-ataques, armadilhas, Invulnerável e ressonâncias |
| Roguelite | Técnicas Misteriosas obtidas durante a travessia, equipadas entre confrontos |

Dois trios completos podem produzir **12 ações na rodada**, seis de cada lado. As reações automáticas continuam sendo consequências dos efeitos já ativados; não constituem uma terceira ação programável.

## 2. Tabuleiro e movimento

**Recomendação para o primeiro protótipo:**

- Coordenadas A–E para colunas e 1–5 para linhas.
- Formação inicial de referência: aliados em A2, A3 e A4; adversários em E2, E3 e E4. São células de teste, não um bônus permanente de lado.
- Cada deslocamento básico percorre um caminho explícito de um ou dois passos. Um passo alcança qualquer uma das oito células adjacentes.
- O movimento básico não atravessa personagens ou obstáculos e exige destino livre.
- Uma diagonal não atravessa o canto fechado por dois obstáculos ortogonais.
- Duas ações de movimento permitem até quatro passos na rodada. Uma técnica com deslocamento e ataque consome uma ação, salvo indicação própria.
- Salto, dash e teleporte só atravessam ocupação quando sua definição permite. Mesmo assim, não terminam numa célula ocupada.

O caminho e o destino aparecem na prévia. A validação considera o tabuleiro no instante da resolução, porque outra ação pode ocupar uma passagem depois do planejamento.

### Conflitos de ocupação

A ordem de resolução determina quem ocupa primeiro uma célula disputada. Uma ação de movimento interrompida percorre apenas o trecho ainda válido e termina na última célula livre alcançada; se o primeiro passo estiver bloqueado, não sai da origem. A ação é consumida.

Trocas diretas de posição entre dois personagens exigem uma técnica que autorize a troca. Não surgem implicitamente de dois movimentos para células ocupadas.

Estas regras são recomendações para evitar empilhamento e deslocamentos inesperados. Precisam ser confirmadas por teste antes de virar regras finais.

## 3. Rodada e planejamento simultâneo

### Abertura

1. Processar os efeitos definidos para a abertura e gerar Essência pelas regras atuais.
2. Produzir a visão pública do combate: posições, personagens vivos e informações que já eram inspecionáveis.
3. Abrir dois espaços de ação para cada personagem elegível.
4. Os dois lados planejam a partir do mesmo estado público.

### Planejamento

O jogador escolhe técnicas, destinos, orientação dos padrões e ordem das ações. Pode editar a fila antes de confirmar. Espaços não usados representam espera, sem geração gratuita de recursos.

A interface reserva os pagamentos fixos e permite escolher cada unidade Coringa. A soma das reservas não pode exceder a Essência disponível. A conversão 5→1 continua sendo uma conversão da reserva, com redução líquida de quatro unidades.

**Recomendação inicial:** não financiar a segunda técnica com uma geração ou roubo que ainda não aconteceu. Isso evita prometer uma ação que depende de acertar um alvo móvel. Habilidades que geram Essência continuam produzindo seu efeito normalmente, e a reserva fica disponível para planejamento posterior. Esta política de reserva é uma decisão de protótipo, não uma remoção do sistema de geração.

Preparações e transformações determinísticas do próprio personagem devem ser simuladas na prévia para permitir setup + payoff. A execução revalida as condições reais: uma preparação interrompida não concede automaticamente sua continuação.

### Confirmação e revelação

Cada lado confirma sua fila uma única vez. A fila adversária fica inacessível até ambos confirmarem. Depois da revelação, não há edição de ações, caminhos ou pagamentos.

A IA deve fechar sua fila sem consultar as ações ainda ocultas do jogador. A partida online precisa aplicar essa mesma regra no servidor.

## 4. Ordem de resolução

A ordem fornecida pelo autor é:

| Prioridade | Categoria |
| ---: | --- |
| 1 | Movimento e reposicionamento |
| 2 | Preparações, buffs, debuffs e selos |
| 3 | Ataques e técnicas ofensivas |
| 4 | Defesas, Invulnerável e ações de reação |

A reordenação global define a posição relativa das ações **dentro da mesma categoria**. Ela não faz um ataque ultrapassar um movimento se as prioridades forem obrigatórias. A interface precisa mostrar a ordem efetiva, não apenas a ordem em que os comandos foram adicionados.

### Desempate entre os lados — recomendação

Usar uma resolução determinística, sem criar um atributo de velocidade:

1. Prioridade da categoria.
2. Posição relativa da ação na fila de seu lado.
3. Em empate entre lados, iniciativa da rodada.
4. A iniciativa alterna por rodada; o lado inicial é definido pela semente da partida.

Assim, uma categoria intercala as primeiras ações de cada lado, depois as segundas, preservando a ordem relativa escolhida por cada jogador. O log registra os desempates. Trocar os lados num teste deve permitir avaliar a vantagem de iniciativa.

### Ponto de decisão: ativação das defesas

A prioridade 4 coloca a defesa depois das ofensivas da rodada. Nesse caso, Invulnerável não protege contra ataques já resolvidos. Contra-ataques ou armadilhas preparados nessa fase só podem reagir a ações posteriores ou à rodada seguinte.

Isso exige uma decisão explícita para preservar a função defensiva atual:

- **Recomendação para testar:** ativar as posturas defensivas junto às preparações, antes dos ataques, mantendo as reações automáticas no instante do gatilho.
- **Alternativa fiel à ordem proposta:** manter a defesa na prioridade 4 e definir sua janela de proteção até a ofensiva seguinte. A prévia deve explicar que ela não salva de um golpe que antecede sua ativação.

O documento não adota silenciosamente uma dessas alternativas. “Manter Invulnerável intacto” e “ativá-lo sempre depois de todos os ataques” precisam ser conciliados antes de implementar.

### Técnicas com mais de uma função

Cada técnica recebe uma categoria principal explícita. Uma investida que move e ataca deve resolver como uma técnica composta: deslocamento e impacto são partes da mesma ação. Não ganha um movimento extra gratuito na prioridade 1 seguido de outro ataque na prioridade 3.

Uma técnica ofensiva que também aplica Marca continua sendo ofensiva; não antecipa seu dano apenas por incluir um debuff. Selos e reações seguem seus gatilhos próprios.

## 5. Padrões, alvos e linha de visão

Posição, alcance, orientação, área e elegibilidade são campos separados:

| Campo | Pergunta |
| --- | --- |
| Origem | De qual célula o padrão parte? |
| Alcance | Até onde pode ser colocada a âncora? |
| Orientação | Para qual direção o desenho aponta? |
| Padrão | Quais células são afetadas? |
| Elegibilidade | Afeta inimigos, aliados, o usuário ou uma combinação expressa? |
| Linha de visão | Exige uma passagem desobstruída? |
| Deslocamento | Move o usuário, a vítima ou ambos? |

### Biblioteca inicial de padrões

| Padrão | Definição espacial sugerida |
| --- | --- |
| Adjacente | Uma célula escolhida entre as oito vizinhas |
| Frente curta | Uma ou duas células consecutivas na orientação escolhida |
| Linha | Células alinhadas na direção da técnica, até o alcance definido |
| Coluna completa | As cinco células de uma coluna selecionável pelo alcance |
| Cruz | Âncora e quatro vizinhas ortogonais |
| Área 3×3 | Âncora e suas oito vizinhas; corta nas bordas do tabuleiro |
| X | Âncora e quatro vizinhas diagonais |
| Cone de dois passos | Uma célula frontal e três células na faixa seguinte |
| Diagonal | Raio diagonal até o alcance definido |
| Salto com impacto | Deslocamento para destino válido e padrão de impacto definido |
| Puxão ou empurrão | Alteração de posição do alvo, com efeito ofensivo separado |

Para uma âncora em C3, a cruz alcança C3, B3, D3, C2 e C4. O X alcança C3, B2, D2, B4 e D4. Uma área 3×3 cobre B2 até D4. Esses exemplos não determinam o alcance de todas as técnicas.

**Recomendação de mira:** ofensivas de área fixam as células e a orientação na confirmação. Se a vítima sair, a técnica pode errar; não persegue automaticamente o alvo. A origem pode acompanhar a posição válida do usuário após seu movimento, conforme o contrato da técnica.

Apoios pessoais continuam pessoais. Para apoios em outro aliado, definir expressamente se seguem o aliado dentro do alcance ou se afetam apenas a região marcada. Não converter uma proteção individual em proteção de trio só porque o desenho possui várias células.

**Linha de visão sugerida:** ataques diretos exigem visão livre; obstáculos sólidos bloqueiam; técnicas em arco, saltos e teleportes podem ter exceções declaradas. A primeira arena de teste pode usar terreno aberto para validar o sistema antes de adicionar cobertura.

### Empurrão e puxão — recomendação

- Resolver uma célula por vez, numa direção definida.
- Parar antes da borda, de um obstáculo ou de outra unidade.
- Não deslocar uma segunda vítima por colisão sem previsão na técnica.
- Não causar dano de colisão universal; esse efeito precisa constar do kit.
- Empurrar usa a direção de afastamento da origem; puxar usa a direção de aproximação.
- A prévia de uma técnica diagonal deve mostrar a sequência exata de células.
- Imunidades a deslocamento, quando existirem, não implicam imunidade automática ao dano.

## 6. Compatibilidade com os sistemas atuais

Manter o núcleo significa preservar suas funções e revisar os pontos em que a nova cadência muda o resultado:

| Sistema | Contrato de adaptação |
| --- | --- |
| Essência | Quatro tipos reais, pagamentos Coringa e conversão 5→1; nenhuma geração básica extra só por haver duas ações |
| Preparações | Uma ação pode preparar a outra; janela, condição e consumo continuam explícitos |
| Marcas | Pertencem à origem que as aplicou; a segunda ação pode consumir a marca se a primeira realmente acertar |
| Cargas | Limites e consumo por técnica são mantidos; duas ações não duplicam um gatilho limitado à rodada |
| Formas | Alteram as técnicas correspondentes e precisam aparecer na prévia da sequência |
| Recargas | Uma recarga não avança por ação; a mesma técnica não fica pronta só porque outro personagem agiu |
| Invulnerável | Continua no quarto espaço e custa uma ação; sua janela depende da decisão da seção 4 |
| Contra-ataques e armadilhas | Ativam quando preparados e reagem ao gatilho real; não reagem retroativamente |
| Ressonâncias | Mantêm o cálculo atual; posição não cria novos bônus sem regra própria |
| Vida, Defesa e aflições | Preservam suas regras; reduzir movimentos de resolução a “turnos” não pode causar ticks extras |
| Técnicas em área | A quantidade de alvos passa a depender da ocupação; mudanças de potencial exigem revisão por kit |

### Recarga e repetição na mesma rodada

**Recomendação:** a recarga começa quando a técnica é executada e não diminui no encerramento dessa mesma rodada. Um marcador de rodada de ativação evita adiantar seu retorno.

É necessário decidir se uma técnica com recarga zero pode ser usada duas vezes na rodada. Permitir isso favorece dano e aflições repetidos; proibir favorece combinação de técnicas e movimento. Essa escolha deve ser testada, não presumida como parte da proposta.

### Durações e encerramento

Substituir o antigo conceito de “próxima resposta adversária” exige uma tabela de equivalência por efeito. “Um turno” não pode passar a significar uma ação individual.

Recomenda-se uma janela explícita com instante de ativação e expiração. Cada efeito recebe seus ticks apenas na fase definida; um efeito criado no fim da rodada não deve expirar imediatamente. A regeneração não pode ocorrer duas vezes só porque o personagem possui duas ações.

A ordem de ticks, expiração, morte e verificação de vitória precisa ter resultados reproduzíveis, inclusive quando ambos os lados caem no mesmo encerramento.

### Ação inviável após a revelação — recomendação

Revalidar Vida, estado, forma, alcance e ocupação antes de executar. Um personagem derrotado não executa ações restantes.

Reservar Essência não é gastá-la. A recomendação inicial é gastar quando a técnica começa; se ela é cancelada antes disso, libera a reserva. Se foi lançada e o padrão não atinge ninguém, o custo permanece pago. Reembolsos não financiam ações novas depois da confirmação.

O resultado de uma investida cujo movimento foi bloqueado precisa constar do contrato: atingir só a região alcançada ou cancelar o impacto. Não escolher uma política escondida por personagem.

## 7. Exemplos de conversão

Os nomes vigentes devem acompanhar o [catálogo](CHARACTER_CATALOG.md). “O Açougueiro” e “A Viúva” são referências do resumo; não substituem os nomes atuais.

| Identidade | Exemplo de adaptação espacial | Revisão necessária |
| --- | --- | --- |
| Riven — O Ceifador de Tolos, alias O Açougueiro | Corte frontal estreito; segunda ação avança e consome uma marca efetivamente aplicada | Distância da investida, alcance do corte e regra de bloqueio |
| Lira — A Noiva da Lua, referência A Viúva | Região 3×3 de seda, puxão de marcados e consumo de marcas numa área | Lentidão, puxão e explosão são propostas; conferir quais efeitos já existem antes de acrescentar |
| Guardião do Limbo, exemplo de função | Defesa em cruz e reposicionamento com proteção de um aliado | Associar o exemplo a um ID existente antes de alterar identidade ou kit |

Nenhum arquétipo citado como referência precisa virar uma etiqueta visível na interface. Nenhum desses exemplos autoriza adicionar dano, Marca ou movimento a todas as técnicas semelhantes.

A primeira conversão deve usar poucos kits representativos. O mapeamento das 689 técnicas e variações vem depois do teste das regras comuns.

## 8. Técnicas Misteriosas e Legados

A proposta permite escolher uma Técnica Misteriosa após combates, elites ou eventos elegíveis. As cartas podem pertencer ao trio ou a um personagem e têm equipamento alterável entre encontros.

**Recomendação para o protótipo:** um quinto espaço temporário por personagem, com cartas obtidas num inventário compartilhado e atribuídas a apenas um portador por vez. Usar a carta ocupa uma das duas ações e paga seu custo. O quinto espaço não concede uma terceira ação.

Substituir técnicas-base é uma alternativa de equipamento; o quarto espaço defensivo exige uma decisão específica antes de poder ser substituído. A versão inicial pode preservar os quatro espaços-base para facilitar a comparação.

| Carta proposta | Função | Limite a definir |
| --- | --- | --- |
| Passo Fantasma | Movimento longo que atravessa ocupação | Distância, custo, recarga e destino livre |
| Eco de Ruptura | Padrão em X e geração de Essência | Exigir acerto ou não; limite de geração por uso |
| Selo de Espelho | Contra-ataque que copia um padrão ofensivo | Copiar geometria não copia automaticamente dano, efeitos ou recursos |
| Graça Compartilhada | Cura em área e regeneração | Área, duração e primeiro tick |

Raridade e disponibilidade devem ser dados das cartas. Não definir valores finais antes de medir o sistema de duas ações.

Transformar uma carta em permanente por Legado pode significar desbloqueá-la para futuras ofertas, e não equipá-la gratuitamente em toda partida. O modo de permanência ainda precisa de decisão. A Arena competitiva deve declarar se exclui as cartas de campanha ou utiliza um conjunto padronizado.

## 9. IA e validação do servidor

A IA usa o estado público, o histórico permitido e uma semente reproduzível. Não lê a fila oculta do jogador nem sorteios futuros.

Processo sugerido:

1. Gerar movimentos alcançáveis, padrões e combinações de duas ações por personagem.
2. Eliminar planos com reservas impossíveis, formas incompatíveis ou caminhos inválidos na prévia.
3. Avaliar ameaça, ocupação do centro e flancos, agrupamento vulnerável, sobrevivência e apoio.
4. Montar uma fila global com até seis ações usando busca limitada, evitando enumerar todas as permutações.
5. Simular algumas respostas plausíveis a partir da informação pública e escolher a combinação.
6. Confirmar a fila e revalidar normalmente durante a execução.

O servidor deve validar dois planos independentes, orçamento de ações, Essência reservada, coordenadas, caminhos, orientação, formas, custos e resultado. Clientes não enviam dano, vitória ou posições finais como autoridade.

Dificuldades podem variar profundidade de busca e qualidade da avaliação, mantendo o mesmo limite de informação. Um registro de ações, semente e eventos permite reproduzir a rodada.

## 10. Interface de planejamento

- Tabuleiro com ocupação, seleção por toque e teclado e áreas de efeito legíveis.
- Seis espaços globais de planejamento, identificando personagem e ação.
- Reserva de Essência, pagamento Coringa e orçamento de duas ações visíveis.
- Prévia das posições próprias projetadas, sem prometer posições futuras do adversário.
- Células afetadas, elegibilidade e caminho separados por símbolos além de cor.
- Ordenação efetiva por prioridade e aviso quando a posição na fila não altera a categoria.
- Revisão final antes de confirmar; edição bloqueada após a revelação.
- Log de deslocamentos, falhas, reações, pagamentos e expirações.
- Animações e preferência por movimento reduzido sem alterar o resultado.

## 11. Balanceamento e critérios de teste

Manter a geração atual de Essência enquanto se dobra a quantidade de ações pode aumentar a procura por técnicas baratas e transformar o movimento numa escolha frequente. Isso deve ser medido antes de aumentar recursos ou reduzir custos.

Verificar:

- Dois lados planejam sem acesso à fila adversária.
- Nunca há duas unidades na mesma célula.
- Caminhos bloqueados, diagonais e disputas de destino têm resultado determinístico.
- Nenhum personagem usa mais de duas ações programadas.
- Reservas não gastam a mesma Essência duas vezes.
- Setup + payoff depende da preparação realmente resolvida.
- Mudança de forma altera corretamente a segunda técnica.
- Recargas e aflições não avançam a cada ação.
- Invulnerável protege exatamente a janela exibida.
- Contra-ataques e armadilhas respeitam sua quantidade de gatilhos.
- Mortes cancelam ações futuras; colisões não criam dano oculto.
- Repetições com a mesma semente e planos geram o mesmo resultado.
- Troca dos lados mede a vantagem de iniciativa.
- Novas cartas respeitam orçamento, custo, portador e persistência de campanha.

Métricas úteis: duração das partidas, dano por rodada, ações usadas em movimento, técnicas repetidas, concentração de alvos por área, cartas dominantes e taxa de vitória por lado inicial.

## 12. Decisões pendentes e sequência de implementação

| Decisão pendente | Recomendação inicial |
| --- | --- |
| Quando defesas entram em vigor? | Antes das ofensivas, junto às preparações |
| Como desempatar ações entre lados? | Categoria, posição relativa e iniciativa alternada |
| Mira acompanha um personagem ou fixa células? | Ofensivas de área fixam células; apoios declaram sua política |
| Pode repetir técnica de recarga zero? | Comparar as duas regras no protótipo |
| Como transpor durações e recargas? | Janelas explícitas, sem ticks por ação ou expiração imediata |
| Geração prevista pode financiar ação posterior? | Reservar apenas a Essência disponível no planejamento inicial |
| Como resolver investida bloqueada? | Declarar se o impacto usa a posição alcançada ou é cancelado |
| Carta permanente significa o quê? | Desbloqueio de futuras ofertas; equipamento gratuito exige regra própria |
| Cartas da campanha entram na Arena? | Manter a decisão explícita por modalidade |

Sequência recomendada:

1. Fechar as decisões temporais e o contrato espacial.
2. Criar um protótipo isolado 5×5 com dois trios, movimento e poucos padrões.
3. Converter kits de marca/consumo, apoio, área, forma e contra-ataque.
4. Testar planejamento simultâneo, custos e invariantes.
5. Integrar IA e autoridade do servidor.
6. Introduzir Técnicas Misteriosas na campanha.
7. Converter e revisar o restante do catálogo, preservando identidades e lore.
8. Atualizar tutorial, documentação vigente e apresentação do jogo após a integração.

Até essa integração, os documentos do sistema atual continuam descrevendo uma ação por personagem. Este arquivo registra a proposta e seus pontos de decisão.
