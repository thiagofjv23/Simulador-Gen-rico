// Geração de nomes realistas por nacionalidade. Lógica pura: recebe um provedor
// faker por grupo de idioma (ver build/faker-entry.js → js/vendor/faker-names.js)
// e não importa o faker diretamente, para poder ser testada sem a biblioteca.
//
// Os países são agrupados por semelhança de idioma; quando a biblioteca não cobre
// o idioma de um país, o grupo cai em inglês ("en"), conforme especificado.

export const NAME_LANGUAGE_GROUPS = [
  "pt", "en", "es", "fr", "de", "it", "ru", "ar", "ja", "zh", "ko", "nl", "pl", "tr", "sv", "fa",
];

// Mapa país → grupo de idioma. Países ausentes usam "en" (fallback).
const COUNTRY_LANGUAGE_GROUP = {
  // Português
  BRA: "pt", POR: "pt", ANG: "pt", MOZ: "pt", CPV: "pt", GBS: "pt", STP: "pt", TLS: "pt",
  // Espanhol
  ESP: "es", ARG: "es", BOL: "es", CHI: "es", COL: "es", ECU: "es", PAR: "es", PER: "es",
  URU: "es", VEN: "es", MEX: "es", CRC: "es", ESA: "es", GUA: "es", HON: "es", NCA: "es",
  PAN: "es", CUB: "es", DOM: "es", PUR: "es", GEQ: "es", AND: "es",
  // Francês
  FRA: "fr", MON: "fr", LUX: "fr", BEN: "fr", BUR: "fr", CIV: "fr", CMR: "fr", COD: "fr",
  CGO: "fr", DJI: "fr", GAB: "fr", GUI: "fr", MLI: "fr", NIG: "fr", SEN: "fr", TOG: "fr",
  CAF: "fr", MAD: "fr", HAI: "fr", RWA: "fr",
  // Alemão
  GER: "de", AUT: "de", LIE: "de", SUI: "de",
  // Italiano
  ITA: "it", SMR: "it",
  // Russo (e vizinhos de forte influência)
  RUS: "ru", BLR: "ru", UKR: "ru", KAZ: "ru", KGZ: "ru", TJK: "ru", TKM: "ru", UZB: "ru", MDA: "ru",
  // Árabe
  KSA: "ar", QAT: "ar", UAE: "ar", YEM: "ar", IRQ: "ar", JOR: "ar", KUW: "ar", OMA: "ar",
  LBN: "ar", SYR: "ar", PLE: "ar", BRN: "ar", EGY: "ar", LBY: "ar", MAR: "ar", TUN: "ar",
  ALG: "ar", MTN: "ar", SUD: "ar", SOM: "ar",
  // Japonês
  JPN: "ja",
  // Chinês
  CHN: "zh", HKG: "zh", TPE: "zh",
  // Coreano
  KOR: "ko", PRK: "ko",
  // Neerlandês
  NED: "nl", SUR: "nl", ARU: "nl", BEL: "nl",
  // Polonês
  POL: "pl",
  // Turco
  TUR: "tr",
  // Nórdico
  SWE: "sv", NOR: "sv", DEN: "sv", ISL: "sv", FIN: "sv",
  // Persa
  IRI: "fa", AFG: "fa",
};

export function languageGroupForCountry(countryCode) {
  return COUNTRY_LANGUAGE_GROUP[String(countryCode ?? "").toUpperCase()] ?? "en";
}

// Denominações esportivas genéricas para nomes de clubes (prefixos e sufixos que
// remetem a clubes esportivos no mundo todo).
const CLUB_PREFIXES = [
  "AC", "SC", "FC", "CA", "CD", "Real", "Sporting", "Athletic", "Racing", "Club",
  "Olympique", "US", "AS", "SV", "Union",
];
const CLUB_SUFFIXES = [
  "FC", "SC", "AC", "United", "City", "Athletic", "Rovers", "Wanderers", "Sport Club",
];

// Cria o gerador de nomes a partir de um provedor faker por grupo de idioma:
// `fakerByGroup` = { pt: <Faker>, en: <Faker>, ... }. Se `seed` for informado,
// as instâncias são semeadas para gerar nomes de forma reprodutível.
export function createNameGenerator(fakerByGroup = {}, { seed } = {}) {
  if (Number.isFinite(seed)) {
    for (const faker of Object.values(fakerByGroup)) {
      if (typeof faker?.seed === "function") faker.seed(seed);
    }
  }

  const fakerFor = (countryCode) => {
    const group = languageGroupForCountry(countryCode);
    return fakerByGroup[group] ?? fakerByGroup.en ?? Object.values(fakerByGroup)[0];
  };

  return {
    languageGroupForCountry,
    // Nome completo de atleta na nacionalidade informada.
    personName(countryCode) {
      const faker = fakerFor(countryCode);
      return `${faker.person.firstName()} ${faker.person.lastName()}`.trim();
    },
    // Nome de clube: cidade/estado do país + uma denominação esportiva (prefixo
    // ou sufixo), alternando para variar.
    clubName(countryCode) {
      const faker = fakerFor(countryCode);
      const place = faker.location.city();
      const usePrefix = faker.number.int({ min: 0, max: 1 }) === 0;
      if (usePrefix) {
        return `${faker.helpers.arrayElement(CLUB_PREFIXES)} ${place}`;
      }
      return `${place} ${faker.helpers.arrayElement(CLUB_SUFFIXES)}`;
    },
  };
}
