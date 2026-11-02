/**
 * EntityCrud — pre-generated CRUD + overlay plumbing for the dashboard.
 * Compose it; NEVER re-roll dialog state, submit handlers, an overlay stack
 * or a RecordOverlayHost in the page — this file owns all of it.
 *
 * API at a glance:
 *   const data = useDashboardData();
 *   const crud = useEntityCrud(data, {
 *     // optional — the ONE semantic slot on the overlay: the record's next
 *     // workflow step. Return undefined for types without one.
 *     footer: (top) => top.type === 'gutschrift'
 *       ? { label: …, onClick: () => … }
 *       : undefined,
 *   });
 *
 *   `top.type` is the SAME camelCase key as `crud.<entity>` — one spelling
 *   per entity, everywhere in this API.
 *   …
 *   crud.gutschrift.openCreate({ …defaults })   // create dialog, prefilled — defaults are
 *                                       // shape-tolerant: bare lookup keys / record ids are fine
 *   crud.gutschrift.openEdit(record)            // edit dialog (recordId + defaults wired)
 *   crud.gutschrift.openDetail(record)          // record overlay — pass the RAW record,
 *                                       // enrichment is resolved inside
 *   crud.overlay                         // RecordOverlayStack<OverlayItem> for drills:
 *                                       // push / pop / replace / close
 *   crud.enriched.gutschrift              // the display-ready array for EVERY entity —
 *                                       // Enriched* where relations exist, the raw array
 *                                       // otherwise. Reuse these; never call enrich*()
 *                                       // in the page, and never guess which entity has
 *                                       // one: they all do.
 *   {crud.surfaces}                      // render ONCE at the end of the page JSX:
 *                                       // all entity dialogs + the overlay host
 *
 * Built in (do NOT re-implement): optimistic update + Rückgängig counter-write
 * on edit, fetchAll-on-error, edit-from-overlay, and per-entity overlay bodies
 * (RecordHeader + <{Entity}Details> with every relation reachable and the
 * contextual "+" prefilled; list-field back-references additionally get a
 * "choose existing" picker that links an EXISTING record — built in, do not
 * re-roll). Drag writes (onEventDrop/onCardMove) stay YOURS:
 * optimistic setter first, PATCH in background, undoToast with counter-write.
 *
 * Overlay content per entity (the host renders these — you never compose
 * Details blocks yourself):
 *   gutschrift: gutschrift_pdf, gutschriftsnummer, gutschriftsdatum, aussteller_firma, aussteller_strasse, aussteller_hausnummer, aussteller_plz, aussteller_ort, …
 */
import { useState, type ReactNode } from 'react';
import type { Gutschrift } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  useRecordOverlayStack, RecordOverlayHost, RecordHeader,
  type RecordOverlayStack,
} from '@/components/widgets/RecordView';
import { GutschriftDialog, type GutschriftDialogDefaults } from '@/components/dialogs/GutschriftDialog';
import { GutschriftDetails } from '@/components/details/GutschriftDetails';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { t, appLabel } from '@/i18n';
import { undoToast } from '@/lib/polish';
import { usePermissions } from '@/lib/permissions';
import { toast } from 'sonner';
import { formatDate } from '@/lib/formatters';

// The overlay union — one branch per entity, `record` typed the way the data
// flows: Enriched* where enrichment exists, the raw record type otherwise.
// The host resolves enrichment itself; pages pass raw records everywhere.
export type OverlayItem =
  | { type: 'gutschrift'; record: Gutschrift };

/** The useDashboardData() return — pass it in, never re-fetch inside. */
export type EntityCrudData = ReturnType<typeof useDashboardData>;

export interface EntityCrudOptions {
  /** Per-type overlay footer — the record's next workflow step. */
  footer?: (top: OverlayItem) => ReactNode | { label: ReactNode; onClick: () => void } | undefined;
  placement?: 'side' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface EntityCrudApi<TRecord, TDefaults> {
  /** Open the create dialog, optionally prefilled (shape-tolerant defaults). */
  openCreate: (defaults?: TDefaults) => void;
  /** Open the edit dialog for a record (recordId + defaults are wired). */
  openEdit: (record: TRecord) => void;
  /** Open the record overlay (raw record is fine — enrichment resolved inside). */
  openDetail: (record: TRecord) => void;
  /** May the signed-in user create/change records of this list? (the
   *  platform's rights — show a „+ Neu“ only when true; openCreate/openEdit
   *  refuse with a notice otherwise). */
  canWrite: boolean;
}

export interface EntityCrud {
  /** The overlay stack for drills: push / pop / replace / close. */
  overlay: RecordOverlayStack<OverlayItem>;
  /** Render ONCE at the end of the page JSX — all dialogs + the overlay host. */
  surfaces: ReactNode;
  gutschrift: EntityCrudApi<Gutschrift, GutschriftDialogDefaults>;
  /** The display-ready array per entity: Enriched* where an enrich function
   *  exists, the raw array otherwise. One key per entity so no page has to
   *  know which is which. Reuse these; never re-enrich in the page. */
  enriched: { gutschrift: Gutschrift[] };
}

export function useEntityCrud(data: EntityCrudData, options?: EntityCrudOptions): EntityCrud {
  const overlay = useRecordOverlayStack<OverlayItem>();
  // the platform's rights of the signed-in user (lib/permissions.ts) — unknown = allowed
  const perms = usePermissions();
  const refuse = () => { toast.error(t('perm_denied_title'), { description: t('perm_denied_desc') }); };
  const [gutschriftDialog, setGutschriftDialog] = useState<{ defaults?: GutschriftDialogDefaults; editing?: Gutschrift } | null>(null);

  function detailGutschrift(record: Gutschrift, push = false) {
    const item: OverlayItem = { type: 'gutschrift', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitGutschrift(fields: Gutschrift['fields']) {
    const editing = gutschriftDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setGutschrift(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateGutschriftEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('gutschrift')} — ${t('crud_updated')}`, async () => {
        data.setGutschrift(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateGutschriftEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createGutschriftEntry(fields);
      undoToast(`${appLabel('gutschrift')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  const surfaces = (
    <>
      <GutschriftDialog
        open={gutschriftDialog !== null}
        onClose={() => setGutschriftDialog(null)}
        onSubmit={submitGutschrift}
        defaultValues={gutschriftDialog?.defaults}
        recordId={gutschriftDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Gutschrift']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Gutschrift']}
      />
      <RecordOverlayHost
        overlay={overlay}
        placement={options?.placement}
        size={options?.size}
        footer={options?.footer}
        render={(top) => {
          if (top.type === 'gutschrift') {
            return (
              <>
                <RecordHeader title={top.record.fields.gutschriftsnummer ?? appLabel('gutschrift')} subtitle={top.record.fields.gutschriftsdatum ? formatDate(top.record.fields.gutschriftsdatum) : undefined} />
                <GutschriftDetails
                  record={top.record}
                />
              </>
            );
          }
          return null;
        }}
        canEdit={(top) => {
          if (top.type === 'gutschrift') return perms.canWrite('gutschrift');
          return true;
        }}
        onEdit={(top) => {
          overlay.close();
          if (top.type === 'gutschrift') setGutschriftDialog({ editing: top.record, defaults: top.record.fields });
        }}
      />
    </>
  );

  return {
    overlay,
    surfaces,
    gutschrift: {
      openCreate: (defaults?: GutschriftDialogDefaults) => (perms.canWrite('gutschrift') ? setGutschriftDialog({ defaults }) : refuse()),
      openEdit: (record: Gutschrift) => (perms.canWrite('gutschrift') ? setGutschriftDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Gutschrift) => detailGutschrift(record, false),
      canWrite: perms.canWrite('gutschrift'),
    },
    enriched: { gutschrift: data.gutschrift },
  };
}
