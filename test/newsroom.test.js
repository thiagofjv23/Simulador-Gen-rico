import test from "node:test";
import assert from "node:assert/strict";

import {
  buildNewsFeed,
  latestTournamentWinners,
  resultsByRecency,
  topAthletesByRating,
} from "../js/newsroom.js";

function makeResult(overrides = {}) {
  return {
    id: overrides.id ?? "r1",
    competitionName: overrides.competitionName ?? "Torneio",
    sport: overrides.sport ?? "Tênis",
    discipline: overrides.discipline ?? "Simples masculino",
    sportId: overrides.sportId ?? "sport_tennis",
    modalityId: overrides.modalityId ?? "modality_tennis_mens_singles",
    prestige: overrides.prestige ?? 50,
    participantCount: overrides.participantCount ?? 4,
    occurrenceEnd: overrides.occurrenceEnd ?? "2026-05-10",
    simulatedAt: overrides.simulatedAt ?? "2026-05-10T23:59:59.000Z",
    standings: overrides.standings ?? [
      { position: 1, personId: "p1", name: "Alfa", countryCode: "BRA" },
      { position: 2, personId: "p2", name: "Beta", countryCode: "USA" },
      { position: 3, personId: "p3", name: "Gama", countryCode: "GER" },
      { position: 4, personId: "p4", name: "Delta", countryCode: "FRA" },
    ],
    ...overrides,
  };
}

test("cada resultado gera uma notícia de evento finalizado com link para o resultado", () => {
  const news = buildNewsFeed([makeResult()]);
  assert.equal(news.length, 1);
  assert.equal(news[0].kind, "event-finished");
  assert.match(news[0].title, /foi finalizada/);
  assert.match(news[0].summary, /Alfa venceu/);
  assert.deepEqual(news[0].link, {
    target: "result",
    resultId: "r1",
    label: "Ver resultado",
  });
});

test("um campeonato encerrado adiciona uma notícia com link ao ranking final", () => {
  const news = buildNewsFeed([
    makeResult({
      id: "final",
      sport: "Automobilismo",
      discipline: "Fórmula 1",
      sportId: "sport_motorsport",
      modalityId: "modality_motorsport_formula1",
      seasonId: "formula1-world-championship",
      seasonName: "Campeonato Mundial de Fórmula 1",
      seasonChampion: {
        personId: "p1",
        name: "Piloto Um (Equipe)",
        points: 400,
        seasonYear: 2026,
        seasonId: "formula1-world-championship",
        seasonName: "Campeonato Mundial de Fórmula 1",
      },
    }),
  ]);

  assert.equal(news.length, 2);
  const seasonNews = news.find(({ kind }) => kind === "season-finished");
  assert.ok(seasonNews);
  assert.match(seasonNews.summary, /Piloto Um.*400 pts/);
  assert.equal(seasonNews.link.target, "season-ranking");
  assert.equal(seasonNews.link.sportId, "sport_motorsport");
  assert.equal(seasonNews.link.modalityId, "modality_motorsport_formula1");
  // A notícia de campeonato aparece acima da notícia da etapa do mesmo dia.
  assert.equal(news[0].kind, "season-finished");
});

test("as notícias saem do mais recente para o mais antigo e respeitam o limite", () => {
  const results = [
    makeResult({ id: "a", occurrenceEnd: "2026-01-10" }),
    makeResult({ id: "b", occurrenceEnd: "2026-06-10" }),
    makeResult({ id: "c", occurrenceEnd: "2026-03-10" }),
  ];
  const news = buildNewsFeed(results, { limit: 2 });
  assert.equal(news.length, 2);
  assert.deepEqual(news.map(({ link }) => link.resultId), ["b", "c"]);
});

test("Os Melhores ordena por rating e ignora atletas sem esporte", () => {
  const people = [
    { id: "p1", name: "Alta", baseRating: 90, momentum: 0, sportId: "s", modalityId: "m", countryCode: "BRA" },
    { id: "p2", name: "Media", baseRating: 70, momentum: 0, sportId: "s", modalityId: "m", countryCode: "USA" },
    { id: "p3", name: "Genérico", baseRating: 99, momentum: 0, sportId: null, modalityId: null, countryCode: "GER" },
    { id: "p4", name: "Topo", baseRating: 95, momentum: 0, sportId: "s", modalityId: "m", countryCode: "FRA" },
  ];
  const best = topAthletesByRating(people, { limit: 2 });
  assert.deepEqual(best.map(({ person }) => person.id), ["p4", "p1"]);
  assert.deepEqual(best.map(({ rank }) => rank), [1, 2]);
});

test("Últimos vencedores traz os torneios mais recentes com pódio de três", () => {
  const results = [
    makeResult({ id: "old", occurrenceEnd: "2026-01-01" }),
    makeResult({ id: "new", occurrenceEnd: "2026-09-01", competitionName: "US Open" }),
  ];
  const winners = latestTournamentWinners(results, { count: 1 });
  assert.equal(winners.length, 1);
  assert.equal(winners[0].competitionName, "US Open");
  assert.equal(winners[0].podium.length, 3);
  assert.deepEqual(winners[0].podium.map(({ name }) => name), ["Alfa", "Beta", "Gama"]);
});

test("resultsByRecency não altera o array original", () => {
  const results = [makeResult({ id: "a" }), makeResult({ id: "b", occurrenceEnd: "2026-08-01" })];
  const ordered = resultsByRecency(results);
  assert.equal(ordered[0].id, "b");
  assert.equal(results[0].id, "a");
});
