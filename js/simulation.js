import {
  matchesGeographicScope,
  normalizeGeographicScope,
} from "./geography.js";
import {
  qualificationMethods,
  slotsForQualificationMethod,
} from "./competition.js";
import { pointsForPosition, scoringSystemLabel } from "./scoring.js";

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

function performanceIndex(person, random) {
  const expectedPerformance =
    50
    + person.baseRating * 0.48
    + person.momentum * 0.55
    + ageModifier(person.age);

  // Três sorteios somados concentram a variação perto de zero.
  const dailyVariation = (random() + random() + random() - 1.5) * 4;
  return Number(clamp(expectedPerformance + dailyVariation, 0, 100).toFixed(2));
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

export function selectParticipants(
  ranking,
  competition,
  { invitedPersonIds = [], qualifierPersonIds = [] } = {},
) {
  const scopedRanking = ranking
    .filter(({ person }) =>
      matchesGeographicScope(person, competition)
      && (!competition.sportId || !person.sportId || person.sportId === competition.sportId)
      && (!competition.modalityId || !person.modalityId
        || person.modalityId === competition.modalityId),
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

  const standings = participants
    .map((entry) => ({
      personId: entry.personId,
      name: entry.person.name,
      countryCode: entry.person.countryCode,
      baseRating: entry.person.baseRating,
      momentum: entry.person.momentum,
      previousRankingPosition: entry.position,
      performance: performanceIndex(entry.person, random),
    }))
    .sort((a, b) =>
      b.performance - a.performance
      || a.previousRankingPosition - b.previousRankingPosition
      || a.personId.localeCompare(b.personId),
    )
    .map((standing, index) => ({
      ...standing,
      position: index + 1,
      pointsAwarded: rankingPointsForPosition(
        winnerPoints,
        index + 1,
        scoringSystemId,
      ),
    }));

  const pointsByPerson = new Map(
    standings.map(({ personId, pointsAwarded }) => [personId, pointsAwarded]),
  );
  const updatedAt = `${occurrenceEnd}T23:59:59.000Z`;
  const rankingEntries = activeRanking
    .map((entry) => ({
      ...entry,
      position: entry.position,
      previousPosition: entry.position,
      points: entry.points + (pointsByPerson.get(entry.personId) ?? 0),
      eventsCount: entry.eventsCount + (pointsByPerson.has(entry.personId) ? 1 : 0),
      seasonYear: competition.seasonalRanking ? seasonYear : entry.seasonYear,
      updatedAt,
    }))
    .sort((a, b) =>
      b.points - a.points
      || a.previousPosition - b.previousPosition
      || a.personId.localeCompare(b.personId),
    )
    .map((entry, index) => ({ ...entry, position: index + 1 }));

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
      sport: competition.sport,
      discipline: competition.discipline,
      prestige: competition.prestige,
      geographicScope: normalizeGeographicScope(competition.geographicScope),
      continentId: competition.continentId ?? null,
      countryId: competition.countryId ?? null,
      winnerPoints,
      scoringSystemId,
      scoringSystemName: scoringSystemLabel(scoringSystemId),
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
