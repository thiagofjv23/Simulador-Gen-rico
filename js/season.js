// Página "Temporada": reúne, por temporada corrente, os campeonatos de "Etapa
// de temporada" (ligas de futebol, categorias de automobilismo...) e as séries
// por ranking (tênis, atletismo), para uma tela dedicada com classificação,
// navegação por rodadas e histórico de campeões.
//
// Só monta e consulta dados já existentes (competições e resultados). Todas as
// funções são puras, para testes sem IndexedDB nem DOM. Nada aqui altera a
// simulação ou outros esportes.

import { occurrencesBetween } from "./calendar.js";
import { aggregateSeasonStandings, pastSeasons } from "./history.js";
import { qualifierParticipantIdsFor } from "./simulation.js";
import { slotsForQualificationMethod, usesQualificationMethod } from "./competition.js";

function yearOf(isoDate) {
  return Number(String(isoDate).slice(0, 4));
}

// Unidades de temporada ativas em um ano: uma por campeonato "season_stage"
// (agrupado por seasonId) e uma por série de ranking (agrupada por esporte +
// modalidade das competições independentes).
export function buildSeasonUnits(competitions = [], year) {
  const occurrences = occurrencesBetween(competitions, `${year}-01-01`, `${year}-12-31`);
  const leagues = new Map();
  const rankings = new Map();

  for (const occurrence of occurrences) {
    if (occurrence.competitionModel === "season_stage" && occurrence.seasonId) {
      if (!leagues.has(occurrence.seasonId)) {
        leagues.set(occurrence.seasonId, {
          kind: "league",
          key: `league:${occurrence.seasonId}`,
          seasonId: occurrence.seasonId,
          seasonName: occurrence.seasonName ?? occurrence.name,
          sportId: occurrence.sportId,
          sportName: occurrence.sport,
          modalityId: occurrence.modalityId,
          modalityName: occurrence.discipline,
          presetId: occurrence.presetId ?? null,
          title: `${occurrence.seasonName ?? occurrence.name} ${year}`,
          prestige: 0,
          rounds: [],
        });
      }
      const unit = leagues.get(occurrence.seasonId);
      unit.prestige = Math.max(unit.prestige, occurrence.prestige ?? 0);
      unit.rounds.push(occurrence);
    } else if (occurrence.competitionModel !== "season_stage") {
      const key = `${occurrence.sportId}|${occurrence.modalityId}`;
      if (!rankings.has(key)) {
        rankings.set(key, {
          kind: "ranking",
          key: `ranking:${key}`,
          sportId: occurrence.sportId,
          sportName: occurrence.sport,
          modalityId: occurrence.modalityId,
          modalityName: occurrence.discipline,
          title: `${occurrence.sport} · ${occurrence.discipline}`,
          prestige: 0,
          stages: [],
        });
      }
      const unit = rankings.get(key);
      unit.prestige = Math.max(unit.prestige, occurrence.prestige ?? 0);
      unit.stages.push(occurrence);
    }
  }

  const byRound = (a, b) =>
    (a.seasonRound ?? 0) - (b.seasonRound ?? 0)
    || a.occurrenceStart.localeCompare(b.occurrenceStart);
  const byDate = (a, b) => a.occurrenceStart.localeCompare(b.occurrenceStart);

  for (const unit of leagues.values()) unit.rounds.sort(byRound);
  for (const unit of rankings.values()) unit.stages.sort(byDate);

  return [...leagues.values(), ...rankings.values()];
}

// Os campeonatos/ligas de maior prestígio, de qualquer esporte.
export function topSeasonUnits(units = [], limit = 3) {
  return [...units]
    .sort((a, b) => b.prestige - a.prestige || a.title.localeCompare(b.title, "pt-BR"))
    .slice(0, limit);
}

function resultForOccurrence(results, occurrence) {
  return results.find((result) =>
    result.competitionId === occurrence.id
    && result.occurrenceStart === occurrence.occurrenceStart) ?? null;
}

// Resultados de uma unidade no ano corrente.
export function unitResults(results = [], unit, year) {
  if (!unit) return [];
  if (unit.kind === "league") {
    return results.filter((result) =>
      result.seasonId === unit.seasonId && yearOf(result.occurrenceStart) === year);
  }
  return results.filter((result) =>
    result.sportId === unit.sportId
    && result.modalityId === unit.modalityId
    && yearOf(result.occurrenceStart) === year);
}

// Classificação corrente de uma liga/campeonato. Futebol traz a tabela completa
// (leagueTable, com saldo de gols); os demais season_stage somam os pontos das
// etapas (como no automobilismo).
export function leagueClassification(unit, results = [], year) {
  const relevant = unitResults(results, unit, year);
  const withTable = relevant.filter((result) => Array.isArray(result.leagueTable));
  if (withTable.length) {
    const latest = [...withTable].sort((a, b) =>
      (b.seasonRound ?? 0) - (a.seasonRound ?? 0)
      || b.occurrenceEnd.localeCompare(a.occurrenceEnd))[0];
    return { kind: "table", rows: latest.leagueTable, throughRound: latest.seasonRound };
  }
  return { kind: "points", rows: aggregateSeasonStandings(relevant), throughRound: null };
}

// Estado de cada rodada da liga: número, se já foi decidida e o resultado.
export function roundStates(unit, results = []) {
  if (!unit || unit.kind !== "league") return [];
  return unit.rounds.map((round, index) => {
    const result = resultForOccurrence(results, round);
    return {
      round,
      roundNumber: round.seasonRound ?? index + 1,
      decided: Boolean(result),
      result,
    };
  });
}

// Rodada exibida por default: a primeira ainda não decidida (a "próxima"), ou a
// última se a temporada já acabou.
export function defaultRoundIndex(states = []) {
  const next = states.findIndex((state) => !state.decided);
  if (next >= 0) return next;
  return Math.max(0, states.length - 1);
}

// Etapas de uma série por ranking: cada etapa com seu estado e resultado.
export function rankingStages(unit, results = []) {
  if (!unit || unit.kind !== "ranking") return [];
  return unit.stages.map((stage) => {
    const result = resultForOccurrence(results, stage);
    return { stage, decided: Boolean(result), result };
  });
}

// Campeões anteriores de um campeonato de temporada (anos já encerrados),
// do mais recente para o mais antigo.
export function pastChampions(unit, results = [], currentYear) {
  if (!unit || unit.kind !== "league") return [];
  return pastSeasons(results)
    .filter((season) =>
      season.seasonId === unit.seasonId
      && season.finished
      && season.champion
      && (currentYear == null || season.year < currentYear))
    .map((season) => ({
      year: season.year,
      championName: season.champion.name,
      points: season.champion.points,
    }));
}

// Informação de classificados para eventos com vaga por classificatória: quem já
// está classificado e quantas vagas restam.
export function qualifiedInfo(competition, competitions = [], results = []) {
  if (!competition || !usesQualificationMethod(competition, "qualifier")) return null;
  const qualifiedIds = qualifierParticipantIdsFor({
    competition,
    occurrenceStart: competition.occurrenceStart ?? competition.startDate,
    competitions,
    results,
  });
  const slotsTotal = slotsForQualificationMethod(competition, "qualifier");
  return {
    qualifiedIds,
    slotsTotal,
    remaining: Math.max(0, slotsTotal - qualifiedIds.length),
  };
}
