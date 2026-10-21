import {writeFile} from 'node:fs/promises';
import {characters,elos,resources} from '../src/data.js';
import {getAbilityResourceCosts} from '../src/combat.js';
const names=Object.fromEntries(resources.map(r=>[r.id,r.name]));
const lines=[`# PMA — kits e regras de combate

Catálogo gerado a partir dos dados jogáveis. Atualize com \`node scripts/generate-kit-catalog.mjs\`.

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
`];
for(const elo of elos){lines.push(`## Elo ${elo.name}\n`);for(const c of characters.filter(c=>c.eloId===elo.id)){
 lines.push(`### ${c.name} — ${c.role}\n\n${c.combo}\n\n**Passiva — ${c.passive.name}:** ${c.passive.description}\n`);
 for(const a of c.abilities){const cost=Object.entries(getAbilityResourceCosts(c,a)).map(([id,n])=>`${n} ${names[id]||id}`).join(' + ');lines.push(`- **${a.name}** (${cost}; recarga ${a.cooldown}T): ${a.description}`);}
 lines.push('');
}}
await writeFile(new URL('../docs/COMBAT_KITS.md',import.meta.url),`${lines.join('\n')}\n`);
console.log(`Catálogo atualizado: ${characters.length} kits, ${characters.flatMap(c=>c.abilities).length} habilidades.`);
