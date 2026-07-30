# Simulador Genérico — Multiesporte e Fórmula 1

Versão offline feita apenas com HTML, CSS, JavaScript e IndexedDB. Ela preserva
calendário, campeonatos modeláveis, geografia, ranking de 100 pessoas, simulação,
resultados e pontos das versões anteriores.

## O que esta versão acrescenta

- sistema de pontuação escolhido por competição e ligado ao esporte;
- escala proporcional do tênis por rodada;
- escala oficial de Grandes Prêmios da Fórmula 1;
- atletas vinculados a um único esporte e uma única modalidade;
- rankings persistentes e independentes por esporte e modalidade;
- rankings permanentes e rankings sazonais;
- esporte `Automobilismo` com as modalidades `Fórmula 1`, `Fórmula 2`, `Fórmula 3`, `Fórmula Regional Europeia` e `Fórmula Regional Oriente Médio`;
- preset `Ecossistema FIA — 2026` reunindo a pirâmide FIA (F1, F2, F3 e as Regionais) em quatro tiers dentro de um único preset multimodalidade;
- 60 etapas de três dias e repetição anual (24 de F1, 14 de F2, 10 de F3, 8 da Regional Europeia e 4 da Regional Oriente Médio);
- 115 pilotos de 2026 com a equipe exibida ao lado do nome, incluindo atletas que disputam duas categorias;
- classificação anual independente por categoria, campeão após a última etapa e
  zeramento automático em 1º de janeiro;
- modelo de competição visível: `Evento independente` ou
  `Etapa de temporada`;
- migração do IndexedDB para a versão 8 preservando os dados anteriores.

## Central dos Esportes

A antiga aba `Ranking` virou a **Central dos Esportes**, o elo principal do jogador
com o mundo esportivo. Ao abri-la, a primeira tela é uma visão geral com:

- **Notícias** geradas automaticamente a cada competição concluída. Toda edição
  encerrada vira uma notícia de evento com hiperlink `Ver resultado`; todo
  campeonato anual encerrado acrescenta uma notícia de campeão com hiperlink
  `Ver ranking final`;
- **Os Melhores**, os dez esportistas com os maiores ratings entre todos os
  atletas já vinculados a um esporte, do maior para o menor;
- **Últimos vencedores**, os quatro torneios mais recentes em quadrados
  individuais, cada um mostrando o pódio dos três primeiros com hiperlink para o
  resultado completo.

A Central mantém um **seletor de rankings visível**. O botão
`Rankings por esporte e localidade` e a aba `Rankings` levam à mesma tela de
classificação por esporte, modalidade e abrangência territorial que já existia —
agora acessada de dentro da Central.

## Histórico esportivo

A Central dos Esportes ganhou duas telas de histórico e um detalhamento por
atleta, todos reconstruídos a partir dos resultados persistentes — nenhum dado
extra é gravado.

- **Campeões**: lista de todos os eventos já concluídos, do mais recente ao mais
  antigo, com o campeão de cada edição e um hiperlink para o resultado completo.
  Um filtro por nome, esporte ou competição facilita a navegação.
- **Temporadas**: classificação final de cada campeonato anual encerrado,
  dividida por esporte e modalidade. Os pontos de todas as etapas da temporada
  são somados para remontar a tabela final, mesmo depois que o ranking sazonal
  foi zerado no dia 1º de janeiro.
- **Details do atleta**: em qualquer lista de atletas (ranking, Os Melhores ou
  temporadas), um clique no nome abre um painel com as posições daquele atleta em
  campeonatos passados. Apenas um details fica aberto por vez.

O detalhamento respeita o **prestígio** das competições. Competições mais
prestigiadas se mantêm visíveis por mais tempo e sobressaem às de menor
prestígio quando é necessário encurtar a lista:

- em modalidades sazonais (Fórmula 1), o atleta vê apenas a **posição final de
  cada temporada**, nunca cada corrida isolada;
- em modalidades cumulativas (tênis), o atleta vê no **máximo as 10 últimas
  competições**, priorizando a ordem em que terminaram e o prestígio de cada uma.

## Sistema de pontuação

O seletor `Sistema de Pontuação` aparece no cadastro de competições. Quando o
esporte é escolhido, o sistema padrão correspondente é selecionado
automaticamente. Antes de escolher um esporte, os sistemas continuam livres.

| Sistema | Distribuição |
| --- | --- |
| Proporcional genérico | 100%, 70%, 50%, 35%, 25%, 15%, 10% e 5% até o 8º |
| Proporcional por rodadas (tênis) | 100% campeão; 65% finalista; 40% 3º–4º; 20% 5º–8º; 10% 9º–16º; 5% 17º–32º; 0,5% a partir do 33º |
| Fórmula 1 — Grandes Prêmios | 25, 18, 15, 12, 10, 8, 6, 4, 2 e 1 ponto |

As faixas do tênis são interrompidas no número real de participantes. Assim,
uma chave de quatro atletas distribui apenas 100%, 65%, 40% e 40%, enquanto uma
chave de 128 alcança também a faixa de 0,5%.

A fórmula que produz a performance não foi alterada. `baseRating`, `momentum`,
idade e a variação diária concentrada continuam funcionando como na versão
anterior; somente a conversão da posição final em pontos passou a ser modular.

## Rankings multiesporte

Cada atleta possui `sportId` e `modalityId`. Cada combinação gera seu próprio
`rankingId`, e a tela de rankings agora começa com dois seletores:

1. esporte;
2. modalidade daquele esporte;
3. abrangência mundial, continental ou nacional.

Os 100 atletas antigos continuam genéricos e sem esporte até o primeiro preset
ser importado. Nesse momento eles recebem, uma única vez, o esporte e a
modalidade daquele primeiro preset. Presets com elenco próprio acrescentam os
novos atletas sem modificar os anteriores.

O tênis usa ranking cumulativo. A Fórmula 1 usa ranking sazonal: todas as etapas
do ano somam pontos, a última registra o campeão e a virada para 1º de janeiro
zera pontos e participações antes da nova temporada.

## Preset Ecossistema FIA 2026

O antigo preset de Fórmula 1 foi expandido para o **Ecossistema FIA — 2026**, um
único preset que reúne a pirâmide monoposto da FIA. Ele é **multimodalidade**:
cada série carrega seus próprios pilotos, seu calendário e sua classificação
anual independente, organizada em quatro **tiers**.

| Tier | Série | Modalidade | Etapas | Pilotos | Prestígio |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | Fórmula 1 | `Fórmula 1` | 24 | 22 | 100 |
| 2 | Fórmula 2 | `Fórmula 2` | 14 | 22 | 85 |
| 3 | Fórmula 3 | `Fórmula 3` | 10 | 30 | 70 |
| 4 | Fórmula Regional Europeia | `Fórmula Regional Europeia` | 8 | 30 | 55 |
| 4 | Fórmula Regional Oriente Médio | `Fórmula Regional Oriente Médio` | 4 | 36 | 55 |

Total: **60 etapas anuais** e **115 pilotos** (as duas Regionais dividem 11
pilotos exclusivos do Oriente Médio; os demais são atletas compartilhados). Todas
as séries usam o tipo `Liga`, o modelo `Etapa de temporada`, a pontuação
`25–18–15–12–10–8–6–4–2–1` e somam pontos em um campeonato anual próprio. O
**tier** é apenas um agrupamento: categorias do mesmo nível (como as duas
Regionais) convivem lado a lado, cada uma com seu ranking separado.

### Atletas compartilhados entre categorias

Um mesmo piloto pode disputar mais de um campeonato. Na Fórmula Regional Oriente
Médio, os pilotos cujo nome coincide com o de uma categoria já existente são
tratados como **o mesmo atleta** — não uma cópia: mantêm o rating da categoria de
origem e passam a aparecer nas duas classificações e no histórico unificado do
atleta, como um tenista que joga vários torneios. Apenas os pilotos exclusivos do
Oriente Médio geram novas pessoas.

A Fórmula 1 mantém o calendário oficial de 24 etapas, de Melbourne em 6–8 de
março a Abu Dhabi em 4–6 de dezembro, e o grid oficial de 22 pilotos:

<https://www.formula1.com/en/latest/article/formula-1-reveals-calendar-for-2026-season.YctbMZWqBvrgyddrnauo8>

Como a F2 e a F3 correm nos fins de semana da F1, cada uma de suas rodadas
reaproveita a janela de três dias do Grande Prêmio correspondente. Os grids de
F2 (11 equipes × 2) e F3 (10 equipes × 3) são **aproximações** da temporada 2026,
com nomes reais e equipes reais; os ratings são estimativas da força individual,
como já ocorre na F1.

A **Fórmula Regional Europeia** usa a FIA Formula Regional European Championship
(FREC) de 2026: as 8 rodadas oficiais (Red Bull Ring, Zandvoort, Spa-Francorchamps,
Monza, Hungaroring, Paul Ricard, Imola e Hockenheim, de abril a setembro) e a
entry list completa das 10 equipes com três pilotos cada (30 no total).

A **Fórmula Regional Oriente Médio** usa o calendário oficial de 4 etapas de 2026
(Yas Marina ×2, Dubai Autodrome e Lusail, de janeiro a fevereiro) e o grid de 36
pilotos. Vinte e cinco deles também correm em outra categoria e são vinculados ao
mesmo atleta; onze são exclusivos do Oriente Médio.

Como as Regionais têm circuitos e datas próprios, cada rodada define seu fim de
semana diretamente. Os pilotos, equipes e calendários são reais; apenas os
ratings são aproximados.

Fontes da Fórmula Regional 2026:

<https://www.fia.com/news/fia-and-aci-announce-2026-fia-formula-regional-european-championship-calendar>

<https://en.wikipedia.org/wiki/2026_Formula_Regional_European_Championship>

Diretrizes mantidas em todas as séries:

- as equipes aparecem somente como texto entre parênteses no nome do piloto,
  no formato `Lewis Hamilton (Ferrari)`; nenhuma entidade ou mecânica de equipes
  foi criada;
- cada etapa dura três dias e repete as mesmas datas todos os anos;
- cada fim de semana gera somente o resultado principal da corrida — as etapas
  Sprint não viram competições separadas.

Presets antigos de uma única modalidade (como o ATP) continuam funcionando sem
alteração: internamente eles são tratados como um preset de uma única série.

## Critérios de classificação preservados

- cinco critérios de classificação aplicados pela simulação:
  `Aberta`, `Por ranking`, `Por classificatória`, `Por convite` e `Mista`;
- em `Por ranking`, a quantidade de vagas é o próprio corte do ranking;
- torneios do tipo `Classificatória` apontam para uma competição posterior e
  definem quantas posições do resultado concedem vaga;
- validação de esporte, modalidade, datas e capacidade do torneio de destino;
- janela automática de convites dez dias antes de cada edição;
- avanço do tempo pausado enquanto houver convites pendentes;
- escolha de atletas no ranking respeitando a abrangência geográfica;
- 11 combinações mistas possíveis entre os quatro critérios básicos;
- distribuição explícita das vagas de uma classificação mista;
- remoção do antigo campo opcional `Ranking mínimo`, substituído pela regra
  direta de vagas;
- persistência das escolhas por edição no IndexedDB.

## Recursos preservados da versão anterior

- tela inicial obrigatória com `Novo jogo` e `Continuar save`;
- nenhuma leitura automática do save ao abrir o aplicativo;
- `Novo jogo` apaga a base anterior e cria um mundo vazio;
- esporte e modalidade como entidades persistentes;
- catálogo inicial `Tênis > Simples masculino`;
- seletores dependentes de esporte e modalidade no cadastro de campeonatos;
- botão `Presets` na tela do calendário;
- catálogo de presets expansível em `js/presets.js`;
- preset opcional do circuito mundial ATP 2026 com 59 torneios individuais e o
  top 50 real do ranking mundial da ATP como elenco oficial;
- importação explícita: o preset nunca entra no calendário automaticamente;
- IDs estáveis que impedem a duplicação do mesmo preset.

O preset foi baseado no calendário oficial de 2026 publicado pela ATP. Eventos
por equipes e competições sem data confirmada ficaram de fora porque o motor
atual simula torneios individuais.

Assim como no automobilismo, o preset agora traz uma database de atletas reais: o
top 50 do ranking mundial da ATP de 2026 (nomes e nacionalidades reais, ratings
aproximados). Como o tênis não tem equipes, o nome do atleta não recebe sufixo
entre parênteses. Esses 50 jogadores entram no mesmo pool da modalidade, ao lado
dos 100 atletas genéricos, e as vagas de cada torneio continuam sendo preenchidas
por ranking — o que preserva o preenchimento de chaves grandes, como os 128 de um
Grand Slam. Fonte: <https://www.atptour.com/en/rankings/singles>.

- estrutura persistente `mundo > continente > país`;
- seis continentes e 20 países correspondentes às nacionalidades dos 100 atletas;
- referências permanentes `continentId` e `countryId` em cada atleta;
- abrangência mundial, continental ou nacional no gerador de campeonatos;
- seleção dependente: continente primeiro e país depois;
- barreira territorial aplicada pelo motor antes da seleção dos participantes;
- ranking mundial com todos os atletas;
- ranking continental limitado ao continente escolhido;
- ranking nacional limitado ao país escolhido;
- posições recalculadas dentro de cada visão territorial;
- migração do IndexedDB até a versão 8 sem apagar calendário, campeonatos,
  pessoas, pontos ou resultados ao escolher `Continuar save`.

Novos mundos continuam começando sem eventos ou competições de exemplo. O jogador
modela livremente a competição que deseja simular.

## Estrutura do mundo

```text
Mundo atual
├── África
├── Ásia
├── Europa
├── América do Norte, Central e Caribe
├── América do Sul
└── Oceania
    └── Países
        └── Atletas
```

Continentes e países são entidades persistentes. Cada continente possui
`worldId`; cada país possui `worldId` e `continentId`; cada atleta mantém
`countryId` e `continentId`. Os campos `countryCode` e `countryName` anteriores
foram preservados para não quebrar a interface nem os saves existentes.

## Abrangência dos campeonatos

O cadastro ganhou três opções:

| Abrangência | Seleção necessária | Atletas elegíveis |
| --- | --- | --- |
| Mundial | Nenhuma | Todos os países |
| Continental | Continente | Países daquele continente |
| Nacional | Continente e depois país | Somente o país escolhido |

A barreira geográfica é aplicada antes dos critérios de classificação:

1. limita o conjunto ao território da competição;
2. ordena os atletas elegíveis pelo ranking atual;
3. aplica ranking, resultados de classificatórias e/ou escolhas por convite;
4. remove participantes duplicados quando o critério é misto;
5. respeita a quantidade total e a distribuição das vagas.

Campeonatos já gravados no passo 4 não possuem o novo campo. Na leitura, eles são
interpretados como mundiais, preservando seu comportamento.

## Abrangência dos rankings

Cada esporte/modalidade usa seus próprios pontos persistentes. Depois de
escolher a classificação esportiva, a posição é recalculada dentro da
abrangência escolhida:

- Mundial: posições de 1 a 100.
- Continental: somente atletas dos países do continente selecionado.
- Nacional: primeiro seleciona o continente, depois um país daquele continente.

## Critérios de classificação

| Critério | Funcionamento |
| --- | --- |
| Aberta | Qualquer atleta elegível pode se inscrever; o preenchimento automático respeita as vagas. |
| Por ranking | Entram os melhores elegíveis até o total de vagas. |
| Por classificatória | Entram os atletas que obtiveram vaga nos resultados das eliminatórias vinculadas. |
| Por convite | Dez dias antes, o jogador escolhe atletas elegíveis até o limite reservado. |
| Mista | O jogador escolhe uma das 11 combinações e divide todas as vagas entre os métodos. |

Para criar um elo eliminatório, cadastre primeiro o torneio de destino com
`Por classificatória` ou uma classificação mista que contenha classificatória.
Depois crie o torneio do tipo `Classificatória`, selecione o destino e informe
quantas vagas ele concede.

Em presets de torneios reais, `Aberta` não é usada como padrão. O preset ATP
2026 continua usando critérios estruturados e nenhum de seus torneios é aberto.

## Como executar

Por usar módulos JavaScript, abra o projeto por um servidor local. No Acode,
use a visualização/servidor do próprio aplicativo. Em computador:

```bash
python3 -m http.server 8080
```

Depois abra `http://localhost:8080`.

## Estrutura

```text
index.html          Interface
styles.css          Aparência e responsividade
js/db.js            IndexedDB, migração, inscrições e transações
js/calendar.js      Datas e recorrência
js/competition.js   Critérios, combinações, vínculos e validações
js/geography.js     Mundo, continentes, países e barreiras territoriais
js/sports.js        Entidades de esportes e modalidades
js/scoring.js       Sistemas de pontuação e distribuição por posição
js/presets.js       Catálogo e gerador dos presets de calendário
js/ranking.js       Pessoas, rankings esportivos, territoriais e sazonais
js/newsroom.js      Notícias, melhores ratings e vencedores da Central
js/history.js       Campeões passados, temporadas encerradas e trajetória do atleta
js/simulation.js    Participantes, performance, pontos e reordenação
js/app.js           Estado, convites, passagem do tempo e integração
test/               Testes automatizados de todos os sistemas
```

## Limites intencionais

A lista territorial contém somente os 20 países que já possuem atletas neste
protótipo. Novos países podem ser acrescentados à entidade de geografia quando
novas nacionalidades forem introduzidas, sem alterar o mecanismo de campeonatos
ou de rankings.

O catálogo esportivo atual possui `Tênis > Simples masculino` e
`Automobilismo > Fórmula 1`, `Fórmula 2`, `Fórmula 3`, `Fórmula Regional Europeia`
e `Fórmula Regional Oriente Médio`. Novos esportes, modalidades, sistemas de
pontuação e presets podem ser acrescentados às listas próprias sem transformar
seus nomes em campos livres.

Os grids de Fórmula 2 e Fórmula 3 de 2026 são aproximações: usam equipes reais e
nomes reais do grid da categoria, mas as escalações exatas e os ratings são
estimativas. As Fórmulas Regionais usam a entry list e o calendário oficiais de
2026 — só os ratings são aproximados. Tudo coerente com o caráter de simulação
do preset.

A **Fórmula 4** foi pesquisada, mas não entrou no preset: a temporada 2026 da
Italian F4 tem um grid recorde de 49 pilotos e 13 equipes que muda a cada rodada,
e não foi possível reunir a entry list completa e confiável (só o calendário de
7 rodadas). Os detalhes do que foi encontrado e do que falta estão em
`DOCUMENTACAO_MULTIESPORTE_FORMULA1.md` (seção 11).
