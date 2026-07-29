export const SPORTS = [
  {
    id: "sport_tennis",
    name: "Tênis",
    defaultScoringSystemId: "tennis-round-proportional",
    rankingModel: "cumulative",
  },
  {
    id: "sport_motorsport",
    name: "Automobilismo",
    defaultScoringSystemId: "formula1-grand-prix",
    rankingModel: "seasonal",
  },
];

export const MODALITIES = [
  {
    id: "modality_tennis_mens_singles",
    sportId: "sport_tennis",
    name: "Simples masculino",
    rankingModel: "cumulative",
  },
  {
    id: "modality_motorsport_formula1",
    sportId: "sport_motorsport",
    name: "Fórmula 1",
    rankingModel: "seasonal",
  },
  {
    id: "modality_motorsport_formula2",
    sportId: "sport_motorsport",
    name: "Fórmula 2",
    rankingModel: "seasonal",
  },
  {
    id: "modality_motorsport_formula3",
    sportId: "sport_motorsport",
    name: "Fórmula 3",
    rankingModel: "seasonal",
  },
];

export function modalitiesForSport(sportId, modalities = MODALITIES) {
  return modalities
    .filter((modality) => modality.sportId === sportId)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export function sportById(sportId, sports = SPORTS) {
  return sports.find((sport) => sport.id === sportId) ?? null;
}

export function modalityById(modalityId, modalities = MODALITIES) {
  return modalities.find((modality) => modality.id === modalityId) ?? null;
}

export function defaultScoringSystemForSport(sportId, sports = SPORTS) {
  return sportById(sportId, sports)?.defaultScoringSystemId
    ?? "generic-proportional";
}

export function validateSportSelection(
  { sportId, modalityId },
  sports = SPORTS,
  modalities = MODALITIES,
) {
  const errors = [];
  const sport = sportById(sportId, sports);
  const modality = modalityById(modalityId, modalities);

  if (!sport) errors.push("Escolha um esporte válido.");
  if (!modality) {
    errors.push("Escolha uma modalidade válida.");
  } else if (sport && modality.sportId !== sport.id) {
    errors.push("A modalidade escolhida não pertence ao esporte selecionado.");
  }

  return errors;
}
