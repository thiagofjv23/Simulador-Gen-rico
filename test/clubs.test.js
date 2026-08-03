import test from "node:test";
import assert from "node:assert/strict";

import {
  ENTITY_TYPES,
  DEFAULT_ENTITY_TYPE,
  TEAM_RATING_MODELS,
  DEFAULT_TEAM_RATING_MODEL,
  MAX_TEAM_WEIGHT,
  buildClubStandings,
  clubIdFor,
  clubInvitationCandidates,
  clubsForModality,
  createClub,
  groupClubsByName,
  multiModalityTeams,
  multiSportTeams,
  entityTypeInfo,
  entityTypeLabel,
  isClub,
  isEntityType,
  isTeamRatingModel,
  normalizeTeamWeight,
  sumMemberPoints,
  teamRatingModelInfo,
  teamRatingModelLabel,
  validateClub,
} from "../js/clubs.js";
import {
  entityTypeForSport,
  sportAllowsAthletes,
  sportAllowsClubs,
} from "../js/sports.js";

test("existem três tipos de entidade: atleta, equipe e mista", () => {
  assert.deepEqual(Object.keys(ENTITY_TYPES), ["atleta", "equipe", "mista"]);
  assert.equal(ENTITY_TYPES.atleta.allowsAthletes, true);
  assert.equal(ENTITY_TYPES.atleta.allowsClubs, false);
  assert.equal(ENTITY_TYPES.equipe.allowsAthletes, false);
  assert.equal(ENTITY_TYPES.equipe.allowsClubs, true);
  assert.equal(ENTITY_TYPES.mista.allowsAthletes, true);
  assert.equal(ENTITY_TYPES.mista.allowsClubs, true);
  assert.equal(DEFAULT_ENTITY_TYPE, "atleta");
});

test("entityTypeInfo/label caem no padrão atleta para valores inválidos", () => {
  assert.equal(entityTypeInfo("inexistente").id, "atleta");
  assert.equal(entityTypeLabel("equipe"), "Equipe");
  assert.equal(isEntityType("mista"), true);
  assert.equal(isEntityType("outro"), false);
});

test("cada esporte declara seu tipo de entidade", () => {
  assert.equal(entityTypeForSport("sport_athletics"), "atleta");
  assert.equal(entityTypeForSport("sport_football"), "equipe");
  // Automobilismo permanece o esporte misto de referência.
  assert.equal(entityTypeForSport("sport_motorsport"), "mista");
  // Esporte inexistente cai no padrão.
  assert.equal(entityTypeForSport("sport_unknown"), "atleta");
});

test("os helpers de esporte informam quem pode disputar", () => {
  // Atletismo é só de atletas.
  assert.equal(sportAllowsClubs("sport_athletics"), false);
  assert.equal(sportAllowsAthletes("sport_athletics"), true);
  // Futebol é só de equipes.
  assert.equal(sportAllowsClubs("sport_football"), true);
  assert.equal(sportAllowsAthletes("sport_football"), false);
  // Automobilismo é misto: aceita atletas e equipes.
  assert.equal(sportAllowsClubs("sport_motorsport"), true);
  assert.equal(sportAllowsAthletes("sport_motorsport"), true);
});

test("createClub cria uma equipe com a mesma estrutura de um atleta", () => {
  const club = createClub({
    id: clubIdFor("sport_motorsport", "ferrari"),
    name: "Ferrari",
    sportId: "sport_motorsport",
    modalityId: "modality_motorsport_formula1",
    baseRating: 92,
    momentum: 2,
    age: 30,
    countryCode: "ITA",
    memberPersonIds: ["person_f1_charles-leclerc", "person_f1_lewis-hamilton"],
    rosterType: "preset",
  });

  assert.equal(club.id, "club_motorsport_ferrari");
  assert.equal(club.isClub, true);
  assert.equal(club.entityType, "equipe");
  assert.equal(isClub(club), true);
  // Mesmos atributos de uma pessoa, incluindo a hidratação geográfica.
  assert.equal(club.baseRating, 92);
  assert.equal(club.momentum, 2);
  assert.equal(club.countryId, "country_ita");
  assert.equal(club.countryName, "Itália");
  assert.equal(club.continentId, "continent_europe");
  assert.deepEqual(club.memberPersonIds, [
    "person_f1_charles-leclerc",
    "person_f1_lewis-hamilton",
  ]);
});

test("todo clube gerado tem o atributo Rivais (lista de ids)", () => {
  const club = createClub({ id: "club_x", name: "X", sportId: "sport_football" });
  assert.deepEqual(club.rivals, []);
  const withRivals = createClub({
    id: "club_y", name: "Y", sportId: "sport_football",
    rivals: ["club_a", "club_b", "club_a"],
  });
  // Sem duplicatas.
  assert.deepEqual(withRivals.rivals, ["club_a", "club_b"]);
});

test("um atleta comum não é confundido com um clube", () => {
  assert.equal(isClub({ id: "person_x", isClub: false }), false);
  assert.equal(isClub({ id: "person_x" }), false);
});

test("a pontuação de uma equipe mista é a soma dos pontos dos membros", () => {
  const points = new Map([
    ["person_a", 120],
    ["person_b", 80],
    ["person_c", 40],
  ]);
  assert.equal(sumMemberPoints(["person_a", "person_b"], points), 200);
  // Membros ausentes contam zero; duplicados não somam duas vezes.
  assert.equal(sumMemberPoints(["person_a", "person_a", "person_x"], points), 120);
  assert.equal(sumMemberPoints([], points), 0);
  // Também aceita um objeto simples em vez de Map.
  assert.equal(sumMemberPoints(["person_c"], { person_c: 40 }), 40);
});

test("existem dois modelos de rating de equipe: independent e weighted", () => {
  assert.deepEqual(Object.keys(TEAM_RATING_MODELS), ["independent", "weighted"]);
  assert.equal(TEAM_RATING_MODELS.independent.affectsSimulation, false);
  assert.equal(TEAM_RATING_MODELS.weighted.affectsSimulation, true);
  assert.equal(DEFAULT_TEAM_RATING_MODEL, "independent");
  assert.equal(MAX_TEAM_WEIGHT, 100);
  assert.equal(teamRatingModelLabel("weighted"), TEAM_RATING_MODELS.weighted.label);
  assert.equal(teamRatingModelInfo("inexistente").id, "independent");
  assert.equal(isTeamRatingModel("weighted"), true);
  assert.equal(isTeamRatingModel("outro"), false);
});

test("normalizeTeamWeight prende o peso ao intervalo 0–100 inteiro", () => {
  assert.equal(normalizeTeamWeight(60), 60);
  assert.equal(normalizeTeamWeight(-5), 0);
  assert.equal(normalizeTeamWeight(150), 100);
  assert.equal(normalizeTeamWeight(42.7), 43);
  assert.equal(normalizeTeamWeight("abc"), 0);
});

test("buildClubStandings ordena equipes pela soma dos pontos dos membros", () => {
  const club = (id, name, members, baseRating = 80) => createClub({
    id, name, sportId: "sport_motorsport", modalityId: "modality_x",
    baseRating, memberPersonIds: members,
  });
  const clubs = [
    club("club_a", "Alfa", ["p1", "p2"]),
    club("club_b", "Bravo", ["p3", "p4"]),
    club("club_c", "Charlie", ["p5"]),
  ];
  const athleteEntries = [
    { personId: "p1", points: 100, eventsCount: 3 },
    { personId: "p2", points: 40, eventsCount: 2 },
    { personId: "p3", points: 90, eventsCount: 2 },
    { personId: "p4", points: 90, eventsCount: 2 },
    { personId: "p5", points: 200, eventsCount: 1 },
  ];

  const standings = buildClubStandings(clubs, athleteEntries);
  assert.deepEqual(
    standings.map(({ club: c, points, position }) => [c.name, points, position]),
    [
      ["Charlie", 200, 1], // 200
      ["Bravo", 180, 2], // 90 + 90
      ["Alfa", 140, 3], // 100 + 40
    ],
  );
  assert.equal(standings[0].memberCount, 1);
  assert.equal(standings.find(({ club: c }) => c.name === "Bravo").eventsCount, 2);
});

const teamClub = (sportId, modalityId, name, baseRating, members) => createClub({
  id: clubIdFor(sportId, `${modalityId}_${name}`.toLowerCase().replace(/\s+/g, "-")),
  name, sportId, modalityId, baseRating, memberPersonIds: members,
});

const sampleClubs = [
  teamClub("sport_motorsport", "mod_f1", "Prema", 90, ["p1", "p2"]),
  teamClub("sport_motorsport", "mod_f2", "Prema", 84, ["p3", "p4"]),
  teamClub("sport_motorsport", "mod_f3", "Prema", 80, ["p5"]),
  teamClub("sport_motorsport", "mod_f1", "Solo", 88, ["p6", "p7"]),
];

test("clubsForModality lista equipes de uma modalidade ordenadas por rating", () => {
  const f1 = clubsForModality(sampleClubs, "sport_motorsport", "mod_f1");
  assert.deepEqual(f1.map((c) => c.name), ["Prema", "Solo"]);
  assert.equal(f1[0].baseRating, 90);
});

test("groupClubsByName reúne uma equipe em várias modalidades", () => {
  const groups = groupClubsByName(sampleClubs);
  const prema = groups.find((g) => g.name === "Prema");
  assert.equal(prema.clubs.length, 3);
  assert.deepEqual(prema.modalityIds.sort(), ["mod_f1", "mod_f2", "mod_f3"]);
  assert.deepEqual(prema.sportIds, ["sport_motorsport"]);
  assert.deepEqual(prema.memberPersonIds.sort(), ["p1", "p2", "p3", "p4", "p5"]);
  // Rating médio das três equipes Prema: (90+84+80)/3 = 84,67 -> 85.
  assert.equal(prema.averageRating, 85);
});

test("multiModalityTeams traz só equipes em 2+ modalidades do esporte", () => {
  const multi = multiModalityTeams(sampleClubs, "sport_motorsport");
  assert.deepEqual(multi.map((g) => g.name), ["Prema"]);
  // "Solo" só aparece na F1, então não entra.
  assert.ok(!multi.some((g) => g.name === "Solo"));
});

test("multiSportTeams fica vazio quando há um só esporte", () => {
  assert.deepEqual(multiSportTeams(sampleClubs), []);
  // Com a mesma equipe em dois esportes, ela aparece.
  const crossSport = [
    ...sampleClubs,
    teamClub("sport_other", "mod_x", "Prema", 70, ["p8"]),
  ];
  const multi = multiSportTeams(crossSport);
  assert.deepEqual(multi.map((g) => g.name), ["Prema"]);
  assert.deepEqual(multi[0].sportIds.sort(), ["sport_motorsport", "sport_other"]);
});

test("validateClub exige identificador, nome e esporte", () => {
  assert.deepEqual(
    validateClub(createClub({
      id: "club_x",
      name: "Clube X",
      sportId: "sport_motorsport",
    })),
    [],
  );
  const errors = validateClub({ name: "  ", baseRating: "abc" }).join(" ");
  assert.match(errors, /identificador/i);
  assert.match(errors, /nome/i);
  assert.match(errors, /esporte/i);
  assert.match(errors, /rating/i);
});

test("clubInvitationCandidates lista as equipes do esporte por rating", () => {
  const clubs = [
    createClub({ id: "club_football_a", name: "Alfa FC", sportId: "sport_football", modalityId: "modality_football", baseRating: 70, countryCode: "BRA" }),
    createClub({ id: "club_football_b", name: "Beta FC", sportId: "sport_football", modalityId: "modality_football", baseRating: 85, countryCode: "BRA" }),
    createClub({ id: "club_basket_c", name: "Cesta EC", sportId: "sport_basketball", modalityId: "modality_basketball_5x5", baseRating: 90, countryCode: "USA" }),
  ];
  const candidates = clubInvitationCandidates(clubs, {
    sportId: "sport_football",
    modalityId: "modality_football",
    geographicScope: "world",
  });
  // Só as equipes de futebol, ordenadas por rating (Beta antes de Alfa).
  assert.deepEqual(candidates.map((c) => c.personId), ["club_football_b", "club_football_a"]);
  assert.equal(candidates[0].position, 1);
  assert.equal(candidates[0].person.name, "Beta FC");
  assert.equal(candidates[0].points, 85);
});

test("clubInvitationCandidates respeita a abrangência geográfica", () => {
  const clubs = [
    createClub({ id: "club_football_br", name: "Brasil FC", sportId: "sport_football", modalityId: "modality_football", baseRating: 70, countryCode: "BRA" }),
    createClub({ id: "club_football_jp", name: "Japão FC", sportId: "sport_football", modalityId: "modality_football", baseRating: 80, countryCode: "JPN" }),
  ];
  const candidates = clubInvitationCandidates(clubs, {
    sportId: "sport_football",
    modalityId: "modality_football",
    geographicScope: "national",
    countryId: "country_bra",
  });
  assert.deepEqual(candidates.map((c) => c.personId), ["club_football_br"]);
});

test("clubInvitationCandidates cai para o esporte quando a modalidade não casa", () => {
  const clubs = [
    createClub({ id: "club_football_a", name: "Alfa FC", sportId: "sport_football", modalityId: "modality_football", baseRating: 70, countryCode: "BRA" }),
  ];
  // Modalidade legada sem clubes correspondentes: usa todas as equipes do esporte.
  const candidates = clubInvitationCandidates(clubs, {
    sportId: "sport_football",
    modalityId: "modality_football_brasileirao",
    geographicScope: "world",
  });
  assert.deepEqual(candidates.map((c) => c.personId), ["club_football_a"]);
});
