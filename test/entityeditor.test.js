import test from "node:test";
import assert from "node:assert/strict";

import {
  MIN_RATING,
  MAX_RATING,
  validateEntityName,
  validateEntityRating,
  applyEntityEdits,
} from "../js/entityeditor.js";

test("validateEntityName exige nome não vazio e até 60 caracteres", () => {
  assert.equal(validateEntityName("Ferrari"), null);
  assert.match(validateEntityName("   "), /informe/i);
  assert.match(validateEntityName("x".repeat(61)), /60/);
});

test("validateEntityRating aceita só inteiros de 1 a 99", () => {
  assert.equal(validateEntityRating(50), null);
  assert.equal(validateEntityRating(MIN_RATING), null);
  assert.equal(validateEntityRating(MAX_RATING), null);
  assert.match(validateEntityRating(0), /inteiro/i);
  assert.match(validateEntityRating(100), /inteiro/i);
  assert.match(validateEntityRating(50.5), /inteiro/i);
  assert.match(validateEntityRating("abc"), /inteiro/i);
});

const entities = [
  { id: "a", name: "Alfa", baseRating: 70, updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: "b", name: "Beta", baseRating: 80, updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: "c", name: "Gama", baseRating: 60, updatedAt: "2026-01-01T00:00:00.000Z" },
];

test("applyEntityEdits altera nome e rating em lote, só o que mudou", () => {
  const { updated, errors } = applyEntityEdits(entities, [
    { id: "a", name: "Alfa Racing", rating: 75 }, // muda os dois
    { id: "b", name: "Beta", rating: 80 }, // sem mudança → ignorado
    { id: "c", name: "  Gama  ", rating: 61 }, // muda rating; nome aparado igual
  ], { timestamp: "2026-08-03T00:00:00.000Z" });

  assert.equal(errors.length, 0);
  assert.deepEqual(updated.map((e) => e.id).sort(), ["a", "c"]);
  const a = updated.find((e) => e.id === "a");
  assert.equal(a.name, "Alfa Racing");
  assert.equal(a.baseRating, 75);
  assert.equal(a.updatedAt, "2026-08-03T00:00:00.000Z");
});

test("applyEntityEdits reporta erros de nome/rating e ignora ids inexistentes", () => {
  const { updated, errors } = applyEntityEdits(entities, [
    { id: "a", name: "", rating: 75 },
    { id: "b", name: "Beta", rating: 200 },
    { id: "z", name: "Zeta", rating: 50 }, // id inexistente → ignorado
  ]);
  assert.equal(updated.length, 0);
  assert.deepEqual(errors.map((e) => e.id).sort(), ["a", "b"]);
});
