export const SCORING_SYSTEMS = [
  {
    id: "generic-proportional",
    name: "Proporcional genérico",
    description:
      "Distribui o valor máximo entre as oito primeiras posições: 100%, 70%, 50%, 35%, 25%, 15%, 10% e 5%.",
    mode: "proportional",
  },
  {
    id: "tennis-round-proportional",
    name: "Proporcional por rodadas (tênis)",
    description:
      "O campeão recebe 100%; finalista 65%; semifinalistas 40%; quartas 20%; oitavas 10%; segunda rodada 5%; primeira rodada 0,5%.",
    mode: "proportional",
  },
  {
    id: "formula1-grand-prix",
    name: "Fórmula 1 — Grandes Prêmios",
    description:
      "Pontuação fixa por etapa para os dez primeiros: 25, 18, 15, 12, 10, 8, 6, 4, 2 e 1 ponto.",
    mode: "fixed",
    winnerPoints: 25,
  },
];

const LEGACY_PERCENTAGES = [1, 0.7, 0.5, 0.35, 0.25, 0.15, 0.1, 0.05];
const FORMULA_1_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

export function scoringSystemById(scoringSystemId) {
  return SCORING_SYSTEMS.find(({ id }) => id === scoringSystemId) ?? null;
}

export function scoringSystemLabel(scoringSystemId) {
  return scoringSystemById(scoringSystemId)?.name ?? "Sistema não informado";
}

export function scoringSystemDescription(scoringSystemId) {
  return scoringSystemById(scoringSystemId)?.description ?? "";
}

export function pointsForPosition({
  scoringSystemId = "generic-proportional",
  winnerPoints = 100,
  position,
}) {
  if (!Number.isInteger(position) || position < 1) return 0;

  if (scoringSystemId === "formula1-grand-prix") {
    return FORMULA_1_POINTS[position - 1] ?? 0;
  }

  if (scoringSystemId === "tennis-round-proportional") {
    let percentage = 0.005;
    if (position === 1) percentage = 1;
    else if (position === 2) percentage = 0.65;
    else if (position <= 4) percentage = 0.4;
    else if (position <= 8) percentage = 0.2;
    else if (position <= 16) percentage = 0.1;
    else if (position <= 32) percentage = 0.05;
    return Math.round(winnerPoints * percentage);
  }

  return Math.round(winnerPoints * (LEGACY_PERCENTAGES[position - 1] ?? 0));
}

export function pointsPreview(scoringSystemId, winnerPoints = 100) {
  const limit = scoringSystemId === "formula1-grand-prix" ? 10 : 8;
  return Array.from({ length: limit }, (_, index) =>
    pointsForPosition({
      scoringSystemId,
      winnerPoints,
      position: index + 1,
    }));
}
