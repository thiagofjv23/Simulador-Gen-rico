import { createClub, clubIdFor } from "./clubs.js";
import { entityTypeForSport } from "./sports.js";
import { buildFixtures } from "./league.js";

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

// Top 50 do ranking mundial da ATP em 2026 (nomes e nacionalidades reais;
// ratings aproximados da força individual, como nos grids de automobilismo).
// O tênis não tem equipes, então o nome não recebe sufixo entre parênteses.
// Estes atletas entram no mesmo pool da modalidade e as vagas de cada torneio
// continuam sendo preenchidas por ranking, junto dos 100 atletas genéricos.
const ATP_2026_PLAYERS = [
  ["sinner", "Jannik Sinner", "ITA", "Itália", "continent_europe", 24, 99, 1],
  ["zverev", "Alexander Zverev", "GER", "Alemanha", "continent_europe", 29, 95, 1],
  ["alcaraz", "Carlos Alcaraz", "ESP", "Espanha", "continent_europe", 23, 97, 1],
  ["auger-aliassime", "Félix Auger-Aliassime", "CAN", "Canadá", "continent_north_america", 25, 90, 2],
  ["djokovic", "Novak Djokovic", "SRB", "Sérvia", "continent_europe", 39, 91, -3],
  ["medvedev", "Daniil Medvedev", "RUS", "Rússia", "continent_europe", 30, 89, -2],
  ["shelton", "Ben Shelton", "USA", "Estados Unidos", "continent_north_america", 23, 88, 2],
  ["cobolli", "Flavio Cobolli", "ITA", "Itália", "continent_europe", 24, 87, 2],
  ["fritz", "Taylor Fritz", "USA", "Estados Unidos", "continent_north_america", 28, 88, 0],
  ["de-minaur", "Alex de Minaur", "AUS", "Austrália", "continent_oceania", 27, 87, 1],
  ["bublik", "Alexander Bublik", "KAZ", "Cazaquistão", "continent_asia", 28, 85, 1],
  ["lehecka", "Jiří Lehečka", "CZE", "Tchéquia", "continent_europe", 24, 85, 1],
  ["ruud", "Casper Ruud", "NOR", "Noruega", "continent_europe", 27, 85, 0],
  ["musetti", "Lorenzo Musetti", "ITA", "Itália", "continent_europe", 24, 86, 1],
  ["rublev", "Andrey Rublev", "RUS", "Rússia", "continent_europe", 28, 84, -1],
  ["tien", "Learner Tien", "USA", "Estados Unidos", "continent_north_america", 20, 83, 4],
  ["mensik", "Jakub Menšík", "CZE", "Tchéquia", "continent_europe", 21, 84, 2],
  ["vacherot", "Valentin Vacherot", "MON", "Mônaco", "continent_europe", 27, 82, 1],
  ["tiafoe", "Frances Tiafoe", "USA", "Estados Unidos", "continent_north_america", 28, 83, 0],
  ["f-cerundolo", "Francisco Cerúndolo", "ARG", "Argentina", "continent_south_america", 27, 82, 0],
  ["paul", "Tommy Paul", "USA", "Estados Unidos", "continent_north_america", 29, 83, 0],
  ["fils", "Arthur Fils", "FRA", "França", "continent_europe", 21, 83, 3],
  ["darderi", "Luciano Darderi", "ITA", "Itália", "continent_europe", 24, 81, 1],
  ["jodar", "Rafael Jódar", "ESP", "Espanha", "continent_europe", 20, 79, 3],
  ["davidovich-fokina", "Alejandro Davidovich Fokina", "ESP", "Espanha", "continent_europe", 27, 81, 0],
  ["khachanov", "Karen Khachanov", "RUS", "Rússia", "continent_europe", 30, 81, 0],
  ["fonseca", "João Fonseca", "BRA", "Brasil", "continent_south_america", 19, 83, 5],
  ["rune", "Holger Rune", "DEN", "Dinamarca", "continent_europe", 23, 82, 0],
  ["humbert", "Ugo Humbert", "FRA", "França", "continent_europe", 28, 80, 0],
  ["tabilo", "Alejandro Tabilo", "CHI", "Chile", "continent_south_america", 29, 78, 0],
  ["etcheverry", "Tomás Martín Etcheverry", "ARG", "Argentina", "continent_south_america", 26, 78, 0],
  ["blockx", "Alexander Blockx", "BEL", "Bélgica", "continent_europe", 20, 78, 2],
  ["nakashima", "Brandon Nakashima", "USA", "Estados Unidos", "continent_north_america", 25, 79, 1],
  ["buse", "Ignacio Buse", "PER", "Peru", "continent_south_america", 22, 77, 2],
  ["arnaldi", "Matteo Arnaldi", "ITA", "Itália", "continent_europe", 25, 78, 0],
  ["bergs", "Zizou Bergs", "BEL", "Bélgica", "continent_europe", 27, 77, 1],
  ["fery", "Arthur Fery", "GBR", "Reino Unido", "continent_europe", 24, 78, 3],
  ["collignon", "Raphaël Collignon", "BEL", "Bélgica", "continent_europe", 24, 76, 1],
  ["norrie", "Cameron Norrie", "GBR", "Reino Unido", "continent_europe", 30, 77, -1],
  ["michelsen", "Alex Michelsen", "USA", "Estados Unidos", "continent_north_america", 21, 78, 2],
  ["berrettini", "Matteo Berrettini", "ITA", "Itália", "continent_europe", 30, 79, -1],
  ["struff", "Jan-Lennard Struff", "GER", "Alemanha", "continent_europe", 36, 76, -2],
  ["munar", "Jaume Munar", "ESP", "Espanha", "continent_europe", 29, 77, 0],
  ["navone", "Mariano Navone", "ARG", "Argentina", "continent_south_america", 25, 76, 0],
  ["hanfmann", "Yannick Hanfmann", "GER", "Alemanha", "continent_europe", 34, 74, -2],
  ["quinn", "Ethan Quinn", "USA", "Estados Unidos", "continent_north_america", 22, 76, 2],
  ["mannarino", "Adrian Mannarino", "FRA", "França", "continent_europe", 38, 74, -3],
  ["van-assche", "Luca Van Assche", "FRA", "França", "continent_europe", 22, 75, 1],
  ["borges", "Nuno Borges", "POR", "Portugal", "continent_europe", 29, 76, 0],
  ["jm-cerundolo", "Juan Manuel Cerúndolo", "ARG", "Argentina", "continent_south_america", 24, 75, 0],
].map(([
  id,
  playerName,
  countryCode,
  countryName,
  continentId,
  age,
  baseRating,
  momentum,
]) => ({
  id: `person_atp_${id}`,
  name: playerName,
  driverName: playerName,
  countryCode,
  countryName,
  countryId: `country_${countryCode.toLocaleLowerCase()}`,
  continentId,
  gender: "M",
  age,
  baseRating,
  momentum,
  sportId: "sport_tennis",
  modalityId: "modality_tennis_mens_singles",
  rosterType: "preset",
  presetId: "atp-world-tour-2026",
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
  ["red-bull-ring", "Fórmula Regional Europeia — Spielberg", "2026-04-24", "2026-04-26", "Spielberg, Áustria"],
  ["zandvoort", "Fórmula Regional Europeia — Zandvoort", "2026-05-22", "2026-05-24", "Zandvoort, Países Baixos"],
  ["spa", "Fórmula Regional Europeia — Spa-Francorchamps", "2026-05-29", "2026-05-31", "Spa-Francorchamps, Bélgica"],
  ["monza", "Fórmula Regional Europeia — Monza", "2026-06-19", "2026-06-21", "Monza, Itália"],
  ["hungaroring", "Fórmula Regional Europeia — Budapeste", "2026-07-03", "2026-07-05", "Budapeste, Hungria"],
  ["paul-ricard", "Fórmula Regional Europeia — Le Castellet", "2026-07-17", "2026-07-19", "Le Castellet, França"],
  ["imola", "Fórmula Regional Europeia — Imola", "2026-09-04", "2026-09-06", "Imola, Itália"],
  ["hockenheim", "Fórmula Regional Europeia — Hockenheim", "2026-09-11", "2026-09-13", "Hockenheim, Alemanha"],
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

// Calendário oficial de 4 etapas da Fórmula Regional Oriente Médio de 2026.
const FORMULA_REGIONAL_ME_2026_ROUNDS = [
  ["yas-marina-r1", "Fórmula Regional Oriente Médio — Yas Marina (Rodada 1)", "2026-01-16", "2026-01-18", "Abu Dhabi, Emirados Árabes Unidos"],
  ["yas-marina-r2", "Fórmula Regional Oriente Médio — Yas Marina (Rodada 2)", "2026-01-22", "2026-01-24", "Abu Dhabi, Emirados Árabes Unidos"],
  ["dubai", "Fórmula Regional Oriente Médio — Dubai Autodrome", "2026-01-29", "2026-01-31", "Dubai, Emirados Árabes Unidos"],
  ["lusail", "Fórmula Regional Oriente Médio — Lusail", "2026-02-10", "2026-02-12", "Lusail, Catar"],
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

// Grid oficial da Fórmula Regional Oriente Médio de 2026 (36 pilotos). Pilotos
// cujo nome coincide com o de outra categoria são vinculados ao mesmo atleta
// (mantendo o rating da categoria de origem) durante a montagem do preset; os
// campos aqui só valem para os pilotos exclusivos desta categoria.
const FORMULA_REGIONAL_ME_2026_DRIVERS = [
  ["nakamura-berta", "Kean Nakamura-Berta", "Mumbai Falcons Racing", "JPN", "Japão", "continent_asia", 18, 78, 5],
  ["al-dhaheri", "Rashid Al Dhaheri", "R-ace GP", "ARE", "Emirados Árabes", "continent_asia", 17, 77, 4],
  ["abkhazava", "Alexander Abkhazava", "MP Motorsport", "GEO", "Geórgia", "continent_europe", 19, 74, 3],
  ["powell", "Alex Powell", "Pinnacle Motorsport", "JAM", "Jamaica", "continent_north_america", 18, 73, 2],
  ["wheldon", "Sebastian Wheldon", "Mumbai Falcons Racing", "USA", "Estados Unidos", "continent_north_america", 17, 73, 3],
  ["przyrowski", "Jan Przyrowski", "RPM", "POL", "Polônia", "continent_europe", 18, 72, 2],
  ["popov", "Maximilian Popov", "Trident Motorsport", "ITA", "Itália", "continent_europe", 18, 72, 1],
  ["ninovic", "Alex Ninovic", "Rodin Motorsport", "AUS", "Austrália", "continent_oceania", 19, 71, 2],
  ["anurag", "Kabir Anurag", "ART Grand Prix", "SGP", "Singapura", "continent_asia", 19, 71, 0],
  ["hanna", "Salim Hanna", "Mumbai Falcons Racing", "COL", "Colômbia", "continent_south_america", 17, 70, 1],
  ["kato", "Taito Kato", "ART Grand Prix", "JPN", "Japão", "continent_asia", 17, 70, -1],
  ["ho", "Christian Ho", "MP Motorsport", "SGP", "Singapura", "continent_asia", 18, 69, 1],
  ["sano", "Yuki Sano", "R-ace GP", "JPN", "Japão", "continent_asia", 19, 69, 0],
  ["olivieri", "Emanuele Olivieri", "R-ace GP", "ITA", "Itália", "continent_europe", 18, 68, 2],
  ["costa", "Miguel Costa", "RPM", "BRA", "Brasil", "continent_south_america", 17, 68, -1],
  ["chi", "Zhenrui Chi", "CL Motorsport", "CHN", "China", "continent_asia", 18, 67, 1],
  ["severiukhin", "Artem Severiukhin", "G4 Racing", "KGZ", "Quirguistão", "continent_asia", 19, 66, 0],
  ["macedo", "Francisco Macedo", "Van Amersfoort Racing", "PRT", "Portugal", "continent_europe", 18, 66, -1],
  ["roussel", "Jules Roussel", "G4 Racing", "FRA", "França", "continent_europe", 18, 65, 0],
  ["rehm", "Maxim Rehm", "Rodin Motorsport", "DEU", "Alemanha", "continent_europe", 18, 65, 1],
  ["kostic", "Andrija Kostic", "Trident Motorsport", "SRB", "Sérvia", "continent_europe", 17, 64, -2],
  ["seewooruthun", "Reza Seewooruthun", "Rodin Motorsport", "GBR", "Reino Unido", "continent_europe", 18, 64, -1],
  ["daryanani", "Kai Daryanani", "Trident Motorsport", "IND", "Índia", "continent_asia", 19, 64, 0],
  ["dupe", "Andrea Dupé", "G4 Racing", "FRA", "França", "continent_europe", 17, 63, -1],
  ["gowda", "Dion Gowda", "Van Amersfoort Racing", "IND", "Índia", "continent_asia", 18, 63, -1],
  ["carrasquedo", "Jesse Carrasquedo Jr.", "MP Motorsport", "MEX", "México", "continent_north_america", 19, 63, 0],
  ["xie", "Gerrard Xie", "R-ace GP", "HKG", "Hong Kong", "continent_asia", 19, 62, -2],
  ["frey", "Enea Frey", "CL Motorsport", "CHE", "Suíça", "continent_europe", 18, 62, 0],
  ["inthraphuvasak", "Tasanapol Inthraphuvasak", "ART Grand Prix", "THA", "Tailândia", "continent_asia", 20, 62, 1],
  ["francot", "Reno Francot", "CL Motorsport", "NLD", "Países Baixos", "continent_europe", 18, 61, -2],
  ["giaccardi", "Matteo Giaccardi", "ART Grand Prix", "CHE", "Suíça", "continent_europe", 18, 61, 0],
  ["fu-yuhao", "Fu Yuhao", "Van Amersfoort Racing", "CHN", "China", "continent_asia", 19, 60, -1],
  ["maschio", "Giovanni Maschio", "RPM", "ITA", "Itália", "continent_europe", 20, 60, 0],
  ["feldmann", "Alceu Feldmann Neto", "MP Motorsport", "BRA", "Brasil", "continent_south_america", 17, 59, -3],
  ["belov", "Michael Belov", "CL Motorsport", "KGZ", "Quirguistão", "continent_asia", 24, 65, -4],
  ["raber", "August Raber", "Pinnacle Motorsport", "DEU", "Alemanha", "continent_europe", 17, 58, 0],
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
  id: `person_frecme_${id}`,
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
  modalityId: "modality_motorsport_formula_regional_middle_east",
  rosterType: "preset",
  presetId: "fia-ecosystem-2026",
}));

// ---------------------------------------------------------------------------
// Atletismo — Liga Mundial 2026 (elenco inicial). Nomes reais e nacionalidades
// reais; ratings aproximados. Cada prova é uma modalidade com seu próprio
// ranking rolante e resolução de etapa (baterias + tempo nas corridas;
// ranqueamento individual + distância nos saltos e arremesso).
// ---------------------------------------------------------------------------
const ATHLETICS_MEETINGS = [
  ["doha", "Doha", "2026-05-15", "2026-05-15"],
  ["rome", "Roma", "2026-06-04", "2026-06-04"],
  ["oslo", "Oslo", "2026-06-18", "2026-06-18"],
  ["paris", "Paris", "2026-07-03", "2026-07-03"],
  ["zurich", "Zurique", "2026-08-28", "2026-08-28"],
];

function athleticsRounds(eventLabel) {
  return ATHLETICS_MEETINGS.map(([id, city, startDate, endDate], index, all) => ({
    id,
    name: `${eventLabel} — ${city}`,
    startDate,
    endDate,
    city,
    category: "Etapa",
    round: index + 1,
    finalRound: index === all.length - 1,
  }));
}

function athleticsRoster(modalityId, slug, rows) {
  return rows.map(([id, name, countryCode, countryName, continentId, age, baseRating, momentum]) => ({
    id: `person_ath_${slug}_${id}`,
    name,
    driverName: name,
    countryCode,
    countryName,
    countryId: `country_${countryCode.toLocaleLowerCase()}`,
    continentId,
    gender: "M",
    age,
    baseRating,
    momentum,
    sportId: "sport_athletics",
    modalityId,
    rosterType: "preset",
    presetId: "world-athletics-2026",
  }));
}

const ATHLETICS_SERIES = [
  {
    modalityId: "modality_athletics_100m",
    modalityName: "100 metros rasos",
    label: "100 m",
    eventFormat: "heats",
    resultMetric: "direct-mark",
    markType: "time",
    heatSize: 8,
    athletes: athleticsRoster("modality_athletics_100m", "100m", [
  ["Lyles", "Noah Lyles", "USA", "Estados Unidos", "continent_north_america", 29, 98, 4],
  ["Thompson", "Kishane Thompson", "JAM", "Jamaica", "continent_north_america", 25, 97, 4],
  ["Tebogo", "Letsile Tebogo", "BOT", "Botsuana", "continent_africa", 23, 97, 5],
  ["Kerley", "Fred Kerley", "USA", "Estados Unidos", "continent_north_america", 31, 94, 2],
  ["Seville", "Oblique Seville", "JAM", "Jamaica", "continent_north_america", 25, 94, 3],
  ["Simbine", "Akani Simbine", "RSA", "África do Sul", "continent_africa", 32, 93, 3],
  ["Jacobs", "Lamont Marcell Jacobs", "ITA", "Itália", "continent_europe", 31, 92, 1],
  ["Coleman", "Christian Coleman", "USA", "Estados Unidos", "continent_north_america", 30, 93, 1],
  ["Omanyala", "Ferdinand Omanyala", "KEN", "Quênia", "continent_africa", 30, 91, 0],
  ["Hughes", "Zharnel Hughes", "GBR", "Reino Unido", "continent_europe", 31, 91, -1],
  ["Bednarek", "Kenneth Bednarek", "USA", "Estados Unidos", "continent_north_america", 28, 92, 3],
  ["Sani Brown", "Abdul Hakim Sani Brown", "JPN", "Japão", "continent_asia", 27, 89, 2],
  ["Hinchliffe", "Louie Hinchliffe", "GBR", "Reino Unido", "continent_europe", 24, 88, 3],
  ["Eseme", "Emmanuel Eseme", "CMR", "Camarões", "continent_africa", 33, 87, 1],
  ["Azu", "Jeremiah Azu", "GBR", "Reino Unido", "continent_europe", 25, 86, 1],
  ["Ali", "Chituru Ali", "ITA", "Itália", "continent_europe", 27, 88, 2],
  ["Espinosa", "Reynaldo Espinosa", "CUB", "Cuba", "continent_north_america", 23, 85, 2],
  ["De Grasse", "Andre De Grasse", "CAN", "Canadá", "continent_north_america", 31, 90, 1],
  ["Blake", "Yohan Blake", "JAM", "Jamaica", "continent_north_america", 36, 85, -2],
  ["Bardi", "Felipe Bardi", "BRA", "Brasil", "continent_south_america", 27, 86, 2],
  ["Cardoso", "Erik Cardoso", "BRA", "Brasil", "continent_south_america", 26, 85, 1],
  ["Su", "Su Bingtian", "CHN", "China", "continent_asia", 36, 84, -3],
  ["Xie", "Xie Zhenye", "CHN", "China", "continent_asia", 32, 86, 1],
  ["Browning", "Rohan Browning", "AUS", "Austrália", "continent_oceania", 28, 85, 0],
  ["Brown", "Aaron Brown", "CAN", "Canadá", "continent_north_america", 34, 87, 0],
  ["Cissé", "Arthur Cissé", "CIV", "Costa do Marfim", "continent_africa", 29, 86, 1],
  ["Onwuzurike", "Udodi Onwuzurike", "NGR", "Nigéria", "continent_africa", 23, 85, 2],
  ["Santos", "Diego Santos", "BRA", "Brasil", "continent_south_america", 28, 82, 1],
  ["Oliveira", "Paulo André de Oliveira", "BRA", "Brasil", "continent_south_america", 27, 83, -1],
  ["Nascimento", "Rodrigo do Nascimento", "BRA", "Brasil", "continent_south_america", 31, 82, 0],
  ["Rodrigues", "Lucas Rodrigues", "BRA", "Brasil", "continent_south_america", 24, 80, 2],
  ["Sakai", "Ryuichiro Sakai", "JPN", "Japão", "continent_asia", 28, 85, 1],
  ["Kiryu", "Yoshihide Kiryu", "JPN", "Japão", "continent_asia", 30, 84, 0],
  ["Tada", "Shuhei Tada", "JPN", "Japão", "continent_asia", 30, 83, -1],
  ["Maswanganyi", "Shaun Maswanganyi", "RSA", "África do Sul", "continent_africa", 25, 87, 2],
  ["Azamati", "Benjamin Azamati", "GHA", "Gana", "continent_africa", 28, 86, 1],
  ["Amoah", "Joseph Amoah", "GHA", "Gana", "continent_africa", 29, 84, 0],
  ["Brathwaite", "Rikkoi Brathwaite", "IVB", "Ilhas Virgens Britânicas", "continent_north_america", 26, 86, 2],
  ["Bromell", "Trayvon Bromell", "USA", "Estados Unidos", "continent_north_america", 31, 89, -2],
  ["Bracy", "Marvin Bracy", "USA", "Estados Unidos", "continent_north_america", 32, 88, -2],
  ["Lindsey", "Courtney Lindsey", "USA", "Estados Unidos", "continent_north_america", 27, 91, 3],
  ["Levell", "Bryan Levell", "JAM", "Jamaica", "continent_north_america", 22, 84, 2],
  ["Forte", "Julian Forte", "JAM", "Jamaica", "continent_north_america", 33, 85, -1],
  ["Tortu", "Filippo Tortu", "ITA", "Itália", "continent_europe", 28, 86, 1],
  ["Ceccarelli", "Samuele Ceccarelli", "ITA", "Itália", "continent_europe", 26, 84, -1],
  ["Zeze", "Méba-Mickaël Zeze", "FRA", "França", "continent_europe", 32, 83, 0],
  ["Vicaut", "Jimmy Vicaut", "FRA", "França", "continent_europe", 34, 81, -3],
  ["Hartmann", "Joshua Hartmann", "GER", "Alemanha", "continent_europe", 27, 86, 2],
  ["Prescod", "Reece Prescod", "GBR", "Reino Unido", "continent_europe", 30, 85, 0],
  ["Gemili", "Adam Gemili", "GBR", "Reino Unido", "continent_europe", 32, 80, -3],
  ["Greene", "Cejhae Greene", "ANT", "Antígua e Barbuda", "continent_north_america", 30, 83, 0],
  ["Matadi", "Emmanuel Matadi", "LBR", "Libéria", "continent_africa", 35, 86, -1],
  ["Fahnbulleh", "Joseph Fahnbulleh", "LBR", "Libéria", "continent_africa", 24, 89, 3],
  ["Makarawu", "Tapiwanashe Makarawu", "ZIM", "Zimbábue", "continent_africa", 26, 86, 3],
  ["Al-Yami", "Mudathir Al-Yami", "KSA", "Arábia Saudita", "continent_asia", 23, 79, 1],
  ["Al-Harthi", "Barakat Al-Harthi", "OMA", "Omã", "continent_asia", 38, 78, -2],
  ["Rahman", "Imranur Rahman", "BAN", "Bangladesh", "continent_asia", 33, 80, 0],
  ["Zohri", "Lalu Muhammad Zohri", "INA", "Indonésia", "continent_asia", 26, 81, 1],
  ["Louis", "Marc Brian Louis", "SGP", "Singapura", "continent_asia", 23, 80, 2],
  ["Garcia", "Gabriel Garcia", "BRA", "Brasil", "continent_south_america", 28, 81, 1],
  ["Blake2", "Ackeem Blake", "JAM", "Jamaica", "continent_north_america", 24, 93, 3],
  ["Watson", "Rohan Watson", "JAM", "Jamaica", "continent_north_america", 24, 90, 1],
  ["Forde", "Ryiem Forde", "JAM", "Jamaica", "continent_north_america", 25, 88, 2],
  ["Hall", "Elijah Hall", "USA", "Estados Unidos", "continent_north_america", 31, 87, 0],
  ["King", "Kyree King", "USA", "Estados Unidos", "continent_north_america", 32, 89, 1],
  ["Charleston", "Cravont Charleston", "USA", "Estados Unidos", "continent_north_america", 28, 88, -1],
  ["Kiprotich", "Pasi Kiprotich", "KEN", "Quênia", "continent_africa", 24, 80, 1],
  ["Magakwe", "Simon Magakwe", "RSA", "África do Sul", "continent_africa", 40, 78, -2],
  ["Leotlela", "Gift Leotlela", "RSA", "África do Sul", "continent_africa", 28, 84, 0],
  ["Munyai", "Clarence Munyai", "RSA", "África do Sul", "continent_africa", 28, 85, 1],
  ["Efoloko", "Jona Efoloko", "GBR", "Reino Unido", "continent_europe", 26, 84, 1],
  ["Amo-Dadzie", "Eugene Amo-Dadzie", "GBR", "Reino Unido", "continent_europe", 34, 88, 0],
  ["Edoburun", "Ojie Edoburun", "GBR", "Reino Unido", "continent_europe", 30, 83, -1],
  ["Mateo", "Pablo Mateo", "FRA", "França", "continent_europe", 25, 86, 2],
  ["Zeze2", "Ryan Zeze", "FRA", "França", "continent_europe", 28, 85, 1],
  ["Wolf", "Yannick Wolf", "GER", "Alemanha", "continent_europe", 26, 83, 1],
  ["Ansah-Peprah", "Lucas Ansah-Peprah", "GER", "Alemanha", "continent_europe", 26, 84, 0],
  ["Kranz", "Kevin Kranz", "GER", "Alemanha", "continent_europe", 28, 82, -1],
  ["Burnet", "Taymir Burnet", "NED", "Países Baixos", "continent_europe", 28, 84, 0],
  ["Bouju", "Raphael Bouju", "NED", "Países Baixos", "continent_europe", 24, 86, 1],
  ["Volko", "Jan Volko", "SVK", "Eslováquia", "continent_europe", 29, 83, -1],
  ["Fuchs", "Markus Fuchs", "AUT", "Áustria", "continent_europe", 30, 83, 0],
  ["Olatunde", "Israel Olatunde", "IRL", "Irlanda", "continent_europe", 24, 84, 1],
  ["Chen", "Chen Jiapeng", "CHN", "China", "continent_asia", 23, 83, 2],
  ["Deng", "Deng Zhijian", "CHN", "China", "continent_asia", 24, 81, 1],
  ["Yanagita", "Hiroki Yanagita", "JPN", "Japão", "continent_asia", 23, 85, 2],
  ["Ueyama", "Koki Ueyama", "JPN", "Japão", "continent_asia", 27, 83, 0],
  ["Boonson", "Puripol Boonson", "THA", "Tailândia", "continent_asia", 20, 88, 4],
  ["Fahmi", "Muhd Azeem Fahmi", "MAS", "Malásia", "continent_asia", 22, 83, 1],
  ["Ogunode", "Femi Ogunode", "QAT", "Catar", "continent_asia", 35, 82, -2],
  ["Ogunode2", "Tosin Ogunode", "QAT", "Catar", "continent_asia", 32, 80, -1],
  ["Taftian", "Hassan Taftian", "IRI", "Irã", "continent_asia", 33, 82, 0],
  ["Camara", "Ebrahima Camara", "GAM", "Gâmbia", "continent_africa", 29, 83, 1],
  ["Makusha", "Ngoni Makusha", "ZIM", "Zimbábue", "continent_africa", 32, 80, 0],
  ["Matsenjwa", "Sibusiso Matsenjwa", "SWZ", "Eswatini", "continent_africa", 38, 79, -1],
  ["Blake3", "Jerome Blake", "CAN", "Canadá", "continent_north_america", 30, 84, 0],
  ["Rodney", "Brendon Rodney", "CAN", "Canadá", "continent_north_america", 34, 85, 0],
  ["Brathwaite2", "Rikkoi Brathwaite", "IVB", "Ilhas Virgens Britânicas", "continent_north_america", 26, 86, 2],
  ["Doran", "Jake Doran", "AUS", "Austrália", "continent_oceania", 26, 81, 1],
  ["Azzopardi", "Joshua Azzopardi", "AUS", "Austrália", "continent_oceania", 26, 83, 2],
]),
  },
  {
    modalityId: "modality_athletics_800m",
    modalityName: "800 metros",
    label: "800 m",
    eventFormat: "heats",
    resultMetric: "direct-mark",
    markType: "time",
    heatSize: 8,
    athletes: athleticsRoster("modality_athletics_800m", "800m", [
      ["wanyonyi", "Emmanuel Wanyonyi", "KEN", "Quênia", "continent_africa", 21, 94, 3],
      ["arop", "Marco Arop", "CAN", "Canadá", "continent_north_america", 27, 91, 1],
      ["sedjati", "Djamel Sedjati", "DZA", "Argélia", "continent_africa", 26, 90, 1],
      ["hoppel", "Bryce Hoppel", "USA", "Estados Unidos", "continent_north_america", 28, 88, 1],
      ["attaoui", "Mohamed Attaoui", "ESP", "Espanha", "continent_europe", 23, 85, 2],
      ["pattison", "Ben Pattison", "GBR", "Reino Unido", "continent_europe", 24, 84, 1],
      ["tual", "Gabriel Tual", "FRA", "França", "continent_europe", 27, 84, 0],
      ["burgin", "Max Burgin", "GBR", "Reino Unido", "continent_europe", 24, 83, 0],
    ]),
  },
  {
    modalityId: "modality_athletics_1500m",
    modalityName: "1500 metros",
    label: "1500 m",
    eventFormat: "heats",
    resultMetric: "direct-mark",
    markType: "time",
    heatSize: 8,
    athletes: athleticsRoster("modality_athletics_1500m", "1500m", [
      ["ingebrigtsen", "Jakob Ingebrigtsen", "NOR", "Noruega", "continent_europe", 25, 95, 1],
      ["kerr", "Josh Kerr", "GBR", "Reino Unido", "continent_europe", 28, 93, 1],
      ["hocker", "Cole Hocker", "USA", "Estados Unidos", "continent_north_america", 24, 92, 2],
      ["nuguse", "Yared Nuguse", "USA", "Estados Unidos", "continent_north_america", 26, 90, 1],
      ["laros", "Niels Laros", "NLD", "Países Baixos", "continent_europe", 20, 88, 3],
      ["habz", "Azeddine Habz", "FRA", "França", "continent_europe", 32, 86, 1],
      ["cheruiyot", "Timothy Cheruiyot", "KEN", "Quênia", "continent_africa", 30, 85, 0],
      ["nordas", "Narve Gilje Nordås", "NOR", "Noruega", "continent_europe", 27, 84, 0],
    ]),
  },
  {
    modalityId: "modality_athletics_long_jump",
    modalityName: "Salto em distância",
    label: "Salto em distância",
    eventFormat: "individual-ranking",
    resultMetric: "direct-mark",
    markType: "distance",
    athletes: athleticsRoster("modality_athletics_long_jump", "lj", [
      ["tentoglou", "Miltiadis Tentoglou", "GRC", "Grécia", "continent_europe", 27, 94, 1],
      ["furlani", "Mattia Furlani", "ITA", "Itália", "continent_europe", 21, 92, 3],
      ["pinnock", "Wayne Pinnock", "JAM", "Jamaica", "continent_north_america", 25, 91, 2],
      ["ehammer", "Simon Ehammer", "CHE", "Suíça", "continent_europe", 26, 87, 1],
      ["gayle", "Tajay Gayle", "JAM", "Jamaica", "continent_north_america", 30, 86, 0],
      ["shi", "Shi Yuhao", "CHN", "China", "continent_asia", 25, 83, 0],
      ["adcock", "Liam Adcock", "AUS", "Austrália", "continent_oceania", 30, 82, 0],
      ["saraboyukov", "Bozhidar Saraboyukov", "BGR", "Bulgária", "continent_europe", 21, 81, 1],
    ]),
  },
  {
    modalityId: "modality_athletics_high_jump",
    modalityName: "Salto em altura",
    label: "Salto em altura",
    eventFormat: "individual-ranking",
    resultMetric: "direct-mark",
    markType: "distance",
    athletes: athleticsRoster("modality_athletics_high_jump", "hj", [
      ["kerr", "Hamish Kerr", "NZL", "Nova Zelândia", "continent_oceania", 29, 91, 2],
      ["harrison", "JuVaughn Harrison", "USA", "Estados Unidos", "continent_north_america", 27, 90, 1],
      ["woo", "Sanghyeok Woo", "KOR", "Coreia do Sul", "continent_asia", 30, 90, 0],
      ["mcewen", "Shelby McEwen", "USA", "Estados Unidos", "continent_north_america", 30, 89, 1],
      ["doroshchuk", "Oleh Doroshchuk", "UKR", "Ucrânia", "continent_europe", 24, 88, 2],
      ["barshim", "Mutaz Essa Barshim", "QAT", "Catar", "continent_asia", 35, 86, -1],
      ["potye", "Tobias Potye", "DEU", "Alemanha", "continent_europe", 31, 83, 0],
      ["beckford", "Romaine Beckford", "JAM", "Jamaica", "continent_north_america", 26, 82, 1],
    ]),
  },
  {
    modalityId: "modality_athletics_shot_put",
    modalityName: "Arremesso de peso",
    label: "Arremesso de peso",
    eventFormat: "individual-ranking",
    resultMetric: "direct-mark",
    markType: "distance",
    athletes: athleticsRoster("modality_athletics_shot_put", "sp", [
      ["crouser", "Ryan Crouser", "USA", "Estados Unidos", "continent_north_america", 33, 96, 0],
      ["fabbri", "Leonardo Fabbri", "ITA", "Itália", "continent_europe", 29, 92, 2],
      ["kovacs", "Joe Kovacs", "USA", "Estados Unidos", "continent_north_america", 37, 90, 0],
      ["otterdahl", "Payton Otterdahl", "USA", "Estados Unidos", "continent_north_america", 30, 88, 1],
      ["walsh", "Tom Walsh", "NZL", "Nova Zelândia", "continent_oceania", 34, 87, 0],
      ["campbell", "Rajindra Campbell", "JAM", "Jamaica", "continent_north_america", 27, 86, 1],
      ["munoz", "Uziel Muñoz", "MEX", "México", "continent_north_america", 30, 84, 0],
      ["steen", "Roger Steen", "USA", "Estados Unidos", "continent_north_america", 26, 83, 1],
    ]),
  },
].map((series) => ({
  scoringSystemId: "generic-proportional",
  competitionModel: "standalone",
  prestige: 80,
  rankingPoints: 100,
  ...series,
  competitions: athleticsRounds(series.label),
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
      "59 torneios individuais com datas oficiais de 2026 (ATP 250, ATP 500, Masters 1000, Grand Slams e ATP Finals) e o top 50 do ranking mundial da ATP como elenco oficial, ao lado dos 100 atletas genéricos.",
    sportId: "sport_tennis",
    modalityId: "modality_tennis_mens_singles",
    sportName: "Tênis",
    modalityName: "Simples masculino",
    scoringSystemId: "tennis-round-proportional",
    competitionModel: "standalone",
    sourceUrl: "https://www.atptour.com/en/rankings/singles",
    athletes: ATP_2026_PLAYERS,
    competitions: ATP_2026_TOURNAMENTS,
  },
  {
    id: "fia-ecosystem-2026",
    name: "Ecossistema FIA — 2026",
    description:
      "Pirâmide FIA de 2026 em um único preset: Fórmula 1 (Tier 1), Fórmula 2 (Tier 2), Fórmula 3 (Tier 3) e as Fórmulas Regionais (Tier 4: Europeia e Oriente Médio). São 60 etapas anuais de três dias e 115 pilotos com a equipe ao lado do nome. Cada categoria mantém sua própria classificação anual, zerada a cada temporada, e um mesmo piloto pode disputar mais de um campeonato.",
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
        tier: 1,
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
        tier: 2,
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
        tier: 3,
        prestige: 70,
        rankingPoints: 25,
        athletes: F3_2026_DRIVERS,
        competitions: FORMULA_3_2026_ROUNDS,
      },
      {
        modalityId: "modality_motorsport_formula_regional",
        modalityName: "Fórmula Regional Europeia",
        scoringSystemId: "formula1-grand-prix",
        competitionModel: "season_stage",
        seasonId: "formula-regional-european-championship",
        seasonName: "Campeonato de Fórmula Regional Europeu da FIA",
        tier: 4,
        prestige: 55,
        rankingPoints: 25,
        athletes: FORMULA_REGIONAL_2026_DRIVERS,
        competitions: FORMULA_REGIONAL_2026_ROUNDS,
      },
      {
        modalityId: "modality_motorsport_formula_regional_middle_east",
        modalityName: "Fórmula Regional Oriente Médio",
        scoringSystemId: "formula1-grand-prix",
        competitionModel: "season_stage",
        seasonId: "formula-regional-middle-east-championship",
        seasonName: "Campeonato de Fórmula Regional do Oriente Médio da FIA",
        tier: 4,
        prestige: 55,
        rankingPoints: 25,
        // Vincula pilotos homônimos ao mesmo atleta de outra categoria.
        linkExistingByName: true,
        athletes: FORMULA_REGIONAL_ME_2026_DRIVERS,
        competitions: FORMULA_REGIONAL_ME_2026_ROUNDS,
      },
    ],
  },
  {
    id: "world-athletics-2026",
    name: "Liga Mundial de Atletismo — 2026",
    description:
      "Circuito de 5 encontros (Doha, Roma, Oslo, Paris e a final de Zurique) com 6 provas — 100 m, 800 m, 1500 m, salto em distância, salto em altura e arremesso de peso — e 48 atletas reais. Cada prova tem ranking rolante próprio (média das melhores marcas na janela) e resolução de etapa: baterias com tempo nas corridas, marca direta de distância nos saltos e arremesso.",
    sportId: "sport_athletics",
    sportName: "Atletismo",
    sourceUrl: "https://worldathletics.org/",
    series: ATHLETICS_SERIES,
  },
  {
    id: "football-leagues-2026",
    kind: "league",
    name: "Ligas de futebol — 2026",
    description:
      "Duas ligas nacionais de pontos corridos (turno e returno): o Campeonato Brasileiro Série A (Brasil, 20 clubes) e a J1 League (Japão, 20 clubes), com os clubes e ratings aproximados da temporada 2026. Cada temporada é resolvida por inteiro e coroa um campeão, com a tabela final completa.",
    sportId: "sport_football",
    sportName: "Futebol",
    sourceUrl: "https://www.cbf.com.br/ · https://www.jleague.jp/",
    leagues: [
      {
        slug: "brasileirao",
        modalityId: "modality_football_brasileirao",
        modalityName: "Campeonato Brasileiro Série A",
        competitionName: "Campeonato Brasileiro Série A 2026",
        seasonName: "Campeonato Brasileiro Série A",
        seasonId: "brasileirao-serie-a",
        countryCode: "BRA",
        countryName: "Brasil",
        countryId: "country_bra",
        continentId: "continent_south_america",
        startDate: "2026-04-11",
        endDate: "2026-12-06",
        prestige: 92,
        // [slug, nome, rating aproximado 2026, momentum]
        clubs: [
          ["palmeiras", "Palmeiras", 90, 2],
          ["flamengo", "Flamengo", 90, 2],
          ["cruzeiro", "Cruzeiro", 86, 1],
          ["botafogo", "Botafogo", 85, 0],
          ["fluminense", "Fluminense", 83, 0],
          ["sao-paulo", "São Paulo", 83, 0],
          ["atletico-mineiro", "Atlético Mineiro", 82, 0],
          ["internacional", "Internacional", 82, -1],
          ["corinthians", "Corinthians", 81, 0],
          ["gremio", "Grêmio", 80, 0],
          ["bahia", "Bahia", 80, 1],
          ["rb-bragantino", "RB Bragantino", 78, 0],
          ["fortaleza", "Fortaleza", 78, -1],
          ["vasco", "Vasco da Gama", 77, 1],
          ["santos", "Santos", 76, 0],
          ["mirassol", "Mirassol", 72, 1],
          ["ceara", "Ceará", 71, 0],
          ["vitoria", "Vitória", 70, -1],
          ["juventude", "Juventude", 69, -1],
          ["sport", "Sport Recife", 68, -1],
        ],
      },
      {
        slug: "jleague",
        modalityId: "modality_football_jleague",
        modalityName: "J1 League",
        competitionName: "J1 League 2026",
        seasonName: "J1 League",
        seasonId: "jleague-j1",
        countryCode: "JPN",
        countryName: "Japão",
        countryId: "country_jpn",
        continentId: "continent_asia",
        startDate: "2026-02-21",
        endDate: "2026-12-05",
        prestige: 82,
        clubs: [
          ["vissel-kobe", "Vissel Kobe", 82, 1],
          ["sanfrecce-hiroshima", "Sanfrecce Hiroshima", 81, 1],
          ["kashima-antlers", "Kashima Antlers", 80, 1],
          ["kawasaki-frontale", "Kawasaki Frontale", 79, 0],
          ["urawa-reds", "Urawa Red Diamonds", 78, 0],
          ["gamba-osaka", "Gamba Osaka", 78, 1],
          ["cerezo-osaka", "Cerezo Osaka", 77, 0],
          ["yokohama-marinos", "Yokohama F. Marinos", 76, -1],
          ["machida-zelvia", "Machida Zelvia", 76, 0],
          ["kyoto-sanga", "Kyoto Sanga", 75, 1],
          ["fc-tokyo", "FC Tokyo", 74, 0],
          ["nagoya-grampus", "Nagoya Grampus", 74, 0],
          ["kashiwa-reysol", "Kashiwa Reysol", 73, 0],
          ["avispa-fukuoka", "Avispa Fukuoka", 72, 0],
          ["tokyo-verdy", "Tokyo Verdy", 72, 0],
          ["albirex-niigata", "Albirex Niigata", 71, -1],
          ["shimizu-s-pulse", "Shimizu S-Pulse", 71, 1],
          ["shonan-bellmare", "Shonan Bellmare", 70, 0],
          ["yokohama-fc", "Yokohama FC", 68, -1],
          ["fagiano-okayama", "Fagiano Okayama", 67, 0],
        ],
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
      // Nível na pirâmide FIA (metadado; categorias de mesmo tier convivem lado
      // a lado com rankings próprios, como a Fórmula Regional Europeia e a do
      // Oriente Médio, ambas no Tier 4).
      tier: series.tier ?? null,
      // Resolução de etapa por modalidade (ex.: 100 m = baterias + marca direta
      // de tempo). Ausente = padrão individual/tabela do motor.
      eventFormat: series.eventFormat ?? null,
      resultMetric: series.resultMetric ?? null,
      markType: series.markType ?? null,
      heatSize: series.heatSize ?? null,
      prestige: series.prestige,
      rankingPoints: series.rankingPoints,
      // Quando verdadeiro, pilotos com o mesmo nome de outra série são o mesmo
      // atleta (mantendo o rating de origem), em vez de novas pessoas.
      linkExistingByName: series.linkExistingByName ?? false,
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
    tier: preset.tier ?? null,
    eventFormat: preset.eventFormat ?? null,
    resultMetric: preset.resultMetric ?? null,
    markType: preset.markType ?? null,
    heatSize: preset.heatSize ?? null,
    prestige: preset.prestige,
    rankingPoints: preset.rankingPoints,
    linkExistingByName: false,
    athletes: preset.athletes ?? [],
    competitions: preset.competitions ?? [],
  }];
}

// Normaliza um nome de piloto para comparar entre categorias (sem acentos,
// minúsculo), permitindo detectar o mesmo atleta em campeonatos diferentes.
function normalizeDriverName(name) {
  return (name ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

// Resolve o elenco de um preset em pessoas a criar (sem duplicar) e, para cada
// série, a lista ordenada de IDs de participantes. Séries marcadas com
// `linkExistingByName` reaproveitam o atleta já criado por uma série anterior
// (mesmo nome), fazendo com que a mesma pessoa dispute dois campeonatos.
export function resolvePresetRoster(preset) {
  const series = presetSeries(preset);
  const canonicalByName = new Map();
  const peopleToCreate = [];
  const createdIds = new Set();
  const seriesParticipantIds = [];

  for (const currentSeries of series) {
    const participantIds = [];
    for (const athlete of currentSeries.athletes) {
      const key = normalizeDriverName(athlete.driverName);
      if (currentSeries.linkExistingByName && canonicalByName.has(key)) {
        participantIds.push(canonicalByName.get(key).id);
        continue;
      }
      if (!createdIds.has(athlete.id)) {
        peopleToCreate.push(athlete);
        createdIds.add(athlete.id);
      }
      participantIds.push(athlete.id);
      // Séries que não vinculam alimentam o registro canônico; se o nome se
      // repete, a série mais recente prevalece (ex.: Europeia sobre a F3).
      if (!currentSeries.linkExistingByName && key) {
        canonicalByName.set(key, athlete);
      }
    }
    seriesParticipantIds.push(participantIds);
  }

  return { series, peopleToCreate, seriesParticipantIds };
}

export function presetById(presetId) {
  return CALENDAR_PRESETS.find((preset) => preset.id === presetId) ?? null;
}

export function buildPresetCompetitions(preset, timestamp = new Date().toISOString()) {
  if (!preset) return [];
  if (preset.kind === "league") return buildLeaguePresetCompetitions(preset, timestamp);

  const multiSeries = Array.isArray(preset.series);
  const { series: allSeries, seriesParticipantIds } = resolvePresetRoster(preset);

  return allSeries.flatMap((series, seriesIndex) => {
    const isSeasonStage = series.competitionModel === "season_stage";
    // Em presets multimodalidade, o ID da etapa inclui a modalidade para não
    // colidir entre categorias que compartilham o mesmo fim de semana.
    const seriesKey = multiSeries ? `${series.modalityId}_` : "";
    const participantIds = seriesParticipantIds[seriesIndex];

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
        eventFormat: series.eventFormat ?? null,
        resultMetric: series.resultMetric ?? null,
        markType: series.markType ?? null,
        heatSize: series.heatSize ?? null,
        slots: settings.slots,
        minimumRanking: null,
        competitionModel: series.competitionModel ?? "standalone",
        seasonId: series.seasonId ?? null,
        seasonName: series.seasonName ?? null,
        seasonalRanking: isSeasonStage,
        seasonRound: tournament.round ?? null,
        seasonRoundCount: isSeasonStage ? series.competitions.length : null,
        seasonFinalRound: Boolean(tournament.finalRound),
        participantIds: isSeasonStage ? participantIds : null,
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
  // Ligas de futebol são disputadas por clubes, não por atletas individuais.
  if (preset?.kind === "league") return [];
  // Apenas pessoas realmente novas são criadas; pilotos vinculados a um atleta
  // já existente (mesmo nome em outra categoria) não são duplicados.
  return resolvePresetRoster(preset).peopleToCreate.map((person) => ({
    ...person,
    createdAt: person.createdAt ?? timestamp,
    updatedAt: timestamp,
  }));
}

// --- Ligas de futebol (preset baseado em clubes) ---------------------------

// Clubes de cada liga, com ratings aproximados da temporada 2026. Um clube por
// entrada; o esporte é só de equipes, então não há atletas individuais.
export function buildLeaguePresetClubs(preset, timestamp = new Date().toISOString()) {
  if (preset?.kind !== "league") return [];
  return (preset.leagues ?? []).flatMap((league) =>
    league.clubs.map(([slug, name, baseRating, momentum = 0]) =>
      createClub({
        id: clubIdFor("sport_football", `${league.slug}_${slug}`),
        name,
        sportId: "sport_football",
        modalityId: league.modalityId,
        baseRating,
        momentum,
        countryCode: league.countryCode,
        rosterType: "preset",
        presetId: preset.id,
        createdAt: timestamp,
        updatedAt: timestamp,
      })),
  );
}

function addDaysISO(isoDate, days) {
  const date = new Date(`${isoDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Uma competição por RODADA (turno e returno), espaçadas semanalmente pelo
// calendário da liga, atreladas ao país. Cada rodada carrega seus confrontos
// (roundFixtures) e, ao ser simulada, gera os placares e atualiza a tabela.
export function buildLeaguePresetCompetitions(preset, timestamp = new Date().toISOString()) {
  if (preset?.kind !== "league") return [];
  return (preset.leagues ?? []).flatMap((league) => {
    const clubIds = league.clubs.map(([slug]) =>
      clubIdFor("sport_football", `${league.slug}_${slug}`));
    const fixtures = buildFixtures(clubIds);
    const roundCount = fixtures.length;

    return fixtures.map((roundFixtures, index) => {
      const round = index + 1;
      const stableId = `preset_${preset.id}_${league.slug}_r${String(round).padStart(2, "0")}`;
      const date = addDaysISO(league.startDate, index * 7);
      return {
        id: stableId,
        calendarEventId: `event_${stableId}`,
        presetId: preset.id,
        name: `${league.competitionName} — Rodada ${round}`,
        sportId: "sport_football",
        modalityId: league.modalityId,
        sport: "Futebol",
        discipline: league.modalityName,
        type: "league",
        qualification: "ranking",
        geographicScope: "national",
        continentId: league.continentId,
        countryId: league.countryId,
        startDate: date,
        endDate: date,
        recurrence: "yearly",
        prestige: league.prestige,
        rankingPoints: 3,
        scoringSystemId: "generic-proportional",
        eventFormat: null,
        resultMetric: null,
        markType: null,
        teamRatingModel: null,
        teamWeight: null,
        slots: clubIds.length,
        minimumRanking: null,
        competitionModel: "season_stage",
        seasonId: league.seasonId,
        seasonName: league.seasonName ?? league.competitionName,
        seasonalRanking: true,
        seasonRound: round,
        seasonRoundCount: roundCount,
        seasonFinalRound: round === roundCount,
        // seasonName sem o ano (o ano é acrescentado pela tela de Temporadas).
        participantIds: clubIds,
        roundFixtures,
        notes: [
          league.countryName,
          `Rodada ${round} de ${roundCount}`,
          "Pontos corridos (turno e returno)",
        ].filter(Boolean).join(" · "),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    });
  });
}

function teamSlug(teamName) {
  return normalizeDriverName(teamName).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function averageBy(members, key) {
  if (!members.length) return 0;
  return Math.round(
    members.reduce((total, member) => total + (Number(member[key]) || 0), 0) / members.length,
  );
}

// Deriva as equipes de um preset a partir do elenco: em esportes mistos (ex.:
// automobilismo) os atletas já trazem a equipe no nome ("Piloto (Equipe)") e no
// campo teamName. Agrupamos os participantes de cada modalidade por equipe e
// criamos um clube por (modalidade, equipe), com memberPersonIds e um rating de
// "carro" derivado da média dos membros (usado no modelo misto weighted). Cada
// modalidade tem seu próprio registro de clube, mesmo que a equipe apareça em
// várias categorias (elas são agrupadas por nome só na tela de Equipes).
export function buildPresetClubs(preset, people = [], timestamp = new Date().toISOString()) {
  if (!preset) return [];
  // Ligas de futebol trazem os clubes explicitamente no preset.
  if (preset.kind === "league") return buildLeaguePresetClubs(preset, timestamp);
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const { series, seriesParticipantIds } = resolvePresetRoster(preset);
  const clubs = [];
  const seen = new Set();

  series.forEach((currentSeries, seriesIndex) => {
    if (entityTypeForSport(currentSeries.sportId) !== "mista") return;
    const participants = (seriesParticipantIds[seriesIndex] ?? [])
      .map((personId) => peopleById.get(personId))
      .filter(Boolean);

    const byTeam = new Map();
    for (const person of participants) {
      const teamName = person.teamName;
      if (!teamName) continue;
      if (!byTeam.has(teamName)) byTeam.set(teamName, []);
      byTeam.get(teamName).push(person);
    }

    for (const [teamName, members] of byTeam) {
      const modalityKey = currentSeries.modalityId.replace(/^modality_/, "");
      const id = clubIdFor(currentSeries.sportId, `${modalityKey}_${teamSlug(teamName)}`);
      if (seen.has(id)) continue;
      seen.add(id);
      clubs.push(createClub({
        id,
        name: teamName,
        sportId: currentSeries.sportId,
        modalityId: currentSeries.modalityId,
        baseRating: averageBy(members, "baseRating"),
        momentum: averageBy(members, "momentum"),
        memberPersonIds: members.map((member) => member.id),
        rosterType: "preset",
        presetId: preset.id,
        createdAt: timestamp,
        updatedAt: timestamp,
      }));
    }
  });

  return clubs;
}
