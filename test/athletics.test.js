import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRollingRankingEntries,
  isWithinWindow,
  mergeRollingRanking,
  performanceRecordsFromResults,
  rollingRankingScore,
  windowStartDate,
} from "../js/athletics.js";

function result({ id, modalityId, sportId = "sport_athletics", date, standings, prestige = 60, name = "Etapa" }) {
  return {
    id,
    competitionId: id,
    competitionName: name,
    sportId,
    modalityId,
    prestige,
    occurrenceEnd: date,
    standings,
  };
}

function podium(entries) {
  return entries.map(([personId, position, pointsAwarded]) => ({
    personId,
    position,
    pointsAwarded,
  }));
}

test("a janela de 12 meses corta pela data correta", () => {
  assert.equal(windowStartDate("2026-07-30", 12), "2025-07-30");
  assert.equal(windowStartDate("2026-07-30", 18), "2025-01-30");
  assert.ok(isWithinWindow("2025-08-01", "2026-07-30", 12));
  assert.ok(!isWithinWindow("2025-07-29", "2026-07-30", 12));
  // provas longas enxergam 18 meses para trás
  assert.ok(isWithinWindow("2025-03-01", "2026-07-30", 18));
  assert.ok(!isWithinWindow("2025-03-01", "2026-07-30", 12));
});

test("o score é a média das N melhores, arredondada para baixo", () => {
  const records = [
    { personId: "a", points: 100, date: "2026-01-10" },
    { personId: "a", points: 90, date: "2026-02-10" },
    { personId: "a", points: 80, date: "2026-03-10" },
    { personId: "a", points: 70, date: "2026-04-10" },
    { personId: "a", points: 60, date: "2026-05-10" },
    { personId: "a", points: 10, date: "2026-06-10" }, // fora das 5 melhores
  ];
  const { score, counted } = rollingRankingScore(records, {
    referenceDate: "2026-07-01",
    windowMonths: 12,
    bestN: 5,
  });
  // média de 100,90,80,70,60 = 80
  assert.equal(score, 80);
  assert.equal(counted, 5);
});

test("performances fora da janela expiram e deixam de contar", () => {
  const records = [
    { personId: "a", points: 100, date: "2024-01-10" }, // expirada em 2026
    { personId: "a", points: 50, date: "2026-01-10" },
    { personId: "a", points: 40, date: "2026-03-10" },
  ];
  const { score, valid } = rollingRankingScore(records, {
    referenceDate: "2026-07-01",
    windowMonths: 12,
    bestN: 5,
  });
  // só as duas válidas entram: média de 50 e 40 = 45
  assert.equal(valid, 2);
  assert.equal(score, 45);
});

test("com menos performances que o mínimo, o atleta não é rankeado", () => {
  const { ranked, score } = rollingRankingScore(
    [{ personId: "a", points: 90, date: "2026-05-01" }],
    { referenceDate: "2026-07-01", windowMonths: 12, bestN: 5, minPerformances: 3 },
  );
  assert.equal(ranked, false);
  assert.equal(score, 0);
});

test("extrai uma performance por atleta por resultado", () => {
  const records = performanceRecordsFromResults(
    [result({
      id: "r1",
      modalityId: "modality_athletics_100m",
      date: "2026-05-10",
      standings: podium([["a", 1, 100], ["b", 2, 70], ["c", 3, 50]]),
    })],
    { sportId: "sport_athletics", modalityId: "modality_athletics_100m" },
  );
  assert.equal(records.length, 3);
  assert.equal(records[0].personId, "a");
  assert.equal(records[0].points, 100);
});

test("constrói o ranking ordenado e posicionado de uma modalidade", () => {
  const results = [
    result({
      id: "r1",
      modalityId: "modality_athletics_100m",
      date: "2026-05-10",
      standings: podium([["a", 1, 100], ["b", 2, 70]]),
    }),
    result({
      id: "r2",
      modalityId: "modality_athletics_100m",
      date: "2026-06-10",
      standings: podium([["b", 1, 100], ["a", 2, 70]]),
    }),
  ];
  const ranking = buildRollingRankingEntries(results, {
    sportId: "sport_athletics",
    modalityId: "modality_athletics_100m",
    rankingId: "ranking_athletics_100m",
    referenceDate: "2026-07-01",
  });
  // a: média(100,70)=85 ; b: média(100,70)=85 -> empate, desempate estável
  assert.equal(ranking.length, 2);
  assert.deepEqual(ranking.map((e) => e.position), [1, 2]);
  assert.ok(ranking.every((e) => e.points === 85));
});

test("mergeRollingRanking preserva tênis/F1 e recalcula só o atletismo", () => {
  const rankingIdFor = (sportId, modalityId) => `ranking_${sportId}_${modalityId}`;
  const existing = [
    { rankingId: "ranking_sport_tennis_modality_tennis_mens_singles", personId: "t1", position: 1, points: 5000, rankingModel: "cumulative" },
    { rankingId: rankingIdFor("sport_athletics", "modality_athletics_100m"), personId: "a", position: 1, points: 0 },
  ];
  const results = [
    result({
      id: "r1",
      modalityId: "modality_athletics_100m",
      date: "2026-05-10",
      standings: podium([["a", 1, 100], ["b", 2, 70]]),
    }),
  ];
  const merged = mergeRollingRanking(existing, results, {
    referenceDate: "2026-07-01",
    rankingIdFor,
  });
  // tênis intacto
  const tennis = merged.find((e) => e.rankingId.includes("tennis"));
  assert.equal(tennis.points, 5000);
  // atletismo recalculado a partir do resultado
  const athletics = merged.filter((e) => e.rankingId.includes("athletics"));
  assert.equal(athletics.length, 2);
  assert.equal(athletics.find((e) => e.personId === "a").points, 100);
  assert.equal(athletics.find((e) => e.personId === "b").points, 70);
});
