// Editores in-game: criam dados novos (países, presets, ligas, atletas/clubes)
// reaproveitando exatamente as estruturas já existentes, sem alterar nenhuma
// mecânica. Cada editor tem um MODELO de arquivo .js (com diretrizes embutidas)
// que o jogador copia, preenche e recarrega. Aqui ficam os modelos, o parse dos
// arquivos .js, a validação e a normalização — tudo puro/testável (o parse de
// .js usa import dinâmico e roda no navegador).

import { CONTINENTS, hydratePersonGeography } from "./geography.js";
import { clubIdFor, createClub } from "./clubs.js";

const CONTINENT_IDS = new Set(CONTINENTS.map((continent) => continent.id));

export const EDITOR_TYPES = [
  {
    id: "country",
    label: "Países",
    description: "Adicione países novos seguindo as especificações da geografia.",
  },
  {
    id: "preset",
    label: "Presets (novos esportes)",
    description: "Crie presets completos, inclusive esportes e calendários novos.",
  },
  {
    id: "league",
    label: "Ligas / Campeonatos",
    description: "Adicione ligas ou campeonatos a esportes já existentes.",
  },
  {
    id: "roster",
    label: "Atletas / Clubes",
    description: "Adicione atletas ou clubes a esportes e modalidades existentes.",
  },
];

export function editorType(id) {
  return EDITOR_TYPES.find((type) => type.id === id) ?? null;
}

function slugify(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ---------------------------------------------------------------------------
// Modelos de arquivo .js (esqueleto + diretrizes). O botão "Copiar modelo" copia
// exatamente estas strings.
// ---------------------------------------------------------------------------

export const TEMPLATES = {
  country: `// Modelo de PAÍS — preencha e carregue no editor de Países.
//
// Diretrizes:
// - code: sigla de 3 letras MAIÚSCULAS (ex.: "POR").
// - name: nome do país em português.
// - continentId: um destes valores exatos:
//     continent_africa, continent_asia, continent_europe,
//     continent_north_america, continent_south_america, continent_oceania
// - Pode exportar um objeto único ou um array de países.
export default {
  code: "POR",
  name: "Portugal",
  continentId: "continent_europe",
};
`,
  roster: `// Modelo de ATLETAS / CLUBES — preencha e carregue no editor.
//
// Diretrizes:
// - target: "athlete" (atletas individuais) ou "club" (equipes).
// - sportId / modalityId: use IDs de esporte e modalidade JÁ EXISTENTES.
//     Ex.: sport_tennis / modality_tennis_mens_singles
//          sport_football / modality_football_brasileirao
// - countryCode: sigla de 3 letras de um país existente (ex.: "BRA").
// - baseRating: 1 a 99. momentum: -5 a 5. age: idade (atletas).
export default {
  target: "athlete",
  sportId: "sport_tennis",
  modalityId: "modality_tennis_mens_singles",
  entries: [
    { name: "Nome Sobrenome", countryCode: "BRA", age: 22, baseRating: 80, momentum: 1 },
  ],
};
`,
  league: `// Modelo de LIGA / CAMPEONATO — preencha e carregue no editor.
//
// Diretrizes:
// - Cria uma liga de pontos corridos (turno e returno) em um esporte já
//   existente do tipo equipe (ex.: sport_football).
// - modalities: registre a modalidade nova da liga (rankingModel "seasonal").
// - Em "leagues", clubs é uma lista [slug, nome, rating(1-99), momentum(-5..5)].
// - countryId/continentId/countryCode devem existir na geografia.
export default {
  modalities: [
    { id: "modality_football_myleague", sportId: "sport_football", name: "Minha Liga", rankingModel: "seasonal" },
  ],
  preset: {
    id: "user-league-myleague-2026",
    kind: "league",
    name: "Minha Liga — 2026",
    description: "Liga criada no editor in-game.",
    sportId: "sport_football",
    sportName: "Futebol",
    leagues: [
      {
        slug: "myleague",
        modalityId: "modality_football_myleague",
        modalityName: "Minha Liga",
        competitionName: "Minha Liga 2026",
        seasonName: "Minha Liga",
        seasonId: "user-myleague",
        countryCode: "BRA",
        countryName: "Brasil",
        countryId: "country_bra",
        continentId: "continent_south_america",
        startDate: "2026-04-11",
        endDate: "2026-12-06",
        prestige: 70,
        clubs: [
          ["club-a", "Clube A", 78, 1],
          ["club-b", "Clube B", 75, 0],
        ],
      },
    ],
  },
};
`,
  preset: `// Modelo de PRESET (novo esporte + calendário) — preencha e carregue.
//
// Diretrizes:
// - sports: esportes novos. entityType: "atleta", "equipe" ou "mista".
//     rankingModel: "cumulative", "seasonal" ou "rolling".
// - modalities: modalidades novas, cada uma com sportId de um esporte acima.
// - preset: uma entrada de calendário. Este modelo usa o formato por RANKING
//     (como o tênis): atletas no pool + torneios preenchidos por ranking.
// - Datas no formato AAAA-MM-DD. baseRating 1-99, momentum -5..5.
export default {
  sports: [
    { id: "sport_mysport", name: "Meu Esporte", defaultScoringSystemId: "generic-proportional", rankingModel: "cumulative", entityType: "atleta" },
  ],
  modalities: [
    { id: "modality_mysport_main", sportId: "sport_mysport", name: "Principal", rankingModel: "cumulative" },
  ],
  preset: {
    id: "user-preset-mysport-2026",
    name: "Meu Esporte — 2026",
    description: "Preset criado no editor in-game.",
    sportId: "sport_mysport",
    modalityId: "modality_mysport_main",
    sportName: "Meu Esporte",
    modalityName: "Principal",
    scoringSystemId: "generic-proportional",
    competitionModel: "standalone",
    athletes: [
      {
        id: "person_mysport_1",
        name: "Atleta Um",
        driverName: "Atleta Um",
        countryCode: "BRA",
        continentId: "continent_south_america",
        gender: "M",
        age: 24,
        baseRating: 85,
        momentum: 1,
        sportId: "sport_mysport",
        modalityId: "modality_mysport_main",
        rosterType: "preset",
      },
    ],
    competitions: [
      { id: "etapa-1", name: "Etapa 1", startDate: "2026-03-01", endDate: "2026-03-03", city: "Cidade", category: "Padrão" },
      { id: "etapa-2", name: "Etapa 2", startDate: "2026-04-01", endDate: "2026-04-03", city: "Cidade", category: "Padrão" },
    ],
  },
};
`,
};

export function templateFor(typeId) {
  return TEMPLATES[typeId] ?? "";
}

// Import dinâmico de um arquivo .js colado/carregado. Roda no navegador.
export async function parseEditorModule(jsText) {
  const url = URL.createObjectURL(new Blob([jsText], { type: "text/javascript" }));
  try {
    const module = await import(url);
    return module.default ?? module.data ?? null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Serializa dados normalizados num módulo .js para versionar no repositório.
export function serializeModule(data, headerComment = "") {
  const header = headerComment ? `// ${headerComment}\n` : "";
  return `${header}export default ${JSON.stringify(data, null, 2)};\n`;
}

// ---------------------------------------------------------------------------
// Validação e normalização por tipo.
// ---------------------------------------------------------------------------

export function validateCountry(country) {
  const errors = [];
  if (!/^[A-Z]{3}$/.test(country?.code ?? "")) errors.push("O código do país deve ter 3 letras maiúsculas.");
  if (!country?.name?.trim()) errors.push("Informe o nome do país.");
  if (!CONTINENT_IDS.has(country?.continentId)) errors.push("continentId inválido (use um continente existente).");
  return errors;
}

export function normalizeCountry(country, timestamp = new Date().toISOString()) {
  return {
    id: `country_${country.code.toLocaleLowerCase()}`,
    code: country.code,
    name: country.name.trim(),
    continentId: country.continentId,
    worldId: "current",
    rosterType: "user",
    updatedAt: timestamp,
  };
}

export function validateRoster(data) {
  const errors = [];
  if (data?.target !== "athlete" && data?.target !== "club") {
    errors.push('target deve ser "athlete" ou "club".');
  }
  if (!data?.sportId) errors.push("Informe o sportId (esporte existente).");
  if (!data?.modalityId) errors.push("Informe o modalityId (modalidade existente).");
  if (!Array.isArray(data?.entries) || !data.entries.length) {
    errors.push("Inclua ao menos um atleta/clube em entries.");
  } else {
    data.entries.forEach((entry, index) => {
      if (!entry?.name?.trim()) errors.push(`entries[${index}]: informe o nome.`);
      const rating = Number(entry?.baseRating);
      if (!Number.isFinite(rating) || rating < 1 || rating > 99) {
        errors.push(`entries[${index}]: baseRating deve ser 1-99.`);
      }
    });
  }
  return errors;
}

// Converte a lista do editor em registros de PEOPLE ou CLUBS já normalizados.
export function normalizeRoster(data, timestamp = new Date().toISOString()) {
  const modalitySlug = slugify(data.modalityId.replace(/^modality_/, ""));
  const people = [];
  const clubs = [];

  data.entries.forEach((entry, index) => {
    const slug = slugify(entry.name) || String(index + 1);
    const baseRating = Math.round(Number(entry.baseRating));
    const momentum = Math.round(Number(entry.momentum) || 0);
    if (data.target === "club") {
      clubs.push(createClub({
        id: clubIdFor(data.sportId, `${modalitySlug}_${slug}`),
        name: entry.name.trim(),
        sportId: data.sportId,
        modalityId: data.modalityId,
        baseRating,
        momentum,
        countryCode: entry.countryCode ?? null,
        rosterType: "user",
        createdAt: timestamp,
        updatedAt: timestamp,
      }));
    } else {
      people.push(hydratePersonGeography({
        id: `person_user_${slugify(data.sportId.replace(/^sport_/, ""))}_${modalitySlug}_${slug}`,
        name: entry.name.trim(),
        driverName: entry.name.trim(),
        countryCode: entry.countryCode ?? null,
        gender: entry.gender ?? "M",
        age: Number(entry.age) || 24,
        baseRating,
        momentum,
        rivals: [],
        sportId: data.sportId,
        modalityId: data.modalityId,
        rosterType: "user",
        createdAt: timestamp,
        updatedAt: timestamp,
      }));
    }
  });

  return { people, clubs };
}

// Valida um "pacote" de preset/liga: esportes/modalidades novos + o preset.
export function validatePresetPackage(data, buildPresetCompetitions) {
  const errors = [];
  const preset = data?.preset;
  if (!preset?.id) errors.push("O preset precisa de um id.");
  if (!preset?.name?.trim()) errors.push("O preset precisa de um nome.");
  (data?.sports ?? []).forEach((sport, index) => {
    if (!sport?.id || !sport?.name) errors.push(`sports[${index}]: id e name são obrigatórios.`);
    if (sport?.entityType && !["atleta", "equipe", "mista"].includes(sport.entityType)) {
      errors.push(`sports[${index}]: entityType inválido.`);
    }
  });
  (data?.modalities ?? []).forEach((modality, index) => {
    if (!modality?.id || !modality?.sportId || !modality?.name) {
      errors.push(`modalities[${index}]: id, sportId e name são obrigatórios.`);
    }
  });
  if (preset?.id && typeof buildPresetCompetitions === "function") {
    try {
      const competitions = buildPresetCompetitions(preset);
      if (!competitions.length) errors.push("O preset não gerou nenhuma competição.");
    } catch (error) {
      errors.push(`Falha ao montar o preset: ${error.message}`);
    }
  }
  return errors;
}
