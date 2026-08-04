import test from "node:test";
import assert from "node:assert/strict";

import {
  MIN_MOMENTUM,
  MAX_MOMENTUM,
  MAX_MOMENTUM_STEP,
  MIN_WINNER_MOMENTUM,
  clampMomentum,
  expectedPositions,
  positionMomentumDelta,
  matchMomentumMagnitude,
  winnerMomentumGain,
  momentumDeltasForResult,
} from "../js/momentum.js";

test("clampMomentum mantém o intervalo -5..+5", () => {
  assert.equal(clampMomentum(9), MAX_MOMENTUM);
  assert.equal(clampMomentum(-9), MIN_MOMENTUM);
  assert.equal(clampMomentum(2.4), 2);
});

test("expectedPositions ordena pelo ratingbase (maior = 1º)", () => {
  const positions = expectedPositions([
    { id: "a", baseRating: 90 },
    { id: "b", baseRating: 80 },
    { id: "c", baseRating: 95 },
  ]);
  assert.equal(positions.get("c"), 1);
  assert.equal(positions.get("a"), 2);
  assert.equal(positions.get("b"), 3);
});

test("positionMomentumDelta cresce com a distância para a expectativa", () => {
  // 8 participantes: terminar muito acima da expectativa dá +3; muito abaixo -3.
  assert.equal(positionMomentumDelta(1, 8, 8), 3); // esperado 8º, terminou 1º
  assert.equal(positionMomentumDelta(8, 1, 8), -3); // esperado 1º, terminou 8º
  assert.equal(positionMomentumDelta(4, 4, 8), 0); // exatamente na expectativa
  // Distância pequena -> variação pequena.
  assert.equal(positionMomentumDelta(3, 4, 8), 0);
  assert.equal(positionMomentumDelta(1, 4, 8), 1);
});

test("matchMomentumMagnitude só muda em zebra e cresce com a diferença de rating", () => {
  assert.equal(matchMomentumMagnitude(90, 80), 0); // favorito venceu -> sem mudança
  assert.equal(matchMomentumMagnitude(80, 90), 1); // zebra leve (gap 10)
  assert.equal(matchMomentumMagnitude(70, 90), 2); // gap 20
  assert.equal(matchMomentumMagnitude(60, 99), 2); // gap 39
  assert.equal(matchMomentumMagnitude(20, 99), 3); // zebra enorme -> teto 3
  assert.equal(matchMomentumMagnitude(90, 91), 1); // gap mínimo ainda dá 1
});

test("winnerMomentumGain: vencer sempre dá pelo menos o piso", () => {
  // Favorito folgado (rating bem maior que o rival) ganha só o piso.
  assert.equal(winnerMomentumGain(0, 90, 50), MIN_WINNER_MOMENTUM);
  // Partida equilibrada, sem prestígio, ainda dá o piso.
  assert.equal(winnerMomentumGain(0, 80, 80), MIN_WINNER_MOMENTUM);
});

test("winnerMomentumGain: zebra e prestígio aumentam o ganho", () => {
  // Zebra leve (gap 20) sem prestígio.
  assert.equal(winnerMomentumGain(0, 70, 90), 2);
  // Zebra enorme (gap >= 40) satura no teto.
  assert.equal(winnerMomentumGain(0, 40, 99), MAX_MOMENTUM_STEP);
  // Prestígio máximo eleva o ganho de um confronto equilibrado.
  assert.equal(winnerMomentumGain(100, 80, 80), 2);
  // Prestígio máximo + zebra bate no teto.
  assert.equal(winnerMomentumGain(100, 60, 90), MAX_MOMENTUM_STEP);
});

test("winnerMomentumGain: favorito ganha menos quanto maior a diferença", () => {
  const folgado = winnerMomentumGain(60, 95, 55); // gap enorme a favor do vencedor
  const apertado = winnerMomentumGain(60, 80, 78); // quase empate
  assert.ok(folgado <= apertado);
  assert.ok(folgado >= MIN_WINNER_MOMENTUM);
});

test("momentumDeltasForResult: liga usa 1x1 por partida", () => {
  const ratingById = new Map([
    ["club_a", { baseRating: 70 }],
    ["club_b", { baseRating: 90 }],
    ["club_c", { baseRating: 85 }],
    ["club_d", { baseRating: 84 }],
  ]);
  const result = {
    matches: [
      { homeId: "club_a", homeGoals: 2, awayId: "club_b", awayGoals: 0 }, // zebra: a (70) vence b (90)
      { homeId: "club_c", homeGoals: 1, awayId: "club_d", awayGoals: 1 }, // empate
    ],
  };
  const deltas = momentumDeltasForResult(result, ratingById);
  assert.equal(deltas.get("club_a"), 2); // vencedor de menor rating ganha
  assert.equal(deltas.get("club_b"), -2); // favorito perdeu -> perde momentum
  // Empate não muda nada.
  assert.equal(deltas.get("club_c") ?? 0, 0);
  assert.equal(deltas.get("club_d") ?? 0, 0);
});

test("momentumDeltasForResult: 2 participantes, zebra premia o vencedor e pune o favorito", () => {
  const result = {
    standings: [
      { personId: "p1", position: 1, baseRating: 75 }, // venceu sendo pior rankeado
      { personId: "p2", position: 2, baseRating: 92 },
    ],
  };
  const deltas = momentumDeltasForResult(result);
  assert.ok(deltas.get("p1") > 0); // vencedor ganha momentum
  assert.ok(deltas.get("p2") < 0); // favorito derrotado perde momentum
});

test("momentumDeltasForResult: favorito que vence ainda ganha momentum", () => {
  const result = {
    prestige: 90,
    standings: [
      { personId: "p1", position: 1, baseRating: 92 }, // favorito venceu como esperado
      { personId: "p2", position: 2, baseRating: 75 },
    ],
  };
  const deltas = momentumDeltasForResult(result);
  assert.ok(deltas.get("p1") > 0); // vencer sempre dá moral
  // O derrotado perdeu como esperado (não foi zebra): sem punição.
  assert.equal(deltas.get("p2") ?? 0, 0);
});

test("momentumDeltasForResult: etapa com vários usa expectativa de posição", () => {
  const result = {
    standings: [
      { personId: "p1", position: 1, baseRating: 60 }, // esperado 4º, terminou 1º -> sobe
      { personId: "p2", position: 2, baseRating: 70 },
      { personId: "p3", position: 3, baseRating: 80 },
      { personId: "p4", position: 4, baseRating: 90 }, // esperado 1º, terminou 4º -> cai
    ],
  };
  const deltas = momentumDeltasForResult(result);
  assert.ok(deltas.get("p1") > 0);
  assert.ok(deltas.get("p4") < 0);
});

test("momentumDeltasForResult: favorito vence etapa como esperado e mesmo assim ganha", () => {
  const result = {
    prestige: 80,
    standings: [
      { personId: "p1", position: 1, baseRating: 90 }, // esperado 1º, terminou 1º
      { personId: "p2", position: 2, baseRating: 80 },
      { personId: "p3", position: 3, baseRating: 70 },
      { personId: "p4", position: 4, baseRating: 60 },
    ],
  };
  const deltas = momentumDeltasForResult(result);
  // Sem a regra do vencedor, terminar exatamente na expectativa daria 0.
  assert.ok(deltas.get("p1") > 0);
});
