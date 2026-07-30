// Sistema genérico de clubes/equipes.
//
// Uma equipe é uma entidade com a MESMA estrutura e os mesmos atributos de um
// atleta (rating base, momentum, idade, país...). Em esportes só de equipes ela
// é simulada exatamente como um atleta; em esportes mistos (ex.: automobilismo),
// atletas e equipes convivem no mesmo campeonato e a pontuação de uma equipe no
// ranking é a SOMA dos pontos dos seus atletas membros.
//
// Cada esporte declara o tipo de entidade que o disputa (campo entityType em
// js/sports.js), que se resolve numa destas três categorias:
//   - "atleta": só atletas individuais disputam (ex.: tênis, atletismo)
//   - "equipe": só equipes disputam (ex.: futebol, basquete)
//   - "mista":  atletas e equipes disputam o mesmo campeonato (ex.: automobilismo)
//
// Este módulo cuida apenas da estrutura (modelo de dados, validação e helpers
// puros). A integração com a simulação, os rankings e as telas é feita nas
// etapas seguintes.

import { hydratePersonGeography } from "./geography.js";

export const ENTITY_TYPES = {
  atleta: {
    id: "atleta",
    label: "Atleta",
    description:
      "Somente atletas individuais disputam o campeonato (ex.: tênis, atletismo).",
    allowsAthletes: true,
    allowsClubs: false,
  },
  equipe: {
    id: "equipe",
    label: "Equipe",
    description:
      "Somente equipes disputam o campeonato; a equipe é simulada como um atleta (ex.: futebol, basquete).",
    allowsAthletes: false,
    allowsClubs: true,
  },
  mista: {
    id: "mista",
    label: "Mista",
    description:
      "Atletas e equipes disputam o mesmo campeonato. A pontuação da equipe é a soma dos pontos dos seus atletas (ex.: automobilismo).",
    allowsAthletes: true,
    allowsClubs: true,
  },
};

export const DEFAULT_ENTITY_TYPE = "atleta";

// Sistemas de rating de equipe para modalidades mistas. São os dois modelos
// selecionáveis descritos no passo 2:
//   - "independent": a equipe existe e acumula pontos no ranking (soma dos
//     atletas membros), mas o rating da equipe NÃO altera a simulação da prova.
//   - "weighted": o rating da equipe entra no desempenho de cada atleta segundo
//     o peso da equipe (teamWeight). Quanto maior o peso, mais o "equipamento"
//     pesa no resultado (ex.: carros de Fórmula 1).
export const TEAM_RATING_MODELS = {
  independent: {
    id: "independent",
    label: "Equipe não influencia a etapa",
    description:
      "A equipe acumula pontos no ranking (soma dos atletas membros), mas o rating da equipe não altera a simulação da prova.",
    affectsSimulation: false,
  },
  weighted: {
    id: "weighted",
    label: "Equipe influencia a etapa (com peso)",
    description:
      "O rating da equipe entra no desempenho de cada atleta segundo o peso da equipe. Quanto maior o peso, mais o equipamento pesa no resultado (ex.: carros de Fórmula 1).",
    affectsSimulation: true,
  },
};

export const DEFAULT_TEAM_RATING_MODEL = "independent";
export const MAX_TEAM_WEIGHT = 100;

export function teamRatingModelInfo(modelId) {
  return TEAM_RATING_MODELS[modelId] ?? TEAM_RATING_MODELS[DEFAULT_TEAM_RATING_MODEL];
}

export function teamRatingModelLabel(modelId) {
  return teamRatingModelInfo(modelId).label;
}

export function isTeamRatingModel(modelId) {
  return Boolean(TEAM_RATING_MODELS[modelId]);
}

// Normaliza o peso da equipe para um inteiro em [0, 100].
export function normalizeTeamWeight(value) {
  const number = Math.round(Number(value));
  if (!Number.isFinite(number)) return 0;
  return Math.min(MAX_TEAM_WEIGHT, Math.max(0, number));
}

export function entityTypeInfo(entityTypeId) {
  return ENTITY_TYPES[entityTypeId] ?? ENTITY_TYPES[DEFAULT_ENTITY_TYPE];
}

export function entityTypeLabel(entityTypeId) {
  return entityTypeInfo(entityTypeId).label;
}

export function isEntityType(entityTypeId) {
  return Boolean(ENTITY_TYPES[entityTypeId]);
}

// Identificador estável de um clube, único por esporte (o slug costuma vir do
// nome normalizado da equipe, ex.: "ferrari").
export function clubIdFor(sportId, slug) {
  const sportKey = (sportId ?? "generic").replace(/^sport_/, "");
  return `club_${sportKey}_${slug}`;
}

// Normaliza um clube/equipe. Mantém exatamente o mesmo formato de atributos de
// uma pessoa (ver createInitialPeople em js/ranking.js), para que a equipe possa
// ser simulada e ranqueada pelo mesmo pipeline dos atletas. O campo isClub e o
// entityType "equipe" marcam a entidade como clube; memberPersonIds guarda os
// atletas que a compõem na modalidade (usado no modelo misto).
export function createClub({
  id,
  name,
  sportId = null,
  modalityId = null,
  baseRating = 50,
  momentum = 0,
  age = null,
  gender = null,
  countryCode = null,
  memberPersonIds = [],
  rosterType = "generic",
  presetId = null,
  createdAt = new Date().toISOString(),
  updatedAt = createdAt,
} = {}) {
  return hydratePersonGeography({
    id,
    name,
    sportId,
    modalityId,
    baseRating,
    momentum,
    age,
    gender,
    countryCode,
    entityType: "equipe",
    isClub: true,
    memberPersonIds: [...new Set(memberPersonIds)],
    rosterType,
    presetId,
    createdAt,
    updatedAt,
  });
}

// Distingue equipes de atletas em coleções compartilhadas.
export function isClub(entity) {
  return Boolean(entity?.isClub) || entity?.entityType === "equipe";
}

// Pontuação de uma equipe no modelo misto: a soma dos pontos dos seus atletas
// membros no ranking da modalidade. `pointsByPersonId` mapeia personId -> pontos.
export function sumMemberPoints(memberPersonIds = [], pointsByPersonId = new Map()) {
  const points = pointsByPersonId instanceof Map
    ? pointsByPersonId
    : new Map(Object.entries(pointsByPersonId));
  return [...new Set(memberPersonIds)].reduce(
    (total, personId) => total + (Number(points.get(personId)) || 0),
    0,
  );
}

// Classificação de equipes de uma modalidade: para cada clube, os pontos são a
// SOMA dos pontos dos seus atletas membros no ranking (calculada ao vivo a
// partir das entradas de ranking dos atletas, não persistida). Ordena por pontos
// e devolve com posição, para exibir ao lado do ranking de atletas.
export function buildClubStandings(clubs = [], athleteEntries = []) {
  const pointsByPersonId = new Map(
    athleteEntries.map((entry) => [entry.personId, entry.points ?? 0]),
  );
  const eventsByPersonId = new Map(
    athleteEntries.map((entry) => [entry.personId, entry.eventsCount ?? 0]),
  );

  return clubs
    .map((club) => {
      const members = [...new Set(club.memberPersonIds ?? [])];
      return {
        club,
        points: sumMemberPoints(members, pointsByPersonId),
        memberCount: members.length,
        eventsCount: members.reduce(
          (max, personId) => Math.max(max, eventsByPersonId.get(personId) ?? 0),
          0,
        ),
      };
    })
    .sort((a, b) =>
      b.points - a.points
      || b.club.baseRating - a.club.baseRating
      || a.club.name.localeCompare(b.club.name, "pt-BR"))
    .map((row, index) => ({ ...row, position: index + 1 }));
}

export function validateClub(club) {
  const errors = [];
  if (!club?.id) errors.push("Informe o identificador do clube.");
  if (!club?.name?.trim()) errors.push("Informe o nome do clube.");
  if (!club?.sportId) errors.push("Vincule o clube a um esporte.");
  if (!Number.isFinite(Number(club?.baseRating))) {
    errors.push("O rating base do clube deve ser numérico.");
  }
  return errors;
}
