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
