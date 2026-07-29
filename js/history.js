// Histórico esportivo: campeões passados, temporadas encerradas e a trajetória
// de cada atleta. Reconstrói tudo a partir dos resultados persistentes, sem
// depender de snapshots extras. Todas as funções são puras.

import { resultsByRecency } from "./newsroom.js";

function seasonYearOf(result) {
  return Number((result.occurrenceStart ?? result.occurrenceEnd).slice(0, 4));
}

// Lista de eventos concluídos, do mais recente para o mais antigo, já com o
// campeão (primeiro colocado) e o eventual campeão de temporada em destaque.
export function finishedEvents(results = []) {
  return resultsByRecency(results).map((result) => {
    const winner = result.standings?.[0] ?? null;
    return {
      resultId: result.id,
      competitionName: result.competitionName,
      sport: result.sport,
      discipline: result.discipline,
      sportId: result.sportId ?? null,
      modalityId: result.modalityId ?? null,
      prestige: result.prestige ?? null,
      date: result.occurrenceEnd,
      year: seasonYearOf(result),
      participantCount: result.participantCount ?? result.standings?.length ?? 0,
      isSeasonFinal: Boolean(result.seasonChampion),
      seasonName: result.seasonName ?? null,
      champion: winner
        ? { personId: winner.personId, name: winner.name, countryCode: winner.countryCode }
        : null,
      seasonChampion: result.seasonChampion ?? null,
    };
  });
}

// Soma os pontos concedidos em cada etapa para reconstruir a classificação
// final de uma temporada. Recebe apenas os resultados de uma mesma temporada.
export function aggregateSeasonStandings(seasonResults = []) {
  const totals = new Map();

  for (const result of seasonResults) {
    for (const standing of result.standings ?? []) {
      const accumulated = totals.get(standing.personId) ?? {
        personId: standing.personId,
        name: standing.name,
        countryCode: standing.countryCode,
        points: 0,
        events: 0,
      };
      accumulated.points += standing.pointsAwarded ?? 0;
      accumulated.events += 1;
      accumulated.name = standing.name;
      accumulated.countryCode = standing.countryCode;
      totals.set(standing.personId, accumulated);
    }
  }

  return [...totals.values()]
    .sort((a, b) =>
      b.points - a.points
      || b.events - a.events
      || a.name.localeCompare(b.name, "pt-BR"),
    )
    .map((entry, index) => ({ ...entry, position: index + 1 }));
}

// Agrupa os resultados de etapas de temporada por (temporada, ano) e devolve a
// classificação final de cada uma, da temporada mais recente para a mais antiga.
export function pastSeasons(results = []) {
  const groups = new Map();

  for (const result of results) {
    if (result.competitionModel !== "season_stage" || !result.seasonId) continue;
    const year = seasonYearOf(result);
    const key = `${result.seasonId}_${year}`;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        seasonId: result.seasonId,
        seasonName: result.seasonName ?? "Temporada",
        sport: result.sport ?? "",
        discipline: result.discipline ?? "",
        sportId: result.sportId ?? null,
        modalityId: result.modalityId ?? null,
        year,
        results: [],
        champion: null,
        lastDate: result.occurrenceEnd,
      });
    }
    const group = groups.get(key);
    group.results.push(result);
    if (result.occurrenceEnd > group.lastDate) group.lastDate = result.occurrenceEnd;
    if (result.seasonChampion) group.champion = result.seasonChampion;
  }

  return [...groups.values()]
    .map((group) => ({
      key: group.key,
      seasonId: group.seasonId,
      seasonName: group.seasonName,
      sport: group.sport,
      discipline: group.discipline,
      sportId: group.sportId,
      modalityId: group.modalityId,
      year: group.year,
      rounds: group.results.length,
      finished: Boolean(group.champion),
      champion: group.champion,
      lastDate: group.lastDate,
      standings: aggregateSeasonStandings(group.results),
    }))
    .sort((a, b) =>
      b.year - a.year
      || a.seasonName.localeCompare(b.seasonName, "pt-BR"),
    );
}

// Trajetória de um atleta em campeonatos passados.
//
// A seleção respeita o prestígio: competições mais prestigiadas "se mantêm por
// mais tempo" e sobressaem às de menor prestígio quando é preciso cortar a
// lista. O que fica é então exibido na ordem em que terminou.
//
// - Modalidades sazonais (ex.: Fórmula 1): apenas a posição final em cada
//   temporada, nunca cada corrida isolada.
// - Modalidades cumulativas (ex.: tênis): no máximo `limit` competições,
//   priorizando a ordem de término e o prestígio.
export function athleteCompetitionHistory(
  results = [],
  personId,
  { seasonal = false, limit = 10 } = {},
) {
  if (seasonal) {
    const seasons = pastSeasons(
      results.filter((result) => result.competitionModel === "season_stage"),
    );
    const entries = [];
    for (const season of seasons) {
      const row = season.standings.find((entry) => entry.personId === personId);
      if (!row) continue;
      entries.push({
        type: "season",
        key: season.key,
        title: `${season.seasonName} ${season.year}`,
        subtitle: [season.sport, season.discipline].filter(Boolean).join(" · "),
        position: row.position,
        participants: season.standings.length,
        points: row.points,
        date: season.lastDate,
        prestige: null,
        finished: season.finished,
        link: {
          target: "season",
          seasonKey: season.key,
          seasonId: season.seasonId,
          year: season.year,
          sportId: season.sportId,
          modalityId: season.modalityId,
        },
      });
    }
    return entries
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
  }

  const events = [];
  for (const result of results) {
    if (result.competitionModel === "season_stage") continue;
    const standing = (result.standings ?? []).find((entry) => entry.personId === personId);
    if (!standing) continue;
    events.push({
      type: "event",
      key: result.id,
      resultId: result.id,
      title: result.competitionName,
      subtitle: [result.sport, result.discipline].filter(Boolean).join(" · "),
      position: standing.position,
      participants: result.participantCount ?? result.standings?.length ?? 0,
      points: standing.pointsAwarded ?? 0,
      date: result.occurrenceEnd,
      prestige: result.prestige ?? 0,
      link: { target: "result", resultId: result.id },
    });
  }

  // Retenção priorizando prestígio (as mais prestigiadas permanecem por mais
  // tempo); entre iguais, as mais recentes.
  const kept = [...events]
    .sort((a, b) =>
      b.prestige - a.prestige
      || b.date.localeCompare(a.date)
      || a.title.localeCompare(b.title, "pt-BR"),
    )
    .slice(0, limit);

  // Exibição na ordem em que terminaram (mais recente primeiro).
  return kept.sort((a, b) =>
    b.date.localeCompare(a.date)
    || b.prestige - a.prestige,
  );
}
