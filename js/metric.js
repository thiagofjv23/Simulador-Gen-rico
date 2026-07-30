// Sistema de Pontuação e Métrica — como o resultado de cada participante é
// medido e pontuado dentro da etapa, depois que o Formato da Prova
// (js/eventformat.js) já definiu a ordem dos confrontos. É a camada anterior
// aos pontos de ranking, que continuam vindo de js/scoring.js.

export const RESULT_METRICS = [
  {
    id: "position-table",
    name: "Tabela de posição",
    description:
      "Cada colocação final vale uma pontuação fixa (ex.: 1º = 10, 2º = 8...). Boa para baterias, corridas e provas decididas pela colocação.",
  },
  {
    id: "match-score",
    name: "Placar de jogo",
    description:
      "Cada confronto vira vitória, empate ou derrota e rende pontos (ex.: 3 pela vitória, 1 pelo empate). Boa para os formatos de partidas 1x1.",
  },
  {
    id: "direct-mark",
    name: "Marca direta",
    description:
      "O resultado é o próprio número obtido — tempo, distância ou peso — e a classificação sai diretamente dele.",
  },
];

// Tipos de marca da "Marca direta". `direction` diz se menor (tempo) ou maior
// (distância, peso) é melhor.
export const MARK_TYPES = [
  { id: "time", name: "Tempo", unit: "s", direction: "asc", decimals: 2 },
  { id: "distance", name: "Distância", unit: "m", direction: "desc", decimals: 2 },
  { id: "weight", name: "Peso", unit: "kg", direction: "desc", decimals: 1 },
];

export const DEFAULT_POSITION_TABLE = [10, 8, 6, 5, 4, 3, 2, 1];
export const DEFAULT_MATCH_POINTS = { win: 3, draw: 1, loss: 0 };

export function resultMetricById(id) {
  return RESULT_METRICS.find((metric) => metric.id === id) ?? null;
}

export function resultMetricLabel(id) {
  return resultMetricById(id)?.name ?? "Não informado";
}

export function markTypeById(id) {
  return MARK_TYPES.find((markType) => markType.id === id) ?? null;
}

export function eventPointsForPosition(position, table = DEFAULT_POSITION_TABLE) {
  if (!Number.isInteger(position) || position < 1) return 0;
  return table[position - 1] ?? 0;
}

export function matchPointsFor(record, points = DEFAULT_MATCH_POINTS) {
  if (!record) return 0;
  return (record.wins ?? 0) * points.win
    + (record.draws ?? 0) * points.draw
    + (record.losses ?? 0) * points.loss;
}

// Converte a performance (0-100) na marca física do tipo escolhido. É uma
// transformação determinística e monótona: performance maior sempre gera uma
// marca melhor, então a marca combina com a posição da classificação.
export function computeMark(performance, markTypeId) {
  const markType = markTypeById(markTypeId) ?? MARK_TYPES[0];
  const value = Math.max(0, Math.min(100, Number(performance) || 0));
  let mark;
  if (markType.id === "time") {
    mark = 60 - value * 0.4; // ~60 s (fraco) a ~20 s (topo)
  } else if (markType.id === "distance") {
    mark = 2 + value * 0.18; // ~2 m a ~20 m
  } else {
    mark = 80 + value * 1.6; // ~80 kg a ~240 kg
  }
  return Number(Math.max(0, mark).toFixed(markType.decimals));
}

export function markIsBetter(a, b, markTypeId) {
  const direction = (markTypeById(markTypeId) ?? MARK_TYPES[0]).direction;
  return direction === "asc" ? a < b : a > b;
}

export function formatMark(mark, markTypeId) {
  const markType = markTypeById(markTypeId) ?? MARK_TYPES[0];
  return `${Number(mark).toFixed(markType.decimals)} ${markType.unit}`;
}

function formatRecord(record) {
  if (!record) return null;
  const parts = [`${record.wins ?? 0}V`];
  if ((record.draws ?? 0) > 0 || record.draws === 0) parts.push(`${record.draws ?? 0}E`);
  parts.push(`${record.losses ?? 0}D`);
  return parts.join(" ");
}

// Decora a classificação vinda do formato com a métrica escolhida: marca e
// rótulo (marca direta), placar/registro (placar de jogo) ou pontos por
// colocação (tabela de posição). Não reordena — a ordem vem do formato, que já
// é coerente com a marca.
export function applyResultMetric(standings = [], {
  metric = "position-table",
  markType = "time",
  matchPoints = DEFAULT_MATCH_POINTS,
  positionTable = DEFAULT_POSITION_TABLE,
} = {}) {
  return standings.map((standing) => {
    const decorated = {
      ...standing,
      metric,
      mark: null,
      markLabel: null,
      recordLabel: null,
      eventPoints: null,
    };

    if (metric === "direct-mark") {
      decorated.markType = markType;
      decorated.mark = computeMark(standing.performance, markType);
      decorated.markLabel = formatMark(decorated.mark, markType);
    } else if (metric === "match-score") {
      decorated.recordLabel = formatRecord(standing.record);
      decorated.eventPoints = standing.record
        ? matchPointsFor(standing.record, matchPoints)
        : standing.matchPoints ?? 0;
    } else {
      decorated.eventPoints = eventPointsForPosition(standing.position, positionTable);
    }

    return decorated;
  });
}
