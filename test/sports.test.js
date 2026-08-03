import test from "node:test";
import assert from "node:assert/strict";

import {
  MODALITIES,
  SPORTS,
  modalitiesForSport,
  teamRatingConfigForModality,
  validateSportSelection,
} from "../js/sports.js";

test("o catálogo oficial tem 37 esportes com ids únicos", () => {
  assert.equal(SPORTS.length, 37);
  assert.equal(new Set(SPORTS.map(({ id }) => id)).size, 37);
  // Esportes com dados/presets atuais.
  assert.equal(SPORTS.find(({ id }) => id === "sport_tennis").name, "Tênis");
  assert.equal(SPORTS.find(({ id }) => id === "sport_athletics").name, "Atletismo");
  assert.equal(SPORTS.find(({ id }) => id === "sport_football").name, "Futebol");
  assert.equal(SPORTS.find(({ id }) => id === "sport_motorsport").name, "Automobilismo");
  // Alguns dos demais esportes.
  assert.ok(SPORTS.some(({ id }) => id === "sport_basketball"));
  assert.ok(SPORTS.some(({ id }) => id === "sport_volleyball"));
  assert.equal(
    SPORTS.find(({ id }) => id === "sport_athletics").rankingModel,
    "rolling",
  );
});

test("cada esporte declara um entityType válido", () => {
  assert.ok(SPORTS.every(({ entityType }) => ["atleta", "equipe", "mista"].includes(entityType)));
  // Tênis e atletismo são de atleta; futebol e basquete de equipe; automobilismo
  // permanece misto (mista fica para uma etapa posterior nos demais esportes).
  assert.equal(SPORTS.find(({ id }) => id === "sport_tennis").entityType, "atleta");
  assert.equal(SPORTS.find(({ id }) => id === "sport_athletics").entityType, "atleta");
  assert.equal(SPORTS.find(({ id }) => id === "sport_football").entityType, "equipe");
  assert.equal(SPORTS.find(({ id }) => id === "sport_basketball").entityType, "equipe");
  assert.equal(SPORTS.find(({ id }) => id === "sport_motorsport").entityType, "mista");
});

test("o futebol traz as duas ligas nacionais como modalidades", () => {
  const football = modalitiesForSport("sport_football").map(({ name }) => name);
  assert.deepEqual(football, ["Campeonato Brasileiro Série A", "J1 League"]);
});

test("o automobilismo traz as cinco categorias como modalidades mistas", () => {
  const motorsport = modalitiesForSport("sport_motorsport").map(({ name }) => name);
  assert.deepEqual(motorsport, [
    "Fórmula 1",
    "Fórmula 2",
    "Fórmula 3",
    "Fórmula Regional Europeia",
    "Fórmula Regional Oriente Médio",
  ]);
});

test("a Fórmula 1 usa rating de equipe com peso; as demais categorias não", () => {
  // F1: carros construídos pela equipe influenciam a etapa.
  assert.deepEqual(teamRatingConfigForModality("modality_motorsport_formula1"), {
    teamRatingModel: "weighted",
    teamWeight: 60,
  });
  // F2/F3/Regionais: chassi padrão, equipe não influencia (peso 0).
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
  // Modalidade sem peso configurado usa o padrão independent/0.
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
  // Esportes ainda sem modalidades cadastradas devolvem lista vazia.
  assert.deepEqual(modalitiesForSport("sport_basketball"), []);
});

test("aceita uma modalidade pertencente ao esporte", () => {
  assert.deepEqual(
    validateSportSelection({
      sportId: "sport_tennis",
      modalityId: "modality_tennis_mens_singles",
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
