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
