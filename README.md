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
- esporte `Automobilismo` e modalidade `Fórmula 1`;
- preset do Campeonato Mundial de Fórmula 1 de 2026;
- 24 etapas oficiais com três dias cada e repetição anual;
- 22 pilotos oficiais de 2026 com a equipe exibida ao lado do nome;
- classificação anual da Fórmula 1, campeão após a última etapa e zeramento
  automático em 1º de janeiro;
- modelo de competição visível: `Evento independente` ou
  `Etapa de temporada`;
- migração do IndexedDB para a versão 8 preservando os dados anteriores.

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

## Preset Fórmula 1 2026

O preset foi construído com o calendário oficial de 24 etapas publicado pela
Fórmula 1, de Melbourne em 6–8 de março a Abu Dhabi em 4–6 de dezembro:

<https://www.formula1.com/en/latest/article/formula-1-reveals-calendar-for-2026-season.YctbMZWqBvrgyddrnauo8>

O grid de 22 pilotos e suas associações às equipes segue a página oficial de
pilotos de 2026:

<https://www.formula1.com/en/drivers>

As equipes aparecem somente como texto entre parênteses no nome do piloto.
Nenhuma entidade ou mecânica de equipes foi criada nesta etapa.

Cada Grande Prêmio:

- usa o tipo já existente `Liga`;
- é marcado como `Etapa de temporada`;
- dura três dias;
- repete as mesmas datas todos os anos;
- utiliza os 22 pilotos do preset;
- distribui 25–18–15–12–10–8–6–4–2–1;
- soma os pontos no `Campeonato Mundial de Fórmula 1`.

As etapas Sprint do calendário real não foram transformadas em competições
separadas: neste preset simplificado, cada fim de semana gera somente o
resultado principal do Grande Prêmio.

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
- preset opcional do circuito mundial ATP 2026 com 59 torneios individuais;
- importação explícita: o preset nunca entra no calendário automaticamente;
- IDs estáveis que impedem a duplicação do mesmo preset.

O preset foi baseado no calendário oficial de 2026 publicado pela ATP. Eventos
por equipes e competições sem data confirmada ficaram de fora porque o motor
atual simula torneios individuais.

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
`Automobilismo > Fórmula 1`. Novos esportes, modalidades, sistemas de
pontuação e presets podem ser acrescentados às listas próprias sem transformar
seus nomes em campos livres.
