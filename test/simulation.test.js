import test from "node:test";
import assert from "node:assert/strict";

import {
  buildInitialRanking,
  combineRanking,
  createInitialPeople,
} from "../js/ranking.js";
import {
  qualifierParticipantIdsFor,
  rankingPointsForPosition,
  selectParticipants,
  simulateCompetition,
} from "../js/simulation.js";

const timestamp = "2028-01-01T00:00:00.000Z";
const people = createInitialPeople(timestamp);
const entries = buildInitialRanking(people, timestamp);
const ranking = combineRanking(people, entries);
const competition = {
  id: "competition_world_championship",
  name: "Campeonato Mundial",
  sport: "Atletismo",
  discipline: "100 m rasos",
  prestige: 95,
  rankingPoints: 300,
  slots: 16,
  qualification: "ranking",
};

test("por ranking usa o número de vagas como corte", () => {
  const participants = selectParticipants(ranking, competition);
  assert.equal(participants.length, 16);
  assert.deepEqual(
    participants.map(({ position }) => position),
    Array.from({ length: 16 }, (_, index) => index + 1),
  );
});

test("a abrangência continental impede atletas de outros continentes", () => {
  const participants = selectParticipants(ranking, {
    ...competition,
    geographicScope: "continental",
    continentId: "continent_africa",
  });
  assert.equal(participants.length, 15);
  assert.ok(participants.every(({ person }) => person.continentId === "continent_africa"));
});

test("a abrangência nacional permite somente atletas do país escolhido", () => {
  const participants = selectParticipants(ranking, {
    ...competition,
    geographicScope: "national",
    continentId: "continent_south_america",
    countryId: "country_bra",
  });
  assert.equal(participants.length, 5);
  assert.ok(participants.every(({ person }) => person.countryId === "country_bra"));
});

test("distribui pontos proporcionais até a oitava posição", () => {
  assert.deepEqual(
    Array.from({ length: 8 }, (_, index) => rankingPointsForPosition(300, index + 1)),
    [300, 210, 150, 105, 75, 45, 30, 15],
  );
  assert.equal(rankingPointsForPosition(300, 9), 0);
});

test("por convite usa somente os atletas escolhidos pelo jogador", () => {
  const invitedPersonIds = [ranking[9].personId, ranking[19].personId, ranking[29].personId];
  const participants = selectParticipants(
    ranking,
    { ...competition, qualification: "invitation", slots: 3 },
    { invitedPersonIds },
  );
  assert.deepEqual(
    participants.map(({ personId }) => personId),
    invitedPersonIds,
  );
});

test("por classificatória usa as posições recebidas do resultado eliminatório", () => {
  const qualifierPersonIds = [ranking[24].personId, ranking[31].personId];
  const participants = selectParticipants(
    ranking,
    { ...competition, qualification: "qualifier", slots: 2 },
    { qualifierPersonIds },
  );
  assert.deepEqual(
    participants.map(({ personId }) => personId),
    qualifierPersonIds,
  );
});

test("o elo eliminatório leva as melhores posições do resultado ao torneio de destino", () => {
  const target = { ...competition, id: "target", qualification: "qualifier", slots: 3 };
  const qualifier = {
    ...competition,
    id: "qualifier",
    name: "Classificatória",
    type: "qualifier",
    qualifierTargetCompetitionId: target.id,
    qualifierSlots: 3,
    startDate: "2028-03-01",
    endDate: "2028-03-02",
  };
  const qualifierPersonIds = qualifierParticipantIdsFor({
    competition: target,
    occurrenceStart: "2028-04-21",
    competitions: [target, qualifier],
    results: [{
      competitionId: qualifier.id,
      occurrenceEnd: "2028-03-02",
      standings: ranking.slice(20, 25).map(({ personId }) => ({ personId })),
    }],
  });
  assert.deepEqual(
    qualifierPersonIds,
    ranking.slice(20, 23).map(({ personId }) => personId),
  );
});

test("classificação mista respeita a divisão e não duplica atletas", () => {
  const participants = selectParticipants(
    ranking,
    {
      ...competition,
      qualification: "mixed",
      mixedCombination: "ranking+qualifier+invitation",
      mixedSlots: { ranking: 2, qualifier: 2, invitation: 2 },
      slots: 6,
    },
    {
      qualifierPersonIds: [ranking[0].personId, ranking[5].personId],
      invitedPersonIds: [ranking[1].personId, ranking[2].personId],
    },
  );
  assert.equal(participants.length, 6);
  assert.equal(new Set(participants.map(({ personId }) => personId)).size, 6);
  assert.deepEqual(
    participants.slice(0, 4).map(({ personId }) => personId),
    [
      ranking[0].personId,
      ranking[5].personId,
      ranking[1].personId,
      ranking[2].personId,
    ],
  );
});

test("gera resultado plausível, concede pontos e recalcula as 100 posições", () => {
  const simulation = simulateCompetition({
    competition,
    occurrenceStart: "2028-07-20",
    occurrenceEnd: "2028-07-20",
    ranking,
  });

  assert.equal(simulation.result.standings.length, 16);
  assert.ok(
    simulation.result.standings.every(
      (standing, index, standings) =>
        index === 0 || standings[index - 1].performance >= standing.performance,
    ),
  );
  assert.deepEqual(
    simulation.result.standings.map(({ pointsAwarded }) => pointsAwarded),
    [300, 210, 150, 105, 75, 45, 30, 15, 0, 0, 0, 0, 0, 0, 0, 0],
  );
  assert.equal(simulation.rankingEntries.length, 100);
  assert.deepEqual(
    simulation.rankingEntries.map(({ position }) => position),
    Array.from({ length: 100 }, (_, index) => index + 1),
  );

  const pointsBefore = entries.reduce((total, entry) => total + entry.points, 0);
  const pointsAfter = simulation.rankingEntries.reduce((total, entry) => total + entry.points, 0);
  assert.equal(pointsAfter - pointsBefore, 930);
  assert.equal(
    simulation.rankingEntries.filter(({ eventsCount }) => eventsCount === 1).length,
    16,
  );
});

test("a mesma edição e o mesmo estado anterior não mudam ao recarregar", () => {
  const first = simulateCompetition({
    competition,
    occurrenceStart: "2028-07-20",
    occurrenceEnd: "2028-07-20",
    ranking,
  });
  const second = simulateCompetition({
    competition,
    occurrenceStart: "2028-07-20",
    occurrenceEnd: "2028-07-20",
    ranking,
  });
  assert.deepEqual(first, second);
});
