import test from "node:test";
import assert from "node:assert/strict";

import {
  EVENT_FORMATS,
  eventFormatLabel,
  isHeadToHeadFormat,
  resolveMatch,
  resolveStage,
} from "../js/eventformat.js";

function makeRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function participants(count = 8) {
  return Array.from({ length: count }, (_, index) => ({
    personId: `p${index + 1}`,
    performance: 90 - index * 4,
    seed: index + 1,
  }));
}

function positionsAreComplete(standings) {
  assert.deepEqual(
    standings.map(({ position }) => position).sort((a, b) => a - b),
    Array.from({ length: standings.length }, (_, index) => index + 1),
  );
}

test("o catálogo expõe os seis formatos de prova", () => {
  assert.equal(EVENT_FORMATS.length, 6);
  assert.equal(eventFormatLabel("swiss"), "Sistema suíço");
  assert.ok(isHeadToHeadFormat("round-robin"));
  assert.ok(!isHeadToHeadFormat("heats"));
});

test("ranqueamento individual ordena pela performance", () => {
  const standings = resolveStage({
    participants: participants(6),
    format: "individual-ranking",
  });
  assert.equal(standings.length, 6);
  positionsAreComplete(standings);
  assert.equal(standings[0].personId, "p1");
  assert.equal(standings.at(-1).personId, "p6");
});

test("baterias distribuem os participantes em grupos e reúnem o resultado", () => {
  const standings = resolveStage({
    participants: participants(8),
    format: "heats",
    heatSize: 4,
    random: makeRandom(11),
  });
  assert.equal(standings.length, 8);
  positionsAreComplete(standings);
  assert.ok(standings.every(({ heatNumber }) => heatNumber >= 1 && heatNumber <= 2));
  assert.ok(standings.every(({ heatCount }) => heatCount === 2));
});

test("todos contra todos: cada um joga N-1 partidas e a soma bate", () => {
  const standings = resolveStage({
    participants: participants(6),
    format: "round-robin",
    metric: "match-score",
    random: makeRandom(7),
  });
  positionsAreComplete(standings);
  assert.ok(standings.every(({ record }) => record.wins + record.draws + record.losses === 5));
  const totalWins = standings.reduce((sum, { record }) => sum + record.wins, 0);
  const totalLosses = standings.reduce((sum, { record }) => sum + record.losses, 0);
  assert.equal(totalWins, totalLosses);
});

test("eliminação simples: o campeão vence o maior número de confrontos", () => {
  const standings = resolveStage({
    participants: participants(8),
    format: "single-elimination",
    random: makeRandom(3),
  });
  positionsAreComplete(standings);
  const champion = standings[0];
  assert.ok(standings.every(({ wins }) => wins <= champion.wins));
  assert.equal(champion.wins, 3); // chave de 8 = 3 vitórias
});

test("eliminação dupla: só sai quem perde duas vezes", () => {
  const standings = resolveStage({
    participants: participants(8),
    format: "double-elimination",
    random: makeRandom(5),
  });
  positionsAreComplete(standings);
  assert.ok(standings[0].losses <= 1); // o campeão perde no máximo uma vez
  assert.ok(standings.slice(1).every(({ losses }) => losses === 2));
});

test("sistema suíço: número fixo de rodadas, sem eliminação", () => {
  const standings = resolveStage({
    participants: participants(8),
    format: "swiss",
    metric: "match-score",
    random: makeRandom(9),
  });
  assert.equal(standings.length, 8);
  positionsAreComplete(standings);
  // 8 participantes = 3 rodadas; ninguém joga mais que isso.
  assert.ok(standings.every(({ record }) => record.wins + record.draws + record.losses <= 3));
});

test("um confronto 1x1 tem sempre um vencedor quando não há empate", () => {
  const random = makeRandom(2);
  const match = resolveMatch(
    { personId: "a", performance: 90 },
    { personId: "b", performance: 50 },
    random,
    { allowDraw: false },
  );
  assert.ok(match.winnerId === "a" || match.winnerId === "b");
});

test("a resolução da etapa é determinística para a mesma semente", () => {
  const first = resolveStage({ participants: participants(8), format: "round-robin", random: makeRandom(42) });
  const second = resolveStage({ participants: participants(8), format: "round-robin", random: makeRandom(42) });
  assert.deepEqual(first, second);
});
