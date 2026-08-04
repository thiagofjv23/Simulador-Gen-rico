import {
  matchesGeographicScope,
  normalizeGeographicScope,
} from "./geography.js";
import {
  qualificationMethods,
  slotsForQualificationMethod,
} from "./competition.js";
import { pointsForPosition, scoringSystemLabel } from "./scoring.js";
import { resolveStage } from "./eventformat.js";
import { applyResultMetric } from "./metric.js";
import {
  BOXING_SPORT_ID,
  updateBoxingElo,
} from "./elo.js";

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

function ageModifier(age) {
  return clamp(1.2 - Math.abs(age - 26) * 0.16, -1.2, 1.2);
}

function expectedPerformance(person) {
  return (
    50
    + person.baseRating * 0.48
    + person.momentum * 0.55
    + ageModifier(person.age)
  );
}

// Desempenho de um participante na etapa. No modelo misto "weighted", o rating
// da equipe é misturado ao do atleta segundo o peso (0–100): peso 0 (ou sem
// equipe) devolve exatamente o cálculo original, preservando o determinismo dos
// resultados já existentes.
function performanceIndex(person, random, { teamRating = null, teamWeight = 0 } = {}) {
  let expected = expectedPerformance(person);

  if (teamRating != null && teamWeight > 0) {
    const weight = clamp(Number(teamWeight), 0, 100) / 100;
    const teamExpected = 50 + Number(teamRating) * 0.48;
    expected = expected * (1 - weight) + teamExpected * weight;
  }

  // Três sorteios somados concentram a variação perto de zero.
  const dailyVariation = (random() + random() + random() - 1.5) * 4;
  return Number(clamp(expected + dailyVariation, 0, 100).toFixed(2));
}

export function rankingPointsForPosition(
  winnerPoints,
  position,
  scoringSystemId = "generic-proportional",
) {
  return pointsForPosition({ scoringSystemId, winnerPoints, position });
}

function subtractDays(isoDate, days) {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setDate(date.getDate() - days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function qualifierParticipantIdsFor({
  competition,
  occurrenceStart,
  competitions,
  results,
}) {
  const earliestResultDate = subtractDays(occurrenceStart, 366);
  const linkedQualifiers = competitions
    .filter(({ type, qualifierTargetCompetitionId }) =>
      type === "qualifier"
      && qualifierTargetCompetitionId === competition.id,
    )
    .sort((a, b) =>
      a.endDate.localeCompare(b.endDate)
      || a.name.localeCompare(b.name, "pt-BR"),
    );
  const personIds = [];
  const seen = new Set();

  for (const qualifier of linkedQualifiers) {
    const latestResult = results
      .filter((result) =>
        result.competitionId === qualifier.id
        && result.occurrenceEnd < occurrenceStart
        && result.occurrenceEnd >= earliestResultDate,
      )
      .sort((a, b) => b.occurrenceEnd.localeCompare(a.occurrenceEnd))[0];
    if (!latestResult) continue;

    latestResult.standings
      .slice(0, qualifier.qualifierSlots)
      .forEach(({ personId }) => {
        if (seen.has(personId)) return;
        seen.add(personId);
        personIds.push(personId);
      });
  }

  return personIds;
}

// Elegibilidade por tipo de evento: uma competição atrelada a um tipo de evento
// só admite entidades do mesmo evento. Entidades sem eventTypeId (atletas legados
// e de preset) continuam elegíveis, para não alterar as simulações existentes.
export function matchesEventType(entity, competition) {
  return !competition?.eventTypeId
    || !entity?.eventTypeId
    || entity.eventTypeId === competition.eventTypeId;
}

export function selectParticipants(
  ranking,
  competition,
  { invitedPersonIds = [], qualifierPersonIds = [] } = {},
) {
  // A modalidade não é refiltrada aqui: o ranking recebido já vem restrito à
  // modalidade da competição (pelo rankingId), e um mesmo atleta pode disputar
  // outra categoria com modalidade principal diferente (ex.: Fórmula Regional
  // Europeia e Oriente Médio). As barreiras de esporte, tipo de evento e
  // geográfica permanecem.
  const scopedRanking = ranking
    .filter(({ person }) =>
      matchesGeographicScope(person, competition)
      && (!competition.sportId || !person.sportId || person.sportId === competition.sportId)
      && matchesEventType(person, competition),
    )
    .map((entry, index) => ({ ...entry, scopePosition: index + 1 }));
  const scopedByPersonId = new Map(
    scopedRanking.map((entry) => [entry.personId, entry]),
  );
  const selected = [];
  const selectedIds = new Set();
  const normalizedCompetition = {
    ...competition,
    qualification: competition.qualification ?? "ranking",
  };
  const methods = qualificationMethods(normalizedCompetition);

  if (competition.participantIds?.length) {
    return competition.participantIds
      .map((personId) => scopedByPersonId.get(personId))
      .filter(Boolean)
      .slice(0, competition.slots);
  }

  function addEntries(entries, limit) {
    let added = 0;
    for (const entry of entries) {
      if (added >= limit || selected.length >= competition.slots) break;
      if (!entry || selectedIds.has(entry.personId)) continue;
      selected.push(entry);
      selectedIds.add(entry.personId);
      added += 1;
    }
  }

  for (const method of ["qualifier", "invitation", "ranking", "open"]) {
    if (!methods.includes(method)) continue;
    const limit = slotsForQualificationMethod(normalizedCompetition, method);
    if (method === "qualifier") {
      addEntries(qualifierPersonIds.map((personId) => scopedByPersonId.get(personId)), limit);
    } else if (method === "invitation") {
      addEntries(invitedPersonIds.map((personId) => scopedByPersonId.get(personId)), limit);
    } else {
      addEntries(scopedRanking, limit);
    }
  }

  return selected.slice(0, competition.slots);
}

export function simulateCompetition({
  competition,
  occurrenceStart,
  occurrenceEnd,
  ranking,
  invitedPersonIds = [],
  qualifierPersonIds = [],
  // Rating da equipe de cada atleta (personId -> rating), usado só no modelo
  // misto "weighted". Vazio por padrão: sem equipes, o cálculo é o original.
  teamRatingByPersonId = new Map(),
}) {
  const participants = selectParticipants(ranking, competition, {
    invitedPersonIds,
    qualifierPersonIds,
  });
  if (participants.length < 2) {
    throw new Error("A competição precisa de pelo menos duas pessoas elegíveis.");
  }

  const winnerPoints = competition.rankingPoints ?? 100;
  const scoringSystemId = competition.scoringSystemId ?? "generic-proportional";
  const seasonYear = Number(occurrenceStart.slice(0, 4));
  const activeRanking = ranking.map((entry) =>
    competition.seasonalRanking && entry.seasonYear !== seasonYear
      ? {
        ...entry,
        points: 0,
        eventsCount: 0,
        seasonYear,
      }
      : entry);
  const seedSource = [
    competition.id,
    occurrenceStart,
    ...participants.map(({ personId, points }) => `${personId}:${points}`),
  ].join("|");
  const random = createRandom(hashString(seedSource));

  // Peso efetivo da equipe na etapa (modelo misto). Só o modelo "weighted" com
  // peso > 0 mistura o rating da equipe; caso contrário nada muda.
  const teamRatingModel = competition.teamRatingModel ?? "independent";
  const teamWeight = teamRatingModel === "weighted"
    ? clamp(Number(competition.teamWeight) || 0, 0, 100)
    : 0;

  // A performance é sorteada na ordem dos participantes (preserva o determinismo
  // dos resultados já existentes). O formato/métrica só entram quando a
  // competição os define — sem eles, o comportamento é idêntico ao anterior.
  const evaluated = participants.map((entry) => ({
    personId: entry.personId,
    name: entry.person.name,
    countryCode: entry.person.countryCode,
    baseRating: entry.person.baseRating,
    momentum: entry.person.momentum,
    previousRankingPosition: entry.position,
    performance: performanceIndex(entry.person, random, {
      teamRating: teamWeight > 0 ? teamRatingByPersonId.get(entry.personId) ?? null : null,
      teamWeight,
    }),
  }));

  const eventFormat = competition.eventFormat ?? null;
  const resultMetric = competition.resultMetric ?? null;
  const markType = competition.markType ?? "time";

  let ordered;
  if (eventFormat && eventFormat !== "individual-ranking") {
    const stage = resolveStage({
      participants: evaluated.map((entry) => ({ ...entry, seed: entry.previousRankingPosition })),
      format: eventFormat,
      metric: resultMetric ?? "position-table",
      markType,
      heatSize: competition.heatSize ?? 8,
      random,
    });
    const byPersonId = new Map(evaluated.map((entry) => [entry.personId, entry]));
    ordered = stage.map((entry) => ({ ...byPersonId.get(entry.personId), ...entry }));
  } else {
    ordered = [...evaluated]
      .sort((a, b) =>
        b.performance - a.performance
        || a.previousRankingPosition - b.previousRankingPosition
        || a.personId.localeCompare(b.personId))
      .map((standing, index) => ({ ...standing, position: index + 1 }));
  }

  const decorated = resultMetric
    ? applyResultMetric(ordered, { metric: resultMetric, markType })
    : ordered;

  const usesBoxingElo =
  competition.sportId === BOXING_SPORT_ID;

if (usesBoxingElo && decorated.length !== 2) {
  throw new Error(
    "Nesta primeira versão do Elo, uma competição de Boxe deve ter exatamente dois participantes.",
  );
}

let standings = decorated.map((standing) => ({
  ...standing,
  pointsAwarded: usesBoxingElo
    ? 0
    : rankingPointsForPosition(
        winnerPoints,
        standing.position,
        scoringSystemId,
      ),
}));

const updatedAt = `${occurrenceEnd}T23:59:59.000Z`;

let rankingEntries;
let eloChangesByPersonId = new Map();

if (usesBoxingElo) {
  const eloUpdate = updateBoxingElo(
    activeRanking,
    standings,
    { updatedAt },
  );

  rankingEntries = eloUpdate.rankingEntries;
  eloChangesByPersonId = eloUpdate.changesByPersonId;

  standings = standings.map((standing) => {
    const eloChange = eloChangesByPersonId.get(
      standing.personId,
    );

    return eloChange
      ? {
          ...standing,
          ...eloChange,
        }
      : standing;
  });
} else {
  const pointsByPerson = new Map(
    standings.map(({ personId, pointsAwarded }) => [
      personId,
      pointsAwarded,
    ]),
  );

  rankingEntries = activeRanking
    .map((entry) => ({
      ...entry,
      position: entry.position,
      previousPosition: entry.position,
      points:
        entry.points
        + (pointsByPerson.get(entry.personId) ?? 0),
      eventsCount:
        entry.eventsCount
        + (pointsByPerson.has(entry.personId) ? 1 : 0),
      seasonYear: competition.seasonalRanking
        ? seasonYear
        : entry.seasonYear,
      updatedAt,
    }))
    .sort(
      (a, b) =>
        b.points - a.points
        || a.previousPosition - b.previousPosition
        || a.personId.localeCompare(b.personId),
    )
    .map((entry, index) => ({
      ...entry,
      position: index + 1,
    }));
      }

  const newPositions = new Map(
    rankingEntries.map(({ personId, position }) => [personId, position]),
  );
  const resultStandings = standings.map((standing) => {
    const newRankingPosition = newPositions.get(standing.personId);
    return {
      ...standing,
      newRankingPosition,
      rankingChange: standing.previousRankingPosition - newRankingPosition,
    };
  });
  const peopleById = new Map(
    participants.map(({ personId, person }) => [personId, person]),
  );
  const seasonLeaderEntry = rankingEntries[0];
  const seasonLeader = seasonLeaderEntry
    ? peopleById.get(seasonLeaderEntry.personId)
    : null;
  const seasonChampion = competition.seasonFinalRound && seasonLeader
    ? {
      personId: seasonLeader.id,
      name: seasonLeader.name,
      points: seasonLeaderEntry.points,
      seasonYear,
      seasonId: competition.seasonId,
      seasonName: competition.seasonName,
    }
    : null;

  return {
    result: {
      id: `result_${competition.id}_${occurrenceStart}`,
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
      winnerPoints,
      scoringSystemId,
      scoringSystemName: scoringSystemLabel(scoringSystemId),
      eventFormat,
      resultMetric,
      markType: resultMetric === "direct-mark" ? markType : null,
      teamRatingModel,
      teamWeight,
      qualification: competition.qualification ?? "ranking",
      competitionModel: competition.competitionModel ?? "standalone",
      seasonId: competition.seasonId ?? null,
      seasonName: competition.seasonName ?? null,
      seasonRound: competition.seasonRound ?? null,
      seasonRoundCount: competition.seasonRoundCount ?? null,
      seasonChampion,
      occurrenceStart,
      occurrenceEnd,
      simulatedAt: updatedAt,
      participantCount: resultStandings.length,
      standings: resultStandings,
    },
    rankingEntries,
  };
}
