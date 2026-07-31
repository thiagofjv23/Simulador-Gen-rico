import test from "node:test";
import assert from "node:assert/strict";

import {
  EDITOR_TYPES,
  templateFor,
  serializeModule,
  validateCountry,
  normalizeCountry,
  validateRoster,
  normalizeRoster,
  validatePresetPackage,
} from "../js/editors.js";
import { buildPresetCompetitions } from "../js/presets.js";

test("há quatro editores e cada um tem modelo .js", () => {
  assert.deepEqual(EDITOR_TYPES.map((t) => t.id), ["country", "preset", "league", "roster"]);
  for (const type of EDITOR_TYPES) {
    assert.match(templateFor(type.id), /export default/);
  }
});

test("validateCountry aceita país válido e rejeita inválidos", () => {
  assert.deepEqual(validateCountry({ code: "POR", name: "Portugal", continentId: "continent_europe" }), []);
  const errors = validateCountry({ code: "pt", name: "", continentId: "continent_x" }).join(" ");
  assert.match(errors, /3 letras/);
  assert.match(errors, /nome/);
  assert.match(errors, /continentId/);
});

test("normalizeCountry gera o registro no formato da geografia", () => {
  const country = normalizeCountry({ code: "POR", name: "Portugal", continentId: "continent_europe" });
  assert.equal(country.id, "country_por");
  assert.equal(country.code, "POR");
  assert.equal(country.continentId, "continent_europe");
  assert.equal(country.worldId, "current");
});

test("validateRoster e normalizeRoster criam atletas e clubes", () => {
  const athleteData = {
    target: "athlete", sportId: "sport_tennis", modalityId: "modality_tennis_mens_singles",
    entries: [{ name: "Fulano Silva", countryCode: "BRA", age: 22, baseRating: 80, momentum: 1 }],
  };
  assert.deepEqual(validateRoster(athleteData), []);
  const { people, clubs } = normalizeRoster(athleteData);
  assert.equal(people.length, 1);
  assert.equal(clubs.length, 0);
  assert.equal(people[0].sportId, "sport_tennis");
  assert.equal(people[0].countryId, "country_bra"); // geografia hidratada
  assert.equal(people[0].rosterType, "user");

  const clubData = {
    target: "club", sportId: "sport_football", modalityId: "modality_football_brasileirao",
    entries: [{ name: "Meu Clube", countryCode: "BRA", baseRating: 75 }],
  };
  const normalized = normalizeRoster(clubData);
  assert.equal(normalized.clubs.length, 1);
  assert.equal(normalized.clubs[0].isClub, true);
  assert.equal(normalized.clubs[0].entityType, "equipe");
});

test("validateRoster rejeita dados incompletos", () => {
  const errors = validateRoster({ target: "x", entries: [{ name: "", baseRating: 200 }] }).join(" ");
  assert.match(errors, /target/);
  assert.match(errors, /sportId/);
  assert.match(errors, /baseRating/);
});

test("validatePresetPackage valida um preset por ranking simples", () => {
  const pkg = {
    sports: [{ id: "sport_x", name: "X", entityType: "atleta", rankingModel: "cumulative" }],
    modalities: [{ id: "mod_x", sportId: "sport_x", name: "Principal" }],
    preset: {
      id: "user-x", name: "Preset X", sportId: "sport_x", modalityId: "mod_x",
      sportName: "X", modalityName: "Principal", scoringSystemId: "generic-proportional",
      competitionModel: "standalone", athletes: [],
      competitions: [["e1", "Etapa 1", "2026-03-01", "2026-03-03", "Cidade", "Local", "Padrão"]],
    },
  };
  assert.deepEqual(validatePresetPackage(pkg, buildPresetCompetitions), []);
});

test("validatePresetPackage aponta erros estruturais", () => {
  const errors = validatePresetPackage(
    { sports: [{ id: "s", name: "S", entityType: "errado" }], preset: { name: "" } },
    buildPresetCompetitions,
  ).join(" ");
  assert.match(errors, /id/);
  assert.match(errors, /nome/);
  assert.match(errors, /entityType/);
});

test("serializeModule gera um módulo .js reproduzível", () => {
  const text = serializeModule({ code: "POR" }, "cabeçalho");
  assert.match(text, /^\/\/ cabeçalho/);
  assert.match(text, /export default/);
  assert.match(text, /"code": "POR"/);
});
