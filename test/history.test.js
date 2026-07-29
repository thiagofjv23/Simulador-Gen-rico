import test from "node:test";
import assert from "node:assert/strict";

import {
  aggregateSeasonStandings,
  athleteCompetitionHistory,
  finishedEvents,
  pastSeasons,
} from "../js/history.js";

// Duas etapas de uma temporada de Fórmula 1 (2026) e o encerramento com campeão.
function seasonResult(id, endDate, standings, champion = null) {
  return {
    id,
    competitionName: `GP ${id}`,
    competitionModel: "season_stage",
    seasonId: "f1-wc",
    seasonName: "Mundial de F1",
    sport: "Automobilismo",
    discipline: "Fórmula 1",
    sportId: "sport_motorsport",
    modalityId: "modality_motorsport_formula1",
    prestige: 100,
    occurrenceStart: endDate,
    occurrenceEnd: endDate,
    participantCount: standings.length,
    standings,
    seasonChampion: champion,
  };
}

function standing(position, personId, name, pointsAwarded) {
  return { position, personId, name, countryCode: "BRA", pointsAwarded };
}

test("aggregateSeasonStandings soma os pontos das etapas e reordena", () => {
  const totals = aggregateSeasonStandings([
    seasonResult("r1", "2026-03-08", [
      standing(1, "a", "Ayrton", 25),
      standing(2, "b", "Beto", 18),
    ]),
    seasonResult("r2", "2026-03-15", [
      standing(1, "b", "Beto", 25),
      standing(2, "a", "Ayrton", 18),
    ]),
  ]);
  assert.deepEqual(totals.map(({ personId }) => personId), ["a", "b"]);
  assert.equal(totals[0].points, 43);
  assert.equal(totals[0].position, 1);
  assert.equal(totals[0].events, 2);
});

test("pastSeasons agrupa por temporada e ano e marca o campeão", () => {
  const seasons = pastSeasons([
    seasonResult("r1", "2026-03-08", [standing(1, "a", "Ayrton", 25)]),
    seasonResult("r2", "2026-12-06", [standing(1, "a", "Ayrton", 25)], {
      personId: "a",
      name: "Ayrton",
      points: 50,
      seasonYear: 2026,
    }),
    seasonResult("r3", "2027-03-08", [standing(1, "b", "Beto", 25)]),
  ]);
  assert.equal(seasons.length, 2);
  // Mais recente primeiro.
  assert.equal(seasons[0].year, 2027);
  assert.equal(seasons[0].finished, false);
  assert.equal(seasons[1].year, 2026);
  assert.equal(seasons[1].finished, true);
  assert.equal(seasons[1].champion.personId, "a");
  assert.equal(seasons[1].standings[0].points, 50);
});

test("finishedEvents ordena do mais recente ao mais antigo com campeão", () => {
  const events = finishedEvents([
    {
      id: "old",
      competitionName: "Antigo",
      occurrenceEnd: "2026-01-01",
      prestige: 50,
      participantCount: 2,
      standings: [standing(1, "a", "Ayrton", 100)],
    },
    {
      id: "new",
      competitionName: "Novo",
      occurrenceEnd: "2026-09-01",
      prestige: 90,
      participantCount: 2,
      standings: [standing(1, "b", "Beto", 100)],
    },
  ]);
  assert.deepEqual(events.map(({ resultId }) => resultId), ["new", "old"]);
  assert.equal(events[0].champion.name, "Beto");
});

test("um piloto de F1 vê apenas a posição final de cada temporada", () => {
  const results = [
    seasonResult("r1", "2026-03-08", [
      standing(1, "a", "Ayrton", 25),
      standing(2, "b", "Beto", 18),
    ]),
    seasonResult("r2", "2026-12-06", [
      standing(1, "b", "Beto", 25),
      standing(2, "a", "Ayrton", 18),
    ], { personId: "a", name: "Ayrton", points: 43, seasonYear: 2026 }),
  ];
  const history = athleteCompetitionHistory(results, "a", { seasonal: true });
  assert.equal(history.length, 1);
  assert.equal(history[0].type, "season");
  assert.equal(history[0].position, 1); // 43 pts > 43? a=43, b=43 -> tie broken by events then name; check
});

test("um tenista vê no máximo as 10 competições, priorizando prestígio na retenção", () => {
  const results = [];
  // 12 competições: prestígios variados e datas crescentes.
  for (let i = 0; i < 12; i += 1) {
    const day = String(i + 1).padStart(2, "0");
    results.push({
      id: `t${i}`,
      competitionName: `Torneio ${i}`,
      competitionModel: "standalone",
      sport: "Tênis",
      discipline: "Simples masculino",
      occurrenceEnd: `2026-05-${day}`,
      prestige: i === 0 ? 100 : 40 + i, // o mais antigo é o mais prestigiado
      participantCount: 4,
      standings: [standing(1, "a", "Ayrton", 100)],
    });
  }
  const history = athleteCompetitionHistory(results, "a", { seasonal: false, limit: 10 });
  assert.equal(history.length, 10);
  // Exibição na ordem de término (mais recente primeiro).
  assert.equal(history[0].resultId, "t11");
  // O torneio mais antigo (t0) sobrevive ao corte por ter prestígio 100.
  assert.ok(history.some(({ resultId }) => resultId === "t0"));
});
