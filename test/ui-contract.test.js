import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const projectRoot = new URL("../", import.meta.url);

test("o formulário de competição usa seletores de esporte e modalidade", async () => {
  const html = await readFile(new URL("index.html", projectRoot), "utf8");
  assert.match(html, /<select id="competition-sport"[^>]*name="sportId"/);
  assert.match(html, /<select\s+id="competition-discipline"[^>]*name="modalityId"/);
  assert.match(html, /id="competition-scoring-system"/);
  assert.match(html, /id="competition-model"/);
  assert.match(html, /id="competition-model-help"/);
  assert.match(html, /id="scoring-system-help"/);
});

test("o formulário de competição também vincula um tipo de evento", async () => {
  const [html, app] = await Promise.all([
    readFile(new URL("index.html", projectRoot), "utf8"),
    readFile(new URL("js/app.js", projectRoot), "utf8"),
  ]);
  assert.match(html, /<select id="competition-event-type"[^>]*name="eventTypeId"/);
  assert.match(html, /id="event-type-help"/);
  // O seletor de tipo de evento é preenchido a partir da modalidade escolhida.
  assert.match(app, /updateEventTypeSelect/);
  assert.match(app, /eventTypesForModality/);
});

test("o formulário de competição exige uma tier", async () => {
  const [html, app] = await Promise.all([
    readFile(new URL("index.html", projectRoot), "utf8"),
    readFile(new URL("js/app.js", projectRoot), "utf8"),
  ]);
  assert.match(html, /<select id="competition-tier"[^>]*name="tier"[^>]*required/);
  assert.match(html, /id="competition-tier-help"/);
  assert.match(app, /setupTierOptions/);
  assert.match(app, /tierForPrestige/);
});

test("o cadastro de competição permite escolher formato de prova e métrica", async () => {
  const [html, app] = await Promise.all([
    readFile(new URL("index.html", projectRoot), "utf8"),
    readFile(new URL("js/app.js", projectRoot), "utf8"),
  ]);
  assert.match(html, /<select id="competition-event-format"[^>]*name="eventFormat"/);
  assert.match(html, /<select id="competition-result-metric"[^>]*name="resultMetric"/);
  assert.match(html, /id="competition-mark-type"/);
  assert.match(html, /id="competition-heat-size"/);
  assert.match(html, /id="event-format-help"/);
  assert.match(html, /id="result-metric-help"/);
  // A janelinha de contexto explica cada opção ao jogador.
  assert.match(app, /updateEventFormatFields/);
  assert.match(app, /eventFormatById\(format\)\?\.description/);
});

test("há o gerador de atletas/clubes e a página Clubes/Atletas", async () => {
  const [html, app] = await Promise.all([
    readFile(new URL("index.html", projectRoot), "utf8"),
    readFile(new URL("js/app.js", projectRoot), "utf8"),
  ]);
  // Opção no novo save e diálogo do gerador.
  assert.match(html, /id="setup-use-generator"/);
  assert.match(html, /id="generator-dialog"/);
  assert.match(html, /id="generator-sports"/);
  // Página Clubes/Atletas com os quatro seletores e os dois top 3.
  assert.match(html, /data-view="entities"/);
  assert.match(html, /id="entities-sport"/);
  assert.match(html, /id="entities-modality"/);
  assert.match(html, /id="entities-continent"/);
  assert.match(html, /id="entities-country"/);
  assert.match(html, /id="entities-top-athletes"/);
  assert.match(html, /id="entities-top-clubs"/);
  // Wiring no app.
  assert.match(app, /runEntityGenerator/);
  assert.match(app, /renderEntitiesView/);
  assert.match(app, /openGeneratorDialog/);
});

test("a tela de ranking permite escolher esporte e modalidade", async () => {
  const html = await readFile(new URL("index.html", projectRoot), "utf8");
  assert.match(html, /id="ranking-sport"/);
  assert.match(html, /id="ranking-modality"/);
});

test("a Central dos Esportes reúne notícias, melhores e vencedores", async () => {
  const [html, app] = await Promise.all([
    readFile(new URL("index.html", projectRoot), "utf8"),
    readFile(new URL("js/app.js", projectRoot), "utf8"),
  ]);
  assert.match(html, /data-view="sports"/);
  assert.match(html, /Central dos Esportes/);
  assert.match(html, /id="hub-central"/);
  assert.match(html, /id="hub-ranking"/);
  assert.match(html, /id="central-news-list"/);
  assert.match(html, /id="central-best-list"/);
  assert.match(html, /id="central-winners-grid"/);
  assert.match(html, /id="open-rankings-button"/);
  assert.match(app, /buildNewsFeed/);
  assert.match(app, /switchHub/);
});

test("a Central expõe as telas de histórico de campeões e temporadas", async () => {
  const [html, app] = await Promise.all([
    readFile(new URL("index.html", projectRoot), "utf8"),
    readFile(new URL("js/app.js", projectRoot), "utf8"),
  ]);
  assert.match(html, /data-hub="champions"/);
  assert.match(html, /data-hub="seasons"/);
  assert.match(html, /id="champions-list"/);
  assert.match(html, /id="seasons-list"/);
  assert.match(html, /id="seasons-sport"/);
  assert.match(app, /finishedEvents/);
  assert.match(app, /pastSeasons/);
  assert.match(app, /athleteCompetitionHistory/);
});

test("a abertura oferece novo jogo ou continuar antes de acessar o save", async () => {
  const [html, app] = await Promise.all([
    readFile(new URL("index.html", projectRoot), "utf8"),
    readFile(new URL("js/app.js", projectRoot), "utf8"),
  ]);
  assert.match(html, /id="start-dialog"/);
  assert.match(html, /id="continue-game-button"/);
  assert.match(html, /id="new-game-button"/);

  const initializeBody = app.match(/function initialize\(\) \{([\s\S]*?)\n\}/)?.[1] ?? "";
  assert.doesNotMatch(initializeBody, /getWorld|openDatabase|indexedDB/);
  assert.match(initializeBody, /startDialog\.showModal/);
});

test("o calendário expõe o seletor opcional de presets", async () => {
  const html = await readFile(new URL("index.html", projectRoot), "utf8");
  assert.match(html, /id="presets-button"/);
  assert.match(html, /id="preset-select"/);
  assert.match(html, /id="apply-preset-button"/);
});

test("o formulário expõe classificação mista e vínculo eliminatório", async () => {
  const html = await readFile(new URL("index.html", projectRoot), "utf8");
  assert.match(html, /id="competition-mixed-combination"/);
  assert.match(html, /id="mixed-slots-fields"/);
  assert.match(html, /id="competition-qualifier-target"/);
  assert.match(html, /id="competition-qualifier-slots"/);
  assert.doesNotMatch(html, /id="competition-minimum-ranking"/);
});

test("a interface possui a janela de convites acionada pelo calendário", async () => {
  const [html, app] = await Promise.all([
    readFile(new URL("index.html", projectRoot), "utf8"),
    readFile(new URL("js/app.js", projectRoot), "utf8"),
  ]);
  assert.match(html, /id="invitation-dialog"/);
  assert.match(html, /id="invitation-athletes"/);
  assert.match(app, /invitationOpensOn/);
  assert.match(app, /pausedForInvitation/);
});
