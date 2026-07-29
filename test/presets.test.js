import test from "node:test";
import assert from "node:assert/strict";

import {
  CALENDAR_PRESETS,
  buildPresetCompetitions,
  buildPresetPeople,
  presetById,
} from "../js/presets.js";

test("o catálogo de presets contém ATP e Fórmula 1 de 2026", () => {
  assert.equal(CALENDAR_PRESETS.length, 2);
  assert.equal(presetById("atp-world-tour-2026")?.competitions.length, 59);
  assert.equal(presetById("formula1-2026")?.competitions.length, 24);
});

test("o preset da Fórmula 1 cria 24 etapas anuais de três dias", () => {
  const preset = presetById("formula1-2026");
  const competitions = buildPresetCompetitions(preset);
  assert.equal(competitions.length, 24);
  assert.ok(competitions.every(({ recurrence }) => recurrence === "yearly"));
  assert.ok(competitions.every(
    ({ scoringSystemId }) => scoringSystemId === "formula1-grand-prix",
  ));
  assert.ok(competitions.every(
    ({ competitionModel }) => competitionModel === "season_stage",
  ));
  assert.deepEqual(
    competitions.map(({ startDate, endDate }) => [
      new Date(`${startDate}T12:00:00Z`),
      new Date(`${endDate}T12:00:00Z`),
    ]).map(([start, end]) => (end - start) / 86400000 + 1),
    Array(24).fill(3),
  );
  assert.equal(competitions[0].startDate, "2026-03-06");
  assert.equal(competitions.at(-1).endDate, "2026-12-06");
  assert.equal(competitions.at(-1).seasonFinalRound, true);
});

test("o preset carrega os 22 pilotos oficiais com a equipe ao lado do nome", () => {
  const preset = presetById("formula1-2026");
  const people = buildPresetPeople(preset, "2026-01-01T00:00:00.000Z");
  assert.equal(people.length, 22);
  assert.equal(new Set(people.map(({ id }) => id)).size, 22);
  assert.ok(people.every(({ name, teamName }) => name.endsWith(`(${teamName})`)));
  assert.equal(
    people.find(({ driverName }) => driverName === "Max Verstappen").baseRating,
    99,
  );
});

test("converte o preset em competições mundiais de tênis com IDs estáveis", () => {
  const timestamp = "2026-01-01T00:00:00.000Z";
  const competitions = buildPresetCompetitions(CALENDAR_PRESETS[0], timestamp);
  assert.equal(competitions.length, 59);
  assert.equal(new Set(competitions.map(({ id }) => id)).size, 59);
  assert.ok(competitions.every(({ sportId }) => sportId === "sport_tennis"));
  assert.ok(
    competitions.every(
      ({ modalityId }) => modalityId === "modality_tennis_mens_singles",
    ),
  );
  assert.ok(competitions.every(({ geographicScope }) => geographicScope === "world"));
  assert.ok(competitions.every(({ qualification }) => qualification !== "open"));
});

test("preserva datas e categorias essenciais do calendário de 2026", () => {
  const competitions = buildPresetCompetitions(CALENDAR_PRESETS[0]);
  const australianOpen = competitions.find(({ name }) => name === "Australian Open");
  const wimbledon = competitions.find(({ name }) => name.includes("Wimbledon"));
  const atpFinals = competitions.find(({ name }) => name === "Nitto ATP Finals");

  assert.equal(australianOpen.startDate, "2026-01-18");
  assert.equal(australianOpen.rankingPoints, 2000);
  assert.equal(wimbledon.endDate, "2026-07-12");
  assert.equal(atpFinals.slots, 8);
  assert.equal(atpFinals.endDate, "2026-11-22");
});
