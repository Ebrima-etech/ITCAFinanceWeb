'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
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
        <p className="text-sm text-slate-400">Loading...</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <p className="text-xs font-semibold uppercase tracking-wide text-gold">{formatDate(event.date)}</p>
      <h1 className="text-xl font-bold text-ink">{event.name}</h1>
      {event.description && <p className="mt-1 text-sm text-slate-500">{event.description}</p>}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Revenue</p>
          <p className="mt-2 text-xl font-bold text-emerald-600">{formatMoney(event.revenue)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Cost</p>
          <p className="mt-2 text-xl font-bold text-red-600">{formatMoney(event.cost)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Result</p>
          <p className={`mt-2 text-xl font-bold ${event.result >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatMoney(event.result)}
          </p>
        </div>
      </div>

      {canEdit && (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">Import ticketing revenue (CSV)</p>
          <p className="mt-1 text-xs text-slate-500">
            Columns: description, amount, occurredAt (YYYY-MM-DD). First row may be a header.
          </p>
          <input type="file" accept=".csv,text/csv" onChange={handleImport} className="mt-3 text-sm" />
          {importMessage && <p className="mt-2 text-xs text-slate-600">{importMessage}</p>}
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-700">
          Linked transactions
        </h2>
        {event.transactions.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-400">No transactions linked to this event yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-2">Date</th>
                <th className="px-5 py-2">Type</th>
                <th className="px-5 py-2">Category</th>
                <th className="px-5 py-2">Description</th>
                <th className="px-5 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {event.transactions.map((t) => (
                <tr key={t.id} className="border-t border-slate-100">
                  <td className="px-5 py-2 whitespace-nowrap">{formatDate(t.occurredAt)}</td>
                  <td className="px-5 py-2">{typeLabel(t.type)}</td>
                  <td className="px-5 py-2">{t.category}</td>
                  <td className="px-5 py-2 text-slate-500">{t.description ?? '-'}</td>
                  <td className="px-5 py-2 text-right font-medium">{formatMoney(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
