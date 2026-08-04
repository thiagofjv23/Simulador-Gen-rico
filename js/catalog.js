// Catálogo hierárquico esporte → modalidade → tipo de evento. Junta os dados de
// js/sports.js, js/modalities.js e js/eventtypes.js num único ponto de consulta e
// validação. A regra do domínio é: nenhuma competição existe sem estar atrelada a
// um esporte, uma modalidade e um tipo de evento.
//
// Integração aditiva (não substitui a taxonomia legada de js/sports.js): as
// modalidades legadas de granularidade fina (ex.: `modality_athletics_100m`,
// `modality_tennis_mens_singles`, `modality_football_brasileirao`) continuam
// alimentando os motores de simulação/ranking. Um mapa de compatibilidade
// (`LEGACY_MODALITY_ALIASES`) traduz cada uma delas para o par
// (modalidade, tipo de evento) deste catálogo, de modo que as competições já
// existentes fiquem atreladas aos três níveis sem reescrever presets.
//
// Automobilismo ainda não está neste catálogo (entra num passo posterior); por
// isso a validação isenta esportes que ainda não possuem tipos de evento aqui.
import { SPORTS, sportById, entityTypeForSport } from "./sports.js";
import { ENTITY_TYPES, DEFAULT_ENTITY_TYPE } from "./clubs.js";
import CATALOG_MODALITIES from "./modalities.js";
import EVENT_TYPES from "./eventtypes.js";

export { CATALOG_MODALITIES, EVENT_TYPES };

const MODALITY_BY_ID = new Map(CATALOG_MODALITIES.map((modality) => [modality.id, modality]));
const EVENT_TYPE_BY_ID = new Map(EVENT_TYPES.map((eventType) => [eventType.id, eventType]));

const EVENT_TYPES_BY_MODALITY = new Map();
const EVENT_TYPES_BY_SPORT = new Map();
for (const eventType of EVENT_TYPES) {
  if (!EVENT_TYPES_BY_MODALITY.has(eventType.modalityId)) {
    EVENT_TYPES_BY_MODALITY.set(eventType.modalityId, []);
  }
  EVENT_TYPES_BY_MODALITY.get(eventType.modalityId).push(eventType);
  if (!EVENT_TYPES_BY_SPORT.has(eventType.sportId)) {
    EVENT_TYPES_BY_SPORT.set(eventType.sportId, []);
  }
  EVENT_TYPES_BY_SPORT.get(eventType.sportId).push(eventType);
}

// Verifica a integridade do catálogo: ids únicos e referências coerentes entre
// os três níveis. Retorna a lista de problemas (vazia = catálogo íntegro). É
// pura para poder rodar nos testes; a app não precisa chamá-la em produção.
export function validateCatalogIntegrity(
  sports = SPORTS,
  modalities = CATALOG_MODALITIES,
  eventTypes = EVENT_TYPES,
) {
  const errors = [];
  const sportIds = new Set(sports.map((sport) => sport.id));

  const modalityIds = new Set();
  for (const modality of modalities) {
    if (modalityIds.has(modality.id)) {
      errors.push(`Modalidade duplicada: ${modality.id}.`);
    }
    modalityIds.add(modality.id);
    if (!sportIds.has(modality.sportId)) {
      errors.push(`Modalidade ${modality.id} referencia esporte inexistente: ${modality.sportId}.`);
    }
    if (!modality.name?.trim()) {
      errors.push(`Modalidade ${modality.id} sem nome.`);
    }
    // entityType (atleta/equipe/mista) deve existir e ser compatível com o
    // entityType do esporte: só de atleta não aceita equipe e vice-versa; mista
    // aceita qualquer uma.
    if (!ENTITY_TYPES[modality.entityType]) {
      errors.push(`Modalidade ${modality.id} com entityType inválido: ${modality.entityType}.`);
    } else if (sportIds.has(modality.sportId)) {
      const sportEntity = ENTITY_TYPES[entityTypeForSport(modality.sportId, sports)];
      const needsAthletes = modality.entityType === "atleta" || modality.entityType === "mista";
      const needsClubs = modality.entityType === "equipe" || modality.entityType === "mista";
      if ((needsAthletes && !sportEntity.allowsAthletes) || (needsClubs && !sportEntity.allowsClubs)) {
        errors.push(`Modalidade ${modality.id}: entityType incompatível com o esporte.`);
      }
    }
  }

  const eventTypeIds = new Set();
  for (const eventType of eventTypes) {
    if (eventTypeIds.has(eventType.id)) {
      errors.push(`Tipo de evento duplicado: ${eventType.id}.`);
    }
    eventTypeIds.add(eventType.id);
    const modality = modalities.find((item) => item.id === eventType.modalityId);
    if (!modality) {
      errors.push(`Tipo de evento ${eventType.id} referencia modalidade inexistente: ${eventType.modalityId}.`);
    } else if (modality.sportId !== eventType.sportId) {
      errors.push(`Tipo de evento ${eventType.id} tem esporte diferente da sua modalidade.`);
    }
    if (!eventType.name?.trim()) {
      errors.push(`Tipo de evento ${eventType.id} sem nome.`);
    }
  }

  return errors;
}

export function catalogModalityById(modalityId) {
  return MODALITY_BY_ID.get(modalityId) ?? null;
}

// Tipo de entidade (atleta/equipe/mista) que disputa uma modalidade do catálogo.
// É o que o gerador usa para decidir se cria atletas, clubes ou ambos.
export function entityTypeForModality(modalityId) {
  const entityType = MODALITY_BY_ID.get(modalityId)?.entityType;
  return ENTITY_TYPES[entityType] ? entityType : DEFAULT_ENTITY_TYPE;
}

export function eventTypeById(eventTypeId) {
  return EVENT_TYPE_BY_ID.get(eventTypeId) ?? null;
}

export function catalogModalitiesForSport(sportId) {
  return CATALOG_MODALITIES
    .filter((modality) => modality.sportId === sportId)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export function eventTypesForModality(modalityId) {
  return [...(EVENT_TYPES_BY_MODALITY.get(modalityId) ?? [])]
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export function eventTypesForSport(sportId) {
  return [...(EVENT_TYPES_BY_SPORT.get(sportId) ?? [])]
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

// Esporte já coberto pelo catálogo de tipos de evento (ao menos um tipo). Os que
// ainda não estão (ex.: automobilismo, até a Feature 2) ficam isentos da
// exigência de tipo de evento.
export function sportHasEventTypes(sportId) {
  return (EVENT_TYPES_BY_SPORT.get(sportId)?.length ?? 0) > 0;
}

export function eventTypeLabel(eventTypeId) {
  return eventTypeById(eventTypeId)?.name ?? "Não informado";
}

// Mapa de compatibilidade: modalidade legada (js/sports.js) → par
// (modalidade, tipo de evento) do catálogo. Tênis e futebol são explícitos;
// as provas de atletismo seguem o padrão `event_athletics_<x>` ⇄
// `modality_athletics_<x>`, então são geradas a partir dos próprios tipos de
// evento (cobrindo todas as provas legadas com contrapartida no catálogo).
export const LEGACY_MODALITY_ALIASES = (() => {
  const aliases = {
    modality_tennis_mens_singles: {
      modalityId: "modality_tennis",
      eventTypeId: "event_tennis_singles",
    },
    modality_football_brasileirao: {
      modalityId: "modality_football",
      eventTypeId: "event_football_tournament",
    },
    modality_football_jleague: {
      modalityId: "modality_football",
      eventTypeId: "event_football_tournament",
    },
    // Automobilismo: as categorias legadas de monoposto viram tipos de evento da
    // modalidade Open Wheel (a estrutura F1/F2/F3/regional é preservada).
    modality_motorsport_formula1: {
      modalityId: "modality_motorsport_open_wheel",
      eventTypeId: "event_motorsport_formula1",
    },
    modality_motorsport_formula2: {
      modalityId: "modality_motorsport_open_wheel",
      eventTypeId: "event_motorsport_formula2",
    },
    modality_motorsport_formula3: {
      modalityId: "modality_motorsport_open_wheel",
      eventTypeId: "event_motorsport_formula3",
    },
    modality_motorsport_formula_regional: {
      modalityId: "modality_motorsport_open_wheel",
      eventTypeId: "event_motorsport_formula_regional_europe",
    },
    modality_motorsport_formula_regional_middle_east: {
      modalityId: "modality_motorsport_open_wheel",
      eventTypeId: "event_motorsport_formula_regional_middle_east",
    },
  };
  for (const eventType of EVENT_TYPES) {
    if (eventType.sportId !== "sport_athletics") continue;
    const legacyId = eventType.id.replace(/^event_athletics_/, "modality_athletics_");
    aliases[legacyId] = {
      modalityId: eventType.modalityId,
      eventTypeId: eventType.id,
    };
  }
  return aliases;
})();

// Resolve o par (modalidade, tipo de evento) do catálogo para uma competição,
// aceitando tanto o `eventTypeId` explícito (competições novas) quanto uma
// modalidade legada mapeável (competições e presets já existentes). `resolved`
// indica se um tipo de evento pôde ser determinado.
export function resolveCompetitionTaxonomy(competition = {}) {
  const sportId = competition.sportId ?? null;

  if (competition.eventTypeId) {
    const eventType = eventTypeById(competition.eventTypeId);
    if (eventType) {
      return {
        sportId: eventType.sportId,
        modalityId: eventType.modalityId,
        eventTypeId: eventType.id,
        resolved: true,
      };
    }
  }

  const alias = competition.modalityId ? LEGACY_MODALITY_ALIASES[competition.modalityId] : null;
  if (alias) {
    return {
      sportId,
      modalityId: alias.modalityId,
      eventTypeId: alias.eventTypeId,
      resolved: true,
    };
  }

  // Modalidade já do catálogo, mas sem tipo de evento informado.
  if (competition.modalityId && MODALITY_BY_ID.has(competition.modalityId)) {
    return {
      sportId,
      modalityId: competition.modalityId,
      eventTypeId: null,
      resolved: false,
    };
  }

  return { sportId, modalityId: competition.modalityId ?? null, eventTypeId: null, resolved: false };
}

// Garante que a competição está atrelada a esporte + modalidade + tipo de evento.
// Esportes ainda fora do catálogo (sem tipos de evento) ficam isentos. Retorna a
// lista de erros (vazia = válida).
export function validateCompetitionTaxonomy(competition = {}) {
  const errors = [];
  const sportId = competition.sportId;
  if (!sportId || !sportById(sportId)) return errors; // esporte é validado à parte
  if (!sportHasEventTypes(sportId)) return errors; // isento até entrar no catálogo

  const resolved = resolveCompetitionTaxonomy(competition);
  if (!resolved.eventTypeId) {
    errors.push("Vincule a competição a uma modalidade e a um tipo de evento válidos do esporte.");
    return errors;
  }

  const eventType = eventTypeById(resolved.eventTypeId);
  if (eventType.sportId !== sportId) {
    errors.push("O tipo de evento escolhido não pertence ao esporte selecionado.");
  }
  // Se a competição já usa uma modalidade do catálogo (não legada) junto com um
  // eventType explícito, os dois têm de ser coerentes.
  if (
    competition.eventTypeId
    && competition.modalityId
    && MODALITY_BY_ID.has(competition.modalityId)
    && eventType.modalityId !== competition.modalityId
  ) {
    errors.push("O tipo de evento escolhido não pertence à modalidade selecionada.");
  }

  return errors;
}
