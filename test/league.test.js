import test from "node:test";
import assert from "node:assert/strict";

import { buildFixtures, simulateLeagueSeason } from "../js/league.js";
import { buildPresetClubs, presetById } from "../js/presets.js";

const FOOTBALL = presetById("football-leagues-2026");
const TS = "2026-01-01T00:00:00.000Z";
const clubs = buildPresetClubs(FOOTBALL, [], TS)
  .filter(({ modalityId }) => modalityId === "modality_football_brasileirao");

const competition = {
  id: "preset_football-leagues-2026_brasileirao",
  name: "Campeonato Brasileiro Série A 2026",
  sportId: "sport_football",
  modalityId: "modality_football_brasileirao",
  sport: "Futebol",
  discipline: "Campeonato Brasileiro Série A",
  prestige: 92,
  geographicScope: "national",
  continentId: "continent_south_america",
  countryId: "country_bra",
  competitionModel: "season_stage",
  seasonId: "brasileirao-serie-a",
  seasonName: "Campeonato Brasileiro Série A 2026",
};

test("buildFixtures gera turno e returno com todos jogando todos", () => {
  const teamIds = clubs.map((c) => c.id);
  const fixtures = buildFixtures(teamIds);
  assert.equal(fixtures.length, (teamIds.length - 1) * 2); // 38 rodadas
  const totalMatches = fixtures.reduce((sum, round) => sum + round.length, 0);
  assert.equal(totalMatches, teamIds.length * (teamIds.length - 1)); // 380 jogos

  // Cada clube joga 2*(n-1) partidas, metade em casa e metade fora.
  const played = new Map(teamIds.map((id) => [id, { home: 0, away: 0 }]));
  for (const round of fixtures) {
    for (const [home, away] of round) {
      played.get(home).home += 1;
      played.get(away).away += 1;
    }
  }
  for (const id of teamIds) {
    assert.equal(played.get(id).home, teamIds.length - 1);
    assert.equal(played.get(id).away, teamIds.length - 1);
  }
});

test("simulateLeagueSeason gera a tabela completa e um campeão", () => {
  const { result } = simulateLeagueSeason({
    competition,
    clubs,
    occurrenceStart: "2026-04-11",
    occurrenceEnd: "2026-12-06",
  });

  assert.equal(result.kind, "league");
  assert.equal(result.standings.length, 20);
  // Cada clube joga 38 partidas (19 em casa, 19 fora).
  assert.ok(result.standings.every((row) => row.played === 38));
  // A soma de jogos = 20*38 = 760 (cada partida conta para dois clubes).
  assert.equal(result.standings.reduce((s, r) => s + r.played, 0), 760);
  // V + E + D = 38 para todos; gols pró de um = gols contra somados coerentes.
  assert.ok(result.standings.every((r) => r.wins + r.draws + r.losses === 38));
  const totalFor = result.standings.reduce((s, r) => s + r.goalsFor, 0);
  const totalAgainst = result.standings.reduce((s, r) => s + r.goalsAgainst, 0);
  assert.equal(totalFor, totalAgainst);
  // Pontos = 3*V + E, e o saldo bate com pró - contra.
  assert.ok(result.standings.every((r) => r.points === r.wins * 3 + r.draws));
  assert.ok(result.standings.every((r) => r.goalDifference === r.goalsFor - r.goalsAgainst));
  // Ordenado por pontos (não crescente).
  for (let i = 1; i < result.standings.length; i += 1) {
    assert.ok(result.standings[i - 1].points >= result.standings[i].points);
  }
  // Campeão = 1º colocado.
  assert.equal(result.standings[0].position, 1);
  assert.equal(result.seasonChampion.name, result.standings[0].name);
  assert.equal(result.seasonChampion.points, result.standings[0].points);
  assert.equal(result.seasonChampion.seasonYear, 2026);
});

test("a mesma temporada é determinística ao recarregar", () => {
  const first = simulateLeagueSeason({
    competition, clubs, occurrenceStart: "2026-04-11", occurrenceEnd: "2026-12-06",
  });
  const second = simulateLeagueSeason({
    competition, clubs, occurrenceStart: "2026-04-11", occurrenceEnd: "2026-12-06",
  });
  assert.deepEqual(first, second);
});
