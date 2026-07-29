import test from "node:test";
import assert from "node:assert/strict";

import {
  buildInitialRanking,
  combineRanking,
  rankingIdFor,
} from "../js/ranking.js";
import {
  buildPresetCompetitions,
  buildPresetPeople,
  presetById,
} from "../js/presets.js";
import { simulateCompetition } from "../js/simulation.js";

const timestamp = "2026-01-01T00:00:00.000Z";
const preset = presetById("fia-ecosystem-2026");
const SPORT_ID = "sport_motorsport";
const MODALITY_ID = "modality_motorsport_formula1";
const people = buildPresetPeople(preset, timestamp)
  .filter(({ modalityId }) => modalityId === MODALITY_ID);
const entries = buildInitialRanking(people, timestamp, {
  rankingId: rankingIdFor(SPORT_ID, MODALITY_ID),
  sportId: SPORT_ID,
  modalityId: MODALITY_ID,
  rankingModel: "seasonal",
  seasonYear: 2026,
  startAtZero: true,
});
const ranking = combineRanking(people, entries);
const competitions = buildPresetCompetitions(preset, timestamp)
  .filter(({ modalityId }) => modalityId === MODALITY_ID);

test("uma etapa da Fórmula 1 usa os 22 pilotos e distribui 101 pontos", () => {
  const competition = competitions[0];
  const simulation = simulateCompetition({
    competition,
    occurrenceStart: competition.startDate,
    occurrenceEnd: competition.endDate,
    ranking,
  });
  assert.equal(simulation.result.participantCount, 22);
  assert.deepEqual(
    simulation.result.standings.slice(0, 10).map(({ pointsAwarded }) => pointsAwarded),
    [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
  );
  assert.equal(
    simulation.result.standings.reduce(
      (total, { pointsAwarded }) => total + pointsAwarded,
      0,
    ),
    101,
  );
});

test("a última etapa registra o campeão da temporada", () => {
  const competition = competitions.at(-1);
  const simulation = simulateCompetition({
    competition,
    occurrenceStart: competition.startDate,
    occurrenceEnd: competition.endDate,
    ranking,
  });
  assert.equal(simulation.result.seasonChampion.seasonYear, 2026);
  assert.match(simulation.result.seasonChampion.name, /\(.+\)$/);
  assert.equal(simulation.result.seasonChampion.points, 25);
});

test("as 24 etapas formam uma temporada completa e cumulativa", () => {
  let currentRanking = ranking;
  let finalResult = null;
  for (const competition of competitions) {
    const simulation = simulateCompetition({
      competition,
      occurrenceStart: competition.startDate,
      occurrenceEnd: competition.endDate,
      ranking: currentRanking,
    });
    currentRanking = combineRanking(people, simulation.rankingEntries);
    finalResult = simulation.result;
  }

  assert.equal(
    currentRanking.reduce((total, { points }) => total + points, 0),
    24 * 101,
  );
  assert.ok(currentRanking.every(({ eventsCount }) => eventsCount === 24));
  assert.equal(finalResult.seasonChampion.personId, currentRanking[0].personId);
  assert.equal(finalResult.seasonChampion.points, currentRanking[0].points);
});

test("a primeira etapa de um novo ano ignora os pontos da temporada anterior", () => {
  const competition = competitions[0];
  const previousSeasonRanking = ranking.map((entry, index) => ({
    ...entry,
    points: 500 - index,
    eventsCount: 24,
    seasonYear: 2026,
  }));
  const simulation = simulateCompetition({
    competition,
    occurrenceStart: "2027-03-06",
    occurrenceEnd: "2027-03-08",
    ranking: previousSeasonRanking,
  });
  assert.equal(simulation.rankingEntries[0].seasonYear, 2027);
  assert.equal(simulation.rankingEntries[0].points, 25);
  assert.ok(simulation.rankingEntries.every(({ eventsCount }) => eventsCount <= 1));
});
