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
- Os 60 testes táticos passaram, incluindo editar a primeira ação, revisar/corrigir a segunda, desfazer ambas e impedir envio do plano inválido. A conferência visual da nova prévia será registrada após o deploy.
