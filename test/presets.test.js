import test from "node:test";
import assert from "node:assert/strict";

import {
  CALENDAR_PRESETS,
  buildPresetCompetitions,
  buildPresetPeople,
  presetById,
} from "../js/presets.js";

const FIA = presetById("fia-ecosystem-2026");
const F1_MODALITY = "modality_motorsport_formula1";
const F2_MODALITY = "modality_motorsport_formula2";
const F3_MODALITY = "modality_motorsport_formula3";

test("o catálogo de presets contém ATP e o Ecossistema FIA de 2026", () => {
  assert.equal(CALENDAR_PRESETS.length, 2);
  assert.equal(presetById("atp-world-tour-2026")?.competitions.length, 59);
  assert.ok(FIA);
  assert.equal(buildPresetCompetitions(FIA).length, 24 + 14 + 10);
});

test("a Fórmula 1 do ecossistema cria 24 etapas anuais de três dias", () => {
  const competitions = buildPresetCompetitions(FIA)
    .filter(({ modalityId }) => modalityId === F1_MODALITY);
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

test("o ecossistema carrega os 22 pilotos de F1 com a equipe ao lado do nome", () => {
  const people = buildPresetPeople(FIA, "2026-01-01T00:00:00.000Z")
    .filter(({ modalityId }) => modalityId === F1_MODALITY);
  assert.equal(people.length, 22);
  assert.equal(new Set(people.map(({ id }) => id)).size, 22);
  assert.ok(people.every(({ name, teamName }) => name.endsWith(`(${teamName})`)));
  assert.equal(
    people.find(({ driverName }) => driverName === "Max Verstappen").baseRating,
    99,
  );
});

test("o ecossistema inclui F2 e F3 com etapas e pilotos de 2026", () => {
  const competitions = buildPresetCompetitions(FIA);
  const f2 = competitions.filter(({ modalityId }) => modalityId === F2_MODALITY);
  const f3 = competitions.filter(({ modalityId }) => modalityId === F3_MODALITY);

  assert.equal(f2.length, 14);
  assert.equal(f3.length, 10);
  assert.ok([...f2, ...f3].every(
    ({ competitionModel }) => competitionModel === "season_stage",
  ));
  assert.ok([...f2, ...f3].every(
    ({ scoringSystemId }) => scoringSystemId === "formula1-grand-prix",
  ));
  assert.ok(f2.every(({ sport, discipline }) =>
    sport === "Automobilismo" && discipline === "Fórmula 2"));
  assert.ok(f3.every(({ sport, discipline }) =>
    sport === "Automobilismo" && discipline === "Fórmula 3"));
  assert.equal(f2.at(-1).seasonFinalRound, true);
  assert.equal(f3.at(-1).seasonFinalRound, true);
  // As etapas de apoio reaproveitam janelas de três dias da Fórmula 1.
  assert.equal(f2[0].startDate, "2026-03-06");
  assert.equal(f3.at(-1).endDate, "2026-09-06");

  const people = buildPresetPeople(FIA, "2026-01-01T00:00:00.000Z");
  assert.equal(people.filter(({ modalityId }) => modalityId === F2_MODALITY).length, 22);
  assert.equal(people.filter(({ modalityId }) => modalityId === F3_MODALITY).length, 30);
  assert.ok(people.every(({ name, teamName }) => name.endsWith(`(${teamName})`)));
});

test("todas as 48 etapas do ecossistema têm IDs estáveis e únicos", () => {
  const competitions = buildPresetCompetitions(FIA);
  assert.equal(competitions.length, 48);
  assert.equal(new Set(competitions.map(({ id }) => id)).size, 48);
  assert.ok(competitions.every(({ presetId }) => presetId === "fia-ecosystem-2026"));
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
