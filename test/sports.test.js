import test from "node:test";
import assert from "node:assert/strict";

import {
  MODALITIES,
  SPORTS,
  modalitiesForSport,
  teamRatingConfigForModality,
  validateSportSelection,
} from "../js/sports.js";

test("o catálogo contém Tênis, Automobilismo, Atletismo e Futebol como entidades", () => {
  assert.deepEqual(SPORTS.map(({ id, name }) => ({ id, name })), [
    { id: "sport_tennis", name: "Tênis" },
    { id: "sport_motorsport", name: "Automobilismo" },
    { id: "sport_athletics", name: "Atletismo" },
    { id: "sport_football", name: "Futebol" },
  ]);
  assert.equal(
    SPORTS.find(({ id }) => id === "sport_motorsport").defaultScoringSystemId,
    "formula1-grand-prix",
  );
  assert.equal(
    SPORTS.find(({ id }) => id === "sport_athletics").rankingModel,
    "rolling",
  );
});

test("cada esporte declara o tipo de entidade que o disputa", () => {
  assert.equal(SPORTS.find(({ id }) => id === "sport_tennis").entityType, "atleta");
  assert.equal(SPORTS.find(({ id }) => id === "sport_athletics").entityType, "atleta");
  // Automobilismo é misto: atletas e equipes convivem no mesmo campeonato.
  assert.equal(SPORTS.find(({ id }) => id === "sport_motorsport").entityType, "mista");
  // Futebol é só de equipes.
  assert.equal(SPORTS.find(({ id }) => id === "sport_football").entityType, "equipe");
});

test("o futebol traz as duas ligas nacionais como modalidades", () => {
  const football = modalitiesForSport("sport_football").map(({ name }) => name);
  assert.deepEqual(football, ["Campeonato Brasileiro Série A", "J1 League"]);
});

test("a Fórmula 1 usa rating de equipe com peso; as monopostos padrão não", () => {
  // F1: carros construídos pela equipe influenciam a etapa.
  assert.deepEqual(teamRatingConfigForModality("modality_motorsport_formula1"), {
    teamRatingModel: "weighted",
    teamWeight: 60,
  });
  // F2/F3/Regionais: chassi padrão, equipe não influencia (peso 0), mas seguem mistas.
  for (const modalityId of [
    "modality_motorsport_formula2",
    "modality_motorsport_formula3",
    "modality_motorsport_formula_regional",
    "modality_motorsport_formula_regional_middle_east",
  ]) {
    assert.deepEqual(teamRatingConfigForModality(modalityId), {
      teamRatingModel: "independent",
      teamWeight: 0,
    });
  }
  // Modalidade de atleta puro: padrão independent, peso 0.
  assert.deepEqual(teamRatingConfigForModality("modality_tennis_mens_singles"), {
    teamRatingModel: "independent",
    teamWeight: 0,
  });
});

test("o atletismo traz 24 modalidades individuais de ranking rolante", () => {
  const athletics = modalitiesForSport("sport_athletics");
  assert.equal(athletics.length, 24);
  assert.ok(athletics.every((modality) => modality.rankingModel === "rolling"));
  assert.ok(athletics.every((modality) => modality.windowMonths && modality.bestN));
});

test("lista somente as modalidades vinculadas ao esporte escolhido", () => {
  assert.deepEqual(
    modalitiesForSport("sport_tennis").map(({ name }) => name),
    ["Simples masculino"],
  );
  assert.deepEqual(modalitiesForSport("sport_unknown"), []);
  assert.deepEqual(
    modalitiesForSport("sport_motorsport").map(({ name }) => name),
    [
      "Fórmula 1",
      "Fórmula 2",
      "Fórmula 3",
      "Fórmula Regional Europeia",
      "Fórmula Regional Oriente Médio",
    ],
  );
});

test("aceita uma modalidade pertencente ao esporte", () => {
  assert.deepEqual(
    validateSportSelection({
      sportId: SPORTS[0].id,
      modalityId: MODALITIES[0].id,
    }),
    [],
  );
});

test("rejeita esporte ou modalidade inexistente", () => {
  const errors = validateSportSelection({
    sportId: "sport_unknown",
    modalityId: "modality_unknown",
  }).join(" ");
  assert.match(errors, /esporte válido/i);
  assert.match(errors, /modalidade válida/i);
});
