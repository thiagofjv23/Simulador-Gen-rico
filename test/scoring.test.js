import test from "node:test";
import assert from "node:assert/strict";

import {
  pointsForPosition,
  pointsPreview,
} from "../js/scoring.js";

test("o sistema do tênis segue as proporções definidas para um torneio de 1000 pontos", () => {
  const positions = [1, 2, 3, 4, 5, 8, 9, 16, 17, 32, 33, 128];
  assert.deepEqual(
    positions.map((position) => pointsForPosition({
      scoringSystemId: "tennis-round-proportional",
      winnerPoints: 1000,
      position,
    })),
    [1000, 650, 400, 400, 200, 200, 100, 100, 50, 50, 5, 5],
  );
});

test("a pontuação proporcional se adapta ao total real de participantes", () => {
  assert.deepEqual(
    Array.from({ length: 4 }, (_, index) => pointsForPosition({
      scoringSystemId: "tennis-round-proportional",
      winnerPoints: 500,
      position: index + 1,
    })),
    [500, 325, 200, 200],
  );
});

test("a Fórmula 1 concede pontos fixos aos dez primeiros", () => {
  assert.deepEqual(
    pointsPreview("formula1-grand-prix", 999),
    [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
  );
  assert.equal(pointsForPosition({
    scoringSystemId: "formula1-grand-prix",
    winnerPoints: 999,
    position: 11,
  }), 0);
});
