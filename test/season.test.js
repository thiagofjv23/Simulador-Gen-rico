import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSeasonUnits,
  defaultRoundIndex,
  leagueClassification,
  pastChampions,
  qualifiedInfo,
  rankingStages,
  roundStates,
  topSeasonUnits,
} from "../js/season.js";

// Duas ligas (season_stage) e uma série por ranking (standalone) em 2026.
const competitions = [
  {
    id: "br_r1", name: "Brasileirão — Rodada 1", competitionModel: "season_stage",
    seasonId: "brasileirao", seasonName: "Campeonato Brasileiro", seasonRound: 1,
    sportId: "sport_football", sport: "Futebol", modalityId: "mod_br", discipline: "Série A",
    prestige: 92, recurrence: "yearly", startDate: "2026-04-11", endDate: "2026-04-11",
  },
  {
    id: "br_r2", name: "Brasileirão — Rodada 2", competitionModel: "season_stage",
    seasonId: "brasileirao", seasonName: "Campeonato Brasileiro", seasonRound: 2,
    sportId: "sport_football", sport: "Futebol", modalityId: "mod_br", discipline: "Série A",
    prestige: 92, recurrence: "yearly", startDate: "2026-04-18", endDate: "2026-04-18",
  },
  {
    id: "f1_r1", name: "GP 1", competitionModel: "season_stage",
    seasonId: "f1", seasonName: "Fórmula 1", seasonRound: 1,
    sportId: "sport_motorsport", sport: "Automobilismo", modalityId: "mod_f1", discipline: "F1",
    prestige: 100, recurrence: "yearly", startDate: "2026-03-06", endDate: "2026-03-08",
  },
  {
    id: "atp_1", name: "Australian Open", competitionModel: "standalone",
    sportId: "sport_tennis", sport: "Tênis", modalityId: "mod_atp", discipline: "Simples",
    prestige: 100, recurrence: "none", startDate: "2026-01-18", endDate: "2026-02-01",
  },
];

const results = [
  {
    competitionId: "br_r1", occurrenceStart: "2026-04-11", occurrenceEnd: "2026-04-11",
    seasonId: "brasileirao", sportId: "sport_football", modalityId: "mod_br",
    seasonRound: 1, kind: "league-round",
    standings: [
      { personId: "c_a", name: "Alfa", pointsAwarded: 3, played: 1, wins: 1, draws: 0, losses: 0, goalsFor: 2, goalsAgainst: 0 },
      { personId: "c_b", name: "Bravo", pointsAwarded: 0, played: 1, wins: 0, draws: 0, losses: 1, goalsFor: 0, goalsAgainst: 2 },
    ],
    leagueTable: [
      { position: 1, clubId: "c_a", name: "Alfa", countryCode: "BRA", played: 1, wins: 1, draws: 0, losses: 0, goalsFor: 2, goalsAgainst: 0, goalDifference: 2, points: 3 },
      { position: 2, clubId: "c_b", name: "Bravo", countryCode: "BRA", played: 1, wins: 0, draws: 0, losses: 1, goalsFor: 0, goalsAgainst: 2, goalDifference: -2, points: 0 },
    ],
  },
];

test("buildSeasonUnits agrupa ligas por seasonId e séries por esporte+modalidade", () => {
  const units = buildSeasonUnits(competitions, 2026);
  const leagues = units.filter((u) => u.kind === "league");
  const rankings = units.filter((u) => u.kind === "ranking");
  assert.equal(leagues.length, 2); // brasileirao, f1
  assert.equal(rankings.length, 1); // tênis
  const br = leagues.find((u) => u.seasonId === "brasileirao");
  assert.equal(br.rounds.length, 2);
  assert.equal(br.prestige, 92);
  assert.equal(br.rounds[0].seasonRound, 1);
});

test("topSeasonUnits ordena por prestígio", () => {
  const top = topSeasonUnits(buildSeasonUnits(competitions, 2026), 2);
  assert.deepEqual(top.map((u) => u.prestige), [100, 100]);
  // F1 (100) e Tênis (100) empatam; desempate por título.
  assert.ok(top.every((u) => u.prestige === 100));
});

test("leagueClassification usa a tabela de futebol (com saldo)", () => {
  const units = buildSeasonUnits(competitions, 2026);
  const br = units.find((u) => u.seasonId === "brasileirao");
  const classification = leagueClassification(br, results, 2026);
  assert.equal(classification.kind, "table");
  assert.equal(classification.throughRound, 1);
  assert.equal(classification.rows[0].name, "Alfa");
  assert.equal(classification.rows[0].goalDifference, 2);
});

test("roundStates marca rodadas decididas e defaultRoundIndex aponta a próxima", () => {
  const units = buildSeasonUnits(competitions, 2026);
  const br = units.find((u) => u.seasonId === "brasileirao");
  const states = roundStates(br, results);
  assert.equal(states.length, 2);
  assert.equal(states[0].decided, true); // rodada 1 tem resultado
  assert.equal(states[1].decided, false); // rodada 2 ainda não
  assert.equal(defaultRoundIndex(states), 1); // aponta para a próxima (rodada 2)
  // Todas decididas -> aponta a última.
  assert.equal(defaultRoundIndex([{ decided: true }, { decided: true }]), 1);
});

test("rankingStages lista etapas com estado de decisão", () => {
  const units = buildSeasonUnits(competitions, 2026);
  const tennis = units.find((u) => u.kind === "ranking");
  const stages = rankingStages(tennis, results);
  assert.equal(stages.length, 1);
  assert.equal(stages[0].decided, false); // sem resultado do ATP
  assert.equal(stages[0].stage.name, "Australian Open");
});

test("pastChampions lista campeões de anos anteriores encerrados", () => {
  const priorSeasonResults = [
    {
      competitionId: "br_r_final_2025", occurrenceStart: "2025-12-06", occurrenceEnd: "2025-12-06",
      competitionModel: "season_stage", seasonId: "brasileirao", seasonName: "Campeonato Brasileiro",
      sport: "Futebol", discipline: "Série A", sportId: "sport_football", modalityId: "mod_br",
      seasonChampion: { name: "Campeão 2025", points: 78, seasonYear: 2025 },
      standings: [{ personId: "c_a", name: "Campeão 2025", pointsAwarded: 78 }],
    },
  ];
  const units = buildSeasonUnits(competitions, 2026);
  const br = units.find((u) => u.seasonId === "brasileirao");
  const champions = pastChampions(br, priorSeasonResults, 2026);
  assert.equal(champions.length, 1);
  assert.equal(champions[0].year, 2025);
  assert.equal(champions[0].championName, "Campeão 2025");
});

test("qualifiedInfo mostra classificados e vagas restantes", () => {
  const qualifierComp = {
    id: "final", name: "Final", type: "championship", qualification: "qualifier",
    mixedCombination: null, slots: 8, occurrenceStart: "2026-06-01",
  };
  const linkedQualifier = {
    id: "semi", type: "qualifier", qualifierTargetCompetitionId: "final",
    qualifierSlots: 2, endDate: "2026-05-01",
  };
  const semiResult = {
    competitionId: "semi", occurrenceEnd: "2026-05-01",
    standings: [{ personId: "p1" }, { personId: "p2" }, { personId: "p3" }],
  };
  const info = qualifiedInfo(qualifierComp, [qualifierComp, linkedQualifier], [semiResult]);
  assert.ok(info);
  assert.deepEqual(info.qualifiedIds, ["p1", "p2"]); // 2 vagas da classificatória
  assert.equal(info.slotsTotal, 8);
  assert.equal(info.remaining, 6);
  // Evento sem classificatória -> sem info.
  assert.equal(qualifiedInfo({ qualification: "ranking", slots: 8 }, [], []), null);
});
