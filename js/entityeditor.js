// Editor in-game de clubes e atletas: lógica pura de validação e aplicação de
// edições em lote (nome e rating). A UII (js/app.js) monta a lista editável, e
// este módulo valida e devolve só as entidades alteradas para persistir.

export const MIN_RATING = 1;
export const MAX_RATING = 99;

// Valida um nome de entidade (atleta ou clube). Devolve a mensagem de erro ou null.
export function validateEntityName(name) {
  const trimmed = String(name ?? "").trim();
  if (!trimmed) return "Informe o nome.";
  if (trimmed.length > 60) return "O nome deve ter até 60 caracteres.";
  return null;
}

// Valida um rating (inteiro entre MIN_RATING e MAX_RATING). Devolve erro ou null.
export function validateEntityRating(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < MIN_RATING || number > MAX_RATING) {
    return `O rating deve ser um inteiro entre ${MIN_RATING} e ${MAX_RATING}.`;
  }
  return null;
}

// Aplica um lote de edições a uma coleção de entidades (atletas ou clubes). Cada
// edição é { id, name, rating }. Devolve { updated, errors }: `updated` traz só as
// entidades que realmente mudaram (com nome aparado, baseRating inteiro e
// updatedAt novo), e `errors` lista os problemas por id (nome ou rating inválido).
// Edições sem mudança de fato ou para ids inexistentes são ignoradas.
export function applyEntityEdits(entities = [], edits = [], { timestamp = new Date().toISOString() } = {}) {
  const byId = new Map(entities.map((entity) => [entity.id, entity]));
  const updated = [];
  const errors = [];

  for (const edit of edits) {
    const original = byId.get(edit?.id);
    if (!original) continue;

    const name = String(edit.name ?? original.name).trim();
    const rating = Math.round(Number(edit.rating));
    const nameError = validateEntityName(name);
    const ratingError = validateEntityRating(rating);
    if (nameError || ratingError) {
      errors.push({ id: edit.id, message: nameError ?? ratingError });
      continue;
    }

    if (name === original.name && rating === (Number(original.baseRating) || 0)) continue;
    updated.push({ ...original, name, baseRating: rating, updatedAt: timestamp });
  }

  return { updated, errors };
}
