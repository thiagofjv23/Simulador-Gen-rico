// Momentum dinâmico de atletas e clubes. Deixa de ser estático: varia conforme
// os resultados. A ideia central é a "Expectativa de posição" — pelo ratingbase,
// o de maior rating é esperado em 1º, o segundo em 2º e assim por diante. Quem
// termina acima da sua expectativa ganha momentum; quem termina abaixo perde. A
// distância entre a posição final e a esperada dá o tamanho da variação.
//
// Casos:
// - Partida 1x1 (2 participantes ou partidas de liga): a variação é direta e
//   proporcional à diferença de ratingbase — só há mudança em "zebra" (o de
//   rating maior perde para o de rating menor); nesse caso o perdedor perde
//   momentum e o vencedor ganha, tanto mais quanto maior a diferença de rating.
// - Etapas com vários participantes: a variação vem da distância da posição
//   final para a esperada, normalizada pelo tamanho do grid.
//
// Momentum fica sempre no intervalo -5..+5 (as cores da UI seguem esse padrão).
// Funções puras, para testes sem IndexedDB nem DOM.

export const MIN_MOMENTUM = -5;
export const MAX_MOMENTUM = 5;
// Variação máxima de momentum causada por uma única competição.
export const MAX_MOMENTUM_STEP = 3;

export function clampMomentum(value) {
  return Math.max(MIN_MOMENTUM, Math.min(MAX_MOMENTUM, Math.round(value)));
}

// Expectativa de posição: ordena por ratingbase (desc) e atribui 1º ao maior
// rating, 2º ao seguinte, etc. Empates são desfeitos pelo id (determinístico).
export function expectedPositions(entries = []) {
  const ordered = [...entries].sort((a, b) =>
    (b.baseRating ?? 0) - (a.baseRating ?? 0)
    || String(a.id).localeCompare(String(b.id)));
  const positions = new Map();
  ordered.forEach((entry, index) => positions.set(entry.id, index + 1));
  return positions;
}

// Delta de momentum de um participante numa etapa com vários competidores.
export function positionMomentumDelta(finalPosition, expectedPosition, participantCount) {
  if (participantCount < 2 || !expectedPosition || !finalPosition) return 0;
  const positionDelta = expectedPosition - finalPosition; // + = superou a expectativa
  if (positionDelta === 0) return 0;
  const relative = positionDelta / (participantCount - 1); // -1..+1
  return Math.max(-MAX_MOMENTUM_STEP, Math.min(MAX_MOMENTUM_STEP, Math.round(relative * MAX_MOMENTUM_STEP)));
}

// Magnitude do delta de uma partida 1x1: proporcional à diferença de ratingbase.
// Só é > 0 em zebra (o vencedor tinha rating menor que o perdedor).
export function matchMomentumMagnitude(winnerRating = 0, loserRating = 0) {
  const upset = loserRating - winnerRating; // + = zebra
  if (upset <= 0) return 0;
  return Math.max(1, Math.min(MAX_MOMENTUM_STEP, Math.round(1 + upset / 40)));
}

function addDelta(map, id, delta) {
  if (!id || !delta) return;
  map.set(id, (map.get(id) ?? 0) + delta);
}

// A partir de um resultado, calcula os deltas de momentum por entidade.
// - Resultados de liga (com `matches`): 1x1 por partida (empate não muda nada).
// - Demais resultados: 1x1 quando há 2 participantes; senão, expectativa de
//   posição sobre `standings`.
// `ratingById` (opcional) completa o ratingbase quando o standing não o traz.
export function momentumDeltasForResult(result, ratingById = new Map()) {
  const deltas = new Map();
  const ratingOf = (id, fallback) =>
    (Number.isFinite(fallback) ? fallback : undefined)
    ?? (ratingById.get(id)?.baseRating ?? ratingById.get(id) ?? 0);

  if (Array.isArray(result?.matches) && result.matches.length) {
    for (const match of result.matches) {
      if (match.homeGoals === match.awayGoals) continue; // empate
      const homeWon = match.homeGoals > match.awayGoals;
      const winnerId = homeWon ? match.homeId : match.awayId;
      const loserId = homeWon ? match.awayId : match.homeId;
      const magnitude = matchMomentumMagnitude(ratingOf(winnerId), ratingOf(loserId));
      addDelta(deltas, winnerId, magnitude);
      addDelta(deltas, loserId, -magnitude);
    }
    return deltas;
  }

  const standings = result?.standings ?? [];
  if (standings.length === 2) {
    const winner = standings.find((s) => s.position === 1);
    const loser = standings.find((s) => s.position === 2);
    if (winner && loser) {
      const magnitude = matchMomentumMagnitude(
        ratingOf(winner.personId, winner.baseRating),
        ratingOf(loser.personId, loser.baseRating),
      );
      addDelta(deltas, winner.personId, magnitude);
      addDelta(deltas, loser.personId, -magnitude);
    }
    return deltas;
  }

  const entries = standings.map((standing) => ({
    id: standing.personId,
    baseRating: ratingOf(standing.personId, standing.baseRating),
  }));
  const expected = expectedPositions(entries);
  for (const standing of standings) {
    addDelta(
      deltas,
      standing.personId,
      positionMomentumDelta(standing.position, expected.get(standing.personId), standings.length),
    );
  }
  return deltas;
}
