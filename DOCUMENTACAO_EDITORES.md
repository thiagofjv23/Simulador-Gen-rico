# Editores in-game

Ferramentas dentro do jogo para **criar conteúdo novo reaproveitando as
estruturas existentes**, sem risco de quebrar nada. Há quatro editores:

1. **Países** — adiciona países conforme a geografia do jogo.
2. **Presets (novos esportes)** — cria presets completos, inclusive esportes e
   calendários novos.
3. **Ligas / Campeonatos** — adiciona ligas/campeonatos a esportes já existentes.
4. **Atletas / Clubes** — adiciona atletas ou clubes a esportes/modalidades
   existentes.

## Como abrir

Clique no **ícone de ferramenta (🛠) no canto superior esquerdo** da tela. Abre a
tela de escolha do editor. Selecione um dos quatro editores.

## Fluxo de cada editor

Todos os editores seguem o mesmo passo a passo, com **suporte a arquivos `.js`**:

1. **Copiar modelo (.js)** — copia para a área de transferência o esqueleto do
   arquivo `.js` daquele editor, já com **as diretrizes de preenchimento
   comentadas dentro dele**. (Se a área de transferência não estiver disponível,
   o modelo é colado direto no campo de texto.)
2. **Preencher** — edite o modelo no seu editor de texto preferido, ou direto no
   campo "Conteúdo do arquivo .js" da tela. Você também pode usar **Carregar
   arquivo .js** para carregar um arquivo do disco.
3. **Validar e pré-visualizar** — o jogo lê o `.js` (via `export default`),
   valida os dados e mostra um resumo do que será criado. Erros aparecem em
   vermelho e impedem o salvamento.
4. **Salvar** — dois destinos:
   - **Salvar no save**: aplica **apenas ao jogo atual** (é apagado ao iniciar um
     novo jogo).
   - **Salvar na database**: aplica ao jogo atual **e** guarda no catálogo
     persistente (sobrevive a novos jogos, sendo ressemeado em cada partida) **e
     baixa o arquivo `.js`** correspondente para você versionar no repositório.

> **Sobre o `.js` baixado e o repositório:** o jogo roda no navegador e não tem
> como gravar sozinho no repositório. Por isso, "Salvar na database" **baixa** o
> arquivo `.js` (o mesmo dado, em formato de módulo) e mantém o conteúdo no
> navegador (localStorage) para uso imediato e permanente entre jogos. Para
> tornar o dado permanente **no repositório**, faça commit do arquivo baixado.

Os dados são sempre exportados por `export default`. Você pode exportar um objeto
único ou, quando indicado, um array.

---

## 1. Editor de Países

Adiciona países novos ao mundo. Campos:

- `code`: sigla de **3 letras MAIÚSCULAS** (ex.: `"POR"`). Vira o id `country_por`.
- `name`: nome do país em português.
- `continentId`: um destes valores exatos —
  `continent_africa`, `continent_asia`, `continent_europe`,
  `continent_north_america`, `continent_south_america`, `continent_oceania`.

Exemplo (um país; pode ser um array de vários):

```js
export default {
  code: "POR",
  name: "Portugal",
  continentId: "continent_europe",
};
```

Depois de salvar, o país fica disponível nos seletores de geografia (abrangência
de competições, filtros de ranking etc.).

---

## 2. Editor de Presets (novos esportes)

Cria um **preset completo**, podendo trazer esportes e modalidades novos. O
preset salvo fica **selecionável na tela de Presets** (marcado com "(meu)"), ao
lado dos presets nativos — inclusive se salvo apenas no save.

Estrutura:

- `sports`: esportes novos. Cada um tem `id`, `name`, `defaultScoringSystemId`,
  `rankingModel` (`"cumulative"`, `"seasonal"` ou `"rolling"`) e `entityType`
  (`"atleta"`, `"equipe"` ou `"mista"`).
- `modalities`: modalidades novas, cada uma com `sportId` de um esporte acima
  (ou já existente) e `name`.
- `preset`: uma entrada de calendário no mesmo formato dos presets nativos. O
  modelo padrão usa o formato **por ranking** (como o tênis): um pool de atletas
  e torneios preenchidos por ranking.
  - `competitions`: **lista de objetos** `{ id, name, startDate, endDate, city,
    category }` (datas `AAAA-MM-DD`).
  - `athletes`: lista de pessoas (id, name, countryCode, age, baseRating 1–99,
    momentum -5..5, sportId, modalityId).

Depois de salvar, abra **Presets** no calendário, escolha o seu preset e
adicione ao calendário normalmente. A partir daí ele funciona como qualquer
outro preset (rankings, resultados, temporada etc.).

> Para presets **por temporada** (etapas somando pontos) ou **liga** (pontos
> corridos), veja o editor de Ligas/Campeonatos, cujo modelo já traz o formato
> pronto.

---

## 3. Editor de Ligas / Campeonatos

Adiciona uma **liga de pontos corridos** (turno e returno) a um esporte de
equipe já existente (ex.: `sport_football`). Estrutura:

- `modalities`: registre a modalidade nova da liga (`rankingModel: "seasonal"`).
- `preset`: com `kind: "league"`, `sportId` de um esporte existente e uma lista
  `leagues`. Cada liga tem:
  - `slug`, `modalityId`, `modalityName`, `competitionName`, `seasonName`,
    `seasonId`;
  - geografia: `countryCode`, `countryName`, `countryId`, `continentId`
    (devem **existir** na geografia — crie o país antes, se preciso, no editor 1);
  - `startDate`/`endDate` da temporada, `prestige`;
  - `clubs`: lista `[slug, nome, rating(1–99), momentum(-5..5)]`.

O preset gera automaticamente **uma competição por rodada** (turno e returno),
espaçadas semanalmente, com a tabela de classificação e o campeão ao fim — igual
ao Brasileirão/J-League nativos. Fica selecionável na tela de Presets.

---

## 4. Editor de Atletas / Clubes

Adiciona atletas **ou** clubes a um esporte e modalidade **já existentes**.
Estrutura:

- `target`: `"athlete"` (atletas individuais) ou `"club"` (equipes).
- `sportId` / `modalityId`: IDs existentes (ex.: `sport_tennis` /
  `modality_tennis_mens_singles`; `sport_football` /
  `modality_football_brasileirao`).
- `entries`: lista de `{ name, countryCode, age, baseRating (1–99),
  momentum (-5..5) }` (o `age` só vale para atletas).

Atletas entram no **ranking** do seu esporte/modalidade (as posições são
recalculadas). Clubes aparecem na seção **Equipes** e podem ser usados por ligas
que os referenciem.

---

## Save × Database (resumo)

| Ação | Save (jogo atual) | Database (persistente) |
| --- | --- | --- |
| Onde grava | IndexedDB do save | localStorage + IndexedDB + download `.js` |
| Sobrevive a "Novo jogo"? | Não | Sim (ressemeado a cada jogo) |
| Vira permanente no repo? | Não | Sim, ao commitar o `.js` baixado |

## Garantias

- Os editores **só acrescentam** dados usando as mesmas estruturas do jogo; não
  alteram nenhuma mecânica existente.
- A validação impede salvar dados malformados (o botão de salvar só habilita
  após uma pré-visualização válida).
- IDs são estáveis e sem duplicação: reimportar o mesmo dado atualiza no lugar
  em vez de duplicar.
