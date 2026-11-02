// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Gutschrift {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    gutschrift_pdf?: string;
    gutschriftsnummer?: string;
    gutschriftsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    aussteller_firma?: string;
    aussteller_strasse?: string;
    aussteller_hausnummer?: string;
    aussteller_plz?: string;
    aussteller_ort?: string;
    aussteller_ustid?: string;
    empfaenger_firma?: string;
    empfaenger_strasse?: string;
    empfaenger_hausnummer?: string;
    empfaenger_plz?: string;
    empfaenger_ort?: string;
    nettobetrag?: number;
    steuersatz?: number;
    bruttobetrag?: number;
    bemerkung?: string;
    zugferd_pdf?: string;
  };
}

export const APP_IDS = {
  GUTSCHRIFT: '6ae84ad6a5d0c4de1cb73deb',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {};

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'gutschrift': {
    'gutschrift_pdf': 'file',
    'gutschriftsnummer': 'string/text',
    'gutschriftsdatum': 'date/date',
    'aussteller_firma': 'string/text',
    'aussteller_strasse': 'string/text',
    'aussteller_hausnummer': 'string/text',
    'aussteller_plz': 'string/text',
    'aussteller_ort': 'string/text',
    'aussteller_ustid': 'string/text',
    'empfaenger_firma': 'string/text',
    'empfaenger_strasse': 'string/text',
    'empfaenger_hausnummer': 'string/text',
    'empfaenger_plz': 'string/text',
    'empfaenger_ort': 'string/text',
    'nettobetrag': 'number',
    'steuersatz': 'number',
    'bruttobetrag': 'number',
    'bemerkung': 'string/textarea',
    'zugferd_pdf': 'file',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateGutschrift = StripLookup<Gutschrift['fields']>;