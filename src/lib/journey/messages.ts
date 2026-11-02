/**
 * Required-field messages — WRITTEN BY THE BUILD AGENT, never by a heuristic.
 *
 * The layer knows two things about an empty required field: that it is
 * required and what its label is. Out of that it can only say „„Anreise" ist
 * ein Pflichtfeld". What the person should do instead („Bitte einen Gast
 * auswählen.") is meaning, and meaning is the agent's: the Phase-2 orchestrator
 * writes one short instruction per required field — what is needed, not why — to
 * `.intents-staging/messages.json`, the integration step validates it against
 * the app metadata and renders it into the block below. Scaffold updates keep
 * the block. Do not edit outside the markers.
 *
 * Every door reads this and nothing else: `useStepForm` (flows and public
 * pages), the generated {Entity}Dialog and the public form's server-error line.
 * A field without a sentence falls back to the label sentence — never to a
 * bare „Dieses Feld ist erforderlich".
 *
 * Required fields per entity (from the base view):
 *   - gutschrift: gutschriftsnummer (Gutschriftsnummer), gutschriftsdatum (Gutschriftsdatum), aussteller_firma (Firma des Ausstellers), empfaenger_firma (Firma des Empfängers), nettobetrag (Nettobetrag in Euro), bruttobetrag (Bruttobetrag in Euro)
 */
import { t, tx } from '@/i18n';
import { labelOf, type EntityKey } from './rules';

/** The writable fields of each entity — the keys a message may address (generated). */
export interface MessageFields {
  "gutschrift": "gutschriftsnummer" | "gutschriftsdatum" | "aussteller_firma" | "aussteller_strasse" | "aussteller_hausnummer" | "aussteller_plz" | "aussteller_ort" | "aussteller_ustid" | "empfaenger_firma" | "empfaenger_strasse" | "empfaenger_hausnummer" | "empfaenger_plz" | "empfaenger_ort" | "nettobetrag" | "steuersatz" | "bruttobetrag" | "bemerkung";
}
export type MessageFieldKey<E extends EntityKey> = E extends keyof MessageFields ? MessageFields[E] : never;

export const REQUIRED_MESSAGES: { [E in EntityKey]?: Partial<Record<MessageFieldKey<E>, string>> } = {
  // <custom:messages>
  gutschrift: { gutschriftsnummer: "Bitte die Gutschriftsnummer eingeben.", gutschriftsdatum: "Bitte das Gutschriftsdatum wählen.", aussteller_firma: "Bitte die Firma des Ausstellers eingeben.", aussteller_strasse: "Bitte die Straße des Ausstellers eingeben.", aussteller_hausnummer: "Bitte die Hausnummer des Ausstellers eingeben.", aussteller_plz: "Bitte die Postleitzahl des Ausstellers eingeben.", aussteller_ort: "Bitte den Ort des Ausstellers eingeben.", aussteller_ustid: "Bitte die USt-ID des Ausstellers eingeben.", empfaenger_firma: "Bitte die Firma des Empfängers eingeben.", empfaenger_strasse: "Bitte die Straße des Empfängers eingeben.", empfaenger_hausnummer: "Bitte die Hausnummer des Empfängers eingeben.", empfaenger_plz: "Bitte die Postleitzahl des Empfängers eingeben.", empfaenger_ort: "Bitte den Ort des Empfängers eingeben.", nettobetrag: "Bitte den Nettobetrag eingeben.", steuersatz: "Bitte den Steuersatz eingeben.", bruttobetrag: "Bitte den Bruttobetrag eingeben." },
  // </custom:messages>
};

/** The sentence shown when `key` of `entity` is required and empty — the
 *  agent's own text (translated at runtime like every page string), else the
 *  label sentence. Call it while rendering, not at module scope. */
export function requiredMessage(entity: EntityKey, key: string): string {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  if (own && own.trim()) return tx(own);
  return t('v_required', { label: labelOf(entity, key) });
}

/** True when the agent wrote a sentence for the field. */
export function hasOwnMessage(entity: EntityKey, key: string): boolean {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  return Boolean(own && own.trim());
}
