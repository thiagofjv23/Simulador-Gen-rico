import {
  deleteCompetitionWithEvent,
  deleteEvent,
  getAllEvents,
  getAllCompetitions,
  getAllContinents,
  getAllCompetitionEntries,
  getAllCountries,
  getAllModalities,
  getAllPeople,
  getAllResults,
  getAllSports,
  getAllRankingEntries,
  getWorld,
  resetDatabase,
  saveCompetitionWithEvent,
  saveCompetitionsWithEvents,
  saveCompetitionResult,
  saveCompetitionEntry,
  saveEvent,
  saveGeography,
  saveInitialRanking,
  savePeople,
  saveRankingEntries,
  saveSportsAndModalities,
  saveWorld,
} from "./db.js";
import {
  EVENT_TYPES,
  addDays,
  eventsOnDate,
  formatFullDate,
  formatMonth,
  formatShortDate,
  getCalendarDays,
  nextEventDate,
  occurrencesBetween,
  parseISODate,
  toISODate,
  upcomingOccurrences,
} from "./calendar.js";
import {
  QUALIFICATION_CRITERIA,
  MIXED_QUALIFICATION_COMBINATIONS,
  COMPETITION_MODELS,
  buildCalendarEvent,
  competitionStats,
  competitionModelLabel,
  invitationOpensOn,
  qualificationMethods,
  qualificationLabel,
  slotsForQualificationMethod,
  sortCompetitions,
  usesQualificationMethod,
  validateCompetition,
} from "./competition.js";
import {
  buildScopedRanking,
  buildInitialRanking,
  combineRanking,
  createInitialPeople,
  assignGenericPeopleToSport,
  rankingForSport,
  rankingIdFor,
  resetSeasonalEntriesForYear,
  rankingStats,
} from "./ranking.js";
import {
  qualifierParticipantIdsFor,
  simulateCompetition,
} from "./simulation.js";
import {
  CONTINENTS,
  COUNTRIES,
  GEOGRAPHIC_SCOPES,
  countriesForContinent,
  geographicScopeLabel,
  hydratePersonGeography,
  normalizeGeographicScope,
} from "./geography.js";
import {
  MODALITIES,
  SPORTS,
  modalitiesForSport,
  modalityById,
  sportById,
  defaultScoringSystemForSport,
} from "./sports.js";
import {
  CALENDAR_PRESETS,
  buildPresetCompetitions,
  buildPresetPeople,
  presetById,
  presetSeries,
} from "./presets.js";
import {
  SCORING_SYSTEMS,
  pointsPreview,
  scoringSystemById,
  scoringSystemDescription,
  scoringSystemLabel,
} from "./scoring.js";
import {
  buildNewsFeed,
  latestTournamentWinners,
  topAthletesByRating,
} from "./newsroom.js";
import {
  athleteCompetitionHistory,
  finishedEvents,
  pastSeasons,
} from "./history.js";

const elements = {
  worldName: document.querySelector("#world-name"),
  gameDate: document.querySelector("#game-date"),
  monthTitle: document.querySelector("#month-title"),
  calendarGrid: document.querySelector("#calendar-grid"),
  selectedDateTitle: document.querySelector("#selected-date-title"),
  selectedDayEvents: document.querySelector("#selected-day-events"),
  upcomingEvents: document.querySelector("#upcoming-events"),
  previousMonth: document.querySelector("#previous-month"),
  nextMonth: document.querySelector("#next-month"),
  todayButton: document.querySelector("#today-button"),
  presetsButton: document.querySelector("#presets-button"),
  newEventButton: document.querySelector("#new-event-button"),
  addOnSelectedDate: document.querySelector("#add-on-selected-date"),
  advanceNextEvent: document.querySelector("#advance-next-event"),
  calendarView: document.querySelector("#calendar-view"),
  competitionsView: document.querySelector("#competitions-view"),
  sportsView: document.querySelector("#sports-view"),
  resultsView: document.querySelector("#results-view"),
  viewTabs: [...document.querySelectorAll("[data-view]")],
  hubTabs: [...document.querySelectorAll("[data-hub]")],
  hubPanels: {
    central: document.querySelector("#hub-central"),
    ranking: document.querySelector("#hub-ranking"),
    champions: document.querySelector("#hub-champions"),
    seasons: document.querySelector("#hub-seasons"),
  },
  openRankingsButton: document.querySelector("#open-rankings-button"),
  centralNewsList: document.querySelector("#central-news-list"),
  centralBestList: document.querySelector("#central-best-list"),
  centralWinnersGrid: document.querySelector("#central-winners-grid"),
  championsFilter: document.querySelector("#champions-filter"),
  championsList: document.querySelector("#champions-list"),
  seasonsSport: document.querySelector("#seasons-sport"),
  seasonsModality: document.querySelector("#seasons-modality"),
  seasonsList: document.querySelector("#seasons-list"),
  competitionsTabCount: document.querySelector("#competitions-tab-count"),
  newCompetitionButton: document.querySelector("#new-competition-button"),
  competitionsTotal: document.querySelector("#competitions-total"),
  competitionsAnnual: document.querySelector("#competitions-annual"),
  competitionsAveragePrestige: document.querySelector("#competitions-average-prestige"),
  competitionFilter: document.querySelector("#competition-filter"),
  competitionsList: document.querySelector("#competitions-list"),
  rankingTotal: document.querySelector("#ranking-total"),
  rankingCountries: document.querySelector("#ranking-countries"),
  rankingLeader: document.querySelector("#ranking-leader"),
  rankingScopeTitle: document.querySelector("#ranking-scope-title"),
  rankingSport: document.querySelector("#ranking-sport"),
  rankingModality: document.querySelector("#ranking-modality"),
  rankingScope: document.querySelector("#ranking-scope"),
  rankingContinentField: document.querySelector("#ranking-continent-field"),
  rankingContinent: document.querySelector("#ranking-continent"),
  rankingCountryField: document.querySelector("#ranking-country-field"),
  rankingCountry: document.querySelector("#ranking-country"),
  rankingFilter: document.querySelector("#ranking-filter"),
  rankingList: document.querySelector("#ranking-list"),
  rankingEmpty: document.querySelector("#ranking-empty"),
  resultsTabCount: document.querySelector("#results-tab-count"),
  resultsTotal: document.querySelector("#results-total"),
  resultsLatest: document.querySelector("#results-latest"),
  resultsList: document.querySelector("#results-list"),
  startDialog: document.querySelector("#start-dialog"),
  continueGameButton: document.querySelector("#continue-game-button"),
  newGameButton: document.querySelector("#new-game-button"),
  startError: document.querySelector("#start-error"),
  setupDialog: document.querySelector("#setup-dialog"),
  setupForm: document.querySelector("#setup-form"),
  setupWorldName: document.querySelector("#setup-world-name"),
  setupStartDate: document.querySelector("#setup-start-date"),
  presetDialog: document.querySelector("#preset-dialog"),
  presetSelect: document.querySelector("#preset-select"),
  presetName: document.querySelector("#preset-name"),
  presetDescription: document.querySelector("#preset-description"),
  presetCount: document.querySelector("#preset-count"),
  presetFormError: document.querySelector("#preset-form-error"),
  closePresetDialog: document.querySelector("#close-preset-dialog"),
  cancelPresetButton: document.querySelector("#cancel-preset-button"),
  applyPresetButton: document.querySelector("#apply-preset-button"),
  eventDialog: document.querySelector("#event-dialog"),
  eventForm: document.querySelector("#event-form"),
  eventDialogTitle: document.querySelector("#event-dialog-title"),
  eventId: document.querySelector("#event-id"),
  eventName: document.querySelector("#event-name"),
  eventType: document.querySelector("#event-type"),
  eventStartDate: document.querySelector("#event-start-date"),
  eventEndDate: document.querySelector("#event-end-date"),
  eventYearly: document.querySelector("#event-yearly"),
  eventNotes: document.querySelector("#event-notes"),
  eventFormError: document.querySelector("#event-form-error"),
  closeEventDialog: document.querySelector("#close-event-dialog"),
  cancelEventButton: document.querySelector("#cancel-event-button"),
  deleteEventButton: document.querySelector("#delete-event-button"),
  competitionDialog: document.querySelector("#competition-dialog"),
  competitionForm: document.querySelector("#competition-form"),
  competitionDialogTitle: document.querySelector("#competition-dialog-title"),
  competitionId: document.querySelector("#competition-id"),
  competitionName: document.querySelector("#competition-name"),
  competitionSport: document.querySelector("#competition-sport"),
  competitionDiscipline: document.querySelector("#competition-discipline"),
  competitionScoringSystem: document.querySelector("#competition-scoring-system"),
  scoringSystemHelp: document.querySelector("#scoring-system-help"),
  winnerPointsHelp: document.querySelector("#winner-points-help"),
  competitionModel: document.querySelector("#competition-model"),
  competitionModelHelp: document.querySelector("#competition-model-help"),
  seasonModelPanel: document.querySelector("#season-model-panel"),
  competitionSeasonName: document.querySelector("#competition-season-name"),
  competitionType: document.querySelector("#competition-type"),
  competitionQualification: document.querySelector("#competition-qualification"),
  qualificationHelp: document.querySelector("#qualification-help"),
  mixedQualificationPanel: document.querySelector("#mixed-qualification-panel"),
  competitionMixedCombination: document.querySelector("#competition-mixed-combination"),
  mixedSlotsFields: document.querySelector("#mixed-slots-fields"),
  mixedSlotsHelp: document.querySelector("#mixed-slots-help"),
  qualifierLinkPanel: document.querySelector("#qualifier-link-panel"),
  competitionQualifierTarget: document.querySelector("#competition-qualifier-target"),
  competitionQualifierSlots: document.querySelector("#competition-qualifier-slots"),
  competitionGeographicScope: document.querySelector("#competition-geographic-scope"),
  competitionContinentField: document.querySelector("#competition-continent-field"),
  competitionContinent: document.querySelector("#competition-continent"),
  competitionCountryField: document.querySelector("#competition-country-field"),
  competitionCountry: document.querySelector("#competition-country"),
  geographicScopeHelp: document.querySelector("#geographic-scope-help"),
  competitionStartDate: document.querySelector("#competition-start-date"),
  competitionEndDate: document.querySelector("#competition-end-date"),
  competitionYearly: document.querySelector("#competition-yearly"),
  competitionPrestige: document.querySelector("#competition-prestige"),
  competitionRankingPoints: document.querySelector("#competition-ranking-points"),
  competitionSlots: document.querySelector("#competition-slots"),
  competitionNotes: document.querySelector("#competition-notes"),
  competitionFormError: document.querySelector("#competition-form-error"),
  closeCompetitionDialog: document.querySelector("#close-competition-dialog"),
  cancelCompetitionButton: document.querySelector("#cancel-competition-button"),
  deleteCompetitionButton: document.querySelector("#delete-competition-button"),
  invitationDialog: document.querySelector("#invitation-dialog"),
  invitationForm: document.querySelector("#invitation-form"),
  invitationDialogTitle: document.querySelector("#invitation-dialog-title"),
  invitationDescription: document.querySelector("#invitation-description"),
  invitationFilter: document.querySelector("#invitation-filter"),
  invitationCounter: document.querySelector("#invitation-counter"),
  invitationAthletes: document.querySelector("#invitation-athletes"),
  invitationFormError: document.querySelector("#invitation-form-error"),
  closeInvitationDialog: document.querySelector("#close-invitation-dialog"),
  cancelInvitationButton: document.querySelector("#cancel-invitation-button"),
  toast: document.querySelector("#toast"),
};

const state = {
  world: null,
  events: [],
  competitions: [],
  continents: [],
  countries: [],
  sports: [],
  modalities: [],
  people: [],
  rankingEntries: [],
  ranking: [],
  results: [],
  competitionEntries: [],
  activeInvitation: null,
  viewDate: new Date(2026, 0, 1, 12),
  selectedDate: "2026-01-01",
  activeView: "calendar",
  activeHub: "central",
  advancing: false,
};

let toastTimer;
// Somente um "details" de atleta fica aberto por vez, evitando poluir a tela.
let activeAthleteDetail = null;

function createId(prefix = "event") {
  return globalThis.crypto?.randomUUID?.()
    ?? `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function replaceSelectOptions(select, items, placeholder) {
  const previousValue = select.value;
  select.replaceChildren();

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  select.append(placeholderOption);

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    select.append(option);
  });

  select.value = items.some(({ id }) => id === previousValue) ? previousValue : "";
}

function updateCountrySelect(continentSelect, countrySelect, placeholder = "Escolha o país") {
  replaceSelectOptions(
    countrySelect,
    countriesForContinent(continentSelect.value, state.countries),
    placeholder,
  );
}

function setupGeographyOptions() {
  const continents = [...state.continents].sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR"),
  );
  replaceSelectOptions(elements.competitionContinent, continents, "Escolha o continente");
  replaceSelectOptions(elements.rankingContinent, continents, "Escolha o continente");
  updateCountrySelect(elements.competitionContinent, elements.competitionCountry);
  updateCountrySelect(elements.rankingContinent, elements.rankingCountry);
}

function updateModalitySelect(preferredValue = "") {
  replaceSelectOptions(
    elements.competitionDiscipline,
    modalitiesForSport(elements.competitionSport.value, state.modalities),
    elements.competitionSport.value
      ? "Escolha a modalidade"
      : "Escolha primeiro o esporte",
  );
  if (
    preferredValue
    && [...elements.competitionDiscipline.options].some(({ value }) => value === preferredValue)
  ) {
    elements.competitionDiscipline.value = preferredValue;
  }
  elements.competitionDiscipline.disabled = !elements.competitionSport.value;
}

function updateRankingModalitySelect(preferredValue = "") {
  replaceSelectOptions(
    elements.rankingModality,
    modalitiesForSport(elements.rankingSport.value, state.modalities),
    elements.rankingSport.value
      ? "Escolha a modalidade"
      : "Escolha primeiro o esporte",
  );
  const candidates = [...elements.rankingModality.options]
    .filter(({ value }) => value);
  if (preferredValue && candidates.some(({ value }) => value === preferredValue)) {
    elements.rankingModality.value = preferredValue;
  } else if (candidates.length) {
    elements.rankingModality.value = candidates[0].value;
  }
  elements.rankingModality.disabled = !elements.rankingSport.value;
}

function setupScoringSystemOptions() {
  replaceSelectOptions(
    elements.competitionScoringSystem,
    SCORING_SYSTEMS,
    "Escolha o sistema de pontuação",
  );
}

function updateScoringSystem({
  preferredValue = "",
  useSportDefault = false,
} = {}) {
  const sportDefault = defaultScoringSystemForSport(
    elements.competitionSport.value,
    state.sports,
  );
  const nextValue = preferredValue
    || (useSportDefault && elements.competitionSport.value ? sportDefault : "")
    || elements.competitionScoringSystem.value
    || "generic-proportional";
  if (scoringSystemById(nextValue)) {
    elements.competitionScoringSystem.value = nextValue;
  }

  const scoringSystemId = elements.competitionScoringSystem.value;
  const scoringSystem = scoringSystemById(scoringSystemId);
  if (scoringSystem?.mode === "fixed") {
    elements.competitionRankingPoints.value = scoringSystem.winnerPoints;
    elements.competitionRankingPoints.readOnly = true;
    elements.winnerPointsHelp.textContent =
      "Este sistema usa valores fixos; o vencedor recebe 25 pontos.";
  } else {
    elements.competitionRankingPoints.readOnly = false;
    elements.winnerPointsHelp.textContent =
      "Nos sistemas proporcionais, este é o valor recebido pelo vencedor.";
  }
  const preview = pointsPreview(
    scoringSystemId,
    Number(elements.competitionRankingPoints.value) || 100,
  );
  elements.scoringSystemHelp.textContent =
    `${scoringSystemDescription(scoringSystemId)} Distribuição inicial: ${preview.join(" · ")} pts.`;
}

function updateCompetitionModelFields() {
  const model = elements.competitionModel.value || "standalone";
  const isSeasonStage = model === "season_stage";
  elements.seasonModelPanel.classList.toggle("hidden", !isSeasonStage);
  elements.competitionSeasonName.required = isSeasonStage;
  elements.competitionYearly.checked = isSeasonStage || elements.competitionYearly.checked;
  elements.competitionYearly.disabled = isSeasonStage;
  elements.competitionModelHelp.textContent =
    COMPETITION_MODELS[model]?.description ?? COMPETITION_MODELS.standalone.description;
}

function setupSportOptions() {
  const sports = [...state.sports].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  replaceSelectOptions(elements.competitionSport, sports, "Escolha o esporte");
  const previousRankingSport = elements.rankingSport.value;
  replaceSelectOptions(elements.rankingSport, sports, "Escolha o esporte");
  const sportWithAthletes = sports.find((sport) =>
    state.people.some((person) => person.sportId === sport.id));
  const catalogDefault = sports.find(({ id }) => id === SPORTS[0]?.id);
  const previousHasAthletes = state.people.some(
    (person) => person.sportId === previousRankingSport,
  );
  elements.rankingSport.value =
    sports.some(({ id }) => id === previousRankingSport)
    && (previousHasAthletes || !sportWithAthletes)
      ? previousRankingSport
      : sportWithAthletes?.id ?? catalogDefault?.id ?? sports[0]?.id ?? "";
  updateModalitySelect();
  updateRankingModalitySelect();
  setupSeasonsOptions();
}

function setupMixedQualificationOptions() {
  elements.competitionMixedCombination.replaceChildren();
  MIXED_QUALIFICATION_COMBINATIONS.forEach((combination) => {
    const option = document.createElement("option");
    option.value = combination.id;
    option.textContent = combination.label;
    elements.competitionMixedCombination.append(option);
  });
}

function readMixedSlots() {
  return Object.fromEntries(
    [...elements.mixedSlotsFields.querySelectorAll("[data-qualification-method]")]
      .map((input) => [input.dataset.qualificationMethod, Number(input.value)]),
  );
}

function updateMixedSlotsSummary() {
  const allocation = readMixedSlots();
  const allocated = Object.values(allocation)
    .filter(Number.isFinite)
    .reduce((total, slots) => total + slots, 0);
  const total = Number(elements.competitionSlots.value) || 0;
  elements.mixedSlotsHelp.textContent =
    `Distribuição atual: ${allocated} de ${total} vagas. A soma deve ser exatamente ${total}.`;
  elements.mixedSlotsHelp.classList.toggle("invalid-help", allocated !== total);
}

function renderMixedSlotFields(preferredSlots = null) {
  const currentSlots = preferredSlots ?? readMixedSlots();
  const combination = MIXED_QUALIFICATION_COMBINATIONS.find(
    ({ id }) => id === elements.competitionMixedCombination.value,
  );
  elements.mixedSlotsFields.replaceChildren();
  if (!combination) return;

  const totalSlots = Math.max(0, Number(elements.competitionSlots.value) || 0);
  const baseSlots = Math.floor(totalSlots / combination.methods.length);
  const remainder = totalSlots % combination.methods.length;

  combination.methods.forEach((method, index) => {
    const field = document.createElement("label");
    field.className = "field";
    const label = document.createElement("span");
    label.textContent = `Vagas — ${qualificationLabel(method)}`;
    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.max = "9999";
    input.step = "1";
    input.dataset.qualificationMethod = method;
    input.value = Number.isInteger(currentSlots[method])
      ? currentSlots[method]
      : baseSlots + (index < remainder ? 1 : 0);
    input.addEventListener("input", updateMixedSlotsSummary);
    field.append(label, input);
    elements.mixedSlotsFields.append(field);
  });
  updateMixedSlotsSummary();
}

function updateQualifierTargetOptions(preferredValue = "") {
  const currentCompetitionId = elements.competitionId.value;
  const sportId = elements.competitionSport.value;
  const modalityId = elements.competitionDiscipline.value;
  const sourceEndDate = elements.competitionEndDate.value;
  const candidates = sortCompetitions(state.competitions)
    .filter((competition) =>
      competition.id !== currentCompetitionId
      && usesQualificationMethod(competition, "qualifier")
      && (!sportId || competition.sportId === sportId)
      && (!modalityId || competition.modalityId === modalityId)
      && (!sourceEndDate || competition.startDate > sourceEndDate),
    )
    .map((competition) => ({
      id: competition.id,
      name: `${competition.name} — ${formatShortDate(competition.startDate)}`,
    }));
  replaceSelectOptions(
    elements.competitionQualifierTarget,
    candidates,
    "Escolha a competição de destino",
  );
  if (preferredValue && candidates.some(({ id }) => id === preferredValue)) {
    elements.competitionQualifierTarget.value = preferredValue;
  }
}

function updatePresetSummary() {
  const preset = presetById(elements.presetSelect.value);
  elements.presetName.textContent = preset?.name ?? "Nenhum preset selecionado";
  elements.presetDescription.textContent = preset?.description ?? "";
  if (preset) {
    const competitionCount = buildPresetCompetitions(preset).length;
    const athleteCount = buildPresetPeople(preset).length;
    elements.presetCount.textContent = `${competitionCount} competições`
      + (athleteCount ? ` · ${athleteCount} atletas oficiais` : "")
      + " prontos para importar";
  } else {
    elements.presetCount.textContent = "—";
  }
  elements.applyPresetButton.disabled = !preset;
}

function setupPresetOptions() {
  elements.presetSelect.replaceChildren();
  CALENDAR_PRESETS.forEach((preset) => {
    const option = document.createElement("option");
    option.value = preset.id;
    option.textContent = preset.name;
    elements.presetSelect.append(option);
  });
  updatePresetSummary();
}

function openPresetDialog() {
  elements.presetFormError.textContent = "";
  updatePresetSummary();
  elements.presetDialog.showModal();
}

function closePresetDialog() {
  elements.presetDialog.close();
}

function isUntouchedLegacyExample(event) {
  if (event.createdAt !== event.updatedAt || event.recurrence !== "yearly") return false;

  const signature = [
    event.name,
    event.type,
    event.startDate?.slice(5),
    event.endDate?.slice(5),
    event.notes ?? "",
  ].join("|");

  return new Set([
    "Liga Nacional de Atletismo — Etapa 1|league|01-15|01-16|Primeira etapa do calendário nacional.",
    "Seletiva Estadual|qualifier|02-05|02-05|",
    "Meeting de Verão|meeting|02-19|02-19|",
    "Copa Nacional|cup|03-10|03-13|",
    "Campeonato Nacional|championship|04-21|04-24|",
  ]).has(signature);
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  toastTimer = setTimeout(() => elements.toast.classList.remove("visible"), 2400);
}

function eventColor(type) {
  return EVENT_TYPES[type]?.color ?? EVENT_TYPES.other.color;
}

function eventTypeLabel(type) {
  return EVENT_TYPES[type]?.label ?? EVENT_TYPES.other.label;
}

function isEventOngoing(occurrence, date) {
  return occurrence.occurrenceStart < date && occurrence.occurrenceEnd >= date;
}

function dateDescription(occurrence, referenceDate = null) {
  if (referenceDate && isEventOngoing(occurrence, referenceDate)) {
    return `Em andamento · termina ${formatShortDate(occurrence.occurrenceEnd)}`;
  }
  if (occurrence.occurrenceStart === occurrence.occurrenceEnd) {
    return formatShortDate(occurrence.occurrenceStart);
  }
  return `${formatShortDate(occurrence.occurrenceStart)} — ${formatShortDate(occurrence.occurrenceEnd)}`;
}

function renderEventItem(occurrence, referenceDate = null) {
  const item = document.createElement("article");
  item.className = "event-item";
  item.style.setProperty("--event-color", eventColor(occurrence.type));
  item.dataset.eventId = occurrence.id;
  item.tabIndex = 0;
  item.innerHTML = `
    <i class="event-stripe" aria-hidden="true"></i>
    <div>
      <strong></strong>
      <span></span>
    </div>
  `;
  item.querySelector("strong").textContent = occurrence.name;
  item.querySelector("span").textContent =
    `${eventTypeLabel(occurrence.type)} · ${dateDescription(occurrence, referenceDate)}`;
  const openItem = () => {
    if (occurrence.competitionId) {
      openCompetitionDialog(occurrence.competitionId);
      return;
    }
    openEventDialog(occurrence.id);
  };

  item.addEventListener("click", openItem);
  item.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") openItem();
  });
  return item;
}

function renderCalendar() {
  const calendarDays = getCalendarDays(state.viewDate);
  const rangeStart = calendarDays[0].isoDate;
  const rangeEnd = calendarDays.at(-1).isoDate;
  const occurrences = occurrencesBetween(state.events, rangeStart, rangeEnd);

  elements.monthTitle.textContent = formatMonth(state.viewDate);
  elements.calendarGrid.replaceChildren();

  for (const day of calendarDays) {
    const dayButton = document.createElement("button");
    const dailyEvents = occurrences.filter(
      (event) => event.occurrenceStart <= day.isoDate && event.occurrenceEnd >= day.isoDate,
    );

    dayButton.type = "button";
    dayButton.className = "calendar-day";
    dayButton.dataset.date = day.isoDate;
    dayButton.setAttribute("role", "gridcell");
    dayButton.setAttribute("aria-label", formatFullDate(day.isoDate));
    if (!day.isCurrentMonth) dayButton.classList.add("outside-month");
    if (day.isoDate === state.selectedDate) dayButton.classList.add("selected");
    if (day.isoDate === state.world.currentDate) dayButton.classList.add("game-today");

    const dayNumber = document.createElement("span");
    dayNumber.className = "day-number";
    dayNumber.textContent = day.date.getDate();

    const eventContainer = document.createElement("span");
    eventContainer.className = "day-events";

    dailyEvents.slice(0, 3).forEach((occurrence) => {
      const eventChip = document.createElement("span");
      eventChip.className = "calendar-event";
      eventChip.style.setProperty("--event-color", eventColor(occurrence.type));
      eventChip.textContent = occurrence.name;
      eventContainer.append(eventChip);
    });

    if (dailyEvents.length > 3) {
      const more = document.createElement("span");
      more.className = "more-events";
      more.textContent = `+${dailyEvents.length - 3} evento(s)`;
      eventContainer.append(more);
    }

    dayButton.append(dayNumber, eventContainer);
    dayButton.addEventListener("click", () => selectDate(day.isoDate));
    dayButton.addEventListener("dblclick", () => openEventDialog(null, day.isoDate));
    elements.calendarGrid.append(dayButton);
  }
}

function renderSelectedDay() {
  const occurrences = eventsOnDate(state.events, state.selectedDate);
  elements.selectedDateTitle.textContent = formatFullDate(state.selectedDate);
  elements.selectedDayEvents.replaceChildren();

  if (!occurrences.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Nenhum evento neste dia. Dê dois toques no dia ou use “Adicionar”.";
    elements.selectedDayEvents.append(empty);
    return;
  }

  occurrences.forEach((event) => elements.selectedDayEvents.append(renderEventItem(event, state.selectedDate)));
}

function renderUpcomingEvents() {
  const upcoming = upcomingOccurrences(state.events, state.world.currentDate, 6);
  elements.upcomingEvents.replaceChildren();

  if (!upcoming.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Não há eventos futuros no calendário.";
    elements.upcomingEvents.append(empty);
    return;
  }

  upcoming.forEach((event) => {
    elements.upcomingEvents.append(renderEventItem(event, state.world.currentDate));
  });
}

function normalizedSearch(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
}

function competitionDateDescription(competition) {
  const recurrence = competition.recurrence === "yearly" ? " · anual" : "";
  if (competition.startDate === competition.endDate) {
    return `${formatShortDate(competition.startDate)}${recurrence}`;
  }
  return `${formatShortDate(competition.startDate)} — ${formatShortDate(competition.endDate)}${recurrence}`;
}

function createBadge(text, className = "") {
  const badge = document.createElement("span");
  badge.className = `badge ${className}`.trim();
  badge.textContent = text;
  return badge;
}

function seasonMetadataFor(competition) {
  if (competition.competitionModel !== "season_stage") {
    return {
      seasonRound: null,
      seasonRoundCount: null,
      seasonFinalRound: false,
    };
  }
  const stages = sortCompetitions(state.competitions.filter((candidate) =>
    candidate.competitionModel === "season_stage"
    && candidate.seasonId === competition.seasonId));
  const index = stages.findIndex(({ id }) => id === competition.id);
  return {
    seasonRound: competition.seasonRound ?? (index >= 0 ? index + 1 : null),
    seasonRoundCount: competition.seasonRoundCount ?? stages.length,
    seasonFinalRound:
      competition.seasonFinalRound
      || (index >= 0 && index === stages.length - 1),
  };
}

function renderCompetitionCard(competition) {
  const card = document.createElement("article");
  card.className = "competition-card";
  card.tabIndex = 0;
  card.dataset.competitionId = competition.id;
  card.innerHTML = `
    <div class="competition-date">
      <strong></strong>
      <span></span>
    </div>
    <div class="competition-main">
      <h3></h3>
      <p></p>
      <div class="competition-rules"></div>
    </div>
    <div class="competition-badges"></div>
  `;

  const dateBox = card.querySelector(".competition-date");
  dateBox.style.setProperty("--event-color", eventColor(competition.type));
  dateBox.querySelector("strong").textContent = formatShortDate(competition.startDate);
  const recurrenceLabel =
    competition.recurrence === "yearly" ? "anual" : "edição única";
  dateBox.querySelector("span").textContent =
    competition.startDate === competition.endDate
      ? recurrenceLabel
      : `até ${formatShortDate(competition.endDate)} · ${recurrenceLabel}`;

  card.querySelector("h3").textContent = competition.name;
  card.querySelector(".competition-main > p").textContent =
    `${competition.sport} · ${competition.discipline}`;

  const rules = card.querySelector(".competition-rules");
  rules.append(
    createBadge(`${competition.slots} vagas`),
    createBadge(qualificationLabel(competition.qualification)),
    createBadge(geographicScopeLabel(competition), "geography"),
    createBadge(`${competition.rankingPoints ?? 100} pts ao vencedor`),
    createBadge(scoringSystemLabel(
      competition.scoringSystemId ?? "generic-proportional",
    )),
    createBadge(competitionModelLabel(
      competition.competitionModel ?? "standalone",
    )),
  );
  if (competition.competitionModel === "season_stage") {
    const seasonMetadata = seasonMetadataFor(competition);
    rules.append(
      createBadge(
        `${competition.seasonName} · etapa ${seasonMetadata.seasonRound ?? "—"}`
        + `/${seasonMetadata.seasonRoundCount ?? "—"}`,
      ),
    );
  }
  if (competition.qualification === "mixed") {
    rules.append(
      createBadge(
        qualificationMethods(competition)
          .map((method) => qualificationLabel(method))
          .join(" + "),
      ),
    );
  }
  if (competition.type === "qualifier" && competition.qualifierSlots) {
    const target = state.competitions.find(
      ({ id }) => id === competition.qualifierTargetCompetitionId,
    );
    rules.append(
      createBadge(
        `${competition.qualifierSlots} vaga${competition.qualifierSlots === 1 ? "" : "s"} para ${target?.name ?? "destino não encontrado"}`,
      ),
    );
  }

  const badges = card.querySelector(".competition-badges");
  badges.append(
    createBadge(eventTypeLabel(competition.type)),
    createBadge(`Prestígio ${competition.prestige}`, "prestige"),
  );
  const resultCount = state.results.filter(
    (result) => result.competitionId === competition.id,
  ).length;
  if (resultCount) {
    badges.append(createBadge(`${resultCount} resultado${resultCount === 1 ? "" : "s"}`, "simulated"));
  }

  const openCard = () => openCompetitionDialog(competition.id);
  card.addEventListener("click", openCard);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") openCard();
  });
  card.setAttribute(
    "aria-label",
    `${competition.name}, ${competitionDateDescription(competition)}`,
  );

  return card;
}

function renderCompetitions() {
  const stats = competitionStats(state.competitions);
  elements.competitionsTotal.textContent = stats.total;
  elements.competitionsAnnual.textContent = stats.annual;
  elements.competitionsAveragePrestige.textContent = stats.averagePrestige;
  elements.competitionsTabCount.textContent = stats.total;

  const filter = normalizedSearch(elements.competitionFilter.value.trim());
  const competitions = sortCompetitions(state.competitions).filter((competition) => {
    if (!filter) return true;
    return normalizedSearch(
      `${competition.name} ${competition.sport} ${competition.discipline} ${geographicScopeLabel(competition)}`,
    ).includes(filter);
  });

  elements.competitionsList.replaceChildren();

  if (!competitions.length) {
    const empty = document.createElement("div");
    empty.className = "competitions-empty";

    if (state.competitions.length && filter) {
      empty.innerHTML = `
        <div>
          <h3>Nenhuma competição encontrada</h3>
          <p>Altere o texto do filtro para ver outras competições.</p>
        </div>
      `;
    } else {
      empty.innerHTML = `
        <div>
          <h3>O mundo ainda não possui competições</h3>
          <p>
            Crie a primeira estrutura esportiva. Ela aparecerá aqui e também
            no calendário do passo 1.
          </p>
          <button class="button button-primary" type="button">Criar primeira competição</button>
        </div>
      `;
      empty.querySelector("button").addEventListener("click", () => openCompetitionDialog());
    }

    elements.competitionsList.append(empty);
    return;
  }

  competitions.forEach((competition) => {
    elements.competitionsList.append(renderCompetitionCard(competition));
  });
}

function renderRanking() {
  const selectedSport = sportById(elements.rankingSport.value, state.sports);
  const selectedModality = modalityById(
    elements.rankingModality.value,
    state.modalities,
  );
  const disciplineRanking = selectedSport && selectedModality
    ? rankingForSport(state.ranking, {
      sportId: selectedSport.id,
      modalityId: selectedModality.id,
    })
    : [];
  const geographicScope = elements.rankingScope.value;
  const scopeSource = {
    geographicScope,
    continentId: elements.rankingContinent.value || null,
    countryId: elements.rankingCountry.value || null,
  };
  const hasCompleteSelection =
    geographicScope === "world"
    || (geographicScope === "continental" && scopeSource.continentId)
    || (geographicScope === "national" && scopeSource.continentId && scopeSource.countryId);
  const scopedRanking = hasCompleteSelection
    ? buildScopedRanking(disciplineRanking, scopeSource)
    : [];
  const stats = rankingStats(scopedRanking);
  elements.rankingTotal.textContent = stats.total;
  elements.rankingCountries.textContent = stats.countries;
  elements.rankingLeader.textContent = stats.leader;
  const seasonYear = disciplineRanking[0]?.rankingModel === "seasonal"
    ? disciplineRanking[0].seasonYear
    : null;
  const disciplineLabel = selectedSport && selectedModality
    ? `${selectedSport.name} · ${selectedModality.name}`
      + (seasonYear ? ` · Temporada ${seasonYear}` : "")
    : "Escolha um esporte e uma modalidade";
  elements.rankingScopeTitle.textContent = hasCompleteSelection
    ? `${disciplineLabel} · ${geographicScopeLabel(scopeSource)}`
    : geographicScope === "national"
      ? "Escolha um continente e um país"
      : "Escolha um continente";

  const filter = normalizedSearch(elements.rankingFilter.value.trim());
  const ranking = scopedRanking.filter(({ person }) => {
    if (!filter) return true;
    return normalizedSearch(
      `${person.name} ${person.countryName} ${person.countryCode}`,
    ).includes(filter);
  });

  closeAthleteDetail();
  elements.rankingList.replaceChildren();
  elements.rankingEmpty.classList.toggle("hidden", ranking.length > 0);
  elements.rankingEmpty.textContent = hasCompleteSelection
    ? "Nenhuma pessoa encontrada."
    : geographicScope === "national"
      ? "Escolha primeiro o continente e depois o país."
      : "Escolha um continente.";

  ranking.forEach((entry) => {
    const row = document.createElement("tr");
    if (entry.position <= 3) row.classList.add(`top-${entry.position}`);

    const position = document.createElement("td");
    position.className = "ranking-position";
    position.textContent = entry.position;

    const movement = document.createElement("td");
    const positionChange = entry.previousPosition - entry.position;
    movement.className = positionChange > 0
      ? "ranking-movement positive"
      : positionChange < 0
        ? "ranking-movement negative"
        : "ranking-movement";
    movement.textContent = positionChange > 0
      ? `▲ ${positionChange}`
      : positionChange < 0
        ? `▼ ${Math.abs(positionChange)}`
        : "—";

    const person = document.createElement("td");
    person.className = "ranking-person";
    const personName = document.createElement("strong");
    personName.textContent = entry.person.name;
    const personId = document.createElement("span");
    personId.textContent = entry.person.id;
    person.append(personName, personId);
    attachAthleteTrigger(person, entry.person.id, "ranking", (node) => {
      const detailRow = document.createElement("tr");
      detailRow.className = "athlete-detail-row";
      const cell = document.createElement("td");
      cell.colSpan = 9;
      cell.append(node);
      detailRow.append(cell);
      row.after(detailRow);
      return detailRow;
    });

    const country = document.createElement("td");
    country.className = "ranking-country";
    const countryCode = document.createElement("span");
    countryCode.className = "country-code";
    countryCode.textContent = entry.person.countryCode;
    const countryName = document.createElement("span");
    countryName.textContent = entry.person.countryName;
    country.append(countryCode, countryName);

    const age = document.createElement("td");
    age.textContent = entry.person.age;

    const baseRating = document.createElement("td");
    baseRating.textContent = entry.person.baseRating;

    const momentum = document.createElement("td");
    momentum.className = entry.person.momentum > 0
      ? "momentum positive"
      : entry.person.momentum < 0
        ? "momentum negative"
        : "momentum";
    momentum.textContent = entry.person.momentum > 0
      ? `+${entry.person.momentum}`
      : entry.person.momentum;

    const points = document.createElement("td");
    points.className = "ranking-points";
    points.textContent = entry.points.toLocaleString("pt-BR");

    const eventsCount = document.createElement("td");
    eventsCount.textContent = entry.eventsCount;

    row.append(position, movement, person, country, age, baseRating, momentum, eventsCount, points);
    elements.rankingList.append(row);
  });
}

function formatRankingChange(change) {
  if (change > 0) return `▲ ${change}`;
  if (change < 0) return `▼ ${Math.abs(change)}`;
  return "—";
}

function renderResults() {
  const results = [...state.results].sort((a, b) =>
    b.occurrenceEnd.localeCompare(a.occurrenceEnd)
    || b.simulatedAt.localeCompare(a.simulatedAt),
  );
  elements.resultsTotal.textContent = results.length;
  elements.resultsTabCount.textContent = results.length;
  elements.resultsLatest.textContent = results[0]?.competitionName ?? "—";
  elements.resultsList.replaceChildren();

  if (!results.length) {
    const empty = document.createElement("div");
    empty.className = "competitions-empty";
    empty.innerHTML = `
      <div>
        <h3>Nenhuma competição simulada</h3>
        <p>
          Crie uma competição e avance o calendário pelo último dia dela.
          O resultado será registrado automaticamente aqui.
        </p>
      </div>
    `;
    elements.resultsList.append(empty);
    return;
  }

  results.forEach((result) => {
    const card = document.createElement("article");
    card.className = "result-card";
    card.id = `result-${result.id}`;
    card.dataset.resultId = result.id;

    const heading = document.createElement("div");
    heading.className = "result-heading";
    const titleArea = document.createElement("div");
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = `${result.sport} · ${result.discipline}`;
    const title = document.createElement("h3");
    title.textContent = result.competitionName;
    const meta = document.createElement("p");
    meta.textContent =
      `${formatShortDate(result.occurrenceEnd)} · ${result.participantCount} participantes`
      + ` · ${result.scoringSystemName ?? `${result.winnerPoints} pontos ao vencedor`}`;
    titleArea.append(eyebrow, title, meta);
    const resultBadges = document.createElement("div");
    resultBadges.className = "competition-badges";
    resultBadges.append(
      createBadge(geographicScopeLabel(result), "geography"),
      createBadge(`Prestígio ${result.prestige}`, "prestige"),
    );
    if (result.competitionModel === "season_stage") {
      resultBadges.append(
        createBadge(
          `${result.seasonName} · etapa ${result.seasonRound}/${result.seasonRoundCount}`,
        ),
      );
    }
    if (result.seasonChampion) {
      resultBadges.append(
        createBadge(
          `Campeão ${result.seasonChampion.seasonYear}: ${result.seasonChampion.name}`
          + ` (${result.seasonChampion.points} pts)`,
          "simulated",
        ),
      );
    }
    heading.append(titleArea, resultBadges);

    const scroll = document.createElement("div");
    scroll.className = "ranking-table-scroll";
    const table = document.createElement("table");
    table.className = "ranking-table result-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th scope="col">Pos.</th>
          <th scope="col">Pessoa</th>
          <th scope="col">País</th>
          <th scope="col">Performance</th>
          <th scope="col">Pontos</th>
          <th scope="col">Novo ranking</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    const body = table.querySelector("tbody");

    result.standings.forEach((standing) => {
      const row = document.createElement("tr");
      if (standing.position <= 3) row.classList.add(`top-${standing.position}`);

      const position = document.createElement("td");
      position.className = "ranking-position";
      position.textContent = standing.position;
      const person = document.createElement("td");
      person.className = "ranking-person";
      const name = document.createElement("strong");
      name.textContent = standing.name;
      const personId = document.createElement("span");
      personId.textContent = standing.personId;
      person.append(name, personId);
      const country = document.createElement("td");
      country.textContent = standing.countryCode;
      const performance = document.createElement("td");
      performance.className = "result-performance";
      performance.textContent = standing.performance.toFixed(2);
      const points = document.createElement("td");
      points.className = "ranking-points";
      points.textContent = `+${standing.pointsAwarded}`;
      const newRanking = document.createElement("td");
      newRanking.className = standing.rankingChange > 0
        ? "ranking-movement positive"
        : standing.rankingChange < 0
          ? "ranking-movement negative"
          : "ranking-movement";
      newRanking.textContent =
        `${standing.newRankingPosition}º · ${formatRankingChange(standing.rankingChange)}`;

      row.append(position, person, country, performance, points, newRanking);
      body.append(row);
    });

    scroll.append(table);
    card.append(heading, scroll);
    elements.resultsList.append(card);
  });
}

function render() {
  elements.worldName.textContent = state.world.name;
  elements.gameDate.textContent = formatFullDate(state.world.currentDate);
  renderCalendar();
  renderSelectedDay();
  renderUpcomingEvents();
  renderCompetitions();
  renderRanking();
  renderCentral();
  renderChampions();
  renderSeasons();
  renderResults();
}

function switchView(view) {
  state.activeView = view;
  const views = {
    calendar: elements.calendarView,
    competitions: elements.competitionsView,
    sports: elements.sportsView,
    results: elements.resultsView,
  };
  Object.entries(views).forEach(([viewName, viewElement]) => {
    viewElement.classList.toggle("hidden", viewName !== view);
  });
  elements.viewTabs.forEach((tab) => {
    const isActive = tab.dataset.view === view;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

function switchHub(hub) {
  if (!elements.hubPanels[hub]) return;
  state.activeHub = hub;
  Object.entries(elements.hubPanels).forEach(([hubName, panel]) => {
    panel.classList.toggle("hidden", hubName !== hub);
  });
  elements.hubTabs.forEach((tab) => {
    const isActive = tab.dataset.hub === hub;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

// Abre a Central dos Esportes na aba de rankings, opcionalmente pré-selecionando
// um esporte e uma modalidade (usado pelos hiperlinks das notícias).
function openRankingFor({ sportId = "", modalityId = "" } = {}) {
  switchView("sports");
  switchHub("ranking");
  if (sportId && [...elements.rankingSport.options].some(({ value }) => value === sportId)) {
    elements.rankingSport.value = sportId;
    updateRankingModalitySelect(modalityId);
  }
  elements.rankingScope.value = "world";
  updateRankingGeographyFields();
}

// Leva o jogador ao resultado completo de uma edição, destacando a ficha.
function goToResult(resultId) {
  switchView("results");
  const card = document.querySelector(`#result-${CSS.escape(resultId)}`);
  if (!card) return;
  card.scrollIntoView({ behavior: "smooth", block: "start" });
  card.classList.add("result-card-highlight");
  setTimeout(() => card.classList.remove("result-card-highlight"), 2000);
}

function followNewsLink(link) {
  if (!link) return;
  if (link.target === "result") {
    goToResult(link.resultId);
  } else if (link.target === "season-ranking") {
    openRankingFor({ sportId: link.sportId, modalityId: link.modalityId });
  }
}

function renderCentralNews() {
  const news = buildNewsFeed(state.results, { limit: 12 });
  elements.centralNewsList.replaceChildren();

  if (!news.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent =
      "Ainda não há notícias. Avance o calendário até o fim de uma competição para gerar os primeiros acontecimentos.";
    elements.centralNewsList.append(empty);
    return;
  }

  news.forEach((item) => {
    const card = document.createElement("article");
    card.className = `news-card news-${item.kind}`;

    const badge = document.createElement("span");
    badge.className = "news-badge";
    badge.textContent = item.kind === "season-finished" ? "Campeonato" : "Evento";

    const body = document.createElement("div");
    body.className = "news-body";
    const title = document.createElement("strong");
    title.textContent = item.title;
    const summary = document.createElement("p");
    summary.textContent = item.summary;
    const meta = document.createElement("span");
    meta.className = "news-meta";
    meta.textContent = [item.disciplineLabel, formatShortDate(item.date)]
      .filter(Boolean)
      .join(" · ");
    body.append(title, summary, meta);

    const linkButton = document.createElement("button");
    linkButton.type = "button";
    linkButton.className = "news-link";
    linkButton.textContent = item.link.label;
    linkButton.addEventListener("click", () => followNewsLink(item.link));

    card.append(badge, body, linkButton);
    elements.centralNewsList.append(card);
  });
}

function renderCentralBest() {
  const best = topAthletesByRating(state.people, { limit: 10 });
  closeAthleteDetail();
  elements.centralBestList.replaceChildren();

  if (!best.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent =
      "Importe um preset para vincular atletas a um esporte e revelar os melhores ratings.";
    elements.centralBestList.append(empty);
    return;
  }

  best.forEach(({ rank, person }) => {
    const item = document.createElement("li");
    item.className = "best-item";
    if (rank <= 3) item.classList.add(`top-${rank}`);

    const position = document.createElement("span");
    position.className = "best-rank";
    position.textContent = `${rank}º`;

    const info = document.createElement("div");
    info.className = "best-info";
    const name = document.createElement("strong");
    name.textContent = person.name;
    const meta = document.createElement("span");
    meta.textContent = [person.countryCode, person.sport ?? sportNameFor(person)]
      .filter(Boolean)
      .join(" · ");
    info.append(name, meta);

    const rating = document.createElement("span");
    rating.className = "best-rating";
    rating.textContent = person.baseRating;

    item.append(position, info, rating);
    attachAthleteTrigger(item, person.id, "best", (node) => {
      const detailItem = document.createElement("li");
      detailItem.className = "athlete-detail-li";
      detailItem.append(node);
      item.after(detailItem);
      return detailItem;
    });
    elements.centralBestList.append(item);
  });
}

function sportNameFor(person) {
  return sportById(person.sportId, state.sports)?.name ?? "";
}

function renderCentralWinners() {
  const winners = latestTournamentWinners(state.results, { count: 4 });
  elements.centralWinnersGrid.replaceChildren();

  if (!winners.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Nenhum torneio concluído até agora.";
    elements.centralWinnersGrid.append(empty);
    return;
  }

  winners.forEach((winner) => {
    const square = document.createElement("article");
    square.className = "winner-square";

    const header = document.createElement("button");
    header.type = "button";
    header.className = "winner-header";
    const name = document.createElement("strong");
    name.textContent = winner.competitionName;
    const meta = document.createElement("span");
    meta.textContent = [winner.disciplineLabel, formatShortDate(winner.date)]
      .filter(Boolean)
      .join(" · ");
    header.append(name, meta);
    header.addEventListener("click", () => goToResult(winner.resultId));

    const podium = document.createElement("ol");
    podium.className = "winner-podium";
    winner.podium.forEach((entry) => {
      const row = document.createElement("li");
      row.className = `podium-row podium-${entry.position}`;
      const pos = document.createElement("span");
      pos.className = "podium-position";
      pos.textContent = `${entry.position}º`;
      const athlete = document.createElement("span");
      athlete.className = "podium-name";
      athlete.textContent = entry.name;
      const flag = document.createElement("span");
      flag.className = "podium-country";
      flag.textContent = entry.countryCode ?? "";
      row.append(pos, athlete, flag);
      podium.append(row);
    });

    const link = document.createElement("button");
    link.type = "button";
    link.className = "news-link winner-link";
    link.textContent = "Ver resultado";
    link.addEventListener("click", () => goToResult(winner.resultId));

    square.append(header, podium, link);
    elements.centralWinnersGrid.append(square);
  });
}

function renderCentral() {
  renderCentralNews();
  renderCentralBest();
  renderCentralWinners();
}

// ---------------------------------------------------------------------------
// Histórico: details de atleta, campeões passados e temporadas encerradas.
// ---------------------------------------------------------------------------

function closeAthleteDetail() {
  if (!activeAthleteDetail) return;
  activeAthleteDetail.removable?.remove();
  activeAthleteDetail.trigger?.classList.remove("athlete-open");
  activeAthleteDetail = null;
}

function personIsSeasonal(person) {
  const modality = modalityById(person.modalityId, state.modalities);
  const sport = sportById(person.sportId, state.sports);
  return (modality?.rankingModel ?? sport?.rankingModel) === "seasonal";
}

function buildAthleteDetailNode(person) {
  const wrapper = document.createElement("div");
  wrapper.className = "athlete-detail";
  const seasonal = personIsSeasonal(person);

  const heading = document.createElement("p");
  heading.className = "athlete-detail-heading";
  heading.textContent = seasonal
    ? "Posição final em cada temporada"
    : "Últimas competições";
  wrapper.append(heading);

  const history = athleteCompetitionHistory(state.results, person.id, {
    seasonal,
    limit: 10,
  });

  if (!history.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Este atleta ainda não disputou competições concluídas.";
    wrapper.append(empty);
    return wrapper;
  }

  const list = document.createElement("ol");
  list.className = "athlete-history";
  history.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "athlete-history-item";

    const pos = document.createElement("span");
    pos.className = "athlete-history-position";
    if (entry.position <= 3) pos.classList.add(`top-${entry.position}`);
    pos.textContent = `${entry.position}º`;

    const info = document.createElement("div");
    info.className = "athlete-history-info";
    const title = document.createElement("strong");
    title.textContent = entry.title;
    const meta = document.createElement("span");
    meta.textContent = [
      entry.subtitle,
      formatShortDate(entry.date),
      `${entry.participants} part.`,
      entry.points ? `${entry.points} pts` : null,
    ].filter(Boolean).join(" · ");
    info.append(title, meta);

    const link = document.createElement("button");
    link.type = "button";
    link.className = "news-link athlete-history-link";
    link.textContent = entry.type === "season" ? "Ver temporada" : "Ver resultado";
    link.addEventListener("click", (clickEvent) => {
      clickEvent.stopPropagation();
      if (entry.link.target === "result") goToResult(entry.link.resultId);
      else if (entry.link.target === "season") goToSeason(entry.link);
    });

    item.append(pos, info, link);
    list.append(item);
  });
  wrapper.append(list);
  return wrapper;
}

// Alterna o details do atleta; `insert` posiciona o nó e devolve o que remover.
function toggleAthleteDetail(key, person, trigger, insert) {
  if (activeAthleteDetail?.key === key) {
    closeAthleteDetail();
    return;
  }
  closeAthleteDetail();
  const content = buildAthleteDetailNode(person);
  const removable = insert(content) ?? content;
  trigger?.classList.add("athlete-open");
  activeAthleteDetail = { key, trigger, removable };
}

function renderChampions() {
  const filter = normalizedSearch(elements.championsFilter.value.trim());
  const events = finishedEvents(state.results).filter((event) => {
    if (!filter) return true;
    return normalizedSearch(
      `${event.competitionName} ${event.sport} ${event.discipline} ${event.champion?.name ?? ""}`,
    ).includes(filter);
  });

  elements.championsList.replaceChildren();

  if (!events.length) {
    const empty = document.createElement("div");
    empty.className = "competitions-empty";
    empty.innerHTML = `
      <div>
        <h3>Nenhum evento concluído</h3>
        <p>Avance o calendário pelo último dia de uma competição para registrar o primeiro campeão.</p>
      </div>
    `;
    elements.championsList.append(empty);
    return;
  }

  events.forEach((event) => {
    const card = document.createElement("article");
    card.className = "champion-card";

    const info = document.createElement("div");
    info.className = "champion-info";
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = [event.sport, event.discipline].filter(Boolean).join(" · ");
    const title = document.createElement("h3");
    title.textContent = event.competitionName;
    const champion = document.createElement("p");
    champion.className = "champion-name";
    champion.textContent = event.isSeasonFinal && event.seasonChampion
      ? `Campeão ${event.year}: ${event.seasonChampion.name}`
      : event.champion
        ? `Campeão: ${event.champion.name}`
        : "Sem campeão registrado";
    const meta = document.createElement("p");
    meta.className = "champion-meta";
    meta.textContent = `${formatShortDate(event.date)} · ${event.participantCount} participantes`;
    info.append(eyebrow, title, champion, meta);

    const side = document.createElement("div");
    side.className = "champion-side";
    const badges = document.createElement("div");
    badges.className = "competition-badges";
    if (event.prestige != null) badges.append(createBadge(`Prestígio ${event.prestige}`, "prestige"));
    if (event.isSeasonFinal) badges.append(createBadge("Fim de temporada", "simulated"));
    const link = document.createElement("button");
    link.type = "button";
    link.className = "news-link";
    link.textContent = "Ver resultado";
    link.addEventListener("click", () => goToResult(event.resultId));
    side.append(badges, link);

    card.append(info, side);
    elements.championsList.append(card);
  });
}

function updateSeasonsModalitySelect(preferredValue = "") {
  replaceSelectOptions(
    elements.seasonsModality,
    modalitiesForSport(elements.seasonsSport.value, state.modalities),
    elements.seasonsSport.value ? "Todas as modalidades" : "Escolha primeiro o esporte",
  );
  if (
    preferredValue
    && [...elements.seasonsModality.options].some(({ value }) => value === preferredValue)
  ) {
    elements.seasonsModality.value = preferredValue;
  }
  elements.seasonsModality.disabled = !elements.seasonsSport.value;
}

function setupSeasonsOptions() {
  const sports = [...state.sports].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  const preferredModality = elements.seasonsModality.value;
  replaceSelectOptions(elements.seasonsSport, sports, "Todos os esportes");
  // Sem escolha prévia, aponta para a modalidade da temporada mais recente.
  if (!elements.seasonsSport.value) {
    const latest = pastSeasons(state.results)[0];
    if (latest?.sportId && sports.some(({ id }) => id === latest.sportId)) {
      elements.seasonsSport.value = latest.sportId;
      updateSeasonsModalitySelect(latest.modalityId ?? "");
      return;
    }
  }
  updateSeasonsModalitySelect(preferredModality);
}

function renderSeasons() {
  const sportId = elements.seasonsSport.value;
  const modalityId = elements.seasonsModality.value;
  const seasons = pastSeasons(state.results).filter((season) =>
    (!sportId || season.sportId === sportId)
    && (!modalityId || season.modalityId === modalityId));

  closeAthleteDetail();
  elements.seasonsList.replaceChildren();

  if (!seasons.length) {
    const empty = document.createElement("div");
    empty.className = "competitions-empty";
    empty.innerHTML = `
      <div>
        <h3>Nenhuma temporada registrada</h3>
        <p>Importe um preset sazonal (como a Fórmula 1) e conclua ao menos uma etapa para ver as classificações finais.</p>
      </div>
    `;
    elements.seasonsList.append(empty);
    return;
  }

  seasons.forEach((season) => {
    const card = document.createElement("article");
    card.className = "season-card";
    card.id = `season-${season.key}`;
    card.dataset.seasonKey = season.key;

    const heading = document.createElement("div");
    heading.className = "season-heading";
    const titleArea = document.createElement("div");
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = [season.sport, season.discipline].filter(Boolean).join(" · ");
    const title = document.createElement("h3");
    title.textContent = `${season.seasonName} ${season.year}`;
    const meta = document.createElement("p");
    meta.className = "champion-meta";
    meta.textContent = `${season.rounds} etapa${season.rounds === 1 ? "" : "s"}`
      + (season.finished && season.champion
        ? ` · Campeão: ${season.champion.name}`
        : " · Em andamento");
    titleArea.append(eyebrow, title, meta);
    const badges = document.createElement("div");
    badges.className = "competition-badges";
    badges.append(createBadge(season.finished ? "Encerrada" : "Em andamento", season.finished ? "simulated" : ""));
    heading.append(titleArea, badges);

    const scroll = document.createElement("div");
    scroll.className = "ranking-table-scroll";
    const table = document.createElement("table");
    table.className = "ranking-table season-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th scope="col">Pos.</th>
          <th scope="col">Pessoa</th>
          <th scope="col">País</th>
          <th scope="col">Etapas</th>
          <th scope="col">Pontos</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    const body = table.querySelector("tbody");
    season.standings.forEach((row) => {
      const tr = document.createElement("tr");
      if (row.position <= 3) tr.classList.add(`top-${row.position}`);
      const position = document.createElement("td");
      position.className = "ranking-position";
      position.textContent = row.position;
      const person = document.createElement("td");
      person.className = "ranking-person";
      const name = document.createElement("strong");
      name.textContent = row.name;
      person.append(name);
      attachAthleteTrigger(person, row.personId, `season-${season.key}`, (node) => {
        const detailRow = document.createElement("tr");
        detailRow.className = "athlete-detail-row";
        const cell = document.createElement("td");
        cell.colSpan = 5;
        cell.append(node);
        detailRow.append(cell);
        tr.after(detailRow);
        return detailRow;
      });
      const country = document.createElement("td");
      country.textContent = row.countryCode ?? "";
      const events = document.createElement("td");
      events.textContent = row.events;
      const points = document.createElement("td");
      points.className = "ranking-points";
      points.textContent = row.points.toLocaleString("pt-BR");
      tr.append(position, person, country, events, points);
      body.append(tr);
    });

    scroll.append(table);
    card.append(heading, scroll);
    elements.seasonsList.append(card);
  });
}

// Torna uma célula/elemento clicável para abrir o details do atleta, se houver
// pessoa correspondente no estado atual.
function attachAthleteTrigger(triggerEl, personId, scope, insert) {
  const person = state.people.find((candidate) => candidate.id === personId);
  if (!person) return;
  triggerEl.classList.add("athlete-trigger");
  triggerEl.tabIndex = 0;
  const key = `${scope}:${personId}`;
  const activate = () => toggleAthleteDetail(key, person, triggerEl, insert);
  triggerEl.addEventListener("click", activate);
  triggerEl.addEventListener("keydown", (keyEvent) => {
    if (keyEvent.key === "Enter" || keyEvent.key === " ") {
      keyEvent.preventDefault();
      activate();
    }
  });
}

function goToSeason(link) {
  switchView("sports");
  switchHub("seasons");
  if (link.sportId && [...elements.seasonsSport.options].some(({ value }) => value === link.sportId)) {
    elements.seasonsSport.value = link.sportId;
    updateSeasonsModalitySelect(link.modalityId ?? "");
  }
  renderSeasons();
  const card = document.querySelector(`#season-${CSS.escape(link.seasonKey ?? "")}`);
  if (!card) return;
  card.scrollIntoView({ behavior: "smooth", block: "start" });
  card.classList.add("result-card-highlight");
  setTimeout(() => card.classList.remove("result-card-highlight"), 2000);
}

function selectDate(isoDate) {
  state.selectedDate = isoDate;
  const selected = parseISODate(isoDate);
  if (
    selected.getMonth() !== state.viewDate.getMonth()
    || selected.getFullYear() !== state.viewDate.getFullYear()
  ) {
    state.viewDate = selected;
  }
  renderCalendar();
  renderSelectedDay();
}

function goToGameDate() {
  state.selectedDate = state.world.currentDate;
  state.viewDate = parseISODate(state.world.currentDate);
  render();
}

function changeMonth(amount) {
  state.viewDate = new Date(
    state.viewDate.getFullYear(),
    state.viewDate.getMonth() + amount,
    1,
    12,
  );
  renderCalendar();
}

function resetEventForm(defaultDate) {
  elements.eventForm.reset();
  elements.eventId.value = "";
  elements.eventStartDate.value = defaultDate;
  elements.eventEndDate.value = defaultDate;
  elements.eventDialogTitle.textContent = "Novo evento";
  elements.deleteEventButton.classList.add("hidden");
  elements.eventFormError.textContent = "";
}

function openEventDialog(eventId = null, defaultDate = state.selectedDate) {
  resetEventForm(defaultDate);

  if (eventId) {
    const event = state.events.find((candidate) => candidate.id === eventId);
    if (!event) return;

    elements.eventDialogTitle.textContent = "Editar evento";
    elements.eventId.value = event.id;
    elements.eventName.value = event.name;
    elements.eventType.value = event.type;
    elements.eventStartDate.value = event.startDate;
    elements.eventEndDate.value = event.endDate;
    elements.eventYearly.checked = event.recurrence === "yearly";
    elements.eventNotes.value = event.notes ?? "";
    elements.deleteEventButton.classList.remove("hidden");
  }

  elements.eventDialog.showModal();
  requestAnimationFrame(() => elements.eventName.focus());
}

function closeEventDialog() {
  elements.eventDialog.close();
}

function updateQualificationFields({
  mixedSlots = null,
  qualifierTargetId = elements.competitionQualifierTarget.value,
} = {}) {
  const selected = QUALIFICATION_CRITERIA[elements.competitionQualification.value];
  elements.qualificationHelp.textContent = selected?.description ?? "";
  const isMixed = elements.competitionQualification.value === "mixed";
  const isQualifierCompetition = elements.competitionType.value === "qualifier";
  elements.mixedQualificationPanel.classList.toggle("hidden", !isMixed);
  elements.competitionMixedCombination.required = isMixed;
  elements.qualifierLinkPanel.classList.toggle("hidden", !isQualifierCompetition);
  elements.competitionQualifierTarget.required = isQualifierCompetition;
  elements.competitionQualifierSlots.required = isQualifierCompetition;

  if (isMixed) renderMixedSlotFields(mixedSlots);
  if (isQualifierCompetition) updateQualifierTargetOptions(qualifierTargetId);
}

function updateCompetitionGeographyFields({ preserveCountry = false } = {}) {
  const scope = elements.competitionGeographicScope.value;
  const usesContinent = scope === "continental" || scope === "national";
  const usesCountry = scope === "national";

  elements.competitionContinentField.classList.toggle("hidden", !usesContinent);
  elements.competitionCountryField.classList.toggle("hidden", !usesCountry);
  elements.competitionContinent.required = usesContinent;
  elements.competitionCountry.required = usesCountry;
  elements.competitionContinent.disabled = !usesContinent;
  elements.competitionCountry.disabled = !usesCountry;

  if (!usesContinent) {
    elements.competitionContinent.value = "";
    updateCountrySelect(elements.competitionContinent, elements.competitionCountry);
  } else if (!preserveCountry) {
    updateCountrySelect(elements.competitionContinent, elements.competitionCountry);
  }
  if (!usesCountry) elements.competitionCountry.value = "";

  const selected = GEOGRAPHIC_SCOPES[scope];
  elements.geographicScopeHelp.textContent = selected?.description ?? "";
}

function updateRankingGeographyFields({ preserveCountry = false } = {}) {
  const scope = elements.rankingScope.value;
  const usesContinent = scope === "continental" || scope === "national";
  const usesCountry = scope === "national";

  elements.rankingContinentField.classList.toggle("hidden", !usesContinent);
  elements.rankingCountryField.classList.toggle("hidden", !usesCountry);
  elements.rankingContinent.disabled = !usesContinent;
  elements.rankingCountry.disabled = !usesCountry;

  if (!usesContinent) {
    elements.rankingContinent.value = "";
    updateCountrySelect(elements.rankingContinent, elements.rankingCountry);
  } else if (!preserveCountry) {
    updateCountrySelect(elements.rankingContinent, elements.rankingCountry);
  }
  if (!usesCountry) elements.rankingCountry.value = "";

  renderRanking();
}

function resetCompetitionForm(defaultDate) {
  elements.competitionForm.reset();
  elements.competitionId.value = "";
  elements.competitionSport.value = "";
  updateModalitySelect();
  elements.competitionScoringSystem.value = "generic-proportional";
  elements.competitionModel.value = "standalone";
  elements.competitionSeasonName.value = "";
  elements.competitionStartDate.value = defaultDate;
  elements.competitionEndDate.value = defaultDate;
  elements.competitionDialogTitle.textContent = "Nova competição";
  elements.competitionRankingPoints.value = 100;
  elements.competitionGeographicScope.value = "world";
  elements.competitionMixedCombination.value =
    MIXED_QUALIFICATION_COMBINATIONS[0]?.id ?? "";
  elements.competitionQualifierTarget.value = "";
  elements.competitionQualifierSlots.value = 1;
  elements.competitionContinent.value = "";
  updateCountrySelect(elements.competitionContinent, elements.competitionCountry);
  elements.deleteCompetitionButton.classList.add("hidden");
  elements.competitionFormError.textContent = "";
  updateScoringSystem({ preferredValue: "generic-proportional" });
  updateCompetitionModelFields();
  updateQualificationFields();
  updateCompetitionGeographyFields();
}

function openCompetitionDialog(competitionId = null, defaultDate = state.selectedDate) {
  resetCompetitionForm(defaultDate);

  if (competitionId) {
    const competition = state.competitions.find((candidate) => candidate.id === competitionId);
    if (!competition) return;

    elements.competitionDialogTitle.textContent = "Editar competição";
    elements.competitionId.value = competition.id;
    elements.competitionName.value = competition.name;
    elements.competitionSport.value = competition.sportId ?? "";
    updateModalitySelect(competition.modalityId ?? "");
    updateScoringSystem({
      preferredValue: competition.scoringSystemId ?? "generic-proportional",
    });
    elements.competitionModel.value = competition.competitionModel ?? "standalone";
    elements.competitionSeasonName.value = competition.seasonName ?? "";
    elements.competitionType.value = competition.type;
    elements.competitionQualification.value = competition.qualification;
    elements.competitionGeographicScope.value =
      normalizeGeographicScope(competition.geographicScope);
    elements.competitionContinent.value = competition.continentId ?? "";
    updateCountrySelect(elements.competitionContinent, elements.competitionCountry);
    elements.competitionCountry.value = competition.countryId ?? "";
    elements.competitionStartDate.value = competition.startDate;
    elements.competitionEndDate.value = competition.endDate;
    elements.competitionYearly.checked = competition.recurrence === "yearly";
    elements.competitionPrestige.value = competition.prestige;
    elements.competitionRankingPoints.value = competition.rankingPoints ?? 100;
    updateScoringSystem({
      preferredValue: competition.scoringSystemId ?? "generic-proportional",
    });
    elements.competitionSlots.value = competition.slots;
    elements.competitionNotes.value = competition.notes ?? "";
    elements.competitionMixedCombination.value =
      competition.mixedCombination ?? MIXED_QUALIFICATION_COMBINATIONS[0]?.id ?? "";
    elements.competitionQualifierSlots.value = competition.qualifierSlots ?? 1;
    elements.deleteCompetitionButton.classList.remove("hidden");
    updateCompetitionModelFields();
    updateQualificationFields({
      mixedSlots: competition.mixedSlots ?? null,
      qualifierTargetId: competition.qualifierTargetCompetitionId ?? "",
    });
    updateCompetitionGeographyFields({ preserveCountry: true });
  }

  elements.competitionDialog.showModal();
  requestAnimationFrame(() => elements.competitionName.focus());
}

function closeCompetitionDialog() {
  elements.competitionDialog.close();
}

async function reloadCompetitionsAndEvents() {
  [state.competitions, state.events] = await Promise.all([
    getAllCompetitions(),
    getAllEvents(),
  ]);
}

async function reloadRanking() {
  [state.people, state.rankingEntries] = await Promise.all([
    getAllPeople(),
    getAllRankingEntries(),
  ]);
  state.ranking = combineRanking(state.people, state.rankingEntries);
}

async function reloadGeography() {
  [state.continents, state.countries] = await Promise.all([
    getAllContinents(),
    getAllCountries(),
  ]);
  setupGeographyOptions();
}

async function reloadSports() {
  [state.sports, state.modalities] = await Promise.all([
    getAllSports(),
    getAllModalities(),
  ]);
  setupSportOptions();
}

async function ensureSports() {
  await reloadSports();
  if (
    SPORTS.some(({ id }) => !state.sports.some((sport) => sport.id === id))
    || MODALITIES.some(({ id }) => !state.modalities.some((modality) => modality.id === id))
  ) {
    await saveSportsAndModalities(SPORTS, MODALITIES);
    await reloadSports();
  }
}

async function ensureGeography() {
  await reloadGeography();
  if (
    CONTINENTS.some(({ id }) => !state.continents.some((continent) => continent.id === id))
    || COUNTRIES.some(({ id }) => !state.countries.some((country) => country.id === id))
  ) {
    await saveGeography(CONTINENTS, COUNTRIES);
    await reloadGeography();
  }

  const continentIds = CONTINENTS.map(({ id }) => id);
  if (JSON.stringify(state.world.continentIds ?? []) !== JSON.stringify(continentIds)) {
    state.world.continentIds = continentIds;
    await saveWorld(state.world);
  }

  await reloadRanking();
  const hydratedPeople = state.people.map(hydratePersonGeography);
  const needsMigration = hydratedPeople.some((person, index) =>
    person.countryId !== state.people[index].countryId
    || person.continentId !== state.people[index].continentId
    || person.countryName !== state.people[index].countryName,
  );
  if (needsMigration) {
    await savePeople(hydratedPeople);
    await reloadRanking();
  }
}

async function reloadResults() {
  state.results = await getAllResults();
}

async function reloadCompetitionEntries() {
  state.competitionEntries = await getAllCompetitionEntries();
}

async function ensureInitialRanking() {
  await reloadRanking();
  if (state.people.length >= 100 && state.rankingEntries.length >= 100) return;

  const timestamp = state.world?.createdAt ?? new Date().toISOString();
  const people = createInitialPeople(timestamp);
  const entries = buildInitialRanking(people, timestamp);
  await saveInitialRanking(people, entries);
  await reloadRanking();
}

async function removeLegacyExamplesOnce() {
  if (state.world.step3LegacyExamplesChecked) return;

  const examples = state.events.filter(isUntouchedLegacyExample);
  await Promise.all(examples.map((event) => deleteEvent(event.id)));
  state.world.step3LegacyExamplesChecked = true;
  await saveWorld(state.world);
  if (examples.length) state.events = await getAllEvents();
}

async function handleCompetitionSubmit(submitEvent) {
  submitEvent.preventDefault();
  elements.competitionFormError.textContent = "";

  const existing = state.competitions.find(
    (competition) => competition.id === elements.competitionId.value,
  );
  const now = new Date().toISOString();
  const geographicScope = elements.competitionGeographicScope.value;
  const qualification = elements.competitionQualification.value;
  const type = elements.competitionType.value;
  const competitionModel = elements.competitionModel.value;
  const seasonName = competitionModel === "season_stage"
    ? elements.competitionSeasonName.value.trim()
    : null;
  const selectedSport = sportById(elements.competitionSport.value, state.sports);
  const selectedModality = modalityById(
    elements.competitionDiscipline.value,
    state.modalities,
  );
  const competition = {
    id: existing?.id ?? createId("competition"),
    calendarEventId: existing?.calendarEventId ?? createId("event"),
    name: elements.competitionName.value.trim(),
    sportId: selectedSport?.id ?? null,
    modalityId: selectedModality?.id ?? null,
    sport: selectedSport?.name ?? "",
    discipline: selectedModality?.name ?? "",
    scoringSystemId: elements.competitionScoringSystem.value,
    competitionModel,
    seasonId: competitionModel === "season_stage"
      ? existing?.seasonId
        ?? `season_${normalizedSearch(seasonName).replace(/[^a-z0-9]+/g, "_")}`
      : null,
    seasonName,
    seasonalRanking: competitionModel === "season_stage",
    presetId: existing?.presetId ?? null,
    participantIds: existing?.participantIds ?? null,
    seasonRound: existing?.seasonRound ?? null,
    seasonRoundCount: existing?.seasonRoundCount ?? null,
    seasonFinalRound: existing?.seasonFinalRound ?? false,
    type,
    qualification,
    mixedCombination: qualification === "mixed"
      ? elements.competitionMixedCombination.value
      : null,
    mixedSlots: qualification === "mixed" ? readMixedSlots() : null,
    qualifierTargetCompetitionId: type === "qualifier"
      ? elements.competitionQualifierTarget.value || null
      : null,
    qualifierSlots: type === "qualifier"
      ? Number(elements.competitionQualifierSlots.value)
      : null,
    geographicScope,
    continentId: geographicScope === "world"
      ? null
      : elements.competitionContinent.value || null,
    countryId: geographicScope === "national"
      ? elements.competitionCountry.value || null
      : null,
    startDate: elements.competitionStartDate.value,
    endDate: elements.competitionEndDate.value,
    recurrence: competitionModel === "season_stage" || elements.competitionYearly.checked
      ? "yearly"
      : "none",
    prestige: Number(elements.competitionPrestige.value),
    rankingPoints: Number(elements.competitionRankingPoints.value),
    slots: Number(elements.competitionSlots.value),
    minimumRanking: null,
    notes: elements.competitionNotes.value.trim(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const errors = validateCompetition(competition, { competitions: state.competitions });
  if (errors.length) {
    elements.competitionFormError.textContent = errors.join(" ");
    return;
  }

  await saveCompetitionWithEvent(competition, buildCalendarEvent(competition));
  await reloadCompetitionsAndEvents();
  closeCompetitionDialog();
  render();
  showToast(existing ? "Competição atualizada." : "Competição criada e adicionada ao calendário.");
  setTimeout(openDueInvitationIfAny, 0);
}

async function handleDeleteCompetition() {
  const competition = state.competitions.find(
    (candidate) => candidate.id === elements.competitionId.value,
  );
  if (!competition) return;

  const linkedQualifiers = state.competitions.filter(
    ({ qualifierTargetCompetitionId }) =>
      qualifierTargetCompetitionId === competition.id,
  );
  if (linkedQualifiers.length) {
    elements.competitionFormError.textContent =
      `Remova primeiro o vínculo da${linkedQualifiers.length === 1 ? "" : "s"} classificatória${linkedQualifiers.length === 1 ? "" : "s"}: `
      + linkedQualifiers.map(({ name }) => name).join(", ");
    return;
  }

  if (!window.confirm(`Excluir “${competition.name}” e sua entrada no calendário?`)) return;

  await deleteCompetitionWithEvent(competition.id, competition.calendarEventId);
  await reloadCompetitionsAndEvents();
  closeCompetitionDialog();
  render();
  showToast("Competição excluída do sistema e do calendário.");
}

async function ensurePresetRoster(preset) {
  if (!preset) return;
  const timestamp = new Date().toISOString();
  const series = presetSeries(preset);
  if (!series.length) return;
  const primarySeries = series[0];
  let people = state.people;
  const assigningInitialSport = !state.world.initialSportPresetId;

  // Os 100 atletas genéricos recebem, uma única vez, o esporte e a modalidade
  // da série principal do primeiro preset importado.
  if (assigningInitialSport) {
    people = assignGenericPeopleToSport(people, {
      sportId: primarySeries.sportId,
      modalityId: primarySeries.modalityId,
      updatedAt: timestamp,
    });
    state.world.initialSportPresetId = preset.id;
    await saveWorld(state.world);
  }

  const existingPersonIds = new Set(people.map(({ id }) => id));
  const presetPeople = buildPresetPeople(preset, timestamp)
    .filter(({ id }) => !existingPersonIds.has(id));
  people = [...people, ...presetPeople];

  const seasonYear = Number(state.world.currentDate.slice(0, 4));
  const missingEntries = [];

  // Cada série (F1, F2, F3, tênis...) mantém seu próprio ranking independente.
  for (const seriesItem of series) {
    const modality = modalityById(seriesItem.modalityId, state.modalities);
    const rankingModel = modality?.rankingModel ?? "cumulative";
    const rankingId = rankingIdFor(seriesItem.sportId, seriesItem.modalityId);
    const existingEntryIds = new Set(
      state.rankingEntries
        .filter((entry) => entry.rankingId === rankingId)
        .map(({ personId }) => personId),
    );
    let generatedEntries = buildInitialRanking(people, timestamp, {
      rankingId,
      sportId: seriesItem.sportId,
      modalityId: seriesItem.modalityId,
      rankingModel,
      seasonYear,
      startAtZero: rankingModel === "seasonal",
    });
    // Preserva o histórico do ranking "world" só quando o primeiro preset é
    // cumulativo (caso do tênis), na sua série principal.
    if (assigningInitialSport && seriesItem === primarySeries && rankingModel === "cumulative") {
      const legacyEntries = new Map(
        state.rankingEntries
          .filter(({ rankingId: legacyRankingId }) => legacyRankingId === "world")
          .map((entry) => [entry.personId, entry]),
      );
      generatedEntries = generatedEntries
        .map((entry) => {
          const legacy = legacyEntries.get(entry.personId);
          return legacy
            ? {
              ...entry,
              points: legacy.points,
              eventsCount: legacy.eventsCount,
              previousPosition: legacy.previousPosition,
            }
            : entry;
        })
        .sort((a, b) =>
          b.points - a.points
          || a.previousPosition - b.previousPosition
          || a.personId.localeCompare(b.personId),
        )
        .map((entry, index) => ({ ...entry, position: index + 1 }));
    }
    missingEntries.push(
      ...generatedEntries.filter(({ personId }) => !existingEntryIds.has(personId)),
    );
  }

  if (presetPeople.length || people.some((person, index) => person !== state.people[index])) {
    await savePeople(people);
  }
  if (missingEntries.length) {
    await saveRankingEntries(missingEntries);
  }
  await reloadRanking();
  setupSportOptions();
}

async function ensureRosterForImportedPresets() {
  const importedPresetId = state.competitions.find(({ presetId }) => presetId)?.presetId;
  if (!importedPresetId) return;
  await ensurePresetRoster(presetById(importedPresetId));
}

async function handleApplyPreset() {
  elements.presetFormError.textContent = "";
  const preset = presetById(elements.presetSelect.value);
  if (!preset) {
    elements.presetFormError.textContent = "Escolha um preset válido.";
    return;
  }
  await ensurePresetRoster(preset);

  const existingIds = new Set(state.competitions.map(({ id }) => id));
  const competitions = buildPresetCompetitions(preset)
    .filter(({ id }) => !existingIds.has(id));

  if (!competitions.length) {
    elements.presetFormError.textContent =
      "Este preset já foi adicionado integralmente ao calendário.";
    return;
  }

  elements.applyPresetButton.disabled = true;
  try {
    await saveCompetitionsWithEvents(
      competitions.map((competition) => ({
        competition,
        calendarEvent: buildCalendarEvent(competition),
      })),
    );
    await reloadCompetitionsAndEvents();
    state.selectedDate = competitions[0].startDate;
    state.viewDate = parseISODate(competitions[0].startDate);
    closePresetDialog();
    render();
    showToast(
      `${competitions.length} competições do preset foram adicionadas ao calendário.`,
    );
  } catch (error) {
    console.error(error);
    elements.presetFormError.textContent =
      error.message ?? "Não foi possível adicionar o preset.";
  } finally {
    elements.applyPresetButton.disabled = false;
  }
}

async function handleEventSubmit(submitEvent) {
  submitEvent.preventDefault();
  elements.eventFormError.textContent = "";

  if (elements.eventEndDate.value < elements.eventStartDate.value) {
    elements.eventFormError.textContent = "A data final não pode ser anterior à data inicial.";
    return;
  }

  const existing = state.events.find((event) => event.id === elements.eventId.value);
  const now = new Date().toISOString();
  const event = {
    id: existing?.id ?? createId(),
    name: elements.eventName.value.trim(),
    type: elements.eventType.value,
    startDate: elements.eventStartDate.value,
    endDate: elements.eventEndDate.value,
    recurrence: elements.eventYearly.checked ? "yearly" : "none",
    notes: elements.eventNotes.value.trim(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await saveEvent(event);
  state.events = await getAllEvents();
  closeEventDialog();
  render();
  showToast(existing ? "Evento atualizado." : "Evento criado.");
}

async function handleDeleteEvent() {
  const event = state.events.find((candidate) => candidate.id === elements.eventId.value);
  if (!event) return;

  if (!window.confirm(`Excluir “${event.name}” do calendário?`)) return;

  await deleteEvent(event.id);
  state.events = await getAllEvents();
  closeEventDialog();
  render();
  showToast("Evento excluído.");
}

function competitionEntryFor(competitionId, occurrenceStart) {
  return state.competitionEntries.find(
    (entry) =>
      entry.competitionId === competitionId
      && entry.occurrenceStart === occurrenceStart,
  ) ?? null;
}

function findPendingInvitation(referenceDate = state.world.currentDate) {
  return occurrencesBetween(
    state.competitions,
    referenceDate,
    addDays(referenceDate, 10),
  )
    .filter((occurrence) =>
      usesQualificationMethod(occurrence, "invitation")
      && invitationOpensOn(occurrence.occurrenceStart) <= referenceDate
      && occurrence.occurrenceStart >= referenceDate
      && !competitionEntryFor(occurrence.id, occurrence.occurrenceStart),
    )
    .sort((a, b) =>
      a.occurrenceStart.localeCompare(b.occurrenceStart)
      || b.prestige - a.prestige
      || a.name.localeCompare(b.name, "pt-BR"),
    )[0] ?? null;
}

function invitationCandidates(competition) {
  return buildScopedRanking(
    rankingForSport(state.ranking, competition),
    competition,
  );
}

function updateInvitationCounter() {
  const active = state.activeInvitation;
  if (!active) return;
  elements.invitationCounter.textContent =
    `${active.selectedPersonIds.size} de ${active.capacity} escolhidos`;
}

function renderInvitationAthletes() {
  const active = state.activeInvitation;
  elements.invitationAthletes.replaceChildren();
  if (!active) return;

  const filter = normalizedSearch(elements.invitationFilter.value.trim());
  const candidates = invitationCandidates(active.competition)
    .filter(({ person }) => !filter || normalizedSearch(
      `${person.name} ${person.countryName} ${person.countryCode}`,
    ).includes(filter));

  if (!candidates.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Nenhum atleta elegível encontrado.";
    elements.invitationAthletes.append(empty);
    updateInvitationCounter();
    return;
  }

  candidates.forEach((entry) => {
    const label = document.createElement("label");
    label.className = "invitation-athlete";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = entry.personId;
    checkbox.checked = active.selectedPersonIds.has(entry.personId);
    checkbox.disabled =
      !checkbox.checked && active.selectedPersonIds.size >= active.capacity;

    const position = document.createElement("span");
    position.className = "ranking-number";
    position.textContent = `${entry.position}º`;

    const athleteName = document.createElement("span");
    athleteName.className = "athlete-name";
    const strong = document.createElement("strong");
    strong.textContent = entry.person.name;
    const athleteId = document.createElement("span");
    athleteId.textContent = entry.person.id;
    athleteName.append(strong, athleteId);

    const country = document.createElement("span");
    country.className = "athlete-country";
    country.textContent = `${entry.person.countryCode} · ${entry.person.countryName}`;

    const points = document.createElement("span");
    points.className = "invitation-points";
    points.textContent = `${entry.points.toLocaleString("pt-BR")} pts`;

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        if (active.selectedPersonIds.size >= active.capacity) {
          checkbox.checked = false;
          return;
        }
        active.selectedPersonIds.add(entry.personId);
      } else {
        active.selectedPersonIds.delete(entry.personId);
      }
      elements.invitationFormError.textContent = "";
      renderInvitationAthletes();
    });

    label.append(checkbox, position, athleteName, country, points);
    elements.invitationAthletes.append(label);
  });
  updateInvitationCounter();
}

function openInvitationDialog(occurrence) {
  const capacity = slotsForQualificationMethod(occurrence, "invitation");
  const existingEntry = competitionEntryFor(occurrence.id, occurrence.occurrenceStart);
  state.activeInvitation = {
    competition: occurrence,
    occurrenceStart: occurrence.occurrenceStart,
    occurrenceEnd: occurrence.occurrenceEnd,
    capacity,
    selectedPersonIds: new Set(existingEntry?.selectedPersonIds ?? []),
  };
  elements.invitationDialogTitle.textContent = occurrence.name;
  elements.invitationDescription.textContent =
    `A competição começa em ${formatShortDate(occurrence.occurrenceStart)}. `
    + `Escolha até ${capacity} participante${capacity === 1 ? "" : "s"} para as vagas por convite.`;
  elements.invitationFilter.value = "";
  elements.invitationFormError.textContent = "";
  renderInvitationAthletes();
  if (!elements.invitationDialog.open) elements.invitationDialog.showModal();
}

function closeInvitationSelection() {
  if (elements.invitationDialog.open) elements.invitationDialog.close();
  state.activeInvitation = null;
}

function openDueInvitationIfAny() {
  if (!state.world || elements.invitationDialog.open) return false;
  const pending = findPendingInvitation();
  if (!pending) return false;
  openInvitationDialog(pending);
  return true;
}

async function handleInvitationSubmit(submitEvent) {
  submitEvent.preventDefault();
  const active = state.activeInvitation;
  if (!active) return;

  const minimumSelection = active.competition.qualification === "invitation"
    ? Math.min(2, active.capacity)
    : 1;
  if (active.selectedPersonIds.size < minimumSelection) {
    elements.invitationFormError.textContent =
      `Escolha ao menos ${minimumSelection} atleta${minimumSelection === 1 ? "" : "s"} para concluir os convites.`;
    return;
  }

  const selectedPersonIds = invitationCandidates(active.competition)
    .filter(({ personId }) => active.selectedPersonIds.has(personId))
    .map(({ personId }) => personId)
    .slice(0, active.capacity);
  const timestamp = new Date().toISOString();
  await saveCompetitionEntry({
    id: `entry_${active.competition.id}_${active.occurrenceStart}`,
    competitionId: active.competition.id,
    occurrenceStart: active.occurrenceStart,
    occurrenceEnd: active.occurrenceEnd,
    sportId: active.competition.sportId,
    selectedPersonIds,
    selectionType: "invitation",
    createdAt: competitionEntryFor(
      active.competition.id,
      active.occurrenceStart,
    )?.createdAt ?? timestamp,
    updatedAt: timestamp,
  });
  await reloadCompetitionEntries();
  closeInvitationSelection();
  showToast(`${selectedPersonIds.length} participante(s) confirmado(s) por convite.`);
  setTimeout(openDueInvitationIfAny, 0);
}

async function resetSeasonRankingsIfNeeded(isoDate) {
  const year = Number(isoDate.slice(0, 4));
  const resetEntries = resetSeasonalEntriesForYear(
    state.rankingEntries,
    year,
    `${year}-01-01T00:00:00.000Z`,
  );
  const changedEntries = resetEntries.filter(
    (entry, index) => entry !== state.rankingEntries[index],
  );
  if (!changedEntries.length) return 0;

  await saveRankingEntries(changedEntries);
  state.rankingEntries = resetEntries;
  state.ranking = combineRanking(state.people, state.rankingEntries);
  return changedEntries.length;
}

async function processSimulationDate(isoDate) {
  const scheduled = occurrencesBetween(state.competitions, isoDate, isoDate)
    .filter((competition) => competition.occurrenceEnd === isoDate)
    .sort((a, b) => b.prestige - a.prestige || a.name.localeCompare(b.name, "pt-BR"));
  let simulatedCount = 0;

  for (const occurrence of scheduled) {
    const resultId = `result_${occurrence.id}_${occurrence.occurrenceStart}`;
    if (state.results.some((result) => result.id === resultId)) continue;

    const entry = competitionEntryFor(occurrence.id, occurrence.occurrenceStart);
    const competitionWithSeason = {
      ...occurrence,
      ...seasonMetadataFor(occurrence),
    };
    const competitionRanking = rankingForSport(
      state.ranking,
      competitionWithSeason,
    );
    const { result, rankingEntries } = simulateCompetition({
      competition: competitionWithSeason,
      occurrenceStart: occurrence.occurrenceStart,
      occurrenceEnd: occurrence.occurrenceEnd,
      ranking: competitionRanking,
      invitedPersonIds: entry?.selectedPersonIds ?? [],
      qualifierPersonIds: qualifierParticipantIdsFor({
        competition: occurrence,
        occurrenceStart: occurrence.occurrenceStart,
        competitions: state.competitions,
        results: state.results,
      }),
    });
    await saveCompetitionResult(result, rankingEntries);
    state.results.push(result);
    const updatedRankingId = rankingEntries[0]?.rankingId;
    state.rankingEntries = [
      ...state.rankingEntries.filter(({ rankingId }) => rankingId !== updatedRankingId),
      ...rankingEntries,
    ];
    state.ranking = combineRanking(state.people, state.rankingEntries);
    simulatedCount += 1;
  }

  return simulatedCount;
}

async function advanceDays(days) {
  let simulatedCount = 0;
  let advancedDays = 0;
  for (let day = 0; day < days; day += 1) {
    const pendingInvitation = findPendingInvitation();
    if (pendingInvitation) {
      openInvitationDialog(pendingInvitation);
      return { simulatedCount, advancedDays, pausedForInvitation: true };
    }
    await resetSeasonRankingsIfNeeded(state.world.currentDate);
    simulatedCount += await processSimulationDate(state.world.currentDate);
    state.world.currentDate = addDays(state.world.currentDate, 1);
    await saveWorld(state.world);
    advancedDays += 1;
  }

  const pendingInvitation = findPendingInvitation();
  if (pendingInvitation) openInvitationDialog(pendingInvitation);
  return {
    simulatedCount,
    advancedDays,
    pausedForInvitation: Boolean(pendingInvitation),
  };
}

async function advanceTime(days) {
  if (state.advancing) return;
  state.advancing = true;
  try {
    const { simulatedCount, advancedDays, pausedForInvitation } = await advanceDays(days);
    goToGameDate();
    const resultMessage = simulatedCount
      ? ` ${simulatedCount} competição${simulatedCount === 1 ? "" : "ões"} simulada${simulatedCount === 1 ? "" : "s"}.`
      : "";
    if (pausedForInvitation) {
      showToast(
        `Avanço pausado após ${advancedDays} dia${advancedDays === 1 ? "" : "s"} para escolher convites.${resultMessage}`,
      );
    } else {
      showToast(
        `A simulação avançou ${advancedDays === 1 ? "1 dia" : `${advancedDays} dias`}.${resultMessage}`,
      );
    }
  } catch (error) {
    console.error(error);
    showToast(error.message ?? "Não foi possível avançar a simulação.");
  } finally {
    state.advancing = false;
  }
}

async function advanceToNextEvent() {
  if (state.advancing) return;
  const nextDate = nextEventDate(state.events, state.world.currentDate);

  if (!nextDate) {
    showToast("Não existe outro evento nos próximos três anos.");
    return;
  }

  state.advancing = true;
  try {
    let simulatedCount = 0;
    let pausedForInvitation = false;
    while (state.world.currentDate < nextDate) {
      const outcome = await advanceDays(1);
      simulatedCount += outcome.simulatedCount;
      if (outcome.pausedForInvitation) {
        pausedForInvitation = true;
        break;
      }
    }
    goToGameDate();
    if (pausedForInvitation) {
      showToast("Avanço pausado para escolher os participantes por convite.");
    } else {
      showToast(
        simulatedCount
          ? `A simulação avançou até o próximo evento e gerou ${simulatedCount} resultado(s).`
          : "A simulação avançou até o próximo evento.",
      );
    }
  } catch (error) {
    console.error(error);
    showToast(error.message ?? "Não foi possível avançar até o próximo evento.");
  } finally {
    state.advancing = false;
  }
}

function resetInMemoryState() {
  state.world = null;
  state.events = [];
  state.competitions = [];
  state.continents = [];
  state.countries = [];
  state.sports = [];
  state.modalities = [];
  state.people = [];
  state.rankingEntries = [];
  state.ranking = [];
  state.results = [];
  state.competitionEntries = [];
  state.activeInvitation = null;
  state.viewDate = new Date(2026, 0, 1, 12);
  state.selectedDate = "2026-01-01";
  state.activeView = "calendar";
  state.activeHub = "central";
  state.advancing = false;
}

async function loadCurrentGame() {
  state.world = await getWorld();
  await Promise.all([
    reloadCompetitionsAndEvents(),
    reloadResults(),
    reloadCompetitionEntries(),
  ]);
  if (!state.world) return false;

  await removeLegacyExamplesOnce();
  await ensureSports();
  await ensureGeography();
  await ensureInitialRanking();
  await ensureRosterForImportedPresets();
  await resetSeasonRankingsIfNeeded(state.world.currentDate);
  state.selectedDate = state.world.currentDate;
  state.viewDate = parseISODate(state.world.currentDate);
  switchView(state.activeView);
  render();
  setTimeout(openDueInvitationIfAny, 0);
  return true;
}

function setStartButtonsDisabled(disabled) {
  elements.continueGameButton.disabled = disabled;
  elements.newGameButton.disabled = disabled;
}

async function handleContinueGame() {
  elements.startError.textContent = "";
  setStartButtonsDisabled(true);
  try {
    const hasSave = await loadCurrentGame();
    elements.startDialog.close();
    if (!hasSave) {
      elements.setupForm.reset();
      elements.setupStartDate.value = "2026-01-01";
      elements.setupDialog.showModal();
      showToast("Nenhum save encontrado. Crie um novo mundo.");
    }
  } catch (error) {
    console.error(error);
    elements.startError.textContent =
      error.message ?? "Não foi possível carregar o save.";
  } finally {
    setStartButtonsDisabled(false);
  }
}

async function handleNewGame() {
  elements.startError.textContent = "";
  if (
    !window.confirm(
      "Iniciar um novo jogo apagará o save atual deste navegador. Deseja continuar?",
    )
  ) {
    return;
  }

  setStartButtonsDisabled(true);
  try {
    await resetDatabase();
    resetInMemoryState();
    elements.setupForm.reset();
    elements.setupStartDate.value = "2026-01-01";
    elements.startDialog.close();
    elements.setupDialog.showModal();
  } catch (error) {
    console.error(error);
    elements.startError.textContent =
      error.message ?? "Não foi possível iniciar um novo jogo.";
  } finally {
    setStartButtonsDisabled(false);
  }
}

async function handleSetup(submitEvent) {
  submitEvent.preventDefault();

  state.world = {
    id: "current",
    name: elements.setupWorldName.value.trim(),
    currentDate: elements.setupStartDate.value,
    createdAt: new Date().toISOString(),
    continentIds: CONTINENTS.map(({ id }) => id),
    step3LegacyExamplesChecked: true,
  };
  await saveWorld(state.world);

  await reloadCompetitionsAndEvents();
  await ensureSports();
  await ensureGeography();
  await ensureInitialRanking();
  await Promise.all([reloadResults(), reloadCompetitionEntries()]);
  state.selectedDate = state.world.currentDate;
  state.viewDate = parseISODate(state.world.currentDate);
  elements.setupDialog.close();
  render();
  showToast("Mundo criado com calendário vazio e ranking de 100 pessoas.");
}

function attachEventListeners() {
  elements.viewTabs.forEach((tab) => {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
  });
  elements.hubTabs.forEach((tab) => {
    tab.addEventListener("click", () => switchHub(tab.dataset.hub));
  });
  elements.openRankingsButton.addEventListener("click", () => switchHub("ranking"));
  elements.championsFilter.addEventListener("input", renderChampions);
  elements.seasonsSport.addEventListener("change", () => {
    updateSeasonsModalitySelect();
    renderSeasons();
  });
  elements.seasonsModality.addEventListener("change", renderSeasons);
  elements.previousMonth.addEventListener("click", () => changeMonth(-1));
  elements.nextMonth.addEventListener("click", () => changeMonth(1));
  elements.monthTitle.addEventListener("click", goToGameDate);
  elements.todayButton.addEventListener("click", goToGameDate);
  elements.presetsButton.addEventListener("click", openPresetDialog);
  elements.newEventButton.addEventListener("click", () => openEventDialog());
  elements.addOnSelectedDate.addEventListener("click", () => openEventDialog(null, state.selectedDate));
  elements.closeEventDialog.addEventListener("click", closeEventDialog);
  elements.cancelEventButton.addEventListener("click", closeEventDialog);
  elements.eventForm.addEventListener("submit", handleEventSubmit);
  elements.deleteEventButton.addEventListener("click", handleDeleteEvent);
  elements.newCompetitionButton.addEventListener("click", () => openCompetitionDialog());
  elements.competitionForm.addEventListener("submit", handleCompetitionSubmit);
  elements.closeCompetitionDialog.addEventListener("click", closeCompetitionDialog);
  elements.cancelCompetitionButton.addEventListener("click", closeCompetitionDialog);
  elements.deleteCompetitionButton.addEventListener("click", handleDeleteCompetition);
  elements.presetSelect.addEventListener("change", updatePresetSummary);
  elements.closePresetDialog.addEventListener("click", closePresetDialog);
  elements.cancelPresetButton.addEventListener("click", closePresetDialog);
  elements.applyPresetButton.addEventListener("click", handleApplyPreset);
  elements.competitionFilter.addEventListener("input", renderCompetitions);
  elements.rankingFilter.addEventListener("input", renderRanking);
  elements.competitionQualification.addEventListener(
    "change",
    () => updateQualificationFields(),
  );
  elements.competitionType.addEventListener(
    "change",
    () => updateQualificationFields(),
  );
  elements.competitionMixedCombination.addEventListener(
    "change",
    () => renderMixedSlotFields({}),
  );
  elements.competitionSlots.addEventListener("input", () => {
    if (elements.competitionQualification.value === "mixed") {
      renderMixedSlotFields({});
    }
  });
  elements.competitionSport.addEventListener("change", () => {
    updateModalitySelect();
    updateScoringSystem({ useSportDefault: true });
    updateQualifierTargetOptions();
  });
  elements.competitionDiscipline.addEventListener(
    "change",
    () => updateQualifierTargetOptions(),
  );
  elements.competitionScoringSystem.addEventListener(
    "change",
    () => updateScoringSystem(),
  );
  elements.competitionRankingPoints.addEventListener(
    "input",
    () => updateScoringSystem(),
  );
  elements.competitionModel.addEventListener(
    "change",
    updateCompetitionModelFields,
  );
  elements.competitionGeographicScope.addEventListener(
    "change",
    () => updateCompetitionGeographyFields(),
  );
  elements.competitionContinent.addEventListener("change", () => {
    updateCountrySelect(elements.competitionContinent, elements.competitionCountry);
  });
  elements.rankingScope.addEventListener("change", () => updateRankingGeographyFields());
  elements.rankingSport.addEventListener("change", () => {
    updateRankingModalitySelect();
    renderRanking();
  });
  elements.rankingModality.addEventListener("change", renderRanking);
  elements.rankingContinent.addEventListener("change", () => {
    updateCountrySelect(elements.rankingContinent, elements.rankingCountry);
    renderRanking();
  });
  elements.rankingCountry.addEventListener("change", renderRanking);
  elements.setupForm.addEventListener("submit", handleSetup);
  elements.continueGameButton.addEventListener("click", handleContinueGame);
  elements.newGameButton.addEventListener("click", handleNewGame);
  elements.invitationForm.addEventListener("submit", handleInvitationSubmit);
  elements.invitationFilter.addEventListener("input", renderInvitationAthletes);
  elements.closeInvitationDialog.addEventListener("click", closeInvitationSelection);
  elements.cancelInvitationButton.addEventListener("click", closeInvitationSelection);
  elements.advanceNextEvent.addEventListener("click", advanceToNextEvent);
  document.querySelectorAll("[data-advance-days]").forEach((button) => {
    button.addEventListener("click", () => advanceTime(Number(button.dataset.advanceDays)));
  });

  elements.eventStartDate.addEventListener("change", () => {
    if (elements.eventEndDate.value < elements.eventStartDate.value) {
      elements.eventEndDate.value = elements.eventStartDate.value;
    }
  });

  elements.competitionStartDate.addEventListener("change", () => {
    if (elements.competitionEndDate.value < elements.competitionStartDate.value) {
      elements.competitionEndDate.value = elements.competitionStartDate.value;
    }
    updateQualifierTargetOptions();
  });
  elements.competitionEndDate.addEventListener("change", () => updateQualifierTargetOptions());

  elements.eventDialog.addEventListener("click", (event) => {
    if (event.target === elements.eventDialog) closeEventDialog();
  });

  elements.competitionDialog.addEventListener("click", (event) => {
    if (event.target === elements.competitionDialog) closeCompetitionDialog();
  });

  elements.presetDialog.addEventListener("click", (event) => {
    if (event.target === elements.presetDialog) closePresetDialog();
  });

  elements.invitationDialog.addEventListener("click", (event) => {
    if (event.target === elements.invitationDialog) closeInvitationSelection();
  });

  elements.startDialog.addEventListener("cancel", (event) => event.preventDefault());
}

function initialize() {
  attachEventListeners();
  setupScoringSystemOptions();
  setupMixedQualificationOptions();
  setupPresetOptions();
  switchHub(state.activeHub);
  elements.startDialog.showModal();
}

initialize();
