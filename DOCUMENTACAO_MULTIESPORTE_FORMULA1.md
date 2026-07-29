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
