import test from "node:test";
import assert from "node:assert/strict";

import {
  ENTITY_TYPES,
  DEFAULT_ENTITY_TYPE,
  clubIdFor,
  createClub,
  entityTypeInfo,
  entityTypeLabel,
  isClub,
  isEntityType,
  sumMemberPoints,
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
  assert.equal(entityTypeForSport("sport_tennis"), "atleta");
  assert.equal(entityTypeForSport("sport_athletics"), "atleta");
  assert.equal(entityTypeForSport("sport_motorsport"), "mista");
  // Esporte inexistente cai no padrão.
  assert.equal(entityTypeForSport("sport_unknown"), "atleta");
});

test("os helpers de esporte informam quem pode disputar", () => {
  assert.equal(sportAllowsClubs("sport_tennis"), false);
  assert.equal(sportAllowsAthletes("sport_tennis"), true);
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
