import test from "node:test";
import assert from "node:assert/strict";

import {
  buildInitialRanking,
  buildScopedRanking,
  combineRanking,
  createInitialPeople,
  assignGenericPeopleToSport,
  rankingForSport,
  rankingIdFor,
  resetSeasonalEntriesForYear,
  rankingStats,
} from "../js/ranking.js";

const timestamp = "2028-01-01T00:00:00.000Z";

test("cria exatamente 100 pessoas com IDs permanentes e únicos", () => {
  const people = createInitialPeople(timestamp);
  assert.equal(people.length, 100);
  assert.equal(new Set(people.map(({ id }) => id)).size, 100);
  assert.equal(new Set(people.map(({ name }) => name)).size, 100);
  assert.ok(people.every(({ sportId, modalityId }) => !sportId && !modalityId));
});

test("os atletas genéricos recebem somente o primeiro esporte carregado", () => {
  const people = createInitialPeople(timestamp);
  const tennisPeople = assignGenericPeopleToSport(people, {
    sportId: "sport_tennis",
    modalityId: "modality_tennis_mens_singles",
    updatedAt: timestamp,
  });
  const unchanged = assignGenericPeopleToSport(tennisPeople, {
    sportId: "sport_motorsport",
    modalityId: "modality_motorsport_formula1",
    updatedAt: timestamp,
  });
  assert.ok(unchanged.every(({ sportId }) => sportId === "sport_tennis"));
});

test("cada esporte e modalidade possui um ranking independente", () => {
  const people = assignGenericPeopleToSport(createInitialPeople(timestamp), {
    sportId: "sport_tennis",
    modalityId: "modality_tennis_mens_singles",
    updatedAt: timestamp,
  });
  const rankingId = rankingIdFor(
    "sport_tennis",
    "modality_tennis_mens_singles",
  );
  const entries = buildInitialRanking(people, timestamp, {
    rankingId,
    sportId: "sport_tennis",
    modalityId: "modality_tennis_mens_singles",
  });
  const ranking = combineRanking(people, entries);
  assert.equal(rankingForSport(ranking, {
    sportId: "sport_tennis",
    modalityId: "modality_tennis_mens_singles",
  }).length, 100);
  assert.equal(rankingForSport(ranking, {
    sportId: "sport_motorsport",
    modalityId: "modality_motorsport_formula1",
  }).length, 0);
});

test("um ranking sazonal zera ao começar um novo ano", () => {
  const entries = [{
    id: "ranking_f1_driver",
    rankingId: "ranking_f1",
    personId: "driver",
    position: 1,
    previousPosition: 1,
    points: 312,
    eventsCount: 24,
    rankingModel: "seasonal",
    seasonYear: 2026,
  }];
  const reset = resetSeasonalEntriesForYear(entries, 2027);
  assert.equal(reset[0].points, 0);
  assert.equal(reset[0].eventsCount, 0);
  assert.equal(reset[0].seasonYear, 2027);
});

test("gera um ranking completo, ordenado e sem posições repetidas", () => {
  const people = createInitialPeople(timestamp);
  const entries = buildInitialRanking(people, timestamp);

  assert.equal(entries.length, 100);
  assert.deepEqual(entries.map(({ position }) => position), Array.from({ length: 100 }, (_, i) => i + 1));
  assert.ok(entries.every((entry, index) => index === 0 || entries[index - 1].points >= entry.points));
});

test("a geração inicial é determinística", () => {
  const first = buildInitialRanking(createInitialPeople(timestamp), timestamp);
  const second = buildInitialRanking(createInitialPeople(timestamp), timestamp);
  assert.deepEqual(first, second);
});

test("combina ranking e pessoas sem duplicar dados persistidos", () => {
  const people = createInitialPeople(timestamp);
  const entries = buildInitialRanking(people, timestamp);
  const ranking = combineRanking(people, entries);
  const stats = rankingStats(ranking);

  assert.equal(ranking.length, 100);
  assert.equal(ranking[0].position, 1);
  assert.equal(stats.total, 100);
  assert.equal(stats.countries, 20);
  assert.equal(stats.leader, ranking[0].person.name);
});

test("cada pessoa pertence a um país e ao continente desse país", () => {
  const people = createInitialPeople(timestamp);
  assert.ok(people.every(({ countryId, continentId }) => countryId && continentId));
  assert.equal(people.find(({ countryCode }) => countryCode === "BRA").continentId, "continent_south_america");
});

test("gera rankings continental e nacional com posições locais consecutivas", () => {
  const people = createInitialPeople(timestamp);
  const ranking = combineRanking(people, buildInitialRanking(people, timestamp));
  const europe = buildScopedRanking(ranking, {
    geographicScope: "continental",
    continentId: "continent_europe",
  });
  const brazil = buildScopedRanking(ranking, {
    geographicScope: "national",
    continentId: "continent_south_america",
    countryId: "country_bra",
  });

  assert.equal(europe.length, 40);
  assert.deepEqual(europe.map(({ position }) => position), Array.from({ length: 40 }, (_, i) => i + 1));
  assert.equal(brazil.length, 5);
  assert.ok(brazil.every(({ person }) => person.countryCode === "BRA"));
});
