import test from "node:test";
import assert from "node:assert/strict";

import {
  RESULT_METRICS,
  applyResultMetric,
  computeMark,
  eventPointsForPosition,
  formatMark,
  markIsBetter,
  matchPointsFor,
  resultMetricLabel,
} from "../js/metric.js";

test("o catálogo expõe as três métricas de resultado", () => {
  assert.deepEqual(
    RESULT_METRICS.map(({ id }) => id),
    ["position-table", "match-score", "direct-mark"],
  );
  assert.equal(resultMetricLabel("direct-mark"), "Marca direta");
});

test("tabela de posição rende pontos fixos por colocação", () => {
  assert.equal(eventPointsForPosition(1), 10);
  assert.equal(eventPointsForPosition(2), 8);
  assert.equal(eventPointsForPosition(8), 1);
  assert.equal(eventPointsForPosition(9), 0);
  assert.equal(eventPointsForPosition(1, [25, 18, 15]), 25);
});

test("placar de jogo soma vitórias, empates e derrotas", () => {
  assert.equal(matchPointsFor({ wins: 2, draws: 1, losses: 3 }), 7);
  assert.equal(matchPointsFor({ wins: 2, draws: 1, losses: 3 }, { win: 2, draw: 1, loss: 0 }), 5);
});

test("marca direta é monótona: performance maior gera marca melhor", () => {
  // Tempo: menor é melhor, então performance maior baixa o tempo.
  assert.ok(computeMark(90, "time") < computeMark(50, "time"));
  // Distância e peso: maior é melhor.
  assert.ok(computeMark(90, "distance") > computeMark(50, "distance"));
  assert.ok(computeMark(90, "weight") > computeMark(50, "weight"));
  assert.ok(markIsBetter(19.5, 22.0, "time"));
  assert.ok(markIsBetter(8.4, 7.1, "distance"));
  assert.equal(formatMark(20, "time"), "20.00 s");
});

test("decora com marca direta e mantém coerência com a posição", () => {
  const standings = [
    { personId: "a", position: 1, performance: 90 },
    { personId: "b", position: 2, performance: 80 },
    { personId: "c", position: 3, performance: 70 },
  ];
  const decorated = applyResultMetric(standings, { metric: "direct-mark", markType: "time" });
  assert.ok(decorated.every(({ mark }) => typeof mark === "number"));
  assert.ok(decorated.every(({ markLabel }) => markLabel.endsWith(" s")));
  // Posição 1 tem o menor tempo; a marca piora conforme a posição.
  assert.ok(decorated[0].mark < decorated[1].mark);
  assert.ok(decorated[1].mark < decorated[2].mark);
  assert.equal(decorated[0].eventPoints, null);
});

test("decora com tabela de posição e com placar de jogo", () => {
  const byPosition = applyResultMetric(
    [{ personId: "a", position: 1, performance: 90 }],
    { metric: "position-table" },
  );
  assert.equal(byPosition[0].eventPoints, 10);
  assert.equal(byPosition[0].mark, null);

  const byMatch = applyResultMetric(
    [{ personId: "a", position: 1, performance: 90, record: { wins: 3, draws: 1, losses: 0 } }],
    { metric: "match-score" },
  );
  assert.equal(byMatch[0].eventPoints, 10);
  assert.match(byMatch[0].recordLabel, /3V 1E 0D/);
});
