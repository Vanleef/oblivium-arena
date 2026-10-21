# PMA — kits e regras de combate

Catálogo gerado a partir dos dados jogáveis. Atualize com `node scripts/generate-kit-catalog.mjs`.

## Fluxo

1. Escolha uma habilidade e um alvo destacado.
2. Cada personagem usa uma ação por turno. A fila reserva os recursos.
3. Reordene ou remova ações, revise e confirme em Pronto.
4. As ações aliadas e a resposta adversária resolvem uma a uma.
5. Aflições e durações são atualizadas antes do próximo planejamento.

## Durações e recursos

- A quarta técnica das 100 almas concede Invulnerável por uma resposta adversária. Custa 1 Essência; fica indisponível nos quatro turnos próprios seguintes.
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

Os kits usam as identidades e os conceitos do PMA. Compartilhar palavras-chave e arquétipos é intencional; nomes diferentes, por si só, não demonstram diversidade nem equilíbrio. Testes cobrem a execução de cada combo, custos, uso de marcas e cargas, durações e a quarta defesa. O ajuste fino entre equipes e dificuldades depende de partidas e iterações de balanceamento.

## Elo Sangria

### O Açougueiro — Executor

Abra Sangramento e escolha entre reabrir a mesma ferida ou consumi-la na Sentença.

**Estrutura:** Execução encadeada

**Passiva — Faro de Sangue:** Suas habilidades causam +5 de dano se o alvo está com Sangramento.

- **Incisão de Abate** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Sangramento: 5 de dano de aflição por 2 turnos. Vira Reabrir a Ferida por 2 turnos, somente contra a mesma vítima.
- **Reabrir a Ferida** [variação] (1 Cinza + 1 Essência; recarga 0T): Causa 20 de dano físico a um inimigo. Se o alvo está com Sangramento: +10 dano; consome a preparação. Após usar, restaura Incisão de Abate.
- **Separar Tendões** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Atordoa por 1 turno.
- **Sentença do Cutelo** (1 Cinza + 1 Essência; recarga 1T): Causa 30 de dano físico a um inimigo. Se o alvo está com Sangramento: +15 dano; consome a preparação.
- **Passo entre Lâminas** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Viúva Escarlate — Duelista

Atraia uma agressão ao véu para abrir uma cobrança de Vida contra quem o atacou.

**Estrutura:** Resposta ao agressor

**Passiva — Luto Faminto:** Após causar dano com uma habilidade, restaura 4 de Vida.

- **Fio Escarlate** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Fio Reverso** [variação] (1 Cinza + 1 Essência; recarga 0T): Causa 25 de dano perfurante a um inimigo. Restaura ao usuário 50% do dano causado. Após usar, restaura Fio Escarlate.
- **Véu da Viúva** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno. Se o contra-ataque ativar, Fio Escarlate vira Fio Reverso contra o agressor por 2 turnos.
- **Beijo da Última Noite** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 50% do dano causado. Se o alvo tem a marca desta preparação: +15 dano.
- **Véu de Sangue** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Colecionador de Cabeças — Caçador

Acumule troféus e escolha quando gastar as duas grandes execuções disponíveis no combate.

**Estrutura:** Munição limitada

**Passiva — Primeiro Troféu:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Laço de Caça** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Ganha 1 carga (máx. 3).
- **Cobrança do Caçador** (1 Cinza; recarga 0T): Causa 20 de dano físico a um inimigo. Remove 15 de Defesa antes do dano.
- **Galeria de Troféus** (1 Cinza + 1 Essência; recarga 2T): Causa 20 de dano físico a um inimigo. Consome as cargas: +8 de dano por carga. Pode ser usada 2 vezes por combate; depois vira Caça sem Troféus.
- **Caça sem Troféus** [variação] (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Consome as cargas: +3 de dano por carga.
- **Sombra do Colecionador** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### Gêmeos do Cutelo — Ruptor

Use um corte para abrir o outro; escolha entre a continuação concentrada e o encontro das duas lâminas.

**Estrutura:** Cadência cruzada

**Passiva — Ritmo dos Gêmeos:** Suas habilidades causam +4 de dano se o alvo está Exposto.

- **Cutelo da Esquerda** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. No próximo turno, Cutelo da Direita vira Corte em Contratempo contra a mesma vítima.
- **Cutelo da Direita** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Sangramento: 4 de dano de aflição por 2 turnos.
- **Corte em Contratempo** [variação] (1 Cinza + 1 Essência; recarga 0T): Causa 15 de dano perfurante a um inimigo. Sangramento: 4 de dano de aflição por 2 turnos. Se o alvo está Exposto: +5 dano. Após usar, restaura Cutelo da Direita.
- **Encontro das Lâminas** (2 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a todos os inimigos. Se o alvo está Exposto: +10 dano.
- **Dança Cruzada** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Carrasco sem Rosto — Sentenciador

Marque uma sentença que pune apoio; interrompa a vítima ou guarde a execução para quando ela estiver ferida.

**Estrutura:** Sentença contra apoio

**Passiva — Sem Apelação:** Suas habilidades causam +5 de dano se o alvo está Atordoado.

- **Sentença sem Nome** (1 Cinza; recarga 0T): Causa 5 de dano físico a um inimigo. Marca o alvo por 3 turnos. Se o alvo usar uma técnica de apoio em sua próxima vez: causa 10 de dano de aflição ao próprio alvo. Ativa uma vez.
- **Queda da Guilhotina** (1 Cinza + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Última Respiração** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Se o alvo tem 50 de Vida ou menos: +20 dano.
- **Capuz do Esquecimento** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Mãe Rubra — Sustentação

Troque sua Vida por guarda e recuperação futura de um aliado; sustente-se drenando o inimigo.

**Estrutura:** Cuidado com sacrifício

**Passiva — Sangue que Acolhe:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Cordão Rubro** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Restaura ao usuário 50% do dano causado.
- **Partilha da Mãe** (1 Cinza; recarga 1T): Restaura 15 de Vida. Concede 10 de Defesa destrutível. Regeneração: restaura 4 de Vida no início dos próximos 2 turnos do beneficiado. O usuário perde 5 de Vida (não o derrota).
- **Berço de Sangue** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a todos os inimigos. Sangramento: 4 de dano de aflição por 2 turnos.
- **Casulo Rubro** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Coroa

### O Soberano Quebrado — Dominador

Assuma a coroa para espalhar decretos e depois escolha quem será obrigado a ajoelhar.

**Estrutura:** Domínio temporário

**Passiva — Autoridade Estilhaçada:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Decreto do Rei Caído** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos.
- **Decreto sobre Todos** [variação] (1 Cinza + 1 Essência; recarga 0T): Causa 10 de dano espiritual a todos os inimigos. Marca o alvo por 3 turnos.
- **Ajoelhar** (1 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Coroa sobre Ruínas** (1 Cinza + 1 Essência; recarga 0T): Concede 25 de Defesa destrutível. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Durante os próximos 2 turnos, Decreto do Rei Caído vira Decreto sobre Todos.
- **Trono Interior** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Juíza de Ferro — Controladora

A acusação expõe e sela o apoio; a audiência interrompe e o veredito atravessa a redução de dano.

**Estrutura:** Interdição de apoio

**Passiva — Peso da Lei:** Suas habilidades causam +5 de dano se o alvo está Exposto.

- **Acusação de Ferro** (1 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Sela técnicas de apoio por 1 turno do alvo. A defesa pessoal continua disponível.
- **Audiência Suspensa** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Atordoa por 1 turno. Remove 10 de Defesa antes do dano.
- **Veredito Irrecorrível** (1 Cinza + 1 Essência; recarga 1T): Causa 30 de dano perfurante a um inimigo. Se o alvo está Exposto: +10 dano.
- **Sala Inviolável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Trono Vazio — Estrategista

Interdite a ofensiva sem impedir o apoio; alterne o domínio com proteção coletiva e contra-ataques.

**Estrutura:** Autoridade sem corpo

**Passiva — Presença sem Corpo:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Vontade do Assento Vazio** (1 Cinza + 1 Essência; recarga 1T): Causa 15 de dano espiritual a um inimigo. Sela técnicas ofensivas por 1 turno do alvo.
- **Edicto de Interdição** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno.
- **Domínio sem Rei** (1 Cinza + 1 Essência; recarga 0T): Concede 15 de Defesa destrutível ao trio. Aumenta em 5 o dano até o fim do próximo turno do beneficiado.
- **Palácio Inatingível** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Príncipe das Correntes — Carcereiro

Prenda uma vítima e escolha entre apertar o mesmo grilhão ou gastar as cargas no cárcere.

**Estrutura:** Perseguição

**Passiva — Grilhão Herdado:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Primeiro Grilhão** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Ganha 1 carga (máx. 3). No próximo turno, vira Apertar o Grilhão contra a mesma vítima.
- **Apertar o Grilhão** [variação] (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Ganha 1 carga (máx. 3). Após usar, restaura Primeiro Grilhão.
- **Arrasto do Príncipe** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Cárcere Dinástico** (1 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a um inimigo. Atordoa por 1 turno. Consome as cargas: +8 de dano por carga.
- **Corrente Exterior** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Regente de Cinzas — Comandante

Mantenha o trio com um comando que deixa recuperação futura; use as cinzas para preparar a purga.

**Estrutura:** Comando persistente

**Passiva — Lealdade pelo Medo:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Ordem em Cinzas** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Queimadura: 4 de dano de aflição por 2 turnos.
- **Comando da Regente** (1 Cinza + 1 Essência; recarga 0T): Concede 10 de Defesa destrutível ao trio. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Regeneração: restaura 2 de Vida no início dos próximos 2 turnos de cada aliado.
- **Purgar a Rebelião** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Remove 15 de Defesa antes do dano. Se o alvo está com Queimadura: +15 dano.
- **Manto da Regência** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Herdeiro Cativo — Rebelde

O punho ganha força com a Vida perdida; escolha entre recuperar-se ou conservar o risco para a sucessão.

**Estrutura:** Resistência cativa

**Passiva — Vontade Cativa:** Com 50 de Vida ou menos, suas habilidades causam +6 de dano.

- **Punho Acorrentado** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. A cada 25 de Vida perdida pelo usuário: +3 de dano (máx. +9). Ganha 1 carga (máx. 3).
- **Aguentar o Decreto** (1 Cinza; recarga 0T): Restaura 15 de Vida. Reduz em 10 o dano recebido por 1 turno.
- **Sucessão Rompida** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Consome as cargas: +8 de dano por carga. O usuário perde 5 de Vida (não o derrota).
- **Brecha na Cela** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Mentira

### O Sussurro — Sabotador

Envenene um segredo que pune a próxima ofensiva da vítima e depois cobre seus recursos.

**Estrutura:** Segredo provocador

**Passiva — Segredo em Circulação:** Suas habilidades causam +4 de dano se o alvo está com Veneno.

- **Palavra Envenenada** (1 Cinza; recarga 0T): Causa 5 de dano espiritual a um inimigo. Veneno: 5 de dano de aflição por 2 turnos. Se o alvo usar uma técnica ofensiva em sua próxima vez: causa 8 de dano de aflição ao próprio alvo. Ativa uma vez.
- **Segredo Cobrado** (1 Cinza + 1 Essência; recarga 1T): Causa 20 de dano físico a um inimigo. Rouba 1 recurso da reserva inimiga. Se o alvo está com Veneno: +10 dano.
- **Aviso Falso** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 15 de dano. Dura 1 turno.
- **Voz sem Origem** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Máscara Dupla — Ilusionista

Empreste um rosto para marcar, mude a resposta e revele a traição quando o adversário baixar a guarda.

**Estrutura:** Alternância de intenções

**Passiva — Segundo Rosto:** Após causar dano com uma habilidade, restaura 3 de Vida.

- **Rosto Emprestado** (1 Cinza; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos. Vira Gesto de Outro Rosto por 2 turnos: um ataque que prepara um contra-ataque pessoal.
- **Gesto de Outro Rosto** [variação] (1 Cinza + 1 Essência; recarga 0T): Causa 10 de dano espiritual a um inimigo. Anula a próxima habilidade inimiga recebida e contra-ataca com 15 de dano. Dura 1 turno. Após usar, restaura Rosto Emprestado.
- **O Outro Rosto** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 25 de dano. Dura 1 turno.
- **Traição Revelada** (1 Cinza + 1 Essência; recarga 2T): Causa 20 de dano físico a um inimigo. Rouba 1 recurso da reserva inimiga. Se o alvo tem a marca desta preparação: +15 dano; consome a preparação.
- **Troca de Máscara** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Tecelão de Mentiras — Manipulador

Prenda o adversário na trama e escolha entre continuar o controle ou desatar a rede para limpar o trio.

**Estrutura:** Controle ou amparo

**Passiva — Trama Paciente:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Fio de Engano** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Enfraquece por 1 turno do alvo: −10 de dano causado. No próximo turno, Rede de Falsidades vira Desatar a Trama.
- **Rede de Falsidades** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a todos os inimigos. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Desatar a Trama** [variação] (1 Cinza + 1 Essência; recarga 0T): Restaura 8 de Vida a cada aliado. Remove aflições e condições prejudiciais. Após usar, restaura Rede de Falsidades.
- **Nó da Contradição** (1 Cinza + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Fora da Trama** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Boca de Vidro — Atiradora

Repetir a sílaba aumenta seu dano até um limite; ser Atordoada quebra o ritmo do discurso.

**Estrutura:** Discurso crescente

**Passiva — Verdade Fraturada:** Suas habilidades causam +4 de dano se o alvo está Exposto.

- **Sílaba Cortante** (1 Cinza; recarga 0T): Causa 15 de dano perfurante a um inimigo. Cada uso não anulado dá +3 de dano a esta técnica (máx. +9). Atordoamento zera esse bônus.
- **Confissão Rachada** (1 Cinza; recarga 1T): Causa 10 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Remove 1 recurso da reserva inimiga.
- **Discurso em Estilhaços** (2 Cinza + 1 Essência; recarga 2T): Causa 20 de dano perfurante a todos os inimigos. Se o alvo está Exposto: +10 dano.
- **Reflexo da Boca** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Falso Profeta — Corruptor

Cultive cargas com a falsa bênção e escolha entre confessar para recuperar-se ou fabricar um milagre ofensivo.

**Estrutura:** Fé ou confissão

**Passiva — Fé Desviada:** No início do seu turno, restaura 3 de Vida.

- **Promessa do Profeta** (1 Cinza; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos.
- **Bênção Falsa** (1 Cinza; recarga 0T): Restaura 15 de Vida. Regeneração: restaura 3 de Vida no início dos próximos 2 turnos do beneficiado. Ganha 1 carga (máx. 3). Vira Confissão do Falso Santo por 2 turnos: gaste as cargas em cuidado ou preserve-as para o milagre.
- **Confissão do Falso Santo** [variação] (1 Cinza + 1 Essência; recarga 0T): Restaura 25 de Vida. Remove aflições e condições prejudiciais. Consome as cargas: +3 de cura por carga. Após usar, restaura Bênção Falsa.
- **Milagre Fabricado** (1 Cinza + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Consome as cargas: +5 de dano por carga. Se o alvo tem a marca desta preparação: +10 dano.
- **Imagem Sagrada** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Corretor de Memórias — Ladrão de Memórias

Hipoteque uma memória e apague as opções de apoio da vítima antes de liquidar o passado.

**Estrutura:** Confisco de lembranças

**Passiva — Arquivo Roubado:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Lembrança Hipotecada** (1 Cinza; recarga 1T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Rouba 1 recurso da reserva inimiga.
- **Esquecer a Defesa** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Sela técnicas de apoio por 1 turno do alvo. A defesa pessoal continua disponível. Remove bônus de dano, redução e contra-ataque do alvo. Remove 15 de Defesa antes do dano.
- **Liquidação do Passado** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo tem a marca desta preparação: +15 dano.
- **Memória Substituta** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Chama

### O Incendiário — Incendiário

O pavio pune quem não usa uma técnica; a vítima precisa agir enquanto você prepara a detonação.

**Estrutura:** Pavio que exige resposta

**Passiva — Pavio Aceso:** Suas habilidades causam +4 de dano se o alvo está com Queimadura.

- **Pavio de Ódio** (1 Cinza; recarga 1T): Causa 10 de dano espiritual a um inimigo. Queimadura: 5 de dano de aflição por 2 turnos. Se o alvo não usar nenhuma técnica em sua próxima vez: causa 8 de dano de aflição ao próprio alvo. Ativa uma vez.
- **Fagulhas em Cadeia** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a todos os inimigos. Queimadura: 4 de dano de aflição por 2 turnos.
- **Detonação Negra** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo está com Queimadura: +15 dano; consome a preparação.
- **Corpo de Fumaça** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Brasa Eterna — Controladora de Chamas

Mantenha a Queimadura, sufoque a vítima e escolha entre a labareda concentrada e a Fornalha.

**Estrutura:** Combustão em etapas

**Passiva — Calor Persistente:** Suas habilidades causam +5 de dano se o alvo está com Queimadura.

- **Brasa que Permanece** (1 Cinza; recarga 0T): Causa 15 de dano espiritual a um inimigo. Queimadura: 5 de dano de aflição por 3 turnos.
- **Labareda Sufocante** [variação] (1 Cinza + 1 Essência; recarga 0T): Causa 20 de dano espiritual a um inimigo. Queimadura: 6 de dano de aflição por 2 turnos. Após usar, restaura Brasa que Permanece.
- **Sufoco das Cinzas** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Se o alvo está com Queimadura: +5 dano e Atordoa por 1 turno. Se o alvo já tinha Queimadura, Brasa que Permanece vira Labareda Sufocante contra ele por 2 turnos.
- **Fornalha Interior** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3). Por carga: +5 de dano por carga.
- **Manto de Cinzas** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Ódio Encarnado — Berserker

Alimente o ódio para transformar seus ataques por 2 turnos; o desfecho encerra a fúria e cobra Vida.

**Estrutura:** Transformação de risco

**Passiva — Raiva sem Freio:** Com 50 de Vida ou menos, suas habilidades causam +7 de dano.

- **Punho de Rancor** (1 Cinza; recarga 0T): Causa 25 de dano físico a um inimigo. O usuário perde 5 de Vida (não o derrota).
- **Punho do Ódio Solto** [variação] (1 Cinza; recarga 0T): Causa 30 de dano físico a um inimigo. O usuário perde 10 de Vida (não o derrota).
- **Alimentar o Ódio** (1 Cinza; recarga 0T): Concede 10 de Defesa destrutível. Aumenta em 10 o dano até o fim do próximo turno do beneficiado. O usuário perde 5 de Vida (não o derrota). Libera duas técnicas mais arriscadas por 2 turnos. Ressentimento sem Freio encerra a transformação.
- **Explosão do Ressentimento** (1 Cinza + 1 Essência; recarga 1T): Causa 30 de dano espiritual a um inimigo. Se o usuário tem 50 de Vida ou menos: +15 dano. O usuário perde 5 de Vida (não o derrota).
- **Ressentimento sem Freio** [variação] (1 Cinza + 1 Essência; recarga 2T): Causa 35 de dano espiritual a um inimigo. Se o usuário tem 50 de Vida ou menos: +15 dano. O usuário perde 10 de Vida (não o derrota). Após usar, restaura Punho de Rancor. Após usar, restaura Explosão do Ressentimento.
- **Fúria Intocável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Filho da Cinza — Sobrevivente

Guarde calor até renascer; decida se gasta as reservas para atacar ou recuperar o corpo.

**Estrutura:** Limiar de cargas

**Passiva — Debaixo das Cinzas:** No início do seu turno, restaura 4 de Vida.

- **Carvão Oculto** (1 Cinza; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3). Com 3 cargas, vira Ressurgir do Carvão até as cargas serem gastas.
- **Ressurgir do Carvão** [variação] (1 Cinza + 1 Essência; recarga 0T): Causa 25 de dano espiritual a um inimigo. Remove aflições e condições prejudiciais do usuário. Consome as cargas: +3 de dano por carga.
- **Recompor-se da Cinza** (1 Cinza; recarga 0T): Restaura 15 de Vida. Consome as cargas: +7 de cura por carga.
- **Renascer em Chamas** (1 Cinza + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Queimadura: 5 de dano de aflição por 2 turnos. Remove aflições e condições prejudiciais do usuário.
- **Dissolução em Cinzas** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Pira Errante — Cerco

O círculo anula uma agressão; se outra ferir a pira, abre Lenha da Retaliação contra o agressor.

**Estrutura:** Defesa em duas camadas

**Passiva — Lenha da Travessia:** No início do seu turno, recebe 3 de Defesa destrutível.

- **Lenha Espiritual** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Queimadura: 6 de dano de aflição por 3 turnos.
- **Lenha da Retaliação** [variação] (1 Cinza + 1 Essência; recarga 0T): Causa 20 de dano espiritual a um inimigo. Queimadura: 4 de dano de aflição por 2 turnos. Após usar, restaura Lenha Espiritual.
- **Círculo da Pira** (1 Cinza + 1 Essência; recarga 0T): Concede 10 de Defesa destrutível. Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno. Na próxima resposta adversária, se uma nova habilidade tirar Vida do beneficiado: abre uma técnica alternativa para o usuário por 2 turnos. Ativa uma vez.
- **Marcha da Fogueira** (2 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a todos os inimigos. Remove 15 de Defesa antes do dano. Se o alvo está com Queimadura: +10 dano.
- **Passo entre Brasas** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Coração em Fúria — Ruptor

A ebulição cresce com a Vida perdida, prepara o próximo golpe e disputa espaço com a descarga de cargas.

**Estrutura:** Pressão do coração

**Passiva — Pulso Irado:** Ao perder Vida por uma habilidade inimiga, causa 3 de dano de aflição ao agressor.

- **Batida Escaldante** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Ganha 1 carga (máx. 3).
- **Sangue em Ebulição** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Aumenta em 5 o dano do usuário até o fim do próximo turno do beneficiado. A cada 20 de Vida perdida pelo usuário: +2 de dano (máx. +10). O usuário perde 5 de Vida (não o derrota).
- **Coração em Erupção** (1 Cinza + 1 Essência; recarga 2T): Causa 20 de dano físico a um inimigo. Consome as cargas: +10 de dano por carga. O usuário perde 8 de Vida (não o derrota).
- **Pulso Intangível** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Fome

### O Devorador — Predador

A fome muda com sua Vida: ferido, você atravessa a Defesa e drena recursos; recuperado, volta a morder.

**Estrutura:** Forma por Vida

**Passiva — Fome Crescente:** Após causar dano com uma habilidade, restaura 4 de Vida.

- **Mordida da Alma** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Restaura ao usuário 50% do dano causado. Com 50 de Vida ou menos, vira Fome sem Corpo. Recuperar Vida acima de 50 restaura Mordida da Alma.
- **Fome sem Corpo** [variação] (1 Cinza + 1 Essência; recarga 1T): Causa 15 de dano de aflição a um inimigo. Remove 1 recurso da reserva inimiga. Restaura ao usuário 60% do dano causado.
- **Saliva Corrosiva** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Remove 20 de Defesa antes do dano.
- **Engolir a Essência** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 50% do dano causado. Se o alvo tem 50 de Vida ou menos: +15 dano.
- **Mandíbula do Vazio** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Mão que Toma — Usurpadora

Guarde o que roubou e escolha se as cargas vão para o Confisco ou para abrir uma reserva vital.

**Estrutura:** Reserva conversível

**Passiva — Posse Insaciável:** Sua primeira habilidade ofensiva do combate causa +4 de dano.

- **Dedos da Cobiça** (1 Cinza; recarga 1T): Causa 10 de dano físico a um inimigo. Rouba 1 recurso da reserva inimiga.
- **Guardar o que Roubou** (1 Cinza; recarga 0T): Concede 20 de Defesa destrutível. Ganha 1 carga (máx. 3). Vira Abrir o Cofre por 2 turnos; gastar as reservas restaura esta técnica.
- **Abrir o Cofre** [variação] (1 Cinza + 1 Essência; recarga 0T): Restaura 20 de Vida. Consome as cargas: +5 de cura por carga. Após usar, restaura Guardar o que Roubou.
- **Confisco da Alma** (1 Cinza + 1 Essência; recarga 1T): Causa 20 de dano físico a um inimigo. Remove 30 de Defesa antes do dano. Consome as cargas: +7 de dano por carga.
- **Mão Fora de Alcance** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Estômago sem Fundo — Devorador de Defesa

Converta a Defesa removida em guarda própria, acumule refeições e escolha entre reserva vital e abismo.

**Estrutura:** Digestão de Defesa

**Passiva — Digestão Lenta:** No início do seu turno, restaura 3 de Vida.

- **Corrosão Faminta** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Converte 50% da Defesa removida em Defesa própria (máx. 15). Remove 20 de Defesa antes do dano. Ganha 1 carga (máx. 3).
- **Reserva do Estômago** (1 Cinza; recarga 0T): Restaura 20 de Vida. Reduz em 5 o dano recebido por 1 turno.
- **Fundo que Não Existe** (1 Cinza + 1 Essência; recarga 2T): Causa 20 de dano de aflição a um inimigo. Consome as cargas: +8 de dano por carga.
- **Refúgio no Abismo** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Senhora do Último Pão — Apoio da Escassez

Divida uma cura menor agora que continua nos dois turnos seguintes, enquanto a privação prepara a cobrança.

**Estrutura:** Ração repartida

**Passiva — Última Migalha:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Marca da Privação** (1 Cinza; recarga 1T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Remove 1 recurso da reserva inimiga.
- **Dividir o Último Pão** (1 Cinza + 1 Essência; recarga 0T): Restaura 8 de Vida a cada aliado. Regeneração: restaura 3 de Vida no início dos próximos 2 turnos de cada aliado.
- **Dívida da Mesa Vazia** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 50% do dano causado. Se o alvo tem a marca desta preparação: +10 dano.
- **Mesa Inviolável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Credor — Cobrador

Assine uma dívida que cobra a próxima técnica usada pela vítima; escolha entre juros e execução do contrato.

**Estrutura:** Dívida por ação

**Passiva — Juros da Alma:** Suas habilidades causam +5 de dano se o alvo tem uma marca sua.

- **Assinar a Dívida** (1 Cinza; recarga 1T): Causa 10 de dano físico a um inimigo. Marca o alvo por 4 turnos. Se o alvo usar uma técnica em sua próxima vez: causa 10 de dano de aflição ao próprio alvo. Ativa uma vez.
- **Juros Acumulados** (1 Cinza + 1 Essência; recarga 1T): Causa 20 de dano físico a um inimigo. Rouba 1 recurso da reserva inimiga. Se o alvo tem a marca desta preparação: +10 dano.
- **Execução do Contrato** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo tem a marca desta preparação: +15 dano; consome a preparação.
- **Cláusula de Ausência** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Balança Vazia — Drenagem

O contrapeso recupera mais Vida quanto mais ferido estiver o aliado; a fome coletiva ainda exige alvos feridos.

**Estrutura:** Contrapeso da carência

**Passiva — Peso da Carência:** Com 50 de Vida ou menos, suas habilidades causam +5 de dano.

- **Prato da Falta** (1 Cinza; recarga 1T): Causa 15 de dano físico a um inimigo. Remove 1 recurso da reserva inimiga.
- **Contrapeso Vital** (1 Cinza + 1 Essência; recarga 0T): Restaura 15 de Vida. A cada 20 de Vida faltante do beneficiado: +3 de cura (máx. +12). Remove aflições e condições prejudiciais.
- **Fome em Equilíbrio** (1 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a todos os inimigos. Se o alvo tem 50 de Vida ou menos: +10 dano.
- **Peso Zero** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Podridão

### O Apodrecido — Aflição

A decadência reduz a cura recebida; escolha entre degradar a guarda e concluir a decomposição.

**Estrutura:** Ruína da recuperação

**Passiva — Carne em Ruína:** Suas habilidades causam +4 de dano se o alvo está com Decadência.

- **Contato da Ruína** (1 Cinza; recarga 0T): Causa 5 de dano físico a um inimigo. Decadência: 4 de dano de aflição por 3 turnos. Reduz a cura recebida em 50% até o fim do próximo turno deste lado.
- **Tecido Cedido** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Remove 15 de Defesa antes do dano.
- **Decomposição Completa** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Se o alvo está com Decadência: +15 dano.
- **Casca Morta** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Praga Andante — Propagadora

Espalhe Veneno e transforme o contágio coletivo em uma cobrança concentrada.

**Estrutura:** Propagação e foco

**Passiva — Hospedeira da Praga:** Após causar dano com uma habilidade, restaura 3 de Vida.

- **Febre Andante** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Veneno: 6 de dano de aflição por 2 turnos.
- **Contágio do Caminho** (1 Cinza + 1 Essência; recarga 2T): Causa 5 de dano físico a todos os inimigos. Veneno: 4 de dano de aflição por 3 turnos. Vira Febre de Retorno por 2 turnos: concentre o contágio em uma vítima.
- **Febre de Retorno** [variação] (1 Cinza + 1 Essência; recarga 1T): Causa 15 de dano de aflição a um inimigo. Se o alvo está com Veneno: +10 dano. Após usar, restaura Contágio do Caminho.
- **Crise Pestilenta** (1 Cinza + 1 Essência; recarga 3T): Causa 20 de dano físico a um inimigo. Se o alvo está com Veneno: +15 dano e Atordoa por 1 turno.
- **Névoa Contaminada** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Corrupto — Sabotador

Quebre a confiança para converter parte do dano real em Defesa própria; cobre a corrupção marcada em aflição.

**Estrutura:** Vantagem parasitária

**Passiva — Lucro da Ruína:** Suas habilidades causam +4 de dano se o alvo tem Defesa.

- **Acordo Podre** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Remove 20 de Defesa antes do dano.
- **Quebrar a Confiança** (1 Cinza + 1 Essência; recarga 0T): Causa 10 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Converte 50% do dano real causado em Defesa própria (máx. 20 por uso). Remove bônus de dano, redução e contra-ataque do alvo.
- **Preço da Corrupção** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Rouba 1 recurso da reserva inimiga. Se o alvo tem a marca desta preparação: +10 dano.
- **Privilégio Oculto** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Rainha dos Fungos — Rainha de Esporos

Semeie uma colônia e escolha sua colheita: proteger os vivos ou espalhar esporos ofensivos.

**Estrutura:** Desfechos exclusivos

**Passiva — Colônia Viva:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Semear Esporos** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Decadência: 5 de dano de aflição por 2 turnos. Ganha 1 carga (máx. 3). Abre Florescer para os Vivos e Esporos da Última Colheita por 2 turnos. Usar uma das duas encerra ambas.
- **Micélio de Amparo** (1 Cinza + 1 Essência; recarga 0T): Concede 12 de Defesa destrutível ao trio. Consome as cargas: +4 de cura por carga a cada aliado.
- **Florescer para os Vivos** [variação] (1 Cinza + 1 Essência; recarga 0T): Restaura 8 de Vida a cada aliado. Concede 8 de Defesa destrutível ao trio. Consome as cargas: +4 de cura por carga a cada aliado. Após usar, restaura Micélio de Amparo. Após usar, restaura Florir da Colônia.
- **Florir da Colônia** (1 Cinza + 1 Essência; recarga 1T): Causa 20 de dano de aflição a um inimigo. Consome as cargas: +7 de dano por carga.
- **Esporos da Última Colheita** [variação] (2 Cinza + 1 Essência; recarga 2T): Causa 15 de dano de aflição a todos os inimigos. Consome as cargas: +3 de dano por carga. Após usar, restaura Micélio de Amparo. Após usar, restaura Florir da Colônia.
- **Coroa de Esporos** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Médico de Vermes — Cirurgião Sombrio

A sutura limpa agora e restaura Vida nos próximos turnos; a colônia inimiga alimenta outra forma de recuperação.

**Estrutura:** Sutura viva

**Passiva — Cuidado Decomposto:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Incisão Parasitária** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Veneno: 5 de dano de aflição por 3 turnos. Restaura ao usuário 50% do dano causado.
- **Sutura de Vermes** (1 Cinza + 1 Essência; recarga 1T): Restaura 15 de Vida. Regeneração: restaura 6 de Vida no início dos próximos 2 turnos do beneficiado. Remove aflições e condições prejudiciais.
- **Drenagem da Colônia** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 70% do dano causado. Se o alvo está com Veneno: +10 dano.
- **Corpo entre Vermes** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Jardim Morto — Cerco Vivo

O solo protege cada aliado e pune a primeira agressão que atravessar sua guarda; as raízes mantêm a decadência.

**Estrutura:** Jardim de retaliação

**Passiva — Raiz sob a Pele:** Ao perder Vida por uma habilidade inimiga, causa 3 de dano de aflição ao agressor.

- **Raiz Necrosada** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Decadência: 4 de dano de aflição por 3 turnos.
- **Solo Contaminado** (1 Cinza + 1 Essência; recarga 0T): Concede 12 de Defesa destrutível ao trio. Na próxima resposta adversária, se uma nova habilidade tirar Vida do beneficiado: causa 5 de dano de aflição ao agressor. Ativa uma vez.
- **Jardim do Fim** (2 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a todos os inimigos. Enfraquece por 1 turno do alvo: −10 de dano causado. Se o alvo está com Decadência: +10 dano.
- **Entre Raízes Mortas** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Silêncio

### O que Observou — Observador

Registre o acontecimento e provoque uma resposta: a agressão ao contra-ataque revela um desfecho próprio.

**Estrutura:** Testemunho reativo

**Passiva — Olhos que Não Piscam:** No início do seu turno, recebe 3 de Defesa destrutível.

- **Registrar a Falha** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Ganha 1 carga (máx. 3).
- **Recusar Interferência** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno. Se o contra-ataque ativar, Peso do Testemunho vira Resposta da Testemunha contra o agressor por 2 turnos.
- **Peso do Testemunho** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Consome as cargas: +5 de dano por carga. Se o alvo tem a marca desta preparação: +10 dano.
- **Resposta da Testemunha** [variação] (1 Cinza + 1 Essência; recarga 2T): Causa 30 de dano espiritual a um inimigo. Consome as cargas: +5 de dano por carga. Após usar, restaura Peso do Testemunho.
- **Fora do Acontecimento** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Porta Fechada — Carcereira

Feche o apoio da vítima sem impedir sua ofensiva; marque a porta para interrompê-la no momento certo.

**Estrutura:** Tranca seletiva

**Passiva — Lado de Dentro:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Batida sem Resposta** (1 Cinza; recarga 1T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Sela técnicas de apoio por 1 turno do alvo. A defesa pessoal continua disponível.
- **Tranca do Refúgio** (1 Cinza; recarga 0T): Concede 25 de Defesa destrutível. Reduz em 5 o dano recebido por 1 turno.
- **Não Há Saída** (1 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Porta Fora do Mundo** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Surdo — Interrupção

Prolongue o Enfraquecimento e escolha entre a onda de combo ou interromper para abrir um golpe de aflição.

**Estrutura:** Interrupção e continuação

**Passiva — Ruído Abafado:** Com 50 de Vida ou menos, suas habilidades causam +5 de dano.

- **Impacto Abafado** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Enfraquece por 2 turnos do alvo: −10 de dano causado.
- **Som que Não Retorna** [variação] (1 Cinza + 1 Essência; recarga 0T): Causa 20 de dano de aflição a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Após usar, restaura Impacto Abafado.
- **Cessar do Som** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Atordoa por 1 turno. No próximo turno, Impacto Abafado vira Som que Não Retorna contra o alvo interrompido.
- **Onda Inaudível** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo está Enfraquecido: +15 dano.
- **Silêncio Absoluto** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Testemunha Cega — Testemunha

A memória responde a técnicas espirituais ou de aflição; revele a presença para preparar o testemunho perfurante.

**Estrutura:** Vigília espiritual

**Passiva — Visão sem Olhos:** Suas habilidades causam +5 de dano se o alvo está Exposto.

- **Presença Denunciada** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Remove bônus de dano, redução e contra-ataque do alvo.
- **Memória do Golpe** (1 Cinza; recarga 0T): Anula a próxima habilidade inimiga espiritual ou de aflição recebida e contra-ataca com 20 de dano. Dura 1 turno.
- **Testemunho Final** (1 Cinza + 1 Essência; recarga 1T): Causa 30 de dano perfurante a um inimigo. Se o alvo está Exposto: +10 dano.
- **Campo sem Testemunha** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Quarto Vazio — Isolamento

A presença vazia pune o próximo apoio da vítima com dano e perda de um recurso; a ausência coletiva drena o restante.

**Estrutura:** Isolamento oportunista

**Passiva — Vazio Habitado:** No início do seu turno, restaura 3 de Vida.

- **Ausência Pesada** (1 Cinza; recarga 0T): Causa 10 de dano espiritual a um inimigo. Marca o alvo por 3 turnos. Se o alvo usar uma técnica de apoio em sua próxima vez: causa 8 de dano de aflição ao próprio alvo e remove 1 recurso inimigo. Ativa uma vez.
- **Ninguém Vem** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a todos os inimigos. Remove 1 recurso da reserva inimiga uma única vez.
- **Quarto sem Retorno** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Se o alvo tem a marca desta preparação: +10 dano.
- **Quarto Inacessível** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Vigia Ausente — Emboscada

Anule uma agressão física para abrir uma chegada que ignora contra-ataques, ou cobre diretamente a abertura exposta.

**Estrutura:** Emboscada após defesa

**Passiva — Vigília Tardia:** Sua primeira habilidade ofensiva do combate causa +6 de dano.

- **Passagem Desguarnecida** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Remove 20 de Defesa antes do dano.
- **Vigia na Sombra** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga física ou perfurante recebida e contra-ataca com 25 de dano. Dura 1 turno. Ao anular uma técnica física ou perfurante, Chegar Depois vira Chegada pela Retaguarda contra o agressor por 2 turnos.
- **Chegar Depois** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Se o alvo está Exposto: +15 dano.
- **Chegada pela Retaguarda** [variação] (1 Cinza + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Não pode ser anulado por Contra-ataque. Se o alvo está Exposto: +15 dano. Após usar, restaura Chegar Depois.
- **Posto Vazio** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Carne

### O que Possui — Possessor

A posse sela ataques por uma ação, mas permite apoio; decida entre interromper a vítima marcada ou drenar sua Vida.

**Estrutura:** Posse da ofensiva

**Passiva — Vontade Parasita:** Após causar dano com uma habilidade, restaura 4 de Vida.

- **Selo da Posse** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano espiritual a um inimigo. Marca o alvo por 3 turnos. Sela técnicas ofensivas por 1 turno do alvo.
- **Nervos Tomados** (1 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Usufruto Vital** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 60% do dano causado. Se o alvo tem a marca desta preparação: +10 dano.
- **Desligar o Corpo** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Pele Alheia — Metamorfa

Assuma uma pele que atravessa redução de dano; descarte-a para recuperar Vida e voltar à forma anterior.

**Estrutura:** Postura reversível

**Passiva — Pele que Aprende:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Lâmina de Epiderme** (1 Cinza; recarga 0T): Causa 20 de dano físico a um inimigo. Remove 10 de Defesa antes do dano.
- **Lâmina da Pele Nova** [variação] (1 Cinza; recarga 0T): Causa 15 de dano perfurante a um inimigo. Remove 15 de Defesa antes do dano.
- **Camada Substituta** (1 Cinza + 1 Essência; recarga 0T): Concede 25 de Defesa destrutível. Remove aflições e condições prejudiciais. Assume a pele nova até usar Descartar a Forma. Troca Lâmina de Epiderme e esta técnica.
- **Descartar a Forma** [variação] (1 Cinza; recarga 0T): Restaura 15 de Vida. Remove aflições e condições prejudiciais. Após usar, restaura Lâmina de Epiderme. Após usar, restaura Camada Substituta.
- **Forma de Retaliação** (1 Cinza + 1 Essência; recarga 0T): Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Anula a próxima habilidade inimiga recebida e contra-ataca com 25 de dano. Dura 1 turno.
- **Troca de Pele** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Desejo Quebrado — Ruptor Vital

Sacrifique Vida para carregar o desejo; o pulso fica mais forte conforme o corpo se aproxima do limite.

**Estrutura:** Desejo de risco

**Passiva — Falta Incurável:** Com 50 de Vida ou menos, suas habilidades causam +6 de dano.

- **Pulso do Desejo** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. A cada 25 de Vida perdida pelo usuário: +4 de dano (máx. +12). Ganha 1 carga (máx. 3). O usuário perde 5 de Vida (não o derrota).
- **Aproximação Dolorosa** (1 Cinza; recarga 1T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Remove 1 recurso da reserva inimiga.
- **Desejo Desfeito** (1 Cinza + 1 Essência; recarga 2T): Causa 25 de dano perfurante a um inimigo. Consome as cargas: +8 de dano por carga.
- **Forma Inalcançável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Marionetista de Nervos — Controladora

Conecte os nervos e escolha entre sustentar o controle por mais uma ação ou romper os fios no desfecho.

**Estrutura:** Controle com ligação

**Passiva — Tensão dos Fios:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Fio Nervoso** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos.
- **Puxar a Vontade** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +5 dano e Atordoa por 1 turno. Se ativar o combo, vira Manter o Comando no próximo turno, apenas contra a mesma vítima. Atordoamento ou Invulnerável quebra a ligação.
- **Manter o Comando** [variação] (1 Cinza + 1 Essência; recarga 3T): Causa 15 de dano físico a um inimigo. Atordoa por 1 turno. Exige a marca desta preparação no alvo. Após usar, restaura Puxar a Vontade.
- **Romper o Comando** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Se o alvo tem a marca desta preparação: +15 dano; consome a preparação.
- **Fios Fora de Fase** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Espelho Carnal — Refletor

A imagem ampara um aliado e devolve parte da próxima agressão que o ferir, sem anular a técnica recebida.

**Estrutura:** Imagem que sente

**Passiva — Dor Refletida:** Ao perder Vida por uma habilidade inimiga, causa 4 de dano de aflição ao agressor.

- **Reflexo de Carne** (1 Cinza; recarga 0T): Causa 15 de dano espiritual a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Imagem de Resposta** (1 Cinza; recarga 0T): Restaura 10 de Vida. Concede 10 de Defesa destrutível. Na próxima resposta adversária, se uma nova habilidade tirar Vida do beneficiado: causa 8 de dano de aflição ao agressor. Ativa uma vez.
- **Rachar o Reflexo** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Remove 20 de Defesa antes do dano. Se o alvo está Exposto: +10 dano.
- **Atrás do Espelho** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Costureira — Cirurgiã

Alterne o cuidado da sutura e sua retirada, preservando a opção de abrir os pontos do inimigo marcado.

**Estrutura:** Ciclo de cuidado

**Passiva — Linha da Reparação:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Ponto de Corte** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Sangramento: 4 de dano de aflição por 2 turnos.
- **Sutura Perfeita** (1 Cinza + 1 Essência; recarga 0T): Restaura 25 de Vida. Remove aflições e condições prejudiciais. No próximo turno, vira Retirar a Sutura: amparo sem nova limpeza.
- **Retirar a Sutura** [variação] (1 Cinza; recarga 0T): Restaura 10 de Vida. Concede 15 de Defesa destrutível. Após usar, restaura Sutura Perfeita.
- **Desfazer os Pontos** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +15 dano; consome a preparação.
- **Costura de Ausência** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Vazio

### O que Apaga — Anulador

Apague as vantagens e escolha qual técnica consumirá a presença marcada do adversário.

**Estrutura:** Apagamento dirigido

**Passiva — Nada se Sustenta:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Traço Apagado** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Remove bônus de dano, redução e contra-ataque do alvo. Vira Ausência Definitiva por 2 turnos, apenas contra o alvo da marca.
- **Ausência Definitiva** [variação] (1 Cinza + 1 Essência; recarga 0T): Causa 25 de dano de aflição a um inimigo. Exige a marca desta preparação no alvo. Se o alvo tem a marca desta preparação: +5 dano; consome a preparação. Após usar, restaura Traço Apagado.
- **Branco sobre a Guarda** (1 Cinza; recarga 0T): Causa 20 de dano físico a um inimigo. Remove 30 de Defesa antes do dano.
- **Extinguir o Traço** (1 Cinza + 1 Essência; recarga 1T): Causa 30 de dano de aflição a um inimigo. Se o alvo tem a marca desta preparação: +10 dano.
- **Fora da Existência** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Ausência — Evasão

Drene um recurso e deixe a ausência cobrar outro se a vítima não usar uma técnica em sua vez.

**Estrutura:** Ausência que cobra espera

**Passiva — Falta de Substância:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Toque Ausente** (1 Cinza; recarga 1T): Causa 10 de dano físico a um inimigo. Se o alvo não usar nenhuma técnica em sua próxima vez: causa 5 de dano de aflição ao próprio alvo e remove 1 recurso inimigo. Ativa uma vez. Remove 1 recurso da reserva inimiga.
- **Ataque a Ninguém** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno.
- **Ausência Contagiosa** (1 Cinza + 1 Essência; recarga 2T): Causa 15 de dano espiritual a todos os inimigos. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Não Estar** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Fim Silencioso — Finalizador

Guarde suas duas sentenças mais fortes para os feridos; depois delas, o silêncio muda de forma.

**Estrutura:** Sentenças limitadas

**Passiva — Último Instante:** Suas habilidades causam +6 de dano se o alvo tem 50 de Vida ou menos.

- **Aviso do Fim** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Cessar da Vontade** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Atordoa por 1 turno. Remove bônus de dano, redução e contra-ataque do alvo.
- **Sem Últimas Palavras** (1 Cinza + 1 Essência; recarga 1T): Causa 30 de dano perfurante a um inimigo. Se o alvo tem 50 de Vida ou menos: +15 dano. Pode ser usada 2 vezes por combate; depois vira Silêncio Residual.
- **Silêncio Residual** [variação] (1 Cinza; recarga 0T): Causa 20 de dano perfurante a um inimigo. Se o alvo tem 50 de Vida ou menos: +5 dano.
- **Instante sem Tempo** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Menino sem Sombra — Sombra Frágil

O refúgio muda quando a Vida baixa; escolha entre usá-lo e gastar a sombra acumulada numa ofensiva arriscada.

**Estrutura:** Refúgio por necessidade

**Passiva — Medo sem Forma:** Com 50 de Vida ou menos, suas habilidades causam +6 de dano.

- **Brincadeira sem Sombra** (1 Cinza; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Refúgio na Falta** (1 Cinza; recarga 0T): Restaura 15 de Vida. Reduz em 10 o dano recebido por 1 turno. Com 50 de Vida ou menos, vira Esconder-se do Sol, com custo e recuperação maiores.
- **Esconder-se do Sol** [variação] (1 Cinza + 1 Essência; recarga 0T): Restaura 20 de Vida. Reduz em 5 o dano recebido por 1 turno. Regeneração: restaura 3 de Vida no início dos próximos 2 turnos do beneficiado.
- **Sol que Não Encontra** (1 Cinza + 1 Essência; recarga 2T): Causa 20 de dano de aflição a um inimigo. Consome as cargas: +9 de dano por carga. O usuário perde 5 de Vida (não o derrota).
- **Infância Invisível** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Última Página — Encerramento

Escreva um nome e raspe a próxima ofensiva da vítima; a conclusão ainda consome a marca da página.

**Estrutura:** Rasura de ações

**Passiva — Parágrafo Final:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Nome na Última Folha** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Rasura do Destino** (1 Cinza + 1 Essência; recarga 2T): Causa 5 de dano físico a um inimigo. Sela técnicas ofensivas por 1 turno do alvo. Remove bônus de dano, redução e contra-ataque do alvo.
- **Fechar a História** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo tem a marca desta preparação: +15 dano; consome a preparação.
- **Margem em Branco** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Lugar de Ninguém — Desolação

O chão corrói e pune a inatividade de cada inimigo; escolha quem receberá o endereço marcado.

**Estrutura:** Território que exige movimento

**Passiva — Habitar o Nada:** No início do seu turno, restaura 3 de Vida.

- **Chão de Ninguém** (1 Cinza + 1 Essência; recarga 1T): Causa 5 de dano físico a todos os inimigos. Decadência: 4 de dano de aflição por 2 turnos. Se o alvo não usar nenhuma técnica em sua próxima vez: causa 5 de dano de aflição ao próprio alvo. Ativa uma vez.
- **Endereço Inexistente** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Engolido pelo Lugar** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Restaura ao usuário 50% do dano causado. Se o alvo tem a marca desta preparação: +10 dano.
- **Território Impossível** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Proteção

### O Escudo Vivo — Protetor

Erga a própria guarda e escolha entre o avanço curto e a Resposta da Égide mais forte.

**Estrutura:** Guarda em avanço

**Passiva — Ficarei Aqui:** No início do seu turno, recebe 5 de Defesa destrutível.

- **Golpe do Bastião** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Concede 10 de Defesa destrutível ao usuário. Vira Avanço da Égide por 2 turnos; usá-lo restaura Golpe do Bastião.
- **Avanço da Égide** [variação] (1 Graça + 1 Essência; recarga 0T): Causa 20 de dano perfurante a um inimigo. Concede 5 de Defesa destrutível ao usuário. Se o usuário tem Defesa: +5 dano. Após usar, restaura Golpe do Bastião.
- **Voto de Amparo** (1 Graça; recarga 0T): Concede 25 de Defesa destrutível. Reduz em 5 o dano recebido por 1 turno.
- **Resposta da Égide** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o usuário tem Defesa: +15 dano.
- **Fortaleza de Luz** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Muralha — Fortificação

Atravessar a guarda de seus aliados reforça sua própria muralha; o avanço gasta cargas e Defesa para romper a linha.

**Estrutura:** Muralha que converge

**Passiva — Pedra sobre Pedra:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Impacto do Baluarte** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Ganha 1 carga (máx. 3).
- **Muralha Partilhada** (1 Graça + 1 Essência; recarga 2T): Concede 18 de Defesa destrutível ao trio. Na próxima resposta adversária, se uma nova habilidade tirar Vida do beneficiado: concede 8 de Defesa ao usuário. Ativa uma vez.
- **Avanço do Bastão** (1 Graça + 1 Essência; recarga 1T): Causa 20 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Acrescenta 25% da Defesa do usuário ao dano (máx. +15) e consome toda a sua Defesa. Consome as cargas: +6 de dano por carga.
- **Além do Baluarte** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O que Ficou — Sacrifício

Deixe recuperação futura com o aliado e sustente a própria resistência até o retorno ofensivo com pouca Vida.

**Estrutura:** Permanência vital

**Passiva — Presença que Sustenta:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Não Recuar** (1 Graça; recarga 0T): Causa 20 de dano físico a um inimigo. Reduz em 5 o dano recebido por 1 turno pelo usuário.
- **Lugar ao Meu Lado** (1 Graça + 1 Essência; recarga 0T): Restaura 10 de Vida. Concede 15 de Defesa destrutível. Regeneração: restaura 5 de Vida no início dos próximos 2 turnos do beneficiado. O usuário perde 5 de Vida (não o derrota).
- **Eu Ainda Estou Aqui** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 30% do dano causado. Se o usuário tem 50 de Vida ou menos: +15 dano.
- **Promessa Inquebrável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Último Guardião — Contra-ataque

Proteja contra técnicas físicas e perfurantes; a vigília marca quem poderá ser interrompido no alvorecer.

**Estrutura:** Guarda contra lâminas

**Passiva — Última Vigília:** Ao perder Vida por uma habilidade inimiga, causa 4 de dano de aflição ao agressor.

- **Lança da Guarda** (1 Graça; recarga 0T): Causa 20 de dano físico a um inimigo. Marca o alvo por 3 turnos.
- **Sentinela de Resposta** (1 Graça + 1 Essência; recarga 0T): Concede 10 de Defesa destrutível. Anula a próxima habilidade inimiga física ou perfurante recebida e contra-ataca com 30 de dano. Dura 1 turno.
- **Alvorecer do Guardião** (1 Graça + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Guarda Inviolável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Sentinela Azul — Guarda Tática

Concentre a linha em um aliado para protegê-lo e reduzir a recarga de suas técnicas não defensivas.

**Estrutura:** Proteção de tempo

**Passiva — Olhar de Vigília:** Suas habilidades causam +4 de dano se o alvo está Exposto.

- **Sinal Azul** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Linha de Proteção** (1 Graça + 1 Essência; recarga 3T): Concede 15 de Defesa destrutível. Reduz em 5 o dano recebido por 1 turno. Reduz em 1 turno as recargas não defensivas do beneficiado.
- **Lança do Horizonte** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo está Exposto: +15 dano.
- **Vigília Intangível** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Cura

### A Mão que Cura — Curadora

Limpar condições prejudiciais também produz Defesa; use a compaixão marcada para recuperar sua própria Vida.

**Estrutura:** Cuidado que recompõe

**Passiva — A Dor é Vista:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Toque da Compaixão** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos.
- **Mãos Restauradoras** (1 Graça + 1 Essência; recarga 0T): Restaura 25 de Vida. Cada condição removida concede 4 de Defesa ao beneficiado (máx. 15). Remove aflições e condições prejudiciais.
- **Reequilibrar a Dor** (1 Graça + 1 Essência; recarga 1T): Causa 20 de dano espiritual a um inimigo. Restaura ao usuário 80% do dano causado. Se o alvo tem a marca desta preparação: +10 dano.
- **Luz sem Ferida** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Restaurador — Restaurador

Prepare Vida até a reserva se tornar uma restauração coletiva mais cara, capaz de limpar o trio.

**Estrutura:** Aprimoramento por reserva

**Passiva — Recomposição Contínua:** No início do seu turno, restaura 4 de Vida.

- **Pulso de Retorno** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Restituir a Forma** (1 Graça + 1 Essência; recarga 0T): Restaura 20 de Vida. Concede 10 de Defesa destrutível. Remove aflições e condições prejudiciais.
- **Reserva Restauradora** (1 Graça + 1 Essência; recarga 0T): Restaura 10 de Vida a cada aliado. Consome as cargas: +5 de cura por carga a cada aliado. Com pelo menos 2 cargas, vira Reserva Imaculada: mais cura e limpeza coletiva, com custo maior.
- **Reserva Imaculada** [variação] (2 Graça + 1 Essência; recarga 0T): Restaura 15 de Vida a cada aliado. Remove aflições e condições prejudiciais. Consome as cargas: +5 de cura por carga a cada aliado.
- **Forma Preservada** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Luz que Restaura — Luz Vital

Reconstruir o fôlego recupera mais Vida em alvos feridos e ainda prepara seu dano no turno seguinte.

**Estrutura:** Luz dos feridos

**Passiva — Claridade que Ampara:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Raio Restaurador** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Reconstruir o Fôlego** (1 Graça + 1 Essência; recarga 0T): Restaura 20 de Vida. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. A cada 25 de Vida faltante do beneficiado: +3 de cura (máx. +9).
- **Aurora Reparadora** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Restaura ao usuário 50% do dano causado. Se o alvo está Exposto: +10 dano.
- **Clarão Imaculado** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Jardineira das Feridas — Cultivo Vital

Repetir a raiz fortalece seus ataques de preparação; Atordoamento interrompe o cultivo e as cargas escolhem cura ou espinhos.

**Estrutura:** Cultivo que amadurece

**Passiva — Jardim da Convalescença:** No início do seu turno, restaura 3 de Vida.

- **Raiz que Cuida** (1 Graça; recarga 0T): Causa 13 de dano espiritual a um inimigo. Cada uso não anulado dá +2 de dano a esta técnica (máx. +8). Atordoamento zera esse bônus. Ganha 1 carga (máx. 3).
- **Flores de Convalescença** (1 Graça + 1 Essência; recarga 0T): Restaura 10 de Vida a cada aliado. Consome as cargas: +6 de cura por carga a cada aliado.
- **Espinhos da Proteção** (1 Graça + 1 Essência; recarga 1T): Causa 20 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Consome as cargas: +7 de dano por carga.
- **Pétalas de Refúgio** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Pulso Sereno — Acalmador

Desarme a agressão: se a vítima ainda atacar, o usuário recupera Vida; a quietude continua sendo o controle mais forte.

**Estrutura:** Serenidade provocada

**Passiva — Ritmo Sereno:** No início do seu turno, recebe 3 de Defesa destrutível.

- **Pulsação Desarmante** (1 Graça; recarga 1T): Causa 10 de dano espiritual a um inimigo. Enfraquece por 2 turnos do alvo: −10 de dano causado. Se o alvo usar uma técnica ofensiva em sua próxima vez: restaura 8 de Vida ao usuário. Ativa uma vez.
- **Respirar Novamente** (1 Graça + 1 Essência; recarga 0T): Restaura 20 de Vida. Reduz em 10 o dano recebido por 1 turno.
- **Quietude Profunda** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano físico a um inimigo. Se o alvo está Enfraquecido: +10 dano e Atordoa por 1 turno.
- **Pausa do Coração** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Justiça

### O Equilíbrio — Equilíbrio

Ofereça amparo e depois converta a misericórdia em um veredito que devolve Vida ao usuário.

**Estrutura:** Amparo e cobrança

**Passiva — Medida Justa:** Suas habilidades causam +4 de dano se o alvo está Exposto.

- **Peso do Excesso** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Prato da Misericórdia** (1 Graça + 1 Essência; recarga 0T): Restaura 20 de Vida. Concede 15 de Defesa destrutível. No próximo turno, vira Reparação do Veredito: dano que restaura Vida ao usuário.
- **Reparação do Veredito** [variação] (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Restaura 10 de Vida ao usuário. Após usar, restaura Prato da Misericórdia.
- **Equação da Justiça** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo está Exposto: +15 dano.
- **Balança Imóvel** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Lâmina Justa — Duelista Justa

O corte ganha precisão ao ser repetido, até um limite; Atordoamento quebra a disciplina, sem apagar sua marca de ofensa.

**Estrutura:** Disciplina da lâmina

**Passiva — Fio do Princípio:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Corte de Princípio** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Cada uso não anulado dá +2 de dano a esta técnica (máx. +8). Atordoamento zera esse bônus.
- **Parada Equânime** (1 Graça + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 25 de dano. Dura 1 turno.
- **Sentença da Lâmina** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo tem a marca desta preparação: +15 dano.
- **Passo Equânime** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O que Pesa — Ponderador

Pese, julgue e recupere o equilíbrio: a decisão abre uma preparação diferente para o próximo ciclo.

**Estrutura:** Ciclo de julgamento

**Passiva — Paciência da Balança:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Pesar os Atos** (1 Graça; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Ganha 1 carga (máx. 3).
- **Prato Ascendente** [variação] (1 Graça + 1 Essência; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos. Concede 10 de Defesa destrutível ao usuário. Ganha 1 carga (máx. 3). Após usar, restaura Pesar os Atos.
- **Reduzir o Excesso** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Decisão Ponderada** (1 Graça + 1 Essência; recarga 3T): Causa 20 de dano físico a um inimigo. Consome as cargas: +6 de dano por carga. Se o alvo tem a marca desta preparação: +5 dano e Atordoa por 1 turno; consome a preparação. Pesar os Atos vira Prato Ascendente por 2 turnos, preparando uma nova decisão com Defesa.
- **Entre os Pratos** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Testemunha Íntegra — Reveladora

A prova pune bônus de dano, redução e contra-ataque ativos antes de removê-los; o registro prepara o testemunho coletivo.

**Estrutura:** Prova contra vantagens

**Passiva — Voz sem Distorção:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Registrar a Verdade** (1 Graça; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Prova Irrefutável** (1 Graça + 1 Essência; recarga 1T): Causa 15 de dano espiritual a um inimigo. Não pode ser anulado por Contra-ataque. Antes da remoção, cada bônus de dano, redução ou contra-ataque ativo no alvo acrescenta 4 ao dano (máx. +12). Remove bônus de dano, redução e contra-ataque do alvo.
- **Testemunho Íntegro** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano espiritual a todos os inimigos. Se o alvo tem a marca desta preparação: +10 dano.
- **Testemunho Protegido** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Julgador Gentil — Julgador de Amparo

Repare Vida e condições enquanto reduz recargas não defensivas; conserve o Enfraquecimento para o limite da clemência.

**Estrutura:** Reparação de tempo

**Passiva — Gentileza Firme:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Advertência Serena** (1 Graça; recarga 0T): Causa 10 de dano físico a um inimigo. Enfraquece por 2 turnos do alvo: −10 de dano causado.
- **Reparação Justa** (1 Graça + 1 Essência; recarga 3T): Restaura 20 de Vida. Reduz em 1 turno as recargas não defensivas do beneficiado. Remove aflições e condições prejudiciais.
- **Limite da Clemência** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano físico a um inimigo. Se o alvo está Enfraquecido: +10 dano e Atordoa por 1 turno.
- **Trégua Inviolável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Esperança

### A Chama que Não Apaga — Perseverança

Recupere o fôlego para reacender um ataque diferente ou guarde as cargas para a aurora.

**Estrutura:** Recomeço ofensivo

**Passiva — Ainda Há Amanhã:** Com 50 de Vida ou menos, suas habilidades causam +6 de dano.

- **Fagulha do Amanhã** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Queimadura: 4 de dano de aflição por 2 turnos. Ganha 1 carga (máx. 3).
- **Chama do Recomeço** [variação] (1 Graça + 1 Essência; recarga 0T): Causa 20 de dano espiritual a um inimigo. Queimadura: 5 de dano de aflição por 2 turnos. Restaura 5 de Vida ao usuário. Após usar, restaura Fagulha do Amanhã.
- **Não se Apagar** (1 Graça; recarga 0T): Restaura 20 de Vida. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Fagulha do Amanhã vira Chama do Recomeço por 2 turnos.
- **Aurora Imorredoura** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Consome as cargas: +7 de dano por carga.
- **Chama Intocável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O que Levanta — Resiliência

Erga um aliado e recupere seu próprio fôlego se ele perder Vida por uma nova habilidade durante a resposta adversária.

**Estrutura:** Alento recíproco

**Passiva — Levantar Outra Vez:** No início do seu turno, restaura 4 de Vida.

- **Passo de Retorno** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Concede 10 de Defesa destrutível ao usuário.
- **Erguer o Companheiro** (1 Graça + 1 Essência; recarga 0T): Restaura 25 de Vida. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Na próxima resposta adversária, se uma nova habilidade tirar Vida do beneficiado: restaura 5 de Vida ao usuário. Ativa uma vez.
- **Enquanto Eu Respirar** (1 Graça + 1 Essência; recarga 1T): Causa 30 de dano físico a um inimigo. Se o usuário tem 50 de Vida ou menos: +10 dano.
- **Instante de Superação** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Voz — Inspiradora

Inicie um hino para marcar vários inimigos com o coro ou encerre-o para recuperar sua própria voz.

**Estrutura:** Postura de coro

**Passiva — Coro de Coragem:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Palavra de Coragem** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos.
- **Coro de Muitas Vozes** [variação] (1 Graça + 1 Essência; recarga 0T): Causa 10 de dano espiritual a todos os inimigos. Marca o alvo por 3 turnos.
- **Hino da Perseverança** (1 Graça + 1 Essência; recarga 0T): Concede 10 de Defesa destrutível ao trio. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Abre Coro de Muitas Vozes até usar Encerrar o Hino.
- **Encerrar o Hino** [variação] (1 Graça; recarga 0T): Restaura 15 de Vida. Após usar, restaura Palavra de Coragem. Após usar, restaura Hino da Perseverança.
- **Não Seremos Calados** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano espiritual a todos os inimigos. Se o alvo tem a marca desta preparação: +10 dano.
- **Nota Inalcançável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Portador da Aurora — Portador

A aurora limpa, fortalece e reduz recargas não defensivas de um aliado; as cargas ainda alimentam o horizonte perfurante.

**Estrutura:** Aurora que adianta

**Passiva — Primeiro Horizonte:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Lança da Primeira Luz** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Carregar a Aurora** (2 Graça + 1 Essência; recarga 3T): Restaura 15 de Vida. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Reduz em 1 turno as recargas não defensivas do beneficiado. Remove aflições e condições prejudiciais.
- **Abrir o Horizonte** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano perfurante a um inimigo. Consome as cargas: +9 de dano por carga.
- **Além do Horizonte** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Mensageira do Amanhã — Mensageira

Envie alento para abrir uma resposta que converte dano em recuperação do aliado mais ferido.

**Estrutura:** Entrega que retorna

**Passiva — Promessa de Chegada:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Sinal do Amanhã** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Mensagem Recebida** [variação] (1 Graça + 1 Essência; recarga 0T): Causa 15 de dano espiritual a um inimigo. Restaura ao aliado proporcionalmente mais ferido 50% do dano real causado (máx. 15 por uso). Após usar, restaura Sinal do Amanhã.
- **Mensagem de Alento** (1 Graça + 1 Essência; recarga 0T): Restaura 20 de Vida. Concede 15 de Defesa destrutível. Sinal do Amanhã vira Mensagem Recebida por 2 turnos: dano que recupera o aliado proporcionalmente mais ferido.
- **O Amanhã Chegou** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo tem a marca desta preparação: +15 dano.
- **Passagem da Mensagem** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Verdade

### O que Revela — Revelador

A luz remove vantagens e expõe mesmo diante de um contra-ataque; Invulnerável ainda impede o alvo.

**Estrutura:** Revelação incontestável

**Passiva — Nada a Esconder:** Suas habilidades causam +5 de dano se o alvo está Exposto.

- **Luz sem Mentira** (1 Graça + 1 Essência; recarga 1T): Causa 10 de dano espiritual a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Não pode ser anulado por Contra-ataque. Remove bônus de dano, redução e contra-ataque do alvo.
- **Clareza Partilhada** (1 Graça + 1 Essência; recarga 0T): Remove aflições e condições prejudiciais.
- **Verdade Incisiva** (1 Graça + 1 Essência; recarga 1T): Causa 30 de dano perfurante a um inimigo. Se o alvo está Exposto: +10 dano.
- **Transparência Absoluta** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Luz Nua — Claridade

A guarda e os bônus do adversário tornam o golpe de despir mais forte; o clarão continua ligado à marca da luz.

**Estrutura:** Vantagens despidas

**Passiva — Sem Disfarce:** Sua primeira habilidade ofensiva do combate causa +4 de dano.

- **Toque da Luz Nua** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos.
- **Despir a Guarda** (1 Graça + 1 Essência; recarga 1T): Causa 10 de dano físico a um inimigo. Não pode ser anulado por Contra-ataque. Antes da remoção, cada bônus de dano, redução ou contra-ataque ativo no alvo acrescenta 3 ao dano (máx. +12). Remove bônus de dano, redução e contra-ataque do alvo. Remove 20 de Defesa antes do dano.
- **Clarão sem Véu** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo tem a marca desta preparação: +15 dano.
- **Feixe Inatingível** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Espelho — Espelhamento

Mostre uma abertura e devolva a intenção: uma agressão ao espelho libera o estilhaço contra seu autor.

**Estrutura:** Reflexo preparado

**Passiva — Reflexo Honesto:** Ao perder Vida por uma habilidade inimiga, causa 4 de dano de aflição ao agressor.

- **Imagem Verdadeira** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Estilhaço Devolvido** [variação] (1 Graça + 1 Essência; recarga 0T): Causa 25 de dano perfurante a um inimigo. Remove bônus de dano, redução e contra-ataque do alvo. Após usar, restaura Imagem Verdadeira.
- **Devolver a Intenção** (1 Graça + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 25 de dano. Dura 1 turno. Se o contra-ataque ativar, Imagem Verdadeira vira Estilhaço Devolvido contra o agressor por 2 turnos.
- **Fratura da Ilusão** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Remove bônus de dano, redução e contra-ataque do alvo. Se o alvo está Exposto: +10 dano.
- **Dentro do Reflexo** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Cartógrafa da Clareza — Cartógrafa

Trace uma abertura e use o atalho para recuperar um aliado, ou preserve a rota para convergir no ataque.

**Estrutura:** Rota de apoio

**Passiva — Rota sem Engano:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Traçar a Abertura** (1 Graça; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Ganha 1 carga (máx. 3). No próximo turno, Caminho Seguro vira Atalho da Clareza: amparo concentrado em um aliado.
- **Caminho Seguro** (1 Graça + 1 Essência; recarga 0T): Concede 12 de Defesa destrutível ao trio. Aumenta em 5 o dano até o fim do próximo turno do beneficiado.
- **Atalho da Clareza** [variação] (1 Graça + 1 Essência; recarga 0T): Restaura 15 de Vida. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Remove aflições e condições prejudiciais. Após usar, restaura Caminho Seguro.
- **Convergência das Rotas** (1 Graça + 1 Essência; recarga 1T): Causa 20 de dano espiritual a um inimigo. Consome as cargas: +8 de dano por carga.
- **Fora das Coordenadas** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Olho Desarmado — Percepção

A leitura enfraquece, expõe e pune a próxima ofensiva da vítima; escolha entre cuidar de um aliado e desarmar o alvo.

**Estrutura:** Intenção observada

**Passiva — Ver sem Ferir:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Olhar Desarmante** (1 Graça; recarga 0T): Causa 5 de dano espiritual a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Se o alvo usar uma técnica ofensiva em sua próxima vez: causa 5 de dano de aflição ao próprio alvo. Ativa uma vez.
- **Cuidar sem Defesa** (1 Graça + 1 Essência; recarga 0T): Restaura 20 de Vida. Remove aflições e condições prejudiciais.
- **Intenção Desvendada** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano físico a um inimigo. Se o alvo está Exposto: +10 dano e Atordoa por 1 turno.
- **Ponto Cego Sereno** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo União

### O Elo Dourado — Vínculo Ofensivo

O laço ofensivo converte parte do dano real em recuperação do aliado mais ferido, além de marcar a corrente final.

**Estrutura:** Vínculo que distribui Vida

**Passiva — Força Compartilhada:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Laço do Elo** (1 Graça; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Restaura ao aliado proporcionalmente mais ferido 50% do dano real causado (máx. 15 por uso).
- **Promessa de Combate** (1 Graça + 1 Essência; recarga 0T): Concede 10 de Defesa destrutível ao trio. Aumenta em 5 o dano até o fim do próximo turno do beneficiado.
- **Corrente Dourada** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo tem a marca desta preparação: +15 dano.
- **Elo Inquebrável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A que Une — Vínculo Vital

Reconstrua os fragmentos com limpeza, guarda e recuperação futura; escolha o amparo concentrado ou o fôlego coletivo.

**Estrutura:** União duradoura

**Passiva — Cuidar em Conjunto:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Fio de Encontro** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Restaura ao usuário 50% do dano causado.
- **Reunir os Fragmentos** (1 Graça + 1 Essência; recarga 0T): Restaura 15 de Vida. Concede 10 de Defesa destrutível. Regeneração: restaura 4 de Vida no início dos próximos 2 turnos do beneficiado. Remove aflições e condições prejudiciais.
- **Fôlego Coletivo** (1 Graça + 1 Essência; recarga 0T): Restaura 15 de Vida a cada aliado. Aumenta em 5 o dano até o fim do próximo turno do beneficiado.
- **Entrelaçar de Luz** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Vínculo — Guarda de Aliança

Uma agressão é anulada pelo pacto; se outra ferir o aliado, ele e o usuário recuperam Vida, sem duplicar se forem a mesma alma.

**Estrutura:** Pacto de retorno

**Passiva — Pacto de Permanência:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Selo do Pacto** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Responder pelo Outro** (1 Graça + 1 Essência; recarga 0T): Concede 15 de Defesa destrutível. Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno. Na próxima resposta adversária, se uma nova habilidade tirar Vida do beneficiado: restaura 6 de Vida ao usuário e ao beneficiado, uma vez por alma. Ativa uma vez.
- **Resposta da Aliança** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 30% do dano causado. Se o alvo está Exposto: +10 dano.
- **Laço Intangível** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### Os Três Irmãos — Trio em Harmonia

Alterne três vozes no mesmo espaço: ataque, amparo e desfecho, sem perder as outras opções do trio.

**Estrutura:** Cadeia de três técnicas

**Passiva — Passo de Irmandade:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Primeira Cadência** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Ganha 1 carga (máx. 3). Vira Segunda Voz por 2 turnos; ela abre Terceira Voz por mais 2 turnos.
- **Segunda Voz** [variação] (1 Graça; recarga 0T): Restaura 15 de Vida. Ganha 1 carga (máx. 3). Abre Terceira Voz por 2 turno(s).
- **Terceira Voz** [variação] (1 Graça + 1 Essência; recarga 0T): Causa 20 de dano físico a um inimigo. Consome as cargas: +5 de dano por carga. Após usar, restaura Primeira Cadência.
- **Segunda Cadência** (1 Graça + 1 Essência; recarga 0T): Concede 12 de Defesa destrutível ao trio. Ganha 1 carga (máx. 3).
- **Terceira Cadência** (2 Graça + 1 Essência; recarga 2T): Causa 15 de dano físico a todos os inimigos. Consome as cargas: +5 de dano por carga.
- **Passo em Uníssono** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Guardiã das Promessas — Guardiã de Pactos

Se uma nova habilidade ferir quem você protegeu, o cuidado muda para Cumprir a Palavra por 2 turnos.

**Estrutura:** Promessa provada

**Passiva — Promessa Cumprida:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Juramento Gravado** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos.
- **Guardar a Palavra** (1 Graça + 1 Essência; recarga 0T): Restaura 10 de Vida. Concede 25 de Defesa destrutível. Na próxima resposta adversária, se uma nova habilidade tirar Vida do beneficiado: abre uma técnica alternativa para o usuário por 2 turnos. Ativa uma vez.
- **Cumprir a Palavra** [variação] (1 Graça + 1 Essência; recarga 0T): Restaura 25 de Vida. Remove aflições e condições prejudiciais. Após usar, restaura Guardar a Palavra.
- **Cobrança do Juramento** (1 Graça + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Pacto Inviolável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Criação

### O que Cria — Artífice

Crie amparo para abrir uma forma perfurante; escolha entre ela e a Obra Convergente para gastar as cargas.

**Estrutura:** Construção alternativa

**Passiva — Ideia Persistente:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Fragmento Nascente** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Forma que Rompe** [variação] (1 Graça + 1 Essência; recarga 0T): Causa 25 de dano perfurante a um inimigo. Consome as cargas: +3 de dano por carga. Após usar, restaura Fragmento Nascente.
- **Forma de Amparo** (1 Graça; recarga 0T): Concede 20 de Defesa destrutível. Ganha 1 carga (máx. 3). Fragmento Nascente vira Forma que Rompe por 2 turnos.
- **Obra Convergente** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano espiritual a um inimigo. Consome as cargas: +9 de dano por carga.
- **Forma Impossível** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Semente — Germinação

A semente amadurece com as cargas: colha amparo para si ou conserve a marca para germinar no inimigo.

**Estrutura:** Amadurecimento

**Passiva — Potência Latente:** No início do seu turno, restaura 3 de Vida.

- **Semente da Ruptura** (1 Graça; recarga 0T): Causa 10 de dano espiritual a um inimigo. Marca o alvo por 3 turnos. Ganha 1 carga (máx. 3). Com 3 cargas, vira Fruto do Porvir: gaste a reserva em cuidado pessoal ou use outra técnica.
- **Fruto do Porvir** [variação] (1 Graça + 1 Essência; recarga 0T): Restaura 20 de Vida. Concede 10 de Defesa destrutível. Consome todas as cargas.
- **Abrigo do Broto** (1 Graça + 1 Essência; recarga 0T): Restaura 15 de Vida. Concede 10 de Defesa destrutível. Consome as cargas: +5 de cura por carga.
- **Germinar por Dentro** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Se o alvo tem a marca desta preparação: +15 dano; consome a preparação.
- **Casulo de Origem** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Cultivador — Cultivador

Arar a alma já recupera o aliado mais ferido; acumule reservas para escolher a colheita coletiva ou os ramos ofensivos.

**Estrutura:** Cultivo partilhado

**Passiva — Ciclo da Colheita:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Arar a Alma** (1 Graça; recarga 0T): Causa 10 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Restaura ao aliado proporcionalmente mais ferido 40% do dano real causado (máx. 15 por uso). Ganha 1 carga (máx. 3).
- **Colheita de Fôlego** (1 Graça + 1 Essência; recarga 0T): Restaura 10 de Vida a cada aliado. Consome as cargas: +6 de cura por carga a cada aliado.
- **Ramos da Resposta** (1 Graça + 1 Essência; recarga 1T): Causa 20 de dano físico a um inimigo. Remove 15 de Defesa antes do dano. Consome as cargas: +8 de dano por carga.
- **Abrigo das Raízes** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Arquiteta Verde — Arquiteta

Erga a abóbada para abrir amparo concentrado ou um colapso coletivo que consome sua guarda.

**Estrutura:** Arquitetura de escolhas

**Passiva — Fundação Viva:** No início do seu turno, recebe 5 de Defesa destrutível.

- **Pilar Ascendente** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Viga de Apoio** [variação] (1 Graça; recarga 0T): Concede 15 de Defesa destrutível. Regeneração: restaura 3 de Vida no início dos próximos 2 turnos do beneficiado. Após usar, restaura Pilar Ascendente.
- **Abóbada Verde** (1 Graça + 1 Essência; recarga 0T): Concede 18 de Defesa destrutível ao trio. Abre Viga de Apoio e Colapsar a Abóbada por 2 turnos. O colapso encerra as duas variações e gasta sua Defesa.
- **Convergência dos Pilares** (1 Graça + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Colapsar a Abóbada** [variação] (2 Graça + 1 Essência; recarga 2T): Causa 20 de dano físico a todos os inimigos. Acrescenta 25% da Defesa do usuário ao dano (máx. +10) e consome toda a sua Defesa. Após usar, restaura Pilar Ascendente. Após usar, restaura Convergência dos Pilares.
- **Geometria Intocável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Primeiro Canto — Cantor da Origem

O refrão encurta as recargas não defensivas do trio; escolha quando pagar seu custo e quando gastar as cargas no canto.

**Estrutura:** Cadência que adianta

**Passiva — Eco de Nascimento:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Nota Primordial** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Refrão da Vida** (2 Graça + 1 Essência; recarga 3T): Restaura 8 de Vida a cada aliado. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Reduz em 1 turno as recargas não defensivas do beneficiado.
- **Canto que Abre o Mundo** (2 Graça + 1 Essência; recarga 2T): Causa 15 de dano espiritual a todos os inimigos. Consome as cargas: +5 de dano por carga.
- **Pausa Anterior ao Som** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Correntes Quebradas

### O Passo Interrompido — Duelista Temporal

Percorra uma sequência de três passos contra a mesma vítima ou gaste suas cargas no Golpe Descontínuo.

**Estrutura:** Sequência temporal

**Passiva — Passo que Retorna:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Fissura do Passo** (1 Ruptura; recarga 0T): Causa 15 de dano perfurante a um inimigo. Marca o alvo por 3 turnos. Ganha 1 carga (máx. 3). Vira Passo Seguinte contra a mesma vítima por 2 turnos; ele abre Passo Anterior por 1 turno.
- **Passo Seguinte** [variação] (1 Ruptura + 1 Essência; recarga 0T): Causa 20 de dano perfurante a um inimigo. Ganha 1 carga (máx. 3). Abre Passo Anterior por 1 turno(s).
- **Passo Anterior** [variação] (1 Ruptura; recarga 0T): Causa 15 de dano espiritual a um inimigo. Enfraquece por 2 turnos do alvo: −10 de dano causado. Após usar, restaura Fissura do Passo.
- **Entre Dois Instantes** (1 Ruptura + 1 Essência; recarga 2T): Causa 15 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Golpe Descontínuo** (1 Ruptura + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Consome as cargas: +8 de dano por carga. O usuário perde 5 de Vida (não o derrota).
- **Passo Fora do Tempo** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Linha Partida — Ruptura de Vínculos

Abra uma extremidade no inimigo e escolha entre reatar o fio para proteger ou puxar seu fim para atacar.

**Estrutura:** Ruptura e reparação

**Passiva — Tensão da Ruptura:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Extremidade Solta** (1 Ruptura; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Remove 15 de Defesa antes do dano. No próximo turno, vira Reatar a Linha: transforme a ruptura em proteção para um aliado.
- **Reatar a Linha** [variação] (1 Ruptura; recarga 0T): Concede 15 de Defesa destrutível. Remove aflições e condições prejudiciais. Após usar, restaura Extremidade Solta.
- **Nó de Emergência** (1 Ruptura; recarga 0T): Restaura 20 de Vida. Concede 10 de Defesa destrutível. O usuário perde 5 de Vida (não o derrota).
- **Puxar o Fim da Linha** (1 Ruptura + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Se o alvo tem a marca desta preparação: +15 dano. O usuário perde 5 de Vida (não o derrota).
- **Linha Inalcançável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Eco sem Dono — Eco Errante

Colete ecos e devolva uma agressão para abrir uma ressonância coletiva que dispensa o sacrifício de Vida.

**Estrutura:** Ressonância reativa

**Passiva — Ressonância sem Dono:** Ao perder Vida por uma habilidade inimiga, causa 3 de dano de aflição ao agressor.

- **Eco Residual** (1 Ruptura; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Devolver a Voz** (1 Ruptura + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno. Se o contra-ataque ativar, Coro sem Origem vira Ressonância Roubada por 2 turnos, sem custo de Vida.
- **Coro sem Origem** (2 Ruptura + 1 Essência; recarga 2T): Causa 15 de dano espiritual a todos os inimigos. Consome as cargas: +5 de dano por carga. O usuário perde 5 de Vida (não o derrota).
- **Ressonância Roubada** [variação] (2 Ruptura + 1 Essência; recarga 2T): Causa 15 de dano espiritual a todos os inimigos. Consome as cargas: +5 de dano por carga. Após usar, restaura Coro sem Origem.
- **Eco Intangível** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Porta que Flutua — Travessia

Proteja quem atravessa para abrir um retorno de amparo; escolha essa volta ou feche a passagem no inimigo marcado.

**Estrutura:** Travessia de volta

**Passiva — Limite Suspenso:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Abertura Impossível** (1 Ruptura; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Passagem de Retorno** [variação] (1 Ruptura; recarga 0T): Restaura 10 de Vida. Concede 10 de Defesa destrutível. Após usar, restaura Abertura Impossível.
- **Travessia Segura** (1 Ruptura + 1 Essência; recarga 0T): Concede 25 de Defesa destrutível. Remove aflições e condições prejudiciais. No próximo turno, Abertura Impossível vira Passagem de Retorno para amparar um aliado.
- **Fechar a Passagem** (1 Ruptura + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo tem a marca desta preparação: +10 dano. O usuário perde 5 de Vida (não o derrota).
- **Do Outro Lado** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Nome Esquecido — Esquecimento

O nome perdido drena agora e deixa uma cobrança para o próximo apoio da vítima; apagar a forma prepara o desfecho de aflição.

**Estrutura:** Nome que cobra amparo

**Passiva — Nome que se Dissolve:** No início do seu turno, restaura 3 de Vida.

- **Sílaba Perdida** (1 Ruptura; recarga 1T): Causa 5 de dano físico a um inimigo. Marca o alvo por 3 turnos. Se o alvo usar uma técnica de apoio em sua próxima vez: causa 5 de dano de aflição ao próprio alvo e remove 1 recurso inimigo. Ativa uma vez. Remove 1 recurso da reserva inimiga.
- **Esquecer a Forma** (1 Ruptura; recarga 0T): Causa 15 de dano espiritual a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Remove bônus de dano, redução e contra-ataque do alvo.
- **Ninguém Responde** (1 Ruptura + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Se o alvo tem a marca desta preparação: +15 dano. O usuário perde 5 de Vida (não o derrota).
- **Nome Fora da Memória** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Relógio Afogado — Tempo Submerso

Acumule segundos e pare um alvo para abrir uma janela curta de descarga concentrada.

**Estrutura:** Janela de execução

**Passiva — Tempo em Reserva:** No início do seu turno, recebe 3 de Defesa destrutível.

- **Segundo Afogado** (1 Ruptura; recarga 0T): Causa 15 de dano espiritual a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Ganha 1 carga (máx. 3).
- **Ponteiro Imóvel** (1 Ruptura + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Atordoa por 1 turno. No próximo turno, Devolver os Segundos vira Retomar o Instante contra o alvo interrompido.
- **Devolver os Segundos** (1 Ruptura + 1 Essência; recarga 2T): Causa 20 de dano espiritual a um inimigo. Consome as cargas: +10 de dano por carga. O usuário perde 8 de Vida (não o derrota).
- **Retomar o Instante** [variação] (2 Ruptura + 1 Essência; recarga 2T): Causa 35 de dano espiritual a um inimigo. Consome as cargas: +5 de dano por carga. O usuário perde 5 de Vida (não o derrota). Após usar, restaura Devolver os Segundos.
- **Instante Submerso** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Asa Invertida — Inversão

Devolva uma agressão física para abrir um golpe que sela a ofensiva do agressor; o Enfraquecimento ainda prepara a queda.

**Estrutura:** Inversão de impulso

**Passiva — Queda Ascendente:** Suas habilidades causam +5 de dano se o alvo está Enfraquecido.

- **Pena ao Contrário** (1 Ruptura; recarga 0T): Causa 10 de dano físico a um inimigo. Enfraquece por 2 turnos do alvo: −10 de dano causado.
- **Peso da Asa** [variação] (1 Ruptura + 1 Essência; recarga 2T): Causa 15 de dano espiritual a um inimigo. Sela técnicas ofensivas por 1 turno do alvo. Após usar, restaura Pena ao Contrário.
- **Voo Reverso** (1 Ruptura + 1 Essência; recarga 0T): Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Anula a próxima habilidade inimiga física ou perfurante recebida e contra-ataca com 20 de dano. Dura 1 turno. Ao anular uma técnica física ou perfurante, Pena ao Contrário vira Peso da Asa contra o agressor por 2 turnos.
- **Cair para o Alto** (1 Ruptura + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo está Enfraquecido: +15 dano. O usuário perde 5 de Vida (não o derrota).
- **Asa Fora do Plano** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Andarilho de Vidro — Vidro Errante

Cada pegada reforça a próxima até um limite; Atordoamento rompe a sequência, enquanto a travessia final ainda cobra sua integridade.

**Estrutura:** Trilha de estilhaços

**Passiva — Luz nas Fissuras:** Com 50 de Vida ou menos, suas habilidades causam +6 de dano.

- **Pegada de Vidro** (1 Ruptura; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Sangramento: 4 de dano de aflição por 2 turnos. Cada uso não anulado dá +2 de dano a esta técnica (máx. +6). Atordoamento zera esse bônus.
- **Reflexo do Andarilho** (1 Ruptura + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 25 de dano. Dura 1 turno.
- **Travessia Estilhaçada** (1 Ruptura + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo tem a marca desta preparação: +15 dano. O usuário perde 8 de Vida (não o derrota).
- **Passo Transparente** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Sombra Inconstante — Sombra Mutável

Entre num contorno de abrigo para recuperar-se e contra-atacar, depois retome a sombra para voltar a marcar e drenar.

**Estrutura:** Sombra que se recolhe

**Passiva — Fome da Penumbra:** Após causar dano com uma habilidade, restaura 4 de Vida.

- **Sombra Atrás da Alma** (1 Ruptura; recarga 1T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Rouba 1 recurso da reserva inimiga.
- **Fingir Presença** [variação] (1 Ruptura; recarga 0T): Restaura 10 de Vida. Anula a próxima habilidade inimiga recebida e contra-ataca com 10 de dano. Dura 1 turno.
- **Mudar de Contorno** (1 Ruptura; recarga 0T): Restaura 15 de Vida. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Remove aflições e condições prejudiciais. Assume uma postura de abrigo: troca o primeiro golpe por Fingir Presença até usar Retomar a Sombra.
- **Retomar a Sombra** [variação] (1 Ruptura; recarga 0T): Restaura 10 de Vida. Remove aflições e condições prejudiciais. Após usar, restaura Sombra Atrás da Alma. Após usar, restaura Mudar de Contorno.
- **A Sombra se Fecha** (1 Ruptura + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Se o alvo tem a marca desta preparação: +15 dano. O usuário perde 5 de Vida (não o derrota).
- **Contorno Imaterial** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Ponte Rasgada — Ruptor de Passagens

Quem atravessa a proteção da ponte revela uma abertura; aproveite-a na travessia coletiva antes que desapareça.

**Estrutura:** Ponte de contragolpe

**Passiva — Vão Persistente:** Suas habilidades causam +4 de dano se o alvo está Exposto.

- **Romper o Apoio** (1 Ruptura; recarga 0T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Remove 20 de Defesa antes do dano.
- **Ponte de Emergência** (1 Ruptura + 1 Essência; recarga 0T): Concede 15 de Defesa destrutível ao trio. Na próxima resposta adversária, se uma nova habilidade tirar Vida do beneficiado: expõe o agressor até o fim do próximo turno do usuário. Ativa uma vez. O usuário perde 5 de Vida (não o derrota).
- **Queda da Travessia** (2 Ruptura + 1 Essência; recarga 2T): Causa 15 de dano perfurante a todos os inimigos. Se o alvo está Exposto: +10 dano. O usuário perde 5 de Vida (não o derrota).
- **Entre as Margens** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Alma em Suspenso — Suspensão Vital

Acumule o limiar para emprestar fôlego a um aliado ou solte a âncora num desfecho de aflição.

**Estrutura:** Suspensão partilhada

**Passiva — Fôlego no Limiar:** No início do seu turno, restaura 4 de Vida.

- **Pulso Suspenso** (1 Ruptura; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3). Com 3 cargas, vira Fôlego Emprestado: gaste a reserva para recuperar um aliado ou use a descarga ofensiva.
- **Fôlego Emprestado** [variação] (1 Ruptura + 1 Essência; recarga 0T): Restaura 25 de Vida. Regeneração: restaura 4 de Vida no início dos próximos 2 turnos do beneficiado. Consome todas as cargas.
- **Prender o Último Fôlego** (1 Ruptura + 1 Essência; recarga 0T): Restaura 20 de Vida. Concede 15 de Defesa destrutível. O usuário perde 5 de Vida (não o derrota).
- **Soltar a Âncora** (1 Ruptura + 1 Essência; recarga 2T): Causa 20 de dano de aflição a um inimigo. Consome as cargas: +9 de dano por carga. O usuário perde 5 de Vida (não o derrota).
- **Suspensão Absoluta** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

