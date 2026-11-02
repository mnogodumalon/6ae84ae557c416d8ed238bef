/**
 * useGutschriftErfassenFlow — the plumbing of the flow « Gutschrift erfassen », generated from the plan.
 *
 * Writes `gutschrift`: asks `gutschrift_pdf`, `gutschriftsnummer`, `gutschriftsdatum`, `aussteller_firma`, `aussteller_strasse`, `aussteller_hausnummer`, `aussteller_plz`, `aussteller_ort`, `aussteller_ustid`, `empfaenger_firma`, `empfaenger_strasse`, `empfaenger_hausnummer`, `empfaenger_plz`, `empfaenger_ort`, `nettobetrag`, `steuersatz`, `bruttobetrag`, `bemerkung`.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 2)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useGutschriftErfassenFlow({
 *     steps: { gutschrift_pdf: 1, gutschriftsnummer: 1, gutschriftsdatum: 1, aussteller_firma: 1, aussteller_strasse: 1, aussteller_hausnummer: 1, aussteller_plz: 1, aussteller_ort: 1, aussteller_ustid: 1, empfaenger_firma: 1, empfaenger_strasse: 1, empfaenger_hausnummer: 1, empfaenger_plz: 1, empfaenger_ort: 1, nettobetrag: 1, steuersatz: 1, bruttobetrag: 1, bemerkung: 1 },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     <Bound form={flow.forms.gutschrift} name="gutschrift_pdf" />
 *     <Bound form={flow.forms.gutschrift} name="gutschriftsnummer" />
 *     <Bound form={flow.forms.gutschrift} name="gutschriftsdatum" />
 *     <Bound form={flow.forms.gutschrift} name="aussteller_firma" />
 *     <Bound form={flow.forms.gutschrift} name="aussteller_strasse" />
 *     <Bound form={flow.forms.gutschrift} name="aussteller_hausnummer" />
 *     <Bound form={flow.forms.gutschrift} name="aussteller_plz" />
 *     <Bound form={flow.forms.gutschrift} name="aussteller_ort" />
 *     <Bound form={flow.forms.gutschrift} name="aussteller_ustid" />
 *     <Bound form={flow.forms.gutschrift} name="empfaenger_firma" />
 *     <Bound form={flow.forms.gutschrift} name="empfaenger_strasse" />
 *     <Bound form={flow.forms.gutschrift} name="empfaenger_hausnummer" />
 *     <Bound form={flow.forms.gutschrift} name="empfaenger_plz" />
 *     <Bound form={flow.forms.gutschrift} name="empfaenger_ort" />
 *     <Bound form={flow.forms.gutschrift} name="nettobetrag" />
 *     <Bound form={flow.forms.gutschrift} name="steuersatz" />
 *     <Bound form={flow.forms.gutschrift} name="bruttobetrag" />
 *     <Bound form={flow.forms.gutschrift} name="bemerkung" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} />}
 *     {flow.submit.result && <SuccessStep result={flow.submit.result} forms={flow.formList} submit={flow.submit} />}
 *   </IntentWizardShell>
 */
import {
  useStepForm, useJourneySubmit, useRecordSearch,
  fieldText, fieldLookup, fieldLookups, fieldNumber, fieldDate, fieldRef,
  todayIso, nowIso, isEmptyValue, policyFixedValue, withPickPolicy, usePolicyVersion,
  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
export type GutschriftErfassenFieldKey = 'aussteller_firma' | 'aussteller_hausnummer' | 'aussteller_ort' | 'aussteller_plz' | 'aussteller_strasse' | 'aussteller_ustid' | 'bemerkung' | 'bruttobetrag' | 'empfaenger_firma' | 'empfaenger_hausnummer' | 'empfaenger_ort' | 'empfaenger_plz' | 'empfaenger_strasse' | 'gutschrift_pdf' | 'gutschriftsdatum' | 'gutschriftsnummer' | 'nettobetrag' | 'steuersatz';

export interface GutschriftErfassenForms {
  gutschrift: StepForm<'gutschrift'>;
}

// Alias so the option generics stay readable.
type Key = GutschriftErfassenFieldKey;

export interface GutschriftErfassenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
}

const DEFAULT_STEPS: Record<string, number> = {"aussteller_firma": 1, "aussteller_hausnummer": 1, "aussteller_ort": 1, "aussteller_plz": 1, "aussteller_strasse": 1, "aussteller_ustid": 1, "bemerkung": 1, "bruttobetrag": 1, "empfaenger_firma": 1, "empfaenger_hausnummer": 1, "empfaenger_ort": 1, "empfaenger_plz": 1, "empfaenger_strasse": 1, "gutschrift_pdf": 1, "gutschriftsdatum": 1, "gutschriftsnummer": 1, "nettobetrag": 1, "steuersatz": 1};
export const GUTSCHRIFTERFASSEN_REVIEW_STEP = 2;

function isoDaysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Returns T, not Partial<T>: a Record's index signature is already "maybe
// absent", and Partial<Record<string, string>> does not assign to the
// Record<string, string> useStepForm wants (tsc, live 23.09.2026 — eight
// errors, one per hook, caught only in the sandbox build).
function only<T extends Record<string, unknown>>(obj: T | undefined, keys: string[]): T | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out as T;
}

function hasValues(form: StepForm): boolean {
  return form.keys.some(k => !isEmptyValue(form.values[k]));
}

export function useGutschriftErfassenFlow(options: GutschriftErfassenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const gutschrift = useStepForm('gutschrift', {
    fields: ["gutschrift_pdf", "gutschriftsnummer", "gutschriftsdatum", "aussteller_firma", "aussteller_strasse", "aussteller_hausnummer", "aussteller_plz", "aussteller_ort", "aussteller_ustid", "empfaenger_firma", "empfaenger_strasse", "empfaenger_hausnummer", "empfaenger_plz", "empfaenger_ort", "nettobetrag", "steuersatz", "bruttobetrag", "bemerkung"],
    steps: only(steps, ["gutschrift_pdf", "gutschriftsnummer", "gutschriftsdatum", "aussteller_firma", "aussteller_strasse", "aussteller_hausnummer", "aussteller_plz", "aussteller_ort", "aussteller_ustid", "empfaenger_firma", "empfaenger_strasse", "empfaenger_hausnummer", "empfaenger_plz", "empfaenger_ort", "nettobetrag", "steuersatz", "bruttobetrag", "bemerkung"]) as Record<string, number>,
    // the plan builds a value from these — required here, whatever the app's base view says
    required: { aussteller_firma: true, aussteller_hausnummer: true, aussteller_ort: true, aussteller_plz: true, aussteller_strasse: true, aussteller_ustid: true, bruttobetrag: true, empfaenger_firma: true, empfaenger_hausnummer: true, empfaenger_ort: true, empfaenger_plz: true, empfaenger_strasse: true, gutschrift_pdf: true, gutschriftsdatum: true, gutschriftsnummer: true, nettobetrag: true, steuersatz: true },
    initial: only(options.initial as FormValues | undefined, ["gutschrift_pdf", "gutschriftsnummer", "gutschriftsdatum", "aussteller_firma", "aussteller_strasse", "aussteller_hausnummer", "aussteller_plz", "aussteller_ort", "aussteller_ustid", "empfaenger_firma", "empfaenger_strasse", "empfaenger_hausnummer", "empfaenger_plz", "empfaenger_ort", "nettobetrag", "steuersatz", "bruttobetrag", "bemerkung"]),
    messages: only(options.messages as Record<string, string> | undefined, ["gutschrift_pdf", "gutschriftsnummer", "gutschriftsdatum", "aussteller_firma", "aussteller_strasse", "aussteller_hausnummer", "aussteller_plz", "aussteller_ort", "aussteller_ustid", "empfaenger_firma", "empfaenger_strasse", "empfaenger_hausnummer", "empfaenger_plz", "empfaenger_ort", "nettobetrag", "steuersatz", "bruttobetrag", "bemerkung"]),
  });
  const forms: GutschriftErfassenForms = { gutschrift };
  const formList: StepForm[] = [gutschrift];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  const picks = {
  };

  const plan: PlanStep[] = [
    {
      key: 'gutschrift', entity: 'gutschrift', form: gutschrift, primary: true,
      // the planner's assumptions that first act here — shown once with „Passt“ / „ändern“
      notices: () => [{"assumed": "EN 16931 (Comfort)", "id": "zugferd-profil", "question": "Welches ZUGFeRD-Profil soll die PDF haben?"}, {"assumed": "von Hand erfasst", "id": "pdf-daten-auslesen", "question": "Sollen die Daten automatisch aus der PDF gelesen werden?"}],
    },
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'gutschrift-erfassen' });

  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: GutschriftErfassenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return {
      selectedId: (typeof owner.get(field) === 'string' ? (owner.get(field) as string) : null) || null,
      // `field as never` collapsed the conditional SetArgs<E, never> to never and
      // no argument was assignable any more (tsc, live 23.09.2026); widen `set`
      // itself instead — the label stays a required third argument.
      onSelect: (id: string) => (owner.set as (k: string, v: unknown, l?: string) => void)(field, id, search?.labelOf(id)),
    };
  };
  /** Props for a multi-record pick step: {...flow.picks.x.select} {...flow.pickMany('x')} */
  const pickMany = (field: GutschriftErfassenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)));
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); };

  return {
    slug: 'gutschrift-erfassen' as const,
    draftKey: 'gutschrift-erfassen' as const,
    entity: 'gutschrift' as const,
    form: gutschrift,
    forms, formList, picks, submit, steps,    reviewStep: GUTSCHRIFTERFASSEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type GutschriftErfassenFlow = ReturnType<typeof useGutschriftErfassenFlow>;
