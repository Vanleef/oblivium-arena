# Oblivium Arena — formas e técnicas alternativas

Este documento descreve o cânone e os dados da revisão de desenvolvimento (`art/oblivium-arena-anime-first-20261027`, PR #3). A branch `main` pode conter uma versão jogável anterior; sua presença na documentação não significa que o PR foi integrado ou publicado.

Gerado por `npm run docs:generate`. Nomes e títulos: `src/roster-identity-overrides.js`; elenco: `src/data.js`; Reinos: `src/kingdoms.js`; campanha: `src/progression.js` e `src/story-content.js`. IDs e aliases históricos preservam salvamentos e caminhos de arte.

Os 150 kits mantêm quatro espaços de técnicas e uma ação por personagem a cada turno. O catálogo reúne 689 técnicas, incluindo variações. Uma versão narrativa é uma entrada do elenco; uma forma corporal ou continuação altera o kit da mesma entrada.

Custos, alvos, durações e recargas estão em [COMBAT_KITS.md](COMBAT_KITS.md). O quarto espaço continua reservado à defesa; preparações e formas não criam ações adicionais. Há defesas com componentes específicos, como cura ou mudança de forma, que devem ser conferidos no próprio kit.

## Riven — O Ceifador de Tolos · `o-acougueiro`

- **Reabrir a Ferida** (`impulso:reopen`): Causa 20 de dano físico a um inimigo. Se o alvo está com Sangramento: +10 de dano; consome a preparação. Após usar, restaura Incisão de Abate.

## Lira — A Noiva da Lua · `a-viuva-escarlate`

- **Fio Reverso** (`impulso:revenge`): Causa 25 de dano perfurante a um inimigo. Restaura ao usuário 50% do dano causado. Após usar, restaura Fio Escarlate.

## Thorne — O Colecionador · `o-colecionador-de-cabecas`

- **Caça sem Troféus** (`voto:empty`): Causa 15 de dano físico a um inimigo. Consome Cargas: +3 de dano por Carga.

## Vale e Soren — As Lâminas Gêmeas · `gemeos-do-cutelo`

- **Corte em Contratempo** (`tecnica:cross`): Causa 15 de dano perfurante a um inimigo. Sangramento: 4 de dano de aflição por 2 turnos. Se o alvo está Exposto: +5 de dano. Após usar, restaura Cutelo da Direita.

## Darius — O Soberano · `o-soberano-quebrado`

- **Coroa Soberana:** O decreto assume as três técnicas por 2 turnos: marcar a linha, enfraquecê-la em área e erguer Defesa para o trio.
- **Decreto sobre Todos** (`impulso:edict`): Causa 10 de dano espiritual a todos os inimigos. Marca o alvo por 3 turnos.
- **Cadeia de Juramento** (`tecnica:edict`): Causa 10 de dano espiritual a todos os inimigos. Enfraquece o alvo por 1 turno.
- **Trono Incontestável** (`voto:edict`): Concede 12 de Defesa destrutível ao trio. Aumenta em 5 o dano até o fim do próximo turno do beneficiado.

## Demetrius — O Príncipe · `o-principe-das-correntes`

- **Apertar o Grilhão** (`impulso:drag`): Causa 15 de dano físico a um inimigo. Enfraquece o alvo por 1 turno. Ganha 1 Carga (máx. 3). Após usar, restaura Primeiro Grilhão.

## Nyx — A Máscara Dupla · `a-mascara-dupla`

- **Máscara da Traição:** Rosto Emprestado revela a segunda face por até 2 turnos. Gesto de Outro Rosto interrompe e contra-ataca; ao expirar, a máscara retorna.
- **Gesto de Outro Rosto** (`impulso:other`): Causa 10 de dano espiritual a um inimigo. Anula a próxima habilidade inimiga de qualquer tipo recebida e contra-ataca com 15 de dano. Dura 1 turno. Após usar, restaura Rosto Emprestado.

## Orin — O Intrigante · `o-tecelao-de-mentiras`

- **Desatar a Trama** (`tecnica:unweave`): Restaura 8 de Vida ao trio. Remove aflições e condições prejudiciais do trio. Após usar, restaura Rede de Falsidades.

## Cassian — O Falso Profeta · `o-falso-profeta`

- **Confissão do Falso Santo** (`tecnica:confess`): Restaura 25 de Vida ao usuário. Remove aflições e condições prejudiciais do beneficiado. Consome Cargas: +3 de cura por Carga. Após usar, restaura Bênção Falsa.

## Emberlyn — A Brasa Eterna · `a-brasa-eterna`

- **Fornalha Sepulcral:** Com Queimadura preparada, muda as três técnicas por 2 turnos: labareda focada, cinzas em área e consumo da condição.
- **Labareda Sufocante** (`impulso:smother`): Causa 20 de dano espiritual a um inimigo. Queimadura: 6 de dano de aflição por 2 turnos. Após usar, restaura Brasa que Permanece.
- **Cinzas de Sufoco** (`tecnica:smother`): Causa 10 de dano espiritual a todos os inimigos. Queimadura: 4 de dano de aflição por 2 turnos.
- **Fornalha Sepulcral** (`voto:smother`): Causa 25 de dano espiritual a um inimigo. Se o alvo está com Queimadura: +10 de dano; consome a preparação.

## Corvin — O Furor · `o-odio-encarnado`

- **Ódio Solto:** Transformação por 2 turnos. Ressentimento sem Freio encerra a forma e restaura o retrato.
- **Punho do Ódio Solto** (`impulso:rage`): Causa 30 de dano físico a um inimigo. O usuário perde 10 de Vida (não pode ser derrotado por este custo).
- **Ressentimento sem Freio** (`voto:eruption`): Causa 30 de dano espiritual a um inimigo. Se o usuário tem 50 de Vida ou menos: +10 de dano. O usuário perde 10 de Vida (não pode ser derrotado por este custo). Após usar, restaura Punho de Rancor. Após usar, restaura Explosão do Ressentimento.

## Ragnar — O Ressentido · `o-filho-da-cinza`

- **Rancor Reaceso** (`impulso:rebirth`): Causa 25 de dano espiritual a um inimigo. Remove aflições e condições prejudiciais do usuário. Consome Cargas: +3 de dano por Carga.

## Lyra — A Vingadora · `a-pira-errante`

- **Revanche Ardente** (`impulso:reply`): Causa 20 de dano espiritual a um inimigo. Queimadura: 4 de dano de aflição por 2 turnos. Após usar, restaura Brasa Punitiva.

## Gorath — O Devorador · `o-devorador`

- **Fome sem Corpo:** A forma surge automaticamente quando a Vida chega a 50 ou menos. O peito se abre num vazio e Mordida da Alma passa a drenar a vítima.
- **Fome sem Corpo** (`impulso:starved`): Causa 15 de dano de aflição a um inimigo. Remove 1 unidade de Essência da reserva inimiga. Restaura ao usuário 60% do dano causado.

## Ravena — A Saqueadora · `a-mao-que-toma`

- **Abrir o Cofre** (`tecnica:open`): Restaura 20 de Vida ao usuário. Consome Cargas: +5 de cura por Carga. Após usar, restaura Entesourar.

## Mire — A Pestilência · `a-praga-andante`

- **Febre de Retorno** (`tecnica:fever`): Causa 15 de dano de aflição a um inimigo. Se o alvo está com Veneno: +10 de dano. Após usar, restaura Contágio do Caminho.

## Myra — A Rainha dos Fungos · `a-rainha-dos-fungos`

- **Florescer para os Vivos** (`tecnica:bloom`): Restaura 8 de Vida ao trio. Concede 8 de Defesa destrutível ao trio. Consome Cargas: +4 de cura por Carga para cada aliado. Após usar, restaura Micélio de Amparo. Após usar, restaura Florir da Colônia.
- **Esporos da Última Colheita** (`voto:cloud`): Causa 15 de dano de aflição a todos os inimigos. Consome Cargas: +3 de dano por Carga. Após usar, restaura Micélio de Amparo. Após usar, restaura Florir da Colônia.

## Elias — O Espectador · `o-que-observou`

- **Retaliação do Espectador** (`voto:witness`): Causa 30 de dano espiritual a um inimigo. Consome Cargas: +5 de dano por Carga. Após usar, restaura Peso da Indiferença.

## Voss — O Silenciador · `o-surdo`

- **Clamor sem Retorno** (`impulso:echo`): Causa 20 de dano de aflição a um inimigo. Enfraquece o alvo por 1 turno. Após usar, restaura Impacto Abafado.

## Reed — O Desertor · `o-vigia-ausente`

- **Golpe da Retaguarda** (`voto:ambush`): Causa 25 de dano físico a um inimigo. Não pode ser anulado por Contra-ataque. Se o alvo está Exposto: +15 de dano. Após usar, restaura Cobrar o Abandono.

## Quill — A Metamorfa · `a-pele-alheia`

- **Quimera Terrestre:** Fera baixa e alongada, sustentada por quatro patas musculosas e cauda longa. Não conserva tronco humano nem asas; rompe a guarda, prepara o revide e descarta o molde para recuperar Vida.
- **Quimera Alada:** Predador voador de corpo estreito, asas membranosas usadas como membros dianteiros, duas patas traseiras e cauda longa. Sustenta a guarda, anula um golpe e contra-ataca.
- **Garras Predatórias** (`impulso:skin`): Causa 15 de dano perfurante e remove 15 de Defesa antes do dano.
- **Mergulho Alado** (`impulso:shell`): Causa 20 de dano físico e concede 5 de Defesa ao usuário.
- **Descartar o Molde** (`tecnica:shed`): Recupera 15 de Vida e limpa aflições e condições prejudiciais. Após usar, restaura Garras Cambiantes e as formas Quimera Terrestre e Quimera Alada.
- **Recolher as Asas** (`tecnica:shell`): Recupera 10 de Vida e restaura a forma humanoide e suas três técnicas.
- **Instinto de Revide** (`voto:skin`): Causa 25 de dano físico e prepara um contra-ataque pessoal de 10 de dano por 1 turno.
- **Espinhos Alados** (`voto:shell`): Concede 15 de Defesa e anula a próxima habilidade inimiga recebida, contra-atacando com 20 de dano. Dura 1 turno.

## Liora — A Marionetista · `a-marionetista-de-nervos`

- **Manter o Comando** (`tecnica:hold`): Causa 15 de dano físico a um inimigo. Atordoa por 1 turno. Exige a Marca criada por esta preparação no alvo. Após usar, restaura Puxar a Vontade.

## Sable — A Suturadora · `a-costureira`

- **Reforçar os Pontos** (`tecnica:remove`): Restaura 10 de Vida ao aliado. Concede 15 de Defesa destrutível ao aliado. Após usar, restaura Sutura de Domínio.

## Noctis — O Anulador · `o-que-apaga`

- **Anulação Definitiva** (`impulso:erase`): Causa 25 de dano de aflição a um inimigo. Exige a Marca criada por esta preparação no alvo. Se o alvo tem a marca desta preparação: +5 de dano; consome a preparação. Após usar, restaura Marca da Anulação.

## Erebus — O Arauto · `o-fim-silencioso`

- **Silêncio Residual** (`voto:residual`): Causa 20 de dano perfurante a um inimigo. Se o alvo tem 50 de Vida ou menos: +5 de dano.

## Ashen — O Desolador · `o-menino-sem-sombra`

- **Recolher a Presença** (`tecnica:hide`): Restaura 20 de Vida ao usuário. Reduz em 5 o dano recebido por 1 turno pelo usuário. Regeneração: restaura 3 de Vida no início dos próximos 2 turnos do beneficiado.

## Aegis — O Escudo Vivo · `o-escudo-vivo`

- **Avanço da Égide** (`impulso:advance`): Causa 20 de dano perfurante a um inimigo. Concede 5 de Defesa destrutível ao alvo. Se o usuário tem Defesa: +5 de dano. Após usar, restaura Golpe do Bastião.

## Theron — O Restaurador · `o-restaurador`

- **Reserva Imaculada** (`voto:pure`): Restaura 15 de Vida ao trio. Remove aflições e condições prejudiciais do trio. Consome Cargas: +5 de cura por Carga para cada aliado.

## Aldric — O Árbitro · `o-equilibrio`

- **Resposta Equânime** (`tecnica:verdict`): Causa 15 de dano espiritual a um inimigo. Restaura 10 de Vida ao usuário. Após usar, restaura Amparo Equânime.

## Aristides — O Regulador · `o-que-pesa`

- **Prato Ascendente** (`impulso:balance`): Causa 15 de dano espiritual a um inimigo. Marca o alvo por 3 turnos. Concede 10 de Defesa destrutível ao alvo. Ganha 1 Carga (máx. 3). Após usar, restaura Pesar os Atos.

## Caelum — A Perseverante · `a-chama-que-nao-apaga`

- **Chama do Recomeço** (`impulso:dawn`): Causa 20 de dano espiritual a um inimigo. Queimadura: 5 de dano de aflição por 2 turnos. Restaura 5 de Vida ao usuário. Após usar, restaura Fagulha do Amanhã.

## Hope — A Voz · `a-voz`

- **Coro de Muitas Vozes** (`impulso:chorus`): Causa 10 de dano espiritual a todos os inimigos. Marca o alvo por 3 turnos.
- **Encerrar o Hino** (`tecnica:solo`): Restaura 15 de Vida ao usuário. Após usar, restaura Palavra de Coragem. Após usar, restaura Hino da Perseverança.

## Stella — A Mensageira · `a-mensageira-do-amanha`

- **Mensagem Recebida** (`impulso:delivered`): Causa 15 de dano espiritual a um inimigo. Após usar, restaura Sinal do Amanhã.

## Parrhasius — O Espelho · `o-espelho`

- **Estilhaço Devolvido** (`impulso:returned`): Causa 25 de dano perfurante a um inimigo. Remove bônus de dano, redução e contra-ataque do alvo. Após usar, restaura Imagem Verdadeira.

## Cartes — A Cartógrafa · `a-cartografa-da-clareza`

- **Atalho da Clareza** (`tecnica:shortcut`): Restaura 15 de Vida ao aliado. Aumenta em 5 o dano até o fim do próximo turno do beneficiado. Remove aflições e condições prejudiciais do beneficiado. Após usar, restaura Caminho Seguro.

## Trinity — Os Três Irmãos · `os-tres-irmaos`

- **Segunda Voz** (`impulso:second`): Restaura 15 de Vida ao aliado. Ganha 1 Carga (máx. 3). Abre Terceira Voz por 2 turno(s).
- **Terceira Voz** (`impulso:third`): Causa 20 de dano físico a um inimigo. Consome Cargas: +5 de dano por Carga. Após usar, restaura Primeira Cadência.

## Isolde — A Juramentada · `a-guardia-das-promessas`

- **Renovar o Pacto** (`tecnica:fulfill`): Restaura 25 de Vida ao aliado. Remove aflições e condições prejudiciais do beneficiado. Após usar, restaura Honrar o Pacto.

## Cedric — O Artífice · `o-que-cria`

- **Forma que Rompe** (`impulso:construct`): Causa 25 de dano perfurante a um inimigo. Consome Cargas: +3 de dano por Carga. Após usar, restaura Fragmento Nascente.

## Sprout — A Semente · `a-semente`

- **Fruto do Porvir** (`impulso:fruit`): Restaura 20 de Vida ao usuário. Concede 10 de Defesa destrutível ao usuário. Consome todas as Cargas.

## Verdant — A Arquiteta · `a-arquiteta-verde`

- **Viga de Apoio** (`impulso:beam`): Concede 15 de Defesa destrutível ao aliado. Regeneração: restaura 3 de Vida no início dos próximos 2 turnos do beneficiado. Após usar, restaura Pilar Ascendente.
- **Colapsar a Abóbada** (`voto:collapse`): Causa 20 de dano físico a todos os inimigos. Após usar, restaura Pilar Ascendente. Após usar, restaura Convergência dos Pilares.

## Chronos — O Descontínuo · `o-passo-interrompido`

- **Passo Seguinte** (`impulso:next`): Causa 20 de dano perfurante a um inimigo. Ganha 1 Carga (máx. 3). Abre Passo Anterior por 1 turno(s).
- **Passo Anterior** (`impulso:previous`): Causa 15 de dano espiritual a um inimigo. Enfraquece o alvo por 2 turnos. Após usar, restaura Fissura do Passo.

## Fract — A Cindida · `a-linha-partida`

- **Reatar a Linha** (`impulso:mend`): Concede 15 de Defesa destrutível ao aliado. Remove aflições e condições prejudiciais do beneficiado. Após usar, restaura Extremidade Solta.

## Echo — O Eco · `o-eco-sem-dono`

- **Ressonância Roubada:** Anular uma técnica física abre por 2 turnos um kit inteiro de resposta: golpe que gera carga, amparo coletivo e descarga em área.
- **Eco sem Origem** (`impulso:stolen`): Causa 10 de dano espiritual a um inimigo. Ganha 1 Carga (máx. 3).
- **Voz Devolvida** (`tecnica:stolen`): Concede 10 de Defesa destrutível ao trio. Remove aflições e condições prejudiciais do trio.
- **Ressonância Roubada** (`voto:stolen`): Causa 15 de dano espiritual a todos os inimigos. Consome Cargas: +5 de dano por Carga. Após usar, restaura Coro sem Origem.

## Rift — A Errante · `a-porta-que-flutua`

- **Passagem de Retorno** (`impulso:return`): Restaura 10 de Vida ao aliado. Concede 10 de Defesa destrutível ao aliado. Após usar, restaura Abertura Impossível.

## Chronicle — O Cronista · `o-relogio-afogado`

- **Retomar o Instante** (`voto:release`): Causa 35 de dano espiritual a um inimigo. Consome Cargas: +5 de dano por Carga. O usuário perde 5 de Vida (não pode ser derrotado por este custo). Após usar, restaura Devolver os Segundos.

## Lyra — A Inversa · `a-asa-invertida`

- **Peso da Asa** (`impulso:weight`): Causa 15 de dano espiritual a um inimigo. Sela técnicas ofensivas por 1 turno do alvo. Após usar, restaura Pena ao Contrário.

## Shade — A Oscilante · `a-sombra-inconstante`

- **Contorno de Abrigo:** Troca a ofensiva inicial por recuperação e contra-ataque até Retomar a Sombra.
- **Fingir Presença** (`impulso:feign`): Restaura 10 de Vida ao usuário. Anula a próxima habilidade inimiga de qualquer tipo recebida e contra-ataca com 10 de dano. Dura 1 turno.
- **Retomar a Sombra** (`tecnica:resume`): Restaura 10 de Vida ao usuário. Remove aflições e condições prejudiciais do beneficiado. Após usar, restaura Sombra Atrás da Alma. Após usar, restaura Mudar de Contorno.

## Soren — O Eremita · `a-alma-em-suspenso`

- **Fôlego Emprestado** (`impulso:lend`): Restaura 25 de Vida ao aliado. Regeneração: restaura 4 de Vida no início dos próximos 2 turnos do beneficiado. Consome todas as Cargas.
