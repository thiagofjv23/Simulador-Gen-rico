const DB_NAME = "simulador-generico";
const DB_VERSION = 8;
const WORLD_STORE = "world";
const EVENTS_STORE = "events";
const COMPETITIONS_STORE = "competitions";
const PEOPLE_STORE = "people";
const RANKINGS_STORE = "rankings";
const RESULTS_STORE = "results";
const CONTINENTS_STORE = "continents";
const COUNTRIES_STORE = "countries";
const SPORTS_STORE = "sports";
const MODALITIES_STORE = "modalities";
const COMPETITION_ENTRIES_STORE = "competitionEntries";

let connectionPromise;

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.addEventListener("success", () => resolve(request.result), { once: true });
    request.addEventListener("error", () => reject(request.error), { once: true });
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.addEventListener("complete", resolve, { once: true });
    transaction.addEventListener("abort", () => reject(transaction.error), { once: true });
    transaction.addEventListener("error", () => reject(transaction.error), { once: true });
  });
}

export function openDatabase() {
  if (connectionPromise) return connectionPromise;

  connectionPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.addEventListener("upgradeneeded", () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(WORLD_STORE)) {
        database.createObjectStore(WORLD_STORE, { keyPath: "id" });
      }

      if (!database.objectStoreNames.contains(EVENTS_STORE)) {
        const events = database.createObjectStore(EVENTS_STORE, { keyPath: "id" });
        events.createIndex("startDate", "startDate");
        events.createIndex("type", "type");
        events.createIndex("recurrence", "recurrence");
      }

      if (!database.objectStoreNames.contains(COMPETITIONS_STORE)) {
        const competitions = database.createObjectStore(COMPETITIONS_STORE, { keyPath: "id" });
        competitions.createIndex("name", "name");
        competitions.createIndex("sport", "sport");
        competitions.createIndex("startDate", "startDate");
        competitions.createIndex("prestige", "prestige");
        competitions.createIndex("calendarEventId", "calendarEventId", { unique: true });
      }

      if (!database.objectStoreNames.contains(PEOPLE_STORE)) {
        const people = database.createObjectStore(PEOPLE_STORE, { keyPath: "id" });
        people.createIndex("name", "name");
        people.createIndex("countryCode", "countryCode");
        people.createIndex("baseRating", "baseRating");
      }

      if (!database.objectStoreNames.contains(RANKINGS_STORE)) {
        const rankings = database.createObjectStore(RANKINGS_STORE, { keyPath: "id" });
        rankings.createIndex("rankingId", "rankingId");
        rankings.createIndex("personId", "personId");
        rankings.createIndex("position", "position");
      }

      if (!database.objectStoreNames.contains(RESULTS_STORE)) {
        const results = database.createObjectStore(RESULTS_STORE, { keyPath: "id" });
        results.createIndex("competitionId", "competitionId");
        results.createIndex("occurrenceEnd", "occurrenceEnd");
      }

      if (!database.objectStoreNames.contains(CONTINENTS_STORE)) {
        const continents = database.createObjectStore(CONTINENTS_STORE, { keyPath: "id" });
        continents.createIndex("worldId", "worldId");
        continents.createIndex("name", "name");
      }

      if (!database.objectStoreNames.contains(COUNTRIES_STORE)) {
        const countries = database.createObjectStore(COUNTRIES_STORE, { keyPath: "id" });
        countries.createIndex("worldId", "worldId");
        countries.createIndex("continentId", "continentId");
        countries.createIndex("code", "code", { unique: true });
        countries.createIndex("name", "name");
      }

      if (!database.objectStoreNames.contains(SPORTS_STORE)) {
        const sports = database.createObjectStore(SPORTS_STORE, { keyPath: "id" });
        sports.createIndex("name", "name", { unique: true });
      }

      if (!database.objectStoreNames.contains(MODALITIES_STORE)) {
        const modalities = database.createObjectStore(MODALITIES_STORE, { keyPath: "id" });
        modalities.createIndex("sportId", "sportId");
        modalities.createIndex("name", "name");
      }

      if (!database.objectStoreNames.contains(COMPETITION_ENTRIES_STORE)) {
        const entries = database.createObjectStore(
          COMPETITION_ENTRIES_STORE,
          { keyPath: "id" },
        );
        entries.createIndex("competitionId", "competitionId");
        entries.createIndex("occurrenceStart", "occurrenceStart");
      }

      if (database.objectStoreNames.contains(COMPETITIONS_STORE)) {
        const competitions = request.transaction.objectStore(COMPETITIONS_STORE);
        if (!competitions.indexNames.contains("sportId")) {
          competitions.createIndex("sportId", "sportId");
        }
        if (!competitions.indexNames.contains("modalityId")) {
          competitions.createIndex("modalityId", "modalityId");
        }
      }

      if (database.objectStoreNames.contains(PEOPLE_STORE)) {
        const people = request.transaction.objectStore(PEOPLE_STORE);
        if (!people.indexNames.contains("sportId")) {
          people.createIndex("sportId", "sportId");
        }
        if (!people.indexNames.contains("modalityId")) {
          people.createIndex("modalityId", "modalityId");
        }
      }

      if (database.objectStoreNames.contains(RANKINGS_STORE)) {
        const rankings = request.transaction.objectStore(RANKINGS_STORE);
        if (!rankings.indexNames.contains("sportId")) {
          rankings.createIndex("sportId", "sportId");
        }
        if (!rankings.indexNames.contains("modalityId")) {
          rankings.createIndex("modalityId", "modalityId");
        }
      }
    });

    request.addEventListener("success", () => {
      const database = request.result;
      database.addEventListener("versionchange", () => database.close());
      resolve(database);
    });

    request.addEventListener("error", () => reject(request.error));
    request.addEventListener("blocked", () => {
      reject(new Error("O banco de dados está aberto em outra aba. Feche a outra aba e tente novamente."));
    });
  });

  return connectionPromise;
}

export async function resetDatabase() {
  if (connectionPromise) {
    const database = await connectionPromise.catch(() => null);
    database?.close();
    connectionPromise = null;
  }

  await new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.addEventListener("success", resolve, { once: true });
    request.addEventListener("error", () => reject(request.error), { once: true });
    request.addEventListener("blocked", () => {
      reject(new Error("Feche as outras abas do simulador antes de iniciar um novo jogo."));
    }, { once: true });
  });
}

export async function getWorld() {
  const database = await openDatabase();
  const transaction = database.transaction(WORLD_STORE, "readonly");
  return requestToPromise(transaction.objectStore(WORLD_STORE).get("current"));
}

export async function saveWorld(world) {
  const database = await openDatabase();
  const transaction = database.transaction(WORLD_STORE, "readwrite");
  transaction.objectStore(WORLD_STORE).put({ ...world, id: "current" });
  await transactionDone(transaction);
}

export async function getAllEvents() {
  const database = await openDatabase();
  const transaction = database.transaction(EVENTS_STORE, "readonly");
  return requestToPromise(transaction.objectStore(EVENTS_STORE).getAll());
}

export async function saveEvent(event) {
  const database = await openDatabase();
  const transaction = database.transaction(EVENTS_STORE, "readwrite");
  transaction.objectStore(EVENTS_STORE).put(event);
  await transactionDone(transaction);
}

export async function saveEvents(events) {
  const database = await openDatabase();
  const transaction = database.transaction(EVENTS_STORE, "readwrite");
  const store = transaction.objectStore(EVENTS_STORE);
  events.forEach((event) => store.put(event));
  await transactionDone(transaction);
}

export async function deleteEvent(id) {
  const database = await openDatabase();
  const transaction = database.transaction(EVENTS_STORE, "readwrite");
  transaction.objectStore(EVENTS_STORE).delete(id);
  await transactionDone(transaction);
}

export async function getAllCompetitions() {
  const database = await openDatabase();
  const transaction = database.transaction(COMPETITIONS_STORE, "readonly");
  return requestToPromise(transaction.objectStore(COMPETITIONS_STORE).getAll());
}

export async function saveCompetitionWithEvent(competition, calendarEvent) {
  const database = await openDatabase();
  const transaction = database.transaction(
    [COMPETITIONS_STORE, EVENTS_STORE],
    "readwrite",
  );
  transaction.objectStore(COMPETITIONS_STORE).put(competition);
  transaction.objectStore(EVENTS_STORE).put(calendarEvent);
  await transactionDone(transaction);
}

export async function saveCompetitionsWithEvents(items) {
  if (!items.length) return;

  const database = await openDatabase();
  const transaction = database.transaction(
    [COMPETITIONS_STORE, EVENTS_STORE],
    "readwrite",
  );
  const competitionsStore = transaction.objectStore(COMPETITIONS_STORE);
  const eventsStore = transaction.objectStore(EVENTS_STORE);
  items.forEach(({ competition, calendarEvent }) => {
    competitionsStore.put(competition);
    eventsStore.put(calendarEvent);
  });
  await transactionDone(transaction);
}

export async function deleteCompetitionWithEvent(competitionId, calendarEventId) {
  const database = await openDatabase();
  const transaction = database.transaction(
    [COMPETITIONS_STORE, EVENTS_STORE, COMPETITION_ENTRIES_STORE],
    "readwrite",
  );
  transaction.objectStore(COMPETITIONS_STORE).delete(competitionId);
  transaction.objectStore(EVENTS_STORE).delete(calendarEventId);
  const entriesIndex = transaction
    .objectStore(COMPETITION_ENTRIES_STORE)
    .index("competitionId");
  const entriesCursor = entriesIndex.openKeyCursor(IDBKeyRange.only(competitionId));
  entriesCursor.addEventListener("success", () => {
    const cursor = entriesCursor.result;
    if (!cursor) return;
    transaction.objectStore(COMPETITION_ENTRIES_STORE).delete(cursor.primaryKey);
    cursor.continue();
  });
  await transactionDone(transaction);
}

export async function getAllPeople() {
  const database = await openDatabase();
  const transaction = database.transaction(PEOPLE_STORE, "readonly");
  return requestToPromise(transaction.objectStore(PEOPLE_STORE).getAll());
}

export async function savePeople(people) {
  const database = await openDatabase();
  const transaction = database.transaction(PEOPLE_STORE, "readwrite");
  const store = transaction.objectStore(PEOPLE_STORE);
  people.forEach((person) => store.put(person));
  await transactionDone(transaction);
}

export async function getAllContinents() {
  const database = await openDatabase();
  const transaction = database.transaction(CONTINENTS_STORE, "readonly");
  return requestToPromise(transaction.objectStore(CONTINENTS_STORE).getAll());
}

export async function getAllCountries() {
  const database = await openDatabase();
  const transaction = database.transaction(COUNTRIES_STORE, "readonly");
  return requestToPromise(transaction.objectStore(COUNTRIES_STORE).getAll());
}

export async function saveGeography(continents, countries) {
  const database = await openDatabase();
  const transaction = database.transaction(
    [CONTINENTS_STORE, COUNTRIES_STORE],
    "readwrite",
  );
  const continentsStore = transaction.objectStore(CONTINENTS_STORE);
  const countriesStore = transaction.objectStore(COUNTRIES_STORE);
  continents.forEach((continent) => continentsStore.put(continent));
  countries.forEach((country) => countriesStore.put(country));
  await transactionDone(transaction);
}

export async function getAllSports() {
  const database = await openDatabase();
  const transaction = database.transaction(SPORTS_STORE, "readonly");
  return requestToPromise(transaction.objectStore(SPORTS_STORE).getAll());
}

export async function getAllModalities() {
  const database = await openDatabase();
  const transaction = database.transaction(MODALITIES_STORE, "readonly");
  return requestToPromise(transaction.objectStore(MODALITIES_STORE).getAll());
}

export async function saveSportsAndModalities(sports, modalities) {
  const database = await openDatabase();
  const transaction = database.transaction(
    [SPORTS_STORE, MODALITIES_STORE],
    "readwrite",
  );
  const sportsStore = transaction.objectStore(SPORTS_STORE);
  const modalitiesStore = transaction.objectStore(MODALITIES_STORE);
  sports.forEach((sport) => sportsStore.put(sport));
  modalities.forEach((modality) => modalitiesStore.put(modality));
  await transactionDone(transaction);
}

export async function getRankingEntries(rankingId = "world") {
  const database = await openDatabase();
  const transaction = database.transaction(RANKINGS_STORE, "readonly");
  return requestToPromise(
    transaction.objectStore(RANKINGS_STORE).index("rankingId").getAll(rankingId),
  );
}

export async function getAllRankingEntries() {
  const database = await openDatabase();
  const transaction = database.transaction(RANKINGS_STORE, "readonly");
  return requestToPromise(transaction.objectStore(RANKINGS_STORE).getAll());
}

export async function saveInitialRanking(people, entries) {
  const database = await openDatabase();
  const transaction = database.transaction(
    [PEOPLE_STORE, RANKINGS_STORE],
    "readwrite",
  );
  const peopleStore = transaction.objectStore(PEOPLE_STORE);
  const rankingsStore = transaction.objectStore(RANKINGS_STORE);
  people.forEach((person) => peopleStore.put(person));
  entries.forEach((entry) => rankingsStore.put(entry));
  await transactionDone(transaction);
}

export async function saveRankingEntries(entries) {
  const database = await openDatabase();
  const transaction = database.transaction(RANKINGS_STORE, "readwrite");
  const store = transaction.objectStore(RANKINGS_STORE);
  entries.forEach((entry) => store.put(entry));
  await transactionDone(transaction);
}

export async function getAllResults() {
  const database = await openDatabase();
  const transaction = database.transaction(RESULTS_STORE, "readonly");
  return requestToPromise(transaction.objectStore(RESULTS_STORE).getAll());
}

export async function saveCompetitionResult(result, rankingEntries) {
  const database = await openDatabase();
  const transaction = database.transaction(
    [RESULTS_STORE, RANKINGS_STORE],
    "readwrite",
  );
  transaction.objectStore(RESULTS_STORE).put(result);
  const rankingStore = transaction.objectStore(RANKINGS_STORE);
  rankingEntries.forEach((entry) => rankingStore.put(entry));
  await transactionDone(transaction);
}

export async function getAllCompetitionEntries() {
  const database = await openDatabase();
  const transaction = database.transaction(COMPETITION_ENTRIES_STORE, "readonly");
  return requestToPromise(
    transaction.objectStore(COMPETITION_ENTRIES_STORE).getAll(),
  );
}

export async function saveCompetitionEntry(entry) {
  const database = await openDatabase();
  const transaction = database.transaction(COMPETITION_ENTRIES_STORE, "readwrite");
  transaction.objectStore(COMPETITION_ENTRIES_STORE).put(entry);
  await transactionDone(transaction);
}
