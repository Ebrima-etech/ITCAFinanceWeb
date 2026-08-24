'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Scale, Upload } from 'lucide-react';
import AppShell from '@/components/AppShell';
import StatCard from '@/components/StatCard';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonCards, SkeletonTable } from '@/components/ui/Skeleton';
import { thClass, tdClass, trClass } from '@/lib/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatMoney, typeLabel } from '@/lib/format';
import type { Transaction } from '@/lib/types';

interface EventDetail {
  id: string;
  name: string;
  description: string | null;
  date: string;
  revenue: number;
  cost: number;
  result: number;
  transactions: Transaction[];
}

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'FINANCE_OFFICER';

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const data = await api.get<EventDetail>(`/events/${params.id}`);
    setEvent(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const csv = await file.text();
    try {
      const result = await api.post<{ rowsImported: number }>(`/events/${params.id}/import-revenue`, {
        csv,
      });
      setImportMessage(`Imported ${result.rowsImported} ticketing rows.`);
      load();
    } catch (err) {
      setImportMessage(err instanceof Error ? err.message : 'Import failed');
    } finally {
      e.target.value = '';
    }
  }

  if (loading || !event) {
    return (
      <AppShell>
        <div className="space-y-6">
          <SkeletonCards count={3} />
          <Card>
            <SkeletonTable rows={4} cols={5} />
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Events
      </Link>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">{formatDate(event.date)}</p>
          <h1 className="mt-0.5 text-2xl font-bold text-ink">{event.name}</h1>
          {event.description && <p className="mt-1 text-sm text-slate-500">{event.description}</p>}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Revenue" value={formatMoney(event.revenue)} tone="positive" icon={TrendingUp} />
        <StatCard label="Cost" value={formatMoney(event.cost)} tone="negative" icon={TrendingDown} />
        <StatCard
          label="Result"
          value={formatMoney(event.result)}
          tone={event.result >= 0 ? 'positive' : 'negative'}
          icon={Scale}
        />
      </div>

      {canEdit && (
        <Card className="mt-6 border-dashed p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink/5 text-ink">
              <Upload className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700">Import ticketing revenue (CSV)</p>
              <p className="mt-1 text-xs text-slate-500">
                Columns: description, amount, occurredAt (YYYY-MM-DD). First row may be a header.
              </p>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleImport}
                className="mt-3 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-ink/90"
              />
              {importMessage && <p className="mt-2 text-xs text-slate-600">{importMessage}</p>}
            </div>
          </div>
        </Card>
      )}

      <Card className="mt-6 overflow-hidden">
        <h2 className="border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-700">
          Linked transactions
        </h2>
        {event.transactions.length === 0 ? (
          <EmptyState title="No transactions linked to this event yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/70">
                <tr>
                  <th className={thClass}>Date</th>
                  <th className={thClass}>Type</th>
                  <th className={thClass}>Category</th>
                  <th className={thClass}>Description</th>
                  <th className={`${thClass} text-right`}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {event.transactions.map((t) => (
                  <tr key={t.id} className={trClass}>
                    <td className={`${tdClass} whitespace-nowrap text-slate-500`}>{formatDate(t.occurredAt)}</td>
                    <td className={tdClass}>{typeLabel(t.type)}</td>
                    <td className={tdClass}>{t.category}</td>
                    <td className={`${tdClass} text-slate-500`}>{t.description ?? '-'}</td>
                    <td className={`${tdClass} text-right font-medium tabular-nums`}>{formatMoney(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
