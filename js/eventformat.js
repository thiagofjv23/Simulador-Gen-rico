// Formato da Prova — a lógica de resolução de uma etapa: como os atletas se
// enfrentam para se chegar ao resultado final. Cada formato recebe os
// participantes (já com uma `performance` 0-100 calculada) e um sorteador
// determinístico `random`, e devolve a classificação (posições 1..N) mais os
// dados estruturais do confronto (placar, número da bateria, vitórias...).
//
// Este módulo cuida só do "como se enfrentam"; a métrica/pontuação de cada
// resultado (tempo, placar de jogo, tabela de posição) fica em js/metric.js.

export const EVENT_FORMATS = [
  {
    id: "individual-ranking",
    name: "Ranqueamento individual",
    group: "mark",
    description:
      "Todos fazem a mesma prova e são ranqueados pela própria marca, do melhor para o pior. Ex.: salto, arremesso, contrarrelógio.",
  },
  {
    id: "heats",
    name: "Baterias / corridas",
    group: "mark",
    description:
      "Os participantes são divididos em grupos que competem juntos na mesma pista ou raia; a classificação final junta todas as baterias.",
  },
  {
    id: "round-robin",
    name: "Todos contra todos",
    group: "head-to-head",
    description:
      "Cada participante enfrenta todos os outros em confrontos 1x1; a classificação vem da soma dos pontos de cada jogo.",
  },
  {
    id: "single-elimination",
    name: "Eliminação simples",
    group: "head-to-head",
    description:
      "Confrontos 1x1 em chave: quem perde está fora. Uma única derrota elimina o participante.",
  },
  {
    id: "double-elimination",
    name: "Eliminação dupla",
    group: "head-to-head",
    description:
      "Como a eliminação simples, mas só é eliminado quem perde duas vezes — há uma segunda chance.",
  },
  {
    id: "swiss",
    name: "Sistema suíço",
    group: "head-to-head",
    description:
      "Número fixo de rodadas; a cada rodada o participante enfrenta alguém com pontuação parecida, sem eliminação direta.",
  },
];

const HEAD_TO_HEAD = new Set(["round-robin", "single-elimination", "double-elimination", "swiss"]);

export function eventFormatById(id) {
  return EVENT_FORMATS.find((format) => format.id === id) ?? null;
}

export function eventFormatLabel(id) {
  return eventFormatById(id)?.name ?? "Não informado";
}

export function eventFormatGroup(id) {
  return eventFormatById(id)?.group ?? null;
}

export function isHeadToHeadFormat(id) {
  return HEAD_TO_HEAD.has(id);
}

const DEFAULT_MATCH_POINTS = { win: 3, draw: 1, loss: 0 };

// Ordenação estável de desempate: melhor performance, depois melhor semente
// (menor previousRankingPosition) e por fim o ID, para ser determinística.
function bySeed(a, b) {
  return (
    b.performance - a.performance
    || (a.seed ?? 0) - (b.seed ?? 0)
    || String(a.personId).localeCompare(String(b.personId))
  );
}

function noisy(performance, random, amplitude = 6) {
  return performance + (random() - 0.5) * amplitude;
}

function matchPointsFor(record, points) {
  return record.wins * points.win + record.draws * points.draw + record.losses * points.loss;
}

// Resolve um confronto 1x1 e devolve um placar inteiro (estilo "gols/sets") a
// partir das performances. Empate só quando `allowDraw`; senão, o placar
// empatado é desfeito por um desempate de performance.
export function resolveMatch(a, b, random, { allowDraw = false } = {}) {
  const scoreA = Math.max(0, Math.round(a.performance / 12 + (random() * 3 - 1.5)));
  const scoreB = Math.max(0, Math.round(b.performance / 12 + (random() * 3 - 1.5)));
  if (scoreA === scoreB) {
    if (allowDraw) return { winnerId: null, scoreA, scoreB };
    const edge = noisy(a.performance, random) - noisy(b.performance, random);
    const winnerId = edge >= 0 ? a.personId : b.personId;
    return { winnerId, scoreA, scoreB, decidedByTiebreak: true };
  }
  return { winnerId: scoreA > scoreB ? a.personId : b.personId, scoreA, scoreB };
}

function resolveIndividual(participants) {
  return [...participants].sort(bySeed).map((participant, index) => ({
    personId: participant.personId,
    performance: participant.performance,
    position: index + 1,
  }));
}

function resolveHeats(participants, heatSize) {
  const size = Math.max(2, Math.floor(heatSize) || 8);
  const seeded = [...participants].sort(bySeed);
  const heatCount = Math.max(1, Math.ceil(seeded.length / size));
  const heats = Array.from({ length: heatCount }, () => []);

  // Distribuição em serpentina: espalha as sementes para equilibrar as baterias.
  seeded.forEach((participant, index) => {
    const row = Math.floor(index / heatCount);
    const column = index % heatCount;
    const heatIndex = row % 2 === 0 ? column : heatCount - 1 - column;
    heats[heatIndex].push(participant);
  });

  // A marca é absoluta (como o tempo), então a classificação geral sai da
  // performance; a bateria é o agrupamento, com posição dentro do grupo.
  const heatInfo = new Map();
  heats.forEach((heat, heatIndex) => {
    [...heat].sort(bySeed).forEach((participant, positionInHeat) => {
      heatInfo.set(participant.personId, {
        heatNumber: heatIndex + 1,
        heatPosition: positionInHeat + 1,
      });
    });
  });

  return [...participants].sort(bySeed).map((participant, index) => ({
    personId: participant.personId,
    performance: participant.performance,
    position: index + 1,
    heatNumber: heatInfo.get(participant.personId).heatNumber,
    heatPosition: heatInfo.get(participant.personId).heatPosition,
    heatCount,
  }));
}

function resolveRoundRobin(participants, random, matchPoints, allowDraw) {
  const records = new Map(
    participants.map((participant) => [
      participant.personId,
      { wins: 0, draws: 0, losses: 0, scored: 0, conceded: 0 },
    ]),
  );

  for (let i = 0; i < participants.length; i += 1) {
    for (let j = i + 1; j < participants.length; j += 1) {
      const a = participants[i];
      const b = participants[j];
      const match = resolveMatch(a, b, random, { allowDraw });
      const ra = records.get(a.personId);
      const rb = records.get(b.personId);
      ra.scored += match.scoreA;
      ra.conceded += match.scoreB;
      rb.scored += match.scoreB;
      rb.conceded += match.scoreA;
      if (match.winnerId === null) {
        ra.draws += 1;
        rb.draws += 1;
      } else if (match.winnerId === a.personId) {
        ra.wins += 1;
        rb.losses += 1;
      } else {
        rb.wins += 1;
        ra.losses += 1;
      }
    }
  }

  return participants
    .map((participant) => {
      const record = records.get(participant.personId);
      return {
        ...participant,
        record,
        matchPoints: matchPointsFor(record, matchPoints),
      };
    })
    .sort((a, b) =>
      b.matchPoints - a.matchPoints
      || (b.record.scored - b.record.conceded) - (a.record.scored - a.record.conceded)
      || bySeed(a, b))
    .map((participant, index) => ({
      personId: participant.personId,
      performance: participant.performance,
      position: index + 1,
      record: participant.record,
      matchPoints: participant.matchPoints,
    }));
}

function resolveSingleElimination(participants, random) {
  let alive = [...participants].sort(bySeed).map((participant) => ({ ...participant, wins: 0 }));
  const eliminatedByRound = [];

  while (alive.length > 1) {
    alive.sort(bySeed);
    const advancing = [];
    const eliminated = [];
    let bracket = alive;
    if (bracket.length % 2 === 1) {
      advancing.push(bracket[0]); // melhor semente ganha bye
      bracket = bracket.slice(1);
    }
    for (let i = 0; i < bracket.length / 2; i += 1) {
      const a = bracket[i];
      const b = bracket[bracket.length - 1 - i];
      const match = resolveMatch(a, b, random, { allowDraw: false });
      const winner = match.winnerId === a.personId ? a : b;
      const loser = match.winnerId === a.personId ? b : a;
      winner.wins += 1;
      advancing.push(winner);
      eliminated.push(loser);
    }
    eliminatedByRound.push(eliminated);
    alive = advancing;
  }

  const ordered = [...alive];
  for (let round = eliminatedByRound.length - 1; round >= 0; round -= 1) {
    ordered.push(...[...eliminatedByRound[round]].sort(bySeed));
  }
  return ordered.map((participant, index) => ({
    personId: participant.personId,
    performance: participant.performance,
    position: index + 1,
    wins: participant.wins ?? 0,
  }));
}

function resolveDoubleElimination(participants, random) {
  let alive = [...participants].sort(bySeed).map((participant) => ({ ...participant, wins: 0, losses: 0 }));
  const eliminationOrder = [];
  let guard = 0;

  while (alive.length > 1 && guard < 2000) {
    guard += 1;
    // Agrupa por número de derrotas (0 = chave dos vencedores, 1 = repescagem).
    alive.sort((a, b) => a.losses - b.losses || bySeed(a, b));
    const next = [];
    let bracket = alive;
    if (bracket.length % 2 === 1) {
      next.push(bracket[0]);
      bracket = bracket.slice(1);
    }
    for (let i = 0; i < bracket.length; i += 2) {
      const a = bracket[i];
      const b = bracket[i + 1];
      const match = resolveMatch(a, b, random, { allowDraw: false });
      const winner = match.winnerId === a.personId ? a : b;
      const loser = match.winnerId === a.personId ? b : a;
      winner.wins += 1;
      loser.losses += 1;
      next.push(winner);
      if (loser.losses >= 2) {
        eliminationOrder.push(loser);
      } else {
        next.push(loser);
      }
    }
    alive = next;
  }

  const ordered = [...alive, ...eliminationOrder.reverse()];
  return ordered.map((participant, index) => ({
    personId: participant.personId,
    performance: participant.performance,
    position: index + 1,
    wins: participant.wins ?? 0,
    losses: participant.losses ?? 0,
  }));
}

function resolveSwiss(participants, random, matchPoints, rounds) {
  const roundCount = Math.max(
    1,
    Math.floor(rounds) || Math.ceil(Math.log2(Math.max(2, participants.length))),
  );
  const state = new Map(
    participants.map((participant) => [
      participant.personId,
      { ...participant, wins: 0, draws: 0, losses: 0, opponents: new Set() },
    ]),
  );
  const pointsOf = (player) =>
    matchPointsFor({ wins: player.wins, draws: player.draws, losses: player.losses }, matchPoints);

  for (let round = 0; round < roundCount; round += 1) {
    const standings = [...state.values()].sort((a, b) => pointsOf(b) - pointsOf(a) || bySeed(a, b));
    const paired = new Set();
    for (let i = 0; i < standings.length; i += 1) {
      const a = standings[i];
      if (paired.has(a.personId)) continue;
      let b = standings
        .slice(i + 1)
        .find((candidate) => !paired.has(candidate.personId) && !a.opponents.has(candidate.personId));
      if (!b) {
        b = standings.slice(i + 1).find((candidate) => !paired.has(candidate.personId));
      }
      if (!b) {
        a.wins += 1; // bye
        paired.add(a.personId);
        continue;
      }
      paired.add(a.personId);
      paired.add(b.personId);
      a.opponents.add(b.personId);
      b.opponents.add(a.personId);
      const match = resolveMatch(a, b, random, { allowDraw: true });
      if (match.winnerId === null) {
        a.draws += 1;
        b.draws += 1;
      } else if (match.winnerId === a.personId) {
        a.wins += 1;
        b.losses += 1;
      } else {
        b.wins += 1;
        a.losses += 1;
      }
    }
  }

  return [...state.values()]
    .sort((a, b) => pointsOf(b) - pointsOf(a) || bySeed(a, b))
    .map((participant, index) => ({
      personId: participant.personId,
      performance: participant.performance,
      position: index + 1,
      record: { wins: participant.wins, draws: participant.draws, losses: participant.losses },
      matchPoints: pointsOf(participant),
    }));
}

// Resolve a etapa e devolve a classificação com os dados estruturais do
// confronto. `metric` (opcional) só influencia aqui se os confrontos podem
// empatar (placar de jogo permite empate); a decoração numérica fica em
// js/metric.js.
export function resolveStage({
  participants = [],
  format = "individual-ranking",
  metric = "position-table",
  heatSize = 8,
  matchPoints = DEFAULT_MATCH_POINTS,
  swissRounds = null,
  random = Math.random,
} = {}) {
  const chosen = eventFormatById(format) ? format : "individual-ranking";
  const allowDraw = metric === "match-score";

  switch (chosen) {
    case "heats":
      return resolveHeats(participants, heatSize);
    case "round-robin":
      return resolveRoundRobin(participants, random, matchPoints, allowDraw);
    case "single-elimination":
      return resolveSingleElimination(participants, random);
    case "double-elimination":
      return resolveDoubleElimination(participants, random);
    case "swiss":
      return resolveSwiss(participants, random, matchPoints, swissRounds);
    default:
      return resolveIndividual(participants);
  }
}
