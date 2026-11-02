// Auto-generated. Per-entity form-enhancements config for "Gutschrift".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: [{"row": ["gutschriftsnummer", "gutschriftsdatum"], "cols": "2fr 1fr"}, "aussteller_firma", {"row": ["aussteller_strasse", "aussteller_hausnummer"], "cols": "3fr 1fr"}, {"row": ["aussteller_plz", "aussteller_ort"], "cols": "1fr 2fr"}, "aussteller_ustid", "empfaenger_firma", {"row": ["empfaenger_strasse", "empfaenger_hausnummer"], "cols": "3fr 1fr"}, {"row": ["empfaenger_plz", "empfaenger_ort"], "cols": "1fr 2fr"}, {"row": ["nettobetrag", "steuersatz"], "cols": "1fr 1fr"}, "bruttobetrag", "bemerkung"],
  defaults: {
    'gutschriftsdatum': { kind: 'today' },
    'steuersatz': { kind: 'literal', value: 19 },
  },
  computed: {
    'bruttobetrag': { op: 'mul', left: { kind: 'field', key: 'nettobetrag' }, right: { op: 'add', left: { kind: 'literal', value: 1 }, right: { op: 'div', left: { kind: 'field', key: 'steuersatz' }, right: { kind: 'literal', value: 100 } } } },
  },
  numberFields: {
    'nettobetrag': { allowNegative: true },
    'steuersatz': { max: 30 },
    'bruttobetrag': { allowNegative: true },
  },
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
