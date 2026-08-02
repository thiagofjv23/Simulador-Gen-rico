// Momentum dinâmico de atletas e clubes. Deixa de ser estático: varia conforme
// os resultados. A ideia central é a "Expectativa de posição" — pelo ratingbase,
// o de maior rating é esperado em 1º, o segundo em 2º e assim por diante. Quem
// termina acima da sua expectativa ganha momentum; quem termina abaixo perde. A
// distância entre a posição final e a esperada dá o tamanho da variação.
//
// Regra do vencedor: vencer sempre eleva a moral. Por isso o vencedor de uma
// etapa NUNCA fica com delta negativo nem zero — ganha momentum mesmo quando já
// era o favorito. O tamanho desse ganho segue duas dimensões (ver
// `winnerMomentumGain`):
// - o prestígio da competição (competição mais prestigiada -> mais momentum);
// - a diferença de ratingbase para o rival mais forte que ele venceu. Quanto
//   maior o rating do vencedor frente ao rival, menor o ganho (favorito folgado
//   recebe só o piso); o inverso vale para a "zebra" — vencer alguém de rating
//   muito maior rende bem mais momentum.
//
// Casos:
// - Partida 1x1 (2 participantes ou partidas de liga): o vencedor ganha o bônus
//   de vitória (`winnerMomentumGain`); o perdedor só perde momentum em "zebra" (o
//   de rating maior perdeu para o de rating menor), proporcional à diferença.
// - Etapas com vários participantes: o vencedor ganha ao menos o bônus de
//   vitória; os demais variam pela distância da posição final para a esperada.
//
// Momentum fica sempre no intervalo -5..+5 (as cores da UI seguem esse padrão).
// Funções puras, para testes sem IndexedDB nem DOM.

export const MIN_MOMENTUM = -5;
export const MAX_MOMENTUM = 5;
// Variação máxima de momentum causada por uma única competição.
export const MAX_MOMENTUM_STEP = 3;
// Piso do ganho do vencedor: vencer sempre dá pelo menos +1 de momentum.
export const MIN_WINNER_MOMENTUM = 1;
// Diferença de ratingbase que satura o "fator zebra" (ganho/desconto máximo).
export const WINNER_RATING_SPAN = 40;

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

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

// Ganho de momentum garantido ao vencer uma etapa. Vencer sempre eleva a moral,
// então o resultado nunca fica abaixo de `MIN_WINNER_MOMENTUM`. O bônus soma dois
// componentes ao piso:
// - prestígio (0..1 => até +1): competição mais prestigiada rende mais;
// - fator zebra (-1..+1 => -2..+2): diferença de rating do vencedor para o rival
//   mais forte que venceu. Vencer alguém de rating muito maior (zebra) aumenta o
//   ganho; ser um favorito muito acima do rival puxa de volta para o piso.
// Resultado inteiro no intervalo `MIN_WINNER_MOMENTUM`..`MAX_MOMENTUM_STEP`.
export function winnerMomentumGain(prestige = 0, winnerRating = 0, rivalRating = 0) {
  const prestigeFactor = clamp01((Number(prestige) || 0) / 100); // 0..1
  const ratingGap = (Number(rivalRating) || 0) - (Number(winnerRating) || 0); // + = zebra
  const upsetFactor = Math.max(-1, Math.min(1, ratingGap / WINNER_RATING_SPAN)); // -1..+1
  const raw = MIN_WINNER_MOMENTUM + prestigeFactor + upsetFactor * 2;
  return Math.max(MIN_WINNER_MOMENTUM, Math.min(MAX_MOMENTUM_STEP, Math.round(raw)));
}

function addDelta(map, id, delta) {
  if (!id || !delta) return;
  map.set(id, (map.get(id) ?? 0) + delta);
}

// A partir de um resultado, calcula os deltas de momentum por entidade.
// - Resultados de liga (com `matches`): 1x1 por partida (empate não muda nada).
// - Demais resultados: 1x1 quando há 2 participantes; senão, expectativa de
//   posição sobre `standings`.
// O vencedor sempre ganha momentum (`winnerMomentumGain`), modulado pelo
// prestígio do resultado e pela diferença de rating para o rival mais forte.
// `ratingById` (opcional) completa o ratingbase quando o standing não o traz.
export function momentumDeltasForResult(result, ratingById = new Map()) {
  const deltas = new Map();
  const prestige = Number(result?.prestige) || 0;
  const ratingOf = (id, fallback) =>
    (Number.isFinite(fallback) ? fallback : undefined)
    ?? (ratingById.get(id)?.baseRating ?? ratingById.get(id) ?? 0);

  if (Array.isArray(result?.matches) && result.matches.length) {
    for (const match of result.matches) {
      if (match.homeGoals === match.awayGoals) continue; // empate
      const homeWon = match.homeGoals > match.awayGoals;
      const winnerId = homeWon ? match.homeId : match.awayId;
      const loserId = homeWon ? match.awayId : match.homeId;
      const winnerRating = ratingOf(winnerId);
      const loserRating = ratingOf(loserId);
      // Vencer sempre dá moral; o favorito derrotado só perde em zebra.
      addDelta(deltas, winnerId, winnerMomentumGain(prestige, winnerRating, loserRating));
      addDelta(deltas, loserId, -matchMomentumMagnitude(winnerRating, loserRating));
    }
    return deltas;
  }

  const standings = result?.standings ?? [];
  if (standings.length === 2) {
    const winner = standings.find((s) => s.position === 1);
    const loser = standings.find((s) => s.position === 2);
    if (winner && loser) {
      const winnerRating = ratingOf(winner.personId, winner.baseRating);
      const loserRating = ratingOf(loser.personId, loser.baseRating);
      addDelta(deltas, winner.personId, winnerMomentumGain(prestige, winnerRating, loserRating));
      addDelta(deltas, loser.personId, -matchMomentumMagnitude(winnerRating, loserRating));
    }
    return deltas;
  }

  const entries = standings.map((standing) => ({
    id: standing.personId,
    baseRating: ratingOf(standing.personId, standing.baseRating),
  }));
  const expected = expectedPositions(entries);
  const ratingByEntry = new Map(entries.map((entry) => [entry.id, entry.baseRating]));
  // Rating do rival mais forte que o vencedor superou (para dimensionar a zebra).
  const topRivalRatingFor = (winnerId) => {
    let best = -Infinity;
    for (const entry of entries) {
      if (entry.id === winnerId) continue;
      if (entry.baseRating > best) best = entry.baseRating;
    }
    return best === -Infinity ? 0 : best;
  };
  for (const standing of standings) {
    const positionDelta = positionMomentumDelta(
      standing.position,
      expected.get(standing.personId),
      standings.length,
    );
    if (standing.position === 1) {
      // O vencedor nunca fica abaixo do bônus de vitória; se a zebra por posição
      // for ainda maior, ela prevalece.
      const gain = winnerMomentumGain(
        prestige,
        ratingByEntry.get(standing.personId) ?? 0,
        topRivalRatingFor(standing.personId),
      );
      addDelta(deltas, standing.personId, Math.max(positionDelta, gain));
    } else {
      addDelta(deltas, standing.personId, positionDelta);
    }
  }
  return deltas;
}
