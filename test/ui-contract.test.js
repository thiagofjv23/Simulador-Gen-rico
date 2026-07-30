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
