// Sistema de liga de pontos corridos (futebol) — passo do preset de futebol.
//
// É um sistema NOVO e independente da simulação individual (js/simulation.js):
// os competidores são clubes (entidade "equipe"), a temporada inteira é um
// returno completo (turno e returno, todos contra todos, casa e fora) e a
// classificação usa 3 pontos por vitória, 1 por empate e 0 por derrota. Ao fim
// da temporada há uma tabela completa (J, V, E, D, GP, GC, SG, Pts) e um campeão.
//
// Tudo é determinístico (RNG semeada) para que a mesma temporada não mude ao
// recarregar. Não importa nada da simulação de atletas, então não interfere nos
// outros esportes.

import { normalizeGeographicScope } from "./geography.js";

const WIN_POINTS = 3;
const DRAW_POINTS = 1;
const HOME_ADVANTAGE = 6;

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// Amostra de Poisson (método de Knuth) usando a RNG semeada — determinística.
function poisson(lambda, random) {
  const limit = Math.exp(-Math.max(0, lambda));
  let count = 0;
  let product = 1;
  do {
    count += 1;
    product *= random();
  } while (product > limit);
  return count - 1;
}

// Tabela de confrontos de turno e returno pelo método do círculo. Devolve uma
// lista de rodadas; cada rodada é uma lista de pares [mandante, visitante].
export function buildFixtures(teamIds = []) {
  const teams = [...teamIds];
  if (teams.length % 2 !== 0) teams.push(null); // folga para número ímpar
  const teamCount = teams.length;
  const rotation = [...teams];
  const firstLeg = [];

  for (let round = 0; round < teamCount - 1; round += 1) {
    const pairs = [];
    for (let i = 0; i < teamCount / 2; i += 1) {
      const home = rotation[i];
      const away = rotation[teamCount - 1 - i];
      if (home !== null && away !== null) {
        // Alterna mando por rodada para equilibrar casa/fora.
        pairs.push(round % 2 === 0 ? [home, away] : [away, home]);
      }
    }
    firstLeg.push(pairs);
    rotation.splice(1, 0, rotation.pop()); // mantém o primeiro fixo e gira o resto
  }

  const secondLeg = firstLeg.map((pairs) => pairs.map(([home, away]) => [away, home]));
  return [...firstLeg, ...secondLeg];
}

// Gols esperados de um confronto a partir dos ratings (com vantagem de casa).
function expectedGoals(homeRating, awayRating) {
  const diff = (homeRating + HOME_ADVANTAGE) - awayRating;
  return {
    home: clamp(1.35 + diff * 0.02, 0.15, 4.5),
    away: clamp(1.05 - diff * 0.02, 0.15, 4.5),
  };
}

function emptyRow(club) {
  return {
    clubId: club.id,
    name: club.name,
    countryCode: club.countryCode ?? null,
    baseRating: club.baseRating ?? 0,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  };
}

// Simula a temporada completa de uma liga e devolve um resultado no mesmo
// formato dos demais resultados (para reaproveitar Resultados, Campeões,
// Temporadas e Notícias), com a tabela final em `standings`.
export function simulateLeagueSeason({
  competition,
  clubs = [],
  occurrenceStart,
  occurrenceEnd,
}) {
  if (clubs.length < 2) {
    throw new Error("A liga precisa de pelo menos dois clubes.");
  }

  const seasonYear = Number(occurrenceStart.slice(0, 4));
  const seedSource = [
    competition.id,
    occurrenceStart,
    ...clubs.map((club) => `${club.id}:${club.baseRating}`),
  ].join("|");
  const random = createRandom(hashString(seedSource));

  const rows = new Map(clubs.map((club) => [club.id, emptyRow(club)]));
  const ratingById = new Map(clubs.map((club) => [club.id, club.baseRating ?? 0]));
  const fixtures = buildFixtures(clubs.map((club) => club.id));

  for (const round of fixtures) {
    for (const [homeId, awayId] of round) {
      const expected = expectedGoals(ratingById.get(homeId), ratingById.get(awayId));
      const homeGoals = poisson(expected.home, random);
      const awayGoals = poisson(expected.away, random);
      const home = rows.get(homeId);
      const away = rows.get(awayId);
      home.played += 1;
      away.played += 1;
      home.goalsFor += homeGoals;
      home.goalsAgainst += awayGoals;
      away.goalsFor += awayGoals;
      away.goalsAgainst += homeGoals;
      if (homeGoals > awayGoals) {
        home.wins += 1;
        away.losses += 1;
      } else if (homeGoals < awayGoals) {
        away.wins += 1;
        home.losses += 1;
      } else {
        home.draws += 1;
        away.draws += 1;
      }
    }
  }

  const standings = [...rows.values()]
    .map((row) => ({
      ...row,
      goalDifference: row.goalsFor - row.goalsAgainst,
      points: row.wins * WIN_POINTS + row.draws * DRAW_POINTS,
    }))
    .sort((a, b) =>
      b.points - a.points
      || b.goalDifference - a.goalDifference
      || b.goalsFor - a.goalsFor
      || b.baseRating - a.baseRating
      || a.name.localeCompare(b.name, "pt-BR"))
    .map((row, index) => ({
      ...row,
      position: index + 1,
      // Campos compartilhados com os demais resultados (para reaproveitar a UI):
      personId: row.clubId,
      pointsAwarded: row.wins * WIN_POINTS + row.draws * DRAW_POINTS,
    }));

  const championRow = standings[0];
  const updatedAt = `${occurrenceEnd}T23:59:59.000Z`;
  const seasonChampion = championRow
    ? {
      personId: championRow.clubId,
      name: championRow.name,
      points: championRow.points,
      seasonYear,
      seasonId: competition.seasonId ?? null,
      seasonName: competition.seasonName ?? competition.name,
    }
    : null;

  return {
    result: {
      id: `result_${competition.id}_${occurrenceStart}`,
      kind: "league",
      competitionId: competition.id,
      competitionName: competition.name,
      sportId: competition.sportId ?? null,
      modalityId: competition.modalityId ?? null,
      sport: competition.sport,
      discipline: competition.discipline,
      prestige: competition.prestige,
      geographicScope: normalizeGeographicScope(competition.geographicScope),
      continentId: competition.continentId ?? null,
      countryId: competition.countryId ?? null,
      winnerPoints: WIN_POINTS,
      scoringSystemId: competition.scoringSystemId ?? "generic-proportional",
      scoringSystemName: "Pontos corridos (3 · 1 · 0)",
      eventFormat: null,
      resultMetric: null,
      markType: null,
      qualification: competition.qualification ?? "ranking",
      competitionModel: competition.competitionModel ?? "season_stage",
      seasonId: competition.seasonId ?? null,
      seasonName: competition.seasonName ?? null,
      seasonRound: 1,
      seasonRoundCount: 1,
      seasonChampion,
      occurrenceStart,
      occurrenceEnd,
      simulatedAt: updatedAt,
      participantCount: standings.length,
      standings,
    },
  };
}
