import test from "node:test";
import assert from "node:assert/strict";

import {
  NAME_LANGUAGE_GROUPS,
  languageGroupForCountry,
  createNameGenerator,
} from "../js/names.js";

// Provedor faker de mentira: cada grupo devolve nomes previsíveis marcados com o
// próprio grupo, para os testes verificarem a lógica sem a biblioteca real.
function stubFakerByGroup() {
  const make = (group) => ({
    person: { firstName: () => `First_${group}`, lastName: () => `Last_${group}` },
    location: { city: () => `City_${group}` },
    number: { int: ({ min }) => min }, // determinístico: sempre usa prefixo
    helpers: { arrayElement: (arr) => arr[0] },
    seed() {},
  });
  return Object.fromEntries(NAME_LANGUAGE_GROUPS.map((group) => [group, make(group)]));
}

test("languageGroupForCountry agrupa por idioma e cai em inglês por padrão", () => {
  assert.equal(languageGroupForCountry("BRA"), "pt");
  assert.equal(languageGroupForCountry("POR"), "pt");
  assert.equal(languageGroupForCountry("FRA"), "fr");
  assert.equal(languageGroupForCountry("RUS"), "ru");
  assert.equal(languageGroupForCountry("JPN"), "ja");
  assert.equal(languageGroupForCountry("EGY"), "ar");
  assert.equal(languageGroupForCountry("USA"), "en");
  assert.equal(languageGroupForCountry("GBR"), "en");
  // País sem idioma coberto pela biblioteca → inglês.
  assert.equal(languageGroupForCountry("GRE"), "en");
  assert.equal(languageGroupForCountry("HUN"), "en");
  assert.equal(languageGroupForCountry(undefined), "en");
});

test("createNameGenerator usa o faker do grupo do país", () => {
  const gen = createNameGenerator(stubFakerByGroup());
  assert.equal(gen.personName("BRA"), "First_pt Last_pt");
  assert.equal(gen.personName("FRA"), "First_fr Last_fr");
  assert.equal(gen.personName("USA"), "First_en Last_en");
  // País não mapeado usa o grupo inglês.
  assert.equal(gen.personName("GRE"), "First_en Last_en");
});

test("clubName combina cidade do país com denominação esportiva", () => {
  const gen = createNameGenerator(stubFakerByGroup());
  // O stub força prefixo (number.int devolve o mínimo = 0) e arrayElement[0] = "AC".
  assert.equal(gen.clubName("BRA"), "AC City_pt");
  assert.equal(gen.clubName("JPN"), "AC City_ja");
});

test("todos os grupos de idioma têm países mapeados", () => {
  const used = new Set();
  const codes = ["BRA", "ESP", "FRA", "GER", "ITA", "RUS", "EGY", "JPN", "CHN", "KOR",
    "NED", "POL", "TUR", "SWE", "IRI", "USA"];
  for (const code of codes) used.add(languageGroupForCountry(code));
  for (const group of NAME_LANGUAGE_GROUPS) {
    assert.ok(used.has(group), `grupo ${group} sem país de exemplo`);
  }
});
