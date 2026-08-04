export const ELO_RANKING_MODEL = "elo";
export const BOXING_SPORT_ID = "sport_boxing";

export const BOXING_ELO_CONFIG = {
  initialRating: 1500,
  provisionalFights: 5,
  provisionalK: 40,
  regularK: 24,
};

function ratingOf(entry, config) {
  if (
    entry.rankingModel === ELO_RANKING_MODEL
    && Number.isFinite(Number(entry.points))
  ) {
    return Number(entry.points);
  }

  return config.initialRating;
}

function fightsOf(entry) {
  if (entry.rankingModel !== ELO_RANKING_MODEL) return 0;

  return Number(entry.fightsCount ?? entry.eventsCount) || 0;
}

export function expectedEloScore(ratingA, ratingB) {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
}

export function updateBoxingElo(
  rankingEntries,
  standings,
  {
    updatedAt = new Date().toISOString(),
    config = BOXING_ELO_CONFIG,
  } = {},
) {
  if (standings.length !== 2) {
    throw new Error(
      "Nesta primeira versão, uma competição de Boxe deve ter exatamente dois participantes.",
    );
  }

  const ordered = [...standings].sort(
    (a, b) => a.position - b.position,
  );

  const winnerStanding = ordered[0];
  const loserStanding = ordered[1];

  const normalizedEntries = rankingEntries.map((entry) => ({
    ...entry,
    points: ratingOf(entry, config),
    eventsCount: fightsOf(entry),
    fightsCount: fightsOf(entry),
    ranked: fightsOf(entry) >= config.provisionalFights,
    rankingModel: ELO_RANKING_MODEL,
  }));

  const entryByPersonId = new Map(
    normalizedEntries.map((entry) => [entry.personId, entry]),
  );

  const winnerEntry = entryByPersonId.get(winnerStanding.personId);
  const loserEntry = entryByPersonId.get(loserStanding.personId);

  if (!winnerEntry || !loserEntry) {
    throw new Error(
      "Os dois boxeadores precisam possuir uma entrada no ranking.",
    );
  }

  const winnerRating = winnerEntry.points;
  const loserRating = loserEntry.points;

  const winnerExpected = expectedEloScore(
    winnerRating,
    loserRating,
  );

  const hasProvisionalFighter =
    winnerEntry.fightsCount < config.provisionalFights
    || loserEntry.fightsCount < config.provisionalFights;

  const kFactor = hasProvisionalFighter
    ? config.provisionalK
    : config.regularK;

  const winnerChange = Math.round(
    kFactor * (1 - winnerExpected),
  );

  // Usar o inverso mantém a soma total dos ratings estável.
  const loserChange = -winnerChange;

  const changesByPersonId = new Map([
    [
      winnerEntry.personId,
      {
        ratingBefore: winnerRating,
        ratingAfter: winnerRating + winnerChange,
        ratingChange: winnerChange,
      },
    ],
    [
      loserEntry.personId,
      {
        ratingBefore: loserRating,
        ratingAfter: loserRating + loserChange,
        ratingChange: loserChange,
      },
    ],
  ]);

  const updatedEntries = normalizedEntries
    .map((entry) => {
      const change = changesByPersonId.get(entry.personId);

      if (!change) return entry;

      const fightsCount = entry.fightsCount + 1;

      return {
        ...entry,
        points: change.ratingAfter,
        eventsCount: fightsCount,
        fightsCount,
        ranked: fightsCount >= config.provisionalFights,
        rankingModel: ELO_RANKING_MODEL,
        updatedAt,
      };
    })
    .sort(
      (a, b) =>
        Number(b.ranked) - Number(a.ranked)
        || b.points - a.points
        || a.previousPosition - b.previousPosition
        || a.personId.localeCompare(b.personId),
    )
    .map((entry, index) => ({
      ...entry,
      previousPosition: entry.position,
      position: index + 1,
    }));

  return {
    rankingEntries: updatedEntries,
    changesByPersonId,
  };
      }
