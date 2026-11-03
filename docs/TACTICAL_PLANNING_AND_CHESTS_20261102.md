# Planejamento, combinações e baús

## Planejamento privado
- A prévia usa apenas as ações do controlador e o estado público atual. Não consulta a fila secreta do rival.
- A posição e a forma usadas por uma ação são calculadas no ponto correto da ordem: todas as primeiras ações, depois todas as segundas, com iniciativa pública intercalada.
- A inserção da primeira ação de um aliado não utiliza posições ou preparações futuras da segunda passagem de outro.
- A interface informa passagem, iniciativa, origem, casas e alvos nas posições atuais. Dano ofensivo continua condicional à posição e à proteção no impacto.
- Os vínculos exibidos correspondem a mecânicas existentes: reposicionamento, retirada, formas preparadas, aumento de dano, condições de combo e Exposto aplicado por aliado. Não concedem bônus extras.
- O histórico mostra dano, recuperação, absorção, interrupção e ativações de aprimoramentos com base nos snapshots da resolução.

## Ofertas de baú
- Mantém o baú a cada quatro rodadas e a raridade no momento da abertura: três vivos = Prateado; dois = Dourado; um = Prismático.
- Mantém três opções únicas. Cura, limpeza e ressurreição só entram quando úteis. A Essência oferecida é escolhida entre os tipos usados pelo trio.
- Reavalia as opções após a resolução e entre escolhas pendentes, preservando a raridade já conquistada.
- Cada opção informa o efeito e o motivo contextual.
- Passo Residual: movimento concluído concede Escudo uma vez por alma por rodada.
- Colher a Brecha: dano confirmado em alvo previamente Exposto gera uma Essência, uma vez por rodada. Só é oferecido a trios que aplicam Exposto.
- Fonte Ritual: gera uma Essência ao fim das próximas rodadas e expira.
- Voto Arriscado: a alma mais saudável troca 12 de Vida por uma reserva maior; só aparece se houver Vida suficiente.
- Aprimoramentos valem apenas para o combate atual. Geração futura não paga custos do plano atual. O rival recebe opções segundo as mesmas regras.

## Verificação
O comando `npm run test:tactical` inclui os testes de ordem, interface, animação, vinheta, campanha, prévias privadas e baús. As antigas expectativas de prioridade global de movimento/defesa foram atualizadas para testar a iniciativa definida pelo jogo, mantendo as verificações de esquiva, proteção e contra-ataque.

## Segunda etapa: objetivo, ritmo e trilhas
- A rodada 3 anuncia a casa do baú da rodada 4 (e assim sucessivamente). A casa é pública, não bloqueia movimento e permanece a mesma mesmo ocupada no surgimento.
- Um painel recolhível descreve combinações existentes do trio, sem conceder bônus adicionais.
- Reprodução em 1×, 2× ou 3×, ajustável durante a resolução. Tempos de quadros e animações CSS usam a mesma velocidade; a ordem e os snapshots de impacto são mantidos.
- A expedição tática oferece três trilhas após escolher a recompensa da vitória: recuperação de 18 PV dos sobreviventes; risco com +18 Escudo para os rivais e até quatro opções de recompensa na próxima vitória; descoberta com outra formação determinada pela semente e pelo encontro.
- As trilhas são escolhas da expedição tática. Não substituem o conteúdo narrativo completo das campanhas por Mundo/Reino.
- As cartas mostram uma descrição persistente da ação selecionada, custo e espaço 1/2. Com dois espaços preenchidos, os botões de edição permanecem disponíveis e novas inclusões ficam bloqueadas.
- Movimento e instruções de confirmação ficam no painel sob a arena. No celular, as cinco cartas usam colunas de largura igual, o plano quebra os nomes em linhas e os principais controles têm pelo menos 44 px de altura.
- Verificação automatizada: 60 testes táticos, incluindo casa anunciada ocupada, risco, cura limitada sem reviver derrotados, troca de oposição, identidade sem mutação, seleção de velocidade e edição/exclusão de ações.

## Continuação: acompanhar e revisar o plano
- O plano enviado permanece aberto durante a reprodução, com os espaços do trio em Aguardando, Em ação, Concluída ou Interrompida. O destaque acompanha personagem e passagem, inclusive em movimentos com vários passos.
- A reprodução usa uma cópia do plano próprio e das suas explicações antes da resolução. Não revalida o plano contra o estado da rodada futura nem consulta o plano secreto do rival.
- Edição, inversão e exclusão reavaliam os espaços: ações inválidas recebem Revisar, motivo persistente na sequência e indicação nos espaços do personagem. Desfazer restaura a validade quando recupera a preparação necessária.
- O plano de reprodução é descartado ao terminar a rodada ou reiniciar a formação; o próximo planejamento começa vazio. Durante reprodução os espaços ficam bloqueados para edição.
- Verificação: 60 testes táticos, incluindo remover um movimento que sustentava o seguinte, desfazer, confirmação cancelada, plano aberto no replay, passagem por estados de execução/conclusão e limpeza na rodada seguinte; build local concluído.
- A conferência visual inicialmente pendente foi retomada no navegador remoto: confirmado aviso após exclusão, restauração ao desfazer, espaços Em ação/Aguardando durante o replay e transição para o planejamento da rodada 2.

## Continuação: edição em sequência e identificação do ator
- Editar uma ação anterior pode deixar as posteriores para revisão. A nova ação precisa ser válida até seu próprio ponto na ordem pública; não são aceitos custos, caminhos ou preparações inválidos da ação editada. O envio da rodada continua exigindo o plano inteiro válido.
- Os destinos e a confirmação usam a mesma regra de validação da edição. O jogador pode corrigir o próximo espaço ou desfazer sem apagar a sequência inteira.
- Abaixo da arena, a reprodução identifica Seu trio/Oponente, personagem, habilidade, passagem e rota/área do evento atual. Os espaços próprios não aparecem misturados às cartas do oponente.
- Casas vazias deixaram de receber o destaque de ator, que agora exige um personagem presente.
- Os 60 testes táticos passaram, incluindo editar a primeira ação, revisar/corrigir a segunda, desfazer ambas e impedir envio do plano inválido. Conferido também na prévia Vercel do commit 563136a: mudança da primeira ação preservando a segunda marcada para revisão, correção da segunda liberando o envio, ausência de destaque em casas vazias, painel do ator próprio e do oponente, e rodada seguinte com plano vazio. Em desktop de 1348 px, a largura do documento correspondeu à viewport; teste em celular físico permanece pendente.

## Continuação da avaliação de design: consequência e ritmo
- O motor registra alvos previstos pela própria simulação privada, descartando campos desse tipo enviados pelo cliente. No replay, os snapshots permitem distinguir quem saiu da área, ficou Invulnerável ou já havia sido derrotado. Sem evidência de alvo previsto, não afirma que alguém fugiu.
- As explicações aparecem junto à ação no impacto e permanecem disponíveis no histórico da rodada. Não antecipam o plano secreto do adversário.
- Repetições curtas é uma opção separada de 1×/2×/3×. A primeira ativação mantém sua apresentação; repetições da mesma habilidade/forma/personagem no combate reduzem preparação e recuperação, preservando viagem e contato. Eliminações e mudanças reais de forma corporal sempre mantêm a sequência completa.
- A identificação de repetições reinicia em um novo combate e não altera custos, resolução, ordem ou snapshots. Mudar a opção vale para as próximas ações reproduzidas.
- Ainda pendentes do roteiro amplo: regras ambientais por Mundo, trilhas narrativas completas por Reino, mais efeitos de baú e validação com jogadores/mobile físico. As três trilhas táticas atuais não equivalem à campanha narrativa completa.

## Regras ambientais opcionais por Mundo
- A formação oferece Sem regra ambiental (padrão), Inferno/Círculo de Brasas, Paraíso/Santuário de Luz e Limbo/Manto de Névoa. São protótipos selecionáveis para a expedição tática; não constituem a campanha narrativa completa.
- Uma única casa central C3 fica marcada desde o primeiro planejamento, com descrição persistente. Continua transitável, pode conter um baú e usa as mesmas regras para aliados e rivais.
- Depois das duas passagens e antes da expiração de estados, brasas causam 6 de dano ambiental: Escudo absorve, Invulnerável bloqueia, Armadura não reduz. O santuário recupera 6 de Vida, respeitando limite e bloqueio de cura, sem reviver. A névoa concede 6 de Escudo até metade da Vida máxima.
- A posição final decide o efeito: passar pela casa e sair antes do fim das ações não ativa a regra. Uma eliminação ambiental pode encerrar o confronto. O replay inclui snapshots, efeitos e mensagens.
- A regra escolhida persiste nos próximos encontros das três trilhas táticas. Sem regra selecionada, o funcionamento anterior permanece igual.
- A IA avalia o resultado ambiental público ao planejar, sem consultar a fila secreta. A prévia de ações não aplica antecipadamente os efeitos de fim de rodada.
- Testes cobrem configuração, obstáculos, ordem, posição final, Escudo/Invulnerável, limites, cura bloqueada, não ressurreição, derrota, serialização, persistência nas trilhas, IA e seleção na interface.
- Conferência da etapa anterior na prévia d039dc9: controle Repetições curtas ativado e mensagens de perda de Vida visíveis junto à ação no impacto.

Verificação da prévia b8a3a95: seletor com as quatro opções, regra de Limbo anunciada antes do plano, C3 marcada e transitável, Riven movido para C3 e recebendo 6 de Escudo no histórico, transição para rodada 2 e ausência de erros da aplicação no navegador. Desktop de 1348 px sem rolagem horizontal. 70 testes táticos e build aprovados; mobile físico e balanceamento com jogadores continuam pendentes.

## Adaptação espacial dos kits: primeira leva de 40
- Os 25 kits anteriores receberam revisão individual e 15 novos entraram no seletor: Falso Profeta, Falsário, Incendiário, Brasa Eterna, Ressentido, Vingadora, Colérico, Devorador, Saqueadora, Insaciável, Senhora do Último Pão, Credor, Usurária, Apodrecido e Pestilência.
- Cada slot e forma revisada tem geometria explícita. Linhas de 2/3 casas, cones, diagonais e varreduras pessoais complementam células, cruzes e áreas 3×3. Formas que trocam inimigo/aliado/trio usam a área da forma ativa.
- Arrasto do Príncipe puxa uma casa. Punho do Ódio Solto, Avanço da Égide, Tomada do Trono e Coração em Erupção empurram uma casa; Engolir a Essência puxa. Só alvos efetivamente afetados e vivos são deslocados. Invulnerável, contra-ataques que anulam, obstáculos, bordas e ocupantes impedem a movimentação. Não há dano de colisão, ação extra nem ativação de bônus de movimento por deslocamento forçado.
- A projeção privada inclui os deslocamentos do próprio plano, permitindo preparar um golpe da segunda passagem e mostrar quem reposicionou o alvo. A execução reavalia ocupação e cancela deslocamentos inviáveis, sem atravessar unidades.
- Cartas mostram diagramas de 5×5, descrição espacial e alcance reais. Passivas têm explicação recolhível e continuam automáticas, sem ocupar os dois espaços. Custos, recargas e valores canônicos não foram reequilibrados nesta etapa.
- Corrigidos IDs duplicados nos kits longos de Nilo: a quarta técnica ofensiva passa a tecnica-4; despertar fica reservado à defesa. Os nomes, valores e artes por índice permanecem.
- Cobertura: 40/150 kits, 186 técnicas/formas. Restam 110 kits para adaptação individual. 25 dos 40 têm atlas base; os 15 novos usam as artes existentes. Lordes não foram liberados no seletor.
- Validação adicional: 15 combates com sementes fixas, 154 ações planejadas por IA e nenhuma falha de resolução. Na suíte legada de formas/identidade, 16 testes passaram e 28 falhas já existentes foram reproduzidas no código anterior, com os mesmos nomes e nenhuma falha nova.

Verificação final desta leva: 79 testes táticos e build aprovados. Na prévia c5385d8, confirmado seletor com 40 personagens, passivas recolhíveis, carta de Sylvara com Cone frontal/alcance 2/3 alvos e diagrama de 25 células; Demetrius moveu para B2 e puxou Corvin de D3 para C2, com resultado registrado e rodada 2 iniciada. Nenhum erro da aplicação no navegador e nenhuma rolagem horizontal em desktop de 1348 px. Mobile físico e balanceamento com jogadores permanecem pendentes.
