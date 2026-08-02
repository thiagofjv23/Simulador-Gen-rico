import test from "node:test";
import assert from "node:assert/strict";

import { SPORTS } from "../js/sports.js";
import {
  CATALOG_MODALITIES,
  EVENT_TYPES,
  validateCatalogIntegrity,
  catalogModalityById,
  eventTypeById,
  catalogModalitiesForSport,
  eventTypesForModality,
  eventTypesForSport,
  sportHasEventTypes,
  eventTypeLabel,
  entityTypeForModality,
  LEGACY_MODALITY_ALIASES,
  resolveCompetitionTaxonomy,
  validateCompetitionTaxonomy,
} from "../js/catalog.js";
import { entityTypeForSport, sportById } from "../js/sports.js";
import { ENTITY_TYPES } from "../js/clubs.js";

test("o catálogo é íntegro: ids únicos e referências coerentes", () => {
  assert.deepEqual(validateCatalogIntegrity(), []);
});

test("toda modalidade aponta para um esporte existente", () => {
  const sportIds = new Set(SPORTS.map((sport) => sport.id));
  for (const modality of CATALOG_MODALITIES) {
    assert.ok(sportIds.has(modality.sportId), `modalidade ${modality.id} sem esporte`);
  }
});

test("todo tipo de evento pertence à modalidade e ao esporte declarados", () => {
  for (const eventType of EVENT_TYPES) {
    const modality = catalogModalityById(eventType.modalityId);
    assert.ok(modality, `tipo de evento ${eventType.id} sem modalidade`);
    assert.equal(modality.sportId, eventType.sportId);
  }
});

test("detecta problemas de integridade em catálogos inválidos", () => {
  const badModalities = [{ id: "modality_x", sportId: "sport_inexistente", name: "X" }];
  const badEventTypes = [
    { id: "event_x", modalityId: "modality_x", sportId: "sport_athletics", name: "X" },
  ];
  const errors = validateCatalogIntegrity(SPORTS, badModalities, badEventTypes).join(" ");
  assert.match(errors, /esporte inexistente/i);
  assert.match(errors, /esporte diferente/i);
});

test("toda modalidade tem entityType válido e compatível com o esporte", () => {
  for (const modality of CATALOG_MODALITIES) {
    assert.ok(ENTITY_TYPES[modality.entityType], `${modality.id} sem entityType válido`);
    const sportEntity = ENTITY_TYPES[entityTypeForSport(modality.sportId)];
    if (modality.entityType === "atleta" || modality.entityType === "mista") {
      assert.ok(sportEntity.allowsAthletes, `${modality.id} exige atletas que o esporte não permite`);
    }
    if (modality.entityType === "equipe" || modality.entityType === "mista") {
      assert.ok(sportEntity.allowsClubs, `${modality.id} exige clubes que o esporte não permite`);
    }
  }
});

test("entityTypeForModality classifica atleta/equipe/mista", () => {
  assert.equal(entityTypeForModality("modality_swimming"), "atleta");
  assert.equal(entityTypeForModality("modality_water_polo"), "equipe");
  assert.equal(entityTypeForModality("modality_football"), "equipe");
  assert.equal(entityTypeForModality("modality_motorsport_open_wheel"), "mista");
  assert.equal(entityTypeForModality("inexistente"), "atleta"); // padrão seguro
});

test("integridade acusa entityType inválido ou incompatível", () => {
  const badType = validateCatalogIntegrity(
    undefined,
    [{ id: "modality_x", sportId: "sport_athletics", name: "X", entityType: "nada" }],
    [],
  ).join(" ");
  assert.match(badType, /entityType inválido/i);
  // Atletismo é só de atleta: uma modalidade "equipe" é incompatível.
  const incompat = validateCatalogIntegrity(
    undefined,
    [{ id: "modality_y", sportId: "sport_athletics", name: "Y", entityType: "equipe" }],
    [],
  ).join(" ");
  assert.match(incompat, /incompatível com o esporte/i);
});

test("lookups por esporte e por modalidade", () => {
  const aquaticsModalities = catalogModalitiesForSport("sport_aquatics");
  assert.ok(aquaticsModalities.some(({ id }) => id === "modality_swimming"));
  const swimmingEvents = eventTypesForModality("modality_swimming");
  assert.ok(swimmingEvents.some(({ id }) => id === "event_swimming_50m_freestyle"));
  assert.ok(eventTypesForSport("sport_athletics").length >= 20);
  assert.equal(eventTypeById("event_tennis_singles")?.name, "Tênis Simples");
  assert.equal(eventTypeLabel("event_tennis_singles"), "Tênis Simples");
  assert.equal(eventTypeLabel("desconhecido"), "Não informado");
});

test("automobilismo está no catálogo com Open Wheel/GT/Endurance/Rally", () => {
  assert.equal(sportHasEventTypes("sport_motorsport"), true);
  assert.equal(sportHasEventTypes("sport_tennis"), true);
  const modalities = catalogModalitiesForSport("sport_motorsport").map(({ id }) => id);
  assert.deepEqual(modalities.sort(), [
    "modality_motorsport_endurance",
    "modality_motorsport_gt",
    "modality_motorsport_open_wheel",
    "modality_motorsport_rally",
  ]);
  // Open Wheel preserva a estrutura F1/F2/F3/regional como tipos de evento.
  const openWheel = eventTypesForModality("modality_motorsport_open_wheel").map(({ id }) => id);
  assert.ok(openWheel.includes("event_motorsport_formula1"));
  assert.ok(openWheel.includes("event_motorsport_formula2"));
  assert.ok(openWheel.includes("event_motorsport_formula3"));
  assert.ok(openWheel.includes("event_motorsport_formula_regional_europe"));
  assert.ok(openWheel.includes("event_motorsport_formula_regional_middle_east"));
});

test("o mapa de compatibilidade resolve modalidades legadas", () => {
  assert.deepEqual(LEGACY_MODALITY_ALIASES.modality_tennis_mens_singles, {
    modalityId: "modality_tennis",
    eventTypeId: "event_tennis_singles",
  });
  assert.deepEqual(LEGACY_MODALITY_ALIASES.modality_athletics_100m, {
    modalityId: "modality_athletics",
    eventTypeId: "event_athletics_100m",
  });
  // As duas ligas de futebol caem no mesmo tipo de evento (torneio).
  assert.equal(
    LEGACY_MODALITY_ALIASES.modality_football_brasileirao.eventTypeId,
    "event_football_tournament",
  );
  assert.equal(
    LEGACY_MODALITY_ALIASES.modality_football_jleague.eventTypeId,
    "event_football_tournament",
  );
});

test("resolveCompetitionTaxonomy usa eventType explícito quando presente", () => {
  const resolved = resolveCompetitionTaxonomy({
    sportId: "sport_aquatics",
    modalityId: "modality_swimming",
    eventTypeId: "event_swimming_100m_freestyle",
  });
  assert.deepEqual(resolved, {
    sportId: "sport_aquatics",
    modalityId: "modality_swimming",
    eventTypeId: "event_swimming_100m_freestyle",
    resolved: true,
  });
});

test("resolveCompetitionTaxonomy cai no mapa legado quando falta eventType", () => {
  const resolved = resolveCompetitionTaxonomy({
    sportId: "sport_athletics",
    modalityId: "modality_athletics_800m",
  });
  assert.equal(resolved.modalityId, "modality_athletics");
  assert.equal(resolved.eventTypeId, "event_athletics_800m");
  assert.equal(resolved.resolved, true);
});

test("validateCompetitionTaxonomy aceita competição legada mapeável", () => {
  assert.deepEqual(
    validateCompetitionTaxonomy({
      sportId: "sport_tennis",
      modalityId: "modality_tennis_mens_singles",
    }),
    [],
  );
});

test("automobilismo legado resolve via Open Wheel (F1/F2/F3/regional)", () => {
  const resolved = resolveCompetitionTaxonomy({
    sportId: "sport_motorsport",
    modalityId: "modality_motorsport_formula1",
  });
  assert.equal(resolved.modalityId, "modality_motorsport_open_wheel");
  assert.equal(resolved.eventTypeId, "event_motorsport_formula1");
  assert.deepEqual(
    validateCompetitionTaxonomy({
      sportId: "sport_motorsport",
      modalityId: "modality_motorsport_formula1",
    }),
    [],
  );
});

test("validateCompetitionTaxonomy exige tipo de evento em esporte do catálogo", () => {
  const errors = validateCompetitionTaxonomy({
    sportId: "sport_tennis",
    modalityId: "modality_desconhecida",
  }).join(" ");
  assert.match(errors, /tipo de evento/i);
});

test("validateCompetitionTaxonomy rejeita tipo de evento de outra modalidade", () => {
  const errors = validateCompetitionTaxonomy({
    sportId: "sport_aquatics",
    modalityId: "modality_diving",
    eventTypeId: "event_swimming_50m_freestyle",
  }).join(" ");
  assert.match(errors, /não pertence à modalidade/i);
});
