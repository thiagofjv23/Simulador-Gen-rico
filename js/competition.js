import {
  geographicScopeLabel,
  validateGeographicScope,
} from "./geography.js";
import { validateSportSelection, SPORTS, MODALITIES } from "./sports.js";
import { validateCompetitionTaxonomy, CATALOG_MODALITIES } from "./catalog.js";
import { scoringSystemById, scoringSystemLabel } from "./scoring.js";
import { eventFormatById } from "./eventformat.js";
import { markTypeById, resultMetricById } from "./metric.js";
import { MAX_TEAM_WEIGHT, isTeamRatingModel } from "./clubs.js";

export const COMPETITION_MODELS = {
  standalone: {
    label: "Evento independente",
    description:
      "O resultado distribui pontos diretamente ao ranking permanente da modalidade.",
  },
  season_stage: {
    label: "Etapa de temporada",
    description:
      "A etapa soma pontos em um campeonato anual. Após a última etapa há um campeão e a classificação zera no início do ano seguinte.",
  },
};

export function competitionModelLabel(model) {
  return COMPETITION_MODELS[model]?.label ?? COMPETITION_MODELS.standalone.label;
}

// Tier da competição: 1 (maior prestígio) a 4 (menor). Toda competição tem uma.
// Genérico para qualquer esporte — é um nível de importância, não uma regra de
// resolução.
export const COMPETITION_TIERS = [
  {
    id: 1,
    label: "Tier 1",
    description:
      "Elite / maior prestígio: Grand Slams, primeiras divisões nacionais, Mundiais, Diamond League, Fórmula 1.",
  },
  {
    id: 2,
    label: "Tier 2",
    description: "Alto nível, logo abaixo da elite: ex.: ATP 500, Fórmula 2.",
  },
  {
    id: 3,
    label: "Tier 3",
    description: "Nível intermediário: ex.: ATP 250, Fórmula 3.",
  },
  {
    id: 4,
    label: "Tier 4",
    description: "Menor prestígio / regionais: ex.: Fórmulas Regionais, circuitos regionais.",
  },
];

export const DEFAULT_TIER = 3;

// Sugestão de tier a partir do prestígio (1 = maior). Serve de padrão no criador
// de competições e para adequar os presets; pode ser sobrescrito por competição.
export function tierForPrestige(prestige = 0) {
  const value = Number(prestige) || 0;
  if (value >= 85) return 1;
  if (value >= 65) return 2;
  if (value >= 45) return 3;
  return 4;
}

export function tierLabel(tier) {
  return COMPETITION_TIERS.find(({ id }) => id === tier)?.label ?? "Não informado";
}

export const QUALIFICATION_CRITERIA = {
  open: {
    label: "Aberta",
    description:
      "Qualquer atleta elegível pode se inscrever. Presets reais não usam esta opção por padrão.",
  },
  ranking: {
    label: "Por ranking",
    description:
      "As vagas são preenchidas pelos melhores elegíveis no ranking do esporte. O total de vagas define o corte.",
  },
  qualifier: {
    label: "Por classificatória",
    description:
      "As vagas pertencem aos atletas classificados em competições eliminatórias vinculadas a este torneio.",
  },
  invitation: {
    label: "Por convite",
    description:
      "Dez dias antes da competição, o jogador escolhe os participantes no ranking do esporte.",
  },
  mixed: {
    label: "Mista",
    description:
      "Combine dois ou mais critérios e distribua entre eles todas as vagas da competição.",
  },
};

export const QUALIFICATION_METHODS = ["open", "ranking", "qualifier", "invitation"];

function combinations(values, size, startIndex = 0, current = [], result = []) {
  if (current.length === size) {
    result.push([...current]);
    return result;
  }

  for (let index = startIndex; index < values.length; index += 1) {
    current.push(values[index]);
    combinations(values, size, index + 1, current, result);
    current.pop();
  }

  return result;
}

export const MIXED_QUALIFICATION_COMBINATIONS = [2, 3, 4]
  .flatMap((size) => combinations(QUALIFICATION_METHODS, size))
  .map((methods) => ({
    id: methods.join("+"),
    methods,
    label: methods.map((method) => QUALIFICATION_CRITERIA[method].label).join(" + "),
  }));

export function qualificationLabel(qualification) {
  return QUALIFICATION_CRITERIA[qualification]?.label ?? "Não informado";
}

export function mixedCombinationById(combinationId) {
  return MIXED_QUALIFICATION_COMBINATIONS.find(({ id }) => id === combinationId) ?? null;
}

export function qualificationMethods(competition) {
  if (competition.qualification !== "mixed") {
    return QUALIFICATION_METHODS.includes(competition.qualification)
      ? [competition.qualification]
      : [];
  }
  return mixedCombinationById(competition.mixedCombination)?.methods ?? [];
}

export function slotsForQualificationMethod(competition, method) {
  if (!qualificationMethods(competition).includes(method)) return 0;
  if (competition.qualification !== "mixed") return competition.slots;
  return competition.mixedSlots?.[method] ?? 0;
}

export function usesQualificationMethod(competition, method) {
  return qualificationMethods(competition).includes(method);
}

export function invitationOpensOn(occurrenceStart) {
  const date = new Date(`${occurrenceStart}T12:00:00`);
  date.setDate(date.getDate() - 10);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function validateCompetitionRelations(competition, competitions = []) {
  const errors = [];
  const otherCompetitions = competitions.filter(({ id }) => id !== competition.id);
  const target = competition.qualifierTargetCompetitionId
    ? otherCompetitions.find(
      ({ id }) => id === competition.qualifierTargetCompetitionId,
    )
    : null;

  if (competition.type === "qualifier") {
    if (!competition.qualifierTargetCompetitionId) {
      errors.push("Escolha para qual competição esta classificatória concede vagas.");
    } else if (competition.qualifierTargetCompetitionId === competition.id) {
      errors.push("Uma classificatória não pode conceder vagas para si mesma.");
    } else if (!target) {
      errors.push("A competição de destino da classificatória não existe.");
    } else {
      if (!usesQualificationMethod(target, "qualifier")) {
        errors.push(
          "A competição de destino deve usar “Por classificatória” ou uma combinação mista com classificatória.",
        );
      }
      if (target.sportId !== competition.sportId || target.modalityId !== competition.modalityId) {
        errors.push("A classificatória e a competição de destino devem ter o mesmo esporte e modalidade.");
      }
      if (competition.endDate >= target.startDate) {
        errors.push("A classificatória deve terminar antes do início da competição de destino.");
      }
      const destinationCapacity = slotsForQualificationMethod(target, "qualifier");
      const otherLinkedSlots = otherCompetitions
        .filter(({ type, qualifierTargetCompetitionId }) =>
          type === "qualifier"
          && qualifierTargetCompetitionId === target.id,
        )
        .reduce((total, linkedCompetition) => total + (linkedCompetition.qualifierSlots ?? 0), 0);
      if (
        Number.isInteger(competition.qualifierSlots)
        && destinationCapacity > 0
        && otherLinkedSlots + competition.qualifierSlots > destinationCapacity
      ) {
        errors.push(
          `As classificatórias vinculadas excedem as ${destinationCapacity} vagas reservadas no torneio de destino.`,
        );
      }
    }
  }

  const inboundQualifiers = otherCompetitions.filter(
    ({ type, qualifierTargetCompetitionId }) =>
      type === "qualifier"
      && qualifierTargetCompetitionId === competition.id,
  );
  if (inboundQualifiers.length) {
    if (!usesQualificationMethod(competition, "qualifier")) {
      errors.push("Esta competição possui classificatórias vinculadas e deve manter vagas por classificatória.");
    }
    for (const qualifier of inboundQualifiers) {
      if (qualifier.sportId !== competition.sportId || qualifier.modalityId !== competition.modalityId) {
        errors.push(`A classificatória “${qualifier.name}” deixou de ter o mesmo esporte e modalidade.`);
      }
      if (qualifier.endDate >= competition.startDate) {
        errors.push(`A classificatória “${qualifier.name}” deve terminar antes desta competição.`);
      }
    }
    const inboundSlots = inboundQualifiers.reduce(
      (total, qualifier) => total + (qualifier.qualifierSlots ?? 0),
      0,
    );
    const capacity = slotsForQualificationMethod(competition, "qualifier");
    if (capacity > 0 && inboundSlots > capacity) {
      errors.push(`As classificatórias vinculadas concedem ${inboundSlots} vagas, mas só ${capacity} estão reservadas.`);
    }
  }

  return errors;
}

export function validateCompetition(competition, { competitions = [] } = {}) {
  const errors = [];

  if (!competition.name?.trim()) errors.push("Informe o nome da competição.");
  // A modalidade pode ser do catálogo (js/modalities.js, usada pelo formulário)
  // ou uma legada (presets já existentes) — ambas são aceitas.
  errors.push(...validateSportSelection(competition, SPORTS, [...MODALITIES, ...CATALOG_MODALITIES]));
  // Toda competição precisa estar atrelada a esporte + modalidade + tipo de
  // evento (ver js/catalog.js). Esportes ainda fora do catálogo ficam isentos.
  errors.push(...validateCompetitionTaxonomy(competition));
  if (!competition.startDate) errors.push("Informe a data inicial.");
  if (!competition.endDate) errors.push("Informe a data final.");
  if (
    competition.startDate
    && competition.endDate
    && competition.endDate < competition.startDate
  ) {
    errors.push("A data final não pode ser anterior à data inicial.");
  }
  if (!Number.isInteger(competition.prestige) || competition.prestige < 1 || competition.prestige > 100) {
    errors.push("O prestígio deve ser um número inteiro entre 1 e 100.");
  }
  if (!Number.isInteger(competition.tier) || competition.tier < 1 || competition.tier > 4) {
    errors.push("A competição deve ter uma tier de 1 (maior) a 4 (menor).");
  }
  if (!Number.isInteger(competition.slots) || competition.slots < 2 || competition.slots > 9999) {
    errors.push("A quantidade de vagas deve ser um número inteiro entre 2 e 9999.");
  }
  if (
    !Number.isInteger(competition.rankingPoints)
    || competition.rankingPoints < 1
    || competition.rankingPoints > 10000
  ) {
    errors.push("Os pontos do vencedor devem ser um número inteiro entre 1 e 10.000.");
  }
  if (!scoringSystemById(competition.scoringSystemId ?? "generic-proportional")) {
    errors.push("Escolha um sistema de pontuação válido.");
  }
  if (competition.eventFormat && !eventFormatById(competition.eventFormat)) {
    errors.push("Escolha um formato de prova válido.");
  }
  if (competition.resultMetric && !resultMetricById(competition.resultMetric)) {
    errors.push("Escolha um sistema de pontuação e métrica válido.");
  }
  if (competition.resultMetric === "direct-mark"
    && competition.markType
    && !markTypeById(competition.markType)) {
    errors.push("Escolha um tipo de marca válido.");
  }
  if (!COMPETITION_MODELS[competition.competitionModel ?? "standalone"]) {
    errors.push("Escolha um modelo de competição válido.");
  }
  if (competition.teamRatingModel && !isTeamRatingModel(competition.teamRatingModel)) {
    errors.push("Escolha um modelo de rating de equipe válido.");
  }
  if (
    competition.teamWeight != null
    && (!Number.isInteger(competition.teamWeight)
      || competition.teamWeight < 0
      || competition.teamWeight > MAX_TEAM_WEIGHT)
  ) {
    errors.push(`O peso da equipe deve ser um inteiro entre 0 e ${MAX_TEAM_WEIGHT}.`);
  }
  if (competition.competitionModel === "season_stage") {
    if (!competition.seasonName?.trim()) {
      errors.push("Informe o nome do campeonato anual desta etapa.");
    }
    if (competition.recurrence !== "yearly") {
      errors.push("Uma etapa de temporada deve se repetir todos os anos.");
    }
  }
  if (
    !QUALIFICATION_CRITERIA[competition.qualification]
  ) {
    errors.push("Escolha um critério de classificação válido.");
  }

  if (competition.qualification === "mixed") {
    const combination = mixedCombinationById(competition.mixedCombination);
    if (!combination) {
      errors.push("Escolha uma combinação válida para a classificação mista.");
    } else {
      const allocatedSlots = combination.methods.reduce((total, method) => {
        const slots = competition.mixedSlots?.[method];
        if (!Number.isInteger(slots) || slots < 1) {
          errors.push(`Informe ao menos uma vaga para “${qualificationLabel(method)}”.`);
          return total;
        }
        return total + slots;
      }, 0);
      if (allocatedSlots !== competition.slots) {
        errors.push(
          `A distribuição mista deve somar exatamente ${competition.slots} vagas.`,
        );
      }
    }
  }

  if (competition.type === "qualifier") {
    if (!Number.isInteger(competition.qualifierSlots) || competition.qualifierSlots < 1) {
      errors.push("Informe quantas vagas esta classificatória concede.");
    }
  }

  errors.push(...validateGeographicScope(competition));
  errors.push(...validateCompetitionRelations(competition, competitions));

  return errors;
}

export function buildCalendarEvent(competition) {
  return {
    id: competition.calendarEventId,
    competitionId: competition.id,
    source: "competition",
    name: competition.name,
    type: competition.type,
    startDate: competition.startDate,
    endDate: competition.endDate,
    recurrence: competition.recurrence,
    notes: [
      competition.sport,
      competition.discipline,
      geographicScopeLabel(competition),
      `Prestígio ${competition.prestige}`,
      scoringSystemLabel(competition.scoringSystemId),
      competitionModelLabel(competition.competitionModel),
    ].join(" · "),
    createdAt: competition.createdAt,
    updatedAt: competition.updatedAt,
  };
}

export function sortCompetitions(competitions) {
  return [...competitions].sort((a, b) =>
    a.startDate.localeCompare(b.startDate) || a.name.localeCompare(b.name, "pt-BR"),
  );
}

export function competitionStats(competitions) {
  if (!competitions.length) {
    return { total: 0, annual: 0, averagePrestige: 0 };
  }

  const prestigeTotal = competitions.reduce((total, competition) => {
    return total + competition.prestige;
  }, 0);

  return {
    total: competitions.length,
    annual: competitions.filter((competition) => competition.recurrence === "yearly").length,
    averagePrestige: Math.round(prestigeTotal / competitions.length),
  };
}
