import test from "node:test";
import assert from "node:assert/strict";

import {
  addDays,
  daysBetween,
  eventsOnDate,
  getCalendarDays,
  nextEventDate,
  occurrencesBetween,
} from "../js/calendar.js";

const annualEvent = {
  id: "national",
  name: "Campeonato Nacional",
  type: "championship",
  startDate: "2028-04-21",
  endDate: "2028-04-24",
  recurrence: "yearly",
};

test("soma dias atravessando mês e ano", () => {
  assert.equal(addDays("2028-12-31", 1), "2029-01-01");
});

test("respeita o dia extra de um ano bissexto", () => {
  assert.equal(addDays("2028-02-28", 1), "2028-02-29");
  assert.equal(daysBetween("2028-02-28", "2028-03-01"), 2);
});

test("o calendário mensal sempre produz seis semanas começando na segunda-feira", () => {
  const days = getCalendarDays(new Date(2028, 0, 1, 12));
  assert.equal(days.length, 42);
  assert.equal(days[0].date.getDay(), 1);
});

test("evento anual mantém sua duração nos anos seguintes", () => {
  const occurrences = occurrencesBetween([annualEvent], "2029-04-01", "2029-04-30");
  assert.equal(occurrences.length, 1);
  assert.equal(occurrences[0].occurrenceStart, "2029-04-21");
  assert.equal(occurrences[0].occurrenceEnd, "2029-04-24");
});

test("evento anual não é projetado para anos anteriores à sua criação", () => {
  const occurrences = occurrencesBetween([annualEvent], "2027-04-01", "2027-04-30");
  assert.equal(occurrences.length, 0);
});

test("evento com vários dias aparece em todos os dias do intervalo", () => {
  assert.equal(eventsOnDate([annualEvent], "2028-04-22").length, 1);
  assert.equal(eventsOnDate([annualEvent], "2028-04-25").length, 0);
});

test("encontra a próxima edição anual", () => {
  assert.equal(nextEventDate([annualEvent], "2028-04-21"), "2029-04-21");
});
