import test from "node:test";
import assert from "node:assert/strict";

import {
  CALENDAR_PRESETS,
  buildPresetClubs,
  buildPresetCompetitions,
  buildPresetPeople,
  presetById,
} from "../js/presets.js";

test("o catálogo de presets contém ATP, Atletismo e Futebol", () => {
  assert.equal(CALENDAR_PRESETS.length, 3);
  assert.deepEqual(CALENDAR_PRESETS.map(({ id }) => id), [
    "atp-world-tour-2026",
    "world-athletics-2026",
    "football-leagues-2026",
  ]);
  assert.equal(presetById("atp-world-tour-2026")?.competitions.length, 59);
  // O Ecossistema FIA (automobilismo) saiu do catálogo.
  assert.equal(presetById("fia-ecosystem-2026"), null);
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

test("presets sem equipe no nome dos atletas não geram clubes", () => {
  // O tênis passou a ser misto, mas os atletas da ATP não trazem equipe no
  // nome, então nenhum clube é derivado.
  const atp = presetById("atp-world-tour-2026");
  const atpPeople = buildPresetPeople(atp, "2026-01-01T00:00:00.000Z");
  assert.deepEqual(buildPresetClubs(atp, atpPeople), []);

  const athletics = presetById("world-athletics-2026");
  const athPeople = buildPresetPeople(athletics, "2026-01-01T00:00:00.000Z");
  assert.deepEqual(buildPresetClubs(athletics, athPeople), []);
});

test("o preset de futebol cria dois campeonatos nacionais com seus clubes", () => {
  const football = presetById("football-leagues-2026");
  assert.ok(football);
  assert.equal(football.kind, "league");

  // Sem atletas individuais: futebol é disputado por clubes.
  assert.deepEqual(buildPresetPeople(football, "2026-01-01T00:00:00.000Z"), []);

  const clubs = buildPresetClubs(football, [], "2026-01-01T00:00:00.000Z");
  assert.equal(clubs.length, 40); // 20 + 20
  assert.ok(clubs.every(({ sportId, isClub }) => sportId === "sport_football" && isClub));
  const brasileirao = clubs.filter(({ modalityId }) => modalityId === "modality_football_brasileirao");
  const jleague = clubs.filter(({ modalityId }) => modalityId === "modality_football_jleague");
  assert.equal(brasileirao.length, 20);
  assert.equal(jleague.length, 20);
  // Clubes brasileiros ganham a geografia do Brasil.
  const palmeiras = brasileirao.find(({ name }) => name === "Palmeiras");
  assert.equal(palmeiras.countryId, "country_bra");
  assert.equal(palmeiras.continentId, "continent_south_america");
  assert.equal(jleague.find(({ name }) => name === "Vissel Kobe").countryId, "country_jpn");

  const competitions = buildPresetCompetitions(football);
  // 38 rodadas por liga (20 clubes -> turno e returno).
  assert.equal(competitions.length, 76);
  assert.equal(new Set(competitions.map(({ id }) => id)).size, 76);
  const br = competitions.filter(({ modalityId }) => modalityId === "modality_football_brasileirao");
  assert.equal(br.length, 38);
  assert.ok(br.every((c) => c.geographicScope === "national" && c.countryId === "country_bra"));
  assert.ok(br.every((c) => c.competitionModel === "season_stage"));
  assert.ok(br.every((c) => c.participantIds.length === 20));
  assert.ok(br.every((c) => c.roundFixtures.length === 10));
  assert.equal(br[0].seasonRound, 1);
  assert.equal(br.at(-1).seasonRound, 38);
  assert.equal(br.at(-1).seasonFinalRound, true);
  assert.equal(br.filter((c) => c.seasonFinalRound).length, 1);
  const jp = competitions.filter(({ modalityId }) => modalityId === "modality_football_jleague");
  assert.equal(jp.length, 38);
  assert.ok(jp.every((c) => c.countryId === "country_jpn"));
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
