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

test("a estrutura contém um mundo, seis continentes e vinte países", () => {
  assert.equal(CONTINENTS.length, 6);
  assert.equal(COUNTRIES.length, 20);
  assert.ok(CONTINENTS.every(({ worldId }) => worldId === "current"));
  assert.ok(COUNTRIES.every(({ continentId }) =>
    CONTINENTS.some(({ id }) => id === continentId),
  ));
});

test("a lista de países depende do continente selecionado", () => {
  const southAmerica = countriesForContinent("continent_south_america");
  assert.deepEqual(southAmerica.map(({ code }) => code), ["BRA"]);
  assert.equal(countriesForContinent("continent_europe").length, 8);
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
