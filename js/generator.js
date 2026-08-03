// Gerador de atletas e clubes. Lógica pura e determinística (dado um seed): cria
// entidades para os esportes escolhidos, uma leva por nacionalidade e modalidade,
// usando o entityType da modalidade (js/catalog.js) para decidir se cria atletas,
// clubes ou ambos (modalidade mista). Os nomes vêm de um gerador injetado
// (js/names.js), então este módulo não depende do faker e é testável sem ele.

import { hydratePersonGeography } from "./geography.js";
import { createClub, clubIdFor, ENTITY_TYPES } from "./clubs.js";
import { entityTypeForModality, eventTypesForModality } from "./catalog.js";

export const ENTITIES_PER_NATIONALITY = 20;
export const MIN_AGE = 16;
export const MAX_AGE = 40;

// RNG determinístico (mulberry32) — mesma sequência para o mesmo seed.
export function createRng(seed = 1) {
  let state = seed >>> 0;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Ruído gaussiano padrão (Box-Muller) a partir do RNG.
function gaussian(rng) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function randomInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

// Curva de rating de uma modalidade (1–99). A maioria fica em nível olímpico mas
// não-elite; uma cauda fina chega a ~95 ("alguns nomes") e, por modalidade, 1–2
// atletas são forçados a 98–99 ("um ou outro nome"). Não há distinção por país —
// os ratings são gerados em lote e depois consumidos, espalhando os melhores.
export function generateModalityRatings(count, rng) {
  const ratings = [];
  for (let i = 0; i < count; i += 1) {
    // Núcleo: média ~76, desvio ~6 (nível olímpico, não-elite).
    let value = 76 + gaussian(rng) * 6;
    // Cauda superior rara: poucos sobem bastante (chegando a ~95).
    if (rng() < 0.04) value += Math.abs(gaussian(rng)) * 7;
    ratings.push(clamp(Math.round(value), 40, 97));
  }
  if (!count) return ratings;

  // Estrelas por modalidade: 1 chega a 99 e, quase sempre, uma 2ª a 98.
  const stars = [99];
  if (count > 1 && rng() < 0.85) stars.push(98);
  const chosen = new Set();
  for (const rating of stars) {
    let index = randomInt(rng, 0, count - 1);
    let guard = 0;
    while (chosen.has(index) && guard < count) {
      index = randomInt(rng, 0, count - 1);
      guard += 1;
    }
    chosen.add(index);
    ratings[index] = rating;
  }
  return ratings;
}

function slugify(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Gera as entidades de UMA modalidade para todos os países informados.
// `nameGen`: objeto de js/names.js (personName/clubName). Retorna { people, clubs }.
export function generateModalityEntities({
  sport,
  modality,
  countries = [],
  nameGen,
  rng,
  timestamp = new Date().toISOString(),
  perNationality = ENTITIES_PER_NATIONALITY,
}) {
  const people = [];
  const clubs = [];
  const entityType = entityTypeForModality(modality.id);
  const allows = ENTITY_TYPES[entityType];
  const total = countries.length * perNationality;
  const sportSlug = slugify(sport.id.replace(/^sport_/, ""));
  const modalitySlug = slugify(modality.id.replace(/^modality_/, ""));

  // Cada entidade fica atrelada a um tipo de evento da modalidade, distribuídos
  // em rodízio pelo pool (esporte → modalidade → tipo de evento). Modalidade com
  // um único evento manda todas para ele; sem eventos no catálogo, fica null.
  const events = eventTypesForModality(modality.id);
  const eventTypeFor = (index) => (events.length ? events[index % events.length].id : null);

  const personRatings = allows.allowsAthletes ? generateModalityRatings(total, rng) : [];
  const clubRatings = allows.allowsClubs ? generateModalityRatings(total, rng) : [];
  let cursor = 0;

  for (const country of countries) {
    for (let i = 0; i < perNationality; i += 1) {
      const index = cursor;
      const eventTypeId = eventTypeFor(index);
      if (allows.allowsAthletes) {
        people.push(hydratePersonGeography({
          id: `person_gen_${sportSlug}_${modalitySlug}_${country.code.toLocaleLowerCase()}_${i}`,
          name: nameGen.personName(country.code),
          driverName: nameGen.personName(country.code),
          countryCode: country.code,
          gender: "M",
          age: randomInt(rng, MIN_AGE, MAX_AGE),
          baseRating: personRatings[index],
          momentum: 0,
          rivals: [],
          sportId: sport.id,
          modalityId: modality.id,
          eventTypeId,
          rosterType: "generated",
          createdAt: timestamp,
          updatedAt: timestamp,
        }));
      }
      if (allows.allowsClubs) {
        const club = createClub({
          id: clubIdFor(sport.id, `gen_${modalitySlug}_${country.code.toLocaleLowerCase()}_${i}`),
          name: nameGen.clubName(country.code),
          sportId: sport.id,
          modalityId: modality.id,
          baseRating: clubRatings[index],
          momentum: 0,
          countryCode: country.code,
          rosterType: "generated",
          createdAt: timestamp,
          updatedAt: timestamp,
        });
        // createClub monta um objeto fixo; atrelamos o tipo de evento depois.
        club.eventTypeId = eventTypeId;
        clubs.push(club);
      }
      cursor += 1;
    }
  }

  return { people, clubs };
}

// Gera `total` entidades de UMA modalidade, distribuídas entre os países
// informados por rodízio: para um continente (vários países) espalha; para um
// único país, todas nele. `batchId` entra no id para não colidir com gerações
// anteriores do mesmo país/modalidade (o jogador pode gerar o mesmo país várias
// vezes). É o núcleo do gerador incremental por seleção.
export function generateModalityBatch({
  sport,
  modality,
  countries = [],
  total = 0,
  nameGen,
  rng,
  timestamp = new Date().toISOString(),
  batchId = "b",
}) {
  const people = [];
  const clubs = [];
  const count = Math.max(0, Math.floor(Number(total) || 0));
  if (!countries.length || count <= 0) return { people, clubs };

  const entityType = entityTypeForModality(modality.id);
  const allows = ENTITY_TYPES[entityType];
  const sportSlug = slugify(sport.id.replace(/^sport_/, ""));
  const modalitySlug = slugify(modality.id.replace(/^modality_/, ""));
  const events = eventTypesForModality(modality.id);
  const eventTypeFor = (index) => (events.length ? events[index % events.length].id : null);

  const personRatings = allows.allowsAthletes ? generateModalityRatings(count, rng) : [];
  const clubRatings = allows.allowsClubs ? generateModalityRatings(count, rng) : [];

  for (let i = 0; i < count; i += 1) {
    const country = countries[i % countries.length];
    const eventTypeId = eventTypeFor(i);
    const idSuffix = `${country.code.toLocaleLowerCase()}_${batchId}_${i}`;
    if (allows.allowsAthletes) {
      people.push(hydratePersonGeography({
        id: `person_gen_${sportSlug}_${modalitySlug}_${idSuffix}`,
        name: nameGen.personName(country.code),
        driverName: nameGen.personName(country.code),
        countryCode: country.code,
        gender: "M",
        age: randomInt(rng, MIN_AGE, MAX_AGE),
        baseRating: personRatings[i],
        momentum: 0,
        rivals: [],
        sportId: sport.id,
        modalityId: modality.id,
        eventTypeId,
        rosterType: "generated",
        createdAt: timestamp,
        updatedAt: timestamp,
      }));
    }
    if (allows.allowsClubs) {
      const club = createClub({
        id: clubIdFor(sport.id, `gen_${modalitySlug}_${idSuffix}`),
        name: nameGen.clubName(country.code),
        sportId: sport.id,
        modalityId: modality.id,
        baseRating: clubRatings[i],
        momentum: 0,
        countryCode: country.code,
        rosterType: "generated",
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      club.eventTypeId = eventTypeId;
      clubs.push(club);
    }
  }

  return { people, clubs };
}

// Gera uma seleção do gerador incremental: um esporte, uma ou mais modalidades e
// um total (por modalidade) distribuído entre os países escolhidos. Retorna
// { people, clubs } consolidados.
export function generateSelectionEntities({
  sport,
  modalities = [],
  countries = [],
  total = 0,
  nameGen,
  rng = createRng(1),
  timestamp = new Date().toISOString(),
  batchId = "b",
}) {
  const people = [];
  const clubs = [];
  if (!sport) return { people, clubs };
  for (const modality of modalities) {
    const result = generateModalityBatch({
      sport,
      modality,
      countries,
      total,
      nameGen,
      rng,
      timestamp,
      batchId,
    });
    people.push(...result.people);
    clubs.push(...result.clubs);
  }
  return { people, clubs };
}

// Gera as entidades de vários esportes. `modalitiesForSport(sportId)` devolve as
// modalidades do catálogo de um esporte. Retorna { people, clubs } consolidados.
export function generateEntities({
  sports = [],
  modalitiesForSport,
  countries = [],
  nameGen,
  rng = createRng(1),
  timestamp = new Date().toISOString(),
  perNationality = ENTITIES_PER_NATIONALITY,
}) {
  const people = [];
  const clubs = [];
  for (const sport of sports) {
    for (const modality of modalitiesForSport(sport.id)) {
      const result = generateModalityEntities({
        sport,
        modality,
        countries,
        nameGen,
        rng,
        timestamp,
        perNationality,
      });
      people.push(...result.people);
      clubs.push(...result.clubs);
    }
  }
  return { people, clubs };
}
