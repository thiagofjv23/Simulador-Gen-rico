import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPresetClubs,
  buildPresetCompetitions,
  buildPresetPeople,
  presetById,
} from "../js/presets.js";
import {
  buildInitialRanking,
  combineRanking,
  rankingIdFor,
} from "../js/ranking.js";
import { teamRatingConfigForModality } from "../js/sports.js";
import { simulateCompetition } from "../js/simulation.js";

const TS = "2026-01-01T00:00:00.000Z";
const FIA = presetById("fia-ecosystem-2026");
const F1_MODALITY = "modality_motorsport_formula1";
const SPORT = "sport_motorsport";

// Reconstrói o ranking de F1 e um Grande Prêmio a partir do preset real.
function f1Setup() {
  const people = buildPresetPeople(FIA, TS).filter(({ modalityId }) => modalityId === F1_MODALITY);
  const clubs = buildPresetClubs(FIA, buildPresetPeople(FIA, TS), TS)
    .filter(({ modalityId }) => modalityId === F1_MODALITY);
  const entries = buildInitialRanking(people, TS, {
    rankingId: rankingIdFor(SPORT, F1_MODALITY),
    sportId: SPORT,
    modalityId: F1_MODALITY,
    rankingModel: "seasonal",
    seasonYear: 2026,
    startAtZero: true,
  }).map((entry) => ({ ...entry, sportId: SPORT, modalityId: F1_MODALITY }));
  const ranking = combineRanking(people, entries);
  const grandPrix = buildPresetCompetitions(FIA)
    .find(({ modalityId }) => modalityId === F1_MODALITY);
  const teamRatingByPersonId = new Map();
  for (const club of clubs) {
    for (const personId of club.memberPersonIds) {
      teamRatingByPersonId.set(personId, club.baseRating);
    }
  }
  return { people, clubs, ranking, grandPrix, teamRatingByPersonId };
}

test("a F1 usa o modelo weighted com peso 60 (desempenho do carro)", () => {
  assert.deepEqual(teamRatingConfigForModality(F1_MODALITY), {
    teamRatingModel: "weighted",
    teamWeight: 60,
  });
});

test("o rating do carro altera o resultado do Grande Prêmio de F1", () => {
  const { ranking, grandPrix, teamRatingByPersonId } = f1Setup();
  const config = teamRatingConfigForModality(F1_MODALITY);
  const competition = { ...grandPrix, ...config };

  // Sem equipes (mapa vazio) = comportamento original; com equipes o carro pesa.
  const withoutCar = simulateCompetition({
    competition,
    occurrenceStart: grandPrix.startDate,
    occurrenceEnd: grandPrix.endDate,
    ranking,
  });
  const withCar = simulateCompetition({
    competition,
    occurrenceStart: grandPrix.startDate,
    occurrenceEnd: grandPrix.endDate,
    ranking,
    teamRatingByPersonId,
  });

  const perf = (sim) => sim.result.standings.map((s) => [s.personId, s.performance]);
  assert.notDeepEqual(perf(withCar), perf(withoutCar));
  assert.equal(withCar.result.teamWeight, 60);

  // O carro puxa o desempenho na direção do rating da equipe. Um piloto de
  // equipe forte rende mais com o carro; um de equipe fraca, menos.
  const byPerson = (sim) => new Map(sim.result.standings.map((s) => [s.personId, s.performance]));
  const withCarMap = byPerson(withCar);
  const withoutCarMap = byPerson(withoutCar);
  // Verstappen (Red Bull 93) tem rating 99: com o carro (93 < 99) rende um pouco menos.
  assert.ok(withCarMap.get("person_f1_max-verstappen") < withoutCarMap.get("person_f1_max-verstappen"));
  // Hadjar (Red Bull 93) tem rating 86: com o carro (93 > 86) rende mais.
  assert.ok(withCarMap.get("person_f1_isack-hadjar") > withoutCarMap.get("person_f1_isack-hadjar"));
});
