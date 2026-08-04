import test from "node:test";
import assert from "node:assert/strict";

import {
  CONTINENTS,
  COUNTRIES,
  countriesForContinent,
  geographicScopeLabel,
  matchesGeographicScope,
  validateGeographicScope,
} from "../js/geography.js";

test("a estrutura contém um mundo, seis continentes e o catálogo de países", () => {
  assert.equal(CONTINENTS.length, 6);
  // Catálogo mundial completo, com todos os continentes representados.
  assert.ok(COUNTRIES.length >= 200);
  assert.ok(CONTINENTS.every(({ worldId }) => worldId === "current"));
  assert.ok(COUNTRIES.every(({ id, code, continentId }) =>
    id && code && CONTINENTS.some(({ id: continent }) => continent === continentId),
  ));
  // Códigos únicos e id derivado do código.
  const codes = COUNTRIES.map(({ code }) => code);
  assert.equal(new Set(codes).size, codes.length);
  assert.equal(COUNTRIES.find(({ code }) => code === "BRA").id, "country_bra");
});

test("a lista de países depende do continente selecionado", () => {
  const southAmerica = countriesForContinent("continent_south_america").map(({ code }) => code);
  assert.ok(southAmerica.includes("BRA"));
  // Cada continente tem países e todos pertencem a ele.
  for (const { id } of CONTINENTS) {
    const list = countriesForContinent(id);
    assert.ok(list.length > 0);
    assert.ok(list.every((country) => country.continentId === id));
  }
});

test("a barreira geográfica reconhece mundo, continente e país", () => {
  const athlete = {
    continentId: "continent_south_america",
    countryId: "country_bra",
  };
  assert.equal(matchesGeographicScope(athlete, { geographicScope: "world" }), true);
  assert.equal(matchesGeographicScope(athlete, {
    geographicScope: "continental",
    continentId: "continent_europe",
  }), false);
  assert.equal(matchesGeographicScope(athlete, {
    geographicScope: "national",
    countryId: "country_bra",
  }), true);
});

test("valida e descreve uma abrangência nacional", () => {
  const scope = {
    geographicScope: "national",
    continentId: "continent_south_america",
    countryId: "country_bra",
  };
  assert.deepEqual(validateGeographicScope(scope), []);
  assert.equal(geographicScopeLabel(scope), "Nacional · Brasil");
});
