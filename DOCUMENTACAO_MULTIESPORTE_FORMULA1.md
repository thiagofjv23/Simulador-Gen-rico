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
