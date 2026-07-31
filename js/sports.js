import {
  ENTITY_TYPES,
  DEFAULT_ENTITY_TYPE,
  TEAM_RATING_MODELS,
  DEFAULT_TEAM_RATING_MODEL,
  normalizeTeamWeight,
} from "./clubs.js";

// Cada esporte declara o tipo de entidade que o disputa (entityType):
//   - "atleta": só atletas individuais (tênis, atletismo)
//   - "equipe": só equipes (futebol, basquete)
//   - "mista":  atletas e equipes no mesmo campeonato (automobilismo)
export const SPORTS = [
  {
    id: "sport_tennis",
    name: "Tênis",
    defaultScoringSystemId: "tennis-round-proportional",
    rankingModel: "cumulative",
    entityType: "atleta",
  },
  {
    id: "sport_motorsport",
    name: "Automobilismo",
    defaultScoringSystemId: "formula1-grand-prix",
    rankingModel: "seasonal",
    entityType: "mista",
  },
  {
    id: "sport_athletics",
    name: "Atletismo",
    defaultScoringSystemId: "generic-proportional",
    rankingModel: "rolling",
    entityType: "atleta",
  },
  {
    id: "sport_football",
    name: "Futebol",
    defaultScoringSystemId: "generic-proportional",
    rankingModel: "seasonal",
    entityType: "equipe",
  },
];

// Modalidades de futebol: cada liga nacional é uma modalidade com seu próprio
// campeonato de pontos corridos (turno e returno). O esporte é só de equipes.
const FOOTBALL_MODALITIES = [
  {
    id: "modality_football_brasileirao",
    sportId: "sport_football",
    name: "Campeonato Brasileiro Série A",
    rankingModel: "seasonal",
  },
  {
    id: "modality_football_jleague",
    sportId: "sport_football",
    name: "J1 League",
    rankingModel: "seasonal",
  },
];

// Modalidades individuais olímpicas do atletismo. Provas de revezamento
// (4x100 m, 4x400 m e o revezamento misto) ficam de fora enquanto o motor
// simular apenas disputas individuais.
//
// windowMonths e bestN espelham a base da World Athletics: a maioria usa 12
// meses e média das 5 melhores; provas de fundo/combinadas usam janela de 18
// meses e menos performances (5000 m e obstáculos ficam em 12 meses mas com N
// menor, como no sistema oficial).
const ATHLETICS_MODALITY_DEFS = [
  // Corridas rasas
  { id: "modality_athletics_100m", name: "100 metros rasos", windowMonths: 12, bestN: 5 },
  { id: "modality_athletics_200m", name: "200 metros rasos", windowMonths: 12, bestN: 5 },
  { id: "modality_athletics_400m", name: "400 metros rasos", windowMonths: 12, bestN: 5 },
  { id: "modality_athletics_800m", name: "800 metros", windowMonths: 12, bestN: 5 },
  { id: "modality_athletics_1500m", name: "1500 metros", windowMonths: 12, bestN: 5 },
  { id: "modality_athletics_5000m", name: "5000 metros", windowMonths: 12, bestN: 3 },
  { id: "modality_athletics_10000m", name: "10000 metros", windowMonths: 18, bestN: 2 },
  // Barreiras e obstáculos
  { id: "modality_athletics_100m_hurdles", name: "100 metros com barreiras", windowMonths: 12, bestN: 5 },
  { id: "modality_athletics_110m_hurdles", name: "110 metros com barreiras", windowMonths: 12, bestN: 5 },
  { id: "modality_athletics_400m_hurdles", name: "400 metros com barreiras", windowMonths: 12, bestN: 5 },
  { id: "modality_athletics_3000m_steeplechase", name: "3000 metros com obstáculos", windowMonths: 12, bestN: 3 },
  // Fundo e rua
  { id: "modality_athletics_marathon", name: "Maratona", windowMonths: 18, bestN: 2 },
  { id: "modality_athletics_20km_race_walk", name: "20 km de marcha atlética", windowMonths: 18, bestN: 2 },
  { id: "modality_athletics_35km_race_walk", name: "35 km de marcha atlética", windowMonths: 18, bestN: 2 },
  // Saltos
  { id: "modality_athletics_long_jump", name: "Salto em distância", windowMonths: 12, bestN: 5 },
  { id: "modality_athletics_triple_jump", name: "Salto triplo", windowMonths: 12, bestN: 5 },
  { id: "modality_athletics_high_jump", name: "Salto em altura", windowMonths: 12, bestN: 5 },
  { id: "modality_athletics_pole_vault", name: "Salto com vara", windowMonths: 12, bestN: 5 },
  // Lançamentos e arremesso
  { id: "modality_athletics_shot_put", name: "Arremesso de peso", windowMonths: 12, bestN: 5 },
  { id: "modality_athletics_discus_throw", name: "Lançamento de disco", windowMonths: 12, bestN: 5 },
  { id: "modality_athletics_javelin_throw", name: "Lançamento de dardo", windowMonths: 12, bestN: 5 },
  { id: "modality_athletics_hammer_throw", name: "Lançamento de martelo", windowMonths: 12, bestN: 5 },
  // Provas combinadas
  { id: "modality_athletics_decathlon", name: "Decatlo", windowMonths: 18, bestN: 2 },
  { id: "modality_athletics_heptathlon", name: "Heptatlo", windowMonths: 18, bestN: 2 },
];

const ATHLETICS_MODALITIES = ATHLETICS_MODALITY_DEFS.map((modality) => ({
  ...modality,
  sportId: "sport_athletics",
  rankingModel: "rolling",
}));

export const MODALITIES = [
  {
    id: "modality_tennis_mens_singles",
    sportId: "sport_tennis",
    name: "Simples masculino",
    rankingModel: "cumulative",
  },
  // Automobilismo é misto (atletas + equipes). A Fórmula 1 tem carros
  // construídos pela própria equipe, então o rating da equipe influencia a
  // etapa (modelo "weighted", peso alto). As categorias de monoposto padrão
  // (F2, F3 e Regionais) usam o mesmo chassi para todos, então a equipe não
  // influencia a prova (modelo "independent", peso 0) — mas continuam mistas,
  // para que o ranking de equipe (soma dos atletas) se crie do mesmo jeito.
  {
    id: "modality_motorsport_formula1",
    sportId: "sport_motorsport",
    name: "Fórmula 1",
    rankingModel: "seasonal",
    teamRatingModel: "weighted",
    teamWeight: 60,
  },
  {
    id: "modality_motorsport_formula2",
    sportId: "sport_motorsport",
    name: "Fórmula 2",
    rankingModel: "seasonal",
    teamRatingModel: "independent",
    teamWeight: 0,
  },
  {
    id: "modality_motorsport_formula3",
    sportId: "sport_motorsport",
    name: "Fórmula 3",
    rankingModel: "seasonal",
    teamRatingModel: "independent",
    teamWeight: 0,
  },
  {
    id: "modality_motorsport_formula_regional",
    sportId: "sport_motorsport",
    name: "Fórmula Regional Europeia",
    rankingModel: "seasonal",
    teamRatingModel: "independent",
    teamWeight: 0,
  },
  {
    id: "modality_motorsport_formula_regional_middle_east",
    sportId: "sport_motorsport",
    name: "Fórmula Regional Oriente Médio",
    rankingModel: "seasonal",
    teamRatingModel: "independent",
    teamWeight: 0,
  },
  ...ATHLETICS_MODALITIES,
  ...FOOTBALL_MODALITIES,
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

// Tipo de entidade (atleta/equipe/mista) que disputa o esporte, com um padrão
// seguro para esportes sem o campo declarado.
export function entityTypeForSport(sportId, sports = SPORTS) {
  const entityType = sportById(sportId, sports)?.entityType;
  return ENTITY_TYPES[entityType] ? entityType : DEFAULT_ENTITY_TYPE;
}

// Esportes que aceitam equipes (só de equipes ou mistos). Usado, por exemplo,
// para filtrar os seletores da futura tela de Equipes.
export function sportAllowsClubs(sportId, sports = SPORTS) {
  return ENTITY_TYPES[entityTypeForSport(sportId, sports)].allowsClubs;
}

// Esportes que aceitam atletas individuais (só de atletas ou mistos).
export function sportAllowsAthletes(sportId, sports = SPORTS) {
  return ENTITY_TYPES[entityTypeForSport(sportId, sports)].allowsAthletes;
}

// Configuração de rating de equipe de uma modalidade: o modelo (independent ou
// weighted) e o peso efetivo. No modelo independent o peso é sempre 0. Serve de
// padrão para as competições da modalidade; cada competição pode sobrescrever.
export function teamRatingConfigForModality(modalityId, modalities = MODALITIES) {
  const modality = modalityById(modalityId, modalities);
  const model = TEAM_RATING_MODELS[modality?.teamRatingModel]
    ? modality.teamRatingModel
    : DEFAULT_TEAM_RATING_MODEL;
  const weight = model === "weighted" ? normalizeTeamWeight(modality?.teamWeight ?? 0) : 0;
  return { teamRatingModel: model, teamWeight: weight };
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
