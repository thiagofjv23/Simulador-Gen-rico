// Sistema de liga de pontos corridos (futebol) — resolução rodada a rodada.
//
// É um sistema NOVO e independente da simulação individual (js/simulation.js):
// os competidores são clubes (entidade "equipe"). A temporada é dividida em
// RODADAS (turno e returno, todos contra todos, casa e fora); cada rodada é uma
// competição própria no calendário e, ao ser simulada, gera os placares daquela
// rodada e atualiza a classificação acumulada (3 pontos por vitória, 1 por
// empate, 0 por derrota). A tabela cresce ao longo do ano e o campeão sai na
// última rodada.
//
// Tudo é determinístico (RNG semeada) para que os resultados não mudem ao
// recarregar. Nada da simulação de atletas é importado, então os outros esportes
// não são afetados.

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
// Round-robin (algoritmo do círculo). `meetings` é quantas vezes cada dupla se
// enfrenta: 1 = turno único, 2 = turno e returno (padrão, mando invertido no
// returno), e assim por diante — cada confronto extra inverte o mando em relação
// ao anterior. Devolve um array de rodadas; cada rodada é uma lista de pares
// [mandante, visitante].
export function buildFixtures(teamIds = [], meetings = 2) {
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

  const legs = [];
  const totalLegs = Math.max(1, Math.floor(meetings) || 1);
  for (let leg = 0; leg < totalLegs; leg += 1) {
    // Legs pares mantêm o mando do turno; ímpares invertem (returno).
    const rounds = leg % 2 === 0
      ? firstLeg.map((pairs) => pairs.map(([home, away]) => [home, away]))
      : firstLeg.map((pairs) => pairs.map(([home, away]) => [away, home]));
    legs.push(...rounds);
  }
  return legs;
}

// Gols esperados de um confronto a partir dos ratings (com vantagem de casa).
function expectedGoals(homeRating, awayRating) {
  const diff = (homeRating + HOME_ADVANTAGE) - awayRating;
  return {
    home: clamp(1.35 + diff * 0.02, 0.15, 4.5),
    away: clamp(1.05 - diff * 0.02, 0.15, 4.5),
  };
}

// Linha de um clube em UMA partida (ponto de vista do clube).
function clubMatchRow(club, goalsFor, goalsAgainst) {
  const win = goalsFor > goalsAgainst;
  const draw = goalsFor === goalsAgainst;
  const points = win ? WIN_POINTS : draw ? DRAW_POINTS : 0;
  return {
    clubId: club.id,
    personId: club.id,
    name: club.name,
    countryCode: club.countryCode ?? null,
    baseRating: club.baseRating ?? 0,
    played: 1,
    wins: win ? 1 : 0,
    draws: draw ? 1 : 0,
    losses: !win && !draw ? 1 : 0,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points,
    pointsAwarded: points,
  };
}

function sortTable(rows) {
  return [...rows]
    .sort((a, b) =>
      b.points - a.points
      || b.goalDifference - a.goalDifference
      || b.goalsFor - a.goalsFor
      || b.baseRating - a.baseRating
      || a.name.localeCompare(b.name, "pt-BR"))
    .map((row, index) => ({ ...row, position: index + 1 }));
}

// Classificação acumulada a partir das linhas de partida de várias rodadas.
// Todos os clubes entram (mesmo com 0 jogos), para a tabela ficar completa.
export function accumulateLeagueTable(clubs = [], matchRows = []) {
  const table = new Map(clubs.map((club) => [club.id, {
    clubId: club.id,
    personId: club.id,
    name: club.name,
    countryCode: club.countryCode ?? null,
    baseRating: club.baseRating ?? 0,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  }]));

  for (const row of matchRows) {
    const entry = table.get(row.clubId);
    if (!entry) continue;
    entry.played += row.played;
    entry.wins += row.wins;
    entry.draws += row.draws;
    entry.losses += row.losses;
    entry.goalsFor += row.goalsFor;
    entry.goalsAgainst += row.goalsAgainst;
  }

  return sortTable([...table.values()].map((entry) => ({
    ...entry,
    goalDifference: entry.goalsFor - entry.goalsAgainst,
    points: entry.wins * WIN_POINTS + entry.draws * DRAW_POINTS,
    pointsAwarded: entry.wins * WIN_POINTS + entry.draws * DRAW_POINTS,
  })));
}

// Simula UMA rodada de uma liga. Recebe os confrontos da rodada
// (competition.roundFixtures) e as linhas de partida das rodadas anteriores da
// mesma temporada (previousMatchRows), para montar a classificação acumulada.
// Devolve um resultado no mesmo formato dos demais (para reaproveitar Resultados,
// Campeões, Temporadas e Notícias), com os placares da rodada (`matches`), as
// linhas por clube (`standings`, base do acúmulo em Temporadas) e a tabela
// acumulada até a rodada (`leagueTable`).
export function simulateLeagueRound({
  competition,
  clubs = [],
  occurrenceStart,
  occurrenceEnd,
  previousMatchRows = [],
}) {
  const fixtures = competition.roundFixtures ?? [];
  const clubById = new Map(clubs.map((club) => [club.id, club]));
  const seedSource = [
    competition.id,
    occurrenceStart,
    ...fixtures.map(([home, away]) => `${home}>${away}`),
  ].join("|");
  const random = createRandom(hashString(seedSource));

  const matches = [];
  const roundRows = [];
  for (const [homeId, awayId] of fixtures) {
    const home = clubById.get(homeId);
    const away = clubById.get(awayId);
    if (!home || !away) continue;
    const expected = expectedGoals(home.baseRating ?? 0, away.baseRating ?? 0);
    const homeGoals = poisson(expected.home, random);
    const awayGoals = poisson(expected.away, random);
    matches.push({
      homeId,
      homeName: home.name,
      homeCountryCode: home.countryCode ?? null,
      homeGoals,
      awayId,
      awayName: away.name,
      awayCountryCode: away.countryCode ?? null,
      awayGoals,
    });
    roundRows.push(clubMatchRow(home, homeGoals, awayGoals));
    roundRows.push(clubMatchRow(away, awayGoals, homeGoals));
  }

  const standings = sortTable(roundRows);
  const leagueTable = accumulateLeagueTable(clubs, [...previousMatchRows, ...roundRows]);
  const isFinalRound = Boolean(competition.seasonFinalRound);
  const seasonYear = Number(occurrenceStart.slice(0, 4));
  const updatedAt = `${occurrenceEnd}T23:59:59.000Z`;
  const championRow = leagueTable[0];
  const seasonChampion = isFinalRound && championRow
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
      kind: "league-round",
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
      seasonRound: competition.seasonRound ?? null,
      seasonRoundCount: competition.seasonRoundCount ?? null,
      seasonFinalRound: isFinalRound,
      seasonChampion,
      occurrenceStart,
      occurrenceEnd,
      simulatedAt: updatedAt,
      participantCount: matches.length * 2,
      standings,
      matches,
      leagueTable,
    },
  };
}
