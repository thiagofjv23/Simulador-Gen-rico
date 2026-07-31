import test from "node:test";
import assert from "node:assert/strict";

import {
  accumulateLeagueTable,
  buildFixtures,
  simulateLeagueRound,
} from "../js/league.js";
import { buildPresetClubs, buildPresetCompetitions, presetById } from "../js/presets.js";

const FOOTBALL = presetById("football-leagues-2026");
const TS = "2026-01-01T00:00:00.000Z";
const clubs = buildPresetClubs(FOOTBALL, [], TS)
  .filter(({ modalityId }) => modalityId === "modality_football_brasileirao");
const rounds = buildPresetCompetitions(FOOTBALL)
  .filter(({ modalityId }) => modalityId === "modality_football_brasileirao");

test("buildFixtures gera turno e returno com todos jogando todos", () => {
  const teamIds = clubs.map((c) => c.id);
  const fixtures = buildFixtures(teamIds);
  assert.equal(fixtures.length, (teamIds.length - 1) * 2); // 38 rodadas
  const totalMatches = fixtures.reduce((sum, round) => sum + round.length, 0);
  assert.equal(totalMatches, teamIds.length * (teamIds.length - 1)); // 380 jogos

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

test("o preset gera uma competição por rodada, espaçadas semanalmente", () => {
  assert.equal(rounds.length, 38);
  assert.ok(rounds.every((c) => c.competitionModel === "season_stage"));
  assert.ok(rounds.every((c) => c.seasonRoundCount === 38));
  assert.ok(rounds.every((c) => Array.isArray(c.roundFixtures) && c.roundFixtures.length === 10));
  assert.equal(rounds[0].seasonRound, 1);
  assert.equal(rounds[0].startDate, "2026-04-11");
  assert.equal(rounds[1].startDate, "2026-04-18"); // +7 dias
  assert.equal(rounds.at(-1).seasonRound, 38);
  assert.equal(rounds.at(-1).seasonFinalRound, true);
  assert.ok(rounds.slice(0, -1).every((c) => c.seasonFinalRound === false));
});

test("simulateLeagueRound resolve os placares e acumula a tabela", () => {
  // Rodada 1: sem rodadas anteriores.
  const round1 = simulateLeagueRound({
    competition: rounds[0], clubs,
    occurrenceStart: rounds[0].startDate, occurrenceEnd: rounds[0].endDate,
  }).result;
  assert.equal(round1.kind, "league-round");
  assert.equal(round1.matches.length, 10);
  assert.equal(round1.standings.length, 20); // 20 clubes jogaram
  assert.ok(round1.standings.every((r) => r.played === 1));
  // Tabela acumulada após a rodada 1: todos com 1 jogo.
  assert.equal(round1.leagueTable.length, 20);
  assert.ok(round1.leagueTable.every((r) => r.played === 1));
  assert.equal(round1.seasonChampion, null); // ainda não é a final

  // Rodada 2: acumula as linhas da rodada 1.
  const round2 = simulateLeagueRound({
    competition: rounds[1], clubs,
    occurrenceStart: rounds[1].startDate, occurrenceEnd: rounds[1].endDate,
    previousMatchRows: round1.standings,
  }).result;
  assert.ok(round2.leagueTable.every((r) => r.played === 2));
  // A soma de pontos da tabela = 3*(vitórias) + empates duplos coerente.
  const totalPoints = round2.leagueTable.reduce((s, r) => s + r.points, 0);
  const totalGames = round2.leagueTable.reduce((s, r) => s + r.played, 0) / 2; // 20 jogos
  // Cada jogo distribui 3 pontos (vitória) ou 2 (empate): faixa coerente.
  assert.ok(totalPoints >= totalGames * 2 && totalPoints <= totalGames * 3);
});

test("a última rodada coroa o campeão pela classificação acumulada", () => {
  // Simula a temporada inteira acumulando as rodadas.
  let previous = [];
  let last;
  for (const competition of rounds) {
    const { result } = simulateLeagueRound({
      competition, clubs,
      occurrenceStart: competition.startDate, occurrenceEnd: competition.endDate,
      previousMatchRows: previous,
    });
    previous = [...previous, ...result.standings];
    last = result;
  }
  assert.ok(last.seasonChampion);
  assert.equal(last.seasonChampion.name, last.leagueTable[0].name);
  assert.ok(last.leagueTable.every((r) => r.played === 38));
  // Gols pró totais = gols contra totais (todo gol é pró de um e contra de outro).
  const gf = last.leagueTable.reduce((s, r) => s + r.goalsFor, 0);
  const ga = last.leagueTable.reduce((s, r) => s + r.goalsAgainst, 0);
  assert.equal(gf, ga);
});

test("accumulateLeagueTable é determinístico e ordena por pontos", () => {
  const rows = [
    { clubId: "a", name: "A", played: 1, wins: 1, draws: 0, losses: 0, goalsFor: 2, goalsAgainst: 0 },
    { clubId: "b", name: "B", played: 1, wins: 0, draws: 0, losses: 1, goalsFor: 0, goalsAgainst: 2 },
  ];
  const table = accumulateLeagueTable(
    [{ id: "a", name: "A" }, { id: "b", name: "B" }, { id: "c", name: "C" }],
    rows,
  );
  assert.deepEqual(table.map((r) => [r.name, r.points, r.position]), [
    ["A", 3, 1],
    ["C", 0, 2], // C não jogou: 0 pontos, saldo 0, desempate por nome antes de B (saldo -2)
    ["B", 0, 3],
  ]);
});

test("a mesma rodada é determinística ao recarregar", () => {
  const a = simulateLeagueRound({
    competition: rounds[3], clubs, occurrenceStart: rounds[3].startDate, occurrenceEnd: rounds[3].endDate,
  });
  const b = simulateLeagueRound({
    competition: rounds[3], clubs, occurrenceStart: rounds[3].startDate, occurrenceEnd: rounds[3].endDate,
  });
  assert.deepEqual(a, b);
});
