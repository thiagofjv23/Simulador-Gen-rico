import {
  hydratePersonGeography,
  matchesGeographicScope,
} from "./geography.js";

export const RANKING_ID = "world";

export function rankingIdFor(sportId, modalityId) {
  return sportId && modalityId
    ? `ranking_${sportId}_${modalityId}`
    : RANKING_ID;
}

const COUNTRY_PROFILES = [
  {
    code: "USA",
    name: "Estados Unidos",
    strength: 94,
    people: ["Avery Johnson", "Cameron Williams", "Jordan Davis", "Morgan Taylor", "Riley Anderson"],
  },
  {
    code: "CHN",
    name: "China",
    strength: 92,
    people: ["Li Wei", "Wang Fang", "Zhang Min", "Chen Hao", "Liu Yan"],
  },
  {
    code: "GBR",
    name: "Reino Unido",
    strength: 89,
    people: ["Oliver Smith", "Amelia Jones", "George Brown", "Isla Wilson", "Harry Evans"],
  },
  {
    code: "JPN",
    name: "Japão",
    strength: 88,
    people: ["Haruto Sato", "Yui Suzuki", "Ren Takahashi", "Aoi Tanaka", "Sora Watanabe"],
  },
  {
    code: "GER",
    name: "Alemanha",
    strength: 87,
    people: ["Lukas Müller", "Anna Schmidt", "Felix Schneider", "Lea Fischer", "Jonas Weber"],
  },
  {
    code: "FRA",
    name: "França",
    strength: 86,
    people: ["Louis Martin", "Emma Bernard", "Hugo Dubois", "Léa Thomas", "Jules Robert"],
  },
  {
    code: "ITA",
    name: "Itália",
    strength: 85,
    people: ["Luca Rossi", "Giulia Russo", "Matteo Ferrari", "Sofia Esposito", "Marco Romano"],
  },
  {
    code: "AUS",
    name: "Austrália",
    strength: 84,
    people: ["Jack Wilson", "Charlotte Harris", "Noah Thompson", "Matilda Walker", "Leo Campbell"],
  },
  {
    code: "NED",
    name: "Países Baixos",
    strength: 83,
    people: ["Daan de Jong", "Sophie Jansen", "Sem de Vries", "Tess van Dijk", "Milan Smit"],
  },
  {
    code: "KOR",
    name: "Coreia do Sul",
    strength: 82,
    people: ["Kim Min-jun", "Lee Seo-yeon", "Park Ji-ho", "Choi Ha-yun", "Jung Do-yun"],
  },
  {
    code: "BRA",
    name: "Brasil",
    strength: 80,
    people: ["Ana Souza", "Bruno Lima", "Carla Santos", "Diego Oliveira", "Elisa Costa"],
  },
  {
    code: "CAN",
    name: "Canadá",
    strength: 79,
    people: ["Liam Tremblay", "Olivia Martin", "Ethan Roy", "Chloé Gagnon", "Lucas Wilson"],
  },
  {
    code: "ESP",
    name: "Espanha",
    strength: 78,
    people: ["Hugo García", "Lucía Fernández", "Martín López", "Sofía Martínez", "Leo Sánchez"],
  },
  {
    code: "POL",
    name: "Polônia",
    strength: 76,
    people: ["Jan Kowalski", "Zofia Nowak", "Piotr Wiśniewski", "Maja Wójcik", "Jakub Kamiński"],
  },
  {
    code: "HUN",
    name: "Hungria",
    strength: 75,
    people: ["Bence Nagy", "Anna Kovács", "Máté Tóth", "Luca Szabó", "Dávid Horváth"],
  },
  {
    code: "KEN",
    name: "Quênia",
    strength: 74,
    people: ["Brian Kiptoo", "Faith Chebet", "Daniel Kiplagat", "Joyce Jepchirchir", "Peter Korir"],
  },
  {
    code: "JAM",
    name: "Jamaica",
    strength: 73,
    people: ["Andre Campbell", "Brianna Williams", "Dwayne Brown", "Kiara Thompson", "Malik Johnson"],
  },
  {
    code: "ETH",
    name: "Etiópia",
    strength: 72,
    people: ["Dawit Bekele", "Hana Tesfaye", "Nahom Alemu", "Selamawit Kebede", "Yonas Tadesse"],
  },
  {
    code: "RSA",
    name: "África do Sul",
    strength: 71,
    people: ["Liam Botha", "Amahle Dlamini", "Thabo Nkosi", "Mia van Wyk", "Sipho Khumalo"],
  },
  {
    code: "NZL",
    name: "Nova Zelândia",
    strength: 70,
    people: ["Finn Williams", "Isla Taylor", "Arlo Thompson", "Maia Wilson", "Niko Walker"],
  },
];

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function createInitialPeople(createdAt = new Date().toISOString()) {
  return COUNTRY_PROFILES.flatMap((country, countryIndex) =>
    country.people.map((name, personIndex) => {
      const seed = (countryIndex + 1) * 97 + (personIndex + 1) * 37;
      const baseVariation = ((countryIndex * 3 + personIndex * 7) % 13) - 6;

      return hydratePersonGeography({
        id: `person_${country.code.toLocaleLowerCase()}_${personIndex + 1}`,
        name,
        countryCode: country.code,
        countryName: country.name,
        gender: (countryIndex + personIndex) % 2 === 0 ? "F" : "M",
        age: 18 + (seed % 17),
        baseRating: clamp(country.strength + baseVariation, 45, 99),
        momentum: (seed * 11) % 11 - 5,
        // Rivais: outros ATLETAS escolhidos como rivais (lista de ids). Ainda
        // sem função; existe para todo atleta.
        rivals: [],
        sportId: null,
        modalityId: null,
        rosterType: "generic",
        createdAt,
        updatedAt: createdAt,
      });
    }),
  );
}

export function buildInitialRanking(
  people,
  updatedAt = new Date().toISOString(),
  {
    rankingId = RANKING_ID,
    sportId = null,
    modalityId = null,
    rankingModel = "cumulative",
    seasonYear = null,
    startAtZero = false,
  } = {},
) {
  const eligiblePeople = sportId && modalityId
    ? people.filter((person) =>
      person.sportId === sportId && person.modalityId === modalityId)
    : people;
  const ordered = [...eligiblePeople].sort((a, b) => {
    const scoreA = a.baseRating * 10 + a.momentum * 7 + ((a.age * 17) % 9 - 4) * 4;
    const scoreB = b.baseRating * 10 + b.momentum * 7 + ((b.age * 17) % 9 - 4) * 4;
    return scoreB - scoreA || a.name.localeCompare(b.name, "pt-BR");
  });

  return ordered.map((person, index) => {
    const position = index + 1;
    const points = Math.max(
      0,
      person.baseRating * 10 + person.momentum * 7 + ((person.age * 17) % 9 - 4) * 4,
    );

    return {
      id: `${rankingId}_${person.id}`,
      rankingId,
      personId: person.id,
      position,
      previousPosition: position,
     points: startAtZero || rankingModel === "rolling" ? 0 : points,
eventsCount: 0,
ranked: rankingModel !== "rolling",
sportId,
modalityId,
rankingModel,
      seasonYear: rankingModel === "seasonal" ? seasonYear : null,
      updatedAt,
    };
  });
}

export function combineRanking(people, entries) {
  const peopleById = new Map(people.map((person) => [person.id, person]));

  return entries
    .map((entry) => {
      const person = peopleById.get(entry.personId);
      return person ? { ...entry, person } : null;
    })
    .filter(Boolean)
    .sort((a, b) =>
      a.rankingId.localeCompare(b.rankingId)
      || a.position - b.position
      || b.points - a.points,
    );
}

export function rankingForSport(
  ranking,
  { sportId = null, modalityId = null } = {},
) {
  const rankingId = rankingIdFor(sportId, modalityId);
  return ranking
    .filter((entry) => entry.rankingId === rankingId)
    .sort((a, b) => a.position - b.position || b.points - a.points);
}

export function assignGenericPeopleToSport(
  people,
  { sportId, modalityId, updatedAt = new Date().toISOString() },
) {
  return people.map((person) =>
    !person.sportId && !person.modalityId
      ? {
        ...person,
        sportId,
        modalityId,
        updatedAt,
      }
      : person);
}

export function resetSeasonalEntriesForYear(
  entries,
  year,
  updatedAt = `${year}-01-01T00:00:00.000Z`,
) {
  return entries.map((entry) =>
    entry.rankingModel === "seasonal" && entry.seasonYear !== year
      ? {
        ...entry,
        position: entry.previousPosition,
        previousPosition: entry.previousPosition,
        points: 0,
        eventsCount: 0,
        seasonYear: year,
        updatedAt,
      }
      : entry);
}

export function buildScopedRanking(ranking, scopeSource = {}) {
  const eligible = ranking.filter(({ person }) => matchesGeographicScope(person, scopeSource));
  const previousOrder = [...eligible].sort((a, b) =>
    a.previousPosition - b.previousPosition
    || a.personId.localeCompare(b.personId),
  );
  const previousPositions = new Map(
    previousOrder.map((entry, index) => [entry.personId, index + 1]),
  );

  return eligible.map((entry, index) => ({
    ...entry,
    worldPosition: entry.position,
    previousWorldPosition: entry.previousPosition,
    position: index + 1,
    previousPosition: previousPositions.get(entry.personId),
  }));
}

export function rankingStats(ranking) {
  const countries = new Set(ranking.map(({ person }) => person.countryCode));
  return {
    total: ranking.length,
    countries: countries.size,
    leader: ranking[0]?.person.name ?? "—",
  };
}
