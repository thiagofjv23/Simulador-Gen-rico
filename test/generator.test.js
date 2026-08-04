import test from "node:test";
import assert from "node:assert/strict";

import {
  ENTITIES_PER_NATIONALITY,
  MIN_AGE,
  MAX_AGE,
  createRng,
  generateModalityRatings,
  generateModalityEntities,
  generateModalityBatch,
  generateSelectionEntities,
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

test("cada entidade fica atrelada a um tipo de evento, distribuído pela modalidade", () => {
  // Atletismo tem muitos tipos de evento: as 20 por país são distribuídas.
  const athletics = generateModalityEntities({
    sport: sportById("sport_athletics"),
    modality: catalogModalityById("modality_athletics"),
    countries,
    nameGen,
    rng: createRng(4),
  });
  assert.ok(athletics.people.every((p) => p.eventTypeId), "todo atleta tem eventTypeId");
  const events = new Set(athletics.people.map((p) => p.eventTypeId));
  assert.ok(events.size > 1, "os atletas se espalham por vários tipos de evento");
  // O eventTypeId pertence à modalidade do atleta.
  assert.ok(athletics.people.every((p) => p.eventTypeId.startsWith("event_athletics_")));

  // Futebol tem um único tipo de evento: todos os clubes caem nele.
  const football = generateModalityEntities({
    sport: sportById("sport_football"),
    modality: catalogModalityById("modality_football"),
    countries,
    nameGen,
    rng: createRng(5),
  });
  assert.ok(football.clubs.every((c) => c.eventTypeId === "event_football_tournament"));
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

test("generateModalityBatch gera o total e distribui pelos países por rodízio", () => {
  const sport = sportById("sport_athletics");
  const modality = catalogModalityById("modality_athletics");
  const { people, clubs } = generateModalityBatch({
    sport, modality, countries, total: 7,
    nameGen, rng: createRng(3), batchId: "b1",
  });
  // Atletismo é de atleta: 7 atletas, 0 clubes.
  assert.equal(people.length, 7);
  assert.equal(clubs.length, 0);
  // Rodízio: 3 países → 3,2,2 conforme a ordem (BRA,USA,FRA repetidos).
  const byCountry = (code) => people.filter((p) => p.countryCode === code).length;
  assert.equal(byCountry("BRA"), 3);
  assert.equal(byCountry("USA"), 2);
  assert.equal(byCountry("FRA"), 2);
});

test("generateModalityBatch: um único país recebe todas as entidades", () => {
  const sport = sportById("sport_football");
  const modality = catalogModalityById("modality_football");
  const only = [{ code: "BRA", name: "Brasil", continentId: "continent_south_america" }];
  const { people, clubs } = generateModalityBatch({
    sport, modality, countries: only, total: 4,
    nameGen, rng: createRng(5), batchId: "b1",
  });
  // Futebol é de equipe: 4 clubes, todos do Brasil.
  assert.equal(people.length, 0);
  assert.equal(clubs.length, 4);
  assert.ok(clubs.every((c) => c.countryCode === "BRA"));
});

test("generateModalityBatch: batchId diferente evita colisão de ids", () => {
  const sport = sportById("sport_athletics");
  const modality = catalogModalityById("modality_athletics");
  const args = { sport, modality, countries, total: 3, nameGen };
  const a = generateModalityBatch({ ...args, rng: createRng(1), batchId: "b1" });
  const b = generateModalityBatch({ ...args, rng: createRng(1), batchId: "b2" });
  const ids = new Set([...a.people, ...b.people].map((p) => p.id));
  assert.equal(ids.size, a.people.length + b.people.length); // sem colisões
});

test("generateModalityBatch com total 0 ou sem países não gera nada", () => {
  const sport = sportById("sport_athletics");
  const modality = catalogModalityById("modality_athletics");
  assert.deepEqual(
    generateModalityBatch({ sport, modality, countries, total: 0, nameGen, rng: createRng(1) }),
    { people: [], clubs: [] },
  );
  assert.deepEqual(
    generateModalityBatch({ sport, modality, countries: [], total: 5, nameGen, rng: createRng(1) }),
    { people: [], clubs: [] },
  );
});

test("generateSelectionEntities gera o total por modalidade do esporte", () => {
  const sport = sportById("sport_cycling");
  const modalities = catalogModalitiesForSport("sport_cycling");
  const { people } = generateSelectionEntities({
    sport, modalities, countries, total: 4,
    nameGen, rng: createRng(9), batchId: "b1",
  });
  // 4 por modalidade de ciclismo (todas de atleta).
  assert.equal(people.length, 4 * modalities.length);
});
