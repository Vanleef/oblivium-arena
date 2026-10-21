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
- Técnicas em área com maior potencial de explosão custam 3 recursos. Custos aparecem no jogo como quadrados coloridos.

## Referências de estrutura

- https://naruto-arena.online/the-basics/
- https://soul-arena.io/the-basics

Os kits usam as identidades e os conceitos do PMA. Compartilhar palavras-chave e arquétipos é intencional; nomes diferentes, por si só, não demonstram diversidade nem equilíbrio. Testes cobrem a execução de cada combo, custos, uso de marcas e cargas, durações e a quarta defesa. O ajuste fino entre equipes e dificuldades depende de partidas e iterações de balanceamento.

## Elo Sangria

### O Açougueiro — Executor

Abra um sangramento e consuma a ferida no golpe final.

**Passiva — Faro de Sangue:** Suas habilidades causam +5 de dano se o alvo está com Sangramento.

- **Incisão de Abate** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Sangramento: 5 de dano de aflição por 2 turnos.
- **Separar Tendões** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Atordoa por 1 turno.
- **Sentença do Cutelo** (1 Cinza + 1 Essência; recarga 1T): Causa 30 de dano físico a um inimigo. Se o alvo está com Sangramento: +15 dano; consome a preparação.
- **Passo entre Lâminas** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Viúva Escarlate — Duelista

O fio escarlate expõe a vítima; a viúva rouba Vida quando cobra sua promessa.

**Passiva — Luto Faminto:** Após causar dano com uma habilidade, restaura 4 de Vida.

- **Fio Escarlate** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Véu da Viúva** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno.
- **Beijo da Última Noite** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 50% do dano causado. Se o alvo tem a marca desta preparação: +15 dano.
- **Véu de Sangue** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Colecionador de Cabeças — Caçador

Acumule troféus com ataques e gaste as cargas para uma execução concentrada.

**Passiva — Primeiro Troféu:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Laço de Caça** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Ganha 1 carga (máx. 3).
- **Cobrança do Caçador** (1 Cinza; recarga 0T): Causa 20 de dano físico a um inimigo. Remove 15 de Defesa antes do dano.
- **Galeria de Troféus** (1 Cinza + 1 Essência; recarga 2T): Causa 20 de dano físico a um inimigo. Consome as cargas: +8 de dano por carga.
- **Sombra do Colecionador** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### Gêmeos do Cutelo — Ruptor

Dois cortes alternam pressão e exposição; a execução ganha força contra uma abertura.

**Passiva — Ritmo dos Gêmeos:** Suas habilidades causam +4 de dano se o alvo está Exposto.

- **Cutelo da Esquerda** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Cutelo da Direita** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Sangramento: 4 de dano de aflição por 2 turnos.
- **Encontro das Lâminas** (2 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a todos os inimigos. Se o alvo está Exposto: +10 dano.
- **Dança Cruzada** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Carrasco sem Rosto — Sentenciador

Marque a sentença e interrompa a resistência antes de executar um alvo ferido.

**Passiva — Sem Apelação:** Suas habilidades causam +5 de dano se o alvo está Atordoado.

- **Sentença sem Nome** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Queda da Guilhotina** (1 Cinza + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Última Respiração** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Se o alvo tem 50 de Vida ou menos: +20 dano.
- **Capuz do Esquecimento** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Mãe Rubra — Sustentação

Converta feridas em proteção e sacrifique a própria Vida para alimentar o trio.

**Passiva — Sangue que Acolhe:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Cordão Rubro** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Restaura ao usuário 50% do dano causado.
- **Partilha da Mãe** (1 Cinza; recarga 0T): Restaura 20 de Vida. Concede 10 de Defesa destrutível. O usuário perde 5 de Vida (não o derrota).
- **Berço de Sangue** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a todos os inimigos. Sangramento: 4 de dano de aflição por 2 turnos.
- **Casulo Rubro** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Coroa

### O Soberano Quebrado — Dominador

Um decreto marca a vítima; o domínio transforma a marca em interrupção.

**Passiva — Autoridade Estilhaçada:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Decreto do Rei Caído** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos.
- **Ajoelhar** (1 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Coroa sobre Ruínas** (1 Cinza + 1 Essência; recarga 0T): Concede 25 de Defesa destrutível. Aumenta em 5 o dano até o fim do próximo turno do beneficiado.
- **Trono Interior** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Juíza de Ferro — Controladora

A acusação revela excessos; a sentença pune quem permanece exposto.

**Passiva — Peso da Lei:** Suas habilidades causam +5 de dano se o alvo está Exposto.

- **Acusação de Ferro** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Audiência Suspensa** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Atordoa por 1 turno. Remove 10 de Defesa antes do dano.
- **Veredito Irrecorrível** (1 Cinza + 1 Essência; recarga 1T): Causa 30 de dano perfurante a um inimigo. Se o alvo está Exposto: +10 dano.
- **Sala Inviolável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Trono Vazio — Estrategista

Prepare um contra-ataque e use o vácuo da autoridade para proteger os aliados.

**Passiva — Presença sem Corpo:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Vontade do Assento Vazio** (1 Cinza; recarga 0T): Causa 20 de dano espiritual a um inimigo.
- **Edicto de Interdição** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno.
- **Domínio sem Rei** (1 Cinza + 1 Essência; recarga 0T): Concede 15 de Defesa destrutível ao trio. Aumenta em 5 o dano até o fim do próximo turno do beneficiado.
- **Palácio Inatingível** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Príncipe das Correntes — Carcereiro

A corrente prende a vítima; cada elo preparado aumenta a pressão do cárcere.

**Passiva — Grilhão Herdado:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Primeiro Grilhão** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Ganha 1 carga (máx. 3).
- **Arrasto do Príncipe** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Cárcere Dinástico** (1 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a um inimigo. Atordoa por 1 turno. Consome as cargas: +8 de dano por carga.
- **Corrente Exterior** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Regente de Cinzas — Comandante

Fortaleça o trio enquanto cinzas corrosivas preparam uma ordem de execução.

**Passiva — Lealdade pelo Medo:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Ordem em Cinzas** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Queimadura: 4 de dano de aflição por 2 turnos.
- **Comando da Regente** (1 Cinza + 1 Essência; recarga 0T): Concede 10 de Defesa destrutível ao trio. Aumenta em 5 o dano até o fim do próximo turno do beneficiado.
- **Purgar a Rebelião** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Remove 15 de Defesa antes do dano. Se o alvo está com Queimadura: +15 dano.
- **Manto da Regência** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Herdeiro Cativo — Rebelde

Resista com pouca Vida e converta o peso da prisão em uma ruptura ofensiva.

**Passiva — Vontade Cativa:** Com 50 de Vida ou menos, suas habilidades causam +6 de dano.

- **Punho Acorrentado** (1 Cinza; recarga 0T): Causa 20 de dano físico a um inimigo. Ganha 1 carga (máx. 3).
- **Aguentar o Decreto** (1 Cinza; recarga 0T): Restaura 15 de Vida. Reduz em 10 o dano recebido por 1 turno.
- **Sucessão Rompida** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Consome as cargas: +8 de dano por carga. O usuário perde 5 de Vida (não o derrota).
- **Brecha na Cela** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Mentira

### O Sussurro — Sabotador

Uma palavra venenosa prepara o próximo sussurro para roubar recursos.

**Passiva — Segredo em Circulação:** Suas habilidades causam +4 de dano se o alvo está com Veneno.

- **Palavra Envenenada** (1 Cinza; recarga 0T): Causa 10 de dano espiritual a um inimigo. Veneno: 5 de dano de aflição por 3 turnos.
- **Segredo Cobrado** (1 Cinza + 1 Essência; recarga 1T): Causa 20 de dano físico a um inimigo. Rouba 1 recurso da reserva inimiga. Se o alvo está com Veneno: +10 dano.
- **Aviso Falso** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 15 de dano. Dura 1 turno.
- **Voz sem Origem** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Máscara Dupla — Ilusionista

Alterne entre marcar um alvo e desarmar sua tentativa de resposta.

**Passiva — Segundo Rosto:** Após causar dano com uma habilidade, restaura 3 de Vida.

- **Rosto Emprestado** (1 Cinza; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos.
- **O Outro Rosto** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 25 de dano. Dura 1 turno.
- **Traição Revelada** (1 Cinza + 1 Essência; recarga 2T): Causa 20 de dano físico a um inimigo. Rouba 1 recurso da reserva inimiga. Se o alvo tem a marca desta preparação: +15 dano; consome a preparação.
- **Troca de Máscara** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Tecelão de Mentiras — Manipulador

Tecidos de engano enfraquecem o grupo; o nó central pune um alvo preso à trama.

**Passiva — Trama Paciente:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Fio de Engano** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Rede de Falsidades** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a todos os inimigos. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Nó da Contradição** (1 Cinza + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Fora da Trama** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Boca de Vidro — Atiradora

Estilhaços passam pela redução de dano; a exposição amplifica o discurso final.

**Passiva — Verdade Fraturada:** Suas habilidades causam +4 de dano se o alvo está Exposto.

- **Sílaba Cortante** (1 Cinza; recarga 0T): Causa 20 de dano perfurante a um inimigo.
- **Confissão Rachada** (1 Cinza; recarga 1T): Causa 10 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Remove 1 recurso da reserva inimiga.
- **Discurso em Estilhaços** (2 Cinza + 1 Essência; recarga 2T): Causa 20 de dano perfurante a todos os inimigos. Se o alvo está Exposto: +10 dano.
- **Reflexo da Boca** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Falso Profeta — Corruptor

Uma promessa marca o adversário; a falsa bênção mantém o usuário enquanto o culto cresce.

**Passiva — Fé Desviada:** No início do seu turno, restaura 3 de Vida.

- **Promessa do Profeta** (1 Cinza; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos.
- **Bênção Falsa** (1 Cinza; recarga 0T): Restaura 20 de Vida. Ganha 1 carga (máx. 3).
- **Milagre Fabricado** (1 Cinza + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Consome as cargas: +5 de dano por carga. Se o alvo tem a marca desta preparação: +10 dano.
- **Imagem Sagrada** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Corretor de Memórias — Ladrão de Memórias

Apague a guarda e cobre a lembrança marcada em forma de recursos e dano.

**Passiva — Arquivo Roubado:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Lembrança Hipotecada** (1 Cinza; recarga 1T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Rouba 1 recurso da reserva inimiga.
- **Esquecer a Defesa** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Remove bônus de dano, redução e contra-ataque do alvo. Remove 25 de Defesa antes do dano.
- **Liquidação do Passado** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo tem a marca desta preparação: +15 dano.
- **Memória Substituta** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Chama

### O Incendiário — Incendiário

Espalhe queimaduras e consuma a combustão para uma explosão concentrada.

**Passiva — Pavio Aceso:** Suas habilidades causam +4 de dano se o alvo está com Queimadura.

- **Pavio de Ódio** (1 Cinza; recarga 0T): Causa 15 de dano espiritual a um inimigo. Queimadura: 5 de dano de aflição por 2 turnos.
- **Fagulhas em Cadeia** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a todos os inimigos. Queimadura: 4 de dano de aflição por 2 turnos.
- **Detonação Negra** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo está com Queimadura: +15 dano; consome a preparação.
- **Corpo de Fumaça** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Brasa Eterna — Controladora de Chamas

Mantenha a chama no alvo e interrompa sua ação enquanto a brasa se fortalece.

**Passiva — Calor Persistente:** Suas habilidades causam +5 de dano se o alvo está com Queimadura.

- **Brasa que Permanece** (1 Cinza; recarga 0T): Causa 15 de dano espiritual a um inimigo. Queimadura: 5 de dano de aflição por 3 turnos.
- **Sufoco das Cinzas** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Se o alvo está com Queimadura: +5 dano e Atordoa por 1 turno.
- **Fornalha Interior** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3). Por carga: +5 de dano por carga.
- **Manto de Cinzas** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Ódio Encarnado — Berserker

Ferir a si próprio aumenta a pressão; a fúria atinge o auge quando a Vida baixa.

**Passiva — Raiva sem Freio:** Com 50 de Vida ou menos, suas habilidades causam +7 de dano.

- **Punho de Rancor** (1 Cinza; recarga 0T): Causa 25 de dano físico a um inimigo. O usuário perde 5 de Vida (não o derrota).
- **Alimentar o Ódio** (1 Cinza; recarga 0T): Concede 10 de Defesa destrutível. Aumenta em 10 o dano até o fim do próximo turno do beneficiado. O usuário perde 5 de Vida (não o derrota).
- **Explosão do Ressentimento** (1 Cinza + 1 Essência; recarga 1T): Causa 30 de dano espiritual a um inimigo. Se o usuário tem 50 de Vida ou menos: +15 dano. O usuário perde 5 de Vida (não o derrota).
- **Fúria Intocável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Filho da Cinza — Sobrevivente

Guarde calor com golpes pequenos e use as cinzas para recuperar o corpo.

**Passiva — Debaixo das Cinzas:** No início do seu turno, restaura 4 de Vida.

- **Carvão Oculto** (1 Cinza; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Recompor-se da Cinza** (1 Cinza; recarga 0T): Restaura 15 de Vida. Consome as cargas: +7 de cura por carga.
- **Renascer em Chamas** (1 Cinza + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Queimadura: 5 de dano de aflição por 2 turnos. Remove aflições e condições prejudiciais do usuário.
- **Dissolução em Cinzas** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Pira Errante — Cerco

Prepare uma pira lenta, espalhe o fogo e elimine a guarda do alvo em combustão.

**Passiva — Lenha da Travessia:** No início do seu turno, recebe 3 de Defesa destrutível.

- **Lenha Espiritual** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Queimadura: 6 de dano de aflição por 3 turnos.
- **Círculo da Pira** (1 Cinza + 1 Essência; recarga 0T): Concede 10 de Defesa destrutível. Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno.
- **Marcha da Fogueira** (2 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a todos os inimigos. Remove 15 de Defesa antes do dano. Se o alvo está com Queimadura: +10 dano.
- **Passo entre Brasas** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Coração em Fúria — Ruptor

Cada pulsação carrega o coração; o descontrole converte as cargas em dano.

**Passiva — Pulso Irado:** Ao perder Vida por uma habilidade inimiga, causa 3 de dano de aflição ao agressor.

- **Batida Escaldante** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Ganha 1 carga (máx. 3).
- **Sangue em Ebulição** (1 Cinza; recarga 0T): Causa 20 de dano físico a um inimigo. Aumenta em 5 o dano do usuário até o fim do próximo turno do beneficiado. O usuário perde 5 de Vida (não o derrota).
- **Coração em Erupção** (1 Cinza + 1 Essência; recarga 2T): Causa 20 de dano físico a um inimigo. Consome as cargas: +10 de dano por carga. O usuário perde 8 de Vida (não o derrota).
- **Pulso Intangível** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Fome

### O Devorador — Predador

Drene Vida e finalize inimigos feridos para sustentar a própria presença.

**Passiva — Fome Crescente:** Após causar dano com uma habilidade, restaura 4 de Vida.

- **Mordida da Alma** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Restaura ao usuário 50% do dano causado.
- **Saliva Corrosiva** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Remove 20 de Defesa antes do dano.
- **Engolir a Essência** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 50% do dano causado. Se o alvo tem 50 de Vida ou menos: +15 dano.
- **Mandíbula do Vazio** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Mão que Toma — Usurpadora

A mão rouba recursos enquanto a cobrança destrói as defesas do adversário.

**Passiva — Posse Insaciável:** Sua primeira habilidade ofensiva do combate causa +4 de dano.

- **Dedos da Cobiça** (1 Cinza; recarga 1T): Causa 10 de dano físico a um inimigo. Rouba 1 recurso da reserva inimiga.
- **Guardar o que Roubou** (1 Cinza; recarga 0T): Concede 20 de Defesa destrutível. Ganha 1 carga (máx. 3).
- **Confisco da Alma** (1 Cinza + 1 Essência; recarga 1T): Causa 20 de dano físico a um inimigo. Remove 30 de Defesa antes do dano. Consome as cargas: +7 de dano por carga.
- **Mão Fora de Alcance** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Estômago sem Fundo — Devorador de Defesa

Devore a guarda e transforme cada refeição em cargas para o abismo.

**Passiva — Digestão Lenta:** No início do seu turno, restaura 3 de Vida.

- **Corrosão Faminta** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Remove 20 de Defesa antes do dano. Ganha 1 carga (máx. 3).
- **Reserva do Estômago** (1 Cinza; recarga 0T): Restaura 20 de Vida. Reduz em 5 o dano recebido por 1 turno.
- **Fundo que Não Existe** (1 Cinza + 1 Essência; recarga 2T): Causa 20 de dano de aflição a um inimigo. Consome as cargas: +8 de dano por carga.
- **Refúgio no Abismo** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Senhora do Último Pão — Apoio da Escassez

Reparta o pouco que resta e puna quem carrega a marca da privação.

**Passiva — Última Migalha:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Marca da Privação** (1 Cinza; recarga 1T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Remove 1 recurso da reserva inimiga.
- **Dividir o Último Pão** (1 Cinza + 1 Essência; recarga 0T): Restaura 12 de Vida a cada aliado.
- **Dívida da Mesa Vazia** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 50% do dano causado. Se o alvo tem a marca desta preparação: +10 dano.
- **Mesa Inviolável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Credor — Cobrador

A dívida amadurece em marcas e recursos; a cobrança final exige pagamento.

**Passiva — Juros da Alma:** Suas habilidades causam +5 de dano se o alvo tem uma marca sua.

- **Assinar a Dívida** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 4 turnos.
- **Juros Acumulados** (1 Cinza + 1 Essência; recarga 1T): Causa 20 de dano físico a um inimigo. Rouba 1 recurso da reserva inimiga. Se o alvo tem a marca desta preparação: +10 dano.
- **Execução do Contrato** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo tem a marca desta preparação: +15 dano; consome a preparação.
- **Cláusula de Ausência** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Balança Vazia — Drenagem

Esvazie os recursos inimigos e equilibre a própria Vida com o peso do alvo.

**Passiva — Peso da Carência:** Com 50 de Vida ou menos, suas habilidades causam +5 de dano.

- **Prato da Falta** (1 Cinza; recarga 1T): Causa 15 de dano físico a um inimigo. Remove 1 recurso da reserva inimiga.
- **Contrapeso Vital** (1 Cinza + 1 Essência; recarga 0T): Restaura 20 de Vida. Remove aflições e condições prejudiciais.
- **Fome em Equilíbrio** (1 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a todos os inimigos. Se o alvo tem 50 de Vida ou menos: +10 dano.
- **Peso Zero** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Podridão

### O Apodrecido — Aflição

A decadência enfraquece a guarda e prepara a decomposição do alvo.

**Passiva — Carne em Ruína:** Suas habilidades causam +4 de dano se o alvo está com Decadência.

- **Contato da Ruína** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Decadência: 5 de dano de aflição por 3 turnos.
- **Tecido Cedido** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Remove 15 de Defesa antes do dano.
- **Decomposição Completa** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Se o alvo está com Decadência: +15 dano.
- **Casca Morta** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Praga Andante — Propagadora

Contamine o trio inimigo e concentre a febre em quem já está doente.

**Passiva — Hospedeira da Praga:** Após causar dano com uma habilidade, restaura 3 de Vida.

- **Febre Andante** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Veneno: 6 de dano de aflição por 2 turnos.
- **Contágio do Caminho** (1 Cinza + 1 Essência; recarga 2T): Causa 5 de dano físico a todos os inimigos. Veneno: 4 de dano de aflição por 3 turnos.
- **Crise Pestilenta** (1 Cinza + 1 Essência; recarga 3T): Causa 20 de dano físico a um inimigo. Se o alvo está com Veneno: +15 dano e Atordoa por 1 turno.
- **Névoa Contaminada** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Corrupto — Sabotador

Corrompa a proteção e transforme a abertura numa cobrança de aflição.

**Passiva — Lucro da Ruína:** Suas habilidades causam +4 de dano se o alvo tem Defesa.

- **Acordo Podre** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Remove 20 de Defesa antes do dano.
- **Quebrar a Confiança** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Remove bônus de dano, redução e contra-ataque do alvo.
- **Preço da Corrupção** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Rouba 1 recurso da reserva inimiga. Se o alvo tem a marca desta preparação: +10 dano.
- **Privilégio Oculto** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Rainha dos Fungos — Rainha de Esporos

Cultive esporos e use as cargas para restaurar ou sufocar a vítima.

**Passiva — Colônia Viva:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Semear Esporos** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Decadência: 5 de dano de aflição por 2 turnos. Ganha 1 carga (máx. 3).
- **Micélio de Amparo** (1 Cinza + 1 Essência; recarga 0T): Concede 12 de Defesa destrutível ao trio. Consome as cargas: +4 de cura por carga a cada aliado.
- **Florir da Colônia** (1 Cinza + 1 Essência; recarga 1T): Causa 20 de dano de aflição a um inimigo. Consome as cargas: +7 de dano por carga.
- **Coroa de Esporos** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Médico de Vermes — Cirurgião Sombrio

Trate um aliado ou infecte o inimigo; a sutura transforma veneno em recuperação.

**Passiva — Cuidado Decomposto:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Incisão Parasitária** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Veneno: 5 de dano de aflição por 3 turnos. Restaura ao usuário 50% do dano causado.
- **Sutura de Vermes** (1 Cinza + 1 Essência; recarga 0T): Restaura 20 de Vida. Remove aflições e condições prejudiciais.
- **Drenagem da Colônia** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 70% do dano causado. Se o alvo está com Veneno: +10 dano.
- **Corpo entre Vermes** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Jardim Morto — Cerco Vivo

Raízes degradam a oposição; o terreno do jardim converte doença em imobilização.

**Passiva — Raiz sob a Pele:** Ao perder Vida por uma habilidade inimiga, causa 3 de dano de aflição ao agressor.

- **Raiz Necrosada** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Decadência: 4 de dano de aflição por 3 turnos.
- **Solo Contaminado** (1 Cinza + 1 Essência; recarga 0T): Concede 15 de Defesa destrutível ao trio.
- **Jardim do Fim** (2 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a todos os inimigos. Enfraquece por 1 turno do alvo: −10 de dano causado. Se o alvo está com Decadência: +10 dano.
- **Entre Raízes Mortas** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Silêncio

### O que Observou — Observador

Registre a falha, acumule testemunhos e prepare uma resposta precisa.

**Passiva — Olhos que Não Piscam:** No início do seu turno, recebe 3 de Defesa destrutível.

- **Registrar a Falha** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Ganha 1 carga (máx. 3).
- **Recusar Interferência** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno.
- **Peso do Testemunho** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Consome as cargas: +5 de dano por carga. Se o alvo tem a marca desta preparação: +10 dano.
- **Fora do Acontecimento** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Porta Fechada — Carcereira

Feche o caminho de um alvo e use a exclusão para proteger um aliado.

**Passiva — Lado de Dentro:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Batida sem Resposta** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Tranca do Refúgio** (1 Cinza; recarga 0T): Concede 25 de Defesa destrutível. Reduz em 5 o dano recebido por 1 turno.
- **Não Há Saída** (1 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Porta Fora do Mundo** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Surdo — Interrupção

Desarme a ofensiva e castigue o adversário que permanece enfraquecido.

**Passiva — Ruído Abafado:** Com 50 de Vida ou menos, suas habilidades causam +5 de dano.

- **Impacto Abafado** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Enfraquece por 2 turnos do alvo: −10 de dano causado.
- **Cessar do Som** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Atordoa por 1 turno.
- **Onda Inaudível** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo está Enfraquecido: +15 dano.
- **Silêncio Absoluto** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Testemunha Cega — Testemunha

Revele a presença do inimigo e prepare uma resposta contra a próxima agressão.

**Passiva — Visão sem Olhos:** Suas habilidades causam +5 de dano se o alvo está Exposto.

- **Presença Denunciada** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Remove bônus de dano, redução e contra-ataque do alvo.
- **Memória do Golpe** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno.
- **Testemunho Final** (1 Cinza + 1 Essência; recarga 1T): Causa 30 de dano perfurante a um inimigo. Se o alvo está Exposto: +10 dano.
- **Campo sem Testemunha** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Quarto Vazio — Isolamento

A ausência drena o trio inimigo; um alvo isolado se torna presa de aflição.

**Passiva — Vazio Habitado:** No início do seu turno, restaura 3 de Vida.

- **Ausência Pesada** (1 Cinza; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos.
- **Ninguém Vem** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a todos os inimigos. Remove 1 recurso da reserva inimiga uma única vez.
- **Quarto sem Retorno** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Se o alvo tem a marca desta preparação: +10 dano.
- **Quarto Inacessível** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Vigia Ausente — Emboscada

Prepare a sentinela ausente e cobre o descuido de quem tiver sua guarda removida.

**Passiva — Vigília Tardia:** Sua primeira habilidade ofensiva do combate causa +6 de dano.

- **Passagem Desguarnecida** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Remove 20 de Defesa antes do dano.
- **Vigia na Sombra** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 25 de dano. Dura 1 turno.
- **Chegar Depois** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Se o alvo está Exposto: +15 dano.
- **Posto Vazio** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Carne

### O que Possui — Possessor

Inscreva a posse e use a ligação para enfraquecer e drenar a vítima.

**Passiva — Vontade Parasita:** Após causar dano com uma habilidade, restaura 4 de Vida.

- **Selo da Posse** (1 Cinza; recarga 0T): Causa 10 de dano espiritual a um inimigo. Marca o alvo por 3 turnos.
- **Nervos Tomados** (1 Cinza + 1 Essência; recarga 2T): Causa 15 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Usufruto Vital** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 60% do dano causado. Se o alvo tem a marca desta preparação: +10 dano.
- **Desligar o Corpo** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Pele Alheia — Metamorfa

Recomponha a pele e castigue quem ataca uma forma que já não é a verdadeira.

**Passiva — Pele que Aprende:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Lâmina de Epiderme** (1 Cinza; recarga 0T): Causa 20 de dano físico a um inimigo. Remove 10 de Defesa antes do dano.
- **Camada Substituta** (1 Cinza + 1 Essência; recarga 0T): Concede 25 de Defesa destrutível. Remove aflições e condições prejudiciais.
- **Forma de Retaliação** (1 Cinza + 1 Essência; recarga 0T): Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Anula a próxima habilidade inimiga recebida e contra-ataca com 25 de dano. Dura 1 turno.
- **Troca de Pele** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Desejo Quebrado — Ruptor Vital

O desejo cobra Vida para gerar cargas; a descarga rompe a proteção inimiga.

**Passiva — Falta Incurável:** Com 50 de Vida ou menos, suas habilidades causam +6 de dano.

- **Pulso do Desejo** (1 Cinza; recarga 0T): Causa 20 de dano físico a um inimigo. Ganha 1 carga (máx. 3). O usuário perde 5 de Vida (não o derrota).
- **Aproximação Dolorosa** (1 Cinza; recarga 1T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Remove 1 recurso da reserva inimiga.
- **Desejo Desfeito** (1 Cinza + 1 Essência; recarga 2T): Causa 25 de dano perfurante a um inimigo. Consome as cargas: +8 de dano por carga.
- **Forma Inalcançável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Marionetista de Nervos — Controladora

Conecte fios ao alvo e transforme essa ligação em uma interrupção ou execução.

**Passiva — Tensão dos Fios:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Fio Nervoso** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos.
- **Puxar a Vontade** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +5 dano e Atordoa por 1 turno.
- **Romper o Comando** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Se o alvo tem a marca desta preparação: +15 dano; consome a preparação.
- **Fios Fora de Fase** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Espelho Carnal — Refletor

Faça a agressão retornar e ataque a imagem vulnerável que o espelho revelou.

**Passiva — Dor Refletida:** Ao perder Vida por uma habilidade inimiga, causa 4 de dano de aflição ao agressor.

- **Reflexo de Carne** (1 Cinza; recarga 0T): Causa 15 de dano espiritual a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Imagem de Resposta** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno.
- **Rachar o Reflexo** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Remove 20 de Defesa antes do dano. Se o alvo está Exposto: +10 dano.
- **Atrás do Espelho** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Costureira — Cirurgiã

Costure aliados para sustentá-los ou use o fio marcado para abrir a vítima.

**Passiva — Linha da Reparação:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Ponto de Corte** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Sangramento: 4 de dano de aflição por 2 turnos.
- **Sutura Perfeita** (1 Cinza + 1 Essência; recarga 0T): Restaura 25 de Vida. Remove aflições e condições prejudiciais.
- **Desfazer os Pontos** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +15 dano; consome a preparação.
- **Costura de Ausência** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Vazio

### O que Apaga — Anulador

Apague proteções antes de extinguir a marca deixada na alma do alvo.

**Passiva — Nada se Sustenta:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Traço Apagado** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Remove bônus de dano, redução e contra-ataque do alvo.
- **Branco sobre a Guarda** (1 Cinza; recarga 0T): Causa 20 de dano físico a um inimigo. Remove 30 de Defesa antes do dano.
- **Extinguir o Traço** (1 Cinza + 1 Essência; recarga 1T): Causa 30 de dano de aflição a um inimigo. Se o alvo tem a marca desta preparação: +10 dano.
- **Fora da Existência** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Ausência — Evasão

O adversário perde recursos tentando preencher a ausência; a falta vira dano.

**Passiva — Falta de Substância:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Toque Ausente** (1 Cinza; recarga 1T): Causa 15 de dano físico a um inimigo. Remove 1 recurso da reserva inimiga.
- **Ataque a Ninguém** (1 Cinza + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno.
- **Ausência Contagiosa** (1 Cinza + 1 Essência; recarga 2T): Causa 15 de dano espiritual a todos os inimigos. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Não Estar** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Fim Silencioso — Finalizador

Reduza a resistência em silêncio e concentre a sentença em um inimigo ferido.

**Passiva — Último Instante:** Suas habilidades causam +6 de dano se o alvo tem 50 de Vida ou menos.

- **Aviso do Fim** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Cessar da Vontade** (1 Cinza + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Atordoa por 1 turno. Remove bônus de dano, redução e contra-ataque do alvo.
- **Sem Últimas Palavras** (1 Cinza + 1 Essência; recarga 1T): Causa 30 de dano perfurante a um inimigo. Se o alvo tem 50 de Vida ou menos: +15 dano.
- **Instante sem Tempo** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Menino sem Sombra — Sombra Frágil

Guarde fragmentos da própria sombra e lance uma investida que cobra Vida.

**Passiva — Medo sem Forma:** Com 50 de Vida ou menos, suas habilidades causam +6 de dano.

- **Brincadeira sem Sombra** (1 Cinza; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Refúgio na Falta** (1 Cinza; recarga 0T): Restaura 15 de Vida. Reduz em 10 o dano recebido por 1 turno.
- **Sol que Não Encontra** (1 Cinza + 1 Essência; recarga 2T): Causa 20 de dano de aflição a um inimigo. Consome as cargas: +9 de dano por carga. O usuário perde 5 de Vida (não o derrota).
- **Infância Invisível** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Última Página — Encerramento

Escreva a conclusão no alvo e remova suas vantagens antes de fechar o livro.

**Passiva — Parágrafo Final:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Nome na Última Folha** (1 Cinza; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Rasura do Destino** (1 Cinza; recarga 1T): Causa 15 de dano físico a um inimigo. Remove bônus de dano, redução e contra-ataque do alvo. Remove 1 recurso da reserva inimiga.
- **Fechar a História** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo tem a marca desta preparação: +15 dano; consome a preparação.
- **Margem em Branco** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Lugar de Ninguém — Desolação

O território corrói todos; a ruína do alvo escolhido alimenta a sobrevivência.

**Passiva — Habitar o Nada:** No início do seu turno, restaura 3 de Vida.

- **Chão de Ninguém** (1 Cinza + 1 Essência; recarga 1T): Causa 5 de dano físico a todos os inimigos. Decadência: 5 de dano de aflição por 2 turnos.
- **Endereço Inexistente** (1 Cinza; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Engolido pelo Lugar** (1 Cinza + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Restaura ao usuário 50% do dano causado. Se o alvo tem a marca desta preparação: +10 dano.
- **Território Impossível** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Proteção

### O Escudo Vivo — Protetor

Proteja um aliado e use a própria guarda como base para o contra-golpe.

**Passiva — Ficarei Aqui:** No início do seu turno, recebe 5 de Defesa destrutível.

- **Golpe do Bastião** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Concede 10 de Defesa destrutível ao usuário.
- **Voto de Amparo** (1 Graça; recarga 0T): Concede 25 de Defesa destrutível. Reduz em 5 o dano recebido por 1 turno.
- **Resposta da Égide** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o usuário tem Defesa: +15 dano.
- **Fortaleza de Luz** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Muralha — Fortificação

Erga a muralha para o trio e carregue força para romper a linha adversária.

**Passiva — Pedra sobre Pedra:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Impacto do Baluarte** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Ganha 1 carga (máx. 3).
- **Muralha Partilhada** (1 Graça + 1 Essência; recarga 0T): Concede 18 de Defesa destrutível ao trio.
- **Avanço do Bastão** (1 Graça + 1 Essência; recarga 1T): Causa 20 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Consome as cargas: +8 de dano por carga.
- **Além do Baluarte** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O que Ficou — Sacrifício

Permaneça ao lado dos feridos e transforme a resistência em um retorno decisivo.

**Passiva — Presença que Sustenta:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Não Recuar** (1 Graça; recarga 0T): Causa 20 de dano físico a um inimigo. Reduz em 5 o dano recebido por 1 turno pelo usuário.
- **Lugar ao Meu Lado** (1 Graça + 1 Essência; recarga 0T): Restaura 15 de Vida. Concede 20 de Defesa destrutível. O usuário perde 5 de Vida (não o derrota).
- **Eu Ainda Estou Aqui** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 30% do dano causado. Se o usuário tem 50 de Vida ou menos: +15 dano.
- **Promessa Inquebrável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Último Guardião — Contra-ataque

Defenda o aliado ameaçado e ataque com mais força quando a guarda está erguida.

**Passiva — Última Vigília:** Ao perder Vida por uma habilidade inimiga, causa 4 de dano de aflição ao agressor.

- **Lança da Guarda** (1 Graça; recarga 0T): Causa 20 de dano físico a um inimigo. Marca o alvo por 3 turnos.
- **Sentinela de Resposta** (1 Graça + 1 Essência; recarga 0T): Concede 10 de Defesa destrutível. Anula a próxima habilidade inimiga recebida e contra-ataca com 25 de dano. Dura 1 turno.
- **Alvorecer do Guardião** (1 Graça + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Guarda Inviolável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Sentinela Azul — Guarda Tática

Revele um agressor, proteja o trio e ataque por dentro de suas defesas.

**Passiva — Olhar de Vigília:** Suas habilidades causam +4 de dano se o alvo está Exposto.

- **Sinal Azul** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Linha de Proteção** (1 Graça + 1 Essência; recarga 0T): Concede 10 de Defesa destrutível ao trio. Reduz em 5 o dano recebido por 1 turno.
- **Lança do Horizonte** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo está Exposto: +15 dano.
- **Vigília Intangível** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Cura

### A Mão que Cura — Curadora

Alterne restauração e dano; um inimigo marcado devolve Vida a quem o enfrenta.

**Passiva — A Dor é Vista:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Toque da Compaixão** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos.
- **Mãos Restauradoras** (1 Graça + 1 Essência; recarga 0T): Restaura 25 de Vida. Remove aflições e condições prejudiciais.
- **Reequilibrar a Dor** (1 Graça + 1 Essência; recarga 1T): Causa 20 de dano espiritual a um inimigo. Restaura ao usuário 80% do dano causado. Se o alvo tem a marca desta preparação: +10 dano.
- **Luz sem Ferida** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Restaurador — Restaurador

Remova aflições para manter o trio ativo e prepare reservas de Vida para a crise.

**Passiva — Recomposição Contínua:** No início do seu turno, restaura 4 de Vida.

- **Pulso de Retorno** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Restituir a Forma** (1 Graça + 1 Essência; recarga 0T): Restaura 20 de Vida. Concede 10 de Defesa destrutível. Remove aflições e condições prejudiciais.
- **Reserva Restauradora** (1 Graça + 1 Essência; recarga 0T): Restaura 10 de Vida a cada aliado. Consome as cargas: +5 de cura por carga a cada aliado.
- **Forma Preservada** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Luz que Restaura — Luz Vital

A luz expõe a oposição e usa a clareza para recuperar aliados feridos.

**Passiva — Claridade que Ampara:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Raio Restaurador** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Reconstruir o Fôlego** (1 Graça + 1 Essência; recarga 0T): Restaura 25 de Vida. Aumenta em 5 o dano até o fim do próximo turno do beneficiado.
- **Aurora Reparadora** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Restaura ao usuário 50% do dano causado. Se o alvo está Exposto: +10 dano.
- **Clarão Imaculado** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Jardineira das Feridas — Cultivo Vital

Cultive cargas com raízes e use-as numa cura coletiva ou numa floração ofensiva.

**Passiva — Jardim da Convalescença:** No início do seu turno, restaura 3 de Vida.

- **Raiz que Cuida** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Flores de Convalescença** (1 Graça + 1 Essência; recarga 0T): Restaura 10 de Vida a cada aliado. Consome as cargas: +6 de cura por carga a cada aliado.
- **Espinhos da Proteção** (1 Graça + 1 Essência; recarga 1T): Causa 20 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Consome as cargas: +7 de dano por carga.
- **Pétalas de Refúgio** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Pulso Sereno — Acalmador

Reduza o ímpeto inimigo e mantenha um aliado estável até o próximo pulso.

**Passiva — Ritmo Sereno:** No início do seu turno, recebe 3 de Defesa destrutível.

- **Pulsação Desarmante** (1 Graça; recarga 0T): Causa 10 de dano espiritual a um inimigo. Enfraquece por 2 turnos do alvo: −10 de dano causado.
- **Respirar Novamente** (1 Graça + 1 Essência; recarga 0T): Restaura 20 de Vida. Reduz em 10 o dano recebido por 1 turno.
- **Quietude Profunda** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano físico a um inimigo. Se o alvo está Enfraquecido: +10 dano e Atordoa por 1 turno.
- **Pausa do Coração** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Justiça

### O Equilíbrio — Equilíbrio

Exponha o excesso e mantenha o trio protegido enquanto prepara a medida final.

**Passiva — Medida Justa:** Suas habilidades causam +4 de dano se o alvo está Exposto.

- **Peso do Excesso** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Prato da Misericórdia** (1 Graça + 1 Essência; recarga 0T): Restaura 20 de Vida. Concede 15 de Defesa destrutível.
- **Equação da Justiça** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo está Exposto: +15 dano.
- **Balança Imóvel** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Lâmina Justa — Duelista Justa

A lâmina marca o ofensor; o golpe seguinte atravessa a guarda sem perder a medida.

**Passiva — Fio do Princípio:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Corte de Princípio** (1 Graça; recarga 0T): Causa 20 de dano físico a um inimigo. Marca o alvo por 3 turnos.
- **Parada Equânime** (1 Graça + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 25 de dano. Dura 1 turno.
- **Sentença da Lâmina** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo tem a marca desta preparação: +15 dano.
- **Passo Equânime** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O que Pesa — Ponderador

Colete o peso dos atos e transforme as cargas numa decisão que interrompe.

**Passiva — Paciência da Balança:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Pesar os Atos** (1 Graça; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Ganha 1 carga (máx. 3).
- **Reduzir o Excesso** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado.
- **Decisão Ponderada** (1 Graça + 1 Essência; recarga 3T): Causa 20 de dano físico a um inimigo. Consome as cargas: +6 de dano por carga. Se o alvo tem a marca desta preparação: +5 dano e Atordoa por 1 turno; consome a preparação.
- **Entre os Pratos** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Testemunha Íntegra — Reveladora

O testemunho remove vantagens e permite que o trio ataque uma abertura real.

**Passiva — Voz sem Distorção:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Registrar a Verdade** (1 Graça; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Prova Irrefutável** (1 Graça; recarga 0T): Causa 20 de dano espiritual a um inimigo. Remove bônus de dano, redução e contra-ataque do alvo.
- **Testemunho Íntegro** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano espiritual a todos os inimigos. Se o alvo tem a marca desta preparação: +10 dano.
- **Testemunho Protegido** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Julgador Gentil — Julgador de Amparo

Enfraqueça sem excesso, recupere o aliado e interrompa quem insiste na agressão.

**Passiva — Gentileza Firme:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Advertência Serena** (1 Graça; recarga 0T): Causa 10 de dano físico a um inimigo. Enfraquece por 2 turnos do alvo: −10 de dano causado.
- **Reparação Justa** (1 Graça + 1 Essência; recarga 0T): Restaura 25 de Vida. Remove aflições e condições prejudiciais.
- **Limite da Clemência** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano físico a um inimigo. Se o alvo está Enfraquecido: +10 dano e Atordoa por 1 turno.
- **Trégua Inviolável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Esperança

### A Chama que Não Apaga — Perseverança

Mantenha a chama acesa e responda com mais força quando a própria Vida baixar.

**Passiva — Ainda Há Amanhã:** Com 50 de Vida ou menos, suas habilidades causam +6 de dano.

- **Fagulha do Amanhã** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Queimadura: 4 de dano de aflição por 2 turnos. Ganha 1 carga (máx. 3).
- **Não se Apagar** (1 Graça; recarga 0T): Restaura 20 de Vida. Aumenta em 5 o dano até o fim do próximo turno do beneficiado.
- **Aurora Imorredoura** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Consome as cargas: +7 de dano por carga.
- **Chama Intocável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O que Levanta — Resiliência

Sustente quem caiu em risco e transforme a própria resistência em resposta.

**Passiva — Levantar Outra Vez:** No início do seu turno, restaura 4 de Vida.

- **Passo de Retorno** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Concede 10 de Defesa destrutível ao usuário.
- **Erguer o Companheiro** (1 Graça + 1 Essência; recarga 0T): Restaura 25 de Vida. Aumenta em 5 o dano até o fim do próximo turno do beneficiado.
- **Enquanto Eu Respirar** (1 Graça + 1 Essência; recarga 1T): Causa 30 de dano físico a um inimigo. Se o usuário tem 50 de Vida ou menos: +10 dano.
- **Instante de Superação** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Voz — Inspiradora

A voz fortalece o trio; a mensagem marca quem tentaria calá-la.

**Passiva — Coro de Coragem:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Palavra de Coragem** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos.
- **Hino da Perseverança** (1 Graça + 1 Essência; recarga 0T): Concede 10 de Defesa destrutível ao trio. Aumenta em 5 o dano até o fim do próximo turno do beneficiado.
- **Não Seremos Calados** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano espiritual a todos os inimigos. Se o alvo tem a marca desta preparação: +10 dano.
- **Nota Inalcançável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Portador da Aurora — Portador

Acumule claridade, limpe o caminho e libere a aurora numa ofensiva concentrada.

**Passiva — Primeiro Horizonte:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Lança da Primeira Luz** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Carregar a Aurora** (1 Graça + 1 Essência; recarga 0T): Restaura 15 de Vida. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Remove aflições e condições prejudiciais.
- **Abrir o Horizonte** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano perfurante a um inimigo. Consome as cargas: +9 de dano por carga.
- **Além do Horizonte** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Mensageira do Amanhã — Mensageira

Marque o destino e dê ao aliado o fôlego necessário para completar a travessia.

**Passiva — Promessa de Chegada:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Sinal do Amanhã** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Mensagem de Alento** (1 Graça + 1 Essência; recarga 0T): Restaura 20 de Vida. Concede 15 de Defesa destrutível.
- **O Amanhã Chegou** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo tem a marca desta preparação: +15 dano.
- **Passagem da Mensagem** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Verdade

### O que Revela — Revelador

Remova vantagens ocultas e use a exposição para um golpe que ignora redução.

**Passiva — Nada a Esconder:** Suas habilidades causam +5 de dano se o alvo está Exposto.

- **Luz sem Mentira** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Remove bônus de dano, redução e contra-ataque do alvo.
- **Clareza Partilhada** (1 Graça + 1 Essência; recarga 0T): Remove aflições e condições prejudiciais.
- **Verdade Incisiva** (1 Graça + 1 Essência; recarga 1T): Causa 30 de dano perfurante a um inimigo. Se o alvo está Exposto: +10 dano.
- **Transparência Absoluta** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Luz Nua — Claridade

A luz marca o adversário e rompe a defesa antes do clarão definitivo.

**Passiva — Sem Disfarce:** Sua primeira habilidade ofensiva do combate causa +4 de dano.

- **Toque da Luz Nua** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos.
- **Despir a Guarda** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Remove bônus de dano, redução e contra-ataque do alvo. Remove 20 de Defesa antes do dano.
- **Clarão sem Véu** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo tem a marca desta preparação: +15 dano.
- **Feixe Inatingível** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Espelho — Espelhamento

Revele a abertura e faça a próxima agressão retornar ao próprio agressor.

**Passiva — Reflexo Honesto:** Ao perder Vida por uma habilidade inimiga, causa 4 de dano de aflição ao agressor.

- **Imagem Verdadeira** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Devolver a Intenção** (1 Graça + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 25 de dano. Dura 1 turno.
- **Fratura da Ilusão** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Remove bônus de dano, redução e contra-ataque do alvo. Se o alvo está Exposto: +10 dano.
- **Dentro do Reflexo** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Cartógrafa da Clareza — Cartógrafa

Trace rotas no adversário e use os pontos de referência para orientar a ofensiva.

**Passiva — Rota sem Engano:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Traçar a Abertura** (1 Graça; recarga 0T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Ganha 1 carga (máx. 3).
- **Caminho Seguro** (1 Graça + 1 Essência; recarga 0T): Concede 12 de Defesa destrutível ao trio. Aumenta em 5 o dano até o fim do próximo turno do beneficiado.
- **Convergência das Rotas** (1 Graça + 1 Essência; recarga 1T): Causa 20 de dano espiritual a um inimigo. Consome as cargas: +8 de dano por carga.
- **Fora das Coordenadas** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Olho Desarmado — Percepção

Enfraqueça a agressão sem depender de força; a abertura real permite desarmá-la.

**Passiva — Ver sem Ferir:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Olhar Desarmante** (1 Graça; recarga 0T): Causa 10 de dano espiritual a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Cuidar sem Defesa** (1 Graça + 1 Essência; recarga 0T): Restaura 20 de Vida. Remove aflições e condições prejudiciais.
- **Intenção Desvendada** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano físico a um inimigo. Se o alvo está Exposto: +10 dano e Atordoa por 1 turno.
- **Ponto Cego Sereno** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo União

### O Elo Dourado — Vínculo Ofensivo

Marque o elo adversário e fortaleça os aliados antes de fechar a corrente.

**Passiva — Força Compartilhada:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Laço do Elo** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos.
- **Promessa de Combate** (1 Graça + 1 Essência; recarga 0T): Concede 10 de Defesa destrutível ao trio. Aumenta em 5 o dano até o fim do próximo turno do beneficiado.
- **Corrente Dourada** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano espiritual a um inimigo. Se o alvo tem a marca desta preparação: +15 dano.
- **Elo Inquebrável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A que Une — Vínculo Vital

Uma união cuidadosa recupera e limpa o aliado enquanto a ligação drena o inimigo.

**Passiva — Cuidar em Conjunto:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Fio de Encontro** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Restaura ao usuário 50% do dano causado.
- **Reunir os Fragmentos** (1 Graça + 1 Essência; recarga 0T): Restaura 20 de Vida. Concede 10 de Defesa destrutível. Remove aflições e condições prejudiciais.
- **Fôlego Coletivo** (1 Graça + 1 Essência; recarga 0T): Restaura 15 de Vida a cada aliado. Aumenta em 5 o dano até o fim do próximo turno do beneficiado.
- **Entrelaçar de Luz** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Vínculo — Guarda de Aliança

O vínculo prepara uma defesa reativa e transforma a exposição em pressão.

**Passiva — Pacto de Permanência:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Selo do Pacto** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Responder pelo Outro** (1 Graça + 1 Essência; recarga 0T): Concede 15 de Defesa destrutível. Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno.
- **Resposta da Aliança** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano físico a um inimigo. Restaura ao usuário 30% do dano causado. Se o alvo está Exposto: +10 dano.
- **Laço Intangível** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### Os Três Irmãos — Trio em Harmonia

As três cadências acumulam cargas para uma resposta coletiva.

**Passiva — Passo de Irmandade:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Primeira Cadência** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Ganha 1 carga (máx. 3).
- **Segunda Cadência** (1 Graça + 1 Essência; recarga 0T): Concede 12 de Defesa destrutível ao trio. Ganha 1 carga (máx. 3).
- **Terceira Cadência** (2 Graça + 1 Essência; recarga 2T): Causa 15 de dano físico a todos os inimigos. Consome as cargas: +5 de dano por carga.
- **Passo em Uníssono** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Guardiã das Promessas — Guardiã de Pactos

Proteja uma promessa e cobre o inimigo marcado sem abandonar o cuidado.

**Passiva — Promessa Cumprida:** Após usar uma habilidade de apoio, o usuário restaura 5 de Vida.

- **Juramento Gravado** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos.
- **Guardar a Palavra** (1 Graça + 1 Essência; recarga 0T): Restaura 10 de Vida. Concede 25 de Defesa destrutível.
- **Cobrança do Juramento** (1 Graça + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Pacto Inviolável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Criação

### O que Cria — Artífice

Cada forma criada gera uma carga que pode virar proteção ou uma construção ofensiva.

**Passiva — Ideia Persistente:** No início do seu turno, recebe 4 de Defesa destrutível.

- **Fragmento Nascente** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Forma de Amparo** (1 Graça; recarga 0T): Concede 20 de Defesa destrutível. Ganha 1 carga (máx. 3).
- **Obra Convergente** (1 Graça + 1 Essência; recarga 2T): Causa 20 de dano espiritual a um inimigo. Consome as cargas: +9 de dano por carga.
- **Forma Impossível** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Semente — Germinação

Semeie o futuro no alvo: use as cargas para amparar um aliado ou consuma a marca para romper a guarda.

**Passiva — Potência Latente:** No início do seu turno, restaura 3 de Vida.

- **Semente da Ruptura** (1 Graça; recarga 0T): Causa 10 de dano espiritual a um inimigo. Marca o alvo por 3 turnos. Ganha 1 carga (máx. 3).
- **Abrigo do Broto** (1 Graça + 1 Essência; recarga 0T): Restaura 15 de Vida. Concede 10 de Defesa destrutível. Consome as cargas: +5 de cura por carga.
- **Germinar por Dentro** (1 Graça + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Se o alvo tem a marca desta preparação: +15 dano; consome a preparação.
- **Casulo de Origem** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Cultivador — Cultivador

Cultive reservas com raízes e escolha entre uma colheita de cura ou dano.

**Passiva — Ciclo da Colheita:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Arar a Alma** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Ganha 1 carga (máx. 3).
- **Colheita de Fôlego** (1 Graça + 1 Essência; recarga 0T): Restaura 10 de Vida a cada aliado. Consome as cargas: +6 de cura por carga a cada aliado.
- **Ramos da Resposta** (1 Graça + 1 Essência; recarga 1T): Causa 20 de dano físico a um inimigo. Remove 15 de Defesa antes do dano. Consome as cargas: +8 de dano por carga.
- **Abrigo das Raízes** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Arquiteta Verde — Arquiteta

A estrutura protege o trio; pontos de apoio preparam um desabamento controlado.

**Passiva — Fundação Viva:** No início do seu turno, recebe 5 de Defesa destrutível.

- **Pilar Ascendente** (1 Graça; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Abóbada Verde** (1 Graça + 1 Essência; recarga 0T): Concede 18 de Defesa destrutível ao trio.
- **Convergência dos Pilares** (1 Graça + 1 Essência; recarga 2T): Causa 25 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Geometria Intocável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Primeiro Canto — Cantor da Origem

A nota primordial acumula harmonia; o refrão sustenta o trio ou rompe a oposição.

**Passiva — Eco de Nascimento:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Nota Primordial** (1 Graça; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Refrão da Vida** (1 Graça + 1 Essência; recarga 0T): Restaura 12 de Vida a cada aliado. Aumenta em 5 o dano até o fim do próximo turno do beneficiado.
- **Canto que Abre o Mundo** (2 Graça + 1 Essência; recarga 2T): Causa 15 de dano espiritual a todos os inimigos. Consome as cargas: +5 de dano por carga.
- **Pausa Anterior ao Som** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

## Elo Correntes Quebradas

### O Passo Interrompido — Duelista Temporal

Marque uma descontinuidade e converta o passo preparado em interrupção.

**Passiva — Passo que Retorna:** Sua primeira habilidade ofensiva do combate causa +5 de dano.

- **Fissura do Passo** (1 Ruptura; recarga 0T): Causa 15 de dano perfurante a um inimigo. Marca o alvo por 3 turnos. Ganha 1 carga (máx. 3).
- **Entre Dois Instantes** (1 Ruptura + 1 Essência; recarga 2T): Causa 15 de dano físico a um inimigo. Se o alvo tem a marca desta preparação: +10 dano e Atordoa por 1 turno.
- **Golpe Descontínuo** (1 Ruptura + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Consome as cargas: +8 de dano por carga. O usuário perde 5 de Vida (não o derrota).
- **Passo Fora do Tempo** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Linha Partida — Ruptura de Vínculos

Corte a proteção e amarre a falha do inimigo a uma linha que ainda não terminou.

**Passiva — Tensão da Ruptura:** Suas habilidades causam +4 de dano se o alvo tem uma marca sua.

- **Extremidade Solta** (1 Ruptura; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Remove 15 de Defesa antes do dano.
- **Nó de Emergência** (1 Ruptura; recarga 0T): Restaura 20 de Vida. Concede 10 de Defesa destrutível. O usuário perde 5 de Vida (não o derrota).
- **Puxar o Fim da Linha** (1 Ruptura + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Se o alvo tem a marca desta preparação: +15 dano. O usuário perde 5 de Vida (não o derrota).
- **Linha Inalcançável** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Eco sem Dono — Eco Errante

Acumule ecos e devolva a intenção agressiva antes de liberar a ressonância.

**Passiva — Ressonância sem Dono:** Ao perder Vida por uma habilidade inimiga, causa 3 de dano de aflição ao agressor.

- **Eco Residual** (1 Ruptura; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Devolver a Voz** (1 Ruptura + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno.
- **Coro sem Origem** (2 Ruptura + 1 Essência; recarga 2T): Causa 15 de dano espiritual a todos os inimigos. Consome as cargas: +5 de dano por carga. O usuário perde 5 de Vida (não o derrota).
- **Eco Intangível** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Porta que Flutua — Travessia

Uma abertura marca o destino; atravesse a defesa e preserve quem precisa passar.

**Passiva — Limite Suspenso:** Após usar uma habilidade de apoio, o usuário restaura 4 de Vida.

- **Abertura Impossível** (1 Ruptura; recarga 0T): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.
- **Travessia Segura** (1 Ruptura + 1 Essência; recarga 0T): Concede 25 de Defesa destrutível. Remove aflições e condições prejudiciais.
- **Fechar a Passagem** (1 Ruptura + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo tem a marca desta preparação: +10 dano. O usuário perde 5 de Vida (não o derrota).
- **Do Outro Lado** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Nome Esquecido — Esquecimento

Apague vantagens e faça o adversário perder os recursos ligados ao nome marcado.

**Passiva — Nome que se Dissolve:** No início do seu turno, restaura 3 de Vida.

- **Sílaba Perdida** (1 Ruptura; recarga 1T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Remove 1 recurso da reserva inimiga.
- **Esquecer a Forma** (1 Ruptura; recarga 0T): Causa 15 de dano espiritual a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Remove bônus de dano, redução e contra-ataque do alvo.
- **Ninguém Responde** (1 Ruptura + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Se o alvo tem a marca desta preparação: +15 dano. O usuário perde 5 de Vida (não o derrota).
- **Nome Fora da Memória** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Relógio Afogado — Tempo Submerso

Atrase a resposta inimiga e gaste os segundos acumulados em dano concentrado.

**Passiva — Tempo em Reserva:** No início do seu turno, recebe 3 de Defesa destrutível.

- **Segundo Afogado** (1 Ruptura; recarga 0T): Causa 15 de dano espiritual a um inimigo. Enfraquece por 1 turno do alvo: −10 de dano causado. Ganha 1 carga (máx. 3).
- **Ponteiro Imóvel** (1 Ruptura + 1 Essência; recarga 2T): Causa 10 de dano físico a um inimigo. Atordoa por 1 turno.
- **Devolver os Segundos** (1 Ruptura + 1 Essência; recarga 2T): Causa 20 de dano espiritual a um inimigo. Consome as cargas: +10 de dano por carga. O usuário perde 8 de Vida (não o derrota).
- **Instante Submerso** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Asa Invertida — Inversão

Desarme a ofensiva e use a abertura para uma queda que desafia o peso do mundo.

**Passiva — Queda Ascendente:** Suas habilidades causam +5 de dano se o alvo está Enfraquecido.

- **Pena ao Contrário** (1 Ruptura; recarga 0T): Causa 10 de dano físico a um inimigo. Enfraquece por 2 turnos do alvo: −10 de dano causado.
- **Voo Reverso** (1 Ruptura + 1 Essência; recarga 0T): Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Anula a próxima habilidade inimiga recebida e contra-ataca com 20 de dano. Dura 1 turno.
- **Cair para o Alto** (1 Ruptura + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo está Enfraquecido: +15 dano. O usuário perde 5 de Vida (não o derrota).
- **Asa Fora do Plano** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### O Andarilho de Vidro — Vidro Errante

Marque o caminho em estilhaços e gaste a própria integridade para atravessar a guarda.

**Passiva — Luz nas Fissuras:** Com 50 de Vida ou menos, suas habilidades causam +6 de dano.

- **Pegada de Vidro** (1 Ruptura; recarga 0T): Causa 15 de dano físico a um inimigo. Marca o alvo por 3 turnos. Sangramento: 4 de dano de aflição por 2 turnos.
- **Reflexo do Andarilho** (1 Ruptura + 1 Essência; recarga 0T): Anula a próxima habilidade inimiga recebida e contra-ataca com 25 de dano. Dura 1 turno.
- **Travessia Estilhaçada** (1 Ruptura + 1 Essência; recarga 1T): Causa 25 de dano perfurante a um inimigo. Se o alvo tem a marca desta preparação: +15 dano. O usuário perde 8 de Vida (não o derrota).
- **Passo Transparente** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Sombra Inconstante — Sombra Mutável

Roube impulso na penumbra e alterne drenagem com golpes na vítima marcada.

**Passiva — Fome da Penumbra:** Após causar dano com uma habilidade, restaura 4 de Vida.

- **Sombra Atrás da Alma** (1 Ruptura; recarga 1T): Causa 10 de dano físico a um inimigo. Marca o alvo por 3 turnos. Rouba 1 recurso da reserva inimiga.
- **Mudar de Contorno** (1 Ruptura; recarga 0T): Restaura 15 de Vida. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Remove aflições e condições prejudiciais.
- **A Sombra se Fecha** (1 Ruptura + 1 Essência; recarga 1T): Causa 25 de dano de aflição a um inimigo. Se o alvo tem a marca desta preparação: +15 dano. O usuário perde 5 de Vida (não o derrota).
- **Contorno Imaterial** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Ponte Rasgada — Ruptor de Passagens

Derrube o apoio e marque o vão; a travessia final atinge toda a linha.

**Passiva — Vão Persistente:** Suas habilidades causam +4 de dano se o alvo está Exposto.

- **Romper o Apoio** (1 Ruptura; recarga 0T): Causa 15 de dano físico a um inimigo. Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição. Remove 20 de Defesa antes do dano.
- **Ponte de Emergência** (1 Ruptura + 1 Essência; recarga 0T): Concede 15 de Defesa destrutível ao trio. O usuário perde 5 de Vida (não o derrota).
- **Queda da Travessia** (2 Ruptura + 1 Essência; recarga 2T): Causa 15 de dano perfurante a todos os inimigos. Se o alvo está Exposto: +10 dano. O usuário perde 5 de Vida (não o derrota).
- **Entre as Margens** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

### A Alma em Suspenso — Suspensão Vital

Preserve a forma por um instante, carregue o limiar e solte a alma em uma descarga.

**Passiva — Fôlego no Limiar:** No início do seu turno, restaura 4 de Vida.

- **Pulso Suspenso** (1 Ruptura; recarga 0T): Causa 15 de dano espiritual a um inimigo. Ganha 1 carga (máx. 3).
- **Prender o Último Fôlego** (1 Ruptura + 1 Essência; recarga 0T): Restaura 20 de Vida. Concede 15 de Defesa destrutível. O usuário perde 5 de Vida (não o derrota).
- **Soltar a Âncora** (1 Ruptura + 1 Essência; recarga 2T): Causa 20 de dano de aflição a um inimigo. Consome as cargas: +9 de dano por carga. O usuário perde 5 de Vida (não o derrota).
- **Suspensão Absoluta** (1 Essência; recarga 4T): O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.

