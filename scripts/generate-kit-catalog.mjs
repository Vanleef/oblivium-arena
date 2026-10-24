import {writeFile} from 'node:fs/promises';
import {characters,elos,resourceById} from '../src/data.js';
import {archetypeCatalog} from '../src/archetypes.js';
import {allSkillForms} from '../src/kits.js';
import {getAbilityResourceCosts} from '../src/combat.js';
const names=Object.fromEntries(Object.values(resourceById).map(r=>[r.id,r.name]));
const lines=[`# PMA — kits e regras de combate

Catálogo gerado a partir dos dados jogáveis. Atualize com \`node scripts/generate-kit-catalog.mjs\`.

## Fluxo

1. Escolha uma habilidade e um alvo destacado.
2. Cada personagem usa uma ação por turno. A fila reserva Essência.
3. Reordene ou remova ações, revise, escolha o pagamento Qualquer e confirme em Pronto.
4. As ações aliadas e a resposta adversária resolvem uma a uma.
5. Aflições e durações são atualizadas antes do próximo planejamento.

## Afinidades e Essência

- A quarta técnica das 100 almas concede Invulnerável por uma resposta adversária. Custa 1 Qualquer; fica indisponível nos quatro turnos próprios seguintes.
- A reserva de Essência tem cinco tipos: Éter, Cinza, Graça, Ruptura e Coringa. Qualquer é um custo flexível pago com qualquer combinação desses tipos; não é um sexto tipo sorteado.
- A afinidade de cada alma é definida pelas técnicas, passivas e formas do kit. Personagens do mesmo reino podem usar tipos diferentes; o Elo não determina a afinidade.
- Desde a abertura, cada lado recebe 1 Essência aleatória por personagem vivo no começo de cada rodada. Cada tipo tem 20% de chance por sorteio e o saldo acumula sem limite. Com 5 unidades, escolha quais pips gastar e troque-os por 1 unidade de um tipo específico; a conversão reduz o saldo líquido em 4.
- Gerar, converter, gastar e roubar/drenar Essência são identidades separadas no Codex: Gerador de Essência cria uma reserva, Transmutador troca tipos, Gastador transforma pagamento em efeito e Manipulador de Essência interfere na reserva adversária.
- Ressonância concede +8% para uma dupla do mesmo Elo, +15% para o trio do mesmo Elo, +11% para dupla com Limbo e +6% para uma equipe sem dupla de Elo que inclua Limbo.
- Combos ganham +1 de dano por aliado adicional vivo do mesmo Elo, até +2; o bônus só entra quando a condição do combo é atendida.
- Sinergias de Mundo acompanham a composição viva: aliados do Inferno aumentam aflições aplicadas em até 2, aliados do Paraíso reforçam curas em até 2 e presença do Limbo concede até 2 de Defesa ao trio no início da rodada.
- Corpos distintos podem usar tipos de Essência diferentes; o seletor de formas do Codex mostra a afinidade e o kit de cada corpo.
- Invulnerável impede novas habilidades inimigas; aflições anteriores continuam.
- Dano perfurante ignora redução; aflição ignora redução e Defesa destrutível.
- Contra-ataque anula a próxima habilidade compatível recebida e responde uma vez com dano físico. Pode filtrar tipo de dano, exigir Defesa destrutível e roubar/drenar Essência, gerar Essência, expor ou marcar o agressor.
- Exposição dura até o fim do próximo turno do lado que a aplicou, permitindo a continuação do próprio personagem. O dano que aplica Exposição não recebe seu próprio bônus.
- Bônus de dano dura até o fim do próximo turno do beneficiado. Pode beneficiar aliados que ainda agirão na fila atual.
- Enfraquecimento reduz 10 de dano durante os turnos do alvo indicados na habilidade. Preparações dos quatro combos de Enfraquecimento duram 2 turnos.
- Marcas pertencem a quem as aplicou. Cargas vão de 0 a 3. Bônus por carga usa as cargas anteriores à ação; ganho e consumo ocorrem uma vez por habilidade não anulada.
- Benefícios pessoais e passivas de uma técnica em área ocorrem uma vez por uso. Dano, cura coletiva e Defesa coletiva atingem cada alvo válido.
- Regeneração recupera Vida no início dos turnos indicados. Reaplicar a mesma técnica da mesma origem renova o efeito sem acumular cópias.
- Armadilhas reagem uma vez à condição descrita e expiram após a próxima vez do alvo. Reações de amparo respondem à perda de Vida por novas habilidades durante a resposta adversária. Reações não encadeiam outras reações.
- Selos de apoio e ofensiva cancelam apenas a categoria indicada; a quarta defesa continua disponível sob selo de apoio. Recargas reduzidas por apoio nunca incluem a quarta defesa.
- Variações ocupam o mesmo espaço e compartilham a ação e a recarga. Uma técnica pode mudar por preparação, contra-ataque ativado, Vida, cargas ou esgotamento de usos. Janelas indicam quantos turnos próprios seguintes permanecem abertas. Posturas sem duração acabam apenas pelo efeito de reversão.
- Quando uma preparação abre uma continuação no mesmo espaço, sua recarga é adiada até a continuação terminar ou expirar. A quarta defesa nunca é substituída.
- Técnicas em área com maior potencial de explosão custam 3 unidades de Essência. Custos aparecem no jogo como quadrados coloridos.

## Referências de estrutura

- https://naruto-arena.online/the-basics/
- https://soul-arena.io/the-basics

Os kits usam as identidades e os conceitos do PMA. Testes cobrem a execução de cada combo, custos, uso de marcas e cargas, durações e a quarta defesa. O ajuste fino entre equipes e dificuldades depende de partidas e iterações de balanceamento.

## Arquétipos

O arquétipo principal descreve a identidade de cada kit; os secundários registram outras ferramentas que ele explora. Cada alma pode combinar até cinco identidades. O contexto curto explica a função do arquétipo, e a variação abaixo nomeia a forma particular como aquele personagem o executa.

${Object.entries(archetypeCatalog).map(([id, archetype]) => {
  const count=characters.filter(c=>c.archetypes.includes(id)).length;
  return `- **${archetype.icon} ${archetype.name}** (${count} kits): ${archetype.context}`;
}).join('\n')}
`];
for(const elo of elos){lines.push(`## Elo ${elo.name}\n`);for(const c of characters.filter(c=>c.eloId===elo.id)){
 const affinity=resourceById[c.affinity]?.name||'Essência';
 const secondary=c.archetypeDetails.slice(1).map(a=>a.name).join(', ')||'—';
 lines.push(`### ${c.name} — ${c.archetypeName}\n\n**Variação:** ${c.archetypeVariant} · **Essência:** ${affinity}\n\n**Outros arquétipos:** ${secondary}\n\n${c.combo}\n\n${c.mechanic?`**Estrutura:** ${c.mechanic}\n\n`:""}**Passiva — ${c.passive.name}:** ${c.passive.description}\n`);
 for(const a of allSkillForms(c)){const cost=Object.entries(getAbilityResourceCosts(c,a)).map(([id,n])=>`${n} ${names[id]||id}`).join(' + ');lines.push(`- **${a.name}**${a.formKey?" [variação]":""} (${cost}; recarga ${a.cooldown}T): ${a.description}`);}
 lines.push('');
}}
await writeFile(new URL('../docs/COMBAT_KITS.md',import.meta.url),`${lines.join('\n')}\n`);
console.log(`Catálogo atualizado: ${characters.length} kits, ${characters.flatMap(allSkillForms).length} técnicas, incluindo variações.`);
