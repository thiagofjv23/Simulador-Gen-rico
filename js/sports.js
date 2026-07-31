import {
  ENTITY_TYPES,
  DEFAULT_ENTITY_TYPE,
  TEAM_RATING_MODELS,
  DEFAULT_TEAM_RATING_MODEL,
  normalizeTeamWeight,
} from "./clubs.js";

// Catálogo oficial de esportes do jogo. Cada esporte declara o tipo de entidade
// que o disputa (entityType): "atleta" (só atletas individuais), "equipe" (só
// equipes) ou "mista" (atletas e equipes no mesmo campeonato). Todo dado ligado
// a esporte (modalidades, presets, equipes, atletas) referencia um id daqui.
export const SPORTS = [
  {
    id: "sport_aquatics",
    name: "Esportes Aquáticos",
    defaultScoringSystemId: "generic-proportional",
    rankingModel: "rolling",
    entityType: "mista",
  },
  {
    id: "sport_archery",
    name: "Tiro com Arco",
    defaultScoringSystemId: "set-points-proportional",
    rankingModel: "rolling",
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
    id: "sport_badminton",
    name: "Badminton",
    defaultScoringSystemId: "sets-proportional",
    rankingModel: "cumulative",
    entityType: "mista",
  },
  {
    id: "sport_baseball_softball",
    name: "Beisebol e Softbol",
    defaultScoringSystemId: "runs-proportional",
    rankingModel: "seasonal",
    entityType: "equipe",
  },
  {
    id: "sport_basketball",
    name: "Basquete",
    defaultScoringSystemId: "points-proportional",
    rankingModel: "seasonal",
    entityType: "equipe",
  },
  {
    id: "sport_boxing",
    name: "Boxe",
    defaultScoringSystemId: "judged-rounds",
    rankingModel: "rolling",
    entityType: "atleta",
  },
  {
    id: "sport_canoeing",
    name: "Canoagem",
    defaultScoringSystemId: "time-proportional",
    rankingModel: "rolling",
    entityType: "mista",
  },
  {
    id: "sport_cricket",
    name: "Críquete",
    defaultScoringSystemId: "runs-wickets-proportional",
    rankingModel: "seasonal",
    entityType: "equipe",
  },
  {
    id: "sport_cycling",
    name: "Ciclismo",
    defaultScoringSystemId: "time-proportional",
    rankingModel: "rolling",
    entityType: "mista",
  },
  {
    id: "sport_equestrian",
    name: "Hipismo",
    defaultScoringSystemId: "penalties-time-proportional",
    rankingModel: "rolling",
    entityType: "mista",
  },
  {
    id: "sport_fencing",
    name: "Esgrima",
    defaultScoringSystemId: "touches-proportional",
    rankingModel: "rolling",
    entityType: "mista",
  },
  {
    id: "sport_field_hockey",
    name: "Hóquei sobre Grama",
    defaultScoringSystemId: "goals-proportional",
    rankingModel: "seasonal",
    entityType: "equipe",
  },
  {
    id: "sport_flag_football",
    name: "Flag Football",
    defaultScoringSystemId: "points-proportional",
    rankingModel: "seasonal",
    entityType: "equipe",
  },
  {
    id: "sport_football",
    name: "Futebol",
    defaultScoringSystemId: "generic-proportional",
    rankingModel: "seasonal",
    entityType: "equipe",
  },
  {
    id: "sport_golf",
    name: "Golfe",
    defaultScoringSystemId: "strokes-proportional",
    rankingModel: "rolling",
    entityType: "atleta",
  },
  {
    id: "sport_gymnastics",
    name: "Ginástica",
    defaultScoringSystemId: "judged-scores",
    rankingModel: "rolling",
    entityType: "mista",
  },
  {
    id: "sport_handball",
    name: "Handebol",
    defaultScoringSystemId: "goals-proportional",
    rankingModel: "seasonal",
    entityType: "equipe",
  },
  {
    id: "sport_judo",
    name: "Judô",
    defaultScoringSystemId: "ippon-wazaari-proportional",
    rankingModel: "rolling",
    entityType: "mista",
  },
  {
    id: "sport_lacrosse",
    name: "Lacrosse",
    defaultScoringSystemId: "goals-proportional",
    rankingModel: "seasonal",
    entityType: "equipe",
  },
  {
    id: "sport_modern_pentathlon",
    name: "Pentatlo Moderno",
    defaultScoringSystemId: "points-cumulative-proportional",
    rankingModel: "rolling",
    entityType: "atleta",
  },
  {
    id: "sport_rowing",
    name: "Remo",
    defaultScoringSystemId: "time-proportional",
    rankingModel: "rolling",
    entityType: "mista",
  },
  {
    id: "sport_rugby",
    name: "Rugby",
    defaultScoringSystemId: "points-proportional",
    rankingModel: "seasonal",
    entityType: "equipe",
  },
  {
    id: "sport_sailing",
    name: "Vela",
    defaultScoringSystemId: "low-point-system",
    rankingModel: "rolling",
    entityType: "mista",
  },
  {
    id: "sport_shooting",
    name: "Tiro Esportivo",
    defaultScoringSystemId: "points-proportional",
    rankingModel: "rolling",
    entityType: "mista",
  },
  {
    id: "sport_skateboarding",
    name: "Skate",
    defaultScoringSystemId: "judged-tricks-runs",
    rankingModel: "rolling",
    entityType: "atleta",
  },
  {
    id: "sport_sport_climbing",
    name: "Escalada Esportiva",
    defaultScoringSystemId: "points-time-proportional",
    rankingModel: "rolling",
    entityType: "atleta",
  },
  {
    id: "sport_squash",
    name: "Squash",
    defaultScoringSystemId: "sets-points-proportional",
    rankingModel: "cumulative",
    entityType: "atleta",
  },
  {
    id: "sport_surfing",
    name: "Surfe",
    defaultScoringSystemId: "judged-waves",
    rankingModel: "rolling",
    entityType: "atleta",
  },
  {
    id: "sport_table_tennis",
    name: "Tênis de Mesa",
    defaultScoringSystemId: "sets-proportional",
    rankingModel: "cumulative",
    entityType: "mista",
  },
  {
    id: "sport_taekwondo",
    name: "Taekwondo",
    defaultScoringSystemId: "points-rounds-proportional",
    rankingModel: "rolling",
    entityType: "atleta",
  },
  {
    id: "sport_tennis",
    name: "Tênis",
    defaultScoringSystemId: "tennis-round-proportional",
    rankingModel: "cumulative",
    entityType: "mista",
  },
  {
    id: "sport_triathlon",
    name: "Triatlo",
    defaultScoringSystemId: "time-proportional",
    rankingModel: "rolling",
    entityType: "mista",
  },
  {
    id: "sport_volleyball",
    name: "Vôlei",
    defaultScoringSystemId: "sets-proportional",
    rankingModel: "seasonal",
    entityType: "mista",
  },
  {
    id: "sport_weightlifting",
    name: "Levantamento de Peso",
    defaultScoringSystemId: "weight-total-proportional",
    rankingModel: "rolling",
    entityType: "atleta",
  },
  {
    id: "sport_wrestling",
    name: "Luta Olímpica",
    defaultScoringSystemId: "match-points-proportional",
    rankingModel: "rolling",
    entityType: "atleta",
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
