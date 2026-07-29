import test from "node:test";
import assert from "node:assert/strict";

import {
  MODALITIES,
  SPORTS,
  modalitiesForSport,
  validateSportSelection,
} from "../js/sports.js";

test("o catálogo contém Tênis e Automobilismo como entidades", () => {
  assert.deepEqual(SPORTS.map(({ id, name }) => ({ id, name })), [
    { id: "sport_tennis", name: "Tênis" },
    { id: "sport_motorsport", name: "Automobilismo" },
  ]);
  assert.equal(
    SPORTS.find(({ id }) => id === "sport_motorsport").defaultScoringSystemId,
    "formula1-grand-prix",
  );
});

test("lista somente as modalidades vinculadas ao esporte escolhido", () => {
  assert.deepEqual(
    modalitiesForSport("sport_tennis").map(({ name }) => name),
    ["Simples masculino"],
  );
  assert.deepEqual(modalitiesForSport("sport_unknown"), []);
  assert.deepEqual(
    modalitiesForSport("sport_motorsport").map(({ name }) => name),
    ["Fórmula 1", "Fórmula 2", "Fórmula 3"],
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
