import test from "node:test";
import assert from "node:assert/strict";

import {
  buildInitialRanking,
  combineRanking,
  createInitialPeople,
} from "../js/ranking.js";
import {
  qualifierParticipantIdsFor,
  matchesEventType,
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

test("matchesEventType casa por tipo de evento e é tolerante com quem não tem", () => {
  assert.equal(matchesEventType({ eventTypeId: "event_a" }, { eventTypeId: "event_a" }), true);
  assert.equal(matchesEventType({ eventTypeId: "event_b" }, { eventTypeId: "event_a" }), false);
  // Entidade sem eventTypeId (legada/preset) sempre passa.
  assert.equal(matchesEventType({}, { eventTypeId: "event_a" }), true);
  // Competição sem eventTypeId não filtra.
  assert.equal(matchesEventType({ eventTypeId: "event_b" }, {}), true);
});

test("a competição atrelada a um evento só seleciona entidades daquele evento", () => {
  const make = (id, eventTypeId, baseRating, countryCode) => ({
    id, name: id, age: 25, momentum: 0, baseRating, countryCode,
    sportId: "sport_athletics", modalityId: "modality_athletics", eventTypeId,
  });
  const evPeople = [
    make("p_100_1", "event_athletics_100m", 90, "BRA"),
    make("p_100_2", "event_athletics_100m", 88, "USA"),
    make("p_mar_1", "event_athletics_marathon", 95, "KEN"),
    // Atleta legado sem eventTypeId permanece elegível.
    make("p_legacy", undefined, 80, "JAM"),
  ];
  const evEntries = buildInitialRanking(evPeople, timestamp, {
    rankingId: "ranking_sport_athletics_modality_athletics",
    sportId: "sport_athletics",
    modalityId: "modality_athletics",
  }).map((e) => ({ ...e, sportId: "sport_athletics", modalityId: "modality_athletics" }));
  const evRanking = combineRanking(evPeople, evEntries);

  const selected = selectParticipants(evRanking, {
    id: "c1", sportId: "sport_athletics", modalityId: "modality_athletics",
    eventTypeId: "event_athletics_100m", slots: 10, qualification: "ranking",
    geographicScope: "world",
  });
  const ids = selected.map((s) => s.personId);
  assert.ok(ids.includes("p_100_1") && ids.includes("p_100_2"));
  assert.ok(ids.includes("p_legacy")); // sem eventTypeId, ainda elegível
  assert.ok(!ids.includes("p_mar_1")); // maratonista fica de fora do 100 m
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

test("uma etapa em baterias com marca direta produz tempos coerentes", () => {
  const simulation = simulateCompetition({
    competition: {
      ...competition,
      eventFormat: "heats",
      resultMetric: "direct-mark",
      markType: "time",
      heatSize: 8,
    },
    occurrenceStart: "2028-08-01",
    occurrenceEnd: "2028-08-01",
    ranking,
  });
  const standings = simulation.result.standings;
  assert.equal(simulation.result.resultMetric, "direct-mark");
  assert.equal(simulation.result.markType, "time");
  assert.ok(standings.every((s) => typeof s.mark === "number" && s.markLabel.endsWith(" s")));
  assert.ok(standings.every((s) => s.heatNumber >= 1));
  // Tempo: o primeiro colocado tem a menor marca.
  assert.ok(standings[0].mark <= standings[1].mark);
});

test("uma etapa de todos contra todos com placar de jogo gera registro", () => {
  const simulation = simulateCompetition({
    competition: {
      ...competition,
      slots: 6,
      eventFormat: "round-robin",
      resultMetric: "match-score",
    },
    occurrenceStart: "2028-08-02",
    occurrenceEnd: "2028-08-02",
    ranking,
  });
  const standings = simulation.result.standings;
  assert.equal(standings.length, 6);
  assert.ok(standings.every((s) => /\dV \dE \dD/.test(s.recordLabel)));
  assert.ok(standings.every((s) => Number.isFinite(s.eventPoints)));
});

test("sem formato/métrica definidos o resultado mantém o comportamento antigo", () => {
  const simulation = simulateCompetition({
    competition,
    occurrenceStart: "2028-09-09",
    occurrenceEnd: "2028-09-09",
    ranking,
  });
  const standings = simulation.result.standings;
  assert.equal(simulation.result.resultMetric, null);
  assert.equal(simulation.result.eventFormat, null);
  // Nenhum campo novo de métrica é adicionado quando não há configuração.
  assert.ok(standings.every((s) => s.mark === undefined && s.recordLabel === undefined));
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

// --- Passo 2: rating de equipe no modelo misto ---------------------------

const mixedBase = {
  ...competition,
  id: "competition_mixed",
  slots: 8,
};

test("o modelo independent (padrão) não altera a performance dos atletas", () => {
  const baseline = simulateCompetition({
    competition: mixedBase,
    occurrenceStart: "2028-08-01",
    occurrenceEnd: "2028-08-01",
    ranking,
  });
  // Modelo independent com um mapa de rating de equipe: como não influencia, o
  // resultado é idêntico ao da simulação sem qualquer equipe.
  const teamMap = new Map(ranking.slice(0, 8).map(({ personId }) => [personId, 99]));
  const independent = simulateCompetition({
    competition: { ...mixedBase, teamRatingModel: "independent", teamWeight: 60 },
    occurrenceStart: "2028-08-01",
    occurrenceEnd: "2028-08-01",
    ranking,
    teamRatingByPersonId: teamMap,
  });
  assert.deepEqual(
    independent.result.standings.map((s) => [s.personId, s.performance]),
    baseline.result.standings.map((s) => [s.personId, s.performance]),
  );
  assert.equal(independent.result.teamWeight, 0);
});

test("peso 0 ou mapa vazio no modelo weighted preserva o resultado original", () => {
  const baseline = simulateCompetition({
    competition: mixedBase,
    occurrenceStart: "2028-08-02",
    occurrenceEnd: "2028-08-02",
    ranking,
  });
  const zeroWeight = simulateCompetition({
    competition: { ...mixedBase, teamRatingModel: "weighted", teamWeight: 0 },
    occurrenceStart: "2028-08-02",
    occurrenceEnd: "2028-08-02",
    ranking,
    teamRatingByPersonId: new Map(ranking.slice(0, 8).map(({ personId }) => [personId, 10])),
  });
  const emptyMap = simulateCompetition({
    competition: { ...mixedBase, teamRatingModel: "weighted", teamWeight: 60 },
    occurrenceStart: "2028-08-02",
    occurrenceEnd: "2028-08-02",
    ranking,
    teamRatingByPersonId: new Map(),
  });
  const performances = (sim) => sim.result.standings.map((s) => [s.personId, s.performance]);
  assert.deepEqual(performances(zeroWeight), performances(baseline));
  assert.deepEqual(performances(emptyMap), performances(baseline));
});

test("o modelo weighted mistura o rating da equipe na performance do atleta", () => {
  // Uma equipe forte (99) eleva a performance; uma fraca (10) reduz. Comparamos
  // a performance de um mesmo atleta entre os dois cenários.
  const strongTeam = new Map(ranking.map(({ personId }) => [personId, 99]));
  const weakTeam = new Map(ranking.map(({ personId }) => [personId, 10]));
  const weighted = { ...mixedBase, teamRatingModel: "weighted", teamWeight: 60 };

  const strong = simulateCompetition({
    competition: weighted,
    occurrenceStart: "2028-08-03",
    occurrenceEnd: "2028-08-03",
    ranking,
    teamRatingByPersonId: strongTeam,
  });
  const weak = simulateCompetition({
    competition: weighted,
    occurrenceStart: "2028-08-03",
    occurrenceEnd: "2028-08-03",
    ranking,
    teamRatingByPersonId: weakTeam,
  });

  const strongByPerson = new Map(strong.result.standings.map((s) => [s.personId, s.performance]));
  const weakByPerson = new Map(weak.result.standings.map((s) => [s.personId, s.performance]));
  // A variação diária é idêntica (mesma semente), então a diferença vem só do
  // rating da equipe: com equipe forte, cada atleta rende mais.
  for (const [personId, strongPerf] of strongByPerson) {
    assert.ok(strongPerf > weakByPerson.get(personId));
  }
  assert.equal(strong.result.teamRatingModel, "weighted");
  assert.equal(strong.result.teamWeight, 60);
});
