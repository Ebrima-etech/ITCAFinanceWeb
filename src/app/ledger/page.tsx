'use client';

import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import TransactionForm from '@/components/TransactionForm';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatMoney, typeLabel } from '@/lib/format';
import type { EventSummary, Transaction, TransactionType } from '@/lib/types';

const TYPES: TransactionType[] = [
  'DUE',
  'EVENT_REVENUE',
  'EVENT_COST',
  'GIFT',
  'OTHER_INCOME',
  'OTHER_EXPENSE',
];

export default function LedgerPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'FINANCE_OFFICER';

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (typeFilter) params.set('type', typeFilter);
    if (categoryFilter) params.set('category', categoryFilter);
    return params.toString();
  }, [typeFilter, categoryFilter]);

  async function load() {
    setLoading(true);
    const [ledger, eventList] = await Promise.all([
      api.get<{ transactions: Transaction[]; total: number }>(`/transactions?${query}`),
      api.get<EventSummary[]>('/events'),
    ]);
    setTransactions(ledger.transactions);
    setTotal(Number(ledger.total));
    setEvents(eventList);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this transaction? It will be flagged, not erased.')) return;
    await api.delete(`/transactions/${id}`);
    load();
  }

  const categories = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.category))).sort(),
    [transactions],
  );

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink">Ledger</h1>
        {canEdit && (
          <button
            onClick={() => {
              setEditing(null);
              setShowForm((v) => !v);
            }}
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90"
          >
            {showForm ? 'Close form' : '+ Add transaction'}
          </button>
        )}
      </div>

      {showForm && canEdit && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <TransactionForm
            events={events}
            onSaved={() => {
              setShowForm(false);
              load();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editing && canEdit && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-slate-700">Editing transaction</p>
          <TransactionForm
            events={events}
            initial={editing}
            onSaved={() => {
              setEditing(null);
              load();
            }}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {typeLabel(t)}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="ml-auto rounded-md bg-white px-4 py-1.5 text-sm font-semibold shadow-sm">
          Total: <span className="text-ink">{formatMoney(total)}</span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="px-5 py-6 text-sm text-slate-400">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-400">No transactions match these filters.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-2">Date</th>
                <th className="px-5 py-2">Type</th>
                <th className="px-5 py-2">Category</th>
                <th className="px-5 py-2">Description</th>
                <th className="px-5 py-2">Event</th>
                <th className="px-5 py-2 text-right">Amount</th>
                <th className="px-5 py-2">Recorded by</th>
                {canEdit && <th className="px-5 py-2" />}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-t border-slate-100">
                  <td className="px-5 py-2 whitespace-nowrap">{formatDate(t.occurredAt)}</td>
                  <td className="px-5 py-2">{typeLabel(t.type)}</td>
                  <td className="px-5 py-2">{t.category}</td>
                  <td className="px-5 py-2 text-slate-500">{t.description ?? '-'}</td>
                  <td className="px-5 py-2 text-slate-500">{t.event?.name ?? '-'}</td>
                  <td className="px-5 py-2 text-right font-medium">{formatMoney(t.amount)}</td>
                  <td className="px-5 py-2 text-slate-500">{t.recordedBy.name}</td>
                  {canEdit && (
                    <td className="px-5 py-2 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setShowForm(false);
                          setEditing(t);
                        }}
                        className="text-xs font-semibold text-ink hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="ml-3 text-xs font-semibold text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
