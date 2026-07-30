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
const FREC_MODALITY = "modality_motorsport_formula_regional";
const FRECME_MODALITY = "modality_motorsport_formula_regional_middle_east";

test("o catálogo de presets contém ATP, Ecossistema FIA e Atletismo de 2026", () => {
  assert.equal(CALENDAR_PRESETS.length, 3);
  assert.equal(presetById("atp-world-tour-2026")?.competitions.length, 59);
  assert.ok(presetById("world-athletics-2026"));
  assert.ok(FIA);
  assert.equal(buildPresetCompetitions(FIA).length, 24 + 14 + 10 + 8 + 4);
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

test("o ecossistema inclui a Fórmula Regional de 2026 com 8 rodadas e 30 pilotos", () => {
  const frec = buildPresetCompetitions(FIA)
    .filter(({ modalityId }) => modalityId === FREC_MODALITY);
  assert.equal(frec.length, 8);
  assert.ok(frec.every(({ competitionModel }) => competitionModel === "season_stage"));
  assert.ok(frec.every(({ scoringSystemId }) => scoringSystemId === "formula1-grand-prix"));
  assert.ok(frec.every(({ discipline }) => discipline === "Fórmula Regional Europeia"));
  assert.ok(frec.every(({ name }) => name.startsWith("Fórmula Regional Europeia —")));
  assert.equal(frec[0].startDate, "2026-04-24");
  assert.equal(frec.at(-1).endDate, "2026-09-13");
  assert.equal(frec.at(-1).seasonFinalRound, true);

  const people = buildPresetPeople(FIA, "2026-01-01T00:00:00.000Z")
    .filter(({ modalityId }) => modalityId === FREC_MODALITY);
  assert.equal(people.length, 30);
  assert.ok(people.every(({ name, teamName }) => name.endsWith(`(${teamName})`)));
});

test("o ecossistema inclui a Fórmula Regional Oriente Médio de 2026", () => {
  const frecme = buildPresetCompetitions(FIA)
    .filter(({ modalityId }) => modalityId === FRECME_MODALITY);
  assert.equal(frecme.length, 4);
  assert.ok(frecme.every(({ competitionModel }) => competitionModel === "season_stage"));
  assert.ok(frecme.every(({ discipline }) => discipline === "Fórmula Regional Oriente Médio"));
  assert.ok(frecme.every(({ slots }) => slots === 36));
  assert.equal(frecme[0].startDate, "2026-01-16");
  assert.equal(frecme.at(-1).endDate, "2026-02-12");
  assert.equal(frecme.at(-1).seasonFinalRound, true);
  // Cada etapa recebe os 36 participantes.
  assert.ok(frecme.every(({ participantIds }) => participantIds.length === 36));
});

test("pilotos homônimos viram o mesmo atleta em vez de duplicar pessoas", () => {
  const people = buildPresetPeople(FIA, "2026-01-01T00:00:00.000Z");
  // 22 F1 + 22 F2 + 30 F3 + 30 FREC-EU + 11 exclusivos do Oriente Médio.
  assert.equal(people.length, 22 + 22 + 30 + 30 + 11);
  // Nenhum ID de pessoa se repete.
  assert.equal(new Set(people.map(({ id }) => id)).size, people.length);

  const frecmeRound = buildPresetCompetitions(FIA)
    .find(({ modalityId }) => modalityId === FRECME_MODALITY);
  // Um piloto compartilhado aponta para o atleta já existente da Europeia...
  assert.ok(frecmeRound.participantIds.includes("person_frec_al-dhaheri"));
  // ...e um piloto exclusivo do Oriente Médio tem sua própria pessoa.
  assert.ok(frecmeRound.participantIds.includes("person_frecme_powell"));
  assert.ok(people.some(({ id }) => id === "person_frecme_powell"));
  assert.ok(!people.some(({ id }) => id === "person_frecme_al-dhaheri"));
});

test("todas as 60 etapas do ecossistema têm IDs estáveis e únicos", () => {
  const competitions = buildPresetCompetitions(FIA);
  assert.equal(competitions.length, 60);
  assert.equal(new Set(competitions.map(({ id }) => id)).size, 60);
  assert.ok(competitions.every(({ presetId }) => presetId === "fia-ecosystem-2026"));
});

test("o catálogo inclui a Liga Mundial de Atletismo com formato/métrica por prova", () => {
  const preset = presetById("world-athletics-2026");
  assert.ok(preset);
  const competitions = buildPresetCompetitions(preset);
  // 6 provas x 5 encontros.
  assert.equal(competitions.length, 30);
  assert.equal(new Set(competitions.map(({ id }) => id)).size, 30);
  assert.ok(competitions.every(({ sportId }) => sportId === "sport_athletics"));
  assert.ok(competitions.every(({ competitionModel }) => competitionModel === "standalone"));

  const race = competitions.find(({ modalityId }) => modalityId === "modality_athletics_100m");
  assert.equal(race.eventFormat, "heats");
  assert.equal(race.resultMetric, "direct-mark");
  assert.equal(race.markType, "time");

  const jump = competitions.find(({ modalityId }) => modalityId === "modality_athletics_long_jump");
  assert.equal(jump.eventFormat, "individual-ranking");
  assert.equal(jump.resultMetric, "direct-mark");
  assert.equal(jump.markType, "distance");

  const people = buildPresetPeople(preset, "2026-01-01T00:00:00.000Z");
  assert.equal(people.length, 48); // 6 provas x 8 atletas
  assert.ok(people.every(({ sportId }) => sportId === "sport_athletics"));
  assert.equal(people.find(({ name }) => name === "Noah Lyles").baseRating, 95);
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

test("o preset da ATP carrega o top 50 real de 2026 como elenco oficial", () => {
  const preset = presetById("atp-world-tour-2026");
  const players = buildPresetPeople(preset, "2026-01-01T00:00:00.000Z");
  assert.equal(players.length, 50);
  assert.equal(new Set(players.map(({ id }) => id)).size, 50);
  assert.ok(players.every(({ sportId }) => sportId === "sport_tennis"));
  assert.ok(players.every(
    ({ modalityId }) => modalityId === "modality_tennis_mens_singles",
  ));
  // O tênis não tem equipes: o nome não recebe sufixo entre parênteses.
  assert.ok(players.every(({ name }) => !name.includes("(")));
  assert.equal(
    players.find(({ name }) => name === "Jannik Sinner").baseRating,
    99,
  );
  // O elenco não vira participante fixo: os torneios seguem por ranking.
  const competitions = buildPresetCompetitions(preset);
  assert.ok(competitions.every(({ participantIds }) => participantIds === null));
  assert.ok(competitions.every(({ qualification }) => qualification === "ranking"));
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
