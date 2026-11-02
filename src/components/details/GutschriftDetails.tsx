import type { Gutschrift } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';
import { MediaThumbnail } from '@/components/widgets/MediaViewer';

export interface GutschriftDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Gutschrift;
}

export function GutschriftDetails({
  record,
}: GutschriftDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('gutschrift', 'gutschrift_pdf')} className="md:col-span-2">
          {record.fields.gutschrift_pdf ? (
            <MediaThumbnail src={record.fields.gutschrift_pdf as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
        <RecordField label={fieldLabel('gutschrift', 'gutschriftsnummer')} value={record.fields.gutschriftsnummer} format="text" />
        <RecordField label={fieldLabel('gutschrift', 'gutschriftsdatum')} value={record.fields.gutschriftsdatum} format="date" />
        <RecordField label={fieldLabel('gutschrift', 'aussteller_firma')} value={record.fields.aussteller_firma} format="text" />
        <RecordField label={fieldLabel('gutschrift', 'aussteller_strasse')} value={record.fields.aussteller_strasse} format="text" />
        <RecordField label={fieldLabel('gutschrift', 'aussteller_hausnummer')} value={record.fields.aussteller_hausnummer} format="text" />
        <RecordField label={fieldLabel('gutschrift', 'aussteller_plz')} value={record.fields.aussteller_plz} format="text" />
        <RecordField label={fieldLabel('gutschrift', 'aussteller_ort')} value={record.fields.aussteller_ort} format="text" />
        <RecordField label={fieldLabel('gutschrift', 'aussteller_ustid')} value={record.fields.aussteller_ustid} format="text" />
        <RecordField label={fieldLabel('gutschrift', 'empfaenger_firma')} value={record.fields.empfaenger_firma} format="text" />
        <RecordField label={fieldLabel('gutschrift', 'empfaenger_strasse')} value={record.fields.empfaenger_strasse} format="text" />
        <RecordField label={fieldLabel('gutschrift', 'empfaenger_hausnummer')} value={record.fields.empfaenger_hausnummer} format="text" />
        <RecordField label={fieldLabel('gutschrift', 'empfaenger_plz')} value={record.fields.empfaenger_plz} format="text" />
        <RecordField label={fieldLabel('gutschrift', 'empfaenger_ort')} value={record.fields.empfaenger_ort} format="text" />
        <RecordField label={fieldLabel('gutschrift', 'nettobetrag')} value={record.fields.nettobetrag} format="text" />
        <RecordField label={fieldLabel('gutschrift', 'steuersatz')} value={record.fields.steuersatz} format="text" />
        <RecordField label={fieldLabel('gutschrift', 'bruttobetrag')} value={record.fields.bruttobetrag} format="text" />
        <RecordField label={fieldLabel('gutschrift', 'bemerkung')} value={record.fields.bemerkung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('gutschrift', 'zugferd_pdf')} className="md:col-span-2">
          {record.fields.zugferd_pdf ? (
            <MediaThumbnail src={record.fields.zugferd_pdf as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
      </RecordSection>

      <RecordAttachments appId={APP_IDS.GUTSCHRIFT} recordId={record.record_id} readOnly={!perms.canWrite('gutschrift')} />
    </>
  );
}
