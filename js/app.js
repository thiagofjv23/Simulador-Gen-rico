import {
  deleteCompetitionWithEvent,
  deleteEvent,
  getAllEvents,
  getAllClubs,
  getAllUserPresets,
  saveUserPreset,
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
  saveClubs,
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
import { simulateLeagueRound } from "./league.js";
import { mergeRollingRanking } from "./athletics.js";
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
  entityTypeForSport,
  sportAllowsClubs,
  teamRatingConfigForModality,
} from "./sports.js";
import {
  TEAM_RATING_MODELS,
  teamRatingModelInfo,
  normalizeTeamWeight,
  buildClubStandings,
  clubsForModality,
  multiModalityTeams,
  multiSportTeams,
} from "./clubs.js";
import {
  CALENDAR_PRESETS,
  buildPresetClubs,
  buildPresetCompetitions,
  buildPresetPeople,
  resolvePresetRoster,
} from "./presets.js";
import {
  SCORING_SYSTEMS,
  pointsPreview,
  scoringSystemById,
  scoringSystemDescription,
  scoringSystemLabel,
} from "./scoring.js";
import {
  EVENT_FORMATS,
  eventFormatById,
  eventFormatLabel,
} from "./eventformat.js";
import {
  MARK_TYPES,
  RESULT_METRICS,
  markTypeById,
  resultMetricById,
  resultMetricLabel,
} from "./metric.js";
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
import {
  buildSeasonUnits,
  defaultRoundIndex,
  leagueClassification,
  pastChampions,
  qualifiedInfo,
  rankingStages,
  roundStates,
  topSeasonUnits,
} from "./season.js";
import {
  EDITOR_TYPES,
  editorType,
  parseEditorModule,
  serializeModule,
  templateFor,
  validateCountry,
  validatePresetPackage,
  validateRoster,
  normalizeCountry,
  normalizeRoster,
} from "./editors.js";
import { addUserRecords, loadUserData } from "./userdata.js";

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
    teams: document.querySelector("#hub-teams"),
    season: document.querySelector("#hub-season"),
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
  rankingTeamsPanel: document.querySelector("#ranking-teams-panel"),
  rankingTeamsTitle: document.querySelector("#ranking-teams-title"),
  rankingTeamsList: document.querySelector("#ranking-teams-list"),
  teamsSport: document.querySelector("#teams-sport"),
  teamsModalityField: document.querySelector("#teams-modality-field"),
  teamsModality: document.querySelector("#teams-modality"),
  teamsList: document.querySelector("#teams-list"),
  teamsEmpty: document.querySelector("#teams-empty"),
  seasonTop: document.querySelector("#season-top"),
  seasonSport: document.querySelector("#season-sport"),
  seasonUnit: document.querySelector("#season-unit"),
  seasonDetail: document.querySelector("#season-detail"),
  seasonEmpty: document.querySelector("#season-empty"),
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
  competitionEventFormat: document.querySelector("#competition-event-format"),
  competitionResultMetric: document.querySelector("#competition-result-metric"),
  eventFormatHelp: document.querySelector("#event-format-help"),
  resultMetricHelp: document.querySelector("#result-metric-help"),
  competitionMarkTypeField: document.querySelector("#competition-mark-type-field"),
  competitionMarkType: document.querySelector("#competition-mark-type"),
  competitionHeatSizeField: document.querySelector("#competition-heat-size-field"),
  competitionHeatSize: document.querySelector("#competition-heat-size"),
  teamRatingPanel: document.querySelector("#team-rating-panel"),
  competitionTeamRatingModel: document.querySelector("#competition-team-rating-model"),
  competitionTeamWeightField: document.querySelector("#competition-team-weight-field"),
  competitionTeamWeight: document.querySelector("#competition-team-weight"),
  teamRatingHelp: document.querySelector("#team-rating-help"),
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
  toolsButton: document.querySelector("#tools-button"),
  editorsDialog: document.querySelector("#editors-dialog"),
  editorsTitle: document.querySelector("#editors-title"),
  closeEditorsDialog: document.querySelector("#close-editors-dialog"),
  editorsChooser: document.querySelector("#editors-chooser"),
  editorShell: document.querySelector("#editor-shell"),
  editorBack: document.querySelector("#editor-back"),
  editorDescription: document.querySelector("#editor-description"),
  editorCopyTemplate: document.querySelector("#editor-copy-template"),
  editorFile: document.querySelector("#editor-file"),
  editorSource: document.querySelector("#editor-source"),
  editorValidate: document.querySelector("#editor-validate"),
  editorPreview: document.querySelector("#editor-preview"),
  editorError: document.querySelector("#editor-error"),
  editorHint: document.querySelector("#editor-hint"),
  editorSaveSave: document.querySelector("#editor-save-save"),
  editorSaveDb: document.querySelector("#editor-save-db"),
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
  clubs: [],
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
  season: { unitKey: null, roundIndex: null },
  userPresets: [],
  activeEditor: null,
  editorData: null,
};

// Presets nativos + presets criados pelo jogador nos editores in-game.
function allPresets() {
  return [...CALENDAR_PRESETS, ...state.userPresets];
}

function findPreset(id) {
  return allPresets().find((preset) => preset.id === id) ?? null;
}

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

function fillSelectOptions(select, items) {
  select.replaceChildren();
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    select.append(option);
  });
}

function setupEventFormatOptions() {
  fillSelectOptions(elements.competitionEventFormat, EVENT_FORMATS);
  fillSelectOptions(elements.competitionResultMetric, RESULT_METRICS);
  fillSelectOptions(elements.competitionMarkType, MARK_TYPES);
}

function setupTeamRatingOptions() {
  fillSelectOptions(
    elements.competitionTeamRatingModel,
    Object.values(TEAM_RATING_MODELS).map(({ id, label }) => ({ id, name: label })),
  );
}

// O painel de rating de equipe só aparece para esportes mistos (atletas +
// equipes). O campo de peso só faz sentido no modelo "weighted"; no modelo
// "independent" ele fica oculto. A janelinha de contexto explica cada escolha.
function updateTeamRatingFields() {
  const sportId = elements.competitionSport.value;
  const isMixed = sportId ? entityTypeForSport(sportId, state.sports) === "mista" : false;
  elements.teamRatingPanel.classList.toggle("hidden", !isMixed);

  const model = elements.competitionTeamRatingModel.value || "independent";
  const usesWeight = model === "weighted";
  elements.competitionTeamWeightField.classList.toggle("hidden", !usesWeight);
  elements.competitionTeamWeight.disabled = !usesWeight || !isMixed;

  const info = teamRatingModelInfo(model);
  elements.teamRatingHelp.textContent = isMixed
    ? usesWeight
      ? `${info.description} Peso 0 equivale a não influenciar; quanto maior, mais o equipamento pesa.`
      : info.description
    : "";
}

// Aplica os padrões de rating de equipe da modalidade selecionada (cada
// modalidade mista traz seu próprio modelo e peso). `preferred` permite
// restaurar os valores salvos de uma competição ao editá-la.
function applyModalityTeamRatingDefaults(preferred = null) {
  const config = teamRatingConfigForModality(
    elements.competitionDiscipline.value,
    state.modalities,
  );
  const model = preferred?.teamRatingModel ?? config.teamRatingModel;
  elements.competitionTeamRatingModel.value = TEAM_RATING_MODELS[model]
    ? model
    : "independent";
  const weight = preferred?.teamWeight ?? config.teamWeight;
  elements.competitionTeamWeight.value = normalizeTeamWeight(weight);
  updateTeamRatingFields();
}

// Mostra a explicação (janelinha de contexto) de cada opção e revela os campos
// dependentes: tipo de marca (marca direta) e tamanho da bateria (baterias).
function updateEventFormatFields() {
  const format = elements.competitionEventFormat.value || "individual-ranking";
  const metric = elements.competitionResultMetric.value || "position-table";
  elements.eventFormatHelp.textContent = eventFormatById(format)?.description ?? "";
  elements.resultMetricHelp.textContent = resultMetricById(metric)?.description ?? "";

  const usesMark = metric === "direct-mark";
  const usesHeats = format === "heats";
  elements.competitionMarkTypeField.classList.toggle("hidden", !usesMark);
  elements.competitionHeatSizeField.classList.toggle("hidden", !usesHeats);
  elements.competitionMarkType.disabled = !usesMark;
  elements.competitionHeatSize.disabled = !usesHeats;
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
  const preset = findPreset(elements.presetSelect.value);
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
  const previous = elements.presetSelect.value;
  elements.presetSelect.replaceChildren();
  allPresets().forEach((preset) => {
    const option = document.createElement("option");
    option.value = preset.id;
    option.textContent = state.userPresets.includes(preset)
      ? `${preset.name} (meu)`
      : preset.name;
    elements.presetSelect.append(option);
  });
  if ([...elements.presetSelect.options].some(({ value }) => value === previous)) {
    elements.presetSelect.value = previous;
  }
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
    createBadge(eventFormatLabel(competition.eventFormat ?? "individual-ranking")),
    createBadge(resultMetricLabel(competition.resultMetric ?? "position-table")),
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

  renderRankingTeams(selectedSport, selectedModality, disciplineRanking);
}

// Classificação de equipes ao lado do ranking de atletas, só para modalidades
// mistas com clubes criados. A pontuação de cada equipe é a soma dos pontos dos
// seus atletas na modalidade (calculada ao vivo). Tocar numa equipe revela os
// atletas membros e seus pontos.
function renderRankingTeams(selectedSport, selectedModality, disciplineRanking) {
  const clubs = selectedSport && selectedModality
    ? state.clubs.filter((club) =>
      club.sportId === selectedSport.id && club.modalityId === selectedModality.id)
    : [];
  const isMixed = selectedSport
    ? entityTypeForSport(selectedSport.id, state.sports) === "mista"
    : false;

  elements.rankingTeamsList.replaceChildren();
  elements.rankingTeamsPanel.classList.toggle("hidden", !(isMixed && clubs.length));
  if (!(isMixed && clubs.length)) return;

  elements.rankingTeamsTitle.textContent =
    `Classificação de equipes · ${selectedSport.name} · ${selectedModality.name}`;

  const pointsByPersonId = new Map(
    disciplineRanking.map((entry) => [entry.personId, entry]),
  );
  const standings = buildClubStandings(clubs, disciplineRanking);

  standings.forEach((row) => {
    const tr = document.createElement("tr");
    tr.className = "team-row";
    if (row.position <= 3) tr.classList.add(`top-${row.position}`);

    const position = document.createElement("td");
    position.className = "ranking-position";
    position.textContent = row.position;

    const team = document.createElement("td");
    team.className = "ranking-person";
    const teamName = document.createElement("strong");
    teamName.textContent = row.club.name;
    const teamId = document.createElement("span");
    teamId.textContent = row.club.id;
    team.append(teamName, teamId);

    const athletes = document.createElement("td");
    athletes.textContent = row.memberCount;

    const carRating = document.createElement("td");
    carRating.className = "result-performance";
    carRating.textContent = row.club.baseRating;

    const points = document.createElement("td");
    points.className = "ranking-points";
    points.textContent = row.points.toLocaleString("pt-BR");

    tr.append(position, team, athletes, carRating, points);

    // Toque na linha expande os atletas membros (nesta modalidade) e os pontos.
    const key = `team:${row.club.id}`;
    team.classList.add("athlete-trigger");
    team.tabIndex = 0;
    const activate = () => toggleAthleteDetail(
      key,
      null,
      team,
      (node) => {
        const detailRow = document.createElement("tr");
        detailRow.className = "athlete-detail-row";
        const cell = document.createElement("td");
        cell.colSpan = 5;
        cell.append(node);
        detailRow.append(cell);
        tr.after(detailRow);
        return detailRow;
      },
      () => buildClubMembersNode(row.club, pointsByPersonId),
    );
    team.addEventListener("click", activate);
    team.addEventListener("keydown", (keyEvent) => {
      if (keyEvent.key === "Enter" || keyEvent.key === " ") {
        keyEvent.preventDefault();
        activate();
      }
    });

    elements.rankingTeamsList.append(tr);
  });
}

// Lista de atletas de uma equipe naquela modalidade, ordenados por pontos.
function buildClubMembersNode(club, entryByPersonId) {
  const wrapper = document.createElement("div");
  wrapper.className = "athlete-detail";
  const heading = document.createElement("p");
  heading.className = "athlete-detail-heading";
  heading.textContent = "Atletas da equipe nesta modalidade";
  wrapper.append(heading);

  const members = [...new Set(club.memberPersonIds ?? [])]
    .map((personId) => entryByPersonId.get(personId))
    .filter(Boolean)
    .sort((a, b) => (b.points ?? 0) - (a.points ?? 0));

  if (!members.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Nenhum atleta encontrado no ranking desta modalidade.";
    wrapper.append(empty);
    return wrapper;
  }

  const list = document.createElement("ol");
  list.className = "athlete-history";
  members.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "athlete-history-item";
    const info = document.createElement("div");
    info.className = "athlete-history-info";
    const name = document.createElement("strong");
    name.textContent = entry.person?.name ?? entry.personId;
    const meta = document.createElement("span");
    meta.textContent = [
      entry.person?.countryCode,
      `${(entry.points ?? 0).toLocaleString("pt-BR")} pts`,
    ].filter(Boolean).join(" · ");
    info.append(name, meta);
    item.append(info);
    list.append(item);
  });
  wrapper.append(list);
  return wrapper;
}

// ---------------------------------------------------------------------------
// Seção "Equipes": lista de equipes por esporte/modalidade e visões
// multi-modalidade / multi-esporte, com click-through dos atletas.
// ---------------------------------------------------------------------------

const MULTI_SPORT_VALUE = "__multi_sport__";
const MULTI_MODALITY_VALUE = "__multi_modality__";

function fillTeamsSelect(select, options, previousValue) {
  select.replaceChildren();
  options.forEach(({ id, name }) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = name;
    select.append(option);
  });
  select.value = options.some((option) => option.id === previousValue)
    ? previousValue
    : options[0]?.id ?? "";
}

function sportsWithClubs() {
  return [...state.sports]
    .filter((sport) =>
      sportAllowsClubs(sport.id, state.sports)
      && state.clubs.some((club) => club.sportId === sport.id))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

function setupTeamsOptions() {
  const options = sportsWithClubs().map((sport) => ({ id: sport.id, name: sport.name }));
  // Opção multi-esporte só quando existem equipes em mais de um esporte.
  if (multiSportTeams(state.clubs).length) {
    options.push({ id: MULTI_SPORT_VALUE, name: "Multi-esporte (equipes em vários esportes)" });
  }
  fillTeamsSelect(elements.teamsSport, options, elements.teamsSport.value);
  updateTeamsModalitySelect();
}

function updateTeamsModalitySelect() {
  const sportValue = elements.teamsSport.value;
  const isMultiSport = sportValue === MULTI_SPORT_VALUE;
  elements.teamsModalityField.classList.toggle("hidden", isMultiSport || !sportValue);
  if (isMultiSport || !sportValue) {
    elements.teamsModality.replaceChildren();
    return;
  }

  const modalityIds = [...new Set(
    state.clubs.filter((club) => club.sportId === sportValue).map((club) => club.modalityId),
  )];
  const options = modalityIds
    .map((id) => modalityById(id, state.modalities))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
    .map((modality) => ({ id: modality.id, name: modality.name }));
  // Opção multi-modalidade só quando existem equipes em mais de uma modalidade.
  if (multiModalityTeams(state.clubs, sportValue).length) {
    options.unshift({
      id: MULTI_MODALITY_VALUE,
      name: "Multi-modalidade (equipes em várias modalidades)",
    });
  }
  fillTeamsSelect(elements.teamsModality, options, elements.teamsModality.value);
}

function attachTeamDetail(triggerEl, rowEl, key, colSpan, buildContent) {
  triggerEl.classList.add("athlete-trigger");
  triggerEl.tabIndex = 0;
  const activate = () => toggleAthleteDetail(
    key,
    null,
    triggerEl,
    (node) => {
      const detailRow = document.createElement("tr");
      detailRow.className = "athlete-detail-row";
      const cell = document.createElement("td");
      cell.colSpan = colSpan;
      cell.append(node);
      detailRow.append(cell);
      rowEl.after(detailRow);
      return detailRow;
    },
    buildContent,
  );
  triggerEl.addEventListener("click", activate);
  triggerEl.addEventListener("keydown", (keyEvent) => {
    if (keyEvent.key === "Enter" || keyEvent.key === " ") {
      keyEvent.preventDefault();
      activate();
    }
  });
}

function teamNameCell(club) {
  const cell = document.createElement("td");
  cell.className = "ranking-person";
  const name = document.createElement("strong");
  name.textContent = club.name;
  const identifier = document.createElement("span");
  identifier.textContent = club.id;
  cell.append(name, identifier);
  return cell;
}

// Atletas de um clube (numa modalidade), a partir do elenco em memória.
function buildClubMembersFromPeople(club, peopleById) {
  const wrapper = document.createElement("div");
  wrapper.className = "athlete-detail";
  const heading = document.createElement("p");
  heading.className = "athlete-detail-heading";
  heading.textContent = "Atletas da equipe nesta modalidade";
  wrapper.append(heading);

  const members = [...new Set(club.memberPersonIds ?? [])]
    .map((personId) => peopleById.get(personId))
    .filter(Boolean)
    .sort((a, b) => b.baseRating - a.baseRating || a.name.localeCompare(b.name, "pt-BR"));

  if (!members.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Esta equipe é disputada no nível do clube (sem atletas individuais cadastrados).";
    wrapper.append(empty);
    return wrapper;
  }

  const list = document.createElement("ol");
  list.className = "athlete-history";
  members.forEach((person) => {
    const item = document.createElement("li");
    item.className = "athlete-history-item";
    const info = document.createElement("div");
    info.className = "athlete-history-info";
    const name = document.createElement("strong");
    name.textContent = person.name;
    const meta = document.createElement("span");
    meta.textContent = [person.countryCode, `Rating ${person.baseRating}`]
      .filter(Boolean).join(" · ");
    info.append(name, meta);
    item.append(info);
    list.append(item);
  });
  wrapper.append(list);
  return wrapper;
}

// Atletas de um grupo de equipes (multi-modalidade/esporte), com a(s)
// modalidade(s) a que cada um pertence.
function buildTeamGroupMembersNode(group, peopleById) {
  const wrapper = document.createElement("div");
  wrapper.className = "athlete-detail";
  const heading = document.createElement("p");
  heading.className = "athlete-detail-heading";
  heading.textContent = "Atletas da equipe e suas modalidades";
  wrapper.append(heading);

  const modalitiesByPerson = new Map();
  for (const club of group.clubs) {
    const modalityName = modalityById(club.modalityId, state.modalities)?.name ?? club.modalityId;
    for (const personId of club.memberPersonIds ?? []) {
      if (!modalitiesByPerson.has(personId)) modalitiesByPerson.set(personId, new Set());
      modalitiesByPerson.get(personId).add(modalityName);
    }
  }

  const list = document.createElement("ol");
  list.className = "athlete-history";
  [...modalitiesByPerson.entries()]
    .map(([personId, modalityNames]) => ({
      person: peopleById.get(personId),
      modalities: [...modalityNames].sort((a, b) => a.localeCompare(b, "pt-BR")),
    }))
    .filter((entry) => entry.person)
    .sort((a, b) =>
      b.person.baseRating - a.person.baseRating
      || a.person.name.localeCompare(b.person.name, "pt-BR"))
    .forEach((entry) => {
      const item = document.createElement("li");
      item.className = "athlete-history-item";
      const info = document.createElement("div");
      info.className = "athlete-history-info";
      const name = document.createElement("strong");
      name.textContent = entry.person.name;
      const meta = document.createElement("span");
      meta.textContent = [entry.person.countryCode, entry.modalities.join(", ")]
        .filter(Boolean).join(" · ");
      info.append(name, meta);
      item.append(info);
      list.append(item);
    });
  wrapper.append(list);
  return wrapper;
}

function showTeamsEmpty(message) {
  elements.teamsEmpty.textContent = message;
  elements.teamsEmpty.classList.remove("hidden");
}

function renderSingleModalityTeams(sport, modality) {
  const clubs = clubsForModality(state.clubs, sport.id, modality.id);
  const peopleById = new Map(state.people.map((person) => [person.id, person]));

  const scroll = document.createElement("div");
  scroll.className = "ranking-table-scroll";
  const table = document.createElement("table");
  table.className = "ranking-table teams-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th scope="col">Pos.</th>
        <th scope="col">Equipe</th>
        <th scope="col">Atletas</th>
        <th scope="col">Rating</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const body = table.querySelector("tbody");

  clubs.forEach((club, index) => {
    const row = document.createElement("tr");
    if (index < 3) row.classList.add(`top-${index + 1}`);
    const position = document.createElement("td");
    position.className = "ranking-position";
    position.textContent = index + 1;
    const team = teamNameCell(club);
    const athletes = document.createElement("td");
    athletes.textContent = [...new Set(club.memberPersonIds ?? [])].length;
    const rating = document.createElement("td");
    rating.className = "result-performance";
    rating.textContent = club.baseRating;
    row.append(position, team, athletes, rating);
    attachTeamDetail(team, row, `teammod:${club.id}`, 4,
      () => buildClubMembersFromPeople(club, peopleById));
    body.append(row);
  });

  scroll.append(table);
  elements.teamsList.append(scroll);
}

function renderTeamGroups(groups, { crossSport }) {
  if (!groups.length) {
    showTeamsEmpty(crossSport
      ? "Nenhuma equipe participa de mais de um esporte."
      : "Nenhuma equipe participa de mais de uma modalidade neste esporte.");
    return;
  }
  const peopleById = new Map(state.people.map((person) => [person.id, person]));
  const scopeHeader = crossSport ? "Esportes" : "Modalidades";

  const scroll = document.createElement("div");
  scroll.className = "ranking-table-scroll";
  const table = document.createElement("table");
  table.className = "ranking-table teams-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th scope="col">Pos.</th>
        <th scope="col">Equipe</th>
        <th scope="col">${scopeHeader}</th>
        <th scope="col">Atletas</th>
        <th scope="col">Rating méd.</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const body = table.querySelector("tbody");

  groups.forEach((group, index) => {
    const row = document.createElement("tr");
    if (index < 3) row.classList.add(`top-${index + 1}`);
    const position = document.createElement("td");
    position.className = "ranking-position";
    position.textContent = index + 1;

    const team = document.createElement("td");
    team.className = "ranking-person";
    const name = document.createElement("strong");
    name.textContent = group.name;
    const scopeNames = crossSport
      ? group.sportIds.map((id) => sportById(id, state.sports)?.name ?? id)
      : group.modalityIds.map((id) => modalityById(id, state.modalities)?.name ?? id);
    const identifier = document.createElement("span");
    identifier.textContent = scopeNames.join(" · ");
    team.append(name, identifier);

    const scopeCount = document.createElement("td");
    scopeCount.textContent = crossSport ? group.sportIds.length : group.modalityIds.length;
    const athletes = document.createElement("td");
    athletes.textContent = group.memberPersonIds.length;
    const rating = document.createElement("td");
    rating.className = "result-performance";
    rating.textContent = group.averageRating;

    row.append(position, team, scopeCount, athletes, rating);
    attachTeamDetail(team, row, `teamgroup:${crossSport ? "sport" : "mod"}:${group.name}`, 5,
      () => buildTeamGroupMembersNode(group, peopleById));
    body.append(row);
  });

  scroll.append(table);
  elements.teamsList.append(scroll);
}

function renderTeams() {
  closeAthleteDetail();
  elements.teamsList.replaceChildren();
  elements.teamsEmpty.classList.add("hidden");

  if (!state.clubs.length) {
    showTeamsEmpty(
      "Nenhuma equipe ainda. Importe um preset de um esporte com equipes"
      + " (ex.: Ecossistema FIA) para criar as equipes.",
    );
    return;
  }

  const sportValue = elements.teamsSport.value;
  if (sportValue === MULTI_SPORT_VALUE) {
    renderTeamGroups(multiSportTeams(state.clubs), { crossSport: true });
    return;
  }
  const sport = sportById(sportValue, state.sports);
  if (!sport) {
    showTeamsEmpty("Escolha um esporte com equipes.");
    return;
  }
  const modalityValue = elements.teamsModality.value;
  if (modalityValue === MULTI_MODALITY_VALUE) {
    renderTeamGroups(multiModalityTeams(state.clubs, sportValue), { crossSport: false });
    return;
  }
  const modality = modalityById(modalityValue, state.modalities);
  if (!modality) {
    showTeamsEmpty("Escolha uma modalidade.");
    return;
  }
  renderSingleModalityTeams(sport, modality);
}

function renderTeamsSection() {
  setupTeamsOptions();
  renderTeams();
}

// ---------------------------------------------------------------------------
// Aba "Temporada": classificação atual, navegação por rodadas, campeões
// anteriores (campeonatos de etapa de temporada) e etapas das séries por ranking.
// ---------------------------------------------------------------------------

function seasonYearNow() {
  return Number(state.world.currentDate.slice(0, 4));
}

function competitorName(id) {
  return state.people.find((person) => person.id === id)?.name
    ?? state.clubs.find((club) => club.id === id)?.name
    ?? id;
}

function seasonBlock(headingText) {
  const section = document.createElement("section");
  section.className = "season-block";
  const heading = document.createElement("p");
  heading.className = "eyebrow";
  heading.textContent = headingText;
  section.append(heading);
  return section;
}

function seasonUnitLeaderLabel(unit, year) {
  if (unit.kind === "league") {
    const leader = leagueClassification(unit, state.results, year).rows[0];
    return leader ? `Líder: ${leader.name}` : "A começar";
  }
  return `${unit.stages.length} etapa${unit.stages.length === 1 ? "" : "s"}`;
}

function renderSeasonTop(topUnits, selectedUnit, year) {
  elements.seasonTop.replaceChildren();
  topUnits.forEach((unit) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "season-square";
    if (unit.key === selectedUnit.key) card.classList.add("active");
    const eyebrow = document.createElement("span");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = unit.sportName;
    const title = document.createElement("strong");
    title.textContent = unit.title;
    const meta = document.createElement("span");
    meta.className = "season-square-meta";
    meta.textContent = `Prestígio ${unit.prestige} · ${seasonUnitLeaderLabel(unit, year)}`;
    card.append(eyebrow, title, meta);
    card.addEventListener("click", () => {
      state.season.unitKey = unit.key;
      state.season.roundIndex = null;
      renderSeasonSection();
    });
    elements.seasonTop.append(card);
  });
}

function setupSeasonSelectors(units, unit) {
  const sports = [...new Map(units.map((u) => [u.sportId, u.sportName])).entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  fillTeamsSelect(elements.seasonSport, sports, unit.sportId);
  const unitsForSport = units
    .filter((u) => u.sportId === elements.seasonSport.value)
    .map((u) => ({ id: u.key, name: u.title }));
  fillTeamsSelect(elements.seasonUnit, unitsForSport, unit.key);
}

function renderClassificationTable(classification) {
  const scroll = document.createElement("div");
  scroll.className = "ranking-table-scroll";
  const table = document.createElement("table");
  table.className = "ranking-table result-table";
  const isTable = classification.kind === "table";
  table.innerHTML = isTable
    ? `<thead><tr><th>Pos.</th><th>Clube</th><th>País</th><th title="Jogos">J</th>
        <th title="Vitórias">V</th><th title="Empates">E</th><th title="Derrotas">D</th>
        <th title="Gols pró">GP</th><th title="Gols contra">GC</th>
        <th title="Saldo">SG</th><th>Pts</th></tr></thead><tbody></tbody>`
    : `<thead><tr><th>Pos.</th><th>Competidor</th><th>País</th><th>Etapas</th><th>Pontos</th></tr></thead><tbody></tbody>`;
  const body = table.querySelector("tbody");
  classification.rows.forEach((row, index) => {
    const position = row.position ?? index + 1;
    const tr = document.createElement("tr");
    if (position <= 3) tr.classList.add(`top-${position}`);
    const cells = isTable
      ? [
        ["ranking-position", position],
        ["ranking-person", row.name, true],
        ["", row.countryCode ?? ""],
        ["", row.played],
        ["", row.wins],
        ["", row.draws],
        ["", row.losses],
        ["", row.goalsFor],
        ["", row.goalsAgainst],
        ["", row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference],
        ["ranking-points", row.points],
      ]
      : [
        ["ranking-position", position],
        ["ranking-person", row.name, true],
        ["", row.countryCode ?? ""],
        ["", row.events ?? 0],
        ["ranking-points", (row.points ?? 0).toLocaleString("pt-BR")],
      ];
    cells.forEach(([className, value, strong]) => {
      const cell = document.createElement("td");
      if (className) cell.className = className;
      if (strong) {
        const node = document.createElement("strong");
        node.textContent = value;
        cell.append(node);
      } else {
        cell.textContent = value;
      }
      tr.append(cell);
    });
    body.append(tr);
  });
  scroll.append(table);
  return scroll;
}

function renderQualifiedBox(competition) {
  const info = qualifiedInfo(competition, state.competitions, state.results);
  if (!info) return null;
  const box = document.createElement("div");
  box.className = "season-qualified";
  const label = document.createElement("strong");
  label.textContent = `Classificados (${info.qualifiedIds.length})`;
  const names = document.createElement("span");
  names.textContent = info.qualifiedIds.length
    ? info.qualifiedIds.map(competitorName).join(", ")
    : "Nenhum classificado ainda.";
  const remaining = document.createElement("span");
  remaining.className = "season-qualified-remaining";
  remaining.textContent = `${info.remaining} vaga${info.remaining === 1 ? "" : "s"} restante${info.remaining === 1 ? "" : "s"}`;
  box.append(label, names, remaining);
  return box;
}

function renderRoundBody(roundState) {
  const round = roundState.round;
  const wrapper = document.createElement("div");

  if (Array.isArray(round.roundFixtures)) {
    const clubsById = new Map(state.clubs.map((club) => [club.id, club]));
    const matchesByPair = new Map(
      (roundState.result?.matches ?? []).map((match) => [`${match.homeId}|${match.awayId}`, match]),
    );
    const list = document.createElement("div");
    list.className = "league-matches";
    round.roundFixtures.forEach(([homeId, awayId]) => {
      const line = document.createElement("div");
      line.className = "league-match";
      const home = document.createElement("span");
      home.className = "league-match-home";
      home.textContent = clubsById.get(homeId)?.name ?? homeId;
      const score = document.createElement("strong");
      score.className = "league-match-score";
      const match = matchesByPair.get(`${homeId}|${awayId}`);
      score.textContent = roundState.decided && match
        ? `${match.homeGoals} × ${match.awayGoals}`
        : "×";
      const away = document.createElement("span");
      away.className = "league-match-away";
      away.textContent = clubsById.get(awayId)?.name ?? awayId;
      line.append(home, score, away);
      list.append(line);
    });
    wrapper.append(list);
    if (!roundState.decided) {
      const note = document.createElement("p");
      note.className = "field-help";
      note.textContent = "Confrontos a disputar.";
      wrapper.append(note);
    }
    return wrapper;
  }

  // Etapas de ranking dentro de um season_stage (ex.: automobilismo).
  if (roundState.decided && roundState.result?.standings?.length) {
    const scroll = document.createElement("div");
    scroll.className = "ranking-table-scroll";
    const table = document.createElement("table");
    table.className = "ranking-table result-table";
    table.innerHTML = `<thead><tr><th>Pos.</th><th>Competidor</th><th>País</th><th>Pontos na etapa</th></tr></thead><tbody></tbody>`;
    const body = table.querySelector("tbody");
    roundState.result.standings.slice(0, 10).forEach((standing) => {
      const tr = document.createElement("tr");
      if (standing.position <= 3) tr.classList.add(`top-${standing.position}`);
      const pos = document.createElement("td");
      pos.className = "ranking-position";
      pos.textContent = standing.position;
      const name = document.createElement("td");
      name.className = "ranking-person";
      const strong = document.createElement("strong");
      strong.textContent = standing.name;
      name.append(strong);
      const country = document.createElement("td");
      country.textContent = standing.countryCode ?? "";
      const points = document.createElement("td");
      points.className = "ranking-points";
      points.textContent = `+${standing.pointsAwarded ?? 0}`;
      tr.append(pos, name, country, points);
      body.append(tr);
    });
    scroll.append(table);
    wrapper.append(scroll);
    return wrapper;
  }

  const note = document.createElement("p");
  note.className = "empty-state";
  const count = round.participantIds?.length ?? 0;
  note.textContent = count
    ? `Etapa a disputar · ${count} participantes.`
    : "Etapa a disputar.";
  wrapper.append(note);
  return wrapper;
}

function renderRoundNav(unit, year) {
  const states = roundStates(unit, state.results);
  const block = seasonBlock("RODADAS");
  if (!states.length) return block;

  let index = state.season.roundIndex;
  if (index == null || index < 0 || index >= states.length) {
    index = defaultRoundIndex(states);
  }
  state.season.roundIndex = index;
  const current = states[index];

  const nav = document.createElement("div");
  nav.className = "season-round-nav";
  const prev = document.createElement("button");
  prev.type = "button";
  prev.className = "season-round-arrow";
  prev.textContent = "‹";
  prev.setAttribute("aria-label", "Rodada anterior");
  prev.disabled = index === 0;
  prev.addEventListener("click", () => {
    state.season.roundIndex = index - 1;
    renderSeasonSection();
  });
  const title = document.createElement("strong");
  title.className = "season-round-title";
  title.textContent = `Rodada ${current.roundNumber}`
    + (current.decided ? "" : " · próxima");
  const next = document.createElement("button");
  next.type = "button";
  next.className = "season-round-arrow";
  next.textContent = "›";
  next.setAttribute("aria-label", "Próxima rodada");
  next.disabled = index === states.length - 1;
  next.addEventListener("click", () => {
    state.season.roundIndex = index + 1;
    renderSeasonSection();
  });
  nav.append(prev, title, next);
  block.append(nav);

  block.append(renderRoundBody(current));
  const qualified = renderQualifiedBox(current.round);
  if (qualified) block.append(qualified);
  return block;
}

function renderPastChampions(unit, year) {
  const champions = pastChampions(unit, state.results, year);
  if (!champions.length) return null;
  const block = seasonBlock("CAMPEÕES ANTERIORES");
  const list = document.createElement("ul");
  list.className = "season-champions";
  champions.forEach((entry) => {
    const item = document.createElement("li");
    const yearEl = document.createElement("strong");
    yearEl.textContent = entry.year;
    const name = document.createElement("span");
    name.textContent = `${entry.championName} (${entry.points} pts)`;
    item.append(yearEl, name);
    list.append(item);
  });
  block.append(list);
  return block;
}

function renderRankingStages(unit, year) {
  const block = seasonBlock(`ETAPAS DA TEMPORADA ${year}`);
  const stages = rankingStages(unit, state.results);
  if (!stages.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Nenhuma etapa nesta temporada.";
    block.append(empty);
    return block;
  }
  const list = document.createElement("div");
  list.className = "season-stages";
  stages.forEach(({ stage, decided, result }) => {
    const item = document.createElement("article");
    item.className = "season-stage";
    if (decided) item.classList.add("decided");
    const head = document.createElement("div");
    head.className = "season-stage-head";
    const name = document.createElement("strong");
    name.textContent = stage.name;
    const date = document.createElement("span");
    date.textContent = formatShortDate(stage.occurrenceEnd);
    head.append(name, date);
    item.append(head);

    const status = document.createElement("p");
    status.className = "season-stage-status";
    if (decided && result?.standings?.length) {
      const winner = result.standings[0];
      status.textContent =
        `Vencedor: ${winner.name} · +${winner.pointsAwarded ?? result.winnerPoints ?? 0} pts ao ranking`;
    } else {
      status.classList.add("pending");
      status.textContent = "Ainda por decidir.";
    }
    item.append(status);

    const qualified = renderQualifiedBox(stage);
    if (qualified) item.append(qualified);
    list.append(item);
  });
  block.append(list);
  return block;
}

function renderSeasonDetail(unit, year) {
  elements.seasonDetail.replaceChildren();
  if (unit.kind === "league") {
    const classification = leagueClassification(unit, state.results, year);
    const block = seasonBlock(
      "CLASSIFICAÇÃO"
      + (classification.throughRound ? ` · APÓS A RODADA ${classification.throughRound}` : ""),
    );
    if (classification.rows.some((row) => (row.played ?? row.events ?? 0) > 0)) {
      block.append(renderClassificationTable(classification));
    } else {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "A temporada ainda não começou.";
      block.append(empty);
    }
    elements.seasonDetail.append(block);
    elements.seasonDetail.append(renderRoundNav(unit, year));
    const champions = renderPastChampions(unit, year);
    if (champions) elements.seasonDetail.append(champions);
  } else {
    elements.seasonDetail.append(renderRankingStages(unit, year));
  }
}

function renderSeasonSection() {
  const year = seasonYearNow();
  const units = buildSeasonUnits(state.competitions, year);
  elements.seasonEmpty.classList.toggle("hidden", units.length > 0);
  if (!units.length) {
    elements.seasonTop.replaceChildren();
    elements.seasonSport.replaceChildren();
    elements.seasonUnit.replaceChildren();
    elements.seasonDetail.replaceChildren();
    elements.seasonEmpty.textContent =
      "Nenhum campeonato de temporada ativo. Importe um preset com etapas de temporada"
      + " (ex.: Fórmula 1 ou futebol) ou uma série por ranking (tênis, atletismo).";
    return;
  }

  let unit = units.find((candidate) => candidate.key === state.season.unitKey);
  if (!unit) {
    unit = topSeasonUnits(units, 1)[0];
    state.season.unitKey = unit.key;
    state.season.roundIndex = null;
  }
  renderSeasonTop(topSeasonUnits(units, 3), unit, year);
  setupSeasonSelectors(units, unit);
  renderSeasonDetail(unit, year);
}

function formatRankingChange(change) {
  if (change > 0) return `▲ ${change}`;
  if (change < 0) return `▼ ${Math.abs(change)}`;
  return "—";
}

// Texto do resultado de cada participante conforme a métrica escolhida.
function standingOutcomeText(result, standing) {
  if (result.resultMetric === "direct-mark" && standing.markLabel) {
    return standing.heatNumber
      ? `${standing.markLabel} · B${standing.heatNumber}`
      : standing.markLabel;
  }
  if (result.resultMetric === "match-score" && standing.recordLabel) {
    return `${standing.recordLabel} · ${standing.eventPoints ?? 0} pts`;
  }
  if (Number.isFinite(standing.eventPoints)) {
    return `${standing.eventPoints} pts`;
  }
  return "—";
}

// Ficha de resultado de uma rodada de liga: os placares da rodada e a
// classificação acumulada até ela (J, V, E, D, GP, GC, SG, Pts).
function renderLeagueResultCard(result) {
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
    `${formatShortDate(result.occurrenceEnd)} · ${result.matches.length} jogos`
    + ` · ${result.scoringSystemName}`;
  titleArea.append(eyebrow, title, meta);
  const badges = document.createElement("div");
  badges.className = "competition-badges";
  badges.append(
    createBadge(geographicScopeLabel(result), "geography"),
    createBadge(`Rodada ${result.seasonRound}/${result.seasonRoundCount}`),
  );
  if (result.seasonChampion) {
    badges.append(createBadge(
      `Campeão ${result.seasonChampion.seasonYear}: ${result.seasonChampion.name}`
      + ` (${result.seasonChampion.points} pts)`,
      "simulated",
    ));
  }
  heading.append(titleArea, badges);
  card.append(heading);

  // Placares da rodada.
  const matchesWrap = document.createElement("div");
  matchesWrap.className = "league-matches";
  result.matches.forEach((match) => {
    const line = document.createElement("div");
    line.className = "league-match";
    const home = document.createElement("span");
    home.className = "league-match-home";
    home.textContent = match.homeName;
    const score = document.createElement("strong");
    score.className = "league-match-score";
    score.textContent = `${match.homeGoals} × ${match.awayGoals}`;
    const away = document.createElement("span");
    away.className = "league-match-away";
    away.textContent = match.awayName;
    line.append(home, score, away);
    matchesWrap.append(line);
  });
  card.append(matchesWrap);

  // Classificação acumulada até a rodada.
  const tableHeading = document.createElement("p");
  tableHeading.className = "eyebrow league-table-heading";
  tableHeading.textContent = `CLASSIFICAÇÃO APÓS A RODADA ${result.seasonRound}`;
  card.append(tableHeading);

  const scroll = document.createElement("div");
  scroll.className = "ranking-table-scroll";
  const table = document.createElement("table");
  table.className = "ranking-table result-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th scope="col">Pos.</th>
        <th scope="col">Clube</th>
        <th scope="col">País</th>
        <th scope="col" title="Jogos">J</th>
        <th scope="col" title="Vitórias">V</th>
        <th scope="col" title="Empates">E</th>
        <th scope="col" title="Derrotas">D</th>
        <th scope="col" title="Gols pró">GP</th>
        <th scope="col" title="Gols contra">GC</th>
        <th scope="col" title="Saldo de gols">SG</th>
        <th scope="col">Pts</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const body = table.querySelector("tbody");
  result.leagueTable.forEach((row) => {
    const tr = document.createElement("tr");
    if (row.position <= 3) tr.classList.add(`top-${row.position}`);
    const cells = [
      ["ranking-position", row.position],
      ["ranking-person", row.name],
      ["", row.countryCode ?? ""],
      ["", row.played],
      ["", row.wins],
      ["", row.draws],
      ["", row.losses],
      ["", row.goalsFor],
      ["", row.goalsAgainst],
      ["", row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference],
      ["ranking-points", row.points],
    ];
    cells.forEach(([className, value], index) => {
      const cell = document.createElement("td");
      if (className) cell.className = className;
      if (index === 1) {
        const strong = document.createElement("strong");
        strong.textContent = value;
        cell.append(strong);
      } else {
        cell.textContent = value;
      }
      tr.append(cell);
    });
    body.append(tr);
  });

  scroll.append(table);
  card.append(scroll);
  return card;
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
    if (result.kind === "league-round") {
      elements.resultsList.append(renderLeagueResultCard(result));
      return;
    }
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
    if (result.eventFormat && result.eventFormat !== "individual-ranking") {
      resultBadges.append(createBadge(eventFormatLabel(result.eventFormat)));
    }
    if (result.resultMetric) {
      resultBadges.append(createBadge(resultMetricLabel(result.resultMetric)));
    }
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

    const showOutcome = Boolean(result.resultMetric);
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
          ${showOutcome ? '<th scope="col">Resultado</th>' : ""}
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
      let outcome = null;
      if (showOutcome) {
        outcome = document.createElement("td");
        outcome.className = "result-outcome";
        outcome.textContent = standingOutcomeText(result, standing);
      }
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

      row.append(position, person, country);
      if (outcome) row.append(outcome);
      row.append(performance, points, newRanking);
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
  renderTeamsSection();
  renderSeasonSection();
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

// Alterna o details expansível; `insert` posiciona o nó e devolve o que remover.
// `buildContent` (opcional) substitui o conteúdo padrão de histórico do atleta —
// usado, por exemplo, para listar os membros de uma equipe.
function toggleAthleteDetail(key, person, trigger, insert, buildContent = null) {
  if (activeAthleteDetail?.key === key) {
    closeAthleteDetail();
    return;
  }
  closeAthleteDetail();
  const content = buildContent ? buildContent() : buildAthleteDetailNode(person);
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
  elements.competitionEventFormat.value = "individual-ranking";
  elements.competitionResultMetric.value = "position-table";
  elements.competitionMarkType.value = "time";
  elements.competitionHeatSize.value = 8;
  elements.competitionTeamRatingModel.value = "independent";
  elements.competitionTeamWeight.value = 0;
  elements.deleteCompetitionButton.classList.add("hidden");
  elements.competitionFormError.textContent = "";
  updateScoringSystem({ preferredValue: "generic-proportional" });
  updateCompetitionModelFields();
  updateEventFormatFields();
  applyModalityTeamRatingDefaults();
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
    elements.competitionEventFormat.value = eventFormatById(competition.eventFormat)
      ? competition.eventFormat
      : "individual-ranking";
    elements.competitionResultMetric.value = resultMetricById(competition.resultMetric)
      ? competition.resultMetric
      : "position-table";
    elements.competitionMarkType.value = markTypeById(competition.markType)
      ? competition.markType
      : "time";
    elements.competitionHeatSize.value = competition.heatSize ?? 8;
    applyModalityTeamRatingDefaults({
      teamRatingModel: competition.teamRatingModel ?? null,
      teamWeight: competition.teamWeight ?? null,
    });
    elements.competitionMixedCombination.value =
      competition.mixedCombination ?? MIXED_QUALIFICATION_COMBINATIONS[0]?.id ?? "";
    elements.competitionQualifierSlots.value = competition.qualifierSlots ?? 1;
    elements.deleteCompetitionButton.classList.remove("hidden");
    updateCompetitionModelFields();
    updateEventFormatFields();
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

// Recalcula em memória os rankings rolantes (atletismo) a partir dos resultados,
// usando a data atual como referência da janela móvel. É derivado dos resultados
// persistidos, então não precisa ser gravado — basta refazer ao carregar, após
// cada simulação e ao fim de cada avanço (marcas expiram com o tempo).
//
// Só recalcula modalidades que já têm resultado: as que ainda não competiram
// mantêm o elenco inicial (entradas de roster), para que seus atletas continuem
// elegíveis na primeira etapa — o ranking rolante só mostra quem tem marca.
function recomputeRollingRankings(referenceDate = state.world?.currentDate) {
  if (!referenceDate) return;
  const modalitiesWithResults = new Set(
    state.results.map((result) => result.modalityId).filter(Boolean),
  );
  const rollingWithResults = state.modalities.filter(
    (modality) => modality.rankingModel === "rolling"
      && modalitiesWithResults.has(modality.id),
  );
  if (!rollingWithResults.length) return;

  state.rankingEntries = mergeRollingRanking(state.rankingEntries, state.results, {
    referenceDate,
    rankingIdFor,
    modalities: rollingWithResults,
    sports: state.sports,
  });
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

// Carrega os clubes/equipes persistidos. A estrutura existe para os esportes de
// equipe e mistos; enquanto nenhum clube é criado, a lista fica vazia.
async function reloadClubs() {
  state.clubs = await getAllClubs();
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
  const isMixedSport = selectedSport
    ? entityTypeForSport(selectedSport.id, state.sports) === "mista"
    : false;
  const competition = {
    id: existing?.id ?? createId("competition"),
    calendarEventId: existing?.calendarEventId ?? createId("event"),
    name: elements.competitionName.value.trim(),
    sportId: selectedSport?.id ?? null,
    modalityId: selectedModality?.id ?? null,
    sport: selectedSport?.name ?? "",
    discipline: selectedModality?.name ?? "",
    scoringSystemId: elements.competitionScoringSystem.value,
    eventFormat: elements.competitionEventFormat.value || "individual-ranking",
    resultMetric: elements.competitionResultMetric.value || "position-table",
    markType: elements.competitionResultMetric.value === "direct-mark"
      ? elements.competitionMarkType.value
      : null,
    heatSize: elements.competitionEventFormat.value === "heats"
      ? Number(elements.competitionHeatSize.value) || 8
      : null,
    teamRatingModel: isMixedSport ? elements.competitionTeamRatingModel.value : null,
    teamWeight: isMixedSport && elements.competitionTeamRatingModel.value === "weighted"
      ? normalizeTeamWeight(elements.competitionTeamWeight.value)
      : isMixedSport
        ? 0
        : null,
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

// Ligas de futebol só precisam dos clubes (não há atletas nem ranking de
// atletas). Cria os clubes ainda inexistentes e recarrega.
async function ensureLeagueClubs(preset) {
  const timestamp = new Date().toISOString();
  const existingClubIds = new Set(state.clubs.map(({ id }) => id));
  const newClubs = buildPresetClubs(preset, [], timestamp)
    .filter(({ id }) => !existingClubIds.has(id));
  if (newClubs.length) {
    await saveClubs(newClubs);
    await reloadClubs();
  }
  setupSportOptions();
}

async function ensurePresetRoster(preset) {
  if (!preset) return;
  if (preset.kind === "league") {
    await ensureLeagueClubs(preset);
    return;
  }
  const timestamp = new Date().toISOString();
  const { series, seriesParticipantIds } = resolvePresetRoster(preset);
  if (!series.length) return;
  const primarySeries = series[0];
  let people = state.people;
  // Modalidades rolantes (atletismo) trazem elenco próprio, então não absorvem
  // os 100 atletas genéricos — eles continuam para o primeiro preset cumulativo
  // ou sazonal (tênis/automobilismo).
  const primaryRankingModel =
    modalityById(primarySeries.modalityId, state.modalities)?.rankingModel ?? "cumulative";
  const assigningInitialSport =
    !state.world.initialSportPresetId && primaryRankingModel !== "rolling";

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

  // Cada série (F1, F2, F3, Regionais, tênis...) mantém seu próprio ranking
  // independente. Além dos atletas da modalidade, o elenco inclui os pilotos
  // vinculados de outra categoria (mesmo atleta correndo em dois campeonatos).
  series.forEach((seriesItem, seriesIndex) => {
    const modality = modalityById(seriesItem.modalityId, state.modalities);
    const rankingModel = modality?.rankingModel ?? "cumulative";
    const rankingId = rankingIdFor(seriesItem.sportId, seriesItem.modalityId);
    const existingEntryIds = new Set(
      state.rankingEntries
        .filter((entry) => entry.rankingId === rankingId)
        .map(({ personId }) => personId),
    );
    const participantIds = new Set(seriesParticipantIds[seriesIndex] ?? []);
    const rosterPeople = people.filter((person) =>
      (person.sportId === seriesItem.sportId && person.modalityId === seriesItem.modalityId)
      || participantIds.has(person.id));
    let generatedEntries = buildInitialRanking(rosterPeople, timestamp, {
      rankingId,
      rankingModel,
      seasonYear,
      startAtZero: rankingModel === "seasonal",
    }).map((entry) => ({
      ...entry,
      sportId: seriesItem.sportId,
      modalityId: seriesItem.modalityId,
    }));
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
  });

  if (presetPeople.length || people.some((person, index) => person !== state.people[index])) {
    await savePeople(people);
  }
  if (missingEntries.length) {
    await saveRankingEntries(missingEntries);
  }

  // Equipes dos esportes mistos (ex.: automobilismo): derivadas dos nomes dos
  // pilotos ("Piloto (Equipe)"). Cria só os clubes ainda inexistentes.
  const existingClubIds = new Set(state.clubs.map(({ id }) => id));
  const newClubs = buildPresetClubs(preset, people, timestamp)
    .filter(({ id }) => !existingClubIds.has(id));
  if (newClubs.length) {
    await saveClubs(newClubs);
    await reloadClubs();
  }

  await reloadRanking();
  setupSportOptions();
}

async function ensureRosterForImportedPresets() {
  const importedPresetIds = [...new Set(
    state.competitions.map(({ presetId }) => presetId).filter(Boolean),
  )];
  for (const presetId of importedPresetIds) {
    const preset = findPreset(presetId);
    if (preset) await ensurePresetRoster(preset);
  }
}

async function handleApplyPreset() {
  elements.presetFormError.textContent = "";
  const preset = findPreset(elements.presetSelect.value);
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

// Modelo/peso de equipe efetivos de uma competição: usa o que a competição
// gravou (via diálogo) ou, na falta, o padrão da modalidade.
function resolveTeamRatingConfig(competition) {
  if (competition.teamRatingModel) {
    return {
      teamRatingModel: competition.teamRatingModel,
      teamWeight: competition.teamRatingModel === "weighted"
        ? normalizeTeamWeight(competition.teamWeight ?? 0)
        : 0,
    };
  }
  return teamRatingConfigForModality(competition.modalityId, state.modalities);
}

// Rating de equipe por atleta (personId -> baseRating do clube) na modalidade.
// Enquanto não houver clubes criados (passo 3), o mapa fica vazio e a simulação
// não muda.
function teamRatingByPersonIdFor({ sportId, modalityId }) {
  const map = new Map();
  for (const club of state.clubs) {
    if (club.sportId !== sportId || club.modalityId !== modalityId) continue;
    for (const personId of club.memberPersonIds ?? []) {
      map.set(personId, club.baseRating);
    }
  }
  return map;
}

// Resolve os clubes participantes de uma liga e simula UMA rodada, acumulando as
// rodadas anteriores da mesma temporada para montar a classificação corrente.
function simulateLeagueForCompetition(competition) {
  const clubsById = new Map(state.clubs.map((club) => [club.id, club]));
  let clubs = (competition.participantIds ?? [])
    .map((id) => clubsById.get(id))
    .filter(Boolean);
  if (!clubs.length) {
    clubs = state.clubs.filter((club) =>
      club.sportId === competition.sportId && club.modalityId === competition.modalityId);
  }
  if (clubs.length < 2) return null;

  const seasonYear = Number(competition.occurrenceStart.slice(0, 4));
  const previousMatchRows = state.results
    .filter((result) =>
      result.kind === "league-round"
      && result.seasonId === competition.seasonId
      && Number(result.occurrenceStart.slice(0, 4)) === seasonYear
      && (result.seasonRound ?? 0) < (competition.seasonRound ?? 0))
    .flatMap((result) => result.standings ?? []);

  const { result } = simulateLeagueRound({
    competition,
    clubs,
    occurrenceStart: competition.occurrenceStart,
    occurrenceEnd: competition.occurrenceEnd,
    previousMatchRows,
  });
  return result;
}

async function processSimulationDate(isoDate) {
  const scheduled = occurrencesBetween(state.competitions, isoDate, isoDate)
    .filter((competition) => competition.occurrenceEnd === isoDate)
    .sort((a, b) => b.prestige - a.prestige || a.name.localeCompare(b.name, "pt-BR"));
  let simulatedCount = 0;

  for (const occurrence of scheduled) {
    const resultId = `result_${occurrence.id}_${occurrence.occurrenceStart}`;
    if (state.results.some((result) => result.id === resultId)) continue;

    // Esportes só de equipes (futebol) usam o simulador de liga: a temporada
    // inteira (turno e returno) é resolvida de uma vez, com tabela e campeão.
    if (entityTypeForSport(occurrence.sportId, state.sports) === "equipe") {
      const simulated = simulateLeagueForCompetition(occurrence);
      if (simulated) {
        await saveCompetitionResult(simulated, []);
        state.results.push(simulated);
        simulatedCount += 1;
      }
      continue;
    }

    const entry = competitionEntryFor(occurrence.id, occurrence.occurrenceStart);
    const teamConfig = resolveTeamRatingConfig(occurrence);
    const competitionWithSeason = {
      ...occurrence,
      ...seasonMetadataFor(occurrence),
      ...teamConfig,
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
      teamRatingByPersonId: teamConfig.teamWeight > 0
        ? teamRatingByPersonIdFor(occurrence)
        : new Map(),
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

  // Depois de simular o dia, refaz os rankings rolantes (atletismo) para que a
  // seleção das próximas etapas já use os pontos corretos por média na janela.
  if (simulatedCount) recomputeRollingRankings(isoDate);

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
    // Refaz os rankings rolantes com a data final: marcas antigas podem ter
    // saído da janela mesmo sem novas competições.
    recomputeRollingRankings(state.world.currentDate);
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
  state.clubs = [];
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
  state.userPresets = [];
  state.activeEditor = null;
  state.editorData = null;
}

async function loadCurrentGame() {
  state.world = await getWorld();
  await Promise.all([
    reloadCompetitionsAndEvents(),
    reloadResults(),
    reloadCompetitionEntries(),
    reloadClubs(),
  ]);
  if (!state.world) return false;

  await removeLegacyExamplesOnce();
  await ensureSports();
  await ensureGeography();
  await ensureInitialRanking();
  await reloadUserPresets();
  await seedFromUserData();
  await ensureRosterForImportedPresets();
  await resetSeasonRankingsIfNeeded(state.world.currentDate);
  recomputeRollingRankings(state.world.currentDate);
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
  await Promise.all([reloadResults(), reloadCompetitionEntries(), reloadClubs()]);
  await reloadUserPresets();
  await seedFromUserData();
  state.selectedDate = state.world.currentDate;
  state.viewDate = parseISODate(state.world.currentDate);
  elements.setupDialog.close();
  render();
  showToast("Mundo criado com calendário vazio e ranking de 100 pessoas.");
}

// ---------------------------------------------------------------------------
// Editores in-game: países, presets, ligas e atletas/clubes.
// ---------------------------------------------------------------------------

async function reloadUserPresets() {
  state.userPresets = await getAllUserPresets();
}

async function applyCountry(countries) {
  await saveGeography([], countries);
  await reloadGeography();
}

async function applyRosterClubs(clubs) {
  await saveClubs(clubs);
  await reloadClubs();
}

// Adiciona atletas e recompõe as entradas de ranking das modalidades afetadas,
// para que apareçam no ranking do seu esporte/modalidade.
async function applyRosterPeople(people, timestamp) {
  await savePeople(people);
  await reloadRanking();
  const affected = new Map();
  people.forEach((person) =>
    affected.set(rankingIdFor(person.sportId, person.modalityId), {
      sportId: person.sportId,
      modalityId: person.modalityId,
    }));
  const seasonYear = Number(state.world.currentDate.slice(0, 4));
  const entries = [];
  for (const [rankingId, { sportId, modalityId }] of affected) {
    const modalityPeople = state.people.filter((person) =>
      person.sportId === sportId && person.modalityId === modalityId);
    const rankingModel = modalityById(modalityId, state.modalities)?.rankingModel ?? "cumulative";
    entries.push(...buildInitialRanking(modalityPeople, timestamp, {
      rankingId,
      sportId,
      modalityId,
      rankingModel,
      seasonYear,
      startAtZero: rankingModel === "seasonal",
    }).map((entry) => ({ ...entry, sportId, modalityId })));
  }
  if (entries.length) {
    await saveRankingEntries(entries);
    await reloadRanking();
  }
}

async function applyPresetPackage(pkg) {
  const sports = pkg.sports ?? [];
  const modalities = pkg.modalities ?? [];
  if (sports.length || modalities.length) {
    await saveSportsAndModalities(sports, modalities);
    await reloadSports();
  }
  await saveUserPreset(pkg.preset);
  await reloadUserPresets();
  setupPresetOptions();
}

// Semeia o catálogo "database" (localStorage) neste jogo, em cada partida.
async function seedFromUserData() {
  const data = loadUserData();

  const newCountries = (data.countries ?? [])
    .filter((country) => !state.countries.some((existing) => existing.id === country.id));
  if (newCountries.length) {
    await saveGeography([], newCountries);
    await reloadGeography();
  }

  const newSports = (data.sports ?? []).filter((s) => !state.sports.some((e) => e.id === s.id));
  const newModalities = (data.modalities ?? []).filter((m) => !state.modalities.some((e) => e.id === m.id));
  if (newSports.length || newModalities.length) {
    await saveSportsAndModalities(newSports, newModalities);
    await reloadSports();
  }

  const newClubs = (data.clubs ?? []).filter((c) => !state.clubs.some((e) => e.id === c.id));
  if (newClubs.length) {
    await saveClubs(newClubs);
    await reloadClubs();
  }

  const newPeople = (data.people ?? []).filter((p) => !state.people.some((e) => e.id === p.id));
  if (newPeople.length) await applyRosterPeople(newPeople, new Date().toISOString());

  for (const preset of data.presets ?? []) {
    if (!state.userPresets.some((existing) => existing.id === preset.id)) {
      await saveUserPreset(preset);
    }
  }
  await reloadUserPresets();
  setupPresetOptions();
}

function setEditorSaveEnabled(enabled) {
  elements.editorSaveSave.disabled = !enabled;
  elements.editorSaveDb.disabled = !enabled;
}

function showEditorChooser() {
  state.activeEditor = null;
  state.editorData = null;
  elements.editorsTitle.textContent = "Escolha um editor";
  elements.editorShell.classList.add("hidden");
  elements.editorsChooser.classList.remove("hidden");
  elements.editorsChooser.replaceChildren();
  EDITOR_TYPES.forEach((type) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "editor-choice";
    const title = document.createElement("strong");
    title.textContent = type.label;
    const desc = document.createElement("span");
    desc.textContent = type.description;
    card.append(title, desc);
    card.addEventListener("click", () => openEditor(type.id));
    elements.editorsChooser.append(card);
  });
}

function editorHintText(typeId) {
  return typeId === "country" || typeId === "roster"
    ? "“Salvar no save” aplica ao jogo atual; “Salvar na database” persiste entre jogos e baixa o .js para o repositório."
    : "“Salvar no save” deixa o preset selecionável na tela de Presets; “na database” também persiste e baixa o .js.";
}

function openEditor(typeId) {
  const type = editorType(typeId);
  if (!type) return;
  state.activeEditor = typeId;
  state.editorData = null;
  elements.editorsTitle.textContent = `Editor · ${type.label}`;
  elements.editorDescription.textContent = type.description;
  elements.editorsChooser.classList.add("hidden");
  elements.editorShell.classList.remove("hidden");
  elements.editorSource.value = "";
  elements.editorPreview.replaceChildren();
  elements.editorError.textContent = "";
  elements.editorHint.textContent = editorHintText(typeId);
  setEditorSaveEnabled(false);
}

function openEditorsDialog() {
  showEditorChooser();
  if (!elements.editorsDialog.open) elements.editorsDialog.showModal();
}

function closeEditorsDialog() {
  if (elements.editorsDialog.open) elements.editorsDialog.close();
}

function copyEditorTemplate() {
  const text = templateFor(state.activeEditor);
  const fallback = () => {
    elements.editorSource.value = text;
    showToast("Modelo inserido no campo abaixo.");
  };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(
      () => showToast("Modelo copiado para a área de transferência."),
      fallback,
    );
  } else {
    fallback();
  }
}

function loadEditorFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    elements.editorSource.value = String(reader.result ?? "");
  });
  reader.readAsText(file);
}

function buildEditorData(typeId, parsed) {
  if (typeId === "country") {
    const list = Array.isArray(parsed) ? parsed : [parsed];
    const errors = [];
    list.forEach((country, index) =>
      validateCountry(country).forEach((error) => errors.push(`País ${index + 1}: ${error}`)));
    const countries = errors.length ? [] : list.map((country) => normalizeCountry(country));
    return { type: typeId, errors, countries, summary: `${countries.length} país(es)` };
  }
  if (typeId === "roster") {
    const errors = validateRoster(parsed);
    // Atletas/clubes só entram em esporte e modalidade que existam no catálogo.
    if (parsed?.sportId && !sportById(parsed.sportId, state.sports)) {
      errors.push(`Esporte inexistente: ${parsed.sportId}.`);
    }
    if (parsed?.modalityId && !modalityById(parsed.modalityId, state.modalities)) {
      errors.push(`Modalidade inexistente: ${parsed.modalityId}.`);
    }
    const { people, clubs } = errors.length ? { people: [], clubs: [] } : normalizeRoster(parsed);
    return {
      type: typeId,
      errors,
      people,
      clubs,
      summary: `${people.length} atleta(s) e ${clubs.length} clube(s) em ${parsed?.modalityId ?? "—"}`,
    };
  }
  const errors = validatePresetPackage(parsed, buildPresetCompetitions);
  const pkg = errors.length ? null : {
    sports: parsed.sports ?? [],
    modalities: parsed.modalities ?? [],
    preset: parsed.preset,
  };
  let summary = "";
  if (pkg) {
    const competitions = buildPresetCompetitions(pkg.preset).length;
    summary = `Preset “${pkg.preset.name}” · ${competitions} competições`
      + ` · ${pkg.sports.length} esporte(s) e ${pkg.modalities.length} modalidade(s) novos`;
  }
  return { type: typeId, errors, pkg, summary };
}

function renderEditorPreview(result) {
  elements.editorPreview.replaceChildren();
  const box = document.createElement("div");
  box.className = "editor-preview-box";
  const strong = document.createElement("strong");
  strong.textContent = "Pré-visualização";
  const paragraph = document.createElement("p");
  paragraph.textContent = result.summary;
  box.append(strong, paragraph);
  elements.editorPreview.append(box);
}

async function validateEditor() {
  elements.editorError.textContent = "";
  elements.editorPreview.replaceChildren();
  setEditorSaveEnabled(false);
  state.editorData = null;

  const source = elements.editorSource.value.trim();
  if (!source) {
    elements.editorError.textContent = "Cole o conteúdo do arquivo .js (use “Copiar modelo”).";
    return;
  }

  let parsed;
  try {
    parsed = await parseEditorModule(source);
  } catch (error) {
    elements.editorError.textContent = `Erro ao ler o .js: ${error.message}`;
    return;
  }
  if (!parsed) {
    elements.editorError.textContent = "O arquivo não exporta dados (use export default).";
    return;
  }

  const result = buildEditorData(state.activeEditor, parsed);
  if (result.errors.length) {
    elements.editorError.textContent = result.errors.join(" ");
    return;
  }
  state.editorData = result;
  renderEditorPreview(result);
  setEditorSaveEnabled(true);
}

function downloadModule(filename, data, header) {
  const blob = new Blob([serializeModule(data, header)], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function saveEditor(toDatabase) {
  const result = state.editorData;
  if (!result) return;
  try {
    if (result.type === "country") {
      await applyCountry(result.countries);
      if (toDatabase) {
        addUserRecords("countries", result.countries);
        downloadModule("paises.js", result.countries, "Países — gerado pelo editor in-game");
      }
    } else if (result.type === "roster") {
      if (result.people.length) await applyRosterPeople(result.people, new Date().toISOString());
      if (result.clubs.length) await applyRosterClubs(result.clubs);
      if (toDatabase) {
        if (result.people.length) addUserRecords("people", result.people);
        if (result.clubs.length) addUserRecords("clubs", result.clubs);
        downloadModule("elenco.js", { people: result.people, clubs: result.clubs },
          "Atletas/Clubes — gerado pelo editor in-game");
      }
    } else {
      await applyPresetPackage(result.pkg);
      if (toDatabase) {
        if (result.pkg.sports.length) addUserRecords("sports", result.pkg.sports);
        if (result.pkg.modalities.length) addUserRecords("modalities", result.pkg.modalities);
        addUserRecords("presets", [result.pkg.preset]);
        downloadModule(`${result.pkg.preset.id}.js`, result.pkg, "Preset — gerado pelo editor in-game");
      }
    }
    render();
    showToast(toDatabase
      ? "Salvo na database (persistente) e baixado para versionar no repositório."
      : "Salvo no save atual.");
    setEditorSaveEnabled(false);
    state.editorData = null;
    elements.editorSource.value = "";
    elements.editorPreview.replaceChildren();
  } catch (error) {
    console.error(error);
    elements.editorError.textContent = error.message ?? "Não foi possível salvar.";
  }
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
    applyModalityTeamRatingDefaults();
  });
  elements.competitionDiscipline.addEventListener("change", () => {
    updateQualifierTargetOptions();
    applyModalityTeamRatingDefaults();
  });
  elements.competitionTeamRatingModel.addEventListener("change", updateTeamRatingFields);
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
  elements.competitionEventFormat.addEventListener("change", updateEventFormatFields);
  elements.competitionResultMetric.addEventListener("change", updateEventFormatFields);
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
  elements.teamsSport.addEventListener("change", () => {
    updateTeamsModalitySelect();
    renderTeams();
  });
  elements.teamsModality.addEventListener("change", renderTeams);
  elements.seasonSport.addEventListener("change", () => {
    const year = seasonYearNow();
    const units = buildSeasonUnits(state.competitions, year)
      .filter((unit) => unit.sportId === elements.seasonSport.value);
    if (units.length) {
      state.season.unitKey = units[0].key;
      state.season.roundIndex = null;
    }
    renderSeasonSection();
  });
  elements.seasonUnit.addEventListener("change", () => {
    state.season.unitKey = elements.seasonUnit.value;
    state.season.roundIndex = null;
    renderSeasonSection();
  });
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

  elements.toolsButton.addEventListener("click", openEditorsDialog);
  elements.closeEditorsDialog.addEventListener("click", closeEditorsDialog);
  elements.editorBack.addEventListener("click", showEditorChooser);
  elements.editorCopyTemplate.addEventListener("click", copyEditorTemplate);
  elements.editorFile.addEventListener("change", (event) => {
    loadEditorFile(event.target.files?.[0]);
    event.target.value = "";
  });
  elements.editorValidate.addEventListener("click", validateEditor);
  elements.editorSaveSave.addEventListener("click", () => saveEditor(false));
  elements.editorSaveDb.addEventListener("click", () => saveEditor(true));
  elements.editorsDialog.addEventListener("click", (event) => {
    if (event.target === elements.editorsDialog) closeEditorsDialog();
  });
}

function initialize() {
  attachEventListeners();
  setupScoringSystemOptions();
  setupEventFormatOptions();
  setupTeamRatingOptions();
  setupMixedQualificationOptions();
  setupPresetOptions();
  switchHub(state.activeHub);
  elements.startDialog.showModal();
}

initialize();
