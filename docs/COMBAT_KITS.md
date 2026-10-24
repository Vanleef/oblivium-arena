# PMA — kits e regras de combate

Catálogo gerado a partir dos dados jogáveis. Atualize com `node scripts/generate-kit-catalog.mjs`.

## Fluxo

1. Escolha uma habilidade e um alvo destacado.
2. Cada personagem usa uma ação por turno. A fila reserva os recursos.
3. Reordene ou remova ações, revise, escolha o pagamento Aleatório e confirme em Pronto.
4. As ações aliadas e a resposta adversária resolvem uma a uma.
5. Aflições e durações são atualizadas antes do próximo planejamento.

## Durações e recursos

- A quarta técnica das 100 almas concede Invulnerável por uma resposta adversária. Custa 1 Aleatório; fica indisponível nos quatro turnos próprios seguintes.
- Aleatório é um custo preto pago com qualquer combinação dos quatro tipos. Na revisão, os custos fixos são reservados antes da sugestão automática; os controles permitem escolher o que gastar e ver o saldo preservado. Não é um quinto recurso sorteado.
- Corpos distintos usam recursos principais diferentes; o seletor de formas do Codex mostra o recurso e o kit de cada corpo.
- Invulnerável impede novas habilidades inimigas; aflições anteriores continuam.
- Dano perfurante ignora redução; aflição ignora redução e Defesa destrutível.
- Contra-ataque anula a próxima habilidade recebida e responde uma vez com dano físico.
- Exposição dura até o fim do próximo turno do lado que a aplicou, permitindo a continuação do próprio personagem. O dano que aplica Exposição não recebe seu próprio bônus.
- Bônus de dano dura até o fim do próximo turno do beneficiado. Pode beneficiar aliados que ainda agirão na fila atual.
- Enfraquecimento reduz 10 de dano durante os turnos do alvo indicados na habilidade. Preparações dos quatro combos de Enfraquecimento duram 2 turnos.
- Marcas pertencem a quem as aplicou. Cargas vão de 0 a 3. Bônus por carga usa as cargas anteriores à ação; ganho e consumo ocorrem uma vez por habilidade não anulada.
- O primeiro jogador recebe 1 recurso aleatório na abertura; nos turnos seguintes cada lado recebe um por personagem vivo. Os quatro tipos têm 25% de chance por sorteio. Saldos não gastos acumulam sem teto de 5.
- Benefícios pessoais e passivas de uma técnica em área ocorrem uma vez por uso. Dano, cura coletiva e Defesa coletiva atingem cada alvo válido.
- Regeneração recupera Vida no início dos turnos indicados. Reaplicar a mesma técnica da mesma origem renova o efeito sem acumular cópias.
- Armadilhas reagem uma vez à condição descrita e expiram após a próxima vez do alvo. Reações de amparo respondem à perda de Vida por novas habilidades durante a resposta adversária. Reações não encadeiam outras reações.
- Selos de apoio e ofensiva cancelam apenas a categoria indicada; a quarta defesa continua disponível sob selo de apoio. Recargas reduzidas por apoio nunca incluem a quarta defesa.
- Variações ocupam o mesmo espaço e compartilham a ação e a recarga. Uma técnica pode mudar por preparação, contra-ataque ativado, Vida, cargas ou esgotamento de usos. Janelas indicam quantos turnos próprios seguintes permanecem abertas. Posturas sem duração acabam apenas pelo efeito de reversão.
- Quando uma preparação abre uma continuação no mesmo espaço, sua recarga é adiada até a continuação terminar ou expirar. A quarta defesa nunca é substituída.
- Técnicas em área com maior potencial de explosão custam 3 recursos. Custos aparecem no jogo como quadrados coloridos.

## Referências de estrutura

- https://naruto-arena.online/the-basics/
- https://soul-arena.io/the-basics

Os kits usam as identidades e os conceitos do PMA. Testes cobrem a execução de cada combo, custos, uso de marcas e cargas, durações e a quarta defesa. O ajuste fino entre equipes e dificuldades depende de partidas e iterações de balanceamento.

## Elo Sangria

### O Açougueiro — Executor

Abra Sangramento e escolha entre reabrir a mesma ferida ou consumi-la na Sentença.

**Estrutura:** Execução encadeada

**Passiva — Faro de Sangue:** Suas habilidades causam +5 de dano se o alvo está com Sangramento.

- **Incisão de Abate** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Sangramento: 5 de dano de aflição por 2 turnos. Vira Reabrir a Ferida por 2 turnos, somente contra a mesma vítima.
- **Reabrir a Ferida** [variação] (1 Cinza + 1 Essência; recarga 0T): Causa 20 de dano físico a um inimigo. Se o alvo está com Sangramento: +10 dano; consome a preparação. Após usar, restaura Incisão de Abate.
- **Talho Imobilizante** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Atordoa por 1 turno.
- **Sentença do Cutelo** (1 Cinza + 1 Essência; recarga 1T): Causa 30 de dano físico a um inimigo. Se o alvo está com Sangramento: +15 dano; consome a preparação.
- **Passo entre Lâminas** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Viúva — Duelista

Atraia uma agressão ao véu para abrir uma cobrança de Vida contra quem o atacou.

**Estrutura:** Resposta ao agressor

**Passiva — Luto Faminto:** Após causar dano com uma habilidade, restaura 4 de Vida.

- **Fio Escarlate** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Fio Reverso** [variação] (1 Cinza + 1 Essência; recarga 0T): Causa 25 de dano perfurante a um inimigo. Restaura ao usuário 50% do dano causado. Após usar, restaura Fio Escarlate.
- **Véu da Viúva** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno. Se o contra-ataque ativar, Fio Escarlate vira Fio Reverso contra o agressor por 2 turnos.
- **Beijo da Última Noite** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 50% do dano causado. Se o alvo tem a marca desta preparação: +15 dano.
- **Véu de Sangue** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Colecionador — Caçador

Acumule troféus e escolha quando gastar as duas grandes execuções disponíveis no combate.

**Estrutura:** Munição limitada

**Passiva — Primeiro Troféu:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Laço de Caça** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Ganha 1 carga (máx. 3).
- **Cobrança do Caçador** (1 Cinza; recarga 0T): Causa 20 de dano físico a um inimigo. Remove 15 de Defesa antes do dano.
- **Galeria de Troféus** (1 Cinza + 1 Aleatório; recarga 2T): Causa 20 de dano físico a um inimigo. Consome as cargas: +8 de dano por carga. Pode ser usada 2 vezes por combate; depois vira Caça sem Troféus.
- **Caça sem Troféus** [variação] (1 Aleatório; recarga 0T): Causa 15 de dano físico a um inimigo. Consome as cargas: +3 de dano por carga.
- **Sombra do Colecionador** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### Gêmeos do Cutelo — Ruptor

Use um corte para abrir o outro; escolha entre a continuação concentrada e o encontro das duas lâminas.

**Estrutura:** Cadência cruzada

**Passiva — Ritmo dos Gêmeos:** Suas habilidades causam +4 de dano se o alvo está Exposto.

- **Cutelo da Esquerda** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. No próximo turno, Cutelo da Direita vira Corte em Contratempo contra a mesma vítima.
- **Cutelo da Direita** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Sangramento: 4 de dano de aflição por 2 turnos.
- **Corte em Contratempo** [variação] (1 Cinza + 1 Essência; recarga 0T): Causa 15 de dano perfurante a um inimigo. Sangramento: 4 de dano de aflição por 2 turnos. Se o alvo está Exposto: +5 dano. Após usar, restaura Cutelo da Direita.
- **Encontro das Lâminas** (2 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a todos os inimigos. Se o alvo está Exposto: +10 dano.
- **Dança Cruzada** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Carrasco — Sentenciador

Marque uma sentença que pune apoio; interrompa a vítima ou guarde a execução para quando ela estiver ferida.

**Estrutura:** Sentença contra apoio

**Passiva — Sem Apelação:** Suas habilidades causam +5 de dano se o alvo está Atordoado.

- **Sentença sem Nome** (1 Cinza; recarga 0T): Causa 5 de dano físico a um inimigo. Marca o alvo por 3 turnos. Se o alvo usar uma técnica de apoio em sua próxima vez: causa 10 de dano de aflição ao próprio alvo. Ativa uma vez.
- **Queda da Guilhotina** (1 Cinza + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Última Respiração** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Se o alvo tem 50 de Vida ou menos: +20 dano.
- **Capuz do Esquecimento** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Mãe Rubra — Sustentação

Troque sua Vida por guarda e recuperação futura de um aliado; sustente-se drenando o inimigo.

**Estrutura:** Cuidado com sacrifício

**Passiva — Sangue que Acolhe:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Cordão Rubro** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Restaura ao usuário 50% do dano causado.
- **Partilha da Mãe** (1 Cinza; recarga 1T): Restaura 15 de Vida. Concede 10 de Defesa destrutível. Regeneração: restaura 4 de Vida no início dos próximos 2 turnos do beneficiado. O usuário perde 5 de Vida (não o derrota).
- **Berço de Sangue** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a todos os inimigos. Sangramento: 4 de dano de aflição por 2 turnos.
- **Casulo Rubro** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Coroa

### O Soberano — Dominador

Assuma a coroa para espalhar decretos e depois escolha quem será obrigado a ajoelhar.

**Estrutura:** Domínio temporário

**Passiva — Autoridade Estilhaçada:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Decreto do Rei Caído** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos.
- **Decreto sobre Todos** [variação] (1 Cinza + 1 Essência; recarga 0T): Causa 10 de dano espiritual a todos os inimigos. Marca o alvo por 3 turnos.
- **Ajoelhar** (1 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Coroa sobre Ruínas** (1 Cinza + 1 Essência; recarga 0T): Concede 25 de Defesa destrutível. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Durante os próximos 2 turnos, Decreto do Rei Caído vira Decreto sobre Todos.
- **Trono Interior** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Magistrada — Magistrada Tirânica

Imponha uma acusação para expor e selar o apoio; interrompa a resistência antes da sentença perfurante.

**Estrutura:** Interdição de apoio

**Passiva — Lei do Mais Forte:** Suas habilidades causam +5 de dano se o alvo está Exposto.

- **Acusação Imposta** (1 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Sela técnicas de apoio por 1 turno do alvo. A defesa pessoal continua disponível.
- **Interdição da Defesa** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Atordoa por 1 turno. Remove 10 de Defesa antes do dano.
- **Sentença de Submissão** (1 Cinza + 1 Essência; recarga 1T): Causa 30 de dano perfurante a um inimigo. Se o alvo está Exposto: +10 dano.
- **Toga Inviolável** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Suserano — Suserano da Interdição

Sele a ofensiva inimiga, imponha uma resposta em favor de um aliado e fortaleça a guarda dos seus vassalos.

**Estrutura:** Autoridade sem corpo

**Passiva — Autoridade Delegada:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Decreto de Submissão** (1 Cinza + 1 Essência; recarga 1T): Causa 15 de dano espiritual a um inimigo. Sela técnicas ofensivas por 1 turno do alvo.
- **Interdição Soberana** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno.
- **Guarda dos Vassalos** (1 Cinza + 1 Essência; recarga 0T): Concede 15 de Defesa destrutível ao trio. Aumenta em 5 o dano até o fim do próximo turno do beneficiado.
- **Suserania Inviolável** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Príncipe — Carcereiro

Prenda uma vítima e escolha entre apertar o mesmo grilhão ou gastar as cargas no cárcere.

**Estrutura:** Perseguição

**Passiva — Grilhão Herdado:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Primeiro Grilhão** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Ganha 1 carga (máx. 3). No próximo turno, vira Apertar o Grilhão contra a mesma vítima.
- **Apertar o Grilhão** [variação] (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Ganha 1 carga (máx. 3). Após usar, restaura Primeiro Grilhão.
- **Arrasto do Príncipe** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Cárcere Dinástico** (1 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a um inimigo. Atordoa por 1 turno. Consome as cargas: +8 de dano por carga.
- **Corrente Exterior** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Déspota — Comandante Tirânica

Queime a resistência com o ferro do jugo, fortaleça seus executores e castigue quem já carrega a Queimadura.

**Estrutura:** Comando persistente

**Passiva — Lealdade pelo Medo:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Ferro do Jugo** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Queimadura: 4 de dano de aflição por 2 turnos.
- **Ordem Absoluta** (1 Cinza + 1 Essência; recarga 0T): Concede 10 de Defesa destrutível ao trio. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Regeneração: restaura 2 de Vida no início dos próximos 2 turnos de cada aliado.
- **Esmagar a Resistência** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Remove 15 de Defesa antes do dano. Se o alvo está com Queimadura: +15 dano.
- **Privilégio Soberano** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Herdeiro — Tirano Herdeiro

Use a Vida perdida para fortalecer o punho; recupere-se ou gaste as cargas na tomada do trono.

**Estrutura:** Resistência cativa

**Passiva — Ambição Acorrentada:** Com 50 de Vida ou menos, suas habilidades causam +6 de dano.

- **Punho Acorrentado** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. A cada 25 de Vida perdida pelo usuário: +3 de dano (máx. +9). Ganha 1 carga (máx. 3).
- **Resistência do Pretendente** (1 Cinza; recarga 0T): Restaura 15 de Vida. Reduz em 10 o dano recebido por 1 turno.
- **Tomada do Trono** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Consome as cargas: +8 de dano por carga. O usuário perde 5 de Vida (não o derrota).
- **Guarda Dinástica** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Mentira

### O Sussurro — Sabotador

Envenene um segredo que pune a próxima ofensiva da vítima e depois cobre seus recursos.

**Estrutura:** Segredo provocador

**Passiva — Segredo em Circulação:** Suas habilidades causam +4 de dano se o alvo está com Veneno.

- **Palavra Envenenada** (1 Cinza; recarga 0T): Causa 5 de dano espiritual a um inimigo. Veneno: 5 de dano de aflição por 2 turnos. Se o alvo usar uma técnica ofensiva em sua próxima vez: causa 8 de dano de aflição ao próprio alvo. Ativa uma vez.
- **Segredo Cobrado** (1 Cinza + 1 Essência; recarga 1T): Causa 20 de dano físico a um inimigo. Rouba 1 recurso da reserva inimiga. Se o alvo está com Veneno: +10 dano.
- **Aviso Falso** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 15 de dano. Dura 1 turno.
- **Voz sem Origem** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Máscara Dupla — Ilusionista

Empreste um rosto para marcar, mude a resposta e revele a traição quando o adversário baixar a guarda.

**Estrutura:** Alternância de intenções

**Passiva — Segundo Rosto:** Após causar dano com uma habilidade, restaura 3 de Vida.

- **Rosto Emprestado** (1 Cinza; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos. Vira Gesto de Outro Rosto por 2 turnos: um ataque que prepara um contra-ataque pessoal.
- **Gesto de Outro Rosto** [variação] (1 Cinza + 1 Essência; recarga 0T): Causa 10 de dano espiritual a um inimigo. Anula a próxima habilidade inimiga recebida e contra-ataca com 15 de dano. Dura 1 turno. Após usar, restaura Rosto Emprestado.
- **O Outro Rosto** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 25 de dano. Dura 1 turno.
- **Traição Revelada** (1 Cinza + 1 Essência; recarga 2T): Causa 20 de dano físico a um inimigo. Rouba 1 recurso da reserva inimiga. Se o alvo tem a marca desta preparação: +15 dano; consome a preparação.
- **Troca de Máscara** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Intrigante — Manipulador

Prenda o adversário na trama e escolha entre continuar o controle ou desatar a rede para limpar o trio.

**Estrutura:** Controle ou amparo

**Passiva — Trama Paciente:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Fio de Engano** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Enfraquece por 1 turno do alvo: −10 de dano causado. No próximo turno, Rede de Falsidades vira Desatar a Trama.
- **Rede de Falsidades** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a todos os inimigos. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Desatar a Trama** [variação] (1 Cinza + 1 Essência; recarga 0T): Restaura 8 de Vida a cada aliado. Remove aflições e condições prejudiciais. Após usar, restaura Rede de Falsidades.
- **Nó da Contradição** (1 Cinza + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Fora da Trama** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Serpe — Predadora de Reflexos

Repetir o sibilo aumenta seu dano até o limite; Atordoamento quebra a sequência.

**Estrutura:** Discurso crescente

**Passiva — Verdade Fraturada:** Suas habilidades causam +4 de dano se o alvo está Exposto.

- **Sibilo Cortante** (1 Cinza; recarga 0T): Causa 15 de dano perfurante a um inimigo. Cada uso não anulado dá +3 de dano a esta técnica (máx. +9). Atordoamento zera esse bônus.
- **Reflexo Traiçoeiro** (1 Cinza; recarga 1T): Causa 10 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Remove 1 recurso da reserva inimiga.
- **Coro de Estilhaços** (2 Cinza + 1 Essência; recarga 2T): Causa 20 de dano perfurante a todos os inimigos. Se o alvo está Exposto: +10 dano.
- **Reflexo Desviado** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Impostor — Corruptor

Cultive cargas com a falsa bênção e escolha entre confessar para recuperar-se ou fabricar um milagre ofensivo.

**Estrutura:** Fé ou confissão

**Passiva — Fé Desviada:** No início do seu turno, restaura 3 de Vida.

- **Promessa do Profeta** (1 Cinza; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos.
- **Bênção Falsa** (1 Aleatório; recarga 0T): Restaura 15 de Vida. Regeneração: restaura 3 de Vida no início dos próximos 2 turnos do beneficiado. Ganha 1 carga (máx. 3). Vira Confissão do Falso Santo por 2 turnos: gaste as cargas em cuidado ou preserve-as para o milagre.
- **Confissão do Falso Santo** [variação] (1 Cinza + 1 Aleatório; recarga 0T): Restaura 25 de Vida. Remove aflições e condições prejudiciais. Consome as cargas: +3 de cura por carga. Após usar, restaura Bênção Falsa.
- **Milagre Fabricado** (1 Cinza + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Consome as cargas: +5 de dano por carga. Se o alvo tem a marca desta preparação: +10 dano.
- **Imagem Sagrada** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Falsário — Ladrão de Memórias

Hipoteque uma memória e apague as opções de apoio da vítima antes de liquidar o passado.

**Estrutura:** Confisco de lembranças

**Passiva — Arquivo Roubado:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Lembrança Hipotecada** (1 Cinza; recarga 1T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Rouba 1 recurso da reserva inimiga.
- **Esquecer a Defesa** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Sela técnicas de apoio por 1 turno do alvo. A defesa pessoal continua disponível. Remove bônus de dano, redução e contra-ataque do alvo. Remove 15 de Defesa antes do dano.
- **Liquidação do Passado** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo tem a marca desta preparação: +15 dano.
- **Memória Substituta** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Chama

### O Incendiário — Incendiário

O pavio pune quem não usa uma técnica; a vítima precisa agir enquanto você prepara a detonação.

**Estrutura:** Pavio que exige resposta

**Passiva — Pavio Aceso:** Suas habilidades causam +4 de dano se o alvo está com Queimadura.

- **Pavio de Ódio** (1 Cinza; recarga 1T): Causa 10 de dano espiritual a um inimigo. Queimadura: 5 de dano de aflição por 2 turnos. Se o alvo não usar nenhuma técnica em sua próxima vez: causa 8 de dano de aflição ao próprio alvo. Ativa uma vez.
- **Fagulhas em Cadeia** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a todos os inimigos. Queimadura: 4 de dano de aflição por 2 turnos.
- **Detonação Negra** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo está com Queimadura: +15 dano; consome a preparação.
- **Corpo de Fumaça** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Brasa Eterna — Controladora de Chamas

Mantenha a Queimadura, sufoque a vítima e escolha entre a labareda concentrada e a Fornalha.

**Estrutura:** Combustão em etapas

**Passiva — Calor Persistente:** Suas habilidades causam +5 de dano se o alvo está com Queimadura.

- **Brasa que Permanece** (1 Cinza; recarga 0T): Causa 15 de dano espiritual a um inimigo. Queimadura: 5 de dano de aflição por 3 turnos.
- **Labareda Sufocante** [variação] (1 Cinza + 1 Essência; recarga 0T): Causa 20 de dano espiritual a um inimigo. Queimadura: 6 de dano de aflição por 2 turnos. Após usar, restaura Brasa que Permanece.
- **Sufoco das Cinzas** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Se o alvo está com Queimadura: +5 dano e Atordoa por 1 turno. Se o alvo já tinha Queimadura, Brasa que Permanece vira Labareda Sufocante contra ele por 2 turnos.
- **Fornalha Interior** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3). Por carga: +5 de dano por carga.
- **Manto de Cinzas** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Furor — Berserker

Alimente o ódio para transformar seus ataques por 2 turnos; o desfecho encerra a fúria e cobra Vida.

**Estrutura:** Transformação de risco

**Passiva — Raiva sem Freio:** Com 50 de Vida ou menos, suas habilidades causam +7 de dano.

- **Punho de Rancor** (1 Cinza; recarga 0T): Causa 25 de dano físico a um inimigo. O usuário perde 5 de Vida (não o derrota).
- **Punho do Ódio Solto** [variação] (1 Ruptura; recarga 0T): Causa 30 de dano físico a um inimigo. O usuário perde 10 de Vida (não o derrota).
- **Alimentar o Ódio** (1 Cinza; recarga 0T): Concede 10 de Defesa destrutível. Aumenta em 10 o dano até o fim do próximo turno do beneficiado. O usuário perde 5 de Vida (não o derrota). Libera duas técnicas mais arriscadas por 2 turnos. Ressentimento sem Freio encerra a transformação.
- **Explosão do Ressentimento** (1 Cinza + 1 Essência; recarga 1T): Causa 30 de dano espiritual a um inimigo. Se o usuário tem 50 de Vida ou menos: +15 dano. O usuário perde 5 de Vida (não o derrota).
- **Ressentimento sem Freio** [variação] (1 Ruptura + 1 Essência; recarga 2T): Causa 35 de dano espiritual a um inimigo. Se o usuário tem 50 de Vida ou menos: +15 dano. O usuário perde 10 de Vida (não o derrota). Após usar, restaura Punho de Rancor. Após usar, restaura Explosão do Ressentimento.
- **Fúria Intocável** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Ressentido — Portador do Rancor

Acumule rancor até reacender a primeira técnica; escolha entre consumir as reservas para recuperar Vida ou devolver a chama.

**Estrutura:** Limiar de cargas

**Passiva — Rancor Latente:** No início do seu turno, restaura 4 de Vida.

- **Brasa do Ressentimento** (1 Cinza; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3). Com 3 cargas, vira Rancor Reaceso até as cargas serem gastas.
- **Rancor Reaceso** [variação] (1 Cinza + 1 Essência; recarga 0T): Causa 25 de dano espiritual a um inimigo. Remove aflições e condições prejudiciais do usuário. Consome as cargas: +3 de dano por carga.
- **Nutrir o Rancor** (1 Cinza; recarga 0T): Restaura 15 de Vida. Consome as cargas: +7 de cura por carga.
- **Revide Incandescente** (1 Cinza + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Queimadura: 5 de dano de aflição por 2 turnos. Remove aflições e condições prejudiciais do usuário.
- **Dissolução em Cinzas** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Vingadora — Vingança Incandescente

Aplique Queimadura e erga a guarda vingativa; se uma nova agressão atravessar sua proteção, abra a revanche contra o inimigo.

**Estrutura:** Defesa em duas camadas

**Passiva — Rancor Encouraçado:** No início do seu turno, recebe 3 de Defesa destrutível.

- **Brasa Punitiva** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Queimadura: 6 de dano de aflição por 3 turnos.
- **Revanche Ardente** [variação] (1 Cinza + 1 Essência; recarga 0T): Causa 20 de dano espiritual a um inimigo. Queimadura: 4 de dano de aflição por 2 turnos. Após usar, restaura Brasa Punitiva.
- **Guarda Vingativa** (1 Cinza + 1 Essência; recarga 0T): Concede 10 de Defesa destrutível. Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno. Na próxima resposta adversária, se uma nova habilidade tirar Vida do beneficiado: abre uma técnica alternativa para o usuário por 2 turnos. Ativa uma vez.
- **Cerco Incandescente** (2 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a todos os inimigos. Remove 15 de Defesa antes do dano. Se o alvo está com Queimadura: +10 dano.
- **Passo entre Brasas** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Colérico — Ruptor

A ebulição cresce com a Vida perdida, prepara o próximo golpe e disputa espaço com a descarga de cargas.

**Estrutura:** Pressão do coração

**Passiva — Pulso Irado:** Ao perder Vida por uma habilidade inimiga, causa 3 de dano de aflição ao agressor.

- **Batida Escaldante** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Ganha 1 carga (máx. 3).
- **Sangue em Ebulição** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Aumenta em 5 o dano do usuário até o fim do próximo turno do beneficiado. A cada 20 de Vida perdida pelo usuário: +2 de dano (máx. +10). O usuário perde 5 de Vida (não o derrota).
- **Coração em Erupção** (1 Cinza + 1 Essência; recarga 2T): Causa 20 de dano físico a um inimigo. Consome as cargas: +10 de dano por carga. O usuário perde 8 de Vida (não o derrota).
- **Pulso Intangível** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Fome

### O Devorador — Fera da Avidez

A fome muda com sua Vida: ferido, você atravessa a Defesa e drena recursos; recuperado, volta a morder.

**Estrutura:** Forma por Vida

**Passiva — Fome Crescente:** Após causar dano com uma habilidade, restaura 4 de Vida.

- **Mordida da Alma** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Restaura ao usuário 50% do dano causado. Com 50 de Vida ou menos, vira Fome sem Corpo. Recuperar Vida acima de 50 restaura Mordida da Alma.
- **Fome sem Corpo** [variação] (1 Cinza + 1 Essência; recarga 1T): Causa 15 de dano de aflição a um inimigo. Remove 1 recurso da reserva inimiga. Restaura ao usuário 60% do dano causado.
- **Saliva Corrosiva** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Remove 20 de Defesa antes do dano.
- **Engolir a Essência** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 50% do dano causado. Se o alvo tem 50 de Vida ou menos: +15 dano.
- **Couraça Voraz** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Saqueadora — Acumuladora de Espólios

Roube recursos e acumule espólios; gaste as reservas para recuperar Vida ou reforçar o confisco.

**Estrutura:** Reserva conversível

**Passiva — Posse Insaciável:** Sua primeira habilidade ofensiva do combate causa +4 de dano.

- **Dedos da Cobiça** (1 Cinza; recarga 1T): Causa 10 de dano físico a um inimigo. Rouba 1 recurso da reserva inimiga.
- **Entesourar** (1 Aleatório; recarga 0T): Concede 20 de Defesa destrutível. Ganha 1 carga (máx. 3). Vira Abrir o Cofre por 2 turnos; gastar as reservas restaura esta técnica.
- **Abrir o Cofre** [variação] (1 Cinza + 1 Aleatório; recarga 0T): Restaura 20 de Vida. Consome as cargas: +5 de cura por carga. Após usar, restaura Entesourar.
- **Confisco da Alma** (1 Cinza + 1 Essência; recarga 1T): Causa 20 de dano físico a um inimigo. Remove 30 de Defesa antes do dano. Consome as cargas: +7 de dano por carga.
- **Espólio Intocável** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Insaciável — Predador de Reservas

Consuma a Defesa inimiga para formar sua própria guarda; reúna reservas e gaste-as na fome de aflição.

**Estrutura:** Digestão de Defesa

**Passiva — Assimilação:** No início do seu turno, restaura 3 de Vida.

- **Consumir a Guarda** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Converte 50% da Defesa removida em Defesa própria (máx. 15). Remove 20 de Defesa antes do dano. Ganha 1 carga (máx. 3).
- **Reserva Consumida** (1 Cinza; recarga 0T): Restaura 20 de Vida. Reduz em 5 o dano recebido por 1 turno.
- **Fome Devorante** (1 Cinza + 1 Essência; recarga 2T): Causa 20 de dano de aflição a um inimigo. Consome as cargas: +8 de dano por carga.
- **Corpo Recolhido** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Matriarca — Soberana da Privação

Drene recursos com a marca da privação, sustente seus aliados dependentes e cobre o tributo do alvo marcado.

**Estrutura:** Ração repartida

**Passiva — Lucro da Privação:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Marca da Privação** (1 Cinza; recarga 1T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Remove 1 recurso da reserva inimiga.
- **Ração dos Submissos** (1 Cinza + 1 Essência; recarga 0T): Restaura 8 de Vida a cada aliado. Regeneração: restaura 3 de Vida no início dos próximos 2 turnos de cada aliado.
- **Tributo da Fome** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 50% do dano causado. Se o alvo tem a marca desta preparação: +10 dano.
- **Celeiro Lacrado** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Credor — Cobrador

Assine uma dívida que cobra a próxima técnica usada pela vítima; escolha entre juros e execução do contrato.

**Estrutura:** Dívida por ação

**Passiva — Juros da Alma:** Suas habilidades causam +5 de dano se o alvo tem uma marca sua.

- **Assinar a Dívida** (1 Cinza; recarga 1T): Causa 10 de dano físico a um inimigo. Marca o alvo por 4 turnos. Se o alvo usar uma técnica em sua próxima vez: causa 10 de dano de aflição ao próprio alvo. Ativa uma vez.
- **Juros Acumulados** (1 Cinza + 1 Essência; recarga 1T): Causa 20 de dano físico a um inimigo. Rouba 1 recurso da reserva inimiga. Se o alvo tem a marca desta preparação: +10 dano.
- **Execução do Contrato** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo tem a marca desta preparação: +15 dano; consome a preparação.
- **Cláusula de Ausência** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Usurária — Credora Predatória

Drene a reserva inimiga e sustente um aliado ferido; o confisco pune inimigos já enfraquecidos pela perda de Vida.

**Estrutura:** Contrapeso da carência

**Passiva — Lucro da Carência:** Com 50 de Vida ou menos, suas habilidades causam +5 de dano.

- **Cobrança da Penúria** (1 Cinza; recarga 1T): Causa 15 de dano físico a um inimigo. Remove 1 recurso da reserva inimiga.
- **Adiantamento Vital** (1 Cinza + 1 Essência; recarga 0T): Restaura 15 de Vida. A cada 20 de Vida faltante do beneficiado: +3 de cura (máx. +12). Remove aflições e condições prejudiciais.
- **Confisco Coletivo** (1 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a todos os inimigos. Se o alvo tem 50 de Vida ou menos: +10 dano.
- **Penhor Inalcançável** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Podridão

### O Apodrecido — Aflição

A decadência reduz a cura recebida; escolha entre degradar a guarda e concluir a decomposição.

**Estrutura:** Ruína da recuperação

**Passiva — Carne em Ruína:** Suas habilidades causam +4 de dano se o alvo está com Decadência.

- **Contato da Ruína** (1 Cinza; recarga 0T): Causa 5 de dano físico a um inimigo. Decadência: 4 de dano de aflição por 3 turnos. Reduz a cura recebida em 50% até o fim do próximo turno deste lado.
- **Tecido Cedido** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Remove 15 de Defesa antes do dano.
- **Decomposição Completa** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Se o alvo está com Decadência: +15 dano.
- **Casca Morta** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Pestilência — Vetor Espiritual

Espalhe Veneno e concentre o contágio na forma de retorno; a crise pestilenta interrompe uma vítima já contaminada.

**Estrutura:** Propagação e foco

**Passiva — Hospedeira da Praga:** Após causar dano com uma habilidade, restaura 3 de Vida.

- **Febre Andante** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Veneno: 6 de dano de aflição por 2 turnos.
- **Contágio do Caminho** (1 Cinza + 1 Essência; recarga 2T): Causa 5 de dano físico a todos os inimigos. Veneno: 4 de dano de aflição por 3 turnos. Vira Febre de Retorno por 2 turnos: concentre o contágio em uma vítima.
- **Febre de Retorno** [variação] (1 Cinza + 1 Essência; recarga 1T): Causa 15 de dano de aflição a um inimigo. Se o alvo está com Veneno: +10 dano. Após usar, restaura Contágio do Caminho.
- **Crise Pestilenta** (1 Cinza + 1 Essência; recarga 3T): Causa 20 de dano físico a um inimigo. Se o alvo está com Veneno: +15 dano e Atordoa por 1 turno.
- **Névoa Contaminada** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Corrupto — Sabotador

Quebre a confiança para converter parte do dano real em Defesa própria; cobre a corrupção marcada em aflição.

**Estrutura:** Vantagem parasitária

**Passiva — Lucro da Ruína:** Suas habilidades causam +4 de dano se o alvo tem Defesa.

- **Acordo Podre** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Remove 20 de Defesa antes do dano.
- **Quebrar a Confiança** (1 Cinza + 1 Essência; recarga 0T): Causa 10 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Converte 50% do dano real causado em Defesa própria (máx. 20 por uso). Remove bônus de dano, redução e contra-ataque do alvo.
- **Preço da Corrupção** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Rouba 1 recurso da reserva inimiga. Se o alvo tem a marca desta preparação: +10 dano.
- **Privilégio Oculto** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Rainha dos Fungos — Rainha de Esporos

Semeie uma colônia e escolha sua colheita: proteger os vivos ou espalhar esporos ofensivos.

**Estrutura:** Desfechos exclusivos

**Passiva — Colônia Viva:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Semear Esporos** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Decadência: 5 de dano de aflição por 2 turnos. Ganha 1 carga (máx. 3). Abre Florescer para os Vivos e Esporos da Última Colheita por 2 turnos. Usar uma das duas encerra ambas.
- **Micélio de Amparo** (1 Cinza + 1 Essência; recarga 0T): Concede 12 de Defesa destrutível ao trio. Consome as cargas: +4 de cura por carga a cada aliado.
- **Florescer para os Vivos** [variação] (1 Cinza + 1 Essência; recarga 0T): Restaura 8 de Vida a cada aliado. Concede 8 de Defesa destrutível ao trio. Consome as cargas: +4 de cura por carga a cada aliado. Após usar, restaura Micélio de Amparo. Após usar, restaura Florir da Colônia.
- **Florir da Colônia** (1 Cinza + 1 Essência; recarga 1T): Causa 20 de dano de aflição a um inimigo. Consome as cargas: +7 de dano por carga.
- **Esporos da Última Colheita** [variação] (2 Cinza + 1 Essência; recarga 2T): Causa 15 de dano de aflição a todos os inimigos. Consome as cargas: +3 de dano por carga. Após usar, restaura Micélio de Amparo. Após usar, restaura Florir da Colônia.
- **Coroa de Esporos** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Inoculador — Cultivador de Parasitas

Inocule Veneno para drenar o inimigo; conserve seus hospedeiros aliados com limpeza e regeneração.

**Estrutura:** Sutura viva

**Passiva — Simbiose Corrupta:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Incisão Parasitária** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Veneno: 5 de dano de aflição por 3 turnos. Restaura ao usuário 50% do dano causado.
- **Hospedeiro Renovado** (1 Cinza + 1 Essência; recarga 1T): Restaura 15 de Vida. Regeneração: restaura 6 de Vida no início dos próximos 2 turnos do beneficiado. Remove aflições e condições prejudiciais.
- **Drenagem da Colônia** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 70% do dano causado. Se o alvo está com Veneno: +10 dano.
- **Corpo entre Vermes** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Definhador — Semeador da Ruína

Aplique Decadência, envolva o trio na trama e devolva parte da agressão em aflição; o definhar coletivo enfraquece inimigos contaminados.

**Estrutura:** Jardim de retaliação

**Passiva — Seiva Corrosiva:** Ao perder Vida por uma habilidade inimiga, causa 3 de dano de aflição ao agressor.

- **Raiz Necrosada** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Decadência: 4 de dano de aflição por 3 turnos.
- **Trama Necrosada** (1 Cinza + 1 Essência; recarga 0T): Concede 12 de Defesa destrutível ao trio. Na próxima resposta adversária, se uma nova habilidade tirar Vida do beneficiado: causa 5 de dano de aflição ao agressor. Ativa uma vez.
- **Definhar** (2 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a todos os inimigos. Enfraquece por 1 turno do alvo: −10 de dano causado. Se o alvo está com Decadência: +10 dano.
- **Casca Inviolável** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Silêncio

### O Espectador — Observador da Omissão

Registre a vítima, recuse a interferência e transforme as cargas de observação em retaliação espiritual.

**Estrutura:** Testemunho reativo

**Passiva — Indiferença Vigilante:** No início do seu turno, recebe 3 de Defesa destrutível.

- **Memória da Omissão** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Ganha 1 carga (máx. 3).
- **Recusar Interferência** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno. Se o contra-ataque ativar, Peso da Indiferença vira Retaliação do Espectador contra o agressor por 2 turnos.
- **Peso da Indiferença** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Consome as cargas: +5 de dano por carga. Se o alvo tem a marca desta preparação: +10 dano.
- **Retaliação do Espectador** [variação] (1 Cinza + 1 Essência; recarga 2T): Causa 30 de dano espiritual a um inimigo. Consome as cargas: +5 de dano por carga. Após usar, restaura Peso da Indiferença.
- **Fora do Acontecimento** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Carcereira — Carcereira

Feche o apoio da vítima sem impedir sua ofensiva; marque a porta para interrompê-la no momento certo.

**Estrutura:** Tranca seletiva

**Passiva — Abrigo dos Cúmplices:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Batida sem Resposta** (1 Cinza; recarga 1T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Sela técnicas de apoio por 1 turno do alvo. A defesa pessoal continua disponível.
- **Guarida Seletiva** (1 Cinza; recarga 0T): Concede 25 de Defesa destrutível. Reduz em 5 o dano recebido por 1 turno.
- **Não Há Saída** (1 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Limiar Interdito** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Silenciador — Supressor de Vozes

Enfraqueça a voz inimiga, interrompa sua ação e escolha entre prolongar a aflição ou liberar o decreto.

**Estrutura:** Interrupção e continuação

**Passiva — Clamor Sufocado:** Com 50 de Vida ou menos, suas habilidades causam +5 de dano.

- **Impacto Abafado** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Enfraquece por 2 turnos do alvo: −10 de dano causado.
- **Clamor sem Retorno** [variação] (1 Cinza + 1 Essência; recarga 0T): Causa 20 de dano de aflição a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Após usar, restaura Impacto Abafado.
- **Interditar a Voz** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Atordoa por 1 turno. No próximo turno, Impacto Abafado vira Clamor sem Retorno contra o alvo interrompido.
- **Decreto do Silêncio** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo está Enfraquecido: +15 dano.
- **Silêncio Absoluto** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Cúmplice — Cúmplice do Silêncio

A memória responde a técnicas espirituais ou de aflição; revele a presença para preparar o testemunho perfurante.

**Estrutura:** Vigília espiritual

**Passiva — Cumplicidade Velada:** Suas habilidades causam +5 de dano se o alvo está Exposto.

- **Segredo Exposto** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Remove bônus de dano, redução e contra-ataque do alvo.
- **Resposta Preparada** (1 Cinza; recarga 0T): Anula a próxima habilidade inimiga espiritual ou de aflição recebida e contra-ataca com 20 de dano. Dura 1 turno.
- **Acusação Oportunista** (1 Cinza + 1 Essência; recarga 1T): Causa 30 de dano perfurante a um inimigo. Se o alvo está Exposto: +10 dano.
- **Depoimento Retido** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Anfitrião — Entidade do Isolamento

A presença vazia pune o próximo apoio da vítima com dano e perda de um recurso; a ausência coletiva drena o restante.

**Estrutura:** Isolamento oportunista

**Passiva — Hospitalidade Negada:** No início do seu turno, restaura 3 de Vida.

- **Convite ao Isolamento** (1 Cinza; recarga 0T): Causa 10 de dano espiritual a um inimigo. Marca o alvo por 3 turnos. Se o alvo usar uma técnica de apoio em sua próxima vez: causa 8 de dano de aflição ao próprio alvo e remove 1 recurso inimigo. Ativa uma vez.
- **Ninguém Vem** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a todos os inimigos. Remove 1 recurso da reserva inimiga uma única vez.
- **Estadia sem Retorno** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Se o alvo tem a marca desta preparação: +10 dano.
- **Porta do Desamparo** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Desertor — Predador da Omissão

Explore a guarda abandonada; anular uma agressão abre um golpe de retaguarda contra o responsável.

**Estrutura:** Emboscada após defesa

**Passiva — Oportunismo:** Sua primeira habilidade ofensiva do combate causa +6 de dano.

- **Passagem Desguarnecida** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Remove 20 de Defesa antes do dano.
- **Espera Cúmplice** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga física ou perfurante recebida e contra-ataca com 25 de dano. Dura 1 turno. Ao anular uma técnica física ou perfurante, Cobrar o Abandono vira Golpe da Retaguarda contra o agressor por 2 turnos.
- **Cobrar o Abandono** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Se o alvo está Exposto: +15 dano.
- **Golpe da Retaguarda** [variação] (1 Cinza + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Não pode ser anulado por Contra-ataque. Se o alvo está Exposto: +15 dano. Após usar, restaura Cobrar o Abandono.
- **Posto Vazio** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Carne

### O Usurpador — Possessor

A posse sela ataques por uma ação, mas permite apoio; decida entre interromper a vítima marcada ou drenar sua Vida.

**Estrutura:** Posse da ofensiva

**Passiva — Vontade Parasita:** Após causar dano com uma habilidade, restaura 4 de Vida.

- **Selo da Posse** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano espiritual a um inimigo. Marca o alvo por 3 turnos. Sela técnicas ofensivas por 1 turno do alvo.
- **Nervos Tomados** (1 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Espoliação Vital** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 60% do dano causado. Se o alvo tem a marca desta preparação: +10 dano.
- **Desligar o Corpo** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Metamorfa — Usurpadora de Formas

Alterne entre a forma original, a Pele Usurpada ofensiva e a Carapaça Usurpada defensiva. Cada corpo tem três técnicas e um retrato próprios; descartar o molde ou usar Corpo Substituto restaura a forma original.

**Estrutura:** Metamorfose de três corpos

**Passiva — Adaptação Predatória:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Gume Mutável** (1 Cinza; recarga 0T): Causa 20 de dano físico a um inimigo. Remove 10 de Defesa antes do dano.
- **Gume Transfigurado** [variação] (1 Ruptura; recarga 0T): Causa 15 de dano perfurante e remove 15 de Defesa antes do dano.
- **Impacto da Carapaça** [variação] (1 Essência; recarga 0T): Causa 20 de dano físico e concede 5 de Defesa ao usuário.
- **Pele Usurpada** (1 Cinza + 1 Essência; recarga 0T): Recebe 15 de Defesa, limpa aflições e condições prejudiciais e assume a Pele Usurpada. Troca as três primeiras técnicas e o retrato até usar Descartar o Molde ou Corpo Substituto.
- **Descartar o Molde** [variação] (1 Ruptura; recarga 0T): Recupera 15 de Vida e limpa aflições e condições prejudiciais. Após usar, restaura Gume Mutável. Após usar, restaura Pele Usurpada e Carapaça Usurpada. Não reinicia recargas.
- **Descamar a Armadura** [variação] (1 Essência; recarga 0T): Recupera 10 de Vida e restaura a forma original e suas três técnicas. Não reinicia recargas.
- **Carapaça Usurpada** (1 Cinza + 1 Essência; recarga 0T): Recebe 20 de Defesa e assume a Carapaça Usurpada. Troca as três primeiras técnicas e o retrato até descamar ou usar Corpo Substituto.
- **Instinto Usurpado** [variação] (1 Ruptura + 1 Aleatório; recarga 2T): Causa 25 de dano físico e prepara um contra-ataque pessoal de 10 de dano por 1 turno.
- **Espinhos Usurpados** [variação] (1 Essência + 1 Aleatório; recarga 2T): Concede 15 de Defesa e anula a próxima habilidade inimiga recebida, contra-atacando com 20 de dano. Dura 1 turno.
- **Corpo Substituto** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam. Retorna à forma original sem reiniciar recargas.

### O Profanador — Violador de Limites

Converta sua Vida perdida em pressão ofensiva; invada a guarda alheia e consuma as cargas no golpe perfurante.

**Estrutura:** Desejo de risco

**Passiva — Avidez Profana:** Com 50 de Vida ou menos, suas habilidades causam +6 de dano.

- **Ímpeto Profano** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. A cada 25 de Vida perdida pelo usuário: +4 de dano (máx. +12). Ganha 1 carga (máx. 3). O usuário perde 5 de Vida (não o derrota).
- **Contato Invasivo** (1 Cinza; recarga 1T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Remove 1 recurso da reserva inimiga.
- **Violação da Forma** (1 Cinza + 1 Essência; recarga 2T): Causa 25 de dano perfurante a um inimigo. Consome as cargas: +8 de dano por carga.
- **Forma Intangível** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Marionetista — Controladora

Conecte os nervos e escolha entre sustentar o controle por mais uma ação ou romper os fios no desfecho.

**Estrutura:** Controle com ligação

**Passiva — Tensão dos Fios:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Fio Nervoso** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos.
- **Puxar a Vontade** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +5 dano e Atordoa por 1 turno. Se ativar o combo, vira Manter o Comando no próximo turno, apenas contra a mesma vítima. Atordoamento ou Invulnerável quebra a ligação.
- **Manter o Comando** [variação] (1 Cinza + 1 Essência; recarga 3T): Causa 15 de dano físico a um inimigo. Atordoa por 1 turno. Exige a marca desta preparação no alvo. Após usar, restaura Puxar a Vontade.
- **Romper o Comando** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Se o alvo tem a marca desta preparação: +15 dano; consome a preparação.
- **Fios Fora de Fase** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Simulacro — Espelhamento Imposto

Exponha o inimigo e sustente um aliado com o vínculo parasita; a dor recebida provoca uma resposta de aflição.

**Estrutura:** Imagem que sente

**Passiva — Eco da Dor:** Ao perder Vida por uma habilidade inimiga, causa 4 de dano de aflição ao agressor.

- **Molde Vulnerável** (1 Cinza; recarga 0T): Causa 15 de dano espiritual a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Vínculo Parasita** (1 Cinza; recarga 0T): Restaura 10 de Vida. Concede 10 de Defesa destrutível. Na próxima resposta adversária, se uma nova habilidade tirar Vida do beneficiado: causa 8 de dano de aflição ao agressor. Ativa uma vez.
- **Romper o Molde** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Remove 20 de Defesa antes do dano. Se o alvo está Exposto: +10 dano.
- **Duplicata Intangível** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Suturadora — Cirurgiã

Use o fio para marcar e ferir; sustente seus aliados com suturas e desfaça os pontos da vítima no desfecho.

**Estrutura:** Ciclo de cuidado

**Passiva — Fio do Controle:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Ponto de Corte** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Sangramento: 4 de dano de aflição por 2 turnos.
- **Sutura de Domínio** (1 Cinza + 1 Aleatório; recarga 0T): Restaura 25 de Vida. Remove aflições e condições prejudiciais. No próximo turno, vira Reforçar os Pontos: amparo sem nova limpeza.
- **Reforçar os Pontos** [variação] (1 Aleatório; recarga 0T): Restaura 10 de Vida. Concede 15 de Defesa destrutível. Após usar, restaura Sutura de Domínio.
- **Desfazer os Pontos** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +15 dano; consome a preparação.
- **Costura de Ausência** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Vazio

### O Anulador — Anulador de Vantagens

Marque e remova vantagens; a preparação abre uma anulação exclusiva contra a mesma vítima, enquanto a segunda técnica dissolve Defesa.

**Estrutura:** Apagamento dirigido

**Passiva — Vantagem Negada:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Marca da Anulação** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Remove bônus de dano, redução e contra-ataque do alvo. Vira Anulação Definitiva por 2 turnos, apenas contra o alvo da marca.
- **Anulação Definitiva** [variação] (1 Cinza + 1 Essência; recarga 0T): Causa 25 de dano de aflição a um inimigo. Exige a marca desta preparação no alvo. Se o alvo tem a marca desta preparação: +5 dano; consome a preparação. Após usar, restaura Marca da Anulação.
- **Dissolver a Guarda** (1 Cinza; recarga 0T): Causa 20 de dano físico a um inimigo. Remove 30 de Defesa antes do dano.
- **Extinguir o Traço** (1 Cinza + 1 Essência; recarga 1T): Causa 30 de dano de aflição a um inimigo. Se o alvo tem a marca desta preparação: +10 dano.
- **Fora da Existência** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Ausência — Evasão

Drene um recurso e deixe a ausência cobrar outro se a vítima não usar uma técnica em sua vez.

**Estrutura:** Ausência que cobra espera

**Passiva — Falta de Substância:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Toque Ausente** (1 Cinza; recarga 1T): Causa 10 de dano físico a um inimigo. Se o alvo não usar nenhuma técnica em sua próxima vez: causa 5 de dano de aflição ao próprio alvo e remove 1 recurso inimigo. Ativa uma vez. Remove 1 recurso da reserva inimiga.
- **Ataque a Ninguém** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno.
- **Ausência Contagiosa** (1 Cinza + 1 Essência; recarga 2T): Causa 15 de dano espiritual a todos os inimigos. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Não Estar** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Arauto — Finalizador

Guarde suas duas sentenças mais fortes para os feridos; depois delas, o silêncio muda de forma.

**Estrutura:** Sentenças limitadas

**Passiva — Último Instante:** Suas habilidades causam +6 de dano se o alvo tem 50 de Vida ou menos.

- **Presságio de Extinção** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Cessar da Vontade** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Atordoa por 1 turno. Remove bônus de dano, redução e contra-ataque do alvo.
- **Sem Últimas Palavras** (1 Cinza + 1 Essência; recarga 1T): Causa 30 de dano perfurante a um inimigo. Se o alvo tem 50 de Vida ou menos: +15 dano. Pode ser usada 2 vezes por combate; depois vira Silêncio Residual.
- **Silêncio Residual** [variação] (1 Cinza; recarga 0T): Causa 20 de dano perfurante a um inimigo. Se o alvo tem 50 de Vida ou menos: +5 dano.
- **Instante sem Tempo** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Desolador — Flagelo da Desolação

Acumule vestígios de ruína e consuma-os para extinguir a presença inimiga; com pouca Vida, a recomposição assume outra forma.

**Estrutura:** Refúgio por necessidade

**Passiva — Ruína Crescente:** Com 50 de Vida ou menos, suas habilidades causam +6 de dano.

- **Toque da Desolação** (1 Cinza; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Recompor o Vazio** (1 Cinza; recarga 0T): Restaura 15 de Vida. Reduz em 10 o dano recebido por 1 turno. Com 50 de Vida ou menos, vira Recolher a Presença, com custo e recuperação maiores.
- **Recolher a Presença** [variação] (1 Cinza + 1 Essência; recarga 0T): Restaura 20 de Vida. Reduz em 5 o dano recebido por 1 turno. Regeneração: restaura 3 de Vida no início dos próximos 2 turnos do beneficiado.
- **Extinguir a Presença** (1 Cinza + 1 Essência; recarga 2T): Causa 20 de dano de aflição a um inimigo. Consome as cargas: +9 de dano por carga. O usuário perde 5 de Vida (não o derrota).
- **Presença Nula** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Escriba — Escriba da Extinção

Inscreva e exponha uma vítima, interrompa sua ofensiva e consuma a marca ao encerrar seu vestígio.

**Estrutura:** Rasura de ações

**Passiva — Traço Terminal:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Inscrever o Fim** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Rasura Terminal** (1 Cinza + 1 Essência; recarga 2T): Causa 5 de dano físico a um inimigo. Sela técnicas ofensivas por 1 turno do alvo. Remove bônus de dano, redução e contra-ataque do alvo.
- **Encerrar o Vestígio** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo tem a marca desta preparação: +15 dano; consome a preparação.
- **Folha Nula** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Obliterador — Anulador de Territórios

Apague o terreno para punir a inatividade; marque uma coordenada, enfraqueça a vítima e consuma seu vestígio para recuperar Vida.

**Estrutura:** Território que exige movimento

**Passiva — Sustento do Apagamento:** No início do seu turno, restaura 3 de Vida.

- **Apagar o Terreno** (1 Cinza + 1 Essência; recarga 1T): Causa 5 de dano físico a todos os inimigos. Decadência: 4 de dano de aflição por 2 turnos. Se o alvo não usar nenhuma técnica em sua próxima vez: causa 5 de dano de aflição ao próprio alvo. Ativa uma vez.
- **Coordenada Nula** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Eliminar o Vestígio** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Restaura ao usuário 50% do dano causado. Se o alvo tem a marca desta preparação: +10 dano.
- **Contorno Inexistente** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Proteção

### O Escudo Vivo — Protetor

Erga a própria guarda e escolha entre o avanço curto e a Resposta da Égide mais forte.

**Estrutura:** Guarda em avanço

**Passiva — Ficarei Aqui:** No início do seu turno, recebe 5 de Defesa destrutível.

- **Golpe do Bastião** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Concede 10 de Defesa destrutível ao usuário. Vira Avanço da Égide por 2 turnos; usá-lo restaura Golpe do Bastião.
- **Avanço da Égide** [variação] (1 Graça + 1 Essência; recarga 0T): Causa 20 de dano perfurante a um inimigo. Concede 5 de Defesa destrutível ao usuário. Se o usuário tem Defesa: +5 dano. Após usar, restaura Golpe do Bastião.
- **Voto de Amparo** (1 Graça; recarga 0T): Concede 25 de Defesa destrutível. Reduz em 5 o dano recebido por 1 turno.
- **Resposta da Égide** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o usuário tem Defesa: +15 dano.
- **Fortaleza de Luz** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Muralha — Sentinela de Pedra

Fortifique o trio e acumule cargas; a investida consome sua Defesa para expor um inimigo, enquanto o dano aos aliados pode recompor sua guarda.

**Estrutura:** Muralha que converge

**Passiva — Pedra sobre Pedra:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Impacto do Baluarte** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Ganha 1 carga (máx. 3).
- **Muralha Partilhada** (1 Graça + 1 Essência; recarga 2T): Concede 18 de Defesa destrutível ao trio. Na próxima resposta adversária, se uma nova habilidade tirar Vida do beneficiado: concede 8 de Defesa ao usuário. Ativa uma vez.
- **Investida do Baluarte** (1 Graça + 1 Essência; recarga 1T): Causa 20 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Acrescenta 25% da Defesa do usuário ao dano (máx. +15) e consome toda a sua Defesa. Consome as cargas: +6 de dano por carga.
- **Baluarte Inviolável** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Abnegado — Protetor Sacrificial

Ceda parte da sua Vida para amparar um aliado e sustente-se na resposta ofensiva, mais forte quando ferido.

**Estrutura:** Permanência vital

**Passiva — Presença que Sustenta:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Não Recuar** (1 Graça; recarga 0T): Causa 20 de dano físico a um inimigo. Reduz em 5 o dano recebido por 1 turno pelo usuário.
- **Amparo Abnegado** (1 Graça + 1 Essência; recarga 0T): Restaura 10 de Vida. Concede 15 de Defesa destrutível. Regeneração: restaura 5 de Vida no início dos próximos 2 turnos do beneficiado. O usuário perde 5 de Vida (não o derrota).
- **Permanecer de Pé** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 30% do dano causado. Se o usuário tem 50 de Vida ou menos: +15 dano.
- **Promessa Inquebrável** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Guardião — Sentinela Ancestral

Proteja contra técnicas físicas e perfurantes; a vigília marca quem poderá ser interrompido no alvorecer.

**Estrutura:** Guarda contra lâminas

**Passiva — Última Vigília:** Ao perder Vida por uma habilidade inimiga, causa 4 de dano de aflição ao agressor.

- **Investida Vigilante** (1 Graça; recarga 0T): Causa 20 de dano físico a um inimigo. Marca o alvo por 3 turnos.
- **Sentinela de Resposta** (1 Graça + 1 Essência; recarga 0T): Concede 10 de Defesa destrutível. Anula a próxima habilidade inimiga física ou perfurante recebida e contra-ataca com 30 de dano. Dura 1 turno.
- **Revide Radiante** (1 Graça + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Guarda Inviolável** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Sentinela — Guarda Tática

Concentre a linha em um aliado para protegê-lo e reduzir a recarga de suas técnicas não defensivas.

**Estrutura:** Proteção de tempo

**Passiva — Olhar de Vigília:** Suas habilidades causam +4 de dano se o alvo está Exposto.

- **Sinal Azul** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Linha de Proteção** (1 Graça + 1 Essência; recarga 3T): Concede 15 de Defesa destrutível. Reduz em 5 o dano recebido por 1 turno. Reduz em 1 turno as recargas não defensivas do beneficiado.
- **Lança do Horizonte** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo está Exposto: +15 dano.
- **Vigília Intangível** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Cura

### A Compassiva — Curadora

Limpar condições prejudiciais também produz Defesa; use a compaixão marcada para recuperar sua própria Vida.

**Estrutura:** Cuidado que recompõe

**Passiva — A Dor é Vista:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Toque da Compaixão** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos.
- **Mãos Restauradoras** (1 Graça + 1 Aleatório; recarga 0T): Restaura 25 de Vida. Cada condição removida concede 4 de Defesa ao beneficiado (máx. 15). Remove aflições e condições prejudiciais.
- **Reequilibrar a Dor** (1 Graça + 1 Essência; recarga 1T): Causa 20 de dano espiritual a um inimigo. Restaura ao usuário 80% do dano causado. Se o alvo tem a marca desta preparação: +10 dano.
- **Luz sem Ferida** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Restaurador — Restaurador

Prepare Vida até a reserva se tornar uma restauração coletiva mais cara, capaz de limpar o trio.

**Estrutura:** Aprimoramento por reserva

**Passiva — Recomposição Contínua:** No início do seu turno, restaura 4 de Vida.

- **Pulso de Retorno** (1 Aleatório; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Restituir a Forma** (1 Graça + 1 Essência; recarga 0T): Restaura 20 de Vida. Concede 10 de Defesa destrutível. Remove aflições e condições prejudiciais.
- **Reserva Restauradora** (1 Graça + 1 Essência; recarga 0T): Restaura 10 de Vida a cada aliado. Consome as cargas: +5 de cura por carga a cada aliado. Com pelo menos 2 cargas, vira Reserva Imaculada: mais cura e limpeza coletiva, com custo maior.
- **Reserva Imaculada** [variação] (2 Graça + 1 Essência; recarga 0T): Restaura 15 de Vida a cada aliado. Remove aflições e condições prejudiciais. Consome as cargas: +5 de cura por carga a cada aliado.
- **Forma Preservada** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Sanadora — Restauradora de Essência

Exponha o agressor, restitua o vigor de um aliado ferido e use o fluxo vital para atacar e recuperar sua própria Vida.

**Estrutura:** Luz dos feridos

**Passiva — Amparo Recíproco:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Clarão Incisivo** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Restituir Vigor** (1 Graça + 1 Essência; recarga 0T): Restaura 20 de Vida. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. A cada 25 de Vida faltante do beneficiado: +3 de cura (máx. +9).
- **Fluxo Vital** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Restaura ao usuário 50% do dano causado. Se o alvo está Exposto: +10 dano.
- **Forma Luminosa** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Boticária — Herborista Espiritual

Prepare as raízes para acumular reservas; use a infusão para recuperar o trio ou os espinhos para enfraquecer um agressor.

**Estrutura:** Cultivo que amadurece

**Passiva — Remédio Perene:** No início do seu turno, restaura 3 de Vida.

- **Raiz Contundente** (1 Graça; recarga 0T): Causa 13 de dano espiritual a um inimigo. Cada uso não anulado dá +2 de dano a esta técnica (máx. +8). Atordoamento zera esse bônus. Ganha 1 carga (máx. 3).
- **Infusão Restauradora** (1 Graça + 1 Essência; recarga 0T): Restaura 10 de Vida a cada aliado. Consome as cargas: +6 de cura por carga a cada aliado.
- **Espinhos Sedativos** (1 Graça + 1 Essência; recarga 1T): Causa 20 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Consome as cargas: +7 de dano por carga.
- **Pétalas de Refúgio** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Sereno — Acalmador

Desarme a agressão: se a vítima ainda atacar, o usuário recupera Vida; a quietude continua sendo o controle mais forte.

**Estrutura:** Serenidade provocada

**Passiva — Ritmo Sereno:** No início do seu turno, recebe 3 de Defesa destrutível.

- **Pulsação Desarmante** (1 Graça; recarga 1T): Causa 10 de dano espiritual a um inimigo. Enfraquece por 2 turnos do alvo: −10 de dano causado. Se o alvo usar uma técnica ofensiva em sua próxima vez: restaura 8 de Vida ao usuário. Ativa uma vez.
- **Respirar Novamente** (1 Graça + 1 Essência; recarga 0T): Restaura 20 de Vida. Reduz em 10 o dano recebido por 1 turno.
- **Quietude Profunda** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano físico a um inimigo. Se o alvo está Enfraquecido: +10 dano e Atordoa por 1 turno.
- **Pausa do Coração** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Justiça

### O Árbitro — Árbitro da Reparação

Exponha o excesso, ofereça amparo e abra a resposta equânime; o veredito perfurante pune a abertura revelada.

**Estrutura:** Amparo e cobrança

**Passiva — Medida Justa:** Suas habilidades causam +4 de dano se o alvo está Exposto.

- **Peso do Excesso** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Amparo Equânime** (1 Graça + 1 Essência; recarga 0T): Restaura 20 de Vida. Concede 15 de Defesa destrutível. No próximo turno, vira Resposta Equânime: dano que restaura Vida ao usuário.
- **Resposta Equânime** [variação] (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Restaura 10 de Vida ao usuário. Após usar, restaura Amparo Equânime.
- **Veredito Proporcional** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo está Exposto: +15 dano.
- **Posição Inviolável** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Íntegra — Duelista Justa

O corte ganha precisão ao ser repetido, até um limite; Atordoamento quebra a disciplina, sem apagar sua marca de ofensa.

**Estrutura:** Disciplina da lâmina

**Passiva — Fio do Princípio:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Corte de Princípio** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Cada uso não anulado dá +2 de dano a esta técnica (máx. +8). Atordoamento zera esse bônus.
- **Parada Equânime** (1 Graça + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 25 de dano. Dura 1 turno.
- **Sentença da Lâmina** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo tem a marca desta preparação: +15 dano.
- **Passo Equânime** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Ponderador — Ponderador

Pese, julgue e recupere o equilíbrio: a decisão abre uma preparação diferente para o próximo ciclo.

**Estrutura:** Ciclo de julgamento

**Passiva — Paciência da Balança:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Pesar os Atos** (1 Graça; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Ganha 1 carga (máx. 3).
- **Prato Ascendente** [variação] (1 Graça + 1 Essência; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos. Concede 10 de Defesa destrutível ao usuário. Ganha 1 carga (máx. 3). Após usar, restaura Pesar os Atos.
- **Reduzir o Excesso** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Decisão Ponderada** (1 Graça + 1 Essência; recarga 3T): Causa 20 de dano físico a um inimigo. Consome as cargas: +6 de dano por carga. Se o alvo tem a marca desta preparação: +5 dano e Atordoa por 1 turno; consome a preparação. Pesar os Atos vira Prato Ascendente por 2 turnos, preparando uma nova decisão com Defesa.
- **Entre os Pratos** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Testemunha — Reveladora

A prova pune bônus de dano, redução e contra-ataque ativos antes de removê-los; o registro prepara o testemunho coletivo.

**Estrutura:** Prova contra vantagens

**Passiva — Voz sem Distorção:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Registrar a Verdade** (1 Graça; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Prova Irrefutável** (1 Graça + 1 Essência; recarga 1T): Causa 15 de dano espiritual a um inimigo. Não pode ser anulado por Contra-ataque. Antes da remoção, cada bônus de dano, redução ou contra-ataque ativo no alvo acrescenta 4 ao dano (máx. +12). Remove bônus de dano, redução e contra-ataque do alvo.
- **Testemunho Íntegro** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano espiritual a todos os inimigos. Se o alvo tem a marca desta preparação: +10 dano.
- **Testemunho Protegido** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Juiz — Julgador de Amparo

Repare Vida e condições enquanto reduz recargas não defensivas; conserve o Enfraquecimento para o limite da clemência.

**Estrutura:** Reparação de tempo

**Passiva — Clemência Inabalável:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Advertência do Juiz** (1 Graça; recarga 0T): Causa 10 de dano físico a um inimigo. Enfraquece por 2 turnos do alvo: −10 de dano causado.
- **Reparação Justa** (1 Graça + 1 Essência; recarga 3T): Restaura 20 de Vida. Reduz em 1 turno as recargas não defensivas do beneficiado. Remove aflições e condições prejudiciais.
- **Limite da Clemência** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano físico a um inimigo. Se o alvo está Enfraquecido: +10 dano e Atordoa por 1 turno.
- **Trégua Inviolável** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Esperança

### A Perseverante — Perseverança

Recupere o fôlego para reacender um ataque diferente ou guarde as cargas para a aurora.

**Estrutura:** Recomeço ofensivo

**Passiva — Ainda Há Amanhã:** Com 50 de Vida ou menos, suas habilidades causam +6 de dano.

- **Fagulha do Amanhã** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Queimadura: 4 de dano de aflição por 2 turnos. Ganha 1 carga (máx. 3).
- **Chama do Recomeço** [variação] (1 Graça + 1 Essência; recarga 0T): Causa 20 de dano espiritual a um inimigo. Queimadura: 5 de dano de aflição por 2 turnos. Restaura 5 de Vida ao usuário. Após usar, restaura Fagulha do Amanhã.
- **Não se Apagar** (1 Graça; recarga 0T): Restaura 20 de Vida. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Fagulha do Amanhã vira Chama do Recomeço por 2 turnos.
- **Aurora Imorredoura** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Consome as cargas: +7 de dano por carga.
- **Chama Intocável** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Inquebrantável — Resiliência

Erga um aliado e recupere seu próprio fôlego se ele perder Vida por uma nova habilidade durante a resposta adversária.

**Estrutura:** Alento recíproco

**Passiva — Levantar Outra Vez:** No início do seu turno, restaura 4 de Vida.

- **Passo de Retorno** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Concede 10 de Defesa destrutível ao usuário.
- **Erguer o Companheiro** (1 Graça + 1 Aleatório; recarga 0T): Restaura 25 de Vida. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Na próxima resposta adversária, se uma nova habilidade tirar Vida do beneficiado: restaura 5 de Vida ao usuário. Ativa uma vez.
- **Enquanto Eu Respirar** (1 Graça + 1 Essência; recarga 1T): Causa 30 de dano físico a um inimigo. Se o usuário tem 50 de Vida ou menos: +10 dano.
- **Instante de Superação** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Voz — Inspiradora

Inicie um hino para marcar vários inimigos com o coro ou encerre-o para recuperar sua própria voz.

**Estrutura:** Postura de coro

**Passiva — Coro de Coragem:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Palavra de Coragem** (1 Aleatório; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos.
- **Coro de Muitas Vozes** [variação] (1 Graça + 1 Aleatório; recarga 0T): Causa 10 de dano espiritual a todos os inimigos. Marca o alvo por 3 turnos.
- **Hino da Perseverança** (1 Graça + 1 Essência; recarga 0T): Concede 10 de Defesa destrutível ao trio. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Abre Coro de Muitas Vozes até usar Encerrar o Hino.
- **Encerrar o Hino** [variação] (1 Graça; recarga 0T): Restaura 15 de Vida. Após usar, restaura Palavra de Coragem. Após usar, restaura Hino da Perseverança.
- **Não Seremos Calados** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano espiritual a todos os inimigos. Se o alvo tem a marca desta preparação: +10 dano.
- **Nota Inalcançável** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Alvorecer — Portador

A aurora limpa, fortalece e reduz recargas não defensivas de um aliado; as cargas ainda alimentam o horizonte perfurante.

**Estrutura:** Aurora que adianta

**Passiva — Primeiro Horizonte:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Lança da Primeira Luz** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Carregar a Aurora** (2 Graça + 1 Essência; recarga 3T): Restaura 15 de Vida. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Reduz em 1 turno as recargas não defensivas do beneficiado. Remove aflições e condições prejudiciais.
- **Abrir o Horizonte** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano perfurante a um inimigo. Consome as cargas: +9 de dano por carga.
- **Além do Horizonte** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Mensageira — Mensageira

Envie alento para abrir uma resposta que converte dano em recuperação do aliado mais ferido.

**Estrutura:** Entrega que retorna

**Passiva — Promessa de Chegada:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Sinal do Amanhã** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Mensagem Recebida** [variação] (1 Graça + 1 Essência; recarga 0T): Causa 15 de dano espiritual a um inimigo. Restaura ao aliado proporcionalmente mais ferido 50% do dano real causado (máx. 15 por uso). Após usar, restaura Sinal do Amanhã.
- **Mensagem de Alento** (1 Graça + 1 Essência; recarga 0T): Restaura 20 de Vida. Concede 15 de Defesa destrutível. Sinal do Amanhã vira Mensagem Recebida por 2 turnos: dano que recupera o aliado proporcionalmente mais ferido.
- **O Amanhã Chegou** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo tem a marca desta preparação: +15 dano.
- **Passagem da Mensagem** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Verdade

### O Revelador — Revelador

A luz remove vantagens e expõe mesmo diante de um contra-ataque; Invulnerável ainda impede o alvo.

**Estrutura:** Revelação incontestável

**Passiva — Nada a Esconder:** Suas habilidades causam +5 de dano se o alvo está Exposto.

- **Luz sem Mentira** (1 Graça + 1 Essência; recarga 1T): Causa 10 de dano espiritual a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Não pode ser anulado por Contra-ataque. Remove bônus de dano, redução e contra-ataque do alvo.
- **Clareza Partilhada** (1 Graça + 1 Essência; recarga 0T): Remove aflições e condições prejudiciais.
- **Verdade Incisiva** (1 Graça + 1 Essência; recarga 1T): Causa 30 de dano perfurante a um inimigo. Se o alvo está Exposto: +10 dano.
- **Transparência Absoluta** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Lúcida — Desveladora de Enganos

Revele uma marca, remova a guarda e as vantagens do alvo; o clarão concentra dano no inimigo que você marcou.

**Estrutura:** Vantagens despidas

**Passiva — Sem Disfarce:** Sua primeira habilidade ofensiva do combate causa +4 de dano.

- **Foco da Clareza** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos.
- **Desvelar a Guarda** (1 Graça + 1 Essência; recarga 1T): Causa 10 de dano físico a um inimigo. Não pode ser anulado por Contra-ataque. Antes da remoção, cada bônus de dano, redução ou contra-ataque ativo no alvo acrescenta 3 ao dano (máx. +12). Remove bônus de dano, redução e contra-ataque do alvo. Remove 20 de Defesa antes do dano.
- **Clarão sem Véu** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo tem a marca desta preparação: +15 dano.
- **Feixe Inatingível** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Espelho — Espelhamento

Mostre uma abertura e devolva a intenção: uma agressão ao espelho libera o estilhaço contra seu autor.

**Estrutura:** Reflexo preparado

**Passiva — Reflexo Honesto:** Ao perder Vida por uma habilidade inimiga, causa 4 de dano de aflição ao agressor.

- **Imagem Verdadeira** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Estilhaço Devolvido** [variação] (1 Graça + 1 Essência; recarga 0T): Causa 25 de dano perfurante a um inimigo. Remove bônus de dano, redução e contra-ataque do alvo. Após usar, restaura Imagem Verdadeira.
- **Devolver a Intenção** (1 Graça + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 25 de dano. Dura 1 turno. Se o contra-ataque ativar, Imagem Verdadeira vira Estilhaço Devolvido contra o agressor por 2 turnos.
- **Fratura da Ilusão** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Remove bônus de dano, redução e contra-ataque do alvo. Se o alvo está Exposto: +10 dano.
- **Dentro do Reflexo** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Cartógrafa — Guia da Clareza

Trace a abertura e revele o atalho de amparo; reúna as cargas para concentrar a convergência no inimigo.

**Estrutura:** Rota de apoio

**Passiva — Rota sem Engano:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Traçar a Abertura** (1 Graça; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Ganha 1 carga (máx. 3). No próximo turno, Caminho Seguro vira Atalho da Clareza: amparo concentrado em um aliado.
- **Caminho Seguro** (1 Graça + 1 Essência; recarga 0T): Concede 12 de Defesa destrutível ao trio. Aumenta em 5 o dano até o fim do próximo turno do beneficiado.
- **Atalho da Clareza** [variação] (1 Graça + 1 Essência; recarga 0T): Restaura 15 de Vida. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Remove aflições e condições prejudiciais. Após usar, restaura Caminho Seguro.
- **Convergência das Rotas** (1 Graça + 1 Essência; recarga 1T): Causa 20 de dano espiritual a um inimigo. Consome as cargas: +8 de dano por carga.
- **Fora das Coordenadas** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Vidente — Percepção

A leitura enfraquece, expõe e pune a próxima ofensiva da vítima; escolha entre cuidar de um aliado e desarmar o alvo.

**Estrutura:** Intenção observada

**Passiva — Ver sem Ferir:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Olhar Desarmante** (1 Graça; recarga 0T): Causa 5 de dano espiritual a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Se o alvo usar uma técnica ofensiva em sua próxima vez: causa 5 de dano de aflição ao próprio alvo. Ativa uma vez.
- **Amparo da Clareza** (1 Graça + 1 Essência; recarga 0T): Restaura 20 de Vida. Remove aflições e condições prejudiciais.
- **Intenção Desvendada** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano físico a um inimigo. Se o alvo está Exposto: +10 dano e Atordoa por 1 turno.
- **Véu da Serenidade** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo União

### O Fraterno — Vínculo Ofensivo

O laço ofensivo converte parte do dano real em recuperação do aliado mais ferido, além de marcar a corrente final.

**Estrutura:** Vínculo que distribui Vida

**Passiva — Força Compartilhada:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Laço do Elo** (1 Graça; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Restaura ao aliado proporcionalmente mais ferido 50% do dano real causado (máx. 15 por uso).
- **Promessa de Combate** (1 Graça + 1 Essência; recarga 0T): Concede 10 de Defesa destrutível ao trio. Aumenta em 5 o dano até o fim do próximo turno do beneficiado.
- **Corrente Dourada** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo tem a marca desta preparação: +15 dano.
- **Elo Inquebrável** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Tecelã — Vínculo Vital

Reconstrua os fragmentos com limpeza, guarda e recuperação futura; escolha o amparo concentrado ou o fôlego coletivo.

**Estrutura:** União duradoura

**Passiva — Cuidar em Conjunto:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Fio de Encontro** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Restaura ao usuário 50% do dano causado.
- **Reunir os Fragmentos** (1 Graça + 1 Essência; recarga 0T): Restaura 15 de Vida. Concede 10 de Defesa destrutível. Regeneração: restaura 4 de Vida no início dos próximos 2 turnos do beneficiado. Remove aflições e condições prejudiciais.
- **Fôlego Coletivo** (1 Graça + 1 Essência; recarga 0T): Restaura 15 de Vida a cada aliado. Aumenta em 5 o dano até o fim do próximo turno do beneficiado.
- **Entrelaçar de Luz** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Altruísta — Guarda de Aliança

Uma agressão é anulada pelo pacto; se outra ferir o aliado, ele e o usuário recuperam Vida, sem duplicar se forem a mesma alma.

**Estrutura:** Pacto de retorno

**Passiva — Pacto de Permanência:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Selo do Pacto** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Responder pelo Outro** (1 Graça + 1 Essência; recarga 0T): Concede 15 de Defesa destrutível. Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno. Na próxima resposta adversária, se uma nova habilidade tirar Vida do beneficiado: restaura 6 de Vida ao usuário e ao beneficiado, uma vez por alma. Ativa uma vez.
- **Resposta da Aliança** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 30% do dano causado. Se o alvo está Exposto: +10 dano.
- **Laço Intangível** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### Os Três Irmãos — Trio em Harmonia

Alterne três vozes no mesmo espaço: ataque, amparo e desfecho, sem perder as outras opções do trio.

**Estrutura:** Cadeia de três técnicas

**Passiva — Passo de Irmandade:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Primeira Cadência** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Ganha 1 carga (máx. 3). Vira Segunda Voz por 2 turnos; ela abre Terceira Voz por mais 2 turnos.
- **Segunda Voz** [variação] (1 Graça; recarga 0T): Restaura 15 de Vida. Ganha 1 carga (máx. 3). Abre Terceira Voz por 2 turno(s).
- **Terceira Voz** [variação] (1 Graça + 1 Essência; recarga 0T): Causa 20 de dano físico a um inimigo. Consome as cargas: +5 de dano por carga. Após usar, restaura Primeira Cadência.
- **Segunda Cadência** (1 Graça + 1 Essência; recarga 0T): Concede 12 de Defesa destrutível ao trio. Ganha 1 carga (máx. 3).
- **Terceira Cadência** (2 Graça + 1 Essência; recarga 2T): Causa 15 de dano físico a todos os inimigos. Consome as cargas: +5 de dano por carga.
- **Passo em Uníssono** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Juramentada — Fiadora de Alianças

Honre o pacto com um aliado; se ele perder Vida durante a resposta inimiga, abra a renovação do amparo.

**Estrutura:** Promessa provada

**Passiva — Promessa Cumprida:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Selo do Juramento** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos.
- **Honrar o Pacto** (1 Graça + 1 Essência; recarga 0T): Restaura 10 de Vida. Concede 25 de Defesa destrutível. Na próxima resposta adversária, se uma nova habilidade tirar Vida do beneficiado: abre uma técnica alternativa para o usuário por 2 turnos. Ativa uma vez.
- **Renovar o Pacto** [variação] (1 Graça + 1 Essência; recarga 0T): Restaura 25 de Vida. Remove aflições e condições prejudiciais. Após usar, restaura Honrar o Pacto.
- **Resposta do Juramento** (1 Graça + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Pacto Inviolável** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Criação

### O Artífice — Artífice

Crie amparo para abrir uma forma perfurante; escolha entre ela e a Obra Convergente para gastar as cargas.

**Estrutura:** Construção alternativa

**Passiva — Ideia Persistente:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Fragmento Nascente** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Forma que Rompe** [variação] (1 Graça + 1 Essência; recarga 0T): Causa 25 de dano perfurante a um inimigo. Consome as cargas: +3 de dano por carga. Após usar, restaura Fragmento Nascente.
- **Forma de Amparo** (1 Aleatório; recarga 0T): Concede 20 de Defesa destrutível. Ganha 1 carga (máx. 3). Fragmento Nascente vira Forma que Rompe por 2 turnos.
- **Obra Convergente** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano espiritual a um inimigo. Consome as cargas: +9 de dano por carga.
- **Forma Impossível** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Semente — Germinação Espiritual

A semente amadurece com as cargas: colha amparo para si ou conserve a marca para germinar no inimigo.

**Estrutura:** Amadurecimento

**Passiva — Potência Latente:** No início do seu turno, restaura 3 de Vida.

- **Marca Germinal** (1 Graça; recarga 0T): Causa 10 de dano espiritual a um inimigo. Marca o alvo por 3 turnos. Ganha 1 carga (máx. 3). Com 3 cargas, vira Fruto do Porvir: gaste a reserva em cuidado pessoal ou use outra técnica.
- **Fruto do Porvir** [variação] (1 Graça + 1 Essência; recarga 0T): Restaura 20 de Vida. Concede 10 de Defesa destrutível. Consome todas as cargas.
- **Abrigo do Broto** (1 Graça + 1 Essência; recarga 0T): Restaura 15 de Vida. Concede 10 de Defesa destrutível. Consome as cargas: +5 de cura por carga.
- **Florescer da Marca** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Se o alvo tem a marca desta preparação: +15 dano; consome a preparação.
- **Casulo de Origem** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Cultivador — Cultivador

Arar a alma já recupera o aliado mais ferido; acumule reservas para escolher a colheita coletiva ou os ramos ofensivos.

**Estrutura:** Cultivo partilhado

**Passiva — Ciclo da Colheita:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Arar a Alma** (1 Graça; recarga 0T): Causa 10 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Restaura ao aliado proporcionalmente mais ferido 40% do dano real causado (máx. 15 por uso). Ganha 1 carga (máx. 3).
- **Colheita de Fôlego** (1 Graça + 1 Essência; recarga 0T): Restaura 10 de Vida a cada aliado. Consome as cargas: +6 de cura por carga a cada aliado.
- **Ramos da Resposta** (1 Graça + 1 Essência; recarga 1T): Causa 20 de dano físico a um inimigo. Remove 15 de Defesa antes do dano. Consome as cargas: +8 de dano por carga.
- **Abrigo das Raízes** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Arquiteta — Arquiteta

Erga a abóbada para abrir amparo concentrado ou um colapso coletivo que consome sua guarda.

**Estrutura:** Arquitetura de escolhas

**Passiva — Fundação Viva:** No início do seu turno, recebe 5 de Defesa destrutível.

- **Pilar Ascendente** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Viga de Apoio** [variação] (1 Graça; recarga 0T): Concede 15 de Defesa destrutível. Regeneração: restaura 3 de Vida no início dos próximos 2 turnos do beneficiado. Após usar, restaura Pilar Ascendente.
- **Abóbada Verde** (1 Graça + 1 Essência; recarga 0T): Concede 18 de Defesa destrutível ao trio. Abre Viga de Apoio e Colapsar a Abóbada por 2 turnos. O colapso encerra as duas variações e gasta sua Defesa.
- **Convergência dos Pilares** (1 Graça + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Colapsar a Abóbada** [variação] (2 Graça + 1 Essência; recarga 2T): Causa 20 de dano físico a todos os inimigos. Acrescenta 25% da Defesa do usuário ao dano (máx. +10) e consome toda a sua Defesa. Após usar, restaura Pilar Ascendente. Após usar, restaura Convergência dos Pilares.
- **Geometria Intocável** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Ressonante — Cantor da Origem

O refrão encurta as recargas não defensivas do trio; escolha quando pagar seu custo e quando gastar as cargas no canto.

**Estrutura:** Cadência que adianta

**Passiva — Eco de Nascimento:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Nota Primordial** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Refrão da Vida** (2 Graça + 1 Aleatório; recarga 3T): Restaura 8 de Vida a cada aliado. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Reduz em 1 turno as recargas não defensivas do beneficiado.
- **Canto que Abre o Mundo** (2 Graça + 1 Essência; recarga 2T): Causa 15 de dano espiritual a todos os inimigos. Consome as cargas: +5 de dano por carga.
- **Pausa Anterior ao Som** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Correntes Quebradas

### O Descontínuo — Duelista Temporal

Percorra uma sequência de três passos contra a mesma vítima ou gaste suas cargas no Golpe Descontínuo.

**Estrutura:** Sequência temporal

**Passiva — Passo que Retorna:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Fissura do Passo** (1 Ruptura; recarga 0T): Causa 15 de dano perfurante a um inimigo. Marca o alvo por 3 turnos. Ganha 1 carga (máx. 3). Vira Passo Seguinte contra a mesma vítima por 2 turnos; ele abre Passo Anterior por 1 turno.
- **Passo Seguinte** [variação] (1 Ruptura + 1 Essência; recarga 0T): Causa 20 de dano perfurante a um inimigo. Ganha 1 carga (máx. 3). Abre Passo Anterior por 1 turno(s).
- **Passo Anterior** [variação] (1 Ruptura; recarga 0T): Causa 15 de dano espiritual a um inimigo. Enfraquece por 2 turnos do alvo: −10 de dano causado. Após usar, restaura Fissura do Passo.
- **Entre Dois Instantes** (1 Ruptura + 1 Essência; recarga 2T): Causa 15 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Golpe Descontínuo** (1 Ruptura + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Consome as cargas: +8 de dano por carga. O usuário perde 5 de Vida (não o derrota).
- **Passo Fora do Tempo** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Cindida — Alma Fragmentada

Abra uma extremidade no inimigo e escolha entre reatar o fio para proteger ou puxar seu fim para atacar.

**Estrutura:** Ruptura e reparação

**Passiva — Tensão da Ruptura:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Extremidade Solta** (1 Ruptura; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Remove 15 de Defesa antes do dano. No próximo turno, vira Reatar a Linha: transforme a ruptura em proteção para um aliado.
- **Reatar a Linha** [variação] (1 Ruptura; recarga 0T): Concede 15 de Defesa destrutível. Remove aflições e condições prejudiciais. Após usar, restaura Extremidade Solta.
- **Nó de Emergência** (1 Ruptura; recarga 0T): Restaura 20 de Vida. Concede 10 de Defesa destrutível. O usuário perde 5 de Vida (não o derrota).
- **Puxar o Fim da Linha** (1 Ruptura + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Se o alvo tem a marca desta preparação: +15 dano. O usuário perde 5 de Vida (não o derrota).
- **Linha Inalcançável** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Eco — Ressonância Errante

Colete ecos e devolva uma agressão para abrir uma ressonância coletiva que dispensa o sacrifício de Vida.

**Estrutura:** Ressonância reativa

**Passiva — Ressonância sem Dono:** Ao perder Vida por uma habilidade inimiga, causa 3 de dano de aflição ao agressor.

- **Eco Residual** (1 Ruptura; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Devolver a Voz** (1 Ruptura + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno. Se o contra-ataque ativar, Coro sem Origem vira Ressonância Roubada por 2 turnos, sem custo de Vida.
- **Coro sem Origem** (2 Ruptura + 1 Essência; recarga 2T): Causa 15 de dano espiritual a todos os inimigos. Consome as cargas: +5 de dano por carga. O usuário perde 5 de Vida (não o derrota).
- **Ressonância Roubada** [variação] (2 Ruptura + 1 Essência; recarga 2T): Causa 15 de dano espiritual a todos os inimigos. Consome as cargas: +5 de dano por carga. Após usar, restaura Coro sem Origem.
- **Eco Intangível** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Errante — Viajante do Limiar

Abra uma passagem, use o atalho para amparar um aliado e retorne; fechar a rota no inimigo também cobra sua Vida.

**Estrutura:** Travessia de volta

**Passiva — Limite Suspenso:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Abertura Impossível** (1 Ruptura; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Passagem de Retorno** [variação] (1 Ruptura; recarga 0T): Restaura 10 de Vida. Concede 10 de Defesa destrutível. Após usar, restaura Abertura Impossível.
- **Atalho Suspenso** (1 Ruptura + 1 Aleatório; recarga 0T): Concede 25 de Defesa destrutível. Remove aflições e condições prejudiciais. No próximo turno, Abertura Impossível vira Passagem de Retorno para amparar um aliado.
- **Fechar a Passagem** (1 Ruptura + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo tem a marca desta preparação: +10 dano. O usuário perde 5 de Vida (não o derrota).
- **Do Outro Lado** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Esquecido — Esquecimento

O nome perdido drena agora e deixa uma cobrança para o próximo apoio da vítima; apagar a forma prepara o desfecho de aflição.

**Estrutura:** Nome que cobra amparo

**Passiva — Nome que se Dissolve:** No início do seu turno, restaura 3 de Vida.

- **Sílaba Perdida** (1 Ruptura; recarga 1T): Causa 5 de dano físico a um inimigo. Marca o alvo por 3 turnos. Se o alvo usar uma técnica de apoio em sua próxima vez: causa 5 de dano de aflição ao próprio alvo e remove 1 recurso inimigo. Ativa uma vez. Remove 1 recurso da reserva inimiga.
- **Esquecer a Forma** (1 Ruptura; recarga 0T): Causa 15 de dano espiritual a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Remove bônus de dano, redução e contra-ataque do alvo.
- **Ninguém Responde** (1 Ruptura + 1 Aleatório; recarga 1T): Causa 25 de dano de aflição a um inimigo. Se o alvo tem a marca desta preparação: +15 dano. O usuário perde 5 de Vida (não o derrota).
- **Nome Fora da Memória** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Cronista — Tempo Submerso

Acumule segundos e pare um alvo para abrir uma janela curta de descarga concentrada.

**Estrutura:** Janela de execução

**Passiva — Tempo em Reserva:** No início do seu turno, recebe 3 de Defesa destrutível.

- **Segundo Afogado** (1 Ruptura; recarga 0T): Causa 15 de dano espiritual a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Ganha 1 carga (máx. 3).
- **Ponteiro Imóvel** (1 Ruptura + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Atordoa por 1 turno. No próximo turno, Devolver os Segundos vira Retomar o Instante contra o alvo interrompido.
- **Devolver os Segundos** (1 Ruptura + 1 Essência; recarga 2T): Causa 20 de dano espiritual a um inimigo. Consome as cargas: +10 de dano por carga. O usuário perde 8 de Vida (não o derrota).
- **Retomar o Instante** [variação] (2 Ruptura + 1 Essência; recarga 2T): Causa 35 de dano espiritual a um inimigo. Consome as cargas: +5 de dano por carga. O usuário perde 5 de Vida (não o derrota). Após usar, restaura Devolver os Segundos.
- **Instante Submerso** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Inversa — Inversão

Devolva uma agressão física para abrir um golpe que sela a ofensiva do agressor; o Enfraquecimento ainda prepara a queda.

**Estrutura:** Inversão de impulso

**Passiva — Queda Ascendente:** Suas habilidades causam +5 de dano se o alvo está Enfraquecido.

- **Pena ao Contrário** (1 Ruptura; recarga 0T): Causa 10 de dano físico a um inimigo. Enfraquece por 2 turnos do alvo: −10 de dano causado.
- **Peso da Asa** [variação] (1 Ruptura + 1 Essência; recarga 2T): Causa 15 de dano espiritual a um inimigo. Sela técnicas ofensivas por 1 turno do alvo. Após usar, restaura Pena ao Contrário.
- **Voo Reverso** (1 Ruptura + 1 Essência; recarga 0T): Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Anula a próxima habilidade inimiga física ou perfurante recebida e contra-ataca com 20 de dano. Dura 1 turno. Ao anular uma técnica física ou perfurante, Pena ao Contrário vira Peso da Asa contra o agressor por 2 turnos.
- **Cair para o Alto** (1 Ruptura + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo está Enfraquecido: +15 dano. O usuário perde 5 de Vida (não o derrota).
- **Asa Fora do Plano** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Andarilho — Vidro Errante

Cada pegada reforça a próxima até um limite; Atordoamento rompe a sequência, enquanto a travessia final ainda cobra sua integridade.

**Estrutura:** Trilha de estilhaços

**Passiva — Luz nas Fissuras:** Com 50 de Vida ou menos, suas habilidades causam +6 de dano.

- **Pegada de Vidro** (1 Ruptura; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Sangramento: 4 de dano de aflição por 2 turnos. Cada uso não anulado dá +2 de dano a esta técnica (máx. +6). Atordoamento zera esse bônus.
- **Reflexo do Andarilho** (1 Ruptura + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 25 de dano. Dura 1 turno.
- **Travessia Estilhaçada** (1 Ruptura + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo tem a marca desta preparação: +15 dano. O usuário perde 8 de Vida (não o derrota).
- **Passo Transparente** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Oscilante — Sombra Mutável

Entre num contorno de abrigo para recuperar-se e contra-atacar, depois retome a sombra para voltar a marcar e drenar.

**Estrutura:** Sombra que se recolhe

**Passiva — Fome da Penumbra:** Após causar dano com uma habilidade, restaura 4 de Vida.

- **Sombra Atrás da Alma** (1 Ruptura; recarga 1T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Rouba 1 recurso da reserva inimiga.
- **Fingir Presença** [variação] (1 Graça; recarga 0T): Restaura 10 de Vida. Anula a próxima habilidade inimiga recebida e contra-ataca com 10 de dano. Dura 1 turno.
- **Mudar de Contorno** (1 Ruptura; recarga 0T): Restaura 15 de Vida. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Remove aflições e condições prejudiciais. Assume uma postura de abrigo: troca o primeiro golpe por Fingir Presença até usar Retomar a Sombra.
- **Retomar a Sombra** [variação] (1 Graça; recarga 0T): Restaura 10 de Vida. Remove aflições e condições prejudiciais. Após usar, restaura Sombra Atrás da Alma. Após usar, restaura Mudar de Contorno.
- **A Sombra se Fecha** (1 Ruptura + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Se o alvo tem a marca desta preparação: +15 dano. O usuário perde 5 de Vida (não o derrota).
- **Contorno Imaterial** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Peregrina — Ruptor de Passagens

Quem atravessa a proteção da ponte revela uma abertura; aproveite-a na travessia coletiva antes que desapareça.

**Estrutura:** Ponte de contragolpe

**Passiva — Vão Persistente:** Suas habilidades causam +4 de dano se o alvo está Exposto.

- **Romper o Apoio** (1 Ruptura; recarga 0T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Remove 20 de Defesa antes do dano.
- **Ponte de Emergência** (1 Ruptura + 1 Essência; recarga 0T): Concede 15 de Defesa destrutível ao trio. Na próxima resposta adversária, se uma nova habilidade tirar Vida do beneficiado: expõe o agressor até o fim do próximo turno do usuário. Ativa uma vez. O usuário perde 5 de Vida (não o derrota).
- **Queda da Travessia** (2 Ruptura + 1 Essência; recarga 2T): Causa 15 de dano perfurante a todos os inimigos. Se o alvo está Exposto: +10 dano. O usuário perde 5 de Vida (não o derrota).
- **Entre as Margens** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Ancorado — Âncora Vital

Acumule três cargas para emprestar fôlego a um aliado ou gaste a reserva na ruptura; ancorar e soltar a âncora também cobra sua Vida.

**Estrutura:** Suspensão partilhada

**Passiva — Âncora Persistente:** No início do seu turno, restaura 4 de Vida.

- **Pulso Suspenso** (1 Ruptura; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3). Com 3 cargas, vira Fôlego Emprestado: gaste a reserva para recuperar um aliado ou use a descarga ofensiva.
- **Fôlego Emprestado** [variação] (1 Ruptura + 1 Essência; recarga 0T): Restaura 25 de Vida. Regeneração: restaura 4 de Vida no início dos próximos 2 turnos do beneficiado. Consome todas as cargas.
- **Ancorar o Fôlego** (1 Ruptura + 1 Essência; recarga 0T): Restaura 20 de Vida. Concede 15 de Defesa destrutível. O usuário perde 5 de Vida (não o derrota).
- **Soltar a Âncora** (1 Ruptura + 1 Essência; recarga 2T): Causa 20 de dano de aflição a um inimigo. Consome as cargas: +9 de dano por carga. O usuário perde 5 de Vida (não o derrota).
- **Suspensão Absoluta** (1 Aleatório; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

