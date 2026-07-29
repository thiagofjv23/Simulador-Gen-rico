// Central dos Esportes: transforma resultados persistentes em notícias,
// destaques de rating e painéis de vencedores. Todas as funções são puras
// para permitir testes sem IndexedDB nem DOM.

function resultTimestamp(result) {
  return result.simulatedAt ?? `${result.occurrenceEnd}T23:59:59.000Z`;
}

// Resultados do mais recente para o mais antigo, com desempate estável.
export function resultsByRecency(results = []) {
  return [...results].sort((a, b) =>
    b.occurrenceEnd.localeCompare(a.occurrenceEnd)
    || resultTimestamp(b).localeCompare(resultTimestamp(a))
    || (a.competitionName ?? "").localeCompare(b.competitionName ?? "", "pt-BR"),
  );
}

// Cada resultado vira uma notícia de "evento finalizado". Quando o resultado
// também encerra uma temporada, uma segunda notícia de "campeonato concluído"
// é acrescentada com o campeão e um destino para o ranking final.
export function buildNewsFeed(results = [], { limit = 12 } = {}) {
  const news = [];

  for (const result of results) {
    const winner = result.standings?.[0] ?? null;
    const timestamp = resultTimestamp(result);
    const disciplineLabel = [result.sport, result.discipline]
      .filter(Boolean)
      .join(" · ");

    news.push({
      id: `news_event_${result.id}`,
      kind: "event-finished",
      date: result.occurrenceEnd,
      timestamp,
      title: `${result.competitionName} foi finalizada`,
      summary: winner
        ? `${winner.name} venceu entre ${result.participantCount} participantes.`
        : `A competição terminou com ${result.participantCount ?? 0} participantes.`,
      disciplineLabel,
      link: { target: "result", resultId: result.id, label: "Ver resultado" },
    });

    if (result.seasonChampion) {
      const champion = result.seasonChampion;
      news.push({
        id: `news_season_${result.id}`,
        kind: "season-finished",
        date: result.occurrenceEnd,
        timestamp,
        title: `${champion.seasonName ?? result.seasonName ?? "Temporada"} chegou ao fim`,
        summary: `${champion.name} conquistou o título de ${champion.seasonYear} com ${champion.points} pts.`,
        disciplineLabel,
        link: {
          target: "season-ranking",
          seasonId: result.seasonId ?? champion.seasonId ?? null,
          seasonYear: champion.seasonYear ?? null,
          sportId: result.sportId ?? null,
          modalityId: result.modalityId ?? null,
          label: "Ver ranking final",
        },
      });
    }
  }

  return news
    .sort((a, b) =>
      b.date.localeCompare(a.date)
      || b.timestamp.localeCompare(a.timestamp)
      // Notícia de campeonato aparece acima da notícia da etapa do mesmo dia.
      || (a.kind === "season-finished" ? -1 : 1)
      - (b.kind === "season-finished" ? -1 : 1),
    )
    .slice(0, limit);
}

// "Os Melhores": esportistas com os maiores ratings entre todos, do maior para
// o menor. Considera apenas pessoas já vinculadas a um esporte (rankeadas).
export function topAthletesByRating(people = [], { limit = 10 } = {}) {
  return [...people]
    .filter((person) => person.sportId && person.modalityId)
    .sort((a, b) =>
      b.baseRating - a.baseRating
      || b.momentum - a.momentum
      || a.name.localeCompare(b.name, "pt-BR"),
    )
    .slice(0, limit)
    .map((person, index) => ({ rank: index + 1, person }));
}

// Painel dos últimos torneios concluídos, cada um com os três primeiros
// colocados. Temporadas continuam contando como um resultado por etapa.
export function latestTournamentWinners(results = [], { count = 4, podiumSize = 3 } = {}) {
  return resultsByRecency(results)
    .slice(0, count)
    .map((result) => ({
      resultId: result.id,
      competitionName: result.competitionName,
      disciplineLabel: [result.sport, result.discipline].filter(Boolean).join(" · "),
      date: result.occurrenceEnd,
      prestige: result.prestige ?? null,
      podium: (result.standings ?? []).slice(0, podiumSize).map((standing) => ({
        position: standing.position,
        personId: standing.personId,
        name: standing.name,
        countryCode: standing.countryCode,
      })),
    }));
}
