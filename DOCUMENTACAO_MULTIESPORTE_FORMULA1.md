# Implantação multiesporte e Fórmula 1

## Escopo preservado

Calendário, passagem do tempo, geografia, critérios de classificação, convites,
classificatórias e a fórmula de resolução de performance não foram
reescritos. A implantação acrescenta camadas novas aos pontos, rankings,
presets e à interface.

## 1. Pontuação proporcional do tênis

O arquivo `js/scoring.js` centraliza sistemas de pontuação. A regra
`tennis-round-proportional` recebe o valor máximo da competição e a posição:

| Posição | Percentual |
| ---: | ---: |
| 1 | 100% |
| 2 | 65% |
| 3–4 | 40% |
| 5–8 | 20% |
| 9–16 | 10% |
| 17–32 | 5% |
| 33 em diante | 0,5% |

As posições inexistentes não são calculadas. O resultado é arredondado para um
ponto inteiro, mantendo o banco e a interface compatíveis com a pontuação
anterior.

## 2. Rankings por esporte e modalidade

Atletas agora possuem `sportId` e `modalityId`. O identificador persistente é:

```text
ranking_<sportId>_<modalityId>
```

O motor entrega a cada simulação somente o ranking correspondente à competição.
Após o resultado, apenas as entradas daquele ranking são atualizadas e
mescladas novamente ao estado global.

Os 100 atletas anteriores começam com os dois campos nulos. Na primeira
importação de preset, são ligados uma única vez ao esporte e à modalidade do
preset. A escolha fica registrada em `world.initialSportPresetId`.

## 3. Preset Fórmula 1

Fonte do calendário:

<https://www.formula1.com/en/latest/article/formula-1-reveals-calendar-for-2026-season.YctbMZWqBvrgyddrnauo8>

Fonte do grid:

<https://www.formula1.com/en/drivers>

Foram cadastradas 24 etapas, todas com diferença de dois dias entre início e
fim, totalizando três dias inclusivos. Os 22 pilotos possuem IDs estáveis,
nacionalidade, idade aproximada em 2026, `baseRating`, `momentum` e o nome da
equipe apenas como texto.

Os ratings medem força individual aproximada, não força do carro. Isso é
intencional porque equipes ainda não são entidades e a fórmula genérica de
resultado foi preservada.

## 4. Temporada anual

As etapas usam:

```text
competitionModel: season_stage
seasonId: formula1-world-championship
seasonalRanking: true
recurrence: yearly
```

Cada resultado soma os pontos fixos de Grande Prêmio:

```text
25, 18, 15, 12, 10, 8, 6, 4, 2, 1
```

A 24ª etapa grava `seasonChampion` no resultado persistente. Quando o relógio
alcança 1º de janeiro, entradas sazonais de outro ano recebem zero pontos, zero
participações e o novo `seasonYear`.

## 5. Interface

O cadastro de competição ganhou:

- `Sistema de Pontuação`, com explicação e prévia numérica;
- `Modelo da competição`, com explicação;
- painel de nome do campeonato anual para etapas de temporada.

As fichas das competições mostram sistema de pontos, modelo e número da etapa.
A tela de resultados mostra o sistema usado e destaca o campeão no fim da
temporada. A tela de rankings ganhou seletores dependentes de esporte e
modalidade antes dos seletores territoriais.

## 6. Persistência e compatibilidade

O IndexedDB foi elevado da versão 7 para a versão 8. Foram adicionados índices
de esporte e modalidade às coleções de pessoas e rankings. Nenhuma coleção
anterior é apagada ou recriada.

Rankings antigos com ID `world` continuam no banco para preservar saves. Quando
um preset já importado é encontrado, os atletas genéricos são migrados para o
ranking esportivo correspondente sem apagar resultados anteriores.

## 7. Testes

Foram verificados:

- percentuais do tênis em torneio de 1.000 pontos;
- adaptação a uma chave de quatro atletas;
- escala fixa da Fórmula 1 e zero a partir do 11º;
- independência dos rankings esportivos;
- atribuição única dos atletas genéricos;
- zeramento de ranking sazonal;
- 24 etapas de três dias;
- 22 pilotos com equipe no nome;
- 22 participantes e 101 pontos totais por Grande Prêmio;
- campeão registrado na última etapa;
- nova temporada ignorando os pontos do ano anterior;
- contratos da interface e todos os 54 testes anteriores.

Resultado final: 69 testes aprovados.

## 8. Central dos Esportes e histórico

A aba `Ranking` passou a ser a **Central dos Esportes**, um hub com sub-abas.

- `js/newsroom.js` gera, a partir dos resultados, as notícias de evento e de
  campeonato encerrado, a lista dos dez maiores ratings (`Os Melhores`) e o
  painel dos quatro últimos vencedores com pódio. Cada notícia e cada vencedor
  levam ao resultado ou ao ranking final por hiperlink.
- `js/history.js` reconstrói o histórico sem gravar nada novo: `finishedEvents`
  alimenta a tela `Campeões`; `pastSeasons` soma os pontos de todas as etapas
  para remontar a classificação final de cada temporada na tela `Temporadas`;
  `athleteCompetitionHistory` monta o details de cada atleta respeitando o
  prestígio — posição final por temporada nas modalidades sazonais e, no máximo,
  as dez últimas competições nas cumulativas.
- Os resultados passaram a registrar `sportId` e `modalityId`, permitindo que os
  hiperlinks pré-selecionem o esporte e a modalidade corretos.

Cobertura adicional em `test/newsroom.test.js` e `test/history.test.js`, além dos
novos contratos de interface. Total após esta etapa: 82 testes aprovados.

## 9. Ecossistema FIA (F1 + F2 + F3)

O preset de Fórmula 1 virou o **Ecossistema FIA — 2026**, agora
**multimodalidade**. Duas modalidades sazonais novas entraram no catálogo
(`Fórmula 2` e `Fórmula 3`), ambas sob `Automobilismo`.

- `js/presets.js` ganhou o conceito de **série**. `presetSeries(preset)` normaliza
  qualquer preset numa lista de séries: presets antigos de uma modalidade (ATP)
  viram uma série; o Ecossistema FIA expõe três (F1, F2, F3). `buildPresetCompetitions`
  e `buildPresetPeople` iteram as séries, então cada categoria carrega seus
  próprios pilotos, calendário, pontuação e temporada anual.
- As etapas de F2 (14 rodadas) e F3 (10 rodadas) reaproveitam as datas do Grande
  Prêmio correspondente da F1 via `buildSupportRounds`, garantindo janelas de três
  dias já coerentes com o calendário. Para presets multimodalidade o ID da etapa
  inclui a modalidade (`preset_<id>_<modalityId>_<round>`), evitando colisão entre
  categorias que dividem o mesmo fim de semana. Presets de série única mantêm o ID
  antigo.
- Os grids de F2 (11 equipes × 2) e F3 (10 equipes × 3) seguem o mesmo formato de
  nome da F1 (`Piloto (Equipe)`), com ratings aproximados. Total: 48 etapas e 74
  pilotos.
- `ensurePresetRoster` passou a construir um ranking por série. Os 100 atletas
  genéricos, quando o Ecossistema é o primeiro preset importado, são vinculados
  apenas à série principal (F1); F2 e F3 recebem somente seus próprios pilotos.
- Nenhuma outra mecânica foi alterada: pontuação, simulação, geografia, convites
  e a passagem do tempo continuam iguais.

Cobertura em `test/presets.test.js` (F1, F2, F3 e IDs únicos das 48 etapas) e
`test/sports.test.js`; `test/formula1-season.test.js` foi ajustado para a nova
identidade do preset. Total após esta etapa: 84 testes aprovados.

## 10. Fórmula Regional no Ecossistema FIA

A quarta série do preset é a **Fórmula Regional**, usando a FIA Formula Regional
European Championship (FREC) de 2026. Diferente de F2/F3, a categoria não corre
nos fins de semana da F1, então o calendário tem circuitos e datas próprios.

- Nova modalidade sazonal `modality_motorsport_formula_regional` no catálogo.
- `FORMULA_REGIONAL_2026_ROUNDS`: 8 rodadas oficiais (Red Bull Ring 24–26/04,
  Zandvoort 22–24/05, Spa 29–31/05, Monza 19–21/06, Hungaroring 03–05/07, Paul
  Ricard 17–19/07, Imola 04–06/09, Hockenheim 11–13/09), cada uma com janela de
  três dias definida diretamente.
- `FORMULA_REGIONAL_2026_DRIVERS`: entry list completa de 10 equipes × 3 pilotos
  (30 no total), com nacionalidades reais buscadas na temporada em andamento.
  Pilotos, equipes e calendário são reais; apenas os ratings são aproximados.
- Prestígio 55, abaixo da F3 (70), mantendo a hierarquia das categorias.

Nenhuma mecânica fora do preset foi alterada. Cobertura adicional em
`test/presets.test.js` (8 rodadas, 30 pilotos, IDs únicos das 56 etapas) e
`test/sports.test.js`. Total após esta etapa: 85 testes aprovados.

Fontes: calendário oficial FIA/ACI e a entry list de 2026 (FIA/ACI Sport,
Formula Scout, Feeder Series e páginas das temporadas em andamento).

## 11. Fórmula 4 — avaliada, não incluída

A Fórmula 4 foi pesquisada para entrar no Ecossistema FIA, mas **não foi incluída**
por não ter sido possível reunir todos os dados confiáveis da temporada 2026,
seguindo a diretriz de "na impossibilidade de encontrar todos os dados, não inclua
a categoria e documente o que foi encontrado e o que está faltando".

Referência escolhida: **FIA Italian F4 Championship 2026** (a F4 de referência,
certificada pela FIA/WSK).

O que foi encontrado:

- **Calendário completo** — 7 rodadas, todas na Itália: Misano (8–10/05),
  Vallelunga (22–24/05), Monza (19–21/06), Mugello (24–26/07), Imola (4–6/09),
  Misano (18–20/09) e a final em Mugello (23–25/10).
- **Estrutura do grid** — recorde histórico de **49 pilotos, 13 equipes e 27
  nações**, com entry list que **varia a cada rodada** (47 na abertura, 49 em
  Mugello). Equipes confirmadas incluem Prema, US Racing, Van Amersfoort Racing,
  PHM Racing, Maffi Racing, Alpha 54 Racing, Trident, AKM Motorsport, Cram
  Motorsport, Jenzer Motorsport e R-ace GP (ex-BVM), entre outras.

O que está faltando para incluir com a mesma qualidade das outras categorias:

- a **entry list completa e estável** — 1 a 2 equipes não foram confirmadas e
  vários pilotos não puderam ser verificados;
- as **nacionalidades** de boa parte dos 49 pilotos;
- ao contrário de F1/F2/F3/Fórmula Regional (grids fixos de 2–3 pilotos por
  equipe), a F4 tem grid grande e variável, que não encaixa no modelo de
  participantes fixos por etapa sem aproximações relevantes.

As páginas com a tabela completa (Wikipedia, Liquipedia, DriverDB, site oficial)
retornaram HTTP 403 à leitura automatizada; os dados acima vieram de trechos de
busca (FIA/ACI, Formula Scout, Feeder Series, Pit Debrief, f4championship.com).

Caminho para incluir depois: assim que houver uma entry list fechada e confiável
de 2026 — ou caso se aceite uma **aproximação** no mesmo formato de F2/F3 —, basta
adicionar a modalidade `Fórmula 4` ao catálogo e uma nova série ao preset, sem
tocar em nenhuma outra mecânica.

## 12. Tiers, Fórmula Regional Oriente Médio e atletas compartilhados

A Fórmula Regional passou a ser explicitamente a **Europeia** e ganhou uma irmã
de mesmo tier, a **Oriente Médio**. As mudanças ficaram restritas ao preset.

- **Renomeação**: as 8 etapas da Regional Europeia agora se chamam
  `Fórmula Regional Europeia — <etapa>` e a modalidade exibe "Fórmula Regional
  Europeia". O `modalityId` foi preservado para não afetar o ranking existente.
- **Tiers**: cada série do preset ganhou o metadado `tier` (1 = F1, 2 = F2,
  3 = F3, 4 = Regionais). É só um agrupamento; categorias do mesmo tier convivem
  com rankings próprios e independentes.
- **Fórmula Regional Oriente Médio**: nova modalidade sazonal
  `modality_motorsport_formula_regional_middle_east` e nova série com o calendário
  oficial de 4 etapas (Yas Marina ×2, Dubai, Lusail) e o grid de 36 pilotos de
  2026 fornecido.
- **Atletas compartilhados**: a série marca `linkExistingByName: true`. Em
  `js/presets.js`, a nova função `resolvePresetRoster` percorre as séries e, para
  uma série vinculadora, reaproveita o atleta já criado por outra categoria
  quando o nome coincide (comparação sem acentos), mantendo o rating de origem —
  25 dos 36 pilotos do Oriente Médio são compartilhados; 11 são exclusivos.
  `buildPresetPeople` passou a devolver apenas as pessoas realmente novas e
  `buildPresetCompetitions` usa os IDs resolvidos como `participantIds`.
- **Ranking por série**: `ensurePresetRoster` monta o elenco de cada ranking com
  os atletas da modalidade **mais** os participantes vinculados de outra
  categoria, para que o mesmo piloto apareça nos dois campeonatos.
- **Seleção de participantes**: `selectParticipants` deixou de refiltrar por
  modalidade (o ranking já chega restrito pelo `rankingId`), permitindo que um
  atleta com modalidade principal diferente dispute a segunda categoria. As
  barreiras de esporte e geográfica seguem intactas. Foi o único ajuste fora do
  preset, necessário para viabilizar o vínculo pedido.

O ecossistema passa a ter 60 etapas e 115 pilotos em 5 campeonatos. Cobertura
adicional em `test/presets.test.js` (Oriente Médio, vínculo de homônimos, IDs das
60 etapas) e `test/sports.test.js`. Total após esta etapa: 87 testes aprovados.

Fonte da Fórmula Regional Oriente Médio: database oficial de 2026 fornecida
(calendário de 4 etapas e grid de 36 pilotos).

## 13. Elenco real no preset da ATP

O preset `atp-world-tour-2026` deixou de depender só dos 100 atletas genéricos e
ganhou uma database de atletas, do mesmo jeito que os grids de automobilismo.

- `ATP_2026_PLAYERS`: top 50 do ranking mundial da ATP de 2026, com nomes e
  nacionalidades reais e ratings aproximados. Foi só adicionar o campo `athletes`
  ao preset — nenhuma outra configuração mudou.
- Diferença em relação ao automobilismo: o tênis não tem equipes, então o nome
  não recebe sufixo `(Equipe)`; e o preset é `standalone` (não é etapa de
  temporada), então os torneios seguem preenchendo as vagas por ranking, sem
  `participantIds` fixos. Os 50 reais e os 100 genéricos convivem no mesmo pool,
  o que mantém o preenchimento de chaves grandes (128 num Grand Slam).
- Como o ranking do tênis é cumulativo, os ratings dos reais os colocam no topo
  da classificação inicial; os pontos se acumulam torneio a torneio.

Cobertura em `test/presets.test.js` (50 jogadores, modalidade correta, sem sufixo
de equipe, torneios ainda por ranking). Total após esta etapa: 88 testes
aprovados.

Fontes do ranking ATP 2026: rankings ao vivo da ATP e cobertura da temporada
(ATP Tour, Olympics.com, Tennis Abstract).

## 14. Resolução de etapa — Formato da Prova

Preparando o motor para novos esportes, começou a lógica de resolução de etapa:
o que acontece dentro do evento para se chegar ao resultado, e não só o
resultado final. O primeiro passo é o **Formato da Prova**, em `js/eventformat.js`
(puro e determinístico via sorteador injetado).

`EVENT_FORMATS` traz seis formatos, e `resolveStage` devolve a classificação
(posições 1..N) mais os dados estruturais do confronto:

- **Ranqueamento individual** — todos fazem a mesma prova; ranqueia-se pela marca.
- **Baterias / corridas** — divide em grupos (serpentina por semente), corre cada
  bateria e junta tudo; expõe `heatNumber`/`heatPosition`.
- **Todos contra todos** — cada par joga (`resolveMatch`); classifica por pontos,
  com registro de vitórias/empates/derrotas.
- **Eliminação simples** — chave 1x1; uma derrota elimina; posição pela rodada de
  eliminação; o campeão soma mais vitórias.
- **Eliminação dupla** — só sai quem perde duas vezes (chave de vencedores +
  repescagem, agrupando por número de derrotas).
- **Sistema suíço** — rodadas fixas, emparelhando pontuações parecidas sem
  eliminação e evitando revanches.

Cobertura em `test/eventformat.test.js` (formato por formato, invariantes de
posição, determinismo). Total após esta etapa: 97 testes aprovados.

## 15. Resolução de etapa — Sistema de Pontuação e Métrica

O segundo passo é como o resultado de cada participante é medido e pontuado
dentro da etapa, em `js/metric.js` (depois que o formato já definiu a ordem).

`RESULT_METRICS` traz as três métricas, e `applyResultMetric` decora a
classificação do formato:

- **Marca direta** — o resultado é o próprio número (tempo em s, distância em m
  ou peso em kg). `computeMark` é uma transformação determinística e **monótona**
  da performance, então a marca sempre combina com a posição; `MARK_TYPES` define
  a direção (menor é melhor no tempo, maior na distância e no peso).
- **Placar de jogo** — vitória/empate/derrota rendem pontos (padrão 3/1/0,
  configurável) a partir do registro de confrontos do formato.
- **Tabela de posição** — cada colocação vale pontos fixos (padrão 10-8-6-...).

A métrica **não reordena**: a ordem vem do formato, que já é coerente com a
marca. Estes pontos de evento são exibidos no resultado e não se confundem com
os pontos de ranking (que seguem em `js/scoring.js`, por posição final).

Cobertura em `test/metric.test.js` (as três métricas, monotonia da marca,
coerência com a posição). Total após esta etapa: 103 testes aprovados.

## 16. Formato e métrica selecionáveis no gerador de competições

O cadastro de competição (nosso gerador de etapas) ganhou dois seletores novos,
logo abaixo do sistema de pontuação:

- **Formato da prova** — os seis formatos de `EVENT_FORMATS`.
- **Sistema de pontuação e métrica** — as três métricas de `RESULT_METRICS`.

Cada seletor tem uma **janelinha de contexto** (`#event-format-help` e
`#result-metric-help`) que, via `updateEventFormatFields`, explica ao jogador
para que serve a opção escolhida. Dois campos dependentes aparecem só quando
fazem sentido: **tipo de marca** (tempo/distância/peso) na marca direta e
**participantes por bateria** no formato de baterias.

As escolhas são gravadas na competição (`eventFormat`, `resultMetric`,
`markType`, `heatSize`), validadas em `js/competition.js` (aceitando ausência
como padrão, para não quebrar competições antigas) e exibidas como selo na ficha
da competição. Nada além do gerador de competições foi tocado.

Cobertura de contrato em `test/ui-contract.test.js`. Total após esta etapa: 104
testes aprovados.

## 17. Integração no motor e verificação dos presets

Para o formato/métrica saírem do papel, `simulateCompetition` passou a usar a
resolução de etapa, com **compatibilidade total**: uma competição **sem**
`eventFormat`/`resultMetric` (todos os presets e tudo que já existia) segue o
caminho antigo, byte a byte — mesma ordenação, mesmos campos, mesmo consumo do
sorteador. Só quando a competição define um formato não-individual é que
`resolveStage` entra; só quando define uma métrica é que `applyResultMetric`
decora a classificação com marca, registro ou pontos de evento. O resultado
guarda `eventFormat`, `resultMetric` e `markType`, e a tela de Resultados ganha
uma coluna "Resultado" (e selos) **apenas** quando há métrica.

**Verificação dos presets**: como os presets não definem esses campos, eles
continuam funcionando sem qualquer ajuste — a resolução padrão reproduz o
comportamento anterior. Confirmado pelos testes (todos os antigos seguem verdes)
e por um teste de navegador: um preset simula sem a coluna "Resultado", enquanto
uma competição de baterias com marca direta mostra o tempo (ex.: `20.00 s · B1`).
Nenhum preset precisou de mudança.

Cobertura em `test/simulation.test.js` (baterias com marca, todos contra todos
com placar, e a garantia de que sem configuração o resultado não muda). Total
após esta etapa: 107 testes aprovados.

## 18. Atletismo — esporte, modalidades e ranking rolante

Novo esporte `Atletismo` com **24 modalidades** individuais olímpicas em
`js/sports.js` (corridas, barreiras, fundo, marcha, saltos, lançamentos e provas
combinadas). Cada modalidade guarda `windowMonths` e `bestN` inspirados na World
Athletics.

O atletismo estreia um **terceiro modelo de ranking**, o **rolante** (`rolling`),
em `js/athletics.js`: cada etapa concede pontos e o ranking do atleta é a **média
das N melhores marcas dentro de uma janela móvel** (12 meses na maioria, 18 nas
provas longas e combinadas). Marcas fora da janela expiram sozinhas — o ranking
nunca vira soma infinita. Tudo é reconstruído a partir dos resultados
persistidos, como o histórico e as temporadas; nada extra é gravado.

Funções puras: `windowStartDate`/`isWithinWindow` (janela), `rollingRankingScore`
(média das N melhores), `buildRollingRankingEntries` (ranking de uma modalidade)
e `mergeRollingRanking` (recalcula só as modalidades rolantes e preserva tênis,
F1 etc.). Combina naturalmente com os formatos/métricas: 100 m → baterias + marca
direta (tempo); salto em distância → ranqueamento individual + marca direta
(distância); arremesso de peso → marca direta (peso).

Cobertura em `test/athletics.test.js` e `test/sports.test.js` (3º esporte, 24
modalidades rolantes). Total após esta etapa: 115 testes aprovados.

## 19. Integração do ranking rolante no app

`mergeRollingRanking` foi ligado ao `app.js` por `recomputeRollingRankings`, que
recalcula em memória só as modalidades rolantes a partir dos resultados, usando a
data atual como referência da janela. Como o ranking rolante é **derivado dos
resultados**, ele não é gravado à parte — é refeito nos três momentos em que pode
mudar:

- ao **carregar** o save (`loadCurrentGame`);
- depois de **cada dia simulado** (`processSimulationDate`), para a seleção das
  próximas etapas já usar a média correta;
- ao **fim de cada avanço** (`advanceTime`), pois marcas podem sair da janela com
  o passar do tempo mesmo sem novas competições.

Nada fora disso mudou: tênis, F1 e as Regionais seguem intactos, e um smoke de
navegador confirma que o Atletismo aparece nos seletores (ranking e gerador de
competições) e que avançar o tempo recalcula sem erros. Total mantido: 115 testes
aprovados (a integração é no `app.js`, coberta pelo módulo puro e pelo smoke).

## 20. Elenco inicial do atletismo — Liga Mundial 2026

Preset `world-athletics-2026`, tornando o esporte jogável de imediato:

- **6 provas × 5 encontros = 30 competições** e **48 atletas reais** (8 por prova):
  100 m, 800 m, 1500 m, salto em distância, salto em altura e arremesso de peso,
  em Doha, Roma, Oslo, Paris e a final de Zurique. Nomes/nacionalidades reais,
  ratings aproximados (elenco inicial, expansível às 24 modalidades).
- Cada prova declara sua **resolução de etapa**: corridas usam baterias + marca
  direta de tempo; saltos e arremesso usam ranqueamento individual + marca direta
  de distância. `presetSeries`/`buildPresetCompetitions` passaram a propagar
  `eventFormat`/`resultMetric`/`markType`/`heatSize` (só o atletismo os usa; os
  demais presets continuam no padrão).
- **Bootstrapping resolvido**: `recomputeRollingRankings` só recalcula as
  modalidades que já têm resultado, então provas ainda não disputadas mantêm o
  elenco inicial (entradas de roster) e seus atletas permanecem elegíveis na
  primeira etapa. Com 8 atletas por prova e 8 vagas, todos correm em cada encontro
  e o ranking rolante se popula por completo.
- **Genéricos preservados**: como o atletismo é rolante e traz elenco próprio,
  `ensurePresetRoster` não vincula os 100 atletas genéricos a ele — eles seguem
  reservados ao primeiro preset cumulativo/sazonal.

Smoke de navegador ponta a ponta: importar o preset, avançar pelos encontros e
ver o ranking rolante do 100 m com 8 atletas e pontuação **média** (≤ 100, não
soma), o resultado da corrida mostrando o tempo (`20.40 s · B1`) e o do salto
mostrando a distância (`19.93 m`). Cobertura em `test/presets.test.js`. Total após
esta etapa: 116 testes aprovados.
