import test from "node:test";
import assert from "node:assert/strict";

import {
  MIXED_QUALIFICATION_COMBINATIONS,
  buildCalendarEvent,
  competitionStats,
  invitationOpensOn,
  qualificationLabel,
  qualificationMethods,
  slotsForQualificationMethod,
  sortCompetitions,
  validateCompetition,
} from "../js/competition.js";

const validCompetition = {
  id: "competition_national",
  calendarEventId: "event_national",
  name: "Campeonato Nacional",
  sportId: "sport_tennis",
  modalityId: "modality_tennis_mens_singles",
  sport: "Tênis",
  discipline: "Simples masculino",
  type: "championship",
  qualification: "ranking",
  geographicScope: "national",
  continentId: "continent_south_america",
  countryId: "country_bra",
  startDate: "2028-04-21",
  endDate: "2028-04-24",
  recurrence: "yearly",
  prestige: 75,
  rankingPoints: 300,
  slots: 24,
  minimumRanking: 100,
  notes: "",
  createdAt: "2028-01-01T00:00:00.000Z",
  updatedAt: "2028-01-01T00:00:00.000Z",
};

test("aceita uma competição completa e válida", () => {
  assert.deepEqual(validateCompetition(validCompetition), []);
});

test("aceita um modelo de rating de equipe válido com peso no intervalo", () => {
  assert.deepEqual(
    validateCompetition({
      ...validCompetition,
      teamRatingModel: "weighted",
      teamWeight: 60,
    }),
    [],
  );
});

test("rejeita modelo de rating de equipe ou peso inválidos", () => {
  const errors = validateCompetition({
    ...validCompetition,
    teamRatingModel: "desconhecido",
    teamWeight: 150,
  }).join(" ");
  assert.match(errors, /modelo de rating de equipe/i);
  assert.match(errors, /peso da equipe/i);
});

test("rejeita datas invertidas", () => {
  const invalid = {
    ...validCompetition,
    startDate: "2028-04-25",
    endDate: "2028-04-24",
  };
  assert.match(validateCompetition(invalid).join(" "), /data final/i);
});

test("rejeita prestígio e vagas fora dos limites", () => {
  const invalid = { ...validCompetition, prestige: 101, slots: 1 };
  const errors = validateCompetition(invalid).join(" ");
  assert.match(errors, /prestígio/i);
  assert.match(errors, /vagas/i);
});

test("rejeita pontuação do vencedor fora dos limites", () => {
  const invalid = { ...validCompetition, rankingPoints: 0 };
  assert.match(validateCompetition(invalid).join(" "), /pontos do vencedor/i);
});

test("rejeita um sistema de pontuação inexistente", () => {
  const invalid = { ...validCompetition, scoringSystemId: "unknown" };
  assert.match(validateCompetition(invalid).join(" "), /sistema de pontuação/i);
});

test("uma etapa de temporada exige nome e repetição anual", () => {
  const invalid = {
    ...validCompetition,
    competitionModel: "season_stage",
    seasonName: "",
    recurrence: "none",
  };
  const errors = validateCompetition(invalid).join(" ");
  assert.match(errors, /campeonato anual/i);
  assert.match(errors, /repetir todos os anos/i);

  assert.deepEqual(validateCompetition({
    ...invalid,
    seasonName: "Campeonato Mundial",
    recurrence: "yearly",
  }), []);
});

test("exige continente e país coerentes em uma competição nacional", () => {
  const invalid = {
    ...validCompetition,
    countryId: "country_usa",
  };
  assert.match(validateCompetition(invalid).join(" "), /país pertencente/i);
});

test("uma competição mundial não exige continente ou país", () => {
  const worldCompetition = {
    ...validCompetition,
    geographicScope: "world",
    continentId: null,
    countryId: null,
  };
  assert.deepEqual(validateCompetition(worldCompetition), []);
});

test("por ranking exige vagas válidas e usa esse total como corte", () => {
  const competition = { ...validCompetition, slots: 32, minimumRanking: null };
  assert.deepEqual(validateCompetition(competition), []);
  assert.equal(slotsForQualificationMethod(competition, "ranking"), 32);
});

test("oferece todas as onze combinações mistas possíveis", () => {
  assert.equal(MIXED_QUALIFICATION_COMBINATIONS.length, 11);
  assert.ok(
    MIXED_QUALIFICATION_COMBINATIONS.some(
      ({ id }) => id === "open+ranking+qualifier+invitation",
    ),
  );
});

test("a classificação mista exige que a distribuição some todas as vagas", () => {
  const mixed = {
    ...validCompetition,
    qualification: "mixed",
    mixedCombination: "ranking+qualifier+invitation",
    mixedSlots: { ranking: 8, qualifier: 4, invitation: 4 },
    slots: 16,
  };
  assert.deepEqual(validateCompetition(mixed), []);
  assert.deepEqual(
    qualificationMethods(mixed),
    ["ranking", "qualifier", "invitation"],
  );

  const invalid = {
    ...mixed,
    mixedSlots: { ranking: 8, qualifier: 3, invitation: 4 },
  };
  assert.match(validateCompetition(invalid).join(" "), /somar exatamente 16/i);
});

test("uma classificatória deve apontar para torneio posterior compatível", () => {
  const target = {
    ...validCompetition,
    id: "competition_target",
    qualification: "qualifier",
    slots: 8,
  };
  const qualifier = {
    ...validCompetition,
    id: "competition_qualifier",
    calendarEventId: "event_qualifier",
    name: "Eliminatória nacional",
    type: "qualifier",
    qualification: "ranking",
    startDate: "2028-03-20",
    endDate: "2028-03-21",
    qualifierTargetCompetitionId: target.id,
    qualifierSlots: 4,
  };
  assert.deepEqual(
    validateCompetition(qualifier, { competitions: [target] }),
    [],
  );

  const incompatible = {
    ...qualifier,
    modalityId: "modality_other",
  };
  assert.match(
    validateCompetition(incompatible, { competitions: [target] }).join(" "),
    /mesmo esporte e modalidade/i,
  );
});

test("a janela de convites abre dez dias antes inclusive ao cruzar o mês", () => {
  assert.equal(invitationOpensOn("2028-04-05"), "2028-03-26");
});

test("gera um evento de calendário vinculado sem perder as datas", () => {
  const calendarEvent = buildCalendarEvent(validCompetition);
  assert.equal(calendarEvent.id, validCompetition.calendarEventId);
  assert.equal(calendarEvent.competitionId, validCompetition.id);
  assert.equal(calendarEvent.startDate, validCompetition.startDate);
  assert.equal(calendarEvent.endDate, validCompetition.endDate);
  assert.equal(calendarEvent.recurrence, "yearly");
  assert.equal(calendarEvent.source, "competition");
});

test("ordena competições por data e depois por nome", () => {
  const competitions = [
    { ...validCompetition, id: "b", name: "Copa B", startDate: "2028-05-01" },
    { ...validCompetition, id: "c", name: "Copa C", startDate: "2028-04-01" },
    { ...validCompetition, id: "a", name: "Copa A", startDate: "2028-05-01" },
  ];
  assert.deepEqual(sortCompetitions(competitions).map(({ id }) => id), ["c", "a", "b"]);
});

test("calcula os indicadores do painel", () => {
  const competitions = [
    validCompetition,
    { ...validCompetition, id: "second", recurrence: "none", prestige: 25 },
  ];
  assert.deepEqual(
    competitionStats(competitions),
    { total: 2, annual: 1, averagePrestige: 50 },
  );
});

test("traduz o critério de classificação para a interface", () => {
  assert.equal(qualificationLabel("ranking"), "Por ranking");
});
