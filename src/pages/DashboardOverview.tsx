import { useMemo, useState } from 'react';
import { IconPlus, IconFileCheck, IconFileAlert, IconCoin, IconSearch, IconDownload } from '@tabler/icons-react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { useClock, gruss, namen } from '@/lib/polish';
import { tx, appLabel } from '@/i18n';
import { DashboardGrid } from '@/components/DashboardGrid';
import { StatCard, StatCardRow } from '@/components/StatCard';
import { WorkList } from '@/components/WorkList';
import { HeroBanner } from '@/components/HeroBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Gutschrift } from '@/types/app';

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const { gutschrift } = data;
  const crud = useEntityCrud(data);
  const clock = useClock();
  const [filter, setFilter] = useState<'all' | 'open'>('all');
  const [query, setQuery] = useState('');

  const sorted = useMemo(
    () => [...gutschrift].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')),
    [gutschrift],
  );
  const open = useMemo(() => sorted.filter(g => !g.fields.zugferd_pdf), [sorted]);
  const sumBrutto = useMemo(
    () => gutschrift.reduce((s, g) => s + (g.fields.bruttobetrag ?? 0), 0),
    [gutschrift],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter(g => {
      if (filter === 'open' && g.fields.zugferd_pdf) return false;
      if (!q) return true;
      const f = g.fields;
      return [f.gutschriftsnummer, f.aussteller_firma, f.empfaenger_firma, f.bemerkung]
        .some(v => (v ?? '').toLowerCase().includes(q));
    });
  }, [sorted, filter, query]);

  const label = (g: Gutschrift) => g.fields.gutschriftsnummer || tx('Ohne Nummer');
  const issuer = (g: Gutschrift) => g.fields.aussteller_firma || tx('Aussteller unbekannt');

  const openCreate = () => crud.gutschrift.openCreate({});

  const context = gutschrift.length === 0
    ? tx('Lade deine erste Gutschrift als PDF hoch.')
    : open.length > 0
      ? tx`${namen(open.map(g => label(g)))} wartet noch auf die ZUGFeRD-PDF.`
      : tx`Alle Gutschriften sind verarbeitet — zuletzt ${label(sorted[0])} von ${issuer(sorted[0])}.`;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{gruss(clock)}</h1>
          <p className="text-sm text-muted-foreground">{context}</p>
        </div>
        {crud.gutschrift.canWrite && (
          <Button onClick={openCreate}>
            <IconPlus size={16} className="shrink-0" />
            {tx('Gutschrift hochladen')}
          </Button>
        )}
      </div>

      <DashboardGrid
        variant="split"
        hero={gutschrift.length === 0 && (
          <HeroBanner
            icon={<IconFileCheck size={48} />}
            action={{ label: tx('Erste Gutschrift hochladen'), onClick: openCreate }}
          >
            {tx('Noch keine Gutschrift erfasst — lade ein PDF hoch und erhalte daraus eine ZUGFeRD-PDF.')}
          </HeroBanner>
        )}
        kpis={gutschrift.length > 0 && (
          <StatCardRow>
            <StatCard
              title={tx('Ohne ZUGFeRD-PDF')}
              value={open.length}
              description={open.length > 0 ? tx('Noch nicht verarbeitet') : tx('Alles verarbeitet')}
              icon={<IconFileAlert size={18} className="text-muted-foreground" />}
              tone={open.length > 0 ? 'warning' : 'default'}
              onClick={() => setFilter(f => (f === 'open' ? 'all' : 'open'))}
              active={filter === 'open'}
            />
            <StatCard
              title={tx('Summe Bruttobeträge')}
              value={formatCurrency(sumBrutto)}
              description={tx`aus ${gutschrift.length} Gutschriften`}
              icon={<IconCoin size={18} className="text-muted-foreground" />}
            />
          </StatCardRow>
        )}
        aside={gutschrift.length > 0 && (
          <WorkList
            title={tx('Ohne ZUGFeRD-PDF')}
            items={open.map(g => ({
              id: g.record_id,
              title: label(g),
              secondLine: (
                <>
                  <span className="font-medium text-amber-600">{tx('Offen')}</span>
                  <span className="text-muted-foreground"> · {issuer(g)}</span>
                </>
              ),
              action: crud.gutschrift.canWrite
                ? { label: tx('ZUGFeRD ergänzen'), onClick: () => crud.gutschrift.openEdit(g) }
                : undefined,
            }))}
            onItemClick={id => {
              const rec = gutschrift.find(g => g.record_id === id);
              if (rec) crud.gutschrift.openDetail(rec);
            }}
            empty={{ text: tx('Alle Gutschriften haben eine ZUGFeRD-PDF.') }}
          />
        )}
        primary={
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
              <h2 className="font-semibold">
                {filter === 'open' ? tx('Gutschriften ohne ZUGFeRD-PDF') : tx('Zuletzt hochgeladene Gutschriften')}
              </h2>
              <div className="relative w-full sm:w-64">
                <IconSearch size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={tx('Nummer, Firma suchen …')}
                  className="pl-8"
                />
              </div>
            </div>
            {visible.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">
                {tx('Keine passende Gutschrift gefunden.')}
              </p>
            ) : (
              <ul className="divide-y">
                {visible.map(g => (
                  <li key={g.record_id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => crud.gutschrift.openDetail(g)}
                      onKeyDown={e => { if (e.key === 'Enter') crud.gutschrift.openDetail(g); }}
                      className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-4 hover:bg-muted/50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{label(g)}</div>
                        <div className="truncate text-sm text-muted-foreground">
                          {issuer(g)} · {g.fields.gutschriftsdatum ? formatDate(g.fields.gutschriftsdatum) : '—'}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-sm font-medium tabular-nums">
                          {g.fields.bruttobetrag != null ? formatCurrency(g.fields.bruttobetrag) : '—'}
                        </span>
                        {g.fields.zugferd_pdf ? (
                          <a
                            href={g.fields.zugferd_pdf}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:underline"
                          >
                            <IconDownload size={14} className="shrink-0" />
                            {tx('ZUGFeRD-PDF')}
                          </a>
                        ) : (
                          <span className="text-sm font-medium text-amber-600">{tx('Ohne ZUGFeRD')}</span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t px-4 py-2 text-xs text-muted-foreground">
              {appLabel('gutschrift')}: {visible.length}
            </div>
          </div>
        }
      />
      {crud.surfaces}
    </div>
  );
}
