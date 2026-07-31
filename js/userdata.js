// Camada "database" dos editores in-game: um catálogo persistente guardado em
// localStorage. Diferente do "save" (IndexedDB, que é apagado ao iniciar um novo
// jogo), este catálogo sobrevive a novos jogos e é ressemeado em cada partida —
// é o equivalente à "database" de um editor de jogo. Ao salvar na database, o
// editor também baixa o arquivo .js correspondente para versionar no repositório.
//
// Funções puras em relação ao objeto de armazenamento (recebe `storage` com a
// mesma interface de localStorage), para permitir testes sem navegador.

export const USERDATA_KEY = "simulador-userdata-v1";

const EMPTY = { countries: [], sports: [], modalities: [], clubs: [], people: [], presets: [] };

function resolveStorage(storage) {
  return storage ?? (typeof localStorage !== "undefined" ? localStorage : null);
}

export function loadUserData(storage) {
  const store = resolveStorage(storage);
  if (!store) return { ...EMPTY };
  try {
    const raw = store.getItem(USERDATA_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    return { ...EMPTY, ...parsed };
  } catch {
    return { ...EMPTY };
  }
}

export function saveUserData(data, storage) {
  const store = resolveStorage(storage);
  if (!store) return;
  store.setItem(USERDATA_KEY, JSON.stringify({ ...EMPTY, ...data }));
}

// Junta registros novos a uma lista existente sem duplicar por `id`; os novos
// prevalecem sobre os antigos de mesmo id.
export function mergeById(existing = [], incoming = []) {
  const byId = new Map(existing.map((item) => [item.id, item]));
  for (const item of incoming) {
    if (item && item.id) byId.set(item.id, item);
  }
  return [...byId.values()];
}

// Acrescenta registros a uma coleção do catálogo (countries, sports, ...).
export function addUserRecords(kind, records, storage) {
  if (!EMPTY[kind]) throw new Error(`Coleção desconhecida no catálogo: ${kind}`);
  const data = loadUserData(storage);
  data[kind] = mergeById(data[kind], Array.isArray(records) ? records : [records]);
  saveUserData(data, storage);
  return data;
}

export function userPresets(storage) {
  return loadUserData(storage).presets;
}
