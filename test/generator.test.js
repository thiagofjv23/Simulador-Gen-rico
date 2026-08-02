import test from "node:test";
import assert from "node:assert/strict";

import {
  ENTITIES_PER_NATIONALITY,
  MIN_AGE,
  MAX_AGE,
  createRng,
  generateModalityRatings,
  generateModalityEntities,
  generateEntities,
} from "../js/generator.js";
import { catalogModalityById, catalogModalitiesForSport } from "../js/catalog.js";
import { sportById } from "../js/sports.js";

const nameGen = {
  personName: (code) => `Atleta ${code}`,
  clubName: (code) => `Clube ${code}`,
};
const countries = [
  { code: "BRA", name: "Brasil", continentId: "continent_south_america" },
  { code: "USA", name: "Estados Unidos", continentId: "continent_north_america" },
  { code: "FRA", name: "França", continentId: "continent_europe" },
];

test("generateModalityRatings segue a curva: olímpico não-elite, cauda até 95, 1–2 a 98–99", () => {
  const rng = createRng(7);
  const ratings = generateModalityRatings(4120, rng);
  assert.equal(ratings.length, 4120);
  assert.ok(ratings.every((r) => r >= 40 && r <= 99));
  const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  assert.ok(mean > 72 && mean < 80, `média fora do esperado: ${mean}`);
  const elite = ratings.filter((r) => r >= 98).length;
  assert.ok(elite >= 1 && elite <= 2, `esperado 1–2 a 98–99, veio ${elite}`);
  assert.ok(ratings.some((r) => r >= 95), "esperava alguns chegando a 95");
  // A maioria não é elite (abaixo de 90).
  assert.ok(ratings.filter((r) => r < 90).length / ratings.length > 0.9);
});

test("modalidade de atleta gera só atletas, 20 por nacionalidade", () => {
  const { people, clubs } = generateModalityEntities({
    sport: sportById("sport_athletics"),
    modality: catalogModalityById("modality_athletics"),
    countries,
    nameGen,
    rng: createRng(1),
  });
  assert.equal(clubs.length, 0);
  assert.equal(people.length, countries.length * ENTITIES_PER_NATIONALITY);
  const p = people[0];
  assert.equal(p.sportId, "sport_athletics");
  assert.equal(p.modalityId, "modality_athletics");
  assert.equal(p.rosterType, "generated");
  assert.ok(p.age >= MIN_AGE && p.age <= MAX_AGE);
  assert.equal(p.countryId, "country_bra"); // geografia hidratada
  assert.match(p.name, /^Atleta /);
  // 20 por nacionalidade.
  assert.equal(people.filter((x) => x.countryCode === "USA").length, ENTITIES_PER_NATIONALITY);
});

test("modalidade de equipe gera só clubes", () => {
  const { people, clubs } = generateModalityEntities({
    sport: sportById("sport_football"),
    modality: catalogModalityById("modality_football"),
    countries,
    nameGen,
    rng: createRng(2),
  });
  assert.equal(people.length, 0);
  assert.equal(clubs.length, countries.length * ENTITIES_PER_NATIONALITY);
  assert.equal(clubs[0].isClub, true);
  assert.equal(clubs[0].entityType, "equipe");
  assert.equal(clubs[0].rosterType, "generated");
  assert.match(clubs[0].name, /^Clube /);
});

test("modalidade mista gera atletas e clubes", () => {
  const { people, clubs } = generateModalityEntities({
    sport: sportById("sport_motorsport"),
    modality: catalogModalityById("modality_motorsport_open_wheel"),
    countries,
    nameGen,
    rng: createRng(3),
  });
  assert.equal(people.length, countries.length * ENTITIES_PER_NATIONALITY);
  assert.equal(clubs.length, countries.length * ENTITIES_PER_NATIONALITY);
});

test("generateEntities agrega vários esportes e é determinístico por seed", () => {
  const args = {
    sports: [sportById("sport_athletics"), sportById("sport_football")],
    modalitiesForSport: (sportId) => catalogModalitiesForSport(sportId),
    countries,
    nameGen,
  };
  const a = generateEntities({ ...args, rng: createRng(99) });
  const b = generateEntities({ ...args, rng: createRng(99) });
  assert.equal(a.people.length, countries.length * ENTITIES_PER_NATIONALITY); // atletismo: 1 modalidade de atleta
  assert.equal(a.clubs.length, countries.length * ENTITIES_PER_NATIONALITY); // futebol: 1 modalidade de equipe
  // Mesmo seed → mesmos ratings e nomes.
  assert.deepEqual(a.people.map((p) => p.baseRating), b.people.map((p) => p.baseRating));
  assert.deepEqual(a.clubs.map((c) => c.id), b.clubs.map((c) => c.id));
});

test("ids gerados são únicos", () => {
  const { people, clubs } = generateEntities({
    sports: [sportById("sport_athletics"), sportById("sport_football")],
    modalitiesForSport: (sportId) => catalogModalitiesForSport(sportId),
    countries,
    nameGen,
    rng: createRng(5),
  });
  const ids = [...people, ...clubs].map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
});
