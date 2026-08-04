// js/athletics.js
// Ranking do atletismo inspirado na World Athletics, mantendo só o essencial:
// cada etapa concede pontos (placing score, produzido pelo sistema de pontuação
// da competição) e o ranking de cada atleta é a MÉDIA das N melhores
// performances dentro de uma JANELA MÓVEL (12 meses na maioria; 18 nas provas
// longas e combinadas). Performances fora da janela expiram sozinhas, então o
// ranking nunca vira uma soma infinita.
//
// Tudo é reconstruído a partir dos resultados já persistidos — nenhum dado
// extra é gravado. As funções são puras para permitir testes sem IndexedDB.

import { MODALITIES, SPORTS, modalityById, sportById } from "./sports.js";

export const ROLLING_RANKING_MODEL = "rolling";

const DEFAULT_WINDOW_MONTHS = 12;
const DEFAULT_BEST_N = 5;
// Quantas performances válidas um atleta precisa ter para aparecer no ranking.
// A World Athletics exige o próprio N (5/3/2); aqui o padrão é 1 para que o
// ranking se popule desde a primeira competição do save. Pode ser elevado por
// modalidade (campo minPerformances) para fidelidade total ao sistema oficial.
const DEFAULT_MIN_PERFORMANCES = 1;

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Primeiro dia ainda válido para uma janela de `windowMonths` meses contados a
// partir de `referenceDateISO` (inclusive).
export function windowStartDate(referenceDateISO, windowMonths = DEFAULT_WINDOW_MONTHS) {
  const reference = new Date(`${referenceDateISO}T12:00:00`);
  const start = new Date(reference);
  start.setMonth(start.getMonth() - windowMonths);
  return toISODate(start);
}

export function isWithinWindow(
  performanceDateISO,
  referenceDateISO,
  windowMonths = DEFAULT_WINDOW_MONTHS,
) {
  const start = windowStartDate(referenceDateISO, windowMonths);
  return performanceDateISO >= start && performanceDateISO <= referenceDateISO;
}

// Configuração de janela/N de uma modalidade, com defaults seguros.
export function rankingConfigForModality(modalityId, modalities = MODALITIES) {
  const modality = modalityById(modalityId, modalities);
  return {
    windowMonths: modality?.windowMonths ?? DEFAULT_WINDOW_MONTHS,
    bestN: modality?.bestN ?? DEFAULT_BEST_N,
    minPerformances: modality?.minPerformances ?? DEFAULT_MIN_PERFORMANCES,
  };
}

// Extrai as performances individuais (uma por atleta por resultado) de um
// esporte+modalidade a partir da lista de resultados persistidos.
export function performanceRecordsFromResults(results = [], { sportId, modalityId } = {}) {
  const records = [];
  for (const result of results) {
    if (sportId && result.sportId !== sportId) continue;
    if (modalityId && result.modalityId !== modalityId) continue;
    const date = result.occurrenceEnd;
    for (const standing of result.standings ?? []) {
      records.push({
        personId: standing.personId,
        points: standing.pointsAwarded ?? 0,
        position: standing.position ?? null,
        date,
        competitionId: result.competitionId ?? null,
        competitionName: result.competitionName ?? null,
        prestige: result.prestige ?? null,
      });
    }
  }
  return records;
}

// Score de um atleta: média (arredondada para baixo, como no oficial) das
// `bestN` melhores performances válidas dentro da janela.
export function rollingRankingScore(records = [], {
  referenceDate,
  windowMonths = DEFAULT_WINDOW_MONTHS,
  bestN = DEFAULT_BEST_N,
  minPerformances = DEFAULT_MIN_PERFORMANCES,
} = {}) {
  const valid = records
    .filter((record) => isWithinWindow(record.date, referenceDate, windowMonths))
    .sort((a, b) => b.points - a.points || b.date.localeCompare(a.date));
  const counted = valid.slice(0, bestN);

  if (counted.length < minPerformances) {
    return { score: 0, counted: 0, valid: valid.length, ranked: false };
  }

  const sum = counted.reduce((total, record) => total + record.points, 0);
  return {
    score: Math.floor(sum / counted.length),
    counted: counted.length,
    valid: valid.length,
    ranked: true,
  };
}

// Constrói as entradas de ranking (já ordenadas e posicionadas) de uma única
// modalidade rolante, a partir dos resultados.
export function buildRollingRankingEntries(results = [], {
  sportId,
  modalityId,
  rankingId,
  referenceDate,
  previousPositionByPersonId = new Map(),
  updatedAt = `${referenceDate}T23:59:59.000Z`,
  modalities = MODALITIES,
} = {}) {
  const config = rankingConfigForModality(modalityId, modalities);
  const records = performanceRecordsFromResults(results, { sportId, modalityId });

  const byPerson = new Map();
  for (const record of records) {
    if (!byPerson.has(record.personId)) byPerson.set(record.personId, []);
    byPerson.get(record.personId).push(record);
  }

  const previousPosition = (personId) =>
    previousPositionByPersonId.get(personId) ?? Number.MAX_SAFE_INTEGER;

  return [...byPerson.entries()]
    .map(([personId, personRecords]) => {
      const { score, counted, valid, ranked } = rollingRankingScore(personRecords, {
        referenceDate,
        ...config,
      });
      return {
        id: `${rankingId}_${personId}`,
        rankingId,
        personId,
        points: score,
        eventsCount: counted,
        validPerformances: valid,
        ranked,
        sportId,
        modalityId,
        rankingModel: ROLLING_RANKING_MODEL,
        windowMonths: config.windowMonths,
        bestN: config.bestN,
        seasonYear: null,
        updatedAt,
      };
    })
    .filter((entry) => entry.ranked)
    .sort((a, b) =>
      b.points - a.points
      || previousPosition(a.personId) - previousPosition(b.personId)
      || a.personId.localeCompare(b.personId))
    .map((entry, index) => ({
      ...entry,
      position: index + 1,
      previousPosition: previousPositionByPersonId.get(entry.personId) ?? index + 1,
    }));
}

// Lista as modalidades cujo ranking é rolante (atletismo e futuros esportes que
// usem o mesmo modelo).
export function rollingModalities(modalities = MODALITIES, sports = SPORTS) {
  return modalities.filter((modality) => {
  // Boxe possui atualização própria por confronto e nunca deve ser
  // reconstruído pelo ranking rolante.
  if (modality.sportId === "sport_boxing") return false;

  const own = modality.rankingModel;
  const inherited = sportById(modality.sportId, sports)?.rankingModel;

  return (own ?? inherited) === ROLLING_RANKING_MODEL;
});
}

// Ponto único de integração para o app: recebe TODAS as entradas de ranking e
// substitui as das modalidades rolantes por versões recalculadas a partir dos
// resultados, preservando intactas as entradas de tênis, F1 etc.
//
// `rankingIdFor` é injetado pelo app (que já importa essa função de ranking.js),
// evitando dependência cruzada entre módulos.
export function mergeRollingRanking(rankingEntries = [], results = [], {
  referenceDate,
  rankingIdFor,
  updatedAt = `${referenceDate}T23:59:59.000Z`,
  modalities = MODALITIES,
  sports = SPORTS,
} = {}) {
  if (typeof rankingIdFor !== "function") {
    throw new TypeError("mergeRollingRanking requer a função rankingIdFor.");
  }

  const rolling = rollingModalities(modalities, sports);
  const rollingRankingIds = new Set(
    rolling.map((modality) => rankingIdFor(modality.sportId, modality.id)),
  );

  // Mapa personId -> posição anterior, por rankingId, a partir do estado atual.
  const previousByRankingId = new Map();
  for (const entry of rankingEntries) {
    if (!rollingRankingIds.has(entry.rankingId)) continue;
    if (!previousByRankingId.has(entry.rankingId)) {
      previousByRankingId.set(entry.rankingId, new Map());
    }
    previousByRankingId.get(entry.rankingId).set(entry.personId, entry.position);
  }

  const preserved = rankingEntries.filter(
    (entry) => !rollingRankingIds.has(entry.rankingId),
  );

  const rebuilt = rolling.flatMap((modality) => {
  const rankingId = rankingIdFor(modality.sportId, modality.id);

  const rankedEntries = buildRollingRankingEntries(results, {
    sportId: modality.sportId,
    modalityId: modality.id,
    rankingId,
    referenceDate,
    previousPositionByPersonId: previousByRankingId.get(rankingId) ?? new Map(),
    updatedAt,
    modalities,
  });

  const rankedPersonIds = new Set(
    rankedEntries.map((entry) => entry.personId),
  );

  const unrankedEntries = rankingEntries
    .filter(
      (entry) =>
        entry.rankingId === rankingId
        && !rankedPersonIds.has(entry.personId),
    )
    .sort(
      (a, b) =>
        a.position - b.position
        || a.personId.localeCompare(b.personId),
    )
    .map((entry, index) => {
      const position = rankedEntries.length + index + 1;

      return {
        ...entry,
        points: 0,
        eventsCount: 0,
        validPerformances: 0,
        ranked: false,
        position,
        previousPosition: entry.position ?? position,
        sportId: modality.sportId,
        modalityId: modality.id,
                rankingModel: ROLLING_RANKING_MODEL,
        updatedAt,
      };
    });

    return [...rankedEntries, ...unrankedEntries];
  });

  return [...preserved, ...rebuilt];
}