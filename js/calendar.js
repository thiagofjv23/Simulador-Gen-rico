const DAY_IN_MS = 86_400_000;

export const EVENT_TYPES = {
  league: { label: "Liga", color: "var(--league)" },
  cup: { label: "Copa", color: "var(--cup)" },
  meeting: { label: "Meeting", color: "var(--meeting)" },
  championship: { label: "Campeonato", color: "var(--championship)" },
  qualifier: { label: "Classificatória", color: "var(--qualifier)" },
  games: { label: "Jogos", color: "var(--games)" },
  other: { label: "Outro", color: "var(--other)" },
};

export function parseISODate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

export function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(isoDate, amount) {
  const date = parseISODate(isoDate);
  date.setDate(date.getDate() + amount);
  return toISODate(date);
}

export function daysBetween(startDate, endDate) {
  const utcStart = Date.UTC(...startDate.split("-").map((value, index) => index === 1 ? Number(value) - 1 : Number(value)));
  const utcEnd = Date.UTC(...endDate.split("-").map((value, index) => index === 1 ? Number(value) - 1 : Number(value)));
  return Math.round((utcEnd - utcStart) / DAY_IN_MS);
}

export function formatFullDate(isoDate) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parseISODate(isoDate));
}

export function formatShortDate(isoDate) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parseISODate(isoDate));
}

export function formatMonth(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getCalendarDays(viewDate) {
  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1, 12);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return {
      isoDate: toISODate(date),
      date,
      isCurrentMonth: date.getMonth() === viewDate.getMonth(),
    };
  });
}

function annualStartForYear(event, year) {
  const original = parseISODate(event.startDate);
  const candidate = new Date(year, original.getMonth(), original.getDate(), 12);

  // 29/02 em um ano não bissexto ocorre em 28/02, evitando perder o evento.
  if (candidate.getMonth() !== original.getMonth()) {
    return `${year}-02-28`;
  }

  return toISODate(candidate);
}

export function getOccurrence(event, year) {
  if (event.recurrence !== "yearly") {
    return {
      ...event,
      occurrenceStart: event.startDate,
      occurrenceEnd: event.endDate,
      occurrenceKey: `${event.id}:${event.startDate}`,
    };
  }

  const occurrenceStart = annualStartForYear(event, year);
  const duration = daysBetween(event.startDate, event.endDate);

  return {
    ...event,
    occurrenceStart,
    occurrenceEnd: addDays(occurrenceStart, duration),
    occurrenceKey: `${event.id}:${year}`,
  };
}

export function occurrencesBetween(events, rangeStart, rangeEnd) {
  const startYear = parseISODate(rangeStart).getFullYear();
  const endYear = parseISODate(rangeEnd).getFullYear();
  const results = [];

  for (const event of events) {
    if (event.recurrence === "yearly") {
      const originalYear = parseISODate(event.startDate).getFullYear();
      for (let year = Math.max(startYear - 1, originalYear); year <= endYear; year += 1) {
        const occurrence = getOccurrence(event, year);
        if (occurrence.occurrenceEnd >= rangeStart && occurrence.occurrenceStart <= rangeEnd) {
          results.push(occurrence);
        }
      }
    } else {
      const occurrence = getOccurrence(event, startYear);
      if (occurrence.occurrenceEnd >= rangeStart && occurrence.occurrenceStart <= rangeEnd) {
        results.push(occurrence);
      }
    }
  }

  return results.sort((a, b) =>
    a.occurrenceStart.localeCompare(b.occurrenceStart) || a.name.localeCompare(b.name),
  );
}

export function eventsOnDate(events, isoDate) {
  return occurrencesBetween(events, isoDate, isoDate);
}

export function upcomingOccurrences(events, fromDate, limit = 8) {
  const endDate = addDays(fromDate, 1095);
  return occurrencesBetween(events, fromDate, endDate)
    .filter((event) => event.occurrenceStart >= fromDate)
    .slice(0, limit);
}

export function nextEventDate(events, currentDate) {
  const next = upcomingOccurrences(events, addDays(currentDate, 1), 1)[0];
  return next?.occurrenceStart ?? null;
}
