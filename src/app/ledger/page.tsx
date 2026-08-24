'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react';
import AppShell from '@/components/AppShell';
import TransactionForm from '@/components/TransactionForm';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { selectClass, thClass, tdClass, trClass } from '@/lib/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatMoney, isInflowType, typeLabel } from '@/lib/format';
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
        <div>
          <h1 className="text-2xl font-bold text-ink">Ledger</h1>
          <p className="mt-0.5 text-sm text-slate-500">Every due, gift, and cost, in one place.</p>
        </div>
        {canEdit && (
          <Button
            onClick={() => {
              setEditing(null);
              setShowForm((v) => !v);
            }}
          >
            <Plus className="h-4 w-4" /> {showForm ? 'Close form' : 'Add transaction'}
          </Button>
        )}
      </div>

      {showForm && canEdit && (
        <Card className="mt-4 p-5">
          <TransactionForm
            events={events}
            onSaved={() => {
              setShowForm(false);
              load();
            }}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      )}

      {editing && canEdit && (
        <Card className="mt-4 p-5">
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
        </Card>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={`${selectClass} w-auto`}>
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
          className={`${selectClass} w-auto`}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold shadow-card">
          <Wallet className="h-4 w-4 text-slate-400" strokeWidth={2} />
          Total: <span className="tabular-nums text-ink">{formatMoney(total)}</span>
        </div>
      </div>

      <Card className="mt-4 overflow-hidden">
        {loading ? (
          <SkeletonTable rows={6} cols={7} />
        ) : transactions.length === 0 ? (
          <EmptyState title="No transactions match these filters" description="Try clearing a filter, or add the first entry." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/70">
                <tr>
                  <th className={thClass}>Date</th>
                  <th className={thClass}>Type</th>
                  <th className={thClass}>Category</th>
                  <th className={thClass}>Description</th>
                  <th className={thClass}>Event</th>
                  <th className={`${thClass} text-right`}>Amount</th>
                  <th className={thClass}>Recorded by</th>
                  {canEdit && <th className={thClass} />}
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className={trClass}>
                    <td className={`${tdClass} whitespace-nowrap text-slate-500`}>{formatDate(t.occurredAt)}</td>
                    <td className={tdClass}>
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isInflowType(t.type) ? 'bg-chart-blue' : 'bg-chart-orange'
                          }`}
                        />
                        {typeLabel(t.type)}
                      </span>
                    </td>
                    <td className={tdClass}>{t.category}</td>
                    <td className={`${tdClass} text-slate-500`}>{t.description ?? '-'}</td>
                    <td className={`${tdClass} text-slate-500`}>{t.event?.name ?? '-'}</td>
                    <td className={`${tdClass} text-right font-medium tabular-nums`}>{formatMoney(t.amount)}</td>
                    <td className={`${tdClass} text-slate-500`}>{t.recordedBy.name}</td>
                    {canEdit && (
                      <td className={`${tdClass} whitespace-nowrap`}>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setShowForm(false);
                              setEditing(t);
                            }}
                            title="Edit"
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink"
                          >
                            <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            title="Delete"
                            className="rounded-md p-1.5 text-slate-400 hover:bg-danger-bg hover:text-danger-text"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    )}
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
