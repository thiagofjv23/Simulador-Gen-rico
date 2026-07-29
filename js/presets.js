const ATP_2026_TOURNAMENTS = [
  ["brisbane", "Brisbane International presented by ANZ", "2026-01-05", "2026-01-11", "Brisbane, Austrália", "Dura", "ATP 250"],
  ["hong-kong", "Bank of China Hong Kong Tennis Open", "2026-01-05", "2026-01-11", "Hong Kong", "Dura", "ATP 250"],
  ["adelaide", "Adelaide International", "2026-01-12", "2026-01-17", "Adelaide, Austrália", "Dura", "ATP 250"],
  ["auckland", "ASB Classic", "2026-01-12", "2026-01-17", "Auckland, Nova Zelândia", "Dura", "ATP 250"],
  ["australian-open", "Australian Open", "2026-01-18", "2026-02-01", "Melbourne, Austrália", "Dura", "Grand Slam"],
  ["montpellier", "Open Occitanie", "2026-02-02", "2026-02-08", "Montpellier, França", "Dura coberta", "ATP 250"],
  ["dallas", "Dallas Open", "2026-02-09", "2026-02-15", "Dallas, Estados Unidos", "Dura coberta", "ATP 500"],
  ["rotterdam", "ABN AMRO Open", "2026-02-09", "2026-02-15", "Roterdã, Países Baixos", "Dura coberta", "ATP 500"],
  ["buenos-aires", "IEB+ Argentina Open", "2026-02-09", "2026-02-15", "Buenos Aires, Argentina", "Saibro", "ATP 250"],
  ["doha", "Qatar ExxonMobil Open", "2026-02-16", "2026-02-22", "Doha, Catar", "Dura", "ATP 500"],
  ["rio", "Rio Open presented by Claro", "2026-02-16", "2026-02-22", "Rio de Janeiro, Brasil", "Saibro", "ATP 500"],
  ["delray-beach", "Delray Beach Open", "2026-02-16", "2026-02-22", "Delray Beach, Estados Unidos", "Dura", "ATP 250"],
  ["acapulco", "Abierto Mexicano Telcel presentado por HSBC", "2026-02-23", "2026-02-28", "Acapulco, México", "Dura", "ATP 500"],
  ["dubai", "Dubai Duty Free Tennis Championships", "2026-02-23", "2026-03-01", "Dubai, Emirados Árabes Unidos", "Dura", "ATP 500"],
  ["santiago", "Bci Seguros Chile Open", "2026-02-23", "2026-03-01", "Santiago, Chile", "Saibro", "ATP 250"],
  ["indian-wells", "BNP Paribas Open", "2026-03-04", "2026-03-15", "Indian Wells, Estados Unidos", "Dura", "ATP Masters 1000"],
  ["miami", "Miami Open presented by Itaú", "2026-03-18", "2026-03-29", "Miami, Estados Unidos", "Dura", "ATP Masters 1000"],
  ["bucharest", "Tiriac Open presented by UniCredit Bank", "2026-03-30", "2026-04-05", "Bucareste, Romênia", "Saibro", "ATP 250"],
  ["houston", "Fayez Sarofim & Co. U.S. Men's Clay Court Championship", "2026-03-30", "2026-04-05", "Houston, Estados Unidos", "Saibro", "ATP 250"],
  ["marrakech", "Grand Prix Hassan II", "2026-03-30", "2026-04-05", "Marrakech, Marrocos", "Saibro", "ATP 250"],
  ["monte-carlo", "Rolex Monte-Carlo Masters", "2026-04-05", "2026-04-12", "Monte Carlo, Mônaco", "Saibro", "ATP Masters 1000"],
  ["barcelona", "Barcelona Open Banc Sabadell", "2026-04-13", "2026-04-19", "Barcelona, Espanha", "Saibro", "ATP 500"],
  ["munich", "BMW Open by Bitpanda", "2026-04-13", "2026-04-19", "Munique, Alemanha", "Saibro", "ATP 500"],
  ["madrid", "Mutua Madrid Open", "2026-04-22", "2026-05-03", "Madri, Espanha", "Saibro", "ATP Masters 1000"],
  ["rome", "Internazionali BNL d'Italia", "2026-05-06", "2026-05-17", "Roma, Itália", "Saibro", "ATP Masters 1000"],
  ["hamburg", "Bitpanda Hamburg Open", "2026-05-17", "2026-05-23", "Hamburgo, Alemanha", "Saibro", "ATP 500"],
  ["geneva", "Gonet Geneva Open", "2026-05-17", "2026-05-23", "Genebra, Suíça", "Saibro", "ATP 250"],
  ["roland-garros", "Roland-Garros", "2026-05-24", "2026-06-07", "Paris, França", "Saibro", "Grand Slam"],
  ["stuttgart", "BOSS Open", "2026-06-08", "2026-06-14", "Stuttgart, Alemanha", "Grama", "ATP 250"],
  ["s-hertogenbosch", "Libema Open", "2026-06-08", "2026-06-14", "'s-Hertogenbosch, Países Baixos", "Grama", "ATP 250"],
  ["halle", "Terra Wortmann Open", "2026-06-15", "2026-06-21", "Halle, Alemanha", "Grama", "ATP 500"],
  ["london-queens", "HSBC Championships", "2026-06-15", "2026-06-21", "Londres, Reino Unido", "Grama", "ATP 500"],
  ["mallorca", "Mallorca Championships presented by ecotrans Group", "2026-06-21", "2026-06-27", "Mallorca, Espanha", "Grama", "ATP 250"],
  ["eastbourne", "Lexus Eastbourne Open", "2026-06-22", "2026-06-27", "Eastbourne, Reino Unido", "Grama", "ATP 250"],
  ["wimbledon", "The Championships, Wimbledon", "2026-06-29", "2026-07-12", "Londres, Reino Unido", "Grama", "Grand Slam"],
  ["bastad", "Nordea Open", "2026-07-13", "2026-07-19", "Båstad, Suécia", "Saibro", "ATP 250"],
  ["gstaad", "EFG Swiss Open Gstaad", "2026-07-13", "2026-07-19", "Gstaad, Suíça", "Saibro", "ATP 250"],
  ["umag", "Plava Laguna Croatia Open Umag", "2026-07-13", "2026-07-19", "Umag, Croácia", "Saibro", "ATP 250"],
  ["kitzbuhel", "Generali Open", "2026-07-20", "2026-07-26", "Kitzbühel, Áustria", "Saibro", "ATP 250"],
  ["estoril", "Millennium Estoril Open", "2026-07-20", "2026-07-26", "Estoril, Portugal", "Saibro", "ATP 250"],
  ["washington", "Mubadala Citi DC Open", "2026-07-27", "2026-08-02", "Washington, Estados Unidos", "Dura", "ATP 500"],
  ["los-cabos", "Mifel Tennis Open by Telcel Oppo", "2026-07-27", "2026-08-02", "Los Cabos, México", "Dura", "ATP 250"],
  ["montreal", "National Bank Open Presented by Rogers", "2026-08-02", "2026-08-12", "Montreal, Canadá", "Dura", "ATP Masters 1000"],
  ["cincinnati", "Cincinnati Open", "2026-08-13", "2026-08-23", "Cincinnati, Estados Unidos", "Dura", "ATP Masters 1000"],
  ["winston-salem", "Winston-Salem Open", "2026-08-23", "2026-08-29", "Winston-Salem, Estados Unidos", "Dura", "ATP 250"],
  ["us-open", "US Open", "2026-08-31", "2026-09-13", "Nova York, Estados Unidos", "Dura", "Grand Slam"],
  ["chengdu", "Chengdu Open", "2026-09-23", "2026-09-29", "Chengdu, China", "Dura", "ATP 250"],
  ["hangzhou", "Lynk & Co Hangzhou Open", "2026-09-23", "2026-09-29", "Hangzhou, China", "Dura", "ATP 250"],
  ["tokyo", "Kinoshita Group Japan Open Tennis Championships", "2026-09-30", "2026-10-06", "Tóquio, Japão", "Dura", "ATP 500"],
  ["beijing", "China Open", "2026-09-30", "2026-10-06", "Pequim, China", "Dura", "ATP 500"],
  ["shanghai", "Rolex Shanghai Masters", "2026-10-07", "2026-10-18", "Xangai, China", "Dura", "ATP Masters 1000"],
  ["almaty", "Almaty Open", "2026-10-19", "2026-10-25", "Almaty, Cazaquistão", "Dura coberta", "ATP 250"],
  ["brussels", "BNP Paribas Fortis European Open", "2026-10-19", "2026-10-25", "Bruxelas, Bélgica", "Dura coberta", "ATP 250"],
  ["lyon", "Grand Prix Auvergne-Rhône-Alpes", "2026-10-19", "2026-10-25", "Lyon, França", "Dura coberta", "ATP 250"],
  ["basel", "Swiss Indoors Basel", "2026-10-26", "2026-11-01", "Basileia, Suíça", "Dura coberta", "ATP 500"],
  ["vienna", "Erste Bank Open", "2026-10-26", "2026-11-01", "Viena, Áustria", "Dura coberta", "ATP 500"],
  ["paris-masters", "Rolex Paris Masters", "2026-11-02", "2026-11-08", "Paris, França", "Dura coberta", "ATP Masters 1000"],
  ["stockholm", "BNP Paribas Nordic Open", "2026-11-08", "2026-11-14", "Estocolmo, Suécia", "Dura coberta", "ATP 250"],
  ["atp-finals", "Nitto ATP Finals", "2026-11-15", "2026-11-22", "Turim, Itália", "Dura coberta", "ATP Finals"],
].map(([id, name, startDate, endDate, city, surface, category]) => ({
  id,
  name,
  startDate,
  endDate,
  city,
  surface,
  category,
}));

const FORMULA_1_2026_GRANDS_PRIX = [
  ["australia", "Grande Prêmio da Austrália", "2026-03-06", "2026-03-08", "Melbourne, Austrália"],
  ["china", "Grande Prêmio da China", "2026-03-13", "2026-03-15", "Xangai, China"],
  ["japan", "Grande Prêmio do Japão", "2026-03-27", "2026-03-29", "Suzuka, Japão"],
  ["bahrain", "Grande Prêmio do Bahrein", "2026-04-10", "2026-04-12", "Sakhir, Bahrein"],
  ["saudi-arabia", "Grande Prêmio da Arábia Saudita", "2026-04-17", "2026-04-19", "Jeddah, Arábia Saudita"],
  ["miami", "Grande Prêmio de Miami", "2026-05-01", "2026-05-03", "Miami, Estados Unidos"],
  ["canada", "Grande Prêmio do Canadá", "2026-05-22", "2026-05-24", "Montreal, Canadá"],
  ["monaco", "Grande Prêmio de Mônaco", "2026-06-05", "2026-06-07", "Mônaco"],
  ["barcelona", "Grande Prêmio de Barcelona-Catalunha", "2026-06-12", "2026-06-14", "Barcelona, Espanha"],
  ["austria", "Grande Prêmio da Áustria", "2026-06-26", "2026-06-28", "Spielberg, Áustria"],
  ["great-britain", "Grande Prêmio da Grã-Bretanha", "2026-07-03", "2026-07-05", "Silverstone, Reino Unido"],
  ["belgium", "Grande Prêmio da Bélgica", "2026-07-17", "2026-07-19", "Spa-Francorchamps, Bélgica"],
  ["hungary", "Grande Prêmio da Hungria", "2026-07-24", "2026-07-26", "Budapeste, Hungria"],
  ["netherlands", "Grande Prêmio dos Países Baixos", "2026-08-21", "2026-08-23", "Zandvoort, Países Baixos"],
  ["italy", "Grande Prêmio da Itália", "2026-09-04", "2026-09-06", "Monza, Itália"],
  ["madrid", "Grande Prêmio da Espanha — Madri", "2026-09-11", "2026-09-13", "Madri, Espanha"],
  ["azerbaijan", "Grande Prêmio do Azerbaijão", "2026-09-24", "2026-09-26", "Baku, Azerbaijão"],
  ["singapore", "Grande Prêmio de Singapura", "2026-10-09", "2026-10-11", "Singapura"],
  ["united-states", "Grande Prêmio dos Estados Unidos", "2026-10-23", "2026-10-25", "Austin, Estados Unidos"],
  ["mexico", "Grande Prêmio da Cidade do México", "2026-10-30", "2026-11-01", "Cidade do México, México"],
  ["brazil", "Grande Prêmio de São Paulo", "2026-11-06", "2026-11-08", "São Paulo, Brasil"],
  ["las-vegas", "Grande Prêmio de Las Vegas", "2026-11-19", "2026-11-21", "Las Vegas, Estados Unidos"],
  ["qatar", "Grande Prêmio do Catar", "2026-11-27", "2026-11-29", "Lusail, Catar"],
  ["abu-dhabi", "Grande Prêmio de Abu Dhabi", "2026-12-04", "2026-12-06", "Yas Marina, Emirados Árabes Unidos"],
].map(([id, name, startDate, endDate, city], index, rounds) => ({
  id,
  name,
  startDate,
  endDate,
  city,
  category: "Grande Prêmio",
  round: index + 1,
  finalRound: index === rounds.length - 1,
}));

// F2 e F3 correm nos fins de semana da F1, então cada etapa reaproveita as datas
// (janela de três dias) do Grande Prêmio correspondente do calendário de 2026.
const F1_ROUND_BY_ID = new Map(
  FORMULA_1_2026_GRANDS_PRIX.map((round) => [round.id, round]),
);

function buildSupportRounds(seriesLabel, roundIds) {
  return roundIds.map((roundId, index) => {
    const grandPrix = F1_ROUND_BY_ID.get(roundId);
    const city = grandPrix.city.split(",")[0];
    return {
      id: roundId,
      name: `${seriesLabel} — ${city}`,
      startDate: grandPrix.startDate,
      endDate: grandPrix.endDate,
      city: grandPrix.city,
      category: "Rodada",
      round: index + 1,
      finalRound: index === roundIds.length - 1,
    };
  });
}

// Calendário de apoio de 14 rodadas da Fórmula 2 em 2026.
const FORMULA_2_2026_ROUNDS = buildSupportRounds("Fórmula 2", [
  "australia",
  "bahrain",
  "saudi-arabia",
  "monaco",
  "barcelona",
  "austria",
  "great-britain",
  "belgium",
  "hungary",
  "netherlands",
  "italy",
  "azerbaijan",
  "qatar",
  "abu-dhabi",
]);

// Calendário de apoio de 10 rodadas da Fórmula 3 em 2026.
const FORMULA_3_2026_ROUNDS = buildSupportRounds("Fórmula 3", [
  "australia",
  "bahrain",
  "saudi-arabia",
  "barcelona",
  "monaco",
  "austria",
  "great-britain",
  "belgium",
  "hungary",
  "italy",
]);

const F1_2026_DRIVERS = [
  ["max-verstappen", "Max Verstappen", "Red Bull Racing", "NED", "Países Baixos", "continent_europe", 28, 99, 3],
  ["isack-hadjar", "Isack Hadjar", "Red Bull Racing", "FRA", "França", "continent_europe", 21, 86, 1],
  ["lando-norris", "Lando Norris", "McLaren", "GBR", "Reino Unido", "continent_europe", 26, 96, 2],
  ["oscar-piastri", "Oscar Piastri", "McLaren", "AUS", "Austrália", "continent_oceania", 25, 95, 2],
  ["charles-leclerc", "Charles Leclerc", "Ferrari", "MON", "Mônaco", "continent_europe", 28, 96, 1],
  ["lewis-hamilton", "Lewis Hamilton", "Ferrari", "GBR", "Reino Unido", "continent_europe", 41, 93, 0],
  ["george-russell", "George Russell", "Mercedes", "GBR", "Reino Unido", "continent_europe", 28, 95, 2],
  ["kimi-antonelli", "Kimi Antonelli", "Mercedes", "ITA", "Itália", "continent_europe", 19, 91, 3],
  ["fernando-alonso", "Fernando Alonso", "Aston Martin", "ESP", "Espanha", "continent_europe", 44, 92, 0],
  ["lance-stroll", "Lance Stroll", "Aston Martin", "CAN", "Canadá", "continent_north_america", 27, 81, -1],
  ["pierre-gasly", "Pierre Gasly", "Alpine", "FRA", "França", "continent_europe", 30, 88, 1],
  ["franco-colapinto", "Franco Colapinto", "Alpine", "ARG", "Argentina", "continent_south_america", 23, 82, 0],
  ["esteban-ocon", "Esteban Ocon", "Haas", "FRA", "França", "continent_europe", 29, 86, 0],
  ["oliver-bearman", "Oliver Bearman", "Haas", "GBR", "Reino Unido", "continent_europe", 21, 85, 2],
  ["liam-lawson", "Liam Lawson", "Racing Bulls", "NZL", "Nova Zelândia", "continent_oceania", 24, 83, 0],
  ["arvid-lindblad", "Arvid Lindblad", "Racing Bulls", "GBR", "Reino Unido", "continent_europe", 18, 80, 1],
  ["alexander-albon", "Alexander Albon", "Williams", "THA", "Tailândia", "continent_asia", 30, 88, 1],
  ["carlos-sainz", "Carlos Sainz", "Williams", "ESP", "Espanha", "continent_europe", 31, 90, 0],
  ["nico-hulkenberg", "Nico Hülkenberg", "Audi", "GER", "Alemanha", "continent_europe", 38, 86, 0],
  ["gabriel-bortoleto", "Gabriel Bortoleto", "Audi", "BRA", "Brasil", "continent_south_america", 21, 84, 1],
  ["valtteri-bottas", "Valtteri Bottas", "Cadillac", "FIN", "Finlândia", "continent_europe", 36, 86, 0],
  ["sergio-perez", "Sergio Pérez", "Cadillac", "MEX", "México", "continent_north_america", 36, 84, -1],
].map(([
  id,
  driverName,
  teamName,
  countryCode,
  countryName,
  continentId,
  age,
  baseRating,
  momentum,
]) => ({
  id: `person_f1_${id}`,
  name: `${driverName} (${teamName})`,
  driverName,
  teamName,
  countryCode,
  countryName,
  countryId: `country_${countryCode.toLocaleLowerCase()}`,
  continentId,
  gender: "M",
  age,
  baseRating,
  momentum,
  sportId: "sport_motorsport",
  modalityId: "modality_motorsport_formula1",
  rosterType: "preset",
  presetId: "fia-ecosystem-2026",
}));

// Grid aproximado da Fórmula 2 de 2026: 11 equipes com dois pilotos cada. Os
// ratings medem a força individual estimada, não a do carro, como na F1.
const F2_2026_DRIVERS = [
  ["fornaroli", "Leonardo Fornaroli", "Invicta Racing", "ITA", "Itália", "continent_europe", 21, 90, 2],
  ["stanek", "Roman Staněk", "Invicta Racing", "CZE", "Tchéquia", "continent_europe", 22, 83, 0],
  ["dunne", "Alex Dunne", "Rodin Motorsport", "IRL", "Irlanda", "continent_europe", 20, 89, 3],
  ["cordeel", "Amaury Cordeel", "Rodin Motorsport", "BEL", "Bélgica", "continent_europe", 23, 80, -1],
  ["crawford", "Jak Crawford", "DAMS Lucas Oil", "USA", "Estados Unidos", "continent_north_america", 21, 88, 2],
  ["maini", "Kush Maini", "DAMS Lucas Oil", "IND", "Índia", "continent_asia", 25, 85, 0],
  ["hauger", "Dennis Hauger", "Hitech TGR", "NOR", "Noruega", "continent_europe", 22, 88, 1],
  ["browning", "Luke Browning", "Hitech TGR", "GBR", "Reino Unido", "continent_europe", 24, 86, 1],
  ["camara", "Rafael Câmara", "Van Amersfoort Racing", "BRA", "Brasil", "continent_south_america", 20, 87, 3],
  ["shields", "Cian Shields", "Van Amersfoort Racing", "GBR", "Reino Unido", "continent_europe", 21, 80, 0],
  ["tsolov", "Nikola Tsolov", "ART Grand Prix", "BGR", "Bulgária", "continent_europe", 19, 87, 3],
  ["van-hoepen", "Laurens van Hoepen", "ART Grand Prix", "NED", "Países Baixos", "continent_europe", 20, 82, 1],
  ["verschoor", "Richard Verschoor", "MP Motorsport", "NED", "Países Baixos", "continent_europe", 25, 86, 0],
  ["goethe", "Oliver Goethe", "MP Motorsport", "GER", "Alemanha", "continent_europe", 21, 85, 2],
  ["beganovic", "Dino Beganović", "Prema Racing", "SWE", "Suécia", "continent_europe", 22, 86, 2],
  ["montoya", "Sebastián Montoya", "Prema Racing", "COL", "Colômbia", "continent_south_america", 21, 84, 1],
  ["marti", "Josep María Martí", "Campos Racing", "ESP", "Espanha", "continent_europe", 22, 84, 1],
  ["boya", "Mari Boya", "Campos Racing", "ESP", "Espanha", "continent_europe", 21, 83, 1],
  ["meguetounif", "Sami Meguetounif", "Trident", "FRA", "França", "continent_europe", 21, 83, 1],
  ["esterson", "Max Esterson", "Trident", "USA", "Estados Unidos", "continent_north_america", 21, 81, 1],
  ["durksen", "Joshua Dürksen", "AIX Racing", "PRY", "Paraguai", "continent_south_america", 23, 82, 0],
  ["sztuka", "Kacper Sztuka", "AIX Racing", "POL", "Polônia", "continent_europe", 20, 82, 1],
].map(([
  id,
  driverName,
  teamName,
  countryCode,
  countryName,
  continentId,
  age,
  baseRating,
  momentum,
]) => ({
  id: `person_f2_${id}`,
  name: `${driverName} (${teamName})`,
  driverName,
  teamName,
  countryCode,
  countryName,
  countryId: `country_${countryCode.toLocaleLowerCase()}`,
  continentId,
  gender: "M",
  age,
  baseRating,
  momentum,
  sportId: "sport_motorsport",
  modalityId: "modality_motorsport_formula2",
  rosterType: "preset",
  presetId: "fia-ecosystem-2026",
}));

// Grid aproximado da Fórmula 3 de 2026: 10 equipes com três pilotos cada.
const F3_2026_DRIVERS = [
  ["taponen", "Tuukka Taponen", "Prema Racing", "FIN", "Finlândia", "continent_europe", 18, 85, 3],
  ["badoer", "Brando Badoer", "Prema Racing", "ITA", "Itália", "continent_europe", 19, 82, 1],
  ["bedrin", "Nikita Bedrin", "Prema Racing", "ITA", "Itália", "continent_europe", 19, 80, 0],
  ["wharton", "James Wharton", "Trident", "AUS", "Austrália", "continent_oceania", 19, 83, 2],
  ["wurz", "Charlie Wurz", "Trident", "AUT", "Áustria", "continent_europe", 18, 79, 1],
  ["leon", "Noel León", "Trident", "MEX", "México", "continent_north_america", 19, 78, 0],
  ["ugochukwu", "Ugo Ugochukwu", "ART Grand Prix", "USA", "Estados Unidos", "continent_north_america", 18, 84, 3],
  ["nael", "Théophile Naël", "ART Grand Prix", "FRA", "França", "continent_europe", 18, 80, 1],
  ["seewooruthun", "Reza Seewooruthun", "ART Grand Prix", "FRA", "França", "continent_europe", 18, 78, 0],
  ["mansell", "Christian Mansell", "Campos Racing", "AUS", "Austrália", "continent_oceania", 20, 79, 0],
  ["hideg", "Ádám Hideg", "Campos Racing", "HUN", "Hungria", "continent_europe", 18, 77, 0],
  ["bohra", "Nikhil Bohra", "Campos Racing", "IND", "Índia", "continent_asia", 17, 76, 1],
  ["stenshorne", "Martinius Stenshorne", "Hitech TGR", "NOR", "Noruega", "continent_europe", 18, 82, 2],
  ["gowda", "Dion Gowda", "Hitech TGR", "GBR", "Reino Unido", "continent_europe", 18, 78, 0],
  ["das", "Cameron Das", "Hitech TGR", "USA", "Estados Unidos", "continent_north_america", 20, 76, 0],
  ["spina", "Alfio Spina", "MP Motorsport", "ITA", "Itália", "continent_europe", 18, 77, 0],
  ["inthraphuvasak", "Tasanapol Inthraphuvasak", "MP Motorsport", "THA", "Tailândia", "continent_asia", 18, 76, 0],
  ["francot", "Reno Francot", "MP Motorsport", "NED", "Países Baixos", "continent_europe", 19, 77, 0],
  ["slater", "Freddie Slater", "Van Amersfoort Racing", "GBR", "Reino Unido", "continent_europe", 17, 84, 3],
  ["deligny", "Enzo Deligny", "Van Amersfoort Racing", "FRA", "França", "continent_europe", 17, 79, 1],
  ["depalo", "Matteo De Palo", "Van Amersfoort Racing", "ITA", "Itália", "continent_europe", 18, 78, 0],
  ["lacorte", "Nicola Lacorte", "AIX Racing", "ITA", "Itália", "continent_europe", 17, 79, 1],
  ["nakamura", "Kean Nakamura-Berta", "AIX Racing", "JPN", "Japão", "continent_asia", 18, 80, 1],
  ["delpino", "Bruno del Pino", "AIX Racing", "ESP", "Espanha", "continent_europe", 18, 77, 0],
  ["olivieri", "Emanuele Olivieri", "DAMS Lucas Oil", "GBR", "Reino Unido", "continent_europe", 19, 78, 0],
  ["domingues", "Ivan Domingues", "DAMS Lucas Oil", "POR", "Portugal", "continent_europe", 18, 76, 0],
  ["stolcermanis", "Tomass Stolcermanis", "DAMS Lucas Oil", "LVA", "Letônia", "continent_europe", 18, 75, 0],
  ["sharp", "Louis Sharp", "Rodin Motorsport", "NZL", "Nova Zelândia", "continent_oceania", 18, 80, 1],
  ["voisin", "Callum Voisin", "Rodin Motorsport", "GBR", "Reino Unido", "continent_europe", 19, 80, 1],
  ["mclaughlin", "Fionn McLaughlin", "Rodin Motorsport", "IRL", "Irlanda", "continent_europe", 18, 78, 0],
].map(([
  id,
  driverName,
  teamName,
  countryCode,
  countryName,
  continentId,
  age,
  baseRating,
  momentum,
]) => ({
  id: `person_f3_${id}`,
  name: `${driverName} (${teamName})`,
  driverName,
  teamName,
  countryCode,
  countryName,
  countryId: `country_${countryCode.toLocaleLowerCase()}`,
  continentId,
  gender: "M",
  age,
  baseRating,
  momentum,
  sportId: "sport_motorsport",
  modalityId: "modality_motorsport_formula3",
  rosterType: "preset",
  presetId: "fia-ecosystem-2026",
}));

// Calendário oficial de 8 rodadas da Fórmula Regional Europeia (FREC) de 2026.
// Diferente de F2/F3, a categoria tem circuitos e datas próprios (não apoia a
// F1), então cada rodada define seu fim de semana de três dias diretamente.
const FORMULA_REGIONAL_2026_ROUNDS = [
  ["red-bull-ring", "Fórmula Regional — Spielberg", "2026-04-24", "2026-04-26", "Spielberg, Áustria"],
  ["zandvoort", "Fórmula Regional — Zandvoort", "2026-05-22", "2026-05-24", "Zandvoort, Países Baixos"],
  ["spa", "Fórmula Regional — Spa-Francorchamps", "2026-05-29", "2026-05-31", "Spa-Francorchamps, Bélgica"],
  ["monza", "Fórmula Regional — Monza", "2026-06-19", "2026-06-21", "Monza, Itália"],
  ["hungaroring", "Fórmula Regional — Budapeste", "2026-07-03", "2026-07-05", "Budapeste, Hungria"],
  ["paul-ricard", "Fórmula Regional — Le Castellet", "2026-07-17", "2026-07-19", "Le Castellet, França"],
  ["imola", "Fórmula Regional — Imola", "2026-09-04", "2026-09-06", "Imola, Itália"],
  ["hockenheim", "Fórmula Regional — Hockenheim", "2026-09-11", "2026-09-13", "Hockenheim, Alemanha"],
].map(([id, name, startDate, endDate, city], index, rounds) => ({
  id,
  name,
  startDate,
  endDate,
  city,
  category: "Rodada",
  round: index + 1,
  finalRound: index === rounds.length - 1,
}));

// Grid da Fórmula Regional Europeia de 2026: 10 equipes com três pilotos cada,
// conforme a entry list oficial. Ratings aproximados da força individual.
const FORMULA_REGIONAL_2026_DRIVERS = [
  ["munoz", "Alexandre Munoz", "ART Grand Prix", "FRA", "França", "continent_europe", 18, 85, 2],
  ["giaccardi", "Matteo Giaccardi", "ART Grand Prix", "ITA", "Itália", "continent_europe", 18, 79, 0],
  ["anurag", "Kabir Anurag", "ART Grand Prix", "IND", "Índia", "continent_asia", 18, 80, 1],
  ["frey", "Enea Frey", "CL Motorsport", "CHE", "Suíça", "continent_europe", 17, 78, 0],
  ["strauven", "Thomas Strauven", "CL Motorsport", "BEL", "Bélgica", "continent_europe", 18, 79, 1],
  ["roussel", "Jules Roussel", "CL Motorsport", "FRA", "França", "continent_europe", 18, 77, 0],
  ["saeter", "Marcus Sæter", "G4 Racing", "NOR", "Noruega", "continent_europe", 18, 78, 1],
  ["al-maosherji", "Saqer Al Maosherji", "G4 Racing", "ARE", "Emirados Árabes Unidos", "continent_asia", 18, 76, 0],
  ["alibhai", "Rahim Alibhai", "G4 Racing", "GBR", "Reino Unido", "continent_europe", 18, 75, 0],
  ["wheldon", "Sebastian Wheldon", "MP Motorsport", "USA", "Estados Unidos", "continent_north_america", 17, 87, 3],
  ["chi", "Zhenrui Chi", "MP Motorsport", "CHN", "China", "continent_asia", 18, 83, 2],
  ["abkhazava", "Alexander Abkhazava", "MP Motorsport", "GEO", "Geórgia", "continent_asia", 17, 80, 1],
  ["nakamura-berta", "Kean Nakamura-Berta", "Prema Racing", "JPN", "Japão", "continent_asia", 18, 84, 2],
  ["stolcermanis", "Tomass Štolcermanis", "Prema Racing", "LVA", "Letônia", "continent_europe", 18, 80, 1],
  ["hanna", "Salim Hanna", "Prema Racing", "COL", "Colômbia", "continent_south_america", 16, 79, 1],
  ["al-dhaheri", "Rashid Al Dhaheri", "R-ace GP", "ARE", "Emirados Árabes Unidos", "continent_asia", 18, 88, 3],
  ["sano", "Yuki Sano", "R-ace GP", "JPN", "Japão", "continent_asia", 19, 82, 1],
  ["olivieri", "Emanuele Olivieri", "R-ace GP", "ITA", "Itália", "continent_europe", 19, 82, 1],
  ["seewooruthun", "Reza Seewooruthun", "Rodin Motorsport", "FRA", "França", "continent_europe", 18, 84, 2],
  ["ninovic", "Alex Ninovic", "Rodin Motorsport", "AUS", "Austrália", "continent_oceania", 19, 81, 0],
  ["gomez", "Gabriel Gomez", "Rodin Motorsport", "BRA", "Brasil", "continent_south_america", 19, 80, 0],
  ["przyrowski", "Jan Przyrowski", "RPM Motorsport", "POL", "Polônia", "continent_europe", 18, 81, 1],
  ["costa", "Miguel Costa", "RPM Motorsport", "POR", "Portugal", "continent_europe", 18, 80, 1],
  ["maschio", "Giovanni Maschio", "RPM Motorsport", "ITA", "Itália", "continent_europe", 18, 78, 0],
  ["popov", "Maximilian Popov", "Trident Motorsport", "ITA", "Itália", "continent_europe", 17, 82, 2],
  ["kostic", "Andrija Kostić", "Trident Motorsport", "SRB", "Sérvia", "continent_europe", 17, 80, 1],
  ["daryanani", "Kai Daryanani", "Trident Motorsport", "IND", "Índia", "continent_asia", 21, 78, 0],
  ["gowda", "Dion Gowda", "Van Amersfoort Racing", "GBR", "Reino Unido", "continent_europe", 18, 84, 2],
  ["macedo", "Francisco Macedo", "Van Amersfoort Racing", "POR", "Portugal", "continent_europe", 18, 79, 0],
  ["dupe", "Andrea Dupé", "Van Amersfoort Racing", "FRA", "França", "continent_europe", 17, 78, 0],
].map(([
  id,
  driverName,
  teamName,
  countryCode,
  countryName,
  continentId,
  age,
  baseRating,
  momentum,
]) => ({
  id: `person_frec_${id}`,
  name: `${driverName} (${teamName})`,
  driverName,
  teamName,
  countryCode,
  countryName,
  countryId: `country_${countryCode.toLocaleLowerCase()}`,
  continentId,
  gender: "M",
  age,
  baseRating,
  momentum,
  sportId: "sport_motorsport",
  modalityId: "modality_motorsport_formula_regional",
  rosterType: "preset",
  presetId: "fia-ecosystem-2026",
}));

const CATEGORY_SETTINGS = {
  "ATP 250": { prestige: 55, rankingPoints: 250, slots: 28 },
  "ATP 500": { prestige: 75, rankingPoints: 500, slots: 32 },
  "ATP Masters 1000": { prestige: 90, rankingPoints: 1000, slots: 96 },
  "Grand Slam": { prestige: 100, rankingPoints: 2000, slots: 128 },
  "ATP Finals": { prestige: 95, rankingPoints: 1500, slots: 8 },
};

export const CALENDAR_PRESETS = [
  {
    id: "atp-world-tour-2026",
    name: "Circuito mundial de tênis — ATP 2026",
    description:
      "59 torneios individuais com datas oficiais de 2026: ATP 250, ATP 500, Masters 1000, Grand Slams e ATP Finals.",
    sportId: "sport_tennis",
    modalityId: "modality_tennis_mens_singles",
    sportName: "Tênis",
    modalityName: "Simples masculino",
    scoringSystemId: "tennis-round-proportional",
    competitionModel: "standalone",
    sourceUrl: "https://www.atptour.com/en/news/what-is-the-2026-atp-tour-calendar",
    competitions: ATP_2026_TOURNAMENTS,
  },
  {
    id: "fia-ecosystem-2026",
    name: "Ecossistema FIA — 2026",
    description:
      "Fórmula 1, Fórmula 2, Fórmula 3 e Fórmula Regional de 2026 em um único preset: 56 etapas anuais de três dias e 104 pilotos com a equipe ao lado do nome. Cada categoria mantém sua própria classificação anual, zerada a cada temporada.",
    sportId: "sport_motorsport",
    sportName: "Automobilismo",
    sourceUrl: "https://www.fia.com/events",
    series: [
      {
        modalityId: "modality_motorsport_formula1",
        modalityName: "Fórmula 1",
        scoringSystemId: "formula1-grand-prix",
        competitionModel: "season_stage",
        seasonId: "formula1-world-championship",
        seasonName: "Campeonato Mundial de Fórmula 1",
        prestige: 100,
        rankingPoints: 25,
        athletes: F1_2026_DRIVERS,
        competitions: FORMULA_1_2026_GRANDS_PRIX,
      },
      {
        modalityId: "modality_motorsport_formula2",
        modalityName: "Fórmula 2",
        scoringSystemId: "formula1-grand-prix",
        competitionModel: "season_stage",
        seasonId: "formula2-championship",
        seasonName: "Campeonato de Fórmula 2 da FIA",
        prestige: 85,
        rankingPoints: 25,
        athletes: F2_2026_DRIVERS,
        competitions: FORMULA_2_2026_ROUNDS,
      },
      {
        modalityId: "modality_motorsport_formula3",
        modalityName: "Fórmula 3",
        scoringSystemId: "formula1-grand-prix",
        competitionModel: "season_stage",
        seasonId: "formula3-championship",
        seasonName: "Campeonato de Fórmula 3 da FIA",
        prestige: 70,
        rankingPoints: 25,
        athletes: F3_2026_DRIVERS,
        competitions: FORMULA_3_2026_ROUNDS,
      },
      {
        modalityId: "modality_motorsport_formula_regional",
        modalityName: "Fórmula Regional",
        scoringSystemId: "formula1-grand-prix",
        competitionModel: "season_stage",
        seasonId: "formula-regional-european-championship",
        seasonName: "Campeonato de Fórmula Regional Europeu da FIA",
        prestige: 55,
        rankingPoints: 25,
        athletes: FORMULA_REGIONAL_2026_DRIVERS,
        competitions: FORMULA_REGIONAL_2026_ROUNDS,
      },
    ],
  },
];

// Normaliza qualquer preset numa lista de séries. Presets antigos de uma única
// modalidade (como o ATP) viram uma série; presets multimodalidade (como o
// Ecossistema FIA) expõem cada categoria com seus próprios pilotos e etapas.
export function presetSeries(preset) {
  if (!preset) return [];
  if (Array.isArray(preset.series)) {
    return preset.series.map((series) => ({
      sportId: series.sportId ?? preset.sportId,
      sportName: series.sportName ?? preset.sportName,
      modalityId: series.modalityId,
      modalityName: series.modalityName,
      scoringSystemId: series.scoringSystemId ?? preset.scoringSystemId ?? "generic-proportional",
      competitionModel: series.competitionModel ?? preset.competitionModel ?? "standalone",
      seasonId: series.seasonId ?? null,
      seasonName: series.seasonName ?? null,
      prestige: series.prestige,
      rankingPoints: series.rankingPoints,
      athletes: series.athletes ?? [],
      competitions: series.competitions ?? [],
    }));
  }
  return [{
    sportId: preset.sportId,
    sportName: preset.sportName,
    modalityId: preset.modalityId,
    modalityName: preset.modalityName,
    scoringSystemId: preset.scoringSystemId ?? "generic-proportional",
    competitionModel: preset.competitionModel ?? "standalone",
    seasonId: preset.seasonId ?? null,
    seasonName: preset.seasonName ?? null,
    prestige: preset.prestige,
    rankingPoints: preset.rankingPoints,
    athletes: preset.athletes ?? [],
    competitions: preset.competitions ?? [],
  }];
}

export function presetById(presetId) {
  return CALENDAR_PRESETS.find((preset) => preset.id === presetId) ?? null;
}

export function buildPresetCompetitions(preset, timestamp = new Date().toISOString()) {
  if (!preset) return [];

  const multiSeries = Array.isArray(preset.series);

  return presetSeries(preset).flatMap((series) => {
    const isSeasonStage = series.competitionModel === "season_stage";
    // Em presets multimodalidade, o ID da etapa inclui a modalidade para não
    // colidir entre categorias que compartilham o mesmo fim de semana.
    const seriesKey = multiSeries ? `${series.modalityId}_` : "";

    return series.competitions.map((tournament) => {
      const settings = CATEGORY_SETTINGS[tournament.category] ?? {
        prestige: series.prestige ?? 100,
        rankingPoints: series.rankingPoints ?? 25,
        slots: series.athletes?.length ?? 22,
      };
      const stableId = `preset_${preset.id}_${seriesKey}${tournament.id}`;
      return {
        id: stableId,
        calendarEventId: `event_${stableId}`,
        presetId: preset.id,
        name: tournament.name,
        sportId: series.sportId,
        modalityId: series.modalityId,
        sport: series.sportName,
        discipline: series.modalityName,
        type: isSeasonStage ? "league" : "championship",
        qualification: "ranking",
        geographicScope: "world",
        continentId: null,
        countryId: null,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        recurrence: isSeasonStage ? "yearly" : "none",
        prestige: settings.prestige,
        rankingPoints: settings.rankingPoints,
        scoringSystemId: series.scoringSystemId ?? "generic-proportional",
        slots: settings.slots,
        minimumRanking: null,
        competitionModel: series.competitionModel ?? "standalone",
        seasonId: series.seasonId ?? null,
        seasonName: series.seasonName ?? null,
        seasonalRanking: isSeasonStage,
        seasonRound: tournament.round ?? null,
        seasonRoundCount: isSeasonStage ? series.competitions.length : null,
        seasonFinalRound: Boolean(tournament.finalRound),
        participantIds: isSeasonStage
          ? series.athletes.map(({ id }) => id)
          : null,
        notes: [
          tournament.city,
          tournament.surface,
          tournament.category,
          tournament.round ? `Etapa ${tournament.round} de ${series.competitions.length}` : null,
        ].filter(Boolean).join(" · "),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    });
  });
}

export function buildPresetPeople(preset, timestamp = new Date().toISOString()) {
  return presetSeries(preset)
    .flatMap((series) => series.athletes)
    .map((person) => ({
      ...person,
      createdAt: person.createdAt ?? timestamp,
      updatedAt: timestamp,
    }));
}
