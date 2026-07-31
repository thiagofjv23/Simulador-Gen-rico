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
  { code: "ALG", name: "Argélia", continentId: "continent_africa" },
  { code: "ANG", name: "Angola", continentId: "continent_africa" },
  { code: "BEN", name: "Benin", continentId: "continent_africa" },
  { code: "BOT", name: "Botsuana", continentId: "continent_africa" },
  { code: "BUR", name: "Burquina Faso", continentId: "continent_africa" },
  { code: "BDI", name: "Burundi", continentId: "continent_africa" },
  { code: "CPV", name: "Cabo Verde", continentId: "continent_africa" },
  { code: "CMR", name: "Camarões", continentId: "continent_africa" },
  { code: "CHA", name: "Chade", continentId: "continent_africa" },
  { code: "COM", name: "Comores", continentId: "continent_africa" },
  { code: "CGO", name: "Congo", continentId: "continent_africa" },
  { code: "COD", name: "República Democrática do Congo", continentId: "continent_africa" },
  { code: "CIV", name: "Costa do Marfim", continentId: "continent_africa" },
  { code: "DJI", name: "Djibuti", continentId: "continent_africa" },
  { code: "EGY", name: "Egito", continentId: "continent_africa" },
  { code: "ERI", name: "Eritreia", continentId: "continent_africa" },
  { code: "ETH", name: "Etiópia", continentId: "continent_africa" },
  { code: "GAB", name: "Gabão", continentId: "continent_africa" },
  { code: "GAM", name: "Gâmbia", continentId: "continent_africa" },
  { code: "GHA", name: "Gana", continentId: "continent_africa" },
  { code: "GUI", name: "Guiné", continentId: "continent_africa" },
  { code: "GBS", name: "Guiné-Bissau", continentId: "continent_africa" },
  { code: "GEQ", name: "Guiné Equatorial", continentId: "continent_africa" },
  { code: "KEN", name: "Quênia", continentId: "continent_africa" },
  { code: "LBR", name: "Libéria", continentId: "continent_africa" },
  { code: "LBY", name: "Líbia", continentId: "continent_africa" },
  { code: "LES", name: "Lesoto", continentId: "continent_africa" },
  { code: "MAD", name: "Madagascar", continentId: "continent_africa" },
  { code: "MAW", name: "Malaui", continentId: "continent_africa" },
  { code: "MLI", name: "Mali", continentId: "continent_africa" },
  { code: "MAR", name: "Marrocos", continentId: "continent_africa" },
  { code: "MRI", name: "Maurício", continentId: "continent_africa" },
  { code: "MTN", name: "Mauritânia", continentId: "continent_africa" },
  { code: "MOZ", name: "Moçambique", continentId: "continent_africa" },
  { code: "NAM", name: "Namíbia", continentId: "continent_africa" },
  { code: "NIG", name: "Níger", continentId: "continent_africa" },
  { code: "NGR", name: "Nigéria", continentId: "continent_africa" },
  { code: "CAF", name: "República Centro-Africana", continentId: "continent_africa" },
  { code: "RSA", name: "África do Sul", continentId: "continent_africa" },
  { code: "RWA", name: "Ruanda", continentId: "continent_africa" },
  { code: "STP", name: "São Tomé e Príncipe", continentId: "continent_africa" },
  { code: "SEN", name: "Senegal", continentId: "continent_africa" },
  { code: "SEY", name: "Seicheles", continentId: "continent_africa" },
  { code: "SLE", name: "Serra Leoa", continentId: "continent_africa" },
  { code: "SOM", name: "Somália", continentId: "continent_africa" },
  { code: "SSD", name: "Sudão do Sul", continentId: "continent_africa" },
  { code: "SUD", name: "Sudão", continentId: "continent_africa" },
  { code: "SWZ", name: "Eswatini", continentId: "continent_africa" },
  { code: "TAN", name: "Tanzânia", continentId: "continent_africa" },
  { code: "TOG", name: "Togo", continentId: "continent_africa" },
  { code: "TUN", name: "Tunísia", continentId: "continent_africa" },
  { code: "UGA", name: "Uganda", continentId: "continent_africa" },
  { code: "ZAM", name: "Zâmbia", continentId: "continent_africa" },
  { code: "ZIM", name: "Zimbábue", continentId: "continent_africa" },
  { code: "AFG", name: "Afeganistão", continentId: "continent_asia" },
  { code: "KSA", name: "Arábia Saudita", continentId: "continent_asia" },
  { code: "BRN", name: "Bahrein", continentId: "continent_asia" },
  { code: "BAN", name: "Bangladesh", continentId: "continent_asia" },
  { code: "BRU", name: "Brunei", continentId: "continent_asia" },
  { code: "BHU", name: "Butão", continentId: "continent_asia" },
  { code: "CAM", name: "Camboja", continentId: "continent_asia" },
  { code: "QAT", name: "Catar", continentId: "continent_asia" },
  { code: "KAZ", name: "Cazaquistão", continentId: "continent_asia" },
  { code: "CHN", name: "China", continentId: "continent_asia" },
  { code: "PRK", name: "Coreia do Norte", continentId: "continent_asia" },
  { code: "KOR", name: "Coreia do Sul", continentId: "continent_asia" },
  { code: "UAE", name: "Emirados Árabes Unidos", continentId: "continent_asia" },
  { code: "PHI", name: "Filipinas", continentId: "continent_asia" },
  { code: "HKG", name: "Hong Kong", continentId: "continent_asia" },
  { code: "YEM", name: "Iêmen", continentId: "continent_asia" },
  { code: "IND", name: "Índia", continentId: "continent_asia" },
  { code: "INA", name: "Indonésia", continentId: "continent_asia" },
  { code: "IRI", name: "Irã", continentId: "continent_asia" },
  { code: "IRQ", name: "Iraque", continentId: "continent_asia" },
  { code: "JPN", name: "Japão", continentId: "continent_asia" },
  { code: "JOR", name: "Jordânia", continentId: "continent_asia" },
  { code: "KUW", name: "Kuwait", continentId: "continent_asia" },
  { code: "LAO", name: "Laos", continentId: "continent_asia" },
  { code: "LBN", name: "Líbano", continentId: "continent_asia" },
  { code: "MAS", name: "Malásia", continentId: "continent_asia" },
  { code: "MDV", name: "Maldivas", continentId: "continent_asia" },
  { code: "MYA", name: "Mianmar", continentId: "continent_asia" },
  { code: "MGL", name: "Mongólia", continentId: "continent_asia" },
  { code: "NEP", name: "Nepal", continentId: "continent_asia" },
  { code: "OMA", name: "Omã", continentId: "continent_asia" },
  { code: "PAK", name: "Paquistão", continentId: "continent_asia" },
  { code: "PLE", name: "Palestina", continentId: "continent_asia" },
  { code: "KGZ", name: "Quirguistão", continentId: "continent_asia" },
  { code: "SGP", name: "Singapura", continentId: "continent_asia" },
  { code: "SRI", name: "Sri Lanka", continentId: "continent_asia" },
  { code: "SYR", name: "Síria", continentId: "continent_asia" },
  { code: "TJK", name: "Tajiquistão", continentId: "continent_asia" },
  { code: "THA", name: "Tailândia", continentId: "continent_asia" },
  { code: "TPE", name: "Taipé Chinesa", continentId: "continent_asia" },
  { code: "TLS", name: "Timor-Leste", continentId: "continent_asia" },
  { code: "TKM", name: "Turcomenistão", continentId: "continent_asia" },
  { code: "UZB", name: "Uzbequistão", continentId: "continent_asia" },
  { code: "VIE", name: "Vietnã", continentId: "continent_asia" },
  { code: "ALB", name: "Albânia", continentId: "continent_europe" },
  { code: "GER", name: "Alemanha", continentId: "continent_europe" },
  { code: "AND", name: "Andorra", continentId: "continent_europe" },
  { code: "ARM", name: "Armênia", continentId: "continent_europe" },
  { code: "AUT", name: "Áustria", continentId: "continent_europe" },
  { code: "AZE", name: "Azerbaijão", continentId: "continent_europe" },
  { code: "BEL", name: "Bélgica", continentId: "continent_europe" },
  { code: "BLR", name: "Bielorrússia", continentId: "continent_europe" },
  { code: "BIH", name: "Bósnia e Herzegovina", continentId: "continent_europe" },
  { code: "BUL", name: "Bulgária", continentId: "continent_europe" },
  { code: "CZE", name: "Chéquia", continentId: "continent_europe" },
  { code: "CYP", name: "Chipre", continentId: "continent_europe" },
  { code: "CRO", name: "Croácia", continentId: "continent_europe" },
  { code: "DEN", name: "Dinamarca", continentId: "continent_europe" },
  { code: "SVK", name: "Eslováquia", continentId: "continent_europe" },
  { code: "SLO", name: "Eslovênia", continentId: "continent_europe" },
  { code: "ESP", name: "Espanha", continentId: "continent_europe" },
  { code: "EST", name: "Estônia", continentId: "continent_europe" },
  { code: "FIN", name: "Finlândia", continentId: "continent_europe" },
  { code: "FRA", name: "França", continentId: "continent_europe" },
  { code: "GEO", name: "Geórgia", continentId: "continent_europe" },
  { code: "GBR", name: "Grã-Bretanha", continentId: "continent_europe" },
  { code: "GRE", name: "Grécia", continentId: "continent_europe" },
  { code: "HUN", name: "Hungria", continentId: "continent_europe" },
  { code: "IRL", name: "Irlanda", continentId: "continent_europe" },
  { code: "ISL", name: "Islândia", continentId: "continent_europe" },
  { code: "ISR", name: "Israel", continentId: "continent_europe" },
  { code: "ITA", name: "Itália", continentId: "continent_europe" },
  { code: "KOS", name: "Kosovo", continentId: "continent_europe" },
  { code: "LAT", name: "Letônia", continentId: "continent_europe" },
  { code: "LIE", name: "Liechtenstein", continentId: "continent_europe" },
  { code: "LTU", name: "Lituânia", continentId: "continent_europe" },
  { code: "LUX", name: "Luxemburgo", continentId: "continent_europe" },
  { code: "MKD", name: "Macedônia do Norte", continentId: "continent_europe" },
  { code: "MLT", name: "Malta", continentId: "continent_europe" },
  { code: "MDA", name: "Moldávia", continentId: "continent_europe" },
  { code: "MON", name: "Mônaco", continentId: "continent_europe" },
  { code: "MNE", name: "Montenegro", continentId: "continent_europe" },
  { code: "NOR", name: "Noruega", continentId: "continent_europe" },
  { code: "NED", name: "Países Baixos", continentId: "continent_europe" },
  { code: "POL", name: "Polônia", continentId: "continent_europe" },
  { code: "POR", name: "Portugal", continentId: "continent_europe" },
  { code: "ROU", name: "Romênia", continentId: "continent_europe" },
  { code: "RUS", name: "Rússia", continentId: "continent_europe" },
  { code: "SMR", name: "San Marino", continentId: "continent_europe" },
  { code: "SRB", name: "Sérvia", continentId: "continent_europe" },
  { code: "SWE", name: "Suécia", continentId: "continent_europe" },
  { code: "SUI", name: "Suíça", continentId: "continent_europe" },
  { code: "TUR", name: "Turquia", continentId: "continent_europe" },
  { code: "UKR", name: "Ucrânia", continentId: "continent_europe" },
  { code: "ARG", name: "Argentina", continentId: "continent_south_america" },
  { code: "BOL", name: "Bolívia", continentId: "continent_south_america" },
  { code: "BRA", name: "Brasil", continentId: "continent_south_america" },
  { code: "CHI", name: "Chile", continentId: "continent_south_america" },
  { code: "COL", name: "Colômbia", continentId: "continent_south_america" },
  { code: "ECU", name: "Equador", continentId: "continent_south_america" },
  { code: "GUY", name: "Guiana", continentId: "continent_south_america" },
  { code: "PAR", name: "Paraguai", continentId: "continent_south_america" },
  { code: "PER", name: "Peru", continentId: "continent_south_america" },
  { code: "SUR", name: "Suriname", continentId: "continent_south_america" },
  { code: "URU", name: "Uruguai", continentId: "continent_south_america" },
  { code: "VEN", name: "Venezuela", continentId: "continent_south_america" },
  { code: "AUS", name: "Austrália", continentId: "continent_oceania" },
  { code: "FSM", name: "Estados Federados da Micronésia", continentId: "continent_oceania" },
  { code: "FIJ", name: "Fiji", continentId: "continent_oceania" },
  { code: "GUM", name: "Guam", continentId: "continent_oceania" },
  { code: "COK", name: "Ilhas Cook", continentId: "continent_oceania" },
  { code: "MHL", name: "Ilhas Marshall", continentId: "continent_oceania" },
  { code: "SOL", name: "Ilhas Salomão", continentId: "continent_oceania" },
  { code: "NRU", "name": "Nauru", continentId: "continent_oceania" },
  { code: "NZL", "name": "Nova Zelândia", continentId: "continent_oceania" },
  { code: "PLW", "name": "Palau", continentId: "continent_oceania" },
  { code: "PNG", "name": "Papua-Nova Guiné", continentId: "continent_oceania" },
  { code: "KIR", "name": "Quiribati", continentId: "continent_oceania" },
  { code: "SAM", "name": "Samoa", continentId: "continent_oceania" },
  { code: "ASA", "name": "Samoa Americana", continentId: "continent_oceania" },
  { code: "TGA", "name": "Tonga", continentId: "continent_oceania" },
  { code: "TUV", "name": "Tuvalu", continentId: "continent_oceania" },
  { code: "VAN", "name": "Vanuatu", continentId: "continent_oceania" },
  { code: "ANT", name: "Antígua e Barbuda", continentId: "continent_north_america" },
  { code: "ARU", name: "Aruba", continentId: "continent_north_america" },
  { code: "BAH", name: "Bahamas", continentId: "continent_north_america" },
  { code: "BAR", name: "Barbados", continentId: "continent_north_america" },
  { code: "BIZ", name: "Belize", continentId: "continent_north_america" },
  { code: "BER", name: "Bermudas", continentId: "continent_north_america" },
  { code: "CAN", name: "Canadá", continentId: "continent_north_america" },
  { code: "CRC", name: "Costa Rica", continentId: "continent_north_america" },
  { code: "CUB", name: "Cuba", continentId: "continent_north_america" },
  { code: "DMA", name: "Dominica", continentId: "continent_north_america" },
  { code: "ESA", name: "El Salvador", continentId: "continent_north_america" },
  { code: "USA", name: "Estados Unidos", continentId: "continent_north_america" },
  { code: "GRN", name: "Granada", continentId: "continent_north_america" },
  { code: "GUA", name: "Guatemala", continentId: "continent_north_america" },
  { code: "HAI", name: "Haiti", continentId: "continent_north_america" },
  { code: "HON", name: "Honduras", continentId: "continent_north_america" },
  { code: "CAY", name: "Ilhas Cayman", continentId: "continent_north_america" },
  { code: "ISV", name: "Ilhas Virgens Americanas", continentId: "continent_north_america" },
  { code: "IVB", name: "Ilhas Virgens Britânicas", continentId: "continent_north_america" },
  { code: "JAM", name: "Jamaica", continentId: "continent_north_america" },
  { code: "MEX", name: "México", continentId: "continent_north_america" },
  { code: "NCA", name: "Nicarágua", continentId: "continent_north_america" },
  { code: "PAN", name: "Panamá", continentId: "continent_north_america" },
  { code: "PUR", name: "Porto Rico", continentId: "continent_north_america" },
  { code: "DOM", name: "República Dominicana", continentId: "continent_north_america" },
  { code: "LCA", name: "Santa Lúcia", continentId: "continent_north_america" },
  { code: "SKN", name: "São Cristóvão e Nevis", continentId: "continent_north_america" },
  { code: "VIN", name: "São Vicente e Granadinas", continentId: "continent_north_america" },
  { code: "TTO", name: "Trinidad e Tobago", continentId: "continent_north_america" },
];

].map((country) => ({
  ...country,
  id: country.id ?? `country_${country.code.toLocaleLowerCase()}`,
  worldId: WORLD_ENTITY_ID,
}));

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
