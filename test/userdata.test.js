import test from "node:test";
import assert from "node:assert/strict";

import {
  USERDATA_KEY,
  loadUserData,
  saveUserData,
  mergeById,
  addUserRecords,
  userPresets,
} from "../js/userdata.js";

function fakeStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, value),
    removeItem: (key) => map.delete(key),
    _map: map,
  };
}

test("loadUserData devolve estrutura vazia sem dados", () => {
  const storage = fakeStorage();
  const data = loadUserData(storage);
  assert.deepEqual(data, { countries: [], sports: [], modalities: [], clubs: [], people: [], presets: [] });
});

test("saveUserData e loadUserData persistem o catálogo", () => {
  const storage = fakeStorage();
  saveUserData({ countries: [{ id: "country_por", name: "Portugal" }] }, storage);
  assert.match(storage.getItem(USERDATA_KEY), /Portugal/);
  assert.equal(loadUserData(storage).countries.length, 1);
});

test("mergeById não duplica e deixa o novo prevalecer", () => {
  const merged = mergeById(
    [{ id: "a", v: 1 }, { id: "b", v: 1 }],
    [{ id: "b", v: 2 }, { id: "c", v: 3 }],
  );
  assert.deepEqual(merged.map((x) => [x.id, x.v]), [["a", 1], ["b", 2], ["c", 3]]);
});

test("addUserRecords acrescenta a uma coleção do catálogo", () => {
  const storage = fakeStorage();
  addUserRecords("presets", [{ id: "user-x", name: "Preset X" }], storage);
  addUserRecords("presets", [{ id: "user-y", name: "Preset Y" }], storage);
  const presets = userPresets(storage);
  assert.deepEqual(presets.map((p) => p.id).sort(), ["user-x", "user-y"]);
  // Coleção desconhecida falha.
  assert.throws(() => addUserRecords("desconhecida", [{ id: "z" }], storage), /desconhecida/);
});

test("loadUserData tolera JSON corrompido", () => {
  const storage = fakeStorage();
  storage.setItem(USERDATA_KEY, "{ não é json");
  assert.deepEqual(loadUserData(storage).presets, []);
});
