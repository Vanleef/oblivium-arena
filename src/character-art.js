import { characterArtRegistry } from "./character-art-registry.js";

// Attach only files that have been created and entered in the registry.
// Character IDs and all combat fields are preserved.
export function attachCharacterArt(character) {
  const row = characterArtRegistry[character.id];
  if (!row) return character;
  const abilities = character.abilities.map((ability, index) => {
    const art = row.abilityIndices?.[index] || row.abilities?.[ability.id] || ability.art;
    const forms = ability.forms?.map(form => ({
      ...form,
      art: row.formIndices?.[index]?.[form.formKey] || row.forms?.[ability.id]?.[form.formKey]
        || ((!form.art || form.art === ability.art) ? art : form.art)
    }));
    return { ...ability, ...(art ? { art } : {}), ...(forms ? { forms } : {}) };
  });
  return {
    ...character,
    art: {
      ...(character.art || {}),
      ...(row.portrait ? { portrait: row.portrait } : {}),
      ...(row.passive ? { passive: row.passive } : {})
    },
    passive: { ...character.passive, ...(row.passive ? { art: row.passive } : {}) },
    abilities,
    bodyForms: (character.bodyForms || []).map(form => ({
      ...form,
      ...(row.bodyForms?.[form.key] ? { portrait: row.bodyForms[form.key] } : {})
    }))
  };
}

