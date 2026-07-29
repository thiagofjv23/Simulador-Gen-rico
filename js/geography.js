export const WORLD_ENTITY_ID = "current";

export const GEOGRAPHIC_SCOPES = {
  world: {
    label: "Mundial",
    description: "Atletas de todos os países podem participar.",
  },
  continental: {
    label: "Continental",
    description: "Somente atletas de países do continente escolhido podem participar.",
  },
  national: {
    label: "Nacional",
    description: "Somente atletas do país escolhido podem participar.",
  },
};

export const CONTINENTS = [
  { id: "continent_africa", name: "África", worldId: WORLD_ENTITY_ID },
  { id: "continent_asia", name: "Ásia", worldId: WORLD_ENTITY_ID },
  { id: "continent_europe", name: "Europa", worldId: WORLD_ENTITY_ID },
  {
    id: "continent_north_america",
    name: "América do Norte, Central e Caribe",
    worldId: WORLD_ENTITY_ID,
  },
  { id: "continent_south_america", name: "América do Sul", worldId: WORLD_ENTITY_ID },
  { id: "continent_oceania", name: "Oceania", worldId: WORLD_ENTITY_ID },
];

export const COUNTRIES = [
  { id: "country_rsa", code: "RSA", name: "África do Sul", continentId: "continent_africa" },
  { id: "country_eth", code: "ETH", name: "Etiópia", continentId: "continent_africa" },
  { id: "country_ken", code: "KEN", name: "Quênia", continentId: "continent_africa" },
  { id: "country_chn", code: "CHN", name: "China", continentId: "continent_asia" },
  { id: "country_kor", code: "KOR", name: "Coreia do Sul", continentId: "continent_asia" },
  { id: "country_jpn", code: "JPN", name: "Japão", continentId: "continent_asia" },
  { id: "country_ger", code: "GER", name: "Alemanha", continentId: "continent_europe" },
  { id: "country_esp", code: "ESP", name: "Espanha", continentId: "continent_europe" },
  { id: "country_fra", code: "FRA", name: "França", continentId: "continent_europe" },
  { id: "country_hun", code: "HUN", name: "Hungria", continentId: "continent_europe" },
  { id: "country_ita", code: "ITA", name: "Itália", continentId: "continent_europe" },
  { id: "country_ned", code: "NED", name: "Países Baixos", continentId: "continent_europe" },
  { id: "country_pol", code: "POL", name: "Polônia", continentId: "continent_europe" },
  { id: "country_gbr", code: "GBR", name: "Reino Unido", continentId: "continent_europe" },
  {
    id: "country_can",
    code: "CAN",
    name: "Canadá",
    continentId: "continent_north_america",
  },
  {
    id: "country_usa",
    code: "USA",
    name: "Estados Unidos",
    continentId: "continent_north_america",
  },
  {
    id: "country_jam",
    code: "JAM",
    name: "Jamaica",
    continentId: "continent_north_america",
  },
  {
    id: "country_bra",
    code: "BRA",
    name: "Brasil",
    continentId: "continent_south_america",
  },
  { id: "country_aus", code: "AUS", name: "Austrália", continentId: "continent_oceania" },
  {
    id: "country_nzl",
    code: "NZL",
    name: "Nova Zelândia",
    continentId: "continent_oceania",
  },
].map((country) => ({ ...country, worldId: WORLD_ENTITY_ID }));

const CONTINENTS_BY_ID = new Map(CONTINENTS.map((continent) => [continent.id, continent]));
const COUNTRIES_BY_ID = new Map(COUNTRIES.map((country) => [country.id, country]));
const COUNTRIES_BY_CODE = new Map(COUNTRIES.map((country) => [country.code, country]));

export function normalizeGeographicScope(scope) {
  return GEOGRAPHIC_SCOPES[scope] ? scope : "world";
}

export function getContinent(continentId) {
  return CONTINENTS_BY_ID.get(continentId) ?? null;
}

export function getCountry(countryId) {
  return COUNTRIES_BY_ID.get(countryId) ?? null;
}

export function getCountryByCode(countryCode) {
  return COUNTRIES_BY_CODE.get(countryCode) ?? null;
}

export function countriesForContinent(continentId, countries = COUNTRIES) {
  return countries
    .filter((country) => country.continentId === continentId)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export function hydratePersonGeography(person) {
  const country = getCountryByCode(person.countryCode);
  if (!country) return { ...person };

  return {
    ...person,
    countryId: country.id,
    countryName: country.name,
    continentId: country.continentId,
  };
}

export function matchesGeographicScope(person, scopeSource = {}) {
  const scope = normalizeGeographicScope(scopeSource.geographicScope);
  if (scope === "world") return true;
  if (scope === "continental") return person.continentId === scopeSource.continentId;
  return person.countryId === scopeSource.countryId;
}

export function geographicScopeLabel(scopeSource = {}) {
  const scope = normalizeGeographicScope(scopeSource.geographicScope);
  if (scope === "world") return GEOGRAPHIC_SCOPES.world.label;

  const continent = getContinent(scopeSource.continentId);
  if (scope === "continental") {
    return continent ? `Continental · ${continent.name}` : "Continental";
  }

  const country = getCountry(scopeSource.countryId);
  return country ? `Nacional · ${country.name}` : "Nacional";
}

export function validateGeographicScope(scopeSource = {}) {
  const errors = [];
  const scope = normalizeGeographicScope(scopeSource.geographicScope);

  if (!GEOGRAPHIC_SCOPES[scopeSource.geographicScope ?? "world"]) {
    errors.push("Escolha uma abrangência geográfica válida.");
    return errors;
  }

  if (scope === "world") return errors;

  const continent = getContinent(scopeSource.continentId);
  if (!continent) {
    errors.push("Escolha um continente válido.");
    return errors;
  }

  if (scope === "national") {
    const country = getCountry(scopeSource.countryId);
    if (!country || country.continentId !== continent.id) {
      errors.push("Escolha um país pertencente ao continente selecionado.");
    }
  }

  return errors;
}
