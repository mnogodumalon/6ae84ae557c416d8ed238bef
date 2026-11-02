/**
 * Gutschrift erfassen — 5-Schritt-Wizard.
 * Steps: 1) Gutschrift-PDF hochladen → 2) Aussteller und Empfänger → 3) Nummer und Datum
 *        → 4) Beträge und Steuersatz → 5) Prüfen & speichern.
 * Reads: gutschrift (Prüfung auf doppelte Gutschriftsnummer). Writes: gutschrift (via useGutschriftErfassenFlow).
 * Die ZUGFeRD-PDF (zugferd_pdf) entsteht danach automatisch und wird hier nicht geschrieben.
 * Composes: IntentWizardShell, Bound, Field, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IconFileTypePdf } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { Bound } from '@/components/blocks/Bound';
import { Field } from '@/components/blocks/Field';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { useRecordCount, fieldText } from '@/lib/journey';
import { useGutschriftErfassenFlow } from '@/lib/journey/flows/GutschriftErfassen';
import { uploadFile } from '@/services/livingAppsService';
import { tx } from '@/i18n';

export default function GutschriftErfassenPage() {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const flow = useGutschriftErfassenFlow({
    steps: {
      gutschrift_pdf: 1,
      aussteller_firma: 2, aussteller_strasse: 2, aussteller_hausnummer: 2, aussteller_plz: 2, aussteller_ort: 2, aussteller_ustid: 2,
      empfaenger_firma: 2, empfaenger_strasse: 2, empfaenger_hausnummer: 2, empfaenger_plz: 2, empfaenger_ort: 2,
      gutschriftsnummer: 3, gutschriftsdatum: 3, bemerkung: 3,
      nettobetrag: 4, steuersatz: 4, bruttobetrag: 4,
    },
  });
  const f = flow.forms.gutschrift;

  // Check before the write: the Gutschriftsnummer must be new.
  const nummer = String(f.get('gutschriftsnummer') ?? '').trim();
  const safeNummer = nummer.replace(/[\\']/g, '');
  const duplicates = useRecordCount(flow.port, 'gutschrift', {
    filter: `r.v_gutschriftsnummer == '${safeNummer}'`,
    where: r => fieldText(r, 'gutschriftsnummer').trim() === nummer,
    enabled: nummer.length > 0,
  });

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadFile(file, file.name);
      f.set('gutschrift_pdf', url);
      setFileName(file.name);
    } catch {
      setUploadError(tx('Der Upload hat nicht geklappt. Bitte versuche es noch einmal.'));
    } finally {
      setUploading(false);
    }
  };

  const checkStep3 = () => {
    if (!flow.validateStep(3)) return false;
    if ((duplicates.count ?? 0) > 0) return tx('Diese Gutschriftsnummer gibt es schon.');
    return true;
  };

  return (
    <IntentWizardShell
      title={tx('Gutschrift erfassen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Lade die Gutschrift hoch und erfasse die Kopfdaten für die ZUGFeRD-Erzeugung.'),
        needs: [tx('Gutschrift als PDF'), tx('Adressen von Aussteller und Empfänger'), tx('Beträge und Steuersatz')],
      }}
    >
      <WizardStep label={tx('PDF')} heading={tx('Gutschrift-PDF hochladen')} description={tx('Wähle die PDF-Datei der Gutschrift aus.')}>
        <div className="space-y-4">
          <Field form={f} name="gutschrift_pdf">
            <Input
              id={f.fieldId('gutschrift_pdf')}
              type="file"
              accept="application/pdf,.pdf"
              disabled={uploading}
              onChange={e => onFile(e.target.files?.[0])}
            />
          </Field>
          {uploading && <p className="text-sm text-muted-foreground">{tx('Wird hochgeladen …')}</p>}
          {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
          {fileName && !uploading && (
            <p className="flex items-center gap-2 text-sm">
              <IconFileTypePdf size={18} className="shrink-0 text-muted-foreground" />
              <span className="min-w-0 truncate">{fileName}</span>
            </p>
          )}
          <StepNav
            hideBack
            nextDisabled={uploading}
            onNext={() => flow.validateStep(1)}
            nextStepLabel={tx('Aussteller und Empfänger')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Adressen')} heading={tx('Aussteller und Empfänger')} description={tx('Wer stellt die Gutschrift aus, und wer erhält sie?')}>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{tx('Aussteller')}</h3>
            <Bound form={f} name="aussteller_firma" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2"><Bound form={f} name="aussteller_strasse" /></div>
              <Bound form={f} name="aussteller_hausnummer" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Bound form={f} name="aussteller_plz" />
              <div className="sm:col-span-2"><Bound form={f} name="aussteller_ort" /></div>
            </div>
            <Bound form={f} name="aussteller_ustid" placeholder={tx('DE123456789')} />
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{tx('Empfänger')}</h3>
            <Bound form={f} name="empfaenger_firma" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2"><Bound form={f} name="empfaenger_strasse" /></div>
              <Bound form={f} name="empfaenger_hausnummer" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Bound form={f} name="empfaenger_plz" />
              <div className="sm:col-span-2"><Bound form={f} name="empfaenger_ort" /></div>
            </div>
          </div>
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => flow.validateStep(2)}
            nextStepLabel={tx('Nummer und Datum')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Nummer')} heading={tx('Gutschriftsnummer und Datum')} description={tx('Trage die Nummer und das Datum aus der Gutschrift ein.')}>
        <div className="space-y-4">
          <Bound form={f} name="gutschriftsnummer" />
          <Bound form={f} name="gutschriftsdatum" />
          <Bound form={f} name="bemerkung" rows={3} />
          <StepNav
            onBack={() => setStep(2)}
            onNext={checkStep3}
            nextStepLabel={tx('Beträge')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Beträge')} heading={tx('Beträge und Steuersatz')} description={tx('Netto, Steuersatz und Brutto in Euro bzw. Prozent.')}>
        <div className="space-y-4">
          <Bound form={f} name="nettobetrag" hint={tx('In Euro, z. B. 1000')} />
          <Bound form={f} name="steuersatz" hint={tx('In Prozent, z. B. 19')} />
          <Bound form={f} name="bruttobetrag" hint={tx('In Euro, z. B. 1190')} />
          <StepNav
            onBack={() => setStep(3)}
            onNext={() => flow.validateStep(4)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Die Gutschrift wird gespeichert. Die ZUGFeRD-PDF entsteht danach automatisch.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          whatHappensNext={tx('Die ZUGFeRD-PDF wird automatisch erzeugt und erscheint an der Gutschrift.')}
          next={[{ label: tx('Zum Dashboard'), href: '#/' }]}
        />
      )}
    </IntentWizardShell>
  );
}
